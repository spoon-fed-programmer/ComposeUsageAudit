import os
import re
import json
import csv
import datetime
import subprocess
import sys

# Force Windows console to UTF-8 code page (65001) to prevent corrupted Korean console output
if sys.platform.startswith('win'):
    os.system('chcp 65001 > nul')

def strip_comments(code: str) -> str:
    """
    Strips Kotlin single-line and multi-line comments from the source code,
    while leaving double-quoted and triple-quoted string literals intact.
    Preserves line numbers by keeping newline characters in place of comments.
    """
    pattern = re.compile(
        r'"{3}.*?"{3}|//.*?$|/\*.*?\*/|"(?:\\.|[^\\"])*"',
        re.DOTALL | re.MULTILINE
    )
    def replacer(match):
        s = match.group(0)
        if s.startswith('//') or s.startswith('/*'):
            return '\n' * s.count('\n')
        return s
    return pattern.sub(replacer, code)

def clean_imports_and_comments(code: str) -> str:
    """
    Strips comments and ignores lines starting with 'import '.
    Preserves line numbers by placing empty lines in place of import statements.
    """
    code = strip_comments(code)
    lines = []
    for line in code.splitlines():
        if line.strip().startswith('import '):
            lines.append("")
        else:
            lines.append(line)
    return '\n'.join(lines)

def extract_composables(file_content: str) -> list:
    """
    Extracts public/internal Composable function names from Kotlin source code.
    Excludes private functions and those annotated with @Preview.
    """
    content = strip_comments(file_content)
    
    # Matches @Composable followed by signature block (excluding curly braces) and fun name
    pattern = re.compile(
        r'@Composable\s+([^{}]*?)\bfun\s+([a-zA-Z0-9_]+)',
        re.DOTALL
    )
    
    composables = []
    for match in pattern.finditer(content):
        signature = match.group(1)
        func_name = match.group(2)
        
        # Avoid matching across block/class structures in case of syntax issues
        if (re.search(r'(?<!::)\bclass\b', signature) or
            re.search(r'\binterface\b', signature) or
            re.search(r'\bval\b', signature) or
            re.search(r'\bvar\b', signature) or
            '@Composable' in signature):
            continue
            
        # Exclude private functions
        if re.search(r'\bprivate\b', signature):
            continue
            
        # Exclude preview functions
        if re.search(r'\bPreview\b', signature):
            continue
            
        composables.append(func_name)
    return composables

def extract_package(file_content: str) -> str:
    """
    Extracts the package name from Kotlin source code.
    """
    content = strip_comments(file_content)
    match = re.search(r'\bpackage\s+([a-zA-Z0-9_.]+)', content)
    if match:
        return match.group(1).strip()
    return ""

def run_git_command(args: list, cwd: str) -> str:
    try:
        res = subprocess.run(args, cwd=cwd, capture_output=True, text=True, check=True)
        return res.stdout.strip()
    except FileNotFoundError:
        raise RuntimeError("git command not found. Please ensure git is installed and in your PATH.")
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Git command failed: {' '.join(args)}\nError: {e.stderr.strip() if e.stderr else e}")

def update_git_repository(project_path: str, branch: str):
    if not os.path.exists(os.path.join(project_path, ".git")):
        print(f"Warning: '{project_path}' does not appear to be a Git repository (no .git folder). Skipping git update.")
        return False
        
    try:
        print("Checking repository status...")
        status = run_git_command(["git", "status", "--porcelain"], project_path)
        is_clean = len(status) == 0
        
        if not is_clean:
            print("Local uncommitted changes detected. Running git stash...")
            run_git_command(["git", "stash", "save", "Temp stash before Compose Component Audit"], project_path)
            print("Local changes stashed successfully.")
            
        print(f"Checking out branch: {branch}...")
        run_git_command(["git", "checkout", branch], project_path)
        
        print("Running git pull --rebase...")
        run_git_command(["git", "pull", "--rebase"], project_path)
        print("Git repository updated successfully.")
        return True
    except Exception as e:
        print(f"Error during git update: {e}")
        print("Proceeding with static analysis on the local copy anyway.")
        return False

def load_config(config_path: str = "config.json") -> dict:
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Configuration file not found: {config_path}")
        
    with open(config_path, 'r', encoding='utf-8') as f:
        config = json.load(f)
        
    required = ["PROJECT_NAME", "PROJECT_PATH", "TARGET_PACKAGE_PATH"]
    for field in required:
        if field not in config:
            raise KeyError(f"Missing required configuration field: {field}")
            
    config.setdefault("TARGET_EXTENSIONS", ["kt", "kts"])
    config.setdefault("MAIN_BRANCH", "main")
    config.setdefault("OUTPUT_DIR", ".")
    
    # Normalize paths
    config["PROJECT_PATH"] = os.path.abspath(config["PROJECT_PATH"])
    config["TARGET_PACKAGE_PATH"] = os.path.abspath(config["TARGET_PACKAGE_PATH"])
    config["OUTPUT_DIR"] = os.path.abspath(config["OUTPUT_DIR"])
    
    return config

def get_git_branch(project_path: str) -> str:
    if not os.path.exists(os.path.join(project_path, ".git")):
        return None
    try:
        import subprocess
        result = subprocess.run(
            ["git", "branch", "--show-current"],
            cwd=project_path,
            capture_output=True,
            text=True,
            check=True
        )
        branch = result.stdout.strip()
        return branch if branch else None
    except Exception:
        return None

def write_reports(output_dir: str, project_name: str, timestamp_report: str, timestamp_dir: str, components: list, branch_name: str = None):
    import collections
    import shutil
    
    total_components = len(components)
    active_components = sum(1 for c in components if c['ref_count'] > 0)
    unused_components = total_components - active_components
    total_references = sum(c['ref_count'] for c in components)
    
    # 1. Prepare report.json content
    report_content = {
        "timestamp": timestamp_dir,
        "date": timestamp_report,
        "project_name": project_name,
        "branch": branch_name,
        "summary": {
            "total_components": total_components,
            "active_components": active_components,
            "unused_components": unused_components,
            "total_references": total_references
        }
    }
    
    # 2. Prepare index.json content (flat list of all components)
    index_content = []
    sorted_all_comps = sorted(components, key=lambda x: (os.path.basename(x['defining_file']), x['name']))
    for comp in sorted_all_comps:
        file_basename = os.path.basename(comp['defining_file'])
        index_content.append({
            "file": file_basename,
            "name": comp['name'],
            "count": comp['ref_count']
        })
        
    # 3. Prepare component-specific JSON contents (grouped by file name)
    components_by_file = collections.defaultdict(list)
    for comp in components:
        defining_file_base = os.path.basename(comp['defining_file'])
        components_by_file[defining_file_base].append(comp)
        
    component_files_content = {}
    for defining_file_base, comps in components_by_file.items():
        file_name_without_ext, _ = os.path.splitext(defining_file_base)
        json_filename = f"{file_name_without_ext}.json"
        
        sorted_comps = sorted(comps, key=lambda x: (-x['ref_count'], x['name']))
        pkg_name = comps[0]['package'] if comps else ""
        
        comps_data = []
        for comp in sorted_comps:
            # Group and merge references by class name
            merged = {}
            for ref in comp['ref_classes']:
                if isinstance(ref, str):
                    cname = ref
                    rcount = 1
                    rlines = []
                else:
                    cname = ref.get('class_name', '')
                    rcount = ref.get('count', 0)
                    rlines = ref.get('lines', [])
                    
                if cname not in merged:
                    merged[cname] = {
                        'class_name': cname,
                        'count': 0,
                        'lines': set()
                    }
                merged[cname]['count'] += rcount
                merged[cname]['lines'].update(rlines)
                
            classes_list = []
            for cname in sorted(merged.keys()):
                classes_list.append({
                    'class_name': cname,
                    'count': merged[cname]['count'],
                    'lines': sorted(list(merged[cname]['lines']))
                })
                
            comps_data.append({
                "name": comp['name'],
                "count": comp['ref_count'],
                "classes": classes_list
            })
            
        component_files_content[json_filename] = {
            "package": pkg_name,
            "file": defining_file_base,
            "components": comps_data
        }
        
    # 4. Helper to save files to a folder and update index.json of the category
    def save_run_to_folder(category_dir: str, folder_name: str):
        run_dir = os.path.join(category_dir, folder_name)
        
        # Clean run directory to avoid stale files
        if os.path.exists(run_dir):
            try:
                shutil.rmtree(run_dir)
            except Exception:
                pass
        os.makedirs(run_dir, exist_ok=True)
        
        # Save report.json
        report_copy = dict(report_content)
        report_copy["timestamp"] = folder_name
        with open(os.path.join(run_dir, "report.json"), 'w', encoding='utf-8') as f:
            json.dump(report_copy, f, indent=2, ensure_ascii=False)
            
        # Save index.json (component list)
        with open(os.path.join(run_dir, "index.json"), 'w', encoding='utf-8') as f:
            json.dump(index_content, f, indent=2, ensure_ascii=False)
            
        # Save component files
        for filename, content in component_files_content.items():
            with open(os.path.join(run_dir, filename), 'w', encoding='utf-8') as f:
                json.dump(content, f, indent=2, ensure_ascii=False)
                
        # Update category index.json
        cat_index_path = os.path.join(category_dir, "index.json")
        entries = []
        project_name_val = project_name
        branch_name_val = branch_name
        if os.path.exists(cat_index_path):
            try:
                with open(cat_index_path, 'r', encoding='utf-8') as f:
                    old_data = json.load(f)
                    if isinstance(old_data, dict):
                        entries = old_data.get("runs", [])
                        project_name_val = old_data.get("project_name", project_name)
                        branch_name_val = old_data.get("branch", branch_name)
                    elif isinstance(old_data, list):
                        entries = old_data
                        # Extract project name and branch from old entries and clean them
                        for e in entries:
                            if "project_name" in e:
                                project_name_val = e["project_name"]
                                del e["project_name"]
                            if "branch" in e:
                                branch_name_val = e["branch"]
                                del e["branch"]
            except Exception:
                entries = []
                
        new_entry = {
            "timestamp": folder_name,
            "date": timestamp_report,
            "summary": report_content["summary"]
        }
        
        # Remove existing entry with same folder_name (overwrite)
        entries = [e for e in entries if e["timestamp"] != folder_name]
        for e in entries:
            e.pop("project_name", None)
            e.pop("branch", None)
            
        entries.insert(0, new_entry)
        
        # Verify folder existence to filter out legacy or deleted entries
        entries = [e for e in entries if os.path.isdir(os.path.join(category_dir, e["timestamp"]))]
        
        entries.sort(key=lambda x: x["timestamp"], reverse=True)
        
        output_data = {
            "project_name": project_name_val,
            "branch": branch_name_val,
            "runs": entries
        }
        
        with open(cat_index_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)

    now_dt = datetime.datetime.strptime(timestamp_dir, "%Y%m%d_%H%M%S")
    
    # Save to daily (YYYYMMDD folder)
    summary_daily_dir = os.path.join(output_dir, "summary_daily")
    daily_folder = now_dt.strftime("%Y%m%d")
    save_run_to_folder(summary_daily_dir, daily_folder)
    
    # Save to weekly (YYYY_Www folder)
    summary_weekly_dir = os.path.join(output_dir, "summary_weekly")
    week_folder = now_dt.strftime("%Y_W%W")
    save_run_to_folder(summary_weekly_dir, week_folder)
    
    # Save to monthly (YYYY_MM folder)
    summary_monthly_dir = os.path.join(output_dir, "summary_monthly")
    month_folder = now_dt.strftime("%Y_%m")
    save_run_to_folder(summary_monthly_dir, month_folder)
    
    # Save to yearly (YYYY folder)
    summary_yearly_dir = os.path.join(output_dir, "summary_yearly")
    year_folder = now_dt.strftime("%Y")
    save_run_to_folder(summary_yearly_dir, year_folder)

def main():
    print("=== Compose Component Usage Tracker ===")
    
    try:
        config = load_config()
    except Exception as e:
        print(f"Failed to load config: {e}")
        return
        
    project_name = config["PROJECT_NAME"]
    project_path = config["PROJECT_PATH"]
    target_package_path = config["TARGET_PACKAGE_PATH"]
    target_extensions = tuple(f".{ext}" if not ext.startswith('.') else ext for ext in config["TARGET_EXTENSIONS"])
    main_branch = config["MAIN_BRANCH"]
    
    # 1. Update source code via Git
    update_git_repository(project_path, main_branch)
    
    # 2. Discover components under TARGET_PACKAGE_PATH
    print(f"\nScanning for components in target package: {target_package_path}")
    components = []
    
    if not os.path.exists(target_package_path):
        print(f"Error: Target package path does not exist: {target_package_path}")
        return
        
    for root, _, files in os.walk(target_package_path):
        for file in files:
            if file.endswith(target_extensions):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    pkg = extract_package(content)
                    comp_names = extract_composables(content)
                    
                    for name in comp_names:
                        components.append({
                            'name': name,
                            'package': pkg,
                            'defining_file': os.path.abspath(file_path),
                            'ref_count': 0,
                            'ref_classes': []
                        })
                except Exception as e:
                    print(f"Error reading target file {file_path}: {e}")
                    
    print(f"Found {len(components)} composable component(s).")
    if not components:
        print("No components found. Exiting.")
        return
        
    # Create lookup map for components
    components_map = {c['name']: c for c in components}
    
    # 3. Scan all files in project for references
    print(f"\nScanning project path for references: {project_path}")
    
    for root, _, files in os.walk(project_path):
        for file in files:
            if file.endswith(target_extensions):
                file_path = os.path.join(root, file)
                abs_file_path = os.path.abspath(file_path)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        raw_content = f.read()
                        
                    cleaned_content = None  # Lazy clean
                    
                    # Check for references of each component
                    for comp_name, comp_info in components_map.items():
                        # Optimize: check if component name is in raw content before cleaning
                        if comp_name not in raw_content:
                            continue
                            
                        # If this is the file where the component is defined, skip it
                        if abs_file_path == comp_info['defining_file']:
                            continue
                            
                        # Lazily clean comments/imports from this file once
                        if cleaned_content is None:
                            cleaned_content = clean_imports_and_comments(raw_content)
                            
                        # Double check word boundary matches in the cleaned content
                        # Word boundary matching matches standard word boundaries \b
                        matches = re.findall(r'\b' + re.escape(comp_name) + r'\b', cleaned_content)
                        count = len(matches)
                        
                        if count > 0:
                            # Extract this file's package and name
                            pkg = extract_package(raw_content)
                            file_basename = os.path.basename(file_path)
                            name_without_ext, _ = os.path.splitext(file_basename)
                            class_ident = f"{pkg}.{name_without_ext}" if pkg else name_without_ext
                            
                            # Find all line numbers (1-based) where comp_name is referenced
                            lines_found = []
                            cleaned_lines = cleaned_content.splitlines()
                            for idx, line in enumerate(cleaned_lines):
                                line_matches = re.findall(r'\b' + re.escape(comp_name) + r'\b', line)
                                if line_matches:
                                    lines_found.append(idx + 1)
                                    
                            comp_info['ref_count'] += count
                            comp_info['ref_classes'].append({
                                'class_name': class_ident,
                                'count': count,
                                'lines': lines_found
                            })
                            
                except Exception as e:
                    print(f"Error processing file {file_path} for references: {e}")
                    
    # 4. Generate report
    now = datetime.datetime.now()
    timestamp_dir = now.strftime("%Y%m%d_%H%M%S")
    timestamp_report = now.strftime("%Y-%m-%d %H:%M:%S")
    
    branch_name = get_git_branch(project_path)
    
    module_output_dir = os.path.join(config["OUTPUT_DIR"], "compose_common_component")
    write_reports(module_output_dir, project_name, timestamp_report, timestamp_dir, components, branch_name)
    
    total_components = len(components)
    active_components = sum(1 for c in components if c['ref_count'] > 0)
    unused_components = total_components - active_components
    total_references = sum(c['ref_count'] for c in components)
    
    print(f"\nReports generated successfully in: {module_output_dir}")
    print(f"Summary:")
    print(f" - Total Components: {total_components}")
    print(f" - Active Components: {active_components}")
    print(f" - Unused Components: {unused_components}")
    print(f" - Total References: {total_references}")

if __name__ == "__main__":
    main()

import os
import re
import json
import csv
import datetime
import subprocess

def strip_comments(code: str) -> str:
    """
    Strips Kotlin single-line and multi-line comments from the source code,
    while leaving double-quoted and triple-quoted string literals intact.
    """
    pattern = re.compile(
        r'"{3}.*?"{3}|//.*?$|/\*.*?\*/|"(?:\\.|[^\\"])*"',
        re.DOTALL | re.MULTILINE
    )
    def replacer(match):
        s = match.group(0)
        if s.startswith('//') or s.startswith('/*'):
            return ''
        return s
    return pattern.sub(replacer, code)

def clean_imports_and_comments(code: str) -> str:
    """
    Strips comments and ignores lines starting with 'import '.
    """
    code = strip_comments(code)
    lines = []
    for line in code.splitlines():
        if line.strip().startswith('import '):
            continue
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

def write_reports(report_dir: str, project_name: str, timestamp_report: str, components: list, branch_name: str = None):
    import collections
    os.makedirs(report_dir, exist_ok=True)
    
    total_components = len(components)
    active_components = sum(1 for c in components if c['ref_count'] > 0)
    unused_components = total_components - active_components
    total_references = sum(c['ref_count'] for c in components)
    
    # Write summary.csv
    summary_path = os.path.join(report_dir, "summary.csv")
    with open(summary_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["Metric", "Value"])
        writer.writerow(["Project Name", project_name])
        if branch_name:
            writer.writerow(["Git Branch", branch_name])
        writer.writerow(["Generated Date", timestamp_report])
        writer.writerow(["Total Components", total_components])
        writer.writerow(["Active Components", active_components])
        writer.writerow(["Unused Components", unused_components])
        writer.writerow(["Total References", total_references])
        
        # Add a blank line and then list all components: File, Component, Reference Count
        writer.writerow([])
        writer.writerow(["File", "Component", "Reference Count"])
        sorted_all_comps = sorted(components, key=lambda x: (os.path.basename(x['defining_file']), x['name']))
        for comp in sorted_all_comps:
            file_basename = os.path.basename(comp['defining_file'])
            writer.writerow([file_basename, comp['name'], comp['ref_count']])
        
    # Group components by their source filename and write <ComponentFileName>.csv
    components_by_file = collections. defaultdict(list)
    for comp in components:
        defining_file_base = os.path.basename(comp['defining_file'])
        components_by_file[defining_file_base].append(comp)
        
    for defining_file_base, comps in components_by_file.items():
        file_name_without_ext, _ = os.path.splitext(defining_file_base)
        csv_filename = f"{file_name_without_ext}.csv"
        csv_path = os.path.join(report_dir, csv_filename)
        
        sorted_comps = sorted(comps, key=lambda x: (-x['ref_count'], x['name']))
        pkg_name = comps[0]['package'] if comps else ""
        
        with open(csv_path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(["Package", pkg_name])
            writer.writerow(["File", defining_file_base])
            writer.writerow([])
            
            for comp in sorted_comps:
                writer.writerow(["Component", comp['name']])
                writer.writerow(["Reference Count", comp['ref_count']])
                writer.writerow(["Referenced Class"])
                
                sorted_ref_classes = sorted(list(set(comp['ref_classes'])))
                for ref_class in sorted_ref_classes:
                    writer.writerow([ref_class])
                writer.writerow([])

    # 4.3 Update latest_reports.json in reports root (output_dir)
    output_dir = os.path.dirname(report_dir)
    index_path = os.path.join(output_dir, "latest_reports.json")
    timestamp_dir = os.path.basename(report_dir)
    
    # List generated CSV files without package directory walking (just base name change)
    files_list = sorted([f"{os.path.splitext(name)[0]}.csv" for name in components_by_file.keys()])
    
    new_entry = {
        "timestamp": timestamp_dir,
        "date": timestamp_report,
        "project_name": project_name,
        "branch": branch_name,
        "summary": {
            "total_components": total_components,
            "active_components": active_components,
            "unused_components": unused_components,
            "total_references": total_references
        },
        "files": files_list
    }
    
    # Load existing entries
    entries = []
    if os.path.exists(index_path):
        try:
            with open(index_path, 'r', encoding='utf-8') as f:
                entries = json.load(f)
                if not isinstance(entries, list):
                    entries = []
        except Exception as e:
            print(f"Warning: Failed to parse existing index file: {e}. Starting fresh.")
            entries = []
            
    # Remove existing entry with the same timestamp if any
    entries = [e for e in entries if e.get("timestamp") != timestamp_dir]
    
    # Insert new entry and sort
    entries.insert(0, new_entry)
    entries.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    # Write index
    try:
        with open(index_path, 'w', encoding='utf-8') as f:
            json.dump(entries, f, indent=2, ensure_ascii=False)
        print(f"Index file updated: {index_path}")
    except Exception as e:
        print(f"Error updating index file: {e}")

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
                            
                            comp_info['ref_count'] += count
                            comp_info['ref_classes'].append(class_ident)
                            
                except Exception as e:
                    print(f"Error processing file {file_path} for references: {e}")
                    
    # 4. Generate report
    now = datetime.datetime.now()
    timestamp_dir = now.strftime("%Y%m%d_%H%M%S")
    timestamp_report = now.strftime("%Y-%m-%d %H:%M:%S")
    
    branch_name = get_git_branch(project_path)
    
    report_dir = os.path.join(config["OUTPUT_DIR"], timestamp_dir)
    write_reports(report_dir, project_name, timestamp_report, components, branch_name)
    
    total_components = len(components)
    active_components = sum(1 for c in components if c['ref_count'] > 0)
    unused_components = total_components - active_components
    total_references = sum(c['ref_count'] for c in components)
    
    print(f"\nReports generated successfully in: {report_dir}")
    print(f"Summary:")
    print(f" - Total Components: {total_components}")
    print(f" - Active Components: {active_components}")
    print(f" - Unused Components: {unused_components}")
    print(f" - Total References: {total_references}")

if __name__ == "__main__":
    main()

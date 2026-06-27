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

def write_reports(output_dir: str, project_name: str, timestamp_report: str, timestamp_dir: str, components: list, branch_name: str = None):
    import collections
    
    total_components = len(components)
    active_components = sum(1 for c in components if c['ref_count'] > 0)
    unused_components = total_components - active_components
    total_references = sum(c['ref_count'] for c in components)
    
    # Convert components to simplified structure for JSON
    json_comps = []
    for comp in components:
        json_comps.append({
            "name": comp["name"],
            "package": comp["package"],
            "defining_file": os.path.basename(comp["defining_file"]),
            "ref_count": comp["ref_count"],
            "ref_classes": sorted(list(set(comp["ref_classes"])))
        })
        
    report_data = {
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
        "components": sorted(json_comps, key=lambda x: (x["defining_file"], x["name"]))
    }
    
    # Determine output directories
    summary_daily_dir = os.path.join(output_dir, "summary_daily")
    summary_weekly_dir = os.path.join(output_dir, "summary_weekly")
    summary_monthly_dir = os.path.join(output_dir, "summary_monthly")
    summary_yearly_dir = os.path.join(output_dir, "summary_yearly")
    
    # Helper to save report and update index
    def save_to_category(category_dir: str, period_key_func=None):
        os.makedirs(category_dir, exist_ok=True)
        index_path = os.path.join(category_dir, "index.json")
        
        entries = []
        if os.path.exists(index_path):
            try:
                with open(index_path, 'r', encoding='utf-8') as f:
                    entries = json.load(f)
            except Exception:
                entries = []
                
        report_filename = f"{timestamp_dir}_report.json"
        report_path = os.path.join(category_dir, report_filename)
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
            
        new_entry = {
            "timestamp": timestamp_dir,
            "date": timestamp_report,
            "project_name": project_name,
            "branch": branch_name,
            "summary": report_data["summary"]
        }
        
        if period_key_func is None:
            # Daily: always append/prepend
            entries.insert(0, new_entry)
        else:
            # Find if there is an entry with the same period key
            now_dt = datetime.datetime.strptime(timestamp_dir, "%Y%m%d_%H%M%S")
            period_key = period_key_func(now_dt)
            
            existing_idx = -1
            for idx, entry in enumerate(entries):
                entry_dt = datetime.datetime.strptime(entry["timestamp"], "%Y%m%d_%H%M%S")
                if period_key_func(entry_dt) == period_key:
                    existing_idx = idx
                    break
                    
            if existing_idx != -1:
                # Delete old file
                old_timestamp = entries[existing_idx]["timestamp"]
                if old_timestamp != timestamp_dir:
                    old_file = os.path.join(category_dir, f"{old_timestamp}_report.json")
                    if os.path.exists(old_file):
                        try:
                            os.remove(old_file)
                        except Exception:
                            pass
                entries[existing_idx] = new_entry
            else:
                entries.insert(0, new_entry)
                
        # Deduplicate indices on same timestamp
        seen = set()
        dedup_entries = []
        for e in entries:
            if e["timestamp"] not in seen:
                seen.add(e["timestamp"])
                dedup_entries.append(e)
        entries = dedup_entries

        entries.sort(key=lambda x: x["timestamp"], reverse=True)
        with open(index_path, 'w', encoding='utf-8') as f:
            json.dump(entries, f, indent=2, ensure_ascii=False)
            
    # Save to daily (always append)
    save_to_category(summary_daily_dir, None)
    
    # Save to weekly
    save_to_category(summary_weekly_dir, lambda dt: dt.strftime("%Y-W%W"))
    
    # Save to monthly
    save_to_category(summary_monthly_dir, lambda dt: dt.strftime("%Y-%m"))
    
    # Save to yearly
    save_to_category(summary_yearly_dir, lambda dt: dt.strftime("%Y"))

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
    
    write_reports(config["OUTPUT_DIR"], project_name, timestamp_report, timestamp_dir, components, branch_name)
    
    total_components = len(components)
    active_components = sum(1 for c in components if c['ref_count'] > 0)
    unused_components = total_components - active_components
    total_references = sum(c['ref_count'] for c in components)
    
    print(f"\nReports generated successfully in: {config['OUTPUT_DIR']}")
    print(f"Summary:")
    print(f" - Total Components: {total_components}")
    print(f" - Active Components: {active_components}")
    print(f" - Unused Components: {unused_components}")
    print(f" - Total References: {total_references}")

if __name__ == "__main__":
    main()

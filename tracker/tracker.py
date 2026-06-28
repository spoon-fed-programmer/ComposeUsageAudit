import os
import re
import json
import datetime
import sys

# Add current script's parent folder to path to allow absolute/relative imports in packages
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Force Windows console to UTF-8 code page (65001) to prevent corrupted Korean console output
if sys.platform.startswith('win'):
    os.system('chcp 65001 > nul')

from utils.parser import (
    extract_package,
    extract_composables,
    clean_imports_and_comments,
    extract_source_set,
    extract_module_name
)
from utils.git_helper import (
    update_git_repository,
    get_git_branch
)
from utils.reporter import (
    write_reports
)

def load_config(config_path: str = "config.json") -> dict:
    paths_to_check = [
        config_path,
        os.path.join("..", config_path),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", config_path)
    ]
    
    found_path = None
    for p in paths_to_check:
        if os.path.exists(p):
            found_path = p
            break
            
    if not found_path:
        raise FileNotFoundError(f"Configuration file not found. Paths checked: {paths_to_check}")
        
    with open(found_path, 'r', encoding='utf-8') as f:
        config = json.load(f)
        
    required = ["PROJECT_NAME", "PROJECT_PATH", "TARGET_PACKAGE_PATH"]
    for field in required:
        if field not in config:
            raise KeyError(f"Missing required configuration field: {field}")
            
    config.setdefault("TARGET_EXTENSIONS", ["kt", "kts"])
    config.setdefault("MAIN_BRANCH", "main")
    config.setdefault("OUTPUT_DIR", ".")
    
    # Normalize paths relative to config file location
    config_dir = os.path.dirname(os.path.abspath(found_path))
    
    def normalize(p):
        if os.path.isabs(p):
            return os.path.abspath(p)
        return os.path.abspath(os.path.join(config_dir, p))
        
    config["PROJECT_PATH"] = normalize(config["PROJECT_PATH"])
    config["TARGET_PACKAGE_PATH"] = normalize(config["TARGET_PACKAGE_PATH"])
    config["OUTPUT_DIR"] = normalize(config["OUTPUT_DIR"])
    
    return config

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
                        matches = re.findall(r'\b' + re.escape(comp_name) + r'\b', cleaned_content)
                        count = len(matches)
                        
                        if count > 0:
                            # Extract this file's package name and resolve class identifier without sourceSet
                            pkg = extract_package(raw_content)
                            file_basename = os.path.basename(file_path)
                            name_without_ext, _ = os.path.splitext(file_basename)
                            class_ident = f"{pkg}.{name_without_ext}" if pkg else name_without_ext
                            
                            # Extract source set name
                            sourceset = extract_source_set(abs_file_path)
                            
                            # Extract module name
                            modulename = extract_module_name(abs_file_path, project_path)
                            
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
                                'source_set': sourceset,
                                'module_name': modulename,
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

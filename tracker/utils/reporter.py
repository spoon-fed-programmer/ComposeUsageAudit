import os
import json
import shutil
import datetime

def write_reports(output_dir: str, project_name: str, timestamp_report: str, timestamp_dir: str, components: list, branch_name: str = None):
    import collections
    
    total_components = len(components)
    active_components = sum(1 for c in components if c['ref_count'] > 0)
    unused_components = total_components - active_components
    total_references = sum(c['ref_count'] for c in components)
    
    # Aggregate references by module
    module_references = {}
    for c in components:
        for ref in c.get('ref_classes', []):
            if isinstance(ref, dict):
                mod = ref.get('module_name', '')
                count = ref.get('count', 0)
                module_references[mod] = module_references.get(mod, 0) + count
            elif isinstance(ref, str):
                module_references[""] = module_references.get("", 0) + 1
                
    # Sort modules alphabetically
    sorted_modules = {k: module_references[k] for k in sorted(module_references.keys())}
    
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
        },
        "modules": sorted_modules
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
            # Group and merge references by class name, source_set, and module_name
            merged = {}
            for ref in comp['ref_classes']:
                if isinstance(ref, str):
                    cname = ref
                    rcount = 1
                    rlines = []
                    sourceset = "main"
                    modulename = ""
                else:
                    cname = ref.get('class_name', '')
                    rcount = ref.get('count', 0)
                    rlines = ref.get('lines', [])
                    sourceset = ref.get('source_set', 'main')
                    modulename = ref.get('module_name', '')
                    
                key = (cname, sourceset, modulename)
                if key not in merged:
                    merged[key] = {
                        'class_name': cname,
                        'source_set': sourceset,
                        'module_name': modulename,
                        'count': 0,
                        'lines': set()
                    }
                merged[key]['count'] += rcount
                merged[key]['lines'].update(rlines)
                
            classes_list = []
            for key in sorted(merged.keys()):
                classes_list.append({
                    'class_name': merged[key]['class_name'],
                    'source_set': merged[key]['source_set'],
                    'module_name': merged[key]['module_name'],
                    'count': merged[key]['count'],
                    'lines': sorted(list(merged[key]['lines']))
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
            "summary": report_content["summary"],
            "modules": report_content["modules"]
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
    
    # Save to daily
    summary_daily_dir = os.path.join(output_dir, "summary_daily")
    daily_folder = now_dt.strftime("%Y%m%d")
    save_run_to_folder(summary_daily_dir, daily_folder)
    
    # Save to weekly
    summary_weekly_dir = os.path.join(output_dir, "summary_weekly")
    week_folder = now_dt.strftime("%Y_W%W")
    save_run_to_folder(summary_weekly_dir, week_folder)
    
    # Save to monthly
    summary_monthly_dir = os.path.join(output_dir, "summary_monthly")
    month_folder = now_dt.strftime("%Y_%m")
    save_run_to_folder(summary_monthly_dir, month_folder)
    
    # Save to yearly
    summary_yearly_dir = os.path.join(output_dir, "summary_yearly")
    year_folder = now_dt.strftime("%Y")
    save_run_to_folder(summary_yearly_dir, year_folder)

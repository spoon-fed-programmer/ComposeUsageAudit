import os
import re

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

def extract_source_set(file_path: str) -> str:
    """
    Extracts the source set / variant name from the file path.
    Defaults to 'main' if not found.
    """
    abs_path = os.path.abspath(file_path)
    match = re.search(r'[\\/]src[\\/]([^\\/]+)[\\/](?:java|kotlin)[\\/]', abs_path, re.IGNORECASE)
    return match.group(1) if match else "main"

def extract_module_name(file_path: str, project_path: str) -> str:
    """
    Extracts the module name from the file path relative to the project_path.
    Identifies the module as the directory structure prior to the 'src' directory.
    """
    abs_file_path = os.path.abspath(file_path)
    abs_project_path = os.path.abspath(project_path)
    
    try:
        rel_path = os.path.relpath(abs_file_path, abs_project_path)
    except ValueError:
        return ""
        
    parts = []
    head, tail = os.path.split(rel_path)
    while tail:
        parts.insert(0, tail)
        head, tail = os.path.split(head)
    if head:
        parts.insert(0, head)
        
    src_idx = -1
    for idx, part in enumerate(parts):
        if part.lower() == 'src':
            src_idx = idx
            break
            
    if src_idx > 0:
        return "/".join(parts[:src_idx])
    elif len(parts) > 1:
        return parts[0]
    return ""

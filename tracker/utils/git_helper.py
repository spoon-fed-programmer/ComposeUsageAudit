import os
import subprocess

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

def get_git_branch(project_path: str) -> str:
    if not os.path.exists(os.path.join(project_path, ".git")):
        return None
    try:
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

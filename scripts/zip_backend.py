#!/usr/bin/env python3
import os
import zipfile

def zip_backend():
    zip_path = "backend.zip"
    backend_dir = "backend"
    
    exclude_dirs = {
        ".venv",
        "venv",
        "env",
        ".mypy_cache",
        ".ruff_cache",
        ".pytest_cache",
        "__pycache__"
    }
    
    exclude_files = {
        ".coverage",
        "backend.zip"
    }
    
    print(f"Creating clean zip: {zip_path}")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(backend_dir):
            # Exclude unwanted directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file in exclude_files:
                    continue
                
                file_path = os.path.join(root, file)
                # Determine the archive name (relative to the backend directory)
                # This ensures the zipped files start with 'app/', 'tests/', etc.
                arcname = os.path.relpath(file_path, backend_dir)
                
                print(f"  Adding: {arcname}")
                zipf.write(file_path, arcname)

if __name__ == "__main__":
    zip_backend()

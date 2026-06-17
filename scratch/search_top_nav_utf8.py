import re
import os

root_dir = r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos"

patterns = [
    re.compile(r'top-nav-modules', re.IGNORECASE),
    re.compile(r'nav-more', re.IGNORECASE),
    re.compile(r'dropdown-menu', re.IGNORECASE)
]

for dirpath, _, filenames in os.walk(root_dir):
    # Get path relative to riskos root
    rel_path = os.path.relpath(dirpath, root_dir)
    
    # Skip standard build/system dirs, but only if they are actually subdirectories
    if rel_path != '.' and (
        rel_path.startswith('.git') or 
        rel_path.startswith('.agents') or 
        rel_path.startswith('node_modules') or 
        rel_path.startswith('scratch')
    ):
        continue
        
    for filename in filenames:
        if not filename.endswith('.js') and not filename.endswith('.html'):
            continue
            
        filepath = os.path.join(dirpath, filename)
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        for p in patterns:
            if p.search(content):
                print(f"Match in file: {os.path.relpath(filepath, root_dir)}")
                # Find the lines
                lines = content.splitlines()
                for i, line in enumerate(lines):
                    if p.search(line):
                        print(f"  Line {i+1}: {line.strip()}")
                print("-" * 30)
                break

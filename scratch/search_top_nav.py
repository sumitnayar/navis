import re
import os

root_dir = r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos"

patterns = [
    re.compile(r'top-nav-modules', re.IGNORECASE),
    re.compile(r'nav-more', re.IGNORECASE),
    re.compile(r'dropdown-menu', re.IGNORECASE)
]

for dirpath, _, filenames in os.walk(root_dir):
    # Skip directories like .git or .agents
    if '.git' in dirpath or '.agents' in dirpath or 'node_modules' in dirpath or 'scratch' in dirpath:
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

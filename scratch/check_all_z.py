import os
import re

root_dir = r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos"

pattern = re.compile(r'z-index\s*:\s*(\d+)', re.IGNORECASE)

results = []
for dirpath, _, filenames in os.walk(root_dir):
    rel_path = os.path.relpath(dirpath, root_dir)
    if rel_path != '.' and (
        rel_path.startswith('.git') or 
        rel_path.startswith('.agents') or 
        rel_path.startswith('node_modules') or 
        rel_path.startswith('scratch')
    ):
        continue
        
    for filename in filenames:
        if not filename.endswith('.js') and not filename.endswith('.css') and not filename.endswith('.html'):
            continue
            
        filepath = os.path.join(dirpath, filename)
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            for line_no, line in enumerate(f, 1):
                m = pattern.search(line)
                if m:
                    val = int(m.group(1))
                    results.append((val, os.path.relpath(filepath, root_dir), line_no, line.strip()))

# Sort by z-index value descending
results.sort(key=lambda x: x[0], reverse=True)

print("All z-index values found (sorted highest to lowest):")
for val, path, line_no, content in results:
    print(f"z-index: {val} in {path}:{line_no} -> {content}")

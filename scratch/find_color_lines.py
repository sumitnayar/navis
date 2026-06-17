import os
import re

root_dir = r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos"

old_colors = {
    '#E24B4A': 'Red (Above Appetite)',
    '#EF9F27': 'Amber (Near Appetite)',
    '#1D9E75': 'Green (Within Appetite)',
    '#0F6E56': 'Dark Green border',
    '#A32D2D': 'Dark Red border',
    '#854F0B': 'Dark Amber border'
}

patterns = [re.compile(re.escape(color), re.IGNORECASE) for color in old_colors.keys()]

matches = []
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
                for p in patterns:
                    if p.search(line):
                        matches.append((
                            os.path.relpath(filepath, root_dir),
                            line_no,
                            line.strip()
                        ))
                        break

print(f"Found {len(matches)} occurrences of old colors:")
for path, line_no, content in matches:
    print(f"{path}:{line_no}: {content}")

import re

with open('C:/Users/Sumit/.gemini/antigravity/scratch/riskos/app.css', 'r', encoding='utf-8') as f:
    css = f.read()

classes = ['board-qa-layout', 'details-panel', 'chat-window', 'glass-panel']
for c in classes:
    pattern = rf'\.{c}\b[^}}]*}}'
    matches = re.findall(pattern, css)
    print(f"--- {c} ---")
    for m in matches:
        print(m)

import re

css_path = r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos\app.css"

with open(css_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

patterns = [
    re.compile(r'dropdown', re.IGNORECASE),
    re.compile(r'more', re.IGNORECASE),
    re.compile(r'top-nav', re.IGNORECASE)
]

matches = []
for idx, line in enumerate(lines):
    line_num = idx + 1
    for p in patterns:
        if p.search(line):
            matches.append((line_num, line.strip()))
            break

print(f"Found {len(matches)} matching lines:")
for num, content in matches[:100]:
    print(f"Line {num}: {content}")

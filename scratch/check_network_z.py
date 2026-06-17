import re
import os

filepath = r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos\components\network.js"

if not os.path.exists(filepath):
    print("network.js does not exist")
    exit(1)

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

patterns = [
    re.compile(r'z-index', re.IGNORECASE),
    re.compile(r'position', re.IGNORECASE),
    re.compile(r'style\s*=', re.IGNORECASE)
]

for idx, line in enumerate(lines):
    line_num = idx + 1
    for p in patterns:
        if p.search(line):
            print(f"Line {line_num}: {line.strip()}")
            break

import re
import os

files = [
    r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos\app.css",
    r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos\styles\designSystem.css",
    r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos\styles\publicSite.css"
]

patterns = [
    r'\.main-content',
    r'#page-render-container',
    r'\.network-container',
    r'\.cascade',
    r'intelligence'
]

compiled = [re.compile(p, re.IGNORECASE) for p in patterns]

for fp in files:
    if not os.path.exists(fp):
        continue
    print(f"\n===== SEARCHING IN {os.path.basename(fp)} =====")
    with open(fp, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for idx, line in enumerate(lines):
        line_num = idx + 1
        for cp in compiled:
            if cp.search(line):
                # Print line and 3 lines before/after for context
                start = max(0, idx - 2)
                end = min(len(lines), idx + 3)
                print(f"--- Line {line_num} (matched: {cp.pattern}) ---")
                for c_idx in range(start, end):
                    print(f"{c_idx+1}: {lines[c_idx].strip()}")
                print("-" * 20)
                break

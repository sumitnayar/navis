import re

path = r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos\services\storageService.js"
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "settings" in line.lower() or "getsettings" in line.lower() or "savesettings" in line.lower():
        print(f"{idx+1}: {line.strip()}")

import re
import os

filepath = r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos\styles\publicSite.css"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's search for z-index and get the context around it
matches = re.finditer(r'([^\n]*z-index[^\n]*)', content, re.IGNORECASE)

for m in matches:
    start = max(0, m.start() - 150)
    end = min(len(content), m.end() + 150)
    print(f"--- Match at char {m.start()} ---")
    print(content[start:end])
    print("-" * 30)

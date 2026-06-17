import re

filepath = r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos\app.css"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Search for any selectors containing "drawer" and print their rules
matches = re.finditer(r'([^\n]*drawer[^\n]*)\s*\{([^}]*)\}', content, re.IGNORECASE)

for m in matches:
    print(f"Selector: {m.group(1).strip()}")
    print(f"Body:\n{m.group(2).strip()}")
    print("-" * 40)

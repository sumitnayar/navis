import re

css_path = r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos\app.css"

with open(css_path, 'r', encoding='utf-8') as f:
    content = f.read()

# find all occurrences of z-index and their surrounding lines
matches = re.finditer(r'z-index\s*:\s*\d+[^;]*;', content, re.IGNORECASE)

print("Found z-index declarations:")
for m in matches:
    # get some surrounding context
    start = max(0, m.start() - 100)
    end = min(len(content), m.end() + 100)
    print(f"--- Match at char {m.start()} ---")
    print(content[start:end])
    print("-" * 30)

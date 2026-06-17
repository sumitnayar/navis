import re

filepath = r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos\components\network.js"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the render method. We'll search for render(container) or similar and print the next 150 lines
m = re.search(r'render\s*\(\s*container\s*\)\s*\{', content)
if m:
    start_char = m.start()
    print(content[start_char:start_char + 3000])
else:
    print("Could not find render method")

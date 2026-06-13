import re

with open('C:/Users/Sumit/.gemini/antigravity/scratch/riskos/app.css', 'r', encoding='utf-8') as f:
    css = f.read()

# find all css variables (e.g. --color-...)
variables = set(re.findall(r'--[a-zA-Z0-9_-]+', css))
for v in sorted(variables):
    print(v)

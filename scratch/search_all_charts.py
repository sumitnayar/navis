import re

filepath = r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos\components\dashboard.js"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find initFragilityChart and initHeatmap methods and print them
matches = re.finditer(r'(initFragilityChart|initHeatmap|initSparklines)\s*\([^)]*\)\s*\{', content)

for m in matches:
    start_char = m.start()
    # Find next matching closing brace or just grab 80 lines
    print(f"\n===== METHOD: {m.group(1)} =====")
    print(content[start_char:start_char + 1500])
    print("-" * 50)

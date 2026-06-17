import re

filepath = r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos\components\network.js"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Search for the template literal string in render()
# Usually looks like container.innerHTML = `...` or similar
m = re.search(r'container\.innerHTML\s*=\s*`', content)
if m:
    start_char = m.start()
    print(content[start_char:start_char + 2000])
else:
    # try another match
    m = re.search(r'return\s*`', content)
    if m:
        start_char = m.start()
        print(content[start_char:start_char + 2000])
    else:
        # let's just search for ".register-layout" in network.js
        idx = content.find('.register-layout')
        if idx != -1:
            print(content[idx-100:idx+1900])
        else:
            print("Could not find register-layout")

import os
import re

def search():
    components_dir = r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos\components"
    pattern = re.compile(r'\[\$\{[a-zA-Z0-9_\.]+\}\]')
    for f in os.listdir(components_dir):
        if f.endswith('.js'):
            filepath = os.path.join(components_dir, f)
            with open(filepath, 'r', encoding='utf-8') as file_obj:
                content = file_obj.read()
                matches = list(pattern.finditer(content))
                if matches:
                    print(f"File: {f}")
                    lines = content.splitlines()
                    for m in matches:
                        line_num = content[:m.start()].count('\n') + 1
                        print(f"  Line {line_num}: {lines[line_num-1].strip()}")

if __name__ == "__main__":
    search()

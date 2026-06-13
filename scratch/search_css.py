import re

def search_css():
    css_path = r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos\app.css"
    patterns = [r'\.network-', r'\.playback-', r'\.canvas-controls', r'\.board-mode-toggle-btn', r'\.playback-group']
    
    with open(css_path, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.splitlines()
        
    for p in patterns:
        print(f"--- Matches for {p} ---")
        regex = re.compile(p)
        for i, line in enumerate(lines, 1):
            if regex.search(line):
                # print 3 lines before and after
                start = max(0, i-4)
                end = min(len(lines), i+4)
                print(f"Line {i}:")
                for j in range(start, end):
                    print(f"  {j+1}: {lines[j]}")
                print()

if __name__ == "__main__":
    search_css()

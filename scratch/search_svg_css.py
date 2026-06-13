def search_svg_css():
    css_path = r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos\app.css"
    targets = ["network-svg", "risk-cascade-svg", "network-container"]
    
    with open(css_path, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.splitlines()
        
    for target in targets:
        print(f"=== Searching for: {target} ===")
        for i, line in enumerate(lines, 1):
            if target in line:
                start = max(0, i-3)
                end = min(len(lines), i+3)
                print(f"Line {i}:")
                for j in range(start, end):
                    print(f"  {j+1}: {lines[j]}")
                print()

if __name__ == "__main__":
    search_svg_css()

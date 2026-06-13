def search_svg_tag():
    css_path = r"C:\Users\Sumit\.gemini\antigravity\scratch\riskos\app.css"
    
    with open(css_path, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.splitlines()
        
    for i, line in enumerate(lines, 1):
        if line.strip().startswith("svg ") or line.strip().startswith("svg,") or " svg" in line or line.strip() == "svg":
            start = max(0, i-3)
            end = min(len(lines), i+3)
            print(f"Line {i}:")
            for j in range(start, end):
                print(f"  {j+1}: {lines[j]}")
            print()

if __name__ == "__main__":
    search_svg_tag()

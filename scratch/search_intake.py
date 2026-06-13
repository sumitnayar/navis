import re

def main():
    filepath = 'components/intake.js'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    print("=== Matches for Left Panel Document Header ===")
    lines = content.split('\n')
    for idx, line in enumerate(lines, 1):
        if 'Documents' in line and ('count' in line or '${' in line or 'length' in line or 'panel' in line):
            print(f"{idx}: {line.strip()}")
            
    print("\n=== Matches for Upload Button in Ask Documents Tab ===")
    for idx, line in enumerate(lines, 1):
        if 'upload' in line.lower() and ('drawer' in line or 'btn' in line or 'button' in line or 'upload-btn' in line) and idx > 1200:
            print(f"{idx}: {line.strip()}")

if __name__ == '__main__':
    main()

def main():
    filepath = 'components/intake.js'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    lines = content.split('\n')
    print("=== Matches for activeTab or tab clicking ===")
    for idx, line in enumerate(lines, 1):
        if 'activeTab' in line or 'tab-btn' in line:
            # Clean non-ascii
            clean_line = line.encode('ascii', errors='ignore').decode('ascii')
            print(f"{idx}: {clean_line.strip()[:120]}")

if __name__ == '__main__':
    main()

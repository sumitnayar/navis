def main():
    filepath = 'components/intake.js'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    lines = content.split('\n')
    print("=== Matches for queue, accept, apply, or decision ===")
    for idx, line in enumerate(lines, 1):
        if 'decision' in line.lower() or 'apply' in line.lower() or 'queue' in line.lower() or 'vault' in line.lower():
            if 'function' in line or 'async' in line or 'const' in line or 'let' in line or 'class' in line:
                # Replace non-ascii characters to avoid print errors
                clean_line = line.encode('ascii', errors='ignore').decode('ascii')
                print(f"{idx}: {clean_line.strip()[:120]}")

if __name__ == '__main__':
    main()

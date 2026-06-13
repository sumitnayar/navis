def main():
    filepath = 'components/intake.js'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    lines = content.split('\n')
    print("=== Matches for handleFileUpload or saveVaultEntry ===")
    printing = False
    brace_count = 0
    for idx, line in enumerate(lines, 1):
        if 'handleFileUpload' in line:
            printing = True
        if printing:
            clean_line = line.encode('ascii', errors='ignore').decode('ascii')
            print(f"{idx}: {clean_line}")
            if '{' in line:
                brace_count += line.count('{')
            if '}' in line:
                brace_count -= line.count('}')
                if brace_count == 0:
                    printing = False

if __name__ == '__main__':
    main()

with open('components/dashboard.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if 'ID: ' in line and 'risk.id' in line:
            print(f'Found ID: at line {i+1}')
            for j in range(i-2, min(len(lines), i+10)):
                print(f'{j+1}: {lines[j].rstrip()}')
            break

with open('components/dashboard.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if 'risk-detail-drawer' in line:
            for j in range(i, min(len(lines), i+30)):
                print(f'{j+1}: {lines[j].rstrip()}')
            break

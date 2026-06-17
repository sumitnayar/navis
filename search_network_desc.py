with open('components/network.js', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if '<title>' in line or 'title=\"' in line or '<desc>' in line or '<text' in line:
            print(f'network.js:{i+1}:{line.strip()}')

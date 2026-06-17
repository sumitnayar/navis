import os

def check():
    for f in os.listdir('components'):
        if not f.endswith('.js'): continue
        with open('components/' + f, 'r', encoding='utf-8') as file:
            lines = file.readlines()
            for i, line in enumerate(lines):
                if 'description' in line.lower() and '${' in line:
                    print(f'{f}:{i+1}:{line.strip()}')

check()

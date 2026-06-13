import os

def main():
    target_ids = ['policy-doc-access-control', 'policy-doc-bcp-dr', 'policy-doc-privacy']
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.js') or file.endswith('.html') or file.endswith('.css'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    for target in target_ids:
                        if target in content:
                            print(f"Found '{target}' in {path}")
                except Exception as e:
                    pass

if __name__ == '__main__':
    main()

def main():
    filepath = 'supabase_schema.sql'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    lines = content.split('\n')
    print("=== All tables defined in schema ===")
    for idx, line in enumerate(lines, 1):
        if 'CREATE TABLE' in line:
            print(f"{idx}: {line.strip()}")
            
    print("\n=== All matches for vault ===")
    for idx, line in enumerate(lines, 1):
        if 'vault' in line.lower():
            print(f"{idx}: {line.strip()[:100]}")

if __name__ == '__main__':
    main()

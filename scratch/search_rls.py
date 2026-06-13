def main():
    filepath = 'supabase_schema.sql'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    lines = content.split('\n')
    print("=== Matches for RLS or Policy in schema ===")
    for idx, line in enumerate(lines, 1):
        if 'security' in line.lower() or 'policy' in line.lower() or 'enable' in line.lower():
            clean_line = line.encode('ascii', errors='ignore').decode('ascii')
            print(f"{idx}: {clean_line.strip()[:120]}")

if __name__ == '__main__':
    main()

def check_bracket_balance(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    lines = content.split('\n')
    
    in_string = False
    string_char = None
    in_comment_line = False
    in_comment_block = False
    
    i = 0
    while i < len(content):
        char = content[i]
        
        # Handle string literals and comments
        if in_comment_line:
            if char == '\n':
                in_comment_line = False
            i += 1
            continue
            
        if in_comment_block:
            if char == '*' and i + 1 < len(content) and content[i+1] == '/':
                in_comment_block = False
                i += 2
            else:
                i += 1
            continue
            
        if in_string:
            if char == '\\':
                i += 2 # skip escaped character
                continue
            if char == string_char:
                in_string = False
            i += 1
            continue
            
        # Check for comments
        if char == '/' and i + 1 < len(content):
            if content[i+1] == '/':
                in_comment_line = True
                i += 2
                continue
            elif content[i+1] == '*':
                in_comment_block = True
                i += 2
                continue
                
        # Check for string markers
        if char in ["'", '"', '`']:
            in_string = True
            string_char = char
            i += 1
            continue
            
        # Brackets tracking
        if char in '({[':
            stack.append((char, filepath, content[:i].count('\n') + 1))
        elif char in ')}]':
            if not stack:
                print(f"Extra closing {char} on line {content[:i].count('\n') + 1}")
                return False
            top, fp, line = stack.pop()
            if mapping[char] != top:
                print(f"Mismatched closing {char} on line {content[:i].count('\n') + 1}. Expected match for {top} from line {line}")
                return False
        i += 1
        
    if stack:
        for top, fp, line in stack:
            print(f"Unmatched opening {top} from line {line}")
        return False
        
    print(f"All brackets are perfectly balanced in {filepath}!")
    return True

import os
import glob

def check_bracket_balance(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return False

    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    
    in_string = False
    string_char = None
    in_comment_line = False
    in_comment_block = False
    
    i = 0
    while i < len(content):
        char = content[i]
        
        # Handle string literals and comments
        if in_comment_line:
            if char == '\n':
                in_comment_line = False
            i += 1
            continue
            
        if in_comment_block:
            if char == '*' and i + 1 < len(content) and content[i+1] == '/':
                in_comment_block = False
                i += 2
            else:
                i += 1
            continue
            
        if in_string:
            if char == '\\':
                i += 2 # skip escaped character
                continue
            if char == string_char:
                in_string = False
            i += 1
            continue
            
        # Check for comments
        if char == '/' and i + 1 < len(content):
            if content[i+1] == '/':
                in_comment_line = True
                i += 2
                continue
            elif content[i+1] == '*':
                in_comment_block = True
                i += 2
                continue
                
        # Check for string markers
        if char in ["'", '"', '`']:
            in_string = True
            string_char = char
            i += 1
            continue
            
        # Brackets tracking
        if char in '({[':
            stack.append((char, filepath, content[:i].count('\n') + 1))
        elif char in ')}]':
            if not stack:
                print(f"Extra closing {char} on line {content[:i].count('\n') + 1} in {filepath}")
                return False
            top, fp, line = stack.pop()
            if mapping[char] != top:
                print(f"Mismatched closing {char} on line {content[:i].count('\n') + 1} in {filepath}. Expected match for {top} from line {line}")
                return False
        i += 1
        
    if stack:
        for top, fp, line in stack:
            print(f"Unmatched opening {top} from line {line} in {filepath}")
        return False
        
    print(f"All brackets are perfectly balanced in {filepath}!")
    return True

# Scan all JS files in components/ and services/
project_dir = 'C:/Users/Sumit/.gemini/antigravity/scratch/riskos'
js_files = glob.glob(os.path.join(project_dir, 'components', '*.js')) + \
           glob.glob(os.path.join(project_dir, 'services', '*.js')) + \
           glob.glob(os.path.join(project_dir, '*.js'))

for f in sorted(js_files):
    check_bracket_balance(f)

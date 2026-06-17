import os
import sys

def search_directory(directory, search_string):
    matches = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.js', '.html', '.css')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        for line_number, line in enumerate(f, 1):
                            if search_string.lower() in line.lower():
                                matches.append(f"{file_path}:{line_number}:{line.strip()}")
                except Exception as e:
                    pass
    return matches

if __name__ == "__main__":
    directory = "C:\\Users\\Sumit\\.gemini\\antigravity\\scratch\\riskos"
    search_string = "View details"
    results = search_directory(directory, search_string)
    with open("C:\\Users\\Sumit\\.gemini\\antigravity\\scratch\\riskos\\search_results.txt", "w", encoding='utf-8') as f:
        for r in results:
            f.write(r + "\n")

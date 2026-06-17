import os
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

log_file = r"C:\Users\Sumit\.gemini\antigravity\brain\861683bf-f091-40f9-be07-1ac24c14a282\.system_generated\logs\transcript.jsonl"

if not os.path.exists(log_file):
    print("Transcript log file not found")
    exit(1)

keywords = ["color", "colour", "chart", "palette", "theme", "graph", "teal", "accent", "gradient"]

matches = []
with open(log_file, 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            source = data.get("source", "")
            step_type = data.get("type", "")
            
            # Check user prompts
            if source == "USER_EXPLICIT" or step_type == "USER_INPUT":
                content = data.get("content", "")
                if not isinstance(content, str):
                    continue
                    
                found = False
                for kw in keywords:
                    if kw in content.lower():
                        found = True
                        break
                        
                if found:
                    step_idx = data.get("step_index", idx)
                    matches.append((step_idx, content.strip()))
        except Exception as e:
            pass

print(f"Found {len(matches)} user messages mentioning color/chart keywords:")
for step_idx, content in matches:
    print(f"\n--- Step {step_idx} ---")
    print(content)
    print("-" * 50)

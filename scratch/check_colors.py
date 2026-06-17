import os
import json

log_file = r"C:\Users\Sumit\.gemini\antigravity\brain\861683bf-f091-40f9-be07-1ac24c14a282\.system_generated\logs\transcript.jsonl"

if not os.path.exists(log_file):
    print("Transcript log file not found")
    exit(1)

keywords = ["color", "colour", "chart", "palette", "graph", "accent"]

matches = []
with open(log_file, 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            content = ""
            if "content" in data and isinstance(data["content"], str):
                content = data["content"]
            elif "tool_calls" in data:
                content = json.dumps(data["tool_calls"])
            
            # Check if any keyword matches
            found = False
            for kw in keywords:
                if kw in content.lower():
                    found = True
                    break
            
            if found:
                # Store the type, source and a brief snippet of content
                source = data.get("source", "UNKNOWN")
                step_idx = data.get("step_index", idx)
                snippet = content[:300].replace("\n", " ")
                matches.append((step_idx, source, snippet))
        except Exception as e:
            pass

print(f"Found {len(matches)} matching logs:")
for step_idx, source, snippet in matches[:50]:
    print(f"Step {step_idx} [{source}]: {snippet}...")

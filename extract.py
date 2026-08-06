import json
import sys

log_path = r'C:\Users\usebi\.gemini\antigravity\brain\e740cc3d-f265-4217-acb5-552384a77620\.system_generated\logs\transcript_full.jsonl'
try:
    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            if not line.strip(): continue
            try:
                entry = json.loads(line)
                if 'tool_calls' in entry:
                    for call in entry['tool_calls']:
                        if call['name'] in ['replace_file_content', 'multi_replace_file_content', 'write_to_file']:
                            args = call.get('args', {})
                            if args.get('TargetFile', '').endswith('ChampionshipDetailPage.tsx'):
                                print(f"Step {entry.get('step_index')}: {call['name']}")
                                if call['name'] == 'write_to_file':
                                    print('Found write_to_file!')
                                elif call['name'] == 'replace_file_content':
                                    print(args.get('ReplacementContent', '')[:100].replace('\n', ' '))
                                elif call['name'] == 'multi_replace_file_content':
                                    print(f"Chunks: {len(args.get('ReplacementChunks', []))}")
            except Exception as e:
                pass
except FileNotFoundError:
    print("Transcript not found")

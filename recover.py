import json

log_path = r'C:\Users\usebi\.gemini\antigravity\brain\e740cc3d-f265-4217-acb5-552384a77620\.system_generated\logs\transcript_full.jsonl'
content = ""

try:
    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            if not line.strip(): continue
            try:
                entry = json.loads(line)
                if 'tool_calls' in entry:
                    for call in entry['tool_calls']:
                        args = call.get('args', {})
                        if args.get('TargetFile', '').endswith('ChampionshipDetailPage.tsx'):
                            
                            if call['name'] == 'write_to_file':
                                content = args.get('CodeContent', '')
                            
                            elif call['name'] == 'replace_file_content':
                                start_line = args.get('StartLine', 1) - 1
                                end_line = args.get('EndLine', 1)
                                target = args.get('TargetContent', '')
                                replacement = args.get('ReplacementContent', '')
                                
                                lines = content.split('\n')
                                section = '\n'.join(lines[start_line:end_line])
                                if target in section:
                                    new_section = section.replace(target, replacement)
                                    lines = lines[:start_line] + new_section.split('\n') + lines[end_line:]
                                    content = '\n'.join(lines)
                                else:
                                    # Fallback
                                    content = content.replace(target, replacement)
                                    
                            elif call['name'] == 'multi_replace_file_content':
                                chunks = args.get('ReplacementChunks', [])
                                # Sort chunks in reverse order by start_line so we don't mess up indices
                                chunks.sort(key=lambda x: x.get('StartLine', 1), reverse=True)
                                
                                for chunk in chunks:
                                    start_line = chunk.get('StartLine', 1) - 1
                                    end_line = chunk.get('EndLine', 1)
                                    target = chunk.get('TargetContent', '')
                                    replacement = chunk.get('ReplacementContent', '')
                                    
                                    lines = content.split('\n')
                                    section = '\n'.join(lines[start_line:end_line])
                                    if target in section:
                                        new_section = section.replace(target, replacement)
                                        lines = lines[:start_line] + new_section.split('\n') + lines[end_line:]
                                        content = '\n'.join(lines)
                                    else:
                                        content = content.replace(target, replacement)
            except Exception as e:
                pass
                
    with open('recovered.tsx', 'w', encoding='utf-8') as out:
        out.write(content)
        
    print("Recovered file saved to recovered.tsx")
except Exception as e:
    print(e)

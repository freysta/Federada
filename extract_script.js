const fs = require('fs');

const logPath = 'C:\\Users\\usebi\\.gemini\\antigravity\\brain\\e740cc3d-f265-4217-acb5-552384a77620\\.system_generated\\logs\\transcript_full.jsonl';
const targetFile = 'C:\\Users\\usebi\\Documents\\antigravity\\keen-hopper\\Federada\\web\\src\\pages\\ChampionshipDetailPage.tsx';

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
let lastCode = '';

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const entry = JSON.parse(line);
    
    // Check for tool calls
    if (entry.tool_calls && entry.tool_calls.length > 0) {
      for (const call of entry.tool_calls) {
        if (call.name === 'replace_file_content' || call.name === 'multi_replace_file_content') {
           if (call.args && call.args.TargetFile === targetFile) {
              // This is complicated because replace_file_content doesn't have the full file, it only has chunks.
              // We need write_to_file
           }
        }
        if (call.name === 'write_to_file' && call.args && call.args.TargetFile === targetFile) {
           lastCode = call.args.CodeContent;
        }
      }
    }
  } catch (e) {}
}

fs.writeFileSync('last_code.txt', lastCode || 'NO_WRITE_TO_FILE_FOUND');

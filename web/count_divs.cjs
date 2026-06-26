const fs = require('fs');
const content = fs.readFileSync('C:/Users/usebi/Documents/antigravity/keen-hopper/Federada/web/src/pages/ChampionshipsPage.tsx', 'utf8');

// Strip out comments and strings to avoid false positives
let cleanContent = content.replace(/\/\*[\s\S]*?\*\//g, '');
cleanContent = cleanContent.replace(/\/\/.*/g, '');
cleanContent = cleanContent.replace(/`[\s\S]*?`/g, '');
cleanContent = cleanContent.replace(/"[^"]*"/g, '');
cleanContent = cleanContent.replace(/'[^']*'/g, '');

const opens = (cleanContent.match(/<div/g) || []).length;
const closes = (cleanContent.match(/<\/div>/g) || []).length;

const fragOpens = (cleanContent.match(/<>/g) || []).length;
const fragCloses = (cleanContent.match(/<\/>/g) || []).length;

console.log('divs:', opens, 'opens', closes, 'closes');
console.log('fragments:', fragOpens, 'opens', fragCloses, 'closes');

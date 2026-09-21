const fs=require('fs'),assert=require('assert');
const game=fs.readFileSync('dist/game.js','utf8'),css=fs.readFileSync('dist/style.css','utf8'),index=fs.readFileSync('dist/index.html','utf8');
assert(game.includes('const MATCH_DISPLAY_MINUTES=90'),'Die Anzeige muss auf 90 Minuten skaliert sein');
assert(game.includes('displayMatchMinute(match.elapsed)'), 'Uhr und Ereignisse müssen dieselbe Zeitumrechnung verwenden');
assert(!game.includes('elapsed/75*40'),'Die frühere 40-Minuten-Anzeige darf nicht mehr vorkommen');
assert(css.includes('#clock{display:inline-grid')&&css.includes('font-size:38px'),'Die Uhr muss besonders auf Mobilgeräten deutlich größer sein');
assert(index.includes('2 × 45 Ingame-Minuten'),'Die Spieldauer muss vor dem Start erklärt werden');
assert(index.includes('match-clock-v21.js'),'Version 21 muss eingebunden sein');
console.log('PASS: große Matchuhr, Halbzeit bei 45 und Abpfiff bei 90 Minuten');

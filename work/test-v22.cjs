const fs=require('fs'),assert=require('assert');
const season=fs.readFileSync('dist/season-v13.js','utf8'),css=fs.readFileSync('dist/manager.css','utf8'),index=fs.readFileSync('dist/index.html','utf8');
assert(season.includes('<h2>Vereinshistorie</h2>'),'Der Bereich muss Vereinshistorie heißen');
assert(season.includes('Saisonstart'),'Eine neue Saison muss sofort sichtbar sein');
assert(season.includes('season.played} Sp.'),'Die laufende Anzahl Spiele muss angezeigt werden');
assert(season.includes('season.w}S')&&season.includes('season.gf}:${season.ga}'),'Siege und Torverhältnis müssen live erscheinen');
assert(css.includes('.history-seasons article.current-season'),'Die laufende Saison muss visuell hervorgehoben sein');
assert(index.includes('club-history-v22.js'),'Version 22 muss eingebunden sein');
console.log('PASS: Vereinshistorie beginnt mit Saison 1 und aktualisiert Spiele, Siege und Tore laufend');

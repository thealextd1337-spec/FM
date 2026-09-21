const fs=require('fs'),assert=require('assert');
const game=fs.readFileSync('dist/game.js','utf8'),index=fs.readFileSync('dist/index.html','utf8');
assert(game.includes("short:'INDIVIDUELL'"));
assert(!game.includes("short:'FREI'"));
assert(index.includes('formation-label-v23.js'));
console.log('PASS: Eigene Rasteraufstellung wird im Spiel als INDIVIDUELL bezeichnet');

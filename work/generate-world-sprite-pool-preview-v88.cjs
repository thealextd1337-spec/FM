const fs=require('fs');const vm=require('vm');
const escapeHTML=value=>String(value).replace(/[&"<>]/g,char=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[char]));
const ctx=vm.createContext({crypto:{randomUUID:()=> 'pool-preview'},escapeHTML});
for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js','world-nationalities-v79.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),ctx);
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),ctx);
const sprites=fs.readFileSync('dist/world-sprites-v82.js','utf8');vm.runInContext(sprites.slice(0,sprites.indexOf('const v82BaseOpenPlayerProfile=')),ctx);
for(const file of ['world-sprites-v85.js','world-sprites-v86.js','world-sprites-v87.js','world-sprites-v88.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),ctx);
const source=vm.runInContext('v61CreateCareer("GER-2","pool-preview").world.clubs[0].roster[0]',ctx);
const sprite=vm.runInContext('v82SpriteSVG',ctx);
const appearances=vm.runInContext('v61AuthoredFaces',ctx);
const kits=[{name:'Hell · einfarbig',kit:{main:'#e8edf0',pattern:'#17365c',accent:'#e8c268',style:'solid'},skinTone:'fair',hairColor:'blond'},
 {name:'Dunkel · feine Streifen',kit:{main:'#18284a',pattern:'#f4e7c7',accent:'#f0cd74',style:'pinstripes'},skinTone:'deep',hairColor:'black'}];
const rows=Object.keys(appearances).map(pair=>{
 const cards=kits.map(v=>{const player={...source,name:'M. Berger',n:14,appearance:{...source.appearance,...appearances[pair],skinTone:v.skinTone,hairColor:v.hairColor}};const portrait=sprite(player,v.kit,'portrait'),goal=sprite(player,v.kit,'celebration');if(!portrait.includes(`data-v87-pair="${pair}"`)||!goal.includes(`data-v87-pair="${pair}"`))throw Error(`Bildpaar ${pair} wurde nicht gewaehlt`);return `<article><h3>${v.name}</h3><div>${portrait}${goal}</div></article>`}).join('');
 return `<section><h2>${pair.toUpperCase()}</h2><div class="cards">${cards}</div></section>`;
}).join('');
fs.writeFileSync('dist/player-pool-preview-v88.html',`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;padding:16px;background:#122b37;color:#fff;font:14px system-ui}h1{font-size:24px}h2{margin:2px 0 8px}h3{margin:2px 0 8px;font-size:14px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}section{border:1px solid #577a83;padding:10px;background:#1c3b45}.cards{display:grid;grid-template-columns:1fr 1fr;gap:10px}article{border:1px solid #45636a;padding:5px}article div{display:flex;align-items:end}svg{width:150px;height:150px;image-rendering:pixelated}@media(max-width:780px){.grid{grid-template-columns:1fr}}</style></head><body><h1>Acht Bildpaare · Spielgröße</h1><main class="grid">${rows}</main></body></html>`);
console.log('dist/player-pool-preview-v88.html');

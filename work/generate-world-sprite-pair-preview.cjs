const fs=require('fs');
const vm=require('vm');

const context=vm.createContext({crypto:{randomUUID:()=> 'pair-preview'},escapeHTML:value=>String(value).replace(/[&"<>]/g,char=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[char]))});
for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js','world-nationalities-v79.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
const sprites=fs.readFileSync('dist/world-sprites-v82.js','utf8');
vm.runInContext(sprites.slice(0,sprites.indexOf('const v82BaseOpenPlayerProfile=')),context);
for(const file of ['world-sprites-v85.js','world-sprites-v86.js','world-sprites-v87.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);

const career=vm.runInContext('v61CreateCareer("ENG-2","pair-preview")',context);
const club=career.world.clubs.find(item=>item.id==='ENG-2');
const sourcePlayer=club.roster.find(item=>!item.keeper);
const sprite=vm.runInContext('v82SpriteSVG',context);
const profiles=vm.runInContext('v87PairProfiles',context);
const faceFields=['hairstyle','pose','faceShape','eyeBrows','nose','mouth','facialHair'];
const kits=[
 {name:'Dunkelblau · Nadelstreifen',kit:{main:'#14316c',pattern:'#d6bf83',accent:'#edcf86',style:'pinstripes'},skinTone:'medium',hairColor:'dark-brown'},
 {name:'Hellblau · einfarbig',kit:{main:'#a9dbea',pattern:'#ffffff',accent:'#17345b',style:'solid'},skinTone:'fair',hairColor:'brown'},
 {name:'Rot · Querstreifen',kit:{main:'#a9293f',pattern:'#f3e7cc',accent:'#f3e7cc',style:'hoops'},skinTone:'brown',hairColor:'black'},
 {name:'Grün · einfarbig',kit:{main:'#168765',pattern:'#f1eee5',accent:'#e3c765',style:'solid'},skinTone:'deep',hairColor:'black'}
];
const poses={a:'Beide Fäuste oben',b:'Arme weit',c:'Faust vor der Brust',d:'Zwei Zeigefinger oben'};
const cards=Object.entries(profiles).map(([pair,profile],index)=>{const {name,kit,skinTone,hairColor}=kits[index];const face=Object.fromEntries(faceFields.map(field=>[field,profile[field]]));const sample={...sourcePlayer,name:'M. Berger',n:14,appearance:{...sourcePlayer.appearance,...face,skinTone,hairColor}};return `<article class="card"><h2>${poses[pair]} · ${name}</h2><div class="views"><figure class="portrait">${sprite(sample,kit,'portrait')}<figcaption>Profil · 156 px</figcaption></figure><figure class="goal">${sprite(sample,kit,'celebration')}<figcaption>Torbanner · 260 px</figcaption></figure><figure class="mobile">${sprite(sample,kit,'celebration')}<figcaption>Mobil · 150 px</figcaption></figure></div></article>`}).join('');
const html=`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Spielerbildpaare · Laufzeitvorschau</title><style>*{box-sizing:border-box}body{margin:0;padding:20px;background:#101f23;color:#eef5e9;font:14px system-ui,sans-serif}main{max-width:1040px;margin:auto}h1{font-size:24px;margin:0 0 7px}p{margin:0 0 18px;color:#bad4c8;line-height:1.4}.card{padding:14px;margin:0 0 16px;background:#183437;border:1px solid #6a9180;border-radius:8px}.card h2{font-size:16px;margin:0 0 12px}.views{display:flex;align-items:end;gap:18px;flex-wrap:wrap}.views figure{margin:0;text-align:center}.views svg{display:block;image-rendering:pixelated}.portrait svg{width:156px;height:156px}.goal svg{width:260px;height:260px}.mobile svg{width:150px;height:150px}figcaption{color:#bbd7cb;font-size:12px;margin-top:5px}@media(max-width:520px){body{padding:10px}.views{gap:8px}.goal svg{width:150px;height:150px}}</style></head><body><main><h1>Vier Spielerbildpaare im Laufzeit-Renderer</h1><p>Je Pose dasselbe Gesicht im frontalen Profil und beim Jubel. Trikotfarben, Muster und die Nummer 14 kommen aus Spieldaten.</p>${cards}</main></body></html>`;
fs.writeFileSync('dist/player-pair-preview.html',html);
console.log('dist/player-pair-preview.html erzeugt');

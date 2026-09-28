const fs=require('fs');
const vm=require('vm');

const escapeHTML=value=>String(value).replace(/[&"<>]/g,char=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[char]));
const context=vm.createContext({crypto:{randomUUID:()=> 'mask-variants'},escapeHTML});
for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js','world-nationalities-v79.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
const sprites=fs.readFileSync('dist/world-sprites-v82.js','utf8');
vm.runInContext(sprites.slice(0,sprites.indexOf('const v82BaseOpenPlayerProfile=')),context);
for(const file of ['world-sprites-v85.js','world-sprites-v86.js','world-sprites-v87.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);

const career=vm.runInContext('v61CreateCareer("GER-2","mask-variants")',context);
const source=career.world.clubs.find(club=>club.id==='GER-2').roster.find(player=>!player.keeper);
const profiles=vm.runInContext('v87PairProfiles',context);
const sprite=vm.runInContext('v82SpriteSVG',context);
const faceFields=['hairstyle','pose','faceShape','eyeBrows','nose','mouth','facialHair'];
const poses={a:'Beide Fäuste',b:'Arme weit',c:'Faust vor der Brust',d:'Zwei Zeigefinger'};
const variants=[
 {label:'Hell · Nr. 8',kit:{main:'#e8edf0',pattern:'#17365c',accent:'#e8c268',style:'solid'},skinTone:'fair',hairColor:'blond',n:8},
 {label:'Dunkel · Nr. 14',kit:{main:'#18284a',pattern:'#f4e7c7',accent:'#f0cd74',style:'pinstripes'},skinTone:'deep',hairColor:'black',n:14},
 {label:'Rot · Nr. 27',kit:{main:'#b1263e',pattern:'#f7e7d1',accent:'#f7e7d1',style:'hoops'},skinTone:'medium',hairColor:'auburn',n:27}
];
const rows=Object.entries(profiles).map(([pair,profile])=>{
 const face=Object.fromEntries(faceFields.map(field=>[field,profile[field]]));
 const cards=variants.map(variant=>{
  const player={...source,name:'M. Berger',n:variant.n,appearance:{...source.appearance,...face,skinTone:variant.skinTone,hairColor:variant.hairColor}};
  return `<article><h3>${variant.label}</h3><div class="views"><figure>${sprite(player,variant.kit,'portrait')}<figcaption>Profil</figcaption></figure><figure>${sprite(player,variant.kit,'celebration')}<figcaption>Tor</figcaption></figure></div></article>`;
 }).join('');
 return `<section><h2>${poses[pair]}</h2><div class="variants">${cards}</div></section>`;
}).join('');
const html=`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vier Bildpaare · Farbprüfung</title><style>*{box-sizing:border-box}body{margin:0;padding:18px;background:#132630;color:#f5f3e9;font:14px system-ui,sans-serif}main{max-width:1180px;margin:auto}h1{margin:0 0 8px;font-size:24px}p{margin:0 0 18px;color:#bdcfc9}section{border:1px solid #638b85;background:#1d383e;margin:0 0 13px;padding:10px}h2{font-size:17px;margin:0 0 8px}h3{font-size:13px;margin:0 0 3px}.variants{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}article{padding:7px;border:1px solid #49676a;background:#193036}.views{display:flex;align-items:end;gap:6px}.views figure{margin:0;text-align:center}.views svg{display:block;image-rendering:pixelated;width:140px;height:140px}figcaption{font-size:11px;color:#adc7c4}@media(max-width:680px){.variants{grid-template-columns:1fr}.views svg{width:120px;height:120px}}</style></head><body><main><h1>Farbmasken: vier Posen, drei Paletten</h1><p>Profil und Torbild verwenden feste Pixelmasken. Haut, Haare, Trikot und Nummer stammen aus Spielerdaten.</p>${rows}</main></body></html>`;
fs.writeFileSync('dist/player-mask-variants-v87.html',html);
console.log('dist/player-mask-variants-v87.html erzeugt');

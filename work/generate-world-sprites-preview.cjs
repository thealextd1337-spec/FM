const fs=require('fs');
const vm=require('vm');

const escapeHTML=value=>String(value).replace(/[&"<>]/g,char=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[char]));
const context=vm.createContext({crypto:{randomUUID:()=> 'sprite-preview'},escapeHTML});
for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js','world-nationalities-v79.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
const sprites=fs.readFileSync('dist/world-sprites-v82.js','utf8');
vm.runInContext(sprites.slice(0,sprites.indexOf('const v82BaseOpenPlayerProfile=')),context);
vm.runInContext(fs.readFileSync('dist/world-sprites-v85.js','utf8'),context);
vm.runInContext(fs.readFileSync('dist/world-sprites-v86.js','utf8'),context);
vm.runInContext(fs.readFileSync('dist/world-sprites-v87.js','utf8'),context);
const career=vm.runInContext('v61CreateCareer("GER-2","sprite-preview")',context);
const sprite=vm.runInContext('v82SpriteSVG',context),styles=vm.runInContext('v61Hairstyles',context),poses=vm.runInContext('v61JubelPoses',context);
const names={buzz:'Kurzrasur',side_part:'Seitenscheitel',medium_waves:'Mittellange Wellen',round_afro:'Runder Afro',cornrows:'Cornrows',textured_crop:'Strukturierter Kurzhaarschnitt',tight_curls:'Kurze Locken',short_locs:'Kurze Locs',long_tied:'Zurückgebunden',bald:'Glatze'};
const poseNames={double_fists:'Beide Fäuste oben',arms_wide:'Arme weit',fist_chest:'Faust vor der Brust',two_fingers_up:'Zwei Zeigefinger hoch'};
const all=career.world.clubs.flatMap(club=>club.roster.map(player=>({player,club})));
const cards=styles.map(style=>{
 const {player,club}=all.find(item=>item.player.appearance.hairstyle===style),kit=player.keeper?club.kits.keepers[0]:club.kits.home;
 return `<article class="card"><h2>${names[style]}</h2><p>${escapeHTML(player.name)} · ${escapeHTML(club.name)}</p><div class="pair"><figure>${sprite(player,kit)}<figcaption>Profil</figcaption></figure><figure>${sprite(player,kit,'celebration')}<figcaption>Tor</figcaption></figure></div></article>`;
}).join('');
const demo=all.find(item=>!item.player.keeper),poseCards=poses.map(pose=>{
 const player={...demo.player,appearance:{...demo.player.appearance,pose}};
 return `<article class="pose"><h3>${poseNames[pose]}</h3><div class="goal"><div class="sprite">${sprite(player,demo.club.kits.home,'celebration')}</div><div class="goal-info"><strong>TOOOOR!</strong><span>${escapeHTML(player.name)}</span><b>0 : 1</b><small>5 Tore - Liga 1</small></div><div class="crest">${vm.runInContext('v61CrestSVG',context)(demo.club)}</div></div></article>`;
}).join('');
const html=`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Spieler-Sprites der Vereinswelt</title><style>*{box-sizing:border-box}body{margin:0;padding:20px;background:#101f23;color:#eaf2e8;font:14px system-ui,sans-serif}main{max-width:1100px;margin:auto}h1{font-size:24px}h2{font-size:15px;margin:0 0 4px}h3{font-size:13px;margin:0 0 7px}p{color:#b7cbc0;line-height:1.5}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(195px,1fr));gap:10px}.card,.pose{padding:12px;border:1px solid #54766a;border-radius:8px;background:#1c3435}.card p{font-size:11px;margin:0 0 8px}.pair{display:flex;align-items:end;gap:12px}.pair figure{margin:0;text-align:center}.pair svg{width:80px;height:80px;image-rendering:pixelated}.pair figure:last-child svg{width:96px;height:96px}figcaption{font-size:10px;color:#aecbbb}.pose-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:10px}.goal{display:grid;grid-template-columns:120px minmax(0,1fr) 72px;align-items:center;gap:7px;min-height:128px;padding:4px;border:2px solid #e2d05a;background:#17394b;color:#f6f6e8}.goal .sprite,.goal .sprite svg{width:120px;height:120px}.goal .crest svg{width:70px;height:82px}.goal-info{min-width:0}.goal strong{display:block;color:#ffec77;font-size:25px}.goal span,.goal small,.goal b{display:block}.goal b{font-size:26px;color:#fff078}.goal small{font-size:11px;color:#bdece5}@media(max-width:520px){body{padding:10px}.pose-grid{grid-template-columns:1fr}.goal{grid-template-columns:86px minmax(0,1fr) 52px;min-height:94px;gap:4px}.goal .sprite,.goal .sprite svg{width:86px;height:86px}.goal .crest svg{width:50px;height:59px}.goal strong{font-size:19px}.goal b{font-size:20px}.goal small{font-size:9px}}section{margin-top:26px}</style></head><body><main><h1>Spieler-Sprites der Vereinswelt</h1><p>Zehn Frisuren mit je zwei gerenderten Ansichten. Beide verwenden gespeicherte Gesichtsmerkmale und aktuelle Vereinsfarben. Die Jubelpose zeigt eine Faust vor der Brust; beide Bilder bleiben ohne gezeichnete Trikotnummer.</p><section><h2>Frisuren</h2><div class="grid">${cards}</div></section><section><h2>Jubelpose: Faust vor der Brust</h2><div class="pose-grid">${poseCards}</div></section></main></body></html>`;
const reviewHtml=html.replace('</style>','.grid{grid-template-columns:repeat(auto-fit,minmax(320px,1fr))}.pair svg{width:156px;height:156px}.pair figure:last-child svg{width:100px;height:100px}</style>');
fs.writeFileSync('docs/spieler-sprites-vorschau.html',reviewHtml.replaceAll('href="sprites/','href="../dist/sprites/'));
const examples=['buzz','round_afro','long_tied'].map((style,index)=>{
 const {player,club}=all.find(item=>item.player.appearance.hairstyle===style),kit=player.keeper?club.kits.keepers[0]:club.kits.home;
 const at=(mode,x,y,size)=>sprite(player,kit,mode).replace('<svg class="v82-sprite"',`<svg x="${x}" y="${y}" width="${size}" height="${size}" class="v82-sprite"`);
 const x=20+index*260;
 return `<rect x="${x}" y="16" width="240" height="254" rx="6" fill="#243b3d" stroke="#698d7b"/><text x="${x+12}" y="39" fill="#f3f5e8" font-size="15" font-weight="bold">${names[style]}</text><text x="${x+12}" y="58" fill="#bed0c4" font-size="11">${escapeHTML(player.name)}</text>${at('portrait',x+8,68,156)}${at('celebration',x+146,115,96)}<text x="${x+56}" y="251" fill="#bed0c4" font-size="11">Profil</text><text x="${x+164}" y="251" fill="#bed0c4" font-size="11">Tor</text>`;
}).join('');
fs.writeFileSync('docs/spieler-sprites-beispiele.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 285" font-family="Arial, sans-serif" role="img" aria-label="Drei Beispielspieler mit frontalem Profil und Jubelpose"><rect width="800" height="285" fill="#14282c"/>${examples}</svg>\n`.replaceAll('href="sprites/','href="../dist/sprites/'));
console.log('docs/spieler-sprites-vorschau.html und docs/spieler-sprites-beispiele.svg erzeugt');

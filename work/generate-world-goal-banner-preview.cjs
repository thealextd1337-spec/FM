const fs=require('fs');
const vm=require('vm');

const escapeHTML=value=>String(value).replace(/[&"<>]/g,char=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[char]));
const context=vm.createContext({crypto:{randomUUID:()=> 'goal-banner-preview'},escapeHTML});
for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js','world-nationalities-v79.js']){
 vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
}
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
const sprites=fs.readFileSync('dist/world-sprites-v82.js','utf8');
vm.runInContext(sprites.slice(0,sprites.indexOf('const v82BaseOpenPlayerProfile=')),context);
for(const file of ['world-sprites-v85.js','world-sprites-v86.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
vm.runInContext(fs.readFileSync('dist/world-sprites-v87.js','utf8'),context);
vm.runInContext(fs.readFileSync('dist/world-sprites-v88.js','utf8'),context);
vm.runInContext(fs.readFileSync('dist/world-sprites-v89.js','utf8'),context);

const career=vm.runInContext('v61CreateCareer("GER-2","goal-banner-preview")',context);
const club=career.world.clubs.find(item=>item.id==='ENG-2');
const sourcePlayer=club.roster.find(item=>!item.keeper);
const pairArg=process.argv.find(argument=>argument.startsWith('--pair'));
const pair=pairArg?pairArg.split('=')[1]||'a':null;
const profiles=vm.runInContext('v87PairProfiles',context);
const faceFields=['hairstyle','pose','faceShape','eyeBrows','nose','mouth','facialHair'];
if(pair&&!profiles[pair])throw Error(`Unbekanntes Bildpaar: ${pair}`);
const selectedPair=pair||'c';
const pose=process.argv.slice(2).find(argument=>!argument.startsWith('--'))||profiles[selectedPair].pose;
if(!['double_fists','arms_wide','fist_chest','two_fingers_up'].includes(pose))throw Error(`Unbekannte Jubelpose: ${pose}`);
const face=Object.fromEntries(faceFields.map(field=>[field,profiles[selectedPair][field]]));
const sampleColors={a:{skinTone:'medium',hairColor:'dark-brown'},b:{skinTone:'medium',hairColor:'dark-brown'},c:{skinTone:'light',hairColor:'dark-brown'},d:{skinTone:'brown',hairColor:'black'}};
const family={e:'a',f:'d',g:'b',h:'d',i:'b',j:'c',k:'b',l:'d'}[selectedPair]||selectedPair[0];
const player={...sourcePlayer,name:'M. Berger',appearance:{...sourcePlayer.appearance,...face,...sampleColors[family],pose}};
const sprite=vm.runInContext('v82SpriteSVG',context)(player,club.kits.home,'celebration');
if(pair&&!sprite.includes(`data-v87-pair="${pair}"`))throw Error(`Bildpaar ${pair} wurde nicht gewaehlt`);
const crest=vm.runInContext('v61CrestSVG',context)(club);
const bannerSource=fs.readFileSync('dist/world-goal-banner-v84.js','utf8');
const css=bannerSource.match(/v84Style\.textContent=`([\s\S]*?)`;/)?.[1];
if(!css||!sprite)throw Error('Torbanner-Stil oder Jubel-Sprite fehlt');

const html=`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Doppel 6 · Torbanner in Spielgröße</title><link rel="stylesheet" href="style.css"><style>
body{background:#101f23;color:#eaf2e8;font:14px system-ui,sans-serif}
.preview{max-width:760px;margin:24px auto;padding:0 12px}
.preview h1{font:700 23px system-ui,sans-serif;margin:0 0 7px}
.preview p{margin:0 0 12px;color:#c2d8d1;line-height:1.4}
.v42-pitch-stage{position:relative;min-height:350px;background:repeating-linear-gradient(#214e43 0 56px,#245446 56px 112px)}
.v82-sprite{display:block;width:100%;height:100%;image-rendering:pixelated}
${css}
</style></head><body class="v65-world-match"><main class="preview"><h1>Torbanner in Spielgröße</h1><p>Das Banner nutzt den aktuellen Renderer, einen Beispielspieler und dessen echtes Vereinswappen. Fensterbreite ändern, um die Mobilansicht zu prüfen.</p><section id="match-area"><div class="v42-pitch-stage"><div id="match-overlay" class="match-overlay goal v84-goal-banner v82-has-sprite" role="status"><span class="v82-goal-sprite">${sprite}</span><strong id="overlay-title"><span class="v84-goal-word">TOOOOR!</span></strong><span id="overlay-copy" aria-hidden="true"></span><div class="v84-goal-decor" aria-hidden="true"><i class="v84-pattern v84-pattern-tl"></i><i class="v84-pattern v84-pattern-tr"></i><i class="v84-pattern v84-pattern-br"></i><i class="v84-accent v84-accent-left"></i><i class="v84-accent v84-accent-right"></i><i class="v84-corner v84-corner-tl"></i><i class="v84-corner v84-corner-tr"></i><i class="v84-corner v84-corner-bl"></i><i class="v84-corner v84-corner-br"></i></div><div class="v84-goal-details"><span class="v84-scorer">${escapeHTML(player.name)}</span><span class="v84-score">0:1</span><span class="v84-goals">5 Tore - Liga 1</span></div><div class="v84-goal-logo">${crest}</div><div class="v84-goal-strips" aria-hidden="true"><i></i><b></b><i></i></div></div></div></section></main></body></html>`;
const target=pair?`dist/goal-banner-preview-pair-${pair}.html`:'dist/goal-banner-preview.html';
fs.writeFileSync(target,html);
console.log(`${target} erzeugt`);

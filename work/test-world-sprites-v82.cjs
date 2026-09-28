const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const context=vm.createContext({crypto:{randomUUID:()=> 'sprite-test'},escapeHTML:value=>String(value).replace(/[&"<>]/g,char=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[char]))});
for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js','world-nationalities-v79.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
const sprites=fs.readFileSync('dist/world-sprites-v82.js','utf8');
vm.runInContext(sprites.slice(0,sprites.indexOf('const v82BaseOpenPlayerProfile=')),context);
vm.runInContext(fs.readFileSync('dist/world-sprites-v85.js','utf8'),context);
vm.runInContext(fs.readFileSync('dist/world-sprites-v86.js','utf8'),context);
vm.runInContext(fs.readFileSync('dist/world-sprites-v87.js','utf8'),context);
vm.runInContext(fs.readFileSync('dist/world-sprites-v88.js','utf8'),context);
vm.runInContext(fs.readFileSync('dist/world-sprites-v89.js','utf8'),context);
const sprite=vm.runInContext('v82SpriteSVG',context),profileKit=vm.runInContext('v82ProfileKit',context);
const career=vm.runInContext('v61CreateCareer("GER-2","sprite-world")',context);
const players=career.world.clubs.flatMap(club=>club.roster);
const own=career.world.clubs.find(club=>club.id==='GER-2');
const keeper=own.roster.find(player=>player.keeper),field=own.roster.find(player=>!player.keeper);
assert.strictEqual(profileKit(keeper,own).id,own.kits.keepers[0].id,'Profil des Torwarts trägt erstes Torwarttrikot');
assert.strictEqual(profileKit(field,own).main,own.kits.home.main,'Profil eines Feldspielers trägt Heimtrikot');
assert.strictEqual(profileKit(field,null).main,'#667487','Vereinslose erhalten neutrales Trikot');
const portraits=new Set();
for(const player of players.slice(0,120)){
 const copy={...player,n:9},portrait=sprite(copy,own.kits.home,'portrait'),celebration=sprite(copy,own.kits.home,'celebration');
 assert(portrait.includes('viewBox="0 0 160 160"')&&portrait.includes('shape-rendering="crispEdges"'));
 assert.strictEqual(sprite({...copy,n:28},own.kits.home,'portrait'),portrait,'Profilbild enthält keine Nummer');
 assert.strictEqual(sprite({...copy,n:28},own.kits.home,'celebration'),celebration,'Jubelbild enthält keine Nummer');
 assert(celebration.includes('Jubelpose von '+player.name.replace(/&/g,'&amp;')),'Jubelpose ist zugänglich beschriftet');
 assert.strictEqual(portrait.match(/data-v85-face="(\d+)"/)[1],celebration.match(/data-v85-face="(\d+)"/)[1],'beide Sprites haben dieselben Gesichtsmerkmale');
 portraits.add(portrait);
}
assert(portraits.size>=110,'mindestens 110 von 120 Profilen sind in Spielgröße strukturell verschieden');
for(const pose of vm.runInContext('v61JubelPoses',context)){
 const player={...field,appearance:{...field.appearance,pose}};
 const celebration=sprite(player,own.kits.home,'celebration');
 assert(celebration!==sprite(player,own.kits.home,'portrait')&&celebration.includes(`data-v86-pose="${pose}"`),`${pose}: Jubelpose sichtbar verschieden`);
}
const lightCelebration=sprite(field,{...own.kits.home,main:'#b5d8ea'},'celebration');
assert.notStrictEqual(lightCelebration,sprite(field,own.kits.home,'celebration'),'helle Trikots behalten ihre aktuelle Farbe');
const pairPlayer={...field,n:14,appearance:{...field.appearance,hairstyle:'medium_waves',pose:'fist_chest',faceShape:'oval',eyeBrows:'straight',nose:'straight',mouth:'soft',facialHair:'none'}};
const pairProfile=sprite(pairPlayer,own.kits.home,'portrait'),pairGoal=sprite(pairPlayer,own.kits.home,'celebration');
assert(pairProfile.includes('data-v87-pair="c"')&&pairGoal.includes('data-v87-pair="c"'),'hochwertiges Bildpaar nutzt denselben Renderer');
assert(pairProfile.includes('player-pair-c-portrait.png')&&pairGoal.includes('player-pair-c-goal.png'),'Profil und Tor nutzen getrennte Vorlagen');
assert.strictEqual(pairProfile.match(/data-v85-face="(\d+)"/)[1],pairGoal.match(/data-v85-face="(\d+)"/)[1],'das Bildpaar behält dieselbe Identität');
assert.notStrictEqual(sprite(pairPlayer,{...own.kits.home,main:'#f4f1e8'},'celebration'),pairGoal,'Trikotfarbe ändert das Bildpaar');
assert.strictEqual(sprite({...pairPlayer,n:15},own.kits.home,'celebration'),pairGoal,'Trikotnummer ändert das Jubelbild nicht');
assert.notStrictEqual(sprite({...pairPlayer,appearance:{...pairPlayer.appearance,skinTone:'deep',hairColor:'black'}},own.kits.home,'portrait'),pairProfile,'Haut und Haare werden aus Spielermerkmalen gefärbt');
for(const view of ['portrait','goal'])for(const channel of ['','-shirt','-trim','-skin','-hair']){
 assert(fs.existsSync(`dist/sprites/player-pair-c-${view}${channel}.png`),`Bildpaar-Ebene ${view}${channel} vorhanden`);
}
const pairProfiles=vm.runInContext('v87PairProfiles',context);
const pairFaceFields=['hairstyle','pose','faceShape','eyeBrows','nose','mouth','facialHair'];
for(const pair of ['b','c','d']){
 const face=Object.fromEntries(pairFaceFields.map(field=>[field,pairProfiles[pair][field]]));
 const appearance={...field.appearance,...face,skinTone:'medium',hairColor:'dark-brown'};
 const sample={...field,n:27,appearance},portrait=sprite(sample,own.kits.home,'portrait'),goal=sprite(sample,own.kits.home,'celebration');
 assert(portrait.includes(`data-v87-pair="${pair}"`)&&goal.includes(`data-v87-pair="${pair}"`),`${pair}: Profil und Tor nutzen dasselbe Bildpaar`);
 assert(portrait.includes(`player-pair-${pair}-portrait.png`)&&goal.includes(`player-pair-${pair}-goal.png`),`${pair}: getrennte Ansichten`);
 assert.strictEqual(sprite({...sample,n:28},own.kits.home,'portrait'),portrait,`${pair}: Profil bleibt nummernfrei`);
 assert.strictEqual(sprite({...sample,n:28},own.kits.home,'celebration'),goal,`${pair}: Torbild bleibt nummernfrei`);
 assert.strictEqual(portrait.match(/data-v85-face="(\d+)"/)[1],goal.match(/data-v85-face="(\d+)"/)[1],`${pair}: gleiche Spieleridentität`);
 assert.notStrictEqual(sprite(sample,{...own.kits.home,main:'#f4f1e8'},'celebration'),goal,`${pair}: Trikot folgt dem Verein`);
 assert.notStrictEqual(sprite({...sample,appearance:{...appearance,skinTone:'deep',hairColor:'black'}},own.kits.home,'portrait'),portrait,`${pair}: Haut und Haare folgen Spielermerkmalen`);
 for(const view of ['portrait','goal'])for(const channel of ['','-shirt','-trim','-skin','-hair']){
  assert(fs.existsSync(`dist/sprites/player-pair-${pair}-${view}${channel}.png`),`${pair}: Bildpaar-Ebene ${view}${channel} vorhanden`);
 }
}
for(const pair of ['a2','b2','c2','d2','e','f','g','h','i','j','k','l']){
 const face=Object.fromEntries(pairFaceFields.map(feature=>[feature,pairProfiles[pair][feature]]));
 const sample={...field,n:14,appearance:{...field.appearance,...face}};
 const portrait=sprite(sample,own.kits.home,'portrait'),goal=sprite(sample,own.kits.home,'celebration');
 assert(portrait.includes(`data-v87-pair="${pair}"`)&&goal.includes(`data-v87-pair="${pair}"`),`${pair}: Porträt und Jubelbild bleiben ein Paar`);
 assert(portrait.includes(`player-pair-${pair}-portrait.png`)&&goal.includes(`player-pair-${pair}-goal.png`),`${pair}: beide festen Ansichten werden geladen`);
 for(const feature of ['faceShape','eyeBrows','nose','mouth','facialHair']){
  const alternatives={faceShape:'long',eyeBrows:'close-set',nose:'narrow',mouth:'wide',facialHair:'short-beard'};
  const changed={...sample,appearance:{...sample.appearance,[feature]:alternatives[feature]===sample.appearance[feature]?'none':alternatives[feature]}};
  assert(!sprite(changed,own.kits.home,'portrait').includes(`data-v87-pair="${pair}"`),`${pair}: ${feature} darf nicht durch eine fremde Vorlage ersetzt werden`);
 }
 for(const view of ['portrait','goal'])for(const channel of ['','-shirt','-trim','-skin','-hair']){
  assert(fs.existsSync(`dist/sprites/player-pair-${pair}-${view}${channel}.png`),`${pair}: Bildpaar-Ebene ${view}${channel} vorhanden`);
 }
}
assert(!sprite({...pairPlayer,appearance:{...pairPlayer.appearance,nose:'broad'}},own.kits.home,'portrait').includes('data-v87-pair'),'abweichende Gesichtsmerkmale behalten den variablen Renderer');
assert(!sprite({...pairPlayer,appearance:{...pairPlayer.appearance,hairstyle:'side_part'}},own.kits.home,'portrait').includes('data-v87-pair'),'nicht kuratierte Frisur-Pose-Kombinationen behalten den variablen Renderer');
const matched=players.slice(0,120).filter(player=>sprite(player,own.kits.home,'portrait').includes('data-v87-pair')).length;
assert(matched>=20,`der Bildpaar-Pool erreicht reale Spieler (${matched}/120)`);
for(const player of players.slice(0,120)){
 const selected=sprite(player,own.kits.home,'portrait').match(/data-v87-pair="([^"]+)"/)?.[1];
 if(selected)for(const feature of pairFaceFields)assert.strictEqual(player.appearance[feature],pairProfiles[selected][feature],`${selected}: gespeicherte ${feature} im Bild sichtbar`);
}
for(const hairstyle of vm.runInContext('v61Hairstyles',context)){
 const player={...field,appearance:{...field.appearance,hairstyle}};
 assert(sprite(player,own.kits.home,'portrait').includes('Porträt von'),`${hairstyle}: Profilbild vorhanden`);
}
assert(!sprite({...field,appearance:null},own.kits.home),'fehlende Altmerkmale werden nicht ergänzt');
assert(sprite({...field,name:'Anderer Spieler'},own.kits.home,'portrait').includes('Porträt von Anderer Spieler'),'Sprite-Cache erhält den richtigen Namen');
const overlay={html:'',classes:new Set(),querySelector(){return this.html?{remove:()=>{this.html=''}}:null},insertAdjacentHTML(_where,html){this.html=html}};
overlay.classList={add:value=>overlay.classes.add(value),remove:value=>overlay.classes.delete(value)};
context.$=()=>overlay;
context.showOverlay=()=>{};
context.v65WorldActive={};
context.v65Context=()=>({career});
context.match={goals:[{pid:field.pid,team:0}],goalPause:2,kits:{user:{...own.kits.home,trim:own.kits.home.pattern}}};
context.v66Player=(_career,pid)=>pid===field.pid?field:null;
context.v61OpenProfile=()=>{};
context.v68OpenPlayerProfile=()=>{};
context.v61WorldScreen={addEventListener:()=>{}};
context.v61ProfileDialog={querySelector:()=>null};
context.document={createElement:()=>({}),head:{append:()=>{}}};
vm.runInContext(sprites.slice(sprites.indexOf('const v82BaseOpenPlayerProfile=')),context);
vm.runInContext("showOverlay('TOR!', 'Testtor', true)",context);
assert(overlay.classes.has('v82-has-sprite')&&overlay.html.includes('Jubelpose von '+field.name),'Torhinweis bindet Torschützen und feste Pose ein');
assert(overlay.html.includes(sprite(field,context.match.kits.user,'celebration')),'Torhinweis trägt das Matchtrikot');
context.v66Player=(_career,pid)=>pid===field.pid?pairPlayer:null;
vm.runInContext("showOverlay('TOR!', 'Bildpaar-Test', true)",context);
assert(overlay.html.includes('data-v87-pair="c"'),'der echte Torhinweis verwendet das neue Bildpaar');
context.v66Player=(_career,pid)=>pid===field.pid?field:null;
vm.runInContext("showOverlay('ANPFIFF', 'Neustart', false)",context);
assert(!overlay.classes.has('v82-has-sprite')&&!overlay.html,'andere Matchhinweise entfernen die Jubelpose');
const setPieces=fs.readFileSync('dist/set-pieces-v50.js','utf8');
vm.runInContext(setPieces.slice(setPieces.indexOf('function v50Goal('),setPieces.indexOf('function v50GoalKick(')),context);
context.note=()=>{};
context.v50Name=()=>own.name;
context.displayMatchMinute=()=>24;
context.match={goals:[],goalPause:0,score:[0,0],elapsed:24,lastPass:null,kits:{user:own.kits.home}};
context.testScorer={...field,t:0,stats:{goals:0}};
context.testKeeper={stats:{conceded:0}};
vm.runInContext('v50Goal(testScorer,testKeeper)',context);
assert.strictEqual(context.match.goals[0].pid,field.pid,'neue Torereignisse speichern die Torschützen-ID');
assert(overlay.html.includes('Jubelpose von '+field.name),'echter Torablauf zeigt die Jubelpose');
console.log(`Spieler-Sprites: 120 Porträts, 16 Bildpaare, ${matched} kuratierte Treffer, eine neue Pose, zehn Frisuren und Trikotbindung geprüft.`);

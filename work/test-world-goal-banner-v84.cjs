const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const classes=new Set(),overlay={html:'',attributes:{},sprite:true};
const stage={classList:{contains:value=>value==='v42-pitch-stage'},append:node=>{node.parentElement=stage}};
const matchArea={insertBefore:node=>{node.parentElement=matchArea}};
overlay.classList={add:value=>classes.add(value),remove:value=>classes.delete(value)};
overlay.querySelectorAll=()=>overlay.html?[{remove:()=>{overlay.html=''}}]:[];
overlay.querySelector=selector=>selector==='.v82-goal-sprite'&&overlay.sprite?{}:null;
overlay.insertAdjacentHTML=(_position,html)=>{overlay.html=html};
overlay.setAttribute=(key,value)=>{overlay.attributes[key]=value};
overlay.removeAttribute=key=>{delete overlay.attributes[key]};
const title={textContent:'',innerHTML:''},copy={textContent:''};
const career={world:{season:3,competitions:[
 {id:'league-3',type:'league'},{id:'cup-3',type:'cup'},{id:'europe-3',type:'europe'}
]}};
const fixture={id:'current',competitionId:'league-3'};
const player={pid:'p7',n:7,name:'M. Berger',history:[
 {season:3,competitionId:'league-3',fixtureId:'old-1',goals:2},
 {season:3,competitionId:'league-3',fixtureId:'old-2',goals:1},
 {season:3,competitionId:'cup-3',fixtureId:'old-cup',goals:4},
 {season:2,competitionId:'league-2',fixtureId:'previous-season',goals:10},
 {season:3,competitionId:'league-3',fixtureId:'current',goals:2}
]};
const club={id:'new-club',name:'SC Beispiel'};
const physical={goalPause:2,goals:[{pid:'p7',team:0},{pid:'other',team:1},{pid:'p7',team:0}],score:[2,1]};
const context=vm.createContext({
 match:physical,v65WorldActive:{},
 v65Context:()=>({career,fixture}),v65Club:()=>club,
 v66Player:(_career,pid)=>pid==='p7'?player:null,
 v62Current:career=>career.world.competitions,
 v61CrestSVG:club=>`<svg aria-label="Vereinslogo ${club.name}"></svg>`,
 escapeHTML:value=>String(value).replace(/[&"<>]/g,char=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[char])),
 $:selector=>({'#match-overlay':overlay,'#overlay-title':title,'#overlay-copy':copy,'#match-area .v42-pitch-stage':stage,'#match-area':matchArea,'#event':{}})[selector],
 showOverlay:(heading,description)=>{title.textContent=heading;copy.textContent=description},
 document:{createElement:()=>({textContent:''}),head:{append:()=>{}}}
});
const source=fs.readFileSync('dist/world-goal-banner-v84.js','utf8');
vm.runInContext(source,context);
const goals=vm.runInContext('v84SeasonGoals',context);
assert.strictEqual(goals(player,career,fixture,physical),5,'laufendes Ligator zählt einmal, Pokal und Vorjahre nicht');
context.showOverlay('TOR!','Treffer',true);
assert(classes.has('v84-goal-banner')&&!classes.has('v84-no-sprite'));
assert.strictEqual(title.innerHTML,'<span class="v84-goal-word">TOOOOR!</span>');
assert(overlay.html.includes('M. Berger')&&overlay.html.includes('5 Tore - Liga 1'));
assert(overlay.html.includes('2:1')&&overlay.html.includes('Vereinslogo SC Beispiel'));
assert(overlay.html.includes('v84-goal-decor')&&overlay.html.includes('v84-goal-strips'),'Vorlagenornamente erscheinen im Banner');
assert(overlay.html.indexOf('class="v84-score')<overlay.html.indexOf('class="v84-scorer'),'Ergebnis vor Name');
assert(overlay.html.includes('Rückennummer 7')&&overlay.html.includes('#7'),'Rückennummer sichtbar');
assert.strictEqual(overlay.attributes.role,'status');
assert.strictEqual(overlay.parentElement,stage,'Banner liegt am Spielfeld');
overlay.sprite=false;
fixture.competitionId='cup-3';
physical.goals=[{pid:'p7',team:0}];
context.showOverlay('TOR!','Pokaltor',true);
assert(classes.has('v84-no-sprite')&&overlay.html.includes('5 Tore - Nationaler Pokal'));
fixture.competitionId='europe-3';
assert.strictEqual(goals(player,career,fixture,physical),1,'Europacupzählung bleibt separat');
assert(vm.runInContext('v84BannerHTML',context)(player,club,career.world.competitions[2],1,[1,0]).includes('1 Tor - Europacup'),'ein Tor nutzt die Einzahl');
assert(vm.runInContext('v84BannerHTML',context)(player,club,career.world.competitions[0],1,[12,10]).includes('v84-score v84-score-long'),'zweistellige Ergebnisse erhalten kompakte Schrift');
context.showOverlay('ANPFIFF','Neustart',false);
assert(!classes.has('v84-goal-banner')&&!overlay.html&&!overlay.attributes.role,'andere Hinweise räumen den Banner ab');
assert.strictEqual(overlay.parentElement,matchArea,'andere Hinweise nutzen wieder den normalen Matchbereich');
assert(source.includes('prefers-reduced-motion:reduce')&&source.includes('v84GoalRun')&&source.includes('v84GoalBlink'));
const css=vm.runInContext('v84Style.textContent',context);
assert(css.includes('top:50%;bottom:auto;left:50%')&&css.includes('transform:translate(-50%,-50%)'),'Spielfeldmitte');
assert(!css.includes('bottom:-9px')&&css.includes('translate(-50%,-50%) scale(1)'),'Zentrierung mobil und animiert');
assert(css.includes('--v84-sprite-size:260px')&&css.includes('clamp(116px,40vw,150px)'),'Jubelgrafik erhält mehr Platz und wächst mobil');
assert(css.includes('grid-template-columns:var(--v84-sprite-size) minmax(0,1fr) 62px'),'mobiles Raster hält Spieler, Ergebnis und Wappen getrennt');
assert(css.includes('data-v86-pose="arms_wide"')&&css.includes('data-v86-pose="two_fingers_up"'),'breite Posen füllen den Bildbereich vertikal');
assert(css.includes('image-rendering:pixelated')&&css.includes('.v84-goal-strips i:last-child{width:13%}'),'Pixelbild und verkürzter rechter Balken bleiben erhalten');
assert(css.includes('v84-pattern-tl')&&css.includes('v84-accent-left')&&css.includes('top:-19px'),'Pixelmuster, türkisfarbene Akzente und Titel auf dem Rahmen folgen der Vorlage');
assert(css.includes('font:900 36px/43px')&&css.includes('font-size:29px!important;line-height:33px!important'),'TOOOOR! bleibt auf großen und kleinen Bildschirmen größer');
for(const name of ['v84BannerIn','v84DecorIn','v84PlayerIn','v84InfoIn','v84ScoreIn','v84CrestIn','v84StripeIn','v84NeonPulse']){
 assert(css.includes(`@keyframes ${name}`),`${name} animiert den Banner`);
}
assert(css.includes('.v84-goal-banner *{animation:none!important;transition:none!important}'),'reduzierte Bewegung schaltet alle Banneranimationen ab');
console.log('Torbanner: Torschütze, Saisonwettbewerbe, Spielstand, Wappen, Animation, Aufräumen und reduzierte Bewegung geprüft.');

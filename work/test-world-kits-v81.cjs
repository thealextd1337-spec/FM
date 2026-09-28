const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const context=vm.createContext({crypto:{randomUUID:()=> 'kit-test'},escapeHTML:value=>String(value).replace(/[&"<>]/g,char=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[char]))});
for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js','world-nationalities-v79.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
const call=(name,...args)=>vm.runInContext(name,context)(...args);
const career=call('v61CreateCareer','GER-2','kit-world');
const styles=new Set(vm.runInContext('v61KitStyles',context));
const palette=vm.runInContext('v61Colors',context);
const all=career.world.clubs;
assert.strictEqual(all.length,48);
assert.strictEqual(new Set(all.map(club=>club.id)).size,48);
assert.strictEqual(Object.keys(vm.runInContext('v61KitTertiary',context)).length,48);
for(const [id,colors] of Object.entries({'ENG-1':'Rot/Weiß','ENG-2':'Himmelblau/Weiß','ESP-1':'Weiß/Gold','ESP-2':'Blau/Karmin','ITA-1':'Schwarz/Weiß','ITA-2':'Blau/Schwarz','GER-1':'Rot/Weiß','GER-2':'Grün/Weiß','FRA-1':'Dunkelblau/Rot','POR-1':'Rot/Weiß','POR-2':'Blau/Weiß'}))assert.strictEqual(all.find(club=>club.id===id).colors,colors,`${id}: klassische Vereinsfarben`);
for(const club of all){
 const kit=club.kits;
 assert(call('v61ValidClubKits',kit),`${club.id}: gespeicherte Trikots gültig`);
 const [primaryName,secondaryName]=club.colors.split('/');
 assert.strictEqual(kit.colors.primary,palette[primaryName],`${club.id}: ursprüngliche Hauptfarbe`);
 assert.strictEqual(kit.colors.secondary,palette[secondaryName],`${club.id}: ursprüngliche Zweitfarbe`);
 assert.strictEqual(new Set(Object.values(kit.colors)).size,3,`${club.id}: drei Farben`);
 assert.strictEqual(kit.home.main,kit.colors.primary);
 assert.strictEqual(kit.home.pattern,kit.colors.secondary);
 assert.strictEqual(kit.home.accent,kit.colors.tertiary);
 assert.strictEqual(kit.away.main,kit.colors.tertiary);
 assert.strictEqual(kit.away.pattern,kit.colors.secondary);
 assert.strictEqual(kit.away.accent,kit.colors.primary);
 assert.notStrictEqual(kit.home.style,kit.away.style,`${club.id}: verschiedene Muster`);
 assert(kit.keepers.every(keeper=>Object.values(kit.colors).every(color=>call('v61KitColorDistance',keeper.main,color)>=100)),`${club.id}: Torwarttrikots heben sich von allen Feldspielerfarben ab`);
 assert(call('v61KitColorDistance',kit.keepers[0].main,kit.keepers[1].main)>=100,`${club.id}: Torwarttrikots unterscheiden sich`);
}
assert.deepStrictEqual(new Set(all.map(club=>club.kits.home.style)),styles,'alle sechs Heim-Mustertypen werden benutzt');
assert.deepStrictEqual(new Set(all.map(club=>club.kits.away.style)),styles,'alle sechs Auswärts-Mustertypen werden benutzt');
for(const own of all)for(const opponent of all){
 if(own===opponent)continue;
 for(const ownIsHome of [true,false]){
  const match=call('v61SelectMatchKits',own,opponent,ownIsHome);
  const ownVariants=[own.kits.home,own.kits.away],opponentVariants=[opponent.kits.home,opponent.kits.away];
  assert(ownVariants.some(kit=>kit.main===match.user.main&&kit.style===match.user.style),`${own.id}: gewähltes Feldspielertrikot gehört zum Verein`);
  assert(opponentVariants.some(kit=>kit.main===match.opponent.main&&kit.style===match.opponent.style),`${opponent.id}: Gegnertrikot gehört zum Verein`);
  assert.strictEqual(match.user.trim,match.user.pattern);
  assert.strictEqual(match.opponent.trim,match.opponent.pattern);
  assert(own.kits.keepers.some(kit=>kit.id===match.userKeeper.id));
  assert(opponent.kits.keepers.some(kit=>kit.id===match.opponentKeeper.id));
  const worn=[match.user.main,match.opponent.main,match.userKeeper.main,match.opponentKeeper.main];
  const separation=Math.min(...worn.flatMap((color,index)=>worn.slice(index+1).map(other=>call('v61KitColorDistance',color,other))));
  assert(separation>=85,`${own.id}/${opponent.id}: alle vier Trikots unterscheidbar`);
  const desiredOwn=own.kits[ownIsHome?'home':'away'],desiredOpponent=opponent.kits[ownIsHome?'away':'home'];
  const preferredCanSeparate=own.kits.keepers.some(userKeeper=>opponent.kits.keepers.some(opponentKeeper=>{
   const colors=[desiredOwn.main,desiredOpponent.main,userKeeper.main,opponentKeeper.main];
   return colors.every((color,index)=>colors.slice(index+1).every(other=>call('v61KitColorDistance',color,other)>=100));
  }));
  if(preferredCanSeparate){
   assert.strictEqual(match.user.style,desiredOwn.style,'ohne Farbkonflikt bleibt das vorgesehene Trikot');
   assert.strictEqual(match.opponent.style,desiredOpponent.style,'ohne Farbkonflikt bleibt das vorgesehene Gegnertrikot');
  }
 }
}
assert.strictEqual(call('v61HarmoniousKitColors',{primary:'#ff0000',secondary:'#00ff00',tertiary:'#0000ff'}),false,'drei konkurrierende Signalfarben werden abgelehnt');
assert.strictEqual(call('v61HarmoniousKitColors',{primary:'#888888',secondary:'#c7d0d0',tertiary:'#24385b'}),true,'Grau und Hellgrau bleiben zulässig');
const bremen=all.find(club=>club.id==='GER-2');
const edited=call('v61BuildClubKits',bremen,{...bremen.kits.colors,primary:'#234363'},{home:'solid',away:bremen.kits.away.style});
assert(call('v61ValidClubKits',edited),'angepasste Vereinsfarben und Muster bleiben gültig');
assert.strictEqual(edited.home.main,'#234363');
assert.strictEqual(edited.away.accent,'#234363');
assert.strictEqual(edited.home.style,'solid');
const crest=call('v61CrestSVG',{...bremen,kits:edited});
assert(crest.includes('shape-rendering="crispEdges"')&&!crest.includes('<text'),'Vereinswappen nutzt Pixelbuchstaben');
assert([edited.colors.primary,edited.colors.secondary,edited.colors.tertiary].every(color=>crest.includes(color)),'Wappen übernimmt alle drei aktuellen Vereinsfarben');
assert.notStrictEqual(crest,call('v61CrestSVG',bremen),'Farbänderung färbt das Wappen neu');
assert.strictEqual(call('v61ValidateCareer',career),true);
const roundTrip=JSON.parse(JSON.stringify(career));
assert.deepStrictEqual(roundTrip.world.clubs[0].kits,JSON.parse(JSON.stringify(all[0].kits)),'Trikots bleiben im Spielstand');
roundTrip.world.clubs[0].kits.colors.tertiary=roundTrip.world.clubs[0].kits.colors.primary;
assert.strictEqual(call('v61ValidateCareer',roundTrip),false,'gleiche Farben werden abgelehnt');
roundTrip.world.clubs[0].kits=null;
assert.strictEqual(call('v61ValidateCareer',roundTrip),false,'beschädigte Trikotdaten werden abgelehnt');
const older=JSON.parse(JSON.stringify(career));
for(const club of older.world.clubs)delete club.kits;
assert.strictEqual(call('v61ValidateCareer',older),true,'vorhandene Spielstände bleiben ohne Nachberechnung ladbar');
console.log('Vereinstrikots: 48 Dreierpaletten, sechs Muster, zwei kontrastreiche Torwarttrikots und Speicherung geprüft.');

const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

let nextId=0;
const context=vm.createContext({crypto:{randomUUID:()=>`appearance-test-${++nextId}`}});
for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js','world-nationalities-v79.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
for(const file of ['world-economy-v66.js','world-youth-manager-v67.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
const call=(name,...args)=>vm.runInContext(name,context)(...args);
const career=call('v61CreateCareer','GER-2','appearance-world');
const players=career.world.clubs.flatMap(club=>[...club.roster,...club.youthPool]).concat(career.world.market.freePlayers);
assert(players.length>600,'Startkader, Jugend und freie Spieler wurden erzeugt');
assert(players.every(player=>call('v61ValidAppearance',player.appearance)),'alle neuen Spieler haben vollständiges Aussehen');
assert.strictEqual(call('v61ValidateCareer',career),true);

const signature=player=>call('v61AppearanceSignature',player.appearance);
const poses=vm.runInContext('v61JubelPoses',context);
assert.deepStrictEqual(Array.from(poses),['fist_chest'],'neue Spieler nutzen nur Faust vor der Brust');
for(const club of career.world.clubs){
 const group=[...club.roster,...club.youthPool],signatures=group.map(signature);
 assert.strictEqual(new Set(signatures).size,group.length,`${club.id}: unterscheidbare sichtbare Signaturen`);
 assert(group.every(player=>player.appearance.pose==='fist_chest'),`${club.id}: feste Jubelpose im Kader und Nachwuchs`);
}
const free=career.world.market.freePlayers;
assert.strictEqual(new Set(free.map(signature)).size,free.length,'freie Spieler erhalten unterschiedliche Signaturen');
assert(free.every(player=>player.appearance.pose==='fist_chest'),'freie Spieler nutzen dieselbe Jubelpose');
for(let index=0;index<free.length;index++)assert.deepStrictEqual(
 JSON.parse(JSON.stringify(free[index].appearance)),
 JSON.parse(JSON.stringify(call('v61GenerateAppearance',free[index].pid,free[index].nation,free[index].age,free.slice(0,index)))),
 'freie Spieler nutzen endgültige ID und Nationalität'
);

const first=career.world.clubs[0].roster[0],repeat=call('v61GenerateAppearance',first.pid,first.nation,first.age);
assert.deepStrictEqual(JSON.parse(JSON.stringify(repeat)),JSON.parse(JSON.stringify(call('v61GenerateAppearance',first.pid,first.nation,first.age))));
const changedNation=call('v61GenerateAppearance',first.pid,'JPN',first.age);
for(const key of ['faceShape','eyeBrows','nose','mouth','facialHair'])assert.strictEqual(changedNation[key],repeat[key],`${key} hängt nicht an der Nationalität`);
const colliding=call('v61GenerateAppearance',first.pid,first.nation,first.age,[{appearance:repeat}]);
assert.notStrictEqual(call('v61AppearanceSignature',colliding),call('v61AppearanceSignature',repeat),'gleiche Signatur wird erneut gezogen');
const roundTrip=JSON.parse(JSON.stringify(career));
assert.deepStrictEqual(roundTrip.world.clubs[0].roster[0].appearance,JSON.parse(JSON.stringify(first.appearance)),'Speichern und Laden behält Merkmale');
const moved=roundTrip.world.clubs[0].roster.shift();roundTrip.world.clubs[1].roster.push(moved);
assert.deepStrictEqual(moved.appearance,JSON.parse(JSON.stringify(first.appearance)),'Transfer behält Merkmale und Pose');
roundTrip.world.clubs[0].roster.push(roundTrip.world.clubs[1].roster.pop());
roundTrip.world.clubs[0].roster[0].appearance.pose='double_fists';
assert.strictEqual(call('v61ValidateCareer',roundTrip),true,'frühere gespeicherte Posen bleiben lesbar');
roundTrip.world.clubs[0].roster[0].appearance.pose='invalid';
assert.strictEqual(call('v61ValidateCareer',roundTrip),false,'ungültige gespeicherte Pose wird erkannt');
const older=JSON.parse(JSON.stringify(career));
for(const player of older.world.clubs.flatMap(club=>[...club.roster,...club.youthPool]).concat(older.world.market.freePlayers))delete player.appearance;
assert.strictEqual(call('v61ValidateCareer',older),true,'vorhandene Spielstände werden nicht nachträglich umgerechnet');

const skinProfiles=vm.runInContext('v61SkinProfiles',context),skinOverrides=vm.runInContext('v61SkinOverrides',context);
assert([...Object.values(skinProfiles),...Object.values(skinOverrides)].every(weights=>weights.length===6&&weights.every(weight=>weight>0)),'jeder Hautton bleibt für jede Herkunft möglich');
for(const matrix of [vm.runInContext('v61HairColorWeights',context),vm.runInContext('v61HairStyleWeights',context)])assert(matrix.every(weights=>weights.every(weight=>weight>0)),'jede Haarvariante bleibt möglich');
const sample=(nation,count)=>Array.from({length:count},(_,index)=>call('v61GenerateAppearance',`sample:${nation}:${index}`,nation,24).skinTone);
const westAfrica=sample('NGA',2000),northAfrica=sample('MAR',2000),eastAsia=sample('JPN',2000);
const darkShare=tones=>tones.filter(tone=>['brown','deep'].includes(tone)).length/tones.length;
assert(darkShare(westAfrica)>darkShare(northAfrica)&&darkShare(northAfrica)>darkShare(eastAsia),'breite Herkunftsprofile bleiben unterscheidbar');
assert([westAfrica,northAfrica,eastAsia].every(tones=>new Set(tones).size===6),'keine Herkunft ist auf Hauttöne festgelegt');
console.log('Spieleraussehen: Startkader, Jugend und Markt, feste Posen, Gesichtsunterschiede, Herkunftsgewichte und Speicherung geprüft.');

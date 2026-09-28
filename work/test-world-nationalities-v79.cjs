const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const context=vm.createContext({crypto:{randomUUID:()=> 'test-id'}});
vm.runInContext(fs.readFileSync('dist/world-nationalities-v79.js','utf8'),context);
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
vm.runInContext(fs.readFileSync('dist/world-youth-manager-v67.js','utf8'),context);
const get=name=>vm.runInContext(name,context);
const nations=get('v79Nationalities'),byCode=get('v79NationByCode'),partners=get('v79YouthPartners');
assert.strictEqual(nations.length,101);
assert.strictEqual(new Set(nations.map(nation=>nation.code)).size,101);
assert.deepStrictEqual(Object.fromEntries(['uefa','north','south','asia','oceania','central','africa'].map(group=>[group,nations.filter(nation=>nation.group===group).length])),{uefa:55,north:3,south:12,asia:9,oceania:2,central:5,africa:15});
assert.deepStrictEqual(Array.from(nations.filter(nation=>nation.group==='africa'),nation=>nation.code),['MAR','SEN','EGY','NGA','ALG','CIV','COD','CMR','MLI','RSA','TUN','BFA','CPV','GHA','GUI']);
assert(nations.every(nation=>nation.code.length===3&&nation.de&&nation.en&&nation.flag&&nation.given.length>=5&&nation.family.length>=5&&nation.given.every(Boolean)&&nation.family.every(Boolean)));
assert.strictEqual(JSON.stringify(get('v61Countries').map(([code])=>code)),JSON.stringify(['ENG','ESP','ITA','GER','FRA','POR']));
for(const [home,items] of Object.entries(partners)){
 assert.strictEqual(items.reduce((sum,[code,weight])=>sum+weight,0),100,`${home}: Partnergewichte`);
 assert(items.every(([code,weight])=>code!==home&&byCode[code]&&weight>0));
}
assert.deepStrictEqual(JSON.parse(JSON.stringify(partners.POR)),[['BRA',60],['ESP',40]]);
const pick=get('v79YouthNation'),name=get('v79YouthName'),flag=get('v79FlagSVG');
const seen=new Set();
for(const home of Object.keys(partners)){
 const counts={home:0,partner:0,rest:0},partnerSet=new Set(partners[home].map(([code])=>code));
 for(let index=0;index<20000;index++){
  const pid=`v79-test:${home}:${index}`,code=pick(home,pid);
  seen.add(code);
  counts[code===home?'home':partnerSet.has(code)?'partner':'rest']++;
  if(index<50){assert.strictEqual(pick(home,pid),code);assert(name(code,pid).includes(' '))}
 }
 for(const [group,target] of Object.entries({home:.6,partner:.3,rest:.1}))assert(Math.abs(counts[group]/20000-target)<.015,`${home}: ${group} ${counts[group]}`);
}
assert.strictEqual(seen.size,101,'Jede Nationalität ist über feste Seeds erreichbar.');
const professional=get('v79ProfessionalNation'),shares=get('v79ProfessionalHomeShare'),professionalSeen=new Set();
for(const kind of ['roster','free'])for(const home of Object.keys(partners)){
 let homeCount=0;
 for(let index=0;index<20000;index++){
  const pid=`v79-${kind}:${home}:${index}`,code=professional(home,pid,kind);
  professionalSeen.add(code);
  homeCount+=Number(code===home);
  if(index<50)assert.strictEqual(professional(home,pid,kind),code);
 }
 assert(Math.abs(homeCount/20000-shares[kind][home]/100)<.015,`${kind}/${home}: Heimatanteil ${homeCount}`);
}
assert.strictEqual(professionalSeen.size,101,'Alle 101 Nationalitäten sind für Profis erreichbar.');
let portugalBrazil=0;
for(let index=0;index<20000;index++)portugalBrazil+=Number(professional('POR',`v79-portugal:${index}`)==='BRA');
assert(portugalBrazil/20000>.15,'Brasilien ist im portugiesischen Startkader deutlich vertreten.');
for(const nation of nations)assert(flag(nation.code).includes(`aria-label="${nation.de}"`));
for(const code of ['ENG','SCO','WAL','NIR','KOS'])assert(flag(code).startsWith('<svg'),`${code}: eigene Fußballflagge`);
assert(flag('???').includes('Unbekannt'));
const career={world:{seed:'identity-test'}},club={id:'POR-1',countryId:'POR',policy:{youth:2,startingSquad:3},youthInvestmentHistory:[]};
const before=get('v67Youth')(career,club,3,1);
vm.runInContext('v79YouthNation=()=>"JPN";v79PlayerName=()=>"Test Player"',context);
const after=get('v67Youth')(career,club,3,1);
for(const key of ['pid','age','line','foot','tec','pas','fin','tak','pos','spd','sta','air','gk','potential','compensationRate'])assert.strictEqual(JSON.stringify(after[key]),JSON.stringify(before[key]),`${key} darf sich durch Identitätsdaten nicht ändern`);
const entry={id:'POR-1',profile:[0,0,0,0,0,3]},originalRoster=get('v61GenerateRoster')(entry,'v79-roster-test');
vm.runInContext('v79ProfessionalNation=()=>"JPN";v79PlayerName=(code,pid)=>pid',context);
const changedRoster=get('v61GenerateRoster')(entry,'v79-roster-test');
for(let index=0;index<originalRoster.length;index++)for(const key of ['pid','age','line','foot','tec','pas','fin','tak','pos','spd','sta','air','gk'])assert.strictEqual(changedRoster[index][key],originalRoster[index][key],`${key} darf sich durch Profi-Identität nicht ändern`);
console.log('Nationalitäten: 101 Einträge, Jugend 60/30/10, Profi-Profile, Portugal-Ausnahme und stabile Talentwerte geprüft.');

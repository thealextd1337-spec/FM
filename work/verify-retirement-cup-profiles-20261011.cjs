'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'outputs/retirement-20years-20261011');process.chdir(path.join(root,'outputs/youth-20years-20261011/source'));
const {harness}=require(path.join(root,'work/youth-audit-native-harness.cjs')),api=harness();let comparisons=0;
for(const suffix of ['a','b','c']){
 const a=JSON.parse(fs.readFileSync(path.join(out,`retirement20-${suffix}-audit.json`))),c=JSON.parse(fs.readFileSync(path.join(out,`retirement20-${suffix}-checkpoint.json`))),groups=new Map(),players=new Map(c.world.clubs.flatMap(club=>[...club.roster,...(club.retiredPlayers||[])]).map(p=>[p.pid,p]));
 for(const b of a.births.filter(b=>b.kind==='cup'&&b.pid.includes(':replacement:'))){const key=b.clubId+':'+b.firstSeason;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(b);}
 for(const rows of groups.values()){
  const first=rows[0],club=c.world.clubs.find(c=>c.id===first.clubId),catalog=api.evaluate('v161Catalog').find(e=>e.id===club.id),generated=api.call('v61GenerateRoster',catalog,`${a.seed}:S${first.firstSeason+1}:replacement`);
  for(const born of rows){const expected=generated.find(p=>p.pid===born.pid);assert(expected,'Expected native replacement ID');expected.age=18+Math.floor(api.call('v61Random',`${expected.pid}:age`)()*6);api.call('v153Generate',expected,{...c.world.playerFoundation,season:born.firstSeason+1},'cup',club.policy.startingSquad,club.policy.youth,club.id);assert.equal(expected.age,born.age);assert.equal(expected.playerModel.talent,born.talent);for(const [key,value] of Object.entries(born.skills))assert.equal(expected[key],value,`Cup birth profile changed: ${key}`);assert.deepEqual(JSON.parse(JSON.stringify(expected.playerModel.caps)),players.get(born.pid).playerModel.caps);comparisons++;}
 }
}
const result={checkedAt:new Date().toISOString(),passed:true,comparisons,method:'Each cup replacement compared to the unchanged native factory at its native 18-23 birth age, with same ID, next-season foundation and club profiles; exact equality of all 13 birth skills, lifetime caps and hidden talent.'};fs.writeFileSync(path.join(out,'cup-profile-validation.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));

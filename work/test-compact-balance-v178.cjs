'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');process.chdir(path.resolve(__dirname,'..'));
const {suite,sha}=require('./compact-balance-harness-v178.cjs'),h=suite(),checks=[];
const chance=(revision,neutral,side,factor=1.03)=>h.call('v178CompactShotChance',{neutral},{playerPerformance:{shotBalanceRevision:revision,compactBalance:revision===178?{homeShotFactor:factor}:undefined}},side);
assert.equal(chance(119,false,0),.09);assert.equal(chance(undefined,false,0),.22);
assert.equal(chance(178,false,0),.09*1.03);assert.equal(chance(178,false,1),.09);assert.equal(chance(178,true,0),.09);assert.equal(chance(178,true,1),.09);
for(const factor of [1,1.02,1.03])assert.equal(chance(178,true,0,factor),.09);
checks.push('relative home bonus only on home side and non-neutral pitch; old119/unmarked gates unchanged');
const oldSource=fs.readFileSync('outputs/compact-balance-v178/baseline-v155.js','utf8'),oldAction=h.evaluate('('+oldSource.slice(oldSource.indexOf('function v155CompactActions('),oldSource.indexOf('function v155Rated('))+')'),current=h.evaluate('v155CompactActions');
globalThis.v178ReferenceAction=oldAction;globalThis.v178CurrentAction=current;
function initial(seed,revision){
 const c=h.call('v167CreateCareer','AUT-5',seed,'QA'),snapshot=JSON.stringify(c),day=Math.min(...c.world.competitions.filter(c=>c.type==='league').flatMap(c=>c.fixtures.map(f=>f.day))),f={id:'QA:REGRESSION:'+seed,competitionId:'QA-START-LEAGUE',homeId:'GER-1',awayId:'GER-6',day,neutral:false,result:null};globalThis.v61CurrentCareer=c;
 const s=h.call('v64MakeState',c,f);assert.equal(s.playerPerformance.shotBalanceRevision,178);
 assert.deepEqual(s.playerPerformance.compactBalance,h.evaluate('({...v178CompactBalance})'));
 if(revision!==178){delete s.playerPerformance.compactBalance;if(revision===119)s.playerPerformance.shotBalanceRevision=119;else delete s.playerPerformance.shotBalanceRevision;}
 return{c,f,s,snapshot};
}
function finish(x,until=Infinity){globalThis.v61CurrentCareer=x.c;while(x.s.phase!=='finished'&&x.s.minute<until)h.call('v64Step',x.c,x.f,x.s);if(x.s.phase==='finished')h.call('v64FinishFixture',x.c,x.f,x.s);return x;}
for(const revision of [119,undefined]){
 const seed='v178-old-'+revision,a=initial(seed,revision),checkpoint=finish(a,27),saved=JSON.stringify(checkpoint),before=JSON.stringify(checkpoint.s.playerPerformance);
 h.call('v155Initialize',checkpoint.c,checkpoint.s);assert.equal(JSON.stringify(checkpoint.s.playerPerformance),before,'Existing performance is not reset or re-marked');
 const direct=finish(checkpoint),loaded=finish(JSON.parse(saved));assert.equal(JSON.stringify(direct),JSON.stringify(loaded),'JSON continuation exact');
 h.evaluate('v155CompactActions=v178ReferenceAction;');const reference=finish(initial(seed,revision));h.evaluate('v155CompactActions=v178CurrentAction;');
 assert.deepEqual(direct.s,reference.s,'Legacy native events/loads/roles match frozen controller');assert.deepEqual(direct.c.world.clubs,reference.c.world.clubs,'Legacy books/form/development match frozen controller');
 checks.push('full old '+String(revision)+' match equals frozen source and resumes exactly');
}
const newer=initial('v178-new',178);newer.s.playerPerformance.compactBalance={version:178,goalBase:.30,goalCeiling:.48,homeShotFactor:1.02};finish(newer,27);
const saved=JSON.stringify(newer),before=JSON.stringify(newer.s.playerPerformance);h.call('v155Initialize',newer.c,newer.s);assert.equal(JSON.stringify(newer.s.playerPerformance),before);
const a=finish(newer),b=finish(JSON.parse(saved));assert.equal(JSON.stringify(a),JSON.stringify(b));assert.equal(a.s.playerPerformance.compactBalance.goalBase,.30,'Stored match settings own continuation');
const record=a.f.matchRecord,roster=JSON.stringify(a.c.world.clubs);assert.equal(h.call('v64FinishFixture',a.c,a.f,a.s),record);assert.equal(JSON.stringify(a.c.world.clubs),roster);
checks.push('new match stores parameters; saved settings survive reload/init; full continuation and booking idempotent');
const policy=JSON.stringify(a.c.world.playerFoundation.expansionGeneration);h.call('v177CheckInitialRosters',h.call('v167CreateCareer','AUT-5','v178-start-policy','QA'));assert.equal(JSON.stringify(a.c.world.playerFoundation.expansionGeneration),policy);
const immutableModel={world:{playerFoundation:{parameterId:'wave2-local-candidate-1'}}},unmarked={};h.call('v155Initialize',immutableModel,unmarked);assert.deepEqual(unmarked,{});
checks.push('start policy retained; preceding model remains unmarked');
fs.writeFileSync('outputs/compact-balance-v178/regression.json',JSON.stringify({passed:true,sourceSha256:sha(fs.readFileSync('dist/world-player-performance-v155.js')),checks},null,2));console.log('PASS '+checks.join('\nPASS '));

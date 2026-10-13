'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'outputs/youth-comparison-20years-20261011');process.chdir(path.join(root,'outputs/youth-20years-20261011/source'));
const api=require(path.join(root,'work/youth-audit-native-harness.cjs')).harness();api.run('world-expansion-stories-v170.js');const {call,evaluate}=api,career=call('v167CreateCareer','AUT-5','youth20-a','Kontrolle');globalThis.v61CurrentCareer=career;
globalThis.auditComparisonVariant='country';globalThis.auditStatusRows=[];evaluate(fs.readFileSync(path.join(root,'work/youth-comparison-hooks-20261011.js'),'utf8'));career.world.season=2;
const gen=evaluate('D6PlayerGeneration'),rows=[];
for(const country of ['ENG','POR','AUT','GRE'])for(const kind of ['free','cup'])for(const pos of ['gk','def','mid','att'])for(let i=0;i<20;i++){
 const clubId=kind==='free'?`${country}-FREE-S2`:`${country}-C1`,entry=career.world.clubs.find(c=>c.id===`${country}-C1`),id=`adult-control:${country}:${kind}:${pos}:${i}`,foundation=career.world.playerFoundation;
 const context={id,age:18+i%6,mainPosition:pos,kind,clubQuality:foundation.qualityMapping[entry.policy.startingSquad],youthQuality:foundation.qualityMapping[entry.policy.youth]};
 const native=call('auditComparisonParametersBase',foundation,kind,clubId),params=call('v161GenerationParameters',foundation,kind,clubId);
 const expectedOffset=kind==='cup'?foundation.expansionGeneration.tierOffsets[{ENG:'A',POR:'B',AUT:'C',GRE:'D'}[country]]:0;
 const baseline=gen.generatePlayer(context,native,call('v61Random',id)),modified=gen.generatePlayer(context,params,call('v61Random',id));
 const q0=gen.positionQuality(baseline.skills,pos),q1=gen.positionQuality(modified.skills,pos),factor=1+{ENG:.03,POR:.01,AUT:0,GRE:-.02}[country];
 assert(Math.abs(q1-(q0-expectedOffset)*factor)<1e-10);assert.equal(modified.talent,baseline.talent);assert.equal(modified.heightCm,baseline.heightCm);assert.equal(modified.preferredFoot,baseline.preferredFoot);
 rows.push({country,kind,unchangedTalent:true,countryAppliedOnce:true});
}
fs.writeFileSync(path.join(out,'adult-generation-controls.json'),JSON.stringify({pass:true,generatedPlayersChecked:rows.length,coverage:'4 country groups x free/cup x 4 positions x20 ages/seeds; preserve club offset, replace native country offset, unchanged talent/height/foot'},null,2));console.log(JSON.stringify({pass:true,generatedPlayersChecked:rows.length}));

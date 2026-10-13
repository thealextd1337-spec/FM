'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../../../dist/world-unity-v151.js');
const teams=[{id:'GER-2',colors:['#14337a','#e6e7e3']},{id:'GER-C1',colors:['#edac24','#142629']}];
global.v62Current=c=>c.competitions;global.v61ClubColors=c=>c.colors;
const original=Math.random;Math.random=()=>{throw Error('Presentation consumed native RNG')};
const checks=[];
const check=(name,fn)=>{fn();checks.push({name,pass:true})};
const ctx=(type,id,round='R1',neutral=false)=>({fixture:{id,competitionId:'S1:GER:'+type.toUpperCase(),round,neutral},career:{competitions:[{id:'S1:GER:'+type.toUpperCase(),type,country:type==='europe'?null:'GER',format:type==='cup'?'domestic16':''}]}});
try{
 check('European fixtures are night and use the Europe rule',()=>{for(const id of ['S1:EUROPE','S1:CROWN','S1:HORIZON']){const c=ctx('europe',id+':R1:GER-2-AUT-1:1');assert.equal(C.presentation(c,teams).lighting,'night');assert.equal(C.presentation(c,teams).lightRule,'europe-night')}});
 check('Unknown old-season European competition ids still classify as Europe',()=>{for(const id of ['S1:EUROPE','S1:CROWN','S1:HORIZON']){const c=ctx('other',id+':F:GER-2-AUT-1:1','F');c.fixture.competitionId=id;c.career.competitions=[];const p=C.presentation(c,teams);assert.equal(p.competition,'europe');assert.equal(p.lighting,'night');assert.equal(p.venue,'neutral')}});
 check('National cup and Europe finals have neutral display venues',()=>{for(const type of ['cup','europe'])assert.equal(C.presentation(ctx(type,'S1:'+type+':F:1','F'),teams).venue,'neutral')});
 check('Explicit neutral fixture is respected without altering the fixture',()=>{const c=ctx('league','S1:GER:LEAGUE:R1:GER-2-GER-3:1','R1',true),before=JSON.stringify(c);assert.equal(C.presentation(c,teams).venue,'neutral');assert.equal(JSON.stringify(c),before)});
 check('Fixture assignment survives JSON save/load and repeated calls',()=>{const c=ctx('league','S1:GER:LEAGUE:R7:GER-2-GER-3:1');const p=C.presentation(c,teams);assert.deepEqual(C.presentation(JSON.parse(JSON.stringify(c)),JSON.parse(JSON.stringify(teams))),p);assert.deepEqual(C.presentation(c,teams),p)});
 check('Club primary colours and cup classification do not depend on clash kits',()=>{const p=C.presentation(ctx('cup','S1:GER:CUP:R1:1'),teams);assert.equal(p.clubs[0].primary,teams[0].colors[0]);assert.equal(p.clubs[1].primary,teams[1].colors[0]);assert.equal(p.clubs[1].kind,'cup');assert.equal(p.clubs[0].kind,'league')});
 check('Team order is preserved when the managed side is away',()=>{const reverse=[teams[1],teams[0]],p=C.presentation(ctx('cup','S1:GER:CUP:R1:1'),reverse);assert.deepEqual(p.clubs.map(c=>c.id),reverse.map(c=>c.id))});
 check('Neither fixture/career nor club inputs are mutated',()=>{const c=ctx('league','S1:GER:LEAGUE:R1:GER-2-GER-3:1'),before=JSON.stringify({c,teams});C.presentation(c,teams);assert.equal(JSON.stringify({c,teams}),before)});
 check('Domestic assignments provide a deterministic day/night mix',()=>{for(const type of ['league','cup']){let day=0;const n=500;for(let i=1;i<=n;i++)day+=C.presentation(ctx(type,`S1:GER:${type.toUpperCase()}:R${i}:GER-2-GER-3:1`),teams).lighting==='day';const share=day/n;assert.ok(type==='league'?share>.45&&share<.75:share>.25&&share<.55,`${type}: ${share}`)}});
 check('Other competitions use the conservative night fallback',()=>{const p=C.presentation(ctx('other','OTHER:1'),teams);assert.equal(p.lighting,'night');assert.equal(p.lightRule,'fallback-night')});
}finally{Math.random=original;delete global.v62Current;delete global.v61ClubColors}
const out=path.resolve(__dirname,'../../../outputs/lowpoly-live/presentation-js.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify({pass:true,checks},null,2)+'\n');console.log(JSON.stringify({pass:true,checks:checks.length,report:out}));

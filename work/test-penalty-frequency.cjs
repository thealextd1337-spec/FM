const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {makeContext}=require('./test-v41.cjs');

const files=['youth-v33.js','penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js','next-match-v49.js','set-pieces-v50.js','status-icons-v51.js','player-status-v51.js','strength-v55.js','opponent-profile-v54.js'];
const samples=[];
for(let seed=1;seed<=48;seed++){
 const context=makeContext();
 for(const file of files)vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context,{filename:file});
 vm.runInContext('var v24Validation=()=>[];var v25RoleBar=()=>{};var v24Remember=()=>{};var v24FatigueText=()=>"frisch";var v24TopSkills=()=>"Passspiel gut";',context);
 for(const file of ['pitch-v55.js','pitch-v56.js','pitch-v57.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context,{filename:file});
 vm.runInContext(`var __slideStarts=[];var __originalSlide=v56StartSlide;v56StartSlide=function(tackler,victim){var info=v56ApproachInfo(tackler,victim);__slideStarts.push({behind:info.behind,body:info.body,ball:info.ball});return __originalSlide(tackler,victim)}`,context);
 const sample=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
  let seed=${seed};Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');aggression=0;
  document.querySelector('#canvas').parentElement={append(){}};start();
  let ticks=0;while(running&&ticks++<6500)step(.05,.05);
  return{finished:match.finished,penalties:match.setPieceStats.penalties.reduce((a,b)=>a+b,0),fouls:match.setPieceStats.fouls.reduce((a,b)=>a+b,0),slideAttempts:match.people.reduce((sum,player)=>sum+(player.stats.slideAttempts||0),0),slideWon:match.people.reduce((sum,player)=>sum+(player.stats.slideWon||0),0),slideStarts:__slideStarts};
 })())`,context));
 assert(sample.finished,`match ${seed} did not finish`);
 samples.push(sample);
}
const penalties=samples.reduce((total,sample)=>total+sample.penalties,0);
const fouls=samples.reduce((total,sample)=>total+sample.fouls,0);
console.log(`48 complete matches: ${penalties} penalties, ${fouls} fouls; matches with a penalty: ${samples.filter(sample=>sample.penalties>0).length}`);
const slideAttempts=samples.reduce((total,sample)=>total+sample.slideAttempts,0);
const slideWon=samples.reduce((total,sample)=>total+sample.slideWon,0);
const slideStarts=samples.flatMap(item=>item.slideStarts);
console.log(`${slideAttempts} slides attempted, ${slideWon} won`);
assert.equal(slideStarts.length,slideAttempts);
assert(slideStarts.length>0&&slideWon>0,'valid slides still occur and can win the ball');
assert(slideStarts.some(item=>item.behind),'rare rear slides must be possible in full-engine matches');
assert(slideStarts.every(item=>item.behind||item.ball<item.body),'front and side slides must approach the ball before the player');
assert(penalties>=4&&penalties<=16,'rear slides should create penalties without returning to excessive match rates');
console.log(`PASS: ${slideStarts.filter(item=>item.behind).length} rear slides and a bounded regular penalty rate`);

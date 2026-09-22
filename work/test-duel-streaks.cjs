const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {makeContext}=require('./test-v41.cjs');

const files=['youth-v33.js','penalties-v42.js','club-records-v43.js','club-identity-v44.js','keeper-logo-v45.js','match-report-v47.js','next-match-v49.js','set-pieces-v50.js','status-icons-v51.js','player-status-v51.js','strength-v55.js','opponent-profile-v54.js'];
function run(seed){
 const context=makeContext();
 for(const file of files)vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context,{filename:file});
 vm.runInContext('var v24Validation=()=>[];var v25RoleBar=()=>{};var v24Remember=()=>{};var v24FatigueText=()=>"frisch";var v24TopSkills=()=>"Passspiel gut";',context);
 for(const file of ['pitch-v55.js','pitch-v56.js','pitch-v57.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context,{filename:file});
 return JSON.parse(vm.runInContext(`JSON.stringify((()=>{
  let seed=${seed};Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  beginSquadSetup();autoSelectSquad();confirmInitialSquad();selectSponsor('safe');document.querySelector('#canvas').parentElement={append(){}};start();
  const events=[],baseNote=note;
  note=function(text,kind='normal'){events.push({minute:displayMatchMinute(match.elapsed),text,kind,team:match.owner?.t});return baseNote(text,kind)};
  const baseStanding=v56StandingTackle;
  v56StandingTackle=function(tackler,victim){const before=match.owner,result=baseStanding(tackler,victim);if(before===victim&&match.owner===tackler&&events.at(-1)?.text===tackler.name+' gewinnt den Ball im Zweikampf.')events.at(-1).victim=victim.name;return result};
  let tick=0;for(;running&&tick<6500;tick++)step(.05,.05);
  if(running)throw Error('match did not finish');
  let best=0,chain=[],bestChain=[];
  for(const [index,event] of events.entries()){
   const standing=event.text.match(/^(.*) gewinnt den Ball im Zweikampf\.$/),base=event.text.match(/^(.*) gewinnt das Duell gegen (.*)\.$/);
   if(!standing&&!base){chain=[];continue}
   const name=(standing||base)[1],victim=event.victim||base?.[2];
   if(chain.length&&(chain.at(-1).name!==victim||chain.at(-1).victim!==name))chain=[];
   chain.push({...event,name,victim,index});
   if(chain.length>best){best=chain.length;bestChain=chain.slice()}
  }
  let visibleBest=0,visibleChain=[];
  for(const event of events.filter(event=>event.kind!=='normal')){
   const standing=event.text.match(/^(.*) gewinnt den Ball im Zweikampf\.$/),base=event.text.match(/^(.*) gewinnt das Duell gegen (.*)\.$/);
   if(!standing&&!base){visibleChain=[];continue}
   const name=(standing||base)[1],victim=event.victim||base?.[2];
   if(visibleChain.length&&(visibleChain.at(-1).name!==victim||visibleChain.at(-1).victim!==name))visibleChain=[];
   visibleChain.push({name,victim});visibleBest=Math.max(visibleBest,visibleChain.length);
  }
  return {seed:${seed},best,visibleBest,chain:bestChain.map(event=>[event.minute,event.name,event.victim]),frames:tick,events:events.length,duels:events.filter(event=>event.kind==='duel').length,passes:match.people.reduce((sum,player)=>sum+player.stats.passes,0),shots:match.shots[0]+match.shots[1],fouls:match.people.reduce((sum,player)=>sum+(player.stats.fouls||0),0)};
 })())`,context));
}

const samples=process.env.DOPPEL_DUEL_SWEEP==='1'?Array.from({length:24},(_,index)=>run(index+1)):[run(6)];
const worst=samples.reduce((a,b)=>a.best>=b.best?a:b);
console.log(`Duel streaks: seed ${worst.seed}, ${worst.best} direct exchanges, visible maximum ${Math.max(...samples.map(sample=>sample.visibleBest))}, ${worst.duels} total duels; chain ${JSON.stringify(worst.chain.slice(0,8))}`);
assert(worst.best<=3,`repeated alternating tackles lasted ${worst.best} events in seed ${worst.seed}`);
assert(samples.every(sample=>sample.visibleBest<=3),'the match report must not show a long two-player duel sequence');
console.log(`Match averages (${samples.length} seeds): ${JSON.stringify({duels:Math.round(samples.reduce((sum,item)=>sum+item.duels,0)/samples.length),passes:Math.round(samples.reduce((sum,item)=>sum+item.passes,0)/samples.length),shots:Math.round(samples.reduce((sum,item)=>sum+item.shots,0)/samples.length),fouls:Math.round(samples.reduce((sum,item)=>sum+item.fouls,0)/samples.length),seconds:Math.round(samples.reduce((sum,item)=>sum+item.frames*.05,0)/samples.length)})}`);
console.log('PASS: no long alternating tackle streaks across seeded full matches');

'use strict';
// Where does a Unity/native digest divergence start? Runs the D6QAScenario
// stages one by one and records a digest (all part hashes) plus match.elapsed,
// a random-stream probe and step counters after every stage, for both modes.
// usage: node bisect-unity-parity-114.cjs [config=large-5] [plan=fine|scenario]
// plan=scenario uses exactly the D6QAScenario stops (20', pause, live, half, 60', cp, end).
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const [size,players]=(process.argv[2]||'large-5').split('-'),config=size==='legacy'?null:{fieldSize:size,fieldPlayers:Number(players)};
const helper=fs.readFileSync('work/platform/qa/unity-integration-v160.js','utf8');
async function stages(browser,unity){
 const p=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4521/source/index.html?engine='+(unity?'unity':'browser'));await p.evaluate(helper);
 // count native steps that really ran vs. were called (held steps do not reach v50/v103)
 await p.evaluate(()=>{window.__calls=0;window.__ran=0;window.__after=0;const outer=step;step=function(...a){__calls++;return outer.apply(this,a)};const after=v65AfterStep;v65AfterStep=function(...a){__after++;return after.apply(this,a)};});
 const probe=()=>p.evaluate(()=>{
  // Same parts and FNV hash as D6QA160.digest(), but tolerant of parts that do
  // not exist yet mid-match (report, ratings, ballAccounting): those read null.
  const c=D6QA160.career,s=D6QA160.state,J=v=>JSON.stringify(v===undefined?null:v),strip=v=>v===undefined?null:JSON.parse(JSON.stringify(v,(k,x)=>['updated','created','savedAt'].includes(k)?'<volatile>':x));
  const world=strip(c.world),parts={score:s.score,events:s.events,stats:s.stats,fresh:s.fresh,minutes:s.minutes,report:strip(s.postMatchReport),ratings:s.ratings,ballAccounting:match.ballAccounting,geometry:match.geometry,people:match.people.map(p=>({pid:p.pid,x:p.x,y:p.y,fresh:p.fresh,stats:p.stats})),finances:world.clubs.map(club=>({id:club.id,balance:club.balance,ledger:club.ledger??club.finance??null})),development:world.clubs.flatMap(club=>club.roster).map(p=>({pid:p.pid,fresh:p.fresh,form:p.form,skills:D6PlayerGeneration.SKILL_KEYS.map(k=>p[k]),model:p.playerModel})),fixtures:v62Fixtures(c).filter(f=>f.result).map(f=>({id:f.id,result:f.result,record:f.matchRecord})),world};
  const text={};for(const [k,v]of Object.entries(parts))text[k]=J(v);
  const hash=t=>{let h=2166136261;for(let i=0;i<t.length;i++)h=Math.imul(h^t.charCodeAt(i),16777619)>>>0;return h.toString(16).padStart(8,'0')};
  const d={hashes:Object.fromEntries(Object.entries(text).map(([k,v])=>[k,hash(v)+':'+v.length])),all:hash(Object.values(text).join('|'))};return{minute:v65Context().state.minute,elapsed:match.elapsed,phase:v65Context().state.phase,calls:__calls,after:__after,all:d.all,hashes:d.hashes,held:window.D6UnityMatch?.clockHeld??null,replay:Boolean(v103Replays.get(match)?.active||v103Replays.get(match)?.review),goals:match.goals.length}});
 const log={};const Q=f=>p.evaluate(f);
 await p.evaluate(([c,u])=>D6QA160.setup({config:c,unity:u,replays:true}),[config,unity]);log.setup=await probe();
 const fine=[['r10',()=>D6QA160.run({minute:10,sampleEvery:3})],['r20',()=>D6QA160.run({minute:20,sampleEvery:3})],['pause',()=>D6QA160.pause()],['live',()=>D6QA160.returnLive()],['half',()=>D6QA160.run({stopAtHalftime:true,sampleEvery:30})],['r45b',()=>D6QA160.run({minute:50,sampleEvery:30})],['r60',()=>D6QA160.run({minute:60,sampleEvery:30})],['cp',()=>D6QA160.checkpoint()],['r70',()=>D6QA160.run({minute:70,sampleEvery:30})],['r80',()=>D6QA160.run({minute:80,sampleEvery:30})],['end',()=>D6QA160.run({finished:true,sampleEvery:30})]];
 const scenarioPlan=[['r20',()=>D6QA160.run({minute:20,sampleEvery:3})],['pause',()=>D6QA160.pause()],['live',()=>D6QA160.returnLive()],['half',()=>D6QA160.run({stopAtHalftime:true,sampleEvery:30})],['r60',()=>D6QA160.run({minute:60,sampleEvery:30})],['cp',()=>D6QA160.checkpoint()],['end',()=>D6QA160.run({finished:true,sampleEvery:30})]];
 const plan=process.argv[3]==='scenario'?scenarioPlan:fine;
 for(const [name,fn] of plan){const r=await Q(fn);log[name]={result:JSON.parse(JSON.stringify(r,(k,v)=>k==='stats'?undefined:v)),...await probe()};}
 log.errors=errors;await p.close();return log;
}
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const u=await stages(browser,true),n=await stages(browser,false),rows=[];
  for(const k of Object.keys(n).filter(k=>k!=='errors')){const a=u[k],b=n[k];const diff=Object.keys(b.hashes).filter(h=>a.hashes[h]!==b.hashes[h]);rows.push({stage:k,equal:a.all===b.all,diff,unity:{minute:a.minute,elapsed:a.elapsed,calls:a.calls,after:a.after,goals:a.goals,held:a.held,replay:a.replay},native:{minute:b.minute,elapsed:b.elapsed,calls:b.calls,after:b.after,goals:b.goals}});}
  for(const r of rows)console.log(r.stage.padEnd(6),r.equal?'equal':'DIFF '+r.diff.join(','),'| u',r.unity.minute,r.unity.elapsed.toFixed(3),'calls',r.unity.calls,'after',r.unity.after,'goals',r.unity.goals,'| n',r.native.minute,r.native.elapsed.toFixed(3),'calls',r.native.calls,'after',r.native.after,'goals',r.native.goals);
  fs.writeFileSync(`outputs/release-114/parity-bisect-${process.argv[2]||'large-5'}-${process.argv[3]||'fine'}.json`,JSON.stringify({rows,unity:u,native:n},null,1)+'\n');
  console.log('errors',u.errors,n.errors);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

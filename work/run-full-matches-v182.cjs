'use strict';
// Complete native physical matches (browser engine, no Unity) for B03/B12:
//  base     = base commit dist (work/tmp-base182, e.g. `git archive f2458c1f dist work/test-v41.cjs`)
//  old      = current dist, markers 182 removed right after creation (an old match)
//  new      = current dist, fresh match with looseBallRevision/pursuitRevision 182
//  new-json = like new with a JSON checkpoint at minute 20 (continuation must be identical)
// `old` must reproduce `base` byte-identically (same digest incl. RNG draws).
// Usage: node work/run-full-matches-v182.cjs [--seeds=N] [--out=path]   (Node >= 20, port 4215)
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),base=path.join(__dirname,'tmp-base182'),args=process.argv.slice(2),seeds=+(args.find(a=>a.startsWith('--seeds='))?.slice(8)||3),out=args.find(a=>a.startsWith('--out='))?.slice(6)||path.join(root,'outputs/match-v182/full-matches.json');
assert(fs.existsSync(path.join(base,'dist/index.html')),'Base dist missing: '+base);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.glb':'model/gltf-binary','.wav':'audio/wav','.wasm':'application/wasm'};
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost'),rel=decodeURIComponent(url.pathname),prefix=rel.startsWith('/base/')?'/base/':rel.startsWith('/source/')?'/source/':null;
 const dir=prefix==='/base/'?path.join(base,'dist'):path.join(root,'dist'),file=prefix&&path.resolve(dir,rel.slice(prefix.length));
 if(!file||!file.startsWith(dir+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');fs.createReadStream(file).pipe(res);});
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
async function play(browser,mode,size,count,seed){
 const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:4215/${mode==='base'?'base':'source'}/index.html?engine=browser&players=wave3`);await page.waitForFunction(()=>typeof v65CreateMatch==='function'&&typeof v61CreateCareer==='function',null,{timeout:120000});
 const row=await page.evaluate(async({mode,size,count,seed})=>{
  let rng=182000+seed*7919,draws=0;Math.random=()=>{draws++;rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296};Date.now=()=>1791540000000;
  const c=v61CreateCareer('GER-2','m182-'+seed,'Match 182',undefined,{fieldSize:size,fieldPlayers:count}),club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);v124SetYouthBudget(c,0);while(c.world.market.phase==='open')await v66NextMarketDay(c);
  const f=v62Fixtures(c).filter(f=>!f.result&&[f.homeId,f.awayId].includes(club.id)).sort((a,b)=>a.day-b.day)[0],state=v64MakeState(c,f);c.world.activeMatch={fixtureId:f.id,state};v61CurrentCareer=c;state.phase='paused';match=null;v65WorldActive=null;v98View='2d';v65Show(v65Context());clearInterval(v65WorldFrame);v103CanReplay=()=>false;draw=()=>{};
  const markers={loose:match.attackFlow.looseBallRevision??null,pursuit:match.attackFlow.pursuitRevision??null};
  if(mode==='old'||mode==='old-json'){delete match.attackFlow.looseBallRevision;delete match.attackFlow.pursuitRevision;}
  let ticks=0,checkpoint=false;const t0=performance.now();
  while(!match.finished&&ticks++<30000){const ctx=v65Context();if(state.phase==='paused'){v65Resume();clearInterval(v65WorldFrame);}
   if(mode.endsWith('-json')&&!checkpoint&&state.minute>=20&&!match.flight&&!match.slide&&!match.setPiece&&!match.kickoff&&!match.throwIn&&!match.rebound&&!match.goalPause&&!match.halftimePause){checkpoint=true;v65Snapshot(ctx);state.physicalSnapshot=JSON.parse(JSON.stringify(state.physicalSnapshot));match=null;if(!v65Restore(ctx))throw Error('JSON restore failed');}
   step(.05*MATCH_SPEED,.05);if(state.phase==='live'&&!match.finished)v65AfterStep(ctx);
   if(v65PauseRequested&&!match.flight&&!match.slide&&state.phase==='live'){v65PauseRequested=false;v65Pause();clearInterval(v65WorldFrame)}
  }
  const compute=performance.now()-t0,people=[...match.people,...match.exitedPeople],stat=k=>people.reduce((n,p)=>n+(p.stats[k]||0),0);
  const stats=Object.fromEntries(['shots','onTarget','goals','passes','passComplete','duels','duelsWon','tackleAttempts','tacklesWon','slideAttempts','slideWon','fouls','interceptions'].map(k=>[k,stat(k)]));
  const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
  const runtime=m=>{const{people,exitedPeople,owner,lastPass,breakawayCarrier,nativeContactClock,...rest}=m;const player=p=>{const{playerModel,history,honours,...physical}=p;return physical};return{...rest,people:people.map(player),...(m.whistleAttackCarrier?{whistleAttackCarrier:player(m.whistleAttackCarrier)}:{}),...(m.slide?{slide:{...m.slide,tackler:m.slide.tackler&&player(m.slide.tackler),victim:m.slide.victim&&player(m.slide.victim)}}:{}),exitedPeople:(exitedPeople||[]).map(player),ownerPid:owner?.pid||null,lastPass:lastPass?{passerPid:lastPass.passer?.pid,receiverPid:lastPass.receiver?.pid,at:lastPass.at}:null,breakawayCarrierPid:breakawayCarrier?.pid||null}};
  // Marker fields themselves are excluded so `old` can be compared with `base`.
  const plain=runtime(match);delete plain.attackFlow.looseBallRevision;delete plain.attackFlow.pursuitRevision;
  const digest=JSON.stringify(canonical({rng,draws,score:state.score,stats:state.stats,events:state.events,load:state.playerLoad,match:plain,continuation:v160SnapshotContinuation(match)}));running=false;clearInterval(v65WorldFrame);
  return{markers,finished:match.finished,ticks,simulationSeconds:ticks*.05,computeMs:Math.round(compute),score:match.score,shotsByTeam:match.shots,setPieces:match.setPieceStats,stats,checkpoint,digest};
 },{mode,size,count,seed});
 await context.close();row.digestSha256=hash(row.digest);if(process.env.D6_DUMP182)fs.writeFileSync(path.join(process.env.D6_DUMP182,`${mode}-${size}-${seed}.json`),row.digest);delete row.digest;return{mode,size,count,seed,errors,...row};
}
(async()=>{
 await new Promise(r=>server.listen(4215,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--disable-gpu']});
 const report={scope:'Complete native browser-engine matches; base commit vs current dist; old = markers removed after creation.',seeds,matches:[]};
 try{
  for(const [size,count]of [['standard',5],['large',6]])for(let seed=0;seed<seeds;seed++)for(const mode of process.env.D6_MODES182?process.env.D6_MODES182.split(','):seed===0?['base','old','new','new-json']:['base','old','new']){
   const row=await play(browser,mode,size,count,seed);report.matches.push(row);
   console.log(JSON.stringify({mode,size,count,seed,finished:row.finished,min:+(row.simulationSeconds/60).toFixed(2),shots:row.stats.shots,onTarget:row.stats.onTarget,goals:row.stats.goals,fouls:row.setPieces.fouls,tackles:row.stats.tackleAttempts,slides:row.stats.slideAttempts,computeMs:row.computeMs,markers:row.markers,errors:row.errors.length}));
  }
  const find=(mode,r)=>report.matches.find(x=>x.mode===mode&&x.size===r.size&&x.count===r.count&&x.seed===r.seed);
  report.oldIdentical=report.matches.filter(r=>r.mode==='old'&&find('base',r)).map(r=>({size:r.size,seed:r.seed,identical:r.digestSha256===find('base',r).digestSha256}));
  report.jsonIdentical=report.matches.filter(r=>r.mode.endsWith('-json')).map(r=>({mode:r.mode,size:r.size,seed:r.seed,checkpoint:r.checkpoint,identical:r.digestSha256===find(r.mode.slice(0,-5),r)?.digestSha256}));
  report.summary=[];for(const mode of ['base','new'])for(const size of ['standard','large',null]){const rows=report.matches.filter(r=>r.mode===mode&&(!size||r.size===size)),mean=f=>Math.round(rows.reduce((n,r)=>n+f(r),0)/rows.length*100)/100;
   report.summary.push({mode,size:size||'all',n:rows.length,minutes:mean(r=>r.simulationSeconds/60),shots:mean(r=>r.stats.shots),onTarget:mean(r=>r.stats.onTarget),goals:mean(r=>r.stats.goals),fouls:mean(r=>r.setPieces.fouls[0]+r.setPieces.fouls[1]),penalties:mean(r=>r.setPieces.penalties[0]+r.setPieces.penalties[1]),tackleAttempts:mean(r=>r.stats.tackleAttempts),tacklesWon:mean(r=>r.stats.tacklesWon),slides:mean(r=>r.stats.slideAttempts),passes:mean(r=>r.stats.passes),computeMs:mean(r=>r.computeMs)});}
  console.table(report.summary);console.log(JSON.stringify({oldIdentical:report.oldIdentical,jsonIdentical:report.jsonIdentical}));
  report.pass=report.matches.every(r=>r.finished&&!r.errors.length)&&report.oldIdentical.every(r=>r.identical)&&report.jsonIdentical.every(r=>r.identical&&r.checkpoint)&&report.oldIdentical.length>0&&report.matches.filter(r=>r.mode==='new').every(r=>r.markers.loose===182&&r.markers.pursuit===182);
 }finally{await browser.close();await new Promise(r=>server.close(r));fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');}
 console.log(JSON.stringify({pass:report.pass,out}));if(!report.pass)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});

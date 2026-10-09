'use strict';
// Isolated native browser controllers. No Unity/editor, user browser or device.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out='outputs/3d-quality/defensive-pursuit-v119',source=fs.readFileSync(path.join(root,'dist/world-football-flow-v159.js'),'utf8'),old=fs.readFileSync(path.join(root,out,'before-controller.js'),'utf8'),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const dependencies=['world-offensive-quality-v157.js','world-backpedal-v108.js','world-space-passes-v150.js','pitch-v55.js'],dependencyHashes=Object.fromEntries(dependencies.map(file=>[file,sha(fs.readFileSync(path.join(root,'dist',file)))]));
async function main(){
 const server=require('./ui-redesign/serve.cjs').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--disable-gpu']});
 const report={pass:false,sourceHash:sha(source),beforeControllerHash:sha(old),dependencyHashes,rows:[],errors:[]};
 try{
  for(const baseline of [true,false]){
   const context=await browser.newContext(),page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));
   if(baseline){const a=source.indexOf('function v159DefensiveTarget('),b=source.indexOf('function v159DirectOptions(',a);await page.route('**/world-football-flow-v159.js*',route=>route.fulfill({contentType:'text/javascript',body:source.slice(0,a)+old+source.slice(b)}));}
   await page.goto(`http://127.0.0.1:${server.address().port}/source/index.html?engine=browser&players=wave3`);await page.waitForFunction(()=>window.userMeshyMatchReady&&typeof v119DefensiveThreat==='function',null,{timeout:60000});
   const rows=await page.evaluate(baseline=>{
    let draws=0;Math.random=()=>{draws++;throw Error('Defensive planning consumed RNG');};const rows=[];v65WorldActive={state:{},career:{world:{}}};
    for(const size of ['standard','large'])for(const team of [0,1])for(const scenario of ['carrier','incoming','offside','untargeted','far','recovering','old162']){
     const geometry={version:1,width:44*(size==='large'?1.2:1),length:68*(size==='large'?1.2:1)},scale={x:geometry.width/(v55Field.right-v55Field.left),y:geometry.length/(v55Field.bottom-v55Field.top)},goal=team===0?v55Field.bottom:v55Field.top,dir=team===0?-1:1;
     const person=(pid,t,depth,line='def')=>({pid,n:pid==='defender'?2:pid==='second'?3:9,t,x:.5,y:goal+dir*depth/scale.y,bx:.5,by:goal+dir*36/scale.y,tx:.5,ty:goal+dir*depth/scale.y,keeper:false,line,assignedLine:line,role:line==='def'?-1:1,tacticalRole:line==='def'?'ball-playing-defender':'striker',heightCm:178,fresh:100,spd:16,tec:16,pos:16,pas:16,fin:16,sta:16,tak:16,air:16,str:14,instructions:[]});
     const attacker=person('carrier',1-team,14,'att'),defender=person('defender',team,22),second=person('second',team,24),third=person('third',team,29),runner=person('runner',1-team,10,'att');second.x+=4/scale.x;third.x-=12/scale.x;
     const m={geometry,people:[attacker,defender,second,third,runner],owner:attacker,flight:null,ball:{x:attacker.x,y:attacker.y},elapsed:0,score:[0,0],goals:[],attackFlow:{version:152,qualityVersion:157,flowVersion:159,paceVersion:162,...scenario==='old162'?{}:{paceRevision:119},intents:{},defenseReads:{[defender.pid]:{team:1-team,nextAt:10,target:{x:defender.bx,y:defender.by},purpose:'receiver'}}},defenseLines:[0,0]};match=m;
     if(['incoming','offside','untargeted'].includes(scenario)){
      m.owner=null;const endDepth=scenario==='untargeted'?42:10;m.flight={x:.5,y:goal+dir*26/scale.y,target:{x:.5,y:goal+dir*endDepth/scale.y},duration:.8*MATCH_SPEED,progress:.5,team:1-team};m.ball={x:.5,y:goal+dir*(26+endDepth)/2/scale.y};
      if(scenario!=='untargeted'){runner.interceptTarget=m.flight.target;v127GroundReceivers.set(m.flight,{receiver:runner,offside:scenario==='offside'});}
     }
     if(scenario==='far'){attacker.y=goal+dir*42/scale.y;m.ball={x:attacker.x,y:attacker.y};}
     if(scenario==='recovering')defender.recoverUntil=10;
     const ready=m.people.filter(p=>p.t===team&&!p.keeper&&!p.slideActive&&(p.recoverUntil||0)<=m.elapsed),threat=v119DefensiveThreat(m,team,ready),urgent=Boolean(threat?.chasers.includes(defender));
     const before={x:defender.x,y:defender.y};v157Body(defender).heading=dir===1?Math.PI:0; // Face the threatened goal.
     const startDraws=draws;v157Target(m,defender,.025);const initial={x:defender.tx,y:defender.ty},purpose=m.attackFlow.defenseReads[defender.pid].purpose;
     for(let i=0;i<30;i++){v157Target(m,defender,.025);v157Move(m,defender,.025);m.elapsed+=.025*MATCH_SPEED;}
     rows.push({baseline,size,team,scenario,urgent:!baseline&&urgent,chasers:threat?.chasers.map(p=>p.pid)||[],purpose,playerDepth:22,targetDepth:Math.abs(initial.y-goal)*scale.y,endDepth:Math.abs(defender.y-goal)*scale.y,initialBallGap:v122Metres(before,m.ball),endBallGap:v122Metres(defender,m.ball),targetAnchorGap:v122Metres(initial,{x:defender.bx,y:defender.by}),travel:v122Metres(before,defender),draws:draws-startDraws,fresh:defender.fresh});
    }return rows;
   },baseline);report.rows.push(...rows);await context.close();
  }
  assert.deepEqual(report.errors,[]);for(const row of report.rows){assert.equal(row.draws,0);assert.equal(row.fresh,100);assert(row.travel<8);}
  for(const row of report.rows.filter(row=>!row.baseline)){
   if(['carrier','incoming'].includes(row.scenario)){assert(row.urgent);assert(row.targetDepth<row.playerDepth,JSON.stringify(row));assert(row.endDepth<row.playerDepth-.3,JSON.stringify(row));assert(row.endBallGap<row.initialBallGap,JSON.stringify(row));const before=report.rows.find(b=>b.baseline&&b.size===row.size&&b.team===row.team&&b.scenario===row.scenario);assert(before.targetDepth>before.playerDepth);}
   else{assert(!row.urgent,JSON.stringify(row));assert(row.targetAnchorGap<=12.001,JSON.stringify(row));}
   if(row.scenario==='recovering')assert(!row.chasers.includes('defender'));
  }
  assert.equal(sha(fs.readFileSync(path.join(root,'dist/world-football-flow-v159.js'),'utf8')),report.sourceHash);for(const file of dependencies)assert.equal(sha(fs.readFileSync(path.join(root,'dist',file))),dependencyHashes[file]);report.pass=true;
  fs.writeFileSync(path.join(root,out,'native.json'),JSON.stringify(report,null,2)+'\n');process.stdout.write(JSON.stringify({pass:true,rows:report.rows.length,hash:report.sourceHash})+'\n');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(error=>{process.stderr.write(error.stack+'\n');process.exitCode=1;});

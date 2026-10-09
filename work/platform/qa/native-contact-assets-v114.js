// Isolated source/build QA. Inject the unchanged unity-integration-v160 helper.
// Exercise the previously divergent complete native match with missing,
// failed, ready and mid-match-changing visual capability flags.
(async()=>{
 const cases=[],checks=[],check=(name,ok)=>{if(!ok)throw Error(name);checks.push(name);};
 const originalStep=step;
 let flags=null,poseChecks=[];
 const withFlags=fn=>{
  const prior=window.D6UserMeshyPlayer,root=prior||{},old={nativeBall:root.nativeBall,nativeShot:root.nativeShot};
  window.D6UserMeshyPlayer=root;
  root.nativeBall=flags?.nativeBall;root.nativeShot=flags?.nativeShot;
  try{return fn();}finally{root.nativeBall=old.nativeBall;root.nativeShot=old.nativeShot;window.D6UserMeshyPlayer=prior;}
 };
 try{
  for(const mode of ['missing','failed','ready','late']){
   flags=mode==='ready'?{nativeBall:true,nativeShot:true}:mode==='failed'?{nativeBall:false,nativeShot:false}:{};
   step=function(...args){if(mode==='late'&&D6QA160.state.minute>=60)flags={nativeBall:true,nativeShot:true};return withFlags(()=>originalStep.apply(this,args));};
   await D6QA160.setup({config:{fieldSize:'large',fieldPlayers:5},unity:false,replays:true});
   const person=match.people.find(p=>!p.keeper);
   withFlags(()=>{
    for(const [kind,duration]of [['pass',.62],['receive',.45],['control',.48],['shot',.95],['freeKick',.95],['highPass',.78]]){
     const pose=v102Pose(match,person,kind,{x:.5,y:.5});check(mode+' fixed '+kind+' duration',pose.duration===duration);
     poseChecks.push({mode,kind,duration:pose.duration});
    }
   });
   // Start afresh so the direct timing probes cannot affect the full match.
   const result=await D6QAScenario({fieldSize:'large',fieldPlayers:5},false);
   check(mode+' full match and JSON continuation',result.digest.finished&&result.digest.booked&&result.digest.valid&&result.cp.saved&&result.cp.restored);
   cases.push({mode,digest:result.digest,checkpoint:result.cp,score:result.end.score});
  }
  const ref=cases[0].digest;
  for(const c of cases.slice(1))check('Exact match/model/report/finance parity '+c.mode,JSON.stringify(c.digest)===JSON.stringify(ref));
  return {pass:true,checks,poseChecks,cases,limitation:'Visual flags are overridden only during native synchronous steps; actual model-download delay is tested separately by the Unity loading suite.'};
 }finally{step=originalStep;}
})()

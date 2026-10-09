(async()=>{
 const checks=[],check=(name,ok)=>{if(!ok)throw Error(name);checks.push(name)};
 // This probe isolates snapshot/reference semantics. Actual storage and page
 // reloads are exercised separately by repro-double-reload-114.cjs.
 const save=v64UiSave;v64UiSave=()=>true;
 try{
 for(const fieldSize of ['standard','large'])for(const fieldPlayers of [5,6]){
  await D6QA160.setup({config:{fieldSize,fieldPlayers},unity:false,replays:false});
  const context=v65Context(),prefix=fieldSize+'/'+fieldPlayers;
  for(const kind of ['kickoff','setPiece','throwIn','owner']){
   const people=match.people,taker=people.find(p=>!p.keeper),support=people.find(p=>!p.keeper&&p!==taker);
   match.flight=null;match.slide=null;match.kickoff=null;match.setPiece=null;match.throwIn=null;match.postBanner=null;match.owner=null;
   if(kind==='kickoff')match.kickoff={phase:'waiting',t:0,kicker:taker,support};
   else if(kind==='setPiece')match.setPiece={type:'freeKick',team:0,taker,phase:'waiting',spot:{x:taker.x,y:taker.y},wait:1};
   else if(kind==='throwIn')match.throwIn={team:0,taker,wait:1};
   else match.owner=taker;
   // Exercise the real snapshot and reference binding, including repeat load.
   v65Snapshot(context);
   const saved=context.state.physicalSnapshot,before=JSON.stringify(saved);
   match=null;check(prefix+'/'+kind+' restores',v65Restore(context));
   const restored=match,actual=()=>kind==='kickoff'?match.kickoff.kicker:kind==='setPiece'?match.setPiece.taker:kind==='throwIn'?match.throwIn.taker:match.owner;
   check(prefix+'/'+kind+' binds real player ID',actual()?.pid===taker.pid&&match.people.includes(actual()));
   check(prefix+'/'+kind+' keeps stored snapshot unchanged',match!==saved.match&&JSON.stringify(saved)===before);
   match=null;check(prefix+'/'+kind+' restores a second time with the same player',v65Restore(context)&&actual()?.pid===taker.pid&&JSON.stringify(saved)===before);
   // Already affected saves have the player's stored object instead of its pid.
   const bad=JSON.parse(before),m=bad.match;
   if(kind==='kickoff'){m.kickoff.kicker={pid:taker.pid};delete m.kickoff.kickerPid;m.kickoff.support={pid:support.pid};delete m.kickoff.supportPid;}
   else if(kind==='setPiece'){m.setPiece.taker={pid:taker.pid};delete m.setPiece.takerPid;}
   else if(kind==='throwIn'){m.throwIn.taker={pid:taker.pid};delete m.throwIn.takerPid;}
   else{m.owner={pid:taker.pid};delete m.ownerPid;}
   context.state.physicalSnapshot=bad;match=null;
   check(prefix+'/'+kind+' binds the existing ID in an affected save',v65Restore(context)&&actual()?.pid===taker.pid&&match.people.includes(actual()));
   context.state.physicalSnapshot=saved;match=restored;
  }
 }
 return {pass:true,checks,persistence:'isolated structural probe; actual page reload proof is separate'};
 }finally{v64UiSave=save;}
})()

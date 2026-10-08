(async()=>{
 const config=window.D6NativeTestConfig||{fieldSize:'large',fieldPlayers:5},rows=[],checks=[],check=(n,v)=>{if(!v)throw Error(n);checks.push(n)},originalRandom=Math.random,originalReplay=v103CanReplay;
 const digest=(c,f,s)=>JSON.stringify({score:s.score,events:s.events,stats:s.stats,fresh:s.fresh,minutes:s.minutes,report:s.postMatchReport,ballAccounting:match.ballAccounting,geometry:match.geometry,people:match.people.map(p=>({pid:p.pid,x:p.x,y:p.y,fresh:p.fresh,stats:p.stats})),model:c.world.clubs.flatMap(club=>club.roster).map(p=>({pid:p.pid,skills:D6PlayerGeneration.SKILL_KEYS.map(k=>p[k]),development:p.playerModel?.development,routine:p.playerModel?.roleModel?.routine}))});
 try{
  for(const restore of [false,true]){
   let rng=169032;Math.random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296};
   const c=v61CreateCareer('GER-2',`native-full-${config.fieldSize}-${config.fieldPlayers}`,'Native QA',undefined,config),club=v66Own(c);v66ChooseSponsor(c,club.id,club.sponsors[0].id);v124SetYouthBudget(c,0);while(c.world.market.phase==='open')await v66NextMarketDay(c);
   const f=v62Fixtures(c).filter(f=>!f.result&&[f.homeId,f.awayId].includes(club.id)).sort((a,b)=>a.day-b.day)[0],s=v64MakeState(c,f);c.world.activeMatch={fixtureId:f.id,state:s};v61CurrentCareer=c;s.phase='paused';match=null;v65WorldActive=null;v98View='2d';v65Show(v65Context());clearInterval(v65WorldFrame);v103CanReplay=()=>false;v65Resume();clearInterval(v65WorldFrame);
   let ticks=0,halftime=false,checkpoint=false;const startGeometry=JSON.stringify(match.geometry);
   while(!match.finished&&ticks++<18000){
    const context=v65Context();if(context.state.phase==='paused'){halftime||=match.halftimePause>0;v65Resume();clearInterval(v65WorldFrame)}
    if(!checkpoint&&s.minute>=20&&!match.flight&&!match.slide&&!match.setPiece&&!match.throwIn&&!match.kickoff){if(restore){check('Real JSON checkpoint saved',v65Snapshot(context)!==false);s.physicalSnapshot=JSON.parse(JSON.stringify(s.physicalSnapshot));match=null;check('Real JSON checkpoint accepted',v65Restore(context));}checkpoint=true;}
    step(.05*MATCH_SPEED,.05);if(context.state.phase==='live'&&!match.finished)v65AfterStep(context);
   }
   check(`Native reaches final whistle ${restore}`,match.finished&&s.phase==='finished'&&ticks<18000);
   check(`Halftime reached ${restore}`,halftime);
   check(`Stable world geometry ${restore}`,startGeometry===JSON.stringify(match.geometry)&&match.people.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
   check(`Valid final career ${restore}`,v61ValidateCareer(c));
   check(`Checkpoint exercised ${restore}`,!restore||checkpoint);
   rows.push({restore,ticks,score:s.score,minutes:s.minute,digest:digest(c,f,s)});
   v65WorldActive=null;v61CurrentCareer=null;match=null;clearInterval(v65WorldFrame);
  }
  window.D6NativeParity=rows;
  check('Complete gameplay/report/model parity after JSON',rows[0].digest===rows[1].digest);
  return {config,checks,matches:rows.map(({digest,...r})=>r)};
 }finally{Math.random=originalRandom;v103CanReplay=originalReplay;clearInterval(v65WorldFrame)}
})()

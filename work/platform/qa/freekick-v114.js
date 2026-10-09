(async()=>{
 const checks=[],cases=[],check=(s,ok)=>{if(!ok)throw Error(s);checks.push(s)};
 for(const fieldSize of ['standard','large'])for(const fieldPlayers of [5,6])for(const team of [0,1]){
  await D6QA160.setup({config:{fieldSize,fieldPlayers},unity:false});
  const m=match,p=m.people.find(p=>p.t===team&&!p.keeper),q=m.people.find(q=>q.t===team&&!q.keeper&&q!==p),side=team===0?1:-1;
  for(const a of m.people.filter(a=>a.t===team&&!a.keeper)){a.x=.5;a.y=.5+side*.1;}
  q.y=.5-side*.3;
  for(const r of m.people.filter(r=>r.t!==team&&!r.keeper)){r.x=.7;r.y=.5-side*.1;}
  m.kickoff=null;m.postBanner=null;m.setPiece=null;m.goalPause=0;m.owner=p;m.flight=null;m.elapsed=15;
  p.offenseMotion={...v157InitialBody(p),heading:team===0?0:Math.PI};
  const piece={type:'freeKick',team,taker:p,spot:{x:.5,y:.5+side*.15}};
  v50TakeFreeKick(piece);
  const tag=`${fieldSize}/${fieldPlayers}/team${team}`;
  check(tag+' queues a physical turn',!!m.attackFlow.pendingTurn);
  check(tag+' receiver is offside before the kick',v55OffsideSnapshot(p).offside.has(q));
  const turn=m.attackFlow.pendingTurn;
  turn.until=v152Seconds(m)-1;v157Prepare(m);
  check(tag+' obligatory restart survives old normal-turn expiry',m.attackFlow.pendingTurn===turn);
  check(tag+' blocked/offside lane cannot cancel into a carry',v157ContinueTurn(m,p,m.people.filter(r=>r.t!==team))&&m.attackFlow.pendingTurn===turn);
  let ticks=0;
  while(!m.flight&&ticks++<120){v157Move(m,p,.05);v157ContinueTurn(m,p,m.people.filter(r=>r.t!==team));}
  check(tag+' kick releases the ball after actual rotation',!!m.flight&&m.owner===null&&ticks>1&&ticks<120&&!m.attackFlow.pendingTurn);
  cases.push({fieldSize,fieldPlayers,team,ticks,flight:true,passes:p.stats.passes});
 }
 return {pass:true,checks,cases};
})()

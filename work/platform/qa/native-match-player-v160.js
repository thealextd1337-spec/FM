(async()=>{
 const report={checks:[],matrix:[],matches:[]},check=(name,value)=>{if(!value)throw Error(name);report.checks.push(name)},copy=o=>JSON.parse(JSON.stringify(o));
 const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 await v61InitStorage();
 check('Regular careers have model parameters without a query flag',D6PlayerFoundationOptions.parameterId==='native-player-v160-1'&&!window.D6PlayerFoundationPreviewOptions);
 for(const fieldSize of ['standard','large'])for(const fieldPlayers of [5,6]){
  const seed=`native-v160-${fieldSize}-${fieldPlayers}`,config={fieldSize,fieldPlayers},c=v61CreateCareer('GER-2',seed,'Native QA',undefined,config),g=v160WorldGeometry(c),club=v66Own(c);
  check(`Valid career ${seed}`,v61ValidateCareer(c));
  const preview=v61FlowRoster(v61Catalog.find(x=>x.id===club.id),seed);
  for(const p of club.roster){const q=preview.find(q=>q.pid===p.pid);check(`Preview identity/form/skills ${p.pid}`,q&&q.name===p.name&&q.form===p.form&&q.fresh===p.fresh&&D6PlayerGeneration.SKILL_KEYS.every(k=>q[k]===p[k])&&eq(q.playerModel.playablePositions,p.playerModel.playablePositions));}
  const f=v62Fixtures(c).find(f=>f.homeId===club.id),s=v64MakeState(c,f);
  check(`Both lineups ${seed}`,s.active.length===fieldPlayers+1&&s.awayActive.length===fieldPlayers+1);
  for(const side of [0,1])for(const formation of v160Formations(c)){v64SetFormation(c,f,s,side,formation);check(`Unique roles/cells ${seed}/${side}/${formation}`,new Set(v64Active(s,side)).size===fieldPlayers+1&&new Set(v64Active(s,side).filter(id=>s.roles[id]!=='gk').map(id=>s.cells[id])).size===fieldPlayers);}
  const before=JSON.stringify(s);let rejected=false;try{v64SetFormation(c,f,s,0,fieldPlayers===5?'2–2–2':'2–2–1')}catch{rejected=true}check(`Wrong formation rejected without mutation ${seed}`,rejected&&JSON.stringify(s)===before);
  v64SetFormation(c,f,s,0,`${fieldPlayers}–0–0`);const plan=v64CareerPlanSnapshot({fixture:f,state:s});check(`Unoccupied zones preserved ${seed}`,v64CareerPlanNormalize(c,plan).tactics.formation===`${fieldPlayers}–0–0`);
  v64UiQuickLineup(c,f,s,0,'offensive');s.minute=70;s.score=[0,1];v64AiAdjust(c,f,s,0,'Tor');check(`AI keeps configured count ${seed}`,v64Active(s,0).length===fieldPlayers+1&&s.tactics[0].formation.split('–').map(Number).reduce((a,b)=>a+b,0)===fieldPlayers);
  c.world.activeMatch={fixtureId:f.id,state:s};v61CurrentCareer=c;v65WorldActive=v65Context();v65CreateMatch(v65WorldActive);match.kickoff=null;match.countdown=0;match.flight=null;match.slide=null;
  check(`Actual native geometry ${seed}`,eq(match.geometry,g)&&match.people.length===2*(fieldPlayers+1));
  const scale=v150Scale(),r=g.ballRadius/scale.x,left=v55Field.left;
  check(`Whole ball boundary ${seed}`,!v55Exit({x:left+.01,y:.5},{x:left-r*.5,y:.5})&&v55Exit({x:left+.01,y:.5},{x:left-r*1.1,y:.5})?.edge==='left');
  for(const team of [0,1]){
   const k=match.people.find(p=>p.keeper&&p.t===team),goal=team===0?v55Field.bottom:v55Field.top,dir=team===0?-1:1,point={x:.5,y:goal+dir*(g.penaltyDepth-.01)/scale.y};
   check(`Own box permission ${seed}/${team}`,v160KeeperHands(match,k,point));
   check(`Outside box denied ${seed}/${team}`,!v160KeeperHands(match,k,{x:.5,y:goal+dir*(g.penaltyDepth+.01)/scale.y}));
   check(`Opponent box denied ${seed}/${team}`,!v160KeeperHands(match,k,{x:.5,y:1-point.y}));
   const ledger=match.ballAccounting;ledger.events.push({id:++ledger.sequence,kind:'pass',team,actorPid:match.people.find(p=>!p.keeper&&p.t===team).pid});match.ballEventId=ledger.sequence;
   check(`Own foot pass denied ${seed}/${team}`,!v160KeeperHands(match,k,point));
   ledger.events.push({id:++ledger.sequence,kind:'throw',team,actorPid:'thrower'});match.ballEventId=ledger.sequence;
   check(`Own throw denied ${seed}/${team}`,!v160KeeperHands(match,k,point));
   ledger.events.push({id:++ledger.sequence,kind:'pass',team,actorPid:k.pid});match.ballEventId=ledger.sequence;
   check(`Keeper kick exception ${seed}/${team}`,v160KeeperHands(match,k,point));
   delete match.ballEventId;
  }
  check(`Fixed physical goal size ${seed}`,Math.abs((v160GoalX(.6)-v160GoalX(.4))*scale.x-g.goalWidth)<1e-9);
  const carrier=match.people.find(p=>!p.keeper&&p.t===0);match.breakawayCarrier=carrier;
  v123GroundControls.set(match,{person:carrier,at:-Infinity,direction:{x:0,y:-1},heading:Math.PI});
  v121PositioningSamples.set(match,{at:12,positions:new Map([[carrier,{x:carrier.x,y:carrier.y}]])});
  check(`Snapshot created ${seed}`,v65Snapshot(v65WorldActive)!==false);await v61LastWrite;const snapshot=copy(s.physicalSnapshot);s.physicalSnapshot=snapshot;const geometry=copy(match.geometry);match=null;check(`JSON restore geometry/count ${seed}`,v65Restore(v65WorldActive)&&eq(match.geometry,geometry)&&match.people.length===2*(fieldPlayers+1));
  check(`JSON observation references ${seed}`,match.breakawayCarrier===match.people.find(p=>p.pid===carrier.pid)&&v123GroundControls.get(match).person===match.breakawayCarrier&&v123GroundControls.get(match).at===-Infinity&&v121PositioningSamples.get(match).positions.has(match.breakawayCarrier));
  report.matrix.push({config:c.world.matchConfig,geometry:g,players:match.people.length});
  v65WorldActive=null;v61CurrentCareer=null;match=null;
  const compact=v64MakeState(c,{...f,plan:undefined});let n=0;while(compact.phase!=='finished'&&n++<110)v64Step(c,f,compact);check(`Complete compact match ${seed}`,compact.phase==='finished'&&Object.values(compact.fresh).every(Number.isFinite));
 }
 // A missing configuration on historical data remains unchanged on read/validation.
 const old=v61CreateCareer('GER-2','native-v160-old','QA',null);delete old.world.matchConfig;const oldBytes=JSON.stringify(old);check('Old unmarked career remains inert',v61ValidateCareer(old)&&!v154Active(old)&&eq(v160WorldConfig(old),{fieldSize:'standard',fieldPlayers:5})&&oldBytes===JSON.stringify(old));
 const bad=copy(old);bad.world.matchConfig={version:1,fieldSize:'large',fieldPlayers:7};check('Invalid imported configuration rejected',!v61ValidateCareer(bad));
 return report;
})()

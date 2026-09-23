'use strict';

const v55LineNames={[-1]:'Tief',0:'Neutral',1:'Hoch'};
const v55PositionNames={def:'Verteidigung',mid:'Mittelfeld',att:'Angriff'};
const v55OpponentLines={hafen:0,nord:1,union:-1,athletik:1,vorstadt:-1};
const v55ZoneStyle=document.createElement('style');
v55ZoneStyle.textContent=`#setup-pitch .v55-zone-guide{position:absolute;inset:32px 18px 72px;z-index:2;pointer-events:none}.v55-zone-line{position:absolute;left:0;right:0;border-top:2px solid #dcf4d2c9;box-shadow:0 1px 0 #102920}.v55-zone-mid{top:28.5714%}.v55-zone-def{top:71.4286%}.v55-zone-line b{position:absolute;top:2px;right:1px;padding:2px 4px;border-radius:3px;background:#193b31;color:#edf7e8;font:800 8px/1.1 Inter,Arial,sans-serif;letter-spacing:.5px}.grid .cell.v55-foreign-position{outline:2px solid #f0bd64;outline-offset:-2px;background:#f0bd641c}.grid .cell.v55-foreign-position .position-label{color:#ffe4a4}.grid .cell.v55-foreign-position .position-label::after{content:'!';display:inline-grid;place-items:center;width:11px;height:11px;margin-left:3px;border-radius:50%;background:#f0bd64;color:#261c0d;font-size:9px;font-weight:900}.grid .cell.v55-foreign-position .token{border-color:#f0bd64}.v55-position-note{margin:0 0 11px;padding:8px 9px;border:1px solid #9f763b;border-radius:5px;background:#3b3022;color:#ffe4aa;font-size:11px;line-height:1.45}.v55-starter-position-note{display:block;margin-top:4px;color:#f2c77d;font-size:10px;font-weight:700;line-height:1.35}@media(max-width:760px){#setup-pitch .v55-zone-guide{inset:30px 10px 68px}.v55-zone-line b{font-size:7px}.v55-position-note{font-size:11px}}`;
document.head.append(v55ZoneStyle);
let defenseLine=0;
if(typeof v24BenchHTML==='function'){
 const baseBench=v24BenchHTML;
 v24BenchHTML=function(player){return baseBench(player).replace(/<span class="bench-skills">[^<]*<\/span>/,`<span class="bench-skills">${v55ColorSkills(v24TopSkills(player),player)}</span>`)};
}

$('#tactics-panel .plan-card').insertAdjacentHTML('beforebegin',`<fieldset id="v55-defense-line"><legend>Abwehrlinie</legend><div class="segmented" role="group" aria-label="Abwehrlinie"><button type="button" data-defense-line="-1">Tief</button><button type="button" data-defense-line="0">Neutral</button><button type="button" data-defense-line="1">Hoch</button></div><p class="help">Bestimmt die Grundhöhe aller eingesetzten Verteidiger, unabhängig vom Aufstellungsraster.</p></fieldset>`);
$('#shots').insertAdjacentHTML('afterend',`<div class="stats" id="v55-crosses"><span>Flanken</span><b data-stat-value="home">0</b><b data-stat-value="away">0</b></div><div class="stats" id="v55-headers"><span>Kopfballschüsse</span><b data-stat-value="home">0</b><b data-stat-value="away">0</b></div>`);

function v55PositionForCell(cell){const row=Math.floor(cell/5);return row<2?'att':row<5?'mid':'def'}
function v55EnsureAssignments(){for(const player of players)if(Number.isInteger(player.cell)&&player.cell>=0&&player.cell<35)player.assignedLine=v55PositionForCell(player.cell)}
function v55SyncTactics(){
 v55EnsureAssignments();
 const bar=$('#pitch-role-bar'),player=players[selected];
 if(bar&&typeof v24TopSkills==='function'&&players[selected]){const skills=bar.querySelector('.pitch-role-skills');if(skills)skills.innerHTML=v55ColorSkills(v24TopSkills(players[selected]),players[selected])}
 $$('[data-defense-line]').forEach(button=>{const active=Number(button.dataset.defenseLine)===defenseLine;button.classList.toggle('active',active);button.setAttribute('aria-pressed',active)});
 let note=bar?.querySelector('.v55-position-note');
 if(bar&&player&&player.line!==player.assignedLine){if(!note){bar.querySelector('.pitch-role-skills')?.insertAdjacentHTML('afterend','<p class="v55-position-note"></p>');note=bar.querySelector('.v55-position-note')}if(note)note.textContent=`Positionsfremd eingesetzt: Stammposition ${v55PositionNames[player.line]}, Einsatzposition ${v55PositionNames[player.assignedLine]}. Kleiner Leistungsabschlag im Match.`}
 else note?.remove();
 for(const cell of $$('#grid .cell[data-cell]')){const person=players.find(item=>item.cell===Number(cell.dataset.cell)),label=cell.querySelector('.position-label');if(!person||!label)continue;const foreign=person.line!==person.assignedLine;label.textContent={def:'VER',mid:'MIT',att:'ANG'}[person.assignedLine];cell.classList.toggle('v55-foreign-position',foreign);cell.setAttribute('aria-label',`${person.name}, Einsatz ${v55PositionNames[person.assignedLine]}, Stammposition ${v55PositionNames[person.line]}${foreign?', positionsfremd eingesetzt':''}, Reihe ${Math.floor(person.cell/5)+1}, Spalte ${person.cell%5+1}`);cell.title=foreign?`Positionsfremd: ${v55PositionNames[person.line]} als ${v55PositionNames[person.assignedLine]}`:''}
 for(const card of $$('#v51-starters .v51-starter[data-drag-player]')){const person=players.find(item=>item.n===Number(card.dataset.dragPlayer));if(!person)continue;const foreign=person.line!==person.assignedLine;card.classList.toggle('v55-foreign-position',foreign);let info=card.querySelector('.v55-starter-position-note');if(foreign){if(!info){card.querySelector('.v51-card-main')?.insertAdjacentHTML('beforeend','<span class="v55-starter-position-note"></span>');info=card.querySelector('.v55-starter-position-note')}if(info)info.textContent=`Positionsfremd: ${v55PositionNames[person.line]} als ${v55PositionNames[person.assignedLine]}`}else info?.remove()}
}
const v55BaseRoleBar=v25RoleBar;
v25RoleBar=function(){const result=v55BaseRoleBar();v55SyncTactics();return result};
const v55BaseRender=render;
render=function(){v55EnsureAssignments();const result=v55BaseRender();v55SyncTactics();return result};
const v55BaseShowTactics=showTactics;
showTactics=function(){const result=v55BaseShowTactics();v55SyncTactics();return result};
const v55BaseUpdatePlan=updatePlan;
updatePlan=function(){v55BaseUpdatePlan();$('#plan-copy').textContent+=` Abwehrlinie: ${v55LineNames[defenseLine]}.`};
const v55BaseSave=saveCurrent;
saveCurrent=function(){if(activeSave){v55EnsureAssignments();activeSave.defenseLine=defenseLine}return v55BaseSave()};
const v55BaseOpen=openSlot;
openSlot=function(raw){defenseLine=clamp(Number(raw.defenseLine)||0,-1,1);const result=v55BaseOpen(raw);v55EnsureAssignments();v55SyncTactics();return result};
if(typeof v24Snapshot==='function'){
 const baseSnapshot=v24Snapshot;v24Snapshot=function(){const snapshot=baseSnapshot();if(snapshot)snapshot.defenseLine=defenseLine;return snapshot};
 const baseUndo=v24UndoLast;v24UndoLast=function(){const restore=v24Undo?.defenseLine,result=baseUndo();if(result&&restore!==undefined){defenseLine=restore;saveCurrent();render()}return result};
}
const v55BaseValidation=v24Validation;
v24Validation=function(){v55EnsureAssignments();const errors=v55BaseValidation().filter(error=>!error.includes('defensiv positioniert'));if(!players.some(player=>player.assignedLine==='def'))errors.push('Mindestens ein Feldspieler muss in der Abwehrzone stehen.');return errors};
v24PositionWarning=function(){return''};
$('#v55-defense-line').addEventListener('click',event=>{const button=event.target.closest('[data-defense-line]');if(!button||running)return;const next=Number(button.dataset.defenseLine);if(next===defenseLine)return;v24Remember();defenseLine=next;saveCurrent();render()});

const v55BaseEmptyStats=emptyStats;
emptyStats=function(){return{...v55BaseEmptyStats(),crosses:0,crossComplete:0,highPasses:0,highComplete:0,headers:0,headerPasses:0,volleys:0,aerialDuels:0,aerialWon:0}};
for(const key of ['crosses','crossComplete','highPasses','highComplete','headers','headerPasses','volleys','aerialDuels','aerialWon'])if(!statKeys.includes(key))statKeys.push(key);
const v55BaseTeamStats=updateTeamStats;
updateTeamStats=function(){v55BaseTeamStats();if(!match?.people)return;for(const [id,key] of [['#v55-crosses','crosses'],['#v55-headers','headers']]){const row=$(id);if(!row)continue;for(const [team,side] of [[0,'home'],[1,'away']])row.querySelector(`[data-stat-value="${side}"]`).textContent=match.people.filter(player=>player.t===team).reduce((sum,player)=>sum+(player.stats[key]||0),0)}};

const v55BaseStart=start;
start=function(){v55EnsureAssignments();const result=v55BaseStart();if(match&&running){match.defenseLines=[defenseLine,v55OpponentLines[activeOpponent()?.id]??0];match.throwIn=null;match.offsideVisual=null;match.lastTouch=null;for(const player of match.people){player.assignedLine=player.assignedLine||player.line;player.initialBy=player.by}$('#live-plan').textContent+=` · Abwehrlinie: ${v55LineNames[defenseLine]} · Gegner: ${v55LineNames[match.defenseLines[1]]}`;$('#duration').textContent='2 × 45 Ingame-Minuten · Sichtbare Einwürfe können das Match verlängern'}return result};
$('#start').onclick=()=>start();

function v55DefenderY(team,line){const home={[-1]:.87,0:.75,1:.63}[line];return team===0?home:1-home}
function v55OffsideLine(team,ball){const defenders=match.people.filter(player=>player.t!==team).sort((a,b)=>team===0?a.y-b.y:b.y-a.y);const second=defenders[1],line=team===0?Math.min(ball.y,second?.y??.5):Math.max(ball.y,second?.y??.5);return line}
function v55PrepareMovement(){const m=match,owner=m.owner;for(const player of m.people){if(player.keeper)continue;const line=player.assignedLine||player.line;player.by=line==='def'?v55DefenderY(player.t,m.defenseLines?.[player.t]||0):line!==player.line?line==='mid'?.5:player.t===0?.245:.755:player.initialBy;if(owner?.t===player.t&&player!==owner){const limit=v55OffsideLine(player.t,{x:owner.x,y:owner.y}),targetShift=.068+player.role*.055+.013;player.by=player.t===0?Math.max(player.by,limit+.026+targetShift):Math.min(player.by,limit-.026-targetShift)}}}
function v55Approach(player,target,seconds){const d=distance(player,target);if(d<.001)return;const speed=(.08+ability(player,'spd')*.004)*seconds,amount=Math.min(1,speed/d);player.x+=(target.x-player.x)*amount;player.y+=(target.y-player.y)*amount;player.tx=player.x;player.ty=player.y}
function v55ThrowStep(delta,realDelta){const m=match,throwIn=m.throwIn;if(!throwIn)return;m.elapsed=Math.min(74.99,m.elapsed+delta*.18);const side=throwIn.spot.x<.5?1:-1,receiverX=throwIn.spot.x+side*.11,takerSpot={x:throwIn.spot.x,y:throwIn.spot.y},teammates=m.people.filter(player=>player.t===throwIn.team&&!player.keeper&&player!==throwIn.taker),rivals=m.people.filter(player=>player.t!==throwIn.team&&!player.keeper);v55Approach(throwIn.taker,takerSpot,realDelta);teammates.forEach((player,index)=>v55Approach(player,{x:clamp(receiverX+side*(index%2)*.08,.09,.91),y:clamp(throwIn.spot.y+(index-1.5)*.055,.1,.9)},realDelta*.75));rivals.forEach((player,index)=>v55Approach(player,{x:clamp(receiverX+side*.09,.09,.91),y:clamp(throwIn.spot.y+(index-2)*.06,.1,.9)},realDelta*.65));if(distance(throwIn.taker,takerSpot)<.023)throwIn.ready+=realDelta;if(throwIn.ready>.55){m.throwIn=null;const receiver=[...teammates].sort((a,b)=>distance(a,throwIn.spot)-distance(b,throwIn.spot))[0],target={x:receiver.x,y:receiver.y};m.owner=throwIn.taker;m.ball={...throwIn.spot};m.lastTouch=throwIn.team;receiver.interceptTarget=target;note(`${throwIn.taker.name} wirft auf ${receiver.name} ein.`,'restart');fly(target,.55,()=>{receiver.interceptTarget=null;if(distance(receiver,target)>.055){v50LooseBall(target,`${receiver.name} erreicht den Einwurf nicht.`);return}m.owner=receiver;m.lastPass=null;m.next=m.elapsed+.65})}updateTeamStats()}
const v55BaseStep=step;
step=function(delta,realDelta){if(match?.throwIn&&!match.finished){v55ThrowStep(delta,realDelta);return}if(match&&!match.finished)v55PrepareMovement();const result=v55BaseStep(delta,realDelta);if(match?.offsideVisual&&!match.setPiece)match.offsideVisual=null;return result};
const v55BaseDraw=draw;
draw=function(){const result=v55BaseDraw();if(!match)return result;const ctx=$('#canvas').getContext('2d');if(match.offsideVisual){const scene=match.offsideVisual;ctx.save();ctx.strokeStyle='#ffda68';ctx.lineWidth=3;ctx.setLineDash([10,7]);ctx.beginPath();ctx.moveTo(28,scene.lineY*740);ctx.lineTo(572,scene.lineY*740);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#ffda68';ctx.lineWidth=4;ctx.beginPath();ctx.arc(scene.x*600,scene.y*740,25,0,Math.PI*2);ctx.stroke();ctx.restore()}const flight=match.flight;if(flight?.aerial){const q=Math.min(1,flight.progress),ball=match.ball,x=ball.x*600,y=ball.y*740,height=Math.sin(Math.PI*q)*54;ctx.save();ctx.fillStyle='#214e43';ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(x,y+3,7,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.strokeStyle='#17292b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y-height,6,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore()}return result};

const v55Field={left:28/600,right:572/600,top:26/740,bottom:714/740};
function v55Exit(from,to){
 const hit=[];
 for(const [edge,value,axis] of [['left',v55Field.left,'x'],['right',v55Field.right,'x'],['top',v55Field.top,'y'],['bottom',v55Field.bottom,'y']]){
  const change=to[axis]-from[axis];if(Math.abs(change)<.00001)continue;
  if(edge==='left'&&!(from.x>=value&&to.x<value)||edge==='right'&&!(from.x<=value&&to.x>value)||edge==='top'&&!(from.y>=value&&to.y<value)||edge==='bottom'&&!(from.y<=value&&to.y>value))continue;
  const t=(value-from[axis])/change;if(t<=0||t>1)continue;
  const other=axis==='x'?'y':'x',limit=axis==='x'?[v55Field.top,v55Field.bottom]:[v55Field.left,v55Field.right],coordinate=from[other]+(to[other]-from[other])*t;
  if(coordinate>=limit[0]-.001&&coordinate<=limit[1]+.001)hit.push({edge,t,x:axis==='x'?value:coordinate,y:axis==='y'?value:coordinate});
 }
 hit.sort((a,b)=>a.t-b.t);return hit[0]||null;
}
function v55BoundaryStop(hit){return{x:hit.edge==='left'?.02:hit.edge==='right'?.98:hit.x,y:hit.edge==='top'?.015:hit.edge==='bottom'?.985:hit.y}}
function v55OffsideSnapshot(passer,exempt=false){
 const lineY=v55OffsideLine(passer.t,match.ball),offside=new Set();
 if(!exempt)for(const player of match.people)if(player.t===passer.t&&!player.keeper&&player!==passer){if(passer.t===0?player.y<.5&&player.y<lineY-.004:player.y>.5&&player.y>lineY+.004)offside.add(player)}
 return{lineY,offside,ball:{...match.ball},positions:new Map(match.people.map(player=>[player,{x:player.x,y:player.y}]))};
}
function v55WhistleOffside(snapshot,player){
 const team=1-player.t,offender=snapshot.positions.get(player)||player,spot={x:clamp(offender.x,.09,.91),y:clamp(offender.y,.07,.93)};
 match.setPieceStats.freeKicks[team]++;
 v50Restart('offside',team,spot,`${player.name} steht beim Abspiel im Abseits. Freistoß für ${v50Name(team)}.`);
 for(const [person,position] of snapshot.positions)v50Spot(person,position);
 match.ball={...snapshot.ball};
 match.offsideVisual={lineY:snapshot.lineY,x:offender.x,y:offender.y};
 showOverlay('ABSEITS',`${player.name} · Freistoß für ${v50Name(team)}`);
 return true;
}
function v55BeginThrow(hit,lastTouch){
 const m=match,team=1-lastTouch,spot=v55BoundaryStop(hit),taker=[...v50Outfield(team)].sort((a,b)=>distance(a,spot)-distance(b,spot))[0];
 m.owner=null;m.flight=null;m.rebound=null;m.lastPass=null;m.next=Infinity;m.ball={...spot};m.throwIn={team,spot,taker,ready:0};m.lastTouch=lastTouch;
 note(`Aus! Einwurf für ${v50Name(team)}. ${taker.name} läuft zur Seitenlinie.`,'restart');
}
function v55Out(hit,lastTouch,description){
 if(hit.edge==='left'||hit.edge==='right'){v55BeginThrow(hit,lastTouch);return}
 const attacker=hit.edge==='top'?0:1,defender=1-attacker;
 if(lastTouch===attacker)v50GoalKick(v50Keeper(defender),`${description} Abstoß für ${v50Name(defender)}.`);
 else v50Corner(attacker,hit.x,description);
}
function v55GroundPass(passer,receiver,kind='pass',exempt=false){
 const m=match,snapshot=v55OffsideSnapshot(passer,exempt),from={x:m.ball.x,y:m.ball.y},pressure=m.people.filter(player=>player.t!==passer.t&&!player.keeper&&distance(player,passer)<.15).length;
 const accuracy=clamp((20-ability(passer,'pas'))*.003+pressure*.015,.005,.1),target={x:receiver.x+(random()-.5)*accuracy*2,y:receiver.y+(random()-.5)*accuracy*2};
 if(kind==='header')passer.stats.headerPasses++;
 passer.stats.passes++;m.lastTouch=passer.t;
 const forward=passer.t===0?passer.y-target.y:target.y-passer.y;if(forward>.12)passer.stats.progressive++;
 const exit=v55Exit(from,target),end=exit?v55BoundaryStop(exit):target,duration=clamp(distance(from,end)*1.5,.32,.9);
 if(kind==='header')note(`${passer.name} köpft zu ${receiver.name}.`);else note(`${passer.name} spielt auf ${receiver.name}.`);
 const rivals=m.people.filter(player=>player.t!==passer.t&&!player.keeper),candidate=!exit?rivals.map(player=>({player,geometry:passLaneGeometry(player,from,target)})).filter(item=>{if(!item.geometry)return false;const speed=.07+ability(item.player,'spd')*.00425,arrival=Math.max(0,item.geometry.lateral-.03)/speed;return item.geometry.lateral<.055+ability(item.player,'pos')*.002&&arrival<=duration*item.geometry.t*1.15}).sort((a,b)=>a.geometry.t-b.geometry.t)[0]:null;
 if(candidate&&random()<clamp(.11+ability(candidate.player,'pos')*.016+ability(candidate.player,'spd')*.004-ability(passer,'pas')*.011,.05,.55)){
  const point={x:candidate.geometry.x,y:candidate.geometry.y},interceptor=candidate.player;
  passer.stats.passLost++;interceptor.stats.interceptions++;interceptor.interceptTarget=point;note(`${interceptor.name} fängt den Pass ab.`,'duel');
  fly(point,Math.max(.18,duration*candidate.geometry.t),()=>{interceptor.interceptTarget=null;if(distance(interceptor,point)>.045){v50LooseBall(point,`${interceptor.name} erreicht den Ball nicht mehr.`);return}m.owner=interceptor;m.lastPass=null;m.lastTouch=interceptor.t;m.next=m.elapsed+.7});return;
 }
 if(!exit)receiver.interceptTarget=end;
 fly(end,duration,()=>{
  receiver.interceptTarget=null;
  if(exit){passer.stats.passLost++;v55Out(exit,passer.t,`Fehlpass von ${passer.name}.`);return}
  if(distance(receiver,end)>.055){passer.stats.passLost++;v50LooseBall(end,`${receiver.name} erreicht den Pass nicht.`);return}
  if(snapshot.offside.has(receiver)){v55WhistleOffside(snapshot,receiver);return}
  passer.stats.passComplete++;m.owner=receiver;m.lastPass={passer,receiver,at:m.elapsed};m.next=m.elapsed+.75;
 });
}
function v55HighPass(passer,receiver,{cross=false,exempt=false,corner=false}={}){
 const m=match,snapshot=v55OffsideSnapshot(passer,exempt),from={x:m.ball.x,y:m.ball.y},pressure=m.people.filter(player=>player.t!==passer.t&&!player.keeper&&distance(player,passer)<.15).length;
 const skill=ability(passer,'pas'),error=(20-skill)*.007+pressure*.024,intended={x:receiver.x,y:receiver.y},land={x:receiver.x+(random()-.5)*error*2,y:receiver.y+(random()-.5)*error*2};
 const variant=random();if(cross&&variant<.19)land.y+=passer.t===0?.15:-.15;else if(cross&&variant<.38)land.y+=passer.t===0?-.16:.16;else if(cross&&variant<.50)land.x=passer.x<.5?1.04:-.04;else if(!cross&&variant<.09)land.x=receiver.x<.5?-.04:1.04;
 passer.stats.passes++;passer.stats.highPasses++;if(cross)passer.stats.crosses++;m.lastTouch=passer.t;
 const forward=passer.t===0?passer.y-land.y:land.y-passer.y;if(forward>.12)passer.stats.progressive++;
 const exit=v55Exit(from,land),end=exit?v55BoundaryStop(exit):land,duration=clamp(distance(from,end)*1.25,.55,1.05);
 const label=corner?'Ecke':cross?'Flanke':'hohen Ball';note(`${passer.name} spielt ${corner?'die Ecke':cross?'eine Flanke':'einen hohen Ball'} auf ${receiver.name}.`,corner?'restart':'shot');
 for(const player of m.people)if(!player.keeper&&distance(player,end)<.24)player.interceptTarget=end;
 fly(end,duration,()=>{for(const player of m.people)player.interceptTarget=null;if(cross&&distance(intended,land)>.11){const delta=passer.t===0?land.y-intended.y:intended.y-land.y;note(`Die Flanke von ${passer.name} gerät ${delta>.055?'zu kurz':'zu weit'}.`,'duel')}if(exit){passer.stats.passLost++;v55Out(exit,passer.t,`${label} von ${passer.name} gerät ins Aus.`);return}v55ResolveAir({passer,receiver,end,snapshot,cross})});
 m.flight.aerial=true;
}
function v55ResolveAir({passer,receiver,end,snapshot,cross}){
 const m=match,allies=m.people.filter(player=>player.t===passer.t&&!player.keeper&&player!==passer),rivals=m.people.filter(player=>player.t!==passer.t&&!player.keeper);
 const score=player=>distance(player,end)-ability(player,'air')*.004-ability(player,'pos')*.002;
 const attacker=[...allies].sort((a,b)=>score(a)-score(b))[0],defender=[...rivals].sort((a,b)=>score(a)-score(b))[0];
 const attackReach=attacker&&distance(attacker,end)<.055,defendReach=defender&&distance(defender,end)<.055;
 if(!attackReach&&!defendReach){passer.stats.passLost++;v50LooseBall(end,`Der hohe Ball von ${passer.name} springt frei auf.`);return}
 if(attackReach&&snapshot.offside.has(attacker)&&(!defendReach||distance(attacker,end)<distance(defender,end)+.055)){v55WhistleOffside(snapshot,attacker);return}
 let winner=attackReach?attacker:defender;
 if(attackReach&&defendReach){const attackChance=clamp(.5+(ability(attacker,'air')-ability(defender,'air'))*.024+(ability(attacker,'pos')-ability(defender,'pos'))*.008,.2,.8);winner=random()<attackChance?attacker:defender}
 if(winner.t===passer.t&&snapshot.offside.has(winner)){v55WhistleOffside(snapshot,winner);return}
 if(attackReach&&defendReach){attacker.stats.aerialDuels++;defender.stats.aerialDuels++;attacker.stats.duels++;defender.stats.duels++;winner.stats.aerialWon++;winner.stats.duelsWon++}
 if(winner.t!==passer.t){passer.stats.passLost++;defender.stats.interceptions++;m.lastPass=null;m.lastTouch=defender.t;if(random()<.4){const cleared={x:clamp(end.x+(random()-.5)*.25,.07,.93),y:clamp(end.y+(defender.t===0?-.14:.14),.07,.93)};v50LooseBall(cleared,`${defender.name} köpft den hohen Ball weg.`)}else{m.owner=defender;m.ball={x:defender.x,y:defender.y};m.next=m.elapsed+.55;note(`${defender.name} gewinnt den hohen Ball.`,'duel')}return}
 const progress=winner.t===0?1-winner.y:winner.y,nearGoal=progress>.70,marked=defendReach&&distance(defender,winner)<.11;
 const credit=()=>{passer.stats.passComplete++;passer.stats.highComplete++;if(cross)passer.stats.crossComplete++;m.lastPass={passer,receiver:winner,at:m.elapsed}};
 m.lastTouch=winner.t;m.ball={x:winner.x,y:winner.y};
 if(nearGoal&&random()<(marked?.42:.62)){credit();m.owner=winner;v55Shoot(winner,ability(winner,'air')>=ability(winner,'tec')||marked?'header':'volley');return}
 const next=allies.filter(player=>player!==winner).sort((a,b)=>distance(a,winner)-distance(b,winner))[0];
 if(next&&random()<.32){credit();m.owner=winner;v55GroundPass(winner,next,'header');return}
 const control=clamp(.35+ability(winner,'tec')*.028+ability(winner,'air')*.009-(marked?.12:0)-distance(winner,end)*.6,.2,.9);
 if(random()>control){passer.stats.passLost++;v50LooseBall(end,`${winner.name} verspringt die Annahme des hohen Balls.`);return}
 credit();
 m.owner=winner;m.next=m.elapsed+.55;note(`${winner.name} nimmt den hohen Ball an.`,'duel');
}

function v55Shoot(shooter,kind='shot'){
 const m=match,team=shooter.t,rivals=m.people.filter(player=>player.t!==team),keeper=rivals.find(player=>player.keeper),near=rivals.filter(player=>!player.keeper&&distance(player,shooter)<.15);
 const pressure=near.reduce((sum,player)=>sum+ability(player,'tak'),0),fin=ability(shooter,'fin'),tech=ability(shooter,kind==='header'?'air':'tec');
 shooter.stats.shots++;m.shots[team]++;if(kind==='header')shooter.stats.headers++;if(kind==='volley')shooter.stats.volleys++;
 const goalPoint={x:.44+random()*.12,y:team===0?v55Field.top:v55Field.bottom};
 const blocker=rivals.filter(player=>!player.keeper).map(player=>({player,geometry:passLaneGeometry(player,shooter,goalPoint)})).filter(item=>item.geometry&&item.geometry.lateral<.075).sort((a,b)=>a.geometry.t-b.geometry.t)[0];
 const label=kind==='header'?'köpft aufs Tor':kind==='volley'?'schießt direkt volley':'schießt';
 note(`${shooter.name} ${label}!`,'shot');
 if(blocker&&random()<clamp(.09+ability(blocker.player,'tak')*.012,.1,.34)){
  const point={x:blocker.geometry.x,y:blocker.geometry.y};fly(point,clamp(distance(shooter,point)*1.2,.17,.45),()=>v50Deflect(point,team,blocker.player,`Block von ${blocker.player.name}`));return;
 }
 const onTarget=random()<clamp(.36+fin*.019+tech*.004-pressure*.004,.22,.82);
 if(onTarget){shooter.stats.onTarget++;keeper.stats.faced++}
 const goal=onTarget&&random()<clamp(.13+fin*.022+tech*.004-ability(keeper,'gk')*.011-pressure*.002,.1,.62);
 const end={x:goal?goalPoint.x:onTarget?clamp(keeper.x,.37,.63):random()<.5?.2:.8,y:team===0?v55Field.top:v55Field.bottom};
 fly(end,.48,()=>{if(goal){v50Goal(shooter,keeper);return}if(!onTarget){v50GoalKick(keeper,`${shooter.name} setzt den Ball vorbei. Abstoß.`);return}keeper.stats.saves++;if(random()<.27)v50Deflect(end,team,keeper,`Parade von ${keeper.name}`);else v50GoalKick(keeper,`${keeper.name} hält den Abschluss fest.`)});
}
shoot=function(shooter){v55Shoot(shooter)};

function v55ChooseTarget(p,allies,rivals){
 const forward=other=>p.t===0?p.y-other.y:other.y-p.y;
 const score=other=>forward(other)*(p.t===0&&direct?2:1.4)-distance(p,other)*.75-rivals.filter(rival=>!rival.keeper&&distance(rival,other)<.13).length*.35+ability(other,'pos')*.018;
 const offside=v55OffsideSnapshot(p).offside,eligible=allies.filter(other=>!offside.has(other)),options=eligible.length&&random()<.92?eligible:allies;
 return[...options].sort((a,b)=>score(b)-score(a))[random()<.82?0:Math.min(1,options.length-1)];
}
function v55BreakawaySquare(p,allies,rivals){
 const forward=other=>p.t===0?p.y-other.y:other.y-p.y,offside=v55OffsideSnapshot(p).offside;
 return allies.filter(other=>{
  const lead=forward(other),closerToCenter=Math.abs(other.x-.5)+.07<Math.abs(p.x-.5);
  if(offside.has(other)||lead<-.025||lead>.12||distance(p,other)>.32||Math.abs(p.x-other.x)<.06||!closerToCenter&&lead<.045)return false;
  return rivals.every(rival=>{if(rival.keeper)return true;const lane=passLaneGeometry(rival,p,other);return distance(rival,other)>.13&&(!lane||lane.lateral>.065)});
 }).sort((a,b)=>(Math.abs(a.x-.5)-Math.abs(b.x-.5))+(forward(b)-forward(a)))[0]||null;
}
function v55HasClearRun(p,rivals,progress){
 if(progress<.55)return false;
 return !rivals.some(rival=>!rival.keeper&&Math.abs(rival.x-p.x)<.19&&((p.t===0?p.y-rival.y:rival.y-p.y)>.005)&&((p.t===0?p.y-rival.y:rival.y-p.y)<.34));
}
action=function(){
 const m=match,p=m?.owner;if(!p||m.setPiece||m.throwIn)return;
 if(p.keeper){const safe=m.people.filter(other=>other.t===p.t&&!other.keeper&&other.assignedLine==='def').sort((a,b)=>distance(a,p)-distance(b,p));if(!safe.length){m.next=m.elapsed+.5;return}note(`Kurzer Abstoß: ${p.name} auf ${safe[0].name}.`,'restart');v55GroundPass(p,safe[0],'pass',true);return}
 const rivals=m.people.filter(other=>other.t!==p.t),near=rivals.filter(other=>!other.keeper&&distance(other,p)<.15).sort((a,b)=>distance(a,p)-distance(b,p));
 const progress=p.t===0?1-p.y:p.y,wide=p.x<.29||p.x>.71,allies=m.people.filter(other=>other.t===p.t&&other!==p&&!other.keeper);
 if(v55HasClearRun(p,rivals,progress)){
  const square=v55BreakawaySquare(p,allies,rivals);
  if(square){v55GroundPass(p,square);return}
  if(progress>.72){v55Shoot(p);return}
  if(m.breakawayCarrier!==p){note(`${p.name} läuft frei Richtung Tor.`,'major');m.breakawayCarrier=p}
  m.next=m.elapsed+.6;return;
 }
 m.breakawayCarrier=null;
 const box=allies.filter(other=>(other.t===0?other.y<.34:other.y>.66)&&other.x>.25&&other.x<.75);
 if(progress>.66&&wide&&box.length&&random()<.62){const target=[...box].sort((a,b)=>ability(b,'air')+ability(b,'pos')*.3-ability(a,'air')-ability(a,'pos')*.3)[0];v55HighPass(p,target,{cross:true});return}
 if(progress>.73||(progress>.58&&random()<.17)){v55Shoot(p);return}
 const target=v55ChooseTarget(p,allies,rivals),high=progress<.72&&random()<(p.t===0&&direct?.28:.13);
 if(high)v55HighPass(p,target);else v55GroundPass(p,target);
};

const v55BaseCorner=v50TakeCorner;
v50TakeCorner=function(setPiece){const m=match,taker=setPiece.taker,team=setPiece.team,allies=v50Outfield(team).filter(player=>player!==taker);if(!allies.length)return v55BaseCorner(setPiece);const receiver=[...allies].sort((a,b)=>ability(b,'air')+ability(b,'pos')*.4-ability(a,'air')-ability(a,'pos')*.4)[0];m.owner=taker;m.ball={...setPiece.spot};v55HighPass(taker,receiver,{cross:true,exempt:true,corner:true})};
v50TakeFreeKick=function(setPiece){
 const m=match,taker=setPiece.taker,team=setPiece.team,goalDistance=team===0?setPiece.spot.y:1-setPiece.spot.y;
 v50Spot(taker,setPiece.spot);m.owner=taker;m.ball={...setPiece.spot};m.offsideVisual=null;
 if(setPiece.type!=='offside'&&goalDistance<.38&&setPiece.spot.x>.18&&setPiece.spot.x<.82&&random()<.65){note(`${taker.name} versucht es direkt mit dem Freistoß.`,'restart');v55Shoot(taker);return}
 const allies=v50Outfield(team).filter(player=>player!==taker),receiver=setPiece.type==='offside'?[...allies].sort((a,b)=>distance(a,taker)-distance(b,taker))[0]:[...allies].sort((a,b)=>(team===0?a.y-b.y:b.y-a.y)||distance(a,taker)-distance(b,taker))[0];
 note(`${taker.name} spielt den Freistoß ${setPiece.type==='offside'?'nach Abseits kurz ':''}auf ${receiver.name}.`,'restart');
 v55GroundPass(taker,receiver);
};

const v55BaseVersion=v50Version;
v50Version=function(){v55BaseVersion();document.querySelectorAll('footer span:first-child').forEach(label=>label.textContent='Doppel 6 / PROTOTYP 55');const footer=startScreen?.querySelector('footer');if(footer)footer.textContent='Doppel 6 / PROTOTYP 55'};
v50Version();

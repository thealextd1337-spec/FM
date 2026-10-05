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
start=function(){v55EnsureAssignments();const result=v55BaseStart();if(match&&running){if(!Number.isInteger(match.refereeVariant))match.refereeVariant=Math.floor(Math.random()*3);match.defenseLines=[defenseLine,v55OpponentLines[activeOpponent()?.id]??0];match.throwIn=null;match.offsideVisual=null;match.lastTouch=null;for(const player of match.people){player.assignedLine=player.assignedLine||player.line;player.initialBy=player.by}$('#live-plan').textContent+=` · Abwehrlinie: ${v55LineNames[defenseLine]} · Gegner: ${v55LineNames[match.defenseLines[1]]}`;$('#duration').textContent='2 × 45 Ingame-Minuten · Sichtbare Einwürfe können das Match verlängern'}return result};
$('#start').onclick=()=>start();

function v55DefenderY(team,line){const home={[-1]:.87,0:.75,1:.63}[line];return team===0?home:1-home}
// A deterministic head/torso/boot footprint shared by both views. Arms never
// extend it; rendering frame rate and cosmetic mesh detail cannot decide rules.
function v124OffsideEdge(player,team){
 if(typeof v65WorldActive==='undefined'||!v65WorldActive)return player.y;
 const length=68/(v55Field.bottom-v55Field.top),width=44/(v55Field.right-v55Field.left),dx=(player.motionX||0)*width,dy=(player.motionY||0)*length,d=Math.hypot(dx,dy),goalward=d>.0001?(team===0?-1:1)*dy/d:0;
 const reach=player.slideActive?.28+.95*Math.max(0,goalward):.28;
 return player.y+(team===0?-1:1)*reach/length;
}
function v55OffsideLine(team,ball){const defenders=match.people.filter(player=>player.t!==team).map(player=>v124OffsideEdge(player,team)).sort((a,b)=>team===0?a-b:b-a),second=defenders[1],world=typeof v65WorldActive!=='undefined'&&v65WorldActive,ballEdge=ball.y+(world?(team===0?-1:1)*.1764*(v55Field.bottom-v55Field.top)/68:0);return team===0?Math.min(ballEdge,second??.5):Math.max(ballEdge,second??.5)}
function v55PrepareMovement(){const m=match,owner=m.owner,world=typeof v65WorldActive!=='undefined'&&v65WorldActive,team=owner?.t??(world&&!v121PositioningPaused(m)?v123PossessionTeam(m):null),reference=owner||m.ball;for(const player of m.people){if(player.keeper)continue;const line=player.assignedLine||player.line;player.by=line==='def'?v55DefenderY(player.t,m.defenseLines?.[player.t]||0):line!==player.line?line==='mid'?.5:player.t===0?.245:.755:player.initialBy;if(team===player.t&&player!==owner){const limit=v55OffsideLine(player.t,reference),targetShift=.068+player.role*.055+.013;const margin=typeof v65WorldActive!=='undefined'&&v65WorldActive?v115OffsideMargin(player):.026;player.by=player.t===0?Math.max(player.by,limit+margin+targetShift):Math.min(player.by,limit-margin-targetShift)}}}
function v55Approach(player,target,seconds){const d=distance(player,target);if(d<.001)return;const world=typeof v65WorldActive!=='undefined'&&v65WorldActive,metres=world?Math.hypot((target.x-player.x)*44/(v55Field.right-v55Field.left),(target.y-player.y)*68/(v55Field.bottom-v55Field.top)):d,speed=world?(3+ability(player,'spd')*.14)*seconds:(.08+ability(player,'spd')*.004)*seconds,amount=Math.min(1,speed/metres);player.x+=(target.x-player.x)*amount;player.y+=(target.y-player.y)*amount;player.tx=player.x;player.ty=player.y}
function v55ThrowStep(delta,realDelta){const m=match,throwIn=m.throwIn;if(!throwIn)return;m.elapsed=Math.min((m.fullTimeEnd||75)-.01,m.elapsed+delta*.18);const side=throwIn.spot.x<.5?1:-1,receiverX=throwIn.spot.x+side*.11,takerSpot={x:throwIn.spot.x,y:throwIn.spot.y},teammates=m.people.filter(player=>player.t===throwIn.team&&!player.keeper&&player!==throwIn.taker),rivals=m.people.filter(player=>player.t!==throwIn.team&&!player.keeper);const world=typeof v65WorldActive!=='undefined'&&v65WorldActive;if(!world||throwIn.ready===0)v55Approach(throwIn.taker,takerSpot,realDelta);teammates.forEach((player,index)=>v55Approach(player,{x:clamp(receiverX+side*(index%2)*.08,.09,.91),y:clamp(throwIn.spot.y+(index-1.5)*.055,.1,.9)},realDelta*.75));rivals.forEach((player,index)=>v55Approach(player,{x:clamp(receiverX+side*.09,.09,.91),y:clamp(throwIn.spot.y+(index-2)*.06,.1,.9)},realDelta*.65));if(distance(throwIn.taker,takerSpot)<(world?.0015:.023))throwIn.ready+=realDelta;if(throwIn.ready>.55){m.throwIn=null;const receiver=[...teammates].sort((a,b)=>distance(a,throwIn.spot)-distance(b,throwIn.spot))[0],target={x:receiver.x,y:receiver.y};m.owner=throwIn.taker;m.ball={...throwIn.spot};m.lastTouch=throwIn.team;receiver.interceptTarget=target;note(`${throwIn.taker.name} wirft auf ${receiver.name} ein.`,'restart');fly(target,.55,()=>{receiver.interceptTarget=null;if(distance(receiver,target)>.055){v50LooseBall(target,`${receiver.name} erreicht den Einwurf nicht.`);return}m.owner=receiver;m.lastPass=null;m.next=m.elapsed+.65})}updateTeamStats()}
const v55BaseStep=step;
step=function(delta,realDelta){if(match?.throwIn&&!match.finished){v55ThrowStep(delta,realDelta);return}if(match&&!match.finished)v55PrepareMovement();const result=v55BaseStep(delta,realDelta);if(match?.offsideVisual&&!match.setPiece)match.offsideVisual=null;return result};
const v55BaseDraw=draw;
const v55RefereeFiles=[
 {raised:'referees/white-raised.png',middle:'referees/white-middle.png',far:'referees/white-far.png',penalty:'referees/white-penalty.png'},
 {raised:'referees/black-raised.png',middle:'referees/black-middle.png',far:'referees/black-far.png',penalty:'referees/black-penalty.png'},
 {raised:'referees/asian-raised.png',middle:'referees/asian-middle.png',far:'referees/asian-far.png',penalty:'referees/asian-penalty.png'}
];
const v55RefereeImages=new Map();
function v55RefereeAsset(pose,game=match){return v55RefereeFiles[game?.refereeVariant??0]?.[pose]||v55RefereeFiles[0][pose]}
function v55RefereeImage(src){
 if(typeof Image==='undefined')return null;
 if(!v55RefereeImages.has(src)){const image=new Image();image.src=src;v55RefereeImages.set(src,image)}
 return v55RefereeImages.get(src);
}
function v55OffsideSignal(scene,elapsed){
 const left=scene.x>.5;
 // Hold the vertical signal, briefly move the arm, then point horizontally.
 const pose=elapsed<.9?'raised':elapsed<1.4?'far':'middle';
 return{left,pose};
}
function v55DrawAssistantReferee(ctx,scene){
 const signal=v55OffsideSignal(scene,match?.setPiece?.positionElapsed||0);
 const sprite=v55RefereeImage(v55RefereeAsset(signal.pose));
 if(sprite?.complete&&sprite.naturalWidth&&typeof ctx.drawImage==='function'){
  const x=signal.left?51:549,y=clamp(scene.lineY*740,140,620);
  ctx.save();ctx.imageSmoothingEnabled=false;
  ctx.translate(x,y);if(!signal.left)ctx.scale(-1,1);
  ctx.drawImage(sprite,-(signal.pose==='raised'?35:20),-136,100,150);ctx.restore();return;
 }
 const left=signal.left,direction=left?1:-1,x=left?46:554,y=clamp(scene.lineY*740,135,640);
 ctx.save();ctx.translate(x,y);ctx.scale(1.3,1.3);ctx.translate(-x,-y);
 ctx.fillStyle='#081b1c99';ctx.beginPath();ctx.ellipse(x,y+46,24,8,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#102327';ctx.lineWidth=13;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-7,y+14);ctx.lineTo(x-12,y+42);ctx.moveTo(x+7,y+14);ctx.lineTo(x+12,y+42);ctx.stroke();
 ctx.strokeStyle='#e9f4eb';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x-12,y+42);ctx.lineTo(x-18,y+42);ctx.moveTo(x+12,y+42);ctx.lineTo(x+18,y+42);ctx.stroke();
 ctx.fillStyle='#102327';ctx.fillRect(x-15,y+8,30,15);
 ctx.fillStyle='#d7f875';ctx.fillRect(x-16,y-16,32,27);
 ctx.fillStyle='#17292b';ctx.fillRect(x-3,y-16,6,27);
 ctx.strokeStyle='#d7f875';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(x-direction*12,y-9);ctx.lineTo(x-direction*19,y+11);ctx.moveTo(x+direction*12,y-9);ctx.lineTo(x+direction*24,y-31);ctx.stroke();
 ctx.strokeStyle='#e9b890';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x+direction*24,y-31);ctx.lineTo(x+direction*29,y-57);ctx.stroke();
 ctx.fillStyle='#e9b890';ctx.beginPath();ctx.arc(x,y-28,11,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#17292b';ctx.beginPath();ctx.arc(x,y-34,11,Math.PI,Math.PI*2);ctx.fill();
 const poleX=x+direction*29;
 ctx.strokeStyle='#f4f5e9';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(poleX,y-58);ctx.lineTo(poleX,y-98);ctx.stroke();
 ctx.fillStyle='#ffba50';ctx.beginPath();ctx.moveTo(poleX,y-96);ctx.lineTo(poleX+direction*33,y-87);ctx.lineTo(poleX,y-78);ctx.fill();
 ctx.fillStyle='#f46a54';ctx.beginPath();ctx.moveTo(poleX,y-96);ctx.lineTo(poleX+direction*33,y-87);ctx.lineTo(poleX,y-87);ctx.fill();
 ctx.restore();
}
draw=function(){const result=v55BaseDraw();if(!match)return result;const ctx=$('#canvas').getContext('2d');if(match.offsideVisual){const scene=match.offsideVisual;ctx.save();ctx.strokeStyle='#ffda68';ctx.lineWidth=3;ctx.setLineDash([10,7]);ctx.beginPath();ctx.moveTo(28,scene.lineY*740);ctx.lineTo(572,scene.lineY*740);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#ffda68';ctx.lineWidth=4;ctx.beginPath();ctx.arc(scene.x*600,scene.y*740,25,0,Math.PI*2);ctx.stroke();ctx.restore();v55DrawAssistantReferee(ctx,scene)}const flight=match.flight;if(flight?.aerial){const q=Math.min(1,flight.progress),ball=match.ball,x=ball.x*600,y=ball.y*740,height=Math.min(Math.sin(Math.PI*q)*54,Math.max(0,y-32));ctx.save();ctx.fillStyle='#214e43';ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(x,y+3,7,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.strokeStyle='#17292b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y-height,document.body.classList.contains('v65-world-match')?5.4:6,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore()}return result};

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
 const world=typeof v65WorldActive!=='undefined'&&v65WorldActive,tolerance=world?.03*(v55Field.bottom-v55Field.top)/68:.004;
 if(!exempt)for(const player of match.people)if(player.t===passer.t&&!player.keeper&&player!==passer){const edge=v124OffsideEdge(player,passer.t);if(passer.t===0?edge<.5&&edge<lineY-tolerance:edge>.5&&edge>lineY+tolerance)offside.add(player)}
 return{lineY,offside,ball:{...match.ball},positions:new Map(match.people.map(player=>[player,{x:player.x,y:player.y}]))};
}
function v55WhistleOffside(snapshot,player){
 const team=1-player.t,offender=snapshot.positions.get(player)||player,spot={x:clamp(offender.x,.09,.91),y:clamp(offender.y,.07,.93)};
 match.setPieceStats.freeKicks[team]++;
 v50Restart('offside',team,spot,`${player.name} steht beim Abspiel im Abseits. Freistoß für ${v50Name(team)}.`);
 for(const [person,position] of snapshot.positions)v50Spot(person,position);
 match.ball={...snapshot.ball};
 match.offsideVisual={lineY:snapshot.lineY,x:offender.x,y:offender.y};
 hideOverlay();match.overlayTTL=0;
 return true;
}
function v55BeginThrow(hit,lastTouch){
 const m=match,team=1-lastTouch,spot=v55BoundaryStop(hit),taker=[...v50Outfield(team)].sort((a,b)=>distance(a,spot)-distance(b,spot))[0];
 m.owner=null;m.flight=null;m.rebound=null;m.lastPass=null;m.next=Infinity;m.ball={...spot};m.throwIn={team,spot,taker,ready:0};m.lastTouch=lastTouch;
 note(`Aus! Einwurf für ${v50Name(team)}. ${taker.name} läuft zur Seitenlinie.`,'restart');
}
function v55Out(hit,lastTouch,description){
 if(hit.edge==='left'||hit.edge==='right'){v55BeginThrow(hit,lastTouch);return}
 if(typeof v65WorldActive!=='undefined'&&v65WorldActive&&v115GoalCrossing(hit,lastTouch))return;
 const attacker=hit.edge==='top'?0:1,defender=1-attacker;
 if(lastTouch===attacker)v50GoalKick(v50Keeper(defender),`${description} Abstoß für ${v50Name(defender)}.`);
 else v50Corner(attacker,hit.x,description);
}
function v55GroundPass(passer,receiver,kind='pass',exempt=false){
 const m=match,snapshot=v55OffsideSnapshot(passer,exempt),from={x:m.ball.x,y:m.ball.y},header=kind==='header'&&typeof v65WorldActive!=='undefined'&&v65WorldActive,pressure=m.people.filter(player=>player.t!==passer.t&&!player.keeper&&(header?v122Metres(player,passer)<2:distance(player,passer)<.15)).length;
 const ahead=passer.t===0?passer.y-receiver.y:receiver.y-passer.y;
 const direct=v127OneTouchRelease?.person===passer,quality=header?ability(passer,'pas')*.4+ability(passer,'air')*.4+ability(passer,'tec')*.2:direct?ability(passer,'pas')*.65+ability(passer,'tec')*.35:ability(passer,'pas'),accuracy=header?(.25+(20-quality)*.055+pressure*.20)*(v55Field.right-v55Field.left)/44:clamp((20-quality)*.003+pressure*.015+(direct?(20-ability(passer,'tec'))*.001:0),.005,.1),lead=hasInstruction(receiver,'deep')&&receiver.assignedLine==='att'&&ahead>.025&&!exempt&&!header?(receiver.t===0?-.075:.075):0,target={x:receiver.x+(random()-.5)*accuracy*2,y:receiver.y+lead+(random()-.5)*accuracy*2*(header?44/(v55Field.right-v55Field.left)*(v55Field.bottom-v55Field.top)/68:1)};
 if(kind==='header'){
  passer.stats.headerPasses++;
  if(typeof v65WorldActive!=='undefined'&&v65WorldActive){const gap=v122Metres(from,target),limit=Math.min(1,14/Math.max(.001,gap));target.x=from.x+(target.x-from.x)*limit;target.y=from.y+(target.y-from.y)*limit;}
 }
 passer.stats.passes++;m.lastTouch=passer.t;
 const forward=passer.t===0?passer.y-target.y:target.y-passer.y;if(forward>.12)passer.stats.progressive++;
 const exit=v55Exit(from,target),end=exit?v55BoundaryStop(exit):target,duration=clamp(distance(from,end)*1.5,.32,.9);
 if(kind==='header')note(`${passer.name} köpft zu ${receiver.name}.`);else note(`${passer.name} spielt ${direct?'direkt ':''}auf ${receiver.name}.`);
 const worldPass=typeof v65WorldActive!=='undefined'&&v65WorldActive;
 const rivals=m.people.filter(player=>player.t!==passer.t&&!player.keeper),candidate=!exit?rivals.map(player=>({player,geometry:passLaneGeometry(player,from,target)})).filter(item=>{if(!item.geometry)return false;if(header||worldPass){const gap=v122Metres(item.player,item.geometry),seconds=v115FlightDuration(from,end,duration,header?'header':'pass')/MATCH_SPEED;return Math.max(0,gap-.8)<=(3+ability(item.player,'spd')*.14)*seconds*item.geometry.t&&gap<3;}const speed=.07+ability(item.player,'spd')*.00425,arrival=Math.max(0,item.geometry.lateral-.03)/speed;return item.geometry.lateral<.055+ability(item.player,'pos')*.002&&arrival<=duration*item.geometry.t*1.15}).sort((a,b)=>a.geometry.t-b.geometry.t)[0]:null;
 if(candidate&&random()<clamp(.11+ability(candidate.player,'pos')*.016+ability(candidate.player,'spd')*.004-ability(passer,'pas')*.011,.05,.55)){
  const point={x:candidate.geometry.x,y:candidate.geometry.y},interceptor=candidate.player;
  passer.stats.passLost++;interceptor.stats.interceptions++;interceptor.interceptTarget=point;note(`${interceptor.name} fängt den Pass ab.`,'duel');
  fly(point,Math.max(.18,duration*candidate.geometry.t),()=>{interceptor.interceptTarget=null;if(header||worldPass?v122Metres(interceptor,point)>.8:distance(interceptor,point)>.045){v50LooseBall(point,`${interceptor.name} erreicht den Ball nicht mehr.`);return}m.owner=interceptor;m.lastPass=null;m.lastTouch=interceptor.t;m.next=m.elapsed+.7;if(worldPass&&!header)v123Receive(interceptor,point);});return;
 }
 if(!exit)receiver.interceptTarget=end;
 fly(end,duration,()=>{
  receiver.interceptTarget=null;
  if(exit){passer.stats.passLost++;v55Out(exit,passer.t,`Fehlpass von ${passer.name}.`);return}
  const world=typeof v65WorldActive!=='undefined'&&v65WorldActive;
  if(header||world?v122Metres(receiver,end)>.8:distance(receiver,end)>.055){passer.stats.passLost++;v50LooseBall(end,`${receiver.name} erreicht den Pass nicht.`);return}
  if(snapshot.offside.has(receiver)){v55WhistleOffside(snapshot,receiver);return}
  passer.stats.passComplete++;m.owner=receiver;m.lastPass={passer,receiver,at:m.elapsed};m.next=m.elapsed+.75;
  if(world&&!header&&!v127TryOneTouch(receiver,end,from))v123Receive(receiver,end);
 });
 if(worldPass&&!header&&!exit&&m.flight)v127GroundReceivers.set(m.flight,{receiver,offside:snapshot.offside.has(receiver)});
}
// Contact decisions and release points are transient, shared by 2D and 3D.
const v127GroundReceivers=new WeakMap();
let v127OneTouchRelease=null;
function v131OpenGoal(p,point=p){
 const keeper=match?.people.find(q=>q.keeper&&q.t!==p.t);if(!keeper)return null;
 const sx=44/(v55Field.right-v55Field.left),sy=68/(v55Field.bottom-v55Field.top),goalY=p.t===0?v55Field.top:v55Field.bottom;
 const options=[.44,.5,.56].map(x=>{
  const target={x,y:goalY},dx=(target.x-point.x)*sx,dy=(target.y-point.y)*sy,range=Math.hypot(dx,dy),q=clamp(((keeper.x-point.x)*sx*dx+(keeper.y-point.y)*sy*dy)/Math.max(.001,range*range),0,1);
  const lane={x:point.x+(target.x-point.x)*q,y:point.y+(target.y-point.y)*q},gap=v122Metres(keeper,lane),reach=.8+Math.max(0,range/27-(.28-ability(keeper,'gk')*.005))*(2.6+ability(keeper,'spd')*.065);
  const blocked=match.people.some(r=>r.t!==p.t&&!r.keeper&&(()=>{const g=passLaneGeometry(r,point,target);return g&&v122Metres(r,g)<1.4})());
  return{target,range,margin:gap-reach,blocked};
 }).filter(o=>o.range<=22&&!o.blocked&&o.margin>1.5).sort((a,b)=>b.margin-a.margin);
 return options[0]||null;
}
function v127DirectOptions(p,point,from){
 const m=match;if(!m||p.keeper||m.kickoff||m.setPiece||m.throwIn||m.goalPause>0||v122Metres(p,point)>.8)return null;
 const rivals=m.people.filter(q=>q.t!==p.t),offside=v55OffsideSnapshot(p).offside,sx=44/(v55Field.right-v55Field.left),sy=68/(v55Field.bottom-v55Field.top);
 const incoming={x:(point.x-from.x)*sx,y:(point.y-from.y)*sy},length=Math.hypot(incoming.x,incoming.y);
 const open=v131OpenGoal(p,point);if(length<2&&!open)return null;if(length<.2)return null;
 const turnOK=q=>{const dx=(q.x-point.x)*sx,dy=(q.y-point.y)*sy,d=Math.hypot(dx,dy);return d>1&&(incoming.x*dx+incoming.y*dy)/length/d>-.55;};
 const safe=q=>rivals.every(r=>{const g=passLaneGeometry(r,point,q);return r.keeper||v122Metres(r,q)>1.8&&(!g||v122Metres(r,g)>1.4);});
 const allies=m.people.filter(q=>q.t===p.t&&q!==p&&!q.keeper&&!offside.has(q)&&v122Metres(point,q)>=3&&v122Metres(point,q)<=18&&turnOK(q)&&safe(q));
 const target=allies.sort((a,b)=>v115GoalDistance(a)-v115GoalDistance(b)||v122Metres(point,a)-v122Metres(point,b))[0];
 const goal=open?.target||{x:.5,y:p.t===0?v55Field.top:v55Field.bottom},range=v115GoalDistance(p),shot=(open||range<=18&&Math.abs(p.x-.5)*sx<9)&&turnOK(goal)&&safe(goal);
 const better=target&&v115GoalDistance(target)<range-3;
 return {kind:shot&&(open||!better)?'shot':target?'pass':null,target:shot&&(open||!better)?goal:target,openGoal:Boolean(open&&shot),pressure:rivals.filter(r=>!r.keeper&&v122Metres(r,p)<2.5).length};
}
function v127TryOneTouch(p,point,from){
 const choice=v127DirectOptions(p,point,from);if(!choice?.kind)return false;
 const skill=ability(p,choice.kind==='shot'?'fin':'pas'),chance=choice.openGoal?clamp(.88+skill*.002+ability(p,'tec')*.001+ability(p,'pos')*.001,.90,.98):clamp(.06+skill*.014+ability(p,'tec')*.010+ability(p,'pos')*.006+Math.min(2,choice.pressure)*.025,.08,.72);
 if(random()>=chance)return false;
 const previous=v127OneTouchRelease;v127OneTouchRelease={person:p,point:{...point},target:choice.kind==='shot'?choice.target:null};v123GroundControls.delete(match);match.ball={...point};match.lastTouch=p.t;
 try{if(choice.kind==='shot')v55Shoot(p);else v55GroundPass(p,choice.target);}finally{v127OneTouchRelease=previous;}
 return true;
}
function v127DribbleOut(m,from,to){
 if(typeof v65WorldActive==='undefined'||!v65WorldActive||!m.owner||m.owner.keeper||m.flight||m.kickoff||m.setPiece||m.throwIn||m.goalPause>0||m.halftimePause||m.postBanner)return false;
 const rx=.1764*(v55Field.right-v55Field.left)/44,ry=.1764*(v55Field.bottom-v55Field.top)/68;
 const edges=[['left','x',v55Field.left,rx,-1],['right','x',v55Field.right,rx,1],['top','y',v55Field.top,ry,-1],['bottom','y',v55Field.bottom,ry,1]],hits=[];
 for(const [edge,axis,line,radius,sign]of edges){if((to[axis]-line)*sign<=radius)continue;const delta=to[axis]-from[axis],t=delta?clamp((line+sign*radius-from[axis])/delta,0,1):0;hits.push({edge,t,x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t});}
 const hit=hits.sort((a,b)=>a.t-b.t)[0];if(!hit)return false;
 const team=m.owner.t;m.lastTouch=team;m.ball={x:hit.x,y:hit.y};v55Out(hit,team,'Der Ballführer dribbelt ins Aus.');return true;
}
// Plans are transient and refer to this flight only; saved matches need no new fields.
const v122AerialPlans=new WeakMap();
// Ground control lives with the current match only; old saves/stats are untouched.
const v123GroundControls=new WeakMap();
function v123ControlDirection(p){const sx=44/(v55Field.right-v55Field.left),sy=68/(v55Field.bottom-v55Field.top),dx=(p.motionX||0)*sx,dy=(p.motionY||0)*sy,d=Math.hypot(dx,dy);return d>.01?{x:dx/d,y:dy/d}:{x:0,y:p.t===0?-1:1};}
function v123Receive(p,point){
 const m=match,tec=ability(p,'tec'),pressure=m.people.filter(q=>q.t!==p.t&&!q.keeper&&v122Metres(q,p)<2.5).length,dir=v123ControlDirection(p),quality=clamp((tec+ability(p,'pos')*.25)/25,0,1),lead=.42+(1-quality)*.55,at=typeof v102Clock==='function'?v102Clock(m):m.elapsed/MATCH_SPEED;
 v123GroundControls.set(m,{person:p,at,start:{...point},direction:dir,lead,heading:Math.atan2(dir.x,dir.y)});m.lastTouch=p.t;
 const failure=clamp(.015+(20-tec)*.006+pressure*(.025+(20-tec)*.002),.015,.30);
 if(random()<failure){const sx=44/(v55Field.right-v55Field.left),sy=68/(v55Field.bottom-v55Field.top),side=random()<.5?-1:1,end={x:point.x+(dir.x*1.3-dir.y*side*.5)/sx,y:point.y+(dir.y*1.3+dir.x*side*.5)/sy};m.lastPass=null;v50LooseBall(point,`${p.name} verspringt die Ballannahme.`,{vx:(end.x-point.x)*2.5,vy:(end.y-point.y)*2.5});if(m.rebound){m.rebound.vx=(end.x-point.x)*2.5;m.rebound.vy=(end.y-point.y)*2.5;}if(typeof v102Pose==='function')v102Pose(m,p,'receive',end,point);}
}
function v123DribbleTarget(m,p,dt){
 if(typeof v65WorldActive==='undefined'||!v65WorldActive||m.owner!==p||p.keeper||m.flight||m.slide||m.setPiece||m.kickoff||m.throwIn||m.goalPause>0||m.postBanner)return;
 let c=v123GroundControls.get(m);if(c?.person!==p){const dir=v123ControlDirection(p);c={person:p,direction:dir,heading:Math.atan2(dir.x,dir.y),at:-Infinity};v123GroundControls.set(m,c);}
 const sx=44/(v55Field.right-v55Field.left),sy=68/(v55Field.bottom-v55Field.top),dx=(p.tx-p.x)*sx,dy=(p.ty-p.y)*sy,d=Math.hypot(dx,dy);if(d<.02)return;
 const target=Math.atan2(dx,dy),turn=Math.atan2(Math.sin(target-c.heading),Math.cos(target-c.heading)),limit=(2.8+ability(p,'tec')*.12)*dt;c.heading+=clamp(turn,-limit,limit);c.direction={x:Math.sin(c.heading),y:Math.cos(c.heading)};p.tx=p.x+c.direction.x*d/sx;p.ty=p.y+c.direction.y*d/sy;
}
function v123OwnedBall(m){
 const p=m.owner;if(typeof v65WorldActive==='undefined'||!v65WorldActive||!p||p.keeper||m.kickoff||m.setPiece||m.throwIn)return null;
 const c=v123GroundControls.get(m),dir=v123ControlDirection(p),quality=ability(p,'tec')/20,lead=.52+(1-quality)*.20,point={x:p.x+dir.x*lead*(v55Field.right-v55Field.left)/44,y:p.y+dir.y*lead*(v55Field.bottom-v55Field.top)/68};
 if(c?.person===p&&c.start){const age=(typeof v102Clock==='function'?v102Clock(m):m.elapsed/MATCH_SPEED)-c.at,q=clamp(age/.30,0,1),s=q*q*(3-2*q);point.x=c.start.x+(point.x-c.start.x)*s;point.y=c.start.y+(point.y-c.start.y)*s;}
 return point;
}
function v122Metres(a,b){return Math.hypot((a.x-b.x)*44/(v55Field.right-v55Field.left),(a.y-b.y)*68/(v55Field.bottom-v55Field.top))}
function v122HeaderSpeed(person){return 5.5+ability(person,'air')*.25+ability(person,'tec')*.025}
function v122PlanAir(flight,passer,end){
 const seconds=flight.duration/MATCH_SPEED,contenders=[],pursuers=[];
 for(const team of [passer.t,1-passer.t]){
  const runners=match.people.filter(p=>p.t===team&&!p.keeper&&p!==passer&&!p.slideActive),candidates=runners.filter(p=>v122Metres(p,end)<=Math.max(0,seconds-(.32-ability(p,'pos')*.011))*(3+ability(p,'spd')*.14)+.65);
  candidates.sort((a,b)=>(v122Metres(a,end)-ability(a,'pos')*.045-ability(a,'air')*.015)-(v122Metres(b,end)-ability(b,'pos')*.045-ability(b,'air')*.015));
  // A ball beyond aerial reach still has to be chased during its flight.
  // Keep chasing distinct from eligibility for the existing aerial duel.
  const p=candidates[0]||runners.sort((a,b)=>v122Metres(a,end)/(3+ability(a,'spd')*.14)-ability(a,'pos')*.01-(v122Metres(b,end)/(3+ability(b,'spd')*.14)-ability(b,'pos')*.01))[0];if(!p)continue;
  // Approach from the current side, leaving space for the forehead and opponent.
  const gap=v122Metres(p,end),offset=Math.min(.25,gap),amount=gap?offset/gap:0;
  p.interceptTarget={x:end.x+(p.x-end.x)*amount,y:end.y+(p.y-end.y)*amount};(candidates.length?contenders:pursuers).push(p);
 }
 v122AerialPlans.set(flight,{contenders,pursuers,end:{...end}});
 if(typeof v102Flights!=='undefined'){const meta=v102Flights.get(flight);if(meta)meta.endHeight=2.65;}
}
function v55HighPass(passer,receiver,{cross=false,exempt=false,corner=false}={}){
 if(typeof v65WorldActive!=='undefined'&&v65WorldActive&&v122Metres(passer,receiver)<7)return v55GroundPass(passer,receiver,'pass',exempt);
 const m=match,snapshot=v55OffsideSnapshot(passer,exempt),from={x:m.ball.x,y:m.ball.y},pressure=m.people.filter(player=>player.t!==passer.t&&!player.keeper&&distance(player,passer)<.15).length;
 const skill=ability(passer,'pas'),error=(20-skill)*.007+pressure*.024,intended={x:receiver.x,y:receiver.y},land={x:receiver.x+(random()-.5)*error*2,y:receiver.y+(random()-.5)*error*2};
 const variant=random();if(cross&&variant<.19)land.y+=passer.t===0?.15:-.15;else if(cross&&variant<.38)land.y+=passer.t===0?-.16:.16;else if(cross&&variant<.50)land.x=passer.x<.5?1.04:-.04;else if(!cross&&variant<.09)land.x=receiver.x<.5?-.04:1.04;
 passer.stats.passes++;passer.stats.highPasses++;if(cross)passer.stats.crosses++;m.lastTouch=passer.t;
 const forward=passer.t===0?passer.y-land.y:land.y-passer.y;if(forward>.12)passer.stats.progressive++;
 const exit=v55Exit(from,land),end=exit?v55BoundaryStop(exit):land,duration=clamp(distance(from,end)*1.25,.55,1.05);
 const label=corner?'Ecke':cross?'Flanke':'hohen Ball';note(`${passer.name} spielt ${corner?'die Ecke':cross?'eine Flanke':'einen hohen Ball'} auf ${receiver.name}.`,corner?'restart':'shot');
 const world=typeof v65WorldActive!=='undefined'&&v65WorldActive;
 for(const player of m.people)if(world)player.interceptTarget=null;else if(!player.keeper&&distance(player,end)<.24)player.interceptTarget=end;
 fly(end,duration,()=>{for(const player of m.people)player.interceptTarget=null;if(cross&&distance(intended,land)>.11){const delta=passer.t===0?land.y-intended.y:intended.y-land.y;note(`Die Flanke von ${passer.name} gerät ${delta>.055?'zu kurz':'zu weit'}.`,'duel')}if(exit){passer.stats.passLost++;v55Out(exit,passer.t,`${label} von ${passer.name} gerät ins Aus.`);return}v55ResolveAir({passer,receiver,end,snapshot,cross})});
 m.flight.aerial=true;
 if(world&&!exit)v122PlanAir(m.flight,passer,end);
}
function v55ResolveAir({passer,receiver,end,snapshot,cross}){
 if(typeof v65WorldActive!=='undefined'&&v65WorldActive)return v122ResolveAir({passer,end,snapshot,cross});
 const m=match,allies=m.people.filter(player=>player.t===passer.t&&!player.keeper&&player!==passer),rivals=m.people.filter(player=>player.t!==passer.t&&!player.keeper);
 const score=player=>distance(player,end)-ability(player,'air')*.004-ability(player,'pos')*.002;
 const attacker=[...allies].sort((a,b)=>score(a)-score(b))[0],defender=[...rivals].sort((a,b)=>score(a)-score(b))[0];
 const attackReach=attacker&&distance(attacker,end)<.055,defendReach=defender&&distance(defender,end)<.055;
 if(!attackReach&&!defendReach){passer.stats.passLost++;v50LooseBall(end,`Der hohe Ball von ${passer.name} springt frei auf.`);return}
 if(attackReach&&snapshot.offside.has(attacker)&&(!defendReach||distance(attacker,end)<distance(defender,end)+.055)){v55WhistleOffside(snapshot,attacker);return}
 let winner=attackReach?attacker:defender;
 if(attackReach&&defendReach){const attackChance=clamp(.5+(ability(attacker,'air')-ability(defender,'air'))*.024+(ability(attacker,'pos')-ability(defender,'pos'))*.008,.2,.8);winner=random()<attackChance?attacker:defender}
 if(winner.t===passer.t&&snapshot.offside.has(winner)){v55WhistleOffside(snapshot,winner);return}
 if(typeof v102AirContact==='function')v102AirContact(winner,end);
 if(attackReach&&defendReach){attacker.stats.aerialDuels++;defender.stats.aerialDuels++;attacker.stats.duels++;defender.stats.duels++;winner.stats.aerialWon++;winner.stats.duelsWon++}
 if(winner.t!==passer.t){passer.stats.passLost++;defender.stats.interceptions++;m.lastPass=null;m.lastTouch=defender.t;if(random()<.4){const cleared={x:clamp(end.x+(random()-.5)*.25,.07,.93),y:clamp(end.y+(defender.t===0?-.14:.14),.07,.93)};if(typeof v102AirClear==='function')v102AirClear(defender,end,cleared);v50LooseBall(cleared,`${defender.name} köpft den hohen Ball weg.`)}else{m.owner=defender;m.ball={x:defender.x,y:defender.y};m.next=m.elapsed+.55;note(`${defender.name} gewinnt den hohen Ball.`,'duel')}return}
 const progress=winner.t===0?1-winner.y:winner.y,marked=defendReach&&distance(defender,winner)<.11,preferHeader=ability(winner,'air')>=ability(winner,'tec')||marked,nearGoal=progress>.70&&(typeof v65WorldActive==='undefined'||!v65WorldActive||!preferHeader||v115GoalDistance(winner)<=v115HeaderRange(winner));
 const credit=()=>{passer.stats.passComplete++;passer.stats.highComplete++;if(cross)passer.stats.crossComplete++;m.lastPass={passer,receiver:winner,at:m.elapsed}};
 m.lastTouch=winner.t;m.ball={x:winner.x,y:winner.y};
 if(nearGoal&&random()<v115DecisionChance(winner,preferHeader?'header':'volley',marked?.42:.62)){credit();m.owner=winner;v55Shoot(winner,preferHeader?'header':'volley');return}
 const next=allies.filter(player=>player!==winner).sort((a,b)=>distance(a,winner)-distance(b,winner))[0];
 if(next&&random()<.32){credit();m.owner=winner;v55GroundPass(winner,next,'header');return}
 const control=clamp(.35+ability(winner,'tec')*.028+ability(winner,'air')*.009-(marked?.12:0)-distance(winner,end)*.6,.2,.9);
 if(random()>control){passer.stats.passLost++;v50LooseBall(end,`${winner.name} verspringt die Annahme des hohen Balls.`);return}
 credit();
 m.owner=winner;m.next=m.elapsed+.55;note(`${winner.name} nimmt den hohen Ball an.`,'duel');
}

function v122ResolveAir({passer,end,snapshot,cross}){
 const m=match,eligible=m.people.filter(p=>!p.keeper&&p!==passer&&v122Metres(p,end)<=.65),score=p=>v122Metres(p,end)-ability(p,'pos')*.018-ability(p,'air')*.012;
 const best=team=>eligible.filter(p=>p.t===team).sort((a,b)=>score(a)-score(b))[0],attacker=best(passer.t),defender=best(1-passer.t);
 if(!attacker&&!defender){passer.stats.passLost++;v50LooseBall(end,`Der hohe Ball von ${passer.name} springt frei auf.`);return}
 if(attacker&&snapshot.offside.has(attacker)){v55WhistleOffside(snapshot,attacker);return}
 let winner=attacker||defender;
 if(attacker&&defender){
  const chance=clamp(.5+(ability(attacker,'air')-ability(defender,'air'))*.024+(ability(attacker,'pos')-ability(defender,'pos'))*.010+(v122Metres(defender,end)-v122Metres(attacker,end))*.12,.15,.85);
  winner=random()<chance?attacker:defender;
  for(const p of [attacker,defender]){p.stats.aerialDuels++;p.stats.duels++}winner.stats.aerialWon++;winner.stats.duelsWon++;
 }
 v102AirContact(winner,end);m.lastTouch=winner.t;m.lastPass=null;
 if(attacker&&defender)v102Pose(m,winner===attacker?defender:attacker,'airLand',end);
 const pressure=m.people.filter(p=>p.t!==winner.t&&!p.keeper&&v122Metres(p,winner)<2).length,air=ability(winner,'air'),tec=ability(winner,'tec'),pos=ability(winner,'pos');
 const credit=()=>{passer.stats.passComplete++;passer.stats.highComplete++;if(cross)passer.stats.crossComplete++;m.lastPass={passer,receiver:winner,at:m.elapsed}};
 if(winner.t!==passer.t){
  passer.stats.passLost++;winner.stats.interceptions++;
  const ownBox=winner.t===0?winner.y>.70:winner.y<.30;
  if(random()<clamp(.22+(ownBox?.30:0)+pressure*.18+(air-tec)*.014,.12,.90)){
   const forward=7+air*.20,lateral=(random()-.5)*6,cleared={x:clamp(end.x+lateral*(v55Field.right-v55Field.left)/44,.07,.93),y:clamp(end.y+(winner.t===0?-forward:forward)*(v55Field.bottom-v55Field.top)/68,.07,.93)};
   v102AirClear(winner,end,cleared);v50LooseBall(cleared,`${winner.name} köpft den hohen Ball weg.`);return;
  }
 }else{
  const headerRange=v115GoalDistance(winner)<=v115HeaderRange(winner),preferHeader=air>=tec||pressure>0;
  if(headerRange&&random()<v115DecisionChance(winner,preferHeader?'header':'volley',pressure?.42:.62)){credit();m.owner=winner;m.ball={...end};v55Shoot(winner,preferHeader?'header':'volley');return}
  const allies=m.people.filter(p=>p.t===winner.t&&!p.keeper&&p!==winner&&v122Metres(winner,p)<=14),offside=v55OffsideSnapshot(winner).offside;
  const next=allies.filter(p=>!offside.has(p)).sort((a,b)=>v122Metres(a,winner)-v122Metres(b,winner))[0];
  if(next&&random()<clamp(.12+ability(winner,'pas')*.014+pos*.004+(pressure?.10:0),.15,.64)){credit();m.owner=winner;m.ball={...end};v55GroundPass(winner,next,'header');return}
 }
 const control=clamp(.25+tec*.026+pos*.006+air*.006-pressure*.12-v122Metres(winner,end)*.10,.18,.94);
 if(random()>control){if(winner.t===passer.t)passer.stats.passLost++;v50LooseBall(end,`${winner.name} verspringt die Annahme des hohen Balls.`);return}
 if(winner.t===passer.t)credit();m.owner=winner;m.ball={x:winner.x,y:winner.y};m.next=m.elapsed+.55;note(`${winner.name} nimmt den hohen Ball an.`,'duel');
}

function v55Shoot(shooter,kind='shot'){
 const m=match,world=typeof v65WorldActive!=='undefined'&&v65WorldActive,team=shooter.t,rivals=m.people.filter(player=>player.t!==team),keeper=rivals.find(player=>player.keeper),near=rivals.filter(player=>!player.keeper&&distance(player,shooter)<.15);
 if(world&&kind==='header'&&v115GoalDistance(shooter)>v115HeaderRange(shooter)){const allies=m.people.filter(p=>p.t===team&&!p.keeper&&p!==shooter&&v122Metres(p,shooter)<=14),target=v55ChooseTarget(shooter,allies,rivals);if(target)return v55GroundPass(shooter,target,'header');return;}
 const direct=v127OneTouchRelease?.person===shooter,header=world&&kind==='header',pressure=(header?rivals.filter(p=>!p.keeper&&v122Metres(p,shooter)<2):near).reduce((sum,player)=>sum+ability(player,'tak'),0),fin=header?ability(shooter,'fin')*.45+ability(shooter,'air')*.40+ability(shooter,'tec')*.15:direct?ability(shooter,'fin')*.70+ability(shooter,'tec')*.30:ability(shooter,'fin'),tech=ability(shooter,kind==='header'?'air':'tec');
 shooter.stats.shots++;m.shots[team]++;if(kind==='header')shooter.stats.headers++;if(kind==='volley')shooter.stats.volleys++;
 const goalRollX=random(),goalPoint=direct&&v127OneTouchRelease.target?{...v127OneTouchRelease.target}:{x:.44+goalRollX*.12,y:team===0?v55Field.top:v55Field.bottom};
 const blocker=rivals.filter(player=>!player.keeper).map(player=>({player,geometry:passLaneGeometry(player,shooter,goalPoint)})).filter(item=>item.geometry&&item.geometry.lateral<.075&&(typeof v110BlockReachable!=='function'||v110BlockReachable(item.player,item.geometry,shooter))).sort((a,b)=>a.geometry.t-b.geometry.t)[0];
 const label=kind==='header'?'köpft aufs Tor':kind==='volley'?'schießt direkt volley':direct?'schießt direkt':'schießt';
 note(`${shooter.name} ${label}!`,'shot');
 if(blocker&&random()<clamp(.09+ability(blocker.player,'tak')*.012,.1,.34)){
  const point={x:blocker.geometry.x,y:blocker.geometry.y},launch=()=>fly(point,clamp(distance(shooter,point)*1.2,.17,.45),()=>{if(world&&v122Metres(blocker.player,point)>.8){blocker.player.interceptTarget=null;v50LooseBall(point,`${blocker.player.name} erreicht den Abschluss nicht.`);return}v50Deflect(point,team,blocker.player,`Block von ${blocker.player.name}`)});if(typeof v110BlockFlight==='function')v110BlockFlight(blocker.player,point,launch);else launch();return;
 }
 const range=world?v115GoalDistance(shooter):12,rangeAccuracy=world?Math.exp(-Math.max(0,range-16)/45):1;
 const onTarget=random()<clamp((.36+fin*.019+tech*.004-pressure*.004)*rangeAccuracy,world?.08:.22,.82);
 if(onTarget){shooter.stats.onTarget++;keeper.stats.faced++}
 const distanceFactor=world?Math.exp(-Math.max(0,range-12)/13):1,goalRoll=onTarget?random():1;
 let goal=onTarget&&goalRoll<clamp((.13+fin*.022+tech*.004-ability(keeper,'gk')*.011-pressure*.002)*distanceFactor,world?.003:.1,.62);
 // A settled keeper covers a central low/medium long shot. Outcomes must not send
 // the ball straight through his body; difficult corners/high shots can still score.
 if(world&&goal&&range>18){const q=clamp((keeper.y-shooter.y)/(goalPoint.y-shooter.y),0,1),cross=shooter.x+(goalPoint.x-shooter.x)*q,variant=((shooter.stats.shots||0)+shooter.n)%3;if(q>.65&&Math.abs(cross-keeper.x)*44/(v55Field.right-v55Field.left)<1.05&&variant!==2)goal=false;}
 const parry=world&&onTarget&&!goal?random()<v115ParryChance(shooter,keeper,kind):null;
 const end=!goal&&onTarget&&world&&typeof v101KickPoint==='function'?v115KeeperContact(keeper,shooter,parry):{x:goal?goalPoint.x:onTarget?clamp(keeper.x,.37,.63):world?v115MissX(shooter,random(),kind):random()<.5?.2:.8,y:team===0?v55Field.top:v55Field.bottom};
 fly(end,typeof v101ShotDuration==='function'?v101ShotDuration(m.ball,end,.48,kind):.48,()=>{if(goal){v50Goal(shooter,keeper,false,kind==='direct-free-kick'?'direct-free-kick':null);return}if(!onTarget){v50GoalKick(keeper,`${shooter.name} setzt den Ball vorbei. Abstoß.`);return}keeper.stats.saves++;if(parry??random()<.27)v50Deflect(end,team,keeper,`Parade von ${keeper.name}`);else v50GoalKick(keeper,`${keeper.name} hält den Abschluss fest.`)});
 const release=world&&m.flight&&v99Flights.get(m.flight);if(release&&parry!==null)release.parry=parry;
 if(typeof v100ShotOutcome==='function')v100ShotOutcome(m.flight,goal);
}
function v115GoalCrossing(hit,lastTouch){
 const current=match,flight=typeof v109IncomingFlight!=='undefined'&&v109IncomingFlight?.current===current?v109IncomingFlight.flight:current.flight,view=flight?v109FlightPoint(flight,1):v99BallView(current),radius=.1764,width=44/(v55Field.right-v55Field.left),height=.2*width/3;
 if(Math.abs(hit.x-.5)*width+radius>=.1*width||(view?.elevation??.29)+radius>=height)return false;
 const scoring=hit.edge==='top'?0:1,meta=flight&&v102Flights.get(flight),touch=meta?.person||current.people.filter(p=>p.t===lastTouch).sort((a,b)=>distance(a,hit)-distance(b,hit))[0];if(!touch)return false;
 current.ball={x:hit.x,y:hit.y};const keeper=v50Keeper(1-scoring);if(touch.t===scoring)v50Goal(touch,keeper);else{current.lastPass=null;let actor=touch,event=typeof v117Origin==='function'?v117Origin(current):null;while(event){const p=current.people.concat(current.exitedPeople||[]).find(p=>p.pid===event.actorPid&&p.t===touch.t);if(p){actor=p;break;}event=current.ballAccounting?.events.find(e=>e.id===event.parentId);}const scorer={...actor,t:scoring,pid:null,ownGoalPid:actor.pid||null,stats:{...actor.stats}};v50Goal(scorer,keeper,false,'own-goal');}return true;
}
function v115GoalDistance(p){return Math.hypot((p.x-.5)*44/(v55Field.right-v55Field.left),(p.y-(p.t===0?v55Field.top:v55Field.bottom))*68/(v55Field.bottom-v55Field.top));}
function v115HeaderRange(p){return 8+ability(p,'air')*.28;}
function v115DecisionChance(p,kind,base){if(typeof v65WorldActive==='undefined'||!v65WorldActive)return base;const key=kind==='header'?'air':['shot','volley'].includes(kind)?'fin':'pas',quality=(ability(p,key)+ability(p,'tec'))/40;return clamp(base*(.65+.65*quality),.05,.96);}
function v115FlightDuration(from,to,duration,kind){const metres=v122Metres(from,to),person=typeof v102Release!=='undefined'&&v102Release?.person,speed=kind==='header'&&person?v122HeaderSpeed(person):kind==='throw'?14:['highPass','cross'].includes(kind)?20:['shot','volley','freeKick'].includes(kind)?27:kind==='block'?18:16;return Math.max(duration,metres/speed*MATCH_SPEED);}
function v115MissX(p,roll,kind='shot'){const side=roll<.5?-1:1,quality=(ability(p,'fin')+ability(p,kind==='header'?'air':'tec'))/40,spread=.008+(1-quality)*.030,extreme=roll<.005||roll>.995;return .5+side*(.1+(extreme?.11:.007+spread*(.25+.75*Math.abs(roll-.5)*2)));}
function v115ParryChance(shooter,keeper,kind){return clamp(.30+(20-ability(keeper,'gk'))*.013+ability(shooter,kind==='header'?'air':'fin')*.007+(v115GoalDistance(shooter)<12?.12:0),.30,.72);}
function v115KeeperContact(keeper,shooter,parry){const p=v101KickPoint(keeper,shooter),variant=((shooter.stats.shots||0)+shooter.n)%3,side=variant===0?-1:variant===2?1:0,dx=(shooter.x-keeper.x)*44/(v55Field.right-v55Field.left),dy=(shooter.y-keeper.y)*68/(v55Field.bottom-v55Field.top),length=Math.hypot(dx,dy)||1,available=.65+Math.max(0,v122Metres(keeper,shooter)/27-(.28-ability(keeper,'gk')*.005))*3,lateral=Math.min(available,(parry?1.45:1.05)+ability(keeper,'gk')*.025)*side;return {x:p.x-dy/length*lateral*(v55Field.right-v55Field.left)/44,y:p.y+dx/length*lateral*(v55Field.bottom-v55Field.top)/68};}
function v115OffsideMargin(p){const quality=(ability(p,'pos')-1)/19,timing=Math.max(0,Math.sin(match.elapsed*1.7+p.n*1.4));return .015+.017*quality-.055*(1-quality)*timing;}
shoot=function(shooter){v55Shoot(shooter)};

function v55ChooseTarget(p,allies,rivals){
 const forward=other=>p.t===0?p.y-other.y:other.y-p.y;
 const quick=match?.teamDirect?.[p.t]??(p.t===0&&direct),focus=match?.teamFocus?.[p.t]||'Variabel';
 const score=other=>forward(other)*(quick?2:1.4)-distance(p,other)*.75-rivals.filter(rival=>!rival.keeper&&distance(rival,other)<.13).length*.35+ability(other,'pos')*.018+(hasInstruction(other,'support')&&distance(p,other)<.28?.11:0)+(hasInstruction(other,'deep')&&forward(other)>.025?.16:0)+(focus==='Außen'?Math.abs(other.x-.5)*.45:focus==='Mitte'?-Math.abs(other.x-.5)*.45:0);
 const awareness=typeof v65WorldActive!=='undefined'&&v65WorldActive?(ability(p,'pas')+ability(p,'pos'))/40:null,offside=v55OffsideSnapshot(p).offside,eligible=allies.filter(other=>!offside.has(other)),options=eligible.length&&random()<(awareness===null?.92:.70+awareness*.25)?eligible:allies;
 return[...options].sort((a,b)=>score(b)-score(a))[random()<(awareness===null?.82:.60+awareness*.35)?0:Math.min(1,options.length-1)];
}
function v55BreakawaySquare(p,allies,rivals){
 const forward=other=>p.t===0?p.y-other.y:other.y-p.y,offside=v55OffsideSnapshot(p).offside;
 return allies.filter(other=>{
  const lead=forward(other),closerToCenter=Math.abs(other.x-.5)+.07<Math.abs(p.x-.5);
  if(offside.has(other)||lead<-.025||lead>.12||distance(p,other)>.32||Math.abs(p.x-other.x)<.06||!closerToCenter&&lead<.045)return false;
  return rivals.every(rival=>{if(rival.keeper)return true;const lane=passLaneGeometry(rival,p,other);return distance(rival,other)>.13&&(!lane||lane.lateral>.065)});
 }).sort((a,b)=>(Math.abs(a.x-.5)-Math.abs(b.x-.5))+(forward(b)-forward(a)))[0]||null;
}
function v115BetterSquare(p,allies,rivals){
 const forward=other=>p.t===0?p.y-other.y:other.y-p.y,offside=v55OffsideSnapshot(p).offside,keeper=rivals.find(q=>q.keeper),width=44/(v55Field.right-v55Field.left),length=68/(v55Field.bottom-v55Field.top);
 const gap=(a,b)=>Math.hypot((a.x-b.x)*width,(a.y-b.y)*length),quality=q=>-v115GoalDistance(q)*.10-Math.abs(q.x-.5)*2-rivals.filter(r=>!r.keeper&&gap(r,q)<3).length*.65+(keeper?Math.min(8,gap(keeper,q))*.06:0);
 const candidate=allies.filter(q=>!offside.has(q)&&forward(q)>-.045&&forward(q)<.14&&gap(p,q)<17&&Math.abs(q.x-p.x)*width>1.5&&rivals.every(r=>r.keeper||gap(r,q)>2.2&&(!passLaneGeometry(r,p,q)||passLaneGeometry(r,p,q).lateral>.045))).filter(q=>quality(q)>quality(p)+.10||keeper&&gap(p,keeper)<5&&gap(q,keeper)>gap(p,keeper)+1.3).sort((a,b)=>quality(b)-quality(a))[0];
 return candidate&&random()<clamp(.16+ability(p,'pas')*.028+ability(p,'pos')*.010+ability(p,'tec')*.005,.22,.96)?candidate:null;
}
function v55HasClearRun(p,rivals,progress){
 if(typeof v65WorldActive!=='undefined'&&v65WorldActive){
  const width=44/(v55Field.right-v55Field.left),length=68/(v55Field.bottom-v55Field.top),dir=p.t===0?-1:1;
  return !rivals.some(r=>!r.keeper&&(v122Metres(r,p)<2.3||((r.y-p.y)*dir*length>0&&(r.y-p.y)*dir*length<9&&Math.abs(r.x-p.x)*width<2.1)));
 }
 if(progress<.5)return false;
 return !rivals.some(rival=>!rival.keeper&&Math.abs(rival.x-p.x)<.19&&((p.t===0?p.y-rival.y:rival.y-p.y)>.005)&&((p.t===0?p.y-rival.y:rival.y-p.y)<.34));
}
function v123KeeperOutlet(p,m=match){const rivals=m.people.filter(q=>q.t!==p.t&&!q.keeper),allies=m.people.filter(q=>q.t===p.t&&!q.keeper),safe=q=>rivals.every(r=>{const g=passLaneGeometry(r,p,q);return v122Metres(r,q)>2&&(!g||v122Metres(r,g)>1.25+(ability(r,'spd')/20)*.65);});const short=allies.filter(q=>(q.assignedLine||q.line)==='def'&&v122Metres(p,q)<23&&safe(q)).sort((a,b)=>v122Metres(p,a)-v122Metres(p,b))[0];if(short)return {person:short,high:false};const free=allies.filter(safe).sort((a,b)=>v122Metres(p,a)-v122Metres(p,b))[0];return free?{person:free,high:v122Metres(p,free)>23}:null;}
action=function(){
 const m=match,p=m?.owner;if(!p||m.setPiece||m.throwIn)return;
 if(p.keeper){if(typeof v65WorldActive!=='undefined'&&v65WorldActive){const outlet=v123KeeperOutlet(p);if(!outlet){m.next=m.elapsed+.5;return;}if(outlet.high)v55HighPass(p,outlet.person,{exempt:true});else v55GroundPass(p,outlet.person,'pass',true);return;}const safe=m.people.filter(other=>other.t===p.t&&!other.keeper&&other.assignedLine==='def').sort((a,b)=>distance(a,p)-distance(b,p));if(!safe.length){m.next=m.elapsed+.5;return}note(`Kurzer Abstoß: ${p.name} auf ${safe[0].name}.`,'restart');v55GroundPass(p,safe[0],'pass',true);return}
 const rivals=m.people.filter(other=>other.t!==p.t),near=rivals.filter(other=>!other.keeper&&distance(other,p)<.15).sort((a,b)=>distance(a,p)-distance(b,p));
 const progress=p.t===0?1-p.y:p.y,wide=p.x<.29||p.x>.71,allies=m.people.filter(other=>other.t===p.t&&other!==p&&!other.keeper);
 const world=typeof v65WorldActive!=='undefined'&&v65WorldActive;if(world&&v131OpenGoal(p)){v55Shoot(p);return;}if(world&&progress>.62){const square=v115BetterSquare(p,allies,rivals);if(square){v55GroundPass(p,square);return;}}
 if(v55HasClearRun(p,rivals,progress)){
  const square=world?null:v55BreakawaySquare(p,allies,rivals);
  if(square){v55GroundPass(p,square);return}
  const range=world?v115GoalDistance(p):0,keeper=rivals.find(q=>q.keeper),finishRange=10+(ability(p,'fin')+ability(p,'pos'))/40*3;
  if(world?(range<=finishRange||range<18&&keeper&&v122Metres(p,keeper)<5.5):progress>.72){v55Shoot(p);return}
  if(m.breakawayCarrier!==p){note(`${p.name} läuft frei Richtung Tor.`,'major');m.breakawayCarrier=p}
  m.next=m.elapsed+.6;return;
 }
 m.breakawayCarrier=null;
 const box=allies.filter(other=>(other.t===0?other.y<.34:other.y>.66)&&other.x>.25&&other.x<.75);
 if(progress>.66&&wide&&box.length&&random()<v115DecisionChance(p,'cross',hasInstruction(p,'wing')?.85:.62)){const target=[...box].sort((a,b)=>ability(b,'air')+ability(b,'pos')*.3-ability(a,'air')-ability(a,'pos')*.3)[0];v55HighPass(p,target,{cross:true});return}
 if(progress>(hasInstruction(p,'shoot')?.67:.73)||(progress>.58&&random()<v115DecisionChance(p,'shot',hasInstruction(p,'shoot')?.28:.17))){v55Shoot(p);return}
 const target=v55ChooseTarget(p,allies,rivals),quick=match?.teamDirect?.[p.t]??(p.t===0&&direct),high=progress<.72&&random()<v115DecisionChance(p,'highPass',quick?.28:.13);
 if(high)v55HighPass(p,target);else v55GroundPass(p,target);
};

const v55BaseCorner=v50TakeCorner;
v50TakeCorner=function(setPiece){const m=match,taker=setPiece.taker,team=setPiece.team,allies=v50Outfield(team).filter(player=>player!==taker);if(!allies.length)return v55BaseCorner(setPiece);const receiver=allies.find(p=>setPiece.cornerTargetPid?p.pid===setPiece.cornerTargetPid:p.n===setPiece.cornerTargetNumber)||[...allies].sort((a,b)=>ability(b,'air')+ability(b,'pos')*.4-ability(a,'air')-ability(a,'pos')*.4)[0];m.owner=taker;m.ball={...setPiece.spot};if(setPiece.cornerVariant==='short')v55GroundPass(taker,receiver,'pass',true);else v55HighPass(taker,receiver,{cross:true,exempt:true,corner:true})};
v50TakeFreeKick=function(setPiece){
 const m=match,taker=setPiece.taker,team=setPiece.team,goalDistance=team===0?setPiece.spot.y:1-setPiece.spot.y;
 v50Spot(taker,setPiece.spot);m.owner=taker;m.ball={...setPiece.spot};m.offsideVisual=null;
 if(setPiece.type!=='offside'&&goalDistance<.38&&setPiece.spot.x>.18&&setPiece.spot.x<.82&&random()<.65){note(`${taker.name} versucht es direkt mit dem Freistoß.`,'restart');v55Shoot(taker,'direct-free-kick');return}
 const allies=v50Outfield(team).filter(player=>player!==taker),receiver=setPiece.type==='offside'?[...allies].sort((a,b)=>distance(a,taker)-distance(b,taker))[0]:[...allies].sort((a,b)=>(team===0?a.y-b.y:b.y-a.y)||distance(a,taker)-distance(b,taker))[0];
 note(`${taker.name} spielt den Freistoß ${setPiece.type==='offside'?'nach Abseits kurz ':''}auf ${receiver.name}.`,'restart');
 v55GroundPass(taker,receiver);
};

const v55BaseVersion=v50Version;
v50Version=function(){v55BaseVersion();document.querySelectorAll('footer span:first-child').forEach(label=>label.textContent='Doppel 6 / PROTOTYP 55');const footer=startScreen?.querySelector('footer');if(footer)footer.textContent='Doppel 6 / PROTOTYP 55'};
v50Version();

'use strict';
// One safe projection for profiles, permanent plans, prematch and halftime.
const v156RoleNames={'line-keeper':'Linientormann','sweeper-keeper':'Mitspielender Tormann','cover-defender':'Ausputzer',stopper:'Stopper','ball-playing-defender':'Ballspielender Verteidiger',playmaker:'Spielmacher','ball-winner':'Abräumer','box-to-box':'Box-to-Box',winger:'Flügelspieler',poacher:'Torjäger',striker:'Stoßstürmer','target-player':'Zielspieler',dribbler:'Dribbler'};
const v156Bands={'very-weak':'violetgray',weak:'bluegray',normal:'yellow',good:'orange','very-good':'pink'};
const v156ColorNames={violetgray:'Violettgrau',bluegray:'Blaugrau',yellow:'Gelb',orange:'Orange',pink:'Pink'};
function v156Labels(){return {positions:v61PositionNames,roles:'Empfohlene Rollen',role:'Rolle',orientation:'Ausrichtung',defensive:'Defensiv',neutral:'Neutral',offensive:'Offensiv',importantSkills:'Wichtige Fähigkeiten',suitability:'Rolleneignung',best:'Beste Empfehlung',zone:'Ungefährer Wirkungsraum',zoneHint:'Die Rolle und Ausrichtung lenken Laufangebote. Spieler reagieren frei auf die Spielsituation.',empty:'Keine Rollenempfehlung vorhanden.',skillHint:'Markierte Fähigkeiten sind für diese Rolle wichtig.'};}
function v156Projection(career,player,state=null,pid=player.pid){
 const config=career.world.playerFoundation.roles,model=player.playerModel.roleModel,assignment=state?.roleAssignments?.[pid];
 const skills=v154Skills(player),bandFor=(position,id)=>v55SkillBand(D6PlayerRoles.roleSuitability(skills,model.routine[position],id,config.suitability));
 const choice=(position,id)=>{const band=v156Bands[bandFor(position,id)];return {id,label:v156RoleNames[id],band,colorLabel:v156ColorNames[band]};};
 const important=new Set(D6PlayerRoles.ROLE_CATALOG.find(r=>r.id===assignment?.roleId)?.importantSkills||[]);
 const recommendations=player.playerModel.recommendedRoles.map(r=>({...choice(r.position,r.roleId),position:r.position,roleId:r.roleId,best:model.bestRecommendedRole?.roleId===r.roleId&&model.bestRecommendedRole?.position===r.position}));
 const ui={pid:player.pid,name:player.name,skills:v55SkillEntries({...player}).map(s=>({key:s.key,label:s.label,band:v156Bands[v55SkillBand(s.value)],colorLabel:v156ColorNames[v156Bands[v55SkillBand(s.value)]],important:important.has(s.key)})),recommendations};
 if(assignment){ui.assignment={roleId:assignment.roleId,label:v156RoleNames[assignment.roleId],position:assignment.position,orientation:assignment.orientation};ui.allowedRoles=v154Allowed(state,pid).map(id=>choice(assignment.position,id));ui.zone=v156Zone(assignment);}
 return ui;
}
function v156Zone(a){
 const point=a.position==='gk'?{depth:.08,width:.5}:{depth:1-(Math.floor(a.cell/5)+.5)/7,width:(a.cell%5+.5)/5};
 const sideways=a.roleId==='winger',height=sideways?.34:a.position==='gk'?.3:.5,width=sideways?.32:.64,shift=a.orientation*.08;
 return {x:clamp(point.width-width/2,0,1-width),y:clamp(1-point.depth-height/2-shift,0,1-height),width,height};
}
function v156Selection(career,fixture,state,side,pid){return D6PlayerTacticsUI.renderTacticRoleControl(v156Projection(career,v64Player(career,fixture,side,pid),state,pid),v156Labels())+'<p class="d6-zone-hint">Ungefährer Wirkungsraum · Spieler reagieren frei auf die Spielsituation.</p>';}
function v156PitchZone(state,pid){return state.roleAssignments?.[pid]?'<div class="d6-zone-layer">'+D6PlayerTacticsUI.renderRoleZone(v156Zone(state.roleAssignments[pid]),v156Labels())+'</div>':'';}
function v156PitchRole(career,player,state,pid){return state.roleAssignments?D6PlayerTacticsUI.renderPitchRole(v156Projection(career,player,state,pid),v156Labels()):'';}
document.addEventListener('change',async event=>{
 const select=event.target.closest?.('[data-d6-role]');if(!select)return;
 const career=v61CurrentCareer,pid=select.dataset.d6Role;if(!v154Active(career))return;
 if(!career.world.activeMatch){await v64CareerCommit(career,({state})=>v154SetRole(state,pid,select.value));return;}
 const fixture=v64ActiveFixture(career),state=career.world.activeMatch.state;if(!['prematch','paused'].includes(state.phase))return;
 const old=structuredClone(state.roleAssignments);
 try{
  if(state.phase==='prematch')v64UiRemember(fixture,state);else state.pauseUndo=v65UndoSnapshot(v65Context());
  v154SetRole(state,pid,select.value);await v64UiSave();
  if(state.phase==='prematch')v64UiRender(career);else{const context=v65Context();v65ApplyTactics(context);v65UpdateControls(context);draw();}
  document.querySelector(`[data-d6-role="${CSS.escape(pid)}"]`)?.focus();
 }catch(error){state.roleAssignments=old;v64UiError(error);}
});
if(typeof window==='object')window.D6TacticsProjection=v156Projection;

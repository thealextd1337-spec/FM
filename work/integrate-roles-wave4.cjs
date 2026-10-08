'use strict';
const fs=require('node:fs');
function edit(file,pairs){let s=fs.readFileSync(file,'utf8');for(const [a,b]of pairs){if(!s.includes(a))throw Error(file+': missing '+a.slice(0,100));s=s.replace(a,b);}fs.writeFileSync(file,s);}
edit('dist/world-player-foundation-v153.js',[
 ["options.parameterId!=='wave2-local-candidate-1'","!['wave2-local-candidate-1','wave3-local-candidate-1'].includes(options.parameterId)"],
 ['delete player.potential;delete player.developmentMinutes;',"if(typeof v154GenerateRoles==='function')v154GenerateRoles(player,created,foundation);\n delete player.potential;delete player.developmentMinutes;"]
]);
edit('work/build-player-foundation-preview.cjs',[
 ["get('players')==='wave2'","['wave2','wave3'].includes(new URLSearchParams(location.search).get('players'))"],
 ["new URLSearchParams(location.search).['wave2'","['wave2'"],
 ['window.D6PlayerFoundationPreviewOptions=${JSON.stringify(options)};','window.D6PlayerFoundationPreviewOptions=${JSON.stringify(options)};\\n if(new URLSearchParams(location.search).get(\'players\')===\'wave3\'){Object.assign(window.D6PlayerFoundationPreviewOptions,{parameterId:\'wave3-local-candidate-1\',roles:{suitability:D6PlayerRoles.candidateParameters,routine:D6PositionRoutine.candidateParameters,transitions:D6TacticTransitions.candidateParameters},ratings:D6MatchRatings.candidateParameters});}'],
 ['Spielergrundlagen · lokale Prüfkarriere.','Spieler und Rollen · lokale Prüfkarriere.']
]);
edit('dist/world-match-v64.js',[
 [' const stored=state.instructions?.[pid]'," if(state.roleAssignments)return [];\n const stored=state.instructions?.[pid]"],
 ["function v64HasInstruction(state,pid,value){return v64PlayerInstructions(state,pid).includes(value)}","function v64HasInstruction(state,pid,value){return state.roleAssignments?v154RoleIntent({tacticalRole:state.roleAssignments[pid]?.roleId},value):v64PlayerInstructions(state,pid).includes(value)}"],
 [" const plan=side===0?fixture.plan.home:fixture.plan.away;if(!plan.coachId)return;"," const plan=side===0?fixture.plan.home:fixture.plan.away;if(!plan.coachId||typeof v154Active==='function'&&v154Active(career))return;"],
 [' return state;\n}\nfunction v64ClockLabel'," if(typeof v154Initialize==='function')v154Initialize(career,fixture,state);\n if(typeof v155Initialize==='function')v155Initialize(career,state);\n return state;\n}\nfunction v64ClockLabel"],
 ["function v64Orientation(state,pid){return state.orientation?.[pid]??", "function v64Orientation(state,pid){return state.roleAssignments?.[pid]?.orientation??state.orientation?.[pid]??"],
 ['state.orientation[pid]=value}',"state.orientation[pid]=value;if(state.roleAssignments?.[pid])state.roleAssignments[pid].orientation=value}"],
 [' const proposed={...state.roles,[sourcePid]:v64GridRole(targetCell)};'," const group=cell=>state.roleAssignments?(1-(Math.floor(cell/5)+.5)/7<.3?'def':1-(Math.floor(cell/5)+.5)/7<.7?'mid':'att'):v64GridRole(cell);\n const proposed={...state.roles,[sourcePid]:group(targetCell)};"],
 ['proposed[otherPid]=v64GridRole(previous);','proposed[otherPid]=group(previous);'],
 [' cells[sourcePid]=targetCell;if(otherPid)cells[otherPid]=previous;'," if(state.roleAssignments)v154Transition(state,otherPid?{type:'swap',playerId:sourcePid,otherPlayerId:otherPid}:{type:'free-move',playerId:sourcePid,toCell:targetCell},v61Random(`${career.world.seed}:${fixture.id}:role-move:${state.minute}:${state.tacticChanges.length}:${sourcePid}:${targetCell}`));\n cells[sourcePid]=targetCell;if(otherPid)cells[otherPid]=previous;"],
 [' Object.assign(state.roles,assign);state.tactics[side].formation=formation;v64ResetCells(state,side);'," Object.assign(state.roles,assign);state.tactics[side].formation=formation;v64ResetCells(state,side);\n if(state.roleAssignments)v154Initialize(career,fixture,state);"],
 [' v64TransferInstructions(state,outPid,inPid);'," if(state.roleAssignments)v154Transition(state,{type:'substitution',outPlayerId:outPid,inPlayerId:inPid});\n v64TransferInstructions(state,outPid,inPid);"],
 ['  v64TransferInstructions(state,item.outPid,item.inPid);',"  if(state.roleAssignments)v154Transition(state,{type:'substitution',outPlayerId:item.outPid,inPlayerId:item.inPid});\n  v64TransferInstructions(state,item.outPid,item.inPid);"],
 [' let goal=false,stoppage=state.minute===45;'," if(state.playerPerformance)v155SyncPhases(state);\n let goal=false,stoppage=state.minute===45;"],
 ["  if(random()<.12){", "  if(state.playerPerformance){if(v155CompactActions(career,fixture,state,side,random)){goal=true;stoppage=true;}}else if(random()<.12){"],
 [' const stats=state.stats[player.pid],rating=minutes>=20?'," const rated=state.playerPerformance?v155Book(career,fixture,state,player):null;\n  const stats=state.stats[player.pid],rating=rated?rated.visibleRating:minutes>=20?"],
 ['record.players.push(line);',"if(rated)line.roleRating={version:155,appearanceId:rated.id,phases:structuredClone(state.playerPerformance.phases[player.pid])};record.players.push(line);"]
]);
edit('dist/game.js',[
 ['function hasInstruction(player,value){return ',"function hasInstruction(player,value){if(player.tacticalRole&&typeof v154RoleIntent==='function')return v154RoleIntent(player,value);return "],
 ['function step(delta,realDelta){const m=match;',"function step(delta,realDelta){const m=match;if(typeof v155BeforeNative==='function')v155BeforeNative(m);"],
 ["if(p.interceptTarget&&m.flight){", "if(typeof v154RoleTarget==='function')v154RoleTarget(m,p,realDelta);if(p.interceptTarget&&m.flight){"]
]);
edit('dist/pitch-v55.js',[
 ["function v55GroundPass(passer,receiver,kind='pass',exempt=false){", "function v55GroundPass(passer,receiver,kind='pass',exempt=false){\n if(typeof v155AttemptPass==='function')v155AttemptPass(match,passer,receiver);"],
 ["function v55HighPass(passer,receiver,{cross=false,exempt=false,corner=false}={}){", "function v55HighPass(passer,receiver,{cross=false,exempt=false,corner=false}={}){\n if(typeof v155AttemptPass==='function')v155AttemptPass(match,passer,receiver);"]
]);
edit('dist/world-physical-v65.js',[
 [' person.initialBy=person.by;'," if(typeof v154PhysicalAssignment==='function')v154PhysicalAssignment(context,person,side);\n person.initialBy=person.by;"],
 ['   person.cell=cell;',"   if(typeof v154PhysicalAssignment==='function')v154PhysicalAssignment(context,person,side);\n   person.cell=cell;"],
 [" const own=context.state.tactics[context.ownSide]", " for(const person of match.people.filter(p=>p.keeper))if(typeof v154PhysicalAssignment==='function')v154PhysicalAssignment(context,person,v65Side(person.t,context.ownSide));\n const own=context.state.tactics[context.ownSide]"],
 ['function v65AfterStep(context){\n const state=context.state;',"function v65AfterStep(context){\n const state=context.state;"],
 [' v65SyncMinute(context,Math.floor(match.elapsed/75*90));'," v65SyncMinute(context,Math.floor(match.elapsed/75*90));\n if(state.playerPerformance)v155ObserveNative(context);"],
 [' const everyone=[...match.people,...match.exitedPeople];state.ratings={};'," if(state.playerPerformance)v155ObserveNative(context);\n const everyone=[...match.people,...match.exitedPeople];state.ratings={};"],
 ['  state.ratings[pid]=performanceRating(person);',"  state.ratings[pid]=state.playerPerformance?v155Rated(context.career,context.fixture,state,pid)?.rating:performanceRating(person);"],
 ['instructions:structuredClone(state.instructions||{}),pending:',"instructions:structuredClone(state.instructions||{}),roleAssignments:structuredClone(state.roleAssignments),pending:"],
 ['state.instructions=undo.instructions;state.pending',"state.instructions=undo.instructions;if(undo.roleAssignments)state.roleAssignments=undo.roleAssignments;state.pending"],
 ['performanceRating(person)]));state.liveRatingStep=step',"(state.playerPerformance?v155Rated(context.career,context.fixture,state,person.pid)?.rating:performanceRating(person))]));state.liveRatingStep=step"],
 ["state.minutes[person.pid]>=10&&state.liveRatings", "state.minutes[person.pid]>=(state.playerPerformance?20:10)&&state.liveRatings"]
]);
console.log('Role, native observation, compact action and learning hooks integrated.');

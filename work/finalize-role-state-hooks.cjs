'use strict';const fs=require('node:fs');function edit(f,pairs){let s=fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');for(const[a,b]of pairs){if(!s.includes(a))throw Error(f+': '+a.slice(0,80));s=s.replace(a,b);}fs.writeFileSync(f,s);}
edit('dist/world-match-v64.js',[
 ['state.orientation[pid]=value;if(state.roleAssignments?.[pid])state.roleAssignments[pid].orientation=value}',"if(state.playerPerformance)v155SyncPhases(state);state.orientation[pid]=value;if(state.roleAssignments?.[pid])state.roleAssignments[pid].orientation=value;if(state.playerPerformance)v155SyncPhases(state)}"],
 [" if(state.roleAssignments)v154Transition(state,otherPid?", " if(state.playerPerformance)v155SyncPhases(state);\n if(state.roleAssignments){state.roleMoveSequence=(state.roleMoveSequence||0)+1;}\n if(state.roleAssignments)v154Transition(state,otherPid?"],
 ['${state.tacticChanges.length}:${sourcePid}', '${state.roleMoveSequence}:${sourcePid}'],
 [' v64NormalizeInstructions(state,sourcePid);'," if(state.playerPerformance)v155SyncPhases(state);\n v64NormalizeInstructions(state,sourcePid);"],
 ['function v64ExecutePending(career,fixture,state,reason){\n const changes=[];',"function v64ExecutePending(career,fixture,state,reason){\n if(state.playerPerformance)v155SyncPhases(state);\n const changes=[];"],
 [' state.pending=[[],[]];\n return changes;'," state.pending=[[],[]];\n if(state.playerPerformance)v155SyncPhases(state);\n return changes;"]
]);
edit('dist/world-career-plan-v64.js',[
 ['roleAssignments:structuredClone(source.roleAssignments||{})','roleAssignments:structuredClone(source.roleAssignments||{}),roleMoveSequence:source.roleMoveSequence||0'],
 ['v154Initialize(career,fixture,state,plan.roleAssignments);',"v154Initialize(career,fixture,state,plan.roleAssignments);if(plan.roleMoveSequence)state.roleMoveSequence=plan.roleMoveSequence;"],
 ['roleAssignments:structuredClone(state.roleAssignments)}','roleAssignments:structuredClone(state.roleAssignments),roleMoveSequence:state.roleMoveSequence||0}']
]);
edit('dist/world-tactics-ui-v156.js',[
 ["position:v61PositionNames[r.position],roleId:r.roleId","position:r.position,roleId:r.roleId"],
 ["return {roles:'Empfohlene Rollen'", "return {positions:v61PositionNames,roles:'Empfohlene Rollen'"]
]);
console.log('Actual role phase boundaries and saved role RNG sequence completed.');

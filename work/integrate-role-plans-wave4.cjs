'use strict';const fs=require('node:fs');
function edit(f,pairs){let s=fs.readFileSync(f,'utf8');for(const[a,b]of pairs){if(!s.includes(a))throw Error(f+': '+a.slice(0,80));s=s.replace(a,b);}fs.writeFileSync(f,s);}
edit('dist/world-career-plan-v64.js',[
 ['return{starters,bench,roles,cells,orientation,instructions,tactics};',"return{starters,bench,roles,cells,orientation,instructions,tactics,...(typeof v154Active==='function'&&v154Active(career)?{roleAssignments:structuredClone(source.roleAssignments||{})}:{})};"],
 [' return{fixture,state};'," if(typeof v154Initialize==='function')v154Initialize(career,fixture,state,plan.roleAssignments);\n return{fixture,state};"],
 ['return{starters,bench,roles:Object.fromEntries',"return{starters,bench,...(state.roleAssignments?{roleAssignments:structuredClone(state.roleAssignments)}:{}),roles:Object.fromEntries"],
 [" for(const pid of [...saved.starters,...saved.bench])if(state.fresh[pid]===undefined)", " if(typeof v154Initialize==='function')v154Initialize(career,fixture,state,saved.roleAssignments);\n for(const pid of [...saved.starters,...saved.bench])if(state.fresh[pid]===undefined)"],
 ["if(plan.instructions[target])state.instructions[pid]=[...plan.instructions[target]];}\n}","if(plan.instructions[target])state.instructions[pid]=[...plan.instructions[target]];}\n if(state.roleAssignments)v154Initialize(career,fixture,state,Object.fromEntries([...mapping].map(([pid,target])=>[pid,plan.roleAssignments?.[target]])));\n}"],
 ['${v64OrientationHTML(state,pid)}${v64InstructionHTML(state,pid)}`;',"${state.roleAssignments?v156Selection(career,fixture,state,0,pid):v64OrientationHTML(state,pid)+v64InstructionHTML(state,pid)}`;"]
]);
edit('dist/world-player-roles-v154.js',[
 [' state.roleAssignments||={};state.roleParameters='," state.roleAssignments||={};const activeIds=new Set([...state.active,...state.awayActive]);for(const pid of Object.keys(state.roleAssignments))if(!activeIds.has(pid))delete state.roleAssignments[pid];state.roleParameters="]
]);
console.log('Permanent plan and preset role persistence integrated.');

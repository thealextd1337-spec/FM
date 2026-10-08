'use strict';const fs=require('node:fs');function edit(f,pairs){let s=fs.readFileSync(f,'utf8');for(const[a,b]of pairs){if(!s.includes(a))throw Error(f+': '+a.slice(0,85));s=s.replace(a,b);}fs.writeFileSync(f,s);}
edit('dist/world-match-ui-v64.js',[
 ['return v64PositionWarningHTML(player,state.roles[pid])+v64OrientationHTML(state,pid)+v64InstructionHTML(state,pid);',"return v64PositionWarningHTML(player,state.roles[pid])+(state.roleAssignments?v156Selection(career,fixture,state,side,pid):v64OrientationHTML(state,pid)+v64InstructionHTML(state,pid));"],
 ['${player?`<span class="role-mark"', '${player?`${v156PitchRole(career,player,state,entry.originalPid)}<span class="role-mark"'],
 ['<span class="token">${escapeHTML(keeper.n)}</span>', '${v156PitchRole(career,keeper,state,keeperOriginal)}<span class="token">${escapeHTML(keeper.n)}</span>'],
 ['${v64InstructionLabel(state,entry.originalPid)}', '${state.roleAssignments?v156RoleNames[state.roleAssignments[entry.originalPid].roleId]:v64InstructionLabel(state,entry.originalPid)}']
]);
edit('dist/world-physical-v65.js',[
 ['const controls=`${v64OrientationHTML(state,pid)}${v64InstructionHTML(state,pid)}', 'const controls=`${state.roleAssignments?v156Selection(career,fixture,state,ownSide,pid):v64OrientationHTML(state,pid)+v64InstructionHTML(state,pid)}']
]);
edit('dist/world-views-v68.js',[
 [" v61ProfileDialog.querySelector('[data-v61-close]').onclick=", " if(player.playerModel?.roleModel&&v154Active(career))v61ProfileDialog.querySelector('.player-card-facts').insertAdjacentHTML('afterend',D6PlayerTacticsUI.renderProfileRoles(v156Projection(career,player),v156Labels()));\n v61ProfileDialog.querySelector('[data-v61-close]').onclick="]
]);
const scripts=['player-role-suitability.js','player-position-routine.js','player-tactic-transitions.js','player-match-ratings.js','player-tactics-ui.js','world-player-roles-v154.js','world-player-performance-v155.js','world-tactics-ui-v156.js'];
edit('dist/index.html',[
 ['<script src="world-player-foundation-v153.js"></script>',scripts.map(f=>`<script src="${f}"></script>`).join('\n')+'\n<script src="world-player-foundation-v153.js"></script>'],
 ['<link rel="stylesheet" href="ui-flutlicht/match.css">','<link rel="stylesheet" href="ui-flutlicht/match.css">\n  <link rel="stylesheet" href="player-tactics-ui.css">']
]);
edit('work/build.cjs',[
 ["'world-player-foundation-v153.js'",scripts.map(f=>`'${f}'`).join(',')+",'world-player-foundation-v153.js'"],
 ["'progress-v58.css']","'progress-v58.css','player-tactics-ui.css']"]
]);
console.log('Role projections and shared tactical controls integrated.');

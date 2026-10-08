const fs=require('node:fs');
function edit(file,from,to){let s=fs.readFileSync(file,'utf8');if(!s.includes(from))throw Error('Missing seam '+file+': '+from.slice(0,70));fs.writeFileSync(file,s.replace(from,to));}
edit('work/check-shared-tactics-v140.cjs','l.full.length>l.name.length));','l.full.length>l.name.length),JSON.stringify(labels));');
edit('dist/world-career-plan-v64.js',"else if(state.phase==='paused')v140ApplyPausedPreset(career,fixture,state,preset.plan);", "else if(state.phase==='paused'){const undo=v65UndoSnapshot({state,ownSide:v64UiOwnSide(fixture)});v140ApplyPausedPreset(career,fixture,state,preset.plan);state.pauseUndo=undo;}");
edit('dist/world-career-plan-v64.js','Object.assign(state,previousState);career.manager.matchPlan','for(const key of Object.keys(state))if(!(key in previousState))delete state[key];Object.assign(state,previousState);career.manager.matchPlan');
edit('dist/world-physical-v65.js','${v62Date(fixture.day)} · Ergebnisse nach deinem Spiel','${v62Date(fixture.day)}${type===\'league\'?\' · Spieltag \'+escapeHTML(String(fixture.round).replace(/^R/,\'\')):\'\'} · Ergebnisse nach deinem Spiel');
edit('dist/world-physical-v65.js',"if(session.phase==='choose'){const dialog=v42Screen", "if(session.phase==='shooting'){const scene=v42Screen.querySelector('.v42-goal-scene');scene.removeAttribute('aria-hidden');scene.insertAdjacentHTML('beforeend','<button type=\"button\" class=\"primary v146-shoot\">Schießen</button>');scene.querySelector('.v146-shoot').onclick=()=>v42Screen.querySelector('#v42-next')?.click();}if(session.phase==='choose'){const dialog=v42Screen");
edit('dist/world-start-v61.css','.v64-prematch-field .v64-raster .player-label,.v64-prematch-field .v64-keeper-choice .player-label{margin-top:4px}', '.v64-prematch-field .v64-raster .player-label,.v64-prematch-field .v64-keeper-choice .player-label{margin-top:4px}\n#penalty-screen .v146-shoot{position:absolute;z-index:6;right:4%;bottom:10px;min-height:44px;padding:10px 12px;font-size:12px}');
edit('dist/pitch-v55.js'," if(progress>(hasInstruction(p,'shoot')?.67:.73)||(progress>.58&&random()<v115DecisionChance(p,'shot',hasInstruction(p,'shoot')?.28:.17))){v55Shoot(p);return}"," if(world?random()<v145ShotChance(p,rivals):progress>(hasInstruction(p,'shoot')?.67:.73)||(progress>.58&&random()<v115DecisionChance(p,'shot',hasInstruction(p,'shoot')?.28:.17))){v55Shoot(p);return}");
edit('dist/pitch-v55.js','function v123KeeperOutlet(',`// Ordinary open-play shots favour a useful angle and an unblocked lane.
// Breakaways, open goals, headers and set pieces keep their separate decisions.
function v145ShotChance(p,rivals){
 const range=v115GoalDistance(p);if(range>30)return 0;
 const lateral=Math.abs(p.x-.5)*44/(v55Field.right-v55Field.left),depth=Math.abs(p.y-(p.t===0?v55Field.top:v55Field.bottom))*68/(v55Field.bottom-v55Field.top);
 if(depth<1||lateral>depth*.9+3)return 0;
 const goal={x:.5,y:p.t===0?v55Field.top:v55Field.bottom},blocked=rivals.some(r=>{if(r.keeper)return false;const lane=passLaneGeometry(r,p,goal);return lane&&v122Metres(r,lane)<1.25;});
 const base=range<=14?.75:range<=20?.75-(range-14)*.085:range<=25?.10-(range-20)*.014:.03-(range-25)*.005;
 return clamp(base*(hasInstruction(p,'shoot')?1.5:1)*(.65+(ability(p,'fin')+ability(p,'tec'))/40*.55)*(blocked?.3:1),0,.9);
}
function v123KeeperOutlet(`);

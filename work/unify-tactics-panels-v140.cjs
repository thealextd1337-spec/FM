const fs=require('fs');let file='dist/world-career-plan-v64.js',s=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
s=s.replace(' const target=side===0?fixture.plan.home:fixture.plan.away;\n return v64CareerPlanNormalize(career,v64CareerPlanSnapshot',' const target={starters:[...v64Active(state,side)],bench:[...v64Bench(state,side)]};\n return v64CareerPlanNormalize(career,v64CareerPlanSnapshot');
s=s.replace('function v140MatchPresetsHTML(career){','function v140MatchPresetsHTML(career,mode=\'prematch\'){');s=s.replace('aria-label="Gespeicherte Matchpläne"><h3>','data-v140-mode="${mode}" aria-label="Gespeicherte Matchpläne"><h3>');s=s.replaceAll('v140-preset-name','v140-${mode}-name').replaceAll('v140-preset-select','v140-${mode}-select').replaceAll('v140-preset-error','v140-${mode}-error');
s=s.replace('<input id="v140-${mode}-name"','<input data-v140-name id="v140-${mode}-name"').replace('<select id="v140-${mode}-select"','<select data-v140-select id="v140-${mode}-select"').replace('<p id="v140-${mode}-error"','<p data-v140-error id="v140-${mode}-error"');
s=s.replace('if(state.phase!==\'prematch\')return false;\n name=',"if(!['prematch','paused'].includes(state.phase))return false;\n name=");
s=s.replace(" if(state.phase!=='prematch')return false;\n const preset=", " if(!['prematch','paused'].includes(state.phase))return false;\n const preset=");
s=s.replace('const previousPlan=structuredClone(fixture.plan),previousState=structuredClone(state);','const previousPlan=structuredClone(fixture.plan),previousState=structuredClone(state),previousPermanent=career.manager.matchPlan;');
s=s.replace('try{v64ApplyCareerPlan(career,fixture,state,preset.plan);await v64UiSave();',`try{if(fixture.id==='career-plan')career.manager.matchPlan=v64CareerPlanNormalize(career,preset.plan);else if(state.phase==='paused')v140ApplyPausedPreset(career,fixture,state,preset.plan);else v64ApplyCareerPlan(career,fixture,state,preset.plan);await v64UiSave();`);
s=s.replace('fixture.plan=previousPlan;Object.assign(state,previousState);throw error','fixture.plan=previousPlan;Object.assign(state,previousState);career.manager.matchPlan=previousPermanent;throw error');
s=s.replace('function v64CareerPlanHTML(career){',`function v140ApplyPausedPreset(career,fixture,state,source){
 const side=v64UiOwnSide(fixture),plan=v64CareerPlanNormalize(career,source),active=v64Active(state,side),outgoing=active.filter(pid=>!plan.starters.includes(pid)),incoming=plan.starters.filter(pid=>!active.includes(pid)),mapping=new Map(active.filter(pid=>plan.starters.includes(pid)).map(pid=>[pid,pid]));
 state.pending[side]=[];
 for(const inPid of incoming){const keeper=v64Player(career,fixture,side,inPid).keeper,index=outgoing.findIndex(pid=>v64Player(career,fixture,side,pid).keeper===keeper);if(index<0)throw Error('Dieser Wechsel ist nicht zulässig.');const outPid=outgoing.splice(index,1)[0];v64QueueSubstitution(career,fixture,state,side,outPid,inPid);mapping.set(outPid,inPid);}
 v64ChangeTactics(career,fixture,state,side,plan.tactics,'Matchplan');
 for(const [pid,target]of mapping){state.roles[pid]=plan.roles[target];delete state.cells[pid];delete state.orientation[pid];delete state.instructions[pid];if(Number.isInteger(plan.cells[target]))state.cells[pid]=plan.cells[target];if(plan.orientation[target]!==undefined)state.orientation[pid]=plan.orientation[target];if(plan.instructions[target])state.instructions[pid]=[...plan.instructions[target]];}
}
function v140TacticsHTML(state,side){return '<h2>Teamtaktik</h2>'+v64UiTactics(state,side);}
function v64CareerPlanHTML(career){`);
// Move the career preset controls into the same side panel; retain one shared renderer.
const a=s.indexOf('<section class="v62-season v64-career-presets">'),b=s.indexOf('<p class="v61-error" role="alert" id="v64-career-error">',a);if(a<0||b<0)throw Error('career presets');s=s.slice(0,a)+s.slice(b);s=s.replace('<section class="v64-controls">${controls}</section></div></div>','<section class="v64-controls">${controls}</section>${v140MatchPresetsHTML(career,\'career\')}</div></div>');s=s.replace("v64CareerPlanTab==='tactics'?v64UiTactics(state,0)","v64CareerPlanTab==='tactics'?v140TacticsHTML(state,0)");
// Shared events work in the career, preparation and physical pause screens.
const eventStart=s.indexOf("\nv61WorldScreen.addEventListener('input',event=>{if(event.target.id==='v140-${mode}-name')");if(eventStart<0)throw Error('events');s=s.slice(0,eventStart)+`
function v140PresetContext(panel){
 const career=v61CurrentCareer;if(!career)return null;
 if(panel.dataset.v140Mode==='career'){if(career.world.activeMatch)return null;return {career,...v64CareerPlanContext(career),side:0};}
 const fixture=v64ActiveFixture(career),state=career.world.activeMatch?.state;if(!fixture||!['prematch','paused'].includes(state?.phase))return null;return {career,fixture,state,side:v64UiOwnSide(fixture)};
}
function v140PresetRender(context,mode){if(mode==='career')v64CareerRenderView(context.career);else if(mode==='paused'){const physical=v65Context();v65ApplyTactics(physical);v65Snapshot(physical);v65UpdateControls(physical);draw();}else v64UiRender(context.career);}
document.addEventListener('input',event=>{if(event.target.matches('[data-v140-name]'))v140MatchPresetName=event.target.value;});
document.addEventListener('change',event=>{if(event.target.matches('[data-v140-select]'))v140MatchPresetId=event.target.value;});
document.addEventListener('click',async event=>{
 const button=event.target.closest('[data-v140-save],[data-v140-load]');if(!button||button.disabled)return;
 const panel=button.closest('.v140-match-presets'),context=v140PresetContext(panel);if(!context)return;const {career,fixture,state,side}=context;button.disabled=true;
 try{if(button.hasAttribute('data-v140-save'))await v140SaveMatchPreset(career,fixture,state,side,panel.querySelector('[data-v140-name]').value);else await v140LoadMatchPreset(career,fixture,state,panel.querySelector('[data-v140-select]').value);v140PresetRender(context,panel.dataset.v140Mode);}
 catch(error){panel.querySelector('[data-v140-error]').textContent=error.message;button.disabled=false;}
});
`;
fs.writeFileSync(file,s);
file='dist/world-match-ui-v64.js';s=fs.readFileSync(file,'utf8');const old="`<h2>Teamtaktik</h2><p>Wähle Formation und Spielidee. Änderungen sind sofort auf dem Spielfeld sichtbar.</p>${v64UiTactics(state,side)}`";s=s.replace(old,'v140TacticsHTML(state,side)');fs.writeFileSync(file,s);
file='dist/world-physical-v65.js';s=fs.readFileSync(file,'utf8');s=s.replace('`<h2>Teamtaktik</h2><p>Wähle Formation und Spielidee. Die Änderung gilt sofort.</p>${v64UiTactics(state,ownSide)}`','v140TacticsHTML(state,ownSide)');const marker="\n}\nfunction v65WorldReport";s=s.replace(marker,`\n if(editing)pitch.querySelector('.v65-pause-controls').insertAdjacentHTML('beforeend',v140MatchPresetsHTML(context.career,'paused'));\n}\nfunction v65WorldReport`);fs.writeFileSync(file,s);
file='work/test-world-career-plan.cjs';s=fs.readFileSync(file,'utf8').replace('/data-v64-career-save/','/data-v140-save/');fs.writeFileSync(file,s);
file='work/check-prematch-presets-v140.cjs';s=fs.readFileSync(file,'utf8').replaceAll('#v140-preset-name','[data-v140-name]').replaceAll('#v140-preset-select','[data-v140-select]').replaceAll('#v140-preset-error','[data-v140-error]');fs.writeFileSync(file,s);

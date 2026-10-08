const fs=require('fs');let s=fs.readFileSync('dist/world-career-plan-v64.js','utf8');s=s.replace('function v64ApplyCareerPlan(career,fixture,state){\n if(!career.manager.matchPlan)return;','function v64ApplyCareerPlan(career,fixture,state,savedPlan=career.manager.matchPlan){\n if(!savedPlan)return;').replace('const saved=v64CareerPlanNormalize(career,career.manager.matchPlan),target=side===0?fixture.plan.home:fixture.plan.away','const saved=v64CareerPlanNormalize(career,savedPlan),target=side===0?fixture.plan.home:fixture.plan.away');
const marker='function v64CareerPlanHTML(career){';s=s.replace(marker,`let v140MatchPresetName='',v140MatchPresetId='';
function v140MatchPresetPlan(career,fixture,state,side){
 const target=side===0?fixture.plan.home:fixture.plan.away;
 return v64CareerPlanNormalize(career,v64CareerPlanSnapshot({fixture:{plan:{home:target}},state:{...state,tactics:[state.tactics[side]]}}));
}
function v140MatchPresetsHTML(career){
 const presets=career.manager.tacticPresets||[];
 return \`<section class="v140-match-presets" aria-label="Gespeicherte Matchpläne"><h3>Gespeicherte Matchpläne</h3><div><label class="sr-only" for="v140-preset-name">Name der Vorlage</label><input id="v140-preset-name" maxlength="32" value="\$\{escapeHTML(v140MatchPresetName)\}" placeholder="Name der Vorlage"><button type="button" data-v140-save>Vorlage speichern</button></div><div><label class="sr-only" for="v140-preset-select">Gespeicherte Matchpläne</label><select id="v140-preset-select" \$\{presets.length?'':'disabled'\}>\$\{presets.length?presets.map(p=>\`<option value="\$\{escapeHTML(p.id)\}" translate="no" \$\{p.id===v140MatchPresetId?'selected':''\}>\$\{escapeHTML(p.name)\}</option>\`).join(''):'<option>Noch keine Vorlage gespeichert.</option>'\}</select><button type="button" data-v140-load \$\{presets.length?'':'disabled'\}>Laden</button></div><p id="v140-preset-error" class="v61-error" role="alert"></p></section>\`;
}
async function v140SaveMatchPreset(career,fixture,state,side,name){
 if(state.phase!=='prematch')return false;
 name=name.trim().replace(/\\s+/g,' ');if(name.length<2||name.length>32)throw Error('Der Vorlagenname muss 2 bis 32 Zeichen haben.');
 const previous=career.manager.tacticPresets,entries=structuredClone(previous||[]),existing=entries.find(p=>p.name.toLocaleLowerCase()===name.toLocaleLowerCase()),plan=v140MatchPresetPlan(career,fixture,state,side),preset=existing||{id:crypto.randomUUID(),name,plan};
 preset.name=name;preset.plan=plan;if(!existing)entries.push(preset);career.manager.tacticPresets=entries;
 try{await v64UiSave();v140MatchPresetName=name;v140MatchPresetId=preset.id;return true}catch(error){career.manager.tacticPresets=previous;throw error}
}
async function v140LoadMatchPreset(career,fixture,state,id){
 if(state.phase!=='prematch')return false;
 const preset=(career.manager.tacticPresets||[]).find(p=>p.id===id);if(!preset)return false;
 const previousPlan=structuredClone(fixture.plan),previousState=structuredClone(state);
 try{v64ApplyCareerPlan(career,fixture,state,preset.plan);await v64UiSave();v140MatchPresetName=preset.name;v140MatchPresetId=id;return true}catch(error){fixture.plan=previousPlan;Object.assign(state,previousState);throw error}
}
`+marker);
s+=`\nv61WorldScreen.addEventListener('input',event=>{if(event.target.id==='v140-preset-name')v140MatchPresetName=event.target.value;});
v61WorldScreen.addEventListener('change',event=>{if(event.target.id==='v140-preset-select')v140MatchPresetId=event.target.value;});
v61WorldScreen.addEventListener('click',async event=>{
 const button=event.target.closest('[data-v140-save],[data-v140-load]');if(!button||button.disabled)return;
 const career=v61CurrentCareer,fixture=career&&v64ActiveFixture(career),state=career?.world.activeMatch?.state;if(!fixture||state?.phase!=='prematch')return;
 button.disabled=true;
 try{if(button.hasAttribute('data-v140-save'))await v140SaveMatchPreset(career,fixture,state,v64UiOwnSide(fixture),v140MatchPresetName);else{const id=v61WorldScreen.querySelector('#v140-preset-select').value;await v140LoadMatchPreset(career,fixture,state,id);}v64UiRender(career);}
 catch(error){v61WorldScreen.querySelector('#v140-preset-error').textContent=error.message;button.disabled=false;}
});\n`;
fs.writeFileSync('dist/world-career-plan-v64.js',s);
s=fs.readFileSync('dist/world-match-ui-v64.js','utf8');const a='<p id="v64-message" role="alert" class="v61-error"></p></section></div></div></div>';if(!s.includes(a))throw Error('panel');s=s.replace(a,'<p id="v64-message" role="alert" class="v61-error"></p></section>${phase===\'prematch\'?v140MatchPresetsHTML(career):\'\'}</div></div></div>');fs.writeFileSync('dist/world-match-ui-v64.js',s);
fs.appendFileSync('dist/world-start-v61.css',`\n.v140-match-presets{margin-top:10px;padding:10px;border:1px solid #436560;border-radius:8px;background:#172d31}.v140-match-presets h3{font-size:12px;margin:0 0 7px}.v140-match-presets>div{display:flex;gap:6px;margin-top:6px}.v140-match-presets input,.v140-match-presets select{min-width:0;flex:1;width:100%;padding:7px;font-size:11px}.v140-match-presets button{flex:none;padding:7px 8px;font-size:11px}.v140-match-presets .v61-error:empty{display:none}.v140-match-presets .v61-error{font-size:11px;margin:6px 0 0}\n`);

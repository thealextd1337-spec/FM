(async()=>{
 const checks=[],check=(name,pass)=>{if(!pass)throw Error(name);checks.push(name)},turn=()=>new Promise(resolve=>setTimeout(resolve,30)),config=window.D6NativeTestConfig||{fieldSize:'large',fieldPlayers:5};
 await v61WaitForStorage();
 check('Isolated QA profile has a free career slot',v61ReadCareers().length<v61MaxCareers);
 doppel6Language.set('de');v61Begin();await turn();
 check('New career defaults to larger pitch and five field players',document.querySelector('#v160-field-size').value==='large'&&document.querySelector('#v160-field-players').value==='5');
 check('German field labels',document.querySelector('label[for="v160-field-size"]').textContent==='Spielfeld'&&document.querySelector('label[for="v160-field-players"]').textContent==='Feldspieler pro Mannschaft');
 doppel6Language.set('en');await turn();
 check('English field labels',document.querySelector('label[for="v160-field-size"]').textContent==='Pitch'&&document.querySelector('label[for="v160-field-players"]').textContent==='Outfield players per team');
 const input=document.querySelector('#v61-manager-name');input.value='Native v160 UI QA';input.dispatchEvent(new Event('input',{bubbles:true}));
 for(const [selector,value] of [['#v160-field-size',config.fieldSize],['#v160-field-players',String(config.fieldPlayers)]]){const field=document.querySelector(selector);field.value=value;field.dispatchEvent(new Event('change',{bubbles:true}));}
 document.querySelector('[data-v61-manager-next]').click();await turn();
 check('Manager step records selected rules',v61Flow.step==='country'&&v61Flow.matchConfig.fieldSize===config.fieldSize&&v61Flow.matchConfig.fieldPlayers===config.fieldPlayers);
 document.querySelector('[data-v61-back="manager"]').click();await turn();
 check('Back navigation keeps both selections',document.querySelector('#v160-field-size').value===config.fieldSize&&document.querySelector('#v160-field-players').value===String(config.fieldPlayers));
 check('Start controls fit mobile width',document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll('.v61-manager-step input,.v61-manager-step select')].every(n=>n.getBoundingClientRect().right<=innerWidth));
 document.querySelector('[data-v61-manager-next]').click();await turn();document.querySelector('[data-v61-country="GER"]').click();await turn();document.querySelector('[data-v61-club="GER-2"]').click();await turn();
 const preview=v61FlowRoster(v61Catalog.find(c=>c.id==='GER-2'),v61Flow.seed);
 check('Eleven generated starting profiles',preview.length===11&&preview.every(p=>p.playerModel.parameterId==='native-player-v160-1'));
 document.querySelector('[data-v61-review]').click();await turn();
 check('English rule summary',document.querySelector('.v61-summary').textContent.includes(`${config.fieldPlayers} outfield players plus goalkeeper`));
 doppel6Language.set('de');await turn();check('German rule summary',document.querySelector('.v61-summary').textContent.includes(`${config.fieldPlayers} Feldspieler plus Torwart`));
 // Background T3 previews may not deliver paint frames. Only the test substitutes
 // scheduling in that case; the shipped UI and its creation controller are intact.
 let nativeFrame=false;const frameId=requestAnimationFrame(()=>nativeFrame=true);await turn();cancelAnimationFrame(frameId);
 const originalFrame=requestAnimationFrame;if(!nativeFrame)window.requestAnimationFrame=fn=>setTimeout(()=>fn(performance.now()),0);
 let career;
 try{document.querySelector('[data-v61-create="GER-2"]').click();for(let i=0;i<100&&!v61CurrentCareer;i++)await turn();career=v61CurrentCareer;check('Normal creation controller saves before opening',!!career&&v61Flow.starting===false&&!document.querySelector('[data-v61-start-error]'));}finally{window.requestAnimationFrame=originalFrame;}
 check('Created career retains preview abilities, positions and form',v66Own(career).roster.every(p=>{const q=preview.find(q=>q.pid===p.pid);return q&&q.name===p.name&&q.form===p.form&&q.fresh===p.fresh&&D6PlayerGeneration.SKILL_KEYS.every(k=>q[k]===p[k])&&JSON.stringify(q.playerModel.playablePositions)===JSON.stringify(p.playerModel.playablePositions);}));
 check('Regular model is active in the saved world',career.world.playerFoundation.parameterId==='native-player-v160-1'&&v154Active(career)&&v158Active(career));
 const exported=await v61ExportCareerData(career.id);await v61DeleteCareer(career.id);const imported=await v61ImportCareerData(JSON.parse(JSON.stringify(exported)));
 check('Real export/import keeps the complete world',v61ValidateCareer(imported)&&JSON.stringify(imported.world)===JSON.stringify(exported.save.world));
 window.D6NativeUICareerId=imported.id;
 return {checks,config:imported.world.matchConfig,id:imported.id,nativeAnimationFrames:nativeFrame,width:innerWidth,scrollWidth:document.documentElement.scrollWidth};
})()

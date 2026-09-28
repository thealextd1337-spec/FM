'use strict';

const v81KitSettingsKey='doppel6.world.allowKitColors';
function v81KitColorsAllowed(){try{return localStorage.getItem(v81KitSettingsKey)==='true'}catch{return false}}
function v81TransferWindow(career){const market=career?.world?.market;return !!career&&!career.world.activeMatch&&!career.world.seasonFinished&&market?.phase==='open'&&market.day>=1&&market.day<=5}
function v81KitView(kit){return{...kit,trim:kit.pattern||kit.trim}}
function v81Shirt(kit,label){return `<span class="v81-shirt">${v44ShirtSVG(null,v81KitView(kit),label)}<small>${escapeHTML(label)}</small></span>`}
function v81KitRowHTML(kits){return`<div class="v81-kit-row">${v81Shirt(kits.home,'Heim')}${v81Shirt(kits.away,'Auswärts')}${kits.keepers.map((kit,index)=>v81Shirt(kit,`Torwart ${index+1}`)).join('')}</div>`}
const v81BaseClubDetailHTML=v68ClubDetailHTML;
v68ClubDetailHTML=function(career,id){
 const html=v81BaseClubDetailHTML(career,id),club=career.world.clubs.find(item=>item.id===id);
 if(id===career.manager.managedClubId||!club?.kits)return html;
 return html.replace('</section>',`</section><section class="v62-season v81-kits"><h3>Vereinstrikots</h3>${v81KitRowHTML(club.kits)}</section>`);
};
function v81ClubKitsHTML(career){
 const club=career.world.clubs.find(item=>item.id===career.manager.managedClubId),kits=club?.kits;
 if(!kits)return'<section class="v62-season v81-kits"><h3>Vereinstrikots</h3><p>Für diese Vereinswelt liegen keine neuen Trikotdaten vor.</p></section>';
 const open=v81TransferWindow(career),colorsAllowed=v81KitColorsAllowed(),colorEditing=open&&colorsAllowed;
 const choices=(selected)=>v44Designs.map(([id,label])=>`<option value="${id}" ${id===selected?'selected':''}>${label}</option>`).join('');
 return `<section class="v62-season v81-kits" data-v81-kits><h3>Vereinstrikots</h3><p>Heim, Auswärts und zwei feste Torwarttrikots.</p>${v81KitRowHTML(kits)}<div class="v81-kit-controls"><h4>Trikotmuster</h4><div class="v81-fields"><label>Heimtrikot<select data-v81-pattern="home" ${open?'':'disabled'}>${choices(kits.home.style)}</select></label><label>Auswärtstrikot<select data-v81-pattern="away" ${open?'':'disabled'}>${choices(kits.away.style)}</select></label></div><button type="button" class="menu-action" data-v81-save-patterns ${open?'':'disabled'}>Muster speichern</button><p>${open?'Musterwechsel während der fünf Transfertage möglich.':'Musterwechsel nur während der fünf Transfertage möglich.'}</p></div><details class="v81-colors"><summary>Trikotfarben ändern</summary><p>${colorsAllowed?'Farben können während der fünf Transfertage geändert werden.':'Unter Hauptmenü → Optionen → Einstellungen zuerst erlauben.'} Drei unterschiedliche, abgestimmte Farben und klare Torwartkontraste sind erforderlich.</p><div class="v81-fields">${[['primary','Hauptfarbe'],['secondary','Zweitfarbe'],['tertiary','Drittfarbe']].map(([key,label])=>`<label>${label}<input type="color" data-v81-color="${key}" value="${kits.colors[key]}" ${colorEditing?'':'disabled'}></label>`).join('')}</div><div class="v81-kit-row v81-color-preview" data-v81-color-preview>${v81Shirt(kits.home,'Heim · Vorschau')}${v81Shirt(kits.away,'Auswärts · Vorschau')}</div><button type="button" class="menu-action" data-v81-save-colors ${colorEditing?'':'disabled'}>Farben speichern</button></details><p role="status" data-v81-message></p></section>`;
}
const v81BaseRenderCareer=v61RenderCareer;
v61RenderCareer=function(career){
 v81BaseRenderCareer(career);
 if(career.world.activeMatch)return;
 const clubView=v61WorldScreen.querySelector('[data-v46-view="club"]');
 if(clubView)clubView.insertAdjacentHTML('afterbegin',v81ClubKitsHTML(career));
};
async function v81SaveClubKits(career,next){
 if(!v81TransferWindow(career))throw Error('Trikotänderungen sind nur während der fünf Transfertage möglich.');
 const club=career.world.clubs.find(item=>item.id===career.manager.managedClubId);
 if(!club?.kits||!v61ValidClubKits(next))throw Error('Diese Trikotkombination ist nicht zulässig.');
 const previous=club.kits;club.kits=next;
 try{if(!v61ValidateCareer(career))throw Error('Die Trikotdaten sind ungültig.');await v64UiSave()}
 catch(error){club.kits=previous;throw error}
}
function v81ColorsFrom(section){return Object.fromEntries([...section.querySelectorAll('[data-v81-color]')].map(input=>[input.dataset.v81Color,input.value]))}
v61WorldScreen.addEventListener('input',event=>{
 const input=event.target.closest('[data-v81-color]'),section=input?.closest('[data-v81-kits]');
 if(!section||!v61CurrentCareer)return;
 const club=v61CurrentCareer.world.clubs.find(item=>item.id===v61CurrentCareer.manager.managedClubId),colors=v81ColorsFrom(section),styles={home:club.kits.home.style,away:club.kits.away.style};
 const preview=section.querySelector('[data-v81-color-preview]');
 preview.innerHTML=v81Shirt({main:colors.primary,pattern:colors.secondary,accent:colors.tertiary,style:styles.home},'Heim · Vorschau')+v81Shirt({main:colors.tertiary,pattern:colors.secondary,accent:colors.primary,style:styles.away},'Auswärts · Vorschau');
});
v61WorldScreen.addEventListener('click',async event=>{
 const button=event.target.closest('[data-v81-save-patterns],[data-v81-save-colors]');
 if(!button||!v61CurrentCareer)return;
 const section=button.closest('[data-v81-kits]'),career=v61CurrentCareer,club=career.world.clubs.find(item=>item.id===career.manager.managedClubId);
 button.disabled=true;
 try{
  let next;
  if(button.hasAttribute('data-v81-save-patterns')){
   next=structuredClone(club.kits);
   for(const key of ['home','away'])next[key].style=section.querySelector(`[data-v81-pattern="${key}"]`).value;
  }else{
   if(!v81KitColorsAllowed())throw Error('Farbänderungen sind in den Einstellungen ausgeschaltet.');
   const colors=v81ColorsFrom(section);
   if(!v61HarmoniousKitColors(colors))throw Error('Bitte drei unterschiedliche, abgestimmte Farben wählen.');
   next=v61BuildClubKits(club,colors,{home:club.kits.home.style,away:club.kits.away.style});
  }
  await v81SaveClubKits(career,next);
  v61RenderCareer(career);v61SetCareerTab('club',false);
  v61WorldScreen.querySelector('[data-v81-message]').textContent='Trikotänderung gespeichert.';
 }catch(error){section.querySelector('[data-v81-message]').textContent=error.message.startsWith('Kein klares Torwarttrikotpaar')?'Für diese Farben gibt es kein ausreichend klares Torwarttrikotpaar.':error.message;button.disabled=false}
});

const v81Options=document.createElement('details');
v81Options.className='v81-options';
v81Options.innerHTML='<summary>Optionen</summary><button type="button" class="menu-action" data-v81-open-settings>Einstellungen</button>';
v61Panel.after(v81Options);
const v81SettingsDialog=document.createElement('dialog');
v81SettingsDialog.className='v81-settings';
v81SettingsDialog.innerHTML='<div class="v81-settings-head"><h2>Einstellungen</h2><button type="button" data-v81-close-settings aria-label="Einstellungen schließen">×</button></div><label class="v81-toggle"><input type="checkbox" data-v81-allow-colors><span>Trikotfarben während der Transferphase ändern</span></label><p>Standardmäßig ausgeschaltet. Auch bei aktivierter Einstellung sind Farbänderungen nur an den fünf Transfertagen des eigenen Vereins möglich.</p><p role="status" data-v81-settings-message></p>';
document.body.append(v81SettingsDialog);
v81Options.querySelector('[data-v81-open-settings]').addEventListener('click',()=>{v81SettingsDialog.querySelector('[data-v81-allow-colors]').checked=v81KitColorsAllowed();v81SettingsDialog.showModal()});
v81SettingsDialog.querySelector('[data-v81-close-settings]').addEventListener('click',()=>v81SettingsDialog.close());
v81SettingsDialog.querySelector('[data-v81-allow-colors]').addEventListener('change',event=>{
 try{localStorage.setItem(v81KitSettingsKey,String(event.target.checked));v81SettingsDialog.querySelector('[data-v81-settings-message]').textContent=event.target.checked?'Farbänderungen erlaubt.':'Farbänderungen ausgeschaltet.'}
 catch{event.target.checked=false;v81SettingsDialog.querySelector('[data-v81-settings-message]').textContent='Einstellung konnte nicht gespeichert werden.'}
});
const v81Style=document.createElement('style');
v81Style.textContent='.v81-options{margin:12px 0;border:1px solid #45605b;border-radius:9px;background:#102126}.v81-options>summary{padding:15px;cursor:pointer;font-weight:800}.v81-options>button{margin:0 15px 15px}.v81-settings{width:min(430px,calc(100vw - 28px));padding:20px;border:1px solid #68827b;border-radius:12px;background:#162b30;color:#edf4eb}.v81-settings::backdrop{background:#061114c9}.v81-settings-head{display:flex;justify-content:space-between;align-items:center}.v81-settings-head h2{margin:0}.v81-settings-head button{border:0;background:transparent;color:inherit;font-size:28px;cursor:pointer}.v81-toggle{display:flex;gap:12px;align-items:center;margin:20px 0;font-weight:700}.v81-toggle input{width:22px;height:22px}.v81-settings p,.v81-kits p{color:#b7cac5}.v81-kit-row{display:flex;flex-wrap:wrap;gap:13px;margin:12px 0}.v81-shirt{display:grid;justify-items:center;gap:4px;min-width:65px;font-size:11px}.v81-shirt svg{width:53px;height:57px}.v81-fields{display:flex;flex-wrap:wrap;gap:12px;margin:10px 0}.v81-fields label{display:grid;gap:5px;min-width:112px;font-size:12px}.v81-fields select,.v81-fields input{min-height:38px;border-radius:6px;border:1px solid #6a827d;background:#1b3033;color:#edf4eb;padding:5px}.v81-fields input[type=color]{width:80px;padding:3px}.v81-kit-controls,.v81-colors{padding:12px 0;border-top:1px solid #46615e}.v81-colors summary{cursor:pointer;font-weight:700}.v81-color-preview{padding:8px;background:#2b6049;border-radius:8px}[data-v81-message]{min-height:1.2em}';
document.head.append(v81Style);

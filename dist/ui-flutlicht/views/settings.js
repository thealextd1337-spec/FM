/* U01-F owns preference controls; persistence and native dialogs stay in the adapter. */
(() => {
 'use strict';
 const ns=window.D6Flutlicht=window.D6Flutlicht||{},instances=new WeakMap();
 const copy={
  heading:'Hilfe & Einstellungen',intro:'Deine Darstellung, Sprache und lokalen Spielstände.',
  appearance:'Darstellung',appearanceHelp:'Standardmäßig folgt das Farbschema deinem Gerät. Ein Wechsel erhält deine geöffneten Ansichten und Eingaben.',
  scheme:'Farbschema',system:'Geräteeinstellung',light:'Hell',dark:'Dunkel',
  language:'Sprache',languageHelp:'Wähle die Sprache für Menüs, Beschriftungen und Hilfe.',
  careers:'Karrieren & Spielstände',careersHelp:'Speichere die aktuelle Karriere und öffne die Startseite. Dort kannst du Karrieren fortsetzen, exportieren, importieren oder verwalten.',
  manage:'Speichern & Karriereverwaltung',backup:'Sichere wichtige Spielstände regelmäßig als Exportdatei. Browserdaten bleiben auf diesem Gerät.',
  help:'Hilfe',helpText:'Öffne Spielerprofile für Vertragsdaten, Leistungen und Karriere. Fähigkeiten erscheinen als Farbstufen; Form und Frische werden getrennt angezeigt.',
  help3d:'3D-Hilfe öffnen',help3dText:'Die vollständige Hilfe erklärt Kameras, Vollbild, Rückschau und Spielbedienung.',
  legal:'Rechtliches & Speicher',legalText:'Hier findest du die rechtlichen Hinweise und die bestehende Auswahl zur freiwilligen Übertragung von Spielstatistiken.',
  imprint:'Impressum',privacy:'Datenschutz',storage:'Cookies & Speicher',failure:'Die Aktion konnte nicht abgeschlossen werden. Bitte versuche es erneut.'
 };
 function enhance(root,projection={},actions={}) {
  if(!root.classList?.contains('fl-content'))return;
  let view=root.querySelector(':scope > [data-v46-view="settings"]');
  if(!view){
   view=root.ownerDocument.createElement('section');view.dataset.v46View='settings';view.className='fl-settings';view.hidden=projection.frame?.activeRoute!=='settings';
   view.innerHTML=`<div class="fl-settings-heading"><h1 data-fl-settings-text="heading"></h1><p data-fl-settings-text="intro"></p></div>
    <section class="fl-settings-section" aria-labelledby="fl-settings-appearance"><div><h2 id="fl-settings-appearance" data-fl-settings-text="appearance"></h2><p data-fl-settings-text="appearanceHelp" id="fl-settings-theme-help"></p></div><div class="fl-settings-control"><label for="fl-settings-theme" data-fl-settings-text="scheme"></label><select id="fl-settings-theme" data-fl-theme-preference-control aria-describedby="fl-settings-theme-help"><option value="system" data-fl-settings-text="system"></option><option value="light" data-fl-settings-text="light"></option><option value="dark" data-fl-settings-text="dark"></option></select></div></section>
    <section class="fl-settings-section" aria-labelledby="fl-settings-language-heading"><div><h2 id="fl-settings-language-heading" data-fl-settings-text="language"></h2><p data-fl-settings-text="languageHelp"></p></div><div class="fl-settings-control"><label for="fl-settings-language" data-fl-settings-text="language"></label><select id="fl-settings-language" data-fl-settings-language><option value="de" lang="de">Deutsch</option><option value="en" lang="en">English</option></select></div></section>
    <section class="fl-settings-section" aria-labelledby="fl-settings-careers"><div><h2 id="fl-settings-careers" data-fl-settings-text="careers"></h2><p data-fl-settings-text="careersHelp"></p><p class="fl-settings-fine" data-fl-settings-text="backup"></p></div><div class="fl-settings-actions"><button type="button" class="fl-button" data-fl-settings-action="manage" data-fl-settings-text="manage"></button></div></section>
    <section class="fl-settings-section" aria-labelledby="fl-settings-help"><div><h2 id="fl-settings-help" data-fl-settings-text="help"></h2><p data-fl-settings-text="helpText"></p><p data-fl-settings-text="help3dText"></p></div><div class="fl-settings-actions"><button type="button" class="fl-button" data-fl-settings-action="help" data-fl-settings-text="help3d"></button></div></section>
    <section class="fl-settings-section" aria-labelledby="fl-settings-legal"><div><h2 id="fl-settings-legal" data-fl-settings-text="legal"></h2><p data-fl-settings-text="legalText"></p></div><div class="fl-settings-actions fl-settings-legal"><button type="button" class="fl-button" data-fl-settings-legal="impressum" data-fl-settings-text="imprint"></button><button type="button" class="fl-button" data-fl-settings-legal="datenschutz" data-fl-settings-text="privacy"></button><button type="button" class="fl-button" data-fl-settings-legal="speicher" data-fl-settings-text="storage"></button></div></section>
    <p class="fl-settings-error" role="alert" hidden></p>`;
   root.append(view);
  }
  const t=actions.t||((text)=>text),settings=projection.settings||{};
  for(const node of view.querySelectorAll('[data-fl-settings-text]')){const text=t(copy[node.dataset.flSettingsText]);if(node.textContent!==text)node.textContent=text;}
  const theme=view.querySelector('[data-fl-theme-preference-control]'),language=view.querySelector('[data-fl-settings-language]');
  const themeValue=['light','dark'].includes(settings.themePreference)?settings.themePreference:'system';
  if(theme.value!==themeValue)theme.value=themeValue;
  const languageValue=settings.language==='en'?'en':'de';if(language.value!==languageValue)language.value=languageValue;
  let state=instances.get(view);
  if(!state){
   state={actions,pending:false};
   const error=view.querySelector('.fl-settings-error');
   const run=async(button,action)=>{
    if(state.pending||typeof action!=='function')return;
    state.pending=true;if(button)button.disabled=true;error.hidden=true;error.textContent='';view.setAttribute('aria-busy','true');
    try{await action();}catch(problem){error.textContent=problem?.message||((state.actions.t||((text)=>text))(copy.failure));error.hidden=false;}
    finally{state.pending=false;if(button)button.disabled=false;view.removeAttribute('aria-busy');}
   };
   state.click=event=>{
    const button=event.target.closest('[data-fl-settings-action],[data-fl-settings-legal]');if(!button||!view.contains(button))return;
    const action=button.dataset.flSettingsAction;
    if(action==='manage')run(button,state.actions.manageCareers);
    else if(action==='help')run(button,state.actions.openHelp);
    else if(button.dataset.flSettingsLegal)run(button,()=>state.actions.openLegal?.(button.dataset.flSettingsLegal));
   };
   state.change=event=>{if(event.target===language)run(language,()=>state.actions.setLanguage?.(language.value));};
   view.addEventListener('click',state.click);view.addEventListener('change',state.change);instances.set(view,state);
  }
  state.actions=actions;
  return ()=>{const current=instances.get(view);if(current){view.removeEventListener('click',current.click);view.removeEventListener('change',current.change);instances.delete(view);}};
 }
 ns.registry.register({id:'settings',enhance});
})();

// Isolated T3 source/build QA. Inject unity-integration-v160.js first.
window.D6QA114UI=(()=>{
 const checks=[],details={},wait=ms=>new Promise(r=>setTimeout(r,ms));
 const check=(name,ok)=>{if(!ok)throw Error(name);checks.push(name)};
 const css=(n,key)=>getComputedStyle(n)[key],ns=D6Flutlicht;
 async function start(){
  await v61ShowStart();await wait(120);doppel6Language.set('de');
  document.querySelector('[data-v81-open-settings]').click();await wait(100);
  const picker=document.querySelector('#fl-start-theme'),dialog=picker.closest('dialog');
  for(const theme of ['light','dark']){
   picker.value=theme;picker.dispatchEvent(new Event('change',{bubbles:true}));await wait(100);
   check('Options apply '+theme+' to start and dialog',document.body.dataset.flStartTheme===theme&&dialog.dataset.flTheme===theme);
   check('Options persist '+theme,localStorage.getItem('doppel6.ui.flutlicht.theme')===theme);
   check('Options use '+theme+' paper',css(dialog,'backgroundColor')===(theme==='dark'?'rgb(17, 21, 26)':'rgb(241, 243, 245)'));
  }
  doppel6Language.set('en');await wait(100);
  check('English theme labels',picker.textContent.includes('Light')&&picker.textContent.includes('Dark'));
  doppel6Language.set('de');dialog.querySelector('[data-v81-close-settings]').click();
  check('Boot screen removed after final design',!document.querySelector('#fl-boot')&&!document.documentElement.dataset.flBootTheme);
  v61Begin();document.querySelector('#v61-manager-name').value='Feedback QA';document.querySelector('[data-v61-manager-next]').click();
  document.querySelector('[data-v61-country="GER"]').click();document.querySelector('[data-v61-club="GER-2"]').click();await wait(100);
  const nav=document.querySelector('[aria-label="Spielstart"]');
  check('Only previous creation steps are links',JSON.stringify([...nav.querySelectorAll('button')].map(b=>b.dataset.v61Back))===JSON.stringify(['manager','country','clubs']));
  check('Current/future steps do not navigate',!nav.querySelector('[data-v61-back="summary"],[data-v61-back="club"]'));
  nav.querySelector('[data-v61-back="country"]').click();
  check('Backward navigation preserves manager',v61Flow.step==='country'&&v61Flow.managerName==='Feedback QA');
  return report();
 }
 async function prepare(){
  await D6QA160.setup({unity:false,replays:false,config:{fieldSize:'large',fieldPlayers:5}});
  await v61StoreNewCareer(D6QA160.career);await v64UiSave();
  return {id:D6QA160.career.id,ready:true};
 }
 async function finish(){
  details.fullscreen={native:Boolean(document.fullscreenElement),viewport:document.body.classList.contains('v132-fullscreen')};
  await D6QA160.run({finished:true});await wait(180);
  check('Actual final whistle opens report',D6QA160.state.phase==='finished'&&v47Dialog.open);
  for(const theme of ['light','dark']){
   ns.theme.set(theme);await wait(100);
   check('Postmatch report adopts '+theme,v47Dialog.dataset.flTheme===theme&&css(v47Dialog,'backgroundColor')===(theme==='dark'?'rgb(17, 21, 26)':'rgb(241, 243, 245)'));
  }
  v47Dialog.querySelector('.v47-menu').click();await wait(150);
  check('All results use native fixture rows',v47CompetitionDialog.open&&v47CompetitionDialog.querySelectorAll('.v62-fixture').length>0);
  const fixture=v47CompetitionDialog.querySelector('.v62-fixture'),link=fixture.querySelector('.v68-club-link');
  check('All results shed the old green surface',css(fixture,'backgroundColor')==='rgba(0, 0, 0, 0)'&&css(link,'color')==='rgb(237, 240, 243)');
  check('Result club links retain native actions and touch size',!!link.dataset.v68Club&&link.getBoundingClientRect().height>=44);
  check('Result dialog has no horizontal overflow',v47CompetitionDialog.scrollWidth<=v47CompetitionDialog.clientWidth+1);
  v47CompetitionDialog.querySelector('.v47-competition-done').click();await wait(300);
  return report();
 }
 async function clubAndBusy(){
  v61SetCareerTab('club');await wait(150);
  const lineup=document.querySelector('.fl-club-last-lineup');
  check('Recorded lineup has all six real starter links',lineup.querySelectorAll('[data-v68-player]').length===6);
  check('Recorded lineup shows numbers and position labels',lineup.querySelectorAll('.fl-club-lineup-number').length===6&&lineup.querySelectorAll('.fl-club-lineup-person small').length===6);
  check('Recorded lineup fits viewport',lineup.getBoundingClientRect().right<=innerWidth+1&&lineup.scrollWidth<=lineup.clientWidth+1);
  const player=lineup.querySelector('[data-v68-player]');player.click();await wait(100);
  check('Recorded starter still opens native profile',v61ProfileDialog.open);v61ProfileDialog.close();
  v61SetCareerTab('matchplan');await wait(180);
  const select=document.querySelector('[data-d6-role]'),row=select.closest('.d6-role-select-row'),swatch=row.querySelector('.d6-role-suitability'),r=select.getBoundingClientRect(),s=swatch?.getBoundingClientRect();
  check('Role options show role names without color suffix',![...select.options].some(o=>/ · /.test(o.textContent)));
  check('Role tooltip uses qualitative rating',/^(Sehr schwach|Schwach|Normal|Gut|Sehr gut)$/.test(select.title));
  check('Role color swatch is inside dropdown',!!s&&s.left>=r.left&&s.right<=r.right&&s.top>=r.top&&s.bottom<=r.bottom);
  v61SetCareerTab('overview');await wait(100);
  // Use the native busy controller with a bounded pending operation. Its own
  // indicator and completion drive both buttons; no duplicate busy state.
  let release;const work=new Promise(r=>release=r);v67RunBusy('Weltkalender wird verarbeitet …',()=>work);await wait(120);
  const button=document.querySelector('[data-fl-lead]'),native=document.querySelector('#career-progress-action');
  check('Calendar message is small and centered in both buttons',button.textContent.includes('Weltkalender')&&css(button.querySelector('.fl-lead-label'),'fontSize')==='11px'&&css(button,'justifyContent')==='center'&&native.textContent.includes('Weltkalender')&&css(native,'fontSize')==='11px');
  check('Calendar processing prevents a second action',button.disabled&&native.disabled&&button.getAttribute('aria-busy')==='true'&&native.getAttribute('aria-busy')==='true');
  v61WorldScreen.querySelector('.v67-loading-inline>span').textContent='Weltkalender: 2 Spieltage verarbeitet …';await wait(120);
  check('Calendar progress updates inside button',document.querySelector('[data-fl-lead]').textContent.includes('2 Spieltage'));
  release();await wait(160);
  check('Calendar completion restores both actions',!v67Busy&&!document.querySelector('[data-fl-lead]').disabled&&!native.disabled&&native.getAttribute('aria-busy')==='false');
  return report();
 }
 function report(){return {pass:true,checks:[...checks],details,width:innerWidth};}
 return {start,prepare,finish,clubAndBusy,report};
})();
'D6QA114UI ready';

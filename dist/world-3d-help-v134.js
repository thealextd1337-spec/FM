'use strict';
// Reuse the live-information dialog: existing match/animation/audio pause guards
// apply equally to this help, without changing career or match data.
(()=>{
 // Freeze before any simulation wrapper updates timers or contact metadata.
 const previousStep=step;
 step=function(...args){if(v47PlayerDialog.open&&v47PlayerDialog.classList.contains('v134-3d-help'))return;return previousStep(...args)};
 let resumeLive=false;
 const text=(de,en)=>window.doppel6Language?.get()==='en'?en:de;
 const style=document.createElement('style');style.textContent=`.v134-3d-help{width:min(900px,calc(100vw - 24px));max-height:calc(100dvh - 24px);padding:0;overflow:auto}.v134-3d-help>.v64-match-menu{display:none}.v134-help-head{position:sticky;top:0;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 20px;background:#142b30;border-bottom:1px solid #45605b}.v134-help-head h2{margin:0;font-size:24px}.v134-help-head button{min-height:44px;min-width:44px}.v134-help-body{padding:0 20px 20px;font:14px/1.6 Arial,sans-serif;overflow-wrap:anywhere}.v134-help-body h3{font-size:19px;color:#c7f36b}.v134-help-body h4{font-size:17px;margin-bottom:8px}.v134-help-body li{margin:9px 0}.v134-help-body details{border-top:1px solid #45605b;margin-top:20px;padding-top:14px}.v134-help-body summary{cursor:pointer;min-height:44px;font-weight:700}.v134-help-body .help{color:#bdd0cc}.v134-footer-help{border:0;background:transparent;color:inherit;font:inherit;text-decoration:underline;cursor:pointer;min-height:44px;padding:6px}.v134-help-body a{color:#c7f36b}@media(max-width:600px){.v134-help-head{padding:12px}.v134-help-head h2{font-size:21px}.v134-help-body{padding:0 14px 14px}}`;document.head.append(style);
 function open(){
  if(v47PlayerDialog.open)return;
  const lang=window.doppel6Language?.get()==='en'?'en':'de',docs=window.D6ThreeDocumentation;
  const points=lang==='en'?[
   'Use landscape for 3D TV. The pitch menu offers 2D, a close TV camera and a wide overview. Portrait and unsupported WebGL use 2D.',
   'The magnifier enlarges the image within the page. The separate fullscreen button fills the screen.',
   'Controls appear when you hover over the pitch, briefly after tapping, or when using the keyboard. The TV clock and score stay visible.',
   'Drag the review slider to recorded scenes. Play and pause affect the review while the match remains paused. Live returns to the current match and continues it.',
   'Goal, corner, free-kick, offside and penalty markers start approximately three seconds before the event.',
   'Review contains the recorded 3D sections of this session. Reloading or leaving loses the recording; missing 2D sections are not reconstructed.'
  ]:[
   'Im Querformat steht 3D-TV zur Verfügung. Das Spielfeldmenü bietet 2D, eine nahe TV-Kamera und die weite Übersicht. Hochformat und fehlendes WebGL verwenden 2D.',
   'Die Lupe vergrößert das Bild innerhalb der Seite. Der separate Vollbildknopf füllt den Bildschirm.',
   'Bedienelemente erscheinen bei Mouse-over, kurz nach Antippen oder mit Tastaturfokus. TV-Uhr und Spielstand bleiben sichtbar.',
   'Ziehe den Rückschau-Slider zu aufgenommenen Szenen. Abspielen und Pause steuern die Rückschau bei pausierter Partie. Live kehrt zum aktuellen Spiel zurück und setzt es fort.',
   'Marker für Tore, Ecken, Freistöße, Abseits und Elfmeter beginnen ungefähr drei Sekunden vor dem Ereignis.',
   'Die Rückschau enthält die aufgezeichneten 3D-Abschnitte dieser Sitzung. Neuladen oder Verlassen verliert die Aufnahme; fehlende 2D-Abschnitte werden nicht rekonstruiert.'
  ];
  v47PlayerDialog.classList.add('v134-3d-help');v47PlayerDialog.innerHTML=`<div class="v134-help-head"><h2 id="v47-player-title">${text('3D-Hilfe','3D help')}</h2><button type="button" class="menu-action v47-player-close">${text('Schließen','Close')}</button></div><div class="v134-help-body"><p class="help">${text('Während dieser Hilfe stehen die Partie und ihre Animationen still. Nach dem Schließen gilt der bisherige Spielmodus.','The match and its animations stop while this help is open. Closing returns to the previous mode.')}</p><ul>${points.map(p=>'<li>'+p+'</li>').join('')}</ul><details><summary>${text('Technische Systemdokumentation','Technical system documentation')} · ${docs.version}</summary><article lang="${lang}" data-v134-doc-sha="${docs[lang].sha256}">${docs[lang].html}</article></details></div>`;
  v47PlayerDialog.querySelector('.v47-player-close').onclick=()=>v47PlayerDialog.close();
  const menu=typeof v64MatchMenu!=='undefined'?v64MatchMenu:null;if(menu)menu.open=false;
  if(typeof v132StopReview==='function'){v132StopReview();v131ReviewUI();}
  resumeLive=typeof v98IsWorld==='function'&&v98IsWorld()&&running&&contextPhaseLive();
  if(resumeLive)clearInterval(v65WorldFrame);
  v47PlayerDialog.showModal();v47PlayerDialog.scrollTop=0;if(typeof v102StopPaint==='function')v102StopPaint();if(typeof v98SyncAudio==='function')v98SyncAudio();
 }
 v47PlayerDialog.addEventListener('close',()=>{if(!v47PlayerDialog.classList.contains('v134-3d-help'))return;v47PlayerDialog.classList.remove('v134-3d-help');if(resumeLive&&running&&contextPhaseLive())v65StartLoop();resumeLive=false;if(typeof v98IsWorld==='function'&&v98IsWorld())draw();});
 const footer=document.querySelector('footer'),button=document.createElement('button');button.type='button';button.className='v134-footer-help';button.dataset.v134Help='';button.textContent='3D-Hilfe';button.addEventListener('click',open);footer.append(button);
 const panel=typeof v64MatchMenu!=='undefined'&&v64MatchMenu.querySelector('.v64-match-menu-panel');if(panel){const menuButton=document.createElement('button');menuButton.type='button';menuButton.className='menu-action';menuButton.dataset.v134Help='';menuButton.textContent='3D-Hilfe';menuButton.addEventListener('click',open);panel.append(menuButton);}
 window.D6ThreeHelp={open};
 if(new URLSearchParams(location.search).get('help')==='3d')open();
})();

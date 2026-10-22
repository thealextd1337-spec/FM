/* Optional guided introduction for new club worlds. Progress lives only in localStorage and never enters a save. */
(()=>{
 'use strict';
 const KEY='doppel6.tutorial',doc=document;
 const en=()=>window.doppel6Language?.get()==='en';
 const T=(de,english)=>en()?english:de;
 // Quotes the button names the player actually sees in the active language.
 const L=label=>en()&&window.doppel6Language?.translate?window.doppel6Language.translate(label):label;
 const q=(selector,root=doc)=>root.querySelector(selector);
 const shown=node=>!!node&&node.isConnected&&node.getClientRects().length>0;
 const firstShown=selector=>[...doc.querySelectorAll(selector)].find(shown)||null;
 const esc=text=>String(text).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

 let state=null;
 function load(){try{const value=JSON.parse(localStorage.getItem(KEY)||'null');state=value&&typeof value==='object'&&typeof value.careerId==='string'?value:null;}catch{state=null;}}
 function save(){try{state?localStorage.setItem(KEY,JSON.stringify(state)):localStorage.removeItem(KEY);}catch{}}
 load();

 const career=()=>typeof v61CurrentCareer==='object'?v61CurrentCareer:null;
 const lead=()=>{try{return career()?v58State():null;}catch{return null;}};
 const match=()=>career()?.world?.activeMatch||null;
 const market=()=>career()?.world?.market||{};
 const inCareer=()=>doc.body.classList.contains('fl-active')&&!match();
 const reportOpen=()=>!!q('#v47-match-report[open]')||/^(Spielbericht|Ergebnisse des Wettbewerbs)$/.test(lead()?.context||'');
 const leadButton=()=>firstShown('[data-fl-lead]')||firstShown('#career-progress-action');
 const active=()=>!!state&&state.enabled&&career()?.id===state.careerId;
 function ownName(){try{return v66Own(career()).name;}catch{return '';}}
 function renewable(){
  const c=career();if(!c||c.world.seasonFinished||c.world.market?.phase==='sponsor'||match())return null;
  try{for(const player of v66Own(c).roster){const contract=v66Contract(c,player.pid);if(contract&&contract.endSeason===c.world.season&&v66RenewalWindow(c,contract).canOffer&&!(typeof v176Retiring==='function'&&v176Retiring(c,player.pid)))return player;}}catch{}
  return null;
 }
 function route(id,section){
  q(`.fl-sidebar [data-fl-route="${id}"]`)?.click();
  if(section)requestAnimationFrame(()=>window.D6Flutlicht?.navigation?.select(id,section));
 }

 // Events for actions the player performs; polled phase changes cover everything else.
 const counts=new Map();
 function emit(name){counts.set(name,(counts.get(name)||0)+1);tick();}
 function hook(fn,name,accept){
  const base=window[fn];if(typeof base!=='function')return;
  window[fn]=function(...args){const result=base.apply(this,args),done=()=>{if(!accept||accept(args))emit(name);};if(result&&typeof result.then==='function')result.then(done,()=>{});else done();return result;};
 }
 hook('v72Start','bid');
 hook('v66MakeBid','bid',args=>args[1]===career()?.manager?.managedClubId);
 hook('v72ListOwn','list');
 hook('v66RunMarketDay','day');
 hook('v64CareerCommit','lineup');
 hook('v66Renew','renew');

 const ctx={baseline:new Map()};
 const fired=name=>(counts.get(name)||0)>(ctx.baseline.get(name)||0);

 const chapters=[
  {id:'welcome',title:['Willkommen','Welcome'],start:()=>inCareer(),active:()=>inCareer(),steps:[
   {title:()=>T(`Willkommen beim ${ownName()}!`,`Welcome to ${ownName()}!`),text:()=>T('Diese Einführung begleitet dich durch deine erste Transferphase und dein erstes Spiel. Du kannst jeden Schritt überspringen.','This introduction guides you through your first transfer window and your first match. You can skip any step.')},
   {title:()=>T('Der nächste Schritt','The next step'),text:()=>T('Dieser Knopf zeigt immer, was als Nächstes ansteht. Wenn du nicht weiterweißt, schau hierher.','This button always shows what comes next. Whenever you are unsure, look here.'),target:()=>leadButton()},
   {title:()=>T('Deine Bereiche','Your sections'),text:()=>T(`Hier erreichst du ${L('Übersicht')}, ${L('Kader')}, ${L('Matchplan')}, ${L('Transfers')}, ${L('Wettbewerbe')}, ${L('Kalender')}, ${L('Statistik')} und ${L('Verein')}. Auf dem Handy liegen Übersicht, Kader und Transfers unten, alles Weitere unter „${L('Menü')}“.`,`From here you reach ${L('Übersicht')}, ${L('Kader')}, ${L('Matchplan')}, ${L('Transfers')}, ${L('Wettbewerbe')}, ${L('Kalender')}, ${L('Statistik')} and ${L('Verein')}. On a phone, the first three sit at the bottom and everything else is under “${L('Menü')}”.`),target:()=>firstShown('.fl-sidebar .fl-main-nav')||firstShown('.fl-mobile-nav')},
   {title:()=>T('Das Vereinsbüro','The club office'),text:()=>T('Auf der Übersicht sammelt das Vereinsbüro, was gerade zu tun ist: eingegangene Angebote, auslaufende Verträge und Nachwuchs. Ein Tipp auf eine Aufgabe führt direkt an die passende Stelle.','On the overview, the club office collects what needs your attention: incoming offers, expiring contracts and youth players. Tap a task to go straight to it.'),target:()=>firstShown('.fl-overview-office'),go:()=>route('overview')},
   {title:()=>T('Die News','The news'),text:()=>T('Weiter unten erscheinen die Meldungen deiner Vereinswelt: Meilensteine deines Vereins, Erfolge in den Cups und Trainerwechsel bei anderen Vereinen. Neue Meldungen sind als ungelesen markiert; über die Links öffnest du Verein, Spieler oder Partie. Zu Beginn ist der Bereich noch leer.','Further down you find the news of your club world: your club’s milestones, cup successes and coach changes at other clubs. New items are marked as unread; the links open the club, the player or the match. At the start this section is still empty.'),target:()=>firstShown('#v170-office'),go:()=>route('overview')},
   {title:()=>T('Dein Sponsor','Your sponsor'),text:()=>T('Wähle zuerst einen Sponsor. Jedes Angebot zeigt ein festes Fixum, Bonusziele mit Beträgen und die Auszahlungstermine. Höhere Ziele bringen mehr Geld, sind aber schwerer zu schaffen.','First choose a sponsor. Each offer shows a fixed base amount, bonus targets with amounts and the payment dates. Higher targets pay more but are harder to reach.'),skip:()=>market().phase!=='sponsor',target:()=>firstShown('#v66-sponsor'),go:()=>route('overview'),until:()=>market().phase!=='sponsor'}
  ]},
  {id:'youth',title:['Jugendförderung','Youth funding'],start:()=>inCareer()&&lead()?.action==='v124-budget',active:()=>lead()?.action==='v124-budget',steps:[
   {title:()=>T('Jugendförderung','Youth funding'),text:()=>T(`Lege fest, wie viel du in deinen Nachwuchs investierst, und bestätige mit „${L('Jugendförderung bezahlen und Transfers öffnen')}“. Danach beginnt die Transferphase.`,`Decide how much you invest in your youth players and confirm with “${L('Jugendförderung bezahlen und Transfers öffnen')}”. The transfer window starts afterwards.`),target:()=>firstShown('[data-v124-budget]')||firstShown('#v124-budget'),go:()=>route('overview')}
  ]},
  {id:'transfer',title:['Transferphase','Transfer window'],start:()=>inCareer()&&lead()?.action==='v66-day'&&market().phase==='open'&&market().day<5,active:()=>market().phase==='open',jumps:[{to:9,test:()=>fired('day')}],steps:[
   {title:()=>T('Fünf Transfertage','Five transfer days'),text:()=>T('Die Transferphase dauert fünf Tage. An jedem Tag gibst du Angebote ab; Vereine und Spieler antworten am nächsten Transfertag.','The transfer window lasts five days. Each day you make offers; clubs and players answer on the next transfer day.'),target:()=>firstShown('.fl-lead-progress')||leadButton()},
   {title:()=>T('Spielersuche','Player search'),text:()=>T(`Unter ${L('Transfers')} → ${L('Spielersuche')} stehen alle Spieler, die du verpflichten kannst. Filtere nach Position und Ablöse; „${L('Nur ablösefreie')}“ zeigt vereinslose Spieler, für die keine Ablöse fällig ist. Weitere Filter wie Land oder Verein klappst du auf.`,`${L('Transfers')} → ${L('Spielersuche')} lists every player you can sign. Filter by position and fee; “${L('Nur ablösefreie')}” shows players without a club, so no transfer fee is due. Open further filters such as country or club.`),target:()=>firstShown('[data-fl-section-tab="search"]'),go:()=>route('transfers','search')},
   {title:()=>T('Spieler ansehen','View a player'),text:()=>T('Ein Tipp auf den Namen öffnet das Spielerprofil. Fähigkeiten siehst du als Farbstufen; die Legende im Profil erklärt jede Stufe.','Tap a name to open the player profile. Abilities appear as colour levels; the legend in the profile explains each level.'),target:()=>firstShown('.v66-player-card [data-v66-profile]'),go:()=>route('transfers','search')},
   {title:()=>T('Spieler kaufen: das Gebot','Buying a player: the bid'),text:()=>T(`Tippe auf „${L('Angebot planen')}“. Bei einem Spieler mit Verein legst du zuerst die Ablöse fest und tippst auf „${L('Gebot abgeben')}“. Einem ablösefreien Spieler schickst du direkt ein Vertragsangebot. Du kannst diesen Schritt auch nur lesen und weitergehen.`,`Tap “${L('Angebot planen')}”. For a player with a club you first set the transfer fee and tap “${L('Gebot abgeben')}”. A free agent gets a contract offer straight away. You can also just read this step and continue.`),target:()=>q('dialog[open] [data-v72-start],dialog[open] [data-v72-free-offer]')||firstShown('.v66-player-pick'),go:()=>route('transfers','search'),until:()=>fired('bid')},
   {title:()=>T('Spieler kaufen: der Vertrag','Buying a player: the contract'),text:()=>T(`Stimmt der Verein der Ablöse zu, verhandelst du mit dem Spieler Gehalt, Laufzeit und Einsatz-Zusage und sendest das Vertragsangebot. Gegenangebote beantwortest du im Ergebnisfenster oder unter ${L('Transfers')} → ${L('Angebote & Verhandlungen')}.`,`Once the club accepts the fee, you negotiate wage, contract length and a playing-time promise with the player and send the contract offer. Answer counter-offers in the results window or under ${L('Transfers')} → ${L('Angebote & Verhandlungen')}.`)},
   {title:()=>T('Spieler verkaufen','Selling a player'),text:()=>T(`Öffne unter ${L('Kader')} das Profil eines eigenen Spielers. Lege eine verhandelbare Ablöse fest und tippe auf „${L('Zum Verkauf anbieten')}“. Interessierte Vereine melden sich an den nächsten Transfertagen.`,`Under ${L('Kader')}, open one of your players’ profiles. Set a negotiable fee and tap “${L('Zum Verkauf anbieten')}”. Interested clubs respond on the following transfer days.`),target:()=>q('dialog[open] [data-v72-list-own]')||firstShown('[data-v46-view="squad"] [data-v61-player]'),go:()=>route('squad','roster'),until:()=>fired('list')},
   {title:()=>T('Deine Transferliste','Your transfer list'),text:()=>T(`Unter ${L('Transfers')} → ${L('Eigene Transferliste')} stehen deine angebotenen Spieler. Dort senkst du den Preis, ziehst ein Angebot zurück oder nimmst Kaufangebote an, lehnst sie ab oder stellst eine Gegenforderung. Angebote für Spieler, die du nicht angeboten hast, findest du unter „${L('Angebote & Verhandlungen')}“.`,`${L('Transfers')} → ${L('Eigene Transferliste')} shows the players you offered. There you lower the price, withdraw a player or accept, reject or counter purchase offers. Offers for players you did not list appear under “${L('Angebote & Verhandlungen')}”.`),target:()=>firstShown('[data-fl-section-tab="own"]'),go:()=>route('transfers','own')},
   {title:()=>T('Verträge','Contracts'),text:()=>T(`Unter ${L('Kader')} → ${L('Verträge')} siehst du, wessen Vertrag ausläuft. Spieler im letzten Vertragsjahr verlängerst du dort; wie das geht, zeigt dir die Einführung gleich im Anschluss.`,`${L('Kader')} → ${L('Verträge')} shows whose contract is running out. Players in their final contract year are extended there; the introduction shows you how right afterwards.`),target:()=>firstShown('[data-fl-section-tab="contracts"]'),go:()=>route('squad','contracts')},
   {title:()=>T('Nächster Transfertag','Next transfer day'),text:()=>T(`Wenn du für heute fertig bist, tippe auf „${L('Nächster Transfertag')}“. Antworten auf deine Angebote erscheinen danach in einem Fenster: angenommene Gebote, Gegenangebote und abgeschlossene Transfers.`,`When you are done for today, tap “${L('Nächster Transfertag')}”. Answers to your offers then appear in a window: accepted bids, counter-offers and completed transfers.`),target:()=>leadButton(),until:()=>fired('day')},
   {title:()=>T('Antworten','Answers'),text:()=>T(`Im Antwortfenster entscheidest du, wie es weitergeht; mit „${L('Später')}“ verschiebst du die Antwort. Offene Verhandlungen bleiben unter „${L('Angebote & Verhandlungen')}“. Das Kapitel endet hier, die übrigen Transfertage gehören dir.`,`In the answers window you decide how to continue; “${L('Später')}” postpones your answer. Open negotiations stay under “${L('Angebote & Verhandlungen')}”. This chapter ends here; the remaining transfer days are yours.`)}
  ]},
  {id:'deadline',title:['Transferschluss','Transfer deadline'],start:()=>inCareer()&&lead()?.action==='v66-day'&&lead()?.label==='Transferschluss bestätigen',active:()=>lead()?.label==='Transferschluss bestätigen',steps:[
   {title:()=>T('Transferschluss','Transfer deadline'),text:()=>T(`Mit „${L('Transferschluss bestätigen')}“ endet die Transferphase; laufende Verhandlungen werden danach noch abgeschlossen. Gehälter zahlst du nicht jetzt, sondern am Saisonende nach der Platzierungsprämie.`,`“${L('Transferschluss bestätigen')}” ends the window; ongoing negotiations are settled afterwards. Wages are not paid now but at the end of the season, after the placement bonus.`),target:()=>leadButton()}
  ]},
  {id:'lineup',title:['Aufstellung und Taktik','Line-up and tactics'],start:()=>inCareer()&&lead()?.label==='Nächstes Spiel vorbereiten',active:()=>!match()&&lead()?.label==='Nächstes Spiel vorbereiten',steps:[
   {title:()=>T(L('Matchplan'),L('Matchplan')),text:()=>T(`Unter ${L('Matchplan')} stellst du deine Startelf auf: einen Torwart und fünf Feldspieler. Der Rest sitzt auf der Ersatzbank.`,`Under ${L('Matchplan')} you pick your starting team: one goalkeeper and five outfield players. Everyone else sits on the bench.`),target:()=>firstShown('.fl-sidebar [data-fl-route="matchplan"]')||firstShown('[data-v46-view="matchplan"] [data-v64-career-slot]'),go:()=>route('matchplan')},
   {title:()=>T('Spieler aufstellen','Placing players'),text:()=>T('Ziehe einen Spieler von der Ersatzbank auf das Spielfeld oder verschiebe Spieler auf dem Feld. Ein einfacher Tipp markiert nur. Auf dem Handy wischst du einen Bankspieler seitlich heraus und ziehst ihn aufs Feld.','Drag a player from the bench onto the pitch or move players around the pitch. A single tap only selects. On a phone, swipe a bench player sideways and drag him onto the pitch.'),target:()=>firstShown('[data-v64-career-slot]'),go:()=>route('matchplan'),until:()=>fired('lineup')},
   {title:()=>T('Positionen','Positions'),text:()=>T(`Die Zone auf dem Feld bestimmt die Einsatzposition: ${L('Verteidigung')}, ${L('Mittelfeld')} oder ${L('Angriff')}. Ein gelber Rand mit Warnzeichen zeigt einen Spieler außerhalb seiner Stammposition; dort spielt er etwas schwächer.`,`The zone on the pitch sets the match position: ${L('Verteidigung')}, ${L('Mittelfeld')} or ${L('Angriff')}. A yellow border with a warning sign marks a player outside his usual position, where he plays slightly worse.`),target:()=>firstShown('.v64-out-of-position')||firstShown('[data-v64-career-slot]')?.parentElement||null,go:()=>route('matchplan')},
   {title:()=>T('Taktik','Tactics'),text:()=>T('Im Reiter Taktik legst du Grundordnung, Pressing, Passspiel, Angriffsfokus, Abwehrlinie und Zweikampfverhalten fest.','The tactics tab sets formation, pressing, passing, attacking focus, defensive line and tackling.'),target:()=>firstShown('[data-v64-career-tab="tactics"]'),go:()=>route('matchplan')},
   {title:()=>T('Zum Spiel','To the match'),text:()=>T(`Mit „${L('Nächstes Spiel vorbereiten')}“ werden die Partien vor deiner berechnet, dann öffnet sich die Spielvorbereitung.`,`“${L('Nächstes Spiel vorbereiten')}” plays the fixtures before yours, then the match preparation opens.`),target:()=>leadButton()}
  ]},
  {id:'match',title:['Dein erstes Spiel','Your first match'],start:()=>!!match(),active:()=>!!match()||reportOpen(),keepLast:true,jumps:[{to:6,test:()=>reportOpen()}],steps:[
   {title:()=>T('Spielvorbereitung','Match preparation'),text:()=>T(`Vor dem Anpfiff kannst du Aufstellung und Taktik noch ändern. „${L('Frischeste')}“, „${L('Defensiver')}“ und „${L('Offensiver')}“ passen beides mit einem Tipp an; „${L('Rückgängig')}“ nimmt Änderungen zurück.`,`Before kick-off you can still change line-up and tactics. “${L('Frischeste')}”, “${L('Defensiver')}” and “${L('Offensiver')}” adjust both with one tap; “${L('Rückgängig')}” reverts changes.`),skip:()=>lead()?.label!=='Match starten',target:()=>firstShown('[data-v64-quick]')},
   {title:()=>T('Anpfiff','Kick-off'),text:()=>T(`Mit „${L('Match starten')}“ beginnt dein Spiel live.`,`“${L('Match starten')}” begins your match live.`),skip:()=>lead()?.label!=='Match starten',target:()=>leadButton(),until:()=>lead()?.label!=='Match starten'},
   {title:()=>T('Live dabei','Watching live'),text:()=>T(`Dein Spiel läuft. Mit „${L('Taktik & Wechsel')}“ oder „${L('Pause')}“ hältst du es an, um einzugreifen.`,`Your match is running. “${L('Taktik & Wechsel')}” or “${L('Pause')}” stops it so you can step in.`),skip:()=>lead()?.context!=='Spiel läuft',target:()=>leadButton(),until:()=>lead()?.context!=='Spiel läuft'},
   {title:()=>T('Taktik und Wechsel','Tactics and subs'),text:()=>T(`Tippe in der Pause auf „${L('Taktik & Wechsel')}“. Dort änderst du die Taktik oder wechselst aus: Ziehe einen Bankspieler auf einen Feldspieler. Der Wechsel erfolgt bei der nächsten Spielunterbrechung und lässt sich bis dahin zurücknehmen.`,`While paused, tap “${L('Taktik & Wechsel')}”. There you change tactics or make a substitution: drag a bench player onto a player on the pitch. The substitution happens at the next stoppage and can be undone until then.`),when:()=>/pausiert|Halbzeit/.test(lead()?.context||''),target:()=>firstShown('#v65-pause-tabs')||leadButton()},
   {title:()=>T('Frische','Freshness'),text:()=>T(`Der Balken an jedem Spieler zeigt seine Frische. Müde Spieler verlieren an Wirkung; wechsle sie rechtzeitig aus. Mit „${L('Fortsetzen')}“ geht es weiter – zur Halbzeit geht die Einführung weiter.`,`The bar on each player shows his freshness. Tired players lose impact, so substitute them in time. “${L('Fortsetzen')}” continues – the introduction continues at half-time.`),when:()=>/pausiert|Halbzeit/.test(lead()?.context||''),target:()=>firstShown('#v65-pause-tabs ~ * .v51-pitch-bar')||firstShown('#game-screen .v51-pitch-bar')||firstShown('.v51-pitch-bar')},
   {title:()=>T('Halbzeit','Half-time'),text:()=>T(`Zur Pause hält das Spiel automatisch an. Prüfe Frische und Taktik, dann geht es mit „${L('2. Halbzeit starten')}“ weiter.`,`The match stops automatically at the break. Check freshness and tactics, then continue with “${L('2. Halbzeit starten')}”.`),when:()=>lead()?.context==='Halbzeit',target:()=>leadButton(),until:()=>{const now=lead()?.context;if(now==='Halbzeit')ctx.half=true;return !!ctx.half&&now!=='Halbzeit'&&now!=='Spiel pausiert';}},
   {title:()=>T('Spielbericht','Match report'),text:()=>T(`Nach dem Abpfiff zeigt der Spielbericht Tore, Noten und Statistiken. Danach folgen die Ergebnisse des Spieltags; „${L('Zur Vereinszentrale')}“ bringt dich zurück.`,`After the final whistle the report shows goals, ratings and statistics. The matchday results follow; “${L('Zur Vereinszentrale')}” takes you back.`),when:()=>reportOpen(),until:()=>!reportOpen()&&!match()},
   {title:()=>T('Geschafft!','Done!'),text:()=>T('Das war die Einführung. Neue Aufgaben und News findest du im Vereinsbüro auf der Übersicht, Erklärungen jederzeit unter Hilfe & Einstellungen. Viel Erfolg in deiner ersten Saison!','That’s the introduction. New tasks and news wait in the club office on the overview, and explanations are always under Help & Settings. Good luck in your first season!'),when:()=>inCareer()&&!reportOpen()}
  ]},
  {id:'renew',title:['Vertrag verlängern','Extending a contract'],free:true,start:()=>inCareer()&&(state.done.includes('transfer')||!['sponsor','budget','open'].includes(market().phase))&&!!renewable(),active:()=>!match(),steps:[
   {title:()=>T('Ein Vertrag läuft aus','A contract is running out'),text:()=>T(`Der Vertrag von ${player()} endet mit dieser Saison. Das Vereinsbüro meldet das unter „${L('Auslaufende Verträge')}“. Verlängerst du nicht, verlässt er den Verein am Saisonende.`,`${player()}’s contract ends this season. The club office lists this under “${L('Auslaufende Verträge')}”. If you do not extend it, he leaves the club at the end of the season.`),target:()=>firstShown('[data-fl-overview-section="contracts"]'),go:()=>route('overview')},
   {title:()=>T(L('Handlungsbedarf'),L('Handlungsbedarf')),text:()=>T(`Unter ${L('Kader')} → ${L('Verträge')} zeigt „${L('Handlungsbedarf')}“ alle Spieler, um die du dich kümmern solltest: auslaufende Verträge, laufende Verhandlungen und angekündigte Karriereenden.`,`Under ${L('Kader')} → ${L('Verträge')}, “${L('Handlungsbedarf')}” lists every player who needs your attention: expiring contracts, ongoing negotiations and announced retirements.`),target:()=>firstShown('[data-fl-contract-filter="attention"]'),go:()=>route('squad','contracts')},
   {title:()=>T(L('Verlängern'),L('Verlängern')),text:()=>T(`Tippe bei ${player()} auf „${L('Verlängern')}“.`,`Tap “${L('Verlängern')}” next to ${player()}.`),target:()=>firstShown(`[data-v66-renew-open="${state?.pid||''}"]`)||firstShown('[data-v66-renew-open]'),go:()=>route('squad','contracts'),until:()=>!!q('#v66-renew-dialog[open]')},
   {title:()=>T('Dein Angebot','Your offer'),text:()=>T(`Lege Jahresgehalt, Laufzeit (zwei oder drei Saisons) und eine Einsatz-Zusage fest und tippe auf „${L('Angebot senden')}“. Der Spieler antwortet sofort.`,`Set the annual wage, the contract length (two or three seasons) and a playing-time promise, then tap “${L('Angebot senden')}”. The player answers right away.`),target:()=>q('#v66-renew-dialog[open] [data-v66-renew-submit]'),until:()=>fired('renew')},
   {title:()=>T('Die Antwort','The answer'),text:()=>T('Ist ihm das Gehalt zu niedrig, nennt er eine Gegenforderung. Pro Verhandlungsrunde hast du zwei Angebote. Scheitern beide, öffnet sich später in der Saison eine zweite Runde; das Datum steht im Dialog. Spieler, die ihr Karriereende angekündigt haben, lassen sich nicht verlängern.','If the wage is too low, he names a counter-demand. You have two offers per negotiation round. If both fail, a second round opens later in the season; the dialog shows the date. Players who have announced their retirement cannot be extended.')}
  ]}
 ];
 function player(){try{const c=career(),pid=state?.pid;return v66Own(c).roster.find(p=>p.pid===pid)?.name||T('deinem Spieler','your player');}catch{return T('deinem Spieler','your player');}}

 // Chapter flow
 const chapter=()=>chapters.find(item=>item.id===state?.chapter)||null;
 function enterStep(index){state.step=index;ctx.baseline=new Map(counts);ctx.scrolled=false;ctx.half=false;save();}
 function finish(){if(!state.done.includes(state.chapter))state.done.push(state.chapter);state.chapter=null;state.step=0;delete state.pid;save();}
 function advance(from){
  const current=chapter();if(!current)return;
  for(let index=from;index<current.steps.length;index++){if(!current.steps[index].skip?.()){enterStep(index);return;}}
  finish();
 }
 function pick(){
  const open=chapters.filter(item=>!state.done.includes(item.id));
  const next=open.find(item=>!item.free&&item.start())||(open.find(item=>item.free&&item.start()));
  if(!next)return;
  state.chapter=next.id;if(next.id==='renew')state.pid=renewable()?.pid;advance(0);
 }
 function evaluate(){
  if(!active())return null;
  if(!state.chapter)pick();
  let current=chapter();if(!current)return null;
  const step=current.steps[state.step];
  if(!step){finish();return evaluate();}
  if(step.until?.()){advance(state.step+1);return evaluate();}
  if(!current.active()&&!(current.keepLast&&state.step===current.steps.length-1)){finish();return evaluate();}
  for(const jump of current.jumps||[])if(state.step<jump.to&&jump.test()){advance(jump.to);return evaluate();}
  if(step.when&&!step.when())return null;
  current=chapter();return current?{current,step:current.steps[state.step],index:state.step}:null;
 }

 // Companion panel: non-modal, moves into the topmost modal dialog so it stays usable there.
 const panel=doc.createElement('section');panel.className='v186-coach';panel.setAttribute('role','region');panel.setAttribute('aria-labelledby','v186-title');panel.dataset.v186Coach='';
 let signature='',highlighted=null;
 function highlight(node){if(highlighted===node)return;highlighted?.classList.remove('v186-target');highlighted=node;node?.classList.add('v186-target');}
 function host(){return [...doc.querySelectorAll('dialog[open]')].filter(d=>d.matches(':modal')).at(-1)||doc.body;}
 // Keeps the panel away from its target: lower-half targets move it to the top, below the lead action.
 function place(target,where){
  let top=panel.classList.contains('v186-top');
  if(target&&shown(target)){const box=target.getBoundingClientRect(),mid=(Math.max(box.top,0)+Math.min(box.bottom,innerHeight))/2;if(mid>innerHeight*.6)top=true;else if(mid<innerHeight*.4)top=false;}else top=false;
  const anchor=where===doc.body?leadButton()?.getBoundingClientRect():null;panel.style.setProperty('--v186-top',`${anchor&&anchor.bottom>0&&anchor.bottom<innerHeight*.3?Math.round(anchor.bottom):0}px`);
  panel.classList.toggle('v186-top',top);
 }
 function render(view){
  if(!view){highlight(null);if(panel.isConnected)panel.remove();signature='';return;}
  const {current,step,index}=view,target=step.target?.()||null,collapsed=!!state.collapsed;
  const canGo=!!step.go&&!shown(target),theme=(q('.fl-shell[data-fl-theme],.fl-dialog[data-fl-theme],.fl-match[data-fl-theme]')?.dataset.flTheme)||'light';
  const sig=[current.id,index,collapsed,canGo,en(),theme,step.title(),step.text()].join('|');
  const where=host();if(panel.parentNode!==where)where.append(panel);
  highlight(collapsed?null:target);
  if(target&&!collapsed&&!ctx.scrolled){ctx.scrolled=true;const box=target.getBoundingClientRect();if(box.top<0||box.bottom>innerHeight)target.scrollIntoView({block:'center',behavior:'smooth'});}
  const dock=q('.fl-bottom-dock');panel.style.setProperty('--v186-dock',`${where===doc.body&&shown(dock)?Math.round(dock.getBoundingClientRect().height):0}px`);
  place(collapsed?null:target,where);
  if(sig===signature)return;signature=sig;panel.dataset.flTheme=theme;
  const label=T('Einführung','Introduction'),title=current.title[en()?1:0];
  panel.classList.toggle('v186-collapsed',collapsed);
  panel.innerHTML=collapsed
   ?`<div class="v186-head"><span class="v186-kicker">${esc(label)} · ${esc(title)}</span><button type="button" class="v186-icon" data-v186="expand" aria-expanded="false" aria-label="${esc(T('Einführung aufklappen','Expand introduction'))}">▴</button></div><h2 id="v186-title" class="v186-hidden">${esc(step.title())}</h2>`
   :`<div class="v186-head"><span class="v186-kicker">${esc(label)} · ${esc(title)}</span><span class="v186-count">${esc(T('Schritt','Step'))} ${index+1}/${current.steps.length}</span><button type="button" class="v186-icon" data-v186="collapse" aria-expanded="true" aria-label="${esc(T('Einführung einklappen','Collapse introduction'))}">▾</button></div>
    <div aria-live="polite"><h2 id="v186-title">${esc(step.title())}</h2><p>${esc(step.text())}</p></div>
    <div class="v186-actions">${index>0?`<button type="button" data-v186="back">${esc(T('Zurück','Back'))}</button>`:''}${canGo?`<button type="button" data-v186="go">${esc(T('Hinführen','Take me there'))}</button>`:''}<button type="button" class="v186-primary" data-v186="next">${esc(T('Weiter','Next'))}</button></div>
    <div class="v186-meta"><button type="button" data-v186="skip">${esc(T('Kapitel überspringen','Skip chapter'))}</button><button type="button" data-v186="end">${esc(T('Einführung beenden','End introduction'))}</button></div>`;
 }
 panel.addEventListener('click',event=>{
  const action=event.target.closest('[data-v186]')?.dataset.v186;if(!action||!active())return;
  const current=chapter();if(!current)return;
  if(action==='next')advance(state.step+1);
  else if(action==='back'){for(let index=state.step-1;index>=0;index--)if(!current.steps[index].skip?.()){enterStep(index);break;}}
  else if(action==='go'){current.steps[state.step]?.go?.();ctx.scrolled=false;}
  else if(action==='skip')finish();
  else if(action==='end'){state.enabled=false;save();}
  else if(action==='collapse'||action==='expand'){state.collapsed=action==='collapse';save();}
  signature='';tick();
  if(action==='next'||action==='back'||action==='collapse'||action==='expand')requestAnimationFrame(()=>panel.querySelector(action==='expand'?'[data-v186="collapse"]':action==='collapse'?'[data-v186="expand"]':'[data-v186="next"]')?.focus({preventScroll:true}));
 });
 panel.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel.parentNode===doc.body&&chapter()){event.preventDefault();finish();signature='';tick();}});

 // Start flow: explanations per step and the opt-in on the review step.
 const explain={
  manager:()=>T('Dein Name erscheint in der Karriere, in der Vereinschronik und in deiner Managerlaufbahn.','Your name appears in your career, in the club history and in your manager record.'),
  country:()=>T('Jedes Land hat eine eigene Liga mit acht Vereinen und 14 Spieltagen sowie einen nationalen Pokal. Über Liga und Pokal qualifizierst du dich für den Crown Cup und den Horizon Cup. Das Land legt fest, in welcher Liga du beginnst.','Each country has its own league with eight clubs and 14 matchdays plus a national cup. League and cup lead to the Crown Cup and the Horizon Cup. The country decides which league you start in.'),
  clubs:()=>T('Alle acht Ligavereine sind wählbar. Nach der Wahl siehst du den erzeugten Startkader und kannst jeden Spieler ansehen, bevor du dich festlegst. Mit „Zurück“ wählst du einen anderen Verein; der Kader des jeweiligen Vereins bleibt dabei gleich.','All eight league clubs are available. After choosing, you see the generated starting squad and can open every player before you commit. Use “Back” to pick another club; each club keeps the same squad.'),
  review:()=>T('Gespielt wird auf dem Standardfeld mit fünf Feldspielern und einem Torwart. Die Karriere wird nur in diesem Browser gespeichert. Bis zu fünf Vereinswelten haben Platz; sichere wichtige Karrieren zusätzlich über den Export auf der Startseite.','Matches use the standard pitch with five outfield players and a goalkeeper. The career is saved only in this browser. Up to five club worlds fit; back up important careers with the export on the start page.')
 };
 function decorateFlow(){
  const flow=typeof v172Flow==='object'?v172Flow:null,section=q('.v172-start');if(!flow||!section||!explain[flow.step])return;
  q('.fl-start-steps',section)?.insertAdjacentHTML('afterend',`<details class="v186-explain"><summary>${esc(T('Was bedeutet das?','What does this mean?'))}</summary><p>${esc(explain[flow.step]())}</p></details>`);
  if(flow.step!=='review')return;
  if(typeof flow.v186Optin!=='boolean'){try{flow.v186Optin=v61ReadCareers().length===0;}catch{flow.v186Optin=false;}}
  q('[data-v172-start="create"]',section)?.insertAdjacentHTML('beforebegin',`<div class="v186-optin"><label><input type="checkbox" id="v186-optin" ${flow.v186Optin?'checked':''}> ${esc(T('Einführung zeigen','Show the introduction'))}</label><p id="v186-optin-help">${esc(T('Die Einführung führt dich durch die erste Transferphase und dein erstes Spiel. Du kannst sie jederzeit beenden oder unter Hilfe & Einstellungen neu starten.','The introduction guides you through your first transfer window and your first match. You can end it at any time or restart it under Help & Settings.'))}</p></div>`);
  const box=q('#v186-optin',section);box.setAttribute('aria-describedby','v186-optin-help');box.addEventListener('change',()=>{flow.v186Optin=box.checked;});
 }
 if(typeof v172RenderFlow==='function'){const baseFlow=v172RenderFlow;window.v172RenderFlow=function(...args){const result=baseFlow.apply(this,args);try{decorateFlow();}catch(error){console.warn('Tutorial start notes',error);}return result;};}
 function begin(careerId){state={careerId,enabled:true,done:[],chapter:null,step:0,collapsed:false};save();signature='';}
 if(typeof v61StoreNewCareer==='function'){const baseStore=v61StoreNewCareer;window.v61StoreNewCareer=async function(...args){const saved=await baseStore.apply(this,args);const flow=typeof v172Flow==='object'?v172Flow:null;if(flow&&saved?.id&&flow.v186Optin)begin(saved.id);return saved;};}

 // Help & settings: switch, restart and a short glossary.
 const glossary=[
  [['Farbstufen','Colour levels'],['Fähigkeiten werden in fünf Farbstufen gezeigt, von schwach bis herausragend. Die Legende im Spielerprofil nennt jede Stufe auch als Wort.','Abilities are shown in five colour levels, from weak to outstanding. The legend in the player profile also names each level.']],
  [['Stamm- und Einsatzposition','Usual and match position'],['Die Stammposition gehört zum Spieler. Die Einsatzposition ergibt sich aus seiner Zone im Aufstellungsraster. Auf einer fremden Position spielt er im Match etwas schwächer.','The usual position belongs to the player. The match position follows from his zone on the line-up grid. Out of position he plays slightly worse during the match.']],
  [['Frische','Freshness'],['Frische sinkt im Spiel und steigt an spielfreien Tagen wieder. Ausdauernde Spieler ermüden langsamer. Zu Saisonbeginn sind alle Spieler voll frisch.','Freshness drops during matches and recovers on days without a match. Players with more stamina tire more slowly. Everyone starts the season fully fresh.']],
  [['Transfertage','Transfer days'],['In jeder Transferphase gibt es fünf Tage. Angebote werden am nächsten Transfertag beantwortet.','Each transfer window has five days. Offers are answered on the next transfer day.']],
  [['Gehälter','Wages'],['Gehälter werden einmal am Saisonende nach der Platzierungsprämie bezahlt.','Wages are paid once at the end of the season after the placement bonus.']],
  [['Crown Cup und Horizon Cup','Crown Cup and Horizon Cup'],['Die beiden internationalen Wettbewerbe neben Liga und Pokal. Der Crown Cup ist der höhere.','The two international competitions alongside league and cup. The Crown Cup is the higher one.']]
 ];
 function settings(){
  const view=q('.fl-settings');if(!view)return;
  let section=q('.v186-settings',view);const lang=en()?'en':'de',on=active();
  if(!section||section.dataset.lang!==lang){
   section?.remove();section=doc.createElement('section');section.className='fl-settings-section v186-settings';section.dataset.lang=lang;section.setAttribute('aria-labelledby','v186-settings-heading');
   const pick=pair=>pair[en()?1:0];
   section.innerHTML=`<div><h2 id="v186-settings-heading">${esc(T('Einführung','Introduction'))}</h2><p>${esc(T('Die Einführung führt durch die erste Transferphase, das erste Spiel und die erste Vertragsverlängerung.','The introduction guides you through your first transfer window, your first match and your first contract extension.'))}</p><details class="v186-glossary"><summary>${esc(T('Grundlagen','Basics'))}</summary>${glossary.map(([term,text])=>`<details><summary>${esc(pick(term))}</summary><p>${esc(pick(text))}</p></details>`).join('')}</details></div>
    <div class="fl-settings-actions v186-settings-actions"><label class="v186-switch"><input type="checkbox" data-v186-setting="enabled"> ${esc(T('Einführung anzeigen','Show introduction'))}</label><button type="button" class="fl-button" data-v186-setting="restart">${esc(T('Einführung für diese Karriere neu starten','Restart introduction for this career'))}</button><p class="v186-settings-status" role="status"></p></div>`;
   const legal=[...view.querySelectorAll(':scope > .fl-settings-section')].at(-1);legal?legal.before(section):view.append(section);
   section.addEventListener('change',event=>{if(event.target.dataset.v186Setting!=='enabled')return;const id=career()?.id;if(!id)return;if(event.target.checked){if(state?.careerId===id){state.enabled=true;save();}else begin(id);}else if(state?.careerId===id){state.enabled=false;save();}tick();});
   section.addEventListener('click',event=>{if(event.target.closest('[data-v186-setting="restart"]')&&career()?.id){begin(career().id);q('.v186-settings-status',section).textContent=T('Die Einführung beginnt wieder mit Kapitel 1 und folgt deiner Karriere ab ihrer aktuellen Phase.','The introduction starts again at chapter 1 and follows your career from its current phase.');tick();}});
  }
  const box=q('[data-v186-setting="enabled"]',section);if(box&&doc.activeElement!==box&&box.checked!==on)box.checked=on;
 }

 function tick(){try{settings();render(evaluate());}catch(error){console.warn('Tutorial',error);render(null);}}
 setInterval(tick,400);
 doc.addEventListener('doppel6-language-change',()=>{signature='';tick();});
 doc.addEventListener('click',()=>setTimeout(tick,0),true);
 window.D6Tutorial=Object.freeze({state:()=>state&&JSON.parse(JSON.stringify(state)),tick});
})();

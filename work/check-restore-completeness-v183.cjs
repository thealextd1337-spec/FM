'use strict';
// B19 Restore-Vollständigkeit (Release 133, Welle 0).
//
// Nutzerentscheidung 14. Oktober 2026: Eine unterbrochene Partie wird am letzten sicheren Speicherpunkt fortgesetzt.
// Ein bitgleicher Gesamtverlauf gegenüber der ununterbrochenen Partie ist NICHT mehr gefordert. Gefordert ist
// Zustandsvollständigkeit: nach Snapshot -> JSON -> Restore sind Spielstand, Uhr, Phase, Marker, Absichten, Laufziele,
// Sperren, Ball und Spieler erhalten, und die Fortsetzung läuft fehlerfrei bis zum Abpfiff.
//
// Das Werkzeug spielt echte Partien der Browser-Engine (Konstruktor v65CreateMatch, step, v65AfterStep, v65Snapshot,
// v65Restore; Playwright + Edge, kein Unity). An einem Auslöser („Szene“) wird
//   1. der gesamte Laufzustand erfasst: Match-Objekt samt attackFlow und match.si, Spieler, Ball, Uhr, Protokolltext und
//      alle modulweiten WeakMaps der Engine (Schlüssel: Match, Standard, Rückprall, Spieler ...);
//   2. v65Snapshot ausgeführt, der Snapshot durch JSON geschickt (so speichert v61SaveCareers) und mit v65Restore geladen;
//   3. der Zustand erneut erfasst und TIEF verglichen, Pfad für Pfad, einschließlich der Referenzidentität der Spieler
//      (nach einem Restore darf keine Spielerkopie außerhalb von match.people hängen);
//   4. die Partie bis zum Abpfiff fortgesetzt und dabei auf Fehler, NaN/Infinity und hängende Zustände geprüft.
// Der Vergleich ist generisch und kennt keine einzelnen Felder. Pakete der Welle 1 legen ihren Laufzustand als Plain-Daten
// in `match.attackFlow` bzw. `match.si` ab und werden dadurch ohne Änderung dieses Werkzeugs mitgeprüft. Modulweite
// WeakMaps findet das Werkzeug im Quelltext von dist/*.js selbst; ein Eintrag, der nach dem Restore fehlt oder abweicht,
// muss in WEAKMAPS (unten) mit Begründung eingeordnet sein, sonst scheitert die Prüfung als „unklassifizierte WeakMap“.
// Ausdrücklich flüchtig sind nur die dort und in EXPECTED aufgeführten Dinge (Darstellung, Zwischenspeicher, im Takt neu
// berechnete Daten); jede Einordnung trägt ihre Begründung und erscheint im Bericht.
//
// Aufruf (Node >= 20; Ports für B19: 4256-4261, --base nutzt --port+1):
//   node work/check-restore-completeness-v183.cjs [--port=4256] [--seeds=4] [--sizes=standard,large] [--only=id,id]
//        [--markers=new|none|both] [--twin] [--explain] [--sweep=N --seedStart=0 --every=120] [--base=<Wurzel>]
//        [--out=pfad] [--verbose] [--list] [--selftest] [--quick] [--reload]
//   (ohne --sweep)  alle Szenen des Katalogs (SCENES) je Feldgröße; pro Szene werden die Seeds 0..seeds-1 durchprobiert, bis der
//                   Auslöser in der Partie auftritt
//   --twin    dieselbe Szene zusätzlich ohne Restore laufen lassen und den ersten abweichenden Tick der Fortsetzung melden.
//             Ein Unterschied ist laut Nutzerentscheidung KEIN Fehler; der Zwilling ist ein Befund (er deckt Zustand auf, den
//             die Tiefenprüfung noch nicht kennt) und der Beleg, dass nichts Verhaltenswirksames verloren ging.
//   --explain bei Abweichung die Zustände am ersten abweichenden Tick vergleichen (impliziert --twin)
//   --sweep=N N Partien, alle --every Ticks Snapshot -> JSON -> Restore in Kette (Stresstest über beliebige Zeitpunkte);
//             zusammen mit --twin wird die Kette Block für Block mit der Partie ohne Restore verglichen
//   --markers none = Altpartie wie mit Release 131 begonnen (alle Marker 182 und match.si nach der Erzeugung entfernt): Restore darf keine Marker ergänzen; mit --base muss
//             der Zustand nach dem Restore, die Snapshotgröße und die Fortsetzung bitgleich zum Ausgangsstand sein
//   --base    zweite Wurzel (z. B. `git archive <Stand> dist work/test-v41.cjs` nach work/tmp-base-b19)
//   --selftest Negativkontrollen: absichtlich fehlerhafte Zustände müssen erkannt werden
//   --reload  Neustart der App nachstellen: Snapshot, Karriere als JSON, FRISCHE Seite, Anzeige der Partie wie beim App-Start
//             (statt Restore in derselben Seite); mit --twin läuft die ursprüngliche Seite ohne Restore als Vergleich weiter
//   --quick   Kurzlauf (zehn Szenen, Standardfeld, ohne Zwilling) für die Entwicklung eines Pakets
// Pakettests (Welle 1) nutzen das Werkzeug als Modul und beschreiben ihre Szenen über `trigger` und optional `setup`:
//   const {checkScenes}=require('./check-restore-completeness-v183.cjs');
//   await checkScenes([{id:'si-finish-fernschuss',
//     setup:"R.until('m.owner&&R.quiet(m)&&m.elapsed>=14',3000);...",   // optional, läuft vor dem Auslöser (Variablen m,state,ctx,R)
//     trigger:"!!m.attackFlow.siFinish&&!m.flight"}],                    // JS-Ausdruck, wird nach jedem Tick ausgewertet
//     {port:4258,sizes:['standard','large'],seeds:[0,1,2,3]});          // wirft mit lesbarer Meldung, wenn der Restore etwas verliert
//   Einzelne Szene: const rig=await openRig({port:4258}); const r=await rig.runScene({...}); ...; await rig.close();
//   Im Seitenkontext stehen R.until(ausdruck,maxTicks), R.tick(), R.advance(n), R.quiet(m), R.injectPenalty/FreeKick/Corner() bereit.
// Konventionen für Paketzustand (damit nichts verloren geht):
//   - Laufzustand als Plain-Daten (Zahlen, Strings, Arrays, Objekte) in match.attackFlow oder match.si; Spieler nur als pid.
//   - Keine Map/Set/Funktionen/Spielerobjekte in diesen Objekten (JSON macht daraus {} bzw. Kopien; die Prüfung meldet das).
//   - Infinity/-Infinity/NaN sind erlaubt: v65Snapshot/v65Restore stellen sie in Partien mit Marker 182 wieder her.
//   - Zustand in einer modulweiten WeakMap muss entweder in nativeContinuation (v160SnapshotContinuation) gespeichert oder in
//     WEAKMAPS mit Begründung als flüchtig (derived/ui/flight) oder aus Plain-Daten rekonstruierbar (mirrored) eingeordnet sein.
//   - Gemeinsam genutzte Objekte (Aliasing) trennt der Rundlauf; Pakete dürfen sich nicht auf Objektgleichheit zwischen zwei
//     Feldern verlassen. Verglichen werden Werte, nicht Aliasing.
// Bewusst nicht geprüft: Elfmeterschießen nach dem Spiel (eigener Zustand state.penaltySession, kein Teil von v65Snapshot),
// Unity-Darstellung, Spieler, die schon ausgewechselt sind (inaktiv), Wanduhr-Autosicherung (v65AfterStep alle 700 ms ruft nur
// denselben v65Snapshot auf; das Werkzeug löst Snapshots ausdrücklich aus und hält v65LastSaved auf Infinity).
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');

const root=path.resolve(process.env.D6_TEST_ROOT||path.join(__dirname,'..'));
const PLAYWRIGHT='C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright';
const EDGE='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

// ---------------------------------------------------------------------------------------------------------------------
// Einordnung der modulweiten WeakMaps. kind:
//   persisted : Eintrag muss nach dem Restore unmittelbar gleich vorhanden sein (nativeContinuation). `live(eintrag,baum)`
//               nimmt abgelaufene/leere Einträge aus dem Vergleich; `ignore` nimmt Teilpfade mit Begründung heraus.
//   mirrored  : Eintrag wird beim nächsten Tick aus Plain-Daten im Match neu aufgebaut. `mirror(eintrag,baum)` prüft, dass
//               diese Plain-Daten nach dem Restore vorhanden sind.
//   derived   : Zwischenspeicher oder im Takt neu berechnete Daten; sein Verlust ändert keinen Spielzustand.
//   flight    : Schlüssel ist das Flug-Objekt; v65Snapshot speichert nie während eines Flugs (match.flight===null).
//   ui        : nur Darstellung/Wiederholung ohne Einfluss auf den Spielverlauf.
//   gap       : bekannter Zustandsverlust; erscheint im Bericht als Restgrenze.
// Welle-1-Pakete: neue WeakMaps hier eintragen oder ihren Zustand als Plain-Daten in match.attackFlow / match.si führen.
// Persisted, mirrored und gap werden mit Inhalt erfasst, alle anderen nur auf Anwesenheit.
// ---------------------------------------------------------------------------------------------------------------------
// Der Foulkontext gilt für die ganze Vorbereitung desselben Standards (Annäherung ×0,6 in pitch-v57; Sperre und Liegen 2,7 s).
const fouled=entry=>entry?.piece?.$ref==='setPiece';
const WEAKMAPS={
 v117Flights:{kind:'flight',note:'Ledger-Ereignis je Flug; ein Snapshot entsteht nie während eines Flugs.'},
 v102Flights:{kind:'flight',note:'Flug-Metadaten; kein Flug im Snapshot.'},
 v127GroundReceivers:{kind:'flight',note:'Empfänger des laufenden Bodenpasses; kein Flug im Snapshot.'},
 v122AerialPlans:{kind:'flight',note:'Luftduellplan je Flug; kein Flug im Snapshot.'},
 v110Blocks:{kind:'flight',note:'Block-Absicht je Flug; kein Flug im Snapshot.'},
 v99Flights:{kind:'flight',note:'Schussfreigabe je Flug; kein Flug im Snapshot.'},
 v103Replays:{kind:'ui',note:'Aufzeichnung der Tor-Wiederholung (Anzeige).'},
 v158ParameterCache:{kind:'derived',note:'Zwischenspeicher der Belastungsparameter.'},
 v158AbilityCache:{kind:'derived',note:'Zwischenspeicher der effektiven Fähigkeiten je Spieler.'},
 v158Samples:{kind:'derived',note:'Belastungsstichprobe wird im selben Tick verbraucht.'},
 v121PositioningPlans:{kind:'derived',note:'Stellungsplan wird in v121PreparePositioning im nächsten Takt neu berechnet (fehlt der Eintrag, wird er gebaut).'},
 v132AirChasers:{kind:'derived',note:'Läufer zum Luftball werden im Takt neu gewählt; die Zuteilung steht in rebound.chase (gespeichert).'},
 v182PursuitFollow:{kind:'derived',note:'Nachsetz-Messung gilt nur im selben Tick (clock-Gleichheit), nie über einen Speicherpunkt hinweg.'},
 v181PositioningSteps:{kind:'ui',note:'Schrittrichtungen der 3D-Darstellung.'},
 v109CornerBalls:{kind:'ui',note:'Ballbahn der Eckballvorbereitung (Darstellung); m.ball und setPiece sind gespeichert.'},
 v114KickoffBalls:{kind:'ui',note:'Ballbahn zum Anstoßpunkt (Darstellung); m.ball und kickoff sind gespeichert.'},
 v115OffsideBalls:{kind:'ui',note:'Ballbahn zum Abseitspunkt (Darstellung); m.ball und setPiece sind gespeichert.'},
 v150SpacePasses:{kind:'mirrored',note:'Raumpass-Plan wird aus match.spacePassIntent in v150RestoreIntent neu aufgebaut.',
  // Plan vorhanden und weiterlaufend: entweder v183RestoreSpacePass hat ihn sofort gebaut, oder der Ball ist noch lose und v150RestoreIntent baut ihn im nächsten Takt.
  mirror:(entry,after)=>!entry?.rebound||!!after.maps?.v150SpacePasses||(!!after.match.spacePassIntent&&!!after.match.rebound&&!after.match.owner&&!after.match.flight)},
 v102Motion:{kind:'persisted',live:entry=>entry?.clock>0||entry?.loose!=null,ignore:[
  {re:/^match\.(poses|serial)(\.|$|\[)/,reason:'Posen und Posenzähler sind Darstellung (v102: „never to a saved match“); Uhr und lose Flugbahn sind gespeichert.'},
  {re:/^match\.loose\.owner$/,reason:'Eine lose Kopfball-Flugbahn ohne Spieler im Besitz wird beim Restore mit owner:null gebunden (vorher fehlt das Feld); beide werden nur gelesen.'},
 ]},
 v99Actions:{kind:'persisted',
  live:entry=>['keepers','kicks','throws'].some(key=>entry?.[key]?.$map?.length),
  ignore:[
   {re:/^match\.(miss|outBall|goalTravel|goalHeight|goalLateral)(\.|$)/,reason:'Ballbahn-Reste nach Schuss/Tor (Darstellung, v132ClearVisualTails löscht sie ohnehin); Torwart-/Einwurf-/Abstoßzustand ist gespeichert.'},
   {re:/^match\.(keepers|kicks|throws)\.\$map\[\d+\]\[1\]\.(launched|flight\.(done|shotMotion))$/,reason:'Flugbezogene Reste im Torwart-/Abstoßzustand: Das Flugobjekt gibt es nach einem Restore nie (match.flight===null); sein Rückruf done und der Ledger-Verweis shotMotion sind nicht speicherbar, launched gilt nur für den laufenden Flug.'},
  ]},
 v124AirBalls:{kind:'persisted',live:entry=>entry?.rebound?.$ref==='rebound'},
 v113Fouls:{kind:'persisted',live:fouled},
 v121PositioningSamples:{kind:'persisted'},
 v123DefensiveThreats:{kind:'persisted'},
 v108MovementModes:{kind:'persisted'},
 v115KeeperChallenges:{kind:'persisted'},
 v123GroundControls:{kind:'persisted'},
 v114RestartMoves:{kind:'persisted'},
};

// Felder, die sich beim Rundlauf absichtlich ändern. Jede Regel braucht eine Begründung.
//   side: 'after' = darf nur nach dem Restore vorhanden sein, 'before' = nur vorher, 'any' = beliebig; after = erwarteter Text
const EXPECTED=[
 {re:/^match\.nativeContactClock$/,side:'any',reason:'v65Snapshot hält den Ursprung der nativen Kontaktuhr als Feld fest; v65Restore setzt sie in v102State(match).clock. Die Uhr selbst wird getrennt verglichen (clock).'},
 {re:/^state\.phase$/,side:'any',reason:'Beim Laden einer gespeicherten Partie setzt die App eine laufende Partie auf pausiert (world-match-ui-v64.js:83); nur im Neustart-Modus (--reload) sichtbar.'},
 {re:/^match\.(lastPass|breakawayCarrier)$/,side:'after',after:'null',reason:'Vor dem ersten Pass fehlt das Feld; Restore bindet es als null (gleichbedeutend, es wird nur gelesen).'},
];

// ---------------------------------------------------------------------------------------------------------------------
// Seitenbibliothek (läuft im Browser im globalen Gültigkeitsbereich der Engine: match, step, v65Snapshot ... sind sichtbar)
// ---------------------------------------------------------------------------------------------------------------------
function pageLibrary(){
 const R=window.R183={log:[]};
 let rng=1,draws=0;
 // Der Seitenzufall gilt NUR innerhalb der Werkzeugaufrufe (R.seeded). Zwischen zwei Aufrufen laufen Timer der Seite (Animationen,
 // Hinweise) mit dem echten Math.random; würden sie den gesetzten Generator verbrauchen, wäre der Spielverlauf von der Auslastung abhängig.
 const seededRandom=()=>{draws++;rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
 R.seedRandom=seed=>{rng=seed>>>0||1;draws=0;Date.now=()=>1791540000000;};
 R.seeded=fn=>{
  const previous=Math.random;Math.random=seededRandom;
  let result;try{result=fn();}catch(error){Math.random=previous;throw error;}
  if(result&&typeof result.then==='function')return result.finally(()=>{Math.random=previous;});
  Math.random=previous;return result;
 };
 R.draws=()=>draws;
 const globalValue=name=>{try{return(0,eval)(`typeof ${name}==='undefined'?undefined:${name}`);}catch{return undefined;}};

 // ----- Partie erzeugen (wie work/run-full-matches-v182.cjs) -----
 R.init=async({seed,size,count,strength='mixed',markers='new'})=>{
  R.seedRandom(183000+seed*7919);
  const c=v61CreateCareer('GER-2','r183-'+seed,'Restore 183',undefined,{fieldSize:size,fieldPlayers:count}),club=v66Own(c);
  v66ChooseSponsor(c,club.id,club.sponsors[0].id);v124SetYouthBudget(c,0);while(c.world.market.phase==='open')await v66NextMarketDay(c);
  const f=v62Fixtures(c).filter(x=>!x.result&&[x.homeId,x.awayId].includes(club.id)).sort((a,b)=>a.day-b.day)[0];
  const names=['low-balanced','high-balanced','home-strong','away-strong'],group=strength==='mixed'?names[seed%4]:strength,levels={'low-balanced':[8,8],'high-balanced':[16,16],'home-strong':[16,8],'away-strong':[8,16]}[group];
  for(const [t,id]of [f.homeId,f.awayId].entries())for(const p of c.world.clubs.find(q=>q.id===id).roster)for(const key of D6PlayerGeneration.SKILL_KEYS){p[key]=Math.round(clamp(levels[t]+(p[key]-12)*.3,1,20));if(p.playerModel?.caps)p.playerModel.caps[key]=Math.max(p.playerModel.caps[key],p[key]);}
  const state=v64MakeState(c,f);c.world.activeMatch={fixtureId:f.id,state};v61CurrentCareer=c;state.phase='paused';match=null;v65WorldActive=null;v98View='2d';v65Show(v65Context());clearInterval(v65WorldFrame);v103CanReplay=()=>false;draw=()=>{};
  v65LastSaved=Infinity; // keine Wanduhr-Autosicherung im Takt: Snapshots entstehen nur ausdrücklich
  R.group=group;R.state=state;R.ticks=0;
  if(markers==='none'){ // Altpartie wie mit Release 131 begonnen: alle Marker 182 (und match.si) nach der Erzeugung entfernen, ältere Marker bleiben
   for(const k of Object.keys(match.attackFlow))if(/Revision$/.test(k)&&match.attackFlow[k]===182)delete match.attackFlow[k];
   if(match.penaltyRevision===182)delete match.penaltyRevision;
   delete match.si;
  }
  return{group,markers:R.markerSet(match)};
 };
 R.markerSet=m=>({attackFlow:Object.fromEntries(Object.entries(m.attackFlow||{}).filter(([k])=>/Revision$|^version$|Version$/.test(k))),penaltyRevision:m.penaltyRevision??null,si:m.si===undefined?'absent':JSON.parse(JSON.stringify(m.si))});

 // ----- Takt -----
 R.tick=()=>{
  const ctx=v65Context(),state=ctx.state;
  if(state.phase==='paused'){v65Resume();clearInterval(v65WorldFrame);v65LastSaved=Infinity;}
  step(.05*MATCH_SPEED,.05);
  if(state.phase==='live'&&!match.finished)v65AfterStep(ctx);
  if(v65PauseRequested&&!match.flight&&!match.slide&&state.phase==='live'){v65PauseRequested=false;v65Pause();clearInterval(v65WorldFrame);v65LastSaved=Infinity;}
  R.ticks++;
 };
 R.advance=n=>{for(let i=0;i<n&&!match.finished;i++)R.tick();return R.ticks;};
 R.quiet=m=>!m.flight&&!m.slide&&!m.setPiece&&!m.kickoff&&!m.throwIn&&!m.rebound&&!m.goalPause&&!m.halftimePause;
 R.until=(src,maxTicks)=>{
  const test=new Function('m','state','ctx','R',`return (${src});`);
  for(let i=0;i<maxTicks&&!match.finished;i++){
   const ctx=v65Context(),state=ctx.state;
   if(!match.flight&&!match.slide&&test(match,state,ctx,R))return{fired:true,after:i,elapsed:match.elapsed};
   R.tick();
  }
  return{fired:false,after:maxTicks,elapsed:match.elapsed};
 };

 // ----- Szenen mit den Engine-Funktionen erzwingen (kein Zustandsschreiben von Hand) -----
 R.injectFoul=box=>{
  const m=match,victim=m.people.find(p=>p.t===0&&!p.keeper),offender=m.people.find(p=>p.t===1&&!p.keeper),s=v150Scale();
  if(box){victim.x=.5;victim.y=v55Field.top+3/s.y;}else{victim.x=.35;victim.y=.45;}
  offender.x=victim.x+.3/s.x;offender.y=victim.y+.6/s.y;
  m.owner=victim;m.ball={x:victim.x,y:victim.y};m.rebound=null;m.flight=null;m.slide=null;m.setPiece=null;
  return{ok:v50Foul(victim,offender),type:m.setPiece?.type||null};
 };
 R.injectPenalty=()=>R.injectFoul(true);
 R.injectFreeKick=()=>R.injectFoul(false);
 R.injectCorner=()=>{v50Corner(0,.2,'einem Test');return{type:match.setPiece?.type||null};};

 // ----- Zustand erfassen -----
 const isPerson=v=>v&&typeof v==='object'&&typeof v.pid==='string'&&v.stats&&typeof v.stats==='object'&&'keeper' in v;
 R.weakMapNames=[];R.mapKinds={};
 // Plain-Daten-Abbild für den Vergleich: nicht endliche Zahlen, Map/Set, Funktionen, Zyklen und Spielerverweise bleiben sichtbar
 // (Spieler als {$p:pid}, Verweis auf ein benanntes Match-Unterobjekt als {$ref:name}); gemeinsame Objekte werden je Fundstelle erfasst.
 const makePlainify=env=>{
  const plainify=(v,at,root)=>{
   if(v===null)return null;
   switch(typeof v){
    case'number':return Number.isFinite(v)?(Object.is(v,-0)?0:v):{$num:String(v)};
    case'string':case'boolean':return v;
    case'undefined':return undefined;
    case'function':return{$fn:v.name||'anonymous'};
    case'bigint':case'symbol':return{$other:typeof v};
   }
   if(++env.count>3e6)throw Error('Erfassung zu groß (Zyklus?) bei '+at);
   if(!root&&env.labels.has(v))return{$ref:env.labels.get(v)};
   if(!root&&isPerson(v))return env.people.has(v)?{$p:v.pid}:{$p:v.pid,detached:true,at};
   if(env.seen.has(v))return{$cycle:env.seen.get(v)};
   env.seen.set(v,at);
   try{
   if(v instanceof Date)return{$date:v.toISOString()};
   if(typeof Node!=='undefined'&&v instanceof Node)return{$dom:v.nodeName};
   if(v instanceof Map){const items=[...v].map(([k,x])=>[plainify(k,at+'.<key>'),plainify(x,at+'.<'+(isPerson(k)?k.pid:'value')+'>')]);items.sort((a,b)=>JSON.stringify(a[0])<JSON.stringify(b[0])?-1:1);return{$map:items};}
   if(v instanceof Set){const items=[...v].map((x,i)=>plainify(x,at+'.<'+i+'>'));items.sort((a,b)=>JSON.stringify(a)<JSON.stringify(b)?-1:1);return{$set:items};}
   if(Array.isArray(v))return v.map((x,i)=>{const r=plainify(x,at+'.'+i);return r===undefined?null:r;});
   const out={};for(const key of Object.keys(v).sort()){const r=plainify(v[key],at+'.'+key);if(r!==undefined)out[key]=r;}return out;
   }finally{env.seen.delete(v);}
  };
  return plainify;
 };
 R.plain=value=>makePlainify({labels:new Map(),people:new Set(),seen:new Map(),count:0})(value,'root',true);
 R.capture=({withMaps=true}={})=>{
  const m=match,env={labels:new Map(),people:new Set([...m.people,...(m.exitedPeople||[])]),seen:new Map(),count:0};
  const named=[['match',m],['flight',m.flight],['rebound',m.rebound],['setPiece',m.setPiece],['kickoff',m.kickoff],['throwIn',m.throwIn],['slide',m.slide],['goalScene',m.goalScene],['ball',m.ball],['attackFlow',m.attackFlow],['si',m.si]];
  for(const [name,value] of named)if(value&&typeof value==='object'&&!env.labels.has(value))env.labels.set(value,name);
  const plainify=makePlainify(env);
  // Unterobjekte von match, die einen Namen tragen (attackFlow, si, setPiece, kickoff, throwIn, rebound ...), werden hier einmal voll
  // erfasst; überall sonst erscheinen sie als {$ref:name}. Ohne diese Ausnahme blieben gerade attackFlow und match.si ungeprüft.
  const matchTree={};
  for(const key of Object.keys(m).sort()){
   if(key==='people'||key==='exitedPeople')continue;
   const value=m[key],canonical=value&&typeof value==='object'&&env.labels.get(value)===key,r=plainify(value,'match.'+key,canonical);
   if(r!==undefined)matchTree[key]=r;
  }
  const tree={
   match:matchTree,
   people:m.people.map((p,i)=>plainify(p,'people.'+i,true)),
   exitedPeople:(m.exitedPeople||[]).map((p,i)=>plainify(p,'exitedPeople.'+i,true)),
   clock:v102Clock(m),
   ui:{log:document.querySelector('#log')?.innerHTML??null,event:document.querySelector('#event')?.textContent??null},
   state:{minute:R.state.minute,score:[...R.state.score],phase:R.state.phase},
  };
  if(withMaps){
   const keys=[['match',m],['flight',m.flight],['rebound',m.rebound],['setPiece',m.setPiece],['kickoff',m.kickoff],['throwIn',m.throwIn],['slide',m.slide],['goalScene',m.goalScene],['ball',m.ball],['attackFlow',m.attackFlow],['owner',m.owner],...m.people.map(p=>['p:'+p.pid,p])].filter(([,v])=>v&&typeof v==='object');
   const maps={};
   for(const name of R.weakMapNames){
    const map=globalValue(name);if(!map||typeof map.get!=='function')continue;
    const presenceOnly=['flight','ui','derived'].includes(R.mapKinds[name]),entries={};
    for(const [label,key] of keys){let value;try{value=map.get(key);}catch{value=undefined;}if(value===undefined)continue;entries[label]=presenceOnly?{$present:true}:plainify(value,'maps.'+name+'.'+label,true);}
    if(Object.keys(entries).length)maps[name]=entries;
   }
   tree.maps=maps;
  }
  return tree;
 };

 // ----- Rundlauf Snapshot -> JSON -> Restore (restore:false = nur der Snapshot, für den Zwillingslauf) -----
 R.rngState=()=>({rng,draws});
 R.setRngState=value=>{rng=value.rng;draws=value.draws;};
 // Frische Seite = geschlossene App: die gespeicherte Karriere (JSON) laden und die Partie wie beim Start der App anzeigen.
 R.adopt=text=>{
  const career=JSON.parse(text),state=career.world.activeMatch.state;
  v61CurrentCareer=career;state.phase='paused';match=null;v65WorldActive=null;v98View='2d';clearInterval(v65WorldFrame);v103CanReplay=()=>false;draw=()=>{};
  v65Show(v65Context());clearInterval(v65WorldFrame);v65LastSaved=Infinity;
  R.state=state;R.ticks=0;
  return{markers:R.markerSet(match)};
 };
 R.checkpoint=({restore=true,exportCareer=false}={})=>{
  const ctx=v65Context(),state=ctx.state;
  if(match.flight||match.slide)return{skipped:'flight-or-slide'};
  const pre=restore||exportCareer?R.capture():null;
  if(v65Snapshot(ctx)!==true)throw Error('v65Snapshot meldete keinen Erfolg');
  v65LastSaved=Infinity;
  if(exportCareer){const text=JSON.stringify(state.physicalSnapshot);return{pre,post:R.capture(),careerJson:JSON.stringify(v61CurrentCareer),rngState:R.rngState(),snapshotBytes:text.length,time:match.elapsed,markersBefore:R.markerSet(match)};}
  if(!restore)return{time:match.elapsed};
  const post=R.capture();
  const text=JSON.stringify(state.physicalSnapshot);
  // Karrierezustand der Partie (Wechsel, Taktik, Belastung ...) geht ebenfalls durch JSON: vorher/nachher vergleichen
  const stateOnly=Object.fromEntries(Object.entries(state).filter(([k])=>k!=='physicalSnapshot')),stateBefore=R.plain(stateOnly),stateAfter=R.plain(JSON.parse(JSON.stringify(stateOnly)));
  state.physicalSnapshot=JSON.parse(text);
  const old=match;match=null;
  if(v65Restore(ctx)!==true)throw Error('v65Restore meldete keinen Erfolg');
  v65LastSaved=Infinity;
  const after=R.capture();
  return{pre,post,after,stateBefore,stateAfter,snapshotBytes:text.length,time:match.elapsed,markersBefore:R.markerSet(old),markersAfter:R.markerSet(match)};
 };

 // ----- Fortsetzung bis zum Abpfiff mit Invarianten -----
 R.nonFinite=()=>{
  const bad=[],m=match,num=(label,v)=>{if(typeof v==='number'&&!Number.isFinite(v))bad.push(label);};
  for(const p of m.people)for(const k of ['x','y','tx','ty','bx','by'])num(`${p.pid}.${k}`,p[k]);
  for(const p of m.people)if(p.offenseMotion)for(const k of ['vx','vy','heading'])num(`${p.pid}.offenseMotion.${k}`,p.offenseMotion[k]);
  num('ball.x',m.ball?.x);num('ball.y',m.ball?.y);num('elapsed',m.elapsed);for(const i of [0,1])num('score'+i,m.score[i]);
  if(m.rebound)for(const k of ['x','y','vx','vy'])num('rebound.'+k,m.rebound[k]);
  return bad;
 };
 R.signature=()=>{
  const m=match,f=n=>Math.round(n*1e6);
  let h=2166136261;const mix=n=>{h=Math.imul(h^(n|0),16777619)>>>0;};
  mix(f(m.elapsed));mix(f(m.ball.x));mix(f(m.ball.y));mix(m.score[0]*7+m.score[1]);mix(draws);mix(m.owner?m.owner.n+(m.owner.t?97:0):-1);
  for(const p of m.people){mix(f(p.x));mix(f(p.y));}
  return h;
 };
 R.continue=({maxTicks=12000,signatures=false}={})=>{
  const report={finished:false,ticks:0,error:null,nonFinite:[],stuck:null,sigs:[]};
  const holdKey=()=>`${match.setPiece?.type||''}/${match.setPiece?.phase||''}|${match.kickoff?.phase||''}|${match.throwIn?1:0}|${match.rebound?1:0}|${match.goalPause>0?1:0}`;
  let last=holdKey(),lastAt=0,lastElapsed=match.elapsed,still=0;
  try{
   while(!match.finished&&report.ticks<maxTicks){
    R.tick();report.ticks++;
    if(signatures)report.sigs.push(R.signature());
    const bad=R.nonFinite();if(bad.length){report.nonFinite=bad;break;}
    const key=holdKey();if(key!==last){last=key;lastAt=report.ticks;}
    else if(key!=='/||0|0|0'&&report.ticks-lastAt>1800&&R.state.phase!=='paused'){report.stuck={key,sinceTick:lastAt,elapsed:match.elapsed};break;}
    if(match.elapsed===lastElapsed&&!match.halftimePause&&R.state.phase==='live'){if(++still>1200){report.stuck={key:'clock',elapsed:match.elapsed};break;}}else{still=0;lastElapsed=match.elapsed;}
   }
  }catch(e){report.error=String(e&&e.stack||e).slice(0,600);}
  report.finished=!!match.finished;
  report.score=[...match.score];report.goals=match.goals.length;report.stateScore=[...R.state.score];
  report.shots=[...match.people,...(match.exitedPeople||[])].reduce((n,p)=>n+(p.stats.shots||0),0);
  report.draws=draws;
  return report;
 };
 for(const name of ['init','tick','advance','until','injectFoul','injectCorner','checkpoint','adopt','continue']){const inner=R[name];R[name]=(...args)=>R.seeded(()=>inner(...args));}
 return true;
}

// ---------------------------------------------------------------------------------------------------------------------
// Server und Browser
// ---------------------------------------------------------------------------------------------------------------------
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.glb':'model/gltf-binary','.wav':'audio/wav','.wasm':'application/wasm'};
function scanWeakMaps(dir){
 const names=new Set();
 for(const file of fs.readdirSync(dir).filter(f=>f.endsWith('.js'))){
  const text=fs.readFileSync(path.join(dir,file),'utf8');
  for(const hit of text.matchAll(/(?:^|[;,\s])(?:(?:const|let|var)\s+)?([A-Za-z_$][\w$]*)\s*=\s*new\s+WeakMap\s*\(/g))names.add(hit[1]);
 }
 return [...names].sort();
}
async function openRig({port=4256,headless=true,sourceRoot=root}={}){
 const {chromium}=require(PLAYWRIGHT),dir=path.join(sourceRoot,'dist');
 const server=http.createServer((req,res)=>{
  const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(!rel.startsWith('/source/')){res.writeHead(404);res.end();return;}
  const file=path.resolve(dir,rel.slice('/source/'.length));
  if(!file.startsWith(dir+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');fs.createReadStream(file).pipe(res);
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
 const browser=await chromium.launch({executablePath:EDGE,headless,args:['--disable-gpu']}),weakMapNames=scanWeakMaps(dir);
 const kinds=Object.fromEntries(Object.entries(WEAKMAPS).map(([k,v])=>[k,v.kind]));
 const rig={port,root:sourceRoot,weakMapNames,browser,
  async newPage(){
   const context=await browser.newContext(),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(`http://127.0.0.1:${port}/source/index.html?engine=browser&players=wave3`);
   await page.waitForFunction(()=>typeof v65CreateMatch==='function'&&typeof v61CreateCareer==='function',null,{timeout:120000});
   await page.evaluate(`(${pageLibrary})()`);
   await page.evaluate(({names,kinds})=>{R183.weakMapNames=names;R183.mapKinds=kinds;},{names:weakMapNames,kinds});
   return{page,context,errors};
  },
  runScene:spec=>runScene(rig,spec),
  runSweep:spec=>runSweep(rig,spec),
  async close(){await browser.close();await new Promise(resolve=>server.close(resolve));},
 };
 return rig;
}

// ---------------------------------------------------------------------------------------------------------------------
// Tiefer Vergleich zweier erfasster Zustände
// ---------------------------------------------------------------------------------------------------------------------
const short=v=>{const s=JSON.stringify(v);return s===undefined?'undefined':s.length>150?s.slice(0,147)+'...':s;};
function diffTrees(a,b,at='',out=[]){
 if(a===b)return out;
 const ta=a===null?'null':Array.isArray(a)?'array':typeof a,tb=b===null?'null':Array.isArray(b)?'array':typeof b;
 if(ta!==tb){out.push({path:at,kind:a===undefined?'added':b===undefined?'removed':'changed',before:short(a),after:short(b)});return out;}
 if(ta==='array'){
  for(let i=0;i<Math.max(a.length,b.length);i++){
   if(i>=a.length)out.push({path:`${at}[${i}]`,kind:'added',before:'undefined',after:short(b[i])});
   else if(i>=b.length)out.push({path:`${at}[${i}]`,kind:'removed',before:short(a[i]),after:'undefined'});
   else diffTrees(a[i],b[i],`${at}[${i}]`,out);
  }
  return out;
 }
 if(ta==='object'){
  for(const key of new Set([...Object.keys(a),...Object.keys(b)])){
   const p=at?`${at}.${key}`:key;
   if(!(key in a))out.push({path:p,kind:'added',before:'undefined',after:short(b[key])});
   else if(!(key in b))out.push({path:p,kind:'removed',before:short(a[key]),after:'undefined'});
   else diffTrees(a[key],b[key],p,out);
  }
  return out;
 }
 out.push({path:at,kind:'changed',before:short(a),after:short(b)});
 return out;
}
function collect(tree,pred,at='',out=[]){
 if(tree===null||typeof tree!=='object')return out;
 if(pred(tree))out.push({path:at,value:tree});
 if(Array.isArray(tree))tree.forEach((x,i)=>collect(x,pred,`${at}[${i}]`,out));
 else for(const [k,v]of Object.entries(tree))collect(v,pred,at?`${at}.${k}`:k,out);
 return out;
}
// Abgelaufene Einträge (z. B. Foulkontext nach 2,7 s, Luftball des vorigen Rückpralls) sind kein Spielzustand mehr.
function normalize(tree){
 const out={...tree,maps:{}};
 for(const [name,entries] of Object.entries(tree.maps||{})){
  const info=WEAKMAPS[name],kept={};
  for(const [label,entry] of Object.entries(entries))if(!info?.live||info.live(entry,tree))kept[label]=entry;
  if(Object.keys(kept).length)out.maps[name]=kept;
 }
 return out;
}
function compareSections(before,after){
 const a=normalize(before),b=normalize(after),out=[];
 for(const section of ['match','people','exitedPeople','clock','ui','state','maps'])for(const d of diffTrees(a[section],b[section],section))out.push({...d,section});
 return out;
}
function classify(differences,before,after){
 const accepted=[],failures=[];
 for(const d of differences){
  if(d.section==='maps'){
   const [,name,...restParts]=d.path.split('.'),info=WEAKMAPS[name],rest=restParts.join('.');
   if(!info){failures.push({...d,why:`unklassifizierte WeakMap ${name}: Eintrag fehlt oder weicht nach dem Restore ab (in WEAKMAPS einordnen oder in match.attackFlow/match.si speichern)`});continue;}
   if(info.kind==='gap'){accepted.push({...d,reason:`Restgrenze ${name}: ${info.note}`,gap:true});continue;}
   if(info.kind==='mirrored'){
    const entryBefore=Object.values(before.maps?.[name]||{})[0];
    if(info.mirror&&entryBefore&&!info.mirror(entryBefore,after))failures.push({...d,why:`${name}: Plain-Daten zum Wiederaufbau fehlen nach dem Restore`});
    else accepted.push({...d,reason:`mirrored ${name}: ${info.note}`});
    continue;
   }
   if(info.kind!=='persisted'){accepted.push({...d,reason:`${info.kind} ${name}: ${info.note}`});continue;}
   const ignored=(info.ignore||[]).find(r=>r.re.test(rest));
   if(ignored){accepted.push({...d,reason:`${name}: ${ignored.reason}`});continue;}
   failures.push({...d,why:`${name} (persisted) weicht nach dem Restore ab`});
   continue;
  }
  const rule=EXPECTED.find(r=>r.re.test(d.path)&&(r.side==='any'||(r.side==='after'&&d.kind==='added')||(r.side==='before'&&d.kind==='removed'))&&(!r.after||r.after===d.after));
  if(rule){accepted.push({...d,reason:rule.reason});continue;}
  failures.push({...d,why:d.section==='identity'?d.why:'Zustandsverlust oder -änderung'});
 }
 return{accepted,failures};
}
// Prüfungen, die auf den erfassten Bäumen beruhen (Restore-Rundlauf)
function evaluateCheckpoint(cp,result){
 const side=classify(compareSections(cp.pre,cp.post),cp.pre,cp.post);
 for(const d of side.failures)result.failures.push({...d,why:'v65Snapshot verändert den Live-Zustand: '+d.why});
 const round=classify(compareSections(cp.post,cp.after),cp.post,cp.after);
 result.accepted.push(...round.accepted);result.failures.push(...round.failures);
 for(const d of diffTrees(cp.markersBefore,cp.markersAfter,'markers'))result.failures.push({...d,section:'markers',why:'Marker nach Restore verändert (Restore darf Marker weder ergänzen noch entfernen)'});
 for(const d of diffTrees(cp.stateBefore,cp.stateAfter,'state.career'))result.failures.push({...d,section:'state',why:'Karrierezustand der Partie verliert beim JSON-Rundlauf'});
 for(const d of collect(cp.after.match,t=>t&&t.detached===true).concat(collect(cp.after.maps||{},t=>t&&t.detached===true).map(x=>({...x,path:'maps.'+x.path}))))
  result.failures.push({path:d.path,section:'identity',kind:'detached',before:'Referenz auf Spieler '+d.value.$p,after:'Kopie außerhalb von match.people',why:'Spielerreferenz nach Restore abgetrennt'});
}
function evaluateContinuation(cont,scoreBefore,errors,result,requireFinish=true){
 const fail=(kind,after,why)=>result.failures.push({path:'continuation',section:'continuation',kind,before:'',after,why});
 if(cont.error)fail('error',cont.error,'Fehler in der Fortsetzung');
 if(cont.nonFinite.length)fail('nonfinite',cont.nonFinite.slice(0,6).join(', '),'NaN/Infinity in der Fortsetzung');
 if(cont.stuck)fail('stuck',short(cont.stuck),'hängender Zustand in der Fortsetzung');
 if(requireFinish&&!cont.finished&&!cont.error&&!cont.nonFinite.length&&!cont.stuck)fail('unfinished',`${cont.ticks} Ticks`,'Partie nicht beendet');
 if(cont.finished&&cont.goals!==cont.score[0]+cont.score[1])fail('score',short({score:cont.score,goals:cont.goals}),'Torliste und Spielstand widersprechen sich');
 if(scoreBefore&&cont.score.some((n,i)=>n<scoreBefore[i]))fail('score',short({vorher:scoreBefore,nachher:cont.score}),'Spielstand nach dem Restore niedriger als davor');
 if(errors.length)fail('pageerror',errors.slice(0,3).join(' | '),'Seitenfehler');
}

// ---------------------------------------------------------------------------------------------------------------------
// Eine Szene ausführen
// ---------------------------------------------------------------------------------------------------------------------
async function prepareScene(rig,spec){
 const {setup='',size='standard',count=size==='large'?6:5,seed=0,markers='new',strength='mixed',trigger='R.quiet(m)',maxTicks=9000,afterTicks=0}=spec;
 const handle=await rig.newPage(),{page}=handle;
 const init=await page.evaluate(config=>R183.init(config),{seed,size,count,strength,markers});
 handle.init=init;
 if(setup)handle.setup=await page.evaluate(async src=>{const R=R183,value=await R.seeded(()=>new Function('m','state','ctx','R',src)(match,R.state,v65Context(),R));return value===undefined?null:value;},setup);
 handle.until=await page.evaluate(({src,maxTicks})=>R183.until(src,maxTicks),{src:trigger,maxTicks});
 if(handle.until.fired&&afterTicks)await page.evaluate(n=>R183.advance(n),afterTicks);
 return handle;
}
async function runScene(rig,spec){
 const {id,size='standard',seed=0,markers='new',continueTicks=12000,twin=false,explain=false}=spec;
 const result={id,size,seed,markers,pass:false,fired:false,failures:[],accepted:[],notes:[]};
 let handle=null,twinHandle=null,reloaded=null;
 try{
  handle=await prepareScene(rig,spec);
  result.group=handle.init.group;result.markersInitial=handle.init.markers;if(handle.setup!==undefined)result.setup=handle.setup;
  result.fired=handle.until.fired;result.trigger=handle.until;
  if(!result.fired){result.skipped=true;result.notes.push('Auslöser trat in dieser Partie nicht auf');return result;}
  let active=handle,cp;
  if(spec.reload){ // Neustart der App: Snapshot, Karriere als JSON, frische Seite, Anzeige der Partie
   const exported=await handle.page.evaluate(()=>R183.checkpoint({restore:false,exportCareer:true}));
   if(exported.skipped){result.skipped=true;result.notes.push('Snapshot nicht erlaubt: '+exported.skipped);return result;}
   reloaded=await rig.newPage();
   await reloaded.page.evaluate(value=>{R183.seedRandom(1);R183.setRngState(value);},exported.rngState);
   const adopted=await reloaded.page.evaluate(text=>R183.adopt(text),exported.careerJson);
   const after=await reloaded.page.evaluate(()=>R183.capture());
   cp={pre:exported.pre,post:exported.post,after,stateBefore:{},stateAfter:{},snapshotBytes:exported.snapshotBytes,time:exported.time,markersBefore:exported.markersBefore,markersAfter:adopted.markers};
   active=reloaded;
  }else{
   cp=await handle.page.evaluate(()=>R183.checkpoint());
   if(cp.skipped){result.skipped=true;result.notes.push('Snapshot nicht erlaubt: '+cp.skipped);return result;}
  }
  result.checkpoint={time:cp.time,snapshotBytes:cp.snapshotBytes,tick:handle.until.after};
  if(markers==='none'){ // Altpartie: nur Marker und Fortsetzung; Vollständigkeit wird für Altpartien nicht verlangt (keine Umrechnung)
   for(const d of diffTrees(cp.markersBefore,cp.markersAfter,'markers'))result.failures.push({...d,section:'markers',why:'Marker nach Restore verändert (Restore darf Marker weder ergänzen noch entfernen)'});
   result.afterTree=cp.after;
  }else evaluateCheckpoint(cp,result);
  const cont=await active.page.evaluate(({n,signatures})=>R183.continue({maxTicks:n,signatures}),{n:continueTicks,signatures:twin||explain||!!spec.keepSignatures});
  if(spec.keepSignatures)result.sigs=cont.sigs;
  result.continuation={finished:cont.finished,ticks:cont.ticks,score:cont.score,goals:cont.goals,shots:cont.shots,draws:cont.draws};
  evaluateContinuation(cont,cp.post.match.score,active.errors,result,spec.finish!==false);
  result.pass=!result.failures.length;
  if(twin||explain){
   if(spec.reload)twinHandle=handle; // die ursprüngliche Seite läuft ohne Restore weiter
   else{twinHandle=await prepareScene(rig,spec);await twinHandle.page.evaluate(()=>R183.checkpoint({restore:false}));}
   const other=await twinHandle.page.evaluate(({n})=>R183.continue({maxTicks:n,signatures:true}),{n:continueTicks});
   const n=Math.min(cont.sigs.length,other.sigs.length);let first=-1;
   for(let i=0;i<n;i++)if(cont.sigs[i]!==other.sigs[i]){first=i;break;}
   result.twin={identical:first<0&&cont.ticks===other.ticks&&cont.score.join()===other.score.join(),firstDivergentTick:first<0?null:first+1,ticks:[cont.ticks,other.ticks],score:[cont.score,other.score]};
   if(first>=0&&explain){
    const T=first+1,detail={};
    for(const [name,h,restore] of [['restored',handle,true],['twin',twinHandle,false]]){
     const h2=await prepareScene(rig,spec);
     await h2.page.evaluate(({restore})=>R183.checkpoint({restore}),{restore});
     await h2.page.evaluate(n=>R183.advance(n),Math.max(0,T-1));
     detail[name+'Before']=await h2.page.evaluate(()=>R183.capture());
     await h2.page.evaluate(()=>R183.advance(1));
     detail[name+'At']=await h2.page.evaluate(()=>R183.capture());
     await h2.context.close();
    }
    result.twin.hiddenStateDifferences=compareSections(detail.twinBefore,detail.restoredBefore).slice(0,40);
    result.twin.divergenceDifferences=compareSections(detail.twinAt,detail.restoredAt).slice(0,40);
   }
  }
 }catch(error){
  result.failures.push({path:'rig',section:'rig',kind:'exception',before:'',after:String(error.stack||error).slice(0,600),why:'Werkzeugfehler'});
 }finally{
  for(const h of [handle,twinHandle,reloaded])if(h)await h.context.close().catch(()=>{});
 }
 return result;
}
async function runFirstFiring(rig,spec,seeds,log=()=>{}){
 const tried=[];
 for(const seed of seeds){
  const r=await rig.runScene({...spec,seed});
  tried.push({seed,fired:r.fired});log(r);
  if(r.fired&&!r.skipped){r.seedsTried=tried;return r;}
 }
 return{id:spec.id,size:spec.size,markers:spec.markers,seed:null,pass:false,fired:false,failures:[{path:'szene',section:'rig',kind:'not-fired',before:'',after:`Auslöser in ${seeds.length} Partien nicht aufgetreten`,why:'Szene nicht erreicht'}],accepted:[],seedsTried:tried};
}

// Stresstest: eine Partie, alle `every` Ticks Snapshot -> JSON -> Restore in Kette (beliebige Zeitpunkte), am Ende bis zum Abpfiff.
async function runSweep(rig,{size='standard',seed=0,every=120,markers='new',continueTicks=12000,count=size==='large'?6:5,twin=false,explain=false}){
 const result={id:'sweep',size,seed,markers,pass:false,checkpoints:0,failures:[],accepted:[],notes:[]};
 const run=async restore=>{
  const {page,context,errors}=await rig.newPage(),sigs=[],phases=new Set(),checkpointBlocks=[];
  try{
   await page.evaluate(config=>R183.init(config),{seed,size,count,markers});
   for(;;){
    const r=await page.evaluate(({every})=>{R183.advance(every);if(match.finished)return{finished:true,sig:R183.signature()};const u=R183.until('true',400);return{finished:false,fired:u.fired,sig:R183.signature(),phase:[match.setPiece?.type,match.kickoff&&'kickoff',match.throwIn&&'throwIn',match.rebound&&'loose',match.owner&&'owner',match.goalPause>0&&'goal',match.halftimePause>0&&'half'].filter(Boolean).join('+')||'-'};},{every});
    sigs.push(r.sig);
    if(r.finished)break;
    if(!r.fired)continue;
    const cp=await page.evaluate(restore=>R183.checkpoint({restore}),restore);
    if(!cp.skipped)checkpointBlocks.push(sigs.length-1);
    if(cp.skipped||!restore)continue;
    result.checkpoints++;phases.add(r.phase);
    const sub={failures:[],accepted:[]};
    if(markers==='none')for(const d of diffTrees(cp.markersBefore,cp.markersAfter,'markers'))sub.failures.push({...d,section:'markers',why:'Marker nach Restore verändert'});
    else evaluateCheckpoint(cp,sub);
    for(const f of sub.failures)result.failures.push({...f,at:cp.time,phase:r.phase});
    result.accepted.push(...sub.accepted);
   }
   const cont=await page.evaluate(n=>R183.continue({maxTicks:n}),continueTicks);
   return{cont,errors,sigs,phases,draws:cont.draws,checkpointBlocks};
  }finally{await context.close().catch(()=>{});}
 };
 try{
  const main=await run(true);
  result.continuation={finished:main.cont.finished,ticks:main.cont.ticks,score:main.cont.score,goals:main.cont.goals};
  evaluateContinuation(main.cont,null,main.errors,result);
  result.phases=[...main.phases];
  if(twin){
   // Dieselbe Partie mit denselben Snapshots, aber ohne Restore: der Verlauf muss Block für Block gleich sein.
   const other=await run(false),first=main.sigs.findIndex((x,i)=>x!==other.sigs[i]);
   result.twin={identical:first<0&&main.sigs.length===other.sigs.length&&main.draws===other.draws,firstDivergentBlock:first<0?null:first,blocks:[main.sigs.length,other.sigs.length],draws:[main.draws,other.draws]};
   if(first>=0){const culprit=[...main.checkpointBlocks].reverse().find(b=>b<first);result.twin.culpritBlock=culprit??null;if(explain&&culprit!==undefined)result.twin.explained=await explainSweep(rig,{size,seed,every,markers,count},culprit);}
  }
  result.pass=!result.failures.length;
 }catch(error){
  result.failures.push({path:'rig',section:'rig',kind:'exception',before:'',after:String(error.stack||error).slice(0,600),why:'Werkzeugfehler'});
 }
 return result;
}

// Ursache einer Abweichung im Kettenlauf: die Kette bis zum auffälligen Speicherpunkt wiederholen (beide Läufe bitgleich), dort
// einmal mit und einmal ohne Restore fortsetzen, den ersten abweichenden Tick suchen und beide Zustände davor/dabei vergleichen.
async function explainSweep(rig,{size,seed,every,markers,count},culprit){
 const replay=async restore=>{
  const handle=await rig.newPage(),{page}=handle;
  await page.evaluate(config=>R183.init(config),{seed,size,count,markers});
  for(let i=0;;i++){
   const r=await page.evaluate(({every})=>{R183.advance(every);if(match.finished)return{finished:true};const u=R183.until('true',400);return{finished:false,fired:u.fired,phase:[match.setPiece?.type,match.kickoff&&'kickoff',match.throwIn&&'throwIn',match.rebound&&'loose',match.owner&&'owner',match.goalPause>0&&'goal',match.halftimePause>0&&'half'].filter(Boolean).join('+')||'-'};},{every});
   if(r.finished)throw Error('Kette endete vor dem Speicherpunkt');
   if(i<culprit){if(r.fired)await page.evaluate(restore=>R183.checkpoint({restore}),restore);continue;}
   handle.phase=r.phase;
   handle.preTree=await page.evaluate(()=>R183.capture());
   const cp=await page.evaluate(restore=>R183.checkpoint({restore}),restore);
   handle.cp=cp;
   return handle;
  }
 };
 const out={};
 let a=null,b=null;
 try{
  a=await replay(true);b=await replay(false);
  out.phase=a.phase;
  const ticks=every*3,sa=[],sb=[];
  for(let i=0;i<ticks;i++){sa.push(await a.page.evaluate(()=>{R183.advance(1);return R183.signature();}));sb.push(await b.page.evaluate(()=>{R183.advance(1);return R183.signature();}));if(sa[i]!==sb[i]){out.firstDivergentTick=i+1;break;}}
  if(out.firstDivergentTick){
   // Zustände unmittelbar vor und bei der ersten Abweichung (beide Seiten wurden bereits um T Ticks vorgerückt): neu aufsetzen
   const T=out.firstDivergentTick,capture=async(restore,advance)=>{const h=await replay(restore);try{await h.page.evaluate(n=>R183.advance(n),advance);return await h.page.evaluate(()=>R183.capture());}finally{await h.context.close();}};
   const [restoredBefore,twinBefore,restoredAt,twinAt]=[await capture(true,T-1),await capture(false,T-1),await capture(true,T),await capture(false,T)];
   out.hiddenStateDifferences=compareSections(twinBefore,restoredBefore).slice(0,40);
   out.divergenceDifferences=compareSections(twinAt,restoredAt).slice(0,40);
  }else out.note='Innerhalb von '+ticks+' Ticks nach dem Speicherpunkt keine Abweichung; die Ursache liegt früher oder später';
 }finally{for(const h of [a,b])if(h)await h.context.close().catch(()=>{});}
 return out;
}

// ---------------------------------------------------------------------------------------------------------------------
// Szenenkatalog. trigger = JS-Ausdruck (m = match, state, ctx, R), setup optional (Szene erzwingen).
// Welle-1-Pakete beschreiben eigene Szenen in ihren Tests über rig.runScene({...}); der Katalog bleibt unverändert.
// ---------------------------------------------------------------------------------------------------------------------
const OPEN='m.owner&&R.quiet(m)';
const WECHSEL=`R.until('m.owner&&R.quiet(m)&&m.elapsed>=14',3000);const side=ctx.ownSide,out=v64Active(state,side).find(pid=>state.roles[pid]!=='gk'),incoming=v64Bench(state,side).find(pid=>!state.exited.includes(pid)&&v64Player(ctx.career,ctx.fixture,side,pid)&&!v64Player(ctx.career,ctx.fixture,side,pid).keeper);v64QueueSubstitution(ctx.career,ctx.fixture,state,side,out,incoming);R.injectFreeKick();return {out,incoming};`;
const RAUMPASS_AUFGENOMMEN=`const hit=R.until('(()=>{const p=typeof v150SpacePasses!=="undefined"&&v150SpacePasses.get(m);return !!p&&!!p.rebound&&m.rebound===p.rebound&&!m.owner;})()',9000);if(!hit.fired)return hit;const plan=v150SpacePasses.get(m),taker=m.people.find(p=>p.t!==plan.passer.t&&!p.keeper);m.owner=taker;m.rebound=null;m.next=m.elapsed+.5;return {taker:taker.pid};`;
const WARM="R.until('m.owner&&R.quiet(m)&&m.elapsed>=14',3000);";
const SCENES=[
 {id:'anpfiff',title:'Anpfiff (Bereit zum Anpfiff)',trigger:'m.kickoff&&m.elapsed===0'},
 {id:'offenes-spiel',title:'offenes Spiel mit Ballführer',trigger:OPEN+'&&m.elapsed>=14'},
 {id:'absichten',title:'laufende Absichten/Laufziele (attackFlow.intents)',trigger:OPEN+'&&Object.keys(m.attackFlow.intents).length>=2&&m.elapsed>=14'},
 {id:'raumpass',title:'laufender Raumpass (lose gelandet, spacePassIntent)',trigger:'(()=>{const p=typeof v150SpacePasses!=="undefined"&&v150SpacePasses.get(m);return !!p&&!!p.rebound&&m.rebound===p.rebound&&!m.owner;})()'},
 {id:'nachsetzen',title:'Verteidiger setzt nach (pursuitReads, nur Partien mit Marker)',onlyNew:true,trigger:OPEN+'&&m.attackFlow.pursuitReads&&Object.keys(m.attackFlow.pursuitReads).length>=1&&m.elapsed>=14'},
 {id:'raumpass-aufgenommen',title:'Raumpass: Ball in diesem Tick anders genommen, Plan noch offen (erzwungen)',setup:RAUMPASS_AUFGENOMMEN,trigger:'!!m.spacePassIntent&&!!m.owner&&!!v150SpacePasses.get(m)'},
 {id:'freier-ball',title:'freier Ball (Abpraller/Fehlpass) mit Verfolgern',trigger:'m.rebound&&!m.owner&&!m.setPiece&&!m.kickoff&&!m.throwIn&&!m.goalPause&&m.elapsed>=14'},
 {id:'luftball',title:'Ball in der Luft/gelandet (v124AirBalls)',trigger:'m.rebound&&!m.owner&&typeof v124AirBalls!=="undefined"&&!!v124AirBalls.get(m)&&v124AirBalls.get(m).rebound===m.rebound'},
 {id:'freistoss',title:'Freistoß-Vorbereitung (Foulkontext, Mauer, Plan)',trigger:'m.setPiece?.type==="freeKick"&&m.setPiece.phase==="waiting"'},
 {id:'freistoss-sofort',title:'Freistoß unmittelbar nach dem Foul (Sperrfenster 2,7 s)',trigger:'m.setPiece?.type==="freeKick"&&typeof v113Fouls!=="undefined"&&!!v113Fouls.get(m)&&v102Clock(m)-v113Fouls.get(m).at<1.0'},
 {id:'ecke',title:'Eckball-Vorbereitung (erzwungen über v50Corner)',setup:WARM+'return R.injectCorner();',trigger:'m.setPiece?.type==="corner"&&m.setPiece.phase==="waiting"'},
 {id:'abseits',title:'Abseitspfiff (Standbild, danach Freistoß)',maxSeeds:14,trigger:'m.setPiece?.type==="offside"'},
 {id:'einwurf',title:'Einwurf',trigger:'m.throwIn&&!m.owner'},
 {id:'kurz-vor-halbzeit',title:'kurz vor der Halbzeit (offenes Spiel)',trigger:OPEN+'&&m.elapsed>=m.firstHalfEnd-2'},
 {id:'halbzeitpause',title:'Halbzeitpause (pausiert)',trigger:'m.halftimePause>0'},
 {id:'torpause',title:'Tor und Torpause',trigger:'m.goalPause>0'},
 {id:'anstoss-nach-tor',title:'Anstoß nach Tor',trigger:'m.kickoff&&m.goals.length>0&&m.elapsed>1'},
 {id:'torwart-haelt',title:'Torwart hält den Ball fest (Abwurf-Wartezustand)',trigger:'m.owner?.keeper&&!m.flight&&typeof v99Actions!=="undefined"&&v99Actions.get(m)?.kicks.get(m.owner.pid)?.phase==="waiting"'},
 {id:'wechsel',title:'Spielerwechsel während einer Unterbrechung (exitedPeople)',setup:WECHSEL,trigger:'m.exitedPeople.length>0&&m.setPiece?.type==="freeKick"'},
 {id:'nach-wechsel',title:'offenes Spiel nach einem Wechsel',setup:WECHSEL,trigger:'m.exitedPeople.length>0&&m.owner&&R.quiet(m)'},
 {id:'elfmeter',title:'Elfmeter vor dem Schuss (erzwungen über v50Foul)',setup:WARM+'return R.injectPenalty();',trigger:'m.setPiece?.type==="penalty"&&m.setPiece.phase==="waiting"'},
 {id:'elfmeter-ergebnis',title:'Elfmeter nach dem Schuss (Ergebnisphase)',setup:WARM+'return R.injectPenalty();',trigger:'m.setPiece?.type==="penalty"&&m.setPiece.phase==="result"'},
 {id:'kurz-vor-abpfiff',title:'kurz vor dem Abpfiff',trigger:OPEN+'&&m.elapsed>=m.fullTimeEnd-2'},
 {id:'paketzustand',title:'synthetischer Paketzustand in attackFlow/match.si (inkl. Infinity)',setup:WARM+"m.attackFlow.siProbe={list:[1,2,{deep:true}],until:Infinity,since:-Infinity,text:'x',nested:{a:{b:[0,null,false]}}};m.si={revision:183,clockRate:1.1,packages:{clock:true,options:false},params:{finish:{aim:.7,cap:Infinity}}};return true;",trigger:'!!m.attackFlow.siProbe&&R.quiet(m)'},
];

// Negativkontrollen: das Werkzeug muss diese absichtlich fehlerhaften Zustände erkennen (sonst ist ein grüner Lauf wertlos).
const NEGATIVE_CONTROLS=[
 {id:'ctl-unklassifizierte-weakmap',expect:/unklassifizierte WeakMap __b19Probe/,setup:"window.__b19Probe=new WeakMap();R.weakMapNames.push('__b19Probe');__b19Probe.set(m,{pending:true});return true;"},
 {id:'ctl-map-im-paketzustand',expect:/Zustandsverlust/,setup:"m.attackFlow.siBad=new Map([['a',1]]);return true;"},
 {id:'ctl-spielerkopie-im-paketzustand',expect:/Spielerreferenz nach Restore abgetrennt/,setup:"m.attackFlow.siBad={carrier:m.people[3]};return true;"},
 {id:'ctl-funktion-im-paketzustand',expect:/Zustandsverlust/,setup:"m.attackFlow.siBad={callback:()=>1};return true;"},
 {id:'ctl-marker-ergaenzt',expect:/Zustandsverlust|Marker/,setup:"const original=v65Restore;window.__b19Restore=original;v65Restore=function(c){const ok=original(c);match.attackFlow.invented183=true;return ok};return true;"},
];
async function runNegativeControls(rig,{size='standard'}={}){
 const out=[];
 for(const control of NEGATIVE_CONTROLS){
  const r=await rig.runScene({id:control.id,size,seed:0,setup:WARM+control.setup,trigger:OPEN,continueTicks:240,finish:false});
  const matched=r.failures.some(f=>control.expect.test(f.why+' '+f.path));
  out.push({id:control.id,detected:!r.pass&&matched,failures:r.failures.length,first:r.failures[0]&&(r.failures[0].why+' | '+r.failures[0].path)});
 }
 return out;
}

// Test-Einstieg für Pakettests: führt Szenen (Liste von runScene-Angaben) aus und wirft bei jedem Fehler mit lesbarer Meldung.
//   const {checkScenes}=require('./check-restore-completeness-v183.cjs');
//   await checkScenes([{id:'si-finish-schuss',trigger:'...',setup:'...'}],{port:4258,sizes:['standard','large'],seeds:[0,1,2]});
// Eine Szene gilt als erreicht, wenn ihr Auslöser in einer der Seeds auftritt; tritt er nirgends auf, ist das ein Fehler.
async function checkScenes(specs,{port=4256,sizes=['standard','large'],seeds=[0,1,2,3],twin=false,rig=null}={}){
 const own=!rig;if(own)rig=await openRig({port});
 const results=[];
 try{
  for(const size of sizes)for(const spec of specs)results.push(await runFirstFiring(rig,{...spec,size,twin},seeds));
 }finally{if(own)await rig.close();}
 const bad=results.filter(r=>!r.pass);
 if(bad.length){
  const text=bad.map(r=>`${r.id}/${r.size}/seed ${r.seed}: `+r.failures.slice(0,5).map(f=>`${f.why} | ${f.path} | ${f.before} => ${f.after}`).join('\n    ')).join('\n');
  throw Object.assign(new Error('Restore-Vollständigkeit verletzt:\n'+text),{results});
 }
 return results;
}

module.exports={root,EXPECTED,WEAKMAPS,SCENES,NEGATIVE_CONTROLS,OPEN,WARM,openRig,runScene,runSweep,runFirstFiring,runNegativeControls,checkScenes,diffTrees,compareSections,pageLibrary,scanWeakMaps};

if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
async function main(){
 const args=Object.fromEntries(process.argv.slice(2).map(a=>{const [k,v]=a.replace(/^--/,'').split('=');return[k,v===undefined?true:v];}));
 if(args.list){for(const sc of SCENES)console.log(sc.id.padEnd(22),sc.title);return;}
 if(args.selftest){
  const rig=await openRig({port:+(args.port||4256)});
  try{
   const controls=await runNegativeControls(rig);for(const c of controls)console.log(c.detected?'ERKANNT':'NICHT ERKANNT',c.id.padEnd(36),c.first||'');
   const positive=await rig.runScene({id:'positiv',trigger:OPEN+'&&m.elapsed>=14',continueTicks:240,finish:false});console.log(positive.pass?'PASS':'FAIL','positive Kontrolle (unveränderter Zustand)');
   const ok=controls.every(c=>c.detected)&&positive.pass;console.log(JSON.stringify({pass:ok}));if(!ok)process.exitCode=1;
  }finally{await rig.close();}
  return;
 }
 const QUICK=['offenes-spiel','absichten','raumpass-aufgenommen','freistoss','ecke','halbzeitpause','torpause','wechsel','elfmeter','paketzustand'];
 const sizes=String(args.sizes||(args.quick?'standard':'standard,large')).split(','),seedCount=+(args.seeds||4),only=args.only?String(args.only).split(','):args.quick?QUICK:null,markerModes=args.markers==='both'?['new','none']:[args.markers||'new'];
 const out=args.out||path.join(root,'outputs/restore-v183/restore-completeness.json'),twin=!!args.twin||!!args.explain,explain=!!args.explain;
 const rig=await openRig({port:+(args.port||4256)}),rows=[],baseRig=args.base?await openRig({port:+(args.port||4256)+1,sourceRoot:path.resolve(String(args.base))}):null;
 const line=r=>{
  const gaps=r.accepted.filter(x=>x.gap).length;
  console.log(`${r.pass?'PASS':'FAIL'} ${String(r.markers).padEnd(4)} ${String(r.size).padEnd(8)} ${String(r.id).padEnd(18)} seed=${r.seed} t=${r.checkpoint?.time?.toFixed?.(1)} tick=${r.checkpoint?.tick} bytes=${r.checkpoint?.snapshotBytes} accepted=${r.accepted.length}${gaps?` (Restgrenzen ${gaps})`:''} fortsetzung=${r.continuation?.ticks}Ticks ${r.continuation?.score?.join(':')}${r.baseCompare?` ausgangsstand=${r.baseCompare.treeDifferences?'abweichend':'identisch'}/${r.baseCompare.continuationIdentical?'Verlauf identisch':'Verlauf abweichend'}`:''}${r.twin?` zwilling=${r.twin.identical?'identisch':'erster Unterschied Tick '+r.twin.firstDivergentTick+' ('+r.twin.ticks.join('/')+' Ticks)'}`:''} fehler=${r.failures.length}`);
  for(const f of r.failures.slice(0,args.verbose?400:5))console.log('    -',f.why,'|',f.path,'|',f.before,'=>',f.after);
  if(r.twin?.hiddenStateDifferences?.length){console.log('    verborgener Zustand vor dem ersten abweichenden Tick:');for(const d of r.twin.hiddenStateDifferences.slice(0,12))console.log('      ',d.path,d.before,'=>',d.after);}
 };
 try{
  if(args.sweep){
   for(const marker of markerModes)for(const size of sizes)for(let seed=+(args.seedStart||0);seed<+(args.seedStart||0)+ +args.sweep;seed++){
    const r=await rig.runSweep({size,seed,markers:marker,every:+(args.every||120),twin,explain});rows.push(r);
    const kinds=new Map();for(const f of r.failures){const k=f.why+' | '+f.path.replace(/\[\d+\]/g,'[]').split('.').slice(0,3).join('.');const e=kinds.get(k)||{n:0,f};e.n++;kinds.set(k,e);}
    console.log(`${r.pass?'PASS':'FAIL'} sweep ${marker} ${size} seed=${seed} checkpoints=${r.checkpoints} phasen=${(r.phases||[]).length} fortsetzung=${r.continuation?.ticks}Ticks ${r.continuation?.score?.join(':')}${r.twin?` zwilling=${r.twin.identical?'identisch':'erster Unterschied in Block '+r.twin.firstDivergentBlock}`:''} fehler=${r.failures.length}`);
    if(r.twin?.explained){const x=r.twin.explained;console.log('    Abweichung nach Speicherpunkt in Block',r.twin.culpritBlock,'phase=',x.phase,'erster abweichender Tick',x.firstDivergentTick??'-',x.note||'');for(const d of (x.hiddenStateDifferences||[]).slice(0,15))console.log('      verborgen:',d.path,d.before,'=>',d.after);for(const d of (x.divergenceDifferences||[]).slice(0,6))console.log('      Abweichung:',d.path,d.before,'=>',d.after);}
    for(const [k,e] of [...kinds].slice(0,12)){console.log('    -',e.n+'x',k);if(args.verbose)console.log('        z. B. bei',e.f.phase,'t='+e.f.at,e.f.path,'|',e.f.before,'=>',e.f.after);}
   }
  }else for(const marker of markerModes)for(const size of sizes)for(const scene of SCENES.filter(sc=>(!only||only.includes(sc.id))&&!(sc.onlyNew&&marker==='none'))){
   const spec={...scene,size,markers:marker,twin,explain,reload:!!args.reload,keepSignatures:marker==='none'&&!!baseRig},seeds=Array.from({length:Math.max(seedCount,scene.maxSeeds||0)},(_,i)=>i);
   const row=await runFirstFiring(rig,spec,seeds);
   if(baseRig&&marker==='none'&&row.fired&&!row.skipped){
    // Altpartien (ohne Marker) müssen mit dem Ausgangsstand identisch zurückkommen: gleicher Zustand nach Restore, gleiche Bytes, gleicher Verlauf.
    const b=await baseRig.runScene({...spec,seed:row.seed}),differences=compareSections(b.afterTree,row.afterTree);
    const identical={treeDifferences:differences.length,snapshotBytes:[b.checkpoint?.snapshotBytes,row.checkpoint.snapshotBytes],continuationIdentical:JSON.stringify(b.sigs)===JSON.stringify(row.sigs)&&b.continuation?.ticks===row.continuation.ticks};
    row.baseCompare=identical;
    if(identical.treeDifferences)row.failures.push({path:'base',section:'base',kind:'changed',before:'Ausgangsstand',after:short(differences.slice(0,3)),why:'Altpartie nach Restore anders als im Ausgangsstand'});
    if(identical.snapshotBytes[0]!==identical.snapshotBytes[1])row.failures.push({path:'base',section:'base',kind:'bytes',before:String(identical.snapshotBytes[0]),after:String(identical.snapshotBytes[1]),why:'Snapshot der Altpartie hat andere Größe als im Ausgangsstand'});
    if(!identical.continuationIdentical)row.failures.push({path:'base',section:'base',kind:'continuation',before:'Ausgangsstand',after:'abweichender Verlauf',why:'Fortsetzung der Altpartie weicht vom Ausgangsstand ab'});
    row.pass=!row.failures.length;
   }
   delete row.sigs;delete row.afterTree;
   rows.push(row);line(row);
  }
 }finally{await rig.close();if(baseRig)await baseRig.close();}
 const reasons=new Map();for(const r of rows)for(const a of r.accepted)reasons.set(a.reason,(reasons.get(a.reason)||new Set()).add(r.id));
 console.log('\nAkzeptierte (begründete) Abweichungen:');for(const [reason,ids] of reasons)console.log(' -',reason,`[${[...ids].join(', ')}]`);
 const report={sourceRoot:root,sizes,markerModes,pass:rows.every(r=>r.pass),
  scenes:rows.map(r=>({id:r.id,size:r.size,markers:r.markers,seed:r.seed,pass:r.pass,fired:r.fired,checkpoint:r.checkpoint,checkpoints:r.checkpoints,failures:r.failures,accepted:r.accepted.length,continuation:r.continuation,twin:r.twin,phases:r.phases,baseCompare:r.baseCompare})),
  acceptedReasons:[...reasons].map(([reason,ids])=>({reason,scenes:[...ids]}))};
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
 console.log(JSON.stringify({pass:report.pass,runs:rows.length,failed:rows.filter(r=>!r.pass).map(r=>`${r.id}/${r.size}/${r.markers}`),out}));
 if(!report.pass)process.exitCode=1;
}

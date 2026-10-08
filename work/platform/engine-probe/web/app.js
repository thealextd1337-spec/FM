(async function(){
'use strict';
const $=id=>document.getElementById(id),catalog=(await Promise.all(['/contacts/catalog.json','/demo/physics-catalog.json','/demo/play-catalog.json'].map(url=>fetch(url).then(r=>r.json())))).flat(),frame=$('frame');
let scenario=null,current=null,checkpoint=null,loadVersion=0,failure=null,loading=true;
const eventNames={'shot':'Schuss','shot-release':'Schuss abgegeben','goal':'Tor','contact':'Ballkontakt','catch':'Gefangen','parry':'Abgewehrt','block':'Geblockt','free':'Freier Ball','free-ball':'Freier Ball','possession':'Ballbesitz','out':'Aus','result':'Kontaktprüfung abgeschlossen','net-contact':'Netzkontakt','ground-contact':'Bodenkontakt','frame-contact':'Torrahmenkontakt','pass-release':'Pass abgegeben','missed-contact':'Kein Kontakt','pass':'Pass','received':'Angenommen','interception':'Abgefangen','keeper-permission':'Handberechtigung','hand-contact-disallowed':'Unerlaubter Handkontakt','offside':'Abseits','offside-check':'Abseitsprüfung'};
function eventText(e){
 const type=e.type||e.kind;let text=type==='result'&&scenario?.kind==='play'?'Spielzug abgeschlossen':eventNames[type]||type||'Kontakt';
 if(type==='keeper-permission'&&typeof e.allowed==='boolean')text+=' · '+(e.allowed?'Handkontakt erlaubt':'Handkontakt nicht erlaubt');
 if(type==='offside-check'&&typeof e.whistle==='boolean')text+=' · '+(e.whistle?'Abseitspfiff':'Kein Abseitspfiff');
 const actor=e.actorId||e.actorPid||e.receiverPid;if(actor)text+=' · '+(scenario?.kind==='play'?({'passer':'Passgeber','receiver':'Empfänger','defender':'Verteidiger','keeper':'Torwart'}[actor]||actor):actor);
 if(e.result!==undefined&&e.result!==null)text+=' · Ergebnis: '+(eventNames[e.result]||String(e.result));
 if(e.reason)text+=' · '+({'foot':'Fuß','hand':'Hand'}[e.reason]||e.reason);return text;
}
function expectedText(e){if(typeof e.allowed==='boolean')return e.allowed?'Handkontakt erlaubt':'Handkontakt nicht erlaubt';if(typeof e.whistle==='boolean')return e.whistle?'Abseitspfiff':'Kein Abseitspfiff';return eventText(e);}
const labels={'free-goal-keeper-left':'Schuss · Torwart links','free-goal-keeper-right':'Schuss · Torwart rechts','keeper-reachable':'Torwart · erreichbare Parade','keeper-unreachable':'Torwart · unerreichbare Parade','keeper-moving-away':'Torwart · läuft aus der Bahn','block-followup':'Abpraller · Block mit Folgekontakt','parry-followup':'Abpraller · Parade mit Folgekontakt','box-inside':'Torwartbereich · innen','box-boundary':'Torwartbereich · vordere Strafraumlinie','box-outside':'Torwartbereich · vor dem Strafraum','box-width-boundary':'Torwartbereich · seitlicher Rand','box-width-outside':'Torwartbereich · neben dem seitlichen Rand','native-box-mismatch':'Torwartbereich · größere Bestandsbox','opponent-box':'Torwartbereich · gegnerischer Strafraum','normal-origin':'Ballherkunft · Gegner','backpass':'Ballherkunft · eigener Rückpass','own-throw':'Ballherkunft · eigener Einwurf','control-no-exception':'Ballherkunft · Kontrolle ohne Ausnahme','clearance-exception':'Ballherkunft · Befreiungsschlag ausgeführt','attempt-exception':'Ballherkunft · Befreiungsschlag versucht','goal-post-edge':'Regelprobe · Ball am Pfostenrand','goal-crossbar-edge':'Regelprobe · Ball am Lattenrand','offside-uninvolved':'Abseits · unbeteiligter Spieler','offside-late-participation':'Abseits · spätere Beteiligung','opponent-contact-no-whistle':'Abseits · Gegnerkontakt ohne Pfiff','direct-throw-exempt':'Abseits · direkter Einwurf'};
const families=new Map();for(const s of catalog)if(!families.has(s.provenance.family))families.set(s.provenance.family,labels[s.provenance.family]||s.title);for(const [id,title]of families)$('scene').add(new Option(title,id));
function description(s){const involved=s.actors.filter(a=>a.action&&a.action!=='none');return s.kind==='physics'?'Ballphysikprobe · ohne Spielerkontakte · gleicher Demokern in beiden Engines':s.kind==='play'?'Durchgehender Spielzug · vorbereitete Aktionen und tatsächliche Fuß-/Handkontakte · gleicher Demokern in beiden Engines':s.title+(involved.length?' · Beteiligte: '+involved.map(a=>actorName(a.id,s)).join(', '):'')+(s.kind==='boundary'?' · Grenzregel, kein physischer Torrahmenaufprall':'');}
function actorName(id,s=scenario){const a=s?.actors?.find(a=>a.id===id);return a?(a.role==='keeper'?'Torwart':a.action==='receive'?'Empfänger':['block','intercept'].includes(a.action)?'Verteidiger':a.action==='shoot'?'Schütze':'Spieler')+' '+(a.team===0?'Gold':'Türkis')+' ('+id+')':id;}
$('engine').value=new URLSearchParams(location.search).get('engine')==='browser'?'browser':'unity';
function api(){return frame.contentWindow?.D6Probe;}
function reportError(e){failure=e.message;$('status').textContent='Fehler: '+e.message;}
async function invoke(method,...args){const target=api();if(!target||typeof target[method]!=='function')throw Error('Engine ist noch nicht bereit');const result=await target[method](...args);failure=null;return result;}
function selected(){return catalog.find(s=>s.provenance.family===$('scene').value&&s.geometry.fieldPlayers===Number($('players').value)&&s.geometry.attackDirection===Number($('direction').value)&&Math.abs(s.geometry.length-($('field').value==='large'?81.6:68))<.01);}
function controls(enabled){for(const id of ['start','pause','resume','reset','checkpoint','export'])$(id).disabled=!enabled;$('restore').disabled=!enabled||!checkpoint;}
async function load(){
 const version=++loadVersion,engine=$('engine').value,chosen=selected();
 loading=true;controls(false);checkpoint=null;current=null;failure=null;
 if(!chosen)throw Error('Szene fehlt');
 $('caption').textContent=families.get(chosen.provenance.family);$('sceneHelp').textContent=description(chosen);$('status').textContent='Engine und Figuren laden …';
 const src=engine==='unity'?'/demo/unity.html':'/native/index.html';
 if(frame.src!==new URL(src,location.href).href)frame.src=src;
 try{
  let target=null;
  for(let n=0;n<1200;n++){
   if(version!==loadVersion)return;
   const candidate=api();
   if(candidate?.ready&&(await candidate.snapshot())?.engine===engine){target=candidate;break;}
   await new Promise(resolve=>setTimeout(resolve,100));
  }
  if(version!==loadVersion)return;if(!target)throw Error('Laden dauert zu lange');
  await target.load({scenario:chosen,seed:617,followThroughSeconds:3});if(version!==loadVersion)return;
  await target.camera($('camera').value);if(version!==loadVersion)return;
  scenario=chosen;loading=false;controls(true);$('status').textContent='Bereit';
  $('expectation').textContent='Erwartung: '+expectedText(chosen.expected);await update();
 }catch(error){if(version!==loadVersion)return;loading=false;throw error;}
}
async function update(){
 if(loading)return;const version=loadVersion;let s;try{s=await api()?.snapshot();}catch{return;}
 if(!s||loading||version!==loadVersion||s.engine!==$('engine').value)return;current=s;
 $('time').textContent=Number(s.elapsed||0).toFixed(2)+' s';$('count').textContent=(s.actors||[]).length;$('score').textContent=(s.score||[0,0]).join(' : ');
 if(s.ready&&!failure)$('status').textContent=s.finished?'Szene abgeschlossen':s.following?(s.running?'Nachlauf':'Nachlauf pausiert'):s.running?'Läuft':'Pausiert / bereit';
 $('events').replaceChildren(...(s.events?.length?s.events.slice(-12):[{type:'Noch keine Ereignisse.'}]).map(e=>{const li=document.createElement('li');li.textContent=(e.tick!==undefined?'#'+e.tick+' · ':'')+eventText(e);return li;}));
 $('findings').replaceChildren(...(s.findings?.length?s.findings:['Vorläufige Vergleichsgeometrie; keine Android-Abnahme.']).map(f=>{const li=document.createElement('li');li.textContent=typeof f==='string'?f:(f.text||JSON.stringify(f));return li;}));
}
for(const id of ['load','engine'])$(id).addEventListener(id==='load'?'click':'change',()=>load().catch(reportError));
for(const id of ['start','pause','resume','reset'])$(id).onclick=()=>invoke(id).then(update).catch(reportError);
$('camera').onchange=()=>invoke('camera',$('camera').value).catch(reportError);
$('checkpoint').onclick=async()=>{try{checkpoint=await invoke('checkpoint');$('restore').disabled=false;$('status').textContent='Zwischenstand gemerkt';}catch(e){reportError(e);}};
$('restore').onclick=()=>invoke('restore',checkpoint).then(update).catch(reportError);
$('export').onclick=()=>{const blob=new Blob([JSON.stringify({schema:'d6-probe-1',timestamp:new Date().toISOString(),scenario:scenario.id,state:current,stats:api()?.stats()},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='doppel6-demostand.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
window.D6Probe={get ready(){return Boolean(!loading&&api()?.ready&&current?.ready);},load:async config=>{if(config?.scenario){scenario=config.scenario;await invoke('load',config);await update();return current;}return load();},start:()=>invoke('start'),pause:()=>invoke('pause'),resume:()=>invoke('resume'),reset:()=>invoke('reset'),camera:mode=>invoke('camera',mode),snapshot:()=>api()?.snapshot(),checkpoint:()=>invoke('checkpoint'),restore:c=>invoke('restore',c),stats:()=>api()?.stats()};
const link=new URLSearchParams(location.search);if(families.has(link.get('scene')))$('scene').value=link.get('scene');if(link.get('camera')==='contact')$('camera').value='contact';setInterval(update,150);await load();
})().catch(e=>{document.getElementById('status').textContent='Fehler: '+e.message;console.error(e);});

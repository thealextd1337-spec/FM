'use strict';

function escapeHTML(value){return String(value).replace(/[&"<>]/g,char=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[char]))}

const demoStyleNames={
 buzz:'Kurzrasur',side_part:'Seitenscheitel',medium_waves:'Mittellange Wellen',
 round_afro:'Runder Afro',cornrows:'Cornrows',textured_crop:'Strukturierter Kurzhaarschnitt',
 tight_curls:'Enge Locken',short_locs:'Kurze Locs',long_tied:'Zurückgebunden',bald:'Glatze'
};
const demoPoseNames={fist_chest:'Faust vor der Brust'};
const demoSkinNames={fair:'Hell',light:'Hell bis mittel',warm:'Warm',medium:'Mittel',brown:'Braun',deep:'Dunkel'};
const demoHairNames={black:'Schwarz','dark-brown':'Dunkelbraun',brown:'Braun',
 'light-brown':'Hellbraun',blond:'Blond',auburn:'Rotbraun',gray:'Grau'};
const demoSelect=document.getElementById('club');
const demoButton=document.getElementById('create');
const demoLeagueClubs=v61Catalog.filter(entry=>!entry.id.includes('-C'));
demoSelect.innerHTML=v61Countries.map(([code,country])=>
 `<optgroup label="${escapeHTML(country)}">${demoLeagueClubs.filter(entry=>entry.id.startsWith(`${code}-`)).map(entry=>
  `<option value="${escapeHTML(entry.id)}">${escapeHTML(entry.name)}</option>`).join('')}</optgroup>`).join('');
demoSelect.value='GER-2';

const demoSeed=`sprite-demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const demoCareer={world:{seed:demoSeed}};
let demoClub=null;
let demoCount=0;
let demoReference=false;
function demoReset(){
 const entry=demoLeagueClubs.find(item=>item.id===demoSelect.value);
 demoClub=v61ClubRecord(entry,demoSeed);
 demoCount=0;
 if(demoReference){demoShowReference();return}
 document.getElementById('result').hidden=true;
 document.getElementById('placeholder').hidden=false;
 demoButton.focus();
}
function demoDetail(label,value){return `<div class="detail"><small>${escapeHTML(label)}</small><strong>${escapeHTML(value)}</strong></div>`}
function demoCreate(){
 demoReference=false;
 const season=1+Math.floor(demoCount/3),slot=demoCount%3;
 const player=v67Youth(demoCareer,demoClub,season,slot);
 demoClub.youthPool.push(player);
 demoCount++;
 const kit=player.keeper?demoClub.kits.keepers[0]:demoClub.kits.home;
 const portrait=v82SpriteSVG(player,kit,'portrait');
 const goal=v82SpriteSVG(player,kit,'celebration');
 const pair=v88PairForAppearance(player.appearance);
 const flag=v79FlagSVG(player.nation);
 const flagMarkup=flag.startsWith('<svg')?flag:`<span class="nation-code" aria-hidden="true">${escapeHTML(player.nation)}</span>`;
 document.getElementById('crest').innerHTML=v61CrestSVG(demoClub);
 document.getElementById('name').textContent=player.name;
 document.getElementById('subtitle').innerHTML=`${flagMarkup}${escapeHTML(v79NationName(player.nation))} · ${escapeHTML(demoClub.name)} · ${player.age} Jahre · ${escapeHTML(player.type)}`;
 document.getElementById('serial').textContent=`Spieler ${demoCount}`;
 document.getElementById('portrait').innerHTML=portrait;
 document.getElementById('goal').innerHTML=goal;
 document.getElementById('details').innerHTML=[
  demoDetail('Frisur',demoStyleNames[player.appearance.hairstyle]),
  demoDetail('Haarfarbe',demoHairNames[player.appearance.hairColor]),
  demoDetail('Hautton',demoSkinNames[player.appearance.skinTone]),
  demoDetail('Jubelpose',demoPoseNames[player.appearance.pose])
 ].join('');
 document.getElementById('note').textContent=pair
  ?`Bildpaar ${pair.toUpperCase()} aus dem kuratierten Pool. Die Jubelpose gehört fest zu diesem Spieler.`
  :'Variables Sprite für diese Merkmalskombination. Die Jubelpose gehört fest zu diesem Spieler.';
 document.getElementById('placeholder').hidden=true;
 document.getElementById('result').hidden=false;
}
demoSelect.addEventListener('change',demoReset);
demoButton.addEventListener('click',demoCreate);
demoReset();

const referenceSkin=document.getElementById('reference-skin');
const referenceHair=document.getElementById('reference-hair');
referenceSkin.innerHTML=Object.entries(demoSkinNames).map(([key,name])=>`<option value="${key}">${name}</option>`).join('');
referenceHair.innerHTML=Object.entries(demoHairNames).map(([key,name])=>`<option value="${key}">${name}</option>`).join('');
referenceSkin.value='light';referenceHair.value='brown';
function demoShowReference(){
 demoReference=true;
 const presets={light:{main:'#edf0e7',pattern:'#193448'},dark:{main:'#243044',pattern:'#e9e4cb'},red:{main:'#ba293c',pattern:'#f2eddf'}};
 const kit=presets[document.getElementById('reference-kit').value]||demoClub.kits.home;
 const skin=document.getElementById('reference-skin').value;
 const hair=document.getElementById('reference-hair').value;
 document.getElementById('crest').innerHTML=v61CrestSVG(demoClub);
 document.getElementById('name').textContent='Referenzspieler';
 document.getElementById('subtitle').textContent='Stil- und Farbprüfung · zurückgebundene Haare · Faust vor der Brust';
 document.getElementById('serial').textContent='Referenz 92';
 document.getElementById('portrait').innerHTML=v92ReferenceSVG(kit,skin,hair,'portrait');
 document.getElementById('goal').innerHTML=v92ReferenceSVG(kit,skin,hair,'celebration');
 document.getElementById('details').innerHTML=[demoDetail('Frisur','Zurückgebunden'),demoDetail('Haarfarbe',demoHairNames[hair]),demoDetail('Hautton',demoSkinNames[skin]),demoDetail('Jubelpose','Faust vor der Brust')].join('');
 document.getElementById('note').textContent='Referenzentwurf mit festen Farbregionen. Noch keine Freigabe für den Spielerpool. „Neuen Spieler erstellen“ zeigt weiterhin die bisherige Spielererzeugung.';
 document.getElementById('placeholder').hidden=true;
 document.getElementById('result').hidden=false;
}
document.getElementById('reference-show').addEventListener('click',demoShowReference);
for(const id of ['reference-kit','reference-skin','reference-hair'])document.getElementById(id).addEventListener('change',demoShowReference);
demoShowReference();

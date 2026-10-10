'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const write = (name, text) => fs.writeFileSync(path.join(root, name), text);
const base = JSON.parse(read('docs/ligaexpansion-bestand48.json'));
const opening = JSON.parse(read('docs/ligaexpansion-saison1.json'));
const editorial = require('./ligaexpansion-editorial-data.cjs');
const countryNames = {ENG:'England',ESP:'Spanien',GER:'Deutschland',ITA:'Italien',FRA:'Frankreich',POR:'Portugal',NED:'Niederlande',AUT:'Österreich',BEL:'Belgien',TUR:'Türkei',SUI:'Schweiz',GRE:'Griechenland'};
const derbyPairs = {ENG:[['ENG-1','ENG-6']],ESP:[['ESP-2','ESP-5']],GER:[['GER-1','GER-6']],ITA:[['ITA-2','ITA-5']],FRA:[['FRA-1','FRA-6']],POR:[['POR-1','POR-3']],NED:[['NED-1','NED-8']],AUT:[['AUT-1','AUT-8']],BEL:[['BEL-2','BEL-8']],TUR:[['TUR-1','TUR-2'],['TUR-1','TUR-3']],SUI:[['SUI-3','SUI-8']],GRE:[['GRE-1','GRE-4'],['GRE-3','GRE-5']]};
const profileKeys = ['tradition','fans','youth','risk','patience','startingSquad'];
const clubs = base.clubs.map(c => ({...c, countryId:c.id.split('-')[0], playable:!c.id.includes('-C'), kind:c.id.includes('-C')?'cup':'league', palette:palette(c.colors+'/'+base.tertiaryColors[c.id]), origin:'preserved48', crestConcept:'Bestehendes eigenes Wappen erhalten', nameReview:'preserved; see ap02-name-review'}));
function palette(colors) {
 return colors.split('/').map(name => {name=name.trim();assert.ok(base.colorHex[name], 'Unbekannte Farbe '+name);return {name,hex:base.colorHex[name]};});
}
function add(id, name, city, colors, history, profile, crestConcept, role) {
 const p=profile.split('').map(Number);
 clubs.push({id,countryId:id.split('-')[0],kind:id.includes('-C')?'cup':'league',playable:!id.includes('-C'),city,name,colors,history,profile:p,palette:palette(colors),role,crestConcept,origin:'ap02-editorial',nameReview:'internal-screened; external-clearance-open'});
}
// Die Tabellenreihenfolge der bestehenden Entwürfe bestimmt nur die feste ID.
const draft = read('docs/ligaexpansion-vereinsvorschlaege.md');
const leagueIdentities = new Map();
let section='', count=0;
for (const line of draft.split(/\r?\n/)) {
 if(line.startsWith('## ')) {section=line.slice(3);count=0;}
 if(!line.startsWith('| '))continue;
 const cells=line.split('|').slice(1,-1).map(s=>s.trim());
 if(section==='Zwölf Ergänzungen für bestehende Ligen' && Object.values(countryNames).includes(cells[0])) {
  const code=Object.keys(countryNames).find(k=>countryNames[k]===cells[0]);
  leagueIdentities.set(`${code}-${7+count%2}`,{name:cells[1],city:cells[2],role:cells[3]});count++;
 } else {
  const code=Object.keys(countryNames).find(k=>countryNames[k]===section);
  if(code && cells[0]!=='Verein' && cells[0]!=='---')leagueIdentities.set(`${code}-${++count}`,{name:cells[0],city:cells[1],role:cells[2]});
 }
}
for(const line of editorial.league.split('\n')) {
 const [id,profile,colors,history,motif]=line.split('|');const identity=leagueIdentities.get(id);assert.ok(identity,'Identität fehlt '+id);
 add(id,identity.name,identity.city,colors,history,profile,motif,identity.role);
}
for(const line of editorial.cup.split('\n')) {
 const [id,city,name,profile,colors,history,motif]=line.split('|');
 add(id,name,city,colors,history,profile,motif,'Regionaler Pokalverein; '+history);
}
const greek = read('docs/griechenland-vereinsentwuerfe.md');
let greekSection='', cupCount=0;
for(const line of greek.split(/\r?\n/)) {
 if(line.startsWith('## '))greekSection=line.slice(3);
 if(!line.startsWith('| '))continue;
 const cells=line.split('|').slice(1,-1).map(s=>s.trim());if(cells[0]==='Verein'||cells[0]==='---')continue;
 if(greekSection==='Acht Ligavereine') {
  const n=clubs.filter(c=>c.countryId==='GRE'&&c.playable).length+1;
  const part=greek.split('### '+cells[0]+'\r\n')[1] || greek.split('### '+cells[0]+'\n')[1]; assert.ok(part,'Griechische Geschichte fehlt '+cells[0]);
  const history=part.trim().split(/\r?\n\r?\n/)[0];const motif=part.match(/- Wappenentwurf: (.*)/)[1].trim();
  add(`GRE-${n}`,cells[0],cells[1],cells[2].replace(/\s*\/\s*/g,'/'),history,editorial.greekProfiles[n-1],motif,cells[3]);
 } else if(greekSection==='Acht Pokalvereine') {
  const n=++cupCount;add(`GRE-C${n}`,cells[0],cells[1],cells[2].replace(/\s*\/\s*/g,'/'),editorial.greekCupHistories[n-1],editorial.greekProfiles[n+7],cells[4],cells[3]);
 }
}
const countries=opening.countryOrder.map(id=>({id,name:countryNames[id],tier:Object.keys(opening.countryTiers).find(t=>opening.countryTiers[t].includes(id)),derbys:derbyPairs[id]}));
clubs.sort((a,b)=>opening.countryOrder.indexOf(a.countryId)-opening.countryOrder.indexOf(b.countryId)||Number(!a.playable)-Number(!b.playable)||Number(a.id.match(/\d+$/)[0])-Number(b.id.match(/\d+$/)[0]));
const result={version:1,status:'ap02-editorial-catalog',scope:'new-expansion12-careers-only',profileKeys,profileScale:{min:1,max:5,meaning:'Relative Vereinsparameter; keine Spielerfähigkeiten. Startkader ist eine nationale Rolle, keine globale Rangfolge.'},countries,implementationContract:{league:{managerSelectable:true},cup:{managerSelectable:false,simulationOnly:true,financePolicy:'AP03 übernimmt geprüften aktuellen Pokalpfad; keine automatische Vollwirtschaft aus diesen Profilen.'},profiles:'AP03 erzeugt aus Parametern reale Kader, Erwartung, Ausbildung und Mittel; AP07 kalibriert. Keine direkten Torboni.',countryTiers:'Überlappende absolute Kader- und Wirtschaftsbereiche in AP03/AP07; kein Ergebnis- oder Torfaktor.',assets:'144 eigenständige Motiventwürfe; Grafiken/Trikotkontrast/Assetrechte sind AP03.',nameReview:'docs/ligaexpansion-ap02-namenspruefung.md'},clubs};
assert.equal(clubs.length,192);assert.equal(new Set(clubs.map(c=>c.id)).size,192);
write('docs/ligaexpansion-vereinskatalog.json',JSON.stringify(result,null,2)+'\n');
let md='# AP02: Vereinskatalog mit 192 Identitäten\n\nStand: 10. Oktober 2026. Redaktionelle Daten für neue Expansion-Karrieren; Anbindung an die Spielwelt in AP03. [Maschinenlesbarer Katalog](ligaexpansion-vereinskatalog.json), [Abnahme und Übergabe](ligaexpansion-ap02.md), [Namensprüfung](ligaexpansion-ap02-namenspruefung.md). Alle neuen Geschichten sind fiktiv. Die bisherigen 48 Identitäten und ihre sechs Profile bleiben erhalten.\n\nProfile folgen Tradition / Fans / Jugend / Risiko / Geduld / Startkader auf der internen Skala 1–5. Sie sind Vereinsparameter, keine Spielerfähigkeiten. Gleiche Startkaderstufe bedeutet eine ähnliche Rolle im jeweiligen Land; absolute Länderbereiche werden später überlappend kalibriert. Pokalvereine sind nicht als Managerstart auswählbar.\n';
for(const country of countries){md+=`\n## ${country.name} (${country.id}, Stufe ${country.tier})\n\nStadtderbys: ${country.derbys.map(pair=>pair.map(id=>clubs.find(c=>c.id===id).name).join(' – ')).join('; ')}. Redaktionelle Beziehungen ohne Spielbonus.\n`;
 for(const c of clubs.filter(c=>c.countryId===country.id))md+=`\n### ${c.id} · ${c.name}\n\n${c.city} · ${c.playable?'Ligaverein, spielbar':'KI-Pokalverein'} · ${c.palette.map(p=>p.name+' ('+p.hex+')').join(' / ')}\n\n${c.history}\n\nProfil: ${c.profile.join(' / ')}. ${c.role||'Unveränderte Bestandsrolle.'}\n\nWappen: ${c.crestConcept}. ${c.origin==='preserved48'?'Bestandsidentität unverändert.':'Eigenständiger Motiventwurf; Asseterstellung in AP03.'}\n`;
}
write('docs/ligaexpansion-vereinskatalog.md',md);
console.log(`AP02 erzeugt: ${countries.length} Länder, ${clubs.length} Vereine (${clubs.filter(c=>c.playable).length} Liga / ${clubs.filter(c=>!c.playable).length} Pokal).`);

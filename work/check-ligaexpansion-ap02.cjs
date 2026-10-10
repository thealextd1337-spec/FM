'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const data=read('docs/ligaexpansion-vereinskatalog.json'),base=read('docs/ligaexpansion-bestand48.json'),opening=read('docs/ligaexpansion-saison1.json');
const clubs=data.clubs,ids=new Map(clubs.map(c=>[c.id,c]));
assert.equal(clubs.length,192);assert.equal(ids.size,192);assert.equal(data.countries.length,12);
assert.equal(clubs.filter(c=>c.origin==='ap02-editorial'&&c.playable).length,60);
assert.equal(clubs.filter(c=>c.origin==='ap02-editorial'&&!c.playable).length,84);
assert.deepEqual(data.countries.map(c=>c.id),opening.countryOrder);
assert.deepEqual(data.profileKeys,['tradition','fans','youth','risk','patience','startingSquad']);
for(const old of base.clubs){const c=ids.get(old.id);assert.ok(c);for(const key of ['id','city','name','colors','history','profile'])assert.deepEqual(c[key],old[key],`Bestandsfeld geändert: ${old.id}.${key}`);assert.deepEqual(c.palette.map(p=>p.name),old.colors.split('/').concat(base.tertiaryColors[old.id]));}
const normalized=s=>s.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/ß/g,'ss').replace(/[^\p{L}\p{N}]/gu,'');
const names=new Set(),histories=new Set();
for(const c of clubs){assert.match(c.id,/^(ENG|ESP|GER|ITA|FRA|POR|NED|AUT|BEL|TUR|SUI|GRE)-(?:[1-8]|C[1-8])$/);assert.equal(c.countryId,c.id.split('-')[0]);assert.equal(c.playable,!c.id.includes('-C'));assert.equal(c.kind,c.playable?'league':'cup');assert.ok(c.city&&c.name&&c.history.length>40&&c.crestConcept);assert.equal(c.profile.length,6);assert.ok(c.profile.every(n=>Number.isInteger(n)&&n>=1&&n<=5));assert.equal(c.palette.length,3);assert.equal(new Set(c.palette.map(p=>p.hex)).size,3);for(const p of c.palette){assert.match(p.hex,/^#[0-9a-f]{6}$/);assert.equal(p.hex,base.colorHex[p.name]);}assert.ok(!names.has(normalized(c.name)),`Doppelname: ${c.name}`);names.add(normalized(c.name));assert.ok(!histories.has(c.history),`Doppelgeschichte: ${c.id}`);histories.add(c.history);}
const countries=[];
for(const country of data.countries)assert.ok(opening.countryTiers[country.tier]?.includes(country.id),'Länderstufe abweichend: '+country.id);
for(const country of data.countries){const local=clubs.filter(c=>c.countryId===country.id),league=local.filter(c=>c.playable),cup=local.filter(c=>!c.playable);assert.equal(local.length,16);assert.equal(league.length,8);assert.equal(cup.length,8);assert.ok(country.derbys.length);for(const pair of country.derbys){assert.equal(pair.length,2);assert.notEqual(pair[0],pair[1]);const a=ids.get(pair[0]),b=ids.get(pair[1]);assert.equal(a.countryId,country.id);assert.equal(b.countryId,country.id);assert.equal(a.city,b.city);assert.ok(a.playable&&b.playable);}const distinct=new Set(league.map(c=>c.profile.join(','))).size;assert.ok(distinct>=6,`Zu ähnliche Ligaprofile: ${country.id}`);assert.ok(Math.max(...league.map(c=>c.profile[2]))>=4);assert.ok(Math.max(...league.map(c=>c.profile[5]))-Math.min(...league.map(c=>c.profile[5]))>=2);countries.push({id:country.id,clubs:local.length,league:league.length,cup:cup.length,distinctLeagueProfiles:distinct,derbys:country.derbys.length});}
assert.equal(ids.get('AUT-5').name,'Innsbruck Sport');assert.equal(ids.get('AUT-3').name,'Schwarz Weiß Graz');assert.equal(ids.get('AUT-4').name,'Linzer SC Union');assert.equal(ids.get('AUT-8').name,'Wiener SC Fortuna');
for(const [country,start]of Object.entries(opening.nationalPreviousSeason)){for(const id of [...start.leagueOrder,start.cupWinner,start.cupFinalist])assert.equal(ids.get(id)?.countryId,country);for(const id of start.leagueOrder)assert.ok(ids.get(id).playable);}
for(const id of Object.values(opening.previousInternationalWinners))assert.ok(ids.has(id));
// Levenshtein-Vorprüfung aller 18.336 Namenspaare; Treffer sind Prüfhinweise.
function distance(a,b){let row=Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){const next=[i+1];for(let j=0;j<b.length;j++)next.push(Math.min(next[j]+1,row[j+1]+1,row[j]+Number(a[i]!==b[j])));row=next;}return row[b.length];}
const similarNames=[];let pairs=0;
for(let i=0;i<clubs.length;i++)for(let j=i+1;j<clubs.length;j++){pairs++;const a=normalized(clubs[i].name),b=normalized(clubs[j].name),ratio=1-distance(a,b)/Math.max(a.length,b.length);if(ratio>=.72)similarNames.push({a:clubs[i].id,b:clubs[j].id,similarity:Number(ratio.toFixed(3))});}
const report={status:'passed-editorial-structural-checks',clubs:192,preserved:48,newLeague:60,newCup:84,countries,namePairs:pairs,normalizedDuplicates:0,similarNames,externalNameClearance:'open; see docs/ligaexpansion-ap02-namenspruefung.md',runtimeIntegration:'AP03; not tested by this catalog check'};
fs.mkdirSync(path.join(root,'outputs/ligaexpansion-ap02'),{recursive:true});fs.writeFileSync(path.join(root,'outputs/ligaexpansion-ap02/check.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));

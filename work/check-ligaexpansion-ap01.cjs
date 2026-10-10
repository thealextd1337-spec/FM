'use strict';

// Verify the AP01 opening-data specification. This is not a runtime cup engine.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),data=JSON.parse(fs.readFileSync(path.join(root,'docs/ligaexpansion-saison1.json'),'utf8'));
const countries=data.countryOrder;
assert.equal(countries.length,12);assert.equal(new Set(countries).size,12);
assert.deepEqual(countries.slice(7,10),['AUT','BEL','TUR']);
assert.deepEqual(Object.values(data.countryTiers).flat().sort(),[...countries].sort());
for(const country of countries){
 const row=data.nationalPreviousSeason[country],league=Array.from({length:8},(_,i)=>`${country}-${i+1}`);
 assert.deepEqual([...row.leagueOrder].sort(),league.sort());
 assert.notEqual(row.cupWinner,row.cupFinalist);assert(row.cupWinner.startsWith(country+'-')&&row.cupFinalist.startsWith(country+'-'));
}
function qualify(previous=data.nationalPreviousSeason,titles=data.previousInternationalWinners){
 const crown=[titles.crown,titles.horizon];assert.notEqual(crown[0],crown[1]);
 const nationalSlots={};
 for(const country of countries){
  const row=previous[country],champion=row.leagueOrder[0],cupSlot=row.cupWinner===champion?row.cupFinalist:row.cupWinner;
  nationalSlots[country]=[];
  for(const intended of [champion,cupSlot]){
   if(crown.includes(intended))nationalSlots[country].push(null);
   else{crown.push(intended);nationalSlots[country].push(intended);}
  }
 }
 // Reserve all direct national qualifiers before allocating overlap replacements.
 for(const country of countries)for(let slot=0;slot<2;slot++)if(nationalSlots[country][slot]===null){
  const id=previous[country].leagueOrder.find(id=>!crown.includes(id));assert(id);crown.push(id);nationalSlots[country][slot]=id;
 }
 const horizon=[],byCountry={};
 for(const [index,country]of countries.entries()){
  byCountry[country]=previous[country].leagueOrder.filter(id=>!crown.includes(id)).slice(0,index<8?3:2);
  assert.equal(byCountry[country].length,index<8?3:2);horizon.push(...byCountry[country]);
 }
 assert.equal(crown.length,26);assert.equal(new Set(crown).size,26);
 assert.equal(horizon.length,32);assert.equal(new Set(horizon).size,32);assert(horizon.every(id=>!crown.includes(id)));
 return{crown,horizon,nationalSlots,horizonByCountry:byCountry};
}
const opening=qualify();
assert.deepEqual(opening.nationalSlots.ESP,['ESP-3','ESP-2']);
assert.deepEqual(opening.nationalSlots.FRA,['FRA-1','FRA-2']);
assert.deepEqual(opening.horizonByCountry.AUT,['AUT-1','AUT-4','AUT-5']);
assert.deepEqual(opening.horizonByCountry.POR,['POR-3','POR-7','POR-5']);
// Every pair of distinct possible previous winners, including cup-only clubs.
const clubIds=countries.flatMap(country=>Array.from({length:8},(_,i)=>[`${country}-${i+1}`,`${country}-C${i+1}`]).flat());
let cases=0;
for(let a=0;a<clubIds.length;a++)for(let b=a+1;b<clubIds.length;b++){qualify(data.nationalPreviousSeason,{crown:clubIds[a],horizon:clubIds[b]});cases++;}
// Double and cup-only winner/finalist cases for every country.
for(const country of countries){
 for(const changes of [{cupWinner:`${country}-C1`,cupFinalist:`${country}-C2`},{cupWinner:data.nationalPreviousSeason[country].leagueOrder[0],cupFinalist:`${country}-C1`}]){
  const previous=structuredClone(data.nationalPreviousSeason);Object.assign(previous[country],changes);qualify(previous);cases++;
 }
}
assert.equal(13*3+13*2,26*5/2);
assert.deepEqual(data.rules.horizon.nationalDuelsForbiddenRounds,['R32','R16']);
// At most three entrants per country: protected rounds with 32/16 teams
// always admit a matching across countries (largest group <= half the field).
assert(Math.max(...Object.values(opening.horizonByCountry).map(ids=>ids.length))<=16/2);
for(const key of ['playedMatches','countrySeasonValues','careerHonours','openingPayments'])assert.deepEqual(data.historyPolicy[key],[]);
const out=path.join(root,'outputs','ligaexpansion-ap01');fs.mkdirSync(out,{recursive:true});
const report={checkedAt:new Date().toISOString(),status:'passed-specification-only',scenarioCount:cases,countries,opening,historyPolicy:data.historyPolicy};
fs.writeFileSync(path.join(out,'qualification.json'),JSON.stringify(report,null,2)+'\n');
console.log(`AP01: Startdaten, 26/32 eindeutige Teilnehmer, Österreich Rang 8, ${cases} Qualifikationsfälle und leere historische Buchungen geprüft.`);

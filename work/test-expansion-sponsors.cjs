'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {harness}=require('./world-expansion-harness-v167.cjs');
const {context,call}=harness();
vm.runInContext('globalThis.escapeHTML=v161Escape;function v66Own(c){return v66Club(c,c.manager.managedClubId)}',context);
function loadFunction(file,name){const s=fs.readFileSync('dist/'+file,'utf8'),start=s.indexOf('function '+name+'('),end=s.indexOf('\nfunction ',start+1);assert(start>=0);vm.runInContext(s.slice(start,end<0?s.length:end),context);}
loadFunction('world-market-ui-v66.js','v66Credits');loadFunction('world-market-ui-v66.js','v66SponsorHTML');
vm.runInContext('function v172T(de,en){return de}function v172E(s){return v161Escape(s)}',context);
loadFunction('world-expansion-interface-v172.js','v172Controls');
const assets=JSON.parse(fs.readFileSync('docs/wappen-expansion/sponsors/manifest.json','utf8'));
assert.equal(Object.keys(assets).length,36);
const bundle=fs.readFileSync('outputs/index.html','utf8');
for(const [id,asset] of Object.entries(assets)){
 const country=id.split('-')[1].toUpperCase(),offer={brandId:id,name:asset.name};
 for(const compact of [false,true]){
  const rendered=call('v66SponsorLogoSVG',country,offer,compact),path=compact?asset.symbol:asset.image;
  assert(rendered.includes(path));assert(rendered.includes('data-v66-brand="'+id+'"'));
  const data=fs.readFileSync('dist/'+path);assert.equal(data.subarray(1,4).toString(),'PNG');
  assert.equal(data.readUInt32BE(16),compact?192:480);assert.equal(data.readUInt32BE(20),compact?192:180);
  assert(bundle.includes(data.toString('base64')));
 }
}
const c=call('v167CreateCareer','AUT-5','sponsor-bonus-proof','QA'),before=JSON.stringify(c),club=call('v66Own',c);
const html=call('v172Controls',c);
assert.equal((html.match(/data-v166-sponsor=/g)||[]).length,3);assert(!html.includes('data-v66-sponsor='));
for(const offer of club.sponsors){
 for(const goal of offer.goals){assert(html.includes(call('v66SponsorGoalLabel',goal)));assert(html.includes(call('v66Credits',goal.bonus)));}
 const total=offer.fixed+offer.goals.reduce((sum,g)=>sum+g.bonus,0);assert(html.includes(call('v66Credits',total)));
}
assert(html.includes('am Saisonende einzeln bezahlt'));assert.equal(JSON.stringify(c),before);
console.log('36 sponsor wordmarks/symbols, offline assets, all six bonus conditions, amounts, totals, payout timing, actions and unchanged offers passed.');

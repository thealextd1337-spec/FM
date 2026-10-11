'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {harness}=require('./world-expansion-harness-v167.cjs');
const {run,call,context}=harness();
run('trophy-art-v119.js');
vm.runInContext(`globalThis.escapeHTML=v161Escape;
function v66Own(c){return v66Club(c,c.manager.managedClubId)}
function v68CompetitionSummaryHTML(){return 'legacy summary'}
function v68ClubButton(c,id){return v66Club(c,id).name}`,context);
for(const file of ['world-expansion-ui-v166.js','world-expansion-stories-v170.js','world-expansion-office-v170.js','world-expansion-awards-v171.js','world-expansion-interface-v172.js','world-expansion-flutlicht-v175.js'])run(file);
for(const club of ['AUT-5','BEL-1']){
 const c=call('v167CreateCareer',club,'restored-ui-'+club,'QA'),before=JSON.stringify(c);
 const page=call('v175CompetitionPage',c);
 assert(page.includes('data-fl-expansion-section="crown"'));
 assert(page.includes('data-fl-expansion-section="horizon"'));
 assert(page.includes('data-fl-expansion-section="ranking"'));
 const stats=call('v175Statistics',c);assert(stats.includes('Crown Cup')&&stats.includes('Horizon Cup'));
 assert.equal(JSON.stringify(c),before,'Reading views must not change career data');
 assert(call('v61ValidateCareer',c));
}
const html=fs.readFileSync('dist/index.html','utf8');
assert(html.indexOf('world-expansion-flutlicht-v175.js')>html.indexOf('world-expansion-interface-v172.js'));
assert(html.indexOf('world-expansion-flutlicht-v175.js')<html.indexOf('ui-flutlicht/adapter.js'));
assert(fs.readFileSync('work/build.cjs','utf8').includes("'world-expansion-flutlicht-v175.js'"));
console.log('Expansion uses native career views, separate Crown/Horizon/ranking sections and read-only statistics.');

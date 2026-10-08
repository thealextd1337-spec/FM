'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const files=['player-role-suitability.js','player-position-routine.js','player-tactic-transitions.js','player-match-ratings.js','player-load-candidate-v158.js'];
function parameters(source,search){
 const c=vm.createContext({location:{protocol:'http:',hostname:'localhost',search},URLSearchParams,structuredClone,document:{readyState:'loading',addEventListener(){}},addEventListener(){}});c.window=c;
 for(const f of files)vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c,{filename:f});
 vm.runInContext(source,c);return JSON.parse(JSON.stringify(c.D6PlayerFoundationPreviewOptions||c.D6PlayerFoundationOptions));
}
const frozen=execFileSync('git',['show','ef0e7d0:dist/player-foundation-preview-v153.js'],{encoding:'utf8'}),regular=fs.readFileSync('dist/player-foundation-preview-v153.js','utf8');
assert.equal(require('./build-player-foundation-preview.cjs').generateSource(),regular.replace(/\r\n/g,'\n'),'the parameter generator reproduces the checked regular/preview activation');
for(const wave of ['wave2','wave3']){
 const before=parameters(frozen,'?players='+wave),after=parameters(regular,'?players='+wave);delete after.balanceSource;
 assert.deepEqual(after,before,`${wave} parameters are preserved exactly`);
}
const original=parameters(frozen,'?players=wave3'),now=parameters(regular,'');
assert.equal(now.parameterId,'native-player-v160-1');assert.equal(now.balanceSource,'wave3-local-candidate-1');
delete now.balanceSource;now.parameterId=original.parameterId;assert.deepEqual(now,original,'regular activation changes the marker, not any balance parameter');
console.log('PASS: regular and preview activation preserve every frozen wave2/wave3 parameter');

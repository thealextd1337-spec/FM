'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm');
const {harness}=require('./world-expansion-harness-v167.cjs');
async function check(readyState){
 const {context,call}=harness();
 const career=call('v167CreateCareer','AUT-5','storage-startup','QA'),before=JSON.stringify(career);
 let opens=0,ready;
 context.document={readyState,addEventListener:(name,fn,options)=>{assert.equal(name,'DOMContentLoaded');assert.equal(options.once,true);ready=fn}};
 context.v61RenderSaves=()=>{};
 context.indexedDB={open:()=>{opens++;const request={result:{transaction:()=>({objectStore:()=>({get:key=>{const r={result:key==='worlds'?[career]:key==='worlds-backup'?[career]:null};queueMicrotask(()=>r.onsuccess());return r}})})}};queueMicrotask(()=>request.onsuccess());return request}};
 const validator=vm.runInContext('v61ValidateCareer',context);
 context.v61ValidateCareer=()=>false;
 vm.runInContext('v61StorageReady=false',context);
 if(readyState==='loading'){
  call('v61StartStorage');await new Promise(setImmediate);assert.equal(opens,0,'No early read while expansion validators are absent');
  context.v61ValidateCareer=validator;ready();
 }else{context.v61ValidateCareer=validator;call('v61StartStorage')}
 await new Promise(setImmediate);
 assert.equal(opens,1);assert.equal(call('v61ReadCareers')[0].id,career.id);
 assert.equal(JSON.stringify(call('v61ReadCareers')[0]),before,'Loading preserves the stored expansion world');
 assert.equal(vm.runInContext('v61StorageError',context),null);
}
(async()=>{await check('loading');await check('complete');console.log('Saved expansion world waits for installed validators, loads once after parsing and remains unchanged; already loaded startup passed.');})().catch(e=>{console.error(e);process.exitCode=1});

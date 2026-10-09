'use strict';
// Read-only diagnostic: these old isolated harnesses fail on the unchanged
// release-113 dependencies too. They are outside the current production workflow.
const fs=require('node:fs'),cp=require('node:child_process');
const baselineRef='7d41731d78b234762beeeb80a6b5d83d2793eb90';
const files=[['work/test-pitch-motion-v102.cjs','dist/pitch-motion-v102.js'],['work/test-world-pitch-actions-v99.cjs','dist/world-pitch-actions-v99.js'],['work/platform/qa/test-shot-target-v159.cjs','dist/match-shot-choice-v159.js']];
const report=files.map(([test,file])=>{
 const source=cp.execFileSync('git',['show',baselineRef+':'+file],{encoding:'utf8'});
 const code=`const fs=require('fs'),read=fs.readFileSync;fs.readFileSync=function(p,...args){return p===${JSON.stringify(file)}?${JSON.stringify(source)}:read.call(this,p,...args)};require('./'+${JSON.stringify(test)});`;
 const run=cp.spawnSync(process.execPath,['-e',code],{encoding:'utf8',windowsHide:true});
 return{test,baselineRef,baselineExit:run.status,error:run.stderr.match(/ReferenceError: [^\n]+/)?.[0]};
});
fs.writeFileSync('outputs/release-114/legacy-isolated-test-baseline.json',JSON.stringify(report,null,2)+'\n');console.log(report);

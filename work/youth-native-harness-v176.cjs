'use strict';
// Same source order as the official VM harness, using Node's main JS context.
// Avoids sandbox-global lookup overhead; separate process for every world.
const fs=require('node:fs'),vm=require('node:vm');
function harness(){
 const values=new Map();let uuid=0;
 Object.defineProperty(globalThis,'crypto',{configurable:true,value:{randomUUID:()=>`expansion-test-${++uuid}`}});
 Object.assign(globalThis,{clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},location:{protocol:'http:',hostname:'test.invalid',search:''}});globalThis.window=globalThis;
 const evaluate=code=>vm.runInThisContext(code),read=f=>fs.readFileSync('dist/'+f,'utf8'),run=f=>vm.runInThisContext(read(f),{filename:f}),call=(n,...args)=>evaluate(n)(...args),copy=o=>JSON.parse(JSON.stringify(o));
 const penalty=read('penalties-v42.js');evaluate(penalty.slice(penalty.indexOf('function v42Composure('),penalty.indexOf('function v42OrderHTML(')));
 for(const f of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js','world-nationalities-v79.js','player-generation.js','player-effective-abilities.js','player-freshness.js','player-load-candidate-v158.js','player-development.js','player-aging.js','player-role-suitability.js','player-position-routine.js','player-tactic-transitions.js','player-match-ratings.js','player-foundation-preview-v153.js','world-player-foundation-v153.js','world-player-roles-v154.js','world-player-performance-v155.js','world-player-load-v158.js'])run(f);
 const foundation=read('world-foundation-v61.js');evaluate(foundation.slice(0,foundation.indexOf('const v61Panel=')));
 for(const f of ['world-economy-v66.js','world-youth-manager-v67.js','world-transfer-list-v72.js','world-honours-v74.js','world-payments-v124.js','world-expansion-catalog-v161.js','world-expansion-v161.js','world-expansion-domestic-v164.js','world-expansion-crown-v165.js','world-expansion-horizon-v166.js','world-expansion-progression-v167.js','world-expansion-economy-v168.js'])run(f);
 return{context:globalThis,call,run,copy,evaluate};
}
module.exports={harness};

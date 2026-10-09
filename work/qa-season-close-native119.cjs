'use strict';
// Existing native finance/youth suites, with their new shootout dependency.
const fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('dist/penalties-v42.js','utf8');
const pure=source.slice(source.indexOf('function v42Composure('),source.indexOf('function v42OrderHTML('));
const create=vm.createContext;
vm.createContext=function(...args){const context=create.apply(this,args);vm.runInContext('function clamp(v,a,b){return Math.max(a,Math.min(b,v))}\n'+pure,context);return context;};
try{
 const suites=['./test-finance-close-v130.cjs','./test-world-payments-v124.cjs','./test-world-youth-manager-v67.cjs'];for(const file of suites)require(file);
 const crypto=require('node:crypto'),output='outputs/season-close-119';fs.mkdirSync(output,{recursive:true});
 const sources=['dist/world-payments-ui-v124.js','dist/world-payments-v124.js','dist/world-economy-v66.js','dist/world-youth-manager-v67.js','dist/world-competition-v62.js','dist/penalties-v42.js'];
 fs.writeFileSync(output+'/native-tests.json',JSON.stringify({passed:true,suites,sourceHashes:Object.fromEntries(sources.map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),note:'Existing native suites with actual pure shootout helpers; no production simulation stub.'},null,2)+'\n');
}finally{vm.createContext=create;}

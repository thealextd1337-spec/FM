'use strict';
// Independent comparison of two D6Cli.Tests output folders (all JSON reports,
// recursively). Unlike the Fable reproducer it checks the gate sets of
// natural-motion.json as name sets (missing, extra, duplicate), plus value,
// passed and limit per gate, and deep-compares every other JSON leaf.
//   node compare-test-reports.cjs <dirA> <dirB> [out.json] [--ignore key,key]
// sourceId/label are reported but never counted as differences.
const fs=require('fs'),path=require('path');
const [A,B,out]=process.argv.slice(2).filter(a=>!a.startsWith('--'));
const ignoreArg=process.argv.indexOf('--ignore');const ignore=new Set(['sourceId','label',...(ignoreArg>0?process.argv[ignoreArg+1].split(','):[])]);
const load=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/:\s*(NaN|-?Infinity)\b/g,(m,v)=>':"'+v+'"'));
const files=d=>{const r=[];(function walk(x,rel){for(const e of fs.readdirSync(x,{withFileTypes:true})){const p=path.join(x,e.name),q=rel?rel+'/'+e.name:e.name;if(e.isDirectory())walk(p,q);else if(e.name.endsWith('.json'))r.push(q);}})(d,'');return r.sort();};
const fa=files(A),fb=files(B),setB=new Set(fb),setA=new Set(fa);
const result={a:A,b:B,onlyA:fa.filter(f=>!setB.has(f)),onlyB:fb.filter(f=>!setA.has(f)),files:{},gateSets:{},meta:{}};
const SETS=['determinism','gates','supportGates','contactGates','continuityGates','r15Gates','r20Gates','r20Checks','r21Gates'];
function deep(a,b,p,acc){
 if(a===b)return;
 if(typeof a==='number'&&typeof b==='number'){if(Object.is(a,b))return;acc.diff++;const d=Math.abs(a-b);if(d>acc.max.d)acc.max={d,p,a,b};if(acc.sample.length<12)acc.sample.push({p,a,b});return;}
 if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)){
  const keys=new Set([...Object.keys(a),...Object.keys(b)]);
  for(const k of keys){if(ignore.has(k)){if(a[k]!==b[k])result.meta[p+'/'+k]=[a[k],b[k]];continue;}
   if(!(k in a)){acc.onlyB.push(p+'/'+k);continue;}if(!(k in b)){acc.onlyA.push(p+'/'+k);continue;}deep(a[k],b[k],p+'/'+k,acc);}
  return;
 }
 acc.diff++;if(acc.sample.length<12)acc.sample.push({p,a:String(a).slice(0,160),b:String(b).slice(0,160)});
}
for(const f of fa.filter(f=>setB.has(f))){
 const a=load(path.join(A,f)),b=load(path.join(B,f));const acc={diff:0,max:{d:0},sample:[],onlyA:[],onlyB:[]};
 if(f.endsWith('natural-motion.json')){
  for(const s of SETS){const ga=a[s]||[],gb=b[s]||[];const ma=new Map(),mb=new Map(),dupA=[],dupB=[];
   for(const g of ga){if(ma.has(g.name))dupA.push(g.name);ma.set(g.name,g);}for(const g of gb){if(mb.has(g.name))dupB.push(g.name);mb.set(g.name,g);}
   const e={countA:ga.length,countB:gb.length,missingInB:[...ma.keys()].filter(n=>!mb.has(n)),extraInB:[...mb.keys()].filter(n=>!ma.has(n)),duplicatesA:dupA,duplicatesB:dupB,valueDiffering:0,passedDiffering:0,limitDiffering:0,failedA:ga.filter(g=>g.passed===false).length,failedB:gb.filter(g=>g.passed===false).length,largest:null,sample:[]};
   for(const [n,g] of ma){const h=mb.get(n);if(!h)continue;const dv=!Object.is(g.value,h.value),dp=g.passed!==h.passed,dl=JSON.stringify(g.limit)!==JSON.stringify(h.limit);
    if(dv)e.valueDiffering++;if(dp)e.passedDiffering++;if(dl)e.limitDiffering++;
    if(dv&&typeof g.value==='number'&&typeof h.value==='number'){const d=h.value-g.value;if(!e.largest||Math.abs(d)>Math.abs(e.largest.delta))e.largest={name:n,a:g.value,b:h.value,delta:d,limit:g.limit};}
    if((dv||dp||dl)&&e.sample.length<40)e.sample.push({name:n,a:g.value,b:h.value,limit:[g.limit,h.limit],passed:[g.passed,h.passed]});}
   result.gateSets[s]=e;delete a[s];delete b[s];}
 }
 deep(a,b,'',acc);result.files[f]={differingLeaves:acc.diff,largestNumeric:acc.max.d?acc.max:null,onlyA:acc.onlyA.slice(0,20),onlyACount:acc.onlyA.length,onlyB:acc.onlyB.slice(0,20),onlyBCount:acc.onlyB.length,sample:acc.sample};
}
const changed=Object.entries(result.files).filter(([,v])=>v.differingLeaves||v.onlyACount||v.onlyBCount);
console.log('files A',fa.length,'B',fb.length,'onlyA',result.onlyA.length,'onlyB',result.onlyB.length,'files with differences',changed.length);
for(const [s,e] of Object.entries(result.gateSets))console.log(s.padEnd(16),'count',e.countA,'/',e.countB,'missing',e.missingInB.length,'extra',e.extraInB.length,'dup',e.duplicatesA.length+e.duplicatesB.length,'value',e.valueDiffering,'passed',e.passedDiffering,'limit',e.limitDiffering,'failed',e.failedA,'/',e.failedB,e.largest?'largest '+e.largest.delta+' '+e.largest.name:'');
for(const [f,v] of changed)console.log(' diff',f,'leaves',v.differingLeaves,'onlyA',v.onlyACount,'onlyB',v.onlyBCount,v.largestNumeric?'max '+v.largestNumeric.d+' at '+v.largestNumeric.p:'');
if(Object.keys(result.meta).length)console.log('ignored keys differing:',Object.keys(result.meta).length);
if(out){fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,1));console.log('written',out);}

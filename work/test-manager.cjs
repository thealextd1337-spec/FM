const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const els=new Map(),storage=new Map(),requests=[];
const element=()=>({innerHTML:'',textContent:'',hidden:false,value:'Testverein',dataset:{},classList:{toggle(){},remove(){}},setAttribute(){},addEventListener(){},append(){},before(){},prepend(){},focus(){},scrollIntoView(){}});
const ctx={document:{querySelector:s=>{if(!els.has(s))els.set(s,element());return els.get(s)},querySelectorAll:()=>[],createElement:element,createTextNode:t=>t},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},window:{scrollTo(){}},location:{protocol:'https:'},crypto,structuredClone,performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},alert:m=>{throw Error(m)},confirm:()=>true,fetch:async(u,o)=>{requests.push(JSON.parse(o.body));return {ok:true}},console,Math};vm.createContext(ctx);
for(const f of ['game.js','manager.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),ctx);
vm.runInContext(`
$('#club-form').onsubmit({preventDefault(){}});
if(readSlots().length!==1)throw Error('create');
players[0].cell=25;press=1;formation='custom';saveCurrent();
const saved=readSlots()[0];players[0].cell=26;openSlot(saved);if(players[0].cell!==25||press!==1)throw Error('restore');
for(let game=0;game<12;game++){start();for(let i=0;i<10000&&running;i++)step(.05,.05);if(running||match.people.length!==12)throw Error('match');if(match.score.some((s,i)=>s>match.shots[i]))throw Error('score');}
if(activeSave.games!==12||readSlots()[0].games!==12||players[0].season.games!==12)throw Error('autosave stats');
`,ctx);
assert.equal(requests.length,0,'no analytics without consent');
vm.runInContext(`localStorage.setItem(CONSENT_KEY,'yes');sendMatchSummary();`,ctx);
assert.equal(requests.length,1);assert(!JSON.stringify(requests[0]).includes('Testverein'));assert(!JSON.stringify(requests[0]).includes('Weber'));
vm.runInContext(`$('#save-list').onclick({target:{closest:s=>s==='[data-delete]'?{dataset:{delete:activeSave.id}}:null}});if(readSlots().length)throw Error('delete');`,ctx);
console.log('PASS: create/load/delete, tactic restore, 12 full matches, autosave, season stats, opt-in and payload minimization');
vm.runInContext(`$('#club-form').onsubmit({preventDefault(){}});if(homeKeeper.season||players.some(p=>p.season))throw Error('New club inherited previous stats');`,ctx);
console.log('PASS: fresh club has independent goalkeeper and outfield statistics');

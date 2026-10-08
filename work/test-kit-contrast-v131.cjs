const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function context(file){const c=vm.createContext({});vm.runInContext(fs.readFileSync('dist/world-catalog-v61.js','utf8'),c);const source=fs.readFileSync(file,'utf8');vm.runInContext(source.slice(source.indexOf('const v61Colors='),source.indexOf('function v61ClubColorLabel')),c);return c;}
const c=context('dist/world-foundation-v61.js'),old=context('work/baseline-world-foundation-kit-v131.js'),run=(ctx,name,...args)=>vm.runInContext(name,ctx)(...args),clubs=vm.runInContext('v61Catalog',c).map(entry=>({...entry,kits:run(c,'v61BuildClubKits',entry)}));
const visible=kits=>{const shirts=[kits.user,kits.opponent,kits.userKeeper,kits.opponentKeeper];return Math.min(...shirts.flatMap((s,i)=>shirts.slice(i+1).map(t=>run(c,'v61KitAppearanceDistance',s,t))));};
const before=JSON.stringify(clubs),rows=[];
for(const own of clubs)for(const opponent of clubs)if(own.id!==opponent.id)for(const home of [true,false]){
 const previous=run(old,'v61SelectMatchKits',own,opponent,home),next=run(c,'v61SelectMatchKits',own,opponent,home),prior=visible(previous),now=visible(next);
 const main=[next.user.main,next.opponent.main,next.userKeeper.main,next.opponentKeeper.main];assert(main.every((s,i)=>main.slice(i+1).every(t=>run(c,'v61KitColorDistance',s,t)>=85)));
 if(prior<24)assert(now+1e-9>=prior,own.id+'/'+opponent.id);
 const mirrored=run(c,'v61SelectMatchKits',opponent,own,!home);assert.deepEqual(JSON.parse(JSON.stringify(next.user)),JSON.parse(JSON.stringify(mirrored.opponent)));assert.deepEqual(JSON.parse(JSON.stringify(next.userKeeper)),JSON.parse(JSON.stringify(mirrored.opponentKeeper)));
 rows.push({own:own.id,opponent:opponent.id,home,prior,now,changed:JSON.stringify(previous)!==JSON.stringify(next)});
}
assert.equal(JSON.stringify(clubs),before);const madrid=clubs.find(x=>x.id==='ESP-1'),vigo=clubs.find(x=>x.id==='ESP-6'),example={before:run(old,'v61SelectMatchKits',madrid,vigo,true),after:run(c,'v61SelectMatchKits',madrid,vigo,true)};
console.log(JSON.stringify({example,prior:visible(example.before),now:visible(example.after)}));
const swapped={main:'#e4bd54',pattern:'#eeeeee',style:'halves'},reverse={main:'#eeeeee',pattern:'#e4bd54',style:'halves'};assert(run(c,'v61KitColorDistance',swapped.main,reverse.main)>100);assert(run(c,'v61KitAppearanceDistance',swapped,reverse)<1e-9);
const report={pairs:rows.length,unchangedClubData:true,mirroredChoices:true,beforeClashes:rows.filter(r=>r.prior<24).length,afterClashes:rows.filter(r=>r.now<24).length,improvedClashes:rows.filter(r=>r.prior<24&&r.now>r.prior+1e-9).length,changed:rows.filter(r=>r.changed).length,example,rows};fs.writeFileSync('outputs/kit-contrast-qa-v131.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,rows:undefined},null,2));

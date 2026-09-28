const fs=require('fs');
const vm=require('vm');

const context=vm.createContext({crypto:{randomUUID:()=> 'sprite-audit'}});
for(const file of ['world-catalog-v61.js','world-nationalities-v79.js'])vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context);
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
const youth=fs.readFileSync('dist/world-youth-manager-v67.js','utf8');
vm.runInContext(youth.slice(0,youth.indexOf('function v67Init(')),context);

const catalog=vm.runInContext('v61Catalog',context);
const authored=vm.runInContext('v61AuthoredFaces',context);
const makeRoster=vm.runInContext('v61GenerateRoster',context);
const makeYouth=vm.runInContext('v67Youth',context);
const covered=new Set(Object.values(authored).map(face=>`${face.pose}|${face.hairstyle}`));
const totals=new Map();
let rosterCount=0,youthCount=0;
for(let seedIndex=0;seedIndex<8;seedIndex++){
 const seed=`sprite-audit-${seedIndex}`;
 for(const entry of catalog){
  const roster=makeRoster(entry,seed);
  const club={id:entry.id,countryId:entry.id.slice(0,3),policy:{youth:entry.profile[2],startingSquad:entry.profile[5]},roster,youthPool:[],youthInvestmentHistory:[]};
  const career={world:{seed}};
  for(let slot=0;slot<3;slot++)club.youthPool.push(makeYouth(career,club,0,slot,true));
  for(const [group,players] of [['roster',roster],['youth',club.youthPool]])for(const player of players){
   const key=`${player.appearance.pose}|${player.appearance.hairstyle}`;
   const item=totals.get(key)||{roster:0,youth:0};item[group]++;totals.set(key,item);
   if(group==='roster')rosterCount++;else youthCount++;
  }
 }
}
const rows=[...totals].map(([key,counts])=>({key,...counts,total:counts.roster+counts.youth,covered:covered.has(key)})).sort((a,b)=>b.total-a.total||a.key.localeCompare(b.key));
const chosen=rows.filter(row=>!row.covered).slice(0,8);
const former=new Set(['a','a2','b','b2','c','c2','d','d2'].map(pair=>`${authored[pair].pose}|${authored[pair].hairstyle}`));
const sum=(set,group)=>rows.filter(row=>set.has(row.key)).reduce((count,row)=>count+row[group],0);
console.log(JSON.stringify({seeds:8,rosterCount,youthCount,coverage:{former:{roster:sum(former,'roster'),youth:sum(former,'youth')},current:{roster:sum(covered,'roster'),youth:sum(covered,'youth')}},currentCovered:[...covered],chosen,ranking:rows},null,2));

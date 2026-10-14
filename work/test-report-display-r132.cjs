'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const checks=[],check=(name,run)=>{run();checks.push(name);};
const reportSource=fs.readFileSync('dist/match-report-v47.js','utf8'),presentation=fs.readFileSync('dist/presentation-v25.js','utf8'),game=fs.readFileSync('dist/game.js','utf8');
const fixture={id:'away-match',homeId:'other',awayId:'own',round:'R1'},career={manager:{managedClubId:'other'},world:{clubs:[{id:'own',name:'Own Club'},{id:'other',name:'Other Club'}],competitions:[{id:'league',fixtures:[fixture]}]}};
const c=vm.createContext({v61CurrentCareer:career});
vm.runInContext(presentation.slice(presentation.indexOf('function v25DisplaySides('),presentation.indexOf('function v25UpdateLiveBoard(')),c);
vm.runInContext(reportSource.slice(reportSource.indexOf('function v47DisplaySides('),reportSource.indexOf('function v47ReportHTML(')),c);
const stored={fixtureId:'away-match',clubIds:['own','other'],ownName:'Own Club',opponentName:'Other Club',competition:{id:'league',round:'R1'},score:[2,1]};
for(const variant of ['original','json','missing-club-ids','empty-club-ids','detached-old-report','ambiguous-old-report','manager-changed','renamed-club','active-old-report','unknown-fixture','conflicting-clubs','no-world'])check('Historical report identity: '+variant,()=>{
 const r=JSON.parse(JSON.stringify(stored)),world=JSON.parse(JSON.stringify(career));let expected=[1,0];
 if(variant==='missing-club-ids')delete r.clubIds;
 if(variant==='empty-club-ids')r.clubIds=[];
 if(variant==='detached-old-report'||variant==='ambiguous-old-report')delete r.fixtureId;
 if(variant==='ambiguous-old-report'){world.world.competitions[0].fixtures.push({...fixture,id:'another-game',homeId:'own',awayId:'other'});expected=[0,1];}
 if(variant==='manager-changed')world.manager.managedClubId='other';
 if(variant==='renamed-club')world.world.clubs[0].name='New Name';
 if(variant==='active-old-report'){delete r.fixtureId;world.world.activeMatch={fixtureId:fixture.id,state:{postMatchReport:r}};}
 if(variant==='unknown-fixture'){r.fixtureId='missing';expected=[0,1];}
 if(variant==='conflicting-clubs'){r.clubIds=['own','third'];expected=[0,1];}
 const before=JSON.stringify({r,world}),side=c.v47DisplaySides(r,variant==='no-world'?null:world);if(variant==='no-world')expected=[0,1];
 assert.deepEqual(Array.from(side),expected);assert.equal(JSON.stringify({r,world}),before);
});
check('Legacy league report retains its original own/opponent display',()=>{assert.deepEqual(Array.from(c.v47DisplaySides({ownName:'Legacy Own',opponentName:'Legacy Other',score:[2,1]},null)),[0,1]);});
check('Statistics resolve fixture sides exactly once per update and preserve native state',()=>{
 const textNode=()=>({textContent:''}),nodes={'#score':textNode(),'#clock':textNode()};for(const id of ['#shots','#possession','#pass-rate']){const values={home:textNode(),away:textNode()};nodes[id]={values,querySelector:s=>values[s.includes('"home"')?'home':'away']};}
 const match={elapsed:12,score:[2,1],shots:[9,4],possession:[30,70],opponentName:'Other',people:[{t:0,stats:{passes:5,passComplete:4}},{t:1,stats:{passes:5,passComplete:2}}]},before=JSON.stringify(match);let lookups=0;
 const ctx=vm.createContext({match,activeSave:{club:'Own'},$:s=>nodes[s],document:{querySelectorAll:()=>[]},displayMatchMinute:()=>14,v25DisplaySides:()=>{lookups++;return[1,0];}});
 vm.runInContext(game.slice(game.indexOf('function updateTeamStats('),game.indexOf('function draw(',game.indexOf('function updateTeamStats('))),ctx);ctx.updateTeamStats();
 assert.equal(lookups,1);assert.equal(nodes['#score'].textContent,'1 : 2');assert.equal(nodes['#shots'].values.home.textContent,'4');assert.equal(nodes['#possession'].values.home.textContent,'70 %');assert.equal(nodes['#pass-rate'].values.home.textContent,'40 %');assert.equal(nodes['#pass-rate'].values.away.textContent,'80 %');assert.equal(JSON.stringify(match),before);
});
check('Full-time title also reads a stored fixture score after the live match is released',()=>{
 const physical=fs.readFileSync('dist/world-physical-v65.js','utf8'),ctx=vm.createContext({match:null,v25DisplaySides:()=>[1,0],v65Club:(_c,t)=>({name:t===0?'Own':'Other'})});
 vm.runInContext(physical.slice(physical.indexOf('function v65FulltimeTitle('),physical.indexOf('function v65Finish(')),ctx);
 const context={state:{score:[1,2]}};assert(ctx.v65FulltimeTitle(context).includes('Other 1 : 2 Own'));ctx.match={score:[2,1]};assert(ctx.v65FulltimeTitle(context).includes('Other 1 : 2 Own'));
});
check('Physical report serialization is byte-for-byte unchanged from review base',()=>{
 const current=fs.readFileSync('dist/world-physical-v65.js','utf8').replace(/\r\n/g,'\n'),base=execFileSync('git',['show','52809e07304ed03ca0cdc907f46b4bd8b790f211:dist/world-physical-v65.js'],{encoding:'utf8'}).replace(/\r\n/g,'\n'),body=s=>s.slice(s.indexOf('function v65WorldReport('),s.indexOf('function v65CompetitionResultsHTML('));assert.equal(body(current),body(base));
});
const files=['dist/game.js','dist/match-report-v47.js','dist/world-goal-banner-v84.js','dist/world-physical-v65.js','work/test-report-display-r132.cjs'];fs.mkdirSync('outputs/r132-display/review-1',{recursive:true});fs.writeFileSync('outputs/r132-display/review-1/unit.json',JSON.stringify({pass:true,checks,sourceHashes:Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]))},null,2)+'\n');console.log(JSON.stringify({pass:true,checks:checks.length}));

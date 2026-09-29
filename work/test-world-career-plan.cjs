const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const context=vm.createContext({crypto:{randomUUID:()=> 'preset-test'},structuredClone,Date});
for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js','world-nationalities-v79.js'])
 vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context,{filename:file});
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);
const feature=fs.readFileSync('dist/world-career-plan-v64.js','utf8');
vm.runInContext(feature.slice(0,feature.indexOf('v61CareerTabs.splice')),context,{filename:'world-career-plan-v64.js'});
const get=expression=>vm.runInContext(expression,context);

vm.runInContext(`
 const career=v61CreateCareer('GER-2','career-plan-seed');
 const club=v64CareerClub(career);
 const plan=v64CareerPlanDefault(career);
 const midfielder=plan.starters.find(pid=>plan.roles[pid]==='mid');
 const striker=plan.starters.find(pid=>plan.roles[pid]==='att');
 plan.instructions[midfielder]=['wing','support'];
 plan.instructions[striker]=['wing','deep','shoot'];
 plan.cells[striker]=5;
 plan.orientation[striker]=-1;
 plan.tactics.focus='Außen';
 career.manager.matchPlan=structuredClone(plan);
 career.manager.tacticPresets=[{id:'one',name:'Flügelspiel',plan:structuredClone(plan)}];
`,context);
assert.equal(get('v64CareerPlanNormalize(career,career.manager.tacticPresets[0].plan).instructions[striker].length'),3,'preset retains combined instructions');
assert.equal(get('v64CareerPlanNormalize(career,career.manager.matchPlan).tactics.focus'),'Außen');
assert.equal(get('v61ValidateCareer(JSON.parse(JSON.stringify(career)))'),true,'career save accepts plans and presets');
vm.runInContext(`
 const preview=v64CareerPlanContext(career);
 v64PrematchTactics(career,preview.fixture,preview.state,0,{formation:'1–2–2'});
 const updated=v64CareerPlanSnapshot(preview);
`,context);
assert.equal(get('updated.tactics.formation'),'1–2–2','off-day formation edit is captured');
assert.equal(get('updated.starters.length'),6);

vm.runInContext(`
 club.roster=club.roster.filter(player=>player.pid!==midfielder);
 const repaired=v64CareerPlanNormalize(career,career.manager.tacticPresets[0].plan);
`,context);
assert.equal(get('repaired.starters.length'),6);
assert.equal(get('new Set(repaired.starters).size'),6);
assert.equal(get('repaired.starters.includes(midfielder)'),false,'departed player is removed');
assert(get('repaired.starters.some(pid=>!plan.starters.includes(pid))'),'available professional fills the position');
assert.equal(get('repaired.instructions[striker].join(",")'),'wing,deep,shoot','other instructions survive roster change');

vm.runInContext(`
 const fixture=v62Fixtures(career).find(item=>item.homeId===club.id||item.awayId===club.id);
 const state=v64MakeState(career,fixture);
 const ownSide=fixture.homeId===club.id?0:1;
`,context);
assert.equal(get('v64Active(state,ownSide).includes(midfielder)'),false);
assert.equal(get('v64Active(state,ownSide).includes(striker)'),true);
assert.equal(get('v64PlayerInstructions(state,striker).join(",")'),'wing,deep,shoot','saved plan reaches match state');
assert.equal(get('state.tactics[ownSide].focus'),'Außen');
assert.equal(get('state.cells[striker]'),5,'saved grid cell reaches match state');
assert.equal(get('state.orientation[striker]'),-1,'saved individual role reaches match state');
assert.equal(get('v64Bench(state,ownSide).join(",")'),get('repaired.bench.join(",")'),'saved bench reaches match state');
assert.equal(get('fixture.plan[ownSide===0?"home":"away"].starters.includes(striker)'),true,'fixture lineup matches saved plan');

vm.runInContext(`
 function v64UiPrematchPitch(){return 'PITCH'}
 function v64UiTactics(){return 'TACTICS'}
 function v64OrientationHTML(){return 'ORIENTATION'}
 function v64InstructionHTML(){return 'INSTRUCTIONS'}
 function v51StatusHTML(){return 'STATUS'}
 function v55TopSkillsHTML(){return 'SKILLS'}
 function freshText(){return 'FRISCHE'}
 function v61FlagSVG(){return ''}
 function escapeHTML(value){return String(value)}
`,context);
assert.match(get('v64CareerPlanHTML(career)'),/Gespeicherte Matchpläne/);
assert.match(get('v64CareerPlanHTML(career)'),/Flügelspiel/);
assert.match(get('v64CareerPlanHTML(career)'),/data-v64-career-save/);
assert.match(get('v64CareerPlanHTML(career)'),/class="v64-pitch-area">PITCH<section class="v64-bench-section compact-bench v64-career-bench"/,'career bench sits below the pitch');
assert.match(get('v64CareerPlanHTML(career)'),/data-v64-career-bench-card=/,'career bench uses match bench cards');
assert.doesNotMatch(get('v64CareerPlanHTML(career)'),/data-v64-career-bench=/,'career bench cannot swap by click');
assert.match(get('v64CareerPlanHTML(career)'),/auf ein Feldtrikot ziehen/,'career bench announces drag interaction');
vm.runInContext('var v61CurrentCareer=career;',context);
assert.equal(get('v64CareerCanDrop({keeper:false},{dataset:{v64CareerSlot:"1"},classList:{contains:()=>false}})'),true,'field reserve can reach a field shirt');
assert.equal(get('v64CareerCanDrop({keeper:false},{dataset:{v64CareerSlot:"0"},classList:{contains:()=>true}})'),false,'field reserve cannot replace goalkeeper');
vm.runInContext('var v61WorldScreen={querySelector:()=>null},v64UiSave=async()=>{};',context);
const reserve=get('v64CareerPlanContext(career).fixture.plan.home.bench.find(id=>!club.roster.find(player=>player.pid===id).keeper)');
get('v64CareerDropAction({pid:'+JSON.stringify(reserve)+',keeper:false},{dataset:{v64CareerSlot:"1"},classList:{contains:()=>false}})').then(()=>{
 assert.equal(get('career.manager.matchPlan.starters[1]'),reserve,'drop replaces the selected field shirt and saves the plan');
 console.log('PASS: saved full plans, squad reconciliation, match application and drag-only career controls');
}).catch(error=>{console.error(error);process.exitCode=1});

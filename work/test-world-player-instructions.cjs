const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const context=vm.createContext({crypto:{randomUUID:()=> 'instruction-test'}});
for(const file of ['world-catalog-v61.js','world-competition-v62.js','world-coaches-v63.js','world-match-v64.js','world-nationalities-v79.js'])
 vm.runInContext(fs.readFileSync(`dist/${file}`,'utf8'),context,{filename:file});
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(foundation.slice(0,foundation.indexOf('const v61Panel=')),context);

vm.runInContext(`
 const career=v61CreateCareer('GER-2','instruction-seed');
 const fixture=v62Fixtures(career).find(item=>item.homeId==='GER-2'||item.awayId==='GER-2');
 const state=v64MakeState(career,fixture);
 const side=fixture.homeId==='GER-2'?0:1,other=1-side;
 const active=v64Active(state,side),opponents=v64Active(state,other);
`,context);
const get=expression=>vm.runInContext(expression,context);
assert.equal(get('active.length'),6,'five outfield players and a keeper remain');
assert.equal(get('v64PlayerInstructions({roles:state.roles},active.find(pid=>state.roles[pid]!=="gk")).length'),0,'old states without instruction map remain valid');
assert(get('opponents.some(pid=>v64PlayerInstructions(state,pid).length>0)'),'AI assigns zone-specific instructions');
assert(get('opponents.some(pid=>v64PlayerInstructions(state,pid).length>1)'),'AI combines matching instructions');
assert(['Außen','Mitte'].includes(get('state.tactics[other].focus')),'AI selects an attacking focus');

vm.runInContext(`
 v64ChangeTactics(career,fixture,state,side,{formation:'1–2–2',focus:'Außen'});
 const attacker=v64Active(state,side).find(pid=>state.roles[pid]==='att');
 const midfielder=v64Active(state,side).find(pid=>state.roles[pid]==='mid');
 const defender=v64Active(state,side).find(pid=>state.roles[pid]==='def');
 v64ToggleInstruction(state,attacker,'deep');
 v64ToggleInstruction(state,attacker,'wing');
 v64ToggleInstruction(state,attacker,'shoot');
 v64ToggleInstruction(state,midfielder,'support');
 v64ToggleInstruction(state,midfielder,'wing');
`,context);
assert.equal(get('state.tactics[side].focus'),'Außen');
assert.equal(get('v64PlayerInstructions(state,attacker).join(",")'),'wing,deep,shoot');
assert.equal(get('v64PlayerInstructions(state,midfielder).join(",")'),'wing,support');
assert.throws(()=>get("v64ToggleInstruction(state,defender,'deep')"),/Einsatzzone/);
assert.throws(()=>get("v64ChangeTactics(career,fixture,state,side,{focus:'Überall'})"),/Ungültige Taktik/);

vm.runInContext(`v64MoveCell(career,fixture,state,side,attacker,v64EnsureCells(state,side)[midfielder])`,context);
assert.equal(get('state.roles[attacker]'),'mid');
assert.equal(get('v64PlayerInstructions(state,attacker).join(",")'),'wing','valid wide instruction survives zone move');
assert.equal(get('state.roles[midfielder]'),'att');
assert.equal(get('v64PlayerInstructions(state,midfielder).join(",")'),'wing','only short support resets after a move into attack');

vm.runInContext(`v64ToggleInstruction(state,attacker,'standard');state.instructions[midfielder]='wing'`,context);
assert.equal(get('v64PlayerInstructions(state,attacker).length'),0,'standard clears all extras');
assert.equal(get('v64PlayerInstructions(state,midfielder).join(",")'),'wing','legacy single-string save remains valid');

vm.runInContext(`
 const newMid=v64Active(state,side).find(pid=>state.roles[pid]==='mid');
 const benchMid=v64Bench(state,side).find(pid=>!v64Player(career,fixture,side,pid).keeper);
 const slot=(side===0?fixture.plan.home:fixture.plan.away).starters.indexOf(newMid);
 v64ToggleInstruction(state,newMid,'wing');
 v64ToggleInstruction(state,newMid,'support');
 v64SetPrematchSlot(career,fixture,state,side,slot,benchMid);
`,context);
assert.equal(get('v64PlayerInstructions(state,benchMid).join(",")'),'wing,support','replacement inherits both slot instructions');
assert.equal(get('state.instructions[newMid]'),undefined,'outgoing player keeps no live instruction');

vm.runInContext(`
 state.phase='paused';
 const benchForward=v64Bench(state,side).find(pid=>!v64Player(career,fixture,side,pid).keeper);
 const forward=v64Active(state,side).find(pid=>state.roles[pid]==='att');
 v64ToggleInstruction(state,forward,'standard');
 v64ToggleInstruction(state,forward,'shoot');
 v64ToggleInstruction(state,forward,'deep');
 v64QueueSubstitution(career,fixture,state,side,forward,benchForward);
 v64ExecutePending(career,fixture,state,'Test');
`,context);
assert.equal(get('v64PlayerInstructions(state,benchForward).join(",")'),'deep,shoot','in-match substitute inherits both instructions');
assert.equal(get('state.instructions[forward]'),undefined);
const roundTrip=JSON.parse(get('JSON.stringify(state)'));
assert.deepEqual(roundTrip.instructions[get('benchForward')],['deep','shoot'],'save data keeps combined instructions');
assert.equal(roundTrip.tactics[get('side')].focus,'Außen','save data keeps attacking focus');

const ui=fs.readFileSync('dist/world-match-ui-v64.js','utf8');
vm.runInContext(ui.slice(ui.indexOf('function v64InstructionHTML'),ui.indexOf('function v64UiPrematchSelection')),context);
assert.match(get('v64InstructionHTML(state,benchForward)'),/Abschluss suchen/);
assert.doesNotMatch(get('v64InstructionHTML(state,defender)'),/Tiefenlauf/,'defensive zone hides attacking instructions');
assert.match(get('v64InstructionHTML(state,benchForward)'),/data-v64-instruction="shoot" aria-pressed="true"/);
console.log('PASS: zone rules, AI choices, position changes, substitutions, save round trip and instruction controls');

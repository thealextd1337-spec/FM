'use strict';
// Controlled resolved-contact fixtures. Shipped pass/receive/loss, collector and
// checkpoint functions run unchanged; flight animation, offside and views are
// isolated. These fixtures are not full physics or match-balance evidence.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict'), crypto = require('node:crypto');
const files = ['dist/world-space-passes-v150.js', 'dist/world-player-performance-v155.js', 'dist/world-physical-v65.js', 'dist/pitch-v55.js', 'dist/game.js'];
const source = Object.fromEntries(files.map(file => [file, fs.readFileSync(file, 'utf8')]));
const hashes = Object.fromEntries(files.map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
const physical = source[files[2]], pitch = source[files[3]], game = source[files[4]];
function slice(text, start, end) { const a = text.indexOf(start), b = text.indexOf(end, a); assert(a >= 0 && b > a, start); return text.slice(a, b); }
const geometry = pitch.match(/^const v55Field=.*$/m)[0] + '\n' + pitch.match(/^function v122Metres\(.*$/m)[0] + '\n' + game.match(/^function passLaneGeometry\(.*$/m)[0];
const checkpoints = slice(physical, 'function v65Snapshot(context){', 'function v65SyncMinute(context,target){');
const checks = [], check = (label, value) => { assert(value, label); checks.push(label); };
const json = value => JSON.parse(JSON.stringify(value));

function fixture({ marked = true } = {}) {
  const sandbox = vm.createContext({ performance: { now: () => 1234 } });
  vm.runInContext(`
    var MATCH_SPEED=.78, saveResult=true, v65LastSaved=0, v65ProcessedGoals=0;
    var randomValues=[.23,.82], randomIndex=0;
    function random(){return randomValues[randomIndex++%randomValues.length]}
    function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
    function ability(p,k){return p[k]||16}
    function hasInstruction(){return false}
    function note(){}
    var v102Release={}; function v102Scoped(p,type,callback){v102Release={};callback()}
    function fly(target,duration,done){match.owner=null;match.flight={target:{...target},duration,done,progress:0,x:match.ball.x,y:match.ball.y}}
    function v55Exit(){return null}
    function v55OffsideSnapshot(){return{lineY:.2,ball:{...match.ball},offside:new Set(),positions:new Map(match.people.map(p=>[p,{x:p.x,y:p.y}]))}}
    function v55WhistleOffside(){throw Error('Offside is outside this fixture')}
    function v55Out(){throw Error('Out-of-play is outside this fixture')}
    function v50LooseBall(point){match.owner=null;match.rebound={...point,vx:0,vy:0,delay:0}}
    function v50ChaseLooseBall(){}
    function v65Finish(){}
    function v127TryOneTouch(){return false}
    function v123Receive(){}
    function v123PossessionTeam(m){return m.owner?.t??m.lastTouch}
    function v121PositioningPaused(){return true}
    function v64UiSave(){return saveResult}
    function v65ApplyTactics(){}
    function hideOverlay(){}
    var dom={'#log':{innerHTML:'fixture log'},'#event':{textContent:'fixture event'}};
    function $(selector){return dom[selector]}
    function person(pid,t,x,y){return{pid,name:pid,t,x,y,n:pid.length,keeper:false,pas:16,tec:16,pos:16,spd:16,stats:{passes:0,passComplete:0,passLost:0,progressive:0,interceptions:0,tacklesWon:0,shots:0,onTarget:0,saves:0}}}
    var passer=person('passer',0,.48,.68), runner=person('runner',0,.46,.38), alternate=person('alternate',0,.54,.38), nearReceiver=person('nearReceiver',1,.82,.18), nearPasser=person('nearPasser',1,.84,.79);
    var match={people:[passer,runner,alternate,nearReceiver,nearPasser],exitedPeople:[],owner:passer,ball:{x:passer.x,y:passer.y},elapsed:10,flight:null,slide:null,rebound:null,lastPass:null,lastTouch:0,goals:[],score:[0,0]};
    var state={fixtureId:'resolved-contact',minute:1,active:['passer','runner','alternate'],awayActive:['nearReceiver','nearPasser'],roleAssignments:Object.fromEntries(match.people.map(p=>[p.pid,{position:'mid',roleId:'playmaker',orientation:0}]))};
    ${marked ? "state.playerPerformance={version:155,parameters:{},events:[],phases:{},sequence:0};" : ''}
    var context={state},v65WorldActive=${marked ? 'context' : 'null'};
  `, sandbox);
  vm.runInContext(geometry, sandbox);
  vm.runInContext(source[files[0]], sandbox, { filename: files[0] });
  vm.runInContext(source[files[1]], sandbox, { filename: files[1] });
  vm.runInContext(checkpoints, sandbox, { filename: files[2] + '#checkpoint-functions' });
  sandbox.v155BeforeNative(sandbox.match);
  return sandbox;
}
function start(s, runner = s.runner) { return s.v150SpacePass(s.passer, { target: { x: .46, y: .38 }, runner }); }
function receive(s, plan, actor = s.runner) {
  const point = { ...s.match.flight.target }; actor.x = point.x; actor.y = point.y;
  s.v150Receive(s.match, plan, actor, point); s.v155ObserveNative(s.context);
}
function events(s, type) { return s.state.playerPerformance.events.filter(e => e.type === type); }

{
  const s = fixture(), plan = start(s), landing = json(s.match.flight.target), intent = { x: .46, y: .38 };
  check('Space attempt context uses the actual dosed/error landing', JSON.stringify(landing) !== JSON.stringify(intent) && Math.abs(s.match.performancePasses.passer.context.progressMetres - s.v155PassContext(s.match, s.passer, { ...landing, pid: s.runner.pid }).progressMetres) < 1e-12);
  check('Space attempt stores a serializable release origin and optional runner identity', JSON.stringify(json(s.match.performancePasses)) === JSON.stringify(s.match.performancePasses) && s.match.performancePasses.passer.receiverId === 'runner' && s.match.performancePasses.passer.from.y === .68);
  s.v155ObserveNative(s.context);
  check('Unresolved space flight earns no pass or reception credit', s.state.playerPerformance.events.length === 0);
  receive(s, plan);
  check('Actual successful space contact earns one pass and one reception', events(s, 'pass').length === 1 && events(s, 'pass')[0].success && events(s, 'receive').length === 1 && events(s, 'receive')[0].playerId === 'runner');
  const recorded = JSON.stringify(s.state.playerPerformance.events); s.v155ObserveNative(s.context); s.v155ObserveNative(s.context);
  check('Repeated observation cannot repeat resolved space success', JSON.stringify(s.state.playerPerformance.events) === recorded && !s.match.performancePasses.passer);
  check('Reception has actual progress and pressure without assumed difficulty', Number.isFinite(events(s, 'receive')[0].context.progressMetres) && Number.isFinite(events(s, 'receive')[0].context.pressure) && !Object.hasOwn(events(s, 'receive')[0].context, 'difficulty'));
}
{
  const s = fixture(), plan = start(s); s.v150Lose(s.match, plan); s.v150Lose(s.match, plan);
  s.v155ObserveNative(s.context);
  check('A known unsuccessful space pass waits for flight resolution', events(s, 'pass').length === 0 && s.passer.stats.passLost === 1);
  s.match.flight = null; s.v155ObserveNative(s.context); s.v155ObserveNative(s.context);
  check('Resolved space failure is recorded exactly once', events(s, 'pass').length === 1 && events(s, 'pass')[0].success === false && events(s, 'receive').length === 0 && !s.match.performancePasses.passer);
  check('Space failure does not fabricate personal error blame', events(s, 'pass')[0].context.errorAttribution === false && events(s, 'error').length === 0);
}
{
  const s = fixture(), plan = start(s); receive(s, plan, s.alternate);
  check('Actual alternate receiver receives the contact credit', events(s, 'receive').length === 1 && events(s, 'receive')[0].playerId === 'alternate' && !events(s, 'receive').some(e => e.playerId === 'runner'));
}
{
  const s = fixture(), plan = start(s); receive(s, plan, s.nearReceiver);
  check('Actual opponent contact records only failed pass plus interception', events(s, 'pass').length === 1 && events(s, 'pass')[0].success === false && events(s, 'interception').length === 1 && events(s, 'interception')[0].playerId === 'nearReceiver' && events(s, 'receive').length === 0);
  s.v155ObserveNative(s.context);
  check('Repeated observation cannot repeat opponent contact', events(s, 'interception').length === 1 && events(s, 'pass').length === 1);
}
{
  const s = fixture(), plan = start(s, null);
  check('Unassigned space target stores null, never an invented receiver', s.match.performancePasses.passer.receiverId === null);
  receive(s, plan, s.alternate);
  check('Unassigned space target credits the observed actual receiver', events(s, 'receive')[0].playerId === 'alternate');
}
function reception({ receiverDistance = 12, passerDistance = 12, movePasser = false } = {}) {
  const s = fixture(), plan = start(s), point = s.match.flight.target, scale = s.v150Scale();
  s.nearReceiver.x = point.x + receiverDistance / scale.x; s.nearReceiver.y = point.y;
  s.nearPasser.x = s.passer.x + passerDistance / scale.x; s.nearPasser.y = s.passer.y;
  if (movePasser) s.passer.y += .08;
  receive(s, plan); return { event: json(events(s, 'receive')[0]), from: s.match.performancePasses.passer?.from, point: json(point), scale };
}
{
  const far = reception(), near = reception({ receiverDistance: 1 }), passerClose = reception({ receiverDistance: 1, passerDistance: 1 }), moved = reception({ receiverDistance: 1, movePasser: true });
  check('Native receiver pressure responds to actual receiver-opponent distance', near.event.context.pressure > far.event.context.pressure + .5);
  check('Native receiver pressure is independent of passer pressure', near.event.context.pressure === passerClose.event.context.pressure);
  check('Native reception progress uses stored release origin after passer moves', moved.event.context.progressMetres === near.event.context.progressMetres && Math.abs(moved.event.context.progressMetres - (.68 - moved.point.y) * moved.scale.y) < 1e-12);
}
{
  const s = fixture(), plan = start(s), originalAttempt = JSON.stringify(s.match.performancePasses.passer);
  s.v155ObserveNative(s.context); s.match.ball = { ...s.match.flight.target }; s.match.flight = null; s.v150Arrive(s.match, plan);
  s.saveResult = false;
  check('Failed safe checkpoint preserves the unresolved attempt without credit', s.v65Snapshot(s.context) === false && JSON.stringify(s.match.performancePasses.passer) === originalAttempt && s.state.playerPerformance.events.length === 0);
  s.saveResult = true;
  check('Retry safe checkpoint uses the shipped snapshot function', s.v65Snapshot(s.context) === true);
  const restoredState = json(s.state); s.context.state = restoredState; s.state = restoredState;
  check('Attempt and new loose-pass intent survive actual checkpoint JSON', JSON.stringify(restoredState.physicalSnapshot.match.performancePasses.passer) === originalAttempt && restoredState.physicalSnapshot.match.spacePassIntent.runnerPid === 'runner');
  check('Actual restore accepts the checkpoint and rehydrates the new pass intent', s.v65Restore(s.context) && !!s.v150RestoreIntent(s.match));
  const restoredPlan = s.v150RestoreIntent(s.match), actual = s.match.people.find(p => p.pid === 'alternate'), point = { ...s.match.ball };
  actual.x = point.x; actual.y = point.y; s.v150Receive(s.match, restoredPlan, actual, point); s.v155ObserveNative(s.context); s.v155ObserveNative(s.context);
  check('Restored loose-pass contact keeps original context and books once', events(s, 'pass').length === 1 && events(s, 'receive').length === 1 && events(s, 'receive')[0].playerId === 'alternate' && JSON.stringify(events(s, 'pass')[0].context) === JSON.stringify(JSON.parse(originalAttempt).context));
  check('Restored contact clears completed intents and remains JSON serializable', !s.match.spacePassIntent && !s.match.performancePasses.passer && JSON.stringify(json(s.state.playerPerformance)) === JSON.stringify(s.state.playerPerformance));
}
{
  const s = fixture({ marked: false }), plan = start(s); receive(s, plan);
  check('Legacy native space pass keeps physical stats but adds no performance state', s.passer.stats.passComplete === 1 && !s.state.playerPerformance && !s.match.performancePasses && !s.match.performanceObservation);
}
const output = path.resolve('outputs/platform/role-performance/native-context-tests.json'); fs.mkdirSync(path.dirname(output), { recursive: true });
const changedDuringRun = files.filter(file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') !== hashes[file]); assert.deepEqual(changedDuringRun, []);
fs.writeFileSync(output, JSON.stringify({ fixtureKind: 'Controlled resolved contacts using unchanged shipped pass, receive, loss, collector and safe checkpoint functions. Flight/view/offside utilities isolated; not full physics.', sourceHashes: hashes, changedDuringRun, checks, status: 'passed' }, null, 2) + '\n');
console.log(`${checks.length} native performance-context assertions passed; ${output}`);

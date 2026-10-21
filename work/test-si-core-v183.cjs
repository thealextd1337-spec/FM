'use strict';
// SI 183 foundation: interfaces, marker/configuration, clock helpers,
// personality, decision trace, ledger sources, switches, stubs, load lists and
// the restore round trip. Runs the actual dist modules in the native VM harness.
// Usage: node work/test-si-core-v183.cjs
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {create}=require('./native183-scenes.cjs'),{root}=require('./native130-harness.cjs');
const checks=[];const check=(name,fn)=>{fn();checks.push(name);};
const fresh=()=>create({view:false});
const SI_FILES=['match-si-core-v183.js','match-si-clock-v183.js','match-si-defence-v183.js','match-si-finish-v183.js','match-si-setplay-v183.js','match-si-offball-v183.js','match-si-options-v183.js','match-si-field-v183.js'];
const PACKAGES=['clock','options','offball','finish','defence','setplay','field'];
// Packages switched on for new matches by their own module on completion
// (v183EnableByDefault). Stub and switch checks below turn every package off.
const ENABLED=(()=>{const g=create({view:false});return PACKAGES.filter(p=>g.evaluate(`v183CreateSi(undefined).packages['${p}']`)===true);})();
const OFF={packages:Object.fromEntries(PACKAGES.map(p=>[p,false]))};

// ----- load and build lists -----
// Ball physics 184 (match-ball-physics-v184.js) loads after the packages and before the ledger v117, so the
// ledger wraps the loose ball of a woodwork rebound.
check('index.html loads core then the seven packages between football flow v159 and ball physics 184 / ball events v117',()=>{
 const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8'),scripts=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]),at=scripts.indexOf('world-football-flow-v159.js');
 assert.deepEqual(scripts.slice(at+1,at+11),[...SI_FILES,'match-ball-physics-v184.js','match-ball-events-v117.js']);
 for(const file of SI_FILES)assert(fs.existsSync(path.join(root,'dist',file)),file);
});
check('build.cjs and the native130 harness list carry the same eight modules in load order',()=>{
 for(const file of ['work/build.cjs','work/native130-harness.cjs']){
  const text=fs.readFileSync(path.join(root,file),'utf8');
  assert(text.includes(`'world-football-flow-v159.js',${SI_FILES.map(f=>`'${f}'`).join(',')},'match-ball-physics-v184.js','match-ball-events-v117.js'`),file);
 }
});
const h=fresh();
const ev=text=>h.evaluate(text),copy=value=>h.copy(value);
check('all shared interfaces exist as global functions',()=>{
 for(const name of ['v183Active','v183Param','v183Rate','v183Seconds','v183ClockUnits','v183Personality','v183Trace','v183LedgerSource','v183Radius','v183PaceFactor','v183RegisterDefaults','v183ShotEstimate','v183CrossEstimate','v183PassEstimate','v183Offers','v183Clearance','v183CreateSi','v183EnableByDefault','v183Marked','v183TraceEntries','v183PaceReason','v183FormationAnchor','v183ReboundFinish','v183KeeperReach','v183AirFinish','v183StrictParams','v183SetTraceLimit','v117AddSource'])
  assert.equal(ev(`typeof ${name}`),'function',name);
});

// ----- marker and configuration -----
check('constructor default: marker 183, positive clock rate, only completed packages on, registered parameter sets',()=>{
 h.call('Native183.constructed',{});
 const si=copy(ev('match.si'));
 assert.deepEqual(Object.keys(si),['revision','clockRate','packages','params']);
 assert.equal(si.revision,183);assert(Number.isFinite(si.clockRate)&&si.clockRate>0,'clock rate');
 assert.deepEqual(si.packages,Object.fromEntries(PACKAGES.map(p=>[p,ENABLED.includes(p)])));
 assert.deepEqual(si.params,Object.fromEntries(PACKAGES.map(p=>[p,copy(ev(`v183RegisterDefaults('${p}',{})`))])));
 for(const p of PACKAGES)assert.equal(ev(`v183Active(match,'${p}')`),ENABLED.includes(p),p);
 assert.equal(ev('v183Marked(match)'),true);
 const flow=copy(ev('match.attackFlow'));for(const key of ['keeperHoldRevision','setPieceRevision','looseBallRevision','pursuitRevision','motionRevision'])assert.equal(flow[key],182,key);
 assert.equal(ev('match.penaltyRevision'),182);
});
check('constructor option si:false creates a match without marker 183 (rules 182)',()=>{
 h.call('Native183.constructed',{si:false});
 assert.equal(ev("Object.hasOwn(match,'si')"),false);assert.equal(ev('v183Marked(match)'),false);
 for(const p of PACKAGES)assert.equal(ev(`v183Active(match,'${p}')`),false);
});
check('harness overrides: package switches and clock rate are stored; invalid overrides are rejected',()=>{
 h.call('Native183.constructed',{si:{packages:{...OFF.packages,finish:true,clock:true},clockRate:.42}});
 assert.equal(ev("v183Active(match,'finish')"),true);assert.equal(ev("v183Active(match,'clock')"),true);assert.equal(ev("v183Active(match,'options')"),false);
 assert.equal(ev('match.si.clockRate'),.42);
 for(const [options,pattern]of [[{packages:{finesse:true}},/Unknown SI package/],[{packages:{finish:1}},/boolean expected/],[{params:{finish:{spread:1}}},/Unknown SI parameter/],[{clockRate:0},/positive number/],[{clockRate:'0.4'},/positive number/],[{speed:1},/Unknown SI option/]])
  assert.throws(()=>h.call('Native183.constructed',{si:options}),pattern);
 assert.throws(()=>ev("v183Active(match,'defense')"),/Unknown SI package/);
});
check('registered defaults are copied into new matches; overrides keep their type; double registration is rejected',()=>{
 const g=fresh(),gev=text=>g.evaluate(text);
 // Only the test keys: the package module may already have registered its own.
 const pick=o=>({spread:o.spread,mode:o.mode,zones:o.zones});
 assert.deepEqual(pick(g.copy(gev("v183RegisterDefaults('finish',{spread:.5,mode:'near',zones:[1,2]})"))),{spread:.5,mode:'near',zones:[1,2]});
 assert.deepEqual(pick(g.copy(gev("v183RegisterDefaults('finish',{spread:.5})"))),{spread:.5,mode:'near',zones:[1,2]},'same value may be repeated');
 assert.throws(()=>gev("v183RegisterDefaults('finish',{spread:.6})"),/registered twice/);
 assert.throws(()=>gev("v183RegisterDefaults('finish',{bad:()=>1})"),/plain JSON/);
 assert.throws(()=>gev("v183RegisterDefaults('finish',{bad:NaN})"),/non-finite/);
 assert.throws(()=>gev("v183RegisterDefaults('kicks',{a:1})"),/Unknown SI package/);
 g.call('Native183.constructed',{si:{params:{finish:{spread:.7}}}});
 assert.deepEqual(pick(g.copy(gev('match.si.params.finish'))),{spread:.7,mode:'near',zones:[1,2]});
 assert.equal(gev("v183Param(match,'finish.spread')"),.7);assert.equal(gev("v183Param(match,'finish.mode')"),'near');
 assert.equal(gev("match.si.params.finish.zones===v183Param(match,'finish.zones')"),true);
 assert.throws(()=>g.call('Native183.constructed',{si:{params:{finish:{spread:'0.7'}}}}),/number expected/);
 assert.throws(()=>gev("v183Param(match,'spread')"),/<package>\.<name>/);
 // Stored parameters are frozen copies; registry objects are not shared.
 assert.throws(()=>gev("match.si.params.finish.zones.push(3)"),e=>e.name==='TypeError');
 gev("v183RegisterDefaults('finish',{}).zones.push(9)");g.call('Native183.constructed',{});assert.deepEqual(g.copy(gev('match.si.params.finish.zones')),[1,2]);
 // A stored value wins; a parameter missing from a saved match reads the default.
 assert.equal(gev("(()=>{const saved={si:JSON.parse(JSON.stringify(match.si))};delete saved.si.params.finish.mode;return v183Param(saved,'finish.mode');})()"),'near');
 // Unmarked matches read undefined; the scene harness runs in strict mode (error).
 g.call('Native183.constructed',{si:false});
 assert.throws(()=>gev("v183Param(match,'finish.spread')"),/without marker 183/);
 gev('v183StrictParams(false)');assert.equal(gev("v183Param(match,'finish.spread')"),undefined);gev('v183StrictParams(true)');
 const before=g.copy(gev('v183CreateSi(undefined).packages'));
 gev("v183EnableByDefault('setplay')");g.call('Native183.constructed',{});
 assert.equal(gev("v183Active(match,'setplay')"),true);assert.deepEqual(g.copy(gev('match.si.packages')),{...before,setplay:true},'other switches keep their default');
 g.call('Native183.constructed',{si:{packages:{setplay:false}}});assert.equal(gev("v183Active(match,'setplay')"),false);
});

// ----- clock -----
check('clock helpers: MATCH_SPEED arithmetic without the clock package, stored rate with it',()=>{
 h.call('Native183.constructed',{si:false});h.call('Native183.run',40);
 assert.equal(ev('v183Rate(match)'),ev('MATCH_SPEED'));assert.equal(ev('v183Seconds(match)'),ev('v152Seconds(match)'));
 for(const s of [.32,.75,2.7,1/3])assert.equal(ev(`v183ClockUnits(match,${s})`),ev(`${s}*MATCH_SPEED`));
 h.call('Native183.constructed',{si:{packages:{clock:false},clockRate:.42}});h.call('Native183.run',40);
 assert.equal(ev('v183Rate(match)'),ev('MATCH_SPEED'),'stored rate only with the clock package');assert.equal(ev('v183Seconds(match)'),ev('v152Seconds(match)'));
 h.call('Native183.constructed',{si:{packages:{clock:true},clockRate:.42}});h.call('Native183.run',40);
 assert.equal(ev('v183Rate(match)'),.42);assert.equal(ev('v183Seconds(match)'),ev('match.elapsed/.42'));assert.equal(ev('v183ClockUnits(match,2)'),2*.42);
});

// ----- personality -----
const personality=player=>copy(h.call('v183Personality',player));
const close=(a,b,msg)=>assert(Math.abs(a-b)<1e-12,`${msg}: ${a} vs ${b}`);
check('personality: start formula from role and calm/dec, mental fallback 10, clamping',()=>{
 const p=personality({tacticalRole:'poacher',calm:14,dec:12,ant:10});
 close(p.shootWeight,1.25*(.85+.015*4+.01*2),'poacher shoot');close(p.riskWeight,1*(.9+.01*2),'poacher risk');
 const m=personality({tacticalRole:'playmaker',calm:10,dec:16,ant:7});
 close(m.riskWeight,1.25*(.9+.06),'playmaker risk');close(m.shootWeight,.9*(.85+.06),'playmaker shoot');close(m.followWeight,.9*(.85-.06),'playmaker follow');
 const none=personality({tacticalRole:'striker'});
 close(none.shootWeight,1.15*.85,'missing mental values count as 10');close(none.riskWeight,.9,'striker risk neutral');
 const low=personality({tacticalRole:'stopper',calm:-5,dec:0,ant:40});
 close(low.shootWeight,.7*(.85+.015*-9+.01*-9),'clamped to 1');close(low.followWeight,.6*(.85+.02*10),'clamped to 20');
 const line=personality({assignedLine:'def',line:'mid'});close(line.shootWeight,.7*.85,'line fallback uses the assigned line');
 const keeper=personality({keeper:true,assignedLine:'gk'});close(keeper.riskWeight,.8*.9,'keeper');
 const unknown=personality({tacticalRole:'libero'});close(unknown.shootWeight,.85,'unknown role without line is neutral');
 assert.equal(h.evaluate("Object.isFrozen(v183Personality({tacticalRole:'winger'}))"),true);
});
check('personality writes nothing to player data and uses no random draws',()=>{
 const result=h.evaluate(`(()=>{const p={pid:'x',t:0,tacticalRole:'winger',calm:13,ant:9,dec:11};const before=JSON.stringify(p),keys=Object.keys(p).length,r0=Native182.rng().draws;v183Personality(p);v183Personality({});return {same:JSON.stringify(p)===before&&Object.keys(p).length===keys,draws:Native182.rng().draws-r0};})()`);
 assert.deepEqual(copy(result),{same:true,draws:0});
});
check('personality depends on role and mental values, not on finishing/passing/technique',()=>{
 const a=personality({tacticalRole:'poacher',calm:12,dec:12,ant:12,fin:6,pas:6,tec:6}),b=personality({tacticalRole:'poacher',calm:12,dec:12,ant:12,fin:19,pas:19,tec:19});
 assert.deepEqual(a,b);
});
const ROLES=['poacher','striker','target-player','dribbler','winger','playmaker','box-to-box','ball-winner','ball-playing-defender','stopper','cover-defender','line-keeper','sweeper-keeper'];
const examples=Object.fromEntries(ROLES.map(role=>[role,Object.fromEntries(Object.entries(personality({tacticalRole:role})).map(([k,v])=>[k,+v.toFixed(4)]))]));
const mentalExamples={'poacher calm16 dec14':personality({tacticalRole:'poacher',calm:16,dec:14}),'poacher calm6 dec6':personality({tacticalRole:'poacher',calm:6,dec:6}),'playmaker dec18':personality({tacticalRole:'playmaker',dec:18}),'striker ant17':personality({tacticalRole:'striker',ant:17})};
for(const value of Object.values(mentalExamples))for(const k of Object.keys(value))value[k]=+value[k].toFixed(4);

// ----- decision trace -----
check('decision trace: marked matches only, plain records, ring buffer of 64, never saved',()=>{
 h.call('Native183.constructed',{si:false});
 assert.equal(ev("v183Trace(match,{kind:'shot'})"),null);assert.equal(ev('v183TraceEntries(match).length'),0);
 h.call('Native183.constructed',{si:OFF});h.call('Native183.run',10);
 const first=copy(ev("v183Trace(match,{kind:'pass',player:match.people[1],target:{x:.5,y:.4},seq:99})"));
 assert.equal(first.seq,1);assert.equal(first.at,ev('v183Seconds(match)'));assert.equal(first.player,ev('match.people[1].pid'));assert.deepEqual(first.target,{x:.5,y:.4});
 ev("for(let i=0;i<69;i++)v183Trace(match,{kind:'tick',i})");
 const entries=copy(ev('v183TraceEntries(match)'));assert.equal(entries.length,64);assert.equal(entries[0].seq,7);assert.equal(entries.at(-1).seq,70);
 assert.equal(ev('Object.isFrozen(v183TraceEntries(match)[0])'),true);
 assert.equal(h.call('Native183.checkpoint'),true);
 assert(!JSON.stringify(copy(h.call('Native183.savedMatch'))).includes('"tick"'),'trace is not part of the snapshot');
 assert.equal(ev('v183TraceEntries(match).length'),0,'restored match starts without trace');
});

// ----- ledger sources -----
check('ledger sources: additive tags on marked ledgers only, by match, flight or event',()=>{
 h.call('Native183.constructed',{si:OFF});h.call('Native183.run',80);
 assert(ev('match.ballAccounting.events.length')>0,'kickoff created ledger events');
 const id=ev('match.ballEventId');
 assert.equal(ev("v183LedgerSource(match,'cross')?.id"),id);assert.equal(ev("v183LedgerSource(match,'cross')?.id"),id);
 assert.deepEqual(copy(ev(`match.ballAccounting.events.find(e=>e.id===${id}).sources`)),['cross'],'no duplicate tag');
 assert.equal(ev("v183LedgerSource(match,'volley')"),null,'unknown tag');
 const event=ev('match.ballAccounting.events[0]');assert.equal(ev("v183LedgerSource(match.ballAccounting.events[0],'counter')===match.ballAccounting.events[0]"),true);
 assert.deepEqual(copy(ev('match.ballAccounting.events[0].sources')).includes('counter'),true);
 assert.equal(ev("v183LedgerSource({id:1,kind:'pass'},'header')"),null,'foreign object');
 assert(event);
 h.call('Native183.constructed',{si:false});h.call('Native183.run',80);
 assert.equal(ev("v183LedgerSource(match,'cross')"),null);
 assert.equal(ev("match.ballAccounting.events.some(e=>'sources' in e)"),false,'unmarked ledger never gains the field');
});

// ----- switches -----
check('radius predicate: exact legacy normalised test unless a marked match supplies metres',()=>{
 const g=fresh(),gev=text=>g.evaluate(text);gev("v183RegisterDefaults('defence',{testPressRadius:2.5})");
 for(const si of [false,{packages:{defence:false}},{packages:{defence:true}}]){
  g.call('Native183.constructed',{si});g.call('Native183.run',30);
  const r=g.copy(gev(`(()=>{const ps=match.people,out=[];for(const a of ps)for(const b of ps){out.push([v183Radius(match,undefined,.15)(a,b),distance(a,b)<.15,v183Radius(match,'defence.testPressRadius',.15)(a,b),v122Metres(a,b)<2.5,v183Radius(match,4,.15)(a,b),v122Metres(a,b)<4]);}return out;})()`));
  for(const [legacy,expected,keyed,metric,metres,metric4]of r){
   assert.equal(legacy,expected);
   assert.equal(keyed,si&&si.packages?.defence?metric:expected,'parameter key only with the active package');
   assert.equal(metres,si===false?expected:metric4,'metre value only for marked matches');
  }
 }
});
check('pace switch: v183PaceFactor returns the exact legacy factor; reasons refine purposeful',()=>{
 h.call('Native183.constructed',{si:OFF});h.call('Native183.run',60);
 assert.equal(ev("v183PaceFactor(match,match.people[1],'support',{factor:1.35})"),1.35);
 assert.equal(ev("v183PaceFactor(match,match.people[1],'base',{})"),1.15);assert.equal(ev("v183PaceFactor(match,match.people[1],'purposeful')"),1.58);
 assert.equal(ev("v183PaceFactor(match,match.people[1],'carrier')"),ev("1.28*(.78+ability(match.people[1],'tec')*.009)"));
 assert.equal(ev("v183PaceReason(match,match.people[1],{read:{nextAt:1e9,purpose:'press'},now:0})"),'press');
 assert.equal(ev("v183PaceReason(match,match.people[1],{contest:true,now:0})"),'contest');
 // Every live player: marked pace equals the legacy computation of an unmarked copy.
 const same=ev("(()=>{const si=match.si;const marked=match.people.map(p=>v157Pace(match,p));delete match.si;const legacy=match.people.map(p=>v157Pace(match,p));match.si=si;return marked.every((v,i)=>v===legacy[i]);})()");
 assert.equal(same,true);
});
check('formation anchor switch: identity stub; team() consults it only with an explicit marked match',()=>{
 const r=copy(ev(`(()=>{let calls=0;const base=v183FormationAnchor;v183FormationAnchor=function(...a){calls++;return base(...a)};try{
  const p={cell:12,pid:'z'},plain=team(p,1),withNull=team(p,1,null),old=team(p,1,{geometry:match.geometry}),marked=team(p,1,{geometry:match.geometry,si:match.si});
  return {calls,same:[withNull,old,marked].every(q=>q.x===plain.x&&q.y===plain.y&&q.bx===plain.bx&&q.by===plain.by)};}finally{v183FormationAnchor=base;}})()`));
 assert.deepEqual(r,{calls:1,same:true});
});
// ball:false: the ball-physics marker 184 is a separate new-match feature (work/test-ball-physics-v184.cjs).
check('marker 183 with every package off replays like the 182 constructor (digest without match.si)',()=>{
 for(const scene of copy(h.call('Native183.constructedScenes')).filter((s,i)=>i%3===0)){
  const marked=h.call('Native183.constructedDigest',scene,{si:OFF,ball:false,withoutSi:true,segments:[200,200]}),legacy=h.call('Native183.constructedDigest',scene,{si:false,segments:[200,200]});
  assert.equal(marked,legacy,scene.id);
 }
});

// ----- stubs -----
check('stubs deliver today\'s values and draw no random number (clearance: one named draw)',()=>{
 h.call('Native183.constructed',{si:OFF});h.call('Native183.run',120);
 const r=copy(ev(`(()=>{const m=match,p=m.people.find(q=>!q.keeper&&q.t===0),q=m.people.find(x=>!x.keeper&&x.t===0&&x!==p),rivals=m.people.filter(x=>x.t!==p.t),d0=Native182.rng().draws;
  const shot=v183ShotEstimate(m,p),moved=v183ShotEstimate(m,p,{x:.5,y:v55Field.top+.08}),pass=v183PassEstimate(m,p,q),pass2=v183PassEstimate(m,p,q,{x:q.x,y:q.y}),cross=v183CrossEstimate(m,p,q),offers=v183Offers(m),clear=v183Clearance(m,q,{x:.5,y:.2},{lateralDraw:.75}),d1=Native182.rng().draws;
  const clear2=v183Clearance(m,q,{x:.5,y:.2}),d2=Native182.rng().draws;
  offers.forEach(o=>{o.x=-5;});
  return {shot,expected:v157ShotQuality(p,rivals),moved,movedExpected:v157ShotQuality({...p,x:.5,y:v55Field.top+.08},rivals),pass,pass2,lane:v157Lane(m,p,{x:q.x,y:q.y},rivals),cross,offersIntact:Object.values(m.attackFlow.intents).every(i=>i.x!==-5),offerCount:offers.length,intentCount:Object.keys(m.attackFlow.intents).length,clear,clear2,drawsStubs:d1-d0,drawsClearance:d2-d1,
   expectedClear:{x:clamp(.5+(.75-.5)*6*(v55Field.right-v55Field.left)/v160PitchWidth(),.07,.93),y:clamp(.2+(q.t===0?-(7+ability(q,'air')*.20):7+ability(q,'air')*.20)*(v55Field.bottom-v55Field.top)/v160PitchLength(),.07,.93)}};})()`));
 assert.equal(r.shot.xg,r.expected);assert.equal(r.shot.window,r.expected>0);assert.equal(r.shot.speed,null);
 assert.equal(r.moved.xg,r.movedExpected);
 assert.equal(r.pass2.arrival,r.lane?1:0);assert(Number.isFinite(r.pass.value)&&Number.isFinite(r.pass2.value));
 assert([0,.5].includes(r.cross.arrival));assert.equal(r.cross.arrival,r.cross.eligible?.5:0);
 assert(r.offersIntact);assert.equal(r.offerCount,r.intentCount);
 assert.deepEqual(r.clear.target,r.expectedClear);assert.equal(r.clear.out,false);
 assert.equal(r.drawsStubs,0);assert.equal(r.drawsClearance,1);
});

check('new switches return today\'s values: rebound finish, keeper reach at three sites',()=>{
 h.call('Native183.constructed',{si:OFF});h.call('Native183.run',200);
 const r=copy(ev(`(()=>{const m=match,p=m.people.find(q=>!q.keeper&&q.t===0),keeper=m.people.find(q=>q.keeper&&q.t===1),si=m.si,flow=m.attackFlow.flowVersion,goal={x:.5,y:v55Field.top},sites={};
  const base=v183KeeperReach;v183KeeperReach=function(mm,k,range,contact,detail){sites[detail.site]=(sites[detail.site]||0)+1;return base.apply(this,arguments)};
  const run=()=>[[.5,.06],[.42,.1],[.6,.15],[.47,.24]].map(([x,dy])=>{const point={x,y:v55Field.top+dy},shooter={...p,x,y:point.y};
   const open=(()=>{m.attackFlow.flowVersion=158;try{return v131OpenGoal(p,point)}finally{m.attackFlow.flowVersion=flow}})();
   return JSON.stringify([m.si?v183ReboundFinish(m,p,point):v131OpenGoal(p,point),v159ShotLane(m,p,point,goal),v115KeeperContact(keeper,shooter,true),v115KeeperContact(keeper,shooter,false),open]);});
  try{const marked=run();delete m.si;const legacy=run();m.si=si;return {same:marked.every((v,i)=>v===legacy[i]),sites};}finally{v183KeeperReach=base;m.si=si;}})()`));
 assert(r.same,'marked and legacy values differ');
 for(const site of ['shot-lane','open-goal','keeper-contact'])assert(r.sites[site]>0,`site ${site} reached`);
});
check('air finish stub: same decision and draws as the legacy rule (one draw only within header range)',()=>{
 h.call('Native183.constructed',{si:OFF});h.call('Native183.run',100);
 const rows=copy(ev(`(()=>{const w=match.people.find(q=>!q.keeper&&q.t===0),end={x:w.x,y:w.y},out=[];
  for(const [headerRange,preferHeader,pressure,seed]of [[true,true,0,777],[true,false,1,778],[false,true,0,779],[true,true,1,780]]){
   Native182.seedRandom(seed);const a=v183AirFinish(match,w,end,{headerRange,preferHeader,pressure}),da=Native182.rng().draws;
   Native182.seedRandom(seed);const b=headerRange&&random()<v115DecisionChance(w,preferHeader?'header':'volley',pressure?.42:.62)?preferHeader?'header':'volley':null,db=Native182.rng().draws;
   out.push({a,b,da,db});}
  return out;})()`));
 for(const row of rows){assert.equal(row.a,row.b);assert.equal(row.da,row.db);}
 assert.deepEqual(rows.map(x=>x.da),[1,1,0,1]);
});
check('clearance: evaluate mode is the deterministic centre without a draw; caller draw and air reproduce today',()=>{
 h.call('Native183.constructed',{si:OFF});h.call('Native183.run',100);
 const r=copy(ev(`(()=>{const d=match.people.find(q=>!q.keeper&&q.t===1),pt={x:.4,y:.8},d0=Native182.rng().draws,a=v183Clearance(match,d,pt,{evaluate:true,lateralDraw:.9}),d1=Native182.rng().draws,b=v183Clearance(match,d,pt,{lateralDraw:.5});
  const c=v183Clearance(match,d,pt,{lateralDraw:.3,air:ability(d,'air')}),e=v183Clearance(match,d,pt,{lateralDraw:.3});return {evaluate:JSON.stringify(a)===JSON.stringify(b),draws:d1-d0,air:JSON.stringify(c)===JSON.stringify(e)};})()`));
 assert.deepEqual(r,{evaluate:true,draws:0,air:true});
});
check('pass estimate stub includes the return-run bonus of a confirmed one-two',()=>{
 h.call('Native183.constructed',{si:OFF});h.call('Native183.run',100);
 const r=copy(ev(`(()=>{const m=match,p=m.people.find(q=>!q.keeper&&q.t===0),q=m.people.find(x=>!x.keeper&&x.t===0&&x!==p),s=v150Scale(m),target={x:p.x,y:p.y-6/s.y},before=m.attackFlow.combination;
  try{m.attackFlow.combination=null;const plain=v183PassEstimate(m,p,q,target);m.attackFlow.combination={receiverId:p.pid,passerId:q.pid,confirmed:true};const one=v183PassEstimate(m,p,q,target);return {plain,one};}finally{m.attackFlow.combination=before;}})()`));
 assert.equal(r.plain.returnRun,false);assert.equal(r.one.returnRun,true);close(r.one.value-r.plain.value,.65,'return-run bonus');
});
check('decision trace limit can be enlarged for measurements and trims back',()=>{
 h.call('Native183.constructed',{si:OFF});h.call('Native183.run',10);
 ev("v183SetTraceLimit(128);for(let i=0;i<200;i++)v183Trace(match,{i})");assert.equal(ev('v183TraceEntries(match).length'),128);
 ev("v183SetTraceLimit(64);v183Trace(match,{i:200})");assert.equal(ev('v183TraceEntries(match).length'),64);assert.equal(ev('v183TraceEntries(match).at(-1).i'),200);
 assert.throws(()=>ev('v183SetTraceLimit(0)'),/integer/);
});
check('keeper hold: legacy 2.4 s without the finish package, parameter finish.keeperHold with it',()=>{
 // held:false waits the plain hold; held:true also covers the 182 placement path.
 const g=fresh(),gev=text=>g.evaluate(text),hold=(si,held)=>{g.call('Native183.constructed',{si});g.call('Native183.run',120);return g.copy(gev(`(()=>{const k=v50Keeper(0);match.rebound=null;match.flight=null;v50GoalKick(k,'hold fixture',{held:${held}});const kick=v99ActionState(match).kicks.get(k.pid);return {gap:match.next-match.elapsed,rate:v183Rate(match),placement:kick.holdPlacement??0};})()`));};
 for(const held of [false,true]){
  const expect=(seconds,r)=>close(r.gap,Math.max(seconds,r.placement)*r.rate,`hold ${seconds} s, held ${held}`);
  expect(2.4,hold({packages:{finish:false}},held));expect(2.4,hold(false,held));
  expect(gev("v183RegisterDefaults('finish',{}).keeperHold??2.4"),hold({packages:{finish:true}},held));
 }
 if(gev("v183RegisterDefaults('finish',{}).keeperHold")===undefined)gev("v183RegisterDefaults('finish',{keeperHold:2.4})");
 for(const held of [false,true]){const r=hold({packages:{finish:true},params:{finish:{keeperHold:1.6}}},held);close(r.gap,Math.max(1.6,r.placement)*r.rate,`finish.keeperHold, held ${held}`);}
 const legacy=hold({packages:{finish:false}},true);close(legacy.gap,Math.max(2.4,legacy.placement)*legacy.rate,'parameter only with the finish package');
});
check('match.si is deeply frozen at construction and again after a restore',()=>{
 h.call('Native183.constructed',{si:{packages:{finish:true}}});
 assert.equal(ev('Object.isFrozen(match.si)&&Object.isFrozen(match.si.packages)&&Object.isFrozen(match.si.params)&&Object.isFrozen(match.si.params.finish)'),true);
 assert.throws(()=>ev("(()=>{'use strict';match.si.packages.finish=false;})()"),e=>e.name==='TypeError');
 h.call('Native183.run',60);let saved=false;for(let i=0;i<40&&!saved;i++){saved=h.call('Native183.checkpoint');if(!saved)h.call('Native183.advance');}
 assert(saved,'checkpoint taken');assert.equal(ev("v183Active(match,'finish')"),true);
 assert.equal(ev('Object.isFrozen(match.si)&&Object.isFrozen(match.si.packages)&&Object.isFrozen(match.si.params.finish)'),true);
});
check('constructed large-pitch scenes use six field players per team',()=>{
 for(const scene of copy(h.call('Native183.constructedScenes'))){h.call('Native183.constructed',scene.config);
  assert.equal(ev('match.people.filter(p=>!p.keeper&&p.t===0).length'),scene.config.size==='large'?6:5,scene.id);}
});

// ----- restore round trip -----
check('restore keeps match.si unchanged and the match continues',()=>{
 h.call('Native183.constructed',{si:{packages:{finish:true},clockRate:.5}});h.call('Native183.run',150);
 const before=copy(ev('match.si'));let saved=false;for(let i=0;i<40&&!saved;i++){saved=h.call('Native183.checkpoint');if(!saved)h.call('Native183.advance');}
 assert(saved,'checkpoint taken');
 assert.deepEqual(copy(h.call('Native183.savedMatch')).si,before,'snapshot carries match.si');
 assert.deepEqual(copy(ev('match.si')),before,'restored match.si');
 assert.equal(ev("v183Active(match,'finish')"),true);assert.equal(ev('match.si.clockRate'),.5);
 h.call('Native183.run',300);assert.equal(ev('v183Marked(match)'),true);
});
check('restore never adds match.si to older matches',()=>{
 h.call('Native183.constructed',{si:false});h.call('Native183.run',150);let saved=false;for(let i=0;i<40&&!saved;i++){saved=h.call('Native183.checkpoint');if(!saved)h.call('Native183.advance');}
 assert(saved);assert.equal(ev("Object.hasOwn(match,'si')"),false);
 assert.equal(Object.hasOwn(copy(h.call('Native183.savedMatch')),'si'),false);
 // A v182 scene (loose ball, 182 marker) restored through the native checkpoint.
 h.call('Native182.looseScene',{kind:'rolling',team:0,size:'standard',seed:3,marker:true});
 h.call('Native182.checkpoint');assert.equal(ev("Object.hasOwn(match,'si')"),false);
 // An unmarked stored snapshot stays unmarked.
 h.call('Native182.looseScene',{kind:'static',team:1,size:'large',seed:4,marker:false});
 h.call('Native182.checkpoint');assert.equal(ev("Object.hasOwn(match,'si')||Object.hasOwn(match.attackFlow,'looseBallRevision')"),false);
});

console.log(JSON.stringify({pass:true,checks:checks.length,names:checks,personalityAtMental10:examples,personalityMentalExamples:mentalExamples}));

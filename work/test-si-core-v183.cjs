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

// ----- load and build lists -----
check('index.html loads core then the seven packages between football flow v159 and ball events v117',()=>{
 const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8'),scripts=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]),at=scripts.indexOf('world-football-flow-v159.js');
 assert.deepEqual(scripts.slice(at+1,at+10),[...SI_FILES,'match-ball-events-v117.js']);
 for(const file of SI_FILES)assert(fs.existsSync(path.join(root,'dist',file)),file);
});
check('build.cjs and the native130 harness list carry the same eight modules in load order',()=>{
 for(const file of ['work/build.cjs','work/native130-harness.cjs']){
  const text=fs.readFileSync(path.join(root,file),'utf8');
  assert(text.includes(`'world-football-flow-v159.js',${SI_FILES.map(f=>`'${f}'`).join(',')},'match-ball-events-v117.js'`),file);
 }
});
const h=fresh();
const ev=text=>h.evaluate(text),copy=value=>h.copy(value);
check('all shared interfaces exist as global functions',()=>{
 for(const name of ['v183Active','v183Param','v183Rate','v183Seconds','v183ClockUnits','v183Personality','v183Trace','v183LedgerSource','v183Radius','v183PaceFactor','v183RegisterDefaults','v183ShotEstimate','v183CrossEstimate','v183PassEstimate','v183Offers','v183Clearance','v183CreateSi','v183EnableByDefault','v183Marked','v183TraceEntries','v183PaceReason','v183FormationAnchor','v117AddSource'])
  assert.equal(ev(`typeof ${name}`),'function',name);
});

// ----- marker and configuration -----
check('constructor default: marker 183, current clock rate, every package off, empty parameter sets',()=>{
 h.call('Native183.constructed',{});
 const si=copy(ev('match.si'));
 assert.deepEqual(Object.keys(si),['revision','clockRate','packages','params']);
 assert.equal(si.revision,183);assert.equal(si.clockRate,ev('MATCH_SPEED'));assert.equal(si.clockRate,.78);
 assert.deepEqual(si.packages,Object.fromEntries(PACKAGES.map(p=>[p,false])));
 assert.deepEqual(si.params,Object.fromEntries(PACKAGES.map(p=>[p,{}])));
 for(const p of PACKAGES)assert.equal(ev(`v183Active(match,'${p}')`),false,p);
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
 h.call('Native183.constructed',{si:{packages:{finish:true,clock:true},clockRate:.42}});
 assert.equal(ev("v183Active(match,'finish')"),true);assert.equal(ev("v183Active(match,'clock')"),true);assert.equal(ev("v183Active(match,'options')"),false);
 assert.equal(ev('match.si.clockRate'),.42);
 for(const [options,pattern]of [[{packages:{finesse:true}},/Unknown SI package/],[{packages:{finish:1}},/boolean expected/],[{params:{finish:{spread:1}}},/Unknown SI parameter/],[{clockRate:0},/positive number/],[{clockRate:'0.4'},/positive number/],[{speed:1},/Unknown SI option/]])
  assert.throws(()=>h.call('Native183.constructed',{si:options}),pattern);
 assert.throws(()=>ev("v183Active(match,'defense')"),/Unknown SI package/);
});
check('registered defaults are copied into new matches; overrides keep their type; double registration is rejected',()=>{
 const g=fresh(),gev=text=>g.evaluate(text);
 assert.deepEqual(g.copy(gev("v183RegisterDefaults('finish',{spread:.5,mode:'near',zones:[1,2]})")),{spread:.5,mode:'near',zones:[1,2]});
 assert.deepEqual(g.copy(gev("v183RegisterDefaults('finish',{spread:.5})")),{spread:.5,mode:'near',zones:[1,2]},'same value may be repeated');
 assert.throws(()=>gev("v183RegisterDefaults('finish',{spread:.6})"),/registered twice/);
 assert.throws(()=>gev("v183RegisterDefaults('finish',{bad:()=>1})"),/plain JSON/);
 assert.throws(()=>gev("v183RegisterDefaults('finish',{bad:NaN})"),/non-finite/);
 assert.throws(()=>gev("v183RegisterDefaults('kicks',{a:1})"),/Unknown SI package/);
 g.call('Native183.constructed',{si:{params:{finish:{spread:.7}}}});
 assert.deepEqual(g.copy(gev('match.si.params.finish')),{spread:.7,mode:'near',zones:[1,2]});
 assert.equal(gev("v183Param(match,'finish.spread')"),.7);assert.equal(gev("v183Param(match,'finish.mode')"),'near');
 assert.equal(gev("match.si.params.finish.zones===v183Param(match,'finish.zones')"),true);
 assert.throws(()=>g.call('Native183.constructed',{si:{params:{finish:{spread:'0.7'}}}}),/number expected/);
 assert.throws(()=>gev("v183Param(match,'spread')"),/<package>\.<name>/);
 // Registry objects are not shared with the stored parameters.
 gev("match.si.params.finish.zones.push(3)");g.call('Native183.constructed',{});assert.deepEqual(g.copy(gev('match.si.params.finish.zones')),[1,2]);
 // A stored value wins; a parameter missing from a saved match reads the default.
 gev("delete match.si.params.finish.mode");assert.equal(gev("v183Param(match,'finish.mode')"),'near');
 g.call('Native183.constructed',{si:false});assert.equal(gev("v183Param(match,'finish.spread')"),.5,'unmarked match reads the registered default');
 gev("v183EnableByDefault('setplay')");g.call('Native183.constructed',{});
 assert.equal(gev("v183Active(match,'setplay')"),true);assert.equal(gev("v183Active(match,'finish')"),false);
 g.call('Native183.constructed',{si:{packages:{setplay:false}}});assert.equal(gev("v183Active(match,'setplay')"),false);
});

// ----- clock -----
check('clock helpers: MATCH_SPEED arithmetic without the clock package, stored rate with it',()=>{
 h.call('Native183.constructed',{si:false});h.call('Native183.run',40);
 assert.equal(ev('v183Rate(match)'),ev('MATCH_SPEED'));assert.equal(ev('v183Seconds(match)'),ev('v152Seconds(match)'));
 for(const s of [.32,.75,2.7,1/3])assert.equal(ev(`v183ClockUnits(match,${s})`),ev(`${s}*MATCH_SPEED`));
 h.call('Native183.constructed',{si:{clockRate:.42}});h.call('Native183.run',40);
 assert.equal(ev('v183Rate(match)'),.78,'stored rate only with the clock package');assert.equal(ev('v183Seconds(match)'),ev('v152Seconds(match)'));
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
 h.call('Native183.constructed',{});h.call('Native183.run',10);
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
 h.call('Native183.constructed',{});h.call('Native183.run',80);
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
 const g=fresh(),gev=text=>g.evaluate(text);gev("v183RegisterDefaults('defence',{pressRadius:2.5})");
 for(const si of [false,undefined,{packages:{defence:true}}]){
  g.call('Native183.constructed',{si});g.call('Native183.run',30);
  const r=g.copy(gev(`(()=>{const ps=match.people,out=[];for(const a of ps)for(const b of ps){out.push([v183Radius(match,undefined,.15)(a,b),distance(a,b)<.15,v183Radius(match,'defence.pressRadius',.15)(a,b),v122Metres(a,b)<2.5,v183Radius(match,4,.15)(a,b),v122Metres(a,b)<4]);}return out;})()`));
  for(const [legacy,expected,keyed,metric,metres,metric4]of r){
   assert.equal(legacy,expected);
   assert.equal(keyed,si&&si.packages?.defence?metric:expected,'parameter key only with the active package');
   assert.equal(metres,si===false?expected:metric4,'metre value only for marked matches');
  }
 }
});
check('pace switch: v183PaceFactor returns the exact legacy factor; reasons refine purposeful',()=>{
 h.call('Native183.constructed',{});h.call('Native183.run',60);
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
check('marker 183 with every package off replays like the 182 constructor (digest without match.si)',()=>{
 for(const scene of copy(h.call('Native183.constructedScenes')).filter((s,i)=>i%3===0)){
  const marked=h.call('Native183.constructedDigest',scene,{withoutSi:true,segments:[200,200]}),legacy=h.call('Native183.constructedDigest',scene,{si:false,segments:[200,200]});
  assert.equal(marked,legacy,scene.id);
 }
});

// ----- stubs -----
check('stubs deliver today\'s values and draw no random number (clearance: one named draw)',()=>{
 h.call('Native183.constructed',{});h.call('Native183.run',120);
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

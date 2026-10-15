'use strict';
// SI-5 (player intelligence 183): large pitch and six field players. Actual dist
// controllers in the native VM harness (native183-scenes.cjs). Checks the old
// path (no marker, package off, standard pitch: digest-identical), the new path
// on the large pitch (pace, shooter window, and the shape parameters that are
// off by default: anchors, line base and line plans in metres), the default
// grid cells of lines of four to six players, a restore round trip on the large
// pitch and the missing random draws.
// Usage: node work/test-si-field-v183.cjs
const assert=require('node:assert/strict'),{create}=require('./native183-scenes.cjs');
const h=create({view:false}),checks=[],measurements={};const check=(name,fn)=>{fn();checks.push(name);};
const ev=text=>h.evaluate(text),copy=value=>h.copy(value);
const PACKAGES=['clock','options','offball','finish','defence','setplay','field'],ALL_OFF=Object.fromEntries(PACKAGES.map(p=>[p,false]));
const FIELD_ONLY={...ALL_OFF,field:true};
const SHAPE={field:{anchorWidth:35,rowGap:9.2,pin:1,defenderLine:1,linePlans:1}};
const live=()=>{for(let i=0;i<3000;i++){h.call('Native183.advance');if(ev('Boolean(match.owner&&!match.owner.keeper&&!match.flight&&!v121PositioningPaused(match))'))return;}throw Error('no live ball');};
// SI-1 window defaults as registered (SI-K: 12.5 + 0.75*fin).
const OPT=copy(ev('v183Registry.defaults.options')),WB=OPT.windowBase,WF=OPT.windowFin;
const close=(a,b,eps,msg)=>assert(Math.abs(a-b)<=eps,`${msg}: ${a} vs ${b}`);

// ----- registration and switch -----
check('the package registers its parameters and is on by default in new matches; no state of its own',()=>{
 h.call('Native183.constructed',{size:'large'});
 assert.equal(ev("v183Active(match,'field')"),true);
 const params=copy(ev('match.si.params.field'));
 for(const key of ['carrierPaceGain','runPaceGain','pressPaceGain','otherPaceGain','windowGain','anchorWidth','rowGap','pin','pinFull','defenderLine','linePlans'])assert.equal(typeof params[key],'number',key);
 assert.equal(params.carrierPaceGain,1);assert.equal(params.runPaceGain,.75);assert.equal(params.windowGain,12);assert.equal(params.carrierCloseGain,.5);assert.equal(params.carrierSpeedMax,8.5);assert.equal(params.runSpeedMax,9.5);
 assert.equal(params.anchorWidth+params.rowGap+params.pin+params.defenderLine+params.linePlans,0,'shape parameters are off by default');
 h.call('Native183.run',300);
 assert.equal(ev("Object.keys(match.attackFlow).filter(k=>/field/i.test(k)).length"),0,'no field state in attackFlow');
 assert.equal(ev("Object.keys(match).filter(k=>/field/i.test(k)).length"),0,'no field state in the match');
 h.call('Native183.constructed',{size:'large',si:{packages:{field:false}}});assert.equal(ev("v183Active(match,'field')"),false);
});

// ----- old path -----
check('marker with every package off replays like the 182 constructor (digest without match.si)',()=>{
 for(const scene of copy(h.call('Native183.constructedScenes')).filter((s,i)=>i%4===1)){
  const off=h.call('Native183.constructedDigest',scene,{si:{packages:ALL_OFF},withoutSi:true,segments:[250,250]}),legacy=h.call('Native183.constructedDigest',scene,{si:false,segments:[250,250]});
  assert.equal(off,legacy,scene.id);
 }
});
check('the standard pitch is untouched by the package: field on equals field off, also with extreme parameters',()=>{
 for(const scene of copy(h.call('Native183.constructedScenes')).filter(s=>s.config.size==='standard')){
  const on=h.call('Native183.constructedDigest',scene,{si:{packages:FIELD_ONLY},withoutSi:true,segments:[300,300]}),off=h.call('Native183.constructedDigest',scene,{si:{packages:ALL_OFF},withoutSi:true,segments:[300,300]});
  assert.equal(on,off,scene.id);
 }
 const scene={config:{club:'GER-2',seed:'std-extreme',size:'standard',roles:true}};
 const extreme={field:{...SHAPE.field,carrierPaceGain:3,runPaceGain:3,pressPaceGain:3,otherPaceGain:3,windowGain:30}};
 const on=h.call('Native183.constructedDigest',scene,{si:{packages:FIELD_ONLY,params:extreme},withoutSi:true,segments:[300,300]}),off=h.call('Native183.constructedDigest',scene,{si:{packages:ALL_OFF},withoutSi:true,segments:[300,300]});
 assert.equal(on,off,'extreme parameters on the standard pitch');
});
check('field on changes the large pitch; the shape parameters change it again',()=>{
 const scene={config:{club:'GER-2',seed:'large-diff',size:'large',roles:true}};
 const digest=si=>h.call('Native183.constructedDigest',scene,{si,withoutSi:true,segments:[300]});
 const off=digest({packages:ALL_OFF}),on=digest({packages:FIELD_ONLY}),shape=digest({packages:FIELD_ONLY,params:SHAPE});
 assert.notEqual(on,off);assert.notEqual(shape,on);
});
check('the wrapped functions hand marked matches with the package off and unmarked matches to the previous functions',()=>{
 const probe=`(()=>{const p=match.people.find(q=>!q.keeper&&q.t===0),c=p.cell;return {anchor:team({...p,cell:c},0,match),bases:[v55DefenderY(0,0),v55DefenderY(1,1)],pace:[v183PaceFactor(match,p,'carrier',{factor:1.28}),v183PaceFactor(match,p,'support',{factor:1.35}),v183PaceFactor(match,p,'base',{})],window:match.si?v183OptWindowBase(match):null};})()`;
 h.call('Native183.constructed',{size:'large',si:{packages:ALL_OFF}});const off=copy(ev(probe));
 h.call('Native183.constructed',{size:'large',si:false});const legacy=copy(ev(probe));
 assert.deepEqual(off.anchor,legacy.anchor);assert.deepEqual(off.bases,legacy.bases);assert.deepEqual(off.pace,legacy.pace);
 assert.equal(off.window,WB,'SI-1 window unchanged with the package off');
});

// ----- pace and shooter window -----
check('pace: carrier and own runs scale with the pitch length, other purposes keep the previous factors; the standard pitch is exact',()=>{
 const measure=packages=>{
  h.call('Native183.constructed',{size:'large',roles:true,si:{packages}});live();
  return copy(ev(`(()=>{const p=match.people.find(q=>!q.keeper&&q.t===v123PossessionTeam(match)&&q!==match.owner),f=(purpose,detail)=>v183PaceFactor(match,p,purpose,detail),now=v183Seconds(match);
   const near=match.people.some(q=>q.t!==p.t&&!q.keeper&&v122Metres(q,p)<2.5);
   match.attackFlow.intents[p.pid]={x:p.x,y:p.y,type:'depth',team:p.t,at:now,until:now+5};const run=f('purposeful',{intent:match.attackFlow.intents[p.pid],now});delete match.attackFlow.intents[p.pid];
   return {carrier:f('carrier',{}),run,support:f('support',{factor:1.35}),base:f('base',{}),near};})()`));
 };
 const off=measure({...ALL_OFF,offball:true,defence:true}),on=measure({...ALL_OFF,offball:true,defence:true,field:true});
 const extra=ev('match.geometry.length/68-1');
 close(on.carrier,off.carrier*(1+1*extra),1e-12,'carrier');close(on.run,off.run*(1+.75*extra),1e-12,'run');
 assert.equal(on.support,off.support);assert.equal(on.base,off.base);
 // Standard pitch: field on equals field off exactly.
 const stdOn=(()=>{h.call('Native183.constructed',{size:'standard',roles:true,si:{packages:{...ALL_OFF,offball:true,field:true}}});h.call('Native183.run',60);return copy(ev("v183PaceFactor(match,match.people.find(q=>!q.keeper&&q.t===0),'carrier',{})"));})();
 const stdOff=(()=>{h.call('Native183.constructed',{size:'standard',roles:true,si:{packages:{...ALL_OFF,offball:true}}});h.call('Native183.run',60);return copy(ev("v183PaceFactor(match,match.people.find(q=>!q.keeper&&q.t===0),'carrier',{})"));})();
 assert.equal(stdOn,stdOff);
 // Pressing: the factor of SI-4 is scaled by pressPaceGain only.
 h.call('Native183.constructed',{size:'large',roles:true,si:{packages:{...ALL_OFF,defence:true,field:true},params:{field:{pressPaceGain:2}}}});live();
 const press=copy(ev("(()=>{const p=match.people.find(q=>!q.keeper&&q.t===0),d={read:{nextAt:1e9,purpose:'press'},now:0};return {reason:v183PaceReason(match,p,d),factor:v183PaceFactor(match,p,'purposeful',d)};})()"));
 assert.equal(press.reason,'press');
 // Run ceiling.
 h.call('Native183.constructed',{size:'large',roles:true,si:{packages:{...ALL_OFF,offball:true,field:true},params:{field:{runSpeedMax:9}}}});live();
 const runCap=copy(ev("(()=>{const p=match.people.find(q=>!q.keeper&&q.t===v123PossessionTeam(match)&&q!==match.owner),now=v183Seconds(match);p.spd=18;match.attackFlow.intents[p.pid]={x:p.x,y:p.y,type:'depth',team:p.t,at:now,until:now+5};const f=v183PaceFactor(match,p,'purposeful',{intent:match.attackFlow.intents[p.pid],now});delete match.attackFlow.intents[p.pid];return {speed:f*(3+ability(p,'spd')*.14),unscaled:1.58*(3+ability(p,'spd')*.14)};})()"));
 assert(runCap.speed<=9+1e-9,'run ceiling '+runCap.speed);assert(runCap.speed>=runCap.unscaled-1e-9);close(press.factor,1.58*(1+2*.2),1e-12,'press pace with its gain');
 // Duel pace (rival inside the close radius) follows carrierCloseGain (0: the standard value); ceilings are absolute m/s.
 const duel=params=>{h.call('Native183.constructed',{size:'large',roles:true,si:{packages:{...ALL_OFF,offball:true,field:true},params:{field:params}}});live();
  return copy(ev(`(()=>{const o=match.owner,s=v150Scale(),r=match.people.find(q=>q.t!==o.t&&!q.keeper);r.x=o.x;r.y=o.y-(o.t===0?1:-1)*1.5/s.y;const f=v183PaceFactor(match,o,'carrier',{}),tec=.78+ability(o,'tec')*.009,base=3+ability(o,'spd')*.14;
   o.spd=18;const hi=v183PaceFactor(match,o,'carrier',{}),hiBase=3+ability(o,'spd')*.14;r.y=o.y-(o.t===0?1:-1)*8/s.y;const open=v183PaceFactor(match,o,'carrier',{}),openUnscaled=1.5*tec;return {duel:f,duelUnscaled:1.28*tec,hiSpeed:hi*hiBase,openSpeed:open*hiBase,openUnscaled,base};})()`));};
 const d0=duel({carrierCloseGain:0});close(d0.duel,d0.duelUnscaled,1e-12,'carrierCloseGain 0 keeps the duel pace of the standard pitch');
 const dd=duel({});close(dd.duel,dd.duelUnscaled*1.1,1e-12,'default close gain 0.5: duel pace x1.1');assert(dd.duel*dd.base<1.58*dd.base,'the duel pace stays below the pressing pace 1.58');
 const d1=duel({carrierCloseGain:1});close(d1.duel,d1.duelUnscaled*1.2,1e-12,'with a close gain the duel pace scales');
 const cap=duel({carrierSpeedMax:8.5});assert(cap.openSpeed<=8.5+1e-9,'open carrier at spd 18 stays below the ceiling: '+cap.openSpeed);assert(cap.hiSpeed<=8.5+1e-9);
 const low=duel({carrierSpeedMax:3});assert(low.openSpeed>=1.5*(3+18*.14)*(.78)-1e-9,'a ceiling never lowers the pace below the unscaled one');
 measurements.pace={carrierOff:+off.carrier.toFixed(3),carrierOn:+on.carrier.toFixed(3),carrierCloseRival:off.near,runOff:+off.run.toFixed(3),runOn:+on.run.toFixed(3)};
});
check('shooter window of SI-1: the switch v183OptWindowBase grows with the pitch length; v183Param keeps returning the stored value; the effective window is traced',()=>{
 h.call('Native183.constructed',{size:'large',roles:true});
 assert.equal(ev("v183OptWindowBase(match)"),WB+12*(81.6/68-1));assert.equal(ev('match.si.params.options.windowBase'),WB);
 assert.equal(ev("v183Param(match,'options.windowBase')"),WB,'SI-F contract: v183Param returns the stored value');
 assert.equal(ev("v183OptParams(match).windowBase"),ev('v183OptWindowBase(match)'),'SI-1 reads the window through the switch');
 assert.equal(ev("v183Param(match,'options.windowFin')"),WF,'other options keys untouched');
 h.call('Native183.constructed',{size:'standard',roles:true});assert.equal(ev("v183OptWindowBase(match)"),WB);
 h.call('Native183.constructed',{size:'large',roles:true,si:{params:{field:{windowGain:0}}}});assert.equal(ev("v183OptWindowBase(match)"),WB);
 h.call('Native183.constructed',{size:'large',roles:true,si:{packages:{field:false}}});assert.equal(ev("v183OptWindowBase(match)"),WB);
 h.call('Native183.constructed',{size:'large',roles:true,si:false});assert.equal(ev("(()=>{v183StrictParams(false);const v=v183OptWindowBase(match);v183StrictParams(true);return v;})()"),undefined,'unmarked matches read nothing');
 assert.throws(()=>{h.call('Native183.constructed',{size:'large',si:false});ev("v183OptWindowBase(match)");},/without marker 183/);
 // The decision trace carries the effective window (large: windowBase + 2.4 m + windowFin * finishing).
 h.call('Native183.constructed',{size:'large',roles:true,si:{packages:{...ALL_OFF,options:true,field:true}}});ev('v183SetTraceLimit(2000)');
 let entries=[];for(let i=0;i<40&&!entries.some(e=>e.type==='options'&&e.window!==undefined);i++){h.call('Native183.run',100);entries=copy(ev('v183TraceEntries(match)'));}
 const withWindow=entries.filter(e=>e.type==='options'&&e.window!==undefined);assert(withWindow.length>0,'options trace entries carry the window');
 const pids=new Map(copy(ev("match.people.map(p=>[p.pid,ability(p,'fin')])")));
 for(const e of withWindow.slice(0,50))if(pids.has(e.pid))close(e.window,WB+2.4+WF*pids.get(e.pid),.1+WF*.5,'traced window '+e.pid);
 h.call('Native183.constructed',{size:'standard',roles:true,si:{packages:{...ALL_OFF,options:true,field:true}}});ev('v183SetTraceLimit(2000)');
 for(let i=0;i<40&&!copy(ev("v183TraceEntries(match).some(e=>e.type==='options')"));i++)h.call('Native183.run',100);
 const std=copy(ev('v183TraceEntries(match)')).filter(e=>e.type==='options'&&e.window!==undefined),sp=new Map(copy(ev("match.people.map(p=>[p.pid,ability(p,'fin')])")));
 assert(std.length>0);for(const e of std.slice(0,50))if(sp.has(e.pid))close(e.window,WB+WF*sp.get(e.pid),.1+WF*.5,'standard traced window');
});

// ----- shape parameters in metres (off by default) -----
h.run(`
function Si5Metres(m,p){const u={x:m.geometry.width/(v55Field.right-v55Field.left),y:m.geometry.length/(v55Field.bottom-v55Field.top)};return {u,x:(p.bx-.5)*u.x};}
function Si5AnchorMetres(m,cell,t=0){const p=team({cell,pid:'c'+cell},t,m),u=Si5Metres(m,p).u,own=t===0?v55Field.bottom:v55Field.top,goal=t===0?v55Field.top:v55Field.bottom;return {x:(p.bx-.5)*u.x,own:Math.abs(p.by-own)*u.y,goal:Math.abs(p.by-goal)*u.y,bx:p.bx,by:p.by,tx:p.tx,x0:p.x,y0:p.y};}
`,'si5-fixture');
check('formation anchors: lateral span and row gap capped in metres; the lines keep the standard distance from their goal (parameters on)',()=>{
 h.call('Native183.constructed',{size:'large',roles:true,si:{params:SHAPE}});
 const a=cell=>copy(ev(`Si5AnchorMetres(match,${cell},0)`)),std=copy(ev("({ux:44/(v55Field.right-v55Field.left),uy:68/(v55Field.bottom-v55Field.top)})"));
 const span=a(14).x-a(10).x;assert(span<=35+1e-9,`lateral span ${span}`);
 // Lines beyond pinFull from the centre line (rows 0 and 6) keep the standard distance from their goal exactly; rows 1 and 5 almost (fade to the centre line).
 const top=ev('v55Field.top'),bottom=ev('v55Field.bottom');
 close(a(2).goal,(.12-top)*std.uy,1e-9,'front row to the attacked goal');close(a(32).own,(bottom-(.12+6*.125))*std.uy,1e-9,'back row to the own goal');
 close(a(7).goal,(.12+.125-top)*std.uy,.7,'attack row 1');close(a(27).own,(bottom-(.12+5*.125))*std.uy,.7,'defence row 5');
 // Rows never get farther apart than the standard grid.
 const rows=[0,1,2,3,4,5,6].map(r=>a(r*5+2).goal);for(let r=1;r<rows.length;r++)assert(rows[r]-rows[r-1]>0);
 // Mirror: team 1 gets the mirrored anchor.
 const b=copy(ev('Si5AnchorMetres(match,7,1)'));close(b.goal,a(7).goal,1e-9,'team 1 mirrored');
 // Same grid on the standard pitch: untouched.
 h.call('Native183.constructed',{size:'standard',roles:true,si:{params:SHAPE}});
 const s=copy(ev('Si5AnchorMetres(match,7,0)')),plain=copy(ev("(()=>{const p=team({cell:7,pid:'c'},0,{geometry:match.geometry});return {bx:p.bx,by:p.by};})()"));
 assert.equal(s.bx,plain.bx);assert.equal(s.by,plain.by);
 measurements.anchors={span:+span.toFixed(2),frontRowToGoal:+a(2).goal.toFixed(2),attackRowToGoal:+a(7).goal.toFixed(2),defenceRowToGoal:+a(27).own.toFixed(2),backRowToGoal:+a(32).own.toFixed(2)};
});
check('line base and line plans: pinned to the standard distance from the own goal; the plan mapping is applied to line plans only, never to marks',()=>{
 h.call('Native183.constructed',{size:'large',roles:true,si:{params:SHAPE}});h.call('Native183.run',200);
 const probe=`(()=>{const m=match,u=m.geometry.length/(v55Field.bottom-v55Field.top),std=68/(v55Field.bottom-v55Field.top);
  const base=v183FieldBaseDefenderY(0,0),mapped=v55DefenderY(0,0);
  // Plans without and with the mapping of the same tick state.
  const mapping=v183FieldBasePositioning;mapping.call(null,m);const plain=new Map([...v121PositioningPlans.get(m)].map(([p,pl])=>[p.pid,{...pl,mark:pl.mark?pl.mark.pid:pl.mark}]));
  v121PreparePositioning(m);const withMap=new Map([...v121PositioningPlans.get(m)].map(([p,pl])=>[p.pid,{...pl,mark:pl.mark?pl.mark.pid:pl.mark}]));
  let lines=0,marks=0,badMarks=0,badLines=0;const k=v183FieldFactors(m);
  for(const [pid,pl] of withMap){const q=plain.get(pid);if(!q||!Number.isFinite(pl.y))continue;const p=m.people.find(x=>x.pid===pid);
   if(pl.mark===null){lines++;const want=v183FieldMapTeamY(m,p.t,q.y,k);if(Math.abs(want-pl.y)>1e-12)badLines++;}
   else{marks++;if(pl.y!==q.y)badMarks++;}}
  return {neutralMetres:Math.abs(mapped-v55Field.bottom)*u,standardMetres:Math.abs((base-v55Field.bottom))*std,baseMetres:Math.abs(base-v55Field.bottom)*u,lines,marks,badLines,badMarks};})()`;
 let r=copy(ev(probe));
 for(let i=0;i<2500&&r.marks===0;i++){h.call('Native183.run',5);r=copy(ev(probe));}
 assert(r.lines>0,'line plans exist');assert(r.marks>0,'marks exist');assert.equal(r.badLines,0);assert.equal(r.badMarks,0);
 close(r.neutralMetres,r.standardMetres,.3,'neutral line base: standard metres from the own goal (fade within pinFull)');
 assert(r.baseMetres>r.neutralMetres+1,'the unmapped large pitch is deeper');
 measurements.lines={neutralLineFromGoal:+r.neutralMetres.toFixed(2),unmapped:+r.baseMetres.toFixed(2),linePlans:r.lines,marks:r.marks};
});

// ----- no random draw, no state -----
check('the package draws no random number and writes no state (pure functions)',()=>{
 h.call('Native183.constructed',{size:'large',roles:true,si:{params:SHAPE}});h.call('Native183.run',120);
 const r=copy(ev(`(()=>{const m=match,p=m.people.find(q=>!q.keeper&&q.t===0),d0=Native182.rng().draws,before=JSON.stringify(m.attackFlow);
  for(let i=0;i<20;i++){team({cell:i,pid:'x'},i&1,m);v55DefenderY(i&1,i%3-1);v183PaceFactor(m,p,'carrier',{});v183OptWindowBase(m);}
  v121PreparePositioning(m);
  return {draws:Native182.rng().draws-d0,same:JSON.stringify(m.attackFlow)===before};})()`));
 assert.deepEqual(r,{draws:0,same:true});
});

// ----- grid cells of lines of four to six players -----
check('default grid cells: lines of one to three keep their cells; four to six players fill the grid symmetrically',()=>{
 const cells=copy(ev('v64GridCells')),role=cell=>copy(h.call('v64GridRole',cell));
 const old={def:[[27],[26,28],[25,27,29]],mid:[[17],[16,18],[15,17,19]],att:[[7],[6,8],[5,7,9]]};for(const line of Object.keys(old))for(const n of [1,2,3])assert.deepEqual(cells[line][n],old[line][n-1],`${line} ${n}`);
 for(const line of ['def','mid','att']){
  for(const count of [1,2,3,4,5,6]){
   const set=cells[line][count];assert.equal(set.length,count,`${line} ${count}`);assert.equal(new Set(set).size,count,`${line} ${count} distinct`);
   for(const cell of set)assert.equal(role(cell),line,`${line} cell ${cell} belongs to the line`);
   // Mirror symmetry about the centre column: column c <-> 4-c within each row.
   const key=new Set(set.map(c=>Math.floor(c/5)+':'+(c%5)));for(const c of set)assert(key.has(Math.floor(c/5)+':'+(4-c%5)),`${line} ${count} symmetric: ${set}`);
  }
 }
 assert.deepEqual(cells.def[4],[25,26,28,29]);assert.deepEqual(cells.def[5],[25,26,27,28,29]);assert.deepEqual(cells.def[6],[25,27,29,30,32,34]);
 assert.deepEqual(cells.mid[6],[10,12,14,20,22,24]);assert.deepEqual(cells.att[6],[0,2,4,5,7,9]);
 // The six-player formation presets only use lines of at most three: their cells are the old ones.
 const six=copy(ev('v160SixFormations'));
 for(const f of six){const parts=f.split('–').map(Number);assert(parts.every(n=>n<=3),f);}
 measurements.cells=Object.fromEntries(['def','mid','att'].map(line=>[line,{4:cells[line][4],5:cells[line][5],6:cells[line][6]}]));
});
check('a line of four with five field players on the standard pitch (4–1–0): symmetric cells, distinct, in their band; only without stored cells',()=>{
 // matchConfig allows any line counts, also with five field players (zero lines): 4–1–0 puts four players in the defence.
 h.call('Native183.constructed',{size:'standard',roles:true});
 const r=copy(ev(`(()=>{const ctx=Native183.context();v64SetFormation(ctx.career,ctx.fixture,ctx.state,0,'4–1–0','test');
  const field=v64Active(ctx.state,0).filter(pid=>ctx.state.roles[pid]!=='gk'),cells=v64EnsureCells(ctx.state,0),by=role=>field.filter(pid=>ctx.state.roles[pid]===role).map(pid=>cells[pid]).sort((a,b)=>a-b);
  const stored=Object.fromEntries(field.map(pid=>[pid,cells[pid]]));v64EnsureCells(ctx.state,0);
  return {def:by('def'),mid:by('mid'),att:by('att'),stillStored:field.every(pid=>cells[pid]===stored[pid])};})()`));
 assert.deepEqual(r.def,[25,26,28,29]);assert.deepEqual(r.mid,[17]);assert.deepEqual(r.att,[]);assert.equal(r.stillStored,true,'stored cells are never overwritten');
 measurements.fourInOneLine=r;
});
check('real six-player lineups: every preset formation resolves to distinct symmetric cells (ensure and reset)',()=>{
 h.call('Native183.constructed',{size:'large',roles:true});
 const result=copy(ev(`(()=>{const ctx=Native183.context(),out=[];
  for(const f of v160SixFormations){v64SetFormation(ctx.career,ctx.fixture,ctx.state,0,f,'test');
   const active=v64Active(ctx.state,0).filter(pid=>ctx.state.roles[pid]!=='gk'),cells=v64EnsureCells(ctx.state,0),list=active.map(pid=>cells[pid]);
   out.push({f,n:list.length,distinct:new Set(list).size,roles:active.every(pid=>v64GridRole(cells[pid])===ctx.state.roles[pid]),cells:list.slice().sort((a,b)=>a-b)});}
  return out;})()`));
 for(const r of result){assert.equal(r.n,6,r.f);assert.equal(r.distinct,6,r.f);assert(r.roles,r.f+' cells in their own band');}
 measurements.formations=result.map(r=>r.f+': '+r.cells.join(','));
});

// ----- restore -----
check('restore on the large pitch: marker, anchors, targets and the continuation survive a JSON checkpoint',()=>{
 h.call('Native183.constructed',{club:'ESP-1',seed:'si5restore',size:'large',roles:true,si:{packages:{field:true,clock:true},clockRate:.42,params:SHAPE}});h.call('Native183.run',350);
 let saved=false,before=null;
 for(let i=0;i<4000&&!saved;i++){
  h.call('Native183.advance');
  if(ev('match.goalPause>0'))continue;
  before=copy(ev(`({field:match.si.params.field,on:v183Active(match,'field'),anchors:match.people.map(p=>[p.pid,p.bx,p.by]),window:v183OptWindowBase(match),pace:v183PaceFactor(match,match.people.find(q=>!q.keeper&&q.t===0),'carrier',{})})`));
  saved=h.call('Native183.checkpoint');
 }
 assert(saved,'checkpoint');
 const after=copy(ev(`({field:match.si.params.field,on:v183Active(match,'field'),anchors:match.people.map(p=>[p.pid,p.bx,p.by]),window:v183OptWindowBase(match),pace:v183PaceFactor(match,match.people.find(q=>!q.keeper&&q.t===0),'carrier',{})})`));
 assert.deepEqual(after.field,before.field);assert.equal(after.on,true);assert.deepEqual(after.anchors,before.anchors);assert.equal(after.window,before.window);assert.equal(after.pace,before.pace);
 const savedMatch=copy(h.call('Native183.savedMatch'));assert.deepEqual(savedMatch.si.params.field,before.field);assert.equal(Object.keys(savedMatch.attackFlow).some(k=>/field/i.test(k)),false,'the snapshot carries no package state');
 h.call('Native183.run',300);assert.equal(ev('match.people.every(p=>[p.x,p.y,p.tx,p.ty].every(Number.isFinite))'),true);
 // A 183 match saved before this package (no switch, no field parameters) stays off after the restore and plays on.
 h.call('Native183.constructed',{size:'large',roles:true,si:{packages:{field:false}}});
 ev("(()=>{const si=JSON.parse(JSON.stringify(match.si));delete si.packages.field;delete si.params.field;match.si=si;return 0;})()");
 assert.equal(ev("v183Active(match,'field')"),false);assert.equal(ev("v183OptWindowBase(match)"),WB);
 h.call('Native183.run',200);assert.equal(ev('match.people.every(p=>[p.x,p.y,p.tx,p.ty].every(Number.isFinite))'),true);
});

console.log(JSON.stringify({pass:true,suite:'si-field-v183',checks:checks.length,cases:checks,measurements,scope:'Actual native dist controllers in the VM harness: constructor matches with marker 183 (package on/off, both pitch sizes), grid defaults, restore round trip. No full-match balance claim; see measure-si-offball-v183.cjs and docs/spielerintelligenz-si5-field-183.md.'}));

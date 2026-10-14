'use strict';

// Player intelligence 183, foundation (SI-F): marker, configuration, clock
// helpers, personality, decision trace, ledger sources and the interfaces shared
// by the SI packages. New logic runs only for match.si.revision===183 with the
// package switch on (v183Active); unmarked and 182 matches never reach it. No
// helper here draws a random number except the named "clearance.lateral" draw
// of the v183Clearance stub (today's header clearance).
// match.si is written only by the constructor v65CreateMatch. v65Snapshot copies
// the match flat and v65Restore clones it: match.si survives unchanged, and a
// restored older match never gains one.
// Load order (index.html, build.cjs, native130-harness.cjs): core, clock,
// defence, finish, setplay, offball, options, field, then match-ball-events-v117
// so the ledger wraps the package logic.

const V183_REVISION=183;
const V183_PACKAGES=Object.freeze(['clock','options','offball','finish','defence','setplay','field']);
// Parameter defaults per package and the package switches of new matches. A
// wave-1 package turns its switch on in its own module (v183EnableByDefault)
// only when it is complete; until then every switch is off.
const v183Registry={defaults:Object.fromEntries(V183_PACKAGES.map(pkg=>[pkg,{}])),enabled:Object.fromEntries(V183_PACKAGES.map(pkg=>[pkg,false]))};

function v183Package(pkg){
 if(!V183_PACKAGES.includes(pkg))throw RangeError(`Unknown SI package: ${pkg}`);
 return pkg;
}
// JSON-plain deep copy (finite numbers, strings, booleans, null, arrays, plain
// objects). Parameters are stored with the match.
function v183Plain(value,label){
 const seen=new Set();
 const copy=v=>{
  if(v===null||typeof v==='string'||typeof v==='boolean')return v;
  if(typeof v==='number'){if(!Number.isFinite(v))throw TypeError(`${label}: non-finite number`);return v;}
  if(typeof v!=='object'||seen.has(v))throw TypeError(`${label}: plain JSON data without cycles expected`);
  // Plain objects of any realm (harness options may come from another one).
  const proto=Array.isArray(v)?null:Object.getPrototypeOf(v);
  if(proto!==null&&Object.getPrototypeOf(proto)!==null)throw TypeError(`${label}: plain objects only`);
  seen.add(v);const out=Array.isArray(v)?v.map(copy):Object.fromEntries(Object.entries(v).map(([k,x])=>[k,copy(x)]));seen.delete(v);
  return out;
 };
 return copy(value);
}
function v183Kind(value){return value===null?'null':Array.isArray(value)?'array':typeof value;}

// ----- Marker and configuration -----
function v183RegisterDefaults(pkg,obj){
 const target=v183Registry.defaults[v183Package(pkg)],values=v183Plain(obj,`SI defaults ${pkg}`);
 if(v183Kind(values)!=='object')throw TypeError(`SI defaults ${pkg}: object expected`);
 for(const [key,value]of Object.entries(values)){
  if(Object.hasOwn(target,key)&&JSON.stringify(target[key])!==JSON.stringify(value))throw Error(`SI parameter ${pkg}.${key} registered twice`);
  target[key]=value;
 }
 return v183Plain(target,`SI defaults ${pkg}`);
}
function v183EnableByDefault(pkg){v183Registry.enabled[v183Package(pkg)]=true;}
// Called only by v65CreateMatch. options: undefined (production), false
// (harness: no marker, rules 182) or {packages,params,clockRate} as harness
// overrides. Unknown packages/parameters and type changes are errors.
function v183CreateSi(options){
 if(options===false)return null;
 const o=options??{};
 if(v183Kind(o)!=='object')throw TypeError('SI options: object expected');
 for(const key of Object.keys(o))if(!['packages','params','clockRate'].includes(key))throw RangeError(`Unknown SI option: ${key}`);
 const packages={...v183Registry.enabled};
 for(const [pkg,on]of Object.entries(o.packages||{})){v183Package(pkg);if(typeof on!=='boolean')throw TypeError(`SI package switch ${pkg}: boolean expected`);packages[pkg]=on;}
 const params=v183Plain(v183Registry.defaults,'SI defaults');
 for(const [pkg,values]of Object.entries(o.params||{})){
  v183Package(pkg);
  for(const [key,value]of Object.entries(v183Plain(values,`SI parameters ${pkg}`))){
   if(!Object.hasOwn(params[pkg],key))throw RangeError(`Unknown SI parameter: ${pkg}.${key}`);
   if(v183Kind(value)!==v183Kind(params[pkg][key]))throw TypeError(`SI parameter ${pkg}.${key}: ${v183Kind(params[pkg][key])} expected`);
   params[pkg][key]=value;
  }
 }
 // Today's rate for now; SI-0 uses it, SI-K calibrates the final value.
 const clockRate=o.clockRate===undefined?MATCH_SPEED:o.clockRate;
 if(typeof clockRate!=='number'||!Number.isFinite(clockRate)||clockRate<=0)throw RangeError('SI clock rate: positive number expected');
 return {revision:V183_REVISION,clockRate,packages,params};
}
function v183Marked(m){return m?.si?.revision===V183_REVISION;}
function v183Active(m,pkg){v183Package(pkg);return Boolean(v183Marked(m)&&m.si.packages?.[pkg]===true);}
// Key "<package>.<name>". The value stored with the match, otherwise the
// registered default (only for a parameter added later). Treat as read-only.
function v183Param(m,key){
 const dot=typeof key==='string'?key.indexOf('.'):-1,pkg=dot>0?key.slice(0,dot):'',name=dot>0?key.slice(dot+1):'';
 if(!V183_PACKAGES.includes(pkg)||!name)throw RangeError(`SI parameter key "<package>.<name>" expected: ${key}`);
 const stored=v183Marked(m)?m.si.params?.[pkg]:null;
 return stored&&Object.hasOwn(stored,name)?stored[name]:v183Registry.defaults[pkg][name];
}

// ----- Clock: real seconds and clock units -----
// Without the clock package MATCH_SPEED applies: the same arithmetic as
// m.elapsed/MATCH_SPEED (v152Seconds) and seconds*MATCH_SPEED.
function v183Rate(m){return v183Active(m,'clock')&&Number.isFinite(m.si.clockRate)&&m.si.clockRate>0?m.si.clockRate:MATCH_SPEED;}
function v183Seconds(m){return m.elapsed/v183Rate(m);}
function v183ClockUnits(m,seconds){return seconds*v183Rate(m);}

// ----- Personality -----
// Weights of the option choice only (willingness), never scatter, reach or
// success probability. From tacticalRole (else the line) and the stored mental
// values calm/ant/dec (1-20); a missing value counts as 10. Nothing is written
// to player data. Starting formula from the implementation plan (SI-F):
//   shootWeight = role * (0.85 + 0.015*(calm-10) + 0.01*(dec-10))
//   riskWeight  = role * (0.9 + 0.01*(dec-10))
// dribble/follow/hold are SI-F starting proposals; SI-K calibrates all weights.
const V183_PERSONALITY=Object.freeze({
 shoot:Object.freeze({roles:{poacher:1.25,striker:1.15,dribbler:1,winger:1,'target-player':1,playmaker:.9,'box-to-box':.9,'ball-winner':.9,stopper:.7,'cover-defender':.7,'ball-playing-defender':.7,'line-keeper':.7,'sweeper-keeper':.7},lines:{att:1,mid:.9,def:.7,gk:.7}}),
 risk:Object.freeze({roles:{playmaker:1.25,'box-to-box':1.1,winger:1.1,poacher:1,striker:1,dribbler:1,'target-player':1,'ball-winner':.8,stopper:.8,'cover-defender':.8,'ball-playing-defender':.8,'line-keeper':.8,'sweeper-keeper':.8},lines:{att:1,mid:1,def:.8,gk:.8}}),
 dribble:Object.freeze({roles:{dribbler:1.25,winger:1.1,poacher:1,striker:1,'box-to-box':1,playmaker:.95,'target-player':.85,'ball-winner':.8,'ball-playing-defender':.8,stopper:.7,'cover-defender':.7,'line-keeper':.5,'sweeper-keeper':.5},lines:{att:1,mid:.95,def:.75,gk:.5}}),
 follow:Object.freeze({roles:{poacher:1.25,striker:1.15,'target-player':1.1,dribbler:1,winger:1,'box-to-box':1,playmaker:.9,'ball-winner':.8,stopper:.6,'cover-defender':.6,'ball-playing-defender':.6,'line-keeper':.5,'sweeper-keeper':.5},lines:{att:1.1,mid:.9,def:.6,gk:.5}}),
 hold:Object.freeze({roles:{'target-player':1.25,'ball-winner':1.1,playmaker:1.05,'box-to-box':1,'ball-playing-defender':1,stopper:1,'cover-defender':1,'line-keeper':1,'sweeper-keeper':1,striker:.95,poacher:.9,winger:.9,dribbler:.85},lines:{att:.9,mid:1,def:1,gk:1}})
});
function v183RoleWeight(p,kind){
 const table=V183_PERSONALITY[kind],role=p?.tacticalRole,line=p?.keeper?'gk':p?.assignedLine||p?.line;
 return Object.hasOwn(table.roles,role)?table.roles[role]:Object.hasOwn(table.lines,line)?table.lines[line]:1;
}
function v183Mental(p,key){const value=p?.[key];return Number.isFinite(value)?Math.max(1,Math.min(20,value)):10;}
function v183Personality(p){
 const calm=v183Mental(p,'calm')-10,ant=v183Mental(p,'ant')-10,dec=v183Mental(p,'dec')-10;
 return Object.freeze({
  shootWeight:v183RoleWeight(p,'shoot')*(.85+.015*calm+.01*dec),
  riskWeight:v183RoleWeight(p,'risk')*(.9+.01*dec),
  dribbleWeight:v183RoleWeight(p,'dribble')*(.9+.01*calm),
  followWeight:v183RoleWeight(p,'follow')*(.85+.02*ant),
  holdWeight:v183RoleWeight(p,'hold')*(.95+.01*calm)
 });
}

// ----- Decision trace (transient) -----
// Ring buffer of 64 entries per match in a WeakMap: never saved, never read by
// decisions, empty after a restore. Entries are plain data; a person at the top
// level is replaced by its pid.
const v183Traces=new WeakMap(),V183_TRACE_LIMIT=64;
function v183Trace(m,entry){
 if(!v183Marked(m)||v183Kind(entry)!=='object')return null;
 let trace=v183Traces.get(m);if(!trace)v183Traces.set(m,trace={sequence:0,entries:[]});
 const record={seq:++trace.sequence,at:v183Seconds(m)};
 for(const [key,value]of Object.entries(entry))if(key!=='seq'&&key!=='at')record[key]=value&&typeof value==='object'&&typeof value.pid==='string'&&Object.hasOwn(value,'t')?value.pid:value;
 trace.entries.push(Object.freeze(record));if(trace.entries.length>V183_TRACE_LIMIT)trace.entries.shift();
 return record;
}
function v183TraceEntries(m){return [...(v183Traces.get(m)?.entries||[])];}

// ----- Ledger sources (H16) -----
// Additive source tags in the v117 ball ledger (event.sources, see
// v117AddSource). Target: a ledger event, a flight object or the match itself
// (then its current ballEventId event). Marked matches only; otherwise no effect.
const V183_LEDGER_SOURCES=Object.freeze(['cross','header','long-shot','rebound','counter','one-two']);
function v183LedgerSource(target,tag,m=match){
 if(!v183Marked(m)||!V183_LEDGER_SOURCES.includes(tag)||typeof v117Ledger!=='function'||typeof v117AddSource!=='function')return null;
 const ledger=v117Ledger(m);if(!ledger)return null;
 const event=target===m?ledger.events.find(e=>e.id===m.ballEventId):typeof v117Flights!=='undefined'&&target&&typeof target==='object'&&v117Flights.has(target)?v117Flights.get(target):target;
 return event&&ledger.events.includes(event)?v117AddSource(event,tag):null;
}

// ----- Switches for partial formulas that cannot be wrapped -----
// Pressure/foul radius as a predicate (a,b)=>boolean. metres: a value or a
// parameter key "<package>.<name>" (effective only while that package is on).
// Without a metre value the exact old normalised test distance(a,b)<legacy holds.
function v183Radius(m,metres,legacy){
 const value=typeof metres==='string'?(v183Active(m,metres.slice(0,metres.indexOf('.')))?v183Param(m,metres):undefined):metres;
 if(v183Marked(m)&&Number.isFinite(value))return (a,b)=>v122Metres(a,b)<value;
 return (a,b)=>distance(a,b)<legacy;
}
// Switch in v157Pace (world-offensive-quality-v157.js:42), only for match.si.
// purpose: carrier | purposeful | support | base; detail.factor is the exact
// legacy factor (1.28*(0.78+tec*0.009) / 1.58 / 1.35 / 1.15). Packages wrap this
// function for their purposes (carrier/runner SI-2, pressing SI-4).
function v183PaceFactor(m,p,purpose,detail={}){
 if(Number.isFinite(detail.factor))return detail.factor;
 return purpose==='carrier'?1.28*(.78+ability(p,'tec')*.009):purpose==='support'?1.35:purpose==='base'?1.15:1.58;
}
// Finer reason behind "purposeful" for packages (not used by the stub):
// run | follow (own intent), press (defensive read), intercept, contest.
function v183PaceReason(m,p,detail={}){
 const {intent,read,now,contest}=detail;
 if(intent&&intent.until>=now&&['depth','follow'].includes(intent.type)&&intent.team===v123PossessionTeam(m))return intent.type==='follow'?'follow':'run';
 if(read&&read.nextAt>=now&&['press','ball'].includes(read.purpose))return 'press';
 if(p.interceptTarget&&m.flight)return 'intercept';
 return contest?'contest':'purposeful';
}
// Switch in team() (game.js:59): formation anchor in normalised pitch units from
// team 0's view, before mirroring. m is the match or, during construction, the
// frame {geometry,si}. Stub: the unchanged point (SI-5 wraps it).
function v183FormationAnchor(m,p,t,point){return point;}

// ----- Interfaces owned by other packages (stubs with today's behaviour) -----
// Call only from marked paths. Owners wrap or replace them in their module and
// call the previous function while their package is off.
// SI-3 shot value. Stub: v157ShotQuality at point `from` (default: the player).
function v183ShotEstimate(m,p,from=p){
 const shooter=from===p?p:{...p,x:from.x,y:from.y},xg=v157ShotQuality(shooter,m.people.filter(q=>q.t!==p.t));
 return {xg,aim:{x:.5,y:p.t===0?v55Field.top:v55Field.bottom},window:xg>0,speed:null};
}
// SI-7 cross value. Stub: today's cross condition (<26 m from goal, >9 m wide,
// target <16 m from goal) and the blanket error variants (50 %). target: a
// team-mate or a point; headerXg is today's shot value at the target.
function v183CrossEstimate(m,p,target){
 const receiver=target&&typeof target.pid==='string'?target:null,point=target?{x:target.x,y:target.y}:null,s=v150Scale(m);
 const eligible=Boolean(point&&v115GoalDistance(p)<26&&Math.abs(p.x-.5)*s.x>9&&v115GoalDistance({...point,t:p.t})<16);
 return {arrival:eligible?.5:0,headerXg:eligible&&receiver?v157ShotQuality({...receiver,...point},m.people.filter(q=>q.t!==p.t)):0,eligible};
}
// SI-1 pass value. Stub: v157Lane (open lane = arrives) and today's option score.
function v183PassEstimate(m,p,q,target){
 const point=target||v157PassLead(m,p,q,m.ball)||{x:q.x,y:q.y},rivals=m.people.filter(r=>r.t!==p.t),s=v150Scale(m),dir=p.t===0?-1:1;
 const lane=v157Lane(m,p,point,rivals),gain=(point.y-p.y)*dir*s.y,value=gain*.11-v122Metres(p,point)*.028+v157ShotQuality({...q,...point},rivals)*.9;
 return {arrival:lane?1:0,value,lane};
}
// SI-2 offers/patterns. Stub: a read-only copy of today's attackFlow.intents
// (v159Offers writes them in the regular cycle).
function v183Offers(m){return Object.entries(m?.attackFlow?.intents||{}).map(([pid,intent])=>({pid,...intent}));}
// SI-4 clearance. Stub: today's header clearance (pitch-v55.js:385), 7+0.2*air m
// upfield and (draw "clearance.lateral" -0.5..0.5)*6 m sideways; never out.
function v183Clearance(m,defender,point,context={}){
 const draw=Number.isFinite(context.lateralDraw)?context.lateralDraw:random(),forward=7+ability(defender,'air')*.20,lateral=(draw-.5)*6;
 return {target:{x:clamp(point.x+lateral*(v55Field.right-v55Field.left)/v160PitchWidth(m),.07,.93),y:clamp(point.y+(defender.t===0?-forward:forward)*(v55Field.bottom-v55Field.top)/v160PitchLength(m),.07,.93)},out:false};
}

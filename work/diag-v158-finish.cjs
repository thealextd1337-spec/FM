'use strict';
// Diagnosis of the v158 final-whistle abort (RangeError "actual event must
// occur within played virtual minutes"): runs work/measure-si-offball-v183.cjs
// unchanged with additional read-only observers. Every v158QueueAction call is
// recorded with the queued minute, match.elapsed and the call stack; every
// v65PhysicalSwap with match.elapsed. On an engine error the record of the
// failing player is attached to engineError.v158 (outputs/si183/<label>.json).
// Usage: node work/diag-v158-finish.cjs --label=v158-diag --port=4256 --workers=1 --only="POR-6|large" --clockRate=0.42 --clubs=96 --sizes=large --seedPrefix=si183b
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const base=path.join(__dirname,'measure-si-offball-v183.cjs'),harness=path.join(__dirname,'measure-si183.cjs');
let text=fs.readFileSync(harness,'utf8').replace(/\r\n/g,'\n');
const rep=(a,b)=>{const n=text.split(a).length-1;if(n!==1)throw Error(`expected one match, got ${n}: ${a.slice(0,90)}`);text=text.replace(a,b);};
rep(`wrap('v50GoalKick',(base,self,args)=>{`,
`window.__v158diag={queue:[],swaps:[],by:new WeakMap()};
 wrap('v158QueueAction',(base,self,args)=>{const [career,fixture,state,player,type,causeId,minute]=args,D=window.__v158diag;
  // Per-match counters: actions queued during the deferred final whistle, dated before the
  // played clock (fullTimeEnd-.001), and those dated before the player's entry.
  // Native actions only: compact simulations of other fixtures queue with their own state.
  if(match&&!match.finished&&state===v65WorldActive?.state&&state.playerLoad?.players[player.pid]){let c=D.by.get(match);if(!c)D.by.set(match,c={queued:0,pending:0,rewound:0,beforeEntry:0,lagMax:0,types:{}});c.queued++;
   if(match.fulltimePending){c.pending++;const lag=((match.fullTimeEnd||75)-.001)*90/75-minute;if(lag>1e-9){c.rewound++;c.types[type]=(c.types[type]||0)+1;c.lagMax=Math.max(c.lagMax,+lag.toFixed(4));if(Number.isFinite(player.matchEntryElapsed)&&minute<player.matchEntryElapsed*90/75)c.beforeEntry++;}}}
  D.queue.push({pid:player.pid,type,causeId,minute,elapsed:match?.elapsed,stateMinute:state.minute,onPitch:!!match?.people.includes(player),exited:!!match?.exitedPeople?.includes(player),entry:player.matchEntryElapsed??null,slide:!!match?.slide,stack:String(new Error().stack).split(String.fromCharCode(10)).slice(2,9).map(s=>s.trim())});if(D.queue.length>400)D.queue.shift();
  return base.apply(self,args);});
 wrap('v65PhysicalSwap',(base,self,args)=>{const D=window.__v158diag;D.swaps.push({out:args[1].outPid,in:args[1].inPid,elapsed:match.elapsed,minute:match.elapsed*90/75,slide:!!match.slide,slideTackler:match.slide?.tackler?.pid??null,slideVictim:match.slide?.victim?.pid??null,flight:!!match.flight});return base.apply(self,args);});
 wrap('v50GoalKick',(base,self,args)=>{`);
rep(`engineError={env:env(),`,`engineError={v158:(()=>{const D=window.__v158diag;if(!D)return null;const bad=new Set((load?Object.entries(load.pending||{}):[]).filter(([,p])=>p.events.length).map(([pid])=>pid));return{swaps:D.swaps,queue:D.queue.filter(q=>bad.has(q.pid)).slice(-20)};})(),env:env(),`);
rep(`return{integrity,engineError,extras,clubId`,`return{v158diag:window.__v158diag?.by.get(m)||null,integrity,engineError,extras,clubId`);
// Same procedure as measure-si-offball-v183.cjs: patch its text and run it in place of measure-si183.cjs.
let offball=fs.readFileSync(base,'utf8');
offball=offball.replace("const file=path.join(__dirname,'measure-si183.cjs');let text=fs.readFileSync(file,'utf8').replace(/\\r\\n/g,'\\n');",
 "const file=path.join(__dirname,'measure-si183.cjs');let text=global.__v158DiagText;");
if(!offball.includes('global.__v158DiagText'))throw Error('offball harness changed');
global.__v158DiagText=text;
const m=new Module(base,module);m.filename=base;m.paths=Module._nodeModulePaths(__dirname);m._compile(offball,base);

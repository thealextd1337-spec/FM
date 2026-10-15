'use strict';
// SI-4 measurement driver. Runs work/measure-si183.cjs unchanged (same careers,
// seeds, observers, dist hash check, lane/port rules, options) and adds two
// anchored in-memory insertions: read-only observers for fouls, challenges,
// corners and clearances (window.__d183, summed into each match row as
// extras.defence). dist/ is never written. If the anchors of the harness change,
// this driver fails instead of measuring something else.
//
// Usage: as measure-si183.cjs, e.g.
//   node work/measure-si-defence-v183.cjs --packages=defence --port=4257 --workers=6 --clubs=24
// Lane B (ports 4256-4261) is shared with SI-7: the caller takes the atomic
// directory lock work/si-integration/outputs/si183/lane-B.lock and appends the
// start/end lines to work/si-integration/outputs/si183/queue.log (the harness
// itself logs into outputs/si183/queue.log of this worktree).
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const file=path.join(__dirname,'measure-si183.cjs');
// --packages=a,b,-c: the harness only switches packages on; "-c" additionally switches c off
// (the constructor default of a finished package is on). Handled here, the harness never sees it.
const off=[];
for(let i=0;i<process.argv.length;i++){const a=process.argv[i];if(a.startsWith('--packages=')){const list=a.slice(11).split(',').filter(Boolean);off.push(...list.filter(x=>x.startsWith('-')).map(x=>x.slice(1)));process.argv[i]='--packages='+(list.filter(x=>!x.startsWith('-')).join(',')||'none');}}
let src=fs.readFileSync(file,'utf8');
const once=(needle,replacement)=>{
 const first=src.indexOf(needle);
 if(first<0||src.indexOf(needle,first+1)>=0)throw Error('Harness anchor not found exactly once: '+needle.slice(0,60));
 src=src.slice(0,first)+replacement+src.slice(first+needle.length);
};
const observer=String.raw` // ---- SI-4 observers (read only; no random draws) ----
 const D=window.__d183={rec:null,data:null};
 const fresh=()=>({fouls:[],corners:[],deflects:{block:0,parade:0,other:0},clears:0,clearOut:0,probeCalls:0,challenges:{standing:0,slideStart:0,standingFouls:0},contacts:0,turnovers:[]});
 D.data=fresh();
 const sync=()=>{if(D.rec!==P.rec){D.rec=P.rec;D.data=fresh();}return D.data;};
 D.take=()=>{sync();const d=D.data;D.data=fresh();return d;};
 const poseNames=(stack)=>/v56StandingTackle/.test(stack)?'standing':/v56AdvanceSlide/.test(stack)?'slide':/set-pieces-v50\.js:16\d/.test(stack)?'probe':'other';
 wrap('v50Foul',(base,self,args)=>{const d=sync();if(!P.rec)return base.apply(self,args);const [victim,offender]=args,path=poseNames(String(new Error().stack)),sp=match.setPieceStats,before=sp.fouls[0]+sp.fouls[1],gap=v56Contact(victim,offender),value=base.apply(self,args);
  const awarded=sp.fouls[0]+sp.fouls[1]>before;d.fouls.push({path,awarded,gap:+gap.toFixed(1),team:offender.t,penalty:awarded&&match.setPiece?.type==='penalty',behind:path==='slide'?D.curSlideBehind:null});return value;});
 wrap('v56StandingTackle',(base,self,args)=>{const d=sync(),fouls0=match.setPieceStats.fouls[0]+match.setPieceStats.fouls[1],w0=args[0].stats.tacklesWon,value=base.apply(self,args);if(P.rec){d.challenges.standing++;if(match.setPieceStats.fouls[0]+match.setPieceStats.fouls[1]>fouls0)d.challenges.standingFouls++;else if(args[0].stats.tacklesWon>w0)d.challenges.standingWon=(d.challenges.standingWon||0)+1;}return value;});
 wrap('v56StartSlide',(base,self,args)=>{const d=sync(),was=match.slide,[tackler,victim]=args,body=v157Body(victim),sp=Math.hypot(body.vx,body.vy),dx=(victim.x-tackler.x)*P.W(),dy=(victim.y-tackler.y)*P.L(),dist=Math.hypot(dx,dy)||1,closing=-(body.vx*dx+body.vy*dy)/dist/(sp||1),dBall=v56Contact(tackler,match.ball)/32,value=base.apply(self,args);if(P.rec&&match.slide&&match.slide!==was){d.challenges.slideStart++;D.slideFeat=match.slide;match.slide.__f={speed:+sp.toFixed(2),closing:+closing.toFixed(2),dBall:+dBall.toFixed(2),behind:!!match.slide.behind,tak:ability(tackler,'tak'),t0:v102Clock(match),hold:tackler.stats.slideWon,fouls0:match.setPieceStats.fouls[0]+match.setPieceStats.fouls[1]};}return value;});
 wrap('v56AdvanceSlide',(base,self,args)=>{const d=sync(),slide=match.slide,pre=(D.curSlideBehind=!!slide?.behind),f=slide&&slide.__f,w0=slide&&slide.tackler.stats.slideWon,k0=slide&&match.setPieceStats.fouls[0]+match.setPieceStats.fouls[1],value=base.apply(self,args);
  if(P.rec&&slide&&match.slide!==slide){const won=slide.tackler.stats.slideWon>w0,foul=match.setPieceStats.fouls[0]+match.setPieceStats.fouls[1]>k0;(d.slides||(d.slides=[])).push({...(f||{}),end:foul?'foul':won?'won':'other',dur:+(v102Clock(match)-(f?.t0??0)).toFixed(2)});}return value;});
 wrap('v50Corner',(base,self,args)=>{const d=sync();if(P.rec){const text=String(args[2]||''),source=/^Block von/.test(text)?'block':/^Parade von/.test(text)?'parade':/rollt über die Linie/.test(text)?'roll':'other';
  d.corners.push({source,text:text.slice(0,40),team:args[0],clearAgo:D.lastClear?+(v102Clock(match)-D.lastClear).toFixed(2):null});}return base.apply(self,args);});
 wrap('v50Deflect',(base,self,args)=>{const d=sync();if(P.rec){const text=String(args[3]||'');d.deflects[/^Block/.test(text)?'block':/^Parade/.test(text)?'parade':'other']++;}return base.apply(self,args);});
 wrap('v102AirClear',(base,self,args)=>{const d=sync();if(P.rec){d.clears++;D.lastClear=v102Clock(match);const t=args[2];if(t&&(t.x<v55Field.left||t.x>v55Field.right||t.y<v55Field.top||t.y>v55Field.bottom))d.clearOut++;}return base.apply(self,args);});
 // Turnovers: possession change with the new ball position (distance to the
 // attacked goal of the team that lost the ball, i.e. final third of the loser).
 D.lastPossession=null;
 wrap('v182ContactCheck',(base,self,args)=>{const d=sync();if(P.rec){const m=args[0],team=typeof v123PossessionTeam==='function'?v123PossessionTeam(m):null;if(team!=null&&D.lastPossession!==null&&team!==D.lastPossession&&m.owner&&!m.owner.keeper){const loser=D.lastPossession;d.turnovers.push({t:+v102Clock(m).toFixed(2),loser,gainer:team,loserFinal3:P.toGoal(m.ball,loser)<=v160PitchLength()/3,distLoserGoal:+P.toGoal(m.ball,loser).toFixed(1)});}if(team!=null)D.lastPossession=team;}return base.apply(self,args);});
`;
once(' // Decisions of the ball carrier in the attacking half: what was chosen?',observer+' // Decisions of the ball carrier in the attacking half: what was chosen?');
// extras literal: with the SI-0 freshness record ("fresh") or the SI-F form
if(src.includes('extras={fresh,rebounds,shotResults,'))once('extras={fresh,rebounds,shotResults,','extras={defence:window.__d183?window.__d183.take():null,fresh,rebounds,shotResults,');
else once('const extras={rebounds,shotResults,','const extras={defence:window.__d183?window.__d183.take():null,rebounds,shotResults,');
once('const siOverride=Object.keys(si).length?si:null;',`for(const p of ${JSON.stringify('__OFF__')}.split(',').filter(Boolean)){si.packages=si.packages||{};si.packages[p]=false;}
const siOverride=Object.keys(si).length?si:null;`);
src=src.replace('__OFF__',off.join(','));
const mod=new Module(file,null);mod.filename=file;mod.paths=Module._nodeModulePaths(path.dirname(file));
mod._compile(src,file);

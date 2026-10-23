'use strict';
// AI coach 185 (user decision 22 Oct 2026, docs/product.md): computer coaches of played-out matches read score, minute,
// the last 15 minutes (shots, shots on target, possession, territory), freshness and performance of their players and
// change formation, pressing, defensive line, passing, duel hardness and players. The existing coach skill
// "Gegneranpassung" (judgment.adaptation 1–5) sets check cadence, reaction time and whether the answer fits the problem.
// Only states with aiCoachRevision 185 (v64MakeState in worlds with the 183 stamp) and only in the played-out match
// (v65AfterStep); compact matches and all other states keep v64AiAdjust.
const v185Coach=Object.freeze({revision:185,window:15,checkEvery:Object.freeze([15,15,10,10,5]),gap:10,revertGap:15,lastRevert:85,tiredFresh:55,poorGap:1});
const v185Words=Object.freeze({
 pressing:Object.freeze({Früh:'frühes Pressing',Abwartend:'abwartendes Pressing',Ausgewogen:'ausgewogenes Pressing'}),
 passing:Object.freeze({Direkt:'direktes Passspiel',Kurz:'kurzes Passspiel',Variabel:'variables Passspiel'}),
 defense:Object.freeze({Hoch:'hohe Abwehrlinie',Tief:'tiefe Abwehrlinie',Neutral:'normale Abwehrlinie'}),
 aggression:Object.freeze({Aggressiv:'harte Zweikämpfe',Vorsichtig:'vorsichtige Zweikämpfe',Normal:'normale Zweikämpfe'})
});
const v185Why=Object.freeze({trail:'Rückstand aufholen',pressure:'unter Druck',protect:'Führung sichern',calm:'Lage beruhigt',tired:'Kräfte schonen',poor:'schwache Leistung',fresh:'müde'});

// One player moves from defence to attack (dir 1) or from attack to defence (dir -1); the middle line gives when the outer one has one player.
function v185Shift(formation,dir){
 const n=formation.split('–').map(Number),from=dir>0?(n[0]>1?0:1):(n[2]>1?2:1);
 if(n.length!==3||n[from]<=1)return formation;
 n[from]--;n[dir>0?2:0]++;return n.join('–');
}
// Pure decision of one check. window: v185Window of the coached side; fresh: mean freshness of its outfield players;
// base: the coach's starting tactics; active: reason of the last own change (hysteresis while the pressure lasts); answer: the
// pressure answer kept from the last check ('block' one more defender, 'keep' keep the ball), null after a goal (user, 23 Oct).
// Returns the target tactics (base plus the answer to the current problem), the reason and the answer; the caller applies the difference.
function v185Decide({minute,score,quality,window:w,fresh,base,active,answer=null,six}){
 const q=Math.max(1,Math.min(5,quality||3)),fit=q>=3,late=(3-q)*5,target={...base};
 const shotGap=w.shotsAgainst-w.shotsFor,onGap=w.onAgainst-w.onFor;
 // Dominance of the opponent in the window: shot surplus, shots on target, possession and territory below half.
 const pressure=w.minutes>=10?shotGap+.5*onGap+4*(.5-w.possession)+4*(.5-w.territory):0,need=1.2+(5-q)*.6-(active==='pressure'||active==='protect'?1:0);
 let why=null,kept=null;
 if(score<0){
  if(minute>=30+late){target.pressing='Früh';why='trail';}
  if(minute>=60+late){target.formation=fit?v185Shift(base.formation,1):six?'1–2–3':'1–2–2';if(fit&&w.possession<.5)target.passing='Direkt';}
  if(fit&&minute>=75+late)target.defense='Hoch';
 }else{
  if(score>0&&minute>=60+late){target.pressing='Abwartend';why='protect';}
  // A fitting coach keeps the shape with a comfortable lead and only closes it up at one goal.
  if(score>0&&minute>=70+late&&(!fit||score===1)){target.formation=fit?v185Shift(base.formation,-1):six?'3–2–1':'3–1–1';why='protect';}
  if(pressure>=need){
   why=score>0?'protect':'pressure';
   if(!fit){target.defense='Tief';target.pressing='Abwartend';}
   // Chances against: one more defender (leading: fewer fouls near the own box). Only ball and territory against: keep the ball, level teams press higher.
   // The answer stays while the pressure lasts and the score is unchanged.
   else if((kept=answer||(shotGap>=2||onGap>=1?'block':'keep'))==='block'){target.formation=v185Shift(base.formation,-1);if(score>0)target.aggression='Vorsichtig';}
   else{target.passing='Kurz';if(score===0)target.pressing='Früh';}
  }
 }
 if(fit&&target.pressing==='Früh'&&fresh<v185Coach.tiredFresh&&!(score<0&&minute>=75)){target.pressing=base.pressing==='Früh'?'Ausgewogen':base.pressing;why=why||'tired';}
 return{target,why:why||'calm',pressure,answer:kept};
}

// Cumulative counters by world side; territory counts the minutes whose first observed state has the ball in the opponent's
// half (team 0 attacks y < .5), one sample per match minute, so it does not depend on the frame rate.
function v185Totals(context){
 const ai=context.state.aiCoach,people=[...match.people,...(match.exitedPeople||[])],out={minute:context.state.minute,shots:[0,0],on:[0,0],poss:[0,0],terr:[...ai.territory]};
 for(const t of [0,1]){const side=v65Side(t,context.ownSide);out.shots[side]=match.shots[t];out.poss[side]=match.possession[t];out.on[side]=people.filter(p=>p.t===t).reduce((n,p)=>n+(p.stats.onTarget||0),0);}
 return out;
}
function v185Observe(context){
 const state=context.state,ai=state.aiCoach||={samples:[],territory:[0,0],log:[]};
 if(ai.samples.at(-1)?.minute===state.minute)return;
 if(Number.isFinite(match.ball?.y)&&match.ball.y!==.5)ai.territory[v65Side(match.ball.y<.5?0:1,context.ownSide)]++;
 ai.samples.push(v185Totals(context));if(ai.samples.length>v185Coach.window+5)ai.samples.shift();
}
function v185Window(state,side){
 const s=state.aiCoach.samples,now=s.at(-1),from=s.find(x=>x.minute>=now.minute-v185Coach.window)||s[0],d=k=>[now[k][side]-from[k][side],now[k][1-side]-from[k][1-side]];
 const [shotsFor,shotsAgainst]=d('shots'),[onFor,onAgainst]=d('on'),[pf,pa]=d('poss'),[tf,ta]=d('terr');
 return{minutes:now.minute-from.minute,shotsFor,shotsAgainst,onFor,onAgainst,possession:pf+pa>0?pf/(pf+pa):.5,territory:tf+ta>0?tf/(tf+ta):.5};
}
// Substitution: a fitting coach replaces a clearly weak performer (live rating at least one point below the team mean; ratings
// rarely fall below the baseline 6) from the half-time check on; otherwise the most tired player
// from minute 60 (the previous rule). The incoming player takes the role and is the best bench fit for it.
function v185Substitution(career,fixture,state,side,q){
 if(state.minute<(q>=3?45:60)||state.substitutions.filter(item=>item.side===side).length+state.pending[side].length>=2)return null;
 const active=v64Active(state,side).filter(pid=>state.roles[pid]!=='gk'&&!state.pending[side].some(item=>item.outPid===pid));
 let out=null,why=null;
 if(q>=3&&state.playerPerformance){
  const rated=active.filter(pid=>state.minutes[pid]>=30).map(pid=>[pid,v155Rated(career,fixture,state,pid)?.rating]).filter(([,r])=>Number.isFinite(r)).sort((a,b)=>a[1]-b[1]);
  const mean=rated.reduce((sum,[,r])=>sum+r,0)/Math.max(1,rated.length);
  if(rated.length>=3&&rated[0][1]<=mean-v185Coach.poorGap){out=rated[0][0];why='poor';}
 }
 if(!out&&state.minute>=60){const tired=[...active].sort((a,b)=>state.fresh[a]-state.fresh[b])[0];if(tired&&(state.fresh[tired]<88||state.minute>=75)){out=tired;why='fresh';}}
 if(!out)return null;
 const role=state.roles[out],bench=v64Bench(state,side).filter(pid=>!v64Player(career,fixture,side,pid).keeper&&!state.pending[side].some(item=>item.inPid===pid)).sort((a,b)=>v64Rating(v64Player(career,fixture,side,b),role)-v64Rating(v64Player(career,fixture,side,a),role));
 if(!bench[0])return null;
 v64QueueSubstitution(career,fixture,state,side,out,bench[0]);
 return{outPid:out,inPid:bench[0],outName:v64Player(career,fixture,side,out).name,inName:v64Player(career,fixture,side,bench[0]).name,why};
}
function v185Text(club,entry){
 if(entry.kind==='sub')return`${club} wechselt: ${entry.inName} für ${entry.outName} (${v185Why[entry.why]}).`;
 const parts=Object.entries(entry.changes).map(([key,value])=>key==='formation'?value:v185Words[key][value]);
 return`${club} stellt um: ${parts.join(', ')} (${v185Why[entry.why]}).`;
}
// One check of the computer coach (never the user's side; same timing rules as before: at most every ten minutes, earlier after a goal,
// also when the same minute was already checked). Second legs count the first leg (aggregate), as the penalty rule does.
// Reverts (user, 23 Oct 2026; review 2): without a goal since its last change a key goes back to its previous value or to the
// coach's plan only after revertGap minutes and not from the shown minute lastRevert on; after a goal every value may be set again.
// The pressure answer is kept only when the check reached the whole target, otherwise the next check chooses again.
// Shown minute of the match clock (v64ClockLabel): the second half does not count the added time of the first half.
function v185ClockMinute(state){return state.minute>state.firstHalfEnd?state.minute-(state.addedMinutes?.[0]||0):Math.min(state.minute,45);}
function v185AiCoach(context,side,reason){
 const {career,fixture,state}=context,plan=side===0?fixture.plan.home:fixture.plan.away;
 if(side===context.ownSide||!plan.coachId||reason!=='Tor'&&state.minute===state.lastAiCheck[side])return null;
 state.lastAiCheck[side]=state.minute;
 const coach=career.world.coaches.find(item=>item.id===plan.coachId),q=coach?.judgment?.adaptation??3,ai=state.aiCoach,tactic=state.tactics[side];
 const field=v64Active(state,side).filter(pid=>state.roles[pid]!=='gk'),fresh=field.reduce((sum,pid)=>sum+state.fresh[pid],0)/Math.max(1,field.length);
 const first=fixture.leg===2&&typeof v64UiFirstLegScore==='function'?v64UiFirstLegScore(career,fixture,context.ownSide===1):'';
 const decision=v185Decide({minute:state.minute,score:state.score[side]-state.score[1-side]+(first?first[1]-first[0]:0),quality:q,window:v185Window(state,side),fresh,base:plan.tactics,active:ai.active?.[side]??null,answer:reason==='Tor'?null:ai.answer?.[side]??null,six:v160WorldConfig(career).fieldPlayers===6});
 const out=[];
 const goals=state.score[0]+state.score[1],late=v185ClockMinute(state)>=v185Coach.lastRevert,keys=['formation','pressing','passing','defense','aggression'];
 const reachable=key=>key!=='formation'||v160FormationValid(career,decision.target.formation);
 if(state.minute-state.lastAiChange[side]>=v185Coach.gap||reason==='Tor'){
  const history=(ai.history||=[{},{}])[side],changes={};
  for(const key of keys){
   if(decision.target[key]===tactic[key]||!reachable(key))continue;
   const last=history[key],back=last&&(decision.target[key]===last.from||decision.target[key]===plan.tactics[key]);
   if(back&&last.goals===goals&&(late||state.minute-last.minute<v185Coach.revertGap))continue;
   changes[key]=decision.target[key];
  }
  if(Object.keys(changes).length){
   for(const key of Object.keys(changes))history[key]={minute:state.minute,from:tactic[key],goals};
   v64ChangeTactics(career,fixture,state,side,changes,reason);state.lastAiChange[side]=state.minute;(ai.active||=[null,null])[side]=decision.why;
   out.push({minute:state.minute,side,kind:'tactics',changes,why:decision.why,goals});
  }
 }
 const now=state.tactics[side];(ai.answer||=[null,null])[side]=keys.every(key=>decision.target[key]===now[key]||!reachable(key))?decision.answer:null;
 const sub=v185Substitution(career,fixture,state,side,q);if(sub)out.push({minute:state.minute,side,kind:'sub',...sub});
 ai.log.push(...out);
 return out;
}
function v185CheckEvery(context,side){
 const plan=side===0?context.fixture.plan.home:context.fixture.plan.away,coach=context.career.world.coaches.find(item=>item.id===plan.coachId);
 return v185Coach.checkEvery[Math.max(1,Math.min(5,coach?.judgment?.adaptation??3))-1];
}
// Called by v65AfterStep for marked states after the minute sync: observe, then check the computer side after goals, at half time and on its cadence.
function v185AfterStep(context,goal,halftime){
 v185Observe(context);
 const state=context.state,side=1-context.ownSide;
 if(!goal&&!halftime&&(state.minute===0||state.minute===45||state.minute===state.lastAiCheck[side]||state.minute%(state.aiCoach.every||=v185CheckEvery(context,side))!==0))return;
 const club=v65Club(context,1).name;
 for(const entry of v185AiCoach(context,side,goal?'Tor':halftime?'Halbzeit':'Reguläre Prüfung')||[])if(entry.kind==='tactics')note(v185Text(club,entry),'major');
}
const v185BaseWorldReport=v65WorldReport;
v65WorldReport=function(context,...rest){
 const report=v185BaseWorldReport.call(this,context,...rest),log=context.state.aiCoach?.log;
 // Substitutions show the minute they were carried out; one that never came on is left out.
 const minute=entry=>entry.kind==='sub'?context.state.substitutions.find(item=>item.outPid===entry.outPid&&item.inPid===entry.inPid)?.minute:entry.minute;
 if(log?.length)report.aiCoach=log.filter(entry=>minute(entry)!==undefined).map(entry=>({minute:minute(entry),text:v185Text(v65Club(context,entry.side===context.ownSide?0:1).name,entry)})).sort((a,b)=>a.minute-b.minute);
 return report;
};
const v185BaseReportHTML=v47ReportHTML;
v47ReportHTML=function(report,...rest){
 const html=v185BaseReportHTML.call(this,report,...rest);if(!report?.aiCoach?.length)return html;
 const section=`<section class="v185-ai-coach"><h3>Umstellungen des Gegners</h3><ul>${report.aiCoach.map(entry=>`<li><time>${escapeHTML(entry.minute)}′</time> <span>${escapeHTML(entry.text)}</span></li>`).join('')}</ul></section>`;
 const at=html.indexOf('</table>');return at<0?html+section:html.slice(0,at+8)+section+html.slice(at+8);
};

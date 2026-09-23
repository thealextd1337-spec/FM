// Match contact uses the same 600 × 740 space as the visible players and ball.
const v56Pixels=(a,b)=>Math.hypot((a.x-b.x)*600,(a.y-b.y)*740);
const v56BaseStats=emptyStats;
emptyStats=function(){return{...v56BaseStats(),slideAttempts:0,slideWon:0,fouls:0}};
for(const key of ['slideAttempts','slideWon','fouls'])if(!statKeys.includes(key))statKeys.push(key);

const v56BaseStart=start;
start=function(){const result=v56BaseStart();if(match&&running){match.slide=null;for(const player of match.people){player.motionX=0;player.motionY=player.t===0?-1:1;player.recoverUntil=0}}return result};
$('#start').onclick=()=>start();
function v56Forward(player){const length=Math.hypot(player.motionX||0,player.motionY||0);return length>.0001?{x:player.motionX/length,y:player.motionY/length}:{x:0,y:player.t===0?-1:1}}
function v56ApproachInfo(tackler,victim){const forward=v56Forward(victim),relative={x:tackler.x-victim.x,y:tackler.y-victim.y};return{behind:relative.x*forward.x+relative.y*forward.y<-0.012,body:v56Pixels(tackler,victim),ball:v56Pixels(tackler,match.ball)}}
function v56StandingTackle(tackler,victim){
 const m=match,info=v56ApproachInfo(tackler,victim);
 if(info.behind||info.ball>39||info.body>43)return false;
 tackler.stats.duels++;victim.stats.duels++;
 if(random()<v50FoulChance(tackler,victim)*.8){v50Foul(victim,tackler);return true}
 const chance=clamp(.18+(ability(tackler,'tak')-ability(victim,'tec'))*.022+(ability(tackler,'pos')-ability(victim,'spd'))*.006+(m.aggression?.[tackler.t]??0)*.04,.08,.55);
 if(random()<chance){tackler.stats.duelsWon++;victim.stats.passLost++;victim.recoverUntil=m.elapsed+1.5;m.owner=tackler;m.ball={x:tackler.x,y:tackler.y};m.lastPass=null;m.lastTouch=tackler.t;m.next=m.elapsed+.7;note(`${tackler.name} gewinnt den Ball im Zweikampf.`,'duel')}
 else{victim.stats.duelsWon++;tackler.recoverUntil=m.elapsed+.8;return false}
 return true;
}
function v56StartSlide(tackler,victim){
 const m=match,ball={...m.ball},forward=v56Forward(victim),behind=v56ApproachInfo(tackler,victim).behind;
 tackler.stats.slideAttempts++;tackler.stats.duels++;victim.stats.duels++;
 const lead=behind?.04:.016,target={x:clamp(ball.x+forward.x*lead,.06,.94),y:clamp(ball.y+forward.y*lead,.06,.94)};
 m.slide={tackler,victim,from:{x:tackler.x,y:tackler.y},target,progress:0,behind};
 tackler.slideActive=true;m.next=Infinity;
 note(`${tackler.name} setzt zur Grätsche gegen ${victim.name} an.`,'duel');
}
function v56AdvanceSlide(delta){
 const m=match,slide=m?.slide;if(!slide)return;
 const{tackler,victim}=slide;
 if(m.owner!==victim||m.setPiece||m.finished){m.slide=null;tackler.recoverUntil=m.elapsed+.25;return}
 slide.progress=Math.min(1,slide.progress+delta/.52);
 const eased=1-(1-slide.progress)*(1-slide.progress);
 tackler.x=slide.from.x+(slide.target.x-slide.from.x)*eased;
 tackler.y=slide.from.y+(slide.target.y-slide.from.y)*eased;
 tackler.tx=tackler.x;tackler.ty=tackler.y;
 const ballGap=v56Pixels(tackler,m.ball),bodyGap=v56Pixels(tackler,victim);
 if(bodyGap<27&&(ballGap>23||slide.behind)){
  m.slide=null;tackler.recoverUntil=m.elapsed+.58;
  v50Foul(victim,tackler);return;
 }
 if(ballGap<24){
  m.slide=null;tackler.recoverUntil=m.elapsed+.42;
  const success=clamp(.42+(ability(tackler,'tak')-ability(victim,'tec'))*.025+(ability(tackler,'pos')-ability(victim,'spd'))*.008-(slide.behind?.13:0),.15,.8);
  if(random()<success){tackler.stats.duelsWon++;tackler.stats.slideWon++;victim.stats.passLost++;victim.recoverUntil=m.elapsed+1.5;m.lastTouch=tackler.t;m.lastPass=null;if(random()<.3){v50LooseBall({x:tackler.x,y:tackler.y},`${tackler.name} grätscht den Ball frei.`)}else{m.owner=tackler;m.ball={x:tackler.x,y:tackler.y};m.next=m.elapsed+.55;note(`${tackler.name} gewinnt den Ball mit einer Grätsche.`,'duel')}}
  else{victim.stats.duelsWon++;m.next=m.elapsed+.45;note(`${victim.name} behauptet den Ball gegen die Grätsche.`,'duel')}
  return;
 }
 if(slide.progress>=1){m.slide=null;tackler.recoverUntil=m.elapsed+.6;victim.stats.duelsWon++;m.next=m.elapsed+.45;note(`${tackler.name} rutscht am Ball vorbei.`,'duel')}
}
function v56MaybeChallenge(victim){
 const m=match;if(!m||m.slide||m.flight||m.setPiece||m.kickoff||victim.keeper)return false;
 const rivals=m.people.filter(player=>player.t!==victim.t&&!player.keeper&&!player.slideActive&&(player.recoverUntil||0)<=m.elapsed);
 const standing=rivals.filter(player=>{const info=v56ApproachInfo(player,victim);return !info.behind&&info.ball<39&&info.body<43}).sort((a,b)=>v56Pixels(a,m.ball)-v56Pixels(b,m.ball))[0];
 if(standing)return v56StandingTackle(standing,victim);
 const slider=rivals.filter(player=>{const info=v56ApproachInfo(player,victim);return info.ball>=25&&info.ball<100&&info.body<105&&(info.behind||info.ball<info.body)}).sort((a,b)=>v56Pixels(a,m.ball)-v56Pixels(b,m.ball))[0];
 if(!slider)return false;
 const behind=v56ApproachInfo(slider,victim).behind;
 const chance=behind?clamp(.09+(m.aggression?.[slider.t]??0)*.06,.03,.21):clamp(.18+(m.aggression?.[slider.t]??0)*.09,.08,.35);
 if(random()>=chance)return false;
 v56StartSlide(slider,victim);return true;
}
const v56BaseAction=action;
action=function(){if(v56MaybeChallenge(match?.owner))return;return v56BaseAction()};

const v56BaseHighPass=v55HighPass;
v55HighPass=function(...args){
 const result=v56BaseHighPass(...args),flight=match?.flight;if(!flight?.aerial)return result;
 const end=flight.target;
 for(const player of match.people)player.interceptTarget=null;
 for(const team of[0,1]){
  const candidates=match.people.filter(player=>player.t===team&&!player.keeper&&v56Pixels(player,end)<180).sort((a,b)=>v56Pixels(a,end)-v56Pixels(b,end)).slice(0,2);
  candidates.forEach((player,index)=>{const side=team===0?1:-1,offset=index?(.05*(player.x<end.x?-1:1)):(team===0?-.022:.022);player.interceptTarget={x:clamp(end.x+offset,.065,.935),y:clamp(end.y+side*(index?.028:.018),.06,.94)}});
 }
 return result;
};

function v56Separate(){
 const m=match;if(!m||m.kickoff||m.setPiece||m.throwIn||m.goalPause>0||m.postBanner||m.finished)return;
 const people=m.people;
 for(let i=0;i<people.length;i++)for(let j=i+1;j<people.length;j++){
  const a=people[i],b=people[j];if(a.slideActive||b.slideActive)continue;
  let dx=(a.x-b.x)*600,dy=(a.y-b.y)*740,gap=Math.hypot(dx,dy);
  if(gap>=36)continue;
  if(gap<.01){const angle=((a.n*17+b.n*31+a.t*11)%360)*Math.PI/180;dx=Math.cos(angle);dy=Math.sin(angle);gap=1}
  const push=Math.min(4,(36-gap)*.28),ax=dx/gap*push/600,ay=dy/gap*push/740;
  a.x=clamp(a.x+ax,.055,.945);a.y=clamp(a.y+ay,.06,.94);
  b.x=clamp(b.x-ax,.055,.945);b.y=clamp(b.y-ay,.06,.94);
 }
 if(m.owner)m.ball={x:m.owner.x+.016,y:m.owner.y+(m.owner.t===0?-.022:.022)};
}
const v56BaseStep=step;
step=function(delta,realDelta){
 const m=match;if(!m)return;
 if(m.fulltimePending&&!m.setPiece&&!m.flight&&!m.throwIn&&m.goalPause<=0&&!m.halftimePause){m.kickoff=null;m.postBanner=null;finishMatch();return}
 const before=new Map(m.people.map(player=>[player,{x:player.x,y:player.y}]));
 if(m.slide&&!m.setPiece)v56AdvanceSlide(delta);
 const result=v56BaseStep(delta,realDelta);
 if(m.finished)return result;
 for(const player of m.people){const old=before.get(player);if(old){const dx=player.x-old.x,dy=player.y-old.y;if(Math.hypot(dx,dy)>.0002){player.motionX=dx;player.motionY=dy}}if(player.slideActive&&!m.slide&&m.elapsed>=(player.recoverUntil||0))player.slideActive=false}
 v56Separate();return result;
};

const v56BaseDraw=draw;
draw=function(){const result=v56BaseDraw(),m=match;if(!m)return result;const ctx=$('#canvas').getContext('2d');
 for(const player of m.people){
  if(player.slideActive){const slide=m.slide?.tackler===player?m.slide:null,angle=slide?Math.atan2((slide.target.y-slide.from.y)*740,(slide.target.x-slide.from.x)*600):Math.atan2((player.motionY||0)*740,(player.motionX||1)*600);ctx.save();ctx.translate(player.x*600,player.y*740);ctx.rotate(angle);ctx.fillStyle=player.t===0?'#c7f36b':'#7bb7e9';ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,25,11,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore()}
 }
 return result;
};

const v56BasePlayerStats=v47PlayerStatsHTML;
v47PlayerStatsHTML=function(player,teamName){return v56BasePlayerStats(player,teamName).replace(/<\/div>$/,`<span>Grätschen gewonnen</span><b>${player.stats.slideWon||0} / ${player.stats.slideAttempts||0}</b><span>Fouls</span><b>${player.stats.fouls||0}</b></div>`)};
const v56BaseVersion=v50Version;
v50Version=function(){v56BaseVersion();document.querySelectorAll('footer span:first-child').forEach(label=>label.textContent='Doppel 6 / PROTOTYP 56');const footer=startScreen?.querySelector('footer');if(footer)footer.textContent='Doppel 6 / PROTOTYP 56'};
v50Version();

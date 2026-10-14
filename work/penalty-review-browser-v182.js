// Evaluate this expression on the actual source/build page (T3 preview).
// QA fixtures only; production sources and native randomness are not replaced.
(async()=>{
 const assert=(ok,why)=>{if(!ok)throw Error(why)},rows=[];
 await new Promise(resolve=>setTimeout(resolve,0));
 document.querySelector('#v42-demo-start').click();
 v42Session.phase='shooting';v42Session.penaltyRevision=182;
 const session=v42Session,player=session.own.find(p=>p.n===session.order[0]);
 const box=el=>{const r=el.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
 const overlaps=(a,b)=>a.left<=b.right&&a.right>=b.left&&a.top<=b.bottom&&a.bottom>=b.top;
 for(const width of [570,330])for(const side of [-1,1])for(const frame of ['post','bar']){
  session.last={side:0,number:player.n,name:player.name,goal:false,outcome:frame==='post'?'wide':'high',frame,shotSide:side,diveSide:-side};v42RenderScreen();
  const scene=v42Screen.querySelector('.v42-goal-scene'),ball=scene.querySelector('.v42-ball'),goal=scene.querySelector('.v42-goal');scene.style.width=width+'px';
  const a=ball.getAnimations()[0];assert(a?.animationName===(frame==='post'?'v182BallPost':'v182BallBar'),'frame animation selected');a.pause();a.currentTime=495;
  const contact=box(ball),g=box(goal),surface=frame==='bar'?{left:g.left,right:g.right,top:g.top,bottom:g.top+7}:{left:side<0?g.left:g.right-7,right:side<0?g.left+7:g.right,top:g.top,bottom:g.bottom};
  assert(overlaps(contact,surface),'ball contacts '+frame+' at '+width+' / '+side);
  a.currentTime=900;const rebound=box(ball);assert(frame==='post'?side*(rebound.left-contact.left)>20:rebound.top<contact.top-25,'visible rebound');
  rows.push({kind:'shootout',width,side,frame,contact,surface,rebound});
 }
 v42Screen.hidden=true;v42Session=null;
 const career=v167CreateCareer('AUT-5','review-v182','Test'),fixture=v62Fixtures(career).find(f=>!f.result&&(f.homeId===career.manager.managedClubId||f.awayId===career.manager.managedClubId));
 assert(fixture,'world fixture');v61CurrentCareer=career;career.world.activeMatch={fixtureId:fixture.id,state:v64MakeState(career,fixture)};career.world.activeMatch.state.phase='live';v98View='2d';v65Show(v65Context());
 const stop=()=>{clearInterval(v65WorldFrame);clearInterval(v64UiTimer);v102StopPaint();};stop();
 const t=window.doppel6Language.translate;
 for(const team of [0,1])for(const side of [-1,1])for(const frame of ['post','bar']){
  Object.assign(match,{setPiece:null,flight:null,slide:null,kickoff:null,postBanner:null,goalPause:0,halftimePause:0,finished:false,countdown:0});
  running=true;v50Restart('penalty',team,{x:.5,y:team===0?.15:.85},'Elfmeter nach Foul');const piece=match.setPiece;
  Object.assign(piece,{penaltyReady:true,phase:'result',wait:2.15-.9*.55,outcome:frame==='post'?'wide':'high',frame,shotSide:side,diveSide:-side});
  const last={side:0,number:piece.taker.n,name:piece.taker.name,goal:false,outcome:piece.outcome,frame,shotSide:side,diveSide:-side};v50PenaltyVisual(piece,last);v100SyncPenaltyBall();stop();
  const scene=document.querySelector('#v50-penalty-scene .v42-goal-scene'),ball=scene.querySelector('.v42-ball'),g=box(scene.querySelector('.v42-goal')),contact=box(ball);
  const surface=frame==='bar'?{left:g.left,right:g.right,top:g.top,bottom:g.top+7}:{left:side<0?g.left:g.right-7,right:side<0?g.left+7:g.right,top:g.top,bottom:g.bottom};
  assert(overlaps(contact,surface),'world ball contacts '+frame);assert(getComputedStyle(ball).animationName==='none','native clock controls world ball');
  const before=JSON.stringify(match),rng=match.seed,picture=v98PitchFrame(match);assert(JSON.stringify(match)===before&&match.seed===rng,'shared picture preserves match');
  piece.wait=1.25;v100SyncPenaltyBall();const rebound=box(ball);assert(frame==='post'?side*(rebound.left-contact.left)>20:rebound.top<contact.top-25,'world rebound');
  rows.push({kind:'world',team,side,frame,contact,surface,rebound,pictureBall:picture.ball});v50ClearPenaltyScene();
  const text=frame==='post'?'Pfosten':'Latte',english=frame==='post'?'Post':'Crossbar';assert(t(text)===english&&t(text+'!')===english+'!','actual translator');
  assert(t(piece.taker.name+': '+text)===piece.taker.name+': '+english,'dynamic translator');
 }
 match.setPiece=null;stop();running=false;
 return{pass:true,url:location.href,viewport:{width:innerWidth,height:innerHeight},rows};
})()

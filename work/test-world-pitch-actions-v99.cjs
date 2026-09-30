const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const banner={hidden:true,innerHTML:''},timers=[],calls=[];
const keeper={pid:'k',t:1,n:1,keeper:true,x:.5,y:.05,stats:{saves:0}},shooter={pid:'s',n:3,t:0,x:.5,y:.3,stats:{shots:0,onTarget:0}};
const current={people:[shooter,keeper],ball:{x:.5,y:.3},goals:[],owner:shooter,goalPause:0,elapsed:10};
const context=vm.createContext({match:current,v65WorldActive:true,MATCH_SPEED:.78,v50GoalKick(){current.next=current.elapsed+.75},v50Restart(type){current.setPiece={type,wait:2.5}},running:true,v47PlayerDialog:{open:false},v65SwapInfoTimer:0,
 v55Field:{top:.035,bottom:.965},$:()=>banner,v65Context:()=>({}),clearTimeout(){},setTimeout:(fn,ms)=>timers.push({fn,ms}),
 v65SwapInfoHTML:(_c,changes)=>changes.join(','),v65ShowSwapInfo:(_c,changes)=>{banner.innerHTML=changes.join(',');banner.hidden=false;calls.push('swap')},
 v50Goal:()=>{current.goals.push({});current.goalPause=4.05;calls.push('goal')},
 fly(target,duration,done){current.flight={x:current.ball.x,y:current.ball.y,target,progress:0,duration,done};current.owner=null},
 v55Shoot(person){person.stats.shots++;if(context.onTarget)person.stats.onTarget++;context.fly({x:context.onTarget?.5:.8,y:.035},.48,()=>{current.flight=null;if(context.goal)context.v50Goal();else{if(context.onTarget)keeper.stats.saves++;current.owner=keeper;current.ball={x:keeper.x,y:keeper.y}}})},
 v55ThrowStep(){const t=current.throwIn;current.throwIn=null;current.owner=t.taker;context.fly({x:.35,y:.3},.55,()=>{current.flight=null;current.owner=keeper})},
 step(_delta,dt){if(current.goalPause>0)current.goalPause=Math.max(0,current.goalPause-dt)},v83GoalPosition:()=>({x:.5,y:.02,height:0})});
vm.runInContext(fs.readFileSync('dist/world-pitch-actions-v99.js','utf8'),context);
const ballView=vm.runInContext('v99BallView',context),pose=vm.runInContext('v99PlayerAction',context);
context.onTarget=true;context.v55Shoot(shooter);
current.flight.progress=.5;const before=JSON.stringify(current),ball=ballView(current);
assert(ball.elevation>.8,'on-target shot leaves the ground');assert.equal(JSON.stringify(current),before,'projection leaves physical coordinates and flight untouched');
const dive=pose(current,keeper);assert.equal(dive.kind,'save');assert(dive.progress>0&&dive.progress<1);
current.flight.done();assert.equal(keeper.stats.saves,1);assert(pose(current,keeper).saved,'confirmed save uses existing save statistic');
context.running=false;context.step(.78,.4);assert.equal(pose(current,keeper).recovery,0,'paused save freezes');
context.running=true;context.step(.78,.5);assert(pose(current,keeper).recovery>.5);context.step(.78,.5);assert.equal(pose(current,keeper),null,'keeper returns to normal pose');
context.onTarget=false;shooter.stats.shots=0;context.v55Shoot(shooter);current.flight.progress=1;
assert(ballView(current).elevation>2.6,'off-target high shot clears crossbar');assert(Math.abs(ballView(current).x-.5)<.1,'high miss passes above goal mouth');
current.flight.done();assert.equal(keeper.stats.saves,1,'miss never creates a save');assert(ballView(current).elevation>2.6,'miss continues beyond the goal');context.step(.78,1.6);assert.equal(ballView(current),null);
shooter.stats.shots=2;context.v55Shoot(shooter);current.flight.progress=1;assert.equal(ballView(current).x,.8,'wide miss retains side of goal');current.flight.done();
current.throwIn={taker:shooter,ready:.3,spot:{x:.05,y:.3}};
assert.equal(pose(current,shooter).holding,true);assert.equal(ballView(current).elevation,2.62);
context.v55ThrowStep();assert.equal(pose(current,shooter).holding,false);current.flight.progress=.5;assert(ballView(current).elevation>2,'throw flies from overhead');current.flight.progress=1;assert(Math.abs(ballView(current).elevation-.29)<1e-9,'throw lands at receiver');
current.flight.done();context.step(.78,.4);assert.equal(pose(current,shooter),null);
context.v50Goal();context.v65ShowSwapInfo({},['A']);assert(banner.hidden);context.v65ShowSwapInfo({},['B']);context.step(.78,2);assert(banner.hidden,'swaps wait throughout goal banner');context.step(.78,2.1);assert.equal(banner.innerHTML,'AB');assert.equal(banner.hidden,false);assert.deepEqual(calls.slice(-2),['goal','swap']);
banner.innerHTML='prior swap';context.v50Goal();assert.equal(banner.hidden,true,'goal hides and queues already visible swap');context.step(.78,4.1);assert.equal(banner.innerHTML,'prior swap');
context.v50Goal();context.v65ShowSwapInfo({},['old']);context.match={people:[],goalPause:0};context.step(.78,4);assert.notEqual(banner.innerHTML,'old','queue cannot leak into next match');
console.log('3D actions: save/recovery/pause, overhead throws, high/wide shots, immutable projection, goal-before-swaps and lifecycle passed.');
context.match=current;current.goalPause=0;
context.v50GoalKick(keeper,'restart');assert(Math.abs(current.next-current.elapsed-2.4*.78)<1e-9,'world keeper waits 2.4 playback seconds');
context.v50Restart('penalty');assert.equal(current.setPiece.wait,2,'penalty award lasts two playback seconds');
context.v50Restart('corner');assert.equal(current.setPiece.wait,2.5,'other restarts keep their duration');
context.onTarget=true;context.goal=true;context.v55Shoot(shooter);vm.runInContext('v100ShotOutcome(match.flight,true)',context);assert.equal(pose(current,keeper).goal,true,'successful shot is distinct from save before arrival');
current.flight.done();current.goalScene={team:0,x:.5,elapsed:.12};
const netHit=ballView(current);assert(Math.abs(netHit.y-.035)*68/(.965-.035)>1.8,'direct goal reaches net in 120 ms');
current.goalScene.elapsed=.5;assert(ballView(current).elevation<netHit.elevation,'net hit then falls naturally');current.goalScene=null;current.goalPause=0;
context.onTarget=false;context.goal=false;shooter.stats.shots=0;current.ball={x:.5,y:.3};context.v55Shoot(shooter);current.flight.progress=1;
const highAtLine=ballView(current);current.flight.done();context.step(0,.01);const beyond=ballView(current);
assert(beyond.y<highAtLine.y&&beyond.elevation>highAtLine.elevation,'high miss preserves forward and rising velocity across goal plane');
context.step(0,.2);assert((.035-ballView(current).y)*68/(.965-.035)>5,'miss continues well behind goal before dropping');
const wide=vm.runInContext('v100PenaltyWidePoint',context),centre=wide(0,1,600,310),cross=wide(.65,1,600,310),far=wide(1,1,600,310);
assert.equal(centre.left,300);assert(cross.left>480,'penalty crosses outside right post');assert(far.left>cross.left&&far.bottom>cross.bottom,'wide penalty continues behind goal');
assert.equal(wide(1,-1,600,310).left,600-far.left,'left/right penalty misses are mirrored');
console.log('Restart delay, two-second penalty award, direct net impact, continuous high miss and penalty-wide perspective passed.');

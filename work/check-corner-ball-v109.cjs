const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{pathToFileURL}=require('url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve('outputs/spieler-nutzer-match.html')).href);await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});
  const cases=[];
  for(const team of [0,1])for(const turned of [false,true])for(const high of [false,true]){
   const result=await page.evaluate(({team,turned,high})=>{
    clearInterval(v65WorldFrame);v103EndReplay();running=true;hideOverlay();Object.assign(match,{kickoff:null,countdown:0,postBanner:null,throwIn:null,setPiece:null,flight:null,slide:null,goalPause:0,goalScene:null,rebound:null,halftimePause:0,halftimeBreakDone:turned,next:Infinity});
    const defender=match.people.find(p=>p.t!==team&&!p.keeper),start={x:.28,y:team===0?.09:.91};match.owner=defender;match.ball={...start};
    if(high){const target={x:.30,y:team===0?v55Field.top:v55Field.bottom};defender.x=.30;defender.y=target.y+(team===0?.025:-.025);defender.interceptTarget=target;v102Scoped(defender,'highPass',()=>fly(target,.40,()=>{defender.interceptTarget=null;v50Corner(team,.30,'Test einer hohen Abwehr')}))}
    else{const rand=Math.random;Math.random=()=>.9;try{v50Deflect(start,team,defender,'Test einer abgefälschten Flanke')}finally{Math.random=rand}}
    const flight=match.flight,end=v109FlightPoint(flight,1);let largestPositionStep=0;const movementStep=()=>{const before=match.people.map(p=>v98PitchPoint(p,false));step(.01*MATCH_SPEED,.01);for(const [i,p]of match.people.entries()){const next=v98PitchPoint(p,false);largestPositionStep=Math.max(largestPositionStep,Math.hypot(next.x-before[i].x,next.z-before[i].z))}};for(let i=0;i<100&&!match.setPiece;i++)movementStep();
    if(match.setPiece?.type!=='corner')throw Error('Expected real corner callback');
    const piece=match.setPiece,motion=v109CornerBalls.get(match),begin=v109CornerBallView(match),wait=piece.wait,rows=[];
    const separation=Math.hypot((begin.x-match.ball.x)*44/(v55Field.right-v55Field.left),(begin.y-match.ball.y)*68/(v55Field.bottom-v55Field.top));
    for(const age of [0,.20,.40,.70,.85,.90,.96,1.02,1.20]){
     while(v102Clock(match)-motion.at<age-1e-8)movementStep();
     const snapshot=JSON.stringify(match),point=v109CornerBallView(match),frame=v98PitchFrame(match);v99BallView(match);rows.push({age:v102Clock(match)-motion.at,...point,height3D:frame.ball.height});if(snapshot!==JSON.stringify(match))throw Error('Presentation mutated engine');
    }
    const snapshot=JSON.stringify(match),time=v102Clock(match);running=false;draw();v102StopPaint();for(let i=0;i<5;i++){v99BallView(match);draw();v102StopPaint()}const held=snapshot===JSON.stringify(match)&&time===v102Clock(match);
    const radii=[],ctx=document.querySelector('#canvas').getContext('2d'),arc=ctx.arc;ctx.arc=function(x,y,r,...args){if(r===3.78)radii.push({x,y});return arc.call(this,x,y,r,...args)};try{draw()}finally{ctx.arc=arc;v102StopPaint()}
    const point=v109CornerBallView(match),draw2D=radii.some(p=>Math.abs(p.x-point.x*600)<1e-6&&Math.abs(p.y-point.y*740)<1e-6);
    running=true;while(match.setPiece===piece)movementStep();const clearsOnKick=v109CornerBallView(match)===null,opacityAfterKick=v98PitchFrame(match).ball.opacity;
    return {team,turned,high,wait,begin,end,separation,rows,held,draw2D,clearsOnKick,opacityAfterKick,largestPositionStep};
   },{team,turned,high});
   assert(result.wait>=2,'Corner waits for players to reach their positions');assert(Math.abs(result.begin.x-result.end.x)<1e-8&&Math.abs(result.begin.y-result.end.y)<1e-8);assert(result.separation>3,'Immediately relocated to corner');
   assert(result.largestPositionStep<.2,'Players walk into the corner shape without a restart teleport');
   assert(result.rows[2].y<(team===0?result.begin.y:Infinity)&& (team===0||result.rows[2].y>result.begin.y),'Continues beyond goal line');
   assert(result.rows[4].opacity<1e-6&&result.rows[5].opacity<1e-6,'Relocation hidden');assert.equal(result.rows.at(-1).opacity,1);assert(result.rows.every(p=>p.elevation>=.29));if(high){assert(result.begin.elevation>2,'Elevated exit');assert(result.rows[2].elevation<result.begin.elevation,'Incoming descent continues')}assert(result.held&&result.draw2D&&result.clearsOnKick);assert.equal(result.opacityAfterKick,1);cases.push(result);
  }
  // Show a real ground deflection while it still rolls beyond the line.
  const visual=await page.evaluate(()=>{running=true;Object.assign(match,{kickoff:null,setPiece:null,flight:null,goalPause:0,goalScene:null,postBanner:null,throwIn:null,rebound:null,next:Infinity,halftimeBreakDone:false});const p=match.people.find(p=>p.t===1&&!p.keeper);match.owner=p;match.ball={x:.31,y:.08};const rand=Math.random;Math.random=()=>.9;try{v50Deflect(match.ball,0,p,'Block')}finally{Math.random=rand}while(!match.setPiece)step(.01*MATCH_SPEED,.01);for(let i=0;i<25;i++)step(.01*MATCH_SPEED,.01);running=false;draw();v102StopPaint();const expected=v98PitchFrame(match).ball,position=v98Scene.ballRoot.position.toArray(),projected=v98Scene.ballRoot.position.clone().project(v98Scene.camera);return {expected,position,projected:projected.toArray(),visible:v98Scene.ballRoot.visible,opacity:v98Scene.ball.material.opacity}});
  assert(Math.hypot(visual.position[0]-visual.expected.x,visual.position[1]-visual.expected.height,visual.position[2]-visual.expected.z)<1e-6,'Rendered ball follows the outgoing tail');assert(visual.visible&&visual.opacity===1);
  // Hide the banner only for this evidence image so the ball beyond the line is visible.
  await page.evaluate(()=>hideOverlay());
  await page.locator('#v98-canvas').screenshot({path:'outputs/corner-ball-v109.png'});assert.deepEqual(errors,[]);const report={cases,visual,errors,published:false};fs.writeFileSync('docs/spieler-nutzer-rig/corner-ball-qa-v109.json',JSON.stringify(report,null,2));console.log(JSON.stringify({cases:cases.length,held:cases.every(c=>c.held),bothTeamsAndHalves:true,groundAndAerial:true,draw2D:true,visual,errors}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

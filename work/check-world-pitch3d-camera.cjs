const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
// Isolated camera acceptance: no user browser profile or saves.
const {chromium}=require(process.env.D6_PLAYWRIGHT||'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const source=fs.readFileSync('work/check-world-pitch3d-browser.cjs','utf8');
const setup=vm.runInNewContext(source.slice(source.indexOf('async function setup('),source.indexOf('async function complete('))+';setup',{url:process.env.D6_TEST_URL||'http://127.0.0.1:4173/'});
(async()=>{const browser=await chromium.launch({executablePath:process.env.D6_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage({viewport:{width:1440,height:950}});await setup(page);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const projections=await page.evaluate(()=>{
  const list=[];for(const x of [-34,-17,0,17,34])for(const z of [-22,0,22]){
   const pose=v98CameraAim({x,z,height:.29},'follow',16/9),camera=new THREE.PerspectiveCamera(pose.fov,16/9,.1,240);camera.position.set(pose.position.x,pose.position.y,pose.position.z);camera.lookAt(pose.target.x,pose.target.y,pose.target.z);camera.updateMatrixWorld();const p=new THREE.Vector3(x,.29,z).project(camera);list.push({x,z,screenX:p.x,screenY:p.y});
  }return list;
 });assert(projections.every(p=>Math.abs(p.screenX)<1&&Math.abs(p.screenY)<1),'stationary ball remains framed at every field edge');
 const pass=await page.evaluate(()=>{let pose=v98CameraAim({x:-34,z:0,height:.29},'follow',16/9),maxX=0;for(let i=1;i<=30;i++){const ball={x:-34+68*i/30,z:0,height:.29};pose=v98BlendCamera(pose,v98CameraAim(ball,'follow',16/9),.02);const camera=new THREE.PerspectiveCamera(pose.fov,16/9,.1,240);camera.position.set(pose.position.x,pose.position.y,pose.position.z);camera.lookAt(pose.target.x,pose.target.y,pose.target.z);camera.updateMatrixWorld();maxX=Math.max(maxX,Math.abs(new THREE.Vector3(ball.x,.29,0).project(camera).x));}return maxX;});console.log('Maximum screen x during long pass:',pass);assert(pass<1,'ball remains framed during a quick pass across the pitch');
 await page.evaluate(async()=>{hideOverlay();match.owner=null;match.flight=null;match.kickoff=null;match.postBanner=null;match.ball={x:.5,y:.5-25*(v55Field.bottom-v55Field.top)/68};for(let i=0;i<90;i++)await new Promise(resolve=>requestAnimationFrame(()=>{draw();resolve();}));});
 await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/camera-near-half.png'});
 const close=await page.evaluate(()=>window.d6Pitch3D.getState().camera);assert.equal(close.mode,'follow');assert(close.target.x>close.position.x+10);
 await page.locator('#v98-camera').selectOption('wide');await page.evaluate(async()=>{for(let i=0;i<90;i++)await new Promise(resolve=>requestAnimationFrame(()=>{draw();resolve();}));});
 await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/camera-wide-half.png'});
 const wide=await page.evaluate(()=>window.d6Pitch3D.getState().camera);assert.equal(wide.mode,'wide');assert(wide.position.y>close.position.y+5);
 await page.setViewportSize({width:844,height:390});await page.locator('#v98-camera').selectOption('follow');await page.evaluate(async()=>{for(let i=0;i<90;i++)await new Promise(resolve=>requestAnimationFrame(()=>{draw();resolve();}));});await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/camera-near-mobile.png'});
 await page.evaluate(()=>{window.doppel6Language.set('en');draw();});assert.equal(await page.locator('#v98-camera').getAttribute('aria-label'),'TV camera');assert((await page.locator('#v98-camera option[value="follow"]').textContent()).includes('Tracking'));
 assert.deepEqual(errors,[]);fs.writeFileSync('outputs/camera-framing-v98.json',JSON.stringify({projections,longPassMaxScreenX:pass,close,wide,errors},null,2));console.log('Camera framing, smooth half focus, near/wide selection, mobile and English passed.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

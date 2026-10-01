const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const {chromium}=require(process.env.D6_PLAYWRIGHT||'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const source=fs.readFileSync('work/check-world-pitch3d-browser.cjs','utf8');
const setup=vm.runInNewContext(source.slice(source.indexOf('async function setup('),source.indexOf('async function complete('))+';setup',{url:process.env.D6_TEST_URL||'http://127.0.0.1:4197/'});
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage({viewport:{width:1440,height:950}});await setup(page);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const result=await page.evaluate(()=>{running=false;draw();const visual=[...v98Players.values()].find(v=>!v.keeper);visual.root.position.y=0;visual.previous={x:0,z:0};let contactError=0,swingHeight=10,contacts=0;
 for(let i=1;i<=240;i++){
  const person={x:i/60*3,z:0,number:4};v102RunPose(visual,person,1/60,true);visual.previous={x:person.x,z:0};visual.root.updateMatrixWorld(true);
  for(let leg=0;leg<2;leg++){
   const phase=((visual.runPhase/(2*Math.PI)+leg*.5)%1+1)%1,sole=visual.feet[leg].localToWorld(new THREE.Vector3(0,-.0775,.1));
   if(phase<.6){contactError=Math.max(contactError,Math.abs(sole.y-.038));contacts++;}
   else if(i>60&&phase>.72&&phase<.88)swingHeight=Math.min(swingHeight,sole.y);
  }
 }
 return {contactError,swingHeight,contacts,drawCalls:v98Scene.renderer.info.render.calls,geometries:v98Scene.renderer.info.memory.geometries};});
 assert(result.contactError<.018,'real 3D boot sole meets turf during stance');assert(result.swingHeight>.15,'swing clears turf');assert(result.contacts>250);assert.deepEqual(errors,[]);fs.writeFileSync('outputs/gait104-ground.json',JSON.stringify({...result,errors},null,2));console.log(JSON.stringify(result));
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});

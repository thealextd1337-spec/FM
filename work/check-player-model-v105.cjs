const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const {chromium}=require(process.env.D6_PLAYWRIGHT||'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const source=fs.readFileSync('work/check-world-pitch3d-browser.cjs','utf8');const setup=vm.runInNewContext(source.slice(source.indexOf('async function setup('),source.indexOf('async function complete('))+';setup',{url:process.env.D6_TEST_URL||'http://127.0.0.1:4198/'});
(async()=>{fs.mkdirSync('.impeccable/review',{recursive:true});const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await setup(page,'3d',undefined,null,false);
 const identity=await page.evaluate(()=>{for(let i=0;i<260;i++){step(.04*MATCH_SPEED,.04)}running=false;hideOverlay();draw();return [...v98Players].map(([id,v])=>({id,saved:match.people.find(p=>p.pid===id).appearance,shown:v.appearance}))});
 for(const p of identity)for(const key of ['skinTone','hairColor','hairstyle','faceShape','facialHair'])if(p.saved)assert.equal(p.shown[key],p.saved[key]);
 const metrics=await page.evaluate(()=>({calls:v98Scene.renderer.info.render.calls,triangles:v98Scene.renderer.info.render.triangles,geometries:v98Scene.renderer.info.memory.geometries}));
 await page.screenshot({path:'.impeccable/review/desktop.png',fullPage:true});await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/model105-tv-desktop.png'});
 await page.setViewportSize({width:844,height:390});await page.waitForFunction(()=>d6Pitch3D.getState().view==='3d');await page.screenshot({path:'.impeccable/review/mobile.png',fullPage:true});await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/model105-tv-mobile.png'});
 await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>d6Pitch3D.getState().view==='2d');assert.equal(await page.evaluate(()=>v102Loop),0);await page.screenshot({path:'.impeccable/review/portrait.png',fullPage:true});
 await page.setViewportSize({width:1440,height:950});await page.waitForFunction(()=>d6Pitch3D.getState().view==='3d');
 await page.evaluate(()=>{
  running=false;draw();hideOverlay();for(const v of v98Players.values()){v.root.visible=false;v.label.hidden=true}v98Scene.ownerRing.visible=false;v98Scene.ballRoot.visible=false;
  const specs=[{main:'#204944',trim:'#e7eee2',accent:'#dcbb66',style:'hoops'},{main:'#deddd2',trim:'#99283f',accent:'#153941',style:'pinstripes'},{main:'#254f73',trim:'#e7ce70'}];
  const looks=[{skinTone:'deep',hairColor:'black',hairstyle:'tight_curls',faceShape:'oval',facialHair:'none'},{skinTone:'warm',hairColor:'dark-brown',hairstyle:'side_part',faceShape:'square',facialHair:'stubble'},{skinTone:'fair',hairColor:'gray',hairstyle:'buzz',faceShape:'angular',facialHair:'none'}];
  for(let i=0;i<3;i++){const p=v98Scene.player(i%2,7+i,(i-1)*1.7,0,i===2,specs[i],looks[i]);p.root.rotation.y=i===1?-.55:.2;p.limbs[1].rotation.x=p.limbs[3].rotation.x=-.12;p.elbows.forEach(e=>e.rotation.x=-.22)}
  const c=v98Scene.camera;c.position.set(0,2.1,7.8);c.fov=30;c.lookAt(0,1.3,0);c.updateProjectionMatrix();v98Scene.renderer.render(v98Scene.scene,c);
 });
 await page.locator('#match-area .v42-pitch-stage').screenshot({path:'.impeccable/review/model-gallery.png'});await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/model105-gallery.png'});
 assert.deepEqual(errors,[]);fs.writeFileSync('outputs/model105-browser.json',JSON.stringify({metrics,identityCases:identity.length,errors},null,2));console.log(JSON.stringify({metrics,identityCases:identity.length,errors}));
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});

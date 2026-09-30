// Paired software-WebGL measurements, not an estimate of mobile hardware FPS.
const fs=require('fs'),vm=require('vm'),cp=require('child_process');
const {chromium}=require(process.env.D6_PLAYWRIGHT||'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const source=fs.readFileSync('work/check-world-pitch3d-browser.cjs','utf8');
const setup=vm.runInNewContext(source.slice(source.indexOf('async function setup('),source.indexOf('async function complete('))+';setup',{url:process.env.D6_TEST_URL||'http://127.0.0.1:4196/'});
const baseline=cp.execFileSync('git',['show','445457d:dist/pitch-scene-v98.js'],{encoding:'utf8'});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950}});await setup(page,'3d',undefined,null,false);
  const results=await page.evaluate(baseline=>{
   running=false;draw();const currentFactory=D6PitchScene,canvas=document.createElement('canvas');document.body.append(canvas);
   (0,eval)(baseline);const previous=D6PitchScene.create(canvas,{goalWidth:44*.2/(v55Field.right-v55Field.left),advertising:v98HomeSponsor(v65Context())});window.D6PitchScene=currentFactory;
   for(const person of v98Scene.people){const old=previous.player(person.team,person.number,person.root.position.x,person.root.position.z,person.keeper,person.number?v98Kit(match.people.find(p=>p.t===person.team&&p.n===person.number)):null);old.root.visible=person.root.visible;old.root.rotation.copy(person.root.rotation);}
   const results=[];
   for(const size of [[840,473],[760,428]]){
    const measure=scene=>{
     scene.renderer.setPixelRatio(1);scene.renderer.setSize(...size,false);scene.camera.copy(v98Scene.camera);scene.camera.aspect=size[0]/size[1];scene.camera.updateProjectionMatrix();
     const context=scene.renderer.getContext();for(let i=0;i<4;i++){scene.renderer.render(scene.scene,scene.camera);context.finish()}
     const times=[];for(let i=0;i<12;i++){const start=performance.now();scene.renderer.render(scene.scene,scene.camera);context.finish();times.push(performance.now()-start)}
     times.sort((a,b)=>a-b);return {medianMs:times[6],p95Ms:times[11],drawCalls:scene.renderer.info.render.calls,geometries:scene.renderer.info.memory.geometries};
    };
    results.push({width:size[0],height:size[1],v101:measure(previous),v102:measure(v98Scene)});
   }
   previous.dispose();canvas.remove();return results;
  },baseline);
  fs.writeFileSync('outputs/motion102-render-cost.json',JSON.stringify({renderer:'Edge SwiftShader, DPR 1, shadows on, gl.finish, 12 samples after warmup',baseline:'445457d',results},null,2));console.log(JSON.stringify(results));
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});

const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
(async()=>{
 const source='dist/world-space-passes-v150.js',file='outputs/Doppel-6-Fussballmanager.html',html=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'),index=fs.readFileSync('dist/index.html','utf8');
 assert.equal(hash(file),hash('outputs/index.html'));assert(html.includes(fs.readFileSync(source,'utf8').replace(/\r\n/g,'\n')));
 const version=index.match(/PROTOTYP (\d+)\b/)[1];assert.equal(html.match(/PROTOTYP (\d+)\b/)[1],version);
 for(const name of ['dist/index.html','work/build.cjs','work/server.cjs'])assert(fs.readFileSync(name,'utf8').includes('world-space-passes-v150.js'));
 const evidence=['outputs/space-passes-v150.json','outputs/space-regular-actions-v150.json','outputs/world3d-parity-v150.json','outputs/space-match-study-v150.json'];for(const name of evidence){const report=JSON.parse(fs.readFileSync(name));if(report.errors)assert.deepEqual(report.errors,[]);}
 assert(JSON.parse(fs.readFileSync(evidence[2])).matched);
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 let preview;
 try{
  const page=await browser.newPage({viewport:{width:1280,height:820}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('outputs/spieler-nutzer-match.html')).href,{timeout:120000});await page.waitForFunction(()=>window.userMeshyMatchReady,null,{timeout:60000});
  preview=await page.evaluate(()=>{
   clearInterval(v65WorldFrame);clearInterval(v64UiTimer);v102StopPaint();let frames=0;
   while(frames++<5000){v103EndReplay(match);if(v65Context().state.phase==='paused'){v65Resume();clearInterval(v65WorldFrame);}step(.05*MATCH_SPEED,.05);if(v65Context().state.phase==='live'&&!match.finished)v65AfterStep(v65Context());const plan=v150SpacePasses.get(match);if(plan&&match.flight&&match.flight.progress>.3){running=false;draw();if(v102Frames)v102Frames.at-=1000;v98Render();v102StopPaint();v132RevealControls();return {frames,progress:match.flight.progress,intended:{...plan.intended},runner:plan.runner?.name,ball:{...match.ball},nativeModel:!!window.D6UserMeshyPlayer,view:window.d6Pitch3D.getState().view};}if(match.finished)break;}
   throw Error('No native space-pass preview');
  });
  await page.locator('#match-area .v42-pitch-stage').screenshot({path:'outputs/space-pass-native-v150.png'});assert.equal(preview.view,'3d');assert(preview.nativeModel);assert.deepEqual(errors,[]);
 }finally{await browser.close();}
 const sources=['dist/game.js','dist/pitch-v55.js',source,'dist/index.html','dist/i18n-v75.js','dist/world-3d-documentation-data-v134.js','work/build.cjs','work/server.cjs'];
 const report={localOnly:true,version:Number(version),buildSha256:hash(file),sourceHashes:Object.fromEntries(sources.map(name=>[name,hash(name)])),evidenceHashes:Object.fromEntries(evidence.map(name=>[name,hash(name)])),preview};fs.writeFileSync('outputs/space-pass-verification-v150.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({version,buildSha256:report.buildSha256,preview,evidence:evidence.length}));
})().catch(e=>{console.error(e);process.exitCode=1;});

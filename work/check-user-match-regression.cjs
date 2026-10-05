// Run existing browser gates after the optional character has actually loaded.
const fs=require('fs'),Module=require('module'),path=require('path'),{pathToFileURL}=require('url');
const target=process.argv[2]||'work/check-world-pitch3d-browser.cjs';
const modelFile=process.env.D6_MODEL_TEST_FILE||'outputs/spieler-nutzer-match.html';
process.env.D6_TEST_URL=pathToFileURL(path.resolve(modelFile)).href+'?qa=1';
function adapt(source){
 const needle=' await page.evaluate(({view,fixtureSide,graphicsAtTick})=>{';if(!source.includes(needle))throw Error('Browser setup seam changed');
 source=source.replace(needle," if(await page.evaluate(()=>Boolean(window.D6UserMeshyPlayer))){await page.waitForFunction(()=>window.userMeshyMatchReady||window.userMeshyMatchError,null,{timeout:60000});const modelError=await page.evaluate(()=>window.userMeshyMatchError||null);if(modelError)throw Error('User character failed to load: '+modelError);}\n"+needle);
 // Both parity runs skip presentation waits; replay itself has a separate gate.
 const tick='   step(.05*MATCH_SPEED,.05);if(v65Context().state.phase';
 return source.replace(tick,'   v103EndReplay(match);step(.05*MATCH_SPEED,.05);if(v65Context().state.phase').replaceAll("path.resolve('outputs/Doppel-6-Fussballmanager.html')",`path.resolve(${JSON.stringify(modelFile)})`);
}
const requireTest=name=>name==='fs'?{...fs,readFileSync(file,...args){const result=fs.readFileSync(file,...args);return String(file).replace(/\\/g,'/').endsWith('work/check-world-pitch3d-browser.cjs')?adapt(result):result}}:require(name);
let source=fs.readFileSync(target,'utf8');if(target.endsWith('check-world-pitch3d-browser.cjs'))source=adapt(source);
// Keep assertions in Node's realm so browser-returned records compare normally.
const testModule=new Module(path.resolve(target),module);testModule.filename=path.resolve(target);testModule.paths=module.paths;testModule.require=requireTest;testModule._compile(source,testModule.filename);

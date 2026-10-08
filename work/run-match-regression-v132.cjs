// Execute existing gates on this build without overwriting historical evidence.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const names=['check-live-warping-v121.cjs','check-play-actions-v127.cjs','check-keeper-visual-v120.cjs','check-keeper-scenarios-v120.cjs','check-half-time-throw-v118.cjs','check-keeper-reference-v130.cjs','check-user-model-integration-v112.cjs'];
const target=process.argv[2];if(!names.includes(path.basename(target||'')))throw Error('Unknown regression gate');let source=fs.readFileSync(target,'utf8');
source=source.replaceAll('football-v113.glb','football-v130.glb').replaceAll("while(career.world.market.phase==='open')","if(career.world.market.phase==='budget')v124SetYouthBudget(career,0);while(career.world.market.phase==='open')").replace(/-v(?:111|112|113|118|120|121|124|127|130)\.(json|png)/g,'-v132.$1');
if(target.endsWith('check-keeper-reference-v130.cjs'))source=source.replace("replaceAll('v124','v130')","replaceAll('v124','v132')");
const file=path.resolve(target),task=new Module(file,module);task.filename=file;task.paths=Module._nodeModulePaths(path.dirname(file));task._compile(source,file);

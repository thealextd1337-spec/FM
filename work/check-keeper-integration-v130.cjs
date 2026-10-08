const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const file=path.resolve('work/check-user-model-integration-v112.cjs');
let source=fs.readFileSync(file,'utf8').replaceAll('football-v113.glb','football-v130.glb').replaceAll('v112','v130');
source=source.replace("while(career.world.market.phase==='open')","if(career.world.market.phase==='budget')v124SetYouthBudget(career,0);while(career.world.market.phase==='open')");
const task=new Module(file,module);task.filename=file;task.paths=Module._nodeModulePaths(path.dirname(file));task._compile(source,file);

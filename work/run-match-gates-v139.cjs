const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const target=process.argv[2],file=path.resolve(target),task=new Module(file,module);task.filename=file;task.paths=Module._nodeModulePaths(path.dirname(file));let source=fs.readFileSync(file,'utf8');
if(target.endsWith('run-halftime-parity-v136.cjs'))source=source.replaceAll('PROTOTYP 109','PROTOTYP 110').replaceAll("'v136'","'v139'");
else if(target.endsWith('run-fullscreen-regression-v136.cjs'))source=source.replaceAll("'v136'","'v139'");
else if(target.endsWith('check-halftime-fullscreen-v136.cjs'))source=source.replaceAll('PROTOTYP 109','PROTOTYP 110').replaceAll('halftime-fullscreen-v136','halftime-fullscreen-v139');
else if(target.endsWith('check-review-events-v132.cjs'))source=source.replaceAll('-v132.','-v139.');
else throw Error('Unknown gate');task._compile(source,file);

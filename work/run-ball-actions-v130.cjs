const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const file=path.resolve('work/check-user-ball-actions-v111.cjs');
const source=fs.readFileSync(file,'utf8').replaceAll('v111','v130');
const task=new Module(file,module);task.filename=file;task.paths=Module._nodeModulePaths(path.dirname(file));task._compile(source,file);

const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const file=path.resolve('work/run-match-parity-v134.cjs'),task=new Module(file,module);
task.filename=file;task.paths=Module._nodeModulePaths(path.dirname(file));process.argv[2]='work/check-world-pitch3d-browser.cjs';
task._compile(fs.readFileSync(file,'utf8').replaceAll('PROTOTYP 107','PROTOTYP 109').replaceAll('v134','v136'),file);

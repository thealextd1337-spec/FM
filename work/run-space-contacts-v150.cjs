const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const file=path.resolve('work/check-play-actions-v127.cjs'),task=new Module(file,module);
task.filename=file;task.paths=Module._nodeModulePaths(path.dirname(file));
task._compile(fs.readFileSync(file,'utf8').replace('docs/spieler-nutzer-rig/play-actions-qa-v127.json','outputs/space-regular-actions-v150.json'),file);

// Reuse established match/view gates while keeping historical evidence intact.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const target=process.argv[2],allowed=['parity','check-fullscreen-tv-v132.cjs','check-touch-controls-v132.cjs','check-review-events-v132.cjs'];
if(!allowed.includes(target))throw Error('Unknown mobile regression gate');
const entry=target==='parity'?'work/run-match-parity-v134.cjs':target==='check-review-events-v132.cjs'?'work/'+target:'work/run-regression-v134.cjs';
let source=fs.readFileSync(entry,'utf8');
if(target==='parity')source=source.replaceAll('PROTOTYP 107','PROTOTYP 108');
if(target==='check-review-events-v132.cjs')source=source.replace(/-v132\.(json|png)/g,'-v135.$1');else source=source.replaceAll('v134','v135');
const file=path.resolve(entry),task=new Module(file,module);task.filename=file;task.paths=Module._nodeModulePaths(path.dirname(file));
process.argv[2]=target==='parity'?'work/check-world-pitch3d-browser.cjs':'work/'+target;
task._compile(source,file);

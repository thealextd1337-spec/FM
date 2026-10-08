// The legacy VM fixture omits the world adapter. Supply its inactive flag;
// keep all original assertions and the current production sources.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const file=path.resolve('work/test-world-physical-instructions.cjs');
let source=fs.readFileSync(file,'utf8');
const needle='const context=makeContext();';
if(!source.includes(needle))throw Error('Instruction fixture entry changed');
source=source.replace(needle,needle+'context.v65WorldActive=false;');
const test=new Module(file,module);test.filename=file;test.paths=Module._nodeModulePaths(path.dirname(file));test._compile(source,file);

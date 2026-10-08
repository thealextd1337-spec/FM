// Reuse the native decision harness, force the high-shot visual variant and
// retain its original ability and event-accounting assertions.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const file=path.resolve('work/check-keeper-scenarios-v120.cjs');let source=fs.readFileSync(file,'utf8').replace("id==='shooter'?2:1","id==='shooter'?1:1").replaceAll('-v120.json','-high-v131.json');source=source.replace('const f=m.flight;m.flight=null;',"const f=m.flight;if(v99Flights.get(f).onTarget&&!v99Flights.get(f).blocked&&v99Flights.get(f).endHeight!==2.7)throw Error('Not a high shot');m.flight=null;");const task=new Module(file,module);task.filename=file;task.paths=Module._nodeModulePaths(path.dirname(file));task._compile(source,file);

// Candidate changes exist only in the isolated renderer, not in product sources.
const fs=require('fs'),Module=require('module'),path=require('path');
let source=fs.readFileSync('work/check-running-turns-v125.cjs','utf8').replaceAll('-v125','-v127');
source=source.replace("for(const variant of diagnose?['original','no-turn','no-ik']:['original'])for(const fps of diagnose?[60]:[30,60,120])for(const kind of ['run-3.5','run-4.5','run-6.5','curve-left','curve-right','cut-left','cut-right','reverse','start-stop'])", "for(const variant of ['original','no-ik','soft-vertical','light-ik'])for(const fps of [60])for(const kind of ['run-3.5','run-4.5','run-6.5'])");
source=source.replace("if(variant==='no-turn')", "if(['soft-vertical','light-ik'].includes(variant))D6UserLocomotion.create=eval('(function '+factory.toString().replace('if(f.locked||floorDelta>0)','if(floorDelta>0)').replace('targetMarker.lerp(f.anchor,f.strength)',variant==='light-ik'?'targetMarker.lerp(f.anchor,f.strength*.35)':'targetMarker.lerp(f.anchor,f.strength)')+')');else if(variant==='no-turn')");
const from=source.indexOf('if(!baseline){const before='),to=source.indexOf('console.log(JSON.stringify(report.rows.map',from);source=source.slice(0,from)+source.slice(to);
source=source.replace("'running-turns-'+tag+'-v127.json'","'steady-run-diagnosis-v127.json'");
const test=new Module(path.resolve('work/check-running-turns-v125.cjs'),module);test.filename=path.resolve('work/check-running-turns-v125.cjs');test.paths=module.paths;test._compile(source,test.filename);

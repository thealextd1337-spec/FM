// Read-only replay of the five anomalous v115 seeds, with callback provenance.
const fs=require('node:fs'),Module=require('node:module'),path=require('node:path');
process.argv.push('--audit-accounting');
let code=fs.readFileSync('work/study-match-statistics-v115.cjs','utf8');
code=code.replace("audit?'match-study-accounting-v115.json'","audit?'accounting-baseline-v117.json'");
code=code.replace('shots=[],goalTrace=[],restore=[]','shots=[],goalTrace=[],restore=[],history=[]');
const needle="    wrap('v55WhistleOffside'";
const instrumentation=`
    const describe=f=>{const a=f&&v99Flights.get(f),b=f&&v102Flights.get(f);return f?{kind:b?.kind||a?.kind||null,person:b?.person?.pid||a?.shooter?.pid||null,progress:f.progress,target:f.target,onTarget:a?.onTarget,goal:a?.goal}:null};
    const event=(name,detail)=>{history.push({name,elapsed:match.elapsed,...detail});};
    wrap('fly',(base,self,args)=>{let f;const done=args[2];args[2]=function(){event('flight-end',{flight:describe(f)});return done.apply(this,arguments)};const value=base.apply(self,args);f=match.flight;event('flight-start',{flight:describe(f)});return value;});
    wrap('v65Finish',(base,self,args)=>{event('final-whistle',{flight:describe(match.flight),rebound:match.rebound?{...match.rebound}:null});return base.apply(self,args)});
    wrap('v50LooseBall',(base,self,args)=>{const incoming=v109IncomingFlight?.current===match?v109IncomingFlight.flight:match.flight;const result=base.apply(self,args);event('loose-ball',{incoming:describe(incoming),ball:{...match.ball},lastTouch:match.lastTouch,rebound:match.rebound?{...match.rebound}:null,text:args[1]});return result});
    wrap('v50Goal',(base,self,args)=>{event('goal',{team:args[0].t,source:args[3]||null,incoming:describe(v109IncomingFlight?.current===match?v109IncomingFlight.flight:match.flight),rebound:match.rebound?{...match.rebound}:null,lastTouch:match.lastTouch,ball:{...match.ball}});return base.apply(self,args)});
`;
if(!code.includes(needle))throw Error('Study seam changed');code=code.replace(needle,instrumentation+needle);
code=code.replace('shots,goalTrace,terminalFlight:','shots,goalTrace,history,terminalFlight:');
const m=new Module(path.resolve('work/study-match-statistics-v115.cjs'),module);m.filename=path.resolve('work/study-match-statistics-v115.cjs');m.paths=module.paths;m._compile(code,m.filename);

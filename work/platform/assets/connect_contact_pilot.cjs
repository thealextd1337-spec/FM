'use strict';
// One-time, asserted connection of the authored presentation files.
const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'../../..');
function edit(file,fn){const p=path.join(root,file),before=fs.readFileSync(p,'utf8'),after=fn(before);if(before===after)throw Error('No change: '+file);fs.writeFileSync(p,after);}
edit('prototypes/match-engine-unity/ProbeBridge.cs',s=>s
 .replace('public double error,time;','public double error,time,plantError;public bool reachable;')
 .replace('rigs.Clear();contactPoses.Clear();','rigs.Clear();football.Clear();contactPoses.Clear();')
 .replace('graph.Play();graphs.Add(graph);','graph.Play();graph.Evaluate(0);if(worldView!=null||simulation.State.playProbe)football.Add(new FootballAnimation(graph,go.transform,FootballClips()));graphs.Add(graph);')
 .replace('var desired=a!=null&&','if(state.playProbe){RenderDemoFootball(i,a,state);continue;}var desired=a!=null&&'));
edit('prototypes/match-engine-unity/WorldViewBridge.cs',s=>{
 const start=s.indexOf('            double time=desired==runClip?'),end=s.indexOf('\n        }\n        RenderWorldNet',start);if(start<0||end<0)throw Error('World render block missing');
 return s.slice(0,start)+'            football[i].Sample(WorldFootballPose(p,f,i),f.clock,lastWorldClock<0||f.clock<lastWorldClock);'+s.slice(end);
});
edit('dist/world-unity-v151.js',s=>s
 .replace("action:p.action?.kind||'idle',progress:","action:p.action?.kind||'idle',actionId:String(p.action?.id??p.action?.kind??'idle'),contactPoint:p.action?.contactWorld?point(p.action.contactWorld):null,recovery:p.action?.recovery||0,progress:")
 .replace('const frame=basePitchFrame(current);if(current.goalScene',`const frame=basePitchFrame(current);for(const p of frame.players){const action=p.action;if(!action)continue;const contact=action.contact||(action.kind==='save'?action.target:null)||(['pass','shot','highPass','cross','freeKick','goalKick'].includes(action.kind)&&action.target?v101KickPoint(p.person,action.target):null);if(contact){const spot=v98PitchPoint(contact,frame.turned);p.action={...action,contactWorld:{...spot,height:contact.elevation??action.height??.29}};}}if(current.goalScene`));
for(const file of ['prototypes/match-engine-unity/generate-identity.cjs','prototypes/match-engine-unity/build-manifest.cjs'])edit(file,s=>s.replace("'prototypes/match-engine-unity/ProbePose.cs'","'prototypes/match-engine-unity/ProbePose.cs','prototypes/match-engine-unity/FootballAnimation.cs','prototypes/match-engine-unity/FootballPresentation.cs','prototypes/match-engine-unity/FootballSetup.cs','work/platform/assets/contact-pilot-manifest.json'").replace("'ProbePose.cs','ProbeCamera.cs'","'ProbePose.cs','FootballAnimation.cs','FootballPresentation.cs','FootballSetup.cs','ProbeCamera.cs'"));
console.log('Pilot presentation connected; simulation files unchanged.');

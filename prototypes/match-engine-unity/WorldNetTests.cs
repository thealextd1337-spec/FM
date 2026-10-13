#if UNITY_EDITOR
using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Reflection;
using UnityEngine;
namespace Doppel6.Probe {
// Goal-net display deformation (WorldNetDeformation, ProbeBridge.RenderWorldNet). Check kinds: "controlled" = analytic
// net facts on the actual ProbeBridge.GoalNet meshes and the actual RenderWorldNet upload, reset and reload; "golden" =
// offsets evaluated independently of this code (the documented model, sampling and spline in 40-digit arithmetic);
// "controlled-producer" = pinned rear-net physics with separate legacy capped and current flowing clock sweeps,
// for the ball envelope and final fade; "recorded" = native pictures captured from the bridge: the
// keeper-next captures (release 118, before v119; their net facts are today's fallback path) and any capture in
// outputs/lowpoly-live-rollout-20261013/net-recordings, -d6netrecordings <folder> or D6_NET_RECORDINGS (WorldConfig and
// WorldFrame JSON objects in any nesting and key order). Measurements carry no pass/fail; "inherited-native" ones
// describe native behaviour the display cannot change. Penetration is the depth by which the shown ball sphere
// (RenderWorld: DisplayHeight) passes the back net, sampled over its disc. Editor timings are no device or WebGL figure.
// Writes net-deformation-tests.json; throws when a check fails. The final release run (requireCapture,
// -d6requirenetcapture or D6_REQUIRE_NET_CAPTURE=1) also fails without a current-producer goal capture.
public static class WorldNetTests {
    [Serializable] class Item {public string kind,name,detail;public bool passed;public double value,limit;}
    [Serializable] class Measurement {public string kind,name,unit,detail;public double value;}
    [Serializable] class Recording {public string file,source,geometry;public int pictures,netPictures,v119Facts,samples,heldSamples,flowingNetPictures,flowingEnds,openFlowingFacts;public double penetration,restPenetration,added,largest,inward,largestStep,endStep,endStepWithoutHold;}
    [Serializable] class Report {public string schema="d6-net-deformation-tests-2";public bool passed,captureRequired;public int checks,failed,recordedLegacy,recordedCurrent;public string parameters;public Item[] items;public Measurement[] measurements;public Recording[] recordings;public string[] notes;}
    delegate void Checker(string kind,string name,bool passed,double value,double limit,string detail=null);
    delegate void Meter(string kind,string name,double value,string unit,string detail=null);
    sealed class Net {public Mesh mesh;public Vector3[] rest,vertices;public string[] tags;public int sign;}
    const string Controlled="controlled",Golden="golden",Producer="controlled-producer",Recorded="recorded",Inherited="inherited-native";
    // The native goal scene (pinned in Pins): its scene time stops at SceneCap while the goal pause lasts SceneDuration.
    const double SceneCap=2.45,SceneDuration=4.05;
    // The display constants the golden offsets were evaluated with; a deliberate change updates both.
    const string GoldenParameters="depth 2.2, fixed 0.03, ramps 0.8/0.7/0.6, pocket 0.6 m per bulge, radius 3, rest below bulge 0.00002, ripple 0.14 m 2.2 Hz 4.5 m/s decay 0.32 s onset 0.12 s spread 0.6, sway 0.1 m 1.5 Hz decay 0.4 s onset 0.1, fade 1.2-1.6 s, scene hold 2.45-3.25 s, roof/side 0.09 m per bulge radii 3/2, step 0.04";
    static readonly CultureInfo C=CultureInfo.InvariantCulture;
    static double R=>WorldBallMotion.Radius;
    static string F(double v)=>v.ToString("0.####",C);

    public static string Run(string repo,string output=null)=>Run(repo,output,CaptureRequired());
    // requireCapture: the final release run, which fails without a current-producer rear-net goal capture.
    public static string Run(string repo,string output,bool requireCapture){
        var items=new List<Item>();var measurements=new List<Measurement>();var notes=new List<string>();var recordings=new List<Recording>();
        void Check(string kind,string name,bool passed,double value,double limit,string detail=null){items.Add(new Item{kind=kind,name=name,passed=passed,value=value,limit=limit,detail=detail});}
        void Measure(string kind,string name,double value,string unit,string detail=null){measurements.Add(new Measurement{kind=kind,name=name,value=value,unit=unit,detail=detail});}
        var live=Live(1);
        Pins(repo,Check);
        GoldenOffsets(live,Check);
        Rigged(live,"live 68 x 44",Check,rig=>{Edges(rig,live,"live 68 x 44",Check);Recoil(rig,live,"live 68 x 44",Check,Measure);Shape(rig,live,Check);Smoothness(rig,live,Check);Hold(rig,live,Check);FlowingHold(rig,live,Check);Symmetry(rig,live,Check);Determinism(rig,live,Check);Integration(rig,live,Check,notes);Reload(rig,live,Check);});
        var large=Live(1.2);Rigged(large,"large 81.6 x 52.8",Check,rig=>Edges(rig,large,"large 81.6 x 52.8",Check));
        var fixture=Fixture();Rigged(fixture,"contract fixture goal 9.7 x 2.44",Check,rig=>{Edges(rig,fixture,"contract fixture goal 9.7 x 2.44",Check);Recoil(rig,fixture,"contract fixture goal 9.7 x 2.44",Check,Measure);});
        Envelope(live,Check,Measure,notes);
        CurrentEnvelope(live,Check,Measure,notes);
        CaptureGateTests(Check);
        int legacy=Recordings(Path.Combine(repo,"outputs/3d-quality/keeper-next/pictures"),"keeper-next capture (release 118, pre-v119: today's fallback net facts)",false,Check,recordings,notes);
        var folders=Folders(repo);int current=0;foreach(var folder in folders)current+=Recordings(folder,"capture "+folder,true,Check,recordings,notes);
        if(requireCapture)Check(Recorded,"Complete flowing current-producer rear-net goal captures are present (final release requirement)",current>0,current,1,current+" capture file(s) with flowing pictures and observed fact endings; folders: "+(folders.Count>0?string.Join(", ",folders):"none found"));
        else if(current==0)notes.Add("No current-producer goal capture found (outputs/lowpoly-live-rollout-20261013/net-recordings, -d6netrecordings, D6_NET_RECORDINGS): the 3 cm envelope and the end-at-rest check on recorded rear-net goals of the current producer are still unproven here; only the pinned controlled replica covers them. The final release run must pass requireCapture (-d6requirenetcapture or D6_REQUIRE_NET_CAPTURE=1), which fails without one.");
        var failedItems=items.FindAll(i=>!i.passed);
        var report=new Report{passed=failedItems.Count==0,captureRequired=requireCapture,checks=items.Count,failed=failedItems.Count,recordedLegacy=legacy,recordedCurrent=current,parameters=Parameters(),items=items.ToArray(),measurements=measurements.ToArray(),recordings=recordings.ToArray(),notes=notes.ToArray()};
        if(output!=null){var folder=Path.Combine(repo,output);Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,"net-deformation-tests.json"),JsonUtility.ToJson(report,true));}
        if(failedItems.Count>0)throw new Exception("WorldNetTests: "+failedItems.Count+" of "+items.Count+" checks failed: "+string.Join("; ",failedItems.ConvertAll(i=>i.name+" ("+i.value.ToString("0.#####",C)+" vs "+i.limit.ToString("0.#####",C)+")")));
        return "passed="+items.Count+" measurements="+measurements.Count+" recordedLegacy="+legacy+" recordedCurrent="+current+(current==0?" (current-producer capture pending)":"")+(requireCapture?" captureRequired":"");
    }
    static bool CaptureRequired(){
        foreach(var a in Environment.GetCommandLineArgs())if(a=="-d6requirenetcapture")return true;
        var env=Environment.GetEnvironmentVariable("D6_REQUIRE_NET_CAPTURE");return env=="1"||string.Equals(env,"true",StringComparison.OrdinalIgnoreCase);
    }

    // Native match geometry v1 (world-match-v64.js v160WorldGeometry) and the contract fixture's goal.
    static Geometry Live(double scale){double goal=44*.2/(544/600.0);return new Geometry{length=68*scale,width=44*scale,goalWidth=goal,goalHeight=goal/3,penaltyDepth=68*(.18-26/740.0)/(688/740.0),penaltyWidth=44*.5/(544/600.0),fieldPlayers=5,attackDirection=1};}
    static Geometry Fixture()=>new Geometry{length=68,width=44,goalWidth=9.7,goalHeight=2.44,penaltyDepth=13.2,penaltyWidth=29.1,fieldPlayers=5,attackDirection=1};
    static string Parameters(){
        string P(double v)=>v.ToString("0.#####",C);
        return "depth "+P(WorldNetDeformation.Depth)+", fixed "+P(WorldNetDeformation.Fixed)+", ramps "+P(WorldNetDeformation.RampWidth)+"/"+P(WorldNetDeformation.RampHeight)+"/"+P(WorldNetDeformation.RampDepth)+
            ", pocket "+P(WorldNetDeformation.PocketAmplitude)+" m per bulge, radius "+P(WorldNetDeformation.PocketRadius)+", rest below bulge "+P(WorldNetDeformation.RestBulge)+
            ", ripple "+P(WorldNetDeformation.RippleAmplitude)+" m "+P(WorldNetDeformation.RippleFrequency)+" Hz "+P(WorldNetDeformation.RippleSpeed)+" m/s decay "+P(WorldNetDeformation.RippleDecay)+" s onset "+P(WorldNetDeformation.RippleOnset)+" s spread "+P(WorldNetDeformation.RippleSpread)+
            ", sway "+P(WorldNetDeformation.SwayAmplitude)+" m "+P(WorldNetDeformation.SwayFrequency)+" Hz decay "+P(WorldNetDeformation.SwayDecay)+" s onset "+P(WorldNetDeformation.SwayOnset)+
            ", fade "+P(WorldNetDeformation.FadeStart)+"-"+P(WorldNetDeformation.FadeEnd)+" s, scene hold "+P(WorldNetDeformation.HoldStart)+"-"+P(WorldNetDeformation.HoldEnd)+" s, roof/side "+P(WorldNetDeformation.SympathyAmplitude)+" m per bulge radii "+P(WorldNetDeformation.RoofRadius)+"/"+P(WorldNetDeformation.SideRadius)+", step "+P(WorldNetDeformation.Step);
    }
    // Native fact profiles: rear-hit bulge (world-pitch3d-v98.js v119VisibleGoalView) and the fallback bulge
    // (world-goal-scene-v83.js v83GoalPosition, age = goal-scene time, capped at 2.45 s).
    static double V119(double age){double p=age/.06;return age>0?.6*p*Math.Exp(1-p):0;}
    static double V83(double age){double t=Math.Min(age,SceneCap);return t<.6?t/.6:t<1.05?1-.55*(t-.6)/.45:t<1.65?.45*(1-(t-1.05)/.6):0;}
    static WorldNet Fact(int sign,double z,double h,double age,double bulge)=>new WorldNet{sign=sign,z=z,height=h,age=age,bulge=bulge};
    static bool Same(Vector3 a,Vector3 b)=>a.x==b.x&&a.y==b.y&&a.z==b.z;
    static bool Finite(Vector3 v)=>!(float.IsNaN(v.x)||float.IsNaN(v.y)||float.IsNaN(v.z)||float.IsInfinity(v.x)||float.IsInfinity(v.y)||float.IsInfinity(v.z));
    // Signed displacement along the panel's outward normal.
    static double Offset(Vector3 rest,Vector3 shown,string tag,int sign)=>tag=="back"?sign*((double)shown.x-rest.x):tag=="roof"?(double)shown.y-rest.y:tag=="left"?(double)rest.z-shown.z:tag=="right"?(double)shown.z-rest.z:0;

    // The source this suite replicates: BuildWorld's net placement, the native rear-net producer, the goal-scene clock and
    // the picture's goal-scene time as RenderWorld hands it to RenderWorldNet.
    static void Pins(string repo,Checker check){
        string N(double v)=>v.ToString("0.##",C);
        var pins=new[]{
            ("prototypes/match-engine-unity/ProbeBridge.cs","GoalNet(sign*length/2,sign*(length/2+2.2f),(float)g.goalWidth,(float)g.goalHeight,netMaterial)"),
            ("dist/world-pitch3d-v98.js","const rear=(2.2-radius)/Math.max(.001,Math.abs(source.vy)*sy)"),
            ("dist/world-pitch3d-v98.js","edge=source.vx?((.5+Math.sign(source.vx)*(goalWidth/2-radius)/sx)-source.x)/source.vx:Infinity"),
            ("dist/world-pitch3d-v98.js","const C=source.elevation-(goalHeight-radius),B=source.vh,disc=B*B+19.6*C,root=disc>=0?(B-Math.sqrt(disc))/9.8:Infinity;"),
            ("dist/world-pitch3d-v98.js","const roof=C>=0?0:B>0&&root>=0?root:Infinity,impact=Math.max(.001,Math.min(rear,edge>=0?edge:Infinity,roof));"),
            ("dist/world-pitch3d-v98.js","hit:roof<=Math.min(rear,edge)?'roof':edge>=0&&edge<rear?'side':'rear'"),
            ("dist/world-pitch3d-v98.js","pulse=age/.06,bulge=travel.hit==='rear'&&time>=impact?.6*pulse*Math.exp(1-pulse):0"),
            ("dist/world-pitch3d-v98.js","ball.x=clamp(ball.x,.5-(goalWidth/2-radius)/sx,.5+(goalWidth/2-radius)/sx)"),
            ("dist/world-pitch3d-v98.js","const depth=clamp((ball.y-line)*direction*sy,0,2.2-radius)"),
            ("dist/world-pitch3d-v98.js","ball.elevation=clamp(ball.elevation,.29,goalHeight-radius)"),
            ("dist/world-pitch3d-v98.js","height:contact.elevation-(.29-radius)*clamp(1-(contact.elevation-.29),0,1)"),
            ("dist/world-pitch3d-v98.js","const time=current.postBanner?.kind==='goal'?v83GoalSceneDuration:clamp(v83GoalSceneDuration-current.goalPause,0,v83GoalSceneDuration),contact=v101GoalBall(travel,impact),age=Math.max(0,time-impact);"),
            ("dist/world-pitch3d-v98.js","const turned=Boolean(current.halftimeBreakDone),scene=current.goalPause>0&&current.goalScene;"),
            ("dist/world-pitch3d-v98.js","celebration:scene?{id:current.goals.length,team:scene.team,time:Math.max(0,v83GoalSceneDuration-current.goalPause)}:null"),
            ("dist/world-pitch-actions-v99.js","fall=Math.max(0,time-travel.impact),damp=(1-Math.exp(-7*fall))/7"),
            ("dist/world-pitch-actions-v99.js","x:travel.x+travel.vx*t+travel.vx*(travel.hit==='side'?-.18:.12)*damp"),
            ("dist/world-pitch-actions-v99.js","y:travel.y+travel.vy*t+travel.vy*(travel.hit==='rear'?-.18:.12)*damp"),
            ("dist/world-pitch-actions-v99.js","elevation:Math.max(.29,travel.elevation+travel.vh*t-4.9*t*t+(travel.hit==='roof'?-Math.abs(vh)*.18:vh)*fall-4.9*fall*fall)"),
            ("dist/world-unity-v151.js","if(current.goalScene&&current.goalPause>0){const view=typeof v119VisibleGoalView==='function'?v119VisibleGoalView(current):null"),
            ("dist/world-unity-v151.js","if(!view||view.hit==='rear')frame.net={sign:Math.sign(spot.x),z:spot.z,height:view?.height??.8,age:view?.age??current.goalScene.elapsed,bulge:view?.bulge??p.bulge,...(view?{flowing:true}:{})};"),
            ("prototypes/match-engine-unity/WorldViewContract.cs","public bool flowing;"),
            ("prototypes/match-engine-unity/WorldViewPlayback.cs","flowing=a.net.flowing&&b.net.flowing"),
            ("dist/world-unity-v151.js","celebrationTime:Math.max(0,frame.celebration.time)"),
            ("dist/world-unity-v151.js","now-lastSent>=50"),
            ("dist/world-goal-scene-v83.js","const v83GoalSceneDuration="+N(SceneDuration)+";"),
            ("dist/world-goal-scene-v83.js","if(time<.6){const p=time/.6;depth=17*p;height=6*p;bulge=p;drift=0}"),
            ("dist/world-goal-scene-v83.js","else if(time<1.05){const p=(time-.6)/.45;depth=17-7*p;height=6+2*Math.sin(Math.PI*p);bulge=1-.55*p;drift=-.003*p}"),
            ("dist/world-goal-scene-v83.js","else if(time<1.65){const p=(time-1.05)/.6;depth=10+4*p;height=6*(1-p)*(1-p);bulge=.45*(1-p);drift=-.003+.006*p}"),
            ("dist/world-goal-scene-v83.js","scene.elapsed=Math.min("+N(SceneCap)+",scene.elapsed+Math.max(0,realDelta));"),
            ("dist/world-goal-scene-v83.js","if(current?.goalScene&&current.goalPause>0)v83AdvanceGoalScene(current.goalScene,realDelta);"),
            ("dist/game.js","if(m.goalPause>0){m.goalPause-=realDelta;"),
            ("dist/set-pieces-v50.js","if(m?.goalPause>0&&m.goalPause<=realDelta){"),
            ("prototypes/match-engine-unity/WorldViewBridge.cs","var f=playback.Sample(Time.realtimeSinceStartupAsDouble);displayed=f;"),
            ("prototypes/match-engine-unity/WorldViewBridge.cs","RenderWorldNet(f.netActive?f.net:null);"),
            ("prototypes/match-engine-unity/WorldViewPlayback.cs","celebrationTime=a.celebrating&&b.celebrating&&a.celebrationTeam==b.celebrationTeam?Lerp(a.celebrationTime,b.celebrationTime,q):b.celebrationTime"),
        };
        var missing=new List<string>();var texts=new Dictionary<string,string>();
        foreach(var (file,text) in pins){
            if(!texts.TryGetValue(file,out var source)){var path=Path.Combine(repo,file);source=File.Exists(path)?File.ReadAllText(path):"";texts[file]=source;}
            if(source.IndexOf(text,StringComparison.Ordinal)<0)missing.Add(file+": "+text);
        }
        check(Producer,"The replicated net placement, native rear-net producer, goal-scene clock and picture scene time are the current source (replica not stale)",missing.Count==0,missing.Count,0,missing.Count==0?pins.Length+" source pins present":string.Join(" | ",missing));
        check(Producer,"The display scene hold starts at the pinned native scene-time cap and has eased out well before the goal pause ends",WorldNetDeformation.HoldStart==SceneCap&&WorldNetDeformation.HoldEnd>SceneCap&&WorldNetDeformation.HoldEnd<=SceneDuration-.5,WorldNetDeformation.HoldEnd,SceneDuration-.5,"hold "+F(WorldNetDeformation.HoldStart)+"-"+F(WorldNetDeformation.HoldEnd)+" s; native cap "+F(SceneCap)+" s, goal pause "+F(SceneDuration)+" s");
        check(Producer,"New flowing facts preserve the full pause clock and fade only during its final 200 ms",WorldNetDeformation.FlowingHoldStart==3.85&&WorldNetDeformation.FlowingHoldEnd==SceneDuration,WorldNetDeformation.FlowingHoldEnd,SceneDuration);
    }

    // Golden offsets of the look, evaluated independently of this code: the documented model in 40-digit arithmetic (series
    // exp/sin), its radial profile sampled every Step and joined by the documented uniform Catmull-Rom with the mirrored
    // sample at the impact, at radial nodes and between them; rest coordinates are exact floats on the live goal. A changed
    // constant, kernel, window, ramp, panel rule, spline or hold changes them; a deliberate change must update this table
    // and GoldenParameters.
    static void GoldenOffsets(Geometry g,Checker check){
        WorldNet At(double age,double bulge)=>Fact(1,1.25,1.125,age,bulge);
        float top=(float)g.goalHeight,side=(float)(g.goalWidth/2);var impact=new Vector3(36.2f,1.125f,1.25f);
        var rows=new (string name,string tag,Vector3 rest,WorldNet net,double sceneTime,double expected)[]{
            ("pocket peak at the impact, age .06","back",impact,At(.06,.6),double.NaN,0.42376328486762614),
            ("pocket 1 m beside the impact, age .06","back",new Vector3(36.2f,1.125f,2.25f),At(.06,.6),double.NaN,0.18294591986822264),
            ("pocket 1 m below the impact on the ground ramp, age .06","back",new Vector3(36.2f,.125f,1.25f),At(.06,.6),double.NaN,0.044471098463281699),
            ("ripple and sway at the impact, age .37","back",impact,At(.37,0.02110313129262739),double.NaN,-0.036822299541563760),
            ("ripple front 2 m from the impact, age .37","back",new Vector3(36.2f,1.125f,-.75f),At(.37,0.02110313129262739),double.NaN,-0.0088724199312209425),
            ("late motion at the impact, age .9","back",impact,At(.9,7.483758471932097e-06),double.NaN,0.0046249027621097803),
            ("in the fade at the impact, age 1.4","back",impact,At(1.4,2.798237719741998e-09),double.NaN,0.0010155360105630549),
            ("post ramp 3 m from the impact (sway only), age .06","back",new Vector3(36.2f,1.125f,4.25f),At(.06,.6),double.NaN,0.0041328000441498596),
            ("roof above the impact, age .06","roof",new Vector3(35.5f,top,1.25f),At(.06,.6),double.NaN,0.010259474709292395),
            ("right side net at the impact height, age .06","right",new Vector3(35.5f,1.125f,side),At(.06,.6),double.NaN,0.014556959053343350),
            ("left side net at the impact height, age .06","left",new Vector3(35.5f,1.125f,-side),At(.06,.6),double.NaN,0.0050734879789631858),
            ("fallback fact at the impact, age .3 bulge .5","back",new Vector3(36.2f,.75f,0),Fact(1,0,.75,.3,.5),double.NaN,0.26017640305248646),
            ("spline between nodes 1/64 m beside the impact (mirrored sample), age .06","back",new Vector3(36.2f,1.125f,1.265625f),At(.06,.6),double.NaN,0.41942336726155032),
            ("spline between nodes 0.5 m beside the impact, age .37","back",new Vector3(36.2f,1.125f,1.75f),At(.37,0.02110313129262739),double.NaN,-0.011804658510998029),
            ("spline between nodes 0.625 m diagonal, age .2","back",new Vector3(36.2f,1.625f,1.625f),At(.2,0.1939439357288101),double.NaN,0.14479729148914861),
            ("ripple onset 1 m from the impact (travel speed, onset, spread), age .3","back",new Vector3(36.2f,1.125f,2.25f),At(.3,0.054946916666202536),double.NaN,0.045589747750480163),
            ("ripple front 2 m from the impact, age .6","back",new Vector3(36.2f,1.125f,-.75f),At(.6,0.0007404588245200774),double.NaN,-0.00057258640560811313),
            ("scene hold at its start, scene time 2.45","back",impact,At(.06,.6),2.45,0.42376328486762614),
            ("scene hold half eased, scene time 2.85","back",impact,At(.06,.6),2.85,0.21188164243381298),
            ("scene hold eased out, scene time 3.25","back",impact,At(.06,.6),3.25,0),
        };
        double worst=0;string at="none";
        foreach(var r in rows){double d=Math.Abs(WorldNetDeformation.Offset(r.rest,r.tag,r.net,g,r.sceneTime)-r.expected);if(d>worst){worst=d;at=r.name;}}
        check(Golden,"Golden offsets of the look ("+rows.Length+" points: pocket, ripple, sway, fade, post ramp, roof, sides, fallback, spline between nodes, scene hold) match the independent evaluation within 1 nm",worst<=1e-9,worst,1e-9,"largest difference "+worst.ToString("0.###E+0",C)+" m at "+at+" (live goal "+F(g.goalWidth)+" x "+F(g.goalHeight)+")");
        check(Golden,"The display constants are the ones the golden offsets were evaluated with",Parameters()==GoldenParameters,Parameters()==GoldenParameters?0:1,0,Parameters());
    }

    // Builds the actual goal nets with ProbeBridge.GoalNet (as BuildWorld does) on a bridge whose world view holds g.
    sealed class Rig:IDisposable {
        const BindingFlags Flags=BindingFlags.NonPublic|BindingFlags.Instance;
        public readonly List<Net> nets=new List<Net>();public readonly Action<WorldNet> render;readonly ProbeBridge bridge;readonly GameObject host,root;readonly Material material;readonly IList meshes;
        public Rig(Geometry g){
            host=new GameObject("D6 net test bridge");bridge=host.AddComponent<ProbeBridge>();root=new GameObject("D6 net test world");
            var shader=Shader.Find("Universal Render Pipeline/Lit");if(shader==null)shader=Shader.Find("Hidden/InternalErrorShader");material=new Material(shader);
            try{
                Set("world",root.transform);Set("worldView",new WorldViewState(Config(g)));meshes=(IList)Get<object>("netMeshes");Build(g);
                render=(Action<WorldNet>)Delegate.CreateDelegate(typeof(Action<WorldNet>),bridge,typeof(ProbeBridge).GetMethod("RenderWorldNet",Flags));
            }catch{Dispose();throw;}
        }
        void Build(Geometry g){
            var build=typeof(ProbeBridge).GetMethod("GoalNet",Flags);float length=(float)g.length;
            foreach(int sign in new[]{-1,1})build.Invoke(bridge,new object[]{sign*length/2,sign*(length/2+2.2f),(float)g.goalWidth,(float)g.goalHeight,material});
            nets.Clear();foreach(var view in (IList)Get<object>("netViews")){var type=view.GetType();T F<T>(string n)=>(T)type.GetField(n).GetValue(view);nets.Add(new Net{mesh=F<Mesh>("mesh"),rest=F<Vector3[]>("rest"),vertices=F<Vector3[]>("vertices"),tags=F<string[]>("tags"),sign=F<int>("goalSign")});}
        }
        // As BuildWorld after Clear() does for the nets: the old net meshes are destroyed and both lists emptied, a new
        // world view (load) holds g, liveNetMoved is reset and GoalNet builds new meshes. ProbeBridge itself is unchanged.
        public void Rebuild(Geometry g){
            foreach(var m in meshes)if(m is Mesh mesh&&mesh!=null)UnityEngine.Object.DestroyImmediate(mesh);
            ((IList)Get<object>("netViews")).Clear();meshes.Clear();Set("liveNetMoved",false);Set("worldView",new WorldViewState(Config(g)));Build(g);
        }
        public void Set(string name,object value)=>typeof(ProbeBridge).GetField(name,Flags).SetValue(bridge,value);
        public T Get<T>(string name)=>(T)typeof(ProbeBridge).GetField(name,Flags).GetValue(bridge);
        public void Dispose(){if(meshes!=null)foreach(var m in meshes)if(m is Mesh mesh&&mesh!=null)UnityEngine.Object.DestroyImmediate(mesh);if(root!=null)UnityEngine.Object.DestroyImmediate(root);if(material!=null)UnityEngine.Object.DestroyImmediate(material);if(host!=null)UnityEngine.Object.DestroyImmediate(host);}
        static WorldConfig Config(Geometry g){
            var kit=new WorldKit{main="#22579a",trim="#f2f3ed",accent="#f2f3ed",style="plain"};
            WorldPose Pose(string id,double x)=>new WorldPose{id=id,number=1,position=new[]{x,0,0},facing=new double[]{1,0,0},action="idle",actionId="idle",duration=1};
            var frame=new WorldFrame{schema=WorldViewState.Schema,session="net-tests",sequence=1,phase="live",ball=new[]{0,.29,0},ballOpacity=1,score=new[]{0,0},camera=new WorldCamera{position=new double[]{0,21,31},target=new double[]{0,0,0},fov=42},players=new[]{Pose("net-a",-30),Pose("net-b",30)}};
            return new WorldConfig{schema=WorldViewState.Schema,session="net-tests",fixtureId="net-tests",geometry=g,teams=new[]{new WorldTeam{id="NET-A",name="A",home=true},new WorldTeam{id="NET-B",name="B",home=false}},players=new[]{new WorldPlayer{id="net-a",name="A",team=0,number=1,keeper=true,kit=kit},new WorldPlayer{id="net-b",name="B",team=1,number=1,keeper=true,kit=kit}},initial=frame};
        }
    }
    static void Rigged(Geometry g,string label,Checker check,Action<Rig> run){
        Rig rig=null;
        try{rig=new Rig(g);}catch(Exception e){check(Controlled,"The actual ProbeBridge.GoalNet meshes build ("+label+")",false,0,0,e.GetType().Name+": "+e.Message);rig?.Dispose();return;}
        try{
            bool tags=rig.nets.Count==2&&rig.nets.TrueForAll(n=>n.rest.Length==n.tags.Length&&n.rest.Length>0&&Array.TrueForAll(n.tags,t=>t=="back"||t=="roof"||t=="left"||t=="right"));
            double depth=0;int backs=0;foreach(var n in rig.nets)for(int k=0;k<n.rest.Length;k++)if(n.tags[k]=="back"){depth+=n.sign*(double)n.rest[k].x-g.length/2;backs++;}depth/=Math.Max(1,backs);
            check(Controlled,"Actual GoalNet meshes ("+label+"): two goals, back/roof/left/right tags, back panel "+WorldNetDeformation.Depth.ToString(C)+" m behind the goal line",tags&&Math.Abs(depth-WorldNetDeformation.Depth)<1e-4,depth,WorldNetDeformation.Depth,rig.nets.Count+" meshes, "+(rig.nets.Count>0?rig.nets[0].rest.Length:0)+" vertices each");
            run(rig);
        }catch(Exception e){check(Controlled,"Net checks completed ("+label+")",false,0,0,e.GetType().Name+": "+e.Message+" "+e.StackTrace);}
        finally{rig.Dispose();}
    }

    // Within the strand half-width (.0125 m) of a frame line: posts, crossbar, ground, rear supports, rear crossbar, roof supports.
    static bool OnFrame(Vector3 p,string tag,int sign,Geometry g){
        double d=sign*(double)p.x-g.length/2,half=g.goalWidth/2,e=.0126;
        switch(tag){
            case "back":return Math.Min(Math.Min(p.z+half,half-p.z),Math.Min(p.y,g.goalHeight-p.y))<=e;
            case "roof":return Math.Min(Math.Min(d,WorldNetDeformation.Depth-d),Math.Min(p.z+half,half-p.z))<=e;
            default:return Math.Min(Math.Min(d,WorldNetDeformation.Depth-d),Math.Min(p.y,g.goalHeight-p.y))<=e;
        }
    }
    // Controlled facts: impacts at the frame, near it and inside; rear-hit, maximum and fallback bulges; ages through the fade.
    static List<WorldNet> Facts(int sign,Geometry g){
        double W=g.goalWidth,H=g.goalHeight;var list=new List<WorldNet>();
        foreach(double z in new[]{-W/2,-W/2+R,-2.6,0,1.2,W/2-R,W/2})foreach(double h in new[]{0,R,1.1,H-R,H}){
            foreach(double age in new[]{.02,.06,.15,.37,.6,.9,1.3,1.55})list.Add(Fact(sign,z,h,age,V119(age)));
            foreach(double age in new[]{.06,.37})list.Add(Fact(sign,z,h,age,1.5));
            foreach(double age in new[]{.3,.6,1.1})list.Add(Fact(sign,z,h,age,V83(age)));
        }
        return list;
    }
    static void Edges(Rig rig,Geometry g,string label,Checker check){
        int fixedCount=0,moved=0,front=0,axis=0,inward=0,bounds=0,nonFinite=0,other=0,facts=0;double worst=0,recoil=0;
        foreach(var net in rig.nets){
            var field=new WorldNetDeformation.Field(net.rest,net.tags,net.sign,g);var output=(Vector3[])net.rest.Clone();
            var frame=new bool[net.rest.Length];for(int k=0;k<frame.Length;k++)if(frame[k]=OnFrame(net.rest[k],net.tags[k],net.sign,g))fixedCount++;
            var foreign=new WorldNetDeformation.Field(net.rest,net.tags,net.sign,g);var untouched=(Vector3[])net.rest.Clone();
            foreach(var fact in Facts(net.sign,g)){
                facts++;field.Update(fact,output,out _);
                if(foreign.Update(Fact(-net.sign,fact.z,fact.height,fact.age,fact.bulge),untouched,out _))other++;
                double b=Math.Clamp(fact.bulge,0,1.5),backLimit=WorldNetDeformation.PocketAmplitude*b+WorldNetDeformation.RippleAmplitude+WorldNetDeformation.SwayAmplitude+2e-3,sideLimit=WorldNetDeformation.SympathyAmplitude*b+1e-6;
                for(int k=0;k<output.Length;k++){
                    Vector3 r=net.rest[k],o=output[k];string tag=net.tags[k];
                    if(!Finite(o)){nonFinite++;continue;}
                    if(frame[k]&&!Same(r,o))moved++;
                    // Toward the field past the goal plane (strands at the goal line: past their own rest).
                    if(net.sign*(double)o.x<Math.Min(net.sign*(double)r.x,g.length/2)-1e-6)front++;
                    double off=Offset(r,o,tag,net.sign);
                    if(tag=="back"){if(o.y!=r.y||o.z!=r.z)axis++;if(Math.Abs(off)>backLimit)bounds++;worst=Math.Max(worst,Math.Abs(off));recoil=Math.Max(recoil,-off);}
                    else{if(o.x!=r.x||(tag=="roof"?o.z!=r.z:o.y!=r.y))axis++;if(off<0)inward++;if(off>sideLimit)bounds++;}
                }
            }
        }
        string Of(string what)=>what+" ("+label+", "+facts+" facts on both goals)";
        check(Controlled,Of("Every vertex within the strand half-width of a post, crossbar, ground line, rear support, rear crossbar or roof support stays exactly at rest"),moved==0&&fixedCount>0,moved,0,fixedCount+" frame vertices per fact checked bitwise");
        check(Controlled,Of("No vertex moves toward the field past the goal plane (strands at the goal line: past their rest); only the back net recoils, "+F(WorldNetDeformation.Depth)+" m behind it"),front==0,front,0,"largest back-net recoil toward the field "+recoil.ToString("0.000",C)+" m");
        check(Controlled,Of("Back net moves only along its normal; roof and side nets only outward along theirs (never inward, never along x)"),axis==0&&inward==0,axis+inward,0,"off-axis "+axis+", inward roof/side "+inward);
        check(Controlled,Of("Displacements stay within pocket*bulge+ripple+sway (back) and the bulge-scaled roof/side limit; all finite"),bounds==0&&nonFinite==0,bounds+nonFinite,0,"largest back displacement "+worst.ToString("0.000",C)+" m");
        check(Controlled,Of("A fact of the other goal leaves this goal's net untouched"),other==0,other,0);
    }
    // Recoil of the back net toward the field (inward past rest) over impact positions x ages, on the actual mesh: bulge 0
    // (the age-driven ripple and sway alone, which bound every fact because the pocket only adds outward motion), the
    // rear-hit and the fallback bulge profile. The bound is the visual one; the goal plane stays Depth away regardless.
    static void Recoil(Rig rig,Geometry g,string label,Checker check,Meter measure){
        var net=Goal(rig,1);var field=new WorldNetDeformation.Field(net.rest,net.tags,1,g);var output=(Vector3[])net.rest.Clone();
        double W=g.goalWidth,H=g.goalHeight;var zs=new[]{-W/2,-W/2+R,-3.0,-1.5,0,1.5,3.0,W/2-R,W/2};var hs=new[]{0,R,.6,1.1,1.5,2.1,H-R,H};
        var back=new List<int>();for(int k=0;k<net.rest.Length;k++)if(net.tags[k]=="back")back.Add(k);
        double bound=0;string boundAt="";
        foreach(var (name,profile,steps) in new (string,Func<double,double>,int)[]{("bulge 0 (age-driven motion only)",a=>0,48),("rear-hit bulge",V119,48),("fallback bulge",V83,16)}){
            double worst=0;string at="";
            foreach(double z in zs)foreach(double h in hs)for(int s=0;s<=steps;s++){
                double age=WorldNetDeformation.FadeEnd*s/steps;field.Update(Fact(1,z,h,age,profile(age)),output,out _);
                foreach(int k in back){double inward=(double)net.rest[k].x-output[k].x;if(inward>worst){worst=inward;at="impact z "+F(z)+" m height "+F(h)+" m, age "+F(age)+" s";}}
            }
            measure(Controlled,"Largest back-net recoil toward the field, "+name+" ("+label+")",worst,"m",at+"; "+zs.Length*hs.Length+" impact positions x "+(steps+1)+" ages (0-"+F(WorldNetDeformation.FadeEnd)+" s)");
            if(worst>bound){bound=worst;boundAt=name+", "+at;}
        }
        check(Controlled,"Back-net recoil toward the field stays within 6 cm for every impact position and age ("+label+"; bulge 0 bounds every fact)",bound<=.06,bound,.06,"largest "+bound.ToString("0.0000",C)+" m ("+boundAt+"); the back net stays at least "+(WorldNetDeformation.Depth-bound).ToString("0.00",C)+" m behind the goal plane");
    }
    // The vertex of a panel nearest to (depth behind the goal line, height, z).
    static int Nearest(Net net,string tag,Geometry g,double depth,double y,double z){
        int best=-1;double d=double.MaxValue;
        for(int k=0;k<net.rest.Length;k++){if(net.tags[k]!=tag)continue;var p=net.rest[k];double dx=net.sign*(double)p.x-g.length/2-depth,e=dx*dx+(p.y-y)*(p.y-y)+(p.z-z)*(p.z-z);if(e<d){d=e;best=k;}}
        return best;
    }
    static Net Goal(Rig rig,int sign)=>rig.nets.Find(n=>n.sign==sign);

    // Look and settling of a central rear hit: a pocket, a gentle recoil, no second inflation, exact rest after the fade.
    static void Shape(Rig rig,Geometry g,Checker check){
        var net=Goal(rig,1);var field=new WorldNetDeformation.Field(net.rest,net.tags,net.sign,g);var output=(Vector3[])net.rest.Clone();
        double peak=0,recoil=0,late=0,end=0,fadeStart=0;int restUploads=0;
        for(int s=0;s<=600;s++){
            double age=s/240.0;var fact=Fact(1,1.2,1.1,age,V119(age));bool changed=field.Update(fact,output,out _);
            if(age>=WorldNetDeformation.FadeEnd&&changed&&field.Deformed)restUploads++;
            for(int k=0;k<output.Length;k++){if(net.tags[k]!="back")continue;double off=Offset(net.rest[k],output[k],"back",1);
                peak=Math.Max(peak,off);recoil=Math.Max(recoil,-off);if(age>=.35)late=Math.Max(late,off);if(age>=WorldNetDeformation.FadeEnd)end=Math.Max(end,Math.Abs(off));
                if(Math.Abs(age-WorldNetDeformation.FadeStart)<1e-9)fadeStart=Math.Max(fadeStart,Math.Abs(off));}
        }
        check(Controlled,"Rear-hit pocket (central impact, native bulge peak .6) shows a clear but bounded bulge",peak>.25&&peak<=.55,peak,.55,"largest outward displacement "+peak.ToString("0.000",C)+" m (release 130: ~.40 m broad dome)");
        check(Controlled,"Recoil past rest of the central rear hit stays gentle (no trampoline; all impact positions: Recoil)",recoil<=.06,recoil,.06,"largest inward displacement "+recoil.ToString("0.000",C)+" m over the back net (release 130: 6.9 cm inward at 0.9 s)");
        check(Controlled,"No second inflation after the pocket has released (age >= .35 s)",late<=.035,late,.035,"release 130 re-inflated to 11.6 cm at 0.7 s");
        check(Controlled,"After the fade the net is exactly at rest and is not re-uploaded",end==0&&restUploads==0,end,0,"at the fade start the largest displacement is "+(fadeStart*1000).ToString("0.0",C)+" mm");
        check(Controlled,"The fade starts below 1 cm",fadeStart<.01,fadeStart,.01);
    }

    // Age is the only time input of the fact: C1 continuity (no pop at .6 s or elsewhere), bounded speed, smooth onset.
    static void Smoothness(Rig rig,Geometry g,Checker check){
        var net=Goal(rig,1);double z0=1.2,h0=1.1,back=WorldNetDeformation.Depth;
        var points=new List<(string name,int index)>{("impact",Nearest(net,"back",g,back,h0,z0)),("0.8 m",Nearest(net,"back",g,back,h0+.5,z0-.62)),("1.6 m",Nearest(net,"back",g,back,h0,z0-1.6)),("3 m",Nearest(net,"back",g,back,h0+.6,z0-2.95)),("panel centre",Nearest(net,"back",g,back,g.goalHeight/2,0)),("roof",Nearest(net,"roof",g,1.5,g.goalHeight,z0)),("right side",Nearest(net,"right",g,1.5,h0,g.goalWidth/2))};
        if(points.Exists(p=>p.index<0)){check(Controlled,"Smoothness sample vertices exist",false,0,0);return;}
        // The exact displacement (double, before the float vertex rounding that would add quantisation noise).
        double Shown(int index,double age,Func<double,double> bulge)=>WorldNetDeformation.Offset(net.rest[index],net.tags[index],Fact(1,z0,h0,age,bulge(age)),g);
        foreach(var (label,profile,from,to) in new (string,Func<double,double>,double,double)[]{("age only (bulge 0)",a=>0,0,3),("rear-hit bulge",V119,0,3),("rear-hit bulge around .6 s",V119,.4,.8)}){
            double speed=0,ratio=0;string at="";
            foreach(var (name,index) in points){
                double Curvature(double h){double worst=0;int n=(int)Math.Round((to-from)/h);for(int s=1;s<n;s++){double a=from+s*h;worst=Math.Max(worst,Math.Abs(Shown(index,a+h,profile)-2*Shown(index,a,profile)+Shown(index,a-h,profile))/(h*h));}return worst;}
                // 1 mm/s^2 of curvature is far below anything visible; it keeps the ratio meaningful near zero motion.
                double coarse=Curvature(1/240.0),fine=Curvature(1/960.0),q=(fine+1e-3)/(coarse+1e-3);
                if(q>ratio){ratio=q;at=name;}
                int m=(int)Math.Round((to-from)*240);for(int s=0;s<m;s++){double a=from+s/240.0;speed=Math.Max(speed,Math.Abs(Shown(index,a+1/240.0,profile)-Shown(index,a,profile))*240);}
            }
            check(Controlled,"C1 in age, "+label+": curvature at 1/960 s steps stays that of 1/240 s steps (a kink or pop grows with finer steps)",ratio<=1.25,ratio,1.25,"worst at "+at+" (release 130 tail at .6 s: ratio 4.2)");
            if(label=="age only (bulge 0)")check(Controlled,"Age-driven motion (ripple, sway) stays below 3 m/s",speed<=3,speed,3);
        }
        double jump=0;foreach(var (name,index) in points)jump=Math.Max(jump,Math.Abs(Shown(index,.6+1e-5,V119)-Shown(index,.6-1e-5,V119)));
        check(Controlled,"No jump across .6 s (release 130 started its tail there)",jump<=1e-4,jump,1e-4);
        double onset=0;foreach(var (name,index) in points)onset=Math.Max(onset,Math.Abs(Shown(index,1e-4,a=>0)));
        check(Controlled,"The age-driven motion starts from rest at the impact (age 0)",onset<=1e-6,onset,1e-6);
    }

    // The native scene hold eased by the picture's goal-scene time: exact shares, the whole deformation scaled, C1 in the
    // scene time, frame vertices at rest, exact rest without uploads from HoldEnd, and nothing left for the fact's end.
    static void Hold(Rig rig,Geometry g,Checker check){
        var net=Goal(rig,1);
        bool shares=WorldNetDeformation.Hold(double.NaN)==1&&WorldNetDeformation.Hold(0)==1&&WorldNetDeformation.Hold(SceneCap)==1&&Math.Abs(WorldNetDeformation.Hold((WorldNetDeformation.HoldStart+WorldNetDeformation.HoldEnd)/2)-.5)<1e-12&&WorldNetDeformation.Hold(WorldNetDeformation.HoldEnd)==0&&WorldNetDeformation.Hold(SceneDuration)==0;
        check(Controlled,"Scene-hold share: 1 without a scene time and up to the native cap, 1/2 midway, exactly 0 from HoldEnd",shares,shares?0:1,0,"HoldStart "+F(WorldNetDeformation.HoldStart)+" s, HoldEnd "+F(WorldNetDeformation.HoldEnd)+" s");
        // Every offset is the share times the unheld one (double, before the float vertex rounding).
        double linear=0;var facts=Facts(1,g);
        for(int f=0;f<facts.Count;f+=23)foreach(double t in new[]{2.5,2.85,3.1}){double share=WorldNetDeformation.Hold(t);
            for(int k=0;k<net.rest.Length;k+=7)linear=Math.Max(linear,Math.Abs(WorldNetDeformation.Offset(net.rest[k],net.tags[k],facts[f],g,t)-share*WorldNetDeformation.Offset(net.rest[k],net.tags[k],facts[f],g)));}
        check(Controlled,"The scene hold scales the whole shown deformation by its share (pocket, ripple, sway, roof, sides)",linear<=1e-12,linear,1e-12);
        // C1 in the scene time across HoldStart and HoldEnd for a held pocket (age .05) and a held ripple (age .45).
        int index=Nearest(net,"back",g,WorldNetDeformation.Depth,1.1,1.2);double ratio=0,jump=0;
        foreach(double age in new[]{.05,.45}){
            var fact=Fact(1,1.2,1.1,age,V119(age));double Shown(double t)=>WorldNetDeformation.Offset(net.rest[index],"back",fact,g,t);
            double Curvature(double h){double worst=0;int n=(int)Math.Round(1.2/h);for(int s=1;s<n;s++){double t=2.25+s*h;worst=Math.Max(worst,Math.Abs(Shown(t+h)-2*Shown(t)+Shown(t-h))/(h*h));}return worst;}
            ratio=Math.Max(ratio,(Curvature(1/960.0)+1e-3)/(Curvature(1/240.0)+1e-3));
            foreach(double edge in new[]{WorldNetDeformation.HoldStart,WorldNetDeformation.HoldEnd})jump=Math.Max(jump,Math.Abs(Shown(edge+1e-5)-Shown(edge-1e-5)));
        }
        check(Controlled,"C1 in the picture's goal-scene time: curvature at 1/960 s steps stays that of 1/240 s steps across the hold",ratio<=1.25,ratio,1.25);
        check(Controlled,"No jump at the start or the end of the scene hold",jump<=1e-4,jump,1e-4);
        // The field over a held goal scene: bitwise Displace, frame vertices at rest, exact rest without uploads from
        // HoldEnd; when the fact then ends nothing changes (no reset pop).
        var field=new WorldNetDeformation.Field(net.rest,net.tags,1,g);var output=(Vector3[])net.rest.Clone();var held=Fact(1,1.2,1.1,.05,V119(.05));
        int differ=0,frame=0,uploads=0,moved=0,steps=0;
        for(int s=0;s<=78;s++){double t=2.3+s/60.0;bool changed=field.Update(held,t,output,out _);
            for(int k=0;k<output.Length;k++){if(OnFrame(net.rest[k],net.tags[k],1,g)&&!Same(output[k],net.rest[k]))frame++;if(s%5==0&&!Same(output[k],WorldNetDeformation.Displace(net.rest[k],net.tags[k],held,g,t)))differ++;}
            if(t>=WorldNetDeformation.HoldEnd){steps++;if(changed&&field.Deformed)uploads++;for(int k=0;k<output.Length;k++)if(!Same(output[k],net.rest[k]))moved++;}}
        bool end=!field.Deformed&&!field.Update(null,output,out _);
        check(Controlled,"A held pocket eases to exact rest by HoldEnd (bitwise Displace, frame at rest, no upload once at rest) and the fact's end then changes nothing",differ==0&&frame==0&&uploads==0&&moved==0&&steps>0&&end,differ+frame+uploads+moved+(end?0:1),0,"differ "+differ+", frame "+frame+", uploads after HoldEnd "+uploads+", moved after HoldEnd "+moved+", end changes "+(!end));
    }

    static void Symmetry(Rig rig,Geometry g,Checker check){
        var net=Goal(rig,1);double mirror=0,goals=0;
        foreach(double age in new[]{.06,.37,.8}){
            var fact=Fact(1,1.7,1.3,age,V119(age));var flipped=Fact(1,-1.7,1.3,age,V119(age));var other=Fact(-1,1.7,1.3,age,V119(age));
            for(int k=0;k<net.rest.Length;k++){
                var p=net.rest[k];string tag=net.tags[k],twin=tag=="left"?"right":tag=="right"?"left":tag;
                var a=WorldNetDeformation.Displace(p,tag,fact,g)-p;
                var q=new Vector3(p.x,p.y,-p.z);var b=WorldNetDeformation.Displace(q,twin,flipped,g)-q;mirror=Math.Max(mirror,(new Vector3(a.x,a.y,-a.z)-b).magnitude);
                var o=new Vector3(-p.x,p.y,p.z);var c=WorldNetDeformation.Displace(o,tag,other,g)-o;goals=Math.Max(goals,(new Vector3(-a.x,a.y,a.z)-c).magnitude);
            }
        }
        check(Controlled,"Mirroring the impact across the goal centre mirrors the net (left/right swap)",mirror<=2e-6,mirror,2e-6);
        check(Controlled,"Both goals deform identically (mirrored along the pitch)",goals<=1e-6,goals,1e-6);
    }

    // Same picture, same vertices: Field equals Displace bitwise (with and without a scene time), repeated calls agree,
    // and no frame-rate path leaves a trace.
    static void Determinism(Rig rig,Geometry g,Checker check){
        var net=Goal(rig,1);int differ=0,repeat=0,facts=0;var times=new[]{double.NaN,1.0,2.6,2.85,3.1};
        var field=new WorldNetDeformation.Field(net.rest,net.tags,net.sign,g);var output=(Vector3[])net.rest.Clone();
        var list=Facts(1,g);
        // Impacts exactly on actual back vertices: the vertex and its strand neighbours lie within one Step of the impact,
        // where the mirrored sample shapes the spline, so the sampled-table and the direct path must agree there too.
        int near=0;foreach(var (y,z) in new[]{(1.1,1.2),(g.goalHeight/2,0.0),(.6,-3.0)}){var v=net.rest[Nearest(net,"back",g,WorldNetDeformation.Depth,y,z)];
            foreach(double age in new[]{.06,.37})list.Add(Fact(1,v.z,v.y,age,V119(age)));
            for(int k=0;k<net.rest.Length;k++)if(net.tags[k]=="back"&&Math.Sqrt((net.rest[k].z-v.z)*(net.rest[k].z-v.z)+(net.rest[k].y-v.y)*(net.rest[k].y-v.y))<WorldNetDeformation.Step)near++;}
        for(int f=0;f<list.Count;f+=f<list.Count-6?7:1){var fact=list[f];double t=times[facts%times.Length];facts++;field.Update(fact,t,output,out _);
            for(int k=0;k<output.Length;k++){var once=WorldNetDeformation.Displace(net.rest[k],net.tags[k],fact,g,t);if(!Same(once,output[k]))differ++;if(!Same(once,WorldNetDeformation.Displace(net.rest[k],net.tags[k],fact,g,t)))repeat++;}}
        check(Controlled,"The per-goal field equals the pure Displace for every vertex (bitwise, with and without a scene time)",differ==0&&near>0,differ,0,facts+" facts, 6 of them with the impact on a back vertex ("+near+" vertices within one radial step)");
        check(Controlled,"Displace is deterministic (bitwise repeat)",repeat==0,repeat,0);
        // 30, 60 and 120 Hz paths and a direct jump (seek) to the same picture give the same vertices; so does a pause.
        foreach(double scene in new[]{double.NaN,2.7}){
            var finals=new List<Vector3[]>();double end=.43;
            foreach(double rate in new[]{30.0,60.0,120.0,0}){
                var f=new WorldNetDeformation.Field(net.rest,net.tags,net.sign,g);var o=(Vector3[])net.rest.Clone();
                if(rate>0)for(double age=0;age<end;age+=1/rate)f.Update(Fact(1,1.2,1.1,age,V119(age)),double.IsNaN(scene)?scene:scene-(end-age),o,out _);
                f.Update(Fact(1,1.2,1.1,end,V119(end)),scene,o,out _);finals.Add(o);
            }
            int paths=0;foreach(var o in finals)for(int k=0;k<o.Length;k++)if(!Same(o[k],finals[3][k]))paths++;
            var p2=new WorldNetDeformation.Field(net.rest,net.tags,net.sign,g);var shown=(Vector3[])net.rest.Clone();
            p2.Update(Fact(1,1.2,1.1,end,V119(end)),scene,shown,out _);bool again=p2.Update(Fact(1,1.2,1.1,end,V119(end)),scene,shown,out _);
            int pause=0;for(int k=0;k<shown.Length;k++)if(!Same(shown[k],finals[3][k]))pause++;
            check(Controlled,"30/60/120 Hz playback, a seek and a pause show identical vertices for the same picture (no integrated state; scene time "+(double.IsNaN(scene)?"none":F(scene)+" s")+")",paths==0&&pause==0&&!again,paths+pause,0,again?"an unchanged picture was uploaded again":"unchanged picture: no upload");
        }
    }

    // The actual RenderWorldNet: upload of the hit goal only, exact rest restore of vertices, normals and bounds, and the
    // goal-scene time taken from the picture that carries the fact (RenderWorld stores it as displayed first).
    static void Integration(Rig rig,Geometry g,Checker check,List<string> notes){
        var hit=Goal(rig,1);var other=Goal(rig,-1);rig.Set("displayed",null);
        var normals=new Dictionary<Net,Vector3[]>();var bounds=new Dictionary<Net,Bounds>();foreach(var n in rig.nets){normals[n]=n.mesh.normals;bounds[n]=n.mesh.bounds;}
        var fact=Fact(1,1.2,1.1,.06,V119(.06));rig.render(fact);
        var shown=hit.mesh.vertices;int wrong=0,outside=0;double largest=0;var b=hit.mesh.bounds;b.Expand(1e-4f);
        for(int k=0;k<shown.Length;k++){var expected=WorldNetDeformation.Displace(hit.rest[k],hit.tags[k],fact,g);if(!Same(expected,shown[k])||!Same(expected,hit.vertices[k]))wrong++;if(!b.Contains(shown[k]))outside++;largest=Math.Max(largest,(shown[k]-hit.rest[k]).magnitude);}
        int still=0;var rest=other.mesh.vertices;for(int k=0;k<rest.Length;k++)if(!Same(rest[k],other.rest[k]))still++;
        float stat=rig.Get<float>("netMaxDeformation");var newNormals=hit.mesh.normals;int turned=0;for(int k=0;k<newNormals.Length;k++)if(Vector3.Angle(newNormals[k],normals[hit][k])>1)turned++;
        check(Controlled,"RenderWorldNet uploads the hit goal exactly as Displace (vertices, normals, bounds) and leaves the other goal at rest",wrong==0&&still==0&&outside==0&&turned>0&&Math.Abs(stat-largest)<1e-5&&rig.Get<bool>("liveNetMoved"),wrong+still+outside,0,"largest "+largest.ToString("0.000",C)+" m, stat "+stat.ToString("0.000",C)+", normals turned >1 deg: "+turned+", bounds x "+b.min.x.ToString("0.00",C)+".."+b.max.x.ToString("0.00",C));
        rig.render(Fact(-1,-2,.5,.06,V119(.06)));
        int probe=Nearest(other,"back",g,WorldNetDeformation.Depth,.8,-2);
        bool switched=Restored(hit,normals[hit],bounds[hit])&&!Same(other.mesh.vertices[probe],other.rest[probe]);
        rig.render(null);
        bool reset=Restored(hit,normals[hit],bounds[hit])&&Restored(other,normals[other],bounds[other])&&rig.Get<float>("netMaxDeformation")==0&&!rig.Get<bool>("liveNetMoved");
        rig.render(null);
        check(Controlled,"A fact of the other goal restores this goal; an inactive fact restores every vertex, normal and bound exactly",switched&&reset&&Restored(hit,normals[hit],bounds[hit]),switched&&reset?0:1,0,"switch "+switched+", reset "+reset);

        // The scene hold through RenderWorldNet: the shown picture's own goal-scene time eases the fact; a picture that
        // does not carry this fact object lends none; eased out, the net is at rest and the fact's end changes nothing.
        var held=Fact(1,1.2,1.1,.05,V119(.05));int heldWrong=0,foreignWrong=0;
        rig.Set("displayed",new WorldFrame{netActive=true,net=held,celebrating=true,celebrationTeam=1,celebrationTime=2.85});rig.render(held);
        var heldShown=hit.mesh.vertices;for(int k=0;k<heldShown.Length;k++)if(!Same(heldShown[k],WorldNetDeformation.Displace(hit.rest[k],hit.tags[k],held,g,2.85)))heldWrong++;
        rig.Set("displayed",new WorldFrame{netActive=true,net=Fact(1,1.2,1.1,.05,V119(.05)),celebrating=true,celebrationTeam=1,celebrationTime=2.85});rig.render(held);
        var foreignShown=hit.mesh.vertices;for(int k=0;k<foreignShown.Length;k++)if(!Same(foreignShown[k],WorldNetDeformation.Displace(hit.rest[k],hit.tags[k],held,g)))foreignWrong++;
        rig.Set("displayed",new WorldFrame{netActive=true,net=held,celebrating=true,celebrationTeam=1,celebrationTime=WorldNetDeformation.HoldEnd+.05});rig.render(held);
        bool eased=Restored(hit,normals[hit],bounds[hit])&&rig.Get<float>("netMaxDeformation")==0;bool settled=true;foreach(var f in (IList)rig.Get<object>("netFields"))settled&=!((WorldNetDeformation.Field)f).Deformed;
        rig.Set("displayed",new WorldFrame{netActive=false});rig.render(null);bool ended=Restored(hit,normals[hit],bounds[hit])&&!rig.Get<bool>("liveNetMoved");
        rig.Set("displayed",null);
        check(Controlled,"RenderWorldNet eases a held fact by the goal-scene time of the picture that carries it, ignores another picture's time, and is exactly at rest before the fact ends",heldWrong==0&&foreignWrong==0&&eased&&settled&&ended,heldWrong+foreignWrong+(eased&&settled&&ended?0:1),0,"held "+heldWrong+", foreign "+foreignWrong+", eased "+eased+", fields at rest "+settled+", end "+ended);

        // A whole rear-hit goal scene as the bridge shows it (20 Hz pictures, 60 Hz display blend), then the reset.
        var sequence=new List<WorldNet>();for(int s=0;s<=150;s++){double age=Math.Max(0,s/60.0-.05);sequence.Add(Fact(1,1.2,1.1,age,V119(age)));}
        var ticks=new long[sequence.Count];var updates=new long[sequence.Count];
        var field=new WorldNetDeformation.Field(hit.rest,hit.tags,1,g);var output=(Vector3[])hit.rest.Clone();
        foreach(var f in sequence){rig.render(f);field.Update(f,output,out _);}rig.render(null);field.Update(null,output,out _);
        long before=GC.GetAllocatedBytesForCurrentThread();
        for(int s=0;s<sequence.Count;s++){long t0=System.Diagnostics.Stopwatch.GetTimestamp();rig.render(sequence[s]);ticks[s]=System.Diagnostics.Stopwatch.GetTimestamp()-t0;}
        rig.render(null);
        for(int s=0;s<sequence.Count;s++){long t0=System.Diagnostics.Stopwatch.GetTimestamp();field.Update(sequence[s],output,out _);updates[s]=System.Diagnostics.Stopwatch.GetTimestamp()-t0;}
        long bytes=GC.GetAllocatedBytesForCurrentThread()-before;
        double Median(long[] v,int from,int to){var a=new List<long>();for(int s=from;s<to;s++)a.Add(v[s]);a.Sort();return a[a.Count/2]*1e6/System.Diagnostics.Stopwatch.Frequency;}
        int moving=0;while(moving<sequence.Count&&sequence[moving].age<=0)moving++;
        double render=Median(ticks,moving,Math.Min(sequence.Count,moving+60)),update=Median(updates,moving,Math.Min(sequence.Count,moving+60));
        check(Controlled,"RenderWorldNet and the field allocate nothing per picture",bytes==0,bytes,0,(2*sequence.Count)+" calls");
        check(Controlled,"Editor timing of a moving goal (RenderWorldNet incl. upload, normals, bounds); not a WebGL or RTX 4070 figure",render<2000,render,2000,"median "+render.ToString("0",C)+" us per picture, deformation alone "+update.ToString("0",C)+" us ("+hit.rest.Length+" vertices)");
        notes.Add("Editor medians on this machine: RenderWorldNet "+render.ToString("0",C)+" us, WorldNetDeformation.Field.Update "+update.ToString("0",C)+" us per moving picture; the 0.3 ms target for the RTX 4070 standard run needs Root's measurement.");
    }
    static bool Restored(Net n,Vector3[] normals,Bounds bounds){
        var shown=n.mesh.vertices;for(int k=0;k<shown.Length;k++)if(!Same(shown[k],n.rest[k])||!Same(n.vertices[k],n.rest[k]))return false;
        var now=n.mesh.normals;for(int k=0;k<now.Length;k++)if((now[k]-normals[k]).sqrMagnitude>1e-12f)return false;
        return (n.mesh.bounds.min-bounds.min).sqrMagnitude<1e-10f&&(n.mesh.bounds.max-bounds.max).sqrMagnitude<1e-10f;
    }

    // BuildWorld (load) while a goal is deformed, with the same and a changed geometry: the old meshes are destroyed and
    // replaced by new GoalNet meshes; RenderWorldNet must build fresh fields on the new rest arrays, show the fact exactly
    // on the new meshes, never touch the old buffers, and restore exact rest on an inactive fact.
    static void Reload(Rig rig,Geometry g,Checker check){
        var fact=Fact(1,1.2,1.1,.06,V119(.06));rig.Set("displayed",null);
        foreach(var (next,label) in new[]{(g,"same geometry"),(Live(1.2),"changed geometry 81.6 x 52.8"),(Fixture(),"changed goal 9.7 x 2.44")}){
            rig.render(fact);var before=rig.nets.ConvertAll(n=>(rest:n.rest,vertices:(Vector3[])n.vertices.Clone(),buffer:n.vertices));
            var oldFields=new List<object>();foreach(var f in (IList)rig.Get<object>("netFields"))oldFields.Add(f);
            bool deformed=false;foreach(var n in rig.nets)for(int k=0;k<n.rest.Length&&!deformed;k++)deformed=!Same(n.vertices[k],n.rest[k]);
            rig.Rebuild(next);
            var normals=new Dictionary<Net,Vector3[]>();var bounds=new Dictionary<Net,Bounds>();foreach(var n in rig.nets){normals[n]=n.mesh.normals;bounds[n]=n.mesh.bounds;}
            // The first picture after the load can be inactive (nothing to do) or the same goal scene going on.
            rig.render(null);bool idle=true;foreach(var n in rig.nets)idle&=Restored(n,normals[n],bounds[n]);
            rig.render(fact);
            var fields=(IList)rig.Get<object>("netFields");bool fresh=fields.Count==rig.nets.Count;
            var views=(IList)rig.Get<object>("netViews");
            for(int i=0;fresh&&i<fields.Count;i++){var field=(WorldNetDeformation.Field)fields[i];var restOf=(Vector3[])views[i].GetType().GetField("rest").GetValue(views[i]);fresh=!oldFields.Contains(field)&&field.Uses(restOf,next);foreach(var o in before)fresh&=!field.Uses(o.rest,next)&&!field.Uses(o.rest,g);}
            int wrong=0;foreach(var n in rig.nets){var shown=n.mesh.vertices;for(int k=0;k<shown.Length;k++){var expected=WorldNetDeformation.Displace(n.rest[k],n.tags[k],fact,next);if(!Same(expected,shown[k])||!Same(expected,n.vertices[k]))wrong++;}}
            int touched=0;foreach(var o in before)for(int k=0;k<o.buffer.Length;k++)if(!Same(o.buffer[k],o.vertices[k]))touched++;
            rig.render(null);bool restored=true;foreach(var n in rig.nets)restored&=Restored(n,normals[n],bounds[n]);
            check(Controlled,"Reload while a goal is deformed ("+label+"): fresh fields on the new GoalNet meshes, the fact shown exactly on them, old buffers untouched, exact rest after an inactive fact",deformed&&idle&&fresh&&wrong==0&&touched==0&&restored,wrong+touched+(deformed&&idle&&fresh&&restored?0:1),0,"deformed before "+deformed+", idle after load "+idle+", fresh fields "+fresh+", wrong vertices "+wrong+", old buffer writes "+touched+", restored "+restored+" ("+(rig.nets.Count>0?rig.nets[0].rest.Length:0)+" vertices per goal)");
        }
        rig.Rebuild(g);
    }

    // A flowing fact never uses the legacy cap fade. It keeps the actual age-driven
    // shape through late impacts, then fades using only received celebrationTime.
    static void FlowingHold(Rig rig,Geometry g,Checker check){
        var net=Goal(rig,1);var fact=Fact(1,1.2,1.1,.06,V119(.06));fact.flowing=true;
        bool shares=WorldNetDeformation.Hold(double.NaN,true)==1&&WorldNetDeformation.Hold(2.8,true)==1&&WorldNetDeformation.Hold(3.85,true)==1&&Math.Abs(WorldNetDeformation.Hold(3.95,true)-.5)<1e-12&&WorldNetDeformation.Hold(4.05,true)==0;
        check(Controlled,"Flowing share: late impact preserved through 3.85 s, half at 3.95 s, exactly rest at 4.05 s",shares,shares?0:1,0);
        int index=Nearest(net,"back",g,WorldNetDeformation.Depth,1.1,1.2);var rest=net.rest[index];
        double free=WorldNetDeformation.Offset(rest,"back",fact,g),late=WorldNetDeformation.Offset(rest,"back",fact,g,2.8);
        check(Controlled,"New late rear impact at scene time 2.8 s has its full moving shape",free>.01&&late==free,Math.Abs(late-free),0,"unfaded displacement "+F(free)+" m");
        var legacy=Fact(1,fact.z,fact.height,fact.age,fact.bulge);
        double oldDifference=Math.Abs(WorldNetDeformation.Offset(rest,"back",legacy,g,2.8)-free*WorldNetDeformation.Hold(2.8));
        check(Controlled,"Absent flowing marker keeps the legacy hold at 2.8 s",oldDifference<=1e-12,oldDifference,1e-12);
        var field=new WorldNetDeformation.Field(net.rest,net.tags,1,g);var output=(Vector3[])net.rest.Clone();double wrong=0,linear=0,jump=0;
        foreach(double t in new[]{2.8,3.85,3.9,3.95,4.0,4.025,4.05,1.0,3.95,4.05}){
            field.Update(fact,t,output,out float largest);for(int k=0;k<output.Length;k++){
                if(!Same(output[k],WorldNetDeformation.Displace(net.rest[k],net.tags[k],fact,g,t)))wrong++;
                linear=Math.Max(linear,Math.Abs(WorldNetDeformation.Offset(net.rest[k],net.tags[k],fact,g,t)-WorldNetDeformation.Hold(t,true)*WorldNetDeformation.Offset(net.rest[k],net.tags[k],fact,g)));
                if(t==4.05&&!Same(output[k],net.rest[k]))wrong++;
            }
            if(field.Update(fact,t,output,out _))wrong++;
        }
        check(Controlled,"Flowing Field: exact Displace, full shape scaled, pause idempotent, backward seeks deterministic, exact end rest",wrong==0&&linear<=1e-12,wrong+linear,1e-12);
        foreach(double edge in new[]{3.85,4.05})jump=Math.Max(jump,Math.Abs(WorldNetDeformation.Offset(rest,"back",fact,g,edge+1e-5)-WorldNetDeformation.Offset(rest,"back",fact,g,edge-1e-5)));
        check(Controlled,"Flowing fade has no jump at start or end",jump<=1e-4,jump,1e-4);
        double Shown(double t)=>WorldNetDeformation.Offset(rest,"back",fact,g,t);
        double Curvature(double h){double worst=0;int n=(int)Math.Round(.4/h);for(int s=1;s<n;s++){double t=3.75+s*h;worst=Math.Max(worst,Math.Abs(Shown(t+h)-2*Shown(t)+Shown(t-h))/(h*h));}return worst;}
        double ratio=(Curvature(1/960.0)+1e-3)/(Curvature(1/240.0)+1e-3);
        check(Controlled,"Flowing fade curvature remains continuous with four times finer steps",ratio<=1.25,ratio,1.25);
        WorldFrame Frame(WorldNet n)=>new WorldFrame{schema="d6-world-view-1",session="flowing-test",sequence=1,clock=1,elapsed=1,ball=new[]{0.0,.29,0.0},score=new[]{1,0},players=Array.Empty<WorldPose>(),camera=new WorldCamera{position=new[]{0.0,20,30},target=new[]{0.0,0,0},fov=42},netActive=true,net=n,celebrating=true,celebrationTeam=0,celebrationTime=2.8};
        var a=Frame(fact);var b=Frame(fact);b.sequence=2;b.clock=1.05;b.celebrationTime=2.85;
        var blend=WorldViewPlayback.Blend(a,b,.5);var mixed=Frame(legacy);mixed.sequence=2;mixed.clock=1.05;
        check(Controlled,"Playback retains flowing for new fact pairs and legacy default for mixed pairs",blend.net.flowing&&!WorldViewPlayback.Blend(a,mixed,.5).net.flowing&&!JsonUtility.FromJson<WorldNet>("{\"sign\":1,\"age\":0.06,\"bulge\":0.6}").flowing,blend.net.flowing?0:1,0);
    }

    // Depth (m) by which the shown ball passes the back net (> 0: through it); rest: against the undeformed net.
    static double Penetration(double[] ball,WorldNet net,Geometry g,double sceneTime,bool rest){
        int s=net.sign>=0?1:-1;double half=g.length/2,radius=R,depth=s*ball[0]-half,cy=ProbeBridge.DisplayHeight(ball[1]),cz=ball[2],worst=double.NegativeInfinity;
        if(depth+radius<WorldNetDeformation.Depth-.6)return depth+radius-WorldNetDeformation.Depth;
        var plane=new Vector3((float)(s*(half+WorldNetDeformation.Depth)),0,0);double planeDepth=s*(double)plane.x-half;
        for(int ring=0;ring<=3;ring++){double rr=radius*ring/3;int n=ring==0?1:8;for(int k=0;k<n;k++){
            double a=2*Math.PI*k/n,y=cy+rr*Math.Sin(a),z=cz+rr*Math.Cos(a);if(y<0||y>g.goalHeight||Math.Abs(z)>g.goalWidth/2)continue;
            plane.y=(float)y;plane.z=(float)z;double surface=rest?planeDepth:s*(double)WorldNetDeformation.Displace(plane,"back",net,g,sceneTime).x-half;
            worst=Math.Max(worst,depth+Math.Sqrt(radius*radius-rr*rr)-surface);}}
        return double.IsNegativeInfinity(worst)?depth+radius-planeDepth:worst;
    }

    // Controlled replica of the rear-net tail with both received clock contracts, metres on the 68 x 44 picture:
    // the ball crosses the goal line at scene time 0 (speed toward the net, lateral speed, crossing z, native elevation,
    // vertical speed). In the legacy contract scene time stops at SceneCap, holding ball and net facts, while the goal pause and the
    // picture's goal-scene time run on; the net fact ends with the goal pause at SceneDuration and the post-goal banner
    // shows the ball at SceneDuration.
    struct Shot {public double speed,lateral,z0,elevation,vh;}
    static bool RearHit(in Shot s,Geometry g,out double impact){
        double W=g.goalWidth,H=g.goalHeight,inf=double.PositiveInfinity;
        double rear=(2.2-R)/Math.Max(.001,Math.Abs(s.speed)),edge=s.lateral!=0?(Math.Sign(s.lateral)*(W/2-R)-s.z0)/s.lateral:inf;
        double c=s.elevation-(H-R),b=s.vh,disc=b*b+19.6*c,root=disc>=0?(b-Math.Sqrt(disc))/9.8:inf,roof=c>=0?0:b>0&&root>=0?root:inf;
        impact=Math.Max(.001,Math.Min(rear,Math.Min(edge>=0?edge:inf,roof)));
        return !(roof<=Math.Min(rear,edge))&&!(edge>=0&&edge<rear);
    }
    static void Tail(in Shot s,Geometry g,double impact,double sceneTime,bool banner,double[] ball,WorldNet net,bool flowing=false){
        double W=g.goalWidth,H=g.goalHeight,time=banner?SceneDuration:Math.Min(sceneTime,flowing?SceneDuration:SceneCap),t=Math.Min(time,impact),fall=Math.Max(0,time-impact),damp=(1-Math.Exp(-7*fall))/7,vh=s.vh-9.8*t;
        double depth=Math.Clamp(s.speed*t+s.speed*-.18*damp,0,2.2-R),z=Math.Clamp(s.z0+s.lateral*t+s.lateral*.12*damp,-(W/2-R),W/2-R);
        double elevation=Math.Clamp(Math.Max(.29,s.elevation+s.vh*t-4.9*t*t+vh*fall-4.9*fall*fall),.29,H-R),contact=Math.Max(.29,s.elevation+s.vh*impact-4.9*impact*impact);
        double age=Math.Max(0,time-impact),pulse=age/.06;
        ball[0]=g.length/2+depth;ball[1]=elevation;ball[2]=z;
        net.sign=1;net.z=s.z0+s.lateral*impact;net.height=contact-(.29-R)*Math.Clamp(1-(contact-.29),0,1);net.age=age;net.bulge=time>=impact?.6*pulse*Math.Exp(1-pulse):0;net.flowing=flowing;
    }
    static void Envelope(Geometry g,Checker check,Meter measure,List<string> notes){
        double worst=-1,worstRest=double.NegativeInfinity,gap=double.PositiveInfinity,outward=0,inward=0,endHold=0,endRound1=0;int cases=0,slowCases=0,samples=0,changedFast=0;string at="",endAt="";
        var a=new double[3];var b=new double[3];var shown=new double[3];var banner=new double[3];var na=new WorldNet();var nb=new WorldNet();var mix=new WorldNet();var nbanner=new WorldNet();
        // speed -> (impact, held fact display without the scene time = round 1, native ball jump at the banner)
        var held=new SortedDictionary<double,(double impact,double round1,double ballJump,double contact)>();
        var shots=new List<(Shot shot,bool slow)>();
        foreach(double speed in new[]{2.5,4,7,12,20,32})foreach(double elevation in new[]{.29,.7,1.5,2.6})foreach(double z0 in new[]{0,3.0,4.5})foreach(double lateral in new[]{0,2.5})shots.Add((new Shot{speed=speed,lateral=lateral,z0=z0,elevation=elevation,vh=0},false));
        // Slow rear hits (0.5-2.4 m/s): ground rollers and lobs dropping in, the highest contacts the producer reaches
        // before a roof hit (impact after 1.6 s: ground contacts only).
        foreach(double speed in new[]{.5,.7,.83,.85,.9,1.0,1.2,1.45,1.65,2.0,2.4})foreach(var (elevation,vh) in new[]{(.29,0.0),(.7,0.0),(.44,7.0),(.89,6.5)})foreach(double z0 in new[]{0,3.0})shots.Add((new Shot{speed=speed,lateral=0,z0=z0,elevation=elevation,vh=vh},true));
        foreach(double rate in new[]{20.0,60.0})foreach(var (shot,isSlow) in shots){
            double speed=shot.speed,elevation=shot.elevation,z0=shot.z0,lateral=shot.lateral;if(!RearHit(shot,g,out double impact))continue;cases++;if(isSlow)slowCases++;
            // Pictures while the goal pause lasts (scene time below SceneDuration); the fact ends after the last one.
            int frames=(int)Math.Floor(SceneDuration*rate);Tail(shot,g,impact,0,false,a,na);double ta=0;
            for(int f=1;f<frames;f++){
                double tb=f/rate;Tail(shot,g,impact,tb,false,b,nb);
                for(int q=0;q<4;q++){
                    double w=q/4.0,scene=ta+(tb-ta)*w;for(int k=0;k<3;k++)shown[k]=a[k]+(b[k]-a[k])*w;
                    mix.sign=1;mix.z=na.z+(nb.z-na.z)*w;mix.height=na.height+(nb.height-na.height)*w;mix.age=na.age+(nb.age-na.age)*w;mix.bulge=na.bulge+(nb.bulge-na.bulge)*w;
                    samples++;double p=Penetration(shown,mix,g,scene,false);
                    if(p>worst){worst=p;at="speed "+F(speed)+" m/s, elevation "+F(elevation)+", vertical "+F(shot.vh)+" m/s, z "+F(z0)+", lateral "+F(lateral)+", "+F(rate)+" Hz, age "+mix.age.ToString("0.000",C)+", scene time "+scene.ToString("0.000",C);}
                    worstRest=Math.Max(worstRest,Penetration(shown,mix,g,scene,true));if(mix.age>0)gap=Math.Min(gap,-p);
                    var centre=new Vector3((float)(g.length/2+WorldNetDeformation.Depth),(float)mix.height,(float)mix.z);double off=WorldNetDeformation.Displace(centre,"back",mix,g,scene).x-centre.x;outward=Math.Max(outward,off);inward=Math.Max(inward,-off);
                    // A goal at rest before the native cap is shown exactly as without the scene time.
                    if(impact<=SceneCap-WorldNetDeformation.FadeEnd&&!Same(WorldNetDeformation.Displace(centre,"back",mix,g,scene),WorldNetDeformation.Displace(centre,"back",mix,g)))changedFast++;
                }
                Array.Copy(b,a,3);na.z=nb.z;na.height=nb.height;na.age=nb.age;na.bulge=nb.bulge;ta=tb;
            }
            // The last picture of the goal pause (held facts for impacts after SceneCap-FadeEnd): what remains when the fact ends.
            double last=Largest(na,g,ta),round1=Largest(na,g,double.NaN);
            if(last>endHold){endHold=last;endAt="speed "+F(speed)+" m/s, "+F(rate)+" Hz, scene time "+ta.ToString("0.000",C);}
            endRound1=Math.Max(endRound1,round1);
            if(isSlow){Tail(shot,g,impact,0,true,banner,nbanner);double jump=Math.Sqrt((banner[0]-a[0])*(banner[0]-a[0])+(banner[1]-a[1])*(banner[1]-a[1])+(banner[2]-a[2])*(banner[2]-a[2]));
                if(!held.TryGetValue(speed,out var e)||round1>e.round1)held[speed]=(impact,round1,Math.Max(e.ballJump,jump),na.height);else held[speed]=(e.impact,e.round1,Math.Max(e.ballJump,jump),e.contact);}
        }
        check(Producer,"Ball envelope on the replicated rear-net goal tail incl. slow rear hits (0.5-2.4 m/s) and the native scene hold: the shown ball never passes the displaced back net by more than 3 cm",worst<=.03&&cases>100&&slowCases>30,worst,.03,cases+" rear-hit shots ("+slowCases+" slow), "+samples+" shown pictures (20/60 Hz pictures, 4-step display blend); worst at "+at+"; against the rest net "+worstRest.ToString("0.0000",C)+" m; smallest gap after impact "+gap.ToString("0.0000",C)+" m");
        check(Producer,"With the picture's goal-scene time the net is exactly at rest when the fact ends, for every replicated rear hit incl. impacts after "+F(SceneCap-WorldNetDeformation.FadeEnd)+" s held by the native scene-time cap (no reset pop)",endHold==0,endHold,0,endHold==0?"round-1 display (no scene time) left up to "+endRound1.ToString("0.0000",C)+" m held until the fact ended":"worst at "+endAt);
        check(Producer,"Goals at rest before the native cap (impact <= "+F(SceneCap-WorldNetDeformation.FadeEnd)+" s) are shown exactly as without the scene time",changedFast==0,changedFast,0);
        foreach(var entry in held){
            var (impact,round1,jump,contact)=entry.Value;string detail="impact at scene time "+impact.ToString("0.000",C)+" s"+(impact<SceneCap?", native age held at "+(SceneCap-impact).ToString("0.000",C)+" s from "+F(SceneCap)+" s to "+F(SceneDuration)+" s":", the ball holds short of the net (no net motion)")+(round1>0?"; round-1 display held up to "+(round1*1000).ToString("0.0",C)+" mm and reset it when the fact ended; round 2 eases it to rest by "+F(WorldNetDeformation.HoldEnd)+" s":"; no held net motion")+"; the native ball jumps "+(jump*100).ToString("0.0",C)+" cm at the banner (not changed by the display)";
            measure(Inherited,"Native scene-time cap, rear speed "+F(entry.Key)+" m/s: largest held displacement the round-1 display showed (contact height "+contact.ToString("0.00",C)+" m)",round1,"m",detail);
        }
        notes.Add("Controlled producer replica: impact-point displacement between "+(-inward).ToString("0.000",C)+" and "+outward.ToString("0.000",C)+" m over "+cases+" rear-hit shots; the native tail clamps the ball to 2.2-R behind the line, so only an inward net motion could pass it. Slow rear hits (impact after "+F(SceneCap-WorldNetDeformation.FadeEnd)+" s) are held by the native scene-time cap at "+F(SceneCap)+" s; the round-2 display eases the held picture to rest by "+F(WorldNetDeformation.HoldEnd)+" s from the picture's goal-scene time.");
    }

    // Current producer clock: independent controlled sweep alongside the unchanged
    // capped-fact envelope above. JS also executes the actual production functions
    // in work/test-lowpoly-goal-tail.cjs; this sweep exercises the real C# net shape.
    static void CurrentEnvelope(Geometry g,Checker check,Meter measure,List<string> notes){
        double worst=double.NegativeInfinity,lastMaximum=0,exactEnd=0,ballEndStep=0;int cases=0,samples=0,slow=0;string at="",lastAt="";
        var a=new double[3];var b=new double[3];var shown=new double[3];var na=new WorldNet();var nb=new WorldNet();var mix=new WorldNet{flowing=true};
        foreach(double rate in new[]{20.0,60.0})foreach(double speed in new[]{.5,.6,.7,.8,.83,.85,.9,1,1.2,1.45,1.65,2,2.4,4,7,12,20})foreach(var (elevation,vh) in new[]{(.29,0.0),(.7,0.0),(.44,7.0),(.89,6.5)})foreach(double z in new[]{0,3.0}){
            var shot=new Shot{speed=speed,z0=z,elevation=elevation,vh=vh};if(!RearHit(shot,g,out double impact))continue;cases++;if(speed<=.8)slow++;
            Tail(shot,g,impact,0,false,a,na,true);double ta=0;int count=(int)Math.Floor(SceneDuration*rate);
            for(int f=1;f<count;f++){
                double tb=f/rate;Tail(shot,g,impact,tb,false,b,nb,true);
                for(int q=0;q<4;q++){
                    double w=q/4.0,time=ta+(tb-ta)*w;for(int k=0;k<3;k++)shown[k]=a[k]+(b[k]-a[k])*w;
                    mix.sign=1;mix.z=na.z+(nb.z-na.z)*w;mix.height=na.height+(nb.height-na.height)*w;mix.age=na.age+(nb.age-na.age)*w;mix.bulge=na.bulge+(nb.bulge-na.bulge)*w;
                    double p=Penetration(shown,mix,g,time,false);samples++;if(p>worst){worst=p;at="speed "+F(speed)+", elevation "+F(elevation)+", vh "+F(vh)+", z "+F(z)+", rate "+F(rate)+", scene "+F(time);}
                }
                Array.Copy(b,a,3);na.z=nb.z;na.height=nb.height;na.age=nb.age;na.bulge=nb.bulge;ta=tb;
            }
            double last=Largest(na,g,ta);if(last>lastMaximum){lastMaximum=last;lastAt="speed "+F(speed)+", rate "+F(rate)+", scene "+F(ta);}
            Tail(shot,g,impact,SceneDuration,false,b,nb,true);exactEnd=Math.Max(exactEnd,Largest(nb,g,SceneDuration));
            Tail(shot,g,impact,SceneDuration-1e-6,false,a,na,true);ballEndStep=Math.Max(ballEndStep,Math.Sqrt((a[0]-b[0])*(a[0]-b[0])+(a[1]-b[1])*(a[1]-b[1])+(a[2]-b[2])*(a[2]-b[2])));
        }
        check(Producer,"Current flowing-clock envelope incl. .5/.6/.7/.8 m/s: ball penetrates the displaced net by no more than 3 cm",cases==272&&slow==64&&worst<=.03,worst,.03,cases+" rear hits, "+slow+" slow, "+samples+" interpolated samples; worst "+at);
        check(Producer,"Current flowing facts: last received picture leaves at most 3 cm of deformation and 4.05 s is exact rest",lastMaximum<=.03&&exactEnd==0,lastMaximum,.03,"last picture "+lastAt+"; exact end residual "+F(exactEnd)+" m");
        check(Producer,"Current full-pause tail reaches the banner continuously",ballEndStep<=3e-5,ballEndStep,3e-5,"1 us before 4.05 s versus the banner's 4.05 s picture");
        measure(Producer,"Current flowing tail: maximum remaining deformation in last 20/60 Hz picture",lastMaximum,"m",lastAt);
        notes.Add("The legacy capped-fact envelope/goldens remain unchanged. New flowing facts use 4.05-goalPause and fade at 3.85-4.05 s; controlled projection and C# shape checks do not establish full-match reachability or frequency.");
    }

    // Recorded pictures: shown as WorldViewPlayback blends them and RenderWorldNet receives them (with the picture's
    // goal-scene time); penetration with and without the deformation.
    static List<string> Folders(string repo){
        var list=new List<string>{Path.Combine(repo,"outputs/lowpoly-live-rollout-20261013/net-recordings")};
        var args=Environment.GetCommandLineArgs();for(int i=0;i<args.Length-1;i++)if(args[i]=="-d6netrecordings")list.Add(Path.IsPathRooted(args[i+1])?args[i+1]:Path.Combine(repo,args[i+1]));
        var env=Environment.GetEnvironmentVariable("D6_NET_RECORDINGS");if(!string.IsNullOrEmpty(env))list.Add(Path.IsPathRooted(env)?env:Path.Combine(repo,env));
        var found=new List<string>();foreach(var f in list)if(Directory.Exists(f)&&!found.Contains(Path.GetFullPath(f)))found.Add(Path.GetFullPath(f));return found;
    }
    // Every outermost JSON object with "schema":"d6-world-view-1" among its own keys (pictures and configurations), in
    // any nesting and key order; objects nested in such an object (a configuration's initial picture) are not repeated.
    static List<string> ViewObjects(string text){
        var spans=new List<(int start,int end)>();var stack=new List<(int start,bool view)>();
        bool inString=false,escape=false,schemaKey=false;int stringStart=0,schemaDepth=-1;
        for(int j=0;j<text.Length;j++){
            char c=text[j];
            if(inString){
                if(escape)escape=false;else if(c=='\\')escape=true;
                else if(c=='"'){
                    inString=false;int k=j+1;while(k<text.Length&&char.IsWhiteSpace(text[k]))k++;bool key=k<text.Length&&text[k]==':';
                    if(key){schemaKey=j-stringStart==6&&string.CompareOrdinal(text,stringStart,"schema",0,6)==0;schemaDepth=stack.Count;}
                    else{if(schemaKey&&schemaDepth==stack.Count&&stack.Count>0&&j-stringStart==15&&string.CompareOrdinal(text,stringStart,"d6-world-view-1",0,15)==0)stack[stack.Count-1]=(stack[stack.Count-1].start,true);schemaKey=false;}
                }
                continue;
            }
            if(c=='"'){inString=true;stringStart=j+1;continue;}
            if(c==':'||char.IsWhiteSpace(c))continue;
            if(c=='{'){stack.Add((j,false));schemaKey=false;}
            else if(c=='}'){if(stack.Count>0){var top=stack[stack.Count-1];stack.RemoveAt(stack.Count-1);if(top.view)spans.Add((top.start,j));}schemaKey=false;}
            else schemaKey=false;
        }
        spans.Sort((x,y)=>x.start.CompareTo(y.start));
        var list=new List<string>();int covered=-1;
        foreach(var (start,end) in spans){if(start<covered)continue;list.Add(text.Substring(start,end-start+1));covered=end;}
        return list;
    }
    static Geometry CaptureGeometry(string folder,string file){
        // keeper-next naming: windows-<seed>-<size>-<players>-<nn>.json beside capture-<seed>-<size>-<players>.json.
        var parts=Path.GetFileNameWithoutExtension(file).Split('-');if(parts.Length<4)return null;
        var meta=Path.Combine(folder,"capture-"+parts[1]+"-"+parts[2]+"-"+parts[3]+".json");if(!File.Exists(meta))return null;
        var text=File.ReadAllText(meta);return Live(text.Contains("\"fieldSize\": \"large\"")||text.Contains("\"fieldSize\":\"large\"")?1.2:1);
    }
    static List<WorldFrame> CapturePictures(string text,out Geometry geometry){
        geometry=null;var pictures=new List<WorldFrame>();
        foreach(var json in ViewObjects(text)){
            if(json.Contains("\"fixtureId\"")){var config=JsonUtility.FromJson<WorldConfig>(json);if(config?.geometry!=null&&config.geometry.goalWidth>0)geometry=config.geometry;continue;}
            var f=JsonUtility.FromJson<WorldFrame>(json);if(f?.ball!=null&&f.ball.Length==3)pictures.Add(f);
        }
        return pictures;
    }
    sealed class CaptureCoverage {
        public int flowingPictures,flowingEnds,openFlowingFacts;
        public bool Complete=>flowingPictures>0&&flowingEnds>0&&openFlowingFacts==0;
    }
    // An ending is an observed inactive picture in the same ordered session. EOF, a
    // different session or a backwards sequence cannot stand in for the missing end.
    static CaptureCoverage CaptureCoverageOf(List<WorldFrame> pictures){
        var result=new CaptureCoverage();WorldFrame previous=null;bool active=false,flowing=false;
        foreach(var f in pictures){
            bool ordered=previous!=null&&previous.session==f.session&&previous.sequence<f.sequence;
            if(active&&!ordered){if(flowing)result.openFlowingFacts++;active=flowing=false;}
            bool next=f.netActive&&f.net!=null;
            if(active&&!next){if(flowing)result.flowingEnds++;active=flowing=false;}
            if(next){active=true;flowing|=f.net.flowing;if(f.net.flowing)result.flowingPictures++;}
            previous=f;
        }
        if(active&&flowing)result.openFlowingFacts++;
        return result;
    }
    static void CaptureGateTests(Checker check){
        const string active="{\"schema\":\"d6-world-view-1\",\"session\":\"capture-proof\",\"sequence\":1,\"ball\":[0,0.29,0],\"netActive\":true,\"net\":{\"sign\":1,\"age\":0.06,\"bulge\":0.6,\"flowing\":true}}";
        const string ended="{\"net\":null,\"ball\":[0,0.29,0],\"netActive\":false,\"sequence\":2,\"session\":\"capture-proof\",\"schema\":\"d6-world-view-1\"}";
        CaptureCoverage Read(string text)=>CaptureCoverageOf(CapturePictures(text,out _));
        var full=Read("{\"frames\":["+active+","+ended+"]}");
        check(Controlled,"Capture gate parses nested pictures with different key orders and requires an observed flowing end",full.Complete&&full.flowingPictures==1&&full.flowingEnds==1,full.flowingEnds,1);
        var truncated=Read("{\"frames\":["+active+"]}");
        var truncatedJson=Read("{\"frames\":["+active+",{\"netActive\":false,");
        check(Controlled,"Capture gate rejects complete or truncated JSON ending while a flowing fact is active",!truncated.Complete&&!truncatedJson.Complete&&truncated.openFlowingFacts==1&&truncatedJson.openFlowingFacts==1,truncated.openFlowingFacts,1);
        var partial=Read("{\"frames\":["+active+","+ended+","+active.Replace("\"sequence\":1","\"sequence\":3")+"]}");
        check(Controlled,"Capture gate rejects a later truncated goal even after a complete goal",!partial.Complete&&partial.flowingEnds==1&&partial.openFlowingFacts==1,partial.openFlowingFacts,1);
        var legacy=Read("["+active.Replace(",\"flowing\":true","")+","+ended+"]");
        check(Controlled,"Capture gate rejects a complete legacy fact with the flowing marker absent",!legacy.Complete&&legacy.flowingPictures==0,legacy.flowingPictures,0);
        var otherSession=Read("["+active+","+ended.Replace("capture-proof","next-session")+"]");
        var backwards=Read("["+active+","+ended.Replace("\"sequence\":2","\"sequence\":1")+"]");
        check(Controlled,"Capture gate rejects session changes and unordered pictures as fact endings",!otherSession.Complete&&!backwards.Complete&&otherSession.openFlowingFacts==1&&backwards.openFlowingFacts==1,otherSession.flowingEnds+backwards.flowingEnds,0);
    }
    static int Recordings(string folder,string source,bool current,Checker check,List<Recording> recordings,List<string> notes){
        if(!Directory.Exists(folder))return 0;int files=0;bool blendFailed=false;
        foreach(var file in Directory.GetFiles(folder,"*.json")){
            string name=Path.GetFileName(file);if(name.StartsWith("capture-",StringComparison.Ordinal))continue;
            var text=File.ReadAllText(file);if(text.IndexOf("\"netActive\":true",StringComparison.Ordinal)<0&&text.IndexOf("\"netActive\": true",StringComparison.Ordinal)<0)continue;
            var pictures=CapturePictures(text,out Geometry g);var coverage=CaptureCoverageOf(pictures);
            string geometryNote=g!=null?"configuration":"capture metadata";g??=CaptureGeometry(folder,name);if(g==null){g=Live(1);geometryNote="default 68 x 44 (no configuration or capture metadata)";}
            var rec=new Recording{file=name,source=source,geometry=geometryNote+" "+g.length.ToString("0.#",C)+" x "+g.width.ToString("0.#",C)+", goal "+g.goalWidth.ToString("0.###",C)+" x "+g.goalHeight.ToString("0.###",C),pictures=pictures.Count,flowingNetPictures=coverage.flowingPictures,flowingEnds=coverage.flowingEnds,openFlowingFacts=coverage.openFlowingFacts,penetration=double.NegativeInfinity,restPenetration=double.NegativeInfinity,added=double.NegativeInfinity};
            double[] last=null;WorldNet previous=null;double previousScene=double.NaN;
            for(int p=0;p<pictures.Count;p++){
                var b=pictures[p];if(b.netActive&&b.net!=null){rec.netPictures++;if(b.net.bulge>1e-4&&Math.Abs(b.net.bulge-V119(b.net.age))<1e-9)rec.v119Facts++;}
                var a=p>0&&pictures[p-1].session==b.session&&pictures[p-1].sequence<b.sequence?pictures[p-1]:null;
                bool cut=a==null||WorldViewPlayback.Cut(a,b);
                for(int q=cut?4:1;q<=4;q++){
                    WorldFrame f=b;
                    if(q<4){try{f=WorldViewPlayback.Blend(a,b,q/4.0);}catch(Exception){blendFailed=true;f=b;}}
                    if(!f.netActive||f.net==null){if(previous!=null){rec.endStep=Math.Max(rec.endStep,Largest(previous,g,previousScene));rec.endStepWithoutHold=Math.Max(rec.endStepWithoutHold,Largest(previous,g,double.NaN));previous=null;last=null;}continue;}
                    double scene=f.celebrating?f.celebrationTime:double.NaN;if(scene>=WorldNetDeformation.HoldStart)rec.heldSamples++;
                    rec.samples++;double shown=Penetration(f.ball,f.net,g,scene,false),rest=Penetration(f.ball,f.net,g,scene,true);
                    rec.penetration=Math.Max(rec.penetration,shown);rec.restPenetration=Math.Max(rec.restPenetration,rest);rec.added=Math.Max(rec.added,Math.Max(0,shown)-Math.Max(0,rest));
                    var grid=Grid(f.net,g,scene);rec.largest=Math.Max(rec.largest,Max(grid));rec.inward=Math.Max(rec.inward,-Min(grid));
                    if(last!=null)for(int k=0;k<grid.Length;k++)rec.largestStep=Math.Max(rec.largestStep,Math.Abs(grid[k]-last[k]));
                    last=grid;previous=new WorldNet{sign=f.net.sign,z=f.net.z,height=f.net.height,age=f.net.age,bulge=f.net.bulge,flowing=f.net.flowing};previousScene=scene;
                }
            }
            if(rec.netPictures==0)continue;if(!current||coverage.Complete)files++;recordings.Add(rec);
            if(current)check(Recorded,"Recorded "+name+": current flowing capture includes every observed fact ending",coverage.Complete,coverage.openFlowingFacts,0,coverage.flowingPictures+" flowing net pictures; "+coverage.flowingEnds+" observed endings; "+coverage.openFlowingFacts+" unclosed flowing facts");
            string detail=rec.netPictures+" net pictures ("+rec.v119Facts+" with rear-hit v119 facts, "+rec.heldSamples+" shown samples in the native scene hold), "+rec.samples+" shown samples; penetration "+rec.penetration.ToString("0.0000",C)+" m, at rest "+rec.restPenetration.ToString("0.0000",C)+" m; largest "+rec.largest.ToString("0.000",C)+" m, inward "+rec.inward.ToString("0.000",C)+" m, largest step "+rec.largestStep.ToString("0.000",C)+" m";
            check(Recorded,"Recorded "+name+": the deformation adds no more than 3 cm of ball penetration",rec.added<=.03,rec.added,.03,detail);
            if(current)check(Recorded,"Recorded "+name+": the shown ball passes the displaced back net by no more than 3 cm",rec.penetration<=.03,rec.penetration,.03,detail);
            check(Recorded,"Recorded "+name+": the net is at rest when the fact ends (no reset pop)",rec.endStep<=.001,rec.endStep,.001,"without the picture's goal-scene time (round 1) "+rec.endStepWithoutHold.ToString("0.0000",C)+" m");
        }
        if(blendFailed)notes.Add("WorldViewPlayback.Blend rejected some recorded picture pairs in "+folder+"; those pictures were shown unblended.");
        if(!current&&files>0)notes.Add("keeper-next captures predate v119: their ball path was not clamped to the rest net, so a ground ball can rest up to "+(Math.Max(0,MaxRest(recordings))*100).ToString("0.0",C)+" cm beyond it with any net (inherited, not caused by the deformation; the current producer clamps the ball to 2.2-R). They carry no goal-scene time, so they show the round-1 shape.");
        return files;
    }
    static double MaxRest(List<Recording> list){double m=0;foreach(var r in list)m=Math.Max(m,r.restPenetration);return m;}
    // The back net on a 25 x 9 grid (displacement along its normal, m).
    static double[] Grid(WorldNet net,Geometry g,double sceneTime){
        var grid=new double[25*9];int s=net.sign>=0?1:-1;var p=new Vector3((float)(s*(g.length/2+WorldNetDeformation.Depth)),0,0);
        for(int i=0;i<25;i++)for(int j=0;j<9;j++){p.z=(float)(-g.goalWidth/2+g.goalWidth*(i+.5)/25);p.y=(float)(g.goalHeight*(j+.5)/9);grid[i*9+j]=s*((double)WorldNetDeformation.Displace(p,"back",net,g,sceneTime).x-p.x);}
        return grid;
    }
    static double Largest(WorldNet net,Geometry g,double sceneTime){double m=0;foreach(var v in Grid(net,g,sceneTime))m=Math.Max(m,Math.Abs(v));return m;}
    static double Max(double[] v){double m=double.NegativeInfinity;foreach(var x in v)m=Math.Max(m,x);return m;}
    static double Min(double[] v){double m=double.PositiveInfinity;foreach(var x in v)m=Math.Min(m,x);return m;}
}
}
#endif

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
// net facts on the actual ProbeBridge.GoalNet meshes and the actual RenderWorldNet upload/reset; "controlled-producer" =
// a replica of the native rear-net goal tail, pinned to the current source text (world-pitch3d-v98.js
// v119VisibleGoalView, world-pitch-actions-v99.js v101GoalBall, world-unity-v151.js net fact), for the ball envelope;
// "recorded" = native pictures captured from the bridge: the keeper-next captures (release 118, before v119; their net
// facts are today's fallback path) and any capture in outputs/lowpoly-live-rollout-20261013/net-recordings,
// -d6netrecordings <folder> or D6_NET_RECORDINGS (WorldConfig and WorldFrame JSON in any nesting). Penetration is the
// depth by which the shown ball sphere (RenderWorld: DisplayHeight) passes the back net, sampled over its disc.
// Editor timings are no device or WebGL figure. Writes net-deformation-tests.json; throws when a check fails.
public static class WorldNetTests {
    [Serializable] class Item {public string kind,name,detail;public bool passed;public double value,limit;}
    [Serializable] class Recording {public string file,source,geometry;public int pictures,netPictures,v119Facts,samples;public double penetration,restPenetration,added,largest,inward,largestStep,endStep;}
    [Serializable] class Report {public string schema="d6-net-deformation-tests-1";public bool passed;public int checks,failed,recordedLegacy,recordedCurrent;public string parameters;public Item[] items;public Recording[] recordings;public string[] notes;}
    delegate void Checker(string kind,string name,bool passed,double value,double limit,string detail=null);
    sealed class Net {public Mesh mesh;public Vector3[] rest,vertices;public string[] tags;public int sign;}
    const string Controlled="controlled",Producer="controlled-producer",Recorded="recorded";
    static readonly CultureInfo C=CultureInfo.InvariantCulture;
    static double R=>WorldBallMotion.Radius;

    public static string Run(string repo,string output=null){
        var items=new List<Item>();var notes=new List<string>();var recordings=new List<Recording>();
        void Check(string kind,string name,bool passed,double value,double limit,string detail=null){items.Add(new Item{kind=kind,name=name,passed=passed,value=value,limit=limit,detail=detail});}
        var live=Live(1);
        Pins(repo,Check);
        Rigged(live,"live 68 x 44",Check,rig=>{Edges(rig,live,"live 68 x 44",Check);Shape(rig,live,Check);Smoothness(rig,live,Check);Symmetry(rig,live,Check);Determinism(rig,live,Check);Integration(rig,live,Check,notes);});
        foreach(var (g,label) in new[]{(Live(1.2),"large 81.6 x 52.8"),(Fixture(),"contract fixture goal 9.7 x 2.44")})Rigged(g,label,Check,rig=>Edges(rig,g,label,Check));
        Envelope(live,Check,notes);
        int legacy=Recordings(Path.Combine(repo,"outputs/3d-quality/keeper-next/pictures"),"keeper-next capture (release 118, pre-v119: today's fallback net facts)",false,Check,recordings,notes);
        int current=0;foreach(var folder in Folders(repo))current+=Recordings(folder,"capture "+folder,true,Check,recordings,notes);
        if(current==0)notes.Add("No current-producer goal capture found (outputs/lowpoly-live-rollout-20261013/net-recordings, -d6netrecordings, D6_NET_RECORDINGS): the 3 cm envelope on recorded rear-net goals of the current producer is still unproven here; only the pinned controlled replica covers it.");
        var failedItems=items.FindAll(i=>!i.passed);
        var report=new Report{passed=failedItems.Count==0,checks=items.Count,failed=failedItems.Count,recordedLegacy=legacy,recordedCurrent=current,parameters=Parameters(),items=items.ToArray(),recordings=recordings.ToArray(),notes=notes.ToArray()};
        if(output!=null){var folder=Path.Combine(repo,output);Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,"net-deformation-tests.json"),JsonUtility.ToJson(report,true));}
        if(failedItems.Count>0)throw new Exception("WorldNetTests: "+failedItems.Count+" of "+items.Count+" checks failed: "+string.Join("; ",failedItems.ConvertAll(i=>i.name+" ("+i.value.ToString("0.#####",C)+" vs "+i.limit.ToString("0.#####",C)+")")));
        return "passed="+items.Count+" recordedLegacy="+legacy+" recordedCurrent="+current+(current==0?" (current-producer capture pending)":"");
    }

    // Native match geometry v1 (world-match-v64.js v160WorldGeometry) and the contract fixture's goal.
    static Geometry Live(double scale){double goal=44*.2/(544/600.0);return new Geometry{length=68*scale,width=44*scale,goalWidth=goal,goalHeight=goal/3,penaltyDepth=68*(.18-26/740.0)/(688/740.0),penaltyWidth=44*.5/(544/600.0),fieldPlayers=5,attackDirection=1};}
    static Geometry Fixture()=>new Geometry{length=68,width=44,goalWidth=9.7,goalHeight=2.44,penaltyDepth=13.2,penaltyWidth=29.1,fieldPlayers=5,attackDirection=1};
    static string Parameters(){
        string F(double v)=>v.ToString("0.#####",C);
        return "depth "+F(WorldNetDeformation.Depth)+", fixed "+F(WorldNetDeformation.Fixed)+", ramps "+F(WorldNetDeformation.RampWidth)+"/"+F(WorldNetDeformation.RampHeight)+"/"+F(WorldNetDeformation.RampDepth)+
            ", pocket "+F(WorldNetDeformation.PocketAmplitude)+" m per bulge, radius "+F(WorldNetDeformation.PocketRadius)+", rest below bulge "+F(WorldNetDeformation.RestBulge)+
            ", ripple "+F(WorldNetDeformation.RippleAmplitude)+" m "+F(WorldNetDeformation.RippleFrequency)+" Hz "+F(WorldNetDeformation.RippleSpeed)+" m/s decay "+F(WorldNetDeformation.RippleDecay)+" s onset "+F(WorldNetDeformation.RippleOnset)+" s spread "+F(WorldNetDeformation.RippleSpread)+
            ", sway "+F(WorldNetDeformation.SwayAmplitude)+" m "+F(WorldNetDeformation.SwayFrequency)+" Hz decay "+F(WorldNetDeformation.SwayDecay)+" s onset "+F(WorldNetDeformation.SwayOnset)+
            ", fade "+F(WorldNetDeformation.FadeStart)+"-"+F(WorldNetDeformation.FadeEnd)+" s, roof/side "+F(WorldNetDeformation.SympathyAmplitude)+" m per bulge, step "+F(WorldNetDeformation.Step);
    }
    // Native fact profiles: rear-hit bulge (world-pitch3d-v98.js v119VisibleGoalView) and the fallback bulge
    // (world-goal-scene-v83.js v83GoalPosition, age = goal-scene time, capped at 2.45 s).
    static double V119(double age){double p=age/.06;return age>0?.6*p*Math.Exp(1-p):0;}
    static double V83(double age){double t=Math.Min(age,2.45);return t<.6?t/.6:t<1.05?1-.55*(t-.6)/.45:t<1.65?.45*(1-(t-1.05)/.6):0;}
    static WorldNet Fact(int sign,double z,double h,double age,double bulge)=>new WorldNet{sign=sign,z=z,height=h,age=age,bulge=bulge};
    static bool Same(Vector3 a,Vector3 b)=>a.x==b.x&&a.y==b.y&&a.z==b.z;
    static bool Finite(Vector3 v)=>!(float.IsNaN(v.x)||float.IsNaN(v.y)||float.IsNaN(v.z)||float.IsInfinity(v.x)||float.IsInfinity(v.y)||float.IsInfinity(v.z));
    // Signed displacement along the panel's outward normal.
    static double Offset(Vector3 rest,Vector3 shown,string tag,int sign)=>tag=="back"?sign*((double)shown.x-rest.x):tag=="roof"?(double)shown.y-rest.y:tag=="left"?(double)rest.z-shown.z:tag=="right"?(double)shown.z-rest.z:0;

    // The source this suite replicates: BuildWorld's net placement and the native rear-net producer.
    static void Pins(string repo,Checker check){
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
            ("dist/world-pitch-actions-v99.js","fall=Math.max(0,time-travel.impact),damp=(1-Math.exp(-7*fall))/7"),
            ("dist/world-pitch-actions-v99.js","x:travel.x+travel.vx*t+travel.vx*(travel.hit==='side'?-.18:.12)*damp"),
            ("dist/world-pitch-actions-v99.js","y:travel.y+travel.vy*t+travel.vy*(travel.hit==='rear'?-.18:.12)*damp"),
            ("dist/world-pitch-actions-v99.js","elevation:Math.max(.29,travel.elevation+travel.vh*t-4.9*t*t+(travel.hit==='roof'?-Math.abs(vh)*.18:vh)*fall-4.9*fall*fall)"),
            ("dist/world-unity-v151.js","if(!view||view.hit==='rear')frame.net={sign:Math.sign(spot.x),z:spot.z,height:view?.height??.8,age:view?.age??current.goalScene.elapsed,bulge:view?.bulge??p.bulge};"),
            ("dist/world-unity-v151.js","now-lastSent>=50"),
            ("dist/world-goal-scene-v83.js","if(time<.6){const p=time/.6;depth=17*p;height=6*p;bulge=p;drift=0}"),
            ("dist/world-goal-scene-v83.js","else if(time<1.05){const p=(time-.6)/.45;depth=17-7*p;height=6+2*Math.sin(Math.PI*p);bulge=1-.55*p;drift=-.003*p}"),
            ("dist/world-goal-scene-v83.js","else if(time<1.65){const p=(time-1.05)/.6;depth=10+4*p;height=6*(1-p)*(1-p);bulge=.45*(1-p);drift=-.003+.006*p}"),
            ("dist/world-goal-scene-v83.js","scene.elapsed=Math.min(2.45,scene.elapsed+Math.max(0,realDelta));"),
        };
        var missing=new List<string>();var texts=new Dictionary<string,string>();
        foreach(var (file,text) in pins){
            if(!texts.TryGetValue(file,out var source)){var path=Path.Combine(repo,file);source=File.Exists(path)?File.ReadAllText(path):"";texts[file]=source;}
            if(source.IndexOf(text,StringComparison.Ordinal)<0)missing.Add(file+": "+text);
        }
        check(Producer,"The replicated net placement and native rear-net producer formulas are the current source (replica not stale)",missing.Count==0,missing.Count,0,missing.Count==0?pins.Length+" source pins present":string.Join(" | ",missing));
    }

    // Builds the actual goal nets with ProbeBridge.GoalNet (as BuildWorld does) on a bridge whose world view holds g.
    sealed class Rig:IDisposable {
        const BindingFlags Flags=BindingFlags.NonPublic|BindingFlags.Instance;
        public readonly List<Net> nets=new List<Net>();public readonly Action<WorldNet> render;readonly ProbeBridge bridge;readonly GameObject host,root;readonly Material material;readonly IList meshes;
        public Rig(Geometry g){
            host=new GameObject("D6 net test bridge");bridge=host.AddComponent<ProbeBridge>();root=new GameObject("D6 net test world");
            var shader=Shader.Find("Universal Render Pipeline/Lit");if(shader==null)shader=Shader.Find("Hidden/InternalErrorShader");material=new Material(shader);
            try{
                Set("world",root.transform);Set("worldView",new WorldViewState(Config(g)));meshes=(IList)Get<object>("netMeshes");
                var build=typeof(ProbeBridge).GetMethod("GoalNet",Flags);float length=(float)g.length;
                foreach(int sign in new[]{-1,1})build.Invoke(bridge,new object[]{sign*length/2,sign*(length/2+2.2f),(float)g.goalWidth,(float)g.goalHeight,material});
                foreach(var view in (IList)Get<object>("netViews")){var type=view.GetType();T F<T>(string n)=>(T)type.GetField(n).GetValue(view);nets.Add(new Net{mesh=F<Mesh>("mesh"),rest=F<Vector3[]>("rest"),vertices=F<Vector3[]>("vertices"),tags=F<string[]>("tags"),sign=F<int>("goalSign")});}
                render=(Action<WorldNet>)Delegate.CreateDelegate(typeof(Action<WorldNet>),bridge,typeof(ProbeBridge).GetMethod("RenderWorldNet",Flags));
            }catch{Dispose();throw;}
        }
        void Set(string name,object value)=>typeof(ProbeBridge).GetField(name,Flags).SetValue(bridge,value);
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
        int fixedCount=0,moved=0,front=0,axis=0,inward=0,bounds=0,nonFinite=0,other=0,facts=0;double worst=0;
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
                    if(net.sign*(double)o.x<Math.Min(net.sign*(double)r.x,g.length/2)-1e-6)front++;
                    double off=Offset(r,o,tag,net.sign);
                    if(tag=="back"){if(o.y!=r.y||o.z!=r.z)axis++;if(Math.Abs(off)>backLimit)bounds++;worst=Math.Max(worst,Math.Abs(off));}
                    else{if(o.x!=r.x||(tag=="roof"?o.z!=r.z:o.y!=r.y))axis++;if(off<0)inward++;if(off>sideLimit)bounds++;}
                }
            }
        }
        string Of(string what)=>what+" ("+label+", "+facts+" facts on both goals)";
        check(Controlled,Of("Every vertex within the strand half-width of a post, crossbar, ground line, rear support, rear crossbar or roof support stays exactly at rest"),moved==0&&fixedCount>0,moved,0,fixedCount+" frame vertices per fact checked bitwise");
        check(Controlled,Of("No vertex moves toward the field past the goal line or its own rest position"),front==0,front,0);
        check(Controlled,Of("Back net moves only along its normal; roof and side nets only outward along theirs"),axis==0&&inward==0,axis+inward,0,"off-axis "+axis+", inward roof/side "+inward);
        check(Controlled,Of("Displacements stay within pocket*bulge+ripple+sway (back) and the bulge-scaled roof/side limit; all finite"),bounds==0&&nonFinite==0,bounds+nonFinite,0,"largest back displacement "+worst.ToString("0.000",C)+" m");
        check(Controlled,Of("A fact of the other goal leaves this goal's net untouched"),other==0,other,0);
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
        check(Controlled,"Recoil past rest stays gentle (no trampoline)",recoil<=.06,recoil,.06,"largest inward displacement "+recoil.ToString("0.000",C)+" m over the back net (release 130: 6.9 cm inward at 0.9 s)");
        check(Controlled,"No second inflation after the pocket has released (age >= .35 s)",late<=.035,late,.035,"release 130 re-inflated to 11.6 cm at 0.7 s");
        check(Controlled,"After the fade the net is exactly at rest and is not re-uploaded",end==0&&restUploads==0,end,0,"at the fade start the largest displacement is "+(fadeStart*1000).ToString("0.0",C)+" mm");
        check(Controlled,"The fade starts below 1 cm",fadeStart<.01,fadeStart,.01);
    }

    // Age is the only time input: C1 continuity (no pop at .6 s or elsewhere), bounded speed, smooth onset at the impact.
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

    // Same fact, same vertices: Field equals Displace bitwise, repeated calls agree, and no frame-rate path leaves a trace.
    static void Determinism(Rig rig,Geometry g,Checker check){
        var net=Goal(rig,1);int differ=0,repeat=0,facts=0;
        var field=new WorldNetDeformation.Field(net.rest,net.tags,net.sign,g);var output=(Vector3[])net.rest.Clone();
        var list=Facts(1,g);for(int f=0;f<list.Count;f+=7){var fact=list[f];facts++;field.Update(fact,output,out _);
            for(int k=0;k<output.Length;k++){var once=WorldNetDeformation.Displace(net.rest[k],net.tags[k],fact,g);if(!Same(once,output[k]))differ++;if(!Same(once,WorldNetDeformation.Displace(net.rest[k],net.tags[k],fact,g)))repeat++;}}
        check(Controlled,"The per-goal field equals the pure Displace for every vertex (bitwise)",differ==0,differ,0,facts+" facts");
        check(Controlled,"Displace is deterministic (bitwise repeat)",repeat==0,repeat,0);
        // 30, 60 and 120 Hz paths and a direct jump (seek) to the same fact give the same vertices; so does a pause.
        var finals=new List<Vector3[]>();double end=.43;
        foreach(double rate in new[]{30.0,60.0,120.0,0}){
            var f=new WorldNetDeformation.Field(net.rest,net.tags,net.sign,g);var o=(Vector3[])net.rest.Clone();
            if(rate>0)for(double age=0;age<end;age+=1/rate)f.Update(Fact(1,1.2,1.1,age,V119(age)),o,out _);
            f.Update(Fact(1,1.2,1.1,end,V119(end)),o,out _);finals.Add(o);
        }
        int paths=0;foreach(var o in finals)for(int k=0;k<o.Length;k++)if(!Same(o[k],finals[3][k]))paths++;
        var paused=(Vector3[])finals[3].Clone();var p2=new WorldNetDeformation.Field(net.rest,net.tags,net.sign,g);var shown=(Vector3[])net.rest.Clone();
        p2.Update(Fact(1,1.2,1.1,end,V119(end)),shown,out _);bool again=p2.Update(Fact(1,1.2,1.1,end,V119(end)),shown,out _);
        int pause=0;for(int k=0;k<shown.Length;k++)if(!Same(shown[k],paused[k]))pause++;
        check(Controlled,"30/60/120 Hz playback, a seek and a pause show identical vertices for the same fact (no integrated state)",paths==0&&pause==0&&!again,paths+pause,0,again?"an unchanged fact was uploaded again":"unchanged fact: no upload");
    }

    // The actual RenderWorldNet: upload of the hit goal only, exact rest restore of vertices, normals and bounds.
    static void Integration(Rig rig,Geometry g,Checker check,List<string> notes){
        var hit=Goal(rig,1);var other=Goal(rig,-1);
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

    // Depth (m) by which the shown ball passes the back net (> 0: through it); rest: against the undeformed net.
    static double Penetration(double[] ball,WorldNet net,Geometry g,bool rest){
        int s=net.sign>=0?1:-1;double half=g.length/2,radius=R,depth=s*ball[0]-half,cy=ProbeBridge.DisplayHeight(ball[1]),cz=ball[2],worst=double.NegativeInfinity;
        if(depth+radius<WorldNetDeformation.Depth-.6)return depth+radius-WorldNetDeformation.Depth;
        var plane=new Vector3((float)(s*(half+WorldNetDeformation.Depth)),0,0);double planeDepth=s*(double)plane.x-half;
        for(int ring=0;ring<=3;ring++){double rr=radius*ring/3;int n=ring==0?1:8;for(int k=0;k<n;k++){
            double a=2*Math.PI*k/n,y=cy+rr*Math.Sin(a),z=cz+rr*Math.Cos(a);if(y<0||y>g.goalHeight||Math.Abs(z)>g.goalWidth/2)continue;
            plane.y=(float)y;plane.z=(float)z;double surface=rest?planeDepth:s*(double)WorldNetDeformation.Displace(plane,"back",net,g).x-half;
            worst=Math.Max(worst,depth+Math.Sqrt(radius*radius-rr*rr)-surface);}}
        return double.IsNegativeInfinity(worst)?depth+radius-planeDepth:worst;
    }

    // Controlled replica of the native rear-net goal tail (pinned in Pins), metres on the 68 x 44 picture: the ball
    // crosses the goal line at scene time 0 (speed toward the net, lateral speed, crossing z, native elevation, vertical speed).
    struct Shot {public double speed,lateral,z0,elevation,vh;}
    static bool RearHit(in Shot s,Geometry g,out double impact){
        double W=g.goalWidth,H=g.goalHeight,inf=double.PositiveInfinity;
        double rear=(2.2-R)/Math.Max(.001,Math.Abs(s.speed)),edge=s.lateral!=0?(Math.Sign(s.lateral)*(W/2-R)-s.z0)/s.lateral:inf;
        double c=s.elevation-(H-R),b=s.vh,disc=b*b+19.6*c,root=disc>=0?(b-Math.Sqrt(disc))/9.8:inf,roof=c>=0?0:b>0&&root>=0?root:inf;
        impact=Math.Max(.001,Math.Min(rear,Math.Min(edge>=0?edge:inf,roof)));
        return !(roof<=Math.Min(rear,edge))&&!(edge>=0&&edge<rear);
    }
    static void Tail(in Shot s,Geometry g,double impact,double sceneTime,double[] ball,WorldNet net){
        double W=g.goalWidth,H=g.goalHeight,time=Math.Min(sceneTime,2.45),t=Math.Min(time,impact),fall=Math.Max(0,time-impact),damp=(1-Math.Exp(-7*fall))/7,vh=s.vh-9.8*t;
        double depth=Math.Clamp(s.speed*t+s.speed*-.18*damp,0,2.2-R),z=Math.Clamp(s.z0+s.lateral*t+s.lateral*.12*damp,-(W/2-R),W/2-R);
        double elevation=Math.Clamp(Math.Max(.29,s.elevation+s.vh*t-4.9*t*t+vh*fall-4.9*fall*fall),.29,H-R),contact=Math.Max(.29,s.elevation+s.vh*impact-4.9*impact*impact);
        double age=Math.Max(0,time-impact),pulse=age/.06;
        ball[0]=g.length/2+depth;ball[1]=elevation;ball[2]=z;
        net.sign=1;net.z=s.z0+s.lateral*impact;net.height=contact-(.29-R)*Math.Clamp(1-(contact-.29),0,1);net.age=age;net.bulge=time>=impact?.6*pulse*Math.Exp(1-pulse):0;
    }
    static void Envelope(Geometry g,Checker check,List<string> notes){
        double worst=-1,worstRest=double.NegativeInfinity,gap=double.PositiveInfinity,outward=0,inward=0;int cases=0,samples=0;string at="";
        var a=new double[3];var b=new double[3];var shown=new double[3];var na=new WorldNet();var nb=new WorldNet();var mix=new WorldNet();
        foreach(double rate in new[]{20.0,60.0})foreach(double speed in new[]{2.5,4,7,12,20,32})foreach(double elevation in new[]{.29,.7,1.5,2.6})foreach(double z0 in new[]{0,3.0,4.5})foreach(double lateral in new[]{0,2.5}){
            var shot=new Shot{speed=speed,lateral=lateral,z0=z0,elevation=elevation,vh=0};if(!RearHit(shot,g,out double impact))continue;cases++;
            int frames=(int)Math.Floor(4.05*rate);Tail(shot,g,impact,0,a,na);
            for(int f=1;f<frames;f++){
                Tail(shot,g,impact,f/rate,b,nb);
                for(int q=0;q<4;q++){
                    double w=q/4.0;for(int k=0;k<3;k++)shown[k]=a[k]+(b[k]-a[k])*w;
                    mix.sign=1;mix.z=na.z+(nb.z-na.z)*w;mix.height=na.height+(nb.height-na.height)*w;mix.age=na.age+(nb.age-na.age)*w;mix.bulge=na.bulge+(nb.bulge-na.bulge)*w;
                    samples++;double p=Penetration(shown,mix,g,false);
                    if(p>worst){worst=p;at="speed "+speed.ToString(C)+" m/s, elevation "+elevation.ToString(C)+", z "+z0.ToString(C)+", lateral "+lateral.ToString(C)+", "+rate.ToString(C)+" Hz, age "+mix.age.ToString("0.000",C);}
                    worstRest=Math.Max(worstRest,Penetration(shown,mix,g,true));if(mix.age>0)gap=Math.Min(gap,-p);
                    var centre=new Vector3((float)(g.length/2+WorldNetDeformation.Depth),(float)mix.height,(float)mix.z);double off=WorldNetDeformation.Displace(centre,"back",mix,g).x-centre.x;outward=Math.Max(outward,off);inward=Math.Max(inward,-off);
                }
                Array.Copy(b,a,3);na.z=nb.z;na.height=nb.height;na.age=nb.age;na.bulge=nb.bulge;
            }
        }
        check(Producer,"Ball envelope on the replicated rear-net goal tail: the shown ball never passes the displaced back net by more than 3 cm",worst<=.03&&cases>100,worst,.03,cases+" rear-hit shots, "+samples+" shown pictures (20/60 Hz pictures, 4-step display blend); worst at "+at+"; against the rest net "+worstRest.ToString("0.0000",C)+" m; smallest gap after impact "+gap.ToString("0.0000",C)+" m");
        notes.Add("Controlled producer replica: impact-point displacement between "+(-inward).ToString("0.000",C)+" and "+outward.ToString("0.000",C)+" m over "+cases+" rear-hit shots; the native tail clamps the ball to 2.2-R behind the line, so only an inward net motion could pass it.");
    }

    // Recorded pictures: shown as WorldViewPlayback blends them; penetration with and without the deformation.
    static List<string> Folders(string repo){
        var list=new List<string>{Path.Combine(repo,"outputs/lowpoly-live-rollout-20261013/net-recordings")};
        var args=Environment.GetCommandLineArgs();for(int i=0;i<args.Length-1;i++)if(args[i]=="-d6netrecordings")list.Add(Path.IsPathRooted(args[i+1])?args[i+1]:Path.Combine(repo,args[i+1]));
        var env=Environment.GetEnvironmentVariable("D6_NET_RECORDINGS");if(!string.IsNullOrEmpty(env))list.Add(Path.IsPathRooted(env)?env:Path.Combine(repo,env));
        var found=new List<string>();foreach(var f in list)if(Directory.Exists(f)&&!found.Contains(Path.GetFullPath(f)))found.Add(Path.GetFullPath(f));return found;
    }
    // Every object whose first key is "schema":"d6-world-view-1" (pictures and configurations), in any nesting.
    static List<string> ViewObjects(string text){
        var list=new List<string>();int at=0;
        while((at=text.IndexOf("\"d6-world-view-1\"",at,StringComparison.Ordinal))>=0){
            int k=at-1;while(k>=0&&char.IsWhiteSpace(text[k]))k--;bool key=k>=0&&text[k]==':';k--;while(key&&k>=0&&char.IsWhiteSpace(text[k]))k--;
            key&=k>=7&&string.CompareOrdinal(text,k-7,"\"schema\"",0,8)==0;k-=8;while(key&&k>=0&&char.IsWhiteSpace(text[k]))k--;key&=k>=0&&text[k]=='{';
            if(!key){at++;continue;}
            int depth=0,end=-1;bool inString=false,escape=false;
            for(int j=k;j<text.Length;j++){char c=text[j];if(inString){if(escape)escape=false;else if(c=='\\')escape=true;else if(c=='"')inString=false;continue;}if(c=='"')inString=true;else if(c=='{')depth++;else if(c=='}'&&--depth==0){end=j;break;}}
            if(end<0)break;list.Add(text.Substring(k,end-k+1));at=end+1;
        }
        return list;
    }
    static Geometry CaptureGeometry(string folder,string file){
        // keeper-next naming: windows-<seed>-<size>-<players>-<nn>.json beside capture-<seed>-<size>-<players>.json.
        var parts=Path.GetFileNameWithoutExtension(file).Split('-');if(parts.Length<4)return null;
        var meta=Path.Combine(folder,"capture-"+parts[1]+"-"+parts[2]+"-"+parts[3]+".json");if(!File.Exists(meta))return null;
        var text=File.ReadAllText(meta);return Live(text.Contains("\"fieldSize\": \"large\"")||text.Contains("\"fieldSize\":\"large\"")?1.2:1);
    }
    static int Recordings(string folder,string source,bool current,Checker check,List<Recording> recordings,List<string> notes){
        if(!Directory.Exists(folder))return 0;int files=0;bool blendFailed=false;
        foreach(var file in Directory.GetFiles(folder,"*.json")){
            string name=Path.GetFileName(file);if(name.StartsWith("capture-",StringComparison.Ordinal))continue;
            var text=File.ReadAllText(file);if(text.IndexOf("\"netActive\":true",StringComparison.Ordinal)<0&&text.IndexOf("\"netActive\": true",StringComparison.Ordinal)<0)continue;
            Geometry g=null;var pictures=new List<WorldFrame>();
            foreach(var json in ViewObjects(text)){
                if(json.Contains("\"fixtureId\"")){var config=JsonUtility.FromJson<WorldConfig>(json);if(config?.geometry!=null&&config.geometry.goalWidth>0)g=config.geometry;continue;}
                var f=JsonUtility.FromJson<WorldFrame>(json);if(f?.ball!=null&&f.ball.Length==3)pictures.Add(f);
            }
            string geometryNote=g!=null?"configuration":"capture metadata";g??=CaptureGeometry(folder,name);if(g==null){g=Live(1);geometryNote="default 68 x 44 (no configuration or capture metadata)";}
            var rec=new Recording{file=name,source=source,geometry=geometryNote+" "+g.length.ToString("0.#",C)+" x "+g.width.ToString("0.#",C)+", goal "+g.goalWidth.ToString("0.###",C)+" x "+g.goalHeight.ToString("0.###",C),pictures=pictures.Count,penetration=double.NegativeInfinity,restPenetration=double.NegativeInfinity,added=double.NegativeInfinity};
            double[] last=null;WorldNet previous=null;
            for(int p=0;p<pictures.Count;p++){
                var b=pictures[p];if(b.netActive&&b.net!=null){rec.netPictures++;if(b.net.bulge>1e-4&&Math.Abs(b.net.bulge-V119(b.net.age))<1e-9)rec.v119Facts++;}
                var a=p>0&&pictures[p-1].session==b.session&&pictures[p-1].sequence<b.sequence?pictures[p-1]:null;
                bool cut=a==null||WorldViewPlayback.Cut(a,b);
                for(int q=cut?4:1;q<=4;q++){
                    WorldFrame f=b;
                    if(q<4){try{f=WorldViewPlayback.Blend(a,b,q/4.0);}catch(Exception){blendFailed=true;f=b;}}
                    if(!f.netActive||f.net==null){if(previous!=null){rec.endStep=Math.Max(rec.endStep,Largest(previous,g));previous=null;last=null;}continue;}
                    rec.samples++;double shown=Penetration(f.ball,f.net,g,false),rest=Penetration(f.ball,f.net,g,true);
                    rec.penetration=Math.Max(rec.penetration,shown);rec.restPenetration=Math.Max(rec.restPenetration,rest);rec.added=Math.Max(rec.added,Math.Max(0,shown)-Math.Max(0,rest));
                    var grid=Grid(f.net,g);rec.largest=Math.Max(rec.largest,Max(grid));rec.inward=Math.Max(rec.inward,-Min(grid));
                    if(last!=null)for(int k=0;k<grid.Length;k++)rec.largestStep=Math.Max(rec.largestStep,Math.Abs(grid[k]-last[k]));
                    last=grid;previous=new WorldNet{sign=f.net.sign,z=f.net.z,height=f.net.height,age=f.net.age,bulge=f.net.bulge};
                }
            }
            if(rec.netPictures==0)continue;files++;recordings.Add(rec);
            string detail=rec.netPictures+" net pictures ("+rec.v119Facts+" with rear-hit v119 facts), "+rec.samples+" shown samples; penetration "+rec.penetration.ToString("0.0000",C)+" m, at rest "+rec.restPenetration.ToString("0.0000",C)+" m; largest "+rec.largest.ToString("0.000",C)+" m, inward "+rec.inward.ToString("0.000",C)+" m, largest step "+rec.largestStep.ToString("0.000",C)+" m";
            check(Recorded,"Recorded "+name+": the deformation adds no more than 3 cm of ball penetration",rec.added<=.03,rec.added,.03,detail);
            if(current)check(Recorded,"Recorded "+name+": the shown ball passes the displaced back net by no more than 3 cm",rec.penetration<=.03,rec.penetration,.03,detail);
            check(Recorded,"Recorded "+name+": the net is at rest when the fact ends (no reset pop)",rec.endStep<=.001,rec.endStep,.001);
        }
        if(blendFailed)notes.Add("WorldViewPlayback.Blend rejected some recorded picture pairs in "+folder+"; those pictures were shown unblended.");
        if(!current&&files>0)notes.Add("keeper-next captures predate v119: their ball path was not clamped to the rest net, so a ground ball can rest up to "+(Math.Max(0,MaxRest(recordings))*100).ToString("0.0",C)+" cm beyond it with any net (inherited, not caused by the deformation; the current producer clamps the ball to 2.2-R).");
        return files;
    }
    static double MaxRest(List<Recording> list){double m=0;foreach(var r in list)m=Math.Max(m,r.restPenetration);return m;}
    // The back net on a 25 x 9 grid (displacement along its normal, m).
    static double[] Grid(WorldNet net,Geometry g){
        var grid=new double[25*9];int s=net.sign>=0?1:-1;var p=new Vector3((float)(s*(g.length/2+WorldNetDeformation.Depth)),0,0);
        for(int i=0;i<25;i++)for(int j=0;j<9;j++){p.z=(float)(-g.goalWidth/2+g.goalWidth*(i+.5)/25);p.y=(float)(g.goalHeight*(j+.5)/9);grid[i*9+j]=s*((double)WorldNetDeformation.Displace(p,"back",net,g).x-p.x);}
        return grid;
    }
    static double Largest(WorldNet net,Geometry g){double m=0;foreach(var v in Grid(net,g))m=Math.Max(m,Math.Abs(v));return m;}
    static double Max(double[] v){double m=double.NegativeInfinity;foreach(var x in v)m=Math.Max(m,x);return m;}
    static double Min(double[] v){double m=double.PositiveInfinity;foreach(var x in v)m=Math.Min(m,x);return m;}
}
}
#endif

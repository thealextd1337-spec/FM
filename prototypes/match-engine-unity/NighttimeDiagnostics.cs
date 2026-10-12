#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using System.Reflection;
using UnityEngine;
using UnityEngine.Profiling;
using Doppel6.Probe;
// Nighttime style evidence through the actual ProbeBridge.WorldCommand path.
// The same contract fixture, a fixed display-only player layout, the five
// match cameras of dist/world-pitch3d-v98.js (SmallViewDiagnostics.Aim) and
// close material cameras are rendered for a label ("baseline" before any
// style change, "candidate" after it). Eight home clubs cover all eight
// stadium archetypes; the GER-2 sample stadium additionally runs both kit
// scenarios, both qualities and three window sizes. Readability is measured
// on the rendered pixels at projected chest, ball and turf points. Nothing
// here sends a match state of its own: layout and frames are paused pictures.
// Needs a graphics device; Editor images are not WebGL or device evidence.
public static class NighttimeDiagnostics {
    // Home club, archetype comes from ClubStadiumProfiles.
    static readonly string[] Clubs={"GER-2","ENG-1","ENG-2","ITA-1","ESP-4","ENG-6","ESP-3","ITA-4"};
    const string SampleClub="GER-2";
    // Kit scenarios: the fixture kits (red stripes vs white) and the catalogue
    // colours of a dark (Torino) and a light (Roma) club with coloured keepers.
    static readonly (string name,string homeMain,string homeTrim,string awayMain,string awayTrim,string homeKeeper,string awayKeeper)[] Kits={
        ("fixture",null,null,null,null,null,null),
        ("dark-light","#1d2329","#f3f5f2","#a98bbb","#f3edda","#f2c230","#2f9e5a")};
    static readonly (int w,int h)[] Sizes={(1280,720),(844,390),(931,448)};
    // Display-only layout (x along the pitch, z across): keepers in their
    // goals, field players spread around a ground ball at the home midfielder.
    static readonly Vector3[] Layout={new Vector3(-31.2f,0,.6f),new Vector3(-14,0,-8),new Vector3(-12,0,9),new Vector3(-3,0,-2),new Vector3(4,0,12),new Vector3(8,0,-10),
        new Vector3(31.2f,0,-1),new Vector3(-6,0,3.5f),new Vector3(1.5f,0,-5.5f),new Vector3(10,0,3),new Vector3(16,0,-12),new Vector3(20,0,8)};
    static readonly Vector3 Ball=new Vector3(-2.1f,.29f,-1.4f);

    [Serializable] public class Shot {public string file,club,archetype,kits,quality,mode,size;public float sky,pitch,teamVsTurf0,teamVsTurf1,teamVsTeam,ballVsTurf,keeperVsTurf,darkKitLuma,lightKitLuma;}
    [Serializable] public class Scene {public string club,archetype,quality;public int renderers,materials,shadowCasters,triangles,stadiumTextures;public long stadiumTextureBytes;}
    [Serializable] class Report {public string label,sourceId,unity,device,note;public Shot[] shots;public Scene[] scenes;public string[] comparisons;}

    public static string Run(string repository,string outputFolder,string label,string compareFolder){
        var bridge=UnityEngine.Object.FindFirstObjectByType<ProbeBridge>()??throw new InvalidOperationException("ProbeBridge is missing in the open scene");
        var flags=BindingFlags.NonPublic|BindingFlags.Instance;var raw=File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json"));
        var folder=Path.Combine(repository,outputFolder??"outputs/style-demos/nighttime/editor/"+label);Directory.CreateDirectory(folder);
        var shots=new List<Shot>();var scenes=new List<Scene>();var comparisons=new List<string>();var camera=Camera.main;int sequence=1;bool log=Debug.unityLogger.logEnabled;
        void Drop(){var world=(Transform)typeof(ProbeBridge).GetField("world",flags).GetValue(bridge);if(world!=null)UnityEngine.Object.DestroyImmediate(world.gameObject);}
        void Send(WorldCommand c){Debug.unityLogger.logEnabled=false;try{bridge.WorldCommand(JsonUtility.ToJson(c).Replace("\"offside\":{\"lineX\":0.0}","\"offside\":null").Replace("\"offside\":{\"lineX\":0}","\"offside\":null"));}finally{Debug.unityLogger.logEnabled=log;}}
        WorldConfig Load(string club,string quality,int kit){
            var k=Kits[kit];var config=JsonUtility.FromJson<WorldConfig>(raw);
            config.teams[0].id=club;config.teams[0].home=true;config.teams[1].id="FRA-1";config.teams[1].home=false;config.quality=quality;
            if(k.homeMain!=null)foreach(var p in config.players){bool home=p.team==0;
                if(p.keeper){p.kit.main=home?k.homeKeeper:k.awayKeeper;p.kit.trim="#1d2329";p.kit.style="plain";}
                else{p.kit.main=home?k.homeMain:k.awayMain;p.kit.trim=home?k.homeTrim:k.awayTrim;}}
            config.session="nighttime-"+club+"-"+quality+"-"+k.name;config.initial.session=config.session;config.initial.phase="paused";config.initial.sequence=sequence=1;config.initial.offside=null;
            Arrange(config.initial,false);
            Drop();Send(new WorldCommand{kind="load",config=config});if(bridge.StadiumClub!=club)throw new InvalidOperationException("Stadium for "+club+" was not built");return config;
        }
        void Arrange(WorldFrame f,bool close){
            for(int i=0;i<f.players.Length&&i<Layout.Length;i++){var at=Layout[i];
                if(close)at=i==3?new Vector3(0,0,0):i==8?new Vector3(1.5f,0,.7f):i==7?new Vector3(-1.2f,0,1.6f):at+new Vector3(0,0,30);
                var ball=close?new Vector3(.75f,0,.25f):Ball;var d=new Vector3(ball.x-at.x,0,ball.z-at.z);if(d.sqrMagnitude<.01f)d=Vector3.right;d.Normalize();
                var p=f.players[i];p.position=new double[]{at.x,0,at.z};p.facing=new double[]{d.x,0,d.z};p.action="idle";p.moving=false;p.progress=0;p.duration=1;}
            f.ball=close?new double[]{.75,.29,.25}:new double[]{Ball.x,Ball.y,Ball.z};f.owner=f.players[3].id;f.ballOpacity=1;f.ballInFlight=false;
        }
        void Show(WorldConfig config,bool close,Vector3 position,Vector3 target,float fov){
            var frame=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(config.initial));frame.sequence=++sequence;frame.clock=10+sequence*.05;frame.phase="paused";frame.offside=null;
            Arrange(frame,close);frame.camera=new WorldCamera{position=new double[]{position.x,position.y,position.z},target=new double[]{target.x,target.y,target.z},fov=fov};
            Send(new WorldCommand{kind="frame",frame=frame});
        }
        Texture2D Capture(int w,int h,bool reduced){
            var baked=new List<(SkinnedMeshRenderer skin,GameObject go,Mesh mesh)>();
            foreach(var skin in UnityEngine.Object.FindObjectsByType<SkinnedMeshRenderer>(FindObjectsSortMode.None)){
                if(!skin.enabled||!skin.gameObject.activeInHierarchy)continue;var mesh=new Mesh();skin.BakeMesh(mesh);var go=new GameObject("D6 nighttime capture",typeof(MeshFilter),typeof(MeshRenderer));go.transform.SetParent(skin.transform,false);
                go.GetComponent<MeshFilter>().sharedMesh=mesh;var r=go.GetComponent<MeshRenderer>();r.sharedMaterials=skin.sharedMaterials;r.shadowCastingMode=skin.shadowCastingMode;skin.enabled=false;baked.Add((skin,go,mesh));
            }
            // Same MSAA as the page's quality: 4x standard, none reduced.
            var desc=new RenderTextureDescriptor(w,h,RenderTextureFormat.ARGB32,24){msaaSamples=reduced?1:4,sRGB=true};
            var rt=RenderTexture.GetTemporary(desc);float aspect=camera.aspect;camera.aspect=(float)w/h;camera.targetTexture=rt;camera.Render();camera.targetTexture=null;camera.aspect=aspect;
            var previous=RenderTexture.active;RenderTexture.active=rt;var tex=new Texture2D(w,h,TextureFormat.RGB24,false);tex.ReadPixels(new Rect(0,0,w,h),0,0);tex.Apply();RenderTexture.active=previous;RenderTexture.ReleaseTemporary(rt);
            foreach(var item in baked){item.skin.enabled=true;UnityEngine.Object.DestroyImmediate(item.go);UnityEngine.Object.DestroyImmediate(item.mesh);}return tex;
        }
        // Mean sRGB colour of a small pixel patch at a world point (null: off screen).
        Color? Sample(Texture2D tex,Vector3 world,int radius=1){
            float saved=camera.aspect;camera.aspect=(float)tex.width/tex.height;var v=camera.WorldToViewportPoint(world);camera.aspect=saved;
            if(v.z<=0||v.x<0||v.x>1||v.y<0||v.y>1)return null;int cx=Mathf.RoundToInt(v.x*(tex.width-1)),cy=Mathf.RoundToInt(v.y*(tex.height-1));Color sum=Color.clear;int n=0;
            for(int y=cy-radius;y<=cy+radius;y++)for(int x=cx-radius;x<=cx+radius;x++)if(x>=0&&y>=0&&x<tex.width&&y<tex.height){sum+=tex.GetPixel(x,y);n++;}return n>0?sum/n:(Color?)null;
        }
        float Luma(Color c)=>.2126f*c.r+.7152f*c.g+.0722f*c.b;
        float Distance(Color a,Color b)=>Mathf.Sqrt((a.r-b.r)*(a.r-b.r)+(a.g-b.g)*(a.g-b.g)+(a.b-b.b)*(a.b-b.b));
        float Region(Texture2D tex,float y0,float y1){double sum=0;int n=0;for(int y=Mathf.FloorToInt(y0*tex.height);y<Mathf.FloorToInt(y1*tex.height);y+=3)for(int x=0;x<tex.width;x+=5){sum+=Luma(tex.GetPixel(x,y));n++;}return n>0?(float)(sum/n):0;}
        Shot Measure(Texture2D tex,WorldConfig config,bool close){
            // Chest of each layout player against the turf 0.9 m beside the feet.
            var team=new List<float>[]{new List<float>(),new List<float>()};var kit=new List<Color>[]{new List<Color>(),new List<Color>()};var keepers=new List<float>();
            for(int i=0;i<Layout.Length&&i<config.players.Length;i++){
                var p=config.players[i];var at=close?(i==3?Vector3.zero:i==8?new Vector3(1.5f,0,.7f):i==7?new Vector3(-1.2f,0,1.6f):Layout[i]+new Vector3(0,0,30)):Layout[i];
                var chest=Sample(tex,at+Vector3.up*1.18f);var turf=Sample(tex,at+new Vector3(.9f,0,.9f),2);if(chest==null||turf==null)continue;
                if(p.keeper)keepers.Add(Distance(chest.Value,turf.Value));else{team[p.team].Add(Distance(chest.Value,turf.Value));kit[p.team].Add(chest.Value);}
            }
            Color Mean(List<Color> l){if(l.Count==0)return Color.clear;Color s=Color.clear;foreach(var c in l)s+=c;return s/l.Count;}
            float Avg(List<float> l){if(l.Count==0)return -1;float s=0;foreach(var x in l)s+=x;return s/l.Count;}
            var ballAt=close?new Vector3(.75f,.11f,.25f):new Vector3(Ball.x,.11f,Ball.z);var ball=Sample(tex,ballAt,0);var ballTurf=Sample(tex,ballAt+new Vector3(.6f,-.11f,.6f),2);
            var k0=Mean(kit[0]);var k1=Mean(kit[1]);
            return new Shot{sky=Region(tex,.88f,1f),pitch=Region(tex,.3f,.6f),teamVsTurf0=Avg(team[0]),teamVsTurf1=Avg(team[1]),teamVsTeam=kit[0].Count>0&&kit[1].Count>0?Distance(k0,k1):-1,ballVsTurf=ball!=null&&ballTurf!=null?Distance(ball.Value,ballTurf.Value):-1,keeperVsTurf=Avg(keepers),darkKitLuma=kit[0].Count>0&&kit[1].Count>0?Mathf.Min(Luma(k0),Luma(k1)):-1,lightKitLuma=kit[0].Count>0&&kit[1].Count>0?Mathf.Max(Luma(k0),Luma(k1)):-1};
        }
        Scene Census(string club,string quality){
            var world=(Transform)typeof(ProbeBridge).GetField("world",flags).GetValue(bridge);var s=new Scene{club=club,archetype=bridge.StadiumArchetype,quality=quality};var mats=new HashSet<Material>();
            foreach(var r in world.GetComponentsInChildren<Renderer>()){if(!r.enabled||!r.gameObject.activeInHierarchy)continue;s.renderers++;if(r.shadowCastingMode!=UnityEngine.Rendering.ShadowCastingMode.Off)s.shadowCasters++;foreach(var m in r.sharedMaterials)if(m!=null)mats.Add(m);
                var mesh=r is SkinnedMeshRenderer skin?skin.sharedMesh:r.GetComponent<MeshFilter>()?.sharedMesh;if(mesh!=null)for(int k=0;k<mesh.subMeshCount;k++)s.triangles+=(int)(mesh.GetIndexCount(k)/3);}
            s.materials=mats.Count;var textures=(List<Texture2D>)typeof(ProbeBridge).GetField("stadiumTextures",flags).GetValue(bridge);foreach(var t in textures)if(t!=null){s.stadiumTextures++;s.stadiumTextureBytes+=Profiler.GetRuntimeMemorySizeLong(t);}
            return s;
        }
        void Save(Texture2D tex,Shot shot){
            File.WriteAllBytes(Path.Combine(folder,shot.file),tex.EncodeToPNG());shots.Add(shot);
            // Side-by-side with the same shot of the comparison label (left: comparison, right: this label).
            if(compareFolder!=null){var other=Path.Combine(repository,compareFolder,shot.file.Replace(label+"-",Path.GetFileName(compareFolder.TrimEnd('/','\\'))+"-"));
                if(File.Exists(other)){var before=new Texture2D(2,2);before.LoadImage(File.ReadAllBytes(other));if(before.width==tex.width&&before.height==tex.height){
                    var pair=new Texture2D(tex.width*2+8,tex.height,TextureFormat.RGB24,false);var fill=new Color[pair.width*pair.height];for(int i=0;i<fill.Length;i++)fill[i]=Color.black;pair.SetPixels(fill);
                    pair.SetPixels(0,0,tex.width,tex.height,before.GetPixels());pair.SetPixels(tex.width+8,0,tex.width,tex.height,tex.GetPixels());pair.Apply();
                    var dir=Path.Combine(folder,"compare");Directory.CreateDirectory(dir);var name="compare-"+shot.file;File.WriteAllBytes(Path.Combine(dir,name),pair.EncodeToPNG());comparisons.Add(name);UnityEngine.Object.DestroyImmediate(pair);}
                UnityEngine.Object.DestroyImmediate(before);}}
            UnityEngine.Object.DestroyImmediate(tex);
        }
        void Render(WorldConfig config,string club,string kits,string quality,string mode,int w,int h){
            bool close=mode.StartsWith("close");Vector3 position,target;float fov;
            if(mode=="close-pair"){position=new Vector3(.5f,2.4f,8.8f);target=new Vector3(.3f,1.25f,.4f);fov=36;}
            else if(mode=="close-keeper"){var k=Layout[0];position=k+new Vector3(7.4f,2.6f,4.4f);target=k+new Vector3(0,1.2f,0);fov=36;}
            else{var aim=SmallViewDiagnostics.Aim(new Vector3(Ball.x,0,Ball.z),Ball.y,mode,(float)w/h);position=aim.position;target=aim.target;fov=aim.fov;}
            Show(config,mode=="close-pair",position,target,fov);
            var tex=Capture(w,h,quality=="reduced");var shot=Measure(tex,config,mode=="close-pair");
            shot.file=$"{label}-{club}-{bridge.StadiumArchetype}-{kits}-{quality}-{mode}-{w}x{h}.png";shot.club=club;shot.archetype=bridge.StadiumArchetype;shot.kits=kits;shot.quality=quality;shot.mode=mode;shot.size=w+"x"+h;Save(tex,shot);
        }
        try{
            // Warm-up: the first world of a fresh Editor scene can render before
            // its kit materials settle; that picture is discarded.
            {var config=Load(Clubs[0],"standard",0);var aim=SmallViewDiagnostics.Aim(new Vector3(Ball.x,0,Ball.z),Ball.y,"follow",16f/9);Show(config,false,aim.position,aim.target,aim.fov);UnityEngine.Object.DestroyImmediate(Capture(320,180,false));}
            foreach(var club in Clubs){
                bool sample=club==SampleClub;
                foreach(var quality in new[]{"standard","reduced"})for(int kit=0;kit<(sample?Kits.Length:1);kit++){
                    var config=Load(club,quality,kit);if(kit==0)scenes.Add(Census(club,quality));
                    string kits=Kits[kit].name;
                    if(sample){
                        foreach(var mode in new[]{"follow","wide","sideline","diagonal","goal","close-pair","close-keeper"})Render(config,club,kits,quality,mode,1280,720);
                        foreach(var (w,h) in Sizes)if(w!=1280)foreach(var mode in new[]{"follow","wide"})Render(config,club,kits,quality,mode,w,h);
                    }else if(quality=="standard"){foreach(var mode in new[]{"follow","wide","goal"})Render(config,club,kits,quality,mode,1280,720);Render(config,club,kits,quality,"follow",844,390);}
                    else Render(config,club,kits,quality,"follow",844,390);
                }
            }
        }finally{Drop();typeof(ProbeBridge).GetMethod("RestoreProbeLighting",flags).Invoke(bridge,null);camera.targetTexture=null;}
        var report=new Report{label=label,sourceId=ProbeBuildIdentity.SourceId,unity=Application.unityVersion,device=SystemInfo.graphicsDeviceType.ToString(),
            note="Paused display-only layout of the contract fixture through ProbeBridge.WorldCommand; cameras from SmallViewDiagnostics.Aim (1:1 v98CameraAim, near 60) plus two close material cameras. Colour distances are sRGB Euclidean (0..1.73) between 3x3 chest samples and 5x5 turf samples 0.9 m beside the feet; sky/pitch are mean luma of the top 12 % and of the 30-60 % image band. Editor images with baked current skinning, not WebGL or device GPU evidence.",
            shots=shots.ToArray(),scenes=scenes.ToArray(),comparisons=comparisons.ToArray()};
        File.WriteAllText(Path.Combine(folder,"nighttime-"+label+".json"),JsonUtility.ToJson(report,true));
        return "label="+label+" shots="+shots.Count+" scenes="+scenes.Count+" comparisons="+comparisons.Count+" device="+SystemInfo.graphicsDeviceType;
    }
}
#endif

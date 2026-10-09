#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using System.Reflection;
using UnityEngine;
using UnityEditor;
using Doppel6.Probe;
// Rendered evidence through the actual ProbeBridge.WorldCommand path in the
// open probe scene: club stadiums from the match cameras and duel poses from a
// close camera. Needs a graphics device (no -nographics). The scene is never
// saved; each world is removed before the next load.
public static class UnityEvidenceDiagnostics {
    static readonly string[] Clubs={"ENG-1","ENG-2","ITA-1","ENG-3","ESP-4","ENG-6","ESP-3","ITA-4"};
    const int Width=1280,Height=720;
    public static string Run(string repository){
        var bridge=UnityEngine.Object.FindFirstObjectByType<ProbeBridge>()??throw new InvalidOperationException("ProbeBridge is missing in the open scene");
        var flags=BindingFlags.NonPublic|BindingFlags.Instance;var raw=File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json"));
        var folder=Path.Combine(repository,"outputs/3d-quality/unity/renders");Directory.CreateDirectory(folder);var written=new List<string>();
        var camera=Camera.main;int sequence=1;bool log=Debug.unityLogger.logEnabled;
        void Drop(){var world=(Transform)typeof(ProbeBridge).GetField("world",flags).GetValue(bridge);if(world!=null)UnityEngine.Object.DestroyImmediate(world.gameObject);}
        WorldConfig Load(string club,string quality){
            var config=JsonUtility.FromJson<WorldConfig>(raw);config.teams[0].id=club;config.teams[0].home=true;config.teams[1].id="FRA-1";config.teams[1].home=false;config.quality=quality;
            config.session="evidence-"+club+"-"+quality;config.initial.session=config.session;config.initial.phase="paused";config.initial.sequence=sequence=1;
            Drop();Debug.unityLogger.logEnabled=false;
            try{bridge.WorldCommand(JsonUtility.ToJson(new WorldCommand{kind="load",config=config}));}finally{Debug.unityLogger.logEnabled=log;}
            if(bridge.StadiumClub!=club)throw new InvalidOperationException("Stadium for "+club+" was not built");return config;
        }
        void Show(WorldConfig config,Action<WorldFrame> change){
            var frame=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(config.initial));frame.sequence=++sequence;frame.clock=10+sequence*.05;frame.phase="paused";change(frame);
            Debug.unityLogger.logEnabled=false;try{bridge.WorldCommand(JsonUtility.ToJson(new WorldCommand{kind="frame",frame=frame}));}finally{Debug.unityLogger.logEnabled=log;}
        }
        Texture2D Capture(int w,int h){
            // Several poses are sampled within one Editor frame. Its renderer
            // caches GPU skinning for that frame, so explicitly bake the current
            // bone pose for this diagnostic capture, using the same live mesh,
            // materials and transforms. WebGL updates ordinary skinning per frame.
            var baked=new List<(SkinnedMeshRenderer skin,GameObject go,Mesh mesh)>();
            foreach(var skin in UnityEngine.Object.FindObjectsByType<SkinnedMeshRenderer>(FindObjectsSortMode.None)){
                if(!skin.enabled||!skin.gameObject.activeInHierarchy)continue;
                var mesh=new Mesh();skin.BakeMesh(mesh);var go=new GameObject("D6 current-pose capture",typeof(MeshFilter),typeof(MeshRenderer));go.transform.SetParent(skin.transform,false);
                go.GetComponent<MeshFilter>().sharedMesh=mesh;var renderer=go.GetComponent<MeshRenderer>();renderer.sharedMaterials=skin.sharedMaterials;renderer.shadowCastingMode=skin.shadowCastingMode;skin.enabled=false;baked.Add((skin,go,mesh));
            }
            var rt=RenderTexture.GetTemporary(w,h,24,RenderTextureFormat.ARGB32);camera.aspect=(float)w/h;camera.targetTexture=rt;camera.Render();camera.targetTexture=null;
            var previous=RenderTexture.active;RenderTexture.active=rt;var tex=new Texture2D(w,h,TextureFormat.RGB24,false);tex.ReadPixels(new Rect(0,0,w,h),0,0);tex.Apply();RenderTexture.active=previous;RenderTexture.ReleaseTemporary(rt);
            foreach(var item in baked){item.skin.enabled=true;UnityEngine.Object.DestroyImmediate(item.go);UnityEngine.Object.DestroyImmediate(item.mesh);}return tex;
        }
        void Save(Texture2D tex,string name){File.WriteAllBytes(Path.Combine(folder,name),tex.EncodeToPNG());written.Add(name);UnityEngine.Object.DestroyImmediate(tex);}
        // Landscape match cameras from dist/world-pitch3d-v98.js at the default view distance.
        (double[] p,double[] t,double fov) Preset(string mode){
            switch(mode){
                case "wide":return (new double[]{0,32*1.0,49*1.0-2*0},new double[]{0,0,-2},46);
                case "goal":return (new double[]{-49,19,9},new double[]{0,0,0},42);
                case "diagonal":return (new double[]{-22,23,32},new double[]{0,0,0},42);
                case "sideline":return (new double[]{0,13,31},new double[]{0,0,0},42);
                default:return (new double[]{0,21,31},new double[]{0,0,0},42);
            }
        }
        try{
            foreach(var club in Clubs){
                var config=Load(club,"standard");
                foreach(var mode in club=="ENG-2"?new[]{"follow","wide","sideline","diagonal","goal"}:new[]{"follow","wide","goal"}){
                    var preset=Preset(mode);Show(config,f=>{f.camera.position=preset.p;f.camera.target=preset.t;f.camera.fov=preset.fov;});
                    Save(Capture(Width,Height),$"stadium-{club}-{bridge.StadiumArchetype}-{mode}.png");
                }
            }
            {
                var config=Load("ENG-2","reduced");var preset=Preset("follow");Show(config,f=>{f.camera.position=preset.p;f.camera.target=preset.t;f.camera.fov=preset.fov;});
                Save(Capture(Width,Height),"stadium-ENG-2-modern-ring-follow-reduced.png");
            }
            // Duel strip: slide, recovery, standing tackle and foul offender on one
            // field player with the actual contact point, from a close camera.
            {
                var config=Load("ENG-1","standard");var index=Array.FindIndex(config.initial.players,p=>!Array.Find(config.players,q=>q.id==p.id).keeper);var id=config.initial.players[index].id;
                var stages=new (string action,double progress,double duration,string label)[]{("idle",0,1,"run-up"),("slide",.12,.65,"slide entry"),("slide",.55,.65,"slide contact"),("slide",1,.65,"slide end"),("slideRecovery",.35,.6,"recovery"),("slideRecovery",.85,.6,"recovery end"),("tackle",0,.48,"tackle contact"),("tackle",.6,.48,"tackle follow"),("foulOffender",.12,1,"offender lunge"),("foulOffender",.6,1,"offender stumble")};
                const int tw=480,th=360;var sheet=new Texture2D(tw*5,th*2,TextureFormat.RGB24,false);
                for(int s=0;s<stages.Length;s++){
                    var stage=stages[s];
                    foreach(var side in new[]{"side","front"}){
                        Show(config,f=>{
                            var me=f.players[index];me.position=new double[]{0,0,0};me.facing=new double[]{1,0,0};me.action=stage.action;me.actionId=stage.action.StartsWith("slide")?"slide:"+id:stage.action+"-evidence";me.progress=stage.progress;me.duration=stage.duration;
                            me.contactPoint=stage.action=="slide"||stage.action=="slideRecovery"?new double[]{1.25,.29,.15}:stage.action=="tackle"?new double[]{.75,.29,.18}:null;
                            for(int k=0;k<f.players.Length;k++)if(k!=index)f.players[k].position=new double[]{-20+k*2,0,15};
                            f.ball=stage.action=="tackle"||stage.action.StartsWith("slide")?new double[]{1.3,.29,.15}:new double[]{3,.29,0};
                            f.camera.position=side=="side"?new double[]{.6,1.5,5.2}:new double[]{4.8,1.6,1.8};f.camera.target=new double[]{.5,.85,0};f.camera.fov=40;
                        });
                        var tex=Capture(tw,th);
                        if(side=="side")sheet.SetPixels(s%5*tw,(1-s/5)*th,tw,th,tex.GetPixels());
                        Save(tex,$"duel-{s:00}-{stage.action}-{stage.progress:0.00}-{side}.png");
                    }
                }
                sheet.Apply();Save(sheet,"duel-sheet-side.png");
            }
        }finally{
            Drop();typeof(ProbeBridge).GetMethod("RestoreProbeLighting",flags).Invoke(bridge,null);camera.targetTexture=null;
        }
        File.WriteAllText(Path.Combine(folder,"renders.json"),JsonUtility.ToJson(new Listing{sourceId=ProbeBuildIdentity.SourceId,unity=Application.unityVersion,device=SystemInfo.graphicsDeviceType.ToString(),skinSampling="Current world mesh baked from live bones for each same-Editor-frame capture; no claim of WebGL GPU skinning validation",files=written.ToArray()},true));
        return "renders="+written.Count+" device="+SystemInfo.graphicsDeviceType;
    }
    [Serializable] class Listing {public string sourceId,unity,device,skinSampling;public string[] files;}
}
#endif

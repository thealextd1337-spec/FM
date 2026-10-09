#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using System.Reflection;
using UnityEngine;
using Doppel6.Probe;
// Iteration 117 evidence through the actual ProbeBridge.WorldCommand path:
// club identity in the match cameras (same clubs and cameras as the earlier
// stadium renders), aerial/throw/kick/keeper pose strips and the ball marker
// measured against the actually rendered ball pixels. Needs a graphics device.
public static class IterationEvidenceDiagnostics {
    const int Width=1280,Height=720;
    [Serializable] class Marker {public string camera;public float x,y,depth,diameter,measuredDiameter,measuredX,measuredY;public bool visible;}
    [Serializable] class Listing {public string sourceId,unity,device,skinSampling,comparableBefore;public string[] files;public Marker[] markers;}
    public static string Run(string repository){
        var bridge=UnityEngine.Object.FindFirstObjectByType<ProbeBridge>()??throw new InvalidOperationException("ProbeBridge is missing in the open scene");
        var flags=BindingFlags.NonPublic|BindingFlags.Instance;var raw=File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json"));
        var folder=Path.Combine(repository,"outputs/3d-quality/iteration-117/renders");Directory.CreateDirectory(folder);var written=new List<string>();var markers=new List<Marker>();
        var camera=Camera.main;int sequence=1;bool log=Debug.unityLogger.logEnabled;
        void Drop(){var world=(Transform)typeof(ProbeBridge).GetField("world",flags).GetValue(bridge);if(world!=null)UnityEngine.Object.DestroyImmediate(world.gameObject);}
        WorldConfig Load(string club,string quality){
            var config=JsonUtility.FromJson<WorldConfig>(raw);config.teams[0].id=club;config.teams[0].home=true;config.teams[1].id="FRA-1";config.teams[1].home=false;config.quality=quality;
            config.session="iteration117-"+club+"-"+quality;config.initial.session=config.session;config.initial.phase="paused";config.initial.sequence=sequence=1;
            Drop();Debug.unityLogger.logEnabled=false;
            try{bridge.WorldCommand(JsonUtility.ToJson(new WorldCommand{kind="load",config=config}));}finally{Debug.unityLogger.logEnabled=log;}
            if(bridge.StadiumClub!=club)throw new InvalidOperationException("Stadium for "+club+" was not built");return config;
        }
        void Show(WorldConfig config,Action<WorldFrame> change){
            var frame=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(config.initial));frame.sequence=++sequence;frame.clock=10+sequence*.05;frame.phase="paused";change(frame);
            Debug.unityLogger.logEnabled=false;try{bridge.WorldCommand(JsonUtility.ToJson(new WorldCommand{kind="frame",frame=frame}));}finally{Debug.unityLogger.logEnabled=log;}
        }
        Texture2D Capture(int w,int h){
            // Same-Editor-frame poses: bake the live bones as UnityEvidenceDiagnostics does.
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
        (double[] p,double[] t,double fov) Preset(string mode){
            switch(mode){
                case "wide":return (new double[]{0,32,49},new double[]{0,0,-2},46);
                case "diagonal":return (new double[]{-22,23,32},new double[]{0,0,0},42);
                default:return (new double[]{0,21,31},new double[]{0,0,0},42);
            }
        }
        try{
            // The first capture after the Editor starts renders some new stadium
            // materials wrongly (measured: ENG-1 first load vs its later reload).
            // One discarded warm-up capture precedes the evidence.
            {var warm=Load("ENG-2","standard");var preset=Preset("follow");Show(warm,f=>{f.camera.position=preset.p;f.camera.target=preset.t;f.camera.fov=preset.fov;});UnityEngine.Object.DestroyImmediate(Capture(Width,Height));UnityEngine.Object.DestroyImmediate(Capture(Width,Height));}
            // Club identity: the earlier stadium renders used the same clubs and cameras.
            foreach(var club in new[]{"ENG-1","ITA-1","ESP-4","ENG-6"}){
                var config=Load(club,"standard");
                foreach(var mode in club=="ENG-1"||club=="ITA-1"?new[]{"follow","wide"}:new[]{"follow"}){
                    var preset=Preset(mode);Show(config,f=>{f.camera.position=preset.p;f.camera.target=preset.t;f.camera.fov=preset.fov;});
                    Save(Capture(Width,Height),$"identity-{club}-{bridge.StadiumArchetype}-{StadiumArchitecture.IdentityPatterns[bridge.StadiumPlan.Identity]}-{mode}.png");
                }
            }
            {
                var config=Load("ENG-1","reduced");var preset=Preset("follow");Show(config,f=>{f.camera.position=preset.p;f.camera.target=preset.t;f.camera.fov=preset.fov;});
                Save(Capture(Width,Height),$"identity-ENG-1-{bridge.StadiumArchetype}-follow-reduced.png");
            }
            // Ball marker against the rendered ball: the same frame with and without
            // the ball sphere; the changed pixels are the ball silhouette.
            {
                var config=Load("ENG-2","standard");var ballView=(Transform)typeof(ProbeBridge).GetField("ballView",flags).GetValue(bridge);var ballRenderer=ballView.GetComponent<Renderer>();
                foreach(var (mode,ball) in new[]{("follow",new double[]{6,.29,-4}),("wide",new double[]{-18,.29,10}),("diagonal",new double[]{10,2.2,-6})}){
                    var preset=Preset(mode);Show(config,f=>{f.camera.position=preset.p;f.camera.target=preset.t;f.camera.fov=preset.fov;f.ball=ball;f.ballOpacity=1;});
                    var shadow=ballRenderer.shadowCastingMode;ballRenderer.shadowCastingMode=UnityEngine.Rendering.ShadowCastingMode.Off;
                    var with=Capture(Width,Height);var marker=ProbeBridge.BallMarker(camera,ballView.position,ballView.lossyScale.x*.5f,ballView.gameObject.activeInHierarchy,Height);
                    ballView.gameObject.SetActive(false);var without=Capture(Width,Height);ballView.gameObject.SetActive(true);ballRenderer.shadowCastingMode=shadow;
                    int cx=Mathf.RoundToInt(marker.x*Width),cy=Mathf.RoundToInt((1-marker.y)*Height),r=Mathf.CeilToInt(marker.diameter*2+4);int minX=int.MaxValue,maxX=-1,minY=int.MaxValue,maxY=-1;
                    var a=with.GetPixels32();var b=without.GetPixels32();
                    for(int y=Math.Max(0,cy-r);y<Math.Min(Height,cy+r);y++)for(int x=Math.Max(0,cx-r);x<Math.Min(Width,cx+r);x++){var p=a[y*Width+x];var q=b[y*Width+x];if(Math.Abs(p.r-q.r)+Math.Abs(p.g-q.g)+Math.Abs(p.b-q.b)>24){minX=Math.Min(minX,x);maxX=Math.Max(maxX,x);minY=Math.Min(minY,y);maxY=Math.Max(maxY,y);}}
                    float measured=maxX<0?0:Mathf.Max(maxX-minX+1,maxY-minY+1);
                    markers.Add(new Marker{camera=mode,x=marker.x,y=marker.y,depth=marker.depth,diameter=marker.diameter,visible=marker.visible,measuredDiameter=measured,measuredX=maxX<0?-1:(minX+maxX+1)/2f/Width,measuredY=maxX<0?-1:1-(minY+maxY+1)/2f/Height});
                    UnityEngine.Object.DestroyImmediate(without);Save(with,$"ball-marker-{mode}.png");
                }
            }
            // Pose strips on one field player (and the keeper), side camera.
            {
                var config=Load("ENG-1","standard");var field=Array.FindIndex(config.initial.players,p=>!Array.Find(config.players,q=>q.id==p.id).keeper);var keeper=Array.FindIndex(config.initial.players,p=>Array.Find(config.players,q=>q.id==p.id).keeper);
                void Strip(string name,(string action,double progress,double duration,double[] contact,double[] ball,bool holding,double pickup,bool aerial,int who,double yaw,string label)[] stages){
                    const int tw=420,th=360;var sheet=new Texture2D(tw*stages.Length,th,TextureFormat.RGB24,false);
                    for(int s=0;s<stages.Length;s++){
                        var stage=stages[s];int index=stage.who==1?keeper:field;
                        Show(config,f=>{
                            var me=f.players[index];var facing=Quaternion.Euler(0,(float)stage.yaw,0)*Vector3.forward;
                            me.position=new double[]{0,0,0};me.facing=new double[]{facing.x,0,facing.z};me.action=stage.action;me.actionId=stage.action+"-evidence";me.progress=stage.progress;me.duration=stage.duration;me.contactPoint=stage.contact;me.holding=stage.holding;me.pickup=stage.pickup;me.aerial=stage.aerial;
                            for(int k=0;k<f.players.Length;k++)if(k!=index)f.players[k].position=new double[]{-20+k*2,0,15};
                            f.ball=stage.ball;f.ballOpacity=1;f.camera.position=new double[]{.4,1.6,7.4};f.camera.target=new double[]{.4,1.25,0};f.camera.fov=36;
                        });
                        var tex=Capture(tw,th);sheet.SetPixels(s*tw,0,tw,th,tex.GetPixels());Save(tex,$"{name}-{s:00}-{stage.label}.png");
                    }
                    sheet.Apply();Save(sheet,$"{name}-sheet.png");
                }
                double[] H=new double[]{.55,2.15,0};
                Strip("aerial",new (string,double,double,double[],double[],bool,double,bool,int,double,string)[]{("airReady",.15,1.0,H,new double[]{1.6,2.6,0},false,-1.0,false,0,90.0,"prepare"),("airReady",1.0,1.0,H,H,false,-1.0,false,0,90.0,"takeoff"),("header",0.0,.62,H,H,false,-1.0,false,0,90.0,"contact"),("header",.4,.62,H,new double[]{-1,2.4,0},false,-1.0,false,0,90.0,"descent"),("header",.8,.62,H,new double[]{-3,2.6,0},false,-1.0,false,0,90.0,"landing"),("airLand",.2,.48,H,new double[]{-1,2.4,0},false,-1.0,false,0,90.0,"loser-air"),("header",0.0,.62,new double[]{-.55,2.15,0},new double[]{-.55,2.15,0},false,-1.0,false,0,-90.0,"contact-other-way")});
                Strip("throw",new (string,double,double,double[],double[],bool,double,bool,int,double,string)[]{("throw",.1,1.0,null,new double[]{.35,.29,0},true,.15,false,0,90.0,"pickup"),("throw",.7,1.0,null,new double[]{.05,2.05,0},true,1.0,false,0,90.0,"overhead"),("throw",.97,1.0,null,new double[]{-.1,2.1,0},true,1.0,false,0,90.0,"arch"),("throw",.3,1.0,null,new double[]{1.4,2.3,0},false,-1.0,false,0,90.0,"release"),("throw",.8,1.0,null,new double[]{3.5,2.5,0},false,-1.0,false,0,90.0,"settle")});
                Strip("kick",new (string,double,double,double[],double[],bool,double,bool,int,double,string)[]{("cross",.03,.78,null,new double[]{.6,.29,0},false,-1.0,false,0,90.0,"cross-contact"),("cross",.28,.78,null,new double[]{4,1.2,0},false,-1.0,false,0,90.0,"cross-follow"),("volley",.0,.6,new double[]{.6,.7,0},new double[]{.6,.7,0},false,-1.0,false,0,90.0,"volley-contact"),("volley",.37,.6,null,new double[]{5,1,0},false,-1.0,false,0,90.0,"volley-follow"),("goalKick",.22,1.0,null,new double[]{4,.8,0},false,-1.0,false,1,90.0,"goal-kick-follow")});
                Strip("keeper",new (string,double,double,double[],double[],bool,double,bool,int,double,string)[]{("save",.9,1.0,new double[]{1.41,.6,1.41},new double[]{1.41,.6,1.41},false,-1.0,false,1,45.0,"diagonal-ahead"),("save",.9,1.0,new double[]{1.2,.6,-1.2},new double[]{1.2,.6,-1.2},false,-1.0,false,1,45.0,"diagonal-right"),("save",.9,1.0,new double[]{-1.2,.6,1.2},new double[]{-1.2,.6,1.2},false,-1.0,false,1,45.0,"diagonal-left")});
            }
        }finally{
            Drop();typeof(ProbeBridge).GetMethod("RestoreProbeLighting",flags).Invoke(bridge,null);camera.targetTexture=null;
        }
        File.WriteAllText(Path.Combine(folder,"renders.json"),JsonUtility.ToJson(new Listing{sourceId=ProbeBuildIdentity.SourceId,unity=Application.unityVersion,device=SystemInfo.graphicsDeviceType.ToString(),skinSampling="Current world mesh baked from live bones for each same-Editor-frame capture; no claim of WebGL GPU skinning validation",comparableBefore="outputs/3d-quality/unity/renders/stadium-{ENG-1-civic-bowl,ITA-1-industrial-shed,ESP-4-urban-court,ENG-6-garden-ground}-follow.png (Release 115 stadium renders, same cameras)",files=written.ToArray(),markers=markers.ToArray()},true));
        return "renders="+written.Count+" markers="+markers.Count+" device="+SystemInfo.graphicsDeviceType;
    }
}
#endif

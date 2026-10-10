#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using System.Reflection;
using UnityEngine;
using Doppel6.Probe;
// Small mobile views through the actual ProbeBridge.WorldCommand path: four
// structurally different home stadiums (Roma ITA-3 civic-bowl, Milano ITA-2
// modern-ring, Torino ITA-1 industrial-shed, Bologna ITA-4 hillside-ground)
// with the home club's catalogue colours (dist/world-catalog-v61.js names,
// dist/world-foundation-v61.js hex) on the home kit, the five match
// cameras of dist/world-pitch3d-v98.js (v98CameraAim, ported 1:1 below and
// fed only with the ball position), standard and reduced quality, at
// 844x390, 931x448 and 1280x720. Measures the projected ball and near
// touchline against a protected lower band (bottom 12 % incl. HUD), the
// camera target shift a screen-space guard would need, and stadium resource
// release over repeated loads. Unity renders what the page sends; the camera
// itself stays the browser's (Root). Needs a graphics device for images.
public static class SmallViewDiagnostics {
    public const float ProtectedBand=.12f,BallMargin=.02f;
    static readonly (string club,string city,string name,string main,string trim)[] Clubs={("ITA-3","Roma","Roma Capitol FC","#a98bbb","#f3edda"),("ITA-2","Milano","Milano Ferro FC","#326db7","#1d2329"),("ITA-1","Torino","Torino Centrale FC","#1d2329","#f3f5f2"),("ITA-4","Bologna","Bologna Collina AC","#727b47","#f3f5f2")};
    static readonly (int w,int h)[] Sizes={(844,390),(931,448),(1280,720)};
    static readonly string[] Modes={"follow","wide","sideline","diagonal","goal"};
    [Serializable] public class View {public string club,city,archetype,quality,mode,size,ball;public float ballViewportY,ballViewportX,nearLineViewportY,cornerViewportY,neededTargetShift;public bool ballInBand,ballOffscreen,lineInBand;}
    [Serializable] public class Resource {public string club;public int meshes,materials,gameObjects;}
    [Serializable] class Report {public string sourceId,unity,device,note;public View[] views;public Resource[] resources;public string[] images;public int ballInBand,ballOffscreen;}
    // 1:1 port of v98CameraAim (ball: x along the pitch, height, z across; near=60).
    // guard: proposed near-touchline guard for Root (not in dist): follow and
    // sideline pan across the pitch by max(0, z - GuardFrom) * GuardShare.
    public const float GuardFrom=13,GuardShare=.65f;
    public static (Vector3 position,Vector3 target,float fov) Aim(Vector3 ball,float height,string mode,float aspect,float near=60,bool guard=false){
        float Limit(float v,float a,float b)=>Mathf.Max(a,Mathf.Min(b,v));
        float fov=mode=="wide"?46:42;float adapted=2*Mathf.Atan(Mathf.Tan(fov*Mathf.PI/360)*Mathf.Min(1,1.85f/aspect))*180/Mathf.PI;
        float halfCentre=17*(float)Math.Tanh(ball.x/8),beyond=Mathf.Max(0,Mathf.Abs(ball.x)-17);
        var tracked=new Vector3(halfCentre*.65f+ball.x*.35f+Mathf.Sign(ball.x)*Mathf.Min(4,beyond*.18f),Mathf.Min(1.2f,Mathf.Max(0,height-.29f)*.18f),Limit(ball.z*.35f,-6.5f,6.5f));float portrait=Mathf.Max(0,1.55f-aspect);
        Vector3 p=new Vector3(Limit(ball.x*.28f,-9,9),21,31+portrait*20),t=tracked;
        if(mode=="wide"){p=new Vector3(Limit(ball.x*.56f,-17,17),32,49+portrait*28);t=new Vector3(Limit(ball.x*.56f,-17,17),0,Limit(ball.z*.1f,-2,2)-2);}
        else if(mode=="sideline")p=new Vector3(tracked.x*.65f,13,31+portrait*22);
        else if(mode=="diagonal")p=new Vector3(tracked.x-22,23,32+portrait*22);
        else if(mode=="goal"){p=new Vector3(-49-portrait*20,19,9);t=new Vector3(Limit(ball.x*.65f,-25,25),tracked.y,Limit(ball.z*.4f,-9,9));}
        float distance=1.42f-Limit(near,0,100)*.007f;p=t+(p-t)*distance;
        if(guard&&(mode=="follow"||mode=="sideline")){var pan=new Vector3(0,0,Mathf.Max(0,ball.z-GuardFrom)*GuardShare);p+=pan;t+=pan;}
        return (p,t,adapted);
    }
    public static string Run(string repository,string outputFolder,bool render){
        var bridge=UnityEngine.Object.FindFirstObjectByType<ProbeBridge>()??throw new InvalidOperationException("ProbeBridge is missing in the open scene");
        var flags=BindingFlags.NonPublic|BindingFlags.Instance;var raw=File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json"));
        var folder=Path.Combine(repository,outputFolder??"outputs/3d-quality/claude-natural-motion-20261010/r2/small-views");Directory.CreateDirectory(folder);
        var views=new List<View>();var resources=new List<Resource>();var images=new List<string>();var camera=Camera.main;int sequence=1;bool log=Debug.unityLogger.logEnabled;
        void Drop(){var world=(Transform)typeof(ProbeBridge).GetField("world",flags).GetValue(bridge);if(world!=null)UnityEngine.Object.DestroyImmediate(world.gameObject);}
        // No offside line in these views (the contract fixture carries an explicit one).
        void Send(WorldCommand c){Debug.unityLogger.logEnabled=false;try{bridge.WorldCommand(JsonUtility.ToJson(c).Replace("\"offside\":{\"lineX\":0.0}","\"offside\":null").Replace("\"offside\":{\"lineX\":0}","\"offside\":null"));}finally{Debug.unityLogger.logEnabled=log;}}
        WorldConfig Load(string club,string quality){
            var entry=Array.Find(Clubs,c=>c.club==club);
            var config=JsonUtility.FromJson<WorldConfig>(raw);config.teams[0].id=club;config.teams[0].name=entry.name;config.teams[0].home=true;
            foreach(var pl in config.players)if(pl.team==0&&!pl.keeper){pl.kit.main=entry.main;pl.kit.trim=entry.trim;}
            config.initial.offside=null;config.teams[1].id="FRA-1";config.teams[1].home=false;config.quality=quality;
            config.session="small-"+club+"-"+quality;config.initial.session=config.session;config.initial.phase="paused";config.initial.sequence=sequence=1;
            Drop();Send(new WorldCommand{kind="load",config=config});if(bridge.StadiumClub!=club)throw new InvalidOperationException("Stadium for "+club+" was not built");return config;
        }
        Texture2D Capture(int w,int h){
            var baked=new List<(SkinnedMeshRenderer skin,GameObject go,Mesh mesh)>();
            foreach(var skin in UnityEngine.Object.FindObjectsByType<SkinnedMeshRenderer>(FindObjectsSortMode.None)){
                if(!skin.enabled||!skin.gameObject.activeInHierarchy)continue;var mesh=new Mesh();skin.BakeMesh(mesh);var go=new GameObject("D6 small-view capture",typeof(MeshFilter),typeof(MeshRenderer));go.transform.SetParent(skin.transform,false);
                go.GetComponent<MeshFilter>().sharedMesh=mesh;var r=go.GetComponent<MeshRenderer>();r.sharedMaterials=skin.sharedMaterials;r.shadowCastingMode=skin.shadowCastingMode;skin.enabled=false;baked.Add((skin,go,mesh));
            }
            var rt=RenderTexture.GetTemporary(w,h,24,RenderTextureFormat.ARGB32);float aspect=camera.aspect;camera.aspect=(float)w/h;camera.targetTexture=rt;camera.Render();camera.targetTexture=null;camera.aspect=aspect;
            var previous=RenderTexture.active;RenderTexture.active=rt;var tex=new Texture2D(w,h,TextureFormat.RGB24,false);tex.ReadPixels(new Rect(0,0,w,h),0,0);tex.Apply();RenderTexture.active=previous;RenderTexture.ReleaseTemporary(rt);
            foreach(var item in baked){item.skin.enabled=true;UnityEngine.Object.DestroyImmediate(item.go);UnityEngine.Object.DestroyImmediate(item.mesh);}return tex;
        }
        // The protected band is drawn into the image as a thin line (diagnostic overlay only).
        void Band(Texture2D tex){int y=Mathf.RoundToInt(tex.height*ProtectedBand);for(int x=0;x<tex.width;x+=2)tex.SetPixel(x,y,new Color(1,.85f,0));tex.Apply();}
        var balls=new (string name,Vector3 p,float h)[]{("centre",new Vector3(0,0,0),.29f),("near-touchline",new Vector3(0,0,20.5f),.29f),("near-corner",new Vector3(31,0,20.5f),.29f),("far-touchline",new Vector3(-10,0,-20.5f),.29f),("high-ball",new Vector3(8,0,12),6f)};
        try{
            foreach(var (club,city,_,_,_) in Clubs)foreach(var quality in new[]{"standard","reduced"}){
                var config=Load(club,quality);string archetype=bridge.StadiumArchetype;
                foreach(var (w,h) in Sizes)foreach(var modeName in new[]{"follow","wide","sideline","diagonal","goal","follow-guard","sideline-guard"})foreach(var ball in balls){
                    bool guarded=modeName.EndsWith("-guard");var mode=modeName.Replace("-guard","");if(guarded&&(quality!="standard"||club!="ITA-3"))continue;
                    var aim=Aim(ball.p,ball.h,mode,(float)w/h,60,guarded);
                    var frame=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(config.initial));frame.sequence=++sequence;frame.clock=10+sequence*.05;frame.phase="paused";
                    frame.offside=null;frame.ball=new double[]{ball.p.x,ball.h,ball.p.z};frame.ballInFlight=ball.h>1;frame.camera=new WorldCamera{position=new double[]{aim.position.x,aim.position.y,aim.position.z},target=new double[]{aim.target.x,aim.target.y,aim.target.z},fov=aim.fov};
                    Send(new WorldCommand{kind="frame",frame=frame});
                    float saved=camera.aspect;camera.aspect=(float)w/h;var vb=camera.WorldToViewportPoint(new Vector3(ball.p.x,ProbeBridge.DisplayHeight(ball.h),ball.p.z));var vl=camera.WorldToViewportPoint(new Vector3(ball.p.x,0,(float)config.geometry.width/2));var vc=camera.WorldToViewportPoint(new Vector3((float)config.geometry.length/2,0,(float)config.geometry.width/2));
                    // Target shift toward the ball (across the pitch) a screen-space guard would need.
                    float shift=0;if(vb.y<ProtectedBand+BallMargin&&vb.z>0){var dir=new Vector3(0,0,Mathf.Sign(ball.p.z));for(float s=.25f;s<=12;s+=.25f){var p2=aim.position+dir*s;var t2=aim.target+dir*s;camera.transform.position=p2;camera.transform.LookAt(t2);if(camera.WorldToViewportPoint(new Vector3(ball.p.x,ProbeBridge.DisplayHeight(ball.h),ball.p.z)).y>=ProtectedBand+BallMargin){shift=s;break;}shift=-1;}camera.transform.position=aim.position;camera.transform.LookAt(aim.target);}
                    camera.aspect=saved;
                    var v=new View{club=club,city=city,archetype=archetype,quality=quality,mode=modeName,size=w+"x"+h,ball=ball.name,ballViewportX=vb.x,ballViewportY=vb.y,nearLineViewportY=vl.y,cornerViewportY=vc.y,neededTargetShift=shift,ballOffscreen=vb.z<=0||vb.y<0||vb.y>1||vb.x<0||vb.x>1,ballInBand=vb.y<ProtectedBand,lineInBand=vl.y<ProtectedBand};views.Add(v);
                    bool shoot=render&&(ball.name=="near-touchline"||ball.name=="centre"&&(w==844||club=="ITA-3"))&&(quality=="standard"||modeName=="follow");
                    if(shoot){var tex=Capture(w,h);Band(tex);var name=$"{city}-{club}-{archetype}-{quality}-{modeName}-{w}x{h}-{ball.name}.png";File.WriteAllBytes(Path.Combine(folder,name),tex.EncodeToPNG());images.Add(name);UnityEngine.Object.DestroyImmediate(tex);}
                }
            }
            // Resource release: the same stadium loaded three times keeps a stable object count.
            foreach(var (club,_,_,_,_) in Clubs){int meshes=0,materials=0,objects=0;
                for(int k=0;k<3;k++){Load(club,"standard");Resources.UnloadUnusedAssets();meshes=Resources.FindObjectsOfTypeAll<Mesh>().Length;materials=Resources.FindObjectsOfTypeAll<Material>().Length;objects=UnityEngine.Object.FindObjectsByType<GameObject>(FindObjectsSortMode.None).Length;resources.Add(new Resource{club=club+"#"+k,meshes=meshes,materials=materials,gameObjects=objects});}}
        }finally{Drop();typeof(ProbeBridge).GetMethod("RestoreProbeLighting",flags).Invoke(bridge,null);camera.targetTexture=null;}
        var report=new Report{sourceId=ProbeBuildIdentity.SourceId,unity=Application.unityVersion,device=SystemInfo.graphicsDeviceType.ToString(),note="Camera from a 1:1 C# port of dist/world-pitch3d-v98.js v98CameraAim (near 60, no blend), applied by the actual bridge; viewport y 0 = bottom edge. Protected band = bottom 12 % (HUD). neededTargetShift: metres the camera position and target would move across the pitch toward the ball so it clears the band by 2 % (-1: not within 12 m). Editor images, not a device or WebGL GPU measurement.",views=views.ToArray(),resources=resources.ToArray(),images=images.ToArray(),ballInBand=views.FindAll(v=>v.ballInBand).Count,ballOffscreen=views.FindAll(v=>v.ballOffscreen).Count};
        File.WriteAllText(Path.Combine(folder,"small-views.json"),JsonUtility.ToJson(report,true));
        // Resource release is a hard check; the camera findings are reported for Root.
        for(int i=0;i<resources.Count;i+=3)if(resources[i+2].meshes>resources[i+1].meshes||resources[i+2].materials>resources[i+1].materials||resources[i+2].gameObjects>resources[i+1].gameObjects)throw new Exception("stadium reload leaks resources: "+resources[i].club);
        return "views="+views.Count+" ballInBand="+report.ballInBand+" offscreen="+report.ballOffscreen+" (guard rows included)"+" images="+images.Count;
    }
}
#endif

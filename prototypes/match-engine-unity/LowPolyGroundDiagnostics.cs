#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections;
using System.Collections.Generic;
using System.Reflection;
using System.Security.Cryptography;
using UnityEngine;
using UnityEngine.Animations;
using UnityEngine.Playables;
using UnityEditor;
using UnityEditor.SceneManagement;
using Doppel6.Probe;
// Klares Low-Poly ground skin (FootballGround.AttachGroundSkin) on the probe
// scene's actual prefab, clip catalogue, match mesh and ground mesh, with three
// actors built like ProbeBridge.BuildWorld: release (WorldPlayer drawn),
// candidate (low-poly drawn plus the hidden ground skin) and legacy (low-poly
// drawn and measured on itself: the d8ae8785 path). Each ground profile is
// measured fresh (the per-mesh cache is cleared before each actor).
// Requirements (the run fails otherwise): the build preflight (D6Cli.WebBuildPreflight)
// accepts the saved scene and refuses a replacement mesh without, or with a wrong,
// ground mesh; the scene references the ground mesh; one disabled, material-less
// ground skin per actor on the drawn skin's parent, transform, bones, root bone and
// quality, idempotent and removed again for the release mesh, also through
// ProbeBridge.WorldCommand loads; a disabled ground skin bakes like an enabled one
// and like the release skin; candidate profile, pose, ground shift and ground
// measurement bit-identical to the release actor; the drawn low-poly surface
// (VisibleSurfaceProbe: boots, body, against the release reference in the same
// pose) has no candidate-only or candidate-worse picture on the clip gallery and
// on native-envelope slides; sentinel meshes with lowered boots and raised gloves
// are refused. Reported apart: the legacy deltas (the R15 mechanism, Of(walking)).
// Native contact pictures (receive/pass/shot boots, keeper gloves) are measured by
// the same probe inside NaturalMotionDiagnostics and FootballKeeperTests.
public static class LowPolyGroundDiagnostics {
    [Serializable] public class Check {public string name,detail;public bool ok;}
    [Serializable] public class ProfileValue {public string name;public float release,candidate,legacy;}
    [Serializable] class Report {
        public string sourceId,unity,device,matchMesh,groundMesh,note,preflight;public Check[] checks;
        public float rootHeightRelease,rootHeightCandidate,rootHeightLegacy,walkingOffsetRelease,walkingOffsetCandidate,walkingOffsetLegacy;
        public int profileValues,profileCandidateDiffering,profileLegacyDiffering;public ProfileValue[] profileDiffering;
        public int poses,posesCandidateExact,slidePictures,slidePicturesExact;public float legacyBoneMax;public string legacyBoneMaxAt;
        public VisibleSurfaceProbe.Snapshot gallery,slides,sentinel;}
    const BindingFlags Hidden=BindingFlags.NonPublic|BindingFlags.Instance;
    const string ProbeScene="Assets/Doppel6EngineProbe/Probe.unity",NegativeScene="Assets/Doppel6EngineProbe/D6PreflightNegative.unity";
    sealed class Rig {public string name;public GameObject go;public PlayableGraph graph;public FootballAnimation anim;public Transform[] bones;}
    static bool Same(float a,float b)=>BitConverter.SingleToInt32Bits(a)==BitConverter.SingleToInt32Bits(b);
    static float J(float v)=>float.IsNaN(v)?-9:v;
    static bool Same(Vector3 a,Vector3 b)=>Same(a.x,b.x)&&Same(a.y,b.y)&&Same(a.z,b.z);
    static bool Same(Quaternion a,Quaternion b)=>Same(a.x,b.x)&&Same(a.y,b.y)&&Same(a.z,b.z)&&Same(a.w,b.w);
    static void ClearProfiles(){((IDictionary)typeof(FootballGround).GetField("profiles",BindingFlags.NonPublic|BindingFlags.Static).GetValue(null)).Clear();}
    static int GroundSkins(GameObject go){int n=0;foreach(var r in go.GetComponentsInChildren<SkinnedMeshRenderer>(true))if(FootballGround.IsGroundSkin(r))n++;return n;}
    static SkinnedMeshRenderer Drawn(GameObject go){foreach(var r in go.GetComponentsInChildren<SkinnedMeshRenderer>())if(!FootballGround.IsGroundSkin(r))return r;return null;}
    static string FileHash(string asset){using(var sha=SHA256.Create())return BitConverter.ToString(sha.ComputeHash(File.ReadAllBytes(asset))).Replace("-","").ToLowerInvariant();}

    public static string Run(string repository,string outputFolder=null){
        var checks=new List<Check>();void Require(bool ok,string name,string detail=null){checks.Add(new Check{name=name,ok=ok,detail=detail});}
        // Build preflight (D6Cli.WebBuild runs it before any build work): the saved scene, a saved copy in
        // the d8ae8785 state (match mesh, no ground mesh) and in-memory variants. Probe.unity stays unchanged.
        string preflight;var sceneBefore=FileHash(ProbeScene);
        try{preflight=D6Cli.WebBuildPreflight(ProbeScene);Require(true,"build preflight accepts the saved probe scene",preflight);}catch(Exception e){preflight="refused: "+e.Message;Require(false,"build preflight accepts the saved probe scene",preflight);}
        {AssetDatabase.DeleteAsset(NegativeScene);string refused=null,accepted=null;
         try{
             if(!AssetDatabase.CopyAsset(ProbeScene,NegativeScene))throw new InvalidOperationException("Could not copy "+ProbeScene);
             var copy=EditorSceneManager.OpenScene(NegativeScene,OpenSceneMode.Single);ProbeBridge b=null;foreach(var root in copy.GetRootGameObjects()){b=root.GetComponentInChildren<ProbeBridge>(true);if(b!=null)break;}
             b.groundPlayerMesh=null;EditorUtility.SetDirty(b);EditorSceneManager.SaveScene(copy);
             try{accepted=D6Cli.WebBuildPreflight(NegativeScene);}catch(InvalidOperationException e){refused=e.Message;}
         }finally{EditorSceneManager.OpenScene(ProbeScene,OpenSceneMode.Single);AssetDatabase.DeleteAsset(NegativeScene);}
         Require(refused!=null&&refused.Contains("no ground mesh"),"build preflight refuses a saved scene with the low-poly match mesh and no ground mesh (the d8ae8785 state)",refused??"accepted: "+accepted);
         Require(FileHash(ProbeScene)==sceneBefore&&!File.Exists(NegativeScene),"the probe scene file is unchanged and the negative copy removed",sceneBefore);}
        var bridge=UnityEngine.Object.FindFirstObjectByType<ProbeBridge>()??throw new InvalidOperationException("ProbeBridge is missing (open Probe.unity)");
        var original=AssetDatabase.LoadAssetAtPath<Mesh>(LowPolySetup.Original);var drawnMesh=LowPolySetup.MatchMesh();var ground=LowPolySetup.GroundMesh();
        if(drawnMesh==original)throw new InvalidOperationException("The probe scene shows the release mesh; run D6Cli.MatchMesh -d6mesh lowpoly first");
        {var keepMatch=bridge.matchPlayerMesh;var keepGround=bridge.groundPlayerMesh;var foreign=new Mesh{name="D6 foreign ground"};
         string Try(Mesh m,Mesh g){bridge.matchPlayerMesh=m;bridge.groundPlayerMesh=g;try{return "accepted "+D6Cli.GroundPreflight(bridge,ProbeScene);}catch(InvalidOperationException e){return "refused "+e.Message;}finally{bridge.matchPlayerMesh=keepMatch;bridge.groundPlayerMesh=keepGround;}}
         try{
             foreach(var (m,g,accept,what) in new[]{(drawnMesh,(Mesh)null,false,"low-poly match mesh without ground mesh"),(drawnMesh,drawnMesh,false,"low-poly match mesh as its own ground mesh"),(drawnMesh,foreign,false,"low-poly match mesh with a foreign ground mesh"),(original,drawnMesh,false,"release match mesh with a foreign ground mesh"),(drawnMesh,original,true,"low-poly match mesh with WorldPlayer.asset"),(original,(Mesh)null,true,"release match mesh without ground mesh (release path)"),(original,original,true,"release match mesh with itself as ground mesh")}){
                 var r=Try(m,g);Require(r.StartsWith(accept?"accepted":"refused"),"build preflight "+(accept?"accepts":"refuses")+" the "+what,r);}
         }finally{UnityEngine.Object.DestroyImmediate(foreign);}
         Require(bridge.matchPlayerMesh==keepMatch&&bridge.groundPlayerMesh==keepGround&&!bridge.gameObject.scene.isDirty,"preflight variants leave the scene references unchanged and the scene clean");}
        // Scene references: the ground mesh is serialized on the bridge, so the build keeps it.
        Require(ground!=null&&AssetDatabase.GetAssetPath(ground)==LowPolySetup.Original,"scene ground mesh is WorldPlayer.asset",ground!=null?AssetDatabase.GetAssetPath(ground):"null");
        Require(Array.IndexOf(AssetDatabase.GetDependencies(ProbeScene,true),LowPolySetup.Original)>=0,"saved probe scene depends on WorldPlayer.asset (kept in the WebGL build)");
        Require(AssetDatabase.GetAssetPath(drawnMesh)==LowPolySetup.Asset,"scene match mesh is "+LowPolySetup.Asset,AssetDatabase.GetAssetPath(drawnMesh));
        var clips=Array.FindAll((AnimationClip[])typeof(ProbeBridge).GetMethod("FootballClips",Hidden).Invoke(bridge,null),c=>c!=null);
        AnimationClip Clip(string n)=>Array.Find(clips,c=>c.name==n);
        var report=new Report{sourceId=ProbeBuildIdentity.SourceId,unity=Application.unityVersion,device=SystemInfo.graphicsDeviceType.ToString(),matchMesh=drawnMesh.name,groundMesh=ground!=null?ground.name:null,preflight=preflight,
            note="Editor clip samples on the actual prefab and catalogue (cut poses, actors at the same root) and native-envelope slides (FootballDuelTiming, both leads, entry, hold and recovery at 60 Hz). Bit-identity of the candidate to the release actor is required. The drawn low-poly surface is judged against the release reference in the same pose ("+VisibleSurfaceProbe.Note+"). Not a GPU, device or WebGL measurement."};
        var scene=EditorSceneManager.NewPreviewScene();var rigs=new List<Rig>();var scratch=new[]{new Mesh(),new Mesh(),new Mesh()};
        var gallery=new VisibleSurfaceProbe("gallery"){keepAll=true};var slides=new VisibleSurfaceProbe("slides");Mesh sentinelMesh=null;
        try{
            Rig Build(string name,Mesh drawn,Mesh groundMesh){
                // Same order as ProbeBridge.BuildWorld: mesh, scale, ground skin, animator, graph, FootballAnimation.
                var go=UnityEngine.Object.Instantiate(bridge.playerPrefab);UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(go,scene);go.name=name;
                foreach(var r in go.GetComponentsInChildren<SkinnedMeshRenderer>())r.sharedMesh=drawn;go.transform.localScale=Vector3.one*1.45f;
                FootballGround.AttachGroundSkin(go.transform,groundMesh);
                var animator=go.GetComponent<Animator>();if(animator==null)animator=go.AddComponent<Animator>();animator.applyRootMotion=false;animator.cullingMode=AnimatorCullingMode.AlwaysAnimate;
                var graph=PlayableGraph.Create("D6 ground "+name);graph.SetTimeUpdateMode(DirectorUpdateMode.Manual);AnimationPlayableOutput.Create(graph,"Character",animator).SetSourcePlayable(AnimationClipPlayable.Create(graph,bridge.idleClip));graph.Play();graph.Evaluate(0);
                ClearProfiles();var rig=new Rig{name=name,go=go,graph=graph,anim=new FootballAnimation(graph,go.transform,clips),bones=Array.FindAll(go.GetComponentsInChildren<Transform>(),t=>t.name.StartsWith("mixamorig:"))};
                go.transform.position=new Vector3(0,rig.anim.RootHeight,0);rigs.Add(rig);return rig;
            }
            var release=Build("release",original,ground);var candidate=Build("candidate",drawnMesh,ground);var legacy=Build("legacy",drawnMesh,null);
            var groundSkin=FootballGround.GroundSkin(candidate.go.transform);var drawnSkin=Drawn(candidate.go);

            // Structure and lifecycle.
            Require(FootballGround.GroundSkin(release.go.transform)==null&&GroundSkins(release.go)==0,"release actor has no ground skin (unchanged release path)");
            Require(FootballGround.GroundSkin(legacy.go.transform)==null,"legacy actor has no ground skin");
            Require(groundSkin!=null&&GroundSkins(candidate.go)==1,"candidate actor has exactly one ground skin");
            if(groundSkin==null)throw new InvalidOperationException("No ground skin on the candidate actor");
            Require(groundSkin.sharedMesh==ground&&drawnSkin.sharedMesh==drawnMesh,"ground skin carries the ground mesh, drawn skin the match mesh");
            Require(!groundSkin.enabled&&groundSkin.sharedMaterials.Length==0&&groundSkin.shadowCastingMode==UnityEngine.Rendering.ShadowCastingMode.Off&&!groundSkin.receiveShadows&&!groundSkin.skinnedMotionVectors,"ground skin is disabled, material-less and casts no shadow");
            Require(groundSkin.transform.parent==drawnSkin.transform.parent&&groundSkin.transform.localToWorldMatrix==drawnSkin.transform.localToWorldMatrix&&groundSkin.gameObject.layer==drawnSkin.gameObject.layer,"ground skin shares parent, transform and layer of the drawn skin");
            {var a=groundSkin.bones;var b=drawnSkin.bones;bool same=a.Length==b.Length;for(int i=0;same&&i<a.Length;i++)same=a[i]==b[i];
             Require(same&&groundSkin.rootBone==drawnSkin.rootBone&&groundSkin.quality==drawnSkin.quality,"ground skin uses the drawn skin's bone transforms, root bone and quality","bones="+a.Length);}
            {var a=ground.bindposes;var b=drawnMesh.bindposes;bool same=a.Length==b.Length;for(int i=0;same&&i<a.Length;i++)same=a[i]==b[i];Require(same,"ground and match mesh bind poses are identical","bindposes="+a.Length);}
            Require(!Array.Exists(candidate.go.GetComponentsInChildren<Transform>(),t=>t.name.StartsWith("mixamorig:")&&t.IsChildOf(groundSkin.transform)),"no bones or rig below the ground skin");
            Require(FootballGround.AttachGroundSkin(candidate.go.transform,ground)==groundSkin&&GroundSkins(candidate.go)==1,"attaching again reuses the ground skin");
            {var temp=Build("lifecycle",original,ground);Require(GroundSkins(temp.go)==0,"release mesh: no ground skin");
             foreach(var r in temp.go.GetComponentsInChildren<SkinnedMeshRenderer>())r.sharedMesh=drawnMesh;FootballGround.AttachGroundSkin(temp.go.transform,ground);Require(GroundSkins(temp.go)==1,"switched to the match mesh: one ground skin");
             FootballGround.AttachGroundSkin(temp.go.transform,ground);Require(GroundSkins(temp.go)==1,"repeated attach keeps one ground skin");
             foreach(var r in temp.go.GetComponentsInChildren<SkinnedMeshRenderer>())if(!FootballGround.IsGroundSkin(r))r.sharedMesh=original;FootballGround.AttachGroundSkin(temp.go.transform,ground);Require(GroundSkins(temp.go)==0&&FootballGround.GroundSkin(temp.go.transform)==null,"switched back to the release mesh: ground skin removed");
             foreach(var r in temp.go.GetComponentsInChildren<SkinnedMeshRenderer>())r.sharedMesh=drawnMesh;bool refused=false;var foreign=new Mesh{name="D6 foreign rig"};
             try{FootballGround.AttachGroundSkin(temp.go.transform,foreign);}catch(InvalidOperationException){refused=true;}finally{UnityEngine.Object.DestroyImmediate(foreign);}
             Require(refused,"a ground mesh on another rig is refused");
             temp.graph.Destroy();rigs.Remove(temp);UnityEngine.Object.DestroyImmediate(temp.go);}

            // Ground profiles measured fresh per actor.
            report.rootHeightRelease=release.anim.RootHeight;report.rootHeightCandidate=candidate.anim.RootHeight;report.rootHeightLegacy=legacy.anim.RootHeight;
            var walking=Clip("walking");if(walking!=null){report.walkingOffsetRelease=release.anim.ground.Of(walking);report.walkingOffsetCandidate=candidate.anim.ground.Of(walking);report.walkingOffsetLegacy=legacy.anim.ground.Of(walking);}
            {var r=Profile(release.anim,clips);var c=Profile(candidate.anim,clips);var l=Profile(legacy.anim,clips);var differing=new List<ProfileValue>();
             report.profileValues=r.Count;
             for(int i=0;i<r.Count;i++){bool cd=!Same(r[i].v,c[i].v),ld=!Same(r[i].v,l[i].v);if(cd)report.profileCandidateDiffering++;if(ld)report.profileLegacyDiffering++;if((cd||ld)&&differing.Count<400)differing.Add(new ProfileValue{name=r[i].n,release=J(r[i].v),candidate=J(c[i].v),legacy=J(l[i].v)});}
             report.profileDiffering=differing.ToArray();
             Require(report.profileCandidateDiffering==0,"candidate ground profile is bit-identical to the release profile",report.profileCandidateDiffering+"/"+report.profileValues+" differ (legacy: "+report.profileLegacyDiffering+")");}

            // Disabled bake = enabled bake = release skin bake (one standing pose).
            {release.anim.Sample(new FootballAnimation.Pose{clip=bridge.idleClip,time=.2,key="bake",loop=true},10,true);candidate.anim.Sample(new FootballAnimation.Pose{clip=bridge.idleClip,time=.2,key="bake",loop=true},10,true);
             var off=Bake(groundSkin,scratch[0]);groundSkin.enabled=true;var on=Bake(groundSkin,scratch[1]);groundSkin.enabled=false;var rel=Bake(Drawn(release.go),scratch[2]);
             Require(SameAll(off,on),"a disabled ground skin bakes exactly like an enabled one");Require(SameAll(off,rel),"the ground skin bakes exactly like the release skin in the same pose");}

            // Clip gallery: release vs candidate bit-identity, legacy delta, drawn surface against the release reference.
            int poses=0,exact=0;float legacyMax=0;string legacyAt=null;
            var locomotion=new[]{"idle_stand_meshy","walking","running","sprint_forward"};var keeper=new[]{"keeper_ready_meshy","keeper_low_meshy","keeper_high_meshy","keeper_dive_meshy"};
            var names=new[]{"idle_stand_meshy","walking","running","sprint_forward","receive_ground_meshy","pass_inside_meshy","shot_meshy","foul_stumble_meshy","keeper_ready_meshy","keeper_shuffle_meshy","keeper_low_meshy","keeper_high_meshy","keeper_dive_meshy","keeper_rise_meshy"};
            var list=new List<(string label,FootballAnimation.Pose pose,string context)>();
            foreach(var n in names){var c=Clip(n);if(c==null){Require(false,"catalogue clip "+n+" is present");continue;}
                for(int s=0;s<24;s++)list.Add((n+"@"+(s/23f).ToString("0.00"),new FootballAnimation.Pose{clip=c,time=s*(c.length-.001)/23,key="ground-"+n,loop=false},Array.IndexOf(locomotion,n)>=0?"locomotion":Array.IndexOf(keeper,n)>=0?"keeper":"action"));}
            var sprint=Clip("sprint_forward");
            if(sprint!=null)foreach(var lead in new[]{false,true})foreach(var w in new[]{.25f,.5f,1f})
                list.Add(("slide "+(lead?"left":"right")+" "+w.ToString("0.00"),new FootballAnimation.Pose{clip=sprint,time=release.anim.StrideTime(lead?.5:0,sprint),loop=true,key="slide:1",kind="slide",urgent=true,slide=w,leftLead=lead,target=new Vector3(.25f,.18f,.85f)},"slide"));
            bool Identical(string label){
                bool same=Same(release.anim.GroundShift,candidate.anim.GroundShift)&&Same(release.anim.TurfShift,candidate.anim.TurfShift)&&Same(release.go.transform.position,candidate.go.transform.position);
                for(int b=0;b<release.bones.Length;b++){same&=Same(release.bones[b].position,candidate.bones[b].position)&&Same(release.bones[b].rotation,candidate.bones[b].rotation);
                    float d=Vector3.Distance(release.bones[b].position,legacy.bones[b].position);if(d>legacyMax){legacyMax=d;legacyAt=label+" "+release.bones[b].name;}}
                // The ground measurement, and through it the release reference of the probe (the ground skin), equals the release skin.
                return same&&Same(FootballGround.LowestVertex(release.go.transform),FootballGround.LowestVertex(candidate.go.transform));
            }
            double clock=100;
            foreach(var (label,pose,context) in list){
                clock+=.5;foreach(var rig in rigs)rig.anim.Sample(pose,clock,true);poses++;
                if(Identical(label))exact++;
                gallery.Picture(candidate.go.transform,label,context,true);
            }
            report.poses=poses;report.posesCandidateExact=exact;report.legacyBoneMax=legacyMax;report.legacyBoneMaxAt=legacyAt;
            Require(exact==poses,"candidate pose, ground shift and ground measurement bit-identical to the release actor",exact+"/"+poses);

            // Native-envelope slides (the pictures FootballPresentation selects for slide/slideRecovery, FootballDuelTests'
            // poses): both leads, entry (FootballDuelTiming.Slide), hold and recovery (keeper_rise_meshy, Recovery) at 60 Hz
            // on a continuous clock (crossfades as live), drawn surface against the release reference.
            {var rise=Clip("keeper_rise_meshy");int pictures=0,same=0;
             if(sprint!=null&&rise!=null)foreach(var lead in new[]{false,true}){
                 var target=new Vector3(lead?-.25f:.25f,.18f,.85f);double t=600+(lead?100:0);string side=lead?"left":"right";
                 foreach(var rig in rigs)rig.anim.Sample(new FootballAnimation.Pose{clip=sprint,time=release.anim.StrideTime(lead?.5:0,sprint),loop=true,key="run"},t,true);
                 for(int k=1;k<=39;k++){double p=k/39.0;t+=1/60.0;var pose=new FootballAnimation.Pose{clip=sprint,time=release.anim.StrideTime(lead?.5:0,sprint),loop=true,key="slide:1",kind="slide",urgent=true,slide=FootballDuelTiming.Slide(p),leftLead=lead,target=target};
                     foreach(var rig in rigs)rig.anim.Sample(pose,t);pictures++;if(Identical("slide "+side+" "+p.ToString("0.00")))same++;slides.Picture(candidate.go.transform,"slide "+side+" progress "+p.ToString("0.00")+" weight "+pose.slide.ToString("0.00"),"slide",false);}
                 for(int k=1;k<=36;k++){double p=k/36.0;t+=1/60.0;var pose=new FootballAnimation.Pose{clip=rise,time=FootballDuelTiming.RiseTime(p),key="slide:1",kind="slide",urgent=true,slide=FootballDuelTiming.Recovery(p),leftLead=lead,target=target};
                     foreach(var rig in rigs)rig.anim.Sample(pose,t);pictures++;if(Identical("slide recovery "+side+" "+p.ToString("0.00")))same++;slides.Picture(candidate.go.transform,"slide recovery "+side+" progress "+p.ToString("0.00"),"slide",false);}
             }
             report.slidePictures=pictures;report.slidePicturesExact=same;
             Require(pictures==150&&same==pictures,"native-envelope slides: candidate pose bit-identical to the release actor",same+"/"+pictures);}

            // Rules (numbers): absolute: pass, inherited only when the candidate is not worse, candidate-only and candidate-worse
            // fail; paired: fails beyond PairTolerance worse than the release reference.
            {string C(float c,float r,float l,bool higher)=>VisibleSurfaceProbe.Classify(c,r,l,higher);bool P(float c,float r,bool higher)=>VisibleSurfaceProbe.Fails(c,r,0,higher,true);
             Require(C(-.005f,-.002f,-.01f,true)=="passed"&&C(-.0101f,-.0101f,-.01f,true)=="inherited"&&C(-.035f,-.0101f,-.01f,true)=="candidate-worse"&&C(-.01015f,-.0101f,-.01f,true)=="inherited"&&C(-.0103f,-.0101f,-.01f,true)=="candidate-worse"&&C(-.012f,-.009f,-.01f,true)=="candidate-only"
                 &&C(.02f,.01f,.03f,false)=="passed"&&C(-.05f,.04f,.03f,false)=="candidate-worse"&&C(.04f,-.05f,.03f,false)=="inherited"&&C(.031f,.029f,.03f,false)=="candidate-only"&&C(-.05f,-.05f,-.02f,true)=="inherited"&&C(-.01f,-.05f,-.02f,true)=="passed"
                 &&VisibleSurfaceProbe.Fails(-.035f,-.0101f,-.01f,true,false)&&!VisibleSurfaceProbe.Fails(-.0101f,-.0101f,-.01f,true,false)
                 &&!P(-.0645f,-.0616f,true)&&P(-.075f,-.0616f,true)&&!P(-.048f,-.0463f,false)&&P(-.058f,-.0463f,false)&&!P(.02f,.035f,false),
                 "surface rules: absolute inherited excuses no candidate excess beyond 1e-4 m (release -0.0101 / candidate -0.035 at -0.01 fails); paired fails beyond 0.01 m worse than the release reference");}

            // Sentinel: the low-poly mesh with every boot vertex 4 cm lower (bind space, z up) and every glove vertex
            // 8 cm out along its (flat) normal, at least 3 cm into a ball touching the release glove, on the same rig and ground skin, must be refused; the actual candidate passes the same pictures.
            {sentinelMesh=UnityEngine.Object.Instantiate(drawnMesh);sentinelMesh.name="D6 sentinel "+drawnMesh.name;var v=sentinelMesh.vertices;var normals=sentinelMesh.normals;var region=VisibleSurfaceProbe.RegionsOf(drawnSkin);
             for(int i=0;i<v.Length;i++){if(region[i]<=1)v[i].z-=.04f;else if(region[i]<=3)v[i]+=normals[i].normalized*.08f;}sentinelMesh.vertices=v;sentinelMesh.RecalculateBounds();
             var sentinel=Build("sentinel",sentinelMesh,ground);var probe=new VisibleSurfaceProbe("sentinel");var reference=new VisibleSurfaceProbe("sentinel-reference");
             try{
                 var stand=new FootballAnimation.Pose{clip=bridge.idleClip,time=.2,key="sentinel",loop=true};var catchPose=new FootballAnimation.Pose{clip=Clip("keeper_ready_meshy"),time=.4,key="sentinel-keeper",loop=true};
                 foreach(var rig in rigs)rig.anim.Sample(stand,900,true);
                 probe.Picture(sentinel.go.transform,"standing","locomotion",true);reference.Picture(candidate.go.transform,"standing","locomotion",true);
                 // A ball below the release reference's right boot (its lowest point on the ball surface) and one below its right glove.
                 var boot=VisibleSurfaceProbe.LowestPoint(candidate.go.transform,1)+Vector3.down*VisibleSurfaceProbe.Radius;
                 probe.Picture(sentinel.go.transform,"right boot on a ball","action",true,1,0,boot);reference.Picture(candidate.go.transform,"right boot on a ball","action",true,1,0,boot);
                 foreach(var rig in rigs)rig.anim.Sample(catchPose,901,true);
                 var glove=VisibleSurfaceProbe.LowestPoint(candidate.go.transform,3)+Vector3.down*VisibleSurfaceProbe.Radius;
                 probe.Picture(sentinel.go.transform,"right glove on a ball","keeper",false,-1,1,glove);reference.Picture(candidate.go.transform,"right glove on a ball","keeper",false,-1,1,glove);
                 // The inherited path: the release reference fails a limit set 1 mm above it; the lowered sentinel boot is worse.
                 var sb=VisibleSurfaceProbe.LowestOf(sentinel.go.transform,1,false);var rb=VisibleSurfaceProbe.LowestOf(sentinel.go.transform,1,true);
                 probe.Judge("boot right lowest m (limit 1 mm above the release reference)","sentinel",false,rb+.001f,sb,rb,true,"standing keeper");
                 report.sentinel=probe.Result();
                 Require(probe.Has("boot left lowest m","candidate-only")&&probe.Has("boot right lowest m","candidate-only"),"sentinel: boots 4 cm lower are refused on both feet (candidate-only)",probe.Line());
                 Require(probe.Has("boot right surface to received ball surface m","candidate-only"),"sentinel: a boot surface 4 cm off the ball is refused",probe.Line());
                 Require(probe.Has("glove surface to held/contact ball surface m","candidate-only"),"sentinel: an inflated glove surface in the ball is refused",probe.Line());
                 Require(probe.Has("boot right lowest m (limit 1 mm above the release reference)","candidate-worse"),"sentinel: a candidate worse than an already failing release reference is refused (candidate-worse)",probe.Line());
                 Require(reference.Failed==0&&reference.Pictures==3,"the actual candidate passes the sentinel pictures",reference.Line());
             }finally{probe.Dispose();reference.Dispose();VisibleSurfaceProbe.Forget(sentinelMesh);sentinel.graph.Destroy();rigs.Remove(sentinel);UnityEngine.Object.DestroyImmediate(sentinel.go);}}

            report.gallery=gallery.Result();report.slides=slides.Result();
            Require(gallery.Failed==0,"clip gallery: no failing visible surface picture (absolute or paired)",gallery.Line());
            Require(slides.Failed==0,"native-envelope slides: no failing visible surface picture (absolute or paired)",slides.Line());
            Require(!groundSkin.enabled&&GroundSkins(candidate.go)==1,"ground skin still disabled and single after all samples");
        }finally{foreach(var r in rigs)if(r.graph.IsValid())r.graph.Destroy();foreach(var m in scratch)UnityEngine.Object.DestroyImmediate(m);gallery.Dispose();slides.Dispose();if(sentinelMesh!=null)UnityEngine.Object.DestroyImmediate(sentinelMesh);EditorSceneManager.ClosePreviewScene(scene);}

        // The match view itself: two loads through ProbeBridge.WorldCommand.
        {var config=JsonUtility.FromJson<WorldConfig>(File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json")));
         for(int round=0;round<2;round++){
             Drop(bridge);bridge.WorldCommand(JsonUtility.ToJson(new WorldCommand{kind="load",config=config}));
             var actors=(List<Transform>)typeof(ProbeBridge).GetField("actors",Hidden).GetValue(bridge);var football=(List<FootballAnimation>)typeof(ProbeBridge).GetField("football",Hidden).GetValue(bridge);
             bool ok=actors.Count==config.players.Length&&football.Count==actors.Count;int enabled=0;
             foreach(var a in actors){var g=FootballGround.GroundSkin(a);ok&=GroundSkins(a.gameObject)==1&&g!=null&&!g.enabled&&g.sharedMesh==ground&&Drawn(a.gameObject).sharedMesh==drawnMesh&&g.transform.parent==Drawn(a.gameObject).transform.parent;
                 foreach(var r in a.GetComponentsInChildren<Renderer>())if(r.enabled)enabled++;}
             Require(ok&&enabled==actors.Count,"match view load "+(round+1)+": one disabled ground skin and one drawn renderer per actor","actors="+actors.Count+" enabled renderers="+enabled);
             // Scene-wide: nothing left over from the previous load (skins, ground skins, graphs).
             var graphs=(List<PlayableGraph>)typeof(ProbeBridge).GetField("graphs",Hidden).GetValue(bridge);int valid=0;foreach(var g in graphs)if(g.IsValid())valid++;
             var (skins,grounds)=SceneSkins();
             Require(skins==2*actors.Count&&grounds==actors.Count&&graphs.Count==actors.Count&&valid==actors.Count,"match view load "+(round+1)+": scene-wide skins, ground skins and graphs match the actors (no leftovers)","skins="+skins+" ground="+grounds+" graphs="+graphs.Count+" valid="+valid);
         }
         Drop(bridge);{var (skins,grounds)=SceneSkins();Require(grounds==0,"no ground skin left after dropping the match view","skins="+skins+" ground="+grounds);}}

        report.checks=checks.ToArray();
        var folder=Path.Combine(repository,outputFolder??"outputs/style-demos/lowpoly-fix/unity");Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,"lowpoly-ground.json"),JsonUtility.ToJson(report,true));
        int failed=checks.FindAll(c=>!c.ok).Count;
        var summary="checks="+checks.Count+" failed="+failed+" profile="+report.profileCandidateDiffering+"/"+report.profileValues+" differ (legacy "+report.profileLegacyDiffering+") poses exact="+report.posesCandidateExact+"/"+report.poses+" slides exact="+report.slidePicturesExact+"/"+report.slidePictures+" Of(walking) release="+report.walkingOffsetRelease.ToString("R")+" candidate="+report.walkingOffsetCandidate.ToString("R")+" legacy="+report.walkingOffsetLegacy.ToString("R")+"; gallery: "+report.gallery?.line+"; slides: "+report.slides?.line;
        if(failed>0)throw new InvalidOperationException("Low-poly ground: "+summary+"; first failure: "+checks.Find(c=>!c.ok).name+" ("+checks.Find(c=>!c.ok).detail+")");
        return summary;
    }
    static (int skins,int grounds) SceneSkins(){int s=0,g=0;foreach(var r in UnityEngine.Object.FindObjectsByType<SkinnedMeshRenderer>(FindObjectsInactive.Include,FindObjectsSortMode.None)){s++;if(FootballGround.IsGroundSkin(r))g++;}return (s,g);}
    static void Drop(ProbeBridge bridge){var world=(Transform)typeof(ProbeBridge).GetField("world",Hidden).GetValue(bridge);if(world!=null)UnityEngine.Object.DestroyImmediate(world.gameObject);}
    // Every measured value of an actor's ground profile in catalogue order.
    static List<(string n,float v)> Profile(FootballAnimation a,AnimationClip[] clips){
        var p=typeof(FootballGround).GetField("profile",Hidden).GetValue(a.ground);var t=p.GetType();var list=new List<(string n,float v)>();
        foreach(var n in new[]{"sole","ankle","toe","toeEnd"})list.Add((n,(float)t.GetField(n).GetValue(p)));
        list.Add(("rootHeight",a.RootHeight));list.Add(("contour/left",a.ground.SolePointCount(0)));list.Add(("contour/right",a.ground.SolePointCount(1)));
        var offsets=(Dictionary<AnimationClip,float>)t.GetField("offsets").GetValue(p);var chest=(Dictionary<AnimationClip,float>)t.GetField("chestBias").GetValue(p);
        var gaits=(Dictionary<AnimationClip,FootballStride.Gait>)t.GetField("gaits").GetValue(p);var clear=(Dictionary<AnimationClip,float[][]>)t.GetField("clearances").GetValue(p);
        var seen=new HashSet<AnimationClip>();
        foreach(var c in clips){if(!seen.Add(c))continue;
            list.Add(("offset/"+c.name,offsets.TryGetValue(c,out var o)?o:float.NaN));list.Add(("chest/"+c.name,chest.TryGetValue(c,out var b)?b:float.NaN));
            if(gaits.TryGetValue(c,out var g)){list.Add(("gait/"+c.name+"/stride",g.stride));list.Add(("gait/"+c.name+"/left",g.left));list.Add(("gait/"+c.name+"/right",g.right));list.Add(("gait/"+c.name+"/heading",g.heading));list.Add(("gait/"+c.name+"/sync",g.sync));list.Add(("gait/"+c.name+"/syncKnown",g.syncKnown?1:0));}
            else list.Add(("gait/"+c.name,float.NaN));
            if(clear.TryGetValue(c,out var cl)){for(int f=0;f<cl.Length;f++)for(int s=0;s<cl[f].Length;s++)list.Add(("clear/"+c.name+"/"+f+"/"+s,cl[f][s]));}else list.Add(("clear/"+c.name,float.NaN));
        }
        return list;
    }
    // World positions of a skin's vertices in the current pose (FootballGround.LowestVertex's bake).
    static Vector3[] Bake(SkinnedMeshRenderer r,Mesh scratch){foreach(var b in r.bones)if(b!=null)_=b.position;r.BakeMesh(scratch,false);var v=scratch.vertices;var o=r.transform.position;var q=r.transform.rotation;for(int i=0;i<v.Length;i++)v[i]=o+q*v[i];return v;}
    static bool SameAll(Vector3[] a,Vector3[] b){if(a.Length!=b.Length)return false;for(int i=0;i<a.Length;i++)if(!Same(a[i],b[i]))return false;return true;}
}

// Paired visible surface (Klares Low-Poly). On an actor with a ground skin the drawn skin is the
// candidate and the ground skin the release reference: the release mesh on the same bones in the
// same pose (its bake is bit-identical to the release skin, LowPolyGroundDiagnostics), so every
// measured picture carries its own reference. Actors without a ground skin (the release path) are
// not measured. Regions by the main bone of a vertex: boot (Foot, ToeBase, Toe_End), glove (Hand
// and below), body (everything but the boots, gloves included). Two kinds of gate:
//  absolute, where an existing limit holds for the drawn release surface: boot lowest (lowest boot
//    point above the turf) locomotion -0.01 m (natural-motion), slide -0.035 m (FootballDuelTests,
//    boots through the slide entry), otherwise -SoleTolerance (r11); body lowest (gloves included)
//    locomotion -0.01 m, otherwise -SoleTolerance (the r11 skinned sole) where the caller gates it.
//    Within the limit passes; outside, inherited only when the release reference is outside too
//    and the candidate is not worse (NotWorse, 1e-4 m); candidate-only and candidate-worse fail.
//  paired, where the drawn release surface itself misses the existing limit (an inherited error
//    the limit cannot judge): the boot surface on the received ball (nearest boot triangle to the
//    ball centre minus the radius; r11's 0.03 m rule is defined on a bone proxy and the drawn
//    release boot lies 3-5 cm inside the ball in many contact pictures), the glove on the held or
//    contact ball (the farther glove of a two-hand contact; the release holds the ball inside the
//    gloves), boots and body in keeper saves (release boots 4.5-8.9 cm below the turf) and the body
//    in slides (the support hand up to 24 cm below the turf). The candidate may be at most
//    PairTolerance (0.01 m: the tightest existing visible-surface limit, the locomotion sole; below
//    the 0.03 m contact limit) worse than the release reference in the same picture; the absolute
//    classification against the existing limit is reported with every picture (pairedBeyond).
public sealed class VisibleSurfaceProbe {
    public const float SlideBootLimit=.035f,NotWorse=1e-4f,PairTolerance=.01f,Radius=.1764f;
    public const string Note="paired visible surface: drawn skin against the ground skin (release mesh, same bones and pose). Absolute (strict) where an existing limit holds for the drawn release surface: boot lowest -0.01 m locomotion / -0.035 m slide (Duel) / -0.02 m otherwise, body lowest (gloves included) -0.01 m locomotion / -0.02 m where gated; outside a limit only an equally failing release reference with a candidate excess <= 1e-4 m is inherited. Paired where the drawn release surface itself misses the limit: boot and glove surface on the ball (|gap| limit 0.03 m reported), boots and body in keeper saves, body in slides: candidate at most 0.01 m worse than the release reference, absolute crossings reported";
    [Serializable] public class Entry {public string quantity,context,status,at,bone,releaseBone;public float candidate,release,excess,limit;}
    // paired: pictures of a paired quantity; pairedBeyond / pairedCandidateOnly / pairedWorse: of those the candidate outside the
    // existing limit / with the release reference inside it / worse than an outside release reference (all within PairTolerance unless failed).
    [Serializable] public class Summary {public string quantity,context,mode;public float limit;public int pictures,passed,inherited,failed,paired,pairedBeyond,pairedCandidateOnly,pairedWorse;public Entry candidateWorst,excessWorst;}
    [Serializable] public class Snapshot {public string suite,sourceId,matchMesh,groundMesh,note,line;public int pictures,failed,inherited,pairedBeyond;public Summary[] summaries;public Entry[] failures,inheritedEntries,pairedBeyondEntries,all;}
    // Set by a suite for its run; null: not measured.
    public static VisibleSurfaceProbe Current;
    public readonly string suite;public bool keepAll;public int Pictures,Failed,Inherited,PairedBeyond;
    readonly Dictionary<string,Summary> sums=new Dictionary<string,Summary>();readonly List<Summary> order=new List<Summary>();
    readonly List<Entry> failures=new List<Entry>(),inherited=new List<Entry>(),beyond=new List<Entry>(),all=new List<Entry>(),fresh=new List<Entry>();
    string matchMesh,groundMesh;Mesh[] scratch;
    public VisibleSurfaceProbe(string suite){this.suite=suite;}
    public void Dispose(){if(scratch!=null)foreach(var m in scratch)if(m!=null)UnityEngine.Object.DestroyImmediate(m);scratch=null;}

    sealed class Regions {public int[] region;public string[] bone;public int[][] tris;}
    static readonly Dictionary<Mesh,Regions> cache=new Dictionary<Mesh,Regions>();
    public static void Forget(Mesh mesh){if(mesh!=null)cache.Remove(mesh);}
    // 0 left boot, 1 right boot, 2 left glove, 3 right glove, 4 body; triangles touching each of 0..3.
    static Regions Of(SkinnedMeshRenderer r){
        var mesh=r.sharedMesh;if(cache.TryGetValue(mesh,out var g))return g;
        var w=mesh.boneWeights;var bones=r.bones;g=new Regions{region=new int[w.Length],bone=new string[w.Length],tris=new int[4][]};
        for(int i=0;i<w.Length;i++){var b=bones[w[i].boneIndex0];var n=b!=null?b.name.Replace("mixamorig:",""):"?";g.bone[i]=n;
            g.region[i]=n=="LeftFoot"||n=="LeftToeBase"||n=="LeftToe_End"?0:n=="RightFoot"||n=="RightToeBase"||n=="RightToe_End"?1:n.StartsWith("LeftHand")?2:n.StartsWith("RightHand")?3:4;}
        var t=mesh.triangles;var lists=new List<int>[4];for(int k=0;k<4;k++)lists[k]=new List<int>();
        for(int i=0;i+2<t.Length;i+=3)for(int k=0;k<4;k++)if(g.region[t[i]]==k||g.region[t[i+1]]==k||g.region[t[i+2]]==k){lists[k].Add(t[i]);lists[k].Add(t[i+1]);lists[k].Add(t[i+2]);}
        for(int k=0;k<4;k++)g.tris[k]=lists[k].ToArray();cache[mesh]=g;return g;
    }
    public static int[] RegionsOf(SkinnedMeshRenderer r)=>Of(r).region;
    static SkinnedMeshRenderer DrawnOf(Transform actor){foreach(var r in actor.GetComponentsInChildren<SkinnedMeshRenderer>())if(!FootballGround.IsGroundSkin(r))return r;return null;}
    static Vector3[] Positions(SkinnedMeshRenderer r,Mesh scratch){foreach(var b in r.bones)if(b!=null)_=b.position;r.BakeMesh(scratch,false);var v=scratch.vertices;var o=r.transform.position;var q=r.transform.rotation;for(int i=0;i<v.Length;i++)v[i]=o+q*v[i];return v;}
    // region 0..3, or Body: every vertex but the boots (gloves included).
    const int Body=-1;
    static int LowestIndex(Vector3[] v,Regions g,int region){float low=float.MaxValue;int at=-1;for(int i=0;i<v.Length;i++)if((region==Body?g.region[i]>=2:g.region[i]==region)&&v[i].y<low){low=v[i].y;at=i;}return at;}
    // Lowest point of a region of the release reference (ground skin) in the current pose (sentinel geometry).
    public static Vector3 LowestPoint(Transform actor,int region){var ground=FootballGround.GroundSkin(actor);var m=new Mesh();try{var v=Positions(ground,m);return v[LowestIndex(v,Of(ground),region)];}finally{UnityEngine.Object.DestroyImmediate(m);}}
    public static float LowestOf(Transform actor,int region,bool reference){var r=reference?FootballGround.GroundSkin(actor):DrawnOf(actor);var m=new Mesh();try{var v=Positions(r,m);return v[LowestIndex(v,Of(r),region)].y-FootballGround.PitchSurface;}finally{UnityEngine.Object.DestroyImmediate(m);}}
    // Closest point on triangle abc to p (Ericson, Real-Time Collision Detection 5.1.5).
    public static Vector3 Closest(Vector3 p,Vector3 a,Vector3 b,Vector3 c){
        var ab=b-a;var ac=c-a;var ap=p-a;float d1=Vector3.Dot(ab,ap),d2=Vector3.Dot(ac,ap);if(d1<=0&&d2<=0)return a;
        var bp=p-b;float d3=Vector3.Dot(ab,bp),d4=Vector3.Dot(ac,bp);if(d3>=0&&d4<=d3)return b;
        float vc=d1*d4-d3*d2;if(vc<=0&&d1>=0&&d3<=0)return a+ab*(d1/(d1-d3));
        var cp=p-c;float d5=Vector3.Dot(ab,cp),d6=Vector3.Dot(ac,cp);if(d6>=0&&d5<=d6)return c;
        float vb=d5*d2-d1*d6;if(vb<=0&&d2>=0&&d6<=0)return a+ac*(d2/(d2-d6));
        float va=d3*d6-d5*d4;if(va<=0&&d4-d3>=0&&d5-d6>=0)return b+(c-b)*((d4-d3)/((d4-d3)+(d5-d6)));
        float sum=va+vb+vc;if(!(Mathf.Abs(sum)>1e-20f))return a;return a+ab*(vb/sum)+ac*(vc/sum);
    }
    // Ball surface to the nearest point of a region's triangles (negative: the surface is inside the ball).
    static float Gap(Vector3[] v,int[] tris,Vector3 centre){float best=float.MaxValue;for(int i=0;i+2<tris.Length;i+=3)best=Mathf.Min(best,(Closest(centre,v[tris[i]],v[tris[i+1]],v[tris[i+2]])-centre).sqrMagnitude);return best==float.MaxValue?float.NaN:Mathf.Sqrt(best)-Radius;}
    public static float BootLimit(string context)=>context=="locomotion"?-.01f:context=="slide"?-SlideBootLimit:-NaturalMotionDiagnostics.SoleTolerance;
    public static float BodyLimit(string context)=>context=="locomotion"?-.01f:-NaturalMotionDiagnostics.SoleTolerance;
    public static float Excess(float c,float r,bool higher)=>higher?r-c:Mathf.Abs(c)-Mathf.Abs(r);
    // higher: a lowest point (at least limit); otherwise a gap (|gap| at most limit).
    public static string Classify(float c,float r,float limit,bool higher){
        bool Within(float x)=>higher?x>=limit-1e-6f:Mathf.Abs(x)<=limit+1e-6f;
        if(Within(c))return "passed";if(Within(r))return "candidate-only";
        return Excess(c,r,higher)<=NotWorse?"inherited":"candidate-worse";
    }
    // Gate result of a picture: absolute (strict) or paired (excess at most PairTolerance).
    public static bool Fails(float c,float r,float limit,bool higher,bool paired){
        if(paired)return Excess(c,r,higher)>PairTolerance+1e-6f;var s=Classify(c,r,limit,higher);return s=="candidate-only"||s=="candidate-worse";
    }
    // One picture of an actor (false without a ground skin). foot: 0/1 the contact boot on ball (centre),
    // gloves: 1 right, 2 left, 3 both on ball; bodyAbsolute/bootAbsolute: an existing limit holds for the body/boots in this suite.
    public bool Picture(Transform actor,string at,string context,bool bodyAbsolute,int foot=-1,int gloves=0,Vector3 ball=default,bool bootAbsolute=true){
        var ground=FootballGround.GroundSkin(actor);if(ground==null)return false;var drawn=DrawnOf(actor);if(drawn==null||drawn.sharedMesh==null)return false;
        if(scratch==null)scratch=new[]{new Mesh(),new Mesh()};matchMesh=drawn.sharedMesh.name;groundMesh=ground.sharedMesh.name;Pictures++;
        var c=Positions(drawn,scratch[0]);var g=Positions(ground,scratch[1]);var rc=Of(drawn);var rg=Of(ground);
        void Lowest(string quantity,int region,bool absolute,float limit){int a=LowestIndex(c,rc,region),b=LowestIndex(g,rg,region);if(a<0||b<0)return;Judge(quantity,context,!absolute,limit,c[a].y-FootballGround.PitchSurface,g[b].y-FootballGround.PitchSurface,true,at,rc.bone[a],rg.bone[b]);}
        Lowest("boot left lowest m",0,bootAbsolute,BootLimit(context));Lowest("boot right lowest m",1,bootAbsolute,BootLimit(context));Lowest("body lowest m",Body,bodyAbsolute&&context!="slide",BodyLimit(context));
        if(foot==0||foot==1)Judge("boot "+(foot==0?"left":"right")+" surface to received ball surface m",context,true,NaturalMotionDiagnostics.ContactReachLimit,Gap(c,rc.tris[foot],ball),Gap(g,rg.tris[foot],ball),false,at);
        if(gloves>0){float gc=0,gr=0;for(int h=0;h<2;h++){if((gloves&(h==0?2:1))==0)continue;float x=Gap(c,rc.tris[2+h],ball),y=Gap(g,rg.tris[2+h],ball);if(!(Mathf.Abs(x)<=Mathf.Abs(gc)))gc=x;if(!(Mathf.Abs(y)<=Mathf.Abs(gr)))gr=y;}
            Judge("glove surface to held/contact ball surface m",context,true,NaturalMotionDiagnostics.ContactReachLimit,gc,gr,false,at);}
        return true;
    }
    public void Judge(string quantity,string context,bool paired,float limit,float c,float r,bool higher,string at,string bone=null,string releaseBone=null){
        if(float.IsNaN(c)||float.IsNaN(r))return;
        var key=quantity+"|"+context;if(!sums.TryGetValue(key,out var s)){s=new Summary{quantity=quantity,context=context,mode=paired?"paired":"absolute",limit=limit};sums[key]=s;order.Add(s);}
        var judged=Classify(c,r,limit,higher);bool fails=Fails(c,r,limit,higher,paired);
        var status=paired?"paired "+judged+(fails?", beyond the pair tolerance":""):judged;
        var e=new Entry{quantity=quantity,context=context,status=status,at=at,bone=bone,releaseBone=releaseBone,candidate=c,release=r,excess=Excess(c,r,higher),limit=limit};
        s.pictures++;
        if(paired){s.paired++;if(judged!="passed"){s.pairedBeyond++;PairedBeyond++;if(judged=="candidate-only")s.pairedCandidateOnly++;else if(judged=="candidate-worse")s.pairedWorse++;if(beyond.Count<300){beyond.Add(e);fresh.Add(e);}}}
        if(fails)s.failed++;else if(!paired&&judged=="inherited")s.inherited++;else s.passed++;
        if(s.candidateWorst==null||(higher?c<s.candidateWorst.candidate:Mathf.Abs(c)>Mathf.Abs(s.candidateWorst.candidate))){s.candidateWorst=e;fresh.Add(e);}
        if(s.excessWorst==null||e.excess>s.excessWorst.excess){s.excessWorst=e;fresh.Add(e);}
        if(fails){Failed++;if(failures.Count<200){failures.Add(e);fresh.Add(e);}}
        else if(!paired&&judged=="inherited"){Inherited++;if(inherited.Count<200){inherited.Add(e);fresh.Add(e);}}
        if(keepAll){all.Add(e);fresh.Add(e);}
    }
    // Prefixes the pictures since the last label with a case name (suites that measure inside a shared sampler).
    public void Label(string name){foreach(var e in fresh)if(!e.at.StartsWith(name+" "))e.at=name+" "+e.at;fresh.Clear();}
    public bool Has(string quantity,string status)=>failures.Exists(e=>e.quantity==quantity&&e.status.Contains(status));
    static string F(float v)=>v.ToString("0.0000",System.Globalization.CultureInfo.InvariantCulture);
    public string Line(){
        var sb=new System.Text.StringBuilder("visible pictures="+Pictures+" failed="+Failed+" inherited="+Inherited+" paired-beyond-limit="+PairedBeyond);
        foreach(var s in order){if(s.failed==0&&s.inherited==0&&s.pairedBeyond==0)continue;
            sb.Append("; "+s.quantity+" ["+s.context+", "+s.mode+(s.mode=="paired"?": "+s.pairedBeyond+" of "+s.paired+" beyond "+F(s.limit)+" (candidate only "+s.pairedCandidateOnly+", candidate worse "+s.pairedWorse+")":"")+"]: candidate worst "+F(s.candidateWorst.candidate)+" (release "+F(s.candidateWorst.release)+") at "+s.candidateWorst.at+", worst candidate excess "+F(s.excessWorst.excess)+" at "+s.excessWorst.at+(s.excessWorst.bone!=null?" ("+s.excessWorst.bone+"/"+s.excessWorst.releaseBone+")":"")+" inherited "+s.inherited+" failed "+s.failed);}
        if(failures.Count>0)sb.Append("; first failure: "+failures[0].quantity+" "+failures[0].status+" candidate "+F(failures[0].candidate)+" release "+F(failures[0].release)+" limit "+F(failures[0].limit)+" at "+failures[0].at);
        return sb.ToString();
    }
    public Snapshot Result()=>new Snapshot{suite=suite,sourceId=ProbeBuildIdentity.SourceId,matchMesh=matchMesh,groundMesh=groundMesh,note=Note,line=Line(),pictures=Pictures,failed=Failed,inherited=Inherited,pairedBeyond=PairedBeyond,summaries=order.ToArray(),failures=failures.ToArray(),inheritedEntries=inherited.ToArray(),pairedBeyondEntries=beyond.ToArray(),all=all.ToArray()};
    // Ends a suite's run: writes <folder>/<file> when anything was measured; returns its line or null.
    public string Finish(string folder,string file){
        Dispose();if(Current==this)Current=null;if(Pictures==0)return null;
        Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,file),JsonUtility.ToJson(Result(),true));return Line();
    }
}
#endif

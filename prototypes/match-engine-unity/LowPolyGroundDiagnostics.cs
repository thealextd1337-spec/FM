#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections;
using System.Collections.Generic;
using System.Reflection;
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
// Requirements (the run fails otherwise): the scene references the ground mesh;
// one disabled, material-less ground skin per actor on the drawn skin's parent,
// transform, bones, root bone and quality, idempotent and removed again for the
// release mesh, also through ProbeBridge.WorldCommand loads; a disabled ground
// skin bakes like an enabled one and like the release skin; candidate profile,
// pose, ground shift and ground measurement bit-identical to the release actor.
// Reported apart: the legacy deltas (the R15 mechanism, Of(walking)) and the
// DRAWN low-poly surface: its lowest vertex against the turf with the existing
// natural-motion limits (locomotion below -1 cm, anything below -SoleTolerance),
// boot and glove deviation from the ground skin and the glove gap to the held
// ball. The surface checks are clip samples on the rig; the native-picture
// gates of NaturalMotionDiagnostics stay authoritative.
public static class LowPolyGroundDiagnostics {
    [Serializable] public class Check {public string name,detail;public bool ok;}
    [Serializable] public class ProfileValue {public string name;public float release,candidate,legacy;}
    // -9: not sampled (JsonUtility would write NaN, which JSON readers reject).
    [Serializable] public class Surface {public string pose;public bool locomotion,keeper;public float visibleSole=-9,releaseSole=-9,groundSole=-9,bootDeviationMax=-9,bootLowestDeltaLeft=-9,bootLowestDeltaRight=-9,gloveDeviationMax=-9,gloveGapVisible=-9,gloveGapRelease=-9;}
    [Serializable] class Report {
        public string sourceId,unity,device,matchMesh,groundMesh,note;public Check[] checks;
        public float rootHeightRelease,rootHeightCandidate,rootHeightLegacy,walkingOffsetRelease,walkingOffsetCandidate,walkingOffsetLegacy;
        public int profileValues,profileCandidateDiffering,profileLegacyDiffering;public ProfileValue[] profileDiffering;
        public int poses,posesCandidateExact;public float legacyBoneMax;public string legacyBoneMaxAt;
        public Surface[] surfaces;public float visibleSoleMin,releaseSoleMin,bootDeviationMax,gloveDeviationMax;
        public string[] visibleViolations,releaseAlsoViolates;}
    const BindingFlags Hidden=BindingFlags.NonPublic|BindingFlags.Instance;
    const float BallRadius=.1764f;
    sealed class Rig {public string name;public GameObject go;public PlayableGraph graph;public FootballAnimation anim;public Transform[] bones;}
    static bool Same(float a,float b)=>BitConverter.SingleToInt32Bits(a)==BitConverter.SingleToInt32Bits(b);
    static float J(float v)=>float.IsNaN(v)?-9:v;
    static bool Same(Vector3 a,Vector3 b)=>Same(a.x,b.x)&&Same(a.y,b.y)&&Same(a.z,b.z);
    static bool Same(Quaternion a,Quaternion b)=>Same(a.x,b.x)&&Same(a.y,b.y)&&Same(a.z,b.z)&&Same(a.w,b.w);
    static void ClearProfiles(){((IDictionary)typeof(FootballGround).GetField("profiles",BindingFlags.NonPublic|BindingFlags.Static).GetValue(null)).Clear();}
    static int GroundSkins(GameObject go){int n=0;foreach(var r in go.GetComponentsInChildren<SkinnedMeshRenderer>(true))if(FootballGround.IsGroundSkin(r))n++;return n;}
    static SkinnedMeshRenderer Drawn(GameObject go){foreach(var r in go.GetComponentsInChildren<SkinnedMeshRenderer>())if(!FootballGround.IsGroundSkin(r))return r;return null;}

    public static string Run(string repository,string outputFolder=null){
        var bridge=UnityEngine.Object.FindFirstObjectByType<ProbeBridge>()??throw new InvalidOperationException("ProbeBridge is missing (open Probe.unity)");
        var checks=new List<Check>();void Require(bool ok,string name,string detail=null){checks.Add(new Check{name=name,ok=ok,detail=detail});}
        var original=AssetDatabase.LoadAssetAtPath<Mesh>(LowPolySetup.Original);var drawnMesh=LowPolySetup.MatchMesh();var ground=LowPolySetup.GroundMesh();
        if(drawnMesh==original)throw new InvalidOperationException("The probe scene shows the release mesh; run D6Cli.MatchMesh -d6mesh lowpoly first");
        // Scene references: the ground mesh is serialized on the bridge, so the build keeps it.
        Require(ground!=null&&AssetDatabase.GetAssetPath(ground)==LowPolySetup.Original,"scene ground mesh is WorldPlayer.asset",ground!=null?AssetDatabase.GetAssetPath(ground):"null");
        Require(Array.IndexOf(AssetDatabase.GetDependencies("Assets/Doppel6EngineProbe/Probe.unity",true),LowPolySetup.Original)>=0,"saved probe scene depends on WorldPlayer.asset (kept in the WebGL build)");
        Require(AssetDatabase.GetAssetPath(drawnMesh)==LowPolySetup.Asset,"scene match mesh is "+LowPolySetup.Asset,AssetDatabase.GetAssetPath(drawnMesh));
        var clips=Array.FindAll((AnimationClip[])typeof(ProbeBridge).GetMethod("FootballClips",Hidden).Invoke(bridge,null),c=>c!=null);
        AnimationClip Clip(string n)=>Array.Find(clips,c=>c.name==n);
        var report=new Report{sourceId=ProbeBuildIdentity.SourceId,unity=Application.unityVersion,device=SystemInfo.graphicsDeviceType.ToString(),matchMesh=drawnMesh.name,groundMesh=ground!=null?ground.name:null,
            note="Editor clip samples on the actual prefab and catalogue (cut poses, actors at the same root). Bit-identity of the candidate to the release actor is required; the drawn low-poly surface is reported against the existing natural-motion limits. Not a GPU, device or WebGL measurement."};
        var scene=EditorSceneManager.NewPreviewScene();var rigs=new List<Rig>();var scratch=new[]{new Mesh(),new Mesh(),new Mesh()};
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

            // Poses: release vs candidate bit-identity, legacy delta, drawn surface.
            var surfaces=new List<Surface>();var violations=new List<string>();var shared=new List<string>();int poses=0,exact=0;float legacyMax=0;string legacyAt=null;
            var feet=new[]{Group(drawnSkin,"LeftFoot","LeftToeBase","LeftToe_End"),Group(drawnSkin,"RightFoot","RightToeBase","RightToe_End")};var groundFeet=new[]{Group(groundSkin,"LeftFoot","LeftToeBase","LeftToe_End"),Group(groundSkin,"RightFoot","RightToeBase","RightToe_End")};
            var hands=Group(drawnSkin,"LeftHand","RightHand");var groundHands=Group(groundSkin,"LeftHand","RightHand");var releaseHands=Group(Drawn(release.go),"LeftHand","RightHand");
            var locomotion=new[]{"idle_stand_meshy","walking","running","sprint_forward"};var keeper=new[]{"keeper_ready_meshy","keeper_low_meshy","keeper_high_meshy","keeper_dive_meshy"};
            var names=new[]{"idle_stand_meshy","walking","running","sprint_forward","receive_ground_meshy","pass_inside_meshy","shot_meshy","foul_stumble_meshy","keeper_ready_meshy","keeper_shuffle_meshy","keeper_low_meshy","keeper_high_meshy","keeper_dive_meshy","keeper_rise_meshy"};
            var list=new List<(string label,FootballAnimation.Pose pose,bool loco,bool keep)>();
            foreach(var n in names){var c=Clip(n);if(c==null){Require(false,"catalogue clip "+n+" is present");continue;}
                for(int s=0;s<24;s++)list.Add((n+"@"+(s/23f).ToString("0.00"),new FootballAnimation.Pose{clip=c,time=s*(c.length-.001)/23,key="ground-"+n,loop=false},Array.IndexOf(locomotion,n)>=0,Array.IndexOf(keeper,n)>=0));}
            var sprint=Clip("sprint_forward");
            if(sprint!=null)foreach(var lead in new[]{false,true})foreach(var w in new[]{.25f,.5f,1f})
                list.Add(("slide "+(lead?"left":"right")+" "+w.ToString("0.00"),new FootballAnimation.Pose{clip=sprint,time=release.anim.StrideTime(lead?.5:0,sprint),loop=true,key="slide:1",kind="slide",urgent=true,slide=w,leftLead=lead,target=new Vector3(.25f,.18f,.85f)},false,false));
            double clock=100;
            for(int k=0;k<list.Count;k++){
                var (label,pose,loco,keep)=list[k];clock+=.5;foreach(var rig in rigs)rig.anim.Sample(pose,clock,true);poses++;
                bool same=Same(release.anim.GroundShift,candidate.anim.GroundShift)&&Same(release.anim.TurfShift,candidate.anim.TurfShift)&&Same(release.go.transform.position,candidate.go.transform.position);
                for(int b=0;b<release.bones.Length;b++){same&=Same(release.bones[b].position,candidate.bones[b].position)&&Same(release.bones[b].rotation,candidate.bones[b].rotation);
                    float d=Vector3.Distance(release.bones[b].position,legacy.bones[b].position);if(d>legacyMax){legacyMax=d;legacyAt=label+" "+release.bones[b].name;}}
                float releaseGround=FootballGround.LowestVertex(release.go.transform),candidateGround=FootballGround.LowestVertex(candidate.go.transform);same&=Same(releaseGround,candidateGround);
                if(same)exact++;
                var s=new Surface{pose=label,locomotion=loco,keeper=keep,visibleSole=FootballGround.VisibleLowestVertex(candidate.go.transform)+candidate.go.transform.position.y,releaseSole=FootballGround.VisibleLowestVertex(release.go.transform)+release.go.transform.position.y,groundSole=candidateGround+candidate.go.transform.position.y};
                if(k%3==0||keep&&k%2==0){
                    var drawn=Bake(drawnSkin,scratch[0]);var authoritative=Bake(groundSkin,scratch[1]);
                    s.bootDeviationMax=Mathf.Max(Deviation(drawn,feet[0],authoritative,groundFeet[0]),Deviation(drawn,feet[1],authoritative,groundFeet[1]));
                    s.bootLowestDeltaLeft=LowestY(drawn,feet[0])-LowestY(authoritative,groundFeet[0]);s.bootLowestDeltaRight=LowestY(drawn,feet[1])-LowestY(authoritative,groundFeet[1]);
                    if(keep){s.gloveDeviationMax=Deviation(drawn,hands,authoritative,groundHands);var centre=candidate.anim.rig.HeldBallCentre;s.gloveGapVisible=Gap(drawn,hands,centre);s.gloveGapRelease=Gap(Bake(Drawn(release.go),scratch[2]),releaseHands,release.anim.rig.HeldBallCentre);}
                }
                bool below(float v,bool l)=>l?v< -.01f:v< -NaturalMotionDiagnostics.SoleTolerance;
                if(below(s.visibleSole,loco)){var what=label+": drawn sole "+s.visibleSole.ToString("0.0000")+" m (release "+s.releaseSole.ToString("0.0000")+", limit "+(loco?"-0.01 locomotion":"-"+NaturalMotionDiagnostics.SoleTolerance)+")";if(below(s.releaseSole,loco))shared.Add(what);else violations.Add(what);}
                surfaces.Add(s);
            }
            report.poses=poses;report.posesCandidateExact=exact;report.legacyBoneMax=legacyMax;report.legacyBoneMaxAt=legacyAt;report.surfaces=surfaces.ToArray();report.visibleViolations=violations.ToArray();report.releaseAlsoViolates=shared.ToArray();
            report.visibleSoleMin=float.MaxValue;report.releaseSoleMin=float.MaxValue;foreach(var s in surfaces){report.visibleSoleMin=Mathf.Min(report.visibleSoleMin,s.visibleSole);report.releaseSoleMin=Mathf.Min(report.releaseSoleMin,s.releaseSole);if(s.bootDeviationMax>-9)report.bootDeviationMax=Mathf.Max(report.bootDeviationMax,s.bootDeviationMax);if(s.gloveDeviationMax>-9)report.gloveDeviationMax=Mathf.Max(report.gloveDeviationMax,s.gloveDeviationMax);}
            Require(exact==poses,"candidate pose, ground shift and ground measurement bit-identical to the release actor",exact+"/"+poses);
            Require(!groundSkin.enabled&&GroundSkins(candidate.go)==1,"ground skin still disabled and single after all samples");
        }finally{foreach(var r in rigs)if(r.graph.IsValid())r.graph.Destroy();foreach(var m in scratch)UnityEngine.Object.DestroyImmediate(m);EditorSceneManager.ClosePreviewScene(scene);}

        // The match view itself: two loads through ProbeBridge.WorldCommand.
        {var config=JsonUtility.FromJson<WorldConfig>(File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json")));
         for(int round=0;round<2;round++){
             Drop(bridge);bridge.WorldCommand(JsonUtility.ToJson(new WorldCommand{kind="load",config=config}));
             var actors=(List<Transform>)typeof(ProbeBridge).GetField("actors",Hidden).GetValue(bridge);var football=(List<FootballAnimation>)typeof(ProbeBridge).GetField("football",Hidden).GetValue(bridge);
             bool ok=actors.Count==config.players.Length&&football.Count==actors.Count;int enabled=0;
             foreach(var a in actors){var g=FootballGround.GroundSkin(a);ok&=GroundSkins(a.gameObject)==1&&g!=null&&!g.enabled&&g.sharedMesh==ground&&Drawn(a.gameObject).sharedMesh==drawnMesh&&g.transform.parent==Drawn(a.gameObject).transform.parent;
                 foreach(var r in a.GetComponentsInChildren<Renderer>())if(r.enabled)enabled++;}
             Require(ok&&enabled==actors.Count,"match view load "+(round+1)+": one disabled ground skin and one drawn renderer per actor","actors="+actors.Count+" enabled renderers="+enabled);
         }
         Drop(bridge);}

        report.checks=checks.ToArray();
        var folder=Path.Combine(repository,outputFolder??"outputs/style-demos/lowpoly-fix/unity");Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,"lowpoly-ground.json"),JsonUtility.ToJson(report,true));
        int failed=checks.FindAll(c=>!c.ok).Count;
        var summary="checks="+checks.Count+" failed="+failed+" profile="+report.profileCandidateDiffering+"/"+report.profileValues+" differ (legacy "+report.profileLegacyDiffering+") poses exact="+report.posesCandidateExact+"/"+report.poses+" Of(walking) release="+report.walkingOffsetRelease.ToString("R")+" candidate="+report.walkingOffsetCandidate.ToString("R")+" legacy="+report.walkingOffsetLegacy.ToString("R")+" drawn sole min="+report.visibleSoleMin.ToString("0.0000")+" (release "+report.releaseSoleMin.ToString("0.0000")+") violations="+report.visibleViolations.Length+" shared="+report.releaseAlsoViolates.Length;
        if(failed>0||report.visibleViolations.Length>0)throw new InvalidOperationException("Low-poly ground: "+summary+"; first failure: "+(failed>0?checks.Find(c=>!c.ok).name:report.visibleViolations[0]));
        return summary;
    }
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
    // Vertices whose main bone is one of the named rig bones.
    static int[] Group(SkinnedMeshRenderer r,params string[] bones){var w=r.sharedMesh.boneWeights;var all=r.bones;var list=new List<int>();for(int i=0;i<w.Length;i++){var b=all[w[i].boneIndex0];if(b!=null&&Array.IndexOf(bones,b.name.Replace("mixamorig:",""))>=0)list.Add(i);}return list.ToArray();}
    // Largest distance of a vertex of either group to the nearest vertex of the other (metres).
    static float Deviation(Vector3[] a,int[] ia,Vector3[] b,int[] ib){
        float One(Vector3[] x,int[] ix,Vector3[] y,int[] iy){float worst=0;foreach(var i in ix){float best=float.MaxValue;foreach(var j in iy){float d=(x[i]-y[j]).sqrMagnitude;if(d<best)best=d;}if(best<float.MaxValue)worst=Mathf.Max(worst,best);}return worst;}
        return Mathf.Sqrt(Mathf.Max(One(a,ia,b,ib),One(b,ib,a,ia)));
    }
    static float LowestY(Vector3[] v,int[] group){float low=float.MaxValue;foreach(var i in group)low=Mathf.Min(low,v[i].y);return low;}
    // Distance of the nearest glove vertex to the surface of a ball held at centre (negative: inside the ball).
    static float Gap(Vector3[] v,int[] group,Vector3 centre){float best=float.MaxValue;foreach(var i in group)best=Mathf.Min(best,Vector3.Distance(v[i],centre));return best-BallRadius;}
}
#endif

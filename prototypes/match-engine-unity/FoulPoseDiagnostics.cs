#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using System.Reflection;
using UnityEngine;
using UnityEngine.Animations;
using UnityEngine.Playables;
using UnityEditor;
using UnityEditor.SceneManagement;
using Doppel6.Probe;
// B11 (fix/r132-anim): where does the foul offender's T-pose come from? Measures, on the actual
// rig and the scene's match mesh, (1) the bind pose itself (from the mesh bind poses and from an
// all-zero mixer), (2) every picture of foul_stumble_meshy and the other offender clips, and (3)
// the offender sequence exactly as FootballPresentation builds it (sprint stride -> foulOffender
// over 2.7 s -> standing), with the mixer weight sum and NaN state of every picture.
// Metric (FootballAnimation.ArmAbduction): the angle between each upper arm (shoulder -> elbow)
// and the body's down axis (-root.up). A T-pose holds both arms near 90 degrees; hanging arms
// stay far below. bindDistance: the largest local-rotation difference of the arm chain to the
// bind pose (0 in a T-pose).
public static class FoulPoseDiagnostics {
    [Serializable] class Picture {public float time,abductionL,abductionR,bindDistance,hips,weightSum;public bool nan;public string clip,baseClip;public float actionWeight;}
    [Serializable] class ClipScan {public string clip;public float length,abductionMax,abductionAtStart,bindDistanceAtStart,bindDistanceMin;public float abductionMaxAt;public Picture[] pictures;}
    [Serializable] class Report {public string sourceId,matchMesh;public float bindAbductionL,bindAbductionR,zeroMixAbductionL,zeroMixAbductionR,zeroMixBindDistance,idleAbductionMax;public ClipScan[] clips;public Picture[] offender,offenderSelector;public float offenderAbductionMax,offenderAbductionMaxAt,offenderBindDistanceMin,offenderWeightSumMin,offenderWeightSumMax;public int offenderNanPictures;public string[] checks,notes;}
    const string Asset="Assets/Doppel6EngineProbe/Art/football-v130.fbx";
    static AnimationClip Clip(string name){return Array.Find(AssetDatabase.LoadAllAssetsAtPath(Asset),a=>a is AnimationClip&&a.name==name) as AnimationClip??AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Doppel6EngineProbe/Art/"+name+".anim")??throw new Exception("Missing clip "+name);}
    public static string Run(string repository,string outputFolder=null){
        var checks=new List<string>();var notes=new List<string>();void Require(bool ok,string name){if(!ok)throw new Exception("Foul pose: "+name);checks.Add(name);}
        var scene=EditorSceneManager.NewPreviewScene();var actor=UnityEngine.Object.Instantiate(AssetDatabase.LoadAssetAtPath<GameObject>(Asset));UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(actor,scene);actor.transform.localScale=Vector3.one*1.45f;
        var drawn=LowPolySetup.Skin(actor);var skin=Array.Find(actor.GetComponentsInChildren<SkinnedMeshRenderer>(),s=>!FootballGround.IsGroundSkin(s));
        var animator=actor.GetComponent<Animator>();if(animator==null)animator=actor.AddComponent<Animator>();animator.applyRootMotion=false;
        var run=Clip("running");var sprint=Clip("sprint_forward");var idle=Clip("idle_stand_meshy");var rise=Clip("keeper_rise_meshy");var stumble=Clip("foul_stumble_meshy");var fall=Clip("foul_fall_meshy");var receive=Clip("receive_ground_meshy");var keeper=Clip("keeper_ready_meshy");var shuffle=Clip("keeper_shuffle_meshy");
        var graph=PlayableGraph.Create("D6 foul pose");graph.SetTimeUpdateMode(DirectorUpdateMode.Manual);var initial=AnimationClipPlayable.Create(graph,idle);AnimationPlayableOutput.Create(graph,"Character",animator).SetSourcePlayable(initial);graph.Play();graph.Evaluate(0);
        try{
            var animation=new FootballAnimation(graph,actor.transform,new[]{idle,run,sprint,rise,stumble,fall,receive,keeper,shuffle});
            actor.transform.position=new Vector3(0,animation.RootHeight,0);actor.transform.rotation=Quaternion.identity;
            var bones=actor.GetComponentsInChildren<Transform>();Transform Bone(string n)=>Array.Find(bones,t=>t.name=="mixamorig:"+n);
            var hips=Bone("Hips");
            // (1) The bind pose from the match mesh's bind poses (bone positions in skin space).
            var mesh=skin.sharedMesh;var skinBones=skin.bones;Vector3 BindPos(string n){int k=Array.FindIndex(skinBones,b=>b!=null&&b.name=="mixamorig:"+n);if(k<0)throw new Exception("bind bone "+n);var m=mesh.bindposes[k].inverse;return (Vector3)m.GetColumn(3);}
            Vector3 bindUp=(BindPos("Spine2")-BindPos("Hips")).normalized;
            float BindAbduction(string side){var a=BindPos(side+"Arm");var f=BindPos(side+"ForeArm");return Vector3.Angle(f-a,-bindUp);}
            var report=new Report{sourceId=ProbeBuildIdentity.SourceId,matchMesh=mesh.name,bindAbductionL=BindAbduction("Left"),bindAbductionR=BindAbduction("Right")};
            // (1b) An all-zero mixer: what the figure shows when no clip carries weight.
            var mixerField=typeof(FootballAnimation).GetField("mixer",BindingFlags.NonPublic|BindingFlags.Instance);var mixer=(AnimationMixerPlayable)mixerField.GetValue(animation);
            var weightsField=typeof(FootballAnimation).GetField("weights",BindingFlags.NonPublic|BindingFlags.Instance);var weights=(float[])weightsField.GetValue(animation);
            animation.Sample(new FootballAnimation.Pose{clip=idle,time=.3,loop=true,key="idle-ref"},1,true);
            var armBones=new[]{"LeftArm","LeftForeArm","RightArm","RightForeArm","LeftShoulder","RightShoulder"};
            // Bind local rotations: the prefab asset's own hierarchy (the FBX rest pose) is the bind pose of this rig.
            var rest=AssetDatabase.LoadAssetAtPath<GameObject>(Asset).GetComponentsInChildren<Transform>();Quaternion RestLocal(string n){return Array.Find(rest,t=>t.name=="mixamorig:"+n).localRotation;}
            float BindDistance(){float d=0;foreach(var n in armBones){var b=Bone(n);if(b==null)continue;d=Mathf.Max(d,Quaternion.Angle(b.localRotation,RestLocal(n)));}return d;}
            for(int i=0;i<mixer.GetInputCount();i++)mixer.SetInputWeight(i,0);graph.Evaluate(0);
            report.zeroMixAbductionL=FootballAnimation.ArmAbduction(actor.transform,false);report.zeroMixAbductionR=FootballAnimation.ArmAbduction(actor.transform,true);report.zeroMixBindDistance=BindDistance();
            notes.Add("zero-weight mixer shows abduction L/R "+report.zeroMixAbductionL.ToString("0.0")+"/"+report.zeroMixAbductionR.ToString("0.0")+" deg, bind distance "+report.zeroMixBindDistance.ToString("0.0")+" deg; mesh bind poses "+report.bindAbductionL.ToString("0.0")+"/"+report.bindAbductionR.ToString("0.0")+" deg");
            // (2) Every picture of the clips an offender can show.
            var scans=new List<ClipScan>();
            foreach(var clip in new[]{stumble,fall,rise,idle,keeper,sprint,run,receive}){
                var scan=new ClipScan{clip=clip.name,length=clip.length,bindDistanceMin=999};var pics=new List<Picture>();
                int steps=Mathf.Max(2,Mathf.CeilToInt(clip.length*30));
                for(int k=0;k<=steps;k++){double t=Math.Min(clip.length-.001,k/30.0);
                    animation.Sample(new FootballAnimation.Pose{clip=clip,time=t,loop=false,key="scan-"+clip.name},100+k/30.0,k==0);
                    var p=new Picture{time=(float)t,abductionL=FootballAnimation.ArmAbduction(actor.transform,false),abductionR=FootballAnimation.ArmAbduction(actor.transform,true),bindDistance=BindDistance(),hips=hips.position.y-actor.transform.position.y,clip=clip.name,weightSum=Sum(weights),nan=HasNaN(weights)};
                    pics.Add(p);float ab=Mathf.Max(p.abductionL,p.abductionR);if(ab>scan.abductionMax){scan.abductionMax=ab;scan.abductionMaxAt=p.time;}if(k==0){scan.abductionAtStart=ab;scan.bindDistanceAtStart=p.bindDistance;}scan.bindDistanceMin=Mathf.Min(scan.bindDistanceMin,p.bindDistance);}
                scan.pictures=pics.ToArray();scans.Add(scan);
                if(clip==idle)report.idleAbductionMax=scan.abductionMax;
            }
            report.clips=scans.ToArray();
            // (3) The offender sequence as FootballPresentation builds it (r21: stumble over the standing clip, lunge, turf stand,
            // 0.3 s entry from a sprint stride), 30 Hz, 0.5 s of standing afterwards. Measured after every composed picture.
            var offender=new List<Picture>();report.offenderBindDistanceMin=999;report.offenderWeightSumMin=9;report.offenderWeightSumMax=-9;
            animation.Sample(new FootballAnimation.Pose{clip=sprint,time=animation.StrideTime(.25,sprint),loop=true,key="run"},200-1/30.0,true);
            for(int k=0;k<=96;k++){double t=k/30.0;FootballAnimation.Pose p;
                if(t<=FootballDuelTiming.StumbleLength)p=new FootballAnimation.Pose{clip=stumble,time=t,loop=false,baseClip=idle,baseTime=20+t,baseLoop=true,actionWeight=FootballDuelTiming.OffenderStumble(t),lunge=FootballDuelTiming.OffenderLunge(t),key="foul:offender",kind="foot",turfStand=true,fade=.3f};
                else p=new FootballAnimation.Pose{clip=idle,time=20+t,loop=true,key="idle",kind="foot"};
                animation.Sample(p,200+t);
                var pic=new Picture{time=(float)t,abductionL=FootballAnimation.ArmAbduction(actor.transform,false),abductionR=FootballAnimation.ArmAbduction(actor.transform,true),bindDistance=BindDistance(),hips=hips.position.y-actor.transform.position.y,clip=p.clip.name,baseClip=p.baseClip?.name,actionWeight=animation.Weight(p.clip),weightSum=Sum(weights),nan=HasNaN(weights)};
                offender.Add(pic);float ab=Mathf.Max(pic.abductionL,pic.abductionR);if(ab>report.offenderAbductionMax){report.offenderAbductionMax=ab;report.offenderAbductionMaxAt=pic.time;}
                report.offenderBindDistanceMin=Mathf.Min(report.offenderBindDistanceMin,pic.bindDistance);report.offenderWeightSumMin=Mathf.Min(report.offenderWeightSumMin,pic.weightSum);report.offenderWeightSumMax=Mathf.Max(report.offenderWeightSumMax,pic.weightSum);if(pic.nan)report.offenderNanPictures++;}
            report.offender=offender.ToArray();
            // (3b) Through the actual selector (WorldFootballPose) with received foulOffender pictures at 30 Hz after a sprint.
            report.offenderSelector=Selector(repository,actor,animation,new Dictionary<string,AnimationClip>{{"run",run},{"sprint",sprint},{"idle",idle},{"rise",rise},{"stumble",stumble},{"fall",fall},{"shuffle",shuffle},{"receive",receive},{"keeper",keeper}},hips,weights,BindDistance);
            Require(report.offenderNanPictures==0,"offender sequence never carries a NaN mixer weight");
            Require(report.offenderWeightSumMin>.99f&&report.offenderWeightSumMax<1.01f,"offender sequence mixer weights sum to 1 ("+report.offenderWeightSumMin.ToString("0.000")+" .. "+report.offenderWeightSumMax.ToString("0.000")+")");
            report.checks=checks.ToArray();report.notes=notes.ToArray();
            var json=JsonUtility.ToJson(report,true);var folder=Path.Combine(repository,outputFolder??"outputs/3d-quality/fix-r132");Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,"foul-pose.json"),json);
            var stumbleScan=scans[0];
            return "bind L/R="+report.bindAbductionL.ToString("0.0")+"/"+report.bindAbductionR.ToString("0.0")+" zeroMix L/R="+report.zeroMixAbductionL.ToString("0.0")+"/"+report.zeroMixAbductionR.ToString("0.0")+" idleMax="+report.idleAbductionMax.ToString("0.0")+" stumble start="+stumbleScan.abductionAtStart.ToString("0.0")+" max="+stumbleScan.abductionMax.ToString("0.0")+"@"+stumbleScan.abductionMaxAt.ToString("0.00")+" bindDistStart="+stumbleScan.bindDistanceAtStart.ToString("0.0")+" offenderMax="+report.offenderAbductionMax.ToString("0.0")+"@"+report.offenderAbductionMaxAt.ToString("0.00")+" bindDistMin="+report.offenderBindDistanceMin.ToString("0.0")+" weightSum="+report.offenderWeightSumMin.ToString("0.000")+".."+report.offenderWeightSumMax.ToString("0.000")+" nan="+report.offenderNanPictures;
        }finally{if(graph.IsValid())graph.Destroy();EditorSceneManager.ClosePreviewScene(scene);}
    }
    static float Sum(float[] w){float s=0;foreach(var x in w)s+=x;return s;}
    static bool HasNaN(float[] w){foreach(var x in w)if(float.IsNaN(x)||float.IsInfinity(x))return true;return false;}
    // Received foulOffender pictures through the actual selector (as FootballDuelTests.Bridge wires it), after sprint pictures.
    static Picture[] Selector(string repository,GameObject actor,FootballAnimation animation,Dictionary<string,AnimationClip> c,Transform hips,float[] weights,Func<float> bindDistance){
        var flags=BindingFlags.NonPublic|BindingFlags.Instance;
        var config=JsonUtility.FromJson<WorldConfig>(File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json")));
        var field=Array.Find(config.players,p=>!p.keeper);
        var host=new GameObject("D6 foul selector");var ballView=new GameObject("D6 foul ball").transform;var list=new List<Picture>();
        try{
            var bridge=host.AddComponent<ProbeBridge>();void Field(string name,object value)=>typeof(ProbeBridge).GetField(name,flags).SetValue(bridge,value);
            Field("worldView",new WorldViewState(config));Field("ballView",ballView);
            ((List<Transform>)typeof(ProbeBridge).GetField("actors",flags).GetValue(bridge)).Add(actor.transform);
            ((List<FootballAnimation>)typeof(ProbeBridge).GetField("football",flags).GetValue(bridge)).Add(animation);
            var speeds=new float[1];Field("runSpeeds",speeds);Field("animationTimes",new double[1]);var loco=new FootballLocomotion();Field("worldLocomotion",new[]{loco});
            bridge.runClip=c["run"];bridge.fastRunClip=bridge.walkClip=bridge.backClip=bridge.brakeClip=bridge.turnLeftClip=bridge.turnRightClip=c["run"];bridge.sprintClip=c["sprint"];
            bridge.idleClip=c["idle"];bridge.keeperClip=c["keeper"];bridge.keeperRiseClip=c["rise"];bridge.foulStumbleClip=c["stumble"];bridge.foulFallClip=c["fall"];bridge.keeperShuffleClip=c["shuffle"];bridge.receiveClip=c["receive"];
            var select=typeof(ProbeBridge).GetMethod("WorldFootballPose",flags);
            WorldFrame Frame(double clock){var f=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(config.initial));f.clock=clock;f.owner="";f.celebrating=false;return f;}
            // 1 s of sprint pictures (5.5 m/s along +z), then the native 2.7 s foul window, then 0.5 s idle.
            double z=0;bool first=true;
            for(int k=0;k<=126;k++){double t=k/30.0;string action=t<1?"run":t<1+FootballDuelTiming.StumbleLength?"foulOffender":"idle";
                if(t<1)z+=5.5/30;var pose=new WorldPose{id=field.id,number=field.number,position=new double[]{0,0,z},facing=new double[]{0,0,1},action=action,actionId=action=="foulOffender"?"foul:1":action,progress=action=="foulOffender"?(t-1)/FootballDuelTiming.StumbleLength:0,duration=1};
                var frame=Frame(300+t);ballView.position=new Vector3(0,.18f,(float)z+3);
                var a=actor.transform;speeds[0]=t<1?5.5f:0;a.position=new Vector3(0,animation.RootHeight,(float)z);a.rotation=Quaternion.identity;
                var fp=(FootballAnimation.Pose)select.Invoke(bridge,new object[]{pose,frame,0});
                animation.Sample(fp,300+t,first);first=false;
                list.Add(new Picture{time=(float)t,abductionL=FootballAnimation.ArmAbduction(a,false),abductionR=FootballAnimation.ArmAbduction(a,true),bindDistance=bindDistance(),hips=hips.position.y-a.position.y,clip=fp.clip.name,baseClip=fp.baseClip?.name,actionWeight=animation.Weight(fp.clip),weightSum=Sum(weights),nan=HasNaN(weights)});
            }
            return list.ToArray();
        }finally{UnityEngine.Object.DestroyImmediate(host);UnityEngine.Object.DestroyImmediate(ballView.gameObject);}
    }
}
#endif

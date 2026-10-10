#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Animations;
using UnityEngine.Playables;
using UnityEditor;
using UnityEditor.SceneManagement;
using Doppel6.Probe;
// Real-rig validation of explicit native possession attachment and directional
// strides. All inputs are controlled view pictures, not simulated match events.
public static class FootballPresentation119Tests {
    [Serializable] class Report {public int passed;public string sourceId;public string[] checks;public float largestHoldError,largestRootError,diagonalJointChange;}
    // outputFolder: repository-relative evidence folder (-d6output); without it the
    // historical iteration-119 folder remains the default.
    public static string Run(string repo,string outputFolder=null){
        var checks=new List<string>();void Require(bool ok,string name){if(!ok)throw new Exception("Presentation119: "+name);checks.Add(name);}
        var groundShadow=ProbeBridge.BallShadowStyle(WorldBallMotion.Radius);var airShadow=ProbeBridge.BallShadowStyle(5);
        Require(Math.Abs(groundShadow.diameter-.54f)<1e-6f&&groundShadow.strength>.8f,"ground ball has a compact strong turf shadow");
        Require(airShadow.diameter>groundShadow.diameter&&airShadow.diameter<.87f&&airShadow.strength<groundShadow.strength&&airShadow.strength>.35f,"high ball shadow broadens and softens within ball-specific bounds");
        var veryHigh=ProbeBridge.BallShadowStyle(100);Require(veryHigh.diameter<=.87f&&veryHigh.strength>=.35f,"shadow size and darkness remain bounded at extreme received heights");
        var p=WorldPhasePresence.ParseFrame("{\"owner\":\"k\",\"ballInFlight\":false,\"players\":[{\"id\":\"k\",\"action\":\"save\",\"recovery\":0.5,\"saved\":true,\"parry\":false,\"goal\":false,\"ballHeld\":true}]}");
        Require(FootballKeeperTiming.VisualHeld(p.players[0],p),"explicit catch facts enable view-only glove attachment");
        p.players[0].recovery=0;p.players[0].progress=.9;Require(!FootballKeeperTiming.VisualHeld(p.players[0],p),"incomplete native contact cannot attach");
        p.players[0].progress=1;Require(FootballKeeperTiming.VisualHeld(p.players[0],p),"completed confirmed pickup attaches at first contact picture");p.players[0].recovery=.5;
        string raw=JsonUtility.ToJson(p);
        foreach(var key in new[]{"saved","parry","goal","ballHeld","ballInFlight"}){
            string value=key=="saved"||key=="ballHeld"?"true":"false";
            var missing=WorldPhasePresence.ParseFrame(raw.Replace("\""+key+"\":"+value+",","").Replace(",\""+key+"\":"+value,""));
            Require(!FootballKeeperTiming.VisualHeld(missing.players[0],missing),"missing "+key+" never attaches the visible ball");
        }
        p.players[0].parry=true;Require(!FootballKeeperTiming.VisualHeld(p.players[0],p),"parry releases immediately");p.players[0].parry=false;
        p.players[0].goal=true;Require(!FootballKeeperTiming.VisualHeld(p.players[0],p),"goal releases immediately");p.players[0].goal=false;
        p.ballInFlight=true;Require(!FootballKeeperTiming.VisualHeld(p.players[0],p),"flight releases immediately");p.ballInFlight=false;
        p.owner="other";Require(!FootballKeeperTiming.VisualHeld(p.players[0],p),"owner change releases immediately");p.owner="k";
        p.players[0].action="goalKick";p.players[0].phase="follow";Require(!FootballKeeperTiming.VisualHeld(p.players[0],p),"goal kick follow never attaches a catch-origin ball");p.players[0].action="save";
        p.players[0].position=new double[3];p.players[0].facing=new double[]{0,0,1};p.ball=new double[3];p.camera=new WorldCamera{position=new double[3],target=new double[3],fov=40};
        var blended=WorldViewPlayback.Blend(p,p,.5);Require(blended.players[0].ballHeldKnown&&blended.players[0].ballHeld,"display buffer preserves explicit attachment presence");
        const string asset="Assets/Doppel6EngineProbe/Art/football-v130.fbx";
        var scene=EditorSceneManager.NewPreviewScene();var actor=UnityEngine.Object.Instantiate(AssetDatabase.LoadAssetAtPath<GameObject>(asset));UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(actor,scene);actor.transform.localScale=Vector3.one*1.45f;
        foreach(var skin in actor.GetComponentsInChildren<SkinnedMeshRenderer>())skin.sharedMesh=AssetDatabase.LoadAssetAtPath<Mesh>("Assets/Doppel6EngineProbe/Art/WorldPlayer.asset");
        var animator=actor.GetComponent<Animator>();if(animator==null)animator=actor.AddComponent<Animator>();animator.applyRootMotion=false;
        AnimationClip Clip(string n)=>Array.Find(AssetDatabase.LoadAllAssetsAtPath(asset),a=>a is AnimationClip&&a.name==n) as AnimationClip??AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Doppel6EngineProbe/Art/"+n+".anim")??throw new Exception("Missing "+n);
        var clips=new[]{Clip("idle_stand_meshy"),Clip("running"),Clip("keeper_ready_meshy"),Clip("keeper_rise_meshy"),Clip("keeper_low_meshy")};
        var graph=PlayableGraph.Create("D6 presentation119 rig");graph.SetTimeUpdateMode(DirectorUpdateMode.Manual);var init=AnimationClipPlayable.Create(graph,clips[0]);AnimationPlayableOutput.Create(graph,"rig",animator).SetSourcePlayable(init);graph.Play();graph.Evaluate(0);
        var report=new Report();Transform Bone(string n)=>Array.Find(actor.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:"+n);
        try{
            var animation=new FootballAnimation(graph,actor.transform,clips);actor.transform.position=Vector3.up*animation.RootHeight;
            foreach(float facing in new[]{0f,45f,180f,225f})foreach(var clip in new[]{clips[2],clips[3],clips[4]})foreach(float time in new[]{.4f,1.18f,2.3f,3f,4.8f,6.5f}){
                actor.transform.rotation=Quaternion.AngleAxis(facing,Vector3.up);var root=actor.transform.position;var rotation=actor.transform.rotation;
                var pose=new FootballAnimation.Pose{clip=clip,time=time,key="held",ballHeld=true,kind="two-hands"};animation.Sample(pose,100+time,true);
                Require(animation.rig.reachable,"both gloves bounded and reachable / "+facing+" / "+clip.name+" / "+time);
                var centre=animation.rig.HeldBallCentre;var a=Bone("RightHand").position;var b=Bone("LeftHand").position;
                float err=Mathf.Abs(Vector3.Distance(a,centre)-WorldBallMotion.Radius*.92f);report.largestHoldError=Mathf.Max(report.largestHoldError,err);
                Require(err<.025f&&Vector3.Distance(a,b)>.25f,"gloves surround the displayed sphere / "+facing+" / "+clip.name+" / "+time);
                report.largestRootError=Mathf.Max(report.largestRootError,Vector3.Distance(root,actor.transform.position));Require(root==actor.transform.position&&Quaternion.Angle(rotation,actor.transform.rotation)<.001f,"gather never moves authoritative root / "+facing+" / "+clip.name+" / "+time);
                animation.Sample(pose,100+time);Require(Vector3.Distance(centre,animation.rig.HeldBallCentre)<.0001f,"pause freezes glove midpoint / "+facing+" / "+clip.name+" / "+time);
                animation.Sample(new FootballAnimation.Pose{clip=clips[1],time=.2,key="run",loop=true},200,true);animation.Sample(pose,100+time,true);Require(Vector3.Distance(centre,animation.rig.HeldBallCentre)<.0001f,"seek restores glove midpoint / "+facing+" / "+clip.name+" / "+time);
            }
            actor.transform.rotation=Quaternion.identity;var motion=new FootballLocomotion();motion.Sample(Vector3.zero,Vector3.forward,0,false,false);motion.Sample(new Vector3(.3f,0,.3f),Vector3.forward,.1,false,false);Require(motion.StrideYaw>40&&motion.StrideYaw<50,"observed diagonal travel produces diagonal stride direction");
            var forward=new FootballAnimation.Pose{clip=clips[1],time=.25,loop=true,key="run"};animation.Sample(forward,10,true);var foot=Bone("RightFoot").position;
            var diagonal=forward;diagonal.strideYaw=motion.StrideYaw;animation.Sample(diagonal,10,true);report.diagonalJointChange=Vector3.Distance(foot,Bone("RightFoot").position);Require(report.diagonalJointChange>.04f,"actual diagonal rig stride differs from straight running");
            var heldFoot=Bone("RightFoot").position;animation.Sample(diagonal,10);Require(Vector3.Distance(heldFoot,Bone("RightFoot").position)<.0001f,"pause freezes directional joints");
            animation.Sample(forward,11,true);animation.Sample(diagonal,10,true);Require(Vector3.Distance(heldFoot,Bone("RightFoot").position)<.0001f,"seek restores directional joints");
            // A sustained diagonal retreat (smoothed travel, hysteresis) selects the
            // backward family; the stride direction is relative to the measured
            // backward clip axis (about 180 deg).
            var retreat=new Vector3(.3f,0,.3f);for(int k=2;k<=8;k++){retreat+=new Vector3(.3f,0,-.3f);motion.Sample(retreat,Vector3.forward,k*.1,false,false,-1,0,180);}
            Require(motion.StrideMode=="back"&&Math.Abs(motion.StrideYaw)>40&&Math.Abs(motion.StrideYaw)<50,"sustained diagonal retreat uses backward clip plus observed diagonal component");
            // Travel that flutters around the old 117 deg boundary keeps one stride family.
            var flutter=new FootballLocomotion();var at=Vector3.zero;int switches=0;string family=null;
            for(int k=0;k<=80;k++){float angle=117+9*Mathf.Sin(k*.41f)+5*Mathf.Sin(k*.97f+1);at+=Quaternion.AngleAxis(angle,Vector3.up)*Vector3.forward*(2.6f*.05f);flutter.Sample(at,Vector3.forward,k*.05,false,false,-1,0,flutter.StrideMode=="back"?180:0);if(k>8){if(family!=null&&flutter.StrideMode!=family)switches++;family=flutter.StrideMode;}}
            Require(switches<=1,"travel fluttering around the backward boundary keeps its stride family (switches="+switches+")");
            motion.Sample(Vector3.zero,Vector3.forward,-1,false,false);Require(motion.StrideYaw==0,"seek resets stale directional travel");
        }finally{graph.Destroy();EditorSceneManager.ClosePreviewScene(scene);}
        checks.AddRange(OffsidePresentation119Tests.Run(repo,false,outputFolder));report.passed=checks.Count;report.checks=checks.ToArray();report.sourceId=ProbeBuildIdentity.SourceId;var folder=Path.Combine(repo,outputFolder??"outputs/3d-quality/iteration-119");Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,"presentation-tests.json"),JsonUtility.ToJson(report,true));return "passed="+checks.Count;
    }
}
#endif

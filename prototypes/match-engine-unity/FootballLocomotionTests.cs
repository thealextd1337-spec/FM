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
public static class FootballLocomotionTests {
    [Serializable] class Report {public int passed;public string[] checks;}
    public static string Run(string repository,string outputFolder=null){
        var checks=new List<string>();void Require(bool b,string name){if(!b)throw new Exception(name);checks.Add(name);}
        var motion=new FootballLocomotion();var p=Vector3.zero;var f=Vector3.forward;motion.Sample(p,f,10,false,false);
        Require(motion.Mode=="idle","Initial pose does not infer movement");
        p.z+=.15f;motion.Sample(p,f,10.1,false,false);Require(motion.Mode=="walk","Slow actual movement uses walking");
        p.z+=.4f;motion.Sample(p,f,10.2,false,false);Require(motion.Mode=="run","Forward run uses football running");
        p.z+=.55f;motion.Sample(p,f,10.3,false,false);Require(motion.Mode=="sprint","Fast off-ball run uses sprint");
        var phase=motion.Phase;motion.Sample(p+Vector3.one,f,10.3,false,false);Require(motion.Phase==phase&&motion.Mode=="sprint","Native pause freezes motion classification and phase");
        p.z+=.55f;motion.Sample(p,f,10.4,true,false);Require(motion.Mode=="run","Ball carrier preserves controlled running at fast pace");
        motion.Sample(p,f,10.5,false,false);Require(motion.Mode=="brake","Stopping from a run has a brief braking motion");
        motion.Sample(p,f,10.8,false,false);Require(motion.Mode=="idle","Braking completes in native time");
        p.z-=.2f;motion.Sample(p,f,10.9,false,false);Require(motion.Mode=="back","Retreat while facing play uses backward motion");
        p.z+=.3f;motion.Sample(p,Vector3.right,11,false,false);Require(motion.Mode=="turn-right","A substantial direction change uses a right turn");
        p.x+=.75f;motion.Sample(p,Vector3.right,11.25,false,false);Require(motion.Mode=="run","Turn releases back to the actual run");
        motion.Sample(p,f,2,false,false);Require(motion.Mode=="idle","Replay seeking resets stale turns and braking");
        motion.Sample(p+Vector3.forward*20,f,2.1,false,false);Require(motion.Mode=="idle","Checkpoint cut is not shown as a twenty-metre sprint");
        var stride=new FootballLocomotion();stride.Sample(Vector3.zero,f,0,true,false);stride.Sample(new Vector3(0,0,.4f),f,.1,true,false);var prior=stride.StridePhase;stride.Sample(new Vector3(.3f,0,.4f),Vector3.right,.2,true,false);Require(stride.StridePhase>prior,"Turn pose does not reset the underlying carrier stride");prior=stride.StridePhase;stride.Sample(new Vector3(.3f,2,.4f),Vector3.right,.3,true,false);Require(stride.Speed==0&&stride.StridePhase==prior,"Height adjustment cannot fabricate a football stride");
        Vector3 Facing(float degrees)=>Quaternion.AngleAxis(degrees,Vector3.up)*Vector3.forward;
        foreach(int frequency in new[]{30,60,120}){
            foreach(int direction in new[]{-1,1}){
                var pivot=new FootballLocomotion();pivot.Sample(Vector3.zero,f,20,true,false);string expected=direction<0?"turn-left":"turn-right";bool seen=false;
                for(int frame=1;frame<=frequency/3;frame++){pivot.Sample(Vector3.zero,Facing(direction*180f*frame/frequency),20+(double)frame/frequency,true,false);seen|=pivot.Mode==expected;Require(pivot.Speed==0&&pivot.StridePhase==20,"Stationary pivot cannot fabricate a stride "+frequency+" Hz / "+direction+" / "+frame);}
                Require(seen&&pivot.Mode==expected,"Incremental stationary pivot selects "+expected+" at "+frequency+" Hz");
                var heldPhase=pivot.Phase;double heldClock=20+(double)(frequency/3)/frequency;pivot.Sample(Vector3.zero,Facing(-90),heldClock,true,false);Require(pivot.Phase==heldPhase&&pivot.Mode==expected,"Paused stationary pivot freezes at "+frequency+" Hz / "+direction);
                pivot.Sample(Vector3.zero,Facing(direction*60),heldClock+.3,true,false);Require(pivot.Mode=="idle","Stationary pivot releases after angular motion ends at "+frequency+" Hz / "+direction);
            }
        }
        var jitter=new FootballLocomotion();jitter.Sample(Vector3.zero,f,30,false,false);for(int i=1;i<=30;i++){jitter.Sample(Vector3.zero,Facing(i%2==0?2:-2),30+i/60.0,false,false);Require(jitter.Mode=="idle","Alternating angular jitter cannot trigger a turn / "+i);}
        var slow=new FootballLocomotion();slow.Sample(Vector3.zero,f,40,false,false);for(int i=1;i<=4;i++)slow.Sample(new Vector3(0,0,i*.02f),Facing(i*3),40+i/60.0,false,false);Require(slow.Mode=="turn-right"&&slow.Speed>0&&slow.Speed<1.8,"A walking actor can turn from incremental native headings");
        var gentle=new FootballLocomotion();gentle.Sample(Vector3.zero,f,45,false,false);for(int i=1;i<=20;i++)gentle.Sample(Vector3.zero,Facing(i),45+i/60.0,false,false);Require(gentle.Mode=="idle","Slow heading correction does not force a pivot animation");
        var reset=new FootballLocomotion();reset.Sample(Vector3.zero,f,50,false,false);reset.Sample(Vector3.zero,Facing(6),50+1/30.0,false,false);reset.Sample(Vector3.zero,f,2,false,false);reset.Sample(Vector3.zero,Facing(3),2+1/60.0,false,false);Require(reset.Mode=="idle","Replay seek clears partially accumulated pivot motion");
        reset.Sample(Vector3.forward*20,f,2.1,false,false);reset.Sample(Vector3.forward*20,Facing(3),2.1+1/60.0,false,false);Require(reset.Mode=="idle","Checkpoint cut clears partially accumulated pivot motion");
        var stopTurn=new FootballLocomotion();stopTurn.Sample(Vector3.zero,f,60,false,false);stopTurn.Sample(Vector3.forward*.4f,f,60.1,false,false);stopTurn.Sample(Vector3.forward*.4f,Facing(30),60.2,false,false);Require(stopTurn.Mode=="brake","A running stop retains braking precedence over a pivot");
        var keeperTurn=new FootballLocomotion();keeperTurn.Sample(Vector3.zero,f,70,false,true);keeperTurn.Sample(Vector3.zero,Facing(-30),70.1,false,true);Require(keeperTurn.Mode=="turn-left","A stationary keeper uses the observed turn direction");
        CheckExistingTurnClips(Require);
        var json=JsonUtility.ToJson(new Report{passed=checks.Count,checks=checks.ToArray()},true);Directory.CreateDirectory(Path.Combine(repository,outputFolder??"outputs/platform/attack-flow"));File.WriteAllText(Path.Combine(repository,outputFolder??"outputs/platform/attack-flow",outputFolder==null?"locomotion-tests.json":"locomotion-tests.json"),json);return json;
    }
    static void CheckExistingTurnClips(Action<bool,string> require){
        const string asset="Assets/Doppel6EngineProbe/Art/football-v130.fbx";
        var scene=EditorSceneManager.NewPreviewScene();var graph=PlayableGraph.Create("D6 stationary turn validation");
        try{
            var actor=UnityEngine.Object.Instantiate(AssetDatabase.LoadAssetAtPath<GameObject>(asset));UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(actor,scene);actor.transform.localScale=Vector3.one*1.45f;
            var animator=actor.GetComponent<Animator>();if(animator==null)animator=actor.AddComponent<Animator>();animator.applyRootMotion=false;
            var clips=Array.ConvertAll(new[]{"turn_run_left","turn_run_right"},name=>Array.Find(AssetDatabase.LoadAllAssetsAtPath(asset),a=>a is AnimationClip&&a.name==name) as AnimationClip??throw new Exception("Missing existing turn clip "+name));
            graph.SetTimeUpdateMode(DirectorUpdateMode.Manual);AnimationPlayableOutput.Create(graph,"Character",animator).SetSourcePlayable(AnimationClipPlayable.Create(graph,clips[0]));graph.Play();graph.Evaluate(0);
            var animation=new FootballAnimation(graph,actor.transform,clips);var root=actor.transform.position;var rotation=actor.transform.rotation;var bones=actor.GetComponentsInChildren<Transform>();
            foreach(var clip in clips){
                var pose=new FootballAnimation.Pose{clip=clip,time=.45,loop=false,key=clip.name};animation.Sample(pose,80,true);var before=Array.ConvertAll(bones,t=>t.position);pose.time=.60;animation.Sample(pose,80.12);bool changed=false;for(int i=0;i<bones.Length;i++)changed|=Vector3.Distance(before[i],bones[i].position)>.0001f;
                require(changed,"Existing "+clip.name+" animates the actual stationary rig");require(actor.transform.position==root&&actor.transform.rotation==rotation,"Existing "+clip.name+" cannot move the game-owned root");
                before=Array.ConvertAll(bones,t=>t.position);pose.time=.80;animation.Sample(pose,80.12);bool frozen=true;for(int i=0;i<bones.Length;i++)frozen&=Vector3.Distance(before[i],bones[i].position)<.00001f;require(frozen,"Existing "+clip.name+" freezes bones at a paused native clock");
            }
        }finally{if(graph.IsValid())graph.Destroy();EditorSceneManager.ClosePreviewScene(scene);}
    }
}
#endif

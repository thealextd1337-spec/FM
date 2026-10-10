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
public static class FootballMomentumTests {
    [Serializable] class Report {public int passed;public string[] checks;public Measurement[] measurements;}
    [Serializable] class Measurement {public string stage;public float speed,forwardLean,turnLean,recoveryLean,headDisplacement;}
    public static string Run(string repository,string outputFolder=null){
        var checks=new List<string>();var measurements=new List<Measurement>();
        void Require(bool ok,string name){if(!ok)throw new Exception(name);checks.Add(name);}
        Vector3 Facing(float angle)=>Quaternion.AngleAxis(angle,Vector3.up)*Vector3.forward;
        foreach(int frequency in new[]{30,60,120}){
            var launch=new FootballLocomotion();var point=Vector3.zero;launch.Sample(point,Vector3.forward,0,false,false);
            for(int frame=1;frame<=frequency;frame++){float speed=Mathf.Min(4,frame*8f/frequency);point+=Vector3.forward*speed/frequency;launch.Sample(point,Vector3.forward,(double)frame/frequency,false,false);if(frame==frequency/4){Require(launch.ForwardLean>1&&launch.Acceleration>0,"Observed acceleration produces launch lean at "+frequency+" Hz");measurements.Add(new Measurement{stage="launch-"+frequency,speed=launch.Speed,forwardLean=launch.ForwardLean});}}
            for(int frame=frequency+1;frame<=frequency*2;frame++){point+=Vector3.forward*4/frequency;launch.Sample(point,Vector3.forward,(double)frame/frequency,false,false);}
            Require(Mathf.Abs(launch.ForwardLean)<.1f,"Steady observed speed releases launch lean at "+frequency+" Hz");
            bool braking=false;for(int frame=1;frame<=frequency*2/3;frame++){float speed=Mathf.Max(0,4-frame*6f/frequency);point+=Vector3.forward*speed/frequency;launch.Sample(point,Vector3.forward,2+(double)frame/frequency,false,false);braking|=launch.Mode=="brake"&&launch.ForwardLean<0;}
            Require(braking,"Progressive real deceleration produces braking and recoil at "+frequency+" Hz");
            foreach(int direction in new[]{-1,1}){
                // Natural-motion contract: a moving direction change shows one
                // turn episode over the retained stride (blend weight strictly
                // between 0 and 1), then banks without restarting the turn.
                var turn=new FootballLocomotion();point=Vector3.zero;turn.Sample(point,Vector3.forward,10,false,false);bool seen=false;float blend=1;int episodes=0;string previous="";
                for(int frame=1;frame<=frequency/3;frame++){var facing=Facing(direction*180f*frame/frequency);point+=facing*3/frequency;turn.Sample(point,facing,10+(double)frame/frequency,false,false);
                    bool turning=turn.Mode.StartsWith("turn-");if(turning){seen|=turn.Mode==(direction<0?"turn-left":"turn-right");blend=Mathf.Min(blend,turn.MotionWeight);if(!previous.StartsWith("turn-"))episodes++;}previous=turn.Mode;}
                Require(seen&&episodes==1&&turn.StrideMode=="run"&&blend>0&&blend<1,"Incremental moving turn retains its stride at "+frequency+" Hz / "+direction);
                Require(turn.TurnLean*direction< -1&&Mathf.Abs(turn.TurnLean)<=6,"Observed momentum banks toward the turn at "+frequency+" Hz / "+direction);
                var phase=turn.StridePhase;var lean=turn.TurnLean;var forwardLean=turn.ForwardLean;var mode=turn.Mode;double clock=10+(double)(frequency/3)/frequency;
                turn.Sample(point+Vector3.one,Facing(-90),clock,false,false,0);
                Require(turn.StridePhase==phase&&turn.TurnLean==lean&&turn.ForwardLean==forwardLean&&turn.Mode==mode,"Paused native time freezes stride and momentum at "+frequency+" Hz / "+direction);
                turn.Sample(point,Facing(0),2,false,false,1);Require(turn.Mode=="idle"&&turn.Acceleration==0&&turn.TurnLean==0&&turn.ForwardLean==0,"Replay seek clears momentum at "+frequency+" Hz / "+direction);
            }
            // A steady arc (150 deg/s at 4 m/s for 2 s) starts at most one turn
            // episode and keeps banking; the stride never restarts.
            foreach(int direction in new[]{-1,1}){
                var arc=new FootballLocomotion();point=Vector3.zero;arc.Sample(point,Vector3.forward,20,false,false);for(int frame=1;frame<=frequency/2;frame++){point+=Vector3.forward*4f/frequency;arc.Sample(point,Vector3.forward,20+(double)frame/frequency,false,false);}
                int episodes=0;string previous=arc.Mode;double stride=arc.StridePhase;bool monotonic=true;float bank=0;
                for(int frame=1;frame<=frequency*2;frame++){var facing=Facing(direction*150f*frame/frequency);point+=facing*4f/frequency;arc.Sample(point,facing,20.5+(double)frame/frequency,false,false);
                    if(arc.Mode.StartsWith("turn-")&&!previous.StartsWith("turn-"))episodes++;previous=arc.Mode;monotonic&=arc.StridePhase>stride;stride=arc.StridePhase;if(frame>frequency)bank=Mathf.Max(bank,-arc.TurnLean*direction);}
                Require(episodes<=1&&monotonic&&arc.StrideMode=="run"&&bank>1,"Steady moving arc keeps one stride and banks without restarting turns at "+frequency+" Hz / "+direction);
            }
        }
        var absent=new FootballLocomotion();absent.Sample(Vector3.zero,Vector3.forward,0,false,false);absent.Sample(Vector3.zero,Vector3.forward,.2,false,false);Require(absent.RecoveryLean==0,"Missing freshness never fabricates a tired stance");
        var tired=new FootballLocomotion();tired.Sample(Vector3.zero,Vector3.forward,0,false,false,.15);Require(tired.RecoveryLean>5&&tired.RecoveryLean<=8,"Explicit tired idle player uses a bounded recovery stance");
        var recovery=tired.RecoveryLean;tired.Sample(Vector3.zero,Vector3.forward,0,false,false,1);Require(tired.RecoveryLean==recovery,"Paused freshness changes cannot advance a recovery pose");
        tired.Sample(Vector3.zero,Vector3.forward,.2,false,false,1);Require(tired.RecoveryLean<recovery&&tired.RecoveryLean>0,"Observed recovery relaxes the stance smoothly");
        tired.Sample(Vector3.forward*.6f,Vector3.forward,.3,false,false,.15);Require(tired.RecoveryLean<recovery,"Actual movement releases the idle recovery stance");
        foreach(bool keeper in new[]{false,true}){var protectedActor=new FootballLocomotion();protectedActor.Sample(Vector3.zero,Vector3.forward,0,!keeper,keeper,0);Require(protectedActor.RecoveryLean==0,keeper?"Keeper readiness retains priority over tired idle":"Ball carrier remains ready instead of using tired idle");}
        ValidateFreshnessContract(repository,Require);
        ValidateRig(Require,measurements);
        var report=JsonUtility.ToJson(new Report{passed=checks.Count,checks=checks.ToArray(),measurements=measurements.ToArray()},true);var folder=Path.Combine(repository,outputFolder??"outputs/platform/freshness-v158/unity-animation");Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,"momentum-tests.json"),report);return report;
    }
    static void ValidateFreshnessContract(string repository,Action<bool,string> require){
        require(JsonUtility.FromJson<WorldPose>("{\"id\":\"legacy\"}").freshness== -1,"Actual Unity JSON reader preserves the missing freshness sentinel");
        var config=JsonUtility.FromJson<WorldConfig>(File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json")));var inbox=new WorldViewState(config);var old=JsonUtility.ToJson(inbox.Frame);
        foreach(double invalid in new[]{double.NaN,double.PositiveInfinity,-.5,1.01}){var frame=JsonUtility.FromJson<WorldFrame>(old);frame.sequence++;frame.players[0].freshness=invalid;bool rejected=false;try{inbox.Accept(frame);}catch(ArgumentException){rejected=true;}require(rejected&&JsonUtility.ToJson(inbox.Frame)==old,"Invalid freshness rejected atomically / "+invalid);}
        var next=JsonUtility.FromJson<WorldFrame>(old);next.sequence++;next.clock+=.05;next.players[0].freshness=.25;require(inbox.Accept(next),"Current native freshness is accepted without changing match authority");
        var first=JsonUtility.FromJson<WorldFrame>(old);first.players[0].freshness=.8;next.players[0].freshness=.2;
        for(int i=1;i<10;i++){double q=i/10.0;var blended=WorldViewPlayback.Blend(first,next,q);require(Math.Abs(blended.players[0].freshness-(.8-.6*q))<1e-8,"Freshness interpolation stays between actual endpoints / "+i);}
        require(first.players[0].freshness==.8&&next.players[0].freshness==.2,"Freshness interpolation never edits a received picture");
        first.players[0].freshness=-1;require(WorldViewPlayback.Blend(first,next,.5).players[0].freshness==.2,"A first explicit freshness value does not interpolate from missing data");next.players[0].freshness=-1;require(WorldViewPlayback.Blend(first,next,.5).players[0].freshness== -1,"Legacy pictures remain explicitly unmeasured");
        next.players[0].freshness=.1;next.phase="paused";var playback=new WorldViewPlayback();playback.Receive(first,0);playback.Receive(next,1);require(playback.Sample(1).players[0].freshness==.1&&playback.Sample(100).players[0].freshness==.1,"Paused native freshness stays frozen for any display time");
    }
    static void ValidateRig(Action<bool,string> require,List<Measurement> measurements){
        const string asset="Assets/Doppel6EngineProbe/Art/football-v130.fbx";var scene=EditorSceneManager.NewPreviewScene();var graph=PlayableGraph.Create("D6 momentum validation");
        try{
            var actor=UnityEngine.Object.Instantiate(AssetDatabase.LoadAssetAtPath<GameObject>(asset));UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(actor,scene);actor.transform.localScale=Vector3.one*1.45f;actor.transform.position=new Vector3(2,.08f,3);actor.transform.rotation=Quaternion.LookRotation(Vector3.right);
            var animator=actor.GetComponent<Animator>();if(animator==null)animator=actor.AddComponent<Animator>();animator.applyRootMotion=false;
            AnimationClip Clip(string name)=>Array.Find(AssetDatabase.LoadAllAssetsAtPath(asset),a=>a is AnimationClip&&a.name==name) as AnimationClip??throw new Exception(name);
            var run=Clip("run_fast4");var turn=Clip("turn_run_right");var idle=Clip("idle_stand_meshy");graph.SetTimeUpdateMode(DirectorUpdateMode.Manual);AnimationPlayableOutput.Create(graph,"Character",animator).SetSourcePlayable(AnimationClipPlayable.Create(graph,run));graph.Play();graph.Evaluate(0);
            var animation=new FootballAnimation(graph,actor.transform,new[]{run,turn,idle});var bones=actor.GetComponentsInChildren<Transform>();Transform Bone(string name)=>Array.Find(bones,t=>t.name=="mixamorig:"+name);var head=Bone("Head");var left=Bone("LeftFoot");var right=Bone("RightFoot");var root=actor.transform.position;var rotation=actor.transform.rotation;
            var pose=new FootballAnimation.Pose{clip=run,time=.5,loop=true,key="run"};animation.Sample(pose,10,true);var neutral=head.position;var leftFoot=left.position;var rightFoot=right.position;
            pose.forwardLean=6;pose.turnLean=-5;animation.Sample(pose,11,true);float displacement=Vector3.Distance(neutral,head.position);require(displacement>.01f&&displacement<.25f,"Momentum lean changes the actual upper-body joints within bounds");require(Vector3.Distance(leftFoot,left.position)<.00001f&&Vector3.Distance(rightFoot,right.position)<.00001f,"Upper-body inertia preserves both real feet");require(actor.transform.position==root&&actor.transform.rotation==rotation,"Momentum lean never moves or turns the game-owned root");measurements.Add(new Measurement{stage="real-rig-momentum",headDisplacement=displacement,forwardLean=6,turnLean=-5});
            var positions=Array.ConvertAll(bones,t=>t.position);pose.forwardLean=-5;pose.turnLean=6;animation.Sample(pose,11);require(Array.TrueForAll(Array.ConvertAll(bones,t=>Array.IndexOf(bones,t)),i=>Vector3.Distance(positions[i],bones[i].position)<.00001f),"Paused native clock freezes all actual momentum bones");
            pose.forwardLean=6;pose.turnLean=-5;for(int frame=1;frame<=300;frame++)animation.Sample(pose,11+frame/60.0);require(Vector3.Distance(positions[Array.IndexOf(bones,head)],head.position)<.00001f,"Repeated sampling cannot accumulate upper-body lean");
            pose=new FootballAnimation.Pose{clip=turn,time=.6,key="moving-turn",baseClip=run,baseTime=.7,baseLoop=true,actionWeight=.5f};animation.Sample(pose,12,true);require(Math.Abs(animation.Weight(turn)-.5)<.00001&&Math.Abs(animation.Weight(run)-.5)<.00001,"Moving turn blends the actual turn and stride clips equally");require(actor.transform.position==root&&actor.transform.rotation==rotation,"Blended momentum turn retains authoritative root and facing");
            pose=new FootballAnimation.Pose{clip=idle,time=.3,loop=true,key="idle"};animation.Sample(pose,13,true);neutral=head.position;leftFoot=left.position;rightFoot=right.position;pose.recoveryLean=7;animation.Sample(pose,14,true);displacement=Vector3.Distance(neutral,head.position);require(displacement>.01f&&displacement<.25f,"Explicit tired recovery bends actual upper-body joints within bounds");require(Vector3.Distance(leftFoot,left.position)<.00001f&&Vector3.Distance(rightFoot,right.position)<.00001f&&actor.transform.position==root&&actor.transform.rotation==rotation,"Recovery stance preserves actual feet and authoritative root");
            pose.plant=true;pose.recoveryLean=0;pose.forwardLean=0;pose.turnLean=0;animation.Sample(pose,15,true);neutral=head.position;pose.recoveryLean=8;pose.forwardLean=7;pose.turnLean=-6;animation.Sample(pose,16,true);require(Vector3.Distance(neutral,head.position)<.00001f,"Planted native action ignores all locomotion and recovery lean");
            pose.plant=false;pose.contact=true;pose.kind="hand";pose.target=Bone("RightHand").position;pose.recoveryLean=pose.forwardLean=pose.turnLean=0;animation.Sample(pose,17,true);neutral=head.position;pose.recoveryLean=8;pose.forwardLean=7;pose.turnLean=-6;animation.Sample(pose,18,true);require(Vector3.Distance(neutral,head.position)<.00001f,"Native hand contact ignores all locomotion and recovery lean");require(actor.transform.position==root&&actor.transform.rotation==rotation,"Protected native contacts keep the game-owned root");require(graph.GetPlayableCount()<=5,"Momentum changes reuse cached graph nodes");
        }finally{if(graph.IsValid())graph.Destroy();EditorSceneManager.ClosePreviewScene(scene);}
    }
}
#endif

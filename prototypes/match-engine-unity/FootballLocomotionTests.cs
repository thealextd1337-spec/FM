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
        // U-1 (183, B02): the top-speed stride (running: 4.7 m per cycle of 0.635 s, 7.4 m/s) lengthens its step above its
        // authored pace instead of only playing faster; the cycle still follows the received travel (no glide); a carrier
        // at the free carrier pace (7.06 m/s, run band) and every slower band keep their authored step.
        {FootballLocomotion Run(float speed,bool carrying,bool marked=true){var m=new FootballLocomotion();var at=Vector3.zero;for(int k=0;k<=60;k++){m.Sample(at,Vector3.forward,20+k*.05,carrying,false,-1,4.7f,0,0,1/.635f,marked);at+=Vector3.forward*speed*.05f;}return m;}
         var runner=Run(8.15f,false);double natural=1/.635,expected=Math.Sqrt(8.15/4.7/natural);
         Require(runner.StrideMode=="sprint"&&runner.FastStride&&Math.Abs(runner.StrideScale-expected)<.01,"u1 an 8.15 m/s own run lengthens the top-speed step by "+expected.ToString("0.000")+" ("+runner.StrideScale.ToString("0.000")+")");
         var fastest=Run(11f,false);Require(Math.Abs(fastest.StrideScale-FootballLocomotion.MaxStrideStretch)<1e-4,"u1 the step stretch is bounded by MaxStrideStretch");
         var carrier=Run(7.06f,true);Require(carrier.StrideMode=="run"&&Math.Abs(carrier.StrideScale-1)<1e-3,"u1 a 7.06 m/s carrier keeps the authored step (below the clip's pace)");
         // SI-5: a large-pitch carrier at 8.5 m/s stays in the run band; its step lengthens up to MaxCarrierStretch.
         var fastCarrier=Run(8.5f,true);double carrierExpected=Math.Min(FootballLocomotion.MaxCarrierStretch,Math.Sqrt(8.5/4.7/natural));
         Require(fastCarrier.StrideMode=="run"&&Math.Abs(fastCarrier.StrideScale-carrierExpected)<.01,"u1 an 8.5 m/s carrier lengthens its step by "+carrierExpected.ToString("0.000")+" ("+fastCarrier.StrideScale.ToString("0.000")+")");
         Require(!Run(5.5f,true).CarrierTop&&Run(5.5f,true,false).CarrierTop&&Run(7.06f,true).CarrierTop,"u1 a marked carrier shows running only above 6.6 m/s (run_fast4 below); without the marker from 4.2 m/s as before");
         // Delta review of 513dc31b: the carrier bridge band's hysteresis, ball changes and keepers, with the actual
         // presentation clip choice (ProbeBridge.StrideClip, carrying = owner and not keeper as WorldFootballPose passes it).
         {var host=new GameObject("D6 u1 stride clips");
          try{var bridge=host.AddComponent<ProbeBridge>();AnimationClip Named(string n)=>new AnimationClip{name=n};
           bridge.walkClip=Named("walking");bridge.jogClip=Named("run_fast6");bridge.fastRunClip=Named("run_fast4");bridge.sprintClip=Named("sprint_forward");bridge.runClip=Named("running");bridge.idleClip=Named("idle");bridge.keeperClip=Named("keeper");bridge.backClip=Named("back");
           var strideClip=typeof(ProbeBridge).GetMethod("StrideClip",System.Reflection.BindingFlags.NonPublic|System.Reflection.BindingFlags.Instance);
           string Clip(FootballLocomotion m,bool carrying)=>((AnimationClip)strideClip.Invoke(bridge,new object[]{m.StrideMode,carrying,false,m.FastStride,m.FastestBack,m.CarrierTop})).name;
           // Speed profile (m/s per 0.05 s step) and ball per step; returns the shown clip and CarrierTop per step.
           (string clip,bool top)[] Profile(float[] speed,bool[] carry){var m=new FootballLocomotion();var at=Vector3.zero;var shown=new (string,bool)[speed.Length];
            for(int k=0;k<speed.Length;k++){m.Sample(at,Vector3.forward,40+k*.05,carry[k],false,-1,4.7f,0,0,1/.635f,true);shown[k]=(Clip(m,carry[k]),m.CarrierTop);at+=Vector3.forward*speed[k]*.05f;}return shown;}
           float[] Steps(params (float v,int n)[] parts){var list=new List<float>();float last=parts[0].v;foreach(var (v,n) in parts){for(int k=1;k<=n;k++)list.Add(last+(v-last)*k/n);last=v;}return list.ToArray();}
           bool[] All(int n,bool value){var b=new bool[n];for(int k=0;k<n;k++)b[k]=value;return b;}
           // Hysteresis: 6.0 -> 7.0 -> 6.4 -> 6.1 m/s (each held 1.5 s): off, on, on, off.
           var ramp=Steps((6f,30),(7f,10),(7f,30),(6.4f,6),(6.4f,30),(6.1f,3),(6.1f,30));var r=Profile(ramp,All(ramp.Length,true));
           bool OffOnOnOff=!r[29].top&&r[69].top&&r[105].top&&!r[138].top&&r[29].clip=="run_fast4"&&r[69].clip=="running"&&r[105].clip=="running"&&r[138].clip=="run_fast4";
           Require(OffOnOnOff,"u1 carrier bridge band hysteresis: 6.0 / 7.0 / 6.4 / 6.1 m/s show run_fast4 / running / running / run_fast4 (on above 6.6, off below 6.2)");
           // A ball change at 7.0 m/s keeps the clip: running with the ball (run band) and without it (sprint band).
           var seven=Steps((7f,20),(7f,80));var swap=new bool[seven.Length];for(int k=0;k<swap.Length;k++)swap[k]=k<30||(k/10)%2==1;var s7=Profile(seven,swap);bool steady=true;for(int k=25;k<s7.Length;k++)steady&=s7[k].clip=="running";
           Require(steady,"u1 a ball change at 7.0 m/s shows no clip change (running with and without the ball)");
           // At 6.5 m/s (between 6.2 and 6.6) the documented behaviour: from below the carrier shows run_fast4, a ball loss shows
           // running (sprint band), regaining the ball shows run_fast4 again; from above the carrier keeps running until the ball is
           // lost, and a regained ball shows run_fast4 (CarrierTop follows the carrier only).
           var below=Steps((6f,30),(6.5f,10),(6.5f,40),(6.5f,40),(6.5f,40));var bc=new bool[below.Length];for(int k=0;k<bc.Length;k++)bc[k]=k<80||k>=120;var b65=Profile(below,bc);
           Require(b65[79].clip=="run_fast4"&&b65[119].clip=="running"&&b65[159].clip=="run_fast4","u1 6.5 m/s from below: carrier run_fast4, ball lost running, ball regained run_fast4");
           var above=Steps((7f,30),(6.5f,10),(6.5f,40),(6.5f,40),(6.5f,40));var a65=Profile(above,bc);
           Require(a65[79].clip=="running"&&a65[119].clip=="running"&&a65[159].clip=="run_fast4","u1 6.5 m/s from above: carrier running, ball lost running, ball regained run_fast4");
          }finally{UnityEngine.Object.DestroyImmediate(host);}}
         // Keepers are no carriers for the bridge band and the stride stretch (marked pictures), as the presentation excludes them.
         {var k=new FootballLocomotion();var at=Vector3.zero;for(int n=0;n<=60;n++){k.Sample(at,Vector3.forward,60+n*.05,true,true,-1,4.7f,0,0,1/.635f,true);at+=Vector3.forward*8.5f*.05f;}
          Require(k.StrideMode=="run"&&!k.CarrierTop&&Math.Abs(k.StrideScale-1)<1e-3,"u1 a keeper with the ball at 8.5 m/s gets neither the carrier band nor the carrier stretch");}
         var legacyCarrier=Run(8.5f,true,false);Require(legacyCarrier.StrideScale==1,"u1 a carrier picture without the SI marker keeps the authored step");
         var legacy=Run(8.15f,false,false);Require(legacy.StrideMode=="sprint"&&legacy.StrideScale==1,"u1 a picture without the SI marker keeps the authored top-speed step (older matches unchanged)");
         var cruise=Run(7.2f,false);Require(Math.Abs(cruise.StrideScale-1)<1e-3,"u1 below the authored pace the top-speed step is not stretched");}
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

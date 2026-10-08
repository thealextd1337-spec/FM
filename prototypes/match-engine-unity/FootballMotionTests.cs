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
public static class FootballMotionTests {
    [Serializable] class Report {public string phase;public int failed;public Check[] checks;public ClipPoint[] keeper;}
    [Serializable] class Check {public string name;public bool passed;public double measured;}
    [Serializable] class ClipPoint {public string clip;public float time,x,y,z,length;}
    public static string Run(string repository,string phase="final") {
        var checks=new List<Check>();var points=new List<ClipPoint>();
        void Check(bool ok,string name,double measured=0){checks.Add(new Check{name=name,passed=ok,measured=measured});}
        const string asset="Assets/Doppel6EngineProbe/Art/football-v130.fbx";
        var scene=EditorSceneManager.NewPreviewScene();var graph=PlayableGraph.Create("D6 motion diagnosis");
        try {
            var actor=UnityEngine.Object.Instantiate(AssetDatabase.LoadAssetAtPath<GameObject>(asset));UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(actor,scene);actor.transform.localScale=Vector3.one*1.45f;
            var animator=actor.GetComponent<Animator>();if(animator==null)animator=actor.AddComponent<Animator>();animator.applyRootMotion=false;
            AnimationClip Clip(string name)=>Array.Find(AssetDatabase.LoadAllAssetsAtPath(asset),a=>a is AnimationClip&&a.name==name) as AnimationClip??throw new Exception(name);
            var run=Clip("run_fast4");var idle=Clip("keeper_ready_meshy");var dive=Clip("keeper_dive_meshy");var high=Clip("keeper_high_meshy");var low=Clip("keeper_low_meshy");
            graph.SetTimeUpdateMode(DirectorUpdateMode.Manual);AnimationPlayableOutput.Create(graph,"Character",animator).SetSourcePlayable(AnimationClipPlayable.Create(graph,idle));graph.Play();graph.Evaluate(0);
            var animation=new FootballAnimation(graph,actor.transform,new[]{run,idle,dive,high,low});
            foreach(var clip in new[]{dive,high,low})for(int sample=0;sample<=12;sample++){
                float time=Math.Min(clip.length-.001f,sample*clip.length/12);animation.Sample(new FootballAnimation.Pose{clip=clip,time=time,key=clip.name},10+sample*.05,true);
                var hand=Array.Find(actor.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:RightHand");var p=actor.transform.InverseTransformPoint(hand.position);
                points.Add(new ClipPoint{clip=clip.name,time=time,x=p.x,y=p.y,z=p.z,length=clip.length});
            }
            animation.Sample(new FootballAnimation.Pose{clip=idle,time=.4,loop=true,key="ready"},20,true);
            animation.Sample(new FootballAnimation.Pose{clip=dive,time=1.45,key="actual-native-save",contact=true,kind="hand",target=Vector3.right*1.5f+Vector3.up*.45f},20.01);
            Check(animation.Weight(dive)>=.98,"An already observed keeper contact has its authored action pose immediately",animation.Weight(dive));
            var frame=JsonUtility.FromJson<WorldConfig>(File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json"))).initial;
            frame.phase="live";frame.clock=10;var next=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(frame));next.clock=10.05;next.sequence++;next.players[0].action="save";next.players[0].actionId="observed-save";next.players[0].progress=.5;
            var playback=new WorldViewPlayback();playback.Receive(frame,0);playback.Receive(next,.05);var sampled=playback.Sample(.05);
            Check(sampled.players[0].action=="save","Known keeper launch is presented on the arrival frame, rather than one display frame later");
            var bridge=File.ReadAllText(Path.Combine(repository,"prototypes/match-engine-unity/WorldViewBridge.cs"));
            Check(bridge.Contains("ballView.rotation="),"The actual world ball renderer applies a travel-derived orientation");
            ValidateBall(frame,Check);
            ValidateMotion(actor,graph,animation,run,idle,dive,Check);
            ValidateBridge(repository,scene,actor,animation,run,idle,dive,high,low,Check);
        } finally {if(graph.IsValid())graph.Destroy();EditorSceneManager.ClosePreviewScene(scene);}
        var report=new Report{phase=phase,failed=checks.FindAll(c=>!c.passed).Count,checks=checks.ToArray(),keeper=points.ToArray()};var json=JsonUtility.ToJson(report,true);File.WriteAllText(Path.Combine(repository,"outputs/platform/football-v159/unity/"+phase+"-motion-tests.json"),json);return json;
    }
    static void ValidateBall(WorldFrame template,Action<bool,string,double> check){
        foreach(int frequency in new[]{30,60,120}){
            var frame=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(template));frame.clock=20;frame.ball=new[]{0.0,(double)WorldBallMotion.Radius,0};frame.ballOpacity=1;
            var motion=new WorldBallMotion();motion.Sample(frame);double distance=Math.PI*WorldBallMotion.Radius;
            for(int i=1;i<=frequency;i++){frame.clock=20+i/(double)frequency;frame.ball[0]=distance*i/frequency;motion.Sample(frame);}
            check(Math.Abs(motion.SpinDegrees-180)<.001,"Observed half-circumference rolls the ball by 180 degrees / "+frequency,motion.SpinDegrees);
            check(Quaternion.Angle(Quaternion.identity,motion.Rotation)>179,"Real panel orientation changes at "+frequency+" Hz",Quaternion.Angle(Quaternion.identity,motion.Rotation));
            var rotation=motion.Rotation;var degrees=motion.SpinDegrees;frame.clock+=.1;motion.Sample(frame);check(rotation==motion.Rotation&&degrees==motion.SpinDegrees,"A stationary ball does not spin at "+frequency+" Hz",degrees);
            frame.ball[0]+=2;motion.Sample(frame);check(rotation==motion.Rotation&&degrees==motion.SpinDegrees,"A paused native clock freezes the ball orientation / "+frequency,0);
            frame.clock=0;motion.Sample(frame);check(motion.SpinDegrees==0&&motion.Rotation==Quaternion.identity,"Replay seek resets ball orientation / "+frequency,0);
            frame.clock=.05;frame.ball[0]+=20;motion.Sample(frame);check(motion.SpinDegrees==0,"A restart cut cannot turn a teleport into rolling / "+frequency,0);
        }
    }
    static void ValidateMotion(GameObject actor,PlayableGraph graph,FootballAnimation animation,AnimationClip run,AnimationClip idle,AnimationClip dive,Action<bool,string,double> check){
        const string asset="Assets/Doppel6EngineProbe/Art/football-v130.fbx";
        AnimationClip Clip(string name)=>Array.Find(AssetDatabase.LoadAllAssetsAtPath(asset),a=>a is AnimationClip&&a.name==name) as AnimationClip;
        double cycles=10.37;
        foreach(var clip in new[]{Clip("walking"),run,Clip("sprint_forward")}){
            double length=clip.length-.001,normalized=FootballStrideTiming.Time(cycles,clip)/length-FootballStride.Footfall(clip);
            check(Math.Abs(normalized-cycles)<1e-9,"Walk, run and sprint share the measured left footfall at one cycle value / "+clip.name,normalized);
        }
        foreach(int frequency in new[]{30,60,120}){
            var motion=new FootballLocomotion();var point=Vector3.zero;motion.Sample(point,Vector3.forward,30,false,false);
            bool stable=true;int changes=0;string old="walk";
            for(int i=1;i<=frequency;i++){float speed=1.8f+(i%2==0?.03f:-.03f);point+=Vector3.forward*speed/frequency;motion.Sample(point,Vector3.forward,30+i/(double)frequency,false,false);if(i>frequency/4&&motion.StrideMode!=old)changes++;old=motion.StrideMode;stable&=motion.Speed>=0;}
            check(stable&&changes==0,"Threshold jitter cannot alternate walk/run clips / "+frequency,changes);
            double phase=motion.StridePhase;motion.Sample(point,Vector3.forward,31,false,false);check(motion.StridePhase==phase,"Paused stride phase remains frozen / "+frequency,0);
        }
        var bones=actor.GetComponentsInChildren<Transform>();var hips=Array.Find(bones,t=>t.name=="mixamorig:Hips");var root=actor.transform.position;var heading=actor.transform.rotation;
        var pose=new FootballAnimation.Pose{clip=dive,time=FootballKeeperTiming.Time(dive.name,1),key="lateral-keeper",target=actor.transform.position+Vector3.right*1.3f+Vector3.up*.4f};
        animation.Sample(pose,40,true);var neutral=hips.rotation;pose.keeperDive=1;animation.Sample(pose,41,true);
        check(Quaternion.Angle(neutral,hips.rotation)>30,"Observed lateral dive banks the actual body, rather than leaving it upright",Quaternion.Angle(neutral,hips.rotation));
        var before=Array.ConvertAll(bones,t=>t.position);for(int i=1;i<=60;i++)animation.Sample(pose,41+i/60.0);
        bool bounded=true;for(int i=0;i<bones.Length;i++)bounded&=Vector3.Distance(before[i],bones[i].position)<.0001f;
        check(bounded,"A repeated observed dive cannot accumulate body displacement",0);
        check(root==actor.transform.position&&heading==actor.transform.rotation,"Dive presentation cannot move or turn the game-owned root",0);
        animation.Sample(new FootballAnimation.Pose{clip=idle,time=.4,key="keeper-idle"},42,true);
        var left=Array.Find(bones,t=>t.name=="mixamorig:LeftHand");var target=left.position+Vector3.forward*.015f;
        animation.Sample(new FootballAnimation.Pose{clip=idle,time=.4,key="left-hand-contact",contact=true,kind="left-hand",target=target},42.01);
        check(animation.rig.reachable&&animation.rig.contactError<.01f,"The left hand can reach an actual left-side native contact without stretching",animation.rig.contactError);
        check(root==actor.transform.position&&heading==actor.transform.rotation,"Left-hand correction retains the game-owned root",0);
    }
    static void ValidateBridge(string repository,UnityEngine.SceneManagement.Scene scene,GameObject actor,FootballAnimation animation,AnimationClip run,AnimationClip idle,AnimationClip dive,AnimationClip high,AnimationClip low,Action<bool,string,double> check){
        var config=JsonUtility.FromJson<WorldConfig>(File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json")));
        var identity=Array.Find(config.players,p=>p.keeper);var pose=Array.Find(config.initial.players,p=>p.id==identity.id);config.initial.players=new[]{pose};config.initial.owner="";config.initial.phase="live";config.initial.clock=50;config.initial.ball=new[]{0.0,.2,0};config.initial.netActive=false;
        var inbox=new WorldViewState(config);var picture=JsonUtility.ToJson(inbox.Frame);
        GameObject Object(string name){var go=new GameObject(name);UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(go,scene);return go;}
        var bridge=Object("D6 actual renderer test").AddComponent<ProbeBridge>();
        var flags=System.Reflection.BindingFlags.NonPublic|System.Reflection.BindingFlags.Instance;
        void Field(string name,object value)=>typeof(ProbeBridge).GetField(name,flags).SetValue(bridge,value);
        Field("worldView",inbox);Field("world",Object("D6 test world").transform);var ball=Object("D6 test ball").transform;Field("ballView",ball);Field("ballShadow",Object("D6 test ball shadow").transform);
        ((List<Transform>)typeof(ProbeBridge).GetField("actors",flags).GetValue(bridge)).Add(actor.transform);
        ((List<Transform>)typeof(ProbeBridge).GetField("rings",flags).GetValue(bridge)).Add(Object("D6 test ring").transform);
        ((List<FootballAnimation>)typeof(ProbeBridge).GetField("football",flags).GetValue(bridge)).Add(animation);
        Field("worldActors",new[]{pose});Field("runSpeeds",new float[1]);Field("animationTimes",new double[1]);Field("worldLocomotion",new[]{new FootballLocomotion()});Field("worldBallMotion",new WorldBallMotion());
        Field("renderedPoses",Array.CreateInstance(typeof(ProbeBridge).GetNestedType("WorldRenderedPose",System.Reflection.BindingFlags.NonPublic),1));
        var playback=new WorldViewPlayback();playback.Receive(inbox.Frame,Time.realtimeSinceStartupAsDouble-.2);Field("playback",playback);
        bridge.runClip=bridge.fastRunClip=bridge.walkClip=bridge.sprintClip=bridge.backClip=bridge.brakeClip=bridge.turnLeftClip=bridge.turnRightClip=run;bridge.idleClip=bridge.keeperClip=idle;bridge.keeperDiveClip=dive;bridge.keeperHighClip=high;bridge.keeperActionClip=low;bridge.keeperRiseClip=low;
        var camera=Camera.main;var originalPosition=camera.transform.position;var originalRotation=camera.transform.rotation;float originalFov=camera.fieldOfView,originalAspect=camera.aspect;
        try{
            void Render()=>typeof(ProbeBridge).GetMethod("RenderWorld",flags).Invoke(bridge,null);
            Render();var old=ball.rotation;
            var frame=JsonUtility.FromJson<WorldFrame>(picture);frame.clock+=.05;frame.ball[0]+=.04;playback.Receive(frame,Time.realtimeSinceStartupAsDouble-.2);Render();
            check(Quaternion.Angle(old,ball.rotation)>5,"Actual RenderWorld rotates the rendered ball Transform from received travel",Quaternion.Angle(old,ball.rotation));
            check(Vector3.Distance(ball.position,new Vector3((float)frame.ball[0],ProbeBridge.DisplayHeight(frame.ball[1]),(float)frame.ball[2]))<.00001,"Actual RenderWorld keeps the received ball path; only the documented ground display height applies",0);
            check(Math.Abs(ProbeBridge.DisplayHeight(.29)-WorldBallMotion.Radius)<.0001f,"A native ground ball rests on the pitch instead of floating",ProbeBridge.DisplayHeight(.29));
            bool monotonic=true;float last=-1;for(int h=0;h<=300;h++){float y=ProbeBridge.DisplayHeight(.29+h*.01);monotonic&=y>last;last=y;}
            check(monotonic&&Math.Abs(ProbeBridge.DisplayHeight(1.29)-1.29f)<.0001f&&Math.Abs(ProbeBridge.DisplayHeight(2.6)-2.6f)<.0001f,"Ball display height is monotonic and unchanged from 1.29 m, so crossbar heights stay native",0);
            check(JsonUtility.ToJson(inbox.Frame)==picture,"Actual rendering cannot mutate the authoritative received match picture",0);
            frame.clock+=.05;frame.players[0].action="save";frame.players[0].actionId="native-low-save";frame.players[0].progress=1;frame.players[0].contactPoint=new[]{frame.players[0].position[0],.4,frame.players[0].position[2]};frame.ball=(double[])frame.players[0].contactPoint.Clone();playback.Receive(frame,Time.realtimeSinceStartupAsDouble-.2);Render();
            var actual=(FootballAnimation.Pose)typeof(ProbeBridge).GetMethod("WorldFootballPose",flags).Invoke(bridge,new object[]{frame.players[0],frame,0});
            check(actual.contact&&actual.urgent&&Math.Abs(actual.time-1.18)<.001,"Actual low save uses the measured contact window on the received contact frame",actual.time);
            check(animation.Weight(low)>.98,"Actual low save contact is not delayed by the visual mixer",animation.Weight(low));
        }finally{camera.transform.SetPositionAndRotation(originalPosition,originalRotation);camera.fieldOfView=originalFov;camera.aspect=originalAspect;}
    }
}
#endif

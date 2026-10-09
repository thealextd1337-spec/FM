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
// Phase 2 (animation and IK) checks on the actual rig and the actual
// RenderWorld selection: ground contact, measured gait, clip bands, turns,
// contact release, keeper palms, headers, fouls and goal celebrations.
public static class FootballGaitTests {
    [Serializable] class Check {public string name;public bool passed;public double measured;}
    [Serializable] class Report {public int passed,failed;public Check[] checks;}
    const string Asset="Assets/Doppel6EngineProbe/Art/football-v130.fbx";
    static AnimationClip Clip(string name){
        var clip=Array.Find(AssetDatabase.LoadAllAssetsAtPath(Asset),a=>a is AnimationClip&&a.name==name) as AnimationClip;
        return clip??AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Doppel6EngineProbe/Art/"+name+".anim")??throw new Exception("Missing clip "+name);
    }
    public static string Run(string repository){
        var checks=new List<Check>();void Check(bool ok,string name,double measured=0){checks.Add(new Check{name=name,passed=ok,measured=measured});}
        var scene=EditorSceneManager.NewPreviewScene();var graph=PlayableGraph.Create("D6 gait validation");
        try{
            var actor=UnityEngine.Object.Instantiate(AssetDatabase.LoadAssetAtPath<GameObject>(Asset));UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(actor,scene);actor.transform.localScale=Vector3.one*1.45f;
            var animator=actor.GetComponent<Animator>();if(animator==null)animator=actor.AddComponent<Animator>();animator.applyRootMotion=false;
            var names=new[]{"idle_stand_meshy","running","keeper_ready_meshy","keeper_low_meshy","shot_meshy","pass_inside_meshy","receive_ground_meshy","keeper_high_meshy","keeper_dive_meshy","keeper_rise_meshy","walking","run_fast4","sprint_forward","back_walk","brake_meshy","turn_run_left","turn_run_right","run_fast6","back_left","turn_idle_left","turn_idle_right","turn_walk_left","turn_walk_right","celebrate_arms","celebrate_fist","celebrate_victory","foul_fall_meshy"};
            var clips=Array.ConvertAll(names,Clip);AnimationClip C(string n)=>clips[Array.IndexOf(names,n)];
            graph.SetTimeUpdateMode(DirectorUpdateMode.Manual);AnimationPlayableOutput.Create(graph,"Character",animator).SetSourcePlayable(AnimationClipPlayable.Create(graph,C("idle_stand_meshy")));graph.Play();graph.Evaluate(0);
            var probe=new FootballGround(actor.transform);bool measuredBefore=probe.Known(C("keeper_ready_meshy"));
            var animation=new FootballAnimation(graph,actor.transform,clips);
            Check(true,"Diagnostic: keeper_ready measured by an earlier suite on this mesh = "+measuredBefore,measuredBefore?1:0);
            actor.transform.position=new Vector3(0,animation.RootHeight,0);
            var bones=actor.GetComponentsInChildren<Transform>();Transform Bone(string n)=>Array.Find(bones,t=>t.name=="mixamorig:"+n);
            Ground(animation,actor.transform,C,Check);
            Gait(animation,actor.transform,C,Check);
            Release(animation,actor.transform,C,Bone,Check);
            Reach(animation,actor.transform,C,Bone,Check);
            Bridge(repository,scene,actor,animation,clips,names,Check);
            Kits(Check);
            Presentation(repository,scene,Check);
        }finally{if(graph.IsValid())graph.Destroy();EditorSceneManager.ClosePreviewScene(scene);}
        int failed=checks.FindAll(c=>!c.passed).Count;var json=JsonUtility.ToJson(new Report{passed=checks.Count-failed,failed=failed,checks=checks.ToArray()},true);
        var folder=Path.Combine(repository,"outputs/platform/unity-phases");Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,"gait-tests.json"),json);
        if(failed>0)throw new Exception(failed+" gait checks failed; see outputs/platform/unity-phases/gait-tests.json");
        return json;
    }
    static float Lowest(Transform actor){return FootballGround.LowestVertex(actor)+actor.position.y;}
    static void Ground(FootballAnimation a,Transform actor,Func<string,AnimationClip> C,Action<bool,string,double> check){
        check(a.ground.Calibrated&&a.ground.Sole<0,"Standing reference sole measured on the actual skinned mesh",a.ground.Sole);
        a.Sample(new FootballAnimation.Pose{clip=C("idle_stand_meshy"),time=0,loop=true,key="idle"},1,true);
        float idle=Lowest(actor);check(Mathf.Abs(idle-FootballGround.PitchSurface)<.006f,"Standing players rest on the pitch instead of about 3 cm above it",idle);
        check(Mathf.Abs(.08f-a.ground.Sole-FootballGround.PitchSurface)>.03f,"The previous fixed root height floated measurably",.08f+a.ground.Sole);
        // Every grounded clip touches the turf at least once per cycle and never hovers.
        foreach(var name in new[]{"keeper_ready_meshy","pass_inside_meshy","walking","run_fast6","run_fast4","sprint_forward","running","back_left","celebrate_arms"}){
            var clip=C(name);float lowest=float.MaxValue;
            for(int s=0;s<24;s++){a.Sample(new FootballAnimation.Pose{clip=clip,time=s*(clip.length-.001)/23,key=name},2+s,true);lowest=Mathf.Min(lowest,Lowest(actor));}
            check(lowest>-.02f&&lowest<.02f,"Measured ground contact within 2 cm for "+name+" (offset "+a.ground.Of(clip).ToString("0.000")+" m)",lowest);
        }
        foreach(var name in new[]{"keeper_ready_meshy","keeper_rise_meshy","pass_inside_meshy"}){
            var clip=C(name);float raw=float.MaxValue,rawTime=0;
            for(int s=0;s<48;s++){float t=s*(clip.length-.001f)/47;a.Sample(new FootballAnimation.Pose{clip=clip,time=t,key="raw"+name},300+s,true);float v=Lowest(actor)+a.GroundShift;if(v<raw){raw=v;rawTime=t;}}
            var all=actor.GetComponentsInChildren<Transform>();float viaMeasure=a.MeasuredSole(clip,rawTime);var measuredPose=Array.ConvertAll(all,t=>(t.localRotation,t.localPosition));a.Sample(new FootballAnimation.Pose{clip=clip,time=rawTime,key="cmp"+name},400,true);float viaSample=Lowest(actor)+a.GroundShift;
            var differing=new List<string>();for(int b=0;b<all.Length;b++){float angle=Quaternion.Angle(measuredPose[b].Item1,all[b].localRotation),move=Vector3.Distance(measuredPose[b].Item2,all[b].localPosition);if(angle>.5f||move>.002f)differing.Add(all[b].name.Replace("mixamorig:","")+" "+angle.ToString("0.0")+"deg/"+move.ToString("0.000"));}
            check(true,"Diagnostic bones differing for "+name+": "+string.Join(", ",differing),differing.Count);
            check(true,"Diagnostic same time via measuring path "+viaMeasure.ToString("0.0000")+" vs sampling path "+viaSample.ToString("0.0000")+" for "+name,viaMeasure-viaSample);
            check(true,"Diagnostic unshifted skinned sole of "+name+" at "+rawTime.ToString("0.00")+" s; stored offset "+a.ground.Of(clip).ToString("0.000"),raw);
        }
        check(a.ground.Of(C("keeper_rise_meshy"))==0,"A lying pose below the standing sole is never lifted",a.ground.Of(C("keeper_rise_meshy")));
        var root=actor.position;a.Sample(new FootballAnimation.Pose{clip=C("keeper_ready_meshy"),time=.5,key="keeper"},40,true);
        check(actor.position==root,"Grounding moves only bones, never the game-owned root",0);
    }
    // Stance foot slip in metres per second while the root moves at a constant real speed.
    static float Slip(FootballAnimation a,Transform actor,AnimationClip clip,float speed,float stride){
        var m=new FootballLocomotion();var start=actor.position;var p=Vector3.zero;m.Sample(p,Vector3.forward,0,false,false,-1,stride);
        var ground=a.ground;var toes=new[]{Find(actor,"LeftToeBase"),Find(actor,"RightToeBase")};
        Vector3[] last=null;float slip=0;int count=0;
        for(int frame=1;frame<=180;frame++){
            double clock=frame/60.0;p+=Vector3.forward*speed/60;m.Sample(p,Vector3.forward,clock,false,false,-1,stride);actor.position=start+p;
            a.Sample(new FootballAnimation.Pose{clip=clip,time=a.StrideTime(m.StridePhase,clip),loop=true,key="gait"},clock,frame==1);
            var now=new[]{toes[0].position,toes[1].position};
            if(last!=null&&frame>60){int f=ground.Clearance(0)<ground.Clearance(1)?0:1;if(ground.Clearance(f)<.03f){slip+=Vector3.ProjectOnPlane(now[f]-last[f],Vector3.up).magnitude*60;count++;}}
            last=now;
        }
        actor.position=start;return count>0?slip/count:float.NaN;
    }
    static Transform Find(Transform root,string n){return Array.Find(root.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:"+n);}
    static void Gait(FootballAnimation a,Transform actor,Func<string,AnimationClip> C,Action<bool,string,double> check){
        // Measured strides: metres per cycle of the planted foot.
        foreach(var name in new[]{"walking","run_fast6","run_fast4","sprint_forward","running","back_walk"})check(a.StrideLength(C(name))>.5f,"Stride measured for "+name+" = "+a.StrideLength(C(name)).ToString("0.00")+" m",a.StrideLength(C(name)));
        // The left foot lands at the same cycle value in every stride clip.
        var ground=a.ground;
        foreach(var name in new[]{"walking","run_fast6","run_fast4","sprint_forward","running"}){
            var clip=C(name);a.Sample(new FootballAnimation.Pose{clip=clip,time=a.StrideTime(7,clip)+.02*clip.length,loop=true,key="ff"+name},50,true);
            check(ground.Clearance(0)<.035f,"Left foot is planted at the shared footfall cycle in "+name,ground.Clearance(0));
        }
        foreach(var band in new[]{("walking",1.6f,1.9f),("run_fast6",3f,3.3f),("run_fast4",4.8f,3.3f),("sprint_forward",5.6f,3.5f),("running",3.6f,2.9f)}){
            var clip=C(band.Item1);float measured=Slip(a,actor,clip,band.Item2,a.StrideLength(clip)),old=Slip(a,actor,clip,band.Item2,band.Item3);
            check(measured<band.Item2*.35f&&measured<=old+.05f,"Stance foot slip "+band.Item1+" at "+band.Item2+" m/s: measured cadence "+measured.ToString("0.00")+" m/s, previous "+old.ToString("0.00")+" m/s",measured);
        }
        // Speed bands with hysteresis: noise around the boundary cannot alternate clips.
        var m=new FootballLocomotion();var p=Vector3.zero;m.Sample(p,Vector3.forward,0,false,false);int changes=0;bool fast=false;
        for(int i=1;i<=240;i++){float v=i<60?3f:i<120?4.6f:4f+(i%2==0?.15f:-.15f);p+=Vector3.forward*v/60;m.Sample(p,Vector3.forward,i/60.0,false,false);if(i==59)check(m.StrideMode=="run"&&!m.FastStride,"A 3 m/s run uses the measured jog clip",m.StrideSpeed);if(i==119)check(m.FastStride,"A 4.6 m/s run uses the measured fast run clip",m.StrideSpeed);if(i>125){if(m.FastStride!=fast)changes++;}fast=m.FastStride;}
        check(changes==0,"Speed noise near the jog/fast boundary keeps one clip",changes);
    }
    static void Release(FootballAnimation a,Transform actor,Func<string,AnimationClip> C,Func<string,Transform> Bone,Action<bool,string,double> check){
        var foot=Bone("RightFoot");var pass=C("pass_inside_meshy");var target=actor.position+actor.forward*.55f+actor.right*.12f+Vector3.up*.25f;
        var pose=new FootballAnimation.Pose{clip=pass,time=.8,key="pass-release",contact=true,kind="foot",target=target};a.Sample(pose,60,true);a.Sample(pose,60+1/60.0);
        check(a.rig.reachable&&a.rig.contactError<.03f,"Native pass contact reaches the actual point",a.rig.contactError);
        var atContact=foot.position;pose.contact=false;float largest=0;var previous=atContact;
        for(int f=2;f<=12;f++){pose.time=.8+f/60.0;a.Sample(pose,60+f/60.0);largest=Mathf.Max(largest,Vector3.Distance(previous,foot.position));previous=foot.position;}
        // Reference: the same frames without release, as before this change.
        var reference=new FootballAnimation.Pose{clip=pass,time=.8+1/60.0,key="reference"};a.Sample(reference,80,true);var authored=foot.position;
        check(largest<Vector3.Distance(atContact,authored)*.6f||Vector3.Distance(atContact,authored)<.02f,"Contact releases over 0.1 s instead of popping back to the authored foot",largest);
        check(a.ReleaseWeight==0,"Release ends within the documented native time",a.ReleaseWeight);
        // A pause on the release frame freezes the limb.
        pose.contact=true;pose.key="pause-release";pose.time=.8;a.Sample(pose,90,true);a.Sample(pose,90.01);pose.contact=false;a.Sample(pose,90.04);var held=foot.position;a.Sample(pose,90.04);
        check(held==foot.position&&a.ReleaseWeight>0,"Paused native clock freezes a releasing limb",a.ReleaseWeight);
    }
    static void Reach(FootballAnimation a,Transform actor,Func<string,AnimationClip> C,Func<string,Transform> Bone,Action<bool,string,double> check){
        var root=actor.position;var rotation=actor.rotation;
        var chest=actor.position+actor.forward*.55f+Vector3.up*1.7f;
        a.Sample(new FootballAnimation.Pose{clip=C("keeper_low_meshy"),time=1.18,key="central-save",contact=true,urgent=true,kind="two-hands",target=chest},100,true);
        float right=Vector3.Distance(Bone("RightHand").position,chest+actor.right*.11f),left=Vector3.Distance(Bone("LeftHand").position,chest-actor.right*.11f);
        check(a.rig.reachable&&right<.03f&&left<.03f,"Central keeper save meets the actual ball with both palms",Mathf.Max(left,right));
        a.Sample(new FootballAnimation.Pose{clip=C("keeper_low_meshy"),time=1.18,key="far-save",contact=true,urgent=true,kind="two-hands",target=chest+actor.forward*6},101,true);
        check(!a.rig.reachable,"An unreachable central ball stays unreachable",a.rig.contactError);
        var head=Bone("Head");a.Sample(new FootballAnimation.Pose{clip=C("idle_stand_meshy"),time=0,key="header-base"},102,true);var before=head.position;var ball=before+actor.forward*.9f+Vector3.up*.1f;
        a.Sample(new FootballAnimation.Pose{clip=C("idle_stand_meshy"),time=0,key="header",contact=true,kind="head",target=ball,contactWeight=.999f},103,true);
        float closer=Vector3.Distance(before,ball)-Vector3.Distance(head.position,ball),moved=Vector3.Distance(before,head.position);
        check(closer>.05f&&moved<.9f,"Header turns the actual head toward the contact within "+FootballRig.HeadReach+" degrees",closer);
        check(actor.position==root&&actor.rotation==rotation,"Keeper palms and headers keep the game-owned root",0);
        var throwBall=actor.position+actor.forward*.2f+Vector3.up*2.35f;
        a.Sample(new FootballAnimation.Pose{clip=C("idle_stand_meshy"),time=0,key="throw",contact=true,kind="two-hands",target=throwBall},104,true);
        var shoulder=Bone("RightArm");float armLength=Vector3.Distance(shoulder.position,Bone("RightForeArm").position)+Vector3.Distance(Bone("RightForeArm").position,Bone("RightHand").position);
        check(a.rig.contactError<.35f,"Throw-in hands hold the actual ball above the head where reachable (shoulder "+shoulder.position.y.ToString("0.00")+" m, arm "+armLength.ToString("0.00")+" m, reachable "+a.rig.reachable+")",a.rig.contactError);
    }
    // Kit colours from an actual club-world fixture (FC Bremen Weser v FC Koeln Rhein).
    static void Kits(Action<bool,string,double> check){
        Color C(string code){ColorUtility.TryParseHtmlString(code,out var c);return c;}
        foreach(var kit in new[]{("Bremen home","#398b5b","#f3f5f2","#d9ab45","stripe"),("Koeln away","#d9ab45","#f3f5f2","#1c3045","stripe"),("Koeln home","#1c3045","#f3f5f2","#d9ab45","diagonal"),("Bremen keeper","#6a88df","#f3f5f2","#f3f5f2","solid"),("Koeln keeper","#54d3ce","#1d2329","#1d2329","solid"),("Opponent keeper","#ed53b7","#f3f5f2","#f3f5f2","solid")}){
            var (ink,edge)=ProbeBridge.KitNumberColors(C(kit.Item2),C(kit.Item3),C(kit.Item4),kit.Item5);float onMain=ProbeBridge.Contrast(ink,C(kit.Item2)),onEdge=ProbeBridge.Contrast(ink,edge);
            check(onMain>=3&&onEdge>=3,"Shirt number of "+kit.Item1+" reads at contrast "+onMain.ToString("0.0")+":1 with a "+onEdge.ToString("0.0")+":1 edge",onMain);
        }
        var shader=File.ReadAllText("Assets/Doppel6EngineProbe/Art/WorldKit.shader");
        check(shader.Contains("shorts=!shirt&&cloth.g>.5")&&shader.Contains("if(shorts)color=_Accent.rgb"),"Shorts use the mask's green channel and the club accent colour",0);
        check(shader.Contains("o.body=float3(i.rest.x,i.rest.z,-i.rest.y)"),"Kit regions use the mesh's z-up, front -y bind pose (measured in kit-regions.json)",0);
    }
    // Phase 4: stand occlusion without flicker and the conservative quality field.
    static void Presentation(string repository,UnityEngine.SceneManagement.Scene scene,Action<bool,string,double> check){
        var go=new GameObject("D6 presentation bridge");UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(go,scene);var bridge=go.AddComponent<ProbeBridge>();var flags=BindingFlags.NonPublic|BindingFlags.Instance;
        var sides=(Transform[])typeof(ProbeBridge).GetField("standSides",flags).GetValue(bridge);for(int i=0;i<4;i++){var stand=new GameObject("stand "+i);UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(stand,scene);sides[i]=stand.transform;}
        typeof(ProbeBridge).GetField("standHalf",flags).SetValue(bridge,new Vector2(34,22));var update=typeof(ProbeBridge).GetMethod("UpdateStadiumVisibility",flags);
        int toggles=0;bool last=true;for(int k=0;k<=200;k++){float z=27.5f+Mathf.Sin(k*.7f)*.3f+(k>150?2:0);update.Invoke(bridge,new object[]{new Vector3(0,13,z)});if(bridge.StandShown(1)!=last){toggles++;last=bridge.StandShown(1);}}
        check(toggles==1&&!bridge.StandShown(1)&&bridge.StandShown(0),"A camera wobbling at a stand front hides that stand once, without flicker",toggles);
        update.Invoke(bridge,new object[]{new Vector3(-49,19,9)});check(!bridge.StandShown(2)&&bridge.StandShown(3)&&bridge.StandShown(0),"Behind-goal camera hides only its own end stand",0);
        var config=JsonUtility.FromJson<WorldConfig>(File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json")));
        check(string.IsNullOrEmpty(config.quality),"Pages without a quality field remain valid (platform decides)",0);
        config.quality="reduced";check(new WorldViewState(config).Config.quality=="reduced","A reduced quality request is carried by the match view configuration",0);
        var env=File.ReadAllText("Assets/Doppel6EngineProbe/Runtime/WorldViewEnvironment.cs");
        check(env.Contains("urp.msaaSampleCount=ReducedQuality?1:")&&env.Contains("mainLightShadowmapResolution=ReducedQuality?1024:")&&env.Contains("matchBloom.active=!ReducedQuality"),"Reduced quality disables MSAA and bloom and uses 1024 hard shadows",0);
        check(env.Contains("SetReplayGrade(bool replay)")&&File.ReadAllText("Assets/Doppel6EngineProbe/Runtime/WorldViewBridge.cs").Contains("SetReplayGrade(f.replay)"),"Replay grading follows only the received replay flag",0);
    }
    static void Bridge(string repository,UnityEngine.SceneManagement.Scene scene,GameObject actor,FootballAnimation animation,AnimationClip[] clips,string[] names,Action<bool,string,double> check){
        AnimationClip C(string n)=>clips[Array.IndexOf(names,n)];
        var config=JsonUtility.FromJson<WorldConfig>(File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json")));
        var identity=Array.Find(config.players,p=>!p.keeper&&p.team==0);var pose=Array.Find(config.initial.players,p=>p.id==identity.id);config.initial.players=new[]{pose};config.initial.owner="";config.initial.phase="live";config.initial.clock=50;config.initial.ball=new[]{10.0,.29,10};
        var inbox=new WorldViewState(config);var picture=JsonUtility.ToJson(inbox.Frame);
        // Legacy pictures without celebration fields remain valid and inactive.
        var legacy=JsonUtility.FromJson<WorldFrame>(picture.Replace("\"celebrating\":false,",""));check(!legacy.celebrating,"A legacy picture without celebration fields is read as no celebration",0);
        var bad=JsonUtility.FromJson<WorldFrame>(picture);bad.sequence++;bad.celebrating=true;bad.celebrationTeam=3;bool rejected=false;try{inbox.Accept(bad);}catch(ArgumentException){rejected=true;}check(rejected&&JsonUtility.ToJson(inbox.Frame)==picture,"Invalid celebration team is rejected atomically",0);
        GameObject Object(string n){var go=new GameObject(n);UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(go,scene);return go;}
        var bridge=Object("D6 gait bridge").AddComponent<ProbeBridge>();var flags=BindingFlags.NonPublic|BindingFlags.Instance;
        void Field(string n,object v)=>typeof(ProbeBridge).GetField(n,flags).SetValue(bridge,v);
        Field("worldView",inbox);Field("ballView",Object("ball").transform);Field("worldActors",new[]{pose});Field("runSpeeds",new float[1]);Field("animationTimes",new double[1]);Field("worldLocomotion",new[]{new FootballLocomotion()});
        ((List<Transform>)typeof(ProbeBridge).GetField("actors",flags).GetValue(bridge)).Add(actor.transform);((List<FootballAnimation>)typeof(ProbeBridge).GetField("football",flags).GetValue(bridge)).Add(animation);
        bridge.idleClip=C("idle_stand_meshy");bridge.runClip=C("running");bridge.keeperClip=C("keeper_ready_meshy");bridge.keeperActionClip=C("keeper_low_meshy");bridge.shotClip=C("shot_meshy");bridge.passClip=C("pass_inside_meshy");bridge.receiveClip=C("receive_ground_meshy");bridge.keeperHighClip=C("keeper_high_meshy");bridge.keeperDiveClip=C("keeper_dive_meshy");bridge.keeperRiseClip=C("keeper_rise_meshy");
        bridge.walkClip=C("walking");bridge.fastRunClip=C("run_fast4");bridge.sprintClip=C("sprint_forward");bridge.backClip=C("back_walk");bridge.brakeClip=C("brake_meshy");bridge.turnLeftClip=C("turn_run_left");bridge.turnRightClip=C("turn_run_right");
        bridge.jogClip=C("run_fast6");bridge.fastBackClip=C("back_left");bridge.turnIdleLeftClip=C("turn_idle_left");bridge.turnIdleRightClip=C("turn_idle_right");bridge.turnWalkLeftClip=C("turn_walk_left");bridge.turnWalkRightClip=C("turn_walk_right");bridge.celebrateArmsClip=C("celebrate_arms");bridge.celebrateFistClip=C("celebrate_fist");bridge.celebrateVictoryClip=C("celebrate_victory");bridge.foulFallClip=C("foul_fall_meshy");
        var method=typeof(ProbeBridge).GetMethod("WorldFootballPose",flags);
        FootballAnimation.Pose Select(WorldFrame f)=>(FootballAnimation.Pose)method.Invoke(bridge,new object[]{f.players[0],f,0});
        WorldFrame Frame(double clock,double x,double z,Vector3 facing){var f=JsonUtility.FromJson<WorldFrame>(picture);f.clock=clock;f.players[0].position=new[]{x,0,z};f.players[0].facing=new[]{(double)facing.x,0,facing.z};return f;}
        // Stationary pivot and walking turn select their own existing clips.
        Field("worldLocomotion",new[]{new FootballLocomotion()});var selected=Select(Frame(1,0,0,Vector3.forward));
        for(int k=1;k<=12;k++)selected=Select(Frame(1+k/60.0,0,0,Quaternion.AngleAxis(k*4,Vector3.up)*Vector3.forward));
        check(selected.clip==C("turn_idle_right"),"A stationary native pivot uses turn_idle_right",0);
        Field("worldLocomotion",new[]{new FootballLocomotion()});double z=0;selected=Select(Frame(2,0,0,Vector3.forward));
        for(int k=1;k<=12;k++){z+=1.4/60;selected=Select(Frame(2+k/60.0,0,z,Quaternion.AngleAxis(-k*4,Vector3.up)*Vector3.forward));}
        check(selected.clip==C("turn_walk_left")&&selected.baseClip==C("walking"),"A walking native turn uses turn_walk_left over the walking stride",0);
        // Goal celebration only on a booked native goal for the scoring team.
        Field("worldLocomotion",new[]{new FootballLocomotion()});var calm=Frame(3,0,0,Vector3.forward);Select(calm);calm.clock=3.1;
        check(Select(calm).clip==C("idle_stand_meshy"),"Without a native goal the player stays in the authored idle",0);
        var goal=Frame(3.2,0,0,Vector3.forward);goal.celebrating=true;goal.celebrationTeam=0;goal.celebrationTime=1.2;goal.celebrationScorer=identity.id;
        check(Select(goal).clip==C("celebrate_victory"),"The actual scorer celebrates the booked goal",0);
        goal.clock=3.3;goal.celebrationTeam=1;check(Select(goal).clip==C("idle_stand_meshy"),"The conceding team never celebrates",0);
        // Native foul victim: measured fall, then the measured rise window.
        var foul=Frame(4,0,0,Vector3.forward);foul.players[0].action="foulVictim";foul.players[0].actionId="foul:1";foul.players[0].progress=.2;
        var fall=Select(foul);foul.clock=4.1;foul.players[0].progress=.8;var rise=Select(foul);
        check(fall.clip==C("foul_fall_meshy")&&rise.clip==C("keeper_rise_meshy")&&rise.time>4.4&&rise.time<6.3,"Native foul victim falls and rises within measured windows",rise.time);
        // Carrier reach follows the measured footfall of the actual stride clip.
        Field("worldLocomotion",new[]{new FootballLocomotion()});int reaches=0,partial=0;z=0;
        for(int k=0;k<=90;k++){z+=3.0/60;var f=Frame(5+k/60.0,0,z,Vector3.forward);f.owner=identity.id;var b=(Transform)typeof(ProbeBridge).GetField("ballView",flags).GetValue(bridge);b.position=new Vector3(0,.18f,(float)z+.5f);actor.transform.position=new Vector3(0,animation.RootHeight,(float)z);var s=Select(f);if(s.contact){reaches++;if(s.contactWeight>0&&s.contactWeight<1)partial++;}}
        check(reaches>4&&partial==reaches,"Carrier stride shows smooth partial reaches at measured footfalls",reaches);
    }
}
#endif

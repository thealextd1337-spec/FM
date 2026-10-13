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
    public static string Run(string repository,string outputFolder=null){
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
            NaturalMotionR5(animation,actor.transform,C,Bone,Check);
            Release(animation,actor.transform,C,Bone,Check);
            BallContact(animation,actor.transform,C,Bone,Check);
            ReadyEntry(animation,actor.transform,C,Bone,Check);
            R18(animation,actor.transform,C,Bone,Check);
            Reach(animation,actor.transform,C,Bone,Check);
            Bridge(repository,scene,actor,animation,clips,names,Check);
            Kits(Check);
            Presentation(repository,scene,Check);
        }finally{if(graph.IsValid())graph.Destroy();EditorSceneManager.ClosePreviewScene(scene);}
        int failed=checks.FindAll(c=>!c.passed).Count;var json=JsonUtility.ToJson(new Report{passed=checks.Count-failed,failed=failed,checks=checks.ToArray()},true);
        var folder=Path.Combine(repository,outputFolder??"outputs/platform/unity-phases");Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,"gait-tests.json"),json);
        if(failed>0)throw new Exception(failed+" gait checks failed; see outputs/platform/unity-phases/gait-tests.json");
        return json;
    }
    // r18: a foot contact turns thigh and shin least from the leg shown in the last picture (FootballRig.LeastLeg). A
    // second receive whose point lies 0.43 m from the boot while the first receive releases (native 160112-field-2
    // 77.117) meets its point, turns the leg no more than the R16 solve of the same picture (swivelPole) and by its
    // twist-free bound (swivelDirect), keeps the knee in front and allocates nothing (the solve cost per call in the
    // editor on this machine is reported, no device figure). A full foot contact that changes its limb within one action
    // (a tackle's side of the received facing) releases the old boot from its contact point instead of dropping it to
    // the clip in one picture, and that release ends within MaxBallRelease.
    static void R18(FootballAnimation a,Transform actor,Func<string,AnimationClip> C,Func<string,Transform> Bone,Action<bool,string,double> check){
        var receive=C("receive_ground_meshy");float radius=WorldBallMotion.Radius;var thigh=Bone("RightUpLeg");var shin=Bone("RightLeg");
        var first=actor.position+actor.forward*.45f+actor.right*.10f;first.y=radius;
        var pose=new FootballAnimation.Pose{clip=receive,time=.7,key="r18-first",contact=true,kind="foot",target=first,ballContact=true,lockFeet=true};
        a.Sample(pose,800,true);for(int k=1;k<=10;k++){pose.time=.7+k/60.0;pose.contact=k<7;a.Sample(pose,800+k/60.0);}
        var unturn=Quaternion.Inverse(actor.rotation);var u0=unturn*thigh.rotation;var l0=unturn*shin.rotation;
        var second=first+actor.right*.40f+actor.forward*.16f;
        var next=new FootballAnimation.Pose{clip=receive,time=.7,key="r18-second",contact=true,kind="foot",target=second,ballContact=true,lockFeet=true};a.Sample(next,800+11/60.0);
        float turn=Mathf.Max(Quaternion.Angle(u0,unturn*thigh.rotation),Quaternion.Angle(l0,unturn*shin.rotation)),front=Vector3.Dot(a.rig.KneeBend(1).normalized,actor.forward);
        check(a.rig.reachable&&a.rig.contactError<.03f&&a.rig.swivelPole>=0&&turn<=a.rig.swivelPole+.5f&&Mathf.Abs(turn-a.rig.swivelDirect)<1&&front>-.2f,"A second receive 0.43 m from the releasing boot turns the leg least from its shown pose: "+turn.ToString("0.0")+" deg (R16 solve "+a.rig.swivelPole.ToString("0.0")+", twist-free bound "+a.rig.swivelDirect.ToString("0.0")+", chord "+a.rig.swivelChord.ToString("0.0")+"), boot "+(a.rig.contactError*100).ToString("0.0")+" cm from its point, knee forward "+front.ToString("0.00"),turn);
        var shownLeg=a.rig.Leg(1);var aim=a.rig.Ankle(1).position;for(int k=0;k<20;k++)a.rig.Contact(aim,"foot",1,false,false,null,shownLeg);
        const int calls=5000;var none=default(FootballRig.ShownLeg);for(int k=0;k<20;k++)a.rig.Contact(aim,"foot",1,false,false,null,none);
        var clock=System.Diagnostics.Stopwatch.StartNew();for(int k=0;k<calls;k++)a.rig.Contact(aim,"foot",1,false,false,null,none);clock.Stop();double r16=clock.Elapsed.TotalMilliseconds*1000/calls;
        long evaluations=FootballRig.LegEvaluations;long before=GC.GetAllocatedBytesForCurrentThread();clock.Restart();for(int k=0;k<calls;k++)a.rig.Contact(aim,"foot",1,false,false,null,shownLeg);clock.Stop();long bytes=GC.GetAllocatedBytesForCurrentThread()-before;
        double micro=clock.Elapsed.TotalMilliseconds*1000/calls;double per=(FootballRig.LegEvaluations-evaluations)/(double)calls;bool ran=per>=1.5;
        long half=FootballRig.LegEvaluations;before=GC.GetAllocatedBytesForCurrentThread();clock.Restart();for(int k=0;k<calls;k++)a.rig.Contact(aim,"foot",.5f,false,false,null,shownLeg);clock.Stop();bytes+=GC.GetAllocatedBytesForCurrentThread()-before;double release=clock.Elapsed.TotalMilliseconds*1000/calls,perRelease=(FootballRig.LegEvaluations-half)/(double)calls;
        check(bytes==0&&ran,"The least-rotation foot solve allocates nothing ("+bytes+" B over "+calls+" solves; "+micro.ToString("0.00",System.Globalization.CultureInfo.InvariantCulture)+" us per solve against "+r16.ToString("0.00",System.Globalization.CultureInfo.InvariantCulture)+" us for the R16 solve in the editor on this machine, "+per.ToString("0.0",System.Globalization.CultureInfo.InvariantCulture)+" two-bone solves per call (the applied one and the R16 diagnostic); a release at weight 0.5 "+release.ToString("0.00",System.Globalization.CultureInfo.InvariantCulture)+" us, "+perRelease.ToString("0.0",System.Globalization.CultureInfo.InvariantCulture)+" solves; no device figure)",micro);
        // Limb switch within one contact: right boot at the ball, then the left foot takes the contact.
        var ball=actor.position+actor.forward*.45f;ball.y=radius;var tackle=new FootballAnimation.Pose{clip=receive,time=.7,key="r18-tackle",contact=true,kind="foot",target=ball,ballContact=true,lockFeet=true};
        a.Sample(tackle,900,true);a.Sample(tackle,900+1/60.0);var boot=a.rig.Ankle(1).position;
        tackle.kind="left-foot";tackle.time=.7+2/60.0;a.Sample(tackle,900+2/60.0);float drop=Vector3.Distance(boot,a.rig.Ankle(1).position);
        var free=new FootballAnimation.Pose{clip=receive,time=.7+2/60.0,key="r18-free",lockFeet=true};a.Sample(free,950,true);a.Sample(free,950+1/60.0);float clip=Vector3.Distance(boot,a.rig.Ankle(1).position);
        tackle.kind="foot";tackle.time=.7;a.Sample(tackle,1000,true);a.Sample(tackle,1000+1/60.0);tackle.kind="left-foot";var last=a.rig.Ankle(1).position;float largest=0;
        for(int k=2;k<=20;k++){tackle.time=.7+k/60.0;a.Sample(tackle,1000+k/60.0);float step=Vector3.Distance(last,a.rig.Ankle(1).position);largest=Mathf.Max(largest,step);last=a.rig.Ankle(1).position;}
        check(drop<clip*.5f+.01f&&largest<clip*.6f+.01f,"A contact handed to the other foot releases the old boot (moved "+(drop*100).ToString("0.0")+" cm in the switch picture, largest step "+(largest*100).ToString("0.0")+" cm; the clip boot is "+(clip*100).ToString("0.0")+" cm away)",drop);
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
    // r5 natural-motion mechanisms on the actual rig: the measured stride sync
    // marker, a forward-only knee, toe-off instead of sliding, received
    // repositions and snap stops, the top-speed stride band, continuous brake
    // weights and the pose-distance crossfade.
    static void NaturalMotionR5(FootballAnimation a,Transform actor,Func<string,AnimationClip> C,Func<string,Transform> Bone,Action<bool,string,double> check){
        var toes=new[]{Bone("LeftToeBase"),Bone("RightToeBase")};
        // 1. Neighbouring bands at equal cycle values: feet at the sync marker vs at the first-threshold footfall.
        Vector3[] Feet(AnimationClip clip,double time,int key){a.Sample(new FootballAnimation.Pose{clip=clip,time=time,loop=true,key="sync"+key},500+key,true);var unturn=Quaternion.Inverse(actor.rotation);return new[]{unturn*(toes[0].position-actor.position),unturn*(toes[1].position-actor.position)};}
        foreach(var (x,y) in new[]{("run_fast6","run_fast4"),("run_fast4","sprint_forward"),("sprint_forward","running")}){
            AnimationClip p=C(x),q=C(y);double sync=0,fall=0;int key=0;
            for(int k=0;k<40;k++){double c=k/40.0;
                var ps=Feet(p,a.StrideTime(c,p),key++);var qs=Feet(q,a.StrideTime(c,q),key++);var pf=Feet(p,(c+a.Footfall(p))*(p.length-.001),key++);var qf=Feet(q,(c+a.Footfall(q))*(q.length-.001),key++);
                for(int f=0;f<2;f++){sync+=(ps[f]-qs[f]).sqrMagnitude;fall+=(pf[f]-qf[f]).sqrMagnitude;}}
            sync=Math.Sqrt(sync/80);fall=Math.Sqrt(fall/80);
            check(sync<fall,"Stride sync marker keeps "+x+"/"+y+" toes closer together at equal cycle values than the first-threshold footfall: "+sync.ToString("0.00")+" m RMS vs "+fall.ToString("0.00")+" m",sync);
        }
        // 2. A knee never bends backward: a sampled leg slightly past straight is solved with the knee in front.
        {
            a.Sample(new FootballAnimation.Pose{clip=C("idle_stand_meshy"),time=0,loop=true,key="knee"},600,true);
            var hip=Bone("LeftUpLeg");var knee=Bone("LeftLeg");var foot=Bone("LeftFoot");var right=actor.right;
            float Ahead(){var line=foot.position-hip.position;var bend=Vector3.ProjectOnPlane(knee.position-(hip.position+foot.position)*.5f,line.normalized);return Vector3.Dot(bend,actor.forward);}
            knee.rotation=Quaternion.AngleAxis(-30,right)*knee.rotation;float before=Ahead();
            var target=foot.position+actor.forward*.06f+Vector3.up*.08f;a.rig.PlaceFoot(0,target);float ahead=Ahead();
            check(before<0&&ahead>0,"A leg sampled past straight (knee "+(-before*100).ToString("0.0")+" cm behind the hip-ankle line) is solved with its knee in front ("+(ahead*100).ToString("0.0")+" cm ahead)",ahead);
        }
        // 3. Sprinting at 6 m/s with planted feet: a sole within 3 cm of the turf does not slide.
        {
            var m=new FootballLocomotion();var clip=C("sprint_forward");var start=actor.position;var p=Vector3.zero;float stride=a.StrideLength(clip);
            m.Sample(p,Vector3.forward,0,false,false,-1,stride,a.Heading(clip),0,1f/clip.length);float glide=0;int n=0;Vector3[] last=null;float[] lastClear=null;
            for(int frame=1;frame<=150;frame++){
                double clock=frame/60.0;p+=Vector3.forward*6f/60;m.Sample(p,Vector3.forward,clock,false,false,-1,stride,a.Heading(clip),0,1f/clip.length);actor.position=start+p;
                a.Sample(new FootballAnimation.Pose{clip=clip,time=a.StrideTime(m.StridePhase,clip),loop=true,key="toeoff",lockFeet=true,cycleClip=clip,cycles=m.StridePhase,cyclesKnown=true,strideScale=m.StrideScale},clock,frame==1);
                // As the natural-motion gate: a sole (ankle or toe base) within 3 cm in both
                // pictures that is also the lower foot; its slide is the slower of heel and toe.
                var now=new[]{toes[0].position,toes[1].position,a.rig.Ankle(0).position,a.rig.Ankle(1).position};var clear=new[]{Mathf.Min(a.ground.AnkleClearance(0),a.ground.ToeClearance(0)),Mathf.Min(a.ground.AnkleClearance(1),a.ground.ToeClearance(1)),a.ground.SupportClearance(0),a.ground.SupportClearance(1)};
                if(last!=null&&frame>40){int f=clear[2]<=clear[3]?0:1;if(clear[f]<.03f&&lastClear[f]<.03f&&clear[2+f]<=clear[3-f]+.01f){glide+=Mathf.Min(Vector3.ProjectOnPlane(now[f]-last[f],Vector3.up).magnitude,Vector3.ProjectOnPlane(now[2+f]-last[2+f],Vector3.up).magnitude)*60;n++;}}
                last=now;lastClear=clear;
            }
            actor.position=start;float mean=n>0?glide/n:0;
            check(n>0&&mean<.25f,"A 6 m/s sprint with planted feet: the supporting sole stays put or lifts off (mean slide "+mean.ToString("0.00")+" m/s over "+n+" pictures)",mean);
        }
        // 3b. r9: a backward run braking to a stop under the walking support: below
        // 1.9 m/s a moving body always shows a sole within 3 cm (its only planted
        // foot waits for the landing foot and stays on the turf), and that sole
        // does not slide (as the natural-motion support gates, actual rig).
        {
            var m=new FootballLocomotion();var clip=C("back_left");var start=actor.position;var p=Vector3.zero;float stride=a.StrideLength(clip);
            m.Sample(p,Vector3.forward,0,false,false,-1,stride,a.Heading(clip),0,1f/clip.length);int slowFloat=0,slow=0,n=0;float glide=0;Vector3[] last=null;float[] lastClear=null;var at=new System.Text.StringBuilder();
            for(int frame=1;frame<=150;frame++){
                double clock=frame/60.0;float v=frame<=60?4f:Mathf.Max(0,4f-(frame-60)*4f/45);p-=Vector3.forward*v/60;m.Sample(p,Vector3.forward,clock,false,false,-1,stride,a.Heading(clip),0,1f/clip.length);actor.position=start+p;
                a.Sample(new FootballAnimation.Pose{clip=clip,time=a.StrideTime(m.StridePhase,clip),loop=true,key="backstop",lockFeet=true,cycleClip=clip,cycles=m.StridePhase,cyclesKnown=true,strideScale=m.StrideScale,support=m.SupportWeight,braking=frame>60},clock,frame==1);
                var now=new[]{toes[0].position,toes[1].position,a.rig.Ankle(0).position,a.rig.Ankle(1).position};var clear=new[]{Mathf.Min(a.ground.AnkleClearance(0),a.ground.ToeClearance(0)),Mathf.Min(a.ground.AnkleClearance(1),a.ground.ToeClearance(1)),a.ground.SupportClearance(0),a.ground.SupportClearance(1)};
                if(frame>60&&v>.2f&&v<1.9f){slow++;if(clear[2]>.03f&&clear[3]>.03f){slowFloat++;at.Append(" "+frame+":"+a.FootLockState+" L"+clear[2].ToString("0.000")+"/"+clear[0].ToString("0.000")+" R"+clear[3].ToString("0.000")+"/"+clear[1].ToString("0.000")+" drop"+a.SupportDrop.ToString("0.000")+" v"+v.ToString("0.0")+" s"+m.SupportWeight.ToString("0.00")+" "+m.Mode+";");}}
                if(last!=null&&frame>60&&v>.5f){int f=clear[2]<=clear[3]?0:1;if(clear[f]<.03f&&lastClear[f]<.03f&&clear[2+f]<=clear[3-f]+.01f){glide+=Mathf.Min(Vector3.ProjectOnPlane(now[f]-last[f],Vector3.up).magnitude,Vector3.ProjectOnPlane(now[2+f]-last[2+f],Vector3.up).magnitude)*60;n++;}}
                last=now;lastClear=clear;
            }
            actor.position=start;float mean=n>0?glide/n:0;
            check(slow>0&&slowFloat==0&&n>0&&mean<.25f,"A braking backward run keeps a sole down below 1.9 m/s ("+slowFloat+" of "+slow+" slow pictures without one) and its support does not slide (mean "+mean.ToString("0.00")+" m/s over "+n+" pictures)"+at,slowFloat+mean);
        }
        // 4. A received 6.8 m reposition within one picture is no 136 m/s stride: the stride resets, no turn or brake.
        {
            var m=new FootballLocomotion();var p=Vector3.zero;double t=10;m.Sample(p,Vector3.forward,t,false,false);
            for(int i=0;i<30;i++){t+=.05;p+=Vector3.forward*5*.05f;m.Sample(p,Vector3.forward,t,false,false);}
            t+=.05;p+=new Vector3(4.8f,0,-4.8f);m.Sample(p,-Vector3.forward,t,false,false);bool reset=m.Mode=="idle"&&m.Speed==0;
            t+=.05;m.Sample(p,-Vector3.forward,t,false,false);
            check(reset&&m.Mode=="idle","A 6.8 m reposition within one picture resets the stride instead of a sprint, turn and brake (mode "+m.Mode+")",m.Speed);
        }
        // 5. A run that stops within one picture: a brake posture without brake_meshy steps; a decelerating run steps.
        {
            var m=new FootballLocomotion();var p=Vector3.zero;double t=20;m.Sample(p,Vector3.forward,t,false,false);
            for(int i=0;i<30;i++){t+=.05;p+=Vector3.forward*5*.05f;m.Sample(p,Vector3.forward,t,false,false);}
            t+=.05;m.Sample(p,Vector3.forward,t,false,false);bool snap=m.Mode=="brake"&&!m.BrakeMoving;
            var d=new FootballLocomotion();p=Vector3.zero;t=30;d.Sample(p,Vector3.forward,t,false,false);float v=5;
            for(int i=0;i<40;i++){t+=.05;if(i>=30)v=Mathf.Max(0,v-1.2f);p+=Vector3.forward*v*.05f;d.Sample(p,Vector3.forward,t,false,false);if(d.Mode=="brake")break;}
            check(snap&&d.Mode=="brake"&&d.BrakeMoving,"A stop within one picture brakes without stepping; a decelerating run takes braking steps",snap?1:0);
        }
        // 6. Top-speed stride band with hysteresis; 7. brake/turn weight continuity.
        {
            var m=new FootballLocomotion();var p=Vector3.zero;double t=40;m.Sample(p,Vector3.forward,t,false,false);bool top=false,back=true;
            for(int i=0;i<80;i++){t+=.05;float v=i<40?7.4f:6.4f;p+=Vector3.forward*v*.05f;m.Sample(p,Vector3.forward,t,false,false);if(i==39)top=m.StrideMode=="sprint"&&m.FastStride;if(i==79)back=m.FastStride;}
            check(top&&back,"7.4 m/s uses the measured top-speed stride and 6.4 m/s keeps it (hysteresis 6.2/6.6 m/s)",top?1:0);
            var b=new FootballLocomotion();p=Vector3.zero;t=50;b.Sample(p,Vector3.forward,t,false,false);float largest=0,last=-1;int braking=0;
            for(int i=0;i<60;i++){t+=.05;float v=i<30?5:Mathf.Max(.4f,5-(i-29)*.9f+(i%2==0?.6f:-.6f));p+=Vector3.forward*v*.05f;b.Sample(p,Vector3.forward,t,false,false);if(b.Mode=="brake"){braking++;if(last>=0)largest=Mathf.Max(largest,Mathf.Abs(b.MotionWeight-last));}last=b.Mode=="brake"?b.MotionWeight:-1;}
            check(braking>2&&largest<=.05f/(float)FootballLocomotion.BrakePostureTime+1e-4f,"Within a brake the clip share over the stride changes at most 1/0.15 per second (largest step "+largest.ToString("0.000")+")",largest);
        }
        // 8. Pose-distance crossfade: a forward/backward exchange blends longer than a phase-synced band change.
        {
            float Fade(string from,string to,int key){
                AnimationClip p=C(from),q=C(to);var pose=new FootballAnimation.Pose{clip=p,time=a.StrideTime(3,p),loop=true,key="fade",paceFade=true,cycleClip=p,cycles=3,cyclesKnown=true};
                a.Sample(pose,700+key,true);a.Sample(pose,700+key+1/60.0);pose.clip=q;pose.cycleClip=q;pose.time=a.StrideTime(3+1/60.0,q);pose.cycles=3+1/60.0;a.Sample(pose,700+key+2/60.0);return a.ChangeFade;
            }
            float family=Fade("run_fast6","back_left",0),band=Fade("walking","run_fast6",10);
            check(family>band&&family>.12f&&family<=FootballAnimation.MaxChangeFade,"A forward-to-backward stride exchange crossfades over its pose distance ("+family.ToString("0.00")+" s) and longer than a walk-to-jog band change ("+band.ToString("0.00")+" s)",family);
        }
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
    // r11: a native ground-ball contact (received point = ball centre) is met by
    // the boot at the ball's surface: the displayed ball centre lies below this
    // rig's standing ankle, so the ankle solved into it cut the boot and, through
    // the reach drop, the standing sole into the turf (R9 shot -0.148 m, pass
    // -0.155 m, receive -0.065 m). Through the contact and its release both
    // soles stay on or above the turf, the standing foot keeps its point, and
    // the release ends within MaxBallRelease and freezes on a paused clock.
    static void BallContact(FootballAnimation a,Transform actor,Func<string,AnimationClip> C,Func<string,Transform> Bone,Action<bool,string,double> check){
        float stand=actor.position.y+a.ground.ankle*actor.lossyScale.y-FootballGround.PitchSurface,radius=WorldBallMotion.Radius;var tip=Bone("RightToe_End");
        check(stand>radius+.03f,"The displayed ground-ball centre ("+radius.ToString("0.000")+" m) lies "+((stand-radius)*100).ToString("0.0")+" cm below the standing ankle ("+stand.ToString("0.000")+" m): an ankle solved into it cuts the boot into the turf",stand-radius);
        foreach(var (name,time) in new[]{("shot_meshy",.46),("pass_inside_meshy",.8),("receive_ground_meshy",.7)}){
            var centre=actor.position+actor.forward*.45f+actor.right*.1f;centre.y=radius;
            var pose=new FootballAnimation.Pose{clip=C(name),time=time,key="ball-"+name,contact=true,kind="foot",target=centre,ballContact=true,lockFeet=true};
            a.Sample(pose,300,true);a.Sample(pose,300+1/60.0);
            var ankle=a.rig.Ankle(1).position;var toe=a.rig.Toe(1).position;var end=tip!=null?tip.position:toe;var standingPoint=a.rig.Ankle(0).position;
            float surface=Mathf.Min(FootballRig.SegmentDistance(centre,ankle,toe),FootballRig.SegmentDistance(centre,toe,end))-radius,kick=a.ground.SupportClearance(1),standing=a.ground.SupportClearance(0);
            check(a.rig.reachable&&a.rig.contactError<.03f&&Mathf.Abs(surface-FootballAnimation.BootHalf)<.03f&&kick>-.005f&&standing>-.01f,name+" ground-ball contact: boot bones "+(surface*100).ToString("0.0")+" cm from the ball surface (boot "+(FootballAnimation.BootHalf*100).ToString("0")+" cm), kicking sole "+(kick*100).ToString("0.0")+" cm, standing sole "+(standing*100).ToString("0.0")+" cm above the turf",surface);
            pose.contact=false;float lowest=float.MaxValue,standingMoved=0;int release=0;
            for(int f=2;f<=24;f++){pose.time=time+f/60.0;a.Sample(pose,300+f/60.0);lowest=Mathf.Min(lowest,Mathf.Min(a.ground.SupportClearance(0),a.ground.SupportClearance(1)));if(a.ReleaseWeight>0){release++;standingMoved=Mathf.Max(standingMoved,Vector3.ProjectOnPlane(a.rig.Ankle(0).position-standingPoint,Vector3.up).magnitude);}}
            check(lowest>-.01f&&release>0&&release<=Mathf.CeilToInt((float)FootballAnimation.MaxBallRelease*60),name+" release keeps both soles on or above the turf (lowest "+(lowest*100).ToString("0.0")+" cm) and ends within "+FootballAnimation.MaxBallRelease+" s ("+release+" pictures; standing ankle moved "+(standingMoved*100).ToString("0.0")+" cm)",lowest);
            pose.contact=true;pose.time=time;a.Sample(pose,400,true);a.Sample(pose,400.01);pose.contact=false;a.Sample(pose,400.04);var held=a.rig.Ankle(1).position;a.Sample(pose,400.04);
            check(held==a.rig.Ankle(1).position&&a.ReleaseWeight>0,name+" paused native clock freezes the releasing boot",a.ReleaseWeight);
        }
    }
    // r13: the visible part of a native ready countdown closes at its last picture
    // (FootballActionTiming.ReadyPhase: a 0.35 s countdown is last shown at
    // progress 0.857-0.923) and its reach brings the boot to the ball surface
    // during the swing, so the native contact picture continues the motion
    // (R11 shot: the boot moved 0.72 m and the shin 84 degrees into the contact
    // picture). A countdown first shown late eases its reach in; a paused clock
    // freezes the reaching boot.
    static void ReadyEntry(FootballAnimation a,Transform actor,Func<string,AnimationClip> C,Func<string,Transform> Bone,Action<bool,string,double> check){
        double last=FootballActionTiming.ReadyPhase(.857,.35),late=FootballActionTiming.ReadyPhase(.923,.35),mid=FootballActionTiming.ReadyPhase(.5,.35),missing=FootballActionTiming.ReadyPhaseAtRate(.857,1/.35);
        check(Math.Abs(last-1)<1e-3&&late==1&&Math.Abs(mid-.5/.857)<1e-3&&Math.Abs(missing-1)<1e-3,"A 0.35 s ready countdown reaches its contact phase at its last visible picture (progress 0.857 -> "+last.ToString("0.000")+", 0.5 -> "+mid.ToString("0.000")+")",last);
        float radius=WorldBallMotion.Radius;var shin=Bone("RightLeg");
        var centre=actor.position+actor.forward*.55f+actor.right*.1f;centre.y=radius;
        Vector3 boot=Vector3.zero;Quaternion turn=Quaternion.identity;float step=0,turnStep=0,lowest=float.MaxValue;int n=0;
        for(double u=.6;u<=1+1e-9;u+=1/18.0){
            float x=Mathf.Clamp01((float)((u-FootballPresentationReadyFrom)/(1-FootballPresentationReadyFrom))),w=x*x*(3-2*x);
            var pose=new FootballAnimation.Pose{clip=C("shot_meshy"),time=Math.Min(1,u)*.46,key="ready-entry",lockFeet=true,target=centre,kind="foot"};
            if(w>0){pose.contact=true;pose.contactWeight=Mathf.Clamp(w,.001f,.999f);pose.ballContact=true;}
            a.Sample(pose,500+n/60.0,n==0);
            if(n>0){step=Mathf.Max(step,Vector3.Distance(boot,a.rig.Ankle(1).position));turnStep=Mathf.Max(turnStep,Quaternion.Angle(turn,Quaternion.Inverse(actor.rotation)*shin.rotation));}
            if(w>0)lowest=Mathf.Min(lowest,a.ground.SupportClearance(1));boot=a.rig.Ankle(1).position;turn=Quaternion.Inverse(actor.rotation)*shin.rotation;n++;
        }
        var contact=new FootballAnimation.Pose{clip=C("shot_meshy"),time=.46,key="ready-contact",lockFeet=true,target=centre,kind="foot",contact=true,ballContact=true};
        a.Sample(contact,500+n/60.0);float entry=Vector3.Distance(boot,a.rig.Ankle(1).position),entryTurn=Quaternion.Angle(turn,Quaternion.Inverse(actor.rotation)*shin.rotation);
        check(a.rig.reachable&&a.rig.contactError<.03f&&entry<.12f&&entryTurn<FootballAnimationJointStep,"Shot ready reach meets the contact picture: boot "+(entry*100).ToString("0.0")+" cm and shin "+entryTurn.ToString("0.0")+" deg into the contact (largest ready step "+(step*100).ToString("0.0")+" cm, "+turnStep.ToString("0.0")+" deg)",entry);
        check(lowest>FootballAnimation.SwingClear*.5f-.005f,"The reaching boot stays above the contact band until the contact picture (lowest sole "+(lowest*100).ToString("0.0")+" cm)",lowest);
        // A countdown first shown at its end: the reach eases in instead of popping to the ball.
        var late0=new FootballAnimation.Pose{clip=C("shot_meshy"),time=.46,key="late-ready",lockFeet=true,target=centre,kind="foot"};a.Sample(late0,600,true);a.Sample(late0,600+1/60.0);var before=a.rig.Ankle(1).position;
        late0.contact=true;late0.contactWeight=.999f;late0.ballContact=true;a.Sample(late0,600+2/60.0);float pop=Vector3.Distance(before,a.rig.Ankle(1).position);
        float full=0;for(int k=3;k<=9;k++){a.Sample(late0,600+k/60.0);}full=a.rig.contactError;
        check(pop<.12f&&full<.03f,"A ready reach first shown at its end eases in ("+(pop*100).ToString("0.0")+" cm in its first picture) and meets the ball within "+FootballAnimation.ReadyReachEase+" s",pop);
        var held=a.rig.Ankle(1).position;a.Sample(late0,600+9/60.0);check(held==a.rig.Ankle(1).position,"A paused native clock freezes the reaching boot",0);
    }
    // ReadyReachFrom of FootballPresentation and one 1/60 s step at the 1600 deg/s joint limit.
    const double FootballPresentationReadyFrom=ProbeBridge.ReadyReachFrom;const float FootballAnimationJointStep=1600f/60;
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
        var fronts=(float[])typeof(ProbeBridge).GetField("standFronts",flags).GetValue(bridge);fronts[0]=fronts[1]=27.5f;fronts[2]=fronts[3]=40.5f;
        int toggles=0;bool last=true;for(int k=0;k<=200;k++){float z=27.5f+Mathf.Sin(k*.7f)*.3f+(k>150?2:0);update.Invoke(bridge,new object[]{new Vector3(0,13,z)});if(bridge.StandShown(1)!=last){toggles++;last=bridge.StandShown(1);}}
        check(toggles==1&&!bridge.StandShown(1)&&bridge.StandShown(0),"A camera wobbling at a stand front hides that stand once, without flicker",toggles);
        update.Invoke(bridge,new object[]{new Vector3(-49,19,9)});check(!bridge.StandShown(2)&&bridge.StandShown(3)&&bridge.StandShown(0),"Behind-goal camera hides only its own end stand",0);
        var config=JsonUtility.FromJson<WorldConfig>(File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json")));
        check(string.IsNullOrEmpty(config.quality),"Pages without a quality field remain valid (platform decides)",0);
        config.quality="reduced";check(new WorldViewState(config).Config.quality=="reduced","A reduced quality request is carried by the match view configuration",0);
        var env=File.ReadAllText("Assets/Doppel6EngineProbe/Runtime/WorldViewLighting.cs");
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

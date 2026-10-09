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
// Slide, slide recovery, standing tackle, foul offender and keeper side steps
// on the actual 28-joint rig and through the actual WorldFootballPose selector.
public static class FootballDuelTests {
    [Serializable] class Measurement {public string stage;public float hips,leadFoot,leadForward,trailFoot,contactError,value;public bool reachable;}
    [Serializable] class Report {public int passed;public string[] checks;public Measurement[] measurements;}
    const string Asset="Assets/Doppel6EngineProbe/Art/football-v130.fbx";
    static AnimationClip Clip(string name){return Array.Find(AssetDatabase.LoadAllAssetsAtPath(Asset),a=>a is AnimationClip&&a.name==name) as AnimationClip??AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Doppel6EngineProbe/Art/"+name+".anim")??throw new Exception("Missing clip "+name);}
    static float LowestBoot(Transform actor){
        float lowest=float.MaxValue;foreach(var skin in actor.GetComponentsInChildren<SkinnedMeshRenderer>()){
            var mesh=new Mesh();skin.BakeMesh(mesh);var vertices=mesh.vertices;var weights=skin.sharedMesh.boneWeights;
            for(int i=0;i<vertices.Length;i++){var weight=weights[i];var name=skin.bones[weight.boneIndex0].name;
                if(name.EndsWith("Foot")||name.EndsWith("ToeBase"))lowest=Mathf.Min(lowest,skin.transform.TransformPoint(vertices[i]).y);
            }UnityEngine.Object.DestroyImmediate(mesh);
        }return lowest;
    }
    public static string Run(string repository,string outputFolder=null){
        var checks=new List<string>();var measurements=new List<Measurement>();void Require(bool ok,string name){if(!ok)throw new Exception("Football duel: "+name);checks.Add(name);}
        // Pure envelopes: phase boundaries and the deterministic lead leg.
        Require(FootballDuelTiming.Slide(0)==0&&FootballDuelTiming.Slide(.2)==1&&FootballDuelTiming.Slide(1)==1,"slide drops within its first fifth and stays down");
        Require(FootballDuelTiming.Recovery(0)==1&&FootballDuelTiming.Recovery(.45)==0&&FootballDuelTiming.RiseTime(1)==FootballDuelTiming.RiseFrom+FootballDuelTiming.RiseLength,"recovery hands the low pose to the measured rise window");
        Require(FootballDuelTiming.Lunge(0)==1&&FootballDuelTiming.Lunge(1)==0&&FootballDuelTiming.OffenderStumble(0)==1&&FootballDuelTiming.OffenderStumble(FootballDuelTiming.StumbleLength)==0,"tackle and offender envelopes end at their native windows");
        bool monotonic=true;for(int k=1;k<=100;k++){monotonic&=FootballDuelTiming.Slide(k/100.0)>=FootballDuelTiming.Slide((k-1)/100.0)&&FootballDuelTiming.Recovery(k/100.0)<=FootballDuelTiming.Recovery((k-1)/100.0)&&FootballDuelTiming.Lunge(k/100.0)<=FootballDuelTiming.Lunge((k-1)/100.0);}
        Require(monotonic,"duel envelopes are monotonic in native progress");
        Require(FootballDuelTiming.LeftLead(new Vector3(-.3f,0,1),7)&&!FootballDuelTiming.LeftLead(new Vector3(.3f,0,1),8)&&FootballDuelTiming.LeftLead(Vector3.forward,8)&&!FootballDuelTiming.LeftLead(Vector3.forward,7),"lead leg follows the contact side, else the squad number");

        var scene=EditorSceneManager.NewPreviewScene();var actor=UnityEngine.Object.Instantiate(AssetDatabase.LoadAssetAtPath<GameObject>(Asset));UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(actor,scene);actor.transform.localScale=Vector3.one*1.45f;
        foreach(var skin in actor.GetComponentsInChildren<SkinnedMeshRenderer>())skin.sharedMesh=AssetDatabase.LoadAssetAtPath<Mesh>("Assets/Doppel6EngineProbe/Art/WorldPlayer.asset");
        var animator=actor.GetComponent<Animator>();if(animator==null)animator=actor.AddComponent<Animator>();animator.applyRootMotion=false;
        var run=Clip("running");var sprint=Clip("sprint_forward");var idle=Clip("idle_stand_meshy");var rise=Clip("keeper_rise_meshy");var stumble=Clip("foul_stumble_meshy");var shuffle=Clip("keeper_shuffle_meshy");var receive=Clip("receive_ground_meshy");var keeper=Clip("keeper_ready_meshy");
        var graph=PlayableGraph.Create("D6 duel validation");graph.SetTimeUpdateMode(DirectorUpdateMode.Manual);var initial=AnimationClipPlayable.Create(graph,idle);AnimationPlayableOutput.Create(graph,"Character",animator).SetSourcePlayable(initial);graph.Play();graph.Evaluate(0);
        try{
            var animation=new FootballAnimation(graph,actor.transform,new[]{idle,run,sprint,rise,stumble,shuffle,receive,keeper});
            actor.transform.position=new Vector3(0,animation.RootHeight,0);actor.transform.rotation=Quaternion.identity;
            Transform Bone(string n)=>Array.Find(actor.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:"+n);
            var hips=Bone("Hips");var leftFoot=Bone("LeftFoot");var rightFoot=Bone("RightFoot");var root=actor.transform.position;var heading=actor.transform.rotation;
            animation.Sample(new FootballAnimation.Pose{clip=sprint,time=animation.StrideTime(0,sprint),loop=true,key="run"},1,true);float standingHips=hips.position.y;
            var ahead=new Vector3(.25f,.18f,.85f);
            FootballAnimation.Pose Slide(float w,Vector3 target,bool left)=>new FootballAnimation.Pose{clip=sprint,time=animation.StrideTime(left?.5:0,sprint),loop=true,key="slide:1",kind="slide",urgent=true,slide=w,leftLead=left,target=target};
            animation.Sample(Slide(1,ahead,false),2,true);
            var m=new Measurement{stage="slide-right",hips=hips.position.y,leadFoot=rightFoot.position.y,leadForward=rightFoot.position.z,trailFoot=leftFoot.position.y,contactError=animation.rig.contactError,reachable=animation.rig.reachable};measurements.Add(m);
            Require(m.hips<.6f&&m.hips<standingHips-.4f,"full slide lowers the pelvis toward the turf ("+m.hips.ToString("0.00")+" m)");
            Require(m.leadFoot<.3f&&m.leadForward>.6f,"right lead foot slides low and ahead of the body");
            Require(m.reachable&&m.contactError<.12f,"a reachable native contact is met by the lead foot ("+m.contactError.ToString("0.000")+" m; foot="+rightFoot.position+" hips="+hips.position+" reachable="+m.reachable+")");
            Require(m.trailFoot<.45f,"trailing leg folds under the body");
            Require(Bone("RightLeg").position.y>.05f&&Bone("LeftLeg").position.y>.05f,"both slide knees bend above the turf rather than through it");
            Require(actor.transform.position==root&&actor.transform.rotation==heading,"slide never moves the received root or heading");
            animation.Sample(Slide(1,new Vector3(-.25f,.18f,.85f),true),2.05);
            measurements.Add(new Measurement{stage="slide-left",hips=hips.position.y,leadFoot=leftFoot.position.y,leadForward=leftFoot.position.z,trailFoot=rightFoot.position.y,contactError=animation.rig.contactError,reachable=animation.rig.reachable});
            Require(leftFoot.position.z>.6f&&leftFoot.position.y<.3f&&animation.rig.reachable,"left-lead slide mirrors onto the left leg");
            animation.Sample(Slide(1,new Vector3(0,.18f,-2),false),2.1);
            Require(!animation.rig.reachable&&rightFoot.position.z>.5f&&animation.rig.contactError>1.5f,"a contact behind the slider stays unreached; the foot keeps the slide line");
            animation.Sample(Slide(1,new Vector3(0,.18f,9),false),2.15);
            Require(!animation.rig.reachable&&animation.rig.contactError>6,"an out-of-reach contact is not stretched toward");
            animation.Sample(Slide(.5f,ahead,false),2.2);float half=hips.position.y;Require(half>m.hips+.1f&&half<standingHips-.1f,"a half-weighted slide lies between run and full slide");
            // Pause and replay: the same picture gives the same bones, whatever came before.
            var bones=actor.GetComponentsInChildren<Transform>();
            animation.Sample(Slide(1,ahead,false),3,true);var a=Array.ConvertAll(bones,t=>t.position);animation.Sample(Slide(1,ahead,false),3);var paused=Array.ConvertAll(bones,t=>t.position);
            animation.Sample(new FootballAnimation.Pose{clip=idle,time=.3,loop=true,key="other"},4,true);animation.Sample(Slide(1,ahead,false),3,true);var replayed=Array.ConvertAll(bones,t=>t.position);
            bool Same(Vector3[] x,Vector3[] y){for(int i=0;i<x.Length;i++)if(Vector3.Distance(x[i],y[i])>.0001f)return false;return true;}
            Require(Same(a,paused),"paused slide picture freezes every bone");Require(Same(a,replayed),"a replayed slide picture shows the identical pose");
            float lowestEntry=float.MaxValue;for(int k=1;k<=20;k++){animation.Sample(Slide(FootballDuelTiming.Slide(k/100.0),ahead,false),4+k*.01,true);lowestEntry=Mathf.Min(lowestEntry,LowestBoot(actor.transform));}
            Require(lowestEntry>-.035f,"actual world-player mesh keeps both boots above turf through slide entry ("+lowestEntry.ToString("0.000")+" m)");
            // Recovery: low at the start, standing at the end.
            animation.Sample(new FootballAnimation.Pose{clip=rise,time=FootballDuelTiming.RiseTime(0),key="slide:1",kind="slide",urgent=true,slide=FootballDuelTiming.Recovery(0),target=ahead},5,true);float riseLow=hips.position.y;
            animation.Sample(new FootballAnimation.Pose{clip=rise,time=FootballDuelTiming.RiseTime(1),key="slide:1",kind="slide",urgent=true,slide=FootballDuelTiming.Recovery(1),target=ahead},6,true);float riseHigh=hips.position.y;
            measurements.Add(new Measurement{stage="recovery",hips=riseLow,value=riseHigh});
            Require(riseLow<.7f&&riseHigh>standingHips-.25f,"slide recovery rises from the turf to standing ("+riseLow.ToString("0.00")+" -> "+riseHigh.ToString("0.00")+" m)");
            // Standing tackle lunge lowers and tips the body; it never moves the root.
            animation.Sample(new FootballAnimation.Pose{clip=receive,time=.7,key="tackle-0",kind="foot"},7,true);float upright=hips.position.y;
            animation.Sample(new FootballAnimation.Pose{clip=receive,time=.7,key="tackle-1",kind="foot",lunge=1},8,true);
            Require(upright-hips.position.y>.1f&&actor.transform.position==root,"standing tackle lunges lower at the native contact");
            // Offender stumble window stays upright on this rig.
            float lowest=float.MaxValue;for(int k=0;k<=27;k++){animation.Sample(new FootballAnimation.Pose{clip=stumble,time=k*.1,key="foul:offender"},10+k*.1,k==0);lowest=Mathf.Min(lowest,hips.position.y);}
            measurements.Add(new Measurement{stage="offender-stumble",hips=lowest});Require(lowest>standingHips*.6f,"offender stumble window stays upright ("+lowest.ToString("0.00")+" m)");
            Bridge(repository,actor,animation,new Dictionary<string,AnimationClip>{{"run",run},{"sprint",sprint},{"idle",idle},{"rise",rise},{"stumble",stumble},{"shuffle",shuffle},{"receive",receive},{"keeper",keeper}},Require);
            Require(graph.GetPlayableCount()<=12,"duel poses reuse cached graph nodes");
            var json=JsonUtility.ToJson(new Report{passed=checks.Count,checks=checks.ToArray(),measurements=measurements.ToArray()},true);
            var folder=Path.Combine(repository,outputFolder??"outputs/3d-quality/unity");Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,"duel-tests.json"),json);return "passed="+checks.Count;
        }finally{if(graph.IsValid())graph.Destroy();EditorSceneManager.ClosePreviewScene(scene);}
    }

    // The actual selector: received pictures choose the documented duel poses.
    static void Bridge(string repository,GameObject actor,FootballAnimation animation,Dictionary<string,AnimationClip> c,Action<bool,string> Require){
        var flags=BindingFlags.NonPublic|BindingFlags.Instance;
        var config=JsonUtility.FromJson<WorldConfig>(File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json")));
        var field=Array.Find(config.players,p=>!p.keeper);var goalie=Array.Find(config.players,p=>p.keeper);
        var host=new GameObject("D6 duel selector test");var ballView=new GameObject("D6 duel ball").transform;
        try{
            var bridge=host.AddComponent<ProbeBridge>();void Field(string name,object value)=>typeof(ProbeBridge).GetField(name,flags).SetValue(bridge,value);
            Field("worldView",new WorldViewState(config));Field("ballView",ballView);
            ((List<Transform>)typeof(ProbeBridge).GetField("actors",flags).GetValue(bridge)).Add(actor.transform);
            ((List<FootballAnimation>)typeof(ProbeBridge).GetField("football",flags).GetValue(bridge)).Add(animation);
            Field("runSpeeds",new float[1]);Field("animationTimes",new double[1]);Field("worldLocomotion",new[]{new FootballLocomotion()});
            bridge.runClip=c["run"];bridge.fastRunClip=bridge.walkClip=bridge.backClip=bridge.brakeClip=bridge.turnLeftClip=bridge.turnRightClip=c["run"];bridge.sprintClip=c["sprint"];
            bridge.idleClip=c["idle"];bridge.keeperClip=c["keeper"];bridge.keeperRiseClip=c["rise"];bridge.foulStumbleClip=c["stumble"];bridge.keeperShuffleClip=c["shuffle"];bridge.receiveClip=c["receive"];
            var select=typeof(ProbeBridge).GetMethod("WorldFootballPose",flags);
            WorldFrame Frame(double clock){var f=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(config.initial));f.clock=clock;f.owner="";f.celebrating=false;return f;}
            FootballAnimation.Pose Select(WorldPose p,WorldFrame f){((FootballLocomotion[])typeof(ProbeBridge).GetField("worldLocomotion",flags).GetValue(bridge))[0]=new FootballLocomotion();return (FootballAnimation.Pose)select.Invoke(bridge,new object[]{p,f,0});}
            WorldPose Pose(WorldPlayer who,string action,double progress,double duration,double[] contact){return new WorldPose{id=who.id,number=who.number,position=new double[]{0,0,0},facing=new double[]{0,0,1},action=action,actionId=action.StartsWith("slide")?"slide:"+who.id:action+"-1",progress=progress,duration=duration,contactPoint=contact};}
            actor.transform.SetPositionAndRotation(new Vector3(0,animation.RootHeight,0),Quaternion.identity);
            var slide=Select(Pose(field,"slide",.5,.65,new[]{.4,.29,1.1}),Frame(20));
            Require(slide.clip==c["sprint"]&&slide.slide==FootballDuelTiming.Slide(.5)&&!slide.leftLead&&slide.kind=="slide"&&!slide.contact,"slide picture selects the procedural slide on the contact side");
            var again=Select(Pose(field,"slide",.5,.65,new[]{.4,.29,1.1}),Frame(20));Require(again.time==slide.time&&again.slide==slide.slide,"the same slide picture selects the same pose");
            var recovery=Select(Pose(field,"slideRecovery",.3,.6,new[]{.4,.29,1.1}),Frame(21));
            Require(recovery.clip==c["rise"]&&Math.Abs(recovery.time-FootballDuelTiming.RiseTime(.3))<1e-9&&recovery.slide==FootballDuelTiming.Recovery(.3),"recovery picture rises with keeper_rise_meshy from the slide pose");
            // A successful slide makes the defender the carrier immediately;
            // observed movement must not replace its recovery with stride IK.
            var successful=new FootballLocomotion();((FootballLocomotion[])typeof(ProbeBridge).GetField("worldLocomotion",flags).GetValue(bridge))[0]=successful;
            var slideFrame=Frame(21.1);slideFrame.owner=field.id;var slidePose=Pose(field,"slide",1,.65,new[]{.4,.29,1.1});
            select.Invoke(bridge,new object[]{slidePose,slideFrame,0});
            var recoveredPose=Pose(field,"slideRecovery",.1,.6,new[]{.4,.29,1.1});recoveredPose.position=new double[]{0,0,.08};var recoveryFrame=Frame(21.15);recoveryFrame.owner=field.id;
            var successfulRecovery=(FootballAnimation.Pose)select.Invoke(bridge,new object[]{recoveredPose,recoveryFrame,0});
            Require(successful.Speed>.2f&&successfulRecovery.kind=="slide"&&!successfulRecovery.contact&&successfulRecovery.clip==c["rise"],"winning slide preserves recovery while its new carrier is still moving");
            var tackle=Select(Pose(field,"tackle",0,.48,new[]{-.3,.29,.8}),Frame(22));
            Require(tackle.clip==c["receive"]&&tackle.kind=="left-foot"&&tackle.lunge==1&&tackle.baseClip!=null,"standing tackle reaches with the contact-side foot and lunges");
            var follow=Select(Pose(field,"tackle",1,.48,new[]{-.3,.29,.8}),Frame(23));Require(follow.lunge==0&&!follow.contact,"standing tackle follow-through releases the lunge");
            var offender=Select(Pose(field,"foulOffender",.2,1,null),Frame(24));
            Require(offender.clip==c["stumble"]&&Math.Abs(offender.time-.2*2.7)<1e-9&&offender.lunge==FootballDuelTiming.OffenderLunge(.54)&&offender.baseClip==c["idle"],"foul offender stumbles in the upright window and settles to standing");
            var settled=Select(Pose(field,"foulOffender",1,1,null),Frame(25));Require(settled.actionWeight==0&&settled.lunge==0,"foul offender is standing at the end of the 2.7 s window");
            bridge.foulStumbleClip=null;var fallback=Select(Pose(field,"foulOffender",0,1,null),Frame(26));Require(fallback.clip==c["idle"]&&fallback.lunge==1,"without the stumble clip the offender keeps a procedural lunge");bridge.foulStumbleClip=c["stumble"];
            // Keeper side steps: two received pictures with lateral travel.
            var locomotion=new FootballLocomotion();((FootballLocomotion[])typeof(ProbeBridge).GetField("worldLocomotion",flags).GetValue(bridge))[0]=locomotion;
            WorldPose Keeper(double x){return new WorldPose{id=goalie.id,number=goalie.number,position=new[]{x,0,0},facing=new double[]{0,0,1},action="idle",actionId="idle",duration=1};}
            select.Invoke(bridge,new object[]{Keeper(0),Frame(30),0});var left=(FootballAnimation.Pose)select.Invoke(bridge,new object[]{Keeper(-.08),Frame(30.05),0});
            Require(left.clip==c["shuffle"]&&locomotion.Lateral<-.9f,"keeper moving to its left side-steps with keeper_shuffle_meshy");
            var right=(FootballAnimation.Pose)select.Invoke(bridge,new object[]{Keeper(0),Frame(30.1),0});Require(right.clip==c["shuffle"]&&right.time<=0,"keeper moving right plays the side step reversed");
            var forward=new WorldPose{id=goalie.id,number=goalie.number,position=new[]{0,0,.1},facing=new double[]{0,0,1},action="idle",actionId="idle",duration=1};
            var straight=(FootballAnimation.Pose)select.Invoke(bridge,new object[]{forward,Frame(30.15),0});Require(straight.clip!=c["shuffle"],"forward keeper movement keeps the ordinary stride");
        }finally{UnityEngine.Object.DestroyImmediate(host);UnityEngine.Object.DestroyImmediate(ballView.gameObject);}
    }
}
#endif

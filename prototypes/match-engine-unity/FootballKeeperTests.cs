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
// Keeper iteration: actual native picture JSON (outputs/3d-quality/keeper-next/
// keeper-fixtures.json, captured per native step from the current bridge)
// through the actual WorldFootballPose selector on the actual WorldPlayer rig.
// Goal-kick wait/follow, save recovery (landing, rising), conceded goals, the
// known-fact catch rule, both directions and a diagonal orientation.
public static class FootballKeeperTests {
    [Serializable] class Fixture {public Sequence[] sequences;}
    [Serializable] class Sequence {public string name,source,keeper;public bool turned;public string[] steps;}
    [Serializable] class Measurement {public string stage;public float value,before;public string detail;}
    [Serializable] class Report {public int passed;public string[] checks;public Measurement[] measurements;}
    const string Asset="Assets/Doppel6EngineProbe/Art/football-v130.fbx";
    static AnimationClip Clip(string name){return Array.Find(AssetDatabase.LoadAllAssetsAtPath(Asset),a=>a is AnimationClip&&a.name==name) as AnimationClip??AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Doppel6EngineProbe/Art/"+name+".anim")??throw new Exception("Missing clip "+name);}
    public static string Run(string repository,string outputFolder=null){
        var checks=new List<string>();var m=new List<Measurement>();void Require(bool ok,string name){if(!ok)throw new Exception("Keeper: "+name);checks.Add(name);}
        var raw=File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json"));
        var fixture=JsonUtility.FromJson<Fixture>(File.ReadAllText(Path.Combine(repository,"outputs/3d-quality/keeper-next/keeper-fixtures.json")));
        Require(fixture.sequences.Length==9,"nine actual captured keeper sequences are present");
        Contract(raw,fixture,Require);
        Timing(Require);
        Projection(Require);

        var scene=EditorSceneManager.NewPreviewScene();var actor=UnityEngine.Object.Instantiate(AssetDatabase.LoadAssetAtPath<GameObject>(Asset));UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(actor,scene);actor.transform.localScale=Vector3.one*1.45f;
        foreach(var skin in actor.GetComponentsInChildren<SkinnedMeshRenderer>())skin.sharedMesh=AssetDatabase.LoadAssetAtPath<Mesh>("Assets/Doppel6EngineProbe/Art/WorldPlayer.asset");
        var animator=actor.GetComponent<Animator>();if(animator==null)animator=actor.AddComponent<Animator>();animator.applyRootMotion=false;
        var c=new Dictionary<string,AnimationClip>();foreach(var n in new[]{"idle_stand_meshy","running","sprint_forward","keeper_ready_meshy","keeper_low_meshy","keeper_high_meshy","keeper_dive_meshy","keeper_rise_meshy","pass_inside_meshy","shot_meshy","receive_ground_meshy"})c[n]=Clip(n);
        var graph=PlayableGraph.Create("D6 keeper validation");graph.SetTimeUpdateMode(DirectorUpdateMode.Manual);var initial=AnimationClipPlayable.Create(graph,c["idle_stand_meshy"]);AnimationPlayableOutput.Create(graph,"Character",animator).SetSourcePlayable(initial);graph.Play();graph.Evaluate(0);
        try{
            var animation=new FootballAnimation(graph,actor.transform,c.Values);
            Selector(raw,fixture,actor,animation,c,Require,m);
            Require(graph.GetPlayableCount()<=16,"keeper poses reuse cached graph nodes");
        }finally{if(graph.IsValid())graph.Destroy();EditorSceneManager.ClosePreviewScene(scene);}
        var json=JsonUtility.ToJson(new Report{passed=checks.Count,checks=checks.ToArray(),measurements=m.ToArray()},true);
        var folder=Path.Combine(repository,outputFolder??"outputs/3d-quality/keeper-next");Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,"keeper-tests.json"),json);return "passed="+checks.Count;
    }

    // Presence of the optional keeper facts in actual JSON, phase whitelist and playback copy.
    static void Contract(string raw,Fixture fixture,Action<bool,string> Require){
        var parry=WorldPhasePresence.ParseFrame(Find(fixture,"parry-mid").steps[0]);var p=parry.players[0];
        Require(p.savedKnown&&!p.saved&&p.parryKnown&&p.parry&&p.goalKnown&&!p.goal&&parry.ballInFlightKnown&&parry.ballInFlight,"actual parry JSON marks saved/parry/goal and ballInFlight as known");
        var kick=WorldPhasePresence.ParseFrame(Find(fixture,"goalkick-out").steps[0]).players[0];
        Require(kick.phase=="waiting"&&!kick.savedKnown&&!kick.parryKnown&&!kick.goalKnown,"actual goal-kick JSON carries its phase; absent save facts stay unknown");
        var legacy=WorldPhasePresence.ParseFrame("{\"owner\":\"x\",\"players\":[{\"id\":\"x\",\"action\":\"save\",\"recovery\":0.5}]}");
        Require(!legacy.ballInFlightKnown&&!legacy.players[0].savedKnown&&!legacy.players[0].parryKnown&&!legacy.players[0].goalKnown,"an older picture without the facts keeps every fact unknown");
        var explicitFalse=WorldPhasePresence.ParseFrame("{\"ballInFlight\":false,\"players\":[{\"id\":\"x\",\"action\":\"save\",\"saved\":false,\"parry\":false,\"goal\":false}]}");
        Require(explicitFalse.ballInFlightKnown&&explicitFalse.players[0].savedKnown&&explicitFalse.players[0].parryKnown&&explicitFalse.players[0].goalKnown,"explicit false facts are known");
        // Command path (bridge): frame and config.initial.
        // Command path (bridge shape, keys only where the bridge sends them).
        var config=JsonUtility.FromJson<WorldConfig>(raw);
        var json="{\"kind\":\"frame\",\"frame\":{\"owner\":\"a\",\"ballInFlight\":false,\"players\":[{\"id\":\"a\",\"action\":\"save\",\"saved\":true,\"parry\":false},{\"id\":\"b\",\"action\":\"idle\"}]}}";
        var command=JsonUtility.FromJson<WorldCommand>(json);WorldPhasePresence.MarkCommand(command,json);
        Require(command.frame.ballInFlightKnown&&command.frame.players[0].savedKnown&&command.frame.players[0].parryKnown&&!command.frame.players[0].goalKnown&&!command.frame.players[1].savedKnown,"bridge command JSON marks only the keys it actually contains");
        var load="{\"kind\":\"load\",\"config\":{\"initial\":{\"players\":[{\"id\":\"a\",\"goal\":true}]}}}";var loaded=JsonUtility.FromJson<WorldCommand>(load);WorldPhasePresence.MarkCommand(loaded,load);
        Require(loaded.config.initial.players[0].goalKnown&&!loaded.config.initial.players[0].savedKnown&&!loaded.config.initial.ballInFlightKnown,"load command marks the facts of its initial picture");
        // Phase whitelist (validation of the received picture).
        var inbox=new WorldViewState(config);var goalie=Array.Find(config.players,q=>q.keeper);
        WorldFrame With(string action,string phase){var g=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(config.initial));g.sequence=5;var pose=Array.Find(g.players,q=>q.id==goalie.id);pose.action=action;pose.phase=phase;return g;}
        WorldFrame Bump(WorldFrame g){g.sequence=6;return g;}
        bool Valid(WorldFrame g){try{inbox.Validate(g);return true;}catch(ArgumentException){return false;}}
        Require(Valid(With("goalKick","waiting"))&&Valid(With("goalKick","follow"))&&Valid(With("goalKick",null))&&Valid(With("save",null)),"goal-kick waiting/follow and an omitted phase are valid pictures");
        Require(!Valid(With("goalKick","run"))&&!Valid(With("save","waiting")),"an unknown phase or a phase outside the goal kick is rejected");
        var absent=WorldPhasePresence.ParseFrame(Find(fixture,"parry-mid").steps[0]).players[0];var roundTrip=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(config.initial));
        Require(string.IsNullOrEmpty(absent.phase)&&Valid(With("save",""))&&Valid(roundTrip.sequence>0?Bump(roundTrip):roundTrip),"an absent or empty phase (JsonUtility default) stays a valid picture");
        // Playback keeps the facts of the newer picture.
        var a=WorldPhasePresence.ParseFrame(Find(fixture,"parry-mid").steps[5]);var b=WorldPhasePresence.ParseFrame(Find(fixture,"parry-mid").steps[6]);a.session=b.session="s";a.camera=b.camera=Camera();
        var mid=WorldViewPlayback.Blend(a,b,.5);var mp=mid.players[0];
        Require(mp.parryKnown&&mp.parry&&mp.savedKnown==b.players[0].savedKnown&&mp.saved==b.players[0].saved&&mid.ballInFlightKnown==b.ballInFlightKnown&&mid.ballInFlight==b.ballInFlight,"playback blend copies the keeper facts and ballInFlight");
        var k0=WorldPhasePresence.ParseFrame(Find(fixture,"goalkick-out").steps[20]);var k1=WorldPhasePresence.ParseFrame(Find(fixture,"goalkick-out").steps[21]);k0.session=k1.session="s";k0.camera=k1.camera=Camera();
        Require(WorldViewPlayback.Blend(k0,k1,.5).players[0].phase==k1.players[0].phase,"playback blend copies the goal-kick phase");
    }
    // Recovery timing is a pure function of the received recovery.
    static void Timing(Action<bool,string> Require){
        Require(FootballKeeperTiming.RecoveryPose("low",0,out var l0)==FootballKeeperTiming.Recovery.Clip&&Math.Abs(l0-1.18)<1e-9&&FootballKeeperTiming.RecoveryPose("low",1,out var l1)==FootballKeeperTiming.Recovery.Clip&&Math.Abs(l1-FootballKeeperTiming.LowStand)<1e-9,"a standing save recovers within its own clip from the contact to standing");
        Require(FootballKeeperTiming.SaveKind(new Vector3(2,1.35f,.3f),Vector3.zero,Vector3.right)=="mid"&&FootballKeeperTiming.SaveKind(new Vector3(2,.6f,.3f),Vector3.zero,Vector3.right)=="low"&&FootballKeeperTiming.SaveKind(new Vector3(2,1.35f,1.5f),Vector3.zero,Vector3.right)=="dive","a chest-height central ball is an upright save, a low ball a scoop, a wide one a dive");
        Require(FootballKeeperTiming.RecoveryPose("mid",.5,out _)==FootballKeeperTiming.Recovery.Ready&&Math.Abs(FootballKeeperTiming.MidTime(1)-FootballKeeperTiming.MidContact)<1e-9,"an upright save meets the ball at its contact frame, then settles into the ready stance");
        Require(FootballKeeperTiming.RecoveryPose("high",.2,out _)==FootballKeeperTiming.Recovery.Clip&&FootballKeeperTiming.RecoveryPose("high",.5,out var h)==FootballKeeperTiming.Recovery.Rise&&h>FootballKeeperTiming.RiseKneel,"a high save lands in its own clip, then rises from the kneel");
        Require(FootballKeeperTiming.RecoveryPose("dive",.3,out _)==FootballKeeperTiming.Recovery.Save&&FootballKeeperTiming.RecoveryPose("dive",1,out var d)==FootballKeeperTiming.Recovery.Rise&&Math.Abs(d-FootballKeeperTiming.RiseStand)<1e-9,"a dive rises from the floor and stands at the end of recovery");
        double prev=-1;bool monotone=true;foreach(var s in new[]{"low","high","dive"})for(int k=0;k<=40;k++){var body=FootballKeeperTiming.RecoveryPose(s,k/40.0,out var t);if(k==0)prev=-1;if(body!=FootballKeeperTiming.Recovery.Save&&t<prev-1e-9&&body==FootballKeeperTiming.Recovery.Clip)monotone=false;if(body!=FootballKeeperTiming.Recovery.Save)prev=t;}
        Require(monotone,"recovery clip time never runs backwards within a body");
    }
    static void Projection(Action<bool,string> Require){
        var type=typeof(ProbeBridge).GetNestedType("WorldProjection",BindingFlags.NonPublic);var o=Activator.CreateInstance(type);
        type.GetField("renderFrame").SetValue(o,1234);type.GetField("renderTime").SetValue(o,56.5);var json=JsonUtility.ToJson(o);
        Require(json.Contains("\"renderFrame\":1234")&&json.Contains("\"renderTime\":56.5"),"projection JSON carries renderFrame and renderTime");
    }
    static WorldCamera Camera(){return new WorldCamera{position=new double[3],target=new double[3],fov=40};}
    static Sequence Find(Fixture f,string name){return Array.Find(f.sequences,s=>s.name==name)??throw new Exception("missing fixture "+name);}

    static void Selector(string raw,Fixture fixture,GameObject actor,FootballAnimation animation,Dictionary<string,AnimationClip> c,Action<bool,string> Require,List<Measurement> m){
        var flags=BindingFlags.NonPublic|BindingFlags.Instance;var config=JsonUtility.FromJson<WorldConfig>(raw);var goalie=Array.Find(config.players,p=>p.keeper);
        var host=new GameObject("D6 keeper selector test");var ballView=new GameObject("D6 keeper ball").transform;
        Transform Bone(string n)=>Array.Find(actor.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:"+n);var hips=Bone("Hips");
        var bones=actor.GetComponentsInChildren<Transform>();
        try{
            var bridge=host.AddComponent<ProbeBridge>();void Field(string name,object value)=>typeof(ProbeBridge).GetField(name,flags).SetValue(bridge,value);
            Field("worldView",new WorldViewState(config));Field("ballView",ballView);
            ((List<Transform>)typeof(ProbeBridge).GetField("actors",flags).GetValue(bridge)).Add(actor.transform);
            ((List<FootballAnimation>)typeof(ProbeBridge).GetField("football",flags).GetValue(bridge)).Add(animation);
            Field("runSpeeds",new float[1]);Field("animationTimes",new double[1]);var locomotion=new[]{new FootballLocomotion()};Field("worldLocomotion",locomotion);
            bridge.runClip=bridge.fastRunClip=bridge.walkClip=bridge.backClip=bridge.brakeClip=bridge.turnLeftClip=bridge.turnRightClip=c["running"];bridge.sprintClip=c["sprint_forward"];
            bridge.idleClip=c["idle_stand_meshy"];bridge.keeperClip=c["keeper_ready_meshy"];bridge.keeperActionClip=c["keeper_low_meshy"];bridge.keeperHighClip=c["keeper_high_meshy"];bridge.keeperDiveClip=c["keeper_dive_meshy"];bridge.keeperRiseClip=c["keeper_rise_meshy"];
            bridge.passClip=c["pass_inside_meshy"];bridge.shotClip=c["shot_meshy"];bridge.receiveClip=c["receive_ground_meshy"];
            var select=typeof(ProbeBridge).GetMethod("WorldFootballPose",flags);
            // One actual step: keeper id remapped to the fixture goalie, frame facts and ball as received.
            // rotate: optional rotation about the keeper (diagonal check). legacyPhase drops the phase.
            WorldFrame Step(string json,Quaternion rotate,Vector3 pivot,bool dropPhase=false){
                var f=WorldPhasePresence.ParseFrame(json);var p=f.players[0];p.id=goalie.id;p.number=goalie.number;f.owner=f.owner=="@keeper"?goalie.id:f.owner=="@other"?"someone-else":"";f.celebrating=false;if(dropPhase)p.phase=null;
                double[] R(double[] v,bool point){if(v==null||v.Length!=3)return v;var w=new Vector3((float)v[0],(float)v[1],(float)v[2]);w=point?rotate*(w-pivot)+pivot:rotate*w;return new double[]{w.x,w.y,w.z};}
                p.position=R(p.position,true);p.facing=R(p.facing,false);p.contactPoint=R(p.contactPoint,true);f.ball=R(f.ball,true);return f;
            }
            FootballAnimation.Pose Select(WorldFrame f){
                var p=f.players[0];var face=new Vector3((float)p.facing[0],0,(float)p.facing[2]);
                actor.transform.SetPositionAndRotation(new Vector3((float)p.position[0],animation.RootHeight,(float)p.position[2]),Quaternion.LookRotation(face.sqrMagnitude>1e-6f?face:Vector3.forward));
                ballView.position=new Vector3((float)f.ball[0],ProbeBridge.DisplayHeight(f.ball[1]),(float)f.ball[2]);ballView.gameObject.SetActive(true);
                return (FootballAnimation.Pose)select.Invoke(bridge,new object[]{p,f,0});
            }
            // Release-117 recovery rule, reproduced only to measure the former body.
            FootballAnimation.Pose Before(FootballAnimation.Pose pose,WorldPose p){
                if(p.action!="save")return pose;var kind=FootballKeeperTiming.SaveKind(V(p.contactPoint),V(p.position),V(p.facing));if(kind=="mid")kind="low";
                if(p.recovery>.35){pose.clip=c["keeper_rise_meshy"];pose.time=(p.recovery-.35)/.65*(pose.clip.length-.001);}
                else if(kind!="dive"){pose.clip=kind=="high"?c["keeper_high_meshy"]:c["keeper_low_meshy"];pose.time=FootballKeeperTiming.Time(pose.clip.name,p.recovery>0?1:Math.Clamp(p.progress,0,1));}
                return pose;}
            // Samples a whole actual sequence on the rig at the received clocks.
            var leftHand=Bone("LeftHand");var rightHand=Bone("RightHand");var hands=new Dictionary<int,float>();
            List<(WorldFrame f,FootballAnimation.Pose pose,float hips)> Play(Sequence s,Quaternion rotate,bool before=false){
                locomotion[0]=new FootballLocomotion();var list=new List<(WorldFrame,FootballAnimation.Pose,float)>();var pivot=Vector3.zero;bool first=true;
                foreach(var json in s.steps){
                    if(first){var f0=WorldPhasePresence.ParseFrame(json);pivot=V(f0.players[0].position);}
                    var f=Step(json,rotate,pivot);var pose=Select(f);if(before)pose=Before(pose,f.players[0]);
                    animation.Sample(pose,1000+f.clock,first);first=false;list.Add((f,pose,hips.position.y-animation.RootHeight));hands[list.Count-1]=(leftHand.position.y+rightHand.position.y)/2-animation.RootHeight;
                }
                return list;
            }
            animation.Sample(new FootballAnimation.Pose{clip=c["keeper_ready_meshy"],time=.4,loop=true,key="ready"},10,true);float ready=hips.position.y-animation.RootHeight;
            // Measured hands/hips of the existing keeper clips (selection evidence, no requirement).
            {var lh=Bone("LeftHand");var rh=Bone("RightHand");actor.transform.SetPositionAndRotation(new Vector3(0,animation.RootHeight,0),Quaternion.identity);double clock=20;
                foreach(var n in new[]{"keeper_ready_meshy","keeper_low_meshy","keeper_high_meshy","keeper_dive_meshy"}){var clip=c[n];var sb=new System.Text.StringBuilder();
                    for(double t=0;t<clip.length;t+=.1){animation.Sample(new FootballAnimation.Pose{clip=clip,time=t,loop=false,key="measure-"+n},clock+=1,true);float hand=(lh.position.y+rh.position.y)/2-animation.RootHeight,fwd=(actor.transform.InverseTransformPoint(lh.position).z+actor.transform.InverseTransformPoint(rh.position).z)/2;sb.Append(t.ToString("0.0")+":h"+(hips.position.y-animation.RootHeight).ToString("0.00")+"/a"+hand.ToString("0.00")+"/f"+fwd.ToString("0.00")+" ");}
                    m.Add(new Measurement{stage="clip-hands "+n,value=clip.length,detail=sb.ToString()});}}
            m.Add(new Measurement{stage="keeper-ready-hips",value=ready});

            // Goal kick: no contact during the wait, a forward wind-up, contact at release, no snap back.
            foreach(var name in new[]{"goalkick-out","goalkick-out-turned"}){
                var s=Find(fixture,name);var run=Play(s,Quaternion.identity);int waitContacts=0,followContacts=0,legacyWaitContacts=0;double prev=-1;bool forward=true;int waiting=0;
                foreach(var (f,pose,_) in run){var p=f.players[0];
                    Require(pose.clip==c["shot_meshy"],"goal kick keeps the kick clip ("+name+" seq "+f.sequence+")");
                    if(p.phase=="waiting"){waiting++;if(pose.contact)waitContacts++;}else if(pose.contact)followContacts++;
                    if(pose.time<prev-1e-6)forward=false;prev=pose.time;
                    var legacy=Select(Step(s.steps[run.FindIndex(r=>r.f.sequence==f.sequence)],Quaternion.identity,Vector3.zero,true));if(p.phase=="waiting"&&legacy.contact)legacyWaitContacts++;
                }
                m.Add(new Measurement{stage="goalkick-wait-contacts "+name,value=waitContacts,before=legacyWaitContacts,detail=waiting+" actual waiting steps; follow contacts "+followContacts});
                Require(waiting>=20&&waitContacts==0&&legacyWaitContacts>=15,"actual wait shows no foot contact (Release 117 held it for "+legacyWaitContacts+" of "+waiting+" steps) ("+name+")");
                Require(followContacts>=1&&followContacts<=3,"contact at the actual release only ("+name+", "+followContacts+" steps)");
                Require(forward,"wind-up, contact and follow-through run forward without the former snap back ("+name+")");
                var lastWait=run.FindLast(r=>r.f.players[0].phase=="waiting");var firstFollow=run.Find(r=>r.f.players[0].phase=="follow");
                Require(lastWait.pose.time<0.46&&lastWait.pose.time>.3&&Math.Abs(firstFollow.pose.time-.46)<1e-6,"the wind-up reaches the contact frame exactly at the native release ("+name+")");
                Require(Math.Abs(run[run.Count-1].pose.time-(.46+.45))<1e-3,"follow-through spans the native 0.45 s ("+name+")");
            }

            // Saves: recovery body measured on the rig, before (Release 117) and now.
            foreach(var name in new[]{"parry-mid","parry-high","parry-large","parry-central","goal-dive","goal-high","goal-central"}){
                var s=Find(fixture,name);var now=Play(s,Quaternion.identity);var handsNow=new Dictionary<int,float>(hands);var before=Play(s,Quaternion.identity,true);var handsBefore=new Dictionary<int,float>(hands);
                var first=WorldPhasePresence.ParseFrame(s.steps[0]).players[0];var kind=FootballKeeperTiming.SaveKind(V(first.contactPoint),V(first.position),V(first.facing));
                float MinHips(List<(WorldFrame f,FootballAnimation.Pose pose,float hips)> r){float v=float.MaxValue;foreach(var x in r)if(x.f.players[0].recovery>0)v=Mathf.Min(v,x.hips);return v;}
                // Steps from leaving the ground (hips above 0.45 m) to standing (ready - 0.15 m).
                int Rise(List<(WorldFrame f,FootballAnimation.Pose pose,float hips)> r){int low=r.FindLastIndex(x=>x.hips<.45f);if(low<0)return 0;int up=r.FindIndex(low,x=>x.hips>ready-.15f);return up<0?r.Count-low:up-low;}
                float last=now[now.Count-1].hips;float minNow=MinHips(now),minBefore=MinHips(before);
                int rising=Rise(now),risingBefore=Rise(before);
                m.Add(new Measurement{stage="save-recovery-min-hips "+name,value=minNow,before=minBefore,detail=kind+", final hips "+last.ToString("0.00")+", rising steps "+rising+" (before "+risingBefore+"), turned "+s.turned});
                bool conceded=first.goalKnown&&now.Exists(x=>x.f.players[0].goal);
                Require(!now.Exists(x=>FootballKeeperTiming.Held(x.f.players[0],x.f)),"no actual parry or conceded goal shows a held ball ("+name+")");
                if(conceded)Require(!now.Exists(x=>x.pose.contact),"a native conceded goal never corrects a hand onto the ball ("+name+")");
                else Require(now.Exists(x=>x.pose.contact&&x.f.players[0].progress>=.99),"an actual parry keeps its hand contact at the native contact ("+name+")");
                if(kind=="mid"){
                    // Last step before the native contact without a hand correction: authored hands only.
                    int k=now.FindLastIndex(x=>x.f.players[0].recovery==0&&x.f.players[0].progress<.99&&!x.pose.contact);float y=(float)first.contactPoint[1];
                    float gapNow=Mathf.Abs(handsNow[k]-y),gapBefore=Mathf.Abs(handsBefore[k]-y);
                    m.Add(new Measurement{stage="mid-save-hands-gap "+name,value=gapNow,before=gapBefore,detail="contact height "+y.ToString("0.00")+" m, hands "+handsNow[k].ToString("0.00")+" m (before "+handsBefore[k].ToString("0.00")+" m) at progress "+now[k].f.players[0].progress.ToString("0.00")});
                    Require(gapNow<.3f&&gapNow<gapBefore-.2f,"an upright save brings the authored hands to the actual chest-height ball ("+name+", gap "+gapNow.ToString("0.00")+" m, before "+gapBefore.ToString("0.00")+" m)");
                }
                // Per step: the received facing can turn late in recovery (parry-large flips to a dive for its last 3 steps).
                if(kind=="mid")Require(now.TrueForAll(x=>{var q=x.f.players[0];return q.recovery==0||FootballKeeperTiming.SaveKind(V(q.contactPoint),V(q.position),V(q.facing))!="mid"||x.pose.clip==c["keeper_ready_meshy"];}),"an upright save settles into the ready stance during recovery ("+name+")");
                if(kind=="low"||kind=="mid"){
                    Require(minNow>ready-.3f,"a standing "+kind+" save stays on its feet through recovery ("+name+", min hips "+minNow.ToString("0.00")+" m, before "+minBefore.ToString("0.00")+" m)");
                    Require(minBefore<.5f,"Release 117 dropped the same standing save to the floor ("+name+")");
                }else{
                    Require(minNow<.6f,"a "+kind+" save reaches the ground before rising ("+name+")");
                    Require(rising>=3&&rising>risingBefore,"the rise from the ground takes "+rising+" native steps instead of the former "+risingBefore+" ("+name+")");
                }
                Require(last>ready-.15f,"the keeper stands again at the end of the actual recovery ("+name+", "+last.ToString("0.00")+" m)");
            }

            // Diagonal and turned orientation of the same actual parries: identical body.
            foreach(var name in new[]{"parry-mid","parry-high"}){
                var s=Find(fixture,name);var a=Play(s,Quaternion.identity);
                foreach(float yaw in new[]{45f,-135f}){var b=Play(s,Quaternion.Euler(0,yaw,0));float worst=0;for(int k=0;k<a.Count;k++)worst=Mathf.Max(worst,Mathf.Abs(a[k].hips-b[k].hips));
                    Require(worst<.01f&&a[a.Count-1].pose.clip==b[b.Count-1].pose.clip,"keeper rotated "+yaw+" deg shows the same save body ("+name+", max hips diff "+worst.ToString("0.000")+")");}
            }

            // Pause and replay: the same actual picture gives identical bones.
            {
                var s=Find(fixture,"parry-high");var f=Step(s.steps[20],Quaternion.identity,Vector3.zero);var pose=Select(f);animation.Sample(pose,2000,true);var x=Array.ConvertAll(bones,t=>t.position);
                animation.Sample(pose,2000);var paused=Array.ConvertAll(bones,t=>t.position);
                animation.Sample(Select(Step(s.steps[3],Quaternion.identity,Vector3.zero)),2001,true);animation.Sample(Select(f),2000,true);var replay=Array.ConvertAll(bones,t=>t.position);
                bool Same(Vector3[] u,Vector3[] v){for(int i=0;i<u.Length;i++)if(Vector3.Distance(u[i],v[i])>.0001f)return false;return true;}
                Require(Same(x,paused)&&Same(x,replay),"paused and replayed recovery pictures show identical bones");
            }

            // Catch: only known native facts hold the actual ball. No captured match
            // produced one (5 matches: parries and goals only), so the native-shaped
            // JSON of the current bridge is used with the actual parry geometry.
            {
                var s=Find(fixture,"parry-mid");var baseJson=s.steps[20];
                string Catch(string extra,string owner="@keeper",string flight="false"){var f=WorldPhasePresence.ParseFrame(baseJson);var p=f.players[0];
                    var json=JsonUtility.ToJson(p);json=json.Replace("\"saved\":true","\"saved\":true").Replace("\"parry\":true","\"parry\":false");
                    // The native caught ball rests at the contact point (v99BallView).
                    return "{\"owner\":\""+owner+"\""+(flight==null?"":",\"ballInFlight\":"+flight)+",\"ball\":["+string.Join(",",Array.ConvertAll(p.contactPoint,v=>v.ToString(System.Globalization.CultureInfo.InvariantCulture)))+"],\"clock\":"+f.clock.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\"players\":["+json.TrimEnd('}')+extra+"}]}";}
                FootballAnimation.Pose P(string json){return Select(Step(json,Quaternion.identity,Vector3.zero));}
                var nativeCatch=Step(Catch(""),Quaternion.identity,Vector3.zero);var held=P(Catch(""));
                m.Add(new Measurement{stage="controlled-catch-native-distance",value=Horizontal(ballView.position-actor.transform.position),detail="native caught ball rests at the contact; Held="+FootballKeeperTiming.Held(nativeCatch.players[0],nativeCatch)+", contact="+held.contact});
                Require(FootballKeeperTiming.Held(nativeCatch.players[0],nativeCatch)&&!held.contact,"a known catch at the native contact distance claims no out-of-reach hold and keeps the recovery blend");
                // Within arm reach the same facts hold the actual ball with both hands.
                var near=Catch("");var np=WorldPhasePresence.ParseFrame(near).players[0];var close=new[]{np.position[0]+.45*np.facing[0],1.15,np.position[2]+.45*np.facing[2]};
                int bs=near.IndexOf("\"ball\":[",StringComparison.Ordinal)+8,be=near.IndexOf("]",bs);near=near.Substring(0,bs)+string.Join(",",Array.ConvertAll(close,v=>v.ToString(System.Globalization.CultureInfo.InvariantCulture)))+near.Substring(be);
                var reach=P(near);animation.Sample(reach,3000,true);
                m.Add(new Measurement{stage="controlled-catch-within-reach",value=animation.rig.reachable?1:0,detail="ball 0.45 m ahead at 1.15 m: contact error "+animation.rig.contactError.ToString("0.00")+" m"});
                Require(reach.kind=="two-hands"&&reach.contact&&Vector3.Distance(reach.target,ballView.position)<1e-4f&&animation.rig.reachable,"a known catch within arm reach holds the actual ball with both hands");
                {var g=Step(Catch("",flight:null),Quaternion.identity,Vector3.zero);Require(!FootballKeeperTiming.Held(g.players[0],g)&&!P(Catch("",flight:null)).contact,"a catch without the ballInFlight fact shows no held ball");}
                var older=Catch("").Replace(",\"saved\":true","").Replace(",\"parry\":false","").Replace(",\"goal\":false","").Replace(",\"ballInFlight\":false","");
                Require(!P(older).contact,"an older picture with the ball resting at the contact shows no inferred hold during recovery");
                var contactStep=Find(fixture,"parry-mid").steps.Length;var atContact=Array.Find(Find(fixture,"parry-mid").steps,j=>{var q=WorldPhasePresence.ParseFrame(j).players[0];return q.progress>=.99&&q.recovery==0;});
                Require(atContact!=null&&P(atContact).contact,"the actual native contact step still corrects the hand onto the ball");
                {var g=Step(Catch("",flight:"true"),Quaternion.identity,Vector3.zero);Require(!FootballKeeperTiming.Held(g.players[0],g),"a ball still in flight is not held");}
                {var g=Step(Catch("","@other"),Quaternion.identity,Vector3.zero);Require(!FootballKeeperTiming.Held(g.players[0],g),"a ball owned by someone else is not held");}
                var parried=Catch("").Replace("\"parry\":false","\"parry\":true");Require(!P(parried).contact&&!FootballKeeperTiming.Held(Step(parried,Quaternion.identity,Vector3.zero).players[0],Step(parried,Quaternion.identity,Vector3.zero)),"a parried ball is never held");
                var noSaved=Catch("").Replace(",\"saved\":true","");Require(!FootballKeeperTiming.Held(Step(noSaved,Quaternion.identity,Vector3.zero).players[0],Step(noSaved,Quaternion.identity,Vector3.zero)),"a picture without the saved fact never shows a catch");
                var goal=Catch("").Replace("\"goal\":false","\"goal\":true");Require(!FootballKeeperTiming.Held(Step(goal,Quaternion.identity,Vector3.zero).players[0],Step(goal,Quaternion.identity,Vector3.zero)),"a conceded goal is never held");
            }
        }finally{UnityEngine.Object.DestroyImmediate(host);UnityEngine.Object.DestroyImmediate(ballView.gameObject);}
    }
    static float Horizontal(Vector3 v){v.y=0;return v.magnitude;}
    static Vector3 V(double[] a){return new Vector3((float)a[0],(float)a[1],(float)a[2]);}
}
#endif

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
// Iteration 117: aerial sequence, kick follow-through, throw-in phases, keeper
// save side, ball projection marker and the optional picture fields, on the
// actual WorldPlayer rig and through the actual WorldFootballPose selector.
public static class FootballIterationTests {
    [Serializable] class Measurement {public string stage;public float value,hips,lowestBoot;public string detail;}
    [Serializable] class Report {public int passed;public string[] checks;public Measurement[] measurements;}
    const string Asset="Assets/Doppel6EngineProbe/Art/football-v130.fbx";
    static AnimationClip Clip(string name){return Array.Find(AssetDatabase.LoadAllAssetsAtPath(Asset),a=>a is AnimationClip&&a.name==name) as AnimationClip??AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Doppel6EngineProbe/Art/"+name+".anim")??throw new Exception("Missing clip "+name);}
    static float LowestBoot(Transform actor){
        float lowest=float.MaxValue;foreach(var skin in actor.GetComponentsInChildren<SkinnedMeshRenderer>()){
            var mesh=new Mesh();skin.BakeMesh(mesh);var vertices=mesh.vertices;var weights=skin.sharedMesh.boneWeights;
            for(int i=0;i<vertices.Length;i++){var name=skin.bones[weights[i].boneIndex0].name;if(name.EndsWith("Foot")||name.EndsWith("ToeBase"))lowest=Mathf.Min(lowest,skin.transform.TransformPoint(vertices[i]).y);}
            UnityEngine.Object.DestroyImmediate(mesh);
        }return lowest;
    }
    public static string Run(string repository,string outputFolder=null){
        var checks=new List<string>();var measurements=new List<Measurement>();void Require(bool ok,string name){if(!ok)throw new Exception("Iteration 117: "+name);checks.Add(name);}
        var raw=File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json"));
        Contract(raw,Require);
        Timing(Require);
        KeeperSide(Require,measurements);
        BallMarker(Require,measurements);

        var scene=EditorSceneManager.NewPreviewScene();var actor=UnityEngine.Object.Instantiate(AssetDatabase.LoadAssetAtPath<GameObject>(Asset));UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(actor,scene);actor.transform.localScale=Vector3.one*1.45f;
        foreach(var skin in actor.GetComponentsInChildren<SkinnedMeshRenderer>())skin.sharedMesh=AssetDatabase.LoadAssetAtPath<Mesh>("Assets/Doppel6EngineProbe/Art/WorldPlayer.asset");
        var animator=actor.GetComponent<Animator>();if(animator==null)animator=actor.AddComponent<Animator>();animator.applyRootMotion=false;
        var c=new Dictionary<string,AnimationClip>();foreach(var n in new[]{"idle_stand_meshy","running","sprint_forward","keeper_ready_meshy","keeper_low_meshy","keeper_high_meshy","keeper_dive_meshy","keeper_rise_meshy","pass_inside_meshy","shot_meshy","receive_ground_meshy"})c[n]=Clip(n);
        var graph=PlayableGraph.Create("D6 iteration 117 validation");graph.SetTimeUpdateMode(DirectorUpdateMode.Manual);var initial=AnimationClipPlayable.Create(graph,c["idle_stand_meshy"]);AnimationPlayableOutput.Create(graph,"Character",animator).SetSourcePlayable(initial);graph.Play();graph.Evaluate(0);
        try{
            var animation=new FootballAnimation(graph,actor.transform,c.Values);
            Rig(actor,animation,c,Require,measurements);
            Selector(raw,actor,animation,c,Require,measurements);
            Require(graph.GetPlayableCount()<=16,"new poses reuse cached graph nodes");
        }finally{if(graph.IsValid())graph.Destroy();EditorSceneManager.ClosePreviewScene(scene);}
        var json=JsonUtility.ToJson(new Report{passed=checks.Count,checks=checks.ToArray(),measurements=measurements.ToArray()},true);
        var folder=Path.Combine(repository,outputFolder??"outputs/3d-quality/iteration-117");Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,"iteration-tests.json"),json);return "passed="+checks.Count;
    }

    // Optional holding/pickup/aerial fields: actual JSON with omitted keys,
    // explicit false and the native release without pickup.
    static void Contract(string raw,Action<bool,string> Require){
        var config=JsonUtility.FromJson<WorldConfig>(raw);var inbox=new WorldViewState(config);
        string Command(string pose){
            var f=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(config.initial));f.sequence=2;f.clock+=1;var json=JsonUtility.ToJson(new WorldCommand{kind="frame",frame=f});
            // Replace the first player's object with the given native-shaped JSON.
            var first=JsonUtility.ToJson(f.players[0]);if(json.IndexOf(first,StringComparison.Ordinal)<0)throw new Exception("fixture player JSON not found");return json.Replace(first,pose);
        }
        var p0=config.initial.players[0];string Shape(string extra)=>"{\"id\":\""+p0.id+"\",\"position\":[0,0,0],\"facing\":[1,0,0],\"moving\":false,\"action\":\"throw\",\"actionId\":\"throw\",\"contactPoint\":null,\"recovery\":0,\"progress\":0.3,\"duration\":1,\"number\":"+p0.number+extra+"}";
        WorldCommand Parse(string json){var command=JsonUtility.FromJson<WorldCommand>(json);WorldPhasePresence.MarkCommand(command,json);return command;}
        var omitted=Parse(Command(Shape(""))).frame.players[0];
        var release=Parse(Command(Shape(",\"holding\":false"))).frame.players[0];
        var holding=Parse(Command(Shape(",\"holding\":true,\"pickup\":0.4"))).frame.players[0];
        Require(!omitted.holdingKnown&&!omitted.holding&&omitted.pickup==-1,"older picture without holding/pickup keeps both unknown (legacy throw)");
        Require(release.holdingKnown&&!release.holding&&release.pickup==-1,"native release JSON holding:false without pickup is recognised as an explicit release");
        Require(holding.holdingKnown&&holding.holding&&Math.Abs(holding.pickup-.4)<1e-9,"native holding JSON keeps holding and pickup");
        var aerial=Parse(Command(Shape(",\"aerial\":true").Replace("\"throw\"","\"control\""))).frame.players[0];Require(aerial.aerial&&!aerial.holdingKnown,"aerial flag is read from the picture");
        // Validation of the optional fields.
        foreach(var bad in new[]{Shape(",\"holding\":true,\"pickup\":1.5"),Shape(",\"pickup\":-0.5"),Shape(",\"holding\":true").Replace("\"throw\"","\"pass\"")}){
            bool rejected=false;try{inbox.Accept(Parse(Command(bad)).frame);}catch(ArgumentException){rejected=true;}Require(rejected,"invalid optional throw field rejected ("+bad.Substring(bad.IndexOf("\"number\""))+")");
        }
        Require(inbox.Accept(Parse(Command(Shape(",\"holding\":false"))).frame),"explicit release picture is accepted");
        // Playback: pickup interpolates within one action, flags come from the newer picture.
        var a=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(config.initial));a.phase="live";a.clock=10;a.players[0].action="throw";a.players[0].actionId="throw";a.players[0].holding=true;a.players[0].holdingKnown=true;a.players[0].pickup=.2;
        var b=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(a));b.clock=10.05;b.sequence++;b.players[0].holding=true;b.players[0].holdingKnown=true;b.players[0].pickup=.6;
        var mid=WorldViewPlayback.Blend(a,b,.5).players[0];Require(Math.Abs(mid.pickup-.4)<1e-9&&mid.holding&&mid.holdingKnown,"pickup interpolates between two holding pictures");
        var r=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(b));r.clock=10.1;r.players[0].holding=false;r.players[0].holdingKnown=true;r.players[0].pickup=-1;r.players[0].progress=.1;
        var boundary=WorldViewPlayback.Blend(b,r,.5).players[0];Require(!boundary.holding&&boundary.holdingKnown&&boundary.pickup==-1,"release boundary shows the release, never a blended pickup");
        var older=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(r));older.players[0].holdingKnown=false;Require(!WorldViewPlayback.Blend(b,older,.5).players[0].holdingKnown,"an older picture after a new one stays legacy");
    }

    static void Timing(Action<bool,string> Require){
        Require(FootballAirTiming.ReadyLift(1)==1&&FootballAirTiming.FallLift(0)==1,"preparation reaches the apex exactly where header/landing start");
        Require(FootballAirTiming.ReadyLift(.3)==0&&FootballAirTiming.ReadyCrouch(0)==0&&FootballAirTiming.ReadyCrouch(.25)>.5f&&FootballAirTiming.ReadyCrouch(.5)==0,"preparation crouches, then takes off");
        Require(FootballAirTiming.FallLift(1)==0&&FootballAirTiming.Landing(.6)==0&&FootballAirTiming.Landing(.8)>.99f&&FootballAirTiming.Landing(1)==0,"landing bends between 60 % and the native end");
        Require(FootballAirTiming.Lift(5,1.7f)==FootballAirTiming.MaxLift&&FootballAirTiming.Lift(float.NaN,1.7f)==FootballAirTiming.MinLift&&FootballAirTiming.Lift(1.9f,1.7f)>FootballAirTiming.MinLift,"jump height follows the contact but stays bounded");
        bool zero=true;for(int k=0;k<=9;k++)zero&=FootballKickTiming.FollowThrough(k*.01)==0;
        Require(zero&&FootballKickTiming.FollowThrough(FootballKickTiming.Peak)==1&&FootballKickTiming.FollowThrough(FootballKickTiming.End)==0,"kick follow-through is zero through the native contact window and ends");
        Require(FootballThrowTiming.Bend(0)==1&&FootballThrowTiming.Bend(1)==0&&FootballThrowTiming.Raise(1)==1&&FootballThrowTiming.Arch(.5)==0&&FootballThrowTiming.Arch(1)==1,"holding: bend to the ball, raise it, arch before the release");
        Require(FootballThrowTiming.ReleaseArch(0)==1&&FootballThrowTiming.Whip(0)==0&&FootballThrowTiming.Whip(.45)>.99f&&FootballThrowTiming.Whip(1)==0&&FootballThrowTiming.ReleaseRaise(1)==0,"release: arch whips forward and settles by the end");
    }

    // Isolated save side cases: facing 0/45/90/180 degrees, both sides.
    static void KeeperSide(Action<bool,string> Require,List<Measurement> m){
        int wrongBefore=0;
        foreach(float angle in new[]{0f,45f,90f,135f,180f,-45f,-90f}){
            var facing=Quaternion.AngleAxis(angle,Vector3.up)*Vector3.forward;var right=Quaternion.AngleAxis(angle,Vector3.up)*Vector3.right;var at=new Vector3(30,0,2);
            foreach(int side in new[]{-1,1}){
                var lateral=at+right*side*1.6f+Vector3.up*.6f;Require(FootballKeeperTiming.SaveKind(lateral,at,facing)=="dive","keeper facing "+angle+" dives to its "+(side<0?"left":"right")+" for a 1.6 m lateral ball");
            }
            var ahead=at+facing*2f+right*.4f+Vector3.up*.6f;Require(FootballKeeperTiming.SaveKind(ahead,at,facing)=="low","keeper facing "+angle+" meets a ball straight ahead without diving");
            Require(FootballKeeperTiming.SaveKind(at+right*1.6f+Vector3.up*1.9f,at,facing)=="high","keeper facing "+angle+" takes a 1.9 m ball high");
            // The former rule: global Z difference above 1.2 m.
            bool oldDiveAhead=Math.Abs(ahead.z-at.z)>1.2;var lat=at+right*1.6f;bool oldDiveLateral=Math.Abs(lat.z-at.z)>1.2;if(oldDiveAhead||!oldDiveLateral)wrongBefore++;
        }
        m.Add(new Measurement{stage="keeper-global-z-wrong-cases",value=wrongBefore,detail="of 7 facings, the former global-Z rule chose wrong for a ball ahead or a 1.6 m lateral ball"});
        Require(wrongBefore>=4,"the former global-Z rule is confirmed wrong for diagonal and turned keepers ("+wrongBefore+" of 7 facings)");
    }

    // Projected marker against the projected silhouette of the same sphere.
    static void BallMarker(Action<bool,string> Require,List<Measurement> m){
        var go=new GameObject("D6 marker camera");
        try{
            var camera=go.AddComponent<Camera>();camera.fieldOfView=42;camera.aspect=844f/390f;camera.nearClipPlane=.3f;camera.farClipPlane=500;
            foreach(var (pos,target,name) in new[]{(new Vector3(0,21,31),Vector3.zero,"follow"),(new Vector3(0,32,47),new Vector3(0,0,-2),"wide"),(new Vector3(-22,23,32),Vector3.zero,"diagonal")}){
                go.transform.position=pos;go.transform.LookAt(target);
                foreach(var ball in new[]{new Vector3(0,.18f,0),new Vector3(-20,.18f,-12),new Vector3(14,2.4f,8)}){
                    var marker=ProbeBridge.BallMarker(camera,ball,WorldBallMotion.Radius,true,390);
                    // Silhouette: rim points perpendicular to the view ray.
                    var ray=(ball-pos).normalized;var u=Vector3.Cross(ray,Vector3.up).normalized;var v=Vector3.Cross(ray,u);float max=0;
                    var centre=camera.WorldToViewportPoint(ball);for(int k=0;k<32;k++){var rim=ball+(u*Mathf.Cos(k*Mathf.PI/16)+v*Mathf.Sin(k*Mathf.PI/16))*WorldBallMotion.Radius;var q=camera.WorldToViewportPoint(rim);max=Mathf.Max(max,Mathf.Abs(q.y-centre.y)*390);}
                    float silhouette=2*max;float error=Mathf.Abs(marker.diameter-silhouette)/silhouette;
                    m.Add(new Measurement{stage="ball-marker-"+name,value=marker.diameter,detail="silhouette "+silhouette.ToString("0.00")+" px at 390 px height, relative error "+error.ToString("0.000")+", ball "+ball});
                    Require(marker.visible&&error<.05f&&Mathf.Abs(marker.x-centre.x)<1e-5f&&Mathf.Abs(marker.y-(1-centre.y))<1e-5f,"marker matches the projected ball "+name+" "+ball+" ("+marker.diameter.ToString("0.0")+" px)");
                }
            }
            go.transform.position=new Vector3(0,21,31);go.transform.LookAt(Vector3.zero);
            Require(!ProbeBridge.BallMarker(camera,Vector3.zero,WorldBallMotion.Radius,false,390).visible,"a transparent ball has no visible marker");
            Require(!ProbeBridge.BallMarker(camera,new Vector3(0,21,60),WorldBallMotion.Radius,true,390).visible,"a ball behind the camera has no visible marker");
            Require(!ProbeBridge.BallMarker(camera,new Vector3(80,0,0),WorldBallMotion.Radius,true,390).visible,"a ball outside the frustum has no visible marker");
            var far=ProbeBridge.BallMarker(camera,new Vector3(0,.18f,-20),WorldBallMotion.Radius,true,390);var near=ProbeBridge.BallMarker(camera,new Vector3(0,.18f,15),WorldBallMotion.Radius,true,390);
            Require(far.diameter<near.diameter&&far.diameter>0,"marker diameter is the actual sphere size, smaller with distance (no minimum)");
        }finally{UnityEngine.Object.DestroyImmediate(go);}
    }

    static void Rig(GameObject actorObject,FootballAnimation animation,Dictionary<string,AnimationClip> c,Action<bool,string> Require,List<Measurement> m){
        var actor=actorObject.transform;Transform Bone(string n)=>Array.Find(actor.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:"+n);
        var hips=Bone("Hips");var rightFoot=Bone("RightFoot");var rightHand=Bone("RightHand");var head=Bone("Head");var idle=c["idle_stand_meshy"];
        bool Same(Vector3[] x,Vector3[] y){for(int i=0;i<x.Length;i++)if(Vector3.Distance(x[i],y[i])>.0001f)return false;return true;}
        var bones=actor.GetComponentsInChildren<Transform>();
        foreach(float yaw in new[]{90f,-90f}){
            string dir=yaw>0?"+x":"-x";
            actor.SetPositionAndRotation(new Vector3(0,animation.RootHeight,0),Quaternion.Euler(0,yaw,0));var root=actor.position;var heading=actor.rotation;
            FootballAnimation.Pose P(string key,float lift,float reach,float crouch)=>new FootballAnimation.Pose{clip=idle,time=.4,loop=true,key=key,airLift=lift,airReach=reach,airCrouch=crouch,airTuck=FootballAirTiming.Tuck(lift),airArms=FootballAirTiming.Arms(lift,crouch)};
            animation.Sample(new FootballAnimation.Pose{clip=idle,time=.4,loop=true,key="stand"},100,true);float stand=hips.position.y,standHead=head.position.y,standBoot=LowestBoot(actor);
            animation.Sample(P("air",1,standHead+.15f,0),101,true);float apex=hips.position.y-stand;
            m.Add(new Measurement{stage="air-apex "+dir,value=apex,hips=hips.position.y,lowestBoot=LowestBoot(actor)});
            Require(apex>.1f&&apex<=FootballAirTiming.MaxLift+.001f&&LowestBoot(actor)>standBoot+.08f,"aerial apex lifts the body and both boots ("+dir+", "+apex.ToString("0.00")+" m)");
            animation.Sample(P("air-out",1,standHead+3,0),102,true);Require(hips.position.y-stand<=FootballAirTiming.MaxLift+.001f,"a ball far above the head is not chased beyond the bounded jump ("+dir+")");
            Require(actor.position==root&&actor.rotation==heading,"aerial pose never moves the received root or heading ("+dir+")");
            float lowest=float.MaxValue,lowHips=float.MaxValue;for(int k=0;k<=20;k++){double p=k/20.0;animation.Sample(P("land",FootballAirTiming.FallLift(p),standHead+.2f,FootballAirTiming.Landing(p)),103+k*.01,true);lowest=Mathf.Min(lowest,LowestBoot(actor));lowHips=Mathf.Min(lowHips,hips.position.y);}
            m.Add(new Measurement{stage="landing "+dir,hips=lowHips,lowestBoot=lowest});
            Require(lowest>standBoot-.035f&&lowHips<stand-.05f,"landing bends the knees with both boots on, not through, the turf ("+dir+", lowest "+lowest.ToString("0.000")+" m)");
            for(int k=0;k<=10;k++){double p=k/10.0;animation.Sample(P("ready",FootballAirTiming.ReadyLift(p),standHead+.2f,FootballAirTiming.ReadyCrouch(p)),104+k*.01,true);lowest=Mathf.Min(lowest,LowestBoot(actor));}
            Require(lowest>standBoot-.035f,"preparation crouch keeps both boots above the turf ("+dir+")");
            // Pause and replay show the same aerial bones.
            animation.Sample(P("air-mid",.6f,standHead+.2f,0),105,true);var a=Array.ConvertAll(bones,t=>t.position);animation.Sample(P("air-mid",.6f,standHead+.2f,0),105);var paused=Array.ConvertAll(bones,t=>t.position);
            animation.Sample(new FootballAnimation.Pose{clip=c["running"],time=.2,loop=true,key="other"},106,true);animation.Sample(P("air-mid",.6f,standHead+.2f,0),105,true);
            Require(Same(a,paused)&&Same(a,Array.ConvertAll(bones,t=>t.position)),"paused and replayed aerial pictures show identical bones ("+dir+")");
            // Follow-through: the kicking foot swings higher only after the contact window.
            animation.Sample(new FootballAnimation.Pose{clip=c["pass_inside_meshy"],time=.8+.22,loop=false,key="lofted"},107,true);float plain=rightFoot.position.y;
            animation.Sample(new FootballAnimation.Pose{clip=c["pass_inside_meshy"],time=.8+.22,loop=false,key="lofted",loft=1},108,true);float lofted=rightFoot.position.y;
            animation.Sample(new FootballAnimation.Pose{clip=c["shot_meshy"],time=.46+.22,loop=false,key="volley"},109,true);float shot=rightFoot.position.y;
            animation.Sample(new FootballAnimation.Pose{clip=c["shot_meshy"],time=.46+.22,loop=false,key="volley",volley=1},109.5,true);float volley=rightFoot.position.y;
            m.Add(new Measurement{stage="follow-through "+dir,value=lofted-plain,detail="volley foot "+volley.ToString("0.00")});
            Require(lofted>plain+.05f&&volley>shot+.05f&&actor.position==root,"lofted and volley follow-through raise the kicking leg, root unchanged ("+dir+")");
            // Throw-in: bend to the ball, overhead with arch, forward after release.
            animation.Sample(new FootballAnimation.Pose{clip=idle,time=.4,loop=true,key="throw",throwBend=1},110,true);float bent=hips.position.y,bendBoot=LowestBoot(actor);
            animation.Sample(new FootballAnimation.Pose{clip=idle,time=.4,loop=true,key="throw",throwRaise=1,throwArch=1},111,true);float overhead=rightHand.position.y-head.position.y;var wind=actor.InverseTransformPoint(rightHand.position).z;
            animation.Sample(new FootballAnimation.Pose{clip=idle,time=.4,loop=true,key="throw",throwRaise=.5f,throwRelease=1},112,true);var follow=actor.InverseTransformPoint(rightHand.position).z;
            m.Add(new Measurement{stage="throw "+dir,hips=bent,lowestBoot=bendBoot,value=overhead,detail="hand local z wind-up "+wind.ToString("0.00")+" release "+follow.ToString("0.00")});
            Require(bent<stand-.15f&&bendBoot>standBoot-.035f,"throw pickup bends to the ball with boots on the turf ("+dir+")");
            Require(overhead>0&&follow>wind+.1f&&actor.position==root,"throw raises the hands overhead, then follows through forward ("+dir+")");
        }
    }

    static void Selector(string raw,GameObject actor,FootballAnimation animation,Dictionary<string,AnimationClip> c,Action<bool,string> Require,List<Measurement> m){
        var flags=BindingFlags.NonPublic|BindingFlags.Instance;var config=JsonUtility.FromJson<WorldConfig>(raw);
        var field=Array.Find(config.players,p=>!p.keeper);var goalie=Array.Find(config.players,p=>p.keeper);
        var host=new GameObject("D6 iteration selector test");var ballView=new GameObject("D6 iteration ball").transform;
        try{
            var bridge=host.AddComponent<ProbeBridge>();void Field(string name,object value)=>typeof(ProbeBridge).GetField(name,flags).SetValue(bridge,value);
            Field("worldView",new WorldViewState(config));Field("ballView",ballView);
            ((List<Transform>)typeof(ProbeBridge).GetField("actors",flags).GetValue(bridge)).Add(actor.transform);
            ((List<FootballAnimation>)typeof(ProbeBridge).GetField("football",flags).GetValue(bridge)).Add(animation);
            Field("runSpeeds",new float[1]);Field("animationTimes",new double[1]);Field("worldLocomotion",new[]{new FootballLocomotion()});
            bridge.runClip=bridge.fastRunClip=bridge.walkClip=bridge.backClip=bridge.brakeClip=bridge.turnLeftClip=bridge.turnRightClip=c["running"];bridge.sprintClip=c["sprint_forward"];
            bridge.idleClip=c["idle_stand_meshy"];bridge.keeperClip=c["keeper_ready_meshy"];bridge.keeperActionClip=c["keeper_low_meshy"];bridge.keeperHighClip=c["keeper_high_meshy"];bridge.keeperDiveClip=c["keeper_dive_meshy"];bridge.keeperRiseClip=c["keeper_rise_meshy"];
            bridge.passClip=c["pass_inside_meshy"];bridge.shotClip=c["shot_meshy"];bridge.receiveClip=c["receive_ground_meshy"];
            var select=typeof(ProbeBridge).GetMethod("WorldFootballPose",flags);
            WorldFrame Frame(double clock){var f=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(config.initial));f.clock=clock;f.owner="";f.celebrating=false;return f;}
            FootballAnimation.Pose Select(WorldPose p,double clock){((FootballLocomotion[])typeof(ProbeBridge).GetField("worldLocomotion",flags).GetValue(bridge))[0]=new FootballLocomotion();return (FootballAnimation.Pose)select.Invoke(bridge,new object[]{p,Frame(clock),0});}
            foreach(float yaw in new[]{90f,-90f}){
                string dir=yaw>0?"+x":"-x";var facing=Quaternion.Euler(0,yaw,0)*Vector3.forward;actor.transform.SetPositionAndRotation(new Vector3(0,animation.RootHeight,0),Quaternion.Euler(0,yaw,0));
                double[] F()=>new double[]{facing.x,0,facing.z};double[] Ahead(float d,float y)=>new double[]{facing.x*d,y,facing.z*d};
                WorldPose Pose(WorldPlayer who,string action,double progress,double duration,double[] contact)=>new WorldPose{id=who.id,number=who.number,position=new double[]{0,0,0},facing=F(),action=action,actionId=action+"-1",progress=progress,duration=duration,contactPoint=contact};
                ballView.position=new Vector3(facing.x*.5f,2.1f,facing.z*.5f);
                var ready=Select(Pose(field,"airReady",.15,1,Ahead(.5f,2.1f)),1);var takeoff=Select(Pose(field,"airReady",1,1,Ahead(.5f,2.1f)),1.1);
                Require(ready.airLift==0&&ready.airCrouch>0&&takeoff.airLift==1&&takeoff.clip==c["idle_stand_meshy"]&&Math.Abs(takeoff.airReach-2.1f)<.01f,"airReady crouches, then takes off toward the actual contact ("+dir+")");
                var header=Select(Pose(field,"header",0,.62,Ahead(.5f,2.1f)),1.2);var landing=Select(Pose(field,"header",.8,.62,Ahead(.5f,2.1f)),1.3);
                Require(header.airLift==1&&header.kind=="head"&&header.contact&&landing.airLift<.05f&&landing.airCrouch>.99f&&!landing.plant,"header contact at the apex, landing from the native phase ("+dir+")");
                var lose=Select(Pose(field,"airLand",.1,.48,Ahead(.5f,2.1f)),1.4);
                Require(lose.airLift>.5f&&lose.kind!="head"&&!lose.contact,"airLand jumps and lands without claiming the contact ("+dir+")");
                var far=Select(Pose(field,"header",0,.62,Ahead(6,2.1f)),1.5);Require(float.IsNaN(far.airReach)&&!far.contact,"an unreachable aerial contact gives only the minimal hop, no contact ("+dir+")");
                var ac=Pose(field,"control",0,.48,Ahead(.5f,1.3f));ac.aerial=true;var control=Select(ac,1.6);var groundControl=Select(Pose(field,"control",0,.48,Ahead(.5f,.3f)),1.7);
                Require(control.airLift==1&&!control.contact&&control.clip==c["receive_ground_meshy"]&&groundControl.airLift==0,"only an actual aerial control lands from its contact ("+dir+")");
                // Kick follow-through keeps the contact boundary.
                ballView.position=new Vector3(facing.x*.6f,.18f,facing.z*.6f);
                var cross=Select(Pose(field,"cross",.05/.78,.78,null),2);var crossFollow=Select(Pose(field,"cross",.22/.78,.78,null),2.1);var plainPass=Select(Pose(field,"pass",.22/.62,.62,null),2.2);
                Require(cross.loft==0&&cross.contact&&crossFollow.loft>.8f&&plainPass.loft==0,"cross follows through high only after its native contact; ground pass unchanged ("+dir+")");
                var volley=Select(Pose(field,"volley",.22/.6,.6,null),2.3);Require(volley.volley>.99f&&volley.loft==0,"volley banks away after its contact ("+dir+")");
                var waiting=Select(Pose(goalie,"goalKick",.5,1,null),2.4);ballView.position=new Vector3(facing.x*3f,.4f,facing.z*3f);var kicked=Select(Pose(goalie,"goalKick",.22,1,null),2.5);
                Require(waiting.loft==0&&kicked.loft>.99f,"goal kick follows through only once the actual ball has left the kicker ("+dir+")");
                // Throw-in phases from actual native-shaped JSON (release has no pickup).
                ballView.position=new Vector3(0,2.0f,0);
                WorldPose Json(string extra,double progress){var json="{\"id\":\""+field.id+"\",\"position\":[0,0,0],\"facing\":["+facing.x+",0,"+facing.z+"],\"action\":\"throw\",\"actionId\":\"throw\",\"recovery\":0,\"progress\":"+progress.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\"duration\":1,\"number\":"+field.number+extra+"}";
                    var frame=WorldPhasePresence.ParseFrame("{\"players\":["+json+"]}");return frame.players[0];}
                var pick=Select(Json(",\"holding\":true,\"pickup\":0.2",.1),3);var windUp=Select(Json(",\"holding\":true,\"pickup\":1",.9),3.1);
                var released=Select(Json(",\"holding\":false",.4),3.2);var legacy=Select(Json("",.4),3.3);
                m.Add(new Measurement{stage="throw-selector "+dir,detail="pick bend "+pick.throwBend.ToString("0.00")+" wind arch "+windUp.throwArch.ToString("0.00")+" release whip "+released.throwRelease.ToString("0.00")+" legacy kind "+legacy.kind});
                Require(pick.throwBend>.5f&&pick.kind=="two-hands"&&pick.contact,"holding pickup bends and holds the actual nearby ball ("+dir+")");
                Require(windUp.throwRaise==1&&windUp.throwArch>.5f&&windUp.contact,"holding wind-up raises and arches ("+dir+")");
                Require(released.throwRelease>.5f&&!released.contact&&released.throwBend==0,"actual release JSON without pickup selects the follow-through ("+dir+")");
                Require(legacy.throwRelease==0&&legacy.throwArch==0&&legacy.kind=="two-hands","picture without holding/pickup keeps the legacy two-hands throw ("+dir+")");
                // Keeper save side follows the received facing.
                var gp=Pose(goalie,"save",.5,1,null);gp.contactPoint=Ahead(2,.6f);ballView.position=V(gp.contactPoint);
                var ahead=Select(gp,4);var side=Quaternion.Euler(0,yaw,0)*Vector3.right*1.7f;gp.contactPoint=new double[]{side.x,.6,side.z};var lateral=Select(gp,4.1);
                Require(ahead.clip==c["keeper_low_meshy"]&&lateral.clip==c["keeper_dive_meshy"],"keeper turned "+dir+" meets a ball ahead and dives to its side");
            }
            // Diagonal keeper.
            var diag=Quaternion.Euler(0,45,0);actor.transform.SetPositionAndRotation(new Vector3(0,animation.RootHeight,0),diag);
            var d=new WorldPose{id=goalie.id,number=goalie.number,position=new double[]{0,0,0},facing=new double[]{(diag*Vector3.forward).x,0,(diag*Vector3.forward).z},action="save",actionId="save-d",progress=.5,duration=1};
            var dAhead=diag*Vector3.forward*2;d.contactPoint=new double[]{dAhead.x,.6,dAhead.z};Require(Select(d,5).clip==c["keeper_low_meshy"],"diagonal keeper meets a ball straight ahead without the former false dive");
        }finally{UnityEngine.Object.DestroyImmediate(host);UnityEngine.Object.DestroyImmediate(ballView.gameObject);}
    }
    static Vector3 V(double[] a){return new Vector3((float)a[0],(float)a[1],(float)a[2]);}
}
#endif

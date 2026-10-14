#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using System.Globalization;
using System.Reflection;
using UnityEngine;
using UnityEngine.Playables;
using Doppel6.Probe;
// Natural-motion evidence on the actual rig through ProbeBridge.WorldCommand.
// Controlled fixtures are hand-built 20 Hz native-shaped pictures (labelled
// origin=controlled); native cases replay actual captured native pictures
// (native-motion/*.json, origin=native). Pictures are blended to 60 Hz with
// the real WorldViewPlayback.Blend, exactly like the live display buffer, and
// sent as exact (paused) pictures. Only the presentation is measured; no
// native data, clock or rule is produced here. Uses existing bridge members
// only, so the same suite measures the baseline and the candidate.
public static class NaturalMotionDiagnostics {
    const BindingFlags Flags=BindingFlags.Instance|BindingFlags.NonPublic|BindingFlags.Public;
    static readonly CultureInfo Inv=CultureInfo.InvariantCulture;
    [Serializable] public class Window {public string name;public int frames,stanceFrames,moving;public float soleMinAction,speedMean,glideMean,glideP90,glideMax,glideRatio,footAxisMean,footAxisMax,footHipsMean,footHipsMax,kneePoleMean,kneePoleMax,chestMean,chestMax,pelvisMean,soleMin,thighStepMax,thighStepP99,hipsYawStepMax,jointSpeedMax,lockOffsetMax;public float handHeadMin,supportDropMax,supportGlideMean,supportGlideRatio,supportGlideP90;public int supportFrames;public int soleBelow,doubleFloatSlow,turnStarts,clipChanges,familySwitches,handsHigh;public float turnStartsPerSecond,familySwitchesPerSecond;public string thighStepAt,jointSpeedAt,soleMinAt,glideMaxAt,doubleFloatAt,handAt;public float seconds;
        // r3: joint speed of the rig itself. root = bone rotation relative to the
        // actor root (the received facing removed); local = relative to the parent
        // bone; rootYawRate = the authoritative received facing's own turn rate.
        // footSpeedRel: horizontal ankle speed relative to the root (m/s).
        public float jointSpeedRootMax,jointSpeedRootP99,jointSpeedLocalMax,rootYawRateMax,thighStepRootMax,footSpeedRelMax;public string jointSpeedRootAt,jointSpeedLocalAt,footSpeedRelAt;public int actionFrames,inertiaEvents,contactFrames;public float contactJointRootMax;public string contactJointRootAt;
        // r7: moving pictures below 1.9 m/s (the double-float rule's own sample base) and the
        // fastest weight-bearing sole sample with its context (lock states, clips).
        public int slowMoving;public float supportGlideMax;public string supportGlideMaxAt;
        // r11: every picture incl. actions and native contact pictures: the lowest sole
        // (both feet's sole contour/heel/toe points every picture, the skinned sole where
        // sampled), the fastest weight-bearing sole on the turf (support burst; only the
        // contact limb itself is left out in a contact picture) and the contact limb's
        // distance to the received contact point in reachable native contact pictures.
        public float soleLowestAll=9,burstMax,contactErrorMax,bootGapMax;public int burstFrames,contactMet,contactPictures;public string soleLowestAllAt,burstMaxAt,contactErrorAt,bootGapAt;}
    [Serializable] public class Case {public string name,group,origin,note;public int rate=60;public float travel,speed,facing;public string[] clips;public Window whole,start,cruise,stop;public Window[] transitions;public string poseHash;
        // r13: every foot-action contact of the fixture with its approach, entry, contact and return continuity.
        public FootAction[] footActions;
        // r15: every ready countdown (passReady/kickReady) that ended without its own contact.
        public ReadyAbort[] readyAborts;
        // r20: every received countdown end, classified by the R20 countdown semantics (Countdowns).
        public Countdown[] countdowns;
        // r21: foul offender windows, backward presentation (field players) and kick facing of a native player.
        public FoulWindow[] fouls;public Reversal reversal;public KickFacing[] kicks;
        // r132 (B02): stride band statistics of a native player over its moving pictures.
        public Bands bands;}
    // r132 (B02): changes of the Unity stride band (walk/run/sprint/back/side/idle) over the moving pictures of a native player, per
    // minute of moving time; dwell of the walking band (mean seconds, share under 0.25 s) and of all bands.
    [Serializable] public class Bands {public int changes,shortDwells,walkDwells,walkShort;public float movingSeconds,changesPerMinute,walkDwellMean,dwellMean;}
    // r21: one foul offender window of a native player: from its first received foulOffender picture to OffenderAfter after
    // its last one (the exit into the following action and the walk-off). floatMax: the largest lower-foot support clearance
    // (the lower foot's skinned sole contour above the turf, bones without a contour: both soles in the air, the floating offender);
    // sinkMin: the lowest support clearance; soleMin/soleMax: the skinned sole (lowest vertex, every sixth picture);
    // jointRootMax: the eight measured bones with the received root yaw removed; pelvisRateMax: the pelvis' vertical speed
    // (m/s, mean thigh height); turfShiftMax: the largest pelvis correction of FootballAnimation.TurfShift (0 without it).
    // B11 (r132): armMax: the largest upper-arm abduction of the offender pictures once the stumble carries half the mix (armSettledMax: at full weight;
    // foul_stumble_meshy alone holds 55-85 deg, the T-pose the user saw); weightSumMin/Max and nanPictures: the mixer weights.
    [Serializable] public class FoulWindow {public float start,exit,end,floatMax=-9,sinkMin=9,soleMin=9,soleMax=-9,jointRootMax,pelvisRateMax,turfShiftMax,armMax=-9,armSettledMax=-9,weightSumMin=9,weightSumMax=-9;public string floatAt,sinkAt,soleAt,jointRootAt,pelvisAt,exitTo,armAt;public int frames,soleFrames,nanPictures;}
    // r21: backward presentation of a native field player over display pictures moving at least ReverseSpeed: pictures whose
    // Unity stride is the backward family, split by the received travel relative to the received facing (backReceived: at
    // least FootballLocomotion.BackOff, the received data itself is backward; backUnity: below it, Unity holds a backward
    // stride the received data does not show), and pictures whose received travel is reversed (more than 135 deg) at all.
    [Serializable] public class Reversal {public int moving,back,backReceived,backUnity,receivedReversed;public float backUnityRelMin=180,backUnityLongest;public string backUnityAt,backUnityLongestAt;}
    // r21: facing at a native kick contact (pass, highPass, cross, shot, freeKick, volley at progress 0 in a received picture):
    // the shown root yaw against the actual ball path (received ball, contact picture to two pictures later), in the last
    // display picture before the contact, at it and the largest over KickExit after it (degrees, 0 = facing the ball path).
    [Serializable] public class KickFacing {public string action;public float clock,ballYaw,before=-1,at=-1,exitMax;public bool reversedAtContact;}
    // r20: one received countdown end: a passReady/kickReady picture whose next received picture is not the same countdown
    // instance continuing in the same kind (same action, id and a progress that does not fall). Classified from the
    // received pictures only (cls, R20Countdown*), measured on the display over AbortWindow after the last ready picture:
    // the same eight bones (received root yaw removed), the kicking ankle's root-relative forward travel, the lowest sole
    // and the fastest weight-bearing sole (support burst), as the r15 and r11 rules measure them.
    [Serializable] public class Countdown {public string from,to,fromId,toId,cls,evidence,jointRootAt,burstAt;public float clock,progress,nextProgress,step,expectedStep,duration;public bool durationKnown,kindFlip;public int frames;public float jointRootMax,forwardCarry,soleRise,soleLowest=9,burstMax,ankleSpeedMax;}
    // r15: one aborted ready countdown: the last ready picture (clock, action, progress) and what followed, measured over
    // AbortWindow after it: the largest root-relative joint speed (the same eight bones, received root yaw removed), the
    // kicking ankle's root-relative forward travel beyond its last ready position (along the received facing: a wind-up that
    // swings on through a ball it never kicks) and the rise of its sole above its last ready clearance.
    [Serializable] public class ReadyAbort {public string from,to,kind,jointRootAt;public float clock,progress,jointRootMax,forwardCarry,soleRise;public int frames;
        // r18, labelled and reported only (no gate, the abort rule above unchanged): the picture after the last ready picture
        // (action, id, progress) and whether the countdown goes on there under another ready kind with the same id and a
        // progress that does not fall (continues); the received root's turn rate over the window; the largest horizontal
        // world travel (m) and step speed (m/s) of a foot that stays locked from picture to picture in the window (its toe
        // or heel point as locked): a planted foot that a received turn faster than FootballAnimation.PivotRate carries.
        public string nextAction,nextId,lockedDriftAt;public float nextProgress,rootYawRateMax,lockedDrift,lockedDriftSpeed;public bool continues;}
    // r13: one native foot contact (the first contact picture of a pass, shot, receive, tackle or goal-kick release and the
    // contact pictures after it): the largest root-relative joint speed (the same eight bones, the received root yaw removed)
    // and the contact limb's root-relative ankle speed (3-D) in the approach (ApproachWindow before the entry), the entry (the
    // single step into the first contact picture), the contact pictures and the return (ReturnWindow after the last one);
    // rootYawRateMax: the received root's own turn rate over all four (native, never a rig motion).
    [Serializable] public class FootAction {public string action,kind,entryContext;public float entryClock,lastContactClock,rootYawRateMax;public float[] jointRootMax=new float[4],footSpeedMax=new float[4];public string[] jointRootAt=new string[4];public int[] frames=new int[4];
        // r20: the action's received native event time (-1 unknown), the display pictures before the entry that showed its
        // lead, and at the entry picture: the contact limb's distance to its target, the boot surface's distance to the
        // received ball surface (contact point = ball centre) and, apart from it, to the displayed ball's surface.
        public double eventAt=-1;public int leadFrames;public float entryContactError=-1,entryBootGap=-1,entryBallGap=-1;
        // r20: the action shown in the display picture before the entry (the predecessor the binding continues).
        public string entryFrom;}
    [Serializable] public class Check {public string name;public bool passed;public double value,limit;}
    [Serializable] public class Report {public string label,sourceId,unity,device,note,gateNote,clipFields;public Case[] cases;public Check[] determinism,gates;public string[] images,recordings;
        // r7: the support-transition gates, reported apart from the unchanged gates above.
        public string supportGateNote;public Check[] supportGates;public SupportSample[] supportSamples;
        // r11: the contact-recovery and support-transfer gates, reported apart from both sets above.
        public string contactGateNote;public Check[] contactGates;
        // r13: the foot-action continuity gates, reported apart from all three sets above.
        public string continuityGateNote;public Check[] continuityGates;
        // r15: interrupted preparation, plant edge and the eleven R13 regression windows, reported apart from all four sets above.
        public string r15GateNote;public Check[] r15Gates;public SupportSample[] r15SupportSamples;
        // r20: the active R20 contract gates (event time, received contact preparation, countdown semantics), reported
        // apart from every set above; r20Checks: input identity checks; r15Enforcement: how the r15 set is enforced.
        public string r20GateNote,r15Enforcement;public Check[] r20Gates,r20Checks;public SupportSample[] r20SupportSamples;
        // r21: the R21 gates (user defects of 12.10.2026), reported apart from every set above.
        public string r21GateNote;public Check[] r21Gates;
        // r132: the native132 capture gates (every foot-action window of the fresh production-bridge captures, locked to Release 131).
        public string r132GateNote;public Check[] r132Gates;}
    // r7: the samples behind each support-transition gate window.
    [Serializable] public class SupportSample {public string window;public int frames,moving,slowMoving,stanceFrames,supportFrames,doubleFloatSlow,soleBelow;public float speedMean,supportGlideMean,supportGlideRatio,supportGlideP90,supportGlideMax,kneePoleMean,soleMin,supportDropMax;public string supportGlideMaxAt,doubleFloatAt;}
    sealed class Sample {public float abduction=float.NaN,weightSum=float.NaN;public bool nanWeights;public double clock;public Vector3 root,facing,travel;public float speed,turfShift,turfClear=float.NaN;public Vector3[] ankle=new Vector3[2],toe=new Vector3[2],knee=new Vector3[2],thigh=new Vector3[2];public float[] ankleClear=new float[2],toeClear=new float[2],supportClear=new float[2];public Vector3 head,shoulderMid;public Vector3[] hand=new Vector3[2];public float supportDrop,solePredicted=float.NaN,groundSole=float.NaN;public Quaternion[] rot,rel,loc;public float rootYaw,strideScale;public Vector3[] ankleLocal=new Vector3[2];public Vector3 hipsRight,chestRight;public string clip,baseClip,mode,stride,action,soleBone,lockState;public float actionWeight;public Vector3 facingRaw;public int inertia;public bool contactPicture;public float rawStep,rawJump;public double phase;public float sole=float.NaN,lockOffset=-1;public bool moving;
        // r5: largest root-relative joint speed per pose stage (FootballAnimation.Probe; empty without it) and the ankles after the motion layers (stage 1).
        // r18: sub-stages 5-8 of stage 3 (after the first support pass, the foot lock, the second support pass with the sole
        // lift, the swing clearance; stage 3 follows the turf plant), the rig's swivel diagnostics (FootballRig.swivel*: pole,
        // least, direct, chord, angle; -1 unknown) and each foot's lock-release shift (m) and turn (deg) this picture.
        public float[] subStage,swivel,releaseShift,releaseTurn,lifts;public int[] subStageBone;
        public float[] stage;public int[] stageBone;public Vector3[] layerAnkle;public double poseTime,stridePhase;public float[] stageClear,kneeMove;public Vector3[] legGeometry;
        // r11: rendered contact (kind, contact flag, reach, limb error), the received contact
        // point as displayed, the pelvis contact drop and release weight of the rig.
        public string poseKind;public bool poseContact,poseReach,hasTarget,footContact;public float poseContactError,contactDrop,releaseWeight;public Vector3 target;public Vector3[] tip=new Vector3[2];
        // r15: standing-foot plant of the rig (0 none, 1 left, 2 right) and its anchor error, the received progress and action id.
        public int plant;public float plantError,progress;public string actionId;
        // r20: the display pose's received native timing (actionAt when known) and its display lead (seconds until a
        // received foot contact ahead within the interval, -1 none), read by reflection (absent before R20); the displayed ball.
        public double actionAt=-1;public bool actionAtKnown;public float leadIn=-1;public string leadAction;public Vector3 ball;}
    // ---- bridge access -------------------------------------------------
    static ProbeBridge bridge;static string raw;static int sequence;static bool logState;
    static T Field<T>(string name)=>(T)typeof(ProbeBridge).GetField(name,Flags).GetValue(bridge);
    // r20: the optional R20 picture fields by name, so the same suite still measures a source without them (R18 baseline).
    static T Get<T>(WorldPose p,string name,T fallback){var f=typeof(WorldPose).GetField(name);return f!=null&&p!=null?(T)f.GetValue(p):fallback;}
    static void Set(WorldPose p,string name,object value){typeof(WorldPose).GetField(name)?.SetValue(p,value);}
    static bool TimingContract=>typeof(WorldPose).GetField("actionAtKnown")!=null;
    static void Send(WorldCommand c){Debug.unityLogger.logEnabled=false;try{bridge.WorldCommand(JsonUtility.ToJson(c));}finally{Debug.unityLogger.logEnabled=logState;}
        // r20: a display picture the bridge rejects (validation) would silently keep the last pose: counted (r20Checks).
        if(c.kind=="frame"&&c.frame!=null){var view=Field<WorldViewState>("worldView");if(view==null||view.Frame.sequence!=c.frame.sequence)rejected++;}}
    static int rejected;
    static void Drop(){var world=Field<Transform>("world");if(world!=null)UnityEngine.Object.DestroyImmediate(world.gameObject);}
    // Indices 0-7 are the measured joints of the joint-speed check; arms, head and hands are posture only.
    static readonly string[] Bones={"Hips","LeftUpLeg","RightUpLeg","LeftLeg","RightLeg","LeftFoot","RightFoot","Spine2","LeftArm","RightArm","Head","LeftHand","RightHand"};
    // r5: per-stage capture of the composed pose through FootballAnimation.Probe
    // (read by reflection, so the same suite still measures a source without it).
    sealed class StageTap {
        public readonly Quaternion[][] cur=new Quaternion[11][],prev=new Quaternion[11][];public readonly bool[] got=new bool[11],had=new bool[11];public readonly Vector3[] ankle=new Vector3[2];public readonly float[] clear=new float[10];public readonly Vector3[] knee=new Vector3[10],foot=new Vector3[10],hip=new Vector3[10];readonly Transform actor;readonly Transform[] bones;readonly FootballAnimation anim;
        public StageTap(Transform actor,FootballAnimation anim){this.actor=actor;this.anim=anim;bones=BoneSet(actor);for(int i=0;i<11;i++){cur[i]=new Quaternion[8];prev[i]=new Quaternion[8];}var field=typeof(FootballAnimation).GetField("Probe");if(field!=null)field.SetValue(anim,(Action<int>)Capture);}
        void Capture(int st){if(st<0||st>10)return;var unturn=Quaternion.Inverse(actor.rotation);for(int k=0;k<8;k++)cur[st][k]=unturn*bones[k].rotation;got[st]=true;if(st>4)return;if(st==1){ankle[0]=bones[5].position;ankle[1]=bones[6].position;}for(int f=0;f<2;f++){clear[st*2+f]=Mathf.Min(anim.ground.AnkleClearance(f),anim.ground.ToeClearance(f));knee[st*2+f]=unturn*(bones[3+f].position-actor.position);hip[st*2+f]=unturn*(bones[1+f].position-actor.position);foot[st*2+f]=unturn*(bones[5+f].position-actor.position);}}
        // Stage speeds against the previous picture (0 for a stage not sampled in both).
        public void Take(Sample s,Sample last){
            s.stage=new float[5];s.stageBone=new int[5];s.layerAnkle=new[]{ankle[0],ankle[1]};s.stageClear=(float[])clear.Clone();s.kneeMove=new float[4];for(int f=0;f<2;f++){s.kneeMove[f]=Vector3.Distance(knee[4+f],knee[6+f]);s.kneeMove[2+f]=Vector3.Distance(foot[4+f],foot[6+f]);}s.legGeometry=new Vector3[12];for(int f=0;f<2;f++){s.legGeometry[f*6]=hip[4+f];s.legGeometry[f*6+1]=knee[4+f];s.legGeometry[f*6+2]=foot[4+f];s.legGeometry[f*6+3]=hip[6+f];s.legGeometry[f*6+4]=knee[6+f];s.legGeometry[f*6+5]=foot[6+f];}double dt=last!=null?s.clock-last.clock:0;
            s.subStage=new float[6];s.subStageBone=new int[6];
            for(int st=0;st<11;st++){if(got[st]&&had[st]&&dt>0)for(int k=0;k<8;k++){float v=Quaternion.Angle(cur[st][k],prev[st][k])/(float)dt;if(st<5){if(v>s.stage[st]){s.stage[st]=v;s.stageBone[st]=k;}}else if(v>s.subStage[st-5]){s.subStage[st-5]=v;s.subStageBone[st-5]=k;}}
                if(got[st]){Array.Copy(cur[st],prev[st],8);had[st]=true;}got[st]=false;}
        }
    }
    // ---- fixture pictures ------------------------------------------------
    sealed class Track {public double[] clock;public Vector3[] position,facing;public bool owner;public Func<double,Vector3,Vector3,double[]> ball;}
    static WorldConfig Config(string session){
        var config=JsonUtility.FromJson<WorldConfig>(raw);config.session=session;config.initial.session=session;config.initial.phase="paused";config.initial.sequence=sequence=1;config.initial.clock=10;config.initial.owner="";config.quality="standard";
        // Everyone else stands still, well away from the measured player.
        for(int i=0;i<config.initial.players.Length;i++){var p=config.initial.players[i];p.position=new double[]{-24+i*4.0,0,17};p.facing=new double[]{1,0,0};p.action="idle";p.actionId="idle";p.moving=false;p.contactPoint=null;}
        config.initial.ball=new double[]{20,.29,18};return config;
    }
    static double[] D(Vector3 v)=>new double[]{v.x,v.y,v.z};
    static Vector3 V(double[] p)=>new Vector3((float)p[0],(float)p[1],(float)p[2]);
    // Plays native-shaped 20 Hz pictures through the real display blend at 60 Hz.
    // rate: display frames per second (60 by default; 30 and 120 check other
    // render cadences of the same received pictures).
    static IEnumerable<WorldFrame> Display(List<WorldFrame> pictures,int rate=60){
        yield return pictures[0];double start=pictures[0].clock,end=pictures[pictures.Count-1].clock;int k=1;
        for(int n=1;start+n/(double)rate<=end+1e-9;n++){double t=start+n/(double)rate;while(k<pictures.Count-1&&pictures[k].clock<t-1e-9)k++;
            var a=pictures[k-1];var b=pictures[k];double span=b.clock-a.clock;yield return WorldViewPlayback.Blend(a,b,span>0?Math.Clamp((t-a.clock)/span,0,1):1);}
    }
    static WorldFrame Picture(WorldFrame template,double clock){var f=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(template));f.clock=clock;f.phase="live";return f;}
    static Vector3 Facing(float degrees)=>Quaternion.AngleAxis(degrees,Vector3.up)*Vector3.right;
    // Speed profile: idle, linear acceleration, cruise, linear braking, idle.
    static List<(double t,Vector3 p,Vector3 f)> Straight(float travel,float speed,float facing,double idle=.6,double accel=.5,double cruise=2,double brake=.5,double rest=.8){
        var list=new List<(double,Vector3,Vector3)>();var dir=Facing(facing+travel);var face=Facing(facing);double total=idle+accel+cruise+brake+rest;var p=Vector3.zero;
        float Speed(double t){if(t<idle)return 0;t-=idle;if(t<accel)return (float)(speed*t/accel);t-=accel;if(t<cruise)return speed;t-=cruise;if(t<brake)return (float)(speed*(1-t/brake));return 0;}
        for(double t=0;t<=total+1e-9;t+=.05){list.Add((t,p,face));p+=dir*(Speed(t)+Speed(t+.05))*.5f*.05f;}
        return list;
    }
    // r3 fixture paths. Course: speed(t) along an absolute travel heading(t);
    // the received facing turns toward face(t) at faceRate deg/s (0 = at once).
    static List<(double t,Vector3 p,Vector3 f)> Course(double total,Func<double,float> speed,Func<double,float> heading,Func<double,float> face,float faceRate=0){
        var list=new List<(double,Vector3,Vector3)>();var p=Vector3.zero;float facing=face(0);
        for(double t=0;t<=total+1e-9;t+=.05){facing=faceRate>0?Mathf.MoveTowardsAngle(facing,face(t),faceRate*.05f):face(t);list.Add((t,p,Facing(facing)));p+=Facing(heading(t))*(speed(t)+speed(t+.05))*.5f*.05f;}
        return list;
    }
    // Curve: the facing follows the tangent, which turns at rate(t) deg/s.
    static List<(double t,Vector3 p,Vector3 f)> Curve(double total,Func<double,float> speed,Func<double,float> rate){
        var list=new List<(double,Vector3,Vector3)>();var p=Vector3.zero;float heading=0;
        for(double t=0;t<=total+1e-9;t+=.05){list.Add((t,p,Facing(heading)));heading+=rate(t)*.05f;p+=Facing(heading)*speed(t)*.05f;}
        return list;
    }
    static float Ramp(double t,double a,double b,float from,float to)=>t<=a?from:t>=b?to:(float)(from+(to-from)*(t-a)/(b-a));
    // A native-shaped action on the subject's pictures between from and
    // from+duration (fixture seconds): progress 0..1 and the native duration.
    // contact: the contact point is the foot point at the action start; the
    // ball leaves along the facing at ballSpeed (0 = carried on). incoming:
    // the ball arrives at the contact point over the second before it.
    static void Act(List<WorldFrame> pics,int subject,double from,double duration,string action,string id,bool contact,float ballSpeed=0,bool incoming=false){
        Vector3 Ahead(WorldPose pose){var f=V(pose.facing);f.y=0;return f.sqrMagnitude>1e-6f?f.normalized:Vector3.right;}
        var first=pics.Find(w=>w.clock-10>=from-1e-9);if(first==null)return;var pp=first.players[subject];var point=V(pp.position)+Ahead(pp)*.45f;point.y=.29f;var away=Ahead(pp);
        foreach(var w in pics){
            double t=w.clock-10;var pose=w.players[subject];
            if(t>=from-1e-9&&t<from+duration-1e-9){pose.action=action;pose.actionId=id;pose.progress=Math.Clamp((t-from)/duration,0,1);pose.duration=duration;if(contact)pose.contactPoint=D(point);}
            if(!contact)continue;
            if(ballSpeed>0&&t>=from-1e-9){var b=point+away*ballSpeed*(float)(t-from);b.x=Mathf.Clamp(b.x,-33,33);b.z=Mathf.Clamp(b.z,-21,21);b.y=.29f;w.ball=D(b);w.owner="";w.ballInFlight=true;}
            // The ball before an incoming contact flies in toward the contact point.
            if(incoming&&t<from-1e-9&&t>=from-1){var b=point+away*(float)(from-t)*10f;b.y=.29f;w.ball=D(b);w.owner="";w.ballInFlight=true;}
        }
    }
    // ---- measuring -----------------------------------------------------
    static Transform[] BoneSet(Transform actor){var all=actor.GetComponentsInChildren<Transform>();return Array.ConvertAll(Bones,n=>Array.Find(all,t=>t.name=="mixamorig:"+n));}
    static Sample Measure(int index,Transform actor,FootballAnimation anim,FootballLocomotion loco,WorldFrame frame,Sample last,bool sole,StageTap tap=null){
        var b=BoneSet(actor);var s=new Sample{clock=frame.clock,root=actor.position,facing=V(frame.players[index].facing)};s.facing.y=0;s.facing.Normalize();
        float scale=actor.lossyScale.y;
        Transform Toe(int f){var foot=b[5+f];return foot.childCount>0?foot.GetChild(0):foot;}
        for(int f=0;f<2;f++){var toeBone=Toe(f);s.tip[f]=toeBone.childCount>0?toeBone.GetChild(0).position:toeBone.position;}
        for(int f=0;f<2;f++){s.thigh[f]=b[1+f].position;s.knee[f]=b[3+f].position;s.ankle[f]=b[5+f].position;s.toe[f]=Toe(f).position;s.ankleClear[f]=(s.ankle[f].y-actor.position.y)-anim.ground.ankle*scale;s.toeClear[f]=(s.toe[f].y-actor.position.y)-anim.ground.toe*scale;}
        for(int f=0;f<2;f++){s.supportClear[f]=anim.ground.SupportClearance(f);s.hand[f]=b[11+f].position;}s.head=b[10].position;s.shoulderMid=(b[8].position+b[9].position)*.5f;s.supportDrop=anim.SupportDrop;
        s.rot=Array.ConvertAll(b,t=>t.rotation);var unturn=Quaternion.Inverse(actor.rotation);s.rel=Array.ConvertAll(b,t=>unturn*t.rotation);s.loc=Array.ConvertAll(b,t=>t.localRotation);s.rootYaw=actor.eulerAngles.y;
        for(int f=0;f<2;f++)s.ankleLocal[f]=unturn*(b[5+f].position-actor.position);
        s.hipsRight=b[2].position-b[1].position;s.chestRight=b[9].position-b[8].position;
        s.mode=loco.Mode;s.stride=loco.StrideMode;s.strideScale=loco.StrideScale;s.contactPicture=ContactPicture(frame.players[index]);s.footContact=FootContactPicture(frame.players[index]);s.action=frame.players[index].action;s.phase=loco.Phase;s.speed=loco.Speed;
        var poses=Field<Array>("renderedPoses");var rp=poses?.GetValue(index);if(rp!=null){s.clip=(string)rp.GetType().GetField("clip").GetValue(rp);s.baseClip=(string)rp.GetType().GetField("baseClip").GetValue(rp);s.actionWeight=(float)rp.GetType().GetField("actionWeight").GetValue(rp);s.poseTime=(double)rp.GetType().GetField("time").GetValue(rp);s.stridePhase=(double)rp.GetType().GetField("stridePhase").GetValue(rp);
            var rt=rp.GetType();s.poseKind=(string)rt.GetField("kind").GetValue(rp);s.poseContact=(bool)rt.GetField("contact").GetValue(rp);s.poseReach=(bool)rt.GetField("reachable").GetValue(rp);s.poseContactError=(float)rt.GetField("contactError").GetValue(rp);}
        // r15: rig plant state (FootballRig.planted/plantRight, read only) and the received progress/action id.
        {var rig=anim.rig;var pf=typeof(FootballRig).GetField("planted",Flags);var pr=typeof(FootballRig).GetField("plantRight",Flags);if(pf!=null&&pr!=null&&(bool)pf.GetValue(rig))s.plant=(bool)pr.GetValue(rig)?2:1;if(rp!=null){var pe=rp.GetType().GetField("plantError");if(pe!=null)s.plantError=(float)pe.GetValue(rp);}s.progress=(float)frame.players[index].progress;s.actionId=frame.players[index].actionId;}
        {var wp=frame.players[index];s.actionAt=Get(wp,"actionAt",-1.0);s.actionAtKnown=Get(wp,"actionAtKnown",false);s.leadIn=(float)Get(wp,"leadIn",-1.0);s.leadAction=Get<string>(wp,"leadAction",null);s.ball=new Vector3((float)frame.ball[0],ProbeBridge.DisplayHeight(frame.ball[1]),(float)frame.ball[2]);}
        var cp=frame.players[index].contactPoint;if(cp!=null&&cp.Length==3){s.hasTarget=true;s.target=new Vector3((float)cp[0],ProbeBridge.DisplayHeight(cp[1]),(float)cp[2]);}
        {var rt=typeof(FootballRig);var sp=rt.GetField("swivelPole");if(sp!=null){s.swivel=new[]{(float)sp.GetValue(anim.rig),(float)rt.GetField("swivelLeast").GetValue(anim.rig),(float)rt.GetField("swivelDirect").GetValue(anim.rig),(float)rt.GetField("swivelChord").GetValue(anim.rig),(float)rt.GetField("swivelAngle").GetValue(anim.rig)};}
         var rs=typeof(FootballAnimation).GetField("ReleaseShiftShown");if(rs!=null){s.releaseShift=(float[])((float[])rs.GetValue(anim)).Clone();s.releaseTurn=(float[])((float[])typeof(FootballAnimation).GetField("ReleaseTurnShown").GetValue(anim)).Clone();}
         var su=typeof(FootballAnimation).GetField("SwingUpShown");if(su!=null){var A=typeof(FootballAnimation);var a1=(float[])su.GetValue(anim);var a2=(float[])A.GetField("CatchDropShown").GetValue(anim);var a3=(float[])A.GetField("ReleaseRaiseShown").GetValue(anim);s.lifts=new[]{a1[0],a1[1],a2[0],a2[1],a3[0],a3[1]};}}
        var dropField=typeof(FootballAnimation).GetField("contactDrop",Flags);if(dropField!=null)s.contactDrop=(float)dropField.GetValue(anim);s.releaseWeight=anim.ReleaseWeight;
        var lockProp=typeof(FootballAnimation).GetProperty("FootLockOffset");if(lockProp!=null)s.lockOffset=(float)lockProp.GetValue(anim);var stateProp=typeof(FootballAnimation).GetProperty("FootLockState");if(stateProp!=null)s.lockState=(string)stateProp.GetValue(anim);var inertiaProp=typeof(FootballAnimation).GetProperty("InertiaEvents");if(inertiaProp!=null)s.inertia=(int)inertiaProp.GetValue(anim);var rawStepProp=typeof(FootballAnimation).GetProperty("RawStep");if(rawStepProp!=null){s.rawStep=(float)rawStepProp.GetValue(anim);s.rawJump=(float)typeof(FootballAnimation).GetProperty("RawJump").GetValue(anim);}
        {var ts=typeof(FootballAnimation).GetProperty("TurfShift");if(ts!=null)s.turfShift=(float)ts.GetValue(anim);}
        // B11 (r132): upper-arm abduction (the more raised arm) and the mixer weights of the composed picture (sum, NaN).
        {s.abduction=Mathf.Max(FootballAnimation.ArmAbduction(actor,false),FootballAnimation.ArmAbduction(actor,true));var wf=typeof(FootballAnimation).GetField("weights",Flags);if(wf!=null){float sum=0;bool nan=false;foreach(var w in (float[])wf.GetValue(anim)){sum+=w;nan|=float.IsNaN(w)||float.IsInfinity(w);}s.weightSum=sum;s.nanWeights=nan;}}
            // (r21 c10) the lowest point of the lower foot: sole contour, ankle and toe-base bones (a boot standing on its toe is
        // grounded; the toe-tip bone is not used, it read 0 on the raised pointed stumble boot).
        {float Foot(int f){float c=anim.ground.SolePointClearance(f),b=anim.ground.Clearance(f);return float.IsNaN(c)?b:Mathf.Min(c,b);}s.turfClear=Mathf.Min(Foot(0),Foot(1));}
        if(last!=null&&frame.clock>last.clock){var d=s.root-last.root;d.y=0;s.travel=d/(float)(frame.clock-last.clock);}else s.travel=last?.travel??Vector3.zero;
        tap?.Take(s,last);
        s.moving=s.travel.magnitude>.2f;
        if(sole){var groundSkin=FootballGround.GroundSkin(actor);detail=groundSkin==null?new Func<int,string>(anim.ground.VertexDetail):null;s.sole=FootballGround.VisibleLowestVertex(actor)+actor.position.y;if(groundSkin!=null)s.groundSole=FootballGround.LowestVertex(actor)+actor.position.y;s.solePredicted=Mathf.Min(anim.ground.SolePointClearance(0),anim.ground.SolePointClearance(1));if(s.sole< -.01f)s.soleBone=LowestBone(actor)+" predicted="+s.solePredicted.ToString("0.0000",Inv)+" rootY="+actor.position.y.ToString("0.0000",Inv)+" sole="+anim.ground.Sole.ToString("0.0000",Inv)+" contour="+anim.ground.SolePointCount(0)+"/"+anim.ground.SolePointCount(1)+" skins="+actor.GetComponentsInChildren<SkinnedMeshRenderer>().Length+" weights="+actor.GetComponentInChildren<SkinnedMeshRenderer>().sharedMesh.boneWeights.Length+" readable="+actor.GetComponentInChildren<SkinnedMeshRenderer>().sharedMesh.isReadable+(groundSkin!=null?" ground="+groundSkin.sharedMesh.name+" groundSole="+s.groundSole.ToString("0.0000",Inv):"");
            // r22 (Klares Low-Poly): the drawn skin against its ground skin (release mesh, same pose), the reachable contact boot on the received ball (r11 rule).
            if(groundSkin!=null)VisibleSurfaceProbe.Current?.Picture(actor,frame.clock.ToString("0.000",Inv)+" "+s.action,s.action=="slide"?"slide":Loco(s.action)?"locomotion":"action",true,s.poseContact&&s.poseReach&&s.hasTarget&&(s.poseKind=="foot"||s.poseKind=="left-foot")?(s.poseKind=="left-foot"?0:1):-1,0,s.target);}
        return s;
    }
    // Bone carrying the lowest skinned vertex (diagnostics of a sole below the turf).
    static Func<int,string> detail;
    static string LowestBone(Transform actor){
        string best=null;float lowest=float.MaxValue;var mesh=new Mesh();int at=-1;
        foreach(var r in actor.GetComponentsInChildren<SkinnedMeshRenderer>()){if(r.sharedMesh==null||FootballGround.IsGroundSkin(r))continue;r.BakeMesh(mesh,false);var v=mesh.vertices;var weights=r.sharedMesh.boneWeights;
            for(int i=0;i<v.Length;i++){float y=(r.transform.position+r.transform.rotation*v[i]).y;if(y<lowest&&i<weights.Length){lowest=y;var b=weights[i];best=r.bones[b.boneIndex0]?.name;at=i;}}}
        UnityEngine.Object.DestroyImmediate(mesh);var g=actor.GetComponentInChildren<SkinnedMeshRenderer>();return best+" vertex="+at+" standing="+(FootballGround.standing.TryGetValue(at,out var h)?h.ToString("0.000",Inv):"?")+" "+detail?.Invoke(at)+" quality="+g.quality;
    }
    // The native contact window of a foot action (FootballPresentation: pass,
    // shot 0.09 s; receive, control, tackle 0.12 s after progress 0). In these
    // pictures the limb must meet the received contact point at the native time;
    // their joint speed is reported separately and not part of the rig gates.
    static bool ContactPicture(WorldPose p){
        if(p==null)return false;double age=Math.Clamp(p.progress,0,1)*p.duration;
        switch(p.action){case "pass":case "highPass":case "cross":case "shot":case "freeKick":case "volley":return age<.09;case "receive":case "control":case "tackle":return age<.12;default:return false;}
    }
    // r13: the foot contacts of the continuity measurement: the contact pictures above plus the native goal-kick
    // release (phase follow, FootballPresentation: progress over 0.45 s, contact below 0.09 s). ContactPicture
    // itself (the window left out of the earlier gates) is unchanged.
    static bool FootContactPicture(WorldPose p){if(p==null)return false;if(p.action=="goalKick")return p.phase=="follow"&&Math.Clamp(p.progress,0,1)*.45<.09;return ContactPicture(p);}
    // r11: boot surface around the foot bones that meets a ball (metres; the rig's own model may differ).
    public const float BootSurface=.04f;
    // r20: the boot bones' (ankle-toe base-toe tip) distance to a point (the r11 boot rule's centre distance).
    static float BootDistance(Sample s,Vector3 point,int f)=>Mathf.Min(SegmentDistance(point,s.ankle[f],s.toe[f]),SegmentDistance(point,s.toe[f],s.tip[f]));
    static float SegmentDistance(Vector3 p,Vector3 a,Vector3 b){var ab=b-a;float t=ab.sqrMagnitude>1e-10f?Mathf.Clamp01(Vector3.Dot(p-a,ab)/ab.sqrMagnitude):0;return Vector3.Distance(p,a+ab*t);}
    static float Yaw(Vector3 v){v.y=0;return Mathf.Atan2(v.x,v.z)*Mathf.Rad2Deg;}
    static float Diff(float a,float b){return Mathf.Abs(Mathf.DeltaAngle(a,b));}
    static Vector3 ForwardOf(Vector3 right){var f=Vector3.Cross(right,Vector3.up);f.y=0;return f.sqrMagnitude>1e-8f?f.normalized:Vector3.forward;}
    static bool Loco(string action)=>string.IsNullOrEmpty(action)||action=="idle"||action=="run"||action=="running";
    static Window Summarise(string name,List<Sample> all,int from,int to,bool locomotionOnly=false){
        var w=new Window{name=name,soleMin=float.MaxValue,soleMinAction=float.MaxValue,handHeadMin=float.MaxValue};var glides=new List<float>();var supportGlides=new List<float>();var thigh=new List<float>();var rootJoint=new List<float>();double speedSum=0;float footAxis=0,footHips=0,knee=0,chest=0,pelvis=0;int footN=0,chestN=0;
        string lastClip=null,lastFamily=null;double lastPhase=-1;string lastMode=null;double movingSeconds=0;
        for(int i=Math.Max(1,from);i<Math.Min(all.Count,to);i++){
            var s=all[i];var p=all[i-1];double dt=s.clock-p.clock;if(dt<=0||dt>.04)continue;
            // A received position jump (restart, reset) is a cut, not motion.
            var jump=s.root-p.root;jump.y=0;if(jump.magnitude>.4f)continue;
            if(locomotionOnly&&!(Loco(s.action)&&Loco(p.action)))continue;w.frames++;speedSum+=s.travel.magnitude;if(s.moving){w.moving++;movingSeconds+=dt;}
            var hipsForward=ForwardOf(s.hipsRight);var chestForward=ForwardOf(s.chestRight);
            if(s.moving){float c=Diff(Yaw(chestForward),Yaw(s.facing));chest+=c;chestN++;w.chestMax=Mathf.Max(w.chestMax,c);pelvis+=Mathf.DeltaAngle(Yaw(s.facing),Yaw(hipsForward));}
            for(int f=0;f<2;f++){
                bool stance=Mathf.Min(s.ankleClear[f],s.toeClear[f])<.03f&&Mathf.Min(p.ankleClear[f],p.toeClear[f])<.03f;
                if(stance&&s.moving){
                    // The part of the sole that is lowest carries the contact.
                    Vector3 a=s.toeClear[f]<s.ankleClear[f]?s.toe[f]:s.ankle[f],b=s.toeClear[f]<s.ankleClear[f]?p.toe[f]:p.ankle[f];var d=a-b;d.y=0;float g=d.magnitude/(float)dt;
                    var e=s.toe[f]-p.toe[f];e.y=0;var h=s.ankle[f]-p.ankle[f];h.y=0;g=Mathf.Min(g,Mathf.Min(e.magnitude,h.magnitude)/(float)dt);glides.Add(g);w.stanceFrames++;
                    // Support foot: the weight-bearing sole is the lower one (or both within 1 cm); a low swing foot is no stance.
                    if(s.supportClear[f]<=s.supportClear[1-f]+.01f&&p.supportClear[f]<=p.supportClear[1-f]+.01f){supportGlides.Add(g);w.supportFrames++;if(g>w.supportGlideMax){w.supportGlideMax=g;w.supportGlideMaxAt=(f==0?"left ":"right ")+Context(p,s);}
                        // r11 support burst: the same sample, contact pictures included; there only the contact limb is left out.
                        string kind=s.contactPicture?s.poseKind:p.poseKind;bool limb=(s.contactPicture||p.contactPicture)&&(kind=="left-foot"?f==0:f==1);
                        if(!limb){w.burstFrames++;if(g>w.burstMax){w.burstMax=g;w.burstMaxAt=(f==0?"left ":"right ")+Context(p,s)+" L"+s.supportClear[0].ToString("0.000",Inv)+" R"+s.supportClear[1].ToString("0.000",Inv);}}}
                    if(g>w.glideMax){w.glideMax=g;w.glideMaxAt=(f==0?"left ":"right ")+Context(p,s);}
                    var foot=s.toe[f]-s.ankle[f];foot.y=0;
                    if(foot.sqrMagnitude>1e-6f&&s.travel.sqrMagnitude>.04f){float axis=Diff(Yaw(foot),Yaw(s.travel));axis=Mathf.Min(axis,180-axis);footAxis+=axis;w.footAxisMax=Mathf.Max(w.footAxisMax,axis);float fh=Diff(Yaw(foot),Yaw(hipsForward));footHips+=fh;w.footHipsMax=Mathf.Max(w.footHipsMax,fh);
                        // Knee pole: the knee's bend direction off the hip-ankle line against the foot direction.
                        var line=s.ankle[f]-s.thigh[f];var off=Vector3.ProjectOnPlane(s.knee[f]-s.thigh[f],line.normalized);off.y=0;
                        if(off.magnitude>.02f){float kp=Diff(Yaw(off),Yaw(foot));knee+=kp;w.kneePoleMax=Mathf.Max(w.kneePoleMax,kp);}else knee+=0;
                        footN++;}
                }
            }
            if(s.moving&&s.travel.magnitude<1.9f)w.slowMoving++;
            if(s.moving&&s.travel.magnitude<1.9f&&s.supportClear[0]>.03f&&s.supportClear[1]>.03f){w.doubleFloatSlow++;if(w.doubleFloatAt==null)w.doubleFloatAt=Context(p,s)+" L"+s.supportClear[0].ToString("0.000",Inv)+" R"+s.supportClear[1].ToString("0.000",Inv);}
            w.supportDropMax=Mathf.Max(w.supportDropMax,s.supportDrop);
            // Hands: a moving locomotion body never holds a hand at its face or above its shoulders.
            if(s.moving&&Loco(s.action)){for(int f=0;f<2;f++){float d=Vector3.Distance(s.hand[f],s.head);if(d<w.handHeadMin){w.handHeadMin=d;}bool high=s.hand[f].y>s.shoulderMid.y;if(high){w.handsHigh++;if(w.handAt==null)w.handAt=(f==0?"left ":"right ")+Context(p,s);}}}
            if(!float.IsNaN(s.sole)){bool locomotion=string.IsNullOrEmpty(s.action)||s.action=="idle"||s.action=="run"||s.action=="running";if(locomotion){if(s.sole<w.soleMin){w.soleMin=s.sole;w.soleMinAt=Context(p,s)+" lowest="+s.soleBone;}if(s.sole< -.01f)w.soleBelow++;}else w.soleMinAction=Mathf.Min(w.soleMinAction,s.sole);}
            // r11: lowest sole of every picture, actions and native contact pictures included.
            {float low=Mathf.Min(s.supportClear[0],s.supportClear[1]);string part=s.supportClear[0]<=s.supportClear[1]?"left contour":"right contour";if(!float.IsNaN(s.sole)&&s.sole<low){low=s.sole;part="skinned "+s.soleBone;}if(low<w.soleLowestAll){w.soleLowestAll=low;w.soleLowestAllAt=part+" "+Context(p,s)+(s.contactPicture?" contact picture":"");}}
            if(s.contactPicture){w.contactPictures++;if(s.poseContact&&s.poseReach&&(s.poseKind=="foot"||s.poseKind=="left-foot")){w.contactMet++;if(s.poseContactError>w.contactErrorMax){w.contactErrorMax=s.poseContactError;w.contactErrorAt=s.poseKind+" "+Context(p,s);}
                // The boot (ankle-toe base-toe tip bones plus BootSurface) against the received ball (centre, radius).
                if(s.hasTarget){int f=s.poseKind=="left-foot"?0:1;float d=Mathf.Min(SegmentDistance(s.target,s.ankle[f],s.toe[f]),SegmentDistance(s.target,s.toe[f],s.tip[f]));float gap=Mathf.Abs(d-WorldBallMotion.Radius-BootSurface);if(gap>w.bootGapMax){w.bootGapMax=gap;w.bootGapAt=s.poseKind+" boot-centre "+d.ToString("0.000",Inv)+" "+Context(p,s);}}}}
            float step=Mathf.Max(Quaternion.Angle(s.rot[1],p.rot[1]),Quaternion.Angle(s.rot[2],p.rot[2]));thigh.Add(step);if(step>w.thighStepMax){w.thighStepMax=step;w.thighStepAt=Context(p,s);}w.seconds+=(float)dt;
            w.hipsYawStepMax=Mathf.Max(w.hipsYawStepMax,Diff(Yaw(ForwardOf(s.hipsRight)),Yaw(ForwardOf(p.hipsRight))));
            for(int k=0;k<8;k++){float js=Quaternion.Angle(s.rot[k],p.rot[k])/(float)dt;if(js>w.jointSpeedMax){w.jointSpeedMax=js;w.jointSpeedAt=Bones[k]+" "+Context(p,s);}}
            if(!Loco(s.action)||!Loco(p.action))w.actionFrames++;
            float rootFrame=0;bool contactFrame=s.contactPicture||p.contactPicture;if(contactFrame)w.contactFrames++;
            for(int k=0;k<8;k++){
                float jr=Quaternion.Angle(s.rel[k],p.rel[k])/(float)dt,jl=Quaternion.Angle(s.loc[k],p.loc[k])/(float)dt;
                if(contactFrame){if(jr>w.contactJointRootMax){w.contactJointRootMax=jr;w.contactJointRootAt=Bones[k]+" "+Context(p,s);}continue;}
                rootFrame=Mathf.Max(rootFrame,jr);
                if(jr>w.jointSpeedRootMax){w.jointSpeedRootMax=jr;w.jointSpeedRootAt=Bones[k]+" "+Context(p,s);}
                if(jl>w.jointSpeedLocalMax){w.jointSpeedLocalMax=jl;w.jointSpeedLocalAt=Bones[k]+" "+Context(p,s);}
            }
            if(!contactFrame){rootJoint.Add(rootFrame);w.thighStepRootMax=Mathf.Max(w.thighStepRootMax,Mathf.Max(Quaternion.Angle(s.rel[1],p.rel[1]),Quaternion.Angle(s.rel[2],p.rel[2])));}
            w.rootYawRateMax=Mathf.Max(w.rootYawRateMax,Diff(s.rootYaw,p.rootYaw)/(float)dt);
            for(int f=0;f<2;f++){var d=s.ankleLocal[f]-p.ankleLocal[f];d.y=0;float v=d.magnitude/(float)dt;if(v>w.footSpeedRelMax){w.footSpeedRelMax=v;w.footSpeedRelAt=(f==0?"left ":"right ")+Context(p,s);}}
            w.lockOffsetMax=Mathf.Max(w.lockOffsetMax,s.lockOffset);if(s.inertia>p.inertia)w.inertiaEvents+=s.inertia-p.inertia;
            // A turn start: entering a turn mode, or a turn whose phase restarts.
            bool turn=s.mode!=null&&s.mode.StartsWith("turn-");if(turn&&(lastMode==null||!lastMode.StartsWith("turn-")||s.phase<lastPhase-1e-6||s.mode!=lastMode))w.turnStarts++;
            lastMode=s.mode;lastPhase=s.phase;
            if(lastClip!=null&&s.clip!=lastClip)w.clipChanges++;lastClip=s.clip;
            string family=s.stride=="back"?"back":s.stride=="side"?"side":s.stride=="idle"?lastFamily:"forward";if(lastFamily!=null&&family!=null&&family!=lastFamily)w.familySwitches++;if(family!=null)lastFamily=family;
        }
        if(w.frames>0)w.speedMean=(float)(speedSum/w.frames);
        if(glides.Count>0){glides.Sort();float sum=0;foreach(var g in glides)sum+=g;w.glideMean=sum/glides.Count;w.glideP90=glides[(int)(glides.Count*.9f)];w.glideRatio=w.speedMean>.2f?w.glideMean/w.speedMean:0;}
        if(supportGlides.Count>0){supportGlides.Sort();float sum=0;foreach(var g in supportGlides)sum+=g;w.supportGlideMean=sum/supportGlides.Count;w.supportGlideP90=supportGlides[(int)(supportGlides.Count*.9f)];w.supportGlideRatio=w.speedMean>.2f?w.supportGlideMean/w.speedMean:0;}
        if(thigh.Count>0){thigh.Sort();w.thighStepP99=thigh[Math.Min(thigh.Count-1,(int)(thigh.Count*.99f))];}
        if(rootJoint.Count>0){rootJoint.Sort();w.jointSpeedRootP99=rootJoint[Math.Min(rootJoint.Count-1,(int)(rootJoint.Count*.99f))];}
        if(footN>0){w.footAxisMean=footAxis/footN;w.footHipsMean=footHips/footN;w.kneePoleMean=knee/footN;}
        if(chestN>0){w.chestMean=chest/chestN;w.pelvisMean=pelvis/chestN;}
        // JSON has no NaN: -9 marks an unmeasured sole.
        if(w.soleMin==float.MaxValue)w.soleMin=-9;if(w.handHeadMin==float.MaxValue)w.handHeadMin=-9;if(w.soleMinAction==float.MaxValue)w.soleMinAction=-9;
        w.turnStartsPerSecond=movingSeconds>0?(float)(w.turnStarts/movingSeconds):0;w.familySwitchesPerSecond=movingSeconds>0?(float)(w.familySwitches/movingSeconds):0;
        return w;
    }
    // r3: every transition in the received pictures gets its own window: a start
    // or stop (travel crosses 0.2 m/s), a speed change of more than 1.2 m/s
    // within 0.3 s, a travel cut or a facing change of more than 35 degrees within
    // 0.3 s. Window = event -0.35 s .. +0.6 s, overlapping windows merged. Found
    // from the received root track only, so baseline and candidate share them.
    static Window[] Transitions(List<Sample> all,bool locomotionOnly=false){
        var events=new List<(int i,string kind)>();int n=all.Count;
        for(int i=1;i<n;i++){
            var s=all[i];var q=all[i-1];int j=i;while(j>0&&s.clock-all[j].clock<.3)j--;var p=all[j];
            float v=s.travel.magnitude,u=q.travel.magnitude,w=p.travel.magnitude;
            if(u<.2f&&v>=.2f)events.Add((i,"start"));
            if(u>=.2f&&v<.2f)events.Add((i,"stop"));
            if(Mathf.Abs(v-w)>1.2f)events.Add((i,v>w?"speedup":"slowdown"));
            if(v>.5f&&w>.5f&&Diff(Yaw(s.travel),Yaw(p.travel))>35)events.Add((i,"cut"));
            if(Diff(Yaw(s.facing),Yaw(p.facing))>35)events.Add((i,"facing"));
        }
        var windows=new List<Window>();int from=-1,to=-1;var kinds=new List<string>();
        void Close(){if(from<0)return;var w=Summarise("t"+all[from].clock.ToString("0.00",Inv)+" "+string.Join("+",kinds),all,from,to,locomotionOnly);if(w.frames>0)windows.Add(w);from=-1;kinds.Clear();}
        foreach(var (i,kind) in events){
            int a=i,b=i;while(a>0&&all[i].clock-all[a].clock<.35)a--;while(b<n-1&&all[b].clock-all[i].clock<.6)b++;
            if(from>=0&&a>to)Close();
            if(from<0){from=a;to=b;}else to=Math.Max(to,b);if(!kinds.Contains(kind))kinds.Add(kind);
        }
        Close();return windows.ToArray();
    }
    // r13: foot-action continuity windows (FootAction). Window index 0 approach, 1 entry, 2 contact, 3 return;
    // the same cut rule as Summarise (no step over a received root jump or a gap).
    public const double ApproachWindow=.15,ReturnWindow=.25;
    static readonly string[] FootWindowNames={"approach","entry","contact","return"};
    public const double AbortWindow=.15;public const float AbortCarry=.05f;
    static bool ContactAction(string a)=>a=="pass"||a=="highPass"||a=="cross"||a=="shot"||a=="freeKick"||a=="volley";
    // r18: lock state character of foot q (FootballAnimation.FootLockState: 'L'/'l' locked/free, then 't'/'a' toe/ankle); ' ' unknown.
    static char Lock(string state,int q,int k){if(string.IsNullOrEmpty(state))return ' ';int at=q==0?0:state.IndexOf(' ')+1;return at>0||q==0?(at+k<state.Length?state[at+k]:' '):' ';}
    static ReadyAbort[] ReadyAborts(List<Sample> all){
        var list=new List<ReadyAbort>();int n=all.Count;
        for(int e=1;e<n;e++){
            var p=all[e-1];var s=all[e];if(p.action!="passReady"&&p.action!="kickReady")continue;
            if(s.action==p.action&&s.actionId==p.actionId||ContactAction(s.action))continue;
            int f=p.poseKind=="left-foot"?0:1;var a=new ReadyAbort{from=p.action,to=s.action+(s.action==p.action?" (new id)":""),kind=p.poseKind,clock=(float)p.clock,progress=p.progress};
            float startZ=p.ankleLocal[f].z,startClear=p.supportClear[f];
            a.nextAction=s.action;a.nextId=s.actionId;a.nextProgress=s.progress;a.continues=(s.action=="passReady"||s.action=="kickReady")&&s.actionId==p.actionId&&s.progress>=p.progress-1e-6;var travel=new float[2];
            for(int i=e;i<n&&all[i].clock<=p.clock+AbortWindow+1e-6;i++){
                var c=all[i];var b=all[i-1];double dt=c.clock-b.clock;if(dt<=0||dt>.04)continue;var jump=c.root-b.root;jump.y=0;if(jump.magnitude>.4f)continue;
                a.frames++;for(int k=0;k<8;k++){float v=Quaternion.Angle(c.rel[k],b.rel[k])/(float)dt;if(v>a.jointRootMax){a.jointRootMax=v;a.jointRootAt=Bones[k]+" "+c.clock.ToString("0.000",Inv);}}
                a.forwardCarry=Mathf.Max(a.forwardCarry,c.ankleLocal[f].z-startZ);a.soleRise=Mathf.Max(a.soleRise,c.supportClear[f]-startClear);
                a.rootYawRateMax=Mathf.Max(a.rootYawRateMax,Diff(c.rootYaw,b.rootYaw)/(float)dt);
                for(int q=0;q<2;q++){char lc=Lock(c.lockState,q,0),lb=Lock(b.lockState,q,0);bool toe=Lock(c.lockState,q,1)=='t';if(!char.IsUpper(lc)||!char.IsUpper(lb)||toe!=(Lock(b.lockState,q,1)=='t')){travel[q]=0;continue;}
                    var d=(toe?c.toe[q]-b.toe[q]:c.ankle[q]-b.ankle[q]);d.y=0;travel[q]+=d.magnitude;if(travel[q]>a.lockedDrift)a.lockedDrift=travel[q];float v=d.magnitude/(float)dt;if(v>a.lockedDriftSpeed){a.lockedDriftSpeed=v;a.lockedDriftAt=(q==0?"left ":"right ")+c.clock.ToString("0.000",Inv)+" yaw "+(Diff(c.rootYaw,b.rootYaw)/(float)dt).ToString("0",Inv)+" deg/s";}}
            }
            list.Add(a);
        }
        return list.ToArray();
    }
    static FootAction[] FootActions(List<Sample> all,InputTiming timing=null){
        var list=new List<FootAction>();int n=all.Count;
        for(int e=1;e<n;e++){
            if(!all[e].footContact||all[e-1].footContact)continue;
            int last=e;while(last+1<n&&all[last+1].footContact&&all[last+1].action==all[e].action)last++;
            int f=all[e].poseKind=="left-foot"?0:1;double t0=all[e].clock,t1=all[last].clock;
            var a=new FootAction{action=all[e].action,kind=all[e].poseKind,entryClock=(float)t0,lastContactClock=(float)t1,entryContext=Context(all[e-1],all[e])};
            // r20: native event time, lead pictures of the approach and the entry picture's contact geometry.
            {var s0=all[e];a.entryFrom=all[e-1].action;a.eventAt=timing!=null&&timing.events.TryGetValue(s0.actionId??"",out var at)?at:-1;for(int i=e-1;i>=0&&all[i].clock>=t0-ApproachWindow-1e-6;i--)if(all[i].leadIn>0&&all[i].leadAction==s0.action)a.leadFrames++;
             if(s0.poseContact&&s0.poseReach&&(s0.poseKind=="foot"||s0.poseKind=="left-foot")){a.entryContactError=s0.poseContactError;if(s0.hasTarget){a.entryBootGap=Mathf.Abs(BootDistance(s0,s0.target,f)-WorldBallMotion.Radius-BootSurface);a.entryBallGap=Mathf.Abs(BootDistance(s0,s0.ball,f)-WorldBallMotion.Radius-BootSurface);}}}
            for(int i=1;i<n;i++){
                var s=all[i];var p=all[i-1];double dt=s.clock-p.clock;if(dt<=0||dt>.04)continue;var jump=s.root-p.root;jump.y=0;if(jump.magnitude>.4f)continue;
                int w=i==e?1:s.clock<t0-ApproachWindow-1e-6?-1:s.clock<t0-1e-6?0:s.clock<=t1+1e-6?2:s.clock<=t1+ReturnWindow+1e-6?3:-1;if(w<0)continue;
                a.frames[w]++;a.rootYawRateMax=Mathf.Max(a.rootYawRateMax,Diff(s.rootYaw,p.rootYaw)/(float)dt);
                for(int k=0;k<8;k++){float v=Quaternion.Angle(s.rel[k],p.rel[k])/(float)dt;if(v>a.jointRootMax[w]){a.jointRootMax[w]=v;a.jointRootAt[w]=Bones[k]+" "+s.clock.ToString("0.000",Inv);}}
                a.footSpeedMax[w]=Mathf.Max(a.footSpeedMax[w],(s.ankleLocal[f]-p.ankleLocal[f]).magnitude/(float)dt);
            }
            list.Add(a);e=last;
        }
        return list.ToArray();
    }
    // ---- r21 measurements (reported in natural-motion.json; gated by R21Gates) ----
    public const float OffenderAfter=1f,ReverseSpeed=1.2f,KickExit=.3f;
    static FoulWindow[] Fouls(List<WorldFrame> pictures,int i,List<Sample> all){
        var list=new List<FoulWindow>();
        for(int k=0;k<pictures.Count;k++){
            if(pictures[k].players[i].action!="foulOffender"||k>0&&pictures[k-1].players[i].action=="foulOffender")continue;
            int e=k;while(e<pictures.Count&&pictures[e].players[i].action=="foulOffender")e++;
            var w=new FoulWindow{start=(float)pictures[k].clock,exit=e<pictures.Count?(float)pictures[e].clock:-1,exitTo=e<pictures.Count?pictures[e].players[i].action:"(end of replay)"};
            double end=(e<pictures.Count?pictures[e].clock:pictures[pictures.Count-1].clock)+OffenderAfter;w.end=(float)end;
            for(int n=0;n<all.Count;n++){
                var x=all[n];if(x.clock<w.start-1e-6||x.clock>end+1e-6)continue;w.frames++;
                float low=float.IsNaN(x.turfClear)?Mathf.Min(x.supportClear[0],x.supportClear[1]):x.turfClear;string at=x.clock.ToString("0.000",Inv)+" "+x.action+" "+x.clip+"/"+x.baseClip+" w="+x.actionWeight.ToString("0.00",Inv);
                // Floating is judged on the offender pictures (the walk-off is a stride with its own flight and locomotion gates);
                // sinking, joints and pelvis over the whole window.
                bool offender=x.action=="foulOffender";
                if(offender&&low>w.floatMax){w.floatMax=low;w.floatAt=at;}if(low<w.sinkMin){w.sinkMin=low;w.sinkAt=at;}
                if(offender&&!float.IsNaN(x.abduction)&&x.actionWeight>=.5f){if(x.abduction>w.armMax){w.armMax=x.abduction;w.armAt=at;}if(x.actionWeight>=.99f)w.armSettledMax=Mathf.Max(w.armSettledMax,x.abduction);}
                if(!float.IsNaN(x.weightSum)){w.weightSumMin=Mathf.Min(w.weightSumMin,x.weightSum);w.weightSumMax=Mathf.Max(w.weightSumMax,x.weightSum);}if(x.nanWeights)w.nanPictures++;
                if(!float.IsNaN(x.sole)){w.soleFrames++;if(x.sole<w.soleMin){w.soleMin=x.sole;w.soleAt=at+" "+x.soleBone;}if(offender)w.soleMax=Mathf.Max(w.soleMax,x.sole);}
                w.turfShiftMax=Mathf.Max(w.turfShiftMax,Mathf.Abs(x.turfShift));
                if(n==0)continue;var p=all[n-1];double dt=x.clock-p.clock;if(dt<=0||dt>.04)continue;
                for(int b=0;b<8;b++){float v=Quaternion.Angle(x.rel[b],p.rel[b])/(float)dt;if(v>w.jointRootMax){w.jointRootMax=v;w.jointRootAt=Bones[b]+" "+at;}}
                float pr=Mathf.Abs((x.thigh[0].y+x.thigh[1].y-p.thigh[0].y-p.thigh[1].y)*.5f)/(float)dt;if(pr>w.pelvisRateMax){w.pelvisRateMax=pr;w.pelvisAt=at;}
            }
            list.Add(w);k=e;
        }
        return list.ToArray();
    }
    static Bands BandStats(List<Sample> all){
        var b=new Bands();string cur=null;double since=-1,dwellSum=0;int dwells=0;double walkSum=0;
        for(int i=0;i<all.Count;i++){var s=all[i];if(i>0&&s.clock>all[i-1].clock&&(s.moving||all[i-1].moving))b.movingSeconds+=(float)(s.clock-all[i-1].clock);
            string band=s.stride??"";if(band==cur)continue;
            if(cur!=null&&since>=0){double d=s.clock-since;dwells++;dwellSum+=d;if(d<.25)b.shortDwells++;if(cur=="walk"){b.walkDwells++;walkSum+=d;if(d<.25)b.walkShort++;}if(cur!="idle"&&band!="idle")b.changes++;}
            cur=band;since=s.clock;}
        b.changesPerMinute=b.movingSeconds>0?b.changes*60f/b.movingSeconds:0;b.dwellMean=dwells>0?(float)(dwellSum/dwells):0;b.walkDwellMean=b.walkDwells>0?(float)(walkSum/b.walkDwells):0;return b;
    }
    static Reversal Reversals(List<Sample> all){
        var r=new Reversal();double runFrom=-1;
        foreach(var x in all){
            // backUnityLongest: the longest uninterrupted run (s) of moving pictures with a Unity backward stride while the received
            // travel is not backward (the smoothed travel of FootballLocomotion following a received travel reversal).
            bool held=x.travel.magnitude>=ReverseSpeed&&x.stride=="back"&&Mathf.Abs(Vector3.SignedAngle(x.facing,x.travel,Vector3.up))<FootballLocomotion.BackOff;
            if(held){if(runFrom<0)runFrom=x.clock;float len=(float)(x.clock-runFrom+1/60.0);if(len>r.backUnityLongest){r.backUnityLongest=len;r.backUnityLongestAt=runFrom.ToString("0.000",Inv)+"-"+x.clock.ToString("0.000",Inv);}}else runFrom=-1;
            if(x.travel.magnitude<ReverseSpeed)continue;r.moving++;float rel=Mathf.Abs(Vector3.SignedAngle(x.facing,x.travel,Vector3.up));if(rel>135)r.receivedReversed++;
            if(x.stride!="back")continue;r.back++;if(rel>=FootballLocomotion.BackOff){r.backReceived++;continue;}
            r.backUnity++;if(rel<r.backUnityRelMin){r.backUnityRelMin=rel;r.backUnityAt=x.clock.ToString("0.000",Inv)+" "+x.mode+"/"+x.stride+" "+x.action+" v="+x.travel.magnitude.ToString("0.0",Inv);}
        }
        return r;
    }
    static readonly string[] KickActions={"pass","highPass","cross","shot","freeKick","volley"};
    static KickFacing[] KickFacings(List<WorldFrame> pictures,int i,List<Sample> all){
        var list=new List<KickFacing>();
        for(int k=1;k+2<pictures.Count;k++){
            var p=pictures[k].players[i];var q=pictures[k-1].players[i];if(Array.IndexOf(KickActions,p.action)<0||p.progress>1e-9||q.action==p.action&&q.actionId==p.actionId)continue;
            var b0=pictures[k].ball;var b2=pictures[k+2].ball;float dx=(float)(b2[0]-b0[0]),dz=(float)(b2[2]-b0[2]);if(dx*dx+dz*dz<.01f)continue;
            float by=Mathf.Atan2(dx,dz)*Mathf.Rad2Deg;double t=pictures[k].clock;var kf=new KickFacing{action=p.action,clock=(float)t,ballYaw=by};
            foreach(var x in all){float d=Mathf.Abs(Mathf.DeltaAngle(x.rootYaw,by));
                if(x.clock<t-1e-4&&x.clock>=t-.05)kf.before=d;else if(Math.Abs(x.clock-t)<=1e-4)kf.at=d;else if(x.clock>t+1e-4&&x.clock<=t+KickExit+1e-4)kf.exitMax=Mathf.Max(kf.exitMax,d);}
            kf.reversedAtContact=kf.at>90;list.Add(kf);
        }
        return list.ToArray();
    }
    static string Context(Sample p,Sample s){return s.clock.ToString("0.000",Inv)+" "+p.clip+"/"+p.mode+"/"+p.action+" -> "+s.clip+"/"+s.mode+"/"+s.action+" v="+s.travel.magnitude.ToString("0.0",Inv)+" lock "+p.lockState+" -> "+s.lockState;}
    static string Hash(Transform actor){var sb=new System.Text.StringBuilder();foreach(var t in actor.GetComponentsInChildren<Transform>()){var q=t.localRotation;var p=t.localPosition;sb.Append(Math.Round(q.x,5)).Append(',').Append(Math.Round(q.y,5)).Append(',').Append(Math.Round(q.z,5)).Append(',').Append(Math.Round(q.w,5)).Append(';').Append(Math.Round(p.x,5)).Append(',').Append(Math.Round(p.y,5)).Append(',').Append(Math.Round(p.z,5)).Append('|');}
        using(var sha=System.Security.Cryptography.SHA256.Create())return BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(sb.ToString()))).Replace("-","").Substring(0,16).ToLowerInvariant();}
    // ---- rendering -----------------------------------------------------
    static string folder;static readonly List<string> images=new List<string>(),recordings=new List<string>();
    // r20: input identity checks of the R20 families (Report.r20Checks).
    static readonly List<Check> r20Checks=new List<Check>();
    static Texture2D Capture(int w,int h){
        var camera=Camera.main;var baked=new List<(SkinnedMeshRenderer skin,GameObject go,Mesh mesh)>();
        foreach(var skin in UnityEngine.Object.FindObjectsByType<SkinnedMeshRenderer>(FindObjectsSortMode.None)){
            if(!skin.enabled||!skin.gameObject.activeInHierarchy)continue;
            var mesh=new Mesh();skin.BakeMesh(mesh);var go=new GameObject("D6 motion capture",typeof(MeshFilter),typeof(MeshRenderer));go.transform.SetParent(skin.transform,false);
            go.GetComponent<MeshFilter>().sharedMesh=mesh;var renderer=go.GetComponent<MeshRenderer>();renderer.sharedMaterials=skin.sharedMaterials;renderer.shadowCastingMode=skin.shadowCastingMode;skin.enabled=false;baked.Add((skin,go,mesh));
        }
        var rt=RenderTexture.GetTemporary(w,h,24,RenderTextureFormat.ARGB32);float aspect=camera.aspect;camera.aspect=(float)w/h;camera.targetTexture=rt;camera.Render();camera.targetTexture=null;camera.aspect=aspect;
        var previous=RenderTexture.active;RenderTexture.active=rt;var tex=new Texture2D(w,h,TextureFormat.RGB24,false);tex.ReadPixels(new Rect(0,0,w,h),0,0);tex.Apply();RenderTexture.active=previous;RenderTexture.ReleaseTemporary(rt);
        foreach(var item in baked){item.skin.enabled=true;UnityEngine.Object.DestroyImmediate(item.go);UnityEngine.Object.DestroyImmediate(item.mesh);}
        return tex;
    }
    // A close chase camera: the body's front-right three-quarter view.
    static WorldCamera Chase(Vector3 subject,Vector3 facing,float distance=8.5f){
        var right=Vector3.Cross(Vector3.up,facing).normalized;var target=subject+Vector3.up*1.2f;var eye=target+(facing*.55f+right*.85f).normalized*distance+Vector3.up*1.1f;
        return new WorldCamera{position=D(eye),target=D(target),fov=34};
    }
    // r11: a low side camera at the feet from a fixed world side (the turf line
    // and both soles stay in view through a facing flip).
    static Func<WorldFrame,WorldCamera> Feet(int who,Vector3 side,float distance=3.6f)=>f=>{var target=V(f.players[who].position)+Vector3.up*.45f;var eye=target+side.normalized*distance+Vector3.up*.2f;return new WorldCamera{position=D(eye),target=D(target),fov=32};};
    // Minimal animated GIF (fixed 6x7x6 palette, ordered dither, LZW).
    static void Gif(string path,List<Color32[]> frames,int w,int h,int delay){
        using var s=new FileStream(path,FileMode.Create);void B(params byte[] v)=>s.Write(v,0,v.Length);void U(int v){s.WriteByte((byte)(v&255));s.WriteByte((byte)(v>>8));}
        B((byte)'G',(byte)'I',(byte)'F',(byte)'8',(byte)'9',(byte)'a');U(w);U(h);B(0xF7,0,0);
        for(int i=0;i<256;i++){if(i<252){int r=i/42,g=i/6%7,b=i%6;B((byte)(r*51),(byte)(g*255/6),(byte)(b*51));}else B(0,0,0);}
        B(0x21,0xFF,0x0B);foreach(var c in "NETSCAPE2.0")s.WriteByte((byte)c);B(3,1,0,0,0);
        int[] bayer={0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5};
        foreach(var px in frames){
            B(0x21,0xF9,4,0);U(delay);B(0,0);B(0x2C);U(0);U(0);U(w);U(h);B(0);
            var idx=new byte[w*h];
            for(int y=0;y<h;y++)for(int x=0;x<w;x++){var c=px[(h-1-y)*w+x];float d=(bayer[(y&3)*4+(x&3)]+.5f)/16f-.5f;int r=Mathf.Clamp(Mathf.RoundToInt(c.r/51f+d),0,5),g=Mathf.Clamp(Mathf.RoundToInt(c.g*6/255f+d),0,6),b=Mathf.Clamp(Mathf.RoundToInt(c.b/51f+d),0,5);idx[y*w+x]=(byte)(r*42+g*6+b);}
            s.WriteByte(8);Lzw(idx,s);
        }
        s.WriteByte(0x3B);
    }
    static void Lzw(byte[] data,Stream s){
        const int min=8;int clear=1<<min,eoi=clear+1,size=min+1,next=eoi+1;var table=new Dictionary<int,int>();int buffer=0,bits=0;var block=new List<byte>(255);
        void Flush(){if(block.Count==0)return;s.WriteByte((byte)block.Count);s.Write(block.ToArray(),0,block.Count);block.Clear();}
        void Emit(int code){buffer|=code<<bits;bits+=size;while(bits>=8){block.Add((byte)(buffer&255));buffer>>=8;bits-=8;if(block.Count==255)Flush();}}
        Emit(clear);int prefix=data[0];
        for(int i=1;i<data.Length;i++){
            int k=data[i],key=(prefix<<8)|k;
            if(table.TryGetValue(key,out var code)){prefix=code;continue;}
            Emit(prefix);
            if(next==4096){Emit(clear);table.Clear();next=eoi+1;size=min+1;}
            else{if(next>=(1<<size))size++;table[key]=next++;}
            prefix=k;
        }
        Emit(prefix);Emit(eoi);if(bits>0)block.Add((byte)(buffer&255));Flush();s.WriteByte(0);
    }
    // ---- running one fixture ----------------------------------------------
    sealed class Pass {public List<Sample> samples=new List<Sample>();public List<string> hashes=new List<string>();public HashSet<string> clips=new HashSet<string>();}
    // pictures: native-shaped 20 Hz frames. capture: frame indices (60 Hz) to render; record: GIF frame list.
    // r11: camera overrides the chase camera (e.g. Feet); recordWhen limits the recorded pictures.
    static Pass Play(WorldConfig config,List<WorldFrame> pictures,int subject,bool measureSole,Func<int,WorldFrame,bool> capture=null,Action<int,Texture2D> onCapture=null,List<Color32[]> record=null,int recordW=320,int recordH=240,int stopAfter=int.MaxValue,int rate=60,Func<WorldFrame,WorldCamera> camera=null,Func<WorldFrame,bool> recordWhen=null){
        Drop();Send(new WorldCommand{kind="load",config=config});
        var actors=Field<List<Transform>>("actors");var football=Field<List<FootballAnimation>>("football");var loco=Field<FootballLocomotion[]>("worldLocomotion");
        var run=new Pass();Sample last=null;int frame=0;var tap=new StageTap(actors[subject],football[subject]);
        foreach(var f in Display(pictures,rate)){
            if(frame>=stopAfter)break;
            var p=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(f));p.sequence=++sequence;p.phase="paused";
            // The chase camera follows the actual rendered player.
            p.camera=camera!=null?camera(p):Chase(V(p.players[subject].position),V(p.players[subject].facing).sqrMagnitude>.0001f?V(p.players[subject].facing).normalized:Vector3.right);
            Send(new WorldCommand{kind="frame",frame=p});
            // r11: the skinned sole of every action picture (contact and recovery), every 1/30 s otherwise.
            var s=Measure(subject,actors[subject],football[subject],loco[subject],p,last,measureSole&&(frame%Math.Max(1,rate/30)==0||!Loco(p.players[subject].action)),tap);run.samples.Add(s);if(s.clip!=null)run.clips.Add(s.clip);run.hashes.Add(Hash(actors[subject]));last=s;
            if(capture!=null&&capture(frame,p)){var t=Capture(360,450);onCapture?.Invoke(frame,t);UnityEngine.Object.DestroyImmediate(t);}
            if(record!=null&&(recordWhen==null||recordWhen(p))){var t=Capture(recordW,recordH);record.Add(t.GetPixels32());UnityEngine.Object.DestroyImmediate(t);}
            frame++;
        }
        return run;
    }
    static List<WorldFrame> Pictures(WorldConfig config,int subject,List<(double t,Vector3 p,Vector3 f)> path,Vector3 origin,bool owner=false,bool keeperBall=false){
        var list=new List<WorldFrame>();
        foreach(var (t,p,f) in path){
            var w=Picture(config.initial,10+t);var pose=w.players[subject];pose.position=D(origin+p);pose.facing=D(f);pose.moving=true;pose.action="run";pose.actionId="run";
            if(owner){w.owner=pose.id;var dir=list.Count>0?(origin+p-V(list[list.Count-1].players[subject].position)):f;dir.y=0;if(dir.sqrMagnitude<1e-6f)dir=f;dir.Normalize();var ball=origin+p+dir*.55f;ball.y=.29f;w.ball=D(ball);w.ballInFlight=false;}
            list.Add(w);
        }
        return list;
    }
    // ---- cases ---------------------------------------------------------
    // r3 adds per frame: largest root-relative and world joint speed of the
    // measured joints, the received root's yaw rate, travel speed and action.
    // r11 trace fields: rendered contact flag/limb error, received contact point (displayed), skinned sole of the drawn skin (-9 unsampled; groundSole: the hidden ground skin, -9 without one), ankle heights, pelvis contact drop, release weight.
    [Serializable] class Trace {public int[] contact;public float[] contactError,targetX,targetY,targetZ,sole,groundSole,leftAnkleY,rightAnkleY,contactDrop,releaseWeight;public string name;public float[] stage,layerLeftX,layerLeftZ,layerRightX,layerRightZ,poseTime,stridePhase,leftToeX,leftToeZ,rightToeX,rightToeZ,leftSupport,rightSupport,stageClear;public int[] stageBone;public float[] clock,rootX,rootZ,leftX,leftZ,leftClear,rightX,rightZ,rightClear,lockOffset,jointRoot,jointWorld,rootYawRate,speed,strideScale;public string[] clip,mode,lockState,action;
        // r13: root-relative speed of each of the eight measured bones (n*8, Bones order) and the foot-contact picture flag.
        public float[] boneRoot;public int[] footContact;
        // r15: knee angle of each leg (hip-knee-ankle, 180 = straight), rig plant (0/1 left/2 right) and anchor error, received progress, action weight and action id.
        public float[] kneeLeft,kneeRight,plantError,progress,actionWeight;public int[] plant;public string[] actionId;
        // r18: sub-stages 5-8 (n*4) and their bones, swivel diagnostics (n*5: pole, least, direct, chord, chosen angle; per picture in degrees, -1 unknown), lock-release shift/turn (n*2 each, left/right).
        public float[] subStage,swivel,releaseShift,releaseTurn,lifts;public int[] subStageBone;
        // r20: display lead (seconds until a received foot contact ahead, -1 none) and the native action time shown (-1 unknown).
        public float[] leadIn;public double[] actionAt;}
    // r3: per-frame detail around the largest root-relative joint speed of a
    // sample list (+-40 frames): per-bone speeds, clips, modes, lock states.
    [Serializable] class PeakFrame {public float clock,speed,rootYawRate,phase,strideScale,actionWeight,lockOffset,rawStep,rawJump;public int inertia;public string clip,baseClip,mode,stride,action,lockState;public float[] boneRoot,stage,kneeMove;public int[] stageBone;public Vector3[] legGeometry;}
    [Serializable] class Peak {public string name,bones;public float peak;public PeakFrame[] frames;}
    static void WritePeak(string name,List<Sample> S,bool locomotionOnly,float threshold=1400){
        int best=-1;float top=0;
        for(int i=1;i<S.Count;i++){var s=S[i];var p=S[i-1];double dt=s.clock-p.clock;if(dt<=0||dt>.04)continue;var jump=s.root-p.root;jump.y=0;if(jump.magnitude>.4f)continue;if(locomotionOnly&&!(Loco(s.action)&&Loco(p.action)))continue;
            for(int k=0;k<8;k++){float v=Quaternion.Angle(s.rel[k],p.rel[k])/(float)dt;if(v>top){top=v;best=i;}}}
        if(best<0||top<threshold)return;var list=new List<PeakFrame>();
        for(int i=Math.Max(1,best-40);i<Math.Min(S.Count,best+41);i++){var s=S[i];var p=S[i-1];float dt=(float)Math.Max(1e-4,s.clock-p.clock);
            var f=new PeakFrame{clock=(float)s.clock,speed=s.travel.magnitude,rootYawRate=Mathf.DeltaAngle(p.rootYaw,s.rootYaw)/dt,phase=(float)s.phase,strideScale=s.strideScale,actionWeight=s.actionWeight,lockOffset=s.lockOffset,rawStep=s.rawStep,rawJump=s.rawJump,inertia=s.inertia,clip=s.clip,baseClip=s.baseClip,mode=s.mode,stride=s.stride,action=s.action,lockState=s.lockState,boneRoot=new float[8],stage=s.stage,stageBone=s.stageBone,kneeMove=s.kneeMove,legGeometry=s.legGeometry};
            for(int k=0;k<8;k++)f.boneRoot[k]=Quaternion.Angle(s.rel[k],p.rel[k])/dt;list.Add(f);}
        Directory.CreateDirectory(Path.Combine(folder,"peaks"));
        File.WriteAllText(Path.Combine(folder,"peaks",name+".json"),JsonUtility.ToJson(new Peak{name=name,bones=string.Join(",",Bones,0,8),peak=top,frames=list.ToArray()}));
    }
    static void WriteTrace(string name,Pass run){
        var S=run.samples;int n=S.Count;var t=new Trace{name=name,clock=new float[n],rootX=new float[n],rootZ=new float[n],leftX=new float[n],leftZ=new float[n],leftClear=new float[n],rightX=new float[n],rightZ=new float[n],rightClear=new float[n],lockOffset=new float[n],jointRoot=new float[n],jointWorld=new float[n],rootYawRate=new float[n],speed=new float[n],strideScale=new float[n],clip=new string[n],mode=new string[n],lockState=new string[n],action=new string[n]};
        t.contact=new int[n];t.contactError=new float[n];t.targetX=new float[n];t.targetY=new float[n];t.targetZ=new float[n];t.sole=new float[n];t.groundSole=new float[n];t.leftAnkleY=new float[n];t.rightAnkleY=new float[n];t.contactDrop=new float[n];t.releaseWeight=new float[n];
        for(int i=0;i<n;i++){var s=S[i];t.contact[i]=(s.contactPicture?1:0)+(s.poseContact?2:0)+(s.poseReach?4:0)+(s.poseKind=="left-foot"?8:0);t.contactError[i]=s.poseContactError;if(s.hasTarget){t.targetX[i]=s.target.x;t.targetY[i]=s.target.y;t.targetZ[i]=s.target.z;}t.sole[i]=float.IsNaN(s.sole)?-9:s.sole;t.groundSole[i]=float.IsNaN(s.groundSole)?-9:s.groundSole;t.leftAnkleY[i]=s.ankle[0].y;t.rightAnkleY[i]=s.ankle[1].y;t.contactDrop[i]=s.contactDrop;t.releaseWeight[i]=s.releaseWeight;}
        t.stage=new float[n*5];t.stageBone=new int[n*5];t.layerLeftX=new float[n];t.layerLeftZ=new float[n];t.layerRightX=new float[n];t.layerRightZ=new float[n];t.poseTime=new float[n];t.stridePhase=new float[n];t.leftToeX=new float[n];t.leftToeZ=new float[n];t.rightToeX=new float[n];t.rightToeZ=new float[n];t.leftSupport=new float[n];t.rightSupport=new float[n];t.stageClear=new float[n*10];
        for(int i=0;i<n;i++){var s=S[i];if(s.stage!=null)for(int st=0;st<5;st++){t.stage[i*5+st]=s.stage[st];t.stageBone[i*5+st]=s.stageBone[st];}if(s.layerAnkle!=null){t.layerLeftX[i]=s.layerAnkle[0].x;t.layerLeftZ[i]=s.layerAnkle[0].z;t.layerRightX[i]=s.layerAnkle[1].x;t.layerRightZ[i]=s.layerAnkle[1].z;}t.poseTime[i]=(float)s.poseTime;t.leftToeX[i]=s.toe[0].x;t.leftToeZ[i]=s.toe[0].z;t.rightToeX[i]=s.toe[1].x;t.rightToeZ[i]=s.toe[1].z;t.leftSupport[i]=s.supportClear[0];t.rightSupport[i]=s.supportClear[1];if(s.stageClear!=null)Array.Copy(s.stageClear,0,t.stageClear,i*10,10);t.stridePhase[i]=(float)s.stridePhase;t.clock[i]=(float)s.clock;t.rootX[i]=s.root.x;t.rootZ[i]=s.root.z;t.leftX[i]=s.ankle[0].x;t.leftZ[i]=s.ankle[0].z;t.leftClear[i]=Mathf.Min(s.ankleClear[0],s.toeClear[0]);t.rightX[i]=s.ankle[1].x;t.rightZ[i]=s.ankle[1].z;t.rightClear[i]=Mathf.Min(s.ankleClear[1],s.toeClear[1]);t.lockOffset[i]=s.lockOffset;t.clip[i]=s.clip;t.mode[i]=s.mode;t.lockState[i]=s.lockState;t.action[i]=s.action;t.speed[i]=s.travel.magnitude;t.strideScale[i]=s.strideScale;
            if(i>0&&s.clock>S[i-1].clock){var p=S[i-1];float dt=(float)(s.clock-p.clock);for(int k=0;k<8;k++){t.jointRoot[i]=Mathf.Max(t.jointRoot[i],Quaternion.Angle(s.rel[k],p.rel[k])/dt);t.jointWorld[i]=Mathf.Max(t.jointWorld[i],Quaternion.Angle(s.rot[k],p.rot[k])/dt);}t.rootYawRate[i]=Diff(s.rootYaw,p.rootYaw)/dt;}}
        t.boneRoot=new float[n*8];t.footContact=new int[n];
        for(int i=0;i<n;i++){t.footContact[i]=S[i].footContact?1:0;if(i>0&&S[i].clock>S[i-1].clock){float dt=(float)(S[i].clock-S[i-1].clock);for(int k=0;k<8;k++)t.boneRoot[i*8+k]=Quaternion.Angle(S[i].rel[k],S[i-1].rel[k])/dt;}}
        t.kneeLeft=new float[n];t.kneeRight=new float[n];t.plantError=new float[n];t.progress=new float[n];t.actionWeight=new float[n];t.plant=new int[n];t.actionId=new string[n];
        for(int i=0;i<n;i++){var s=S[i];t.kneeLeft[i]=Vector3.Angle(s.thigh[0]-s.knee[0],s.ankle[0]-s.knee[0]);t.kneeRight[i]=Vector3.Angle(s.thigh[1]-s.knee[1],s.ankle[1]-s.knee[1]);t.plant[i]=s.plant;t.plantError[i]=s.plantError;t.progress[i]=s.progress;t.actionWeight[i]=s.actionWeight;t.actionId[i]=s.actionId;}
        t.subStage=new float[n*6];t.subStageBone=new int[n*6];t.swivel=new float[n*5];t.releaseShift=new float[n*2];t.releaseTurn=new float[n*2];t.lifts=new float[n*6];
        for(int i=0;i<n;i++){var s=S[i];if(s.subStage!=null)for(int k=0;k<s.subStage.Length&&k<6;k++){t.subStage[i*6+k]=s.subStage[k];t.subStageBone[i*6+k]=s.subStageBone[k];}for(int k=0;k<5;k++)t.swivel[i*5+k]=s.swivel!=null?s.swivel[k]:-1;if(s.releaseShift!=null)for(int f=0;f<2;f++){t.releaseShift[i*2+f]=s.releaseShift[f];t.releaseTurn[i*2+f]=s.releaseTurn[f];}if(s.lifts!=null)Array.Copy(s.lifts,0,t.lifts,i*6,6);}
        t.leadIn=new float[n];t.actionAt=new double[n];for(int i=0;i<n;i++){t.leadIn[i]=S[i].leadIn;t.actionAt[i]=S[i].actionAtKnown?S[i].actionAt:-1;}
        File.WriteAllText(Path.Combine(folder,"trace-"+name+".json"),JsonUtility.ToJson(t));
    }
    static Case Measured(string name,string group,string origin,Pass run,float travel,float speed,float facing,(int a,int b,int c,int d)? windows,string note=null,int rate=60,InputTiming timing=null){
        VisibleSurfaceProbe.Current?.Label(name+"@"+rate+"Hz");
        if(origin=="controlled"||origin=="r15"||origin=="r20")WriteTrace(rate==60?name:name+"@"+rate+"Hz",run);
        if(origin=="controlled"||origin=="r15"||origin=="r20")WritePeak(name+"@"+rate+"Hz",run.samples,false);
        var c=new Case{name=name,group=group,origin=origin,travel=travel,speed=speed,facing=facing,note=note,rate=rate,clips=new List<string>(run.clips).ToArray()};
        c.whole=Summarise("whole",run.samples,0,run.samples.Count);c.transitions=Transitions(run.samples);c.footActions=FootActions(run.samples,timing);c.readyAborts=ReadyAborts(run.samples);
        if(windows.HasValue){var w=windows.Value;c.start=Summarise("start",run.samples,w.a,w.b);c.cruise=Summarise("cruise",run.samples,w.b,w.c);c.stop=Summarise("stop",run.samples,w.c,w.d);}
        c.poseHash=run.hashes.Count>0?run.hashes[run.hashes.Count-1]:"";return c;
    }
    static int Frame60(double seconds)=>(int)Math.Round(seconds*60);
    // Clip detail on the actual rig: hips and toe paths relative to the actor
    // (root motion stays off), so a clip's portrayed direction is measured.
    [Serializable] public class ClipDetail {public string name;public float length,hipsDriftX,hipsDriftZ,leftStance,rightStance,jointSpeedMax,hipsYawRange;public string jointSpeedAt;public float[] hipsYaw;public float[] time,hipsX,hipsZ,leftX,leftZ,leftClear,rightX,rightZ,rightClear;
        // r5: toe base path and separate ankle/toe clearance (contact point of a rolling foot); the gait the rig measured for the clip.
        public float[] leftToeX,leftToeZ,rightToeX,rightToeZ,leftAnkleClear,leftToeClear,rightAnkleClear,rightToeClear;public float gaitStride,gaitLeft,gaitRight,gaitHeading;}
    [Serializable] class ClipDetails {public string sourceId;public ClipDetail[] clips;}
    static void Clips(string folder){
        const string asset="Assets/Doppel6EngineProbe/Art/football-v130.fbx";
        var names=new[]{"keeper_shuffle_meshy","back_walk","back_left","back_right","back_step_meshy","walking","run_fast6","run_fast4","sprint_forward","running","brake_meshy","turn_run_left","turn_run_right","turn_walk_left","turn_walk_right","turn_idle_left","turn_idle_right","turn_sharp_right","idle_ready","idle_relaxed","idle_stand_meshy","keeper_ready_meshy"};
        var all=UnityEditor.AssetDatabase.LoadAllAssetsAtPath(asset);var clips=new List<AnimationClip>();foreach(var n in names){var c=Array.Find(all,a=>a is AnimationClip&&a.name==n) as AnimationClip;if(c!=null)clips.Add(c);}
        // r13: the three foot-action clips (authored joint speed through their wind-up, contact and follow-through).
        {var shot=Array.Find(all,a=>a is AnimationClip&&a.name=="shot_meshy") as AnimationClip;if(shot!=null)clips.Add(shot);foreach(var n in new[]{"pass_inside_meshy","receive_ground_meshy"}){var c=UnityEditor.AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Doppel6EngineProbe/Art/"+n+".anim");if(c!=null)clips.Add(c);}}
        var scene=UnityEditor.SceneManagement.EditorSceneManager.NewPreviewScene();var graph=UnityEngine.Playables.PlayableGraph.Create("D6 clip detail");var list=new List<ClipDetail>();
        try{
            var actor=UnityEngine.Object.Instantiate(UnityEditor.AssetDatabase.LoadAssetAtPath<GameObject>(asset));UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(actor,scene);actor.transform.localScale=Vector3.one*1.45f;
            LowPolySetup.Skin(actor);
            var animator=actor.GetComponent<Animator>();if(animator==null)animator=actor.AddComponent<Animator>();animator.applyRootMotion=false;graph.SetTimeUpdateMode(UnityEngine.Playables.DirectorUpdateMode.Manual);
            UnityEngine.Animations.AnimationPlayableOutput.Create(graph,"rig",animator).SetSourcePlayable(UnityEngine.Animations.AnimationClipPlayable.Create(graph,clips[0]));graph.Play();graph.Evaluate(0);
            var anim=new FootballAnimation(graph,actor.transform,clips);actor.transform.position=Vector3.up*anim.RootHeight;var b=BoneSet(actor.transform);
            foreach(var clip in clips){
                const int n=120;Quaternion[] prev=null;var d=new ClipDetail{name=clip.name,length=clip.length,gaitStride=anim.StrideLength(clip),gaitLeft=anim.Footfall(clip),gaitRight=anim.RightFootfall(clip),gaitHeading=anim.Heading(clip),leftToeX=new float[n],leftToeZ=new float[n],rightToeX=new float[n],rightToeZ=new float[n],leftAnkleClear=new float[n],leftToeClear=new float[n],rightAnkleClear=new float[n],rightToeClear=new float[n],hipsYaw=new float[n],time=new float[n],hipsX=new float[n],hipsZ=new float[n],leftX=new float[n],leftZ=new float[n],leftClear=new float[n],rightX=new float[n],rightZ=new float[n],rightClear=new float[n]};
                for(int s=0;s<n;s++){double t=s*(clip.length-.001)/(n-1);anim.Sample(new FootballAnimation.Pose{clip=clip,time=t,key="detail",loop=false},1000+s,true);var root=actor.transform.position;
                    d.time[s]=(float)t;d.hipsX[s]=b[0].position.x-root.x;d.hipsZ[s]=b[0].position.z-root.z;d.leftX[s]=b[5].position.x-root.x;d.leftZ[s]=b[5].position.z-root.z;d.rightX[s]=b[6].position.x-root.x;d.rightZ[s]=b[6].position.z-root.z;d.leftClear[s]=anim.ground.Clearance(0);d.rightClear[s]=anim.ground.Clearance(1);
                    var lt=anim.rig.Toe(0).position;var rt=anim.rig.Toe(1).position;d.leftToeX[s]=lt.x-root.x;d.leftToeZ[s]=lt.z-root.z;d.rightToeX[s]=rt.x-root.x;d.rightToeZ[s]=rt.z-root.z;d.leftAnkleClear[s]=anim.ground.AnkleClearance(0);d.leftToeClear[s]=anim.ground.ToeClearance(0);d.rightAnkleClear[s]=anim.ground.AnkleClearance(1);d.rightToeClear[s]=anim.ground.ToeClearance(1);
                    if(d.leftClear[s]<.03f)d.leftStance+=1f/n;if(d.rightClear[s]<.03f)d.rightStance+=1f/n;
                    // Authored joint speed at 1x (root-relative, 8 measured joints) and the hips' yaw relative to the actor.
                    var unturn=Quaternion.Inverse(actor.transform.rotation);var rel=new Quaternion[8];for(int k=0;k<8;k++)rel[k]=unturn*b[k].rotation;
                    var hf=Vector3.ProjectOnPlane(unturn*(b[2].position-b[1].position),Vector3.up);d.hipsYaw[s]=Mathf.Atan2(-hf.z,hf.x)*Mathf.Rad2Deg;
                    if(prev!=null){float step=(float)((clip.length-.001)/(n-1));for(int k=0;k<8;k++){float v=Quaternion.Angle(rel[k],prev[k])/step;if(v>d.jointSpeedMax){d.jointSpeedMax=v;d.jointSpeedAt=Bones[k]+" t="+t.ToString("0.00",Inv);}}}prev=rel;}
                {float lo=float.MaxValue,hi=float.MinValue;foreach(var y in d.hipsYaw){lo=Mathf.Min(lo,y);hi=Mathf.Max(hi,y);}d.hipsYawRange=hi-lo;}
                d.hipsDriftX=d.hipsX[n-1]-d.hipsX[0];d.hipsDriftZ=d.hipsZ[n-1]-d.hipsZ[0];list.Add(d);
            }
        }finally{if(graph.IsValid())graph.Destroy();UnityEditor.SceneManagement.EditorSceneManager.ClosePreviewScene(scene);}
        File.WriteAllText(Path.Combine(folder,"clip-detail.json"),JsonUtility.ToJson(new ClipDetails{sourceId=ProbeBuildIdentity.SourceId,clips=list.ToArray()},true));
    }
    // enforce: a failed quality gate fails the run (D6Cli -d6gates report only records them).
    public const string EvidenceFolder="outputs/3d-quality/claude-natural-motion-20261010";
    // only: optional case filter (regex on "<case>@<rate>Hz", "determinism", "recordings", "native") for
    // targeted iteration runs; the full suite (no filter) is the acceptance run.
    static System.Text.RegularExpressions.Regex only;
    static bool Want(string name)=>only==null||only.IsMatch(name);
    // r6: rendering available in this run (native close-ups).
    static bool renderOn;
    // r6: fixed native close-up windows at the r3 peak pictures of the nine
    // players whose root-relative locomotion peak failed in r3 (same received
    // pictures before and after; every 60 Hz picture within +-0.1 s).
    static readonly (string name,double clock)[] NativeWindows={("native-160112-field-2",43.817),("native-160112-field-3",78.200),("native-160112-field-5",78.333),("native-160112-field-7",64.867),("native-160112-field-8",24.733),("native-160114-keeper-0",44.850),("native-160114-field-4",27.883),("native-160114-field-9",71.000),("native-160114-field-10",31.633),
        // r15: the pictures of the eleven R13 regression windows (r13/after/before-after.json native.worseAbove1600).
        ("native-160112-field-2",77.117),("native-160112-field-4",39.617),("native-160112-field-4",76.467),("native-160112-field-5",34.167),("native-160114-field-1",53.917),("native-160114-field-5",69.167),("native-160114-field-8",30.667),("native-160114-field-11",34.667),("native-160114-field-11",34.933)};
    // r16: native focus recordings (normal and slow, recording only): the R13 regression windows, the R15 aborted
    // countdowns and the receives R16 changed most.
    static readonly (string name,double from,double to)[] NativeFocus={("native-160114-field-11",34.45,35.10),("native-160112-field-2",76.85,77.30),("native-160114-field-8",30.40,30.80),("native-160114-field-4",56.55,56.95),("native-160114-field-5",25.70,26.05),("native-160114-field-13",37.20,37.55),("native-160112-field-11",49.10,49.40),("native-160114-field-1",53.80,54.05),("native-160114-field-12",15.65,16.05),("native-160112-field-7",68.10,68.40),("native-160112-field-4",39.35,39.70),("native-160112-field-4",76.35,76.55),("native-160112-field-5",34.10,34.30),("native-160114-field-5",69.00,69.25),
        // r18: the tackle whose contact changes its limb (P2 limb-switch release).
        ("native-160114-field-1",32.90,33.35)};
    // r20: focus recordings on Root's contract captures (normal and slow, recording only): the two E1 aborts, the two E2
    // countdowns, the receive after an aborted passReady and the second receives (A cases) of the R13 regression windows.
    // r21: foul offenders of both playing directions (160112 field-11 facing +x at 52.10, 160114 field-11 facing -x at 56.90;
    // 160116 field-11 at 39.60) through the exit and walk-off, the native free kick 160116 field-5 at 49.60 and the
    // pass-type free kick 160112 field-5 at 59.25.
    static readonly (string name,double from,double to)[] R21Focus={("native-contract-160112-field-11",51.90,55.90),("native-contract-160114-field-11",56.70,60.70),("native129-160116-field-11",39.40,43.40),("native129-160116-field-5",49.20,50.20),("native-contract-160112-field-5",58.95,59.80)};
    static readonly (string name,double from,double to)[] ContractFocus={("native-contract-160112-field-11",49.10,49.40),("native-contract-160114-field-4",56.55,56.95),("native-contract-160114-field-5",25.70,26.25),("native-contract-160114-field-13",37.20,37.55),("native-contract-160114-field-11",34.45,35.10),("native-contract-160112-field-2",76.85,77.30),("native-contract-160114-field-8",30.40,30.80)};
    public static string Run(string repository,string outputFolder,string label,bool render,bool enforce=true,string filter=null){
        only=string.IsNullOrEmpty(filter)?null:new System.Text.RegularExpressions.Regex(filter);
        bridge=UnityEngine.Object.FindFirstObjectByType<ProbeBridge>()??throw new InvalidOperationException("ProbeBridge is missing in the open scene");
        raw=File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json"));logState=Debug.unityLogger.logEnabled;
        VisibleSurfaceProbe.Current?.Dispose();VisibleSurfaceProbe.Current=new VisibleSurfaceProbe("natural-motion");
        renderOn=render;r20Checks.Clear();rejected=0;typeof(ProbeBridge).GetField("acceptDisplayLead",BindingFlags.Static|BindingFlags.NonPublic)?.SetValue(null,true);
        folder=Path.Combine(repository,outputFolder??"outputs/3d-quality/claude-natural-motion-20261010",label);Directory.CreateDirectory(folder);images.Clear();recordings.Clear();
        Clips(folder);
        var cases=new List<Case>();var checks=new List<Check>();void Require(bool ok,string name,double value=0){checks.Add(new Check{name=name,passed=ok,value=value});}
        var baseConfig=Config("natural-motion");int subject=Array.FindIndex(baseConfig.initial.players,p=>{var id=Array.Find(baseConfig.players,q=>q.id==p.id);return !id.keeper&&id.team==0;});
        int keeper=Array.FindIndex(baseConfig.initial.players,p=>Array.Find(baseConfig.players,q=>q.id==p.id).keeper);
        string[] dirNames={"fwd","fwd-right","right","back-right","back","back-left","left","fwd-left"};
        var bands=new[]{("walk",1.4f),("jog",3.0f),("sprint",5.6f)};
        // 1. Eight body-relative directions at three speeds, each through start, cruise and stop.
        foreach(var (band,speed) in bands){
            var sheet=render?new Texture2D(8*240,2*300,TextureFormat.RGB24,false):null;
            for(int d=0;d<8;d++){
                float travel=d*45;if(travel>180)travel-=360;if(!Want(band+"-"+dirNames[d]+"@60Hz"))continue;
                var path=Straight(travel,speed,0);var pics=Pictures(baseConfig,subject,path,new Vector3(-6,0,0)-Facing(travel)*(speed*1.2f));
                var run=Play(baseConfig,pics,subject,true);
                // Windows: idle .6, accel .5, cruise 2.0, brake .5.
                var c=Measured(band+"-"+dirNames[d],"directions","controlled",run,travel,speed,0,(Frame60(.5),Frame60(1.5),Frame60(3.1),Frame60(4.4)));cases.Add(c);
                if(render){
                    // Midstance and push frame of the cruise from the measured pass.
                    int mid=-1,push=-1;var S=run.samples;
                    for(int i=Frame60(1.6);i<Frame60(3.0)&&i<S.Count-1;i++){
                        for(int f=0;f<2;f++){
                            float now=Mathf.Min(S[i].ankleClear[f],S[i].toeClear[f]),then=Mathf.Min(S[i+1].ankleClear[f],S[i+1].toeClear[f]);
                            var hipsMid=(S[i].thigh[0]+S[i].thigh[1])*.5f;var off=S[i].ankle[f]-hipsMid;off.y=0;
                            if(mid<0&&now<.03f&&off.magnitude<.12f)mid=i;
                            if(push<0&&mid>=0&&i>mid+3&&now<.03f&&then>=.03f)push=i;
                        }
                        if(mid>=0&&push>=0)break;
                    }
                    if(mid<0)mid=Frame60(2.0);if(push<0)push=mid+6;int col=d;
                    var again=Play(baseConfig,pics,subject,false,(i,p)=>i==mid||i==push,(i,t)=>{var small=Scale(t,240,300);sheet.SetPixels(col*240,i==mid?300:0,240,300,small.GetPixels());UnityEngine.Object.DestroyImmediate(small);});
                    bool same=true;for(int i=0;i<run.hashes.Count&&i<again.hashes.Count;i++)same&=run.hashes[i]==again.hashes[i];
                    Require(same&&run.hashes.Count==again.hashes.Count,"identical replay of "+c.name+" gives identical rig poses",run.hashes.Count);
                }
            }
            if(render){sheet.Apply();var name="directions-"+band+".png";File.WriteAllBytes(Path.Combine(folder,name),sheet.EncodeToPNG());images.Add(name);UnityEngine.Object.DestroyImmediate(sheet);}
        }
        // 2. Steady curves at 3.5 m/s: facing follows the tangent.
        foreach(float rate in new[]{90f,150f,250f}){if(!Want("curve-"+rate+"@60Hz"))continue;
            var path=new List<(double,Vector3,Vector3)>();var p=Vector3.zero;float heading=0;
            for(double t=0;t<=4.6+1e-9;t+=.05){
                float v=t<.4?0:t<.9?(float)(3.5*(t-.4)/.5):3.5f;bool turning=t>=1.3&&t<4.3;
                path.Add((t,p,Facing(heading)));if(turning)heading+=rate*.05f;p+=Facing(heading)*v*.05f;
            }
            var pics=Pictures(baseConfig,subject,path,new Vector3(-8,0,-4));var run=Play(baseConfig,pics,subject,false);
            cases.Add(Measured("curve-"+rate,"curves","controlled",run,0,3.5f,0,(Frame60(.9),Frame60(1.8),Frame60(4.2),Frame60(4.6)),"cruise window = steady curve after 0.5 s of turning"));
        }
        // 3. Noisy travel around the old 117 degree backward boundary.
        if(Want("noise-117@60Hz")){
            var path=new List<(double,Vector3,Vector3)>();var p=Vector3.zero;
            for(double t=0;t<=4+1e-9;t+=.05){float v=t<.4?0:t<.8?(float)(2.6*(t-.4)/.4):2.6f;float travel=117+9*(float)Math.Sin(2*Math.PI*1.3*t)+5*(float)Math.Sin(2*Math.PI*3.1*t+1);path.Add((t,p,Facing(0)));p+=Facing(travel)*v*.05f;}
            var pics=Pictures(baseConfig,subject,path,new Vector3(-2,0,-6));var run=Play(baseConfig,pics,subject,false);
            cases.Add(Measured("noise-117","boundary","controlled",run,117,2.6f,0,(Frame60(.8),Frame60(1.2),Frame60(4),Frame60(4)),"travel 117 deg +-9/+-5 deg deterministic noise, facing fixed"));
        }
        // 4. Two real direction changes while jogging: forward, cut right, reverse back-left.
        List<WorldFrame> changes;
        {
            var path=new List<(double,Vector3,Vector3)>();var p=Vector3.zero;float heading=0,face=0;
            for(double t=0;t<=5.2+1e-9;t+=.05){
                float v=t<.4?0:t<.8?(float)(3.2*(t-.4)/.4):t<4.4?3.2f:t<4.8?(float)(3.2*(4.8-t)/.4):0;
                float target=t<1.8?0:t<3.1?90:-150;heading=target;face=Mathf.MoveTowardsAngle(face,target,(t<3.1?360:500)*.05f);
                path.Add((t,p,Facing(face)));p+=Facing(heading)*v*.05f;
            }
            changes=Pictures(baseConfig,subject,path,new Vector3(-8,0,-2));if(Want("direction-changes@60Hz")){var run=Play(baseConfig,changes,subject,true);
            cases.Add(Measured("direction-changes","changes","controlled",run,0,3.2f,0,(Frame60(1.7),Frame60(1.9),Frame60(3.0),Frame60(3.5)),"start=first cut window, cruise=between cuts, stop=second cut (reverse) window"));}
        }
        // 5. Sprint stop.
        if(Want("sprint-stop@60Hz")){
            var path=Straight(0,6.2f,0,cruise:1.4,brake:.6,rest:1.0);var pics=Pictures(baseConfig,subject,path,new Vector3(-14,0,0));var run=Play(baseConfig,pics,subject,true);
            cases.Add(Measured("sprint-stop","transitions","controlled",run,0,6.2f,0,(Frame60(.5),Frame60(1.5),Frame60(2.5),Frame60(3.7))));
        }
        // 5b. r3: short sprints (0.9 s acceleration to 6 m/s, 0.7 s, 0.7 s stop) in five directions.
        foreach(var (dn,travel) in new[]{("fwd",0f),("fwd-right",45f),("fwd-left",-45f),("right",90f),("left",-90f)}){if(!Want("short-sprint-"+dn+"@60Hz"))continue;
            var path=Straight(travel,6.0f,0,idle:.6,accel:.9,cruise:.7,brake:.7,rest:.9);var pics=Pictures(baseConfig,subject,path,new Vector3(-10,0,0)-Facing(travel)*2f);var run=Play(baseConfig,pics,subject,true);
            cases.Add(Measured("short-sprint-"+dn,"short-sprints","controlled",run,travel,6f,0,(Frame60(.5),Frame60(1.5),Frame60(2.2),Frame60(3.8)),"0.9 s acceleration, 0.7 s at 6 m/s, 0.7 s stop"));
        }
        // 5c. r3: tight curves and a reversing S-curve; the facing follows the tangent.
        {
            var tight=Curve(4.2,t=>Ramp(t,.4,.9,0,2.5f),t=>t>=1.3&&t<2.8?300f:0f);
            if(Want("curve-tight-300@60Hz"))cases.Add(Measured("curve-tight-300","curves","controlled",Play(baseConfig,Pictures(baseConfig,subject,tight,new Vector3(-6,0,-2)),subject,true),0,2.5f,0,(Frame60(.9),Frame60(1.6),Frame60(2.8),Frame60(4.2)),"2.5 m/s, 300 deg/s for 1.5 s"));
            var s=Curve(4.6,t=>Ramp(t,.4,.9,0,3.5f),t=>t>=1.3&&t<2.3?180f:t>=2.3&&t<3.3?-180f:0f);
            if(Want("s-curve-180@60Hz"))cases.Add(Measured("s-curve-180","curves","controlled",Play(baseConfig,Pictures(baseConfig,subject,s,new Vector3(-10,0,-2)),subject,true),0,3.5f,0,(Frame60(.9),Frame60(1.6),Frame60(3.3),Frame60(4.6)),"3.5 m/s, 180 deg/s right 1 s then left 1 s"));
            var fast=Curve(4.2,t=>Ramp(t,.4,1.3,0,5.5f),t=>t>=1.5&&t<3.0?120f:0f);
            if(Want("curve-sprint-120@60Hz"))cases.Add(Measured("curve-sprint-120","curves","controlled",Play(baseConfig,Pictures(baseConfig,subject,fast,new Vector3(-14,0,-8)),subject,true),0,5.5f,0,(Frame60(1.3),Frame60(1.9),Frame60(3.0),Frame60(4.2)),"5.5 m/s, 120 deg/s for 1.5 s"));
        }
        // 5d. r3: diagonal cuts, a reversal and late/abrupt stops; the facing follows the travel at a finite rate.
        List<WorldFrame> cutStop,reverseStop;
        {
            var cut=Course(5.0,t=>t<4.2?Ramp(t,.4,1.0,0,4.5f):Ramp(t,4.2,4.7,4.5f,0),t=>t<1.8?0:t<2.8?45:-45,t=>t<1.8?0:t<2.8?45:-45,400);
            if(Want("cut-diagonal@60Hz"))cases.Add(Measured("cut-diagonal","changes","controlled",Play(baseConfig,Pictures(baseConfig,subject,cut,new Vector3(-14,0,0)),subject,true),0,4.5f,0,null,"4.5 m/s, cut +45 then -45 deg, stop"));
            var cs=Course(3.8,t=>t<2.2?Ramp(t,.4,1.0,0,3.2f):Ramp(t,2.2,2.7,3.2f,0),t=>t<2.0?0:90,t=>t<2.0?0:90,450);cutStop=Pictures(baseConfig,subject,cs,new Vector3(-8,0,-4));
            if(Want("cut-stop-90@60Hz"))cases.Add(Measured("cut-stop-90","changes","controlled",Play(baseConfig,cutStop,subject,true),0,3.2f,0,null,"3.2 m/s, cut 90 deg right at 2.0 s and stop by 2.7 s (late stop after a cut)"));
            var rev=Course(4.0,t=>t<2.0?Ramp(t,.4,1.0,0,4f):t<2.4?Ramp(t,2.0,2.2,4f,1f):t<3.2?Ramp(t,2.2,2.6,1f,3f):Ramp(t,3.2,3.6,3f,0),t=>t<2.1?0:180,t=>t<2.1?0:180,500);
            reverseStop=Pictures(baseConfig,subject,rev,new Vector3(-6,0,4));
            if(Want("reverse-stop@60Hz"))cases.Add(Measured("reverse-stop","changes","controlled",Play(baseConfig,reverseStop,subject,true),0,4f,0,null,"4 m/s, reverse 180 deg at 2.1 s, stop at 3.6 s"));
            var abrupt=Straight(0,3.0f,0,cruise:1.4,brake:.3,rest:1.0);
            if(Want("jog-stop-abrupt@60Hz"))cases.Add(Measured("jog-stop-abrupt","transitions","controlled",Play(baseConfig,Pictures(baseConfig,subject,abrupt,new Vector3(-8,0,0)),subject,true),0,3f,0,(Frame60(.5),Frame60(1.5),Frame60(2.5),Frame60(3.8)),"3 m/s stop within 0.3 s"));
            var walkStop=Straight(-135,1.4f,0,cruise:1.2,brake:.25,rest:1.0);
            if(Want("walk-back-left-stop-abrupt@60Hz"))cases.Add(Measured("walk-back-left-stop-abrupt","transitions","controlled",Play(baseConfig,Pictures(baseConfig,subject,walkStop,new Vector3(-4,0,0)),subject,true),-135,1.4f,0,(Frame60(.5),Frame60(1.5),Frame60(2.3),Frame60(3.5)),"1.4 m/s back-left stop within 0.25 s"));
        }
        // 5e. r3: locomotion after native-shaped actions (pass, receive, shot).
        List<WorldFrame> passJog,receiveSprint,shotStop;
        {
            var path=Course(5.0,t=>t<2.0?Ramp(t,.4,1.0,0,3f):t<2.6?2.6f:t<3.6?Ramp(t,2.6,2.8,2.6f,3f):Ramp(t,3.6,4.2,3f,0),t=>0,t=>0);passJog=Pictures(baseConfig,subject,path,new Vector3(-8,0,0),owner:true);
            Act(passJog,subject,1.65,.35,"passReady","kick-ready",false);Act(passJog,subject,2.0,.62,"pass","pass-1",true,12);
            if(Want("pass-jog@60Hz"))cases.Add(Measured("pass-jog","actions","controlled",Play(baseConfig,passJog,subject,true),0,3f,0,null,"jog 3 m/s, passReady 0.35 s, pass at 2.0 s (0.62 s) while running on, stop"));
            var rec=Course(5.2,t=>t<1.6?Ramp(t,.3,.8,0,1.4f):t<2.05?Ramp(t,1.6,2.05,1.4f,1f):t<4.0?Ramp(t,2.05,3.0,1f,5f):Ramp(t,4.0,4.6,5f,0),t=>t<2.05?0:30,t=>t<2.05?0:30,300);var recPics=Pictures(baseConfig,subject,rec,new Vector3(-10,0,0),owner:true);
            Act(recPics,subject,1.6,.45,"receive","receive-1",true,0,true);receiveSprint=recPics;
            if(Want("receive-sprint@60Hz"))cases.Add(Measured("receive-sprint","actions","controlled",Play(baseConfig,recPics,subject,true),0,5f,0,null,"walk, receive at 1.6 s (0.45 s), accelerate to 5 m/s on a 30 deg diagonal, stop"));
            var shot=Course(4.4,t=>t<2.0?Ramp(t,.4,1.1,0,4f):Ramp(t,2.0,2.8,4f,0),t=>0,t=>0);var shotPics=Pictures(baseConfig,subject,shot,new Vector3(-12,0,0),owner:true);
            Act(shotPics,subject,1.65,.35,"kickReady","kick-ready",false);Act(shotPics,subject,2.0,.95,"shot","shot-1",true,25);shotStop=shotPics;
            if(Want("shot-stop@60Hz"))cases.Add(Measured("shot-stop","actions","controlled",Play(baseConfig,shotPics,subject,true),0,4f,0,null,"run 4 m/s, kickReady, shot at 2.0 s (0.95 s) while braking to rest"));
            // B11 (r132): a sprinting player stops dead at a native foul and shows foulOffender over its 2.7 s window (progress
            // age/2.7, duration 1 as the bridge sends it), then stands. Origin r21-controlled: judged by the R21 foul-window gates only.
            var foulPath=Straight(0,5.6f,0,idle:.6,accel:.5,cruise:1.4,brake:0,rest:4.2);var foulPics=Pictures(baseConfig,subject,foulPath,new Vector3(-12,0,0));
            foreach(var w in foulPics){double t=w.clock-10;var pose=w.players[subject];if(t>=2.5-1e-9&&t<2.5+FootballDuelTiming.StumbleLength-1e-9){pose.action="foulOffender";pose.actionId="foul:1";pose.progress=Math.Clamp((t-2.5)/FootballDuelTiming.StumbleLength,0,1);pose.duration=1;pose.moving=false;}else if(t>=2.5){pose.action="idle";pose.actionId="idle";pose.moving=false;}}
            if(Want("foul-offender-sprint@60Hz")){var foulRun=Play(baseConfig,foulPics,subject,true);var fc=Measured("foul-offender-sprint","actions","r21-controlled",foulRun,0,5.6f,0,null,"sprint 5.6 m/s, dead stop at 2.5 s into a 2.7 s foulOffender window, then standing (B11)");fc.fouls=Fouls(foulPics,subject,foulRun.samples);cases.Add(fc);}
        }
        // 5f. r15: interrupted preparation, action change, the plant edge and a stop with a restart, each at
        // 60, 30 and 120 Hz (origin "r15": gated apart from every earlier set, R15Gates). readyAbort: a 0.25 s
        // passReady shown to progress 0.8 (its last picture before a contact that never comes), one picture
        // without an action and the carried ball received at the same point three pictures after the last
        // ready one (native 160114 field 11 at 34.60-34.67 s). readyChange: a kickReady cut off at 0.57 that
        // becomes a passReady and a pass while slowing to 1 m/s (native kickReady <-> passReady changes).
        // plantEdge: a receive, a passReady and a pass while the received speed swings 0.25-0.55 m/s around the
        // 0.4 m/s plant edge every 0.3 s. stopRestart: a stop from 3 m/s, a pass at rest and a restart to 3 m/s
        // within the pass's plant age (the standing foot handed from the plant to the foot lock).
        List<WorldFrame> readyAbort,readyChange,plantEdge,stopRestart;
        {
            var abort=Course(4.4,t=>t<1.0?Ramp(t,.3,.9,0,1.4f):t<3.0?1.4f:Ramp(t,3.0,3.6,1.4f,0),t=>0,t=>0);readyAbort=Pictures(baseConfig,subject,abort,new Vector3(-6,0,0),owner:true);
            Act(readyAbort,subject,1.40,.25,"passReady","ready-abort",false);Act(readyAbort,subject,1.70,.45,"receive","receive-after-abort",true);
            var change=Course(4.6,t=>t<1.0?Ramp(t,.3,1.0,0,2.5f):t<2.6?Ramp(t,1.0,1.6,2.5f,1f):t<3.8?Ramp(t,2.6,3.2,1f,2.5f):Ramp(t,3.8,4.4,2.5f,0),t=>0,t=>0);readyChange=Pictures(baseConfig,subject,change,new Vector3(-8,0,0),owner:true);
            Act(readyChange,subject,1.30,.35,"kickReady","kick-ready-change",false);Act(readyChange,subject,1.55,.35,"passReady","pass-ready-change",false);Act(readyChange,subject,1.90,.62,"pass","pass-change",true,12);
            var edge=Course(4.6,t=>t<.6?Ramp(t,.1,.6,0,.4f):t<3.9?(float)(.4+.15*Math.Sin(2*Math.PI*(t-.6)/.6)):Ramp(t,3.9,4.3,.4f,0),t=>0,t=>0);plantEdge=Pictures(baseConfig,subject,edge,new Vector3(-4,0,0),owner:true);
            Act(plantEdge,subject,1.20,.45,"receive","receive-edge",true,0,true);Act(plantEdge,subject,1.95,.35,"passReady","pass-ready-edge",false);Act(plantEdge,subject,2.30,.62,"pass","pass-edge",true,10);
            var restart=Course(4.6,t=>t<1.2?Ramp(t,.3,.9,0,3f):t<1.7?Ramp(t,1.2,1.7,3f,0):t<2.25?0:t<3.8?Ramp(t,2.25,2.85,0,3f):Ramp(t,3.8,4.4,3f,0),t=>0,t=>0);stopRestart=Pictures(baseConfig,subject,restart,new Vector3(-8,0,0),owner:true);
            Act(stopRestart,subject,1.75,.35,"passReady","pass-ready-rest",false);Act(stopRestart,subject,2.10,.62,"pass","pass-rest",true,12);
            foreach(int rate in new[]{60,30,120})foreach(var (name,pics,speed,note) in new[]{("ready-abort-receive",readyAbort,1.4f,"walk 1.4 m/s, passReady 0.25 s shown to progress 0.8 (1.60 s), no contact, the carried ball received at 1.70 s (0.45 s)"),("ready-change-pass",readyChange,2.5f,"2.5 m/s slowing to 1 m/s, kickReady from 1.30 s cut off at 0.57, passReady 1.55 s, pass at 1.90 s (0.62 s), jog on"),("plant-edge",plantEdge,.55f,"0.25-0.55 m/s around the 0.4 m/s plant edge, receive at 1.20 s, passReady 1.95 s, pass at 2.30 s"),("stop-restart-pass",stopRestart,3f,"3 m/s, stop by 1.7 s, passReady at rest 1.75 s, pass 2.10 s, restart to 3 m/s from 2.25 s")}){
                if(!Want(name+"@"+rate+"Hz"))continue;var run=Play(baseConfig,pics,subject,true,rate:rate);var c=Measured(name,"r15","r15",run,0,speed,0,null,note+(rate==60?"":"; "+rate+" Hz display"),rate);c.countdowns=Countdowns(pics,subject,run.samples).ToArray();cases.Add(c);}
        }
        // 5g. r20: the action fixtures of 5e and 5f with the native timing their construction knows (Timed: actionAt, durationKnown;
        // origin "r20", gated apart from every earlier set, R20Gates), at 60, 30 and 120 Hz. Without the timing fields they are
        // the legacy fixtures (checked); a source without the R20 picture fields plays them as the legacy fixtures.
        foreach(var (name,pics,speed) in new[]{("pass-jog",passJog,3f),("receive-sprint",receiveSprint,5f),("shot-stop",shotStop,4f),("ready-abort-receive",readyAbort,1.4f),("ready-change-pass",readyChange,2.5f),("plant-edge",plantEdge,.55f),("stop-restart-pass",stopRestart,3f)}){
            var timed=Timed(pics,subject);r20Checks.Add(new Check{name=name+"+timing pictures without their timing fields are the legacy fixture (every serialised field)",passed=StripsToLegacy(timed,pics),value=timed.Count});
            if(TimingContract){int marked=0;foreach(var w in timed)if(Get(w.players[subject],"actionAtKnown",false))marked++;r20Checks.Add(new Check{name=name+"+timing pictures with a known native action time",passed=marked>0,value=marked});}
            foreach(int rate in new[]{60,30,120}){if(!Want(name+"+timing@"+rate+"Hz"))continue;var run=Play(baseConfig,timed,subject,true,rate:rate);var timing=FixtureTiming(pics,subject);var c=Measured(name+"+timing","r20","r20",run,0,speed,0,null,"R20 timed fixture: "+name+" with its known native action time"+(rate==60?"":"; "+rate+" Hz display"),rate,timing);c.countdowns=Countdowns(timed,subject,run.samples,timing).ToArray();cases.Add(c);}
        }
        // 6. Diagonal and straight dribbling: the carrier reach every stride.
        foreach(float travel in new[]{0f,45f,-45f}){if(!Want("carrier-"+(travel==0?"straight":travel>0?"diag-right":"diag-left")+"@60Hz"))continue;
            var path=Straight(travel,3.0f,0,cruise:2.4);var pics=Pictures(baseConfig,subject,path,new Vector3(-8,0,0),owner:true);var run=Play(baseConfig,pics,subject,false);
            cases.Add(Measured("carrier-"+(travel==0?"straight":travel>0?"diag-right":"diag-left"),"carrier","controlled",run,travel,3,0,(Frame60(.5),Frame60(1.5),Frame60(3.5),Frame60(4.8))));
        }
        // 7. Keeper side steps: left, right, left (two direction changes), slow and quick.
        foreach(float speed in new[]{1.1f,2.2f}){if(!Want("keeper-shuffle-"+speed.ToString("0.0",Inv)+"@60Hz"))continue;
            var path=new List<(double,Vector3,Vector3)>();var p=Vector3.zero;
            for(double t=0;t<=4.8+1e-9;t+=.05){float v=t<.5?0:t<4.1?speed:0;float side=t<1.7?90:t<2.9?-90:90;path.Add((t,p,Facing(0)));p+=Facing(-side)*v*.05f;}
            var pics=Pictures(baseConfig,keeper,path,new Vector3(-29,0,0));var run=Play(baseConfig,pics,keeper,true);
            cases.Add(Measured("keeper-shuffle-"+speed.ToString("0.0",Inv),"keeper","controlled",run,-90,speed,0,(Frame60(.4),Frame60(.9),Frame60(4.1),Frame60(4.8)),"left (+Z for facing +X) 1.2 s, right 1.2 s, left 1.2 s"));
        }
        // 7b. The same received pictures at 30 and 120 display frames per second.
        foreach(int rate in new[]{30,120}){
            int F(double seconds)=>(int)Math.Round(seconds*rate);
            foreach(var (name,travel,speed) in new[]{("walk-right",90f,1.4f),("jog-right",90f,3.0f),("walk-back-left",-135f,1.4f),("jog-back-left",-135f,3.0f),("jog-fwd",0f,3.0f),("sprint-fwd",0f,5.6f)}){if(!Want(name+"@"+rate+"Hz"))continue;
                var pics=Pictures(baseConfig,subject,Straight(travel,speed,0),new Vector3(-6,0,0)-Facing(travel)*(speed*1.2f));var run=Play(baseConfig,pics,subject,true,rate:rate);
                cases.Add(Measured(name,"cadence","controlled",run,travel,speed,0,(F(.5),F(1.5),F(3.1),F(4.4)),rate+" Hz display of the same 20 Hz pictures",rate));
            }
            if(Want("curve-150@"+rate+"Hz")){var path=new List<(double,Vector3,Vector3)>();var p=Vector3.zero;float heading=0;for(double t=0;t<=4.6+1e-9;t+=.05){float v=t<.4?0:t<.9?(float)(3.5*(t-.4)/.5):3.5f;path.Add((t,p,Facing(heading)));if(t>=1.3&&t<4.3)heading+=150*.05f;p+=Facing(heading)*v*.05f;}
             var run=Play(baseConfig,Pictures(baseConfig,subject,path,new Vector3(-8,0,-4)),subject,false,rate:rate);cases.Add(Measured("curve-150","cadence","controlled",run,0,3.5f,0,(F(.9),F(1.8),F(4.2),F(4.6)),rate+" Hz display",rate));}
            if(Want("direction-changes@"+rate+"Hz")){var run=Play(baseConfig,changes,subject,true,rate:rate);cases.Add(Measured("direction-changes","cadence","controlled",run,0,3.2f,0,(F(1.7),F(1.9),F(3.0),F(3.5)),rate+" Hz display",rate));}
            if(Want("cut-stop-90@"+rate+"Hz")){var run=Play(baseConfig,cutStop,subject,true,rate:rate);cases.Add(Measured("cut-stop-90","cadence","controlled",run,0,3.2f,0,null,rate+" Hz display",rate));}
            if(Want("pass-jog@"+rate+"Hz")){var run=Play(baseConfig,passJog,subject,true,rate:rate);cases.Add(Measured("pass-jog","cadence","controlled",run,0,3f,0,null,rate+" Hz display",rate));}
            if(Want("keeper-shuffle-1.1@"+rate+"Hz")){var path=new List<(double,Vector3,Vector3)>();var p=Vector3.zero;for(double t=0;t<=4.8+1e-9;t+=.05){float v=t<.5?0:t<4.1?1.1f:0;float side=t<1.7?90:t<2.9?-90:90;path.Add((t,p,Facing(0)));p+=Facing(-side)*v*.05f;}
             var run=Play(baseConfig,Pictures(baseConfig,keeper,path,new Vector3(-29,0,0)),keeper,true,rate:rate);cases.Add(Measured("keeper-shuffle-1.1","cadence","controlled",run,-90,1.1f,0,(F(.4),F(.9),F(4.1),F(4.8)),rate+" Hz display",rate));}
        }
        // 8. Pause and seek on the direction-change fixture.
        if(Want("determinism")){
            var a=Play(baseConfig,changes,subject,false,stopAfter:Frame60(2.4));
            var actors=Field<List<Transform>>("actors");var actor=actors[subject];var held=Hash(actor);
            var last=Field<WorldFrame>("displayed");
            for(int k=0;k<3;k++){var same=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(last));same.sequence=++sequence;Send(new WorldCommand{kind="frame",frame=same});}
            Require(Hash(actor)==held,"a paused native clock keeps the exact rig pose (3 repeated pictures)");
            // Seek back to 1.0 s and replay 1.2 s twice; both must match.
            var display=new List<WorldFrame>(Display(changes));
            List<string> Seek(){var hashes=new List<string>();for(int i=Frame60(1.0);i<Frame60(2.2);i++){var f=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(display[i]));f.sequence=++sequence;f.phase="paused";Send(new WorldCommand{kind="frame",frame=f});hashes.Add(Hash(actor));}return hashes;}
            var first=Seek();var more=Play(baseConfig,changes,subject,false,stopAfter:Frame60(3.6));actor=Field<List<Transform>>("actors")[subject];var second=Seek();
            bool equal=first.Count==second.Count;for(int i=0;equal&&i<first.Count;i++)equal&=first[i]==second[i];
            Require(equal,"replay seek to the same native time from different states yields identical rig poses",first.Count);
        }
        // 9. Recordings (normal = 20 fps of the 60 Hz view, slow = every 60 Hz frame at 20 fps).
        if(render&&Want("recordings")){
            // r11: rate = display rate of the recorded fixture (normal: real time at 20 fps; slow: every
            // display picture, 3x slower at 60 Hz and 30 Hz, slowDelay overrides); cam/when/w/h as Play.
            void Record(string name,WorldConfig config,List<WorldFrame> pics,int who,int rate=60,Func<WorldFrame,WorldCamera> cam=null,Func<WorldFrame,bool> when=null,int w=320,int h=240,int slowDelay=0){
                var frames=new List<Color32[]>();Play(config,pics,who,false,record:frames,recordW:w,recordH:h,rate:rate,camera:cam,recordWhen:when);
                var normal=new List<Color32[]>();for(int i=0;i<frames.Count;i+=Math.Max(1,rate/20))normal.Add(frames[i]);
                Gif(Path.Combine(folder,name+"-normal.gif"),normal,w,h,5);Gif(Path.Combine(folder,name+"-slow.gif"),frames,w,h,slowDelay>0?slowDelay:5*60/rate);recordings.Add(name+"-normal.gif");recordings.Add(name+"-slow.gif");
                // Filmstrip: 16 evenly spaced frames (4 x 4) of the same recording.
                var strip=new Texture2D(4*w,4*h,TextureFormat.RGB24,false);for(int k=0;k<16;k++){var px=frames[Math.Min(frames.Count-1,k*(frames.Count-1)/15)];strip.SetPixels32((k%4)*w,(3-k/4)*h,w,h,px);}strip.Apply();File.WriteAllBytes(Path.Combine(folder,name+"-strip.png"),strip.EncodeToPNG());images.Add(name+"-strip.png");UnityEngine.Object.DestroyImmediate(strip);
            }
            Record("jog-right",baseConfig,Pictures(baseConfig,subject,Straight(90,3,0),new Vector3(-6,0,0)-Facing(90)*3.6f),subject);
            Record("jog-back-left",baseConfig,Pictures(baseConfig,subject,Straight(-135,3,0),new Vector3(-6,0,0)-Facing(-135)*3.6f),subject);
            Record("walk-fwd-left",baseConfig,Pictures(baseConfig,subject,Straight(-45,1.4f,0),new Vector3(-6,0,0)-Facing(-45)*1.7f),subject);
            Record("direction-changes",baseConfig,changes,subject);
            {var path=new List<(double,Vector3,Vector3)>();var p=Vector3.zero;float heading=0;for(double t=0;t<=4.6+1e-9;t+=.05){float v=t<.4?0:t<.9?(float)(3.5*(t-.4)/.5):3.5f;path.Add((t,p,Facing(heading)));if(t>=1.3&&t<4.3)heading+=150*.05f;p+=Facing(heading)*v*.05f;}Record("curve-150",baseConfig,Pictures(baseConfig,subject,path,new Vector3(-8,0,-4)),subject);}
            {var path=new List<(double,Vector3,Vector3)>();var p=Vector3.zero;for(double t=0;t<=4.8+1e-9;t+=.05){float v=t<.5?0:t<4.1?1.1f:0;float side=t<1.7?90:t<2.9?-90:90;path.Add((t,p,Facing(0)));p+=Facing(-side)*v*.05f;}Record("keeper-shuffle",baseConfig,Pictures(baseConfig,keeper,path,new Vector3(-29,0,0)),keeper);}
            Record("carrier-diagonal",baseConfig,Pictures(baseConfig,subject,Straight(45,3,0,cruise:2.4),new Vector3(-8,0,0),owner:true),subject);
            Record("jog-stop",baseConfig,Pictures(baseConfig,subject,Straight(0,3,0),new Vector3(-8,0,0)),subject);
            // r3 recordings: late stop after a cut, a diagonal short sprint, the S-curve and locomotion after a pass.
            Record("cut-stop-90",baseConfig,cutStop,subject);
            Record("short-sprint-fwd-right",baseConfig,Pictures(baseConfig,subject,Straight(45,6.0f,0,idle:.6,accel:.9,cruise:.7,brake:.7,rest:.9),new Vector3(-10,0,0)-Facing(45)*2f),subject);
            Record("s-curve-180",baseConfig,Pictures(baseConfig,subject,Curve(4.6,t=>Ramp(t,.4,.9,0,3.5f),t=>t>=1.3&&t<2.3?180f:t>=2.3&&t<3.3?-180f:0f),new Vector3(-10,0,-2)),subject);
            Record("pass-jog",baseConfig,passJog,subject);
            // r6 recordings: the lateral short sprints and the tight curve (the r3 open glide gates)
            // and locomotion after a receive and a shot, the same fixtures as their measured cases.
            Record("short-sprint-right",baseConfig,Pictures(baseConfig,subject,Straight(90,6.0f,0,idle:.6,accel:.9,cruise:.7,brake:.7,rest:.9),new Vector3(-10,0,0)-Facing(90)*2f),subject);
            Record("short-sprint-left",baseConfig,Pictures(baseConfig,subject,Straight(-90,6.0f,0,idle:.6,accel:.9,cruise:.7,brake:.7,rest:.9),new Vector3(-10,0,0)-Facing(-90)*2f),subject);
            Record("curve-tight-300",baseConfig,Pictures(baseConfig,subject,Curve(4.2,t=>Ramp(t,.4,.9,0,2.5f),t=>t>=1.3&&t<2.8?300f:0f),new Vector3(-6,0,-2)),subject);
            Record("receive-sprint",baseConfig,receiveSprint,subject);
            Record("shot-stop",baseConfig,shotStop,subject);
            // r3 close-ups: every 60 Hz picture of the measured snap windows (left to right).
            void Closeup(string name,List<WorldFrame> pics,int who,double from,double to,Func<WorldFrame,WorldCamera> cam=null){
                var frames=new List<Texture2D>();Play(baseConfig,pics,who,false,(i,p)=>p.clock>=from-1e-6&&p.clock<=to+1e-6,(i,t)=>frames.Add(Scale(t,200,250)),camera:cam);
                var strip=new Texture2D(Math.Max(1,frames.Count)*200,250,TextureFormat.RGB24,false);for(int k=0;k<frames.Count;k++){strip.SetPixels(k*200,0,200,250,frames[k].GetPixels());UnityEngine.Object.DestroyImmediate(frames[k]);}
                strip.Apply();var file=name+"-closeup.png";File.WriteAllBytes(Path.Combine(folder,file),strip.EncodeToPNG());images.Add(file);UnityEngine.Object.DestroyImmediate(strip);
            }
            Closeup("late-stop-14.633-14.800",changes,subject,14.633,14.800);
            Closeup("receive-release-11.700-11.850",receiveSprint,subject,11.700,11.850);
            Closeup("shot-contact-11.917-12.067",shotStop,subject,11.917,12.067);
            // r11 recordings: the four braking fixtures and walk-right at 30 Hz (the R9 rest gates, same
            // pictures as their measured cases), and low side views of the feet through every foot-action
            // contact/recovery and the reverse-stop support transfer (normal; slow = every 60 Hz picture
            // at 10 fps, 6x slower), with close-up strips of every 60 Hz picture of those windows.
            foreach(var (dn,travel) in new[]{("back",180f),("back-left",-135f),("fwd-right",45f)})Record("sprint-"+dn,baseConfig,Pictures(baseConfig,subject,Straight(travel,5.6f,0),new Vector3(-6,0,0)-Facing(travel)*(5.6f*1.2f)),subject);
            Record("reverse-stop",baseConfig,reverseStop,subject);
            Record("walk-right-30hz",baseConfig,Pictures(baseConfig,subject,Straight(90,1.4f,0),new Vector3(-6,0,0)-Facing(90)*(1.4f*1.2f)),subject,30);
            var feetSide=new Vector3(0,0,-1);
            Record("shot-contact-feet",baseConfig,shotStop,subject,cam:Feet(subject,feetSide),when:p=>p.clock>=11.8-1e-6&&p.clock<=12.4+1e-6,w:400,h:300,slowDelay:10);
            Record("pass-contact-feet",baseConfig,passJog,subject,cam:Feet(subject,feetSide),when:p=>p.clock>=11.8-1e-6&&p.clock<=12.35+1e-6,w:400,h:300,slowDelay:10);
            Record("receive-contact-feet",baseConfig,receiveSprint,subject,cam:Feet(subject,feetSide),when:p=>p.clock>=11.45-1e-6&&p.clock<=11.95+1e-6,w:400,h:300,slowDelay:10);
            Record("reverse-stop-feet",baseConfig,reverseStop,subject,cam:Feet(subject,feetSide),when:p=>p.clock>=12.1-1e-6&&p.clock<=12.75+1e-6,w:400,h:300,slowDelay:10);
            Closeup("shot-contact-11.950-12.150-feet",shotStop,subject,11.950,12.150,Feet(subject,feetSide));
            Closeup("pass-contact-11.950-12.150-feet",passJog,subject,11.950,12.150,Feet(subject,feetSide));
            Closeup("receive-contact-11.533-11.733-feet",receiveSprint,subject,11.533,11.733,Feet(subject,feetSide));
            Closeup("reverse-stop-12.350-12.550-feet",reverseStop,subject,12.350,12.550,Feet(subject,feetSide));
            // r13: every 60 Hz picture of the foot-action entry, contact and return 11.90-12.12 s (shot: chase and
            // low side view; pass: low side view) and normal/slow recordings of the shot and pass ready-to-contact.
            Closeup("shot-entry-11.900-12.117",shotStop,subject,11.900,12.117);
            Closeup("shot-entry-11.900-12.117-feet",shotStop,subject,11.900,12.117,Feet(subject,feetSide));
            Closeup("pass-entry-11.900-12.117-feet",passJog,subject,11.900,12.117,Feet(subject,feetSide));
            Record("shot-entry",baseConfig,shotStop,subject,when:p=>p.clock>=11.7-1e-6&&p.clock<=12.3+1e-6,slowDelay:10);
            Record("pass-entry-feet",baseConfig,passJog,subject,cam:Feet(subject,feetSide),when:p=>p.clock>=11.7-1e-6&&p.clock<=12.3+1e-6,w:400,h:300,slowDelay:10);
            // r16: normal/slow recordings of the r15 fixtures (recording only, no gate): interrupted preparation
            // and receive (also at 120 Hz), kickReady -> passReady change, the 0.4 m/s plant edge, stop and restart.
            Record("ready-abort-receive",baseConfig,readyAbort,subject,when:p=>p.clock>=11.2-1e-6&&p.clock<=12.1+1e-6,slowDelay:10);
            Record("ready-abort-receive-120hz",baseConfig,readyAbort,subject,120,when:p=>p.clock>=11.2-1e-6&&p.clock<=12.1+1e-6,slowDelay:5);
            Record("ready-change-pass",baseConfig,readyChange,subject,when:p=>p.clock>=11.1-1e-6&&p.clock<=12.4+1e-6,slowDelay:10);
            Record("plant-edge",baseConfig,plantEdge,subject,when:p=>p.clock>=10.9-1e-6&&p.clock<=13.2+1e-6,slowDelay:10);
            Record("stop-restart-pass",baseConfig,stopRestart,subject,when:p=>p.clock>=11.4-1e-6&&p.clock<=13.2+1e-6,slowDelay:10);
            // r18: the 120 Hz landing of ready-change-pass (P3) and the 120 Hz plant-edge contact entry (open C), recording only.
            Record("ready-change-pass-120hz",baseConfig,readyChange,subject,120,when:p=>p.clock>=11.45-1e-6&&p.clock<=11.75+1e-6,slowDelay:5);
            Record("plant-edge-120hz",baseConfig,plantEdge,subject,120,when:p=>p.clock>=11.05-1e-6&&p.clock<=11.30+1e-6,slowDelay:5);
            // r20: the same fixtures with their known native action time (Timed; a source without the R20 fields plays the
            // legacy fixture): the plant-edge receive at 120 and 60 Hz (C) and its feet, the receive after the aborted
            // countdown at 120 Hz, the walking receive, the pass and shot entries.
            Record("timed-plant-edge-120hz",baseConfig,Timed(plantEdge,subject),subject,120,when:p=>p.clock>=11.05-1e-6&&p.clock<=11.30+1e-6,slowDelay:5);
            Record("timed-plant-edge-120hz-feet",baseConfig,Timed(plantEdge,subject),subject,120,cam:Feet(subject,feetSide),when:p=>p.clock>=11.05-1e-6&&p.clock<=11.30+1e-6,w:400,h:300,slowDelay:5);
            Record("timed-plant-edge",baseConfig,Timed(plantEdge,subject),subject,when:p=>p.clock>=10.9-1e-6&&p.clock<=13.2+1e-6,slowDelay:10);
            Record("timed-ready-abort-receive-120hz",baseConfig,Timed(readyAbort,subject),subject,120,when:p=>p.clock>=11.2-1e-6&&p.clock<=12.1+1e-6,slowDelay:5);
            Record("timed-receive-sprint",baseConfig,Timed(receiveSprint,subject),subject,when:p=>p.clock>=11.3-1e-6&&p.clock<=12.2+1e-6,slowDelay:10);
            Record("timed-pass-entry-feet",baseConfig,Timed(passJog,subject),subject,cam:Feet(subject,feetSide),when:p=>p.clock>=11.7-1e-6&&p.clock<=12.3+1e-6,w:400,h:300,slowDelay:10);
            Record("timed-shot-entry",baseConfig,Timed(shotStop,subject),subject,when:p=>p.clock>=11.7-1e-6&&p.clock<=12.3+1e-6,slowDelay:10);
        }
        // 10. Actual native pictures (captured seeded matches), all field players.
        // Captured native pictures: the output folder's own native-motion, else the evidence folder of this iteration.
        var nativeFolder=Path.Combine(repository,outputFolder??EvidenceFolder,"native-motion");if(!Directory.Exists(nativeFolder))nativeFolder=Path.Combine(repository,EvidenceFolder,"native-motion");
        foreach(var file in Directory.Exists(nativeFolder)&&Want("native")?Directory.GetFiles(nativeFolder,"motion-*.json"):new string[0]){
            if(file.EndsWith(".meta.json"))continue;cases.AddRange(Native(file));
        }
        // r20: Root's R20 contract captures (the run folder's own native-contract, else r20-unity-contract/native-contract).
        var contractFolder=Path.Combine(repository,outputFolder??EvidenceFolder,"native-contract");if(!Directory.Exists(contractFolder))contractFolder=Path.Combine(repository,EvidenceFolder,"r20-unity-contract","native-contract");
        foreach(var file in Directory.Exists(contractFolder)&&Want("contract")?Directory.GetFiles(contractFolder,"motion-*.json"):new string[0]){if(file.EndsWith(".meta.json"))continue;cases.AddRange(Native(file,true));}
        // r21: further native129 captures of this run (its own folder native129-rig, read only), origin r21-native.
        var r21Folder=Path.Combine(repository,outputFolder??EvidenceFolder,"native129-rig");
        foreach(var file in Directory.Exists(r21Folder)&&Want("native129")?Directory.GetFiles(r21Folder,"motion-*.json"):new string[0]){if(file.EndsWith(".meta.json"))continue;cases.AddRange(Native(file,true,"native129"));}
        // r132 (B05/B06/B11): fresh captures of the production bridge picture (work/capture-native-motion-r132.cjs) in the run
        // folder's native132, family native132, origin r21-native (R21Gates incl. the B11 foul gates; foot actions measured).
        var r132Folder=Path.Combine(repository,outputFolder??EvidenceFolder,"native132");
        foreach(var file in Directory.Exists(r132Folder)&&Want("native132")?Directory.GetFiles(r132Folder,"motion-*.json"):new string[0]){if(file.EndsWith(".meta.json"))continue;cases.AddRange(Native(file,true,"native132"));}
        var gates=Gates(cases);var supportSamples=new List<SupportSample>();var supportGates=SupportGates(cases,supportSamples);var contactGates=ContactGates(cases);var continuityGates=ContinuityGates(cases);var r15SupportSamples=new List<SupportSample>();var r15Gates=R15Gates(cases,r15SupportSamples);var r20SupportSamples=new List<SupportSample>();var r20Gates=R20Gates(cases,r20SupportSamples);var r21Gates=R21Gates(cases);var r132Gates=R132Gates(cases);r20Checks.Add(new Check{name="every display picture of the run is accepted by the bridge (rejected pictures)",passed=rejected==0,value=rejected});
        var clipFields=new List<string>();foreach(var field in typeof(ProbeBridge).GetFields(Flags))if(field.FieldType==typeof(AnimationClip)){var clip=field.GetValue(bridge) as AnimationClip;clipFields.Add(field.Name+"="+(clip!=null?clip.name:"-"));}
        var report=new Report{clipFields=string.Join(",",clipFields),gateNote=GateNote,gates=gates.ToArray(),supportGateNote=SupportGateNote,supportGates=supportGates.ToArray(),supportSamples=supportSamples.ToArray(),contactGateNote=ContactGateNote,contactGates=contactGates.ToArray(),continuityGateNote=ContinuityGateNote,continuityGates=continuityGates.ToArray(),r15GateNote=R15GateNote,r15Gates=r15Gates.ToArray(),r15SupportSamples=r15SupportSamples.ToArray(),r20GateNote=R20GateNote,r20Gates=r20Gates.ToArray(),r20SupportSamples=r20SupportSamples.ToArray(),r20Checks=r20Checks.ToArray(),r15Enforcement=R15Enforcement,label=label,sourceId=ProbeBuildIdentity.SourceId,unity=Application.unityVersion,device=SystemInfo.graphicsDeviceType.ToString(),note="Controlled cases are hand-built native-shaped 20 Hz pictures; native cases replay actual captured native pictures. Both are blended to 60 Hz by WorldViewPlayback.Blend and rendered through ProbeBridge.WorldCommand on the actual rig. Glide: horizontal world speed of the lowest sole point while it is within 3 cm of the standing sole height (supportGlide: only while it is also the lower, weight-bearing foot; a low swing foot is excluded); foot axis: undirected angle foot/travel; knee pole: knee bend direction vs foot direction; chest: shoulder line forward vs received facing. Editor evidence, not a device or GPU measurement.",cases=cases.ToArray(),determinism=checks.ToArray(),r132GateNote=R132GateNote,r132Gates=r132Gates.ToArray(),images=images.ToArray(),recordings=recordings.ToArray(),r21GateNote=R21GateNote,r21Gates=r21Gates.ToArray()};
        File.WriteAllText(Path.Combine(folder,"natural-motion.json"),JsonUtility.ToJson(report,true));
        var visible=VisibleSurfaceProbe.Current;var visibleLine=visible?.Finish(folder,"visible-surface.json");
        typeof(ProbeBridge).GetField("acceptDisplayLead",BindingFlags.Static|BindingFlags.NonPublic)?.SetValue(null,false);
        Drop();
        int failed=checks.FindAll(c=>!c.passed).Count;if(failed>0)throw new Exception(failed+" natural-motion determinism checks failed");
        // r5: every failed gate fails an enforced run; there is no exemption list.
        var failedGates=gates.FindAll(g=>!g.passed);var failedSupport=supportGates.FindAll(g=>!g.passed);
        if(enforce&&failedGates.Count>0)throw new Exception(failedGates.Count+" of "+gates.Count+" natural-motion quality gates failed, first: "+failedGates[0].name+" = "+failedGates[0].value.ToString("0.###",Inv)+" (limit "+failedGates[0].limit.ToString("0.###",Inv)+")");
        // r7: the support-transition gates are enforced the same way.
        if(enforce&&failedSupport.Count>0)throw new Exception(failedSupport.Count+" of "+supportGates.Count+" support-transition gates failed, first: "+failedSupport[0].name+" = "+failedSupport[0].value.ToString("0.###",Inv)+" (limit "+failedSupport[0].limit.ToString("0.###",Inv)+")");
        // r11: the contact-recovery and support-transfer gates are enforced the same way.
        var failedContact=contactGates.FindAll(g=>!g.passed);
        if(enforce&&failedContact.Count>0)throw new Exception(failedContact.Count+" of "+contactGates.Count+" contact-recovery/transfer gates failed, first: "+failedContact[0].name+" = "+failedContact[0].value.ToString("0.###",Inv)+" (limit "+failedContact[0].limit.ToString("0.###",Inv)+")");
        // r13: the foot-action continuity gates are enforced the same way.
        var failedContinuity=continuityGates.FindAll(g=>!g.passed);
        if(enforce&&failedContinuity.Count>0)throw new Exception(failedContinuity.Count+" of "+continuityGates.Count+" foot-action continuity gates failed, first: "+failedContinuity[0].name+" = "+failedContinuity[0].value.ToString("0.###",Inv)+" (limit "+failedContinuity[0].limit.ToString("0.###",Inv)+")");
        // r15: the interrupted-preparation, plant-edge and R13 regression-window gates are enforced the same way.
        // r20: as a regression lock against R18 (R15Enforcement): the report above keeps every r15 value and failure.
        var failedR15=r15Gates.FindAll(g=>!g.passed);
        var r15Regressions=failedR15.FindAll(g=>{int k=Array.FindIndex(R15Historical,h=>h.name==g.name);return k<0||g.value>R15Historical[k].r18+1e-4;});
        if(enforce&&r15Regressions.Count>0)throw new Exception(r15Regressions.Count+" of "+r15Gates.Count+" r15 gates failed beyond the R18 lock ("+failedR15.Count+" failed in total), first: "+r15Regressions[0].name+" = "+r15Regressions[0].value.ToString("0.###",Inv)+" (limit "+r15Regressions[0].limit.ToString("0.###",Inv)+")");
        // r20: the active R20 contract gates and the R20 input checks are enforced like the earlier sets.
        var failedR20=r20Gates.FindAll(g=>!g.passed);var failedR20Checks=r20Checks.FindAll(g=>!g.passed);
        if(enforce&&failedR20Checks.Count>0)throw new Exception(failedR20Checks.Count+" r20 input checks failed, first: "+failedR20Checks[0].name);
        if(enforce&&failedR20.Count>0)throw new Exception(failedR20.Count+" of "+r20Gates.Count+" r20 gates failed, first: "+failedR20[0].name+" = "+failedR20[0].value.ToString("0.###",Inv)+" (limit "+failedR20[0].limit.ToString("0.###",Inv)+")");
        // r21: the R21 gates (foul offender on the turf and continuous, Unity-held backward strides) are enforced the same way.
        var failedR21=r21Gates.FindAll(g=>!g.passed);
        if(enforce&&failedR21.Count>0)throw new Exception(failedR21.Count+" of "+r21Gates.Count+" r21 gates failed, first: "+failedR21[0].name+" = "+failedR21[0].value.ToString("0.###",Inv)+" (limit "+failedR21[0].limit.ToString("0.###",Inv)+")");
        // r132: the native132 capture gates (Release 131 regression lock) are enforced the same way.
        var failedR132=r132Gates.FindAll(g=>!g.passed);
        if(enforce&&failedR132.Count>0)throw new Exception(failedR132.Count+" of "+r132Gates.Count+" r132 gates failed, first: "+failedR132[0].name+" = "+failedR132[0].value.ToString("0.###",Inv)+" (limit "+failedR132[0].limit.ToString("0.###",Inv)+")");
        // r22: the paired visible surface (actors with a ground skin only) is enforced the same way.
        if(enforce&&visibleLine!=null&&visible.Failed>0)throw new Exception("visible surface: "+visibleLine);
        // r22: a scene with a replacement match mesh and its ground mesh must have measured the drawn surface in an unfiltered enforced run
        // (no ground skin on the actors would otherwise measure nothing and pass); the release scene (no ground skin) stays a no-op.
        if(enforce&&only==null){var drawnMesh=LowPolySetup.MatchMesh();var groundMesh=LowPolySetup.GroundMesh();
            if(groundMesh!=null&&drawnMesh!=UnityEditor.AssetDatabase.LoadAssetAtPath<Mesh>(LowPolySetup.Original)&&(visible==null||visible.Pictures==0))throw new Exception("visible surface: replacement match mesh "+drawnMesh.name+" with ground mesh "+groundMesh.name+" but no picture was measured (the actors carry no ground skin)");}
        return "cases="+cases.Count+" checks="+checks.Count+" gates="+(gates.Count-failedGates.Count)+"/"+gates.Count+" failed="+failedGates.Count+" supportGates="+(supportGates.Count-failedSupport.Count)+"/"+supportGates.Count+" supportFailed="+failedSupport.Count+" contactGates="+(contactGates.Count-failedContact.Count)+"/"+contactGates.Count+" contactFailed="+failedContact.Count+" continuityGates="+(continuityGates.Count-failedContinuity.Count)+"/"+continuityGates.Count+" continuityFailed="+failedContinuity.Count+" r15Gates="+(r15Gates.Count-failedR15.Count)+"/"+r15Gates.Count+" r15Failed="+failedR15.Count+" r15BeyondR18="+r15Regressions.Count+" r20Gates="+(r20Gates.Count-failedR20.Count)+"/"+r20Gates.Count+" r20Failed="+failedR20.Count+" r20Checks="+(r20Checks.Count-failedR20Checks.Count)+"/"+r20Checks.Count+" r21Gates="+(r21Gates.Count-failedR21.Count)+"/"+r21Gates.Count+" r21Failed="+failedR21.Count+" r132Gates="+(r132Gates.Count-failedR132.Count)+"/"+r132Gates.Count+" r132Failed="+failedR132.Count+(only!=null?" filter="+only:"")+" images="+images.Count+" recordings="+recordings.Count+(visibleLine!=null?" "+visibleLine:"");
    }
    // ---- r132 gates (review 1, item 5) --------------------------------------
    // Every foot-action window (approach, entry, contact, return) of every native132 case (the fresh captures of the
    // production bridge picture, seeds 160112 standard-5 and 160114 large-6, work/capture-native-motion-r132.cjs) is a gate:
    // root-relative joint speed at most 1600 deg/s, or, for the 30 windows that already exceeded it with the Release 131
    // FootballAnimation (R132Baseline, measured 14.10.2026 on identical captures), at most that value: a regression lock,
    // no limit is loosened. A run without the captures has no r132 gates (like the r20 contract captures).
    const string R132GateNote="r132 gates (review 1): every foot-action window of the native132 captures at most 1600 deg/s root-relative joint speed, or at most its Release 131 value for the 30 windows listed in R132Baseline (regression lock, measured on the same captures with the Release 131 FootballAnimation). Windows absent from the baseline that exceed 1600 fail.";
    // Measurement tolerance of a Release 131 lock (0.5 %: float order and solver iteration jitter, e.g. 1927 against 1925 deg/s); the 1600 limit itself carries none.
    public const double LockTolerance=.005;
    static readonly (string name,string action,double entry,int window,float r131)[] R132Baseline={
("native132-160112-field-1","receive",31.900,3,2359.1f),
("native132-160112-field-1","pass",32.250,0,2359.1f),
("native132-160112-field-1","pass",32.250,1,1924.5f),
("native132-160112-field-2","pass",40.850,0,1768.0f),
("native132-160112-field-4","receive",59.700,1,2034.3f),
("native132-160112-field-5","pass",3.650,1,3601.4f),
("native132-160112-field-5","receive",60.950,0,2366.1f),
("native132-160112-field-5","tackle",69.450,0,2195.5f),
("native132-160112-field-7","receive",26.200,1,3024.7f),
("native132-160112-field-7","highPass",27.250,3,9133.4f),
("native132-160112-field-7","receive",36.650,0,2760.2f),
("native132-160112-field-7","receive",36.650,1,1923.8f),
("native132-160112-field-7","tackle",39.100,1,4398.1f),
("native132-160112-field-8","tackle",7.800,1,2241.0f),
("native132-160112-field-8","tackle",7.800,2,7969.9f),
("native132-160112-field-8","pass",69.750,1,2143.7f),
("native132-160114-field-1","tackle",32.967,1,1723.9f),
("native132-160114-field-5","pass",3.650,1,3601.4f),
("native132-160114-field-5","pass",52.350,1,2044.9f),
("native132-160114-field-5","pass",69.100,1,1893.3f),
("native132-160114-field-8","highPass",31.050,3,8211.9f),
("native132-160114-field-10","receive",70.900,0,3753.3f),
("native132-160114-field-10","receive",70.900,1,2981.9f),
("native132-160114-field-11","tackle",68.850,0,8846.3f),
("native132-160114-field-11","tackle",68.850,1,9081.8f),
("native132-160114-field-11","tackle",68.850,2,9180.2f),
("native132-160114-field-12","receive",15.750,3,2738.9f),
("native132-160114-field-12","receive",16.000,1,2738.9f),
("native132-160114-field-12","highPass",16.550,0,1883.4f),
("native132-160114-field-13","receive",35.850,0,2245.3f)};
    static List<Check> R132Gates(List<Case> cases){
        var gates=new List<Check>();
        foreach(var c in cases){if(c.origin!="r21-native"||!c.name.StartsWith("native132-")||c.footActions==null)continue;
            foreach(var a in c.footActions)for(int w=0;w<4;w++){if(a.frames[w]==0)continue;int k=Array.FindIndex(R132Baseline,b=>b.name==c.name&&b.action==a.action&&Math.Abs(b.entry-a.entryClock)<.02&&b.window==w);double limit=k>=0?Math.Max(1600,R132Baseline[k].r131*(1+LockTolerance)):1600;
                gates.Add(new Check{name="r132 "+c.name+"/"+a.action+" "+a.entryClock.ToString("0.000",Inv)+" "+FootWindowNames[w]+" root-relative joint speed deg/s"+(k>=0?" (R131 lock)":""),value=a.jointRootMax[w],limit=limit,passed=a.jointRootMax[w]<=limit+1e-3});}}
        return gates;
    }
    // ---- r21 gates ---------------------------------------------------------
    const string R21GateNote="r21 gates (reported apart from all earlier sets; user defects of 12.10.2026) on the genuine native129 inputs (the R20 contract captures, byte-identical to fresh native129 captures, and further native129 captures): every foul offender window from its first foulOffender picture to 1 s after its last (exit into the following action and walk-off): the lower foot's skinned sole contour (bones without a contour) at most 0.05 m above the turf (no floating offender) and at least -0.02 m; the skinned sole (lowest vertex, every sixth picture) between -0.02 and 0.05 m; the eight bones at most 1600 deg/s (received root yaw removed) and the pelvis at most 1.5 m/s vertically. The float limits apply to the offender pictures (the walk-off is a stride with flight, under the locomotion gates). Every native field player: no run longer than 0.1 s (two received pictures) of display pictures moving at least 1.2 m/s with a Unity backward stride while the received travel is less than FootballLocomotion.BackOff (100 deg) from the received facing (the smoothed travel following a received reversal within one picture). Received reversed travel and kick facing (native/bridge facts, Root) are reported per case, never gated or corrected by Unity.";
    // Two received pictures: the smoothed received travel may follow a received reversal for at most this long.
    public const float BackHoldLimit=.1f;
    static readonly (string name,double r131)[] R21Native132Lock={("r21 native132-160112-field-11 foul offender 52.10 -> idle pelvis vertical speed (m/s)",1.566245)};
    static List<Check> R21Gates(List<Case> cases){
        var gates=new List<Check>();
        // r132: on the native132 captures one r21 gate already failed with the Release 131 FootballAnimation (the foul offender's
        // pelvis vertical speed at 160112 field-11 52.10: 1.566 m/s against 1.5, the sprint stopping dead in one native picture);
        // it is locked to that value plus LockTolerance (R21Native132Lock) instead of loosened, like the R18 lock of the r15 set.
        void Gate(string name,double value,double limit,bool atMost=true){int k=Array.FindIndex(R21Native132Lock,l=>l.name==name);if(k>=0&&atMost)limit=Math.Max(limit,R21Native132Lock[k].r131*(1+LockTolerance));gates.Add(new Check{name=name+(k>=0?" (R131 lock)":""),value=value,limit=limit,passed=atMost?value<=limit+1e-6:value>=limit-1e-6});}
        foreach(var c in cases){
            if(c.origin!="r20-native"&&c.origin!="r21-native"&&c.origin!="r21-controlled")continue;
            if(c.fouls!=null)foreach(var w in c.fouls){
                string id="r21 "+c.name+" foul offender "+w.start.ToString("0.00",Inv)+" -> "+w.exitTo+" ";
                Gate(id+"lower foot above the turf, window maximum (m)",w.floatMax,.05);
                Gate(id+"lowest foot below the turf (m)",w.sinkMin,-.02,false);
                if(w.soleFrames>0){Gate(id+"skinned sole lowest (m)",w.soleMin,-.02,false);Gate(id+"skinned sole, highest lowest vertex (m)",w.soleMax,.05);}
                Gate(id+"joint speed (deg/s)",w.jointRootMax,JointSpeedLimit);
                Gate(id+"pelvis vertical speed (m/s)",w.pelvisRateMax,1.5);
                // B11 (r132): no T-pose: upper arms within OffenderArmLimit at full stumble weight, below 60 deg over the whole window
                // (stride crossfade included); mixer weights sum to 1 without NaN (a zero or NaN mix would show the bind pose).
                if(w.armSettledMax>-9)Gate(id+"B11 upper-arm abduction at full stumble weight (deg)",w.armSettledMax,FootballAnimation.OffenderArmLimit+1);
                if(w.armMax>-9)Gate(id+"B11 upper-arm abduction, window maximum (deg)",w.armMax,60);
                if(w.weightSumMin<9){Gate(id+"B11 mixer weight sum, minimum",w.weightSumMin,.99,false);Gate(id+"B11 mixer weight sum, maximum",w.weightSumMax,1.01);}
                Gate(id+"B11 pictures with NaN mixer weights",w.nanPictures,0);
            }
            if(c.reversal!=null)Gate("r21 "+c.name+" longest run of moving pictures with a Unity backward stride the received travel does not show (rel < 100 deg, s)",c.reversal.backUnityLongest,BackHoldLimit);
        }
        return gates;
    }
    // ---- quality gates ---------------------------------------------------
    // Fixed limits on the actual rig, chosen from physical meaning, not from a
    // run: they hold for every controlled case at every display cadence, and
    // for the locomotion pictures of the captured native matches.
    public const float JointSpeedLimit=1600,ThighStepLimit=25,GlideRatioLimit=.15f,GlideLimit=.25f,ChestLimit=15,KneePoleLimit=20,HandHeadLimit=.22f,NativeDoubleFloatPerSecond=.5f;
    const string GateNote="Gates: no skinned sole more than 1 cm below the turf in locomotion; hips/legs/spine joint speed at most 1600 deg/s (about 1.5x the authored sprint cruise) in every window incl. start/stop/turns; thigh change at most 25 deg per 1/60 s; cruise glide of the weight-bearing (lower) sole at most 15 % of the travel speed and 0.25 m/s; no slow (<1.9 m/s) moving frame with both soles (heel, toe base and toe tip) more than 3 cm up in cruise; chest within 15 deg of the received facing and knee pole within 20 deg of the foot on average in cruise; moving hands never above the shoulders or within 0.22 m of the head; steady curves start no turn episode in cruise; the noisy 117 deg boundary switches stride family at most once; captured native locomotion: no sole below the turf and at most 0.5 slow double-float frames per moving second. r3: additionally over the whole fixture and every detected transition window (start/stop, speed change >1.2 m/s in 0.3 s, travel cut or facing change >35 deg in 0.3 s; event -0.35..+0.6 s): root-relative joint speed (received root yaw removed) at most 1600 deg/s, root-relative thigh step at most 25 deg per 1/60 s, no sole below the turf, no hand above the shoulders; captured native locomotion pictures: root-relative joint speed at most 1600 deg/s. The native contact pictures of a foot action (pass/shot 0.09 s, receive/control/tackle 0.12 s from the contact) are reported separately as contactJointRootMax: there the limb meets the received contact point at the native time.";
    static List<Check> Gates(List<Case> cases){
        var gates=new List<Check>();
        void Gate(string name,double value,double limit,bool atMost=true){gates.Add(new Check{name=name,value=value,limit=limit,passed=atMost?value<=limit+1e-6:value>=limit-1e-6});}
        foreach(var c in cases){
            string id=c.name+"@"+c.rate+"Hz";
            if(c.origin=="controlled"){
                foreach(var w in new[]{c.start,c.cruise,c.stop}){
                    if(w==null||w.frames==0)continue;string n=id+"/"+w.name;
                    Gate(n+" sole below turf frames",w.soleBelow,0);
                    Gate(n+" joint speed deg/s",w.jointSpeedMax,JointSpeedLimit);
                    Gate(n+" thigh step deg per 1/60 s",w.thighStepMax*c.rate/60f,ThighStepLimit);
                    Gate(n+" hands above shoulders frames",w.handsHigh,0);
                    if(w.handHeadMin>=0)Gate(n+" hand-head distance m",w.handHeadMin,HandHeadLimit,false);
                }
                // r3: the whole fixture and every detected transition window (start,
                // stop, speed change, cut, facing change; incl. the former ungated late
                // stop), measured on the rig relative to its received root.
                var all=new List<Window>{c.whole};if(c.transitions!=null)all.AddRange(c.transitions);
                foreach(var w in all){
                    if(w==null||w.frames==0)continue;string n=id+"/"+w.name;
                    Gate(n+" root-relative joint speed deg/s",w.jointSpeedRootMax,JointSpeedLimit);
                    Gate(n+" root-relative thigh step deg per 1/60 s",w.thighStepRootMax*c.rate/60f,ThighStepLimit);
                    Gate(n+" sole below turf frames",w.soleBelow,0);
                    Gate(n+" hands above shoulders frames",w.handsHigh,0);
                }
                var r=c.cruise;if(r==null||r.frames==0)continue;string k=id+"/cruise";
                if(r.supportFrames>0&&r.speedMean>.5f){Gate(k+" support glide share of speed",r.supportGlideRatio,GlideRatioLimit);Gate(k+" support glide m/s",r.supportGlideMean,GlideLimit);}
                if(r.speedMean<1.9f&&r.moving>0)Gate(k+" slow double-float frames",r.doubleFloatSlow,0);
                if(r.moving>0&&!c.name.StartsWith("keeper"))Gate(k+" chest vs facing deg",r.chestMean,ChestLimit);
                if(r.stanceFrames>0)Gate(k+" knee pole deg",r.kneePoleMean,KneePoleLimit);
                if(c.name.StartsWith("curve-"))Gate(k+" turn episodes per second",r.turnStartsPerSecond,0);
                if(c.name=="noise-117")Gate(k+" family switches",r.familySwitches,1);
            }else if(c.origin=="native"&&c.group=="native-player"){
                var l=c.cruise;if(l==null||l.frames==0)continue;
                Gate(c.name+"/locomotion sole below turf frames",l.soleBelow,0);
                float seconds=l.moving/60f;if(seconds>1)Gate(c.name+"/locomotion slow double-float per moving s",l.doubleFloatSlow/seconds,NativeDoubleFloatPerSecond);
                // r3: the rig's own joint speed with the received root yaw removed.
                Gate(c.name+"/locomotion root-relative joint speed deg/s",l.jointSpeedRootMax,JointSpeedLimit);
            }
        }
        return gates;
    }
    // r7: the cruise-only glide rule above left starts, stops and transitions
    // unmeasured (R6: 0.6-1.9 m/s of support glide in short-sprint starts while
    // every gate passed). Same limits and the same actual skinned-sole samples
    // as the cruise gate, applied to every controlled start, stop and detected
    // transition window (all eight directions, walk/jog/sprint, 30/60/120 Hz,
    // short sprints, curves, cuts, late stops, locomotion after actions) with
    // support samples and a mean travel speed above SupportSpeedFloor. A sole
    // that hovers to avoid a glide sample is caught by the slow double-float
    // rule in the same windows. Captured native locomotion: no hand above the
    // shoulders (the stride-only hand limit left braking arms out).
    public const float SupportSpeedFloor=.5f;
    const string SupportGateNote="r7 support-transition gates (reported apart from the unchanged gates): in every controlled start, stop and detected transition window (start/stop, speed change >1.2 m/s in 0.3 s, travel cut or facing change >35 deg in 0.3 s; event -0.35..+0.6 s) with support samples and a mean travel speed above 0.5 m/s: glide of the weight-bearing (lower) sole at most 15 % of the travel speed and 0.25 m/s (the cruise rule, same samples: sole within 3 cm in both pictures, slower of heel and toe); no slow (<1.9 m/s) moving picture with both soles more than 3 cm up. Captured native locomotion pictures: no moving hand above the shoulders.";
    static List<Check> SupportGates(List<Case> cases,List<SupportSample> samples){
        var gates=new List<Check>();
        void Gate(string name,double value,double limit){gates.Add(new Check{name=name,value=value,limit=limit,passed=value<=limit+1e-6});}
        foreach(var c in cases){
            string id=c.name+"@"+c.rate+"Hz";
            if(c.origin=="controlled"){
                var all=new List<Window>{c.start,c.stop};if(c.transitions!=null)all.AddRange(c.transitions);
                foreach(var w in all){
                    if(w==null||w.frames==0)continue;string n=id+"/"+w.name;bool glide=w.supportFrames>0&&w.speedMean>SupportSpeedFloor,slow=w.slowMoving>0;
                    if(glide){Gate(n+" support glide share of speed",w.supportGlideRatio,GlideRatioLimit);Gate(n+" support glide m/s",w.supportGlideMean,GlideLimit);}
                    if(slow)Gate(n+" slow double-float frames",w.doubleFloatSlow,0);
                    if(glide||slow)samples.Add(new SupportSample{window=n,frames=w.frames,moving=w.moving,slowMoving=w.slowMoving,stanceFrames=w.stanceFrames,supportFrames=w.supportFrames,doubleFloatSlow=w.doubleFloatSlow,soleBelow=w.soleBelow,speedMean=w.speedMean,supportGlideMean=w.supportGlideMean,supportGlideRatio=w.supportGlideRatio,supportGlideP90=w.supportGlideP90,supportGlideMax=w.supportGlideMax,kneePoleMean=w.kneePoleMean,soleMin=w.soleMin,supportDropMax=w.supportDropMax,supportGlideMaxAt=w.supportGlideMaxAt,doubleFloatAt=w.doubleFloatAt});
                }
            }else if(c.origin=="native"&&c.group=="native-player"){
                var l=c.cruise;if(l==null||l.frames==0)continue;
                Gate(c.name+"/locomotion hands above shoulders frames",l.handsHigh,0);
            }
        }
        return gates;
    }
    // r11: the sole and support rules above leave action pictures (sole) and
    // window means (glide) open: in R9 a shot contact put both soles 10-15 cm
    // into the turf and a reverse-stop support sole skated at up to 3.9 m/s
    // while every gate passed. Additive, every controlled case (all rates):
    // the lowest sole of the whole fixture, every picture incl. actions and
    // native contact pictures (sole contour/heel/toe points of both feet every
    // picture, the skinned sole where sampled: every action picture) at most
    // SoleTolerance below the turf; the weight-bearing sole on the turf (the
    // glide sample: within 3 cm in both pictures, lower sole, slower of heel and
    // toe) never faster than BurstLimit in a single picture, whole fixture and
    // every transition window; in a native contact picture only the contact
    // limb itself is left out (it meets the received point at the native time);
    // and where the contact limb reaches it, its distance to its contact target
    // and the boot surface's distance to the received ball's surface (received
    // contact point = ball centre) at most ContactReachLimit.
    public const float SoleTolerance=.02f,BurstLimit=1f,ContactReachLimit=.03f;
    const string ContactGateNote="r11 contact-recovery and support-transfer gates (reported apart from the unchanged gates and the r7 support gates): every controlled case at every display rate: (1) whole fixture, every picture including actions and native contact pictures: lowest sole (sole contour, heel, toe base and toe tip of both feet every picture; skinned sole where sampled, i.e. every action picture and every 1/30 s) at least -0.02 m; (2) whole fixture and every detected transition window: no single-picture glide sample of the weight-bearing sole (within 3 cm in both pictures, the lower sole, slower of heel and toe) above 1.0 m/s; in a native contact picture only the contact limb is left out; (3) reachable native foot contact pictures: the rig meets its contact target within 0.03 m, and the boot (ankle, toe base and toe tip bones plus 0.04 m of boot) meets the received ball (contact point = ball centre, radius 0.1764 m) within 0.03 m of its surface.";
    static List<Check> ContactGates(List<Case> cases){
        var gates=new List<Check>();
        void Gate(string name,double value,double limit,bool atMost=true){gates.Add(new Check{name=name,value=value,limit=limit,passed=atMost?value<=limit+1e-6:value>=limit-1e-6});}
        foreach(var c in cases){
            if(c.origin!="controlled"||c.whole==null||c.whole.frames==0)continue;string id=c.name+"@"+c.rate+"Hz";
            Gate(id+"/whole lowest sole incl. actions and contact pictures m",c.whole.soleLowestAll,-SoleTolerance,false);
            if(c.whole.contactMet>0)Gate(id+"/whole contact limb distance to the received contact point m",c.whole.contactErrorMax,ContactReachLimit);
            if(c.whole.contactMet>0)Gate(id+"/whole contact boot surface distance to the received ball surface m",c.whole.bootGapMax,ContactReachLimit);
            var all=new List<Window>{c.whole};if(c.transitions!=null)all.AddRange(c.transitions);
            foreach(var w in all)if(w!=null&&w.frames>0&&w.burstFrames>0)Gate(id+"/"+w.name+" support sole burst m/s",w.burstMax,BurstLimit);
        }
        return gates;
    }
    // r13: the root-relative joint-speed rules above leave the native contact pictures out and stop at
    // them (contactJointRootMax only reported): R11 entered its shot contact at 5048 deg/s (shin; the
    // contact solve after the last ready picture) and resumed it at 1825 deg/s, every gate green.
    // Additive, every controlled case at every display rate, every foot contact (FootContactPicture,
    // incl. the goal-kick release): the same eight bones, the received root yaw removed, at most the
    // existing JointSpeedLimit in the approach (0.15 s before), the entry step, the contact pictures and
    // the return (0.25 s after); the contact limb's root-relative ankle speed is reported beside it.
    const string ContinuityGateNote="r13 foot-action continuity gates (reported apart from the unchanged gates, the r7 support gates and the r11 contact gates): every controlled case at every display rate, every native foot contact (pass/highPass/cross/shot/freeKick/volley 0.09 s, receive/control/tackle 0.12 s, goal-kick release 0.09 s after its first picture): root-relative joint speed of the eight measured bones (received root yaw removed) at most 1600 deg/s in the approach (0.15 s before the first contact picture), in the entry step into it, through the contact pictures and in the return (0.25 s after the last). Contact time, point, root and ball are the received ones.";
    static List<Check> ContinuityGates(List<Case> cases){
        var gates=new List<Check>();
        foreach(var c in cases){
            if(c.origin!="controlled"||c.footActions==null)continue;string id=c.name+"@"+c.rate+"Hz";
            foreach(var a in c.footActions)for(int w=0;w<4;w++)if(a.frames[w]>0)gates.Add(new Check{name=id+"/"+a.action+" "+a.entryClock.ToString("0.000",Inv)+" "+FootWindowNames[w]+" root-relative joint speed deg/s",value=a.jointRootMax[w],limit=JointSpeedLimit,passed=a.jointRootMax[w]<=JointSpeedLimit+1e-6});
        }
        return gates;
    }
    // r15: interrupted preparation, the plant edge and the eleven R13 regression windows, reported apart from
    // the unchanged sets. (1) Every r15 controlled case (5f) at every rate under the original, support,
    // contact and continuity rules with their own names and limits (r15/ prefix). (2) Every ready countdown
    // that ends without its contact, controlled and native (ReadyAbort, AbortWindow after its last picture):
    // root-relative joint speed at most JointSpeedLimit and the kicking ankle's forward travel beyond its last
    // ready position at most AbortCarry (the wind-up stops; R13 swung it on 0.18 m through a ball it never
    // kicked). (3) The eleven native foot-action windows that R13 made worse above 1600 deg/s (identical
    // pictures, identical measurement): at most JointSpeedLimit, or the R11 value at the same window where R11
    // itself was above it (no regression against R11; those R11 peaks are earlier native/plant limits).
    const string R15GateNote="r15 gates (reported apart from the unchanged gates, the r7 support gates, the r11 contact gates and the r13 continuity gates): (1) the r15 controlled cases (ready-abort-receive, ready-change-pass, plant-edge, stop-restart-pass at 60/30/120 Hz) under the original, support, contact and continuity rules with their limits; (2) every ready countdown ending without its own contact, controlled and native: root-relative joint speed at most 1600 deg/s and the kicking ankle's root-relative forward travel at most 0.05 m within 0.15 s after its last ready picture; (3) the eleven native foot-action windows that R13 made worse above 1600 deg/s (r13/after/before-after.json): root-relative joint speed at most 1600 deg/s, or at most the R11 value of the identical window where R11 itself exceeded 1600 (no regression against R11).";
    static readonly (string player,string action,double entry,int window,double r11)[] R13RegressionWindows={("native-160112-field-2","receive",76.867,3,2053),("native-160112-field-2","receive",77.117,1,2053),("native-160112-field-4","pass",39.417,3,1870),("native-160112-field-4","pass",76.417,2,2057),("native-160112-field-5","pass",34.217,0,1876),("native-160114-field-1","pass",53.917,1,935),("native-160114-field-5","pass",69.067,2,1382),("native-160114-field-8","receive",30.417,3,1603),("native-160114-field-8","receive",30.667,1,1603),("native-160114-field-11","receive",34.667,1,1377),("native-160114-field-11","pass",34.967,0,1471)};
    static List<Check> R15Gates(List<Case> cases,List<SupportSample> samples){
        var gates=new List<Check>();Check P(Check g){g.name="r15/"+g.name;return g;}
        var own=cases.FindAll(c=>c.origin=="r15").ConvertAll(c=>{var k=JsonUtility.FromJson<Case>(JsonUtility.ToJson(c));k.origin="controlled";return k;});
        foreach(var g in Gates(own))gates.Add(P(g));foreach(var g in SupportGates(own,samples))gates.Add(P(g));foreach(var g in ContactGates(own))gates.Add(P(g));foreach(var g in ContinuityGates(own))gates.Add(P(g));
        foreach(var c in cases){
            if(c.readyAborts==null||c.origin!="r15"&&c.origin!="native")continue;string id=c.origin=="native"?c.name:c.name+"@"+c.rate+"Hz";
            foreach(var a in c.readyAborts){if(a.frames==0)continue;string n="r15/"+id+"/"+a.from+" "+a.clock.ToString("0.000",Inv)+" -> "+a.to+" aborted countdown";
                gates.Add(new Check{name=n+" root-relative joint speed deg/s",value=a.jointRootMax,limit=JointSpeedLimit,passed=a.jointRootMax<=JointSpeedLimit+1e-6});
                gates.Add(new Check{name=n+" kicking ankle forward travel m",value=a.forwardCarry,limit=AbortCarry,passed=a.forwardCarry<=AbortCarry+1e-6});}
        }
        foreach(var (player,action,entry,window,r11) in R13RegressionWindows){
            var c=cases.Find(k=>k.name==player);if(c==null||c.footActions==null)continue;var a=Array.Find(c.footActions,f=>f.action==action&&Math.Abs(f.entryClock-entry)<.002);if(a==null||a.frames[window]==0)continue;
            double limit=Math.Max(JointSpeedLimit,r11);gates.Add(new Check{name="r15/"+player+"/"+action+" "+entry.ToString("0.000",Inv)+" "+FootWindowNames[window]+" root-relative joint speed deg/s (R13 regression window, R11 "+r11.ToString("0",Inv)+")",value=a.jointRootMax[window],limit=limit,passed=a.jointRootMax[window]<=limit+1e-6});
        }
        return gates;
    }
    // ---- r20: native event time, received contact preparation, countdown semantics -------------------------------
    // Countdown semantics (Root decision R20, 12.10.2026), from the received pictures of one player only: a countdown end
    // is a passReady/kickReady picture whose next received picture is not the same instance going on in the same kind.
    //  boundary          the display cuts between both pictures (WorldViewPlayback.Cut: session, turned, seek, gap,
    //                    pause, invisible ball, jump) or the clock does not advance: not evaluable, no gate;
    //  completes         the next picture is the carrier's own kick (pass/highPass/cross/shot/freeKick/volley): its contact
    //                    and foot-action gates apply;
    //  continues-run     the other ready kind with the same id, both durations known and equal, and the progress step equals
    //                    the clock step over that duration (CountdownStepTolerance): the same native countdown running on
    //                    across the bridge's positional passReady/kickReady label (v111 forward 0.73, R19). Not an abort;
    //                    the continuing display is gated (joint speed, lowest sole, support burst);
    //  rearmed           the same id with a falling progress (a new countdown instance; the old one ended without contact);
    //  new-preparation   another ready id;
    //  undecided-*       the same id but no known duration, a held progress across the kind change or another step:
    //                    the identity is not shown, so these keep the strict end gates;
    //  abort             any other next action (idle, run, receive, foul, ...).
    // rearmed, new-preparation, undecided-* and abort keep the r15 end gates (joint speed, kicking ankle forward travel).
    public const double CountdownStepTolerance=.005;
    static bool Ready(string a)=>a=="passReady"||a=="kickReady";
    // r20: the native timing an input states for one player: its actions' event clocks by action id and, per picture,
    // whether its duration is the native one. From the diagnostics' own inputs (the R20 contract capture fields; the timed
    // fixtures' construction), so a runtime without the R20 picture fields is judged by the same events and classes.
    sealed class InputTiming {public readonly Dictionary<string,double> events=new Dictionary<string,double>();public readonly List<bool> known=new List<bool>();}
    static InputTiming FixtureTiming(List<WorldFrame> pictures,int who){var t=new InputTiming();foreach(var w in pictures){var p=w.players[who];bool k=p.action!="run"&&p.action!="idle"&&p.duration>0&&p.duration<1;t.known.Add(k);if(k&&!t.events.ContainsKey(p.actionId??""))t.events[p.actionId??""]=Math.Min(w.clock,w.clock-p.progress*p.duration);}return t;}
    static List<Countdown> Countdowns(List<WorldFrame> pictures,int who,List<Sample> display,InputTiming timing=null){
        var list=new List<Countdown>();
        for(int k=1;k<pictures.Count;k++){
            var a=pictures[k-1];var b=pictures[k];var p=a.players[who];var s=b.players[who];if(!Ready(p.action))continue;
            if(s.action==p.action&&s.actionId==p.actionId&&s.progress>=p.progress-1e-6)continue;
            double dt=b.clock-a.clock;bool known=timing!=null&&timing.known[k-1]&&p.duration>0&&p.duration<1;
            var c=new Countdown{from=p.action,to=s.action,fromId=p.actionId,toId=s.actionId,clock=(float)a.clock,progress=(float)p.progress,nextProgress=(float)s.progress,duration=(float)p.duration,durationKnown=known,kindFlip=Ready(s.action)&&s.action!=p.action,step=(float)(s.progress-p.progress),expectedStep=known?(float)(dt/p.duration):float.NaN};
            if(WorldViewPlayback.Cut(a,b)||dt<=1e-9)c.cls="boundary";
            else if(ContactAction(s.action))c.cls="completes";
            else if(Ready(s.action)&&s.actionId==p.actionId){
                bool both=known&&timing.known[k]&&Math.Abs(s.duration-p.duration)<1e-9;
                if(!both)c.cls="undecided-duration-unknown";
                else if(c.step< -1e-6)c.cls="rearmed";
                else if(Math.Abs(c.step-c.expectedStep)<=CountdownStepTolerance)c.cls="continues-run";
                else if(Math.Abs(c.step)<=1e-6)c.cls="undecided-hold";
                else c.cls="undecided-step";
            }
            else if(Ready(s.action))c.cls="new-preparation";
            else c.cls="abort";
            c.evidence="dt "+dt.ToString("0.000",Inv)+" step "+c.step.ToString("0.0000",Inv)+" expected "+(known?c.expectedStep.ToString("0.0000",Inv):"-")+" duration "+(known?p.duration.ToString("0.###",Inv):"unknown")+" owner "+(a.owner==p.id?"carrier":"-")+" -> "+(b.owner==p.id?"carrier":"-");
            Measure(c,a.clock,display);list.Add(c);
        }
        return list;
    }
    // The display window after the last ready picture (its clock), as ReadyAbort measures it, plus the lowest sole and the support burst (r11 rules).
    static void Measure(Countdown c,double at,List<Sample> all){
        int e=all.FindIndex(x=>x.clock>at+1e-6);if(e<1)return;var p=all[e-1];if(Math.Abs(p.clock-at)>1e-4)return;
        int f=p.poseKind=="left-foot"?0:1;float startZ=p.ankleLocal[f].z,startClear=p.supportClear[f];int end=e;
        for(int i=e;i<all.Count&&all[i].clock<=at+AbortWindow+1e-6;i++){
            end=i+1;var s=all[i];var b=all[i-1];double dt=s.clock-b.clock;if(dt<=0||dt>.04)continue;var jump=s.root-b.root;jump.y=0;if(jump.magnitude>.4f)continue;
            c.frames++;for(int k=0;k<8;k++){float v=Quaternion.Angle(s.rel[k],b.rel[k])/(float)dt;if(v>c.jointRootMax){c.jointRootMax=v;c.jointRootAt=Bones[k]+" "+s.clock.ToString("0.000",Inv);}}
            c.forwardCarry=Mathf.Max(c.forwardCarry,s.ankleLocal[f].z-startZ);c.soleRise=Mathf.Max(c.soleRise,s.supportClear[f]-startClear);c.ankleSpeedMax=Mathf.Max(c.ankleSpeedMax,(s.ankleLocal[f]-b.ankleLocal[f]).magnitude/(float)dt);
        }
        if(end>e){var w=Summarise("countdown",all,e,end);c.soleLowest=w.soleLowestAll;c.burstMax=w.burstFrames>0?w.burstMax:0;c.burstAt=w.burstMaxAt;}
    }
    // The five r15 gates that failed in R18 (657ab383, identical on the unchanged legacy inputs) and their R18 values.
    // The r15 set is enforced as a regression lock: every other r15 gate must pass, these five must not exceed their R18
    // value. They stay reported as failed; their active R20 successors are the event-time C gate on the timed fixture,
    // the countdown-end gates on Root's contract captures (E1) and the R20 countdown semantics (E2).
    static readonly (string name,double r18)[] R15Historical={("r15/plant-edge@120Hz/receive 11.158 entry root-relative joint speed deg/s",2102.81884765625),("r15/native-160112-field-11/passReady 49.200 -> idle aborted countdown kicking ankle forward travel m",0.15584123134613037),("r15/native-160114-field-4/passReady 56.750 -> idle aborted countdown kicking ankle forward travel m",0.43958690762519836),("r15/native-160114-field-5/passReady 25.800 -> kickReady aborted countdown kicking ankle forward travel m",0.6277159452438354),("r15/native-160114-field-13/passReady 37.300 -> kickReady aborted countdown kicking ankle forward travel m",0.2252575159072876)};
    const string R15Enforcement="r15 (all 367 gates, names, limits and values reported unchanged, failures stay passed=false) is enforced as a regression lock against R18 657ab383: every gate that passed in R18 must pass; the five R18 failures (R15Historical) must not exceed their R18 value. Their active successors are r20 gates on the R20 contract inputs.";
    const string R20GateNote="r20 gates (reported apart from all earlier sets; active Root contract R20 of 12.10.2026: native event time, received contact preparation, countdown semantics): (1) the timed controlled cases (+timing: the same fixtures with the action start they are built from marked as native actionAt/durationKnown; pass-jog, receive-sprint, shot-stop and the four r15 fixtures at 60/30/120 Hz) under the original, support, contact and continuity rules with their limits; (2) every foot contact with a known native event time in the timed fixtures and in Root's contract captures (native-contract) that the R20 binding covers (not after a keeper save, goal kick, throw, header/airReady/airLand: Root's scope keeps their legacy binding, listed in FootAction.entryFrom): the first contact display picture lies at or after the native event and less than one display picture after it; (3) every received countdown end in both (R20 countdown semantics, Countdowns), within 0.15 s after the last ready picture: root-relative joint speed at most 1600 deg/s for every evaluable end; where the preparation stops (abort, new-preparation, undecided-*) also the kicking ankle root-relative forward travel at most 0.05 m (the r15 rule); where the same carrier's countdown goes on (continues-run, rearmed) instead lowest sole at least -0.02 m and support sole burst at most 1 m/s (the r11 rules), the travel reported only; an evaluable end without a measured display picture fails; boundary: not evaluable, listed; completes: its own foot-action gates; (4) the eleven R13 regression windows on the contract captures (same player and action, the entry at or up to one native picture after the legacy entry): at most 1600 deg/s or the R11 value where R11 exceeded it.";
    // Root's R20 scope: contacts after these keep the legacy binding (WorldViewPlayback.Continues).
    static bool ScopeExcluded(string from)=>from=="save"||from=="goalKick"||from=="throw"||from=="header"||from=="airReady"||from=="airLand";
    static List<Check> R20Gates(List<Case> cases,List<SupportSample> samples){
        var gates=new List<Check>();Check P(Check g){g.name="r20/"+g.name;return g;}
        var own=cases.FindAll(c=>c.origin=="r20").ConvertAll(c=>{var k=JsonUtility.FromJson<Case>(JsonUtility.ToJson(c));k.origin="controlled";return k;});
        foreach(var g in Gates(own))gates.Add(P(g));foreach(var g in SupportGates(own,samples))gates.Add(P(g));foreach(var g in ContactGates(own))gates.Add(P(g));foreach(var g in ContinuityGates(own))gates.Add(P(g));
        foreach(var c in cases){
            if(c.origin!="r20"&&c.origin!="r20-native")continue;string id=c.origin=="r20-native"?c.name:c.name+"@"+c.rate+"Hz";
            if(c.footActions!=null)foreach(var a in c.footActions){if(a.eventAt<0||ScopeExcluded(a.entryFrom))continue;double after=a.entryClock-a.eventAt;
                // entryClock is single precision: at most 1e-5 s at 100 s; the display pictures lie 1/120 s or more apart.
                gates.Add(new Check{name="r20/"+id+"/"+a.action+" "+a.entryClock.ToString("0.000",Inv)+" first contact picture after the native event at "+a.eventAt.ToString("0.000",Inv)+" s",value=after,limit=1.0/c.rate,passed=after>=-1e-5&&after<1.0/c.rate-1e-5});}
            if(c.countdowns!=null)foreach(var d in c.countdowns){if(d.cls=="boundary"||d.cls=="completes")continue;
                string n="r20/"+id+"/"+d.from+" "+d.clock.ToString("0.000",Inv)+" -> "+d.to+(d.toId!=d.fromId&&Ready(d.to)?" (new id)":"");
                // An evaluable end whose window has no measurable display picture fails instead of dropping out.
                if(d.frames==0){gates.Add(new Check{name=n+" countdown window measured (display pictures)",value=0,limit=1,passed=false});continue;}
                // Where the preparation stops (abort, new-preparation, undecided-*): the r15 rule (joint speed, forward travel).
                // Where the same carrier's countdown goes on (continues-run, rearmed) its wind-up legitimately goes on: joint
                // speed, lowest sole and support burst (the r11 rules) instead of the travel, which is reported only.
                bool goesOn=d.cls=="continues-run"||d.cls=="rearmed";n+=goesOn?" countdown goes on ("+d.cls+")":" countdown end ("+d.cls+")";
                gates.Add(new Check{name=n+" root-relative joint speed deg/s",value=d.jointRootMax,limit=JointSpeedLimit,passed=d.jointRootMax<=JointSpeedLimit+1e-6});
                if(goesOn)gates.Add(new Check{name=n+" lowest sole m",value=d.soleLowest,limit=-SoleTolerance,passed=d.soleLowest>=-SoleTolerance-1e-6});
                if(goesOn)gates.Add(new Check{name=n+" support sole burst m/s",value=d.burstMax,limit=BurstLimit,passed=d.burstMax<=BurstLimit+1e-6});
                if(!goesOn)gates.Add(new Check{name=n+" kicking ankle forward travel m",value=d.forwardCarry,limit=AbortCarry,passed=d.forwardCarry<=AbortCarry+1e-6});
            }
        }
        foreach(var (player,action,entry,window,r11) in R13RegressionWindows){
            var c=cases.Find(k=>k.name==player.Replace("native-","native-contract-"));if(c==null||c.footActions==null)continue;
            FootAction a=null;foreach(var f in c.footActions)if(f.action==action&&f.entryClock>=entry-.002&&f.entryClock<=entry+.052&&(a==null||f.entryClock<a.entryClock))a=f;if(a==null||a.frames[window]==0)continue;
            double limit=Math.Max(JointSpeedLimit,r11);gates.Add(new Check{name="r20/"+c.name+"/"+action+" "+a.entryClock.ToString("0.000",Inv)+" "+FootWindowNames[window]+" root-relative joint speed deg/s (R13 regression window "+entry.ToString("0.000",Inv)+", R11 "+r11.ToString("0",Inv)+")",value=a.jointRootMax[window],limit=limit,passed=a.jointRootMax[window]<=limit+1e-6});
        }
        return gates;
    }
    // r20: a fixture's pictures with the native timing its own construction knows (Act: the action starts at its from,
    // progress = (t - from)/duration with the native duration): actionAt = clock - progress*duration, durationKnown.
    // A member-wise copy (JsonUtility does not round-trip every double exactly: 10.95 -> 10.950000000000001); the
    // poses are copied, their arrays shared (never written).
    static readonly MethodInfo Shallow=typeof(object).GetMethod("MemberwiseClone",BindingFlags.Instance|BindingFlags.NonPublic);
    static WorldFrame Copy(WorldFrame w){var f=(WorldFrame)Shallow.Invoke(w,null);f.players=Array.ConvertAll(w.players,p=>(WorldPose)Shallow.Invoke(p,null));return f;}
    static List<WorldFrame> Timed(List<WorldFrame> pictures,int subject){
        var list=new List<WorldFrame>();
        foreach(var w in pictures){var f=Copy(w);var p=f.players[subject];
            if(p.action!="run"&&p.action!="idle"&&p.duration>0&&p.duration<1){Set(p,"actionAt",Math.Min(f.clock,f.clock-p.progress*p.duration));Set(p,"actionAtKnown",true);Set(p,"durationKnown",true);}
            list.Add(f);}
        return list;
    }
    // r20: the timed pictures with their timing removed equal the legacy fixture (every serialised field).
    static bool StripsToLegacy(List<WorldFrame> timed,List<WorldFrame> legacy){
        if(timed.Count!=legacy.Count)return false;
        for(int i=0;i<timed.Count;i++){var t=Copy(timed[i]);foreach(var p in t.players){Set(p,"actionAt",-1.0);Set(p,"actionAtKnown",false);Set(p,"durationKnown",false);}
            string x=JsonUtility.ToJson(t),y=JsonUtility.ToJson(legacy[i]);if(x!=y){int k=0;while(k<x.Length&&k<y.Length&&x[k]==y[k])k++;File.AppendAllText(Path.Combine(folder,"r20-strip-diff.txt"),i+": "+x.Substring(Math.Max(0,k-80),Math.Min(160,x.Length-Math.Max(0,k-80)))+"\n   "+y.Substring(Math.Max(0,k-80),Math.Min(160,y.Length-Math.Max(0,k-80)))+"\n");return false;}}
        return true;
    }
    static Texture2D Scale(Texture2D source,int w,int h){var rt=RenderTexture.GetTemporary(w,h,0);Graphics.Blit(source,rt);var previous=RenderTexture.active;RenderTexture.active=rt;var t=new Texture2D(w,h,TextureFormat.RGB24,false);t.ReadPixels(new Rect(0,0,w,h),0,0);t.Apply();RenderTexture.active=previous;RenderTexture.ReleaseTemporary(rt);return t;}
    // ---- native recordings ----------------------------------------------
    [Serializable] class NativePose {public string id,action,actionId;public double[] position,facing,contactPoint;public double progress,duration,freshness=-1;public bool moving;
        // r20: the optional native timing of the R20 bridge (Root contract captures); absent in the historical captures.
        public double actionAt=-1;public bool actionAtKnown,durationKnown;}
    [Serializable] class NativePicture {public double clock;public string phase,owner;public bool ballInFlight,turned;public double[] ball;public NativePose[] players;}
    [Serializable] class NativeCapture {public int seed,fieldPlayers;public string fieldSize;public string[] keepers;public NativePicture[] pictures;}
    // r8: optional per-picture mixer dump of one native player (iteration
    // evidence only; never part of a gate): -d6dump <seed>-<player>@<from>-<to>
    // writes dump-<seed>-<player>.txt into the run folder.
    static void Dump(string who,double clock,FootballAnimation anim,FootballLocomotion loco,Sample s){
        var a=Environment.GetCommandLineArgs();string spec=null;for(int k=0;k<a.Length-1;k++)if(a[k]=="-d6dump")spec=a[k+1];if(spec==null)return;
        int at=spec.IndexOf('@');if(at<0||spec.Substring(0,at)!=who)return;var range=spec.Substring(at+1).Split('-');if(clock<double.Parse(range[0],Inv)-1e-6||clock>double.Parse(range[1],Inv)+1e-6)return;
        var w=(float[])typeof(FootballAnimation).GetField("weights",Flags).GetValue(anim);var src=(AnimationClip[])typeof(FootballAnimation).GetField("sources",Flags).GetValue(anim);var clips=(System.Collections.IList)typeof(FootballAnimation).GetField("clips",Flags).GetValue(anim);
        var sb=new System.Text.StringBuilder();sb.Append(clock.ToString("0.000",Inv)).Append(" v=").Append(s.travel.magnitude.ToString("0.00",Inv)).Append(' ').Append(loco.Mode).Append('/').Append(loco.StrideMode).Append(" ph=").Append(loco.Phase.ToString("0.000",Inv)).Append(" sp=").Append(loco.StridePhase.ToString("0.000",Inv)).Append(" clip=").Append(s.clip).Append(" base=").Append(s.baseClip).Append(" aw=").Append(s.actionWeight.ToString("0.00",Inv)).Append(" t=").Append(s.poseTime.ToString("0.000",Inv)).Append(" lock=").Append(s.lockState).Append(" st=");
        if(s.stage!=null)sb.Append(string.Join("/",Array.ConvertAll(s.stage,v=>v.ToString("0",Inv))));sb.Append(" mix:");
        for(int k=0;k<w.Length;k++)if(w[k]>.001f){var cp=(UnityEngine.Animations.AnimationClipPlayable)clips[k];sb.Append(' ').Append(src[k].name).Append('=').Append(w[k].ToString("0.00",Inv)).Append('@').Append(cp.GetTime().ToString("0.000",Inv));}
        File.AppendAllText(Path.Combine(folder,"dump-"+who+".txt"),sb.Append('\n').ToString());
    }
    // r13: optional per-picture trace of one native player in a clock window (iteration evidence only;
    // never part of a gate): -d6trace <seed>-<player>@<from>-<to>[,...] writes trace-native-<seed>-<player>-<from>.json.
    static void NativeTrace(string who,List<Sample> all){
        var a=Environment.GetCommandLineArgs();string spec=null;for(int k=0;k<a.Length-1;k++)if(a[k]=="-d6trace")spec=a[k+1];if(spec==null)return;
        foreach(var one in spec.Split(',')){int at=one.IndexOf('@');if(at<0||one.Substring(0,at)!=who)continue;var range=one.Substring(at+1).Split('-');double from=double.Parse(range[0],Inv),to=double.Parse(range[1],Inv);
            var run=new Pass();foreach(var s in all)if(s.clock>=from-1e-6&&s.clock<=to+1e-6)run.samples.Add(s);if(run.samples.Count>0)WriteTrace("native-"+who+"-"+range[0],run);}
    }
    // r20: contract: Root's R20 contract capture (corrected placeholder/restart facing, native timing), cases native-contract-*,
    // origin r20-native (gated by R20Gates only), no direction bins or legacy close-ups, its own focus recordings.
    // r21: family: a further native129 capture (folder native129-rig), cases <family>-*, origin r21-native (gated by R21Gates
    // only), read with the contract timing like the contract captures.
    static IEnumerable<Case> Native(string file,bool contract=false,string family=null){
        var capture=JsonUtility.FromJson<NativeCapture>(File.ReadAllText(file));var config=JsonUtility.FromJson<WorldConfig>(raw);
        var ids=new List<string>();foreach(var p in capture.pictures[0].players)ids.Add(p.id);
        string Club(string id){var parts=id.Split(':');return parts.Length>2?parts[parts.Length-2]:"a";}
        var clubs=new List<string>();foreach(var id in ids)if(!clubs.Contains(Club(id)))clubs.Add(Club(id));
        var kit=config.players[0].kit;var other=Array.Find(config.players,p=>p.team==1).kit;
        config.players=ids.ConvertAll(id=>new WorldPlayer{id=id,name="N "+id.Substring(id.LastIndexOf(':')+1),team=clubs.IndexOf(Club(id))==0?0:1,number=0,keeper=Array.IndexOf(capture.keepers,id)>=0,kit=clubs.IndexOf(Club(id))==0?kit:other,skin="warm",hair="brown"}).ToArray();
        bool large=capture.fieldSize=="large";config.geometry.length=large?81.6:68;config.geometry.width=large?52.8:44;config.geometry.fieldPlayers=capture.fieldPlayers;
        config.session="native-motion-"+capture.seed;config.quality="standard";
        WorldFrame ToFrame(NativePicture n){
            var f=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(config.initial));f.session=config.session;f.clock=n.clock;f.phase="live";f.owner=string.IsNullOrEmpty(n.owner)?"":n.owner;f.ball=n.ball;f.ballInFlight=n.ballInFlight;f.turned=n.turned;f.ballOpacity=1;
            f.players=Array.ConvertAll(n.players,q=>new WorldPose{id=q.id,position=q.position,facing=q.facing,moving=q.moving,action=q.action,actionId=q.actionId,progress=q.progress,duration=q.duration>0?q.duration:1,contactPoint=q.contactPoint!=null&&q.contactPoint.Length==3?q.contactPoint:null,freshness=q.freshness,number=0});
            // r20: the received native timing, only where the capture states it.
            for(int k=0;k<n.players.Length;k++){var q=n.players[k];if(q.actionAtKnown){Set(f.players[k],"actionAt",q.actionAt);Set(f.players[k],"actionAtKnown",true);}if(q.durationKnown)Set(f.players[k],"durationKnown",true);}
            return f;
        }
        string prefix=family!=null?family+"-":contract?"native-contract-":"native-";
        // Two 30 s live windows per capture keep the run bounded.
        // r132: -d6pictures <n> raises the 1200-picture (60 s) bound so later windows of a first half are replayed as well.
        int bound=1200;{var args=Environment.GetCommandLineArgs();for(int k=0;k<args.Length-1;k++)if(args[k]=="-d6pictures"&&int.TryParse(args[k+1],out var b))bound=b;}
        var pictures=new List<WorldFrame>();var used=new List<NativePicture>();for(int i=0;i<capture.pictures.Length&&pictures.Count<bound;i++)if(capture.pictures[i].phase=="live"){pictures.Add(ToFrame(capture.pictures[i]));used.Add(capture.pictures[i]);}else if(pictures.Count>0)break;
        InputTiming Timing(int k){if(!contract)return null;var t=new InputTiming();foreach(var np in used){var q=np.players[k];t.known.Add(q.durationKnown);if(q.actionAtKnown&&!t.events.ContainsKey(q.actionId??""))t.events[q.actionId??""]=q.actionAt;}return t;}
        config.initial=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(pictures[0]));config.initial.sequence=sequence=1;config.initial.phase="paused";
        Drop();Send(new WorldCommand{kind="load",config=config});
        var actors=Field<List<Transform>>("actors");var football=Field<List<FootballAnimation>>("football");var loco=Field<FootballLocomotion[]>("worldLocomotion");
        int n=actors.Count;var samples=new List<Sample>[n];var last=new Sample[n];var taps=new StageTap[n];for(int i=0;i<n;i++){samples[i]=new List<Sample>();taps[i]=new StageTap(actors[i],football[i]);}
        int frame=0;
        foreach(var f in Display(pictures)){
            var p=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(f));p.sequence=++sequence;p.phase="paused";p.camera=new WorldCamera{position=new double[]{0,30,-40},target=new double[3],fov=40};
            Send(new WorldCommand{kind="frame",frame=p});
            for(int i=0;i<n;i++){var s=Measure(i,actors[i],football[i],loco[i],p,last[i],frame%6==0,taps[i]);samples[i].Add(s);last[i]=s;Dump(capture.seed+"-"+i,p.clock,football[i],loco[i],s);}
            frame++;
        }
        VisibleSurfaceProbe.Current?.Label(prefix+capture.seed);
        // Aggregate by direction relative to the received facing and by keeper/field role.
        var groups=new Dictionary<string,List<Sample>>();
        string[] dirNames={"fwd","fwd-right","right","back-right","back","back-left","left","fwd-left"};
        var results=new List<Case>();
        for(int i=0;i<n;i++){
            bool isKeeper=Array.IndexOf(capture.keepers,ids[i])>=0;
            var all=samples[i];var role=isKeeper?"keeper":"field";WritePeak(prefix+capture.seed+"-"+role+"-"+i,all,true);
            NativeTrace((contract?"c":"")+capture.seed+"-"+i,all);
            var whole=Summarise("whole",all,0,all.Count);
            // cruise = locomotion-only pictures (idle/run actions) of the same player.
            results.Add(new Case{name=prefix+capture.seed+"-"+role+"-"+i,group="native-player",origin=family!=null?"r21-native":contract?"r20-native":"native",note=Path.GetFileName(file)+"; cruise window = locomotion-only pictures",whole=whole,cruise=Summarise("locomotion",all,0,all.Count,true),transitions=Transitions(all,true),clips=new string[0],footActions=FootActions(all,Timing(i)),readyAborts=ReadyAborts(all),countdowns=Countdowns(pictures,i,all,Timing(i)).ToArray(),fouls=Fouls(pictures,i,all),bands=BandStats(all),reversal=isKeeper?null:Reversals(all),kicks=KickFacings(pictures,i,all)});
        }
        if(renderOn&&Want("recordings")&&contract)foreach(var (name,from,to) in ContractFocus){
            if(!name.StartsWith(prefix+capture.seed+"-"))continue;int who=int.Parse(name.Substring(name.LastIndexOf('-')+1));if(who>=n)continue;
            int stop=0;foreach(var f in Display(pictures)){stop++;if(f.clock>to+1e-6)break;}
            var frames=new List<Color32[]>();Play(config,pictures,who,false,record:frames,recordW:240,recordH:300,stopAfter:stop,recordWhen:p=>p.clock>=from-1e-6&&p.clock<=to+1e-6);if(frames.Count==0)continue;
            var normal=new List<Color32[]>();for(int i=0;i<frames.Count;i+=3)normal.Add(frames[i]);string clip=name+"-"+from.ToString("0.00",Inv)+"-"+to.ToString("0.00",Inv);
            Gif(Path.Combine(folder,clip+"-normal.gif"),normal,240,300,5);Gif(Path.Combine(folder,clip+"-slow.gif"),frames,240,300,10);recordings.Add(clip+"-normal.gif");recordings.Add(clip+"-slow.gif");
        }
        // r21: foul offender complete -> exit -> walk-off and kick-facing windows (normal and slow).
        if(renderOn&&Want("recordings")&&contract)foreach(var (name,from,to) in R21Focus){
            if(!name.StartsWith(prefix+capture.seed+"-"))continue;int who=int.Parse(name.Substring(name.LastIndexOf('-')+1));if(who>=n)continue;
            int stop=0;foreach(var f in Display(pictures)){stop++;if(f.clock>to+1e-6)break;}
            var frames=new List<Color32[]>();Play(config,pictures,who,false,record:frames,recordW:240,recordH:300,stopAfter:stop,recordWhen:p=>p.clock>=from-1e-6&&p.clock<=to+1e-6);if(frames.Count==0)continue;
            var normal=new List<Color32[]>();for(int i=0;i<frames.Count;i+=3)normal.Add(frames[i]);string clip=name+"-"+from.ToString("0.00",Inv)+"-"+to.ToString("0.00",Inv);
            Gif(Path.Combine(folder,clip+"-normal.gif"),normal,240,300,5);Gif(Path.Combine(folder,clip+"-slow.gif"),frames,240,300,10);recordings.Add(clip+"-normal.gif");recordings.Add(clip+"-slow.gif");
        }
        if(contract){Drop();return results;}
        if(renderOn)foreach(var (name,clock) in NativeWindows){
            if(!name.StartsWith("native-"+capture.seed+"-"))continue;int who=int.Parse(name.Substring(name.LastIndexOf('-')+1));if(who>=n)continue;
            var frames=new List<Texture2D>();int stop=0;foreach(var f in Display(pictures)){stop++;if(f.clock>clock+.1+1e-6)break;}
            Play(config,pictures,who,false,(k,p)=>p.clock>=clock-.1-1e-6&&p.clock<=clock+.1+1e-6,(k,t)=>frames.Add(Scale(t,200,250)),stopAfter:stop);
            var strip=new Texture2D(Math.Max(1,frames.Count)*200,250,TextureFormat.RGB24,false);for(int k=0;k<frames.Count;k++){strip.SetPixels(k*200,0,200,250,frames[k].GetPixels());UnityEngine.Object.DestroyImmediate(frames[k]);}
            strip.Apply();var shot=name+"-"+clock.ToString("0.000",Inv)+"-closeup.png";File.WriteAllBytes(Path.Combine(folder,shot),strip.EncodeToPNG());images.Add(shot);UnityEngine.Object.DestroyImmediate(strip);
        }
        if(renderOn&&Want("recordings"))foreach(var (name,from,to) in NativeFocus){
            if(!name.StartsWith("native-"+capture.seed+"-"))continue;int who=int.Parse(name.Substring(name.LastIndexOf('-')+1));if(who>=n)continue;
            int stop=0;foreach(var f in Display(pictures)){stop++;if(f.clock>to+1e-6)break;}
            var frames=new List<Color32[]>();Play(config,pictures,who,false,record:frames,recordW:240,recordH:300,stopAfter:stop,recordWhen:p=>p.clock>=from-1e-6&&p.clock<=to+1e-6);if(frames.Count==0)continue;
            var normal=new List<Color32[]>();for(int i=0;i<frames.Count;i+=3)normal.Add(frames[i]);string clip=name+"-"+from.ToString("0.00",Inv)+"-"+to.ToString("0.00",Inv);
            Gif(Path.Combine(folder,clip+"-normal.gif"),normal,240,300,5);Gif(Path.Combine(folder,clip+"-slow.gif"),frames,240,300,10);recordings.Add(clip+"-normal.gif");recordings.Add(clip+"-slow.gif");
        }
        // Per-direction and speed-band bins over field players.
        string[] bandNames={"walk","jog","fast"};
        foreach(int bin in new[]{0,1,2,3,4,5,6,7})foreach(int band in new[]{-1,0,1,2}){
            var merged=new List<Sample>();
            for(int i=0;i<n;i++){if(Array.IndexOf(capture.keepers,ids[i])>=0)continue;var all=samples[i];
                for(int k=1;k<all.Count;k++){var s=all[k];if(!s.moving){continue;}float rel=Mathf.DeltaAngle(Yaw(s.facing),Yaw(s.travel));int b=((Mathf.RoundToInt(rel/45f)%8)+8)%8;float v=s.travel.magnitude;int sb=v<1.9f?0:v<3.8f?1:2;if(b==bin&&(band<0||sb==band)){if(merged.Count==0||merged[merged.Count-1]!=all[k-1])merged.Add(all[k-1]);merged.Add(s);}}}
            if(merged.Count>4){var c=new Case{name="native-"+capture.seed+"-dir-"+dirNames[bin]+(band<0?"":"-"+bandNames[band]),group="native-direction",origin="native",note=Path.GetFileName(file)+" field players, frames binned by received travel vs facing; cruise window = locomotion-only pictures",clips=new string[0]};c.whole=Summarise("whole",merged,0,merged.Count);c.cruise=Summarise("locomotion",merged,0,merged.Count,true);results.Add(c);}
        }
        Drop();
        return results;
    }
}
#endif

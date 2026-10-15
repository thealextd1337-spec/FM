using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Animations;
using UnityEngine.Playables;
namespace Doppel6.Probe {
// This envelope reads completed native contacts, never guesses the next action.
public static class FootballActionTiming {
    // Native pictures arrive every PictureInterval (20 Hz: both captured matches
    // and every controlled fixture), and the display shows a received picture's
    // action as soon as it blends toward it. A ready countdown (passReady,
    // kickReady: progress 1 = the carrier's own native contact) is therefore
    // visible only up to one picture before its contact: the last shown ready
    // progress was 0.857-0.923 in all 54 ready-to-contact changes of the two
    // captured matches (0.857 in the fixtures), never 1. Played on progress, the
    // wind-up stopped short of the contact phase and the contact picture jumped
    // the clip (shot 0.394 -> 0.46 s, pass 0.686 -> 0.8 s in one picture).
    // ReadyPhase: the ready's own progress over that visible part (1 at its
    // last picture). The received progress stays the only clock.
    public const double PictureInterval=.05;
    public static double ReadyPhase(double progress,double duration)=>ReadyPhaseAtRate(progress,1/Math.Max(.001,duration));
    // rate: the countdown's progress per second (FootballPresentation reads it from the received pictures).
    public static double ReadyPhaseAtRate(double progress,double rate){double end=Math.Max(.5,1-PictureInterval*Math.Max(0,rate));return Math.Clamp(progress/end,0,1);}
    public static bool IsFootAction(string action){return action=="pass"||action=="highPass"||action=="cross"||action=="receive"||action=="control"||action=="passReady"||action=="shot"||action=="freeKick"||action=="volley"||action=="goalKick"||action=="kickReady"||action=="tackle";}
    public static float Weight(string action,double age,double progress,float speed){
        if(action=="passReady"||action=="kickReady")return (float)(.25+.75*Math.Clamp(progress,0,1));
        bool receive=action=="receive"||action=="control",shot=action=="shot"||action=="freeKick"||action=="volley"||action=="goalKick";
        double contact=receive?.12:.09,end=shot?(speed>.4?.48:.70):receive?(speed>.4?.30:.44):(speed>.4?.30:.46);
        var t=Math.Clamp((age-contact)/(end-contact),0,1);return (float)(1-t*t*(3-2*t));
    }
}
public static class FootballStrideTiming {
    // Clips are aligned at a measured sync marker (FootballStride.Gait.sync,
    // about the left footfall), so a walk, jog, run or sprint exchange keeps
    // the same foot on the ground at the same cycle value.
    public static double Time(double cycles,AnimationClip clip,float footfall=0){return (cycles+footfall)*Math.Max(.001,clip.length-.001);}
}
// Measured gait of an authored clip on the actual rig: metres per cycle that a
// planted foot portrays and the normalised left/right footfall times.
public static class FootballStride {
    // heading: measured travel direction the planted feet portray, in degrees
    // relative to the actor's forward (0 forward, about 180 backward); NaN when
    // no planted foot moves. A clip name never decides its direction.
    // sync: clip fraction of cycle 0 for the shared stride cycle. The first
    // threshold crossing of a sole (left) depends on how high a clip lands its
    // heel and on where its stance wraps the clip end: run_fast4 measured its
    // left footfall at 2 % although it touches down at about 90 %, which put its
    // stance feet up to 0.5 m away from those of the neighbouring bands at
    // the same cycle value (a band crossfade then dragged the planted foot).
    // The leg scissor (left minus right toe offset along the travel) is a
    // smooth periodic signal in every stride; its first-harmonic phase (left
    // foot furthest ahead) plus SyncLead, the measured mean distance from that
    // phase to the left touchdown, aligns the bands' feet (cross-band foot
    // offsets at equal cycle values: run_fast6/run_fast4 0.43 -> 0.18 m RMS).
    public struct Gait {public float stride,left,right,heading,sync;public bool syncKnown;}
    public const float SyncLead=.07f;
    // Stance: the sole stays within two centimetres of its lowest point. A
    // planted foot moves backwards relative to an in-place body; its mean
    // velocity is the ground speed the clip portrays.
    public static Gait Measure(AnimationClip clip,float[][] clearance,Vector3[][] toes,float dt){
        int n=clearance[0].Length;float weight=0;var velocity=Vector3.zero;var footfall=new float[2];
        for(int f=0;f<2;f++){
            float min=float.MaxValue;foreach(var c in clearance[f])min=Mathf.Min(min,c);
            int count=0;var v=Vector3.zero;footfall[f]=-1;
            for(int i=1;i<n;i++){
                bool now=clearance[f][i]-min<=.02f,before=clearance[f][i-1]-min<=.02f;
                if(now&&!before&&footfall[f]<0)footfall[f]=i/(float)(n-1);
                if(now&&before){count++;v+=(toes[f][i]-toes[f][i-1])/dt;}
            }
            if(count>0){velocity+=v;weight+=count;}
        }
        float speed=weight>0?new Vector2(velocity.x,velocity.z).magnitude/weight:0;
        float heading=speed>.05f?Mathf.Atan2(-velocity.x,-velocity.z)*Mathf.Rad2Deg:float.NaN;
        var gait=new Gait{stride=speed*clip.length,left=footfall[0],right=footfall[1],heading=heading};
        if(speed>.05f&&n>4){
            // Samples 0..n-2 cover one cycle (the last repeats the first).
            var along=new Vector3(-velocity.x,0,-velocity.z).normalized;double re=0,im=0;int m=n-1;
            for(int i=0;i<m;i++){double s=Vector3.Dot(toes[0][i]-toes[1][i],along),a=2*Math.PI*i/m;re+=s*Math.Cos(a);im+=s*Math.Sin(a);}
            if(2*Math.Sqrt(re*re+im*im)/m>.1){double phase=Math.Atan2(im,re)/(2*Math.PI);gait.sync=(float)(((phase+SyncLead)%1+1)%1);gait.syncKnown=true;}
        }
        return gait;
    }
}
public static class FootballKeeperTiming {
    // Measured windows in the existing authored clips. Native progress reaches
    // one at the real ball contact, rather than at an arbitrary clip length.
    public static double Time(string clip,double progress){
        double start=clip=="keeper_high_meshy"?.93:clip=="keeper_dive_meshy"?.23:.70;
        double contact=clip=="keeper_high_meshy"?1.46:clip=="keeper_dive_meshy"?.81:1.18;
        return start+(contact-start)*Math.Clamp(progress,0,1);
    }
    // Save clip from the contact relative to the keeper's received facing. A
    // global Z difference only equals the keeper's side when it faces along X;
    // diagonal or turned keepers need their own lateral axis.
    // After the contact, native recovery (0..1 over 1.55 s) continues each
    // authored clip instead of dropping every keeper to the floor. Measured hips
    // on the rig (clip-diagnostics): keeper_low_meshy stands again by 2.6 s;
    // keeper_high_meshy lands (hips 0.43 m) by 2.75 s; keeper_rise_meshy kneels
    // (0.34 m) at 3.0 s and stands (1.30 m) by 6.3 s. The native 1.55 s
    // leaves no room for its 3 s of lying, so a grounded keeper rises from the kneel.
    public const double LowStand=2.6,HighLand=2.75,HighLanding=.40,RiseKneel=3.0,RiseStand=6.6,DiveRise=.35;
    public enum Recovery {Save,Clip,Rise,Ready}
    // Which body a recovering save shows and at which clip time. Pure function
    // of the received recovery: pause, replay and seek show the same body.
    public static Recovery RecoveryPose(string save,double recovery,out double time){
        double r=Math.Clamp(recovery,0,1);
        if(save=="low"){time=1.18+(LowStand-1.18)*r;return Recovery.Clip;}
        // After an upright contact the clip lifts a hand to the forehead; the
        // keeper settles into its ready stance instead.
        if(save=="mid"){time=0;return Recovery.Ready;}
        if(save=="high"){
            if(r<HighLanding){time=1.46+(HighLand-1.46)*r/HighLanding;return Recovery.Clip;}
            time=RiseKneel+(RiseStand-RiseKneel)*(r-HighLanding)/(1-HighLanding);return Recovery.Rise;
        }
        if(r>DiveRise){time=RiseKneel+(RiseStand-RiseKneel)*(r-DiveRise)/(1-DiveRise);return Recovery.Rise;}
        time=0;return Recovery.Save;
    }
    // A native catch, only from known picture facts: saved and not parried or
    // conceded, the keeper owns the ball and it is not in flight. An older
    // picture without these facts never shows a held ball.
    public static bool Held(WorldPose p,WorldFrame f){return p!=null&&f!=null&&p.action=="save"&&p.savedKnown&&p.saved&&p.parryKnown&&!p.parry&&!(p.goalKnown&&p.goal)&&f.owner==p.id&&f.ballInFlightKnown&&!f.ballInFlight;}
    // Explicit view attachment requires every native fact. Missing old picture
    // fields and an old catch-origin goalKick.held never imply possession here.
    public static bool VisualHeld(WorldPose p,WorldFrame f){return Held(p,f)&&p.ballHeldKnown&&p.ballHeld&&p.goalKnown&&!p.goal&&(p.recovery>0||p.progress>=1);}
    // Share of the gather from the received ball to the chest: the gloves take
    // the ball where it is (as far as the arms reach) and bring it in over the
    // first GatherRecovery of the native recovery (1.55 s): about 0.47 s.
    // Pure function of the received recovery; the attachment picture itself
    // and every native fact stay unchanged.
    public const double GatherRecovery=.3;
    public static float Gather(double recovery){return FootballEnvelope.Smooth(recovery/GatherRecovery);}
    // A ball between MidSave and HighSave that needs no dive is met upright:
    // keeper_low_meshy scoops (hands 0.83 m at its 1.18 s contact), then gathers
    // to the chest (hands 1.24 m at 2.0 s, 1.45 m at 2.3 s, upright by 3.0 s).
    public const double HighSave=1.6,DiveSave=1.2,MidSave=.9,MidStart=1.9,MidContact=2.3;
    public static double MidTime(double progress){return MidStart+(MidContact-MidStart)*Math.Clamp(progress,0,1);}
    public static string SaveKind(Vector3 contact,Vector3 position,Vector3 facing){
        if(contact.y>HighSave)return "high";
        var forward=new Vector3(facing.x,0,facing.z);if(forward.sqrMagnitude<1e-6f)forward=Vector3.forward;forward.Normalize();
        var right=new Vector3(forward.z,0,-forward.x);var offset=contact-position;offset.y=0;
        return Math.Abs(Vector3.Dot(offset,right))>DiveSave?"dive":contact.y>MidSave?"mid":"low";
    }
}
static class FootballEnvelope {
    public static float Smooth(double x){var t=(float)Math.Clamp(x,0,1);return t*t*(3-2*t);}
    public static float Bump(double x){return x<=0||x>=1?0:(float)Math.Sin(Math.PI*x);}
}
// Aerial actions from the received native phases. airReady counts down to the
// arrival (progress 1); header, airLand and an aerial control start at the
// contact (progress 0) and land by their end. Pure functions of progress, so
// pause and replay show the same body. Nothing here moves the root or the ball
// or decides whether a contact happened.
public static class FootballAirTiming {
    // Largest pelvis rise and landing dip in metres; a jump reaches at most
    // MaxLift toward a contact, a higher ball stays out of reach.
    public const float MaxLift=.30f,MinLift=.12f,LandDip=.14f;
    // Lift needed for the head to meet the received contact height.
    public static float Lift(float contactHeight,float headHeight){return float.IsNaN(contactHeight)?MinLift:Mathf.Clamp(contactHeight-headHeight+.06f,MinLift,MaxLift);}
    // Preparation: a short crouch, then take-off; airborne at the arrival.
    public static float ReadyCrouch(double progress){return FootballEnvelope.Bump(Math.Clamp(progress,0,1)/.5)*.55f;}
    public static float ReadyLift(double progress){return FootballEnvelope.Smooth((progress-.3)/.7);}
    // Native picture: height falls as (1-p)^2 from the contact apex.
    public static float FallLift(double progress){var q=1-Math.Clamp(progress,0,1);return (float)(q*q);}
    // Native landing bend between 60 % and the end of the action.
    public static float Landing(double progress){return FootballEnvelope.Bump((progress-.6)/.4);}
    // Shins fold only while clearly airborne; arms rise with the jump.
    public static float Tuck(float lift){return FootballEnvelope.Smooth((lift-.2)/.5)*.7f;}
    public static float Arms(float lift,float crouch){return Mathf.Clamp01(lift*.85f+crouch*.25f);}
}
// Follow-through after a lofted kick or volley. Zero through the native
// contact window, so the contact pose stays the authored one.
public static class FootballKickTiming {
    public const double ContactEnd=.09,Peak=.22,End=.55;
    public static float FollowThrough(double age){return age<=ContactEnd?0:age<Peak?FootballEnvelope.Smooth((age-ContactEnd)/(Peak-ContactEnd)):1-FootballEnvelope.Smooth((age-Peak)/(End-Peak));}
}
// Throw-in from the native phases: while holding, pickup 0..1 lifts the ball
// (native 0.35 s) and progress reaches the ready release (native 0.55 s);
// after the release progress follows the first quarter of the ball flight.
public static class FootballThrowTiming {
    public static float Bend(double pickup){return 1-FootballEnvelope.Smooth(pickup/.8);}
    public static float Raise(double pickup){return FootballEnvelope.Smooth((pickup-.45)/.55);}
    public static float Arch(double progress){return FootballEnvelope.Smooth((progress-.64)/.36);}
    // Released: the arch whips forward and the arms follow through and settle.
    public static float ReleaseArch(double progress){return 1-FootballEnvelope.Smooth(progress/.25);}
    public static float ReleaseRaise(double progress){return 1-FootballEnvelope.Smooth(progress);}
    public static float Whip(double progress){return FootballEnvelope.Bump(Math.Clamp(progress,0,1)/.9);}
}
// Visual sampling only: no events, randomness, ownership, ball motion or game clock.
public sealed class FootballAnimation {
    // contactWeight: 0 or 1 is a full native contact; values between are a
    // partial visual reach (carrier stride). kind also accepts "two-hands" and "head".
    // slide/lunge: procedural duel weights (FootballDuelTiming); leftLead picks the leg.
    // turfStand (r21): an upright duel body without a stride (foul offender) stands on the turf (TurfStand below).
    // air*: aerial take-off/flight/landing (FootballAirTiming); airReach is the
    // received contact height or NaN. loft/volley: kick follow-through after the
    // native contact. throw*: native throw-in phases (FootballThrowTiming).
    // Natural motion (all received-data functions, FootballLocomotion):
    // pelvisYaw/legYaw/directionWeight turn the pelvis toward the observed
    // travel and the legs by the remaining angle (strideYaw alone is the older
    // single-angle request). cycleClip/cycles: the aligned stride clip and its
    // shared footfall cycle, so a fading stride keeps the same foot down.
    // sidePhase/sideLength/sideWeight: lateral side step. lockFeet: planted
    // soles keep their pitch point; settle: a stopped body closes its stance.
    // drive: acceleration share. fade: crossfade seconds (0 = default).
    // support: 0..1 walking support (FootballLocomotion.SupportWeight): the
    // lower sole is kept on the pitch. sideWeight also lowers the arms of a
    // field player's side step out of the ready-stance guard (not for keepers).
    public struct Pose {public AnimationClip clip,baseClip,cycleClip;public double time,baseTime,cycles,sidePhase;public bool loop,baseLoop,plant,contact,urgent,leftLead,ballHeld,lockFeet,settle,keeperStance,cyclesKnown,limitHands,paceFade;public bool actionOverStride,gatherKnown,startStep,startRight,braking,kick,ballContact,ready,lead,turfStand;public double leadIn;public float gather,handLimit;public Vector3 gatherFrom;public float support,actionWeight,forwardLean,turnLean,recoveryLean,strideYaw,strideScale,brake,pelvisYaw,legYaw,directionWeight,sideWeight,sideLength,drive,fade,keeperDive,contactWeight,slide,lunge,airLift,airReach,airTuck,airCrouch,airArms,loft,volley,throwBend,throwRaise,throwArch,throwRelease;public string key,kind;public Vector3 target;}
    // limitHands: a stride never carries a hand above the shoulders (soft limit,
    // weighted by the stride clips' share of the mix, at least handLimit: brake
    // and turn clips of a moving body, whose arms rose above the shoulders).
    // startStep: the native frame that starts a stride from rest; startRight:
    // the right foot takes the first step (FootballLocomotion.StartRightSwings).
    // braking: a stride under a brake episode (FootballLocomotion.Mode "brake").
    // kick: a pass, shot or receive clip after its ready phase (FootballActionTiming.IsFootAction).
    // ready: a native countdown (passReady/kickReady) before the carrier's own contact. Its clip
    // never plays on past the countdown: a countdown that ends without its contact (an aborted
    // pass) stops its wind-up where it was last shown (r15).
    // ballContact: the target of a full foot contact (or of the partial ready reach) is a ball centre; the boot meets the ball surface (FootballRig.BallContactTarget).
    // lead (r20): a partial reach toward a received foot contact still ahead in the display interval (WorldViewPlayback.Blend
    // lead); leadIn: seconds until its native event. It never makes a contact picture: weight below 1, no plant, no ball.
    // paceFade: a locomotion clip change crossfades over a time that grows with
    // the measured pose distance between the outgoing mix and the incoming
    // clips (ChangeRate), between the default 0.12 s and MaxChangeFade.
    // A native contact releases over this much match time instead of popping.
    public const double ContactRelease=.10;
    // Boot surface around the foot bones (ankle, toe base, toe tip) that meets a
    // ball, and the lowest sole point's height above the turf at a ball contact (metres).
    public const float BootHalf=.04f,FootContactLift=.01f;
    // A fixed 0.12 s crossfade between poses 100+ degrees apart (a forward run
    // exchanged for a backward run after a 166 degree native facing snap, a
    // sprint band change) drove thigh and shin at 1600-2000 deg/s on top of the
    // stride itself; the blend now lasts as long as ChangeRate needs for the
    // largest joint difference.
    public const float ChangeRate=360,MaxChangeFade=.35f;float changeFade=.12f;
    // Crossfade time of the current locomotion clip change (FootballLocomotion paces a band change over the same time).
    public float ChangeFade=>changeFade;readonly Quaternion[] changeFrom;
    readonly PlayableGraph graph;readonly AnimationMixerPlayable mixer;
    readonly Dictionary<AnimationClip,int> indices=new Dictionary<AnimationClip,int>();
    readonly List<AnimationClipPlayable> clips=new List<AnimationClipPlayable>();
    readonly AnimationClip[] sources;
    readonly float[] weights,start;
    readonly bool[] cyclic;
    readonly Transform root,hips;
    double changed,lastClock=-1,releaseFrom=-1;int selected=-1,baseSelected=-1;string key,releaseKind;Vector3 releaseTarget;
    // Planted-foot lock: world point of each planted sole, released when the
    // clip lifts the foot, the body has moved too far, or a stopped body closes
    // its stance with a short step.
    readonly bool[] locked=new bool[2],arc=new bool[2],lockedToe=new bool[2],toeOff=new bool[2];readonly Vector3[] anchor=new Vector3[2],releaseStart=new Vector3[2],correction=new Vector3[2];readonly double[] lockedAt={-1,-1},releasedAt={-1,-1};
    // A sole within LockOn of its standing height is in ground contact and
    // plants where it is: at 2.5 cm a landing foot first counted as down
    // (within 3 cm) slid on for one more picture until it planted 0.1 m further.
    public const float LockOn=.03f,LockOff=.035f,LockDrift=.25f,WidthDrift=.4f,SettleOffset=.05f,SettleLift=.05f;
    public const double LockRelease=.08,SettleStep=.2;public const float ArcTravel=.84f,PinClear=.02f,CatchDrift=.12f,CatchFrom=.15f,CatchRate=1.5f;
    readonly bool[] landing=new bool[2],caught=new bool[2];readonly double[] caughtAt=new double[2];readonly float[] entryClear={1,1},catchDrop=new float[2];
    // Toe-off: a running body's planted foot that has to leave its pitch point
    // before the clip lifts it (out of the leg's reach, a heel-off spin, the
    // body LockDrift away, or a clip lifting the ankle while the heel-off still
    // turns the toe down) lifts off along a ToeOffLift arc while it returns
    // to the sampled stride: it slid along the turf at up to 6 m/s before
    // (the stance of a stride clip played past its authored stride). Below
    // ToeOffSpeed (FootballLocomotion.SupportFull: a walking body always has a
    // sole down), in a procedural side step and in a settling stop the closing
    // step stays. The toe leaves within ToeOffRise, counted from the picture
    // before the release (the foot left its point during that interval and in
    // the release picture already moves with the clip), and the foot settles
    // into the sampled swing by the end of the release.
    public const float ToeOffLift=.08f,ToeOffSpeed=FootballLocomotion.SupportFull;public const double ToeOffRise=.05;
    // r18 diagnostics: horizontal shift (m) and turn (deg) of each foot's lock-release blend applied this picture.
    public readonly float[] ReleaseShiftShown=new float[2],ReleaseTurnShown=new float[2],SwingUpShown=new float[2],CatchDropShown=new float[2],ReleaseRaiseShown=new float[2];
    // Largest horizontal correction of a planted sole this frame (metres, diagnostics).
    public float FootLockOffset {get;private set;}
    // Diagnostics: per foot L/R locked, l/r free; t toe or a ankle contact; + releasing.
    // After '+': why the foot last left its lock (l lift, d drift, s settle, h heel-off spin, r reach, b first step of a start) and o for a toe-off.
    public string FootLockState=>(locked[0]?"L":"l")+(lockedToe[0]?"t":"a")+(releasedAt[0]>=0?"+"+releaseWhy[0]+(toeOff[0]?"o":""):"")+" "+(locked[1]?"R":"r")+(lockedToe[1]?"t":"a")+(releasedAt[1]>=0?"+"+releaseWhy[1]+(toeOff[1]?"o":""):"");
    readonly char[] releaseWhy={' ',' '};
    // Offset inertialization of the composed pose before the foot constraints,
    // contacts, procedural actions and the held ball (an offset after the foot
    // locks moved planted soles; measured). A discontinuity, i.e. a body joint leaving the
    // continuation of its own recent motion by more than InertiaDetect deg/s
    // within one picture (an episode restart, a band switch, a contact weight
    // cut), keeps what was shown and lets that offset decay over InertiaTime
    // while the new pose keeps its own motion. Fast continuous motion (a
    // procedural side step, a sprint) is no discontinuity and stays untouched.
    // Bones only, history since the last cut only: pause shows the same pose,
    // a seek starts without an offset.
    public const float InertiaDetect=1200;public const double InertiaTime=.15;
    readonly Transform[] poseBones;readonly int[] detectBones;readonly Quaternion[] shownLocal,inertiaOffset,rawLocal,rawBefore;Vector3 shownHips,inertiaHips;int rawKnown;double inertiaAt=-1,inertiaClock=-1,inertiaDt;
    // Diagnostics: inertialized jumps since the last cut.
    public int InertiaEvents {get;private set;}
    // Diagnostics of the last picture: largest composed-pose joint step (deg/s) and its departure from the joints' own continuation (deg/s).
    public float RawStep {get;private set;}
    public float RawJump {get;private set;}
    // Editor diagnostics only (null in the player): called with the stage of
    // the composed pose (0 sampled clips, 1 motion layers, 2 inertialized, 3
    // foot constraints, 4 final; r132: 9 after the procedural action layers, 10 after the contact preparation and plant,
    // before the contact solve), so a measured joint step names its stage.
    public Action<int> Probe;
    public float Weight(AnimationClip clip){return clip!=null&&indices.TryGetValue(clip,out var index)?weights[index]:0;}
    // B11 diagnostics: angle (deg) between an upper arm (shoulder -> elbow bone) and the body's down axis (-root.up). A
    // bind/T-pose holds both arms near 90; hanging or swinging arms stay far below. NaN without the bones.
    public static float ArmAbduction(Transform actor,bool right){
        string side=right?"Right":"Left";Transform arm=null,fore=null;
        foreach(var t in actor.GetComponentsInChildren<Transform>()){if(t.name=="mixamorig:"+side+"Arm")arm=t;else if(t.name=="mixamorig:"+side+"ForeArm")fore=t;}
        if(arm==null||fore==null)return float.NaN;return Vector3.Angle(fore.position-arm.position,-actor.up);
    }
    public float GroundShift {get;private set;}
    // r21: metres the last picture's turf stand moved the pelvis down (negative: up); 0 without turfStand.
    public float TurfShift {get;private set;}
    // r21: skinned-mesh bakes made by the turf stand (cost accounting).
    public static int TurfBakes;
    // B11 (r132): the foul offender's stumble clip (foul_stumble_meshy) holds both upper arms 55-85 degrees out from the body
    // through its whole upright window (measured on this rig, FoulPoseDiagnostics; idle_stand_meshy: 9-16 degrees): on the
    // standing offender this reads as a T-pose. A turf-standing offender's upper arms are kept within OffenderArmLimit of the
    // body's down axis (FootballRig.LowerArms), weighted by the stumble clip's share of the mix, so the entry from the
    // stride and the exit into the standing clip stay continuous. Bones only; root, heading, time and the native window stay.
    public const float OffenderArmLimit=40;
    // Diagnostics: degrees the last picture lowered the more raised upper arm (0 without turfStand or below the limit).
    public float ArmLowered {get;private set;}
    // Pelvis drop of the walking support in the last sample (metres, diagnostics).
    public float SupportDrop {get;private set;}
    public const float SupportLimit=.07f;
    float contactDrop;
    public float ReleaseWeight {get;private set;}
    public readonly FootballRig rig;
    public readonly FootballGround ground;
    public float RootHeight=>ground.RootHeight;
    public float StrideLength(AnimationClip clip)=>ground.StrideLength(clip);
    public float Footfall(AnimationClip clip)=>ground.Footfall(clip);
    public float RightFootfall(AnimationClip clip)=>ground.RightFootfall(clip);
    public double StrideTime(double cycles,AnimationClip clip)=>FootballStrideTiming.Time(cycles,clip,ground.Sync(clip));
    public float Sync(AnimationClip clip)=>ground.Sync(clip);
    public FootballAnimation(PlayableGraph graph,Transform actor,IEnumerable<AnimationClip> catalogue){
        this.graph=graph;root=actor;rig=new FootballRig(actor);ground=new FootballGround(actor);rig.ground=ground;hips=Array.Find(actor.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:Hips");
        foreach(var clip in catalogue)if(clip!=null&&!indices.ContainsKey(clip))indices.Add(clip,indices.Count);
        weights=new float[indices.Count];start=new float[indices.Count];cyclic=new bool[indices.Count];sources=new AnimationClip[indices.Count];mixer=AnimationMixerPlayable.Create(graph,indices.Count);
        foreach(var entry in indices){var playable=AnimationClipPlayable.Create(graph,entry.Key);playable.SetApplyFootIK(false);playable.SetApplyPlayableIK(false);clips.Add(playable);sources[entry.Value]=entry.Key;graph.Connect(playable,0,mixer,entry.Value);}
        graph.GetOutput(0).SetSourcePlayable(mixer);
        poseBones=Array.FindAll(actor.GetComponentsInChildren<Transform>(),t=>t.name.StartsWith("mixamorig:"));shownLocal=new Quaternion[poseBones.Length];changeFrom=new Quaternion[poseBones.Length];inertiaOffset=new Quaternion[poseBones.Length];rawLocal=new Quaternion[poseBones.Length];rawBefore=new Quaternion[poseBones.Length];
        var watched=new[]{"Hips","LeftUpLeg","RightUpLeg","LeftLeg","RightLeg","LeftFoot","RightFoot","Spine","Spine1","Spine2","LeftArm","RightArm","LeftForeArm","RightForeArm","Head"};
        var found=new List<int>();for(int k=0;k<poseBones.Length;k++)if(Array.IndexOf(watched,poseBones[k].name.Substring(10))>=0)found.Add(k);detectBones=found.ToArray();
        Measure(actor);
    }
    void Only(int index,double time){for(int i=0;i<clips.Count;i++)mixer.SetInputWeight(i,i==index?1:0);clips[index].SetTime(time);graph.Evaluate(0);}
    // Measures each catalogue clip once per session on this rig. Shared by all
    // actors, since every figure uses the same skeleton and scale.
    void Measure(Transform actor){
        if(!ground.Calibrated)foreach(var entry in indices)if(entry.Key.name==FootballGround.ReferenceClip){Only(entry.Value,0);ground.Calibrate();ground.SetSole(FootballGround.LowestVertex(actor));break;}
        if(ground.Calibrated){
            var toes=new[]{Bone("LeftToeBase"),Bone("RightToeBase")};var shoulders=new[]{Bone("LeftArm"),Bone("RightArm")};
            foreach(var entry in indices){
                var clip=entry.Key;if(ground.Known(clip))continue;
                const int n=48;var clearance=new[]{new float[n],new float[n]};var toe=new[]{new Vector3[n],new Vector3[n]};float lowest=float.MaxValue,dt=(clip.length-.001f)/(n-1);
                float chestSum=0;int chestCount=0;
                for(int s=0;s<n;s++){
                    Only(entry.Value,s*dt);lowest=Mathf.Min(lowest,ground.Lowest);
                    if(shoulders[0]!=null&&shoulders[1]!=null){var line=Vector3.ProjectOnPlane(shoulders[1].position-shoulders[0].position,actor.up);if(line.sqrMagnitude>1e-6f){var chest=Vector3.Cross(line,actor.up);chestSum+=Vector3.SignedAngle(Vector3.ProjectOnPlane(actor.forward,actor.up),chest,actor.up);chestCount++;}}
                    for(int f=0;f<2;f++){clearance[f][s]=ground.Clearance(f);toe[f][s]=toes[f]!=null?Quaternion.Inverse(actor.rotation)*(toes[f].position-actor.position):Vector3.zero;}
                }
                // Bone clearance finds the lowest moments; the skinned sole decides the
                // offset, since a stretched foot can sit higher than its bones suggest.
                var order=new List<int>();for(int s=0;s<n;s++)order.Add(s);order.Sort((x,y)=>Mathf.Min(clearance[0][x],clearance[1][x]).CompareTo(Mathf.Min(clearance[0][y],clearance[1][y])));
                if(ground.SoleKnown){
                    // The four lowest bone moments plus eight even samples: a lying or
                    // kneeling body may touch down with something other than a foot.
                    var picks=new HashSet<int>();for(int k=0;k<4&&k<n;k++)picks.Add(order[k]);for(int k=0;k<8;k++)picks.Add(k*(n-1)/7);
                    lowest=float.MaxValue;foreach(var k in picks){Only(entry.Value,k*dt);lowest=Mathf.Min(lowest,FootballGround.LowestVertex(actor)-ground.Sole);}
                }
                ground.StoreChestBias(clip,chestCount>0?chestSum/chestCount:0);ground.Store(clip,lowest);ground.StoreClearance(clip,clearance);ground.StoreGait(clip,toes[0]!=null&&toes[1]!=null?FootballStride.Measure(clip,clearance,toe,dt):new FootballStride.Gait{left=-1,right=-1});
            }
        }
        for(int i=0;i<clips.Count;i++){mixer.SetInputWeight(i,0);clips[i].SetTime(0);}
    }
    Transform Bone(string name){return Array.Find(root.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:"+name);}
    // Editor diagnostics: skinned sole of one clip at one time through the measuring path.
    public float MeasuredSole(AnimationClip clip,double time){if(!indices.TryGetValue(clip,out var index))return float.NaN;Only(index,time);float v=FootballGround.LowestVertex(root)-ground.Sole;mixer.SetInputWeight(index,0);lastClock=-1;return v;}
    // r21: a foot's height above the turf by its skinned sole contour (bones when the contour is unknown), metres.
    public float TurfClearance(int foot){float c=ground.SolePointClearance(foot);return float.IsNaN(c)?ground.Clearance(foot):c;}
    public void Sample(Pose pose,double clock,bool cut=false){
        if(pose.clip==null||!indices.TryGetValue(pose.clip,out var index))throw new InvalidOperationException("Football clip is missing");
        if(!cut&&clock==lastClock)return;
        rig.ClearSwivel();
        int baseIndex=-1;float actionWeight=1;
        if(pose.baseClip!=null){if(!indices.TryGetValue(pose.baseClip,out baseIndex))throw new InvalidOperationException("Football stride clip is missing");actionWeight=Mathf.Clamp01(pose.actionWeight);if(baseIndex==index){baseIndex=-1;actionWeight=1;}}
        bool reset=cut||lastClock<0||clock<lastClock||clock-lastClock>1;
        if(reset){Array.Clear(weights,0,weights.Length);weights[index]=actionWeight;if(baseIndex>=0)weights[baseIndex]=1-actionWeight;Array.Copy(weights,start,weights.Length);selected=index;baseSelected=baseIndex;changed=clock;key=pose.key;rig.Release();releaseFrom=-1;readyFrom=-1;switchFrom=-1;lastFullLimb=-1;contactDrop=0;ClearLocks();heldReady=-1;readyClock=readyPoseClock=-1;finalClock=-1;finalPlant=-1;}
        bool measureChange=false;
        if(reset)changeFade=.12f;
        else if(selected!=index||baseSelected!=baseIndex){
            // Every paced locomotion change measures its pose distance below; a
            // phase-synced band change stays near 0.12 s, and FootballLocomotion
            // paces its stride warp over the same ChangeFade (WorldViewBridge).
            Array.Copy(weights,start,weights.Length);selected=index;baseSelected=baseIndex;changed=clock;changeFade=.12f;measureChange=pose.paceFade&&!pose.contact&&!pose.urgent&&pose.fade<=0;}
        bool fullFoot=pose.contact&&(pose.kind=="foot"||pose.kind=="left-foot")&&(pose.contactWeight<=0||pose.contactWeight>=1);
        if(key!=pose.key){
            // A plant that goes on under the next action with the same standing foot
            // (passReady -> pass, kickReady -> shot) keeps its anchor and step: re-anchored
            // at the rest pose of the new action's first picture, the standing foot jumped
            // there (r15: 0.5 m within one picture, native passes).
            if(pose.plant&&finalPlant==(pose.kind=="left-foot"?1:0)&&rig.Planted)rig.ReleaseContact();else rig.Release();
            key=pose.key;releaseFrom=-1;readyFrom=-1;switchFrom=-1;lastFullLimb=-1;
            // A countdown that ends without its own contact (passReady -> idle, receive, a new
            // action): its wind-up stops where it was shown (heldReady, below) and the ready
            // reach returns from where it held the boot instead of vanishing in one picture.
            if(readyClock>=0&&readyClock==lastClock&&!fullFoot)ReadyAbort();
            if(readyPoseClock>=0&&readyPoseClock==lastClock&&readyIndex!=index&&!fullFoot)heldReady=readyIndex;
        }
        if(heldReady==index||heldReady==baseIndex)heldReady=-1;
        int cycleIndex=-1;if(pose.cycleClip!=null&&indices.TryGetValue(pose.cycleClip,out cycleIndex))cyclic[cycleIndex]=true;
        // Real match time drives both the sample and the fade, so a pause freezes bones.
        // A received contact cannot wait for a cosmetic crossfade. A keeper
        // launch uses a short response; ordinary movement keeps a softer blend.
        // A carrier's visual reach (a partial foot contact, no received contact)
        // keeps the clip crossfade: switching it to 1 for the reach's two pictures
        // jumped a brake-to-run mix to the run and back (2883 and 2276 deg/s).
        bool reach=pose.contact&&(pose.kind=="foot"||pose.kind=="left-foot")&&pose.contactWeight>0&&pose.contactWeight<1;
        float fade=pose.contact&&!reach?1:(float)Math.Clamp((clock-changed)/(pose.urgent?.035:pose.fade>0?pose.fade:pose.paceFade?changeFade:.12),0,1);
        if(!reset)for(int i=0;i<weights.Length;i++)weights[i]=Mathf.Lerp(start[i],i==selected?actionWeight:i==baseSelected?1-actionWeight:0,fade);
        for(int i=0;i<clips.Count;i++){
            mixer.SetInputWeight(i,weights[i]);
            if(i==index||i==baseIndex){var clip=i==index?pose.clip:pose.baseClip;double time=i==index?pose.time:pose.baseTime;bool loop=i==index?pose.loop:pose.baseLoop;double end=Math.Max(.001,clip.length-.001);clips[i].SetTime(loop?(time%end+end)%end:Math.Clamp(time,0,end));}
            // A fading stride clip stays on the shared footfall cycle, so walk,
            // jog, run and back strides exchange with the same foot down.
            else if(cyclic[i]&&pose.cyclesKnown&&weights[i]>0){double end=Math.Max(.001,sources[i].length-.001),time=StrideTime(pose.cycles,sources[i]);clips[i].SetTime((time%end+end)%end);}
            // An aborted countdown's clip holds its last shown time while it fades out.
            else if(i==heldReady){}
            else if(lastClock>=0&&clock>lastClock)clips[i].SetTime(clips[i].GetTime()+clock-lastClock);
        }
        if(heldReady>=0&&weights[heldReady]<=0)heldReady=-1;
        if(measureChange){
            // The change picture shows the outgoing mix (fade 0); the incoming clips
            // are evaluated alone once to measure the pose distance.
            // Distances relative to the actor root: a foot's orientation sums the
            // changes of pelvis, thigh and shin.
            var unturn=Quaternion.Inverse(root.rotation);
            graph.Evaluate(0);foreach(int k in detectBones)changeFrom[k]=unturn*poseBones[k].rotation;
            for(int i=0;i<clips.Count;i++)mixer.SetInputWeight(i,i==index?actionWeight:i==baseIndex?1-actionWeight:0);
            graph.Evaluate(0);float distance=0;foreach(int k in detectBones)distance=Mathf.Max(distance,Quaternion.Angle(changeFrom[k],unturn*poseBones[k].rotation));
            changeFade=Mathf.Clamp(distance/ChangeRate,.12f,MaxChangeFade);
            for(int i=0;i<clips.Count;i++)mixer.SetInputWeight(i,weights[i]);
        }
        graph.Evaluate(0);
        // Measured floating clips are lowered onto the pitch, weighted like the mixer.
        float shift=0;for(int i=0;i<weights.Length;i++)shift+=weights[i]*ground.Of(sources[i]);
        // r21: the turf-stand clip's own float at its shown time (measured bone clearance above its clip offset), weighted
        // like the mixer, so a crossfade into the floating stumble lowers it linearly with its share.
        // Smoothstep of its weight: early in the crossfade the stride's pointed swing toe still reaches down (linear: it was pushed
        // 6 cm into the turf and lifted back, a 4 cm pelvis bump).
        if(pose.turfStand)shift+=FootballEnvelope.Smooth(weights[index])*ground.FloatAt(pose.clip,clips[index].GetTime());
        GroundShift=shift;if(shift>0&&hips!=null)hips.position-=root.up*shift;
        Probe?.Invoke(0);
        bool full=pose.contactWeight<=0||pose.contactWeight>=1;
        // Bone-only response to observed motion. Planted actions and full hand,
        // two-hand and head contacts retain their authored pose. A moving foot
        // contact keeps the layers continuous: they act with the stride's share
        // of the mix, which the kick clip takes over through its own fade
        // (dropping them in the contact picture popped the body). The contact
        // limb is solved afterwards. The root remains game-owned.
        bool footContact=pose.kind=="foot"||pose.kind=="left-foot";
        if(!pose.plant&&(!pose.contact||!full||footContact)){
            // An action clip (pass, shot, receive) over the stride: the stride's
            // actual share of the faded mix carries the direction, so it never
            // halves in one frame. Turn, brake and stand are locomotion: their
            // direction stays continuous when a base stride appears or ends.
            float pelvis=pose.pelvisYaw,leg=pose.legYaw,weight=pose.directionWeight*(pose.actionOverStride&&baseIndex>=0?Mathf.Clamp01(1-weights[index]):1);
            if(weight<=0&&Mathf.Abs(pose.strideYaw)>.001f){weight=1;pelvis=Mathf.Clamp(pose.strideYaw*FootballLocomotion.PelvisShare,-FootballLocomotion.PelvisLimit,FootballLocomotion.PelvisLimit);leg=Mathf.Clamp(pose.strideYaw-pelvis,-FootballLocomotion.LegLimit,FootballLocomotion.LegLimit);}
            // Stride warping acts on the stride clips' share of the mixed pose only.
            float strideShare=0;for(int i=0;i<weights.Length;i++)if(cyclic[i])strideShare+=weights[i];
            rig.Directional(pelvis,leg,weight,pose.strideScale>0?Mathf.Lerp(1,pose.strideScale,Mathf.Clamp01(strideShare)):1);
            if(pose.sideWeight>0)rig.SideStep(pose.sidePhase,pose.sideLength,pose.sideWeight,pose.keeperStance);
            if(pose.drive>0)rig.Drive(pose.drive);
            if(pose.brake>0)rig.Brake(pose.brake);
            // A stride clip whose authored chest is turned away from its own
            // forward (measured mean over the cycle, e.g. the diagonal backward
            // clips) turns back to the received facing; the cyclic arm swing stays.
            float bias=0;for(int i=0;i<weights.Length;i++)if(cyclic[i]&&weights[i]>0)bias+=weights[i]*ground.ChestBias(sources[i]);
            if(Mathf.Abs(bias)>2)rig.ChestTurn(-Mathf.Clamp(bias,-25,25));
            rig.Lean(pose.forwardLean,pose.turnLean,pose.recoveryLean);
            if(pose.sideWeight>0&&!pose.keeperStance)rig.SideArms(pose.sideWeight,pose.sidePhase);
            if(pose.limitHands)rig.LimitHands(Mathf.Max(strideShare,pose.handLimit));
        }
        // An established procedural side step is continuous by construction (its
        // quick lift is no clip switch); entering and leaving it stays covered. An
        // urgent response (keeper launch, slide) keeps its authored 35 ms reaction.
        Probe?.Invoke(1);
        Inertia(clock,reset,pose.sideWeight<SideStepSettled&&!pose.urgent);
        Probe?.Invoke(2);
        // Walking support: a walking body always stands on one sole. When the
        // sampled pose (a back_walk float, a brake hop, a run clip at walking
        // speed) has both soles above the pitch, the pelvis lowers by the lower
        // foot's clearance, at most SupportLimit. Bones only; running flight
        // above SupportNone stays authored.
        // Applied before the planted-foot lock (a floating authored stance, e.g.
        // back_walk's left foot 2-5 cm up, must be on the pitch to plant) and
        // once more after it, so a release blend that still carries a heel-off
        // lift cannot hold both soles in the air. Together at most SupportLimit.
        SupportDrop=0;bool supported=pose.support>0&&!pose.plant&&!pose.ballHeld&&pose.slide<=0&&pose.airLift<=0&&pose.airCrouch<=0&&pose.keeperDive==0&&hips!=null;
        // With exactly one sole planted (foot lock) that sole is the support: the
        // pelvis lowers by its clearance and the swinging foot keeps its point
        // (back_walk's planted foot floated 2-3 cm while the swinging toe dragged
        // on the turf and, being the lower sole, decided the drop). At most by the
        // clip's measured stance float: a planted foot that the stride lifts shows
        // that lift, so the lock releases it as it happens (lowered by its whole
        // clearance, a side step's lifting foot stayed on the turf until the other
        // foot relocked and then rose 7.6 cm within one picture, 31.7 deg thigh step).
        var floats=Floats(pose);
        // r18: the boot of a running ball release keeps its ground clearance by the release's own swing rule (RaiseFoot
        // below: SwingClear by its speed, the sole deficit included), as TurfPlant leaves it to the release: lifted here as
        // well by the sole lift and Swing, the releasing receive boot gained 141 deg/s (shin, 160114-field-11 34.933,
        // 1509 -> 1567 -> 1650) under the release blend.
        bool releasing=!pose.ballHeld&&!pose.contact&&releaseFrom>=0&&clock>releaseFrom&&clock-releaseFrom<contactReleaseLength&&(releaseKind=="foot"||releaseKind=="left-foot");
        int groundOwned=releasing&&releaseBall&&pose.lockFeet?(releaseKind=="left-foot"?0:1):-1;
        void Support(){if(!supported)return;int planted=locked[0]!=locked[1]?(locked[0]?0:1):-1;float lift=planted>=0?Mathf.Min(ground.SupportClearance(planted),floats[planted]):Mathf.Min(ground.SupportClearance(0),ground.SupportClearance(1));if(lift<=.002f)return;float d=Mathf.Min(lift,SupportLimit-SupportDrop)*Mathf.Clamp01(pose.support);if(d<=0)return;var keep=planted>=0?rig.Ankle(1-planted).position:Vector3.zero;hips.position-=root.up*d;if(planted>=0)rig.PlaceFoot(1-planted,keep);SupportDrop+=d;}
        Support();
        Probe?.Invoke(5);
        FootLock(pose,clock,floats);
        Probe?.Invoke(6);
        Support();
        // A locomotion or kick pose never puts a sole into the turf (measured on
        // brake_meshy: toes up to 0.18 m below): the leg is lifted, not stretched.
        if(pose.lockFeet)for(int f=0;f<2;f++){if(pose.plant&&f==(pose.kind=="left-foot"?1:0)||f==groundOwned)continue;float d=ground.SoleDeficit(f);if(d>.004f)rig.PlaceFoot(f,rig.Ankle(f).position+root.up*d);}
        Probe?.Invoke(7);
        Swing(clock,pose.lockFeet&&!pose.plant&&!pose.ballHeld&&pose.slide<=0&&pose.airLift<=0&&pose.keeperDive==0,pose.support<=0,groundOwned);
        Probe?.Invoke(8);
        if(pose.lockFeet&&!pose.plant&&!pose.ballHeld&&pose.slide<=0&&pose.airLift<=0&&pose.keeperDive==0&&pose.sideWeight<.5f){
            int limb=footContact&&pose.contact&&full?(pose.kind=="left-foot"?0:1):releaseFrom>=0&&clock>releaseFrom&&clock-releaseFrom<contactReleaseLength&&(releaseKind=="foot"||releaseKind=="left-foot")?(releaseKind=="left-foot"?0:1):-1;
            TurfPlant(clock,limb);}
        for(int f=0;f<2;f++){shownClear[f]=Mathf.Min(ground.AnkleClearance(f),ground.ToeClearance(f));shownAnkle[f]=rig.Ankle(f).position;}
        Probe?.Invoke(3);
        if(pose.keeperDive!=0)rig.KeeperDive(pose.keeperDive,pose.target);
        // r21: the standing clips' share of the mix (pose clip and base) of a turf-standing pose. Its lunge enters with it: at
        // full weight from the first offender picture it dropped the sprinting body 0.13 m in one picture (native 160112
        // field-11, 52.067: 3.6 m/s pelvis). A tackle keeps its full lunge at the native contact.
        float standShare=pose.turfStand?Mathf.Clamp01(weights[index]+(baseIndex>=0?weights[baseIndex]:0)):1;
        if(pose.lunge>0)rig.Lunge(pose.lunge*standShare);
        ArmLowered=pose.turfStand?rig.LowerArms(OffenderArmLimit,FootballEnvelope.Smooth(weights[index])):0;
        // r21: foul_stumble_meshy keys its hips 0.31 rig units (0.45 m) above this rig's standing convention: over the
        // whole 2.1 s it plays at full weight the lower boot stood 0.74 m above the turf, straight legs hanging (the floating
        // offender). The constant clip offset cannot hold it (measured over the whole 11.4 s clip, whose later knees touch
        // down: 0.06 m), and the lunge (0.13 m pelvis drop) and the blend back to the standing clip change the height every
        // picture. The upright offender therefore stands on the turf after every body layer: the pelvis moves by the lower
        // foot's skinned sole contour (FootballGround.SolePointClearance; ankle/toe bones without a contour). The toe-tip bone
        // is not used: on the pointed stumble foot it read 0 while that boot's sole stood 6-7.5 cm above the turf. Bones
        // only; root, heading and time stay. The correction acts with the standing clips' share of the mix (the pose clip and
        // its base): in the crossfade from a sprint into the foul the stride's running flight is not pulled onto the turf in
        // one picture (applied in full at once: 3.6 m/s pelvis drop in the first offender picture, native 160112 field-11). A
        // foot below the turf is always raised in full (the clip float above lowers linearly, the bone blend does not).
        TurfShift=0;
        // A sinking foot is judged by the deeper of its sole contour and its ankle/toe-base bones (in the crossfade from a sprint the
        // pointed swing boot's toe, outside the contour, went 5.8 cm into the turf: 160112 field-11, 52.150).
        // While the stride still crossfades in (standShare below 1, at most OffenderEntry per foul) the skinned mesh itself is read
        // as well: the pointed sprint toe sits 3 cm below its toe-base bone (one bake of one figure per picture, measured cost in
        // FootballDuelTests).
        if(pose.turfStand&&hips!=null){float low=Mathf.Min(TurfClearance(0),TurfClearance(1)),deep=Mathf.Min(low,Mathf.Min(ground.Clearance(0),ground.Clearance(1)));
            if(standShare<1&&ground.SoleKnown){deep=Mathf.Min(deep,FootballGround.LowestVertex(root)-ground.Sole);TurfBakes++;}if(!float.IsNaN(low)&&!float.IsInfinity(low)&&!float.IsNaN(deep)){TurfShift=deep<0?deep:low*standShare;hips.position-=root.up*TurfShift;}}
        if(pose.airLift>0||pose.airCrouch>0||pose.airTuck>0||pose.airArms>0)rig.Air(pose.airLift,pose.airReach,pose.airTuck,pose.airCrouch,pose.airArms);else rig.ClearAir();
        if(pose.loft>0||pose.volley>0)rig.FollowThrough(pose.loft,pose.volley,ShownBend(1,reset));
        if(pose.throwBend>0||pose.throwRaise>0||pose.throwArch>0||pose.throwRelease>0)rig.Throw(pose.throwBend,pose.throwRaise,pose.throwArch,pose.throwRelease);
        Probe?.Invoke(9);
        // The received contact point of a foot action is the ball centre: a ground
        // ball shows it 0.176 m high (ProbeBridge.DisplayHeight) while this rig's
        // ankle stands 0.245 m above the turf. Solved into the centre, the ankle
        // put the boot 4-16 cm into the turf through the contact and its release,
        // and the reach drop toward it lowered the planted sole up to 10 cm (R9
        // shot, pass and receive). The boot meets the ball's surface instead, its
        // sampled pitch kept and its lowest sole point FootContactLift above the
        // turf. The received point, contact time, root and ball are unchanged.
        // The ready reach (a partial ball contact before the native contact) aims at
        // the same boot-surface point with the sole SwingClear up: a swinging boot
        // stays out of the contact band (Swing) until the contact picture sets it
        // down to FootContactLift.
        // r20: a lead whose foot still carries the body (locked, FootLock) waits: no reach, no contact picture of its own.
        // Once the foot is free it reaches from where it is shown, its weight rising from that picture to the native
        // event (Pose.leadIn); without a free picture the event's own contact meets the point, as before.
        bool leadWait=pose.lead&&pose.contact&&footContact&&locked[pose.kind=="left-foot"?0:1];
        if(!pose.lead||leadWait)leadFrom=-1;else if(leadFrom<0)leadFrom=lastClock>=0&&!reset?lastClock:clock;
        float leadWeight=pose.lead&&!leadWait?Mathf.Clamp((float)((clock-leadFrom)/Math.Max(1e-6,clock+pose.leadIn-leadFrom)),.001f,.999f):0;
        var target=pose.target;bool readyBall=pose.contact&&!full&&pose.ballContact&&footContact&&pose.lockFeet&&ground.Calibrated&&!leadWait;
        if(pose.contact&&(full||readyBall)&&pose.ballContact&&footContact&&ground.Calibrated){int f=pose.kind=="left-foot"?0:1;target=rig.BallContactTarget(f,pose.target,WorldBallMotion.Radius,BootHalf,rig.Ankle(f).position.y-ground.SupportClearance(f)+(full?FootContactLift:SwingClear));}
        if(pose.contact&&full)contactDrop=rig.PrepareContact(target,pose.kind);
        if(pose.plant){int stand=pose.kind=="left-foot"?1:0;bool shownKnown=finalClock>=0&&!reset&&clock-finalClock<.1;rig.Plant(stand==1,clock,shownKnown?finalAnkle[stand]:(Vector3?)null,shownKnown&&finalClear[stand]>FootballRig.PlantLand);}
        else rig.Release();
        Probe?.Invoke(10);
        if(pose.slide>0)rig.Slide(pose.slide,pose.target,pose.leftLead);
        ReleaseWeight=0;if(!readyBall){if(readyClock>=0&&readyClock==lastClock&&!(pose.contact&&full&&footContact))ReadyAbort();readyFrom=-1;}
        if(pose.ballHeld){rig.GatherBall(pose.gatherKnown?pose.gatherFrom:(Vector3?)null,pose.gatherKnown?pose.gather:1);releaseFrom=-1;}
        else if(pose.contact&&!leadWait){
            int limb=pose.kind=="left-foot"?0:1;var sampledLimb=rig.Ankle(limb).position;
            // The ready reach moves the ankle along the straight line from the
            // sampled swing toward the boot-surface point (its knee in its own bend
            // plane, the boot turned as sampled): a rotation blend between the
            // wind-up and the solved leg dipped the boot into the turf (R11 v4).
            // A countdown first shown late (a native passReady appearing at progress
            // 0.886 straight after a receive and held there) eases its reach in over
            // ReadyReachEase from its first reaching picture instead of popping to
            // the ball (4468 deg/s shin); the full countdown's reach takes as long.
            // r15: the ease-in bounds the countdown's own reach weight (the smaller of both) instead of
            // multiplying it: a fully shown countdown's reach already starts from 0 at its first
            // reaching picture, and the product of both ramps pressed the reach into two pictures
            // (a running passer's boot 22 m/s, 2041 deg/s shin); a late countdown still eases in.
            // r20: a received contact's lead (Pose.lead) reaches on from what is shown: a running release (an aborted
            // countdown's reach, a contact's return) goes on beneath it instead of ending in its first picture (the boot
            // dropped to its clip: 862 deg/s thigh at 120 Hz).
            bool leadRelease=pose.lead&&readyBall&&releaseFrom>=0&&clock>releaseFrom&&clock-releaseFrom<contactReleaseLength;
            if(leadRelease)ContinueRelease();
            if(readyBall){if(readyFrom<0)readyFrom=clock;float w=pose.lead?leadWeight:Mathf.Min(pose.contactWeight,FootballEnvelope.Smooth((clock-readyFrom)/ReadyReachEase));rig.ReachFoot(limb,target,w);float d=SwingClear*w-ground.SupportClearance(limb);if(d>.0005f)rig.RaiseFoot(limb,d);readyLimb=limb;readyLocal=root.InverseTransformPoint(rig.Ankle(limb).position);readyClock=clock;}
            else rig.Contact(target,pose.kind,full?1:pose.contactWeight,true,false,ShownBend(limb,reset),Shown(limb,reset));
            if(full&&pose.lockFeet)GroundContactFoot(pose.kind,target);
            // Only a full native contact releases gradually; the next frames keep
            // the limb near the actual contact point and return within 0.1 s.
            if(full&&footContact&&switchFrom<0&&lastFullLimb>=0&&lastFullLimb!=limb&&lastFullClock==lastClock){switchFrom=lastClock;switchLimb=lastFullLimb;switchLocal=releaseLocal;switchReached=releaseReached;switchLength=Math.Clamp(Math.Max(Vector3.Distance(finalAnkle[switchLimb],rig.Ankle(switchLimb).position)/BallReleaseSpeed,rig.LegTurn(switchLimb)/BallReleaseRate),ContactRelease,MaxBallRelease);}
            if(full){releaseShown=rig.Ankle(limb).position;releaseClock=clock;releaseFrom=clock;releaseKind=pose.kind;releaseTarget=target;releaseLocal=root.InverseTransformPoint(target);releaseReached=rig.reachable;releaseBall=pose.ballContact&&footContact&&pose.lockFeet&&ground.Calibrated;contactReleaseLength=releaseBall?Math.Clamp(Math.Max(Vector3.Distance(rig.Ankle(limb).position,sampledLimb)/BallReleaseSpeed,rig.LegTurn(limb)/BallReleaseRate),ContactRelease,MaxBallRelease):ContactRelease;}else if(!leadRelease)releaseFrom=-1;
        }else if(releaseFrom>=0&&clock>releaseFrom&&clock-releaseFrom<contactReleaseLength)ContinueRelease();
        else{releaseFrom=-1;contactDrop=0;}
        void ContinueRelease(){
            float q=(float)((clock-releaseFrom)/contactReleaseLength);ReleaseWeight=1-q*q*(3-2*q);
            // The pelvis lowered toward the contact rises with the release instead of
            // popping; the other foot keeps its point (FootballRig.LowerKeeping).
            if(contactDrop>0&&hips!=null)rig.LowerKeeping(contactDrop*ReleaseWeight,releaseKind);
            // A ball release returns from where the boot met the ball relative to the
            // body: the ball has left, and held at its world point the boot fell back
            // behind a body running on at 4 m/s before it caught up with the follow-through.
            rig.Contact(releaseBall?root.TransformPoint(releaseLocal):releaseTarget,releaseKind,ReleaseWeight,false,releaseReached,ShownBend(releaseKind=="left-foot"?0:1,reset),Shown(releaseKind=="left-foot"?0:1,reset));
            if(pose.lockFeet&&releaseBall){int f=releaseKind=="left-foot"?0:1;var a=rig.Ankle(f).position;float v=clock>releaseClock?Flat(a-releaseShown).magnitude/(float)(clock-releaseClock):0;
                rig.RaiseFoot(f,SwingClear*Mathf.Clamp01((v-SwingSlow)/(SwingFast-SwingSlow))-ground.SupportClearance(f));releaseShown=rig.Ankle(f).position;releaseClock=clock;}
            else if(pose.lockFeet)GroundContactFoot(releaseKind,null);
        }
        // r18: the limb a full foot contact handed to the other foot within the same action returns from its last
        // contact point relative to the body over the ball release length rule (BallReleaseSpeed, BallReleaseRate) (a tackle's foot is chosen by the contact point's side
        // of the received facing every picture: under a fast turn the side changed during the contact and the old leg
        // dropped from the ball to its clip in one picture, 5141 deg/s shin).
        if(switchFrom>=0&&!pose.ballHeld){double q=(clock-switchFrom)/switchLength;if(q>=1||clock<switchFrom)switchFrom=-1;else if(clock>switchFrom){string kind=switchLimb==0?"left-foot":"foot";rig.Contact(root.TransformPoint(switchLocal),kind,1-FootballEnvelope.Smooth(q),false,switchReached,ShownBend(switchLimb,reset),Shown(switchLimb,reset));if(pose.lockFeet)GroundContactFoot(kind,null);}}
        if(footContact&&pose.contact&&full&&!pose.ballHeld){lastFullLimb=pose.kind=="left-foot"?0:1;lastFullClock=clock;}else lastFullLimb=-1;
        Probe?.Invoke(4);
        for(int f=0;f<2;f++){finalLeg[f]=rig.Leg(f);finalBend[f]=root.InverseTransformDirection(rig.KneeBend(f));finalAnkle[f]=rig.Ankle(f).position;finalClear[f]=Mathf.Min(ground.AnkleClearance(f),ground.ToeClearance(f));}finalClock=clock;finalPlant=rig.Planted?(rig.PlantRight?1:0):-1;
        if(pose.ready){readyIndex=index;readyPoseClock=clock;}
        lastClock=clock;
    }
    // r15: the ready reach of a countdown that ended without its contact returns from the boot's
    // last shown point relative to the body, like the release of a ball contact (ContactRelease,
    // the swinging boot kept SwingClear up): dropped in one picture, the boot left the ball
    // surface for the sampled swing at once. The contact time, ball and root are untouched.
    void ReadyAbort(){
        releaseFrom=releaseClock=lastClock;releaseKind=readyLimb==0?"left-foot":"foot";releaseLocal=readyLocal;releaseTarget=root.TransformPoint(readyLocal);
        releaseShown=finalAnkle[readyLimb];releaseReached=true;releaseBall=ground.Calibrated;contactReleaseLength=ContactRelease;contactDrop=0;readyClock=-1;
    }
    // r15: last shown ankles, the plant of the last picture and the aborted ready countdown (ReadyAbort, Pose.ready).
    // r16: a foot contact (and its release) solves its knee in the bend plane shown in the last
    // picture, relative to the body. The boot's point fixes the hip-ankle line; the knee's swivel
    // about it is free, and the sampled thigh as pole swung it to the clip's plane in one picture
    // (a receive after an aborted passReady: 1822 deg/s thigh, R11 1377). Contact point, time and
    // reach are unchanged.
    readonly Vector3[] finalBend=new Vector3[2];
    // B05 (r132): a shown leg too straight for a bend (below 1 mm) keeps the rig's default knee direction (FootballRig.KneeAhead)
    // instead of no pole: with none, the contact solve of a stretched tackle leg chose a knee plane 124 deg away and spun the
    // shin at 9180 deg/s (native 160114 field-11, 68.867).
    Vector3? ShownBend(int f,bool reset){if(reset||finalClock<0||lastClock!=finalClock)return null;if(finalBend[f].sqrMagnitude<1e-6f)return rig.KneeAhead();return root.TransformDirection(finalBend[f]);}
    // r18: the leg shown in the last picture (root-relative) for the least-rotation knee swivel (FootballRig.Contact).
    readonly FootballRig.ShownLeg[] finalLeg=new FootballRig.ShownLeg[2];
    FootballRig.ShownLeg Shown(int f,bool reset){if(reset||finalClock<0||lastClock!=finalClock)return default;return finalLeg[f];}
    // r18: the limb a full foot contact handed over within one action (its release below Sample's own) and the last full contact limb.
    double switchFrom=-1,lastFullClock=-1,switchLength=ContactRelease;int switchLimb=-1,lastFullLimb=-1;Vector3 switchLocal;bool switchReached;
    readonly Vector3[] finalAnkle=new Vector3[2];readonly float[] finalClear=new float[2];readonly bool[] handoff=new bool[2];double finalClock=-1,readyClock=-1,readyPoseClock=-1;int finalPlant=-1,readyLimb=-1,readyIndex=-1,heldReady=-1;Vector3 readyLocal;
    // The contact limb of a native foot contact and of its release never cuts
    // into the turf: the solved boot (its authored pitch kept) rises by its sole
    // deficit. target: the contact, whose remaining distance is reported.
    void GroundContactFoot(string kind,Vector3? target){
        if(kind!="foot"&&kind!="left-foot"||!ground.Calibrated)return;int f=kind=="left-foot"?0:1;
        float d=ground.SoleDeficit(f);if(d>.002f)rig.PlaceFoot(f,rig.Ankle(f).position+root.up*d);
        if(target.HasValue)rig.contactError=Vector3.Distance(rig.Ankle(f).position,target.Value);
    }
    // Release of a ball contact. The contact holds the boot at the ball while
    // the sampled kick swings through (the inside pass at 120 Hz: its ankle
    // 0.66 m past the ball, 1.0 m from the boot at the near side of the ball);
    // the rotation blend back over a fixed ContactRelease swept the boot
    // through the turf (4 cm, at 22 m/s) and, held on the turf, whipped the
    // knee at 1759 deg/s. The release lasts as long as the actual correction
    // needs at BallReleaseSpeed (ContactRelease..MaxBallRelease), and the
    // swinging boot keeps SwingClear above the turf in its current knee plane,
    // by the free foot's own rule (Swing: from SwingSlow, fully from SwingFast;
    // a boot set down while it still travelled 4-7 m/s skated as the support).
    // The release also lasts as long as the contact solve turned the thigh or shin
    // (FootballRig.LegTurn) needs at BallReleaseRate: the boot held at the ball
    // while the shot clip swung through returned to the follow-through within the
    // 0.1 s minimum (1679 deg/s shin, 20 m/s boot).
    public const float BallReleaseRate=600;Vector3 releaseLocal;bool releaseReached;
    // Ease-in of the ready reach from its first picture: (1-ReadyReachFrom) of the 0.30 s visible countdown.
    public const double ReadyReachEase=.08;double readyFrom=-1,leadFrom=-1;
    public const float BallReleaseSpeed=6;public const double MaxBallRelease=.2;bool releaseBall;double contactReleaseLength=ContactRelease,releaseClock=-1;Vector3 releaseShown;
    public const float SideStepSettled=.98f;
    void Inertia(double clock,bool reset,bool detect=true){
        if(hips==null||poseBones.Length==0)return;
        double dt=inertiaClock>=0&&clock>inertiaClock?clock-inertiaClock:0,before=inertiaDt;inertiaClock=clock;inertiaDt=dt;bool jump=false;
        if(dt>0){RawStep=RawJump=0;}
        if(reset){inertiaAt=-1;rawKnown=0;InertiaEvents=0;}
        else if(detect&&dt>0&&rawKnown>=2&&before>0){
            // Continuation of each joint's raw motion over the previous picture, scaled to this picture's time.
            float limit=InertiaDetect*(float)dt;
            foreach(int k in detectBones){var step=rawLocal[k]*Quaternion.Inverse(rawBefore[k]);var expected=Quaternion.SlerpUnclamped(Quaternion.identity,step,(float)(dt/before))*rawLocal[k];float off=Quaternion.Angle(expected,poseBones[k].localRotation);RawJump=Mathf.Max(RawJump,off/(float)dt);RawStep=Mathf.Max(RawStep,Quaternion.Angle(rawLocal[k],poseBones[k].localRotation)/(float)dt);if(off>limit)jump=true;}
            if(jump){for(int k=0;k<poseBones.Length;k++)inertiaOffset[k]=shownLocal[k]*Quaternion.Inverse(poseBones[k].localRotation);inertiaHips=shownHips-hips.localPosition;inertiaAt=clock-dt;InertiaEvents++;}
        }
        if(dt>0||reset||rawKnown==0){
            // Raw history (before any offset). After a jump the new pose starts without velocity.
            for(int k=0;k<poseBones.Length;k++){rawBefore[k]=jump?poseBones[k].localRotation:rawLocal[k];rawLocal[k]=poseBones[k].localRotation;}
            rawKnown=reset?1:Math.Min(rawKnown+1,2);
        }
        if(inertiaAt>=0){
            float q=(float)((clock-inertiaAt)/InertiaTime);
            if(q>=1)inertiaAt=-1;
            else{float f=1-q*q*(3-2*q);for(int k=0;k<poseBones.Length;k++)poseBones[k].localRotation=Quaternion.Slerp(Quaternion.identity,inertiaOffset[k],f)*poseBones[k].localRotation;hips.localPosition+=inertiaHips*f;}
        }
        for(int k=0;k<poseBones.Length;k++)shownLocal[k]=poseBones[k].localRotation;shownHips=hips.localPosition;
    }
    // A descending foot plants only once the sampled sole has nearly stopped in
    // the world (not while it still swings forward close to the turf).
    Vector3 lockRoot;Quaternion lockTurn=Quaternion.identity;readonly Vector3[] lastPoint=new Vector3[2],applied=new Vector3[2];readonly Quaternion[] sampledBefore={Quaternion.identity,Quaternion.identity},appliedTurn={Quaternion.identity,Quaternion.identity},releaseTurn={Quaternion.identity,Quaternion.identity};double lastLockClock=-1;
    readonly bool[] startStance=new bool[2];
    void ClearLocks(){handoff[0]=handoff[1]=false;turfTurnAt[0]=turfTurnAt[1]=-1;lastLockClock=-1;reachDrop=0;swingClock=-1;lastClear[0]=lastClear[1]=1;for(int f=0;f<2;f++){startStance[f]=landing[f]=caught[f]=turf[f]=false;entryClear[f]=1;catchDrop[f]=0;locked[f]=arc[f]=lockedToe[f]=toeOff[f]=false;correction[f]=Vector3.zero;lockedAt[f]=releasedAt[f]=-1;releaseLength[f]=LockRelease;}FootLockOffset=0;}
    // A released foot returns to its sampled pose within LockRelease, longer for a
    // large heel-off turn or offset (at most ReleaseTurnRate deg/s and
    // ReleaseSpeed m/s on average): a 0.08 s return of a 60 degree heel-off turn
    // spun the foot at 2600 deg/s in fast native runs.
    public const float ReleaseTurnRate=500,ReleaseSpeed=3,HeelOffRate=800,PivotRate=1080;
    public const float ReachDropLimit=.06f,ReachDropRate=.8f;float reachDrop;
    // Pelvis drop of the reach correction in the last sample (metres, diagnostics).
    public float ReachDropShown=>reachDrop;
    readonly double[] releaseLength={LockRelease,LockRelease};
    double ReleaseLength(int f){return Math.Clamp(Math.Max(Math.Max(LockRelease,Quaternion.Angle(Quaternion.identity,releaseTurn[f])/ReleaseTurnRate),Flat(releaseStart[f]).magnitude/ReleaseSpeed),LockRelease,.2);}
    // A sole that the sampled pose sets on the pitch keeps its world point
    // until the pose lifts it (or the body has moved LockDrift away); the
    // release blends back to the sampled foot within LockRelease. Only bones
    // move: the received root, facing and contact points are untouched.
    // The planted contact point (heel/ankle or, once the heel rises, the toe)
    // keeps its pitch point: the foot rolls over it instead of sliding. The
    // lock ends when the pose lifts the whole foot (blend back within
    // LockRelease), when the body has moved LockDrift away (the foot then takes
    // a short step instead of sliding) or, for a stopped body, as a settle step.
    void FootLock(Pose pose,double clock,float[] floats){
        var deep=Floats(pose,true);
        FootLockOffset=0;ReleaseShiftShown[0]=ReleaseShiftShown[1]=ReleaseTurnShown[0]=ReleaseTurnShown[1]=ReleaseRaiseShown[0]=ReleaseRaiseShown[1]=CatchDropShown[0]=CatchDropShown[1]=0;
        // A received jump of the root (restart, substitution, reload) is no step.
        var moved=root.position-lockRoot;moved.y=0;var lastRoot=lockRoot;lockRoot=root.position;if(moved.magnitude>1.5f)ClearLocks();
        // The received facing's turn since the last picture: it swings every
        // body-fixed point around the root (300 deg/s moves a foot 0.4 m out by
        // 2 m/s), which a landing foot planted on the pitch does not share.
        var yaw=root.rotation*Quaternion.Inverse(lockTurn);lockTurn=root.rotation;
        double step=lastLockClock>=0&&clock>lastLockClock?clock-lastLockClock:0;lastLockClock=clock;float rootSpeed=step>0?moved.magnitude/(float)step:0;
        // r15: the standing foot of an ended plant stays planted where the plant showed it, as an
        // ordinary lock: the lock's own lift, drift, settle and reach rules release it with their
        // blend or step. The lock otherwise caught it at the sampled clip foot in the picture the
        // plant ended (0.4 m/s or the plant age): 0.4-0.5 m within one picture, 25-36 m/s.
        if(!pose.plant&&finalPlant>=0&&finalClock>=0&&clock-finalClock<.1&&pose.lockFeet&&!pose.ballHeld&&pose.slide<=0&&pose.airLift<=0&&pose.keeperDive==0){
            int f=finalPlant;locked[f]=true;anchor[f]=finalAnkle[f];lockedToe[f]=false;correction[f]=applied[f]=Vector3.zero;appliedTurn[f]=Quaternion.identity;lockedAt[f]=clock;releasedAt[f]=-1;arc[f]=toeOff[f]=caught[f]=turf[f]=startStance[f]=false;catchDrop[f]=0;handoff[f]=true;}
        if(!pose.lockFeet||pose.ballHeld||pose.slide>0||pose.airLift>0||pose.keeperDive!=0){ClearLocks();return;}
        // r15: a plant hands only its standing foot to the rig (FootballRig.Plant); the other (kicking) foot keeps
        // these rules: it stays on its pitch point while its sampled sole is down and leaves on its lift, drift or
        // reach release. Both locks were cleared at once: the kicking foot jumped to its clip pose (13 m/s) and,
        // held on the turf, was dragged back with the wind-up while the standing foot stepped (5-8 m/s).
        int stand=pose.plant?(pose.kind=="left-foot"?1:0):-1;bool kickSwing=stand>=0&&(pose.ready||pose.contact);int leadFoot=pose.lead&&pose.contact?(pose.kind=="left-foot"?0:1):-1;
        if(stand>=0){locked[stand]=arc[stand]=lockedToe[stand]=toeOff[stand]=startStance[stand]=landing[stand]=caught[stand]=turf[stand]=handoff[stand]=false;correction[stand]=applied[stand]=Vector3.zero;appliedTurn[stand]=Quaternion.identity;lockedAt[stand]=releasedAt[stand]=-1;releaseLength[stand]=LockRelease;entryClear[stand]=1;catchDrop[stand]=0;}
        // A received facing that turns faster than any planted pivot (PivotRate;
        // a native facing flip turns 180 degrees within one 20 Hz picture)
        // reorients the body: planted and releasing feet turn with it about the
        // root. Held in the world, two release blends twisted the legs at 1846
        // deg/s relative to the root during a 3591 deg/s flip.
        if(step>0&&Quaternion.Angle(Quaternion.identity,yaw)/(float)step>PivotRate){
            var inverse=Quaternion.Inverse(yaw);var at=root.position;
            for(int f=0;f<2;f++){anchor[f]=at+yaw*(anchor[f]-at);releaseStart[f]=yaw*releaseStart[f];applied[f]=yaw*applied[f];releaseTurn[f]=yaw*releaseTurn[f]*inverse;appliedTurn[f]=yaw*appliedTurn[f]*inverse;sampledBefore[f]=yaw*sampledBefore[f];}
        }
        var offsets=new float[2];for(int f=0;f<2;f++)offsets[f]=locked[f]?Flat(correction[f]).magnitude:0;
        // Reach drop: a heel-planted sole just beyond the leg's reach (the sampled
        // leg straight: walking mid-stance, a stretched side step, the wider
        // standing stance at a start) lowers the pelvis, the knees bend and both
        // soles stay, instead of the anchor being dragged along (measured: locked
        // side-step and walk-start soles moving 0.6-7.9 m/s). At most
        // ReachDropLimit; it follows at ReachDropRate either way, so no release
        // pops the pelvis. Toe-planted soles reach on with a heel-off.
        float need=0;
        for(int f=0;f<2;f++){if(!locked[f]||lockedToe[f])continue;var ankle=rig.Ankle(f).position;need=Mathf.Max(need,rig.ReachDrop(f,ankle+Flat(anchor[f]-ankle),rig.HipDistance(f,ankle)+.001f));}
        reachDrop=Mathf.MoveTowards(reachDrop,Mathf.Min(need,ReachDropLimit),ReachDropRate*(float)step);rig.Lower(reachDrop);
        bool running=rootSpeed>=ToeOffSpeed&&pose.sideWeight<.5f;
        // Sampled clearance of both soles before either is constrained this
        // picture, and whether a free sole is on its way down to the turf.
        for(int f=0;f<2;f++){if(f==stand)continue;float c=Mathf.Min(ground.AnkleClearance(f),ground.ToeClearance(f));landing[f]=step>0&&!locked[f]&&(c<entryClear[f]-.001f||c<LockOn+floats[f]);entryClear[f]=c;}
        // Catch step (field players; a keeper's ready stance keeps its own steps):
        // a braking walking body whose only planted sole has drifted beyond
        // CatchFrom lowers its descending free foot onto the turf (at most
        // CatchRate m/s, rising with the drift up to LockDrift), where it plants
        // and takes the weight, so the drifting foot steps off a planted sole
        // (a reverse stop's landing foot hovered 5-9 cm above the turf for 0.1 s
        // while its partner, out of reach, slid 3-6 m/s).
        for(int f=0;f<2;f++){if(f==stand)continue;int o=1-f;bool free=!locked[f]&&(releasedAt[f]<0||clock-releasedAt[f]>=(arc[f]?SettleStep:releaseLength[f]));
            float target=pose.support>0&&pose.braking&&!pose.keeperStance&&rootSpeed>.2f&&pose.sideWeight<=0&&free&&locked[o]&&!startStance[o]&&landing[f]?Mathf.Clamp01((offsets[o]-CatchFrom)/(LockDrift-CatchFrom))*Mathf.Max(0,entryClear[f]):0;
            catchDrop[f]=free?Mathf.MoveTowards(catchDrop[f],target,CatchRate*(float)step):0;
            float d=Mathf.Min(catchDrop[f],Mathf.Max(0,entryClear[f]));CatchDropShown[f]=d;if(d>.0005f)rig.PlaceFoot(f,rig.Ankle(f).position-root.up*d);}
        for(int f=0;f<2;f++){
            if(f==stand)continue;
            float ankle=ground.AnkleClearance(f),toe=ground.ToeClearance(f),clearance=Mathf.Min(ankle,toe);int other=1-f;
            bool onToe=toe<ankle-.005f;var toePoint=rig.Toe(f).position;var anklePoint=rig.Ankle(f).position;var point=onToe?toePoint:anklePoint;
            sampledToePoint[f]=toePoint;sampledAnklePoint[f]=anklePoint;sampledAnkleTurn[f]=rig.Ankle(f).rotation;
            bool otherReleasing=releasedAt[other]>=0&&clock-releasedAt[other]<(arc[other]?SettleStep:releaseLength[other]);
            // A release starts where the foot was shown last picture: the offset
            // shown then plus this picture's change of the lock correction (the
            // sampled foot's own motion). Started from the old offset alone, a
            // foot whose sampled pose moved 0.115 m in the release picture (a side
            // step crossfading into a run) jumped along the turf.
            var shownCorrection=correction[f];
            // r15: the lock that takes an ended plant's standing foot holds the shown foot at its own contact point
            // (heel or, for a sampled foot on its toe, the toe: anchored at the ankle, the toe lock moved the foot by
            // its length, 0.15 m) and starts from the whole shown offset (height included), so a release in this
            // picture blends from where the plant showed the foot.
            if(handoff[f]){handoff[f]=false;if(locked[f]){lockedToe[f]=onToe;anchor[f]=finalAnkle[f]+(onToe?Flat(toePoint-anklePoint):Vector3.zero);correction[f]=shownCorrection=Flat(anchor[f]-point);applied[f]=finalAnkle[f]-anklePoint;}}
            // A stride starting from rest: the first swing foot leaves its standing
            // lock on a step arc into the stride's swing (the crossfade from the
            // stance otherwise blended it forward along the turf, where the lock
            // caught and dragged it); the support foot stays planted. It leaves
            // only from a planted support foot (a keeper's settle step still in
            // the air: both soles left the turf and the settling one was pressed
            // back onto it and slid).
            if(pose.startStep&&f!=(pose.startRight?1:0)&&locked[f])startStance[f]=true;
            if(!locked[f])startStance[f]=caught[f]=turf[f]=false;
            if(pose.startStep&&f==(pose.startRight?1:0)&&locked[f]&&locked[other]){locked[f]=false;releaseWhy[f]='b';releasedAt[f]=clock;releaseAnkle[f]=anklePoint.y;releaseStart[f]=applied[f]+Flat(anchor[f]-point)-shownCorrection;releaseTurn[f]=appliedTurn[f];arc[f]=true;toeOff[f]=false;releaseLength[f]=ReleaseLength(f);}
            if(locked[f]){
                // Heel to toe: re-anchor the new contact point where it is shown now.
                // Carry over the shift that keeps the old contact point anchored in this frame.
                // A toe-planted foot sets its heel down only where the leg reaches it
                // (otherwise it stays on its toe with a heel-off): the switch to an
                // unreachable heel point dragged the anchor up to 0.13 m within one
                // picture at side-step and backward starts.
                if(onToe!=lockedToe[f]){var held=Flat(anchor[f]-(lockedToe[f]?toePoint:anklePoint));if(onToe||rig.CanPlaceFoot(f,anklePoint+held,rig.HipDistance(f,anklePoint)+.001f)){anchor[f]=point+held;lockedToe[f]=onToe;}else point=toePoint;}
                correction[f]=Flat(anchor[f]-point);offsets[f]=correction[f].magnitude;
                // Drift: the body has moved LockDrift away from its planted foot. The
                // support foot of a start from rest (startStance) keeps its standing
                // point until its own step lifts it (reach still turns it onto its toe
                // and releases it), at most WidthDrift (below the unblended 2*LockDrift
                // release): from the wider standing stance its sampled point moves up to
                // 0.24 m sideways while a stride's narrower track crossfades in, and a
                // keeper's 1 m ready stance narrows by 0.16 m into the side step while
                // the body travels 0.25 m before the closing step; released at
                // LockDrift, it slid over the turf at 1-2.5 m/s while the first step
                // was still in the air.
                bool alone=pose.support>0&&!locked[other];
                // A braking stride (no authored stop) keeps its only planted foot until
                // the other foot is down: the steady stride's swing lifted it while the
                // other foot was still in the air, and the walking support pressed the
                // lifted foot back onto the turf (a backward stop slid it 2.3-2.8 m/s).
                // Drift and reach still release it.
                // A walking body's only planted foot waits for the other foot that is
                // already coming down (at most CatchDrift beyond LockDrift; reach and
                // heel-off still release it): released first, the step arc lifted it
                // while the other sole was still in the air (two slow pictures without
                // a sole down at backward sprint stops), or the walking support pressed
                // the released foot back onto the turf and it slid there at 3-4 m/s
                // (reverse stop) until the landing foot planted 0.1 s later. Not in a
                // procedural side step (its own lead and closing steps; held there, a
                // keeper's foot left with a larger offset at the clip's lift).
                // A caught foot (catch step) carries until its partner has stepped and
                // planted again: lift-released at once, it rose 5 cm within one picture
                // (1874 deg/s). The only planted sole of a braking walking body (or a
                // caught one) stays within PinClear of the turf where the leg reaches
                // (standDown below; the other foot not planted or lifting off in this
                // picture): held against its clip's lift it rose with the clip while
                // the other foot was still up (backward sprint stops).
                // r16: also while the other foot is still on its way up: released then, the walking support
                // pressed the only support foot back onto the turf and it slid there 1.7-2.0 m/s for 0.07 s
                // (slowing after a pass) until the other foot landed.
                bool wait=pose.support>0&&pose.sideWeight<=0&&!locked[other]&&offsets[f]<LockDrift+CatchDrift;
                bool hold=turf[f]&&pose.support>0&&!locked[other]&&clock-turfAt[f]<TurfHold&&offsets[f]<LockDrift+CatchDrift;
                bool lift=clearance>LockOff+floats[f]&&!(pose.braking&&!locked[other])&&!(caught[f]&&!(locked[other]&&lockedAt[other]>caughtAt[f]))&&!hold,drift=!startStance[f]&&offsets[f]>LockDrift&&!wait&&!hold;
                // A stopped body closes its stance one foot at a time.
                bool settle=!lift&&!alone&&pose.settle&&offsets[f]>SettleOffset&&clock-lockedAt[f]>.1&&!otherReleasing&&(offsets[f]>=offsets[other]||!locked[other]);
                // The release starts from what was actually shown last frame
                // (position incl. a heel-off lift, and foot turn), never a jump,
                // also for an offset beyond 2*LockDrift (released without a blend
                // there, the foot jumped back 0.5 m within one picture: 1700-2600
                // deg/s in native runs); ReleaseLength grows with the offset.
                // r15: under a plant the kicking foot leaves its lock when the ready reach or its contact takes it.
                // r20: a lead (Pose.lead) takes its foot only from a body that stands on the other one (locked): the only support
                // stays planted (dragged by the reach, the walking stance foot slid 1.8 m/s on the turf).
                bool kick=(stand>=0||f==leadFoot&&locked[other])&&pose.contact&&(pose.kind=="left-foot"?0:1)==f;
                // r16: no new lock either while the countdown or the contact still moves it (kickSwing below);
                // after its contact the kicking foot plants again where it comes down (held off the turf
                // lock, the follow-through boot skated 3-4 m/s on the turf beside the standing foot).
                if(lift||drift||settle||kick){locked[f]=false;releaseWhy[f]=kick?'k':lift?'l':drift?'d':'s';releasedAt[f]=clock;releaseAnkle[f]=anklePoint.y;releaseStart[f]=applied[f]+correction[f]-shownCorrection;releaseTurn[f]=appliedTurn[f];toeOff[f]=(!lift||lockedToe[f])&&!settle&&running;arc[f]=!lift&&!toeOff[f];releaseLength[f]=ReleaseLength(f);}
            }else if(!kickSwing&&f!=leadFoot&&(TouchesDown(pose,f,clock,step,clearance,anklePoint,floats,yaw,lastRoot,moved)||releaseWhy[f]=='l'&&clearance<LockOn+floats[f]&&shownClear[f]<LockOn+floats[f]&&releasedAt[f]>=0&&clock-releasedAt[f]<(arc[f]?SettleStep:releaseLength[f])&&Flat(ReleaseShift(f,clock)).magnitude<LockDrift)){
                // A lift cut short: the pose sets a lifted foot down again while its
                // release still blends and it already stands on the turf (shown
                // within the contact band last picture). It plants where it is shown
                // instead of sliding on with the blend (a backward stop's toe-off
                // foot slid 2.3-2.8 m/s when the next clip set it down early). A
                // drift, reach or heel-off release still leaves: re-planted there,
                // the foot drifted off again in the next picture and jumped.
                var held=Flat(ReleaseShift(f,clock));locked[f]=true;anchor[f]=point+held;lockedToe[f]=onToe;correction[f]=held;lockedAt[f]=clock;releasedAt[f]=-1;arc[f]=toeOff[f]=false;
            }else if(!kickSwing&&f!=leadFoot&&clearance<LockOn+floats[f]&&(releasedAt[f]<0||clock-releasedAt[f]>=(arc[f]?SettleStep:releaseLength[f]))&&(step<=0||Plants(Flat(point-lastPoint[f]-(yaw*(lastPoint[f]-lastRoot)-(lastPoint[f]-lastRoot)))/(float)step,moved/(float)step,lastClear[f]>=LockOn+floats[f],pose.support>0&&(!locked[other]||catchDrop[f]>.001f)||KickSupport(pose,f,floats)))){locked[f]=true;caught[f]=catchDrop[f]>.001f;caughtAt[f]=clock;anchor[f]=point;lockedToe[f]=onToe;correction[f]=Vector3.zero;lockedAt[f]=clock;releasedAt[f]=-1;arc[f]=toeOff[f]=false;}
            lastPoint[f]=point;lastClear[f]=clearance;
            var shownBefore=applied[f];var turnBefore=appliedTurn[f];var sampledAnkle=anklePoint;var sampledTurn=rig.Ankle(f).rotation;applied[f]=Vector3.zero;appliedTurn[f]=Quaternion.identity;var turnedBefore=sampledBefore[f];sampledBefore[f]=sampledTurn;
            Vector3 shift;float raise=0;var turn=Quaternion.identity;
            if(locked[f]){
                // A planted sole of a stance that never enters the contact band is set
                // down onto the turf (deep: back_left and back_right carry the left
                // stance foot 4.5-5.6 cm up). A float within the band stays to the
                // walking support's pelvis drop: lowering such a foot out of the
                // sampled straight leg's reach forced heel-off releases (1900 deg/s).
                float standDown=Mathf.Min(Mathf.Max(0,clearance),deep[f]);bool pinned=pose.support>0&&(pose.braking||caught[f]||turf[f]&&!locked[other]&&clock-turfAt[f]<TurfHold)&&(!locked[other]||entryClear[other]>LockOff+floats[other])&&clearance>PinClear;bool heelReach=true;if(pinned){float pin=Mathf.Max(standDown,clearance-PinClear);heelReach=rig.CanPlaceFoot(f,anklePoint+correction[f]-root.up*pin,rig.HipDistance(f,anklePoint)+.001f);if(heelReach)standDown=pin;}
                shift=correction[f]-root.up*standDown;
                if(turfTurnAt[f]>=0&&lockedAt[f]==turfTurnAt[f]){double q=(clock-turfTurnAt[f])/Math.Max(1e-4,turfTurnLength[f]);if(q>=1||clock<turfTurnAt[f])turfTurnAt[f]=-1;else turn=Quaternion.Slerp(Quaternion.identity,turfTurn[f],1-FootballEnvelope.Smooth(q));}
                // Push-off beyond the leg's reach: the toe stays on its pitch point
                // and the heel rises (ankle on the reach sphere, foot turned to the toe).
                float own=rig.HipDistance(f,anklePoint)+.001f;
                // A pinned sole whose heel cannot reach the turf pivots on its toe (heel-off).
                if(!heelReach||!rig.CanPlaceFoot(f,anklePoint+shift,own)){
                    // A heel-planted sole beyond the leg's reach rolls onto its toe where
                    // the toe is shown, and the heel rises as in a push-off: its anchor
                    // was dragged toward the body before (1.2-3.2 m/s along the turf in
                    // a side-step start).
                    if(!lockedToe[f]){anchor[f]=toePoint+shift;lockedToe[f]=true;}
                    // A pinned sole beyond reach keeps its toe on the turf too (HeelOff checks the reach).
                    if(rig.HeelOff(f,new Vector3(anchor[f].x,toePoint.y-(pinned?Mathf.Max(standDown,ground.ToeClearance(f)-PinClear):standDown),anchor[f].z),anklePoint+shift,own)){
                        var turnNow=rig.Ankle(f).rotation*Quaternion.Inverse(sampledTurn);
                        // A heel-off that would spin the shown foot faster than HeelOffRate
                        // and than the clip's own foot (a fast stride past its planted toe:
                        // the held pitch added to the clip's toe-off, 1700 deg/s at 7 m/s)
                        // lets the toe go from what was shown.
                        if(step>0&&Quaternion.Angle(turnNow*sampledTurn,turnBefore*turnedBefore)>Mathf.Max(HeelOffRate*(float)step,Quaternion.Angle(sampledTurn,turnedBefore))){locked[f]=false;releaseWhy[f]='h';releasedAt[f]=clock;releaseAnkle[f]=anklePoint.y;releaseStart[f]=shownBefore+correction[f]-shownCorrection;releaseTurn[f]=turnBefore;arc[f]=false;toeOff[f]=running;releaseLength[f]=ReleaseLength(f);rig.PlaceFoot(f,anklePoint+releaseStart[f]);rig.Ankle(f).rotation=turnBefore*sampledTurn;FootLockOffset=Mathf.Max(FootLockOffset,Flat(releaseStart[f]).magnitude);continue;}
                        FootLockOffset=Mathf.Max(FootLockOffset,shift.magnitude);applied[f]=rig.Ankle(f).position-sampledAnkle;appliedTurn[f]=turnNow;continue;}
                    // Out of reach even with a raised heel: the foot leaves its pitch
                    // point on a step (a toe-off when running) and blends back from
                    // what was shown last frame (a dragged anchor alternating with a
                    // heel-off turned the foot by up to 25 degrees in one picture).
                    {locked[f]=false;releaseWhy[f]='r';releasedAt[f]=clock;releaseAnkle[f]=anklePoint.y;releaseStart[f]=shownBefore+correction[f]-shownCorrection;releaseTurn[f]=turnBefore;arc[f]=!running;toeOff[f]=running;releaseLength[f]=ReleaseLength(f);shift=releaseStart[f];turn=releaseTurn[f];if(shift.sqrMagnitude>1e-8f)rig.PlaceFoot(f,rig.Ankle(f).position+shift);rig.Ankle(f).rotation=turn*rig.Ankle(f).rotation;FootLockOffset=Mathf.Max(FootLockOffset,Flat(shift).magnitude);continue;}
                }
            }
            else if(releasedAt[f]>=0&&clock-releasedAt[f]<(arc[f]?SettleStep:releaseLength[f])){shift=ReleaseOffset(f,clock,anklePoint.y,step,out raise,out float s);turn=Quaternion.Slerp(Quaternion.identity,releaseTurn[f],1-s);ReleaseShiftShown[f]=Flat(shift).magnitude;ReleaseTurnShown[f]=Quaternion.Angle(Quaternion.identity,turn);ReleaseRaiseShown[f]=raise+shift.y;}
            else continue;
            FootLockOffset=Mathf.Max(FootLockOffset,Flat(shift).magnitude);
            // A lift is measured from the pitch: a sole the motion layers carry below
            // the turf (a lowered driving or braking pelvis) rises from the turf, so
            // the later sole correction cannot swallow the lift.
            if(raise>0)raise+=ground.SoleDeficit(f);
            // A toe-planted foot carrying a turn turns about its toe (its pitch point), not its ankle.
            if(shift.sqrMagnitude>1e-8f||raise>0||turn!=Quaternion.identity){rig.PlaceFoot(f,rig.Ankle(f).position+shift+root.up*raise);if(turn!=Quaternion.identity){var pivot=rig.Toe(f).position;rig.Ankle(f).rotation=turn*rig.Ankle(f).rotation;var back=pivot-rig.Toe(f).position;if(locked[f]&&lockedToe[f]&&back.sqrMagnitude>1e-10f)rig.PlaceFoot(f,rig.Ankle(f).position+back);}}
            if(!locked[f])turfTurnAt[f]=-1;
            if(locked[f]){applied[f]=rig.Ankle(f).position-sampledAnkle;appliedTurn[f]=rig.Ankle(f).rotation*Quaternion.Inverse(sampledTurn);}
        }
    }
    // Turf plant: a free sole that the shown pose sets on the turf (within
    // LockOn) as the lower, weight-bearing foot while the other foot is not
    // planted (or clearly below a planted one, TurfBelow) carries the body: it plants where it is shown instead of
    // travelling on with its release blend. R9: a reverse stop's released
    // stance foot, pressed onto the turf by the walking support while both feet
    // were in drift releases (the facing flip took both anchors beyond
    // LockDrift), skated 1.5-3.9 m/s for six pictures; a receive recovery 4.6
    // m/s; a braking toe-off foot set down 2.7 m/s. A walking body (support)
    // holds the plant against the lift and drift releases, pinned within
    // PinClear, until the other foot plants (at most TurfHold); reach and
    // heel-off still release it, and so does a drift beyond LockDrift+CatchDrift
    // (as the wait for a landing foot). A foot still turning in its release
    // (more than TurfTurn degrees from its sampled turn) is not planted. A running body plants without the hold, so
    // its stride keeps its toe-off. limb: the contact limb of a foot contact
    // or its release, left to the contact. Called after the support and swing passes.
    // Beside a planted foot that floats (pinned or a stance float) a free sole
    // more than TurfBelow lower carries the body as well: a reverse stop's
    // landing foot slid 1.5 m/s for a picture under a clip change.
    public const float TurfBelow=.005f,TurfTurn=6;public const double TurfHold=.2;readonly bool[] turf=new bool[2];readonly double[] turfAt=new double[2],turfTurnAt={-1,-1},turfTurnLength=new double[2];readonly Quaternion[] turfTurn={Quaternion.identity,Quaternion.identity};
    readonly Vector3[] sampledToePoint=new Vector3[2],sampledAnklePoint=new Vector3[2];readonly Quaternion[] sampledAnkleTurn={Quaternion.identity,Quaternion.identity};
    void TurfPlant(double clock,int limb){
        // Not while its release still turns the foot: planted, the remaining turn went in one picture.
        // r16: a foot still turning in its release plants as well and its lock carries the shown turn out over
        // the rest of that release (FootLock): refused, the walking support pressed it onto the turf and it
        // skated on with the blend (both feet drift-released by a pass wind-up: 5-9 m/s for seven 120 Hz pictures).
        bool Lands(int f){int o=1-f;if(locked[f]||f==limb||lastLockClock!=clock)return false;float ankle=ground.AnkleClearance(f),toe=ground.ToeClearance(f),own=ground.SupportClearance(f),partner=ground.SupportClearance(o);
            if(Mathf.Min(ankle,toe)>=LockOn||(locked[o]?own>partner-TurfBelow:own>partner+.01f))return false;
            bool turning=Quaternion.Angle(rig.Ankle(f).rotation,sampledAnkleTurn[f])>TurfTurn;double rest=releasedAt[f]>=0?(arc[f]?SettleStep:releaseLength[f])-(clock-releasedAt[f]):0;return !(turning&&rest<=0);}
        for(int f=0;f<2;f++){int o=1-f;if(!Lands(f))continue;
            // r18: a foot its lock left in this very picture because the body moved off it (drift, reach, heel-off) is not
            // planted again while the other foot is setting down on the turf too: re-planted mid-blend, it drifted off again
            // in the next picture, and the landing foot (whose swing clearance had ended with its partner's lock) planted
            // one picture after its sole met the turf, still moving (2.5 m/s at 120 Hz, ready-change-pass).
            if(releasedAt[f]==clock&&(releaseWhy[f]=='d'||releaseWhy[f]=='r'||releaseWhy[f]=='h')&&Lands(o))continue;
            float ankle=ground.AnkleClearance(f),toe=ground.ToeClearance(f);
            bool turning=Quaternion.Angle(rig.Ankle(f).rotation,sampledAnkleTurn[f])>TurfTurn;double rest=releasedAt[f]>=0?(arc[f]?SettleStep:releaseLength[f])-(clock-releasedAt[f]):0;
            bool onToe=toe<ankle-.005f;var shown=onToe?rig.Toe(f).position:rig.Ankle(f).position;
            turfTurnAt[f]=turning?clock:-1;turfTurnLength[f]=rest;turfTurn[f]=rig.Ankle(f).rotation*Quaternion.Inverse(sampledAnkleTurn[f]);
            locked[f]=turf[f]=true;turfAt[f]=caughtAt[f]=lockedAt[f]=clock;anchor[f]=shown;lockedToe[f]=onToe;correction[f]=Flat(shown-(onToe?sampledToePoint[f]:sampledAnklePoint[f]));releasedAt[f]=-1;arc[f]=toeOff[f]=caught[f]=false;catchDrop[f]=0;
            applied[f]=rig.Ankle(f).position-sampledAnklePoint[f];appliedTurn[f]=rig.Ankle(f).rotation*Quaternion.Inverse(sampledAnkleTurn[f]);break;
        }
    }
    // A stride clip whose stance sole floats (back_walk: left foot 2.3 cm
    // at its lowest) plants relative to that measured float, weighted by
    // the stride share of the mix; walking only (a running flight is no
    // float). A foot whose own stance never enters the contact band (its
    // float above the clip's ground shift beyond LockOn: back_left and
    // back_right carry the left foot 4.5-5.6 cm up through the whole cycle)
    // floats at every speed (deep): a backward run never planted it.
    float[] Floats(Pose pose,bool deep=false){var floats=new float[2];for(int i=0;i<weights.Length;i++)if(cyclic[i]&&weights[i]>0)for(int f=0;f<2;f++){float raw=ground.FootFloat(sources[i],f),own=ground.StanceFloat(sources[i],f),stance=own>LockOn?own:0;floats[f]+=weights[i]*(deep?stance:Mathf.Max(raw*Mathf.Clamp01(pose.support),stance));}return floats;}
    static Vector3 Flat(Vector3 v){v.y=0;return v;}
    // Offset of foot f's release blend at clock (FootLock's release branch):
    // the shift from the sampled ankle (ankleY: its height now), the lift on
    // top of it and the blend share s that has returned to the sampled foot.
    Vector3 ReleaseOffset(int f,double clock,float ankleY,double step,out float raise,out float s){
        double length=arc[f]?SettleStep:releaseLength[f];float q=(float)((clock-releasedAt[f])/length);s=q*q*(3-2*q);raise=0;
        // A step arc lifts first, travels, then sets down: the sole leaves the
        // turf quickly and returns in the middle ArcTravel share (a sine lift
        // with a smoothstep return started both slowly, and a heel-off foot's
        // toe tip dragged back over the turf at up to 3.3 m/s).
        if(arc[f]){float m=Mathf.Clamp01((q-(1-ArcTravel)*.5f)/ArcTravel);s=m*m*(3-2*m);raise=SettleLift*(1-Mathf.Pow(2*q-1,4));}
        // A raised heel's height at the release is absorbed by the clip's own
        // lift since then (counted on top of the rising sampled ankle, a
        // heel-off foot rose 3.5 cm within one picture: 1710 deg/s of thigh).
        var shift=releaseStart[f]*(1-s);float upAtRelease=releaseStart[f].y;if(upAtRelease>0)shift.y=Mathf.Max(0,upAtRelease-Mathf.Max(0,ankleY-releaseAnkle[f]))*(1-s);
        if(!arc[f]&&toeOff[f])raise=ToeOffLift*Mathf.Min(1,(float)((clock-releasedAt[f]+step)/ToeOffRise))*(1-q*q);
        return shift;
    }
    // Touchdown of a releasing foot: its release blend has set the shown sole
    // into the contact band (the sampled sole too, since a planted foot shows
    // its sampled height), close to its sampled point (half LockDrift, so it
    // does not drift off again) and within the leg's reach, and it
    // either carries the walking body (the other sole is not planted or lifts)
    // or lands without swinging forward (Plants). It plants where it is shown
    // instead of sliding on with the blend until the release ends (a step arc
    // sets itself down; the shown sole sinks at most TouchdownRate m/s into the
    // plant: a toe-off lift dropped 7 cm within one 120 Hz picture): a toe-off
    // at a forward sprint stop slid 2.2 m/s on the turf, a 30 Hz side-step
    // landing foot 2 m/s for one picture.
    bool TouchesDown(Pose pose,int f,double clock,double step,float clearance,Vector3 anklePoint,float[] floats,Quaternion yaw,Vector3 lastRoot,Vector3 moved){
        if(step<=0||arc[f]||releasedAt[f]<0||clock-releasedAt[f]>=releaseLength[f]||shownClear[f]-Mathf.Max(0,clearance)>TouchdownRate*(float)step)return false;
        var offset=ReleaseOffset(f,clock,anklePoint.y,step,out float up,out _);
        if(clearance>=LockOn+floats[f]||clearance+offset.y+up>=LockOn+floats[f]||Flat(offset).magnitude>=LockDrift*.5f)return false;
        // Only where the leg reaches it: re-planted out of reach, the heel-off
        // released it again within the same picture from a stale offset (1700 deg/s).
        if(!rig.CanPlaceFoot(f,anklePoint+Flat(offset),rig.HipDistance(f,anklePoint)+.001f))return false;
        int other=1-f;var before=shownAnkle[f];
        var velocity=Flat(anklePoint+offset-before-(yaw*(before-lastRoot)-(before-lastRoot)))/(float)step;
        return Plants(velocity,moved/(float)step,true,pose.support>0&&(!locked[other]||entryClear[other]>LockOff+floats[other]));
    }
    readonly Vector3[] shownAnkle=new Vector3[2];
    // The support of a kick: under a pass, shot or receive clip the foot within
    // the contact band carries the body while the other foot is KickRaise up
    // (the kicking leg). An in-place kick clip over a running body kept its
    // plant foot under the pelvis, and it skated over the turf at the body's
    // 3.6-4 m/s through the kick; planted, it stays and leaves by drift.
    public const float KickRaise=.1f,TouchdownRate=3.5f;
    bool KickSupport(Pose pose,int f,float[] floats){int o=1-f;return pose.kick&&!locked[o]&&entryClear[o]>KickRaise+floats[o];}
    // Shift of foot f's release blend at clock (FootLock's release branch).
    Vector3 ReleaseShift(int f,double clock){
        double length=arc[f]?SettleStep:releaseLength[f];float q=(float)((clock-releasedAt[f])/length),s=q*q*(3-2*q);
        if(arc[f]){float m=Mathf.Clamp01((q-(1-ArcTravel)*.5f)/ArcTravel);s=m*m*(3-2*m);}
        return releaseStart[f]*(1-s);
    }
    readonly float[] shownClear={1,1},releaseAnkle=new float[2];
    // Swing clearance: while the other sole is planted, a free foot travelling
    // over the turf (above SwingSlow m/s, fully from SwingFast) keeps its lowest
    // sole point at least SwingClear up, out of the contact band by the lock's
    // own measure (LockOff): back_walk swung its toe along the turf at 4-5 m/s,
    // and at 2.5 cm a swinging foot still stood within the contact band. A planted,
    // landing or lifting foot moves slowly over the ground and is untouched; no
    // support foot is lifted (the double-float rule still holds). Above the
    // walking support (flight: a running body may have both soles up) it
    // also clears the turf while the other foot is not planted: a side step
    // crossfading into a lateral run swung a free foot along the turf at
    // 3.5-7 m/s.
    public const float SwingClear=LockOff,SwingSlow=.8f,SwingFast=1.6f;readonly Vector3[] swingLast=new Vector3[2];double swingClock=-1;
    void Swing(double clock,bool on,bool flight,int skip=-1){
        double dt=swingClock>=0&&clock>swingClock?clock-swingClock:0;swingClock=clock;
        for(int f=0;f<2;f++){var a=rig.Ankle(f).position;SwingUpShown[f]=on&&dt>0&&f!=skip&&!locked[f]&&catchDrop[f]<=0&&(locked[1-f]||flight)?-1:-2;
            if(on&&dt>0&&f!=skip&&!locked[f]&&catchDrop[f]<=0&&(locked[1-f]||flight)){float v=Flat(a-swingLast[f]).magnitude/(float)dt,w=Mathf.Clamp01((v-SwingSlow)/(SwingFast-SwingSlow)),up=Mathf.Max(0,SwingClear-ground.SupportClearance(f))*w;SwingUpShown[f]=up;if(up>.0005f){rig.PlaceFoot(f,a+root.up*up);a=rig.Ankle(f).position;}}
            swingLast[f]=a;}
    }
    // Plant check of a sole entering contact (world velocity without the
    // received yaw; the root's velocity): it has nearly stopped in the world,
    // or it touches down (it was above the contact band one picture before)
    // without swinging forward relative to the body: a landing foot plants
    // where it touches. Measured: a brake clip set its landing foot down moving
    // with a 4 m/s body, a hard stop's stride landed its foot moving back over
    // the turf at 4.7 m/s; both skidded two to seven pictures before the
    // world-speed check let them plant. A swing foot skimming the turf moves
    // forward relative to the body and does not plant, unless it is the
    // walking body's only support (carry: the other foot is not planted), which
    // plants where it rests on the turf: refused, a stopping body's landing foot
    // slid on at 2.9-3.5 m/s while the other foot already lifted, and a foot
    // settling onto the turf at a stop slid 0.5-1 m/s with the idle crossfade.
    static bool Plants(Vector3 velocity,Vector3 body,bool touchdown,bool carry){
        float speed=body.magnitude;if(velocity.magnitude<.3f+.65f*speed||carry)return true;
        return touchdown&&(speed<=.2f||Vector3.Dot(velocity-body,body/speed)<=TouchdownSwing);
    }
    public const float TouchdownSwing=.5f;readonly float[] lastClear={1,1};
    public float Heading(AnimationClip clip)=>ground.Heading(clip);
    public double MidStance(AnimationClip clip,bool right)=>ground.MidStance(clip,right);
    // Clip time near preferred at which the given support foot is planted and
    // the other foot swings (measured clearance), so a turn or a brake begins
    // on the foot the stride already stands on.
    public double SupportStart(AnimationClip clip,bool right,double preferred)=>ground.SupportStart(clip,right,preferred);
}
// Measured sole height of the authored clips relative to the standing reference.
// Some generated clips carry their whole body several centimetres above the
// pitch (keeper ready stance, inside pass). A clip-constant, measured shift
// lowers only such floating poses; it never lifts a body, removes a running
// flight phase or moves the game-owned root. Measurements belong to one skinned
// mesh: the demo prefab and the club-world player differ in their soles.
public sealed class FootballGround {
    public const string ReferenceClip="idle_stand_meshy";
    // Top of the rendered pitch, just below the painted lines.
    public const float PitchSurface=0f;
    // One skinned sole vertex rebuilt by linear blend skinning from its (up to
    // four) bones: indices into the bone list of its foot, standing-pose locals.
    struct SolePoint {public int[] bone;public Vector3[] local;public float[] weight;public int vertex;public bool bind;}
    sealed class Profile {public bool calibrated,soleKnown,solePoints;public float ankle,toe,toeEnd=float.NaN,sole;public readonly List<SolePoint>[] corners={new List<SolePoint>(),new List<SolePoint>()};public readonly List<string>[] soleBones={new List<string>(),new List<string>()};public readonly Dictionary<AnimationClip,float> chestBias=new Dictionary<AnimationClip,float>();public readonly Dictionary<AnimationClip,float> offsets=new Dictionary<AnimationClip,float>();public readonly Dictionary<AnimationClip,FootballStride.Gait> gaits=new Dictionary<AnimationClip,FootballStride.Gait>();public readonly Dictionary<AnimationClip,float[][]> clearances=new Dictionary<AnimationClip,float[][]>();}
    static readonly Dictionary<Mesh,Profile> profiles=new Dictionary<Mesh,Profile>();static readonly Profile unnamed=new Profile();
    readonly Profile profile;readonly Transform root;readonly Transform[] ankles,toes,toeEnds;
    public FootballGround(Transform root){
        this.root=root;Transform Find(string name){return Array.Find(root.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:"+name);}
        ankles=new[]{Find("LeftFoot"),Find("RightFoot")};toes=new[]{Find("LeftToeBase"),Find("RightToeBase")};toeEnds=new[]{Find("LeftToe_End"),Find("RightToe_End")};
        var mesh=MeasuredSkin(root)?.sharedMesh;
        if(mesh==null)profile=unnamed;else if(!profiles.TryGetValue(mesh,out profile)){profile=new Profile();profiles.Add(mesh,profile);}
    }
    public bool Calibrated=>profile.calibrated;public bool SoleKnown=>profile.soleKnown;
    public float ankle=>profile.ankle;public float toe=>profile.toe;
    // Standing toe-tip height (actor units); NaN when the rig has no tip bone.
    public float toeEnd=>profile.toeEnd;
    // Lowest skinned vertex of the standing reference relative to the actor root.
    public float Sole=>profile.sole;
    // Actor root height that puts the standing reference sole on the pitch.
    // Without a measurement the previous fixed height remains in use.
    public float RootHeight=>profile.soleKnown?Mathf.Clamp(PitchSurface-profile.sole,0,.12f):.08f;
    bool Valid=>ankles[0]!=null&&ankles[1]!=null&&toes[0]!=null&&toes[1]!=null;
    float Height(Transform t){return (t.position.y-root.position.y)/Mathf.Max(.0001f,root.lossyScale.y);}
    // Called with the standing reference clip evaluated on this rig.
    public void Calibrate(){if(!Valid)return;if(toeEnds[0]!=null&&toeEnds[1]!=null)profile.toeEnd=Mathf.Min(Height(toeEnds[0]),Height(toeEnds[1]));profile.ankle=Mathf.Min(Height(ankles[0]),Height(ankles[1]));profile.toe=Mathf.Min(Height(toes[0]),Height(toes[1]));profile.calibrated=true;}
    public void SetSole(float value){if(value<0&&value>-.3f){profile.sole=value;profile.soleKnown=true;MeasureSolePoints();}}
    // Sole contour of each boot: skinned vertices of the lower boot (within
    // 5 cm of the standing sole: sole, heel cup, toe cap), the lowest per
    // 1 cm ground cell and the outermost per 1 cm height band, fixed on the
    // foot they belong to and rebuilt per frame by linear blend skinning of
    // their bones. Measured once per
    // mesh on the standing reference. Bone heights alone miss a heel cup or
    // toe cap that a tilted or rolled foot turns below the ankle; without
    // skinned feet the points under the ankle and toe joints remain.
    void MeasureSolePoints(){
        if(!Valid||profile.solePoints)return;
        var known=FootballSoleContour.Find(MeasuredSkin(root)?.sharedMesh?.name);
        if(known!=null&&known.Length==2){
            // Exact bind-pose data of the known boots (works without a readable mesh).
            for(int f=0;f<2;f++){var list=profile.corners[f];var names=profile.soleBones[f];list.Clear();names.Clear();names.AddRange(known[f].bones);var d=known[f].points;
                for(int i=0;i<d.Length;){int n=(int)d[i++];var q=new SolePoint{bone=new int[n],local=new Vector3[n],weight=new float[n],bind=true};for(int k=0;k<n;k++){q.bone[k]=(int)d[i];q.weight[k]=d[i+1];q.local[k]=new Vector3(d[i+2],d[i+3],d[i+4]);i+=5;}list.Add(q);}}
            profile.solePoints=true;return;
        }
        // Other meshes: the standing pose (editor-readable meshes only).
        if(!Application.isEditor&&!(MeasuredSkin(root)?.sharedMesh?.isReadable??false)){profile.solePoints=true;return;}
        float pitch=root.position.y+profile.sole;var up=Vector3.up;
        var found=new[]{new List<(Vector3 p,BoneWeight w,Transform[] bones,int vertex)>(),new List<(Vector3 p,BoneWeight w,Transform[] bones,int vertex)>()};var mesh=new Mesh();standing.Clear();
        foreach(var r in Skins(root,false).ToArray()){
            if(r.sharedMesh==null)continue;foreach(var bone in r.bones)if(bone!=null)_=bone.position;r.BakeMesh(mesh,false);
            var v=mesh.vertices;var w=r.sharedMesh.boneWeights;var bones=r.bones;var origin=r.transform.position;var turn=r.transform.rotation;
            for(int i=0;i<v.Length&&i<w.Length;i++){
                var owner=w[i].boneIndex0<bones.Length?bones[w[i].boneIndex0]:null;int f=-1;
                for(int k=0;k<2;k++)if(owner!=null&&(owner==ankles[k]||owner==toes[k]||owner==toeEnds[k]))f=k;
                if(f<0)continue;var p=origin+turn*v[i];standing[i]=p.y-pitch;if(p.y-pitch>.05f)continue;
                found[f].Add((p,w[i],bones,i));
            }
        }
        UnityEngine.Object.DestroyImmediate(mesh);
        for(int f=0;f<2;f++){
            var list=profile.corners[f];var names=profile.soleBones[f];list.Clear();names.Clear();var a=ankles[f].position;var t=toes[f].position;var ahead=Vector3.ProjectOnPlane(t-a,up);if(ahead.sqrMagnitude<1e-8f)ahead=root.forward;ahead.Normalize();
            int Index(Transform bone){if(bone==null)return -1;int k=names.IndexOf(bone.name);if(k<0){names.Add(bone.name);k=names.Count-1;}return k;}
            SolePoint Point(Vector3 p,BoneWeight w,Transform[] all){
                var pick=new List<(Transform b,float w)>();void Add(int index,float weight){if(weight>0&&index<all.Length&&all[index]!=null)pick.Add((all[index],weight));}
                Add(w.boneIndex0,w.weight0);Add(w.boneIndex1,w.weight1);Add(w.boneIndex2,w.weight2);Add(w.boneIndex3,w.weight3);float sum=0;foreach(var x in pick)sum+=x.w;
                var q=new SolePoint{bone=new int[pick.Count],local=new Vector3[pick.Count],weight=new float[pick.Count]};
                for(int k=0;k<pick.Count;k++){q.bone[k]=Index(pick[k].b);q.local[k]=pick[k].b.InverseTransformPoint(p);q.weight[k]=pick[k].w/sum;}return q;
            }
            SolePoint Fixed(Vector3 p,Transform b)=>new SolePoint{bone=new[]{Index(b)},local=new[]{b.InverseTransformPoint(p)},weight=new[]{1f}};
            if(found[f].Count>=4){
                // The lowest vertex of each 1 cm ground cell, plus the rearmost and
                // foremost vertex of each 1 cm height band and 2 cm side strip
                // (heel cup and toe cap rims).
                var keep=new Dictionary<(int,int,int),(int index,float score)>();
                void Keep((int,int,int) key,int index,float score){if(!keep.TryGetValue(key,out var old)||score<old.score)keep[key]=(index,score);}
                for(int i=0;i<found[f].Count;i++){
                    var p=found[f][i].p;float along=Vector3.Dot(p-a,ahead);int band=Mathf.FloorToInt((p.y-pitch)/.01f);
                    Keep((0,Mathf.FloorToInt(p.x/.01f),Mathf.FloorToInt(p.z/.01f)),i,p.y);int lateral=Mathf.FloorToInt(Vector3.Dot(p-a,Vector3.Cross(up,ahead))/.02f);Keep((1,band,lateral),i,along);Keep((2,band,lateral),i,-along);
                }
                foreach(var item in keep.Values){var c=found[f][item.index];var q=Point(c.p,c.w,c.bones);q.vertex=c.vertex;list.Add(q);}
            }
            else{list.Add(Fixed(new Vector3(a.x,pitch,a.z),ankles[f]));list.Add(Fixed(new Vector3(t.x,pitch,t.z),toes[f]));}
        }
        profile.solePoints=true;
    }
    // Diagnostics: standing height above the sole of each foot vertex, and the contour membership.
    public static readonly Dictionary<int,float> standing=new Dictionary<int,float>();
    public bool InContour(int vertex){foreach(var l in profile.corners)foreach(var q in l)if(q.vertex==vertex)return true;return false;}
    public string VertexDetail(int vertex){for(int f=0;f<2;f++){var m=matrices[f];if(m==null)continue;foreach(var q in profile.corners[f])if(q.vertex==vertex){float y=0;string b="";for(int k=0;k<q.bone.Length;k++){var a=m[q.bone[k]];var l=q.local[k];y+=q.weight[k]*(a.m10*l.x+a.m11*l.y+a.m12*l.z+a.m13);b+=profile.soleBones[f][q.bone[k]]+":"+q.weight[k].ToString("0.00")+" ";}return "rebuilt="+(y-(root.position.y+profile.sole)).ToString("0.0000")+" "+b+" skinWeights="+QualitySettings.skinWeights;}}return "not in contour skinWeights="+QualitySettings.skinWeights;}
    // Number of sole contour points of one foot (diagnostics).
    public int SolePointCount(int foot)=>profile.corners[foot].Count;
    // Height of the lowest sole contour point of one foot above the pitch (metres); NaN without points.
    public float SolePointClearance(int foot){
        if(!Valid||!profile.solePoints)return float.NaN;float pitch=root.position.y+profile.sole,low=float.MaxValue;
        var names=profile.soleBones[foot];if(soleBones[foot]==null||soleBones[foot].Length!=names.Count){soleBones[foot]=new Transform[names.Count];for(int k=0;k<names.Count;k++)soleBones[foot][k]=Array.Find(root.GetComponentsInChildren<Transform>(),x=>x.name==names[k]);}
        var bones=soleBones[foot];if(matrices[foot]==null||matrices[foot].Length!=bones.Length)matrices[foot]=new Matrix4x4[bones.Length];var m=matrices[foot];
        for(int k=0;k<bones.Length;k++){if(bones[k]==null)return float.NaN;m[k]=bones[k].localToWorldMatrix;}
        // Only the height is needed: row 1 of each bone matrix.
        foreach(var q in profile.corners[foot]){
            float y=0;for(int k=0;k<q.bone.Length;k++){var a=m[q.bone[k]];var l=q.local[k];y+=q.weight[k]*(a.m10*l.x+a.m11*l.y+a.m12*l.z+a.m13);}
            if(y<low)low=y;
        }
        return low==float.MaxValue?float.NaN:low-pitch;
    }
    readonly Transform[][] soleBones=new Transform[2][];readonly Matrix4x4[][] matrices=new Matrix4x4[2][];
    // Measured mean chest turn of a stride clip relative to the actor's
    // forward (degrees, positive to the right); 0 when unknown.
    public float ChestBias(AnimationClip clip){return clip!=null&&profile.chestBias.TryGetValue(clip,out var b)?b:0;}
    public void StoreChestBias(AnimationClip clip,float bias){profile.chestBias[clip]=bias;}
    // Clearance in metres at the actor's scale; positive means above the pitch.
    public float Clearance(int foot){return Valid&&profile.calibrated?Mathf.Min(Height(ankles[foot])-profile.ankle,Height(toes[foot])-profile.toe)*root.lossyScale.y:0;}
    public float Lowest=>Mathf.Min(Clearance(0),Clearance(1));
    public float AnkleClearance(int foot){return Valid&&profile.calibrated?(Height(ankles[foot])-profile.ankle)*root.lossyScale.y:0;}
    public float ToeClearance(int foot){return Valid&&profile.calibrated?(Height(toes[foot])-profile.toe)*root.lossyScale.y:0;}
    // Lowest of heel/ankle, toe base and toe tip of one foot above its standing
    // height (metres): the tip carries the contact during a push-off.
    public float SupportClearance(int foot){
        if(!Valid||!profile.calibrated)return 0;float c=Mathf.Min(Height(ankles[foot])-profile.ankle,Height(toes[foot])-profile.toe);
        if(!float.IsNaN(profile.toeEnd)&&toeEnds[foot]!=null)c=Mathf.Min(c,Height(toeEnds[foot])-profile.toeEnd);c*=root.lossyScale.y;
        float sole=SolePointClearance(foot);return float.IsNaN(sole)?c:Mathf.Min(c,sole);
    }
    // Metres by which ankle, toe or toe tip of one foot is below its standing
    // height (0 when none is): a sole that would cut into the turf.
    public float SoleDeficit(int foot){
        if(!Valid||!profile.calibrated)return 0;float d=Mathf.Max(profile.ankle-Height(ankles[foot]),profile.toe-Height(toes[foot]));
        if(!float.IsNaN(profile.toeEnd)&&toeEnds[foot]!=null)d=Mathf.Max(d,profile.toeEnd-Height(toeEnds[foot]));d*=root.lossyScale.y;
        float sole=SolePointClearance(foot);if(!float.IsNaN(sole))d=Mathf.Max(d,-sole);return Mathf.Max(0,d);
    }
    public bool Known(AnimationClip clip){return clip!=null&&profile.offsets.ContainsKey(clip)&&profile.gaits.ContainsKey(clip);}
    public float Of(AnimationClip clip){return clip!=null&&profile.offsets.TryGetValue(clip,out var o)?o:0;}
    public void Store(AnimationClip clip,float lowest){
        // Only a consistent float (never touching down) is corrected. Lying or
        // kneeling poses that go below the standing sole are left untouched.
        profile.offsets[clip]=lowest>.012f?Mathf.Min(lowest,.25f):0;
    }
    public void StoreGait(AnimationClip clip,FootballStride.Gait gait){profile.gaits[clip]=gait;}
    public void StoreClearance(AnimationClip clip,float[][] clearance){profile.clearances[clip]=clearance;}
    // Measured travel direction of a stride clip (0 when unknown).
    // Mid-stance of one foot as a fraction of the shared cycle, which is aligned
    // at the measured left footfall: support foot planted, other foot passing.
    public double MidStance(AnimationClip clip,bool right){
        if(clip==null||!profile.gaits.TryGetValue(clip,out var g)||!profile.clearances.TryGetValue(clip,out var c))return right?.62:.12;
        int foot=right?1:0,n=c[foot].Length;float low=float.MaxValue;foreach(var v in c[foot])low=Mathf.Min(low,v);int stance=0;foreach(var v in c[foot])if(v-low<=.02f)stance++;
        float fall=right?RightFootfall(clip):Footfall(clip);return ((fall+.5*stance/(double)n-Sync(clip))%1+1)%1;
    }
    public float Heading(AnimationClip clip){return clip!=null&&profile.gaits.TryGetValue(clip,out var g)&&!float.IsNaN(g.heading)?g.heading:0;}
    // Nearest measured sample within [preferred-.25,preferred+.3] s where the
    // support foot is planted (within 3 cm of its lowest point) and the other
    // foot is clearly lifted; preferred when no such sample exists.
    public double SupportStart(AnimationClip clip,bool right,double preferred){
        if(clip==null||!profile.clearances.TryGetValue(clip,out var c))return preferred;
        int support=right?1:0,swing=1-support,n=c[0].Length;float low(int f){float m=float.MaxValue;foreach(var v in c[f])m=Mathf.Min(m,v);return m;}
        float sl=low(support),wl=low(swing);double dt=(clip.length-.001)/(n-1),best=preferred,distance=double.MaxValue;
        for(int s=0;s<n;s++){double t=s*dt;if(t<preferred-.25||t>preferred+.3)continue;if(c[support][s]-sl<=.03f&&c[swing][s]-wl>.04f&&Math.Abs(t-preferred)<distance){distance=Math.Abs(t-preferred);best=t;}}
        return best;
    }
    public float StrideLength(AnimationClip clip){return clip!=null&&profile.gaits.TryGetValue(clip,out var g)?g.stride:0;}
    // A foot's own stance float: its lowest bone clearance over the measured
    // clip above the clip's ground shift (Of, which the mixer already removes;
    // metres, at most 10 cm).
    // r21: the clip's measured float at one clip time: the lower foot's bone clearance (48 samples over the clip,
    // interpolated) above its clip offset (Of), metres, never negative.
    public float FloatAt(AnimationClip clip,double time){
        if(clip==null||!profile.clearances.TryGetValue(clip,out var c))return 0;int n=c[0].Length;if(n<2)return 0;
        double x=Math.Clamp(time/Math.Max(.001,clip.length-.001),0,1)*(n-1);int a=(int)Math.Floor(x),b=Math.Min(n-1,a+1);float u=(float)(x-a);
        float at(int s)=>Mathf.Min(c[0][s],c[1][s]);return Mathf.Max(0,Mathf.Lerp(at(a),at(b),u)-Of(clip));
    }
    public float StanceFloat(AnimationClip clip,int foot){
        if(clip==null||!profile.clearances.TryGetValue(clip,out var c))return 0;float low=float.MaxValue;foreach(var v in c[foot])low=Mathf.Min(low,v);return Mathf.Clamp(low-Of(clip),0,.1f);
    }
    // Lowest bone clearance of one foot over the measured clip (metres, at
    // most 4 cm): an authored stance that never reaches the standing height.
    public float FootFloat(AnimationClip clip,int foot){
        if(clip==null||!profile.clearances.TryGetValue(clip,out var c))return 0;float low=float.MaxValue;foreach(var v in c[foot])low=Mathf.Min(low,v);return Mathf.Clamp(low,0,.04f);
    }
    public float Footfall(AnimationClip clip){return clip!=null&&profile.gaits.TryGetValue(clip,out var g)&&g.left>=0?g.left:0;}
    // Cycle 0 of the shared stride cycle as a clip fraction (FootballStride.Gait.sync; the left footfall without one).
    public float Sync(AnimationClip clip){return clip!=null&&profile.gaits.TryGetValue(clip,out var g)&&g.syncKnown?g.sync:Footfall(clip);}
    public float RightFootfall(AnimationClip clip){return clip!=null&&profile.gaits.TryGetValue(clip,out var g)&&g.right>=0?g.right:(Footfall(clip)+.5f)%1;}
    // Klares Low-Poly: a drawn skin other than the release mesh gets one never-drawn
    // ground skin of the release mesh on the same bones (AttachGroundSkin). The
    // standing sole, the clip offsets, the sole contour and the turf stand are
    // measured on it alone, so the motion stays that of the release mesh;
    // VisibleLowestVertex reads the drawn skin for surface checks. Without a
    // ground skin every path below is the unchanged release path.
    public const string GroundSkinName="d6-ground";
    public static bool IsGroundSkin(Component skin)=>skin!=null&&skin.gameObject.name==GroundSkinName;
    static readonly List<SkinnedMeshRenderer> skinScratch=new List<SkinnedMeshRenderer>();
    static readonly HashSet<(Mesh,Mesh)> sameRig=new HashSet<(Mesh,Mesh)>();
    // The attached ground skin of an actor, or null.
    public static SkinnedMeshRenderer GroundSkin(Transform actor){
        actor.GetComponentsInChildren(skinScratch);foreach(var r in skinScratch)if(IsGroundSkin(r)&&r.sharedMesh!=null)return r;return null;
    }
    // The skin the ground profile belongs to: the ground skin, else the first skin as before.
    static SkinnedMeshRenderer MeasuredSkin(Transform actor){var ground=GroundSkin(actor);return ground!=null?ground:actor.GetComponentInChildren<SkinnedMeshRenderer>();}
    // measured: the ground skin alone when attached, else every skin; drawn: every skin except the ground skin.
    static List<SkinnedMeshRenderer> Skins(Transform actor,bool drawn){
        var ground=drawn?null:GroundSkin(actor);actor.GetComponentsInChildren(skinScratch);
        if(ground!=null){skinScratch.Clear();skinScratch.Add(ground);}
        else if(drawn)for(int i=skinScratch.Count-1;i>=0;i--)if(IsGroundSkin(skinScratch[i]))skinScratch.RemoveAt(i);
        return skinScratch;
    }
    // Attaches (or updates) the ground skin when the actor's one drawn skin shows
    // another mesh than ground, and removes it otherwise; idempotent. Same parent,
    // local transform, bones, root bone and skin quality as the drawn skin, the
    // renderer disabled and without materials: no draw, shadow or skinning per frame.
    public static SkinnedMeshRenderer AttachGroundSkin(Transform actor,Mesh ground){
        SkinnedMeshRenderer drawn=null,skin=null;int count=0;
        actor.GetComponentsInChildren(skinScratch);foreach(var r in skinScratch){if(IsGroundSkin(r))skin=r;else{count++;if(drawn==null)drawn=r;}}
        if(drawn==null||drawn.sharedMesh==null||ground==null||drawn.sharedMesh==ground){
            if(skin!=null){skin.sharedMesh=null;// ignored by GroundSkin until the deferred Destroy
                #if UNITY_EDITOR
                if(!Application.isPlaying){UnityEngine.Object.DestroyImmediate(skin.gameObject);return null;}
                #endif
                UnityEngine.Object.Destroy(skin.gameObject);}
            return null;
        }
        if(count!=1)throw new InvalidOperationException("A ground skin needs exactly one drawn skin ("+count+" on "+actor.name+")");
        var bones=drawn.bones;
        if(!sameRig.Contains((drawn.sharedMesh,ground))){
            var a=drawn.sharedMesh.bindposes;var b=ground.bindposes;bool same=a.Length==b.Length&&a.Length==bones.Length;for(int i=0;same&&i<a.Length;i++)same=a[i]==b[i];
            if(!same)throw new InvalidOperationException("Ground mesh "+ground.name+" is not on the rig of "+drawn.sharedMesh.name);
            sameRig.Add((drawn.sharedMesh,ground));
        }
        if(skin==null){var go=new GameObject(GroundSkinName);UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(go,actor.gameObject.scene);skin=go.AddComponent<SkinnedMeshRenderer>();skin.enabled=false;}
        var place=skin.transform;var source=drawn.transform;
        if(source==actor){place.SetParent(actor,false);place.localPosition=Vector3.zero;place.localRotation=Quaternion.identity;place.localScale=Vector3.one;}
        else{place.SetParent(source.parent,false);place.localPosition=source.localPosition;place.localRotation=source.localRotation;place.localScale=source.localScale;}
        skin.gameObject.layer=drawn.gameObject.layer;skin.enabled=false;skin.sharedMaterials=Array.Empty<Material>();
        skin.shadowCastingMode=UnityEngine.Rendering.ShadowCastingMode.Off;skin.receiveShadows=false;skin.skinnedMotionVectors=false;skin.updateWhenOffscreen=false;
        skin.sharedMesh=ground;skin.bones=bones;skin.rootBone=drawn.rootBone;skin.quality=drawn.quality;
        return skin;
    }
    static Mesh bakeMesh;static readonly List<Vector3> bakeVertices=new List<Vector3>();
    // Lowest skinned vertex relative to the actor root, in metres: the ground
    // measurement (the ground skin when attached).
    public static float LowestVertex(Transform actor)=>LowestSkinned(actor,false);
    // The same on the drawn skin only (surface checks of what is rendered).
    public static float VisibleLowestVertex(Transform actor)=>LowestSkinned(actor,true);
    static float LowestSkinned(Transform actor,bool drawn){
        float lowest=float.MaxValue;var mesh=bakeMesh??(bakeMesh=new Mesh());
        foreach(var r in Skins(actor,drawn)){if(r.sharedMesh==null)continue;
            // Reading the bones completes the animation write; otherwise a bake
            // directly after PlayableGraph.Evaluate can use the previous pose.
            foreach(var bone in r.bones)if(bone!=null)_=bone.position;
            // Measured on this rig: BakeMesh(useScale:false) already carries the
            // inherited 1.45 figure scale; only position and rotation remain to apply.
            r.BakeMesh(mesh,false);mesh.GetVertices(bakeVertices);var origin=r.transform.position;var rotation=r.transform.rotation;foreach(var v in bakeVertices)lowest=Mathf.Min(lowest,(origin+rotation*v).y-actor.position.y);}
        return lowest==float.MaxValue?0:lowest;
    }
    // Editor diagnostics: the same measurement on a single-clip graph.
    public float Offset(AnimationClip clip,PlayableGraph graph,AnimationPlayableOutput output){
        var playable=AnimationClipPlayable.Create(graph,clip);playable.SetApplyFootIK(false);output.SetSourcePlayable(playable);float lowest=float.MaxValue;
        for(int s=0;s<24;s++){playable.SetTime(s*(clip.length-.001)/23);graph.Evaluate(0);lowest=Mathf.Min(lowest,profile.soleKnown?LowestVertex(root)-profile.sole:Lowest);}
        graph.DestroyPlayable(playable);Store(clip,lowest);return Of(clip);
    }
}
// Bounded two-bone correction. An unreachable point remains unreachable; the
// solver never stretches a limb or teleports an actor. Confirmed possession
// may separately attach the view ball to the sampled glove midpoint.
public sealed class FootballRig {
    readonly Transform leftToe,rightToe,leftTip,rightTip;
    readonly Transform root,hips,spine,spine1,spine2,head,leftUpper,leftLower,leftFoot,rightUpper,rightLower,rightFoot,arm,forearm,hand,leftArm,leftForearm,leftHand;
    Vector3 anchor;bool planted,plantRight;
    readonly Quaternion restLeftFootRotation,restRightFootRotation;
    public float plantError,contactError;public bool reachable;
    public FootballGround ground;
    // Largest head correction toward an actual header contact.
    public const float HeadReach=22;
    public FootballRig(Transform root){
        this.root=root;Transform Find(string name){return Array.Find(root.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:"+name);}
        hips=Find("Hips");spine=Find("Spine");spine1=Find("Spine1");spine2=Find("Spine2");leftToe=Find("LeftToeBase");rightToe=Find("RightToeBase");leftTip=Find("LeftToe_End");rightTip=Find("RightToe_End");head=Find("Head");leftUpper=Find("LeftUpLeg");leftLower=Find("LeftLeg");leftFoot=Find("LeftFoot");rightUpper=Find("RightUpLeg");rightLower=Find("RightLeg");rightFoot=Find("RightFoot");arm=Find("RightArm");forearm=Find("RightForeArm");hand=Find("RightHand");leftArm=Find("LeftArm");leftForearm=Find("LeftForeArm");leftHand=Find("LeftHand");
        if(leftFoot==null||rightFoot==null||hand==null)throw new InvalidOperationException("Football contact rig is missing bones");
        restLeftFootRotation=Quaternion.Inverse(root.rotation)*leftFoot.rotation;restRightFootRotation=Quaternion.Inverse(root.rotation)*rightFoot.rotation;
    }
    public void Release(){planted=false;plantError=0;reachable=false;contactError=0;stepAt=-1;plantClock=-1;}
    // r15: a contact ends while the plant goes on (the same standing foot under the next action).
    public void ReleaseContact(){reachable=false;contactError=0;}
    public bool Planted=>planted;public bool PlantRight=>plantRight;
    public Transform Ankle(int foot){return foot==0?leftFoot:rightFoot;}
    public Transform Toe(int foot){var t=foot==0?leftToe:rightToe;return t!=null?t:Ankle(foot);}
    // Directional stride from the observed travel relative to the received
    // facing; the received actor root never turns. The pelvis turns by
    // pelvisYaw and the spine twists back, so the chest keeps the facing and
    // the arms swing partly with the hips. Each foot's fore-aft excursion of
    // the sampled stride is then turned by legYaw around its hip joint and the
    // leg is solved with two bones (no stretch): the knee follows the foot's
    // path and the foot turns part of the way, instead of swivelling thighs.
    // scale (stride warping) shortens each foot's fore-aft excursion when the
    // stride is played at a minimum cadence below its authored speed.
    // scale: shown share of each foot's fore-aft excursion (FootballLocomotion.StrideScale; above 1 the lengthened top-speed step, U-1).
    public void Directional(float pelvisYaw,float legYaw,float weight,float scale=1){
        weight=Mathf.Clamp01(weight);scale=Mathf.Clamp(scale,.2f,FootballLocomotion.MaxStrideStretch);bool unscaled=scale>.999f&&scale<1.001f;if(weight<=0&&unscaled||hips==null)return;
        float p=pelvisYaw*weight,r=legYaw*weight;var up=root.up;
        if(Mathf.Abs(p)>=.01f){
            hips.rotation=Quaternion.AngleAxis(p,up)*hips.rotation;
            if(spine!=null)spine.rotation=Quaternion.AngleAxis(-p*(spine1!=null?.5f:1f),up)*spine.rotation;
            if(spine1!=null)spine1.rotation=Quaternion.AngleAxis(-p*(spine2!=null?.3f:.5f),up)*spine1.rotation;
            if(spine2!=null)spine2.rotation=Quaternion.AngleAxis(-p*.2f,up)*spine2.rotation;
            if(arm!=null)arm.rotation=Quaternion.AngleAxis(p*.3f,up)*arm.rotation;
            if(leftArm!=null)leftArm.rotation=Quaternion.AngleAxis(p*.3f,up)*leftArm.rotation;
        }
        if(Mathf.Abs(r)<.01f&&unscaled)return;
        var forward=Vector3.ProjectOnPlane(Quaternion.AngleAxis(p,up)*root.forward,up).normalized;var right=Vector3.Cross(up,forward);var path=Quaternion.AngleAxis(r,up)*forward;
        for(int f=0;f<2;f++){
            var upper=f==0?leftUpper:rightUpper;var lower=f==0?leftLower:rightLower;var foot=f==0?leftFoot:rightFoot;
            var hip=upper.position;var e=foot.position-hip;float height=Vector3.Dot(e,up);var flat=e-up*height;
            var target=hip+right*Vector3.Dot(flat,right)+path*(Vector3.Dot(flat,forward)*scale)+up*height;
            var line=foot.position-hip;var bend=Vector3.ProjectOnPlane(lower.position-(hip+foot.position)*.5f,line.sqrMagnitude>1e-8f?line.normalized:up);
            var pole=Quaternion.AngleAxis(r*.6f,up)*(bend.sqrMagnitude>1e-8f?bend.normalized:forward);
            var rotation=foot.rotation;Solve(upper,lower,foot,target,pole);foot.rotation=Quaternion.AngleAxis(r*.55f,up)*rotation;
        }
    }
    // Lateral side step (chasse) from the signed cycles of the lateral distance
    // actually travelled along the received right axis (FootballLocomotion).
    // The right foot leads toward +right and steps out in the first part of a
    // cycle, the left foot closes in the second part: a planted foot keeps its
    // pitch point while the body passes. Travelling left runs the same cycle
    // backwards, so the left foot leads. Feet never cross; knees stay forward.
    public void SideStep(double cycles,float length,float weight,bool keeper){
        weight=Mathf.Clamp01(weight);if(weight<=0||length<=0)return;
        var up=root.up;var forward=Vector3.ProjectOnPlane(root.forward,up).normalized;var right=Vector3.Cross(up,forward);
        double k=Math.Floor(cycles);float u=(float)(cycles-k);
        float S(float x)=>x<=0?0:x>=1?1:x*x*(3-2*x);
        float lead=(u<.45f?S(u/.45f):1)-u,close=(u<.5f?0:u<.95f?S((u-.5f)/.45f):1)-u;
        // A quick lift and a slow sideways start: the sole leaves the turf before it travels.
        float Raise(float q)=>q<=0||q>=1?0:1-Mathf.Pow(2*q-1,4);
        float leadLift=u<.45f?Raise(u/.45f):0,closeLift=u>=.5f&&u<.95f?Raise((u-.5f)/.45f):0;
        // The closing foot comes in near the lead foot (closed stance), then the lead steps out.
        float half=Mathf.Clamp(Mathf.Abs(Vector3.Dot(rightFoot.position-leftFoot.position,right))*.275f,.09f,.14f),lift=keeper?.06f:.08f;
        for(int f=0;f<2;f++){
            var upper=f==0?leftUpper:rightUpper;var lower=f==0?leftLower:rightLower;var foot=f==0?leftFoot:rightFoot;
            float offset=f==1?half+length*lead:-half+length*close,raise=(f==1?leadLift:closeLift)*lift;
            // The lowest sole point (heel or toe, measured against the standing
            // reference) rests on the pitch; the ready clips carry one foot a few
            // centimetres up or tilt it. Only the step lifts the foot.
            var current=foot.position;var target=current+right*(Vector3.Dot(root.position-current,right)+offset);
            if(ground!=null&&ground.Calibrated){var toe=f==0?leftToe:rightToe;float scale=root.lossyScale.y,ankleClear=Vector3.Dot(current-root.position,up)-ground.ankle*scale,toeClear=toe!=null?Vector3.Dot(toe.position-root.position,up)-ground.toe*scale:ankleClear;
                float lowest=Mathf.Min(ankleClear,toeClear),sole=ground.SolePointClearance(f);if(!float.IsNaN(sole))lowest=Mathf.Min(lowest,sole);target-=up*lowest;}
            target+=up*raise;
            Blend(upper,lower,foot,target,weight,forward+right*(f==1?.25f:-.25f));
        }
        // The pelvis dips a little while both feet are planted.
        hips.position-=up*(.018f*weight*(1-Mathf.Max(leadLift,closeLift)));
    }
    // Turns the chest about the vertical axis over the three spine bones
    // (degrees, positive to the right); pelvis, legs and feet are untouched.
    public void ChestTurn(float degrees){
        if(Mathf.Abs(degrees)<.01f)return;var up=root.up;
        if(spine!=null)spine.rotation=Quaternion.AngleAxis(degrees*.3f,up)*spine.rotation;
        if(spine1!=null)spine1.rotation=Quaternion.AngleAxis(degrees*.35f,up)*spine1.rotation;
        if(spine2!=null)spine2.rotation=Quaternion.AngleAxis(degrees*.35f,up)*spine2.rotation;
    }
    // Field player's lateral side step: the arms hang relaxed and a little
    // away from the body, elbows soft and pointing back, hands near hip height
    // (no ready-stance guard at the face); the hands sway a little with the
    // step cycle. Bounded two-bone arms; the hand keeps its pose on the forearm.
    public void SideArms(float weight,double cycles){
        weight=Mathf.Clamp01(weight);if(weight<=0||arm==null||forearm==null||hand==null||leftArm==null||leftForearm==null||leftHand==null)return;
        var up=root.up;var forward=Vector3.ProjectOnPlane(root.forward,up).normalized;var right=Vector3.Cross(up,forward);
        float sway=Mathf.Sin(2*Mathf.PI*(float)(cycles-Math.Floor(cycles)))*.03f;
        for(int s=-1;s<=1;s+=2){
            var upper=s>0?arm:leftArm;var lower=s>0?forearm:leftForearm;var end=s>0?hand:leftHand;
            float length=Vector3.Distance(upper.position,lower.position)+Vector3.Distance(lower.position,end.position);
            var target=upper.position-up*length*.80f+forward*length*.20f+right*(s*length*.17f+sway);
            var a=upper.rotation;var b=lower.rotation;var local=end.localRotation;
            Solve(upper,lower,end,target,-forward+right*(s*.5f));
            upper.rotation=Quaternion.Slerp(a,upper.rotation,weight);lower.rotation=Quaternion.Slerp(b,lower.rotation,weight);end.localRotation=local;
        }
    }
    // Stride arms: a hand above the shoulder line is lowered with a soft limit
    // (unchanged up to LimitKnee below the line, then approaching it), so the
    // swing keeps its fore-aft path; bounded two-bone arm, the hand keeps its
    // pose on the forearm. Measured: run_fast4 and fast sprint arms (with the
    // acceleration drive) lifted a hand above the shoulders in native runs.
    public const float LimitKnee=.06f;
    public void LimitHands(float weight){
        weight=Mathf.Clamp01(weight);if(weight<=0||arm==null||forearm==null||hand==null||leftArm==null||leftForearm==null||leftHand==null)return;
        float top=Mathf.Min(arm.position.y,leftArm.position.y)-.01f;
        for(int s=-1;s<=1;s+=2){
            var upper=s>0?arm:leftArm;var lower=s>0?forearm:leftForearm;var end=s>0?hand:leftHand;
            float y=end.position.y;if(y<=top-LimitKnee)continue;float limited=top-LimitKnee*Mathf.Exp(-(y-top+LimitKnee)/LimitKnee);
            var target=end.position;target.y=Mathf.Lerp(y,limited,weight);
            var line=end.position-upper.position;var bend=Vector3.ProjectOnPlane(lower.position-(upper.position+end.position)*.5f,line.sqrMagnitude>1e-8f?line.normalized:root.up);
            var local=end.localRotation;Solve(upper,lower,end,target,bend.sqrMagnitude>1e-8f?bend.normalized:-root.forward);end.localRotation=local;
        }
    }
    // B11: each upper arm whose abduction (angle between shoulder -> elbow and the body's down axis -root.up) exceeds limit
    // is turned down about the shoulder on the shortest path toward hanging, by the excess times weight; the forearm and
    // hand keep their pose on the upper arm. Returns the larger lowering (degrees). Bones only.
    public float LowerArms(float limit,float weight){
        weight=Mathf.Clamp01(weight);if(weight<=0||arm==null||forearm==null||leftArm==null||leftForearm==null)return 0;
        var down=-root.up;float lowered=0;
        for(int s=-1;s<=1;s+=2){
            var upper=s>0?arm:leftArm;var lower=s>0?forearm:leftForearm;var dir=lower.position-upper.position;if(dir.sqrMagnitude<1e-8f)continue;
            float abduction=Vector3.Angle(dir,down);if(abduction<=limit)continue;
            var axis=Vector3.Cross(dir,down);if(axis.sqrMagnitude<1e-8f)axis=root.forward;
            float by=(abduction-limit)*weight;upper.rotation=Quaternion.AngleAxis(by,axis.normalized)*upper.rotation;lowered=Mathf.Max(lowered,by);
        }
        return lowered;
    }
    // A lowered pelvis bends the knees: both feet keep their world point. Moving
    // the whole leg down with the hips set the swing foot of a starting stride
    // onto the turf (measured 3-5 m/s of scraping at -1 cm in short-sprint
    // starts, which the foot lock then caught and dragged).
    public void Lower(float d){if(d<=0||hips==null)return;var l=leftFoot.position;var r=rightFoot.position;hips.position-=root.up*d;PlaceFoot(0,l);PlaceFoot(1,r);}
    // Pelvis drop that brings an ankle point within the leg's reach (as
    // CanPlaceFoot: 98.5 % of the leg, at least reach); 0 when it already is,
    // float.MaxValue when no drop can (horizontally too far).
    public float ReachDrop(int f,Vector3 point,float reach=0){
        var upper=f==0?leftUpper:rightUpper;var lower=f==0?leftLower:rightLower;var foot=f==0?leftFoot:rightFoot;
        float r=Mathf.Max((Vector3.Distance(upper.position,lower.position)+Vector3.Distance(lower.position,foot.position))*.985f,reach);
        var d=upper.position-point;float v=Vector3.Dot(d,root.up),h=Vector3.ProjectOnPlane(d,root.up).magnitude;if(h>=r)return float.MaxValue;
        return Mathf.Max(0,v-Mathf.Sqrt(r*r-h*h));
    }
    // Braking from a jog: the pelvis lowers (planted soles bend the knees) and
    // the chest stays back over the hips; arms come forward for balance.
    public void Brake(float weight){
        weight=Mathf.Clamp01(weight);if(weight<=0||hips==null)return;var up=root.up;var right=Vector3.Cross(up,Vector3.ProjectOnPlane(root.forward,up).normalized);
        Lower(.07f*weight);
        if(spine!=null)spine.rotation=Quaternion.AngleAxis(-6*weight,right)*spine.rotation;
        if(arm!=null)arm.rotation=Quaternion.AngleAxis(-12*weight,right)*arm.rotation;
        if(leftArm!=null)leftArm.rotation=Quaternion.AngleAxis(-12*weight,right)*leftArm.rotation;
    }
    // Acceleration from rest: the pelvis lowers and the arms drive harder.
    public void Drive(float weight){
        weight=Mathf.Clamp01(weight);if(weight<=0||hips==null)return;var up=root.up;
        Lower(.035f*weight);
        if(arm==null||leftArm==null||forearm==null||leftForearm==null)return;
        var across=(arm.position-leftArm.position);across=Vector3.ProjectOnPlane(across,up);if(across.sqrMagnitude<1e-6f)return;across.Normalize();var ahead=Vector3.Cross(across,up);
        foreach(var (upper,lower) in new[]{(arm,forearm),(leftArm,leftForearm)}){
            // Amplify the sampled fore-aft arm swing around the shoulder line.
            var dir=Vector3.ProjectOnPlane(lower.position-upper.position,across);if(dir.sqrMagnitude<1e-6f)continue;
            float swing=Vector3.SignedAngle(-up,dir,across);
            upper.rotation=Quaternion.AngleAxis(swing*.35f*weight,across)*upper.rotation;
            lower.rotation=Quaternion.AngleAxis(-14*weight,across)*lower.rotation;
        }
    }
    // True when the leg reaches the point with a little knee bend left.
    // reach: at least this hip distance is reachable (the sampled leg's own
    // extension: a landing heel that the clip sets down on an almost straight
    // leg was judged out of reach at zero shift and its anchor slid along).
    public bool CanPlaceFoot(int f,Vector3 point,float reach=0){var upper=f==0?leftUpper:rightUpper;var lower=f==0?leftLower:rightLower;var foot=f==0?leftFoot:rightFoot;float leg=Vector3.Distance(upper.position,lower.position)+Vector3.Distance(lower.position,foot.position);return Vector3.Distance(upper.position,point)<=Mathf.Max(leg*.985f,reach);}
    public float HipDistance(int f,Vector3 point){return Vector3.Distance((f==0?leftUpper:rightUpper).position,point);}
    // Heel-off: ankle on the intersection of the leg's reach (98.5 %) around the
    // hip and the foot length around the planted toe, nearest to the wanted
    // ankle; then the foot turns so its toe meets the toe point. False when the
    // toe is out of reach altogether.
    // minReach: the same reach as CanPlaceFoot (a switch from a heel lock on the
    // sampled leg's own extension to the toe bent the knee to 98.5 % within
    // one picture: 13.5 degrees of thigh at 120 Hz).
    public bool HeelOff(int f,Vector3 toePoint,Vector3 wanted,float minReach=0){
        var upper=f==0?leftUpper:rightUpper;var lower=f==0?leftLower:rightLower;var foot=f==0?leftFoot:rightFoot;var toe=Toe(f);if(toe==foot)return false;
        float reach=Mathf.Max((Vector3.Distance(upper.position,lower.position)+Vector3.Distance(lower.position,foot.position))*.985f,minReach),length=Vector3.Distance(foot.position,toe.position);
        var hip=upper.position;var axis=toePoint-hip;float d=axis.magnitude;if(d<1e-4f||d>reach+length||d<Mathf.Abs(reach-length))return false;axis/=d;
        float a=(reach*reach-length*length+d*d)/(2*d),h=Mathf.Sqrt(Mathf.Max(0,reach*reach-a*a));var centre=hip+axis*a;
        var side=Vector3.ProjectOnPlane(wanted-centre,axis);if(side.sqrMagnitude<1e-8f)side=Vector3.ProjectOnPlane(root.up,axis);var ankle=centre+side.normalized*h;
        PlaceFoot(f,ankle);foot.rotation=Quaternion.FromToRotation(toe.position-foot.position,toePoint-foot.position)*foot.rotation;return true;
    }
    // Places one ankle at a world point with the two-bone solver (bounded,
    // knee keeps its current side, foot keeps its orientation).
    public void PlaceFoot(int f,Vector3 point){
        var upper=f==0?leftUpper:rightUpper;var lower=f==0?leftLower:rightLower;var foot=f==0?leftFoot:rightFoot;
        Solve(upper,lower,foot,point,KneePole(f));
    }
    // Knee direction for a leg solve: the current bend off the hip-ankle line
    // plus a small bias along the pelvis forward (KneeToeBias m). A bent
    // knee keeps its side; a nearly straight running leg no longer takes its
    // pole from a centimetre of bend, which flipped the knee between pictures
    // (measured 2300 deg/s alternating thigh/shin spikes in native runs).
    public const float KneeToeBias=.04f;
    // Bend direction of leg f: its knee off the hip-ankle line (zero for a straight leg).
    public Vector3 KneeBend(int f){var upper=f==0?leftUpper:rightUpper;var lower=f==0?leftLower:rightLower;var foot=f==0?leftFoot:rightFoot;var line=foot.position-upper.position;return line.sqrMagnitude>1e-8f?Vector3.ProjectOnPlane(lower.position-upper.position,line.normalized):Vector3.zero;}
    // The rig's default knee direction: ahead across the hips (the pole of a leg without a bend of its own).
    public Vector3 KneeAhead(){var up=root.up;var ahead=Vector3.Cross(rightUpper.position-leftUpper.position,up);ahead=Vector3.ProjectOnPlane(ahead,up);if(ahead.sqrMagnitude<1e-6f)ahead=Vector3.ProjectOnPlane(root.forward,up);return ahead.normalized;}
    Vector3 KneePole(int f){
        var upper=f==0?leftUpper:rightUpper;var lower=f==0?leftLower:rightLower;var foot=f==0?leftFoot:rightFoot;var up=root.up;
        var hip=upper.position;var line=foot.position-hip;var axis=line.sqrMagnitude>1e-8f?line.normalized:up;
        var bend=Vector3.ProjectOnPlane(lower.position-(hip+foot.position)*.5f,axis);
        var ahead=Vector3.Cross(rightUpper.position-leftUpper.position,up);ahead=Vector3.ProjectOnPlane(ahead,up);if(ahead.sqrMagnitude<1e-6f)ahead=Vector3.ProjectOnPlane(root.forward,up);
        // A knee only flexes forward: a sampled leg a little past straight (its
        // knee 7 cm behind the hip-ankle line) gave a backward pole, the solved
        // knee bent backward and flipped forward in the next picture (a 0.36 m
        // knee jump, 2500 deg/s of thigh). The backward part of the bend is dropped.
        var front=Vector3.ProjectOnPlane(ahead.normalized,axis);if(front.sqrMagnitude>1e-8f){front.Normalize();float back=Vector3.Dot(bend,front);if(back<0)bend-=front*back;}
        var pole=bend+front*KneeToeBias;
        return pole.sqrMagnitude>1e-8f?pole.normalized:root.forward;
    }
    public Vector3 HeldBallCentre=>(hand.position+leftHand.position)*.5f;
    // Largest chest lean toward a received held ball beyond the arms (degrees).
    public const float GatherLean=30;
    // Gather from the sampled body (including a dive/rise), not the old native
    // contact. Bounded IK preserves limb lengths. The visible ball follows the
    // resulting glove midpoint; no simulation ball/root is written.
    // from/gather: the received ball and the share of the way to the chest;
    // the gloves hold the ball at the nearest point toward the received ball
    // that both arms reach, so the attached ball is never teleported to the chest.
    public Vector3 GatherBall(Vector3? from=null,float gather=1){
        var chest=(arm.position+leftArm.position)*.5f+root.forward*.30f-root.up*.22f;var centre=chest;
        var side=root.right*(WorldBallMotion.Radius*.92f);
        if(from.HasValue&&gather<1){
            // The chest leans toward a ball beyond the arms (bounded, fading with the gather).
            if(spine!=null){var a=chest-spine.position;var b=from.Value-spine.position;if(a.sqrMagnitude>1e-6f&&b.sqrMagnitude>1e-6f){var full=Quaternion.FromToRotation(a,b);full.ToAngleAxis(out float angle,out var axis);if(angle>180)angle-=360;float limited=Mathf.Clamp(angle,-GatherLean,GatherLean)*(1-Mathf.Clamp01(gather));if(Mathf.Abs(limited)>.01f)spine.rotation=Quaternion.AngleAxis(limited,axis)*spine.rotation;}
                chest=(arm.position+leftArm.position)*.5f+root.forward*.30f-root.up*.22f;}
            Vector3 At(float s)=>Vector3.Lerp(from.Value,chest,s);bool Both(Vector3 c)=>CanReach(arm,forearm,hand,c+side)&&CanReach(leftArm,leftForearm,leftHand,c-side);
            float lo=Mathf.Clamp01(gather),hi=1;if(!Both(At(lo))){for(int k=0;k<10;k++){float mid=(lo+hi)*.5f;if(Both(At(mid)))hi=mid;else lo=mid;}lo=hi;}
            centre=At(lo);
        }
        bool right=CanReach(arm,forearm,hand,centre+side),left=CanReach(leftArm,leftForearm,leftHand,centre-side);
        if(right)Solve(arm,forearm,hand,centre+side,-root.forward);
        if(left)Solve(leftArm,leftForearm,leftHand,centre-side,-root.forward);
        var middle=HeldBallCentre;reachable=right&&left;contactError=Vector3.Distance(middle,centre);return middle;
    }
    public void Lean(float forward,float turn,float recovery){
        if(spine==null)return;
        // Transform axes are taken from the actor, so the effect is consistent
        // for either attacking direction and never rotates the actor itself.
        float pitch=Mathf.Clamp(forward,-5,7)+Mathf.Clamp(recovery,0,8),bank=Mathf.Clamp(turn,-6,6);
        if(Mathf.Abs(pitch)+Mathf.Abs(bank)<.00001f)return;
        spine.rotation=Quaternion.AngleAxis(bank,root.forward)*Quaternion.AngleAxis(pitch,root.right)*spine.rotation;
    }
    public void KeeperDive(float weight,Vector3 point){
        if(hips==null)return;
        var local=root.InverseTransformPoint(point);float side=Math.Sign(local.x);if(side==0)return;
        // Only bones bank and lower for an already observed lateral dive. The
        // received root, heading and ball remain authoritative; no reach grows.
        float q=Mathf.Clamp01(Mathf.Abs(weight));float angle=-side*q*Mathf.Lerp(26,58,Mathf.Clamp01((1.7f-point.y)/1.4f));
        hips.rotation=Quaternion.AngleAxis(angle,root.forward)*hips.rotation;
        hips.position-=root.up*(q*Mathf.Clamp((1.6f-point.y)*.23f,0,.30f));
    }
    // Standing tackle or foul challenge: a lower, forward-leaning body. The
    // reaching foot itself is the ordinary bounded contact correction.
    public void Lunge(float weight){
        if(hips==null)return;float w=Mathf.Clamp01(weight);if(w<=0)return;
        hips.position-=Vector3.up*(.13f*w);
        if(spine!=null)spine.rotation=Quaternion.AngleAxis(16*w,root.right)*spine.rotation;
    }
    // Observed native slide: pelvis low and banked onto the trailing hip, body
    // leaning back with the chest up, lead leg straight along the turf toward
    // the actual contact, trailing leg folded and its hand on the ground. Only
    // bones move; the received root and heading stay authoritative and an
    // out-of-reach contact stays out of reach.
    public void Slide(float weight,Vector3 target,bool leftLead){
        if(hips==null)return;float w=Mathf.Clamp01(weight);if(w<=0)return;
        var forward=root.forward;var right=root.right;float lead=leftLead?-1:1;
        float height=hips.position.y-FootballGround.PitchSurface;
        hips.position-=Vector3.up*(w*Mathf.Max(0,height-FootballDuelTiming.SlideHips));
        hips.rotation=Quaternion.AngleAxis(w*FootballDuelTiming.SlideBank*lead,forward)*Quaternion.AngleAxis(-w*FootballDuelTiming.SlideLean,right)*hips.rotation;
        if(spine!=null)spine.rotation=Quaternion.AngleAxis(w*FootballDuelTiming.SlideLean*.45f,right)*spine.rotation;
        var upper=leftLead?leftUpper:rightUpper;var lower=leftLead?leftLower:rightLower;var foot=leftLead?leftFoot:rightFoot;
        float leg=Vector3.Distance(upper.position,lower.position)+Vector3.Distance(lower.position,foot.position);
        // The lead foot slides just above the turf toward the contact; a contact
        // behind or beyond the leg leaves the foot on the slide line instead.
        var aim=target;aim.y=Mathf.Clamp(aim.y,.09f,.35f);var reach=aim-upper.position;
        var line=upper.position+forward*leg*.94f;line.y=.09f;
        bool usable=Vector3.Dot(reach.normalized,forward)>.35f&&reach.magnitude<leg*.995f;
        Blend(upper,lower,foot,usable?aim:line,w,Vector3.up);
        reachable=usable;contactError=Vector3.Distance(foot.position,target);
        var tuckUpper=leftLead?rightUpper:leftUpper;var tuckLower=leftLead?rightLower:leftLower;var tuckFoot=leftLead?rightFoot:leftFoot;
        var tuck=hips.position+forward*.12f-right*lead*.18f;tuck.y=.1f;Blend(tuckUpper,tuckLower,tuckFoot,tuck,w,forward+Vector3.up*.25f);
        // The entering slide blends out of a running stride whose knee/boot may
        // point below the newly lowered pelvis. Constrain both soles throughout
        // that blend; otherwise the first slide pictures cut boots through turf.
        GroundFeet(forward+Vector3.up,true);
        contactError=Vector3.Distance(foot.position,target);
        var supportArm=leftLead?arm:leftArm;var supportForearm=leftLead?forearm:leftForearm;var supportHand=leftLead?hand:leftHand;
        if(supportArm!=null&&supportForearm!=null&&supportHand!=null){var palm=hips.position-forward*.28f-right*lead*.34f;palm.y=.18f;Blend(supportArm,supportForearm,supportHand,palm,w*.85f);}
    }
    // Ankles never pass below their standing height above the pitch. level
    // also rests the foot flat (slide); otherwise only a sinking foot is levelled.
    void GroundFeet(Vector3 pole,bool level=false){
        float clearance=ground!=null&&ground.Calibrated?root.position.y+ground.ankle*root.lossyScale.y:.28f;
        void One(Transform thigh,Transform calf,Transform ankle,Quaternion rest){
            bool sinking=ankle.position.y<clearance;
            if(sinking){var onTurf=ankle.position;onTurf.y=clearance;Solve(thigh,calf,ankle,onTurf,pole);}
            if(level||sinking)ankle.rotation=root.rotation*rest;
        }
        One(leftUpper,leftLower,leftFoot,restLeftFootRotation);One(rightUpper,rightLower,rightFoot,restRightFootRotation);
    }
    // Pelvis rise of the last aerial pose in metres (diagnostics).
    public float AirLift {get;private set;}
    public void ClearAir(){AirLift=0;}
    // Aerial take-off, flight and landing. Bones only: the pelvis rises by a
    // bounded lift toward the received contact height and dips on landing; the
    // received root, heading and ball stay authoritative. lift and crouch are
    // envelope weights (FootballAirTiming), reach the contact height or NaN.
    public void Air(float lift,float reach,float tuck,float crouch,float arms){
        AirLift=0;if(hips==null)return;
        lift=Mathf.Clamp01(lift);tuck=Mathf.Clamp01(tuck);crouch=Mathf.Clamp01(crouch);arms=Mathf.Clamp01(arms);
        var forward=root.forward;var right=root.right;
        // Head height of the sampled clip above the pitch, before any correction.
        float headHeight=head!=null?head.position.y-FootballGround.PitchSurface:1.7f;
        AirLift=lift*FootballAirTiming.Lift(reach,headHeight);
        hips.position+=Vector3.up*(AirLift-crouch*FootballAirTiming.LandDip);
        if(spine!=null&&crouch>0)spine.rotation=Quaternion.AngleAxis(crouch*10,right)*spine.rotation;
        if(tuck>0){
            // Shins fold back under the pelvis while clearly airborne.
            foreach(int s in new[]{-1,1}){
                var upper=s<0?leftUpper:rightUpper;var lower=s<0?leftLower:rightLower;var foot=s<0?leftFoot:rightFoot;
                float leg=Vector3.Distance(upper.position,lower.position)+Vector3.Distance(lower.position,foot.position);
                var target=upper.position-Vector3.up*leg*.78f-forward*.16f+right*s*.04f;Blend(upper,lower,foot,target,tuck,forward);
            }
        }
        // Preparation and landing never put a boot through the turf.
        GroundFeet(forward+Vector3.up*.25f);
        if(arms>0){
            // Both arms rise and spread for balance and leverage.
            if(arm!=null&&forearm!=null&&hand!=null)Blend(arm,forearm,hand,arm.position+Vector3.up*.22f+right*.36f+forward*.14f,arms*.8f,-forward);
            if(leftArm!=null&&leftForearm!=null&&leftHand!=null)Blend(leftArm,leftForearm,leftHand,leftArm.position+Vector3.up*.22f-right*.36f+forward*.14f,arms*.8f,-forward);
        }
    }
    // Lofted pass/goal kick: kicking leg swings through high, the body leans
    // back. Volley: the body banks away from the kicking leg. Applied only after
    // the native contact window; an out-of-reach swing target just straightens
    // the leg (Solve never stretches a limb).
    public void FollowThrough(float loft,float volley,Vector3? shownBend=null){
        if(hips==null)return;loft=Mathf.Clamp01(loft);volley=Mathf.Clamp01(volley);var forward=root.forward;var right=root.right;
        float leg=Vector3.Distance(rightUpper.position,rightLower.position)+Vector3.Distance(rightLower.position,rightFoot.position);
        if(spine!=null)spine.rotation=Quaternion.AngleAxis(volley*18,forward)*Quaternion.AngleAxis(-loft*10,right)*spine.rotation;
        float w=Mathf.Max(loft,volley);if(w<=0)return;bool side=volley>loft;
        var swing=rightUpper.position+forward*leg*(side?.55f:.72f)+Vector3.up*leg*(side?.38f:.28f)+right*leg*(side?.22f:.04f);
        // B05 (r132): the knee pole of the follow-through blend is the leg's current bend plane (as LimitHands), not the root
        // forward: with the hip -> swing line itself pointing mostly forward the forward pole nearly coincided with that
        // line and flipped the knee for single pictures (9133 and 6156 deg/s shin in a highPass return, native 160112
        // field-7, 27.550/27.600; 8212 in 160114 field-8). The forward pole stays the fallback for a straight leg.
        // B05 (r132): the knee plane of the previous picture's final leg (ShownBend) first: the blend's own target plane (knee
        // forward-up) differed from the hanging leg's plane by up to 180 deg and collapsed the knee 125 -> 54 deg within one
        // picture (7791 deg/s shin, native 160114 field-8, 31.300). The current bend, then root forward, remain the fallbacks.
        var line=swing-rightUpper.position;var bend=Vector3.ProjectOnPlane(rightLower.position-(rightUpper.position+rightFoot.position)*.5f,line.sqrMagnitude>1e-8f?line.normalized:forward);
        var pole=shownBend.HasValue&&shownBend.Value.sqrMagnitude>1e-6f?shownBend.Value.normalized:bend.sqrMagnitude>1e-6f?bend.normalized:forward;
        Blend(rightUpper,rightLower,rightFoot,swing,w*.75f,pole);
        if(leftArm!=null&&leftForearm!=null&&leftHand!=null)Blend(leftArm,leftForearm,leftHand,leftArm.position-right*.42f+forward*.18f+Vector3.up*.05f,w*.6f,-forward);
    }
    // Throw-in posture from the native phases: bend to the ball, raise it
    // overhead, arch back, then whip forward after the release. The hands meet
    // the actual ball only through the separate two-hands contact.
    public void Throw(float bend,float raise,float arch,float release){
        if(hips==null)return;bend=Mathf.Clamp01(bend);raise=Mathf.Clamp01(raise);arch=Mathf.Clamp01(arch);release=Mathf.Clamp01(release);
        var forward=root.forward;var right=root.right;
        hips.position-=Vector3.up*(.24f*bend);
        if(spine!=null)spine.rotation=Quaternion.AngleAxis(bend*38-arch*20+release*24,right)*spine.rotation;
        GroundFeet(forward+Vector3.up*.25f);
        float arms=Mathf.Max(raise,release);if(arms<=0||head==null)return;
        // Overhead and slightly behind with the arch; forward after the release.
        var centre=head.position+Vector3.up*.24f*raise-forward*.18f*arch+forward*.5f*release-Vector3.up*.25f*release;
        if(arm!=null&&forearm!=null&&hand!=null)Blend(arm,forearm,hand,centre+right*.12f,arms,-forward);
        if(leftArm!=null&&leftForearm!=null&&leftHand!=null)Blend(leftArm,leftForearm,leftHand,centre-right*.12f,arms,-forward);
    }
    // Ankle point at which foot f's boot (its ankle, toe base and toe tip bones,
    // turned as sampled; boot metres of surface around them) meets a ball of
    // radius around centre, approached from the kicking hip's side, the ankle at
    // least at minY (the sampled boot's lowest sole point then on or above the
    // turf). Bisection along the approach: the first point clear of the ball.
    public Vector3 BallContactTarget(int f,Vector3 centre,float radius,float boot,float minY){
        var ankle=Ankle(f).position;var o1=Toe(f).position-ankle;var tip=f==0?leftTip:rightTip;var o2=tip!=null?tip.position-ankle:o1;
        var back=(f==0?leftUpper:rightUpper).position-centre;back.y=0;if(back.sqrMagnitude<1e-6f)back=-root.forward;back.Normalize();
        var start=new Vector3(centre.x,Mathf.Max(minY,centre.y),centre.z);float want=radius+boot;
        float Gap(float s){var a=start+back*s;return Mathf.Min(SegmentDistance(centre,a,a+o1),SegmentDistance(centre,a+o1,a+o2))-want;}
        if(Gap(0)>=0)return start;float lo=0,hi=want+o1.magnitude+o2.magnitude;
        for(int k=0;k<24;k++){float mid=(lo+hi)*.5f;if(Gap(mid)<0)lo=mid;else hi=mid;}
        return start+back*hi;
    }
    public static float SegmentDistance(Vector3 p,Vector3 a,Vector3 b){var ab=b-a;float t=ab.sqrMagnitude>1e-10f?Mathf.Clamp01(Vector3.Dot(p-a,ab)/ab.sqrMagnitude):0;return Vector3.Distance(p,a+ab*t);}
    // Partial reach of foot f toward point: the ankle weight of the way along the
    // straight line from its sampled position, the knee kept on its side
    // (KneePole), the boot turned as sampled; an unreachable point stays unreached.
    public void ReachFoot(int f,Vector3 point,float weight){
        var upper=f==0?leftUpper:rightUpper;var lower=f==0?leftLower:rightLower;var foot=f==0?leftFoot:rightFoot;
        var aim=Vector3.Lerp(foot.position,point,Mathf.Clamp01(weight));bool can=CanReach(upper,lower,foot,aim);
        if(can)Solve(upper,lower,foot,aim,KneePole(f));reachable=CanReach(upper,lower,foot,point);contactError=Vector3.Distance(foot.position,point);
    }
    // Raises foot f by d along up (none for d<=0), the knee in its current bend plane.
    public void RaiseFoot(int f,float d){if(d<=0)return;var upper=f==0?leftUpper:rightUpper;var lower=f==0?leftLower:rightLower;var foot=f==0?leftFoot:rightFoot;Solve(upper,lower,foot,foot.position+root.up*d);}
    public float PrepareContact(Vector3 point,string kind){
        if(kind!="foot"&&kind!="left-foot")return 0;var upper=kind=="left-foot"?leftUpper:rightUpper;var lower=kind=="left-foot"?leftLower:rightLower;var end=kind=="left-foot"?leftFoot:rightFoot;float length=Vector3.Distance(upper.position,lower.position)+Vector3.Distance(lower.position,end.position),distance=Vector3.Distance(upper.position,point);
        // A small knee bend is allowed for differences between the authored rig
        // and the native foot volume. Far contacts receive no body correction.
        float excess=distance-length;var direction=upper.position-point;
        if(excess>0&&excess<.1f&&direction.y/distance>.65f){float drop=Mathf.Min(.12f,(excess+.004f)*distance/direction.y);LowerKeeping(drop,kind);return drop;}
        return 0;
    }
    // Pelvis drop toward a foot contact: the other (standing) foot keeps its
    // world point and bends its knee; lowered with the hips, the planted sole
    // went up to 10 cm into the turf (R9 shot and receive contacts).
    public void LowerKeeping(float d,string kind){
        if(d<=0||hips==null)return;int other=kind=="left-foot"?1:0;var keep=Ankle(other).position;var turn=Ankle(other).rotation;
        hips.position-=Vector3.up*d;if(kind=="foot"||kind=="left-foot"){PlaceFoot(other,keep);Ankle(other).rotation=turn;}
    }
    public const float PlantFade=.5f,PlantReach=.65f;
    // r15: the standing foot of a plant stays where it was shown and steps when it must. A plant
    // began at the rest-pose anchor wherever the foot was shown (a locked or swinging standing foot
    // jumped 0.3-0.5 m within one picture, 20-36 m/s, native passes and receives at the 0.4 m/s
    // plant edge); the rest pose is no kick stance (pass_inside_meshy puts its standing foot 0.5-0.66
    // m from it), and a correction beyond PlantFade was faded out along the turf (the standing foot
    // slid 14-19 m/s under a held passReady, then jumped back at the contact). Now the anchor is the
    // standing ankle shown last picture, set on the turf (a foot in the air sets down there on a
    // short arc); a sampled standing foot that the clip or the body takes beyond PlantFade from it is
    // followed by a step on an arc (lift PlantStepLift, travel in the middle FootballAnimation.ArcTravel
    // share at PlantStepSpeed, PlantStepShortest-PlantStepLongest) onto where the sampled foot stands,
    // never a slide or a jump. A received facing that turns faster than FootballAnimation.PivotRate
    // turns the anchor with the body about the root, as the foot locks do (a native 128 degree step
    // within one 20 Hz picture). The sole stays on the turf (its deficit lifted: planted soles stood
    // 8-17 cm in the turf). Without a shown picture (a cut) the anchor is the sampled foot. A
    // standing foot whose lowest point (ankle or toe) was shown more than PlantLand above the turf
    // is in the air (a tackle's lunge lifted it 0.6 m as the body slowed below 0.4 m/s): it plants
    // once it is down, never pulled straight-legged onto the turf below it; meanwhile its sole is
    // kept on the turf like a planted one.
    public const float PlantStepMin=.03f,PlantStepSpeed=2.5f,PlantStepLift=.05f,PlantStepFull=.15f,PlantLand=.15f;public const double PlantStepShortest=.12,PlantStepLongest=.24;
    Vector3 stepFrom,shownPlant;double stepAt=-1,stepLength,plantClock=-1;bool stepTrack;Quaternion plantTurn=Quaternion.identity;
    Vector3 OnTurf(Vector3 p){if(ground!=null&&ground.Calibrated)p.y=root.position.y+ground.ankle*root.lossyScale.y;return p;}
    void PlantStep(Vector3 from,double clock,bool track){stepFrom=from;stepAt=clock;stepTrack=track;stepLength=Math.Clamp(Vector3.Distance(from,anchor)/PlantStepSpeed,PlantStepShortest,PlantStepLongest);}
    public void Plant(bool right=false,double clock=-1,Vector3? shown=null,bool up=false){
        var upper=right?rightUpper:leftUpper;var lower=right?rightLower:leftLower;var end=right?rightFoot:leftFoot;
        if(!planted||plantRight!=right){
            if(shown.HasValue&&clock>=0&&up){planted=false;plantError=0;stepAt=-1;plantClock=-1;if(ground!=null&&ground.Calibrated){float lift=ground.SoleDeficit(right?1:0);if(lift>.002f)PlaceFoot(right?1:0,end.position+root.up*lift);}return;}
            planted=true;plantRight=right;stepAt=-1;
            if(shown.HasValue&&clock>=0){anchor=OnTurf(shown.Value);if(Vector3.Distance(shown.Value,anchor)>PlantStepMin)PlantStep(shown.Value,clock,false);}
            else anchor=OnTurf(end.position);
        }else{
            if(plantClock>=0&&clock>plantClock){var yaw=root.rotation*Quaternion.Inverse(plantTurn);if(Quaternion.Angle(Quaternion.identity,yaw)/(float)(clock-plantClock)>FootballAnimation.PivotRate){var at=root.position;anchor=at+yaw*(anchor-at);stepFrom=at+yaw*(stepFrom-at);shownPlant=at+yaw*(shownPlant-at);}}
            if(stepAt>=0&&(clock-stepAt>=stepLength||clock<stepAt))stepAt=-1;
            if(stepAt>=0&&stepTrack)anchor=OnTurf(end.position);
            else if(stepAt<0&&clock>=0&&Vector3.Distance(anchor,end.position)>PlantFade){anchor=OnTurf(end.position);PlantStep(shownPlant,clock,true);}
        }
        plantTurn=root.rotation;plantClock=clock;
        var aim=anchor;
        // The arc lifts with the step's horizontal travel (a foot shown above its anchor only sets down), and the
        // leg is solved with the foot locks' knee pole (KneePole), so the plant and the lock that takes over from
        // it bend the same knee (the default pole turned the thigh 31 degrees in the handover picture).
        float arcLift=0;if(stepAt>=0){float q=(float)((clock-stepAt)/stepLength),m=Mathf.Clamp01((q-(1-FootballAnimation.ArcTravel)*.5f)/FootballAnimation.ArcTravel),sm=m*m*(3-2*m),travel=Vector3.ProjectOnPlane(anchor-stepFrom,root.up).magnitude;arcLift=PlantStepLift*Mathf.Clamp01(travel/PlantStepFull)*(1-Mathf.Pow(2*q-1,4));aim=Vector3.Lerp(stepFrom,anchor,sm)+root.up*arcLift;}
        // r16: the ankle height of the aim sets the foot's lowest sole point (heel or toe, as the clip turns it) on
        // the turf (plus the arc): aimed at the rest ankle height, a toe-down standing foot was lifted off its anchor
        // again by its sole deficit (plant error 0.035-0.04 m in the planted receive). Horizontal anchor unchanged.
        var held=anchor;if(ground!=null&&ground.Calibrated){int g=right?1:0;float low=Mathf.Min(ground.AnkleClearance(g),ground.ToeClearance(g));held.y=end.position.y-low;aim.y=held.y+(stepAt>=0?aim.y-anchor.y:0);}
        Solve(upper,lower,end,aim,KneePole(right?1:0));
        if(ground!=null&&ground.Calibrated){float d=ground.SoleDeficit(right?1:0);if(d>.002f)PlaceFoot(right?1:0,end.position+root.up*d);
            // r16: the step arc lifts the sole's lowest point, not only the ankle: a toe-down standing foot
            // kept its toe on the turf and skimmed a 0.53 m re-step at up to 4.5 m/s (clearance <= 1.8 cm).
            int g=right?1:0;float low=Mathf.Min(ground.AnkleClearance(g),ground.ToeClearance(g));if(arcLift-low>.002f)PlaceFoot(g,end.position+root.up*(arcLift-low));}
        shownPlant=end.position;plantError=Vector3.Distance(held,end.position);
    }
    // weight below one blends between the authored (FK) and the solved limb.
    // record=false is a release frame: it leaves the reported contact untouched.
    // Largest thigh or shin turn (degrees) of the last recorded foot contact solve against its sampled leg.
    readonly float[] legTurn=new float[2];
    public float LegTurn(int f)=>legTurn[f];
    // r18: the leg shown in the last picture, relative to the actor root: thigh and shin rotations, hip and ankle.
    public struct ShownLeg {public bool known;public Quaternion upper,lower;public Vector3 hip,ankle;}
    // r18 diagnostics of the last foot contact solve against the shown leg (degrees per picture; -1 unknown): the larger
    // of thigh and shin turn of the R16 solve (sampled thigh turned to the knee in the shown bend plane, the shin carried
    // by it), of the least-rotation solve, the least bone-direction turn over the swivel (a twist-free bound) and the
    // chord bound of the ankle's own move about the hip; swivelAngle: chosen swivel from the shown bend plane (degrees).
    public float swivelPole=-1,swivelLeast=-1,swivelDirect=-1,swivelChord=-1,swivelAngle;
    public void ClearSwivel(){swivelPole=swivelLeast=swivelDirect=swivelChord=-1;swivelAngle=0;}
    // pole: the knee's bend direction for a foot solve (default: the sampled thigh across the hip-point line).
    // shown: the leg shown in the last picture; a foot contact or release then turns thigh and shin least from it (LeastLeg).
    public Vector3 Contact(Vector3 point,string kind,float weight=1,bool record=true,bool extend=false,Vector3? pole=null,ShownLeg shown=default){
        weight=Mathf.Clamp01(weight);
        if(kind=="head"){
            if(head==null||spine==null)return point;
            float before=Vector3.Distance(head.position,point);Head(point,weight);
            if(record){reachable=Vector3.Distance(head.position,point)<before||before<.3f;contactError=Vector3.Distance(head.position,point);}return head.position;
        }
        if(kind=="two-hands"){
            // Both palms meet an actual central ball; each stays within its arm length.
            var side=root.right*.11f;bool right=CanReach(arm,forearm,hand,point+side),left=CanReach(leftArm,leftForearm,leftHand,point-side);
            if(right)Blend(arm,forearm,hand,point+side,weight);if(left)Blend(leftArm,leftForearm,leftHand,point-side,weight);
            var middle=(hand.position+leftHand.position)/2;if(record){reachable=right&&left;contactError=Vector3.Distance(middle,point);}return middle;
        }
        bool leftFootKind=kind=="left-foot",leftSave=kind=="left-hand";var upper=leftSave?leftArm:kind=="hand"?arm:leftFootKind?leftUpper:rightUpper;var lower=leftSave?leftForearm:kind=="hand"?forearm:leftFootKind?leftLower:rightLower;var end=leftSave?leftHand:kind=="hand"?hand:leftFootKind?leftFoot:rightFoot;
        var upperBefore=upper.rotation;var lowerBefore=lower.rotation;
        // extend: the release of a foot contact that met its point keeps blending
        // toward it when it leaves the leg's reach for a picture (Solve extends the
        // leg toward it): switching the blend off popped the follow-through boot
        // 0.24 m up and back (2464 deg/s hip). A contact that never reached its
        // point has nothing to return from.
        bool canReach=CanReach(upper,lower,end,point);
        if(canReach||extend&&(kind=="foot"||leftFootKind)){
            if((kind=="foot"||leftFootKind)&&shown.known&&weight>0)LeastLeg(upper,lower,end,point,weight,pole,shown);
            else Blend(upper,lower,end,point,weight,kind=="foot"||leftFootKind?pole:null);}
        if(record){reachable=canReach;contactError=Vector3.Distance(end.position,point);if(kind=="foot"||leftFootKind)legTurn[leftFootKind?0:1]=Mathf.Max(Quaternion.Angle(upperBefore,upper.rotation),Quaternion.Angle(lowerBefore,lower.rotation));}return end.position;
    }
    // r18: the leg as shown now, relative to the actor root.
    public ShownLeg Leg(int f){var unturn=Quaternion.Inverse(root.rotation);var upper=f==0?leftUpper:rightUpper;var lower=f==0?leftLower:rightLower;var foot=f==0?leftFoot:rightFoot;return new ShownLeg{known=true,upper=unturn*upper.rotation,lower=unturn*lower.rotation,hip=unturn*(upper.position-root.position),ankle=unturn*(foot.position-root.position)};}
    // Thigh and shin (world) of a two-bone solve toward point with the knee toward pole (unit, across the hip-point line),
    // Solve's geometry from the current bones (hip, knee, ankle, u0, l0), without moving a bone. least: thigh and shin
    // each turned least from fromUpper/fromLower (the shown leg) and slerped from the current bones by weight; otherwise
    // the R16 solve: Solve (the shin carried by the thigh's turn) and Blend's slerps.
    // Diagnostics: LegRotations evaluations since start (editor tests time the solve per evaluation).
    public static long LegEvaluations {get;private set;}
    static void LegRotations(Vector3 hip,Vector3 knee,Vector3 ankle,Quaternion u0,Quaternion l0,Vector3 point,Vector3 pole,float w,bool least,Quaternion fromUpper,Quaternion fromLower,out Quaternion u,out Quaternion l){
        LegEvaluations++;
        float a=Vector3.Distance(hip,knee),b=Vector3.Distance(knee,ankle);var direction=(point-hip).normalized;float d=Mathf.Clamp(Vector3.Distance(hip,point),Mathf.Abs(a-b)+.00001f,a+b-.00001f),along=(a*a-b*b+d*d)/(2*d),height=Mathf.Sqrt(Mathf.Max(0,a*a-along*along));
        var wanted=hip+direction*along+pole*height;
        if(least){var us=Quaternion.FromToRotation(fromUpper*(Quaternion.Inverse(u0)*(knee-hip)),wanted-hip)*fromUpper;var ls=Quaternion.FromToRotation(fromLower*(Quaternion.Inverse(l0)*(ankle-knee)),hip+direction*d-wanted)*fromLower;
            if(w>=1){u=us;l=ls;}else{u=Quaternion.Slerp(u0,us,w);l=Quaternion.Slerp(l0,ls,w);}return;}
        var r1=Quaternion.FromToRotation(knee-hip,wanted-hip);var u1=r1*u0;var kneeNow=hip+r1*(knee-hip);var ankleNow=hip+r1*(ankle-hip);
        var l1=Quaternion.FromToRotation(ankleNow-kneeNow,hip+direction*d-kneeNow)*(r1*l0);
        if(w>=1){u=u1;l=l1;return;}u=Quaternion.Slerp(u0,u1,w);l=Quaternion.Slerp(l0,u*Quaternion.Inverse(u1)*l1,w);
    }
    // A knee bent backward (against the pelvis forward across the hip-ankle line) costs this many degrees per unit.
    public const float KneeBackCost=3000;
    // r18: a foot contact (and its release) turns thigh and shin least from the leg shown in the last picture, relative to
    // the root. The boot's point fixes the hip-ankle line and the bone lengths the knee's distance from it; the knee's
    // swivel about the line is free, and so is each bone's twist about its own axis. Each bone turns least from its shown
    // direction (FromToRotation of the shown bone), so its quaternion turn is the angle between its shown and its new
    // direction and the shown twist carries over; over the swivel phi both cosines are sinusoids (thigh (along*axis +
    // h*p)/a, shin ((d-along)*axis - h*p)/b, p = cos phi e0 + sin phi e1), and the swivel is chosen for the smaller of
    // the larger turn: a 5 degree scan of the whole turn, then a golden-section refinement around the best, in scalar
    // arithmetic, and one solve (a release refines by its blended turn, below). The knee's forward half-space (KneePole) is a cost that fades as the line turns along the
    // pelvis forward (continuous at a straight leg, where every swivel gives the same knee). Measured on the rig: R16 kept
    // the shown bend plane and carried the shin by the thigh's turn (a native second receive 0.25 s after the first, its
    // new point 0.43 m from the boot: 2264 deg/s shin; the swivel alone 2209, the twist-free bound 1933), now 1485
    // (160112-field-2 77.117) and 1819 -> 1230 (160114-field-8 30.667). The shin turned least from its sampled direction
    // instead kept the clip's twist against a shown ready reach (a pass entry 301 -> 1999 deg/s). The point, the contact
    // time and every received fact are unchanged; no angle is limited. Allocation-free.
    void LeastLeg(Transform upper,Transform lower,Transform end,Vector3 point,float w,Vector3? pole,ShownLeg shown){
        var hip=upper.position;var knee=lower.position;var ankle=end.position;var u0=upper.rotation;var l0=lower.rotation;
        var axis=point-hip;if(axis.sqrMagnitude<1e-8f){Blend(upper,lower,end,point,w,pole);return;}axis.Normalize();
        var e0=Vector3.ProjectOnPlane(pole??(knee-hip),axis);if(e0.sqrMagnitude<1e-8f)e0=Vector3.ProjectOnPlane(upper.forward,axis);if(e0.sqrMagnitude<1e-8f)e0=Vector3.ProjectOnPlane(root.forward,axis);if(e0.sqrMagnitude<1e-8f)e0=Vector3.ProjectOnPlane(root.right,axis);e0.Normalize();var e1=Vector3.Cross(axis,e0);
        var up=root.up;var ahead=Vector3.ProjectOnPlane(Vector3.Cross(rightUpper.position-leftUpper.position,up),up);if(ahead.sqrMagnitude<1e-6f)ahead=Vector3.ProjectOnPlane(root.forward,up);var front=Vector3.ProjectOnPlane(ahead.normalized,axis);
        var unturn=Quaternion.Inverse(root.rotation);var shownUpper=root.rotation*shown.upper;var shownLower=root.rotation*shown.lower;
        var ts=shownUpper*(Quaternion.Inverse(u0)*(knee-hip)).normalized;var ss=shownLower*(Quaternion.Inverse(l0)*(ankle-knee)).normalized;
        float a=Vector3.Distance(hip,knee),b=Vector3.Distance(knee,ankle),d=Mathf.Clamp(Vector3.Distance(hip,point),Mathf.Abs(a-b)+.00001f,a+b-.00001f),along=(a*a-b*b+d*d)/(2*d),h=Mathf.Sqrt(Mathf.Max(0,a*a-along*along));
        float t0=along*Vector3.Dot(axis,ts)/a,tc=h*Vector3.Dot(e0,ts)/a,tn=h*Vector3.Dot(e1,ts)/a,s0=(d-along)*Vector3.Dot(axis,ss)/b,sc=-h*Vector3.Dot(e0,ss)/b,sn=-h*Vector3.Dot(e1,ss)/b,fc=Vector3.Dot(e0,front),fn=Vector3.Dot(e1,front);
        float Turn(float phi){float c=Mathf.Cos(phi),n=Mathf.Sin(phi);return Mathf.Acos(Mathf.Clamp(Mathf.Min(t0+tc*c+tn*n,s0+sc*c+sn*n),-1,1))*Mathf.Rad2Deg;}
        float Cost(float phi){float back=-(Mathf.Cos(phi)*fc+Mathf.Sin(phi)*fn);float turn=Turn(phi);return back>0?turn+KneeBackCost*back:turn;}
        const float step=Mathf.PI/36;float best=0,bestCost=float.MaxValue,leastTurn=float.MaxValue;
        for(int k=0;k<72;k++){float phi=k*step,c=Cost(phi);leastTurn=Mathf.Min(leastTurn,Turn(phi));if(c<bestCost){bestCost=c;best=phi;}}
        float lo=best-step,hi=best+step;const float g=.618034f;float x1=hi-g*(hi-lo),x2=lo+g*(hi-lo),c1=Cost(x1),c2=Cost(x2);
        for(int k=0;k<16;k++){if(c1<c2){hi=x2;x2=x1;c2=c1;x1=hi-g*(hi-lo);c1=Cost(x1);}else{lo=x1;x1=x2;c1=c2;x2=lo+g*(hi-lo);c2=Cost(x2);}}
        float chosen=c1<c2?x1:x2;if(Mathf.Min(c1,c2)>bestCost)chosen=best;
        // A release (weight below one) slerps from the current bones: there the bone directions are no longer the whole turn,
        // and the swivel is refined around the scan's best by the blended quaternion turn itself (golden section, 14 solves).
        if(w<1){float Blended(float phi){var q=Mathf.Cos(phi)*e0+Mathf.Sin(phi)*e1;LegRotations(hip,knee,ankle,u0,l0,point,q,w,true,shownUpper,shownLower,out var ub,out var lb);float back=-Vector3.Dot(q,front);float turn=Mathf.Max(Quaternion.Angle(unturn*ub,shown.upper),Quaternion.Angle(unturn*lb,shown.lower));return back>0?turn+KneeBackCost*back:turn;}
            float centre=chosen,c0b=Blended(centre);lo=centre-2*step;hi=centre+2*step;x1=hi-g*(hi-lo);x2=lo+g*(hi-lo);c1=Blended(x1);c2=Blended(x2);
            for(int k=0;k<12;k++){if(c1<c2){hi=x2;x2=x1;c2=c1;x1=hi-g*(hi-lo);c1=Blended(x1);}else{lo=x1;x1=x2;c1=c2;x2=lo+g*(hi-lo);c2=Blended(x2);}}
            if(Mathf.Min(c1,c2)<c0b)chosen=c1<c2?x1:x2;}
        var pc=Mathf.Cos(chosen)*e0+Mathf.Sin(chosen)*e1;
        LegRotations(hip,knee,ankle,u0,l0,point,pc,w,true,shownUpper,shownLower,out var uc,out var lc);var c0=end.rotation;upper.rotation=uc;lower.rotation=lc;end.rotation=c0;
        // Diagnostics: the applied turn, the R16 solve of this picture, the twist-free bound, the chord bound and the swivel.
        swivelLeast=Mathf.Max(Quaternion.Angle(unturn*uc,shown.upper),Quaternion.Angle(unturn*lc,shown.lower));swivelDirect=Mathf.Min(leastTurn,Turn(chosen));swivelAngle=Mathf.DeltaAngle(0,chosen*Mathf.Rad2Deg);
        LegRotations(hip,knee,ankle,u0,l0,point,e0,w,false,u0,l0,out var u16,out var l16);swivelPole=Mathf.Max(Quaternion.Angle(unturn*u16,shown.upper),Quaternion.Angle(unturn*l16,shown.lower));
        swivelChord=2*Mathf.Asin(Mathf.Clamp01((unturn*(axis*d)-(shown.ankle-shown.hip)).magnitude/(2*(a+b))))*Mathf.Rad2Deg;
    }
    // Bends spine and head toward an actual header contact, at most HeadReach degrees.
    void Head(Vector3 point,float weight){
        var from=head.position-spine.position;var to=point-spine.position;if(from.sqrMagnitude<1e-6f||to.sqrMagnitude<1e-6f)return;
        var full=Quaternion.FromToRotation(from,to);full.ToAngleAxis(out float angle,out var axis);if(angle>180)angle-=360;
        float limited=Mathf.Clamp(angle,-HeadReach,HeadReach)*weight;if(Mathf.Abs(limited)<.001f)return;
        spine.rotation=Quaternion.AngleAxis(limited,axis)*spine.rotation;
    }
    static void Blend(Transform upper,Transform lower,Transform end,Vector3 point,float weight,Vector3? poleDirection=null){
        if(weight>=1){Solve(upper,lower,end,point,poleDirection);return;}if(weight<=0)return;
        var a=upper.rotation;var b=lower.rotation;var c=end.rotation;Solve(upper,lower,end,point,poleDirection);
        upper.rotation=Quaternion.Slerp(a,upper.rotation,weight);lower.rotation=Quaternion.Slerp(b,lower.rotation,weight);end.rotation=c;
    }
    public static bool CanReach(Transform upper,Transform lower,Transform end,Vector3 point){float a=Vector3.Distance(upper.position,lower.position),b=Vector3.Distance(lower.position,end.position),d=Vector3.Distance(upper.position,point);return d>=Math.Abs(a-b)+.00001&&d<=a+b-.00001;}
    public static Vector3 Solve(Transform upper,Transform lower,Transform end,Vector3 point,Vector3? poleDirection=null){
        var hip=upper.position;var knee=lower.position;float a=Vector3.Distance(hip,knee),b=Vector3.Distance(knee,end.position);var direction=(point-hip).normalized;float d=Mathf.Clamp(Vector3.Distance(hip,point),Mathf.Abs(a-b)+.00001f,a+b-.00001f),along=(a*a-b*b+d*d)/(2*d),height=Mathf.Sqrt(Mathf.Max(0,a*a-along*along));var pole=Vector3.ProjectOnPlane(poleDirection??(knee-hip),direction);if(pole.sqrMagnitude<1e-8)pole=Vector3.ProjectOnPlane(upper.forward,direction);pole.Normalize();var wantedKnee=hip+direction*along+pole*height;var rotation=end.rotation;upper.rotation=Quaternion.FromToRotation(lower.position-hip,wantedKnee-hip)*upper.rotation;lower.rotation=Quaternion.FromToRotation(end.position-lower.position,hip+direction*d-lower.position)*lower.rotation;end.rotation=rotation;return end.position;
    }
}
}

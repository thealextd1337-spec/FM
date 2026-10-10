using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Animations;
using UnityEngine.Playables;
namespace Doppel6.Probe {
// This envelope reads completed native contacts, never guesses the next action.
public static class FootballActionTiming {
    public static bool IsFootAction(string action){return action=="pass"||action=="highPass"||action=="cross"||action=="receive"||action=="control"||action=="passReady"||action=="shot"||action=="freeKick"||action=="volley"||action=="goalKick"||action=="kickReady"||action=="tackle";}
    public static float Weight(string action,double age,double progress,float speed){
        if(action=="passReady"||action=="kickReady")return (float)(.25+.75*Math.Clamp(progress,0,1));
        bool receive=action=="receive"||action=="control",shot=action=="shot"||action=="freeKick"||action=="volley"||action=="goalKick";
        double contact=receive?.12:.09,end=shot?(speed>.4?.48:.70):receive?(speed>.4?.30:.44):(speed>.4?.30:.46);
        var t=Math.Clamp((age-contact)/(end-contact),0,1);return (float)(1-t*t*(3-2*t));
    }
}
public static class FootballStrideTiming {
    // Clips are aligned at their measured left footfall, so a walk, jog, run or
    // sprint exchange keeps the same foot on the ground at the same cycle value.
    public static double Time(double cycles,AnimationClip clip,float footfall=0){return (cycles+footfall)*Math.Max(.001,clip.length-.001);}
}
// Measured gait of an authored clip on the actual rig: metres per cycle that a
// planted foot portrays and the normalised left/right footfall times.
public static class FootballStride {
    // heading: measured travel direction the planted feet portray, in degrees
    // relative to the actor's forward (0 forward, about 180 backward); NaN when
    // no planted foot moves. A clip name never decides its direction.
    public struct Gait {public float stride,left,right,heading;}
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
        return new Gait{stride=speed*clip.length,left=footfall[0],right=footfall[1],heading=heading};
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
    public struct Pose {public AnimationClip clip,baseClip,cycleClip;public double time,baseTime,cycles,sidePhase;public bool loop,baseLoop,plant,contact,urgent,leftLead,ballHeld,lockFeet,settle,keeperStance,cyclesKnown;public bool actionOverStride,gatherKnown;public float gather;public Vector3 gatherFrom;public float support,actionWeight,forwardLean,turnLean,recoveryLean,strideYaw,strideScale,brake,pelvisYaw,legYaw,directionWeight,sideWeight,sideLength,drive,fade,keeperDive,contactWeight,slide,lunge,airLift,airReach,airTuck,airCrouch,airArms,loft,volley,throwBend,throwRaise,throwArch,throwRelease;public string key,kind;public Vector3 target;}
    // A native contact releases over this much match time instead of popping.
    public const double ContactRelease=.10;
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
    readonly bool[] locked=new bool[2],arc=new bool[2],lockedToe=new bool[2];readonly Vector3[] anchor=new Vector3[2],releaseStart=new Vector3[2],correction=new Vector3[2];readonly double[] lockedAt={-1,-1},releasedAt={-1,-1};
    public const float LockOn=.025f,LockOff=.035f,LockDrift=.25f,SettleOffset=.05f,SettleLift=.05f;
    public const double LockRelease=.08,SettleStep=.2;
    // Largest horizontal correction of a planted sole this frame (metres, diagnostics).
    public float FootLockOffset {get;private set;}
    // Diagnostics: per foot L/R locked, l/r free; t toe or a ankle contact; + releasing.
    public string FootLockState=>(locked[0]?"L":"l")+(lockedToe[0]?"t":"a")+(releasedAt[0]>=0?"+":"")+" "+(locked[1]?"R":"r")+(lockedToe[1]?"t":"a")+(releasedAt[1]>=0?"+":"");
    public float Weight(AnimationClip clip){return clip!=null&&indices.TryGetValue(clip,out var index)?weights[index]:0;}
    public float GroundShift {get;private set;}
    // Pelvis drop of the walking support in the last sample (metres, diagnostics).
    public float SupportDrop {get;private set;}
    public const float SupportLimit=.07f;
    public float ReleaseWeight {get;private set;}
    public readonly FootballRig rig;
    public readonly FootballGround ground;
    public float RootHeight=>ground.RootHeight;
    public float StrideLength(AnimationClip clip)=>ground.StrideLength(clip);
    public float Footfall(AnimationClip clip)=>ground.Footfall(clip);
    public float RightFootfall(AnimationClip clip)=>ground.RightFootfall(clip);
    public double StrideTime(double cycles,AnimationClip clip)=>FootballStrideTiming.Time(cycles,clip,ground.Footfall(clip));
    public FootballAnimation(PlayableGraph graph,Transform actor,IEnumerable<AnimationClip> catalogue){
        this.graph=graph;root=actor;rig=new FootballRig(actor);ground=new FootballGround(actor);rig.ground=ground;hips=Array.Find(actor.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:Hips");
        foreach(var clip in catalogue)if(clip!=null&&!indices.ContainsKey(clip))indices.Add(clip,indices.Count);
        weights=new float[indices.Count];start=new float[indices.Count];cyclic=new bool[indices.Count];sources=new AnimationClip[indices.Count];mixer=AnimationMixerPlayable.Create(graph,indices.Count);
        foreach(var entry in indices){var playable=AnimationClipPlayable.Create(graph,entry.Key);playable.SetApplyFootIK(false);playable.SetApplyPlayableIK(false);clips.Add(playable);sources[entry.Value]=entry.Key;graph.Connect(playable,0,mixer,entry.Value);}
        graph.GetOutput(0).SetSourcePlayable(mixer);
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
    public void Sample(Pose pose,double clock,bool cut=false){
        if(pose.clip==null||!indices.TryGetValue(pose.clip,out var index))throw new InvalidOperationException("Football clip is missing");
        if(!cut&&clock==lastClock)return;
        int baseIndex=-1;float actionWeight=1;
        if(pose.baseClip!=null){if(!indices.TryGetValue(pose.baseClip,out baseIndex))throw new InvalidOperationException("Football stride clip is missing");actionWeight=Mathf.Clamp01(pose.actionWeight);if(baseIndex==index){baseIndex=-1;actionWeight=1;}}
        bool reset=cut||lastClock<0||clock<lastClock||clock-lastClock>1;
        if(reset){Array.Clear(weights,0,weights.Length);weights[index]=actionWeight;if(baseIndex>=0)weights[baseIndex]=1-actionWeight;Array.Copy(weights,start,weights.Length);selected=index;baseSelected=baseIndex;changed=clock;key=pose.key;rig.Release();releaseFrom=-1;ClearLocks();}
        else if(selected!=index||baseSelected!=baseIndex){Array.Copy(weights,start,weights.Length);selected=index;baseSelected=baseIndex;changed=clock;}
        if(key!=pose.key){rig.Release();key=pose.key;releaseFrom=-1;}
        int cycleIndex=-1;if(pose.cycleClip!=null&&indices.TryGetValue(pose.cycleClip,out cycleIndex))cyclic[cycleIndex]=true;
        // Real match time drives both the sample and the fade, so a pause freezes bones.
        // A received contact cannot wait for a cosmetic crossfade. A keeper
        // launch uses a short response; ordinary movement keeps a softer blend.
        float fade=pose.contact?1:(float)Math.Clamp((clock-changed)/(pose.urgent?.035:pose.fade>0?pose.fade:.12),0,1);
        if(!reset)for(int i=0;i<weights.Length;i++)weights[i]=Mathf.Lerp(start[i],i==selected?actionWeight:i==baseSelected?1-actionWeight:0,fade);
        for(int i=0;i<clips.Count;i++){
            mixer.SetInputWeight(i,weights[i]);
            if(i==index||i==baseIndex){var clip=i==index?pose.clip:pose.baseClip;double time=i==index?pose.time:pose.baseTime;bool loop=i==index?pose.loop:pose.baseLoop;double end=Math.Max(.001,clip.length-.001);clips[i].SetTime(loop?(time%end+end)%end:Math.Clamp(time,0,end));}
            // A fading stride clip stays on the shared footfall cycle, so walk,
            // jog, run and back strides exchange with the same foot down.
            else if(cyclic[i]&&pose.cyclesKnown&&weights[i]>0){double end=Math.Max(.001,sources[i].length-.001),time=StrideTime(pose.cycles,sources[i]);clips[i].SetTime((time%end+end)%end);}
            else if(lastClock>=0&&clock>lastClock)clips[i].SetTime(clips[i].GetTime()+clock-lastClock);
        }
        graph.Evaluate(0);
        // Measured floating clips are lowered onto the pitch, weighted like the mixer.
        float shift=0;for(int i=0;i<weights.Length;i++)shift+=weights[i]*ground.Of(sources[i]);
        GroundShift=shift;if(shift>0&&hips!=null)hips.position-=root.up*shift;
        bool full=pose.contactWeight<=0||pose.contactWeight>=1;
        // Bone-only response to observed motion. Full contacts and planted
        // actions retain their authored pose; a partial carrier reach keeps the
        // stride direction and lean. The root remains game-owned.
        if(!pose.plant&&(!pose.contact||!full)){
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
        }
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
        void Support(){if(!supported)return;float lift=Mathf.Min(ground.SupportClearance(0),ground.SupportClearance(1));if(lift<=.002f)return;float d=Mathf.Min(lift,SupportLimit-SupportDrop)*Mathf.Clamp01(pose.support);if(d<=0)return;hips.position-=root.up*d;SupportDrop+=d;}
        Support();
        FootLock(pose,clock);
        Support();
        // A locomotion or kick pose never puts a sole into the turf (measured on
        // brake_meshy: toes up to 0.18 m below): the leg is lifted, not stretched.
        if(pose.lockFeet&&!pose.plant)for(int f=0;f<2;f++){float d=ground.SoleDeficit(f);if(d>.004f)rig.PlaceFoot(f,rig.Ankle(f).position+root.up*d);}
        if(pose.keeperDive!=0)rig.KeeperDive(pose.keeperDive,pose.target);
        if(pose.lunge>0)rig.Lunge(pose.lunge);
        if(pose.airLift>0||pose.airCrouch>0||pose.airTuck>0||pose.airArms>0)rig.Air(pose.airLift,pose.airReach,pose.airTuck,pose.airCrouch,pose.airArms);else rig.ClearAir();
        if(pose.loft>0||pose.volley>0)rig.FollowThrough(pose.loft,pose.volley);
        if(pose.throwBend>0||pose.throwRaise>0||pose.throwArch>0||pose.throwRelease>0)rig.Throw(pose.throwBend,pose.throwRaise,pose.throwArch,pose.throwRelease);
        if(pose.contact&&full)rig.PrepareContact(pose.target,pose.kind);
        if(pose.plant)rig.Plant(pose.kind=="left-foot");else rig.Release();
        if(pose.slide>0)rig.Slide(pose.slide,pose.target,pose.leftLead);
        ReleaseWeight=0;
        if(pose.ballHeld){rig.GatherBall(pose.gatherKnown?pose.gatherFrom:(Vector3?)null,pose.gatherKnown?pose.gather:1);releaseFrom=-1;}
        else if(pose.contact){
            rig.Contact(pose.target,pose.kind,full?1:pose.contactWeight);
            // Only a full native contact releases gradually; the next frames keep
            // the limb near the actual contact point and return within 0.1 s.
            if(full){releaseFrom=clock;releaseKind=pose.kind;releaseTarget=pose.target;}else releaseFrom=-1;
        }else if(releaseFrom>=0&&clock>releaseFrom&&clock-releaseFrom<ContactRelease){
            float q=(float)((clock-releaseFrom)/ContactRelease);ReleaseWeight=1-q*q*(3-2*q);
            rig.Contact(releaseTarget,releaseKind,ReleaseWeight,false);
        }else releaseFrom=-1;
        lastClock=clock;
    }
    // A descending foot plants only once the sampled sole has nearly stopped in
    // the world (not while it still swings forward close to the turf).
    Vector3 lockRoot;readonly Vector3[] lastPoint=new Vector3[2],applied=new Vector3[2];readonly Quaternion[] appliedTurn={Quaternion.identity,Quaternion.identity},releaseTurn={Quaternion.identity,Quaternion.identity};double lastLockClock=-1;
    void ClearLocks(){lastLockClock=-1;for(int f=0;f<2;f++){locked[f]=arc[f]=lockedToe[f]=false;correction[f]=Vector3.zero;lockedAt[f]=releasedAt[f]=-1;}FootLockOffset=0;}
    // A sole that the sampled pose sets on the pitch keeps its world point
    // until the pose lifts it (or the body has moved LockDrift away); the
    // release blends back to the sampled foot within LockRelease. Only bones
    // move: the received root, facing and contact points are untouched.
    // The planted contact point (heel/ankle or, once the heel rises, the toe)
    // keeps its pitch point: the foot rolls over it instead of sliding. The
    // lock ends when the pose lifts the whole foot (blend back within
    // LockRelease), when the body has moved LockDrift away (the foot then takes
    // a short step instead of sliding) or, for a stopped body, as a settle step.
    void FootLock(Pose pose,double clock){
        FootLockOffset=0;
        // A received jump of the root (restart, substitution, reload) is no step.
        var moved=root.position-lockRoot;moved.y=0;lockRoot=root.position;if(moved.magnitude>1.5f)ClearLocks();
        double step=lastLockClock>=0&&clock>lastLockClock?clock-lastLockClock:0;lastLockClock=clock;float rootSpeed=step>0?moved.magnitude/(float)step:0;
        if(!pose.lockFeet||pose.plant||pose.ballHeld||pose.slide>0||pose.airLift>0||pose.keeperDive!=0){ClearLocks();return;}
        var offsets=new float[2];for(int f=0;f<2;f++)offsets[f]=locked[f]?Flat(correction[f]).magnitude:0;
        // A stride clip whose stance sole floats (back_walk: left foot 2.3 cm
        // at its lowest) plants relative to that measured float, weighted by
        // the stride share of the mix; walking only (a running flight is no float).
        var floats=new float[2];for(int i=0;i<weights.Length;i++)if(cyclic[i]&&weights[i]>0)for(int f=0;f<2;f++)floats[f]+=weights[i]*ground.FootFloat(sources[i],f)*Mathf.Clamp01(pose.support);
        for(int f=0;f<2;f++){
            float ankle=ground.AnkleClearance(f),toe=ground.ToeClearance(f),clearance=Mathf.Min(ankle,toe);int other=1-f;
            bool onToe=toe<ankle-.005f;var toePoint=rig.Toe(f).position;var anklePoint=rig.Ankle(f).position;var point=onToe?toePoint:anklePoint;
            bool otherReleasing=releasedAt[other]>=0&&clock-releasedAt[other]<(arc[other]?SettleStep:LockRelease);
            if(locked[f]){
                // Heel to toe: re-anchor the new contact point where it is shown now.
                // Carry over the shift that keeps the old contact point anchored in this frame.
                if(onToe!=lockedToe[f]){var held=Flat(anchor[f]-(lockedToe[f]?toePoint:anklePoint));anchor[f]=point+held;lockedToe[f]=onToe;}
                correction[f]=Flat(anchor[f]-point);offsets[f]=correction[f].magnitude;
                bool lift=clearance>LockOff+floats[f],drift=offsets[f]>LockDrift;
                // A stopped body closes its stance one foot at a time.
                bool settle=!lift&&pose.settle&&offsets[f]>SettleOffset&&clock-lockedAt[f]>.1&&!otherReleasing&&(offsets[f]>=offsets[other]||!locked[other]);
                // The release starts from what was actually shown last frame
                // (position incl. a heel-off lift, and foot turn), never a jump.
                if(lift||drift||settle){locked[f]=false;releasedAt[f]=offsets[f]>2*LockDrift?-1:clock;releaseStart[f]=applied[f];releaseTurn[f]=appliedTurn[f];arc[f]=!lift;}
            }else if(clearance<LockOn+floats[f]&&(releasedAt[f]<0||clock-releasedAt[f]>=(arc[f]?SettleStep:LockRelease))&&(step<=0||Flat(point-lastPoint[f]).magnitude/(float)step<.3f+.65f*rootSpeed)){locked[f]=true;anchor[f]=point;lockedToe[f]=onToe;correction[f]=Vector3.zero;lockedAt[f]=clock;releasedAt[f]=-1;arc[f]=false;}
            lastPoint[f]=point;
            var shownBefore=applied[f];var turnBefore=appliedTurn[f];var sampledAnkle=anklePoint;var sampledTurn=rig.Ankle(f).rotation;applied[f]=Vector3.zero;appliedTurn[f]=Quaternion.identity;
            Vector3 shift;float raise=0;var turn=Quaternion.identity;
            if(locked[f]){
                shift=correction[f];
                // Push-off beyond the leg's reach: the toe stays on its pitch point
                // and the heel rises (ankle on the reach sphere, foot turned to the toe).
                if(!rig.CanPlaceFoot(f,anklePoint+shift)){
                    if(lockedToe[f]&&rig.HeelOff(f,new Vector3(anchor[f].x,toePoint.y,anchor[f].z),anklePoint+shift)){FootLockOffset=Mathf.Max(FootLockOffset,shift.magnitude);applied[f]=rig.Ankle(f).position-sampledAnkle;appliedTurn[f]=rig.Ankle(f).rotation*Quaternion.Inverse(sampledTurn);continue;}
                    // Out of reach even with a raised heel: the foot leaves its pitch
                    // point and blends back from what was shown last frame (a
                    // dragged anchor alternating with a heel-off turned the foot
                    // by up to 25 degrees in one picture).
                    if(lockedToe[f]){locked[f]=false;releasedAt[f]=clock;releaseStart[f]=shownBefore;releaseTurn[f]=turnBefore;arc[f]=false;shift=releaseStart[f];turn=releaseTurn[f];if(shift.sqrMagnitude>1e-8f)rig.PlaceFoot(f,rig.Ankle(f).position+shift);rig.Ankle(f).rotation=turn*rig.Ankle(f).rotation;FootLockOffset=Mathf.Max(FootLockOffset,Flat(shift).magnitude);continue;}
                    float lo=0,hi=1;for(int k=0;k<7;k++){float mid=(lo+hi)*.5f;if(rig.CanPlaceFoot(f,anklePoint+shift*mid))lo=mid;else hi=mid;}
                    anchor[f]-=shift*(1-lo);shift*=lo;correction[f]=shift;
                }
            }
            else if(releasedAt[f]>=0&&clock-releasedAt[f]<(arc[f]?SettleStep:LockRelease)){
                double length=arc[f]?SettleStep:LockRelease;float q=(float)((clock-releasedAt[f])/length),s=q*q*(3-2*q);
                shift=releaseStart[f]*(1-s);turn=Quaternion.Slerp(Quaternion.identity,releaseTurn[f],1-s);if(arc[f])raise=SettleLift*Mathf.Sin(Mathf.PI*q);
            }else continue;
            FootLockOffset=Mathf.Max(FootLockOffset,Flat(shift).magnitude);
            if(shift.sqrMagnitude>1e-8f||raise>0){rig.PlaceFoot(f,rig.Ankle(f).position+shift+root.up*raise);if(turn!=Quaternion.identity)rig.Ankle(f).rotation=turn*rig.Ankle(f).rotation;}
            if(locked[f]){applied[f]=rig.Ankle(f).position-sampledAnkle;appliedTurn[f]=rig.Ankle(f).rotation*Quaternion.Inverse(sampledTurn);}
        }
    }
    static Vector3 Flat(Vector3 v){v.y=0;return v;}
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
        var mesh=root.GetComponentInChildren<SkinnedMeshRenderer>()?.sharedMesh;
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
        var known=FootballSoleContour.Find(root.GetComponentInChildren<SkinnedMeshRenderer>()?.sharedMesh?.name);
        if(known!=null&&known.Length==2){
            // Exact bind-pose data of the known boots (works without a readable mesh).
            for(int f=0;f<2;f++){var list=profile.corners[f];var names=profile.soleBones[f];list.Clear();names.Clear();names.AddRange(known[f].bones);var d=known[f].points;
                for(int i=0;i<d.Length;){int n=(int)d[i++];var q=new SolePoint{bone=new int[n],local=new Vector3[n],weight=new float[n],bind=true};for(int k=0;k<n;k++){q.bone[k]=(int)d[i];q.weight[k]=d[i+1];q.local[k]=new Vector3(d[i+2],d[i+3],d[i+4]);i+=5;}list.Add(q);}}
            profile.solePoints=true;return;
        }
        // Other meshes: the standing pose (editor-readable meshes only).
        if(!Application.isEditor&&!(root.GetComponentInChildren<SkinnedMeshRenderer>()?.sharedMesh?.isReadable??false)){profile.solePoints=true;return;}
        float pitch=root.position.y+profile.sole;var up=Vector3.up;
        var found=new[]{new List<(Vector3 p,BoneWeight w,Transform[] bones,int vertex)>(),new List<(Vector3 p,BoneWeight w,Transform[] bones,int vertex)>()};var mesh=new Mesh();standing.Clear();
        foreach(var r in root.GetComponentsInChildren<SkinnedMeshRenderer>()){
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
        float fall=right?RightFootfall(clip):Footfall(clip);return ((fall+.5*stance/(double)n-Footfall(clip))%1+1)%1;
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
    // Lowest bone clearance of one foot over the measured clip (metres, at
    // most 4 cm): an authored stance that never reaches the standing height.
    public float FootFloat(AnimationClip clip,int foot){
        if(clip==null||!profile.clearances.TryGetValue(clip,out var c))return 0;float low=float.MaxValue;foreach(var v in c[foot])low=Mathf.Min(low,v);return Mathf.Clamp(low,0,.04f);
    }
    public float Footfall(AnimationClip clip){return clip!=null&&profile.gaits.TryGetValue(clip,out var g)&&g.left>=0?g.left:0;}
    public float RightFootfall(AnimationClip clip){return clip!=null&&profile.gaits.TryGetValue(clip,out var g)&&g.right>=0?g.right:(Footfall(clip)+.5f)%1;}
    static Mesh bakeMesh;static readonly List<Vector3> bakeVertices=new List<Vector3>();
    // Lowest skinned vertex relative to the actor root, in metres.
    public static float LowestVertex(Transform actor){
        float lowest=float.MaxValue;var mesh=bakeMesh??(bakeMesh=new Mesh());
        foreach(var r in actor.GetComponentsInChildren<SkinnedMeshRenderer>()){if(r.sharedMesh==null)continue;
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
    readonly Transform leftToe,rightToe;
    readonly Transform root,hips,spine,spine1,spine2,head,leftUpper,leftLower,leftFoot,rightUpper,rightLower,rightFoot,arm,forearm,hand,leftArm,leftForearm,leftHand;
    readonly Vector3 restLeft,restRight;Vector3 anchor;bool planted,plantRight;
    readonly Quaternion restLeftFootRotation,restRightFootRotation;
    public float plantError,contactError;public bool reachable;
    public FootballGround ground;
    // Largest head correction toward an actual header contact.
    public const float HeadReach=22;
    public FootballRig(Transform root){
        this.root=root;Transform Find(string name){return Array.Find(root.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:"+name);}
        hips=Find("Hips");spine=Find("Spine");spine1=Find("Spine1");spine2=Find("Spine2");leftToe=Find("LeftToeBase");rightToe=Find("RightToeBase");head=Find("Head");leftUpper=Find("LeftUpLeg");leftLower=Find("LeftLeg");leftFoot=Find("LeftFoot");rightUpper=Find("RightUpLeg");rightLower=Find("RightLeg");rightFoot=Find("RightFoot");arm=Find("RightArm");forearm=Find("RightForeArm");hand=Find("RightHand");leftArm=Find("LeftArm");leftForearm=Find("LeftForeArm");leftHand=Find("LeftHand");
        if(leftFoot==null||rightFoot==null||hand==null)throw new InvalidOperationException("Football contact rig is missing bones");restLeft=root.InverseTransformPoint(leftFoot.position);restRight=root.InverseTransformPoint(rightFoot.position);
        restLeftFootRotation=Quaternion.Inverse(root.rotation)*leftFoot.rotation;restRightFootRotation=Quaternion.Inverse(root.rotation)*rightFoot.rotation;
    }
    public void Release(){planted=false;plantError=0;reachable=false;contactError=0;}
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
    public void Directional(float pelvisYaw,float legYaw,float weight,float scale=1){
        weight=Mathf.Clamp01(weight);scale=Mathf.Clamp(scale,.2f,1);if(weight<=0&&scale>.999f||hips==null)return;
        float p=pelvisYaw*weight,r=legYaw*weight;var up=root.up;
        if(Mathf.Abs(p)>=.01f){
            hips.rotation=Quaternion.AngleAxis(p,up)*hips.rotation;
            if(spine!=null)spine.rotation=Quaternion.AngleAxis(-p*(spine1!=null?.5f:1f),up)*spine.rotation;
            if(spine1!=null)spine1.rotation=Quaternion.AngleAxis(-p*(spine2!=null?.3f:.5f),up)*spine1.rotation;
            if(spine2!=null)spine2.rotation=Quaternion.AngleAxis(-p*.2f,up)*spine2.rotation;
            if(arm!=null)arm.rotation=Quaternion.AngleAxis(p*.3f,up)*arm.rotation;
            if(leftArm!=null)leftArm.rotation=Quaternion.AngleAxis(p*.3f,up)*leftArm.rotation;
        }
        if(Mathf.Abs(r)<.01f&&scale>.999f)return;
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
    // Braking from a jog: the pelvis lowers (planted soles bend the knees) and
    // the chest stays back over the hips; arms come forward for balance.
    public void Brake(float weight){
        weight=Mathf.Clamp01(weight);if(weight<=0||hips==null)return;var up=root.up;var right=Vector3.Cross(up,Vector3.ProjectOnPlane(root.forward,up).normalized);
        hips.position-=up*(.07f*weight);
        if(spine!=null)spine.rotation=Quaternion.AngleAxis(-6*weight,right)*spine.rotation;
        if(arm!=null)arm.rotation=Quaternion.AngleAxis(-12*weight,right)*arm.rotation;
        if(leftArm!=null)leftArm.rotation=Quaternion.AngleAxis(-12*weight,right)*leftArm.rotation;
    }
    // Acceleration from rest: the pelvis lowers and the arms drive harder.
    public void Drive(float weight){
        weight=Mathf.Clamp01(weight);if(weight<=0||hips==null)return;var up=root.up;
        hips.position-=up*(.035f*weight);
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
    public bool CanPlaceFoot(int f,Vector3 point){var upper=f==0?leftUpper:rightUpper;var lower=f==0?leftLower:rightLower;var foot=f==0?leftFoot:rightFoot;float leg=Vector3.Distance(upper.position,lower.position)+Vector3.Distance(lower.position,foot.position);return Vector3.Distance(upper.position,point)<=leg*.985f;}
    // Heel-off: ankle on the intersection of the leg's reach (98.5 %) around the
    // hip and the foot length around the planted toe, nearest to the wanted
    // ankle; then the foot turns so its toe meets the toe point. False when the
    // toe is out of reach altogether.
    public bool HeelOff(int f,Vector3 toePoint,Vector3 wanted){
        var upper=f==0?leftUpper:rightUpper;var lower=f==0?leftLower:rightLower;var foot=f==0?leftFoot:rightFoot;var toe=Toe(f);if(toe==foot)return false;
        float reach=(Vector3.Distance(upper.position,lower.position)+Vector3.Distance(lower.position,foot.position))*.985f,length=Vector3.Distance(foot.position,toe.position);
        var hip=upper.position;var axis=toePoint-hip;float d=axis.magnitude;if(d<1e-4f||d>reach+length||d<Mathf.Abs(reach-length))return false;axis/=d;
        float a=(reach*reach-length*length+d*d)/(2*d),h=Mathf.Sqrt(Mathf.Max(0,reach*reach-a*a));var centre=hip+axis*a;
        var side=Vector3.ProjectOnPlane(wanted-centre,axis);if(side.sqrMagnitude<1e-8f)side=Vector3.ProjectOnPlane(root.up,axis);var ankle=centre+side.normalized*h;
        PlaceFoot(f,ankle);foot.rotation=Quaternion.FromToRotation(toe.position-foot.position,toePoint-foot.position)*foot.rotation;return true;
    }
    // Places one ankle at a world point with the two-bone solver (bounded,
    // knee keeps its current side, foot keeps its orientation).
    public void PlaceFoot(int f,Vector3 point){
        var upper=f==0?leftUpper:rightUpper;var lower=f==0?leftLower:rightLower;var foot=f==0?leftFoot:rightFoot;
        var hip=upper.position;var line=foot.position-hip;var bend=Vector3.ProjectOnPlane(lower.position-(hip+foot.position)*.5f,line.sqrMagnitude>1e-8f?line.normalized:root.up);
        Solve(upper,lower,foot,point,bend.sqrMagnitude>1e-8f?bend.normalized:root.forward);
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
    public void FollowThrough(float loft,float volley){
        if(hips==null)return;loft=Mathf.Clamp01(loft);volley=Mathf.Clamp01(volley);var forward=root.forward;var right=root.right;
        float leg=Vector3.Distance(rightUpper.position,rightLower.position)+Vector3.Distance(rightLower.position,rightFoot.position);
        if(spine!=null)spine.rotation=Quaternion.AngleAxis(volley*18,forward)*Quaternion.AngleAxis(-loft*10,right)*spine.rotation;
        float w=Mathf.Max(loft,volley);if(w<=0)return;bool side=volley>loft;
        var swing=rightUpper.position+forward*leg*(side?.55f:.72f)+Vector3.up*leg*(side?.38f:.28f)+right*leg*(side?.22f:.04f);
        Blend(rightUpper,rightLower,rightFoot,swing,w*.75f,forward);
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
    public void PrepareContact(Vector3 point,string kind){
        if(kind!="foot"&&kind!="left-foot")return;var upper=kind=="left-foot"?leftUpper:rightUpper;var lower=kind=="left-foot"?leftLower:rightLower;var end=kind=="left-foot"?leftFoot:rightFoot;float length=Vector3.Distance(upper.position,lower.position)+Vector3.Distance(lower.position,end.position),distance=Vector3.Distance(upper.position,point);
        // A small knee bend is allowed for differences between the authored rig
        // and the native foot volume. Far contacts receive no body correction.
        float excess=distance-length;var direction=upper.position-point;
        if(excess>0&&excess<.1f&&direction.y/distance>.65f)hips.position-=Vector3.up*Mathf.Min(.12f,(excess+.004f)*distance/direction.y);
    }
    public void Plant(bool right=false){
        if(!planted||plantRight!=right){
            anchor=root.TransformPoint(right?restRight:restLeft);
            // The support foot rests on the pitch, not at the height of whichever
            // clip happened to be bound when the actor was created.
            if(ground!=null&&ground.Calibrated)anchor.y=root.position.y+ground.ankle*root.lossyScale.y;
            planted=true;plantRight=right;
        }
        var upper=right?rightUpper:leftUpper;var lower=right?rightLower:leftLower;var end=right?rightFoot:leftFoot;var correction=anchor-end.position;if(correction.magnitude<.65f)Solve(upper,lower,end,anchor);plantError=Vector3.Distance(anchor,end.position);
    }
    // weight below one blends between the authored (FK) and the solved limb.
    // record=false is a release frame: it leaves the reported contact untouched.
    public Vector3 Contact(Vector3 point,string kind,float weight=1,bool record=true){
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
        bool canReach=CanReach(upper,lower,end,point);if(canReach)Blend(upper,lower,end,point,weight);
        if(record){reachable=canReach;contactError=Vector3.Distance(end.position,point);}return end.position;
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

using System;
using UnityEngine;
namespace Doppel6.Probe {
// Chooses visual motion from received positions and native time only. It cannot
// advance a player, predict the next frame, or make a football decision.
public sealed class FootballLocomotion {
    public string Mode {get;private set;}="idle";
    public string StrideMode {get;private set;}="idle";
    public double Phase {get;private set;}
    public double StridePhase {get;private set;}
    public float Speed {get;private set;}
    public float Acceleration {get;private set;}
    public float MotionWeight {get;private set;}=1;
    public float ForwardLean {get;private set;}
    public float TurnLean {get;private set;}
    public float RecoveryLean {get;private set;}
    // Share of the observed travel along the received right-hand axis (-1..1).
    public float Lateral {get;private set;}
    // Observed travel relative to the axis of the selected stride family
    // (forward or backward), at most 75 degrees; 0 for a side step.
    public float StrideYaw {get;private set;}
    // Smoothed observed speed that selects and paces the stride clip.
    public float StrideSpeed=>strideSpeed;
    // The stride cycle and step length follow the shown travel more closely
    // (CadenceSmooth): with the band speed's 0.08 s the cycle lagged an
    // acceleration by a*0.08 (0.5 m/s in a short sprint), and the planted foot
    // portrayed that lag as a glide.
    public const double CadenceSmooth=.03;
    // Within run, sprint or backward motion: the faster of two measured clips,
    // with hysteresis so a speed near the boundary cannot alternate clips.
    // Sprint: sprint_forward portrays about 5.8 m/s (left stance 4.95 m/s);
    // native sprints reach 8 m/s, where its cadence capped and the planted toe
    // was dragged into 1900 deg/s heel-offs. Above TopSprintOn the measured
    // top-speed stride (running, 7.4 m/s, 4.7 m per cycle) lengthens the step.
    public bool FastStride {get;private set;}
    public const float FastRunOn=4.2f,FastRunOff=3.8f,FastBackOn=2.3f,FastBackOff=2f,TopSprintOn=6.6f,TopSprintOff=6.2f;
    // U-1 (183, SI-5): a ball carrier in the run band shows running (7.4 m/s, 4.7 m per cycle)
    // only above TopSprintOn and keeps run_fast4 (6.3 m/s, 4.2 m) below it. A run without the
    // ball uses run_fast4 only up to the sprint band (about 5 m/s) and then sprint_forward; a
    // carrier never enters the sprint band and stays on run_fast4 up to 6.6 m/s. From run_fast6
    // (3.0 m/s) straight to running at 4.2 m/s the stride length jumped 2.5 -> 4.7 m and a fast
    // start (spd/tec 18, large pitch) reached 1609 deg/s at the left foot. Only with the SI
    // marker (Sample: topStretch); without it a carrier keeps running from FastRunOn on
    // (CarrierTop stays true). Keepers are no carriers here (the presentation excludes them).
    // CarrierTop follows the carrier only: a ball loss clears it, so a carrier regaining the ball
    // between TopSprintOff and TopSprintOn shows run_fast4 again (FootballLocomotionTests).
    public bool CarrierTop {get;private set;}=true;
    // Backward only: the fastest measured backward stride (back_right) above FastestBackOn.
    public bool FastestBack {get;private set;}
    public const float FastestBackOn=3.5f,FastestBackOff=3.2f;
    // Natural motion state. Everything below is derived from received positions,
    // facings and native time; it is reset by a seek or cut and never predicts.
    // Stride family with hysteresis: forward strides, a lateral side step
    // (chasse) or backward strides. The boundaries are body-relative travel
    // angles; a family changes only after crossing the farther threshold.
    public enum Family {Forward,Side,Back}
    public Family Gait {get;private set;}
    public const float BackOn=125,BackOff=100,SideOn=62,SideOff=50,SideBack=132,SideFromBack=110,SideSpeedOn=1.9f,SideSpeedOff=2.3f;
    public const float KeeperSideOn=45,KeeperSideOff=35,KeeperSideSpeedOn=2.1f,KeeperSideSpeedOff=2.5f;
    // Smoothed received travel direction relative to the received facing
    // (degrees, positive to the right). Kept while standing.
    public float TravelAngle {get;private set;}
    // 0..1: how much of the directional body response is shown (observed speed).
    public float DirectionWeight {get;private set;}
    // Pelvis turn relative to the facing (smoothed, rate limited: a visible hip
    // turn) and the remaining leg direction relative to the turned pelvis.
    public float PelvisYaw {get;private set;}
    // Rate limited like the pelvis: a family change (stride to side step, forward
    // to backward) turns the legs over several frames instead of moving a foot
    // 0.4 m within one picture.
    public float LegYaw {get;private set;}
    public const float PelvisShare=.6f,PelvisLimit=55,LegLimit=55,HipTurnRate=420,LegTurnRate=480;
    // 0..1: a walking body always has one sole on the pitch. Full below
    // SupportFull m/s, none from SupportNone m/s, where running flight belongs
    // to the authored stride (FootballAnimation lowers the pelvis by the
    // clearance of the lower foot, bounded).
    public float SupportWeight {get;private set;}
    public const float SupportFull=1.9f,SupportNone=2.6f;
    // Side step: signed cycles along the received right axis and its weight.
    public double SidePhase {get;private set;}
    public float SideWeight {get;private set;}
    // Share of each foot's fore-aft excursion shown (stride warping, at most
    // MaxStrideStretch on the top-speed stride above its authored pace, else <=1).
    public float StrideScale {get;private set;}=1;
    public const double MinCadenceShare=.7;
    // U-1 (183, B02): above the authored pace of the fastest forward clip (running,
    // 7.4 m/s at 4.7 m per cycle) the native own runs reach 8.15 m/s. Played with the
    // authored step only, that was a 1.10x (up to 1.17x) faster playback. The top-speed
    // stride (sprint band on running; no faster clip exists) now lengthens its step by the
    // square root of that ratio (cadence and step share it, as a faster runner does both),
    // at most MaxStrideStretch; the cycle still follows the received travel, so the planted
    // foot keeps the ground speed. Slower bands keep their step: a faster clip takes over.
    // Only pictures of a match with the SI marker (Sample: topStretch); older matches keep
    // their presentation (the stretch shifts the shared stride cycle of every later picture).
    // A ball carrier never enters the sprint band; on the large pitch (SI-5) it runs up to
    // 8.5 m/s on running in its run band. Above the authored pace its step lengthens the same
    // way, bounded by MaxCarrierStretch (a dribbling stride stays shorter; the cadence takes
    // the rest).
    public const float MaxStrideStretch=1.08f,MaxCarrierStretch=1.05f;
    // Playback rate of brake_meshy from its measured entry (authored joint speed
    // up to 1140 deg/s; 1.8x reached 2000 deg/s).
    public const double BrakeRate=1.35;
    // Metres per side-step cycle (one lead and one closing step); the feet
    // spread at most by this plus the closed stance.
    public float SideLength {get;private set;}=.5f;
    // Support foot (right=true) when the current turn or brake began. Brake and
    // turn keep their own entry clock and foot: a turn trigger during a brake
    // restarted brake_meshy from its entry (measured 2549 deg/s in native runs).
    public bool TransitionRight=>Mode=="brake"?brakeRight:turnRight;
    // Smoothed speed when the current brake began: only a stop from a fast run
    // uses brake_meshy; slower stops shorten their steps under a braking posture.
    public float BrakeFrom {get;private set;}
    public const float BrakeClipSpeed=4.2f;
    // True when the current brake began while the received body still moved.
    // A body whose received travel had already stopped (a native snap from a
    // run to rest within one picture) takes no braking steps: brake_meshy at
    // 1.35x on a standing root stepped and swung its legs at up to 1640 deg/s.
    public bool BrakeMoving {get;private set;}
    // True when the current brake began on a forward stride travelling within
    // BrakeClipAngle of the facing: only such a stop uses brake_meshy (a forward
    // stop; turned 90 degrees for a lateral sprint its planted feet moved forward
    // under the body at up to 4.6 m/s). Other stops keep their own stride, whose
    // warped stance follows the received deceleration, under the brake posture.
    public bool BrakeForward {get;private set;}
    public const float BrakeClipAngle=60;
    // 0..1 braking posture of the current brake episode (lower pelvis, weight back).
    // 0..1 braking posture of the current brake episode, rising and falling at
    // most 1/BrakePostureTime per second (its sine envelope over a moving
    // episode end jumped when a brake was extended or rejoined).
    public float BrakeWeight {get;private set;}
    public const double BrakePostureTime=.15;
    public double TransitionClock=>Mode=="brake"?brakeAt:turnAt;
    // Seconds since the actor came to rest (0 while moving).
    public double StoppedFor {get;private set;}
    // True during the native frame that started a stride from rest; which foot swings first.
    public bool Started {get;private set;}
    public bool StartRightSwings {get;private set;}
    // Puts the shared cycle at a measured fraction (the support foot's mid-stance of the new stride clip).
    public void AlignStart(double fraction,double cycleOffset){if(!Started)return;double current=StridePhase+cycleOffset;StridePhase+=((fraction-(current-Math.Floor(current)))%1+1)%1;Phase=Mode=="brake"||Mode.StartsWith("turn-")?Phase:StridePhase;}
    // A moving turn above TurnClipSpeed keeps its stride legs (no turn clip): a
    // cut shows as a short dip with lean. 0..1 over the turn episode.
    public const float TurnClipSpeed=2.5f;
    public float CutWeight=>cutAt>=0&&clock-cutAt<CutLength?(float)Math.Sin(Math.PI*(clock-cutAt)/CutLength):0;
    public const double CutLength=.35;
    // A brake or turn re-triggering within EpisodeRejoin of its episode's end is
    // the same episode; a turn episode lasts at most TurnEpisode s.
    public const double EpisodeRejoin=.3,TurnEpisode=.9;public const float ContinueTurnSpeed=1;
    public const float RepositionSpeed=12,RepositionStep=.6f;
    // A stride band change (walk/jog/run/sprint/back clip) crossfades its stride
    // scale (the shown fore-aft foot excursion) over the same time as the clip
    // weights; the shared cycle keeps its phase (only its rate changes).
    public const double WarpFade=.12;
    // The crossfade time of the clip change in progress (FootballAnimation.ChangeFade); WarpFade by default.
    public double WarpTime=WarpFade;
    Vector3 position,forward,velocity;double cutAt=-1,clock=-1,brakeUntil,turnUntil,brakeAt,turnAt,calm,idleFor=1;bool brakeRight,turnRight;string turn;float strideSpeed,slowTurnAngle;bool turnLatch;int latchSign;bool wasMoving,restStart;float cadenceSpeed;string lastBrake,lastTurn,lastMode;float warpLength,warpFromScale=1,warpFromLength,warpFromNatural,warpNatural;double warpAt=-1;
    // strideLength: measured metres per cycle of the clip that shows this stride
    // (0 keeps the earlier fixed cadence references). clipHeading: its measured
    // travel direction on the rig (0 forward, about 180 backward). cycleOffset:
    // the actor's constant cycle offset, so a start or a turn knows its foot.
    // naturalCadence: authored cycles per second of that clip (1/length); a
    // slow stride keeps at least MinCadenceShare of it and shortens its steps.
    public void Sample(Vector3 point,Vector3 facing,double nativeClock,bool carrying,bool keeper,double freshness=-1,float strideLength=0,float clipHeading=0,double cycleOffset=0,float naturalCadence=0,bool topStretch=false){
        if(clock>=0&&nativeClock==clock)return;
        double dt=nativeClock-clock;
        var travel=point-position;travel.y=0;
        // A received displacement no player can run (over RepositionSpeed, e.g. a
        // 6.8 m restart placement inside one picture) is a reposition, not a
        // stride: it reset the stride instead of starting a 136 m/s sprint, a
        // turn and a brake_meshy stop on a standing body (measured 2045 deg/s).
        if(clock<0||dt<0||dt>1||travel.magnitude>7||travel.magnitude>RepositionStep&&travel.magnitude>RepositionSpeed*dt){
            position=point;forward=facing;clock=nativeClock;Speed=strideSpeed=cadenceSpeed=slowTurnAngle=Acceleration=ForwardLean=TurnLean=0;RecoveryLean=Recovery(freshness,carrying,keeper);Phase=StridePhase=nativeClock;Mode=StrideMode="idle";MotionWeight=1;Lateral=StrideYaw=0;brakeUntil=turnUntil=0;FastStride=FastestBack=false;CarrierTop=!topStretch;
            cutAt=-1;velocity=Vector3.zero;TravelAngle=DirectionWeight=PelvisYaw=LegYaw=SideWeight=SupportWeight=0;SidePhase=0;Gait=Family.Forward;turnLatch=false;calm=0;idleFor=1;StoppedFor=1;wasMoving=false;Started=false;brakeRight=turnRight=false;lastBrake=lastTurn=null;BrakeWeight=0;lastMode=null;warpLength=warpFromLength=warpFromNatural=warpNatural=0;warpAt=-1;warpFromScale=StrideScale=1;return;
        }
        float actual=travel.magnitude/(float)Math.Max(.0001,dt);
        Acceleration=Mathf.Lerp(Acceleration,Mathf.Clamp((actual-Speed)/(float)dt,-16,16),1-(float)Math.Exp(-dt/.12));
        // A brake that re-triggers within EpisodeRejoin of the previous one is the
        // same stop (noisy received speed): it continues its clip time instead of
        // restarting brake_meshy from its entry (measured 2956 deg/s snaps).
        if(Speed>2&&(actual<.3||Acceleration< -4&&actual<Speed)){if(nativeClock>=brakeUntil&&!(lastBrake=="brake"&&nativeClock-brakeUntil<EpisodeRejoin)){brakeAt=nativeClock;brakeRight=Support(cycleOffset);BrakeFrom=strideSpeed;BrakeMoving=actual>=.3;BrakeForward=Gait==Family.Forward&&Math.Abs(TravelAngle)<=BrakeClipAngle;}brakeUntil=nativeClock+.20;}
        float angle=Vector3.SignedAngle(forward,facing,Vector3.up);float rate=(float)(angle/dt);
        // A pivot changes the received facing without translating the actor.
        // Accumulate only coherent, real angular motion at any speed: small
        // frames can show a turn, while alternating heading jitter stays idle.
        if(Math.Abs(angle)>.5&&Math.Abs(angle)>dt*110){
            slowTurnAngle=Math.Sign(slowTurnAngle)==Math.Sign(angle)?slowTurnAngle+angle:angle;
            slowTurnAngle=Math.Clamp(slowTurnAngle,-90,90);
        }else slowTurnAngle=0;
        // One turn episode per direction change. A moving actor that keeps
        // curving shows lean and direction, not a turn clip restarting every
        // 0.18 s; a new episode needs the heading to calm or reverse.
        if(Math.Abs(rate)<60)calm+=dt;else calm=0;
        if(turnLatch&&(calm>=.2||Math.Sign(rate)!=latchSign&&Math.Abs(rate)>110))turnLatch=false;
        bool movingTurn=actual>1&&Math.Abs(angle)>Math.Max(8,dt*110);
        bool triggered=movingTurn||Math.Abs(slowTurnAngle)>=8;string side=angle<0?"turn-left":"turn-right";
        // A slow turn (below ContinueTurnSpeed: pivot or walking turn clip) that keeps going the same way, or re-triggers on
        // the same side within EpisodeRejoin, continues its turn clip instead of
        // starting it again (at most TurnEpisode s per episode; measured restarts
        // jumped the clip phase 0.71 -> 0.45, 4246 deg/s). A finished episode
        // latches until the heading calms or reverses.
        bool continuing=triggered&&actual<ContinueTurnSpeed&&turn==side&&lastTurn==side&&nativeClock<turnUntil+EpisodeRejoin&&nativeClock-turnAt<TurnEpisode;
        if(continuing){turnUntil=Math.Min(nativeClock+.18,turnAt+TurnEpisode);slowTurnAngle=0;}
        else if(triggered&&nativeClock>=turnUntil&&!turnLatch){turn=side;turnUntil=nativeClock+.18;turnAt=nativeClock;turnRight=Support(cycleOffset);slowTurnAngle=0;turnLatch=actual>=.2;latchSign=Math.Sign(angle);if(actual>=TurnClipSpeed)cutAt=nativeClock;}
        if(triggered&&actual<ContinueTurnSpeed&&turn==side&&nativeClock-turnAt>=TurnEpisode){turnLatch=true;latchSign=Math.Sign(angle);}
        Speed=actual;
        var side2=facing;side2.y=0;Lateral=actual>.12f&&side2.sqrMagnitude>.0001f?Vector3.Dot(travel.normalized,Vector3.Cross(Vector3.up,side2.normalized)):0;
        strideSpeed=Mathf.Lerp(strideSpeed,actual,1-(float)Math.Exp(-dt/.08));cadenceSpeed=Mathf.Lerp(cadenceSpeed,actual,1-(float)Math.Exp(-dt/CadenceSmooth));
        // Smoothed received velocity gives the travel direction; a stop keeps it.
        // A start from rest takes the direction of its first received travel:
        // smoothed from rest, it kept the old forward angle for four pictures, so
        // backward and sideways starts began as a forward walk start (the walking
        // clip's first step and stance) and changed stride family mid-step.
        velocity=actual>=.2&&idleFor>=.25?travel/(float)dt:Vector3.Lerp(velocity,travel/(float)dt,1-(float)Math.Exp(-dt/.09));
        if(velocity.magnitude>.15f&&side2.sqrMagnitude>.0001f)TravelAngle=Vector3.SignedAngle(side2,velocity,Vector3.up);
        // A braking body keeps its stride family: the last steps of a lateral or
        // backward run never turn into a side step (or back) while slowing down.
        float a=Math.Abs(TravelAngle);bool sideAllowed=!carrying&&!(nativeClock<brakeUntil&&Gait!=Family.Side);
        float sideOn=keeper?KeeperSideOn:SideOn,sideOff=keeper?KeeperSideOff:SideOff,speedOn=keeper?KeeperSideSpeedOn:SideSpeedOn,speedOff=keeper?KeeperSideSpeedOff:SideSpeedOff;
        if(actual>=.2){
            if(Gait==Family.Forward){if(a>BackOn)Gait=Family.Back;else if(sideAllowed&&a>sideOn&&a<180-sideOn+4&&strideSpeed<speedOn)Gait=Family.Side;}
            else if(Gait==Family.Side){if(!sideAllowed||strideSpeed>speedOff||a<sideOff)Gait=a>BackOff?Family.Back:Family.Forward;else if(a>SideBack)Gait=Family.Back;}
            else{if(sideAllowed&&a>sideOn&&a<SideFromBack&&strideSpeed<speedOn)Gait=Family.Side;else if(a<BackOff)Gait=Family.Forward;}
        }
        bool backward=Gait==Family.Back;
        float walkLimit=StrideMode=="walk"?1.95f:1.65f,sprintLimit=StrideMode=="sprint"?4.35f:4.9f;
        StrideMode=actual<.2?"idle":backward?"back":Gait==Family.Side?"side":strideSpeed<walkLimit?"walk":(strideSpeed>sprintLimit||actual>5.2f)&&!carrying&&!keeper?"sprint":"run";
        // The top-speed stride takes over by the speed that paces the cycle
        // (cadenceSpeed): chosen by the slower band speed, sprint_forward (its
        // cadence capped by the authored stride) played at 1.22x before running
        // took over at 7.25 m/s, and its own foot peak plus the crossfade reached
        // 1622 deg/s.
        FastestBack=StrideMode=="back"&&(FastestBack?strideSpeed>FastestBackOff:strideSpeed>FastestBackOn);
        FastStride=StrideMode=="run"?(FastStride?strideSpeed>FastRunOff:strideSpeed>FastRunOn):StrideMode=="back"?(FastStride?strideSpeed>FastBackOff:strideSpeed>FastBackOn):StrideMode=="sprint"?(FastStride?cadenceSpeed>TopSprintOff:cadenceSpeed>TopSprintOn):false;
        CarrierTop=!topStretch||carrying&&!keeper&&StrideMode=="run"&&FastStride&&(CarrierTop?cadenceSpeed>TopSprintOff:cadenceSpeed>TopSprintOn);
        Mode=nativeClock<brakeUntil?"brake":nativeClock<turnUntil?turn:StrideMode;
        if(Mode=="brake")lastBrake="brake";else if(nativeClock-brakeUntil>=EpisodeRejoin)lastBrake=null;
        float posture=Mode=="brake"?(float)Math.Sin(Math.PI*Math.Clamp((nativeClock-brakeAt)/Math.Max(.2,brakeUntil-brakeAt),0,1)):0;BrakeWeight=Mathf.MoveTowards(BrakeWeight,posture,(float)(dt/BrakePostureTime));
        if(Mode.StartsWith("turn-"))lastTurn=Mode;else if(nativeClock-turnUntil>=EpisodeRejoin)lastTurn=null;
        // Direction: the pelvis turns part of the way toward the travel, the legs
        // show the remainder relative to the measured axis of the stride clip.
        float rel=Mathf.DeltaAngle(clipHeading,TravelAngle);
        float pelvisTarget=Gait==Family.Side?(keeper?0:Mathf.Sign(TravelAngle)*10):Mathf.Clamp(rel*PelvisShare,-PelvisLimit,PelvisLimit);
        float k=1-(float)Math.Exp(-dt/.06);PelvisYaw=Mathf.MoveTowards(PelvisYaw,Mathf.Lerp(PelvisYaw,pelvisTarget,k),HipTurnRate*(float)dt);
        float legTarget=Gait==Family.Side?0:Mathf.Clamp(rel-PelvisYaw,-LegLimit,LegLimit);
        LegYaw=Mathf.MoveTowards(LegYaw,Mathf.Lerp(LegYaw,legTarget,k),LegTurnRate*(float)dt);
        // From the shown travel (CadenceSmooth): the band speed lagged a hard stop
        // (2.2 m/s on a body at 1.4) and left a stopping body without a sole down.
        float support=Mathf.Clamp01((SupportNone-cadenceSpeed)/(SupportNone-SupportFull));SupportWeight=actual>=.2f||StoppedFor<.5?support:0;
        StrideYaw=actual>.2f&&Gait!=Family.Side?Mathf.Clamp(rel,-75,75):0;
        float directionTarget=actual>=.2f?Mathf.Clamp01((strideSpeed-.2f)/.6f):0;directionTarget=directionTarget*directionTarget*(3-2*directionTarget);
        DirectionWeight=Mathf.Lerp(DirectionWeight,directionTarget,1-(float)Math.Exp(-dt/.1));
        // Side step: cycles follow the lateral distance actually travelled. Each
        // cycle is one lead step and one closing step of length L.
        if(Gait==Family.Side||SideWeight>.001f){SideLength=Mathf.Clamp(.4f+.09f*strideSpeed,.4f,.6f);SidePhase+=Vector3.Dot(travel,Vector3.Cross(Vector3.up,side2.normalized))/SideLength;}
        float sideTarget=Gait==Family.Side&&(actual>=.2f||StoppedFor<.3)?1:0;SideWeight=Mathf.Lerp(SideWeight,sideTarget,1-(float)Math.Exp(-dt/.1));
        if(sideTarget==0&&SideWeight<.002f){SideWeight=0;SidePhase=0;}
        // A moving turn/brake keeps the received stride underneath it. A real
        // stationary pivot still uses the complete turn; no travel is invented.
        // Within one brake or turn episode the clip's share over the stride changes
        // at most 1/BrakePostureTime per second: it followed the noisy received
        // speed and jumped 0.37 -> 0.55 within one picture (measured 1741 deg/s).
        float motionTarget=Mode=="brake"||Mode.StartsWith("turn-")?actual<.2?1:Mathf.Clamp(.85f-actual*.09f,.35f,.85f):1;
        MotionWeight=Mode==lastMode&&Mode!=StrideMode?Mathf.MoveTowards(MotionWeight,motionTarget,(float)(dt/BrakePostureTime)):motionTarget;lastMode=Mode;
        float lean=actual>.2||Mode=="brake"?Mathf.Clamp(Acceleration*.45f,-5,7):0;
        ForwardLean=Mathf.Lerp(ForwardLean,lean,1-(float)Math.Exp(-dt/.09));
        float bank=Mathf.Clamp(-(float)(angle/dt)*.025f*Mathf.Clamp01(actual/4),-6,6);
        TurnLean=Mathf.Lerp(TurnLean,bank,1-(float)Math.Exp(-dt/.12));
        RecoveryLean=Mathf.Lerp(RecoveryLean,Mode=="idle"?Recovery(freshness,carrying,keeper):0,1-(float)Math.Exp(-dt/.35));
        // A start from rest begins its first step from the loaded foot: the
        // stride enters at mid-stance, so the other foot swings first. The
        // side of travel decides which foot steps; straight ahead alternates
        // per actor (constant offset), never per frame.
        // A sideways start leads with the foot on the side of travel; the other
        // foot keeps its standing point (FootballAnimation: start stance).
        Started=false;
        if(actual>=.2&&idleFor>=.25&&StrideMode=="side"){Started=true;StartRightSwings=Lateral>0;}
        else if(actual>=.2&&idleFor>=.25){
            bool rightSwings=Lateral>.25f||Lateral>-.25f&&Math.Floor(cycleOffset/.09+.5)%2==0;
            double target=rightSwings?.12:.62,current=StridePhase+cycleOffset;
            StridePhase+=((target-(current-Math.Floor(current)))%1+1)%1;Started=true;StartRightSwings=rightSwings;
        }
        // Keep the stride independent of short turn/brake poses. Received jitter
        // changes cadence smoothly without altering the authoritative position.
        // A measured stride length makes the planted foot travel with the body.
        // Phase-coherent band change (WarpFade = the clips' linear crossfade): while
        // two stride clips with different measured stride lengths share the cycle,
        // it is paced with their weight-blended length (and authored cadence), so
        // the planted foot keeps the ground speed through the switch (pacing with
        // the new clip alone moved a fading run_fast4 stance foot faster than the
        // body: 0.22 m lock drift, then a 1 m/s glide in short sprints). To or
        // from a band without a measured stride (side step, idle) the scale
        // crossfades instead (a 0.79 -> 1.00 jump moved a swing foot 0.11 m).
        // A stride starting from rest takes its step length at once: the stride
        // clip itself fades in from the stance, and a scale crossfade from the
        // stance's 1 down to a short first step and back up moved the planted foot
        // back under the body (0.6-1.2 m/s in walk starts).
        // (The stride length arrives one picture after the start: restStart holds
        // until then.)
        float shownLength=strideLength>.3f?strideLength:0;if(actual<.2)restStart=false;else if(idleFor>=.25)restStart=true;
        if(Math.Abs(shownLength-warpLength)>.01f){if(restStart&&warpLength<=.3f&&shownLength>.3f){warpAt=-1;restStart=false;}else{warpAt=nativeClock;warpFromScale=StrideScale;warpFromLength=warpLength;warpFromNatural=warpNatural;}}
        warpLength=shownLength;warpNatural=naturalCadence;
        float fade=warpAt>=0&&nativeClock-warpAt<WarpTime?(float)((nativeClock-warpAt)/WarpTime):1;if(fade>=1)warpAt=-1;
        bool blended=fade<1&&warpFromLength>.3f&&shownLength>.3f;
        double length=blended?Mathf.Lerp(warpFromLength,strideLength,fade):strideLength>.3f?strideLength:StrideMode=="walk"?1.9:StrideMode=="sprint"?3.5:carrying?2.9:3.3,cadence=cadenceSpeed/length;
        double natural=blended&&warpFromNatural>0&&naturalCadence>0?warpFromNatural+(naturalCadence-warpFromNatural)*fade:naturalCadence;
        // Stride warping: below the clip's authored speed the cadence stays at
        // least MinCadenceShare of the authored one and each step is shorter.
        // A braking body steps quickly and short: its floor rises with the brake
        // posture to the authored cadence (at 0.7 a backward sprint stopping from
        // 5.6 m/s swung its left foot through the air for 0.6 s, slow motion).
        if(strideLength>.3f&&natural>0)cadence=Math.Max(cadence,(MinCadenceShare+(1-MinCadenceShare)*BrakeWeight)*natural);
        bool carried=carrying&&!keeper&&StrideMode=="run"&&FastStride&&CarrierTop,stretch=topStretch&&strideLength>.3f&&natural>0&&Gait==Family.Forward&&(StrideMode=="sprint"&&FastStride||carried)&&cadence>natural;
        float stretchMax=carried?MaxCarrierStretch:MaxStrideStretch;
        if(stretch)cadence/=Math.Min(stretchMax,Math.Sqrt(cadence/natural));
        cadence=Math.Clamp(cadence,.25,2.4);
        // At rest the scale returns to the authored pose while the stride fades out.
        float scaleTarget=actual<.2f?Mathf.MoveTowards(StrideScale,1,(float)dt/.35f):strideLength>.3f?Mathf.Clamp(cadenceSpeed/(float)(cadence*length),.2f,stretch?stretchMax:1):1;
        if(!blended&&fade<1){float q=fade*fade*(3-2*fade);scaleTarget=Mathf.Lerp(warpFromScale,scaleTarget,q);}
        StrideScale=scaleTarget;
        if(actual>=.2)StridePhase+=dt*cadence;
        Phase=Mode=="brake"?.55+(nativeClock-brakeAt)*BrakeRate:Mode.StartsWith("turn-")?.45+(nativeClock-turnAt)*1.3:StridePhase;
        if(actual<.2){idleFor+=dt;StoppedFor=wasMoving?StoppedFor+dt:Math.Max(StoppedFor,1);}else{idleFor=0;StoppedFor=0;wasMoving=true;}
        if(StoppedFor>1)wasMoving=false;
        position=point;forward=facing;clock=nativeClock;
    }
    // The foot that last landed in the aligned cycle: left during the first half.
    bool Support(double cycleOffset){double c=StridePhase+cycleOffset;return c-Math.Floor(c)>=.5;}
    static float Recovery(double freshness,bool carrying,bool keeper){return carrying||keeper||freshness<0?0:(float)Math.Clamp((.55-freshness)/.55,0,1)*8;}
}
}

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
    // Within run or backward motion: the faster of two measured clips, with
    // hysteresis so a speed near the boundary cannot alternate clips.
    public bool FastStride {get;private set;}
    public const float FastRunOn=4.2f,FastRunOff=3.8f,FastBackOn=2.3f,FastBackOff=2f;
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
    // Share of each foot's fore-aft excursion shown (stride warping, <=1).
    public float StrideScale {get;private set;}=1;
    public const double MinCadenceShare=.7;
    // Metres per side-step cycle (one lead and one closing step); the feet
    // spread at most by this plus the closed stance.
    public float SideLength {get;private set;}=.5f;
    // Support foot (right=true) when the current turn or brake began.
    public bool TransitionRight {get;private set;}
    // Smoothed speed when the current brake began: only a stop from a fast run
    // uses brake_meshy; slower stops shorten their steps under a braking posture.
    public float BrakeFrom {get;private set;}
    public const float BrakeClipSpeed=4.2f;
    // 0..1 braking posture of the current brake episode (lower pelvis, weight back).
    public float BrakeWeight=>Mode=="brake"?(float)Math.Sin(Math.PI*Math.Clamp((clock-transitionAt)/Math.Max(.2,brakeUntil-transitionAt),0,1)):0;
    public double TransitionClock=>transitionAt;
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
    Vector3 position,forward,velocity;double cutAt=-1,clock=-1,brakeUntil,turnUntil,transitionAt,calm,idleFor=1;string turn;float strideSpeed,slowTurnAngle;bool turnLatch;int latchSign;bool wasMoving;
    // strideLength: measured metres per cycle of the clip that shows this stride
    // (0 keeps the earlier fixed cadence references). clipHeading: its measured
    // travel direction on the rig (0 forward, about 180 backward). cycleOffset:
    // the actor's constant cycle offset, so a start or a turn knows its foot.
    // naturalCadence: authored cycles per second of that clip (1/length); a
    // slow stride keeps at least MinCadenceShare of it and shortens its steps.
    public void Sample(Vector3 point,Vector3 facing,double nativeClock,bool carrying,bool keeper,double freshness=-1,float strideLength=0,float clipHeading=0,double cycleOffset=0,float naturalCadence=0){
        if(clock>=0&&nativeClock==clock)return;
        double dt=nativeClock-clock;
        var travel=point-position;travel.y=0;
        if(clock<0||dt<0||dt>1||travel.magnitude>7){
            position=point;forward=facing;clock=nativeClock;Speed=strideSpeed=slowTurnAngle=Acceleration=ForwardLean=TurnLean=0;RecoveryLean=Recovery(freshness,carrying,keeper);Phase=StridePhase=nativeClock;Mode=StrideMode="idle";MotionWeight=1;Lateral=StrideYaw=0;brakeUntil=turnUntil=0;FastStride=FastestBack=false;
            cutAt=-1;velocity=Vector3.zero;TravelAngle=DirectionWeight=PelvisYaw=LegYaw=SideWeight=SupportWeight=0;SidePhase=0;Gait=Family.Forward;turnLatch=false;calm=0;idleFor=1;StoppedFor=1;wasMoving=false;Started=false;TransitionRight=false;return;
        }
        float actual=travel.magnitude/(float)Math.Max(.0001,dt);
        Acceleration=Mathf.Lerp(Acceleration,Mathf.Clamp((actual-Speed)/(float)dt,-16,16),1-(float)Math.Exp(-dt/.12));
        if(Speed>2&&(actual<.3||Acceleration< -4&&actual<Speed)){if(nativeClock>=brakeUntil){transitionAt=nativeClock;TransitionRight=Support(cycleOffset);BrakeFrom=strideSpeed;}brakeUntil=nativeClock+.20;}
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
        if(triggered&&nativeClock>=turnUntil&&!turnLatch){turn=side;turnUntil=nativeClock+.18;transitionAt=nativeClock;TransitionRight=Support(cycleOffset);slowTurnAngle=0;turnLatch=actual>=.2;latchSign=Math.Sign(angle);if(actual>=TurnClipSpeed)cutAt=nativeClock;}
        // A stationary pivot that keeps turning the same way continues its
        // turn clip instead of starting it again (at most 0.9 s per episode).
        else if(triggered&&nativeClock<turnUntil&&actual<.2&&turn==side){turnUntil=Math.Min(nativeClock+.18,transitionAt+.9);slowTurnAngle=0;}
        Speed=actual;
        var side2=facing;side2.y=0;Lateral=actual>.12f&&side2.sqrMagnitude>.0001f?Vector3.Dot(travel.normalized,Vector3.Cross(Vector3.up,side2.normalized)):0;
        strideSpeed=Mathf.Lerp(strideSpeed,actual,1-(float)Math.Exp(-dt/.08));
        // Smoothed received velocity gives the travel direction; a stop keeps it.
        velocity=Vector3.Lerp(velocity,travel/(float)dt,1-(float)Math.Exp(-dt/.09));
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
        FastestBack=StrideMode=="back"&&(FastestBack?strideSpeed>FastestBackOff:strideSpeed>FastestBackOn);
        FastStride=StrideMode=="run"?(FastStride?strideSpeed>FastRunOff:strideSpeed>FastRunOn):StrideMode=="back"?(FastStride?strideSpeed>FastBackOff:strideSpeed>FastBackOn):false;
        Mode=nativeClock<brakeUntil?"brake":nativeClock<turnUntil?turn:StrideMode;
        // Direction: the pelvis turns part of the way toward the travel, the legs
        // show the remainder relative to the measured axis of the stride clip.
        float rel=Mathf.DeltaAngle(clipHeading,TravelAngle);
        float pelvisTarget=Gait==Family.Side?(keeper?0:Mathf.Sign(TravelAngle)*10):Mathf.Clamp(rel*PelvisShare,-PelvisLimit,PelvisLimit);
        float k=1-(float)Math.Exp(-dt/.06);PelvisYaw=Mathf.MoveTowards(PelvisYaw,Mathf.Lerp(PelvisYaw,pelvisTarget,k),HipTurnRate*(float)dt);
        float legTarget=Gait==Family.Side?0:Mathf.Clamp(rel-PelvisYaw,-LegLimit,LegLimit);
        LegYaw=Mathf.MoveTowards(LegYaw,Mathf.Lerp(LegYaw,legTarget,k),LegTurnRate*(float)dt);
        float support=Mathf.Clamp01((SupportNone-strideSpeed)/(SupportNone-SupportFull));SupportWeight=actual>=.2f||StoppedFor<.5?support:0;
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
        MotionWeight=Mode=="brake"||Mode.StartsWith("turn-")?actual<.2?1:Mathf.Clamp(.85f-actual*.09f,.35f,.85f):1;
        float lean=actual>.2||Mode=="brake"?Mathf.Clamp(Acceleration*.45f,-5,7):0;
        ForwardLean=Mathf.Lerp(ForwardLean,lean,1-(float)Math.Exp(-dt/.09));
        float bank=Mathf.Clamp(-(float)(angle/dt)*.025f*Mathf.Clamp01(actual/4),-6,6);
        TurnLean=Mathf.Lerp(TurnLean,bank,1-(float)Math.Exp(-dt/.12));
        RecoveryLean=Mathf.Lerp(RecoveryLean,Mode=="idle"?Recovery(freshness,carrying,keeper):0,1-(float)Math.Exp(-dt/.35));
        // A start from rest begins its first step from the loaded foot: the
        // stride enters at mid-stance, so the other foot swings first. The
        // side of travel decides which foot steps; straight ahead alternates
        // per actor (constant offset), never per frame.
        Started=false;
        if(actual>=.2&&idleFor>=.25&&StrideMode!="side"){
            bool rightSwings=Lateral>.25f||Lateral>-.25f&&Math.Floor(cycleOffset/.09+.5)%2==0;
            double target=rightSwings?.12:.62,current=StridePhase+cycleOffset;
            StridePhase+=((target-(current-Math.Floor(current)))%1+1)%1;Started=true;StartRightSwings=rightSwings;
        }
        // Keep the stride independent of short turn/brake poses. Received jitter
        // changes cadence smoothly without altering the authoritative position.
        // A measured stride length makes the planted foot travel with the body.
        double length=strideLength>.3f?strideLength:StrideMode=="walk"?1.9:StrideMode=="sprint"?3.5:carrying?2.9:3.3,cadence=strideSpeed/length;
        // Stride warping: below the clip's authored speed the cadence stays at
        // least MinCadenceShare of the authored one and each step is shorter.
        if(strideLength>.3f&&naturalCadence>0)cadence=Math.Max(cadence,MinCadenceShare*naturalCadence);
        cadence=Math.Clamp(cadence,.25,2.4);
        // At rest the scale returns to the authored pose while the stride fades out.
        StrideScale=actual<.2f?Mathf.MoveTowards(StrideScale,1,(float)dt/.35f):strideLength>.3f?Mathf.Clamp(strideSpeed/(float)(cadence*strideLength),.2f,1):1;
        if(actual>=.2)StridePhase+=dt*cadence;
        Phase=Mode=="brake"?.55+(nativeClock-transitionAt)*1.8:Mode.StartsWith("turn-")?.45+(nativeClock-transitionAt)*1.3:StridePhase;
        if(actual<.2){idleFor+=dt;StoppedFor=wasMoving?StoppedFor+dt:Math.Max(StoppedFor,1);}else{idleFor=0;StoppedFor=0;wasMoving=true;}
        if(StoppedFor>1)wasMoving=false;
        position=point;forward=facing;clock=nativeClock;
    }
    // The foot that last landed in the aligned cycle: left during the first half.
    bool Support(double cycleOffset){double c=StridePhase+cycleOffset;return c-Math.Floor(c)>=.5;}
    static float Recovery(double freshness,bool carrying,bool keeper){return carrying||keeper||freshness<0?0:(float)Math.Clamp((.55-freshness)/.55,0,1)*8;}
}
}

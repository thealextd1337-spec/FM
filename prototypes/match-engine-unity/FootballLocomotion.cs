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
    // Smoothed observed speed that selects and paces the stride clip.
    public float StrideSpeed=>strideSpeed;
    // Within run or backward motion: the faster of two measured clips, with
    // hysteresis so a speed near the boundary cannot alternate clips.
    public bool FastStride {get;private set;}
    public const float FastRunOn=4.2f,FastRunOff=3.8f,FastBackOn=2.3f,FastBackOff=2f;
    Vector3 position,forward;double clock=-1,brakeUntil,turnUntil,transitionAt;string turn;float strideSpeed,slowTurnAngle;
    // strideLength: measured metres per cycle of the clip that shows this stride
    // (0 keeps the earlier fixed cadence references).
    public void Sample(Vector3 point,Vector3 facing,double nativeClock,bool carrying,bool keeper,double freshness=-1,float strideLength=0){
        if(clock>=0&&nativeClock==clock)return;
        double dt=nativeClock-clock;
        var travel=point-position;travel.y=0;
        if(clock<0||dt<0||dt>1||travel.magnitude>7){position=point;forward=facing;clock=nativeClock;Speed=strideSpeed=slowTurnAngle=Acceleration=ForwardLean=TurnLean=0;RecoveryLean=Recovery(freshness,carrying,keeper);Phase=StridePhase=nativeClock;Mode=StrideMode="idle";MotionWeight=1;brakeUntil=turnUntil=0;FastStride=false;return;}
        float actual=travel.magnitude/(float)Math.Max(.0001,dt);
        Acceleration=Mathf.Lerp(Acceleration,Mathf.Clamp((actual-Speed)/(float)dt,-16,16),1-(float)Math.Exp(-dt/.12));
        if(Speed>2&&(actual<.3||Acceleration< -4&&actual<Speed)){if(nativeClock>=brakeUntil)transitionAt=nativeClock;brakeUntil=nativeClock+.20;}
        float angle=Vector3.SignedAngle(forward,facing,Vector3.up);
        // A pivot changes the received facing without translating the actor.
        // Accumulate only coherent, real angular motion at any speed: small
        // frames can show a turn, while alternating heading jitter stays idle.
        if(Math.Abs(angle)>.5&&Math.Abs(angle)>dt*110){
            slowTurnAngle=Math.Sign(slowTurnAngle)==Math.Sign(angle)?slowTurnAngle+angle:angle;
            slowTurnAngle=Math.Clamp(slowTurnAngle,-90,90);
        }else slowTurnAngle=0;
        bool movingTurn=actual>1&&Math.Abs(angle)>Math.Max(8,dt*110);
        if((movingTurn||Math.Abs(slowTurnAngle)>=8)&&nativeClock>=turnUntil){turn=angle<0?"turn-left":"turn-right";turnUntil=nativeClock+.18;transitionAt=nativeClock;slowTurnAngle=0;}
        Speed=actual;
        bool backward=travel.sqrMagnitude>.00001&&Vector3.Dot(travel.normalized,facing.normalized)<-.45f;
        strideSpeed=Mathf.Lerp(strideSpeed,actual,1-(float)Math.Exp(-dt/.08));
        float walkLimit=StrideMode=="walk"?1.95f:1.65f,sprintLimit=StrideMode=="sprint"?4.35f:4.9f;
        StrideMode=actual<.2?"idle":backward?"back":strideSpeed<walkLimit?"walk":(strideSpeed>sprintLimit||actual>5.2f)&&!carrying&&!keeper?"sprint":"run";
        FastStride=StrideMode=="run"?(FastStride?strideSpeed>FastRunOff:strideSpeed>FastRunOn):StrideMode=="back"?(FastStride?strideSpeed>FastBackOff:strideSpeed>FastBackOn):false;
        Mode=nativeClock<brakeUntil?"brake":nativeClock<turnUntil?turn:StrideMode;
        // A moving turn/brake keeps the received stride underneath it. A real
        // stationary pivot still uses the complete turn; no travel is invented.
        MotionWeight=Mode=="brake"||Mode.StartsWith("turn-")?actual<.2?1:Mathf.Clamp(.85f-actual*.09f,.35f,.85f):1;
        float lean=actual>.2||Mode=="brake"?Mathf.Clamp(Acceleration*.45f,-5,7):0;
        ForwardLean=Mathf.Lerp(ForwardLean,lean,1-(float)Math.Exp(-dt/.09));
        float bank=Mathf.Clamp(-(float)(angle/dt)*.025f*Mathf.Clamp01(actual/4),-6,6);
        TurnLean=Mathf.Lerp(TurnLean,bank,1-(float)Math.Exp(-dt/.12));
        RecoveryLean=Mathf.Lerp(RecoveryLean,Mode=="idle"?Recovery(freshness,carrying,keeper):0,1-(float)Math.Exp(-dt/.35));
        // Keep the stride independent of short turn/brake poses. Received jitter
        // changes cadence smoothly without altering the authoritative position.
        // A measured stride length makes the planted foot travel with the body.
        if(actual>=.2)StridePhase+=dt*Math.Clamp(strideSpeed/(strideLength>.3f?strideLength:StrideMode=="walk"?1.9:StrideMode=="sprint"?3.5:carrying?2.9:3.3),.25,2.4);
        Phase=Mode=="brake"?.55+(nativeClock-transitionAt)*1.8:Mode.StartsWith("turn-")?.45+(nativeClock-transitionAt)*1.3:StridePhase;
        position=point;forward=facing;clock=nativeClock;
    }
    static float Recovery(double freshness,bool carrying,bool keeper){return carrying||keeper||freshness<0?0:(float)Math.Clamp((.55-freshness)/.55,0,1)*8;}
}
}

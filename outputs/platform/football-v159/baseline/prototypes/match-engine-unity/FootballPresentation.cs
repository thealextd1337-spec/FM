using System;
using System.Collections.Generic;
using UnityEngine;
namespace Doppel6.Probe {
public partial class ProbeBridge {
    public AnimationClip passClip,receiveClip,keeperHighClip,keeperDiveClip,keeperRiseClip;
    public AnimationClip walkClip,fastRunClip,sprintClip,backClip,brakeClip,turnLeftClip,turnRightClip;
    readonly List<FootballAnimation> football=new List<FootballAnimation>();
    const double PassContact=.8,ReceiveContact=.7,ShotContact=.46;
    AnimationClip[] FootballClips(){return new[]{idleClip,runClip,keeperClip,keeperActionClip,shotClip,passClip,receiveClip,keeperHighClip,keeperDiveClip,keeperRiseClip,walkClip,fastRunClip,sprintClip,backClip,brakeClip,turnLeftClip,turnRightClip};}
    AnimationClip LocomotionClip(string mode,bool carrying,bool keeper){return mode=="walk"?walkClip:mode=="sprint"?sprintClip:mode=="back"?backClip:mode=="brake"?brakeClip:mode=="turn-left"?turnLeftClip:mode=="turn-right"?turnRightClip:mode=="run"?carrying?runClip:fastRunClip:keeper?keeperClip:idleClip;}
    FootballAnimation.Pose WorldFootballPose(WorldPose p,WorldFrame f,int i){
        var identity=worldView.Players[p.id];var pose=new FootballAnimation.Pose{clip=runSpeeds[i]>.2?runClip:identity.keeper?keeperClip:idleClip,time=runSpeeds[i]>.2?animationTimes[i]+i*.09:f.clock+i*.09,loop=true,key=p.actionId??p.action,kind="foot"};
        var locomotion=worldLocomotion[i];
        locomotion.Sample(V(p.position),V(p.facing),f.clock,f.owner==p.id,identity.keeper,p.freshness);
        bool carrying=f.owner==p.id&&!identity.keeper;
        pose.clip=LocomotionClip(locomotion.Mode,carrying,identity.keeper);
        pose.time=locomotion.Mode=="idle"?f.clock+i*.09:locomotion.Phase;
        pose.loop=locomotion.Mode!="brake"&&!locomotion.Mode.StartsWith("turn-");
        var strideClip=LocomotionClip(locomotion.StrideMode,carrying,identity.keeper);double strideTime=locomotion.StrideMode=="idle"?f.clock+i*.09:locomotion.StridePhase;bool strideLoop=true;
        bool locomotionAction=string.IsNullOrEmpty(p.action)||p.action=="idle"||p.action=="run"||p.action=="running";
        if(locomotionAction&&pose.clip!=strideClip&&locomotion.Speed>.2f){pose.baseClip=strideClip;pose.baseTime=strideTime;pose.baseLoop=true;pose.actionWeight=locomotion.MotionWeight;}
        double progress=Math.Clamp(p.progress,0,1),age=progress*p.duration;
        if(p.action=="pass"||p.action=="highPass"||p.action=="cross"){pose.clip=passClip;pose.time=PassContact+age;pose.loop=false;pose.plant=runSpeeds[i]<.4&&age<.7;pose.contact=age<.09;}
        else if(p.action=="receive"||p.action=="control"){pose.clip=receiveClip;pose.time=ReceiveContact+age;pose.loop=false;pose.plant=runSpeeds[i]<.4&&age<.35;pose.contact=age<.12;}
        else if(p.action=="passReady"){pose.clip=passClip;pose.time=progress*PassContact;pose.loop=false;pose.plant=runSpeeds[i]<.4;}
        else if(p.action=="shot"||p.action=="freeKick"||p.action=="volley"||p.action=="goalKick"){pose.clip=shotClip;pose.time=ShotContact+age;pose.loop=false;pose.plant=runSpeeds[i]<.4&&age<.55;pose.contact=age<.09;}
        else if(p.action=="kickReady"){pose.clip=shotClip;pose.time=progress*ShotContact;pose.loop=false;pose.plant=runSpeeds[i]<.4;}
        else if(identity.keeper&&p.action=="save"){
            pose.clip=p.contactPoint?.Length==3&&p.contactPoint[1]>1.6?keeperHighClip:p.contactPoint?.Length==3&&Math.Abs(p.contactPoint[2]-p.position[2])>1.2?keeperDiveClip:keeperActionClip;
            pose.time=Math.Clamp(progress,0,1)*Math.Min(pose.clip.length,1.45);pose.loop=false;pose.kind="hand";pose.contact=progress>.78&&p.contactPoint?.Length==3&&Vector3.Distance(V(p.contactPoint),ballView.position)<.6f;
            if(p.recovery>.35){pose.clip=keeperRiseClip;pose.time=(p.recovery-.35)/.65*(pose.clip.length-.001);pose.contact=false;}
        }
        pose.target=p.contactPoint?.Length==3?V(p.contactPoint):ballView.position;
        if(FootballActionTiming.IsFootAction(p.action)){
            // Contacts override the stride. The following native motion is already
            // known, so its legs return promptly instead of holding a static kick.
            pose.baseClip=strideClip;pose.baseTime=strideLoop?strideTime:locomotion.Phase;pose.baseLoop=strideLoop;
            pose.actionWeight=FootballActionTiming.Weight(p.action,age,progress,locomotion.Speed);
        }else if(carrying&&locomotion.Speed>.2f&&locomotion.Mode!="back"&&locomotion.Mode!="brake"&&!locomotion.Mode.StartsWith("turn-")){
            // Only a visual reach during an observed carrier stride: no extra ball
            // impulse, gameplay touch or predicted action is emitted.
            double cycle=strideTime/Math.Max(.001,runClip.length);double phase=cycle-Math.Floor(cycle);
            pose.contact=(phase>.13&&phase<.25)||(phase>.63&&phase<.75);
            pose.kind=phase<.5?"foot":"left-foot";
            pose.contact&=ballView.position.y<.45f;
        }
        // A contact correction is permitted only close to the native ball/contact,
        // never merely because an old kick animation is still following through.
        if(pose.kind!="hand")pose.contact&=Vector3.Distance(pose.target,actors[i].position)<1.4f&&Vector3.Distance(pose.target,ballView.position)<1;
        if(!identity.keeper&&locomotionAction){
            pose.forwardLean=locomotion.ForwardLean;pose.turnLean=locomotion.TurnLean;pose.recoveryLean=locomotion.RecoveryLean;
        }
        return pose;
    }
    FootballAnimation.Pose DemoFootballPose(Actor a,State s){
        double age=Math.Max(0,s.elapsed-a.poseStarted);var read=ProbePose.Read(a,s);
        var pose=new FootballAnimation.Pose{clip=read.clip=="running"?runClip:a.role=="keeper"?keeperClip:idleClip,time=s.elapsed,loop=true,key=a.pose+":"+a.poseStarted,kind=read.kind,target=V(read.point)};
        double received=-1;for(int e=s.events.Count-1;e>=0;e--)if(s.events[e].actorId==a.id&&s.events[e].type=="received"){received=s.events[e].time;break;}
        if(a.pose=="prepare-pass"&&age<1.35){pose.clip=passClip;pose.time=age<=.65?age/.65*PassContact:PassContact+age-.65;pose.loop=false;pose.plant=age<1.15;pose.contact=age>=.53&&age<.73;}
        else if(received>=0&&s.elapsed-received<.22){pose.clip=receiveClip;pose.time=ReceiveContact+s.elapsed-received;pose.loop=false;pose.plant=true;pose.contact=true;}
        else if(a.pose=="prepare-shot"&&age<1.5){pose.clip=shotClip;pose.time=age<=.75?Math.Max(0,age-.22)/.53*ShotContact:ShotContact+age-.75;pose.loop=false;pose.plant=age<1.15;pose.contact=age>=.63&&age<.83;}
        else if(a.pose=="parry"&&age<1.3){pose.clip=keeperActionClip;pose.time=1.1+age;pose.loop=false;pose.kind="hand";pose.contact=age<.2;}
        if(read.kind=="hand"&&read.active){pose.clip=keeperActionClip;pose.time=1.1;pose.loop=false;pose.contact=true;}
        return pose;
    }
    void RenderDemoFootball(int i,Actor actor,State state){
        var pose=DemoFootballPose(actor,state);football[i].Sample(pose,state.elapsed);
        if(pose.contact){var actual=football[i].rig.Contact(pose.target,pose.kind);contactPoses.Add(new ContactPose{id=actor.id,kind=pose.kind,target=new[]{(double)pose.target.x,pose.target.y,pose.target.z},actual=new[]{(double)actual.x,actual.y,actual.z},error=football[i].rig.contactError,clip=pose.clip.name,time=pose.time,plantError=football[i].rig.plantError,reachable=football[i].rig.reachable});}
    }
}
}

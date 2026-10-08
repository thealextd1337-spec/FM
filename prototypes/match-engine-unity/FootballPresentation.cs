using System;
using System.Collections.Generic;
using UnityEngine;
namespace Doppel6.Probe {
public partial class ProbeBridge {
    public AnimationClip passClip,receiveClip,keeperHighClip,keeperDiveClip,keeperRiseClip;
    public AnimationClip walkClip,fastRunClip,sprintClip,backClip,brakeClip,turnLeftClip,turnRightClip;
    // Further existing clips of the same rig (football-v130.fbx); all optional.
    public AnimationClip jogClip,fastBackClip,turnIdleLeftClip,turnIdleRightClip,turnWalkLeftClip,turnWalkRightClip,celebrateArmsClip,celebrateFistClip,celebrateVictoryClip,foulFallClip;
    readonly List<FootballAnimation> football=new List<FootballAnimation>();
    const double PassContact=.8,ReceiveContact=.7,ShotContact=.46;
    // Native foul windows last 2.7 s: measured fall (hips reach the ground near
    // 1.0 s of foul_fall_meshy) followed by the measured rise window of
    // keeper_rise_meshy (hips 0.37 m -> 1.30 m between 4.4 s and 6.3 s).
    const double FoulWindow=2.7,FoulFall=1.6,RiseFrom=4.4,RiseLength=1.9;
    AnimationClip[] FootballClips(){return new[]{idleClip,runClip,keeperClip,keeperActionClip,shotClip,passClip,receiveClip,keeperHighClip,keeperDiveClip,keeperRiseClip,walkClip,fastRunClip,sprintClip,backClip,brakeClip,turnLeftClip,turnRightClip,jogClip,fastBackClip,turnIdleLeftClip,turnIdleRightClip,turnWalkLeftClip,turnWalkRightClip,celebrateArmsClip,celebrateFistClip,celebrateVictoryClip,foulFallClip};}
    // The clip whose measured stride matches the observed speed band.
    AnimationClip StrideClip(string mode,bool carrying,bool keeper,bool fast){
        if(mode=="walk")return walkClip;if(mode=="sprint")return sprintClip;
        if(mode=="back")return fast&&fastBackClip!=null?fastBackClip:backClip;
        if(mode=="run")return !fast&&jogClip!=null?jogClip:carrying?runClip:fastRunClip;
        return keeper?keeperClip:idleClip;
    }
    AnimationClip LocomotionClip(FootballLocomotion m,bool carrying,bool keeper){
        if(m.Mode=="brake")return brakeClip;
        if(m.Mode.StartsWith("turn-")){
            bool left=m.Mode=="turn-left";
            // A stationary pivot, a walking and a running turn use their own clips.
            var clip=m.Speed<.2f?(left?turnIdleLeftClip:turnIdleRightClip):m.StrideSpeed<2?(left?turnWalkLeftClip:turnWalkRightClip):null;
            return clip??(left?turnLeftClip:turnRightClip);
        }
        return StrideClip(m.StrideMode,carrying,keeper,m.FastStride);
    }
    // The existing turn window was tuned on turn_run_*; other turns keep its share of the clip.
    double TurnTime(AnimationClip clip,double phase){return clip==brakeClip||turnLeftClip==null?phase:phase*clip.length/Math.Max(.001,turnLeftClip.length);}
    // The native ground ball centre is 0.29 m; the rendered ball radius is
    // 0.1764 m. Ground balls rest on the turf, and the correction fades out by
    // 1.29 m so a high ball keeps its received height near the crossbar.
    public static float DisplayHeight(double y){float lift=.29f-WorldBallMotion.Radius;return (float)(y-lift*Math.Clamp(1-(y-.29),0,1));}
    static Vector3 Display(double[] p){return new Vector3((float)p[0],DisplayHeight(p[1]),(float)p[2]);}
    // Reach weight shortly before a measured footfall (a share of the cycle).
    static float Reach(double phase,float footfall){double d=((footfall-phase)%1+1)%1;return d>=.05&&d<=.17?(float)Math.Sin(Math.PI*(d-.05)/.12):0;}
    FootballAnimation.Pose WorldFootballPose(WorldPose p,WorldFrame f,int i){
        var identity=worldView.Players[p.id];var pose=new FootballAnimation.Pose{clip=runSpeeds[i]>.2?runClip:identity.keeper?keeperClip:idleClip,time=runSpeeds[i]>.2?animationTimes[i]+i*.09:f.clock+i*.09,loop=true,key=p.actionId??p.action,kind="foot"};
        var locomotion=worldLocomotion[i];
        bool carrying=f.owner==p.id&&!identity.keeper;
        // Cadence follows the measured stride of the clip that shows this speed band.
        var preview=StrideClip(locomotion.StrideMode,carrying,identity.keeper,locomotion.FastStride);
        locomotion.Sample(V(p.position),V(p.facing),f.clock,f.owner==p.id,identity.keeper,p.freshness,FootballStride.Length(preview));
        pose.clip=LocomotionClip(locomotion,carrying,identity.keeper);
        bool turnOrBrake=locomotion.Mode=="brake"||locomotion.Mode.StartsWith("turn-");
        pose.time=locomotion.Mode=="idle"?f.clock+i*.09:turnOrBrake?TurnTime(pose.clip,locomotion.Phase):FootballStrideTiming.Time(locomotion.StridePhase+i*.09,pose.clip);
        pose.loop=!turnOrBrake;
        var strideClip=StrideClip(locomotion.StrideMode,carrying,identity.keeper,locomotion.FastStride);double strideTime=locomotion.StrideMode=="idle"?f.clock+i*.09:FootballStrideTiming.Time(locomotion.StridePhase+i*.09,strideClip);bool strideLoop=true;
        bool locomotionAction=string.IsNullOrEmpty(p.action)||p.action=="idle"||p.action=="run"||p.action=="running";
        if(locomotionAction&&pose.clip!=strideClip&&locomotion.Speed>.2f){pose.baseClip=strideClip;pose.baseTime=strideTime;pose.baseLoop=true;pose.actionWeight=locomotion.MotionWeight;}
        double progress=Math.Clamp(p.progress,0,1),age=progress*p.duration;
        var contactPoint=p.contactPoint?.Length==3?Display(p.contactPoint):(Vector3?)null;
        // A booked native goal: the scoring side celebrates where it already stands.
        if(f.celebrating&&locomotionAction&&locomotion.Speed<.6f&&identity.team==f.celebrationTeam&&!identity.keeper){
            bool scorer=p.id==f.celebrationScorer;var clip=scorer?celebrateVictoryClip:i%2==0?celebrateArmsClip:celebrateFistClip;
            if(clip!=null){pose.clip=clip;pose.time=f.celebrationTime+(scorer?0:i*.37);pose.loop=true;pose.baseClip=null;pose.key="celebration:"+f.celebrationTeam+":"+f.celebrationScorer;}
        }
        if(p.action=="pass"||p.action=="highPass"||p.action=="cross"){pose.clip=passClip;pose.time=PassContact+age;pose.loop=false;pose.plant=runSpeeds[i]<.4&&age<.7;pose.contact=age<.09;}
        else if(p.action=="receive"||p.action=="control"){pose.clip=receiveClip;pose.time=ReceiveContact+age;pose.loop=false;pose.plant=runSpeeds[i]<.4&&age<.35;pose.contact=age<.12;}
        else if(p.action=="passReady"){pose.clip=passClip;pose.time=progress*PassContact;pose.loop=false;pose.plant=runSpeeds[i]<.4;}
        else if(p.action=="shot"||p.action=="freeKick"||p.action=="volley"||p.action=="goalKick"){pose.clip=shotClip;pose.time=ShotContact+age;pose.loop=false;pose.plant=runSpeeds[i]<.4&&age<.55;pose.contact=age<.09;}
        else if(p.action=="kickReady"){pose.clip=shotClip;pose.time=progress*ShotContact;pose.loop=false;pose.plant=runSpeeds[i]<.4;}
        else if(p.action=="foulVictim"&&foulFallClip!=null&&keeperRiseClip!=null){
            double foul=progress*FoulWindow;
            if(foul<FoulFall){pose.clip=foulFallClip;pose.time=foul*1.15;}else{pose.clip=keeperRiseClip;pose.time=RiseFrom+(foul-FoulFall)/(FoulWindow-FoulFall)*RiseLength;}
            pose.loop=false;pose.baseClip=null;
        }
        else if(identity.keeper&&p.action=="save"){
            pose.clip=p.contactPoint?.Length==3&&p.contactPoint[1]>1.6?keeperHighClip:p.contactPoint?.Length==3&&Math.Abs(p.contactPoint[2]-p.position[2])>1.2?keeperDiveClip:keeperActionClip;
            pose.time=FootballKeeperTiming.Time(pose.clip.name,progress);pose.loop=false;pose.urgent=true;pose.kind=contactPoint.HasValue&&actors[i].InverseTransformPoint(contactPoint.Value).x<0?"left-hand":"hand";pose.contact=progress>.78&&contactPoint.HasValue&&Vector3.Distance(contactPoint.Value,ballView.position)<.6f;
            // A central ball at chest or head height is met with both palms.
            if(contactPoint.HasValue){var offset=contactPoint.Value-actors[i].position;if(Mathf.Abs(Vector3.Dot(offset,actors[i].right))<.45f&&contactPoint.Value.y>.5f&&contactPoint.Value.y<2.3f)pose.kind="two-hands";}
            if(pose.clip==keeperDiveClip)pose.keeperDive=(float)(Math.Clamp(progress/.7,0,1)*(1-Math.Clamp(p.recovery/.55,0,1)));
            if(p.recovery>.35){pose.clip=keeperRiseClip;pose.time=(p.recovery-.35)/.65*(pose.clip.length-.001);pose.contact=false;}
        }
        else if((p.action=="header"||p.action=="airReady")&&contactPoint.HasValue){
            // The head and upper body turn toward the actual aerial contact, within HeadReach.
            pose.kind="head";pose.contact=Vector3.Distance(contactPoint.Value,actors[i].position)<2.6f&&Vector3.Distance(contactPoint.Value,ballView.position)<1.2f;
            pose.contactWeight=Mathf.Clamp(p.action=="airReady"?(float)progress*.8f:1-(float)progress,.001f,.999f);
        }
        else if(p.action=="throw"&&ballView.position.y>1f&&Vector3.Distance(ballView.position,actors[i].position+Vector3.up*ballView.position.y)<1.3f){pose.kind="two-hands";pose.contact=true;}
        pose.target=p.action=="throw"&&pose.kind=="two-hands"?ballView.position:contactPoint??ballView.position;
        if(FootballActionTiming.IsFootAction(p.action)){
            // Contacts override the stride. The following native motion is already
            // known, so its legs return promptly instead of holding a static kick.
            pose.baseClip=strideClip;pose.baseTime=strideLoop?strideTime:locomotion.Phase;pose.baseLoop=strideLoop;
            pose.actionWeight=FootballActionTiming.Weight(p.action,age,progress,locomotion.Speed);
        }else if(carrying&&locomotion.Speed>.2f&&locomotion.Mode!="back"&&locomotion.Mode!="brake"&&!locomotion.Mode.StartsWith("turn-")){
            // Only a visual reach during an observed carrier stride: no extra ball
            // impulse, gameplay touch or predicted action is emitted. The swing leg
            // reaches shortly before the other foot's measured footfall.
            double cycle=strideTime/Math.Max(.001,strideClip.length);double phase=cycle-Math.Floor(cycle);
            float right=Reach(phase,FootballStride.Footfall(strideClip)),left=Reach(phase,FootballStride.RightFootfall(strideClip));
            pose.contact=(right>0||left>0)&&ballView.position.y<.45f;
            pose.kind=right>0?"foot":"left-foot";pose.contactWeight=Mathf.Clamp(Mathf.Max(right,left),.001f,.999f);
        }
        // A contact correction is permitted only close to the native ball/contact,
        // never merely because an old kick animation is still following through.
        if(pose.kind=="foot"||pose.kind=="left-foot")pose.contact&=Vector3.Distance(pose.target,actors[i].position)<1.4f&&Vector3.Distance(pose.target,ballView.position)<1;
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

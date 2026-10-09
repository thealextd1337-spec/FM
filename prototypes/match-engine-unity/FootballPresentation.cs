using System;
using System.Collections.Generic;
using UnityEngine;
namespace Doppel6.Probe {
public partial class ProbeBridge {
    public AnimationClip passClip,receiveClip,keeperHighClip,keeperDiveClip,keeperRiseClip;
    public AnimationClip walkClip,fastRunClip,sprintClip,backClip,brakeClip,turnLeftClip,turnRightClip;
    // Further existing clips of the same rig (football-v130.fbx); all optional.
    public AnimationClip jogClip,fastBackClip,turnIdleLeftClip,turnIdleRightClip,turnWalkLeftClip,turnWalkRightClip,celebrateArmsClip,celebrateFistClip,celebrateVictoryClip,foulFallClip,foulStumbleClip,keeperShuffleClip;
    readonly List<FootballAnimation> football=new List<FootballAnimation>();
    const double PassContact=.8,ReceiveContact=.7,ShotContact=.46;
    // Native foul windows last 2.7 s: measured fall (hips reach the ground near
    // 1.0 s of foul_fall_meshy) followed by the measured rise window of
    // keeper_rise_meshy (hips 0.37 m -> 1.30 m between 4.4 s and 6.3 s).
    const double FoulWindow=2.7,FoulFall=1.6,RiseFrom=4.4,RiseLength=1.9;
    AnimationClip[] FootballClips(){return new[]{idleClip,runClip,keeperClip,keeperActionClip,shotClip,passClip,receiveClip,keeperHighClip,keeperDiveClip,keeperRiseClip,walkClip,fastRunClip,sprintClip,backClip,brakeClip,turnLeftClip,turnRightClip,jogClip,fastBackClip,turnIdleLeftClip,turnIdleRightClip,turnWalkLeftClip,turnWalkRightClip,celebrateArmsClip,celebrateFistClip,celebrateVictoryClip,foulFallClip,foulStumbleClip,keeperShuffleClip};}
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
        locomotion.Sample(V(p.position),V(p.facing),f.clock,f.owner==p.id,identity.keeper,p.freshness,football[i].StrideLength(preview));
        pose.clip=LocomotionClip(locomotion,carrying,identity.keeper);
        bool turnOrBrake=locomotion.Mode=="brake"||locomotion.Mode.StartsWith("turn-");
        pose.time=locomotion.Mode=="idle"?f.clock+i*.09:turnOrBrake?TurnTime(pose.clip,locomotion.Phase):football[i].StrideTime(locomotion.StridePhase+i*.09,pose.clip);
        pose.loop=!turnOrBrake;
        // Keeper side steps from observed lateral travel relative to the received
        // facing. keeper_shuffle_meshy steps to the keeper's left; the right uses
        // the same cycle reversed. Its measured cadence is slow, so 0.55 cycles
        // per stride cycle keeps the steps readable.
        if(identity.keeper&&keeperShuffleClip!=null&&!turnOrBrake&&Math.Abs(locomotion.Lateral)>.72f&&locomotion.Speed>.12f&&locomotion.Speed<4.1f){
            double cycle=locomotion.StridePhase*.55*keeperShuffleClip.length;pose.clip=keeperShuffleClip;pose.time=locomotion.Lateral<0?cycle:-cycle;pose.loop=true;
        }
        var strideClip=StrideClip(locomotion.StrideMode,carrying,identity.keeper,locomotion.FastStride);double strideTime=locomotion.StrideMode=="idle"?f.clock+i*.09:football[i].StrideTime(locomotion.StridePhase+i*.09,strideClip);bool strideLoop=true;
        bool locomotionAction=string.IsNullOrEmpty(p.action)||p.action=="idle"||p.action=="run"||p.action=="running";
        if(locomotionAction&&pose.clip!=strideClip&&locomotion.Speed>.2f){pose.baseClip=strideClip;pose.baseTime=strideTime;pose.baseLoop=true;pose.actionWeight=locomotion.MotionWeight;}
        // A native goal-kick follow-through counts its progress over 0.45 s; the
        // picture carries no duration for it.
        double progress=Math.Clamp(p.progress,0,1),age=progress*(p.action=="goalKick"&&p.phase=="follow"?GoalKickFollow:p.duration);
        var contactPoint=p.contactPoint?.Length==3?Display(p.contactPoint):(Vector3?)null;
        // A booked native goal: the scoring side celebrates where it already stands.
        if(f.celebrating&&locomotionAction&&locomotion.Speed<.6f&&identity.team==f.celebrationTeam&&!identity.keeper){
            bool scorer=p.id==f.celebrationScorer;var clip=scorer?celebrateVictoryClip:i%2==0?celebrateArmsClip:celebrateFistClip;
            if(clip!=null){pose.clip=clip;pose.time=f.celebrationTime+(scorer?0:i*.37);pose.loop=true;pose.baseClip=null;pose.key="celebration:"+f.celebrationTeam+":"+f.celebrationScorer;}
        }
        if(p.action=="pass"||p.action=="highPass"||p.action=="cross"){
            pose.clip=passClip;pose.time=PassContact+age;pose.loop=false;pose.plant=runSpeeds[i]<.4&&age<.7;pose.contact=age<.09;
            // A lofted delivery swings through higher once the native contact is over.
            if(p.action!="pass")pose.loft=FootballKickTiming.FollowThrough(age)*.85f;
        }
        else if(p.action=="receive"||p.action=="control"){
            pose.clip=receiveClip;pose.time=ReceiveContact+age;pose.loop=false;pose.plant=runSpeeds[i]<.4&&age<.35;pose.contact=age<.12;
            // An actual aerial control (native flag) lands from the contact; a
            // chest-high ball is not forced onto the foot.
            if(p.aerial){AirPose(ref pose,p.action,progress,contactPoint,identity.keeper,i,false);pose.plant=false;if(contactPoint.HasValue&&contactPoint.Value.y>.9f)pose.contact=false;}
        }
        else if(p.action=="passReady"){pose.clip=passClip;pose.time=progress*PassContact;pose.loop=false;pose.plant=runSpeeds[i]<.4;}
        else if(p.action=="goalKick"&&p.phase=="waiting"){
            // Native goal-kick wait: the keeper stands behind the placed ball and
            // winds up over the native countdown (progress); the contact belongs
            // to the release (phase follow), never to the whole wait.
            pose.clip=shotClip;pose.time=progress*ShotContact;pose.loop=false;pose.plant=runSpeeds[i]<.4;
        }
        else if(p.action=="shot"||p.action=="freeKick"||p.action=="volley"||p.action=="goalKick"){
            pose.clip=shotClip;pose.time=ShotContact+age;pose.loop=false;pose.plant=runSpeeds[i]<.4&&age<.55;pose.contact=age<.09;
            // The picture has no goal-kick phase: its follow-through waits until
            // the actual ball has left the kicker, never during the run-up.
            if(p.action=="volley")pose.volley=FootballKickTiming.FollowThrough(age);
            else if(p.action=="goalKick"&&Horizontal(ballView.position-actors[i].position)>GoalKickGone)pose.loft=FootballKickTiming.FollowThrough(age);
        }
        else if(p.action=="kickReady"){pose.clip=shotClip;pose.time=progress*ShotContact;pose.loop=false;pose.plant=runSpeeds[i]<.4;}
        else if(p.action=="foulVictim"&&foulFallClip!=null&&keeperRiseClip!=null){
            double foul=progress*FoulWindow;
            if(foul<FoulFall){pose.clip=foulFallClip;pose.time=foul*1.15;}else{pose.clip=keeperRiseClip;pose.time=RiseFrom+(foul-FoulFall)/(FoulWindow-FoulFall)*RiseLength;}
            pose.loop=false;pose.baseClip=null;
        }
        else if((p.action=="slide"||p.action=="slideRecovery")&&!identity.keeper){
            // Observed native slide (0.65 s) and its recovery. No slide clip
            // exists on this rig: a frozen stride carries the procedural slide,
            // then keeper_rise_meshy lifts the body from its measured low pose.
            var aim=contactPoint??actors[i].position+actors[i].forward;
            pose.leftLead=FootballDuelTiming.LeftLead(actors[i].InverseTransformPoint(aim),identity.number);pose.kind="slide";pose.urgent=true;pose.baseClip=null;
            if(p.action=="slide"||keeperRiseClip==null){pose.clip=sprintClip??runClip;pose.time=football[i].StrideTime(pose.leftLead?.5:0,pose.clip);pose.loop=true;pose.slide=p.action=="slide"?FootballDuelTiming.Slide(progress):FootballDuelTiming.Recovery(progress);}
            else{pose.clip=keeperRiseClip;pose.time=FootballDuelTiming.RiseTime(progress);pose.loop=false;pose.slide=FootballDuelTiming.Recovery(progress);}
        }
        else if(p.action=="tackle"){
            // Standing tackle: the native contact is at progress 0; the foot reaches
            // the actual ball, the body lunges and then follows through.
            pose.clip=receiveClip;pose.time=ReceiveContact+age;pose.loop=false;pose.plant=runSpeeds[i]<.4&&age<.3;pose.contact=age<.12;
            pose.kind=contactPoint.HasValue&&actors[i].InverseTransformPoint(contactPoint.Value).x<0?"left-foot":"foot";pose.lunge=FootballDuelTiming.Lunge(progress);
        }
        else if(p.action=="foulOffender"){
            // The challenge lunge fades while the upright stumble plays; the body
            // settles into its standing pose by the end of the 2.7 s window.
            double foul=progress*FoulWindow;var stand=identity.keeper?keeperClip:idleClip;
            if(foulStumbleClip!=null){pose.clip=foulStumbleClip;pose.time=Math.Min(foul,FootballDuelTiming.StumbleLength);pose.loop=false;pose.baseClip=stand;pose.baseTime=f.clock+i*.09;pose.baseLoop=true;pose.actionWeight=FootballDuelTiming.OffenderStumble(foul);}
            else{pose.clip=stand;pose.time=f.clock+i*.09;pose.loop=true;pose.baseClip=null;}
            pose.lunge=FootballDuelTiming.OffenderLunge(foul);
        }
        else if(identity.keeper&&p.action=="save"){
            // High, diving, upright (mid) or low save relative to the keeper's received facing.
            var facing=V(p.facing);var save=p.contactPoint?.Length==3?FootballKeeperTiming.SaveKind(V(p.contactPoint),V(p.position),facing.sqrMagnitude>.0001f?facing:actors[i].forward):"low";
            pose.clip=save=="high"?keeperHighClip:save=="dive"?keeperDiveClip:keeperActionClip;
            // A native conceded goal is a miss: the reach stays, but no hand is
            // corrected onto the ball that passes into the goal.
            bool conceded=p.goalKnown&&p.goal;
            pose.time=save=="mid"?FootballKeeperTiming.MidTime(progress):FootballKeeperTiming.Time(pose.clip.name,progress);pose.loop=false;pose.urgent=true;pose.kind=contactPoint.HasValue&&actors[i].InverseTransformPoint(contactPoint.Value).x<0?"left-hand":"hand";pose.contact=!conceded&&progress>.78&&contactPoint.HasValue&&Vector3.Distance(contactPoint.Value,ballView.position)<.6f;
            // A central ball at chest or head height is met with both palms.
            if(contactPoint.HasValue){var offset=contactPoint.Value-actors[i].position;if(Mathf.Abs(Vector3.Dot(offset,actors[i].right))<.45f&&contactPoint.Value.y>.5f&&contactPoint.Value.y<2.3f)pose.kind="two-hands";}
            if(pose.clip==keeperDiveClip)pose.keeperDive=(float)(Math.Clamp(progress/.7,0,1)*(1-Math.Clamp(p.recovery/.55,0,1)));
            if(p.recovery>0){
                // Recovery continues the authored landing/standing of this clip;
                // only a grounded body uses keeper_rise_meshy. A softer blend.
                pose.urgent=false;
                var body=FootballKeeperTiming.RecoveryPose(save,p.recovery,out var time);
                if(body==FootballKeeperTiming.Recovery.Clip)pose.time=time;
                else if(body==FootballKeeperTiming.Recovery.Ready&&keeperClip!=null){pose.clip=keeperClip;pose.time=f.clock+i*.09;pose.loop=true;}
                else if(body==FootballKeeperTiming.Recovery.Rise&&keeperRiseClip!=null){pose.clip=keeperRiseClip;pose.time=time;pose.contact=false;}
                // Native catch: saved, not parried, the keeper owns the ball and it
                // is not in flight. Only these known facts hold the actual ball.
                // Hands hold only a ball within arm reach. The native caught ball rests
                // at the contact, 1.1-1.9 m from the keeper root, which the arms cannot
                // reach: no hold is claimed and no contact cuts the recovery blend.
                // Without these facts a ball near the hands is never held.
                if(FootballKeeperTiming.Held(p,f)){pose.kind="two-hands";pose.target=ballView.position;contactPoint=ballView.position;pose.contact=ballView.gameObject.activeSelf&&Horizontal(ballView.position-actors[i].position)<HoldReach&&ballView.position.y<2.4f;}
                else pose.contact=false;
            }
        }
        else if(p.action=="header"||p.action=="airReady"||p.action=="airLand"){
            // Preparation, jump, contact and landing from the native phase. The
            // losing contender (airLand) jumps and lands without a contact.
            AirPose(ref pose,p.action,progress,contactPoint,identity.keeper,i,true);
            if(p.action!="airLand"&&contactPoint.HasValue){
                // The head and upper body turn toward the actual aerial contact, within HeadReach.
                pose.kind="head";pose.contact=Vector3.Distance(contactPoint.Value,actors[i].position)<HeaderReach&&Vector3.Distance(contactPoint.Value,ballView.position)<1.2f;
                pose.contactWeight=Mathf.Clamp(p.action=="airReady"?(float)progress*.8f:1-(float)progress,.001f,.999f);
            }
        }
        else if(p.action=="throw"&&(p.holdingKnown||p.pickup>=0)){
            // Native throw-in phases: pickup and wind-up while holding, then the
            // release follow-through (native release states holding:false and has
            // no pickup). Pictures without the fields keep the legacy branch below.
            // The hands hold only the actual nearby ball.
            pose.clip=identity.keeper?keeperClip:idleClip;pose.time=.4;pose.loop=true;pose.baseClip=null;pose.plant=false;
            if(p.holding){
                double pickup=p.pickup>=0?p.pickup:1;pose.throwBend=FootballThrowTiming.Bend(pickup);pose.throwRaise=FootballThrowTiming.Raise(pickup);pose.throwArch=FootballThrowTiming.Arch(progress);
                if(ballView.gameObject.activeSelf&&Horizontal(ballView.position-actors[i].position)<1.3f){pose.kind="two-hands";pose.contact=true;}
            }else{pose.throwArch=FootballThrowTiming.ReleaseArch(progress);pose.throwRaise=FootballThrowTiming.ReleaseRaise(progress);pose.throwRelease=FootballThrowTiming.Whip(progress);}
        }
        else if(p.action=="throw"&&ballView.position.y>1f&&Vector3.Distance(ballView.position,actors[i].position+Vector3.up*ballView.position.y)<1.3f){pose.kind="two-hands";pose.contact=true;}
        pose.target=p.action=="throw"&&pose.kind=="two-hands"?ballView.position:contactPoint??ballView.position;
        if(FootballActionTiming.IsFootAction(p.action)){
            // Contacts override the stride. The following native motion is already
            // known, so its legs return promptly instead of holding a static kick.
            pose.baseClip=strideClip;pose.baseTime=strideLoop?strideTime:locomotion.Phase;pose.baseLoop=strideLoop;
            pose.actionWeight=FootballActionTiming.Weight(p.action=="goalKick"&&p.phase=="waiting"?"kickReady":p.action,age,progress,locomotion.Speed);
        }else if(locomotionAction&&carrying&&locomotion.Speed>.2f&&locomotion.Mode!="back"&&locomotion.Mode!="brake"&&!locomotion.Mode.StartsWith("turn-")){
            // Only a visual reach during an observed carrier stride: no extra ball
            // impulse, gameplay touch or predicted action is emitted. The swing leg
            // reaches shortly before the other foot's measured footfall.
            double cycle=strideTime/Math.Max(.001,strideClip.length);double phase=cycle-Math.Floor(cycle);
            float right=Reach(phase,football[i].Footfall(strideClip)),left=Reach(phase,football[i].RightFootfall(strideClip));
            pose.contact=(right>0||left>0)&&ballView.position.y<.45f;
            pose.kind=right>0?"foot":"left-foot";pose.contactWeight=Mathf.Clamp(Mathf.Max(right,left),.001f,.999f);
        }
        // A contact correction is permitted only close to the native ball/contact,
        // never merely because an old kick animation is still following through.
        if(pose.kind=="foot"||pose.kind=="left-foot")pose.contact&=Vector3.Distance(pose.target,actors[i].position)<1.4f&&Vector3.Distance(pose.target,ballView.position)<1;
        if(!identity.keeper&&locomotionAction){
            pose.forwardLean=locomotion.ForwardLean;pose.turnLean=locomotion.TurnLean;pose.recoveryLean=locomotion.RecoveryLean;
        }
        if(identity.keeper&&FootballKeeperTiming.VisualHeld(p,f)){pose.ballHeld=true;pose.kind="two-hands";pose.contact=false;pose.baseClip=null;}
        if(locomotionAction&&!pose.contact){pose.strideYaw=pose.clip==keeperShuffleClip?0:locomotion.StrideYaw;pose.turnLean+=-locomotion.Lateral*Mathf.Clamp01(locomotion.Speed/4)*5;}
        return pose;
    }
    // Native header distance; the goal-kick ball has left its kicker beyond GoalKickGone.
    const float HeaderReach=2.6f,GoalKickGone=1.5f;
    const double GoalKickFollow=.45;
    const float HoldReach=.9f;
    static float Horizontal(Vector3 v){v.y=0;return v.magnitude;}
    // Aerial body from the native phase: preparation counts toward the arrival,
    // contact actions start at the apex and land by their end. upright: a
    // standing base replaces the stride once airborne (the stride would run in the air).
    void AirPose(ref FootballAnimation.Pose pose,string action,double progress,Vector3? contact,bool keeper,int i,bool upright){
        bool ready=action=="airReady";
        float lift=ready?FootballAirTiming.ReadyLift(progress):FootballAirTiming.FallLift(progress),crouch=ready?FootballAirTiming.ReadyCrouch(progress):FootballAirTiming.Landing(progress);
        pose.airLift=lift;pose.airCrouch=crouch;pose.airTuck=FootballAirTiming.Tuck(lift);pose.airArms=FootballAirTiming.Arms(lift,crouch);pose.plant=false;
        // Only a contact within the native header distance raises the jump toward it.
        pose.airReach=contact.HasValue&&Horizontal(contact.Value-actors[i].position)<HeaderReach?contact.Value.y:float.NaN;
        if(upright&&(!ready||lift>0)){pose.clip=keeper?keeperClip:idleClip;pose.time=.4;pose.loop=true;pose.baseClip=null;}
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

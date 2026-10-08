using System;
using System.Collections.Generic;
using UnityEngine;

namespace Doppel6.Probe {
[Serializable] public class Geometry { public double length,width,goalWidth,goalHeight,penaltyDepth,penaltyWidth; public int fieldPlayers,attackDirection; }
[Serializable] public class Ball { public double[] position,velocity; public double radius; }
[Serializable] public class Actor { public string id,role,action,pose; public int team; public double[] position,velocity,facing; public double radius,reach,poseStarted; }
[Serializable] public class ActorArray {public Actor[] items;}
[Serializable] public class Provenance { public string family,subjectId,sourceAction,keeperFootAction,participantId; public int sourceTeam; public bool participation; public string[] offsideIds; }
// Expected results are deliberately not deserialized into runtime data.
[Serializable] public class FollowupIntent {public string actorId,trigger,action;public double[] target;}
[Serializable] public class Followup {public FollowupIntent intent;}
[Serializable] public class Scenario { public string schemaVersion,id,title,kind; public double duration; public Geometry geometry; public Ball ball; public Actor[] actors; public Provenance provenance; public Followup followup; public CameraPoint[] cameraPoints; public PlayPlan play; }
[Serializable] public class Config { public Scenario scenario; public int seed=617; public double followThroughSeconds; }
[Serializable] public class MatchEvent { public string id,type,actorId,parentId,reason; public int tick; public double time; public double[] position,contactPoint; public double contactRadius,ballDistance; public bool allowed,whistle; }
[Serializable] public class State { public bool ready=true,running,finished,physicsProbe; public string engine="unity",scenarioId,cameraMode="overview"; public double elapsed; public int tick,seed; public Ball ball; public Actor[] actors; public Geometry geometry;public List<NetPatch> netPatches=new List<NetPatch>();public List<MatchEvent> events=new List<MatchEvent>(); public int[] score=new int[2]; public string[] findings; public bool resultDelivered,rebounded,followupShot,boundaryDelivered; public string lastActorId; public double ignoreUntil; public bool following; public double resolvedAt,followThroughUntil; public string outcome,ownerId; public int goalSign; public bool playProbe;public string playPhase;public double phaseStarted,releaseAt;public double[] lastContactPoint; }
[Serializable] public class Checkpoint { public string schemaVersion="d6-probe-1",engine="unity",sourceId=ProbeBuildIdentity.SourceId,identity; public Config config; public State state; }
public sealed class ProbeSimulation {
    public Config Config { get; private set; }
    public State State { get; private set; }
    public const double StepSeconds=1.0/60.0;
    static T Clone<T>(T value) {return JsonUtility.FromJson<T>(JsonUtility.ToJson(value));}
    public ProbeSimulation(Config config) { Load(config); }
    public void Load(Config config) {
        if(config==null||config.scenario==null||config.scenario.schemaVersion!="d6-probe-1")throw new ArgumentException("Unsupported scenario schema");
        var s=config.scenario;if(s.geometry==null||s.geometry.length<=0||s.geometry.width<=0||s.duration<=0||s.ball==null||s.ball.position?.Length!=3||s.ball.velocity?.Length!=3)throw new ArgumentException("Invalid scenario geometry or ball");
        if(!Finite(config.followThroughSeconds)||config.followThroughSeconds<0||config.followThroughSeconds>10)throw new ArgumentException("Invalid follow-through duration");
        if(s.kind=="play"&&(s.play==null||s.actors==null||Array.Find(s.actors,a=>a.id==s.play.passerId)==null||Array.Find(s.actors,a=>a.id==s.play.receiverId)==null||Array.Exists(s.actors,a=>!VectorValid(a.facing)||Math.Abs(a.facing[1])>1e-8||Math.Abs(a.facing[0]*a.facing[0]+a.facing[2]*a.facing[2]-1)>1e-8)))throw new ArgumentException("Invalid play scene");
        Config=Clone(config);s=Config.scenario;
        State=new State{scenarioId=s.id,seed=config.seed,geometry=Clone(s.geometry),ball=Clone(s.ball),actors=Clone(new ActorArray{items=s.actors??new Actor[0]}).items,findings=new[]{"Isolated contact probe; no career or full match AI.","Contacts use reach volumes, not animated hand/foot mesh collision.","Original full-resolution master and generic clips; production contact IK and kit overlays are not ported."}};
        if(s.kind=="play")ProbePlay.Initialize(State,s);
        if(s.kind=="physics")State.physicsProbe=true;
        if(s.kind=="physics")State.findings=new[]{"Isolierte Ballphysikprobe: Schwerkraft, Rollreibung, runder Torrahmen und nachgiebiges, nachschwingendes Tornetz. Keine Spielerkontakte oder Match-KI."};
    }
    public Checkpoint Checkpoint(){return new Checkpoint{config=Clone(Config),state=Clone(State),identity=JsonUtility.ToJson(Config)};}
    public void Restore(Checkpoint checkpoint){
        if(checkpoint==null||checkpoint.schemaVersion!="d6-probe-1"||checkpoint.engine!="unity"||checkpoint.sourceId!=ProbeBuildIdentity.SourceId||checkpoint.identity!=JsonUtility.ToJson(checkpoint.config)||checkpoint.state?.scenarioId!=checkpoint.config?.scenario?.id||checkpoint.state.engine!="unity")throw new ArgumentException("Incompatible checkpoint");
        var candidate=new ProbeSimulation(checkpoint.config);ValidateCheckpointState(checkpoint.state,candidate.Config);var restored=Clone(checkpoint.state);restored.running=false;Config=candidate.Config;State=restored;
    }
    static bool Finite(double value){return !double.IsNaN(value)&&!double.IsInfinity(value);}
    static bool VectorValid(double[] value){return value!=null&&value.Length==3&&Array.TrueForAll(value,v=>Finite(v)&&Math.Abs(v)<1000000);}
    static void ValidateCheckpointState(State state,Config config){
        var s=config.scenario;
        if(state==null||!state.ready||state.engine!="unity"||state.scenarioId!=s.id||!Finite(state.elapsed)||state.elapsed<0||state.elapsed>s.duration+config.followThroughSeconds+StepSeconds||state.tick<0||state.tick!=(int)Math.Round(state.elapsed/StepSeconds)||state.seed!=config.seed||state.physicsProbe!=(s.kind=="physics")||state.ball==null||!VectorValid(state.ball.position)||!VectorValid(state.ball.velocity)||state.ball.radius!=s.ball.radius||state.actors==null||state.actors.Length!=s.actors.Length||state.geometry==null||JsonUtility.ToJson(state.geometry)!=JsonUtility.ToJson(s.geometry)||state.events==null||state.score==null||state.score.Length!=2||Array.Exists(state.score,n=>n<0)||!Finite(state.ignoreUntil)||state.ignoreUntil<0||state.ignoreUntil>s.duration+1||state.finished&&state.running||state.finished&&!state.resultDelivered||state.following!=(state.resultDelivered&&!state.finished))throw new ArgumentException("Malformed checkpoint state");
        if(!Finite(state.resolvedAt)||!Finite(state.followThroughUntil)||state.resultDelivered&&(state.resolvedAt<0||state.resolvedAt>state.elapsed||Math.Abs(state.followThroughUntil-state.resolvedAt-config.followThroughSeconds)>1e-8||state.followThroughUntil+1e-8<state.elapsed))throw new ArgumentException("Malformed follow-through state");
        var ids=new HashSet<string>();foreach(var actor in state.actors){if(actor==null||!ids.Add(actor.id)||!VectorValid(actor.position)||!VectorValid(actor.velocity))throw new ArgumentException("Malformed checkpoint actors");var original=Array.Find(s.actors,a=>a.id==actor.id);if(original==null||actor.team!=original.team||actor.role!=original.role||actor.radius!=original.radius||actor.reach!=original.reach||(actor.action!=original.action&&actor.action!="none"))throw new ArgumentException("Checkpoint actor identity changed");}
        if(!string.IsNullOrEmpty(state.lastActorId)&&!ids.Contains(state.lastActorId))throw new ArgumentException("Checkpoint contact actor absent");
        if(!string.IsNullOrEmpty(state.ownerId)&&!ids.Contains(state.ownerId)||state.goalSign< -1||state.goalSign>1)throw new ArgumentException("Malformed follow-through owner");
        if(state.netPatches==null||state.netPatches.Count>8)throw new ArgumentException("Malformed checkpoint net");var netIds=new HashSet<string>();foreach(var patch in state.netPatches){if(patch==null||!new HashSet<string>{"back","left","right","roof"}.Contains(patch.panel)||Math.Abs(patch.goalSign)!=1||!netIds.Add(patch.goalSign+":"+patch.panel)||!VectorValid(patch.position)||!Finite(patch.displacement)||Math.Abs(patch.displacement)>3||!Finite(patch.velocity)||Math.Abs(patch.velocity)>10000||!Finite(patch.peak)||patch.peak<0||patch.peak>1.600001)throw new ArgumentException("Malformed checkpoint net patch");}
        var types=new HashSet<string>{"pass-release","received","interception","missed-contact","shot-release","keeper-permission","offside-check","contact","hand-contact-disallowed","block","parry","free-ball","possession","goal","out","result","net-contact","ground-contact","frame-contact"};int results=0,goals=0;for(int i=0;i<state.events.Count;i++){var e=state.events[i];if(e==null||e.id!=s.id+":"+i||!types.Contains(e.type)||!Finite(e.time)||e.time<0||e.time>state.elapsed+1e-8||e.tick<0||e.tick>state.tick||!VectorValid(e.position)||(i>0?e.parentId!=state.events[i-1].id:!string.IsNullOrEmpty(e.parentId)))throw new ArgumentException("Malformed checkpoint event ledger");if(e.type=="result")results++;if(e.type=="goal")goals++;}
        if((s.kind=="physics"||s.kind=="play")&&state.boundaryDelivered!=(goals>0||state.events.Exists(e=>e.type=="out")))throw new ArgumentException("Checkpoint boundary ledger inconsistent");
        if(state.playProbe!=(s.kind=="play"))throw new ArgumentException("Checkpoint play mode inconsistent");
        if(state.playProbe){
            if(!new HashSet<string>{"prepare-pass","pass-flight","prepare-shot","shot-flight","rebound","complete"}.Contains(state.playPhase)||!Finite(state.phaseStarted)||state.phaseStarted<0||state.phaseStarted>state.elapsed+1e-8||!Finite(state.releaseAt)||state.releaseAt<0||state.releaseAt>s.duration+1||state.lastContactPoint!=null&&state.lastContactPoint.Length>0&&!VectorValid(state.lastContactPoint))throw new ArgumentException("Malformed play state");
            if((state.playPhase=="prepare-pass"||state.playPhase=="prepare-shot")&&string.IsNullOrEmpty(state.ownerId)||new HashSet<string>{"pass-flight","shot-flight","rebound"}.Contains(state.playPhase)&&!string.IsNullOrEmpty(state.ownerId))throw new ArgumentException("Checkpoint play possession inconsistent");
            foreach(var a in state.actors)if(!VectorValid(a.facing)||Math.Abs(a.facing[1])>1e-8||Math.Abs(a.facing[0]*a.facing[0]+a.facing[2]*a.facing[2]-1)>1e-8||!new HashSet<string>{"idle","prepare-pass","prepare-shot","receive","parry","chase"}.Contains(a.pose)||!Finite(a.poseStarted)||a.poseStarted<0||a.poseStarted>state.elapsed+1e-8)throw new ArgumentException("Malformed play actor pose");
            foreach(var e in state.events)if(e.contactRadius>0&&(!ids.Contains(e.actorId)||!VectorValid(e.contactPoint)||!Finite(e.contactRadius)||e.contactRadius>.22||!Finite(e.ballDistance)||e.ballDistance>s.ball.radius+e.contactRadius+1e-7))throw new ArgumentException("Malformed play contact");
        }
        if(results!=(state.resultDelivered?1:0)||state.score[0]+state.score[1]!=goals||state.followupShot&&!state.rebounded)throw new ArgumentException("Checkpoint result ledger inconsistent");
    }
    MatchEvent Emit(string type,string actor=null,string reason=null,bool allowed=false,bool whistle=false,double[] contactPoint=null,double contactRadius=0){
        double distance=0;if(contactPoint!=null)for(int i=0;i<3;i++)distance+=Math.Pow(State.ball.position[i]-contactPoint[i],2);
        var e=new MatchEvent{id=State.scenarioId+":"+State.events.Count,type=type,actorId=actor,reason=reason,allowed=allowed,whistle=whistle,tick=State.tick,time=State.elapsed,position=(double[])State.ball.position.Clone(),contactPoint=contactPoint==null?null:(double[])contactPoint.Clone(),contactRadius=contactRadius,ballDistance=Math.Sqrt(distance),parentId=State.events.Count==0?null:State.events[State.events.Count-1].id};State.events.Add(e);return e;
    }
    public void Start(){if(!State.finished)State.running=true;}
    public void Pause(){State.running=false;}
    public void Step(){
        if(!State.running||State.finished)return;
        if(Config.scenario.kind=="play"){ProbePlay.Step(State,Config,(type,actorId,reason,point,radius)=>Emit(type,actorId,reason,false,false,point,radius));return;}
        if(Config.scenario.kind=="physics"){ProbeBallPhysics.Step(State,Config,(type,reason)=>Emit(type,null,reason));return;}
        if(State.following){FollowThrough();return;}
        var s=Config.scenario;var dt=Math.Min(StepSeconds,s.duration-State.elapsed);if(dt<=1e-10){Finish();return;}
        if(State.tick==0){
            if(s.kind=="shot"||s.kind=="sequence")Emit("shot-release");
            if(s.kind=="keeper-permission") {var a=Array.Find(State.actors,x=>x.id==s.provenance.subjectId);string reason;var allowed=CanHandle(a,State.ball.position,out reason);Emit("keeper-permission",a?.id,reason,allowed);}
            if(s.kind=="offside") {var p=s.provenance;bool exempt=p.sourceAction=="direct-throw-in"||p.sourceAction=="goal-kick"||p.sourceAction=="corner";var whistle=p.participation&&!exempt&&Array.IndexOf(p.offsideIds??new string[0],p.participantId)>=0;Emit("offside-check",p.participantId,"Declared participation diagnostic",false,whistle);}
        }
        if(s.kind=="keeper-permission"||s.kind=="offside"){Advance(dt);if(State.elapsed>=s.duration-1e-9)Finish();return;}
        if(State.rebounded&&!State.followupShot&&s.followup?.intent!=null){var finisher=Array.Find(State.actors,a=>a.id==s.followup.intent.actorId);if(finisher!=null){var chase=Subtract(State.ball.position,finisher.position);chase[1]=0;Normalize(chase);for(int i=0;i<3;i++)finisher.velocity[i]=chase[i]*6;}}
        // Resolve moving ball versus moving contact volumes continuously over this step.
        double first=dt+1;Actor hit=null;
        foreach(var a in State.actors){if(a.action=="none"||string.IsNullOrEmpty(a.action)||(a.action=="shoot"&&!State.rebounded)||(a.id==State.lastActorId&&State.elapsed<State.ignoreUntil))continue;
            var t=Sweep(State.ball.position,State.ball.velocity,a.position,a.velocity,a.reach,dt);
            if(t<first-1e-9||(Math.Abs(t-first)<1e-9&&hit!=null&&string.CompareOrdinal(a.id,hit.id)<0)){first=t;hit=a;}}
        string boundary=null;double boundaryTime=BoundaryTime(dt,out boundary);
        if(boundary!=null&&boundaryTime<first){Advance(boundaryTime);Emit(boundary);State.outcome=boundary;if(boundary=="goal"){State.score[s.geometry.attackDirection>0?0:1]++;State.goalSign=Math.Sign(State.ball.position[0]);}if(Config.followThroughSeconds==0)State.ball.velocity=new double[3];Advance(dt-boundaryTime);Finish();return;}
        if(hit!=null&&first<=dt){Advance(first);var contactPosition=(double[])State.ball.position.Clone();Emit("contact",hit.id);State.lastActorId=hit.id;State.ignoreUntil=State.elapsed+0.6;
            string reason=null;bool handAction=hit.role=="keeper"&&(hit.action=="catch"||hit.action=="parry");bool allowed=!handAction||CanHandle(hit,contactPosition,out reason);
            if(!allowed){Emit("hand-contact-disallowed",hit.id,reason);State.outcome="hand-contact-disallowed";State.ball.velocity=new double[3];Advance(dt-first);Finish();return;}
            if(hit.action=="shoot"&&State.rebounded&&!State.followupShot&&s.followup?.intent!=null){var direction=Subtract(s.followup.intent.target,contactPosition);Normalize(direction);for(int i=0;i<3;i++)State.ball.velocity[i]=direction[i]*20;hit.velocity=new double[3];hit.action="none";State.followupShot=true;Emit("shot-release",hit.id);}
            else if(hit.action=="block"||hit.action=="parry"){
                Emit(hit.action=="parry"?"parry":"block",hit.id);var normal=Subtract(contactPosition,hit.position);Normalize(normal);var dot=Dot(State.ball.velocity,normal);for(int i=0;i<3;i++)State.ball.velocity[i]=(State.ball.velocity[i]-2*dot*normal[i])*0.65;Emit("free-ball",hit.id);State.rebounded=true;hit.action="none";
            }else if(allowed){Emit("possession",hit.id);State.outcome="possession";State.ownerId=hit.id;State.ball.velocity=new double[3];Advance(dt-first);Finish();return;}
            Advance(dt-first);
        }else Advance(dt);
        if(State.elapsed>=s.duration-1e-9)Finish();
    }
    bool CanHandle(Actor a,double[] point,out string reason){
        var g=Config.scenario.geometry;var p=Config.scenario.provenance;var ownSign=a!=null&&a.team==0?-1:1;var depth=g.length/2-point[0]*ownSign;
        if(a==null||a.role!="keeper"||depth< -1e-9||depth>g.penaltyDepth+1e-9||Math.Abs(point[2])>g.penaltyWidth/2+1e-9){reason="outside-own-box";return false;}
        bool restricted=p!=null&&p.sourceTeam==a.team&&(p.sourceAction=="deliberate-foot-pass"||p.sourceAction=="direct-throw-in");bool exception=p!=null&&(p.keeperFootAction=="clearance-executed"||p.keeperFootAction=="clearance-attempted");
        reason=restricted&&!exception?"restricted-origin":"allowed";return reason=="allowed";
    }
    double BoundaryTime(double dt,out string type){
        type=null;var b=State.ball;var g=Config.scenario.geometry;double best=double.PositiveInfinity;
        for(int axis=0;axis<=2;axis+=2){var v=b.velocity[axis];if(Math.Abs(v)<1e-12)continue;var side=Math.Sign(v);var limit=(axis==0?g.length:g.width)/2+b.radius;var t=(side*limit-b.position[axis])/v;
            // Whole ball must pass the plane, equality at the fixture end is not crossing.
            if(t< -1e-9||t>=dt-1e-9)continue;if(t<best){best=Math.Max(0,t);type="out";var z=b.position[2]+b.velocity[2]*t;var y=b.position[1]+b.velocity[1]*t;if(axis==0&&Math.Abs(z)+b.radius<g.goalWidth/2-1e-9&&y+b.radius<g.goalHeight-1e-9&&y-b.radius>=-1e-9)type="goal";}}
        return best;
    }
    void Advance(double dt){for(int i=0;i<3;i++)State.ball.position[i]+=State.ball.velocity[i]*dt;foreach(var a in State.actors)for(int i=0;i<3;i++)a.position[i]+=a.velocity[i]*dt;State.elapsed+=dt;State.tick=(int)Math.Round(State.elapsed/StepSeconds);}
    void Finish(){
        if(State.resultDelivered)return;
        State.resolvedAt=State.elapsed;State.followThroughUntil=State.elapsed+Config.followThroughSeconds;Emit("result");State.resultDelivered=true;
        State.following=Config.followThroughSeconds>0;State.finished=!State.following;if(State.finished)State.running=false;
        // The contact result is fixed; actors recover in place while the free ball settles.
        if(State.following)foreach(var actor in State.actors)actor.velocity=new double[3];
    }
    void FollowThrough(){
        double dt=Math.Min(StepSeconds,State.followThroughUntil-State.elapsed);
        if(dt<=1e-10){State.following=false;State.finished=true;State.running=false;return;}
        var b=State.ball;var p=b.position;var v=b.velocity;var kind=Config.scenario.kind;
        if(string.IsNullOrEmpty(State.ownerId)&&State.outcome!="hand-contact-disallowed"&&kind!="keeper-permission"&&kind!="offside"){
            // The post-result phase uses gravity, ground drag and a compliant local net.
            bool airborne=p[1]>b.radius+1e-6||v[1]>0; if(airborne)v[1]-=9.81*dt;
            for(int i=0;i<3;i++)p[i]+=v[i]*dt;
            if(p[1]<b.radius){p[1]=b.radius;if(v[1]< -0.6){v[1]=-v[1]*.35;Emit("ground-contact");}else v[1]=0;}
            double drag=Math.Exp(-(p[1]<=b.radius+1e-6?2.2:.12)*dt);v[0]*=drag;v[2]*=drag;
            ProbeNet.Step(State,dt,(type,reason)=>Emit(type,null,reason));
            if(p[1]<=b.radius+1e-6&&Math.Abs(v[0])+Math.Abs(v[1])+Math.Abs(v[2])<.04)b.velocity=new double[3];
        }
        State.elapsed+=dt;State.tick=(int)Math.Round(State.elapsed/StepSeconds);
        if(State.elapsed>=State.followThroughUntil-1e-9){State.following=false;State.finished=true;State.running=false;}
    }
    static double[] Subtract(double[] a,double[] b){return new[]{a[0]-b[0],a[1]-b[1],a[2]-b[2]};}
    static double Dot(double[] a,double[] b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
    static void Normalize(double[] a){var l=Math.Sqrt(Dot(a,a));if(l<1e-10){a[0]=1;return;}for(int i=0;i<3;i++)a[i]/=l;}
    static double Sweep(double[] bp,double[] bv,double[] ap,double[] av,double radius,double dt){var p=Subtract(bp,ap);var v=Subtract(bv,av);var c=Dot(p,p)-radius*radius;if(c<=0)return 0;var aa=Dot(v,v);if(aa<1e-15)return double.PositiveInfinity;var bb=2*Dot(p,v);var disc=bb*bb-4*aa*c;if(disc<0)return double.PositiveInfinity;var t=(-bb-Math.Sqrt(disc))/(2*aa);return t>=0&&t<=dt?t:double.PositiveInfinity;}
}
}

using System;
namespace Doppel6.Probe {
[Serializable] public class PlayPlan {public string passerId,receiverId;public double targetZ;}
public class PlayerHit {public double t;public Actor actor;public string kind;}
public static class ProbePlay {
    public delegate void Emit(string type,string actorId,string reason,double[] point=null,double radius=0);
    static Actor Actor(State s,string id){return Array.Find(s.actors,a=>a.id==id);}
    public static double[] Point(Actor a,string kind="foot"){var f=a.facing;double forward=kind=="hand"?.45:.3,side=kind=="hand"?0:.25;return new[]{a.position[0]+f[0]*forward+f[2]*side,kind=="hand"?1.25:.25,a.position[2]+f[2]*forward-f[0]*side};}
    static void Held(State s,Actor a){var p=Point(a);double t=Math.Min(1,Math.Max(0,(s.elapsed-s.phaseStarted)/.22)),blend=t*t*(3-2*t);for(int i=0;i<3;i++){double target=i==1?s.ball.radius:p[i]+a.facing[i]*.24;s.ball.position[i]=s.lastContactPoint!=null&&s.lastActorId==a.id&&t<1?s.lastContactPoint[i]+(target-s.lastContactPoint[i])*blend:target;s.ball.velocity[i]=0;}}
    static void Pose(Actor a,string name,double time){if(a.pose!=name){a.pose=name;a.poseStarted=time;}}
    static void Contact(State s,Actor a,string kind,Emit emit,string type,string reason){var center=Point(a,kind);double radius=kind=="hand"?.22:.12;emit("contact",a.id,kind,center,radius);emit(type,a.id,reason,center,radius);s.lastActorId=a.id;s.ignoreUntil=s.elapsed+.4;}
    public static PlayerHit Closest(State s,double h){
        if(!string.IsNullOrEmpty(s.ownerId)||s.resultDelivered||s.playPhase!="pass-flight"&&s.playPhase!="shot-flight"&&s.playPhase!="rebound")return null;
        PlayerHit best=null;foreach(var a in s.actors){string kind=a.action=="parry"&&s.playPhase=="shot-flight"?"hand":"foot";if(kind=="foot"&&!(s.playPhase=="pass-flight"&&(a.action=="receive"||a.action=="intercept")||s.playPhase=="rebound"&&(a.action=="receive"||a.action=="intercept")))continue;if(a.id==s.lastActorId&&s.elapsed<s.ignoreUntil)continue;
            var center=Point(a,kind);double aa=0,bb=0,cc=0,radius=s.ball.radius+(kind=="hand"?.22:.12);for(int i=0;i<3;i++){double q=s.ball.position[i]-center[i],v=s.ball.velocity[i]-a.velocity[i];aa+=v*v;bb+=q*v;cc+=q*q;}cc-=radius*radius;double disc=bb*bb-aa*cc;if(aa<1e-12||disc<0)continue;double t=cc<=0?0:(-bb-Math.Sqrt(disc))/aa;if(t<0||t>h||bb>=0&&cc>0)continue;if(best==null||t<best.t-1e-9||Math.Abs(t-best.t)<1e-9&&string.CompareOrdinal(a.id,best.actor.id)<0)best=new PlayerHit{t=t,actor=a,kind=kind};
        }return best;
    }
    static void Resolve(State s,PlayerHit hit,Emit emit){var a=hit.actor;
        if(hit.kind=="hand"){Contact(s,a,"hand",emit,"parry","Handkontakt");var center=Point(a,"hand");var n=new double[3];double length=0;for(int i=0;i<3;i++){n[i]=s.ball.position[i]-center[i];length+=n[i]*n[i];}length=Math.Sqrt(length);double speed=0;for(int i=0;i<3;i++){n[i]/=length;speed+=s.ball.velocity[i]*n[i];}for(int i=0;i<3;i++)s.ball.velocity[i]=(s.ball.velocity[i]-1.65*speed*n[i])*.35;s.ownerId=null;s.playPhase="rebound";s.phaseStarted=s.elapsed;s.lastContactPoint=(double[])s.ball.position.Clone();Pose(a,"parry",s.elapsed);emit("free-ball",a.id,"Abpraller ohne Besitzer");return;}
        Contact(s,a,"foot",emit,s.playPhase=="rebound"?"possession":a.action=="intercept"?"interception":"received","Fußkontakt");s.ownerId=a.id;s.phaseStarted=s.elapsed;s.lastContactPoint=(double[])s.ball.position.Clone();foreach(var other in s.actors)other.velocity=new double[3];Pose(a,"receive",s.elapsed);Held(s,a);
        if(s.playPhase=="rebound"||a.action=="intercept"){s.outcome=a.action=="intercept"&&s.playPhase=="pass-flight"?"interception":"possession";s.playPhase="complete";}else{s.playPhase="prepare-shot";s.releaseAt=s.elapsed+.75;}
    }
    static void Prepare(State s,Scenario scene,Emit emit){
        if(s.resultDelivered)return;
        if(!string.IsNullOrEmpty(s.ownerId)&&(s.playPhase=="prepare-pass"||s.playPhase=="prepare-shot")){var a=Actor(s,s.ownerId);bool shoot=s.playPhase=="prepare-shot";Pose(a,shoot?"prepare-shot":"prepare-pass",s.phaseStarted);Held(s,a);if(s.elapsed<s.releaseAt-1e-9)return;var center=Point(a);double distance=0;for(int i=0;i<3;i++)distance+=Math.Pow(s.ball.position[i]-center[i],2);if(Math.Sqrt(distance)>s.ball.radius+.12+1e-8){s.outcome="missed-release";s.playPhase="complete";emit("missed-contact",a.id,"Ball außerhalb des Fußkontakts");return;}
            Contact(s,a,"foot",emit,shoot?"shot-release":"pass-release",shoot?"Schuss":"Pass");s.ownerId=null;s.lastContactPoint=(double[])s.ball.position.Clone();s.phaseStarted=s.elapsed;
            if(shoot){var target=new[]{scene.geometry.attackDirection*scene.geometry.length/2,1.5,scene.play.targetZ};double dx=target[0]-s.ball.position[0],dz=target[2]-s.ball.position[2],duration=Math.Sqrt(dx*dx+dz*dz)/18;s.ball.velocity=new[]{dx/duration,(target[1]-s.ball.position[1]+4.905*duration*duration)/duration,dz/duration};s.playPhase="shot-flight";}
            else{var target=Point(Actor(s,scene.play.receiverId));double dx=target[0]-s.ball.position[0],dz=target[2]-s.ball.position[2],length=Math.Sqrt(dx*dx+dz*dz);s.ball.velocity=new[]{dx/length*13,0,dz/length*13};s.playPhase="pass-flight";}
        }
        if(s.playPhase=="rebound")foreach(var a in s.actors){if(a.action!="receive"&&a.action!="intercept")continue;double dx=s.ball.position[0]-a.position[0],dz=s.ball.position[2]-a.position[2],length=Math.Sqrt(dx*dx+dz*dz);if(length>.01)a.facing=new[]{dx/length,0,dz/length};double speed=a.action=="intercept"?5.8:5.5;a.velocity=length>.4?new[]{dx/length*speed,0,dz/length*speed}:new double[3];Pose(a,"chase",s.elapsed);}
    }
    public static void Initialize(State s,Scenario scene){s.playProbe=true;s.physicsProbe=false;s.playPhase="prepare-pass";s.phaseStarted=0;s.releaseAt=.65;s.ownerId=scene.play.passerId;s.findings=new[]{"Zusammenhängende lokale Spielprobe: reale bewegte Fuß-/Handkontaktvolumen, vorbereitete Freigabe, Besitzwechsel und freie Abpraller. Die Animation liest den Zustand und richtet das Kontaktglied aus. Keine vollständige Match-KI oder Meshkollision."};Held(s,Actor(s,s.ownerId));}
    public static void Step(State s,Config config,Emit emit){
        if(!s.running||s.finished)return;double end=s.resultDelivered?s.followThroughUntil:config.scenario.duration,dt=Math.Min(ProbeSimulation.StepSeconds,end-s.elapsed);
        void Move(double h){foreach(var a in s.actors)for(int i=0;i<3;i++)a.position[i]+=a.velocity[i]*h;s.elapsed+=h;s.tick=(int)Math.Round(s.elapsed/ProbeSimulation.StepSeconds);}
        for(int n=0;n<8&&dt>1e-10;n++){double h=dt/8;Prepare(s,config.scenario,emit);if(!string.IsNullOrEmpty(s.ownerId)){Move(h);Held(s,Actor(s,s.ownerId));ProbeNet.Step(s,h,(type,reason)=>emit(type,null,reason));}else ProbeBallPhysics.Substep(s,h,(type,reason)=>emit(type,null,reason),remaining=>Closest(s,remaining),Move,hit=>Resolve(s,hit,emit));}
        if(!s.resultDelivered&&(s.outcome=="goal"||s.outcome=="out"||s.outcome=="interception"||s.outcome=="possession"||s.outcome=="missed-release"||s.elapsed>=config.scenario.duration-1e-8)){s.resultDelivered=true;s.resolvedAt=s.elapsed;s.followThroughUntil=s.elapsed+config.followThroughSeconds;s.playPhase="complete";emit("result",s.ownerId,s.outcome??"Kein Kontakt bis zum Szenenende");}
        s.following=s.resultDelivered&&s.elapsed<s.followThroughUntil-1e-8;s.finished=s.resultDelivered&&!s.following;if(s.finished)s.running=false;
    }
}
}

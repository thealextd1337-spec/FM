using System;
using UnityEngine;
namespace Doppel6.Probe {
// A short display buffer only. It cannot change a match or predict its future.
public sealed class WorldViewPlayback {
    WorldFrame from,to;double received,duration;
    public static bool Cut(WorldFrame a,WorldFrame b){
        if(a==null||a.session!=b.session||a.turned!=b.turned||b.clock<a.clock||b.clock-a.clock>1||a.players.Length!=b.players.Length||b.phase=="paused"||b.phase=="finished"||b.ballOpacity<.01||a.ballOpacity<.01)return true;
        if(Distance(a.ball,b.ball)>12)return true;
        for(int i=0;i<a.players.Length;i++)if(a.players[i].id!=b.players[i].id||Distance(a.players[i].position,b.players[i].position)>10)return true;
        return false;
    }
    public void Receive(WorldFrame frame,double now){
        var current=Sample(now);var elapsed=to==null?0:frame.clock-to.clock;
        from=current;to=frame;received=now;
        // Stationary/paused pictures freeze. Restarts and seeks snap rather than
        // dragging the ball or players through the pitch between two states.
        duration=Cut(from,to)||elapsed<=0?0:Math.Clamp(elapsed,.025,.1);
    }
    public WorldFrame Sample(double now){return to==null?null:duration<=0?to:Blend(from,to,Math.Clamp((now-received)/duration,0,1));}
    public static double Distance(double[] a,double[] b){double d=0;for(int i=0;i<3;i++)d+=(a[i]-b[i])*(a[i]-b[i]);return Math.Sqrt(d);}
    static double Lerp(double a,double b,double q){return a+(b-a)*q;}
    static double[] Vector(double[] a,double[] b,double q){return new[]{Lerp(a[0],b[0],q),Lerp(a[1],b[1],q),Lerp(a[2],b[2],q)};}
    // R20: the outfield foot contacts whose discrete facts (action, id, contact point, duration, progress) the
    // display binds to their observed native event time. Keeper saves, held balls, goal kicks, throws and
    // aerial duels keep the legacy binding.
    public static bool FootContact(string action)=>action=="pass"||action=="highPass"||action=="cross"||action=="shot"||action=="freeKick"||action=="volley"||action=="receive"||action=="control"||action=="tackle";
    static bool Continues(WorldPose a)=>a.action!="save"&&a.action!="goalKick"&&a.action!="throw"&&a.action!="header"&&a.action!="airReady"&&a.action!="airLand"&&!a.ballHeld&&!a.holding;
    // R20: the native clock of b's new foot contact when it lies inside the received interval (aClock, bClock]:
    // the observed native time (actionAt), else derived from a known native duration and b's progress (the
    // bridge's fallback duration 1 is no time). NaN binds b's facts at once (legacy: unknown timing, an event at
    // or before a, the same action continuing, an excluded action). Received values only; no clock of its own.
    public static double EventAt(WorldPose old,WorldPose p,double aClock,double bClock){
        if(old==null||p==null||!FootContact(p.action)||old.action==p.action&&old.actionId==p.actionId||!Continues(old))return double.NaN;
        double at;
        if(p.actionAtKnown&&!double.IsNaN(p.actionAt)&&!double.IsInfinity(p.actionAt))at=p.actionAt;
        else if(p.durationKnown&&p.duration>0&&!double.IsNaN(p.progress)&&!double.IsInfinity(p.progress))at=bClock-Math.Max(0,p.progress)*p.duration;
        else return double.NaN;
        return at>aClock+1e-9&&at<=bClock+1e-6?Math.Min(at,bClock):double.NaN;
    }
    // Clears a received picture's display lead: only Blend writes it.
    public static void StripLead(WorldFrame f){if(f?.players==null)return;foreach(var p in f.players)if(p!=null){p.leadAction=null;p.leadId=null;p.leadContact=null;p.leadIn=-1;p.leadSpan=-1;p.leadAerial=false;}}
    public static WorldFrame Blend(WorldFrame a,WorldFrame b,double q){
        if(q>=1)return b;q=Math.Clamp(q,0,1);
        var players=new WorldPose[b.players.Length];double clock=Lerp(a.clock,b.clock,q);bool ahead=false;
        for(int i=0;i<players.Length;i++){
            var p=b.players[i];var old=a.players[i];
            var facing=Quaternion.Slerp(Quaternion.LookRotation(ToVector(old.facing).sqrMagnitude>.0001f?ToVector(old.facing):Vector3.forward),Quaternion.LookRotation(ToVector(p.facing).sqrMagnitude>.0001f?ToVector(p.facing):Vector3.forward),(float)q)*Vector3.forward;
            bool same=old.action==p.action&&old.actionId==p.actionId;
            var position=Vector(old.position,p.position,q);var faced=new[]{(double)facing.x,facing.y,facing.z};double freshness=old.freshness>=0&&p.freshness>=0?Math.Clamp(Lerp(old.freshness,p.freshness,q),0,1):p.freshness;
            double at=EventAt(old,p,a.clock,b.clock);
            if(!double.IsNaN(at)&&clock<at-1e-6){ahead|=!string.IsNullOrEmpty(a.owner)&&old.id==a.owner;
                // R20: before the native event of b's foot contact the shown action is a's, its countdown running on by
                // its own known duration from a (held without one, at most 1). b's contact point leads the display
                // only as a lead (no contact, no ball, no time of its own).
                double progress=old.durationKnown&&old.duration>0?Math.Max(old.progress,Math.Min(1,old.progress+(clock-a.clock)/old.duration)):old.progress;
                players[i]=new WorldPose{id=p.id,number=p.number,position=position,facing=faced,moving=p.moving,action=old.action,actionId=old.actionId,contactPoint=old.contactPoint,duration=old.duration,freshness=freshness,recovery=old.recovery,progress=progress,holding=old.holding,holdingKnown=old.holdingKnown,aerial=old.aerial,saved=old.saved,savedKnown=old.savedKnown,parry=old.parry,parryKnown=old.parryKnown,goal=old.goal,goalKnown=old.goalKnown,ballHeld=old.ballHeld,ballHeldKnown=old.ballHeldKnown,phase=old.phase,pickup=old.pickup,actionAt=old.actionAt,actionAtKnown=old.actionAtKnown,durationKnown=old.durationKnown,
                    leadAction=p.action,leadId=p.actionId,leadContact=p.contactPoint?.Length==3?(double[])p.contactPoint.Clone():null,leadIn=at-clock,leadSpan=at-a.clock,leadAerial=p.aerial};
                if(players[i].leadContact==null){players[i].leadAction=null;players[i].leadId=null;players[i].leadIn=players[i].leadSpan=-1;}
                continue;
            }
            // From the native event on b's facts; its progress runs from 0 at the event to b's own (legacy: b's at once).
            // An action shown before its native time under the legacy binding (a countdown, an unbound action) does not
            // claim that time.
            bool claims=p.actionAtKnown&&p.actionAt<=clock+1e-6;
            double shown=!double.IsNaN(at)&&b.clock-at>1e-9?Math.Max(0,Lerp(0,p.progress,(clock-at)/(b.clock-at))):!double.IsNaN(at)?p.progress:same&&p.progress>=old.progress?Lerp(old.progress,p.progress,q):p.progress;
            players[i]=new WorldPose{id=p.id,number=p.number,position=position,facing=faced,moving=p.moving,action=p.action,actionId=p.actionId,contactPoint=p.contactPoint,duration=p.duration,freshness=freshness,recovery=same?Lerp(old.recovery,p.recovery,q):p.recovery,progress=shown,holding=p.holding,holdingKnown=p.holdingKnown,aerial=p.aerial,saved=p.saved,savedKnown=p.savedKnown,parry=p.parry,parryKnown=p.parryKnown,goal=p.goal,goalKnown=p.goalKnown,ballHeld=p.ballHeld,ballHeldKnown=p.ballHeldKnown,phase=p.phase,pickup=same&&old.pickup>=0&&p.pickup>=old.pickup?Lerp(old.pickup,p.pickup,q):p.pickup,actionAt=claims?p.actionAt:-1,actionAtKnown=claims,durationKnown=p.durationKnown};
        }
        var net=b.net;
        if(a.netActive&&b.netActive&&a.net.sign==b.net.sign)net=new WorldNet{sign=b.net.sign,z=Lerp(a.net.z,b.net.z,q),height=Lerp(a.net.height,b.net.height,q),age=Lerp(a.net.age,b.net.age,q),bulge=Lerp(a.net.bulge,b.net.bulge,q),flowing=a.net.flowing&&b.net.flowing};
        // R20: ball ownership and flight change with the carrier's own contact: while a's owner still has a bound contact
        // ahead they stay a's (a pass released the ball 33 ms before its kick and the passer's countdown lost its reach).
        return new WorldFrame{schema=b.schema,session=b.session,sequence=b.sequence,clock=Lerp(a.clock,b.clock,q),elapsed=Lerp(a.elapsed,b.elapsed,q),phase=b.phase,score=b.score,turned=b.turned,replay=b.replay,owner=ahead?a.owner:b.owner,offside=b.offside,offsideKnown=b.offsideKnown,ballInFlight=ahead?a.ballInFlight:b.ballInFlight,ballInFlightKnown=ahead?a.ballInFlightKnown:b.ballInFlightKnown,ball=Vector(a.ball,b.ball,q),ballOpacity=b.ballOpacity,camera=new WorldCamera{position=Vector(a.camera.position,b.camera.position,q),target=Vector(a.camera.target,b.camera.target,q),fov=Lerp(a.camera.fov,b.camera.fov,q)},players=players,netActive=b.netActive,net=net,celebrating=b.celebrating,celebrationTeam=b.celebrationTeam,celebrationScorer=b.celebrationScorer,celebrationTime=a.celebrating&&b.celebrating&&a.celebrationTeam==b.celebrationTeam?Lerp(a.celebrationTime,b.celebrationTime,q):b.celebrationTime};
    }
    static Vector3 ToVector(double[] p){return new Vector3((float)p[0],(float)p[1],(float)p[2]);}
}
// Orientation is presentation state, derived solely from the traveled path.
// It has no velocity/impulse authority and is never written into a checkpoint.
public sealed class WorldBallMotion {
    public Quaternion Rotation {get;private set;}=Quaternion.identity;
    public double SpinDegrees {get;private set;}
    public const float Radius=.1764f;
    Vector3 point;double clock=-1;string session;bool turned,visible;
    public void Sample(WorldFrame frame){
        if(frame==null)return;
        var next=new Vector3((float)frame.ball[0],(float)frame.ball[1],(float)frame.ball[2]);
        if(session==frame.session&&clock==frame.clock)return;
        var travel=next-point;travel.y=0;double dt=frame.clock-clock;
        bool seek=clock<0||session!=frame.session||turned!=frame.turned||dt<0;
        bool cut=seek||dt>1||travel.magnitude>12||frame.ballOpacity<.01||!visible;
        if(seek){Rotation=Quaternion.identity;SpinDegrees=0;}
        if(!cut&&dt>0&&travel.sqrMagnitude>1e-10f){
            // Ground motion rolls; airborne motion keeps a smaller visible spin
            // proportional to the received path. A stationary ball stays still.
            float airborne=next.y>Radius+.12f?.68f:1;
            float angle=travel.magnitude/Radius*Mathf.Rad2Deg*airborne;
            Rotation=(Quaternion.AngleAxis(angle,Vector3.Cross(Vector3.up,travel).normalized)*Rotation).normalized;
            SpinDegrees+=angle;
        }
        point=next;clock=frame.clock;session=frame.session;turned=frame.turned;visible=frame.ballOpacity>=.01;
    }
}
}

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
    public static WorldFrame Blend(WorldFrame a,WorldFrame b,double q){
        if(q>=1)return b;q=Math.Clamp(q,0,1);
        var players=new WorldPose[b.players.Length];
        for(int i=0;i<players.Length;i++){
            var p=b.players[i];var old=a.players[i];
            var facing=Quaternion.Slerp(Quaternion.LookRotation(ToVector(old.facing).sqrMagnitude>.0001f?ToVector(old.facing):Vector3.forward),Quaternion.LookRotation(ToVector(p.facing).sqrMagnitude>.0001f?ToVector(p.facing):Vector3.forward),(float)q)*Vector3.forward;
            bool same=old.action==p.action&&old.actionId==p.actionId;
            players[i]=new WorldPose{id=p.id,number=p.number,position=Vector(old.position,p.position,q),facing=new[]{(double)facing.x,facing.y,facing.z},moving=p.moving,action=p.action,actionId=p.actionId,contactPoint=p.contactPoint,duration=p.duration,freshness=old.freshness>=0&&p.freshness>=0?Math.Clamp(Lerp(old.freshness,p.freshness,q),0,1):p.freshness,recovery=same?Lerp(old.recovery,p.recovery,q):p.recovery,progress=same&&p.progress>=old.progress?Lerp(old.progress,p.progress,q):p.progress};
        }
        var net=b.net;
        if(a.netActive&&b.netActive&&a.net.sign==b.net.sign)net=new WorldNet{sign=b.net.sign,z=Lerp(a.net.z,b.net.z,q),height=Lerp(a.net.height,b.net.height,q),age=Lerp(a.net.age,b.net.age,q),bulge=Lerp(a.net.bulge,b.net.bulge,q)};
        return new WorldFrame{schema=b.schema,session=b.session,sequence=b.sequence,clock=Lerp(a.clock,b.clock,q),elapsed=Lerp(a.elapsed,b.elapsed,q),phase=b.phase,score=b.score,turned=b.turned,replay=b.replay,owner=b.owner,ball=Vector(a.ball,b.ball,q),ballOpacity=b.ballOpacity,camera=new WorldCamera{position=Vector(a.camera.position,b.camera.position,q),target=Vector(a.camera.target,b.camera.target,q),fov=Lerp(a.camera.fov,b.camera.fov,q)},players=players,netActive=b.netActive,net=net,celebrating=b.celebrating,celebrationTeam=b.celebrationTeam,celebrationScorer=b.celebrationScorer,celebrationTime=a.celebrating&&b.celebrating&&a.celebrationTeam==b.celebrationTeam?Lerp(a.celebrationTime,b.celebrationTime,q):b.celebrationTime};
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

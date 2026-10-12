#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
using Doppel6.Probe;
public static class WorldViewTests {
    public static string Run(string repository,string outputFolder=null){
        var raw=File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json"));
        var inbox=new WorldViewState(JsonUtility.FromJson<WorldConfig>(raw));var checks=new List<string>();
        void Require(bool condition,string name){if(!condition)throw new Exception(name);checks.Add(name);}
        var frame=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(inbox.Frame));frame.sequence=2;frame.clock+=1;
        Require(inbox.Accept(frame),"new picture accepted");var before=JsonUtility.ToJson(inbox.Frame);
        Require(!inbox.Accept(frame)&&before==JsonUtility.ToJson(inbox.Frame),"duplicate ignored atomically");
        var stale=JsonUtility.FromJson<WorldFrame>(before);stale.sequence=1;Require(!inbox.Accept(stale)&&before==JsonUtility.ToJson(inbox.Frame),"stale picture ignored atomically");
        foreach(var change in new Action<WorldFrame>[] {f=>f.session="other-session",f=>f.ball[0]=double.NaN,f=>f.players[0].id="foreign-player",f=>f.players[1].id=f.players[0].id,f=>f.score=null,f=>f.owner="foreign-player",f=>f.camera.fov=0,f=>f.players[0].position=null,f=>f.players[0].number=99,f=>{f.netActive=true;f.net=new WorldNet{sign=1,z=100,height=1,age=0,bulge=1};}}){
            var bad=JsonUtility.FromJson<WorldFrame>(before);bad.sequence=3;change(bad);bool rejected=false;try{inbox.Accept(bad);}catch(ArgumentException){rejected=true;}Require(rejected&&before==JsonUtility.ToJson(inbox.Frame),"invalid picture rejected "+checks.Count);
        }
        var replay=JsonUtility.FromJson<WorldFrame>(before);replay.sequence=3;replay.clock=0;replay.phase="replay";replay.replay=true;Require(inbox.Accept(replay),"replay can seek backwards with a new sequence");
        var config=JsonUtility.FromJson<WorldConfig>(raw);config.players[1].id=config.players[0].id;bool invalid=false;try{new WorldViewState(config);}catch(ArgumentException){invalid=true;}Require(invalid,"duplicate roster rejected");
        var first=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(config.initial));first.phase="live";first.clock=10;
        var next=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(first));next.clock=10.05;next.sequence++;next.players[0].position[0]+=2;next.ball[0]+=2;next.camera.position[0]+=2;
        var playback=new WorldViewPlayback();playback.Receive(first,0);playback.Receive(next,1);var middle=playback.Sample(1.025);
        Require(Math.Abs(middle.players[0].position[0]-first.players[0].position[0]-1)<1e-6,"players interpolate between actual pictures");
        Require(Math.Abs(middle.ball[0]-first.ball[0]-1)<1e-6&&Math.Abs(middle.camera.position[0]-first.camera.position[0]-1)<1e-6,"ball and camera share the player picture time");
        Require(ReferenceEquals(playback.Sample(2),next),"no extrapolation past the last actual picture");
        Require(first.players[0].position[0]!=next.players[0].position[0],"presentation does not modify its source picture");
        var paused=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(next));paused.phase="paused";playback.Receive(paused,3);
        Require(ReferenceEquals(playback.Sample(3),paused)&&ReferenceEquals(playback.Sample(30),paused),"paused match freezes without interpolation drift");
        var restart=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(next));restart.players[0].position[0]+=20;
        Require(WorldViewPlayback.Cut(next,restart),"restart snaps instead of flying players across the pitch");
        var seek=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(next));seek.replay=true;seek.phase="replay";seek.clock=0;
        Require(WorldViewPlayback.Cut(next,seek),"backwards replay seek snaps coherently");
        first.players[0].action="pass";first.players[0].actionId="first-pass";first.players[0].progress=.8;next.players[0].action="pass";next.players[0].actionId="second-pass";next.players[0].progress=.1;
        Require(WorldViewPlayback.Blend(first,next,.5).players[0].progress==.1,"a second pass does not inherit the first pass contact phase");
        var badContact=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(inbox.Frame));badContact.sequence++;badContact.players[0].contactPoint=new[]{double.NaN,0,0};bool contactRejected=false;try{inbox.Accept(badContact);}catch(ArgumentException){contactRejected=true;}Require(contactRejected,"nonfinite visual contact is rejected");
        R20(raw,Require);
        var report=JsonUtility.ToJson(new Report{passed=checks.Count,checks=checks.ToArray()},true);File.WriteAllText(Path.Combine(repository,outputFolder??"outputs/platform/world-unity",outputFolder==null?"contract-tests.json":"world-tests.json"),report);return report;
    }
    [Serializable] class Report {public int passed;public string[] checks;}
    // r20: native event time, the display lead within the received interval and the timing validation.
    static void R20(string raw,Action<bool,string> Require){
        var config=JsonUtility.FromJson<WorldConfig>(raw);
        WorldFrame At(double clock,string action,string id,double progress=0,double duration=1,bool durationKnown=false,double actionAt=-1,bool atKnown=false,string phase="live"){
            var f=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(config.initial));f.phase=phase;f.clock=clock;f.sequence=(int)Math.Round(clock*100);
            var p=f.players[0];p.action=action;p.actionId=id;p.progress=progress;p.duration=duration;p.durationKnown=durationKnown;p.actionAt=actionAt;p.actionAtKnown=atKnown;p.contactPoint=action=="receive"||action=="pass"?new[]{1.0,.29,2.0}:null;return f;}
        bool Near(double a,double b)=>Math.Abs(a-b)<1e-9;
        // Observed native time at b: a's facts until it, a lead toward b's contact point, b's facts from it.
        var a=At(10,"run","run");var b=At(10.05,"receive","r-1",0,.45,true,10.05,true);
        var aJson=JsonUtility.ToJson(a);var bJson=JsonUtility.ToJson(b);var rng=UnityEngine.Random.state;
        var half=WorldViewPlayback.Blend(a,b,.5).players[0];
        Require(half.action=="run"&&half.actionId=="run"&&(half.contactPoint==null||half.contactPoint.Length==0),"r20 before the native event the received foot contact is not shown (action, id, contact point of a)");
        Require(half.leadAction=="receive"&&half.leadId=="r-1"&&Near(half.leadIn,.025)&&Near(half.leadSpan,.05)&&half.leadContact!=null&&Near(half.leadContact[0],1),"r20 lead: b's received contact point, seconds until the native event and the received interval");
        var late=WorldViewPlayback.Blend(a,b,1-1e-8).players[0];Require(late.action=="receive"&&late.progress==0&&string.IsNullOrEmpty(late.leadAction),"r20 the contact shows from its native event (within 1e-6 s)");
        Require(ReferenceEquals(WorldViewPlayback.Blend(a,b,1),b),"r20 at the received picture the picture itself");
        Require(JsonUtility.ToJson(a)==aJson&&JsonUtility.ToJson(b)==bJson,"r20 received pictures are never modified by the display");
        var after=UnityEngine.Random.state;Require(rng.Equals(after),"r20 the display draws no random numbers");
        // An event inside the interval: observed time, or a known native duration with b's progress (the same time).
        var c=At(10.05,"receive","r-1",.02/.45,.45,true,10.03,true);
        Require(WorldViewPlayback.Blend(a,c,.4).players[0].action=="run","r20 observed event inside the interval: a until it");
        var q8=WorldViewPlayback.Blend(a,c,.8).players[0];Require(q8.action=="receive"&&Near(q8.progress,.5*c.players[0].progress),"r20 progress runs from 0 at the native event to b's received progress");
        var d=At(10.05,"receive","r-1",.02/.45,.45,true);Require(Near(WorldViewPlayback.EventAt(a.players[0],d.players[0],10,10.05),10.03)&&WorldViewPlayback.Blend(a,d,.4).players[0].action=="run","r20 known native duration and progress give the same event time");
        // Unknown timing keeps the earlier binding: the bridge's fallback duration 1 is no time.
        var legacy=At(10.05,"receive","r-1",.3,1);var lh=WorldViewPlayback.Blend(a,legacy,.5).players[0];
        Require(double.IsNaN(WorldViewPlayback.EventAt(a.players[0],legacy.players[0],10,10.05))&&lh.action=="receive"&&lh.progress==.3&&string.IsNullOrEmpty(lh.leadAction),"r20 without timing the earlier binding (b's facts at once, no lead)");
        var noDur=At(10.05,"receive","r-1",.3,1,false);Require(double.IsNaN(WorldViewPlayback.EventAt(a.players[0],noDur.players[0],10,10.05)),"r20 a fallback duration never makes an event time");
        // Excluded or not new: keeper/held actions, the same action continuing, an event at or before a, countdowns.
        var save=At(10,"save","s-1");Require(WorldViewPlayback.Blend(save,b,.5).players[0].action=="receive","r20 a keeper save keeps the earlier binding");
        var held=At(10,"run","run");held.players[0].ballHeld=true;Require(WorldViewPlayback.Blend(held,b,.5).players[0].action=="receive","r20 a held ball keeps the earlier binding");
        var same=At(10,"receive","r-1",.1,.45,true,9.955,true);var sameNext=At(10.05,"receive","r-1",.2111,.45,true,9.955,true);Require(WorldViewPlayback.Blend(same,sameNext,.5).players[0].action=="receive"&&string.IsNullOrEmpty(WorldViewPlayback.Blend(same,sameNext,.5).players[0].leadAction),"r20 the same contact continuing is no new event");
        var early=At(10.05,"receive","r-1",.2,.45,true,9.99,true);Require(WorldViewPlayback.Blend(a,early,.5).players[0].action=="receive","r20 an event at or before a binds at once");
        var ready=At(10.05,"kickReady","kick-ready",0,.35,true,10.05,true);var rh=WorldViewPlayback.Blend(a,ready,.5).players[0];
        Require(rh.action=="kickReady"&&!rh.actionAtKnown,"r20 a countdown keeps the earlier binding and claims no future native time");
        // A countdown before the contact runs on by its own known duration (at most 1); without one it holds.
        var countdown=At(10,"passReady","kick-ready",.857,.35,true);var pass=At(10.05,"pass","p-1",0,.62,true,10.05,true);
        Require(Near(WorldViewPlayback.Blend(countdown,pass,.5).players[0].progress,Math.Min(1,.857+.025/.35)),"r20 the countdown runs on by its known duration until the contact");
        {var carrier=At(10,"passReady","kick-ready",.857,.35,true);carrier.owner=carrier.players[0].id;carrier.ballInFlight=false;var kicked=At(10.05,"pass","p-2",0,.62,true,10.05,true);kicked.owner="";kicked.ballInFlight=true;var mid=WorldViewPlayback.Blend(carrier,kicked,.5);var at=WorldViewPlayback.Blend(kicked.clock>0?carrier:carrier,kicked,1-1e-8);
         Require(mid.owner==carrier.players[0].id&&!mid.ballInFlight&&at.owner==""&&at.ballInFlight,"r20 ball ownership and flight change with the contact at its native time");}
        var heldCountdown=At(10,"passReady","kick-ready",.857,1,false);Require(WorldViewPlayback.Blend(heldCountdown,pass,.5).players[0].progress==.857,"r20 a countdown without a known duration holds its progress");
        // The live buffer: 0.025, 0.05 and 0.1 s pictures, a picture arriving before the blend ends, a repeated clock, pause and seek.
        foreach(double step in new[]{.025,.05,.1}){
            var pa=At(20,"run","run");var pb=At(20+step,"receive","r-2",0,.45,true,20+step,true);var buffer=new WorldViewPlayback();buffer.Receive(pa,0);buffer.Receive(pb,1);
            var mid=buffer.Sample(1+step*.6);var end=buffer.Sample(1+step);
            Require(mid.players[0].action=="run"&&Near(mid.players[0].leadIn,step*.4)&&end.players[0].action=="receive"&&Math.Abs(end.clock-pb.clock)<1e-9,"r20 live buffer at "+step.ToString("0.000",System.Globalization.CultureInfo.InvariantCulture)+" s pictures: contact at its native time");
        }
        {var f0=At(30,"run","run");var f1=At(30.05,"run","run");var f2=At(30.10,"receive","r-3",0,.45,true,30.10,true);var buffer=new WorldViewPlayback();buffer.Receive(f0,0);buffer.Receive(f1,1);buffer.Receive(f2,1.02);
         var s=buffer.Sample(1.06);Require(s.clock<30.10&&s.players[0].action=="run"&&s.players[0].leadIn>0,"r20 a picture arriving before the blend ends keeps the native event time");
         Require(buffer.Sample(1.07).players[0].action=="receive","r20 the late interval reaches the contact at its end");
         var repeat=At(30.10,"receive","r-3",0,.45,true,30.10,true);buffer.Receive(repeat,2);Require(ReferenceEquals(buffer.Sample(2.01),repeat),"r20 a repeated clock shows the picture, no lead");
         var paused=At(30.15,"receive","r-3",.111,.45,true,30.10,true,"paused");buffer.Receive(paused,3);Require(ReferenceEquals(buffer.Sample(3.02),paused),"r20 a pause shows the picture, no lead");
         var seek=At(5,"receive","r-4",0,.45,true,5,true);buffer.Receive(seek,4);Require(ReferenceEquals(buffer.Sample(4.01),seek),"r20 a seek shows the picture, no lead");}
        // Validation of the received timing and the display lead; a received lead is cleared.
        var view=new WorldViewState(JsonUtility.FromJson<WorldConfig>(raw));
        bool Rejects(Action<WorldFrame> change){var f=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(view.Frame));f.sequence=view.Frame.sequence+1;f.clock=12;change(f);try{view.Validate(f);return false;}catch(ArgumentException){return true;}}
        Require(Rejects(f=>{f.players[0].actionAtKnown=true;f.players[0].actionAt=double.NaN;})&&Rejects(f=>{f.players[0].actionAtKnown=true;f.players[0].actionAt=double.PositiveInfinity;})&&Rejects(f=>{f.players[0].actionAtKnown=true;f.players[0].actionAt=-.1;})&&Rejects(f=>{f.players[0].actionAtKnown=true;f.players[0].actionAt=12.01;}),"r20 a known native action time that is not finite, negative or after its picture is rejected");
        Require(!Rejects(f=>{f.players[0].actionAtKnown=true;f.players[0].actionAt=12;})&&!Rejects(f=>{f.players[0].actionAt=99;}),"r20 a known time at its picture is valid; an unknown one is not read");
        Require(Rejects(f=>{f.players[0].leadAction="save";f.players[0].leadContact=new[]{1.0,.3,1};f.players[0].leadIn=.02;f.players[0].leadSpan=.05;})&&Rejects(f=>{f.players[0].leadAction="receive";f.players[0].leadContact=null;f.players[0].leadIn=.02;f.players[0].leadSpan=.05;})&&Rejects(f=>{f.players[0].leadAction="receive";f.players[0].leadContact=new[]{1.0,.3,1};f.players[0].leadIn=0;f.players[0].leadSpan=.05;}),"r20 an invalid display lead is rejected");
        var leadFrame=WorldViewPlayback.Blend(a,b,.5);WorldViewPlayback.StripLead(leadFrame);var stripped=leadFrame.players[0];Require(string.IsNullOrEmpty(stripped.leadAction)&&stripped.leadContact==null&&stripped.leadIn<0&&stripped.leadSpan<0,"r20 a received picture's display lead is cleared");
    }
}
#endif

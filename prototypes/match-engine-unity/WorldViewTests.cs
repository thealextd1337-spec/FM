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
        var report=JsonUtility.ToJson(new Report{passed=checks.Count,checks=checks.ToArray()},true);File.WriteAllText(Path.Combine(repository,outputFolder??"outputs/platform/world-unity",outputFolder==null?"contract-tests.json":"world-tests.json"),report);return report;
    }
    [Serializable] class Report {public int passed;public string[] checks;}
}
#endif

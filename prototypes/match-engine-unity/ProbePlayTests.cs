#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
using Doppel6.Probe;
public static class ProbePlayTests {
    [Serializable] class Catalogue {public Scenario[] cases;}
    [Serializable] class Row {public string id;public bool passed,checkpointPassed,corruptRejected;public State state;}
    [Serializable] class Report {public string sourceId=ProbeBuildIdentity.SourceId;public bool passed;public Row[] cases;public bool receiverMiss,removedInterception;}
    static void Check(bool condition,string message){if(!condition)throw new Exception(message);}
    static void Same(State a,State b,string label){Check(a.tick==b.tick&&a.outcome==b.outcome&&a.ownerId==b.ownerId&&a.playPhase==b.playPhase&&a.events.Count==b.events.Count&&a.score[0]==b.score[0]&&a.score[1]==b.score[1],label);Check(Math.Abs(a.elapsed-b.elapsed)<1e-8,label+" time");for(int i=0;i<3;i++){Check(Math.Abs(a.ball.position[i]-b.ball.position[i])<1e-8&&Math.Abs(a.ball.velocity[i]-b.ball.velocity[i])<1e-8,label+" ball");}for(int i=0;i<a.events.Count;i++)Check(a.events[i].id==b.events[i].id&&a.events[i].type==b.events[i].type&&a.events[i].tick==b.events[i].tick&&Math.Abs(a.events[i].time-b.events[i].time)<1e-8,label+" ledger");for(int i=0;i<a.actors.Length;i++)for(int j=0;j<3;j++)Check(Math.Abs(a.actors[i].position[j]-b.actors[i].position[j])<1e-8&&Math.Abs(a.actors[i].facing[j]-b.actors[i].facing[j])<1e-8,label+" actors");}
    static ProbeSimulation Run(Scenario scene){var sim=new ProbeSimulation(new Config{scenario=scene,followThroughSeconds=3});sim.Start();for(int i=0;i<1000&&!sim.State.finished;i++)sim.Step();Check(sim.State.finished,"Play did not end");return sim;}
    public static string Run(string repository){var scenes=JsonUtility.FromJson<Catalogue>("{\"cases\":"+File.ReadAllText(Path.Combine(repository,"work/platform/engine-probe/web/play-catalog.json"))+"}").cases;var rows=new List<Row>();
        foreach(var scene in scenes){var sim=Run(scene);var s=sim.State;Check(s.actors.Length==(scene.geometry.fieldPlayers+1)*2,"Roster");Check(s.events.FindAll(e=>e.type=="result").Count==1,"Unique result");Check(Math.Abs(s.elapsed-s.resolvedAt-3)<1e-8,"Tail");string expected=scene.provenance.family=="play-goal"?"goal":scene.provenance.family=="play-interception"?"interception":"possession";Check(s.outcome==expected,"Wrong contact result "+scene.id);foreach(var e in s.events)if(e.type=="contact")Check(e.contactPoint!=null&&e.ballDistance<=s.ball.radius+e.contactRadius+1e-7,"Contact outside reach");
            var interrupted=new ProbeSimulation(sim.Config);interrupted.Start();for(int i=0;i<110;i++)interrupted.Step();interrupted.Pause();var paused=JsonUtility.ToJson(interrupted.State);interrupted.Step();Check(paused==JsonUtility.ToJson(interrupted.State),"Pause");var cp=JsonUtility.FromJson<Checkpoint>(JsonUtility.ToJson(interrupted.Checkpoint()));var resumed=new ProbeSimulation(sim.Config);resumed.Restore(ProbeBridge.ReadRestoreCheckpoint("{\"config\":{\"checkpoint\":"+JsonUtility.ToJson(cp)+"}}"));resumed.Start();while(!resumed.State.finished)resumed.Step();Same(resumed.State,s,"Continuation diverged "+scene.id);
            var before=JsonUtility.ToJson(interrupted.State);cp.state.phaseStarted=999;bool rejected=false;try{interrupted.Restore(cp);}catch(ArgumentException){rejected=true;}Check(rejected&&before==JsonUtility.ToJson(interrupted.State),"Corrupt play restore not atomic");rows.Add(new Row{id=scene.id,passed=true,checkpointPassed=true,corruptRejected=true,state=s});
        }
        var goal=JsonUtility.FromJson<Scenario>(JsonUtility.ToJson(scenes[0]));Array.Find(goal.actors,a=>a.id=="receiver").velocity=new[]{0.0,0,6};bool receiverMiss=!Run(goal).State.events.Exists(e=>e.type=="received"||e.type=="shot-release");var intercept=JsonUtility.FromJson<Scenario>(JsonUtility.ToJson(Array.Find(scenes,s=>s.provenance.family=="play-interception")));Array.Find(intercept.actors,a=>a.id=="defender").position[2]+=7;bool removed=Run(intercept).State.outcome=="goal";Check(receiverMiss&&removed,"Contact negative cases");
        var report=new Report{passed=true,cases=rows.ToArray(),receiverMiss=receiverMiss,removedInterception=removed};var json=JsonUtility.ToJson(report,true);File.WriteAllText(Path.Combine(repository,"prototypes/match-engine-unity/play-tests.json"),json);return "Passed "+rows.Count+" linked play cases, checkpoints and negative contacts";
    }
}
#endif

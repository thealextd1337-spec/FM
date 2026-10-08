#if UNITY_EDITOR
using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using UnityEngine;
using Doppel6.Probe;
public static class ProbePhysicsTests {
    [Serializable] class Expected {public string type,reason;}
    [Serializable] class TestScene : Scenario {public Expected expected;}
    [Serializable] class Catalog {public TestScene[] cases;}
    [Serializable] class Result {public string id;public bool passed,checkpointPassed;public State state;public State[] trace;}
    [Serializable] class Report {public string sourceId=ProbeBuildIdentity.SourceId;public int total,passed;public Result[] cases;}
    static void Require(bool b,string message){if(!b)throw new Exception(message);}
    static State Copy(State s){return JsonUtility.FromJson<State>(JsonUtility.ToJson(s));}
    public static string Run(string repo){
        var catalog=JsonUtility.FromJson<Catalog>("{\"cases\":"+File.ReadAllText(Path.Combine(repo,"work/platform/engine-probe/web/physics-catalog.json"))+"}").cases;var results=new List<Result>();
        foreach(var scene in catalog){
            var config=new Config{scenario=scene,seed=617,followThroughSeconds=3};var sim=new ProbeSimulation(config);sim.Start();var trace=new List<State>();ProbeSimulation restored=null;
            for(int i=0;i<1000&&!sim.State.finished;i++){
                sim.Step();if(sim.State.tick%6==0)trace.Add(Copy(sim.State));
                if(i==30){sim.Pause();var before=JsonUtility.ToJson(sim.State);sim.Step();Require(before==JsonUtility.ToJson(sim.State),"Pause advanced");var cp=sim.Checkpoint();restored=new ProbeSimulation(config);restored.Restore(ProbeBridge.ReadRestoreCheckpoint("{\"config\":{\"checkpoint\":"+JsonUtility.ToJson(cp)+"}}"));sim.Start();restored.Start();}
                else if(restored!=null)restored.Step();
            }
            Require(sim.State.finished&&restored!=null&&restored.State.finished,"Probe did not finish: "+scene.id+" / "+sim.State.elapsed+" / "+restored?.State.elapsed);
            Require(sim.State.events.Any(e=>e.type==scene.expected.type&&(scene.expected.reason==null||e.reason==scene.expected.reason)),"Missing physical event: "+scene.id);
            Require(sim.State.events.Count(e=>e.type=="result")==1&&sim.State.events.Select(e=>e.id).Distinct().Count()==sim.State.events.Count,"Duplicate ledger");
            Require(Math.Abs(sim.State.elapsed-sim.State.resolvedAt-3)<1e-8,"Missing follow-through");
            Require(sim.State.ball.position.Zip(restored.State.ball.position,(a,b)=>Math.Abs(a-b)<1e-8).All(x=>x)&&sim.State.events.Select(e=>e.type+e.reason).SequenceEqual(restored.State.events.Select(e=>e.type+e.reason)),"Restore diverged");
            Require(sim.State.ball.position[1]>=scene.ball.radius-1e-8,"Ball below ground");
            if(scene.provenance.family=="physics-post"||scene.provenance.family=="physics-crossbar")Require(sim.State.score.Sum()==0,"Frame impact scored");
            if(scene.provenance.family=="physics-net")Require(sim.State.score.Sum()==1&&sim.State.events.Any(e=>e.type=="net-contact"),"Goal/net missing");
            results.Add(new Result{id=scene.id,passed=true,checkpointPassed=true,state=sim.State,trace=trace.ToArray()});
        }
        var report=new Report{total=results.Count,passed=results.Count,cases=results.ToArray()};File.WriteAllText(Path.Combine(repo,"prototypes/match-engine-unity/physics-tests.json"),JsonUtility.ToJson(report,true));return report.passed+"/"+report.total;
    }
}
#endif

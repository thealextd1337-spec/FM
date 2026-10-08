#if UNITY_EDITOR
using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using UnityEngine;
using Doppel6.Probe;

public static class ProbeFollowThroughTests {
    [Serializable] class Catalog { public Scenario[] cases; }
    [Serializable] class Result { public string scene; public bool passed; public double resolvedAt,finishedAt; public string[] events; }
    [Serializable] class Report { public int passed,total; public Result[] cases; }
    static void Require(bool condition,string message){if(!condition)throw new Exception(message);}
    static ProbeSimulation Create(Scenario scene){return new ProbeSimulation(new Config{scenario=scene,seed=617,followThroughSeconds=3});}
    static void RunToEnd(ProbeSimulation sim){sim.Start();for(int i=0;i<1200&&!sim.State.finished;i++)sim.Step();Require(sim.State.finished,"Follow-through never finished");}
    public static string Run(string repository){
        var catalog=JsonUtility.FromJson<Catalog>("{\"cases\":"+File.ReadAllText(Path.Combine(repository,"work/match-next/contacts/catalog.json"))+"}").cases;
        var results=new List<Result>();
        foreach(int direction in new[]{-1,1}){
            var scene=catalog.First(s=>s.provenance.family=="free-goal-keeper-left"&&s.geometry.length==68&&s.geometry.fieldPlayers==5&&s.geometry.attackDirection==direction);
            var sim=Create(scene);sim.Start();for(int i=0;i<120&&!sim.State.following;i++)sim.Step();
            Require(sim.State.following&&!sim.State.finished&&sim.State.resultDelivered,"Goal must enter a running follow-through");
            Require(sim.State.score.Sum()==1&&Math.Abs(sim.State.ball.velocity[0])>1,"Goal must retain its incoming ball velocity");
            for(int i=0;i<18;i++)sim.Step();sim.Pause();var paused=JsonUtility.ToJson(sim.State);sim.Step();Require(paused==JsonUtility.ToJson(sim.State),"Pause advanced follow-through");
            var cp=sim.Checkpoint();var restored=Create(scene);restored.Restore(ProbeBridge.ReadRestoreCheckpoint("{\"command\":\"restore\",\"config\":{\"checkpoint\":"+JsonUtility.ToJson(cp)+"}}"));
            var before=JsonUtility.ToJson(sim.State);var bad=sim.Checkpoint();bad.state.followThroughUntil+=1;bool rejected=false;try{sim.Restore(bad);}catch(ArgumentException){rejected=true;}
            Require(rejected&&before==JsonUtility.ToJson(sim.State),"Malformed follow-through checkpoint was not rejected atomically");
            RunToEnd(sim);RunToEnd(restored);
            Require(sim.State.tick==restored.State.tick&&sim.State.ball.position.Zip(restored.State.ball.position,(a,b)=>Math.Abs(a-b)<1e-8).All(x=>x),"Follow-through restore diverged");
            Require(sim.State.events.Select(e=>e.type).SequenceEqual(restored.State.events.Select(e=>e.type)),"Follow-through events diverged");
            Require(Math.Abs(sim.State.elapsed-sim.State.resolvedAt-3)<1e-8,"Follow-through must last three simulation seconds");
            Require(sim.State.events.Count(e=>e.type=="goal")==1&&sim.State.events.Count(e=>e.type=="result")==1&&sim.State.events.Any(e=>e.type=="net-contact"),"Goal/net/result events are inconsistent");
            Require(Math.Abs(sim.State.ball.position[0])<=scene.geometry.length/2+2.2-scene.ball.radius+1e-8&&sim.State.ball.position[1]>=scene.ball.radius-1e-8,"Ball escaped the net or ground");
            results.Add(new Result{scene=scene.id,passed=true,resolvedAt=sim.State.resolvedAt,finishedAt=sim.State.elapsed,events=sim.State.events.Select(e=>e.type).ToArray()});
        }
        var catchScene=catalog.First(s=>s.provenance.family=="keeper-reachable"&&s.geometry.length==68&&s.geometry.fieldPlayers==5);
        var caught=Create(catchScene);caught.Start();for(int i=0;i<120&&!caught.State.following;i++)caught.Step();var position=(double[])caught.State.ball.position.Clone();RunToEnd(caught);
        Require(!string.IsNullOrEmpty(caught.State.ownerId)&&position.SequenceEqual(caught.State.ball.position)&&!caught.State.events.Any(e=>e.type=="net-contact"),"Caught ball must remain held");
        results.Add(new Result{scene=catchScene.id,passed=true,resolvedAt=caught.State.resolvedAt,finishedAt=caught.State.elapsed,events=caught.State.events.Select(e=>e.type).ToArray()});
        var parryScene=JsonUtility.FromJson<Scenario>(JsonUtility.ToJson(catchScene));Array.Find(parryScene.actors,a=>a.id=="keeper").action="parry";var parry=Create(parryScene);RunToEnd(parry);
        Require(parry.State.events.Any(e=>e.type=="parry")&&parry.State.ball.position[1]>=parryScene.ball.radius-1e-8&&parry.State.elapsed>=3,"Parried ball did not complete its settling phase");
        results.Add(new Result{scene=parryScene.id+"-parry",passed=true,resolvedAt=parry.State.resolvedAt,finishedAt=parry.State.elapsed,events=parry.State.events.Select(e=>e.type).ToArray()});
        var report=new Report{total=results.Count,passed=results.Count(r=>r.passed),cases=results.ToArray()};var json=JsonUtility.ToJson(report,true);File.WriteAllText(Path.Combine(repository,"prototypes/match-engine-unity/follow-through-tests.json"),json);return json;
    }
}
#endif

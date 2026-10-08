#if UNITY_EDITOR
using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using UnityEngine;
using Doppel6.Probe;
public static class ProbeNetTests {
    [Serializable] class Catalog {public Scenario[] cases;}
    [Serializable] class Result {public string id;public double peak;public bool gradualBraking,oscillated,checkpointPassed,corruptRejected,fixedAttachments;}
    [Serializable] class Report {public string sourceId=ProbeBuildIdentity.SourceId;public bool passed=true;public Result[] cases;}
    static void Require(bool b,string text){if(!b)throw new Exception(text);}
    public static string Run(string repo){
        var catalog=JsonUtility.FromJson<Catalog>("{\"cases\":"+File.ReadAllText(Path.Combine(repo,"work/platform/engine-probe/web/physics-catalog.json"))+"}").cases;var results=new List<Result>();
        foreach(var scene in catalog.Where(s=>s.provenance.family=="physics-net")){
            var config=new Config{scenario=scene,seed=617,followThroughSeconds=3};var sim=new ProbeSimulation(config);sim.Start();bool gradual=false,oscillated=false;double peak=0;ProbeSimulation restored=null;
            while(!sim.State.finished){sim.Step();if(restored!=null)restored.Step();if(sim.State.netPatches.Count==0)continue;var patch=sim.State.netPatches[0];peak=Math.Max(peak,patch.displacement);gradual|=sim.State.ball.velocity[0]*scene.geometry.attackDirection>1&&patch.displacement>.02;oscillated|=patch.displacement<-.01;
                if(restored==null&&patch.displacement>.4){Require(ProbeNet.Displacement(scene.geometry,patch.position,patch)>.4,"No local bulge");Require(ProbeNet.Displacement(scene.geometry,new[]{patch.position[0],0.0,0},patch)==0,"Attachment moved");sim.Pause();var before=JsonUtility.ToJson(sim.State);sim.Step();Require(before==JsonUtility.ToJson(sim.State),"Paused net moved");var cp=sim.Checkpoint();var bad=sim.Checkpoint();bad.state.netPatches[0].displacement=999;bool rejected=false;try{sim.Restore(bad);}catch(ArgumentException){rejected=true;}Require(rejected&&before==JsonUtility.ToJson(sim.State),"Bad net checkpoint not rejected atomically");restored=new ProbeSimulation(config);restored.Restore(ProbeBridge.ReadRestoreCheckpoint("{\"config\":{\"checkpoint\":"+JsonUtility.ToJson(cp)+"}}"));sim.Start();restored.Start();}
            }
            Require(gradual&&oscillated&&peak>.5&&peak<1.6,"Rigid or unstable net");Require(sim.State.score.Sum()==1&&sim.State.events.Count(e=>e.type=="net-contact")==1,"Goal/contact repeated");Require(Math.Abs(sim.State.netPatches[0].displacement)<.005,"Net did not settle");Require(restored!=null&&restored.State.finished&&sim.State.ball.position.Zip(restored.State.ball.position,(a,b)=>Math.Abs(a-b)<1e-8).All(x=>x),"Deformed net restore diverged");
            results.Add(new Result{id=scene.id,peak=peak,gradualBraking=true,oscillated=true,checkpointPassed=true,corruptRejected=true,fixedAttachments=true});
        }
        File.WriteAllText(Path.Combine(repo,"prototypes/match-engine-unity/net-tests.json"),JsonUtility.ToJson(new Report{cases=results.ToArray()},true));return results.Count+" net cases passed";
    }
}
#endif

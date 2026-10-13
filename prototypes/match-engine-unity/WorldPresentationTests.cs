#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
namespace Doppel6.Probe {
public static class WorldPresentationTests {
    [Serializable] class Check {public string name;public bool passed;}
    [Serializable] class Report {public bool passed;public Check[] checks;}
    public static string Run(string repo,string output=null){
        var raw=File.ReadAllText(Path.Combine(repo,"outputs/platform/world-unity/contract-fixture.json"));
        var checks=new List<Check>();
        WorldConfig Config()=>JsonUtility.FromJson<WorldConfig>(raw);
        WorldPresentation Display(WorldConfig c,string competition="league",string light="day")=>new WorldPresentation{schema="d6-presentation-1",competition=competition,lighting=light,venue="home",lightBucket=50,clubs=new[]{new WorldPresentationClub{id=c.teams[0].id,kind="league",primary="#14337a",secondary="#e6e7e3"},new WorldPresentationClub{id=c.teams[1].id,kind="league",primary="#edac24",secondary="#142629"}}};
        void Accept(string name,WorldConfig c){new WorldViewState(c);checks.Add(new Check{name=name,passed=true});}
        void Reject(string name,WorldConfig c){bool rejected=false;try{new WorldViewState(c);}catch(ArgumentException){rejected=true;}if(!rejected)throw new Exception(name);checks.Add(new Check{name=name,passed=true});}
        Accept("Legacy config without presentation stays valid",Config());
        var c=Config();c.presentation=Display(c);Accept("Valid league daytime display",c);
        c=Config();c.presentation=Display(c,"europe","night");c.presentation.venue="neutral";Accept("European neutral night fixture",c);
        c=Config();c.presentation=Display(c,"europe","day");Reject("Europe cannot request daytime",c);
        c=Config();c.presentation=Display(c);c.presentation.schema="wrong";Reject("Unknown display schema rejected",c);
        c=Config();c.presentation=Display(c);c.presentation.clubs[0].id="foreign";Reject("Club mapping must match physical team order",c);
        c=Config();c.presentation=Display(c);c.presentation.clubs[1].primary="red";Reject("Invalid club colour rejected",c);
        c=Config();c.presentation=Display(c);c.presentation.lightBucket=100;Reject("Bucket must be bounded",c);
        c=Config();c.presentation=Display(c);c.presentation.venue="away";Reject("Unknown venue rejected",c);
        c=Config();c.presentation=new WorldPresentation();Accept("Empty JsonUtility display object remains absent",c);
        var report=new Report{passed=true,checks=checks.ToArray()};
        if(output!=null){Directory.CreateDirectory(Path.Combine(repo,output));File.WriteAllText(Path.Combine(repo,output,"presentation-contract-tests.json"),JsonUtility.ToJson(report,true));}
        return "passed="+checks.Count;
    }
}
}
#endif

#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Animations;
using UnityEngine.Playables;
using UnityEditor;
using UnityEditor.SceneManagement;
using Doppel6.Probe;
public static class FootballActionTests {
    [Serializable] class Report {public int passed;public string[] checks;public Measurement[] measurements;}
    [Serializable] class Measurement {public string stage,foot;public float actionWeight,strideWeight,contactError;public bool reachable;}
    public static string Run(string repository,string outputFolder=null){
        const string asset="Assets/Doppel6EngineProbe/Art/football-v130.fbx";
        AnimationClip Clip(string path,string name){return Array.Find(AssetDatabase.LoadAllAssetsAtPath(path),a=>a is AnimationClip&&a.name==name) as AnimationClip??throw new Exception(name);}
        var scene=EditorSceneManager.NewPreviewScene();var actor=UnityEngine.Object.Instantiate(AssetDatabase.LoadAssetAtPath<GameObject>(asset));UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(actor,scene);actor.transform.localScale=Vector3.one*1.45f;actor.transform.position=new Vector3(0,.08f,0);
        var animator=actor.GetComponent<Animator>();if(animator==null)animator=actor.AddComponent<Animator>();animator.applyRootMotion=false;
        var run=Clip(asset,"running");var fast=Clip(asset,"run_fast4");var shot=Clip(asset,"shot_meshy");var pass=Clip("Assets/Doppel6EngineProbe/Art/pass_inside_meshy.anim","pass_inside_meshy");var receive=Clip("Assets/Doppel6EngineProbe/Art/receive_ground_meshy.anim","receive_ground_meshy");
        var graph=PlayableGraph.Create("D6 running contact validation");graph.SetTimeUpdateMode(DirectorUpdateMode.Manual);var initial=AnimationClipPlayable.Create(graph,run);AnimationPlayableOutput.Create(graph,"Character",animator).SetSourcePlayable(initial);graph.Play();graph.Evaluate(0);
        var checks=new List<string>();var measurements=new List<Measurement>();void Require(bool ok,string name){if(!ok)throw new Exception(name);checks.Add(name);}
        try{
            foreach(var action in new[]{"pass","receive","shot"}){
                Require(FootballActionTiming.Weight(action,0,0,4)==1&&FootballActionTiming.Weight(action,.08,0,4)==1,action+" retains full native contact priority");
                var end=action=="shot"?.49:.31;Require(FootballActionTiming.Weight(action,end,1,4)==0,action+" returns to moving stride promptly");
                Require(FootballActionTiming.Weight(action,.2,0,0)>=FootballActionTiming.Weight(action,.2,0,4),action+" keeps longer standing follow-through");
            }
            Require(FootballActionTiming.Weight("passReady",0,0,4)<FootballActionTiming.Weight("passReady",0,1,4),"Preparation retains the run until native release approaches");
            var animation=new FootballAnimation(graph,actor.transform,new[]{run,fast,pass,receive,shot});var root=actor.transform.position;
            var pose=new FootballAnimation.Pose{clip=run,loop=true,time=.2,key="carry"};animation.Sample(pose,10,true);
            pose=new FootballAnimation.Pose{clip=receive,time=.7,key="receive-1",baseClip=run,baseTime=.25,baseLoop=true,actionWeight=1,contact=true,kind="foot",target=new Vector3(.25f,.25f,.3f)};
            animation.Sample(pose,10.05);animation.Sample(pose,10.16);
            Require(animation.rig.reachable&&animation.rig.contactError<.03,"Moving reception reaches the actual right foot");
            measurements.Add(new Measurement{stage="receive-contact",foot="right",actionWeight=animation.Weight(receive),strideWeight=animation.Weight(run),contactError=animation.rig.contactError,reachable=animation.rig.reachable});
            pose.contact=false;pose.time=.93;pose.baseTime=.49;pose.actionWeight=FootballActionTiming.Weight("receive",.23,.8,4);animation.Sample(pose,10.28);
            Require(animation.Weight(run)>.5&&animation.Weight(receive)<.5,"Reception rejoins the observed run within 0.23 native seconds");
            Require(Math.Abs(animation.Weight(run)+animation.Weight(receive)-1)<.00001,"Running action blend is normalized");
            var bones=actor.GetComponentsInChildren<Transform>();var paused=Array.ConvertAll(bones,t=>t.position);pose.time=1.1;pose.baseTime=.6;pose.actionWeight=0;animation.Sample(pose,10.28);
            Require(Array.TrueForAll(Array.ConvertAll(bones,t=>Array.IndexOf(bones,t)),i=>Vector3.Distance(paused[i],bones[i].position)<.00001f),"Paused native clock freezes both blended clips");
            pose.clip=pass;pose.time=.8;pose.actionWeight=1;pose.key="one-two-pass";pose.contact=true;animation.Sample(pose,10.31);animation.Sample(pose,10.42);
            Require(animation.rig.reachable&&animation.rig.contactError<.03,"A quick reception-to-pass retains bounded real-foot contact");
            pose.contact=false;pose.time=1.11;pose.baseClip=fast;pose.baseTime=.7;pose.actionWeight=0;animation.Sample(pose,10.65);animation.Sample(pose,10.77);
            Require(animation.Weight(fast)>.99&&animation.Weight(pass)<.01,"Completed pass follows straight into the actual off-ball run");
            Require(actor.transform.position==root,"Running reception and one-two never change authoritative root");
            foreach(int sign in new[]{1,-1}){
                actor.transform.rotation=Quaternion.LookRotation(new Vector3(0,0,sign));pose.clip=run;pose.baseClip=null;pose.loop=true;pose.time=.5;pose.contact=true;pose.kind="left-foot";pose.target=new Vector3(-.20f*sign,.24f,.23f*sign);pose.key="left-carry"+sign;animation.Sample(pose,11+sign*.1,true);
                measurements.Add(new Measurement{stage="carrier-reach",foot="left",actionWeight=1,contactError=animation.rig.contactError,reachable=animation.rig.reachable});
                Require(animation.rig.reachable&&animation.rig.contactError<.03,"Controlled stride can reach with left foot direction "+sign);
            }
            pose.target=Vector3.one*100;animation.Sample(pose,12,true);Require(!animation.rig.reachable&&animation.rig.contactError>100,"Unreachable carrier ball remains unreachable");Require(actor.transform.position==root,"Carrier reach cannot attract ball or reposition player");
            Require(graph.GetPlayableCount()<=8,"Action iteration reuses cached graph nodes");
            var json=JsonUtility.ToJson(new Report{passed=checks.Count,checks=checks.ToArray(),measurements=measurements.ToArray()},true);Directory.CreateDirectory(Path.Combine(repository,outputFolder??"outputs/platform/action-iteration"));File.WriteAllText(Path.Combine(repository,outputFolder??"outputs/platform/action-iteration",outputFolder==null?"rig-tests.json":"actions-tests.json"),json);return json;
        }finally{if(graph.IsValid())graph.Destroy();EditorSceneManager.ClosePreviewScene(scene);}
    }
}
#endif

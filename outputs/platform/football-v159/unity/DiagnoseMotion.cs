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
public static class DiagnoseMotion159 {
    [Serializable] class Report {public string phase;public int failed;public Check[] checks;public ClipPoint[] keeper;}
    [Serializable] class Check {public string name;public bool passed;public double measured;}
    [Serializable] class ClipPoint {public string clip;public float time,x,y,z,length;}
    public static string Run(string repository) {
        var checks=new List<Check>();var points=new List<ClipPoint>();
        void Check(bool ok,string name,double measured=0){checks.Add(new Check{name=name,passed=ok,measured=measured});}
        const string asset="Assets/Doppel6EngineProbe/Art/football-v130.fbx";
        var scene=EditorSceneManager.NewPreviewScene();var graph=PlayableGraph.Create("D6 motion diagnosis");
        try {
            var actor=UnityEngine.Object.Instantiate(AssetDatabase.LoadAssetAtPath<GameObject>(asset));UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(actor,scene);actor.transform.localScale=Vector3.one*1.45f;
            var animator=actor.GetComponent<Animator>();if(animator==null)animator=actor.AddComponent<Animator>();animator.applyRootMotion=false;
            AnimationClip Clip(string name)=>Array.Find(AssetDatabase.LoadAllAssetsAtPath(asset),a=>a is AnimationClip&&a.name==name) as AnimationClip??throw new Exception(name);
            var run=Clip("run_fast4");var idle=Clip("keeper_ready_meshy");var dive=Clip("keeper_dive_meshy");var high=Clip("keeper_high_meshy");var low=Clip("keeper_low_meshy");
            graph.SetTimeUpdateMode(DirectorUpdateMode.Manual);AnimationPlayableOutput.Create(graph,"Character",animator).SetSourcePlayable(AnimationClipPlayable.Create(graph,idle));graph.Play();graph.Evaluate(0);
            var animation=new FootballAnimation(graph,actor.transform,new[]{run,idle,dive,high,low});
            foreach(var clip in new[]{dive,high,low})for(int sample=0;sample<=12;sample++){
                float time=Math.Min(clip.length-.001f,sample*clip.length/12);animation.Sample(new FootballAnimation.Pose{clip=clip,time=time,key=clip.name},10+sample*.05,true);
                var hand=Array.Find(actor.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:RightHand");var p=actor.transform.InverseTransformPoint(hand.position);
                points.Add(new ClipPoint{clip=clip.name,time=time,x=p.x,y=p.y,z=p.z,length=clip.length});
            }
            animation.Sample(new FootballAnimation.Pose{clip=idle,time=.4,loop=true,key="ready"},20,true);
            animation.Sample(new FootballAnimation.Pose{clip=dive,time=1.45,key="actual-native-save",contact=true,kind="hand",target=Vector3.right*1.5f+Vector3.up*.45f},20.01);
            Check(animation.Weight(dive)>=.98,"An already observed keeper contact has its authored action pose immediately",animation.Weight(dive));
            var frame=JsonUtility.FromJson<WorldConfig>(File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json"))).initial;
            frame.phase="live";frame.clock=10;var next=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(frame));next.clock=10.05;next.sequence++;next.players[0].action="save";next.players[0].actionId="observed-save";next.players[0].progress=.5;
            var playback=new WorldViewPlayback();playback.Receive(frame,0);playback.Receive(next,.05);var sampled=playback.Sample(.05);
            Check(sampled.players[0].action=="save","Known keeper launch is presented on the arrival frame, rather than one display frame later");
            var bridge=File.ReadAllText(Path.Combine(repository,"prototypes/match-engine-unity/WorldViewBridge.cs"));
            Check(bridge.Contains("ballView.rotation="),"The actual world ball renderer applies a travel-derived orientation");
        } finally {if(graph.IsValid())graph.Destroy();EditorSceneManager.ClosePreviewScene(scene);}
        var report=new Report{phase="baseline",failed=checks.FindAll(c=>!c.passed).Count,checks=checks.ToArray(),keeper=points.ToArray()};var json=JsonUtility.ToJson(report,true);File.WriteAllText(Path.Combine(repository,"outputs/platform/football-v159/unity/baseline-diagnosis.json"),json);return json;
    }
}
#endif

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
public static class FootballTests {
    [Serializable] class Result {public int passed;public string[] checks;public Measurement[] measurements;}
    [Serializable] class Measurement {public string clip;public float contactError,plantError;public bool reachable;}
    public static string Run(string repository,string outputFolder=null){
        const string original="Assets/Doppel6EngineProbe/Art/football-v130.fbx";
        AnimationClip Clip(string path,string name){return Array.Find(AssetDatabase.LoadAllAssetsAtPath(path),a=>a is AnimationClip&&a.name==name) as AnimationClip??throw new Exception(name);}
        var scene=EditorSceneManager.NewPreviewScene();var prefab=AssetDatabase.LoadAssetAtPath<GameObject>(original);var actor=UnityEngine.Object.Instantiate(prefab);UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(actor,scene);actor.transform.localScale=Vector3.one*1.45f;actor.transform.position=new Vector3(0,.08f,0);
        var animator=actor.GetComponent<Animator>();if(animator==null)animator=actor.AddComponent<Animator>();animator.applyRootMotion=false;
        var idle=Clip(original,"idle_stand_meshy");var pass=Clip("Assets/Doppel6EngineProbe/Art/pass_inside_meshy.anim","pass_inside_meshy");var receive=Clip("Assets/Doppel6EngineProbe/Art/receive_ground_meshy.anim","receive_ground_meshy");var shot=Clip(original,"shot_meshy");
        var graph=PlayableGraph.Create("D6 isolated football validation");graph.SetTimeUpdateMode(DirectorUpdateMode.Manual);var initial=AnimationClipPlayable.Create(graph,idle);AnimationPlayableOutput.Create(graph,"Character",animator).SetSourcePlayable(initial);graph.Play();graph.Evaluate(0);
        var checks=new List<string>();var measurements=new List<Measurement>();void Require(bool condition,string name){if(!condition)throw new Exception(name);checks.Add(name);}
        try{
            var animation=new FootballAnimation(graph,actor.transform,new[]{idle,pass,receive,shot});var pose=new FootballAnimation.Pose{clip=pass,time=.8,key="pass-1",plant=true,contact=true,kind="foot",target=new Vector3(.25f,.25f,.3f)};
            foreach(int sign in new[]{1,-1}){actor.transform.rotation=Quaternion.LookRotation(new Vector3(0,0,sign));pose.target=new Vector3(.25f*sign,.25f,.3f*sign);foreach(var clip in new[]{pass,receive,shot}){
                pose.clip=clip;pose.time=clip==pass?.8:clip==receive?.7:.46;pose.key=clip.name+sign;animation.Sample(pose,10,true); var upper=Array.Find(actor.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:RightUpLeg");var lower=Array.Find(actor.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:RightLeg");var end=Array.Find(actor.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:RightFoot"); Debug.Log(clip.name+" upperLength="+Vector3.Distance(upper.position,lower.position)+" lowerLength="+Vector3.Distance(lower.position,end.position)+" targetDistance="+Vector3.Distance(upper.position,pose.target)); measurements.Add(new Measurement{clip=clip.name,contactError=animation.rig.contactError,plantError=animation.rig.plantError,reachable=animation.rig.reachable});Require(animation.rig.reachable&&animation.rig.contactError<.025f,"Actual right foot reaches "+clip.name+" direction "+sign+" error="+animation.rig.contactError+" reachable="+animation.rig.reachable+" hip="+Array.Find(actor.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:RightUpLeg").position+" foot="+Array.Find(actor.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:RightFoot").position);Require(animation.rig.plantError<.035f,"Opposite foot planted "+clip.name+" direction "+sign);
                var frozen=actor.GetComponentsInChildren<Transform>();var before=Array.ConvertAll(frozen,t=>t.position);animation.Sample(pose,10);animation.Sample(pose,10);Require(Array.TrueForAll(Array.ConvertAll(frozen,t=>Array.IndexOf(frozen,t)),i=>Vector3.Distance(before[i],frozen[i].position)<.00001f),"Paused bones freeze "+clip.name+sign);
            }}
            var originalPosition=actor.transform.position;pose.target=Vector3.one*100;animation.Sample(pose,11,true);Require(!animation.rig.reachable&&animation.rig.contactError>100,"Unreachable contact remains a miss");Require(actor.transform.position==originalPosition,"Contact solver never moves the game-owned root");
            pose.clip=idle;pose.loop=true;pose.plant=false;pose.contact=false;pose.key="idle";pose.time=.2;animation.Sample(pose,12,true);var head=Array.Find(actor.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:Head").position;pose.clip=pass;pose.time=.8;pose.loop=false;pose.key="new-pass";animation.Sample(pose,12.02);var start=Array.Find(actor.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:Head").position;Require(Vector3.Distance(head,start)<.25f,"Animation transition is bounded");animation.Sample(pose,12.15);Require(graph.GetPlayableCount()<=7,"Mixer reuses cached nodes without per-frame graph rebuilds");
            pose.clip=receive;pose.time=.7;animation.Sample(pose,2);Require(actor.transform.position==originalPosition,"Backward replay seek preserves authoritative root");
            var report=JsonUtility.ToJson(new Result{passed=checks.Count,checks=checks.ToArray(),measurements=measurements.ToArray()},true);Directory.CreateDirectory(Path.Combine(repository,outputFolder??"outputs/platform/contact-pilot"));File.WriteAllText(Path.Combine(repository,outputFolder??"outputs/platform/contact-pilot",outputFolder==null?"rig-tests.json":"rig-tests.json"),report);return report;
        }finally{if(graph.IsValid())graph.Destroy();EditorSceneManager.ClosePreviewScene(scene);}
    }
}
#endif

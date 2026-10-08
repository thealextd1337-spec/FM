#if UNITY_EDITOR
using System;
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using Doppel6.Probe;
public static class FootballSetup {
    public static string Configure(){
        AnimationClip Clip(string path,string name){return Array.Find(AssetDatabase.LoadAllAssetsAtPath(path),a=>a is AnimationClip&&a.name==name) as AnimationClip??throw new InvalidOperationException("Missing football clip "+name);}
        const string baseAsset="Assets/Doppel6EngineProbe/Art/football-v130.fbx",pilot="Assets/Doppel6EngineProbe/Art/football-contact-pilot.fbx";
        AnimationClip Adapt(string name){
            var source=Clip(pilot,name);var path="Assets/Doppel6EngineProbe/Art/"+name+".anim";var clip=AssetDatabase.LoadAssetAtPath<AnimationClip>(path);
            if(clip==null){clip=new AnimationClip();AssetDatabase.CreateAsset(clip,path);}clip.ClearCurves();clip.name=name;clip.frameRate=source.frameRate;
            // Unity collapses the sole FBX armature root in animation-only files.
            // Restore the existing prefab's exact path; never animate the actor root.
            foreach(var binding in AnimationUtility.GetCurveBindings(source)){var target=binding;target.path="target_character"+(binding.path.Length>0?"/"+binding.path:"");AnimationUtility.SetEditorCurve(clip,target,AnimationUtility.GetEditorCurve(source,binding));}
            AnimationUtility.SetAnimationClipSettings(clip,AnimationUtility.GetAnimationClipSettings(source));EditorUtility.SetDirty(clip);return clip;
        }
        var pass=Adapt("pass_inside_meshy");var receive=Adapt("receive_ground_meshy");
        var previous=UnityEngine.SceneManagement.SceneManager.GetActiveScene();var scene=EditorSceneManager.OpenScene("Assets/Doppel6EngineProbe/Probe.unity",OpenSceneMode.Additive);
        try{ProbeBridge bridge=null;foreach(var root in scene.GetRootGameObjects()){bridge=root.GetComponentInChildren<ProbeBridge>();if(bridge!=null)break;}if(bridge==null)throw new InvalidOperationException("ProbeBridge is missing");bridge.passClip=pass;bridge.receiveClip=receive;bridge.keeperHighClip=Clip(baseAsset,"keeper_high_meshy");bridge.keeperDiveClip=Clip(baseAsset,"keeper_dive_meshy");bridge.keeperRiseClip=Clip(baseAsset,"keeper_rise_meshy");bridge.walkClip=Clip(baseAsset,"walking");bridge.fastRunClip=Clip(baseAsset,"run_fast4");bridge.sprintClip=Clip(baseAsset,"sprint_forward");bridge.backClip=Clip(baseAsset,"back_walk");bridge.brakeClip=Clip(baseAsset,"brake_meshy");bridge.turnLeftClip=Clip(baseAsset,"turn_run_left");bridge.turnRightClip=Clip(baseAsset,"turn_run_right");EditorUtility.SetDirty(bridge);EditorSceneManager.SaveScene(scene);return "Football contacts and seven existing locomotion clips assigned";}
        finally{EditorSceneManager.CloseScene(scene,true);UnityEngine.SceneManagement.SceneManager.SetActiveScene(previous);AssetDatabase.SaveAssets();}
    }
}
#endif

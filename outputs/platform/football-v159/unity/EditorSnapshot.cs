#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEditor;
public static class EditorSnapshot159 {
    [Serializable] class Snapshot {public string dataPath,version,scene,graphics,target,group,compression;public bool dirty,playing,background;public int quality;public string[] pipelines;public Scene[] scenes;}
    [Serializable] class Scene {public bool enabled;public string path;}
    public static string Save(string phase){
        if(Application.dataPath!="G:/unity/My project/Assets")throw new Exception("Unexpected Unity project");
        var current=UnityEngine.SceneManagement.SceneManager.GetActiveScene();var snapshot=new Snapshot{dataPath=Application.dataPath,version=Application.unityVersion,scene=current.path,dirty=current.isDirty,playing=EditorApplication.isPlaying,quality=QualitySettings.GetQualityLevel(),graphics=AssetDatabase.GetAssetPath(GraphicsSettings.defaultRenderPipeline),target=EditorUserBuildSettings.activeBuildTarget.ToString(),group=EditorUserBuildSettings.selectedBuildTargetGroup.ToString(),compression=PlayerSettings.WebGL.compressionFormat.ToString(),background=PlayerSettings.runInBackground,pipelines=new string[QualitySettings.names.Length]};
        try{for(int i=0;i<snapshot.pipelines.Length;i++){QualitySettings.SetQualityLevel(i,false);snapshot.pipelines[i]=AssetDatabase.GetAssetPath(QualitySettings.renderPipeline);}}
        finally{QualitySettings.SetQualityLevel(snapshot.quality,false);}
        snapshot.scenes=Array.ConvertAll(EditorBuildSettings.scenes,s=>new Scene{path=s.path,enabled=s.enabled});
        var json=JsonUtility.ToJson(snapshot,true);File.WriteAllText("F:/Neuer Ordner (2)/ChatGPT/Fussballmanager/outputs/platform/football-v159/unity/editor-"+phase+".json",json);return json;
    }
}
#endif

#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using Doppel6.Probe;
public static class WorldViewSetup {
    public static string Configure(){
        const string root="Assets/Doppel6EngineProbe/Art";
        var mask=(TextureImporter)AssetImporter.GetAtPath(root+"/cloth-mask.png");mask.sRGBTexture=false;mask.textureCompression=TextureImporterCompression.Uncompressed;mask.SaveAndReimport();
        var source=AssetDatabase.LoadAssetAtPath<GameObject>(root+"/football-v130.fbx").GetComponentInChildren<SkinnedMeshRenderer>().sharedMesh;
        var path=root+"/WorldPlayer.asset";var mesh=AssetDatabase.LoadAssetAtPath<Mesh>(path);
        if(mesh==null){mesh=UnityEngine.Object.Instantiate(source);mesh.name="D6 kit rest coordinates";mesh.SetUVs(2,new List<Vector3>(source.vertices));AssetDatabase.CreateAsset(mesh,path);}
        var previous=UnityEngine.SceneManagement.SceneManager.GetActiveScene();var scene=EditorSceneManager.OpenScene("Assets/Doppel6EngineProbe/Probe.unity",OpenSceneMode.Additive);
        try{
            ProbeBridge bridge=null;
            if(bridge==null){foreach(var rootObject in scene.GetRootGameObjects()){bridge=rootObject.GetComponentInChildren<ProbeBridge>();if(bridge!=null)break;}}
            if(bridge==null)throw new InvalidOperationException("ProbeBridge is missing");
            bridge.matchKitShader=AssetDatabase.LoadAssetAtPath<Shader>(root+"/WorldKit.shader");bridge.clothMask=AssetDatabase.LoadAssetAtPath<Texture2D>(root+"/cloth-mask.png");bridge.matchPlayerMesh=mesh;
            if(bridge.matchKitShader==null||bridge.clothMask==null)throw new InvalidOperationException("Match view assets are missing");
            EditorUtility.SetDirty(bridge);EditorSceneManager.SaveScene(scene);
            return "World view assets assigned; mesh vertices="+mesh.vertexCount;
        }finally{EditorSceneManager.CloseScene(scene,true);UnityEngine.SceneManagement.SceneManager.SetActiveScene(previous);AssetDatabase.SaveAssets();}
    }
}
#endif

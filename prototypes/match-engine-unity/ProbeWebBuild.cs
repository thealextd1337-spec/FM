#if UNITY_EDITOR
using System;
using System.IO;
using UnityEngine;
using UnityEditor;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
public static class ProbeWebBuild {
    const string Folder="Assets/Doppel6EngineProbe/Rendering";
    [Serializable] class Previous {public int quality;public string graphics;public string[] pipelines;}
    public static string Configure(string repository){
        var previous=new Previous{quality=QualitySettings.GetQualityLevel(),graphics=AssetDatabase.GetAssetPath(GraphicsSettings.defaultRenderPipeline),pipelines=new string[QualitySettings.names.Length]};
        for(int i=0;i<previous.pipelines.Length;i++){QualitySettings.SetQualityLevel(i,false);previous.pipelines[i]=AssetDatabase.GetAssetPath(QualitySettings.renderPipeline);}QualitySettings.SetQualityLevel(previous.quality,false);
        File.WriteAllText(Path.Combine(repository,"prototypes/match-engine-unity/pipeline-settings-before.json"),JsonUtility.ToJson(previous,true));
        Directory.CreateDirectory(Folder);AssetDatabase.Refresh();
        var renderer=AssetDatabase.LoadAssetAtPath<UniversalRendererData>(Folder+"/ProbeForward.asset");if(renderer==null){renderer=ScriptableObject.CreateInstance<UniversalRendererData>();AssetDatabase.CreateAsset(renderer,Folder+"/ProbeForward.asset");}
        var rd=new SerializedObject(renderer);rd.FindProperty("m_RenderingMode").intValue=0;
        // Post-processing (tonemapping, grading, vignette) needs the package's
        // PostProcessData; reuse the reference the project's own renderer holds.
        var projectRenderer=AssetDatabase.LoadAssetAtPath<UniversalRendererData>("Assets/Settings/Mobile_Renderer.asset");var post=rd.FindProperty("postProcessData");
        if(post!=null&&projectRenderer!=null)post.objectReferenceValue=new SerializedObject(projectRenderer).FindProperty("postProcessData").objectReferenceValue;
        rd.ApplyModifiedPropertiesWithoutUndo();
        var pipeline=AssetDatabase.LoadAssetAtPath<UniversalRenderPipelineAsset>(Folder+"/ProbeWeb.asset");if(pipeline==null){pipeline=UniversalRenderPipelineAsset.Create(renderer);AssetDatabase.CreateAsset(pipeline,Folder+"/ProbeWeb.asset");}
        var so=new SerializedObject(pipeline);
        foreach(var name in new[]{"m_RequireDepthTexture","m_RequireOpaqueTexture","m_SupportsHDR","m_AdditionalLightShadowsSupported","m_ReflectionProbeBlending","m_ReflectionProbeBoxProjection","m_ReflectionProbeAtlas","m_SupportsLightCookies","m_SupportsLightLayers","m_SupportDataDrivenLensFlare","m_SupportScreenSpaceLensFlare"}){var p=so.FindProperty(name);if(p!=null)p.boolValue=false;}
        foreach(var name in new[]{"m_GPUResidentDrawerMode","m_AdditionalLightsRenderingMode"}){var p=so.FindProperty(name);if(p!=null)p.intValue=0;}
        // Main-light shadows only: the earlier WebGL failure came from the
        // additional-light shadow sampler, which stays disabled above.
        foreach(var name in new[]{"m_MainLightShadowsSupported","m_AnyShadowsSupported","m_SoftShadowsSupported"}){var p=so.FindProperty(name);if(p!=null)p.boolValue=true;}
        so.FindProperty("m_MainLightShadowmapResolution").intValue=2048;so.FindProperty("m_ShadowDistance").floatValue=110;so.FindProperty("m_ShadowCascadeCount").intValue=1;
        var softQuality=so.FindProperty("m_SoftShadowQuality");if(softQuality!=null)softQuality.intValue=2;
        so.FindProperty("m_MSAA").intValue=4;so.FindProperty("m_RenderScale").floatValue=1;so.ApplyModifiedPropertiesWithoutUndo();EditorUtility.SetDirty(pipeline);EditorUtility.SetDirty(renderer);AssetDatabase.SaveAssets();
        GraphicsSettings.defaultRenderPipeline=pipeline;for(int i=0;i<previous.pipelines.Length;i++){QualitySettings.SetQualityLevel(i,false);QualitySettings.renderPipeline=pipeline;}QualitySettings.SetQualityLevel(previous.quality,false);
        WriteEvidence(Path.Combine(repository,"prototypes/match-engine-unity/pipeline-validation.json"),JsonUtility.ToJson(pipeline,true));return AssetDatabase.GetAssetPath(pipeline);
    }
    // A watcher of the working tree can briefly map the evidence file
    // (Win32 1224); at most 40 bounded attempts (10 s), then the error stands.
    static void WriteEvidence(string path,string text){
        for(int attempt=1;;attempt++){try{File.WriteAllText(path,text);return;}catch(IOException)when(attempt<40){System.Threading.Thread.Sleep(250);}}
    }
    public static void Restore(string repository){var p=JsonUtility.FromJson<Previous>(File.ReadAllText(Path.Combine(repository,"prototypes/match-engine-unity/pipeline-settings-before.json")));GraphicsSettings.defaultRenderPipeline=AssetDatabase.LoadAssetAtPath<RenderPipelineAsset>(p.graphics);for(int i=0;i<p.pipelines.Length;i++){QualitySettings.SetQualityLevel(i,false);QualitySettings.renderPipeline=AssetDatabase.LoadAssetAtPath<RenderPipelineAsset>(p.pipelines[i]);}QualitySettings.SetQualityLevel(p.quality,false);AssetDatabase.SaveAssets();}
}
#endif

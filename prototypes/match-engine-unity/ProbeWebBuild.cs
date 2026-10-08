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
        var rd=new SerializedObject(renderer);rd.FindProperty("m_RenderingMode").intValue=0;rd.ApplyModifiedPropertiesWithoutUndo();
        var pipeline=AssetDatabase.LoadAssetAtPath<UniversalRenderPipelineAsset>(Folder+"/ProbeWeb.asset");if(pipeline==null){pipeline=UniversalRenderPipelineAsset.Create(renderer);AssetDatabase.CreateAsset(pipeline,Folder+"/ProbeWeb.asset");}
        var so=new SerializedObject(pipeline);
        foreach(var name in new[]{"m_RequireDepthTexture","m_RequireOpaqueTexture","m_SupportsHDR","m_MainLightShadowsSupported","m_AdditionalLightShadowsSupported","m_AnyShadowsSupported","m_SoftShadowsSupported","m_ReflectionProbeBlending","m_ReflectionProbeBoxProjection","m_ReflectionProbeAtlas","m_SupportsLightCookies","m_SupportsLightLayers","m_SupportDataDrivenLensFlare","m_SupportScreenSpaceLensFlare"}){var p=so.FindProperty(name);if(p!=null)p.boolValue=false;}
        foreach(var name in new[]{"m_GPUResidentDrawerMode","m_AdditionalLightsRenderingMode"}){var p=so.FindProperty(name);if(p!=null)p.intValue=0;}
        so.FindProperty("m_MSAA").intValue=1;so.FindProperty("m_RenderScale").floatValue=1;so.ApplyModifiedPropertiesWithoutUndo();EditorUtility.SetDirty(pipeline);EditorUtility.SetDirty(renderer);AssetDatabase.SaveAssets();
        GraphicsSettings.defaultRenderPipeline=pipeline;for(int i=0;i<previous.pipelines.Length;i++){QualitySettings.SetQualityLevel(i,false);QualitySettings.renderPipeline=pipeline;}QualitySettings.SetQualityLevel(previous.quality,false);
        File.WriteAllText(Path.Combine(repository,"prototypes/match-engine-unity/pipeline-validation.json"),JsonUtility.ToJson(pipeline,true));return AssetDatabase.GetAssetPath(pipeline);
    }
    public static void Restore(string repository){var p=JsonUtility.FromJson<Previous>(File.ReadAllText(Path.Combine(repository,"prototypes/match-engine-unity/pipeline-settings-before.json")));GraphicsSettings.defaultRenderPipeline=AssetDatabase.LoadAssetAtPath<RenderPipelineAsset>(p.graphics);for(int i=0;i<p.pipelines.Length;i++){QualitySettings.SetQualityLevel(i,false);QualitySettings.renderPipeline=AssetDatabase.LoadAssetAtPath<RenderPipelineAsset>(p.pipelines[i]);}QualitySettings.SetQualityLevel(p.quality,false);AssetDatabase.SaveAssets();}
}
#endif

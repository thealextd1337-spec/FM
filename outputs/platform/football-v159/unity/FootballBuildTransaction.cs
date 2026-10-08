#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEditor;
using UnityEditor.Build.Reporting;

// Ephemeral Editor helper: does not enter Assets or the shipped player. One
// reviewed transaction owns temporary build settings and restores them in finally.
public static class FootballBuildTransaction159 {
    const string ExpectedAssets="G:/unity/My project/Assets";
    const string Repository="F:/Neuer Ordner (2)/ChatGPT/Fussballmanager";
    const string Evidence=Repository+"/outputs/platform/football-v159/unity";
    [Serializable] public class Report {
        public string status,buildId,method,result,platform,outputPath,buildStartedAt,buildEndedAt,sourceId,error;
        public ulong totalSizeBytes;public double buildTimeMs;public int totalWarnings,totalErrors;
        public FileInfo[] files;public Step[] buildSteps;
    }
    [Serializable] public class FileInfo {public string path,role;public ulong sizeBytes;}
    [Serializable] public class Message {public string type,message;}
    [Serializable] public class Step {public string name;public double durationMs;public Message[] messages;}
    static void Save(Report report,string file){File.WriteAllText(Path.Combine(Evidence,file),JsonUtility.ToJson(report,true));}
    public static string Start(){
        if(Application.dataPath!=ExpectedAssets||EditorApplication.isPlaying||EditorApplication.isCompiling||EditorUtility.scriptCompilationFailed||BuildPipeline.isBuildingPlayer)throw new Exception("Unexpected project or unsafe Editor state");
        var queued=new Report{status="queued",method="Ephemeral MCP Editor build transaction with guaranteed settings restoration"};Save(queued,"build-transaction-state.json");
        EditorApplication.update+=OnUpdate;
        return "Queued one build transaction; inspect build-transaction-state.json and build-report.json after completion";
    }
    static void OnUpdate(){EditorApplication.update-=OnUpdate;Run();}
    static void Run(){
        var report=new Report{status="building",buildId="transaction_"+Guid.NewGuid().ToString("N"),method="Ephemeral MCP Editor callback; one try/finally restores graphics, all quality pipelines, compression, background, target and group",outputPath=Repository+"/outputs/platform/unity-web",platform="WebGL",sourceId=Doppel6.Probe.ProbeBuildIdentity.SourceId};
        Save(report,"build-transaction-state.json");
        var quality=QualitySettings.GetQualityLevel();var graphics=AssetDatabase.GetAssetPath(GraphicsSettings.defaultRenderPipeline);var pipelines=new string[QualitySettings.names.Length];
        for(int i=0;i<pipelines.Length;i++){QualitySettings.SetQualityLevel(i,false);pipelines[i]=AssetDatabase.GetAssetPath(QualitySettings.renderPipeline);}QualitySettings.SetQualityLevel(quality,false);
        var compression=PlayerSettings.WebGL.compressionFormat;var background=PlayerSettings.runInBackground;var target=EditorUserBuildSettings.activeBuildTarget;var group=EditorUserBuildSettings.selectedBuildTargetGroup;
        try{
            if(Application.dataPath!=ExpectedAssets||EditorApplication.isPlaying||EditorApplication.isCompiling||BuildPipeline.isBuildingPlayer)throw new Exception("Editor state changed before the queued transaction");
            var pipeline=AssetDatabase.LoadAssetAtPath<RenderPipelineAsset>("Assets/Doppel6EngineProbe/Rendering/ProbeWeb.asset");if(pipeline==null)throw new Exception("Existing lean WebGL pipeline is missing");
            GraphicsSettings.defaultRenderPipeline=pipeline;for(int i=0;i<pipelines.Length;i++){QualitySettings.SetQualityLevel(i,false);QualitySettings.renderPipeline=pipeline;}QualitySettings.SetQualityLevel(quality,false);
            PlayerSettings.WebGL.compressionFormat=WebGLCompressionFormat.Disabled;PlayerSettings.runInBackground=true;
            var actual=BuildPipeline.BuildPlayer(new BuildPlayerOptions{scenes=new[]{"Assets/Doppel6EngineProbe/Probe.unity"},locationPathName=report.outputPath,target=BuildTarget.WebGL,options=BuildOptions.DetailedBuildReport});
            var summary=actual.summary;report.result=summary.result.ToString();report.totalSizeBytes=summary.totalSize;report.buildTimeMs=summary.totalTime.TotalMilliseconds;report.totalWarnings=summary.totalWarnings;report.totalErrors=summary.totalErrors;report.buildStartedAt=summary.buildStartedAt.ToUniversalTime().ToString("o");report.buildEndedAt=summary.buildEndedAt.ToUniversalTime().ToString("o");
            var files=new List<FileInfo>();foreach(var file in actual.GetFiles())files.Add(new FileInfo{path=file.path,role=file.role,sizeBytes=file.size});report.files=files.ToArray();
            var steps=new List<Step>();foreach(var step in actual.steps){var messages=new List<Message>();foreach(var message in step.messages)messages.Add(new Message{type=message.type.ToString(),message=message.content});steps.Add(new Step{name=step.name,durationMs=step.duration.TotalMilliseconds,messages=messages.ToArray()});}report.buildSteps=steps.ToArray();
        }catch(Exception error){report.result="Exception";report.error=error.ToString();}
        finally{
            PlayerSettings.WebGL.compressionFormat=compression;PlayerSettings.runInBackground=background;
            if(EditorUserBuildSettings.activeBuildTarget!=target&&!EditorUserBuildSettings.SwitchActiveBuildTarget(group,target)){report.result="RestorationFailed";report.error="Failed to restore original build target";}
            EditorUserBuildSettings.selectedBuildTargetGroup=group;
            // Build-target imports can invalidate UnityEngine.Object references.
            // Restore persistent assets by their captured path after the switch.
            GraphicsSettings.defaultRenderPipeline=string.IsNullOrEmpty(graphics)?null:AssetDatabase.LoadAssetAtPath<RenderPipelineAsset>(graphics);for(int i=0;i<pipelines.Length;i++){QualitySettings.SetQualityLevel(i,false);QualitySettings.renderPipeline=string.IsNullOrEmpty(pipelines[i])?null:AssetDatabase.LoadAssetAtPath<RenderPipelineAsset>(pipelines[i]);}QualitySettings.SetQualityLevel(quality,false);
            report.status="completed";Save(report,"build-report.json");Save(report,"build-transaction-state.json");
        }
    }
}
#endif


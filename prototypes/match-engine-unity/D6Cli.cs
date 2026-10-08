#if UNITY_EDITOR
using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;
// Parameterless entry points for Unity's -batchmode -executeMethod.
// The repository path comes from "-d6repo <path>" on the command line.
public static class D6Cli {
    const string Scene="Assets/Doppel6EngineProbe/Probe.unity";
    static string Arg(string name,string fallback=null){var a=Environment.GetCommandLineArgs();for(int i=0;i<a.Length-1;i++)if(a[i]==name)return a[i+1];return fallback;}
    static string Repo(){var r=Arg("-d6repo");if(string.IsNullOrEmpty(r)||!Directory.Exists(r))throw new ArgumentException("-d6repo <repository path> is required");return r;}
    static void Done(bool ok,string message){Debug.Log("[D6Cli] "+(ok?"OK ":"FAILED ")+message);EditorApplication.Exit(ok?0:1);}

    // Compile check only: reaching this method means all scripts compiled.
    public static void Ping(){Done(true,"scripts compiled, Unity "+Application.unityVersion);}

    public static void Tests(){
        try{
            var repo=Repo();
            // Batchmode starts without an open scene; some suites need the probe camera.
            UnityEditor.SceneManagement.EditorSceneManager.OpenScene(Scene);
            Debug.Log("[D6Cli] FootballTests: "+FootballTests.Run(repo));
            Debug.Log("[D6Cli] FootballLocomotionTests: "+FootballLocomotionTests.Run(repo));
            Debug.Log("[D6Cli] FootballMomentumTests: "+FootballMomentumTests.Run(repo));
            Debug.Log("[D6Cli] FootballActionTests: "+FootballActionTests.Run(repo));
            Debug.Log("[D6Cli] FootballMotionTests: "+FootballMotionTests.Run(repo));
            Debug.Log("[D6Cli] WorldViewTests: "+WorldViewTests.Run(repo));
            Done(true,"tests finished");
        }catch(Exception e){Debug.LogException(e);Done(false,e.Message);}
    }

    // WebGL build of the probe scene into outputs/platform/unity-web. Previous
    // build target, pipeline and player settings are restored afterwards.
    public static void WebBuild(){
        var target=EditorUserBuildSettings.activeBuildTarget;var group=EditorUserBuildSettings.selectedBuildTargetGroup;
        var compression=PlayerSettings.WebGL.compressionFormat;var width=PlayerSettings.defaultWebScreenWidth;var height=PlayerSettings.defaultWebScreenHeight;var background=PlayerSettings.runInBackground;
        string repo=null;bool ok=false;string message;
        try{
            repo=Repo();
            if(!File.Exists(Scene))throw new FileNotFoundException(Scene);
            ProbeWebBuild.Configure(repo);
            PlayerSettings.WebGL.compressionFormat=WebGLCompressionFormat.Disabled;
            PlayerSettings.defaultWebScreenWidth=1280;PlayerSettings.defaultWebScreenHeight=720;PlayerSettings.runInBackground=true;
            var output=Path.Combine(repo,"outputs/platform/unity-web");
            var report=BuildPipeline.BuildPlayer(new BuildPlayerOptions{scenes=new[]{Scene},locationPathName=output,target=BuildTarget.WebGL,options=BuildOptions.None});
            var s=report.summary;ok=s.result==BuildResult.Succeeded;
            message=$"{s.result} {s.totalSize} bytes, {s.totalTime.TotalSeconds:0.0}s, {s.totalErrors} errors, {s.totalWarnings} warnings -> {output}";
        }catch(Exception e){Debug.LogException(e);message=e.Message;}
        finally{
            try{
                if(repo!=null)ProbeWebBuild.Restore(repo);
                PlayerSettings.WebGL.compressionFormat=compression;PlayerSettings.defaultWebScreenWidth=width;PlayerSettings.defaultWebScreenHeight=height;PlayerSettings.runInBackground=background;
                if(EditorUserBuildSettings.activeBuildTarget!=target)EditorUserBuildSettings.SwitchActiveBuildTarget(group,target);
                AssetDatabase.SaveAssets();
            }catch(Exception e){Debug.LogException(e);}
        }
        Done(ok,message);
    }
}
#endif

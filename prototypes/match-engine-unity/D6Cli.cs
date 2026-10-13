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

    public static void Presentation(){
        try{Done(true,Doppel6.Probe.WorldPresentationTests.Run(Repo(),Arg("-d6output")));}catch(Exception e){Debug.LogException(e);Done(false,e.Message);}
    }

    public static void NetTests(){
        try{Done(true,Doppel6.Probe.WorldNetTests.Run(Repo(),Arg("-d6output")));}catch(Exception e){Debug.LogException(e);Done(false,e.Message);}
    }

    public static void LightingTests(){
        try{UnityEditor.SceneManagement.EditorSceneManager.OpenScene(Scene);Done(true,Doppel6.Probe.MatchLightingTests.Run(Repo(),Arg("-d6output")));}catch(Exception e){Debug.LogException(e);Done(false,e.Message);}
    }

    public static void MatchLighting(){
        string repo=null,message=null;bool ok=false;
        try{repo=Repo();if(SystemInfo.graphicsDeviceType==UnityEngine.Rendering.GraphicsDeviceType.Null)throw new InvalidOperationException("Match lighting evidence needs a graphics device");ProbeWebBuild.Configure(repo);UnityEditor.SceneManagement.EditorSceneManager.OpenScene(Scene);message=Doppel6.Probe.MatchLightingTests.Evidence(repo,Arg("-d6output"));ok=true;}catch(Exception e){Debug.LogException(e);message=e.Message;}
        finally{if(repo!=null)ProbeWebBuild.Restore(repo);}
        Done(ok,message);
    }

    public static void Tests(){
        try{
            var repo=Repo();var output=Arg("-d6output");if(output!=null)Directory.CreateDirectory(Path.Combine(repo,output));
            // Batchmode starts without an open scene; some suites need the probe camera.
            UnityEditor.SceneManagement.EditorSceneManager.OpenScene(Scene);
            Debug.Log("[D6Cli] FootballTests: "+FootballTests.Run(repo,output));
            Debug.Log("[D6Cli] FootballLocomotionTests: "+FootballLocomotionTests.Run(repo,output));
            Debug.Log("[D6Cli] FootballMomentumTests: "+FootballMomentumTests.Run(repo,output));
            Debug.Log("[D6Cli] FootballActionTests: "+FootballActionTests.Run(repo,output));
            Debug.Log("[D6Cli] FootballMotionTests: "+FootballMotionTests.Run(repo,"final",output));
            Debug.Log("[D6Cli] WorldViewTests: "+WorldViewTests.Run(repo,output));
            Debug.Log("[D6Cli] WorldPresentationTests: "+Doppel6.Probe.WorldPresentationTests.Run(repo,output));
            Debug.Log("[D6Cli] WorldNetTests: "+Doppel6.Probe.WorldNetTests.Run(repo,output));
            Debug.Log("[D6Cli] MatchLightingTests: "+Doppel6.Probe.MatchLightingTests.Run(repo,output));
            Debug.Log("[D6Cli] FootballGaitTests: "+FootballGaitTests.Run(repo,output));
            Debug.Log("[D6Cli] ClubStadiumProfilesTests: "+Doppel6.Probe.ClubStadiumProfilesTests.Run(repo,output));
            Debug.Log("[D6Cli] StadiumArchitectureTests: "+StadiumArchitectureTests.Run(repo,output));
            Debug.Log("[D6Cli] FootballDuelTests: "+FootballDuelTests.Run(repo,output));
            Debug.Log("[D6Cli] FootballIterationTests: "+FootballIterationTests.Run(repo,output));
            Debug.Log("[D6Cli] FootballKeeperTests: "+FootballKeeperTests.Run(repo,output));
            Debug.Log("[D6Cli] FootballPresentation119Tests: "+FootballPresentation119Tests.Run(repo,output));
            // Natural-motion quality gates on the actual rig (controlled fixtures at 30/60/120 Hz and captured native pictures; no rendering).
            Debug.Log("[D6Cli] NaturalMotionGates: "+NaturalMotionDiagnostics.Run(repo,output,"natural-motion-gates",false));
            Done(true,"tests finished");
        }catch(Exception e){Debug.LogException(e);Done(false,e.Message);}
    }

    // Rest-pose regions of the club-world player mesh.
    public static void KitRegions(){
        try{Done(true,WorldKitDiagnostics.Run(Repo()));}catch(Exception e){Debug.LogException(e);Done(false,e.Message);}
    }

    // Assigns the existing presentation clips in the probe scene.
    public static void Setup(){
        try{Done(true,FootballSetup.ConfigurePresentation());}catch(Exception e){Debug.LogException(e);Done(false,e.Message);}
    }

    // Measures footfall, ground speed and travel of the existing authored clips.
    public static void Clips(){
        try{var repo=Repo();Done(true,FootballClipDiagnostics.Run(repo));}catch(Exception e){Debug.LogException(e);Done(false,e.Message);}
    }

    // Actual world renderer evidence; use a graphics device, never -nographics.
    public static void Evidence(){
        string repo=null,message=null;bool ok=false;
        try{repo=Repo();ProbeWebBuild.Configure(repo);UnityEditor.SceneManagement.EditorSceneManager.OpenScene(Scene);message=UnityEvidenceDiagnostics.Run(repo);ok=true;}catch(Exception e){Debug.LogException(e);message=e.Message;}
        finally{if(repo!=null)ProbeWebBuild.Restore(repo);}
        Done(ok,message);
    }
    public static void DuelTests(){
        try{UnityEditor.SceneManagement.EditorSceneManager.OpenScene(Scene);Done(true,FootballDuelTests.Run(Repo(),Arg("-d6output")));}catch(Exception e){Debug.LogException(e);Done(false,e.Message);}
    }
    // Iteration 117: aerial/throw/kick/keeper poses, ball marker and optional picture fields.
    public static void IterationTests(){
        try{UnityEditor.SceneManagement.EditorSceneManager.OpenScene(Scene);Done(true,FootballIterationTests.Run(Repo()));}catch(Exception e){Debug.LogException(e);Done(false,e.Message);}
    }
    // Iteration 117 renders (club identity, pose strips, measured ball marker); needs a graphics device.
    public static void IterationEvidence(){
        string repo=null,message=null;bool ok=false;
        try{repo=Repo();ProbeWebBuild.Configure(repo);UnityEditor.SceneManagement.EditorSceneManager.OpenScene(Scene);message=IterationEvidenceDiagnostics.Run(repo);ok=true;}catch(Exception e){Debug.LogException(e);message=e.Message;}
        finally{if(repo!=null)ProbeWebBuild.Restore(repo);}
        Done(ok,message);
    }
    // Keeper iteration: actual native keeper picture JSON through selector and rig.
    public static void KeeperTests(){
        try{UnityEditor.SceneManagement.EditorSceneManager.OpenScene(Scene);Done(true,FootballKeeperTests.Run(Repo()));}catch(Exception e){Debug.LogException(e);Done(false,e.Message);}
    }
    // Keeper iteration renders from actual captured native pictures; needs a graphics device.
    // -d6output <folder> [-d6fixture <repository-relative keeper fixture json>].
    public static void KeeperEvidence(){
        string repo=null,message=null;bool ok=false;
        try{repo=Repo();ProbeWebBuild.Configure(repo);UnityEditor.SceneManagement.EditorSceneManager.OpenScene(Scene);message=KeeperEvidenceDiagnostics.Run(repo,Arg("-d6output"),Arg("-d6fixture"));ok=true;}catch(Exception e){Debug.LogException(e);message=e.Message;}
        finally{if(repo!=null)ProbeWebBuild.Restore(repo);}
        Done(ok,message);
    }
    public static void OffsideTests(){try{UnityEditor.SceneManagement.EditorSceneManager.OpenScene(Scene);Done(true,"checks="+OffsidePresentation119Tests.Run(Repo(),false,Arg("-d6output")).Length);}catch(Exception e){Debug.LogException(e);Done(false,e.Message);}}
    public static void OffsideEvidence(){
        string repo=null;bool ok=false;string message=null;
        try{repo=Repo();ProbeWebBuild.Configure(repo);UnityEditor.SceneManagement.EditorSceneManager.OpenScene(Scene);message="checks="+OffsidePresentation119Tests.Run(repo,true,Arg("-d6output")).Length;ok=true;}catch(Exception e){Debug.LogException(e);message=e.Message;}finally{if(repo!=null)ProbeWebBuild.Restore(repo);}
        Done(ok,message);
    }
    // Natural-motion evidence on the actual rig (controlled and captured native
    // pictures): -d6output <folder> -d6label <name> [-d6gates report] [-d6only <case regex>]. Renders
    // images and GIF recordings only with a graphics device; quality gates fail
    // the run unless -d6gates report.
    public static void NaturalMotion(){
        string repo=null,message=null;bool ok=false,render=SystemInfo.graphicsDeviceType!=UnityEngine.Rendering.GraphicsDeviceType.Null;
        try{repo=Repo();if(render)ProbeWebBuild.Configure(repo);UnityEditor.SceneManagement.EditorSceneManager.OpenScene(Scene);message=NaturalMotionDiagnostics.Run(repo,Arg("-d6output"),Arg("-d6label","candidate"),render,Arg("-d6gates","enforce")!="report",Arg("-d6only"));ok=true;}catch(Exception e){Debug.LogException(e);message=e.Message;}
        finally{if(repo!=null&&render)ProbeWebBuild.Restore(repo);}
        Done(ok,message);
    }
    // Writes prototypes/match-engine-unity/FootballSoleContour.cs from the rig's boots.
    public static void SoleContour(){
        try{Done(true,FootballSetup.GenerateSoleContour(Repo()));}catch(Exception e){Debug.LogException(e);Done(false,e.Message);}
    }
    // Small mobile views: four home stadium types, five match cameras,
    // standard/reduced at 844x390, 931x448 and 1280x720 (-d6output <folder>).
    public static void SmallViews(){
        string repo=null,message=null;bool ok=false,render=SystemInfo.graphicsDeviceType!=UnityEngine.Rendering.GraphicsDeviceType.Null;
        try{repo=Repo();if(render)ProbeWebBuild.Configure(repo);UnityEditor.SceneManagement.EditorSceneManager.OpenScene(Scene);message=SmallViewDiagnostics.Run(repo,Arg("-d6output"),render);ok=true;}catch(Exception e){Debug.LogException(e);message=e.Message;}
        finally{if(repo!=null&&render)ProbeWebBuild.Restore(repo);}
        Done(ok,message);
    }
    // Low-Poly style evidence: identical fixture, layout and cameras for a
    // baseline and a candidate (-d6output <folder> -d6label <name> [-d6compare <folder of another label>]
    // [-d6style on|off] [-d6facet 0..1: derivative facet normals, the intermediate on an unchanged mesh]).
    public static void LowPoly(){
        string repo=null,message=null;bool ok=false;
        try{repo=Repo();if(SystemInfo.graphicsDeviceType==UnityEngine.Rendering.GraphicsDeviceType.Null)throw new InvalidOperationException("Low-Poly evidence needs a graphics device");
            ProbeWebBuild.Configure(repo);UnityEditor.SceneManagement.EditorSceneManager.OpenScene(Scene);Doppel6.Probe.ProbeBridge.LowPolyStyle=Arg("-d6style","on")!="off";Shader.SetGlobalFloat("_D6Facet",float.Parse(Arg("-d6facet","0"),System.Globalization.CultureInfo.InvariantCulture));
            message=LowPolyDiagnostics.Run(repo,Arg("-d6output"),Arg("-d6label","candidate"),Arg("-d6compare"))+" style="+Doppel6.Probe.ProbeBridge.LowPolyStyle+" facet="+Shader.GetGlobalFloat("_D6Facet");ok=true;}catch(Exception e){Debug.LogException(e);message=e.Message;}
        finally{Shader.SetGlobalFloat("_D6Facet",0);Doppel6.Probe.ProbeBridge.LowPolyStyle=true;if(repo!=null)ProbeWebBuild.Restore(repo);}
        Done(ok,message);
    }
    // Builds WorldPlayerLowPoly-<version>.asset from the installed low-poly FBX
    // and assigns it to the probe scene (LowPolySetup).
    public static void LowPolyMesh(){
        try{var repo=Repo();var built=LowPolySetup.Build(repo);Done(true,built+"; "+LowPolySetup.Assign("lowpoly"));}catch(Exception e){Debug.LogException(e);Done(false,e.Message);}
    }
    // Hidden ground skin of the low-poly match mesh (LowPolyGroundDiagnostics; the
    // probe scene must show the low-poly mesh): -d6output <folder>. No rendering.
    public static void LowPolyGround(){
        try{UnityEditor.SceneManagement.EditorSceneManager.OpenScene(Scene);Done(true,LowPolyGroundDiagnostics.Run(Repo(),Arg("-d6output")));}catch(Exception e){Debug.LogException(e);Done(false,e.Message);}
    }
    // Player mesh of the probe scene and WebGL build: -d6mesh lowpoly|original.
    public static void MatchMesh(){
        try{Done(true,LowPolySetup.Assign(Arg("-d6mesh","lowpoly")));}catch(Exception e){Debug.LogException(e);Done(false,e.Message);}
    }
    public static void TeamRings(){
        try{UnityEditor.SceneManagement.EditorSceneManager.OpenScene(Scene);Done(true,TeamGroundRingTests.Run(Repo()));}catch(Exception e){Debug.LogException(e);Done(false,e.Message);}
    }

    // WebGL build of the probe scene into outputs/platform/unity-web. Previous
    // build target, pipeline and player settings are restored afterwards.
    public static void WebBuild(){
        var target=EditorUserBuildSettings.activeBuildTarget;var group=EditorUserBuildSettings.selectedBuildTargetGroup;
        var compression=PlayerSettings.WebGL.compressionFormat;var width=PlayerSettings.defaultWebScreenWidth;var height=PlayerSettings.defaultWebScreenHeight;var background=PlayerSettings.runInBackground;
        string repo=null;bool ok=false;string message;
        try{
            var repository=Repo();
            if(!File.Exists(Scene))throw new FileNotFoundException(Scene);
            // Before any setting changes (repo stays null, so nothing is restored): the saved scene ships its mesh references.
            Debug.Log("[D6Cli] WebBuild preflight: "+WebBuildPreflight(Scene));
            repo=repository;ProbeWebBuild.Configure(repo);
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
    // The player meshes of the scene file the build ships (opened from disk). A replacement match
    // mesh needs WorldPlayer.asset as its ground mesh on the same rig, also as a saved dependency of
    // the scene (otherwise the build measures the ground on the replacement: the d8ae8785 path);
    // the release mesh needs no ground mesh (or itself). Throws before any build work.
    public static string WebBuildPreflight(string scene){
        var opened=UnityEditor.SceneManagement.EditorSceneManager.OpenScene(scene,UnityEditor.SceneManagement.OpenSceneMode.Single);
        Doppel6.Probe.ProbeBridge bridge=null;foreach(var root in opened.GetRootGameObjects()){bridge=root.GetComponentInChildren<Doppel6.Probe.ProbeBridge>(true);if(bridge!=null)break;}
        if(bridge==null)throw new InvalidOperationException("ProbeBridge is missing in "+scene);
        return GroundPreflight(bridge,scene);
    }
    public static string GroundPreflight(Doppel6.Probe.ProbeBridge bridge,string scene){
        var original=AssetDatabase.LoadAssetAtPath<Mesh>(LowPolySetup.Original)??throw new FileNotFoundException(LowPolySetup.Original);
        var match=bridge.matchPlayerMesh;var ground=bridge.groundPlayerMesh;
        if(match==null)throw new InvalidOperationException("Build preflight: "+scene+" has no match player mesh");
        if(match==original){
            if(ground!=null&&ground!=original)throw new InvalidOperationException("Build preflight: release match mesh with ground mesh "+ground.name+" (expected none or "+LowPolySetup.Original+")");
            return "match mesh "+match.name+" (release), ground "+(ground==null?"none":ground.name);
        }
        if(ground==null)throw new InvalidOperationException("Build preflight: match mesh "+match.name+" has no ground mesh; the build would measure the ground on the replacement (run D6Cli.MatchMesh -d6mesh lowpoly)");
        if(ground!=original)throw new InvalidOperationException("Build preflight: ground mesh "+ground.name+" ("+AssetDatabase.GetAssetPath(ground)+") is not "+LowPolySetup.Original);
        var a=match.bindposes;var b=ground.bindposes;bool same=a.Length==b.Length&&a.Length>0;for(int i=0;same&&i<a.Length;i++)same=a[i]==b[i];
        if(!same)throw new InvalidOperationException("Build preflight: ground mesh "+ground.name+" is not on the rig of "+match.name);
        var saved=AssetDatabase.GetDependencies(scene,true);
        foreach(var need in new[]{LowPolySetup.Original,AssetDatabase.GetAssetPath(match)})if(Array.IndexOf(saved,need)<0)throw new InvalidOperationException("Build preflight: the saved scene "+scene+" does not reference "+need);
        return "match mesh "+match.name+", ground "+ground.name+" ("+ground.vertexCount+" vertices, "+b.Length+" bind poses), both saved scene dependencies";
    }
}
#endif

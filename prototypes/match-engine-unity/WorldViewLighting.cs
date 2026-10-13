using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
namespace Doppel6.Probe {
public partial class ProbeBridge {
    class LightingDefaults {public AmbientMode mode;public Color flat;public float intensity;public SphericalHarmonicsL2 probe;public Quaternion sunRotation;public Color sunColor,background;public float sunIntensity,shadowStrength,far;public LightShadows shadows;public bool msaa;public int shadowResolution,pipelineMsaa;public float shadowDistance;}

    LightingDefaults lightingDefaults;Light sun;Volume matchVolume,replayVolume;VolumeProfile matchProfile,replayProfile;Bloom matchBloom;

    public bool ReducedQuality {get;private set;}

    public static bool LowPolyStyle=true;

    Light FindSun(){if(sun!=null)return sun;foreach(var light in FindObjectsByType<Light>())if(light.type==LightType.Directional){sun=light;break;}return sun;}

    void ApplyMatchLighting(){
        var light=FindSun();var camera=Camera.main;var urp=GraphicsSettings.currentRenderPipeline as UniversalRenderPipelineAsset;
        ReducedQuality=worldView?.Config.quality=="reduced"||string.IsNullOrEmpty(worldView?.Config.quality)&&Application.isMobilePlatform;
        if(lightingDefaults==null)lightingDefaults=new LightingDefaults{shadowResolution=urp!=null?urp.mainLightShadowmapResolution:0,pipelineMsaa=urp!=null?urp.msaaSampleCount:1,shadowDistance=urp!=null?urp.shadowDistance:0,mode=RenderSettings.ambientMode,flat=RenderSettings.ambientLight,intensity=RenderSettings.ambientIntensity,probe=RenderSettings.ambientProbe,sunRotation=light!=null?light.transform.rotation:Quaternion.identity,sunColor=light!=null?light.color:Color.white,sunIntensity=light!=null?light.intensity:1,shadowStrength=light!=null?light.shadowStrength:1,shadows=light!=null?light.shadows:LightShadows.None,background=camera.backgroundColor,msaa=camera.allowMSAA,far=camera.farClipPlane};
        Shader.SetGlobalFloat("_D6LowPoly",LowPolyStyle?1:0);
        // Evening floodlight: one high key light with soft real shadows, a cool
        // sky fill and a darker turf bounce. Colours are linear.
        var sky=new Color(.30f,.36f,.47f);var horizon=new Color(.20f,.24f,.27f);var ground=new Color(.07f,.11f,.07f);
        var sh=new SphericalHarmonicsL2();sh.AddAmbientLight(horizon);sh.AddDirectionalLight(Vector3.up,sky-horizon,.9f);sh.AddDirectionalLight(Vector3.down,ground,.6f);
        RenderSettings.ambientMode=AmbientMode.Custom;RenderSettings.ambientProbe=sh;RenderSettings.ambientIntensity=1;
        if(light!=null){light.transform.rotation=Quaternion.Euler(54,-32,0);light.color=new Color(1f,.96f,.90f);light.intensity=1.45f;light.shadows=ReducedQuality?LightShadows.Hard:LightShadows.Soft;light.shadowStrength=.78f;light.shadowBias=.04f;light.shadowNormalBias=.35f;}
        // The horizon dome of the club surroundings sits 280 m out.
        camera.backgroundColor=new Color(.05f,.09f,.14f);camera.allowMSAA=!ReducedQuality;camera.farClipPlane=Mathf.Max(lightingDefaults.far,700);
        if(urp!=null){urp.mainLightShadowmapResolution=ReducedQuality?1024:lightingDefaults.shadowResolution;urp.shadowDistance=ReducedQuality?70:lightingDefaults.shadowDistance;urp.msaaSampleCount=ReducedQuality?1:lightingDefaults.pipelineMsaa;}
        var data=camera.GetUniversalAdditionalCameraData();if(data!=null){data.renderPostProcessing=true;data.renderShadows=true;}
        if(matchVolume==null){
            matchProfile=ScriptableObject.CreateInstance<VolumeProfile>();
            var grade=matchProfile.Add<ColorAdjustments>(true);grade.contrast.Override(6);grade.saturation.Override(-6);grade.postExposure.Override(.1f);
            var vignette=matchProfile.Add<Vignette>(true);vignette.intensity.Override(.2f);vignette.smoothness.Override(.5f);
            var bloom=matchProfile.Add<Bloom>(true);bloom.threshold.Override(.93f);bloom.intensity.Override(.35f);bloom.scatter.Override(.6f);matchBloom=bloom;
            var go=new GameObject("D6 match grading");go.transform.SetParent(transform,false);matchVolume=go.AddComponent<Volume>();matchVolume.isGlobal=true;matchVolume.priority=10;matchVolume.sharedProfile=matchProfile;
        }
        matchVolume.enabled=true;if(matchBloom!=null)matchBloom.active=!ReducedQuality;
        if(replayVolume==null){
            // Review and goal replays read as recorded footage: cooler, calmer, framed.
            // Only mildly desaturated: stronger values merged similar kits (violet/white).
            replayProfile=ScriptableObject.CreateInstance<VolumeProfile>();
            var grade=replayProfile.Add<ColorAdjustments>(true);grade.saturation.Override(-10);grade.contrast.Override(8);grade.colorFilter.Override(new Color(.93f,.97f,1f));
            var vignette=replayProfile.Add<Vignette>(true);vignette.intensity.Override(.36f);vignette.smoothness.Override(.42f);
            var go=new GameObject("D6 replay grading");go.transform.SetParent(transform,false);replayVolume=go.AddComponent<Volume>();replayVolume.isGlobal=true;replayVolume.priority=11;replayVolume.sharedProfile=replayProfile;
        }
        replayVolume.enabled=false;
    }

    public bool ReplayGraded=>replayVolume!=null&&replayVolume.enabled;

    void SetReplayGrade(bool replay){if(replayVolume!=null&&replayVolume.enabled!=replay)replayVolume.enabled=replay;}

    void RestoreProbeLighting(){
        Shader.SetGlobalFloat("_D6LowPoly",0);
        if(matchVolume!=null)matchVolume.enabled=false;if(replayVolume!=null)replayVolume.enabled=false;if(lightingDefaults==null)return;var d=lightingDefaults;var light=FindSun();var camera=Camera.main;
        if(GraphicsSettings.currentRenderPipeline is UniversalRenderPipelineAsset urp&&d.shadowResolution>0){urp.mainLightShadowmapResolution=d.shadowResolution;urp.shadowDistance=d.shadowDistance;urp.msaaSampleCount=d.pipelineMsaa;}
        RenderSettings.ambientMode=d.mode;RenderSettings.ambientLight=d.flat;RenderSettings.ambientIntensity=d.intensity;RenderSettings.ambientProbe=d.probe;
        if(light!=null){light.transform.rotation=d.sunRotation;light.color=d.sunColor;light.intensity=d.sunIntensity;light.shadows=d.shadows;light.shadowStrength=d.shadowStrength;}
        if(camera!=null){camera.backgroundColor=d.background;camera.allowMSAA=d.msaa;camera.farClipPlane=d.far;var data=camera.GetUniversalAdditionalCameraData();if(data!=null)data.renderPostProcessing=false;}
    }

    void ApplyMatchShadows(){
        var blob=new Material(Resources.Load<Shader>("D6Blob"));blob.SetFloat("_Strength",.42f);materials.Add(blob);
        foreach(var actor in actors)foreach(var r in actor.GetComponentsInChildren<Renderer>())if(!FootballGround.IsGroundSkin(r))r.shadowCastingMode=ShadowCastingMode.On;
        foreach(var ring in rings){ring.localScale=new Vector3(1.05f,.004f,1.05f);ring.GetComponent<Renderer>().sharedMaterial=blob;ring.GetComponent<Renderer>().shadowCastingMode=ShadowCastingMode.Off;}
        var ballBlob=new Material(blob);ballBlob.SetFloat("_Strength",.82f);materials.Add(ballBlob);worldBallShadowMaterial=ballBlob;ballShadow.localScale=new Vector3(.54f,.003f,.54f);ballShadow.GetComponent<Renderer>().sharedMaterial=ballBlob;
        ballView.GetComponent<Renderer>().shadowCastingMode=ShadowCastingMode.On;
        // Stands, roofs and masts stay out of the shadow map: their long
        // shadows would cross the pitch and hide the play.
        foreach(var r in world.GetComponentsInChildren<MeshRenderer>())if(r.sharedMaterial!=null&&r.sharedMaterial.shader==Resources.Load<Shader>("D6Env"))r.shadowCastingMode=ShadowCastingMode.Off;
        foreach(var r in world.GetComponentsInChildren<MeshRenderer>())if(r.name.StartsWith("Goal post")||r.name=="Crossbar")r.shadowCastingMode=ShadowCastingMode.On;
    }
}
}

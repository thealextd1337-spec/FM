using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
namespace Doppel6.Probe {
// Light of the match picture, chosen from the received fixture presentation
// (WorldConfig.presentation, d6-presentation-1). Legacy: no presentation, the
// Release 130 floodlight picture unchanged. Night: the same evening floodlight
// key with grounded, distance-faded shadows. Day: a high afternoon sun behind
// the broadcast side, lamps off. One shadow-casting key light in every look;
// display only and constant for a match, never time, randomness or session.
public enum MatchLook {Legacy,Night,Day}
public static class MatchLighting {
    // LightLook read by the stadium (sky dome, lamps, windows, crowd, banners).
    // Sky colours are sRGB like the generated stadium textures. lampEmission
    // scales the lamp emission (day: off). windowLit is the grain threshold of
    // the generated windows: a cell is lit when its stable grain in [0,1]
    // exceeds it (.45 = Release 130, 1 = none lit). crowdLight and bannerLight
    // scale the spectator and banner base colours (1 = Release 130): sunlit
    // stands would otherwise rise above the kits.
    public static readonly MatchLightLook NightLook=new MatchLightLook{light=MatchLight.Night,skyTop=new Color(.035f,.06f,.13f),skyHorizon=new Color(.30f,.29f,.35f),skyGround=new Color(.02f,.03f,.04f),lampEmission=1,windowLit=.45f,crowdLight=1,bannerLight=1};
    public static readonly MatchLightLook DayLook=new MatchLightLook{light=MatchLight.Day,skyTop=new Color(.29f,.50f,.80f),skyHorizon=new Color(.74f,.82f,.90f),skyGround=new Color(.44f,.50f,.47f),lampEmission=0,windowLit=1,crowdLight=.86f,bannerLight=.92f};
    // No or an empty schema (JsonUtility's default object) is the legacy picture.
    public static MatchLook Resolve(WorldPresentation display)=>string.IsNullOrEmpty(display?.schema)?MatchLook.Legacy:display.lighting=="day"?MatchLook.Day:MatchLook.Night;
    // Last share of the shadow distance over which shadows fade out.
    public const float ShadowFade=.12f;
    // Shadow reach of the received looks: the pitch corner farthest from the
    // default live camera (dist/world-pitch3d-v98.js follow at near 60 with
    // its touchline pan, scaled to the pitch as in world-unity-v151.js), plus
    // 5 m, at full strength before the fade. 68 x 44: 91.9 m; 81.6 x 52.8: 107.6 m.
    public static float ShadowDistance(float length,float width){float x=.8824f*length-17,z=width+14.85f;return Mathf.Clamp((Mathf.Sqrt(x*x+21*21+z*z)+5)/(1-ShadowFade),60,160);}
}
public partial class ProbeBridge {
    public MatchLightLook LightLook {get;private set;}
    public MatchLook Look {get;private set;}
    class LightingDefaults {public AmbientMode mode;public Color flat;public float intensity;public SphericalHarmonicsL2 probe;public Quaternion sunRotation;public Color sunColor,background;public float sunIntensity,shadowStrength,sunBias,sunNormalBias,far;public LightShadows shadows;public bool msaa,postProcessing,cameraShadows,lookKeyword;public float lowPoly;public int shadowResolution,pipelineMsaa,cascades;public float shadowDistance,cascadeBorder,depthBias,normalBias;public float[] look;}

    LightingDefaults lightingDefaults;Light sun;Volume matchVolume,replayVolume;VolumeProfile matchProfile,replayProfile;ColorAdjustments matchGrade;Vignette matchVignette;Bloom matchBloom;

    public bool ReducedQuality {get;private set;}

    public static bool LowPolyStyle=true;

    // Received looks: caster bias in shadow-map texels on the light and the
    // pipeline (URP's defaults; the goal frame stays free of acne). Figures
    // and the ball cast with a share of it (D6ShadowClipScaled); figures look
    // their own shadow up 12 cm off the surface, reduced quality skips that.
    const float ShadowBias=1,ShadowNormalBias=1,KitDepthBias=.3f,KitNormalBias=.12f,KitShadow=.3f,KitShadowOffset=.12f;
    // Global shader keyword of the received looks (D6Common.hlsl) and the
    // globals only it reads. Legacy fixtures and RestoreProbeLighting give
    // the globals back as they were found before the first match.
    public const string LookKeyword="_D6_LOOK";
    public static readonly string[] LookGlobals={"_D6Pool","_D6KitShadow","_D6KitShadowOffset","_D6KitDepthBias","_D6KitNormalBias","_D6KitKnee"};
    static void SetLookGlobals(float[] values){for(int i=0;i<LookGlobals.Length;i++)Shader.SetGlobalFloat(LookGlobals[i],values[i]);}
    // Shadow-only copy of the ball in the received looks (ApplyMatchShadows).
    public const string BallCasterName="Ball shadow caster";

    Light FindSun(){if(sun!=null)return sun;foreach(var light in FindObjectsByType<Light>())if(light.type==LightType.Directional){sun=light;break;}return sun;}

    void ApplyMatchLighting(){
        Look=MatchLighting.Resolve(worldView?.Config.presentation);LightLook=Look==MatchLook.Day?MatchLighting.DayLook:MatchLighting.NightLook;
        bool legacy=Look==MatchLook.Legacy,day=Look==MatchLook.Day;
        var light=FindSun();var camera=Camera.main;var urp=GraphicsSettings.currentRenderPipeline as UniversalRenderPipelineAsset;var data=camera.GetUniversalAdditionalCameraData();
        ReducedQuality=worldView?.Config.quality=="reduced"||string.IsNullOrEmpty(worldView?.Config.quality)&&Application.isMobilePlatform;
        if(lightingDefaults==null)lightingDefaults=new LightingDefaults{shadowResolution=urp!=null?urp.mainLightShadowmapResolution:0,pipelineMsaa=urp!=null?urp.msaaSampleCount:1,shadowDistance=urp!=null?urp.shadowDistance:0,cascades=urp!=null?urp.shadowCascadeCount:1,cascadeBorder=urp!=null?urp.cascadeBorder:0,depthBias=urp!=null?urp.shadowDepthBias:0,normalBias=urp!=null?urp.shadowNormalBias:0,mode=RenderSettings.ambientMode,flat=RenderSettings.ambientLight,intensity=RenderSettings.ambientIntensity,probe=RenderSettings.ambientProbe,sunRotation=light!=null?light.transform.rotation:Quaternion.identity,sunColor=light!=null?light.color:Color.white,sunIntensity=light!=null?light.intensity:1,shadowStrength=light!=null?light.shadowStrength:1,sunBias=light!=null?light.shadowBias:0,sunNormalBias=light!=null?light.shadowNormalBias:0,shadows=light!=null?light.shadows:LightShadows.None,background=camera.backgroundColor,msaa=camera.allowMSAA,far=camera.farClipPlane,postProcessing=data!=null&&data.renderPostProcessing,cameraShadows=data==null||data.renderShadows,look=Array.ConvertAll(LookGlobals,n=>Shader.GetGlobalFloat(n)),lowPoly=Shader.GetGlobalFloat("_D6LowPoly"),lookKeyword=Shader.IsKeywordEnabled(LookKeyword)};
        var d=lightingDefaults;
        Shader.SetGlobalFloat("_D6LowPoly",LowPolyStyle?1:0);
        // Ambient: sky over horizon and a turf bounce (linear colours). Evening:
        // cool sky over darker turf; day: bright blue sky over sunlit turf.
        var sky=day?new Color(.50f,.58f,.72f):new Color(.30f,.36f,.47f);var horizon=day?new Color(.36f,.39f,.43f):new Color(.20f,.24f,.27f);var ground=day?new Color(.13f,.16f,.09f):new Color(.07f,.11f,.07f);
        var sh=new SphericalHarmonicsL2();sh.AddAmbientLight(horizon);sh.AddDirectionalLight(Vector3.up,sky-horizon,.9f);sh.AddDirectionalLight(Vector3.down,ground,.6f);
        RenderSettings.ambientMode=AmbientMode.Custom;RenderSettings.ambientProbe=sh;RenderSettings.ambientIntensity=1;
        // Evening: one high floodlight key with soft real shadows. Day: a warm
        // sun 55 deg up behind the broadcast side; its shadows fall away from
        // the main, wide, sideline, diagonal and behind-goal cameras.
        if(light!=null){
            light.transform.rotation=day?Quaternion.Euler(55,135,0):Quaternion.Euler(54,-32,0);light.color=day?new Color(1f,.962f,.89f):new Color(1f,.96f,.90f);light.intensity=day?1.5f:1.45f;
            light.shadows=ReducedQuality?LightShadows.Hard:LightShadows.Soft;light.shadowStrength=day?.86f:.78f;
            // The received looks give the light and the pipeline the same bias:
            // URP takes either, depending on the light's additional data.
            light.shadowBias=legacy?.04f:ShadowBias;light.shadowNormalBias=legacy?.35f:ShadowNormalBias;
        }
        // The horizon dome of the club surroundings sits 280 m out.
        camera.backgroundColor=day?new Color(.60f,.72f,.86f):new Color(.05f,.09f,.14f);camera.allowMSAA=!ReducedQuality;camera.farClipPlane=Mathf.Max(d.far,700);
        if(urp!=null){
            urp.mainLightShadowmapResolution=ReducedQuality?1024:legacy?d.shadowResolution:2048;urp.msaaSampleCount=ReducedQuality?1:d.pipelineMsaa;
            // Legacy: Release 130 reach (pipeline or 70 m), cascades and bias.
            // Received looks: one stable cascade sized to the pitch, faded at its end.
            if(legacy){urp.shadowDistance=ReducedQuality?70:d.shadowDistance;urp.shadowCascadeCount=d.cascades;urp.cascadeBorder=d.cascadeBorder;urp.shadowDepthBias=d.depthBias;urp.shadowNormalBias=d.normalBias;}
            else{var g=worldView?.Config.geometry;urp.shadowDistance=MatchLighting.ShadowDistance(g!=null?(float)g.length:68,g!=null?(float)g.width:44);urp.shadowCascadeCount=1;urp.cascadeBorder=MatchLighting.ShadowFade;urp.shadowDepthBias=ShadowBias;urp.shadowNormalBias=ShadowNormalBias;}
        }
        // Shader terms of the received looks (D6Common.hlsl); without the
        // keyword every shader runs exactly its Release 130 code.
        if(legacy){Shader.DisableKeyword(LookKeyword);SetLookGlobals(d.look);}
        else{Shader.EnableKeyword(LookKeyword);SetLookGlobals(new[]{day?0:1f,ReducedQuality?0:KitShadow,KitShadowOffset,KitDepthBias,KitNormalBias,day?.62f:.82f});}
        if(data!=null){data.renderPostProcessing=true;data.renderShadows=true;}
        if(matchVolume==null){
            matchProfile=ScriptableObject.CreateInstance<VolumeProfile>();
            matchGrade=matchProfile.Add<ColorAdjustments>(true);matchVignette=matchProfile.Add<Vignette>(true);matchBloom=matchProfile.Add<Bloom>(true);
            var go=new GameObject("D6 match grading");go.transform.SetParent(transform,false);matchVolume=go.AddComponent<Volume>();matchVolume.isGlobal=true;matchVolume.priority=10;matchVolume.sharedProfile=matchProfile;
        }
        // Evening: light contrast and lift, a soft vignette, bloom on lamps and
        // boards. Day: natural colour without the lift and no bloom, so white
        // kits never glow in the sun.
        matchGrade.contrast.Override(day?4:6);matchGrade.saturation.Override(day?4:-6);matchGrade.postExposure.Override(day?0:.1f);
        matchVignette.intensity.Override(day?.15f:.2f);matchVignette.smoothness.Override(.5f);
        matchBloom.threshold.Override(.93f);matchBloom.intensity.Override(.35f);matchBloom.scatter.Override(.6f);
        matchVolume.enabled=true;matchBloom.active=!ReducedQuality&&!day;
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
        // An unused bridge owns no lighting snapshot and must not alter global state.
        if(lightingDefaults==null)return;var d=lightingDefaults;
        Shader.SetGlobalFloat("_D6LowPoly",d.lowPoly);if(d.lookKeyword)Shader.EnableKeyword(LookKeyword);else Shader.DisableKeyword(LookKeyword);
        if(matchVolume!=null)matchVolume.enabled=false;if(replayVolume!=null)replayVolume.enabled=false;var light=FindSun();var camera=Camera.main;SetLookGlobals(d.look);
        if(GraphicsSettings.currentRenderPipeline is UniversalRenderPipelineAsset urp&&d.shadowResolution>0){urp.mainLightShadowmapResolution=d.shadowResolution;urp.shadowDistance=d.shadowDistance;urp.msaaSampleCount=d.pipelineMsaa;urp.shadowCascadeCount=d.cascades;urp.cascadeBorder=d.cascadeBorder;urp.shadowDepthBias=d.depthBias;urp.shadowNormalBias=d.normalBias;}
        RenderSettings.ambientMode=d.mode;RenderSettings.ambientLight=d.flat;RenderSettings.ambientIntensity=d.intensity;RenderSettings.ambientProbe=d.probe;
        if(light!=null){light.transform.rotation=d.sunRotation;light.color=d.sunColor;light.intensity=d.sunIntensity;light.shadows=d.shadows;light.shadowStrength=d.shadowStrength;light.shadowBias=d.sunBias;light.shadowNormalBias=d.sunNormalBias;}
        if(camera!=null){camera.backgroundColor=d.background;camera.allowMSAA=d.msaa;camera.farClipPlane=d.far;var data=camera.GetUniversalAdditionalCameraData();if(data!=null){data.renderPostProcessing=d.postProcessing;data.renderShadows=d.cameraShadows;}}
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
        if(Look==MatchLook.Legacy)return;
        // Received looks: lighting-aware blobs (D6Blob _Model 1). In sunlight
        // more of the contact is one sharp key shadow the map cannot resolve;
        // under floodlights more of it is fill. The ball keeps its height and
        // opacity strength (UpdateWorldBallShadow) and the darkest contact.
        bool day=Look==MatchLook.Day;
        blob.SetFloat("_Model",1);blob.SetFloat("_Strength",1);blob.SetFloat("_Contact",day?.78f:.7f);blob.SetFloat("_Occlusion",day?.3f:.34f);blob.SetFloat("_Core",day?.5f:.55f);
        ballBlob.SetFloat("_Model",1);ballBlob.SetFloat("_Contact",.95f);ballBlob.SetFloat("_Occlusion",day?.45f:.5f);ballBlob.SetFloat("_Core",day?.7f:.75f);
        // Only figures, ball and goal frame cast. Pitch markings and the net
        // are thinner than a shadow texel: they only cost shadow passes.
        var casters=new HashSet<Renderer>{ballView.GetComponent<Renderer>()};
        foreach(var actor in actors)foreach(var r in actor.GetComponentsInChildren<Renderer>())casters.Add(r);
        foreach(var r in world.GetComponentsInChildren<Renderer>())if(r.name.StartsWith("Goal post")||r.name=="Crossbar"||r.name=="Net support"||r.name=="Net roof support"||r.name=="Rear crossbar")casters.Add(r);
        foreach(var r in world.GetComponentsInChildren<Renderer>())if(!FootballGround.IsGroundSkin(r))r.shadowCastingMode=casters.Contains(r)?ShadowCastingMode.On:ShadowCastingMode.Off;
        // The full normal bias would shrink the 35 cm ball out of the shadow
        // map: a shadow-only twin on the ball casts it with the figures' share
        // (WorldKit's caster), so a flighted ball shows its real shadow too.
        // Slightly smaller, so the ball's own lit side never shadows itself.
        // One twin per ball, also when the shadows are sorted again.
        if(matchKitShader!=null){
            var twin=ballView.Find(BallCasterName);
            if(twin==null){
                twin=new GameObject(BallCasterName,typeof(MeshFilter),typeof(MeshRenderer)).transform;twin.SetParent(ballView,false);twin.localScale=Vector3.one*.88f;twin.GetComponent<MeshFilter>().sharedMesh=ballView.GetComponent<MeshFilter>().sharedMesh;
                var caster=new Material(matchKitShader);materials.Add(caster);twin.GetComponent<MeshRenderer>().sharedMaterial=caster;
            }
            twin.GetComponent<MeshRenderer>().shadowCastingMode=ShadowCastingMode.ShadowsOnly;
            ballView.GetComponent<Renderer>().shadowCastingMode=ShadowCastingMode.Off;
        }
    }
}
}

#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using System.Globalization;
using System.Reflection;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
namespace Doppel6.Probe {
// The received fixture light on the actual ProbeBridge (ApplyMatchLighting,
// ApplyMatchShadows, RestoreProbeLighting): legacy (no presentation), night,
// European night and day, standard and reduced quality. The key light,
// ambient, URP shadow and MSAA settings, grading, LightLook, shader terms,
// contact blobs and shadow casters are checked against the lighting contract
// (legacy against the frozen Release 130 values); a second application is
// identical, a legacy fixture after a day fixture keeps nothing of it, and
// RestoreProbeLighting returns every touched setting. Needs the probe
// scene's main camera and sun under URP (D6Cli.Tests opens it); no rendering.
public static class MatchLightingTests {
    [Serializable] class Case {public string name,look,quality,shadows;public int shadowResolution,msaa,cascades;public float shadowDistance,shadowFade,depthBias,normalBias,shadowStrength,keyIntensity,keyElevation,kitShadow,kitDepthBias,kitNormalBias,kitKnee,leastShadowAway;public bool bloom,cameraMsaa;public float[] keyDirection;}
    [Serializable] class Report {public int passed;public string biasSource,pristine;public float defaultCameraFarCorner,largePitchFarCorner,shadowDistance,largePitchShadowDistance;public string[] checks;public Case[] cases;}
    static readonly string[] Modes={"follow","wide","sideline","diagonal","goal"};
    // Release 130 evening floodlight, frozen: LightLook, key light, ambient, grading.
    static readonly MatchLightLook Evening=new MatchLightLook{light=MatchLight.Night,skyTop=new Color(.035f,.06f,.13f),skyHorizon=new Color(.30f,.29f,.35f),skyGround=new Color(.02f,.03f,.04f),lampEmission=1,windowLit=.45f,crowdLight=1,bannerLight=1};
    static SphericalHarmonicsL2 EveningProbe(){var horizon=new Color(.20f,.24f,.27f);var sh=new SphericalHarmonicsL2();sh.AddAmbientLight(horizon);sh.AddDirectionalLight(Vector3.up,new Color(.30f,.36f,.47f)-horizon,.9f);sh.AddDirectionalLight(Vector3.down,new Color(.07f,.11f,.07f),.6f);return sh;}
    static string F(float v)=>v.ToString("R",CultureInfo.InvariantCulture);
    static string C(Color c)=>F(c.r)+","+F(c.g)+","+F(c.b)+","+F(c.a);
    static float Luma(Color c)=>.2126f*c.r+.7152f*c.g+.0722f*c.b;
    static Color Up(SphericalHarmonicsL2 sh){var result=new Color[1];sh.Evaluate(new[]{Vector3.up},result);return result[0];}
    static bool Near(float a,float b,float e=1e-5f)=>Mathf.Abs(a-b)<=e;
    static bool Same(Color a,Color b)=>Near(a.r,b.r)&&Near(a.g,b.g)&&Near(a.b,b.b)&&Near(a.a,b.a);
    static bool Same(MatchLightLook a,MatchLightLook b)=>a.light==b.light&&Same(a.skyTop,b.skyTop)&&Same(a.skyHorizon,b.skyHorizon)&&Same(a.skyGround,b.skyGround)&&Near(a.lampEmission,b.lampEmission)&&Near(a.windowLit,b.windowLit)&&Near(a.crowdLight,b.crowdLight)&&Near(a.bannerLight,b.bannerLight);
    static bool Same(SphericalHarmonicsL2 a,SphericalHarmonicsL2 b){for(int c=0;c<3;c++)for(int k=0;k<9;k++)if(!Near(a[c,k],b[c,k]))return false;return true;}
    // Every setting the match light touches outside the shader globals, as text (rotation to 1e-5).
    static string State(Light sun,Camera camera,UniversalRenderPipelineAsset urp){
        var data=camera.GetUniversalAdditionalCameraData();var sh=RenderSettings.ambientProbe;var probe=new System.Text.StringBuilder();var q=sun.transform.rotation;
        for(int c=0;c<3;c++)for(int k=0;k<9;k++)probe.Append(F(sh[c,k])).Append(' ');
        string R(float v)=>v.ToString("F5",CultureInfo.InvariantCulture);
        return string.Join("|",new object[]{RenderSettings.ambientMode,C(RenderSettings.ambientLight),F(RenderSettings.ambientIntensity),probe,R(q.x)+","+R(q.y)+","+R(q.z)+","+R(q.w),C(sun.color),F(sun.intensity),sun.shadows,F(sun.shadowStrength),F(sun.shadowBias),F(sun.shadowNormalBias),
            C(camera.backgroundColor),camera.allowMSAA,F(camera.farClipPlane),data.renderPostProcessing,data.renderShadows,urp.mainLightShadowmapResolution,F(urp.shadowDistance),urp.msaaSampleCount,urp.shadowCascadeCount,F(urp.cascadeBorder),F(urp.shadowDepthBias),F(urp.shadowNormalBias)});
    }
    // dist/world-pitch3d-v98.js v98CameraAim for a landscape page at the default near 60.
    static (Vector3 position,Vector3 target) Aim(string mode,Vector3 ball){
        float Limit(float v,float a,float b)=>Mathf.Max(a,Mathf.Min(b,v));
        float half=17*(float)Math.Tanh(ball.x/8),beyond=Mathf.Max(0,Mathf.Abs(ball.x)-17);
        var tracked=new Vector3(half*.65f+ball.x*.35f+Mathf.Sign(ball.x)*Mathf.Min(4,beyond*.18f),0,Limit(ball.z*.35f,-6.5f,6.5f));
        Vector3 position=new Vector3(Limit(ball.x*.28f,-9,9),21,31),target=tracked;
        if(mode=="wide"){position=new Vector3(Limit(ball.x*.56f,-17,17),32,49);target=new Vector3(Limit(ball.x*.56f,-17,17),0,Limit(ball.z*.1f,-2,2)-2);}
        else if(mode=="sideline")position=new Vector3(tracked.x*.65f,13,31);
        else if(mode=="diagonal")position=new Vector3(tracked.x-22,23,32);
        else if(mode=="goal"){position=new Vector3(-49,19,9);target=new Vector3(Limit(ball.x*.65f,-25,25),0,Limit(ball.z*.4f,-9,9));}
        if(mode=="follow"||mode=="sideline"||mode=="wide"){float pan=Mathf.Max(0,ball.z-13)*.65f;position.z+=pan;target.z+=pan;}
        return (position,target);
    }
    // The follow camera on a pitch of any size (world-unity-v151.js camera()):
    // the authored aim of the 68 x 44 ball position, the following distance kept.
    static Vector3 Follow(Vector3 ball,float length,float width){
        float sx=length/68,sz=width/44;var u=new Vector3(ball.x/sx,0,ball.z/sz);var (position,target)=Aim("follow",u);
        var p=new Vector3(target.x*sx,0,target.z*sz)+(position-target);
        if(u.z>13){float ramp=Mathf.Min(1,(u.z-13)/3),weight=ramp*ramp*(3-2*ramp);p.z+=Mathf.Max(0,sz-1)*Mathf.Max(0,u.z-target.z)*weight;}
        return p;
    }
    // Largest distance from the follow camera to a pitch corner over ball positions on the pitch.
    static float FarCorner(float length,float width){
        float far=0;for(int i=0;i<=16;i++)for(int j=0;j<=8;j++){var camera=Follow(new Vector3((i/16f-.5f)*length,0,(j/8f-.5f)*width),length,width);
            foreach(int x in new[]{-1,1})foreach(int z in new[]{-1,1})far=Mathf.Max(far,Vector3.Distance(camera,new Vector3(x*length/2,0,z*width/2)));}
        return far;
    }

    public static string Run(string repository,string outputFolder=null){
        var checks=new List<string>();var cases=new List<Case>();void Require(bool ok,string name){if(!ok)throw new Exception("Match lighting: "+name);checks.Add(name);}
        var flags=BindingFlags.NonPublic|BindingFlags.Instance;
        object Get(ProbeBridge b,string n)=>typeof(ProbeBridge).GetField(n,flags).GetValue(b);
        void Set(ProbeBridge b,string n,object v)=>typeof(ProbeBridge).GetField(n,flags).SetValue(b,v);
        object Invoke(ProbeBridge b,string n,params object[] args)=>typeof(ProbeBridge).GetMethod(n,flags).Invoke(b,args);
        var raw=File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json"));
        WorldConfig Config(string quality,WorldPresentation display){var c=JsonUtility.FromJson<WorldConfig>(raw);c.quality=quality;c.presentation=display;return c;}
        WorldPresentation Display(string lighting,string competition){var c=JsonUtility.FromJson<WorldConfig>(raw);
            return new WorldPresentation{schema="d6-presentation-1",competition=competition,round="3",format="",venue="home",lighting=lighting,lightRule=competition=="europe"?"europe-night":competition=="cup"?"cup-mix-40":"league-mix-60",lightBucket=lighting=="day"?12:73,venueCountry="GER",
                clubs=new[]{new WorldPresentationClub{id=c.teams[0].id,country="GER",kind="league",primary="#14337a",secondary="#e6e7e3"},new WorldPresentationClub{id=c.teams[1].id,country="ENG",kind="league",primary="#edac24",secondary="#142629"}}};}
        var camera=Camera.main;var urp=GraphicsSettings.currentRenderPipeline as UniversalRenderPipelineAsset;var kitShader=Shader.Find("Doppel6/World Kit");
        var scene=UnityEditor.SceneManagement.EditorSceneManager.NewPreviewScene();var created=new List<UnityEngine.Object>();var open=new List<ProbeBridge>();
        var report=new Report();
        try{
            GameObject Make(string name,PrimitiveType? type=null,Transform parent=null){var go=type.HasValue?GameObject.CreatePrimitive(type.Value):new GameObject(name);go.name=name;UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(go,scene);if(parent!=null)go.transform.SetParent(parent,false);created.Add(go);return go;}
            // A bridge on a match world with the parts its shadow setup sorts.
            ProbeBridge Bridge(WorldConfig config,Dictionary<string,Renderer> parts){
                var bridge=Make("D6 lighting test bridge").AddComponent<ProbeBridge>();var world=Make("D6 lighting test world").transform;bridge.matchKitShader=kitShader;
                Set(bridge,"worldView",new WorldViewState(config));Set(bridge,"world",world);
                Renderer Part(string name,PrimitiveType type,Transform parent=null){var r=Make(name,type,parent??world).GetComponent<Renderer>();parts[name]=r;return r;}
                Set(bridge,"ballView",Part("Ball",PrimitiveType.Sphere).transform);Set(bridge,"ballShadow",Part("Ball ground reference",PrimitiveType.Cylinder).transform);
                foreach(var n in new[]{"Goal post","Crossbar","Net support","Rear crossbar"})Part(n,PrimitiveType.Cylinder);
                foreach(var n in new[]{"Touchline","Goal line","Grass","Goal net","Centre spot"})Part(n,PrimitiveType.Cube);
                var stand=Part("Stand",PrimitiveType.Cube);stand.sharedMaterial=new Material(Resources.Load<Shader>("D6Env"));created.Add(stand.sharedMaterial);
                var player=Make("D6 lighting test player",null,world).transform;Part("Player body",PrimitiveType.Capsule,player);
                Part(FootballGround.GroundSkinName,PrimitiveType.Capsule,player).shadowCastingMode=ShadowCastingMode.TwoSided;
                ((List<Transform>)Get(bridge,"actors")).Add(player);((List<Transform>)Get(bridge,"rings")).Add(Part("Team disc",PrimitiveType.Cylinder).transform);
                open.Add(bridge);return bridge;
            }
            // The bridge, its volumes and world first, then the profiles and materials they used.
            void Dispose(ProbeBridge bridge){
                var used=new List<UnityEngine.Object>((List<Material>)Get(bridge,"materials"));foreach(var n in new[]{"matchProfile","replayProfile"})if(Get(bridge,n) is VolumeProfile p)used.Add(p);
                var world=(Transform)Get(bridge,"world");if(world!=null)UnityEngine.Object.DestroyImmediate(world.gameObject);UnityEngine.Object.DestroyImmediate(bridge.gameObject);
                foreach(var o in used)if(o!=null)UnityEngine.Object.DestroyImmediate(o);
                open.Remove(bridge);
            }
            if(camera==null||urp==null||kitShader==null)throw new InvalidOperationException("Match lighting tests need the probe scene's main camera under URP and the World Kit shader");
            var probe=Bridge(Config("standard",null),new Dictionary<string,Renderer>());var sun=(Light)Invoke(probe,"FindSun");
            if(sun==null)throw new InvalidOperationException("Match lighting tests need the probe scene's directional light");
            Dispose(probe);
            sun.TryGetComponent(out UniversalAdditionalLightData sunData);
            report.biasSource=sunData==null?"pipeline (no additional light data)":sunData.usePipelineSettings?"pipeline (light uses pipeline settings)":"light (own bias)";
            var pristine=State(sun,camera,urp);report.pristine=pristine;
            int pristineResolution=urp.mainLightShadowmapResolution,pristineMsaa=urp.msaaSampleCount,pristineCascades=urp.shadowCascadeCount;
            float pristineDistance=urp.shadowDistance,pristineFade=urp.cascadeBorder,pristineDepth=urp.shadowDepthBias,pristineNormal=urp.shadowNormalBias,pristineFar=camera.farClipPlane;

            // The fixture rule itself: presentation absent or JsonUtility-empty is legacy; Europe is night only.
            Require(MatchLighting.Resolve(null)==MatchLook.Legacy&&MatchLighting.Resolve(new WorldPresentation())==MatchLook.Legacy&&MatchLighting.Resolve(Display("night","europe"))==MatchLook.Night&&MatchLighting.Resolve(Display("day","league"))==MatchLook.Day,"an absent or empty presentation keeps the legacy picture; the received lighting selects night or day");
            bool rejected=false;try{new WorldViewState(Config("standard",Display("day","europe")));}catch(ArgumentException){rejected=true;}
            Require(rejected,"a European fixture cannot request the day look (rejected before any light changes)");
            // Shadow reach against the measured camera rig, default and large pitch.
            float corner=FarCorner(68,44),large=FarCorner(81.6f,52.8f),reach=MatchLighting.ShadowDistance(68,44),largeReach=MatchLighting.ShadowDistance(81.6f,52.8f),full=1-MatchLighting.ShadowFade;
            report.defaultCameraFarCorner=corner;report.largePitchFarCorner=large;report.shadowDistance=reach;report.largePitchShadowDistance=largeReach;
            Require(reach*full>=corner+5-.05f&&reach*full<=corner+6.5f&&largeReach*full>=large+5-.05f&&largeReach*full<=large+6.5f,"full-strength shadows reach the default camera's farthest pitch corner plus 5 m ("+corner.ToString("0.0")+" m on 68 x 44, "+large.ToString("0.0")+" m on 81.6 x 52.8) and no further");
            Require(reach<110,"the default pitch's shadow map covers less than the Release 130 standard 110 m, so its texels are finer ("+reach.ToString("0.0")+" m)");

            string legacyState=null;bool replayChecked=false;
            foreach(var (name,quality,display) in new (string,string,WorldPresentation)[]{("legacy-standard","standard",null),("legacy-reduced","reduced",null),("legacy-empty-presentation","standard",new WorldPresentation()),("night-standard","standard",Display("night","league")),("night-reduced","reduced",Display("night","cup")),("europe-night-standard","standard",Display("night","europe")),("day-standard","standard",Display("day","league")),("day-reduced","reduced",Display("day","cup"))}){
                var parts=new Dictionary<string,Renderer>();var bridge=Bridge(Config(quality,display),parts);
                Invoke(bridge,"ApplyMatchLighting");Invoke(bridge,"ApplyMatchShadows");
                bool legacy=string.IsNullOrEmpty(display?.schema),day=!legacy&&display.lighting=="day",reduced=quality=="reduced";
                Require(bridge.Look==(legacy?MatchLook.Legacy:day?MatchLook.Day:MatchLook.Night)&&bridge.ReducedQuality==reduced,name+": the received fixture selects the "+bridge.Look+" look in "+quality+" quality");
                // LightLook, read by the stadium for sky, lamps, windows, crowd and banners.
                var look=bridge.LightLook;
                if(!day)Require(Same(look,Evening),name+": evening LightLook keeps the Release 130 sky, lamps, windows, crowd and banners");
                else Require(look.light==MatchLight.Day&&look.lampEmission<=.1f&&look.windowLit>=1&&Luma(look.skyTop)>Luma(Evening.skyTop)+.2f&&look.skyTop.b>look.skyTop.r&&Luma(look.skyHorizon)>Luma(look.skyTop)&&Luma(look.skyGround)>Luma(Evening.skyGround)&&look.crowdLight>0&&look.crowdLight<=1&&look.bannerLight>0&&look.bannerLight<=1,name+": day LightLook has a light-blue sky, lamps off, unlit windows and calmer stands");
                // One key light.
                var forward=sun.transform.forward;float elevation=Mathf.Asin(-forward.y)*Mathf.Rad2Deg;var shadowWay=new Vector2(forward.x,forward.z).normalized;float least=1;
                if(!day)Require(Quaternion.Angle(sun.transform.rotation,Quaternion.Euler(54,-32,0))<.01f&&Same(sun.color,new Color(1f,.96f,.90f))&&Near(sun.intensity,1.45f)&&Near(sun.shadowStrength,.78f),name+": the Release 130 evening floodlight key (54/-32 deg, warm white, 1.45, shadow .78)");
                else{
                    Require(elevation>=50&&elevation<=60&&sun.color.r>=sun.color.g&&sun.color.g>sun.color.b&&sun.intensity>=1.2f&&sun.intensity<=1.8f&&sun.shadowStrength>=.78f&&sun.shadowStrength<1,name+": a warm afternoon sun "+elevation.ToString("0.0")+" deg up");
                    foreach(var mode in Modes)for(int i=0;i<=8;i++)for(int j=0;j<=4;j++){var (position,target)=Aim(mode,new Vector3((i/8f-.5f)*68,0,(j/4f-.5f)*44));least=Mathf.Min(least,Vector2.Dot(new Vector2(target.x-position.x,target.z-position.z).normalized,shadowWay));}
                    Require(least>0,name+": player shadows fall away from the follow, wide, sideline, diagonal and behind-goal cameras (least "+least.ToString("0.00")+")");
                }
                Require(sun.shadows==(reduced?LightShadows.Hard:LightShadows.Soft),name+": "+(reduced?"hard":"soft")+" key light shadows");
                // Shadow map, MSAA and bias.
                Require(urp.mainLightShadowmapResolution==(reduced?1024:legacy?pristineResolution:2048)&&urp.msaaSampleCount==(reduced?1:pristineMsaa)&&camera.allowMSAA==!reduced,name+": shadow map "+urp.mainLightShadowmapResolution+", MSAA "+urp.msaaSampleCount+"x");
                if(legacy)Require(Near(urp.shadowDistance,reduced?70:pristineDistance)&&urp.shadowCascadeCount==pristineCascades&&Near(urp.cascadeBorder,pristineFade)&&Near(urp.shadowDepthBias,pristineDepth)&&Near(urp.shadowNormalBias,pristineNormal)&&Near(sun.shadowBias,.04f)&&Near(sun.shadowNormalBias,.35f),name+": the Release 130 shadow reach, cascades and bias");
                else{
                    Require(urp.shadowCascadeCount==1&&Near(urp.shadowDistance,reach)&&urp.cascadeBorder>0&&urp.cascadeBorder<=.25f,name+": one stable cascade over "+urp.shadowDistance.ToString("0.0")+" m, faded over its last "+(urp.cascadeBorder*100).ToString("0")+" %");
                    Require(Near(sun.shadowBias,urp.shadowDepthBias)&&Near(sun.shadowNormalBias,urp.shadowNormalBias),name+": light and pipeline carry the same caster bias, so it holds whichever URP uses ("+report.biasSource+")");
                }
                // Ambient and background.
                Require(RenderSettings.ambientMode==AmbientMode.Custom&&Near(RenderSettings.ambientIntensity,1),name+": custom sky ambient");
                if(!day)Require(Same(RenderSettings.ambientProbe,EveningProbe())&&Same(camera.backgroundColor,new Color(.05f,.09f,.14f)),name+": the Release 130 evening ambient and night background");
                else Require(Luma(Up(RenderSettings.ambientProbe))>Luma(Up(EveningProbe()))*1.25f&&Luma(camera.backgroundColor)>Luma(new Color(.05f,.09f,.14f))+.3f,name+": a brighter daylight sky ambient and background");
                Require(camera.farClipPlane>=Mathf.Max(pristineFar,700)&&camera.GetUniversalAdditionalCameraData().renderPostProcessing&&camera.GetUniversalAdditionalCameraData().renderShadows,name+": camera renders shadows, grading and the 280 m horizon dome");
                // Grading.
                var profile=(VolumeProfile)Get(bridge,"matchProfile");profile.TryGet<ColorAdjustments>(out var grade);profile.TryGet<Vignette>(out var vignette);profile.TryGet<Bloom>(out var bloom);
                Require(((Volume)Get(bridge,"matchVolume")).enabled&&!bridge.ReplayGraded&&grade!=null&&vignette!=null&&bloom!=null,name+": match grading on, replay grading off");
                Require(bloom.active==(!reduced&&!day),name+": bloom "+(bloom.active?"on lamps and boards":"off"));
                if(!day)Require(Near(grade.contrast.value,6)&&Near(grade.saturation.value,-6)&&Near(grade.postExposure.value,.1f)&&Near(vignette.intensity.value,.2f)&&Near(vignette.smoothness.value,.5f)&&Near(bloom.threshold.value,.93f)&&Near(bloom.intensity.value,.35f)&&Near(bloom.scatter.value,.6f),name+": the Release 130 evening grading");
                else Require(grade.postExposure.value<.1f&&grade.contrast.value<6&&vignette.intensity.value<=.2f,name+": daylight grading without the evening lift");
                if(reduced)Require(urp.msaaSampleCount==1&&!camera.allowMSAA&&!bloom.active&&urp.mainLightShadowmapResolution==1024&&sun.shadows==LightShadows.Hard,name+": reduced quality disables MSAA and bloom and uses 1024 hard shadows");
                if(!replayChecked){Invoke(bridge,"SetReplayGrade",true);bool on=bridge.ReplayGraded;Invoke(bridge,"SetReplayGrade",false);Require(on&&!bridge.ReplayGraded,"replay grading follows only the received replay flag");replayChecked=true;}
                // Shader terms.
                float G(string n)=>Shader.GetGlobalFloat(n);
                Require(G("_D6LowPoly")==(ProbeBridge.LowPolyStyle?1:0)&&Shader.IsKeywordEnabled(ProbeBridge.LookKeyword)==!legacy,name+": "+(legacy?"every shader on its Release 130 path":"shaders on the received look terms"));
                if(!legacy)Require(G("_D6Pool")==(day?0:1)&&(reduced?G("_D6KitShadow")==0:G("_D6KitShadow")>0&&G("_D6KitShadow")<1&&G("_D6KitShadowOffset")>0)&&G("_D6KitDepthBias")>0&&G("_D6KitDepthBias")<1&&G("_D6KitNormalBias")>0&&G("_D6KitNormalBias")<1&&G("_D6KitKnee")>.5f&&G("_D6KitKnee")<1,name+": "+(day?"no floodlight pools":"floodlight pools")+", kits cast with a share of the bias, a soft share of the shadow map"+(reduced?" skipped":"")+" and a highlight shoulder");
                // Contact blobs and shadow casters.
                Material playerBlob=parts["Team disc"].sharedMaterial,ballBlob=parts["Ball ground reference"].sharedMaterial;
                Require(playerBlob!=null&&playerBlob.shader.name=="Doppel6/Contact Shadow"&&ballBlob!=playerBlob&&ReferenceEquals(Get(bridge,"worldBallShadowMaterial"),ballBlob)&&parts["Team disc"].transform.localScale==new Vector3(1.05f,.004f,1.05f)&&parts["Ball ground reference"].transform.localScale==new Vector3(.54f,.003f,.54f),name+": contact blobs under the figures and a separate one under the ball");
                if(legacy)Require(Near(playerBlob.GetFloat("_Strength"),.42f)&&playerBlob.GetFloat("_Model")==0&&Near(ballBlob.GetFloat("_Strength"),.82f)&&ballBlob.GetFloat("_Model")==0,name+": the Release 130 contact blobs");
                else{bool Unit(Material m,string p)=>m.GetFloat(p)>0&&m.GetFloat(p)<=1;
                    Require(playerBlob.GetFloat("_Model")==1&&ballBlob.GetFloat("_Model")==1&&Unit(playerBlob,"_Contact")&&Unit(playerBlob,"_Occlusion")&&Unit(playerBlob,"_Core")&&Unit(ballBlob,"_Contact")&&Unit(ballBlob,"_Occlusion")&&Unit(ballBlob,"_Core")&&ballBlob.GetFloat("_Contact")>=playerBlob.GetFloat("_Contact")&&Near(ballBlob.GetFloat("_Strength"),.82f),name+": lighting-aware contact blobs that never darken a cast shadow twice; the ball's contact the darkest");}
                ShadowCastingMode Cast(string n)=>parts[n].shadowCastingMode;
                Require(Cast("Player body")==ShadowCastingMode.On&&Cast(FootballGround.GroundSkinName)==ShadowCastingMode.TwoSided&&Cast("Goal post")==ShadowCastingMode.On&&Cast("Crossbar")==ShadowCastingMode.On&&Cast("Stand")==ShadowCastingMode.Off&&Cast("Team disc")==ShadowCastingMode.Off,name+": figures and goal frame cast, stands and blobs do not; the hidden ground skin is untouched");
                var twin=parts["Ball"].transform.Find("Ball shadow caster");var twinRenderer=twin!=null?twin.GetComponent<MeshRenderer>():null;
                if(legacy)Require(Cast("Ball")==ShadowCastingMode.On&&twin==null&&Cast("Touchline")==ShadowCastingMode.On&&Cast("Goal net")==ShadowCastingMode.On&&Cast("Net support")==ShadowCastingMode.On,name+": the ball and the other casters stay as in Release 130");
                else{
                    Require(Cast("Touchline")==ShadowCastingMode.Off&&Cast("Goal line")==ShadowCastingMode.Off&&Cast("Centre spot")==ShadowCastingMode.Off&&Cast("Goal net")==ShadowCastingMode.Off&&Cast("Grass")==ShadowCastingMode.Off&&Cast("Ball ground reference")==ShadowCastingMode.Off&&Cast("Net support")==ShadowCastingMode.On&&Cast("Rear crossbar")==ShadowCastingMode.On,name+": pitch markings, turf and net leave the shadow map, the goal frame stays");
                    Require(Cast("Ball")==ShadowCastingMode.Off&&twinRenderer!=null&&twinRenderer.shadowCastingMode==ShadowCastingMode.ShadowsOnly&&twinRenderer.sharedMaterial!=null&&twinRenderer.sharedMaterial.shader==kitShader&&twin.GetComponent<MeshFilter>().sharedMesh==parts["Ball"].GetComponent<MeshFilter>().sharedMesh&&twin.localPosition==Vector3.zero&&twin.localScale.x>=.8f&&twin.localScale.x<1&&twin.localScale==Vector3.one*twin.localScale.x&&((List<Material>)Get(bridge,"materials")).Contains(twinRenderer.sharedMaterial),name+": the ball casts through a slightly smaller shadow-only twin with the figures' bias share; its material is disposed with the match");
                }
                // Determinism, then the complete restore.
                var state=State(sun,camera,urp);var before=look;Invoke(bridge,"ApplyMatchLighting");
                Require(State(sun,camera,urp)==state&&Same(bridge.LightLook,before),name+": the same fixture applied again gives the identical light (no time or random state)");
                if(name=="legacy-standard")legacyState=state;
                if(name=="legacy-empty-presentation")Require(state==legacyState,name+": identical to the absent presentation");
                cases.Add(new Case{name=name,look=bridge.Look.ToString(),quality=quality,shadows=sun.shadows.ToString(),shadowResolution=urp.mainLightShadowmapResolution,msaa=urp.msaaSampleCount,cascades=urp.shadowCascadeCount,shadowDistance=urp.shadowDistance,shadowFade=urp.cascadeBorder,depthBias=urp.shadowDepthBias,normalBias=urp.shadowNormalBias,shadowStrength=sun.shadowStrength,keyIntensity=sun.intensity,keyElevation=elevation,
                    kitShadow=legacy?1:G("_D6KitShadow"),kitDepthBias=legacy?1:G("_D6KitDepthBias"),kitNormalBias=legacy?1:G("_D6KitNormalBias"),kitKnee=legacy?1:G("_D6KitKnee"),leastShadowAway=least,bloom=bloom.active,cameraMsaa=camera.allowMSAA,keyDirection=new[]{forward.x,forward.y,forward.z}});
                Invoke(bridge,"RestoreProbeLighting");
                Require(State(sun,camera,urp)==pristine&&G("_D6LowPoly")==0&&!Shader.IsKeywordEnabled(ProbeBridge.LookKeyword)&&!((Volume)Get(bridge,"matchVolume")).enabled&&!bridge.ReplayGraded,name+": RestoreProbeLighting returns every touched light, ambient, camera and URP setting, including bias, cascades and fade");
                Dispose(bridge);
            }
            // Fixtures change on the same view: nothing of a day look survives into a legacy fixture.
            {
                var parts=new Dictionary<string,Renderer>();var bridge=Bridge(Config("standard",Display("day","league")),parts);
                Invoke(bridge,"ApplyMatchLighting");Set(bridge,"worldView",new WorldViewState(Config("standard",null)));Invoke(bridge,"ApplyMatchLighting");
                var profile=(VolumeProfile)Get(bridge,"matchProfile");profile.TryGet<ColorAdjustments>(out var grade);profile.TryGet<Bloom>(out var bloom);
                Require(State(sun,camera,urp)==legacyState&&bridge.Look==MatchLook.Legacy&&Same(bridge.LightLook,Evening)&&!Shader.IsKeywordEnabled(ProbeBridge.LookKeyword)&&bloom.active&&Near(grade.contrast.value,6)&&Near(grade.postExposure.value,.1f),"a legacy fixture after a day fixture on the same view gets exactly the legacy light: no bias, cascade, fade, grading or shader term is left behind");
                Invoke(bridge,"RestoreProbeLighting");Require(State(sun,camera,urp)==pristine,"restoring after a fixture change returns the settings found before the first fixture");
                Dispose(bridge);
            }
            Require(State(sun,camera,urp)==pristine,"the probe scene's light, camera and pipeline end exactly as found");
        }finally{
            // Never leave the scene's light or the pipeline asset changed, even after a failed check.
            for(int i=open.Count-1;i>=0;i--)try{Invoke(open[i],"RestoreProbeLighting");}catch(Exception e){Debug.LogException(e);}
            foreach(var o in created)if(o!=null)UnityEngine.Object.DestroyImmediate(o);UnityEditor.SceneManagement.EditorSceneManager.ClosePreviewScene(scene);
        }
        report.passed=checks.Count;report.checks=checks.ToArray();report.cases=cases.ToArray();
        var folder=Path.Combine(repository,outputFolder??"outputs/3d-quality/unity");Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,"match-lighting-tests.json"),JsonUtility.ToJson(report,true));
        return "passed="+checks.Count;
    }

    // Day/night pictures through the actual ProbeBridge.WorldCommand path; needs
    // a graphics device and runs like D6Cli.LowPoly (ProbeWebBuild.Configure,
    // probe scene open, ProbeWebBuild.Restore afterwards). Legacy, night and day
    // at the GER-2 stadium in standard and reduced quality: the five match
    // cameras at 1280x720 (reduced also 931x448 follow) and a close contact
    // camera. Measured on the rendered sRGB pixels: turf and sky luma, chests of
    // the field players and the ball against nearby open turf, the turf beside
    // the boots (contact) and one metre down the key light's shadow (cast) as
    // shares of open turf. A repeated render of one paused picture must be
    // pixel-identical; a slow broadcast pan at one pose clock reports how far
    // the turf at fixed world points inside, at the edge of and outside a cast
    // shadow changes between steps. Editor pictures, not WebGL or device evidence.
    [Serializable] class Shot {public string file,look,quality,mode,size;public float turf,sky,teamVsTurf,ballVsTurf,contactShade,castShade;}
    [Serializable] class Pan {public string look,quality;public int steps;public float insideChange,edgeChange,openChange;}
    [Serializable] class EvidenceReport {public string sourceId,unity,device,note;public bool repeatIdentical;public Shot[] shots;public Pan[] pans;}
    // Display-only layout of LowPolyDiagnostics: keepers in their goals, field players around a ground ball.
    static readonly Vector3[] Layout={new Vector3(-31.2f,0,.6f),new Vector3(-14,0,-8),new Vector3(-12,0,9),new Vector3(-3,0,-2),new Vector3(4,0,12),new Vector3(8,0,-10),
        new Vector3(31.2f,0,-1),new Vector3(-6,0,3.5f),new Vector3(1.5f,0,-5.5f),new Vector3(10,0,3),new Vector3(16,0,-12),new Vector3(20,0,8)};
    static readonly Vector3 Ball=new Vector3(-2.1f,.29f,-1.4f);
    public static string Evidence(string repository,string outputFolder=null){
        if(SystemInfo.graphicsDeviceType==GraphicsDeviceType.Null)throw new InvalidOperationException("Match lighting evidence needs a graphics device");
        var bridge=UnityEngine.Object.FindFirstObjectByType<ProbeBridge>()??throw new InvalidOperationException("ProbeBridge is missing in the open scene");
        var flags=BindingFlags.NonPublic|BindingFlags.Instance;var camera=Camera.main;bool log=Debug.unityLogger.logEnabled;int sequence=1;bool identical=true;
        var raw=File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json"));
        var folder=Path.Combine(repository,outputFolder??"outputs/3d-quality/unity/match-lighting");Directory.CreateDirectory(folder);
        var shots=new List<Shot>();var pans=new List<Pan>();
        void Drop(){var world=(Transform)typeof(ProbeBridge).GetField("world",flags).GetValue(bridge);if(world!=null)UnityEngine.Object.DestroyImmediate(world.gameObject);}
        void Send(WorldCommand c){Debug.unityLogger.logEnabled=false;try{bridge.WorldCommand(JsonUtility.ToJson(c).Replace("\"offside\":{\"lineX\":0.0}","\"offside\":null").Replace("\"offside\":{\"lineX\":0}","\"offside\":null"));}finally{Debug.unityLogger.logEnabled=log;}}
        void Arrange(WorldFrame f,bool close){
            for(int i=0;i<f.players.Length&&i<Layout.Length;i++){var at=close?(i==3?Vector3.zero:i==8?new Vector3(1.5f,0,.7f):i==7?new Vector3(-1.2f,0,1.6f):Layout[i]+new Vector3(0,0,30)):Layout[i];
                var ball=close?new Vector3(.75f,0,.25f):Ball;var d=new Vector3(ball.x-at.x,0,ball.z-at.z);if(d.sqrMagnitude<.01f)d=Vector3.right;d.Normalize();
                var p=f.players[i];p.position=new double[]{at.x,0,at.z};p.facing=new double[]{d.x,0,d.z};p.action="idle";p.moving=false;p.progress=0;p.duration=1;}
            f.ball=close?new double[]{.75,.29,.25}:new double[]{Ball.x,Ball.y,Ball.z};f.owner=f.players[3].id;f.ballOpacity=1;f.ballInFlight=false;
        }
        WorldConfig Load(string look,string quality){
            var config=JsonUtility.FromJson<WorldConfig>(raw);config.teams[0].id="GER-2";config.teams[0].home=true;config.teams[1].id="FRA-1";config.teams[1].home=false;config.quality=quality;
            if(look!="legacy")config.presentation=new WorldPresentation{schema="d6-presentation-1",competition="league",round="5",format="",venue="home",lighting=look,lightRule="league-mix-60",lightBucket=look=="day"?12:73,venueCountry="GER",
                clubs=new[]{new WorldPresentationClub{id="GER-2",country="GER",kind="league",primary="#1f6f43",secondary="#f2f2ee"},new WorldPresentationClub{id="FRA-1",country="FRA",kind="league",primary="#1b2a6b",secondary="#d9b23a"}}};
            config.session="lighting-"+look+"-"+quality;config.initial.session=config.session;config.initial.phase="paused";config.initial.sequence=sequence=1;config.initial.offside=null;Arrange(config.initial,false);
            Drop();Send(new WorldCommand{kind="load",config=config});
            if(bridge.Look.ToString().ToLowerInvariant()!=look||bridge.ReducedQuality!=(quality=="reduced"))throw new InvalidOperationException("The "+look+" "+quality+" fixture was not loaded");
            return config;
        }
        void Show(WorldConfig config,bool close,Vector3 position,Vector3 target,float fov,double clock){
            var frame=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(config.initial));frame.sequence=++sequence;frame.clock=clock;frame.phase="paused";frame.offside=null;
            Arrange(frame,close);frame.camera=new WorldCamera{position=new double[]{position.x,position.y,position.z},target=new double[]{target.x,target.y,target.z},fov=fov};
            Send(new WorldCommand{kind="frame",frame=frame});
        }
        // Current skinning baked for the Editor render; MSAA as the page's quality.
        Texture2D Capture(int w,int h,bool reduced){
            var baked=new List<(SkinnedMeshRenderer skin,GameObject go,Mesh mesh)>();
            foreach(var skin in UnityEngine.Object.FindObjectsByType<SkinnedMeshRenderer>(FindObjectsSortMode.None)){
                if(!skin.enabled||!skin.gameObject.activeInHierarchy)continue;var mesh=new Mesh();skin.BakeMesh(mesh);var go=new GameObject("D6 lighting capture",typeof(MeshFilter),typeof(MeshRenderer));go.transform.SetParent(skin.transform,false);
                go.GetComponent<MeshFilter>().sharedMesh=mesh;var r=go.GetComponent<MeshRenderer>();r.sharedMaterials=skin.sharedMaterials;r.shadowCastingMode=skin.shadowCastingMode;skin.enabled=false;baked.Add((skin,go,mesh));
            }
            var desc=new RenderTextureDescriptor(w,h,RenderTextureFormat.ARGB32,24){msaaSamples=reduced?1:4,sRGB=true};
            var rt=RenderTexture.GetTemporary(desc);float aspect=camera.aspect;camera.aspect=(float)w/h;camera.targetTexture=rt;camera.Render();camera.targetTexture=null;camera.aspect=aspect;
            var previous=RenderTexture.active;RenderTexture.active=rt;var tex=new Texture2D(w,h,TextureFormat.RGB24,false);tex.ReadPixels(new Rect(0,0,w,h),0,0);tex.Apply();RenderTexture.active=previous;RenderTexture.ReleaseTemporary(rt);
            foreach(var item in baked){item.skin.enabled=true;UnityEngine.Object.DestroyImmediate(item.go);UnityEngine.Object.DestroyImmediate(item.mesh);}return tex;
        }
        // Mean colour of a pixel patch at a world point (null: off screen).
        Color? Sample(Texture2D tex,Vector3 world,int radius=1){
            float saved=camera.aspect;camera.aspect=(float)tex.width/tex.height;var v=camera.WorldToViewportPoint(world);camera.aspect=saved;
            if(v.z<=0||v.x<0||v.x>1||v.y<0||v.y>1)return null;int cx=Mathf.RoundToInt(v.x*(tex.width-1)),cy=Mathf.RoundToInt(v.y*(tex.height-1));Color sum=Color.clear;int n=0;
            for(int y=cy-radius;y<=cy+radius;y++)for(int x=cx-radius;x<=cx+radius;x++)if(x>=0&&y>=0&&x<tex.width&&y<tex.height){sum+=tex.GetPixel(x,y);n++;}return n>0?sum/n:(Color?)null;
        }
        float Distance(Color a,Color b)=>Mathf.Sqrt((a.r-b.r)*(a.r-b.r)+(a.g-b.g)*(a.g-b.g)+(a.b-b.b)*(a.b-b.b));
        float Region(Texture2D tex,float y0,float y1){double sum=0;int n=0;for(int y=Mathf.FloorToInt(y0*tex.height);y<Mathf.FloorToInt(y1*tex.height);y+=3)for(int x=0;x<tex.width;x+=5){sum+=Luma(tex.GetPixel(x,y));n++;}return n>0?(float)(sum/n):0;}
        float Mean(List<float> values){if(values.Count==0)return -1;float s=0;foreach(var v in values)s+=v;return s/values.Count;}
        // Open turf beside a figure: across the camera's view, on the side away from its cast shadow.
        Vector3 Beside(Vector2 shadowWay){var right=new Vector2(camera.transform.right.x,camera.transform.right.z).normalized;if(Vector2.Dot(right,shadowWay)>0)right=-right;return new Vector3(right.x,0,right.y);}
        Shot Measure(Texture2D tex,WorldConfig config,bool close,Vector2 shadowWay){
            var shot=new Shot{turf=Region(tex,.3f,.6f),sky=Region(tex,.88f,1),teamVsTurf=-1,ballVsTurf=-1,contactShade=-1,castShade=-1};if(close)return shot;
            var beside=Beside(shadowWay);var down=new Vector3(shadowWay.x,0,shadowWay.y);var team=new List<float>();var contact=new List<float>();var cast=new List<float>();
            for(int i=0;i<Layout.Length&&i<config.initial.players.Length;i++){var id=config.initial.players[i].id;if(Array.Find(config.players,p=>p.id==id)?.keeper!=false)continue;var at=Layout[i];
                Color? chest=Sample(tex,at+Vector3.up*1.18f),near=Sample(tex,at+beside*1.2f,2),boots=Sample(tex,at+beside*.32f),open=Sample(tex,at+beside*2.4f,2),shade=Sample(tex,at+down);
                if(chest!=null&&near!=null)team.Add(Distance(chest.Value,near.Value));
                if(open!=null&&Luma(open.Value)>.02f){if(boots!=null)contact.Add(Luma(boots.Value)/Luma(open.Value));if(shade!=null)cast.Add(Luma(shade.Value)/Luma(open.Value));}
            }
            var ballAt=new Vector3(Ball.x,.11f,Ball.z);Color? ball=Sample(tex,ballAt,0),ballTurf=Sample(tex,ballAt+new Vector3(.6f,-.11f,.6f),2);
            shot.teamVsTurf=Mean(team);shot.contactShade=Mean(contact);shot.castShade=Mean(cast);shot.ballVsTurf=ball!=null&&ballTurf!=null?Distance(ball.Value,ballTurf.Value):-1;return shot;
        }
        void Save(Texture2D tex,Shot shot,string look,string quality,string mode,string size){
            shot.file="lighting-"+look+"-"+quality+"-"+mode+"-"+size+".png";shot.look=look;shot.quality=quality;shot.mode=mode;shot.size=size;
            File.WriteAllBytes(Path.Combine(folder,shot.file),tex.EncodeToPNG());shots.Add(shot);UnityEngine.Object.DestroyImmediate(tex);
        }
        bool SamePixels(Color32[] a,Color32[] b){if(a.Length!=b.Length)return false;for(int i=0;i<a.Length;i++)if(a[i].r!=b[i].r||a[i].g!=b[i].g||a[i].b!=b[i].b)return false;return true;}
        // A slow follow-camera pan (0.07 m a picture) over one paused pose: stable shadows keep the turf at fixed world points.
        Pan Sweep(WorldConfig config,string look,string quality,Vector2 shadowWay){
            var aim=SmallViewDiagnostics.Aim(new Vector3(Ball.x,0,Ball.z),Ball.y,"follow",16f/9);var pan=new Pan{look=look,quality=quality,steps=16};
            var foot=Layout[3];var down=new Vector3(shadowWay.x,0,shadowWay.y);var across=new Vector3(-shadowWay.y,0,shadowWay.x);Vector3 beside=Vector3.zero;float[] last=null;
            for(int k=0;k<=pan.steps;k++){var shift=Vector3.right*(k*.07f);Show(config,false,aim.position+shift,aim.target+shift,aim.fov,500);if(k==0)beside=Beside(shadowWay);
                var tex=Capture(1280,720,quality=="reduced");Color? inside=Sample(tex,foot+down*.7f),edge=Sample(tex,foot+down*.9f+across*.22f),open=Sample(tex,foot+beside*2.4f,2);UnityEngine.Object.DestroyImmediate(tex);
                if(inside==null||edge==null||open==null){last=null;continue;}var now=new[]{Luma(inside.Value),Luma(edge.Value),Luma(open.Value)};
                if(last!=null){pan.insideChange=Mathf.Max(pan.insideChange,Mathf.Abs(now[0]-last[0]));pan.edgeChange=Mathf.Max(pan.edgeChange,Mathf.Abs(now[1]-last[1]));pan.openChange=Mathf.Max(pan.openChange,Mathf.Abs(now[2]-last[2]));}last=now;}
            return pan;
        }
        try{
            // Warm-up: the first world of a fresh Editor scene can render before its materials settle.
            {var warm=Load("legacy","standard");var aim=SmallViewDiagnostics.Aim(new Vector3(Ball.x,0,Ball.z),Ball.y,"follow",16f/9);Show(warm,false,aim.position,aim.target,aim.fov,10);UnityEngine.Object.DestroyImmediate(Capture(320,180,false));}
            foreach(var look in new[]{"legacy","night","day"})foreach(var quality in new[]{"standard","reduced"}){
                var config=Load(look,quality);bool reduced=quality=="reduced";var key=((Light)typeof(ProbeBridge).GetMethod("FindSun",flags).Invoke(bridge,null)).transform.forward;var way=new Vector2(key.x,key.z).normalized;
                foreach(var mode in new[]{"follow","wide","sideline","diagonal","goal","close"}){
                    bool close=mode=="close";Vector3 position,target;float fov;
                    if(close){position=new Vector3(.5f,2.4f,8.8f);target=new Vector3(.3f,1.25f,.4f);fov=36;}
                    else{var aim=SmallViewDiagnostics.Aim(new Vector3(Ball.x,0,Ball.z),Ball.y,mode,16f/9);position=aim.position;target=aim.target;fov=aim.fov;}
                    Show(config,close,position,target,fov,10+sequence*.05);var tex=Capture(1280,720,reduced);
                    if(mode=="follow"){var again=Capture(1280,720,reduced);identical&=SamePixels(tex.GetPixels32(),again.GetPixels32());UnityEngine.Object.DestroyImmediate(again);}
                    Save(tex,Measure(tex,config,close,way),look,quality,mode,"1280x720");
                }
                if(reduced){var aim=SmallViewDiagnostics.Aim(new Vector3(Ball.x,0,Ball.z),Ball.y,"follow",931f/448);Show(config,false,aim.position,aim.target,aim.fov,10+sequence*.05);var tex=Capture(931,448,true);Save(tex,Measure(tex,config,false,way),look,quality,"follow","931x448");}
                pans.Add(Sweep(config,look,quality,way));
            }
        }finally{Drop();typeof(ProbeBridge).GetMethod("RestoreProbeLighting",flags).Invoke(bridge,null);camera.targetTexture=null;}
        var report=new EvidenceReport{sourceId=ProbeBuildIdentity.SourceId,unity=Application.unityVersion,device=SystemInfo.graphicsDeviceType.ToString(),repeatIdentical=identical,shots=shots.ToArray(),pans=pans.ToArray(),
            note="Paused display-only layout of the contract fixture at GER-2 through ProbeBridge.WorldCommand; cameras from SmallViewDiagnostics.Aim (near 60) and a close contact camera. Luma is .2126/.7152/.0722 over sRGB values; contactShade and castShade are turf luma 0.32 m beside the boots and 1 m down the key light's shadow as shares of open turf 2.4 m beside; teamVsTurf and ballVsTurf are sRGB distances. Pans: largest luma change between consecutive pictures at fixed turf points. Editor pictures with baked skinning, not WebGL or device evidence."};
        File.WriteAllText(Path.Combine(folder,"match-lighting-evidence.json"),JsonUtility.ToJson(report,true));
        return "shots="+shots.Count+" pans="+pans.Count+" repeatIdentical="+identical+" device="+SystemInfo.graphicsDeviceType;
    }
}
}
#endif

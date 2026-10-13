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
// identical, sorting the shadows again keeps one ball twin, a legacy fixture
// after a day fixture keeps nothing of it, and RestoreProbeLighting and
// OnDestroy (the view going while a fixture is on) return every touched
// setting, shader globals included. Needs the probe scene's main camera and
// sun under URP (D6Cli.Tests opens it); no rendering.
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
    // Every setting the match light touches, as text (rotation to 1e-5): light,
    // ambient, camera, pipeline asset and the received-look shader globals.
    static string State(Light sun,Camera camera,UniversalRenderPipelineAsset urp){
        var data=camera.GetUniversalAdditionalCameraData();var sh=RenderSettings.ambientProbe;var probe=new System.Text.StringBuilder();var q=sun.transform.rotation;
        for(int c=0;c<3;c++)for(int k=0;k<9;k++)probe.Append(F(sh[c,k])).Append(' ');
        string R(float v)=>v.ToString("F5",CultureInfo.InvariantCulture);
        return string.Join("|",new object[]{RenderSettings.ambientMode,C(RenderSettings.ambientLight),F(RenderSettings.ambientIntensity),probe,R(q.x)+","+R(q.y)+","+R(q.z)+","+R(q.w),C(sun.color),F(sun.intensity),sun.shadows,F(sun.shadowStrength),F(sun.shadowBias),F(sun.shadowNormalBias),
            C(camera.backgroundColor),camera.allowMSAA,F(camera.farClipPlane),data.renderPostProcessing,data.renderShadows,urp.mainLightShadowmapResolution,F(urp.shadowDistance),urp.msaaSampleCount,urp.shadowCascadeCount,F(urp.cascadeBorder),F(urp.shadowDepthBias),F(urp.shadowNormalBias),
            string.Join(",",Array.ConvertAll(ProbeBridge.LookGlobals,n=>F(Shader.GetGlobalFloat(n))))});
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
        float G(string n)=>Shader.GetGlobalFloat(n);
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
                var twin=parts["Ball"].transform.Find(ProbeBridge.BallCasterName);var twinRenderer=twin!=null?twin.GetComponent<MeshRenderer>():null;
                if(legacy)Require(Cast("Ball")==ShadowCastingMode.On&&twin==null&&Cast("Touchline")==ShadowCastingMode.On&&Cast("Goal net")==ShadowCastingMode.On&&Cast("Net support")==ShadowCastingMode.On,name+": the ball and the other casters stay as in Release 130");
                else{
                    Require(Cast("Touchline")==ShadowCastingMode.Off&&Cast("Goal line")==ShadowCastingMode.Off&&Cast("Centre spot")==ShadowCastingMode.Off&&Cast("Goal net")==ShadowCastingMode.Off&&Cast("Grass")==ShadowCastingMode.Off&&Cast("Ball ground reference")==ShadowCastingMode.Off&&Cast("Net support")==ShadowCastingMode.On&&Cast("Rear crossbar")==ShadowCastingMode.On,name+": pitch markings, turf and net leave the shadow map, the goal frame stays");
                    Require(Cast("Ball")==ShadowCastingMode.Off&&twinRenderer!=null&&twinRenderer.shadowCastingMode==ShadowCastingMode.ShadowsOnly&&twinRenderer.sharedMaterial!=null&&twinRenderer.sharedMaterial.shader==kitShader&&twin.GetComponent<MeshFilter>().sharedMesh==parts["Ball"].GetComponent<MeshFilter>().sharedMesh&&twin.localPosition==Vector3.zero&&twin.localScale.x>=.8f&&twin.localScale.x<1&&twin.localScale==Vector3.one*twin.localScale.x&&((List<Material>)Get(bridge,"materials")).Contains(twinRenderer.sharedMaterial),name+": the ball casts through a slightly smaller shadow-only twin with the figures' bias share; its material is disposed with the match");
                }
                // Sorting the shadows again changes nothing and keeps one twin.
                var sorted=new Dictionary<string,ShadowCastingMode>();foreach(var p in parts)sorted[p.Key]=p.Value.shadowCastingMode;
                Invoke(bridge,"ApplyMatchShadows");int twins=0;foreach(Transform child in parts["Ball"].transform)if(child.name==ProbeBridge.BallCasterName)twins++;
                bool same=true;foreach(var p in parts)same&=p.Value.shadowCastingMode==sorted[p.Key];
                Require(same&&twins==(legacy?0:1)&&(legacy||twinRenderer.shadowCastingMode==ShadowCastingMode.ShadowsOnly),name+": sorting the shadows again keeps the same casters and "+(legacy?"no":"one")+" ball twin");
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
            // The view goes while a received fixture is on (Play Mode exit, scene
            // unload): Unity then calls OnDestroy. Edit mode never sends it to this
            // component, so the test calls it the way Unity does.
            {
                var parts=new Dictionary<string,Renderer>();var bridge=Bridge(Config("reduced",Display("day","league")),parts);
                Invoke(bridge,"ApplyMatchLighting");Invoke(bridge,"ApplyMatchShadows");var used=new List<Material>((List<Material>)Get(bridge,"materials"));
                Require(State(sun,camera,urp)!=pristine&&Shader.IsKeywordEnabled(ProbeBridge.LookKeyword)&&used.Count>0,"lifecycle: a reduced day fixture has changed the light, pipeline asset and shader globals");
                Invoke(bridge,"OnDestroy");
                Require(State(sun,camera,urp)==pristine&&G("_D6LowPoly")==0&&!Shader.IsKeywordEnabled(ProbeBridge.LookKeyword)&&!((Volume)Get(bridge,"matchVolume")).enabled,"lifecycle: OnDestroy returns the light, ambient, camera, pipeline asset (resolution, distance, MSAA, cascades, fade, bias) and shader globals found before the fixture");
                Require((UnityEngine.Object)Get(bridge,"world")==null&&used.TrueForAll(m=>m==null),"lifecycle: OnDestroy disposes the match world and its materials");
                Dispose(bridge);
            }
            Require(State(sun,camera,urp)==pristine,"the probe scene's light, camera, pipeline and shader globals end exactly as found");
        }finally{
            // Never leave the scene's light or the pipeline asset changed, even after a failed check.
            for(int i=open.Count-1;i>=0;i--)try{Invoke(open[i],"RestoreProbeLighting");}catch(Exception e){Debug.LogException(e);}
            foreach(var o in created)if(o!=null)UnityEngine.Object.DestroyImmediate(o);UnityEditor.SceneManagement.EditorSceneManager.ClosePreviewScene(scene);
        }
        report.passed=checks.Count;report.checks=checks.ToArray();report.cases=cases.ToArray();
        var folder=Path.Combine(repository,outputFolder??"outputs/3d-quality/unity");Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,"match-lighting-tests.json"),JsonUtility.ToJson(report,true));
        return "passed="+checks.Count;
    }

    // Day/night pictures and shadow measurements through the actual
    // ProbeBridge.WorldCommand path (D6Cli.MatchLighting: graphics device,
    // ProbeWebBuild.Configure, probe scene open, ProbeWebBuild.Restore after).
    // Legacy, night and day at the GER-2 stadium in standard and reduced
    // quality: the five match cameras and a close contact camera at 1280x720,
    // reduced also a 931x448 follow picture. Editor pictures with baked
    // skinning, not WebGL or device evidence.
    //
    // Captures (lighting-e1). The skinned figures are drawn as baked copies, so
    // a picture shows the received pose. The bones are read before the bake (a
    // bake directly after PlayableGraph.Evaluate can use the previous pose,
    // FootballAnimation.LowestSkinned), and BakeMesh(useScale:false) already
    // carries the 1.45 figure scale, so a copy takes only the skin's position
    // and rotation; the copies of the earlier captures were parented under the
    // scaled skin and drew 1.45x figures. The follow copies are checked against
    // the same vertices skinned on the CPU from the current bones. Every
    // picture is captured three times (a, b, c) with nothing in between: the
    // differing pixels, largest channel step and box of a/b and b/c are kept
    // per picture, with paired pictures and diff images when they differ and
    // always for the follow picture. Before its a, the follow picture is also
    // captured with all figures baked before any bone read (the earlier bake)
    // as the hazard probe. Legacy (Release 130 shaders and settings) is the
    // harness control; night and day repeat the follow triple with the look
    // keyword off (Release 130 shader code under the received settings).
    // Asynchronous shader compilation is off for the run.
    //
    // Measurements (lighting-e2), linear light, never body pixels. Turf shade
    // is a picture over a registered picture of the same frame and camera
    // without the caster: around the boots (0.3 m, contact blob and cast
    // shadow) and along each field player's shadow (1.0-1.5 m), with the
    // figures drawn shadow-only against hidden figures without blobs. Samples
    // near another figure's ring (which takes no shadow) are invalid and
    // counted, never replaced. teamVsTurf and ballVsTurf (sRGB distances) only
    // use pixels a mask picture shows as figure, ball or open turf. A
    // shadow-only box on open turf gives the shadow edge: the follow camera
    // pans in 1.5 cm steps, well under a shadow texel, and every step reports
    // the world positions of the box shadow's side edges (the half level
    // between umbra and open turf) and the texel coordinates of the box in
    // URP's _MainLightWorldToShadow; a stable fit keeps their fractions. A
    // top-down camera measures that umbra, graded and ungraded, against the
    // key light share it should remove, and the 10-90 % penumbra width.
    [Serializable] internal class Pair {public int differing,maxDelta;public int[] box=new int[0];public string diff;}
    [Serializable] class Bake {public int skins,vertices,skinsOff;public float lossyScale,median=-1,max=-1,round1Median=-1,round1Max=-1;public string status;}
    [Serializable] class Shot {public string file,look,quality,mode,size,repeat,ballSample;public bool compiling;public float turf,sky,teamVsTurf=-1,ballVsTurf=-1,contactShade=-1,castShade=-1,castCore=-1;public int teamValid,teamInvalid,contactValid,contactInvalid,castValid,castInvalid;public Pair ab,bc;}
    [Serializable] class CaseEvidence {public string look,quality,shaderControl;public bool repeatIdentical,compiling;public int shots,identicalShots;public Pair unsyncedVsSynced,shaderControlAb,shaderControlBc;public Bake unsynced,synced;}
    [Serializable] class EdgeLine {public float s,side,offset=-9,maxDeviation=-1,width=-1;public int valid,invalid;public float[] positions;}
    [Serializable] class EdgeRun {public string look,quality,occluder,fit,status;public int steps,warmup;public float stepMetres,texelMetres=-1,maxFracDrift=-1,matrixMismatch=-1,warmupPoseDrift=-1,poseDrift=-1,umbraGraded=-1,maxDeviation=-1,maxDeviationTexels=-1,width=-1;public float[] fracX,fracY;public EdgeLine[] lines;}
    [Serializable] class Strength {public string look,quality,status;public int umbraValid,controlValid;public float umbra=-1,umbraGraded=-1,umbraSpread=-1,controlDeviation=-1,penumbra=-1,texelMetres=-1;public float[] measured,expected;}
    [Serializable] class EvidenceReport {public string schema,sourceId,unity,device,colorSpace,harness,note,placementComparison;public bool repeatIdentical,asyncCompilationBefore;public CaseEvidence[] cases;public Shot[] shots;public EdgeRun[] edges;public Strength[] strengths;}
    // One rendered picture: sRGB bytes (rows from the bottom), the camera's
    // view-projection and URP's main-light shadow matrices after the render.
    internal sealed class Picture {public int w,h,shadowResolution,skins,checkedVertices,skinsOff;public Color32[] px;public Texture2D tex;public Matrix4x4 viewProjection;public Matrix4x4[] shadow=new Matrix4x4[0];public Vector4 shadowSize;public bool compiling;public float lossyScale,bakeMedian=-1,bakeMax=-1,round1Median=-1,round1Max=-1;
        public void Dispose(){if(tex!=null)UnityEngine.Object.DestroyImmediate(tex);tex=null;}}
    enum Figures {Shown,ShadowOnly,Hidden,Mask}
    sealed class Options {public Figures figures=Figures.Shown;public bool sync=true,blobs=true,ball=true,grade=true,occluder,check,round1Placement;}
    // Display-only layout of LowPolyDiagnostics: keepers in their goals, field players around a ground ball.
    static readonly Vector3[] Layout={new Vector3(-31.2f,0,.6f),new Vector3(-14,0,-8),new Vector3(-12,0,9),new Vector3(-3,0,-2),new Vector3(4,0,12),new Vector3(8,0,-10),
        new Vector3(31.2f,0,-1),new Vector3(-6,0,3.5f),new Vector3(1.5f,0,-5.5f),new Vector3(10,0,3),new Vector3(16,0,-12),new Vector3(20,0,8)};
    static readonly Vector3 Ball=new Vector3(-2.1f,.29f,-1.4f);
    static readonly string[] Shots={"follow","wide","sideline","diagonal","goal","close"};
    // Shadow-only box on open turf, clear of lines, rings, blobs and their
    // shadows in every look; its long side lies across the key light.
    internal static readonly Vector3 BoxAt=new Vector3(-8.5f,0,-3);
    internal const float BoxHalf=.8f,BoxDepth=.4f,BoxHeight=2,PanStep=.015f;
    const int PanSteps=24,Warmup=3;

    // sRGB byte to the shaders' working space (linear colour space: the sRGB curve).
    internal static float[] Decode=Table(true);
    internal static float[] Table(bool linear){var t=new float[256];for(int i=0;i<256;i++){float c=i/255f;t[i]=!linear?c:c<=.04045f?c/12.92f:Mathf.Pow((c+.055f)/1.055f,2.4f);}return t;}
    internal static float Y(Vector3 c)=>.2126f*c.x+.7152f*c.y+.0722f*c.z;
    internal static float Median(List<float> v){if(v.Count==0)return -1;var s=new List<float>(v);s.Sort();int n=s.Count;return n%2==1?s[n/2]:(s[n/2-1]+s[n/2])*.5f;}
    internal static float Max(List<float> v){if(v.Count==0)return -1;float m=v[0];foreach(var x in v)m=Mathf.Max(m,x);return m;}
    internal static float Min(List<float> v){if(v.Count==0)return -1;float m=v[0];foreach(var x in v)m=Mathf.Min(m,x);return m;}
    internal static float Mean(List<float> v){if(v.Count==0)return -1;float s=0;foreach(var x in v)s+=x;return s/v.Count;}
    static float Gap(Color a,Color b)=>Mathf.Sqrt((a.r-b.r)*(a.r-b.r)+(a.g-b.g)*(a.g-b.g)+(a.b-b.b)*(a.b-b.b));
    static Material[] Fill(Material m,int n){var a=new Material[n];for(int i=0;i<n;i++)a[i]=m;return a;}
    // Sibling indices from the root, fixed width: a stable order within one world.
    static string Place(Transform t){var path="";for(;t!=null;t=t.parent)path=t.GetSiblingIndex().ToString("D5")+"/"+path;return path;}
    // Pixel position of a world point (rows from the bottom, pixel centres at
    // +.5); false behind the camera or within `margin` pixels of the border.
    internal static bool Pixel(Picture p,Vector3 world,out float x,out float y,float margin=2){
        var c=p.viewProjection*new Vector4(world.x,world.y,world.z,1);x=y=-1;if(c.w<=1e-4f)return false;
        x=(c.x/c.w*.5f+.5f)*p.w-.5f;y=(c.y/c.w*.5f+.5f)*p.h-.5f;return x>=margin&&y>=margin&&x<=p.w-1-margin&&y<=p.h-1-margin;
    }
    // Bilinear colour in the working space.
    internal static Vector3 Linear(Picture p,float x,float y){
        int x0=Mathf.Clamp(Mathf.FloorToInt(x),0,p.w-2),y0=Mathf.Clamp(Mathf.FloorToInt(y),0,p.h-2),i=y0*p.w+x0;float fx=Mathf.Clamp01(x-x0),fy=Mathf.Clamp01(y-y0);
        Vector3 At(int k){var c=p.px[k];return new Vector3(Decode[c.r],Decode[c.g],Decode[c.b]);}
        return Vector3.Lerp(Vector3.Lerp(At(i),At(i+1),fx),Vector3.Lerp(At(i+p.w),At(i+p.w+1),fx),fy);
    }
    // Turf shade at a world point: a picture over its registered picture without the caster.
    internal static bool Ratio(Picture shaded,Picture open,Vector3 world,out float ratio){
        ratio=-1;if(!Pixel(shaded,world,out float x,out float y))return false;float o=Y(Linear(open,x,y));if(o<=.002f)return false;ratio=Y(Linear(shaded,x,y))/o;return true;
    }
    internal static bool RatioRgb(Picture shaded,Picture open,Vector3 world,out Vector3 ratio){
        ratio=Vector3.zero;if(!Pixel(shaded,world,out float x,out float y))return false;Vector3 o=Linear(open,x,y),s=Linear(shaded,x,y);if(o.x<=.001f||o.y<=.001f||o.z<=.001f)return false;ratio=new Vector3(s.x/o.x,s.y/o.y,s.z/o.z);return true;
    }
    // Position of `level` on a sampled profile, the first crossing from its
    // start or from its end; -1 when it never crosses.
    internal static float Crossing(float[] t,float[] r,float level,bool fromEnd){
        int n=t.Length;
        for(int k=1;k<n;k++){int i=fromEnd?n-1-k:k-1,j=i+1;float a=r[i]-level,b=r[j]-level;if(a==0&&b==0)return t[fromEnd?j:i];if(a==0)return t[i];if(b==0)return t[j];if(a*b<0)return t[i]+(t[j]-t[i])*a/(a-b);}
        return -1;
    }
    internal struct EdgeSample {public bool valid;public float position,width,inside,outside;public string reason;}
    // A side edge of a strip shadow: the shadow covers |t|<half across the line
    // origin+along*s. Umbra level from |t|<=.3, open level from half+.5..half+.8
    // on this side; the edge is where the normalised ratio crosses one half
    // (offset from the geometric edge, outward positive) and the width runs
    // from 10 to 90 %. Invalid without contrast, off screen or not monotone.
    internal static EdgeSample MeasureEdge(Picture shaded,Picture open,Vector3 origin,Vector3 along,Vector3 across,float s,int side,float half){
        var e=new EdgeSample{position=-9,width=-1,inside=-1,outside=-1};var centre=origin+along*s;var inner=new List<float>();var outer=new List<float>();
        for(int k=-3;k<=3;k++)if(Ratio(shaded,open,centre+across*(k*.1f),out float r))inner.Add(r);
        for(int k=0;k<=3;k++)if(Ratio(shaded,open,centre+across*(side*(half+.5f+k*.1f)),out float r))outer.Add(r);
        e.inside=Median(inner);e.outside=Median(outer);
        if(inner.Count<5||outer.Count<3){e.reason="off screen";return e;}
        if(e.outside-e.inside<.08f){e.reason="no shadow contrast";return e;}
        const int n=141;var t=new float[n];var q=new float[n];
        for(int k=0;k<n;k++){t[k]=half-.35f+.005f*k;if(!Ratio(shaded,open,centre+across*(side*t[k]),out float r)){e.reason="profile off screen";return e;}q[k]=(r-e.inside)/(e.outside-e.inside);}
        float first=Crossing(t,q,.5f,false),last=Crossing(t,q,.5f,true),low=Crossing(t,q,.1f,false),high=Crossing(t,q,.9f,true);
        if(first<0||last<0){e.reason="no half-level crossing";return e;}
        if(last-first>.03f){e.reason="edge not monotone";return e;}
        e.valid=true;e.position=(first+last)*.5f-half;e.width=low>=0&&high>=0?high-low:-1;return e;
    }
    // Texel coordinates of a world point in the first main-light shadow tile
    // and the texel size (metres) of URP's _MainLightWorldToShadow.
    internal static bool Fit(Picture p,Vector3 world,out double tx,out double ty,out float texel,out string reason){
        tx=ty=0;texel=-1;reason=null;
        if(p.shadow==null||p.shadow.Length==0){reason="unavailable: _MainLightWorldToShadow was not readable after the render";return false;}
        var m=p.shadow[0];float scale=Mathf.Sqrt(m.m00*m.m00+m.m01*m.m01+m.m02*m.m02),width=p.shadowSize.z>0?p.shadowSize.z:p.shadowResolution,height=p.shadowSize.w>0?p.shadowSize.w:p.shadowResolution;
        if(scale<=1e-6f||width<=0||height<=0){reason="unavailable: empty main-light shadow matrix";return false;}
        var uv=m.MultiplyPoint3x4(world);if(uv.x<0||uv.x>1||uv.y<0||uv.y>1){reason="invalid: the box lies outside the shadow map";return false;}
        texel=1/(scale*width);tx=(double)uv.x*width;ty=(double)uv.y*height;return true;
    }
    internal static float MatrixDelta(Picture a,Picture b){if(a.shadow.Length==0||b.shadow.Length==0)return -1;float d=0;for(int i=0;i<16;i++)d=Mathf.Max(d,Mathf.Abs(a.shadow[0][i]-b.shadow[0][i]));return d;}
    // Differing pixels of two pictures: count, largest channel step and box
    // (PNG pixels, top-left origin: x0, y0, x1, y1).
    internal static Pair Compare(Picture a,Picture b){
        var p=new Pair();int x0=int.MaxValue,y0=int.MaxValue,x1=-1,y1=-1;
        for(int i=0;i<a.px.Length;i++){var u=a.px[i];var v=b.px[i];int d=Math.Max(Math.Abs(u.r-v.r),Math.Max(Math.Abs(u.g-v.g),Math.Abs(u.b-v.b)));if(d==0)continue;
            p.differing++;if(d>p.maxDelta)p.maxDelta=d;int x=i%a.w,y=a.h-1-i/a.w;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
        if(p.differing>0)p.box=new[]{x0,y0,x1,y1};return p;
    }
    // Differing pixels in orange (brighter with the step) over the dimmed first picture.
    internal static Color32[] DiffPixels(Picture a,Picture b){
        var px=new Color32[a.px.Length];
        for(int i=0;i<px.Length;i++){var u=a.px[i];var v=b.px[i];int d=Math.Max(Math.Abs(u.r-v.r),Math.Max(Math.Abs(u.g-v.g),Math.Abs(u.b-v.b)));
            if(d>0)px[i]=new Color32(255,(byte)Math.Min(255,64+d*4),0,255);else{byte g=(byte)((.2126f*u.r+.7152f*u.g+.0722f*u.b)*.35f);px[i]=new Color32(g,g,g,255);}}
        return px;
    }
    internal static float Drift(float[] a,float[] b){if(a==null||b==null||a.Length!=b.Length)return -1;float m=0;for(int i=0;i+2<a.Length;i+=3){float x=a[i]-b[i],y=a[i+1]-b[i+1],z=a[i+2]-b[i+2];m=Mathf.Max(m,Mathf.Sqrt(x*x+y*y+z*z));}return m;}
    internal static Vector3 Skinned(Matrix4x4[] m,BoneWeight w,Vector3 v){
        Vector3 p=Vector3.zero;float total=0;
        void Add(int b,float x){if(x<=0||b<0||b>=m.Length)return;p+=m[b].MultiplyPoint3x4(v)*x;total+=x;}
        Add(w.boneIndex0,w.weight0);Add(w.boneIndex1,w.weight1);Add(w.boneIndex2,w.weight2);Add(w.boneIndex3,w.weight3);return total>0?p/total:new Vector3(float.NaN,0,0);
    }
    internal static float Region(Picture p,float y0,float y1){double sum=0;int n=0;for(int y=Mathf.FloorToInt(y0*p.h);y<Mathf.FloorToInt(y1*p.h);y+=3)for(int x=0;x<p.w;x+=5){var c=p.px[y*p.w+x];sum+=(.2126f*c.r+.7152f*c.g+.0722f*c.b)/255f;n++;}return n>0?(float)(sum/n):0;}
    internal static Color Patch(Picture p,int cx,int cy,int r){Color sum=Color.clear;int n=0;for(int y=cy-r;y<=cy+r;y++)for(int x=cx-r;x<=cx+r;x++)if(x>=0&&y>=0&&x<p.w&&y<p.h){sum+=(Color)p.px[y*p.w+x];n++;}return n>0?sum/n:Color.clear;}
    // Mask picture: figures unlit magenta, ball unlit cyan.
    internal static bool FigureMask(Color32 c)=>c.r>170&&c.g<100&&c.b>170;
    internal static bool BallMask(Color32 c)=>c.r<100&&c.g>170&&c.b>170;
    internal static bool All(Picture m,int cx,int cy,int r,Func<Color32,bool> test){for(int y=cy-r;y<=cy+r;y++)for(int x=cx-r;x<=cx+r;x++)if(x<0||y<0||x>=m.w||y>=m.h||!test(m.px[y*m.w+x]))return false;return true;}
    internal static bool None(Picture m,int cx,int cy,int r){for(int y=cy-r;y<=cy+r;y++)for(int x=cx-r;x<=cx+r;x++)if(x<0||y<0||x>=m.w||y>=m.h||FigureMask(m.px[y*m.w+x])||BallMask(m.px[y*m.w+x]))return false;return true;}
    static Bake BakeOf(Picture p){
        var b=new Bake{skins=p.skins,vertices=p.checkedVertices,skinsOff=p.skinsOff,lossyScale=p.lossyScale,median=p.bakeMedian,max=p.bakeMax,round1Median=p.round1Median,round1Max=p.round1Max};
        b.status=p.skins==0?"unavailable: no drawn skins":p.checkedVertices==0?"unavailable: the skin data could not be read for the CPU check":p.skinsOff==0?"every copy matches the CPU skinning of the current bones (median within 5 mm)":p.skinsOff+" of "+p.skins+" copies differ from the CPU skinning of the current bones";
        return b;
    }
    static Pair NotRun()=>new Pair{differing=-1,maxDelta=-1};

    public static string Evidence(string repository,string outputFolder=null){
        if(SystemInfo.graphicsDeviceType==GraphicsDeviceType.Null)throw new InvalidOperationException("Match lighting evidence needs a graphics device");
        var bridge=UnityEngine.Object.FindAnyObjectByType<ProbeBridge>()??throw new InvalidOperationException("ProbeBridge is missing in the open scene");
        var flags=BindingFlags.NonPublic|BindingFlags.Instance;var camera=Camera.main;bool log=Debug.unityLogger.logEnabled;int sequence=1;
        object Field(string n)=>typeof(ProbeBridge).GetField(n,flags).GetValue(bridge);
        Light Sun()=>(Light)typeof(ProbeBridge).GetMethod("FindSun",flags).Invoke(bridge,null);
        var raw=File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json"));
        var folder=Path.Combine(repository,outputFolder??"outputs/3d-quality/unity/match-lighting");Directory.CreateDirectory(folder);
        var shots=new List<Shot>();var cases=new List<CaseEvidence>();var edges=new List<EdgeRun>();var strengths=new List<Strength>();string comparison=null;
        bool linear=QualitySettings.activeColorSpace==ColorSpace.Linear;Decode=Table(linear);bool asyncBefore=UnityEditor.ShaderUtil.allowAsyncCompilation;
        var skinData=new Dictionary<Mesh,(Vector3[] rest,BoneWeight[] weights,Matrix4x4[] bind)>();var chests=new Dictionary<Transform,Transform>();
        Material maskFigure=null,maskBall=null,boxMaterial=null;GameObject box=null;
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
            var world=(Transform)Field("world");if(world!=null)UnityEngine.Object.DestroyImmediate(world.gameObject);chests.Clear();Send(new WorldCommand{kind="load",config=config});
            if(bridge.Look.ToString().ToLowerInvariant()!=look||bridge.ReducedQuality!=(quality=="reduced"))throw new InvalidOperationException("The "+look+" "+quality+" fixture was not loaded");
            return config;
        }
        void Show(WorldConfig config,bool close,Vector3 position,Vector3 target,float fov,double clock){
            var frame=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(config.initial));frame.sequence=++sequence;frame.clock=clock;frame.phase="paused";frame.offside=null;
            Arrange(frame,close);frame.camera=new WorldCamera{position=new double[]{position.x,position.y,position.z},target=new double[]{target.x,target.y,target.z},fov=fov};
            Send(new WorldCommand{kind="frame",frame=frame});
        }
        // Every drawn skin, in hierarchy order (pose comparisons pair them by index).
        List<SkinnedMeshRenderer> Skins(){var list=new List<SkinnedMeshRenderer>();foreach(var skin in UnityEngine.Object.FindObjectsByType<SkinnedMeshRenderer>())if(skin.enabled&&skin.gameObject.activeInHierarchy&&skin.sharedMesh!=null)list.Add(skin);list.Sort((x,y)=>string.CompareOrdinal(Place(x.transform),Place(y.transform)));return list;}
        void ReadBones(SkinnedMeshRenderer skin){foreach(var bone in skin.bones)if(bone!=null)_=bone.position;if(skin.rootBone!=null)_=skin.rootBone.position;}
        // The copy as placed, and as the earlier captures placed it, against the
        // same vertices skinned on the CPU from the current bone matrices
        // (every 23rd vertex, up to four weights); per-skin medians.
        void Check(SkinnedMeshRenderer skin,Mesh baked,List<float> placed,List<float> round1,List<float> perSkin){
            var mesh=skin.sharedMesh;
            if(!skinData.TryGetValue(mesh,out var data)){try{data=(mesh.vertices,mesh.boneWeights,mesh.bindposes);}catch(Exception){data=(null,null,null);}skinData[mesh]=data;}
            var v=baked.vertices;var bones=skin.bones;
            if(data.rest==null||data.weights==null||data.bind==null||data.rest.Length==0||data.weights.Length!=data.rest.Length||v.Length!=data.rest.Length||bones.Length>data.bind.Length)return;
            var m=new Matrix4x4[bones.Length];for(int b=0;b<bones.Length;b++)m[b]=bones[b]!=null?bones[b].localToWorldMatrix*data.bind[b]:Matrix4x4.zero;
            var origin=skin.transform.position;var turn=skin.transform.rotation;var scaled=skin.transform.localToWorldMatrix;var mine=new List<float>();
            for(int i=0;i<v.Length;i+=23){var x=Skinned(m,data.weights[i],data.rest[i]);if(float.IsNaN(x.x))continue;float d=Vector3.Distance(origin+turn*v[i],x);placed.Add(d);mine.Add(d);round1.Add(Vector3.Distance(scaled.MultiplyPoint3x4(v[i]),x));}
            if(mine.Count>0)perSkin.Add(Median(mine));
        }
        Picture Capture(int w,int h,bool reduced,Options o){
            var pic=new Picture{w=w,h=h};var skins=Skins();var meshes=new Mesh[skins.Count];var made=new List<GameObject>();var toggled=new List<(Renderer r,bool on,Material material)>();
            var data=camera.GetUniversalAdditionalCameraData();bool post=data.renderPostProcessing;var placed=new List<float>();var round1=new List<float>();var perSkin=new List<float>();
            var urp=GraphicsSettings.currentRenderPipeline as UniversalRenderPipelineAsset;pic.shadowResolution=urp!=null?urp.mainLightShadowmapResolution:0;pic.skins=skins.Count;if(skins.Count>0)pic.lossyScale=skins[0].transform.lossyScale.x;
            void Toggle(Renderer r,bool on,Material material=null){if(r==null)return;toggled.Add((r,r.enabled,r.sharedMaterial));r.enabled=on;if(material!=null)r.sharedMaterial=material;}
            try{
                // The earlier bake: every figure baked before any bone is read
                // (one world hierarchy, so the first read syncs them all).
                if(!o.sync&&o.figures!=Figures.Hidden)for(int i=0;i<skins.Count;i++){meshes[i]=new Mesh();skins[i].BakeMesh(meshes[i],false);}
                for(int i=0;i<skins.Count;i++){
                    var skin=skins[i];if(o.figures==Figures.Hidden){skin.enabled=false;continue;}
                    ReadBones(skin);if(meshes[i]==null){meshes[i]=new Mesh();skin.BakeMesh(meshes[i],false);}
                    if(o.check)Check(skin,meshes[i],placed,round1,perSkin);
                    var go=new GameObject("D6 lighting capture",typeof(MeshFilter),typeof(MeshRenderer));made.Add(go);go.layer=skin.gameObject.layer;
                    if(o.round1Placement)go.transform.SetParent(skin.transform,false);else go.transform.SetPositionAndRotation(skin.transform.position,skin.transform.rotation);
                    go.GetComponent<MeshFilter>().sharedMesh=meshes[i];var r=go.GetComponent<MeshRenderer>();
                    r.sharedMaterials=o.figures==Figures.Mask?Fill(maskFigure,skin.sharedMaterials.Length):skin.sharedMaterials;
                    r.receiveShadows=skin.receiveShadows;r.lightProbeUsage=skin.lightProbeUsage;r.reflectionProbeUsage=skin.reflectionProbeUsage;r.probeAnchor=skin.probeAnchor;r.renderingLayerMask=skin.renderingLayerMask;
                    r.shadowCastingMode=o.figures==Figures.ShadowOnly&&skin.shadowCastingMode!=ShadowCastingMode.Off?ShadowCastingMode.ShadowsOnly:skin.shadowCastingMode;
                    if(o.figures==Figures.ShadowOnly&&skin.shadowCastingMode==ShadowCastingMode.Off)r.enabled=false;
                    // Per-renderer and per-material property blocks travel with the copy.
                    if(o.figures!=Figures.Mask&&skin.HasPropertyBlock()){var block=new MaterialPropertyBlock();skin.GetPropertyBlock(block);if(!block.isEmpty)r.SetPropertyBlock(block);
                        for(int k=0;k<skin.sharedMaterials.Length;k++){block.Clear();skin.GetPropertyBlock(block,k);if(!block.isEmpty)r.SetPropertyBlock(block,k);}}
                    skin.enabled=false;
                }
                var ballView=(Transform)Field("ballView");var ballShadow=(Transform)Field("ballShadow");var twin=ballView!=null?ballView.Find(ProbeBridge.BallCasterName):null;
                if(!o.ball){Toggle(ballView.GetComponent<Renderer>(),false);if(twin!=null)Toggle(twin.GetComponent<Renderer>(),false);Toggle(ballShadow.GetComponent<Renderer>(),false);}
                else if(o.figures==Figures.Mask){var r=ballView.GetComponent<Renderer>();Toggle(r,r.enabled,maskBall);}
                if(!o.blobs)foreach(var ring in (List<Transform>)Field("rings"))Toggle(ring.GetComponent<Renderer>(),false);
                if(box!=null)Toggle(box.GetComponent<Renderer>(),o.occluder);
                data.renderPostProcessing=o.grade&&o.figures!=Figures.Mask;pic.compiling=UnityEditor.ShaderUtil.anythingCompiling;
                // MSAA as the page's quality: 4x standard, none reduced.
                var rt=RenderTexture.GetTemporary(new RenderTextureDescriptor(w,h,RenderTextureFormat.ARGB32,24){msaaSamples=reduced?1:4,sRGB=true});float aspect=camera.aspect;
                try{camera.aspect=(float)w/h;camera.targetTexture=rt;camera.Render();pic.viewProjection=camera.projectionMatrix*camera.worldToCameraMatrix;}
                finally{camera.targetTexture=null;camera.aspect=aspect;}
                var previous=RenderTexture.active;RenderTexture.active=rt;pic.tex=new Texture2D(w,h,TextureFormat.RGB24,false);pic.tex.ReadPixels(new Rect(0,0,w,h),0,0);pic.tex.Apply();RenderTexture.active=previous;RenderTexture.ReleaseTemporary(rt);
                pic.px=pic.tex.GetPixels32();
                var matrices=new List<Matrix4x4>();try{Shader.GetGlobalMatrixArray("_MainLightWorldToShadow",matrices);}catch(Exception){matrices.Clear();}pic.shadow=matrices.ToArray();pic.shadowSize=Shader.GetGlobalVector("_MainLightShadowmapSize");
            }finally{
                data.renderPostProcessing=post;
                for(int i=toggled.Count-1;i>=0;i--){var t=toggled[i];if(t.r==null)continue;t.r.enabled=t.on;if(t.r.sharedMaterial!=t.material)t.r.sharedMaterial=t.material;}
                foreach(var skin in skins)if(skin!=null)skin.enabled=true;
                foreach(var go in made)UnityEngine.Object.DestroyImmediate(go);foreach(var mesh in meshes)if(mesh!=null)UnityEngine.Object.DestroyImmediate(mesh);
            }
            pic.checkedVertices=placed.Count;pic.bakeMedian=Median(placed);pic.bakeMax=Max(placed);pic.round1Median=Median(round1);pic.round1Max=Max(round1);foreach(var d in perSkin)if(d>.005f)pic.skinsOff++;
            return pic;
        }
        void Save(Picture p,string name){File.WriteAllBytes(Path.Combine(folder,name),p.tex.EncodeToPNG());}
        string SaveDiff(Picture a,Picture b,string name){var tex=new Texture2D(a.w,a.h,TextureFormat.RGB24,false);try{tex.SetPixels32(DiffPixels(a,b));tex.Apply();File.WriteAllBytes(Path.Combine(folder,name),tex.EncodeToPNG());}finally{UnityEngine.Object.DestroyImmediate(tex);}return name;}
        float[] Pose(){var list=new List<float>();foreach(var skin in Skins())foreach(var bone in skin.bones)if(bone!=null){var q=bone.position;list.Add(q.x);list.Add(q.y);list.Add(q.z);}return list.ToArray();}
        Vector3 Chest(Transform actor){if(!chests.TryGetValue(actor,out var spine)){spine=null;foreach(var t in actor.GetComponentsInChildren<Transform>())if(t.name=="mixamorig:Spine2"){spine=t;break;}chests[actor]=spine;}return spine!=null?spine.position:actor.position+Vector3.up*1.74f;}
        Material Unlit(Color c){var m=new Material(Shader.Find("Universal Render Pipeline/Unlit"));m.SetColor("_BaseColor",c);if(m.HasProperty("_Cull"))m.SetFloat("_Cull",0);return m;}
        // Readability on masked pixels; contact and cast shade registered turf only.
        void Measure(Shot shot,WorldConfig config,Picture n,Picture shadows,Picture bare,Picture mask,Vector2 way){
            shot.turf=Region(n,.3f,.6f);shot.sky=Region(n,.88f,1);
            var actors=(List<Transform>)Field("actors");var along=new Vector3(way.x,0,way.y);
            var right=new Vector2(camera.transform.right.x,camera.transform.right.z).normalized;if(Vector2.Dot(right,way)>0)right=-right;var beside=new Vector3(right.x,0,right.y);
            var roots=new List<Vector3>();foreach(var a in actors)roots.Add(new Vector3(a.position.x,0,a.position.z));
            bool Free(Vector3 at,int own){for(int j=0;j<roots.Count;j++)if(j!=own&&(roots[j]-at).sqrMagnitude<.95f*.95f)return false;return true;}
            var team=new List<float>();var contact=new List<float>();var cast=new List<float>();var core=new List<float>();
            for(int i=0;i<actors.Count&&i<config.initial.players.Length;i++){
                var id=config.initial.players[i].id;if(Array.Find(config.players,x=>x.id==id)?.keeper!=false)continue;var ground=roots[i];
                if(Pixel(n,Chest(actors[i]),out float cx,out float cy)&&Pixel(n,ground+beside*1.2f,out float tx,out float ty)&&All(mask,Mathf.RoundToInt(cx),Mathf.RoundToInt(cy),1,FigureMask)&&None(mask,Mathf.RoundToInt(tx),Mathf.RoundToInt(ty),2)){
                    team.Add(Gap(Patch(n,Mathf.RoundToInt(cx),Mathf.RoundToInt(cy),1),Patch(n,Mathf.RoundToInt(tx),Mathf.RoundToInt(ty),2)));shot.teamValid++;}
                else shot.teamInvalid++;
                var ring=new List<float>();for(int k=0;k<8;k++){var at=ground+new Vector3(Mathf.Cos(k*Mathf.PI/4),0,Mathf.Sin(k*Mathf.PI/4))*.3f;if(Free(at,i)&&Ratio(shadows,bare,at,out float r))ring.Add(r);}
                if(ring.Count>=5){contact.Add(Median(ring));shot.contactValid++;}else shot.contactInvalid++;
                var line=new List<float>();for(int k=0;k<6;k++){var at=ground+along*(1+.1f*k);if(Free(at,i)&&Ratio(shadows,bare,at,out float r))line.Add(r);}
                if(line.Count>=4){cast.Add(Median(line));core.Add(Min(line));shot.castValid++;}else shot.castInvalid++;
            }
            shot.teamVsTurf=Mean(team);shot.contactShade=Median(contact);shot.castShade=Median(cast);shot.castCore=Median(core);
            var ballView=(Transform)Field("ballView");var centre=ballView.position;
            if(!ballView.gameObject.activeInHierarchy)shot.ballSample="invalid: ball not shown";
            else if(!Pixel(n,centre,out float bx,out float by)||!Pixel(n,new Vector3(centre.x+.6f,0,centre.z+.6f),out float ux,out float uy))shot.ballSample="invalid: off screen";
            else if(!All(mask,Mathf.RoundToInt(bx),Mathf.RoundToInt(by),1,BallMask)||!None(mask,Mathf.RoundToInt(ux),Mathf.RoundToInt(uy),2))shot.ballSample="invalid: the mask shows no ball or no open turf there";
            else{shot.ballVsTurf=Gap(Patch(n,Mathf.RoundToInt(bx),Mathf.RoundToInt(by),0),Patch(n,Mathf.RoundToInt(ux),Mathf.RoundToInt(uy),2));shot.ballSample="valid";}
        }
        Shot Take(WorldConfig config,CaseEvidence summary,string look,string quality,string mode,int w,int h,Vector2 way){
            bool close=mode=="close",reduced=quality=="reduced",primary=mode=="follow"&&w==1280;Vector3 position,target;float fov;
            if(close){position=new Vector3(.5f,2.4f,8.8f);target=new Vector3(.3f,1.25f,.4f);fov=36;}
            else{var aim=SmallViewDiagnostics.Aim(new Vector3(Ball.x,0,Ball.z),Ball.y,mode,(float)w/h);position=aim.position;target=aim.target;fov=aim.fov;}
            Show(config,close,position,target,fov,10+sequence*.05);
            var shot=new Shot{look=look,quality=quality,mode=mode,size=w+"x"+h};var stem="lighting-"+look+"-"+quality+"-"+mode+"-"+shot.size;shot.file=stem+".png";
            var pictures=new List<Picture>();Picture Grab(Options o){var p=Capture(w,h,reduced,o);pictures.Add(p);shot.compiling|=p.compiling;return p;}
            try{
                var u=primary?Grab(new Options{sync=false,check=true}):null;
                var a=Grab(new Options{check=primary});var b=Grab(new Options());var c=Grab(new Options());
                shot.ab=Compare(a,b);shot.bc=Compare(b,c);bool same=shot.ab.differing==0&&shot.bc.differing==0;shot.repeat=same?"identical":"different";
                if(!same||primary){
                    if(shot.ab.differing>0)Save(b,stem+"-b.png");if(shot.bc.differing>0)Save(c,stem+"-c.png");
                    shot.ab.diff=SaveDiff(a,b,stem+"-diff-ab.png");shot.bc.diff=SaveDiff(b,c,stem+"-diff-bc.png");
                }
                if(primary){
                    summary.unsynced=BakeOf(u);summary.synced=BakeOf(a);summary.unsyncedVsSynced=Compare(u,a);
                    if(summary.unsyncedVsSynced.differing>0){Save(u,stem+"-unsynced.png");summary.unsyncedVsSynced.diff=SaveDiff(u,a,stem+"-diff-unsynced-a.png");}
                    if(look!="legacy"){
                        Shader.DisableKeyword(ProbeBridge.LookKeyword);
                        try{var x=Grab(new Options());var y=Grab(new Options());var z=Grab(new Options());summary.shaderControlAb=Compare(x,y);summary.shaderControlBc=Compare(y,z);
                            summary.shaderControl="the follow picture three times with the look keyword off: Release 130 shader code under the received light, pipeline and casters";
                            if(summary.shaderControlAb.differing>0||summary.shaderControlBc.differing>0){Save(x,stem+"-keyword-off-a.png");summary.shaderControlAb.diff=SaveDiff(x,y,stem+"-keyword-off-diff-ab.png");summary.shaderControlBc.diff=SaveDiff(y,z,stem+"-keyword-off-diff-bc.png");}}
                        finally{Shader.EnableKeyword(ProbeBridge.LookKeyword);}
                    }
                }
                // The earlier capture placement once, for comparison: copies parented under the scaled skin.
                if(look=="legacy"&&quality=="standard"&&close){var old=Grab(new Options{round1Placement=true,check=true});Save(old,stem+"-round1-placement.png");
                    comparison=stem+"-round1-placement.png: the copies parented under the scaled skin as in the earlier captures (lossy scale "+old.lossyScale.ToString("0.###",CultureInfo.InvariantCulture)+"); distance to the CPU-skinned figure: median "+old.round1Median.ToString("0.###",CultureInfo.InvariantCulture)+" m, max "+old.round1Max.ToString("0.###",CultureInfo.InvariantCulture)+" m, against "+old.bakeMedian.ToString("0.####",CultureInfo.InvariantCulture)+" m for the placement used in "+shot.file;}
                var shadows=Grab(new Options{figures=Figures.ShadowOnly,ball=false});var bare=Grab(new Options{figures=Figures.Hidden,blobs=false,ball=false});var mask=Grab(new Options{figures=Figures.Mask});
                Measure(shot,config,a,shadows,bare,mask,way);Save(a,shot.file);
                summary.shots++;if(same)summary.identicalShots++;summary.compiling|=shot.compiling;
            }finally{foreach(var p in pictures)p.Dispose();}
            return shot;
        }
        // The box's side edges on open turf while the follow camera pans in
        // sub-texel steps over one paused pose; warm-up frames are documented.
        EdgeRun Edges(WorldConfig config,string look,string quality,Vector2 way){
            bool reduced=quality=="reduced";var along=new Vector3(way.x,0,way.y);var across=new Vector3(-way.y,0,way.x);
            var run=new EdgeRun{look=look,quality=quality,steps=PanSteps,warmup=Warmup,stepMetres=PanStep,occluder="shadow-only box "+(2*BoxHalf).ToString(CultureInfo.InvariantCulture)+" x "+BoxDepth.ToString(CultureInfo.InvariantCulture)+" x "+BoxHeight.ToString(CultureInfo.InvariantCulture)+" m (across x along x high) on open turf at ("+BoxAt.x.ToString(CultureInfo.InvariantCulture)+", "+BoxAt.z.ToString(CultureInfo.InvariantCulture)+"); lines at 0.55, 0.8 and 1.05 m down the key light, both side edges"};
            var aim=SmallViewDiagnostics.Aim(new Vector3(Ball.x,0,Ball.z),Ball.y,"follow",16f/9);float[] pose=null;bool comparable=true;run.warmupPoseDrift=0;run.poseDrift=0;
            for(int k=0;k<Warmup;k++){Show(config,false,aim.position,aim.target,aim.fov,500);var now=Pose();if(pose!=null){float d=Drift(pose,now);if(d<0)comparable=false;else run.warmupPoseDrift=Mathf.Max(run.warmupPoseDrift,d);}pose=now;}
            float[] levels={.55f,.8f,1.05f};var lines=new EdgeLine[6];var positions=new List<float>[6];var widths=new List<float>[6];
            for(int j=0;j<6;j++){lines[j]=new EdgeLine{s=levels[j/2],side=j%2==0?-1:1};positions[j]=new List<float>();widths[j]=new List<float>();}
            var umbra=new List<float>();var fx=new List<float>();var fy=new List<float>();double tx0=0,ty0=0;bool fit=true;string why=null;float frac=0,mismatch=0,texel=-1;
            for(int k=0;k<=PanSteps;k++){
                var shift=Vector3.right*(k*PanStep);Show(config,false,aim.position+shift,aim.target+shift,aim.fov,500);
                var now=Pose();float d=Drift(pose,now);if(d<0)comparable=false;else run.poseDrift=Mathf.Max(run.poseDrift,d);pose=now;
                var lit=Capture(1280,720,reduced,new Options{occluder=true});var open=Capture(1280,720,reduced,new Options());
                try{
                    if(fit&&Fit(lit,BoxAt,out double tx,out double ty,out float size,out why)){
                        if(k==0){tx0=tx;ty0=ty;texel=size;}
                        double dx=tx-tx0-Math.Round(tx-tx0),dy=ty-ty0-Math.Round(ty-ty0);frac=Mathf.Max(frac,(float)Math.Max(Math.Abs(dx),Math.Abs(dy)));
                        fx.Add((float)(tx-Math.Floor(tx)));fy.Add((float)(ty-Math.Floor(ty)));mismatch=Mathf.Max(mismatch,MatrixDelta(lit,open));
                    }else fit=false;
                    for(int j=0;j<6;j++){var e=MeasureEdge(lit,open,BoxAt,along,across,lines[j].s,(int)lines[j].side,BoxHalf);
                        if(e.valid){lines[j].valid++;positions[j].Add(e.position);if(e.width>=0)widths[j].Add(e.width);}else{lines[j].invalid++;positions[j].Add(-9);}
                        if(j%2==0&&e.inside>0)umbra.Add(e.inside);}
                }finally{lit.Dispose();open.Dispose();}
            }
            int usable=0;float worst=-1;var allWidths=new List<float>();
            for(int j=0;j<6;j++){var valid=positions[j].FindAll(q=>q>-8);lines[j].positions=positions[j].ToArray();lines[j].offset=valid.Count>0?Median(valid):-9;
                foreach(var v in valid)lines[j].maxDeviation=Mathf.Max(lines[j].maxDeviation,Mathf.Abs(v-lines[j].offset));lines[j].width=Median(widths[j]);if(lines[j].width>=0)allWidths.Add(lines[j].width);
                if(lines[j].valid>=(PanSteps+1)/2){usable++;worst=Mathf.Max(worst,lines[j].maxDeviation);}}
            run.lines=lines;run.umbraGraded=Median(umbra);run.maxDeviation=worst;run.width=Median(allWidths);
            if(fit){run.texelMetres=texel;run.maxFracDrift=frac;run.matrixMismatch=mismatch;run.fracX=fx.ToArray();run.fracY=fy.ToArray();run.fit="registered: texel coordinates of the box's ground point in the main-light shadow map at every step";}
            else{run.fit=why;run.fracX=new float[0];run.fracY=new float[0];}
            run.maxDeviationTexels=worst>=0&&run.texelMetres>0?worst/run.texelMetres:-1;
            if(!comparable){run.poseDrift=-1;run.warmupPoseDrift=-1;}
            run.status=(usable==0?"invalid: no side edge measurable in at least half of the steps":usable==6?"all 6 side edges measurable":usable+" of 6 side edges measurable")+(fit?"":"; shadow-map registration "+why)+(comparable?"":"; pose not comparable between steps");
            return run;
        }
        // Umbra of the box seen from straight above, ungraded against the key
        // light share it should remove, graded as shown, and the penumbra.
        Strength Umbra(string look,string quality,Vector2 way){
            bool reduced=quality=="reduced";var along=new Vector3(way.x,0,way.y);var across=new Vector3(-way.y,0,way.x);var result=new Strength{look=look,quality=quality};
            var t=camera.transform;var savedPosition=t.position;var savedRotation=t.rotation;float savedFov=camera.fieldOfView;var pictures=new List<Picture>();
            Picture Grab(Options o){var p=Capture(1280,720,reduced,o);pictures.Add(p);return p;}
            try{
                t.SetPositionAndRotation(BoxAt+along*.75f+Vector3.up*10,Quaternion.LookRotation(Vector3.down,along));camera.fieldOfView=20;
                var lit=Grab(new Options{occluder=true,grade=false});var open=Grab(new Options{grade=false});var litGraded=Grab(new Options{occluder=true});var openGraded=Grab(new Options());
                var ratios=new List<float>();var graded=new List<float>();var red=new List<float>();var green=new List<float>();var blue=new List<float>();var control=new List<float>();
                for(int i=0;i<6;i++){float s=.45f+.15f*i;
                    for(int j=0;j<7;j++){var at=BoxAt+along*s+across*(-.45f+.15f*j);if(Ratio(lit,open,at,out float q)&&RatioRgb(lit,open,at,out var rgb)){ratios.Add(q);red.Add(rgb.x);green.Add(rgb.y);blue.Add(rgb.z);}if(Ratio(litGraded,openGraded,at,out float g))graded.Add(g);}
                    foreach(float side in new[]{-1.9f,-1.5f,1.5f,1.9f})if(Ratio(lit,open,BoxAt+along*s+across*side,out float q))control.Add(Mathf.Abs(1-q));}
                result.umbraValid=ratios.Count;result.controlValid=control.Count;result.umbra=Median(ratios);result.umbraGraded=Median(graded);result.umbraSpread=ratios.Count>0?Max(ratios)-Min(ratios):-1;result.controlDeviation=Max(control);
                result.measured=new[]{Median(red),Median(green),Median(blue)};
                var penumbra=new List<float>();foreach(int side in new[]{-1,1}){var e=MeasureEdge(lit,open,BoxAt,along,across,.8f,side,BoxHalf);if(e.valid&&e.width>=0)penumbra.Add(e.width);}result.penumbra=Median(penumbra);
                if(Fit(lit,BoxAt,out _,out _,out float texel,out _))result.texelMetres=texel;
                // Turf (D6Pitch, no wrap): key*ndl*shadow+sky, so the umbra keeps
                // (key*ndl*(1-strength)+sky)/(key*ndl+sky) per channel.
                var sun=Sun();
                if(linear&&sun!=null){var key=sun.color.linear*sun.intensity;float ndl=Mathf.Max(0,-sun.transform.forward.y),strength=sun.shadowStrength;var sky=new Color[1];RenderSettings.ambientProbe.Evaluate(new[]{Vector3.up},sky);
                    float E(float l,float a)=>(l*ndl*(1-strength)+a)/(l*ndl+a);result.expected=new[]{E(key.r,sky[0].r),E(key.g,sky[0].g),E(key.b,sky[0].b)};}
                else result.expected=new float[0];
                result.status=(ratios.Count>=30&&control.Count>=16?"valid":"insufficient samples ("+ratios.Count+" umbra, "+control.Count+" control)")+(linear?"":"; gamma colour space: no linear comparison");
            }finally{t.SetPositionAndRotation(savedPosition,savedRotation);camera.fieldOfView=savedFov;foreach(var p in pictures)p.Dispose();}
            return result;
        }
        GameObject MakeBox(Vector2 way){
            var go=GameObject.CreatePrimitive(PrimitiveType.Cube);go.name="D6 lighting shadow box";var collider=go.GetComponent<Collider>();if(collider!=null)UnityEngine.Object.DestroyImmediate(collider);
            go.transform.SetPositionAndRotation(BoxAt+Vector3.up*(BoxHeight/2),Quaternion.LookRotation(new Vector3(way.x,0,way.y)));go.transform.localScale=new Vector3(2*BoxHalf,BoxHeight,BoxDepth);
            // The figures' caster (WorldKit), shadow-only: never drawn into a picture.
            boxMaterial=new Material(bridge.matchKitShader);var r=go.GetComponent<MeshRenderer>();r.sharedMaterial=boxMaterial;r.shadowCastingMode=ShadowCastingMode.ShadowsOnly;r.receiveShadows=false;r.enabled=false;return go;
        }
        void DropBox(){if(box!=null)UnityEngine.Object.DestroyImmediate(box);box=null;if(boxMaterial!=null)UnityEngine.Object.DestroyImmediate(boxMaterial);boxMaterial=null;}
        try{
            UnityEditor.ShaderUtil.allowAsyncCompilation=false;maskFigure=Unlit(new Color(1,0,1));maskBall=Unlit(new Color(0,1,1));
            // Warm-up (documented, not measured): the first world of a fresh Editor scene can render before its materials settle.
            {var warm=Load("legacy","standard");var aim=SmallViewDiagnostics.Aim(new Vector3(Ball.x,0,Ball.z),Ball.y,"follow",16f/9);Show(warm,false,aim.position,aim.target,aim.fov,10);Capture(320,180,false,new Options()).Dispose();}
            foreach(var look in new[]{"legacy","night","day"})foreach(var quality in new[]{"standard","reduced"}){
                var config=Load(look,quality);var key=Sun().transform.forward;var way=new Vector2(key.x,key.z).normalized;
                var summary=new CaseEvidence{look=look,quality=quality,shaderControl=look=="legacy"?"legacy is the control: Release 130 shader code and settings":"",shaderControlAb=NotRun(),shaderControlBc=NotRun(),unsyncedVsSynced=NotRun()};
                foreach(var mode in Shots)shots.Add(Take(config,summary,look,quality,mode,1280,720,way));
                if(quality=="reduced")shots.Add(Take(config,summary,look,quality,"follow",931,448,way));
                summary.repeatIdentical=summary.identicalShots==summary.shots;
                box=MakeBox(way);try{edges.Add(Edges(config,look,quality,way));strengths.Add(Umbra(look,quality,way));}finally{DropBox();}
                cases.Add(summary);
            }
        }finally{
            UnityEditor.ShaderUtil.allowAsyncCompilation=asyncBefore;DropBox();foreach(var m in new[]{maskFigure,maskBall})if(m!=null)UnityEngine.Object.DestroyImmediate(m);
            // Dispose of the last match (graphs, world, materials), then give the light back.
            try{typeof(ProbeBridge).GetMethod("Clear",flags).Invoke(bridge,null);var used=(List<Material>)Field("materials");foreach(var m in used)if(m!=null)UnityEngine.Object.DestroyImmediate(m);used.Clear();}catch(Exception e){Debug.LogException(e);}
            typeof(ProbeBridge).GetMethod("RestoreProbeLighting",flags).Invoke(bridge,null);camera.targetTexture=null;
        }
        bool all=true;var flagsText=new List<string>();foreach(var c in cases){all&=c.repeatIdentical;flagsText.Add(c.look+"-"+c.quality+" "+c.identicalShots+"/"+c.shots);}
        var report=new EvidenceReport{schema="d6-match-lighting-evidence-2",sourceId=ProbeBuildIdentity.SourceId,unity=Application.unityVersion,device=SystemInfo.graphicsDeviceType.ToString(),colorSpace=QualitySettings.activeColorSpace.ToString(),
            asyncCompilationBefore=asyncBefore,repeatIdentical=all,cases=cases.ToArray(),shots=shots.ToArray(),edges=edges.ToArray(),strengths=strengths.ToArray(),placementComparison=comparison,
            harness="Figures drawn as baked copies: all bones read before the bake, BakeMesh(useScale:false) placed at the skin's position and rotation (it carries the 1.45 figure scale; the earlier captures parented it under the scaled skin). Asynchronous shader compilation off during the run (value before: asyncCompilationBefore). Every picture captured three times (a, b, c) with nothing in between; cases[].unsynced is the follow picture baked before any bone read (the earlier capture), cases[].synced the same picture as used; both compare the copies with a CPU skinning of the current bones (metres). Legacy is the harness control; night and day also repeat the follow picture with the look keyword off (shaderControl). Paired pictures and diff images (orange: differing pixels) are written when a pair differs and always for the 1280x720 follow picture. repeat flags describe this run only.",
            note="Paused display-only layout of the contract fixture at GER-2 through ProbeBridge.WorldCommand; cameras from SmallViewDiagnostics.Aim (near 60) and a close contact camera. turf and sky: mean sRGB luma (.2126/.7152/.0722) of image bands. teamVsTurf: sRGB distance between the chest (Spine2 bone) and open turf 1.2 m beside, only where the mask picture shows the figure and open turf; ballVsTurf likewise. contactShade (0.3 m around the root) and castShade/castCore (median/minimum 1.0-1.5 m down the key light) are linear-luminance ratios of the picture with shadow-only figures and their blobs over the picture without figures, blobs and ball, medians over field players; samples within 0.95 m of another figure are invalid and counted. Pair: differing pixel count, largest channel step, box x0,y0,x1,y1 in PNG pixels (top-left). edges: a shadow-only box, follow camera panned in 1.5 cm steps at one paused pose after documented warm-up frames; per side edge the offset of the half level from the geometric edge (m, outward positive, -9 = invalid at that step), its largest deviation over the steps and the 10-90 % width; maxFracDrift is the largest change of the box's texel-coordinate fractions in URP's _MainLightWorldToShadow (0 for a fit that keeps its texel grid). strengths: top-down camera over the same box, umbra and lit-control ratios ungraded (linear) and graded, expected per channel (key*ndl*(1-shadowStrength)+sky)/(key*ndl+sky). Editor pictures with baked skinning, not WebGL or device evidence."};
        File.WriteAllText(Path.Combine(folder,"match-lighting-evidence.json"),JsonUtility.ToJson(report,true));
        return "shots="+shots.Count+" repeatIdentical="+all+" ("+string.Join(", ",flagsText)+") edges="+edges.Count+" strengths="+strengths.Count+" device="+SystemInfo.graphicsDeviceType;
    }
}
}
#endif

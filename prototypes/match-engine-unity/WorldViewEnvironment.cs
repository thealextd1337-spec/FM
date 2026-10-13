using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
namespace Doppel6.Probe {
// Floodlight stadium for the club-world match view. Purely presentational:
// nothing here reads or changes positions, events, the clock or the ball.
public partial class ProbeBridge {
    class LightingDefaults {public AmbientMode mode;public Color flat;public float intensity;public SphericalHarmonicsL2 probe;public Quaternion sunRotation;public Color sunColor,background;public float sunIntensity,shadowStrength,far;public LightShadows shadows;public bool msaa;public int shadowResolution,pipelineMsaa;public float shadowDistance;}
    LightingDefaults lightingDefaults;Light sun;Volume matchVolume,replayVolume;VolumeProfile matchProfile,replayProfile;Bloom matchBloom;
    // Reduced: no MSAA, 1024 hard shadows over 70 m, no bloom, fewer stadium
    // details. Chosen by the page for touch devices; without that field by
    // Unity's mobile platform flag.
    public bool ReducedQuality {get;private set;}
    readonly bool[] standShown={true,true,true,true};
    readonly List<Texture2D> stadiumTextures=new List<Texture2D>();
    readonly Transform[] standSides=new Transform[4];Vector2 standHalf;

    static readonly int NightId=Shader.PropertyToID("_D6Night"),NightRimId=Shader.PropertyToID("_D6NightRim"),NightRimColorId=Shader.PropertyToID("_D6NightRimColor");
    Light FindSun(){if(sun!=null)return sun;foreach(var light in FindObjectsByType<Light>())if(light.type==LightType.Directional){sun=light;break;}return sun;}

    void ApplyMatchLighting(){
        var light=FindSun();var camera=Camera.main;var urp=GraphicsSettings.currentRenderPipeline as UniversalRenderPipelineAsset;
        ReducedQuality=worldView?.Config.quality=="reduced"||string.IsNullOrEmpty(worldView?.Config.quality)&&Application.isMobilePlatform;
        if(lightingDefaults==null)lightingDefaults=new LightingDefaults{shadowResolution=urp!=null?urp.mainLightShadowmapResolution:0,pipelineMsaa=urp!=null?urp.msaaSampleCount:1,shadowDistance=urp!=null?urp.shadowDistance:0,mode=RenderSettings.ambientMode,flat=RenderSettings.ambientLight,intensity=RenderSettings.ambientIntensity,probe=RenderSettings.ambientProbe,sunRotation=light!=null?light.transform.rotation:Quaternion.identity,sunColor=light!=null?light.color:Color.white,sunIntensity=light!=null?light.intensity:1,shadowStrength=light!=null?light.shadowStrength:1,shadows=light!=null?light.shadows:LightShadows.None,background=camera.backgroundColor,msaa=camera.allowMSAA,far=camera.farClipPlane};
        // Nighttime: one high, nearly white key light for the floodlight banks
        // with soft real shadows, a cool night-sky fill that keeps dark kits
        // drawn, and a green bounce from the lit turf. Colours are linear.
        var sky=new Color(.19f,.25f,.41f);var horizon=new Color(.13f,.16f,.235f);var ground=new Color(.06f,.11f,.06f);
        var sh=new SphericalHarmonicsL2();sh.AddAmbientLight(horizon);sh.AddDirectionalLight(Vector3.up,sky-horizon,.9f);sh.AddDirectionalLight(Vector3.down,ground,.7f);
        RenderSettings.ambientMode=AmbientMode.Custom;RenderSettings.ambientProbe=sh;RenderSettings.ambientIntensity=1;
        var keyRotation=Quaternion.Euler(58,-32,0);
        if(light!=null){light.transform.rotation=keyRotation;light.color=new Color(1f,.975f,.94f);light.intensity=1.85f;light.shadows=ReducedQuality?LightShadows.Hard:LightShadows.Soft;light.shadowStrength=.72f;light.shadowBias=.04f;light.shadowNormalBias=.35f;}
        // Opposite bank as a cool back rim on players (WorldKit only) and the
        // dark beyond the stands (D6Floodlit); both reset in RestoreProbeLighting.
        var toKey=keyRotation*Vector3.back;var rim=new Vector3(-toKey.x,.55f,-toKey.z).normalized;
        Shader.SetGlobalVector(NightRimId,new Vector4(rim.x,rim.y,rim.z,.5f));Shader.SetGlobalColor(NightRimColorId,new Color(.62f,.72f,.92f));
        // The horizon dome of the club surroundings sits 280 m out.
        camera.backgroundColor=new Color(.02f,.035f,.085f);camera.allowMSAA=!ReducedQuality;camera.farClipPlane=Mathf.Max(lightingDefaults.far,700);
        if(urp!=null){urp.mainLightShadowmapResolution=ReducedQuality?1024:lightingDefaults.shadowResolution;urp.shadowDistance=ReducedQuality?70:lightingDefaults.shadowDistance;urp.msaaSampleCount=ReducedQuality?1:lightingDefaults.pipelineMsaa;}
        var data=camera.GetUniversalAdditionalCameraData();if(data!=null){data.renderPostProcessing=true;data.renderShadows=true;}
        if(matchVolume==null){
            matchProfile=ScriptableObject.CreateInstance<VolumeProfile>();
            // Static grading (no auto exposure): calm contrast, cool shadows,
            // neutral highlights so kits keep their colours under the lights.
            var grade=matchProfile.Add<ColorAdjustments>(true);grade.contrast.Override(15);grade.saturation.Override(-2);grade.postExposure.Override(.16f);
            var balance=matchProfile.Add<WhiteBalance>(true);balance.temperature.Override(-6);
            var tones=matchProfile.Add<ShadowsMidtonesHighlights>(true);tones.shadows.Override(new Vector4(.96f,.99f,1.08f,-.02f));tones.highlights.Override(new Vector4(1.01f,1f,.98f,0));
            var vignette=matchProfile.Add<Vignette>(true);vignette.intensity.Override(.27f);vignette.smoothness.Override(.5f);vignette.color.Override(new Color(.01f,.02f,.05f));
            // Optional glow around lamps only; reduced shows the halos without it.
            var bloom=matchProfile.Add<Bloom>(true);bloom.threshold.Override(.95f);bloom.intensity.Override(.42f);bloom.scatter.Override(.62f);matchBloom=bloom;
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

    // Pure picture state of a received replay frame; it never alters playback.
    public bool ReplayGraded=>replayVolume!=null&&replayVolume.enabled;
    void SetReplayGrade(bool replay){if(replayVolume!=null&&replayVolume.enabled!=replay)replayVolume.enabled=replay;}

    void RestoreProbeLighting(){
        Shader.SetGlobalVector(NightId,Vector4.zero);Shader.SetGlobalVector(NightRimId,Vector4.zero);
        if(matchVolume!=null)matchVolume.enabled=false;if(replayVolume!=null)replayVolume.enabled=false;if(lightingDefaults==null)return;var d=lightingDefaults;var light=FindSun();var camera=Camera.main;
        if(GraphicsSettings.currentRenderPipeline is UniversalRenderPipelineAsset urp&&d.shadowResolution>0){urp.mainLightShadowmapResolution=d.shadowResolution;urp.shadowDistance=d.shadowDistance;urp.msaaSampleCount=d.pipelineMsaa;}
        RenderSettings.ambientMode=d.mode;RenderSettings.ambientLight=d.flat;RenderSettings.ambientIntensity=d.intensity;RenderSettings.ambientProbe=d.probe;
        if(light!=null){light.transform.rotation=d.sunRotation;light.color=d.sunColor;light.intensity=d.sunIntensity;light.shadows=d.shadows;light.shadowStrength=d.shadowStrength;}
        if(camera!=null){camera.backgroundColor=d.background;camera.allowMSAA=d.msaa;camera.farClipPlane=d.far;var data=camera.GetUniversalAdditionalCameraData();if(data!=null)data.renderPostProcessing=false;}
    }

    Material EnvMaterial(Color color,Texture2D texture=null,Vector2? tiling=null,Color? emission=null,float gloss=0,float rim=0){
        // Colours are given in sRGB like the kit codes; the project renders linear.
        var m=new Material(Resources.Load<Shader>("D6Env"));m.SetColor("_BaseColor",color.linear);if(texture!=null)m.SetTexture("_BaseMap",texture);if(tiling.HasValue)m.SetTextureScale("_BaseMap",tiling.Value);
        m.SetColor("_Emission",(emission??Color.clear).linear);m.SetFloat("_Gloss",gloss);m.SetFloat("_Rim",rim);materials.Add(m);return m;
    }
    Texture2D StadiumTexture(int w,int h,Func<int,int,Color> pixel,FilterMode filter=FilterMode.Bilinear){
        var t=new Texture2D(w,h,TextureFormat.RGBA32,true);var pixels=new Color[w*h];for(int y=0;y<h;y++)for(int x=0;x<w;x++)pixels[y*w+x]=pixel(x,y);
        t.SetPixels(pixels);t.Apply(true,true);t.wrapMode=TextureWrapMode.Repeat;t.filterMode=filter;t.anisoLevel=4;stadiumTextures.Add(t);return t;
    }
    static Color Kit(string code,Color fallback){return ColorUtility.TryParseHtmlString(code??"",out var c)?c:fallback;}
    // Stable texel noise from the profile seed; no Unity random state.
    static float Grain(int x,int y,int seed){unchecked{uint h=(uint)(x*374761393+y*668265263+seed*1442695041);h=(h^(h>>13))*1274126177u;return ((h^(h>>16))&1023)/1023f;}}

    // Club stadium of the home side (WorldConfig.teams[].home). Presentation
    // only: the profile is resolved by club ID, never from the session or match.
    public string StadiumClub {get;private set;}
    public string StadiumArchetype {get;private set;}
    public StadiumBlueprint StadiumPlan {get;private set;}
    readonly List<Mesh> stadiumMeshes=new List<Mesh>();
    readonly float[] standFronts=new float[4];
    Transform stadiumSurroundings;Material crowdMaterial;

    void BuildStadium(){
        var g=worldView.Config.geometry;float L=(float)g.length,W=(float)g.width;
        ApplyMatchLighting();
        // Club colours for crowd, seats and trims; home supporters dominate.
        Color home=new Color(.85f,.2f,.2f),homeTrim=Color.white,away=new Color(.2f,.35f,.8f);
        foreach(var team in worldView.Config.teams??Array.Empty<WorldTeam>())foreach(var p in worldView.Config.players){
            int index=Array.IndexOf(worldView.Config.teams,team);if(p.team!=index||p.keeper||p.kit==null)continue;
            if(team.home){home=Kit(p.kit.main,home);homeTrim=Kit(p.kit.trim,homeTrim);}else away=Kit(p.kit.main,away);break;
        }
        var homeTeam=Array.Find(worldView.Config.teams,t=>t!=null&&t.home);
        var profile=ClubStadiumProfiles.Resolve(homeTeam?.id);
        var plan=StadiumArchitecture.Plan(profile,L,W,home,homeTrim,!ReducedQuality);
        StadiumPlan=plan;StadiumClub=profile.ClubId;StadiumArchetype=plan.Archetype;int seed=profile.DetailSeed;

        // Turf: one procedural material for the pitch and the run-off apron, mown per club.
        // Nighttime turf: the club's mowing colours, a little deeper and less
        // toy-like; calm stripes, light-bank pools and close blade grain.
        Color Turf(Color c,float value){Color.RGBToHSV(c,out var h,out var sat,out var v);return Color.HSVToRGB(h,Mathf.Clamp01(sat*.97f),v*value);}
        var turfA=Turf(plan.TurfA,.99f);var turfB=Color.Lerp(Turf(plan.TurfB,.97f),turfA,.25f);
        var pitch=new Material(Resources.Load<Shader>("D6Pitch"));pitch.SetVector("_Size",new Vector4(L,W,0,0));
        pitch.SetColor("_ColorA",turfA.linear);pitch.SetColor("_ColorB",turfB.linear);pitch.SetColor("_Apron",(turfB*.74f).linear);pitch.SetColor("_Wear",new Color(.42f,.43f,.29f).linear);
        pitch.SetFloat("_Stripes",plan.PitchStripes);pitch.SetFloat("_Pattern",plan.PitchPattern);pitch.SetFloat("_WearAmount",plan.Wear*.8f);
        pitch.SetFloat("_Grain",1);pitch.SetFloat("_Pools",.18f);pitch.SetFloat("_Sheen",.14f);materials.Add(pitch);
        // Floodlit bowl: pitch plus stands; the surroundings fall to dim sky light.
        Shader.SetGlobalVector(NightId,new Vector4(L/2+2,W/2+2,17,.30f));
        foreach(var r in world.GetComponentsInChildren<MeshRenderer>())if(r.name=="Grass")r.sharedMaterial=pitch;
        Box("Apron",new Vector3(0,-.075f,0),new Vector3(L+40,.1f,W+40),pitch);

        // Crowd: 128 spectators x 8 rows, 4x16 texels each: head, hair, shirt and
        // a dark gap between rows; some fans hold scarves in the home colours.
        var random=new System.Random(seed);
        Color[] palette={home,home,home,homeTrim,home*.7f,new Color(.12f,.12f,.14f),new Color(.85f,.82f,.75f),new Color(.3f,.3f,.33f),away};
        var faces=new[]{new Color(.88f,.68f,.53f),new Color(.72f,.52f,.38f),new Color(.55f,.38f,.27f),new Color(.36f,.25f,.18f)};
        var hairs=new[]{new Color(.12f,.10f,.09f),new Color(.30f,.21f,.14f),new Color(.62f,.50f,.33f),new Color(.45f,.44f,.42f)};
        const int cols=128,rowsTex=8;var shirts=new Color[cols*rowsTex];var face=new int[shirts.Length];var hair=new int[shirts.Length];var scarf=new bool[shirts.Length];var lift=new int[shirts.Length];
        for(int i=0;i<shirts.Length;i++){shirts[i]=palette[random.Next(palette.Length)];face[i]=random.Next(faces.Length);hair[i]=random.Next(hairs.Length);scarf[i]=random.NextDouble()<.09;lift[i]=random.Next(3);}
        var seat=plan.SeatColor;
        crowdMaterial=EnvMaterial(Color.white,StadiumTexture(cols*4,rowsTex*16,(x,y)=>{
            int c=(y/16)*cols+x/4,lx=x%4,ly=y%16-lift[c];var shirt=shirts[c];
            if(ly<1)return Color.Lerp(seat,Color.black,.55f);
            if(scarf[c]&&ly>=13&&lx<3)return (ly+lx)%2==0?home:homeTrim;
            if(ly>=10&&ly<=13&&lx>=1)return ly==13?hairs[hair[c]]:faces[face[c]]*(lx==3?.85f:1);
            if(ly>=10)return Color.Lerp(seat,Color.black,.35f);
            if(ly<3)return Color.Lerp(seat,Color.black,.2f);
            float light=.72f+.04f*ly-(lx==0?.12f:0);return Color.Lerp(shirt,new Color(.2f,.2f,.22f),.25f)*light;}));
        // Night crowd: in the stands' half light, still in club colours.
        crowdMaterial.SetFloat("_VertexTint",1);crowdMaterial.SetColor("_BaseColor",new Color(.8f,.8f,.84f).linear);

        // Surface textures. Mesh UVs are metres; tiling is one repeat per N metres.
        Texture2D Noise(int size,float low,float high,int salt,Func<int,int,float,float> shape=null)=>StadiumTexture(size,size,(x,y)=>{float n=Mathf.Lerp(low,high,Grain(x,y,seed+salt)*.4f+Grain(x/4,y/4,seed+salt+1)*.6f);if(shape!=null)n=shape(x,y,n);return new Color(n,n,n);});
        // Cool cast concrete: moderate grain, formwork joints and a few soft
        // darker weathering marks instead of uniform micro dirt (128 px, 4 m).
        var concreteTex=StadiumTexture(128,128,(x,y)=>{float n=Mathf.Lerp(.84f,1.03f,Grain(x,y,seed+11)*.35f+Grain(x/4,y/4,seed+12)*.65f);
            if(y%64==0||x%96==0)n*=.8f;float stain=Mathf.PerlinNoise(x/37f+seed%97,y/23f)*Mathf.PerlinNoise(x/11f,y/71f+seed%53);if(stain>.42f)n*=1-(stain-.42f)*.9f;
            float streak=Mathf.PerlinNoise(x/5f+seed%31,7.3f);if(streak>.72f)n*=1-(streak-.72f)*.6f*(1-y/128f);return new Color(n*.97f,n*.99f,n);});
        var brickTex=StadiumTexture(64,64,(x,y)=>{int row=y/8;int bx=(x+(row%2)*8)%16;float n=.85f+.25f*Grain(x/16+row*5,row,seed+21);return y%8==0||bx==0?new Color(.82f,.80f,.74f):new Color(n,n*.97f,n*.95f);});
        string motif=plan.Motif;
        var claddingTex=StadiumTexture(64,64,(x,y)=>{float n=.9f+.12f*Grain(x,y,seed+31);
            if(motif.Contains("fins")||motif.Contains("truss"))n*=x%16<2?.7f:1-.15f*(x%16)/16f;
            else if(motif.Contains("slat"))n*=y%8<2?.72f:1;
            else if(motif.Contains("timber"))n*=(x%10==0?.65f:1)*(.92f+.1f*Grain(x/10,y/6,seed+32));
            else if(motif.Contains("tiled"))n*=x%16==0||y%16==0?.75f:1;
            else if(motif.Contains("stone"))n*=y%21==0||(x+(y/21)*13)%32==0?.72f:1;
            return new Color(n,n,n);});
        var roofTex=StadiumTexture(32,32,(x,y)=>{float n=x%8<1?.7f:.95f+.05f*Mathf.Sin(x*.8f);return new Color(n,n,n);});
        var windows=StadiumTexture(64,64,(x,y)=>{bool frame=x%16<3||y%32<6||y%32>28;if(frame)return new Color(.12f,.12f,.13f);float lit=Grain(x/16,y/32,seed+41);return lit>.45f?new Color(1f,.86f,.62f)*(.7f+.3f*lit):new Color(.16f,.2f,.26f);});
        var lampTex=StadiumTexture(16,8,(x,y)=>x%4==0||y%4==0?new Color(.22f,.23f,.25f):new Color(1,.985f,.95f),FilterMode.Point);
        var seatTex=StadiumTexture(32,16,(x,y)=>x%16<2||y<3?new Color(.35f,.35f,.37f):new Color(.95f,.95f,.95f)*(y>12?.85f:1));
        var leafTex=Noise(32,.6f,1.15f,51);var groundTex=Noise(64,.75f,1.08f,61);
        // Night horizon (dome v 0..1 = -130..90 m): dark ground below, a low
        // cool haze from the floodlights and the town, calm deep blue above
        // with soft cloud banks. Wraps once around the dome (u), no stars.
        var skyTex=StadiumTexture(256,128,(x,y)=>{float v=y/127f;var haze=new Color(.15f,.18f,.26f);
            if(v<.6f)return Color.Lerp(new Color(.012f,.018f,.03f),haze*.6f,Mathf.Pow(v/.6f,7));float t=(v-.6f)/.4f;
            var c=Color.Lerp(haze,new Color(.02f,.04f,.10f),Mathf.Pow(t,.6f));float u=x/256f*Mathf.PI*2;
            float cloud=Mathf.PerlinNoise(Mathf.Cos(u)*2.2f+5,Mathf.Sin(u)*2.2f+v*3.2f)*.7f+Mathf.PerlinNoise(Mathf.Cos(u)*6+9,Mathf.Sin(u)*6+v*9)*.3f;
            return c*(1+(cloud-.5f)*.5f*Mathf.Clamp01(t*3));});
        skyTex.wrapModeU=TextureWrapMode.Repeat;skyTex.wrapModeV=TextureWrapMode.Clamp;

        var slotMaterials=new Dictionary<StadiumSlot,Material>{{StadiumSlot.Crowd,crowdMaterial}};
        void Slot(StadiumSlot slot,Texture2D texture=null,float metres=1,Color? emission=null,float gloss=0,Color? color=null,float rim=0){
            var m=EnvMaterial(color??plan.Colors[slot],texture,new Vector2(1/metres,1/metres),emission,gloss,rim);m.SetFloat("_VertexTint",1);slotMaterials[slot]=m;}
        // Nighttime materials: cool concrete, painted metal with limited gloss
        // and edge reflections, muted seats, white lamp faces, lit windows,
        // darker vegetation and ground beyond the floodlit bowl.
        Color Cool(Color c,float value,float blue=.04f){var o=c*value;o.b=Mathf.Min(1,o.b+blue*value);return o;}
        Slot(StadiumSlot.Concrete,concreteTex,4,color:Cool(plan.Colors[StadiumSlot.Concrete],.92f));Slot(StadiumSlot.Seat,seatTex,1,color:Color.Lerp(seat,new Color(.2f,.22f,.26f),.18f),gloss:.06f);
        Slot(StadiumSlot.Roof,roofTex,3,gloss:.08f,color:Cool(plan.Colors[StadiumSlot.Roof],.5f,.02f));Slot(StadiumSlot.Steel,null,1,gloss:.28f,color:Cool(plan.Colors[StadiumSlot.Steel],.9f,.03f),rim:.22f);
        Slot(StadiumSlot.Cladding,claddingTex,4,color:Cool(plan.Colors[StadiumSlot.Cladding],.9f));Slot(StadiumSlot.Brick,brickTex,2.4f,color:plan.Colors[StadiumSlot.Brick]*.9f);Slot(StadiumSlot.Trim,null,1,gloss:.08f);
        Slot(StadiumSlot.Glass,windows,3,new Color(.9f,.82f,.66f),.5f);Slot(StadiumSlot.Lamp,lampTex,1,new Color(2.3f,2.25f,2.1f),color:new Color(.9f,.9f,.88f));
        Slot(StadiumSlot.Shade);Slot(StadiumSlot.Grass,leafTex,6,color:Cool(plan.Colors[StadiumSlot.Grass],.62f,.03f));Slot(StadiumSlot.Foliage,leafTex,3,color:Cool(plan.Colors[StadiumSlot.Foliage],.55f,.04f));
        Slot(StadiumSlot.Water,null,1,gloss:.7f,color:Cool(plan.Colors[StadiumSlot.Water],.8f),rim:.3f);Slot(StadiumSlot.Ground,groundTex,8,color:Cool(plan.Colors[StadiumSlot.Ground],.7f,.02f));
        Slot(StadiumSlot.Sky,skyTex,1,Color.white,color:Color.black);Slot(StadiumSlot.Accent,null,1,gloss:.1f);

        // One renderer per stand side and surface; each side hides as a whole.
        standHalf=new Vector2(L/2,W/2);
        string[] names={"Stand long -1","Stand long 1","Stand end -1","Stand end 1","Stadium surroundings"};
        for(int group=0;group<StadiumBlueprint.Groups;group++){
            var parent=new GameObject(names[group]).transform;parent.SetParent(world,false);
            if(group<4){standSides[group]=parent;standFronts[group]=plan.Fronts[group];}else stadiumSurroundings=parent;
            foreach(StadiumSlot slot in Enum.GetValues(typeof(StadiumSlot))){
                var mesh=StadiumArchitecture.BuildMesh(plan,group,slot);if(mesh==null)continue;stadiumMeshes.Add(mesh);
                var go=new GameObject(slot.ToString(),typeof(MeshFilter),typeof(MeshRenderer));go.transform.SetParent(parent,false);
                go.GetComponent<MeshFilter>().sharedMesh=mesh;var renderer=go.GetComponent<MeshRenderer>();renderer.sharedMaterial=slotMaterials[slot];
                renderer.shadowCastingMode=ShadowCastingMode.Off;renderer.receiveShadows=slot!=StadiumSlot.Sky;
            }
        }

        BuildFloodlightGlow(plan);

        // LED advertising boards in the home colours, glowing under the lights.
        // Every other panel shows the club identity pattern in its accent colour.
        int identity=plan.Identity;var accent=plan.Accent;
        var board=StadiumTexture(512,32,(x,y)=>{int panel=x/64,lx=x%64;bool alt=panel%2==1;var bg=alt?homeTrim:home;var fg=alt?home:homeTrim;
            if(y<2||y>29)return new Color(.05f,.05f,.06f);
            if(alt)return StadiumArchitecture.PatternTexel(identity,lx,y-2,64,28)?accent:home;
            bool mark=y>9&&y<23&&lx>10&&lx<54&&((lx-10)%11<8)&&!(panel%3==0&&y>15);return mark?fg:bg;});
        foreach(int sign in new[]{-1,1}){
            Box("LED board",new Vector3(0,.5f,sign*(W/2+3.2f)),new Vector3(L+6,.9f,.12f),EnvMaterial(new Color(.55f,.55f,.55f),board,new Vector2((L+6)/8,1),new Color(.55f,.55f,.55f)));
            Box("LED board",new Vector3(sign*(L/2+3.8f),.5f,0),new Vector3(.12f,.9f,W+6),EnvMaterial(new Color(.55f,.55f,.55f),board,new Vector2((W+6)/8,1),new Color(.55f,.55f,.55f)));
        }

        // Real shadow maps for players; soft contact blobs keep feet grounded.
        var blob=new Material(Resources.Load<Shader>("D6Blob"));blob.SetFloat("_Strength",.42f);materials.Add(blob);
        foreach(var actor in actors)foreach(var r in actor.GetComponentsInChildren<Renderer>())r.shadowCastingMode=ShadowCastingMode.On;
        foreach(var ring in rings){ring.localScale=new Vector3(1.05f,.004f,1.05f);ring.GetComponent<Renderer>().sharedMaterial=blob;ring.GetComponent<Renderer>().shadowCastingMode=ShadowCastingMode.Off;}
        var ballBlob=new Material(blob);ballBlob.SetFloat("_Strength",.82f);materials.Add(ballBlob);worldBallShadowMaterial=ballBlob;ballShadow.localScale=new Vector3(.54f,.003f,.54f);ballShadow.GetComponent<Renderer>().sharedMaterial=ballBlob;
        ballView.GetComponent<Renderer>().shadowCastingMode=ShadowCastingMode.On;
        // Stands, roofs and masts stay out of the shadow map: their long
        // shadows would cross the pitch and hide the play.
        foreach(var r in world.GetComponentsInChildren<MeshRenderer>())if(r.sharedMaterial!=null&&r.sharedMaterial.shader==Resources.Load<Shader>("D6Env"))r.shadowCastingMode=ShadowCastingMode.Off;
        foreach(var r in world.GetComponentsInChildren<MeshRenderer>())if(r.name.StartsWith("Goal post")||r.name=="Crossbar")r.shadowCastingMode=ShadowCastingMode.On;
        // Nighttime ball: the same panel texture and UVs on the stadium shader
        // with a small self-lift and a narrow highlight, so the white ball stays
        // the brightest small object on the turf; it keeps its real shadow.
        var ballRenderer=ballView.GetComponent<Renderer>();
        if(ballRenderer.sharedMaterial!=null&&ballRenderer.sharedMaterial.GetTexture("_BaseMap") is Texture2D panels){ballRenderer.sharedMaterial=EnvMaterial(Color.white,panels,null,new Color(.62f,.62f,.62f),.4f,.12f);ballRenderer.shadowCastingMode=ShadowCastingMode.On;}
    }

    // Camera-facing halos in front of every lamp face of the plan (D6Glow):
    // one mesh per stand group, parented to it so a hidden stand hides its
    // lights too. Pure display; the lamps do not light anything by themselves.
    Material glowMaterial;
    void BuildFloodlightGlow(StadiumBlueprint plan){
        var shader=Resources.Load<Shader>("D6Glow");if(shader==null)return;
        glowMaterial=new Material(shader);glowMaterial.SetColor("_Color",new Color(1f,.95f,.86f));glowMaterial.SetFloat("_Intensity",ReducedQuality?1.1f:.95f);materials.Add(glowMaterial);
        for(int group=0;group<StadiumBlueprint.Groups;group++){
            var v=new List<Vector3>();var n=new List<Vector3>();var uv=new List<Vector2>();var size=new List<Vector2>();var tri=new List<int>();
            void Halo(Vector3 centre,Vector3 facing,float radius){int k=v.Count;foreach(var c in new[]{new Vector2(-1,-1),new Vector2(1,-1),new Vector2(1,1),new Vector2(-1,1)}){v.Add(centre);n.Add(facing);uv.Add(c);size.Add(new Vector2(radius,0));}tri.AddRange(new[]{k,k+1,k+2,k,k+2,k+3});}
            foreach(var piece in plan.Pieces){
                if(piece.group!=group||piece.slot!=StadiumSlot.Lamp)continue;var facing=piece.rotation*Vector3.forward;var s=piece.size;
                if(s.x>8){int count=Mathf.Max(2,Mathf.RoundToInt(s.x/5.5f));for(int i=0;i<count;i++)Halo(piece.center+piece.rotation*new Vector3(-s.x/2+(i+.5f)*s.x/count,-.25f,0)-facing*.2f,-facing,1.5f);}
                else Halo(piece.center+facing*(s.z/2+.2f),facing,Mathf.Max(s.x,s.y)*1.35f);
            }
            if(v.Count==0)continue;
            var mesh=new Mesh{name="Floodlight glow "+group};mesh.SetVertices(v);mesh.SetNormals(n);mesh.SetUVs(0,uv);mesh.SetUVs(1,size);mesh.SetTriangles(tri,0);
            // Billboards expand in the vertex shader: pad the bounds by the largest radius.
            var b=new Bounds(v[0],Vector3.zero);foreach(var p in v)b.Encapsulate(p);b.Expand(16);mesh.bounds=b;stadiumMeshes.Add(mesh);
            var go=new GameObject("Floodlight glow",typeof(MeshFilter),typeof(MeshRenderer));go.transform.SetParent(group<4?standSides[group]:stadiumSurroundings,false);
            go.GetComponent<MeshFilter>().sharedMesh=mesh;var renderer=go.GetComponent<MeshRenderer>();renderer.sharedMaterial=glowMaterial;renderer.shadowCastingMode=ShadowCastingMode.Off;renderer.receiveShadows=false;
        }
    }

    // A booked goal lifts the crowd: the spectator texture bobs with the received
    // celebration time, so pause and replay show the same picture.
    void UpdateCrowd(WorldFrame f){
        if(crowdMaterial==null)return;
        float lift=f!=null&&f.celebrating?.012f*Mathf.Abs(Mathf.Sin((float)f.celebrationTime*Mathf.PI*2.2f)):0;
        crowdMaterial.SetTextureOffset("_BaseMap",new Vector2(0,lift));
    }

    // A stand between a low camera and the pitch would hide the match. Hide
    // the stand on the camera's side before it enters roofs or light rails.
    // A 0.8 m hysteresis keeps a camera blending along the threshold from
    // flickering the stand in and out.
    void UpdateStadiumVisibility(Vector3 camera){
        if(standSides[0]==null)return;
        for(int side=0;side<4;side++){float coordinate=side<2?camera.z:camera.x;if(side%2==0)coordinate=-coordinate;
            bool show=StadiumPlan!=null?StadiumPlan.SideVisible(side,camera,standShown[side]):coordinate-standFronts[side]<(standShown[side]?.4f:-.4f);
            if(show!=standShown[side]||standSides[side].gameObject.activeSelf!=show){standShown[side]=show;standSides[side].gameObject.SetActive(show);}}
    }
    public bool StandShown(int side)=>standShown[side];

    void ClearStadium(){
        foreach(var t in stadiumTextures)if(t!=null)DestroyVisual(t);stadiumTextures.Clear();foreach(var m in stadiumMeshes)if(m!=null)DestroyVisual(m);stadiumMeshes.Clear();
        for(int i=0;i<standSides.Length;i++){standSides[i]=null;standShown[i]=true;}stadiumSurroundings=null;crowdMaterial=null;glowMaterial=null;StadiumPlan=null;
    }
}
}

using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
namespace Doppel6.Probe {
// Floodlight stadium for the club-world match view. Purely presentational:
// nothing here reads or changes positions, events, the clock or the ball.
public partial class ProbeBridge {
    class LightingDefaults {public AmbientMode mode;public Color flat;public float intensity;public SphericalHarmonicsL2 probe;public Quaternion sunRotation;public Color sunColor,background;public float sunIntensity,shadowStrength;public LightShadows shadows;public bool msaa;}
    LightingDefaults lightingDefaults;Light sun;Volume matchVolume;VolumeProfile matchProfile;
    readonly List<Texture2D> stadiumTextures=new List<Texture2D>();
    readonly Transform[] standSides=new Transform[4];Vector2 standHalf;

    Light FindSun(){if(sun!=null)return sun;foreach(var light in FindObjectsByType<Light>())if(light.type==LightType.Directional){sun=light;break;}return sun;}

    void ApplyMatchLighting(){
        var light=FindSun();var camera=Camera.main;
        if(lightingDefaults==null)lightingDefaults=new LightingDefaults{mode=RenderSettings.ambientMode,flat=RenderSettings.ambientLight,intensity=RenderSettings.ambientIntensity,probe=RenderSettings.ambientProbe,sunRotation=light!=null?light.transform.rotation:Quaternion.identity,sunColor=light!=null?light.color:Color.white,sunIntensity=light!=null?light.intensity:1,shadowStrength=light!=null?light.shadowStrength:1,shadows=light!=null?light.shadows:LightShadows.None,background=camera.backgroundColor,msaa=camera.allowMSAA};
        // Evening floodlight: one high key light with soft real shadows, a cool
        // sky fill and a darker turf bounce. Colours are linear.
        var sky=new Color(.30f,.36f,.47f);var horizon=new Color(.20f,.24f,.27f);var ground=new Color(.07f,.11f,.07f);
        var sh=new SphericalHarmonicsL2();sh.AddAmbientLight(horizon);sh.AddDirectionalLight(Vector3.up,sky-horizon,.9f);sh.AddDirectionalLight(Vector3.down,ground,.6f);
        RenderSettings.ambientMode=AmbientMode.Custom;RenderSettings.ambientProbe=sh;RenderSettings.ambientIntensity=1;
        if(light!=null){light.transform.rotation=Quaternion.Euler(54,-32,0);light.color=new Color(1f,.96f,.90f);light.intensity=1.45f;light.shadows=LightShadows.Soft;light.shadowStrength=.78f;light.shadowBias=.04f;light.shadowNormalBias=.35f;}
        camera.backgroundColor=new Color(.05f,.09f,.14f);camera.allowMSAA=true;
        var data=camera.GetUniversalAdditionalCameraData();if(data!=null){data.renderPostProcessing=true;data.renderShadows=true;}
        if(matchVolume==null){
            matchProfile=ScriptableObject.CreateInstance<VolumeProfile>();
            var grade=matchProfile.Add<ColorAdjustments>(true);grade.contrast.Override(6);grade.saturation.Override(-6);grade.postExposure.Override(.1f);
            var vignette=matchProfile.Add<Vignette>(true);vignette.intensity.Override(.2f);vignette.smoothness.Override(.5f);
            var bloom=matchProfile.Add<Bloom>(true);bloom.threshold.Override(.93f);bloom.intensity.Override(.35f);bloom.scatter.Override(.6f);
            var go=new GameObject("D6 match grading");go.transform.SetParent(transform,false);matchVolume=go.AddComponent<Volume>();matchVolume.isGlobal=true;matchVolume.priority=10;matchVolume.sharedProfile=matchProfile;
        }
        matchVolume.enabled=true;
    }

    void RestoreProbeLighting(){
        if(matchVolume!=null)matchVolume.enabled=false;if(lightingDefaults==null)return;var d=lightingDefaults;var light=FindSun();var camera=Camera.main;
        RenderSettings.ambientMode=d.mode;RenderSettings.ambientLight=d.flat;RenderSettings.ambientIntensity=d.intensity;RenderSettings.ambientProbe=d.probe;
        if(light!=null){light.transform.rotation=d.sunRotation;light.color=d.sunColor;light.intensity=d.sunIntensity;light.shadows=d.shadows;light.shadowStrength=d.shadowStrength;}
        if(camera!=null){camera.backgroundColor=d.background;camera.allowMSAA=d.msaa;var data=camera.GetUniversalAdditionalCameraData();if(data!=null)data.renderPostProcessing=false;}
    }

    Material EnvMaterial(Color color,Texture2D texture=null,Vector2? tiling=null,Color? emission=null,float gloss=0){
        // Colours are given in sRGB like the kit codes; the project renders linear.
        var m=new Material(Resources.Load<Shader>("D6Env"));m.SetColor("_BaseColor",color.linear);if(texture!=null)m.SetTexture("_BaseMap",texture);if(tiling.HasValue)m.SetTextureScale("_BaseMap",tiling.Value);
        m.SetColor("_Emission",(emission??Color.clear).linear);m.SetFloat("_Gloss",gloss);materials.Add(m);return m;
    }
    Texture2D StadiumTexture(int w,int h,Func<int,int,Color> pixel,FilterMode filter=FilterMode.Bilinear){
        var t=new Texture2D(w,h,TextureFormat.RGBA32,true);var pixels=new Color[w*h];for(int y=0;y<h;y++)for(int x=0;x<w;x++)pixels[y*w+x]=pixel(x,y);
        t.SetPixels(pixels);t.Apply(true,true);t.wrapMode=TextureWrapMode.Repeat;t.filterMode=filter;t.anisoLevel=4;stadiumTextures.Add(t);return t;
    }
    static Color Kit(string code,Color fallback){return ColorUtility.TryParseHtmlString(code??"",out var c)?c:fallback;}

    void BuildStadium(){
        var g=worldView.Config.geometry;float L=(float)g.length,W=(float)g.width;
        ApplyMatchLighting();
        // Turf: one procedural material for the pitch and the run-off apron.
        var pitch=new Material(Resources.Load<Shader>("D6Pitch"));pitch.SetVector("_Size",new Vector4(L,W,0,0));
        pitch.SetColor("_ColorA",new Color(.36f,.53f,.29f).linear);pitch.SetColor("_ColorB",new Color(.31f,.47f,.25f).linear);pitch.SetColor("_Apron",new Color(.25f,.37f,.21f).linear);pitch.SetColor("_Wear",new Color(.45f,.46f,.30f).linear);pitch.SetFloat("_Stripes",12);materials.Add(pitch);
        foreach(var r in world.GetComponentsInChildren<MeshRenderer>())if(r.name=="Grass")r.sharedMaterial=pitch;
        Box("Apron",new Vector3(0,-.075f,0),new Vector3(L+40,.1f,W+40),pitch);

        // Club colours for crowd and boards; home supporters dominate.
        Color home=new Color(.85f,.2f,.2f),homeTrim=Color.white,away=new Color(.2f,.35f,.8f);
        foreach(var team in worldView.Config.teams??Array.Empty<WorldTeam>())foreach(var p in worldView.Config.players){
            int index=Array.IndexOf(worldView.Config.teams,team);if(p.team!=index||p.keeper||p.kit==null)continue;
            if(team.home){home=Kit(p.kit.main,home);homeTrim=Kit(p.kit.trim,homeTrim);}else away=Kit(p.kit.main,away);break;
        }
        var random=new System.Random(worldView.Config.session?.GetHashCode()??7);
        Color[] palette={home,home,home,homeTrim,home*.7f,new Color(.12f,.12f,.14f),new Color(.85f,.82f,.75f),new Color(.3f,.3f,.33f),away};
        var faces=new[]{new Color(.85f,.65f,.5f),new Color(.6f,.42f,.3f),new Color(.4f,.28f,.2f)};
        // Each 4x8 cell is one spectator: shirt below, head above, seat gaps between.
        var crowdShirts=new Color[64*8];for(int i=0;i<crowdShirts.Length;i++)crowdShirts[i]=palette[random.Next(palette.Length)];
        var crowd=StadiumTexture(256,64,(x,y)=>{int cx=x/4,cy=y/8,lx=x%4,ly=y%8;var shirt=crowdShirts[(cy*64+cx)%crowdShirts.Length];
            if(lx==3||ly==0)return new Color(.13f,.13f,.15f);if(ly>=5)return ly==7&&(lx==0||lx==2)?new Color(.1f,.1f,.11f):faces[(cx*7+cy*3)%3];return Color.Lerp(shirt,new Color(.2f,.2f,.22f),.35f)*(.62f+.05f*ly);});
        var concrete=EnvMaterial(new Color(.30f,.31f,.33f));var roofMat=EnvMaterial(new Color(.12f,.13f,.15f));var steel=EnvMaterial(new Color(.55f,.57f,.6f),gloss:.4f);

        // Stands: stepped tiers on all four sides behind the advertising boards.
        standHalf=new Vector2(L/2,W/2);
        for(int side=0;side<4;side++){
            bool longSide=side<2;int sign=side%2==0?-1:1;
            var group=new GameObject(longSide?"Stand long "+sign:"Stand end "+sign).transform;group.SetParent(world,false);standSides[side]=group;
            float inner=longSide?W/2+5.5f:L/2+6.5f,span=longSide?L+10:W+8;int tiers=longSide?8:6;
            var crowdMat=EnvMaterial(Color.white,crowd,new Vector2(span/.5f/64,1));
            for(int i=0;i<tiers;i++){
                float h=.9f+i*.62f,d=inner+i*1.05f+.525f;
                var size=longSide?new Vector3(span,h,1.05f):new Vector3(1.05f,h,span);var at=longSide?new Vector3(0,h/2,sign*d):new Vector3(sign*d,h/2,0);
                var tier=Box("Tier",at,size,crowdMat);tier.SetParent(group,true);
            }
            float back=inner+tiers*1.05f+.3f,top=.9f+tiers*.62f+3.2f;
            var wall=Box("Stand wall",longSide?new Vector3(0,top/2,sign*back):new Vector3(sign*back,top/2,0),longSide?new Vector3(span+2,top,.6f):new Vector3(.6f,top,span+2),concrete);wall.SetParent(group,true);
            var roof=Box("Stand roof",longSide?new Vector3(0,top,sign*(back-3.2f)):new Vector3(sign*(back-3.2f),top,0),longSide?new Vector3(span+2,.35f,6.8f):new Vector3(6.8f,.35f,span+2),roofMat);roof.SetParent(group,true);
            var fascia=Box("Roof fascia",longSide?new Vector3(0,top-.35f,sign*(back-6.5f)):new Vector3(sign*(back-6.5f),top-.35f,0),longSide?new Vector3(span+2,.7f,.25f):new Vector3(.25f,.7f,span+2),EnvMaterial(homeTrim*.8f));fascia.SetParent(group,true);
        }

        // LED advertising boards in the home colours, glowing under the lights.
        var board=StadiumTexture(512,32,(x,y)=>{int panel=x/64,lx=x%64;bool alt=panel%2==1;var bg=alt?homeTrim:home;var fg=alt?home:homeTrim;
            bool mark=y>9&&y<23&&lx>10&&lx<54&&((lx-10)%11<8)&&!(panel%3==0&&y>15);if(y<2||y>29)return new Color(.05f,.05f,.06f);return mark?fg:bg;});
        foreach(int sign in new[]{-1,1}){
            Box("LED board",new Vector3(0,.5f,sign*(W/2+3.2f)),new Vector3(L+6,.9f,.12f),EnvMaterial(new Color(.55f,.55f,.55f),board,new Vector2((L+6)/8,1),new Color(.55f,.55f,.55f)));
            Box("LED board",new Vector3(sign*(L/2+3.8f),.5f,0),new Vector3(.12f,.9f,W+6),EnvMaterial(new Color(.55f,.55f,.55f),board,new Vector2((W+6)/8,1),new Color(.55f,.55f,.55f)));
        }
        // Floodlight masts in the corners with glowing lamp banks.
        var lamp=EnvMaterial(new Color(.9f,.9f,.85f),StadiumTexture(16,8,(x,y)=>x%4==0||y%4==0?new Color(.25f,.25f,.25f):new Color(1,.97f,.88f),FilterMode.Point),new Vector2(1,1),new Color(1.6f,1.5f,1.3f));
        foreach(int sx in new[]{-1,1})foreach(int sz in new[]{-1,1}){
            var foot=new Vector3(sx*(L/2+10),0,sz*(W/2+12));Rod("Floodlight mast",foot+Vector3.up*15,30,false,steel).localScale=new Vector3(.55f,15,.55f);
            var head=Box("Floodlight",foot+Vector3.up*30.5f,new Vector3(4.2f,2.4f,.35f),lamp);head.rotation=Quaternion.LookRotation(new Vector3(-foot.x,-18,-foot.z));
        }

        // Real shadow maps for players; soft contact blobs keep feet grounded.
        var blob=new Material(Resources.Load<Shader>("D6Blob"));blob.SetFloat("_Strength",.42f);materials.Add(blob);
        foreach(var actor in actors)foreach(var r in actor.GetComponentsInChildren<Renderer>())r.shadowCastingMode=ShadowCastingMode.On;
        foreach(var ring in rings){ring.localScale=new Vector3(1.05f,.004f,1.05f);ring.GetComponent<Renderer>().sharedMaterial=blob;ring.GetComponent<Renderer>().shadowCastingMode=ShadowCastingMode.Off;}
        var ballBlob=new Material(blob);ballBlob.SetFloat("_Strength",.5f);materials.Add(ballBlob);ballShadow.localScale=new Vector3(.42f,.003f,.42f);ballShadow.GetComponent<Renderer>().sharedMaterial=ballBlob;
        ballView.GetComponent<Renderer>().shadowCastingMode=ShadowCastingMode.On;
        // Stands, roofs and masts stay out of the shadow map: their long
        // shadows would cross the pitch and hide the play.
        foreach(var r in world.GetComponentsInChildren<MeshRenderer>())if(r.sharedMaterial!=null&&r.sharedMaterial.shader==Resources.Load<Shader>("D6Env"))r.shadowCastingMode=ShadowCastingMode.Off;
        foreach(var r in world.GetComponentsInChildren<MeshRenderer>())if(r.name.StartsWith("Goal post")||r.name=="Crossbar")r.shadowCastingMode=ShadowCastingMode.On;
    }

    // A stand between a low camera and the pitch would hide the match. Hide
    // the stand on the camera's side once the camera sits beyond its front.
    void UpdateStadiumVisibility(Vector3 camera){
        if(standSides[0]==null)return;
        standSides[0].gameObject.SetActive(camera.z>-(standHalf.y+5.5f));standSides[1].gameObject.SetActive(camera.z<standHalf.y+5.5f);
        standSides[2].gameObject.SetActive(camera.x>-(standHalf.x+6.5f));standSides[3].gameObject.SetActive(camera.x<standHalf.x+6.5f);
    }

    void ClearStadium(){foreach(var t in stadiumTextures)if(t!=null)Destroy(t);stadiumTextures.Clear();for(int i=0;i<standSides.Length;i++)standSides[i]=null;}
}
}

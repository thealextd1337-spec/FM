using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
namespace Doppel6.Probe {
// Floodlight stadium for the club-world match view. Purely presentational:
// nothing here reads or changes positions, events, the clock or the ball.
public partial class ProbeBridge {
    
    
    // Reduced quality (WorldViewLighting decides MSAA, shadows and bloom) builds
    // fewer stadium and supporter details. Chosen by the page for touch devices;
    // without that field by Unity's mobile platform flag.
    
    readonly bool[] standShown={true,true,true,true};
    readonly List<Texture2D> stadiumTextures=new List<Texture2D>();
    readonly Transform[] standSides=new Transform[4];Vector2 standHalf;

    // Klares Low-Poly demo style: shader global _D6LowPoly (players, turf, gloss)
    // and calmer generated stadium textures. false restores the Release 130 look.
    

    

    

    // Pure picture state of a received replay frame; it never alters playback.
    
    

    

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
    // Stable texel noise from the profile seed; no Unity random state.
    static float Grain(int x,int y,int seed){unchecked{uint h=(uint)(x*374761393+y*668265263+seed*1442695041);h=(h^(h>>13))*1274126177u;return ((h^(h>>16))&1023)/1023f;}}

    // Club stadium of the home side (WorldConfig.teams[].home), the country cup ground of a cup
    // club or the neutral final venue named by WorldConfig.presentation. Presentation only: the
    // profile is resolved by club ID and the received display facts, never from the session or match.
    public string StadiumClub {get;private set;}
    public string StadiumArchetype {get;private set;}
    // Venue key: a club ID, CUP-STANDARD-<country>, LEAGUE-STANDARD-<country>, NEUTRAL-EUROPE or NEUTRAL-CUP-<country>.
    public string StadiumVenue {get;private set;}
    public StadiumBlueprint StadiumPlan {get;private set;}
    // The light look the stadium materials were built from (read, never written, here).
    public MatchLightLook StadiumLook {get;private set;}
    // Horizon gradient at height v (0 ground, 1 top): dark ground, a soft glow above the skyline,
    // the sky colour above. The night look reproduces the Release 130 evening exactly.
    public static Color SkyTexel(MatchLightLook look,float v){
        var glow=look.skyHorizon;if(v<.58f)return Color.Lerp(look.skyGround,glow*.55f,Mathf.Pow(v/.58f,6));float t=(v-.58f)/.42f;return Color.Lerp(glow,look.skyTop,Mathf.Sqrt(t));
    }
    readonly List<Mesh> stadiumMeshes=new List<Mesh>();
    readonly float[] standFronts=new float[4];
    Transform stadiumSurroundings;Material crowdMaterial;

    // A club's identity pattern on banners and flags: the pattern its own ground shows.
    static int ClubPattern(string clubId){var p=ClubStadiumProfiles.Resolve(clubId);return StadiumArchitecture.IdentityOf(p.FacadeMotif,ClubStadiumProfiles.Seed(clubId??""));}

    void BuildStadium(){
        var g=worldView.Config.geometry;float L=(float)g.length,W=(float)g.width;
        ApplyMatchLighting();var look=LightLook;StadiumLook=look;bool day=look.light==MatchLight.Day;
        var config=worldView.Config;var teams=config.teams;
        // Club colours per physical team (0 = managed club): the clubs' own colours from
        // WorldConfig.presentation, never a clash kit. Pages without a presentation keep the
        // Release 130 rule: the first outfield kit of each team.
        var display=config.presentation;bool presented=!string.IsNullOrEmpty(display?.schema);
        var primary=new[]{new Color(.85f,.2f,.2f),new Color(.2f,.35f,.8f)};var secondary=new[]{Color.white,Color.white};
        for(int t=0;t<2;t++){
            if(presented){primary[t]=Kit(display.clubs[t].primary,primary[t]);secondary[t]=Kit(display.clubs[t].secondary,secondary[t]);continue;}
            var player=Array.Find(config.players,p=>p!=null&&p.team==t&&!p.keeper&&p.kit!=null);if(player!=null){primary[t]=Kit(player.kit.main,primary[t]);secondary[t]=Kit(player.kit.trim,secondary[t]);}
        }
        // Exactly one team is flagged home (validated), also at neutral venues. A page without a
        // presentation keeps the Release 130 stadium of the home club and no supporter blocks.
        int homeTeam=teams[1].home?1:0,awayTeam=1-homeTeam;
        var profile=presented?ClubStadiumProfiles.ResolveVenue(teams[homeTeam].id,display.clubs[homeTeam].kind,display.venue,display.competition,display.venueCountry):ClubStadiumProfiles.ResolveLegacy(teams[homeTeam].id);
        bool neutral=presented&&profile.Identity.Supporters.Neutral;
        Color home=primary[homeTeam],homeTrim=secondary[homeTeam],away=primary[awayTeam];
        // A neutral arena keeps its own seats, walls and boards; both clubs keep their blocks and banners.
        if(neutral){home=Kit(profile.Identity.ArenaPrimary,home);homeTrim=Kit(profile.Identity.ArenaSecondary,homeTrim);}
        var plan=StadiumArchitecture.Plan(profile,L,W,home,homeTrim,!ReducedQuality,presented);
        StadiumPlan=plan;StadiumClub=profile.ClubId;StadiumVenue=profile.Venue;StadiumArchetype=plan.Archetype;int seed=profile.DetailSeed;
        supporterSetup=presented?new SupporterSetup{ClubIds=new[]{teams[0].id,teams[1].id},Primary=primary,Secondary=secondary,Patterns=new[]{ClubPattern(teams[0].id),ClubPattern(teams[1].id)},HomeTeam=homeTeam,Neutral=neutral}:null;

        // Turf: one procedural material for the pitch and the run-off apron, mown per club.
        var pitch=new Material(Resources.Load<Shader>("D6Pitch"));pitch.SetVector("_Size",new Vector4(L,W,0,0));
        pitch.SetColor("_ColorA",plan.TurfA.linear);pitch.SetColor("_ColorB",plan.TurfB.linear);pitch.SetColor("_Apron",(plan.TurfB*.8f).linear);pitch.SetColor("_Wear",new Color(.45f,.46f,.30f).linear);
        pitch.SetFloat("_Stripes",plan.PitchStripes);pitch.SetFloat("_Pattern",plan.PitchPattern);pitch.SetFloat("_WearAmount",plan.Wear);materials.Add(pitch);
        foreach(var r in world.GetComponentsInChildren<MeshRenderer>())if(r.name=="Grass")r.sharedMaterial=pitch;
        Box("Apron",new Vector3(0,-.075f,0),new Vector3(L+40,.1f,W+40),pitch);

        // Crowd: 128 spectators x 8 rows, 4x16 texels each: head, hair, shirt and
        // a dark gap between rows; some fans hold scarves in their club's colours.
        // Home grounds are mostly home colours with a small visitor share; a neutral
        // final mixes both clubs evenly.
        var random=new System.Random(seed);
        Color[] palette=neutral?new[]{primary[homeTeam],primary[homeTeam],secondary[homeTeam],primary[awayTeam],primary[awayTeam],secondary[awayTeam],new Color(.12f,.12f,.14f),new Color(.85f,.82f,.75f),new Color(.3f,.3f,.33f)}
            :new[]{home,home,home,homeTrim,home*.7f,new Color(.12f,.12f,.14f),new Color(.85f,.82f,.75f),new Color(.3f,.3f,.33f),away};
        var faces=new[]{new Color(.88f,.68f,.53f),new Color(.72f,.52f,.38f),new Color(.55f,.38f,.27f),new Color(.36f,.25f,.18f)};
        var hairs=new[]{new Color(.12f,.10f,.09f),new Color(.30f,.21f,.14f),new Color(.62f,.50f,.33f),new Color(.45f,.44f,.42f)};
        const int cols=128,rowsTex=8;var shirts=new Color[cols*rowsTex];var face=new int[shirts.Length];var hair=new int[shirts.Length];var scarf=new bool[shirts.Length];var lift=new int[shirts.Length];var club=new int[shirts.Length];
        for(int i=0;i<shirts.Length;i++){int pick=random.Next(palette.Length);shirts[i]=palette[pick];club[i]=!neutral||pick<3?homeTeam:pick<6?awayTeam:i%2;face[i]=random.Next(faces.Length);hair[i]=random.Next(hairs.Length);scarf[i]=random.NextDouble()<.09;lift[i]=random.Next(3);}
        var seat=plan.SeatColor;
        crowdMaterial=EnvMaterial(Color.white,StadiumTexture(cols*4,rowsTex*16,(x,y)=>{
            int c=(y/16)*cols+x/4,lx=x%4,ly=y%16-lift[c];var shirt=shirts[c];
            if(ly<1)return Color.Lerp(seat,Color.black,.55f);
            if(scarf[c]&&ly>=13&&lx<3)return neutral?((ly+lx)%2==0?primary[club[c]]:secondary[club[c]]):(ly+lx)%2==0?home:homeTrim;
            if(ly>=10&&ly<=13&&lx>=1)return ly==13?hairs[hair[c]]:faces[face[c]]*(lx==3?.85f:1);
            if(ly>=10)return Color.Lerp(seat,Color.black,.35f);
            if(ly<3)return Color.Lerp(seat,Color.black,.2f);
            float light=LowPolyStyle?.86f-(lx==0?.06f:0):.72f+.04f*ly-(lx==0?.12f:0);return Color.Lerp(shirt,new Color(.2f,.2f,.22f),.25f)*light;}));
        // The received light look brightens or calms the crowd (linear factor; 1 = Release 130).
        crowdMaterial.SetFloat("_VertexTint",1);crowdMaterial.SetColor("_BaseColor",Color.white*Mathf.Max(0,look.crowdLight));

        // Surface textures. Mesh UVs are metres; tiling is one repeat per N metres.
        // Low-Poly: the same surfaces with a third of the mottling; form carries the information.
        float Calm(float v,float mid)=>LowPolyStyle?Mathf.Lerp(v,mid,.65f):v;
        Texture2D Noise(int size,float low,float high,int salt,Func<int,int,float,float> shape=null)=>StadiumTexture(size,size,(x,y)=>{float n=Calm(Mathf.Lerp(low,high,Grain(x,y,seed+salt)*.4f+Grain(x/4,y/4,seed+salt+1)*.6f),(low+high)/2);if(shape!=null)n=shape(x,y,n);return new Color(n,n,n);});
        var concreteTex=Noise(64,.86f,1.04f,11,(x,y,n)=>y%32==0?n*.78f:n);
        var brickTex=StadiumTexture(64,64,(x,y)=>{int row=y/8;int bx=(x+(row%2)*8)%16;float n=Calm(.85f+.25f*Grain(x/16+row*5,row,seed+21),.97f);return y%8==0||bx==0?new Color(.82f,.80f,.74f):new Color(n,n*.97f,n*.95f);});
        string motif=plan.Motif;
        var claddingTex=StadiumTexture(64,64,(x,y)=>{float n=Calm(.9f+.12f*Grain(x,y,seed+31),.96f);
            if(motif.Contains("fins")||motif.Contains("truss"))n*=x%16<2?.7f:1-.15f*(x%16)/16f;
            else if(motif.Contains("slat"))n*=y%8<2?.72f:1;
            else if(motif.Contains("timber"))n*=(x%10==0?.65f:1)*(.92f+.1f*Grain(x/10,y/6,seed+32));
            else if(motif.Contains("tiled"))n*=x%16==0||y%16==0?.75f:1;
            else if(motif.Contains("stone"))n*=y%21==0||(x+(y/21)*13)%32==0?.72f:1;
            return new Color(n,n,n);});
        var roofTex=StadiumTexture(32,32,(x,y)=>{float n=x%8<1?.7f:.95f+.05f*Mathf.Sin(x*.8f);return new Color(n,n,n);});
        // Windows: lit above the light look's threshold at night, all unlit by day.
        var windows=StadiumTexture(64,64,(x,y)=>{bool frame=x%16<3||y%32<6||y%32>28;if(frame)return new Color(.12f,.12f,.13f);float lit=Grain(x/16,y/32,seed+41);return !day&&lit>look.windowLit?new Color(1f,.86f,.62f)*(.7f+.3f*lit):new Color(.16f,.2f,.26f);});
        var lampTex=StadiumTexture(16,8,(x,y)=>x%4==0||y%4==0?new Color(.25f,.25f,.25f):new Color(1,.97f,.88f),FilterMode.Point);
        var seatTex=StadiumTexture(32,16,(x,y)=>x%16<2||y<3?new Color(.35f,.35f,.37f):new Color(.95f,.95f,.95f)*(y>12?.85f:1));
        var leafTex=Noise(32,.6f,1.15f,51);var groundTex=Noise(64,.75f,1.08f,61);
        // Horizon from the received light look.
        var skyTex=StadiumTexture(4,128,(x,y)=>SkyTexel(look,y/127f));
        skyTex.wrapMode=TextureWrapMode.Clamp;

        var slotMaterials=new Dictionary<StadiumSlot,Material>{{StadiumSlot.Crowd,crowdMaterial}};
        void Slot(StadiumSlot slot,Texture2D texture=null,float metres=1,Color? emission=null,float gloss=0,Color? color=null){
            var m=EnvMaterial(color??plan.Colors[slot],texture,new Vector2(1/metres,1/metres),emission,gloss);m.SetFloat("_VertexTint",1);slotMaterials[slot]=m;}
        Slot(StadiumSlot.Concrete,concreteTex,4);Slot(StadiumSlot.Seat,seatTex,1,color:seat);Slot(StadiumSlot.Roof,roofTex,3,gloss:.15f);Slot(StadiumSlot.Steel,null,1,gloss:.45f);
        Slot(StadiumSlot.Cladding,claddingTex,4);Slot(StadiumSlot.Brick,brickTex,2.4f);Slot(StadiumSlot.Trim,null,1,gloss:.1f);
        Slot(StadiumSlot.Glass,windows,3,day?new Color(.36f,.36f,.34f):new Color(.75f,.72f,.66f),.6f);Slot(StadiumSlot.Lamp,lampTex,1,new Color(1.6f,1.5f,1.3f),color:new Color(.9f,.9f,.85f));
        // Floodlight heads glow with the light look (linear factor; off by day).
        slotMaterials[StadiumSlot.Lamp].SetColor("_Emission",new Color(1.6f,1.5f,1.3f).linear*Mathf.Max(0,look.lampEmission));
        Slot(StadiumSlot.Shade);Slot(StadiumSlot.Grass,leafTex,6);Slot(StadiumSlot.Foliage,leafTex,3);Slot(StadiumSlot.Water,null,1,gloss:.8f);Slot(StadiumSlot.Ground,groundTex,8);
        Slot(StadiumSlot.Sky,skyTex,1,Color.white,color:Color.black);Slot(StadiumSlot.Accent,null,1,gloss:.1f);
        // Distant skylines sit in the horizon haze of the received look (vertex shade layers them).
        if(plan.Count(StadiumSlot.Haze)>0)Slot(StadiumSlot.Haze,null,1,color:Color.Lerp(look.skyHorizon,look.skyGround,.45f));

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
        ApplyMatchShadows();
        BuildSupporters(plan);
    }

    // A booked goal lifts the crowd: the spectator texture bobs with the received
    // celebration time, so pause and replay show the same picture.
    void UpdateCrowd(WorldFrame f){
        UpdateSupporters(f);
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
        ClearSupporters();
        foreach(var t in stadiumTextures)if(t!=null)DestroyVisual(t);stadiumTextures.Clear();foreach(var m in stadiumMeshes)if(m!=null)DestroyVisual(m);stadiumMeshes.Clear();
        for(int i=0;i<standSides.Length;i++){standSides[i]=null;standShown[i]=true;}stadiumSurroundings=null;crowdMaterial=null;StadiumPlan=null;
    }
}
}

using System;
using System.Collections.Generic;
using UnityEngine;
namespace Doppel6.Probe {
// Club stadium architecture from a ClubStadiumProfile and its structural identity: stand forms
// and tiers, roofs and their supports, corners, floodlights, entrances, landmarks, surroundings
// and the terrace blocks reserved for supporters. Pure presentation: the plan is a deterministic
// function of profile, pitch size, colours and detail level. It never reads the session, match
// clock, Unity's random state or match data, and it never changes the profile it receives.
// Pitch and goals keep their match geometry; every piece stands outside the advertising boards
// except the four thin corner flags.
// Appended slots keep older slots in order: Accent (the club's second colour on identity panels)
// and Haze (distant skyline silhouettes, coloured from the received light look).
public enum StadiumSlot {Concrete,Crowd,Seat,Roof,Steel,Cladding,Brick,Trim,Glass,Lamp,Shade,Grass,Foliage,Water,Ground,Sky,Accent,Haze}
public enum StadiumShape {Box,Quad,Wedge,Prism,Dome}
public struct StadiumPiece {
    public StadiumSlot slot;public StadiumShape shape;public int group;
    // Box/Wedge: full size on local axes. Quad: width x height, faces local -Z.
    // Prism/Dome: x = diameter, y = height, z = top/bottom diameter ratio.
    public Vector3 center,size;public Quaternion rotation;public Color tint;
    // Crowd quads only: texture column offset and spectator row (0..7).
    public float crowdU;public int crowdRow;
    // Prism side count (0: ten). Detail pieces are dropped by reduced quality.
    public int sides;public bool detail;
}
// Terrace rows of one stand side in its frame (local X along the stand, +X to the right as seen
// from the pitch; Out measured outward from the pitch centre): row fronts, tread heights, tier
// starts and aisles. Supporter blocks stand on these rows; Cuts remove crowd strips (x from, x to,
// first row, last row) where blocks or boxes take the place.
public sealed class StandTerrace {
    public int Side,Rows;public float Front,Half,RowDepth,Rise,Wall,Podium;public bool Standing;public Quaternion Facing;
    public float[] Out=new float[0],Tread=new float[0],Aisles=new float[0];public int[] TierStarts=new int[0];
    public float RoofY,RoofFront,GirderY,GirderZ,BankHeight,BankTotal;public bool Roofed;
    public readonly List<Vector4> Cuts=new List<Vector4>();
    public int TierOf(int row){int t=0;foreach(var s in TierStarts)if(row>=s)t++;return t;}
    public int LowerRows=>TierStarts.Length>0?TierStarts[0]:Rows;
    // Row front for any index, computed like Out; past the last row of a single tier the
    // Release 130 rule steps back two rows (it treated those rows as an upper tier).
    public float OutAt(int row)=>Front+(row-2*(TierOf(row)+(TierStarts.Length==0&&row>=Rows?1:0)))*RowDepth;
    public Vector3 At(float along,float y,float outward)=>Facing*new Vector3(along,y,outward);
}
// A terrace block for supporters. Role 0: the home club (at a neutral venue: the team flagged home,
// always on x-); role 1: the visitors in the opposite end, fenced off unless the venue is neutral.
// From/To: side-local extent of the people; Margin: crowd-free strip beside the block.
public sealed class SupporterBlock {public int Side,Role,FirstRow,LastRow;public float From,To,Margin;public bool Fenced;public string Form;}
public sealed class StadiumBlueprint {
    // Groups 0..3 are the stand sides in ProbeBridge order (z-, z+, x-, x+) and
    // hide with their stand; group 4 is far surroundings, sky and corner flags.
    public const int Groups=5,Surroundings=4;
    public string ClubId,Archetype,Motif;public int[] Rows;public bool[] Roofs;public bool Detailed;
    // Venue key, identity source (authored | legacy-derived | standard), country, size class.
    public string Venue,Source,Country,SizeClass;public StadiumIdentity Structure;
    public readonly List<StadiumPiece> Pieces=new List<StadiumPiece>();
    public readonly StandTerrace[] Terraces=new StandTerrace[4];
    public readonly List<SupporterBlock> Blocks=new List<SupporterBlock>();
    // Distance from the pitch centre to each stand's front (camera hide line).
    public readonly float[] Fronts=new float[4];
    // The innermost extent includes cantilever roofs and their light rails.
    // Hiding by terrace fronts alone let close cameras enter a roof overhang.
    public readonly float[] CameraFronts=new float[4];
    public readonly Dictionary<StadiumSlot,Color> Colors=new Dictionary<StadiumSlot,Color>();
    public int PitchPattern,PitchStripes;public Color TurfA,TurfB;public float Wear;
    public Color SeatColor,CrowdHome,CrowdTrim;public float CrowdDensity;
    // Club identity pattern (StadiumArchitecture.IdentityPatterns) on pitch walls,
    // supporter banners and advertising boards, and its contrasting accent colour.
    public int Identity;public Color Accent;
    public int Count(StadiumSlot slot,int group=-1){int n=0;foreach(var p in Pieces)if(p.slot==slot&&(group<0||p.group==group))n++;return n;}
    public float Top(int group){float top=0;foreach(var p in Pieces)if(p.group==group&&p.slot!=StadiumSlot.Sky)top=Mathf.Max(top,p.center.y+Mathf.Abs(p.size.y)/2);return top;}
    // Highest point of the structural (non-detail) pieces of a group, rotation-aware: the
    // silhouette both qualities share.
    public float StructuralTop(int group){float top=0;foreach(var p in Pieces)if(p.group==group&&!p.detail&&p.slot!=StadiumSlot.Sky)top=Mathf.Max(top,BoundsOf(p).max.y);return top;}
    public bool SideVisible(int side,Vector3 camera,bool wasShown=true){
        float coordinate=side<2?camera.z:camera.x;if(side%2==0)coordinate=-coordinate;
        return coordinate-CameraFronts[side]<(wasShown?.4f:-.4f);
    }
    public static Bounds BoundsOf(StadiumPiece p){
        var h=p.shape==StadiumShape.Quad?new Vector3(p.size.x/2,p.size.y/2,.01f):p.shape==StadiumShape.Prism||p.shape==StadiumShape.Dome?new Vector3(p.size.x/2,p.size.y/2,p.size.x/2):p.size/2;
        var b=new Bounds(p.center,Vector3.zero);for(int i=0;i<8;i++)b.Encapsulate(p.center+p.rotation*new Vector3((i&1)==0?-h.x:h.x,(i&2)==0?-h.y:h.y,(i&4)==0?-h.z:h.z));return b;
    }
    public void MeasureCameraFronts(){
        for(int side=0;side<4;side++)CameraFronts[side]=Fronts[side];
        foreach(var p in Pieces){if(p.group>=4)continue;
            var half=p.shape==StadiumShape.Quad?new Vector3(p.size.x/2,p.size.y/2,.01f):p.shape==StadiumShape.Prism||p.shape==StadiumShape.Dome?new Vector3(p.size.x/2,p.size.y/2,p.size.x/2):p.size/2;
            for(int i=0;i<8;i++){var point=p.center+p.rotation*new Vector3((i&1)==0?-half.x:half.x,(i&2)==0?-half.y:half.y,(i&4)==0?-half.z:half.z);
                float coordinate=p.group<2?point.z:point.x;if(p.group%2==0)coordinate=-coordinate;
                CameraFronts[p.group]=Mathf.Min(CameraFronts[p.group],coordinate-.6f);
            }
        }
    }
    // Compact structural fingerprint for tests; colours are deliberately excluded.
    public string Signature(){
        var counts=new int[Enum.GetValues(typeof(StadiumSlot)).Length];foreach(var p in Pieces)counts[(int)p.slot]++;
        var s=new System.Text.StringBuilder(Archetype);foreach(var c in counts)s.Append('/').Append(c);
        for(int g=0;g<Groups;g++)s.Append('|').Append(Mathf.RoundToInt(Top(g)*2));return s.ToString();
    }
    // Highest built point across a band of the surroundings: behind the far stand along x (end=false)
    // or behind the right end along z (end=true). Sky, ground and water are not skyline.
    public float[] Skyline(bool end,int bins){
        var top=new float[bins];
        foreach(var p in Pieces){if(p.group!=Surroundings||p.slot==StadiumSlot.Sky||p.slot==StadiumSlot.Ground||p.slot==StadiumSlot.Water)continue;var b=BoundsOf(p);
            bool inside=end?b.center.x>Fronts[3]+6:b.center.z<-(Fronts[0]+6);if(!inside)continue;
            float lo=end?b.min.z:b.min.x,hi=end?b.max.z:b.max.x,range=end?200:280;
            for(int k=0;k<bins;k++){float a=-range/2+k*range/bins,c=a+range/bins;if(hi>=a&&lo<=c)top[k]=Mathf.Max(top[k],b.max.y);}}
        return top;
    }
    // Structural fingerprint: the declared identity groups plus measured stand heights (1.5 m
    // bands) and the far and end skylines (6 m bands) of the built pieces. Colours, names, IDs and
    // seeds are excluded; StadiumFingerprint.Distance counts the groups that differ.
    public List<StadiumFeature> StructuralFeatures(){
        var list=StadiumFingerprint.Declared(Structure);var heights=new string[4];for(int g=0;g<4;g++)heights[g]=Mathf.FloorToInt(StructuralTop(g)/1.5f).ToString();
        list.Add(new StadiumFeature{Group="heights",Value=string.Join("|",heights),Silhouette=true});
        string Band(float[] v){var s=new string[v.Length];for(int i=0;i<v.Length;i++)s[i]=Mathf.FloorToInt(v[i]/6).ToString();return string.Join(",",s);}
        list.Add(new StadiumFeature{Group="skyline",Value=Band(Skyline(false,8))+"/"+Band(Skyline(true,5)),Silhouette=true});
        return list;
    }
    public string StructuralFingerprint(){var parts=new List<string>();foreach(var f in StructuralFeatures())parts.Add(f.ToString());return string.Join(";",parts);}
}
public static class StadiumArchitecture {
    public static readonly string[] Archetypes={"civic-bowl","modern-ring","industrial-shed","dockside-ground","urban-court","garden-ground","sun-terraces","hillside-ground"};
    public static readonly string[] IdentityPatterns={"stripes","chevrons","blocks","diamonds","waves","hoops"};
    // Facade motif suggests two related patterns; the profile seed picks one.
    public static int IdentityOf(string motif,int seed){
        motif=motif??"";int a,b;
        if(motif.Contains("brick")){a=5;b=2;}else if(motif.Contains("colonnade")){a=0;b=3;}else if(motif.Contains("tiled")){a=3;b=1;}
        else if(motif.Contains("timber")){a=0;b=4;}else if(motif.Contains("limestone")||motif.Contains("step")){a=2;b=5;}else if(motif.Contains("harbor")){a=4;b=0;}
        else if(motif.Contains("truss")){a=1;b=2;}else if(motif.Contains("fins")){a=1;b=0;}else{a=2;b=4;}
        return (seed&1)==0?a:b;
    }
    // Board and banner texel of an identity pattern in a w x h panel.
    public static bool PatternTexel(int identity,int u,int v,int w,int h){
        int cy=h/2;
        switch(identity){
            case 0:return u%12<5;
            case 1:return (u+Math.Abs(v-cy))%16<6;
            case 2:return (u/8+v*2/Math.Max(1,h))%2==0;
            case 3:return Math.Abs(u%16-8)+Math.Abs(v-cy)*16/Math.Max(1,h)<7;
            case 4:return Math.Abs(v-cy-h*.28f*Mathf.Sin(u*Mathf.PI*2/32))<h*.12f;
            default:return v*6/Math.Max(1,h)%2==1;
        }
    }
    static float Luma(Color c){float L(float x)=>x<=.04045f?x/12.92f:Mathf.Pow((x+.055f)/1.055f,2.4f);return .2126f*L(c.r)+.7152f*L(c.g)+.0722f*L(c.b);}
    static float Contrast(Color a,Color b){float x=Luma(a),y=Luma(b);return (Mathf.Max(x,y)+.05f)/(Mathf.Min(x,y)+.05f);}
    // The club trim when it stands out against the home colour, else white or ink.
    public static Color AccentOf(Color home,Color trim){
        if(Contrast(trim,home)>=1.8f)return trim;var white=new Color(.95f,.95f,.93f);var ink=new Color(.07f,.08f,.10f);
        return Contrast(white,home)>=Contrast(ink,home)?white:ink;
    }
    // Archetype base: gaps, rake, clearance, crowd density and palette (legacy constants; an
    // authored identity overrides the stand forms, roofs and materials built on top of them).
    sealed class Style {
        public float rise,frontWall,gapLong,gapEnd,clearance,crowd,aisle;
        public Color concrete,roofColor,steel,cladding,brick,ground;
    }
    static Color C(float r,float g,float b){return new Color(r,g,b);}
    static Style StyleOf(string archetype){
        switch(archetype){
            case "modern-ring":return new Style{rise=.5f,frontWall=1.5f,gapLong=5.5f,gapEnd=6.5f,clearance=3.6f,crowd=.93f,aisle=11,concrete=C(.74f,.75f,.77f),roofColor=C(.86f,.87f,.89f),steel=C(.80f,.82f,.85f),cladding=C(.26f,.29f,.34f),brick=C(.45f,.30f,.26f),ground=C(.20f,.21f,.23f)};
            case "industrial-shed":return new Style{rise=.3f,frontWall=1.1f,gapLong=5.5f,gapEnd=6.5f,clearance=2.8f,crowd=.86f,aisle=14,concrete=C(.46f,.45f,.43f),roofColor=C(.36f,.42f,.40f),steel=C(.55f,.24f,.17f),cladding=C(.34f,.42f,.39f),brick=C(.50f,.27f,.20f),ground=C(.22f,.22f,.21f)};
            case "dockside-ground":return new Style{rise=.38f,frontWall=1.2f,gapLong=5.5f,gapEnd=6.5f,clearance=3f,crowd=.84f,aisle=12,concrete=C(.52f,.52f,.50f),roofColor=C(.24f,.27f,.31f),steel=C(.86f,.66f,.16f),cladding=C(.38f,.41f,.45f),brick=C(.47f,.25f,.19f),ground=C(.25f,.25f,.25f)};
            case "urban-court":return new Style{rise=.58f,frontWall=1.4f,gapLong=4.6f,gapEnd=5.4f,clearance=2.6f,crowd=.95f,aisle=9,concrete=C(.50f,.50f,.52f),roofColor=C(.19f,.20f,.22f),steel=C(.30f,.31f,.33f),cladding=C(.62f,.57f,.50f),brick=C(.58f,.37f,.29f),ground=C(.18f,.18f,.19f)};
            case "garden-ground":return new Style{rise=.32f,frontWall=1f,gapLong=6.2f,gapEnd=7.2f,clearance=2.6f,crowd=.78f,aisle=10,concrete=C(.70f,.68f,.62f),roofColor=C(.46f,.22f,.18f),steel=C(.17f,.26f,.20f),cladding=C(.90f,.88f,.82f),brick=C(.55f,.31f,.24f),ground=C(.20f,.31f,.16f)};
            case "sun-terraces":return new Style{rise=.48f,frontWall=1.3f,gapLong=5.5f,gapEnd=6.5f,clearance=3.2f,crowd=.82f,aisle=12,concrete=C(.88f,.85f,.78f),roofColor=C(.95f,.94f,.90f),steel=C(.84f,.84f,.84f),cladding=C(.80f,.52f,.36f),brick=C(.72f,.46f,.32f),ground=C(.66f,.58f,.44f)};
            case "hillside-ground":return new Style{rise=.36f,frontWall=1.1f,gapLong=6f,gapEnd=7f,clearance=3f,crowd=.8f,aisle=12,concrete=C(.55f,.55f,.52f),roofColor=C(.28f,.31f,.29f),steel=C(.38f,.40f,.38f),cladding=C(.52f,.47f,.40f),brick=C(.50f,.36f,.28f),ground=C(.19f,.30f,.15f)};
            default:return new Style{rise=.42f,frontWall=1.3f,gapLong=5.5f,gapEnd=6.5f,clearance=3.2f,crowd=.88f,aisle=10,concrete=C(.60f,.58f,.54f),roofColor=C(.27f,.29f,.32f),steel=C(.70f,.72f,.75f),cladding=C(.70f,.65f,.56f),brick=C(.55f,.32f,.25f),ground=C(.23f,.24f,.22f)};
        }
    }
    // One stand side: local X along the stand, +Z away from the pitch.
    struct Side {
        public int index;public float front,half;public Quaternion facing;
        public Vector3 At(float along,float y,float outward){return facing*new Vector3(along,y,outward);}
    }
    sealed class Builder {
        public StadiumBlueprint plan;public System.Random random;public bool detailed,legacy,legacyCorners;public StadiumIdentity id;public Style style;public string archetype,motif;
        public float L,W,depth;public Side[] sides;public readonly float[] tops=new float[4],towerTops=new float[4];public readonly Vector3[] towerAt=new Vector3[4];
        public void Add(int group,StadiumSlot slot,StadiumShape shape,Vector3 center,Vector3 size,Quaternion rotation,float shade=1,int sides=0){
            if(!detailed&&shade<0)return;float s=Mathf.Abs(shade);
            plan.Pieces.Add(new StadiumPiece{group=group,slot=slot,shape=shape,center=center,size=size,rotation=rotation,tint=new Color(s,s,s,1),sides=sides,detail=shade<0});
        }
        // Coloured vertex tint (haze layers, snow caps); detail pieces drop in reduced quality.
        public void Tinted(int group,StadiumSlot slot,StadiumShape shape,Vector3 center,Vector3 size,Quaternion rotation,Color tint,bool detail=false,int sides=0){
            if(!detailed&&detail)return;tint.a=1;plan.Pieces.Add(new StadiumPiece{group=group,slot=slot,shape=shape,center=center,size=size,rotation=rotation,tint=tint,sides=sides,detail=detail});
        }
        public void Box(int group,StadiumSlot slot,Vector3 center,Vector3 size,Quaternion rotation,float shade=1){Add(group,slot,StadiumShape.Box,center,size,rotation,shade);}
        // A box given in a side's local frame.
        public void Local(Side side,StadiumSlot slot,float along,float y,float outward,Vector3 size,float shade=1,int group=-1){Box(group<0?side.index:group,slot,side.At(along,y,outward),size,side.facing,shade);}
        public float Range(float a,float b){return a+(float)random.NextDouble()*(b-a);}
        public StadiumSlot Wall=>id.Facade==FacadeMaterial.Brick?StadiumSlot.Brick:StadiumSlot.Cladding;
        public bool Landmark(LandmarkKind kind,LandmarkPlace place){foreach(var l in id.Landmarks)if(l.Kind==kind&&l.Place==place)return true;return false;}
        public bool Near(SurroundingKind kind){return Array.IndexOf(id.Surroundings,kind)>=0;}
    }
    static int GroupOf(Vector3 p,float L,float W){return Mathf.Abs(p.z)-W/2>=Mathf.Abs(p.x)-L/2?(p.z<0?0:1):(p.x<0?2:3);}
    const float Band=2.6f;

    // supporters=false builds the Release 130 stadium without supporter blocks (pages without a
    // presentation); with a legacy-derived identity the pieces equal the Release 130 generator's.
    public static StadiumBlueprint Plan(ClubStadiumProfile profile,float length,float width,Color home,Color trim,bool detailed=true,bool supporters=true){
        if(profile==null)throw new ArgumentNullException(nameof(profile));
        var id=profile.Identity??ClubStadiumProfiles.DeriveIdentity(profile);
        string archetype=Array.IndexOf(Archetypes,profile.Archetype)>=0?profile.Archetype:"garden-ground";var style=StyleOf(archetype);
        // Copies only: the profile instance remains exactly as resolved.
        var rows=new int[4];var roofs=new bool[4];
        for(int i=0;i<4;i++){rows[i]=Mathf.Clamp(profile.TierCounts!=null&&profile.TierCounts.Length==4?profile.TierCounts[i]:4,0,24);roofs[i]=id.Stands[i].Roof.Kind!=RoofKind.None;}
        float depth=Mathf.Clamp(float.IsNaN(profile.StandDepth)?8:profile.StandDepth,3,26),overhang=Mathf.Clamp(float.IsNaN(profile.RoofOverhang)?1:profile.RoofOverhang,0,4.5f),mast=Mathf.Clamp(float.IsNaN(profile.MastHeight)?26:profile.MastHeight,14,44);
        string motif=profile.FacadeMotif??"";bool legacy=id.Source=="legacy-derived";
        var plan=new StadiumBlueprint{ClubId=profile.ClubId,Archetype=archetype,Motif=motif,Rows=rows,Roofs=roofs,Detailed=detailed,Venue=profile.Venue??profile.ClubId,Source=id.Source,Country=id.Country,SizeClass=id.SizeClass,Structure=id};
        var b=new Builder{plan=plan,random=new System.Random(profile.DetailSeed),detailed=detailed,legacy=legacy,legacyCorners=profile.CornerBuildings,id=id,style=style,archetype=archetype,motif=legacy?motif:MotifOf(id.Facade),L=length,W=width,depth=depth};
        float L=length,W=width;
        Palette(plan,b,motif,home,trim);
        // The club's own pattern (also on a shared standard ground); league grounds: seed == DetailSeed.
        plan.Identity=IdentityOf(motif,ClubStadiumProfiles.Seed(profile.ClubId??""));plan.Accent=AccentOf(home,trim);plan.Colors[StadiumSlot.Accent]=plan.Accent;
        // Authored grounds sit as close as the boards allow for their size; legacy keeps the archetype gaps.
        float gapLong=legacy?style.gapLong:id.SizeClass=="S"?4.7f:5.5f,gapEnd=legacy?style.gapEnd:id.SizeClass=="S"?5.6f:6.5f;
        var sides=new Side[4];b.sides=sides;
        for(int i=0;i<4;i++){
            bool longSide=i<2;int sign=i%2==0?-1:1;
            sides[i]=new Side{index=i,front=longSide?W/2+gapLong:L/2+gapEnd,half=longSide?L/2+gapEnd-1.5f:W/2+gapLong-1.5f,
                facing=Quaternion.LookRotation(longSide?new Vector3(0,0,sign):new Vector3(sign,0,0))};
            plan.Fronts[i]=sides[i].front;
        }
        // Terrace layout first, so supporter blocks are reserved before the crowd is laid out.
        for(int i=0;i<4;i++)plan.Terraces[i]=Layout(b,sides[i],rows[i],depth*(i<2?1:.88f));
        if(supporters)Reserve(plan,id);
        for(int i=0;i<4;i++)b.tops[i]=Stand(b,sides[i],plan.Terraces[i],overhang);
        Corners(b,sides,rows,depth);
        Floodlights(b,sides,depth,mast,overhang);
        Entrances(b,sides,depth);
        Landmarks(b,sides,depth);
        if(legacy)LegacySurroundings(b,archetype,L,W,depth);else Surroundings(b,L,W,depth);
        PitchSide(b,sides[0],L,W);
        plan.MeasureCameraFronts();
        return plan;
    }
    static string MotifOf(FacadeMaterial m){
        switch(m){case FacadeMaterial.Brick:return "brick-arcade";case FacadeMaterial.Stone:return "stone-colonnade";case FacadeMaterial.Limestone:return "limestone-step";case FacadeMaterial.Tile:return "tiled-parapet";
            case FacadeMaterial.Timber:return "timber-rib";case FacadeMaterial.SteelFin:return "metal-fins";case FacadeMaterial.Slat:return "harbor-slat";default:return "concrete-frame";}
    }
    static Color MaterialTone(FacadeMaterial m){
        switch(m){case FacadeMaterial.Brick:return C(.56f,.29f,.22f);case FacadeMaterial.Stone:return C(.82f,.79f,.71f);case FacadeMaterial.Limestone:return C(.86f,.82f,.70f);case FacadeMaterial.Tile:return C(.84f,.85f,.87f);
            case FacadeMaterial.Timber:return C(.40f,.29f,.20f);case FacadeMaterial.SteelFin:return C(.60f,.64f,.69f);case FacadeMaterial.Slat:return C(.33f,.40f,.39f);default:return C(.64f,.64f,.62f);}
    }

    static void Palette(StadiumBlueprint plan,Builder b,string motif,Color home,Color trim){
        var style=b.style;string archetype=b.archetype;var id=b.id;var cladding=style.cladding;
        if(motif.Contains("brick"))cladding=style.brick;else if(motif.Contains("limestone")||motif.Contains("stone"))cladding=Color.Lerp(cladding,C(.80f,.76f,.66f),.6f);
        else if(motif.Contains("tiled"))cladding=Color.Lerp(cladding,C(.78f,.48f,.32f),.55f);else if(motif.Contains("timber"))cladding=Color.Lerp(cladding,C(.52f,.38f,.25f),.5f);
        else if(motif.Contains("harbor"))cladding=Color.Lerp(cladding,C(.24f,.36f,.46f),.5f);else if(motif.Contains("fins")||motif.Contains("metal"))cladding=Color.Lerp(cladding,C(.60f,.63f,.67f),.4f);
        var c=plan.Colors;c[StadiumSlot.Concrete]=style.concrete;c[StadiumSlot.Roof]=style.roofColor;c[StadiumSlot.Steel]=motif.Contains("steel")&&archetype!="dockside-ground"?Color.Lerp(style.steel,C(.30f,.36f,.44f),.5f):style.steel;
        c[StadiumSlot.Cladding]=cladding;c[StadiumSlot.Brick]=style.brick;c[StadiumSlot.Trim]=home;c[StadiumSlot.Glass]=C(.55f,.62f,.70f);c[StadiumSlot.Lamp]=C(.95f,.94f,.88f);c[StadiumSlot.Shade]=C(.05f,.05f,.06f);
        c[StadiumSlot.Grass]=archetype=="sun-terraces"?C(.46f,.50f,.30f):C(.27f,.43f,.22f);c[StadiumSlot.Foliage]=archetype=="sun-terraces"?C(.30f,.42f,.18f):C(.16f,.30f,.15f);c[StadiumSlot.Water]=C(.07f,.14f,.21f);c[StadiumSlot.Ground]=style.ground;c[StadiumSlot.Sky]=Color.white;
        c[StadiumSlot.Crowd]=Color.white;c[StadiumSlot.Seat]=Color.white;c[StadiumSlot.Haze]=C(.30f,.33f,.40f);
        // Seats: civic and garden grounds keep neutral seats; others use club colours.
        plan.SeatColor=archetype=="civic-bowl"||archetype=="garden-ground"||archetype=="hillside-ground"?Color.Lerp(home,C(.35f,.36f,.38f),.65f):archetype=="sun-terraces"?Color.Lerp(home,Color.white,.15f):home;
        if(!b.legacy){
            // Authored: the facade material sets the walls, the identity its steel and roof tones,
            // seats carry the club colour (slightly muted in old timber and brick grounds).
            var tone=MaterialTone(id.Facade);c[StadiumSlot.Cladding]=tone;if(id.Facade==FacadeMaterial.Brick)c[StadiumSlot.Brick]=tone;
            if(ColorUtility.TryParseHtmlString(id.Steel??"",out var steel))c[StadiumSlot.Steel]=steel;if(ColorUtility.TryParseHtmlString(id.RoofTone??"",out var roof))c[StadiumSlot.Roof]=roof;
            plan.SeatColor=id.Facade==FacadeMaterial.Timber||id.Facade==FacadeMaterial.Brick?Color.Lerp(home,C(.30f,.30f,.32f),.3f):home;
        }
        plan.CrowdHome=home;plan.CrowdTrim=trim;plan.CrowdDensity=style.crowd;
        plan.TurfA=C(.36f,.53f,.29f);plan.TurfB=C(.31f,.47f,.25f);plan.Wear=1;plan.PitchStripes=12;plan.PitchPattern=0;
        switch(archetype){
            case "modern-ring":plan.PitchStripes=16;plan.Wear=.6f;plan.TurfA=C(.34f,.54f,.28f);plan.TurfB=C(.28f,.46f,.23f);break;
            case "industrial-shed":plan.PitchStripes=10;plan.Wear=1.5f;plan.TurfA=C(.37f,.50f,.28f);plan.TurfB=C(.33f,.45f,.25f);break;
            case "dockside-ground":plan.PitchStripes=14;plan.PitchPattern=1;plan.Wear=1.2f;break;
            case "urban-court":plan.PitchStripes=18;plan.Wear=1.1f;plan.TurfA=C(.33f,.51f,.27f);plan.TurfB=C(.29f,.45f,.24f);break;
            case "garden-ground":plan.PitchStripes=10;plan.PitchPattern=1;plan.Wear=1.3f;plan.TurfA=C(.38f,.55f,.29f);plan.TurfB=C(.32f,.48f,.25f);break;
            case "sun-terraces":plan.PitchStripes=12;plan.PitchPattern=2;plan.Wear=1.2f;plan.TurfA=C(.42f,.56f,.30f);plan.TurfB=C(.36f,.50f,.27f);break;
            case "hillside-ground":plan.PitchStripes=8;plan.PitchPattern=2;plan.Wear=1.1f;plan.TurfA=C(.32f,.50f,.26f);plan.TurfB=C(.27f,.44f,.22f);break;
        }
    }

    // ---- Terraces and supporter blocks -------------------------------------------------------
    // Rake and pitch wall by stand form; legacy-derived stands keep their archetype values.
    static StandTerrace Layout(Builder b,Side side,int rows,float depth){
        var spec=b.id.Stands[side.index];var form=spec.Form;var style=b.style;
        // A shortened legacy main stand (garden grounds) keeps the Release 130 length rule.
        var t=new StandTerrace{Side=side.index,Rows=rows,Front=side.front,Facing=side.facing,Half=b.legacy&&spec.Span<1?Mathf.Min(side.half,b.L*.32f):side.half*Mathf.Clamp(spec.Span,.3f,1),Roofed=spec.Roof.Kind!=RoofKind.None};
        if(rows<=0)return t;
        t.Standing=form==StandForm.OpenBank||form==StandForm.SingleTerrace||form==StandForm.KopEnd;
        float rise=style.rise,wall=style.frontWall;
        if(!b.legacy)switch(form){
            case StandForm.SingleTerrace:rise=.36f;wall=1.15f;break;case StandForm.KopEnd:rise=.6f;wall=1.5f;break;case StandForm.MainStand:rise=Mathf.Max(rise,.46f);wall=Mathf.Max(wall,1.3f);break;
            case StandForm.TwoTier:rise=Mathf.Max(rise,.48f);wall=Mathf.Max(wall,1.3f);break;case StandForm.ThreeTier:rise=Mathf.Max(rise,.5f);wall=Mathf.Max(wall,1.4f);break;
            case StandForm.SeatedSingle:rise=Mathf.Max(rise,.42f);wall=Mathf.Max(wall,1.2f);break;
        }
        t.Rise=rise;t.Podium=Mathf.Clamp(spec.HeightOffset,0,3);t.Wall=wall+t.Podium;
        int tiers=t.Standing?1:Mathf.Clamp(spec.Tiers,1,3);
        if(form==StandForm.OpenBank){
            float total=rows*Mathf.Clamp(depth/rows,.6f,1.6f)+2,height=rows*rise+1;t.RowDepth=total/rows;t.Wall=0;t.BankHeight=height;t.BankTotal=total;t.Out=new float[rows];t.Tread=new float[rows];
            for(int i=0;i<rows;i++){t.Out[i]=side.front+i*t.RowDepth;t.Tread[i]=(i+.5f)/rows*height;}
            return t;
        }
        t.RowDepth=Mathf.Clamp(depth/rows,.6f,1.6f);
        // Legacy two-tier stands split from 11 rows; authored tiers need three rows each.
        if(tiers==2&&rows>=(b.legacy?11:6))t.TierStarts=new[]{Mathf.RoundToInt(rows*.55f)};
        else if(tiers==3&&rows>=9){int a=Mathf.RoundToInt(rows*.42f);t.TierStarts=new[]{a,a+Mathf.Max(3,Mathf.RoundToInt(rows*.3f))};}
        t.Out=new float[rows];t.Tread=new float[rows];
        for(int i=0;i<rows;i++){int tier=t.TierOf(i);t.Out[i]=side.front+(i-2*tier)*t.RowDepth;t.Tread[i]=t.Wall+i*rise+Band*tier;}
        return t;
    }
    static void Reserve(StadiumBlueprint plan,StadiumIdentity id){
        var sp=id.Supporters;int homeSide=sp.Neutral||sp.HomeEnd!=3?2:3,awaySide=homeSide==2?3:2;
        SupporterBlock Rows(StandTerrace t,HomeBlockForm form,int role){
            if(t==null||t.Rows<2)return null;int lower=t.LowerRows;var block=new SupporterBlock{Side=t.Side,Role=role,FirstRow=0,LastRow=t.Rows-1,From=-t.Half+1.2f,To=t.Half-1.2f,Margin=.4f,Form=StadiumFingerprint.Kebab(form)};
            switch(form){
                case HomeBlockForm.CentralBlock:block.From=-t.Half*.55f;block.To=t.Half*.55f;break;
                case HomeBlockForm.LowerTier:block.LastRow=Mathf.Max(1,lower-1);break;
                case HomeBlockForm.UpperTier:block.FirstRow=lower<t.Rows-1?lower:t.Rows/2;break;
            }
            return block;
        }
        var home=Rows(plan.Terraces[homeSide],sp.HomeForm,0);
        if(sp.Neutral){
            // Equal ends: the smaller end decides rows and width for both clubs.
            var away=Rows(plan.Terraces[awaySide],sp.HomeForm,1);if(home==null||away==null)return;
            int first=Mathf.Max(home.FirstRow,away.FirstRow),last=Mathf.Min(home.LastRow,away.LastRow);float w=Mathf.Min(home.To-home.From,away.To-away.From);
            foreach(var block in new[]{home,away}){block.FirstRow=first;block.LastRow=last;block.From=-w/2;block.To=w/2;Add(plan,block);}
            return;
        }
        if(home!=null)Add(plan,home);
        var t2=plan.Terraces[awaySide];if(t2==null||t2.Rows<2)return;
        float width=Mathf.Clamp(sp.AwayWidth,.18f,.32f)*t2.Half*2;int lower2=t2.LowerRows;
        var visitors=new SupporterBlock{Side=awaySide,Role=1,FirstRow=0,LastRow=t2.Rows-1,Fenced=true,Margin=1.4f,Form=StadiumFingerprint.Kebab(sp.AwayPosition)};
        switch(sp.AwayPosition){
            case AwayBlockPosition.CornerLeft:visitors.From=-t2.Half+1.2f;visitors.To=visitors.From+width;break;
            case AwayBlockPosition.CornerRight:visitors.To=t2.Half-1.2f;visitors.From=visitors.To-width;break;
            case AwayBlockPosition.UpperTier:visitors.From=-width/2;visitors.To=width/2;visitors.FirstRow=lower2<t2.Rows-1?lower2:t2.Rows/2;break;
            default:visitors.From=-width/2;visitors.To=width/2;visitors.LastRow=Mathf.Max(1,lower2-1);break;
        }
        Add(plan,visitors);
    }
    static void Add(StadiumBlueprint plan,SupporterBlock block){
        if(block.LastRow-block.FirstRow<1)return;plan.Blocks.Add(block);
        plan.Terraces[block.Side].Cuts.Add(new Vector4(block.From-block.Margin,block.To+block.Margin,block.FirstRow,block.LastRow));
    }

    // ---- Stands ------------------------------------------------------------------------------
    // Terraces, crowd, aisles, vomitories, podium, back facade and roof of one side.
    // Returns the tallest point so the floodlights can clear it.
    static float Stand(Builder b,Side side,StandTerrace t,float overhang){
        var spec=b.id.Stands[side.index];var form=spec.Form;int rows=t.Rows;float half=t.Half,rd=t.RowDepth;var style=b.style;
        if(rows<=0){b.Local(side,StadiumSlot.Concrete,0,.6f,side.front+.3f,new Vector3(half*2,1.2f,.4f));return 1.2f;}
        if(form==StandForm.OpenBank)return Bank(b,side,t);
        // Stepped concrete. Upper-tier rows float on a slab above the tier below; rows under an overhang are shaded.
        for(int i=0;i<rows;i++){
            int tier=t.TierOf(i);float treadTop=t.Tread[i],bottom=tier==0?0:t.Tread[t.TierStarts[tier-1]]-.7f;bool shaded=false;foreach(var s in t.TierStarts)shaded|=i>=s-2&&i<s;
            b.Local(side,StadiumSlot.Concrete,0,(treadTop+bottom)/2,t.Out[i]+rd/2,new Vector3(half*2,treadTop-bottom,rd),shaded?.62f:1-.012f*i);
        }
        foreach(var s in t.TierStarts){
            b.Local(side,StadiumSlot.Glass,0,t.Tread[s-1]+Band/2+.15f,t.Out[s-1]+rd+.25f,new Vector3(half*2,Band-.3f,.3f));
            b.Local(side,StadiumSlot.Trim,0,t.Tread[s]-.5f,t.Out[s]-.05f,new Vector3(half*2,.55f,.2f));
        }
        // Painted pitch-side wall in the club colour; a raised stand stands on a podium below it.
        float rail=t.Wall-t.Podium;
        b.Local(side,StadiumSlot.Trim,0,t.Podium+rail*.5f+.05f,side.front-.08f,new Vector3(half*2,rail*.85f,.16f));
        if(t.Podium>=.5f)Podium(b,side,t,form==StandForm.MainStand);
        // The camera-facing sides carry the club pattern; the near side is hidden by every match camera.
        if(side.index!=1)IdentityWall(b,side,half,t.Podium,rail);
        b.Local(side,StadiumSlot.Steel,0,t.Wall+.55f,side.front+.05f,new Vector3(half*2,.05f,.05f),-1);
        // Aisles every few metres and vomitory openings mid-way up the lowest tier.
        int lower=t.LowerRows;int aisles=Mathf.Max(1,Mathf.RoundToInt(half*2/style.aisle));float spacing=half*2/aisles;int vom=Mathf.Clamp(lower/2,1,Mathf.Max(1,lower-3));
        float Gap(int row,int aisle){bool opening=aisle%2==1&&row>=vom&&row<vom+3&&lower>=6;return opening?1.4f:.55f;}
        var aisleAt=new List<float>();
        for(int a=1;a<aisles;a++){
            float x=-half+a*spacing;aisleAt.Add(x);
            for(int i=0;i<rows;i++)b.Local(side,StadiumSlot.Concrete,x,t.Tread[i]+.1f,t.Out[i]+rd*.5f,new Vector3(1.0f,.2f,rd*.98f),-.8f);
            if(a%2==1&&lower>=6){
                float y0=t.Tread[vom]-.2f,y1=t.Tread[vom+2]+.15f,z0=t.Out[vom],z1=t.OutAt(vom+3);
                b.Local(side,StadiumSlot.Shade,x,(y0+y1)/2,(z0+z1)/2,new Vector3(2.4f,y1-y0,z1-z0));
                foreach(int s in new[]{-1,1})b.Local(side,StadiumSlot.Concrete,x+s*1.3f,y1+.15f,(z0+z1)/2,new Vector3(.2f,.5f,z1-z0),.9f);
            }
        }
        t.Aisles=aisleAt.ToArray();
        // Standing terraces: staggered crush barriers between the aisles.
        if(t.Standing)for(int i=1;i<rows;i+=2)for(int a=0;a<aisles;a++){
            float x0=-half+a*spacing+.9f,x1=-half+(a+1)*spacing-.9f,shift=(i/2)%2==0?0:(x1-x0)*.18f;if(x1-x0<2)continue;float w=(x1-x0)*.62f,x=(x0+x1)/2+shift-(x1-x0)*.09f;
            b.Local(side,StadiumSlot.Steel,x,t.Tread[i]+1.02f,t.Out[i]+.14f,new Vector3(w,.08f,.08f),-.9f);
            foreach(int s in new[]{-1,1})b.Local(side,StadiumSlot.Steel,x+s*w*.45f,t.Tread[i]+.52f,t.Out[i]+.14f,new Vector3(.07f,1f,.07f),-.9f);
        }
        if(form==StandForm.MainStand)MainStandBoxes(b,side,t);
        CrowdSegments(b,side,t,-half,half,i=>t.Out[i]+rd*.38f,i=>t.Tread[i],t.Standing,(i,a)=>Gap(i,a),spacing);
        if(side.index==0&&b.id.Supporters.Tifo==TifoStyle.Mosaic&&!b.id.Supporters.Neutral)Mosaic(b,side,half,Mathf.Min(lower,b.detailed?4:2),i=>t.Out[i]+rd*.38f,i=>t.Tread[i]);
        float back=t.Out[rows-1]+rd,top=t.Tread[rows-1]+1.6f;
        // Back facade with the club's motif, and side walls where the stand ends in the open.
        b.Local(side,b.Wall,0,top/2,back+.3f,new Vector3(half*2+1,top,.6f));
        Facade(b,side,half,back+.6f,top);
        if(!b.legacy)Flanks(b,side,t,back,top);
        if(form==StandForm.MainStand)b.Local(side,StadiumSlot.Glass,0,top+.75f,back-.2f,new Vector3(Mathf.Min(half*1.1f,30),1.5f,.9f));
        float roofTop=top;
        if(spec.Roof.Kind!=RoofKind.None)roofTop=Roof(b,side,t,back,top,overhang);
        else if(b.id.FlagPoles){
            // Open stands: flag poles along the top add a lively silhouette.
            int flags=Mathf.Max(2,Mathf.RoundToInt(half/8));for(int f=0;f<=flags;f++){float x=-half+f*half*2/flags;b.Local(side,StadiumSlot.Steel,x,top+2.2f,back+.2f,new Vector3(.08f,4.4f,.08f),-1);b.Local(side,f%2==0?StadiumSlot.Trim:StadiumSlot.Cladding,x+.6f,top+3.9f,back+.2f,new Vector3(1.2f,.8f,.03f),-1);}
        }
        return Mathf.Max(top,roofTop);
    }
    // A grassy embankment with a few concrete standing steps (garden and hillside grounds).
    static float Bank(Builder b,Side side,StandTerrace t){
        int rows=t.Rows;float half=t.Half,total=t.BankTotal,height=t.BankHeight;
        b.Add(side.index,StadiumSlot.Grass,StadiumShape.Wedge,side.At(0,height/2,side.front+total/2),new Vector3(half*2+6,height,total),side.facing);
        for(int i=0;i<rows;i+=2){float y=t.Tread[i],z=side.front+(i+.5f)/rows*total;b.Local(side,StadiumSlot.Concrete,0,y,z,new Vector3(half*1.4f,.18f,.55f),-.9f);}
        CrowdSegments(b,side,t,-half*.55f,half*.55f,i=>side.front+(i+.5f)/rows*total-.1f,i=>t.Tread[i],true,(i,x)=>0);
        b.Local(side,StadiumSlot.Steel,0,1.1f,side.front-.4f,new Vector3(half*2,.06f,.06f),-.9f);
        return height+1;
    }
    // Raised stands: the podium face below the pitch wall, in the facade material.
    static void Podium(Builder b,Side side,StandTerrace t,bool main){
        float half=t.Half,h=t.Podium+.08f,z=side.front-.05f;var m=b.id.Facade;
        b.Local(side,m==FacadeMaterial.Brick?StadiumSlot.Brick:m==FacadeMaterial.Timber?StadiumSlot.Cladding:StadiumSlot.Concrete,0,h/2,z+.12f,new Vector3(half*2,h,.3f));
        if(m==FacadeMaterial.Brick||m==FacadeMaterial.Stone||m==FacadeMaterial.Limestone){
            // Arcade: tall dark openings with piers between them.
            int n=Mathf.Max(4,Mathf.RoundToInt(half*2/3.4f));float w=half*2/n;
            for(int i=0;i<n;i++){float x=-half+(i+.5f)*w;if(main&&Mathf.Abs(x)<2.2f)continue;b.Local(side,StadiumSlot.Shade,x,h*.42f,z-.02f,new Vector3(w*.56f,h*.7f,.06f));b.Local(side,StadiumSlot.Concrete,x,h*.8f,z-.03f,new Vector3(w*.62f,.12f,.08f),-.9f);}
        }else if(m==FacadeMaterial.Timber){
            int n=Mathf.Max(3,Mathf.RoundToInt(half*2/6));for(int i=0;i<n;i++){float x=-half+(i+.5f)*half*2/n;if(main&&Mathf.Abs(x)<2.2f)continue;b.Local(side,StadiumSlot.Shade,x,h*.4f,z-.02f,new Vector3(1.1f,h*.75f,.06f));}
            for(float x=-half+.7f;x<half;x+=1.4f)b.Local(side,StadiumSlot.Cladding,x,h/2,z-.04f,new Vector3(.08f,h,.05f),-.85f);
        }else if(m==FacadeMaterial.Slat){
            // Shipyard plinth: brick base with wide roller doors between steel posts.
            b.Local(side,StadiumSlot.Brick,0,h/2,z+.02f,new Vector3(half*2,h,.12f));int n=Mathf.Max(3,Mathf.RoundToInt(half*2/7));float w=half*2/n;
            for(int i=0;i<n;i++){float x=-half+(i+.5f)*w;if(main&&Mathf.Abs(x)<2.2f)continue;b.Local(side,StadiumSlot.Shade,x,h*.4f,z-.04f,new Vector3(w*.62f,h*.74f,.06f));b.Local(side,StadiumSlot.Steel,x-w/2,h/2,z-.06f,new Vector3(.22f,h,.1f));}
        }else{
            // Glass lounge band with mullions.
            b.Local(side,StadiumSlot.Glass,0,h*.48f,z-.02f,new Vector3(half*2-1,h*.72f,.06f));
            for(float x=-half+1.8f;x<half-1;x+=3.6f)b.Local(side,StadiumSlot.Steel,x,h*.48f,z-.05f,new Vector3(.12f,h*.75f,.08f),-.9f);
        }
        if(main){
            // Players' tunnel with a short glass canopy (stays well behind the boards).
            b.Local(side,StadiumSlot.Shade,0,Mathf.Min(h,2.3f)*.5f,z-.03f,new Vector3(3.2f,Mathf.Min(h,2.3f),.06f));
            b.Local(side,StadiumSlot.Glass,0,Mathf.Min(h,2.3f)+.1f,z-.6f,new Vector3(3.8f,.1f,1.2f),-1);
        }
    }
    // Main stand: a glass directors' box in the back rows of the lowest tier.
    static void MainStandBoxes(Builder b,Side side,StandTerrace t){
        int r1=t.LowerRows-1,r0=Mathf.Max(0,r1-1);if(r1<2)return;float w=Mathf.Min(16,t.Half*.42f),y0=t.Tread[r0]+.1f,y1=t.Tread[r1]+2.3f,z=t.Out[r0]+.12f;
        b.Local(side,StadiumSlot.Glass,0,(y0+y1)/2,z+.2f,new Vector3(w,y1-y0,.3f));b.Local(side,StadiumSlot.Trim,0,y1+.15f,z+.5f,new Vector3(w+.6f,.3f,1.4f));
        foreach(int s in new[]{-1,1})b.Local(side,StadiumSlot.Concrete,s*(w/2+.15f),(y0+y1)/2,z+.6f,new Vector3(.3f,y1-y0,1.4f),-.9f);
        t.Cuts.Add(new Vector4(-w/2-.4f,w/2+.4f,r0,r1));
    }
    // Side walls where a stand ends without a filled corner: its rake reads in profile.
    static void Flanks(Builder b,Side side,StandTerrace t,float back,float top){
        bool longSide=side.index<2;
        foreach(int s in new[]{-1,1}){
            // Corner beside this end of the stand (along +X = to the right as seen from the pitch).
            var world=side.At(s*t.Half,0,side.front);int sx=world.x<0?-1:1,sz=world.z<0?-1:1;int corner=(sz<0?0:2)+(sx<0?0:1);
            var form=b.id.Corners[corner];bool open=form==CornerForm.Open||form==CornerForm.Tower||t.Half<b.sides[side.index].half-.5f;if(!open)continue;
            float depth=back-side.front;b.Add(side.index,b.Wall,StadiumShape.Wedge,side.At(s*(t.Half+.18f),top/2,side.front+depth/2),new Vector3(.36f,top,depth),side.facing,.92f);
        }
    }

    // Accent panels on the pitch face of the painted wall, in the club pattern.
    // Thin and flush, so the boards, pitch and camera sight lines stay clear.
    static void IdentityWall(Builder b,Side side,float half,float podium,float frontWall){
        float z=side.front-.175f,low=podium+.16f,high=podium+frontWall*.9f,h=high-low,mid=(low+high)/2;
        void Panel(float x,float y,float w,float height,float roll=0){if(Mathf.Abs(x)+w/2>half-.3f)return;b.Box(side.index,StadiumSlot.Accent,side.At(x,y,z),new Vector3(w,height,.03f),side.facing*Quaternion.Euler(0,0,roll));}
        switch(b.plan.Identity){
            case 0:for(float x=-half+1;x<half;x+=1.8f)Panel(x,mid,.45f,h);break;
            case 1:for(float x=-half+1.2f;x<half;x+=2.4f){Panel(x-.3f,mid,.26f,h*.95f,38);Panel(x+.3f,mid,.26f,h*.95f,-38);}break;
            case 2:{int k=0;for(float x=-half+.8f;x<half;x+=1.6f,k++)Panel(x,k%2==0?low+h*.25f:low+h*.75f,.8f,h*.5f);}break;
            case 3:for(float x=-half+1;x<half;x+=2f)Panel(x,mid,h*.55f,h*.55f,45);break;
            case 4:{int k=0;for(float x=-half+.6f;x<half;x+=1.2f,k++)Panel(x,low+h*(.5f+.3f*Mathf.Sin(k*Mathf.PI/3)),1.15f,h*.22f);}break;
            default:foreach(float f in new[]{.3f,.7f})b.Box(side.index,StadiumSlot.Accent,side.At(0,low+h*f,z),new Vector3(half*2-.6f,h*.16f,.03f),side.facing);break;
        }
    }
    // Supporter choreography across the front rows in the middle of the stand
    // opposite the cameras: the club pattern in home and accent colours, held
    // just in front of the spectators. Reduced quality keeps two rows.
    static void Mosaic(Builder b,Side side,float half,int rows,Func<int,float> outAt,Func<int,float> treadAt){
        int cells=Mathf.Min(16,Mathf.FloorToInt(half*.5f))*2;var lean=side.facing*Quaternion.Euler(-8,0,0);
        for(int i=0;i<rows;i++)for(int k=0;k<cells;k++){
            bool accent=PatternTexel(b.plan.Identity,k*4,rows<=1?14:(rows-1-i)*28/(rows-1),64,29);
            b.Box(side.index,accent?StadiumSlot.Accent:StadiumSlot.Trim,side.At(-cells/2f+k+.5f,treadAt(i)+.55f,outAt(i)-.06f),new Vector3(.98f,1.0f,.04f),lean);
        }
    }

    // Spectator strips per row between the aisles, minus the terrace cuts (supporter blocks and
    // boxes). Empty blocks show seats; standing terraces show bare steps.
    static void CrowdSegments(Builder b,Side side,StandTerrace t,float from,float to,Func<int,float> outAt,Func<int,float> treadAt,bool standing,Func<int,int,float> gap,float spacing=0){
        int count=spacing>0?Mathf.Max(1,Mathf.RoundToInt((to-from)/spacing)):1;float width=(to-from)/count;var style=b.style;int rows=t.Rows;
        for(int i=0;i<rows;i++)for(int a=0;a<count;a++){
            float x0=from+a*width+(a>0?gap(i,a):0),x1=from+(a+1)*width-(a<count-1?gap(i,a+1):0);if(x1-x0<.6f)continue;
            var parts=new List<Vector2>{new Vector2(x0,x1)};
            foreach(var c in t.Cuts){if(i<c.z||i>c.w)continue;var next=new List<Vector2>();foreach(var p in parts){if(c.y<=p.x||c.x>=p.y){next.Add(p);continue;}if(c.x>p.x)next.Add(new Vector2(p.x,c.x));if(c.y<p.y)next.Add(new Vector2(c.y,p.y));}parts=next;}
            foreach(var p in parts){
                if(p.y-p.x<.6f)continue;float y=treadAt(i),z=outAt(i);
                // Empty seats come in whole blocks; the profile seed decides where.
                bool empty=b.random.NextDouble()>style.crowd+(standing?.1f:0)+.06f*Mathf.Min(i,4)/4f;
                var centre=side.At((p.x+p.y)/2,y+.52f,z);
                if(empty){if(!standing||b.legacy)b.Box(side.index,StadiumSlot.Seat,side.At((p.x+p.y)/2,y+.24f,z+.12f),new Vector3(p.y-p.x,.48f,.2f),side.facing,.95f);continue;}
                // People lean back slightly so the upper rows read in the TV view.
                var rotation=side.facing*Quaternion.Euler(-8,0,0);
                b.plan.Pieces.Add(new StadiumPiece{group=side.index,slot=StadiumSlot.Crowd,shape=StadiumShape.Quad,center=centre,size=new Vector3(p.y-p.x,1.04f,0),rotation=rotation,tint=Color.white*(1-.015f*i),crowdU=(float)b.random.NextDouble(),crowdRow=b.random.Next(8)});
            }
        }
    }

    static void Facade(Builder b,Side side,float half,float back,float top){
        string motif=b.motif;
        // Detail on the outward face: pilasters always, motif-specific in detail mode.
        int bays=Mathf.Max(2,Mathf.RoundToInt(half*2/7));float bay=half*2/bays;
        for(int i=0;i<=bays;i++)b.Local(side,StadiumSlot.Concrete,-half+i*bay,top/2,back+.2f,new Vector3(.7f,top+.2f,.4f),.85f);
        if(motif.Contains("arcade")||motif.Contains("colonnade")){
            for(int i=0;i<bays;i++){float x=-half+(i+.5f)*bay;b.Local(side,StadiumSlot.Shade,x,1.6f,back+.05f,new Vector3(bay*.55f,3.2f,.2f),-1);
                if(motif.Contains("colonnade"))for(int c=-1;c<=1;c+=2)b.Add(side.index,StadiumSlot.Concrete,StadiumShape.Prism,side.At(x+c*bay*.3f,2.1f,back+.7f),new Vector3(.55f,4.2f,1),side.facing,-.95f);}
        }else if(motif.Contains("fins")||motif.Contains("slat")||motif.Contains("rib")){
            float step=motif.Contains("fins")?1.2f:1.8f;int n=Mathf.FloorToInt(half*2/step);
            for(int i=0;i<n;i++)b.Local(side,motif.Contains("rib")?StadiumSlot.Cladding:StadiumSlot.Steel,-half+(i+.5f)*step,top*.55f,back+.35f,new Vector3(.12f,top*.9f,.5f),-.9f);
        }else if(motif.Contains("truss")){
            for(int i=0;i<bays;i++){float x=-half+(i+.5f)*bay;foreach(int s in new[]{-1,1})b.Box(side.index,StadiumSlot.Steel,side.At(x,top*.5f,back+.45f),new Vector3(.14f,Mathf.Sqrt(bay*bay+top*top)*.92f,.14f),side.facing*Quaternion.Euler(0,0,s*Mathf.Atan2(bay,top)*Mathf.Rad2Deg),-1);}
        }else if(motif.Contains("tiled")||motif.Contains("parapet")){
            b.Local(side,StadiumSlot.Trim,0,top-.35f,back+.35f,new Vector3(half*2+1,.5f,.3f),-1);b.Local(side,StadiumSlot.Brick,0,top+.25f,back+.25f,new Vector3(half*2+1.2f,.5f,.8f));
        }else if(motif.Contains("limestone")||motif.Contains("step")){
            for(int s=0;s<3;s++)b.Local(side,StadiumSlot.Concrete,0,top*(s+1)/4f,back+.15f,new Vector3(half*2+1,.25f,.35f),-.9f);
        }
        // Staircase towers at both ends of bigger stands.
        if(top>6)foreach(int s in new[]{-1,1})b.Local(side,StadiumSlot.Concrete,s*(half-3),top*.55f,back+2.2f,new Vector3(4.2f,top*1.1f,3.6f),.9f);
    }

    // ---- Roofs ---------------------------------------------------------------------------------
    // Kind, coverage (share of the stand depth from the back), support and front edge.
    static float Roof(Builder b,Side side,StandTerrace t,float back,float top,float overhang){
        var spec=b.id.Stands[side.index].Roof;var style=b.style;float half=t.Half;
        float edge=side.front-overhang,front=Mathf.Lerp(back+.6f,edge,Mathf.Clamp(spec.Coverage,.25f,1));
        float y=top+style.clearance,deep=back+.6f-front,mid=(front+back+.6f)/2,span=half*2+1;
        t.RoofY=y;t.RoofFront=front;
        switch(spec.Kind){
            case RoofKind.Cantilever:return Cantilever(b,side,t,spec,front,back,y,deep,mid,span,true);
            case RoofKind.ArchSuspended:return Arch(b,side,t,spec,front,back,y,deep,mid,span);
            case RoofKind.Gable:return Gable(b,side,t,spec,front,back,y,deep,mid,span);
            case RoofKind.Sail:return Sails(b,side,front,back,y,deep,mid,span);
            case RoofKind.Barrel:return Barrel(b,side,t,spec,front,back,y,deep,mid,span);
            case RoofKind.Sawtooth:return Sawtooth(b,side,t,spec,front,back,y,deep,mid,span);
            case RoofKind.TrussGirder:return Girder(b,side,t,spec,front,back,y,deep,mid,span);
            default:return Flat(b,side,t,spec,front,back,y,deep,mid,span);
        }
    }
    static void RearColumns(Builder b,Side side,float back,float y,float mid,float deep,float span){
        int cols=Mathf.Max(2,Mathf.RoundToInt(span/8));
        for(int i=0;i<=cols;i++){float x=-span/2+i*span/cols;b.Local(side,StadiumSlot.Steel,x,(y+.2f)/2,back+.9f,new Vector3(.32f,y+.2f,.32f));Strut(b,side,StadiumSlot.Steel,side.At(x,y*.55f,back+.9f),side.At(x,y+.05f,mid-deep*.15f),.1f,-1);}
    }
    // Slim columns on the stand front: the classic view-obstructing posts of older grounds.
    static void FrontColumns(Builder b,Side side,StandTerrace t,float front,float y,float span){
        int n=Mathf.Max(2,Mathf.RoundToInt(span/9));float z=Mathf.Max(front+.3f,side.front+.25f),y0=t.Wall-.15f;
        for(int i=0;i<=n;i++){float x=-span/2+.3f+i*(span-.6f)/n;b.Local(side,StadiumSlot.Steel,x,(y0+y)/2,z,new Vector3(.24f,y-y0,.24f));}
    }
    // A lattice girder along the roof front, carried by end posts.
    static void FrontTruss(Builder b,Side side,StandTerrace t,float front,float y,float span){
        float z=front+.35f,low=y-1.7f;
        b.Local(side,StadiumSlot.Steel,0,y-.2f,z,new Vector3(span,.3f,.3f));b.Local(side,StadiumSlot.Steel,0,low,z,new Vector3(span,.25f,.25f));
        int n=Mathf.Max(6,Mathf.RoundToInt(span/2.6f));float step=span/n;
        for(int i=0;i<n;i++){float x=-span/2+i*step;Strut(b,side,StadiumSlot.Steel,side.At(x,low,z),side.At(x+step,y-.2f,z),.1f,-1);b.Local(side,StadiumSlot.Steel,x,(low+y-.2f)/2,z,new Vector3(.1f,y-.2f-low,.1f),-1);}
        foreach(int s in new[]{-1,1})b.Local(side,StadiumSlot.Steel,s*(span/2-.2f),y/2,Mathf.Max(z,side.front+.3f),new Vector3(.55f,y,.55f));
    }
    // Tension masts above the back, cables to the roof front (legacy cantilever).
    static float Masts(Builder b,Side side,float back,float front,float y,float mid,float span){
        int masts=Mathf.Max(2,Mathf.RoundToInt(span/14));float half=span/2-.5f;
        for(int i=0;i<=masts;i++){float x=-half+i*half*2/masts;float h=y+6;
            b.Local(side,StadiumSlot.Steel,x,h/2,back+1.2f,new Vector3(.45f,h,.45f));
            Strut(b,side,StadiumSlot.Steel,side.At(x,h,back+1.2f),side.At(x,y+.2f,front+1),.07f,-1);
            Strut(b,side,StadiumSlot.Steel,side.At(x,h,back+1.2f),side.At(x,y+1,mid),.07f,-1);}
        return y+6;
    }
    static float Cantilever(Builder b,Side side,StandTerrace t,RoofSpec spec,float front,float back,float y,float deep,float mid,float span,bool supports){
        // Thin sloping roof with a translucent leading edge.
        float tilt=Mathf.Atan2(1.4f,deep)*Mathf.Rad2Deg;var r=side.facing*Quaternion.Euler(-tilt,0,0);float drop=deep*.38f*Mathf.Tan(tilt*Mathf.Deg2Rad);float lift=0;
        if(spec.Edge==RoofEdge.Curved&&!b.legacy){
            // A smiling front edge: the roof rises toward the middle of the stand in short steps.
            int n=Mathf.Max(6,Mathf.RoundToInt(span/7));float w=span/n;lift=Mathf.Min(3.2f,span*.045f);
            for(int i=0;i<n;i++){float x=-span/2+(i+.5f)*w,k=x/(span/2),dy=lift*(1-k*k);
                b.Box(side.index,StadiumSlot.Roof,side.At(x,y+.7f+dy,mid+deep*.12f),new Vector3(w+.04f,.22f,deep*.76f),r);
                b.Box(side.index,StadiumSlot.Glass,side.At(x,y+.7f+dy-drop-.02f,front+deep*.12f),new Vector3(w+.04f,.12f,deep*.24f),r);
                b.Local(side,StadiumSlot.Trim,x,y+dy,front-.1f,new Vector3(w+.04f,.5f,.25f));}
        }else{
            b.Box(side.index,StadiumSlot.Roof,side.At(0,y+.7f,mid+deep*.12f),new Vector3(span,.22f,deep*.76f),r);
            b.Box(side.index,StadiumSlot.Glass,side.At(0,y+.7f-drop-.02f,front+deep*.12f),new Vector3(span,.12f,deep*.24f),r);
            b.Local(side,StadiumSlot.Trim,0,y,front-.1f,new Vector3(span,.5f,.25f));
        }
        if(!supports)return y+1.2f+lift;
        switch(spec.Support){
            case RoofSupport.MastCable:return Masts(b,side,back,front,y,mid,span)+lift;
            case RoofSupport.Truss:FrontTruss(b,side,t,front,y,span);return y+1.2f+lift;
            case RoofSupport.Columns:FrontColumns(b,side,t,front,y,span);RearColumns(b,side,back,y,mid,deep,span);return y+1.2f+lift;
            default:{
                // Deep cantilever ribs from rear columns: no masts, no posts.
                int n=Mathf.Max(2,Mathf.RoundToInt(span/9));
                for(int i=0;i<=n;i++){float x=-span/2+.3f+i*(span-.6f)/n;b.Local(side,StadiumSlot.Steel,x,(y+.4f)/2,back+.9f,new Vector3(.42f,y+.4f,.42f));Strut(b,side,StadiumSlot.Steel,side.At(x,y-1.3f,back+.9f),side.At(x,y+.45f,front+deep*.3f),.18f,-1);}
                return y+1.2f+lift;
            }
        }
    }
    static float Flat(Builder b,Side side,StandTerrace t,RoofSpec spec,float front,float back,float y,float deep,float mid,float span){
        // Flat roof, coloured fascia and rear columns with raking struts.
        b.Box(side.index,StadiumSlot.Roof,side.At(0,y+.25f,mid),new Vector3(span,.32f,deep),side.facing*Quaternion.Euler(-Mathf.Atan2(.5f,deep)*Mathf.Rad2Deg,0,0));
        b.Local(side,StadiumSlot.Trim,0,y,front-.12f,new Vector3(span,.8f,.24f));
        RearColumns(b,side,back,y,mid,deep,span);
        if(spec.Support==RoofSupport.Columns&&!b.legacy)FrontColumns(b,side,t,front,y,span);
        else if(spec.Support==RoofSupport.Truss)FrontTruss(b,side,t,front,y,span);
        else if(spec.Support==RoofSupport.MastCable)return Masts(b,side,back,front,y,mid,span);
        return y+.6f;
    }
    static float Gable(Builder b,Side side,StandTerrace t,RoofSpec spec,float front,float back,float y,float deep,float mid,float span){
        if(spec.Edge==RoofEdge.Gabled&&!b.legacy){
            // A row of transverse gables facing the pitch, on front columns.
            int n=Mathf.Max(3,Mathf.RoundToInt(span/7));float w=span/n,a=28,ridge=w*.5f*Mathf.Tan(a*Mathf.Deg2Rad);
            for(int i=0;i<n;i++){float x=-span/2+(i+.5f)*w;
                foreach(int s in new[]{-1,1}){b.Box(side.index,StadiumSlot.Roof,side.At(x+s*w/4,y+ridge/2,mid),new Vector3(w/2/Mathf.Cos(a*Mathf.Deg2Rad)+.05f,.18f,deep),side.facing*Quaternion.Euler(0,0,-s*a));
                    b.Add(side.index,b.Wall,StadiumShape.Wedge,side.At(x+s*w/4,y+ridge/2,front+.12f),new Vector3(.22f,ridge,w/2),side.facing*Quaternion.Euler(0,s<0?90:-90,0),.95f);}}
            b.Local(side,StadiumSlot.Trim,0,y-.2f,front+.1f,new Vector3(span,.4f,.3f));FrontColumns(b,side,t,front,y-.2f,span);
            return y+ridge+.3f;
        }
        // Pitched roof on a row of front columns with a lattice truss; gable ends close the shed.
        float ridge2=deep*.5f*Mathf.Tan(16*Mathf.Deg2Rad);bool shed=b.legacy&&b.archetype!="garden-ground";
        foreach(int s in new[]{-1,1}){float c=mid+s*deep/4;b.Box(side.index,StadiumSlot.Roof,side.At(0,y+ridge2/2,c),new Vector3(span,.2f,deep/2/Mathf.Cos(16*Mathf.Deg2Rad)),side.facing*Quaternion.Euler(s*16,0,0));}
        float eave=y-.1f;int bays=Mathf.Max(2,Mathf.RoundToInt(span/(shed?6.5f:5)));float bay=span/bays;
        b.Local(side,StadiumSlot.Steel,0,eave-.3f,front+.3f,new Vector3(span,.35f,.3f));b.Local(side,StadiumSlot.Steel,0,eave-1.3f,front+.3f,new Vector3(span,.2f,.25f),-1);
        for(int i=0;i<=bays;i++){float x=-span/2+i*bay;b.Local(side,StadiumSlot.Steel,x,eave/2,side.front+.3f,new Vector3(.28f,eave,.28f));
            if(i<bays){Strut(b,side,StadiumSlot.Steel,side.At(x,eave-1.3f,front+.3f),side.At(x+bay,eave-.3f,front+.3f),.08f,-1);Strut(b,side,StadiumSlot.Steel,side.At(x,eave-.3f,front+.3f),side.At(x+bay,eave-1.3f,front+.3f),.08f,-1);}}
        foreach(int s in new[]{-1,1})foreach(int half2 in new[]{-1,1})b.Add(side.index,StadiumSlot.Cladding,StadiumShape.Wedge,side.At(s*span/2,y+ridge2/2,mid+half2*deep/4),new Vector3(.3f,ridge2,deep/2),side.facing*Quaternion.Euler(0,half2<0?0:180,0),.9f);
        if(!shed)b.Local(side,StadiumSlot.Cladding,0,y+ridge2+.6f,mid,new Vector3(3,1.2f,1.4f),.95f);
        return y+ridge2+1;
    }
    static float Sails(Builder b,Side side,float front,float back,float y,float deep,float mid,float span){
        // Separate shade sails on slender poles.
        int sails=Mathf.Max(2,Mathf.RoundToInt(span/12));float w=span/sails;
        for(int i=0;i<sails;i++){float x=-span/2+(i+.5f)*w;float twist=i%2==0?5:-5;
            b.Box(side.index,StadiumSlot.Roof,side.At(x,y+.9f,mid),new Vector3(w*.94f,.06f,deep),side.facing*Quaternion.Euler(-9,0,twist));
            foreach(int s in new[]{-1,1}){b.Local(side,StadiumSlot.Steel,x+s*w*.45f,(y+1.6f)/2,side.front+.4f,new Vector3(.16f,y+1.6f,.16f));b.Local(side,StadiumSlot.Steel,x+s*w*.45f,(y+.4f)/2,back+.5f,new Vector3(.16f,y+.4f,.16f),-1);}}
        return y+2;
    }
    static float Barrel(Builder b,Side side,StandTerrace t,RoofSpec spec,float front,float back,float y,float deep,float mid,float span){
        // A vault along the stand: arched cross-section from the back wall to the front edge.
        const int n=7;float rise=Mathf.Clamp(deep*.26f,1.6f,4.8f);var z=new float[n+1];var h=new float[n+1];
        for(int i=0;i<=n;i++){float s=i/(float)n;z[i]=Mathf.Lerp(back+.6f,front,s);h[i]=y+rise*Mathf.Sin(Mathf.PI*s);}
        int ribs=Mathf.Max(3,Mathf.RoundToInt(span/9));
        for(int i=0;i<n;i++){
            float dz=z[i+1]-z[i],dy=h[i+1]-h[i],len=Mathf.Sqrt(dz*dz+dy*dy),angle=Mathf.Atan2(dy,-dz)*Mathf.Rad2Deg;var r=side.facing*Quaternion.Euler(angle,0,0);
            b.Box(side.index,StadiumSlot.Roof,side.At(0,(h[i]+h[i+1])/2,(z[i]+z[i+1])/2),new Vector3(span,.2f,len+.05f),r);
            // Glazed ends and steel ribs under the vault.
            foreach(int s in new[]{-1,1})b.Local(side,StadiumSlot.Glass,s*(span/2-.1f),(y-.2f+(h[i]+h[i+1])/2)/2,(z[i]+z[i+1])/2,new Vector3(.12f,Mathf.Max(.2f,(h[i]+h[i+1])/2-y+.2f),Mathf.Abs(dz)),-1);
            for(int k=0;k<=ribs;k++){float x=-span/2+.4f+k*(span-.8f)/ribs;b.Box(side.index,StadiumSlot.Steel,side.At(x,(h[i]+h[i+1])/2-.22f,(z[i]+z[i+1])/2),new Vector3(.22f,.26f,len),r,-1);}
        }
        b.Local(side,StadiumSlot.Trim,0,y-.15f,front-.1f,new Vector3(span,.45f,.25f));
        if(spec.Support==RoofSupport.Columns)FrontColumns(b,side,t,front,y,span);else FrontTruss(b,side,t,front,y,span);
        RearColumns(b,side,back,y,mid,deep,span);
        return y+rise+.3f;
    }
    static float Sawtooth(Builder b,Side side,StandTerrace t,RoofSpec spec,float front,float back,float y,float deep,float mid,float span){
        // North-light saw teeth with their ridges running toward the pitch: a saw edge in every view.
        int n=Mathf.Max(4,Mathf.RoundToInt(span/4.6f));float w=span/n,h=Mathf.Clamp(w*.48f,1.6f,2.6f);var turn=side.facing*Quaternion.Euler(0,90,0);
        for(int i=0;i<n;i++){float x=-span/2+(i+.5f)*w;
            b.Add(side.index,StadiumSlot.Roof,StadiumShape.Wedge,side.At(x,y+h/2,mid),new Vector3(deep,h,w),turn);
            b.Local(side,StadiumSlot.Glass,x+w/2-.07f,y+h/2,mid,new Vector3(.08f,h*.8f,deep*.96f),-1);}
        b.Local(side,StadiumSlot.Trim,0,y-.25f,front-.1f,new Vector3(span,.5f,.25f));
        if(spec.Support==RoofSupport.Truss)FrontTruss(b,side,t,front,y-.4f,span);else FrontColumns(b,side,t,front,y-.4f,span);
        RearColumns(b,side,back,y,mid,deep,span);
        return y+h+.2f;
    }
    static float Girder(Builder b,Side side,StandTerrace t,RoofSpec spec,float front,float back,float y,float deep,float mid,float span){
        // Flat roof hung from a big box girder; legacy grounds carry it on two pylons, corner
        // towers take the cables where the identity hangs it from them.
        b.Local(side,StadiumSlot.Roof,0,y,mid,new Vector3(span,.3f,deep));b.Local(side,StadiumSlot.Trim,0,y-.3f,front,new Vector3(span,.6f,.2f));
        float g=y+2.6f,z=front+deep*.35f;t.GirderY=g;t.GirderZ=z;
        b.Local(side,StadiumSlot.Steel,0,g,z,new Vector3(span+4,.25f,.25f));b.Local(side,StadiumSlot.Steel,0,g+2.2f,z,new Vector3(span+4,.25f,.25f));
        int n=Mathf.Max(4,Mathf.RoundToInt(span/3.5f));float step=(span+4)/n;
        for(int i=0;i<n;i++){float x=-(span+4)/2+i*step;Strut(b,side,StadiumSlot.Steel,side.At(x,g,z),side.At(x+step,g+2.2f,z),.09f,-1);b.Local(side,StadiumSlot.Steel,x,g+1.1f,z,new Vector3(.12f,2.2f,.12f),-1);}
        bool hung=spec.Support==RoofSupport.MastCable&&!b.legacy&&TowersAt(b,side.index);
        if(!hung)foreach(int s in new[]{-1,1})b.Local(side,StadiumSlot.Steel,s*(span/2+2),(g+2.4f)/2,z,new Vector3(.9f,g+2.4f,.9f));
        for(int i=1;i<6;i++)Strut(b,side,StadiumSlot.Steel,side.At(-span/2+i*span/6,g,z),side.At(-span/2+i*span/6,y+.15f,z),.06f,-1);
        return g+2.4f;
    }
    static bool TowersAt(Builder b,int side){
        var c=b.id.Corners;switch(side){case 0:return c[0]==CornerForm.Tower&&c[1]==CornerForm.Tower;case 1:return c[2]==CornerForm.Tower&&c[3]==CornerForm.Tower;case 2:return c[0]==CornerForm.Tower&&c[2]==CornerForm.Tower;default:return c[1]==CornerForm.Tower&&c[3]==CornerForm.Tower;}
    }
    static float Arch(Builder b,Side side,StandTerrace t,RoofSpec spec,float front,float back,float y,float deep,float mid,float span){
        // A great arch over the stand carries the roof front on hangers (final arenas).
        float roofTop=Cantilever(b,side,t,spec,front,back,y,deep,mid,span,false);
        float A=span/2+14,H=Mathf.Max(y*2.3f,34),z=back-deep*.2f;int n=b.detailed?20:12;
        Vector3 P(float s){float x=Mathf.Lerp(-A,A,s),u=2*s-1;return side.At(x,H*(1-u*u),z);}
        for(int i=0;i<n;i++)Strut(b,side,StadiumSlot.Steel,P(i/(float)n),P((i+1)/(float)n),1.2f,1);
        for(int k=1;k<8;k++)Strut(b,side,StadiumSlot.Steel,P(k/8f),side.At(Mathf.Lerp(-A,A,k/8f)*.82f,y+.8f,front+1.2f),.08f,-1);
        foreach(int s in new[]{-1,1})b.Local(side,StadiumSlot.Concrete,s*A,1.2f,z,new Vector3(4,2.4f,4));
        return Mathf.Max(roofTop,H);
    }
    // A thin beam from a to b.
    static void Strut(Builder b,Side side,StadiumSlot slot,Vector3 from,Vector3 to,float thickness,float shade){Beam(b,side.index,slot,from,to,thickness,shade);}
    static void Beam(Builder b,int group,StadiumSlot slot,Vector3 from,Vector3 to,float thickness,float shade){
        var d=to-from;if(d.sqrMagnitude<1e-4f)return;b.Box(group,slot,(from+to)/2,new Vector3(thickness,thickness,d.magnitude),Quaternion.LookRotation(d),shade);
    }

    // ---- Corners -------------------------------------------------------------------------------
    static void Corners(Builder b,Side[] sides,int[] rows,float depth){
        var style=b.style;var plan=b.plan;
        // Release 130 order (x- then x+, far then near): the seeded details follow it.
        foreach(int c in CornerOrder){
            int sx=c%2==0?-1:1,sz=c<2?-1:1;int longSide=sz<0?0:1,endSide=sx<0?2:3;int n=Mathf.Min(rows[longSide],rows[endSide]);
            var corner=new Vector3(sx*(sides[endSide].front-1.5f),0,sz*(sides[longSide].front-1.5f));int group=longSide;var form=b.id.Corners[c];
            // Stands shorter than their side leave the corner open.
            bool spanned=plan.Terraces[longSide].Half>=sides[longSide].half-.5f&&plan.Terraces[endSide].Half>=sides[endSide].half-.5f;
            if((form==CornerForm.Curved||form==CornerForm.Filled)&&n>0&&spanned){Bowl(b,c,sx,sz,corner,n,form==CornerForm.Curved?6:2,depth);continue;}
            if(form==CornerForm.Tower){Tower(b,c,sx,sz,corner,group,depth);continue;}
            var at=corner+new Vector3(sx,0,sz)*(depth*.55f+3);var face=Quaternion.LookRotation(new Vector3(-sx,0,-sz));
            if(b.legacy&&b.legacyCorners){LegacyCorner(b,group,at,face,sx,sz);continue;}
            // Open corner: a low wall and a gate between the stands, and what lies beyond.
            b.Box(group,StadiumSlot.Concrete,corner+new Vector3(sx,0,sz)*2.5f+Vector3.up*1.1f,new Vector3(6,2.2f,.4f),Quaternion.LookRotation(new Vector3(sx,0,sz)));
            b.Box(group,StadiumSlot.Steel,corner+new Vector3(sx,0,sz)*2.4f+Vector3.up*1.2f,new Vector3(3,2f,.1f),Quaternion.LookRotation(new Vector3(sx,0,sz)),-.8f);
            if(!b.legacy)OpenCorner(b,c,group,at,face,sx,sz);
        }
    }
    // Bowl corner: rows on arcs (curved) or a chamfer (filled) that meet both neighbouring stands.
    static void Bowl(Builder b,int c,int sx,int sz,Vector3 corner,int n,int segments,float depth){
        int longSide=sz<0?0:1,endSide=sx<0?2:3;var t=b.plan.Terraces[longSide];var e=b.plan.Terraces[endSide];var style=b.style;int group=longSide;
        float rowDepth=Mathf.Clamp(depth/Mathf.Max(b.plan.Rows[longSide],1),.6f,1.6f),wall=b.legacy?style.frontWall:Mathf.Min(t.Wall-t.Podium,e.Wall-e.Podium),rise=b.legacy?style.rise:Mathf.Min(t.Rise,e.Rise);
        bool roofed=b.plan.Roofs[longSide]&&b.plan.Roofs[endSide]&&(b.legacy?b.archetype=="modern-ring":t.Roofed&&e.Roofed&&Covers(b.id.Stands[longSide].Roof.Kind)&&Covers(b.id.Stands[endSide].Roof.Kind));
        float roofY=b.legacy?0:Mathf.Min(t.RoofY>0?t.RoofY:99,e.RoofY>0?e.RoofY:99);
        for(int s=0;s<segments;s++){
            float a0=s*90f/segments,a1=(s+1)*90f/segments,am=(a0+a1)/2*Mathf.Deg2Rad;
            var outward=new Vector3(sx*Mathf.Cos(am),0,sz*Mathf.Sin(am));var facing=Quaternion.LookRotation(outward);
            for(int i=0;i<n;i++){
                float r=1.5f+(i+.5f)*rowDepth,y=wall+i*rise,chord=2*(r+rowDepth/2)*Mathf.Tan((a1-a0)/2*Mathf.Deg2Rad)+.1f;
                b.Box(group,StadiumSlot.Concrete,corner+outward*r+Vector3.up*y/2,new Vector3(chord,y,rowDepth),facing,1-.012f*i);
                b.plan.Pieces.Add(new StadiumPiece{group=group,slot=StadiumSlot.Crowd,shape=StadiumShape.Quad,center=corner+outward*(r-rowDepth*.12f)+Vector3.up*(y+.52f),size=new Vector3(chord*.92f,1.04f,0),rotation=facing*Quaternion.Euler(-8,0,0),tint=Color.white*(1-.015f*i),crowdU=(float)b.random.NextDouble(),crowdRow=b.random.Next(8)});
            }
            float top=wall+n*rise+1.6f,rBack=1.5f+n*rowDepth+.3f,chordBack=2*rBack*Mathf.Tan((a1-a0)/2*Mathf.Deg2Rad)+.2f;
            // Authored bowls close the corner up to the roof so the ring reads as one.
            float wallTop=roofed&&!b.legacy?Mathf.Max(top,roofY+.4f):top;
            b.Box(group,b.legacy?StadiumSlot.Cladding:b.Wall,corner+outward*rBack+Vector3.up*wallTop/2,new Vector3(chordBack,wallTop,.6f),facing);
            if(roofed){float y=b.legacy?top+style.clearance:roofY;b.Box(group,StadiumSlot.Roof,corner+outward*(rBack/2+.5f)+Vector3.up*(y+.7f),new Vector3(chordBack,.22f,rBack+1),facing*Quaternion.Euler(-4,0,0));
                if(!b.legacy)b.Box(group,StadiumSlot.Trim,corner+outward*.9f+Vector3.up*y,new Vector3(chordBack*.25f,.5f,.25f),facing);}
        }
    }
    static readonly int[] CornerOrder={0,2,1,3};
    static bool Covers(RoofKind k)=>k==RoofKind.Cantilever||k==RoofKind.ArchSuspended||k==RoofKind.Flat||k==RoofKind.Barrel;
    // Corner tower beyond the stands' meeting point, with stair windows and a cap.
    static void Tower(Builder b,int c,int sx,int sz,Vector3 corner,int group,float depth){
        int longSide=sz<0?0:1,endSide=sx<0?2:3;var dir=new Vector3(sx,0,sz).normalized;var at=corner+dir*3.8f;var face=Quaternion.LookRotation(-dir);
        float h=Mathf.Max(b.tops[longSide],b.tops[endSide])+7;b.towerTops[c]=h;b.towerAt[c]=at;
        b.Box(group,b.Wall,at+Vector3.up*h/2,new Vector3(6.6f,h,6.6f),face);b.Box(group,StadiumSlot.Roof,at+Vector3.up*(h+.25f),new Vector3(7.2f,.5f,7.2f),face);
        b.Box(group,StadiumSlot.Concrete,at+Vector3.up*(h-1.2f),new Vector3(6.9f,.6f,6.9f),face,.85f);
        for(float y=3;y<h-3;y+=3.4f)b.Box(group,StadiumSlot.Glass,at+face*new Vector3(0,0,3.34f)+Vector3.up*y,new Vector3(1.4f,2.1f,.08f),face,-1);
        // Cables from the tower top to the girders of the stands that hang from it.
        foreach(int side in new[]{longSide,endSide}){var t=b.plan.Terraces[side];if(t.GirderY<=0||b.id.Stands[side].Roof.Support!=RoofSupport.MastCable)continue;var s=b.sides[side];
            foreach(float k in new[]{.35f,.7f}){var along=s.facing*Vector3.right;float toward=Vector3.Dot(at-s.At(0,0,0),along)>0?1:-1;Beam(b,side,StadiumSlot.Steel,at+Vector3.up*(h-1),s.At(toward*t.Half*k,t.GirderY+2.2f,t.GirderZ),.1f,-1);}}
    }
    // Authored open corners show what surrounds the ground (seen through the gap in follow).
    static void OpenCorner(Builder b,int c,int group,Vector3 at,Quaternion face,int sx,int sz){
        if(c==1&&b.Landmark(LandmarkKind.ScoreboardTower,LandmarkPlace.Corner))return;
        var near=b.id.Surroundings.Length>0?b.id.Surroundings[0]:SurroundingKind.Park;var far=at+new Vector3(sx,0,sz)*6;
        switch(near){
            case SurroundingKind.UrbanBlocks:case SurroundingKind.TerracedHouses:Building(b,group,far,new Vector3(10,b.Range(12,18),10),face,StadiumSlot.Brick,b.detailed);break;
            case SurroundingKind.Harbour:case SurroundingKind.Industry:Warehouse(b,group,far,face);break;
            case SurroundingKind.Coast:Palm(b,group,far,b.Range(7,10));Palm(b,group,far+new Vector3(sx*2.5f,0,-sz*2),b.Range(6,9));break;
            default:Tree(b,group,far,b.Range(6,9));Tree(b,group,far+new Vector3(sx*4,0,-sz*1.5f),b.Range(5,8));break;
        }
    }
    static void LegacyCorner(Builder b,int group,Vector3 at,Quaternion face,int sx,int sz){
        switch(b.archetype){
            case "urban-court":{float h=14+b.Range(0,10);Building(b,group,at+new Vector3(sx,0,sz)*3,new Vector3(11,h,11),face,StadiumSlot.Brick,true);break;}
            case "dockside-ground":Warehouse(b,group,at+new Vector3(sx*2,0,sz*2),face);break;
            case "industrial-shed":Building(b,group,at,new Vector3(9,7,7),face,StadiumSlot.Brick,b.detailed);b.Add(group,StadiumSlot.Brick,StadiumShape.Prism,at+new Vector3(sx*3,9,0),new Vector3(1.4f,18,.7f),Quaternion.identity);break;
            case "garden-ground":case "hillside-ground":Tree(b,group,at,b.Range(5,8));Tree(b,group,at+new Vector3(sx*4,0,-sz*1.5f),b.Range(4,7));break;
            case "sun-terraces":Palm(b,group,at,b.Range(7,10));Palm(b,group,at+new Vector3(sx*2.5f,0,sz*-2),b.Range(6,9));Palm(b,group,at+new Vector3(-sx*2,0,sz*2.5f),b.Range(6,9));break;
            default:{
                // Civic and modern: stair tower with a flag.
                b.Box(group,StadiumSlot.Cladding,at+Vector3.up*5,new Vector3(6,10,6),face);b.Box(group,StadiumSlot.Roof,at+Vector3.up*10.2f,new Vector3(6.6f,.4f,6.6f),face);
                b.Box(group,StadiumSlot.Steel,at+Vector3.up*13,new Vector3(.12f,6,.12f),face,-1);b.Box(group,StadiumSlot.Trim,at+Vector3.up*15.2f+face*Vector3.right*.9f,new Vector3(1.8f,1.1f,.04f),face,-1);break;
            }
        }
    }

    static void Building(Builder b,int group,Vector3 at,Vector3 size,Quaternion face,StadiumSlot wall,bool windows){
        b.Box(group,wall,at+Vector3.up*size.y/2,size,face);b.Box(group,StadiumSlot.Roof,at+Vector3.up*(size.y+.2f),new Vector3(size.x+.3f,.4f,size.z+.3f),face);
        if(!windows)return;
        // Lit window bands, one per storey, on all four facades.
        for(float y=2.2f;y<size.y-1;y+=3)for(int f=0;f<4;f++){var dir=Quaternion.Euler(0,f*90,0);float w=f%2==0?size.x:size.z,d=f%2==0?size.z:size.x;
            b.Box(group,StadiumSlot.Glass,at+face*(dir*new Vector3(0,0,d/2+.03f))+Vector3.up*y,new Vector3(w*.84f,1.3f,.06f),face*dir,-1);}
    }
    static void Warehouse(Builder b,int group,Vector3 at,Quaternion face){
        b.Box(group,StadiumSlot.Brick,at+Vector3.up*4.5f,new Vector3(16,9,9),face);
        // Saw-tooth roof.
        for(int i=0;i<4;i++)b.Add(group,StadiumSlot.Roof,StadiumShape.Wedge,at+face*new Vector3(-6+i*4,0,0)+Vector3.up*10,new Vector3(4,2,9),face*Quaternion.Euler(0,90,0));
        for(int i=0;i<4;i++)b.Box(group,StadiumSlot.Shade,at+face*new Vector3(-6+i*4,0,-4.55f)+Vector3.up*2,new Vector3(2.4f,3.6f,.1f),face,-1);
    }
    static void Tree(Builder b,int group,Vector3 at,float height){
        b.Add(group,StadiumSlot.Brick,StadiumShape.Prism,at+Vector3.up*height*.2f,new Vector3(.45f,height*.4f,.8f),Quaternion.identity,.6f);
        b.Add(group,StadiumSlot.Foliage,StadiumShape.Prism,at+Vector3.up*height*.62f,new Vector3(height*.55f,height*.75f,.05f),Quaternion.Euler(0,b.Range(0,60),0));
    }
    static void Palm(Builder b,int group,Vector3 at,float height){
        float lean=b.Range(-8,8);var tilt=Quaternion.Euler(lean,b.Range(0,360),0);
        b.Add(group,StadiumSlot.Brick,StadiumShape.Prism,at+tilt*Vector3.up*height/2,new Vector3(.4f,height,.7f),tilt,.75f);
        var top=at+tilt*Vector3.up*height;for(int i=0;i<6;i++)b.Box(group,StadiumSlot.Foliage,top+Quaternion.Euler(0,i*60,0)*new Vector3(0,-.3f,1.4f),new Vector3(.7f,.08f,3),Quaternion.Euler(18,i*60,0));
    }

    // ---- Floodlights -----------------------------------------------------------------------------
    static void Floodlights(Builder b,Side[] sides,float depth,float mast,float overhang){
        var f=b.id.Floodlights;float L=b.L,W=b.W;var rows=b.plan.Rows;var tops=b.tops;float height=b.legacy||f.Height<=0?mast:Mathf.Clamp(f.Height,14,46);
        if(f.Kind==FloodlightKind.RoofRail){
            // Light rails under each roof front; unroofed sides get short masts.
            for(int i=0;i<4;i++){
                var s=sides[i];var t=b.plan.Terraces[i];
                if(b.plan.Roofs[i]){float y=b.legacy?tops[i]-(b.archetype=="modern-ring"?5.4f:.9f):t.RoofY-.25f,z=b.legacy?s.front-overhang*.5f:Mathf.Max(t.RoofFront+.6f,s.front-overhang*.5f);
                    b.Local(s,StadiumSlot.Lamp,0,y,z,new Vector3(t.Half*1.6f,.3f,.4f));continue;}
                foreach(int x in new[]{-1,1}){var foot=s.At(x*s.half*.7f,0,s.front+depth+2);Mast(b,GroupOf(foot,L,W),foot,Mathf.Max(18,tops[i]+6),false,f.Head);}
            }
            return;
        }
        if(f.Kind==FloodlightKind.SidePoles){
            // Slim poles along both long sides, behind the stands.
            int poles=Mathf.Max(2,(b.legacy?6:f.Count)/2);
            foreach(int i in new[]{0,1}){var s=sides[i];for(int p=0;p<poles;p++){float x=(p-(poles-1)/2f)*s.half*(poles>2?.75f*2/(poles-1):.75f);var foot=s.At(x,0,s.front+Mathf.Clamp(depth/Mathf.Max(1,rows[i]),.6f,1.6f)*rows[i]+3);Mast(b,i,foot,Mathf.Max(height*.72f,tops[i]+5),false,f.Head);}}
            return;
        }
        // Corner masts or lattice pylons on the diagonal beyond the corners; corner towers carry the heads themselves.
        foreach(int c in CornerOrder){int sx=c%2==0?-1:1,sz=c<2?-1:1;int group=sz<0?0:1;
            if(b.towerTops[c]>0){var at=b.towerAt[c]+Vector3.up*(b.towerTops[c]+2.6f);Head(b,group,at,new Vector3(-at.x,-at.y*.55f,-at.z),f.Head,true);continue;}
            var corner=new Vector3(sx*(sides[sx<0?2:3].front-1.5f),0,sz*(sides[sz<0?0:1].front-1.5f));
            var foot=corner+new Vector3(sx,0,sz)*(depth*.75f+4);float h=Mathf.Max(height,Mathf.Max(tops[sz<0?0:1],tops[sx<0?2:3])+8);
            if(f.Kind==FloodlightKind.LatticePylons)Pylon(b,group,foot,h,f.Head);else Mast(b,group,foot,h,true,f.Head);
        }
    }
    static void Mast(Builder b,int group,Vector3 foot,float height,bool lattice,LampHead head){
        b.Add(group,StadiumSlot.Steel,StadiumShape.Prism,foot+Vector3.up*height/2,new Vector3(lattice?1.1f:.45f,height,lattice?.35f:.6f),Quaternion.identity);
        Head(b,group,foot+Vector3.up*(height+.4f),new Vector3(-foot.x,-height*.55f,-foot.z),head,lattice);
    }
    // Lamp head aimed along toward (at the pitch): square grid (legacy), triangle, ring of lamps or a long bar on a jib.
    static void Head(Builder b,int group,Vector3 at,Vector3 toward,LampHead shape,bool big){
        var head=Quaternion.LookRotation(toward);
        switch(shape){
            case LampHead.Triangle:{
                var axis=head*Quaternion.Euler(90,0,0);float d=big?5.4f:2.6f;
                b.Add(group,StadiumSlot.Steel,StadiumShape.Prism,at-head*Vector3.forward*.25f,new Vector3(d+.5f,.4f,1),axis,1,3);
                b.Add(group,StadiumSlot.Lamp,StadiumShape.Prism,at+head*Vector3.forward*.05f,new Vector3(d,.3f,1),axis,1,3);return;}
            case LampHead.Ring:{
                float r=big?2.4f:1.2f;for(int k=0;k<8;k++){var o=head*Quaternion.Euler(0,0,k*45)*new Vector3(r,0,0);b.Box(group,StadiumSlot.Lamp,at+o,new Vector3(1,1,.3f),head);
                    var o2=head*Quaternion.Euler(0,0,k*45+22.5f)*new Vector3(r,0,0);b.Box(group,StadiumSlot.Steel,at+o2-head*Vector3.forward*.2f,new Vector3(.25f,r*.8f,.25f),head*Quaternion.Euler(0,0,k*45+22.5f),-1);}
                b.Box(group,StadiumSlot.Steel,at-head*Vector3.forward*.3f,new Vector3(.6f,.6f,.6f),head);return;}
            case LampHead.Bar:{
                // A long bar of lamps on a short jib toward the pitch.
                var flat=Quaternion.LookRotation(new Vector3(toward.x,0,toward.z));var reach=flat*Vector3.forward*2.6f;
                Beam(b,group,StadiumSlot.Steel,at-Vector3.up*.6f,at+reach,.35f,1);
                b.Box(group,StadiumSlot.Steel,at+reach-head*Vector3.forward*.2f,new Vector3(big?8:4,.7f,.45f),head);
                b.Box(group,StadiumSlot.Lamp,at+reach+head*Vector3.forward*.06f,new Vector3(big?7.4f:3.6f,.45f,.12f),head);return;}
            default:{
                var size=big?new Vector3(5,3.2f,.35f):new Vector3(2.2f,1.2f,.3f);
                b.Box(group,StadiumSlot.Steel,at-head*Vector3.forward*.25f,size+new Vector3(.4f,.4f,0),head);
                // Lamp faces the pitch: a box whose front face carries the lamp grid.
                b.Box(group,StadiumSlot.Lamp,at+head*Vector3.forward*.05f,size,head);return;}
        }
    }
    // Tapered lattice tower: four legs, braces in detail mode and a head on top.
    static void Pylon(Builder b,int group,Vector3 foot,float height,LampHead head){
        float wide=2.3f,narrow=.75f;var leg=new Vector3[4];var top=new Vector3[4];
        for(int k=0;k<4;k++){float sx=k%2==0?-1:1,sz=k<2?-1:1;leg[k]=foot+new Vector3(sx*wide,0,sz*wide);top[k]=foot+new Vector3(sx*narrow,height,sz*narrow);Beam(b,group,StadiumSlot.Steel,leg[k],top[k],.28f,1);}
        int levels=Mathf.Max(3,Mathf.RoundToInt(height/5));
        for(int l=1;l<levels;l++){float s=l/(float)levels;for(int k=0;k<4;k++){int n=k==0?1:k==1?3:k==3?2:0;var a=Vector3.Lerp(leg[k],top[k],s);var c=Vector3.Lerp(leg[n],top[n],s);var a2=Vector3.Lerp(leg[k],top[k],s+1f/levels);
            Beam(b,group,StadiumSlot.Steel,a,c,.1f,-1);Beam(b,group,StadiumSlot.Steel,c,a2,.08f,-1);}}
        b.Box(group,StadiumSlot.Steel,foot+Vector3.up*(height+.2f),new Vector3(narrow*2+.6f,.4f,narrow*2+.6f),Quaternion.identity);
        Head(b,group,foot+Vector3.up*(height+1.6f),new Vector3(-foot.x,-height*.55f,-foot.z),head,true);
    }

    // ---- Entrances ---------------------------------------------------------------------------------
    static void Entrances(Builder b,Side[] sides,float depth){
        var kind=b.id.Entrances;if(kind==EntranceKind.Plain||b.legacy)return;
        for(int c=0;c<4;c++){
            int sx=c%2==0?-1:1,sz=c<2?-1:1;int longSide=sz<0?0:1,endSide=sx<0?2:3,group=longSide;var dir=new Vector3(sx,0,sz).normalized;
            var corner=new Vector3(sx*(sides[endSide].front-1.5f),0,sz*(sides[longSide].front-1.5f));var form=b.id.Corners[c];
            float h=Mathf.Max(b.tops[longSide],b.tops[endSide]);
            switch(kind){
                case EntranceKind.RampTowers:{
                    // Spiral ramp towers outside the bowl corners.
                    float reach=1.5f+Mathf.Min(b.plan.Rows[longSide],b.plan.Rows[endSide])*Mathf.Clamp(depth/Mathf.Max(1,b.plan.Rows[longSide]),.6f,1.6f)+9;
                    var at=corner+dir*Mathf.Max(reach,depth*.55f+9);float th=h*.82f;
                    b.Add(group,StadiumSlot.Concrete,StadiumShape.Prism,at+Vector3.up*th/2,new Vector3(9,th,1),Quaternion.identity);
                    for(float y=2.4f;y<th;y+=2.6f)for(int k=0;k<5;k++){float a=(y*24+k*30)*Mathf.Deg2Rad;var o=new Vector3(Mathf.Cos(a),0,Mathf.Sin(a))*4.7f;b.Box(group,StadiumSlot.Steel,at+o+Vector3.up*y,new Vector3(3.2f,.35f,.9f),Quaternion.LookRotation(Vector3.Cross(Vector3.up,o)),-1);}
                    break;}
                case EntranceKind.GrandGate:{
                    if(form!=CornerForm.Open||c>1)break;
                    var at=corner+dir*7;var face=Quaternion.LookRotation(-dir);
                    foreach(int s in new[]{-1,1})b.Box(group,b.Wall,at+face*new Vector3(s*3.4f,3.6f,0),new Vector3(1.5f,7.2f,1.5f),face);
                    b.Box(group,b.Wall,at+Vector3.up*7.9f,new Vector3(8.4f,1.6f,1.6f),face);b.Box(group,StadiumSlot.Accent,at+Vector3.up*7.9f+face*new Vector3(0,0,-.85f),new Vector3(5.6f,.9f,.06f),face,-1);
                    b.Box(group,StadiumSlot.Steel,at+Vector3.up*2.6f,new Vector3(5.2f,5.2f,.08f),face,-1);break;}
                default:{
                    if(form!=CornerForm.Open)break;
                    var at=corner+dir*4.2f;var face=Quaternion.LookRotation(-dir);
                    b.Box(group,StadiumSlot.Brick,at+Vector3.up*1.7f,new Vector3(6.5f,3.4f,3.2f),face);b.Box(group,StadiumSlot.Roof,at+Vector3.up*3.55f,new Vector3(7,.3f,3.7f),face);
                    for(int k=-1;k<=1;k++)b.Box(group,StadiumSlot.Shade,at+face*new Vector3(k*2,1.2f,-1.62f),new Vector3(1.1f,2.2f,.06f),face,-1);
                    b.Box(group,StadiumSlot.Trim,at+face*new Vector3(0,2.9f,-1.63f),new Vector3(5.6f,.35f,.06f),face,-1);break;}
            }
        }
    }

    // ---- Landmarks -----------------------------------------------------------------------------------
    // Places: behind the far stand (left/centre/right), behind an end, on the far main stand roof or
    // in the far-right corner. Distant pieces are Haze silhouettes; near ones keep their materials.
    static void Landmarks(Builder b,Side[] sides,float depth){
        const int g=StadiumBlueprint.Surroundings;float L=b.L,W=b.W,far=W/2+depth+9;
        foreach(var mark in b.id.Landmarks){
            Vector3 at;switch(mark.Place){
                case LandmarkPlace.FarLeft:at=new Vector3(-L*.62f,0,-far-60);break;case LandmarkPlace.FarRight:at=new Vector3(L*.62f,0,-far-60);break;
                case LandmarkPlace.FarCentre:at=new Vector3(0,0,-far-120);break;case LandmarkPlace.EndLeft:at=new Vector3(-L/2-depth-70,0,-38);break;
                case LandmarkPlace.EndRight:at=new Vector3(L/2+depth*.88f+38,0,0);break;
                case LandmarkPlace.Corner:at=new Vector3(sides[3].front+6.5f,0,-(sides[0].front+6.5f));break;
                default:at=new Vector3(0,b.tops[0],-(sides[0].front+depth*.5f));break;
            }
            switch(mark.Kind){
                case LandmarkKind.TvTower:{var p=at+new Vector3(0,0,-110);Haze(b,StadiumShape.Prism,p+Vector3.up*36,new Vector3(4.2f,72,.55f),.8f);Haze(b,StadiumShape.Prism,p+Vector3.up*56,new Vector3(13,7,.85f),.86f);Haze(b,StadiumShape.Prism,p+Vector3.up*82,new Vector3(1,20,.3f),.8f);break;}
                case LandmarkKind.HillBackdrop:Mountains(b,mark.Place==LandmarkPlace.EndRight);break;
                case LandmarkKind.TwinSpires:{var p=at;Haze(b,StadiumShape.Box,p+Vector3.up*13,new Vector3(46,26,18),.62f);foreach(int s in new[]{-1,1}){Haze(b,StadiumShape.Box,p+new Vector3(s*11,30,-6),new Vector3(9,60,9),.66f);Haze(b,StadiumShape.Prism,p+new Vector3(s*11,72,-6),new Vector3(9.5f,24,0),.7f,8);}break;}
                case LandmarkKind.Spire:{var p=at;b.Box(g,StadiumSlot.Brick,p+Vector3.up*16,new Vector3(7,32,7),Quaternion.Euler(0,12,0));b.Add(g,StadiumSlot.Roof,StadiumShape.Prism,p+Vector3.up*44,new Vector3(8,24,0),Quaternion.Euler(0,12,0),1,8);b.Box(g,StadiumSlot.Brick,p+new Vector3(-12,7,4),new Vector3(22,14,12),Quaternion.Euler(0,12,0));b.Add(g,StadiumSlot.Roof,StadiumShape.Wedge,p+new Vector3(-12,17,4),new Vector3(22,6,6),Quaternion.Euler(0,12,0));break;}
                case LandmarkKind.Windmill:{var p=at;b.Add(g,StadiumSlot.Brick,StadiumShape.Prism,p+Vector3.up*9,new Vector3(8,18,.62f),Quaternion.identity,1,8);b.Add(g,StadiumSlot.Roof,StadiumShape.Prism,p+Vector3.up*20,new Vector3(5.6f,4,.2f),Quaternion.identity,1,8);
                    var hub=p+new Vector3(0,20,3.4f);foreach(float a in new[]{20f,110f})b.Box(g,StadiumSlot.Cladding,hub,new Vector3(26,1.6f,.25f),Quaternion.Euler(0,0,a));b.Box(g,StadiumSlot.Steel,hub,new Vector3(.8f,.8f,1.2f),Quaternion.identity);break;}
                case LandmarkKind.GantryCrane:{var p=at+new Vector3(18,0,0);
                    foreach(int s in new[]{-1,1}){foreach(int k in new[]{-1,1})b.Box(g,StadiumSlot.Steel,p+new Vector3(k*3,24,s*34),new Vector3(1.4f,48,1.4f),Quaternion.Euler(0,0,k*3));b.Box(g,StadiumSlot.Steel,p+new Vector3(0,12,s*34),new Vector3(7,1,1),Quaternion.identity,-1);}
                    b.Box(g,StadiumSlot.Steel,p+new Vector3(0,49,0),new Vector3(5,4.5f,84),Quaternion.identity);b.Box(g,StadiumSlot.Cladding,p+new Vector3(0,45,-8),new Vector3(6,4,6),Quaternion.identity);b.Box(g,StadiumSlot.Trim,p+new Vector3(-2.6f,49,0),new Vector3(.1f,1.4f,60),Quaternion.identity,-1);break;}
                case LandmarkKind.Crane:{var p=at+new Vector3(0,0,-30);Crane(b,g,p);Crane(b,g,p+new Vector3(34,0,-6));break;}
                case LandmarkKind.Arch:{
                    if(mark.Place==LandmarkPlace.MainStand)break;
                    // A three-arch steel bridge over the river behind the right end.
                    var p=at+new Vector3(34,0,0);b.Box(g,StadiumSlot.Concrete,p+Vector3.up*9,new Vector3(12,1.4f,170),Quaternion.identity);
                    for(int k=-1;k<=1;k++){float zc=k*52;for(int i=0;i<10;i++){float a0=i/10f,a1=(i+1)/10f;Vector3 A(float s)=>p+new Vector3(0,10+14*Mathf.Sin(Mathf.PI*s),zc-25+50*s);foreach(int s in new[]{-1,1})Beam(b,g,StadiumSlot.Steel,A(a0)+new Vector3(s*5,0,0),A(a1)+new Vector3(s*5,0,0),.9f,1);}
                        b.Box(g,StadiumSlot.Concrete,p+new Vector3(0,4.2f,zc+26),new Vector3(10,8.4f,4),Quaternion.identity);}
                    break;}
                case LandmarkKind.RiverQuay:{var p=new Vector3(L/2+depth+36.5f,0,0);b.Box(g,StadiumSlot.Concrete,p+new Vector3(0,.5f,0),new Vector3(3,1.6f,150),Quaternion.identity);
                    // A moored ship at the quay.
                    var ship=p+new Vector3(9,0,-14);b.Box(g,StadiumSlot.Trim,ship+Vector3.up*1.6f,new Vector3(8,3.4f,46),Quaternion.identity);b.Box(g,StadiumSlot.Cladding,ship+new Vector3(0,5.2f,-14),new Vector3(6,4,9),Quaternion.identity);b.Box(g,StadiumSlot.Steel,ship+new Vector3(0,9,-14),new Vector3(1.4f,4,1.4f),Quaternion.identity);
                    for(int k=-3;k<=3;k++){b.Box(g,StadiumSlot.Steel,p+new Vector3(-2.2f,2.2f,k*18),new Vector3(.15f,3.6f,.15f),Quaternion.identity,-1);b.Box(g,StadiumSlot.Lamp,p+new Vector3(-2.2f,4.1f,k*18),new Vector3(.5f,.3f,.5f),Quaternion.identity,-1);}
                    break;}
                case LandmarkKind.ClockTower:{
                    if(mark.Place!=LandmarkPlace.MainStand){b.Box(g,b.Wall,at+Vector3.up*9,new Vector3(4,18,4),Quaternion.identity);break;}
                    // A clock turret on the main stand roof ridge.
                    var t=b.plan.Terraces[0];if(t.Rows<=0)break;float y=b.tops[0],back=t.Out[t.Rows-1]+t.RowDepth;var p=new Vector3(0,y-.3f,-(t.Roofed?(t.RoofFront+back+.6f)/2:back));
                    b.Box(0,b.Wall,p+Vector3.up*2.4f,new Vector3(2.6f,4.8f,2.6f),Quaternion.identity);b.Box(0,StadiumSlot.Lamp,p+new Vector3(0,3.3f,1.33f),new Vector3(1.5f,1.5f,.06f),Quaternion.identity);
                    b.Add(0,StadiumSlot.Roof,StadiumShape.Prism,p+Vector3.up*5.9f,new Vector3(3.6f,2.2f,0),Quaternion.Euler(0,45,0),1,4);b.Box(0,StadiumSlot.Steel,p+Vector3.up*8,new Vector3(.08f,2,.08f),Quaternion.identity,-1);break;}
                case LandmarkKind.GablePediment:{
                    var t=b.plan.Terraces[0];if(!t.Roofed)break;float y=t.RoofY,z=-(t.RoofFront-.2f),w=Mathf.Min(14,t.Half*.5f),h=w*.32f;var s0=b.sides[0];
                    foreach(int s in new[]{-1,1})b.Add(0,b.Wall,StadiumShape.Wedge,s0.At(s*w/4,y+h/2+.2f,t.RoofFront-.05f),new Vector3(.3f,h,w/2),s0.facing*Quaternion.Euler(0,s<0?90:-90,0));
                    b.Box(0,StadiumSlot.Accent,s0.At(0,y+h*.35f+.2f,t.RoofFront-.22f),new Vector3(w*.28f,h*.32f,.04f),s0.facing,-1);break;}
                case LandmarkKind.ScoreboardTower:{
                    var p=at;var face=Quaternion.LookRotation(new Vector3(-p.x,0,-p.z));foreach(int s in new[]{-1,1})b.Box(0,StadiumSlot.Steel,p+face*new Vector3(s*2.6f,4.5f,0),new Vector3(.35f,9,.35f),face);
                    b.Box(0,StadiumSlot.Shade,p+face*new Vector3(0,9.6f,0),new Vector3(7,3.6f,.4f),face);b.Box(0,StadiumSlot.Trim,p+face*new Vector3(0,11.7f,0),new Vector3(7.4f,.6f,.5f),face);
                    for(int k=0;k<3;k++)b.Box(0,StadiumSlot.Lamp,p+face*new Vector3(-2+k*2,9.4f,-.22f),new Vector3(1.2f,1.6f,.05f),face,-1);break;}
                case LandmarkKind.Chimney:b.Add(g,StadiumSlot.Brick,StadiumShape.Prism,at+Vector3.up*24,new Vector3(3.6f,48,.55f),Quaternion.identity);break;
                case LandmarkKind.Lighthouse:{b.Add(g,StadiumSlot.Concrete,StadiumShape.Prism,at+Vector3.up*13,new Vector3(5,26,.7f),Quaternion.identity);for(int k=0;k<3;k++)b.Add(g,StadiumSlot.Trim,StadiumShape.Prism,at+Vector3.up*(5+k*7),new Vector3(4.9f-k*.5f,2.2f,.94f),Quaternion.identity);b.Add(g,StadiumSlot.Lamp,StadiumShape.Prism,at+Vector3.up*27.5f,new Vector3(3,3,1),Quaternion.identity);break;}
                case LandmarkKind.GlassAtrium:b.Box(g,StadiumSlot.Glass,at+Vector3.up*8,new Vector3(24,16,14),Quaternion.identity);break;
                case LandmarkKind.TileMural:break;
            }
        }
    }
    static void Haze(Builder b,StadiumShape shape,Vector3 center,Vector3 size,float shade,int sides=0){b.Tinted(StadiumBlueprint.Surroundings,StadiumSlot.Haze,shape,center,size,shape==StadiumShape.Box?Quaternion.Euler(0,8,0):Quaternion.identity,new Color(shade,shade,shade),false,sides);}
    // Distant peaks with snow caps, behind the far stand (or behind the right end).
    static void Mountains(Builder b,bool end){
        // Polar placement keeps every peak inside the sky cylinder (radius 280 m).
        for(int i=0;i<6;i++){float w=b.Range(70,120),h=b.Range(34,62),a=(-55+i*22+b.Range(-5,5))*Mathf.Deg2Rad,d=b.Range(200,222);
            var p=end?new Vector3(Mathf.Cos(a)*d,0,Mathf.Sin(a)*d):new Vector3(Mathf.Sin(a)*d,0,-Mathf.Cos(a)*d);
            b.Tinted(StadiumBlueprint.Surroundings,StadiumSlot.Haze,StadiumShape.Prism,p+Vector3.up*(h/2-2),new Vector3(w,h,0),Quaternion.Euler(0,b.Range(0,50),0),new Color(.58f,.62f,.7f),false,7);
            b.Tinted(StadiumBlueprint.Surroundings,StadiumSlot.Haze,StadiumShape.Prism,p+Vector3.up*(h-h*.14f-2),new Vector3(w*.28f,h*.28f,0),Quaternion.Euler(0,b.Range(0,50),0),new Color(1,1,1),true,7);}
    }

    // ---- Surroundings ------------------------------------------------------------------------------
    // Ground beyond the apron, a horizon dome and the local setting behind the far stand and the
    // ends. Nothing stands behind the near side (camera side) or in the behind-goal camera corridor
    // beyond the left end, so no setting piece can cross a match camera's view.
    static void Surroundings(Builder b,float L,float W,float depth){
        const int g=StadiumBlueprint.Surroundings;
        b.Box(g,StadiumSlot.Ground,new Vector3(0,-.16f,0),new Vector3(L+420,.1f,W+420),Quaternion.identity);
        b.Add(g,StadiumSlot.Sky,StadiumShape.Dome,new Vector3(0,-20,0),new Vector3(560,220,1),Quaternion.identity);
        float rx=L/2+depth+26,rz=W/2+depth+24;
        for(int k=0;k<b.id.Surroundings.Length;k++){bool first=k==0;
            switch(b.id.Surroundings[k]){
                case SurroundingKind.UrbanBlocks:
                    for(int i=0;i<8;i++){float h=b.Range(14,32);Building(b,g,new Vector3(-84+i*24+b.Range(-3,3),0,-(rz+(first?6:30)+b.Range(0,10))),new Vector3(b.Range(12,17),h,b.Range(11,15)),Quaternion.Euler(0,b.Range(-4,4),0),i%3==0?StadiumSlot.Brick:StadiumSlot.Cladding,b.detailed);}
                    if(first){float endBack=b.sides[3].front+depth*.88f+10;for(int i=0;i<3;i++)Building(b,g,new Vector3(endBack+b.Range(0,5),0,-36+i*24),new Vector3(b.Range(10,14),b.Range(12,24),b.Range(12,16)),Quaternion.identity,StadiumSlot.Brick,b.detailed);}break;
                case SurroundingKind.TerracedHouses:
                    for(int row=0;row<2;row++)for(int i=0;i<(b.detailed?13:8);i++){float w=b.detailed?8.4f:13.6f,x=-56+i*w+row*3;var at=new Vector3(x,0,-(rz+4+row*16));float h=b.Range(8,12);
                        b.Box(g,i%2==0?StadiumSlot.Brick:StadiumSlot.Cladding,at+Vector3.up*h/2,new Vector3(w-.4f,h,9),Quaternion.identity);
                        foreach(int s in new[]{-1,1})b.Add(g,StadiumSlot.Roof,StadiumShape.Wedge,at+new Vector3(s*w/4,h+2.2f,0),new Vector3(9.2f,4.4f,w/2),Quaternion.Euler(0,s<0?90:-90,0));
                        if(b.detailed)b.Box(g,StadiumSlot.Glass,at+new Vector3(0,h*.55f,4.55f),new Vector3(w*.5f,1.4f,.06f),Quaternion.identity,-1);}
                    break;
                case SurroundingKind.River:
                    b.Box(g,StadiumSlot.Water,new Vector3(rx+44,-.1f,-20),new Vector3(70,.1f,W+300),Quaternion.identity);
                    for(int i=0;i<(b.detailed?10:5);i++)Tree(b,g,new Vector3(rx+6+b.Range(-2,2),0,-70+i*(b.detailed?14:28)),b.Range(7,11));break;
                case SurroundingKind.Harbour:
                    b.Box(g,StadiumSlot.Water,new Vector3(0,-.1f,-(rz+70)),new Vector3(L+300,.1f,80),Quaternion.identity);
                    for(int i=0;i<3;i++){var ship=new Vector3(-70+i*62,0,-(rz+62+b.Range(0,16)));b.Box(g,StadiumSlot.Trim,ship+Vector3.up*2,new Vector3(52,4,9),Quaternion.identity);b.Box(g,StadiumSlot.Cladding,ship+new Vector3(-16,6,0),new Vector3(10,5,8),Quaternion.identity);}
                    Warehouse(b,g,new Vector3(rx+14,0,-34),Quaternion.Euler(0,90,0));Warehouse(b,g,new Vector3(rx+14,0,-8),Quaternion.Euler(0,90,0));break;
                case SurroundingKind.Industry:
                    {float back=first?18:b.Near(SurroundingKind.Harbour)?122:40;for(int i=0;i<3;i++)Building(b,g,new Vector3(-60+i*48,0,-(rz+back)),new Vector3(30,12,18),Quaternion.identity,StadiumSlot.Cladding,false);
                    for(int i=0;i<2;i++)b.Add(g,StadiumSlot.Brick,StadiumShape.Prism,new Vector3(-36+i*64,22,-(rz+back+16)),new Vector3(3.2f,44,.6f),Quaternion.identity);}break;
                case SurroundingKind.Hills:
                    for(int i=0;i<5;i++)b.Add(g,StadiumSlot.Grass,StadiumShape.Prism,new Vector3(-90+i*45+b.Range(-8,8),-2,-rz-50-b.Range(0,30)),new Vector3(b.Range(70,110),b.Range(22,42),.12f),Quaternion.Euler(0,b.Range(0,40),0),.85f);break;
                case SurroundingKind.Forest:case SurroundingKind.Park:{
                    int trees=b.Near(SurroundingKind.Forest)?(b.detailed?34:16):(b.detailed?18:9);
                    for(int i=0;i<trees;i++){float a=i*Mathf.PI*2/trees+b.Range(-.05f,.05f);var at=new Vector3(Mathf.Cos(a)*(rx+b.Range(2,14)),0,Mathf.Sin(a)*(rz+b.Range(2,10)));if(Mathf.Sin(a)<.3f&&(at.x>-L/2-8||Mathf.Abs(at.z)>45))Tree(b,g,at,b.Range(7,13));}
                    break;}
                case SurroundingKind.Coast:
                    b.Box(g,StadiumSlot.Water,new Vector3(0,-.1f,-(rz+120)),new Vector3(L+420,.1f,90),Quaternion.identity);
                    for(int i=0;i<10;i++)Building(b,g,new Vector3(-80+i*18,0,-rz-14-b.Range(0,10)),new Vector3(b.Range(9,14),b.Range(6,12),9),Quaternion.identity,StadiumSlot.Cladding,false);
                    for(int i=0;i<8;i++)Palm(b,g,new Vector3(-70+i*20,0,-rz-4-b.Range(0,6)),b.Range(7,11));break;
                case SurroundingKind.Mountains:Mountains(b,false);break;
            }
        }
    }
    static void LegacySurroundings(Builder b,string archetype,float L,float W,float depth){
        const int g=StadiumBlueprint.Surroundings;
        // Ground beyond the apron, a horizon dome and an archetype skyline.
        b.Box(g,StadiumSlot.Ground,new Vector3(0,-.16f,0),new Vector3(L+420,.1f,W+420),Quaternion.identity);
        b.Add(g,StadiumSlot.Sky,StadiumShape.Dome,new Vector3(0,-20,0),new Vector3(560,220,1),Quaternion.identity);
        float rx=L/2+depth+26,rz=W/2+depth+24;
        switch(archetype){
            case "modern-ring":for(int i=0;i<6;i++){float h=b.Range(30,70);Building(b,g,new Vector3(-60+i*24+b.Range(-4,4),0,-rz-30-b.Range(0,30)),new Vector3(b.Range(12,18),h,b.Range(12,18)),Quaternion.Euler(0,b.Range(-10,10),0),StadiumSlot.Cladding,true);}break;
            case "urban-court":for(int i=0;i<7;i++){float h=b.Range(16,34);Building(b,g,new Vector3(-66+i*22,0,-(rz+8+b.Range(0,8))),new Vector3(b.Range(14,19),h,12),Quaternion.identity,i%2==0?StadiumSlot.Brick:StadiumSlot.Cladding,b.detailed);}
                for(int side=-1;side<=1;side+=2)for(int i=0;i<3;i++)Building(b,g,new Vector3(side*(rx+34),0,-28+i*28),new Vector3(12,b.Range(14,28),b.Range(14,20)),Quaternion.identity,StadiumSlot.Brick,b.detailed);break;
            case "industrial-shed":for(int i=0;i<3;i++)Building(b,g,new Vector3(-50+i*45,0,-rz-18),new Vector3(30,12,18),Quaternion.identity,StadiumSlot.Cladding,false);
                for(int i=0;i<2;i++)b.Add(g,StadiumSlot.Brick,StadiumShape.Prism,new Vector3(-30+i*55,22,-rz-34),new Vector3(3.2f,44,.6f),Quaternion.identity);break;
            case "dockside-ground":
                b.Box(g,StadiumSlot.Water,new Vector3(rx+60,-.1f,0),new Vector3(100,.1f,W+260),Quaternion.identity);
                for(int i=0;i<2;i++){var at=new Vector3(rx+12,0,-26+i*46);Crane(b,g,at);}
                Warehouse(b,g,new Vector3(-rx-14,0,-20),Quaternion.Euler(0,90,0));Warehouse(b,g,new Vector3(-rx-14,0,18),Quaternion.Euler(0,90,0));break;
            case "garden-ground":case "hillside-ground":
                if(archetype=="hillside-ground")for(int i=0;i<5;i++)b.Add(g,StadiumSlot.Grass,StadiumShape.Prism,new Vector3(-90+i*45+b.Range(-8,8),-2,-rz-50-b.Range(0,30)),new Vector3(b.Range(70,110),b.Range(22,42),.12f),Quaternion.Euler(0,b.Range(0,40),0),.85f);
                int trees=b.detailed?34:16;for(int i=0;i<trees;i++){float a=i*Mathf.PI*2/trees+b.Range(-.05f,.05f);var at=new Vector3(Mathf.Cos(a)*(rx+b.Range(2,14)),0,Mathf.Sin(a)*(rz+b.Range(2,10)));float h=b.Range(7,13);if(Mathf.Sin(a)<.3f)Tree(b,g,at,h);}
                break;
            case "sun-terraces":
                for(int i=0;i<6;i++)b.Add(g,StadiumSlot.Ground,StadiumShape.Prism,new Vector3(-110+i*44,-2,-rz-90),new Vector3(b.Range(80,120),b.Range(18,30),.15f),Quaternion.identity,1.6f);
                for(int i=0;i<10;i++)Building(b,g,new Vector3(-80+i*18,0,-rz-14-b.Range(0,10)),new Vector3(b.Range(9,14),b.Range(6,12),9),Quaternion.identity,StadiumSlot.Cladding,false);
                for(int i=0;i<8;i++)Palm(b,g,new Vector3(-70+i*20,0,-rz-4-b.Range(0,6)),b.Range(7,11));break;
            default:for(int i=0;i<9;i++)Building(b,g,new Vector3(-80+i*20,0,-rz-12-b.Range(0,12)),new Vector3(b.Range(10,15),b.Range(8,15),10),Quaternion.identity,i%3==0?StadiumSlot.Brick:StadiumSlot.Cladding,b.detailed);
                for(int i=0;i<6;i++)Tree(b,g,new Vector3(-rx-4,0,-30+i*12),b.Range(6,10));break;
        }
    }
    static void Crane(Builder b,int g,Vector3 at){
        foreach(int s in new[]{-1,1})foreach(int t in new[]{-1,1})b.Box(g,StadiumSlot.Steel,at+new Vector3(s*3,13,t*4),new Vector3(.6f,26,.6f),Quaternion.identity);
        b.Box(g,StadiumSlot.Steel,at+new Vector3(0,26.5f,0),new Vector3(7,1.2f,9),Quaternion.identity);
        b.Box(g,StadiumSlot.Steel,at+new Vector3(14,29,0),new Vector3(44,1,1.4f),Quaternion.identity);b.Box(g,StadiumSlot.Cladding,at+new Vector3(0,29,0),new Vector3(5,4,5),Quaternion.identity);
    }
    // Dugouts and the four corner flags. Flags stand on the actual pitch corners
    // but are display only: the match never reads them.
    static void PitchSide(Builder b,Side main,float L,float W){
        // Cameras look at the z- side, so the benches sit in front of that stand.
        if(main.front-(W/2+3.3f)>=1.9f)foreach(int s in new[]{-1,1}){
            var at=new Vector3(s*7,0,-(W/2+4.4f));
            b.Box(0,StadiumSlot.Seat,at+Vector3.up*.55f,new Vector3(6,1.1f,1.2f),Quaternion.identity);
            b.Box(0,StadiumSlot.Glass,at+new Vector3(0,1.55f,-.15f),new Vector3(6.3f,.08f,1.5f),Quaternion.Euler(-12,0,0));
            b.Box(0,StadiumSlot.Steel,at+new Vector3(0,.8f,-.6f),new Vector3(6.3f,1.6f,.08f),Quaternion.identity,.8f);
        }
        const int g=StadiumBlueprint.Surroundings;
        foreach(int sx in new[]{-1,1})foreach(int sz in new[]{-1,1}){
            var at=new Vector3(sx*L/2,0,sz*W/2);b.Box(g,StadiumSlot.Steel,at+Vector3.up*.75f,new Vector3(.04f,1.5f,.04f),Quaternion.identity);
            b.Box(g,StadiumSlot.Trim,at+new Vector3(-sx*.22f,1.32f,0),new Vector3(.44f,.3f,.015f),Quaternion.Euler(0,sz*30,0));
        }
    }

    // ---- Mesh output -------------------------------------------------------
    // One combined mesh per group and slot keeps draw calls to a few dozen.
    public static Mesh BuildMesh(StadiumBlueprint plan,int group,StadiumSlot slot){
        var v=new List<Vector3>();var n=new List<Vector3>();var uv=new List<Vector2>();var col=new List<Color>();var tri=new List<int>();
        foreach(var p in plan.Pieces)if(p.group==group&&p.slot==slot)Append(p,v,n,uv,col,tri);
        if(v.Count==0)return null;
        var mesh=new Mesh{name="Stadium "+group+" "+slot};if(v.Count>65000)mesh.indexFormat=UnityEngine.Rendering.IndexFormat.UInt32;
        mesh.SetVertices(v);mesh.SetNormals(n);mesh.SetUVs(0,uv);mesh.SetColors(col);mesh.SetTriangles(tri,0);mesh.RecalculateBounds();return mesh;
    }
    static void Quad(Vector3 a,Vector3 b,Vector3 c,Vector3 d,Vector3 normal,Vector2 ua,Vector2 ub,Vector2 uc,Vector2 ud,Color color,List<Vector3> v,List<Vector3> n,List<Vector2> uv,List<Color> col,List<int> tri){
        int i=v.Count;v.Add(a);v.Add(b);v.Add(c);v.Add(d);for(int k=0;k<4;k++){n.Add(normal);col.Add(color);}uv.Add(ua);uv.Add(ub);uv.Add(uc);uv.Add(ud);
        // Unity front faces: cross(b-a,c-a) points along the normal.
        if(Vector3.Dot(Vector3.Cross(b-a,c-a),normal)>=0)tri.AddRange(new[]{i,i+1,i+2,i,i+2,i+3});else tri.AddRange(new[]{i,i+2,i+1,i,i+3,i+2});
    }
    static void Append(StadiumPiece p,List<Vector3> v,List<Vector3> n,List<Vector2> uv,List<Color> col,List<int> tri){
        var r=p.rotation;var s=p.size;Vector3 W(Vector3 local)=>p.center+r*local;
        switch(p.shape){
            case StadiumShape.Quad:{
                float hx=s.x/2,hy=s.y/2;float u0=p.crowdU,u1=p.crowdU+s.x/32f,v0=p.crowdRow/8f,v1=(p.crowdRow+1)/8f;
                Quad(W(new Vector3(-hx,-hy,0)),W(new Vector3(hx,-hy,0)),W(new Vector3(hx,hy,0)),W(new Vector3(-hx,hy,0)),r*Vector3.back,new Vector2(u1,v0),new Vector2(u0,v0),new Vector2(u0,v1),new Vector2(u1,v1),p.tint,v,n,uv,col,tri);return;
            }
            case StadiumShape.Box:{
                var h=s/2;
                for(int axis=0;axis<3;axis++)for(int sign=-1;sign<=1;sign+=2){
                    var normal=Vector3.zero;normal[axis]=sign;int ua=(axis+1)%3,va=(axis+2)%3;
                    Vector3 Corner(float a,float b2){var c=Vector3.zero;c[axis]=sign*h[axis];c[ua]=a*h[ua];c[va]=b2*h[va];return c;}
                    Vector2 U(float a,float b2)=>new Vector2((a+1)*h[ua],(b2+1)*h[va]);
                    // Keep texture "up" vertical on side faces.
                    if(axis!=1&&va!=1){Vector2 U2(float a,float b2)=>new Vector2((b2+1)*h[va],(a+1)*h[ua]);Quad(W(Corner(-1,-1)),W(Corner(1,-1)),W(Corner(1,1)),W(Corner(-1,1)),r*normal,U2(-1,-1),U2(1,-1),U2(1,1),U2(-1,1),p.tint,v,n,uv,col,tri);}
                    else Quad(W(Corner(-1,-1)),W(Corner(1,-1)),W(Corner(1,1)),W(Corner(-1,1)),r*normal,U(-1,-1),U(1,-1),U(1,1),U(-1,1),p.tint,v,n,uv,col,tri);
                }
                return;
            }
            case StadiumShape.Wedge:{
                // Cross-section in local YZ: low edge at -Z, high edge at +Z.
                var h=s/2;Vector3 a=new Vector3(0,-h.y,-h.z),b2=new Vector3(0,-h.y,h.z),c=new Vector3(0,h.y,h.z);
                Vector3 X(Vector3 q,float x){q.x=x;return q;}
                var slope=r*Vector3.Cross(Vector3.right,c-a).normalized;if(Vector3.Dot(slope,r*Vector3.up)<0)slope=-slope;
                Quad(W(X(a,-h.x)),W(X(a,h.x)),W(X(c,h.x)),W(X(c,-h.x)),slope,new Vector2(0,0),new Vector2(s.x,0),new Vector2(s.x,(c-a).magnitude),new Vector2(0,(c-a).magnitude),p.tint,v,n,uv,col,tri);
                Quad(W(X(b2,-h.x)),W(X(b2,h.x)),W(X(c,h.x)),W(X(c,-h.x)),r*Vector3.forward,new Vector2(0,0),new Vector2(s.x,0),new Vector2(s.x,s.y),new Vector2(0,s.y),p.tint,v,n,uv,col,tri);
                Quad(W(X(a,-h.x)),W(X(a,h.x)),W(X(b2,h.x)),W(X(b2,-h.x)),r*Vector3.down,new Vector2(0,0),new Vector2(s.x,0),new Vector2(s.x,s.z),new Vector2(0,s.z),p.tint,v,n,uv,col,tri);
                foreach(int side in new[]{-1,1}){int i=v.Count;var normal=r*(Vector3.right*side);v.Add(W(X(a,side*h.x)));v.Add(W(X(b2,side*h.x)));v.Add(W(X(c,side*h.x)));for(int k=0;k<3;k++){n.Add(normal);col.Add(p.tint);}uv.Add(new Vector2(0,0));uv.Add(new Vector2(s.z,0));uv.Add(new Vector2(s.z,s.y));
                    if(Vector3.Dot(Vector3.Cross(v[i+1]-v[i],v[i+2]-v[i]),normal)>=0)tri.AddRange(new[]{i,i+1,i+2});else tri.AddRange(new[]{i,i+2,i+1});}
                return;
            }
            default:{
                // Prism (outward) or dome (inward, open at the top): ten sides unless the piece names its count.
                int sides=p.shape==StadiumShape.Prism&&p.sides>=3?p.sides:10;bool inside=p.shape==StadiumShape.Dome;float r0=s.x/2,r1=s.x/2*s.z,hy=s.y/2;float around=Mathf.PI*s.x;
                for(int i=0;i<sides;i++){
                    float a0=i*Mathf.PI*2/sides,a1=(i+1)*Mathf.PI*2/sides,am=(a0+a1)/2;
                    Vector3 Ring(float a,float radius,float y)=>new Vector3(Mathf.Cos(a)*radius,y,Mathf.Sin(a)*radius);
                    var normal=r*(new Vector3(Mathf.Cos(am),(r0-r1)/Mathf.Max(.001f,s.y),Mathf.Sin(am)).normalized*(inside?-1:1));
                    float ua=inside?i/(float)sides:around*i/sides,ub=inside?(i+1)/(float)sides:around*(i+1)/sides,vb=inside?1:s.y;
                    Quad(W(Ring(a0,r0,-hy)),W(Ring(a1,r0,-hy)),W(Ring(a1,r1,hy)),W(Ring(a0,r1,hy)),normal,new Vector2(ua,0),new Vector2(ub,0),new Vector2(ub,vb),new Vector2(ua,vb),p.tint,v,n,uv,col,tri);
                    if(!inside&&r1>.01f){int k=v.Count;var up=r*Vector3.up;v.Add(W(new Vector3(0,hy,0)));v.Add(W(Ring(a0,r1,hy)));v.Add(W(Ring(a1,r1,hy)));for(int q=0;q<3;q++){n.Add(up);col.Add(p.tint);uv.Add(Vector2.zero);}
                        if(Vector3.Dot(Vector3.Cross(v[k+1]-v[k],v[k+2]-v[k]),up)>=0)tri.AddRange(new[]{k,k+1,k+2});else tri.AddRange(new[]{k,k+2,k+1});}
                }
                return;
            }
        }
    }
}
}

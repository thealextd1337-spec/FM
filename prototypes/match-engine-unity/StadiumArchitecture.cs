using System;
using System.Collections.Generic;
using UnityEngine;
namespace Doppel6.Probe {
// Club stadium architecture from a ClubStadiumProfile. Pure presentation:
// the plan is a deterministic function of profile, pitch size, home colours and
// detail level. It never reads the session, match clock, Unity's random state or
// match data, and it never changes the profile it receives. Pitch and goals keep
// their match geometry; every piece stands outside the advertising boards except
// the four thin corner flags.
public enum StadiumSlot {Concrete,Crowd,Seat,Roof,Steel,Cladding,Brick,Trim,Glass,Lamp,Shade,Grass,Foliage,Water,Ground,Sky}
public enum StadiumShape {Box,Quad,Wedge,Prism,Dome}
public struct StadiumPiece {
    public StadiumSlot slot;public StadiumShape shape;public int group;
    // Box/Wedge: full size on local axes. Quad: width x height, faces local -Z.
    // Prism/Dome: x = diameter, y = height, z = top/bottom diameter ratio.
    public Vector3 center,size;public Quaternion rotation;public Color tint;
    // Crowd quads only: texture column offset and spectator row (0..7).
    public float crowdU;public int crowdRow;
}
public sealed class StadiumBlueprint {
    // Groups 0..3 are the stand sides in ProbeBridge order (z-, z+, x-, x+) and
    // hide with their stand; group 4 is far surroundings, sky and corner flags.
    public const int Groups=5,Surroundings=4;
    public string ClubId,Archetype,Motif;public int[] Rows;public bool[] Roofs;public bool Detailed;
    public readonly List<StadiumPiece> Pieces=new List<StadiumPiece>();
    // Distance from the pitch centre to each stand's front (camera hide line).
    public readonly float[] Fronts=new float[4];
    // The innermost extent includes cantilever roofs and their light rails.
    // Hiding by terrace fronts alone let close cameras enter a roof overhang.
    public readonly float[] CameraFronts=new float[4];
    public readonly Dictionary<StadiumSlot,Color> Colors=new Dictionary<StadiumSlot,Color>();
    public int PitchPattern,PitchStripes;public Color TurfA,TurfB;public float Wear;
    public Color SeatColor,CrowdHome,CrowdTrim;public float CrowdDensity;
    public int Count(StadiumSlot slot,int group=-1){int n=0;foreach(var p in Pieces)if(p.slot==slot&&(group<0||p.group==group))n++;return n;}
    public float Top(int group){float top=0;foreach(var p in Pieces)if(p.group==group&&p.slot!=StadiumSlot.Sky)top=Mathf.Max(top,p.center.y+Mathf.Abs(p.size.y)/2);return top;}
    public bool SideVisible(int side,Vector3 camera,bool wasShown=true){
        float coordinate=side<2?camera.z:camera.x;if(side%2==0)coordinate=-coordinate;
        return coordinate-CameraFronts[side]<(wasShown?.4f:-.4f);
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
}
public static class StadiumArchitecture {
    public static readonly string[] Archetypes={"civic-bowl","modern-ring","industrial-shed","dockside-ground","urban-court","garden-ground","sun-terraces","hillside-ground"};
    enum RoofKind {Flat,Cantilever,Shed,Gable,Sails,Girder}
    enum Lights {CornerMasts,RoofRail,SidePoles}
    sealed class Style {
        public float rise,frontWall,gapLong,gapEnd,clearance,crowd,aisle;public bool twoTier,bowl,grassBanks;public RoofKind roof;public Lights lights;
        public Color concrete,roofColor,steel,cladding,brick,ground;
    }
    static Color C(float r,float g,float b){return new Color(r,g,b);}
    static Style StyleOf(string archetype){
        switch(archetype){
            case "modern-ring":return new Style{rise=.5f,frontWall=1.5f,gapLong=5.5f,gapEnd=6.5f,clearance=3.6f,crowd=.93f,aisle=11,twoTier=true,bowl=true,roof=RoofKind.Cantilever,lights=Lights.RoofRail,concrete=C(.74f,.75f,.77f),roofColor=C(.86f,.87f,.89f),steel=C(.80f,.82f,.85f),cladding=C(.26f,.29f,.34f),brick=C(.45f,.30f,.26f),ground=C(.20f,.21f,.23f)};
            case "industrial-shed":return new Style{rise=.3f,frontWall=1.1f,gapLong=5.5f,gapEnd=6.5f,clearance=2.8f,crowd=.86f,aisle=14,roof=RoofKind.Shed,lights=Lights.CornerMasts,concrete=C(.46f,.45f,.43f),roofColor=C(.36f,.42f,.40f),steel=C(.55f,.24f,.17f),cladding=C(.34f,.42f,.39f),brick=C(.50f,.27f,.20f),ground=C(.22f,.22f,.21f)};
            case "dockside-ground":return new Style{rise=.38f,frontWall=1.2f,gapLong=5.5f,gapEnd=6.5f,clearance=3f,crowd=.84f,aisle=12,roof=RoofKind.Girder,lights=Lights.CornerMasts,concrete=C(.52f,.52f,.50f),roofColor=C(.24f,.27f,.31f),steel=C(.86f,.66f,.16f),cladding=C(.38f,.41f,.45f),brick=C(.47f,.25f,.19f),ground=C(.25f,.25f,.25f)};
            case "urban-court":return new Style{rise=.58f,frontWall=1.4f,gapLong=4.6f,gapEnd=5.4f,clearance=2.6f,crowd=.95f,aisle=9,roof=RoofKind.Flat,lights=Lights.RoofRail,concrete=C(.50f,.50f,.52f),roofColor=C(.19f,.20f,.22f),steel=C(.30f,.31f,.33f),cladding=C(.62f,.57f,.50f),brick=C(.58f,.37f,.29f),ground=C(.18f,.18f,.19f)};
            case "garden-ground":return new Style{rise=.32f,frontWall=1f,gapLong=6.2f,gapEnd=7.2f,clearance=2.6f,crowd=.78f,aisle=10,grassBanks=true,roof=RoofKind.Gable,lights=Lights.SidePoles,concrete=C(.70f,.68f,.62f),roofColor=C(.46f,.22f,.18f),steel=C(.17f,.26f,.20f),cladding=C(.90f,.88f,.82f),brick=C(.55f,.31f,.24f),ground=C(.20f,.31f,.16f)};
            case "sun-terraces":return new Style{rise=.48f,frontWall=1.3f,gapLong=5.5f,gapEnd=6.5f,clearance=3.2f,crowd=.82f,aisle=12,roof=RoofKind.Sails,lights=Lights.CornerMasts,concrete=C(.88f,.85f,.78f),roofColor=C(.95f,.94f,.90f),steel=C(.84f,.84f,.84f),cladding=C(.80f,.52f,.36f),brick=C(.72f,.46f,.32f),ground=C(.66f,.58f,.44f)};
            case "hillside-ground":return new Style{rise=.36f,frontWall=1.1f,gapLong=6f,gapEnd=7f,clearance=3f,crowd=.8f,aisle=12,grassBanks=true,roof=RoofKind.Flat,lights=Lights.SidePoles,concrete=C(.55f,.55f,.52f),roofColor=C(.28f,.31f,.29f),steel=C(.38f,.40f,.38f),cladding=C(.52f,.47f,.40f),brick=C(.50f,.36f,.28f),ground=C(.19f,.30f,.15f)};
            default:return new Style{rise=.42f,frontWall=1.3f,gapLong=5.5f,gapEnd=6.5f,clearance=3.2f,crowd=.88f,aisle=10,bowl=true,roof=RoofKind.Flat,lights=Lights.CornerMasts,concrete=C(.60f,.58f,.54f),roofColor=C(.27f,.29f,.32f),steel=C(.70f,.72f,.75f),cladding=C(.70f,.65f,.56f),brick=C(.55f,.32f,.25f),ground=C(.23f,.24f,.22f)};
        }
    }
    // One stand side: local X along the stand, +Z away from the pitch.
    struct Side {
        public int index;public float front,half;public Quaternion facing;
        public Vector3 At(float along,float y,float outward){return facing*new Vector3(along,y,outward);}
    }
    sealed class Builder {
        public StadiumBlueprint plan;public System.Random random;public bool detailed;
        public void Add(int group,StadiumSlot slot,StadiumShape shape,Vector3 center,Vector3 size,Quaternion rotation,float shade=1){
            if(!detailed&&shade<0)return;float s=Mathf.Abs(shade);
            plan.Pieces.Add(new StadiumPiece{group=group,slot=slot,shape=shape,center=center,size=size,rotation=rotation,tint=new Color(s,s,s,1)});
        }
        public void Box(int group,StadiumSlot slot,Vector3 center,Vector3 size,Quaternion rotation,float shade=1){Add(group,slot,StadiumShape.Box,center,size,rotation,shade);}
        // A box given in a side's local frame.
        public void Local(Side side,StadiumSlot slot,float along,float y,float outward,Vector3 size,float shade=1,int group=-1){Box(group<0?side.index:group,slot,side.At(along,y,outward),size,side.facing,shade);}
        public float Range(float a,float b){return a+(float)random.NextDouble()*(b-a);}
    }
    static int GroupOf(Vector3 p,float L,float W){return Mathf.Abs(p.z)-W/2>=Mathf.Abs(p.x)-L/2?(p.z<0?0:1):(p.x<0?2:3);}

    public static StadiumBlueprint Plan(ClubStadiumProfile profile,float length,float width,Color home,Color trim,bool detailed=true){
        if(profile==null)throw new ArgumentNullException(nameof(profile));
        string archetype=Array.IndexOf(Archetypes,profile.Archetype)>=0?profile.Archetype:"garden-ground";var style=StyleOf(archetype);
        // Copies only: the profile instance remains exactly as resolved.
        var rows=new int[4];var roofs=new bool[4];
        for(int i=0;i<4;i++){rows[i]=Mathf.Clamp(profile.TierCounts!=null&&profile.TierCounts.Length==4?profile.TierCounts[i]:4,0,24);roofs[i]=profile.RoofSides!=null&&profile.RoofSides.Length==4&&profile.RoofSides[i];}
        float depth=Mathf.Clamp(float.IsNaN(profile.StandDepth)?8:profile.StandDepth,3,26),overhang=Mathf.Clamp(float.IsNaN(profile.RoofOverhang)?1:profile.RoofOverhang,0,4.5f),mast=Mathf.Clamp(float.IsNaN(profile.MastHeight)?26:profile.MastHeight,14,44);
        string motif=profile.FacadeMotif??"";
        var plan=new StadiumBlueprint{ClubId=profile.ClubId,Archetype=archetype,Motif=motif,Rows=rows,Roofs=roofs,Detailed=detailed};
        var b=new Builder{plan=plan,random=new System.Random(profile.DetailSeed),detailed=detailed};
        float L=length,W=width;
        Palette(plan,style,archetype,motif,home,trim,b.random);
        var sides=new Side[4];
        for(int i=0;i<4;i++){
            bool longSide=i<2;int sign=i%2==0?-1:1;
            sides[i]=new Side{index=i,front=longSide?W/2+style.gapLong:L/2+style.gapEnd,half=longSide?L/2+style.gapEnd-1.5f:W/2+style.gapLong-1.5f,
                facing=Quaternion.LookRotation(longSide?new Vector3(0,0,sign):new Vector3(sign,0,0))};
            plan.Fronts[i]=sides[i].front;
        }
        // The main stand is the deepest side; dockside, garden and hillside grounds
        // keep it as their single big structure.
        int main=0;for(int i=1;i<4;i++)if(rows[i]>rows[main])main=i;
        var tops=new float[4];
        for(int i=0;i<4;i++)tops[i]=Stand(b,style,archetype,motif,sides[i],rows[i],roofs[i],depth*(i<2?1:.88f),overhang,i==main,L,W);
        Corners(b,style,archetype,sides,rows,roofs,depth,profile.CornerBuildings,L,W);
        Floodlights(b,style,archetype,sides,rows,roofs,depth,mast,overhang,tops,L,W);
        Surroundings(b,style,archetype,L,W,depth);
        PitchSide(b,sides[0],L,W);
        plan.MeasureCameraFronts();
        return plan;
    }

    static void Palette(StadiumBlueprint plan,Style style,string archetype,string motif,Color home,Color trim,System.Random random){
        var cladding=style.cladding;
        if(motif.Contains("brick"))cladding=style.brick;else if(motif.Contains("limestone")||motif.Contains("stone"))cladding=Color.Lerp(cladding,C(.80f,.76f,.66f),.6f);
        else if(motif.Contains("tiled"))cladding=Color.Lerp(cladding,C(.78f,.48f,.32f),.55f);else if(motif.Contains("timber"))cladding=Color.Lerp(cladding,C(.52f,.38f,.25f),.5f);
        else if(motif.Contains("harbor"))cladding=Color.Lerp(cladding,C(.24f,.36f,.46f),.5f);else if(motif.Contains("fins")||motif.Contains("metal"))cladding=Color.Lerp(cladding,C(.60f,.63f,.67f),.4f);
        var c=plan.Colors;c[StadiumSlot.Concrete]=style.concrete;c[StadiumSlot.Roof]=style.roofColor;c[StadiumSlot.Steel]=motif.Contains("steel")&&archetype!="dockside-ground"?Color.Lerp(style.steel,C(.30f,.36f,.44f),.5f):style.steel;
        c[StadiumSlot.Cladding]=cladding;c[StadiumSlot.Brick]=style.brick;c[StadiumSlot.Trim]=home;c[StadiumSlot.Glass]=C(.55f,.62f,.70f);c[StadiumSlot.Lamp]=C(.95f,.94f,.88f);c[StadiumSlot.Shade]=C(.05f,.05f,.06f);
        c[StadiumSlot.Grass]=archetype=="sun-terraces"?C(.46f,.50f,.30f):C(.27f,.43f,.22f);c[StadiumSlot.Foliage]=archetype=="sun-terraces"?C(.30f,.42f,.18f):C(.16f,.30f,.15f);c[StadiumSlot.Water]=C(.07f,.14f,.21f);c[StadiumSlot.Ground]=style.ground;c[StadiumSlot.Sky]=Color.white;
        c[StadiumSlot.Crowd]=Color.white;c[StadiumSlot.Seat]=Color.white;
        // Seats: civic and garden grounds keep neutral seats; others use club colours.
        plan.SeatColor=archetype=="civic-bowl"||archetype=="garden-ground"||archetype=="hillside-ground"?Color.Lerp(home,C(.35f,.36f,.38f),.65f):archetype=="sun-terraces"?Color.Lerp(home,Color.white,.15f):home;
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

    // Terraces, crowd, aisles, vomitories, back facade and roof of one side.
    // Returns the tallest point so the floodlights can clear it.
    static float Stand(Builder b,Style style,string archetype,string motif,Side side,int rows,bool roof,float depth,float overhang,bool main,float L,float W){
        float half=side.half;
        // Garden and hillside grounds: secondary sides without roof are grass banks.
        bool bank=style.grassBanks&&!main&&!roof;
        if(archetype=="garden-ground"&&main){half=Mathf.Min(half,L*.32f);}
        if(rows<=0){b.Local(side,StadiumSlot.Concrete,0,.6f,side.front+.3f,new Vector3(half*2,1.2f,.4f));return 1.2f;}
        float rowDepth=Mathf.Clamp(depth/rows,.6f,1.6f),rise=style.rise,frontWall=style.frontWall;
        if(bank){
            // A grassy embankment with a few concrete standing steps.
            float total=rows*rowDepth+2,height=rows*rise+1;
            b.Add(side.index,StadiumSlot.Grass,StadiumShape.Wedge,side.At(0,height/2,side.front+total/2),new Vector3(half*2+6,height,total),side.facing);
            for(int i=0;i<rows;i+=2){float y=(i+.5f)/rows*height,z=side.front+(i+.5f)/rows*total;b.Local(side,StadiumSlot.Concrete,0,y,z,new Vector3(half*1.4f,.18f,.55f),-.9f);}
            CrowdSegments(b,style,side,-half*.55f,half*.55f,rows,(i)=>side.front+(i+.5f)/rows*total-.1f,(i)=>(i+.5f)/rows*height,true,(i,x)=>0);
            b.Local(side,StadiumSlot.Steel,0,1.1f+0,side.front-.4f,new Vector3(half*2,.06f,.06f),-.9f);
            return height+1;
        }
        int lower=style.twoTier&&rows>=11?Mathf.RoundToInt(rows*.55f):rows;float band=style.twoTier&&rows>=11?2.6f:0;
        float Out(int i)=>side.front+(i<lower?i:i-2)*rowDepth;
        float Tread(int i)=>frontWall+i*rise+(i>=lower?band:0);
        // Stepped concrete. Upper-tier rows float on a slab above the lower tier.
        for(int i=0;i<rows;i++){
            float treadTop=Tread(i),bottom=i<lower?0:Tread(lower)-.7f;
            b.Local(side,StadiumSlot.Concrete,0,(treadTop+bottom)/2,Out(i)+rowDepth/2,new Vector3(half*2,treadTop-bottom,rowDepth),i>=lower-2&&i<lower&&band>0?.62f:1-.012f*i);
        }
        if(band>0){
            b.Local(side,StadiumSlot.Glass,0,Tread(lower-1)+band/2+.15f,Out(lower-1)+rowDepth+.25f,new Vector3(half*2,band-.3f,.3f));
            b.Local(side,StadiumSlot.Trim,0,Tread(lower)-.5f,Out(lower)-.05f,new Vector3(half*2,.55f,.2f));
        }
        // Painted pitch-side wall in the club colour.
        b.Local(side,StadiumSlot.Trim,0,frontWall*.5f+.05f,side.front-.08f,new Vector3(half*2,frontWall*.85f,.16f));
        b.Local(side,StadiumSlot.Steel,0,frontWall+.55f,side.front+.05f,new Vector3(half*2,.05f,.05f),-1);
        // Aisles every few metres and vomitory openings mid-way up.
        int aisles=Mathf.Max(1,Mathf.RoundToInt(half*2/style.aisle));float spacing=half*2/aisles;int vom=Mathf.Clamp(lower/2,1,Mathf.Max(1,lower-3));
        float Gap(int row,int aisle){bool opening=aisle%2==1&&row>=vom&&row<vom+3&&lower>=6;return opening?1.4f:.55f;}
        for(int a=1;a<aisles;a++){
            float x=-half+a*spacing;
            for(int i=0;i<rows;i++)b.Local(side,StadiumSlot.Concrete,x,Tread(i)+.1f,Out(i)+rowDepth*.5f,new Vector3(1.0f,.2f,rowDepth*.98f),-.8f);
            if(a%2==1&&lower>=6){
                float y0=Tread(vom)-.2f,y1=Tread(vom+2)+.15f,z0=Out(vom),z1=Out(vom+3);
                b.Local(side,StadiumSlot.Shade,x,(y0+y1)/2,(z0+z1)/2,new Vector3(2.4f,y1-y0,z1-z0));
                foreach(int s in new[]{-1,1})b.Local(side,StadiumSlot.Concrete,x+s*1.3f,y1+.15f,(z0+z1)/2,new Vector3(.2f,.5f,z1-z0),.9f);
            }
        }
        CrowdSegments(b,style,side,-half,half,rows,(i)=>Out(i)+rowDepth*.38f,Tread,false,(i,a)=>Gap(i,a),spacing);
        float back=Out(rows-1)+rowDepth,top=Tread(rows-1)+1.6f;
        // Back facade with the club's motif.
        var wallSlot=motif.Contains("brick")?StadiumSlot.Brick:StadiumSlot.Cladding;
        b.Local(side,wallSlot,0,top/2,back+.3f,new Vector3(half*2+1,top,.6f));
        Facade(b,style,motif,side,half,back+.6f,top);
        float roofTop=top;
        if(roof)roofTop=Roof(b,style,archetype,side,half,back,top,overhang,main);
        else if(archetype=="sun-terraces"||archetype=="urban-court"){
            // Open stands: flag poles along the top add a lively silhouette.
            int flags=Mathf.Max(2,Mathf.RoundToInt(half/8));for(int f=0;f<=flags;f++){float x=-half+f*half*2/flags;b.Local(side,StadiumSlot.Steel,x,top+2.2f,back+.2f,new Vector3(.08f,4.4f,.08f),-1);b.Local(side,f%2==0?StadiumSlot.Trim:StadiumSlot.Cladding,x+.6f,top+3.9f,back+.2f,new Vector3(1.2f,.8f,.03f),-1);}
        }
        return Mathf.Max(top,roofTop);
    }

    // Spectator strips per row between the aisles. Empty blocks show seats.
    static void CrowdSegments(Builder b,Style style,Side side,float from,float to,int rows,Func<int,float> outAt,Func<int,float> treadAt,bool standing,Func<int,int,float> gap,float spacing=0){
        int count=spacing>0?Mathf.Max(1,Mathf.RoundToInt((to-from)/spacing)):1;float width=(to-from)/count;
        for(int i=0;i<rows;i++)for(int a=0;a<count;a++){
            float x0=from+a*width+(a>0?gap(i,a):0),x1=from+(a+1)*width-(a<count-1?gap(i,a+1):0);if(x1-x0<.6f)continue;
            float y=treadAt(i),z=outAt(i);
            // Empty seats come in whole blocks; the profile seed decides where.
            bool empty=b.random.NextDouble()>style.crowd+(standing?.1f:0)+.06f*Mathf.Min(i,4)/4f;
            var centre=side.At((x0+x1)/2,y+.52f,z);
            if(empty){b.Box(side.index,StadiumSlot.Seat,side.At((x0+x1)/2,y+.24f,z+.12f),new Vector3(x1-x0,.48f,.2f),side.facing,.95f);continue;}
            // People lean back slightly so the upper rows read in the TV view.
            var rotation=side.facing*Quaternion.Euler(-8,0,0);
            b.plan.Pieces.Add(new StadiumPiece{group=side.index,slot=StadiumSlot.Crowd,shape=StadiumShape.Quad,center=centre,size=new Vector3(x1-x0,1.04f,0),rotation=rotation,tint=Color.white*(1-.015f*i),crowdU=(float)b.random.NextDouble(),crowdRow=b.random.Next(8)});
        }
    }

    static void Facade(Builder b,Style style,string motif,Side side,float half,float back,float top){
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

    static float Roof(Builder b,Style style,string archetype,Side side,float half,float back,float top,float overhang,bool main){
        float front=side.front-overhang,y=top+style.clearance,deep=back+.6f-front,mid=(front+back+.6f)/2,span=half*2+1;
        var kind=style.roof;if(archetype=="dockside-ground"&&!main)kind=RoofKind.Shed;if(archetype=="hillside-ground"&&main)kind=RoofKind.Cantilever;
        switch(kind){
            case RoofKind.Cantilever:{
                // Thin sloping roof, translucent leading edge and tension masts behind.
                float tilt=Mathf.Atan2(1.4f,deep)*Mathf.Rad2Deg;var r=side.facing*Quaternion.Euler(-tilt,0,0);
                b.Box(side.index,StadiumSlot.Roof,side.At(0,y+.7f,mid+deep*.12f),new Vector3(span,.22f,deep*.76f),r);
                b.Box(side.index,StadiumSlot.Glass,side.At(0,y+.7f-deep*.38f*Mathf.Tan(tilt*Mathf.Deg2Rad)-.02f,front+deep*.12f),new Vector3(span,.12f,deep*.24f),r);
                b.Local(side,StadiumSlot.Trim,0,y,front-.1f,new Vector3(span,.5f,.25f));
                int masts=Mathf.Max(2,Mathf.RoundToInt(span/14));
                for(int i=0;i<=masts;i++){float x=-half+i*half*2/masts;float h=y+6;
                    b.Local(side,StadiumSlot.Steel,x,h/2,back+1.2f,new Vector3(.45f,h,.45f));
                    Strut(b,side,StadiumSlot.Steel,side.At(x,h,back+1.2f),side.At(x,y+.2f,front+1),.07f,-1);
                    Strut(b,side,StadiumSlot.Steel,side.At(x,h,back+1.2f),side.At(x,y+1,mid),.07f,-1);}
                return y+6;
            }
            case RoofKind.Shed:case RoofKind.Gable:{
                // Pitched roof on a row of front columns with a lattice truss.
                float ridge=deep*.5f*Mathf.Tan(16*Mathf.Deg2Rad);
                foreach(int s in new[]{-1,1}){float c=mid+s*deep/4;b.Box(side.index,StadiumSlot.Roof,side.At(0,y+ridge/2,c),new Vector3(span,.2f,deep/2/Mathf.Cos(16*Mathf.Deg2Rad)),side.facing*Quaternion.Euler(s*16,0,0));}
                float eave=y-.1f;int bays=Mathf.Max(2,Mathf.RoundToInt(span/(kind==RoofKind.Gable?5:6.5f)));float bay=span/bays;
                b.Local(side,StadiumSlot.Steel,0,eave-.3f,front+.3f,new Vector3(span,.35f,.3f));b.Local(side,StadiumSlot.Steel,0,eave-1.3f,front+.3f,new Vector3(span,.2f,.25f),-1);
                for(int i=0;i<=bays;i++){float x=-span/2+i*bay;b.Local(side,StadiumSlot.Steel,x,eave/2,side.front+.3f,new Vector3(.28f,eave,.28f));
                    if(i<bays){Strut(b,side,StadiumSlot.Steel,side.At(x,eave-1.3f,front+.3f),side.At(x+bay,eave-.3f,front+.3f),.08f,-1);Strut(b,side,StadiumSlot.Steel,side.At(x,eave-.3f,front+.3f),side.At(x+bay,eave-1.3f,front+.3f),.08f,-1);}}
                // Gable ends close the shed.
                foreach(int s in new[]{-1,1})foreach(int half2 in new[]{-1,1})b.Add(side.index,StadiumSlot.Cladding,StadiumShape.Wedge,side.At(s*span/2,y+ridge/2,mid+half2*deep/4),new Vector3(.3f,ridge,deep/2),side.facing*Quaternion.Euler(0,half2<0?0:180,0),.9f);
                if(kind==RoofKind.Gable)b.Local(side,StadiumSlot.Cladding,0,y+ridge+.6f,mid,new Vector3(3,1.2f,1.4f),.95f);
                return y+ridge+1;
            }
            case RoofKind.Sails:{
                // Separate shade sails on slender poles.
                int sails=Mathf.Max(2,Mathf.RoundToInt(span/12));float w=span/sails;
                for(int i=0;i<sails;i++){float x=-span/2+(i+.5f)*w;float twist=i%2==0?5:-5;
                    b.Box(side.index,StadiumSlot.Roof,side.At(x,y+.9f,mid),new Vector3(w*.94f,.06f,deep),side.facing*Quaternion.Euler(-9,0,twist));
                    foreach(int s in new[]{-1,1}){b.Local(side,StadiumSlot.Steel,x+s*w*.45f,(y+1.6f)/2,side.front+.4f,new Vector3(.16f,y+1.6f,.16f));b.Local(side,StadiumSlot.Steel,x+s*w*.45f,(y+.4f)/2,back+.5f,new Vector3(.16f,y+.4f,.16f),-1);}}
                return y+2;
            }
            case RoofKind.Girder:{
                // Flat roof hung from a big box girder spanning between two pylons.
                b.Local(side,StadiumSlot.Roof,0,y,mid,new Vector3(span,.3f,deep));b.Local(side,StadiumSlot.Trim,0,y-.3f,front,new Vector3(span,.6f,.2f));
                float g=y+2.6f;b.Local(side,StadiumSlot.Steel,0,g,front+deep*.35f,new Vector3(span+4,.25f,.25f));b.Local(side,StadiumSlot.Steel,0,g+2.2f,front+deep*.35f,new Vector3(span+4,.25f,.25f));
                int n=Mathf.Max(4,Mathf.RoundToInt(span/3.5f));float step=(span+4)/n;
                for(int i=0;i<n;i++){float x=-(span+4)/2+i*step;Strut(b,side,StadiumSlot.Steel,side.At(x,g,front+deep*.35f),side.At(x+step,g+2.2f,front+deep*.35f),.09f,-1);b.Local(side,StadiumSlot.Steel,x,g+1.1f,front+deep*.35f,new Vector3(.12f,2.2f,.12f),-1);}
                foreach(int s in new[]{-1,1})b.Local(side,StadiumSlot.Steel,s*(span/2+2),(g+2.4f)/2,front+deep*.35f,new Vector3(.9f,g+2.4f,.9f));
                for(int i=1;i<6;i++)Strut(b,side,StadiumSlot.Steel,side.At(-span/2+i*span/6,g,front+deep*.35f),side.At(-span/2+i*span/6,y+.15f,front+deep*.35f),.06f,-1);
                return g+2.4f;
            }
            default:{
                // Flat roof, coloured fascia and rear columns with raking struts.
                b.Box(side.index,StadiumSlot.Roof,side.At(0,y+.25f,mid),new Vector3(span,.32f,deep),side.facing*Quaternion.Euler(-Mathf.Atan2(.5f,deep)*Mathf.Rad2Deg,0,0));
                b.Local(side,StadiumSlot.Trim,0,y,front-.12f,new Vector3(span,.8f,.24f));
                int cols=Mathf.Max(2,Mathf.RoundToInt(span/8));
                for(int i=0;i<=cols;i++){float x=-span/2+i*span/cols;b.Local(side,StadiumSlot.Steel,x,(y+.2f)/2,back+.9f,new Vector3(.32f,y+.2f,.32f));Strut(b,side,StadiumSlot.Steel,side.At(x,y*.55f,back+.9f),side.At(x,y+.05f,mid-deep*.15f),.1f,-1);}
                return y+.6f;
            }
        }
    }
    // A thin beam from a to b.
    static void Strut(Builder b,Side side,StadiumSlot slot,Vector3 from,Vector3 to,float thickness,float shade){
        var d=to-from;if(d.sqrMagnitude<1e-4f)return;b.Box(side.index,slot,(from+to)/2,new Vector3(thickness,thickness,d.magnitude),Quaternion.LookRotation(d),shade);
    }

    static void Corners(Builder b,Style style,string archetype,Side[] sides,int[] rows,bool[] roofs,float depth,bool buildings,float L,float W){
        foreach(int sx in new[]{-1,1})foreach(int sz in new[]{-1,1}){
            int longSide=sz<0?0:1,endSide=sx<0?2:3;int n=Mathf.Min(rows[longSide],rows[endSide]);
            var corner=new Vector3(sx*(sides[endSide].front-1.5f),0,sz*(sides[longSide].front-1.5f));int group=longSide;
            if(style.bowl&&n>0){
                // Bowl corner: rows on arcs that meet both neighbouring stands exactly.
                float rowDepth=Mathf.Clamp(depth/Mathf.Max(rows[longSide],1),.6f,1.6f);const int segments=6;
                for(int s=0;s<segments;s++){
                    float a0=s*90f/segments,a1=(s+1)*90f/segments,am=(a0+a1)/2*Mathf.Deg2Rad;
                    var outward=new Vector3(sx*Mathf.Cos(am),0,sz*Mathf.Sin(am));var facing=Quaternion.LookRotation(outward);
                    for(int i=0;i<n;i++){
                        float r=1.5f+(i+.5f)*rowDepth,y=style.frontWall+i*style.rise,chord=2*(r+rowDepth/2)*Mathf.Tan((a1-a0)/2*Mathf.Deg2Rad)+.1f;
                        b.Box(group,StadiumSlot.Concrete,corner+outward*r+Vector3.up*y/2,new Vector3(chord,y,rowDepth),facing,1-.012f*i);
                        b.plan.Pieces.Add(new StadiumPiece{group=group,slot=StadiumSlot.Crowd,shape=StadiumShape.Quad,center=corner+outward*(r-rowDepth*.12f)+Vector3.up*(y+.52f),size=new Vector3(chord*.92f,1.04f,0),rotation=facing*Quaternion.Euler(-8,0,0),tint=Color.white*(1-.015f*i),crowdU=(float)b.random.NextDouble(),crowdRow=b.random.Next(8)});
                    }
                    float top=style.frontWall+n*style.rise+1.6f,rBack=1.5f+n*rowDepth+.3f,chordBack=2*rBack*Mathf.Tan((a1-a0)/2*Mathf.Deg2Rad)+.2f;
                    b.Box(group,StadiumSlot.Cladding,corner+outward*rBack+Vector3.up*top/2,new Vector3(chordBack,top,.6f),facing);
                    if(roofs[longSide]&&roofs[endSide]&&archetype=="modern-ring"){float y=top+style.clearance;b.Box(group,StadiumSlot.Roof,corner+outward*(rBack/2+.5f)+Vector3.up*(y+.7f),new Vector3(chordBack,.22f,rBack+1),facing*Quaternion.Euler(-4,0,0));}
                }
                continue;
            }
            if(!buildings){
                // Open corner: a low wall and a gate between the stands.
                b.Box(group,StadiumSlot.Concrete,corner+new Vector3(sx,0,sz)*2.5f+Vector3.up*1.1f,new Vector3(6,2.2f,.4f),Quaternion.LookRotation(new Vector3(sx,0,sz)));
                b.Box(group,StadiumSlot.Steel,corner+new Vector3(sx,0,sz)*2.4f+Vector3.up*1.2f,new Vector3(3,2f,.1f),Quaternion.LookRotation(new Vector3(sx,0,sz)),-.8f);
                continue;
            }
            var at=corner+new Vector3(sx,0,sz)*(depth*.55f+3);var face=Quaternion.LookRotation(new Vector3(-sx,0,-sz));
            switch(archetype){
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

    static void Floodlights(Builder b,Style style,string archetype,Side[] sides,int[] rows,bool[] roofs,float depth,float mast,float overhang,float[] tops,float L,float W){
        var lights=style.lights;
        if(lights==Lights.RoofRail){
            // Light rails under each roof front; unroofed sides get short masts.
            for(int i=0;i<4;i++){
                var s=sides[i];
                if(roofs[i]){b.Local(s,StadiumSlot.Lamp,0,tops[i]-(archetype=="modern-ring"?5.4f:.9f),s.front-overhang*.5f,new Vector3(s.half*1.6f,.3f,.4f));continue;}
                foreach(int x in new[]{-1,1}){var foot=s.At(x*s.half*.7f,0,s.front+depth+2);Mast(b,GroupOf(foot,L,W),foot,Mathf.Max(18,tops[i]+6),false);}
            }
            return;
        }
        if(lights==Lights.SidePoles){
            // Slim poles along both long sides, behind the stands.
            foreach(int i in new[]{0,1}){var s=sides[i];int poles=3;for(int p=0;p<poles;p++){float x=(p-(poles-1)/2f)*s.half*.75f;var foot=s.At(x,0,s.front+Mathf.Clamp(depth/Mathf.Max(1,rows[i]),.6f,1.6f)*rows[i]+3);Mast(b,i,foot,Mathf.Max(mast*.72f,tops[i]+5),false);}}
            return;
        }
        // Corner masts on the diagonal beyond the corners.
        foreach(int sx in new[]{-1,1})foreach(int sz in new[]{-1,1}){
            var corner=new Vector3(sx*(sides[sx<0?2:3].front-1.5f),0,sz*(sides[sz<0?0:1].front-1.5f));
            var foot=corner+new Vector3(sx,0,sz)*(depth*.75f+4);Mast(b,sz<0?0:1,foot,Mathf.Max(mast,Mathf.Max(tops[sz<0?0:1],tops[sx<0?2:3])+8),true);
        }
    }
    static void Mast(Builder b,int group,Vector3 foot,float height,bool lattice){
        b.Add(group,StadiumSlot.Steel,StadiumShape.Prism,foot+Vector3.up*height/2,new Vector3(lattice?1.1f:.45f,height,lattice?.35f:.6f),Quaternion.identity);
        var toward=new Vector3(-foot.x,-height*.55f,-foot.z);var head=Quaternion.LookRotation(toward);
        var size=lattice?new Vector3(5,3.2f,.35f):new Vector3(2.2f,1.2f,.3f);
        b.Box(group,StadiumSlot.Steel,foot+Vector3.up*(height+.4f)-head*Vector3.forward*.25f,size+new Vector3(.4f,.4f,0),head);
        // Lamp faces the pitch: a box whose front face carries the lamp grid.
        b.Box(group,StadiumSlot.Lamp,foot+Vector3.up*(height+.4f)+head*Vector3.forward*.05f,size,head);
    }

    static void Surroundings(Builder b,Style style,string archetype,float L,float W,float depth){
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
                // Prism (outward) or dome (inward, open at the top): 10 sides.
                const int sides=10;bool inside=p.shape==StadiumShape.Dome;float r0=s.x/2,r1=s.x/2*s.z,hy=s.y/2;float around=Mathf.PI*s.x;
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

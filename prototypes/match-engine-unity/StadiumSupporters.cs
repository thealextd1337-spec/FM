using System;
using System.Collections.Generic;
using UnityEngine;
namespace Doppel6.Probe {
// Ultra blocks of both clubs on the terrace blocks StadiumArchitecture reserved: standing
// figures, flags on poles and banners. Pure plan: a deterministic function of the stadium
// plan, the clubs (IDs and v61 club colours from WorldConfig.presentation; kit colours only
// when the page sends no presentation) and the detail level. Nothing is integrated over time:
// D6Flag.shader displaces the vertices from the displayed match clock (_D6PresentTime) and the
// per-vertex phases written here, so pause, replay and seek show the same picture for the same
// clock. Displace mirrors the shader for tests. No UnityEngine.Random, no Time.
public sealed class SupporterSetup {
    // Physical team order (0 = managed club); HomeTeam is the team flagged home. Patterns are the
    // clubs' identity patterns (StadiumArchitecture.IdentityPatterns) for banners and flags.
    public string[] ClubIds;public Color[] Primary,Secondary;public int[] Patterns;public int HomeTeam;public bool Neutral;
}
// Vertex streams of one mesh: rest position, normal, tint, atlas UV, motion (phase in cycles,
// bounce weight, cloth weight 0 at the pole/top edge to 1 at the free edge, swing weight),
// swing pivot (hands) and swing axis (toward the pitch).
public sealed class SupporterMesh {
    public readonly List<Vector3> Vertices=new List<Vector3>(),Normals=new List<Vector3>(),Pivots=new List<Vector3>();
    public readonly List<Vector2> Uv=new List<Vector2>();public readonly List<Vector4> Motion=new List<Vector4>(),Axes=new List<Vector4>();
    public readonly List<Color> Colors=new List<Color>();public readonly List<int> Triangles=new List<int>();
    public int TriangleCount=>Triangles.Count/3;
}
public sealed class SupporterBlockPlan {
    public SupporterBlock Block;public int Team;public string ClubId;public Color Primary,Secondary;public int Pattern;
    // Layout key of the jitter, flag holders and banner sizes: the club at a home ground, one shared
    // key at a neutral venue so both equal ends carry the same numbers. Phases always use the club.
    public string Layout;
    public int People,Flags,Banners;
    // Figures and poles share one material; flags and banners the club atlas.
    public readonly SupporterMesh Figures=new SupporterMesh(),Cloth=new SupporterMesh();
    public Bounds FigureBounds,ClothBounds;
}
public sealed class SupporterPlan {
    public readonly List<SupporterBlockPlan> Blocks=new List<SupporterBlockPlan>();
    public int People,Flags,Banners,Triangles;
}
public static class StadiumSupporters {
    // Motion constants. Every frequency is a multiple of 1/600 Hz, so the 600 s wrap of the
    // presentation time is seamless. Celebration only raises amplitudes, never frequencies.
    public const float TimeWrap=600,BobHz=1.8f,Bob=.045f,BobJump=.2f,ArmPump=1.6f,SwingHz=.55f,Swing=24,SwingJump=14,WaveHz=1.35f,Wave=.15f,WaveK=1.3f;
    public const int MaxFlags=96,MaxFlagsReduced=32,MaxBanners=24,MaxBannersReduced=12;
    // Generous vertex-shader reach: pole tip plus cloth width swinging, ripple and jump.
    public const float FigureReach=4.4f,ClothReach=4.6f;
    // Atlas: four 64 x 64 flag designs in the lower half, two 128 x 64 banners in the upper half.
    public const int AtlasWidth=256,AtlasHeight=128;

    public static float PresentTime(double clock){double t=clock%TimeWrap;if(t<0)t+=TimeWrap;return (float)t;}
    // The native goal scene ends at 4.05 s. Ease back to ordinary motion before its flag clears;
    // use only the received celebration time, including when the displayed clock is paused.
    public const double CelebrationEnd=4.05;
    public static float Celebration(bool celebrating,int celebrationTeam,double celebrationTime,int team){
        if(!celebrating||celebrationTeam!=team||celebrationTime<=0||celebrationTime>=CelebrationEnd)return 0;
        float t=(float)celebrationTime;return Mathf.SmoothStep(0,1,t/.35f)*Mathf.SmoothStep(0,1,(float)((CelebrationEnd-celebrationTime)/1.2));
    }
    // FNV-1a 32 over UTF-16 code units (same algorithm as the page's d6PresentationHash).
    public static uint Hash(string text){unchecked{uint h=2166136261u;foreach(char c in text??""){h^=c;h*=16777619u;}return h;}}
    public static float Phase(string clubId,string kind,int index)=>(Hash(clubId+"|"+kind+"|"+index)&0xffff)/65536f;
    static Vector3 Rotate(Vector3 v,Vector3 axis,float angle){float s=Mathf.Sin(angle),c=Mathf.Cos(angle);return v*c+Vector3.Cross(axis,v)*s+axis*(Vector3.Dot(axis,v)*(1-c));}
    // Mirror of D6Flag.shader's vertex motion (ripple along the cloth normal, swing about the
    // hands around the axis, coherent bounce).
    public static Vector3 Displace(Vector3 rest,Vector3 normal,Vector4 motion,Vector3 pivot,Vector3 axis,float time,float celebrate){
        const float tau=Mathf.PI*2;float phase=motion.x;
        float ripple=Mathf.Sin(tau*(time*WaveHz+phase)-tau*WaveK*motion.z)*motion.z*Wave*(1+.6f*celebrate);
        var p=rest+normal*ripple;
        float angle=(Swing+SwingJump*celebrate)*Mathf.Deg2Rad*Mathf.Sin(tau*(time*SwingHz+phase))*motion.w;
        p=pivot+Rotate(p-pivot,axis,angle);
        p.y+=motion.y*(Bob+BobJump*celebrate)*(.5f+.5f*Mathf.Sin(tau*(time*BobHz+phase)));
        return p;
    }
    // Club atlas texel (sRGB): flags 0 halves, 1 tricolour, 2 diagonal, 3 identity pattern;
    // banners 0 identity pattern with border, 1 stripes with a plain diamond. No text, no logos.
    public static Color AtlasTexel(int x,int y,Color primary,Color secondary,int pattern){
        var p=Muted(primary);var s=Muted(secondary);
        if(y<64){int d=x/64,u=x%64,v=y;bool edge=u<3||u>60||v<3||v>60;if(edge)return s*.92f;
            switch(d){case 0:return u<32?p:s;case 1:return v>=22&&v<42?s:p;case 2:return u+v<64?p:s;default:return StadiumArchitecture.PatternTexel(pattern,u,v,64,64)?s:p;}}
        {int d=x/128,u=x%128,v=y-64;bool edge=u<4||u>123||v<4||v>59;if(edge)return d==0?s:p;
            if(d==0)return StadiumArchitecture.PatternTexel(pattern,u,v,128,64)?s:p;
            bool diamond=Mathf.Abs(u-64)/18f+Mathf.Abs(v-32)/18f<1;return diamond?p:(v/11)%2==0?s:p;}
    }
    // Crowd and cloth stay a little calmer than the kits on the pitch.
    static Color Muted(Color c){var m=Color.Lerp(c,new Color(.45f,.45f,.47f),.12f)*.94f;m.a=1;return m;}
    static Color Shirt(Color c){var m=Color.Lerp(c,new Color(.42f,.42f,.44f),.2f)*.9f;m.a=1;return m;}

    public static SupporterPlan Plan(StadiumBlueprint stadium,SupporterSetup setup,bool detailed){
        if(stadium==null||setup==null)throw new ArgumentNullException(stadium==null?nameof(stadium):nameof(setup));
        var plan=new SupporterPlan();int flagBudget=detailed?MaxFlags:MaxFlagsReduced,bannerBudget=detailed?MaxBanners:MaxBannersReduced;
        var spec=stadium.Structure?.Supporters;float density=spec!=null?Mathf.Clamp01(spec.FlagDensity):.6f;var style=spec!=null?spec.Banners:BannerStyle.Fence;
        foreach(var block in stadium.Blocks){
            int team=block.Role==0?setup.HomeTeam:1-setup.HomeTeam;
            var bp=new SupporterBlockPlan{Block=block,Team=team,ClubId=setup.ClubIds[team],Primary=setup.Primary[team],Secondary=setup.Secondary[team],Pattern=setup.Patterns!=null&&setup.Patterns.Length>team?setup.Patterns[team]:0};
            bp.Layout=setup.Neutral?"neutral|"+stadium.Venue:bp.ClubId+"|"+block.Side;
            // Home ultras carry most flags; neutral finals split them evenly.
            float share=setup.Neutral?.5f:block.Role==0?.62f:.38f;
            var t=stadium.Terraces[block.Side];
            var holders=Figures(bp,t,detailed);
            Flags(bp,t,holders,Mathf.RoundToInt(flagBudget*share*(setup.Neutral?1:block.Role==0?density:Mathf.Max(.5f,density))));
            Banners(bp,t,style,Mathf.Max(1,Mathf.FloorToInt(bannerBudget*share)));
            bp.FigureBounds=Inflate(bp.Figures,FigureReach);bp.ClothBounds=Inflate(bp.Cloth,ClothReach);
            plan.Blocks.Add(bp);plan.People+=bp.People;plan.Flags+=bp.Flags;plan.Banners+=bp.Banners;plan.Triangles+=bp.Figures.TriangleCount+bp.Cloth.TriangleCount;
        }
        return plan;
    }
    static Bounds Inflate(SupporterMesh m,float reach){
        if(m.Vertices.Count==0)return new Bounds(Vector3.zero,Vector3.zero);var b=new Bounds(m.Vertices[0],Vector3.zero);foreach(var v in m.Vertices)b.Encapsulate(v);b.Expand(reach*2);return b;
    }

    // Standing figures on every row of the block, clear of the aisles. Detailed figures have legs
    // and, for some, raised arms and scarves; reduced figures keep body and head (same silhouette
    // of the block). Returns candidate flag holders (hands position, row) from the second row on.
    static List<(Vector3 hands,int row,float along)> Figures(SupporterBlockPlan bp,StandTerrace t,bool detailed){
        var holders=new List<(Vector3,int,float)>();var block=bp.Block;var m=bp.Figures;
        var rnd=new System.Random((int)(Hash(bp.Layout+"|figures")&0x7fffffff));float basePhase=Phase(bp.ClubId,"block",block.Side);
        var inward=t.Facing*Vector3.back;const float spacing=.62f;
        var dark=new Color(.13f,.13f,.15f);Color[] skins={new Color(.86f,.66f,.52f),new Color(.72f,.52f,.38f),new Color(.55f,.38f,.27f),new Color(.38f,.26f,.18f)};Color[] hairs={new Color(.12f,.10f,.09f),new Color(.30f,.21f,.14f),new Color(.55f,.44f,.30f),new Color(.40f,.39f,.37f)};
        var shirts=new[]{Shirt(bp.Primary),Shirt(bp.Primary),Shirt(bp.Primary),Shirt(bp.Secondary),Shirt(Color.Lerp(bp.Primary,dark,.45f))};
        for(int r=block.FirstRow;r<=block.LastRow&&r<t.Rows;r++){
            float y=t.Tread[r],z=t.Out[r]+t.RowDepth*.46f,offset=(r%2)*spacing*.5f;
            for(float x=block.From+.3f+offset;x<=block.To-.3f;x+=spacing){
                bool aisle=false;foreach(var a in t.Aisles)aisle|=Mathf.Abs(x-a)<.75f;if(aisle)continue;
                float jx=(float)(rnd.NextDouble()-.5)*.22f,scale=.94f+(float)rnd.NextDouble()*.12f,phase=basePhase+((float)rnd.NextDouble()-.5f)*.12f;
                var shirt=shirts[rnd.Next(shirts.Length)];var skin=skins[rnd.Next(skins.Length)];var hair=hairs[rnd.Next(hairs.Length)];
                bool arms=detailed&&rnd.NextDouble()<.4,scarf=arms&&rnd.NextDouble()<.35;
                Person(m,t,x+jx,y,z,scale,shirt,skin,hair,dark,arms,scarf,bp.Secondary,phase,inward,detailed);bp.People++;
                if(r>block.FirstRow||block.LastRow==block.FirstRow)holders.Add((t.At(x+jx,y+1.5f*scale,z),r,x+jx));
            }
        }
        return holders;
    }
    // One standing figure facing the pitch, in the terrace frame (front faces toward the pitch).
    static void Person(SupporterMesh m,StandTerrace t,float x,float y,float z,float s,Color shirt,Color skin,Color hair,Color legs,bool arms,bool scarf,Color scarfColor,float phase,Vector3 inward,bool detailed){
        var pivot=t.At(x,y,z);
        void Part(float cx,float cy,float w,float h,float d,Color front,Color top,float bounceLow,float bounceHigh,bool topFace=true,float roll=0){
            BoxFaces(m,t,new Vector3(x+cx*s,y+cy*s,z),new Vector3(w*s/2,h*s/2,d*s/2),roll,front,top,new Vector4(phase,bounceLow,0,0),new Vector4(phase,bounceHigh,0,0),pivot,inward,topFace);
        }
        if(detailed)Part(0,.4f,.3f,.8f,.22f,legs,legs,1,1,false);
        Part(0,1.09f,.44f,.62f,.26f,shirt,shirt*.92f,1,1);
        Part(0,1.545f,.21f,.25f,.23f,skin,hair,1,1);
        if(arms){foreach(int k in new[]{-1,1})Part(k*.27f,1.66f,.09f,.6f,.09f,shirt,skin,1,ArmPump,true,-k*18);
            if(scarf)Quad(m,t,x,y+1.98f*s,z-.02f,.82f*s,.17f*s,Shirt(scarfColor),new Vector4(phase,ArmPump,0,0),pivot,inward);}
    }
    // Box with front, side and (optionally) top faces; back and bottom never face a camera.
    static void BoxFaces(SupporterMesh m,StandTerrace t,Vector3 c,Vector3 h,float roll,Color front,Color top,Vector4 low,Vector4 high,Vector3 pivot,Vector3 inward,bool topFace){
        var r=t.Facing*Quaternion.Euler(0,0,roll);Vector3 L(float a,float b2,float d){var local=new Vector3(a*h.x,b2*h.y,d*h.z);var cl=t.Facing*new Vector3(c.x,c.y,c.z);return cl+r*local;}
        void Face(Vector3 a,Vector3 b2,Vector3 c2,Vector3 d,Vector3 normal,Color col,bool aHigh,bool bHigh,bool cHigh,bool dHigh){
            int i=m.Vertices.Count;m.Vertices.Add(a);m.Vertices.Add(b2);m.Vertices.Add(c2);m.Vertices.Add(d);
            foreach(var hi in new[]{aHigh,bHigh,cHigh,dHigh}){m.Normals.Add(normal);m.Colors.Add(col.linear);m.Uv.Add(new Vector2(.5f,.5f));m.Motion.Add(hi?high:low);m.Pivots.Add(pivot);m.Axes.Add(new Vector4(inward.x,inward.y,inward.z,0));}
            if(Vector3.Dot(Vector3.Cross(b2-a,c2-a),normal)>=0)m.Triangles.AddRange(new[]{i,i+1,i+2,i,i+2,i+3});else m.Triangles.AddRange(new[]{i,i+2,i+1,i,i+3,i+2});
        }
        // Front (toward the pitch, local -Z), left/right and top.
        Face(L(-1,-1,-1),L(1,-1,-1),L(1,1,-1),L(-1,1,-1),r*Vector3.back,front,false,false,true,true);
        Face(L(-1,-1,1),L(-1,-1,-1),L(-1,1,-1),L(-1,1,1),r*Vector3.left,front*.8f,false,false,true,true);
        Face(L(1,-1,-1),L(1,-1,1),L(1,1,1),L(1,1,-1),r*Vector3.right,front*.8f,false,false,true,true);
        if(topFace)Face(L(-1,1,-1),L(1,1,-1),L(1,1,1),L(-1,1,1),r*Vector3.up,top,true,true,true,true);
    }
    // A flat quad in the terrace frame facing the pitch (scarves); drawn two-sided by the shader.
    static void Quad(SupporterMesh m,StandTerrace t,float x,float y,float z,float w,float h,Color col,Vector4 motion,Vector3 pivot,Vector3 inward){
        int i=m.Vertices.Count;var n=t.Facing*Vector3.back;
        foreach(var (a,b2) in new[]{(-1f,-1f),(1f,-1f),(1f,1f),(-1f,1f)}){m.Vertices.Add(t.At(x+a*w/2,y+b2*h/2,z));m.Normals.Add(n);m.Colors.Add(col.linear);m.Uv.Add(new Vector2(.5f,.5f));m.Motion.Add(motion);m.Pivots.Add(pivot);m.Axes.Add(new Vector4(inward.x,inward.y,inward.z,0));}
        Tri(m,i,i+1,i+2);Tri(m,i,i+2,i+3);
    }

    // Flags on poles held by figures from the second row on, at least 2.2 m apart in a row and
    // staggered between rows. Cloth hangs from the pole top sideways, facing the pitch.
    static void Flags(SupporterBlockPlan bp,StandTerrace t,List<(Vector3 hands,int row,float along)> holders,int count){
        if(count<=0||holders.Count==0)return;var inward=t.Facing*Vector3.back;var used=new List<(int row,float along)>();
        var rnd=new System.Random((int)(Hash(bp.Layout+"|flags")&0x7fffffff));
        // Deterministic spread: walk the holders with a stride coprime to their count.
        int n=holders.Count,stride=Math.Max(1,n/Math.Max(1,count));while(Gcd(stride,n)!=1)stride++;
        for(int k=0,i=(int)(rnd.NextDouble()*n);k<n&&bp.Flags<count;k++,i=(i+stride)%n){
            var h=holders[i];bool clear=true;foreach(var u in used)clear&=!(Mathf.Abs(u.row-h.row)<=1&&Mathf.Abs(u.along-h.along)<2.2f);if(!clear)continue;used.Add((h.row,h.along));
            int index=bp.Flags++;float phase=Phase(bp.ClubId,"flag",index)*.5f+Phase(bp.ClubId,"block",bp.Block.Side);
            bool big=rnd.NextDouble()<.45;float pole=big?3.4f:2.5f,w=big?2.4f:1.6f,hgt=big?1.5f:1.05f,dir=rnd.NextDouble()<.5?-1:1;int design=rnd.Next(4);
            var along=t.Facing*Vector3.right;var up=Vector3.up;var motion=new Vector4(phase,1,0,1);
            // Pole (figure material): from below the hands to its tip.
            Beam(bp.Figures,h.hands-up*.55f,h.hands+up*pole,.05f,new Color(.55f,.55f,.56f),motion,h.hands,inward);
            // Cloth grid 4 x 2, u from the pole (0) to the free edge (1).
            var m=bp.Cloth;int baseIndex=m.Vertices.Count;var tip=h.hands+up*(pole-.05f);
            float u0=(design*64+3)/(float)AtlasWidth,u1=(design*64+61)/(float)AtlasWidth,v0=3f/AtlasHeight,v1=61f/AtlasHeight;
            for(int j=0;j<=2;j++)for(int q=0;q<=4;q++){float u=q/4f,v=j/2f;var p=tip+along*(dir*u*w)-up*(v*hgt);
                m.Vertices.Add(p);m.Normals.Add(inward);m.Colors.Add(Color.white);m.Uv.Add(new Vector2(dir>0?Mathf.Lerp(u0,u1,u):Mathf.Lerp(u1,u0,u),Mathf.Lerp(v1,v0,v)));m.Motion.Add(new Vector4(phase,1,u,1));m.Pivots.Add(h.hands);m.Axes.Add(new Vector4(inward.x,inward.y,inward.z,0));}
            for(int j=0;j<2;j++)for(int q=0;q<4;q++){int a=baseIndex+j*5+q;Tri(m,a,a+1,a+6);Tri(m,a,a+6,a+5);}
        }
    }
    static int Gcd(int a,int b){while(b!=0){int t=a%b;a=b;b=t;}return a;}
    // Unity front faces: cross(b-a,c-a) along the normal. The shader lights both sides by facing.
    static void Tri(SupporterMesh m,int a,int b,int c){
        var v=m.Vertices;if(Vector3.Dot(Vector3.Cross(v[b]-v[a],v[c]-v[a]),m.Normals[a])>=0)m.Triangles.AddRange(new[]{a,b,c});else m.Triangles.AddRange(new[]{a,c,b});
    }
    static void Beam(SupporterMesh m,Vector3 from,Vector3 to,float thickness,Color col,Vector4 motion,Vector3 pivot,Vector3 inward){
        var d=to-from;var rot=Quaternion.LookRotation(d.normalized,Mathf.Abs(d.normalized.y)>.9f?Vector3.forward:Vector3.up);float len=d.magnitude;var c=(from+to)/2;
        for(int f=0;f<4;f++){var face=Quaternion.Euler(0,0,f*90);var n=rot*(face*Vector3.up);int i=m.Vertices.Count;
            foreach(var (a,b2) in new[]{(-1f,-.5f),(1f,-.5f),(1f,.5f),(-1f,.5f)}){var local=face*new Vector3(a*thickness,thickness,0)+new Vector3(0,0,b2*len);m.Vertices.Add(c+rot*local);m.Normals.Add(n);m.Colors.Add(col.linear);m.Uv.Add(new Vector2(.5f,.5f));m.Motion.Add(motion);m.Pivots.Add(pivot);m.Axes.Add(new Vector4(inward.x,inward.y,inward.z,0));}
            Tri(m,i,i+1,i+2);Tri(m,i,i+2,i+3);}
    }

    // Banners on the block front (fence), hung from the tier above (drop) or one long banner;
    // they cover the pitch wall only, never the boards or the pitch.
    static void Banners(SupporterBlockPlan bp,StandTerrace t,BannerStyle style,int count){
        var block=bp.Block;var inward=t.Facing*Vector3.back;float width=block.To-block.From;if(width<3||count<=0)return;
        var rnd=new System.Random((int)(Hash(bp.Layout+"|banners")&0x7fffffff));
        float y0,y1,z;int tierAbove=-1;foreach(var s in t.TierStarts)if(s>block.LastRow&&tierAbove<0)tierAbove=s;
        if(block.FirstRow>0){int r=block.FirstRow;y1=t.Tread[r]-.18f;y0=y1-.95f;z=t.Out[r]-.32f;}
        else if(style==BannerStyle.Drop&&tierAbove>0){y1=t.Tread[tierAbove]-.25f;y0=y1-2.2f;z=t.Out[tierAbove]-.3f;}
        else{y0=t.Podium+.12f;y1=t.Wall-.1f;z=t.Front-.26f;}
        int n=style==BannerStyle.Long?Math.Min(count,2):Math.Min(count,Mathf.Clamp(Mathf.FloorToInt(width/5),2,4));
        float gap=.6f,each=(width-gap*(n+1))/n;
        for(int k=0;k<n;k++){
            float w=style==BannerStyle.Long&&k==0&&n>1?width*.62f:style==BannerStyle.Long&&n>1?width*.38f-gap*3:each;
            float x0=style==BannerStyle.Long&&n>1?(k==0?block.From+gap:block.From+gap*2+width*.62f):block.From+gap+k*(each+gap);
            if(style==BannerStyle.Drop&&tierAbove>0){w=Mathf.Min(w,2.8f);x0+= (each-w)/2;}
            int design=k%2==0?0:1;float phase=Phase(bp.ClubId,"banner",k);
            var m=bp.Cloth;int baseIndex=m.Vertices.Count;float u0=(design*128+4)/(float)AtlasWidth,u1=(design*128+124)/(float)AtlasWidth,v0=68f/AtlasHeight,v1=124f/AtlasHeight;
            for(int j=0;j<=1;j++)for(int q=0;q<=3;q++){float u=q/3f,v=j;var p=t.At(x0+u*w,Mathf.Lerp(y1,y0,v),z);
                m.Vertices.Add(p);m.Normals.Add(inward);m.Colors.Add(Color.white);m.Uv.Add(new Vector2(Mathf.Lerp(u0,u1,u),Mathf.Lerp(v1,v0,v)));m.Motion.Add(new Vector4(phase,0,v*.25f,0));m.Pivots.Add(p);m.Axes.Add(new Vector4(inward.x,inward.y,inward.z,0));}
            for(int q=0;q<3;q++){int a=baseIndex+q;Tri(m,a,a+1,a+5);Tri(m,a,a+5,a+4);}
            bp.Banners++;
        }
    }

    // ---- Mesh output -------------------------------------------------------
    public static Mesh BuildMesh(SupporterMesh s,Bounds bounds,string name){
        if(s.Vertices.Count==0)return null;
        var mesh=new Mesh{name=name};if(s.Vertices.Count>65000)mesh.indexFormat=UnityEngine.Rendering.IndexFormat.UInt32;
        mesh.SetVertices(s.Vertices);mesh.SetNormals(s.Normals);mesh.SetTangents(s.Axes);mesh.SetColors(s.Colors);
        mesh.SetUVs(0,s.Uv);mesh.SetUVs(1,s.Motion);mesh.SetUVs(2,s.Pivots);mesh.SetTriangles(s.Triangles,0);
        // Vertex-shader motion leaves the rest bounds: culling uses the inflated reach.
        mesh.bounds=bounds;return mesh;
    }
}
}

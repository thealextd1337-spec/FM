#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using System.Reflection;
using UnityEngine;
using Doppel6.Probe;
// Club stadium architecture: determinism, profile isolation, pitch clearance, sight lines of the
// five match cameras, built identity features, supporter block reservations, structural
// fingerprints, mesh budgets and the real ProbeBridge wiring of WorldConfig.teams[].home and
// WorldConfig.presentation (venue, club colours, light look). Every distinct venue design is
// checked: the legacy catalogue, the authored prototypes, the country cup and league standards
// and the neutral arenas.
public static class StadiumArchitectureTests {
    [Serializable] public class Venue {public string id,venue,source,archetype,sizeClass,signature,fingerprint;public int pieces,reducedPieces,triangles,reducedTriangles,renderers,reducedRenderers,blocks,people,flags,banners,reducedFlags,reducedBanners,supporterTriangles,reducedSupporterTriangles;public float tallest;}
    [Serializable] public class Pair {public string a,b;public int groups,silhouette,required,requiredSilhouette;public string differing;}
    [Serializable] class Report {public int passed;public string note;public string[] checks;public Venue[] venues;public Pair[] pairs;}
    static readonly Color Home=new Color(.8f,.1f,.15f),Trim=Color.white;
    // Render budgets (contracts.json renderBudgets): stadium plus supporters.
    public const int TriangleBudget=220000,ReducedTriangleBudget=110000,DrawCallBudget=120,ReducedDrawCallBudget=75;
    static string Shape(ClubStadiumProfile p){return p.Archetype+"/"+p.FacadeMotif+"/"+string.Join(",",p.TierCounts)+"/"+string.Join(",",p.RoofSides)+"/"+p.StandDepth+"/"+p.MastHeight+"/"+p.RoofOverhang+"/"+p.DetailSeed+"/"+p.CornerBuildings+"/"+p.Venue+"/"+StadiumFingerprint.Declared(p.Identity).Count;}
    // World-space axis-aligned bounds of one piece.
    static Bounds Of(StadiumPiece p)=>StadiumBlueprint.BoundsOf(p);
    // Segment against an oriented piece (slab test in its local frame).
    static bool Blocks(StadiumPiece p,Vector3 from,Vector3 to){
        var h=p.shape==StadiumShape.Quad?new Vector3(p.size.x/2,p.size.y/2,.02f):p.shape==StadiumShape.Prism?new Vector3(p.size.x/2,p.size.y/2,p.size.x/2):p.size/2;
        var inv=Quaternion.Inverse(p.rotation);var a=inv*(from-p.center);var d=inv*(to-from);float t0=0,t1=1;
        for(int k=0;k<3;k++){
            if(Mathf.Abs(d[k])<1e-6f){if(Mathf.Abs(a[k])>h[k])return false;continue;}
            float u=(-h[k]-a[k])/d[k],v=(h[k]-a[k])/d[k];if(u>v){var t=u;u=v;v=t;}t0=Mathf.Max(t0,u);t1=Mathf.Min(t1,v);if(t0>t1)return false;
        }
        return true;
    }
    // Port of v98CameraAim (dist/world-pitch3d-v98.js) for landscape pages.
    public static (Vector3 position,Vector3 target) Camera(string mode,Vector3 ball,float near){
        float Limit(float v,float a,float b)=>Mathf.Max(a,Mathf.Min(b,v));
        float halfCentre=17*(float)Math.Tanh(ball.x/8),beyond=Mathf.Max(0,Mathf.Abs(ball.x)-17);
        var tracked=new Vector3(halfCentre*.65f+ball.x*.35f+Mathf.Sign(ball.x)*Mathf.Min(4,beyond*.18f),0,Limit(ball.z*.35f,-6.5f,6.5f));
        Vector3 position=new Vector3(Limit(ball.x*.28f,-9,9),21,31),target=tracked;
        if(mode=="wide"){position=new Vector3(Limit(ball.x*.56f,-17,17),32,49);target=new Vector3(Limit(ball.x*.56f,-17,17),0,Limit(ball.z*.1f,-2,2)-2);}
        else if(mode=="sideline")position=new Vector3(tracked.x*.65f,13,31);
        else if(mode=="diagonal")position=new Vector3(tracked.x-22,23,32);
        else if(mode=="goal"){position=new Vector3(-49,19,9);target=new Vector3(Limit(ball.x*.65f,-25,25),0,Limit(ball.z*.4f,-9,9));}
        float distance=1.42f-Limit(near,0,100)*.007f;return (target+(position-target)*distance,target);
    }
    static bool[] Shown(StadiumBlueprint plan,Vector3 camera){
        var shown=new bool[4];for(int i=0;i<4;i++)shown[i]=plan.SideVisible(i,camera);return shown;
    }
    static int Triangles(StadiumBlueprint plan,out int renderers){
        int count=0;renderers=0;
        for(int g=0;g<StadiumBlueprint.Groups;g++)foreach(StadiumSlot slot in Enum.GetValues(typeof(StadiumSlot))){var mesh=StadiumArchitecture.BuildMesh(plan,g,slot);if(mesh==null)continue;renderers++;count+=mesh.triangles.Length/3;UnityEngine.Object.DestroyImmediate(mesh);}
        return count;
    }
    // Every distinct venue design: legacy catalogue IDs (cup IDs resolve to their country's cup
    // standard), one league standard and one cup standard per live country, the neutral arenas.
    public static List<(string id,ClubStadiumProfile profile)> Venues(){
        var list=new List<(string,ClubStadiumProfile)>();var seen=new HashSet<string>();
        void Add(string id,ClubStadiumProfile p){if(seen.Add(p.Venue))list.Add((id,p));}
        foreach(var id in ClubStadiumProfiles.KnownClubIds)Add(id,ClubStadiumProfiles.Resolve(id));
        foreach(var c in ClubStadiumProfiles.Countries){Add(c+"-8",ClubStadiumProfiles.Resolve(c+"-8"));Add(c+"-C3",ClubStadiumProfiles.Resolve(c+"-C3"));Add("NEUTRAL-CUP-"+c,ClubStadiumProfiles.NeutralCup(c));}
        Add("NEUTRAL-EUROPE",ClubStadiumProfiles.NeutralEurope());
        return list;
    }
    static SupporterSetup Setup(bool neutral)=>new SupporterSetup{ClubIds=new[]{"GER-1","GER-5"},Primary=new[]{new Color(.77f,.22f,.26f),new Color(.11f,.19f,.27f)},Secondary=new[]{Color.white,Color.white},Patterns=new[]{2,4},HomeTeam=0,Neutral=neutral};

    // Pure checks (no scene, no bridge): every venue design in both qualities.
    public static void CheckPlans(Action<bool,string> Require,List<Venue> venues,List<Pair> pairs,bool sightLines=true){
        int sights=0,designs=0;var signatures=new HashSet<string>();var identities=new HashSet<int>();
        foreach(var (id,profile) in Venues()){
            designs++;var before=Shape(profile);
            var plan=StadiumArchitecture.Plan(profile,68,44,Home,Trim);var again=StadiumArchitecture.Plan(Same(profile),68,44,Home,Trim);
            Require(Shape(profile)==before,id+" plan leaves the resolved profile unchanged");
            bool same=plan.Pieces.Count==again.Pieces.Count;for(int i=0;same&&i<plan.Pieces.Count;i++)same=plan.Pieces[i].center==again.Pieces[i].center&&plan.Pieces[i].size==again.Pieces[i].size&&plan.Pieces[i].slot==again.Pieces[i].slot&&plan.Pieces[i].crowdRow==again.Pieces[i].crowdRow&&plan.Pieces[i].rotation==again.Pieces[i].rotation;
            Require(same,id+" plan is deterministic");
            Require(plan.Archetype==profile.Archetype&&plan.Venue==profile.Venue&&plan.Source==profile.Identity.Source,id+" keeps its archetype "+profile.Archetype+" and venue "+plan.Venue);
            // Nothing but the four thin corner flags stands inside the boards.
            int intruders=0;string intrusion="";foreach(var p in plan.Pieces){if(p.slot==StadiumSlot.Sky||p.slot==StadiumSlot.Ground)continue;var b=Of(p);bool flag=p.group==StadiumBlueprint.Surroundings&&b.size.y<1.6f&&b.size.x<.6f&&b.size.z<.6f;if(!flag&&b.min.y<4&&b.max.x>-34-2.9f&&b.min.x<34+2.9f&&b.max.z>-22-2.9f&&b.min.z<22+2.9f){intruders++;intrusion+=$" {p.group}/{p.slot} {p.center} size={p.size}";}}
            Require(intruders==0,id+" keeps the pitch, boards and goals clear below roof height"+intrusion);
            for(int s=0;s<4;s++)Require(plan.Fronts[s]>=(s<2?22+4.5f:34+5.3f),id+" stand "+s+" front stays behind the boards");
            // Five landscape cameras, near and far, across the pitch: the visible
            // stadium never sits between a camera and its target, nor encloses a camera.
            if(sightLines)foreach(var mode in new[]{"follow","wide","sideline","diagonal","goal"})foreach(float near in new[]{0f,60f,100f})foreach(float bx in new[]{-30f,-12f,0f,12f,30f})foreach(float bz in new[]{-15f,0f,15f}){
                var (cam,target)=Camera(mode,new Vector3(bx,0,bz),near);var shown=Shown(plan,cam);
                foreach(var p in plan.Pieces){if(p.slot==StadiumSlot.Sky||p.slot==StadiumSlot.Ground||p.slot==StadiumSlot.Water||p.group<4&&!shown[p.group])continue;
                    if(Blocks(p,cam,target+Vector3.up*.8f))throw new Exception($"Stadium architecture: {id} {p.group}/{p.slot} at {p.center} blocks {mode} near={near} ball=({bx},{bz})");
                    if(Of(p).Contains(cam))throw new Exception($"Stadium architecture: {id} camera {mode} inside {p.group}/{p.slot} at {p.center}");}
                sights++;
            }
            var reduced=StadiumArchitecture.Plan(Same(profile),68,44,Home,Trim,false);
            int StandRoofs(StadiumBlueprint b){int n=0;for(int g=0;g<4;g++)n+=b.Count(StadiumSlot.Roof,g);return n;}
            Require(reduced.Pieces.Count<plan.Pieces.Count&&reduced.Count(StadiumSlot.Crowd)==plan.Count(StadiumSlot.Crowd)&&StandRoofs(reduced)==StandRoofs(plan),id+" reduced quality drops details, keeps crowd and stand roofs");
            // Both qualities keep the silhouette identity: declared structure and stand heights.
            string Silhouette(StadiumBlueprint b){var s="";foreach(var f in b.StructuralFeatures())if(f.Group!="skyline")s+=f+";";return s;}
            Require(Silhouette(reduced)==Silhouette(plan),id+" reduced quality keeps the silhouette identity");
            // Supporters: two blocks on the ends, reserved before the crowd was laid out.
            bool neutral=profile.Identity.Supporters.Neutral;
            Require(plan.Blocks.Count==2&&plan.Blocks[0].Side!=plan.Blocks[1].Side&&plan.Blocks[0].Side>=2&&plan.Blocks[1].Side>=2,id+" reserves a home and a visitors' block in the two ends");
            Require(neutral?plan.Blocks[0].Side==2&&!plan.Blocks[1].Fenced&&plan.Blocks[0].LastRow-plan.Blocks[0].FirstRow==plan.Blocks[1].LastRow-plan.Blocks[1].FirstRow&&Mathf.Abs((plan.Blocks[0].To-plan.Blocks[0].From)-(plan.Blocks[1].To-plan.Blocks[1].From))<1e-3f
                :plan.Blocks[0].Side==(profile.Identity.Supporters.HomeEnd==3?3:2)&&plan.Blocks[1].Fenced,id+(neutral?" gives both clubs equal end blocks (home flag on x-)":" puts the home ultras in their end and fences the visitors"));
            int overlap=0;foreach(var block in plan.Blocks){var t=plan.Terraces[block.Side];var along=t.Facing*Vector3.right;
                foreach(var p in plan.Pieces){if(p.slot!=StadiumSlot.Crowd||p.group!=block.Side)continue;float x=Vector3.Dot(p.center,along),half=p.size.x/2;
                    if(x+half>block.From+.05f&&x-half<block.To-.05f&&p.center.y>t.Tread[block.FirstRow]&&p.center.y<t.Tread[block.LastRow]+1.2f)overlap++;}}
            Require(overlap==0,id+" leaves the supporter blocks free of painted crowd ("+overlap+" overlaps)");
            var sp=StadiumSupporters.Plan(plan,Setup(neutral),true);var spr=StadiumSupporters.Plan(reduced,Setup(neutral),false);
            Require(sp.Flags<=StadiumSupporters.MaxFlags&&sp.Banners<=StadiumSupporters.MaxBanners&&spr.Flags<=StadiumSupporters.MaxFlagsReduced&&spr.Banners<=StadiumSupporters.MaxBannersReduced&&sp.Flags>0&&spr.Flags>0&&sp.Banners>0&&sp.People>0&&spr.People==sp.People,
                id+" supporters within flag and banner budgets ("+sp.Flags+"/"+sp.Banners+" standard, "+spr.Flags+"/"+spr.Banners+" reduced), same crowd in both qualities");
            int tris=Triangles(plan,out int renderers),reducedTris=Triangles(reduced,out int reducedRenderers);
            // Draw calls: stadium slot meshes, two meshes per supporter block, four LED boards and the apron.
            int calls=renderers+sp.Blocks.Count*2+5,reducedCalls=reducedRenderers+spr.Blocks.Count*2+5;
            Require(tris+sp.Triangles<TriangleBudget&&reducedTris+spr.Triangles<ReducedTriangleBudget&&calls<=DrawCallBudget&&reducedCalls<=ReducedDrawCallBudget,
                id+" stays within the triangle and draw call budget ("+(tris+sp.Triangles)+"/"+calls+" standard, "+(reducedTris+spr.Triangles)+"/"+reducedCalls+" reduced)");
            // Club identity: accent panels only on camera-facing sides, kept in reduced quality.
            Require(plan.Identity>=0&&plan.Identity<StadiumArchitecture.IdentityPatterns.Length&&plan.Identity==again.Identity,id+" has a stable identity pattern "+StadiumArchitecture.IdentityPatterns[plan.Identity]);
            Require(plan.Count(StadiumSlot.Accent,1)==0&&plan.Count(StadiumSlot.Accent,StadiumBlueprint.Surroundings)==0&&plan.Count(StadiumSlot.Accent,0)>0,id+" shows its accent pattern facing the cameras, not on the hidden near stand");
            bool mosaic=profile.Identity.Supporters.Tifo==TifoStyle.Mosaic&&!neutral;
            Require(reduced.Count(StadiumSlot.Accent,0)>0&&(mosaic?reduced.Count(StadiumSlot.Accent)<plan.Count(StadiumSlot.Accent):reduced.Count(StadiumSlot.Accent)<=plan.Count(StadiumSlot.Accent)),id+" reduced quality keeps the wall pattern"+(mosaic?" and a shallower choreography":""));
            identities.Add(plan.Identity);
            foreach(var (L,W) in new[]{(105f,68f),(81.6f,52.8f)}){var large=StadiumArchitecture.Plan(Same(profile),L,W,Home,Trim);
                Require(large.Fronts[0]>=W/2+4.5f&&large.Fronts[2]>=L/2+5.3f&&large.Blocks.Count==2,id+" scales its stands and blocks with a "+L+" x "+W+" pitch");}
            // Colours never change the structure.
            Require(StadiumArchitecture.Plan(Same(profile),68,44,Color.blue,Color.yellow).StructuralFingerprint()==plan.StructuralFingerprint(),id+" structural fingerprint ignores colours");
            if(profile.Identity.Source!="standard"||profile.Venue==profile.ClubId)signatures.Add(plan.Signature());
            float tallest=0;for(int g=0;g<4;g++)tallest=Mathf.Max(tallest,plan.Top(g));
            venues.Add(new Venue{id=id,venue=plan.Venue,source=plan.Source,archetype=plan.Archetype,sizeClass=plan.SizeClass,signature=plan.Signature(),fingerprint=plan.StructuralFingerprint(),pieces=plan.Pieces.Count,reducedPieces=reduced.Pieces.Count,triangles=tris,reducedTriangles=reducedTris,renderers=calls,reducedRenderers=reducedCalls,blocks=plan.Blocks.Count,people=sp.People,flags=sp.Flags,banners=sp.Banners,reducedFlags=spr.Flags,reducedBanners=spr.Banners,supporterTriangles=sp.Triangles,reducedSupporterTriangles=spr.Triangles,tallest=tallest});
        }
        Require(identities.Count>=5,"club identity patterns differ across the venues ("+identities.Count+" patterns)");
        // Pages without a presentation: the Release 130 stadium of every catalogue ID (and the
        // garden ground for an unknown one), no supporter blocks, sight lines kept.
        var legacyIds=new List<string>(ClubStadiumProfiles.KnownClubIds){"XYZ-9"};
        foreach(var id in legacyIds){
            var profile=ClubStadiumProfiles.ResolveLegacy(id);var plan=StadiumArchitecture.Plan(profile,68,44,Home,Trim,true,false);var again=StadiumArchitecture.Plan(ClubStadiumProfiles.ResolveLegacy(id),68,44,Home,Trim,true,false);
            bool same=plan.Pieces.Count==again.Pieces.Count;for(int i=0;same&&i<plan.Pieces.Count;i++)same=plan.Pieces[i].center==again.Pieces[i].center&&plan.Pieces[i].size==again.Pieces[i].size&&plan.Pieces[i].slot==again.Pieces[i].slot;
            Require(same&&plan.Blocks.Count==0&&plan.Source=="legacy-derived"&&plan.Venue==id&&plan.Count(StadiumSlot.Haze)==0,id+" legacy page: deterministic Release 130 stadium without supporter blocks");
            if(!sightLines)continue;
            foreach(var mode in new[]{"follow","wide","sideline","diagonal","goal"})foreach(float near in new[]{0f,60f,100f})foreach(float bx in new[]{-30f,0f,30f})foreach(float bz in new[]{-15f,15f}){
                var (cam,target)=Camera(mode,new Vector3(bx,0,bz),near);var shown=Shown(plan,cam);
                foreach(var p in plan.Pieces){if(p.slot==StadiumSlot.Sky||p.slot==StadiumSlot.Ground||p.slot==StadiumSlot.Water||p.group<4&&!shown[p.group])continue;
                    if(Blocks(p,cam,target+Vector3.up*.8f)||Of(p).Contains(cam))throw new Exception($"Stadium architecture: legacy {id} {p.group}/{p.slot} blocks {mode} near={near} ball=({bx},{bz})");}
            }
        }
        if(sightLines)Require(true,"legacy pages keep every sight line clear ("+legacyIds.Count*5*3*6+" cameras)");
        if(sightLines)Require(sights==designs*5*3*15,"all camera sight lines checked ("+sights+" over "+designs+" venue designs)");
        Require(StadiumArchitecture.AccentOf(new Color(.8f,.1f,.1f),new Color(.78f,.12f,.1f))!=new Color(.78f,.12f,.1f)&&StadiumArchitecture.AccentOf(new Color(.8f,.1f,.1f),Color.white)==Color.white,"accent falls back to white or ink when the trim is too close to the home colour");
        int leagueGrounds=0;foreach(var v in venues)if(v.venue==v.id&&v.source!="standard")leagueGrounds++;
        Require(leagueGrounds==36&&signatures.Count>=36,"every league ground has its own structural signature ("+signatures.Count+")");
        Built(Require);
        Fingerprints(Require,pairs);
        // Mesh output: finite, consistent and with outward faces where tested.
        var sample=StadiumArchitecture.Plan(ClubStadiumProfiles.Resolve("GER-1"),68,44,Home,Trim);bool valid=true;
        for(int g=0;g<StadiumBlueprint.Groups;g++)foreach(StadiumSlot slot in Enum.GetValues(typeof(StadiumSlot))){var mesh=StadiumArchitecture.BuildMesh(sample,g,slot);if(mesh==null)continue;
            valid&=mesh.triangles.Length%3==0&&mesh.normals.Length==mesh.vertexCount&&mesh.uv.Length==mesh.vertexCount&&mesh.colors.Length==mesh.vertexCount&&!float.IsNaN(mesh.bounds.size.x);UnityEngine.Object.DestroyImmediate(mesh);}
        Require(valid,"combined meshes carry normals, metre UVs and vertex shading");
        {
            var box=new StadiumPiece{slot=StadiumSlot.Concrete,shape=StadiumShape.Box,center=Vector3.zero,size=Vector3.one,rotation=Quaternion.Euler(10,30,0),tint=Color.white};var p=new StadiumBlueprint();p.Pieces.Add(box);
            var mesh=StadiumArchitecture.BuildMesh(p,0,StadiumSlot.Concrete);var v=mesh.vertices;var n=mesh.normals;var t=mesh.triangles;bool outward=true;
            for(int i=0;i<t.Length;i+=3){var c=Vector3.Cross(v[t[i+1]]-v[t[i]],v[t[i+2]]-v[t[i]]);outward&=Vector3.Dot(c,n[t[i]])>0&&Vector3.Dot((v[t[i]]+v[t[i+1]]+v[t[i+2]])/3,n[t[i]])>0;}
            UnityEngine.Object.DestroyImmediate(mesh);Require(outward,"box faces wind outward for Unity front faces");
        }
    }
    static ClubStadiumProfile Same(ClubStadiumProfile p){
        if(p.Venue=="NEUTRAL-EUROPE")return ClubStadiumProfiles.NeutralEurope();if(p.Venue.StartsWith("NEUTRAL-CUP"))return ClubStadiumProfiles.NeutralCup(p.Identity.Country);
        return ClubStadiumProfiles.Resolve(p.ClubId);
    }
    // The authored identity is actually built (not only declared).
    static void Built(Action<bool,string> Require){
        StadiumBlueprint P(string id)=>StadiumArchitecture.Plan(ClubStadiumProfiles.Resolve(id),68,44,Home,Trim);
        int Shapes(StadiumBlueprint b,StadiumSlot slot,StadiumShape shape,int group){int n=0;foreach(var p in b.Pieces)if(p.slot==slot&&p.shape==shape&&p.group==group)n++;return n;}
        var g1=P("GER-1");var g2=P("GER-2");var g3=P("GER-3");var g5=P("GER-5");var g6=P("GER-6");
        Require(g1.Terraces[0].TierStarts.Length==2&&g1.Terraces[1].TierStarts.Length==1&&g1.Terraces[2].TierStarts.Length==1&&g1.Count(StadiumSlot.Lamp,0)>0&&g1.Count(StadiumSlot.Haze)>0,"GER-1: three-tier main stand, two-tier ends, roof light rails and the Alpine/TV-tower skyline");
        int curved=0;foreach(var p in g1.Pieces)if(p.slot==StadiumSlot.Concrete&&p.group<2&&Mathf.Abs(p.center.x)>36&&Mathf.Abs(p.center.z)>26)curved++;
        Require(curved>40,"GER-1: curved bowl corners close the ring ("+curved+" corner steps)");
        Require(g2.Terraces[3].Standing&&g2.Terraces[3].Rise>=.58f&&!g2.Roofs[3]&&g2.Count(StadiumSlot.Roof,0)>=7&&g2.Count(StadiumSlot.Water)>0,"GER-2: open steep kop on the right, barrel-vaulted far stand, river behind the end");
        Require(Shapes(g3,StadiumSlot.Roof,StadiumShape.Wedge,0)>=8&&Shapes(g3,StadiumSlot.Roof,StadiumShape.Wedge,3)>=4&&!g3.Roofs[2]&&g3.Terraces[2].Standing,"GER-3: saw-tooth roofs on the main stand and right end, open standing terrace on the left");
        int tall=0;foreach(var p in g5.Pieces)if(p.group<2&&p.slot==StadiumSlot.Brick&&p.size.y>g5.Top(p.group)*.8f&&Mathf.Abs(p.center.x)>36)tall++;
        Require(tall>=4&&g5.Terraces[0].Podium>=1.2f,"GER-5: four corner towers carry the roofs, raised brick-arcade main stand ("+tall+" towers)");
        Require(g6.Terraces[0].Half<g6.Fronts[2]*.8f&&!g6.Roofs[1]&&!g6.Roofs[3]&&g6.Roofs[2]&&g6.Count(StadiumSlot.Brick,StadiumBlueprint.Surroundings)>0,"GER-6: short main stand on the halfway line, one covered home terrace, houses around the ground");
        // Same country, comparable size: GER-2 and GER-3 differ in stand tops and roof silhouettes.
        float Diff(StadiumBlueprint a,StadiumBlueprint b){float d=0;for(int g=0;g<4;g++)d+=Mathf.Abs(a.Top(g)-b.Top(g));return d;}
        Require(Diff(g2,g3)>4,"GER-2 and GER-3 stand silhouettes differ by "+Diff(g2,g3).ToString("0.0")+" m summed over the four sides");
        var cup=StadiumArchitecture.Plan(ClubStadiumProfiles.Resolve("GER-C1"),68,44,Home,Trim);var cup2=StadiumArchitecture.Plan(ClubStadiumProfiles.Resolve("GER-C2"),68,44,Color.green,Color.black);
        Require(cup.Venue=="CUP-STANDARD-GER"&&cup.StructuralFingerprint()==cup2.StructuralFingerprint(),"German cup clubs share one cup standard ground structurally");
        var europe=StadiumArchitecture.Plan(ClubStadiumProfiles.NeutralEurope(),68,44,Home,Trim);
        Require(europe.Top(0)>=30&&europe.Blocks.Count==2&&!europe.Blocks[1].Fenced,"European final arena: the great arch over the far stand, two equal open ends");
    }
    // Structural fingerprint pairs of the authored prototypes (contracts.json reviewCriteria).
    static void Fingerprints(Action<bool,string> Require,List<Pair> pairs){
        var ids=ClubStadiumProfiles.AuthoredClubIds;var plans=new List<StadiumBlueprint>();foreach(var id in ids)plans.Add(StadiumArchitecture.Plan(ClubStadiumProfiles.Resolve(id),68,44,Home,Trim));
        int Rows(StadiumBlueprint b){int s=0;foreach(var r in b.Rows)s+=r;return s;}
        for(int a=0;a<plans.Count;a++)for(int b=a+1;b<plans.Count;b++){
            var fa=plans[a].StructuralFeatures();var fb=plans[b].StructuralFeatures();int d=StadiumFingerprint.Distance(fa,fb,out int sil);
            bool country=plans[a].Country==plans[b].Country;int ra=Rows(plans[a]),rb=Rows(plans[b]);bool similar=country&&Mathf.Abs(ra-rb)<=.15f*Mathf.Max(ra,rb);
            int need=similar?6:country?5:4,needSil=country?3:2;var differing=new List<string>();var map=new Dictionary<string,string>();foreach(var f in fb)map[f.Group]=f.Value;foreach(var f in fa)if(!map.TryGetValue(f.Group,out var v)||v!=f.Value)differing.Add(f.Group);
            pairs.Add(new Pair{a=plans[a].ClubId,b=plans[b].ClubId,groups=d,silhouette=sil,required=need,requiredSilhouette=needSil,differing=string.Join(",",differing)});
            Require(d>=need&&sil>=needSil,plans[a].ClubId+" vs "+plans[b].ClubId+": "+d+" structural groups differ ("+sil+" silhouette), required "+need+"/"+needSil);
        }
    }

    public static string Run(string repository,string outputFolder=null){
        var checks=new List<string>();var venues=new List<Venue>();var pairs=new List<Pair>();void Require(bool ok,string name){if(!ok)throw new Exception("Stadium architecture: "+name);checks.Add(name);}
        CheckPlans(Require,venues,pairs);
        BridgeWiring(repository,Require);
        var json=JsonUtility.ToJson(new Report{passed=checks.Count,note="Budgets are the contracts' engineering targets measured on generated meshes (triangles, renderers); delivered GPU frame rates are measured separately by Root. Legacy-derived and standard venues are reported, not individually authored.",checks=checks.ToArray(),venues=venues.ToArray(),pairs=pairs.ToArray()},true);
        var folder=Path.Combine(repository,outputFolder??"outputs/3d-quality/unity");Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,"stadium-architecture-tests.json"),json);
        return "passed="+checks.Count;
    }

    // The actual renderer resolves the stadium of the team flagged home, or the neutral venue of
    // the presentation, takes the clubs' colours and consumes the light look.
    static void BridgeWiring(string repository,Action<bool,string> Require){
        var flags=BindingFlags.NonPublic|BindingFlags.Instance;var scene=UnityEditor.SceneManagement.EditorSceneManager.NewPreviewScene();var created=new List<UnityEngine.Object>();
        var camera=UnityEngine.Camera.main;var cameraFar=camera!=null?camera.farClipPlane:0;
        bool log=Debug.unityLogger.logEnabled;var bridges=new List<ProbeBridge>();
        try{
            GameObject Make(string name,PrimitiveType? type=null){var go=type.HasValue?GameObject.CreatePrimitive(type.Value):new GameObject(name);go.name=name;UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(go,scene);created.Add(go);return go;}
            ProbeBridge Build(string home,string away,bool homeFirst,string quality,WorldPresentation display=null,string awayKit=null){
                var config=JsonUtility.FromJson<WorldConfig>(File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json")));
                config.teams[0].id=home;config.teams[1].id=away;config.teams[0].home=homeFirst;config.teams[1].home=!homeFirst;config.quality=quality;config.presentation=display;
                if(awayKit!=null)foreach(var p in config.players)if(p.team==1&&!p.keeper)p.kit.main=awayKit;
                var bridge=Make("D6 stadium wiring test").AddComponent<ProbeBridge>();bridges.Add(bridge);
                void Field(string name,object value)=>typeof(ProbeBridge).GetField(name,flags).SetValue(bridge,value);
                Field("worldView",new WorldViewState(config));var world=Make("D6 stadium test world").transform;Field("world",world);
                Field("ballView",Make("D6 ball",PrimitiveType.Sphere).transform);Field("ballShadow",Make("D6 ball shadow",PrimitiveType.Cylinder).transform);
                typeof(ProbeBridge).GetMethod("BuildStadium",flags).Invoke(bridge,null);return bridge;
            }
            WorldPresentation Display(string a,string b,string competition,string venue,string lighting="night"){
                string Kind(string id)=>ClubStadiumProfiles.IsCupId(id)?"cup":"league";
                return new WorldPresentation{schema="d6-presentation-1",competition=competition,venue=venue,lighting=lighting,lightBucket=7,venueCountry=a.Substring(0,3),round=venue=="neutral"?"F":"",clubs=new[]{new WorldPresentationClub{id=a,country=a.Substring(0,3),kind=Kind(a),primary="#c43743",secondary="#f3f5f2"},new WorldPresentationClub{id=b,country=b.Substring(0,3),kind=Kind(b),primary="#398b5b",secondary="#f1e5cc"}}};
            }
            // Edit-mode harness: Object.Destroy of primitive colliders only logs.
            Debug.unityLogger.logEnabled=false;
            // Pages without a presentation (a, b, r, legacy): Release 130 stadium, no supporters.
            var a=Build("ENG-2","ITA-1",true,"standard");var b=Build("ENG-2","ITA-1",false,"standard");var r=Build("ESP-3","GER-1",true,"reduced");
            var home=Build("ENG-2","ITA-1",true,"standard",Display("ENG-2","ITA-1","league","home"));var reducedHome=Build("GER-1","GER-5",true,"reduced",Display("GER-1","GER-5","league","home"));
            var cup=Build("GER-C1","GER-5",true,"standard",Display("GER-C1","GER-5","cup","home"));var europe=Build("GER-1","GER-5",false,"standard",Display("GER-1","GER-5","europe","neutral"));
            var clash=Build("GER-2","GER-3",true,"standard",Display("GER-2","GER-3","league","home","day"),"#f4f4f4");var legacy=Build("GER-2","GER-3",true,"standard",null,"#f4f4f4");
            Debug.unityLogger.logEnabled=log;
            Require(a.StadiumClub=="ENG-2"&&a.StadiumArchetype=="modern-ring"&&a.StadiumVenue=="ENG-2","bridge builds the home club's stadium (ENG-2 modern ring)");
            Require(b.StadiumClub=="ITA-1"&&b.StadiumArchetype=="industrial-shed","swapped home flag swaps the stadium (ITA-1 industrial shed)");
            Require(r.ReducedQuality&&r.StadiumPlan!=null&&!r.StadiumPlan.Detailed&&reducedHome.ReducedQuality&&reducedHome.Supporters!=null&&reducedHome.Supporters.Flags<=StadiumSupporters.MaxFlagsReduced,"reduced page quality builds the reduced stadium and supporter detail");
            Require(a.Supporters==null&&r.Supporters==null&&a.StadiumPlan.Blocks.Count==0&&a.StadiumVenue=="ENG-2"&&a.StadiumPlan.Source=="legacy-derived","a page without a presentation keeps the Release 130 stadium without supporter blocks");
            Require(home.StadiumVenue=="ENG-2"&&home.Supporters!=null&&home.Supporters.Blocks.Count==2&&home.StadiumPlan.Blocks.Count==2,"a presented home fixture adds both supporter blocks to the home club's ground");
            Require(cup.StadiumVenue=="CUP-STANDARD-GER"&&cup.StadiumClub=="GER-C1","a cup club's home tie is played in the German cup standard ground");
            Require(europe.StadiumVenue=="NEUTRAL-EUROPE"&&europe.Supporters.Blocks.Count==2&&europe.Supporters.Blocks[0].Block.Side==2&&europe.Supporters.Blocks[0].ClubId=="GER-5"&&europe.Supporters.Blocks[1].ClubId=="GER-1"
                &&europe.Supporters.Blocks[0].People==europe.Supporters.Blocks[1].People,"a European final is neutral: the team flagged home (GER-5) on x-, equal blocks");
            // Colours: presentation clubs, never the clash kit; legacy pages keep the kit colours.
            ColorUtility.TryParseHtmlString("#398b5b",out var green);var awayClash=clash.Supporters.Blocks.Find(x=>x.Block.Role==1);
            Require(awayClash.ClubId=="GER-3"&&awayClash.Primary==green&&legacy.Supporters==null,"supporter colours come from presentation.clubs, not from a clash kit; a page without a presentation has no supporter blocks");
            Require(clash.Supporters.Blocks.Find(x=>x.Block.Role==0).Block.Side==3&&awayClash.Block.Side==2,"GER-2 home ultras on their x+ kop, visitors in the opposite end");
            var meshes=(List<Mesh>)typeof(ProbeBridge).GetField("stadiumMeshes",flags).GetValue(a);var textures=(List<Texture2D>)typeof(ProbeBridge).GetField("stadiumTextures",flags).GetValue(a);
            Require(meshes.Count>10&&meshes.Count<=DrawCallBudget&&textures.Count>=10,"meshes and textures are tracked for disposal ("+meshes.Count+" meshes, "+textures.Count+" textures)");
            var sides=(Transform[])typeof(ProbeBridge).GetField("standSides",flags).GetValue(a);Require(Array.TrueForAll(sides,s=>s!=null&&s.childCount>0),"all four stand sides own their renderers");
            int supporterRenderers=0;foreach(var s in (Transform[])typeof(ProbeBridge).GetField("standSides",flags).GetValue(home))foreach(Transform child in s)if(child.name.StartsWith("Supporters"))supporterRenderers++;
            Require(supporterRenderers==home.Supporters.Blocks.Count*2,"supporter meshes hang under their stand side ("+supporterRenderers+")");
            var update=typeof(ProbeBridge).GetMethod("UpdateStadiumVisibility",flags);
            update.Invoke(a,new object[]{new Vector3(0,21,40)});Require(!a.StandShown(1)&&a.StandShown(0)&&a.StandShown(2)&&a.StandShown(3),"TV camera hides only the near stand");
            update.Invoke(a,new object[]{new Vector3(-55,19,9)});Require(!a.StandShown(2)&&a.StandShown(1),"behind-goal camera hides the end stand it stands in");
            var crowd=(Material)typeof(ProbeBridge).GetField("crowdMaterial",flags).GetValue(a);var updateCrowd=typeof(ProbeBridge).GetMethod("UpdateCrowd",flags);
            var frame=new WorldFrame{celebrating=true,celebrationTime=.11};updateCrowd.Invoke(a,new object[]{frame});var first=crowd.GetTextureOffset("_BaseMap");updateCrowd.Invoke(a,new object[]{frame});
            Require(first.y>0&&crowd.GetTextureOffset("_BaseMap")==first,"crowd lift follows the received celebration time only");
            frame.celebrating=false;updateCrowd.Invoke(a,new object[]{frame});Require(crowd.GetTextureOffset("_BaseMap")==Vector2.zero,"crowd rests outside a booked goal");
            // The light look is consumed as received (night values today; the lighting lane fills day):
            // sky gradient, floodlight heads, distant haze, crowd and supporter brightness.
            foreach(var bridge in new[]{home,clash}){var look=bridge.LightLook;var world=(Transform)typeof(ProbeBridge).GetField("world",flags).GetValue(bridge);
                Material Named(string name){foreach(var rr in world.GetComponentsInChildren<MeshRenderer>(true))if(rr.name==name)return rr.sharedMaterial;return null;}
                var lamp=Named("Lamp");var haze=bridge.StadiumPlan.Count(StadiumSlot.Haze)>0?Named("Haze"):null;var figures=Named("Supporters home figures");var cloth=Named("Supporters home flags");var crowdOf=(Material)typeof(ProbeBridge).GetField("crowdMaterial",flags).GetValue(bridge);
                bool Close(Color x,Color y)=>Mathf.Abs(x.r-y.r)<1e-4f&&Mathf.Abs(x.g-y.g)<1e-4f&&Mathf.Abs(x.b-y.b)<1e-4f;
                Require(bridge.StadiumLook.light==look.light&&bridge.StadiumLook.lampEmission==look.lampEmission&&Close(ProbeBridge.SkyTexel(look,1),look.skyTop)&&Close(ProbeBridge.SkyTexel(look,.58f),look.skyHorizon)
                    &&lamp!=null&&Close(lamp.GetColor("_Emission"),new Color(1.6f,1.5f,1.3f).linear*Mathf.Max(0,look.lampEmission))&&(haze==null||Close(haze.GetColor("_BaseColor"),Color.Lerp(look.skyHorizon,look.skyGround,.45f).linear))
                    &&Close(crowdOf.GetColor("_BaseColor"),Color.white*Mathf.Max(0,look.crowdLight))&&figures!=null&&Mathf.Abs(figures.GetFloat("_D6Light")-look.crowdLight)<1e-5f&&cloth!=null&&Mathf.Abs(cloth.GetFloat("_D6Light")-look.bannerLight)<1e-5f,
                    "stadium sky, floodlight heads, haze, crowd and supporters follow the received light look ("+look.light+")");}
            // A new fixture releases the previous stadium and supporters.
            typeof(ProbeBridge).GetMethod("ClearStadium",flags).Invoke(a,null);Require(a.Supporters==null&&a.StadiumPlan==null&&((List<Mesh>)typeof(ProbeBridge).GetField("stadiumMeshes",flags).GetValue(a)).Count==0,"clearing the stadium releases its meshes and supporters");
            // Restore in reverse: each bridge saved the lighting it found.
            for(int i=bridges.Count-1;i>=0;i--){var bridge=bridges[i];foreach(var m in (List<Mesh>)typeof(ProbeBridge).GetField("stadiumMeshes",flags).GetValue(bridge))UnityEngine.Object.DestroyImmediate(m);foreach(var t in (List<Texture2D>)typeof(ProbeBridge).GetField("stadiumTextures",flags).GetValue(bridge))UnityEngine.Object.DestroyImmediate(t);foreach(var m in (List<Material>)typeof(ProbeBridge).GetField("materials",flags).GetValue(bridge))UnityEngine.Object.DestroyImmediate(m);
                typeof(ProbeBridge).GetMethod("RestoreProbeLighting",flags).Invoke(bridge,null);}
        }finally{
            Debug.unityLogger.logEnabled=log;foreach(var o in created)if(o!=null)UnityEngine.Object.DestroyImmediate(o);UnityEditor.SceneManagement.EditorSceneManager.ClosePreviewScene(scene);if(camera!=null)camera.farClipPlane=cameraFar;
        }
    }
}
#endif

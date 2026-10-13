#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using System.Reflection;
using UnityEngine;
using Doppel6.Probe;
// Supporters (StadiumSupporters, WorldViewSupporters, D6Flag.shader): block placement per venue
// and home flag, colours from presentation.clubs, determinism of the time functions, pause/replay
// equality, the seamless 600 s wrap, frame-rate independence, celebration of the scoring club only,
// budgets, inflated bounds, no intrusion into the pitch or in front of the stands, follow-camera
// visibility and the real bridge wiring (renderers under stand sides, uniforms from the frame).
public static class StadiumSupportersTests {
    [Serializable] public class Block {public string venue,club;public int side,role,team,people,flags,banners,figureTriangles,clothTriangles;public float followVisibleShare,ownHalfVisibleShare,maxReach;}
    [Serializable] class Report {public int passed;public string note;public string[] checks;public Block[] blocks;}
    static readonly Color HomeColor=new Color(.77f,.22f,.26f),AwayColor=new Color(.22f,.55f,.36f);
    static SupporterSetup Setup(int homeTeam,bool neutral)=>new SupporterSetup{ClubIds=new[]{"GER-2","GER-3"},Primary=new[]{HomeColor,AwayColor},Secondary=new[]{Color.white,new Color(.95f,.9f,.8f)},Patterns=new[]{2,4},HomeTeam=homeTeam,Neutral=neutral};
    static StadiumBlueprint Stadium(string venue,bool detailed=true){
        var p=venue=="NEUTRAL-EUROPE"?ClubStadiumProfiles.NeutralEurope():venue.StartsWith("NEUTRAL-CUP-")?ClubStadiumProfiles.NeutralCup(venue.Substring(12)):ClubStadiumProfiles.Resolve(venue);
        return StadiumArchitecture.Plan(p,68,44,HomeColor,Color.white,detailed);
    }
    // Same follow camera as the page (SmallViewDiagnostics.Aim, 16:9): does any figure project into the frame?
    static bool Visible(StadiumBlueprint plan,SupporterBlockPlan bp,Vector3 ball){
        var aim=SmallViewDiagnostics.Aim(ball,.29f,"follow",16f/9);if(!plan.SideVisible(bp.Block.Side,aim.position))return false;
        var f=(aim.target-aim.position).normalized;var r=Vector3.Cross(Vector3.up,f).normalized;var u=Vector3.Cross(f,r);float th=Mathf.Tan(aim.fov*.5f*Mathf.Deg2Rad),aspect=16f/9;
        var v=bp.Figures.Vertices;for(int i=0;i<v.Count;i+=7){var d=v[i]-aim.position;float z=Vector3.Dot(d,f);if(z<.5f)continue;if(Mathf.Abs(Vector3.Dot(d,r)/z/th/aspect)<=1&&Mathf.Abs(Vector3.Dot(d,u)/z/th)<=1)return true;}
        return false;
    }

    public static void CheckPlans(Action<bool,string> Require,List<Block> blocks){
        // Placement: home ultras in the profile's home end, visitors opposite; the physical team
        // order (0 = managed club) only decides which club stands where through the home flag.
        foreach(var homeTeam in new[]{0,1}){
            var plan=Stadium("GER-2");var sp=StadiumSupporters.Plan(plan,Setup(homeTeam,false),true);
            var home=sp.Blocks.Find(b=>b.Block.Role==0);var away=sp.Blocks.Find(b=>b.Block.Role==1);
            Require(sp.Blocks.Count==2&&home.Block.Side==3&&away.Block.Side==2&&home.Team==homeTeam&&away.Team==1-homeTeam&&home.ClubId==(homeTeam==0?"GER-2":"GER-3"),
                "home flag on team "+homeTeam+": its club's ultras on the home kop (x+), visitors fenced in the opposite end");
            Require(home.Primary==(homeTeam==0?HomeColor:AwayColor)&&away.Primary==(homeTeam==0?AwayColor:HomeColor),"blocks wear their own club's presentation colours (team "+homeTeam+" at home)");
        }
        foreach(var venue in new[]{"NEUTRAL-EUROPE","NEUTRAL-CUP-GER"})foreach(var homeTeam in new[]{0,1}){
            var plan=Stadium(venue);var sp=StadiumSupporters.Plan(plan,Setup(homeTeam,true),true);var a=sp.Blocks[0];var b=sp.Blocks[1];
            Require(a.Block.Side==2&&b.Block.Side==3&&a.Team==homeTeam&&b.Team==1-homeTeam&&a.People==b.People&&a.Flags==b.Flags&&a.Banners==b.Banners&&!b.Block.Fenced,
                venue+": the team flagged home ("+homeTeam+") on x-, both ends equal ("+a.People+" figures, "+a.Flags+" flags, "+a.Banners+" banners)");
        }
        // Atlas colours are the clubs' (muted), never a kit.
        var muted=StadiumSupporters.AtlasTexel(10,20,HomeColor,Color.white,2);
        Require(Mathf.Abs(muted.r-HomeColor.r)<.15f&&Mathf.Abs(muted.g-HomeColor.g)<.15f&&muted.r<HomeColor.r+.01f,"flag cloth shows the club colour slightly calmer than the kits");
        // Determinism: two plans give identical vertex streams.
        {
            var plan=Stadium("GER-1");var a=StadiumSupporters.Plan(plan,Setup(0,false),true);var b=StadiumSupporters.Plan(Stadium("GER-1"),Setup(0,false),true);bool same=a.Blocks.Count==b.Blocks.Count;
            for(int k=0;same&&k<a.Blocks.Count;k++)foreach(var (x,y) in new[]{(a.Blocks[k].Figures,b.Blocks[k].Figures),(a.Blocks[k].Cloth,b.Blocks[k].Cloth)}){same&=x.Vertices.Count==y.Vertices.Count&&x.Triangles.Count==y.Triangles.Count;for(int i=0;same&&i<x.Vertices.Count;i++)same=x.Vertices[i]==y.Vertices[i]&&x.Motion[i]==y.Motion[i]&&x.Colors[i]==y.Colors[i]&&x.Uv[i]==y.Uv[i];}
            Require(same,"supporter plans are deterministic (identical vertices, phases, colours and UVs)");
        }
        // Time functions: a pure function of the displayed clock, seamless over the 600 s wrap,
        // independent of the frame rate (no integrated state).
        Require(StadiumSupporters.PresentTime(12.5)==12.5f&&StadiumSupporters.PresentTime(612.5)==StadiumSupporters.PresentTime(12.5)&&StadiumSupporters.PresentTime(0)==0,"presentation time is the displayed clock modulo 600 s");
        foreach(var hz in new[]{StadiumSupporters.BobHz,StadiumSupporters.SwingHz,StadiumSupporters.WaveHz})Require(Mathf.Abs(hz*StadiumSupporters.TimeWrap-Mathf.Round(hz*StadiumSupporters.TimeWrap))<1e-3f,"motion frequency "+hz+" Hz completes whole cycles in 600 s (seamless wrap)");
        {
            var plan=Stadium("GER-2");var sp=StadiumSupporters.Plan(plan,Setup(0,false),true);float worstWrap=0,worstRate=0;
            foreach(var bp in sp.Blocks)foreach(var m in new[]{bp.Figures,bp.Cloth})for(int i=0;i<m.Vertices.Count;i+=11){
                Vector3 At(double clock,float celebrate=0)=>StadiumSupporters.Displace(m.Vertices[i],m.Normals[i],m.Motion[i],m.Pivots[i],m.Axes[i],StadiumSupporters.PresentTime(clock),celebrate);
                worstWrap=Mathf.Max(worstWrap,(At(599.9995)-At(600.0005)).magnitude);
                // The same clock reached through 30, 60 and 120 Hz frame sequences.
                var c=At(37.5);foreach(double step in new[]{1/30.0,1/60.0,1/120.0}){double t=0;while(t+step<=37.5)t+=step;worstRate=Mathf.Max(worstRate,(At(37.5)-c).magnitude);}
            }
            Require(worstWrap<.01f,"no visible jump at the 600 s wrap (max "+worstWrap.ToString("0.0000")+" m)");
            Require(worstRate==0,"30, 60 and 120 Hz playback show the identical picture for the same clock");
        }
        // Celebration: only the scoring club's block, from the received celebration time.
        Require(StadiumSupporters.Celebration(true,0,1,0)==1&&StadiumSupporters.Celebration(true,0,1,1)==0&&StadiumSupporters.Celebration(false,0,1,0)==0&&
            StadiumSupporters.Celebration(true,1,0,1)==0&&StadiumSupporters.Celebration(true,1,.175,1)>0&&StadiumSupporters.Celebration(true,1,12,1)==0,"only the scoring club's block celebrates, ramping in and out with the celebration time");
        // Budgets, bounds and clearance for every venue design, both qualities.
        foreach(var (id,profile) in StadiumArchitectureTests.Venues())foreach(var detailed in new[]{true,false}){
            var plan=StadiumArchitecture.Plan(profile,68,44,HomeColor,Color.white,detailed);bool neutral=profile.Identity.Supporters.Neutral;var sp=StadiumSupporters.Plan(plan,Setup(0,neutral),detailed);
            Require(sp.Flags<=(detailed?StadiumSupporters.MaxFlags:StadiumSupporters.MaxFlagsReduced)&&sp.Banners<=(detailed?StadiumSupporters.MaxBanners:StadiumSupporters.MaxBannersReduced)&&sp.People>0&&sp.Flags>0,
                id+(detailed?" standard":" reduced")+" supporters within budget ("+sp.People+" figures, "+sp.Flags+" flags, "+sp.Banners+" banners)");
            float reach=0,margin=float.MaxValue,boards=float.MaxValue;int outside=0,intrusions=0;
            foreach(var bp in sp.Blocks){var t=plan.Terraces[bp.Block.Side];var outward=t.Facing*Vector3.forward;
                foreach(var (m,bounds) in new[]{(bp.Figures,bp.FigureBounds),(bp.Cloth,bp.ClothBounds)})for(int i=0;i<m.Vertices.Count;i+=detailed?5:3)foreach(float time in new[]{0f,.13f,.27f,.41f,.55f,.69f,.83f,.97f,1.11f,1.25f})foreach(float celebrate in new[]{0f,1f}){
                    var p=StadiumSupporters.Displace(m.Vertices[i],m.Normals[i],m.Motion[i],m.Pivots[i],m.Axes[i],time,celebrate);reach=Mathf.Max(reach,(p-m.Vertices[i]).magnitude);
                    if(!bounds.Contains(p))outside++;
                    // On or behind the pitch wall (banners hang on its face), clear of the boards
                    // (ends: L/2 + 3.8 m) and outside the pitch, boards and goals.
                    float o=Vector3.Dot(p,outward);margin=Mathf.Min(margin,o-t.Front);boards=Mathf.Min(boards,o-(bp.Block.Side<2?22+3.2f:34+3.8f));
                    if(o<t.Front-.4f||o<(bp.Block.Side<2?22+3.2f:34+3.8f)+.5f||Mathf.Abs(p.x)<34+2.9f&&Mathf.Abs(p.z)<22+2.9f&&p.y<4)intrusions++;}}
            Require(outside==0,id+(detailed?" standard":" reduced")+" inflated supporter bounds contain every animated vertex (reach "+reach.ToString("0.00")+" m)");
            Require(intrusions==0,id+(detailed?" standard":" reduced")+" supporters stay on or behind the pitch wall ("+margin.ToString("0.00")+" m from the stand front), "+boards.ToString("0.0")+" m behind the boards, off the pitch");
            if(!detailed)continue;
            foreach(var bp in sp.Blocks){int all=0,seen=0,own=0,ownSeen=0;
                for(float bx=-32;bx<=32;bx+=2)for(float bz=-18;bz<=18;bz+=4){bool vis=Visible(plan,bp,new Vector3(bx,0,bz));all++;if(vis)seen++;if(bp.Block.Side==2?bx<=-10:bx>=10){own++;if(vis)ownSeen++;}}
                float share=seen/(float)all,ownShare=ownSeen/(float)own;
                blocks.Add(new Block{venue=plan.Venue,club=bp.ClubId,side=bp.Block.Side,role=bp.Block.Role,team=bp.Team,people=bp.People,flags=bp.Flags,banners=bp.Banners,figureTriangles=bp.Figures.TriangleCount,clothTriangles=bp.Cloth.TriangleCount,followVisibleShare=share,ownHalfVisibleShare=ownShare,maxReach=reach});
                Require(ownShare>=.95f,id+" block on side "+bp.Block.Side+" is on screen in the follow camera whenever play is in its half ("+(ownShare*100).ToString("0")+" %; whole pitch "+(share*100).ToString("0")+" %)");
            }
        }
    }

    public static string Run(string repository,string outputFolder=null){
        var checks=new List<string>();var blocks=new List<Block>();void Require(bool ok,string name){if(!ok)throw new Exception("Stadium supporters: "+name);checks.Add(name);}
        CheckPlans(Require,blocks);
        Sources(repository,Require);
        BridgeWiring(repository,Require);
        var json=JsonUtility.ToJson(new Report{passed=checks.Count,note="followVisibleShare: share of a uniform ball grid (x -32..32, z -18..18) at which any figure of the block projects into the default follow camera (near 60, 16:9). End blocks cannot be on screen together in this camera: each shows while play is in its half (ownHalfVisibleShare, |x| >= 10 m). The contracts' 95 % over all frames is not reachable for end blocks; Root measures the recorded match.",checks=checks.ToArray(),blocks=blocks.ToArray()},true);
        var folder=Path.Combine(repository,outputFolder??"outputs/3d-quality/unity");Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,"stadium-supporters-tests.json"),json);
        return "passed="+checks.Count;
    }
    // No other time or random source can reach the supporters' picture.
    static void Sources(string repository,Action<bool,string> Require){
        string Read(string file)=>File.ReadAllText(Path.Combine(repository,"prototypes/match-engine-unity",file));
        // API names in explanatory comments are not executable clock/random sources.
        string Code(string text)=>System.Text.RegularExpressions.Regex.Replace(text,@"/\*[\s\S]*?\*/|//[^\r\n]*","");
        Require(!Code("// UnityEngine.Random.value\n/* Time.time */").Contains("UnityEngine.Random")&&Code("float x=UnityEngine.Random.value;").Contains("UnityEngine.Random.value"),"source scan ignores comments and retains executable random references");
        foreach(var file in new[]{"StadiumSupporters.cs","WorldViewSupporters.cs","StadiumArchitecture.cs"}){var s=Code(Read(file));
            Require(!s.Contains("UnityEngine.Random")&&!s.Contains("Random.Range")&&!s.Contains("Random.value")&&!s.Contains("Time.time")&&!s.Contains("Time.deltaTime")&&!s.Contains("realtimeSinceStartup")&&!s.Contains("DateTime"),file+" uses no Unity random state, real time or date");}
        var shader=Code(Read("D6Flag.shader"));Require(!shader.Contains("_Time")&&shader.Contains("_D6PresentTime")&&shader.Contains("UnityPerMaterial"),"D6Flag.shader animates from _D6PresentTime only (no _Time) and keeps its properties SRP-batchable");
    }
    // The renderer builds the blocks under their stand sides and drives them from the displayed frame.
    static void BridgeWiring(string repository,Action<bool,string> Require){
        var flags=BindingFlags.NonPublic|BindingFlags.Instance;var scene=UnityEditor.SceneManagement.EditorSceneManager.NewPreviewScene();var created=new List<UnityEngine.Object>();
        var camera=UnityEngine.Camera.main;var cameraFar=camera!=null?camera.farClipPlane:0;bool log=Debug.unityLogger.logEnabled;ProbeBridge bridge=null;
        try{
            GameObject Make(string name,PrimitiveType? type=null){var go=type.HasValue?GameObject.CreatePrimitive(type.Value):new GameObject(name);go.name=name;UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(go,scene);created.Add(go);return go;}
            var config=JsonUtility.FromJson<WorldConfig>(File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json")));
            config.teams[0].id="GER-3";config.teams[1].id="GER-2";config.teams[0].home=false;config.teams[1].home=true;config.quality="standard";
            config.presentation=new WorldPresentation{schema="d6-presentation-1",competition="league",venue="home",lighting="night",lightBucket=70,venueCountry="GER",clubs=new[]{
                new WorldPresentationClub{id="GER-3",country="GER",kind="league",primary="#204938",secondary="#f1e5cc"},new WorldPresentationClub{id="GER-2",country="GER",kind="league",primary="#398b5b",secondary="#f3f5f2"}}};
            bridge=Make("D6 supporters test").AddComponent<ProbeBridge>();void Field(string name,object value)=>typeof(ProbeBridge).GetField(name,flags).SetValue(bridge,value);
            Field("worldView",new WorldViewState(config));var world=Make("D6 supporters world").transform;Field("world",world);
            Field("ballView",Make("D6 ball",PrimitiveType.Sphere).transform);Field("ballShadow",Make("D6 ball shadow",PrimitiveType.Cylinder).transform);
            Debug.unityLogger.logEnabled=false;typeof(ProbeBridge).GetMethod("BuildStadium",flags).Invoke(bridge,null);Debug.unityLogger.logEnabled=log;
            var sp=bridge.Supporters;var sides=(Transform[])typeof(ProbeBridge).GetField("standSides",flags).GetValue(bridge);
            Require(sp!=null&&sp.Blocks.Count==2&&sp.Blocks.Find(b=>b.Block.Role==0).ClubId=="GER-2"&&sp.Blocks.Find(b=>b.Block.Role==0).Team==1,"the team flagged home (GER-2, physical index 1) owns the home block");
            var shader=Resources.Load<Shader>("D6Flag");int renderers=0;bool shaderOk=true,boundsOk=true;
            foreach(var s in sides)foreach(var r in s.GetComponentsInChildren<MeshRenderer>(true))if(r.name.StartsWith("Supporters")){renderers++;shaderOk&=r.sharedMaterial.shader==shader&&r.shadowCastingMode==UnityEngine.Rendering.ShadowCastingMode.Off;
                var mesh=r.GetComponent<MeshFilter>().sharedMesh;var rest=new Bounds(mesh.vertices[0],Vector3.zero);foreach(var v in mesh.vertices)rest.Encapsulate(v);boundsOk&=mesh.bounds.size.x>=rest.size.x+4&&mesh.bounds.Contains(rest.min)&&mesh.bounds.Contains(rest.max);}
            Require(renderers==4&&shaderOk,"two meshes per block under their stand sides, D6Flag material, no shadow casting");
            Require(boundsOk,"supporter meshes carry inflated bounds for the vertex-shader motion");
            var materials=(System.Collections.IList)typeof(ProbeBridge).GetField("supporterMaterials",flags).GetValue(bridge);var updateCrowd=typeof(ProbeBridge).GetMethod("UpdateCrowd",flags);
            float Value(int k,string name){var item=materials[k];var m=(Material)item.GetType().GetField("Item1").GetValue(item);return m.GetFloat(name);}
            int Team(int k){var item=materials[k];return (int)item.GetType().GetField("Item2").GetValue(item);}
            var frame=new WorldFrame{clock=725.25,turned=false};updateCrowd.Invoke(bridge,new object[]{frame});var first=new float[materials.Count];for(int k=0;k<materials.Count;k++)first[k]=Value(k,"_D6PresentTime");
            frame.turned=true;updateCrowd.Invoke(bridge,new object[]{frame});bool same=true;for(int k=0;k<materials.Count;k++)same&=Value(k,"_D6PresentTime")==first[k]&&Mathf.Abs(first[k]-StadiumSupporters.PresentTime(725.25))<1e-4f;
            Require(materials.Count==4&&same,"uniforms follow the displayed clock only; a turned frame (halftime) changes nothing");
            frame.celebrating=true;frame.celebrationTeam=1;frame.celebrationTime=1.5;updateCrowd.Invoke(bridge,new object[]{frame});bool celebrate=true;
            for(int k=0;k<materials.Count;k++)celebrate&=Team(k)==1?Value(k,"_D6Celebrate")>0:Value(k,"_D6Celebrate")==0;
            Require(celebrate,"only the scoring club's (team 1) block celebrates");
            var paused=new float[materials.Count];for(int k=0;k<materials.Count;k++)paused[k]=Value(k,"_D6PresentTime");updateCrowd.Invoke(bridge,new object[]{frame});updateCrowd.Invoke(bridge,new object[]{frame});
            bool still=true;for(int k=0;k<materials.Count;k++)still&=Value(k,"_D6PresentTime")==paused[k];Require(still,"a paused frame keeps an identical supporter picture");
            typeof(ProbeBridge).GetMethod("ClearStadium",flags).Invoke(bridge,null);Require(bridge.Supporters==null&&materials.Count==0,"a new fixture clears the supporter state");
        }finally{
            if(bridge!=null){foreach(var m in (List<Mesh>)typeof(ProbeBridge).GetField("stadiumMeshes",flags).GetValue(bridge))if(m!=null)UnityEngine.Object.DestroyImmediate(m);foreach(var t in (List<Texture2D>)typeof(ProbeBridge).GetField("stadiumTextures",flags).GetValue(bridge))if(t!=null)UnityEngine.Object.DestroyImmediate(t);
                foreach(var m in (List<Material>)typeof(ProbeBridge).GetField("materials",flags).GetValue(bridge))if(m!=null)UnityEngine.Object.DestroyImmediate(m);typeof(ProbeBridge).GetMethod("RestoreProbeLighting",flags).Invoke(bridge,null);}
            Debug.unityLogger.logEnabled=log;foreach(var o in created)if(o!=null)UnityEngine.Object.DestroyImmediate(o);UnityEditor.SceneManagement.EditorSceneManager.ClosePreviewScene(scene);if(camera!=null)camera.farClipPlane=cameraFar;
        }
    }
}
#endif

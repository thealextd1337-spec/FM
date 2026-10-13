#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using System.Reflection;
using UnityEngine;
using Doppel6.Probe;
// Stadium prototype gallery through the actual saved scene and ProbeBridge.WorldCommand path
// (Root runs it; needs a graphics device). Every fixture is a received WorldConfig with a
// WorldPresentation (competition, venue, lighting, the clubs' own colours): the large GER-1, the
// medium GER-5, the small GER-6, the comparable pair GER-2/GER-3, a GER-C1 cup tie in the German
// cup standard, a European final in the neutral arena (team flagged home on x-), a clash-kit
// fixture (supporters keep the club colours) and a legacy page without presentation. Day and
// night are requested through presentation.lighting; the light look actually applied by the
// lighting lane is recorded per image (without that lane every look is night). Cameras: the
// page's broadcast (follow, SmallViewDiagnostics.Aim at the centre and toward the home block)
// and behind-goal cameras, standard and reduced. A flag-phase strip renders the same picture at
// four received clocks, a celebration frame lifts only the scoring block, and a paused clock is
// rendered twice and compared pixel by pixel. Editor images, not WebGL or device evidence.
public static class StadiumGalleryDiagnostics {
    public sealed class Fixture {public string name,home,away,competition="league",venue="home",homeColor,homeTrim,awayColor,awayTrim,awayKit;public bool homeFirst=true,presented=true;}
    // Catalogue colours (world-expansion-catalog-v161.js palettes; v61ClubColors on the page).
    static readonly Dictionary<string,(string a,string b)> Palette=new Dictionary<string,(string,string)>{{"GER-1",("#c43743","#f3f5f2")},{"GER-2",("#398b5b","#f3f5f2")},{"GER-3",("#204938","#f1e5cc")},{"GER-4",("#dc9a32","#315b42")},{"GER-5",("#1c3045","#f3f5f2")},{"GER-6",("#4ba68b","#bd904a")},{"GER-C1",("#74468d","#c7d0d0")}};
    public static readonly Fixture[] Fixtures={
        new Fixture{name="ger1-large",home="GER-1",away="GER-5"},new Fixture{name="ger5-medium",home="GER-5",away="GER-1"},new Fixture{name="ger6-small",home="GER-6",away="GER-3"},
        new Fixture{name="ger2-pair",home="GER-2",away="GER-3"},new Fixture{name="ger3-pair",home="GER-3",away="GER-2"},
        new Fixture{name="gerc1-cup",home="GER-C1",away="GER-5",competition="cup"},
        // The managed club (physical team 0, GER-1) is flagged away: GER-5 takes the x- end.
        new Fixture{name="europe-final",home="GER-1",away="GER-5",competition="europe",venue="neutral",homeFirst=false},
        new Fixture{name="clash-kit",home="GER-2",away="GER-3",awayKit="#f4f4f4"},new Fixture{name="legacy-page",home="GER-2",away="GER-3",presented=false}};
    [Serializable] public class Block {public string club,role;public int side;public float screenShare;}
    [Serializable] public class Shot {public string file,fixture,venue,venueSource,stadiumClub,home,away,competition,venueKind,requestedLight,appliedLight,quality,camera;public float lampEmission,windowLit,crowdLight,bannerLight;public double clock;public bool celebrating;public Block[] blocks;}
    [Serializable] class Report {public string label,sourceId,unity,device,note;public Shot[] shots;public string[] checks;}
    static readonly Vector3[] Layout={new Vector3(-31.2f,0,.6f),new Vector3(-14,0,-8),new Vector3(-12,0,9),new Vector3(-3,0,-2),new Vector3(4,0,12),new Vector3(8,0,-10),
        new Vector3(31.2f,0,-1),new Vector3(-6,0,3.5f),new Vector3(1.5f,0,-5.5f),new Vector3(10,0,3),new Vector3(16,0,-12),new Vector3(20,0,8)};

    // only: optional fixture-name filter (substring); label: output file prefix.
    public static string Run(string repository,string outputFolder,string label=null,string only=null){
        label=label??"prototype";
        var bridge=UnityEngine.Object.FindFirstObjectByType<ProbeBridge>()??throw new InvalidOperationException("ProbeBridge is missing in the open scene");
        var flags=BindingFlags.NonPublic|BindingFlags.Instance;var raw=File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json"));
        var folder=Path.Combine(repository,outputFolder??"outputs/lowpoly-live-rollout-20261013/root-slots/stadium-gallery/"+label);Directory.CreateDirectory(folder);
        var shots=new List<Shot>();var checks=new List<string>();var camera=Camera.main;int sequence=1;bool log=Debug.unityLogger.logEnabled;
        void Drop(){var world=(Transform)typeof(ProbeBridge).GetField("world",flags).GetValue(bridge);if(world!=null)UnityEngine.Object.DestroyImmediate(world.gameObject);}
        void Send(WorldCommand c){Debug.unityLogger.logEnabled=false;try{bridge.WorldCommand(JsonUtility.ToJson(c).Replace("\"offside\":{\"lineX\":0.0}","\"offside\":null").Replace("\"offside\":{\"lineX\":0}","\"offside\":null"));}finally{Debug.unityLogger.logEnabled=log;}}
        WorldConfig Load(Fixture f,string quality,string light){
            var config=JsonUtility.FromJson<WorldConfig>(raw);config.teams[0].id=f.home;config.teams[1].id=f.away;config.teams[0].home=f.homeFirst;config.teams[1].home=!f.homeFirst;config.quality=quality;
            var (ha,hb)=Palette[f.home];var (aa,ab)=Palette[f.away];
            foreach(var p in config.players){bool first=p.team==0;if(p.keeper){p.kit.main=first?"#f2c230":"#2f9e5a";p.kit.trim="#1d2329";p.kit.style="plain";continue;}
                p.kit.main=first?ha:f.awayKit??aa;p.kit.trim=first?hb:ab;}
            if(f.presented){bool Cup(string id)=>ClubStadiumProfiles.IsCupId(id);
                config.presentation=new WorldPresentation{schema="d6-presentation-1",competition=f.competition,round=f.venue=="neutral"?"F":"",venue=f.venue,lighting=light,lightRule=f.competition=="europe"?"europe-night":"gallery",lightBucket=light=="day"?10:90,venueCountry="GER",
                    clubs=new[]{new WorldPresentationClub{id=f.home,country="GER",kind=Cup(f.home)?"cup":"league",primary=ha,secondary=hb},new WorldPresentationClub{id=f.away,country="GER",kind=Cup(f.away)?"cup":"league",primary=aa,secondary=ab}}};}
            else config.presentation=null;
            config.session="gallery-"+f.name+"-"+quality+"-"+light;config.initial.session=config.session;config.initial.phase="paused";config.initial.sequence=sequence=1;config.initial.offside=null;config.initial.celebrating=false;
            Arrange(config.initial);Drop();Send(new WorldCommand{kind="load",config=config});
            if(bridge.StadiumPlan==null)throw new InvalidOperationException("Stadium for "+f.name+" was not built");return config;
        }
        void Arrange(WorldFrame frame){
            for(int i=0;i<frame.players.Length&&i<Layout.Length;i++){var at=Layout[i];var d=new Vector3(-2.1f-at.x,0,-1.4f-at.z);if(d.sqrMagnitude<.01f)d=Vector3.right;d.Normalize();
                var p=frame.players[i];p.position=new double[]{at.x,0,at.z};p.facing=new double[]{d.x,0,d.z};p.action="idle";p.moving=false;p.progress=0;p.duration=1;}
            frame.ball=new double[]{-2.1,.29,-1.4};frame.owner=frame.players[3].id;frame.ballOpacity=1;frame.ballInFlight=false;
        }
        void Show(WorldConfig config,Vector3 ball,string mode,double clock,int w,int h,bool celebrating=false,int celebrationTeam=0){
            var frame=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(config.initial));frame.sequence=++sequence;frame.clock=clock;frame.phase="paused";frame.offside=null;Arrange(frame);
            frame.celebrating=celebrating;frame.celebrationTeam=celebrationTeam;frame.celebrationTime=celebrating?1.2:0;frame.celebrationScorer=null;
            var aim=SmallViewDiagnostics.Aim(ball,.29f,mode,(float)w/h);frame.camera=new WorldCamera{position=new double[]{aim.position.x,aim.position.y,aim.position.z},target=new double[]{aim.target.x,aim.target.y,aim.target.z},fov=aim.fov};
            Send(new WorldCommand{kind="frame",frame=frame});
        }
        Texture2D Capture(int w,int h,bool reduced){
            var baked=new List<(SkinnedMeshRenderer skin,GameObject go,Mesh mesh)>();
            foreach(var skin in UnityEngine.Object.FindObjectsByType<SkinnedMeshRenderer>(FindObjectsSortMode.None)){
                if(!skin.enabled||!skin.gameObject.activeInHierarchy)continue;var mesh=new Mesh();skin.BakeMesh(mesh);var go=new GameObject("D6 gallery capture",typeof(MeshFilter),typeof(MeshRenderer));go.transform.SetParent(skin.transform,false);
                go.GetComponent<MeshFilter>().sharedMesh=mesh;var r=go.GetComponent<MeshRenderer>();r.sharedMaterials=skin.sharedMaterials;r.shadowCastingMode=skin.shadowCastingMode;skin.enabled=false;baked.Add((skin,go,mesh));
            }
            // Same MSAA as the page's quality: 4x standard, none reduced.
            var desc=new RenderTextureDescriptor(w,h,RenderTextureFormat.ARGB32,24){msaaSamples=reduced?1:4,sRGB=true};
            var rt=RenderTexture.GetTemporary(desc);float aspect=camera.aspect;camera.aspect=(float)w/h;camera.targetTexture=rt;camera.Render();camera.targetTexture=null;camera.aspect=aspect;
            var previous=RenderTexture.active;RenderTexture.active=rt;var tex=new Texture2D(w,h,TextureFormat.RGB24,false);tex.ReadPixels(new Rect(0,0,w,h),0,0);tex.Apply();RenderTexture.active=previous;RenderTexture.ReleaseTemporary(rt);
            foreach(var item in baked){item.skin.enabled=true;UnityEngine.Object.DestroyImmediate(item.go);UnityEngine.Object.DestroyImmediate(item.mesh);}return tex;
        }
        // Screen share of each supporter block (projected figure bounds clipped to the frame).
        Block[] Blocks(int w,int h){
            var list=new List<Block>();var sp=bridge.Supporters;if(sp==null)return list.ToArray();float saved=camera.aspect;camera.aspect=(float)w/h;
            foreach(var bp in sp.Blocks){var b=bp.FigureBounds;b.Expand(-StadiumSupporters.FigureReach*2);float x0=1,x1=0,y0=1,y1=0;bool any=false;
                for(int k=0;k<8;k++){var c=new Vector3((k&1)==0?b.min.x:b.max.x,(k&2)==0?b.min.y:b.max.y,(k&4)==0?b.min.z:b.max.z);var v=camera.WorldToViewportPoint(c);if(v.z<=0)continue;any=true;x0=Mathf.Min(x0,v.x);x1=Mathf.Max(x1,v.x);y0=Mathf.Min(y0,v.y);y1=Mathf.Max(y1,v.y);}
                float share=any&&bridge.StandShown(bp.Block.Side)?Mathf.Max(0,Mathf.Min(1,x1)-Mathf.Max(0,x0))*Mathf.Max(0,Mathf.Min(1,y1)-Mathf.Max(0,y0)):0;
                list.Add(new Block{club=bp.ClubId,role=bp.Block.Role==0?"home":"away",side=bp.Block.Side,screenShare=share});}
            camera.aspect=saved;return list.ToArray();
        }
        Shot Save(Texture2D tex,Fixture f,string quality,string light,string mode,double clock,bool celebrating,string suffix=""){
            var look=bridge.LightLook;var plan=bridge.StadiumPlan;
            var shot=new Shot{fixture=f.name,venue=bridge.StadiumVenue,venueSource=plan.Source,stadiumClub=bridge.StadiumClub,home=f.homeFirst?f.home:f.away,away=f.homeFirst?f.away:f.home,competition=f.presented?f.competition:"(no presentation)",venueKind=f.venue,
                requestedLight=f.presented?light:"(legacy night)",appliedLight=look.light.ToString(),lampEmission=look.lampEmission,windowLit=look.windowLit,crowdLight=look.crowdLight,bannerLight=look.bannerLight,quality=quality,camera=mode,clock=clock,celebrating=celebrating,blocks=Blocks(tex.width,tex.height)};
            shot.file=$"{label}-{f.name}-{bridge.StadiumVenue}-{light}-{quality}-{mode}{suffix}.png";File.WriteAllBytes(Path.Combine(folder,shot.file),tex.EncodeToPNG());shots.Add(shot);return shot;
        }
        const int W=1280,H=720;
        try{
            // Warm-up: the first world of a fresh Editor scene can render before its materials settle.
            {var config=Load(Fixtures[0],"standard","night");Show(config,Vector3.zero,"follow",30,W,H);UnityEngine.Object.DestroyImmediate(Capture(320,180,false));}
            foreach(var f in Fixtures){if(only!=null&&!f.name.Contains(only))continue;
                bool special=f.name=="clash-kit"||f.name=="legacy-page";
                foreach(var light in f.competition=="europe"||!f.presented?new[]{"night"}:new[]{"day","night"})foreach(var quality in new[]{"standard","reduced"}){
                    if(special&&(quality=="reduced"||light=="day"))continue;
                    var config=Load(f,quality,light);
                    // Broadcast toward the home block's end (x- or x+), at the centre, and behind the goal.
                    var homeBlock=bridge.Supporters?.Blocks.Find(b=>b.Block.Role==0);float toward=homeBlock!=null&&homeBlock.Block.Side==3?24:-24;
                    foreach(var (mode,camera2,ball) in new[]{("broadcast-centre","follow",new Vector3(0,0,0)),("broadcast-home-end","follow",new Vector3(toward,0,-4)),("broadcast-away-end","follow",new Vector3(-toward,0,4)),("behind-goal","goal",new Vector3(12,0,0)),("wide","wide",new Vector3(0,0,0))}){
                        if(special&&mode!="broadcast-home-end"&&mode!="broadcast-away-end")continue;
                        if(quality=="reduced"&&mode=="wide")continue;
                        Show(config,ball,camera2,30,W,H);Save(Capture(W,H,quality=="reduced"),f,quality,light,mode,30,false);}
                }
            }
            // Flag phases, celebration and pause equality on the GER-2 kop (night, standard).
            if(only==null||"ger2-pair".Contains(only)){
                var f=Array.Find(Fixtures,x=>x.name=="ger2-pair");var config=Load(f,"standard","night");var ball=new Vector3(24,0,-4);
                foreach(var clock in new[]{30.0,30.2,30.4,30.6}){Show(config,ball,"follow",clock,W,H);Save(Capture(W,H,false),f,"standard","night","flag-phase",clock,false,"-"+clock.ToString("0.0",System.Globalization.CultureInfo.InvariantCulture));}
                Show(config,ball,"follow",30.2,W,H,true,0);Save(Capture(W,H,false),f,"standard","night","celebration",30.2,true);
                Show(config,ball,"follow",31.7,W,H);var a=Capture(W,H,false);Show(config,ball,"follow",31.7,W,H);var b=Capture(W,H,false);
                var pa=a.GetPixels32();var pb=b.GetPixels32();int differ=0;for(int i=0;i<pa.Length;i++)if(pa[i].r!=pb[i].r||pa[i].g!=pb[i].g||pa[i].b!=pb[i].b)differ++;
                checks.Add("paused clock 31.7 rendered twice: "+differ+" differing pixels");if(differ!=0)Debug.LogWarning("[D6] stadium gallery: a paused clock rendered "+differ+" different pixels");
                Save(a,f,"standard","night","paused-repeat",31.7,false);UnityEngine.Object.DestroyImmediate(b);
            }
        }finally{Drop();typeof(ProbeBridge).GetMethod("RestoreProbeLighting",flags).Invoke(bridge,null);camera.targetTexture=null;}
        var report=new Report{label=label,sourceId=ProbeBuildIdentity.SourceId,unity=Application.unityVersion,device=SystemInfo.graphicsDeviceType.ToString(),
            note="Paused display-only layout of the contract fixture through ProbeBridge.WorldCommand with a received WorldPresentation per fixture (clubs' catalogue colours). requestedLight is presentation.lighting; appliedLight and the lamp/window/crowd/banner values are the light look the bridge actually applied (night everywhere until the lighting lane is merged). Cameras from SmallViewDiagnostics.Aim (1:1 v98CameraAim, near 60). blocks.screenShare: projected rest bounds of each supporter block clipped to the frame (0 when its stand is hidden). Editor images, not WebGL or device GPU evidence.",
            shots=shots.ToArray(),checks=checks.ToArray()};
        File.WriteAllText(Path.Combine(folder,"stadium-gallery-"+label+".json"),JsonUtility.ToJson(report,true));
        return "label="+label+" shots="+shots.Count+" checks="+string.Join("; ",checks)+" device="+SystemInfo.graphicsDeviceType;
    }
}
#endif

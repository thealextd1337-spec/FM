#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using System.Reflection;
using UnityEngine;
using Doppel6.Probe;
// Keeper iteration evidence through the actual ProbeBridge.WorldCommand path:
// actual captured native keeper sequences (keeper-fixtures.json) replayed step
// by step. The keeper's exact captured pose JSON is spliced into each picture,
// so only the keys the bridge sent are present. Side camera on the keeper,
// geometry of the captured pitch. Needs a graphics device.
public static class KeeperEvidenceDiagnostics {
    const int Tile=320;
    [Serializable] class Fixture {public Seq[] sequences;}
    [Serializable] class Seq {public string name,source,keeper;public bool turned;public string[] steps;}
    [Serializable] class Shot {public string sequence,origin,file,clip,kind,action,actionId,phase;public int step,pictureSequence;public double progress,recovery,time;public bool contact,turned,controlled,rawSaved,rawParry,rawBallInFlight,savedKnown,parryKnown,ballInFlightKnown,held,reachable;public float hips;}
    [Serializable] class Listing {public string sourceId,unity,device,note;public string[] files;public Shot[] shots;}
    static string N(double v){return v.ToString("0.###",System.Globalization.CultureInfo.InvariantCulture);}
    static string Step(int sequence,double clock,string owner,bool? flight,double[] ball,string pose){
        return "{\"sequence\":"+sequence+",\"clock\":"+N(clock)+",\"owner\":\""+owner+"\""+(flight.HasValue?",\"ballInFlight\":"+(flight.Value?"true":"false"):"")+",\"ball\":["+N(ball[0])+","+N(ball[1])+","+N(ball[2])+"],\"players\":["+pose+"]}";
    }
    static string Pose(string actionId,double progress,double recovery,double[] contact,string facts){
        return "{\"id\":\"controlled-keeper\",\"position\":[-31,0,0],\"facing\":[1,0,0],\"moving\":false,\"action\":\"save\",\"actionId\":\""+actionId+"\",\"contactPoint\":["+N(contact[0])+","+N(contact[1])+","+N(contact[2])+"],\"recovery\":"+N(recovery)+",\"progress\":"+N(progress)+",\"duration\":1,\"number\":1"+facts+"}";
    }
    // Controlled diagnostic sequences (keeper at x=-31 facing +x).
    static Seq[] Controlled(){
        var list=new List<Seq>();
        Seq Make(string name,Func<int,string> step,int n){var s=new Seq{name=name,source="controlled-json",keeper="controlled-keeper",steps=new string[n]};for(int k=0;k<n;k++)s.steps[k]=step(k);list.Add(s);return s;}
        var chest=new[]{-29.8,1.35,.3};
        // Catch: approach (saved false), then recovery with saved true, owner keeper, ball resting at the contact.
        string Catch(int k,string after,bool flightKnown,string owner){
            if(k<8){double q=k/7.0;return Step(k,10+k*.05,"",true,new[]{-24+(chest[0]+24)*q,1.35,chest[2]*q},Pose("save",q,0,chest,",\"saved\":false,\"parry\":false,\"goal\":false"));}
            double r=(k-7)/12.0;return Step(k,10+k*.05,owner,flightKnown?false:(bool?)null,chest,Pose("save",1,r,chest,after));
        }
        Make("controlled-catch-held",k=>Catch(k,",\"saved\":true,\"parry\":false,\"goal\":false",true,"@keeper"),20);
        // Negative guards: a parry (ball away, other owner) and a picture without the facts.
        Make("controlled-guard-parry",k=>k<8?Catch(k,"",true,""):Step(k,10+k*.05,"",false,new[]{chest[0]+(k-7)*.5,Math.Max(.29,1.35-(k-7)*.12),chest[2]+(k-7)*.4},Pose("save",1,(k-7)/12.0,chest,",\"saved\":true,\"parry\":true,\"goal\":false")),20);
        Make("controlled-guard-unknown",k=>Catch(k,"",false,"@keeper"),20);
        // Pickup: native pickup:<at> starts complete (progress 1) with the ball at the keeper's feet.
        var ground=new[]{-30.4,.29,0};
        Make("controlled-pickup",k=>Step(k,20+k*.05,"@keeper",false,ground,Pose("pickup:20",1,k/11.0,ground,",\"saved\":true,\"parry\":false,\"goal\":false,\"smother\":false")),12);
        // Smother: the attacker still owns the ball during the 0.55 s challenge, then the keeper holds it.
        var smother=new[]{-29.9,.35,.4};
        Make("controlled-smother",k=>k<6?Step(k,30+k*.05,"@other",false,new[]{-28.6+(smother[0]+28.6)*k/5.0,.29,smother[2]},Pose("smother:30",k/5.0,0,smother,",\"saved\":false,\"parry\":false,\"goal\":false,\"smother\":true")):Step(k,30+k*.05,"@keeper",false,smother,Pose("smother:30",1,(k-5)/10.0,smother,",\"saved\":true,\"parry\":false,\"goal\":false,\"smother\":true")),16);
        return list.ToArray();
    }
    public static string Run(string repository){
        var bridge=UnityEngine.Object.FindFirstObjectByType<ProbeBridge>()??throw new InvalidOperationException("ProbeBridge is missing in the open scene");
        var flags=BindingFlags.NonPublic|BindingFlags.Instance;var raw=File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json"));
        var fixture=JsonUtility.FromJson<Fixture>(File.ReadAllText(Path.Combine(repository,"outputs/3d-quality/keeper-next/keeper-fixtures.json")));
        var folder=Path.Combine(repository,"outputs/3d-quality/keeper-next/renders");Directory.CreateDirectory(folder);var written=new List<string>();var shots=new List<Shot>();
        var camera=Camera.main;int sequence=1;bool log=Debug.unityLogger.logEnabled;string goalieId=null;int goalieIndex=-1;
        void Drop(){var world=(Transform)typeof(ProbeBridge).GetField("world",flags).GetValue(bridge);if(world!=null)UnityEngine.Object.DestroyImmediate(world.gameObject);}
        void Send(string json){Debug.unityLogger.logEnabled=false;try{bridge.WorldCommand(json);}finally{Debug.unityLogger.logEnabled=log;}}
        WorldConfig Load(string club,bool large){
            var config=JsonUtility.FromJson<WorldConfig>(raw);config.teams[0].id=club;config.teams[0].home=true;config.teams[1].id="FRA-1";config.teams[1].home=false;config.quality="standard";
            // Captured native geometry (standard 68 x 44 or large 81.6 x 52.8).
            config.geometry.length=large?81.6:68;config.geometry.width=large?52.8:44;config.geometry.goalWidth=9.705882352941178;config.geometry.goalHeight=3.2352941176470593;config.geometry.penaltyDepth=10.5953488372093;config.geometry.penaltyWidth=24.264705882352942;
            config.session="keeper-next-"+club+(large?"-large":"");config.initial.session=config.session;config.initial.phase="paused";config.initial.sequence=sequence=1;
            Drop();Send(JsonUtility.ToJson(new WorldCommand{kind="load",config=config}));
            var goalie=Array.Find(config.players,p=>p.keeper&&p.team==0);goalieId=goalie.id;goalieIndex=Array.FindIndex(config.initial.players,p=>p.id==goalieId);return config;
        }
        Texture2D Capture(int w,int h){
            // Same-Editor-frame poses: bake the live bones as the earlier evidence does.
            var baked=new List<(SkinnedMeshRenderer skin,GameObject go,Mesh mesh)>();
            foreach(var skin in UnityEngine.Object.FindObjectsByType<SkinnedMeshRenderer>(FindObjectsSortMode.None)){
                if(!skin.enabled||!skin.gameObject.activeInHierarchy)continue;
                var mesh=new Mesh();skin.BakeMesh(mesh);var go=new GameObject("D6 current-pose capture",typeof(MeshFilter),typeof(MeshRenderer));go.transform.SetParent(skin.transform,false);
                go.GetComponent<MeshFilter>().sharedMesh=mesh;var renderer=go.GetComponent<MeshRenderer>();renderer.sharedMaterials=skin.sharedMaterials;renderer.shadowCastingMode=skin.shadowCastingMode;skin.enabled=false;baked.Add((skin,go,mesh));
            }
            var rt=RenderTexture.GetTemporary(w,h,24,RenderTextureFormat.ARGB32);camera.aspect=(float)w/h;camera.targetTexture=rt;camera.Render();camera.targetTexture=null;
            var previous=RenderTexture.active;RenderTexture.active=rt;var tex=new Texture2D(w,h,TextureFormat.RGB24,false);tex.ReadPixels(new Rect(0,0,w,h),0,0);tex.Apply();RenderTexture.active=previous;RenderTexture.ReleaseTemporary(rt);
            foreach(var item in baked){item.skin.enabled=true;UnityEngine.Object.DestroyImmediate(item.go);UnityEngine.Object.DestroyImmediate(item.mesh);}return tex;
        }
        void Save(Texture2D tex,string name){File.WriteAllBytes(Path.Combine(folder,name),tex.EncodeToPNG());written.Add(name);UnityEngine.Object.DestroyImmediate(tex);}
        // One actual step as a received picture: the keeper's captured JSON spliced in.
        void Show(WorldConfig config,string step){
            var s=WorldPhasePresence.ParseFrame(step);var kp=s.players[0];
            var f=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(config.initial));f.sequence=++sequence;f.clock=s.clock;f.phase="paused";f.ball=s.ball;f.ballOpacity=1;
            f.owner=step.Contains("\"owner\":\"@keeper\"")?goalieId:step.Contains("\"owner\":\"@other\"")?config.initial.players[goalieIndex==0?1:0].id:"";f.ballInFlight=s.ballInFlight;
            for(int k=0;k<f.players.Length;k++)if(k!=goalieIndex)f.players[k].position=new double[]{kp.position[0]>0?kp.position[0]-28:kp.position[0]+28,0,-18+k*3};
            var face=new Vector3((float)kp.facing[0],0,(float)kp.facing[2]).normalized;var right=new Vector3(face.z,0,-face.x);var at=new Vector3((float)kp.position[0],0,(float)kp.position[2]);
            // Field side of the keeper, never through the goal net.
            var eye=at+right*5.2f+face*4.4f+Vector3.up*1.7f;var look=at+face*.4f+Vector3.up*1.05f;
            f.camera.position=new double[]{eye.x,eye.y,eye.z};f.camera.target=new double[]{look.x,look.y,look.z};f.camera.fov=40;
            var json=JsonUtility.ToJson(new WorldCommand{kind="frame",frame=f});
            if(!s.ballInFlightKnown)json=json.Replace(",\"ballInFlight\":false","").Replace(",\"ballInFlight\":true","");
            var mine=JsonUtility.ToJson(f.players[goalieIndex]);if(json.IndexOf(mine,StringComparison.Ordinal)<0)throw new Exception("keeper JSON not found");
            int a=step.IndexOf("\"players\":[",StringComparison.Ordinal)+11,b=step.LastIndexOf("]}",StringComparison.Ordinal);
            var actual=step.Substring(a,b-a).Replace("\""+kp.id+"\"","\""+goalieId+"\"");
            actual=System.Text.RegularExpressions.Regex.Replace(actual,"\"number\":\\d+","\"number\":"+config.initial.players[goalieIndex].number);
            Send(json.Replace(mine,actual));
        }
        float Hips(){var actors=(List<Transform>)typeof(ProbeBridge).GetField("actors",flags).GetValue(bridge);var t=Array.Find(actors[goalieIndex].GetComponentsInChildren<Transform>(),x=>x.name=="mixamorig:Hips");return t.position.y;}
        try{
            // Release 117 measured a wrong first capture of new materials; one
            // discarded warm-up load and two captures precede the evidence.
            {var warm=Load("ENG-2",false);var s=fixture.sequences[0];Show(warm,s.steps[0]);UnityEngine.Object.DestroyImmediate(Capture(Tile,Tile));UnityEngine.Object.DestroyImmediate(Capture(Tile,Tile));}
            void Render(Seq seq,bool controlled){
                bool large=seq.source.Contains("large");var config=Load("ENG-1",large);
                int n=seq.steps.Length;var picks=new List<int>();for(int k=0;k<8;k++)picks.Add(Math.Min(n-1,(int)Math.Round(k*(n-1)/7.0)));
                // Goal kick: show the wait, wind-up, release and follow-through explicitly.
                if(seq.name.StartsWith("goalkick")){picks.Clear();var parsed=Array.ConvertAll(seq.steps,WorldPhasePresence.ParseFrame);int release=Array.FindIndex(parsed,x=>x.players[0].phase=="follow");foreach(var k in new[]{2,release-6,release-3,release-1,release,release+2,release+5,n-1})picks.Add(Math.Clamp(k,0,n-1));}
                var sheet=new Texture2D(Tile*picks.Count,Tile,TextureFormat.RGB24,false);
                // Every step is received in order (actual cadence), the picked ones captured.
                int tile=0;
                for(int k=0;k<n;k++){
                    Show(config,seq.steps[k]);if(!picks.Contains(k))continue;
                    var rp=((Array)typeof(ProbeBridge).GetField("renderedPoses",flags).GetValue(bridge)).GetValue(goalieIndex);T R<T>(string name)=>(T)rp.GetType().GetField(name).GetValue(rp);var p=WorldPhasePresence.ParseFrame(seq.steps[k]).players[0];
                    var tex=Capture(Tile,Tile);sheet.SetPixels(tile*Tile,0,Tile,Tile,tex.GetPixels());
                    var file=$"{seq.name}-{tile:00}.png";Save(tex,file);
                    shots.Add(new Shot{sequence=seq.name,origin=seq.source,controlled=controlled,file=file,step=k,pictureSequence=sequence,action=p.action,actionId=p.actionId,phase=p.phase,progress=p.progress,recovery=p.recovery,clip=R<string>("clip"),time=R<double>("time"),kind=R<string>("kind"),contact=R<bool>("contact"),turned=seq.turned,hips=Hips()});
                    // Raw keys of the sent keeper JSON and the facts Unity actually received.
                    var shown=(WorldFrame)typeof(ProbeBridge).GetField("displayed",flags).GetValue(bridge);var sp=Array.Find(shown.players,q=>q.id==goalieId);var shot=shots[shots.Count-1];
                    shot.rawSaved=seq.steps[k].Contains("\"saved\":");shot.rawParry=seq.steps[k].Contains("\"parry\":");shot.rawBallInFlight=seq.steps[k].Contains("\"ballInFlight\":");
                    shot.savedKnown=sp.savedKnown;shot.parryKnown=sp.parryKnown;shot.ballInFlightKnown=shown.ballInFlightKnown;shot.held=FootballKeeperTiming.Held(sp,shown);
                    var animations=(List<FootballAnimation>)typeof(ProbeBridge).GetField("football",flags).GetValue(bridge);shot.reachable=animations[goalieIndex].rig.reachable;
                    if(shot.rawSaved!=shot.savedKnown||shot.rawParry!=shot.parryKnown||shot.rawBallInFlight!=shot.ballInFlightKnown)throw new Exception("received presence differs from the sent keys ("+seq.name+" step "+k+")");
                    tile++;
                }
                sheet.Apply();Save(sheet,$"{seq.name}-sheet.png");
            }
            foreach(var seq in fixture.sequences)Render(seq,false);
            // Controlled diagnostic JSON, not a captured native chain: the five
            // captured matches contained no catch, pickup or smother. Same keys
            // and value shapes as the current bridge; for inspecting the hold
            // path and its negative guards only.
            foreach(var seq in Controlled())Render(seq,true);
        }finally{
            Drop();typeof(ProbeBridge).GetMethod("RestoreProbeLighting",flags).Invoke(bridge,null);camera.targetTexture=null;
        }
        File.WriteAllText(Path.Combine(folder,"renders.json"),JsonUtility.ToJson(new Listing{sourceId=ProbeBuildIdentity.SourceId,unity=Application.unityVersion,device=SystemInfo.graphicsDeviceType.ToString(),note="Sequences without controlled=true are actual captured native keeper pictures replayed through ProbeBridge.WorldCommand (paused pictures show the exact received step). Sequences named controlled-* (controlled=true) are hand-built diagnostic JSON in the bridge shape, not naturally occurred native chains. Live bones baked per capture; not a WebGL or device acceptance.",files=written.ToArray(),shots=shots.ToArray()},true));
        return "renders="+written.Count+" shots="+shots.Count+" device="+SystemInfo.graphicsDeviceType;
    }
}
#endif

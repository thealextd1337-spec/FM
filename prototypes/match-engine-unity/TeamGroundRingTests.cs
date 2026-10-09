#if UNITY_EDITOR
using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Reflection;
using UnityEngine;
using Doppel6.Probe;
public static class TeamGroundRingTests {
    [Serializable] class Report {public int passed;public string[] checks;}
    public static string Run(string repo){
        var checks=new List<string>();void Require(bool ok,string name){if(!ok)throw new Exception(name);checks.Add(name);}
        var flags=BindingFlags.Instance|BindingFlags.NonPublic;
        var bridge=UnityEngine.Object.FindFirstObjectByType<ProbeBridge>();Require(bridge!=null,"real probe scene loaded");
        var config=JsonUtility.FromJson<WorldConfig>(File.ReadAllText(Path.Combine(repo,"outputs/platform/world-unity/contract-fixture.json")));
        var before=JsonUtility.ToJson(config);
        foreach(var quality in new[]{"standard","reduced"}){
            config.quality=quality;config.session="team-ring-"+quality;config.initial.session=config.session;config.initial.phase="paused";
            bridge.WorldCommand(JsonUtility.ToJson(new WorldCommand{kind="load",config=config}));
            var rings=(Transform[])typeof(ProbeBridge).GetField("teamGroundRings",flags).GetValue(bridge);
            Require(rings!=null&&rings.Length==config.initial.players.Length,quality+": every actual player has a ground ring");
            var meshes=new HashSet<Mesh>();Material shared=null;
            for(int i=0;i<rings.Length;i++){
                var id=config.initial.players[i].id;var player=Array.Find(config.players,p=>p.id==id);var ring=rings[i];var mesh=ring.GetComponent<MeshFilter>().sharedMesh;meshes.Add(mesh);
                var teamPlayer=Array.Find(config.players,p=>p.team==player.team&&!p.keeper);ColorUtility.TryParseHtmlString(teamPlayer.kit.main,out var color);
                Require(mesh.colors.Any(c=>Vector4.Distance(c,color.linear)<.0001f),quality+": actual outfield club colour for "+id);
                Require(mesh.colors.Any(c=>c.r>.99f)&&mesh.colors.Any(c=>c.r<.01f),quality+": light and dark contrast for "+id);
                Require(mesh.name==(player.team==0?"Club ring continuous":"Club ring segmented"),quality+": stable team pattern for "+id);
                Require(ring.GetComponent<Collider>()==null,quality+": indicator has no physical collider for "+id);
                var renderer=ring.GetComponent<MeshRenderer>();if(shared==null)shared=renderer.sharedMaterial;
                Require(renderer.sharedMaterial==shared&&!renderer.receiveShadows&&renderer.shadowCastingMode==UnityEngine.Rendering.ShadowCastingMode.Off,quality+": shared shadow-free material for "+id);
            }
            Require(meshes.Count==2,quality+": exactly two shared team meshes");
            Require(meshes.All(m=>m.bounds.extents.x<.89f&&m.bounds.extents.z<.89f&&m.triangles.Length/3<=288),quality+": bounded ring size and triangle budget");
            var frame=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(config.initial));frame.sequence++;frame.players[0].position=new[]{6.0,0.0,4.0};
            bridge.WorldCommand(JsonUtility.ToJson(new WorldCommand{kind="frame",frame=frame}));
            Require(Vector3.Distance(rings[0].position,new Vector3(6,.045f,4))<.0001f,quality+": ring follows actual received player position at fixed turf height");
            Require(JsonUtility.ToJson(frame).Contains("6.0")||frame.players[0].position[0]==6,quality+": received player position not changed");
            typeof(ProbeBridge).GetMethod("Clear",flags).Invoke(bridge,null);
            Require(shared==null,quality+": ring material disposed on world cleanup");
            Require(meshes.All(m=>m==null),quality+": shared ring meshes disposed on world cleanup");
        }
        var original=JsonUtility.FromJson<WorldConfig>(before);Require(original.initial.players[0].position[0]==config.initial.players[0].position[0],"original config player position unchanged");
        var folder=Path.Combine(repo,"outputs/3d-quality/mobile-readability");Directory.CreateDirectory(folder);var result=JsonUtility.ToJson(new Report{passed=checks.Count,checks=checks.ToArray()},true);File.WriteAllText(Path.Combine(folder,"team-ring-tests.json"),result);return "passed="+checks.Count;
    }
}
#endif

#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
// Rest-pose bounds of the club-world player mesh per bone region and cloth
// channel. Read-only; used to place shirt numbers and keeper gloves.
public static class WorldKitDiagnostics {
    [Serializable] class Region {public string name;public int vertices;public Vector3 min,max;}
    [Serializable] class Report {public int vertices;public bool hasRegions;public Region[] regions;}
    public static string Run(string repository){
        const string root="Assets/Doppel6EngineProbe/Art";
        var mesh=AssetDatabase.LoadAssetAtPath<Mesh>(root+"/WorldPlayer.asset");var smr=AssetDatabase.LoadAssetAtPath<GameObject>(root+"/football-v130.fbx").GetComponentInChildren<SkinnedMeshRenderer>();
        var rest=new List<Vector3>();mesh.GetUVs(2,rest);var uv=new List<Vector2>();mesh.GetUVs(0,uv);var weights=mesh.boneWeights;var bones=smr.bones;
        var path=AssetDatabase.GetAssetPath(AssetDatabase.LoadAssetAtPath<Texture2D>(root+"/cloth-mask.png"));var importer=(TextureImporter)AssetImporter.GetAtPath(path);bool readable=importer.isReadable;
        if(!readable){importer.isReadable=true;importer.SaveAndReimport();}
        var mask=AssetDatabase.LoadAssetAtPath<Texture2D>(path);
        var regions=new Dictionary<string,Region>();
        void Add(string name,Vector3 p){if(!regions.TryGetValue(name,out var r)){r=new Region{name=name,min=p,max=p};regions.Add(name,r);}r.vertices++;r.min=Vector3.Min(r.min,p);r.max=Vector3.Max(r.max,p);}
        try{
            for(int i=0;i<rest.Count;i++){
                var w=weights[i];string bone=bones[w.boneIndex0].name.Replace("mixamorig:","");Add("bone:"+bone,rest[i]);
                var c=mask.GetPixelBilinear(uv[i].x,uv[i].y);Add(c.r>.5f?"cloth:shirt-shorts":c.b>.5f?"cloth:socks":"cloth:none",rest[i]);
            }
        }finally{if(!readable){importer.isReadable=false;importer.SaveAndReimport();}}
        var list=new List<Region>(regions.Values);list.Sort((a,b)=>string.CompareOrdinal(a.name,b.name));
        var uv3=new List<Vector4>();mesh.GetUVs(3,uv3);
        var json=JsonUtility.ToJson(new Report{vertices=rest.Count,hasRegions=uv3.Count==rest.Count,regions=list.ToArray()},true);
        var folder=Path.Combine(repository,"outputs/platform/unity-phases");Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,"kit-regions.json"),json);return "regions="+list.Count;
    }
}
#endif

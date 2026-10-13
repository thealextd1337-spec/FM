#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using Doppel6.Probe;
// Klares Low-Poly match mesh. The versioned FBX d6_lowpoly_<version>.fbx
// (work/platform/assets/lowpoly/build_lowpoly.py, copied by install-unity.cjs)
// carries a new skin on the unchanged 28-joint rig. This builds
// WorldPlayerLowPoly-<version>.asset exactly like WorldViewSetup builds
// WorldPlayer.asset: the SkinnedMeshRenderer bones of football-v130.fbx stay
// the actor's bones, so weights are remapped to that bone order by name and
// the original bind poses are reused after checking they are equal. TEXCOORD2
// holds the bind-pose coordinates the kit shader needs. The original
// WorldPlayer.asset stays untouched; Assign switches the probe scene between
// both, with their textures (rollback: -d6mesh original).
public static class LowPolySetup {
    public const string Art="Assets/Doppel6EngineProbe/Art",Version="v4";
    public const string Fbx=Art+"/d6_lowpoly_"+Version+".fbx",Asset=Art+"/WorldPlayerLowPoly-"+Version+".asset",Original=Art+"/WorldPlayer.asset",Base=Art+"/d6_lowpoly_"+Version+"_base.png",Mask=Art+"/d6_lowpoly_"+Version+"_mask.png";
    [Serializable] class Report {public string version,fbx,asset,meshName,meshHash;public int vertices,triangles,originalVertices,originalTriangles,bones,maxInfluences;public float bindposeMaxDifference,weightSumMin,weightSumMax,restDistanceMean,restDistanceP95,restDistanceMax,soleLow,soleOriginal;public Vector3 boundsMin,boundsMax,originalBoundsMin,originalBoundsMax;public Region[] regions;public float regionAgreement;public string[] notes;}
    [Serializable] class Region {public string name;public int lowVertices,originalVertices,agree;}

    public static string Build(string repository){
        var importer=(ModelImporter)AssetImporter.GetAtPath(Fbx)??throw new FileNotFoundException(Fbx+" (run work/platform/assets/lowpoly/install-unity.cjs)");
        importer.animationType=ModelImporterAnimationType.Generic;importer.importAnimation=false;importer.materialImportMode=ModelImporterMaterialImportMode.None;
        importer.importNormals=ModelImporterNormals.Import;importer.importBlendShapes=false;importer.weldVertices=true;importer.isReadable=true;importer.optimizeGameObjects=false;
        importer.meshCompression=ModelImporterMeshCompression.Off;importer.globalScale=1;importer.addCollider=false;importer.SaveAndReimport();
        // Baked textures of the low-poly unwrap: BaseColor (sRGB) and the cloth mask as data (linear, uncompressed, like cloth-mask.png).
        var baseImporter=(TextureImporter)AssetImporter.GetAtPath(Base)??throw new FileNotFoundException(Base);baseImporter.sRGBTexture=true;baseImporter.maxTextureSize=1024;baseImporter.mipmapEnabled=true;baseImporter.SaveAndReimport();
        var maskImporter=(TextureImporter)AssetImporter.GetAtPath(Mask)??throw new FileNotFoundException(Mask);maskImporter.sRGBTexture=false;maskImporter.textureCompression=TextureImporterCompression.Uncompressed;maskImporter.maxTextureSize=1024;maskImporter.SaveAndReimport();
        var original=AssetDatabase.LoadAssetAtPath<GameObject>(Art+"/football-v130.fbx").GetComponentInChildren<SkinnedMeshRenderer>();
        var low=AssetDatabase.LoadAssetAtPath<GameObject>(Fbx).GetComponentInChildren<SkinnedMeshRenderer>()??throw new InvalidOperationException("No skinned mesh in "+Fbx);
        var source=low.sharedMesh;var reference=AssetDatabase.LoadAssetAtPath<Mesh>(Original);var notes=new List<string>();
        // Bone order of the actor (football-v130.fbx) and equal bind poses.
        var order=new Dictionary<string,int>();for(int b=0;b<original.bones.Length;b++)order[original.bones[b].name]=b;
        var map=new int[low.bones.Length];float bindDiff=0;
        for(int b=0;b<low.bones.Length;b++){
            if(!order.TryGetValue(low.bones[b].name,out map[b]))throw new InvalidOperationException("Bone "+low.bones[b].name+" is not on the match rig");
            var x=source.bindposes[b];var y=original.sharedMesh.bindposes[map[b]];for(int k=0;k<16;k++)bindDiff=Mathf.Max(bindDiff,Mathf.Abs(x[k]-y[k]));
        }
        if(bindDiff>1e-3f)throw new InvalidOperationException("Bind poses differ from football-v130 by "+bindDiff);
        var weights=source.boneWeights;var remapped=new BoneWeight[weights.Length];float wmin=9,wmax=0;int maxInf=0;
        for(int i=0;i<weights.Length;i++){var w=weights[i];
            remapped[i]=new BoneWeight{boneIndex0=map[w.boneIndex0],weight0=w.weight0,boneIndex1=map[w.boneIndex1],weight1=w.weight1,boneIndex2=map[w.boneIndex2],weight2=w.weight2,boneIndex3=map[w.boneIndex3],weight3=w.weight3};
            float s=w.weight0+w.weight1+w.weight2+w.weight3;wmin=Mathf.Min(wmin,s);wmax=Mathf.Max(wmax,s);maxInf=Mathf.Max(maxInf,(w.weight0>0?1:0)+(w.weight1>0?1:0)+(w.weight2>0?1:0)+(w.weight3>0?1:0));}
        var mesh=new Mesh{name="WorldPlayerLowPoly-"+Version};mesh.indexFormat=UnityEngine.Rendering.IndexFormat.UInt16;
        var vertices=source.vertices;mesh.SetVertices(vertices);mesh.SetNormals(source.normals);var uv=new List<Vector2>();source.GetUVs(0,uv);mesh.SetUVs(0,uv);mesh.SetUVs(2,new List<Vector3>(vertices));
        mesh.boneWeights=remapped;mesh.bindposes=original.sharedMesh.bindposes;mesh.SetTriangles(source.triangles,0);mesh.RecalculateBounds();
        // Same mesh space as the original: distance of each new vertex to the nearest original rest vertex.
        var refRest=reference.vertices;var dist=new List<float>();
        foreach(var v in vertices){float best=float.MaxValue;foreach(var r in refRest){float d=(v-r).sqrMagnitude;if(d<best)best=d;}dist.Add(Mathf.Sqrt(best));}
        dist.Sort();if(dist[dist.Count/2]>.01f)throw new InvalidOperationException("Low-poly vertices are not in the original mesh space (median "+dist[dist.Count/2]+" m)");
        if(AssetDatabase.LoadAssetAtPath<Mesh>(Asset)!=null)AssetDatabase.DeleteAsset(Asset);
        AssetDatabase.CreateAsset(mesh,Asset);AssetDatabase.SaveAssets();mesh=AssetDatabase.LoadAssetAtPath<Mesh>(Asset);
        var regions=Regions(mesh,reference,out float agreement);
        float Sole(Mesh m){float s=float.MaxValue;foreach(var v in m.vertices)s=Mathf.Min(s,v.z);return s;}
        var report=new Report{version=Version,fbx=Fbx,asset=Asset,meshName=mesh.name,meshHash=LowPolyDiagnostics.MeshHash(mesh),vertices=mesh.vertexCount,triangles=mesh.triangles.Length/3,originalVertices=reference.vertexCount,originalTriangles=reference.triangles.Length/3,
            bones=low.bones.Length,maxInfluences=maxInf,bindposeMaxDifference=bindDiff,weightSumMin=wmin,weightSumMax=wmax,restDistanceMean=Mean(dist),restDistanceP95=dist[(int)(dist.Count*.95f)],restDistanceMax=dist[dist.Count-1],
            soleLow=Sole(mesh),soleOriginal=Sole(reference),boundsMin=mesh.bounds.min,boundsMax=mesh.bounds.max,originalBoundsMin=reference.bounds.min,originalBoundsMax=reference.bounds.max,regions=regions,regionAgreement=agreement,notes=notes.ToArray()};
        var folder=Path.Combine(repository,"outputs/style-demos/lowpoly/unity");Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,"lowpoly-mesh-"+Version+".json"),JsonUtility.ToJson(report,true));
        return "mesh="+mesh.name+" vertices="+report.vertices+" triangles="+report.triangles+" bindDiff="+bindDiff.ToString("0.000000")+" restMedian="+dist[dist.Count/2].ToString("0.0000")+" regionAgreement="+agreement.ToString("0.000")+" hash="+report.meshHash.Substring(0,12);
    }
    static float Mean(List<float> l){float s=0;foreach(var x in l)s+=x;return s/Math.Max(1,l.Count);}
    // Kit-shader region of a vertex from cloth mask, BaseColor pigment and bind
    // position, in the same order as WorldKit.shader frag().
    static string Classify(Texture2D mask,Texture2D baseMap,Vector2 uv,Vector3 rest){
        Color Sample(Texture2D t){return t.GetPixelBilinear(Mathf.Repeat(uv.x,1),Mathf.Repeat(uv.y,1));}
        var cloth=Sample(mask);if(cloth.r>.5f)return "shirt";if(cloth.g>.5f)return "shorts";if(cloth.b>.5f)return "socks";
        var c=Sample(baseMap);float pigment=Mathf.Max(c.r,Mathf.Max(c.g,c.b));float height=rest.z,forward=-rest.y;
        if((height>1.62f||(height>1.49f&&forward<-.025f&&pigment<.24f))&&pigment<.35f)return "hair";
        if(c.r>c.g*1.12f&&c.g>c.b*1.12f&&pigment>.18f&&height>.5f)return "skin";
        return "other";
    }
    // Region of every low-poly vertex against the nearest original vertex.
    static Region[] Regions(Mesh low,Mesh original,out float agreement){
        var restore=new List<TextureImporter>();
        foreach(var p in new[]{Art+"/cloth-mask.png",Art+"/textures/image-0.png",Mask,Base}){var ti=(TextureImporter)AssetImporter.GetAtPath(p);if(!ti.isReadable){ti.isReadable=true;ti.SaveAndReimport();restore.Add(ti);}}
        try{
            var mask=AssetDatabase.LoadAssetAtPath<Texture2D>(Art+"/cloth-mask.png");var baseMap=AssetDatabase.LoadAssetAtPath<Texture2D>(Art+"/textures/image-0.png");
            var lowMask=AssetDatabase.LoadAssetAtPath<Texture2D>(Mask);var lowBase=AssetDatabase.LoadAssetAtPath<Texture2D>(Base);
            var lu=new List<Vector2>();low.GetUVs(0,lu);var ou=new List<Vector2>();original.GetUVs(0,ou);var lv=low.vertices;var ov=original.vertices;
            var regions=new Dictionary<string,Region>();Region R(string n){if(!regions.TryGetValue(n,out var r)){r=new Region{name=n};regions.Add(n,r);}return r;}
            var originalClass=new string[ov.Length];for(int i=0;i<ov.Length;i++){originalClass[i]=Classify(mask,baseMap,ou[i],ov[i]);R(originalClass[i]).originalVertices++;}
            int agree=0;
            for(int i=0;i<lv.Length;i++){var c=Classify(lowMask,lowBase,lu[i],lv[i]);var r=R(c);r.lowVertices++;int best=0;float bd=float.MaxValue;for(int k=0;k<ov.Length;k++){float d=(lv[i]-ov[k]).sqrMagnitude;if(d<bd){bd=d;best=k;}}if(originalClass[best]==c){r.agree++;agree++;}}
            agreement=(float)agree/lv.Length;var list=new List<Region>(regions.Values);list.Sort((a,b)=>string.CompareOrdinal(a.name,b.name));return list.ToArray();
        }finally{foreach(var ti in restore){ti.isReadable=false;ti.SaveAndReimport();}}
    }
    // The match mesh the open probe scene actually uses (suites skin their
    // test actors with it); WorldPlayer.asset when no bridge is loaded.
    public static Mesh MatchMesh(){
        var bridge=UnityEngine.Object.FindFirstObjectByType<ProbeBridge>();
        return bridge!=null&&bridge.matchPlayerMesh!=null?bridge.matchPlayerMesh:AssetDatabase.LoadAssetAtPath<Mesh>(Original);
    }
    // Which player mesh the probe scene (and therefore the WebGL build) uses.
    public static string Assign(string variant){
        var path=variant=="lowpoly"?Asset:variant=="original"?Original:throw new ArgumentException("-d6mesh lowpoly|original");
        var mesh=AssetDatabase.LoadAssetAtPath<Mesh>(path)??throw new FileNotFoundException(path);
        var scene=EditorSceneManager.OpenScene("Assets/Doppel6EngineProbe/Probe.unity",OpenSceneMode.Single);
        ProbeBridge bridge=null;foreach(var root in scene.GetRootGameObjects()){bridge=root.GetComponentInChildren<ProbeBridge>();if(bridge!=null)break;}
        if(bridge==null)throw new InvalidOperationException("ProbeBridge is missing");
        bridge.matchPlayerMesh=mesh;bool low=variant=="lowpoly";
        bridge.clothMask=AssetDatabase.LoadAssetAtPath<Texture2D>(low?Mask:Art+"/cloth-mask.png")??throw new FileNotFoundException("cloth mask");
        bridge.matchPlayerBase=low?AssetDatabase.LoadAssetAtPath<Texture2D>(Base)??throw new FileNotFoundException(Base):null;EditorUtility.SetDirty(bridge);EditorSceneManager.SaveScene(scene);
        return "match mesh="+mesh.name+" mask="+bridge.clothMask.name+" base="+(bridge.matchPlayerBase!=null?bridge.matchPlayerBase.name:"Player.mat")+" vertices="+mesh.vertexCount+" triangles="+mesh.triangles.Length/3+" hash="+LowPolyDiagnostics.MeshHash(mesh).Substring(0,12);
    }
}
#endif

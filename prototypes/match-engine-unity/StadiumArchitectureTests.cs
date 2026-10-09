#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using System.Reflection;
using UnityEngine;
using Doppel6.Probe;
// Club stadium architecture: determinism, profile isolation, pitch clearance,
// sight lines of the five match cameras, archetype structure, mesh budgets and
// the real ProbeBridge wiring of WorldConfig.teams[].home.
public static class StadiumArchitectureTests {
    [Serializable] class Club {public string id,archetype,signature;public int pieces,reducedPieces,triangles,reducedTriangles,renderers;public float tallest;}
    [Serializable] class Report {public int passed;public string[] checks;public Club[] clubs;}
    static readonly Color Home=new Color(.8f,.1f,.15f),Trim=Color.white;
    static string Shape(ClubStadiumProfile p){return p.Archetype+"/"+p.FacadeMotif+"/"+string.Join(",",p.TierCounts)+"/"+string.Join(",",p.RoofSides)+"/"+p.StandDepth+"/"+p.MastHeight+"/"+p.RoofOverhang+"/"+p.DetailSeed+"/"+p.CornerBuildings;}
    // World-space axis-aligned bounds of one piece.
    static Bounds Of(StadiumPiece p){
        var h=p.shape==StadiumShape.Quad?new Vector3(p.size.x/2,p.size.y/2,.01f):p.shape==StadiumShape.Prism||p.shape==StadiumShape.Dome?new Vector3(p.size.x/2,p.size.y/2,p.size.x/2):p.size/2;
        var b=new Bounds(p.center,Vector3.zero);for(int i=0;i<8;i++)b.Encapsulate(p.center+p.rotation*new Vector3((i&1)==0?-h.x:h.x,(i&2)==0?-h.y:h.y,(i&4)==0?-h.z:h.z));return b;
    }
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
    static (Vector3 position,Vector3 target) Camera(string mode,Vector3 ball,float near){
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

    public static string Run(string repository,string outputFolder=null){
        var checks=new List<string>();var clubs=new List<Club>();void Require(bool ok,string name){if(!ok)throw new Exception("Stadium architecture: "+name);checks.Add(name);}
        var ids=ClubStadiumProfiles.KnownClubIds;Require(ids.Length==48,"all 48 catalogue clubs are planned");
        var identities=new HashSet<int>();        var signatures=new HashSet<string>();var archetypes=new Dictionary<string,StadiumBlueprint>();
        int sightLines=0;
        foreach(var id in ids){
            var profile=ClubStadiumProfiles.Resolve(id);var before=Shape(profile);
            var plan=StadiumArchitecture.Plan(profile,68,44,Home,Trim);var again=StadiumArchitecture.Plan(ClubStadiumProfiles.Resolve(id),68,44,Home,Trim);
            Require(Shape(profile)==before,id+" plan leaves the resolved profile unchanged");
            bool same=plan.Pieces.Count==again.Pieces.Count;for(int i=0;same&&i<plan.Pieces.Count;i++)same=plan.Pieces[i].center==again.Pieces[i].center&&plan.Pieces[i].size==again.Pieces[i].size&&plan.Pieces[i].slot==again.Pieces[i].slot&&plan.Pieces[i].crowdRow==again.Pieces[i].crowdRow;
            Require(same,id+" plan is deterministic");
            Require(plan.Archetype==profile.Archetype,id+" keeps its archetype "+profile.Archetype);
            signatures.Add(plan.Signature());if(!archetypes.ContainsKey(plan.Archetype))archetypes[plan.Archetype]=plan;
            // Nothing but the four thin corner flags stands inside the boards.
            int intruders=0;string intrusion="";foreach(var p in plan.Pieces){if(p.slot==StadiumSlot.Sky||p.slot==StadiumSlot.Ground)continue;var b=Of(p);bool flag=p.group==StadiumBlueprint.Surroundings&&b.size.y<1.6f&&b.size.x<.6f&&b.size.z<.6f;if(!flag&&b.min.y<4&&b.max.x>-34-2.9f&&b.min.x<34+2.9f&&b.max.z>-22-2.9f&&b.min.z<22+2.9f){intruders++;intrusion+=$" {p.group}/{p.slot} {p.center} size={p.size}";}}
            Require(intruders==0,id+" keeps the pitch, boards and goals clear below roof height"+intrusion);
            for(int s=0;s<4;s++)Require(plan.Fronts[s]>=(s<2?22+4.5f:34+5.3f),id+" stand "+s+" front stays behind the boards");
            // Five landscape cameras, near and far, across the pitch: the visible
            // stadium never sits between a camera and its target, nor encloses a camera.
            foreach(var mode in new[]{"follow","wide","sideline","diagonal","goal"})foreach(float near in new[]{0f,60f,100f})foreach(float bx in new[]{-30f,-12f,0f,12f,30f})foreach(float bz in new[]{-15f,0f,15f}){
                var (cam,target)=Camera(mode,new Vector3(bx,0,bz),near);var shown=Shown(plan,cam);
                foreach(var p in plan.Pieces){if(p.slot==StadiumSlot.Sky||p.slot==StadiumSlot.Ground||p.slot==StadiumSlot.Water||p.group<4&&!shown[p.group])continue;
                    if(Blocks(p,cam,target+Vector3.up*.8f))throw new Exception($"Stadium architecture: {id} {p.group}/{p.slot} blocks {mode} near={near} ball=({bx},{bz})");
                    if(Of(p).Contains(cam))throw new Exception($"Stadium architecture: {id} camera {mode} inside {p.slot}");}
                sightLines++;
            }
            var reduced=StadiumArchitecture.Plan(ClubStadiumProfiles.Resolve(id),68,44,Home,Trim,false);
            Require(reduced.Pieces.Count<plan.Pieces.Count&&reduced.Count(StadiumSlot.Crowd)==plan.Count(StadiumSlot.Crowd)&&reduced.Count(StadiumSlot.Roof)==plan.Count(StadiumSlot.Roof),id+" reduced quality drops details, keeps crowd and roofs");
            int tris=Triangles(plan,out int renderers),reducedTris=Triangles(reduced,out _);
            Require(tris<90000&&reducedTris<60000&&renderers<=60,id+" stays within the triangle and renderer budget");
            // Club identity: accent panels only on camera-facing sides, kept in reduced quality; banners are detail.
            Require(plan.Identity>=0&&plan.Identity<StadiumArchitecture.IdentityPatterns.Length&&plan.Identity==again.Identity,id+" has a stable identity pattern "+StadiumArchitecture.IdentityPatterns[plan.Identity]);
            Require(plan.Count(StadiumSlot.Accent,1)==0&&plan.Count(StadiumSlot.Accent,StadiumBlueprint.Surroundings)==0&&plan.Count(StadiumSlot.Accent,0)>0,id+" shows its accent pattern facing the cameras, not on the hidden near stand");
            Require(reduced.Count(StadiumSlot.Accent,0)>0&&reduced.Count(StadiumSlot.Accent)<plan.Count(StadiumSlot.Accent),id+" reduced quality keeps the wall pattern and a shallower choreography");
            identities.Add(plan.Identity);
            var large=StadiumArchitecture.Plan(ClubStadiumProfiles.Resolve(id),105,68,Home,Trim);Require(large.Fronts[0]>=34+4.5f&&large.Fronts[2]>=52.5f+5.3f,id+" scales its stands with a large pitch");
            float tallest=0;for(int g=0;g<4;g++)tallest=Mathf.Max(tallest,plan.Top(g));
            clubs.Add(new Club{id=id,archetype=plan.Archetype,signature=plan.Signature(),pieces=plan.Pieces.Count,reducedPieces=reduced.Pieces.Count,triangles=tris,reducedTriangles=reducedTris,renderers=renderers,tallest=tallest});
        }
        Require(identities.Count>=5,"club identity patterns differ across the catalogue ("+identities.Count+" patterns)");
        Require(StadiumArchitecture.AccentOf(new Color(.8f,.1f,.1f),new Color(.78f,.12f,.1f))!=new Color(.78f,.12f,.1f)&&StadiumArchitecture.AccentOf(new Color(.8f,.1f,.1f),Color.white)==Color.white,"accent falls back to white or ink when the trim is too close to the home colour");
        Require(sightLines==48*5*3*15,"all camera sight lines checked ("+sightLines+")");
        Require(signatures.Count==48,"every club has its own structural signature");
        foreach(var a in StadiumArchitecture.Archetypes)Require(archetypes.ContainsKey(a),"archetype "+a+" is used by the catalogue");
        // Visible structure, not colour: each archetype has its own building elements.
        int StandSlot(StadiumBlueprint p,StadiumSlot slot){int n=0;for(int g=0;g<4;g++)n+=p.Count(slot,g);return n;}
        Require(StandSlot(archetypes["modern-ring"],StadiumSlot.Glass)>0&&StandSlot(archetypes["modern-ring"],StadiumSlot.Lamp)>0,"modern ring: hospitality glass band and roof light rails");
        Require(StandSlot(archetypes["civic-bowl"],StadiumSlot.Crowd)>StandSlot(archetypes["industrial-shed"],StadiumSlot.Crowd),"civic bowl: filled corners hold more spectators than open shed corners");
        Require(StandSlot(archetypes["industrial-shed"],StadiumSlot.Steel)>40,"industrial shed: front columns and lattice trusses");
        Require(archetypes["dockside-ground"].Count(StadiumSlot.Water)>0,"dockside: harbour water and cranes beyond the end");
        Require(StandSlot(archetypes["garden-ground"],StadiumSlot.Grass)>0,"garden ground: grass banks on open sides");
        Require(archetypes["hillside-ground"].Count(StadiumSlot.Grass,StadiumBlueprint.Surroundings)>0,"hillside: hills behind the ground");
        Require(archetypes["urban-court"].Fronts[0]<archetypes["civic-bowl"].Fronts[0]&&archetypes["urban-court"].Count(StadiumSlot.Brick,StadiumBlueprint.Surroundings)>0,"urban court: tighter stands inside city blocks");
        Require(archetypes["sun-terraces"].Count(StadiumSlot.Roof)>=4,"sun terraces: separate shade sails");
        var patterns=new HashSet<int>();foreach(var p in archetypes.Values)patterns.Add(p.PitchPattern*100+p.PitchStripes);Require(patterns.Count>=6,"pitch mowing differs between archetypes");
        var unknown=StadiumArchitecture.Plan(ClubStadiumProfiles.Resolve("XYZ-9"),68,44,Home,Trim);Require(unknown.Pieces.Count>0&&unknown.Archetype=="garden-ground","an unknown club gets the documented neutral ground");
        // Mesh output: finite, consistent and with outward faces where tested.
        var sample=StadiumArchitecture.Plan(ClubStadiumProfiles.Resolve("ENG-2"),68,44,Home,Trim);bool valid=true;
        for(int g=0;g<StadiumBlueprint.Groups;g++)foreach(StadiumSlot slot in Enum.GetValues(typeof(StadiumSlot))){var mesh=StadiumArchitecture.BuildMesh(sample,g,slot);if(mesh==null)continue;
            valid&=mesh.triangles.Length%3==0&&mesh.normals.Length==mesh.vertexCount&&mesh.uv.Length==mesh.vertexCount&&mesh.colors.Length==mesh.vertexCount&&!float.IsNaN(mesh.bounds.size.x);UnityEngine.Object.DestroyImmediate(mesh);}
        Require(valid,"combined meshes carry normals, metre UVs and vertex shading");
        {
            var box=new StadiumPiece{slot=StadiumSlot.Concrete,shape=StadiumShape.Box,center=Vector3.zero,size=Vector3.one,rotation=Quaternion.Euler(10,30,0),tint=Color.white};var p=new StadiumBlueprint();p.Pieces.Add(box);
            var mesh=StadiumArchitecture.BuildMesh(p,0,StadiumSlot.Concrete);var v=mesh.vertices;var n=mesh.normals;var t=mesh.triangles;bool outward=true;
            for(int i=0;i<t.Length;i+=3){var c=Vector3.Cross(v[t[i+1]]-v[t[i]],v[t[i+2]]-v[t[i]]);outward&=Vector3.Dot(c,n[t[i]])>0&&Vector3.Dot((v[t[i]]+v[t[i+1]]+v[t[i+2]])/3,n[t[i]])>0;}
            UnityEngine.Object.DestroyImmediate(mesh);Require(outward,"box faces wind outward for Unity front faces");
        }
        BridgeWiring(repository,Require);
        var json=JsonUtility.ToJson(new Report{passed=checks.Count,checks=checks.ToArray(),clubs=clubs.ToArray()},true);
        var folder=Path.Combine(repository,outputFolder??"outputs/3d-quality/unity");Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,"stadium-architecture-tests.json"),json);
        return "passed="+checks.Count;
    }

    // The actual renderer resolves the stadium of the team flagged home.
    static void BridgeWiring(string repository,Action<bool,string> Require){
        var flags=BindingFlags.NonPublic|BindingFlags.Instance;var scene=UnityEditor.SceneManagement.EditorSceneManager.NewPreviewScene();var created=new List<UnityEngine.Object>();
        var camera=UnityEngine.Camera.main;var cameraFar=camera!=null?camera.farClipPlane:0;
        bool log=Debug.unityLogger.logEnabled;
        try{
            GameObject Make(string name,PrimitiveType? type=null){var go=type.HasValue?GameObject.CreatePrimitive(type.Value):new GameObject(name);go.name=name;UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(go,scene);created.Add(go);return go;}
            ProbeBridge Build(string home,string away,bool homeFirst,string quality){
                var config=JsonUtility.FromJson<WorldConfig>(File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json")));
                config.teams[0].id=home;config.teams[1].id=away;config.teams[0].home=homeFirst;config.teams[1].home=!homeFirst;config.quality=quality;
                var bridge=Make("D6 stadium wiring test").AddComponent<ProbeBridge>();
                void Field(string name,object value)=>typeof(ProbeBridge).GetField(name,flags).SetValue(bridge,value);
                Field("worldView",new WorldViewState(config));var world=Make("D6 stadium test world").transform;Field("world",world);
                Field("ballView",Make("D6 ball",PrimitiveType.Sphere).transform);Field("ballShadow",Make("D6 ball shadow",PrimitiveType.Cylinder).transform);
                typeof(ProbeBridge).GetMethod("BuildStadium",flags).Invoke(bridge,null);return bridge;
            }
            // Edit-mode harness: Object.Destroy of primitive colliders only logs.
            Debug.unityLogger.logEnabled=false;
            var a=Build("ENG-2","ITA-1",true,"standard");var b=Build("ENG-2","ITA-1",false,"standard");var r=Build("ESP-3","GER-1",true,"reduced");
            Debug.unityLogger.logEnabled=log;
            Require(a.StadiumClub=="ENG-2"&&a.StadiumArchetype=="modern-ring","bridge builds the home club's stadium (ENG-2 modern ring)");
            Require(b.StadiumClub=="ITA-1"&&b.StadiumArchetype=="industrial-shed","swapped home flag swaps the stadium (ITA-1 industrial shed)");
            Require(r.ReducedQuality&&r.StadiumPlan!=null&&!r.StadiumPlan.Detailed,"reduced page quality builds the reduced stadium detail");
            var meshes=(List<Mesh>)typeof(ProbeBridge).GetField("stadiumMeshes",flags).GetValue(a);var textures=(List<Texture2D>)typeof(ProbeBridge).GetField("stadiumTextures",flags).GetValue(a);
            Require(meshes.Count>10&&meshes.Count<=60&&textures.Count>=10,"meshes and textures are tracked for disposal ("+meshes.Count+" meshes, "+textures.Count+" textures)");
            var sides=(Transform[])typeof(ProbeBridge).GetField("standSides",flags).GetValue(a);Require(Array.TrueForAll(sides,s=>s!=null&&s.childCount>0),"all four stand sides own their renderers");
            var update=typeof(ProbeBridge).GetMethod("UpdateStadiumVisibility",flags);
            update.Invoke(a,new object[]{new Vector3(0,21,40)});Require(!a.StandShown(1)&&a.StandShown(0)&&a.StandShown(2)&&a.StandShown(3),"TV camera hides only the near stand");
            update.Invoke(a,new object[]{new Vector3(-55,19,9)});Require(!a.StandShown(2)&&a.StandShown(1),"behind-goal camera hides the end stand it stands in");
            var crowd=(Material)typeof(ProbeBridge).GetField("crowdMaterial",flags).GetValue(a);var updateCrowd=typeof(ProbeBridge).GetMethod("UpdateCrowd",flags);
            var frame=new WorldFrame{celebrating=true,celebrationTime=.11};updateCrowd.Invoke(a,new object[]{frame});var first=crowd.GetTextureOffset("_BaseMap");updateCrowd.Invoke(a,new object[]{frame});
            Require(first.y>0&&crowd.GetTextureOffset("_BaseMap")==first,"crowd lift follows the received celebration time only");
            frame.celebrating=false;updateCrowd.Invoke(a,new object[]{frame});Require(crowd.GetTextureOffset("_BaseMap")==Vector2.zero,"crowd rests outside a booked goal");
            // Restore in reverse: each bridge saved the lighting it found.
            foreach(var bridge in new[]{r,b,a}){foreach(var m in (List<Mesh>)typeof(ProbeBridge).GetField("stadiumMeshes",flags).GetValue(bridge))UnityEngine.Object.DestroyImmediate(m);foreach(var t in (List<Texture2D>)typeof(ProbeBridge).GetField("stadiumTextures",flags).GetValue(bridge))UnityEngine.Object.DestroyImmediate(t);foreach(var m in (List<Material>)typeof(ProbeBridge).GetField("materials",flags).GetValue(bridge))UnityEngine.Object.DestroyImmediate(m);
                typeof(ProbeBridge).GetMethod("RestoreProbeLighting",flags).Invoke(bridge,null);}
        }finally{
            Debug.unityLogger.logEnabled=log;foreach(var o in created)if(o!=null)UnityEngine.Object.DestroyImmediate(o);UnityEditor.SceneManagement.EditorSceneManager.ClosePreviewScene(scene);if(camera!=null)camera.farClipPlane=cameraFar;
        }
    }
}
#endif

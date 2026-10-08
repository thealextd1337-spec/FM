using System;
using System.Collections.Generic;
using UnityEngine;
namespace Doppel6.Probe {
public partial class ProbeBridge {
    WorldViewPlayback playback;WorldFrame displayed;Transform[] labelHeads;double lastProjectionAt=-1;
    float[] runSpeeds;double[] animationTimes;
    FootballLocomotion[] worldLocomotion;
    WorldBallMotion worldBallMotion;
    [Serializable] class WorldMarker {public string id;public float x,y,depth;public bool visible,featured;}
    [Serializable] class WorldRenderedPose {public string id,clip,baseClip,kind,motion;public double time,stridePhase;public bool contact,reachable;public float contactError,plantError,actionWeight,speed;}
    WorldRenderedPose[] renderedPoses;
    [Serializable] class WorldProjection {public string channel=WorldViewState.Schema,kind="projection",session;public int sequence;public double clock,ballSpinDegrees;public int width,height;public float[] ballRotation;public WorldMarker[] markers;public WorldRenderedPose[] poses;}
    void InitWorldPresentation(){
        playback=new WorldViewPlayback();playback.Receive(worldView.Frame,Time.realtimeSinceStartupAsDouble);worldBallMotion=new WorldBallMotion();displayed=null;lastProjectionAt=-1;
        labelHeads=new Transform[actors.Count];runSpeeds=new float[actors.Count];animationTimes=new double[actors.Count];renderedPoses=new WorldRenderedPose[actors.Count];
        worldLocomotion=new FootballLocomotion[actors.Count];for(int i=0;i<actors.Count;i++)worldLocomotion[i]=new FootballLocomotion();
        for(int i=0;i<actors.Count;i++)foreach(var t in actors[i].GetComponentsInChildren<Transform>())if(t.name=="mixamorig:Head")labelHeads[i]=t;
        DecorateWorldPitch();BuildStadium();
    }
    void SendWorldProjection(){
        if(worldView==null||displayed==null)return;
        var now=Time.realtimeSinceStartupAsDouble;if(now-lastProjectionAt<1.0/30)return;lastProjectionAt=now;
        var camera=Camera.main;var markers=new WorldMarker[actors.Count];
        for(int i=0;i<markers.Length;i++){
            var anchor=(labelHeads[i]!=null?labelHeads[i].position:actors[i].position+Vector3.up*1.85f)+Vector3.up*.18f;
            var p=camera.WorldToViewportPoint(anchor);var identity=worldActors[i].id;
            markers[i]=new WorldMarker{id=identity,x=p.x,y=1-p.y,depth=p.z,visible=p.z>0&&p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1,featured=identity==displayed.owner||Vector3.Distance(actors[i].position,ballView.position)<3.5f};
        }
        var rotation=ballView.rotation;
        var json=JsonUtility.ToJson(new WorldProjection{session=worldView.Config.session,sequence=displayed.sequence,clock=displayed.clock,width=Screen.width,height=Screen.height,markers=markers,poses=renderedPoses,ballRotation=new[]{rotation.x,rotation.y,rotation.z,rotation.w},ballSpinDegrees=worldBallMotion.SpinDegrees});
        #if UNITY_WEBGL && !UNITY_EDITOR
        D6ProbeSend(json);
        #endif
    }
    void PitchRing(string name,Vector3 centre,float radius,Material material){
        const int count=96;var vertices=new Vector3[count*2];var triangles=new int[count*6];
        for(int i=0;i<count;i++){
            var angle=i*Mathf.PI*2/count;var direction=new Vector3(Mathf.Cos(angle),0,Mathf.Sin(angle));vertices[i*2]=centre+direction*(radius-.055f);vertices[i*2+1]=centre+direction*(radius+.055f);
            int n=i*6,a=i*2,b=(i+1)%count*2;triangles[n]=a;triangles[n+1]=b;triangles[n+2]=a+1;triangles[n+3]=a+1;triangles[n+4]=b;triangles[n+5]=b+1;
        }
        var mesh=new Mesh{name=name};mesh.vertices=vertices;mesh.triangles=triangles;mesh.RecalculateNormals();mesh.RecalculateBounds();netMeshes.Add(mesh);
        var go=new GameObject(name,typeof(MeshFilter),typeof(MeshRenderer));go.transform.SetParent(world,false);go.GetComponent<MeshFilter>().sharedMesh=mesh;go.GetComponent<MeshRenderer>().sharedMaterial=material;
    }
    void PitchSpot(string name,Vector3 at,Material material){
        var go=GameObject.CreatePrimitive(PrimitiveType.Cylinder);go.name=name;go.transform.SetParent(world,false);go.transform.position=at;go.transform.localScale=new Vector3(.24f,.01f,.24f);go.GetComponent<Renderer>().sharedMaterial=material;Destroy(go.GetComponent<Collider>());
    }
    void DecorateWorldPitch(){
        var g=worldView.Config.geometry;var line=Mat(new Color(.94f,.95f,.9f));
        PitchRing("Centre circle",new Vector3(0,.02f,0),(float)Math.Min(6,g.width*.14),line);PitchSpot("Centre spot",new Vector3(0,.025f,0),line);
        float depth=(float)Math.Min(4.5,g.penaltyDepth*.38),width=(float)Math.Min(g.goalWidth+5,g.penaltyWidth*.65);
        foreach(int sign in new[]{-1,1}){
            float goal=sign*(float)g.length/2;Box("Goal area front",new Vector3(goal-sign*depth,.018f,0),new Vector3(.1f,.02f,width),line);
            foreach(int side in new[]{-1,1})Box("Goal area side",new Vector3(goal-sign*depth/2,.018f,side*width/2),new Vector3(depth,.02f,.1f),line);
            PitchSpot("Penalty spot",new Vector3(goal-sign*(float)g.penaltyDepth*.72f,.025f,0),line);
        }
        // Shallow contact shadows ground the figures without adding shadow maps.
        var shade=Mat(new Color(.1f,.22f,.14f));for(int i=0;i<rings.Count;i++){rings[i].localScale=new Vector3(.62f,.004f,.62f);rings[i].GetComponent<Renderer>().sharedMaterial=shade;}
        var converted=new HashSet<Material>();foreach(var grassRenderer in world.GetComponentsInChildren<MeshRenderer>())if(grassRenderer.name=="Grass"&&converted.Add(grassRenderer.sharedMaterial))grassRenderer.sharedMaterial.SetColor("_BaseColor",grassRenderer.sharedMaterial.GetColor("_BaseColor").linear);
        var centres=new List<Vector3>{Vector3.up,Vector3.down};float y=1/Mathf.Sqrt(5),r=2/Mathf.Sqrt(5);
        for(int i=0;i<5;i++){float a=i*Mathf.PI*2/5;centres.Add(new Vector3(Mathf.Cos(a)*r,y,Mathf.Sin(a)*r));centres.Add(new Vector3(Mathf.Cos(a+Mathf.PI/5)*r,-y,Mathf.Sin(a+Mathf.PI/5)*r));}
        // Use the existing URP material's vertex-independent texture path.
        var texture=new Texture2D(256,128,TextureFormat.RGB24,false);var pixels=new Color[256*128];
        for(int yy=0;yy<128;yy++)for(int xx=0;xx<256;xx++){float u=(xx+.5f)/256,v=(yy+.5f)/128;var p=new Vector3(-Mathf.Cos(u*Mathf.PI*2)*Mathf.Sin(v*Mathf.PI),-Mathf.Cos(v*Mathf.PI),Mathf.Sin(u*Mathf.PI*2)*Mathf.Sin(v*Mathf.PI));float best=-1;foreach(var c in centres)best=Math.Max(best,Vector3.Dot(p,c));pixels[yy*256+xx]=best>.935f?new Color(.07f,.09f,.11f):new Color(.95f,.95f,.91f);}
        texture.SetPixels(pixels);texture.Apply(false,true);texture.wrapMode=TextureWrapMode.Repeat;worldBallTexture=texture;
        var ballMaterial=Mat(Color.white);ballMaterial.SetTexture("_BaseMap",texture);ballView.GetComponent<Renderer>().sharedMaterial=ballMaterial;
        ballShadow.localScale=new Vector3(.31f,.003f,.31f);
    }
    Texture2D worldBallTexture;
    void ClearWorldPresentation(){ClearStadium();if(worldBallTexture!=null)Destroy(worldBallTexture);worldBallTexture=null;playback=null;displayed=null;labelHeads=null;}
}
}

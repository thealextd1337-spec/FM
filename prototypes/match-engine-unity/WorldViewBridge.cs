using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Animations;
using UnityEngine.Playables;
namespace Doppel6.Probe {
public partial class ProbeBridge {
    public Shader matchKitShader;
    public Texture2D clothMask;
    public Mesh matchPlayerMesh;
    WorldViewState worldView;
    WorldPose[] worldActors;
    readonly Dictionary<string,Material> kitMaterials=new Dictionary<string,Material>();
    double lastWorldClock=-1;
    bool liveNetMoved;
    [Serializable] class WorldReply {public string channel=WorldViewState.Schema,kind,session,message;public int sequence,players;public double clock;public string[] ids;}
    void ReplyWorld(string kind,int sequence=0,string error=null){
        var f=worldView?.Frame;var ids=new string[worldActors?.Length??0];for(int i=0;i<ids.Length;i++)ids[i]=worldActors[i].id;
        var json=JsonUtility.ToJson(new WorldReply{kind=kind,sequence=sequence,session=worldView?.Config.session,message=error,players=ids.Length,ids=ids,clock=f?.clock??0});
        #if UNITY_WEBGL && !UNITY_EDITOR
        D6ProbeSend(json);
        #else
        if(error!=null)Debug.LogWarning(json);
        #endif
    }
    public void WorldCommand(string json){
        try{
            var command=JsonUtility.FromJson<WorldCommand>(json);
            if(command?.kind=="load"){
                // Validate the entire message before disposing the visible world.
                var candidate=new WorldViewState(command.config);
                if(matchKitShader==null||clothMask==null||matchPlayerMesh==null)throw new InvalidOperationException("Match view assets are unavailable");
                worldView=candidate;simulation=null;accumulator=0;worldActors=worldView.Frame.players;BuildWorld();InitWorldPresentation();lastWorldClock=-1;RenderWorld();ReplyWorld("ack",candidate.Frame.sequence);
            }else if(command?.kind=="frame"&&worldView!=null){
                if(worldView.Accept(command.frame)){
                    bool changed=worldActors.Length!=command.frame.players.Length;
                    for(int i=0;!changed&&i<worldActors.Length;i++)changed=worldActors[i].id!=command.frame.players[i].id;
                    worldActors=command.frame.players;if(changed){BuildWorld();InitWorldPresentation();lastWorldClock=-1;}else playback.Receive(command.frame,Time.realtimeSinceStartupAsDouble);
                    RenderWorld();
                }
                ReplyWorld("ack",command.frame.sequence);
            }else throw new ArgumentException("Unsupported match view command");
        }catch(Exception e){ReplyWorld("error",error:e.Message);}
    }
    Actor BuildActor(int i){
        if(worldView==null)return i<simulation.State.actors.Length?simulation.State.actors[i]:null;
        var pose=worldActors[i];var p=worldView.Players[pose.id];return new Actor{id=p.id,team=p.team,role=p.keeper?"keeper":"player",position=pose.position,velocity=new double[3]};
    }
    Material WorldMaterial(int i){
        if(worldView==null)return playerMaterial;
        var p=worldView.Players[worldActors[i].id];var key=p.team+":"+p.keeper+":"+p.skin+":"+p.hair+":"+p.number;
        if(kitMaterials.TryGetValue(key,out var cached))return cached;
        var material=new Material(matchKitShader);material.SetTexture("_BaseMap",playerMaterial.GetTexture("_BaseMap"));material.SetTexture("_ClothMask",clothMask);
        Color ColorOf(string code){ColorUtility.TryParseHtmlString(code,out var c);return c.linear;}
        material.SetColor("_Main",ColorOf(p.kit.main));material.SetColor("_Trim",ColorOf(p.kit.trim));material.SetColor("_Accent",ColorOf(p.kit.accent));
        material.SetFloat("_Style",Math.Max(0,Array.IndexOf(new[]{"plain","stripe","stripes","hoops","halves","pinstripes","diagonal"},p.kit.style)));
        var skins=new Dictionary<string,string>{{"fair","#e9b996"},{"light","#d6a17c"},{"warm","#c28b60"},{"medium","#ad7550"},{"brown","#895638"},{"deep","#67442e"}};
        var hair=new Dictionary<string,string>{{"black","#242329"},{"dark-brown","#332922"},{"brown","#58402d"},{"light-brown","#876445"},{"blond","#bca177"},{"auburn","#a25e35"},{"gray","#96918a"}};
        material.SetColor("_Skin",ColorOf(skins.TryGetValue(p.skin??"",out var skin)?skin:skins["warm"]));material.SetColor("_Hair",ColorOf(hair.TryGetValue(p.hair??"",out var h)?h:hair["brown"]));
        // The received squad number, in whichever kit colour (or white/ink)
        // contrasts most with both the shirt and its pattern. Keepers get gloves.
        Color Srgb(string code){ColorUtility.TryParseHtmlString(code,out var c);return c;}
        var number=KitNumberColors(Srgb(p.kit.main),Srgb(p.kit.trim),Srgb(p.kit.accent),p.kit.style);
        material.SetFloat("_Number",p.number>0?p.number:-1);material.SetColor("_NumberColor",number.ink.linear);material.SetColor("_NumberEdge",number.edge.linear);
        material.SetFloat("_Keeper",p.keeper?1:0);material.SetColor("_Glove",(Contrast(Srgb(p.kit.trim),Srgb(p.kit.main))>=2.2f?Srgb(p.kit.trim):new Color(.95f,.95f,.93f)).linear);
        kitMaterials.Add(key,material);materials.Add(material);return material;
    }
    static float Luminance(Color c){float L(float v)=>v<=.04045f?v/12.92f:Mathf.Pow((v+.055f)/1.055f,2.4f);return .2126f*L(c.r)+.7152f*L(c.g)+.0722f*L(c.b);}
    public static float Contrast(Color a,Color b){float x=Luminance(a),y=Luminance(b);return (Mathf.Max(x,y)+.05f)/(Mathf.Min(x,y)+.05f);}
    // sRGB inputs. A patterned shirt needs the number to read on both colours.
    public static (Color ink,Color edge) KitNumberColors(Color main,Color trim,Color accent,string style){
        bool patterned=!string.IsNullOrEmpty(style)&&style!="plain"&&style!="solid";
        var candidates=new[]{trim,accent,new Color(.96f,.96f,.94f),new Color(.07f,.08f,.10f)};Color best=candidates[0];float score=-1;
        foreach(var c in candidates){float s=patterned?Mathf.Min(Contrast(c,main),Contrast(c,trim)*1.35f):Contrast(c,main);if(s>score+.15f){score=s;best=c;}}
        var edge=Luminance(best)>.35f?new Color(.06f,.07f,.09f):new Color(.95f,.95f,.93f);return (best,edge);
    }
    void WorldMesh(GameObject go){
        if(worldView==null)return;
        foreach(var r in go.GetComponentsInChildren<SkinnedMeshRenderer>())r.sharedMesh=matchPlayerMesh;
    }
    void RenderWorld(){
        if(worldView==null||world==null||playback==null)return;var f=playback.Sample(Time.realtimeSinceStartupAsDouble);displayed=f;var camera=Camera.main;
        camera.aspect=Screen.height>0?(float)Screen.width/Screen.height:camera.aspect;
        camera.fieldOfView=(float)f.camera.fov;camera.transform.position=V(f.camera.position);camera.transform.LookAt(V(f.camera.target));UpdateStadiumVisibility(camera.transform.position);
        worldBallMotion.Sample(f);ballView.rotation=worldBallMotion.Rotation;
        var ball=V(f.ball);ball.y=DisplayHeight(f.ball[1]);ballView.position=ball;ballView.gameObject.SetActive(f.ballOpacity>.01);ballShadow.position=new Vector3(ballView.position.x,.045f,ballView.position.z);
        for(int i=0;i<f.players.Length;i++){
            var p=f.players[i];var identity=worldView.Players[p.id];var position=V(p.position);position.y=football[i].RootHeight;
            float movement=lastWorldClock>=0&&f.clock>lastWorldClock?Vector3.ProjectOnPlane(position-actors[i].position,Vector3.up).magnitude/(float)(f.clock-lastWorldClock):0;
            if(lastWorldClock>=0&&f.clock>lastWorldClock)runSpeeds[i]=movement;
            actors[i].position=position;rings[i].position=new Vector3(position.x,.02f,position.z);
            var direction=V(p.facing);direction.y=0;if(direction.sqrMagnitude>.0001)actors[i].rotation=Quaternion.LookRotation(direction);
            var desired=runSpeeds[i]>.2?runClip:identity.keeper?keeperClip:idleClip;
            if(lastWorldClock<0||f.clock<lastWorldClock)animationTimes[i]=f.clock;
            if(lastWorldClock>=0&&f.clock>lastWorldClock)animationTimes[i]+=(f.clock-lastWorldClock)*Math.Clamp(runSpeeds[i]/3.2,.5,1.65);
            var pose=WorldFootballPose(p,f,i);football[i].Sample(pose,f.clock,lastWorldClock<0||f.clock<lastWorldClock);
            renderedPoses[i]=new WorldRenderedPose{id=p.id,clip=pose.clip.name,baseClip=pose.baseClip?.name,kind=pose.kind,time=pose.time,contact=pose.contact,reachable=football[i].rig.reachable,contactError=football[i].rig.contactError,plantError=football[i].rig.plantError,actionWeight=football[i].Weight(pose.clip),speed=worldLocomotion[i].Speed,motion=worldLocomotion[i].Mode,stridePhase=worldLocomotion[i].StridePhase};
        }
        RenderWorldNet(f.netActive?f.net:null);lastWorldClock=f.clock;
    }
    void RenderWorldNet(WorldNet net){
        if(net==null&&!liveNetMoved)return;
        netMaxDeformation=0;
        foreach(var view in netViews){
            Array.Copy(view.rest,view.vertices,view.rest.Length);
            if(net!=null&&view.goalSign==net.sign){
                var g=worldView.Config.geometry;
                // A display deformation derived from the native recorded goal picture.
                // Fixed edges stay attached; it never applies an impulse to the ball.
                for(int i=0;i<view.rest.Length;i++){
                    var p=view.rest[i];if(view.tags[i]!="back")continue;
                    var anchor=Math.Sin(Math.PI*Math.Clamp(p.y/g.goalHeight,0,1))*Math.Sin(Math.PI*Math.Clamp((p.z+g.goalWidth/2)/g.goalWidth,0,1));
                    var distance=(p.z-net.z)*(p.z-net.z)+(p.y-net.height)*(p.y-net.height);
                    var tail=net.age>.6?.16*Math.Exp(-(net.age-.6)*2.2)*Math.Sin((net.age-.6)*17):0;
                    var displacement=(float)((net.bulge*.75+tail)*Math.Exp(-distance/5)*anchor);
                    view.vertices[i].x+=view.goalSign*displacement;netMaxDeformation=Math.Max(netMaxDeformation,Math.Abs(displacement));
                }
            }
            view.mesh.vertices=view.vertices;view.mesh.RecalculateBounds();view.mesh.RecalculateNormals();
        }
        liveNetMoved=net!=null;
    }
}
}

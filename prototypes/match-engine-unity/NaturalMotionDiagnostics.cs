#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using System.Globalization;
using System.Reflection;
using UnityEngine;
using UnityEngine.Playables;
using Doppel6.Probe;
// Natural-motion evidence on the actual rig through ProbeBridge.WorldCommand.
// Controlled fixtures are hand-built 20 Hz native-shaped pictures (labelled
// origin=controlled); native cases replay actual captured native pictures
// (native-motion/*.json, origin=native). Pictures are blended to 60 Hz with
// the real WorldViewPlayback.Blend, exactly like the live display buffer, and
// sent as exact (paused) pictures. Only the presentation is measured; no
// native data, clock or rule is produced here. Uses existing bridge members
// only, so the same suite measures the baseline and the candidate.
public static class NaturalMotionDiagnostics {
    const BindingFlags Flags=BindingFlags.Instance|BindingFlags.NonPublic|BindingFlags.Public;
    static readonly CultureInfo Inv=CultureInfo.InvariantCulture;
    [Serializable] public class Window {public string name;public int frames,stanceFrames,moving;public float soleMinAction,speedMean,glideMean,glideP90,glideMax,glideRatio,footAxisMean,footAxisMax,footHipsMean,footHipsMax,kneePoleMean,kneePoleMax,chestMean,chestMax,pelvisMean,soleMin,thighStepMax,thighStepP99,hipsYawStepMax,jointSpeedMax,lockOffsetMax;public float handHeadMin,supportDropMax,supportGlideMean,supportGlideRatio,supportGlideP90;public int supportFrames;public int soleBelow,doubleFloatSlow,turnStarts,clipChanges,familySwitches,handsHigh;public float turnStartsPerSecond,familySwitchesPerSecond;public string thighStepAt,jointSpeedAt,soleMinAt,glideMaxAt,doubleFloatAt,handAt;public float seconds;}
    [Serializable] public class Case {public string name,group,origin,note;public int rate=60;public float travel,speed,facing;public string[] clips;public Window whole,start,cruise,stop;public string poseHash;}
    [Serializable] public class Check {public string name;public bool passed;public double value,limit;}
    [Serializable] public class Report {public string label,sourceId,unity,device,note,gateNote;public Case[] cases;public Check[] determinism,gates;public string[] images,recordings;}
    sealed class Sample {public double clock;public Vector3 root,facing,travel;public float speed;public Vector3[] ankle=new Vector3[2],toe=new Vector3[2],knee=new Vector3[2],thigh=new Vector3[2];public float[] ankleClear=new float[2],toeClear=new float[2],supportClear=new float[2];public Vector3 head,shoulderMid;public Vector3[] hand=new Vector3[2];public float supportDrop,solePredicted=float.NaN;public Quaternion[] rot;public Vector3 hipsRight,chestRight;public string clip,mode,stride,action,soleBone,lockState;public double phase;public float sole=float.NaN,lockOffset=-1;public bool moving;}
    // ---- bridge access -------------------------------------------------
    static ProbeBridge bridge;static string raw;static int sequence;static bool logState;
    static T Field<T>(string name)=>(T)typeof(ProbeBridge).GetField(name,Flags).GetValue(bridge);
    static void Send(WorldCommand c){Debug.unityLogger.logEnabled=false;try{bridge.WorldCommand(JsonUtility.ToJson(c));}finally{Debug.unityLogger.logEnabled=logState;}}
    static void Drop(){var world=Field<Transform>("world");if(world!=null)UnityEngine.Object.DestroyImmediate(world.gameObject);}
    // Indices 0-7 are the measured joints of the joint-speed check; arms, head and hands are posture only.
    static readonly string[] Bones={"Hips","LeftUpLeg","RightUpLeg","LeftLeg","RightLeg","LeftFoot","RightFoot","Spine2","LeftArm","RightArm","Head","LeftHand","RightHand"};
    // ---- fixture pictures ------------------------------------------------
    sealed class Track {public double[] clock;public Vector3[] position,facing;public bool owner;public Func<double,Vector3,Vector3,double[]> ball;}
    static WorldConfig Config(string session){
        var config=JsonUtility.FromJson<WorldConfig>(raw);config.session=session;config.initial.session=session;config.initial.phase="paused";config.initial.sequence=sequence=1;config.initial.clock=10;config.initial.owner="";config.quality="standard";
        // Everyone else stands still, well away from the measured player.
        for(int i=0;i<config.initial.players.Length;i++){var p=config.initial.players[i];p.position=new double[]{-24+i*4.0,0,17};p.facing=new double[]{1,0,0};p.action="idle";p.actionId="idle";p.moving=false;p.contactPoint=null;}
        config.initial.ball=new double[]{20,.29,18};return config;
    }
    static double[] D(Vector3 v)=>new double[]{v.x,v.y,v.z};
    static Vector3 V(double[] p)=>new Vector3((float)p[0],(float)p[1],(float)p[2]);
    // Plays native-shaped 20 Hz pictures through the real display blend at 60 Hz.
    // rate: display frames per second (60 by default; 30 and 120 check other
    // render cadences of the same received pictures).
    static IEnumerable<WorldFrame> Display(List<WorldFrame> pictures,int rate=60){
        yield return pictures[0];double start=pictures[0].clock,end=pictures[pictures.Count-1].clock;int k=1;
        for(int n=1;start+n/(double)rate<=end+1e-9;n++){double t=start+n/(double)rate;while(k<pictures.Count-1&&pictures[k].clock<t-1e-9)k++;
            var a=pictures[k-1];var b=pictures[k];double span=b.clock-a.clock;yield return WorldViewPlayback.Blend(a,b,span>0?Math.Clamp((t-a.clock)/span,0,1):1);}
    }
    static WorldFrame Picture(WorldFrame template,double clock){var f=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(template));f.clock=clock;f.phase="live";return f;}
    static Vector3 Facing(float degrees)=>Quaternion.AngleAxis(degrees,Vector3.up)*Vector3.right;
    // Speed profile: idle, linear acceleration, cruise, linear braking, idle.
    static List<(double t,Vector3 p,Vector3 f)> Straight(float travel,float speed,float facing,double idle=.6,double accel=.5,double cruise=2,double brake=.5,double rest=.8){
        var list=new List<(double,Vector3,Vector3)>();var dir=Facing(facing+travel);var face=Facing(facing);double total=idle+accel+cruise+brake+rest;var p=Vector3.zero;
        float Speed(double t){if(t<idle)return 0;t-=idle;if(t<accel)return (float)(speed*t/accel);t-=accel;if(t<cruise)return speed;t-=cruise;if(t<brake)return (float)(speed*(1-t/brake));return 0;}
        for(double t=0;t<=total+1e-9;t+=.05){list.Add((t,p,face));p+=dir*(Speed(t)+Speed(t+.05))*.5f*.05f;}
        return list;
    }
    // ---- measuring -----------------------------------------------------
    static Transform[] BoneSet(Transform actor){var all=actor.GetComponentsInChildren<Transform>();return Array.ConvertAll(Bones,n=>Array.Find(all,t=>t.name=="mixamorig:"+n));}
    static Sample Measure(int index,Transform actor,FootballAnimation anim,FootballLocomotion loco,WorldFrame frame,Sample last,bool sole){
        var b=BoneSet(actor);var s=new Sample{clock=frame.clock,root=actor.position,facing=V(frame.players[index].facing)};s.facing.y=0;s.facing.Normalize();
        float scale=actor.lossyScale.y;
        Transform Toe(int f){var foot=b[5+f];return foot.childCount>0?foot.GetChild(0):foot;}
        for(int f=0;f<2;f++){s.thigh[f]=b[1+f].position;s.knee[f]=b[3+f].position;s.ankle[f]=b[5+f].position;s.toe[f]=Toe(f).position;s.ankleClear[f]=(s.ankle[f].y-actor.position.y)-anim.ground.ankle*scale;s.toeClear[f]=(s.toe[f].y-actor.position.y)-anim.ground.toe*scale;}
        for(int f=0;f<2;f++){s.supportClear[f]=anim.ground.SupportClearance(f);s.hand[f]=b[11+f].position;}s.head=b[10].position;s.shoulderMid=(b[8].position+b[9].position)*.5f;s.supportDrop=anim.SupportDrop;
        s.rot=Array.ConvertAll(b,t=>t.rotation);s.hipsRight=b[2].position-b[1].position;s.chestRight=b[9].position-b[8].position;
        s.mode=loco.Mode;s.stride=loco.StrideMode;s.action=frame.players[index].action;s.phase=loco.Phase;s.speed=loco.Speed;
        var poses=Field<Array>("renderedPoses");var rp=poses?.GetValue(index);if(rp!=null){s.clip=(string)rp.GetType().GetField("clip").GetValue(rp);}
        var lockProp=typeof(FootballAnimation).GetProperty("FootLockOffset");if(lockProp!=null)s.lockOffset=(float)lockProp.GetValue(anim);var stateProp=typeof(FootballAnimation).GetProperty("FootLockState");if(stateProp!=null)s.lockState=(string)stateProp.GetValue(anim);
        if(last!=null&&frame.clock>last.clock){var d=s.root-last.root;d.y=0;s.travel=d/(float)(frame.clock-last.clock);}else s.travel=last?.travel??Vector3.zero;
        s.moving=s.travel.magnitude>.2f;
        if(sole){detail=anim.ground.VertexDetail;s.sole=FootballGround.LowestVertex(actor)+actor.position.y;s.solePredicted=Mathf.Min(anim.ground.SolePointClearance(0),anim.ground.SolePointClearance(1));if(s.sole< -.01f)s.soleBone=LowestBone(actor)+" predicted="+s.solePredicted.ToString("0.0000",Inv)+" rootY="+actor.position.y.ToString("0.0000",Inv)+" sole="+anim.ground.Sole.ToString("0.0000",Inv)+" contour="+anim.ground.SolePointCount(0)+"/"+anim.ground.SolePointCount(1)+" skins="+actor.GetComponentsInChildren<SkinnedMeshRenderer>().Length+" weights="+actor.GetComponentInChildren<SkinnedMeshRenderer>().sharedMesh.boneWeights.Length+" readable="+actor.GetComponentInChildren<SkinnedMeshRenderer>().sharedMesh.isReadable;}
        return s;
    }
    // Bone carrying the lowest skinned vertex (diagnostics of a sole below the turf).
    static Func<int,string> detail;
    static string LowestBone(Transform actor){
        string best=null;float lowest=float.MaxValue;var mesh=new Mesh();int at=-1;
        foreach(var r in actor.GetComponentsInChildren<SkinnedMeshRenderer>()){if(r.sharedMesh==null)continue;r.BakeMesh(mesh,false);var v=mesh.vertices;var weights=r.sharedMesh.boneWeights;
            for(int i=0;i<v.Length;i++){float y=(r.transform.position+r.transform.rotation*v[i]).y;if(y<lowest&&i<weights.Length){lowest=y;var b=weights[i];best=r.bones[b.boneIndex0]?.name;at=i;}}}
        UnityEngine.Object.DestroyImmediate(mesh);var g=actor.GetComponentInChildren<SkinnedMeshRenderer>();return best+" vertex="+at+" standing="+(FootballGround.standing.TryGetValue(at,out var h)?h.ToString("0.000",Inv):"?")+" "+detail?.Invoke(at)+" quality="+g.quality;
    }
    static float Yaw(Vector3 v){v.y=0;return Mathf.Atan2(v.x,v.z)*Mathf.Rad2Deg;}
    static float Diff(float a,float b){return Mathf.Abs(Mathf.DeltaAngle(a,b));}
    static Vector3 ForwardOf(Vector3 right){var f=Vector3.Cross(right,Vector3.up);f.y=0;return f.sqrMagnitude>1e-8f?f.normalized:Vector3.forward;}
    static bool Loco(string action)=>string.IsNullOrEmpty(action)||action=="idle"||action=="run"||action=="running";
    static Window Summarise(string name,List<Sample> all,int from,int to,bool locomotionOnly=false){
        var w=new Window{name=name,soleMin=float.MaxValue,soleMinAction=float.MaxValue,handHeadMin=float.MaxValue};var glides=new List<float>();var supportGlides=new List<float>();var thigh=new List<float>();double speedSum=0;float footAxis=0,footHips=0,knee=0,chest=0,pelvis=0;int footN=0,chestN=0;
        string lastClip=null,lastFamily=null;double lastPhase=-1;string lastMode=null;double movingSeconds=0;
        for(int i=Math.Max(1,from);i<Math.Min(all.Count,to);i++){
            var s=all[i];var p=all[i-1];double dt=s.clock-p.clock;if(dt<=0||dt>.04)continue;
            // A received position jump (restart, reset) is a cut, not motion.
            var jump=s.root-p.root;jump.y=0;if(jump.magnitude>.4f)continue;
            if(locomotionOnly&&!(Loco(s.action)&&Loco(p.action)))continue;w.frames++;speedSum+=s.travel.magnitude;if(s.moving){w.moving++;movingSeconds+=dt;}
            var hipsForward=ForwardOf(s.hipsRight);var chestForward=ForwardOf(s.chestRight);
            if(s.moving){float c=Diff(Yaw(chestForward),Yaw(s.facing));chest+=c;chestN++;w.chestMax=Mathf.Max(w.chestMax,c);pelvis+=Mathf.DeltaAngle(Yaw(s.facing),Yaw(hipsForward));}
            for(int f=0;f<2;f++){
                bool stance=Mathf.Min(s.ankleClear[f],s.toeClear[f])<.03f&&Mathf.Min(p.ankleClear[f],p.toeClear[f])<.03f;
                if(stance&&s.moving){
                    // The part of the sole that is lowest carries the contact.
                    Vector3 a=s.toeClear[f]<s.ankleClear[f]?s.toe[f]:s.ankle[f],b=s.toeClear[f]<s.ankleClear[f]?p.toe[f]:p.ankle[f];var d=a-b;d.y=0;float g=d.magnitude/(float)dt;
                    var e=s.toe[f]-p.toe[f];e.y=0;var h=s.ankle[f]-p.ankle[f];h.y=0;g=Mathf.Min(g,Mathf.Min(e.magnitude,h.magnitude)/(float)dt);glides.Add(g);w.stanceFrames++;
                    // Support foot: the weight-bearing sole is the lower one (or both within 1 cm); a low swing foot is no stance.
                    if(s.supportClear[f]<=s.supportClear[1-f]+.01f&&p.supportClear[f]<=p.supportClear[1-f]+.01f){supportGlides.Add(g);w.supportFrames++;}if(g>w.glideMax){w.glideMax=g;w.glideMaxAt=(f==0?"left ":"right ")+Context(p,s);}
                    var foot=s.toe[f]-s.ankle[f];foot.y=0;
                    if(foot.sqrMagnitude>1e-6f&&s.travel.sqrMagnitude>.04f){float axis=Diff(Yaw(foot),Yaw(s.travel));axis=Mathf.Min(axis,180-axis);footAxis+=axis;w.footAxisMax=Mathf.Max(w.footAxisMax,axis);float fh=Diff(Yaw(foot),Yaw(hipsForward));footHips+=fh;w.footHipsMax=Mathf.Max(w.footHipsMax,fh);
                        // Knee pole: the knee's bend direction off the hip-ankle line against the foot direction.
                        var line=s.ankle[f]-s.thigh[f];var off=Vector3.ProjectOnPlane(s.knee[f]-s.thigh[f],line.normalized);off.y=0;
                        if(off.magnitude>.02f){float kp=Diff(Yaw(off),Yaw(foot));knee+=kp;w.kneePoleMax=Mathf.Max(w.kneePoleMax,kp);}else knee+=0;
                        footN++;}
                }
            }
            if(s.moving&&s.travel.magnitude<1.9f&&s.supportClear[0]>.03f&&s.supportClear[1]>.03f){w.doubleFloatSlow++;if(w.doubleFloatAt==null)w.doubleFloatAt=Context(p,s)+" L"+s.supportClear[0].ToString("0.000",Inv)+" R"+s.supportClear[1].ToString("0.000",Inv);}
            w.supportDropMax=Mathf.Max(w.supportDropMax,s.supportDrop);
            // Hands: a moving locomotion body never holds a hand at its face or above its shoulders.
            if(s.moving&&Loco(s.action)){for(int f=0;f<2;f++){float d=Vector3.Distance(s.hand[f],s.head);if(d<w.handHeadMin){w.handHeadMin=d;}bool high=s.hand[f].y>s.shoulderMid.y;if(high){w.handsHigh++;if(w.handAt==null)w.handAt=(f==0?"left ":"right ")+Context(p,s);}}}
            if(!float.IsNaN(s.sole)){bool locomotion=string.IsNullOrEmpty(s.action)||s.action=="idle"||s.action=="run"||s.action=="running";if(locomotion){if(s.sole<w.soleMin){w.soleMin=s.sole;w.soleMinAt=Context(p,s)+" lowest="+s.soleBone;}if(s.sole< -.01f)w.soleBelow++;}else w.soleMinAction=Mathf.Min(w.soleMinAction,s.sole);}
            float step=Mathf.Max(Quaternion.Angle(s.rot[1],p.rot[1]),Quaternion.Angle(s.rot[2],p.rot[2]));thigh.Add(step);if(step>w.thighStepMax){w.thighStepMax=step;w.thighStepAt=Context(p,s);}w.seconds+=(float)dt;
            w.hipsYawStepMax=Mathf.Max(w.hipsYawStepMax,Diff(Yaw(ForwardOf(s.hipsRight)),Yaw(ForwardOf(p.hipsRight))));
            for(int k=0;k<8;k++){float js=Quaternion.Angle(s.rot[k],p.rot[k])/(float)dt;if(js>w.jointSpeedMax){w.jointSpeedMax=js;w.jointSpeedAt=Bones[k]+" "+Context(p,s);}}
            w.lockOffsetMax=Mathf.Max(w.lockOffsetMax,s.lockOffset);
            // A turn start: entering a turn mode, or a turn whose phase restarts.
            bool turn=s.mode!=null&&s.mode.StartsWith("turn-");if(turn&&(lastMode==null||!lastMode.StartsWith("turn-")||s.phase<lastPhase-1e-6||s.mode!=lastMode))w.turnStarts++;
            lastMode=s.mode;lastPhase=s.phase;
            if(lastClip!=null&&s.clip!=lastClip)w.clipChanges++;lastClip=s.clip;
            string family=s.stride=="back"?"back":s.stride=="side"?"side":s.stride=="idle"?lastFamily:"forward";if(lastFamily!=null&&family!=null&&family!=lastFamily)w.familySwitches++;if(family!=null)lastFamily=family;
        }
        if(w.frames>0)w.speedMean=(float)(speedSum/w.frames);
        if(glides.Count>0){glides.Sort();float sum=0;foreach(var g in glides)sum+=g;w.glideMean=sum/glides.Count;w.glideP90=glides[(int)(glides.Count*.9f)];w.glideRatio=w.speedMean>.2f?w.glideMean/w.speedMean:0;}
        if(supportGlides.Count>0){supportGlides.Sort();float sum=0;foreach(var g in supportGlides)sum+=g;w.supportGlideMean=sum/supportGlides.Count;w.supportGlideP90=supportGlides[(int)(supportGlides.Count*.9f)];w.supportGlideRatio=w.speedMean>.2f?w.supportGlideMean/w.speedMean:0;}
        if(thigh.Count>0){thigh.Sort();w.thighStepP99=thigh[Math.Min(thigh.Count-1,(int)(thigh.Count*.99f))];}
        if(footN>0){w.footAxisMean=footAxis/footN;w.footHipsMean=footHips/footN;w.kneePoleMean=knee/footN;}
        if(chestN>0){w.chestMean=chest/chestN;w.pelvisMean=pelvis/chestN;}
        // JSON has no NaN: -9 marks an unmeasured sole.
        if(w.soleMin==float.MaxValue)w.soleMin=-9;if(w.handHeadMin==float.MaxValue)w.handHeadMin=-9;if(w.soleMinAction==float.MaxValue)w.soleMinAction=-9;
        w.turnStartsPerSecond=movingSeconds>0?(float)(w.turnStarts/movingSeconds):0;w.familySwitchesPerSecond=movingSeconds>0?(float)(w.familySwitches/movingSeconds):0;
        return w;
    }
    static string Context(Sample p,Sample s){return s.clock.ToString("0.000",Inv)+" "+p.clip+"/"+p.mode+"/"+p.action+" -> "+s.clip+"/"+s.mode+"/"+s.action+" v="+s.travel.magnitude.ToString("0.0",Inv)+" lock "+p.lockState+" -> "+s.lockState;}
    static string Hash(Transform actor){var sb=new System.Text.StringBuilder();foreach(var t in actor.GetComponentsInChildren<Transform>()){var q=t.localRotation;var p=t.localPosition;sb.Append(Math.Round(q.x,5)).Append(',').Append(Math.Round(q.y,5)).Append(',').Append(Math.Round(q.z,5)).Append(',').Append(Math.Round(q.w,5)).Append(';').Append(Math.Round(p.x,5)).Append(',').Append(Math.Round(p.y,5)).Append(',').Append(Math.Round(p.z,5)).Append('|');}
        using(var sha=System.Security.Cryptography.SHA256.Create())return BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(sb.ToString()))).Replace("-","").Substring(0,16).ToLowerInvariant();}
    // ---- rendering -----------------------------------------------------
    static string folder;static readonly List<string> images=new List<string>(),recordings=new List<string>();
    static Texture2D Capture(int w,int h){
        var camera=Camera.main;var baked=new List<(SkinnedMeshRenderer skin,GameObject go,Mesh mesh)>();
        foreach(var skin in UnityEngine.Object.FindObjectsByType<SkinnedMeshRenderer>(FindObjectsSortMode.None)){
            if(!skin.enabled||!skin.gameObject.activeInHierarchy)continue;
            var mesh=new Mesh();skin.BakeMesh(mesh);var go=new GameObject("D6 motion capture",typeof(MeshFilter),typeof(MeshRenderer));go.transform.SetParent(skin.transform,false);
            go.GetComponent<MeshFilter>().sharedMesh=mesh;var renderer=go.GetComponent<MeshRenderer>();renderer.sharedMaterials=skin.sharedMaterials;renderer.shadowCastingMode=skin.shadowCastingMode;skin.enabled=false;baked.Add((skin,go,mesh));
        }
        var rt=RenderTexture.GetTemporary(w,h,24,RenderTextureFormat.ARGB32);float aspect=camera.aspect;camera.aspect=(float)w/h;camera.targetTexture=rt;camera.Render();camera.targetTexture=null;camera.aspect=aspect;
        var previous=RenderTexture.active;RenderTexture.active=rt;var tex=new Texture2D(w,h,TextureFormat.RGB24,false);tex.ReadPixels(new Rect(0,0,w,h),0,0);tex.Apply();RenderTexture.active=previous;RenderTexture.ReleaseTemporary(rt);
        foreach(var item in baked){item.skin.enabled=true;UnityEngine.Object.DestroyImmediate(item.go);UnityEngine.Object.DestroyImmediate(item.mesh);}
        return tex;
    }
    // A close chase camera: the body's front-right three-quarter view.
    static WorldCamera Chase(Vector3 subject,Vector3 facing,float distance=8.5f){
        var right=Vector3.Cross(Vector3.up,facing).normalized;var target=subject+Vector3.up*1.2f;var eye=target+(facing*.55f+right*.85f).normalized*distance+Vector3.up*1.1f;
        return new WorldCamera{position=D(eye),target=D(target),fov=34};
    }
    // Minimal animated GIF (fixed 6x7x6 palette, ordered dither, LZW).
    static void Gif(string path,List<Color32[]> frames,int w,int h,int delay){
        using var s=new FileStream(path,FileMode.Create);void B(params byte[] v)=>s.Write(v,0,v.Length);void U(int v){s.WriteByte((byte)(v&255));s.WriteByte((byte)(v>>8));}
        B((byte)'G',(byte)'I',(byte)'F',(byte)'8',(byte)'9',(byte)'a');U(w);U(h);B(0xF7,0,0);
        for(int i=0;i<256;i++){if(i<252){int r=i/42,g=i/6%7,b=i%6;B((byte)(r*51),(byte)(g*255/6),(byte)(b*51));}else B(0,0,0);}
        B(0x21,0xFF,0x0B);foreach(var c in "NETSCAPE2.0")s.WriteByte((byte)c);B(3,1,0,0,0);
        int[] bayer={0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5};
        foreach(var px in frames){
            B(0x21,0xF9,4,0);U(delay);B(0,0);B(0x2C);U(0);U(0);U(w);U(h);B(0);
            var idx=new byte[w*h];
            for(int y=0;y<h;y++)for(int x=0;x<w;x++){var c=px[(h-1-y)*w+x];float d=(bayer[(y&3)*4+(x&3)]+.5f)/16f-.5f;int r=Mathf.Clamp(Mathf.RoundToInt(c.r/51f+d),0,5),g=Mathf.Clamp(Mathf.RoundToInt(c.g*6/255f+d),0,6),b=Mathf.Clamp(Mathf.RoundToInt(c.b/51f+d),0,5);idx[y*w+x]=(byte)(r*42+g*6+b);}
            s.WriteByte(8);Lzw(idx,s);
        }
        s.WriteByte(0x3B);
    }
    static void Lzw(byte[] data,Stream s){
        const int min=8;int clear=1<<min,eoi=clear+1,size=min+1,next=eoi+1;var table=new Dictionary<int,int>();int buffer=0,bits=0;var block=new List<byte>(255);
        void Flush(){if(block.Count==0)return;s.WriteByte((byte)block.Count);s.Write(block.ToArray(),0,block.Count);block.Clear();}
        void Emit(int code){buffer|=code<<bits;bits+=size;while(bits>=8){block.Add((byte)(buffer&255));buffer>>=8;bits-=8;if(block.Count==255)Flush();}}
        Emit(clear);int prefix=data[0];
        for(int i=1;i<data.Length;i++){
            int k=data[i],key=(prefix<<8)|k;
            if(table.TryGetValue(key,out var code)){prefix=code;continue;}
            Emit(prefix);
            if(next==4096){Emit(clear);table.Clear();next=eoi+1;size=min+1;}
            else{if(next>=(1<<size))size++;table[key]=next++;}
            prefix=k;
        }
        Emit(prefix);Emit(eoi);if(bits>0)block.Add((byte)(buffer&255));Flush();s.WriteByte(0);
    }
    // ---- running one fixture ----------------------------------------------
    sealed class Pass {public List<Sample> samples=new List<Sample>();public List<string> hashes=new List<string>();public HashSet<string> clips=new HashSet<string>();}
    // pictures: native-shaped 20 Hz frames. capture: frame indices (60 Hz) to render; record: GIF frame list.
    static Pass Play(WorldConfig config,List<WorldFrame> pictures,int subject,bool measureSole,Func<int,WorldFrame,bool> capture=null,Action<int,Texture2D> onCapture=null,List<Color32[]> record=null,int recordW=320,int recordH=240,int stopAfter=int.MaxValue,int rate=60){
        Drop();Send(new WorldCommand{kind="load",config=config});
        var actors=Field<List<Transform>>("actors");var football=Field<List<FootballAnimation>>("football");var loco=Field<FootballLocomotion[]>("worldLocomotion");
        var run=new Pass();Sample last=null;int frame=0;
        foreach(var f in Display(pictures,rate)){
            if(frame>=stopAfter)break;
            var p=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(f));p.sequence=++sequence;p.phase="paused";
            // The chase camera follows the actual rendered player.
            p.camera=Chase(V(p.players[subject].position),V(p.players[subject].facing).sqrMagnitude>.0001f?V(p.players[subject].facing).normalized:Vector3.right);
            Send(new WorldCommand{kind="frame",frame=p});
            var s=Measure(subject,actors[subject],football[subject],loco[subject],p,last,measureSole&&frame%Math.Max(1,rate/30)==0);run.samples.Add(s);if(s.clip!=null)run.clips.Add(s.clip);run.hashes.Add(Hash(actors[subject]));last=s;
            if(capture!=null&&capture(frame,p)){var t=Capture(360,450);onCapture?.Invoke(frame,t);UnityEngine.Object.DestroyImmediate(t);}
            if(record!=null){var t=Capture(recordW,recordH);record.Add(t.GetPixels32());UnityEngine.Object.DestroyImmediate(t);}
            frame++;
        }
        return run;
    }
    static List<WorldFrame> Pictures(WorldConfig config,int subject,List<(double t,Vector3 p,Vector3 f)> path,Vector3 origin,bool owner=false,bool keeperBall=false){
        var list=new List<WorldFrame>();
        foreach(var (t,p,f) in path){
            var w=Picture(config.initial,10+t);var pose=w.players[subject];pose.position=D(origin+p);pose.facing=D(f);pose.moving=true;pose.action="run";pose.actionId="run";
            if(owner){w.owner=pose.id;var dir=list.Count>0?(origin+p-V(list[list.Count-1].players[subject].position)):f;dir.y=0;if(dir.sqrMagnitude<1e-6f)dir=f;dir.Normalize();var ball=origin+p+dir*.55f;ball.y=.29f;w.ball=D(ball);w.ballInFlight=false;}
            list.Add(w);
        }
        return list;
    }
    // ---- cases ---------------------------------------------------------
    [Serializable] class Trace {public string name;public float[] clock,rootX,rootZ,leftX,leftZ,leftClear,rightX,rightZ,rightClear,lockOffset;public string[] clip,mode,lockState;}
    static void WriteTrace(string name,Pass run){
        var S=run.samples;int n=S.Count;var t=new Trace{name=name,clock=new float[n],rootX=new float[n],rootZ=new float[n],leftX=new float[n],leftZ=new float[n],leftClear=new float[n],rightX=new float[n],rightZ=new float[n],rightClear=new float[n],lockOffset=new float[n],clip=new string[n],mode=new string[n],lockState=new string[n]};
        for(int i=0;i<n;i++){var s=S[i];t.clock[i]=(float)s.clock;t.rootX[i]=s.root.x;t.rootZ[i]=s.root.z;t.leftX[i]=s.ankle[0].x;t.leftZ[i]=s.ankle[0].z;t.leftClear[i]=Mathf.Min(s.ankleClear[0],s.toeClear[0]);t.rightX[i]=s.ankle[1].x;t.rightZ[i]=s.ankle[1].z;t.rightClear[i]=Mathf.Min(s.ankleClear[1],s.toeClear[1]);t.lockOffset[i]=s.lockOffset;t.clip[i]=s.clip;t.mode[i]=s.mode;t.lockState[i]=s.lockState;}
        File.WriteAllText(Path.Combine(folder,"trace-"+name+".json"),JsonUtility.ToJson(t));
    }
    static Case Measured(string name,string group,string origin,Pass run,float travel,float speed,float facing,(int a,int b,int c,int d)? windows,string note=null,int rate=60){
        if(rate==60&&name.StartsWith("keeper-shuffle")||rate==60&&(name=="jog-right"||name=="walk-right"||name=="direction-changes"||name=="jog-fwd"||name=="curve-150"||name=="walk-fwd"||name=="walk-back"||name=="jog-left"||name=="jog-back-left"||name=="walk-back-left"||name=="walk-back-right"))WriteTrace(name,run);
        var c=new Case{name=name,group=group,origin=origin,travel=travel,speed=speed,facing=facing,note=note,rate=rate,clips=new List<string>(run.clips).ToArray()};
        c.whole=Summarise("whole",run.samples,0,run.samples.Count);
        if(windows.HasValue){var w=windows.Value;c.start=Summarise("start",run.samples,w.a,w.b);c.cruise=Summarise("cruise",run.samples,w.b,w.c);c.stop=Summarise("stop",run.samples,w.c,w.d);}
        c.poseHash=run.hashes.Count>0?run.hashes[run.hashes.Count-1]:"";return c;
    }
    static int Frame60(double seconds)=>(int)Math.Round(seconds*60);
    // Clip detail on the actual rig: hips and toe paths relative to the actor
    // (root motion stays off), so a clip's portrayed direction is measured.
    [Serializable] public class ClipDetail {public string name;public float length,hipsDriftX,hipsDriftZ,leftStance,rightStance;public float[] time,hipsX,hipsZ,leftX,leftZ,leftClear,rightX,rightZ,rightClear;}
    [Serializable] class ClipDetails {public string sourceId;public ClipDetail[] clips;}
    static void Clips(string folder){
        const string asset="Assets/Doppel6EngineProbe/Art/football-v130.fbx";
        var names=new[]{"keeper_shuffle_meshy","back_walk","back_left","back_right","back_step_meshy","walking","run_fast6","run_fast4","sprint_forward","running","brake_meshy","turn_run_left","turn_run_right","turn_walk_left","turn_walk_right","turn_idle_left","turn_idle_right","turn_sharp_right","idle_ready","idle_relaxed","idle_stand_meshy","keeper_ready_meshy"};
        var all=UnityEditor.AssetDatabase.LoadAllAssetsAtPath(asset);var clips=new List<AnimationClip>();foreach(var n in names){var c=Array.Find(all,a=>a is AnimationClip&&a.name==n) as AnimationClip;if(c!=null)clips.Add(c);}
        var scene=UnityEditor.SceneManagement.EditorSceneManager.NewPreviewScene();var graph=UnityEngine.Playables.PlayableGraph.Create("D6 clip detail");var list=new List<ClipDetail>();
        try{
            var actor=UnityEngine.Object.Instantiate(UnityEditor.AssetDatabase.LoadAssetAtPath<GameObject>(asset));UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(actor,scene);actor.transform.localScale=Vector3.one*1.45f;
            foreach(var skin in actor.GetComponentsInChildren<SkinnedMeshRenderer>())skin.sharedMesh=UnityEditor.AssetDatabase.LoadAssetAtPath<Mesh>("Assets/Doppel6EngineProbe/Art/WorldPlayer.asset");
            var animator=actor.GetComponent<Animator>();if(animator==null)animator=actor.AddComponent<Animator>();animator.applyRootMotion=false;graph.SetTimeUpdateMode(UnityEngine.Playables.DirectorUpdateMode.Manual);
            UnityEngine.Animations.AnimationPlayableOutput.Create(graph,"rig",animator).SetSourcePlayable(UnityEngine.Animations.AnimationClipPlayable.Create(graph,clips[0]));graph.Play();graph.Evaluate(0);
            var anim=new FootballAnimation(graph,actor.transform,clips);actor.transform.position=Vector3.up*anim.RootHeight;var b=BoneSet(actor.transform);
            foreach(var clip in clips){
                const int n=60;var d=new ClipDetail{name=clip.name,length=clip.length,time=new float[n],hipsX=new float[n],hipsZ=new float[n],leftX=new float[n],leftZ=new float[n],leftClear=new float[n],rightX=new float[n],rightZ=new float[n],rightClear=new float[n]};
                for(int s=0;s<n;s++){double t=s*(clip.length-.001)/(n-1);anim.Sample(new FootballAnimation.Pose{clip=clip,time=t,key="detail",loop=false},1000+s,true);var root=actor.transform.position;
                    d.time[s]=(float)t;d.hipsX[s]=b[0].position.x-root.x;d.hipsZ[s]=b[0].position.z-root.z;d.leftX[s]=b[5].position.x-root.x;d.leftZ[s]=b[5].position.z-root.z;d.rightX[s]=b[6].position.x-root.x;d.rightZ[s]=b[6].position.z-root.z;d.leftClear[s]=anim.ground.Clearance(0);d.rightClear[s]=anim.ground.Clearance(1);
                    if(d.leftClear[s]<.03f)d.leftStance+=1f/n;if(d.rightClear[s]<.03f)d.rightStance+=1f/n;}
                d.hipsDriftX=d.hipsX[n-1]-d.hipsX[0];d.hipsDriftZ=d.hipsZ[n-1]-d.hipsZ[0];list.Add(d);
            }
        }finally{if(graph.IsValid())graph.Destroy();UnityEditor.SceneManagement.EditorSceneManager.ClosePreviewScene(scene);}
        File.WriteAllText(Path.Combine(folder,"clip-detail.json"),JsonUtility.ToJson(new ClipDetails{sourceId=ProbeBuildIdentity.SourceId,clips=list.ToArray()},true));
    }
    // enforce: a failed quality gate fails the run (D6Cli -d6gates report only records them).
    public const string EvidenceFolder="outputs/3d-quality/claude-natural-motion-20261010";
    public static string Run(string repository,string outputFolder,string label,bool render,bool enforce=true){
        bridge=UnityEngine.Object.FindFirstObjectByType<ProbeBridge>()??throw new InvalidOperationException("ProbeBridge is missing in the open scene");
        raw=File.ReadAllText(Path.Combine(repository,"outputs/platform/world-unity/contract-fixture.json"));logState=Debug.unityLogger.logEnabled;
        folder=Path.Combine(repository,outputFolder??"outputs/3d-quality/claude-natural-motion-20261010",label);Directory.CreateDirectory(folder);images.Clear();recordings.Clear();
        Clips(folder);
        var cases=new List<Case>();var checks=new List<Check>();void Require(bool ok,string name,double value=0){checks.Add(new Check{name=name,passed=ok,value=value});}
        var baseConfig=Config("natural-motion");int subject=Array.FindIndex(baseConfig.initial.players,p=>{var id=Array.Find(baseConfig.players,q=>q.id==p.id);return !id.keeper&&id.team==0;});
        int keeper=Array.FindIndex(baseConfig.initial.players,p=>Array.Find(baseConfig.players,q=>q.id==p.id).keeper);
        string[] dirNames={"fwd","fwd-right","right","back-right","back","back-left","left","fwd-left"};
        var bands=new[]{("walk",1.4f),("jog",3.0f),("sprint",5.6f)};
        // 1. Eight body-relative directions at three speeds, each through start, cruise and stop.
        foreach(var (band,speed) in bands){
            var sheet=render?new Texture2D(8*240,2*300,TextureFormat.RGB24,false):null;
            for(int d=0;d<8;d++){
                float travel=d*45;if(travel>180)travel-=360;
                var path=Straight(travel,speed,0);var pics=Pictures(baseConfig,subject,path,new Vector3(-6,0,0)-Facing(travel)*(speed*1.2f));
                var run=Play(baseConfig,pics,subject,true);
                // Windows: idle .6, accel .5, cruise 2.0, brake .5.
                var c=Measured(band+"-"+dirNames[d],"directions","controlled",run,travel,speed,0,(Frame60(.5),Frame60(1.5),Frame60(3.1),Frame60(4.4)));cases.Add(c);
                if(render){
                    // Midstance and push frame of the cruise from the measured pass.
                    int mid=-1,push=-1;var S=run.samples;
                    for(int i=Frame60(1.6);i<Frame60(3.0)&&i<S.Count-1;i++){
                        for(int f=0;f<2;f++){
                            float now=Mathf.Min(S[i].ankleClear[f],S[i].toeClear[f]),then=Mathf.Min(S[i+1].ankleClear[f],S[i+1].toeClear[f]);
                            var hipsMid=(S[i].thigh[0]+S[i].thigh[1])*.5f;var off=S[i].ankle[f]-hipsMid;off.y=0;
                            if(mid<0&&now<.03f&&off.magnitude<.12f)mid=i;
                            if(push<0&&mid>=0&&i>mid+3&&now<.03f&&then>=.03f)push=i;
                        }
                        if(mid>=0&&push>=0)break;
                    }
                    if(mid<0)mid=Frame60(2.0);if(push<0)push=mid+6;int col=d;
                    var again=Play(baseConfig,pics,subject,false,(i,p)=>i==mid||i==push,(i,t)=>{var small=Scale(t,240,300);sheet.SetPixels(col*240,i==mid?300:0,240,300,small.GetPixels());UnityEngine.Object.DestroyImmediate(small);});
                    bool same=true;for(int i=0;i<run.hashes.Count&&i<again.hashes.Count;i++)same&=run.hashes[i]==again.hashes[i];
                    Require(same&&run.hashes.Count==again.hashes.Count,"identical replay of "+c.name+" gives identical rig poses",run.hashes.Count);
                }
            }
            if(render){sheet.Apply();var name="directions-"+band+".png";File.WriteAllBytes(Path.Combine(folder,name),sheet.EncodeToPNG());images.Add(name);UnityEngine.Object.DestroyImmediate(sheet);}
        }
        // 2. Steady curves at 3.5 m/s: facing follows the tangent.
        foreach(float rate in new[]{90f,150f,250f}){
            var path=new List<(double,Vector3,Vector3)>();var p=Vector3.zero;float heading=0;
            for(double t=0;t<=4.6+1e-9;t+=.05){
                float v=t<.4?0:t<.9?(float)(3.5*(t-.4)/.5):3.5f;bool turning=t>=1.3&&t<4.3;
                path.Add((t,p,Facing(heading)));if(turning)heading+=rate*.05f;p+=Facing(heading)*v*.05f;
            }
            var pics=Pictures(baseConfig,subject,path,new Vector3(-8,0,-4));var run=Play(baseConfig,pics,subject,false);
            cases.Add(Measured("curve-"+rate,"curves","controlled",run,0,3.5f,0,(Frame60(.9),Frame60(1.8),Frame60(4.2),Frame60(4.6)),"cruise window = steady curve after 0.5 s of turning"));
        }
        // 3. Noisy travel around the old 117 degree backward boundary.
        {
            var path=new List<(double,Vector3,Vector3)>();var p=Vector3.zero;
            for(double t=0;t<=4+1e-9;t+=.05){float v=t<.4?0:t<.8?(float)(2.6*(t-.4)/.4):2.6f;float travel=117+9*(float)Math.Sin(2*Math.PI*1.3*t)+5*(float)Math.Sin(2*Math.PI*3.1*t+1);path.Add((t,p,Facing(0)));p+=Facing(travel)*v*.05f;}
            var pics=Pictures(baseConfig,subject,path,new Vector3(-2,0,-6));var run=Play(baseConfig,pics,subject,false);
            cases.Add(Measured("noise-117","boundary","controlled",run,117,2.6f,0,(Frame60(.8),Frame60(1.2),Frame60(4),Frame60(4)),"travel 117 deg +-9/+-5 deg deterministic noise, facing fixed"));
        }
        // 4. Two real direction changes while jogging: forward, cut right, reverse back-left.
        List<WorldFrame> changes;
        {
            var path=new List<(double,Vector3,Vector3)>();var p=Vector3.zero;float heading=0,face=0;
            for(double t=0;t<=5.2+1e-9;t+=.05){
                float v=t<.4?0:t<.8?(float)(3.2*(t-.4)/.4):t<4.4?3.2f:t<4.8?(float)(3.2*(4.8-t)/.4):0;
                float target=t<1.8?0:t<3.1?90:-150;heading=target;face=Mathf.MoveTowardsAngle(face,target,(t<3.1?360:500)*.05f);
                path.Add((t,p,Facing(face)));p+=Facing(heading)*v*.05f;
            }
            changes=Pictures(baseConfig,subject,path,new Vector3(-8,0,-2));var run=Play(baseConfig,changes,subject,true);
            cases.Add(Measured("direction-changes","changes","controlled",run,0,3.2f,0,(Frame60(1.7),Frame60(1.9),Frame60(3.0),Frame60(3.5)),"start=first cut window, cruise=between cuts, stop=second cut (reverse) window"));
        }
        // 5. Sprint stop.
        {
            var path=Straight(0,6.2f,0,cruise:1.4,brake:.6,rest:1.0);var pics=Pictures(baseConfig,subject,path,new Vector3(-14,0,0));var run=Play(baseConfig,pics,subject,true);
            cases.Add(Measured("sprint-stop","transitions","controlled",run,0,6.2f,0,(Frame60(.5),Frame60(1.5),Frame60(2.5),Frame60(3.7))));
        }
        // 6. Diagonal and straight dribbling: the carrier reach every stride.
        foreach(float travel in new[]{0f,45f,-45f}){
            var path=Straight(travel,3.0f,0,cruise:2.4);var pics=Pictures(baseConfig,subject,path,new Vector3(-8,0,0),owner:true);var run=Play(baseConfig,pics,subject,false);
            cases.Add(Measured("carrier-"+(travel==0?"straight":travel>0?"diag-right":"diag-left"),"carrier","controlled",run,travel,3,0,(Frame60(.5),Frame60(1.5),Frame60(3.5),Frame60(4.8))));
        }
        // 7. Keeper side steps: left, right, left (two direction changes), slow and quick.
        foreach(float speed in new[]{1.1f,2.2f}){
            var path=new List<(double,Vector3,Vector3)>();var p=Vector3.zero;
            for(double t=0;t<=4.8+1e-9;t+=.05){float v=t<.5?0:t<4.1?speed:0;float side=t<1.7?90:t<2.9?-90:90;path.Add((t,p,Facing(0)));p+=Facing(-side)*v*.05f;}
            var pics=Pictures(baseConfig,keeper,path,new Vector3(-29,0,0));var run=Play(baseConfig,pics,keeper,true);
            cases.Add(Measured("keeper-shuffle-"+speed.ToString("0.0",Inv),"keeper","controlled",run,-90,speed,0,(Frame60(.4),Frame60(.9),Frame60(4.1),Frame60(4.8)),"left (+Z for facing +X) 1.2 s, right 1.2 s, left 1.2 s"));
        }
        // 7b. The same received pictures at 30 and 120 display frames per second.
        foreach(int rate in new[]{30,120}){
            int F(double seconds)=>(int)Math.Round(seconds*rate);
            foreach(var (name,travel,speed) in new[]{("walk-right",90f,1.4f),("jog-right",90f,3.0f),("walk-back-left",-135f,1.4f),("jog-back-left",-135f,3.0f),("jog-fwd",0f,3.0f),("sprint-fwd",0f,5.6f)}){
                var pics=Pictures(baseConfig,subject,Straight(travel,speed,0),new Vector3(-6,0,0)-Facing(travel)*(speed*1.2f));var run=Play(baseConfig,pics,subject,true,rate:rate);
                cases.Add(Measured(name,"cadence","controlled",run,travel,speed,0,(F(.5),F(1.5),F(3.1),F(4.4)),rate+" Hz display of the same 20 Hz pictures",rate));
            }
            {var path=new List<(double,Vector3,Vector3)>();var p=Vector3.zero;float heading=0;for(double t=0;t<=4.6+1e-9;t+=.05){float v=t<.4?0:t<.9?(float)(3.5*(t-.4)/.5):3.5f;path.Add((t,p,Facing(heading)));if(t>=1.3&&t<4.3)heading+=150*.05f;p+=Facing(heading)*v*.05f;}
             var run=Play(baseConfig,Pictures(baseConfig,subject,path,new Vector3(-8,0,-4)),subject,false,rate:rate);cases.Add(Measured("curve-150","cadence","controlled",run,0,3.5f,0,(F(.9),F(1.8),F(4.2),F(4.6)),rate+" Hz display",rate));}
            {var run=Play(baseConfig,changes,subject,true,rate:rate);cases.Add(Measured("direction-changes","cadence","controlled",run,0,3.2f,0,(F(1.7),F(1.9),F(3.0),F(3.5)),rate+" Hz display",rate));}
            {var path=new List<(double,Vector3,Vector3)>();var p=Vector3.zero;for(double t=0;t<=4.8+1e-9;t+=.05){float v=t<.5?0:t<4.1?1.1f:0;float side=t<1.7?90:t<2.9?-90:90;path.Add((t,p,Facing(0)));p+=Facing(-side)*v*.05f;}
             var run=Play(baseConfig,Pictures(baseConfig,keeper,path,new Vector3(-29,0,0)),keeper,true,rate:rate);cases.Add(Measured("keeper-shuffle-1.1","cadence","controlled",run,-90,1.1f,0,(F(.4),F(.9),F(4.1),F(4.8)),rate+" Hz display",rate));}
        }
        // 8. Pause and seek on the direction-change fixture.
        {
            var a=Play(baseConfig,changes,subject,false,stopAfter:Frame60(2.4));
            var actors=Field<List<Transform>>("actors");var actor=actors[subject];var held=Hash(actor);
            var last=Field<WorldFrame>("displayed");
            for(int k=0;k<3;k++){var same=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(last));same.sequence=++sequence;Send(new WorldCommand{kind="frame",frame=same});}
            Require(Hash(actor)==held,"a paused native clock keeps the exact rig pose (3 repeated pictures)");
            // Seek back to 1.0 s and replay 1.2 s twice; both must match.
            var display=new List<WorldFrame>(Display(changes));
            List<string> Seek(){var hashes=new List<string>();for(int i=Frame60(1.0);i<Frame60(2.2);i++){var f=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(display[i]));f.sequence=++sequence;f.phase="paused";Send(new WorldCommand{kind="frame",frame=f});hashes.Add(Hash(actor));}return hashes;}
            var first=Seek();var more=Play(baseConfig,changes,subject,false,stopAfter:Frame60(3.6));actor=Field<List<Transform>>("actors")[subject];var second=Seek();
            bool equal=first.Count==second.Count;for(int i=0;equal&&i<first.Count;i++)equal&=first[i]==second[i];
            Require(equal,"replay seek to the same native time from different states yields identical rig poses",first.Count);
        }
        // 9. Recordings (normal = 20 fps of the 60 Hz view, slow = every 60 Hz frame at 20 fps).
        if(render){
            void Record(string name,WorldConfig config,List<WorldFrame> pics,int who){
                var frames=new List<Color32[]>();Play(config,pics,who,false,record:frames);
                var normal=new List<Color32[]>();for(int i=0;i<frames.Count;i+=3)normal.Add(frames[i]);
                Gif(Path.Combine(folder,name+"-normal.gif"),normal,320,240,5);Gif(Path.Combine(folder,name+"-slow.gif"),frames,320,240,5);recordings.Add(name+"-normal.gif");recordings.Add(name+"-slow.gif");
                // Filmstrip: 16 evenly spaced frames (4 x 4) of the same recording.
                var strip=new Texture2D(4*320,4*240,TextureFormat.RGB24,false);for(int k=0;k<16;k++){var px=frames[Math.Min(frames.Count-1,k*(frames.Count-1)/15)];strip.SetPixels32((k%4)*320,(3-k/4)*240,320,240,px);}strip.Apply();File.WriteAllBytes(Path.Combine(folder,name+"-strip.png"),strip.EncodeToPNG());images.Add(name+"-strip.png");UnityEngine.Object.DestroyImmediate(strip);
            }
            Record("jog-right",baseConfig,Pictures(baseConfig,subject,Straight(90,3,0),new Vector3(-6,0,0)-Facing(90)*3.6f),subject);
            Record("jog-back-left",baseConfig,Pictures(baseConfig,subject,Straight(-135,3,0),new Vector3(-6,0,0)-Facing(-135)*3.6f),subject);
            Record("walk-fwd-left",baseConfig,Pictures(baseConfig,subject,Straight(-45,1.4f,0),new Vector3(-6,0,0)-Facing(-45)*1.7f),subject);
            Record("direction-changes",baseConfig,changes,subject);
            {var path=new List<(double,Vector3,Vector3)>();var p=Vector3.zero;float heading=0;for(double t=0;t<=4.6+1e-9;t+=.05){float v=t<.4?0:t<.9?(float)(3.5*(t-.4)/.5):3.5f;path.Add((t,p,Facing(heading)));if(t>=1.3&&t<4.3)heading+=150*.05f;p+=Facing(heading)*v*.05f;}Record("curve-150",baseConfig,Pictures(baseConfig,subject,path,new Vector3(-8,0,-4)),subject);}
            {var path=new List<(double,Vector3,Vector3)>();var p=Vector3.zero;for(double t=0;t<=4.8+1e-9;t+=.05){float v=t<.5?0:t<4.1?1.1f:0;float side=t<1.7?90:t<2.9?-90:90;path.Add((t,p,Facing(0)));p+=Facing(-side)*v*.05f;}Record("keeper-shuffle",baseConfig,Pictures(baseConfig,keeper,path,new Vector3(-29,0,0)),keeper);}
            Record("carrier-diagonal",baseConfig,Pictures(baseConfig,subject,Straight(45,3,0,cruise:2.4),new Vector3(-8,0,0),owner:true),subject);
            Record("jog-stop",baseConfig,Pictures(baseConfig,subject,Straight(0,3,0),new Vector3(-8,0,0)),subject);
        }
        // 10. Actual native pictures (captured seeded matches), all field players.
        // Captured native pictures: the output folder's own native-motion, else the evidence folder of this iteration.
        var nativeFolder=Path.Combine(repository,outputFolder??EvidenceFolder,"native-motion");if(!Directory.Exists(nativeFolder))nativeFolder=Path.Combine(repository,EvidenceFolder,"native-motion");
        foreach(var file in Directory.Exists(nativeFolder)?Directory.GetFiles(nativeFolder,"motion-*.json"):new string[0]){
            if(file.EndsWith(".meta.json"))continue;cases.AddRange(Native(file));
        }
        var gates=Gates(cases);
        var report=new Report{gateNote=GateNote,gates=gates.ToArray(),label=label,sourceId=ProbeBuildIdentity.SourceId,unity=Application.unityVersion,device=SystemInfo.graphicsDeviceType.ToString(),note="Controlled cases are hand-built native-shaped 20 Hz pictures; native cases replay actual captured native pictures. Both are blended to 60 Hz by WorldViewPlayback.Blend and rendered through ProbeBridge.WorldCommand on the actual rig. Glide: horizontal world speed of the lowest sole point while it is within 3 cm of the standing sole height (supportGlide: only while it is also the lower, weight-bearing foot; a low swing foot is excluded); foot axis: undirected angle foot/travel; knee pole: knee bend direction vs foot direction; chest: shoulder line forward vs received facing. Editor evidence, not a device or GPU measurement.",cases=cases.ToArray(),determinism=checks.ToArray(),images=images.ToArray(),recordings=recordings.ToArray()};
        File.WriteAllText(Path.Combine(folder,"natural-motion.json"),JsonUtility.ToJson(report,true));
        Drop();
        int failed=checks.FindAll(c=>!c.passed).Count;if(failed>0)throw new Exception(failed+" natural-motion determinism checks failed");
        var failedGates=gates.FindAll(g=>!g.passed);
        if(enforce&&failedGates.Count>0)throw new Exception(failedGates.Count+" natural-motion quality gates failed, first: "+failedGates[0].name+" = "+failedGates[0].value.ToString("0.###",Inv)+" (limit "+failedGates[0].limit.ToString("0.###",Inv)+")");
        return "cases="+cases.Count+" checks="+checks.Count+" gates="+(gates.Count-failedGates.Count)+"/"+gates.Count+" images="+images.Count+" recordings="+recordings.Count;
    }
    // ---- quality gates ---------------------------------------------------
    // Fixed limits on the actual rig, chosen from physical meaning, not from a
    // run: they hold for every controlled case at every display cadence, and
    // for the locomotion pictures of the captured native matches.
    public const float JointSpeedLimit=1600,ThighStepLimit=25,GlideRatioLimit=.15f,GlideLimit=.25f,ChestLimit=15,KneePoleLimit=20,HandHeadLimit=.22f,NativeDoubleFloatPerSecond=.5f;
    const string GateNote="Gates: no skinned sole more than 1 cm below the turf in locomotion; hips/legs/spine joint speed at most 1600 deg/s (about 1.5x the authored sprint cruise) in every window incl. start/stop/turns; thigh change at most 25 deg per 1/60 s; cruise glide of the weight-bearing (lower) sole at most 15 % of the travel speed and 0.25 m/s; no slow (<1.9 m/s) moving frame with both soles (heel, toe base and toe tip) more than 3 cm up in cruise; chest within 15 deg of the received facing and knee pole within 20 deg of the foot on average in cruise; moving hands never above the shoulders or within 0.22 m of the head; steady curves start no turn episode in cruise; the noisy 117 deg boundary switches stride family at most once; captured native locomotion: no sole below the turf and at most 0.5 slow double-float frames per moving second.";
    static List<Check> Gates(List<Case> cases){
        var gates=new List<Check>();
        void Gate(string name,double value,double limit,bool atMost=true){gates.Add(new Check{name=name,value=value,limit=limit,passed=atMost?value<=limit+1e-6:value>=limit-1e-6});}
        foreach(var c in cases){
            string id=c.name+"@"+c.rate+"Hz";
            if(c.origin=="controlled"){
                foreach(var w in new[]{c.start,c.cruise,c.stop}){
                    if(w==null||w.frames==0)continue;string n=id+"/"+w.name;
                    Gate(n+" sole below turf frames",w.soleBelow,0);
                    Gate(n+" joint speed deg/s",w.jointSpeedMax,JointSpeedLimit);
                    Gate(n+" thigh step deg per 1/60 s",w.thighStepMax*c.rate/60f,ThighStepLimit);
                    Gate(n+" hands above shoulders frames",w.handsHigh,0);
                    if(w.handHeadMin>=0)Gate(n+" hand-head distance m",w.handHeadMin,HandHeadLimit,false);
                }
                var r=c.cruise;if(r==null||r.frames==0)continue;string k=id+"/cruise";
                if(r.supportFrames>0&&r.speedMean>.5f){Gate(k+" support glide share of speed",r.supportGlideRatio,GlideRatioLimit);Gate(k+" support glide m/s",r.supportGlideMean,GlideLimit);}
                if(r.speedMean<1.9f&&r.moving>0)Gate(k+" slow double-float frames",r.doubleFloatSlow,0);
                if(r.moving>0&&!c.name.StartsWith("keeper"))Gate(k+" chest vs facing deg",r.chestMean,ChestLimit);
                if(r.stanceFrames>0)Gate(k+" knee pole deg",r.kneePoleMean,KneePoleLimit);
                if(c.name.StartsWith("curve-"))Gate(k+" turn episodes per second",r.turnStartsPerSecond,0);
                if(c.name=="noise-117")Gate(k+" family switches",r.familySwitches,1);
            }else if(c.origin=="native"&&c.group=="native-player"){
                var l=c.cruise;if(l==null||l.frames==0)continue;
                Gate(c.name+"/locomotion sole below turf frames",l.soleBelow,0);
                float seconds=l.moving/60f;if(seconds>1)Gate(c.name+"/locomotion slow double-float per moving s",l.doubleFloatSlow/seconds,NativeDoubleFloatPerSecond);
            }
        }
        return gates;
    }
    static Texture2D Scale(Texture2D source,int w,int h){var rt=RenderTexture.GetTemporary(w,h,0);Graphics.Blit(source,rt);var previous=RenderTexture.active;RenderTexture.active=rt;var t=new Texture2D(w,h,TextureFormat.RGB24,false);t.ReadPixels(new Rect(0,0,w,h),0,0);t.Apply();RenderTexture.active=previous;RenderTexture.ReleaseTemporary(rt);return t;}
    // ---- native recordings ----------------------------------------------
    [Serializable] class NativePose {public string id,action,actionId;public double[] position,facing,contactPoint;public double progress,duration,freshness=-1;public bool moving;}
    [Serializable] class NativePicture {public double clock;public string phase,owner;public bool ballInFlight,turned;public double[] ball;public NativePose[] players;}
    [Serializable] class NativeCapture {public int seed,fieldPlayers;public string fieldSize;public string[] keepers;public NativePicture[] pictures;}
    static IEnumerable<Case> Native(string file){
        var capture=JsonUtility.FromJson<NativeCapture>(File.ReadAllText(file));var config=JsonUtility.FromJson<WorldConfig>(raw);
        var ids=new List<string>();foreach(var p in capture.pictures[0].players)ids.Add(p.id);
        string Club(string id){var parts=id.Split(':');return parts.Length>2?parts[parts.Length-2]:"a";}
        var clubs=new List<string>();foreach(var id in ids)if(!clubs.Contains(Club(id)))clubs.Add(Club(id));
        var kit=config.players[0].kit;var other=Array.Find(config.players,p=>p.team==1).kit;
        config.players=ids.ConvertAll(id=>new WorldPlayer{id=id,name="N "+id.Substring(id.LastIndexOf(':')+1),team=clubs.IndexOf(Club(id))==0?0:1,number=0,keeper=Array.IndexOf(capture.keepers,id)>=0,kit=clubs.IndexOf(Club(id))==0?kit:other,skin="warm",hair="brown"}).ToArray();
        bool large=capture.fieldSize=="large";config.geometry.length=large?81.6:68;config.geometry.width=large?52.8:44;config.geometry.fieldPlayers=capture.fieldPlayers;
        config.session="native-motion-"+capture.seed;config.quality="standard";
        WorldFrame ToFrame(NativePicture n){
            var f=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(config.initial));f.session=config.session;f.clock=n.clock;f.phase="live";f.owner=string.IsNullOrEmpty(n.owner)?"":n.owner;f.ball=n.ball;f.ballInFlight=n.ballInFlight;f.turned=n.turned;f.ballOpacity=1;
            f.players=Array.ConvertAll(n.players,q=>new WorldPose{id=q.id,position=q.position,facing=q.facing,moving=q.moving,action=q.action,actionId=q.actionId,progress=q.progress,duration=q.duration>0?q.duration:1,contactPoint=q.contactPoint!=null&&q.contactPoint.Length==3?q.contactPoint:null,freshness=q.freshness,number=0});return f;
        }
        // Two 30 s live windows per capture keep the run bounded.
        var pictures=new List<WorldFrame>();for(int i=0;i<capture.pictures.Length&&pictures.Count<1200;i++)if(capture.pictures[i].phase=="live")pictures.Add(ToFrame(capture.pictures[i]));else if(pictures.Count>0)break;
        config.initial=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(pictures[0]));config.initial.sequence=sequence=1;config.initial.phase="paused";
        Drop();Send(new WorldCommand{kind="load",config=config});
        var actors=Field<List<Transform>>("actors");var football=Field<List<FootballAnimation>>("football");var loco=Field<FootballLocomotion[]>("worldLocomotion");
        int n=actors.Count;var samples=new List<Sample>[n];var last=new Sample[n];for(int i=0;i<n;i++)samples[i]=new List<Sample>();
        int frame=0;
        foreach(var f in Display(pictures)){
            var p=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(f));p.sequence=++sequence;p.phase="paused";p.camera=new WorldCamera{position=new double[]{0,30,-40},target=new double[3],fov=40};
            Send(new WorldCommand{kind="frame",frame=p});
            for(int i=0;i<n;i++){var s=Measure(i,actors[i],football[i],loco[i],p,last[i],frame%6==0);samples[i].Add(s);last[i]=s;}
            frame++;
        }
        // Aggregate by direction relative to the received facing and by keeper/field role.
        var groups=new Dictionary<string,List<Sample>>();
        string[] dirNames={"fwd","fwd-right","right","back-right","back","back-left","left","fwd-left"};
        var results=new List<Case>();
        for(int i=0;i<n;i++){
            bool isKeeper=Array.IndexOf(capture.keepers,ids[i])>=0;
            var all=samples[i];var role=isKeeper?"keeper":"field";
            var whole=Summarise("whole",all,0,all.Count);
            // cruise = locomotion-only pictures (idle/run actions) of the same player.
            results.Add(new Case{name="native-"+capture.seed+"-"+role+"-"+i,group="native-player",origin="native",note=Path.GetFileName(file)+"; cruise window = locomotion-only pictures",whole=whole,cruise=Summarise("locomotion",all,0,all.Count,true),clips=new string[0]});
        }
        // Per-direction and speed-band bins over field players.
        string[] bandNames={"walk","jog","fast"};
        foreach(int bin in new[]{0,1,2,3,4,5,6,7})foreach(int band in new[]{-1,0,1,2}){
            var merged=new List<Sample>();
            for(int i=0;i<n;i++){if(Array.IndexOf(capture.keepers,ids[i])>=0)continue;var all=samples[i];
                for(int k=1;k<all.Count;k++){var s=all[k];if(!s.moving){continue;}float rel=Mathf.DeltaAngle(Yaw(s.facing),Yaw(s.travel));int b=((Mathf.RoundToInt(rel/45f)%8)+8)%8;float v=s.travel.magnitude;int sb=v<1.9f?0:v<3.8f?1:2;if(b==bin&&(band<0||sb==band)){if(merged.Count==0||merged[merged.Count-1]!=all[k-1])merged.Add(all[k-1]);merged.Add(s);}}}
            if(merged.Count>4){var c=new Case{name="native-"+capture.seed+"-dir-"+dirNames[bin]+(band<0?"":"-"+bandNames[band]),group="native-direction",origin="native",note=Path.GetFileName(file)+" field players, frames binned by received travel vs facing; cruise window = locomotion-only pictures",clips=new string[0]};c.whole=Summarise("whole",merged,0,merged.Count);c.cruise=Summarise("locomotion",merged,0,merged.Count,true);results.Add(c);}
        }
        Drop();
        return results;
    }
}
#endif

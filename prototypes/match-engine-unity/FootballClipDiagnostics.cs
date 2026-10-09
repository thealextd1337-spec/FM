#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Animations;
using UnityEngine.Playables;
using UnityEditor;
using UnityEditor.SceneManagement;
using Doppel6.Probe;
// Measures the existing authored clips on the actual 28-joint rig: footfall
// phases, the ground speed a stance foot implies, hip travel and lowest sole.
// Read-only: no clip, prefab or scene is modified.
public static class FootballClipDiagnostics {
    [Serializable] public class Foot {public float minClearance,stance,stanceSpeed,stanceX,stanceZ;public float[] clearance;}
    [Serializable] public class ClipReport {public string name;public float length,frameRate,hipMinY,hipMaxY,impliedSpeed,impliedX,impliedZ,strideLength,groundOffset,soleLowest,handMaxY,handMinY;public Foot left,right;public float[] hipY,hipYaw;public float leftFootfall,rightFootfall;}
    [Serializable] class Report {public string unity;public float scale,groundAnkle,groundToe,referenceSole;public string[] bones;public ClipReport[] clips;}
    public const float Scale=1.45f;
    public const int Samples=120;
    public static string Run(string repository){
        const string asset="Assets/Doppel6EngineProbe/Art/football-v130.fbx";
        var clips=new List<AnimationClip>();foreach(var a in AssetDatabase.LoadAllAssetsAtPath(asset))if(a is AnimationClip c&&!c.name.StartsWith("__preview"))clips.Add(c);
        foreach(var name in new[]{"pass_inside_meshy","receive_ground_meshy"}){var c=AssetDatabase.LoadAssetAtPath<AnimationClip>("Assets/Doppel6EngineProbe/Art/"+name+".anim");if(c!=null)clips.Add(c);}
        var reference=clips.Find(c=>c.name=="idle_stand_meshy")??throw new Exception("idle_stand_meshy is missing");
        var scene=EditorSceneManager.NewPreviewScene();var graph=PlayableGraph.Create("D6 clip diagnostics");var result=new List<ClipReport>();var names=new List<string>();float groundAnkle,groundToe,referenceSole=0;
        try{
            var actor=UnityEngine.Object.Instantiate(AssetDatabase.LoadAssetAtPath<GameObject>(asset));UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(actor,scene);actor.transform.localScale=Vector3.one*Scale;
            foreach(var t in actor.GetComponentsInChildren<Transform>())names.Add(t.name);
            var animator=actor.GetComponent<Animator>();if(animator==null)animator=actor.AddComponent<Animator>();animator.applyRootMotion=false;
            Transform Bone(string name)=>Array.Find(actor.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:"+name);
            var hips=Bone("Hips");var hands=new[]{Bone("LeftHand"),Bone("RightHand")};var ankles=new[]{Bone("LeftFoot"),Bone("RightFoot")};var toes=new[]{Bone("LeftToeBase"),Bone("RightToeBase")};
            graph.SetTimeUpdateMode(DirectorUpdateMode.Manual);var output=AnimationPlayableOutput.Create(graph,"Character",animator);graph.Play();
            // The same ground definition the runtime uses: the standing reference sole.
            var ground=new FootballGround(actor.transform);var refPlayable=AnimationClipPlayable.Create(graph,reference);output.SetSourcePlayable(refPlayable);refPlayable.SetTime(0);graph.Evaluate(0);ground.Calibrate();groundAnkle=ground.ankle;groundToe=ground.toe;referenceSole=LowestVertex(actor.transform);graph.DestroyPlayable(refPlayable);
            foreach(var clip in clips){
                var playable=AnimationClipPlayable.Create(graph,clip);playable.SetApplyFootIK(false);output.SetSourcePlayable(playable);
                var r=new ClipReport{name=clip.name,length=clip.length,frameRate=clip.frameRate,hipY=new float[Samples],hipYaw=new float[Samples],hipMinY=float.MaxValue,hipMaxY=float.MinValue,handMinY=float.MaxValue,handMaxY=float.MinValue};
                var feet=new[]{new Foot{clearance=new float[Samples]},new Foot{clearance=new float[Samples]}};var px=new float[2,Samples];var pz=new float[2,Samples];
                for(int s=0;s<Samples;s++){
                    double time=s*(clip.length-.001)/(Samples-1);playable.SetTime(time);graph.Evaluate(0);
                    r.hipY[s]=hips.position.y;var fwd=hips.forward;r.hipYaw[s]=Mathf.Atan2(fwd.x,fwd.z)*Mathf.Rad2Deg;r.hipMinY=Mathf.Min(r.hipMinY,hips.position.y);r.hipMaxY=Mathf.Max(r.hipMaxY,hips.position.y);
                    foreach(var hand in hands){r.handMinY=Mathf.Min(r.handMinY,hand.position.y);r.handMaxY=Mathf.Max(r.handMaxY,hand.position.y);}
                    for(int f=0;f<2;f++){feet[f].clearance[s]=ground.Clearance(f);px[f,s]=toes[f].position.x;pz[f,s]=toes[f].position.z;}
                }
                float dt=(clip.length-.001f)/(Samples-1);
                for(int f=0;f<2;f++)Summarise(feet[f],px,pz,f,dt);
                r.left=feet[0];r.right=feet[1];r.leftFootfall=Footfall(feet[0]);r.rightFootfall=Footfall(feet[1]);r.soleLowest=float.MaxValue;for(int s=0;s<24;s++){playable.SetTime(s*(clip.length-.001)/23);graph.Evaluate(0);r.soleLowest=Mathf.Min(r.soleLowest,LowestVertex(actor.transform));}r.groundOffset=ground.Offset(clip,graph,output);
                // A planted foot moves backwards relative to an in-place body;
                // its mean velocity is the ground speed the clip portrays.
                float weight=r.left.stance+r.right.stance;
                if(weight>0){r.impliedX=-(r.left.stanceX*r.left.stance+r.right.stanceX*r.right.stance)/weight;r.impliedZ=-(r.left.stanceZ*r.left.stance+r.right.stanceZ*r.right.stance)/weight;r.impliedSpeed=new Vector2(r.impliedX,r.impliedZ).magnitude;r.strideLength=r.impliedSpeed*clip.length;}
                result.Add(r);graph.DestroyPlayable(playable);
            }
        }finally{if(graph.IsValid())graph.Destroy();EditorSceneManager.ClosePreviewScene(scene);}
        var report=new Report{unity=Application.unityVersion,scale=Scale,groundAnkle=groundAnkle,groundToe=groundToe,referenceSole=referenceSole,bones=names.ToArray(),clips=result.ToArray()};
        var folder=Path.Combine(repository,"outputs/platform/unity-phases");Directory.CreateDirectory(folder);File.WriteAllText(Path.Combine(folder,"clip-diagnostics.json"),JsonUtility.ToJson(report,true));
        return "clips="+report.clips.Length;
    }
    // Lowest skinned vertex relative to the actor root, in metres.
    static float LowestVertex(Transform actor){
        float lowest=float.MaxValue;var mesh=new Mesh();
        foreach(var r in actor.GetComponentsInChildren<SkinnedMeshRenderer>()){// Measured on this rig: BakeMesh(useScale:false) already carries the
            // inherited 1.45 figure scale; only position and rotation remain to apply.
            r.BakeMesh(mesh,false);foreach(var v in mesh.vertices)lowest=Mathf.Min(lowest,(r.transform.position+r.transform.rotation*v).y-actor.position.y);}
        UnityEngine.Object.DestroyImmediate(mesh);return lowest;
    }
    // Normalised clip time at which the sole first reaches its stance height.
    static float Footfall(Foot f){
        for(int i=1;i<f.clearance.Length;i++)if(f.clearance[i]-f.minClearance<=.02f&&f.clearance[i-1]-f.minClearance>.02f)return i/(float)(f.clearance.Length-1);
        return -1;
    }
    static void Summarise(Foot f,float[,] px,float[,] pz,int foot,float dt){
        f.minClearance=float.MaxValue;foreach(var c in f.clearance)f.minClearance=Mathf.Min(f.minClearance,c);
        int count=0;float vx=0,vz=0;
        for(int i=1;i<f.clearance.Length;i++){
            // Stance: the sole stays within two centimetres of its lowest point.
            if(f.clearance[i]-f.minClearance>.02f||f.clearance[i-1]-f.minClearance>.02f)continue;
            count++;vx+=(px[foot,i]-px[foot,i-1])/dt;vz+=(pz[foot,i]-pz[foot,i-1])/dt;
        }
        f.stance=count/(float)(f.clearance.Length-1);if(count>0){f.stanceX=vx/count;f.stanceZ=vz/count;f.stanceSpeed=new Vector2(f.stanceX,f.stanceZ).magnitude;}
    }
}
#endif

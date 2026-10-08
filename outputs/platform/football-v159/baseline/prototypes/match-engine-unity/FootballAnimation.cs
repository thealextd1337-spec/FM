using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Animations;
using UnityEngine.Playables;
namespace Doppel6.Probe {
// This envelope reads completed native contacts, never guesses the next action.
public static class FootballActionTiming {
    public static bool IsFootAction(string action){return action=="pass"||action=="highPass"||action=="cross"||action=="receive"||action=="control"||action=="passReady"||action=="shot"||action=="freeKick"||action=="volley"||action=="goalKick"||action=="kickReady";}
    public static float Weight(string action,double age,double progress,float speed){
        if(action=="passReady"||action=="kickReady")return (float)(.25+.75*Math.Clamp(progress,0,1));
        bool receive=action=="receive"||action=="control",shot=action=="shot"||action=="freeKick"||action=="volley"||action=="goalKick";
        double contact=receive?.12:.09,end=shot?(speed>.4?.48:.70):receive?(speed>.4?.30:.44):(speed>.4?.30:.46);
        var t=Math.Clamp((age-contact)/(end-contact),0,1);return (float)(1-t*t*(3-2*t));
    }
}
// Visual sampling only: no events, randomness, ownership, ball motion or game clock.
public sealed class FootballAnimation {
    public struct Pose {public AnimationClip clip,baseClip;public double time,baseTime;public bool loop,baseLoop,plant,contact;public float actionWeight,forwardLean,turnLean,recoveryLean;public string key,kind;public Vector3 target;}
    readonly PlayableGraph graph;readonly AnimationMixerPlayable mixer;
    readonly Dictionary<AnimationClip,int> indices=new Dictionary<AnimationClip,int>();
    readonly List<AnimationClipPlayable> clips=new List<AnimationClipPlayable>();
    readonly float[] weights,start;
    double changed,lastClock=-1;int selected=-1,baseSelected=-1;string key;
    public float Weight(AnimationClip clip){return clip!=null&&indices.TryGetValue(clip,out var index)?weights[index]:0;}
    public readonly FootballRig rig;
    public FootballAnimation(PlayableGraph graph,Transform actor,IEnumerable<AnimationClip> catalogue){
        this.graph=graph;rig=new FootballRig(actor);
        foreach(var clip in catalogue)if(clip!=null&&!indices.ContainsKey(clip))indices.Add(clip,indices.Count);
        weights=new float[indices.Count];start=new float[indices.Count];mixer=AnimationMixerPlayable.Create(graph,indices.Count);
        foreach(var entry in indices){var playable=AnimationClipPlayable.Create(graph,entry.Key);playable.SetApplyFootIK(false);playable.SetApplyPlayableIK(false);clips.Add(playable);graph.Connect(playable,0,mixer,entry.Value);}
        graph.GetOutput(0).SetSourcePlayable(mixer);
    }
    public void Sample(Pose pose,double clock,bool cut=false){
        if(pose.clip==null||!indices.TryGetValue(pose.clip,out var index))throw new InvalidOperationException("Football clip is missing");
        if(!cut&&clock==lastClock)return;
        int baseIndex=-1;float actionWeight=1;
        if(pose.baseClip!=null){if(!indices.TryGetValue(pose.baseClip,out baseIndex))throw new InvalidOperationException("Football stride clip is missing");actionWeight=Mathf.Clamp01(pose.actionWeight);if(baseIndex==index){baseIndex=-1;actionWeight=1;}}
        bool reset=cut||lastClock<0||clock<lastClock||clock-lastClock>1;
        if(reset){Array.Clear(weights,0,weights.Length);weights[index]=actionWeight;if(baseIndex>=0)weights[baseIndex]=1-actionWeight;Array.Copy(weights,start,weights.Length);selected=index;baseSelected=baseIndex;changed=clock;key=pose.key;rig.Release();}
        else if(selected!=index||baseSelected!=baseIndex){Array.Copy(weights,start,weights.Length);selected=index;baseSelected=baseIndex;changed=clock;}
        if(key!=pose.key){rig.Release();key=pose.key;}
        // Real match time drives both the sample and the fade, so a pause freezes bones.
        float fade=(float)Math.Clamp((clock-changed)/.1,0,1);
        if(!reset)for(int i=0;i<weights.Length;i++)weights[i]=Mathf.Lerp(start[i],i==selected?actionWeight:i==baseSelected?1-actionWeight:0,fade);
        for(int i=0;i<clips.Count;i++){mixer.SetInputWeight(i,weights[i]);if(i==index||i==baseIndex){var clip=i==index?pose.clip:pose.baseClip;double time=i==index?pose.time:pose.baseTime;bool loop=i==index?pose.loop:pose.baseLoop;double end=Math.Max(.001,clip.length-.001);clips[i].SetTime(loop?time%end:Math.Clamp(time,0,end));}else if(lastClock>=0&&clock>lastClock)clips[i].SetTime(clips[i].GetTime()+clock-lastClock);}
        graph.Evaluate(0);
        // Bone-only response to observed motion. Contacts and planted actions
        // always retain their authored pose and the root remains game-owned.
        if(!pose.contact&&!pose.plant)rig.Lean(pose.forwardLean,pose.turnLean,pose.recoveryLean);
        if(pose.contact)rig.PrepareContact(pose.target,pose.kind);
        if(pose.plant)rig.Plant(pose.kind=="left-foot");else rig.Release();
        if(pose.contact)rig.Contact(pose.target,pose.kind);
        lastClock=clock;
    }
}
// Bounded two-bone correction. An unreachable point remains unreachable; the
// renderer never stretches a limb, teleports an actor or attracts the ball.
public sealed class FootballRig {
    readonly Transform root,hips,spine,leftUpper,leftLower,leftFoot,rightUpper,rightLower,rightFoot,arm,forearm,hand;
    readonly Vector3 restLeft,restRight;Vector3 anchor;bool planted,plantRight;
    public float plantError,contactError;public bool reachable;
    public FootballRig(Transform root){
        this.root=root;Transform Find(string name){return Array.Find(root.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:"+name);}
        hips=Find("Hips");spine=Find("Spine");leftUpper=Find("LeftUpLeg");leftLower=Find("LeftLeg");leftFoot=Find("LeftFoot");rightUpper=Find("RightUpLeg");rightLower=Find("RightLeg");rightFoot=Find("RightFoot");arm=Find("RightArm");forearm=Find("RightForeArm");hand=Find("RightHand");
        if(leftFoot==null||rightFoot==null||hand==null)throw new InvalidOperationException("Football contact rig is missing bones");restLeft=root.InverseTransformPoint(leftFoot.position);restRight=root.InverseTransformPoint(rightFoot.position);
    }
    public void Release(){planted=false;plantError=0;reachable=false;contactError=0;}
    public void Lean(float forward,float turn,float recovery){
        if(spine==null)return;
        // Transform axes are taken from the actor, so the effect is consistent
        // for either attacking direction and never rotates the actor itself.
        float pitch=Mathf.Clamp(forward,-5,7)+Mathf.Clamp(recovery,0,8),bank=Mathf.Clamp(turn,-6,6);
        if(Mathf.Abs(pitch)+Mathf.Abs(bank)<.00001f)return;
        spine.rotation=Quaternion.AngleAxis(bank,root.forward)*Quaternion.AngleAxis(pitch,root.right)*spine.rotation;
    }
    public void PrepareContact(Vector3 point,string kind){
        if(kind=="hand")return;var upper=kind=="left-foot"?leftUpper:rightUpper;var lower=kind=="left-foot"?leftLower:rightLower;var end=kind=="left-foot"?leftFoot:rightFoot;float length=Vector3.Distance(upper.position,lower.position)+Vector3.Distance(lower.position,end.position),distance=Vector3.Distance(upper.position,point);
        // A small knee bend is allowed for differences between the authored rig
        // and the native foot volume. Far contacts receive no body correction.
        float excess=distance-length;var direction=upper.position-point;
        if(excess>0&&excess<.1f&&direction.y/distance>.65f)hips.position-=Vector3.up*Mathf.Min(.12f,(excess+.004f)*distance/direction.y);
    }
    public void Plant(bool right=false){if(!planted||plantRight!=right){anchor=root.TransformPoint(right?restRight:restLeft);planted=true;plantRight=right;}var upper=right?rightUpper:leftUpper;var lower=right?rightLower:leftLower;var end=right?rightFoot:leftFoot;var correction=anchor-end.position;if(correction.magnitude<.65f)Solve(upper,lower,end,anchor);plantError=Vector3.Distance(anchor,end.position);}
    public Vector3 Contact(Vector3 point,string kind){bool left=kind=="left-foot";var upper=kind=="hand"?arm:left?leftUpper:rightUpper;var lower=kind=="hand"?forearm:left?leftLower:rightLower;var end=kind=="hand"?hand:left?leftFoot:rightFoot;reachable=CanReach(upper,lower,end,point);if(reachable)Solve(upper,lower,end,point);contactError=Vector3.Distance(end.position,point);return end.position;}
    public static bool CanReach(Transform upper,Transform lower,Transform end,Vector3 point){float a=Vector3.Distance(upper.position,lower.position),b=Vector3.Distance(lower.position,end.position),d=Vector3.Distance(upper.position,point);return d>=Math.Abs(a-b)+.00001&&d<=a+b-.00001;}
    public static Vector3 Solve(Transform upper,Transform lower,Transform end,Vector3 point){
        var hip=upper.position;var knee=lower.position;float a=Vector3.Distance(hip,knee),b=Vector3.Distance(knee,end.position);var direction=(point-hip).normalized;float d=Mathf.Clamp(Vector3.Distance(hip,point),Mathf.Abs(a-b)+.00001f,a+b-.00001f),along=(a*a-b*b+d*d)/(2*d),height=Mathf.Sqrt(Mathf.Max(0,a*a-along*along));var pole=Vector3.ProjectOnPlane(knee-hip,direction);if(pole.sqrMagnitude<1e-8)pole=Vector3.ProjectOnPlane(upper.forward,direction);pole.Normalize();var wantedKnee=hip+direction*along+pole*height;var rotation=end.rotation;upper.rotation=Quaternion.FromToRotation(lower.position-hip,wantedKnee-hip)*upper.rotation;lower.rotation=Quaternion.FromToRotation(end.position-lower.position,hip+direction*d-lower.position)*lower.rotation;end.rotation=rotation;return end.position;
    }
}
}

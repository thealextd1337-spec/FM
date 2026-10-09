using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Animations;
using UnityEngine.Playables;
namespace Doppel6.Probe {
// This envelope reads completed native contacts, never guesses the next action.
public static class FootballActionTiming {
    public static bool IsFootAction(string action){return action=="pass"||action=="highPass"||action=="cross"||action=="receive"||action=="control"||action=="passReady"||action=="shot"||action=="freeKick"||action=="volley"||action=="goalKick"||action=="kickReady"||action=="tackle";}
    public static float Weight(string action,double age,double progress,float speed){
        if(action=="passReady"||action=="kickReady")return (float)(.25+.75*Math.Clamp(progress,0,1));
        bool receive=action=="receive"||action=="control",shot=action=="shot"||action=="freeKick"||action=="volley"||action=="goalKick";
        double contact=receive?.12:.09,end=shot?(speed>.4?.48:.70):receive?(speed>.4?.30:.44):(speed>.4?.30:.46);
        var t=Math.Clamp((age-contact)/(end-contact),0,1);return (float)(1-t*t*(3-2*t));
    }
}
public static class FootballStrideTiming {
    // Clips are aligned at their measured left footfall, so a walk, jog, run or
    // sprint exchange keeps the same foot on the ground at the same cycle value.
    public static double Time(double cycles,AnimationClip clip,float footfall=0){return (cycles+footfall)*Math.Max(.001,clip.length-.001);}
}
// Measured gait of an authored clip on the actual rig: metres per cycle that a
// planted foot portrays and the normalised left/right footfall times.
public static class FootballStride {
    public struct Gait {public float stride,left,right;}
    // Stance: the sole stays within two centimetres of its lowest point. A
    // planted foot moves backwards relative to an in-place body; its mean
    // velocity is the ground speed the clip portrays.
    public static Gait Measure(AnimationClip clip,float[][] clearance,Vector3[][] toes,float dt){
        int n=clearance[0].Length;float weight=0;var velocity=Vector3.zero;var footfall=new float[2];
        for(int f=0;f<2;f++){
            float min=float.MaxValue;foreach(var c in clearance[f])min=Mathf.Min(min,c);
            int count=0;var v=Vector3.zero;footfall[f]=-1;
            for(int i=1;i<n;i++){
                bool now=clearance[f][i]-min<=.02f,before=clearance[f][i-1]-min<=.02f;
                if(now&&!before&&footfall[f]<0)footfall[f]=i/(float)(n-1);
                if(now&&before){count++;v+=(toes[f][i]-toes[f][i-1])/dt;}
            }
            if(count>0){velocity+=v;weight+=count;}
        }
        float speed=weight>0?new Vector2(velocity.x,velocity.z).magnitude/weight:0;
        return new Gait{stride=speed*clip.length,left=footfall[0],right=footfall[1]};
    }
}
public static class FootballKeeperTiming {
    // Measured windows in the existing authored clips. Native progress reaches
    // one at the real ball contact, rather than at an arbitrary clip length.
    public static double Time(string clip,double progress){
        double start=clip=="keeper_high_meshy"?.93:clip=="keeper_dive_meshy"?.23:.70;
        double contact=clip=="keeper_high_meshy"?1.46:clip=="keeper_dive_meshy"?.81:1.18;
        return start+(contact-start)*Math.Clamp(progress,0,1);
    }
}
// Visual sampling only: no events, randomness, ownership, ball motion or game clock.
public sealed class FootballAnimation {
    // contactWeight: 0 or 1 is a full native contact; values between are a
    // partial visual reach (carrier stride). kind also accepts "two-hands" and "head".
    // slide/lunge: procedural duel weights (FootballDuelTiming); leftLead picks the leg.
    public struct Pose {public AnimationClip clip,baseClip;public double time,baseTime;public bool loop,baseLoop,plant,contact,urgent,leftLead;public float actionWeight,forwardLean,turnLean,recoveryLean,keeperDive,contactWeight,slide,lunge;public string key,kind;public Vector3 target;}
    // A native contact releases over this much match time instead of popping.
    public const double ContactRelease=.10;
    readonly PlayableGraph graph;readonly AnimationMixerPlayable mixer;
    readonly Dictionary<AnimationClip,int> indices=new Dictionary<AnimationClip,int>();
    readonly List<AnimationClipPlayable> clips=new List<AnimationClipPlayable>();
    readonly AnimationClip[] sources;
    readonly float[] weights,start;
    readonly Transform root,hips;
    double changed,lastClock=-1,releaseFrom=-1;int selected=-1,baseSelected=-1;string key,releaseKind;Vector3 releaseTarget;
    public float Weight(AnimationClip clip){return clip!=null&&indices.TryGetValue(clip,out var index)?weights[index]:0;}
    public float GroundShift {get;private set;}
    public float ReleaseWeight {get;private set;}
    public readonly FootballRig rig;
    public readonly FootballGround ground;
    public float RootHeight=>ground.RootHeight;
    public float StrideLength(AnimationClip clip)=>ground.StrideLength(clip);
    public float Footfall(AnimationClip clip)=>ground.Footfall(clip);
    public float RightFootfall(AnimationClip clip)=>ground.RightFootfall(clip);
    public double StrideTime(double cycles,AnimationClip clip)=>FootballStrideTiming.Time(cycles,clip,ground.Footfall(clip));
    public FootballAnimation(PlayableGraph graph,Transform actor,IEnumerable<AnimationClip> catalogue){
        this.graph=graph;root=actor;rig=new FootballRig(actor);ground=new FootballGround(actor);rig.ground=ground;hips=Array.Find(actor.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:Hips");
        foreach(var clip in catalogue)if(clip!=null&&!indices.ContainsKey(clip))indices.Add(clip,indices.Count);
        weights=new float[indices.Count];start=new float[indices.Count];sources=new AnimationClip[indices.Count];mixer=AnimationMixerPlayable.Create(graph,indices.Count);
        foreach(var entry in indices){var playable=AnimationClipPlayable.Create(graph,entry.Key);playable.SetApplyFootIK(false);playable.SetApplyPlayableIK(false);clips.Add(playable);sources[entry.Value]=entry.Key;graph.Connect(playable,0,mixer,entry.Value);}
        graph.GetOutput(0).SetSourcePlayable(mixer);
        Measure(actor);
    }
    void Only(int index,double time){for(int i=0;i<clips.Count;i++)mixer.SetInputWeight(i,i==index?1:0);clips[index].SetTime(time);graph.Evaluate(0);}
    // Measures each catalogue clip once per session on this rig. Shared by all
    // actors, since every figure uses the same skeleton and scale.
    void Measure(Transform actor){
        if(!ground.Calibrated)foreach(var entry in indices)if(entry.Key.name==FootballGround.ReferenceClip){Only(entry.Value,0);ground.Calibrate();ground.SetSole(FootballGround.LowestVertex(actor));break;}
        if(ground.Calibrated){
            var toes=new[]{Bone("LeftToeBase"),Bone("RightToeBase")};
            foreach(var entry in indices){
                var clip=entry.Key;if(ground.Known(clip))continue;
                const int n=48;var clearance=new[]{new float[n],new float[n]};var toe=new[]{new Vector3[n],new Vector3[n]};float lowest=float.MaxValue,dt=(clip.length-.001f)/(n-1);
                for(int s=0;s<n;s++){
                    Only(entry.Value,s*dt);lowest=Mathf.Min(lowest,ground.Lowest);
                    for(int f=0;f<2;f++){clearance[f][s]=ground.Clearance(f);toe[f][s]=toes[f]!=null?Quaternion.Inverse(actor.rotation)*(toes[f].position-actor.position):Vector3.zero;}
                }
                // Bone clearance finds the lowest moments; the skinned sole decides the
                // offset, since a stretched foot can sit higher than its bones suggest.
                var order=new List<int>();for(int s=0;s<n;s++)order.Add(s);order.Sort((x,y)=>Mathf.Min(clearance[0][x],clearance[1][x]).CompareTo(Mathf.Min(clearance[0][y],clearance[1][y])));
                if(ground.SoleKnown){
                    // The four lowest bone moments plus eight even samples: a lying or
                    // kneeling body may touch down with something other than a foot.
                    var picks=new HashSet<int>();for(int k=0;k<4&&k<n;k++)picks.Add(order[k]);for(int k=0;k<8;k++)picks.Add(k*(n-1)/7);
                    lowest=float.MaxValue;foreach(var k in picks){Only(entry.Value,k*dt);lowest=Mathf.Min(lowest,FootballGround.LowestVertex(actor)-ground.Sole);}
                }
                ground.Store(clip,lowest);ground.StoreGait(clip,toes[0]!=null&&toes[1]!=null?FootballStride.Measure(clip,clearance,toe,dt):new FootballStride.Gait{left=-1,right=-1});
            }
        }
        for(int i=0;i<clips.Count;i++){mixer.SetInputWeight(i,0);clips[i].SetTime(0);}
    }
    Transform Bone(string name){return Array.Find(root.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:"+name);}
    // Editor diagnostics: skinned sole of one clip at one time through the measuring path.
    public float MeasuredSole(AnimationClip clip,double time){if(!indices.TryGetValue(clip,out var index))return float.NaN;Only(index,time);float v=FootballGround.LowestVertex(root)-ground.Sole;mixer.SetInputWeight(index,0);lastClock=-1;return v;}
    public void Sample(Pose pose,double clock,bool cut=false){
        if(pose.clip==null||!indices.TryGetValue(pose.clip,out var index))throw new InvalidOperationException("Football clip is missing");
        if(!cut&&clock==lastClock)return;
        int baseIndex=-1;float actionWeight=1;
        if(pose.baseClip!=null){if(!indices.TryGetValue(pose.baseClip,out baseIndex))throw new InvalidOperationException("Football stride clip is missing");actionWeight=Mathf.Clamp01(pose.actionWeight);if(baseIndex==index){baseIndex=-1;actionWeight=1;}}
        bool reset=cut||lastClock<0||clock<lastClock||clock-lastClock>1;
        if(reset){Array.Clear(weights,0,weights.Length);weights[index]=actionWeight;if(baseIndex>=0)weights[baseIndex]=1-actionWeight;Array.Copy(weights,start,weights.Length);selected=index;baseSelected=baseIndex;changed=clock;key=pose.key;rig.Release();releaseFrom=-1;}
        else if(selected!=index||baseSelected!=baseIndex){Array.Copy(weights,start,weights.Length);selected=index;baseSelected=baseIndex;changed=clock;}
        if(key!=pose.key){rig.Release();key=pose.key;releaseFrom=-1;}
        // Real match time drives both the sample and the fade, so a pause freezes bones.
        // A received contact cannot wait for a cosmetic crossfade. A keeper
        // launch uses a short response; ordinary movement keeps a softer blend.
        float fade=pose.contact?1:(float)Math.Clamp((clock-changed)/(pose.urgent?.035:.12),0,1);
        if(!reset)for(int i=0;i<weights.Length;i++)weights[i]=Mathf.Lerp(start[i],i==selected?actionWeight:i==baseSelected?1-actionWeight:0,fade);
        for(int i=0;i<clips.Count;i++){mixer.SetInputWeight(i,weights[i]);if(i==index||i==baseIndex){var clip=i==index?pose.clip:pose.baseClip;double time=i==index?pose.time:pose.baseTime;bool loop=i==index?pose.loop:pose.baseLoop;double end=Math.Max(.001,clip.length-.001);clips[i].SetTime(loop?(time%end+end)%end:Math.Clamp(time,0,end));}else if(lastClock>=0&&clock>lastClock)clips[i].SetTime(clips[i].GetTime()+clock-lastClock);}
        graph.Evaluate(0);
        // Measured floating clips are lowered onto the pitch, weighted like the mixer.
        float shift=0;for(int i=0;i<weights.Length;i++)shift+=weights[i]*ground.Of(sources[i]);
        GroundShift=shift;if(shift>0&&hips!=null)hips.position-=root.up*shift;
        // Bone-only response to observed motion. Contacts and planted actions
        // always retain their authored pose and the root remains game-owned.
        if(!pose.contact&&!pose.plant)rig.Lean(pose.forwardLean,pose.turnLean,pose.recoveryLean);
        if(pose.keeperDive!=0)rig.KeeperDive(pose.keeperDive,pose.target);
        if(pose.lunge>0)rig.Lunge(pose.lunge);
        bool full=pose.contactWeight<=0||pose.contactWeight>=1;
        if(pose.contact&&full)rig.PrepareContact(pose.target,pose.kind);
        if(pose.plant)rig.Plant(pose.kind=="left-foot");else rig.Release();
        if(pose.slide>0)rig.Slide(pose.slide,pose.target,pose.leftLead);
        ReleaseWeight=0;
        if(pose.contact){
            rig.Contact(pose.target,pose.kind,full?1:pose.contactWeight);
            // Only a full native contact releases gradually; the next frames keep
            // the limb near the actual contact point and return within 0.1 s.
            if(full){releaseFrom=clock;releaseKind=pose.kind;releaseTarget=pose.target;}else releaseFrom=-1;
        }else if(releaseFrom>=0&&clock>releaseFrom&&clock-releaseFrom<ContactRelease){
            float q=(float)((clock-releaseFrom)/ContactRelease);ReleaseWeight=1-q*q*(3-2*q);
            rig.Contact(releaseTarget,releaseKind,ReleaseWeight,false);
        }else releaseFrom=-1;
        lastClock=clock;
    }
}
// Measured sole height of the authored clips relative to the standing reference.
// Some generated clips carry their whole body several centimetres above the
// pitch (keeper ready stance, inside pass). A clip-constant, measured shift
// lowers only such floating poses; it never lifts a body, removes a running
// flight phase or moves the game-owned root. Measurements belong to one skinned
// mesh: the demo prefab and the club-world player differ in their soles.
public sealed class FootballGround {
    public const string ReferenceClip="idle_stand_meshy";
    // Top of the rendered pitch, just below the painted lines.
    public const float PitchSurface=0f;
    sealed class Profile {public bool calibrated,soleKnown;public float ankle,toe,sole;public readonly Dictionary<AnimationClip,float> offsets=new Dictionary<AnimationClip,float>();public readonly Dictionary<AnimationClip,FootballStride.Gait> gaits=new Dictionary<AnimationClip,FootballStride.Gait>();}
    static readonly Dictionary<Mesh,Profile> profiles=new Dictionary<Mesh,Profile>();static readonly Profile unnamed=new Profile();
    readonly Profile profile;readonly Transform root;readonly Transform[] ankles,toes;
    public FootballGround(Transform root){
        this.root=root;Transform Find(string name){return Array.Find(root.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:"+name);}
        ankles=new[]{Find("LeftFoot"),Find("RightFoot")};toes=new[]{Find("LeftToeBase"),Find("RightToeBase")};
        var mesh=root.GetComponentInChildren<SkinnedMeshRenderer>()?.sharedMesh;
        if(mesh==null)profile=unnamed;else if(!profiles.TryGetValue(mesh,out profile)){profile=new Profile();profiles.Add(mesh,profile);}
    }
    public bool Calibrated=>profile.calibrated;public bool SoleKnown=>profile.soleKnown;
    public float ankle=>profile.ankle;public float toe=>profile.toe;
    // Lowest skinned vertex of the standing reference relative to the actor root.
    public float Sole=>profile.sole;
    // Actor root height that puts the standing reference sole on the pitch.
    // Without a measurement the previous fixed height remains in use.
    public float RootHeight=>profile.soleKnown?Mathf.Clamp(PitchSurface-profile.sole,0,.12f):.08f;
    bool Valid=>ankles[0]!=null&&ankles[1]!=null&&toes[0]!=null&&toes[1]!=null;
    float Height(Transform t){return (t.position.y-root.position.y)/Mathf.Max(.0001f,root.lossyScale.y);}
    // Called with the standing reference clip evaluated on this rig.
    public void Calibrate(){if(!Valid)return;profile.ankle=Mathf.Min(Height(ankles[0]),Height(ankles[1]));profile.toe=Mathf.Min(Height(toes[0]),Height(toes[1]));profile.calibrated=true;}
    public void SetSole(float value){if(value<0&&value>-.3f){profile.sole=value;profile.soleKnown=true;}}
    // Clearance in metres at the actor's scale; positive means above the pitch.
    public float Clearance(int foot){return Valid&&profile.calibrated?Mathf.Min(Height(ankles[foot])-profile.ankle,Height(toes[foot])-profile.toe)*root.lossyScale.y:0;}
    public float Lowest=>Mathf.Min(Clearance(0),Clearance(1));
    public bool Known(AnimationClip clip){return clip!=null&&profile.offsets.ContainsKey(clip)&&profile.gaits.ContainsKey(clip);}
    public float Of(AnimationClip clip){return clip!=null&&profile.offsets.TryGetValue(clip,out var o)?o:0;}
    public void Store(AnimationClip clip,float lowest){
        // Only a consistent float (never touching down) is corrected. Lying or
        // kneeling poses that go below the standing sole are left untouched.
        profile.offsets[clip]=lowest>.012f?Mathf.Min(lowest,.25f):0;
    }
    public void StoreGait(AnimationClip clip,FootballStride.Gait gait){profile.gaits[clip]=gait;}
    public float StrideLength(AnimationClip clip){return clip!=null&&profile.gaits.TryGetValue(clip,out var g)?g.stride:0;}
    public float Footfall(AnimationClip clip){return clip!=null&&profile.gaits.TryGetValue(clip,out var g)&&g.left>=0?g.left:0;}
    public float RightFootfall(AnimationClip clip){return clip!=null&&profile.gaits.TryGetValue(clip,out var g)&&g.right>=0?g.right:(Footfall(clip)+.5f)%1;}
    static Mesh bakeMesh;static readonly List<Vector3> bakeVertices=new List<Vector3>();
    // Lowest skinned vertex relative to the actor root, in metres.
    public static float LowestVertex(Transform actor){
        float lowest=float.MaxValue;var mesh=bakeMesh??(bakeMesh=new Mesh());
        foreach(var r in actor.GetComponentsInChildren<SkinnedMeshRenderer>()){if(r.sharedMesh==null)continue;
            // Reading the bones completes the animation write; otherwise a bake
            // directly after PlayableGraph.Evaluate can use the previous pose.
            foreach(var bone in r.bones)if(bone!=null)_=bone.position;
            // Measured on this rig: BakeMesh(useScale:false) already carries the
            // inherited 1.45 figure scale; only position and rotation remain to apply.
            r.BakeMesh(mesh,false);mesh.GetVertices(bakeVertices);var origin=r.transform.position;var rotation=r.transform.rotation;foreach(var v in bakeVertices)lowest=Mathf.Min(lowest,(origin+rotation*v).y-actor.position.y);}
        return lowest==float.MaxValue?0:lowest;
    }
    // Editor diagnostics: the same measurement on a single-clip graph.
    public float Offset(AnimationClip clip,PlayableGraph graph,AnimationPlayableOutput output){
        var playable=AnimationClipPlayable.Create(graph,clip);playable.SetApplyFootIK(false);output.SetSourcePlayable(playable);float lowest=float.MaxValue;
        for(int s=0;s<24;s++){playable.SetTime(s*(clip.length-.001)/23);graph.Evaluate(0);lowest=Mathf.Min(lowest,profile.soleKnown?LowestVertex(root)-profile.sole:Lowest);}
        graph.DestroyPlayable(playable);Store(clip,lowest);return Of(clip);
    }
}
// Bounded two-bone correction. An unreachable point remains unreachable; the
// renderer never stretches a limb, teleports an actor or attracts the ball.
public sealed class FootballRig {
    readonly Transform root,hips,spine,head,leftUpper,leftLower,leftFoot,rightUpper,rightLower,rightFoot,arm,forearm,hand,leftArm,leftForearm,leftHand;
    readonly Vector3 restLeft,restRight;Vector3 anchor;bool planted,plantRight;
    readonly Quaternion restLeftFootRotation,restRightFootRotation;
    public float plantError,contactError;public bool reachable;
    public FootballGround ground;
    // Largest head correction toward an actual header contact.
    public const float HeadReach=22;
    public FootballRig(Transform root){
        this.root=root;Transform Find(string name){return Array.Find(root.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:"+name);}
        hips=Find("Hips");spine=Find("Spine");head=Find("Head");leftUpper=Find("LeftUpLeg");leftLower=Find("LeftLeg");leftFoot=Find("LeftFoot");rightUpper=Find("RightUpLeg");rightLower=Find("RightLeg");rightFoot=Find("RightFoot");arm=Find("RightArm");forearm=Find("RightForeArm");hand=Find("RightHand");leftArm=Find("LeftArm");leftForearm=Find("LeftForeArm");leftHand=Find("LeftHand");
        if(leftFoot==null||rightFoot==null||hand==null)throw new InvalidOperationException("Football contact rig is missing bones");restLeft=root.InverseTransformPoint(leftFoot.position);restRight=root.InverseTransformPoint(rightFoot.position);
        restLeftFootRotation=Quaternion.Inverse(root.rotation)*leftFoot.rotation;restRightFootRotation=Quaternion.Inverse(root.rotation)*rightFoot.rotation;
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
    public void KeeperDive(float weight,Vector3 point){
        if(hips==null)return;
        var local=root.InverseTransformPoint(point);float side=Math.Sign(local.x);if(side==0)return;
        // Only bones bank and lower for an already observed lateral dive. The
        // received root, heading and ball remain authoritative; no reach grows.
        float q=Mathf.Clamp01(Mathf.Abs(weight));float angle=-side*q*Mathf.Lerp(26,58,Mathf.Clamp01((1.7f-point.y)/1.4f));
        hips.rotation=Quaternion.AngleAxis(angle,root.forward)*hips.rotation;
        hips.position-=root.up*(q*Mathf.Clamp((1.6f-point.y)*.23f,0,.30f));
    }
    // Standing tackle or foul challenge: a lower, forward-leaning body. The
    // reaching foot itself is the ordinary bounded contact correction.
    public void Lunge(float weight){
        if(hips==null)return;float w=Mathf.Clamp01(weight);if(w<=0)return;
        hips.position-=Vector3.up*(.13f*w);
        if(spine!=null)spine.rotation=Quaternion.AngleAxis(16*w,root.right)*spine.rotation;
    }
    // Observed native slide: pelvis low and banked onto the trailing hip, body
    // leaning back with the chest up, lead leg straight along the turf toward
    // the actual contact, trailing leg folded and its hand on the ground. Only
    // bones move; the received root and heading stay authoritative and an
    // out-of-reach contact stays out of reach.
    public void Slide(float weight,Vector3 target,bool leftLead){
        if(hips==null)return;float w=Mathf.Clamp01(weight);if(w<=0)return;
        var forward=root.forward;var right=root.right;float lead=leftLead?-1:1;
        float height=hips.position.y-FootballGround.PitchSurface;
        hips.position-=Vector3.up*(w*Mathf.Max(0,height-FootballDuelTiming.SlideHips));
        hips.rotation=Quaternion.AngleAxis(w*FootballDuelTiming.SlideBank*lead,forward)*Quaternion.AngleAxis(-w*FootballDuelTiming.SlideLean,right)*hips.rotation;
        if(spine!=null)spine.rotation=Quaternion.AngleAxis(w*FootballDuelTiming.SlideLean*.45f,right)*spine.rotation;
        var upper=leftLead?leftUpper:rightUpper;var lower=leftLead?leftLower:rightLower;var foot=leftLead?leftFoot:rightFoot;
        float leg=Vector3.Distance(upper.position,lower.position)+Vector3.Distance(lower.position,foot.position);
        // The lead foot slides just above the turf toward the contact; a contact
        // behind or beyond the leg leaves the foot on the slide line instead.
        var aim=target;aim.y=Mathf.Clamp(aim.y,.09f,.35f);var reach=aim-upper.position;
        var line=upper.position+forward*leg*.94f;line.y=.09f;
        bool usable=Vector3.Dot(reach.normalized,forward)>.35f&&reach.magnitude<leg*.995f;
        Blend(upper,lower,foot,usable?aim:line,w,Vector3.up);
        reachable=usable;contactError=Vector3.Distance(foot.position,target);
        var tuckUpper=leftLead?rightUpper:leftUpper;var tuckLower=leftLead?rightLower:leftLower;var tuckFoot=leftLead?rightFoot:leftFoot;
        var tuck=hips.position+forward*.12f-right*lead*.18f;tuck.y=.1f;Blend(tuckUpper,tuckLower,tuckFoot,tuck,w,forward+Vector3.up*.25f);
        // The entering slide blends out of a running stride whose knee/boot may
        // point below the newly lowered pelvis. Constrain both soles throughout
        // that blend; otherwise the first slide pictures cut boots through turf.
        void GroundFoot(Transform thigh,Transform calf,Transform ankle,Quaternion rest){
            float clearance=ground!=null&&ground.Calibrated?root.position.y+ground.ankle*root.lossyScale.y:.28f;
            if(ankle.position.y<clearance){var onTurf=ankle.position;onTurf.y=clearance;Solve(thigh,calf,ankle,onTurf,forward+Vector3.up);}
            ankle.rotation=root.rotation*rest;
        }
        GroundFoot(leftUpper,leftLower,leftFoot,restLeftFootRotation);GroundFoot(rightUpper,rightLower,rightFoot,restRightFootRotation);
        contactError=Vector3.Distance(foot.position,target);
        var supportArm=leftLead?arm:leftArm;var supportForearm=leftLead?forearm:leftForearm;var supportHand=leftLead?hand:leftHand;
        if(supportArm!=null&&supportForearm!=null&&supportHand!=null){var palm=hips.position-forward*.28f-right*lead*.34f;palm.y=.18f;Blend(supportArm,supportForearm,supportHand,palm,w*.85f);}
    }
    public void PrepareContact(Vector3 point,string kind){
        if(kind!="foot"&&kind!="left-foot")return;var upper=kind=="left-foot"?leftUpper:rightUpper;var lower=kind=="left-foot"?leftLower:rightLower;var end=kind=="left-foot"?leftFoot:rightFoot;float length=Vector3.Distance(upper.position,lower.position)+Vector3.Distance(lower.position,end.position),distance=Vector3.Distance(upper.position,point);
        // A small knee bend is allowed for differences between the authored rig
        // and the native foot volume. Far contacts receive no body correction.
        float excess=distance-length;var direction=upper.position-point;
        if(excess>0&&excess<.1f&&direction.y/distance>.65f)hips.position-=Vector3.up*Mathf.Min(.12f,(excess+.004f)*distance/direction.y);
    }
    public void Plant(bool right=false){
        if(!planted||plantRight!=right){
            anchor=root.TransformPoint(right?restRight:restLeft);
            // The support foot rests on the pitch, not at the height of whichever
            // clip happened to be bound when the actor was created.
            if(ground!=null&&ground.Calibrated)anchor.y=root.position.y+ground.ankle*root.lossyScale.y;
            planted=true;plantRight=right;
        }
        var upper=right?rightUpper:leftUpper;var lower=right?rightLower:leftLower;var end=right?rightFoot:leftFoot;var correction=anchor-end.position;if(correction.magnitude<.65f)Solve(upper,lower,end,anchor);plantError=Vector3.Distance(anchor,end.position);
    }
    // weight below one blends between the authored (FK) and the solved limb.
    // record=false is a release frame: it leaves the reported contact untouched.
    public Vector3 Contact(Vector3 point,string kind,float weight=1,bool record=true){
        weight=Mathf.Clamp01(weight);
        if(kind=="head"){
            if(head==null||spine==null)return point;
            float before=Vector3.Distance(head.position,point);Head(point,weight);
            if(record){reachable=Vector3.Distance(head.position,point)<before||before<.3f;contactError=Vector3.Distance(head.position,point);}return head.position;
        }
        if(kind=="two-hands"){
            // Both palms meet an actual central ball; each stays within its arm length.
            var side=root.right*.11f;bool right=CanReach(arm,forearm,hand,point+side),left=CanReach(leftArm,leftForearm,leftHand,point-side);
            if(right)Blend(arm,forearm,hand,point+side,weight);if(left)Blend(leftArm,leftForearm,leftHand,point-side,weight);
            var middle=(hand.position+leftHand.position)/2;if(record){reachable=right&&left;contactError=Vector3.Distance(middle,point);}return middle;
        }
        bool leftFootKind=kind=="left-foot",leftSave=kind=="left-hand";var upper=leftSave?leftArm:kind=="hand"?arm:leftFootKind?leftUpper:rightUpper;var lower=leftSave?leftForearm:kind=="hand"?forearm:leftFootKind?leftLower:rightLower;var end=leftSave?leftHand:kind=="hand"?hand:leftFootKind?leftFoot:rightFoot;
        bool canReach=CanReach(upper,lower,end,point);if(canReach)Blend(upper,lower,end,point,weight);
        if(record){reachable=canReach;contactError=Vector3.Distance(end.position,point);}return end.position;
    }
    // Bends spine and head toward an actual header contact, at most HeadReach degrees.
    void Head(Vector3 point,float weight){
        var from=head.position-spine.position;var to=point-spine.position;if(from.sqrMagnitude<1e-6f||to.sqrMagnitude<1e-6f)return;
        var full=Quaternion.FromToRotation(from,to);full.ToAngleAxis(out float angle,out var axis);if(angle>180)angle-=360;
        float limited=Mathf.Clamp(angle,-HeadReach,HeadReach)*weight;if(Mathf.Abs(limited)<.001f)return;
        spine.rotation=Quaternion.AngleAxis(limited,axis)*spine.rotation;
    }
    static void Blend(Transform upper,Transform lower,Transform end,Vector3 point,float weight,Vector3? poleDirection=null){
        if(weight>=1){Solve(upper,lower,end,point,poleDirection);return;}if(weight<=0)return;
        var a=upper.rotation;var b=lower.rotation;var c=end.rotation;Solve(upper,lower,end,point,poleDirection);
        upper.rotation=Quaternion.Slerp(a,upper.rotation,weight);lower.rotation=Quaternion.Slerp(b,lower.rotation,weight);end.rotation=c;
    }
    public static bool CanReach(Transform upper,Transform lower,Transform end,Vector3 point){float a=Vector3.Distance(upper.position,lower.position),b=Vector3.Distance(lower.position,end.position),d=Vector3.Distance(upper.position,point);return d>=Math.Abs(a-b)+.00001&&d<=a+b-.00001;}
    public static Vector3 Solve(Transform upper,Transform lower,Transform end,Vector3 point,Vector3? poleDirection=null){
        var hip=upper.position;var knee=lower.position;float a=Vector3.Distance(hip,knee),b=Vector3.Distance(knee,end.position);var direction=(point-hip).normalized;float d=Mathf.Clamp(Vector3.Distance(hip,point),Mathf.Abs(a-b)+.00001f,a+b-.00001f),along=(a*a-b*b+d*d)/(2*d),height=Mathf.Sqrt(Mathf.Max(0,a*a-along*along));var pole=Vector3.ProjectOnPlane(poleDirection??(knee-hip),direction);if(pole.sqrMagnitude<1e-8)pole=Vector3.ProjectOnPlane(upper.forward,direction);pole.Normalize();var wantedKnee=hip+direction*along+pole*height;var rotation=end.rotation;upper.rotation=Quaternion.FromToRotation(lower.position-hip,wantedKnee-hip)*upper.rotation;lower.rotation=Quaternion.FromToRotation(end.position-lower.position,hip+direction*d-lower.position)*lower.rotation;end.rotation=rotation;return end.position;
    }
}
}

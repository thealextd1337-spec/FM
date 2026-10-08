using System;
using UnityEngine;
namespace Doppel6.Probe {
public static class ProbePose {
    public struct Sample {public string clip,kind;public double time;public double[] point;public bool active;}
    public sealed class Rig {public Transform upperLeg,leg,foot,arm,forearm,hand;public Rig(Transform root){foreach(var t in root.GetComponentsInChildren<Transform>()){switch(t.name){case "mixamorig:RightUpLeg":upperLeg=t;break;case "mixamorig:RightLeg":leg=t;break;case "mixamorig:RightFoot":foot=t;break;case "mixamorig:RightArm":arm=t;break;case "mixamorig:RightForeArm":forearm=t;break;case "mixamorig:RightHand":hand=t;break;}}}}
    public static Sample Read(Actor a,State s){double age=Math.Max(0,s.elapsed-a.poseStarted),duration=a.pose=="prepare-pass"?.65:.75;bool prepare=a.pose=="prepare-pass"||a.pose=="prepare-shot";string clip=Math.Sqrt(a.velocity[0]*a.velocity[0]+a.velocity[2]*a.velocity[2])>.1?"running":a.role=="keeper"?"keeper_ready_meshy":"idle_stand_meshy";double time=s.elapsed;
        if(prepare&&age<duration+1){clip="shot_meshy";time=age<=duration?age/duration*.46:.46+age-duration;}if(a.pose=="parry"&&age<1.3){clip="keeper_low_meshy";time=1.1+age;}
        bool hand=a.role=="keeper"&&(s.playPhase=="shot-flight"||a.pose=="parry"&&age<.2);string kind=hand?"hand":"foot";var point=ProbePlay.Point(a,kind);double distance=0;for(int i=0;i<3;i++)distance+=Math.Pow(s.ball.position[i]-point[i],2);distance=Math.Sqrt(distance);bool active=hand?distance<2||a.pose=="parry"&&age<.2:prepare&&age<duration+.12||s.ownerId==a.id||(a.action=="receive"||a.action=="intercept")&&distance<.85;return new Sample{clip=clip,time=time,kind=kind,point=point,active=active};
    }
    public static Vector3 Solve(Rig rig,double[] point,string kind){var upper=kind=="hand"?rig.arm:rig.upperLeg;var lower=kind=="hand"?rig.forearm:rig.leg;var end=kind=="hand"?rig.hand:rig.foot;if(upper==null||lower==null||end==null)throw new InvalidOperationException("Missing contact bones");
        var target=new Vector3((float)point[0],(float)point[1],(float)point[2]);var hip=upper.position;var knee=lower.position;var foot=end.position;float a=Vector3.Distance(hip,knee),b=Vector3.Distance(knee,foot);var direction=(target-hip).normalized;float d=Mathf.Clamp(Vector3.Distance(hip,target),Mathf.Abs(a-b)+.00001f,a+b-.00001f),along=(a*a-b*b+d*d)/(2*d),height=Mathf.Sqrt(Mathf.Max(0,a*a-along*along));var pole=Vector3.ProjectOnPlane(knee-hip,direction);if(pole.sqrMagnitude<1e-8)pole=Vector3.ProjectOnPlane(upper.root.forward,direction);pole.Normalize();var wantedKnee=hip+direction*along+pole*height;var wantedEnd=hip+direction*d;var rotation=end.rotation;upper.rotation=Quaternion.FromToRotation(lower.position-hip,wantedKnee-hip)*upper.rotation;lower.rotation=Quaternion.FromToRotation(end.position-lower.position,wantedEnd-lower.position)*lower.rotation;end.rotation=rotation;return end.position;
    }
}
}

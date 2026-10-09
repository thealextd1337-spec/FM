using System;
using UnityEngine;
namespace Doppel6.Probe {
// Envelopes for duel pictures that have no authored clip on this rig: the
// native slide and its recovery, the standing tackle and the foul offender.
// Every value is a pure function of the received progress, so a paused or
// replayed picture shows exactly the same pose. Nothing here moves the root,
// the ball or decides a contact.
public static class FootballDuelTiming {
    // Degrees the body leans back during a full slide; the chest stays up.
    public const float SlideLean=52,SlideBank=16,SlideHips=.34f;
    // keeper_rise_meshy: hips 0.37 m at 4.4 s, standing (1.30 m) by 6.3 s.
    public const double RiseFrom=4.4,RiseLength=1.9;
    // foul_stumble_meshy stays upright for its first 3.3 s, then falls to the
    // knees (measured hip track). The 2.7 s native foul window uses the upright part.
    public const double StumbleLength=2.7,OffenderSettle=2.1;
    static float Smooth(double x){var t=(float)Math.Clamp(x,0,1);return t*t*(3-2*t);}
    // Drops into the slide within its first fifth and stays down until the end.
    public static float Slide(double progress){return Smooth(Math.Clamp(progress,0,1)/.2);}
    // The procedural slide hands over to the rise clip over the first 45%.
    public static float Recovery(double progress){return 1-Smooth(Math.Clamp(progress,0,1)/.45);}
    public static double RiseTime(double progress){return RiseFrom+Math.Clamp(progress,0,1)*RiseLength;}
    // Standing tackle: full lunge at the native contact (progress 0), released
    // over the rest of the 0.48 s pose.
    public static float Lunge(double progress){return 1-Smooth((Math.Clamp(progress,0,1)-.12)/.88);}
    // Foul offender: the challenge lunge fades in 0.45 s while the stumble plays;
    // from OffenderSettle the body settles back into the standing pose.
    public static float OffenderLunge(double seconds){return 1-Smooth(seconds/.45);}
    public static float OffenderStumble(double seconds){return 1-Smooth((seconds-OffenderSettle)/(StumbleLength-OffenderSettle));}
    // Lead leg: the side of the actual contact; straight ahead uses the squad
    // number, so the choice never changes between paused or replayed pictures.
    public static bool LeftLead(Vector3 localTarget,int number){return Mathf.Abs(localTarget.x)>.12f?localTarget.x<0:number%2==0;}
}
}

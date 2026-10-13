using System;
using System.Collections.Generic;
using UnityEngine;
namespace Doppel6.Probe {
// Display shape of a goal net from the received native net fact (WorldNet: goal sign, impact z/height on the back
// net, age since the rear impact, bulge) and the picture's native goal-scene time. A pure function of (rest point,
// panel, fact, scene time, geometry): no clock of its own, integrator, randomness, saved state or ball authority, so
// live play, pause, replay and seek show the same net for the same picture at any frame rate. Back panel: a C1 pocket
// at the impact scaled by the native bulge, an outward-travelling damped ripple and a damped sway of the whole panel
// (both functions of the native age, smooth from age 0). Roof and side panels follow the bulge gently and only
// outward. Points within Fixed of a frame line (posts, crossbar, ground, rear supports, rear crossbar, roof supports)
// never move. Only the back net, Depth behind the goal line, moves toward the field: its recoil past rest is bounded
// by RippleAmplitude+SwayAmplitude (a few cm in practice), so no vertex comes near the goal plane. Once FadeEnd has
// passed and the native bulge has decayed, or the native scene hold has eased out (HoldEnd), the net is exactly at rest.
public static class WorldNetDeformation {
    public enum Panel:byte {None,Back,Roof,Left,Right}
    // ProbeBridge.BuildWorld places the back panel 2.2 m behind the goal line.
    public const double Depth=2.2;
    // Membrane attachment: zero within Fixed of a frame line, then a linear rise easing to 1 over the ramp (C1).
    public const double Fixed=.03,RampWidth=.8,RampHeight=.7,RampDepth=.6;
    // Pocket: Wendland C2 kernel; metres per unit of native bulge (the rear-hit bulge peaks at .6 after 60 ms).
    public const double PocketAmplitude=.6,PocketRadius=3.0;
    // Below RestBulge the native bulge (decaying exponentially) blends smoothly to an exact rest pocket (< 25 um).
    public const double RestBulge=2e-5;
    // Outward-travelling damped ripple (retarded time age-r/RippleSpeed) and damped sway of the back panel's
    // fundamental mode; both start smoothly at the impact and fade out completely between FadeStart and FadeEnd.
    public const double RippleAmplitude=.14,RippleFrequency=2.2,RippleSpeed=4.5,RippleDecay=.32,RippleOnset=.12,RippleSpread=.6;
    public const double SwayAmplitude=.10,SwayFrequency=1.5,SwayDecay=.4,SwayOnset=.1;
    public const double FadeStart=1.2,FadeEnd=1.6;
    // Native scene hold: the goal scene caps its scene time at HoldStart (world-goal-scene-v83.js), so the rear-hit
    // age and bulge (world-pitch3d-v98.js v119VisibleGoalView) stop there while the goal pause runs on to 4.05 s and
    // the fact then ends. With the picture's goal-scene time (WorldFrame.celebrationTime = 4.05 - goalPause, sent with
    // every goal-scene picture) whatever the held fact shows eases to exact rest between HoldStart and HoldEnd, well
    // before the fact ends: no frozen ripple, no reset pop. Goals that reach rest before HoldStart are unchanged.
    public const double HoldStart=2.45,HoldEnd=3.25;
    // Roof and side panels: outward only, per unit of bulge; roof by impact height, sides by lateral proximity.
    public const double SympathyAmplitude=.09,RoofRadius=3.0,SideRadius=2.0;
    // Radial profile samples (m); a uniform Catmull-Rom spline keeps the profile C1 between samples.
    public const double Step=.04;
    const double PerStep=1/Step;

    public static Panel PanelOf(string tag){switch(tag){case "back":return Panel.Back;case "roof":return Panel.Roof;case "left":return Panel.Left;case "right":return Panel.Right;default:return Panel.None;}}
    // Share of the shown deformation at a picture's goal-scene time: 1 until HoldStart, smootherstep to exactly 0 at
    // HoldEnd; 1 for a picture without one (NaN).
    public static double Hold(double sceneTime)=>Finite(sceneTime)?1-Smoother((sceneTime-HoldStart)/(HoldEnd-HoldStart)):1;

    // The displaced position of a rest vertex of a goal net as ProbeBridge.GoalNet builds it (tags "back", "roof",
    // "left", "right"). Rest for a null or invalid fact, the other goal, an unknown tag, a fact at rest and a hold that
    // has eased out. sceneTime: the picture's goal-scene time (celebrationTime), NaN without one.
    public static Vector3 Displace(Vector3 rest,string tag,WorldNet net,Geometry geometry,double sceneTime=double.NaN){
        var panel=PanelOf(tag);int sign=rest.x>0?1:-1;return Move(rest,panel,sign,Amount(rest,panel,sign,net,geometry,sceneTime));
    }
    // The same displacement in metres along the panel's outward normal (back: away from the field, roof: up, sides:
    // away from the goal centre), before the float vertex rounding.
    public static double Offset(Vector3 rest,string tag,WorldNet net,Geometry geometry,double sceneTime=double.NaN)=>Amount(rest,PanelOf(tag),rest.x>0?1:-1,net,geometry,sceneTime);
    static double Amount(Vector3 rest,Panel panel,int sign,WorldNet net,Geometry geometry,double sceneTime){
        if(net==null||geometry==null||panel==Panel.None||net.sign!=sign)return 0;
        var goal=new Goal(geometry);if(!goal.Valid)return 0;
        var i=Prepare(net,goal,Hold(sceneTime));if(!i.Moving)return 0;
        double window=Window(panel,rest,sign,goal);if(window==0)return 0;
        switch(panel){
            case Panel.Back:return BackAmount(window,Mode(rest.z,rest.y,goal),rest,i,null,goal.Last);
            case Panel.Roof:return SideAmount(window,i.Roof,rest.z-i.Z,RoofRadius);
            case Panel.Left:return SideAmount(window,i.Left,rest.y-i.H,SideRadius);
            default:return SideAmount(window,i.Right,rest.y-i.H,SideRadius);
        }
    }

    // One goal's net mesh: the attachment windows are fixed at load and the radial profile is sampled once per
    // picture; every vertex equals Displace exactly. No allocation after construction.
    public sealed class Field {
        struct Run {public Panel panel;public int start,end;public bool dirty;}
        readonly Vector3[] rest;readonly double[] windows,modes,table;readonly Run[] runs;readonly Goal goal;readonly int sign;
        readonly double length,width,height;
        bool deformed,shown;double z,h,age,bulge,hold;float largest;
        public Field(Vector3[] rest,string[] tags,int goalSign,Geometry geometry){
            this.rest=rest;sign=goalSign>=0?1:-1;goal=new Goal(geometry);length=geometry.length;width=geometry.goalWidth;height=geometry.goalHeight;
            windows=new double[rest.Length];modes=new double[rest.Length];table=new double[goal.Last+3];var list=new List<Run>();
            for(int k=0;k<rest.Length;k++){
                var p=PanelOf(tags[k]);windows[k]=goal.Valid?Window(p,rest[k],sign,goal):0;modes[k]=goal.Valid&&p==Panel.Back?Mode(rest[k].z,rest[k].y,goal):0;
                if(list.Count==0||list[list.Count-1].panel!=p)list.Add(new Run{panel=p,start=k,end=k+1});else{var run=list[list.Count-1];run.end=k+1;list[list.Count-1]=run;}
            }
            runs=list.ToArray();
        }
        // Built for these rest vertices and this goal size.
        public bool Uses(Vector3[] rest,Geometry geometry)=>ReferenceEquals(this.rest,rest)&&geometry!=null&&geometry.length==length&&geometry.goalWidth==width&&geometry.goalHeight==height;
        public bool Deformed=>deformed;
        public bool Update(WorldNet net,Vector3[] output,out float largest)=>Update(net,double.NaN,output,out largest);
        // Writes this goal's picture of the fact at the picture's goal-scene time into output (the mesh vertex buffer,
        // as long as the rest vertices). True when output changed and needs an upload; an unchanged picture or an
        // undisturbed net writes nothing. largest: the largest displacement shown (m).
        public bool Update(WorldNet net,double sceneTime,Vector3[] output,out float largest){
            double share=Hold(sceneTime);var i=net!=null&&net.sign==sign&&goal.Valid?Prepare(net,goal,share):default;
            if(!i.Moving){
                shown=false;largest=this.largest=0;if(!deformed)return false;
                Array.Copy(rest,output,rest.Length);for(int r=0;r<runs.Length;r++)runs[r].dirty=false;deformed=false;return true;
            }
            if(shown&&net.z==z&&net.height==h&&net.age==age&&net.bulge==bulge&&share==hold){largest=this.largest;return false;}
            for(int k=0;k<table.Length;k++)table[k]=Sample(i,k);
            double max=0;
            for(int r=0;r<runs.Length;r++){
                ref var run=ref runs[r];
                double amplitude=run.panel==Panel.Roof?i.Roof:run.panel==Panel.Left?i.Left:run.panel==Panel.Right?i.Right:0;
                if(run.panel==Panel.None||run.panel!=Panel.Back&&amplitude==0){if(run.dirty){Array.Copy(rest,run.start,output,run.start,run.end-run.start);run.dirty=false;}continue;}
                run.dirty=true;
                for(int k=run.start;k<run.end;k++){
                    double w=windows[k];var p=rest[k];if(w==0){output[k]=p;continue;}
                    double amount=run.panel==Panel.Back?BackAmount(w,modes[k],p,i,table,goal.Last):run.panel==Panel.Roof?SideAmount(w,amplitude,p.z-i.Z,RoofRadius):SideAmount(w,amplitude,p.y-i.H,SideRadius);
                    output[k]=Move(p,run.panel,sign,amount);double m=amount<0?-amount:amount;if(m>max)max=m;
                }
            }
            deformed=shown=true;z=net.z;h=net.height;age=net.age;bulge=net.bulge;hold=share;largest=this.largest=(float)max;return true;
        }
    }

    struct Goal {
        public readonly double Half,Width,Height,RampU,RampV,RampD;public readonly int Last;public readonly bool Valid;
        public Goal(Geometry g){
            Half=g.length/2;Width=g.goalWidth;Height=g.goalHeight;Valid=Finite(Half)&&Finite(Width)&&Finite(Height)&&Width>=.5&&Height>=.5;
            RampU=Math.Min(RampWidth,.45*Width);RampV=Math.Min(RampHeight,.45*Height);RampD=Math.Min(RampDepth,.45*Depth);
            Last=Valid?(int)Math.Ceiling(Math.Sqrt((Width+.2)*(Width+.2)+(Height+.2)*(Height+.2))/Step)+1:1;
        }
    }
    // Per-picture constants of one fact; share scales every motion (the eased native scene hold).
    struct Impact {public bool Moving;public double Z,H,Age,Main,Ripple,Sway,Roof,Left,Right;}
    static Impact Prepare(WorldNet net,in Goal goal,double share){
        var i=new Impact();
        if(!(share>0)||Math.Abs(net.sign)!=1||!Finite(net.z)||!Finite(net.height)||!Finite(net.age)||!Finite(net.bulge))return i;
        i.Z=Math.Clamp(net.z,-goal.Width/2,goal.Width/2);i.H=Math.Clamp(net.height,0,goal.Height);i.Age=Math.Max(0,net.age);
        double bulge=Math.Clamp(net.bulge,0,1.5),settle=Smoother(bulge/RestBulge-1);i.Main=PocketAmplitude*bulge*settle*share;
        if(i.Age>0&&i.Age<FadeEnd){
            double fade=Fade(i.Age)*share;i.Ripple=RippleAmplitude*Math.Exp(-i.Age/RippleDecay)*fade;
            i.Sway=SwayAmplitude*Math.Exp(-i.Age/SwayDecay)*fade*Smoother(i.Age/SwayOnset)*Math.Sin(2*Math.PI*SwayFrequency*i.Age)*Mode(i.Z,i.H,goal);
        }
        if(i.Main>0){
            double follow=SympathyAmplitude*bulge*settle*share,left=1-(i.Z+goal.Width/2)/goal.Width,right=1-(goal.Width/2-i.Z)/goal.Width;
            i.Roof=follow*Smooth(i.H/goal.Height);i.Left=follow*left*left;i.Right=follow*right*right;
        }
        i.Moving=i.Main>0||i.Ripple>0||i.Sway!=0;return i;
    }
    // Pocket plus ripple at distance r from the impact; the sample k lies at r=k*Step.
    static double Sample(in Impact i,int k){
        double r=k*Step,value=i.Main>0?i.Main*Wendland(r/PocketRadius):0;
        if(i.Ripple>0){double s=i.Age-r/RippleSpeed;if(s>0)value+=i.Ripple*Smoother(s/RippleOnset)*Math.Sin(2*Math.PI*RippleFrequency*s)/Math.Sqrt(1+r/RippleSpread);}
        return value;
    }
    static double BackAmount(double window,double mode,Vector3 rest,in Impact i,double[] table,int last){
        double du=rest.z-i.Z,dv=rest.y-i.H,x=Math.Sqrt(du*du+dv*dv)*PerStep;int k=(int)x;if(k>=last){k=last;x=last;}double t=x-k;
        // Uniform Catmull-Rom over the samples; the mirrored sample at r<0 keeps the slope at the impact zero.
        double radial=table!=null?Spline(table[k==0?1:k-1],table[k],table[k+1],table[k+2],t):Spline(Sample(i,k==0?1:k-1),Sample(i,k),Sample(i,k+1),Sample(i,k+2),t);
        return window*(radial+mode*i.Sway);
    }
    static double Spline(double p0,double p1,double p2,double p3,double t)=>p1+.5*t*(p2-p0+t*(2*p0-5*p1+4*p2-p3+t*(3*(p1-p2)+p3-p0)));
    static double SideAmount(double window,double amplitude,double offset,double radius)=>window*(amplitude*Wendland(Math.Abs(offset)/radius));
    static Vector3 Move(Vector3 rest,Panel panel,int sign,double amount){
        if(amount==0)return rest;float a=(float)amount;
        switch(panel){
            case Panel.Back:return new Vector3(rest.x+sign*a,rest.y,rest.z);
            case Panel.Roof:return new Vector3(rest.x,rest.y+a,rest.z);
            case Panel.Left:return new Vector3(rest.x,rest.y,rest.z-a);
            case Panel.Right:return new Vector3(rest.x,rest.y,rest.z+a);
        }
        return rest;
    }
    // Attachment window of a rest point; the roof and sides lean toward the back panel (d/Depth).
    static double Window(Panel panel,Vector3 rest,int sign,in Goal goal){
        double u=rest.z,v=rest.y,d=sign*(double)rest.x-goal.Half,half=goal.Width/2;
        switch(panel){
            case Panel.Back:return Attach(u+half,goal.RampU)*Attach(half-u,goal.RampU)*Attach(v,goal.RampV)*Attach(goal.Height-v,goal.RampV);
            case Panel.Roof:return Attach(d,goal.RampD)*Attach(Depth-d,goal.RampD)*Attach(u+half,goal.RampU)*Attach(half-u,goal.RampU)*Math.Clamp(d/Depth,0,1);
            case Panel.Left:case Panel.Right:return Attach(d,goal.RampD)*Attach(Depth-d,goal.RampD)*Attach(v,goal.RampV)*Attach(goal.Height-v,goal.RampV)*Math.Clamp(d/Depth,0,1);
        }
        return 0;
    }
    // Fundamental mode of the back panel (zero on its frame).
    static double Mode(double u,double v,in Goal goal)=>Math.Sin(Math.PI*Math.Clamp((u+goal.Width/2)/goal.Width,0,1))*Math.Sin(Math.PI*Math.Clamp(v/goal.Height,0,1));
    static double Attach(double distance,double ramp){double x=(distance-Fixed)/(ramp-Fixed);return x<=0?0:x>=1?1:x*(2-x);}
    static double Wendland(double x){if(x>=1)return 0;double a=1-x,a2=a*a;return a2*a2*(4*x+1);}
    static double Fade(double age)=>age<=FadeStart?1:age>=FadeEnd?0:1-Smoother((age-FadeStart)/(FadeEnd-FadeStart));
    static double Smoother(double x){x=x<0?0:x>1?1:x;return x*x*x*(x*(x*6-15)+10);}
    static double Smooth(double x){x=x<0?0:x>1?1:x;return x*x*(3-2*x);}
    static bool Finite(double n)=>!double.IsNaN(n)&&!double.IsInfinity(n);
}
}

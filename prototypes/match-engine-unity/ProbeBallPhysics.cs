using System;
namespace Doppel6.Probe {
// Isolated, deterministic ball probe. No PhysX or full-match claims.
public static class ProbeBallPhysics {
    const double Gravity=9.81,FrameRadius=.06;
    class Hit {public double t,e;public double[] n;public string type,reason;public bool boundary;}
    static double Dot(double[] a,double[] b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
    static double[] Sub(double[] a,double[] b){return new[]{a[0]-b[0],a[1]-b[1],a[2]-b[2]};}
    static double Length(double[] a){return Math.Sqrt(Dot(a,a));}
    static Hit Sweep(double[] p,double[] v,double[] a,double[] b,double r,double dt){
        var axis=Sub(b,a);double length=Length(axis);var u=new[]{axis[0]/length,axis[1]/length,axis[2]/length};var q=Sub(p,a);double along=Dot(q,u),speed=Dot(v,u);var perp=new double[3];var vp=new double[3];for(int i=0;i<3;i++){perp[i]=q[i]-along*u[i];vp[i]=v[i]-speed*u[i];}Hit best=null;
        void Candidate(double[] relative,double[] velocity,Func<double,bool> valid,Func<double,double[]> center){double aa=Dot(velocity,velocity),bb=Dot(relative,velocity),cc=Dot(relative,relative)-r*r;if(aa<1e-15)return;double disc=bb*bb-aa*cc;if(disc<0)return;double t=cc<=1e-10?0:(-bb-Math.Sqrt(disc))/aa;if(t<0||t>dt||!valid(t))return;var c=center(t);var n=new double[3];for(int i=0;i<3;i++)n[i]=p[i]+v[i]*t-c[i];double l=Length(n);if(l<1e-12)return;for(int i=0;i<3;i++)n[i]/=l;if(Dot(v,n)>=-1e-8)return;if(best==null||t<best.t)best=new Hit{t=t,n=n};}
        Candidate(perp,vp,t=>along+speed*t>=0&&along+speed*t<=length,t=>new[]{a[0]+u[0]*(along+speed*t),a[1]+u[1]*(along+speed*t),a[2]+u[2]*(along+speed*t)});
        foreach(var end in new[]{a,b})Candidate(Sub(p,end),v,t=>true,t=>end);return best;
    }
    public static void Substep(State s,double h,Action<string,string> emit,Func<double,PlayerHit> find=null,Action<double> move=null,Action<PlayerHit> resolve=null){
        var b=s.ball;var p=b.position;var v=b.velocity;var g=s.geometry;bool air=p[1]>b.radius+1e-8||v[1]>0;
        if(air)v[1]-=Gravity*h/2;else{v[1]=0;double speed=Math.Sqrt(v[0]*v[0]+v[2]*v[2]),next=Math.Max(0,speed-2.4*h);if(speed>0){v[0]*=next/speed;v[2]*=next/speed;}}
        double remaining=h;
        for(int count=0;remaining>1e-10&&count<8;count++){
            Hit first=null;
            void Contact(double t,double[] n,string type,string reason,double e){if(t>=-1e-10&&t<=remaining&&(first==null||t<first.t))first=new Hit{t=Math.Max(0,t),n=n,type=type,reason=reason,e=e};}
            if(v[1]<-1e-8)Contact((b.radius-p[1])/v[1],new[]{0.0,1,0},"ground-contact","Boden",.52);
            foreach(int sign in new[]{-1,1}){double x=sign*g.length/2;foreach(double z in new[]{-g.goalWidth/2,g.goalWidth/2}){var c=Sweep(p,v,new[]{x,0,z},new[]{x,g.goalHeight,z},b.radius+FrameRadius,remaining);if(c!=null)Contact(c.t,c.n,"frame-contact","Pfosten",.62);}var cross=Sweep(p,v,new[]{x,g.goalHeight,-g.goalWidth/2},new[]{x,g.goalHeight,g.goalWidth/2},b.radius+FrameRadius,remaining);if(cross!=null)Contact(cross.t,cross.n,"frame-contact","Latte",.62);}
            if(!s.boundaryDelivered)foreach(int axis in new[]{0,2})if(Math.Abs(v[axis])>1e-8){int sign=Math.Sign(v[axis]);double limit=(axis==0?g.length:g.width)/2+b.radius,t=(sign*limit-p[axis])/v[axis];if(t>=0&&t<=remaining&&(first==null||t<first.t))first=new Hit{t=t,boundary=true};}
            var player=find?.Invoke(remaining);if(player!=null&&(first==null||player.t<first.t)){for(int i=0;i<3;i++)p[i]+=v[i]*player.t;move?.Invoke(player.t);remaining-=player.t;resolve(player);break;}
            double advance=first!=null?first.t:remaining;for(int i=0;i<3;i++)p[i]+=v[i]*advance;move?.Invoke(advance);remaining-=advance;if(first==null)break;
            if(first.boundary){s.boundaryDelivered=true;bool goal=Math.Abs(p[0])>=g.length/2+b.radius-1e-7&&Math.Abs(p[2])+b.radius<g.goalWidth/2&&p[1]+b.radius<g.goalHeight;if(goal){s.goalSign=Math.Sign(p[0]);s.score[g.attackDirection>0?0:1]++;}s.outcome=goal?"goal":"out";emit(s.outcome,null);continue;}
            double normalSpeed=Dot(v,first.n);for(int i=0;i<3;i++){v[i]-=(1+first.e)*normalSpeed*first.n[i];p[i]+=first.n[i]*1e-8;}if(first.type=="ground-contact"&&Math.Abs(v[1])<.45)v[1]=0;
            if(first.type!="ground-contact"||Math.Abs(normalSpeed)>.45)emit(first.type,first.reason);
            if(first.type=="frame-contact"||first.type=="ground-contact"&&string.IsNullOrEmpty(s.outcome)){if(string.IsNullOrEmpty(s.outcome))s.outcome=first.type;}
        }
        if(remaining>1e-10)move?.Invoke(remaining);
        ProbeNet.Step(s,h,emit);
        if(air&&p[1]>b.radius+1e-8)v[1]-=Gravity*h/2;if(p[1]<b.radius){p[1]=b.radius;v[1]=Math.Max(0,v[1]);}
    }
    public static void Step(State s,Config config,Action<string,string> emit){
        if(!s.running||s.finished)return;double end=s.resultDelivered?s.followThroughUntil:config.scenario.duration,dt=Math.Min(ProbeSimulation.StepSeconds,end-s.elapsed);
        if(dt>1e-10){for(int n=0;n<8;n++)Substep(s,dt/8,emit);s.elapsed+=dt;s.tick=(int)Math.Round(s.elapsed/ProbeSimulation.StepSeconds);}
        if(!s.resultDelivered&&(!string.IsNullOrEmpty(s.outcome)||s.elapsed>=config.scenario.duration-1e-8)){s.resultDelivered=true;s.resolvedAt=s.elapsed;s.followThroughUntil=s.elapsed+config.followThroughSeconds;emit("result",null);}
        s.following=s.resultDelivered&&s.elapsed<s.followThroughUntil-1e-8;s.finished=s.resultDelivered&&!s.following;if(s.finished)s.running=false;
    }
}
}

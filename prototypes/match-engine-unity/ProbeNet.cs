using System;
using System.Collections.Generic;
namespace Doppel6.Probe {
[Serializable] public class NetPatch {public string panel;public int goalSign;public double[] position;public double displacement,velocity,peak;public bool touching,contacting;}
public static class ProbeNet {
    public static void Step(State s,double h,Action<string,string> emit){
        if(s.netPatches==null)s.netPatches=new List<NetPatch>();
        foreach(var patch in s.netPatches){patch.touching=false;patch.velocity+=(-65*patch.displacement-7*patch.velocity)*h;patch.displacement+=patch.velocity*h;if(Math.Abs(patch.displacement)+Math.Abs(patch.velocity)<.0001){patch.displacement=0;patch.velocity=0;}}
        if(s.goalSign==0)return;var g=s.geometry;var b=s.ball;var p=b.position;var v=b.velocity;int sign=s.goalSign;double depth=sign*p[0]-g.length/2;if(depth<0){foreach(var patch in s.netPatches)patch.contacting=false;return;}
        var names=new[]{"back","left","right","roof"};var axes=new[]{0,2,2,1};var outs=new[]{sign,-1,1,1};var limits=new[]{g.length/2+2.2-b.radius,g.goalWidth/2-b.radius,g.goalWidth/2-b.radius,g.goalHeight-b.radius};
        for(int i=0;i<4;i++){string panel=names[i];int axis=axes[i],outward=outs[i];double limit=limits[i],penetration=p[axis]*outward-limit;if(penetration<=0)continue;
            if(panel=="back"&&(Math.Abs(p[2])>g.goalWidth/2+.1||p[1]>g.goalHeight+.1))continue;if(panel!="back"&&depth>2.2+.1)continue;
            var patch=s.netPatches.Find(q=>q.panel==panel&&q.goalSign==sign);bool contact=patch!=null&&patch.contacting;
            if(patch==null){patch=new NetPatch{panel=panel,goalSign=sign,position=(double[])p.Clone()};s.netPatches.Add(patch);}if(!contact)emit("net-contact",panel=="back"?"Rücknetz":panel=="roof"?"Netzdach":"Seitennetz");
            double amount=Math.Min(1.6,penetration),speed=v[axis]*outward;patch.position=(double[])p.Clone();patch.position[axis]=outward*(limit+b.radius);patch.displacement=amount;patch.velocity=speed;patch.peak=Math.Max(patch.peak,amount);patch.touching=true;
            v[axis]-=outward*Math.Max(0,90*penetration+24*speed)*h;if(penetration>1.6){p[axis]=outward*(limit+1.6);if(v[axis]*outward>0)v[axis]=0;}
        }
        foreach(var patch in s.netPatches)patch.contacting=patch.touching;
    }
    static double Weight(Geometry g,double x,double y,double z,string panel){double depth=Math.Abs(x)-g.length/2,half=g.goalWidth/2,edge=panel=="back"?Math.Min(Math.Min(y,g.goalHeight-y),Math.Min(z+half,half-z)):panel=="roof"?Math.Min(Math.Min(depth,2.2-depth),Math.Min(z+half,half-z)):Math.Min(Math.Min(depth,2.2-depth),Math.Min(y,g.goalHeight-y));double t=Math.Max(0,Math.Min(1,edge/.4));return t*t*(3-2*t);}
    public static double Displacement(Geometry g,double[] p,NetPatch patch){return Displacement(g,p[0],p[1],p[2],patch);}
    public static double Displacement(Geometry g,double x,double y,double z,NetPatch patch){int axis=patch.panel=="back"?0:patch.panel=="roof"?1:2;double dx=x-patch.position[0],dy=y-patch.position[1],dz=z-patch.position[2],d=(axis==0?0:dx*dx)+(axis==1?0:dy*dy)+(axis==2?0:dz*dz);return patch.displacement*Math.Min(1.4,Weight(g,x,y,z,patch.panel)/Math.Max(.05,Weight(g,patch.position[0],patch.position[1],patch.position[2],patch.panel)))*Math.Exp(-d/(2*.95*.95));}
}
}

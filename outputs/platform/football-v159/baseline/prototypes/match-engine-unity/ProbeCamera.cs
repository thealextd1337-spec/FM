using System;
using System.Collections.Generic;
using UnityEngine;
namespace Doppel6.Probe {
[Serializable] public class CameraPoint {public double[] position;}
public static class ProbeCamera {
    public static double[][] Points(Scenario s){
        if(s.cameraPoints!=null&&s.cameraPoints.Length>0)return Array.ConvertAll(s.cameraPoints,p=>p.position);
        var b=s.ball.position;var v=s.ball.velocity;double d=Math.Min(s.duration,1.2);var p=new List<double[]>{b,new[]{b[0]+v[0]*d,b[1]+v[1]*d,b[2]+v[2]*d}};
        foreach(var a in s.actors??new Actor[0])if(!string.IsNullOrEmpty(a.action)&&a.action!="none"){p.Add(a.position);p.Add(new[]{a.position[0]+a.velocity[0]*d,a.position[1]+a.velocity[1]*d,a.position[2]+a.velocity[2]*d});}
        if(Math.Abs(b[0])>s.geometry.length/2-15){double x=Math.Sign(b[0])*s.geometry.length/2,w=s.geometry.goalWidth/2;p.Add(new[]{x,0,-w});p.Add(new[]{x,s.geometry.goalHeight,w});}return p.ToArray();
    }
    public static void Apply(Camera camera,Scenario s,string mode,Ball ball=null){
        if(camera==null)return;camera.fieldOfView=50;
        if(mode!="contact"){float fit=Mathf.Max(1,(16f/9)/camera.aspect)*Mathf.Max((float)s.geometry.length/68,(float)s.geometry.width/44);camera.transform.position=new Vector3(0,48*fit,-55*fit);camera.transform.LookAt(Vector3.zero);return;}
        var lo=new[]{double.PositiveInfinity,double.PositiveInfinity,double.PositiveInfinity};var hi=new[]{double.NegativeInfinity,double.NegativeInfinity,double.NegativeInfinity};var points=new List<double[]>(Points(s));if((s.kind=="physics"||s.kind=="play")&&ball!=null)points.Add(ball.position);foreach(var p in points)for(int i=0;i<3;i++){lo[i]=Math.Min(lo[i],p[i]);hi[i]=Math.Max(hi[i],p[i]);}var c=new double[3];var h=new double[3];for(int i=0;i<3;i++){c[i]=(lo[i]+hi[i])/2;h[i]=(hi[i]-lo[i])/2;}double vertical=h[1]*.8+h[2]*.6+2.4,horizontal=h[0]+2.4,tan=Math.Tan(Math.PI*25/180),distance=Math.Max(12,Math.Max(horizontal/(tan*camera.aspect),vertical/tan))+h[2]*.8+h[1]*.6;
        var center=new Vector3((float)c[0],(float)c[1],(float)c[2]);camera.transform.position=center+new Vector3(0,(float)(distance*.6),(float)(-distance*.8));camera.transform.LookAt(center);
    }
}
}

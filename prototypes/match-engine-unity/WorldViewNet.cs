using System;
using UnityEngine;
namespace Doppel6.Probe {
public partial class ProbeBridge {
    void RenderWorldNet(WorldNet net){
        if(net==null&&!liveNetMoved)return;
        netMaxDeformation=0;
        foreach(var view in netViews){
            Array.Copy(view.rest,view.vertices,view.rest.Length);
            if(net!=null&&view.goalSign==net.sign){
                var g=worldView.Config.geometry;
                // A display deformation derived from the native recorded goal picture.
                // Fixed edges stay attached; it never applies an impulse to the ball.
                for(int i=0;i<view.rest.Length;i++){
                    var p=view.rest[i];if(view.tags[i]!="back")continue;
                    var anchor=Math.Sin(Math.PI*Math.Clamp(p.y/g.goalHeight,0,1))*Math.Sin(Math.PI*Math.Clamp((p.z+g.goalWidth/2)/g.goalWidth,0,1));
                    var distance=(p.z-net.z)*(p.z-net.z)+(p.y-net.height)*(p.y-net.height);
                    var tail=net.age>.6?.16*Math.Exp(-(net.age-.6)*2.2)*Math.Sin((net.age-.6)*17):0;
                    var displacement=(float)((net.bulge*.75+tail)*Math.Exp(-distance/5)*anchor);
                    view.vertices[i].x+=view.goalSign*displacement;netMaxDeformation=Math.Max(netMaxDeformation,Math.Abs(displacement));
                }
            }
            view.mesh.vertices=view.vertices;view.mesh.RecalculateBounds();view.mesh.RecalculateNormals();
        }
        liveNetMoved=net!=null;
    }
}
}

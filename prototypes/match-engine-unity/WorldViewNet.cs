using System;
using System.Collections.Generic;
using UnityEngine;
namespace Doppel6.Probe {
public partial class ProbeBridge {
    // One deformation field per goal net mesh (WorldNetDeformation.Field), rebuilt whenever BuildWorld makes new meshes.
    readonly List<WorldNetDeformation.Field> netFields=new List<WorldNetDeformation.Field>();
    void RenderWorldNet(WorldNet net){
        if(net==null&&!liveNetMoved)return;
        var g=worldView?.Config.geometry;if(g==null)return;
        bool current=netFields.Count==netViews.Count;
        for(int i=0;current&&i<netViews.Count;i++)current=netFields[i].Uses(netViews[i].rest,g);
        if(!current){netFields.Clear();foreach(var view in netViews)netFields.Add(new WorldNetDeformation.Field(view.rest,view.tags,view.goalSign,g));}
        // The native goal-scene time of the picture that carries this fact (RenderWorld stores it as displayed first),
        // so the net eases out of the native scene hold; none (NaN) for any other caller or an older picture.
        var picture=displayed;double sceneTime=net!=null&&picture!=null&&ReferenceEquals(picture.net,net)&&picture.celebrating?picture.celebrationTime:double.NaN;
        // A display deformation derived from the native recorded goal picture: fixed edges stay attached and it never
        // applies an impulse to the ball. Only a goal whose picture changed is uploaded; an inactive fact restores rest.
        netMaxDeformation=0;
        for(int i=0;i<netViews.Count;i++){
            var view=netViews[i];
            if(netFields[i].Update(net,sceneTime,view.vertices,out float largest)){view.mesh.vertices=view.vertices;view.mesh.RecalculateNormals();view.mesh.RecalculateBounds();}
            netMaxDeformation=Math.Max(netMaxDeformation,largest);
        }
        liveNetMoved=net!=null;
    }
}
}

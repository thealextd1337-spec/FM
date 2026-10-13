using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
namespace Doppel6.Probe {
public partial class ProbeBridge {
    // Ultra blocks of both clubs (StadiumSupporters): one figure mesh and one cloth mesh per block,
    // parented to their stand side so they hide with it and never move with frame.turned. Colours
    // come from the presentation clubs (kit colours only without a presentation); motion is the
    // D6Flag vertex shader driven by the displayed clock. Meshes join stadiumMeshes, atlases
    // stadiumTextures and materials the bridge materials, so a new fixture releases all of them.
    public SupporterPlan Supporters {get;private set;}
    SupporterSetup supporterSetup;
    readonly List<(Material material,int team)> supporterMaterials=new List<(Material,int)>();
    static readonly int SupporterTime=Shader.PropertyToID("_D6PresentTime"),SupporterCelebrate=Shader.PropertyToID("_D6Celebrate");

    void BuildSupporters(StadiumBlueprint plan){
        Supporters=null;supporterMaterials.Clear();if(plan==null||supporterSetup==null)return;
        var shader=Resources.Load<Shader>("D6Flag");if(shader==null)throw new InvalidOperationException("Supporter shader is unavailable");
        var supporters=StadiumSupporters.Plan(plan,supporterSetup,!ReducedQuality);Supporters=supporters;var look=LightLook;
        foreach(var block in supporters.Blocks){
            var parent=standSides[block.Block.Side];if(parent==null)continue;string role=block.Block.Role==0?"home":"away";var club=block;
            var atlas=StadiumTexture(StadiumSupporters.AtlasWidth,StadiumSupporters.AtlasHeight,(x,y)=>StadiumSupporters.AtlasTexel(x,y,club.Primary,club.Secondary,club.Pattern));atlas.wrapMode=TextureWrapMode.Clamp;
            SupporterRenderer(parent,"Supporters "+role+" figures",StadiumSupporters.BuildMesh(block.Figures,block.FigureBounds,"Supporters "+role+" figures"),SupporterMaterial(shader,null,look.crowdLight,block.Team));
            SupporterRenderer(parent,"Supporters "+role+" flags",StadiumSupporters.BuildMesh(block.Cloth,block.ClothBounds,"Supporters "+role+" flags"),SupporterMaterial(shader,atlas,look.bannerLight,block.Team));
        }
        UpdateSupporters(displayed??worldView?.Frame);
    }
    Material SupporterMaterial(Shader shader,Texture2D atlas,float light,int team){
        var m=new Material(shader);if(atlas!=null)m.SetTexture("_BaseMap",atlas);m.SetFloat("_D6Light",Mathf.Max(0,light));
        m.SetFloat("_Bob",StadiumSupporters.Bob);m.SetFloat("_BobJump",StadiumSupporters.BobJump);m.SetFloat("_BobHz",StadiumSupporters.BobHz);
        m.SetFloat("_Swing",StadiumSupporters.Swing);m.SetFloat("_SwingJump",StadiumSupporters.SwingJump);m.SetFloat("_SwingHz",StadiumSupporters.SwingHz);
        m.SetFloat("_Wave",StadiumSupporters.Wave);m.SetFloat("_WaveHz",StadiumSupporters.WaveHz);m.SetFloat("_WaveK",StadiumSupporters.WaveK);
        materials.Add(m);supporterMaterials.Add((m,team));return m;
    }
    void SupporterRenderer(Transform parent,string name,Mesh mesh,Material material){
        if(mesh==null)return;stadiumMeshes.Add(mesh);
        var go=new GameObject(name,typeof(MeshFilter),typeof(MeshRenderer));go.transform.SetParent(parent,false);
        go.GetComponent<MeshFilter>().sharedMesh=mesh;var renderer=go.GetComponent<MeshRenderer>();renderer.sharedMaterial=material;
        // Supporters stay out of the shadow map (their moving shadows would cross the stands).
        renderer.shadowCastingMode=ShadowCastingMode.Off;renderer.receiveShadows=true;
    }
    // Pure picture state of the displayed frame: the presentation time and the scoring club's
    // celebration. Pause, replay and seek show the same picture for the same frame.
    void UpdateSupporters(WorldFrame f){
        if(f==null||supporterMaterials.Count==0)return;float time=StadiumSupporters.PresentTime(f.clock);
        foreach(var (material,team) in supporterMaterials){if(material==null)continue;material.SetFloat(SupporterTime,time);material.SetFloat(SupporterCelebrate,StadiumSupporters.Celebration(f.celebrating,f.celebrationTeam,f.celebrationTime,team));}
    }
    void ClearSupporters(){Supporters=null;supporterSetup=null;supporterMaterials.Clear();}
}
}

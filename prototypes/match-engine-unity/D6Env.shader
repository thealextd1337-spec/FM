Shader "Doppel6/Environment" {
 // Stadium surfaces: tinted texture, real shadows, optional LED emission.
 // _VertexTint=1 multiplies baked vertex shading (stadium architecture meshes).
 Properties { _BaseMap("Texture",2D)="white"{} _BaseColor("Color",Color)=(1,1,1,1) _Emission("Emission",Color)=(0,0,0,0) _Gloss("Gloss",Float)=0 _VertexTint("Vertex tint",Float)=0 }
 SubShader { Tags {"RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry"}
 HLSLINCLUDE
 #include "../D6Common.hlsl"
 TEXTURE2D(_BaseMap);SAMPLER(sampler_BaseMap);
 CBUFFER_START(UnityPerMaterial)
 float4 _BaseMap_ST,_BaseColor,_Emission;float _Gloss,_VertexTint;
 CBUFFER_END
 ENDHLSL
 Pass { Tags {"LightMode"="UniversalForward"}
  HLSLPROGRAM
  #pragma vertex vert
  #pragma fragment frag
  #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE
  #pragma multi_compile_fragment _ _SHADOWS_SOFT _SHADOWS_SOFT_LOW _SHADOWS_SOFT_MEDIUM _SHADOWS_SOFT_HIGH
  struct Input {float4 position:POSITION;float3 normal:NORMAL;float2 uv:TEXCOORD0;float4 color:COLOR;};
  struct Output {float4 position:SV_POSITION;float2 uv:TEXCOORD0;float3 world:TEXCOORD1;float3 normal:TEXCOORD2;half3 tint:TEXCOORD3;};
  Output vert(Input i){Output o;o.world=TransformObjectToWorld(i.position.xyz);o.position=TransformWorldToHClip(o.world);o.normal=TransformObjectToWorldNormal(i.normal);o.uv=TRANSFORM_TEX(i.uv,_BaseMap);o.tint=lerp(half3(1,1,1),(half3)i.color.rgb,_VertexTint);return o;}
  half4 frag(Output i):SV_Target {
   half4 tex=SAMPLE_TEXTURE2D(_BaseMap,sampler_BaseMap,i.uv);half3 albedo=tex.rgb*_BaseColor.rgb*i.tint;
   return half4(D6Light(albedo,i.world,i.normal,.2,.0,_Gloss)+tex.rgb*_Emission.rgb,1);
  }
  ENDHLSL
 }
 Pass { Name "ShadowCaster" Tags {"LightMode"="ShadowCaster"} ZWrite On ZTest LEqual ColorMask 0
  HLSLPROGRAM
  #pragma vertex vert
  #pragma fragment frag
  struct Input {float4 position:POSITION;float3 normal:NORMAL;};
  float4 vert(Input i):SV_POSITION{return D6ShadowClip(i.position.xyz,i.normal);}
  half4 frag():SV_Target{return 0;}
  ENDHLSL
 }
 }
}

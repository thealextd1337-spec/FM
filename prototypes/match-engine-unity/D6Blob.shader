Shader "Doppel6/Contact Shadow" {
 // Soft radial ambient-occlusion blob under players and ball. It darkens the
 // turf where the shadow map cannot resolve feet touching the ground.
 // With the received night/day look (_D6_LOOK) and _Model 1 it splits the
 // turf light like D6Pitch: the core (_Core of the radius) blocks the _Contact
 // share of the shadowable key light the shadow map misses at the contact,
 // the whole disc the _Occlusion share of the sky and fill light. Where the
 // cast shadow already removed the key light, nothing is darkened twice.
 Properties { _Strength("Strength",Float)=.45 _Model("Lighting model",Float)=0 _Contact("Key light blocked at the contact",Float)=0 _Occlusion("Sky light blocked",Float)=1 _Core("Core radius",Float)=.5 }
 SubShader { Tags {"RenderPipeline"="UniversalPipeline" "RenderType"="Transparent" "Queue"="Transparent-10"}
 Pass { Tags {"LightMode"="UniversalForward"} Blend DstColor Zero ZWrite Off Offset -1,-1
  HLSLPROGRAM
  #pragma vertex vert
  #pragma fragment frag
  #pragma multi_compile _ _D6_LOOK
  #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE
  #pragma multi_compile_fragment _ _SHADOWS_SOFT _SHADOWS_SOFT_LOW _SHADOWS_SOFT_MEDIUM _SHADOWS_SOFT_HIGH
  #if defined(_D6_LOOK)
  #include "../D6Common.hlsl"
  #else
  #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
  #endif
  CBUFFER_START(UnityPerMaterial)
  float _Strength,_Model,_Contact,_Occlusion,_Core;
  CBUFFER_END
  #if defined(_D6_LOOK)
  struct Input {float4 position:POSITION;};
  struct Output {float4 position:SV_POSITION;float2 local:TEXCOORD0;float3 world:TEXCOORD1;};
  Output vert(Input i){Output o;o.position=TransformObjectToHClip(i.position.xyz);o.local=i.position.xz*2;o.world=TransformObjectToWorld(i.position.xyz);return o;}
  half4 frag(Output i):SV_Target {float d=saturate(dot(i.local,i.local));
   if(_Model<.5){float a=(1-d)*(1-d)*_Strength;return half4((1-a).xxx,1);}
   // Turf light under the blob: the shadowable key (light strength k, raw
   // shadow lit), its unshadowed rest and the sky, as D6Pitch adds them.
   Light light=GetMainLight();half k=_MainLightShadowParams.x;
   half shadow=D6ShadowAt(i.world,half3(0,1,0),0,1),lit=k>.001?saturate((shadow-1+k)/k):1;
   half3 sun=light.color*saturate(light.direction.y),key=sun*(k*lit),rest=sun*(1-k)+SampleSH(half3(0,1,0));
   float core=saturate(1-d/max(_Core*_Core,1e-4));
   half contact=saturate(_Strength*_Contact*core*core),occlusion=saturate(_Strength*_Occlusion*(1-d)*(1-d));
   return half4((key*(1-contact)+rest*(1-occlusion))/max(key+rest,1e-4),1);
  }
  #else
  struct Input {float4 position:POSITION;};
  struct Output {float4 position:SV_POSITION;float2 local:TEXCOORD0;};
  Output vert(Input i){Output o;o.position=TransformObjectToHClip(i.position.xyz);o.local=i.position.xz*2;return o;}
  half4 frag(Output i):SV_Target {float d=saturate(dot(i.local,i.local));float a=(1-d)*(1-d)*_Strength;return half4((1-a).xxx,1);}
  #endif
  ENDHLSL
 }
 }
}

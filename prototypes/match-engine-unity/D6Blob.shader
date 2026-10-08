Shader "Doppel6/Contact Shadow" {
 // Soft radial ambient-occlusion blob under players and ball. It darkens the
 // turf where the shadow map cannot resolve feet touching the ground.
 Properties { _Strength("Strength",Float)=.45 }
 SubShader { Tags {"RenderPipeline"="UniversalPipeline" "RenderType"="Transparent" "Queue"="Transparent-10"}
 Pass { Tags {"LightMode"="UniversalForward"} Blend DstColor Zero ZWrite Off Offset -1,-1
  HLSLPROGRAM
  #pragma vertex vert
  #pragma fragment frag
  #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
  CBUFFER_START(UnityPerMaterial)
  float _Strength;
  CBUFFER_END
  struct Input {float4 position:POSITION;};
  struct Output {float4 position:SV_POSITION;float2 local:TEXCOORD0;};
  Output vert(Input i){Output o;o.position=TransformObjectToHClip(i.position.xyz);o.local=i.position.xz*2;return o;}
  half4 frag(Output i):SV_Target {float d=saturate(dot(i.local,i.local));float a=(1-d)*(1-d)*_Strength;return half4((1-a).xxx,1);}
  ENDHLSL
 }
 }
}

Shader "Doppel6/Team Ring" {
 // Opaque vertex colours keep club/contrast bands readable under floodlights.
 SubShader { Tags {"RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry+5"}
 Pass { Tags {"LightMode"="UniversalForward"} Cull Off ZWrite Off
  HLSLPROGRAM
  #pragma vertex vert
  #pragma fragment frag
  #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
  struct Input {float4 position:POSITION;float4 color:COLOR;};
  struct Output {float4 position:SV_POSITION;half4 color:COLOR;};
  Output vert(Input i){Output o;o.position=TransformObjectToHClip(i.position.xyz);o.color=i.color;return o;}
  half4 frag(Output i):SV_Target{return i.color;}
  ENDHLSL
 }
 }
}

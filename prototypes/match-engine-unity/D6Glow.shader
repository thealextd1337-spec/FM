Shader "Doppel6/Floodlight Glow" {
 // Camera-facing halos in front of visible floodlight heads and roof light
 // rails (Nighttime). Additive, no depth write, no lighting contribution: the
 // glow only shows the lamp; the pitch is lit by the main light as before.
 // Vertex data: position = halo centre, normal = lamp facing, uv = corner
 // (-1..1), uv1.x = halo radius in metres.
 Properties { _Color("Glow",Color)=(1,.95,.85,1) _Intensity("Intensity",Float)=1 }
 SubShader { Tags {"RenderPipeline"="UniversalPipeline" "RenderType"="Transparent" "Queue"="Transparent" "IgnoreProjector"="True"}
 Pass { Tags {"LightMode"="UniversalForward"} Blend One One ZWrite Off ZTest LEqual Cull Off
  HLSLPROGRAM
  #pragma vertex vert
  #pragma fragment frag
  #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
  CBUFFER_START(UnityPerMaterial)
  float4 _Color;float _Intensity;
  CBUFFER_END
  struct Input {float4 position:POSITION;float3 normal:NORMAL;float2 uv:TEXCOORD0;float2 size:TEXCOORD1;};
  struct Output {float4 position:SV_POSITION;float2 uv:TEXCOORD0;half fade:TEXCOORD1;};
  Output vert(Input i){
   Output o;float3 centre=TransformObjectToWorld(i.position.xyz);float3 facing=normalize(TransformObjectToWorldDir(i.normal));
   float3 toCamera=GetCameraPositionWS()-centre;float distance=length(toCamera);toCamera/=max(distance,1e-3);
   float3 right=UNITY_MATRIX_V[0].xyz,up=UNITY_MATRIX_V[1].xyz;
   // Pulled slightly toward the camera so the lamp box never cuts the halo.
   float3 world=centre+toCamera*min(1.5,i.size.x*.5)+(right*i.uv.x+up*i.uv.y)*i.size.x;
   o.position=TransformWorldToHClip(world);o.uv=i.uv;
   // Seen from behind a lamp the halo vanishes; very close cameras get less glare.
   o.fade=saturate(dot(facing,toCamera)*1.6+.35)*saturate(distance/12-.4);
   return o;
  }
  half4 frag(Output i):SV_Target {
   float r2=dot(i.uv,i.uv);half core=exp(-r2*22),halo=exp(-r2*5)*(1-r2);
   half a=(core*.9+halo*.32)*saturate(1-r2)*i.fade*_Intensity;
   return half4(_Color.rgb*a,1);
  }
  ENDHLSL
 }
 }
}

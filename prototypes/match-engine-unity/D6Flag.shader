Shader "Doppel6/Supporters" {
 // Ultra blocks: club figures, flag poles, flags and banners. Vertex motion is a pure function of
 // the displayed match clock (_D6PresentTime = clock mod 600 s, set per frame by
 // ProbeBridge.UpdateSupporters), the scoring block's celebration and per-vertex phases;
 // StadiumSupporters.Displace mirrors it for tests. It never reads Unity's built-in time, so
 // pause, replay and seek show the same picture for the same clock. motion: x phase (cycles), y bounce weight,
 // z cloth weight (0 at pole/top edge), w swing weight; TEXCOORD2 swing pivot, TANGENT.xyz axis.
 Properties { _BaseMap("Atlas",2D)="white"{} _BaseColor("Color",Color)=(1,1,1,1) _D6PresentTime("Presentation time",Float)=0 _D6Celebrate("Celebration",Float)=0 _D6Light("Light",Float)=1
  _Bob("Bounce m",Float)=.045 _BobJump("Celebration bounce m",Float)=.2 _BobHz("Bounce Hz",Float)=1.8 _Swing("Swing deg",Float)=24 _SwingJump("Celebration swing deg",Float)=14 _SwingHz("Swing Hz",Float)=.55
  _Wave("Cloth wave m",Float)=.15 _WaveHz("Cloth Hz",Float)=1.35 _WaveK("Cloth waves",Float)=1.3 }
 SubShader { Tags {"RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry"}
 Pass { Tags {"LightMode"="UniversalForward"} Cull Off
  HLSLPROGRAM
  #pragma vertex vert
  #pragma fragment frag
  #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE
  #pragma multi_compile_fragment _ _SHADOWS_SOFT _SHADOWS_SOFT_LOW _SHADOWS_SOFT_MEDIUM _SHADOWS_SOFT_HIGH
  #include "../D6Common.hlsl"
  TEXTURE2D(_BaseMap);SAMPLER(sampler_BaseMap);
  CBUFFER_START(UnityPerMaterial)
  float4 _BaseMap_ST,_BaseColor;float _D6PresentTime,_D6Celebrate,_D6Light,_Bob,_BobJump,_BobHz,_Swing,_SwingJump,_SwingHz,_Wave,_WaveHz,_WaveK;
  CBUFFER_END
  struct Input {float4 position:POSITION;float3 normal:NORMAL;float4 tangent:TANGENT;float4 color:COLOR;float2 uv:TEXCOORD0;float4 motion:TEXCOORD1;float3 pivot:TEXCOORD2;};
  struct Output {float4 position:SV_POSITION;float2 uv:TEXCOORD0;float3 world:TEXCOORD1;float3 normal:TEXCOORD2;half3 tint:TEXCOORD3;};
  float3 Rotate(float3 v,float3 axis,float angle){float s,c;sincos(angle,s,c);return v*c+cross(axis,v)*s+axis*(dot(axis,v)*(1-c));}
  Output vert(Input i){
   const float tau=6.28318530718;float t=_D6PresentTime,c=_D6Celebrate,phase=i.motion.x;
   float3 p=i.position.xyz,n=i.normal;
   // Ripple along the cloth, growing toward the free edge.
   p+=n*(sin(tau*(t*_WaveHz+phase)-tau*_WaveK*i.motion.z)*i.motion.z*_Wave*(1+.6*c));
   // Swing about the hands around the axis toward the pitch.
   float angle=radians(_Swing+_SwingJump*c)*sin(tau*(t*_SwingHz+phase))*i.motion.w;
   p=i.pivot+Rotate(p-i.pivot,i.tangent.xyz,angle);n=Rotate(n,i.tangent.xyz,angle);
   // Coherent bounce of the block; raised arms pump with a larger weight.
   p.y+=i.motion.y*(_Bob+_BobJump*c)*(.5+.5*sin(tau*(t*_BobHz+phase)));
   Output o;o.world=TransformObjectToWorld(p);o.position=TransformWorldToHClip(o.world);o.normal=TransformObjectToWorldNormal(n);
   o.uv=TRANSFORM_TEX(i.uv,_BaseMap);o.tint=(half3)i.color.rgb;return o;
  }
  half4 frag(Output i,FRONT_FACE_TYPE face:FRONT_FACE_SEMANTIC):SV_Target {
   half4 tex=SAMPLE_TEXTURE2D(_BaseMap,sampler_BaseMap,i.uv);half3 albedo=tex.rgb*_BaseColor.rgb*i.tint*_D6Light;
   // Cloth is seen from both sides: light the side facing the camera.
   half3 n=normalize(i.normal)*IS_FRONT_VFACE(face,1,-1);
   return half4(D6Light(albedo,i.world,n,.45,0,0),1);
  }
  ENDHLSL
 }
 }
}

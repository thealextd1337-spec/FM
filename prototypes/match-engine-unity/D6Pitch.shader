Shader "Doppel6/Pitch" {
 Properties {
  _ColorA("Stripe A",Color)=(.20,.42,.17,1) _ColorB("Stripe B",Color)=(.16,.36,.14,1) _Apron("Apron",Color)=(.12,.27,.11,1) _Wear("Wear",Color)=(.33,.36,.20,1)
  _Size("Pitch length/width",Vector)=(68,44,0,0) _Stripes("Stripe count",Float)=12 _Pattern("Mowing pattern 0 stripes 1 checks 2 diagonal",Float)=0 _WearAmount("Wear amount",Float)=1
 }
 SubShader { Tags {"RenderPipeline"="UniversalPipeline" "RenderType"="Opaque" "Queue"="Geometry"}
 Pass { Tags {"LightMode"="UniversalForward"}
  HLSLPROGRAM
  #pragma vertex vert
  #pragma fragment frag
  #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE
  #pragma multi_compile_fragment _ _SHADOWS_SOFT _SHADOWS_SOFT_LOW _SHADOWS_SOFT_MEDIUM _SHADOWS_SOFT_HIGH
  #include "../D6Common.hlsl"
  CBUFFER_START(UnityPerMaterial)
  float4 _ColorA,_ColorB,_Apron,_Wear,_Size;float _Stripes,_Pattern,_WearAmount;
  CBUFFER_END
  struct Input {float4 position:POSITION;float3 normal:NORMAL;};
  struct Output {float4 position:SV_POSITION;float3 world:TEXCOORD0;float3 normal:TEXCOORD1;};
  Output vert(Input i){Output o;o.world=TransformObjectToWorld(i.position.xyz);o.position=TransformWorldToHClip(o.world);o.normal=TransformObjectToWorldNormal(i.normal);return o;}
  half4 frag(Output i):SV_Target {
   float2 p=i.world.xz;float2 half_=_Size.xy*.5;
   bool inside=abs(p.x)<=half_.x+.05&&abs(p.y)<=half_.y+.05;
   // Mowing stripes along the length with soft edges, a faint cross cut and
   // multi-scale noise so the turf never reads as flat plastic.
   // Club patterns: 1 adds cross bands (checks), 2 mows diagonally.
   float along=_Pattern>1.5?(p.x+p.y)*.7071+half_.x:p.x+half_.x;
   float band=along/(_Size.x/_Stripes);float edge=abs(frac(band)-.5);
   float stripe=fmod(floor(band)+64,2);float blend=smoothstep(.47,.5,edge);
   if(_Pattern>.5&&_Pattern<1.5){float across=(p.y+half_.y)/(_Size.y/max(2,round(_Stripes*_Size.y/_Size.x)));stripe=fmod(floor(band)+floor(across)+64,2);blend=max(blend,smoothstep(.47,.5,abs(frac(across)-.5)));}
   half3 turf=lerp(stripe>.5?_ColorA.rgb:_ColorB.rgb,(_ColorA.rgb+_ColorB.rgb)*.5,blend*.5);
   float cut=fmod(floor((p.y+half_.y)/(_Size.y/6))+64,2);turf*=lerp(.975,1.025,cut);
   float n=D6Noise(p*2.7)*.5+D6Noise(p*.55)*.35+D6Noise(p*11)*.15;turf*=lerp(.88,1.10,n);
   if(!inside)turf=_Apron.rgb*lerp(.85,1.08,n);
   // Worn turf in the goal mouths and at kick-off.
   float gx=abs(p.x)-(half_.x-2.4);float wear=exp(-(gx*gx/5+p.y*p.y/4))+.45*exp(-dot(p,p)/3);
   turf=lerp(turf,_Wear.rgb*lerp(.85,1.1,n),saturate(wear*.55*_WearAmount*(inside?1:0)));
   half3 color=D6Light(turf,i.world,i.normal,.0,.0,.0);
   // Floodlight pools: slightly brighter centre, darker run-off.
   float2 r=p/(half_+8);color*=lerp(1.05,.93,saturate(dot(r,r)));
   return half4(color,1);
  }
  ENDHLSL
 }
 }
}

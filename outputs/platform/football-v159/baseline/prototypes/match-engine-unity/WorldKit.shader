Shader "Doppel6/World Kit" {
 Properties { _BaseMap("Player",2D)="white"{} _ClothMask("Clothing",2D)="black"{} _Main("Main",Color)=(1,1,1,1) _Trim("Trim",Color)=(1,1,1,1) _Accent("Accent",Color)=(1,1,1,1) _Skin("Skin",Color)=(1,1,1,1) _Hair("Hair",Color)=(.1,.1,.1,1) _Style("Style",Float)=0 }
 SubShader { Tags {"RenderPipeline"="UniversalPipeline" "RenderType"="Opaque"} Cull Off
 Pass { Tags {"LightMode"="UniversalForward"}
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
 TEXTURE2D(_BaseMap);SAMPLER(sampler_BaseMap);TEXTURE2D(_ClothMask);SAMPLER(sampler_ClothMask);
 CBUFFER_START(UnityPerMaterial)
 float4 _BaseMap_ST,_Main,_Trim,_Accent,_Skin,_Hair;float _Style;
 CBUFFER_END
 struct Input {float4 position:POSITION;float3 normal:NORMAL;float2 uv:TEXCOORD0;float3 rest:TEXCOORD2;};
 struct Output {float4 position:SV_POSITION;float2 uv:TEXCOORD0;float3 rest:TEXCOORD1;float3 normal:TEXCOORD2;};
 Output vert(Input i){Output o;o.position=TransformObjectToHClip(i.position.xyz);o.uv=i.uv;o.rest=i.rest;o.normal=TransformObjectToWorldNormal(i.normal);return o;}
 half4 frag(Output i):SV_Target {
  half3 color=SAMPLE_TEXTURE2D(_BaseMap,sampler_BaseMap,i.uv).rgb;
  half3 cloth=SAMPLE_TEXTURE2D(_ClothMask,sampler_ClothMask,i.uv).rgb;
  float pigment=max(max(color.r,color.g),color.b),stripe=0,u=(i.rest.x+.22)/.44,h=(i.rest.y-.94)/.38;
  if(cloth.r>.5||cloth.b>.5){
   if(cloth.r>.5){if(_Style==1)stripe=step(.37,u)*step(u,.63);if(_Style==2)stripe=step(.55,frac(u*4));if(_Style==3)stripe=step(.72,frac(h*4));if(_Style==4)stripe=step(u,.5);if(_Style==5)stripe=step(.88,frac(u*5));if(_Style==6)stripe=step(abs(u+h-1),.12);if(i.rest.y>1.35&&abs(i.rest.x)<.12)stripe=1;}
   else stripe=step(.42,i.rest.y)*step(i.rest.y,.46);
   color=lerp(_Main.rgb,_Trim.rgb,stripe)*(.78+.22*pigment);if(cloth.r>.5&&i.rest.y<.916)color=_Accent.rgb;
  }else{
   bool skin=color.r>color.g*1.12&&color.g>color.b*1.12&&pigment>.18;
   bool eye=i.rest.y>1.47&&i.rest.y<1.57&&i.rest.z>.065;
   if(skin&&!eye&&i.rest.y>.5)color=_Skin.rgb*(.65+.65*pigment);
   if((i.rest.y>1.62||(i.rest.y>1.49&&i.rest.z<-.025&&pigment<.24))&&pigment<.35)color=_Hair.rgb*(.7+pigment*2);
  }
  Light light=GetMainLight();half illumination=.65+.35*saturate(dot(normalize(i.normal),light.direction));return half4(color*illumination,1);
 }
 ENDHLSL
 }
 }
}

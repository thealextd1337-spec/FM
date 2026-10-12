Shader "Doppel6/World Kit" {
 Properties { _BaseMap("Player",2D)="white"{} _ClothMask("Clothing",2D)="black"{} _Main("Main",Color)=(1,1,1,1) _Trim("Trim",Color)=(1,1,1,1) _Accent("Accent",Color)=(1,1,1,1) _Skin("Skin",Color)=(1,1,1,1) _Hair("Hair",Color)=(.1,.1,.1,1) _Style("Style",Float)=0 _Number("Shirt number",Float)=-1 _NumberColor("Number",Color)=(1,1,1,1) _NumberEdge("Number edge",Color)=(0,0,0,1) _Keeper("Keeper",Float)=0 _Glove("Gloves",Color)=(1,1,1,1) }
 SubShader { Tags {"RenderPipeline"="UniversalPipeline" "RenderType"="Opaque"} Cull Off
 Pass { Tags {"LightMode"="UniversalForward"}
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE
 #pragma multi_compile_fragment _ _SHADOWS_SOFT _SHADOWS_SOFT_LOW _SHADOWS_SOFT_MEDIUM _SHADOWS_SOFT_HIGH
 #include "D6Common.hlsl"
 TEXTURE2D(_BaseMap);SAMPLER(sampler_BaseMap);TEXTURE2D(_ClothMask);SAMPLER(sampler_ClothMask);
 CBUFFER_START(UnityPerMaterial)
 float4 _BaseMap_ST,_Main,_Trim,_Accent,_Skin,_Hair,_NumberColor,_NumberEdge,_Glove;float _Style,_Number,_Keeper;
 CBUFFER_END
 struct Input {float4 position:POSITION;float3 normal:NORMAL;float2 uv:TEXCOORD0;float3 rest:TEXCOORD2;};
 struct Output {float4 position:SV_POSITION;float2 uv:TEXCOORD0;float3 body:TEXCOORD1;float3 normal:TEXCOORD2;float3 world:TEXCOORD3;};
 // The rest attribute holds bind-pose mesh coordinates: x lateral (player's
 // left negative), z height in metres and the front facing -y. body is
 // (lateral, height, forward) so the kit regions read like the figure.
 Output vert(Input i){Output o;o.world=TransformObjectToWorld(i.position.xyz);o.position=TransformWorldToHClip(o.world);o.uv=i.uv;o.body=float3(i.rest.x,i.rest.z,-i.rest.y);o.normal=TransformObjectToWorldNormal(i.normal);return o;}
 // Antialiased band edges: stable at distance instead of shimmering steps.
 float Band(float x,float edge){float w=max(fwidth(x),1e-4);return smoothstep(edge-w,edge+w,x);}
 // Seven-segment football numerals as rounded strokes; q in [0,1]^2 per digit.
 float Segment(float2 q,float2 c,float2 h,float t){float2 d=abs(q-c)-h;return length(max(d,0))+min(max(d.x,d.y),0)-t;}
 float Digit(float2 q,float n){
  float t=.11;float mask=n==0?63:n==1?6:n==2?91:n==3?79:n==4?102:n==5?109:n==6?125:n==7?7:n==8?127:111;
  float d=1e3;float hx=.5-t*1.6,hy=.25-t*.8;
  float2 cs[7]={float2(.5,1-t),float2(1-t,.75),float2(1-t,.25),float2(.5,t),float2(t,.25),float2(t,.75),float2(.5,.5)};
  [unroll] for(int k=0;k<7;k++){float bit=fmod(floor(mask/exp2(k)),2);float2 h=k==0||k==3||k==6?float2(hx,0):float2(0,hy);if(bit>.5)d=min(d,Segment(q,cs[k],h,t));}
  return d;
 }
 // Coverage (x) and edge (y) of a one or two digit number centred at c.
 float2 Number(float2 p,float2 c,float height){
  if(_Number<0)return 0;float n=floor(_Number+.5);float tens=floor(n/10),ones=n-tens*10;float width=height*.56,gap=width*.18;
  float2 q=(p-c)/float2(width,height);float d;
  if(tens>0){float offset=1+gap/width*.5;d=min(Digit(q+float2(offset,.5),tens),Digit(q-float2(offset-1,-.5),ones));}
  else d=Digit(q+float2(.5,.5),ones);
  float w=max(fwidth(d),1e-4);return float2(1-smoothstep(-w,w,d),1-smoothstep(-w,w,d-.07));
 }
 half4 frag(Output i):SV_Target {
  half3 color=SAMPLE_TEXTURE2D(_BaseMap,sampler_BaseMap,i.uv).rgb;
  half3 cloth=SAMPLE_TEXTURE2D(_ClothMask,sampler_ClothMask,i.uv).rgb;
  float3 b=i.body;float pigment=max(max(color.r,color.g),color.b),stripe=0,u=(b.x+.22)/.44,h=(b.y-.94)/.38;
  // Cloth mask channels, measured per vertex (kit-regions.json): R shirt
  // (0.93-1.42 m), G shorts (0.65-0.90 m), B socks (0.15-0.47 m).
  bool shirt=cloth.r>.5,shorts=!shirt&&cloth.g>.5,socks=!shirt&&!shorts&&cloth.b>.5;
  // Derivatives must be taken in uniform control flow (WebGL), so every band
  // and number coverage is evaluated before choosing a region.
  float styleBand=_Style==1?Band(u,.37)*(1-Band(u,.63)):_Style==2?Band(frac(u*4),.55):_Style==3?Band(frac(h*4),.72):_Style==4?1-Band(u,.5):_Style==5?Band(frac(u*5),.88):_Style==6?1-Band(abs(u+h-1),.12):0;
  float collar=Band(b.y,1.35)*(1-Band(abs(b.x),.12)),sockBand=Band(b.y,.42)*(1-Band(b.y,.46)),glove=Band(abs(b.x),.615)*Band(b.y,1.15);
  // Actual squad number: large on the back, small on the left chest.
  float2 back=Number(float2(b.x,b.y),float2(0,1.15),.17)*step(b.z,-.02),chest=Number(float2(-b.x,b.y),float2(.075,1.24),.065)*step(.02,b.z),mark=max(back,chest);
  // Fine knit for close cameras only: it fades with its screen-space size, so
  // the elevated match camera sees calm matte fabric instead of moire.
  float2 knit=i.uv*1300;float knitFade=saturate(1.4-max(fwidth(knit.x),fwidth(knit.y))*1.1);float weave=sin(knit.x)*sin(knit.y*1.3)*knitFade;
  half skinRegion=0,hairRegion=0,gloveRegion=0;
  if(shorts)color=_Accent.rgb*(.78+.22*pigment);
  else if(shirt||socks){
   stripe=shirt?max(styleBand,collar):sockBand;
   color=lerp(_Main.rgb,_Trim.rgb,stripe)*(.78+.22*pigment);
   if(shirt&&b.y>.95){color=lerp(color,_NumberEdge.rgb,mark.y);color=lerp(color,_NumberColor.rgb,mark.x);}
  }else{
   bool skin=color.r>color.g*1.12&&color.g>color.b*1.12&&pigment>.18;
   bool eye=b.y>1.47&&b.y<1.57&&b.z>.065;
   if(skin&&!eye&&b.y>.5){color=_Skin.rgb*(.65+.65*pigment);skinRegion=1;}
   if((b.y>1.62||(b.y>1.49&&b.z<-.025&&pigment<.24))&&pigment<.35){color=_Hair.rgb*(.7+pigment*2);hairRegion=1;skinRegion=0;}
   // Keepers wear gloves over the actual hand geometry (bind pose |x| > 0.62 m).
   if(_Keeper>.5){color=lerp(color,_Glove.rgb*(.8+.2*pigment),glove);gloveRegion=glove;skinRegion*=1-glove;}
  }
  half fabric=shirt||shorts||socks?1:0;
  // Cull Off shows inner faces (sleeves, collar, thin silhouettes); their
  // normal points away from the camera and gave a full white fresnel rim as
  // speckles. Light the side that faces the camera.
  float3 n=normalize(i.normal),view=normalize(GetWorldSpaceViewDir(i.world));if(dot(n,view)<0)n=-n;
  half nv=saturate(dot(n,view));
  if(_D6NightRim.w<=0){
   // Previous floodlight response: faint sheen and a kit-tinted rim.
   half rim=pow(1-nv,3)*.3;
   return half4(D6Light(color,i.world,n,.35,0,fabric>0?.12:.05)+rim*lerp(SampleSH(n)*2,color*1.4,.65),1);
  }
  // Nighttime material response. Fabric: matte knit, no hot spot, a soft
  // grazing sheen in its own colour. Skin: wider wrap, a warm terminator and a
  // broad low highlight. Hair: a faint narrow sheen. Gloves: matte latex.
  color*=1+weave*.05*fabric;
  Light light=GetMainLight(TransformWorldToShadowCoord(i.world));half shadow=light.shadowAttenuation*light.distanceAttenuation;
  half wrap=.35+.2*skinRegion;half nl=dot(n,light.direction);half ndl=saturate((nl+wrap)/(1+wrap));
  // Players get a little more of the sky fill than the stadium: dark kits stay drawn.
  half3 ambient=SampleSH(n)*1.18;
  half3 lit=color*(light.color*ndl*shadow+ambient);
  half3 hv=normalize(light.direction+view);half nh=saturate(dot(n,hv));
  lit+=fabric*pow(1-nv,2.2)*.16*(color*.7+.08)*(ndl*shadow*.75+.25);
  lit+=skinRegion*color*half3(.16,.05,.02)*saturate(1-abs(nl)*1.6)*shadow;
  lit+=light.color*shadow*(skinRegion*pow(nh,14)*.05+hairRegion*pow(nh,40)*.06+gloveRegion*pow(nh,18)*.04);
  // The opposite floodlight bank as a cool back rim: separates small figures
  // from the turf; tinted with the kit so team colours do not turn white.
  half backLit=saturate(dot(n,_D6NightRim.xyz)*.6+.4);half edge=pow(1-nv,2.6);
  lit+=edge*backLit*_D6NightRim.w*lerp(_D6NightRimColor.rgb,color*1.5,.55);
  return half4(lit,1);
 }
 ENDHLSL
 }
 Pass { Name "ShadowCaster" Tags {"LightMode"="ShadowCaster"} ZWrite On ZTest LEqual ColorMask 0 Cull Off
 HLSLPROGRAM
 #pragma vertex shadowVert
 #pragma fragment shadowFrag
 #include "D6Common.hlsl"
 CBUFFER_START(UnityPerMaterial)
 float4 _BaseMap_ST,_Main,_Trim,_Accent,_Skin,_Hair,_NumberColor,_NumberEdge,_Glove;float _Style,_Number,_Keeper;
 CBUFFER_END
 struct ShadowInput {float4 position:POSITION;float3 normal:NORMAL;};
 float4 shadowVert(ShadowInput i):SV_POSITION{return D6ShadowClip(i.position.xyz,i.normal);}
 half4 shadowFrag():SV_Target{return 0;}
 ENDHLSL
 }
 }
}

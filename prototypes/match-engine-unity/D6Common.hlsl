#ifndef D6_COMMON_INCLUDED
#define D6_COMMON_INCLUDED
// Shared floodlight lighting for the match view: main light with real shadow
// maps, spherical-harmonics ambient and a soft rim. Display only.
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"

// Nighttime globals, set by WorldViewEnvironment for the match view and reset
// to zero afterwards (zero = previous behaviour). _D6Night: xy half extent of
// the floodlit area (metres), z falloff distance, w remaining key light far
// outside it. The floodlights are one directional key light; this falloff only
// keeps the surroundings beyond the stands in the dark. _D6NightRim: xyz
// direction of the opposite floodlight bank, w its rim strength on players.
float4 _D6Night,_D6NightRim;half4 _D6NightRimColor;
half D6Floodlit(float3 positionWS){
    if(_D6Night.w<=0)return 1;
    float2 d=max(abs(positionWS.xz)-_D6Night.xy,0);float r=dot(d,d)/(_D6Night.z*_D6Night.z);
    return lerp(_D6Night.w,1,exp(-r));
}

half3 D6Light(half3 albedo,float3 positionWS,half3 normalWS,half wrap,half rim,half gloss){
    Light light=GetMainLight(TransformWorldToShadowCoord(positionWS));
    half3 n=normalize(normalWS);half pool=D6Floodlit(positionWS);
    half ndl=saturate((dot(n,light.direction)+wrap)/(1+wrap));
    half3 direct=light.color*(ndl*light.shadowAttenuation*light.distanceAttenuation*pool);
    // Beyond the floodlit bowl only the cool sky fill remains (slightly reduced).
    half3 ambient=SampleSH(n)*lerp(.82,1,pool);
    half3 view=normalize(GetWorldSpaceViewDir(positionWS));
    half fresnel=pow(1-saturate(dot(n,view)),3);
    half3 h=normalize(light.direction+view);
    half spec=gloss>0?pow(saturate(dot(n,h)),48)*gloss*light.shadowAttenuation*pool:0;
    return albedo*(direct+ambient)+(fresnel*rim)*ambient*2+spec*light.color;
}

// Shadow caster helpers shared by the custom shaders.
float3 _LightDirection;
float4 D6ShadowClip(float3 positionOS,float3 normalOS){
    float3 positionWS=TransformObjectToWorld(positionOS);
    float3 normalWS=TransformObjectToWorldNormal(normalOS);
    float4 positionCS=TransformWorldToHClip(ApplyShadowBias(positionWS,normalWS,_LightDirection));
    #if UNITY_REVERSED_Z
    positionCS.z=min(positionCS.z,UNITY_NEAR_CLIP_VALUE);
    #else
    positionCS.z=max(positionCS.z,UNITY_NEAR_CLIP_VALUE);
    #endif
    return positionCS;
}

// Cheap value noise for grass and crowd variation.
float D6Hash(float2 p){p=frac(p*float2(123.34,456.21));p+=dot(p,p+45.32);return frac(p.x*p.y);}
float D6Noise(float2 p){float2 i=floor(p),f=frac(p);float2 u=f*f*(3-2*f);
    return lerp(lerp(D6Hash(i),D6Hash(i+float2(1,0)),u.x),lerp(D6Hash(i+float2(0,1)),D6Hash(i+float2(1,1)),u.x),u.y);}
#endif

#ifndef D6_COMMON_INCLUDED
#define D6_COMMON_INCLUDED
// Shared floodlight lighting for the match view: main light with real shadow
// maps, spherical-harmonics ambient and a soft rim. Display only.
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"

// Klares Low-Poly (global, 0 = the previous look exactly): calmer surfaces,
// broader and softer gloss. _D6Facet blends in the flat normal of the
// rendered triangle (screen derivatives) for the facet comparison on a mesh
// that has no designed facets; it changes light only, never the geometry.
float _D6LowPoly,_D6Facet;
float3 D6FaceNormal(float3 positionWS,float3 normalWS){float3 f=normalize(cross(ddy(positionWS),ddx(positionWS)));return dot(f,normalWS)<0?-f:f;}

half3 D6Light(half3 albedo,float3 positionWS,half3 normalWS,half wrap,half rim,half gloss){
    Light light=GetMainLight(TransformWorldToShadowCoord(positionWS));
    half3 n=normalize(normalWS);
    half ndl=saturate((dot(n,light.direction)+wrap)/(1+wrap));
    half3 direct=light.color*(ndl*light.shadowAttenuation*light.distanceAttenuation);
    half3 ambient=SampleSH(n);
    half3 view=normalize(GetWorldSpaceViewDir(positionWS));
    half fresnel=pow(1-saturate(dot(n,view)),3);
    half3 h=normalize(light.direction+view);
    half spec=gloss>0?pow(saturate(dot(n,h)),lerp(48,14,_D6LowPoly))*gloss*lerp(1,.55,_D6LowPoly)*light.shadowAttenuation:0;
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

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

// Received fixture light (ProbeBridge.ApplyMatchLighting). The global keyword
// _D6_LOOK selects the night/day terms below; without it every shader
// compiles exactly its Release 130 code (D6Light, D6ShadowClip above). The
// globals are only read with _D6_LOOK: _D6Pool floodlight pools on the turf
// (night 1, day 0), _D6KitShadow share of the shadow map on the kits and
// _D6KitShadowOffset its lookup offset (metres), _D6KitDepthBias and
// _D6KitNormalBias the kits' share of the light's caster bias, _D6KitKnee the
// kits' highlight shoulder (1 none).
float _D6Pool,_D6KitShadow,_D6KitShadowOffset,_D6KitDepthBias,_D6KitNormalBias,_D6KitKnee;

// Main-light shadow of a receiver: looked up `offset` metres along its normal
// (no self-shadow acne, and the casters keep their full outline), faded out
// where URP's shadow distance ends like its own lit shaders (no shadow pops
// at the edge of the map) and applied with `weight` (1 full, 0 none).
half D6ShadowAt(float3 positionWS,half3 normalWS,float offset,half weight){
    if(weight<=0)return 1;
    half shadow=MainLightRealtimeShadow(TransformWorldToShadowCoord(positionWS+normalWS*offset));
    shadow=lerp(shadow,1,GetMainLightShadowFade(positionWS));
    return lerp(1,shadow,weight);
}

// D6Light with the given main-light shadow term (D6ShadowAt).
half3 D6LightShadow(half3 albedo,float3 positionWS,half3 normalWS,half wrap,half rim,half gloss,half shadow){
    Light light=GetMainLight();
    half3 n=normalize(normalWS);
    half ndl=saturate((dot(n,light.direction)+wrap)/(1+wrap));
    half3 direct=light.color*(ndl*shadow*light.distanceAttenuation);
    half3 ambient=SampleSH(n);
    half3 view=normalize(GetWorldSpaceViewDir(positionWS));
    half fresnel=pow(1-saturate(dot(n,view)),3);
    half3 h=normalize(light.direction+view);
    half spec=gloss>0?pow(saturate(dot(n,h)),lerp(48,14,_D6LowPoly))*gloss*lerp(1,.55,_D6LowPoly)*shadow:0;
    return albedo*(direct+ambient)+(fresnel*rim)*ambient*2+spec*light.color;
}

// Soft highlight shoulder above `knee` (1 = none, slope 1 at the knee): lit
// facets of white and bright kits keep distinct tones instead of all
// clipping to the same white in the LDR picture.
half3 D6Shoulder(half3 c,half knee){
    if(knee>=1)return c;
    half w=1-knee;
    return min(c,knee)+w*(1-exp(-max(c-knee,0)/w));
}

// D6ShadowClip with the light's depth and normal bias scaled: the full normal
// bias parts the flat-shaded facets of a figure and thins its limbs away in
// the shadow map, the full depth bias lifts the shadow off the feet. A figure
// using this keeps its own self-shadow acne away with D6ShadowAt's offset.
float4 D6ShadowClipScaled(float3 positionOS,float3 normalOS,float depthScale,float normalScale){
    float3 positionWS=TransformObjectToWorld(positionOS);
    float3 normalWS=TransformObjectToWorldNormal(normalOS);
    float invNdotL=1-saturate(dot(_LightDirection,normalWS));
    positionWS+=_LightDirection*(_ShadowBias.x*depthScale)+normalWS*(invNdotL*_ShadowBias.y*normalScale);
    float4 positionCS=TransformWorldToHClip(positionWS);
    #if UNITY_REVERSED_Z
    positionCS.z=min(positionCS.z,UNITY_NEAR_CLIP_VALUE);
    #else
    positionCS.z=max(positionCS.z,UNITY_NEAR_CLIP_VALUE);
    #endif
    return positionCS;
}
#endif

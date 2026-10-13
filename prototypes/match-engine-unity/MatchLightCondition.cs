using UnityEngine;
namespace Doppel6.Probe {
public enum MatchLight {Night,Day}
public struct MatchLightLook {
    public MatchLight light;
    public Color skyTop,skyHorizon,skyGround;
    public float lampEmission,windowLit,crowdLight,bannerLight;
}
}

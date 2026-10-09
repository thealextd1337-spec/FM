using System;
using System.Collections.Generic;

namespace Doppel6.Probe {
// Pure presentation data. Every Resolve call owns its fields and arrays.
// Side order matches ProbeBridge.standSides: z-, z+, x-, x+.
public sealed class ClubStadiumProfile {
    public string ClubId, DisplayName, Archetype, FacadeMotif;
    public int[] TierCounts;
    public bool[] RoofSides;
    public float StandDepth, MastHeight, RoofOverhang;
    public int DetailSeed;
    public bool CornerBuildings;
}

public static class ClubStadiumProfiles {
    static readonly Dictionary<string, ClubStadiumProfile> catalog = CreateCatalog();

    public static string[] KnownClubIds {
        get {
            var ids = new string[catalog.Count];
            catalog.Keys.CopyTo(ids, 0);
            Array.Sort(ids, StringComparer.Ordinal);
            return ids;
        }
    }

    public static ClubStadiumProfile Resolve(string clubId) {
        ClubStadiumProfile profile;
        if (clubId != null && catalog.TryGetValue(clubId, out profile)) return Copy(profile);
        // Missing identity is a neutral ground; an unfamiliar identity remains
        // visible for diagnostics. Neither path invents a club or changes saves.
        var id = string.IsNullOrEmpty(clubId) ? "NEUTRAL" : clubId;
        return Plan(id, "Neutral Community Ground", "garden-ground", "timber-rib",
            5, 4, 3, 3, true, false, false, false, 6.5f, 21f, .8f, false);
    }

    static ClubStadiumProfile Copy(ClubStadiumProfile p) {
        return new ClubStadiumProfile {
            ClubId=p.ClubId, DisplayName=p.DisplayName, Archetype=p.Archetype, FacadeMotif=p.FacadeMotif,
            TierCounts=(int[])p.TierCounts.Clone(), RoofSides=(bool[])p.RoofSides.Clone(),
            StandDepth=p.StandDepth, MastHeight=p.MastHeight, RoofOverhang=p.RoofOverhang,
            DetailSeed=p.DetailSeed, CornerBuildings=p.CornerBuildings
        };
    }

    // FNV-1a over the ID's UTF-16 code units, with explicit unchecked uint
    // arithmetic: independent of platform GetHashCode, sessions or match RNG.
    static int Seed(string id) {
        unchecked {
            uint hash = 2166136261u;
            for (int i=0; i<id.Length; i++) { hash ^= id[i]; hash *= 16777619u; }
            return (int)(hash & 0x7fffffffu);
        }
    }

    static ClubStadiumProfile Plan(string id, string name, string archetype, string facade,
        int a, int b, int c, int d, bool ra, bool rb, bool rc, bool rd,
        float depth, float mast, float overhang, bool corners) {
        return new ClubStadiumProfile {
            ClubId=id, DisplayName=name, Archetype=archetype, FacadeMotif=facade,
            TierCounts=new[] {a,b,c,d}, RoofSides=new[] {ra,rb,rc,rd},
            StandDepth=depth, MastHeight=mast, RoofOverhang=overhang,
            DetailSeed=Seed(id), CornerBuildings=corners
        };
    }

    static Dictionary<string, ClubStadiumProfile> CreateCatalog() {
        var entries = new[] {
            // England: old brick civic grounds, dock sheds and small gardens.
            Plan("ENG-1", "Regent Vale Gardens", "civic-bowl", "brick-arcade", 13,12,11,10, true,true,true,true, 16.5f,34f,2.8f,true),
            Plan("ENG-2", "Irwell Arena", "modern-ring", "metal-fins", 12,12,10,11, true,true,true,true, 15.8f,32f,3.6f,true),
            Plan("ENG-3", "Mersey Dock Ground", "dockside-ground", "harbor-slat", 11,9,10,7, true,true,true,false, 13.2f,31f,2.1f,true),
            Plan("ENG-4", "Works Assembly Park", "industrial-shed", "steel-truss", 10,8,7,8, true,true,false,true, 11.8f,30f,2.4f,false),
            Plan("ENG-5", "Quay Riverside Park", "dockside-ground", "brick-arcade", 8,6,5,4, true,true,false,false, 9.2f,25f,1.5f,false),
            Plan("ENG-6", "Wandle Meadow", "garden-ground", "timber-rib", 6,4,3,4, true,false,false,false, 6.8f,21f,.9f,false),
            Plan("ENG-C1", "Forge Yard", "industrial-shed", "brick-arcade", 6,5,4,3, true,true,false,false, 7.2f,24f,1.2f,true),
            Plan("ENG-C2", "Bay Terrace", "dockside-ground", "harbor-slat", 5,4,3,3, true,false,false,true, 6.2f,22f,1.1f,false),
            // Spain: sunny open ends and limestone civic colonnades.
            Plan("ESP-1", "Central Colonnade", "civic-bowl", "stone-colonnade", 14,13,12,12, true,true,true,true, 18.5f,36f,3.2f,true),
            Plan("ESP-2", "Mar Mediterranean Arena", "modern-ring", "tiled-parapet", 13,12,11,12, true,true,true,true, 17.2f,33f,3.8f,true),
            Plan("ESP-3", "Turia Sun Terrace", "sun-terraces", "limestone-step", 11,8,8,7, true,true,false,false, 12.8f,29f,2.5f,true),
            Plan("ESP-4", "Union Patio Ground", "urban-court", "tiled-parapet", 12,9,8,9, true,false,true,true, 13.4f,30f,1.8f,true),
            Plan("ESP-5", "Delta Youth Park", "garden-ground", "tiled-parapet", 7,5,4,5, true,false,false,true, 7.8f,23f,1.2f,false),
            Plan("ESP-6", "Atlantic Steps", "dockside-ground", "stone-colonnade", 7,6,5,4, true,true,false,false, 8.6f,26f,1.7f,true),
            Plan("ESP-C1", "Norte Courtyard", "sun-terraces", "tiled-parapet", 6,4,4,3, true,false,false,false, 6.6f,22f,.7f,true),
            Plan("ESP-C2", "Costa Promenade", "dockside-ground", "harbor-slat", 5,5,3,4, true,false,true,false, 6.4f,23f,1f,false),
            // Italy: industrial frames, civic masonry and sloping terraces.
            Plan("ITA-1", "Centrale Works Stadium", "industrial-shed", "steel-truss", 13,11,11,10, true,true,true,true, 16.2f,35f,3f,true),
            Plan("ITA-2", "Ferro Ring", "modern-ring", "steel-truss", 12,13,10,10, true,true,true,true, 16.8f,34f,3.5f,false),
            Plan("ITA-3", "Capitol Forum", "civic-bowl", "stone-colonnade", 12,10,9,10, true,true,false,true, 14.8f,33f,2.3f,true),
            Plan("ITA-4", "Collina Terrace", "hillside-ground", "limestone-step", 10,6,5,7, true,false,true,false, 11.2f,27f,1.6f,true),
            Plan("ITA-5", "Navigli Court", "urban-court", "brick-arcade", 8,7,5,6, true,true,false,false, 9.4f,25f,1.3f,true),
            Plan("ITA-6", "Sud Sun Bowl", "sun-terraces", "stone-colonnade", 11,9,8,6, true,true,false,true, 12.6f,30f,2f,false),
            Plan("ITA-C1", "Ovest Garden", "garden-ground", "brick-arcade", 6,5,3,4, true,false,true,false, 6.9f,22f,1f,true),
            Plan("ITA-C2", "Marina Steps", "sun-terraces", "limestone-step", 5,4,4,4, true,false,false,true, 6.1f,21f,.8f,false),
            // Germany: precise fins, port frameworks and low timber grounds.
            Plan("GER-1", "Isar Light Arena", "modern-ring", "metal-fins", 14,12,12,11, true,true,true,true, 18f,35f,4f,true),
            Plan("GER-2", "Weser Dock Park", "dockside-ground", "steel-truss", 11,10,9,8, true,true,true,false, 13.6f,31f,2.6f,false),
            Plan("GER-3", "Elbe Shipyard Stadium", "industrial-shed", "harbor-slat", 12,10,8,9, true,true,false,true, 14.2f,33f,2.7f,true),
            Plan("GER-4", "Tal Forest Ground", "hillside-ground", "timber-rib", 9,6,6,5, true,false,true,true, 9.8f,26f,1.8f,false),
            Plan("GER-5", "Rhein Civic Park", "civic-bowl", "brick-arcade", 9,8,7,6, true,true,false,false, 10.6f,28f,2.2f,true),
            Plan("GER-6", "Au Meadow Court", "urban-court", "timber-rib", 6,5,4,4, true,false,true,false, 7f,22f,.9f,true),
            Plan("GER-C1", "Sued Community Park", "garden-ground", "timber-rib", 5,4,4,3, true,false,false,true, 6.3f,21f,.8f,false),
            Plan("GER-C2", "Nord Brick Yard", "industrial-shed", "brick-arcade", 6,4,3,5, true,false,false,true, 7.1f,24f,1.1f,false),
            // France: metropolitan rings contrasted with provincial courts.
            Plan("FRA-1", "Central Lumiere Arena", "modern-ring", "metal-fins", 13,13,12,11, true,true,true,true, 18.2f,36f,3.9f,true),
            Plan("FRA-2", "Union Harbour Bowl", "civic-bowl", "limestone-step", 12,11,10,9, true,true,true,false, 15.2f,32f,2.8f,true),
            Plan("FRA-3", "Rive Hillside", "hillside-ground", "stone-colonnade", 10,7,8,6, true,false,true,true, 11.6f,29f,2.1f,true),
            Plan("FRA-4", "Atlantic Arcade", "urban-court", "stone-colonnade", 11,8,7,8, true,true,false,true, 12.2f,30f,1.9f,true),
            Plan("FRA-5", "Union Youth Yard", "industrial-shed", "brick-arcade", 8,7,6,5, true,true,true,false, 9.6f,27f,1.7f,false),
            Plan("FRA-6", "Valmy City Garden", "urban-court", "metal-fins", 6,5,4,3, true,false,true,false, 7.4f,23f,1.1f,true),
            Plan("FRA-C1", "Garonne Meadow", "garden-ground", "brick-arcade", 5,5,4,3, true,false,false,false, 6.7f,22f,.9f,false),
            Plan("FRA-C2", "Nord Stone Court", "urban-court", "stone-colonnade", 6,4,4,3, true,false,false,true, 6.8f,23f,1.2f,true),
            // Portugal: tiled pavilions, river frontage and hillside grounds.
            Plan("POR-1", "Central Tile Bowl", "civic-bowl", "tiled-parapet", 13,11,10,11, true,true,true,true, 16.4f,33f,3.1f,true),
            Plan("POR-2", "Ribeira River Arena", "modern-ring", "harbor-slat", 12,11,10,9, true,true,true,true, 15.6f,32f,3.3f,false),
            Plan("POR-3", "Tejo Civic Terrace", "sun-terraces", "tiled-parapet", 12,10,8,9, true,true,true,false, 14.6f,31f,2.6f,true),
            Plan("POR-4", "Norte Hillside Park", "hillside-ground", "limestone-step", 9,5,6,5, true,false,true,false, 9.2f,25f,1.5f,false),
            Plan("POR-5", "Athletic Scholar Court", "urban-court", "stone-colonnade", 8,6,5,5, true,true,false,false, 8.8f,25f,1.4f,true),
            Plan("POR-6", "Costa Lagoon Ground", "dockside-ground", "timber-rib", 6,5,3,4, true,false,false,true, 7.3f,23f,1f,false),
            Plan("POR-C1", "Central White Garden", "sun-terraces", "tiled-parapet", 5,4,3,4, true,false,true,false, 6f,20f,.6f,true),
            Plan("POR-C2", "Sul Sun Park", "garden-ground", "limestone-step", 5,3,3,4, true,false,false,false, 5.8f,20f,.7f,false)
        };
        var result = new Dictionary<string, ClubStadiumProfile>(StringComparer.Ordinal);
        foreach (var entry in entries) result.Add(entry.ClubId, entry);
        return result;
    }
}
}

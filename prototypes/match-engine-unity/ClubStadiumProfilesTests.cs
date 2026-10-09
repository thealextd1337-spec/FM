using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;

namespace Doppel6.Probe {
// No Unity dependency: callable by D6Cli and standalone C# compilers alike.
public static class ClubStadiumProfilesTests {
    static void Require(bool condition, string name, List<string> checks) {
        if (!condition) throw new InvalidOperationException("Club stadium profile: " + name);
        checks.Add(name);
    }

    static string Shape(ClubStadiumProfile p) {
        var result = new StringBuilder(p.Archetype + "/" + p.FacadeMotif);
        foreach (int count in p.TierCounts) result.Append("/").Append(count);
        foreach (bool roof in p.RoofSides) result.Append(roof ? "/R" : "/O");
        result.Append("/").Append(p.StandDepth.ToString("R", CultureInfo.InvariantCulture));
        result.Append("/").Append(p.MastHeight.ToString("R", CultureInfo.InvariantCulture));
        result.Append("/").Append(p.RoofOverhang.ToString("R", CultureInfo.InvariantCulture));
        return result.Append(p.CornerBuildings ? "/C" : "/G").ToString();
    }

    public static string[] Check() {
        var checks = new List<string>();
        var ids = ClubStadiumProfiles.KnownClubIds;
        var actual = new HashSet<string>(ids, StringComparer.Ordinal);
        var expected = new HashSet<string>(StringComparer.Ordinal);
        foreach (string country in new[] {"ENG", "ESP", "ITA", "GER", "FRA", "POR"}) {
            for (int club=1; club<=6; club++) expected.Add(country + "-" + club);
            expected.Add(country + "-C1"); expected.Add(country + "-C2");
        }
        Require(ids.Length==48 && actual.SetEquals(expected), "all 48 current club IDs exactly once", checks);
        var sorted = (string[])ids.Clone(); Array.Sort(sorted, StringComparer.Ordinal);
        Require(string.Join("|", ids)==string.Join("|", sorted), "known IDs have deterministic ordinal order", checks);
        var archetypes = new HashSet<string>(StringComparer.Ordinal);
        var shapes = new HashSet<string>(StringComparer.Ordinal);
        var roofPatterns = new HashSet<string>(StringComparer.Ordinal);
        var seeds = new HashSet<int>();
        foreach (string id in ids) {
            var first = ClubStadiumProfiles.Resolve(id);
            var repeat = ClubStadiumProfiles.Resolve(id);
            Require(first.ClubId==id && !string.IsNullOrEmpty(first.DisplayName) &&
                !string.IsNullOrEmpty(first.Archetype) && !string.IsNullOrEmpty(first.FacadeMotif), id + " resolved identity and architecture", checks);
            Require(first.TierCounts!=null && first.TierCounts.Length==4 && first.RoofSides!=null && first.RoofSides.Length==4,
                id + " four stand sides", checks);
            bool dimensions = IsFinite(first.StandDepth) && first.StandDepth>=5f && first.StandDepth<=20f &&
                IsFinite(first.MastHeight) && first.MastHeight>=18f && first.MastHeight<=40f &&
                IsFinite(first.RoofOverhang) && first.RoofOverhang>=0f && first.RoofOverhang<=4.5f;
            var roofPattern = new StringBuilder();
            for (int side=0; side<4; side++) {
                int rows = first.TierCounts[side];
                dimensions &= rows>=3 && rows<=14 && first.StandDepth/rows>=.6f && first.StandDepth/rows<=3.5f;
                roofPattern.Append(first.RoofSides[side] ? "R" : "O");
            }
            Require(dimensions && roofPattern.ToString().Contains("R"), id + " finite coherent dimensions and shelter", checks);
            Require(Shape(first)==Shape(repeat) && first.DetailSeed==repeat.DetailSeed &&
                first.DisplayName==repeat.DisplayName, id + " repeated lookup stable", checks);
            Require(!object.ReferenceEquals(first,repeat) && !object.ReferenceEquals(first.TierCounts,repeat.TierCounts) &&
                !object.ReferenceEquals(first.RoofSides,repeat.RoofSides), id + " independent lookup objects and arrays", checks);
            string baseline = Shape(repeat); int baselineSeed = repeat.DetailSeed;
            first.ClubId="changed"; first.DisplayName="changed"; first.Archetype="changed"; first.FacadeMotif="changed";
            first.StandDepth=-1; first.MastHeight=-1; first.RoofOverhang=-1; first.DetailSeed=-1;
            first.CornerBuildings=!first.CornerBuildings; first.TierCounts[0]=99; first.RoofSides[0]=!first.RoofSides[0];
            var later = ClubStadiumProfiles.Resolve(id);
            Require(Shape(repeat)==baseline && Shape(later)==baseline && repeat.DetailSeed==baselineSeed && later.DetailSeed==baselineSeed &&
                later.ClubId==id && later.DisplayName==repeat.DisplayName, id + " consumer mutation cannot alter catalog or peers", checks);
            Require(shapes.Add(Shape(later)), id + " unique architecture dimensions without color or seed", checks);
            Require(later.DetailSeed>=0 && seeds.Add(later.DetailSeed), id + " deterministic distinct detail seed", checks);
            archetypes.Add(later.Archetype); roofPatterns.Add(roofPattern.ToString());
        }
        Require(archetypes.SetEquals(new[] {"civic-bowl", "modern-ring", "industrial-shed", "dockside-ground",
            "urban-court", "garden-ground", "sun-terraces", "hillside-ground"}), "eight architectural silhouettes covered", checks);
        Require(roofPatterns.Count>=8, "at least eight visible roof arrangements", checks);
        ids[0]="changed";
        Require(new HashSet<string>(ClubStadiumProfiles.KnownClubIds, StringComparer.Ordinal).SetEquals(expected),
            "mutating KnownClubIds does not alter catalog", checks);
        var missing = ClubStadiumProfiles.Resolve(null);
        var empty = ClubStadiumProfiles.Resolve("");
        var unknown = ClubStadiumProfiles.Resolve("unknown-club");
        var other = ClubStadiumProfiles.Resolve("other-unknown");
        Require(missing.ClubId=="NEUTRAL" && empty.ClubId=="NEUTRAL" && Shape(missing)==Shape(empty) &&
            missing.DetailSeed==empty.DetailSeed, "null and empty identity use the same neutral ground", checks);
        Require(unknown.ClubId=="unknown-club" && other.ClubId=="other-unknown" && Shape(unknown)==Shape(missing) &&
            Shape(other)==Shape(missing) && unknown.DetailSeed!=other.DetailSeed,
            "unknown IDs preserve identity with safe neutral architecture", checks);
        Require(ClubStadiumProfiles.Resolve("eng-1").Archetype==missing.Archetype &&
            ClubStadiumProfiles.Resolve(" ENG-1 ").Archetype==missing.Archetype,
            "case and whitespace aliases do not impersonate a known club", checks);
        unknown.TierCounts[0]=999; unknown.RoofSides[0]=false;
        Require(Shape(ClubStadiumProfiles.Resolve("unknown-club"))==Shape(missing), "fallback arrays are independent", checks);
        Require(ClubStadiumProfiles.Resolve(new string('x',8192)).DetailSeed>=0,
            "long unknown ID hashes without checked overflow", checks);
        Require(ClubStadiumProfiles.Resolve("ENG-1").DetailSeed==439681357 &&
            ClubStadiumProfiles.Resolve("GER-1").DetailSeed==938718175 && missing.DetailSeed==1965144888,
            "seed algorithm has fixed cross-process reference vectors", checks);
        var england = ClubStadiumProfiles.Resolve("ENG-1");
        Require(england.TierCounts[0]==13 && england.TierCounts[1]==12 && england.TierCounts[2]==11 && england.TierCounts[3]==10,
            "side mapping remains z-minus z-plus x-minus x-plus", checks);
        return checks.ToArray();
    }

    static bool IsFinite(float value) { return !float.IsNaN(value) && !float.IsInfinity(value); }

    public static string Run(string repository, string outputFolder=null) {
        var checks = Check();
        var json = new StringBuilder("{\n  \"passed\": ").Append(checks.Length).Append(",\n  \"checks\": [\n");
        for (int i=0; i<checks.Length; i++) {
            json.Append("    \"").Append(checks[i]).Append("\"");
            json.Append(i==checks.Length-1 ? "\n" : ",\n");
        }
        json.Append("  ]\n}\n");
        var directory = Path.Combine(repository, outputFolder ?? "outputs/3d-quality/stadiums");
        Directory.CreateDirectory(directory);
        File.WriteAllText(Path.Combine(directory, "club-stadium-profile-tests.json"), json.ToString());
        return json.ToString();
    }
}
}

using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

namespace Doppel6.Probe {
// No Unity dependency: callable by D6Cli and standalone C# compilers alike.
// Covers the frozen 96-club mapping, the five authored architectural templates, ownership,
// exact template geometry/seed sharing, and unchanged legacy/standard/neutral paths.
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
        result.Append(p.CornerBuildings ? "/C" : "/G");
        return result.Append("/").Append(Declared(p)).ToString();
    }
    static string Declared(ClubStadiumProfile p) {
        var parts = new List<string>(); foreach (var f in StadiumFingerprint.Declared(p.Identity)) parts.Add(f.ToString());
        return string.Join(";", parts);
    }
    // Coverage of the live world, written into the report (not hidden behind passing checks).
    public sealed class Coverage { public int league, authored, sharedTemplate, legacyDerived, leagueStandard; public string[] authoredIds, sharedTemplateIds, legacyDerivedIds, leagueStandardIds; }
    public static Coverage LiveCoverage() {
        var authored = new List<string>(); var shared = new List<string>(); var derived = new List<string>(); var standard = new List<string>();
        foreach (var id in ClubStadiumProfiles.LiveLeagueClubIds) {
            var c = ClubStadiumProfiles.Coverage(id);
            if (c == "authored") authored.Add(id); else if (c == "shared-template") shared.Add(id); else if (c == "legacy-derived") derived.Add(id); else standard.Add(id);
        }
        return new Coverage { league = ClubStadiumProfiles.LiveLeagueClubIds.Length, authored = authored.Count, sharedTemplate = shared.Count, legacyDerived = derived.Count, leagueStandard = standard.Count,
            authoredIds = authored.ToArray(), sharedTemplateIds = shared.ToArray(), legacyDerivedIds = derived.ToArray(), leagueStandardIds = standard.ToArray() };
    }

    // Independent acceptance fixture: literal rows frozen from the approved table, never read
    // from ClubStadiumProfiles or recomputed from fan values. Columns: owner, name, template, size.
    const string FrozenLeagueRows = @"AUT-1|Wiener SC Kronau|GER-2|M
AUT-2|FC Salzburg Falken|GER-5|M
AUT-3|Schwarz Weiß Graz|GER-3|M
AUT-4|Linzer SC Union|GER-5|M
AUT-5|Innsbruck Sport|GER-5|M
AUT-6|SC Klagenfurt Seestadt|GER-6|S
AUT-7|SV St. Pölten Westpark|GER-6|S
AUT-8|Wiener SC Fortuna|GER-6|S
BEL-1|Brugge Reie FC|GER-2|M
BEL-2|Bruxelles Senne Union|GER-1|L
BEL-3|Antwerpen Schelde FC|GER-5|M
BEL-4|Gent Leie FC|GER-5|M
BEL-5|Liège Meuse FC|GER-3|M
BEL-6|Genk Kempen FC|GER-6|S
BEL-7|Charleroi Sambre FC|GER-6|S
BEL-8|Bruxelles Parc FC|GER-6|S
ENG-1|Regent Vale FC|GER-1|L
ENG-2|Irwell FC|GER-2|M
ENG-3|Mersey Dock FC|GER-3|M
ENG-4|Birmingham Works FC|GER-5|M
ENG-5|Bristol Quay FC|GER-6|S
ENG-6|Wandle Town|GER-6|S
ENG-7|Leeds Aire FC|GER-2|M
ENG-8|Newcastle Tyne FC|GER-3|M
ESP-1|Madrid Central CF|GER-1|L
ESP-2|Barcelona Mar FC|GER-1|L
ESP-3|Turia CF|GER-5|M
ESP-4|Sevilla Union FC|GER-2|M
ESP-5|Barcelona Delta FC|GER-6|S
ESP-6|Vigo Atlantic FC|GER-6|S
ESP-7|Bilbao Nervión CF|GER-5|M
ESP-8|Zaragoza Ebro CF|GER-5|M
FRA-1|Paris Central FC|GER-1|L
FRA-2|Marseille Union|GER-1|L
FRA-3|Lyon Rive FC|GER-5|M
FRA-4|Bordeaux Atlantic FC|GER-2|M
FRA-5|Lille Union|GER-5|M
FRA-6|Paris Valmy FC|GER-6|S
FRA-7|Nantes Loire FC|GER-6|S
FRA-8|Strasbourg Rives FC|GER-5|M
GER-1|FC München Isar|GER-1|L
GER-2|FC Bremen Weser|GER-2|M
GER-3|FC Hamburg Elbe|GER-3|M
GER-4|SC Freiburg Tal|GER-6|S
GER-5|FC Köln Rhein|GER-5|M
GER-6|SV München Au|GER-6|S
GER-7|FC Dortmund Emscher|GER-1|L
GER-8|FC Frankfurt Mainbogen|GER-5|M
GRE-1|Athina Helios FC|GER-1|L
GRE-2|Piräus Nautilos FC|GER-2|M
GRE-3|Thessaloniki Vardaris FC|GER-3|M
GRE-4|Athina Kallisto FC|GER-5|M
GRE-5|Thessaloniki Therma FC|GER-6|S
GRE-6|Patras Achaia FC|GER-6|S
GRE-7|Iraklio Candia FC|GER-6|S
GRE-8|Volos Pelion FC|GER-6|S
ITA-1|Torino Centrale FC|GER-1|L
ITA-2|Milano Ferro FC|GER-2|M
ITA-3|Roma Capitol FC|GER-1|L
ITA-4|Bologna Collina AC|GER-6|S
ITA-5|Navigli FC|GER-6|S
ITA-6|Napoli Sud AC|GER-3|M
ITA-7|Firenze Arno AC|GER-5|M
ITA-8|Genova Lanterna FC|GER-5|M
NED-1|Amsterdam Amstel FC|GER-1|L
NED-2|Rotterdam Maaspoort FC|GER-2|M
NED-3|Eindhoven Lichtstad FC|GER-5|M
NED-4|Utrecht Singel FC|GER-5|M
NED-5|Enschede Veld FC|GER-3|M
NED-6|Arnhem Rijnpark FC|GER-6|S
NED-7|Groningen Noorderpoort FC|GER-5|M
NED-8|Amsterdam Westhaven FC|GER-6|S
POR-1|Lisboa Central FC|GER-1|L
POR-2|Porto Ribeira FC|GER-2|M
POR-3|Tejo Union|GER-3|M
POR-4|Braga Norte FC|GER-5|M
POR-5|Coimbra Athletic|GER-6|S
POR-6|Aveiro Costa FC|GER-6|S
POR-7|Guimarães Castelo FC|GER-2|M
POR-8|Setúbal Sado FC|GER-6|S
SUI-1|Basel Rheintor FC|GER-2|M
SUI-2|Bern Aarebogen FC|GER-5|M
SUI-3|Zürich Limmat FC|GER-3|M
SUI-4|Genève Rhône FC|GER-5|M
SUI-5|St. Gallen Sitter FC|GER-2|M
SUI-6|Lausanne Léman FC|GER-6|S
SUI-7|Luzern Reuss FC|GER-6|S
SUI-8|Zürich Sihl FC|GER-6|S
TUR-1|Istanbul Bosporus SK|GER-1|L
TUR-2|Istanbul Haliç SK|GER-2|M
TUR-3|Istanbul Marmara SK|GER-5|M
TUR-4|Trabzon Karadeniz SK|GER-3|M
TUR-5|Ankara Kale SK|GER-5|M
TUR-6|Izmir Körfez SK|GER-2|M
TUR-7|Bursa Yeşilova SK|GER-6|S
TUR-8|Antalya Kıyı SK|GER-6|S";
    static string[][] FrozenRows() {
        var result = new List<string[]>();
        foreach (var row in FrozenLeagueRows.Split(new[] {'\n'}, StringSplitOptions.RemoveEmptyEntries)) result.Add(row.Trim().Split('|'));
        return result.ToArray();
    }
    // Exact authored fields, not the intentionally binned visual fingerprint. This detects a
    // changed span, roof coverage, landmark, supporter layout or material tone below a band.
    static string Exact(object value) {
        if (value == null) return "null";
        if (value is string text) return text.Length + ":" + text;
        if (value is float single) return single.ToString("R", CultureInfo.InvariantCulture);
        if (value is double number) return number.ToString("R", CultureInfo.InvariantCulture);
        var type = value.GetType();
        if (type.IsPrimitive || type.IsEnum) return value is IFormattable form ? form.ToString(null, CultureInfo.InvariantCulture) : value.ToString();
        var b = new StringBuilder();
        if (value is Array array) { foreach (var item in array) b.Append("[").Append(Exact(item)).Append("]"); return b.ToString(); }
        var fields = type.GetFields(); Array.Sort(fields, (a, c) => StringComparer.Ordinal.Compare(a.Name, c.Name));
        foreach (var field in fields) b.Append(field.Name).Append("=").Append(Exact(field.GetValue(value))).Append(";");
        return b.ToString();
    }
    static string Architecture(ClubStadiumProfile p) => Shape(p) + "/" + Exact(p.Identity);
    static bool OwnsNestedFields(ClubStadiumProfile a, ClubStadiumProfile b) {
        if (ReferenceEquals(a,b) || ReferenceEquals(a.TierCounts,b.TierCounts) || ReferenceEquals(a.RoofSides,b.RoofSides) ||
            ReferenceEquals(a.Identity,b.Identity) || ReferenceEquals(a.Identity.Stands,b.Identity.Stands) ||
            ReferenceEquals(a.Identity.Corners,b.Identity.Corners) || ReferenceEquals(a.Identity.Landmarks,b.Identity.Landmarks) ||
            ReferenceEquals(a.Identity.Floodlights,b.Identity.Floodlights) || ReferenceEquals(a.Identity.Surroundings,b.Identity.Surroundings) ||
            ReferenceEquals(a.Identity.Supporters,b.Identity.Supporters)) return false;
        for (int i=0; i<4; i++) if (ReferenceEquals(a.Identity.Stands[i],b.Identity.Stands[i]) || ReferenceEquals(a.Identity.Stands[i].Roof,b.Identity.Stands[i].Roof)) return false;
        for (int i=0; i<a.Identity.Landmarks.Length; i++) if (ReferenceEquals(a.Identity.Landmarks[i],b.Identity.Landmarks[i])) return false;
        return true;
    }
    static void MutateNestedFields(ClubStadiumProfile p) {
        p.ClubId="changed"; p.DisplayName="changed"; p.Venue="changed"; p.TemplateId="changed"; p.DetailSeed=-1;
        for (int i=0; i<4; i++) { p.TierCounts[i]=99; p.RoofSides[i]=!p.RoofSides[i]; p.Identity.Stands[i].Rows=99;
            p.Identity.Stands[i].Roof.Coverage=-1; p.Identity.Corners[i]=CornerForm.Tower; }
        foreach (var l in p.Identity.Landmarks) { l.Kind=LandmarkKind.ClockTower; l.Place=LandmarkPlace.FarCentre; }
        p.Identity.Floodlights.Height=-1; p.Identity.Supporters.HomeEnd=9;
        for (int i=0; i<p.Identity.Surroundings.Length; i++) p.Identity.Surroundings[i]=SurroundingKind.Forest;
        p.Identity.Country="changed"; p.Identity.Steel="#000000";
    }
    static void CheckFrozenAssignments(List<string> checks) {
        var ids = new HashSet<string>(StringComparer.Ordinal);
        var counts = new Dictionary<string,int>(StringComparer.Ordinal);
        var seeds = new Dictionary<string,int> {{"GER-1",938718175},{"GER-2",955495794},{"GER-3",972273413},{"GER-5",871607699},{"GER-6",888385318}};
        var sizes = new Dictionary<string,int>(StringComparer.Ordinal);
        foreach (var row in FrozenRows()) {
            string id=row[0], name=row[1], template=row[2], size=row[3];
            Require(ids.Add(id), id + " frozen assignment occurs once", checks);
            var p=ClubStadiumProfiles.Resolve(id); var repeated=ClubStadiumProfiles.Resolve(id); var source=ClubStadiumProfiles.Resolve(template);
            string architecture=Architecture(p), sourceArchitecture=Architecture(source);
            Require(p.ClubId==id && p.Venue==id && p.DisplayName==name && p.TemplateId==template,
                id + " preserves actual club name and owner; architectural template " + template, checks);
            Require(p.DetailSeed==seeds[template] && p.DetailSeed==source.DetailSeed && architecture==sourceArchitecture,
                id + " copies exact template geometry, environment, supporter layout, material tones and fixed seed", checks);
            Require(p.Identity.Source=="authored" && p.Identity.Country=="GER" && p.Identity.SizeClass==size && ClubStadiumProfiles.SizeClassOf(p.TierCounts)==size && Problems(p).Count==0,
                id + " frozen size class " + size + " and template architectural country", checks);
            Require(ClubStadiumProfiles.Coverage(id)==(id==template?"authored":"shared-template"), id + " original owner or explicit shared-template coverage", checks);
            Require(OwnsNestedFields(p,repeated) && OwnsNestedFields(p,source), id + " owns every mutable nested template field", checks);
            MutateNestedFields(p);
            var later=ClubStadiumProfiles.Resolve(id); var laterSource=ClubStadiumProfiles.Resolve(template);
            Require(Architecture(repeated)==architecture && Architecture(later)==architecture && Architecture(source)==sourceArchitecture && Architecture(laterSource)==sourceArchitecture &&
                later.DetailSeed==seeds[template] && later.ClubId==id && later.DisplayName==name && later.Venue==id && later.TemplateId==template,
                id + " consumer mutation leaves same-template peers, catalog and template unchanged", checks);
            var home=ClubStadiumProfiles.ResolveVenue(id,"league","home","league",id.Substring(0,3));
            var cupTie=ClubStadiumProfiles.ResolveVenue(id,"league","home","cup",id.Substring(0,3));
            Require(Architecture(home)==architecture && Architecture(cupTie)==architecture && home.ClubId==id && home.Venue==id && home.TemplateId==template && cupTie.TemplateId==template && cupTie.Venue==id,
                id + " league and home cup fixtures reuse the same frozen home assignment", checks);
            var legacy=ClubStadiumProfiles.ResolveLegacy(id);
            Require(legacy.TemplateId==null && legacy.DetailSeed==ClubStadiumProfiles.Seed(id) && legacy.Identity.Source=="legacy-derived",
                id + " legacy lookup remains outside the frozen presentation mapping", checks);
            counts[template]=counts.TryGetValue(template,out var count)?count+1:1;
            sizes[size]=sizes.TryGetValue(size,out var sizeCount)?sizeCount+1:1;
        }
        Require(ids.Count==96 && ids.SetEquals(ClubStadiumProfiles.LiveLeagueClubIds), "frozen literal fixture covers every one of 96 live league owners exactly once", checks);
        Require(counts.Count==5 && counts["GER-1"]==14 && counts["GER-2"]==16 && counts["GER-3"]==11 && counts["GER-5"]==25 && counts["GER-6"]==30,
            "frozen assignment totals: GER-1 14; GER-2 16; GER-3 11; GER-5 25; GER-6 30", checks);
        Require(sizes.Count==3 && sizes["L"]==14 && sizes["M"]==52 && sizes["S"]==30, "frozen size totals: large 14, medium 52, small 30", checks);
    }
    static void CheckAssignmentDocument(string repository, List<string> checks) {
        string json=File.ReadAllText(Path.Combine(repository,"docs/stadion-zuordnung-geplant.json"));
        var blocks=Regex.Matches(json,@"\{[^{}]*""clubId""[^{}]*\}");
        var actual=new Dictionary<string,string>(StringComparer.Ordinal);
        foreach (Match block in blocks) {
            string Read(string key) => Regex.Match(block.Value,"\""+key+"\"\\s*:\\s*\"([^\"]*)\"").Groups[1].Value;
            actual.Add(Read("clubId"),Read("clubName")+"|"+Read("templateId")+"|"+Read("size"));
        }
        Require(actual.Count==96,"assignment document contains exactly 96 unique literal club rows",checks);
        foreach (var row in FrozenRows()) {
            string size=row[3]=="L"?"large":row[3]=="M"?"medium":"small";
            Require(actual.TryGetValue(row[0],out var value) && value==row[1]+"|"+row[2]+"|"+size, row[0]+" assignment document agrees with the independent frozen fixture",checks);
        }
    }

    // Problems of an identity against its profile (empty when valid).
    public static List<string> Problems(ClubStadiumProfile p) {
        var list = new List<string>(); var id = p.Identity;
        if (id == null) { list.Add("no identity"); return list; }
        if (id.Stands == null || id.Stands.Length != 4) list.Add("four stands");
        if (id.Corners == null || id.Corners.Length != 4) list.Add("four corners");
        if (list.Count > 0) return list;
        if (id.SizeClass != ClubStadiumProfiles.SizeClassOf(p.TierCounts)) list.Add("size class " + id.SizeClass + " differs from rows");
        for (int i=0; i<4; i++) {
            var s = id.Stands[i];
            if (s.Rows != p.TierCounts[i]) list.Add("side " + i + " rows " + s.Rows + " != " + p.TierCounts[i]);
            if (s.Tiers < 1 || s.Tiers > 3) list.Add("side " + i + " tiers");
            if ((s.Form == StandForm.SingleTerrace || s.Form == StandForm.KopEnd || s.Form == StandForm.OpenBank) && s.Tiers != 1) list.Add("side " + i + " standing terraces have one tier");
            if (s.Tiers > 1 && s.Rows < 3 * s.Tiers) list.Add("side " + i + " too few rows for its tiers");
            if (s.Span < .3f || s.Span > 1f) list.Add("side " + i + " span");
            if (s.HeightOffset < 0 || s.HeightOffset > 3) list.Add("side " + i + " height offset");
            if (s.Roof == null) { list.Add("side " + i + " roof"); continue; }
            if (s.Roof.Kind != RoofKind.None && (s.Roof.Coverage <= 0 || s.Roof.Coverage > 1)) list.Add("side " + i + " roof coverage");
            if (s.Form == StandForm.OpenBank && s.Roof.Kind != RoofKind.None) list.Add("side " + i + " grass bank under a roof");
            if (p.RoofSides[i] != (s.Roof.Kind != RoofKind.None)) list.Add("side " + i + " roofed side flag");
        }
        if (id.Supporters == null) list.Add("supporters");
        else {
            var sp = id.Supporters;
            if (sp.HomeEnd != 2 && sp.HomeEnd != 3) list.Add("home end");
            if (sp.AwayWidth < .18f || sp.AwayWidth > .32f) list.Add("away width");
            if (sp.FlagDensity < 0 || sp.FlagDensity > 1) list.Add("flag density");
        }
        if (id.Landmarks == null || id.Landmarks.Length > 3) list.Add("landmarks");
        if (id.Source == "authored" && (id.Landmarks.Length < 1 || id.Surroundings == null || id.Surroundings.Length < 1)) list.Add("authored identity names landmarks and surroundings");
        if (id.Floodlights == null || id.Floodlights.Kind != FloodlightKind.RoofRail && id.Floodlights.Count < 2) list.Add("floodlights");
        return list;
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
        Require(ids.Length==48 && actual.SetEquals(expected), "all 48 legacy catalogue IDs exactly once", checks);
        var sorted = (string[])ids.Clone(); Array.Sort(sorted, StringComparer.Ordinal);
        Require(string.Join("|", ids)==string.Join("|", sorted), "known IDs have deterministic ordinal order", checks);
        var archetypes = new HashSet<string>(StringComparer.Ordinal);
        var shapes = new HashSet<string>(StringComparer.Ordinal);
        var roofPatterns = new HashSet<string>(StringComparer.Ordinal);
        var seeds = new HashSet<int>();
        var cupVenues = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (string id in ids) {
            bool cup = ClubStadiumProfiles.IsCupId(id);
            var first = ClubStadiumProfiles.Resolve(id);
            var repeat = ClubStadiumProfiles.Resolve(id);
            Require(first.ClubId==id && !string.IsNullOrEmpty(first.DisplayName) &&
                !string.IsNullOrEmpty(first.Archetype) && !string.IsNullOrEmpty(first.FacadeMotif) && !string.IsNullOrEmpty(first.Venue), id + " resolved identity and architecture", checks);
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
            var problems = Problems(first);
            Require(problems.Count==0, id + " identity is valid" + (problems.Count>0 ? ": " + string.Join(", ", problems) : ""), checks);
            Require(Shape(first)==Shape(repeat) && first.DetailSeed==repeat.DetailSeed &&
                first.DisplayName==repeat.DisplayName, id + " repeated lookup stable", checks);
            Require(!object.ReferenceEquals(first,repeat) && !object.ReferenceEquals(first.TierCounts,repeat.TierCounts) &&
                !object.ReferenceEquals(first.RoofSides,repeat.RoofSides) && !object.ReferenceEquals(first.Identity,repeat.Identity) &&
                !object.ReferenceEquals(first.Identity.Stands,repeat.Identity.Stands) && !object.ReferenceEquals(first.Identity.Stands[0].Roof,repeat.Identity.Stands[0].Roof) &&
                !object.ReferenceEquals(first.Identity.Supporters,repeat.Identity.Supporters), id + " independent lookup objects and arrays", checks);
            string baseline = Shape(repeat); int baselineSeed = repeat.DetailSeed;
            first.ClubId="changed"; first.DisplayName="changed"; first.Archetype="changed"; first.FacadeMotif="changed";
            first.StandDepth=-1; first.MastHeight=-1; first.RoofOverhang=-1; first.DetailSeed=-1;
            first.CornerBuildings=!first.CornerBuildings; first.TierCounts[0]=99; first.RoofSides[0]=!first.RoofSides[0];
            first.Identity.Stands[0].Rows=99; first.Identity.Stands[0].Roof.Kind=RoofKind.Sail; first.Identity.Corners[0]=CornerForm.Tower; first.Identity.Supporters.HomeEnd=9; first.Venue="changed";
            var later = ClubStadiumProfiles.Resolve(id);
            Require(Shape(repeat)==baseline && Shape(later)==baseline && repeat.DetailSeed==baselineSeed && later.DetailSeed==baselineSeed &&
                later.ClubId==id && later.DisplayName==repeat.DisplayName, id + " consumer mutation cannot alter catalog or peers", checks);
            if (cup) {
                // Every cup-only club plays in its country's standard ground.
                string country = id.Substring(0, 3);
                Require(later.Venue=="CUP-STANDARD-" + country && later.Identity.Source=="standard" && ClubStadiumProfiles.Coverage(id)=="cup-standard", id + " plays in the " + country + " cup standard ground", checks);
                string venueShape = Declared(later) + "/" + later.DetailSeed;
                if (cupVenues.TryGetValue(country, out var sharedShape)) Require(sharedShape==venueShape, id + " shares the cup standard of " + country + " structurally", checks); else cupVenues[country] = venueShape;
                continue;
            }
            Require(later.Venue==id, id + " plays in its own ground", checks);
            shapes.Add(Shape(later));
            Require(later.DetailSeed>=0, id + " deterministic template detail seed", checks); seeds.Add(later.DetailSeed);
            archetypes.Add(later.Archetype); roofPatterns.Add(roofPattern.ToString());
        }
        Require(archetypes.SetEquals(new[] {"civic-bowl", "modern-ring", "industrial-shed", "dockside-ground", "urban-court"}) && shapes.Count==5 && seeds.Count==5,
            "league grounds share exactly five authored architectural shapes and template seeds", checks);
        Require(roofPatterns.Count==4, "five authored templates retain four roof arrangements", checks);
        ids[0]="changed";
        Require(new HashSet<string>(ClubStadiumProfiles.KnownClubIds, StringComparer.Ordinal).SetEquals(expected),
            "mutating KnownClubIds does not alter catalog", checks);

        // Live world coverage: five original template owners and 91 explicit shared assignments.
        CheckFrozenAssignments(checks);
        var coverage = LiveCoverage();
        Require(coverage.league==96 && new HashSet<string>(ClubStadiumProfiles.LiveLeagueClubIds).Count==96, "96 live league club IDs (12 countries x 8)", checks);
        Require(coverage.authored + coverage.sharedTemplate + coverage.legacyDerived + coverage.leagueStandard==96, "every live league club has exactly one coverage class", checks);
        Require(new HashSet<string>(coverage.authoredIds).SetEquals(ClubStadiumProfiles.AuthoredClubIds) && coverage.authored==5,
            "original authored template owners are exactly GER-1, GER-2, GER-3, GER-5, GER-6 (" + coverage.authored + " of 96)", checks);
        Require(coverage.sharedTemplate==91 && coverage.legacyDerived==0 && coverage.leagueStandard==0,
            "91 other league clubs share frozen authored templates; no league standard or derived gaps", checks);

        // Authored prototypes: identity, size class, structure.
        var authored = new List<ClubStadiumProfile>();
        var sizes = new Dictionary<string, string> {{"GER-1","L"},{"GER-2","M"},{"GER-3","M"},{"GER-5","M"},{"GER-6","S"}};
        foreach (var id in ClubStadiumProfiles.AuthoredClubIds) {
            var p = ClubStadiumProfiles.Resolve(id); authored.Add(p);
            Require(p.Identity.Source=="authored" && p.Identity.Country==id.Substring(0,3) && p.Identity.SizeClass==sizes[id] && ClubStadiumProfiles.SizeClassOf(p.TierCounts)==sizes[id],
                id + " authored identity keeps its size class " + sizes[id], checks);
            Require(p.Identity.Landmarks.Length>=1 && p.Identity.Landmarks.Length<=3 && !string.IsNullOrEmpty(p.Identity.Asymmetry) && !string.IsNullOrEmpty(p.Identity.Regional),
                id + " names 1-3 landmarks, its asymmetry and regional detail", checks);
        }
        for (int a=0; a<authored.Count; a++) for (int b=a+1; b<authored.Count; b++) {
            var pa = authored[a]; var pb = authored[b];
            int d = StadiumFingerprint.Distance(StadiumFingerprint.Declared(pa.Identity), StadiumFingerprint.Declared(pb.Identity), out int silhouette);
            bool sameCountry = pa.Identity.Country==pb.Identity.Country;int ra=Sum(pa.TierCounts),rb=Sum(pb.TierCounts);
            bool similar = sameCountry && Math.Abs(ra-rb) <= .15f*Math.Max(ra,rb);
            int need = similar ? 6 : sameCountry ? 5 : 4, needSilhouette = sameCountry ? 3 : 2;
            Require(d>=need && silhouette>=needSilhouette, pa.ClubId + " vs " + pb.ClubId + " differ in " + d + " groups (" + silhouette + " silhouette; required " + need + "/" + needSilhouette + (similar ? ", comparable size" : "") + ")", checks);
            if (sameCountry && pa.Archetype==pb.Archetype)
                Require(Differs(pa,pb,"roofs") && Differs(pa,pb,"stands"), pa.ClubId + " and " + pb.ClubId + " share an archetype but differ in roofs and stands", checks);
        }
        // Standards and neutral venues stay structurally apart from the club grounds.
        var venues = new[] {ClubStadiumProfiles.CupStandard("GER-C9","GER",null), ClubStadiumProfiles.LeagueStandard("GER-9","GER"), ClubStadiumProfiles.NeutralEurope(), ClubStadiumProfiles.NeutralCup("GER")};
        foreach (var v in venues) {
            Require(Problems(v).Count==0 && v.Identity.Source=="standard", v.Venue + " identity is valid", checks);
            foreach (var p in authored) {
                int d = StadiumFingerprint.Distance(StadiumFingerprint.Declared(v.Identity), StadiumFingerprint.Declared(p.Identity), out int silhouette);
                Require(d>=4 && silhouette>=2, v.Venue + " vs " + p.ClubId + " differ in " + d + " groups (" + silhouette + " silhouette)", checks);
            }
        }
        Require(ClubStadiumProfiles.NeutralEurope().Identity.Supporters.Neutral && ClubStadiumProfiles.NeutralCup("GER").Identity.Supporters.Neutral &&
            !ClubStadiumProfiles.CupStandard("GER-C1","GER",null).Identity.Supporters.Neutral, "only the neutral venues split the ends evenly", checks);
        // Country variants: the facade group carries the country (no club colours involved).
        var facades = new HashSet<string>(StringComparer.Ordinal);
        foreach (var c in ClubStadiumProfiles.Countries) foreach (var f in StadiumFingerprint.Declared(ClubStadiumProfiles.CupStandard(c+"-C1",c,null).Identity)) if (f.Group=="facade") facades.Add(f.Value);
        Require(facades.Count==ClubStadiumProfiles.Countries.Length, "cup standard has one facade variant per live country (" + facades.Count + ")", checks);
        Require(ClubStadiumProfiles.Resolve("NED-C7").Venue=="CUP-STANDARD-NED" && ClubStadiumProfiles.Resolve("TUR-C1").Identity.Country=="TUR", "expansion cup clubs use their country's cup standard", checks);

        // Venue resolution from the received display facts.
        Require(ClubStadiumProfiles.ResolveVenue("GER-1","league","neutral","europe","").Venue=="NEUTRAL-EUROPE", "European finals play in the neutral European arena", checks);
        Require(ClubStadiumProfiles.ResolveVenue("GER-1","league","neutral","cup","GER").Venue=="NEUTRAL-CUP-GER" &&
            ClubStadiumProfiles.ResolveVenue("ITA-2","league","neutral","cup","").Venue=="NEUTRAL-CUP-ITA", "cup finals play in the national cup ground of the venue country", checks);
        Require(ClubStadiumProfiles.ResolveVenue("GER-C1","cup","home","cup","GER").Venue=="CUP-STANDARD-GER" &&
            ClubStadiumProfiles.ResolveVenue("GER-3","league","home","cup","GER").Venue=="GER-3", "home cup ties use the home club's ground", checks);
        Require(ClubStadiumProfiles.ResolveVenue("GER-2",null,"home","","").Venue=="GER-2", "absent presentation keeps the home club's ground", checks);

        var missing = ClubStadiumProfiles.Resolve(null);
        var empty = ClubStadiumProfiles.Resolve("");
        var unknown = ClubStadiumProfiles.Resolve("unknown-club");
        var other = ClubStadiumProfiles.Resolve("other-unknown");
        Require(missing.ClubId=="NEUTRAL" && empty.ClubId=="NEUTRAL" && Shape(missing)==Shape(empty) &&
            missing.DetailSeed==empty.DetailSeed && missing.Venue=="LEAGUE-STANDARD", "null and empty identity use the same standard league ground", checks);
        Require(unknown.ClubId=="unknown-club" && other.ClubId=="other-unknown" && unknown.Identity.Source=="standard" && other.Identity.Source=="standard" &&
            unknown.Archetype!="garden-ground" && unknown.DisplayName!="Neutral Community Ground" && unknown.Venue=="LEAGUE-STANDARD" && ClubStadiumProfiles.Resolve("XYZ-9").Venue=="LEAGUE-STANDARD",
            "unknown IDs preserve identity on a standard league ground, never the garden ground", checks);
        Require(ClubStadiumProfiles.Resolve("NED-9").Venue=="LEAGUE-STANDARD-NED" && ClubStadiumProfiles.Resolve("ENG-9").Venue=="LEAGUE-STANDARD-ENG" &&
            ClubStadiumProfiles.Coverage("NED-9")=="league-standard", "unknown league IDs still use their country's standard league ground", checks);
        Require(ClubStadiumProfiles.Resolve("eng-1").Venue!="ENG-1" && ClubStadiumProfiles.Resolve(" ENG-1 ").Venue!="ENG-1",
            "case and whitespace aliases do not impersonate a known club", checks);
        string unknownBefore = Shape(ClubStadiumProfiles.Resolve("unknown-club"));
        unknown.TierCounts[0]=999; unknown.RoofSides[0]=false; unknown.Identity.Stands[0].Rows=1;
        Require(Shape(ClubStadiumProfiles.Resolve("unknown-club"))==unknownBefore && Shape(unknown)!=unknownBefore, "fallback arrays are independent", checks);
        Require(ClubStadiumProfiles.Resolve(new string('x',8192)).DetailSeed>=0 && ClubStadiumProfiles.Seed(new string('x',8192))>=0,
            "long unknown ID hashes without checked overflow", checks);
        Require(ClubStadiumProfiles.Seed("ENG-1")==439681357 && ClubStadiumProfiles.Resolve("ENG-1").DetailSeed==938718175 &&
            ClubStadiumProfiles.Resolve("GER-1").DetailSeed==938718175 && ClubStadiumProfiles.Seed("NEUTRAL")==1965144888,
            "seed algorithm has fixed cross-process reference vectors", checks);
        var england = ClubStadiumProfiles.Resolve("ENG-1");
        Require(england.TierCounts[0]==14 && england.TierCounts[1]==12 && england.TierCounts[2]==12 && england.TierCounts[3]==11,
            "side mapping remains z-minus z-plus x-minus x-plus", checks);
        Require(ClubStadiumProfiles.IsCupId("GER-C1") && ClubStadiumProfiles.IsCupId("NED-C12") && !ClubStadiumProfiles.IsCupId("GER-1") &&
            !ClubStadiumProfiles.IsCupId("GER-C") && !ClubStadiumProfiles.IsCupId("C1") && !ClubStadiumProfiles.IsCupId(null) && !ClubStadiumProfiles.IsCupId("GER-Cx"),
            "cup IDs follow the page rule -C<digits>", checks);
        // Pages without a presentation keep the Release 130 profiles: legacy fields, archetype
        // architecture, cup clubs on their own grounds and the garden ground for unknown IDs.
        foreach (string id in ClubStadiumProfiles.KnownClubIds) {
            var legacy = ClubStadiumProfiles.ResolveLegacy(id);
            Require(legacy.ClubId==id && legacy.Venue==id && legacy.Identity.Source=="legacy-derived" && legacy.DetailSeed==ClubStadiumProfiles.Seed(id) && Problems(legacy).Count==0,
                id + " keeps its Release 130 profile for pages without a presentation", checks);
        }
        var legacyGer5 = ClubStadiumProfiles.ResolveLegacy("GER-5");
        Require(legacyGer5.Archetype=="civic-bowl" && !legacyGer5.RoofSides[2] && !legacyGer5.RoofSides[3] && ClubStadiumProfiles.Resolve("GER-5").RoofSides[2],
            "an authored club keeps its legacy roofs in the Release 130 profile (GER-5 ends open), its authored roofs otherwise", checks);
        Require(ClubStadiumProfiles.ResolveLegacy("GER-C1").Archetype=="garden-ground" && ClubStadiumProfiles.ResolveLegacy("GER-C1").Venue=="GER-C1",
            "a cup club keeps its own Release 130 ground for pages without a presentation", checks);
        var legacyUnknown = ClubStadiumProfiles.ResolveLegacy("XYZ-9"); var legacyMissing = ClubStadiumProfiles.ResolveLegacy(null);
        Require(legacyUnknown.DisplayName=="Neutral Community Ground" && legacyUnknown.ClubId=="XYZ-9" && legacyMissing.ClubId=="NEUTRAL" && legacyMissing.DetailSeed==1965144888 &&
            legacyUnknown.Archetype=="garden-ground", "unknown IDs keep the Release 130 garden ground only for pages without a presentation", checks);
        // The fingerprint ignores names, IDs, seeds and colour tones.
        var probe = ClubStadiumProfiles.Resolve("GER-2"); string before = Declared(probe);
        probe.ClubId="X"; probe.DisplayName="X"; probe.DetailSeed=7; probe.Identity.Steel="#000000"; probe.Identity.RoofTone="#ffffff";
        Require(Declared(probe)==before, "structural fingerprint excludes names, IDs, seeds and colours", checks);
        return checks.ToArray();
    }
    static int Sum(int[] a) { int s=0; foreach (int x in a) s+=x; return s; }
    static bool Differs(ClubStadiumProfile a, ClubStadiumProfile b, string group) {
        string Find(ClubStadiumProfile p) { foreach (var f in StadiumFingerprint.Declared(p.Identity)) if (f.Group==group) return f.Value; return null; }
        return Find(a)!=Find(b);
    }

    static bool IsFinite(float value) { return !float.IsNaN(value) && !float.IsInfinity(value); }

    public static string Run(string repository, string outputFolder=null) {
        var checkList = new List<string>(Check()); CheckAssignmentDocument(repository, checkList);
        var checks = checkList.ToArray(); var coverage = LiveCoverage();
        string List(string[] values) { var q = new List<string>(); foreach (var v in values) q.Add("\"" + v + "\""); return "[" + string.Join(", ", q) + "]"; }
        var json = new StringBuilder("{\n  \"passed\": ").Append(checks.Length).Append(",\n");
        json.Append("  \"coverage\": {\"leagueClubs\": ").Append(coverage.league).Append(", \"authored\": ").Append(coverage.authored)
            .Append(", \"sharedTemplate\": ").Append(coverage.sharedTemplate).Append(", \"legacyDerived\": ").Append(coverage.legacyDerived).Append(", \"leagueStandard\": ").Append(coverage.leagueStandard)
            .Append(",\n    \"authoredIds\": ").Append(List(coverage.authoredIds)).Append(",\n    \"sharedTemplateIds\": ").Append(List(coverage.sharedTemplateIds)).Append(",\n    \"legacyDerivedIds\": ").Append(List(coverage.legacyDerivedIds))
            .Append(",\n    \"leagueStandardIds\": ").Append(List(coverage.leagueStandardIds)).Append(",\n    \"note\": \"All 96 league clubs use the explicit frozen five-template table: five original authored owners and 91 shared assignments. Owner IDs/names remain actual clubs; template geometry, country and detail seeds remain fixed. The 91 additional individual designs are deferred. Legacy pages, cup standards and neutral venues keep their existing paths.\"},\n");
        json.Append("  \"checks\": [\n");
        for (int i=0; i<checks.Length; i++) {
            json.Append("    \"").Append(checks[i].Replace("\\", "\\\\").Replace("\"", "\\\"")).Append("\"");
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

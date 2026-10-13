using System;
using System.Collections.Generic;
using System.Text;

namespace Doppel6.Probe {
// Structural stadium identity (schema d6-stadium-identity-1). Pure presentation data without
// Unity types: no club colours, names or seeds enter its fingerprint. Side order z-, z+, x-, x+
// (ProbeBridge.standSides). Corners join two stands, so they are authored once per corner:
// far-left (x- z-), far-right (x+ z-), near-left (x- z+), near-right (x+ z+); the broadcast
// camera stands on the z+ side. Left/right of a stand are as seen from the pitch.
public enum StandForm {OpenBank,SingleTerrace,SeatedSingle,TwoTier,ThreeTier,KopEnd,MainStand}
public enum CornerForm {Open,Filled,Curved,Tower}
public enum RoofKind {None,Flat,Cantilever,Gable,Sail,Barrel,Sawtooth,TrussGirder,ArchSuspended}
public enum RoofSupport {Columns,Cantilever,Truss,MastCable,Arch}
public enum RoofEdge {Straight,Curved,Saw,Gabled}
public enum FacadeMaterial {Brick,Stone,Limestone,Tile,Timber,SteelFin,Slat,Concrete}
public enum LandmarkKind {ClockTower,GablePediment,ScoreboardTower,Crane,Chimney,Spire,Arch,RiverQuay,TileMural,GlassAtrium,Lighthouse,HillBackdrop,TwinSpires,TvTower,Windmill,GantryCrane}
// Behind the far stand (left, centre, right), behind an end, on the far main stand or in the far-right corner.
public enum LandmarkPlace {FarLeft,FarCentre,FarRight,EndLeft,EndRight,MainStand,Corner}
public enum FloodlightKind {CornerMasts,RoofRail,SidePoles,LatticePylons}
public enum LampHead {Square,Triangle,Ring,Bar}
public enum EntranceKind {TurnstileBlock,GrandGate,RampTowers,Plain}
public enum SurroundingKind {UrbanBlocks,TerracedHouses,River,Harbour,Hills,Forest,Park,Industry,Coast,Mountains}
public enum HomeBlockForm {FullEnd,CentralBlock,LowerTier,UpperTier}
public enum AwayBlockPosition {CornerLeft,CornerRight,UpperTier,EndSegment}
public enum BannerStyle {Fence,Drop,Long}
public enum TifoStyle {Mosaic,Scarves,None}

public sealed class RoofSpec {public RoofKind Kind;public float Coverage;public RoofSupport Support;public RoofEdge Edge;}
// Rows equal the profile's TierCounts side; Span is the share of the side the stand occupies (centred).
public sealed class StandSpec {public StandForm Form;public int Rows,Tiers;public float HeightOffset,Span=1;public RoofSpec Roof;}
public sealed class LandmarkSpec {public LandmarkKind Kind;public LandmarkPlace Place;}
public sealed class FloodlightSpec {public FloodlightKind Kind;public int Count;public LampHead Head;public float Height;}
// HomeEnd 2 (x-) or 3 (x+); the visitors' section stands in the opposite end. Neutral venues
// give both clubs equal full ends: the team flagged home on x-, the other on x+.
public sealed class SupporterSpec {public int HomeEnd;public HomeBlockForm HomeForm;public AwayBlockPosition AwayPosition;public float AwayWidth;public BannerStyle Banners;public float FlagDensity;public TifoStyle Tifo;public bool Neutral;}
public sealed class StadiumIdentity {
    // authored | legacy-derived | standard
    public string Source,Country,SizeClass,Asymmetry,Regional;
    public StandSpec[] Stands;public CornerForm[] Corners;public int DominantSide;
    public FacadeMaterial Facade;public LandmarkSpec[] Landmarks;public FloodlightSpec Floodlights;
    public EntranceKind Entrances;public SurroundingKind[] Surroundings;public SupporterSpec Supporters;
    // Open stands carry a row of flag poles along their top (legacy sun terraces and courts).
    public bool FlagPoles;
    // Optional material tones (#rrggbb). Not structural: the fingerprint ignores them.
    public string Steel,RoofTone,ArenaPrimary,ArenaSecondary;
    public StadiumIdentity Clone(){
        var c=(StadiumIdentity)MemberwiseClone();
        c.Stands=Array.ConvertAll(Stands,s=>new StandSpec{Form=s.Form,Rows=s.Rows,Tiers=s.Tiers,HeightOffset=s.HeightOffset,Span=s.Span,Roof=new RoofSpec{Kind=s.Roof.Kind,Coverage=s.Roof.Coverage,Support=s.Roof.Support,Edge=s.Roof.Edge}});
        c.Corners=(CornerForm[])Corners.Clone();c.Landmarks=Array.ConvertAll(Landmarks,l=>new LandmarkSpec{Kind=l.Kind,Place=l.Place});
        c.Floodlights=new FloodlightSpec{Kind=Floodlights.Kind,Count=Floodlights.Count,Head=Floodlights.Head,Height=Floodlights.Height};
        c.Surroundings=(SurroundingKind[])Surroundings.Clone();var s2=Supporters;
        c.Supporters=new SupporterSpec{HomeEnd=s2.HomeEnd,HomeForm=s2.HomeForm,AwayPosition=s2.AwayPosition,AwayWidth=s2.AwayWidth,Banners=s2.Banners,FlagDensity=s2.FlagDensity,Tifo=s2.Tifo,Neutral=s2.Neutral};
        return c;
    }
}

// One fingerprint group: the declared structure of a stadium. Silhouette groups change what a
// match camera sees as shape (stand arrangement, roofs, supports, corners, lights, landmarks).
public struct StadiumFeature {public string Group,Value;public bool Silhouette;public override string ToString()=>Group+"="+Value;}
public static class StadiumFingerprint {
    public static readonly string[] SilhouetteGroups={"stands","asymmetry","roofs","supports","corners","floodlights","landmarks","heights","skyline"};
    public static string Kebab(object value){
        var s=value.ToString();var b=new StringBuilder();
        for(int i=0;i<s.Length;i++){if(char.IsUpper(s[i])&&i>0)b.Append('-');b.Append(char.ToLowerInvariant(s[i]));}
        return b.ToString();
    }
    public static bool IsSilhouette(string group)=>Array.IndexOf(SilhouetteGroups,group)>=0;
    static string Band(float value,float step)=>((int)Math.Floor(value/step+1e-4f)).ToString();
    // Declared structure from the identity alone (no club colours, names, IDs or seeds).
    public static List<StadiumFeature> Declared(StadiumIdentity id){
        var list=new List<StadiumFeature>();void Add(string g,string v)=>list.Add(new StadiumFeature{Group=g,Value=v,Silhouette=IsSilhouette(g)});
        var stands=new List<string>();var roofs=new List<string>();var supports=new List<string>();var open=new List<string>();var standing=new List<string>();
        for(int i=0;i<4;i++){var s=id.Stands[i];
            stands.Add(Kebab(s.Form)+"/"+s.Tiers+"/"+Band(s.Rows,3)+"/"+Band(s.Span,.25f)+"/"+Band(s.HeightOffset,.5f));
            roofs.Add(Kebab(s.Roof.Kind)+(s.Roof.Kind==RoofKind.None?"":"/"+Kebab(s.Roof.Edge)+"/"+Band(s.Roof.Coverage,.34f)));
            supports.Add(s.Roof.Kind==RoofKind.None?"-":Kebab(s.Roof.Support));
            if(s.Roof.Kind==RoofKind.None)open.Add(i.ToString());if(s.Form==StandForm.SingleTerrace||s.Form==StandForm.KopEnd||s.Form==StandForm.OpenBank)standing.Add(i.ToString());}
        Add("stands",string.Join("|",stands));Add("asymmetry","dominant"+id.DominantSide+"/open"+string.Join("",open)+"/standing"+string.Join("",standing));
        Add("roofs",string.Join("|",roofs));Add("supports",string.Join("|",supports));
        Add("corners",string.Join("|",Array.ConvertAll(id.Corners,c=>Kebab(c))));
        var f=id.Floodlights;Add("floodlights",Kebab(f.Kind)+"/"+Kebab(f.Head)+"/"+f.Count+"/"+Band(f.Height,10));
        var marks=Array.ConvertAll(id.Landmarks,l=>Kebab(l.Kind)+"@"+Kebab(l.Place));Array.Sort(marks,StringComparer.Ordinal);Add("landmarks",string.Join("|",marks));
        Add("facade",Kebab(id.Facade)+"/"+(id.Country??""));Add("entrances",Kebab(id.Entrances));
        var near=Array.ConvertAll(id.Surroundings,s=>Kebab(s));Array.Sort(near,StringComparer.Ordinal);Add("surroundings",string.Join("|",near));
        var p=id.Supporters;Add("supporters",p.Neutral?"neutral":"home"+p.HomeEnd+"/"+Kebab(p.HomeForm)+"/"+Kebab(p.AwayPosition)+"/"+Band(p.AwayWidth,.05f)+"/"+Kebab(p.Banners)+"/"+Kebab(p.Tifo));
        return list;
    }
    // Number of groups whose values differ; silhouette counts only shape groups.
    public static int Distance(IList<StadiumFeature> a,IList<StadiumFeature> b,out int silhouette){
        var map=new Dictionary<string,string>(StringComparer.Ordinal);foreach(var f in b)map[f.Group]=f.Value;int d=0;silhouette=0;
        foreach(var f in a){if(map.TryGetValue(f.Group,out var v)&&v==f.Value)continue;d++;if(f.Silhouette)silhouette++;}
        return d;
    }
}

// Pure presentation data. Every Resolve call owns its fields and arrays.
// Side order matches ProbeBridge.standSides: z-, z+, x-, x+.
public sealed class ClubStadiumProfile {
    public string ClubId, DisplayName, Archetype, FacadeMotif;
    public int[] TierCounts;
    public bool[] RoofSides;
    public float StandDepth, MastHeight, RoofOverhang;
    public int DetailSeed;
    public bool CornerBuildings;
    // Venue identifies the actual ground/owner. TemplateId identifies the shared architectural
    // source for a mapped league club; null on unchanged legacy, cup and neutral profiles.
    // Identity.Country is the template architecture country, not the owner country.
    public string Venue, TemplateId;
    public StadiumIdentity Identity;
}

public static class ClubStadiumProfiles {
    // Five authored architectural templates. All 96 live league clubs use a frozen assignment;
    // sharing a template does not imply a new individually authored stadium.
    public static readonly string[] AuthoredClubIds = {"GER-1","GER-2","GER-3","GER-5","GER-6"};
    public static readonly string[] Countries = {"ENG","ESP","ITA","GER","FRA","POR","NED","AUT","BEL","TUR","SUI","GRE"};
    // Declared after the arrays above: static initialisers run in textual order.
    static readonly Dictionary<string, ClubStadiumProfile> catalog = CreateCatalog(true);
    // Release 130 profiles (legacy fields and derived identity, no authored overrides).
    static readonly Dictionary<string, ClubStadiumProfile> legacyCatalog = CreateCatalog(false);
    static readonly Dictionary<string, ClubStadiumProfile> leagueCatalog = CreateLeagueCatalog();

    // Historical 48-entry catalogue inventory, kept stable for legacy consumers.
    // LiveLeagueClubIds is the full league inventory for the presentation path.
    public static string[] KnownClubIds {
        get {
            var ids = new string[catalog.Count];
            catalog.Keys.CopyTo(ids, 0);
            Array.Sort(ids, StringComparer.Ordinal);
            return ids;
        }
    }
    // The 96 league clubs of the twelve-country live world (world-expansion-catalog-v161.js).
    public static string[] LiveLeagueClubIds {
        get {var ids=new List<string>();foreach(var c in Countries)for(int i=1;i<=8;i++)ids.Add(c+"-"+i);ids.Sort(StringComparer.Ordinal);return ids.ToArray();}
    }
    // authored | shared-template | legacy-derived | league-standard | cup-standard
    public static string Coverage(string clubId) {
        if (IsCupId(clubId)) return "cup-standard";
        ClubStadiumProfile p;
        if (clubId != null && leagueCatalog.TryGetValue(clubId, out p)) return p.TemplateId == clubId ? "authored" : "shared-template";
        if (clubId != null && catalog.TryGetValue(clubId, out p)) return p.Identity.Source;
        return "league-standard";
    }
    // Cup-only clubs carry the suffix -C<n>, exactly the page's presentation rule (kind 'cup').
    public static bool IsCupId(string clubId) {
        if (string.IsNullOrEmpty(clubId)) return false;
        int dash = clubId.LastIndexOf('-');
        if (dash < 0 || clubId.Length < dash+3 || clubId[dash+1] != 'C') return false;
        for (int i=dash+2; i<clubId.Length; i++) if (clubId[i] < '0' || clubId[i] > '9') return false;
        return true;
    }
    // Country code of a club ID when it is one of the live countries, else "" (generic facade).
    static string CountryOf(string clubId) {
        if (string.IsNullOrEmpty(clubId)) return "";
        int dash = clubId.IndexOf('-');
        string code = dash > 0 ? clubId.Substring(0, dash) : "";
        return Array.IndexOf(Countries, code) >= 0 ? code : "";
    }

    public static ClubStadiumProfile Resolve(string clubId) {
        ClubStadiumProfile profile;
        if (IsCupId(clubId)) {
            catalog.TryGetValue(clubId, out profile);
            return CupStandard(clubId, CountryOf(clubId), profile?.DisplayName);
        }
        if (clubId != null && leagueCatalog.TryGetValue(clubId, out profile)) return Copy(profile);
        if (clubId != null && catalog.TryGetValue(clubId, out profile)) return Copy(profile);
        // Missing identity and league clubs without a profile get the standard league ground in
        // their country's facade; an unfamiliar identity remains visible for diagnostics. Neither
        // path invents a club or changes saves.
        var id = string.IsNullOrEmpty(clubId) ? "NEUTRAL" : clubId;
        return LeagueStandard(id, CountryOf(clubId));
    }

    // Release 130 stadium for a page without a presentation (absent presentation = Release 130
    // behaviour): the legacy profile with its archetype architecture, the garden ground for an
    // unknown ID; the bridge builds it without supporter blocks.
    public static ClubStadiumProfile ResolveLegacy(string clubId) {
        ClubStadiumProfile profile;
        if (clubId != null && legacyCatalog.TryGetValue(clubId, out profile)) return Copy(profile);
        var id = string.IsNullOrEmpty(clubId) ? "NEUTRAL" : clubId;
        return Plan(id, "Neutral Community Ground", "garden-ground", "timber-rib",
            5, 4, 3, 3, true, false, false, false, 6.5f, 21f, .8f, false);
    }

    // The stadium a fixture is shown in (WorldConfig.presentation; venue 'home' when absent):
    // the home club's ground, the country cup standard for cup clubs, or a neutral final arena.
    public static ClubStadiumProfile ResolveVenue(string homeClubId, string homeKind, string venue, string competition, string venueCountry) {
        if (venue == "neutral") {
            string country = !string.IsNullOrEmpty(venueCountry) ? venueCountry : CountryOf(homeClubId);
            return competition == "europe" ? NeutralEurope() : NeutralCup(country);
        }
        if (homeKind == "cup" && !IsCupId(homeClubId)) return CupStandard(string.IsNullOrEmpty(homeClubId) ? "NEUTRAL" : homeClubId, CountryOf(homeClubId), null);
        return Resolve(homeClubId);
    }

    static ClubStadiumProfile Copy(ClubStadiumProfile p) {
        return new ClubStadiumProfile {
            ClubId=p.ClubId, DisplayName=p.DisplayName, Archetype=p.Archetype, FacadeMotif=p.FacadeMotif,
            TierCounts=(int[])p.TierCounts.Clone(), RoofSides=(bool[])p.RoofSides.Clone(),
            StandDepth=p.StandDepth, MastHeight=p.MastHeight, RoofOverhang=p.RoofOverhang,
            DetailSeed=p.DetailSeed, CornerBuildings=p.CornerBuildings, Venue=p.Venue, TemplateId=p.TemplateId, Identity=p.Identity.Clone()
        };
    }

    // FNV-1a over the ID's UTF-16 code units, with explicit unchecked uint
    // arithmetic: independent of platform GetHashCode, sessions or match RNG.
    public static int Seed(string id) {
        unchecked {
            uint hash = 2166136261u;
            for (int i=0; i<id.Length; i++) { hash ^= id[i]; hash *= 16777619u; }
            return (int)(hash & 0x7fffffffu);
        }
    }

    // Size class from the summed rows: L >= 40, M 28-39, S below 28.
    public static string SizeClassOf(int[] tiers) {
        int sum = 0; foreach (int t in tiers) sum += t;
        return sum >= 40 ? "L" : sum >= 28 ? "M" : "S";
    }

    static ClubStadiumProfile Plan(string id, string name, string archetype, string facade,
        int a, int b, int c, int d, bool ra, bool rb, bool rc, bool rd,
        float depth, float mast, float overhang, bool corners) {
        var p = new ClubStadiumProfile {
            ClubId=id, DisplayName=name, Archetype=archetype, FacadeMotif=facade,
            TierCounts=new[] {a,b,c,d}, RoofSides=new[] {ra,rb,rc,rd},
            StandDepth=depth, MastHeight=mast, RoofOverhang=overhang,
            DetailSeed=Seed(id), CornerBuildings=corners, Venue=id
        };
        p.Identity = DeriveIdentity(p);
        return p;
    }
    // An authored identity replaces the derived one; roofed sides follow the authored roofs.
    static ClubStadiumProfile Authored(ClubStadiumProfile p, StadiumIdentity identity) {
        identity.Source = "authored"; p.Identity = identity;
        for (int i=0; i<4; i++) p.RoofSides[i] = identity.Stands[i].Roof.Kind != RoofKind.None;
        return p;
    }

    // ---- Authoring helpers --------------------------------------------------------------
    static RoofSpec R(RoofKind kind, float coverage=1, RoofSupport support=RoofSupport.Columns, RoofEdge edge=RoofEdge.Straight) =>
        new RoofSpec {Kind=kind, Coverage=kind==RoofKind.None?0:coverage, Support=support, Edge=edge};
    // A property, not a field: the catalogue is built during static initialisation.
    static RoofSpec Open => new RoofSpec {Kind=RoofKind.None};
    static StandSpec S(StandForm form, int rows, int tiers, RoofSpec roof, float offset=0, float span=1) =>
        new StandSpec {Form=form, Rows=rows, Tiers=tiers, HeightOffset=offset, Span=span, Roof=new RoofSpec {Kind=roof.Kind, Coverage=roof.Coverage, Support=roof.Support, Edge=roof.Edge}};
    static LandmarkSpec L(LandmarkKind kind, LandmarkPlace place) => new LandmarkSpec {Kind=kind, Place=place};
    static FloodlightSpec Lights(FloodlightKind kind, int count, LampHead head, float height) => new FloodlightSpec {Kind=kind, Count=count, Head=head, Height=height};
    static SupporterSpec Fans(int homeEnd, HomeBlockForm home, AwayBlockPosition away, float awayWidth, BannerStyle banners, float flags, TifoStyle tifo) =>
        new SupporterSpec {HomeEnd=homeEnd, HomeForm=home, AwayPosition=away, AwayWidth=awayWidth, Banners=banners, FlagDensity=flags, Tifo=tifo};
    static CornerForm[] Corners(CornerForm farLeft, CornerForm farRight, CornerForm nearLeft, CornerForm nearRight) => new[] {farLeft, farRight, nearLeft, nearRight};

    // ---- Legacy derivation ----------------------------------------------------------------
    // Clubs not yet individually authored keep their archetype architecture through an identity
    // derived from the legacy fields (Release 130 choices). Reported as legacy-derived.
    public static StadiumIdentity DeriveIdentity(ClubStadiumProfile p) {
        var rows = p.TierCounts; int main = 0; for (int i=1; i<4; i++) if (rows[i] > rows[main]) main = i;
        string a = p.Archetype ?? "", motif = p.FacadeMotif ?? "";
        bool ring = a == "modern-ring", banks = a == "garden-ground" || a == "hillside-ground";
        var stands = new StandSpec[4];
        for (int i=0; i<4; i++) {
            bool roof = p.RoofSides != null && p.RoofSides.Length == 4 && p.RoofSides[i];
            var kind = a == "modern-ring" || a == "hillside-ground" && i == main ? RoofKind.Cantilever : a == "industrial-shed" ? RoofKind.Gable
                : a == "dockside-ground" ? (i == main ? RoofKind.TrussGirder : RoofKind.Gable) : a == "garden-ground" ? RoofKind.Gable : a == "sun-terraces" ? RoofKind.Sail : RoofKind.Flat;
            var support = kind == RoofKind.Cantilever ? RoofSupport.MastCable : kind == RoofKind.Flat ? RoofSupport.Cantilever : RoofSupport.Columns;
            var form = banks && i != main && !roof ? StandForm.OpenBank : ring && rows[i] >= 11 ? StandForm.TwoTier : StandForm.SeatedSingle;
            stands[i] = S(form, rows[i], form == StandForm.TwoTier ? 2 : 1, roof ? R(kind, 1, support) : Open, 0, a == "garden-ground" && i == main ? .56f : 1);
        }
        var curve = a == "civic-bowl" || ring ? CornerForm.Curved : CornerForm.Open;
        var lights = a == "modern-ring" || a == "urban-court" ? FloodlightKind.RoofRail : banks ? FloodlightKind.SidePoles : FloodlightKind.CornerMasts;
        var near = a == "modern-ring" || a == "urban-court" || a == "civic-bowl" ? SurroundingKind.UrbanBlocks : a == "industrial-shed" ? SurroundingKind.Industry
            : a == "dockside-ground" ? SurroundingKind.Harbour : a == "garden-ground" ? SurroundingKind.Park : a == "sun-terraces" ? SurroundingKind.Coast : SurroundingKind.Hills;
        int homeEnd = rows[3] > rows[2] ? 3 : 2;
        return new StadiumIdentity {
            Source="legacy-derived", Country=CountryOf(p.ClubId), SizeClass=SizeClassOf(rows), Stands=stands,
            Corners=Corners(curve, curve, curve, curve), DominantSide=main, Asymmetry="legacy "+a+": deepest side "+main,
            Facade=MotifMaterial(motif), Regional=CountryOf(p.ClubId)+": legacy "+motif, Landmarks=new LandmarkSpec[0],
            Floodlights=Lights(lights, lights==FloodlightKind.SidePoles?6:4, LampHead.Square, p.MastHeight), Entrances=EntranceKind.Plain,
            Surroundings=a == "hillside-ground" ? new[] {SurroundingKind.Hills, SurroundingKind.Forest} : new[] {near},
            // Visitors in the far corner of the other end (left of x-, right of x+ as seen from the
            // pitch): the follow camera shows far corners, rarely near ones.
            Supporters=Fans(homeEnd, HomeBlockForm.FullEnd, homeEnd == 3 ? AwayBlockPosition.CornerLeft : AwayBlockPosition.CornerRight, .25f, BannerStyle.Fence, .6f, TifoStyle.Mosaic),
            FlagPoles = a == "sun-terraces" || a == "urban-court"
        };
    }
    public static FacadeMaterial MotifMaterial(string motif) {
        motif = motif ?? "";
        return motif.Contains("brick") ? FacadeMaterial.Brick : motif.Contains("colonnade") || motif.Contains("stone") ? FacadeMaterial.Stone : motif.Contains("tiled") ? FacadeMaterial.Tile
            : motif.Contains("timber") ? FacadeMaterial.Timber : motif.Contains("limestone") || motif.Contains("step") ? FacadeMaterial.Limestone : motif.Contains("slat") || motif.Contains("harbor") ? FacadeMaterial.Slat
            : motif.Contains("fins") || motif.Contains("truss") || motif.Contains("metal") ? FacadeMaterial.SteelFin : FacadeMaterial.Concrete;
    }

    // ---- Standard and neutral venues -------------------------------------------------------
    // Country facade variant (material, legacy motif word and national arena colours).
    static (FacadeMaterial material, string motif, SurroundingKind local, string primary, string secondary) CountryStyle(string country) {
        switch (country) {
            case "ENG": return (FacadeMaterial.Brick, "brick-arcade", SurroundingKind.TerracedHouses, "#f2f2f2", "#1d3c78");
            case "ESP": return (FacadeMaterial.Stone, "stone-colonnade", SurroundingKind.UrbanBlocks, "#c0262d", "#f1bf00");
            case "ITA": return (FacadeMaterial.Limestone, "limestone-step", SurroundingKind.UrbanBlocks, "#1f5fbf", "#f2f2f2");
            case "GER": return (FacadeMaterial.Timber, "timber-rib", SurroundingKind.Park, "#f2f2f2", "#1d2329");
            case "FRA": return (FacadeMaterial.Stone, "stone-colonnade", SurroundingKind.UrbanBlocks, "#1f3a8a", "#f2f2f2");
            case "POR": return (FacadeMaterial.Tile, "tiled-parapet", SurroundingKind.UrbanBlocks, "#b5232e", "#1f6b3a");
            case "NED": return (FacadeMaterial.Brick, "brick-arcade", SurroundingKind.River, "#e66a1f", "#f2f2f2");
            case "AUT": return (FacadeMaterial.Timber, "timber-rib", SurroundingKind.Mountains, "#c8102e", "#f2f2f2");
            case "BEL": return (FacadeMaterial.Brick, "brick-arcade", SurroundingKind.TerracedHouses, "#c8102e", "#1d2329");
            case "TUR": return (FacadeMaterial.Concrete, "concrete-frame", SurroundingKind.UrbanBlocks, "#c8102e", "#f2f2f2");
            case "SUI": return (FacadeMaterial.Concrete, "concrete-frame", SurroundingKind.Mountains, "#d52b1e", "#f2f2f2");
            case "GRE": return (FacadeMaterial.Stone, "stone-colonnade", SurroundingKind.Hills, "#0d5eaf", "#f2f2f2");
            default: return (FacadeMaterial.Concrete, "concrete-frame", SurroundingKind.UrbanBlocks, "#2b3a55", "#d8dde3");
        }
    }
    static ClubStadiumProfile Standard(string clubId, string venue, string name, string archetype, string motif, int[] rows, float depth, float mast, float overhang, StadiumIdentity identity) {
        identity.Source = "standard";
        var p = new ClubStadiumProfile {ClubId=clubId, DisplayName=name, Archetype=archetype, FacadeMotif=motif, TierCounts=rows, RoofSides=new bool[4],
            StandDepth=depth, MastHeight=mast, RoofOverhang=overhang, DetailSeed=Seed(venue), CornerBuildings=false, Venue=venue, Identity=identity};
        for (int i=0; i<4; i++) p.RoofSides[i] = identity.Stands[i].Roof.Kind != RoofKind.None;
        return p;
    }
    // One compact cup ground per country: covered main stand, three open terraces, side poles.
    public static ClubStadiumProfile CupStandard(string clubId, string country, string displayName) {
        var style = CountryStyle(country); string venue = "CUP-STANDARD" + (country == "" ? "" : "-" + country);
        var rows = new[] {6,4,4,4};
        return Standard(clubId, venue, displayName ?? ("Standard cup ground " + country).Trim(), "garden-ground", style.motif, rows, 6.4f, 22f, 1.2f, new StadiumIdentity {
            Country=country, SizeClass=SizeClassOf(rows), DominantSide=0, Asymmetry="one covered main stand on the halfway line, three low open terraces",
            Stands=new[] {S(StandForm.MainStand,6,1,R(RoofKind.Cantilever,1,RoofSupport.Cantilever),.4f,.7f), S(StandForm.SingleTerrace,4,1,Open), S(StandForm.SingleTerrace,4,1,Open), S(StandForm.SingleTerrace,4,1,Open)},
            Corners=Corners(CornerForm.Open,CornerForm.Open,CornerForm.Open,CornerForm.Open), Facade=style.material, Regional=country+": standard cup facade",
            Landmarks=new[] {L(LandmarkKind.ScoreboardTower,LandmarkPlace.Corner)}, Floodlights=Lights(FloodlightKind.SidePoles,6,LampHead.Square,22),
            Entrances=EntranceKind.TurnstileBlock, Surroundings=new[] {SurroundingKind.Park, style.local},
            Supporters=Fans(2,HomeBlockForm.CentralBlock,AwayBlockPosition.CornerRight,.3f,BannerStyle.Fence,.5f,TifoStyle.None)});
    }
    // Medium ground for league clubs without an individual profile (reported as non-individual).
    public static ClubStadiumProfile LeagueStandard(string clubId, string country) {
        var style = CountryStyle(country); string venue = "LEAGUE-STANDARD" + (country == "" ? "" : "-" + country);
        var rows = new[] {9,8,7,7};
        return Standard(clubId, venue, ("Standard league ground " + country).Trim(), "civic-bowl", style.motif, rows, 10.5f, 28f, 2f, new StadiumIdentity {
            Country=country, SizeClass=SizeClassOf(rows), DominantSide=0, Asymmetry="raised main stand, covered home terrace, open away end",
            Stands=new[] {S(StandForm.MainStand,9,1,R(RoofKind.Flat,1,RoofSupport.Columns),.8f), S(StandForm.SeatedSingle,8,1,R(RoofKind.Cantilever,.9f,RoofSupport.Cantilever)), S(StandForm.SingleTerrace,7,1,R(RoofKind.Flat,.7f,RoofSupport.Columns)), S(StandForm.SeatedSingle,7,1,Open)},
            Corners=Corners(CornerForm.Filled,CornerForm.Filled,CornerForm.Open,CornerForm.Open), Facade=style.material, Regional=country+": standard league facade",
            Landmarks=new LandmarkSpec[0], Floodlights=Lights(FloodlightKind.CornerMasts,4,LampHead.Square,30), Entrances=EntranceKind.GrandGate,
            Surroundings=new[] {SurroundingKind.UrbanBlocks, style.local}, Supporters=Fans(2,HomeBlockForm.FullEnd,AwayBlockPosition.CornerRight,.25f,BannerStyle.Fence,.6f,TifoStyle.Mosaic)});
    }
    // European final arena: three-tier bowl under one roof hung from a great arch; always night.
    public static ClubStadiumProfile NeutralEurope() {
        var rows = new[] {14,13,13,13};
        var p = Standard("NEUTRAL-EUROPE", "NEUTRAL-EUROPE", "European Final Arena", "modern-ring", "metal-fins", rows, 18.5f, 38f, 4f, new StadiumIdentity {
            Country="", SizeClass=SizeClassOf(rows), DominantSide=0, Asymmetry="symmetric closed bowl; the arch rises over the far stand",
            Stands=new[] {S(StandForm.MainStand,14,3,R(RoofKind.ArchSuspended,1,RoofSupport.Arch,RoofEdge.Curved),1f), S(StandForm.ThreeTier,13,3,R(RoofKind.Cantilever,1,RoofSupport.Cantilever,RoofEdge.Curved)),
                S(StandForm.ThreeTier,13,3,R(RoofKind.Cantilever,1,RoofSupport.Cantilever,RoofEdge.Curved)), S(StandForm.ThreeTier,13,3,R(RoofKind.Cantilever,1,RoofSupport.Cantilever,RoofEdge.Curved))},
            Corners=Corners(CornerForm.Curved,CornerForm.Curved,CornerForm.Curved,CornerForm.Curved), Facade=FacadeMaterial.SteelFin, Regional="neutral: lit steel fins",
            Landmarks=new[] {L(LandmarkKind.Arch,LandmarkPlace.MainStand), L(LandmarkKind.TvTower,LandmarkPlace.EndRight)}, Floodlights=Lights(FloodlightKind.RoofRail,4,LampHead.Bar,0),
            Entrances=EntranceKind.RampTowers, Surroundings=new[] {SurroundingKind.UrbanBlocks, SurroundingKind.River},
            Supporters=new SupporterSpec {HomeEnd=2, HomeForm=HomeBlockForm.LowerTier, AwayPosition=AwayBlockPosition.UpperTier, AwayWidth=.3f, Banners=BannerStyle.Drop, FlagDensity=.9f, Tifo=TifoStyle.None, Neutral=true},
            ArenaPrimary="#1b2a49", ArenaSecondary="#c9d1d9", RoofTone="#e8ebef", Steel="#dfe3e8"});
        return p;
    }
    // National cup final ground: two-tier bowl with a mast-hung roof in the country's facade and colours.
    public static ClubStadiumProfile NeutralCup(string country) {
        var style = CountryStyle(country); var rows = new[] {12,11,11,11}; string venue = "NEUTRAL-CUP" + (country == "" ? "" : "-" + country);
        return Standard(venue, venue, ("National cup final ground " + country).Trim(), "civic-bowl", style.motif, rows, 15.5f, 34f, 3f, new StadiumIdentity {
            Country=country, SizeClass=SizeClassOf(rows), DominantSide=0, Asymmetry="symmetric two-tier bowl, mast-hung roof",
            Stands=new[] {S(StandForm.MainStand,12,2,R(RoofKind.Cantilever,1,RoofSupport.MastCable),1f), S(StandForm.TwoTier,11,2,R(RoofKind.Cantilever,1,RoofSupport.MastCable)),
                S(StandForm.TwoTier,11,2,R(RoofKind.Cantilever,1,RoofSupport.MastCable)), S(StandForm.TwoTier,11,2,R(RoofKind.Cantilever,1,RoofSupport.MastCable))},
            Corners=Corners(CornerForm.Curved,CornerForm.Curved,CornerForm.Curved,CornerForm.Curved), Facade=style.material, Regional=country+": national cup facade",
            Landmarks=new LandmarkSpec[0], Floodlights=Lights(FloodlightKind.CornerMasts,4,LampHead.Ring,36), Entrances=EntranceKind.GrandGate,
            Surroundings=new[] {SurroundingKind.UrbanBlocks, style.local},
            Supporters=new SupporterSpec {HomeEnd=2, HomeForm=HomeBlockForm.LowerTier, AwayPosition=AwayBlockPosition.UpperTier, AwayWidth=.3f, Banners=BannerStyle.Fence, FlagDensity=.85f, Tifo=TifoStyle.None, Neutral=true},
            ArenaPrimary=style.primary, ArenaSecondary=style.secondary});
    }

    // Frozen editorial table from docs/stadion-zuordnung-geplant.json (13 October 2026).
    // No catalogue fan values, match results, seasons, budgets or random generators are read.
    // Only the owner label and venue change: geometry, environment, supporter layout and
    // DetailSeed remain exact copies of the selected template, including its GER country.
    static Dictionary<string, ClubStadiumProfile> CreateLeagueCatalog() {
        var result = new Dictionary<string, ClubStadiumProfile>(StringComparer.Ordinal);
        void Add(string clubId, string clubName, string templateId) {
            var p = Copy(catalog[templateId]);
            p.ClubId = clubId; p.DisplayName = clubName; p.Venue = clubId; p.TemplateId = templateId;
            result.Add(clubId, p);
        }
        Add("AUT-1", "Wiener SC Kronau", "GER-2");
        Add("AUT-2", "FC Salzburg Falken", "GER-5");
        Add("AUT-3", "Schwarz Weiß Graz", "GER-3");
        Add("AUT-4", "Linzer SC Union", "GER-5");
        Add("AUT-5", "Innsbruck Sport", "GER-5");
        Add("AUT-6", "SC Klagenfurt Seestadt", "GER-6");
        Add("AUT-7", "SV St. Pölten Westpark", "GER-6");
        Add("AUT-8", "Wiener SC Fortuna", "GER-6");
        Add("BEL-1", "Brugge Reie FC", "GER-2");
        Add("BEL-2", "Bruxelles Senne Union", "GER-1");
        Add("BEL-3", "Antwerpen Schelde FC", "GER-5");
        Add("BEL-4", "Gent Leie FC", "GER-5");
        Add("BEL-5", "Liège Meuse FC", "GER-3");
        Add("BEL-6", "Genk Kempen FC", "GER-6");
        Add("BEL-7", "Charleroi Sambre FC", "GER-6");
        Add("BEL-8", "Bruxelles Parc FC", "GER-6");
        Add("ENG-1", "Regent Vale FC", "GER-1");
        Add("ENG-2", "Irwell FC", "GER-2");
        Add("ENG-3", "Mersey Dock FC", "GER-3");
        Add("ENG-4", "Birmingham Works FC", "GER-5");
        Add("ENG-5", "Bristol Quay FC", "GER-6");
        Add("ENG-6", "Wandle Town", "GER-6");
        Add("ENG-7", "Leeds Aire FC", "GER-2");
        Add("ENG-8", "Newcastle Tyne FC", "GER-3");
        Add("ESP-1", "Madrid Central CF", "GER-1");
        Add("ESP-2", "Barcelona Mar FC", "GER-1");
        Add("ESP-3", "Turia CF", "GER-5");
        Add("ESP-4", "Sevilla Union FC", "GER-2");
        Add("ESP-5", "Barcelona Delta FC", "GER-6");
        Add("ESP-6", "Vigo Atlantic FC", "GER-6");
        Add("ESP-7", "Bilbao Nervión CF", "GER-5");
        Add("ESP-8", "Zaragoza Ebro CF", "GER-5");
        Add("FRA-1", "Paris Central FC", "GER-1");
        Add("FRA-2", "Marseille Union", "GER-1");
        Add("FRA-3", "Lyon Rive FC", "GER-5");
        Add("FRA-4", "Bordeaux Atlantic FC", "GER-2");
        Add("FRA-5", "Lille Union", "GER-5");
        Add("FRA-6", "Paris Valmy FC", "GER-6");
        Add("FRA-7", "Nantes Loire FC", "GER-6");
        Add("FRA-8", "Strasbourg Rives FC", "GER-5");
        Add("GER-1", "FC München Isar", "GER-1");
        Add("GER-2", "FC Bremen Weser", "GER-2");
        Add("GER-3", "FC Hamburg Elbe", "GER-3");
        Add("GER-4", "SC Freiburg Tal", "GER-6");
        Add("GER-5", "FC Köln Rhein", "GER-5");
        Add("GER-6", "SV München Au", "GER-6");
        Add("GER-7", "FC Dortmund Emscher", "GER-1");
        Add("GER-8", "FC Frankfurt Mainbogen", "GER-5");
        Add("GRE-1", "Athina Helios FC", "GER-1");
        Add("GRE-2", "Piräus Nautilos FC", "GER-2");
        Add("GRE-3", "Thessaloniki Vardaris FC", "GER-3");
        Add("GRE-4", "Athina Kallisto FC", "GER-5");
        Add("GRE-5", "Thessaloniki Therma FC", "GER-6");
        Add("GRE-6", "Patras Achaia FC", "GER-6");
        Add("GRE-7", "Iraklio Candia FC", "GER-6");
        Add("GRE-8", "Volos Pelion FC", "GER-6");
        Add("ITA-1", "Torino Centrale FC", "GER-1");
        Add("ITA-2", "Milano Ferro FC", "GER-2");
        Add("ITA-3", "Roma Capitol FC", "GER-1");
        Add("ITA-4", "Bologna Collina AC", "GER-6");
        Add("ITA-5", "Navigli FC", "GER-6");
        Add("ITA-6", "Napoli Sud AC", "GER-3");
        Add("ITA-7", "Firenze Arno AC", "GER-5");
        Add("ITA-8", "Genova Lanterna FC", "GER-5");
        Add("NED-1", "Amsterdam Amstel FC", "GER-1");
        Add("NED-2", "Rotterdam Maaspoort FC", "GER-2");
        Add("NED-3", "Eindhoven Lichtstad FC", "GER-5");
        Add("NED-4", "Utrecht Singel FC", "GER-5");
        Add("NED-5", "Enschede Veld FC", "GER-3");
        Add("NED-6", "Arnhem Rijnpark FC", "GER-6");
        Add("NED-7", "Groningen Noorderpoort FC", "GER-5");
        Add("NED-8", "Amsterdam Westhaven FC", "GER-6");
        Add("POR-1", "Lisboa Central FC", "GER-1");
        Add("POR-2", "Porto Ribeira FC", "GER-2");
        Add("POR-3", "Tejo Union", "GER-3");
        Add("POR-4", "Braga Norte FC", "GER-5");
        Add("POR-5", "Coimbra Athletic", "GER-6");
        Add("POR-6", "Aveiro Costa FC", "GER-6");
        Add("POR-7", "Guimarães Castelo FC", "GER-2");
        Add("POR-8", "Setúbal Sado FC", "GER-6");
        Add("SUI-1", "Basel Rheintor FC", "GER-2");
        Add("SUI-2", "Bern Aarebogen FC", "GER-5");
        Add("SUI-3", "Zürich Limmat FC", "GER-3");
        Add("SUI-4", "Genève Rhône FC", "GER-5");
        Add("SUI-5", "St. Gallen Sitter FC", "GER-2");
        Add("SUI-6", "Lausanne Léman FC", "GER-6");
        Add("SUI-7", "Luzern Reuss FC", "GER-6");
        Add("SUI-8", "Zürich Sihl FC", "GER-6");
        Add("TUR-1", "Istanbul Bosporus SK", "GER-1");
        Add("TUR-2", "Istanbul Haliç SK", "GER-2");
        Add("TUR-3", "Istanbul Marmara SK", "GER-5");
        Add("TUR-4", "Trabzon Karadeniz SK", "GER-3");
        Add("TUR-5", "Ankara Kale SK", "GER-5");
        Add("TUR-6", "Izmir Körfez SK", "GER-2");
        Add("TUR-7", "Bursa Yeşilova SK", "GER-6");
        Add("TUR-8", "Antalya Kıyı SK", "GER-6");
        return result;
    }

    static Dictionary<string, ClubStadiumProfile> CreateCatalog(bool authored) {
        ClubStadiumProfile A(ClubStadiumProfile p, StadiumIdentity identity) => authored ? Authored(p, identity) : p;
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
            A(Plan("GER-1", "Isar Light Arena", "modern-ring", "metal-fins", 14,12,12,11, true,true,true,true, 18f,35f,4f,true), new StadiumIdentity {
                Country="GER", SizeClass="L", DominantSide=0, Asymmetry="closed steep bowl: a three-tier main stand with two glass bands over three two-tier stands, one ring roof",
                Stands=new[] {S(StandForm.MainStand,14,3,R(RoofKind.Cantilever,1,RoofSupport.Cantilever,RoofEdge.Curved),.8f), S(StandForm.TwoTier,12,2,R(RoofKind.Cantilever,1,RoofSupport.Cantilever,RoofEdge.Curved)),
                    S(StandForm.TwoTier,12,2,R(RoofKind.Cantilever,1,RoofSupport.Cantilever,RoofEdge.Curved)), S(StandForm.TwoTier,11,2,R(RoofKind.Cantilever,1,RoofSupport.Cantilever,RoofEdge.Curved))},
                Corners=Corners(CornerForm.Curved,CornerForm.Curved,CornerForm.Curved,CornerForm.Curved), Facade=FacadeMaterial.SteelFin, Regional="GER: luminous cushion panels between vertical fins",
                Landmarks=new[] {L(LandmarkKind.TvTower,LandmarkPlace.FarLeft), L(LandmarkKind.HillBackdrop,LandmarkPlace.EndRight)}, Floodlights=Lights(FloodlightKind.RoofRail,4,LampHead.Bar,0),
                Entrances=EntranceKind.RampTowers, Surroundings=new[] {SurroundingKind.Park, SurroundingKind.Mountains},
                Supporters=Fans(3,HomeBlockForm.LowerTier,AwayBlockPosition.UpperTier,.26f,BannerStyle.Drop,.9f,TifoStyle.Mosaic), RoofTone="#eef0f2", Steel="#d6dbe1"}),
            A(Plan("GER-2", "Weser Dock Park", "dockside-ground", "steel-truss", 11,10,9,8, true,true,true,false, 13.6f,31f,2.6f,false), new StadiumIdentity {
                Country="GER", SizeClass="M", DominantSide=0, Asymmetry="riverside bowl closed only on the far side: barrel-roofed long stands, a steep open kop on the right",
                Stands=new[] {S(StandForm.TwoTier,11,2,R(RoofKind.Barrel,1,RoofSupport.Truss,RoofEdge.Curved),.4f), S(StandForm.SeatedSingle,10,1,R(RoofKind.Barrel,1,RoofSupport.Truss,RoofEdge.Curved)),
                    S(StandForm.SeatedSingle,9,1,R(RoofKind.Cantilever,.8f,RoofSupport.Cantilever)), S(StandForm.KopEnd,8,1,Open)},
                Corners=Corners(CornerForm.Curved,CornerForm.Curved,CornerForm.Open,CornerForm.Open), Facade=FacadeMaterial.Brick, Regional="GER: hanseatic brick under a solar roof",
                Landmarks=new[] {L(LandmarkKind.Windmill,LandmarkPlace.FarLeft), L(LandmarkKind.RiverQuay,LandmarkPlace.EndRight)}, Floodlights=Lights(FloodlightKind.CornerMasts,4,LampHead.Square,44),
                Entrances=EntranceKind.GrandGate, Surroundings=new[] {SurroundingKind.River, SurroundingKind.TerracedHouses},
                Supporters=Fans(3,HomeBlockForm.FullEnd,AwayBlockPosition.CornerLeft,.22f,BannerStyle.Fence,1f,TifoStyle.Mosaic), RoofTone="#3d4b57", Steel="#2f6a4b"}),
            A(Plan("GER-3", "Elbe Shipyard Stadium", "industrial-shed", "harbor-slat", 12,10,8,9, true,true,false,true, 14.2f,33f,2.7f,true), new StadiumIdentity {
                Country="GER", SizeClass="M", DominantSide=0, Asymmetry="shipyard sheds: a raised main stand under a saw-tooth roof on a heavy truss, open standing end, four open corners",
                Stands=new[] {S(StandForm.MainStand,12,1,R(RoofKind.Sawtooth,1,RoofSupport.Columns,RoofEdge.Saw),1.2f), S(StandForm.SeatedSingle,10,1,R(RoofKind.Gable,1,RoofSupport.Columns)),
                    S(StandForm.SingleTerrace,8,1,Open), S(StandForm.SeatedSingle,9,1,R(RoofKind.Sawtooth,.85f,RoofSupport.Truss,RoofEdge.Saw))},
                Corners=Corners(CornerForm.Open,CornerForm.Open,CornerForm.Open,CornerForm.Open), Facade=FacadeMaterial.Slat, Regional="GER: corrugated shipyard cladding on a brick plinth",
                Landmarks=new[] {L(LandmarkKind.GantryCrane,LandmarkPlace.EndRight), L(LandmarkKind.Crane,LandmarkPlace.FarLeft), L(LandmarkKind.Spire,LandmarkPlace.FarRight)}, Floodlights=Lights(FloodlightKind.LatticePylons,4,LampHead.Bar,36),
                Entrances=EntranceKind.TurnstileBlock, Surroundings=new[] {SurroundingKind.Harbour, SurroundingKind.Industry},
                Supporters=Fans(2,HomeBlockForm.FullEnd,AwayBlockPosition.EndSegment,.3f,BannerStyle.Long,.85f,TifoStyle.Mosaic), RoofTone="#55606a", Steel="#2c4f86"}),
            Plan("GER-4", "Tal Forest Ground", "hillside-ground", "timber-rib", 9,6,6,5, true,false,true,true, 9.8f,26f,1.8f,false),
            A(Plan("GER-5", "Rhein Civic Park", "civic-bowl", "brick-arcade", 9,8,7,6, true,true,false,false, 10.6f,28f,2.2f,true), new StadiumIdentity {
                Country="GER", SizeClass="M", DominantSide=0, Asymmetry="four separate stands hung from four lit corner towers; raised brick-arcade main stand",
                Stands=new[] {S(StandForm.MainStand,9,1,R(RoofKind.TrussGirder,1,RoofSupport.MastCable),1.4f), S(StandForm.SeatedSingle,8,1,R(RoofKind.TrussGirder,1,RoofSupport.MastCable)),
                    S(StandForm.SingleTerrace,7,1,R(RoofKind.TrussGirder,.9f,RoofSupport.MastCable)), S(StandForm.SeatedSingle,6,1,R(RoofKind.TrussGirder,.9f,RoofSupport.MastCable))},
                Corners=Corners(CornerForm.Tower,CornerForm.Tower,CornerForm.Tower,CornerForm.Tower), Facade=FacadeMaterial.Brick, Regional="GER: Rhineland brick arcades",
                Landmarks=new[] {L(LandmarkKind.TwinSpires,LandmarkPlace.FarCentre), L(LandmarkKind.Arch,LandmarkPlace.EndRight)}, Floodlights=Lights(FloodlightKind.CornerMasts,4,LampHead.Square,30),
                Entrances=EntranceKind.GrandGate, Surroundings=new[] {SurroundingKind.UrbanBlocks, SurroundingKind.River},
                Supporters=Fans(2,HomeBlockForm.FullEnd,AwayBlockPosition.CornerRight,.28f,BannerStyle.Fence,.8f,TifoStyle.Mosaic), RoofTone="#4a5560", Steel="#9aa3ab"}),
            A(Plan("GER-6", "Au Meadow Court", "urban-court", "timber-rib", 6,5,4,4, true,false,true,false, 7f,22f,.9f,true), new StadiumIdentity {
                Country="GER", SizeClass="S", DominantSide=0, Asymmetry="short gabled timber main stand on the halfway line, covered home terrace, open terraces hemmed in by houses",
                Stands=new[] {S(StandForm.MainStand,6,1,R(RoofKind.Gable,1,RoofSupport.Columns),.6f,.72f), S(StandForm.SingleTerrace,5,1,Open),
                    S(StandForm.SingleTerrace,4,1,R(RoofKind.Flat,.75f,RoofSupport.Columns)), S(StandForm.SingleTerrace,4,1,Open)},
                Corners=Corners(CornerForm.Open,CornerForm.Open,CornerForm.Open,CornerForm.Open), Facade=FacadeMaterial.Timber, Regional="GER: dark timber boarding and white plaster",
                Landmarks=new[] {L(LandmarkKind.Spire,LandmarkPlace.FarRight), L(LandmarkKind.ScoreboardTower,LandmarkPlace.Corner), L(LandmarkKind.ClockTower,LandmarkPlace.MainStand)}, Floodlights=Lights(FloodlightKind.LatticePylons,4,LampHead.Square,30),
                Entrances=EntranceKind.TurnstileBlock, Surroundings=new[] {SurroundingKind.UrbanBlocks},
                Supporters=Fans(2,HomeBlockForm.FullEnd,AwayBlockPosition.CornerRight,.3f,BannerStyle.Fence,.7f,TifoStyle.Scarves), RoofTone="#5b4636", Steel="#33363a"}),
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

# 3D-Qualität: Zuständigkeiten und abgeschlossene erste Iteration

Start: 9. Oktober 2026 auf Nutzerauftrag. Basis `e630ebc` (Release 114), Branch `codex/3d-quality-stadiums-20261009`. Alle Arbeiten nur im Worktree `work/3d-quality-stadiums`, keine Änderungen am veralteten Hauptcheckout oder `freekickdemo/`. Neue lokale Assets und Lösungen sind erlaubt, wenn der Bestand die Qualität begrenzt. Der ursprüngliche Umsetzungsauftrag umfasste keine Veröffentlichung oder externen Dienste; der spätere Nutzerauftrag „Veröffentliche“ führte zur [Veröffentlichung als Release 115](../release-115.md).

## Zuständigkeiten

- Integrator: gemeinsame Produkt-/Entwicklungsdokumentation, JS-Simulations-/Karriere-/Brückenpfade, Browserprüfung und Gesamtannahme.
- Unity/3D (Claude): bestehende C#-Produktdateien, Unity-Renderer, Stadionanbindung, Animation/Präsentation sowie einziger Unity-Editor-/Sync-/Buildbesitzer. Nicht `ClubStadiumProfiles.cs`, `ClubStadiumProfilesTests.cs` oder Auditdateien bearbeiten.
- Stadien: ausschließlich `prototypes/match-engine-unity/ClubStadiumProfiles.cs`, `ClubStadiumProfilesTests.cs`, `docs/platform/club-stadiums.md` und eigene Kandidaten unter `outputs/3d-quality/stadiums/`. Kein Editor-/Buildzugriff.
- A02-Animationsaudit: ausschließlich `work/platform/animation/quality-audit.cjs`, `docs/platform/animation-quality-audit.md` und `outputs/3d-quality/animation-audit/`. Produktcode lesen, keine Änderungen an C#/JS-Renderer oder Masterclips; kein Editor-/Buildzugriff.

Höchstens vier Instanzen inklusive Integrator. Nach Auditabschluss wird dessen Slot für den Account-Vorlauf frei. Gemeinsame Integration und Geräte-Messungen seriell, unabhängige Endprüfung nach Übergabe in freiem Slot.

Profile und A02-Quellbaseline sind abgeschlossen. Der Stadionagent übernimmt nach seiner Übergabe den reinen C01/C02-Vertragsvorlauf in `docs/platform/account-contract.md`, `admin-statistics-contract.md` und optional `account-preflight.md`; keine weitere Profiländerung und keine gemeinsame Auth-/Router-/Produktanbindung. Eine neue unabhängige Instanz hat die JS-Grätschenprojektion ohne konkrete Befunde geprüft. Die sichtbare Unity-Abnahme folgt nach der Rendererübergabe.

Claude musste am API-Nutzungslimit stoppen. Die Quelländerungen blieben erhalten; anschließend übernahm der Codex-Agent `unity_completion` die Unity-Produktdateien und exklusiv den Editor-/Sync-/Buildweg. Kompilierung, Tests, Rendernachweise und Kandidatenbuild sind abgeschlossen, Quellenkennung `959aea1e…128b93`. JS-Brücke, finale C#-Quellen und Account-Verträge wurden unabhängig geprüft; keine offenen Codebefunde. Die laufende WebGL-Abnahme des Integrators bestand ebenfalls. [Gesamtnachweis und Restarbeit](3d-quality-validation.md). Es laufen keine konkurrierenden Unity-Aufträge.

## Priorisierte A02-Übergabe

Der eingefrorene [Animationsaudit](animation-quality-audit.md) bestätigt 34 tatsächliche Originalclips, 28 Gelenke, zwei Pilotclips und 27 Unity-Katalogclips. Quellenanbindung und sichtbare Qualität sind getrennte Belege. Reihenfolge: `slide`/`slideRecovery` im Unity-Rig; vorhandenen `foul_stumble_meshy` für Verursacher und `keeper_shuffle_meshy` für Nachstellbewegungen anbinden; stehenden Zweikampf, Luftlandung und vollständige Luft-/Einwurfbewegungen gezielt ergänzen. Fang-/Abpraller-/Keeperabspielsequenzen und Standardvorbereitung bleiben visuell zu prüfen. Keine kostenpflichtige Generierung aus diesem Befund ableiten. Nach stabilem Renderer einen neuen Auditpfad erzeugen; ursprüngliche Baseline erhalten.

## Schmaler Stadionvertrag v1

Der vorhandene `WorldConfig.teams`-Vertrag enthält bereits Vereins-ID und `home`; kein neues Spielstandschema. Unity wählt das visuelle Stadion anhand der als Heimverein markierten Vereins-ID. Finale/neutrale Regeln bleiben beim vorhandenen Vertrag; keine neue Heimspielregel erfinden.

Die Stadionspur liefert im Namespace `Doppel6.Probe`:

```csharp
public sealed class ClubStadiumProfile {
    public string ClubId, DisplayName, Archetype, FacadeMotif;
    public int[] TierCounts; // vier Einträge, Reihenfolge wie vorhandene standSides
    public bool[] RoofSides; // vier Einträge
    public float StandDepth, MastHeight, RoofOverhang;
    public int DetailSeed;
    public bool CornerBuildings;
}
public static class ClubStadiumProfiles {
    public static ClubStadiumProfile Resolve(string clubId);
    public static string[] KnownClubIds { get; }
}
```

Alle 48 Katalogvereine werden explizit und stabil zugeordnet. Aufruf liefert eine unabhängige Profilkopie, unbekannte IDs einen dokumentierten plausiblen Rückfall. Mindestens mehrere klar unterschiedliche Architekturtypen und individuelle Kombinationen statt bloßer Farbwechsel. Maße betreffen nur den Außenbereich; Feld und Tore behalten ihre Matchgeometrie. Kein Simulationszufall, keine Mutation von Karrieredaten.

Der Unity-Verantwortliche setzt die Profile sichtbar um und darf passende isolierte Architekturdateien hinzufügen. Performance, fünf Kameras, Tribünenausblendung und reduzierte Stufe berücksichtigen. Bestehende Ressourcenverwaltung nutzen und neue Materialien/Textures korrekt entsorgen.

## Native slide presentation contract (implemented by integrator)

Die Profildatei `ClubStadiumProfiles.cs` ist anhand der aktuellen Heimvereins-ID angebunden. Acht Archetypen und alle 48 Vereins-IDs sind enthalten. Profil-/Architekturprüfungen und tatsächliche Renderbilder sind getrennt dokumentiert; reale Geräteabnahme bleibt offen.

`v98PitchFrame` adds optional `unityAction` for observed `person.slideActive`, leaving browser `action` unchanged. Bridge selects foulVictim/foulOffender first, otherwise unityAction, otherwise action. Active `slide` uses native slide.progress (0..1), duration **0.65 real seconds**, target in contactPoint and path heading in facing. Recovery is `slideRecovery`, progress clamp(1 - remaining native recovery time / 0.6), duration **0.6 / MATCH_SPEED real seconds**. Both use actionId `slide:<pid>`, phase kind distinguishes active/recovery. No new gameplay field, timer, event, RNG or persistence. Buffer interpolates same phase progress and keeps prior phase until the next picture boundary. Scaling includes contactWorld and facing. Unity must sample only this supplied phase; no local timer advances pause/replay. If native foul clears slideActive, foulOffender remains authoritative (existing progress over 2.7 s).

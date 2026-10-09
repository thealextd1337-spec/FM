# Vereinsstadien: reiner Architekturvertrag

Stand: 9. Oktober 2026. Auf Nutzerauftrag hat die Qualität des 3D-Erlebnisses Vorrang; unterschiedliche und schönere Vereinsstadien gehören dazu. `ClubStadiumProfiles.cs` liefert für alle 48 tatsächlichen IDs aus `dist/world-catalog-v61.js` eigene Architekturkombinationen. Die Daten enthalten keine Vereinsfarben: Die sichtbare Unterscheidung beruht auf Architektur, Sitzreihen, Tiefe, Dachanordnung, Fassadenmotiv, Masten und Eckgebäuden. Farben kommen weiterhin aus den tatsächlichen Trikots.

## Übergabe an den Unity-Renderer

Namespace `Doppel6.Probe`, Vertrag gemäß [Zuständigkeiten](3d-quality-ownership.md):

```csharp
ClubStadiumProfile stadium = ClubStadiumProfiles.Resolve(homeTeam.id);
```

Den vorhandenen Heimverein im `WorldConfig.teams`-Vertrag verwenden. Bei fehlender oder unbekannter Identität gibt `Resolve` eine neutrale Anlage zurück. Keine eigene Regel für Heimrecht oder Finalorte einführen. Das Ergebnis ausschließlich für Darstellung nutzen; weder Matchgeometrie noch Karrieredaten ergänzen oder verändern.

- `TierCounts` enthält vier Anzahlen einzelner Sitzreihen, in derselben Reihenfolge wie `standSides`: z−, z+, x−, x+. Es sind **keine Stockwerkzahlen**. 3–14 Reihen ergeben niedrige Gemeindetribünen bis zu deutlich größeren Arenen.
- `RoofSides` entscheidet je Seite über Dach und dazugehörige Dachkonstruktion. Offene Seiten benötigen keinen versteckten vollständigen Dachaufbau.
- `StandDepth` ist die gesamte Terrassentiefe in Metern. Die Stufentiefe einer Seite ergibt sich aus `StandDepth / TierCounts[side]`. Die Feldgeometrie und Sicherheitsabstände bleiben beim Renderer; die Tiefe wächst vom Tribünenanfang nach außen.
- `MastHeight` ist die Gesamthöhe der Flutlichtmasten in Metern, 20–36 m. Der Mastfuß muss außerhalb der tatsächlichen Tribünen-/Dachfläche liegen, auch bei großen Profilen.
- `RoofOverhang` ist der zusätzliche Überstand in Metern, 0,6–4 m, außerhalb der regulären Dachdeckung. Er ist keine vollständige Dachbreite. Dächer dürfen die Spielfläche nicht überragen.
- `CornerBuildings` erlaubt kompakte Eckpavillons/Treppentürme. Gebäude und Fassadendetails müssen mit der zugehörigen Tribünenseite ausgeblendet werden, wenn diese die Kamera verdeckt.
- `DetailSeed` kommt stabil ausschließlich aus der ID. Als lokale Musterquelle für crowd/facade geeignet; keine Anbindung an Matchzufall oder Matchentscheidungen.

Der Renderer setzt unterschiedliche Silhouetten statt nur unterschiedliche Materialien um. Reduzierte Qualitätsstufe behält die Grundform, Reihenunterschiede, Dachanordnung und Vereinsidentität; feine Fassadenstäbe, Träger und Eckdetails dürfen reduziert werden. Die fünf vorhandenen Kameras, Dach-/Tribünenausblendung und vorhandene Material-/Texturentsorgung bleiben maßgeblich.

## Acht Architekturtypen

| ID | Architektonische Form | Sichtbare Merkmale |
| --- | --- | --- |
| `civic-bowl` | Geschlossene traditionelle Stadtarena | Hohe umlaufende Tribünen, kräftige Sockel, Arkaden, Eckpavillons; getrennte Dachsegmente |
| `modern-ring` | Moderne kompakte Arena | Zusammengehörige leichte Dachkante, dünne Metalllamellen, wiederkehrende Rahmen; große gleichmäßigere Reihen |
| `industrial-shed` | Gewachsene Werksanlage | Gerade Dachträger, sichtbare Stahlrahmen, robuste Wände, unterschiedliche Tribünenhöhen |
| `dockside-ground` | Hafen-/Flussstadion | Asymmetrische überdachte Haupttribüne, offene Enden, vertikale Hafenlatten oder Lagerhausmauerwerk |
| `urban-court` | Enge Stadthofanlage | Stark unterschiedliche Seitenhöhen, kompakte Eckgebäude, senkrechte Fassaden, einzelne offene Dachseiten |
| `garden-ground` | Niedriges Gemeinschaftsstadion | Kurze Sitzterrassen, kleine Haupttribüne, offene Enden, leichte Holzrippen oder niedrige Steinsockel |
| `sun-terraces` | Offene mediterrane Anlage | Niedrige helle Endterrassen, große offene Dachabschnitte, Fliesenbrüstungen und einzelne Schattenpavillons |
| `hillside-ground` | Terrassierte Hanglage | Hohe Hauptseite gegenüber niedriger Gegenseite, abgestufte Mauerwerkssilhouette, einzelne Dachinseln |

Die Typen sind visuelle Entwürfe für die erfundenen Katalogvereine, keine Behauptung über reale Stadien. Sie verändern weder Einnahmen noch Stadionkapazitäten oder Vereinsstärke.

## Fassadenmotive

Die acht stabilen Bezeichner sind `brick-arcade` (Backsteinarkaden), `metal-fins` (Metalllamellen), `harbor-slat` (Hafenlatten), `steel-truss` (Stahlfachwerk), `stone-colonnade` (Steinkolonnaden), `timber-rib` (Holzrippen), `tiled-parapet` (Fliesenbrüstung) und `limestone-step` (gestuftes Kalksteinmauerwerk). Typ und Motiv dürfen kombiniert werden; die konkrete Geometrie bleibt der Unity-Implementierung vorbehalten.

## Stabilität und Rückfall

`Resolve` arbeitet ordinal und erkennt ausschließlich explizite Katalog-IDs. Kleinschreibung oder Leerzeichen werden nicht als bekannte IDs umgedeutet. Jede Abfrage liefert ein neues Profil und neue Arrays; Änderungen des Renderers daran erreichen weder den privaten Katalog noch andere Abfragen. Auch `KnownClubIds` liefert eine neue, ordinal sortierte Liste.

Unbekannte IDs behalten ihre ID für Diagnostik und erhalten das neutrale `garden-ground` mit Holzrippen, Sitzreihen `[5,4,3,3]`, Dach nur auf z−, Tiefe 6,5 m, Masten 21 m, Überstand 0,8 m und keinen Eckgebäuden. `null` und leere ID werden `NEUTRAL`. Die neutrale Architektur ist unverändert; unbekannte IDs haben jeweils reproduzierbare Detailmuster. Keine neue Identität wird in den Spielstand geschrieben.

FNV-1a über die UTF-16-Codeeinheiten der ID nutzt ausdrücklich `unchecked uint`; das Ergebnis wird auf einen nichtnegativen `int` maskiert. Referenzen: `ENG-1 = 439681357`, `GER-1 = 938718175`, `NEUTRAL = 1965144888`. Damit ist die Auswahl unabhängig von `GetHashCode`, Sprache, Prozess, Spielsitzung und globalem RNG.

## Prüfungen und Abnahmegrenze

`ClubStadiumProfilesTests.Run(repository, outputFolder = null)` ist reines C# ohne Unity-Abhängigkeit. Der Hook liefert JSON und schreibt `club-stadium-profile-tests.json`; Standardausgabe ist `outputs/3d-quality/stadiums/`. Der zentrale Unity-Runner kann dieselbe Funktion aufrufen. Die lokale PowerShell-Kompilierung mit `Add-Type` bestand **396 Prüfungen**: sämtliche 48 IDs, Seiten-/Dachdaten, Maße, acht Typen, unterschiedliche Formkombinationen ohne Farbe/Name/Seed, Wiederholbarkeit, Referenzseeds, Kopierisolation und unbekannte IDs.

Der unabhängige Node-Abgleich `node outputs/3d-quality/stadiums/check-catalog.cjs` liest den aktuellen JS-Katalog und den aus kompiliertem C# exportierten Profilkatalog. Er überprüft alle tatsächlichen Vereins-IDs, Dimensionen und Seedwerte nochmals mit eigenem FNV-Code und schreibt Quellhashes nach `catalog-audit.json`.

Diese Prüfungen belegen Profilcode und Daten. Sie sind keine visuelle Stadionabnahme: tatsächliche Meshes, Materialwirkung, Eck-/Dachausblendung, Sicht aller Kameras sowie Desktop-/Touch-Leistung prüft der Unity-Verantwortliche nach Anbindung. Es wurden weder Unity-Editor noch Build/Sync gestartet und keine bezahlten Assets erzeugt.

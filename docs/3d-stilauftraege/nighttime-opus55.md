# Nighttime Umsetzung für Opus 5.5

Setze **Nighttime** als hochwertige 3D-Nachtstadiongestaltung für Doppel 6 um. Beginne beim **lokal fertiggestellten aktuellen 3D-Redesign** und übernimm geeignete Assets. Modelle dürfen ersetzt werden, wenn sie den vorhandenen Animations- und Matchvertrag erfüllen. Nighttime ist eine eigenständige Stilanleitung; die bestehende Oberfläche mit dem Namen **Flutlicht** wird dadurch nicht umbenannt.

## Startprompt

> Lies `docs/3d-stilauftraege/nighttime-opus55.md` und zuerst vollständig den verpflichtenden `docs/3d-stilauftraege/kompatibilitaet.md`. Ermittle den aktuellen lokalen Redesignanker einschließlich Originalassets und vorhandener Animationssets. Entwickle daraus einen lokalen Nighttime-Kandidaten mit klar lesbarem Fußballgeschehen, ruhigen glaubwürdigen Materialien und kontrollierter Stadionbeleuchtung. Übernimm passende Modelle, verbessere oder ersetze ungeeignete Modelle am bestehenden Rig. Erhalte native Matchregeln, Clipauswahl, Kontaktphasen und Spielstände. Liefere tatsächliche Unity-/WebGL-Nachweise und die dokumentierte Übernahmeentscheidung je Asset.

## Visuelles Ziel

Ein modernes Vereinsstadion am Abend beziehungsweise in der Nacht: dunkler blauer Himmel, leicht kühlere Stadionumgebung und hell lesbares Spielfeld. Spieler, Ball und Linien bilden die wichtigsten Blickpunkte. Licht vermittelt Atmosphäre, ohne Trikotfarben zu verschlucken.

[Konzeptreferenz Nighttime](../../outputs/conceptart-3d/stilvergleich-2026-10-12-serie-2/07-flutlicht.png). Die historische Beschriftung im Konzeptbild lautet „Flutlicht“; der verbindliche Name dieses 3D-Stilauftrags ist **Nighttime**. Das Bild gibt Materialwirkung und Stimmung vor, keine neue Vereinsidentität oder verbindliche Stadiongeometrie.

Richte die Ausarbeitung an der erhöhten Spielkamera aus. Die Nahaufnahme dient zur Materialprüfung; das kleine laufende Match ist die eigentliche Abnahme.

## 1 Bestand und Musterstadion wählen

Erfülle zuerst Schritt 1 des [Kompatibilitätsvertrags](kompatibilitaet.md). Prüfe, welche Nacht-/Abendbeleuchtung und Materialsätze das fertige lokale Redesign bereits besitzt. Entwickle sie weiter, statt dieselben Funktionen doppelt anzulegen.

Die [Fable-Assetprüfung](assetpruefung-fable.md) bestätigt: Nacht-/Abendhimmel, Hauptlicht, Umgebung, Lampen-/Bandenemission und Qualitätsstufen sind bereits vorhanden. Beginne mit den bestehenden Feldspieler-/Keepermodellen, dem Generic-Rig mit 28 Gelenken, den 34 Originalclips und zwei Pilotclips. Stadion, Publikum, Rasen, Tore und Netz sind weitgehend prozedural. Der erste Kandidat verändert Material- und Lichtwirkung; ein neues Modell folgt einer konkreten sichtbaren Lücke.

Wähle zunächst einen bestehenden Verein mit übersichtlichem Stadion. Sichere einen laufenden Frame, Nahsicht und weite Übersicht desselben Fixtures. Notiere für Spieler/Keeper, Ball, Tor/Netz, Stadion und Publikum jeweils „übernehmen“, „Material anpassen“ oder „Modell ersetzen“.

**Fertig, wenn:** Der gewählte Anker und die konkrete Assetentscheidung sind nachprüfbar; das Musterstadion verwendet seine vorhandene Vereins-/Sponsorzuordnung.

## 2 Materialien auf die Nachtwirkung abstimmen

- **Rasen:** dunkles, sattes Grün mit ruhigen Mähstreifen und geringer großflächiger Variation. Spielfeldlinien bleiben sauber. Einzelne feuchte Lichtreflexe sind ein optionaler Oberflächeneffekt; die Fläche bleibt klar lesbar und vermittelt keine geänderte Ballreibung.
- **Trikots und Stutzen:** matte Grundfarbe, feine zurückhaltende Gewebestruktur, sparsame Naht-/Faltendetails. Haut, Haare und Stoff unterscheiden sich in der Lichtreaktion. Die vorhandenen Vereinsfarben, Muster, Rückennummern und Torwartkombinationen bleiben korrekt.
- **Beton:** kühles Grau mit mäßiger Körnung, weichen Alterungsspuren und einzelnen dunkleren Flächen. Wenige sichtbare Spuren prägen die Oberfläche stärker als flächiger Mikroschmutz.
- **Metall:** lackierte oder gebürstete Flächen mit begrenztem Glanz. Kleine Kantenreflexe machen Geländer und Tore sichtbar. Jede Fläche braucht keinen eigenen Materialslot.
- **Sitze, Bande und Publikum:** gedämpfte Umgebung, erkennbarer Vereinsbezug. Sponsorflächen und Publikum bleiben lesbar, konkurrieren aber nicht mit dem Ball.

Erzeuge aus der Konzeptgrafik keine direkte Spielfeldtextur mit eingebrannter Perspektive, Licht oder Beschriftung. Verwende separate nahtlose Oberflächen beziehungsweise den bestehenden prozeduralen Materialpfad. Beginne bei 512–1024 px für kachelbare Umfeldflächen und höchstens 2048 px für einen tatsächlich benötigten gemeinsamen Charakteratlas; dies sind Arbeitsvorschläge, keine gemessenen Pflichtbudgets. Bestehende kleinere Assets weiterverwenden, wenn sie die Sichtprüfung bestehen.

Farbtexturen und Datenmasken unterscheiden: Base Color passend zum linearen Projekt importieren, Kleidungs-/Materialmasken als lineare Daten. Mipmaps und Filter gegen Schimmern aus der Spielkamera prüfen. Die existierende Import-/Maskenbehandlung ist Ausgangspunkt. [Unity-Texturimport](https://docs.unity.com/en-us/engine/6000.5/manual/materials-and-shaders/textures/textures-reference/texture-type-default).

**Fertig, wenn:** Rasen, Stoff, Beton und Metall wirken verschieden, und beide Teams bleiben bei allen vorhandenen Trikotmustern klar unterscheidbar.

## 3 Bestehende Shader gezielt weiterentwickeln

Prüfe im lokalen Anker `WorldViewEnvironment.cs`, `D6Pitch.shader`, `D6Env.shader`, `WorldKit.shader` und `D6Common.hlsl`. Die bisherige Umgebung besitzt unter anderem BaseMap, BaseColor, Emission, Gloss und VertexTint. Roughness-, Metall- oder Normalmaps wirken nur, wenn der tatsächlich verwendete Shader sie auswertet. Eine Texturdatei im Projekt allein ist keine Integration.

Bevorzuge vorhandene Parameter und eine kleine zusammenhängende Erweiterung. Erhalte Schattencasting, Trikotmasken, Muster, Nummern, Haut-/Haarfarben und Handschuhe. Bei Bedarf neue Stilparameter additiv anlegen; semantisch belegte Meshkanäle erhalten. Glanzmasken nur hinzufügen, wenn ihre Wirkung im WebGL-Bild nachgewiesen ist.

**Fertig, wenn:** Jedes neue Asset wird vom geladenen Material tatsächlich verwendet; Quelle, Editor und WebGL zeigen denselben Materialstand.

## 4 Nighttime Licht einstellen

Nutze zunächst das vorhandene Hauptlicht, die Umgebungsbeleuchtung und die bestehenden Qualitätsprofile. Der geprüfte frühere Unity-Pfad verarbeitet MainLight und sphärische Umgebungsbeleuchtung; zusätzliche Spotlights liefern dort ohne Shadererweiterung nicht automatisch weitere Lichtbeiträge.

- Ein hohes weißes bis leicht warmes Hauptlicht macht Spieler und Ball erkennbar.
- Kühles Umgebungslicht gibt dunklen Trikots Zeichnung. Schatten dürfen nicht zu schwarzen, informationslosen Flecken werden.
- Sichtbare Lampen dürfen Emission nutzen. Emission an einer Leuchte allein beleuchtet keine umgebende Geometrie.
- Ruhige Helligkeit: keine automatisch pumpende Belichtung während Pässen oder Kamerafahrten.
- Bloom bleibt zurückhaltend und optional; es überstrahlt weder Ball noch Linien. `reduced` muss den Look auch ohne Bloom darstellen.
- Richtige Hauptlichtschatten und vorhandene Ball-/Kontaktschatten unterstützen die Bodennähe. Mehrere dynamische Schattenlichter erst nach einem belegten Qualitätsgewinn und Kostenvergleich hinzufügen.

Passe Hintergrund, Stadionhorizont und Lichtfarbe gemeinsam an. Ein schwarzer Himmel über hellen Tagesbäumen ist kein fertig abgestimmtes Nighttime. Beim Verlassen des Matches stellt der bestehende Cleanup Licht-/Pipeline-/Volumeeinstellungen wieder her.

**Fertig, wenn:** Ball, helle und dunkle Trikots sowie Keeper sind in naher und weiter Kamera sichtbar, auch unter Dächern und in der reduzierten Stufe.

## 5 Modelle bei Bedarf verbessern oder ersetzen

Übernimm das aktuelle Redesignmodell, wenn Silhouette, Hände, Schuhe und Materialzuordnung bereits passen. Ein Ersatz ist ausdrücklich erlaubt, etwa für sauberere Kleidung, glaubwürdigere Stadionflächen oder besser erkennbare Spielfiguren.

**Werkzeugweg:** Unity MCP für vorhandene Material-/Lichtparameter, Import- und Rigprüfung, Console und Vergleichsaufnahmen. Blender MCP für gezielte Meshverbesserungen am vorhandenen Skeleton. Meshy ist optional für neue sichtbare Modelle oder Stadionbausteine; dessen generiertes Rig ist zunächst kein Animationsnachweis. Übernimm geeignete Geometrie über Blender in den bestehenden Rig-/Assetvertrag. Projekt, Bridge und Editorzuständigkeit vor den Eingriffen lesen; keine zusätzliche MCP-Installation ist Teil dieses Auftrags.

Binde jeden animierten Ersatz nach Schritt 3 des Kompatibilitätsvertrags an. Geometrie für Kleidung und Haare bleibt an vorhandenen Bewegungen stabil; es entsteht kein neues Cloth-/Haarphysiksystem. Spielertypen, Haut-/Haarvarianten und Vereinsfarben weiter aus bestehenden Aussehensdaten darstellen.

**Fertig, wenn:** Jeder Ersatz besteht die vorhandenen Clips und prozeduralen Aktionen im tatsächlichen Nighttime-Licht; Haut glänzt nicht wie Kunststoff, Trikotmuster wandern nicht über Arme oder Gesicht.

## 6 In mehreren Vereinsstadien prüfen

Übertrage den geprüften Materialsatz auf mindestens vier unterschiedliche vorhandene Architekturtypen. Die Heimvereinszuordnung und deren Abstände, Dächer, Eingänge, Publikum sowie Sponsorflächen bleiben erkennbar. Prüfe Kameraverdeckung, Tribünenschatten, helle Banden und das Stadionende außerhalb des Feldes.

Durchlaufe Schritte 4 und 5 des Kompatibilitätsvertrags. Sichere insbesondere Sprint/Pass/Schuss, Grätsche/Aufstehen und Keeperhechten bei dunklen und hellen Trikots als kurze Videos. Vergleiche Framezeit, Materialien, Schatten und Speicher gegen denselben lokalen Redesignanker.

**Fertig, wenn:** Nighttime ist in normal und reduced sichtbar abgestimmt, Animation und native Ergebnisfolge sind erhalten, und der lokale WebGL-Kandidat samt Nachweisen ist übergeben.

## Abnahme des Stils

Nighttime ist fertig, wenn die Nachtatmosphäre aus der Spielkamera erkennbar ist, Ball und Teams jederzeit unterscheidbar bleiben, mindestens vier Vereinsstadien überzeugen und Material-/Lichtwechsel weder Animation noch Matchablauf verändern. Eine Einführung von Wetter, Tageszeitwahl, neuen Matchregeln oder einer anderen UI gehört zu einem gesonderten Produktauftrag.

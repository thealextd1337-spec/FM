# Klares Low-Poly Umsetzung für Opus 5.5

Setze **Klares Low-Poly** als modernen 3D-Stil für Doppel 6 um: sportliche erwachsene Figuren, bewusst gestaltete geometrische Facetten und ruhige Texturen. Ausgangspunkt ist das **aktuelle lokal fertiggestellte 3D-Redesign**. Modelle dürfen ersetzt werden; vorhandene Animationssets, Kontaktphasen und Matchregeln bleiben erhalten. Dieser Auftrag ist von [Nighttime](nighttime-opus55.md) getrennt und verwendet zunächst die Beleuchtung des lokalen Ankers.

## Startprompt

> Lies `docs/3d-stilauftraege/klares-low-poly-opus55.md` und zuerst vollständig den verpflichtenden `docs/3d-stilauftraege/kompatibilitaet.md`. Ermittle den fertigen lokalen 3D-Redesignanker und die tatsächlich verwendeten Originalassets, Rigs und Clips. Erstelle daraus einen lokalen Kandidaten mit bewusst facettierter Geometrie, klaren erwachsenen Sportproportionen und sparsamen Texturen. Übernimm geeignete Stadion-/Ball-/Netzbausteine und ersetze ungeeignete sichtbare Modelle. Skinne Ersatzfiguren bevorzugt auf das vorhandene Rig; erhalte Clipwahl, prozedurale Posen und native Matchregeln. Liefere Vorher/Nachherbilder, Aktionsvideos, native Parität und einen reproduzierbaren WebGL-Build.

## Visuelles Ziel

[Konzeptreferenz Klares Low-Poly](../../outputs/conceptart-3d/stilvergleich-2026-10-12-serie-2/12-low-poly.png): klare Facetten an Kopf, Haaren, Trikot, Armen und Beinen; großflächige Rasenstreifen; einfache Stadionformen und kontrollierte Materialfarben. Die Referenz gibt den Stil vor, nicht neue Vereinsfarben oder den exakten Grundriss.

Low-Poly entsteht durch bewusst gestaltete Form, Topologie und Normalen. Ein grobes Pixelmuster oder ein Filter über ein realistisches Modell erfüllt das Ziel nicht. Die Bewegungen bleiben flüssig; Animationsframes, Cliptempo und Kontaktzeiten werden nicht reduziert.

Die [Fable-Assetprüfung](assetpruefung-fable.md) empfiehlt einen schnellen Material-/Facettenvergleich auf dem vorhandenen Mesh als erste Stufe. Eine mögliche Shader-Facettierung verändert die Lichtreaktion der bestehenden Dreiecke, senkt deren Zahl aber nicht und vereinfacht keine Silhouette. Nutze diesen reversiblen Prototyp zur Stilprüfung. Wenn Formen oder die sichtbare Dreiecksverteilung den Zielstil nicht ergeben, folgt die echte Meshgestaltung in Schritt 2.

## 1 Anker und ersten Spieler sichern

Erfülle Schritt 1 des [Kompatibilitätsvertrags](kompatibilitaet.md). Wähle einen Feldspieler und einen Keeper aus dem lokalen Redesign als technische Referenz. Erfasse Triangles, Vertices, Materialslots, Texturen, Skeleton, Clipbindungen und Kontaktanker. Sichere dieselbe Figur in Stand, Sprint, Pass, Schuss, Grätsche und Keeperhechten.

Die Wiederverwendungsentscheidung erfolgt pro Asset. Stadiongeneratoren und bestehende Farb-/Sponsor-/Heimprofile sind zuerst als brauchbare Grundlage zu behandeln; der Nutzer erlaubt auch neue Modelle, falls die Stil- oder Bewegungsprüfung eine Lücke zeigt.

Fables Ausgangsbefund: Das vorhandene Spieler-/Keepermodell besitzt 9.725 Vertices und 12.668 Dreiecke; beide Rollen teilen das Generic-Rig mit 28 Gelenken. 34 Originalclips plus zwei Pilotclips bleiben erhalten. Erfasse den tatsächlichen Stand erneut. Vor Retopologie zuerst Stoffpigmentvariation, Rasenrauschen und Stadiontexturen beruhigen und einen Facettenprototyp mit denselben Clips vergleichen.

**Fertig, wenn:** Die Vorlage lässt sich reproduzieren und ein Modell-/Materialplan benennt konkrete Übernahmen und Ersatzkandidaten.

## 2 Einen echten Low-Poly Spieler erstellen

Bevorzugter Weg: Neues beziehungsweise retopologisiertes Mesh auf dem unveränderten bestehenden Rig. Gestalte zuerst die Silhouette: Schultern, Brust, Hüfte, Oberschenkel, Waden, Schuhe und Hände sollen aus der erhöhten Kamera als Fußballer erkennbar bleiben. Gesicht und Frisur erhalten wenige gezielt gesetzte Formen, keine übergroßen Köpfe.

- Setze Flächen bewusst an Stirn, Wange, Kiefer, Haarmassen, Oberarmen, Waden und großen Stofffalten.
- Erhalte ausreichend Kantenführung an Schulter, Ellbogen, Hüfte, Knie, Handgelenk und Knöchel. Diese Zonen müssen bei allen vorhandenen Bewegungen sauber deformieren.
- Übertrage Hautgewichte kontrolliert; prüfe die Summe und die tatsächliche Zuordnung zur bestehenden Boneliste.
- Behalte den funktionalen Körpermaßstab und die Kontaktflächen. Die sichtbare Sohle, Fußspitze und Keeperhand müssen zu den vorhandenen Ankern passen.
- Wähle zunächst etwa 1.500–3.000 Dreiecke für eine Musterfigur, wenn dies gegenüber dem Anker eine sinnvolle Vereinfachung ergibt. Das ist ein Arbeitsziel, kein Ersatz für gemessene Deformationsqualität; bei kleinerem oder bereits geeignetem Bestand keine unnötige Erhöhung.
- Handschuhe, Haar und Trikotdetails teilen nach Möglichkeit vorhandene Materialpfade. In der reduzierten Stufe zuerst entfernte Details einsparen, statt das Rig zu verstümmeln.

Automatische Decimation ist höchstens ein Entwurfsschritt. Unkontrollierte Reduktion kann Gelenke, Hautgewichte, UVs und den Sohlenumriss beschädigen. Übernimm nur kontrolliert geprüfte Resultate.

**Werkzeugweg:** Blender MCP für kontrollierte Retopologie, Gewichtsübertragung, harte/gezielte Normalen und Export auf das bestehende Skeleton. Unity MCP für Import, Masken-/Sohlenregeneration, Clip-/Kontaktprüfung, Console und vorhandene Tests. Meshy liefert bei Bedarf alternative sichtbare Körper-, Haar-, Schuh- oder Stadionmodelle; Blender bereitet sie für die bestehenden Bindings auf. Die Tools ersetzen keine Prüfung des geladenen Prefabs, Originalassetmanifests und WebGL-Pfads.

**Fertig, wenn:** Die Form wirkt bewusst gestaltet, besitzt nachvollziehbar vereinfachte Topologie und deformiert mit dem vorhandenen Clipbestand sauber.

## 3 Facetten und Materialdaten korrekt aufbauen

Flächen mit gewünschten harten Lichtkanten erhalten passende getrennte Vertexnormalen. Vermeide harte Brüche direkt über kritischen Gelenkfalten. Haut darf stilisiert sein, wirkt aber nicht wie ein unbeweglicher Kristall.

Beim Aufteilen von Vertices für harte Kanten müssen Positionen, Normals/Tangents, Skinweights, UVs und sämtliche belegten Zusatzkanäle vollständig mitkopiert beziehungsweise neu erzeugt werden. In Doppel 6 gehören dazu die Bindpose-Koordinaten in TEXCOORD2 und der vorhandene Kleidungs-/Nummernvertrag. Neue Vertexindizes bedeuten neue Kit-/Sohlenmessung und neue importierte Meshdaten; siehe Schritt 3 des Kompatibilitätsvertrags.

Behalte bei neuen Formen Trikot-, Hosen-, Stutzen-, Haut-, Haar- und Handschuhregionen korrekt. Aktualisiere `WorldPlayer.asset` und die Masken bewusst; ein altes generiertes Meshasset oder ein gleicher Meshname mit alten Sohlenkonturen darf nicht weiter als neuer Import gelten.

**Fertig, wenn:** Facetten sind im Render sichtbar und stabil; Trikotmuster, Nummern, Haut und Handschuhe liegen auch während aller Bewegungen auf den richtigen Flächen.

## 4 Ruhige Texturen erstellen

- **Rasen:** breite Mähstreifen, große zusammenhängende Grüntöne und sparsame weiche Variation. Die weißen Linien bleiben glatt und geometrisch korrekt.
- **Stoff:** klare Vereinsfarbe, wenige große Falten und einfache Nahtakzente. Keine fotorealistische Mikrofaserstruktur, die die Facetten überlagert.
- **Beton:** wenige warme oder kühle Grauflächen, geringe Mottelung, punktuelle Gebrauchsspuren. Die Architekturform trägt mehr Information als Oberflächenrauschen.
- **Metall:** matte Grundfarbe mit einem kontrollierten breiten Reflex. Pfosten und Geländer bleiben auch aus der Übersicht erkennbar.
- **Haut und Haare:** abgestimmte Farbflächen und wenige Formakzente. Vorhandene Aussehensvarianten werden weiterhin dargestellt.

Bevorzuge Vertexfarben, einfache prozedurale Flächen oder kleine gemeinsame Atlanten, soweit der vorhandene Shadervertrag dies unterstützt. Beginne bei 256–512 px für Umfeldatlanten und bis zu 1024 px für einen benötigten Charakteratlas; die tatsächliche Sichtprüfung bestimmt die nötige Größe. Eine bestehende kleine Textur kann unverändert bleiben.

Nutze glatte Filterung und geeignete Mipmaps gegen Flimmern. Bewusste Geometriefacetten benötigen keine groben nearest-neighbor Pixeltexturen. Farbtexturen und Datenmasken nach ihrem tatsächlichen Zweck importieren. [Unity-Texturimport](https://docs.unity.com/en-us/engine/6000.5/manual/materials-and-shaders/textures/textures-reference/texture-type-default).

**Fertig, wenn:** Die Szene hat ruhige Materialien und klaren Formkontrast; Ball, Linien, beide Teams und Keeper sind auf kleinen Bildschirmen gut unterscheidbar.

## 5 Stadion Ball und Publikum angleichen

Übernimm die vorhandene Stadionarchitektur, wo ihr Aufbau bereits passt. Vereinfache Dach-/Stützformen, Sitze, Mauern und Hintergrundvegetation als sichtbare Geometrievarianten. Erhalte unterschiedliche Architekturtypen, Heimvereinsprofile und Sponsorflächen.

Ballgröße und die tatsächlich gelieferte Rotation bleiben erhalten. Der Ball darf geometrisch vereinfacht sein, muss aus der Spielkamera aber rund und in Flug/Rotation klar lesbar wirken. Tore, Netzmaschen und Netzdarstellung bleiben vollständig funktional; für den Stil ist kein Neubau der Netzphysik nötig.

Publikum darf aus einfachen vorhandenen Reihen, Billboard-/Atlasbausteinen oder klareren Silhouetten bestehen. Erhalte die bestehende Perspektiv-/Vereinswirkung und begrenze überlagerte Alpha-Flächen. Vereinfachte Zuschauer dürfen nicht auf die Spielfläche oder in Kameras ragen.

**Fertig, wenn:** Mindestens vier bestehende Architekturtypen zeigen denselben Stil und bleiben als unterschiedliche Vereinsstadien erkennbar.

## 6 Alle Bewegungen und WebGL prüfen

Durchlaufe Schritt 4 des Kompatibilitätsvertrags mit der neuen Feldspieler- und Keepergeometrie. Besonderes Augenmerk: Ellbogen/Knie bei extremen Posen, Schultern beim Einwurf, Hände beim bestätigten Fang, Hüfte bei Grätsche und Hechten, Sohlen bei Drehung und Stopp. Beide Füße, Richtungen und alle vorhandenen Clips samt prozeduralen Korrekturen sind Pflicht.

Vergleiche normale und reduzierte Stufe bei naher Kamera, Übersicht und mobilen Querformaten. Facetten dürfen über Kamerafahrten keine Flimmermuster erzeugen. Ein glatter beziehungsweise historischer Ersatz aus dem Fallback darf nicht unbemerkt den Test bestehen; dokumentiere den tatsächlich geladenen Mesh-/Shader-/Assethash.

Ergebnis-/Ereignisparität wird am identischen nativen Fixture geprüft. Erhebe außerdem Triangle-/Vertexzahlen, Materialien, Draw Calls, Textur-/Meshspeicher, Framezeiten und Buildgröße gegenüber dem lokalen Redesignanker. Low-Poly ist eine Gestaltung; bessere Leistung wird gemessen, nicht aus dem Namen abgeleitet.

**Fertig, wenn:** Das laufende WebGL zeigt echte vereinfachte Modelle, alle Bewegungen passen, Matchdaten sind unverändert und Messungen belegen die tatsächlichen Kosten.

## Abnahme des Stils

Klares Low-Poly ist fertig, wenn Figuren und Stadion durch Form und Lichtfacetten einen zusammenhängenden modernen Stil besitzen, vorhandene Aussehens-/Vereinsvarianten funktionieren, Kontakte und Animationen passen und der lokale Kandidat nach Schritt 5 des Kompatibilitätsvertrags übergeben ist. Eine Kombination mit Nighttime ist ein späterer gesonderter Vergleich; beide Aufträge bleiben einzeln prüfbar.

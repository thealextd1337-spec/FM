# Kompatibilität der 3D Stilaufträge

Dieser Vertrag gilt vor jeder Umsetzung von **Nighttime** oder **Klares Low-Poly** durch Opus 5.5. Ausgangspunkt ist auf Nutzerentscheid das **aktuelle lokal fertiggestellte 3D-Redesign**. Modelle dürfen ersetzt werden. Die vorhandenen Animationssets, prozeduralen Bewegungen und Matchregeln bleiben funktionsgleich.

## 1 Den lokalen Anker sichern

Lies zuerst die geltende `AGENTS.md` und die relevanten Abschnitte in [Entwicklung](../development.md) und [Produktregeln](../product.md). Ermittle den Checkout, die tatsächlichen Originalassets, den dazugehörigen Unity-Editorstand sowie Quellen- und Buildmanifest des fertigen lokalen Redesigns. Ein älterer Live-Build oder Releasebericht ist kein Ersatz für diesen Anker.

Lies vor dem Assetplan die [Fable-Assetprüfung](assetpruefung-fable.md). Sie ordnet den lokalen Bestand `work/claude-natural-motion` und den Editor `G:/unity/My project` zu. Zum Prüfzeitpunkt war R20 vollständig übergeben, während R21 noch bearbeitet wurde. Verwende bei Umsetzung den neuesten fertig übergebenen lokalen Redesignstand, sichere dessen Kennungen erneut und übernimm keinen noch fremd bearbeiteten Editor.

Dokumentiere vor Änderungen: Checkout und Commit, lokale Änderungen, Unity-Version, Quellkennung, Assetpfade und SHA-256, tatsächlich geladene Prefabs/Shader, Clipkatalog, Rigtyp, Bonehierarchie, Mesh-/Texturgrößen, normale und reduzierte Qualitätsstufe. Sichere ein identisches Matchfixture und Vorherbilder. Die Quellbefunde der Assetprüfung ersetzen keine Sichtprüfung.

**Fertig, wenn:** Der lokale Redesignstand ist eindeutig einem Quell-/Assetbestand zugeordnet und reproduzierbar renderbar. Bei widersprüchlichen Quellen die konkrete Abweichung klären, bevor ein Modell ersetzt wird.

## 2 Zuständigkeiten erhalten

Die Vereinswelt liefert Positionen, Blickrichtung, Ballflug, Aktionen, Kontaktphasen, Spielzeit und Ereignisse. Der 3D-Renderer zeigt dieselben gelieferten Daten mit anderen Assets und Materialien.

- Native Simulation, Taktik, Kollisions-/Kontaktentscheidungen, Reichweiten, Abseits, Fouls, Keeperergebnisse, Ballbahn, Tempo, Zufallsstrom und Buchungen bleiben erhalten.
- Die bestehende Animationsauswahl, Clipzeiten, PlayableGraph-Mischung und prozeduralen Korrekturen bleiben maßgeblich. Pause friert dieselbe Pose ein; Rückschau und Neuladen folgen den gelieferten Frames.
- Ein Modellwechsel verändert die sichtbare Hülle. Der Actorroot bleibt am nativen Ort; ein neuer Root-Motion-Antrieb, AnimatorController oder eigener Aktionstimer ist nicht Bestandteil des Stilauftrags.
- Spielfeld-/Torabmessungen, Spielerzahl, Kameras, Ballhilfe, Vereinsringe, Namen, Spielhinweise, Sponsorzuordnung und die bewusste 2D-Ansicht bleiben funktionsfähig.
- Grafikdaten gehören in den vorhandenen Darstellungs-/Assetpfad. Bestehende Karrieren werden nicht ergänzt oder rückwirkend umgerechnet. Fähigkeiten erscheinen weiterhin ausschließlich als qualitative Farbstufen.
- Unity-Quellen, Assets und gezielte Darstellungstests werden im eigenen übergebenen Checkout bearbeitet. `freekickdemo/`, alte Sechserliga und fremde Arbeitsstände bleiben außerhalb des Auftrags. Editorzugriff mit aktiven Arbeitsinstanzen abstimmen.

**Fertig, wenn:** Ein Dateiplan nennt ausschließlich Darstellung, Assetimport, zugehörige Tests und Buildbindung; etwaige benötigte Schnittstellen sind ausdrücklich als Darstellungsdaten beschrieben.

## 3 Ersatzmodelle an den Bestand anbinden

Bevorzugter Weg: Neues Mesh auf **das bestehende Skeleton** skinnen und die bestehenden Clips weiterverwenden. Erhalte Bonepfade, Hierarchie, Root, lokale Achsen, Bindposes, Hautgewichte und die von prozeduralen Posen angesprochenen Bones. Körperhöhe, Beinlänge und Schuh-/Handkontaktfläche orientieren sich an der vorhandenen Kontaktgeometrie. Modelle dürfen moderner und klarer sein; erwachsene sportliche Proportionen bleiben erhalten.

Ein anderes Rig ist nur als isolierter Kandidat zulässig, wenn ein Adapter die vorhandenen Clipbindings, prozeduralen Bonezugriffe und Kontaktanker vollständig erhält. Unity-Humanoid-Retargeting setzt konfigurierte Humanoid-Avatare voraus; ein vorhandenes Generic-Rig wird dadurch nicht automatisch kompatibel. [Unity-Retargeting](https://docs.unity.com/en-us/engine/6000.6/manual/animation-section/animation-mecanim/avatar-creationand-setup/retargeting).

Prüfe im tatsächlichen lokalen Anker insbesondere folgende im vorhandenen Unity-Pfad belegten Abhängigkeiten:

- `FootballAnimation.cs` / `FootballGround`: Fuß-/Zehenzugriffe auf `mixamorig:LeftFoot`, `RightFoot`, `LeftToeBase`, `RightToeBase` und gegebenenfalls Toe-End-Bones. Kopf-, Hand-, Keeper- und übrige Posebindungen ebenfalls vollständig erfassen.
- `FootballSoleContour`: meshbezogene Sohlenkonturen und Kalibrierung für Ersatzmeshes neu ableiten. Ein neues Mesh mit altem Namen darf keine veralteten Konturdaten übernehmen. Editor-Messung und tatsächlich verwendeter WebGL-Pfad müssen übereinstimmen.
- `WorldViewSetup.cs`: neue Meshvertices erfordern eine neu erzeugte `WorldPlayer.asset`-Variante. Der vorhandene `mesh==null`-Pfad aktualisiert ein bestehendes Asset nicht automatisch. Auch `calibration-v130.json` im Browserpfad besitzt mesh-/vertexgebundene Kontakt- und Sohlenangaben; bei neuem Mesh die Original-GLB, Kalibrierung und Assetmanifest zusammen aktualisieren.
- `WorldKit.shader`: UV0, Kleidungsmaske und `SetUVs(2, ...)`-Bindpose-Koordinaten sind verschiedene Daten. TEXCOORD2 ist hier kein gewöhnlicher frei verfügbarer Lichtmap-Kanal. Alle Kanäle nach Retopologie oder Vertexaufteilung korrekt neu erzeugen.
- Kleidungsmaske: R = Trikot, G = Hose, B = Stutzen; außerdem aktuelle Haut-/Haar-/Handschuhzuordnung, Muster, Nummern und deren Körperregionen prüfen. Haut-/Haarerkennung benutzt auch Pigmentheuristiken: eine neue einfarbige Textur braucht weiterhin eine eindeutige Zuordnung. Neue Körperformen dürfen positional definierte Shaderregionen nicht verschieben.
- Skinned-Mesh-Bounds, Schattenpass und Culling über Sprint, Grätsche, Sprung und Keeperhechten prüfen. Assets, Metadaten und benötigte Texturen im vorhandenen Sync-/Hash-/Buildmanifest erfassen.

Diese Prüfhinweise beziehen sich auf den von Fable zugeordneten [lokalen Unity-Quellpfad](../../work/claude-natural-motion/prototypes/match-engine-unity/); für die Umsetzung wird jede Abhängigkeit gegen dessen dann fertig übergebenen Stand verifiziert.

**Fertig, wenn:** Jeder Ersatz funktioniert mit dem vollständigen bisherigen Clipkatalog und allen aktiven prozeduralen Posepfaden. Ein schöner Standpose-Screenshot allein genügt nicht.

## 4 Ergebnisneutralität und Bewegung prüfen

Verwende identische gespeicherte Ausgangsfixtures, native Schritte und Kameraeinstellungen für Vorher/Nachher. Sichere gleiche native Zustands-/Ereignisfolgen, Ballpositionen, Tore, Fouls, Wechsel, Abseits, Spielzeit, Buchungen und gespeicherte Fortsetzung. Vergleiche am selben Simulationsschritt; Render-FPS sind keine zweite Matchuhr.

Die Sichtprüfung umfasst vorhandene Vorwärts-/Rückwärts-/Seitwärts-/Diagonalläufe, Bremsen und Drehen, Ballführen, Pass/Annahme, Schuss, hohe Bälle/Kopfkontakt/Landung, Grätsche/Aufstehen, Foulreaktion, Einwurf, Standards sowie Keeperbereitschaft, Shuffle, Hechten, bestätigtes Fangen und Erholung. Nutze für seltene vorhandene Aktionen kontrollierte Fixtures; erfinde keine Matchereignisse, um neue Grafik vorzuführen. Beide Füße, beide Angriffsrichtungen und alle betroffenen Kameras prüfen.

Pause/Fortsetzen, Halbzeit, Abpfiff, Wechsel, Wiederanstoß, Rückschau, Neuladen und 2D-Rückfall gehören dazu. Normal und `reduced` mit der tatsächlichen geladenen Laufzeit prüfen. Beispielgrößen sind Desktop sowie 844 × 390 und 931 × 448 im Querformat.

**Fertig, wenn:** Die relevanten bestehenden Suiten bestehen, native Parität ist belegt und Videos/Bilder zeigen weder Bindungsfehler noch neue Fußgleiter, Bodendurchdringungen, Clipping oder versetzte Ball-/Handkontakte.

## 5 Lokalen Kandidaten übergeben

Liefere Änderungsliste, Wiederverwendungs-/Ersatzentscheidung je Asset, Originalasset- und Buildhashes, Import-/Rig-/Materialbericht, Vorher/Nachherbilder, kurze Aktionsvideos, Testprotokolle und einen reproduzierbaren WebGL-Kandidaten. Folge der vorhandenen Identity-/Sync-/Build-/Manifestpipeline; prüfe deren aktuelle Reihenfolge statt historische Chatbefehle zu übernehmen. Neue Dateien müssen auch im Quellenhash und Build enthalten sein.

Miss dieselben Szenen auf derselben Hardware mit gleichem Qualitätsprofil. Erfasse mindestens Framezeiten, Draw Calls, Textur-/Meshspeicher und Downloadgröße relativ zum Anker. Editorbilder und Software-WebGL belegen keine Android-GPU-Leistung. Physische Gerätebefunde gesondert benennen.

Die Anleitung beauftragt einen lokalen prüfbaren Kandidaten. Eine Veröffentlichung folgt einem eigenen Veröffentlichungsauftrag mit Versionsanhebung und Gleichstand von Quelle, Build und Live-Seite.

**Fertig, wenn:** Alle Pflichtnachweise sind vorhanden oder eine konkrete offene Geräte-/Integrationsgrenze ist benannt; vorhandene Assets bleiben für den Rückwechsel verfügbar.

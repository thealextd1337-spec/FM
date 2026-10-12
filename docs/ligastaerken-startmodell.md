# Ligastärken, Karrierestart und Wechselpräferenzen

## Nutzerentscheid vom 12. Oktober 2026

Die Startkader sollen eine erkennbare Hierarchie der Ligaspitzen bilden. Die stärksten Vereine aus England, Spanien, Deutschland, Italien und Frankreich stehen zu Karrierebeginn über den Spitzenvereinen aus Österreich, Schweiz und Türkei. Ab ungefähr der dritten Position innerhalb einer Liga sollen sich die Kaderstärken deutlich stärker überschneiden. Die bestehenden Länderstufen bleiben die Grundlage: A England/Spanien/Deutschland/Italien/Frankreich, B Portugal/Niederlande, C Österreich/Belgien/Türkei, D Schweiz/Griechenland.

Weitere Nutzerpräzisierung vom 12. Oktober 2026: Zum Start gilt diese Grenze strikt. Jeder der zwei stärksten Vereine jeder A-Liga muss stärker sein als jeder der zwei stärksten Vereine Österreichs, der Schweiz und der Türkei. Gleichstand oder eine Umkehrung durch die Startschwankung ist nicht zulässig. Das ist eine Regel für die Startkader; spätere Karriereentwicklung kann die Reihenfolge verändern.

Jeder neue Karrierestart erhält eine kleine Schwankung. Das vorhandene Ziel von ungefähr fünf Prozent Variation der gesamten Startkaderqualität bleibt die Orientierung. Die Vereinsprofile und die erkennbare Länderabstufung bleiben dabei erhalten; innerhalb ähnlich starker Vereine kann sich die Reihenfolge ändern. Derselbe gespeicherte Karriere-Seed muss dieselben Startkader ergeben; Laden oder erneutes Öffnen würfelt nichts neu aus.

Mit tatsächlich guter Entwicklung beziehungsweise erreichter hoher Qualität steigt die Attraktivität eines Wechsels in die Top-Ligen und zu deren sportlich passenden Vereinen. Gehalt, zugesagte Spielzeit und Vereinsniveau bleiben weitere Entscheidungsgründe. Dies ist eine Präferenz, keine automatische Versetzung. Die qualitative Zielregel ist beschlossen; die genaue Gewichtung der Transferpräferenz ist noch festzulegen.

Auf den anschließenden Nutzerauftrag „Setze das um“ sind diese Vorgaben sowie Elite-Grenzen, Startelf-/Kaderbreite, Altersmix, Positionsabdeckung und Schwerpunkte lokal umgesetzt. Die tatsächliche gesamte Startkaderqualität verwendet eine gespeicherte Schwankung von höchstens ±2,5 Prozent. Neue Karriereanlagen prüfen die strikte Kader- und Startelfhierarchie. Vorhandene Spielstände werden nicht neu berechnet. [Umsetzung und aktuelle Nachweise](startkader-umsetzung-v177.md).

## Historischer Messbefund vor der Umsetzung

30 frische native Welten, jeweils 96 Ligavereine. Jugendpool, freie Spieler, Entwicklung und Folgejahre sind ausgeschlossen. Für die Ligavergleiche wird je Welt und Land die gesamte Startkaderqualität aus der besten gespeicherten spielbaren Position jedes Profis gemittelt und geordnet. Die ersten zwei Vereine bilden die gemessene Spitze, Platz 3–8 den übrigen Bereich. Es wird nicht die redaktionelle Vorjahrestabelle verwendet.

| Vergleich | Anteil, in dem der A-Verein stärker ist | Kadervergleiche |
| --- | ---: | ---: |
| Top 2 A gegen Top 2 C | 66,33 % | 1.800 |
| Top 2 A gegen Top 2 D | 78,33 % | 1.200 |
| Platz 3–8 A gegen Platz 3–8 C | 61,17 % | 16.200 |
| Platz 3–8 A gegen Platz 3–8 D | 63,38 % | 10.800 |

Dies sind Vergleiche der Kaderqualität innerhalb derselben Welt, keine simulierten Spiele und keine Siegchancen. Die Werte zeigen bereits Überschneidung ab Platz drei; der Vorsprung an der Spitze ist noch nicht zuverlässig groß. Insbesondere gegenüber Stufe C unterscheidet sich die Spitze nur wenig vom übrigen Bereich. Ein einheitlicher Länderzuschlag für alle acht Vereine bildet die gewünschte Kurve deshalb nicht ausreichend ab.

Für die kleine Startschwankung werden dieselben Vereine zwischen den 30 Seeds verglichen. 1.573 von 2.880 Vereinsstarts (54,62 %) liegen innerhalb von ±5 % des jeweiligen Vereinsmittelwerts dieser Stichprobe. Die mittlere relative Standardabweichung beträgt 6,47 %. Das ist eine Diagnose anhand des Stichprobenmittelwerts, keine bereits definierte Erzeugungsgrenze. Die vorhandene individuelle Spielerstreuung kann die gesamte Kaderqualität stärker verändern als eine kleine zusätzlich gezogene Vereinsschwankung; beides muss zusammen kalibriert werden.

## Umsetzungskriterien für den nächsten Schritt

- Der Länderunterschied wird bei den Spitzenvereinen stärker gewichtet und ab ungefähr Rang drei deutlich abgeschwächt. Die Elite-Spitze bleibt selten; die bislang offene Elite-Zielquote wird durch einen stärkeren Ligaspitzenabstand nicht automatisch angehoben.
- Eine kleine gespeicherte Startvariation ergänzt die Vereinsidentität. Gemessen wird die resultierende gesamte Kaderqualität, einschließlich der zufälligen Einzelspieler, nicht nur der gezogene Vereinsfaktor.
- Ein neu erzeugtes Weltmodell speichert die gewählten Parameter und Zufallswerte beim Start. Bestehende Welten behalten ihre Werte, Laden ergänzt keine alten Kader oder nachträgliche Wechselpräferenzen.
- Die Spielerentscheidung gewichtet tatsächliche Qualität, Liga- und Vereinsniveau gemeinsam mit Gehalt und Einsatz-Zusage. Die bestehende Gebots-/Zustimmungskette bleibt dafür die zuständige Stelle. Sowohl freie Spieler als auch umworbene Profis müssen dieselbe Präferenz berücksichtigen.
- Die Startgrenze gilt ohne Ausnahmen: alle 60 Paarvergleiche zwischen den zehn A-Spitzenvereinen und den sechs Spitzenvereinen Österreichs/Schweiz/Türkei müssen je Welt strikt zugunsten des A-Vereins ausfallen. Die Startschwankung darf keinen dieser Vergleiche umkehren oder einen Gleichstand erzeugen. Für Platz 3–8 gilt weiterhin die gewünschte Überschneidung.

Der Prüflauf `node work/measure-league-strength-shape.cjs --check-hierarchy` schreibt die Befunde und endet bei einer Verletzung mit Exitcode 1. Vor der Umsetzung gab es 518 Verletzungen bei 1.800 Vergleichen, mindestens eine in jeder der 30 Welten. Der neue Erzeugungsstand besteht alle 1.800 Vergleiche einschließlich Startelfprüfung. Die Messprüfung besteht einschließlich gezielter Fälle für Gleichstand und umgekehrte Spitzenhierarchie.

## Bisherige Transferregeln der Erzeugungskennung 1

Welten mit Erzeugungskennung 1 behalten das erforderliche Gehalt aus Gehaltsreferenz, Vereinstradition/Risiko, Einsatz-Zusage, Vertragsdauer und Tradition des abgebenden Vereins. Konkurrierende Angebote verwenden Gehalt, Dauer, Zusage und Tradition. In neuen Welten mit Kennung 2 ergänzen `v66Consent` und `v66BidAppeal` nun die Ligastufe und aktuelle Kaderqualität, gewichtet mit tatsächlich erreichter Spielerqualität. Die Transferlistenauflösung verwendet dieselbe Kette. [Sportliche Wechselpräferenz](startkader-umsetzung-v177.md#transfers).

## Prüfungen und Reproduktion

Im Produktionscheckout:

```powershell
node work/test-start-roster-strength.cjs
node work/measure-start-roster-strength.cjs --worlds=30
node work/test-league-strength-shape.cjs
node work/measure-league-strength-shape.cjs
node work/render-league-strength-shape.cjs
```

Die bestehende Messung prüft vollständige erneute Kadererzeugung für denselben Seed, native Weltvalidierung und unveränderte Produktquellhashes. Die neue Formprüfung sichert die Trennung von Top 2 und Platz 3–8, Kadervergleiche nur innerhalb derselben Welt, Ausschluss reiner Pokalvereine, pro Verein gemessene Startvariation, Gleichstände und fehlerhafte Eingaben. Die interaktive Auswertung wurde bei 390/728 Pixeln in Dunkel/Hell einschließlich Umschaltung und horizontalem Überlauf geprüft. [Interaktive Auswertung](../outputs/start-roster-strength/league-shape.html), [Interne Messdaten](../outputs/start-roster-strength/league-shape.json), [Startkaderbericht](startkader-staerken-20261012.md).

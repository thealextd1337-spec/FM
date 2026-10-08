# Meshy-Arbeitspakete für den Matchausbau

Stand: 8. Oktober 2026. Aufgaben, Reihenfolge und Liefervertrag festgelegt. Der Bodenpass-/Annahmepilot MSH-02 ist für die inzwischen gewählte Unity-Darstellung lokal ausgeführt: zwei Quellbewegungen, tatsächlich 20 Credits, Retargeting auf die Originalfigur und geprüfte Demo-/Vereinsweltanbindung. [Lieferung und Abnahmegrenzen](platform/unity-football-pilot.md). MSH-03–05 bleiben weitere Pakete; mobile Lieferoptimierung MSH-01 ist damit nicht abgeschlossen. Grundlage ist der [Match-Ausbauplan](match-ausbau-plan.md).

## Verbindliche Grundlage und Zuständigkeit

Die vorhandene Nutzerfigur und ihr Stil bleiben die Grundlage. Kein neuer Feldspieler oder Torwart wird allein wegen einer fehlenden Animation erzeugt. Alle Aktionen verwenden dasselbe Grundskelett. Varianten für Körperaussehen und Trikot bleiben zunächst beim vorhandenen Verfahren.

Aktuell geladen: `dist/players/football-v130.glb`, `calibration-v130.json` und `cloth-mask.png`. Die GLB besitzt einen Skin mit 28 Gelenken, 12.668 Dreiecke, 9.725 Vertices, ein Körpermaterial, vier eingebettete Bilder und 34 Clips. Dateigröße: 21.445.448 Bytes. 30 Clips besitzen Kalibrierungen, drei Jubelclips werden separat aktiviert; der historische `Charged_Spell_Cast` ist nicht als Matchaktion aktiviert. Diese Zahlen stammen aus der aktuellen GLB, nicht aus älteren Konzept-B-Dokumenten.

Meshy übernimmt geeignete Ausgangsmodelle, Texturen, Geometrievereinfachung, Rigging bei tatsächlich fehlendem Rig sowie Quellbewegungen aus Katalog oder Textbeschreibung. Lokale Arbeit übernimmt Skin-/Rigprüfung, Retargeting, Kontaktmarker, zulässige Übergänge, Textur-/Clipkomprimierung und Browser-/Unityimport. Die Matchengine entscheidet über Bewegung, erreichbaren Kontakt, erlaubte Handaufnahme, Ballflug und Ergebnis.

## Wiederverwendung vor neuen Aufträgen

| Gruppe | Verbindlich vorhandene Basis | Was neu geprüft wird |
| --- | --- | --- |
| Gehen, Laufen, Sprinten | `walking`, `running`, `run_fast4`, `run_fast6`, `sprint_forward` | Keine neue Grundlokomotion; Ballführung bei Bedarf als eigener Versuch. |
| Stand, Bremsen, Wenden, Rückwärtsbewegung | Bestehende Idle-, Brake-, Turn- und Back-Clips | Übergänge und Fußbindung lokal prüfen, nicht dieselben Clips neu bestellen. |
| Schuss | `shot_meshy`, bisher Meshy-Aktion 410 | Pass-/Flankenfamilie und Volley bekommen eigene Quellbewegungen. |
| Torwart | `keeper_low_meshy`, `keeper_high_meshy`, `keeper_dive_meshy`, `keeper_rise_meshy`, `keeper_shuffle_meshy`, `keeper_ready_meshy` | Bestehende Parade-/Fang-/Bereitschaftsbasis erhalten; neues Abspiel nur bei konkreter Lücke. |
| Sturz und Stolpern | `foul_fall_meshy`, `foul_stumble_meshy` | Keine neue Foulreaktion bestellen; Fußballblock/Grätsche gesondert. |
| Jubel | `celebrate_fist`, `celebrate_arms`, `celebrate_victory` | Für diesen Ausbau keine zusätzlichen Jubelclips. |

`keeper_shuffle_meshy` und `keeper_ready_meshy` stammen aus derselben Text-to-Motion-Quelle und lokalen Ableitungen. Sie zählen nicht als zwei neue Generierungsaufträge. Bestehende hoch/tief/seitlich gespiegelte Paraden werden zuerst mit korrekter Kontaktlogik geprüft.

## Festgelegte Pakete und Reihenfolge

### MSH-01: Assetvertrag und kleine mobile Laufzeitpakete

Pflichtpaket, unabhängig von der Engineentscheidung. Bestehende Figur, Rig, Texturen, Clipnamen und Herkunft inventarisieren; unverändertes Masterasset erhalten. Browser-GLB und Unityimport müssen dieselbe Figur und dieselben Kontaktmarkierungen wiedergeben. FBX wird nur als zusätzliche tatsächliche Importlieferung benötigt, wenn der Unityweg es verlangt; GLB bleibt das Austausch-/Browserformat.

Mobile Lieferziele: 1K-Texturvariante als erster Kandidat, 2K als höhere Qualitätsstufe; bestehende 4K-Quelle bleibt Master. Aktuelle Farb-PNG hat rund 9,83 MB Dateiumfang. Material und Texturen werden zwischen Figuren geteilt, nicht zwölfmal unabhängig geladen. Unbenutzte Clips kommen aus dem Laufzeitpaket, bleiben im Archiv. Laufzeitkompression wird je Plattform nachgewiesen.

Geometrievarianten: bestehende 12.668 Dreiecke als Referenz, ungefähr 6.000 und 3.000 Dreiecke als erste LOD-Kandidaten. Diese Zahlen sind Lieferziele, keine FPS-Zusage. Erst lokale Vereinfachung mit erhaltenem Skin prüfen. Wenn Meshy Remesh benötigt wird, vorhandenes Modell als Quelle verwenden. Rig, UVs und Skinweights sind nach einem Remesh nicht als automatisch erhalten anzunehmen; Übertragung und Deformationsprüfung sind lokale Aufgaben. Keine neue Riggingrunde als automatische Folge bestellen.

Abnahme: identische Silhouette im TV-Blick, erkennbare Trikotnummern/-farben, Knie-/Schulterverformung, ruhige Hände/Füße, gleiche Kontakte auf allen Stufen, zwölf Figuren und Langzeittest auf Pixel 9 Pro XL/9a. Ein kleineres Modell allein belegt keine ausreichende Mobilperformance.

### MSH-02: Zwei Quellclips als erster Kontaktpilot

Erster neuer Animationsumfang: **Innenseitpass rechts** und **kontrollierte Bodenannahme rechts**. Erst Katalog und vorhandene Dateien prüfen. Fehlt eine geeignete Bewegung, Text to Motion verwenden. Noch keine komplette Animationsfamilie vor erfolgreicher Übertragung auf das vorhandene Rig erzeugen.

- Pass: kurze Vorbereitung, stabiler linker Standfuß, rechter Innenseitkontakt vor dem Körper, vollständiger Nachschwung, Rückkehr zum Laufen.
- Annahme: Blick zum ankommenden Ball, rechter Fuß nimmt den vorgestellten Bodenball auf, kontrollierter erster Kontakt, Übergang in die nächste Bewegung.
- Ausgangsclips jeweils 2 Sekunden für Text to Motion; nutzbare Phase lokal schneiden und markieren. Ball ist nur Bezugspunkt der Körperbewegung, kein mitgeneriertes oder an den Clip gebundenes Gameplayobjekt.
- Linke Varianten werden zuerst durch Spiegelung geprüft; eigene Generierung nur bei nachgewiesen unbrauchbarer Spiegelung.

Arbeitsbriefs für Text to Motion, jeweils unter dem dokumentierten Promptlimit:

> Soccer player performs one short right-foot inside-foot pass. Left foot planted, small backswing, right foot contacts an imaginary ground ball in front, natural follow-through, returns to ready stance. Full body, in place, no root travel, no celebration.

> Soccer player controls an incoming imaginary ground ball with the inside of the right foot. Balanced stance, soft touch in front of the body, short follow-through, returns to ready stance. Full body, in place, no root travel, no kick or celebration.

Meshy liefert eine Quellbewegung; korrekter Fußballkontakt wird erst durch Prüfung und begrenzte lokale Kontaktanpassung bestätigt. Bei unpassender Ausgabe nicht automatisch mehrfach neu erzeugen.

Abnahme: Retargeting auf 28 Gelenke, kein Körper-/Fußspringen, Kontaktpunkt erreichbar, markierte Vorbereitung/Freigabe/Nachbewegung, passende Übergänge und gleicher Ablauf in Browser-/Unityprobe. Erst wenn beide Piloten bestanden sind, weitere Familien bearbeiten.

### MSH-03: Ballaktionsfamilie erweitern

Nach dem Pilot, parallel zur gewählten Matchengine. Festgelegt sind folgende funktionale Lieferungen:

| Kennung | Bewegung | Quellauftrag und Abnahme |
| --- | --- | --- |
| PASS-HIGH | Hoher Pass beziehungsweise Flanke | Ein Ausgangsclip mit klar anderer Aushol-/Nachbewegung; Chip und Flanke zuerst aus dieser Basis ableiten. Ballhöhe/-tempo bleiben Enginezustand. |
| HEADER-STAND | Stehender Kopfball | Kurzes Ausholen mit Rumpf/Hals, Stirnkontakt, stabiler Stand und Rückkehr. Für Weiterleitung und kurzen Abschluss wiederverwenden. |
| HEADER-JUMP | Gesprungener Kopfball | Vorbereitung, Absprung, Stirnkontakt, vollständige Landung; keine erzwungene horizontale Figurbewegung. |
| VOLLEY | Fußabschluss an einem höheren Ball | Standbein, erreichbarer Fußkontakt und sicherer Nachschwung; vorhandenen Schuss zuerst als Ableitung prüfen. |
| THROW-IN | Fußball-Einwurf | Ballbezug hinter/über dem Kopf, beide Arme, beide Füße am Boden bis zur Freigabe, natürlicher Ausklang. |

Eigene Brust-/Oberschenkelannahme wird nur ergänzt, wenn diese Aktionen in der Kontaktlogik tatsächlich benutzt werden. Dribbelclip ist ein gesonderter Verbesserungsversuch nach dem Pilot; vorhandene Laufbewegung plus Fußanpassung bleibt die erste Basis. Keine neue Animationspflicht für nicht implementierte Spielaktionen erzeugen.

### MSH-04: Verteidigen und Torwartabspiel

Nach dem Pilot kann dieses Paket parallel zu MSH-03 laufen. Vorhandene Keeperparaden und Foulreaktionen bleiben erhalten.

- BLOCK: kurze ballseitige Blockbewegung mit begrenzter Bein-/Körperstreckung und Rückkehr; Kontakt muss scheitern dürfen.
- SLIDE: Fußballgrätsche mit Ansatz, Gleit-/Kontaktphase und vollständiger Erholung; Ortsbewegung durch Simulation. Keine automatische Umwandlung eines Kampf-Ausweichclips in Fußballkontakt.
- KEEPER-ROLL: bodennahes Ausrollen zu einem Mitspieler; Abwurf und weitere Spezialabspiele erst, wenn die Engine sie unterstützt. Vorhandener Fußabspielclip bleibt nutzbar.

Ausführungsliste nach Prüfung konkreter Wiederverwendung verkürzen. Fingerfeinmodellierung, neues Keepermodell, allgemeine Kampf-/Akrobatikclips und zusätzliche Jubel gehören nicht zu diesem Pflichtumfang.

### MSH-05: Texturen und Ausstattung gezielt ergänzen

Bestehende Texturen, Kleidungsmasken und Trikotverfahren zuerst optimieren. Meshy Retexture nur bei klar benanntem sichtbarem Mangel am gleichen Modell. Vorgaben: vorhandene Identität/Stil, kompatible UVs, neutrale Ausgangskleidung, lokal steuerbare Vereinsfarben und Nummern; keine zwölf unabhängigen kompletten Textursätze.

Ball, Tor und einfache Stadiongeometrie sind bereits vorhanden und werden nicht neu erzeugt. Ein neues Zubehör-/Stadionobjekt erhält erst bei späterem konkretem Bedarf einen Meshy-Modellauftrag samt Polygon-/Materialbudget. Die Enginevergleichsprobe verwendet die vorhandene Ausstattung.

## Liefervertrag für jeden Clip

- Dieselbe Rigreferenz und überprüfte Körperproportionen, skinnierte Quellbewegung beziehungsweise extern retargetbarer Clip; keine stillschweigende zweite Figurenbasis.
- Metermaß, Körperhöhe, Bodenbezug, Vorwärtsrichtung, Gelenknamen/-hierarchie und Bindepose im Manifest festhalten. Unterschiedliche Provider-Skelette erhalten eine geprüfte Zuordnung; gleiche Herkunft garantiert keine identischen Knochen. Browser-/Unitymaterialien haben eigene Adapter.
- Simulation steuert Standort und Blickrichtung. Horizontale Rootbewegung und zusätzliche Provider-Yaw lokal entfernen beziehungsweise ausdrücklich aufteilen; Sprung-/Körperhöhen fachlich markieren. Eine Promptforderung garantiert diese Eigenschaften nicht.
- 30 Samples pro Sekunde als erster Assetstandard, unabhängig von Grafikbildrate; Interpolation, Keyframe-/Clipkompression und Qualität danach prüfen.
- Metadaten: Quellclip/-Task, Dauer, Spiegelbarkeit, verwendeter Fuß/Hand, Vorbereitung, Kontaktfenster, Freigabe, Nachbewegung, erlaubte Übergänge und gegebenenfalls Loopgrenze. Zeitangaben werden am tatsächlichen Ergebnis gemessen.
- Original und abgenommene Ableitung getrennt halten. SHA-256, Provider-/Parameterstand und tatsächliche Credits dokumentieren. Getrennte Fachpakete ändern nicht gleichzeitig das gemeinsame Rig oder Laufzeitasset.
- Eine Animation darf ein verfehltes Kontaktangebot zeigen. Sie bestimmt weder Ballbesitz noch Tor, Parade, Foul oder Abseits. Keine zusätzlichen Spielzufallsziehungen im Renderer.

## Meshy-Fähigkeiten, CLI und Kostengrundlage

Am 6. Oktober 2026 meldet der Nutzer ungefähr 4.000 verfügbare Meshy-Credits pro Monat. Dieses Kontingent dient der Budgetplanung; API-Verfügbarkeit, tatsächliches Restguthaben und konkrete Auftragskosten werden vor Ausführung geprüft. Vorhandene Assets weiterverwenden und Versuche gezielt begrenzen; das monatliche Kontingent ist kein Verbrauchsziel.

Am 5. Oktober 2026 offiziell geprüft: Katalogaktionen und generierte Text-to-Motion-Clips können über die Animation API auf ein geeignetes Rig übertragen werden. Text to Motion erzeugt zunächst einen unabhängigen Bewegungsclip; Dauer 2–10 Sekunden in halben Sekundenschritten. `prime` liefert FBX, `swift` BVH. Die dokumentierte Animation API unterstützt `motion_task_id`; ein Retarget kann GLB-only liefern. Ein FBX-Export ist dabei nicht als garantiert vorhanden anzunehmen. Quellen: [Text to Motion](https://docs.meshy.ai/en/api/text-to-motion), [Animation API](https://docs.meshy.ai/en/api/animation).

Die installierte CLI 0.4.0 beschreibt Text-to-Motion-Erzeugung. Die konkrete CLI-Anbindung eines `motion_task_id` an das vorhandene Rig ist vor der ersten Ausführung zu prüfen; der lokale Hilfeaufruf lieferte bei dieser Planung kein Ergebnis. Alternativ wird der tatsächlich erzeugte FBX/BVH-Quellclip lokal auf das bestehende Rig übertragen. Alle Meshy-APIoperationen bleiben beim vorgesehenen CLI-Workflow, kein eigener Token-/HTTP-Ersatzpfad.

Vor providerseitiger Übertragung zusätzlich eine gültige zugehörige Rig-Task-ID feststellen. Die aktive, lokal bearbeitete GLB allein garantiert diesen APIbezug nicht. Wenn er fehlt oder das Ergebnis vom lokalen Master abweicht, Quellmotion lokal retargeten; kein neues kostenpflichtiges Rig allein zum Erfüllen eines APIparameters erzeugen.

Preisschätzung laut [offizieller Preisliste](https://docs.meshy.ai/en/api/pricing), gelesen am 5. Oktober 2026: Text to Motion `prime` 10 Credits pro Clip, `swift` 3; Kataloganimation 3 pro Aktion; Remesh 5; Rigging 5; Convert 1; Retexture 10 für 2K/4K. Der Zwei-Clip-Pilot benötigt in `prime` damit **20 Credits für die Quellbewegungen**. Ein zusätzliches Retargeting/Formatstufe ist darin nicht enthalten; deren konkreten Preis vor Auftrag prüfen. Weitere Familien bleiben als festgelegter Bedarf mit Kosten nach genauer Clip-/Wiederverwendungsliste. Aus einer verfügbaren Kontofunktion oder einem Guthaben wird kein unbegrenztes Wiederholungsbudget abgeleitet.

Der aktuelle Auftrag ist die Festlegung. Produktionsstart erfolgt anhand dieser konkreten Pakete und der bereits gegebenen Meshy-Autorisierung, mit Prüfung der jeweiligen Kosten-/Budgetdeckung. Unbekannte Auftragsergebnisse anhand vorhandener IDs fortsetzen; keine Doppeljobs. Quellen und Grenzen: [Projektworkflow](meshy-workflow.md), [Remesh](https://docs.meshy.ai/en/api/remesh), [Retexture](https://docs.meshy.ai/en/api/retexture), [Rigging](https://docs.meshy.ai/en/api/rigging).

## Parallelbearbeitung

MSH-01 und Pilotbriefs starten unabhängig von der Enginewahl. Eine Assetspur besitzt Modell/Rig/LOD/Texturen, eine Animationsspur besitzt Quellen und Metadaten; Browser-/Unityspuren prüfen ausschließlich deren versionierte Lieferungen. Die erste gemeinsame Pilotabnahme ist das Gate vor zusätzlichen Clipfamilien.

Bei den vorhandenen vier Instanzen ersetzt die Asset-/Animationsspur zeitweise eines der drei Fachpakete. Eine fünfte gleichzeitig arbeitende Instanz ist nicht zugesagt. Nach dem Pilot können MSH-03 und MSH-04 getrennt laufen, während eine Integrationsspur Übertragung, Kontakte und Leistungsprüfung übernimmt. Umfang und Dateiverantwortung vor jeder Welle festhalten.

Fertig ist ein Paket erst mit heruntergeladenen Dateien, geprüfter Vorschau soweit verfügbar, tatsächlicher Rig-/Kontaktprobe, dokumentierten Credits und überprüfter Browser-/Unitylieferung für den jeweiligen Bedarf. Ein erfolgreich abgeschickter Meshy-Task genügt nicht.

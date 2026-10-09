# Release 119: Diagnose der Passvorbereitung

Stand: 10. Oktober 2026. Diagnose abgeschlossen; kein Produktionscode geändert.

## Tatsächlich ausgeführte Proben

Standardfeld mit fünf beziehungsweise sechs Feldspielern, Karriere `shot119-0`, PRNG-Start `169032`, erste eigene Ligapartie `S1:GER:LEAGUE:R1:GER-6-GER-2:1`. Vier vollständige Stock-Läufe vergleichen je Konfiguration unbeobachtete und beobachtete Ausführung. Zwei zusätzlich erlaubte Beobachterläufe erfassen die tatsächlichen Lane-/Abseits-Rückgaben und prüfen den vorhandenen nativen Laufpunkt geometrisch. Keine privaten Schusskandidaten, neue Matrix oder Änderung von Uhr, Positionen oder Zufallsfolge.

Alle beobachteten Läufe stimmen vollständig mit den ursprünglichen unbeobachteten Digests überein: Ergebnis, Statistiken, Ereignisse, Belastung, physischer Zustand, Fortsetzungszustand sowie PRNG-Endpunkt und Anzahl der Zufallsziehungen. Alle geladenen Quellbytes stimmen mit dem Baseline-Stand überein.

## Befund

| Beobachtung | Standard 5 | Standard 6 |
| --- | ---: | ---: |
| Tatsächliche wartende Turn-Entscheidungen | 167 | 220 |
| Nur Winkel / nur Geschwindigkeit / beides | 52 / 27 / 88 | 82 / 37 / 101 |
| Wartende Move-Zeit: nur Winkel / nur Bremsen / beides | 3,95 / 2,05 / 8,80 s | 4,55 / 1,90 / 8,50 s |
| Erfolgreiche Drehpässe | 17 | 22 |
| Erfolgreiche Vorbereitung, Mittel | 0,521 s | 0,434 s |
| Erfolgreiche Freigabegeschwindigkeit, Mittel | 0,524 m/s | 0,390 m/s |
| Abbruch wegen ungültigem Ziel | 50 | 31 |
| Sofortige Neustarts, davon gleicher Empfänger | 40, davon 33 | 24, davon 14 |
| Beobachtete Ablaufabbrüche bei 2,2 s | 0 | 0 |
| Geschlossene Vorbereitungsdauer, Summe native Uhr | 18,50 s | 16,55 s |
| Tatsächliche Pending-Move-Zeit, Summe `.05`-dt | 17,85 s | 15,60 s |
| Davon Winkel-/Bremswartezeit | 14,80 s | 14,95 s |
| Alle Simulationsschritte einschließlich normaler Pausen | 218,55 s | 210,35 s |

Der gemessene Engpass rechtfertigt keine pauschale Anhebung der Geschwindigkeitsgrenze. Ausrichtung verursacht häufiger eigenständiges Warten; eine erfolgreiche Vorbereitung von etwa einer halben Sekunde kann sinnvoll sein.

Ein konkreter widersprüchlicher Prüfpunkt ist nachgewiesen: Die Optionsauswahl und der tatsächliche Bodenpass verwenden `v157PassLead`, während `v157ContinueTurn` die Lane zur aktuellen Position des Empfängers prüft. Bei sämtlichen 50/31 Zielabbrüchen war diese tatsächlich geprüfte Lane geschlossen. Zusätzlich lag einmal Abseits vor; kein Slide, fehlender Empfänger oder Besitzerkonflikt wurde an diesen Abbruchstellen beobachtet.

Im selben Snapshot war die Lane zum nativen Laufpunkt bei 43/19 Abbrüchen selbst mit der strengeren Optionsdistanz von 1,4 m offen, bei 45/20 mit 1,2 m. Nach 32/13 der strengeren Fälle wurde sofort derselbe Empfänger erneut vorbereitet. Für 32/12 davon wurde zusätzlich die tatsächliche offene Options-Lane bei dieser erneuten Auswahl im identischen Zeitstempel aufgezeichnet. Damit ist der häufige Abbruch mit unmittelbarer Neuwahl belegt. Die offene Lane garantiert keinen gelungenen Pass.

Die tatsächlich bestätigten Passkontakte folgen im Mittel 0,644/0,774 s nach der Freigabe; die native Ballannahme dauert im Mittel 0,259/0,262 s. Der Beobachter erfasst auch die nächste Freigabe des Empfängers. Deren Besitzkontinuität wurde nicht verfolgt: lange Abstände können Ballverlust, erneuten Ballgewinn oder Unterbrechungen enthalten und sind keine belegte Vorbereitungsdauer. Allgemeine Besitzzeit wird nicht ausgewiesen.

## Enger bestehender API-Punkt

- `dist/world-offensive-quality-v157.js:191`: Optionsauswahl mit beobachtetem Laufpunkt; Lane-Filter in Zeile 193.
- `dist/world-offensive-quality-v157.js:139`: Beginn der Drehvorbereitung.
- `dist/world-offensive-quality-v157.js:45`: Pivot-Ausrichtung auf das aktuell gespeicherte Ziel.
- `dist/world-offensive-quality-v157.js:151`: Lane-Prüfung und anschließende Winkelfreigabe in der Fortsetzung.
- `dist/world-offensive-quality-v157.js:155`: vorhandener `releaseGuard` und Dispatch zu den nativen Passfunktionen.
- `dist/pitch-v55.js:194`: tatsächlicher Bodenpass mit erneut berechnetem `v157PassLead`; Ausführungsfehler und realer Kontakt bleiben maßgeblich.

Der eng begrenzte nächste private Kandidat kann bei gewöhnlichen Bodenpässen die anfängliche Drehprüfung, Pivot-Ausrichtung und Fortsetzungsprüfung auf denselben vorhandenen nativen Laufpunkt beziehen. Geschwindigkeitsgrenze, Schussbereiche, Carry-Entscheidungen und Zielquoten sind durch diesen Befund nicht zur Änderung freigegeben. Root besitzt die Produktionsentscheidung; der native Agent führt den privaten Kandidaten aus.

## Abnahmegrenzen des privaten Kandidaten

1. Nur gewöhnliche Bodenpässe vergleichen; Standards, hohe Bälle, Raum-/Kopfballpässe und Torhüter behalten ihre vorhandenen Wege.
2. Reale Besitzer-, Empfänger-, Slide- und Abseitsprüfungen erhalten. Eine sich schließende Lane darf weiter einen echten Abbruch auslösen.
3. Bestehenden `releaseGuard`, native Passfehler, Zufallsziehungen, Flug und tatsächliche Kontaktbestätigung verwenden. Kein erzwungener Empfang, neue Uhr oder versetzter Spieler.
4. Gegen exakt dieselben Konfigurationen und Seeds ausführen und Änderungen an Neuwahlen, tatsächlicher Wartezeit, Pässen, Schüssen und Ergebnissen ehrlich zeigen. Zwei Diagnosefixtures sind keine allgemeine Balance-Abnahme.
5. Vor einer Produktionsintegration zusätzlich gespeicherte Fortsetzung, Halbzeit/Abpfiff und Altpfad prüfen. Root entscheidet über den bestehenden Kompatibilitätsmarker und die Veröffentlichung.

## Evidence

- `work/diagnose-pass-preparation-v119.cjs`: ursprünglicher Vier-Lauf-Beobachter.
- `work/diagnose-pass-lanes-v119.cjs`: zwei ergänzende Lane-Proben mit Digestvergleich zur vorhandenen Baseline.
- `outputs/3d-quality/shot-volume-v119/pass-preparation-diagnosis.json`: unveränderter Rohreport; SHA-256 `d2ce080b26073e989995870b2fa04b843c4be8736c66771c8b1fb6172684bf70`.
- `outputs/3d-quality/shot-volume-v119/pass-lane-diagnosis.json`: ergänzende tatsächliche Aufrufe und Snapshots; SHA-256 `b8ba570ba99bcdf830687459d177a6f9c9de8ec9970cae85049fb7d6083d9c56`.
- `outputs/3d-quality/shot-volume-v119/pass-preparation-summary.json`: abgeleitete kompakte Zusammenfassung mit Eingangs-, Runner- und Quellhashes; SHA-256 `f35a440549838171c731d6fd6be98baeb56bc18a4ca55b772bace42b43d7476d`.

Der erste Rohreport enthält eine am Abpfiff offene Observer-Episode ohne erfundene Enddauer. Der Zusatzbeobachter kennzeichnet denselben Fall ausdrücklich als `open-at-final-whistle`. Alle eigenen Browserkontexte und Serverprozesse wurden geschlossen.

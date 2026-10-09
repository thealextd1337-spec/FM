# Release 119: Schuss-Baseline aus sechs Ländern

Stand: 10. Oktober 2026. Zwölf vollständige Stock-Partien, keine Kandidaten oder Produktionsänderungen.

## Auswahl und Ausführung

Die geladenen `v61Countries` und `v61Catalog` liefern die sechs Länder und ihre tatsächlichen Ligavereine. Die vorhandenen nativen Funktionen `v62CountryLeague` und `v62Table` bestimmen für jedes Land den Tabellenplatz 2 zum Saisonbeginn. Die danach erzeugte Karriere bestätigt diesen Rang und spielt ihre tatsächliche erste eigene Ligapartie. Dieser Anfangsrang verwendet die native Gleichstandssortierung; er bedeutet nicht zweitstärkster Kader.

Pro Land werden derselbe Careerseed `worldsample119-<Land>` und dieselbe Partie mit Standardfeld/fünf Feldspielern sowie großem Feld/sechs Feldspielern gespielt. Jede Ausführung erhält ein frisches privates Browserprofil, PRNG-Start `169032` und `Date.now = 1791540000000`. ISO-Speicherzeitstempel aus `new Date()` werden nicht als Kalibrationsdaten verwendet.

Karriere, Kader, Sponsorauswahl, Transferfenster-Abschluss, Spielzustand, physischer Controller, Halbzeit und Buchung folgen den vorhandenen nativen Funktionen. Taktik und Aufstellung werden vom Runner nicht geändert; normale KI-Anpassungen und Auswechslungen bleiben aktiv. Es werden keine Stages 6–9, zusätzlichen Schuss-/Laufparameter, JSON-Fortsetzungsversuche oder künstlichen Ergebnisse eingeschleust.

## Tatsächliche Ergebnisse

Alle Angaben betreffen die Gesamtschüsse beider Teams.

| Land | Gewählter Verein | Tatsächliche Partie, Heim – Auswärts | Standard5: Schüsse / aufs Tor / Ergebnis | Groß6: Schüsse / aufs Tor / Ergebnis |
| --- | --- | --- | --- | --- |
| England | ENG-1 | ENG-1 – ENG-6 | 4 / 1 / 1:0 | 6 / 2 / 1:1 |
| Spanien | ESP-3 | ESP-4 – ESP-3 | 8 / 5 / 0:3 | 4 / 2 / 1:0 |
| Italien | ITA-2 | ITA-2 – ITA-4 | 2 / 0 / 0:0 | 1 / 1 / 0:0 |
| Deutschland | GER-1 | GER-1 – GER-5 | 3 / 0 / 0:0 | 2 / 1 / 0:0 |
| Frankreich | FRA-6 | FRA-6 – FRA-1 | 5 / 3 / 2:1 | 3 / 0 / 0:0 |
| Portugal | POR-2 | POR-1 – POR-2 | 4 / 2 / 1:0 | 3 / 2 / 1:0 |

| Zusammenfassung | Spiele | Schüsse im Mittel | Schussbereich | Aufs Tor im Mittel | Tore im Mittel |
| --- | ---: | ---: | --- | ---: | ---: |
| Standard5 | 6 | 4,33 | 2–8 | 1,83 | 1,33 |
| Groß6 | 6 | 3,17 | 1–6 | 1,33 | 0,67 |
| Gleich gewichtete Gesamtprobe | 12 | 3,75 | 1–8 | 1,58 | 1,00 |

Die niedrige Schusszahl ist damit auch außerhalb des bisher kalibrierten deutschen Duells beobachtet. Die Probe erreicht nicht den gewünschten Bereich von 10–16 Gesamtschüssen im Mittel. Sie ist eine Baseline und keine Kalibration oder Abnahme dieses Ziels.

Die eigenen Manager starten durchgehend mit `2–2–1` beziehungsweise `2–2–2`. Die gegnerischen Anfangsformationen variieren tatsächlich: auf dem Standardfeld `3–1–1`, `1–3–1` und `2–2–1`, auf dem großen Feld `3–2–1`, `2–3–1` und `2–2–2`. Die Gegner besitzen unterschiedliche native Einstellungen für Kurz/Variabel/Direkt sowie Abwartend/Ausgewogen/Früh. Die vollständigen Teams, Taktiken und physischen Press-/Direktwerte stehen im Evidence.

## Konsistenzprüfungen

Alle zwölf Spiele sind physisch beendet und tatsächlich im Weltkalender gebucht. Pro Heim-/Auswärtsseite stimmen native Spielerschüsse, `match.shots`, `v65`-Spielzustandsstatistiken und `matchRecord.players` überein. Abschlüsse aufs Tor stimmen zwischen physischem Zustand und Spielzustand überein. Spieler-Tore und der autoritative Spielstand werden getrennt geprüft; der Spielstand stimmt mit Spielzustand, Matchbuchung und Fixture-Ergebnis überein.

Die tatsächliche neue P02-Ledger ist in jedem Fall aktiv. Insgesamt liegen 13.803 konsumierte Ledger-Ereignisse innerhalb ihrer realen gespielten Minutenbereiche; am Abpfiff verbleibt keine ausstehende Intervall-/Event-Buchung. Native P02-Verarbeitung und Abschluss verursachen keine Fehler. Dies ist keine zusätzliche Beobachtung jedes ursprünglich gequeueten Kontakts, sondern eine Prüfung der tatsächlichen konsumierten Ledger und normalen Fehlergrenzen.

Die `.05`-Simulationsschritte summieren sich je Partie auf 163,25–253,30 Sekunden einschließlich regulärer Pausen, Standards und Torunterbrechungen. Diese Dauer ist kein Geräte- oder Renderleistungsbenchmark.

Die 153 unmittelbar referenzierten Quell-/Stylesheet-/Indexdateien sind während der Browserläufe eingefroren; ihre SHA-256-Hashes stimmen vor und nach der Probe überein. Alle eigenen Browserkontexte und Serverprozesse wurden geschlossen. Nach genau zwölf Spielen wurde gestoppt.

## Aussagegrenzen

- Nur ein ausgewählter Verein und seine erste erzeugte Ligapartie je Land; keine vollständige Kader-, Formations- oder Saisonverteilung.
- Standard5 und Groß6 verändern zugleich Feldgröße und Spielerzahl. Der Mittelwertunterschied isoliert keinen dieser beiden Einflüsse.
- Anfangsformationen der eigenen Manager variieren hier nicht. Reale Gegnervariation ersetzt keine vollständige Taktikstichprobe.
- Keine menschlichen Spielstände, Produktionsänderungen, neue Kalibrationsmatrix, Unity-/Editor-/Build- oder Android-Arbeit.

Root besitzt die Entscheidung über weitere private Experimente und Veröffentlichung. Diese Baseline rechtfertigt keine Schussquote oder ungeprüfte Parametererhöhung.

## Evidence

- `work/check-shot-volume-world-sample-v119.cjs`; SHA-256 `1d2390d8ff1e5e58c85a34cbf55bb0e35d45f2f806a41194899f6cae61dc80af`.
- `outputs/3d-quality/shot-volume-v119/world-sample.json`; SHA-256 `11321a066b5b68329cd3382044fe46e5ac2579631ac22ca6c761df33e40a6169`.
- `outputs/3d-quality/shot-volume-v119/world-sample-summary.json`; SHA-256 `f136fd985d23e2c9d64b5bdc44cb1b047f864a34804bbe87d52f35be45aec1c6`.

Beide Reports enthalten alle zwölf Fälle, tatsächliche Club-/Fixture-IDs, Feldparameter, Anfangs-/Endtaktiken, Teamstatistiken, RNG-Endpunkte/Ziehungen, P02-Prüfung und Quellhashes. Spielerfähigkeiten werden nicht in eine Produktansicht geschrieben.

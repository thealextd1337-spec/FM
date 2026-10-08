# Native Fußballiteration v159: Ausführung und Nachweise

Lokaler geprüfter Stand vom 8. Oktober 2026. Quelle in `dist/`, Offline-Build in `outputs/index.html`; keine Veröffentlichung. Diese begrenzte Iteration schließt die geplanten M01–M03-Blöcke nicht vollständig ab. Unity liest weiterhin die gemeinsame native Simulation.

## Verhalten

Nur neue physische Partien mit `attackFlow.flowVersion=159` verwenden die Ergänzungen in `world-football-flow-v159.js`. Ältere aktive Spielstände werden nicht nachgerüstet. Rollen, wirksame Fähigkeiten, native Körpermasse/Trägheit und der zentrale P02-Rechner bleiben maßgeblich.

- Der erste Ballkontakt erhält eine begrenzte, beobachtete Kontrollrichtung und 0,14–0,48 Sekunden Vorbereitungszeit. Ball und Körper bewegen sich tatsächlich; ein Plan ist kein garantierter Besitz. Der gespeicherte Kontaktpunkt überbrückt den früher flüchtigen Kontrollzustand nach JSON-Fortsetzung.
- Doppelpassfenster beginnen nach der tatsächlichen Annahme, nicht bereits beim Abspiel. Separate Tiefen-/Diagonalangebote bleiben kurz erhalten, statt bei jeder kleinen Bewegung des Ballführers neu zu springen. Nachläufe bewahren Absicherung und bestehende Rollen.
- Ein ungedeckter Stürmer trägt den Ball durch eine aktuell freie Vorwärtsgasse näher ans Tor, bevor er aus 12–30 Metern spekulativ schießt. Beobachtete Gegner im Weg, eine klar bessere freie Anspielstation oder die Nähe zum Tor beenden dieses zusätzliche Tragen. Ein tatsächlich empfangener Querpass kann direkt ins freie Tor abgeschlossen werden.
- Verteidiger reagieren auf aktuellen Ballbesitz, sichtbare Flugrichtung und beobachtete Empfänger. Die nächsten zwei greifen den Ballweg an; andere decken den erkennbaren Empfänger zur Torseite. Reaktionsintervall und Rollenzone sind begrenzt. Keine Teleportation, garantierte Interception oder Kenntnis zukünftiger Entscheidungen.
- Der Keeper hält bei gedeckten Angriffen und entfernten Ballführern eine begrenzte Ball-Tor-Winkelposition. Ein tatsächlich ungedeckter enger Durchbruch verwendet weiterhin den bestehenden Herauslauf-/Smother-Kontaktpfad. Bereits laufende Abfangaktionen und Schuss-/Passflüge behalten ihren bisherigen nativen Pfad.

Der Integrator ergänzt tatsächliche Platzierungsstreuung aus der vorhandenen Zufallsziehung und entscheidet Keeperreichweite vor der Auflösung. Präzise Schüsse ins tatsächlich freie Tor werden nicht zum Keeper gezogen; Ausführungsfehler neben den Pfosten bleiben echte Fehlabschlüsse. Es gibt keinen Torzuschlag und keine zusätzliche Zufallsziehung für diese Zielstreuung.

## Prüfung

[Zusammengefasste Lieferung mit Hashabgleich](delivery.json) und [Prüfprogramm](../../../../work/platform/qa/check-football-flow-v159.cjs):

| Prüfung | Tatsächlicher Umfang |
|---|---:|
| Reine Komponenten: Kontakt, Vorbereitung, Angebote, Trägheit, Ballführung, Verteidiger und Keeper | 224 Assertions über beide Richtungen, zwei parametrisierte Größen und 5/6 Feldspieler |
| Native Quelle | 82 benannte Laufzeitprüfungen, 9 vollständige native Partien, 2 zusätzliche kompakte Partien, 2 kontrollierte echte Querpassfälle |
| Offline-Build | dieselben 82 Laufzeitprüfungen und dieselben Partien/Fälle |
| Quelle/Build | 42 exakte Vergleiche von Endergebnis, Statistik, Spielbericht und vollständigem P02-Ledger beziehungsweise kompakter Buchung |
| Zusätzlicher präziser Querpass bis zur Torbuchung | je Quelle/Build 2 Fälle in beiden Richtungen, je 18 Assertions und 6 weitere exakte Quell-/Build-Vergleiche |
| Torstudie | 20 identische gepaarte Seeds = 40 vollständige tatsächliche native Partien, 200 benannte Prüfungen |

Alle finalen Prüfungen sind grün. Die zwei nativen Querpassfälle prüfen auch die reale Keeper-Zieldelegation in beiden Richtungen; der tatsächliche Empfänger verbucht genau einen legal empfangenen Pass und führt genau einen direkten Schuss aus. Ausgewählte Empfänger oder reine Animationen gelten nicht als Erfolgsnachweise.

Die zusätzliche [Quellprüfung des tatsächlichen Querpass-Tors](controlled-source.json) und [Buildprüfung](controlled-build.json) verfolgt den Ball bis über die Torlinie und prüft genau eine wirkliche Torbuchung durch den tatsächlichen Empfänger. Nur im kontrollierten Präzisionsfixture wird die bereits vorhandene Platzierungsziehung auf 0,5 gesetzt, die weiteren bestehenden Ziehungen auf 0,001. Produktlogik und die freie 20er-Torstudie bleiben unverändert; deren Trefferquote wird dadurch nicht erhöht. Schussziel, tatsächlich gebuchtes Ergebnis und kompletter Ballereignisverlauf sind zwischen Quelle und Build exakt gleich.

[Quellmatrix](native-source.json), [Buildmatrix](native-build.json), [Komponenten](component-tests.json). Alle final getesteten Spielquelldateien entsprechen den aktuellen Dateien; der Buildhash entspricht der geprüften Offline-Datei.

## Echte Snapshot-Fortsetzung

Ein reales erstes Kontrollfenster wird im nativen Match über `v65Snapshot`, den normalen Speicherweg, vollständiges Karriere-JSON und `v65Restore` gesichert und fortgesetzt. Ergebnis, komplette Statistik, `matchRecord` und vollständiger P02-Ledger stimmen exakt mit der ununterbrochenen identischen Partie überein, auch nach Halbzeit und Abpfiff. Die vier markierten Matrixpartien benutzen einen tatsächlichen Snapshot; die zusätzliche ununterbrochene Kontrolle erfolgt auf der aktuellen Produktgröße.

Die Untersuchung zeigte einen bereits vorhandenen Reset der nativen Kontaktuhr im flüchtigen v102-Zustand. Nach dem Laden waren die gespeicherten Spieler-/Ball-/Absichts- und P02-Daten unverändert, spätere Keeper-Interpolation wich zunächst nur im Rundungsbereich ab, anschließend auch der Matchausgang. Der isolierte Diagnoseversuch mit erhaltener Kontaktuhr stellte vollständige Kontinuität wieder her. Der Integrator speichert deshalb nur für neue v159-Snapshots `nativeContactClock` und stellt sie unmittelbar wieder her. Die finale Prüfung verwendet den produktiven Hook ohne diagnostische Überschreibung.

Historische Diagnosebelege: [vor Uhrkorrektur](native-source-before-clock-fix.json), [erste Abweichung](restore-first-divergence.json), [isolierte Uhrdiagnose](diagnostic-restored-clock.json). Diese Dateien sind ausdrücklich keine finalen grünen Abnahmeberichte.

## Torhäufigkeit und Keeperbefund

Die [finale gepaarte Torstudie](goal-study.json) benutzt die tatsächliche aktuelle Produktgeometrie 44×68 mit fünf Feldspielern plus Keeper, zehn Vereine in fünf Ländern und zwei Seeds pro Verein. Basis und Kandidat behalten dieselben Rollen, P02-Parameter und v157-Körperregeln; nur die neue v159-Kennzeichnung unterscheidet sie.

| Messung | Basis ohne v159 | Finale v159-Fassung |
|---|---:|---:|
| Tore über 20 Partien | 8 | 33 |
| Tore pro Partie | 0,40 | 1,65 |
| Torlose Partien | 14 | 1 |
| Schüsse / aufs Tor | 122 / 59 | 115 / 40 |
| Tatsächlich ausgeführtes zusätzliches freies Ballführen | 0 m | 947,45 m |
| Tatsächlich abgeschlossene schnelle Rückgaben | 81 | 57 |

Die neue Kombination ist damit nicht pauschal passreicher: sie nutzt freie Ballführung und Abschlüsse statt zusätzlicher Rückgaben. Die Verbesserung der Torhäufigkeit ist gemessen, keine vollständige Balancefreigabe.

**82,5 % der genauen Schüsse werden in dieser Stichprobe zu Toren (33/40).** Das vereinfachte Reichweitenmodell benötigt weitere visuelle Iteration und breitere Kalibrierung. Im aktuellen Modell wurden alle sieben tatsächlich erreichbaren genauen Schüsse gehalten; alle 33 unerreichbaren genauen Schüsse trafen. Diese harte geometrische Grenze und die begrenzte Stichprobe werden nicht als fertig balancierte Keeperphysik ausgewiesen.

Die Keeperposition bei den 115 finalen Schussabgaben lag im Mittel 2,37 m vor dem Tor und seitlich 1,39 m von der Tormitte. Nur drei waren tiefer als vier Meter, keiner tiefer als acht Meter. Die tatsächliche mittlere Flugzeit beträgt 0,484 s. Der Bericht enthält pro Schuss Keeperort/-ziel, native Geschwindigkeit, Kontaktprojektion `q`, Abstand, Reach, tatsächliche Flugzeit, Ausführungsziel und Keeperort vor Auflösung.

Die [erste Kandidatenstudie](goal-study-first-candidate.json) mit perfekter freier Sektorplatzierung ergab 3,15 Tore pro Partie und ungefähr 98 % Trefferquote bei genauen Schüssen; sie wurde nicht als fertig akzeptiert. Die [kurze Positionsdiagnose vor dem Keeperhook](goal-diagnosis-before-keeper.json) umfasst drei gepaarte Seeds und zeigt auch schlechte seitliche Winkelpositionen, nicht ausschließlich verlassene Tore: ein Keeper stand bei einem 18,9-m-Abschluss seitlich 5,10 m von der Mitte. Flugzeit und Reach verwenden bei normalen Schüssen konsistent die Distanz/27-Basis; die Diagnose belegt keinen generellen Flugzeitfaktorfehler.

## Grenzen der Matrix

Das aktuelle Produkt bietet weiterhin 44×68 und fünf Feldspieler plus Keeper. Die vier Größen-/Zahlvarianten sind begrenzte Testaufbauten, keine eingeführten Produktoptionen oder vollständige Geometriemigration:

- Die größere native Variante multipliziert nur `v150Scale` und `v122Metres` mit 1,2. Bestehende direkte physische Umrechnungen, insbesondere ältere Schuss-/Keeperpfade, bleiben auf Produktgröße. Die reine Komponentenmatrix dagegen setzt ihre parametrische Größe einheitlich.
- Sechs Feldspieler werden durch einen zusätzlichen aktiven Spieler und normale Rolleninitialisierung aufgebaut. Der bestehende Produkt-Formationswechsel verlangt hart sechs Spieler insgesamt. Nur der noch nicht unterstützte automatische Formationswechsel wird im 6er-Harness ausgelassen; KI-Pressing, Wechsel, native Aktionen, Kontaktauflösung und P02 bleiben aktiv. Der vorherige tatsächliche Abbruch bleibt unter [native-before-six-formation-harness.json](native-before-six-formation-harness.json) erhalten.
- Die zwei kompakten Partien prüfen den gemeinsamen Rollen-/P02-Vertrag, vollständige Buchung und Wiederholungsfestigkeit. Sie haben keine detaillierten Lauf-/Keeperbewegungen und keinen zusätzlich angelegten physischen v159-Zustand.
- Alle Browserfälle dieser Spur laufen isoliert als native 2D-Headless-Prüfung ohne GPU. Die echte Unity-Darstellung und Gerätesichtung werden in getrennten Integratorspuren geprüft. Numerische Tests ersetzen keine visuelle Fußballabnahme.

Der Überblick behauptet keine vollständige M01–M03-Abnahme. Die drei später vorgesehenen UI-Besichtigungen bleiben unabhängig bestehen.

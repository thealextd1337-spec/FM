# Welle 0/1 – gemeinsamer Demovertrag

Stand: 8. Oktober 2026. Nutzerauftrag: Welle 0 umsetzen, danach Welle 1 als lokale PC-Vergleichsdemo mit Unity. Schema `d6-probe-1`. Diese Freigabe betrifft isolierte Demo-/Prüfmodule, keine Produktionsengine oder Migration. Besitzer gemeinsamer Schnittstellen und Integration: I00.

## Daten und Zeit

- Kanonisch: `x` längs, `y` Höhe, `z` quer, Ursprung Feldmitte; Team 0 greift normalerweise nach +x an. `attackDirection` spiegelt x und Bewegung für beide Mannschaften. Positionen/Geschwindigkeiten sind Arrays `[x,y,z]` in vorläufigen Szeneneinheiten beziehungsweise Einheiten/Sekunde.
- Feld: 68×44 oder 81,6×52,8, fünf/sechs Feldspieler plus Torwart je Team. Torbreite `44*.2/(544/600)`, Torhöhe ein Drittel davon; Strafraumtiefe 10, Breite 20. Ballradius 0,1764. Tore und Strafräume bleiben unvergrößert an den Torlinien. Diese Werte sind Demoannahmen aus sichtbarer Bestandsgeometrie, keine bestätigten Produktmeter.
- Die bisherige Keeperprüfung verwendet teilweise 16,5×24. Dieser Unterschied wird im Browserbaseline-Ergebnis ausgewiesen und nicht durch einen stillen Produktpatch beseitigt.
- Physik der Unity-Probe: feste Schritte 1/60 Sekunde; Bestandsadapter verwendet den bestehenden `step` mit derselben äußeren Zeitauflösung und dem vorhandenen `MATCH_SPEED`. Simulationszeit und reale Messzeit werden getrennt erfasst. Darstellung liest Zustände. Ein festgelegter Seed und gespeicherter Zufallszustand erlauben Wiederholung innerhalb eines Pfads; engineübergreifend gelten Fachinvarianten statt Bitgleichheit.

## Schnittstellen

- Szenen: `schemaVersion`, stabile `id`, `title`, `kind`, `duration`, `geometry`, `ball`, `actors`, `expected`, `provenance`. Aktionen nennen ein Vorhaben, keinen garantierten Ausgang.
- Implementierter Demo-Eingang: `{scenario, seed}` mit Geometrie, Richtung, Anzahl und Szenenschema. Die Akteursliste enthält Kennung, Team, Rolle und für die Probe nötige Werte. Öffentliche Ansichten zeigen keine exakten Spielerfähigkeiten. Ein produktiver `PlayerContext` mit zentral berechneten effektiven Fähigkeiten ist ein Zielvertrag für spätere Integration, keine bereits gelieferte Fähigkeitsberechnung.
- Implementierter Zustand: aktuelle Ball-/Spielerpositionen, Aktionen, Zeit, Ergebnis und Ereignisse. Unity liest Kontaktvorhaben und Herkunft aus dem Szenenkatalog; der Browser verwendet seine bestehenden Matchdaten. Eigenständige produktive Module `ActionProposal`, `ResolvedContact` und `BallHistory` sind weiterhin Zielverträge. Die begrenzten Vorhaben/Diagnosen dieser Demo ersetzen diese spätere Integration nicht.
- Das gemeinsame Hilfsledger übernimmt eine ID höchstens einmal. Unity führt Szenen-ID, laufende Ereignisnummer, Tick, Beteiligte und Elternereignis und meldet genau ein Ergebnis je abgeschlossener Szene. Der Browser behält das native Ledger mit dessen Kennungen/Zeitfeldern unverändert. Eine eigene dauerhafte Matchkennung und idempotente Verbuchung in der Karriere bleiben spätere Produktionsarbeit; diese Demo verbucht keine Karriereergebnisse.
- Lokale Bedienung über `window.D6Probe`: `load(config)`, `start()`, `pause()`, `resume()`, `reset()`, `snapshot()`, `checkpoint()`, `restore(checkpoint)`, `stats()`. Die lokale Startseite spricht ausschließlich die API ihres eigenen Engineframes im gleichen Ursprung an; die Same-Origin-Prüfung des Browsers gilt. Ungeprüfte externe postMessage-Nachrichten werden nicht als Steuerbefehle verwendet. Unity-JSON-Nachrichten verwenden dieselben Befehle und korrelierte Antwortkennungen.
- Die sichtbare Demo lädt mit `followThroughSeconds: 3` (zulässig 0–10). Ohne diesen optionalen Parameter behalten analytische Kontaktprüfungen ihren ursprünglichen Zeithorizont. Unity trennt `resultDelivered` von `finished`: Nach dem Kontaktresultat bleibt `following` bis `followThroughUntil` aktiv. Der freie Ball erhält nur in dieser begrenzten Nachlaufphase Schwerkraft, Bodenreibung und gedämpfte Kontakte mit der starren Netzhülle (2,2 Tiefe); gefangene Bälle bleiben gehalten. Das verändert weder den ermittelten Kontakt noch das Ergebnis. Netzverformung, Pfostenkollisionen und vollständige Luftballphysik vor dem Kontakt sind nicht implementiert. Der Browser setzt seine Bestandsfunktionen drei Sekunden über die Katalogdauer hinaus fort und liefert vorhandene Ballansicht und logische Position getrennt; seine gezeichneten Netze ändern keine Matchregel. Nachlauf, Pause und Fortsetzung gehören zum quellengebundenen Zwischenstand.
- Checkpoints enthalten Schema/Engine/Szene/Parameteridentität, Tick/Zeit, Seedzustand, Ball-/Spielerzustände, Ereignisledger und bereits erfolgte Ergebnisübergabe. Ein fremder oder inkompatibler Checkpoint wird abgelehnt. Native Zwischenstände verwenden nur tatsächlich wiederherstellbare Bestandszustände; fehlende Unterstützung bleibt sichtbar.

## Zuständigkeiten und Pfade

| Besitzer | Exklusive Dateien |
| --- | --- |
| I00 | dieser Vertrag, `work/match-next/shared/`, `work/platform/engine-probe/`, zentrale Dokumentation und Demo-Integration |
| M01 | `docs/match-contracts/contacts.md`, `work/match-next/contacts/`, Kontaktbelege |
| A01 | `docs/platform/asset-inventory.md`, `work/platform/assets/`, Assetableitungen und Belege |
| R01 | `docs/platform/performance-report.md`, `work/platform/performance/`, Messbelege |
| E01 nach Übergabe | `prototypes/match-engine-unity/`, ausschließlich `Assets/Doppel6EngineProbe/` im vorhandenen Unity-Projekt |
| Q01 nach Übergabe | `work/platform/qa/`, `docs/platform/demo-acceptance.md`, unabhängige Prüfbelege |

Vorhandene Produktquellen und Masterassets sind lesende Eingaben. Gemeinsame Dateien werden nur durch I00 geändert. Fachagenten integrieren keine Änderungen anderer Spuren stillschweigend. Jeder Lauf nennt Quellen-/Asset-/Parameterhashes; während Messungen werden keine relevanten Dateien geändert. Auf demselben PC erfolgen Leistungsprüfungen seriell.

## Grenzen und später vorgemerkte UI-Prüfungen

Welle 1 liefert PC-Browserdemo und Unity-Webbuild. Android-Appweg wird dokumentiert; Androidmodule, APKs und reale Geräteabnahme folgen später. Keine Veröffentlichung oder Versionsanhebung. Keine neuen Providerjobs oder Generierungen.

Die drei UI-Punkte bleiben ausdrücklich später offen: (1) echter 200-%-Browserzoom, (2) Smartphone-/Screenreaderprüfung einschließlich Tastatur und Dialogen, (3) gemeinsame visuelle Besichtigung von Lesbarkeit, Abständen und Bedienung. Sie blockieren diesen lokalen Vorlauf nicht.


## Ergänzung: isolierte Ballphysikproben

`kind: physics` ist eine eigene lokale Probe, keine Umstellung der Bestands-Matchphysik. Ein separater Katalog enthält sechs Familien mit den acht Vergleichskonfigurationen (48 Fälle): hoher Flug, Ausrollen, Bodenaufprall, Pfosten, Latte, Tor/Netz. JavaScript und Unity führen dieselben Startwerte und dieselben begrenzten Regeln aus. `expected` wird ausschließlich durch Prüfwerkzeuge ausgewertet. Es gibt keine Spielerkontakte oder Match-KI in diesen Proben; Figuren bleiben als Vergleichsreferenz stehen.

Äußerer Takt 1/60 s, acht Teilintervalle je Takt; Schwerkraft 9,81 m/s², Rollverzögerung 2,4 m/s², Rückprallfaktoren Boden 0,52, Rahmen 0,62, Netz 0,16. Diese Demo-Parameter sind keine kalibrierten Produktionsentscheidungen. Rahmen: Kugel gegen rundes Segment mit Endkappen (Rahmenradius 0,06 m), kontinuierliche lineare Kontaktprüfung innerhalb des Teilintervalls; Schwerkraft symmetrisch integriert. Dadurch werden auch schnelle Rahmenkontakte erfasst. Das Netz bleibt eine starre begrenzte Hülle, ohne Verformung; kein Spin, Luftwiderstand oder Materialmodell. Ereigniszeiten werden dem äußeren Takt zugeordnet. Genau ein `result` startet drei Sekunden Nachlauf, das physische Ledger darf danach weitere Boden-/Netzkontakte und eine tatsächliche Torquerung enthalten. `boundaryDelivered` verhindert Mehrfachwertung derselben Grenzquerung.

`cameraPoints` enthält reine Bildpunkte als `{position:[x,y,z]}`. Ohne explizite Bildpunkte bildet die Kontaktansicht Ballbahn, aktive Kontaktakteure und gegebenenfalls den Torrahmen ab. Bei Ballphysikproben erweitert die aktuelle Ballposition den Bildausschnitt im Nachlauf. Kameraänderungen greifen nicht in den Zustand der Simulation ein. Alle bisherigen Szenenkennungen bleiben erhalten; UI-Titel unterscheiden Regelproben am Torrahmen ausdrücklich von physischen Aufprallproben.


## Ergänzung: nachgiebiges Tornetz

Die isolierten Ballphysikproben ersetzen den starren Netzrückprall durch einen lokalen Feder-/Dämpferkontakt (Beschleunigung nach innen: maximal 0 oder `90 * Eindrücktiefe + 24 * Außengeschwindigkeit`). Der Ball wird kontinuierlich abgebremst und drückt das Netz aus seiner Ruhelage. Die verbleibende Netzbewegung schwingt mit Federwert 65 und Dämpfung 7 aus. Das sind vorläufige Demowerte, kein kalibriertes Stoffmodell oder Unity Cloth/PhysX. Maximaler Hub 1,6 m ist eine Stabilitätsbegrenzung für überhöhte Eingangsgeschwindigkeiten.

`netPatches` speichert pro Tor und Netzseite die aktuelle Kontaktposition, Auslenkung, Geschwindigkeit, Spitzenhub und Kontaktphase. Rücknetz, beide Seiten und Dach werden getrennt erfasst. Die Darstellung verteilt den Hub lokal über unterteilte Netzstränge; die Befestigungen an Rahmen und Stützen bleiben fest. Pause hält Ball und Netz an; quellengebundene Zwischenstände enthalten auch Netzspannung und Nachschwingen. Beschädigte Unity-Netzzustände werden atomar abgelehnt. Originale Kontaktprüfungen ohne Nachlauf bleiben unverändert. Unity verwendet den nachgiebigen Kontakt auch im Nachlauf ursprünglicher Torproben. Im nativen Browseradapter wird ausschließlich die tatsächlich beobachtete Ballansicht für Netzverformung verwendet; die Bestands-Matchphysik wird dabei nicht verändert.

## Ergänzung: zusammenhängende Spielzüge

`kind: play` ergänzt drei lokale Familien mit je acht Feld-/Mannschafts-/Richtungskonfigurationen: Pass–Annahme–Schuss–Tor, abgefangener Pass und Pass–Annahme–Schuss–Parade–freier Abpraller–erneuter Besitz. Der kleine Aktionsablauf erweitert den vorhandenen Ballintegrator; eine einzige Instanz besitzt Zeit, Ball, Besitzer, Kontaktledger und Ergebnis. Keine vollständige Match-KI und keine Produktionsintegration. Erwartete Ergebnisse bleiben außerhalb der Runtimeentscheidung.

`play` benennt Passgeber, Empfänger und Schusszielbreite. Die Ausgangspositionen schaffen unterschiedliche Kontaktsituationen. Passfreigabe nach 0,65 s, Schussvorbereitung nach tatsächlicher Annahme 0,75 s; Freigabe ist nur innerhalb des Fußkontaktvolumens erlaubt. Annahme führt den erreichten Ball während 0,22 s kontrolliert an den Fuß. Passgeschwindigkeit 13 m/s, horizontaler Schuss 18 m/s mit ballistischer Zielhöhe 1,5 m. Diese Werte sind Demoparameter. Bewegung, Fuß-/Handkontakte, Boden, Rahmen und Grenzquerung werden innerhalb derselben acht Teilintervalle kontinuierlich geprüft. Kein Kontakt allein durch Zeitablauf oder Animation; Gleichzeitigkeit wird stabil über Akteurkennungen aufgelöst.

Die Fußkontaktmitte liegt 0,30 m vor und 0,25 m rechts vom Akteur, auf 0,25 m Höhe; Kontaktradius 0,12 m plus Ballradius. Die Handkontaktmitte des Keepers liegt 0,45 m vor ihm auf 1,25 m Höhe, Kontaktradius 0,22 m plus Ballradius. Paraden reflektieren die tatsächliche Eintrittsgeschwindigkeit an der Kontaktnormalen mit normalem Rückprallfaktor 0,65 und abschließender Dämpfung 0,35. Der Abpraller hat keinen Besitzer. Empfänger und Verteidiger laufen anschließend mit 5,5 beziehungsweise 5,8 m/s zum freien Ball; erst erneuter erreichbarer Fußkontakt erzeugt Besitz. Es gibt weder automatische Keeperumlenkung noch einen Erfolgsschalter anhand des Szenenfamiliennamens.

`playProbe`, `playPhase`, `phaseStarted`, `releaseAt`, `lastContactPoint` sowie Blickrichtung, Animationsphase und deren Startzeit je Akteur gehören zum quellengebundenen Zwischenstand. Kontaktbelege enthalten Akteur, Ballposition, Kontaktmitte, Kontaktradius und tatsächlichen Abstand. Unity prüft diese Felder und Besitz-/Phasenkonsistenz vor einer atomaren Wiederherstellung. Browser stellt den Ablauf deterministisch wieder her und vergleicht den Zustand einschließlich Aktionsphase. Eine einzige Ergebnisübergabe beendet den Spielzug; anschließend bleiben drei Sekunden Nachlauf erhalten.

Beide Renderer verwenden vorhandene Clips und die Simulationszeit. Eine begrenzte Zweigelenk-Korrektur richtet rechten Fuß beziehungsweise rechte Hand auf die maßgebliche Kontaktmitte aus; sie entscheidet keinen Erfolg. Kinematische Kontaktvolumen und diese Ausrichtung sind eine lokale Annäherung, keine Kollision am animierten Figurenmesh oder vollständige Kontakt-IK des Produkts. Die Renderstatistik misst die tatsächliche Position des Kontaktknochens und ihren Restabstand. Unerreichbare Gelenkziele werden durch die vorhandenen Gliedlängen begrenzt.

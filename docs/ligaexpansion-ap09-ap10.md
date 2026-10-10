# AP09 / AP10 – Awards und Karriereoberfläche

Stand: lokal umgesetzt am 10. Oktober 2026 im Arbeitsbaum `work/ligaexpansion-ap03`, nicht veröffentlicht. Laufzeitquelle ist dessen `dist/`; Hauptarbeitsbaum, Live-Seite und Fußversion 121 wurden nicht veröffentlicht oder angehoben.

## AP09: Wiedererkennung

Der Katalog umfasst 66 Awardidentitäten mit 132 transparenten SVG-Dateien: zwölf nationale Sets mit Meisterschaft, Pokal, Torjäger, Spieler der Saison und Matchmedaille; Crown- und Horizon-Trophäe mit eigener Matchmedaille; die zwei bisherigen Europaobjekte für alte Welten. Die vorhandenen sechs Landes-Sets und bisherigen Europaobjekte behalten ihre Originalgeometrie. Sechs neue nationale Sets verwenden Landesflaggen und unterschiedliche Meisterschaftssilhouetten. Crown verwendet eine Krone, Horizon einen Sonnenaufgang mit Horizontlinie. Es gibt keine neuen Vergaberegeln oder zusätzlichen internationalen Saisonawards.

`work/generate-expansion-awards-v171.cjs` erzeugt die neuen Projektgrafiken und beide Größen (320 / 24 Pixel). `dist/trophies-expansion/manifest.json` nennt Identität, Quelle, Nutzungsrecht und Dateipfade. `world-expansion-awards-v171.js` bindet die Grafiken auch in den eigenständigen Offline-Build ein. Profil, Titelarchiv, Tabellenzeichen, Matchmedaille, Vereinsbüro und Siegerfeier verwenden die Wettbewerbskennung statt eines gemeinsamen Europa-Symbols. Zugängliche Beschriftung und Bild bezeichnen denselben Award; neue Beschriftungen wechseln Deutsch/Englisch.

Die lokale Galerie `expansion-awards-preview.html` zeigt große und kleine Varianten auf hellem und dunklem Hintergrund. Die Grafiken sind ausführbare Gestaltungsentwürfe; endgültige gestalterische Freigabe und Register-/Ähnlichkeitsprüfung bleiben vor Veröffentlichung offen. Gründungslegenden werden dadurch nicht freigegeben.

## AP10: Spielbarer Einstieg und Navigation

Der reguläre Startknopf führt über Managername und bestehende Feldregeln zu zwölf Ländern mit jeweils acht wählbaren Ligavereinen. Die erzeugte Kaderprüfung wird beim Speichern unverändert verwendet. Rückwege erhalten die Auswahl; erst erfolgreiche native Speicherung startet die Karriere. Innsbruck Sport bleibt der bestätigte Name von AUT-5.

Sechs Bereiche strukturieren die Expansionskarriere: Zentrale, Wettbewerbe, eigener Kalender, Länderwertung, Verein und Büro. Sponsor-, Budget-, Markt-, Match- und Saisonwechselaktionen bleiben an den vorhandenen Buchungsablauf angebunden. Nationale Wettbewerbe, Crown Cup und Horizon Cup haben getrennte Tabellen/Runden, Kalender, Spielerstatistiken und Siegerarchive. Saison und Land sind wählbar. Die Länderwertung zeigt abgeschlossene Drei-Saisons-Werte, tatsächliche Vereinsbeiträge und Folgekontingente. Bereits feststehende nächste Plätze werden nicht als aktuelle Plätze ausgegeben.

Vorschau und Zentrale verwenden gespeicherte Fakten. Höchstens drei prägende Saisonmomente werden nach Titel, Nachwuchs-Finaltor, Finale, Halbfinale, zusätzlichen Länderplätzen, Wiedersehen und Erstteilnahme ausgewählt. Vereinschronik und Managerstationen bleiben verlinkt. Profil- und Ergebnisfenster erhalten die gewählte Ansicht beim Schließen. Gelesene Nachrichten bleiben gespeichert; auch der Navigationshinweis wird aktualisiert. Alle neuen Texte unterstützen Deutsch und Englisch, einschließlich dynamischer Ansichten. Wettbewerbs- und Vereinsnamen bleiben Eigennamen. Spielerfähigkeiten bleiben ausschließlich Farbstufen.

`world-expansion-interface-v172.js` und die gleichnamige CSS-Datei erweitern die vorhandene Oberfläche. Neue Karrieren erhalten `world.presentationVersion: 172`. Erst künftige Saisonabschlüsse dieser Karrieren speichern `competition.playerStatistics` mit Spieler-/Vereinsreferenz, Einsätzen, Toren, Vorlagen und Durchschnittsnote vor der bestehenden Historienverdichtung. Der Importvalidator prüft diese Datensätze. Bestehende Welten erhalten keine neue Kennung und keine rückwirkend ermittelten Archivstatistiken; fehlende historische Werte werden als nicht erfasst angezeigt. UI-Auswahl und Ansichtswechsel verändern keine Spielregeln oder Karrierefakten.

## Nachweise

- `node work/test-world-expansion-presentation-v172.cjs`: 66 eindeutige Identitäten, 132 vorhandene sichere SVGs, unveränderte alte Grafiken/Welten, Statistikaggregation, 991 Partien mit synthetischen Ergebnissen durch native Buchung, Saison 2, unveränderte Statistikarchive, maximal drei Erinnerungen, Korruptionsabwehr und Export/Import bestanden.
- Bestehende Sprach-, Weltansichts- und physische UI-Prüfungen sowie AP07-Regel- und AP08-Storyprüfungen bestanden. Die AP07-Regelprüfung umfasst 18.336 Titelüberschneidungen. Asset-/Offline-Integration und Build bestanden; `git diff --check` ohne Befund.
- Regulärer Browserstart: zwölf Länder, acht Ligavereine je Land, AUT-5, identischer Vorschau-/Startkader und erfolgreiche Speicherung. Sponsor, Budget und alle fünf Markttage über die Oberfläche bedient.
- Browseransichten: 36 Desktopfälle bei 1280 Pixeln (Deutsch/Englisch), 18 Mobilfälle bei 390 Pixeln; kein Seitenüberlauf, keine gemeldeten Aktionsfehler, unveränderte Welt bei reinem Anzeigen. Mobile Kopfbereichshöhe korrigiert und anschließend visuell bestätigt.
- Browserkarriere: erste 48 Partien nativ simuliert; weitere 943 mit synthetischen Ergebnissen durch native Buchung. 62 tatsächliche Spielerstatistikzeilen der österreichischen Liga, darunter drei Torschützen, bleiben nach Abschluss und Saisonwechsel erhalten. Archiv zeigt sechs Spielerlinks. Lesestatus nach Neuladen erhalten; Profil-/Partielinks und Rückkehrkontext sowie dynamischer Sprachwechsel bestanden.
- Sichtprüfung: transparente Grafikgalerie, Tabellen-/Siegeransicht, Cup-Siegerprofil, Vereinsbüro und beide Siegerfeiern. Die Siegerfeiern wurden mit unabhängigen Ansichtskopien der tatsächlichen Testresultate geprüft; dadurch wurden keine Titel nachgebucht.

Maschinenlesbare Nachweise: `outputs/ligaexpansion-ap09-ap10/tests.json` und `browser.json`. Build: `outputs/index.html` und `outputs/Doppel-6-Fussballmanager.html`. Quell-HTML, lokale Serverfreigaben und Buildlisten enthalten die neuen Skripte und Assets.

## Verbleibende Abnahme

AP11 bleibt offen: umfassende Mehrseed-/Langzeitwirtschaft, Speicherbudgets, aktive Match-/Unity-Gesamtintegration, physische Referenzgeräte und Veröffentlichungsvorbereitung. Browser-Viewportprüfungen ersetzen keine Geräteabnahme. Die synthetischen Ergebnisse ersetzen keine vollständige physische Saison. Kein Deployment, Push oder Versionswechsel wurde ausgeführt.

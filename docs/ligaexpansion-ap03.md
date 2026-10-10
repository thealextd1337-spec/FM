# AP03: Weltaufbau, Herkunft und Speicherung

Stand: 10. Oktober 2026. **Technischer Weltaufbau als speicherbare Vorschau umgesetzt; volle Spielbarkeit folgt AP04–06.** Keine Veröffentlichung.

## Implementierungsbasis

Der erneut abgerufene Hauptzweig steht unverändert auf `37a702ea1fe465aa398b11e9ee4a29948295ee28`, Prototyp 121. Die Umsetzung liegt im isolierten Arbeitsverzeichnis **`work/ligaexpansion-ap03`**, Zweig **`codex/ligaexpansion-ap03`**. Die lokale 97er-Laufzeit bleibt unangetastet. AP01-/AP02-Daten wurden übernommen; die aktuellen Produkt- und Entwicklungsregeln des 121er-Stands bleiben erhalten. `freekickdemo/` ist ausgeschlossen.

## Umgesetzt

Die gemeinsame Erzeugung kann nun zusätzlich eine neue Welt mit Schema **15 / Modell 11**, `rules.variant: expansion12` und `rules.stage: foundation` anlegen. Sie erzeugt alle 192 Vereine mit positionsgerecht besetzten nativen Kadern, individuellen Vereinsparametern, Trainern, Verträgen und Ausstattung. Die 96 Ligavereine erhalten Finanz- und Nachwuchsgrundlagen; die 96 Pokalvereine bleiben `simulationOnly`, ohne eigene Finanz- oder Nachwuchswirtschaft. 24 freie Trainer ergänzen 191 besetzte KI-Trainerstellen.

Die Länderstufen beeinflussen die tatsächlichen erzeugten Kaderbereiche: A 0, B −0,25, C −0,5, D −0,75 plus die individuelle relative Startkaderrolle. Diese Verschiebung wirkt ausschließlich auf die native Erzeugung neuer Profis, nicht auf Ergebnisse oder Tore. Jugendtalent, Rollen, Entwicklung, Alterung und Belastung verwenden das vorhandene native Modell. Das Ausgangsmodell und die Erzeugungsparameter bleiben gespeichert. Starke griechische Vereine übertreffen in beiden Prüfsaaten schwache A-Vereine; dies ist ein Nachweis der vorgesehenen Überschneidung, keine Garantie für Ergebnisse oder eine abgeschlossene Saisonbalance.

Anfangsreserve, Jahresgrundbetrag und feste Sponsorangebote nutzen überlappende Faktoren A 1, B 0,96, C 0,90, D 0,84. Fanbasis und Tradition bleiben weitere echte Eingaben. Dies sind Anfangswerte; die vollständige Wirtschaft für den längeren Kalender samt Prämien, Zielen und Minutenzusagen bleibt AP07.

Alle zwölf Länder besitzen Herkunfts-/Partnerprofile für Profis, Vereinslose und Nachwuchs. Die bestehenden 101 Nationalitäten, Flaggen und Namenspools werden verwendet. Es gibt 36 zusätzliche fiktive nationale Sponsoridentitäten mit eigenen Wortmarken und Symbolen, sechs je neuem Land; insgesamt 72 Identitäten. Neue Angebote speichern wie bisher nur Kennung und Namen.

Alle 192 Vereine haben gültige Heim-/Auswärtsmuster und zwei kontrastgeprüfte Torwarttrikots. Die 48 bisherigen Farbsätze bleiben unverändert. Neue Sand-/Eisblauvarianten und zwei Einzelanpassungen lösen die Kontrastprobleme des Entwurfs; die tatsächlich verwendeten Farben stehen in [Farbdaten](ligaexpansion-ap03-farben.json). Die ursprünglichen AP02-Farbnamen und Identitäten bleiben nachvollziehbar.

144 eigene abstrakte SVG-Wappenskizzen ergänzen die vorhandenen 48 Wappen. Ein Manifest ordnet jedem Verein Farben, Grafik und Stadionidentität zu. Der Renderer verwendet dieselben Vereinsfarben, auch bei später abweichend gespeicherten Trikotfarben. Grafische Endabnahme und externe Gesamtähnlichkeitsprüfung bleiben offen. Für die neuen Stadionkennungen bleibt vorerst der geprüfte neutrale Unity-Rückfall des aktuellen Renderers maßgeblich; individuelle Architektur für alle Ergänzungen ist noch nicht erstellt oder in Unity gebaut.

## Vorschau und Speicherung

Im Arbeitsverzeichnis: `SECHSER_PORT=4183` setzen und `node work/server.cjs` starten. Die **`dist/expansion-world-preview.html`** liegt dann unter `http://127.0.0.1:4183/expansion-world-preview.html`. Sie erlaubt Land-/Vereinswahl, reproduzierbaren Aufbau, Prüfung der 16 Landesvereine, ausdrückliches Speichern und Dateiexport. Der Hauptspielstart bleibt bis zur Wettbewerbsintegration beim bisherigen Umfang; die Vorschau erweitert bestehende Karrieren nicht.

API: `D6Expansion.createFoundation(clubId, seed, managerName, matchOptions)`. `D6Expansion.store`, `import` und `export` nutzen den gemeinsamen bestätigten Speicherpfad. Export und Rettungsexport übernehmen die tatsächliche Schema-/Modellkennung; widersprüchliche Importhüllen, unbekannte Varianten, beschädigte Kader oder Trikots werden abgelehnt. Die Fünfergrenze und aktuelle Datenbank bleiben erhalten. Eine gemischte Liste aus 14/10 und 15/11 ist zulässig.

Der Vorbereitungsstand enthält ausdrücklich keine Partien oder Wettbewerbe, keine erfundenen früheren Ergebnisse oder Länderpunkte. AP01-Vorgeschichte wird nur als Ausgangsquelle gespeichert. Öffnen zeigt eine Vorschau ohne Sponsor-/Match-Leitaktion. Saisonfortschritt ist bis zur Wettbewerbsanlage gesperrt. AP04–06 müssen die gespeicherten Regeln kontrolliert um den aktiven Kalender ergänzen; der bislang nur für `foundation` freigegebene Validator ist dabei entsprechend zu erweitern. Vorbereitungsstände sind keine fertigen spielbaren Karrieren.

## Nachweise

- `test-world-expansion-v161.cjs`: zwei verschiedene Seeds jeweils zweimal aufgebaut; Weltinhalt identisch. Je 192 Vereine und zwölf Länder, alle Kaderpositionen, native Rollen-/Belastungsdaten, Trainer, Verträge, Nachwuchs, 96 reine Simulationsteams, 72 Sponsoridentitäten und Logodarstellung, gültige Trikots, fehlerhafte Daten, gemischtes Speichern, Import/Export, Rettungsexport und Löschen geprüft. Klassische und native 48er-Neuerzeugung vor/nach Laden des Expansionsmoduls sind unverändert.
- Bestandstests bestanden: Weltfundament, Kalender über zehn Saisons, Trainer, Match, Spielstandverwaltung, IndexedDB-Speicherung, Speicherwiederherstellung, Zahlungsadapter, Sponsoren und Nationalitäten. Der 48er-Dauerkalender bleibt bei 259 Partien; kein Expansion-Saisonlauf wird daraus abgeleitet.
- `test-expansion-assets-v161.cjs`: 192 gültige Grafikzuordnungen, 144 eigene sichere und unterschiedliche SVG-Dateien, drei verwendete Farben und Einbettung der beiden neuen Module im Einzeldatei-Build.
- Browser auf isoliertem Inkognito-Testursprung: zwölf Länder, Innsbruck Sport, 16 Vereinskarten, Erzeugung ohne automatische Speicherung, bestätigte IndexedDB-Speicherung, unveränderter Export/Import, Neuladen mit identischem Welt-SHA-256 und gleichzeitigem 192er-/48er-Spielstand. Öffnen zeigt die Vorschau ohne Sponsoraktion. Bei 390 px Breite keine horizontale Überbreite.
- Neuer Einzeldatei-Build erfolgreich; Quelldatei und beide Builddateien enthalten die Erweiterung. Seitenfuß weiterhin 121, ohne Live-Veröffentlichung. Keine neuen Unity-Laufzeitdateien erzeugt.

Die zwei nativen Aufbauprüfstände haben 2.178 bzw. 2.180 Profis nach regulären KI-Jugendverpflichtungen und 506 bzw. 507 verbleibende Jugendspieler. JSON-Größe ungefähr **7,0 MB pro Welt**. IndexedDB-Speicherung ist im Browser nachgewiesen; eine vollständige Welt kann die übliche kleine localStorage-Quote überschreiten. Der bestehende Fehler-/Rettungsexportpfad bleibt maßgeblich; keine automatische Kompression oder Migration. Geräteleistung und fünf parallele große Welten bleiben AP11.

## Übergabe und offene Abnahme

Der Aufbau-, Herkunfts-, Trikot- und Speicherumfang ist implementiert und geprüft. Offen bleiben individuelle Unity-Stadionarchitektur für 144 Ergänzungen, grafische Endabnahme der Wappenskizzen und externe Namens-/Gestaltungsprüfung. Die vollständige AP03-Abnahme ist daher noch nicht als abgeschlossen markiert. Nationale und internationale Wettbewerbe, volle Karriereoberfläche, Saisonbalance sowie reale Mobil-/Unity-Abnahme folgen den zugeordneten Paketen AP04–11.

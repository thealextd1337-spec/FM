# AP00 – Bestandsprüfung und Integrationsvertrag

Stand: 10. Oktober 2026. Auftrag: AP00 ausführen. Ergebnis: Bestandsaufnahme und technische Verträge für die Folgepakete; keine Expansion im Laufzeitcode und keine Veröffentlichung. Grundlage sind [Produktplan](ligaexpansion-plan.md) und [Arbeitspakete](ligaexpansion-arbeitspakete.md).

## 1. Verifizierter Ausgangsstand

| Oberfläche | Geprüfter Stand | Nachweis |
| --- | --- | --- |
| Lokales Arbeitsverzeichnis | `main`, Commit `204b9b97a476781d3e90cde861fcc7cf3cd518ba`, Prototyp 97 | `dist/index.html`; vorhandene Dokumentationsänderungen und unversionierte Dateien bleiben erhalten |
| Aktueller Hauptzweig | `37a702ea1fe465aa398b11e9ee4a29948295ee28`, Prototyp 121 | `git fetch origin main`, isolierte Archivkopie; lokal 0 eigene und 62 fehlende Commits |
| Build des aktuellen Hauptzweigs | Prototyp 121, 50.875.346 Bytes | `node work/build.cjs` in isolierter Kopie erfolgreich; keine externen Script-URLs im HTML |
| Live-HTML | [fussball.cakamper.at](https://fussball.cakamper.at/), Prototyp 121 | HTTP 200 und Browserprüfung am 10.10.2026, 14:17 UTC; bytegleich mit isoliertem Build |
| Unity-Anbindung | `world-unity-v151.js`, Laufzeit `unity-match/runtime.html?v=121` | Browser zeigt konfigurierte URL und verfügbare `D6UnityMatch`-Brücke; aktuelles Unity-Manifest stimmt mit dem Hauptzweig überein |

SHA-256 von Build und Live-HTML: `255f01480a66b5c9bb2b1f963636ba7fdf1e104457fcb70815b634a633eab16a`.

Unity-Manifest: `https://fussball.cakamper.at/unity/probe-build.json`, Vertrag `d6-world-view-1`, Quellenkennung `affd013bcc8e6b8528ba407f9d24f860221dad19af14416509ac5e0461371032`. Geprüft wurden Manifestidentität und Brückenverfügbarkeit, nicht die vier großen Laufzeitdateien, ein vollständiger Unity-Match oder Smartphoneleistung. Ein bereitgestelltes Manifest allein ist kein Nachweis eines laufenden 3D-Matches.

**Integrationsbasis für Folgepakete ist der geprüfte Commit 37a702e oder ein erneut geprüfter Nachfolger.** Die lokale 97er-Kopie darf nicht als Implementierungsbasis oder aktueller Live-Stand gelten. Diese Prüfung aktualisiert keine Arbeitsdateien aus `origin/main`; vor der ersten Laufzeitänderung muss die Integration den aktuellen Stand in einer isolierten Arbeitskopie bereitstellen und lokale Dokumentationsänderungen bewusst übernehmen.

Die Expansion selbst fehlt auch im aktuellen Hauptzweig: sechs Länder, 48 Vereine, 13 Wettbewerbe je Saison, zehn Ligaspieltage, nationaler Pokal ab Viertelfinale und ein Europacup mit zwölf Teilnehmern und vier Ligaphasenspielen. Der Browser bestätigt dieselben Länder, Kalenderwerte und Validierungsgrenzen.

## 2. Aktive Module und Dateizuständigkeit

Die folgenden Pfade beziehen sich auf den geprüften aktuellen Hauptzweig. Neuere Adapter sind in der lokalen 97er-Kopie teilweise nicht vorhanden. `dist/index.html` lädt 130 externe Skripte; die vollständige Reihenfolge und Dateihashes stehen im erzeugten Inventar.

| Bereich / verantwortliche Rolle | Aktive Dateien und Anknüpfung | Übergabe an |
| --- | --- | --- |
| Integration / Speichern | `world-foundation-v61.js`: `v61CreateCareer`, `v61ValidateCareer`, `v61ValidCareers`, Import/Export, bestätigte Speicherung, Rückfallkopie | AP03; gemeinsame Änderungen seriell durch Integration |
| Vereinsdaten / Redaktion | `world-catalog-v61.js`, `work/generate-world-catalog-v61.cjs`; IDs und sechs Profilmerkmale | AP02 |
| Herkunft / Ausstattung | `world-nationalities-v79.js`, Wappen-/Trikotfunktionen in `world-foundation-v61.js`, `world-kits-ui-v81.js`, Sponsoridentitäten in `world-economy-v66.js` | AP03 |
| Wettbewerb / Kalender | `world-competition-v62.js`: `v62PrepareSeason`, Auslosung, Ergebnisauflösung, Fortschritt, Qualifikation und Saisonwechsel | AP04–07; ein Besitzer für diese gemeinsame Datei |
| Match / native Simulation | `world-match-v64.js`, `world-physical-v65.js`: Vorbereitung, eigene und KI-Partien, Spielerstatistik, Snapshot, Ergebnisbuchung | AP04–07; Matchverantwortung bleibt hier |
| Spielermodell / Belastung | `player-*.js`, `world-player-foundation-v153.js`, Rollen v154, Leistung v155, Belastung v158; neue Welten nutzen native v160-Parameter | AP03/07; keine zweite Frische- oder Entwicklungskette |
| Wirtschaft / Nachwuchs | `world-economy-v66.js`, `world-transfer-list-v72.js`, `world-youth-manager-v67.js`, **`world-payments-v124.js`** | AP03/07; Zahlungsadapter überschreibt frühere Wirtschaftsfunktionen |
| Awards | `world-honours-v74.js`, Awardzuordnung in `world-competition-v62.js`, **`trophy-art-v119.js`** | AP09; Ergebnisquelle bleibt Wettbewerb/Match |
| Karriere / Nachrichten | `world-views-v68.js`, bestehende `world.careerEvents`, `world.eventLog.visibleNews`, Managerstationen | AP08/10 |
| Oberfläche / Sprachen | `world-match-ui-v64.js`, `world-market-ui-v66.js`, weitere UI-Adapter, `i18n-v75.js`, **`ui-flutlicht/adapter.js`, `views/competitions.js`, `start.js`, `match.js`** | AP10; Flutlicht liest Controller-Projektionen |
| 3D / Unity | `world-pitch3d-v98.js`, `world-unity-v151.js`, `unity-match/runtime.*`; Quellen unter `prototypes/match-engine-unity/` | AP03/11 für Identitäten/Stadionabdeckung; keine Wettbewerbsentscheidung im Renderer |
| Build / Auslieferung | `work/build.cjs`, `work/server.cjs`, `work/ui-redesign/shared/assets.cjs`, Deployment-Workflow und Unity-Manifest | AP11; Integration pflegt Lade-/Assetlisten |

Das sind Zuständigkeitsgrenzen, keine gestarteten parallelen Aufträge und keine dauerhaften Dateisperren. Vor jeder tatsächlichen Bearbeitung reserviert die Integration die betroffenen Dateien. AP05 und AP06 liefern getrennte Cupmodule; sie bearbeiten nicht gleichzeitig die gemeinsame Wettbewerbsdatei. AP07 liefert Wertung/Qualifikation, AP08 Storyereignisse, AP09 Assets, AP10 Projektionen; Integration verbindet die gemeinsamen Einstiegspunkte.

## 3. Feste Annahmen, die aufzulösen sind

- `v61ValidateCareer`: Schema 14 / Modell 10, genau 48 Vereine, sechs Länder, sechs Liga- und zwei Pokalvereine je Land sowie 13 aktuelle Wettbewerbe. Lesen, Rückfallkopie und Import hängen an dieser Validierung.
- `v61Countries` ist zugleich globaler Startkatalog und Quelle vieler laufender Saison-, Markt- und UI-Funktionen. Ein bloßes Erweitern auf zwölf Länder würde alte Welten ungültig machen oder deren Folgejahre verändern.
- `v62CountryLeague` verwendet fünf Hinrunden, drei Paarungen und zehn Gesamtrunden. `v62CountryCup` startet mit vier Viertelfinalpaarungen. Der Kalender enthält feste Tage und die Meisterbuchung greift auf `league[9]` zu.
- `v62Europe`, Länderpaarungen und Startteilnehmer erwarten exakt zwei Teilnehmer pro bisherigem Land. Fortschritt, eigene Matchabschlüsse, Hin-/Rückspielauflösung und Ansichten unterscheiden nur `type: europe` und einen einzelnen Europacup.
- `v62NextEntrants` kennt weder zusätzliche Titelverteidigerplätze noch Horizon-/Länderwertung. `v62NextSeason` muss beide Felder vor dem nächsten Saisonaufbau speichern, ohne Ergebnisse beim Laden neu auszuwerten.
- `v64AbsoluteDay` verwendet `(season - 1) * v62Days.seasonEnd + day`, derzeit mit 224; Karriereprotokoll-Auswertungen verwenden teilweise 225 Tage. AP04/07 müssen die Zeitbasis neuer Welten explizit festlegen und bestehende Werte unverändert lassen.
- Der aktuelle Zahlungsadapter kennzeichnet Pokalvereine als `simulationOnly`: keine normale Finanz-/Jugendverwaltung wie bei Ligavereinen. Das ältere Dokumentationsbild einer einheitlichen 48-Vereine-Wirtschaft ist keine aktuelle Laufzeitbeschreibung. AP03/07 müssen dieses Modell beachten; eine Änderung benötigt eine ausdrückliche Produktentscheidung.
- Sponsorziele, Minutenzusagen, Erfolgsfaktoren, Jugendgewichtung über `:EUROPE`, Awards, Siegerfeiern und Statistikansichten müssen beide neuen Cupkennungen verstehen. Länderabstufung darf weder direkte Torboni noch ein weiteres Belastungsmodell erzeugen.
- Unity erhält Spieler-/Teamkennungen und native Frames. Die neue Welt braucht Asset-/Stadionabdeckung für 192 Vereine; ein größerer Katalog allein erzeugt keine passenden Stadien. Der Browser bleibt die verbindliche Ergebnisquelle.

## 4. Technischer Vertrag für die Folgepakete

Dieser Abschnitt legt Implementierungsziele fest; die Felder und Funktionen sind noch nicht im Laufzeitcode vorhanden. Offene Produktregeln werden hier nicht vorweggenommen.

### 4.1 Gespeicherte Weltvariante und Speichergrenze

- Bisherige Vereinswelten bleiben **Schema 14 / Modell 10**, `format: world`; kein nachträgliches `rules`-Feld. Die alte Sechserliga bleibt separat.
- Neue Expansionswelten erhalten **Schema 15 / Modell 11** und `world.rules = {version: 1, variant: 'expansion12', ...}`. Export, Rettungsexport und Import übernehmen die Kennzeichnung des tatsächlichen Spielstands statt fest verdrahteter 14/10-Werte. Schema 15 ist im geprüften Ausgangsstand noch unbelegt.
- `world.rules` enthält bei Anlage die zwölf Länderkennungen, acht Liga-/acht Pokalvereine, Wettbewerbsformate und Kalenderparameter. Noch offene Inhalte werden erst nach AP01 bzw. AP04 gesetzt. Insbesondere Kalenderlänge und Crown-Heimrechte bleiben offen.
- Gemeinsamer Einstieg `v61Rules(career)` liefert gespeicherte Expansionsregeln oder die unveränderten bisherigen Regeln **lesend**, ohne Ergänzung des Altstands. `v61ValidateCareer` dispatcht ausdrücklich nach Schema/Modell; unbekannte Varianten werden abgelehnt, nicht erraten.
- Laufende Weltfunktionen verwenden `career.world.countries` und `v61Rules(career)`. Der globale Katalog dient dem Anlegen, nicht der nachträglichen Erweiterung gespeicherter Welten. Die bisherige Wettbewerbsroutine bleibt als Legacy-Pfad bestehen, der neue Pfad nutzt parameterisierte Regeln.
- Aktuelle Browserablage, bestätigte Schnappschüsse, Rückfallkopie und Fünfergrenze bleiben gemeinsam nutzbar; `v61ValidCareers` akzeptiert eine gemischte Liste gültiger 14/10- und 15/11-Welten. Keine globale Schlüsseländerung, die vorhandene Welten versteckt. Speichern/Import wartet weiterhin auf bestätigte Schreibvorgänge.

Dies ist die notwendige Trennung zweier Produktvarianten, keine rückwirkende Migration oder Neuberechnung alter Ergebnisse. Bestandstests müssen auch nach einer globalen Katalogerweiterung weiterbestehen.

### 4.2 Kennungen und Wettbewerbsergebnisse

| Objekt | Festgelegter Vertrag |
| --- | --- |
| Länder | `ENG`, `ESP`, `ITA`, `GER`, `FRA`, `POR`; neu `NED`, `BEL`, `AUT`, `SUI`, `TUR`, `GRE`. Vorhandene Nationalitätscodes wiederverwenden |
| Vereine | Bestehende IDs erhalten. Je Land Liga `CODE-1` bis `CODE-8`, Pokal `CODE-C1` bis `CODE-C8`; kein Umbenennen bisheriger Pokalvereine |
| Nationale Wettbewerbe | Bisheriges Muster `S<season>:<CODE>:LEAGUE` bzw. `:CUP` erhalten |
| International | Alte Welten behalten `S<season>:EUROPE`. Neue Welten: `S<season>:CROWN` und `S<season>:HORIZON`; stabile Serienkeys `crown`/`horizon`, Namen nur Darstellung |
| Wettbewerb | Bestehende `id`, `type`, `country`, `season`, `fixtures`, `winnerId` weitertragen. Internationale neue Objekte erhalten `series` und explizite Phaseninformation, statt den Cup aus dem Namen abzuleiten |
| Partie | `id`, `competitionId`, `round`, `day`, `homeId`, `awayId`, `leg`, `pair`, `result` erhalten. Cup-Runden `R32`, `R16`, `QF`, `SF`, `F`; Crown-Ligaphase `R1`–`R5`. Neutralität für Finals ausdrücklich speichern |
| Ergebnis | Tore bleiben reguläre Spielzeit plus Nachspielzeit. `penalties`, `winnerId` und `aggregate` getrennt; keine Auswärtstorregel oder Verlängerung. Statistik und Wertung referenzieren dieselbe `competitionId` |
| Spieler / Match | `pid`, `fixture.id`, `matchRecord` und `physicalSnapshot` erhalten. Keine neue Spielererzeugung oder zusätzliche Belastungsbuchung beim Laden |

Gemeinsame Helper `v62IsInternational(competition)` und `v62Phase(competition, fixture)` ersetzen die Annahme „ein Europacup“. `v62Current`, `v62Fixtures`, `v62Table` und Matchadapter bleiben gemeinsame Zugriffe. Beide Cups dürfen nicht in bestehende `find(type === 'europe')`-Zugriffe gequetscht werden.

### 4.3 Fortschritt, Buchung und Saisonabschluss

1. Weltfortschritt und eigenes Match nutzen dieselbe Partie als Ergebnisquelle. `v64FinishFixture` schreibt Spielerleistung und Belastung einmal; bestehende `matchRecord`-/P02-Deduplikation bleibt verbindlich.
2. `v62AdvanceDay` und `v64CompleteOwnMatch` führen über einen gemeinsamen Abschlussweg zu Runde, Trainerreaktion, Wirtschaft und Ereignissen. Eine `fixture.id` darf nicht erneut in `processedEventIds` gebucht werden. Hin- und Rückspiel erhalten eigene IDs; Gesamtstand bezieht sich auf dasselbe Paar.
3. AP07 führt ein gespeichertes internationales Punkteledger mit eindeutigen Ursachen: Ergebnis je Partie und Bonus je Verein/Runde/Titel. Ergebniswertung ignoriert Elfmeterschießen. Erfassung nur nach neu abgeschlossenen Ereignissen, niemals beim Lesen.
4. Teilnehmer je Saison werden vor Anpfiff fixiert. Länderwert = aufgezeichnete Punkte / tatsächlich angetretene Vereine; ausgeschiedene Vereine bleiben im Nenner. Vereinsbeiträge tragen Vereins-, Saison- und Wettbewerbsbezug.
5. Saisonabschluss markiert jede Buchung einmalig; AP07 speichert Saisonwert, Rangfolge und nächste Teilnehmerfelder. Die rollierende Summe nutzt maximal drei abgeschlossene Saisonwerte ohne vorzeitige Rundung. Der folgende Saisonaufbau verbraucht den gespeicherten Qualifikationsstand.
6. Beide Felder sind eindeutig und überschneidungsfrei: 26 Crown-, 32 Horizon-Vereine. Ein Aufstieg des Horizon-Siegers und Nachrücker verändern erst die nächste Saison. Fehlende historische Länderpunkte gelten als nicht erfasst.

Für AP05–07 müssen `v62ResolveLeague`, `v62ResolveSingle` und `v62ResolveSecondLeg` sowohl bei eigener Partie als auch KI-Fortschritt erreichbar sein. AP04 bestimmt Spieltermine; AP07 und P02 verwenden diese Termine, nicht pauschal vierzehn identische zusätzliche Belastungen.

### 4.4 Awards, Storys und Darstellung

- Neue Awardeinträge tragen stabilen Awardkey, `season`, `competitionId`, `clubId` und gegebenenfalls `pid`/`fixtureId`. Grafikmanifest ordnet Wettbewerb und Awardkey zu; Grafikänderung vergibt keinen Titel.
- Persönliche Storys werden in `world.storyEvents = {version: 1, events: [...]}` nur für neue Expansionswelten erfasst. Ereignis-ID aus Typ und belegter Ursache, mit Saison/Tag sowie Vereins-/Spieler-/Partiereferenzen. Erneutes Laden erzeugt keinen zweiten Eintrag.
- Bestehende Vertrags-/Transferereignisse aus `world.careerEvents` bleiben ihre eigene Faktenquelle. `visibleNews` und Vereinsbüro projizieren vorhandene Fakten und Storys; sie erzeugen keine erfundene Vorgeschichte. Ungelesen-Zustand bezieht sich auf Ereignis-ID und bleibt gespeichert.
- Flutlicht-Adapter und Weltansichten lesen dieselben Controllerdaten. Beide Cups erhalten getrennte Kalender-, Statistik-, Sieger- und Awardansichten. UI liefert keine exakten Fähigkeiten oder Entwicklungspunkte, auch nicht in zugänglichen Texten. Neue Texte brauchen DE/EN-Einträge.
- Unity-/3D-Brücke bleibt Ergebnisleser. AP00 ändert weder deren Protokoll noch Unity-Quellen. Die Erweiterung übergibt dieselben IDs und native Frames; Assetabdeckung und Performance folgen AP03/11.

## 5. Zwei isolierte Prüffälle

### A – Bisherige Sechs-Länder-Welt

Synthetischer Prüffall, kein Nutzer-Spielstand: `GER-2`, Seed `ap00-legacy48-v1`, Schema 14 / Modell 10, 48 Vereine und 13 aktuelle Wettbewerbe. Der Audit erzeugt `outputs/ligaexpansion-ap00/legacy48.json` mit dem bisherigen Modell ohne neue Spieler- oder Zahlungsmarker. Validierung und JSON-Rundlauf erhalten dieselben Daten.

Folgeabnahme: Import auf separatem Testursprung, Öffnen, eigenes Match pausieren/neuladen/abschließen, Export und Saisonwechsel. Weltumfang bleibt sechs Länder, 6+2 Vereine pro Land, zehn Ligaspieltage und ein bisheriger Europacup. IDs, alte Ergebnisse und Spielerwerte bleiben unverändert; neue aktuelle Spieler-/Zahlungsmarker werden nicht ergänzt. Parallel mit einer 15/11-Welt speichern, löschen und wiederherstellen; die andere Karriere bleibt erhalten. Bestandstests prüfen bereits alte Speicherdaten, Matchfortsetzung und einmalige Buchung; der gemischte 15/11-Fall ist erst nach AP03 ausführbar.

### B – Neue Expansionswelt

**Abnahmespezifikation, noch kein ladbarer Spielstand:** Startverein `AUT-1`, Seed `ap00-expansion12-v1`, Schema 15 / Modell 11, `rules.variant: expansion12`. Startwertung und Vorjahressieger kommen aus AP01; Vereinsprofile aus AP02. AP03 erzeugt erst dann die echte Fixture, ohne diese offenen Inhalte durch Testannahmen zu Produktregeln zu machen.

Erwartung: zwölf Länder, je acht Liga-/acht Pokalvereine, 192 eindeutige Vereine; 26 aktuelle Wettbewerbe (12 Liga + 12 Pokal + Crown + Horizon). Je Liga 56 Spiele, je nationalem Pokal vollständig 15; Crown vollständig 78, Horizon 61. Vollständige Saison: **991 Partien**, schrittweiser Aufbau der K.-o.-Runden erlaubt. Beide internationalen Felder überschneidungsfrei, keine doppelte Partie und mindestens zwei volle freie Tage zwischen Pflichtspielen eines Vereins.

Folgeabnahme: gleicher Seed erzeugt identische sportliche Ausgangsdaten, abgesehen von Karriere-UUID/Zeitstempeln. JSON-/Import-Rundlauf, Matchunterbrechung und Saisonabschluss buchen nichts doppelt. Saison 2 nutzt erste echte Länderwerte; Saison 4 nutzt drei abgeschlossene Werte, nach Saison 4 fällt Saison 1 aus der rollierenden Wertung. Zehn Saisons messen Wirtschaft, Laufzeit und Speicher. Die fünf Feldspieler im bisherigen Matchformat sind von acht **Ligavereinen** zu unterscheiden; Expansionsumfang ändert nicht automatisch Feldgröße oder Spielerzahl.

## 6. Nachweise, Reproduktion und Abnahme

`node work/audit-ligaexpansion-ap00.cjs 37a702ea1fe465aa398b11e9ee4a29948295ee28` erzeugt eine isolierte Archivkopie unter `outputs/ligaexpansion-ap00/37a702ea1fe4`, Inventar und Legacy-Fixture. Benötigt Node, Git und `tar`; kein Checkout, Merge, Push oder Deployment. Der aktuelle Commit muss lokal vorhanden sein (`git fetch origin main`). Build-Nebeneffekte bleiben in der Archivkopie. Ohne Argument wird das lokal bekannte `origin/main` geprüft; vorherige Livebeobachtungen werden mit ihrem Zeitstempel übernommen, nicht automatisch neu abgerufen.

Erfolgreiche Bestandstests auf dem aktuellen Hauptzweig:

- `test-world-foundation-v61.cjs`, `test-world-competition-v62.cjs`, `test-world-match-v64.cjs`.
- `test-world-save-management-v70.cjs`, `test-world-storage-v67.cjs`, `test-world-storage-recovery.cjs`.
- `test-world-payments-v124.cjs`.
- Isolierter Einzeldatei-Build; Hashvergleich mit Live-HTML; Live-Browserprüfung von Fußversion, Ländern, Validierung, Kalender und Unity-URL.

Zusätzlich wurde `test-native-career-v160.cjs` gestartet: zwei Saisons mit fünf Feldspielern bestanden (je 259 Partien, JSON und einmalige Buchung), dann Abbruch durch das 120-Sekunden-Limit (`ETIMEDOUT`). Kein vollständig bestandener nativer Mehrsaisontest und kein Nachweis für sechs Feldspieler. Dieser Zusatzlauf gehört nicht zu den sieben bestandenen AP00-Bestandstests; vollständige native Langzeitabnahme bleibt AP11. Mit dem optionalen Argument `--native` lässt sich dieser zusätzliche Lauf anfordern.

Lokale Messdateien: `outputs/ligaexpansion-ap00/inventory.json`, `inventory-native-partial.json`, `live.json`, `unity-manifest.json`, `legacy48.json`. Sie sind Diagnoseartefakte und nicht Bestandteil des veröffentlichten Spiels. Die wichtigsten Commit-, Versions- und Hashnachweise stehen dauerhaft oben in diesem Dokument.

**AP00 ist abgeschlossen:** aktive lokale und aktuelle Wege sind unterschieden, aktuelle HTML-Auslieferung ist dem Build zugeordnet, zuständige Module und Integrationsgrenzen sind benannt, IDs/Datenübergaben sind festgelegt und beide Prüffälle beschrieben. Die größere Fixture und ihre Laufzeitabnahme bleiben ausdrücklich Aufgaben der Folgepakete.

Nächster Schritt ist AP01: offene Produktregeln und Saison-1-Grundlage entscheiden. Vor Beginn von AP02/03 muss die aktuelle Implementierungsbasis bereitgestellt werden. Länderstufen, Setzung, Namen, Grafiken, Crown-Heimrechte und Kalenderlänge gelten durch AP00 nicht als entschieden. Keine neue Version, Veröffentlichung oder Änderung von `freekickdemo/`.

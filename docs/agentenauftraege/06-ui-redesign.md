# U01 — Flutlicht: Vereinszentrale und Menüredesign

Stand: 7. Oktober 2026. **Lokale Produktintegration gestartet.** Ausdrücklicher Nutzerauftrag vom 7. Oktober 2026 mit GPT-6 Astra/high. Der Fortschritt steht in `docs/ui-redesign/integration.md`; Veröffentlichung bleibt separat.

## Auftrag und Quellen

Übernimm nach dem Startauftrag die responsive Vereinszentrale und sämtliche Verwaltungsmenüs im gewählten Flutlicht-Stil. Nutze [Produktentscheidungen](../product.md), die [aktuelle Referenz samt Inhaltszuordnung](../ui-referenz/README.md) und den tatsächlich geladenen Code in `dist/`. Neuere Nutzerentscheidungen gehen vor. Die vier früheren Varianten und ältere Screenshots dokumentieren Entwurfsstände; maßgeblich ist der aktuelle Flutlicht-Entwurf mit Geräteautomatik.

Die Referenz unter `docs/ui-referenz/` ist ein Gestaltungsmuster mit erfundenen Daten und flüchtiger Phasensteuerung. Ihre festen Vereine, Sponsorangebote, Prämien, Zeitpunkte, Karrierewerte und Regeln sind keine neuen Spielregeln. Die Produktionsoberfläche liest echte Fachzustände und verwendet die vorhandenen Aktionen. Matchdarstellung, Aufstellung und Taktik sind nicht durch diese Referenz abgenommen; P05 bearbeitet seine fachlichen Teilrenderer gesondert.

## Startumfang und technische Freigaben

U01 ist ein Dachauftrag mit den unten getrennten Teilpaketen. **Der ausdrückliche Gesamtstart liegt vor.** Er umfasst den Vorlauf, sämtliche lokalen U01-Teilpakete, ihre Integration, Fehlerkorrekturen, Prüfungen, Offline-Build und Dokumentation. Dafür ist keine erneute Nutzerfreigabe je Welle erforderlich. Ein ausdrücklich auf den Vorlauf begrenzter Start bleibt begrenzt. I00 gibt technische Übergänge innerhalb des beauftragten Umfangs selbst frei und hält den Startumfang in `docs/ui-redesign/integration.md` fest.

Die lokale Redesign-Lieferung modernisiert die bestehende Browser-Vereinswelt. Sie wartet nicht auf neue Spielerregeln, P05, Accounts, Kauf/Werbung, Enginewechsel oder Storebetrieb. Bereits vorhandene Aufstellungs-/Matchfunktionen bleiben über ihre bestehenden Wege erreichbar. Spätere Plattformanbindung und neue Fachmodule werden gesondert integriert; damit wird weder ein Enginepfad ausgewählt noch eine erste öffentliche PC-Freigabe vorgezogen.

## Exklusive Zuständigkeit und Teilpakete

Alle folgenden Pfade sind **künftige Reservierungen**, keine bereits vorhandenen Dateien oder APIs. I00 prüft sie vor Vergabe gegen den aktuellen Bestand. Abgekürzte Dateinamen in einer Tabellengruppe liegen im selben Verzeichnis wie deren erster vollständiger Pfad; ein Semikolon beginnt eine neue Gruppe. Jeder aktive Pfad hat genau einen Besitzer; Wechsel werden vor der Übergabe in `integration.md` vermerkt. Gemeinsame Dateien werden nicht über mehrere Fachslots verteilt. Eine gemeinsame `views.js` entfällt zugunsten der getrennten Ansichtsdateien.

| Paket / Besitzer | Auftrag und exklusive künftige Dateien | Eingaben und Fertigkriterium |
| --- | --- | --- |
| I00 / Integrator | `docs/ui-redesign/contracts.md`, `integration.md`; `dist/ui-flutlicht/adapter.js`, `registry.js`; `work/ui-redesign/shared/`, `preview.html`, `preview.js`, `serve.cjs`, `run.cjs` | Inventar und API-Vorschläge aufnehmen; versionierte Projektionen/Aktionen, Testzugang und echte Adapter liefern. Rahmen und jede gelieferte Ansicht lassen sich einzeln laden und prüfen. |
| U01-I / Inventar | `docs/ui-redesign/inventory.md` | Jede Zeile der Referenz-Erhaltungsliste gegen aktive Funktionen prüfen: stabile Inventar-ID, Quelle, Daten/Aktion, Zielansicht, Label, Rückweg, Paket und Erfassungsstatus. Fehlende Zuordnungen ausdrücklich benennen. Nach vollständiger Übergabe pflegt ausschließlich der Integrator diese zentrale Matrix weiter. |
| U01-R / Rahmen | `dist/ui-flutlicht/tokens.css`, `components.css`, `components.js`, `shell.js` | Bestätigte Referenz und zunächst freigegebener Komponentenvertrag. Gemeinsame Flächen, Farbstufen, Status-/Titelkomponenten, Tooltips, Navigation, Fokus und Geräteautomatik; Hell/Dunkel, DE/EN, schmale Breite und reduzierte Bewegung geprüft. |
| U01-A / Übersicht | `dist/ui-flutlicht/views/overview.js`, `overview.css` | Begegnung, Ergebnisfolge, Sponsorvertrag/-wahl, Leitaktionsanzeige und Saisonrückblick. Echte Phasen/Sperrgründe darstellen; Finanzabschluss aus U01-E und Pflichtentscheidungen aus U01-C über vereinbarte Ziele einbinden. Alle zugeordneten Informationen und Statusfälle nachweisen. |
| U01-B / Kader und Profile | `dist/ui-flutlicht/views/squad.js`, `squad.css` | Profikader sowie eigene/fremde Spielerprofile mit vollständiger Statistik, Karriere und Awards. Alle Fähigkeiten dauerhaft sichtbar, Filter/Sortierung und Rückwege erhalten; fehlende Einwechsel-/Altwerte kenntlich. Vertrags-/Transferaktionen führen zu U01-C. |
| U01-C / Transfers und Nachwuchs | `dist/ui-flutlicht/views/market.js`, `market.css` | Suche, Transferliste, Angebote, Verhandlungen, Vertragsliste/-verlängerung, Nachwuchs und deren Pflichtentscheidungen. Alle Filter, Fristen, Gegenforderungen, Kapazitäts-/Leer-/Fehlerfälle und Bestätigungen gegen bestehende Controller prüfen. Spielerprofile über U01-B öffnen. |
| U01-D / Wettbewerbe | `dist/ui-flutlicht/views/competitions.js`, `competitions.css` | Liga/Pokal/Europacup, Länder-/Saisonwahl, Archiv, Kalender, Bestenlisten und vollständige Spielberichte als Datendetail. Alle Wettbewerbs-/Ergebnisvarianten und Rückwege erhalten; keine Matchdarstellung erstellen. |
| U01-E / Verein | `dist/ui-flutlicht/views/club.js`, `club.css` | Vereins-/Trainer-/Managerprofile, Trikots, Finanzen einschließlich Sanierung und Saisonfinanzabschluss/Jugendbudget, Chronik und ewige Top 10. Ehemalige Spieler, Gleichstände und Erfassungslücken prüfen; Sponsorvertrag über U01-A, Spielerprofile über U01-B. |
| U01-F / Hilfe und Einstellungen | `dist/ui-flutlicht/views/settings.js`, `settings.css` | Sprache, Darstellungspräferenz, Hilfe/3D-Hilfe, rechtliche Hinweise sowie bestehende Karriereverwaltung/Speichern/Laden/Import/Export erreichbar halten. Speicheraktionen nutzen die vorhandenen Wege und Bestätigungen; Fehlerfälle, Tastatur und Rückwege prüfen. Keine Account-/Cloudoberfläche vorziehen. |
| Q01 / unabhängige Prüfung | `docs/ui-redesign/acceptance.md`; `work/ui-redesign/qa/`; `outputs/ui-redesign/Q01/` | Prüfkatalog früh aus Inventar und bestätigten Regeln erstellen; nach Integration den eingefrorenen Stand unabhängig gemäß Abnahmematrix prüfen. Jede Bedingung erhält bestanden/offen/fehlgeschlagen und einen Rohbeleg oder Grund. Q01 schreibt keine Produktdateien. |

U01-R und U01-A bis U01-F besitzen zusätzlich jeweils `docs/ui-redesign/packages/<Paket-ID>.md`, `work/ui-redesign/packages/<Paket-ID>/` und `outputs/ui-redesign/<Paket-ID>/<run-id>/`. Dort liegen ausschließlich der eigene Übergabebericht, DE/EN-Labelvorschläge, bereinigte Testdaten und paketbezogene Prüfungen/Nachweise. Paket-CSS verwendet den eigenen Namensraum und die freigegebenen Tokens; gemeinsame Komponenten ändert ausschließlich U01-R. Tests und Labels anderer Pakete bleiben lesend. Der Integrator übernimmt Labelvorschläge in den bestehenden Sprachpfad, gemeinsame Labels stammen aus U01-R; kein zweites Übersetzungssystem.

Bestehende Spielmodule, Router, Sprachdateien, Loader, Server und Build bearbeitet ausschließlich der Integrator seriell. Dazu gehören insbesondere `world-views-v68.js`, `world-competition-v62.js`, Markt-/Nachwuchs-/Finanzrenderer, `index.html` und `i18n-v75.js`. Er reserviert die tatsächlich benötigten Hooks vor Eingriffen. Fachzustand und Ereignisverarbeitung behalten genau eine Autorität. Alle Instanzen erhalten vorhandene und fremde Änderungen; `freekickdemo/` bleibt außerhalb.

P05 liefert bei späterer Beauftragung ausschließlich Rollen-/Eignungs-/Taktikkomponenten gegen den freigegebenen U01-R-Vertrag; deren Fehlen blockiert die lokale Bestandsmodernisierung nicht. C01/B01 liefern später ihre Fachansichten bzw. Zustände, B02 konsumiert erst vereinbarte Menüplätze. Das fiktive Hauptsponsorlogo im Begegnungsfenster ist ein Spielelement, kein externer Werbeplatz und kein Auftrag für Werbe-SDKs.

## Vorlauf und Startbedingungen

1. **Bestand aufnehmen:** Nach Redesign-Start arbeiten U01-I am Inventar, U01-R am Rahmen-/Komponentenvorschlag und Q01 am Prüfkatalog parallel. I00 reserviert Pfade und hält den Ausgangsstand einschließlich Hashes uncommittierter Quellen fest. Inventar und Vertragsvorschläge benötigen noch keinen fertigen UI-Vertrag. U01-R implementiert gemeinsame Bausteine erst nach Freigabe ihrer schmalen Schnittstelle; dafür muss nicht das Inventar aller Ansichten fertig sein.
2. **Schnittstellen festlegen:** I00 konsolidiert die Vorschläge in `contracts.md`. Für jede startende Ansicht stehen Projektion, Produzent, fehlende Werte, erlaubte Aktionen samt Payload, Fehler/Sperren, Aktualisierung, Routen/IDs/Rückwege, DE/EN-Labels und Komponentenexporte fest. Mount/Update/Unmount, Aufräumen von Listenern/Tooltips und Erhalt von Filtern/Fokus sind vereinbart. Die Darstellungspräferenz erhält einen Speicherort und Geltungsbereich im bestehenden Einstellungsweg. UI-Projektionen enthalten nur sichtbare Daten und berechnete Farbstufen; eigene UI-Zustände bleiben auf Darstellung und Bedienung wie Suchfilter, Auswahl, Sortierung, Menü und Tooltip beschränkt. Phasen, Wirtschaft und Speicherung bleiben bei den Controllern.
3. **Prüfzugang bereitstellen:** I00 liefert eine isolierte Vorschauseite mit ausdrücklich markierten, bereinigten Startfixtures unter `work/ui-redesign/shared/` sowie den Prüfaufruf `node work/ui-redesign/run.cjs --package <Paket-ID> --target fixture`. Fachpakete ergänzen später eigene Randfälle in ihren Paketpfaden. Dieselbe Paketschnittstelle unterstützt nach Anbindung `--target source` und `--target build`. Diese Befehle sind erst zu implementieren. Quell-/Buildprüfungen verwenden isolierte Testprofile und echte Controller. U01-R liefert lauffähige gemeinsame Komponenten; Q01 prüft die Datengrenzen unabhängig. Fixture-Erfolg ist keine integrierte Abnahme.
4. **Ansicht freigeben:** I00 startet ein Paket, sobald dessen Inventarzeilen vollständig zugeordnet, sein Vertrag freigegeben, seine Randzustände als Fixtures vorhanden und U01-R-Komponenten samt Prüfzugang lauffähig sind. Ein offenes fremdes Paket verhindert diese Freigabe nicht. Paketübergreifende Ziele können in der Vorschau vorübergehend einen gekennzeichneten Stub verwenden; Gesamtannahme verlangt echte Ziele und Aktionen. Der Integrator verbindet früh den Rahmen und eine schmale Übersicht mit einer echten bestehenden Aktion einschließlich Speichern/Neuladen, während weitere Ansichten gegen ihre Verträge entstehen. Diese erste echte Kette muss bestehen, bevor er weitere Ansichten produktiv anschließt.

## Parallelbelegung und laufende Integration

Es bleiben insgesamt höchstens vier Instanzen: ein Integrator und drei Fachslots. Die Teilpakete sind keine zusätzlichen Slots. Bei Redesign-Fokus gilt folgende Belegung; innerhalb des Gesamtprojekts werden nur tatsächlich freie Slots verwendet und andere Pakete entsprechend eingereiht.

| Abschnitt | Integrator | Fachslot A | Fachslot B | Fachslot C |
| --- | --- | --- | --- | --- |
| Vorlauf | Verträge, Testzugang, echte Adapter vorbereiten | U01-R | U01-I | Q01: Prüfkatalog und Datengrenzen |
| Ansichten, erste Belegung | Rahmen/Übersicht früh anbinden; kleine Lieferungen integrieren | U01-A | U01-B | U01-C |
| Ansichten, nächste freie Slots | Abgeschlossene Pakete einzeln anbinden | U01-D | U01-E | U01-F |
| Lokale Abnahme | Quell-/Buildstand einfrieren und dokumentieren | Zugeordnete Korrekturen | Zugeordnete Korrekturen | Q01: unabhängige Gesamtprüfung |

Die Tabellenzeilen sind keine globale Wartebarriere: Ein fertiges oder blockiertes Paket gibt seinen Slot für das nächste technisch startbereite Paket frei. Q01 gibt nach dem Vorlauf seinen Slot frei und kehrt für unabhängige Prüfungen zurück; seine Prüfinstanz bearbeitet keine U01-Produktdateien. U01-R wird bei nötigen Komponentenänderungen erneut eingeplant oder ausdrücklich an einen einzigen Besitzer übergeben. P05 belegt nur bei gesonderter Beauftragung einen dieser Slots.

Eine Lieferung umfasst eine benannte, im eigenen Bereich prüfbare Ansicht mit Inventar-IDs, Vertragsversion, Dateiliste, DE/EN-Labels, benötigten Integrationshooks, Prüfbefehlen und Rohbelegen. Kein Warten auf den kompletten Menüblock. I00 führt in `integration.md` je Paket Besitzer, Voraussetzungen, Vertrags-/Quellstand, Status (bereit/in Arbeit/zur Integration/integriert/blockiert/abgenommen), nächsten Schritt und Blockadegrund. Fachagenten schreiben ihre Paketberichte, I00 allein die zentrale Liste. Der Integrator priorisiert zuerst gemeinsame Blockaden und prüft Lieferungen, bevor er neue Arbeit verteilt.

Integration bleibt seriell: I00 übernimmt Registrierung, Labels und Hooks; danach prüft das liefernde Paket seine echten Aktionen und Rückwege am vereinbarten Stand. Bestehende Ansichten bleiben bis zu ihrer geprüften Ablösung erreichbar. Gegenseitige Profil-/Menülinks, DE/EN, wiederholte Pflichtaktionen und Speichern/Neuladen werden schon bei der jeweiligen Lieferung geprüft. Für jede Prüfung Quellhashes vor/nach dem Lauf festhalten; ändert sich ein relevanter Stand währenddessen, gilt der Lauf nicht als Nachweis und wird am stabilen Stand wiederholt. Q01 erhält zum Abschluss einen eingefrorenen Quell-/Offline-Buildstand.

Vertragsänderungen gehen an I00; er versioniert sie mit betroffenen Paketen und gezielten Wiederholungsprüfungen. Unbetroffene Pakete arbeiten weiter. Technische Detailentscheidungen innerhalb des freigegebenen Umfangs trifft der zuständige Besitzer mit I00. Fehlende historische Daten werden gemäß Produktregel als nicht erfasst dargestellt; fehlende aktuelle Fachaktionen werden als Blockade ihres Pakets gemeldet. Nur echte offene Produktentscheidungen, notwendiger externer Zugriff oder eine Erweiterung des Auftrags gehen gebündelt an den Nutzer. Bereits bestätigte Gestaltung wird nicht erneut abgefragt. Keine Blockade wird durch erfundene Daten oder umgangene Pflichtentscheidungen verdeckt.

## Eigenständige lokale Redesign-Abnahme

Die lokale Browserlieferung ist abgenommen, wenn U01-I vollständig auf integrierte Ziele abgebildet ist, U01-R und U01-A bis U01-F ihre Nachweise geliefert haben und Q01 die folgende Abnahmematrix am eingefrorenen Quell-/Offline-Buildstand bestanden hat. Dazu gehören echte Leitaktion und Saisonwechsel mit Pflichtentscheidungen, einmaliger Ergebnis-/Finanzbuchung, Wiederholung, Rückwegen und Speichern/Laden. Offene Bestandsfunktionen verhindern die Annahme; verkürzte Dummy-Ansichten erlauben keine Streichung.

Q01 unterscheidet lokale Browserabnahme, reale Geräte-/Screenreadernachweise und spätere Plattformintegration ausdrücklich. Fehlende Hardware wird mit Gerät, Prüffall und benötigtem Zugriff als offen dokumentiert; sie verhindert keine übrige lokale Prüfung, bedeutet aber keine vollständige Gerätefreigabe. Nicht bestandene lokale Pflichtprüfungen bleiben ein lokaler Abnahmeblocker.

I04 übernimmt den lokalen Build und die Projektdokumentation auch für diesen eigenständigen Abschluss. Neue Spieler-/Taktikregeln, Accounts, Kauf/Werbung und Engine-/Storeanbindung sind keine Voraussetzungen dafür. Für einen späteren öffentlichen Release gelten weiterhin sämtliche dann einschlägigen Gesamtprojekt-, Account- und Plattformgates. Lokale Annahme veröffentlicht nichts und hebt keine Version an.

## Verbindliche visuelle und fachliche Übergabe

Die Einzelentscheidungen liegen zentral unter [Aktueller Ausbau](../ui-referenz/README.md#aktueller-ausbau-der-flutlicht-referenz). Für die Umsetzung besonders beachten:

- Geräteeinstellung ist Standard; manueller Modus nur Hilfe & Einstellungen. Darstellung ändert keine Filter, Auswahl oder Phase. Dauerhafte Speicherung dieser Einstellung im Produkt über den gemeinsamen Einstellungsvertrag festlegen; der Dummy speichert sie nicht.
- Mobiler Kopf: Spielmarke links, Verein/Land/Liga/aktuelle Titel rechts. Null bis drei aktuelle Titel, lange Namen und mehrere Titelarten prüfen; historische Titel gehören in Chronik/Profil. Die Double-/Triple-Beispiele sind Gestaltungsmuster, keine nachträglich verliehenen Titel.
- Begegnung: Datum/Saison bei der Überschrift, Hauptsponsorlogo mittig, kompakte Zielanzeigen. Letzte fünf Ligaspiele beider Teams von alt nach neu unter den Vereinsdaten, Ergebnisfarben plus Buchstabe und Tooltip mit Gegner, Ergebnis und Heim/Auswärts. Fehlende Historie bleibt fehlend; keine erfundenen Partien ergänzen.
- Sponsorstatus braucht getrennte fachliche Angaben für aktuell auf Kurs, endgültig erreicht und bezahlt. Grün/Haken ist vorläufig, Gold/Medaille endgültig erreicht, Gelb offen. Ein Rangziel gilt vorläufig bei aktuellem Platz kleiner oder gleich Zielplatz. Nicht aus der Farbe auf eine Buchung schließen; endgültig erreicht kann je Vertrag noch unbezahlt sein. Die bereits bezahlte Dummy-Halbfinalprämie ist kein neuer Auszahlungstermin für das echte Spiel.
- Desktopkader: ganze erste Zeile auf gemeinsamer Höhe, Fähigkeiten und Frische darunter. Mobil: kompakte Karten, alle Fähigkeiten dauerhaft sichtbar, Nummer/Name/Flagge in einer Zeile; Name vollständig zugänglich. Spiele `6 (3)` sind sechs Gesamteinsätze einschließlich drei Einwechslungen. Fehlende historische Einwechselzahlen nicht als null ausgeben.
- Nur Fähigkeitsfarbstufen, auch DOM/Tooltip/aria; Talent und Entwicklungspunkte bleiben intern. Form und Frische getrennt, Farben durch Gesicht/Text/Prozent ergänzt. Kurze SVG-Bewegungen enden und respektieren reduzierte Bewegung; keine laufende 3D-Szene für Statusicons nötig.
- Pokale/Awards an allen bisherigen fachlichen Stellen erhalten; aktuelle SVGs sind Stilreferenz. Länderflaggen mit lokalem Asset und erhaltener Lizenz. Titelart, Land, Saison und Träger zugänglich beschriften.
- Ewige Top 10 Tore und Einsätze sind vereinsbezogene Pflichtspielwerte über alle erfassten Saisons einschließlich ehemaliger Spieler, soweit vorhanden. Reihenfolge absteigend; Gleichstand deterministisch, gleiche Werte nicht künstlich unterscheiden. Vollständige Spielerhistorie bleibt erreichbar. Keine Rückberechnung fehlender Altwerte.

## Benötigte Projektionen und Aktionen

I00 benennt die tatsächlichen Funktionen; diese Liste beschreibt fachliche Eingaben, keine bestehenden APIs:

| Ansicht | Benötigte Daten | Verantwortlichkeit |
| --- | --- | --- |
| Rahmen | Vereinskennung/Name/Wappen/Land/Liga, aktuelle Titel mit Saison, Sprache, Darstellung | Bestehender Karriere-/Titelzustand; U01 rendert |
| Leitaktion | echte Phase, erlaubte Aktion, Sperrgrund, offene Pflichtentscheidung | Gemeinsamer Controller; U01 sendet genau einen Auftrag |
| Begegnung | Gegner, Wettbewerb/Runde, Termin, Heim/Auswärts, letzte bis zu fünf Ligaergebnisse | Wettbewerbs-/Ergebnismodell; keine UI-Simulation |
| Sponsor | Logo/Name/Fixum, Bedingungen, Zielgrenze, aktuelle Erfüllung, endgültiger Status, Zahlungsstatus | Vorhandene Vertrags-/Wirtschaftslogik; UI zählt nichts erneut |
| Spieler | Identität/Flagge, qualitative Fähigkeiten, Form/Frische, Vertrag, Statistik und Erfassungsstatus | Bereinigte Projektion; exakte interne Werte bleiben außerhalb |
| Vereinschronik | Titel/Rekorde, kumulierte vereinsbezogene Tore/Einsätze, aktive/ehemalige Spieler | Vorhandene historische Daten; keine Altstandrekonstruktion |
| Saisonwechsel | Rückblick, Awards, Karriereenden, Vereinsentscheidung, Angebote, Budget, Transferstatus | Bestehende einmalige Ereignisse und Speichergrenzen |

## Abnahme durch U01 und Q01

- **Informationserhalt:** vollständige Inventarmatrix gegen echten Code und integrierte Ansichten; nicht allein Screenshotvergleich mit dem Dummy. Alle Tabellenwerte auch mobil erreichbar, sämtliche Spielerfähigkeiten ohne Aufklappen sichtbar.
- **Layout:** mindestens 320/390/768/1280 CSS-Pixel und kurzes Querformat, Hell/Dunkel, DE/EN, lange Namen, 200 Prozent Zoom. Kein Seitenüberlauf oder verdeckte Aktion durch Kopf, Fortschrittsleiste, Navigation oder Tastatur. Kleine Symbole mit ausreichend bedienbarer Fläche.
- **Statusfälle:** Titel 0/1/2/3, Sponsor offen/auf Kurs/erreicht sowie bezahlt/unbezahlt, Tabellenplatz an/über/unter Ziel, unbekannte/fehlende Historie, weniger als zehn Ranglisteneinträge, Gleichstände und ehemalige Spieler.
- **Bedienung:** Mouseover, Tastaturfokus, Tipp, Escape, Tipp außerhalb, erneuter Tipp, Scroll-/Routenwechsel; Tooltip lesbar und im Fenster, passende Beschriftung, kein Hoverzwang. Navigation und Filter erhalten, Suche ohne Treffer, mobile Menüs und Browser-Zurück.
- **Phasen/Speicher:** notwendige Auswahlen, doppelte Klicks, wiederholter Saisonabschluss, Neuladen/Fortsetzung, unterbrochene Buchung und Rückwege anhand bestehender Fachregeln. Keine neue Berechnung aus Layoutdaten und keine Speicherung fiktiver Referenzwerte.
- **Datenleckprüfung:** DOM, Accessibility, Tooltips und UI-Verträge enthalten keine exakten Fähigkeiten, Talentwerte oder Entwicklungspunkte. Reine Darstellung verändert weder Zufallsstrom, Ergebnis noch Wirtschaft.
- **Umgebung:** die vorhandenen Referenzchecks belegen Chromium-Layout mit angepasster Fenstergröße und Dummy-Interaktionen. Sie ersetzen keine reale Pixel-9a-/Pixel-9-Pro-XL-Abnahme, englische Produkttexte, Screenreaderprüfung oder integrierten Karrieretest.

## Startbereitschaft und offene Punkte

Designrichtung und oben verlinkte Nutzerentscheidungen sind festgehalten; das Redesign benötigt keine erneute Auswahl zwischen vier Varianten. Der Vorlauf kann nach ausdrücklichem Start ohne fertigen I00-UI-Vertrag beginnen. Parallele Ansichtsarbeit folgt den paketbezogenen technischen Startbedingungen oben, unabhängig von Matchphysik.

Die Verträge, echte Randzustände, DE/EN, Darstellungspräferenz und Nachweise sind geplante Lieferungen, noch keine erledigten Aufgaben. Aufstellung/Matchdarstellung bleiben ein eigener Entwurf. Die spätere Anbindung an den gewählten Plattformpfad und fehlende reale Hardware-/Screenreadernachweise bleiben getrennte offene Punkte; der eigenständige lokale Abschluss ersetzt sie nicht.

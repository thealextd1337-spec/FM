# UI-Referenz: Vereinszentrale

Umsetzungsübergabe: [U01 im Agentenplan](../agentenauftraege/06-ui-redesign.md).

Stand: 7. Oktober 2026. Flutlicht als Designrichtung gewählt, mit hellem und dunklem Modus. Eigenständige Dummy-Vorschau; Integration und Veröffentlichung bleiben separate Schritte.

## Auftrag und Umfang

Die Oberfläche soll moderner werden, ohne vorhandene Informationen zu verlieren. Auf Nutzerpräzisierung zunächst Übersicht und Untermenüs mit Dummy-Daten ausarbeiten, ohne Spiel- oder Spielfelddarstellung. Ein eigener Vorschlag ist gewünscht.

[Flutlicht mit Geräteautomatik](index.html?design=night#overview) · [Darstellung einstellen](index.html?design=night#settings) · [frühere vier Varianten](varianten.html). Die Vorschau funktioniert direkt als lokale HTML-Datei ohne Installation. Alternativ im Projektverzeichnis `node docs/ui-referenz/serve.cjs` ausführen und `http://127.0.0.1:4186/index.html?design=night` öffnen. Der Server stellt ausschließlich die Dateien dieser Vorschau bereit.

Die Vorschau verwendet einen erfundenen FC Lindenstadt und feste Beispieldaten. Sie lädt keine Spieldateien, externen Schriften oder Netzwerkinhalte, greift auf keine Karrieren zu und verwendet weder Browser-Storage noch eine Datenbank. Eingaben existieren nur bis zum Neuladen. Keine Simulation, Veröffentlichung, Versionsanhebung oder Änderung von `dist/`.

## Aktueller Ausbau der Flutlicht-Referenz

- Geräteautomatik bleibt Standard; die manuelle Auswahl steht nur unter Hilfe & Einstellungen. Der mobile Kopf zeigt links Spielname/Logo und rechts Vereinsname, Land/Liga und aktuelle Titel. Mehrere aktuelle Titel stehen als kleine, einzeln erklärbare Symbole nebeneinander. Unter „Inhalte & Designplanung“ sind Double und Triple als ausdrücklich getrennte Gestaltungsbeispiele sichtbar; FC Lindenstadt bleibt im normalen Beispiel amtierender Meister.
- Der dauerhafte Fortschrittsbutton schaltet ausschließlich Dummy-Phasen: Spielvorbereitung, festes Ergebnis, Saisonabschluss mit Sportbilanz, Titeln/Awards, Spielerstatistiken, Abschlusstabellen, Managerbestätigung, Saisonstart, Sponsorwahl, Finanzabschluss/Jugendbudget und fünf Transfertage. Pflichtauswahlen sperren den nächsten Schritt. Ein Neustart setzt das Beispiel zurück. Kein Spiel, keine Aufstellung und keine Matchsimulation werden gestartet.
- Die Demo-Abrechnung zeigt 2.260 Credits Übertrag; mit 1.000 Beispiel-Grundzahlung, 600 Sponsorfixum und 200 Jugendbudget bleiben 3.660 Credits. Andere Menüs bleiben ausdrücklich auf Referenzstand Saison 4, auch während des Dummy-Wechsels zu Saison 5. Neuladen verwirft sämtliche Fortschrittsauswahlen.
- Form, Frische und Fähigkeiten verwenden fünf gut unterscheidbare Farbstufen. Form hat eigene gefüllte SVG-Gesichter, Beschriftungen und kurze, endliche Animationen; reduzierte Bewegung wird respektiert. Frische bleibt Prozentwert plus Farbbalken. Die Schwellen stammen aus dem bestehenden Statusmodul. Fähigkeiten bleiben ausschließlich qualitative Farbstufen, auch für assistive Technik.
- Im Desktopkader liegt die gesamte erste Zeile aus Nummer, Name/Flagge, Position, Alter, Form und Statistiken auf gleicher Höhe. Fähigkeiten und Frische folgen darunter. Mobile Karten zeigen alle Fähigkeiten ständig, ohne Aufklappen. Nummer, Name und Flagge bilden eine Zeile. Nationalitäten bleiben zusätzlich über Erklärung, Suche und Profile zugänglich.
- Spiele werden mit Einwechslungen in Klammern angezeigt: 6 (3) bedeutet sechs Einsätze insgesamt, davon drei als Einwechselspieler. Die Erklärungen für Statistik, Flaggen, Titel, Sponsorziele und Ergebnisfolgen verwenden Flutlicht-Flächen und Goldrand. Sie öffnen per Maus, Fokus oder Tipp und schließen mit Escape, erneutem Tipp oder außerhalb. Physische Touchgeräte wurden nicht geprüft.
- Datum und Saison stehen bei der Überschrift der nächsten Begegnung. Das Sponsorlogo steht im Begegnungsfenster mittig, mobil oberhalb der beiden Vereinswappen. Zwei kompakte Bonusanzeigen darunter verlinken ihre Erklärung; der Vertrag enthält die vollständigen Bedingungen und das bereits erhaltene Fixum. Grün mit Haken bedeutet aktuell auf Zielkurs, Gold mit Medaille bereits erreicht, Gelb offen. Top 3 wird aus dem aktuellen Tabellenrang abgeleitet und ist noch keine sichere Einnahme. Die bereits bezahlte Halbfinalprämie ist im Beispielkontostand enthalten und wird nicht erneut addiert.
- Beide Vereine zeigen ihre letzten fünf Ligaspiele, ältestes links: Grün/Sieg, Gelb/Unentschieden, Rot/Niederlage. Buchstaben ergänzen die Farben; Mouseover, Fokus oder Tipp nennen Gegner, Heim/Auswärts und Ergebnis aus Sicht des jeweiligen Vereins.
- Chronik & Erfolge enthält zwei absteigende Top-10-Listen für Tore und Einsätze in Pflichtspielen des Vereins. Sie verwenden fiktive kumulierte Vereinswerte über Saison 1–4 und führen zu Spielerkarrieren. Frühere fehlende Statistik wird nicht rekonstruiert.
- Pokale und Awards sind neue SVG-Grafiken im Flutlicht-Stil. Sie stehen an den aus dem Bestand übernommenen Stellen: Vereinskopf und Tabellen, Vereins-/Managergeschichte, Spielerkarriere, Saisonrückblick, Titelarchiv und Spielbericht. Meisterschale, nationaler Pokal, Europacup, Torjäger, Spieler der Saison und Man of the Match bleiben unterscheidbar. Die PNG-Dateien in `trophies/` sind historische Referenzkopien und werden nicht für die Darstellung verwendet.
- Die sieben Länderflaggen sind unveränderte lokale SVG-Kopien aus dem bestehenden Nationalitätsmodul; Lizenz siehe [flags/LICENSE.txt](flags/LICENSE.txt). Keine externen Bildanfragen. Die Smiley-Animationen verwenden SVG/CSS; es wurden keine Meshy-Aufträge oder kostenpflichtigen Generierungen ausgelöst.

Aktuelle Nachweise: [Prüfprotokoll](flutlicht-refinement-check.json), [Tooltip-Ereignisse](tooltip-event-check.json), [mobile Begegnung](sponsor-overview-mobile.jpg), [mobiler Kader](appearances-tooltip-mobile.jpg), [SVG-Awards](awards-flutlicht-desktop.jpg). Die umfangreicheren früheren Prüfserien darunter dokumentieren jeweils den damaligen Stand; aktuelle Ergänzungen wurden gezielt geprüft. Kein Nachweis für echte Mobilhardware, Safari, vollständige Screenreaderbedienung oder eine integrierte Karriere.

## Gewählt: Flutlicht mit Hell- und Dunkelmodus

Der Nutzer hat Flutlicht als Richtung gewählt und beide Farbschemata angefordert. Graphit und Gold bleiben die Grundlage des dunklen Modus. Der helle Modus übersetzt dieselbe Gestaltung in helle neutrale Flächen, dunkle Schrift und kontrastreiche Ockertöne für Links und Kennzahlen; wichtige Aktionen bleiben goldfarben. Navigation, Daten, Statusbedeutung und die fünf Fähigkeitsfarben ändern sich beim Umschalten nicht.

Standardmäßig folgt Flutlicht der Geräteeinstellung über `prefers-color-scheme`, einschließlich Änderungen während der geöffneten Vorschau. Die Auswahl liegt ausschließlich unter „Hilfe & Einstellungen → Darstellung“: Geräteeinstellung, Hell oder Dunkel. In der Kopfzeile gibt es keinen Umschalter. Die Alternative Hell/Dunkel überschreibt das Gerät bewusst; „Geräteeinstellung“ aktiviert die Automatik wieder.

Der Farbwechsel erfolgt ohne Neuladen oder erneutes Rendern des Inhalts. Die URL merkt eine manuelle Wahl mit `mode=light` oder `mode=dark` für Navigation und Neuladen. In der Automatik bleibt der Parameter leer; `mode=system` und ungültige Werte werden ebenfalls als Automatik behandelt. Es wird kein Browser-Storage gelesen oder geschrieben. Vorhandene Links mit explizitem Hell-/Dunkelparameter bleiben manuelle Vorschauen.

Die Flutlicht-Farben sind in `variants.css` nach Rollen gebündelt: Oberfläche, Text, Navigation, Eingabe, Aktion, Fokus und Status. Beide Modi verwenden dieselben Komponenten. Gerätebeobachtung und Darstellungsauswahl liegen in `variants.js`; die gemeinsame Daten-/Menüdarstellung bleibt in `reference.js` und `mobile.js`.

Geprüft: 29 Ansichten × zwei Modi × 320/1440 Pixel (116 Prüfungen), dazu 16 Tablet-/Querformatstichproben. Kein horizontaler Seitenüberlauf; Inhalte und Fähigkeitsfarben stimmen zwischen den Modi überein. Berechnete Text-/Flächenkontraste, 44-Pixel-Bedienziele des Umschalters, Suche/Positionsfilter, aufgeklappte Fähigkeiten, Tastaturwechsel, mobile Menüs, Zurück/Vorwärts und Neuladen geprüft. Die Navigation berücksichtigt auch Verlaufseinträge, die zugleich Farbschema und Unterseite ändern. Nachweis: `flutlicht-modes-check.json`. Keine Prüfung auf echter Mobilhardware oder in Safari; keine vollständige Barrierefreiheitszertifizierung.

Die vorherigen Aufnahmen [Desktop hell](flutlicht-light-desktop.jpg), [Desktop dunkel](flutlicht-dark-desktop.jpg), [Handy hell](flutlicht-light-mobile.jpg) und [Handy dunkel](flutlicht-dark-mobile.jpg) zeigen die Farbwelten noch mit dem inzwischen entfernten Umschalter in der Kopfzeile.

## Vorausgehender Vergleich: vier Designrichtungen

Auf zusätzliche Nutzerpräzisierung wurden vier Varianten ausgearbeitet; daraus wurde inzwischen Flutlicht gewählt. Alle verwenden dieselben Dummy-Daten, Ansichten und Interaktionen aus `reference.js` und `mobile.js`; `variants.css` gestaltet deren Darstellung. Ohne `design`-Parameter bleibt die ursprüngliche Referenz erhalten.

| Variante | Charakter | Aufbau |
| --- | --- | --- |
| [01 · Vereinsbüro](index.html?design=office#overview) | Vereinsgrün, helle Flächen, großzügige Rundungen | Feste Seitennavigation, breite Begegnungskarte, gruppierte Kennzahlen |
| [02 · Flutlicht – gewählt](index.html?design=night#overview) | Graphit und Gold; inzwischen auch helle Flächen mit dunkler Schrift | Schmale Seitennavigation, betonte Kennzahlen, zwei konsistente Farbschemata |
| [03 · Vereinsjournal](index.html?design=journal#overview) | Papierfarben, Bordeaux, Serifenschrift für Überschriften | Obere Desktopnavigation, offene Inhaltsabschnitte, feine Trennlinien |
| [04 · Kontrollraum](index.html?design=control#overview) | Blau, Weiß, klare Kanten | Helle Seitennavigation, Entscheidungen links vor der Begegnung, kompakte Datenblöcke |

Auf dem Handy verwenden alle vier die vollständige untere Navigation und die vorhandenen lesbaren Datenlisten. Die Unterschiede bleiben in Typografie, Kontrast, Kennzahlenaufbau und Flächengestaltung sichtbar. Die Farbstufen der Fähigkeiten ändern sich durch die Designwahl nicht. Der Wechsel zwischen unterschiedlichen Entwürfen lädt die Seite neu; dabei werden Formeingaben und Filter zurückgesetzt. Der Wechsel zwischen Hell und Dunkel innerhalb von Flutlicht erhält sie dagegen. Es werden keine Präferenzen in Browser-Storage gespeichert.

Die Vergleichsseite bietet Desktop-/Handybilder sowie Links zu den interaktiven Entwürfen. Die Bilder zeigen echte Browseransichten bei 1440 × 960 bzw. 390 × 844 CSS-Pixeln. Sie sind keine vollständige Darstellung sämtlicher Inhalte; im interaktiven Entwurf lässt sich weiter scrollen.

Prüfung am 7. Oktober 2026: 29 Ansichten × vier Varianten × 320/1440 Pixel = 232 Layoutprüfungen mit identischem Inhalts-DOM und ohne horizontalen Seitenüberlauf. Weitere 48 Stichproben für Übersicht, Kader, Liga und Finanzen bei 768 × 1024, 844 × 390 und 1024 × 768. Dunkle Text-/Flächenkontraste über alle 29 Ansichten rechnerisch geprüft. Suchfilter, Fähigkeiten, mobile Menüführung und Designwechsel zusätzlich bedient. Zusammengefasste Nachweise: `variants-check.json`. Echte Mobilhardware, Safari und eine vollständige Barrierefreiheitsabnahme stehen weiterhin aus.

## Ursprüngliche Richtung und gemeinsamer Aufbau

Modus: Bedienen. Der Manager soll den Zustand seines Vereins erfassen, offene Entscheidungen erkennen und gezielt zu Details gelangen.

- Dunkles Vereinsgrün im Rahmen, helle Flächen für Daten, Hellgrün für aktive Navigation und eine hervorgehobene Aktion. Die Farbwelt bleibt als Doppel 6 erkennbar; mehr Flächenkontrast, ruhigere Typografie und größere Abstände schaffen eine moderne Arbeitsoberfläche.
- Auf dem Desktop eine beständige linke Navigation. Auf dem Handy eine feste untere Navigation für Übersicht, Kader und Transfers sowie ein Menü mit allen Bereichen. Keine Ansicht wird wegen Platzmangels entfernt. Das Menü berücksichtigt kurze Querformatfenster und bleibt scrollbar.
- Die Übersicht priorisiert nächste Begegnung, Vereinslage, Fristen, vollständige Ligatabelle, Wettbewerbsstatus, Finanzen und jüngste Ereignisse. Die Tabelle umfasst alle sechs Vereine. Details haben feste Ziele, statt in einer langen Liste gleichrangiger Kästen zu verschwinden.
- Untermenüs gliedern umfangreiche Bereiche: Kader/Verträge/Nachwuchs, Suche/Angebote/Transferliste/Bilanz, Liga/Pokal/Europacup/Länder/Archiv sowie Vereinsprofil/Finanzen/Sponsor/Chronik/Manager.
- Spielerprofile sind eigenständige Detailansichten mit Rückweg. Fähigkeiten, Form, Frische, Vertragsdaten und Saisonstatistik bleiben unterscheidbar. Karriere und Auszeichnungen erhalten einen zweiten Bereich.

Das helle Vereinsgrün war die Ausgangsrichtung. Es wird durch die gewählte Richtung Flutlicht mit Hell-/Dunkelmodus abgelöst. Die Informationszuordnung und der mobile Bedienumfang bleiben Grundlage der weiteren Planung.

## Inhaltszuordnung: Bestand → Ziel

Grundlage sind die aktiven Quellen in `dist/`, besonders `world-foundation-v61.js`, `world-competition-v62.js`, `world-market-ui-v66.js`, `world-transfer-list-ui-v72.js`, `world-youth-ui-v67.js`, `world-payments-ui-v124.js`, `world-views-v68.js`, `world-match-ui-v64.js`, `world-career-plan-v64.js` und `strength-v55.js`. Die gesichtete laufende Oberfläche bestätigt den dunklen Rahmen, die acht Karrierebereiche und die eigenständigen Saisonabschlusszustände. Historische Dokumentation zur Sechserliga darf den aktiven Vereinswelt-Code nicht ersetzen.

Die Tabelle ist die Erhaltungsliste für die spätere Umsetzung. Eine verkürzte Dummy-Ansicht ist keine Entscheidung, die übrigen Inhalte zu streichen.

| Bestehende Information oder Funktion | Vorgesehenes Ziel | Stand in dieser Vorschau |
| --- | --- | --- |
| Vereinsname, Wappen, Land, Saison, Manager und aktuelle Phase | Gemeinsamer Rahmen; vollständige Identität unter Verein | Beispielidentität; Rahmen; Saison |
| Phasenabhängige Leitaktion, Sponsorwahl, Transfertage, Spielvorbereitung, Ergebnisse, Saisonabschluss | Gemeinsame Kopfzeile bzw. zugehörige Entscheidung; klare Beschriftung je Phase | Dummy-Phasenfolge einschließlich Saisonwechsel; keine echte Spielsimulation |
| Nächster Gegner, Datum, Wettbewerb, Runde/Tabellenrang, Heim/Auswärts, Form, Gegnerdetails | Übersicht → Gegnerprofil; Kalender | Dummy-Begegnung und Gegnerprofil |
| Alle sechs Tabellenzeilen, Spiele, S/U/N, Tore, Tordifferenz, Punkte | Übersicht mit Kurzspalten; Wettbewerbe → Liga mit vollständigen Spalten | Beide Tabellenformen |
| Eigener Pokal- und Europacupstatus, Gruppen/K.-o.-Runden, Gesamtergebnisse, Elfmeterschießen | Wettbewerbe mit eigenem Bereich je Wettbewerb | Pokalbaum und Nichtqualifikation; weitere Varianten später |
| Weltfortschritt, übrige Ergebnisse und Vereins-/Trainernachrichten | Übersicht → „Seit deinem letzten Fortschritt“; relevante Detailziele | Zwei Ereignisse als Muster |
| Kaderanzahl/-grenze, Positionsverteilung, Nummer, Name, Nationalität, Position, Alter, Einsätze, Tore, Vorlagen, Note | Kader → Profikader; sortierbare und filterbare Liste | Elf Profis, alle genannten Felder; Sortierung exemplarisch Nummer/Name/Alter |
| Bekannte Fähigkeiten, Form, Frische | Kader und Spielerprofil; Status getrennt von Fähigkeiten | Alle bestehenden Fähigkeitsnamen qualitativ; Form/Frische separat |
| Spielerprofil: Eigentümerverein, Nationalität, Rückennummer, Marktwert, Gehalt, Vertragsbeginn/-ende, Restlaufzeit, Einsatz-Zusage; Simulations-/Rücktrittsstatus | Spielerprofil → Übersicht | Häufige Felder beispielhaft; Vertragsbeginn, abgeleitete Restlaufzeit und Sonderstatus später vollständig |
| Aktuelle Saison: Einsätze, Minuten, Form, Tacklingquote mit Versuchen, Schüsse, Tore, Hinweise auf teilweise erfasste Werte | Spielerprofil → Übersicht | Beispiele und ausdrücklich „Nicht erfasst“ |
| Leistungen je Saison und Verein, Karrierewerte, Awards, Mannschaftstitel und Man of the Match | Spielerprofil → Karriere & Auszeichnungen | Zwei Saisons und Erfolge als Muster; vollständige Historie später |
| Vertragsliste, Laufzeit, Jahresgehalt, Zusagen, Verhandlungsfenster, Verlängerung, Gegenforderungen und Pflichtbestätigungen | Kader → Verträge → Verlängerung | Liste und Konditionsvorschau; Gegenforderungen/Fristenzustände später |
| Nachwuchspool, Positions-/Sortierfilter, Ablauf, Ausbildungsentschädigung, künftiges Gehalt, Kapazität, Übernahme und Entlassung | Kader → Nachwuchs | Drei Kandidaten, Positionsfilter, Kosten, Ablauf und harmlose Übernahmeprüfung; Entlassungsbestätigung später |
| Transferfilter Land, Nationalität, Verein, Position, Ablöse; Profile und Preis-/Gehaltsorientierung | Transfers → Spielersuche | Suche über Name/Verein/Nationalität, Position und Ablöse; separate Land-/Nationalitäts-/Vereinsfilter später |
| Eigene Transferliste, Bereitschaft, Wunschpreis, Kaufangebote, Gegenangebote, ablaufende Fristen | Transfers → eigene Transferliste / Angebote & Verhandlungen | Beispielangebot, Wunschpreis, Bereitschaft, Frist und offene Antwort |
| Transferfensterstatus, offene Pflichtentscheidungen, Resultate und Transferbilanz inklusive Zu-/Abgänge | Transfers; notwendige Entscheidungen zusätzlich Übersicht | Phasenhinweis und Bilanz als Beispiele; Pflichtdialogfolge später |
| Eigene und fremde Länderwettbewerbe, Saisonwahl, Ergebnisse, Pokalbaum, Europacup, Titelarchiv | Wettbewerbe → fünf Unterbereiche; Saisonsteuerung im Ziel | Länderwechsel mit drei Beispielvereinen; zwei Archivzustände. Vollständige Länder, Saisons, sechs Vereine und Ergebnisse später |
| Chronologischer Kalender über alle Wettbewerbe und Saisons; Ergebnis und Bericht | Eigenes Kalendermenü | Sechs Termine, Wettbewerbs-/Statusfilter und ein Berichtsauszug |
| Bestenlisten Tore, Vorlagen, Zu-null, Fouls, verwandelte/verschossene Elfmeter; Saison-/Wettbewerbsbezug | Statistiken | Umschaltbare Beispielranglisten und echte Leeransicht |
| Vereinsgeschichte, Stadt, Wappen, drei Farben, Heim/Auswärts, zwei Torwarttrikots, Erfolge und Rekorde | Verein → Profil / Chronik & Erfolge | Identität, Heim/Auswärts, Titel und ewige Top 10 Tore/Einsätze; beide Torwarttrikots später |
| Finanzen: Kontostand, Gehälter, sichere Prognose, mögliche Sponsorboni, nächste Zahlung, Sanierung, Buchungen mit Datum/Saldo | Verein → Finanzen; komprimiert auf Übersicht | Regulärer Zustand, Prognosen, Beispielbuchungen und Jahresabrechnung |
| Saisonfinanzabschluss: Einnahmen-/Ausgabenkategorien, Übertrag, bezahlte Gehälter, neue Saison, Jugendförderung und verbleibendes Budget | Eigener Saisonabschluss innerhalb des Vereinsablaufs | Dummy-Finanzabschluss mit Übertrag, Sponsorfixum, Jugendbudget und Gehaltsprojektion |
| Hauptsponsor: Auswahl aus drei Angeboten, sofortiges Fixum, bedingte Boni | Übersicht kompakt; Verein → Sponsor; Saisonstart als Entscheidung | Sponsorlogo/kompakte Zielzustände in der Begegnung, vollständiger Vertrag und drei Dummy-Angebote im Saisonwechsel |
| Managerlaufbahn, Ruf, Stationen; fremde Vereins- und Trainerprofile, Kader und letzte Elf | Verein → Manager; verknüpfte Detailansichten mit Rückweg | Eigene Laufbahn und ein fremdes Vereinsprofil; fremder Trainer/Kader und letzte Elf später |
| Saisonrückblick, Titel/Awards, Karriereenden, Vereinswechsel, Finanzabschluss, nächste Saison | Vollständiger phasenabhängiger Abschlussablauf | Bedienbarer Dummy-Saisonwechsel mit Pflichtbestätigungen; Vereinswechsel/echte Karriere nicht simuliert |
| Deutsch/Englisch, Hilfe, 3D-Hilfe, Speichern/Laden/Import/Export, Karriereverwaltung, Impressum, Datenschutz, Speicherhinweise | Hilfe & Einstellungen / Fußbereich; bestehende Startseite | Erreichbare Konzeptseite; kein Zugriff auf Spielstände, keine echte Exportaktion |
| Matchplan, Aufstellung, Bank, Rollen/Ausrichtung, Taktikvorlagen, Spielpause, Wechsel, 2D/3D, Rückschau, Vollbild, Elfmeterablauf | Eigener späterer Spiel-/Taktikentwurf; Anschluss an die gemeinsame Navigation | Auf Nutzerwunsch keine Darstellung; keine Streichung aus dem Produkt |
| Spielbericht: Tore/Eigentore, Vorlagen, Teamstatistiken, beide Aufstellungen, Noten, Einzelstatistiken und Auszeichnungen | Bericht als Datendetail; Visualisierung der Partie separat | Ein gekennzeichneter Berichtsauszug ohne Spielfeld |

## Daten- und Darstellungsregeln

1. Exakte Fähigkeitswerte und Entwicklungspunkte erscheinen weder sichtbar noch in zugänglichen Beschriftungen. Fähigkeitsfarben haben qualitative Farbnamen in den zugänglichen Beschriftungen. Die Farblegende behält die Reihenfolge Violettgrau, Blaugrau, Gelb, Orange, Pink. Die Reihenfolge und Frischeschwellen folgen dem Bestand; Farbtöne und SVG-Formgesichter sind für die neue Oberfläche gestaltet.
2. Das geplante verborgene Talent erhält auch im Design kein sichtbares Ersatzsignal. Keine Sterne, Talentstufe oder Wachstumspunktzahl.
3. Alter, Geld, Ergebnisse, Minuten, Frische und Matchnoten bleiben normale Zahlen, da sie keine exakten Fähigkeitswerte sind.
4. Fehlende alte Messwerte ausdrücklich als nicht erfasst darstellen. Null, kein Versuch und nicht erfasst sind unterschiedliche Zustände. Keine Nachberechnung für das neue Layout.
5. Neu geplante Rollen, Körpergröße, mentale Fähigkeiten, Account-/Cloudfunktionen oder ein neuer Mannschaftsmodus werden durch diesen UI-Entwurf nicht vorgezogen. Bestehende und geplante Inhalte getrennt halten.
6. Bestehende Spielstände, aktive Spielregeln und Spielabläufe bleiben unverändert. `freekickdemo/` bleibt außerhalb des Auftrags.

## Responsivität und Bedienung

- Desktop: stabile linke Navigation; Übersicht mit zwei Spalten, lange Listen als Tabellen.
- Bis 900 Pixel Breite: eine Inhaltsspalte und feste untere Navigation mit beschrifteten Zielen. Untermenüs umbrechen, damit alle Ziele ohne seitliches Suchen sichtbar sind. In der Übersicht folgen offene Entscheidungen direkt auf die nächste Begegnung.
- Mobile Kaderliste: Identität, Position, Alter, Nationalität, Form, Frische und Saisonstatistik je Spieler; alle Fähigkeiten dauerhaft sichtbar. Suche, Positionsfilter und Sortierung verwenden dieselben Daten wie die Desktop-Tabelle.
- Andere Datentabellen werden auf Mobilgeräten als beschriftete Listen ausgegeben. Dazu werden dieselben Tabellenzellen übernommen; keine fachliche Spalte wird weggelassen. Desktop behält seine Tabellen.
- Touchflächen mindestens 44 Pixel hoch; Eingabefelder mit 16-Pixel-Schrift. Sicherheitsabstände für Displayaussparungen und die untere Systemleiste. Hoch- und Querformat verwenden dieselben Inhalte.
- Tastatur: normale Links, Buttons und native Eingabefelder; sichtbarer Fokus; Sprung zum Hauptinhalt; Fokus nach Ansichtswechsel am Hauptinhalt. Die browserseitige Zurück-Funktion folgt den Fragment-URLs.
- Qualitative Fähigkeiten besitzen beschriftete Farbstufen für assistive Technik. Die Text-/Flächenkontraste der fünf Fähigkeitsfarben wurden in Hell und Dunkel rechnerisch geprüft; eine vollständige Farbsinn-/Screenreaderabnahme steht aus.
- Keine dekorativen Ladeanimationen. Bewegungsreduktion berücksichtigt; lokale Daten benötigen keinen künstlichen Ladezustand.

## Abnahme vor späterer Integration

- Alle Zeilen der Inhaltszuordnung gegen den dann aktuellen aktiven Code abhaken. Je bestehender Information und Aktion den genauen Zielort, die zugängliche Bezeichnung und den Rückweg festhalten. Diese erste Referenz allein ist kein Vollständigkeitsnachweis einer integrierten Oberfläche.
- Auf kleinen Mobilbreiten, Tablet und Desktop prüfen: nichts abgeschnitten, vollständige Tabellen erreichbar, keine Aktion überdeckt. Lange Namen, DE/EN, Tastatur und 200 Prozent Zoom einschließen.
- Kaderlimit, leerer Pool, leere Suche, unbekannte Fähigkeiten, fehlende alte Statistik, auslaufende Verträge, erfolglose Verhandlung, Sanierung und alle Saisonphasen gesondert gestalten.
- Speicher-/Importfehler und doppelte Pflichtaktionen im echten Spiel prüfen. Der Dummy-Entwurf kann diese technischen Zustände nicht nachweisen.
- Erst nach Abstimmung der Referenz einen gesonderten Integrationsauftrag formulieren. Eine Veröffentlichung benötigt weiterhin Versionsgleichstand in Quellcode, Build und Live-Seite gemäß `docs/development.md`.

## Prüfstand

Erster Entwurf vor der anschließenden mobilen Überarbeitung:

- `node --check` für Vorschau und Vorschau-Server: bestanden. `git diff --check` für die bearbeiteten Dokumente: ohne Fehler.
- 29 Ansichten bei 390 × 844 CSS-Pixeln geöffnet: jeweils Hauptüberschrift vorhanden, kein horizontaler Überlauf der Gesamtseite und keine erfassten Browserwarnungen oder JavaScript-Fehler. Breite Datentabellen scrollen innerhalb ihres Bereichs.
- Kadersuche, Spielerprofil, Karrierebereich, Ablösefilter, leere Suche, Filterreset, leerer Europacupkalender, Vertrags-Konditionsprüfung und Verkaufsangebotsvorschau im Browser bestätigt. [Prüfprotokoll](browser-check.json).
- Übersicht auf Desktop und Mobil visuell geprüft; Kader zusätzlich mobil gesichtet. [Desktopaufnahme](desktop.jpg), [Mobilaufnahme](mobile.jpg).
- Keine Vollabnahme der Spieloberfläche: Das ist ein Dummy-Entwurf, kein Build. Englische Texte, echte Geräte, Screenreader, 200-Prozent-Zoom und die in der Inhaltszuordnung genannten Folgeansichten sind noch nicht abgenommen.

### Mobile Überarbeitung

Auf ausdrücklichen Nutzerwunsch ist mobile Bedienbarkeit Teil der Referenz, nicht nur eine spätere Integrationsanforderung. `mobile.css` und `mobile.js` ergänzen die isolierte Vorschau. Keine Änderung an `dist/`, der Spielversion oder bestehenden Spielständen.

- 29 Ansichten bei 320 × 700, 430 × 932, 844 × 390, 768 × 1024 und 1265 × 800 CSS-Pixeln geprüft: 145 Layoutprüfungen ohne horizontalen Seitenüberlauf und ohne erfasste JavaScript-Fehler. Bei mobilen Breiten werden Datentabellen durch vollständige Listen ersetzt.
- Bei 390 × 844 zusätzlich Navigation, Menüöffnung/-schließung, Escape, Spielersuche, aufklappbare Fähigkeiten und Spielerprofil geprüft. Die Anzeige verwendet für alle Fähigkeiten weiterhin ausschließlich Farbstufen.
- Zelleninhalte von Liga, Verträgen, Finanzbuchungen, Karriere und Spielbericht mit ihren mobilen Listen abgeglichen: keine fehlenden Werte. Mobile Sortierung nach Alter bestätigt; am Desktop bleiben Tabelle und bisherige Sortierknöpfe sichtbar. Die im mobilen Übersichtsfenster sichtbaren interaktiven Elemente erreichen mindestens 44 Pixel Höhe.
- Nachweis aus dem Chromium-basierten eingebetteten Browser mit angepasster Fenstergröße und Browseraktionen. Keine physische Touch-/Gestenprüfung, kein Nachweis für Safari oder reale Android-Hardware. [Mobiles Prüfprotokoll](mobile-check.json).
- Aktuelle Aufnahmen: [mobile Übersicht](mobile-v2.jpg), [mobile Kaderliste](mobile-squad-v2.jpg). Frühere `mobile.jpg`/`desktop.jpg` dokumentieren den ersten Entwurf.

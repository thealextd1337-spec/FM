# AP08 – Storyereignisse und Vereinsbüro

Stand: lokal umgesetzt am 10. Oktober 2026, nicht veröffentlicht. Neue Expansionskarrieren erhalten `world.storyLog.version: 170`. Laden, Anzeigen und Export erzeugen keine Ereignisse; bestehende AP06/AP07-Karrieren bleiben ohne nachträgliche Storyhistorie.

## Gespeicherte Fakten

- Erste internationale Teilnahme pro Verein, erstmals erreichte Halbfinals, Finals und Titel je Cup gelten ausdrücklich **innerhalb dieser Karriere**. Die fiktiven Vorjahressieger aus AP01 werden dadurch nicht als erstmals erfolgreiche Vereine der Weltgeschichte bezeichnet.
- Qualifikationen erzeugen Teilnahmeereignisse beim Saisonstart. Einzugsmeldungen verweisen auf das tatsächlich gewonnene Rückspiel; Titel auf das Finale. Stabile fachliche Kennungen verhindern Wiederholungen. Die internationale Runde kann im eigenen physischen Spiel oder durch reguläre Simulation abgeschlossen werden.
- Wiedersehen: höchstens einmal je Saison und Gegner für den aktuellen Managerverein. Auch nationale Spiele gegen eine frühere Station sind relevant. Relevant sind eine abgeschlossene frühere Managerstation oder ein gespeichertes internationales Halbfinal-/Finalduell einer früheren Saison. Gewöhnliche wiederkehrende Ligagegner erzeugen keine Meldungen.
- Eigengewächs: ein nachgewiesener Nachwuchsabschluss im bestehenden Karriereprotokoll und die vereinsgebundene native Nachwuchskennung müssen übereinstimmen. Nur ein Finalsieg mit einem Tor Unterschied ohne Elfmeterschießen und mit vollständiger gespeicherter Torfolge erzeugt eine Meldung zum entscheidenden Tor. Das relevante Tor und die Herkunftsreferenz bleiben als unabhängiger Schnappschuss erhalten, wenn native Berichte später verdichtet werden. Es gibt keine Behauptung bei fehlender Herkunft oder Torfolge.
- Zusätzliche Horizon-Plätze: erst nach geschlossenem Wertungsjahr, wenn ein Land von Rang 9–12 in die ersten acht steigt. Jeder tatsächlich positive Vereinsbeitrag wird mit Punktzahl, festem Teilnehmernenner und Folgesaison gespeichert. Die Texte beschreiben einen Beitrag zur gemeinsamen Wertung; sie behaupten keine alleinige Verursachung.

`v170History(career, {clubId, season})` liefert unabhängige chronologisch sortierte Kopien. Diese Daten stehen Büro, Vereinschronik und späteren Vorschau-/Rückblickansichten zur Verfügung. Meilensteine werden nicht beim Saisonwechsel gekürzt. Spielerfähigkeiten und Entwicklungspunkte erscheinen in keinem Storytext.

## Büro und Navigation

Das Büro sitzt in der bestehenden Expansionszentrale unter den Karriereaktionen. Chronologische Karten betreffen den aktuellen Verein; Vereinsprofile enthalten dauerhaft dessen gespeicherte Meilensteine. Nachrichten besitzen einen separat gespeicherten Lesestatus, Einzel- und Sammelaktionen. Informationsmeldungen sperren keine Fortsetzung; Sponsor-, Budget- und Vereinsentscheidungen nutzen ihre vorhandenen Aktionen.

Bestehende Trainermeldungen werden aus `eventLog.visibleNews` gelesen, nicht nochmals kopiert. Wie im bisherigen Filter werden nur das eigene Land und internationale Gegner berücksichtigt; dabei werden beide Cups geprüft. Höchstens fünf aktuelle Trainermeldungen erscheinen. Ihre bestehenden Kennungen tragen den Lesestatus.

Links öffnen native Vereins-/Spielerprofile und eine Ergebnisansicht der referenzierten Partie einschließlich Gesamtergebnis, Elfmeterschießen und noch vorhandener Torfolge. Die Ergebnisansicht ist kein nachgebauter vollständiger historischer Matchbericht. Profil- und Ergebnisdialoge kehren zum offenen Büro zurück. Bereits vorhandene Fähigkeitsanzeigen bleiben qualitative Farbstufen. Büro- und Storytexte stehen Deutsch/Englisch bereit; die vollständige Übersetzung der Expansionsoberfläche bleibt AP10 zugeordnet.

## Prüfung

- `node work/test-world-expansion-stories-v170.cjs`: eine vollständige Saison mit 991 kontrollierten Ergebnissen durch native Wettbewerbs-, Wirtschafts- und Saisontransaktionen; 109 gespeicherte Meilensteine; Folgejahr, Export/Import, unverändernde Abfragen, einmalige Buchungen, Lesestatus und Ablehnung beschädigter Ereignisse. Gezielte Faktenfälle prüfen Eigengewächs-Tor und Wiedersehen; sie sind keine behaupteten natürlichen Matchverläufe. Trainernachrichtenfilter und Lesestatus sind separat geprüft.
- Produktnativer T3-Browser, eigenes Inkognito-Profil: neue AP08-Karriere, gespeicherter Lesestatus nach Neuladen, Deutsch/Englisch, Vereinschronik, Vereinsprofil → Spielerprofil → Büro. Tatsächliche 390 × 844 CSS-Pixel, kein Seiten- oder Profildialogüberlauf. Ein regulärer nativer Spieltag mit 48 Partien bleibt gültig. Ergebnislink gezielt an einer tatsächlich gespeicherten Partie geprüft; der dafür temporär eingesetzte Testknopf wurde entfernt und verändert den Spielstand nicht.
- AP06-Aktivvalidierung und AP07-Qualifikations-/Wertungsregression bestanden. Beide neuen Module sind im Quell-HTML und identisch in beiden Einzeldatei-Builds enthalten; Assetprüfung und Syntaxprüfungen bestanden.

Nachweise: [automatische Prüfung](../outputs/ligaexpansion-ap08/tests.json), [Browserprüfung](../outputs/ligaexpansion-ap08/browser.json). Keine Veröffentlichung, Versionsnummer weiterhin 121 im isolierten Implementierungsstand. AP09-Grafiken, AP10-Gesamtoberfläche und AP11-Geräteabnahme bleiben offen.

## Gründungslegenden – redaktionelle Entwürfe, nicht freigegebene Weltgeschichte

**Crown Cup:** Die Landesmeister und Pokalsieger wollten ihren Erfolg an einer gemeinsamen Spitze messen. Aus dem Treffen ihrer Verbände entstand der Crown Cup: zunächst Begegnungen über Landesgrenzen, dann die Entscheidung um eine gemeinsame Krone. Der Titel steht für einen Erfolg, der über die Heimatliga hinaus Bestand hat.

**Horizon Cup:** Vereine hinter den nationalen Spitzen suchten einen eigenen Weg über die Landesgrenzen. Der Horizon Cup gab diesem Aufbruch eine Bühne. Jede neue Runde bringt eine neue Auslosung; die nächste Aussicht muss auf dem Platz verdient werden.

Diese Vorschläge nennen keine erfundenen Gründungsjahre, Gründervereine oder gespielten Ergebnisse. Sie werden nicht als Laufzeitmeldungen ausgespielt. Die Aufnahme als feste Produktgeschichte erfordert eine spätere redaktionelle Freigabe.

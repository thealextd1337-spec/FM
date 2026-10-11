# Layout- und Typografieprüfung der erweiterten Vereinswelt

Die Befunde F1–F7 werden mit [Release 125](release-125.md) korrigiert und erneut geprüft. Dieser Bericht hält den ursprünglichen Auditstand fest. F8 (Downloadgröße) bleibt als getrennte Optimierung offen.

Stand: 11. Oktober 2026. Geprüft wurde der lokale, wieder an Flutlicht angebundene Quellstand im Worktree `work/ligaexpansion-ap03`, Fußversion 124. Die Wiederherstellung ist noch nicht veröffentlicht. Diese Prüfung ändert keine Spieloberfläche oder Spielregeln.

## Ergebnis

Die Hauptnavigation und die Karriereansichten bilden wieder eine zusammenhängende Oberfläche. Die Gestaltung ist aber noch nicht durchgängig: Der neue Karriere-Start fällt vollständig auf das alte Erscheinungsbild zurück. Einzelne alte Farben und Schriften bleiben außerdem in Spielerprofilen, Sponsoransichten und Saisonrückblicken bestehen. Die Kontrastfehler sollten vor einer Veröffentlichung korrigiert werden.

Technische Audit-Einschätzung: **11/20**, mit wesentlichen Verbesserungen vor Veröffentlichung. Dies ist eine Arbeitseinschätzung, keine vollständige WCAG-Zertifizierung.

| Dimension | Punkte / 4 | Begründung |
| --- | --- | --- |
| Zugänglichkeit | 2 | Nachgewiesene Textkontrastfehler; Fokusmarkierungen und beschriftete Bedienelemente vorhanden. |
| Performance | 2 | Große eingebettete Bildmenge, Einzeldatei rund 92 MB; keine Netzwerk-/Startzeitmessung dieses Audits. |
| Responsive Layout | 3 | Kein Seitenüberlauf in den geprüften Fällen; kleine Bedienelemente und sehr kleine Spielfeldbeschriftung. |
| Themes | 2 | Hell/Dunkel vorhanden, aber alte dunkle Flächen kollidieren mit neuen hellen Textfarben. |
| Umsetzungskonsistenz | 2 | Flutlicht als Produktgestaltung erkennbar; Startadapter und einzelne native Details bleiben unvollständig angebunden. |

**8 Befunde: 2 × P1, 6 × P2; kein festgestellter P0.** P1 bedeutet vor Veröffentlichung beheben, P2 einen anschließenden gezielten Korrekturdurchgang. Gestaltungsvorschläge stehen separat.

## Nachgewiesene Fehler und Schwächen

### F1 · P1 · Der neue Startablauf verwendet die alte Oberfläche

- **Ort:** `dist/ui-flutlicht/start.js:30`, `dist/world-expansion-interface-v172.js:54`, `dist/world-expansion-interface-v172.js:60`.
- **Beleg:** Alle vier Schritte – Managername, Land, Verein, Bestätigung – verwenden `.v172-start`, Inter/Arial und Überschriften mit Barlow Condensed/Impact. Dunkelgrüne Flächen und grüne Hauptaktionen bleiben erhalten, obwohl Hell ausgewählt wurde. Der Startadapter erkennt nur die frühere direkt untergeordnete `.v61-steps`-Struktur. Die neue Struktur erfüllt diese Bedingung nicht.
- **Folge:** Ein sichtbarer Wechsel der Produktgestaltung beim Karrierebeginn; die gewählte Darstellung greift dort nicht. Der Nutzerhinweis mit der markierten Startmaske ist bestätigt.
- **Korrektur:** Den neuen Startablauf in den vorhandenen Startadapter einbeziehen und seine tatsächlich verwendeten Komponenten auf Flutlicht-Tokens abbilden. Die vier Schritte, Vereine und Spieloptionen erhalten.
- **Werkzeugrichtung:** `$impeccable harden`, anschließend `$impeccable typeset`.
- [Startmaske](../outputs/ui-restore/layout-audit/start-name-390.png), [Bestätigung](../outputs/ui-restore/layout-audit/start-review-390.png).

### F2 · P1 · Kontrastfehler durch vermischte alte und neue Farben

Die folgenden Werte sind auf einfachen, einfarbigen Flächen nachgemessen und visuell bestätigt. Für diese kleinen Texte sind 4,5:1 anzustreben; die Werte liegen deutlich darunter.

| Stelle | Gemessener Kontrast | Sichtbare Folge |
| --- | --- | --- |
| Kader: Positionszahlen unter „Aktueller Kader“ | 1,01:1 | Hellgrüne Zahlen verschwinden fast auf dem hellgrauen Hintergrund. |
| Spielerprofil: „Fähigkeiten“ / „Einsatzstatistik“ | 1,28:1 | Alte grüne Abschnittsüberschriften auf weißem Hintergrund. |
| Verein → Sponsor: „Fixum erhalten“ | 2,47:1 | Dunkle neue Schrift auf einer verbliebenen dunkelgrünen Statusfläche. |
| Rückblick Seite 1: „Veränderungen zum Saisonende“ und Spielername | 1,13:1 | Der Hintergrund bleibt dunkel, die Überschrift und der Name werden ebenfalls dunkel. |
| Rückblick Seite 4: Meister-/Pokalsieger-Beschriftungen und Vereinslinks | 2,36:1 / 2,20:1 | Titel und Siegernamen sind schwer lesbar. |

- **Ort:** `dist/ui-flutlicht/views/squad.css:34`, `dist/ui-flutlicht/views/club.css`, `dist/ui-flutlicht/views/overview.css:59`, `dist/world-economy-v66.css:6`, `dist/world-youth-v67.css:26`, `.v67-season-departures` aus `dist/world-youth-ui-v67.js:72`.
- **Ursache:** Die neuen Textregeln und alten Komponentenflächen sind nicht gemeinsam auf ein Theme umgestellt. Im dunklen Modus verschwinden mehrere dieser Fehler, weshalb ein reiner Dunkeltest sie übersieht.
- **Korrektur:** Je betroffener Komponente Hintergrund, Text, Links und Statusfarben zusammen auf dieselben Theme-Tokens umstellen. Die bestätigten fünf Fähigkeitsfarbstufen beibehalten; keine Zahlenwerte sichtbar machen.
- **Standard:** Textkontrast, WCAG 1.4.3.
- **Werkzeugrichtung:** `$impeccable harden` / `$impeccable colorize`.
- [Sponsor](../outputs/ui-restore/layout-audit/390-light-club-sponsor.png), [Saisonabgänge](../outputs/ui-restore/layout-audit/confirm-review-0.png), [Siegerübersicht](../outputs/ui-restore/layout-audit/confirm-review-3.png).

### F3 · P2 · Leere Karte über den Wettbewerben

- **Ort:** `dist/ui-flutlicht/navigation.js:92`, `.v68-competition-summary`.
- **Beleg:** Der Titelarchiv-Inhalt wird in seinen Unterbereich verschoben. Die leere äußere `section.v62-season.v68-competition-summary` bleibt stehen: null Kinder, leerer Text, 34 Pixel Höhe bei 390 Pixel Breite. Zusammen mit Abstand entsteht eine auffällige leere Karte vor dem eigentlichen Inhalt; auch am Desktop sichtbar.
- **Korrektur:** Den geleerten Präsentationscontainer entfernen oder gezielt ausblenden, nachdem das Archiv umgehängt wurde. Archiv und Navigation erhalten.
- **Werkzeugrichtung:** `$impeccable layout`.
- [Wettbewerbe](../outputs/ui-restore/layout-audit/390-light-competition-ranking.png).

### F4 · P2 · Schriftumstellung bleibt in Details unvollständig

- **Ort:** `dist/ui-flutlicht/tokens.css:14`, `dist/ui-flutlicht/views/overview.css:60`, `dist/world-youth-v67.css:19`.
- **Beleg:** Die normale Karriere nutzt Segoe UI/Arial; der Start Inter/Arial. „Platz 3 von 8“, „Ausgeschieden“ und „Nicht qualifiziert“ im Saisonrückblick verwenden weiterhin Barlow Condensed/Impact. Weitere native Kleinteile behalten Inter. Die drei unterschiedlichen Schriftstapel sind im gerenderten DOM nachgewiesen.
- **Folge:** Der Rückblick wirkt typografisch wie ein separates Produkt. Die Größe und Dichte der stark kondensierten Schrift weichen von den übrigen Informationskarten ab.
- **Korrektur:** Normale Menüs, Formulare, Profile und Rückblickkennzahlen aus einer gemeinsamen Schriftdefinition und Hierarchie ableiten. Eigenständige Torschrift in inszenierten Matchbannern kann erhalten bleiben.
- **Werkzeugrichtung:** `$impeccable typeset`.
- [Rückblick](../outputs/ui-restore/layout-audit/390-review-0.png).

### F5 · P2 · Einige Bedienelemente bleiben klein

- **Ort:** `.v172`-Vereinsbüro, native Rundendetails in Wettbewerben, Sortierknöpfe aus `dist/ui-flutlicht/views/squad.css`.
- **Beleg:** „Vereinsbüro · 1 ungelesen“ ist 24 Pixel hoch. Einige Rundendetails sind ebenfalls 24 Pixel hoch. Kader-Sortierknöpfe wie „#“, „Sp.“ und „T“ sind nur etwa 29–39 Pixel breit, obwohl ihre Höhe 44 Pixel erreicht.
- **Folge:** Weniger komfortabel bei einhändiger Handybedienung. 44 × 44 Pixel sind hier das Komfortziel; die Messung allein belegt keine pauschale WCAG-Verletzung.
- **Korrektur:** Anklickbare Zusammenfassungen und Sortierknöpfe mit konsistenter Mindestfläche versehen. Kleine Textgröße nicht mit kleiner Trefferfläche gleichsetzen.
- **Werkzeugrichtung:** `$impeccable adapt`.

### F6 · P2 · Beschriftung im kleinen Taktikfeld ist schwer lesbar

- **Ort:** `dist/ui-flutlicht/matchplan.css`, native Spieler-/Rollenmarker und `dist/player-tactics-ui.css`.
- **Beleg:** Bei 320/390 Pixeln liegen Positionscodes bei 7 Pixeln, mehrere Namen und Rollen bei 9 Pixeln. Auf dem schmalen Feld konkurrieren Rollenmarker und Zonenüberschriften; lange Rollen sind abgeschnitten. Die vollständige Information bleibt über Profile und Taktikbedienung erreichbar.
- **Korrektur:** Im schmalen Feld nur Nummer und eine kurze, lesbare Kennzeichnung zeigen; volle Rolle/Name bei Auswahl in einer ausreichend großen Infofläche. Zonennamen hinter Spielerinformationen anordnen und nicht überlagern lassen.
- **Werkzeugrichtung:** `$impeccable adapt` / `$impeccable typeset`.
- [320-Pixel-Matchplan](../outputs/ui-restore/layout-audit/320-light-matchplan-main.png).

### F7 · P2 · Einzelne englische Beschriftungen sind falsch oder unübersetzt

- **Ort:** `dist/ui-flutlicht/adapter.js:48`, `dist/i18n-v75.js`.
- **Beleg:** Die englische Übersicht enthält „Spiele: 0“. „Kontostand“ wird als „Balanced“ dargestellt. Im Kontrast dazu sind der Transfertag, die Navigation und die neue Länderwertung bereits englisch.
- **Korrektur:** Eindeutige Übersetzungen für ganze UI-Begriffe ergänzen; „Balance“ beziehungsweise „Account balance“ für Kontostand, „Matches“ für Spiele. Finanzbegriffe nicht über mehrdeutige Teilwortersetzung übersetzen.
- **Werkzeugrichtung:** `$impeccable harden` / `$impeccable clarify`.
- [Englische Übersicht](../outputs/ui-restore/layout-audit/390-english-overview.png).

### F8 · P2 · Der veröffentlichbare Einzeldatei-Build ist sehr groß

- **Ort:** `work/build.cjs`, integrierte Wappen-/Sponsor-/Trophäenassets.
- **Beleg:** Der vorhandene Buildnachweis nennt 92.145.735 Byte, rund 92 MB. Der reguläre HTTP-Browserabruf funktioniert. Dieses Audit enthält keine Messung mit langsamer Mobilverbindung und weist keine konkrete Ladezeit nach.
- **Folge:** Die Startkosten der Webseite verdienen eine gesonderte Optimierung, auch wenn das Layout nach dem Laden funktioniert.
- **Korrekturvorschlag:** Für die Online-Seite prüfen, welche Bildvarianten tatsächlich zum Start benötigt werden; übrige nachladen und wiederverwenden. Die bewusst eigenständige Offline-Einzeldatei getrennt erhalten. Keine freigegebenen Motive ohne Vergleich verschlechtern.
- **Werkzeugrichtung:** `$impeccable optimize`.

## Elegantere Lösungen – Vorschläge, keine Fehler

1. **Mobile Untermenüs kompakter gestalten.** Sieben Wettbewerbsbereiche belegen bei 390 Pixeln vier Reihen, bevor der eigentliche Inhalt beginnt. Eine beschriftete Bereichsauswahl auf schmalen Geräten könnte dieselben Bereiche in einer Zeile anbieten; am Desktop bleibt die sichtbare Tableiste. Die Hauptnavigation mit vier unteren Einträgen erhalten. Eine weitere Möglichkeit ist eine horizontal scrollbare Tableiste mit deutlicher Scrollanzeige und vollständiger Tastaturbedienung.
2. **Eine kleine Typografieskala verwenden.** Beispielsweise 14–16 Pixel für lesbare Inhalte, 12–13 für ergänzende Metadaten und 20–28 für Überschriften. Die vielen Einzelwerte durch wenige Tokens bündeln. Als mögliche gerätegerechte Schriftdefinition `system-ui, -apple-system, "Segoe UI", Arial, sans-serif` prüfen; dafür sind keine externen Schriftanbieter erforderlich. Die etablierte Gestaltung behalten.
3. **Hilfetexte kontextbezogen kürzen.** Im Transferbereich stehen mehrere Erklärblöcke vor Suche und Filtern. Den wichtigsten Hinweis direkt zeigen, ausführliche Erklärung in ein gut beschriftetes Hilfe-Detail legen. Suchwerkzeuge kommen damit früher in den sichtbaren Bereich.
4. **Nur eine starke Betonung je Bereich.** Gelb für aktive Navigation und Hauptaktion ist bereits nachvollziehbar. Zusätzliche Umrandungen und sehr schwere Kennzahlen sparsam einsetzen. Der vorhandene gelbe Akzent muss dafür nicht ersetzt werden.

## Was funktioniert

- **Kein horizontaler Seitenüberlauf** in den 226 Hauptfällen und zwölf gezielten Nachprüfungen, einschließlich 320, 390, 768 und 1440 Pixeln sowie Hell/Dunkel.
- Alle neun Hauptbereiche und ihre Kader-, Transfer-, Wettbewerbs- und Vereinsunterbereiche sind erreichbar. Tabellen verwenden bei Bedarf ihre eigenen Scrollbereiche oder mobile Karten, anstatt die ganze Seite aufzubrechen.
- Aktive Navigation, Hauptaktion, mobile untere Navigation, beschriftete Formularfelder und sichtbare Fokusregeln sind vorhanden.
- Die Fähigkeitsanzeige hält ihre Farbstufen bei; geprüfte Jugendkarten haben nach korrekter Auswertung von `color(srgb …)` keine bestätigten Kontrastfehler.
- Spielerprofil, Hilfe und Speicherhinweise öffnen. In den zwölf Nachprüfungen blieb die Seitenbreite stabil, auch bei einer simulierten Verdopplung der Rückblicktexte.
- Keine JavaScript-Seitenfehler im vollständigen 226-Fälle-Lauf. Die bereits vorhandene Quelle-/Build-Abnahme mit Saisonwechsel bleibt als separater Funktionsnachweis bestehen.

## Prüfumfang und Grenzen

**Breite Prüfung:** 226 Fälle: Startseite, vier Startschritte, Sponsor-/Budgetauswahl; 25 Haupt-/Unteransichten bei vier Breiten und zwei Themes; neun englische Hauptansichten; Spielvorbereitung; vier Rückblickseiten; abgeschlossene Saisonansichten und Speicherdialog. **Gezielte Bestätigung:** zwölf weitere Fälle für Start, Kader, Nachwuchs, Sponsor, leere Wettbewerbskarte, Spieler-/Hilfedialog, Rückblicke Hell/Dunkel und vergrößerten Text.

Die vorhandene T3-Vorschau wurde zunächst zur visuellen Inspektion benutzt. Später meldete sie: „No preview automation host is available for evaluate in environment c0ef7cdc-5b44-497f-b85b-6e88c6448acf.“ Keine Wiederholungsversuche nach dem ausdrücklichen Nicht-Wiederholen-Hinweis. Die Messreihe folgte dem dokumentierten Repository-Browserablauf mit Edge/Playwright in isolierten Testkontexten. Nur eigene Prüfkarrieren wurden erzeugt; produktive Spielstände wurden nicht verändert. Die nur für diese Läufe gestarteten HTTP-Server und Browser wurden geschlossen; der bereits bestehende Entwicklungsserver wurde erhalten.

Responsive Nachweise sind **Viewport-Emulation**, keine erneute physische Android-Abnahme. Die Textvergrößerung wurde durch CSS simuliert, nicht über eine Android-Systemeinstellung oder echten Browserzoom. Touchgesten, Screenreader, komplette Tastaturabläufe, iOS/Safari und die Unity-3D-Laufzeit wurden in diesem Layoutaudit nicht umfassend neu abgenommen. Einfache Textkontraste wurden berechnet; Farbverläufe und bildbasierte Hintergründe sind kein automatischer vollständiger Kontrastnachweis.

**Fehlalarme verworfen:** Der mechanische Impeccable-Detektor lieferte vier Hinweise zu einseitigen gelben Akzentrahmen. Diese gehören zur bestehenden Gestaltung und sind keine nachgewiesenen Fehler. Falsche Kontrastmeldungen für moderne `color(srgb …)`-Mischfarben wurden im zweiten Pass korrigiert. Der als unbeschriftet gemeldete versteckte native Rollen-Select hat `aria-hidden="true"`; der sichtbare Combobox-Knopf ist beschriftet, daher kein Formularbefund. Frühe Rückblickbilder während der Einblendanimation wurden durch Aufnahmen nach Animationsende ersetzt.

## Empfohlene Umsetzung

1. F1 und F2: Startadapter vollständig anbinden, dann Theme- und Kontrastlücken komponentenweise schließen.
2. F3–F7: Leeren Container, Schriftreste, Trefferflächen, kleine Feldbeschriftungen und englische Texte in einem begrenzten Korrekturpaket bearbeiten.
3. Mobile Untermenüvariante erst nach Gegenüberstellung auswählen; Buildgröße als separates Optimierungspaket behandeln.
4. Abschließend `$impeccable polish`, danach `$impeccable audit` über dieselben Fälle. Die Korrekturen können einzeln oder gemeinsam beauftragt werden.

## Nachweise

- [Messreihe: 226 Fälle](../outputs/ui-restore/layout-audit/measurements.json)
- [Gezielte Bestätigung: zwölf Fälle](../outputs/ui-restore/layout-audit/confirmation.json)
- [Mechanischer Detektor](../outputs/ui-restore/layout-detector.json)
- [Vorhandener Buildnachweis](../outputs/ui-restore/build-manifest.json)

Keine Produktänderung, kein neuer Build und keine Veröffentlichung durch diesen Audit.

# Kadermechanik, Stärkezusammensetzung und Matchagenda

Stand: 12. Oktober 2026. Nutzerauftrag: bestehende Stärkezusammensetzung und die drei vorgeschlagenen Matchthemen zusammenführen; Kaderrollen und Tiefe mit Spielzeiterwartungen entwickeln. Die Startkaderregeln v177 und der Pokalabstand bleiben erhalten. Die zusätzliche Rollenmechanik v179 setzt auf den vorhandenen Profiverträgen auf. Als [Release 129 veröffentlicht und live abgenommen](release-129.md).

## Stärkezusammensetzung der neuen Startwelt

Gemessen werden ausschließlich die erzeugten Profikader zum Karrierestart. Jugendpool, freie Spieler und spätere Entwicklung gehören nicht zur Startkaderverteilung. Die Welt enthält 96 Liga- und 96 reine Pokalvereine.

**Vereinsniveau:** England, Spanien, Deutschland, Italien und Frankreich bilden Stufe A; Portugal und Niederlande B; Österreich, Belgien und Türkei C; Schweiz und Griechenland D. Der Liga-Spitzenbereich wird stärker abgestuft als das Mittelfeld. Jeder der beiden stärksten Vereine jeder A-Liga liegt zum Start strikt über beiden Spitzenvereinen Österreichs, der Schweiz und der Türkei – beim Kaderdurchschnitt und bei der optimal besetzten Startelf. Ab ungefähr Platz drei überschneiden sich die Länder. Es gibt keinen zusätzlichen Länderbonus im Match.

**Kaderbudget und Streuung:** Ein gespeichertes Vereinsbudget verteilt Qualität auf die einzelnen Profis. Die resultierende gesamte Kaderqualität schwankt pro Karrierestart um höchstens ±2,5 Prozent um den Ausgangswert. Die harte Spitzengrenze bleibt dabei erhalten. Derselbe Seed erzeugt dieselben Spieler; Laden würfelt nichts neu aus. Innerhalb ähnlich starker Vereine kann sich die Reihenfolge ändern. Einzelspieler unterscheiden sich in Qualität und Profil, auch innerhalb desselben Vereins.

**Besetzung und Alter:** Jeder Verein startet mit elf Profis: zwei Torhüter und je drei Spielern in Abwehr, Mittelfeld und Angriff. Drei junge Profis sind 18–22 Jahre alt, sechs Spieler 24–29, zwei Routiniers 30–32. Die Standardformationen lassen sich vollständig besetzen; der Jugendpool bleibt getrennt.

**Seltene Elite:** Höchstens drei Elite-Spieler sind bei den zwei Spitzenvereinen jeder A-Liga erlaubt, höchstens zwei bei anderen Ligavereinen. Eine Elite-Besetzung wird nicht garantiert. Die bisherige 30-Welten-Messung ergab 2,53 Prozent Liga-Elites; das ist ein Stichprobenergebnis, keine festgeschriebene Weltquote. Reine Pokalvereine starten ohne Elite-Spieler.

**Sportliches Profil:** Passspiel, Konterspiel oder körperliches Spiel prägen die Spielerprofile innerhalb des Vereinsbudgets und die Vorgaben des ersten KI-Trainers. Ein Schwerpunkt erhöht nicht pauschal die Vereinsqualität. Seine sportliche Wirkung ist noch gesondert zu untersuchen.

**Pokalabstand:** Jeder reine Pokalverein startet mindestens zehn Prozent unter jedem Ligaverein, sowohl im Kaderdurchschnitt als auch bei der besten Startelf. Die konservative Erzeugung erzeugte in 30 Welten tatsächlich Mindestabstände von 26,4–29,8 Prozent beim Kader und 23,4–27,4 Prozent bei der Startelf. Diese größeren Abstände sind gemessen; beschlossen ist die Zehn-Prozent-Untergrenze. Der aktuelle Cap bleibt bestehen.

**Transferpräferenz:** Hohe tatsächlich erreichte Spielerqualität erhöht den Anreiz, in eine passende Top-Liga und zu einem passenden Top-Verein zu wechseln. Gehalt, Vertragsdauer und Einsatz-Zusage bleiben wirksam. Verstecktes Talent löst keinen Wechsel aus; es gibt keine automatische Versetzung.

**Relative Vereinsliste:** Die Liste „stärkster Verein 100 %, letzter 50 %“ ist eine lineare Rangdarstellung über die Vereinsplätze. Sie bezeichnet weder den echten Qualitätsquotienten noch die Siegchance. Individuelle Fähigkeiten bleiben in der Oberfläche einschließlich zugänglicher Beschriftungen ausschließlich Farbstufen.

[Startkadervertrag und Nachweise](startkader-umsetzung-v177.md), [Ligaabstufung](ligastaerken-startmodell.md), [Pokalvertrag](startkader-pokalabstand.md), [relative Vereinsliste](../outputs/club-relative-strength/vereinsstaerken.csv).

## Neue Kaderrollen und Tiefe

### Vertragsrolle und Erwartung

Die Einsatz-Zusage bleibt die einzige gespeicherte Vereinbarung. Die Kaderrolle wird daraus abgeleitet; keine zweite Zufriedenheitsberechnung, keine frei widerrufbare Zusage. Für die zwölf Länder umfassende Welt mit 14 Ligaspielen gilt:

| Kaderrolle | Vertragliche Zusage pro Saison | Standard bei neuen Startkadern |
| --- | --- | --- |
| Stammspieler | 9–14 anrechenbare Einsätze | 10 |
| Rotation | 5–8 anrechenbare Einsätze | 6 |
| Ersatz | 0–4 anrechenbare Einsätze | 2 |

Die sechs Spieler der anhand der Trainerformation qualitativ ausgewählten Anfangsaufstellung erhalten zehn Einsätze. Die drei besten übrigen Feldspieler erhalten sechs; der zweite Torwart und der verbleibende Feldspieler zwei. Bei einer gespeicherten Variante mit sechs Feldspielern gibt es sieben Stammspieler, drei Rotationsspieler und einen Ersatzspieler. Die Kaderqualität wird durch diese Rollenvergabe nicht verändert. Reine Pokalvereine erhalten keine Vertragszusagen.

Verpflichtung und Verlängerung bieten weiterhin die genaue Einsatzzahl zur Auswahl, jetzt nach Rollen gruppiert und beschriftet. Die Rolle ändert sich mit der tatsächlich angenommenen Vertragszusage. Ein Trainerwechsel oder eine neue Formation schreibt Verträge nicht um. Die Rolle bezeichnet die Spielzeitvereinbarung; sie garantiert keine Aufstellung und ist von taktischen Spielerrollen getrennt.

### Anrechnung und Folgen

Bestehende Anrechnung: Ein Einsatz mit mindestens 45 gewichteten Minuten zählt als ein Einsatz, längere Einsätze zählen ebenfalls höchstens einmal. Kürzere Einsätze werden gesammelt. Europacup-Minuten zählen 1,5-fach; nationale Pokalrunden vor dem Finale 0,75-fach; Liga und Pokalfinale einfach. Tatsächliche Entwicklungsminuten bleiben eine eigene Größe.

Die fällige Erwartung wächst mit den gespielten Ligapartien seit Vertragsbeginn. Bei unterjährigem Vertrag gilt das anteilige Ziel für die verbleibenden Ligapartien. Die Übersicht nennt die jährliche Zusage, angerechnete Einsätze, anteiliges Saisonziel und die bisher fällige Erwartung. Sie unterscheidet noch ausstehende Bewertung, Spielzeit im Plan, erfüllte Zusage, zu wenig Spielzeit und fehlende Zusage. Lesen und Darstellen verändern keine Werte.

Die vorhandene Vertragsprüfung bleibt maßgeblich: normalerweise frühestens nach vier abgeschlossenen Vereinsspielen und mit mindestens vier Spielen Abstand; die letzte Ligapartie wird ebenfalls geprüft. Ein Rückstand von mindestens zwei Einsätzen kann die Form um einen Schritt senken, höchstens zweimal pro Saison. Der Status „zu wenig Spielzeit“ warnt vor diesem Rückstand; er behauptet keine neue oder sofortige Sanktion. Keine neue Transferforderung oder Vertragsauflösung durch Spieler.

### Kaderübersicht und KI

Der Profikader zeigt die Vertragsrolle direkt beim Spieler. Die Vertragsübersicht ergänzt Spielzeitstatus und zählt einen Rückstand als Handlungsbedarf. Die Übersicht „Kaderrollen und Tiefe“ zeigt die Rollenanzahl und je Hauptposition den Kaderbestand gegenüber den Startplätzen der aktuellen Trainerformation. Fehlt direkte Reserve oder ist die Position unterbesetzt, wird das mit Text kenntlich. Mehr zugesagte Stammspieler als Startplätze, mehr als ein Stamm-Torwart oder zu viele Stamm-Feldspieler erzeugen einen Planungshinweis. Es gibt keine neue harte Kadergrenze.

KI-Trainer berücksichtigen offene Zusagen bei der Vorbereitung ungespielter Partien als kleinen Auswahlbonus für ähnlich geeignete Profis. Der Bonus beträgt intern höchstens 1,2 Bewertungspunkte. Er folgt dem bis zur nächsten Ligapartie anstehenden Ziel und bereits angerechneter Spielzeit. Qualität, Position, Form und Frische bleiben Grundlage. Eine schwache Reserve wird nicht zwangsweise aufgestellt. Die menschliche Aufstellung bleibt frei; die eigene automatische Vorauswahl erhält keinen Zusagebonus. Bereits vorbereitete und laufende Partien behalten ihre gespeicherten Aufstellungen.

### Bestand und Abnahme

Neue Vertragszusagen beim Start entstehen ausschließlich während der Konstruktion einer neuen mehrjährigen Expansionskarriere. Bestehende Vertragszahlen, Spielerwerte und Historien werden beim Laden nicht umgerechnet. Die Rollenbeschriftung liest vorhandene Zusagen; die KI-Auswahl gilt ab künftiger, noch nicht gespeicherter Matchvorbereitung. Bestehende Formprüfung und einmalige Ergebnisbuchung bleiben erhalten.

Abnahme bestanden: Acht native Prüfgruppen sichern Anfangsrollen inklusive Ersatzkeeper, die Variante mit sechs Feldspielern, unveränderte Stärkeregeln und Weltvalidierung, gewichtete/anteilige Zusagen, tatsächlich angenommene Transfers und Verlängerungen, begrenzte Formfolgen ohne Doppelbuchung, KI-Auswahl und gespeicherte Pläne sowie JSON-Rundreise und lesenden Altbestand. [Native Nachweise](../outputs/squad-planning-v179/checks.json).

Die tatsächliche Quellen- und Buildoberfläche ist bei 320, 390 und 1.280 Pixeln in DE/EN geprüft, einschließlich Hell/Dunkel, fehlendem Seitenüberlauf, unveränderten Karrieredaten, Neuladen, Rollen-Auswahl in der Vertragsverlängerung und Spielzeit-Handlungsbedarf. Zwölf Bildschirmfälle und je ein integrierter Vertrags-/Neuladefall bestanden. Eine vollständige physische native 2D-Partie je Fassung erreicht Minute 100 mit 0:0, gültigem Weltzustand und einmaliger Buchung. Halbzeit und echter JSON-Checkpoint sind enthalten; beide vollständigen Zustandsvergleiche ergeben `65541a03`. Der Matchvergleich verwendet frische Profile getrennt von absichtlich veränderten UI-Fixtures; Snapshot und Wiederherstellung laufen ebenfalls unter dem kontrollierten Zufallsstream. Der zunächst gemischte Prüflauf ist kein Paritätsnachweis. [Finaler Browsernachweis](../outputs/squad-planning-v179/browser-checks.json).

Bestehende Weltmatch-, Wirtschafts-/Vertrags-, lokale Start-/Export-, native Kontakt-/Leistungs- und v55-Prüfungen einschließlich vollständiger Partie bestanden. Der Build enthält die aktuellen Quellen und beide Offline-Dateien sind identisch. Die Veröffentlichung und zusätzliche Live-Abnahme stehen im [Releasebericht](release-129.md); physische Mobilgeräte und Unity-Leistungsabnahme sind durch diese Prüfung nicht abgedeckt.

Die ursprüngliche Startkaderprüfung wurde abschließend über alle 60 Seeds wiederholt: Kaderbudget, Startschwankung, Alters-/Positionsmix, Elite-Grenzen, strikte Kader-/Startelfhierarchie, Pokalabstand, Transfers und Erhalt alter Stände bestehen auch mit der zusätzlichen Rollenmechanik. [60-Welten-Nachweis](../outputs/start-rosters-v177/checks.json).

Reproduktion im Produktionscheckout:

```powershell
node work/test-squad-planning-v179.cjs
node work/build.cjs
node work/check-squad-planning-v179.cjs
```

## Offene Matchagenda

Diese drei Vorhaben sind aufgenommen; ihre zusätzlichen Spielserien und eventuellen Engineänderungen sind noch offen. Die aktuelle v178-Abstimmung bleibt Grundlage. Die Schlussmatrix umfasste 1.700 kompakte Partien: im Mittel 1,45 Tore, 24,5 Prozent Nullnummern. Schwach gegen schwach erreicht weiterhin 58 Prozent Remis. Das begründet weitere Diagnose, noch keine zusätzliche Änderung der Torwahrscheinlichkeiten.

1. **Kompakte und ausgespielte Partien vergleichen – erste Priorität.** 50 identische Paarungen mit gleichen Kadern, Heimrecht, Aufstellungen und Ausgangsfrische in beiden Engines spielen. Tore, Schüsse, Schussverwertung und Favoritensiege nebeneinander auswerten; Zufallsstreams und unterschiedliche Aktionsmodelle ausdrücklich kennzeichnen. Ein Seed allein garantiert zwischen unterschiedlichen Engines keinen identischen Zufallsverbrauch. Ergebnis: belegte Unterschiede und ein Vorschlag, ob welche Engine angepasst werden sollte.
2. **Remis bei schwachen Teams untersuchen.** Eine getrennte Referenzserie gleich schwacher Mannschaften messen: Chancenentstehung, Schusslage/-schwierigkeit, Schüsse aufs Tor und Abschluss-/Torwartkonversion. Prüfen, ob geringe Chancenqualität, zu wenige Chancen oder geringe Verwertung die Remis tragen. Erst aus dem Befund einen isolierten Änderungskandidaten mit Gegenproben für Top–Top, Top–Unten und Liga–Pokal entwickeln.
3. **Spielstile sportlich prüfen.** Gleich starke Pass-, Konter- und körperliche Teams mit identischen Qualitätsbudgets vergleichen. Heimrecht spiegeln und wiederholen. Neben Ergebnissen Ball-/Passaktionen, Druck, Schüsse, Fouls und tatsächliche Belastung messen. Gewünschtes Ergebnis sind erkennbare Stärken und Nachteile jedes Stils. Keine pauschalen Stil- oder Länderboni aus bloßen Ergebnisunterschieden ableiten.

[Aktuelle kompakte Matchabstimmung und Grenzen](kompakte-matchabstimmung-v178.md), [Fables ursprüngliche Prüfreihe](startkader-fable-pruefreihe.md).

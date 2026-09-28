# Spielstart, Accounts, Spielstände, Hall of Fame und App-Stores

Stand: 28. September 2026. Produktplanung für die Vereinswelt; die lokale Speicherabsicherung und das strukturierte Karriereprotokoll sind seit Prototyp 87 veröffentlicht. Der lokale Spielstart ist seit Prototyp 88 veröffentlicht. Die übrigen Teile sind weiterhin Planung. Die Sechserliga und `freekickdemo/` gehören nicht zum Umfang.

## Umsetzungsstand: lokale Speicherabsicherung

Umgesetzt sind bestätigte Speicheranzeigen, wiederholbare Schreibfehler, Erhalt des Arbeitsspeicherstands samt Rettungsexport, atomare Haupt-/Wiederherstellungskopie, bestätigte Wiederherstellung bei beschädigter Hauptkopie und Warten auf Schreibabschlüsse bei Export und „Speichern & Start“. Laufende physische Matches pausieren bei Speicherfehlern an einem sicheren Punkt. Die Rückfallkopie bleibt lokal und ersetzt keine externe Sicherungsdatei. Neue Kopien entstehen beim Speichern ohne Umrechnung bestehender Karrieren. Fehler-, Export-, Wiederherstellungs- und Fortsetzungstests stehen in [development.md](development.md). Strukturierte Hintergrundstatistiken, Startparameteränderungen, Accounts, Serverkarrieren und Hall of Fame gehören nicht zu diesem abgeschlossenen Block.

## Beauftragter Umfang und offene Entscheidungen

Der anschließende Block „auswertbare Hintergrundstatistik“ ist ebenfalls umgesetzt: neue Ereignisse aller Vereine, angenommene Verlängerungen mit Vertragsschnappschüssen, getrennte Transfer-/Nachwuchsarten, Vereinslosigkeitsintervalle und lesende Filter/Summen. Das Protokoll gehört zum gespeicherten Karriereobjekt und zum Export; bestehende Karrieren erhalten keine rückwirkenden Einträge. Nachweise und Größenmessungen über zehn Saisons stehen in [development.md](development.md). Eine sichtbare Auswertungsoberfläche, Startparameteränderungen und die Account-/Serverblöcke sind weiterhin offen.

Geplant werden zuverlässige Spielstände mit verständlichen rechtlichen Speicherinformationen, eine übergeordnete Hall of Fame mit Managern und ihren Titeln, Google-Play- und Apple-App-Store-Kompatibilität sowie ein Schimpfwortfilter für Namen.

Die Hall of Fame wird zentral, öffentlich und geräteübergreifend geplant. Lokale Spielstände und Importe sind nicht teilnahmeberechtigt, auch nicht durch einen späteren Upload. Eine lokale Hall of Fame ist kein Umsetzungsschritt. Für die Teilnahme wird eine von Beginn an serverseitig geführte Karriere mit zugeordnetem Managerkonto vorgesehen. Anbieter, Anmeldeverfahren, Zielaltersgruppe und Finanzierung sind noch zu entscheiden. Die folgenden technischen Details sind Umsetzungsvorschläge.

Die Ergänzung vom 28. September konkretisiert Spielstart, Startparameter, Karriereverwaltung und Accounts. Bestehende Produktregeln bleiben maßgeblich. Mit **Vorschlag** bezeichnete Regeln sind die empfohlene Planungsgrundlage, noch keine bestätigten Produktentscheidungen. Abschnitt 7 bündelt die Entscheidungen, die vor der jeweiligen Umsetzung feststehen müssen. Diese Planung führt weder Accounts noch neue Spielregeln ein.

## 0. Spielstart und Startparameter

Der lokale Teil des vorgeschlagenen Startablaufs ist seit Prototyp 88 veröffentlicht: Managername, Land und Verein, stabile Kadervorschau, Zusammenfassung, bestätigtes Speichern vor dem Öffnen und Wiederholung nach Speicherfehler. Die Oberfläche zeigt nur die lokale Speicherart und eine ausgeschaltete öffentliche Teilnahme. Onlineanmeldung, Serverentwürfe und ihre Einmaligkeit bei verlorenen Antworten sind weiterhin offen.

### Einstieg und Abschluss der Anlage

**Vorschlag:** „Neue Karriere“ bleibt die erste Aktion auf der Startseite. Der Ablauf lautet:

1. **Speicherart wählen:** „Auf diesem Gerät“ ohne Account oder „Onlinekarriere“ mit Account. Die lokale Option erklärt Browserbindung und Sicherungsdateien; die Onlineoption erklärt erforderliche Verbindung, geräteübergreifenden Zugriff und mögliche öffentliche Teilnahme. Solange der Onlinedienst nicht verfügbar ist, bleibt der lokale Einstieg vollständig nutzbar.
2. **Bei Onlinekarrieren anmelden:** Anmeldung oder Registrierung erhält die bisherige Auswahl. Abbrechen erzeugt keine Karriere. Lokales Spielen bleibt ohne Konto möglich. Eine spätere Anmeldung wandelt lokale Karrieren nicht in gewertete Karrieren um.
3. **Manager, Land und Verein wählen:** Vereinsgeschichte, Startkader und Spielerprofile bleiben vor der Übernahme zugänglich. Der Verein startet entsprechend den Produktregeln mit seinem fertig erzeugten Profikader und eigenem Nachwuchspool; eine neue freie Kaderzusammenstellung ist nicht vorgesehen. Fähigkeiten erscheinen ausschließlich als Farbstufen, auch in zugänglichen Beschriftungen.
4. **Zusammenfassung prüfen:** Speicherart, Managername, Verein, Startkader, Regelstand und öffentliche Sichtbarkeit zeigen. Die öffentliche Teilnahme ist zunächst ausgeschaltet; ihre Aktivierung ist freiwillig und vom Anlegen der Onlinekarriere getrennt.
5. **„Karriere starten“ bestätigen:** Kennung, Startparameter, ausgewählter Kader und erster Spielstand werden gemeinsam verbindlich gespeichert. Erst nach bestätigtem Abschluss öffnet sich die Karriere. Der reguläre Karriereablauf einschließlich Sponsorwahl und Transferphase schließt an.

Eine Vorschau gehört zu genau einem Anlageentwurf mit festem Welt-Seed. Rücknavigation, Vereinswechsel innerhalb der Vorschau und erneutes Öffnen eines Spielerprofils würfeln keine neuen Kader. Die endgültige Übernahme verwendet dieselben Spielerkennungen und Auswahlen. Bei Onlinekarrieren erzeugt und validiert der Server den Entwurf; der Browser liefert keinen selbst berechneten Startkader als verbindliche Quelle.

Ein Doppelklick oder eine verlorene Antwort darf nur eine Karriere und einen belegten Speicherplatz erzeugen. Ein wiederholter Startauftrag fragt das Ergebnis desselben Auftrags ab. Bei vollem Speicher oder fehlgeschlagener Anlage bleibt die Auswahl erhalten; bestehende Karrieren bleiben unberührt. Temporäre Onlineentwürfe benötigen eine begrenzte Lebensdauer und ein Anfragelimit. Nach Ablauf wird vor einer neuen Vorschau sichtbar erklärt, dass der Entwurf erneuert werden muss; die konkrete Frist und Rate folgen aus dem Betriebsbudget.

### Parametermatrix für die erste Ausbaustufe

Die folgende Matrix ist ein **Vorschlag**. Sie führt keine zusätzlichen Schwierigkeitsmodi, Budgetregler oder frei konfigurierbaren Wettbewerbe ein.

| Parameter | Beim Spielstart | Später |
| --- | --- | --- |
| Lokal oder online | Bewusste Auswahl vor der Anlage | Unveränderlich; lokale Kopien und Importe werden nie gewertet |
| Managername | Lokal eingeben; online aus dem zugeordneten Managerprofil übernehmen | Moderierte Umbenennung ohne neue Identität oder doppelte Titel |
| Land und Startverein | Aus den vorhandenen spielbaren Ligavereinen wählen | Vereinswechsel nur durch den regulären Karriereablauf |
| Startkader | Fertig erzeugten Vereinskader prüfen und übernehmen; Vorschau bleibt stabil | Änderungen nur durch reguläre Kaderentscheidungen |
| Welt-Seed | Automatisch erzeugen und intern speichern; online vom Server | Unveränderlich; kein sichtbarer Neu-würfeln-Knopf |
| Startfinanzen und Vereinsprofil | Aus Vereinsmodell und erlaubter Startvariation ableiten | Reguläre Vereinsentwicklung; kein freier Geldregler |
| Wettbewerbe, KI und Schwierigkeit | Ein gemeinsamer Standardregelsatz | Änderungen nach der Versionsregel in Abschnitt 1 |
| Sprache und Darstellung | Bereits gewählte Geräteeinstellungen übernehmen | Jederzeit unabhängig vom Karrierefortschritt ändern |
| Öffentliche Teilnahme | Bei Onlinekarrieren freiwillig, standardmäßig aus | Aktivieren oder zurücknehmen; lokale Karrieren bleiben ausgeschlossen |

Der anfängliche Regelstand und die Startparameter bleiben als Herkunft der Karriere erhalten. Spätere wirksame Regelstände werden zusätzlich mit ihrem Einführungszeitpunkt erfasst. Ein Welt-Seed allein ist kein vollständiger Wiederherstellungsnachweis; dafür sind auch Generator-/Regelversion und gespeicherter Zustand erforderlich. Für Onlinekarrieren bleiben Zufallszustand und unbekannte Spielerinformationen serverseitig; der Client bekommt nur die für die jeweilige Ansicht zulässigen Angaben.

### Vergleichbarkeit und öffentliche Erfolge

**Vorschlag:** Die erste Hall of Fame ist eine durchsuchbare Erfolgssammlung ohne Gesamtrangliste. Titel nennen Karriere, Verein, Saison, Wettbewerb und maßgeblichen Regelstand. Unterschiedliche Vereinsstärke, Startvariation und mehrere Karrieren werden nicht durch erfundene Schwierigkeitspunkte ausgeglichen. Serverprüfung bestätigt die Herkunft eines Erfolgs, nicht gleiche Startchancen.

Eine spätere Rangliste wäre eine eigene Produktentscheidung mit Regeln für Startbedingungen, Karriereanzahl, Neustarts und Regeländerungen. Die Speicherplatzgrenze allein verhindert weder wiederholte Neuanlagen noch mehrere Accounts und wird deshalb nicht als Fairnessgarantie dargestellt.

**Vorschlag:** Nach späterer Aktivierung dürfen bereits bestätigte Titel derselben, von Beginn an serverseitig geführten Karriere veröffentlicht werden. Das verwendet vorhandene Serverereignisse, berechnet keine Vergangenheit neu und schließt lokale oder importierte Titel weiterhin aus.

### Karriereübersicht und Lebenszyklus

**Vorschlag:** Eine gemeinsame Übersicht kennzeichnet jede Karriere als lokal oder online und zeigt Manager, Verein, Saison, letzten bestätigten Speicherzeitpunkt, Verfügbarkeit und öffentliche Sichtbarkeit. Lokale Einträge gehören zum aktuellen Browser, Onlineeinträge zum angemeldeten Account. Ein Kontowechsel ordnet lokale Karrieren nicht dem neuen Konto zu.

Die bestehende Grenze von fünf lokalen Vereinswelten bleibt bestehen; vorhandene Überbestände bleiben spielbar. Für Onlinekarrieren werden zunächst ebenfalls **höchstens fünf gespeicherte Karrieren pro Account vorgeschlagen**, getrennt vom lokalen Limit. Diese Zahl ist vor dem Backendbau anhand der Speicher- und Rechenkosten festzulegen. Gleichzeitige Anlagen auf zwei Geräten prüfen das Limit atomar.

| Aktion | Vorgeschlagene Wirkung |
| --- | --- |
| Schließen / „Speichern & Start“ | Nach Speicherbestätigung zur Startseite; Karriere bleibt fortsetzbar |
| Karriere beenden | Bestätigter, endgültiger Abschluss; nur noch lesbar, gespeicherte Karriere belegt weiter einen Platz |
| Lokale Karriere löschen | Nach Bestätigung lokale Daten entfernen; selbst exportierte Dateien bleiben bestehen |
| Onlinekarriere löschen | Fortsetzen und Zugriff auf den Spielstand beenden; Löschprozess starten und Platz freigeben |
| Öffentliche Teilnahme zurücknehmen | Öffentliche Zuordnung entfernen; Karriere bleibt privat fortsetzbar |
| Konto löschen | Alle zugeordneten Onlinekarrieren, Sitzungen und öffentlichen Zuordnungen in den Löschprozess aufnehmen; unabhängige lokale Karrieren bleiben bestehen |

Für die erste Ausbaustufe wird kein zusätzlicher Archivspeicher vorgeschlagen. Eine beendete Karriere kann später gelöscht werden. **Vorschlag:** Beim Löschen einer Onlinekarriere ihre öffentlichen Einträge ebenfalls entfernen; Titelreste sollen keine unbegrenzte Sammlung außerhalb des Speicherlimits erzeugen. Spielstandlöschung und Veröffentlichung bleiben getrennte Datenvorgänge, werden hier aber gemeinsam ausgelöst und im Bestätigungsdialog ausdrücklich genannt. Opt-out allein löscht dagegen keinen Spielstand. Löschfristen für Backups bleiben Teil des Betriebskonzepts.

### Account, Manageridentität und Wiederherstellung

**Vorschlag:** Ein Account hat zunächst genau eine öffentliche Manageridentität für alle seine Onlinekarrieren. Account-, Manager- und Karrierekennungen bleiben getrennt. Lokale Manager sind unabhängige Identitäten; gleiche Namen bewirken keine Zusammenführung. Mehrere öffentliche Managerprofile pro Account, Kontotransfers und Accountzusammenführungen gehören nicht zur ersten Ausbaustufe.

- Umbenennen ändert den aktuellen öffentlichen Anzeigenamen, aber keine Kennungen, Titelanzahl oder sportlichen Daten. Frühere Anzeigenamen werden nicht als öffentliches Namensarchiv geführt. Gleiche Anzeigenamen sind kein Identitätsnachweis; Profile und Verknüpfungen verwenden stabile Kennungen.
- Vor Anbieterwahl Anmeldung, Wiederherstellung bei verlorenem Zugang, Wechsel einer Anmeldeadresse beziehungsweise eines Loginverfahrens und Widerruf fremder Sitzungen als vollständige Abläufe festlegen. Eine bloße Namensgleichheit genügt niemals zur Wiederherstellung. Methoden und erforderliche Kontaktdaten richten sich nach dem gewählten Verfahren.
- Sensible Kontoänderungen und Kontolöschung benötigen eine erneute Authentifizierung. Ein neues Konto nach abgeschlossener Löschung erhält neue Kennungen und übernimmt keine früheren Karrieren oder Titel automatisch.
- Abmelden widerruft die aktuelle Sitzung, entfernt zugängliche Onlinecaches, private Ansichten und Anmeldedaten aus dem Browser beziehungsweise App-Speicher. Ein anderes Konto sieht keine zwischengespeicherten Karrieren des vorherigen Kontos. Lokale Karrieren bleiben als gerätegebundene Daten ausdrücklich getrennt sichtbar.
- Läuft eine Sitzung während einer Entscheidung ab, wird deren bestätigter Status nach erneuter Anmeldung abgefragt. Die Oberfläche erzeugt weder einen lokalen Ersatzstand noch wiederholt sie den Auftrag mit einer neuen Kennung.

## 1. Spielstände und Wiederherstellung

Die Entwicklungsdokumentation beschreibt bereits IndexedDB, höchstens fünf neue Vereinswelten und JSON-Export/-Import. Diese Wege bleiben für private lokale Karrieren bestehen; sie begründen keine Hall-of-Fame-Teilnahme. Vor Umsetzung wird der tatsächliche Quellstand nochmals geprüft. Neue gewertete Karrieren verwenden den Server als verbindliche Quelle; ein lokaler Cache ist dort nur eine Kopie.

- Pro Spielstand: stabile Kennung, Format- und Regelversion, Managerkennung, Anzeigename, Verein, Saison, letzter erfolgreicher Speicherzeitpunkt und Revision. Managerkennung, Accountkennung und Spielstandkennung bleiben getrennt.
- Automatisch nach abgeschlossenen Entscheidungen und an sicheren Spielübergängen speichern. Einen laufenden Matchzustand einschließlich Zufallszustand so sichern, dass Fortsetzen keine Ereignisse wiederholt. Nicht erst beim Schließen der App speichern.
- Eine letzte gültige Wiederherstellungskopie vorhalten. Neue Daten und Revision atomar schreiben; „Gespeichert“ erst nach bestätigtem Abschluss anzeigen. Bei Platzmangel oder Schreibfehler bleibt die letzte gültige Kopie erhalten; Export anbieten.
- Export wartet auf ausstehende Schreibvorgänge. Import prüft Größe, Format und Datenstruktur vor dem Speichern und führt niemals mitgelieferte Inhalte als Code aus. Unbekannte Formate verständlich ablehnen.
- Sichtbar erklären: lokal bedeutet dieses Gerät und diesen Browser. Browserbereinigung, privater Modus, Deinstallation oder Geräteverlust können Daten entfernen. Ein Export ist eine eigene Sicherungsdatei; die App kann fremde Kopien nachträglich nicht löschen.
- Lokalen Spielstand löschen, Serverkarriere löschen, öffentliche Teilnahme zurücknehmen und Konto löschen sind getrennte, verständlich benannte Vorgänge. Vor dem Bestätigen werden betroffene Daten genannt.
- Keine rückwirkende Berechnung alter Titel oder Managerhistorien. Fehlende Ereignisse heißen „nicht erfasst“; neue Erfassung beginnt mit Einführung.

Serverkarrieren verwenden authentifizierte Zugriffe, Transportverschlüsselung, serverseitige Zugriffskontrolle, begrenzte Backups und einen dokumentierten Löschprozess. Jede Aktion nennt die erwartete Revision; veraltete und wiederholte Aktionen dürfen den Stand nicht überschreiben oder Erfolge doppelt erzeugen. Für gewertete Karrieren wird zunächst eine Onlineverbindung für Fortschritt vorausgesetzt. Bei Verbindungsabbruch wird der letzte bestätigte Serverstand wieder aufgenommen; es gibt keine frei wählbaren Rücksetzungen oder importierten Fortschritte. Browser, Android-App und iOS-App greifen über dasselbe Konto auf diese Karriere zu. Eine optionale Sicherung privater lokaler Karrieren wäre ein eigener, weiterhin ungewerteter Dienst.

### Speicheranzeige, Unterbrechung und mehrere Geräte

**Vorschlag:** Pro Onlinekarriere darf jeweils eine Sitzung Fortschritt auslösen. Weitere Tabs und Geräte öffnen sie lesend und bieten „Hier weiterspielen“ an. Eine bestätigte Übernahme macht die bisherige Schreibberechtigung serverseitig ungültig; bereits laufende Aktionen werden atomar geordnet. Veraltete Aufträge der alten Sitzung werden abgewiesen. Eine zeitlich begrenzte, erneuerbare Berechtigung verhindert eine dauerhafte Sperre nach einem Geräteabsturz; Revisionen und eindeutige Aktionskennungen bleiben zusätzlich erforderlich.

| Zustand | Sichtbares Verhalten |
| --- | --- |
| Speichervorgang läuft | „Wird gespeichert …“; abhängige Fortschrittsaktionen warten |
| Schreiben bestätigt | „Gespeichert“ mit bestätigtem Zeitpunkt |
| Serverantwort fehlt, Ausgang unklar | „Bestätigung wird geprüft“; denselben Auftrag abfragen, keinen zweiten erzeugen |
| Verbindung fehlt | Letzten bestätigten Stand zeigen; Onlinefortschritt bis zur Klärung sperren |
| Lokales Schreiben gescheitert | „Nicht gespeichert“; Arbeitsspeicherzustand erhalten, erneut speichern oder gekennzeichnete Rettungskopie exportieren |
| Anderes Gerät hat übernommen | „Auf einem anderen Gerät fortgesetzt“; aktuellen Stand laden oder bewusst übernehmen |
| Serverwartung | Erreichbaren bestätigten Stand kennzeichnen; keine Erfolgsmeldung für unbestätigte Aktionen |

Eine lokale Rettungskopie aus dem Arbeitsspeicher ist vom normalen Export des bestätigten Speicherstands zu unterscheiden und vor Ausgabe zu validieren. Bei Onlinekarrieren ist ein Clientcache keine Rettungskopie, die später wieder hochgeladen werden dürfte. „Speichern & Start“ verlässt bei einem Fehler die Karriere erst nach einer ausdrücklichen Entscheidung; ein Browserabbruch kann nicht zuverlässig aufgehalten werden.

Für laufende Onlinepartien muss die Serverberechnung auch Pause, Taktikänderungen und Wechsel mit ihrem gültigen Simulationszeitpunkt bestätigen. Nach einer Unterbrechung setzt dieselbe Partie aus ihrem bestätigten Zustand fort; weder Ergebnis noch Zufallsfolge werden neu ausgelost. **Vorschlag:** Ohne aktive Verbindung pausiert die Karriere am nächsten sicheren bestätigten Punkt und spielt keine weiteren Karrieretage im Hintergrund. Das genaue Verhalten bei kurzzeitigem Verbindungsverlust ist im Serverprototyp zu prüfen.

### Regeländerungen und Betriebsfähigkeit

**Vorschlag:** Keine dauerhaft parallel betriebenen alten Spielengines. Fehlerbehebungen und neue Regeln gelten für zukünftige Ereignisse; abgeschlossene Partien, Verträge, Titel und Statistiken werden nicht neu berechnet. Saisonweite Wettbewerbsänderungen beginnen frühestens mit einer neuen Saison. Ein laufendes Match erhält keinen stillen Wechsel seiner Berechnungsregeln; ein Serverupdate wartet auf einen geeigneten Abschluss oder behält den nötigen Matchlauf begrenzt bei. Herkunftsregelstand und tatsächlich angewandter Ereignisregelstand bleiben unterscheidbar.

Kann ein neues Format ohne unerwünschte Umrechnung nicht fortgesetzt werden, darf es weder still überschrieben noch gelöscht werden. Die Einführung braucht dann eine eigene Entscheidung über unterstütztes Weiterlaufen oder Abschluss und Datenausgabe; bis dahin ist diese Änderung für bestehende Serverkarrieren nicht veröffentlichungsfähig. Es wird keine unbegrenzte Unterstützung sämtlicher Altversionen versprochen.

Vor Freigabe des Onlinediensts ein Betriebsbudget für Speicher, Simulation, Backups und Moderation sowie messbare Grenzen für Wiederherstellungsdauer und möglichen Datenverlust festlegen. Einen vollständigen Backup-Restore einschließlich Löschmarkierungen, Karriereereignissen und Hall-of-Fame-Zuordnungen erproben. Wiederhergestellte Daten dürfen gelöschte Konten nicht erneut öffentlich machen. Für längere Ausfälle oder Einstellung des Dienstes einen Kommunikations- und Datenexportweg festlegen; daraus entsteht kein Anspruch, exportierte Daten erneut als gewertete Karriere zu importieren.

### Auswertbare Hintergrundstatistik im Spielstand

Jede Karriere soll spätere Abfragen über alle Vereine und Saisons erlauben, auch wenn eine Information gerade nicht in der Oberfläche angezeigt wird. Dazu bleiben bestätigte Markt- und Vertragsereignisse im jeweiligen Spielstand erhalten. Diese internen Karrieredaten werden nicht automatisch in der öffentlichen Hall of Fame veröffentlicht. Für Serverkarrieren führt der Server das verbindliche Protokoll; private lokale Karrieren behalten ein eigenes, nicht gewertetes Protokoll.

Der Quellstand erfasst neue Abschlüsse zusätzlich in `world.careerEvents`, einschließlich erfolgreicher Verlängerungen mit altem und neuem Vertrag. Bestehende Transfereinträge in `world.transfers` bleiben weiter lesbar, ohne alte Spielstände zu rekonstruieren. Die folgenden Anforderungen sind für lokale Karrieren umgesetzt; das verbindliche Serverprotokoll folgt erst mit Serverkarrieren.

- **Transfer:** Spielerkennung, Saison, Spieltag, abgebender und aufnehmender Verein, gezahlte Ablöse, Art des Wechsels und eindeutige Ereigniskennung. Bezahlter Wechsel, ablösefreie Verpflichtung, Jugendübernahme und sonstige Kaderbewegung bleiben unterscheidbar. Es zählen alle Vereine, auch KI-Vereine.
- **Vertragsverlängerung:** Spieler, Verein, Saison und Spieltag, alte und neue Laufzeit, altes und neues Jahresgehalt sowie alte und neue Einsatz-Zusage. Nur angenommene Verlängerungen sind Ereignisse; abgelehnte Angebote sind kein Vertragsabschluss. Menschliche und KI-Vereine werden gleich erfasst.
- **Vereinslos geworden:** Spieler, bisheriger Verein, Saison und Spieltag, Grund wie Vertragsende oder Freistellung. Dieser Zustandswechsel ist kein Transfer zu einem anderen Verein. Eine spätere Verpflichtung wird als separates Ereignis erfasst und kann so als ablösefreie Verpflichtung ausgewertet werden.
- **Weitere Abgänge:** Karriereende und Jugendfreigabe getrennt erfassen. Ein Spieler ohne Verein und ein Spieler mit beendeter Karriere dürfen in Auswertungen nicht verwechselt werden.
- **Bedeutung von „ablösefrei“:** `Ablöse = 0` beschreibt die Zahlung, `vorher vereinslos` den Status. Beides separat speichern. Ein kostenloser Wechsel direkt zwischen zwei Vereinen und eine Verpflichtung eines Vereinslosen sind unterschiedliche Fälle.

Abfragen sollen pro Karriere, Saison, Verein und Spieler alle Ereignisse samt Reihenfolge liefern: Transfersumme, Zugänge/Abgänge, Zahl der Verlängerungen, Spieler mit ausgelaufenem Vertrag, Dauer der Vereinslosigkeit und spätere ablösefreie Verpflichtungen. Eine spätere Oberfläche oder ein Export darf daraus Kennzahlen berechnen, ohne den Simulationsstand zu verändern. Namen sind nur Anzeige-Schnappschüsse; Verknüpfungen verwenden stabile Kennungen. Geldwerte tragen ihre Einheit und niemals nur einen formatierten Text.

Jedes bestätigte Ereignis wird genau einmal mit dem Spielstand geschrieben. Wiederholtes Speichern, Laden, Saisonabschluss oder ein Netzwerkversuch darf es nicht duplizieren. Protokoll und aktueller Vertrags-/Kaderzustand müssen nach jedem Abschluss zusammenpassen. Speichergröße über zehn und mehr Saisons messen; bei Bedarf alte Detailereignisse verlustfrei archivieren, statt sie still zu verwerfen. Altdaten ohne vollständige Ereignisse bleiben in Analysen als „nicht erfasst“ gekennzeichnet. Aus Buchungstexten werden keine scheinbar vollständigen Vergangenheitsdaten erzeugt.

## 2. Übergeordnete Hall of Fame

Ein eigener Einstieg im Hauptmenü öffnet die Hall of Fame unabhängig von einer geladenen Karriere. Sie zeigt pro Manager den moderierten Anzeigenamen und Titel getrennt nach Meisterschaft, nationalem Pokal und Europacup. Eine Detailansicht nennt Saison, Wettbewerb, Land und Verein. Persönliche Managerauszeichnungen werden getrennt von Mannschaftstiteln aufgeführt. Ein künstlicher Gesamtpunktwert ist zunächst nicht vorgesehen.

- Derselbe Manager kann mehrere Karrieren führen. Zuordnung erfolgt über eine stabile Kennung, niemals über Namensgleichheit. KI-Trainer bleiben zunächst im jeweiligen Weltarchiv; die übergeordnete Ansicht sammelt menschliche Manager.
- Ein Titel gehört im Entwurf dem Manager, der den Siegerverein beim endgültigen Titelentscheid führt. Frühere Stationen erzeugen keinen zusätzlichen Titel. Diese Zuordnungsregel ist vor Implementierung festzulegen.
- Titelereignisse enthalten Manager-, Karriere-, Saison-, Wettbewerbs- und Siegervereinskennung sowie Regelversion. Der Server erzeugt sie einmalig aus einem bestätigten Wettbewerbsausgang. Ein eindeutiger Ereignisschlüssel verhindert Doppelzählung bei Neuladen und wiederholten Anfragen.
- Lokale Karrieren, JSON-Importe, Kopien und daraus abgeleitete Karrieren sind dauerhaft ausgeschlossen. Ein Upload, eine neue Kennung oder ein neues Konto macht ihre Titel nicht gültig.
- Das Löschen einer Serverkarriere und das Entfernen ihrer öffentlichen Einträge werden vorab klar unterschieden. Bei Konto-Löschung wird die personenbezogene öffentliche Zuordnung entfernt; ein eventuell fortbestehendes anonymes Wettbewerbsarchiv braucht ein gesondertes begründetes Konzept.
- Öffentliche Teilnahme erfolgt erst nach bewusster Aktivierung. Sichtbar sind nur Pseudonym und freigegebene sportliche Erfolge, niemals E-Mail, Accountkennung oder vollständiger Spielstand. Rücknahme entfernt die öffentliche Zuordnung.
- Ein editierbarer Browserstand ist kein Nachweis für einen echten Erfolg. Auch bloßes Speichern eines Clientstands in der Cloud genügt nicht. Der Server kontrolliert erlaubte Entscheidungen, Zufallszustand, Spielberechnung beziehungsweise deren vollständige Validierung und Wettbewerbsausgänge. Der Client zeigt Ergebnisse an, entscheidet aber nicht über Titel. Eine im Client erzeugte Prüfsumme oder Signatur genügt nicht.

## 3. Namen und Moderation

Der Filter gilt beim Anlegen und Ändern aller frei eingegebenen Manager-, Vereins- und sonstigen öffentlichen Namen, außerdem vor Importanzeige und Veröffentlichung. Anfangs werden deutsche und englische Begriffe abgedeckt. Ein öffentlicher Dienst prüft zusätzlich auf dem Server; eine Browserprüfung allein lässt sich umgehen.

- Vergleichsform mit Unicode-Normalisierung, Groß-/Kleinschreibungsabgleich und kontrollierter Erkennung von Leerzeichen-, Zeichen- und Ziffernersatz bilden. Den zulässigen Originalnamen einschließlich Akzenten erhalten.
- Schimpfwörter, diskriminierende Ausdrücke, sexuelle Beschimpfungen und gezielte Umgehungen abfangen. Wortgrenzen, Sprachkontext und Ausnahmen für legitime Namen berücksichtigen; keine pauschalen Teilstring-Sperren.
- Eine kurze Meldung fordert einen anderen Namen an. Abgelehnte Namen werden nicht öffentlich angezeigt und nicht unnötig protokolliert. Kein Anspruch auf vollständige automatische Erkennung.
- Bestehende Namen werden nicht rückwirkend im Spielstand umgeschrieben. Bei einem problematischen Import einen neutralen Anzeigenamen verwenden und eine Änderung anbieten; vor öffentlicher Freigabe ist ein zulässiger Name nötig.
- Öffentliche Einträge erhalten Melden, Ausblenden beziehungsweise Blockieren des zugehörigen öffentlichen Profils, eine erreichbare Kontaktstelle und eine Moderationswarteschlange. Regeln, Bearbeitungsverantwortung und Einspruchsweg müssen vor öffentlichem Start stehen. Chat oder Direktnachrichten sind kein Teil dieses Plans.
- Namen immer als Text ausgeben. Schimpfwortprüfung ersetzt weder HTML-Escaping noch Eingabevalidierung.

## 4. Speicher- und Datenschutzinformationen

Die rechtlichen Grundlagen und Storevorgaben stehen mit offiziellen Quellen in [der Recherche](speicherung-store-recherche.md). Vor Veröffentlichung sind Betreiber, tatsächliche Datenflüsse, Anbieter, Zielländer und Zielaltersgruppe einzutragen; eine allgemeine Vorlage allein genügt nicht.

Impressum, Datenschutzerklärung und Speicherverwaltung bleiben von jedem Spielbildschirm erreichbar und werden in deutscher und englischer Oberfläche verständlich angeboten. Der Speicherhinweis unterscheidet lokale Karriere, lokale Einstellungen, Serverkarriere mit Konto, öffentliche Hall of Fame und freiwillige Statistikübermittlung.

Für jede Verarbeitung werden Zweck, Datenarten, Speicherort/Empfänger, Rechtsgrundlage, Aufbewahrungsfrist beziehungsweise Löschkriterium und Nutzerrechte dokumentiert. Pseudonyme können weiterhin personenbezogene Daten sein. Technisch notwendige Endgerätespeicherung und eine DSGVO-Rechtsgrundlage sind getrennte Prüfungen; weder „lokal“ noch „keine Cookies“ ersetzt diese Prüfung.

Entwurf des kurzen lokalen Hinweises: „Deine Karriere wird auf diesem Gerät in diesem Browser gespeichert. Beim Löschen der Browserdaten kann sie verloren gehen. Über Export kannst du eine Sicherung erstellen.“ Dieser Text wird erst verwendet, wenn er dem tatsächlichen Verhalten entspricht. Cloud- und öffentliche Übertragung benötigen eigene Hinweise und dürfen nicht still mit lokaler Speicherung gekoppelt werden.

Vor Cloudbetrieb konkrete Fristen für aktive Konten, inaktive Konten, Backups, Sicherheitsprotokolle und Moderationsfälle festlegen. Löschungen müssen auch Wiederherstellungen aus Backups berücksichtigen. Keine unbegrenzte Aufbewahrung allein wegen möglicher späterer Nutzung. Hosting, Auftragsverarbeitung und gegebenenfalls Drittlandübermittlungen erfassen. Minderjährige und mögliche Einwilligungserfordernisse werden anhand der Zielgruppe gesondert geprüft.

## 5. Android und iOS von Anfang an berücksichtigen

Die Browserfassung bleibt Grundlage. Als technischer Kandidat wird eine gemeinsame Webanwendung mit nativer Hülle geprüft; eine konkrete Bibliothek wird erst bei Umsetzung ausgewählt. Ein reiner Website-Wrapper garantiert keine Storezulassung. Offline-Spiel, sichere Wiederaufnahme, funktionierender Datei-Import/-Export und passende mobile Bedienung gehören zur Abnahme.

- Speicherzugriff hinter einer gemeinsamen Schnittstelle halten: Browser-IndexedDB und gegebenenfalls nativer Speicher folgen demselben Datenformat. Authentifizierungstoken in Apps über geeigneten geschützten Betriebssystemspeicher verwalten.
- App-Unterbrechung, Prozessbeendigung, Update, Offline-Start und erneute Anmeldung prüfen. Ein Update darf laufende Speichervorgänge oder erreichbare Karrieren nicht beschädigen.
- Android-Zurücknavigation, iOS-Sicherheitsabstände, Tastatur, Dateiauswahl, Teilen, Touchbedienung und Screenreader auf echten Geräten prüfen. Größenlimits und Fehlerfälle für mobile Importe berücksichtigen.
- Für beide Stores öffentliche Datenschutz-URL, passende Alters-/Inhaltsbewertung, Supportkontakt und korrekte Datenangaben vorbereiten. Apple-App-Privacy und Google-Data-Safety müssen App, Backend und eingebundene SDKs abbilden.
- Bei Kontenerstellung die jeweiligen Konto-Löschwege einbauen; externe Logins und gegebenenfalls Sign in with Apple vor Auswahl der Authentifizierung prüfen.
- Vor jedem Store-Release aktuelle SDK-/Ziel-API-, Signatur-, Test- und Reviewanforderungen erneut prüfen. TestFlight und Google-Play-Testspuren für die Geräteabnahme nutzen.
- Werbung, Tracking und Käufe sind nicht beauftragt. Werden sie später gewünscht, sind Datenschutz, Altersgruppe und jeweils geltende Zahlungsregeln vor Einbau neu zu prüfen.

## 6. Reihenfolge und Abnahme

0. Spielstart und Karriereverwaltung anhand von Abschnitt 0 konkretisieren. Vor Umsetzung die zugehörigen Entscheidungen aus Abschnitt 7 festlegen. Abnahme: lokaler Start ohne Anmeldung, Abbruch der Anmeldung ohne angelegte Karriere, stabile Vorschau bei Rücknavigation, unveränderter übernommener Startkader, keine sichtbaren Fähigkeitszahlen, ausgeschaltete öffentliche Teilnahme und korrekte Hinweise zu Speicherart und Internetbedarf. Zweifache Startbestätigung und verlorene Serverantwort erzeugen genau eine Karriere. Die Speichergrenze wird auch bei zwei gleichzeitigen Anlagen eingehalten; volle Speicherplätze überschreiben keine vorhandenen Karrieren.
1. Speicherabläufe und Dateninventar prüfen; lokale Wiederherstellung, Fehleranzeigen, Speichertexte und strukturiertes Ereignisprotokoll umsetzen. Abnahme: Schreibabbruch, voller Speicher, beschädigter Import, Export/Import-Rundlauf, Transfers aller Vereine, Vertragsverlängerungen und Vereinslosigkeit sowie Wiederaufnahme ohne doppelte Ereignisse.
2. Konten, Hosting und verbindliche Serverberechnung konkretisieren und Serverkarrieren bauen. Abnahme: Manipulation von Ergebnissen, wiederholte Aktionen, veraltete Revisionen, Verbindungsabbruch, parallele Geräte sowie abgewiesene lokale Importe. Alte Titel werden nicht übernommen.
3. Namensfilter integrieren. Abnahme: legitime Namen mit Akzenten, harmlose Teilwörter, Umgehungsversuche, Umbenennung und Import; bei öffentlichem Betrieb zusätzlich direkte API-Aufrufe und Meldungsbearbeitung.
4. Die zentrale Hall of Fame aus bestätigten Serverereignissen aufbauen. Abnahme: zwei Karrieren eines Managers, gleiche Namen verschiedener Manager, Titel nach Vereinswechsel, keine doppelte Vergabe, keine lokalen Titel, keine fremden Zugriffe sowie Opt-out und vollständiger Löschablauf.
5. Android-/iOS-Paketierung erproben und Storeunterlagen mit tatsächlichen Datenflüssen abgleichen. Abnahme auf Geräten einschließlich Offlinebetrieb, Prozessabbruch, Update, Import/Export und Konto-Löschung.

Zusätzliche Pflichtfälle für die Schritte 2 bis 4:

- Verlorener Kontozugang und Wechsel des Anmeldeverfahrens erhalten bei erfolgreicher Wiederherstellung dieselben Karriere- und Managerkennungen. Gleiche Anzeigenamen eröffnen keinen fremden Zugriff. Umbenennung dupliziert keine Titel.
- Abmelden und Kontowechsel auf einem gemeinsam genutzten Gerät entfernen den Zugriff auf vorherige Onlinecaches; lokale Karrieren bleiben unverändert. Abgelaufene Anmeldung während einer Aktion führt nach Wiederanmeldung zur Statusklärung desselben Auftrags.
- Zwei Geräte sowie zwei Browser-Tabs versuchen dieselbe Karriere fortzusetzen. Nach Übernahme kann die alte Sitzung auch mit verspäteten Anfragen keinen Fortschritt mehr schreiben. Ein Absturz hinterlässt keine dauerhafte Sperre.
- Verbindungsabbruch vor und nach einer serverseitig bestätigten Aktion sowie mitten in einer Partie verliert keine bestätigten Entscheidungen, wiederholt keine Ergebnisse und würfelt nichts neu. Bestätigungsstatus und sichtbare Speicheranzeige stimmen überein.
- Beenden, Löschen, Opt-out und Kontolöschung folgen der Wirkungstabelle. Wiederholte Löschaufträge sind unschädlich; eine gleichzeitig eintreffende Spielaktion lässt eine gelöschte Karriere nicht wieder erscheinen. Neue Konten übernehmen keine gelöschten Identitäten.
- Spätere öffentliche Aktivierung verwendet ausschließlich vorhandene bestätigte Serverereignisse. Lokale Importe, umbenannte Kopien und geänderte Kennungen bleiben ausgeschlossen.
- Regelupdate während einer Saison und vor beziehungsweise während einer Partie hält den vorgesehenen Einführungszeitpunkt ein. Historische Ergebnisse und Statistiken bleiben unverändert; nicht unterstützte Daten werden verständlich abgewiesen und erhalten.
- Backup-Wiederherstellung wird praktisch erprobt und gegen die festgelegten Zeit-/Datenverlustgrenzen geprüft. Löschungen und öffentliche Rücknahmen bleiben nach Wiederherstellung wirksam.
- Startablauf, Speicherzustände und Kontoverwaltung sind in Deutsch und Englisch, mit Tastatur und Screenreader sowie bei schmaler mobiler Breite bedienbar.

## 7. Entscheidungen vor der Umsetzung

Die Planung ist vollständig als Arbeitsgrundlage beschrieben; die folgenden Vorschläge ersetzen keine noch ausstehende Produkt- oder Anbieterentscheidung. Unabhängige lokale Speicherverbesserungen müssen nicht auf die Auswahl des Onlinediensts warten.

| Entscheidung | Vorschlag / offener Punkt | Spätestens erforderlich |
| --- | --- | --- |
| Startablauf und Parameter | Ablauf und Matrix aus Abschnitt 0; ein Standardregelsatz ohne neue Spielregler | Vor Änderung des Spielstarts |
| Manageridentität | Eine öffentliche Manageridentität pro Account; keine Accountzusammenführung | Vor Accountdatenmodell |
| Onlineplätze und Karriereende | Fünf gespeicherte Onlinekarrieren; beendete zählen mit; kein separates Archiv | Vor Backendbau nach Kostenschätzung |
| Löschen einer Onlinekarriere | Öffentliche Einträge dieser Karriere ebenfalls entfernen | Vor Speicher- und Titelmodell |
| Hall of Fame | Erfolgssammlung ohne Gesamtrang; spätere Freigabe bestätigter Serverhistorie zulassen | Vor öffentlicher Titelansicht |
| Titelzuordnung | Manager des Siegervereins beim endgültigen Titelentscheid | Vor serverseitiger Titelvergabe |
| Geräteübernahme und Offlineverhalten | Eine schreibende Sitzung pro Karriere; Onlinefortschritt bei Verbindungsverlust an sicherem Punkt anhalten | Vor Server-Matchprototyp |
| Updates | Neue Regeln für künftige Ereignisse; Saisonregeln zum Saisonwechsel; keine rückwirkende Umrechnung | Vor erstem Serverrelease und jeder Regeländerung |
| Hosting und Anmeldung | Anbieter, Region, Wiederherstellungsverfahren und Supportzuständigkeit noch offen | Vor Integration eines Anbieters |
| Betrieb und Finanzierung | Kostenobergrenze, Lastannahmen, Entwurfsfristen, Ratenlimits, Backups und Wiederherstellungsziele noch offen | Vor öffentlichem Onlinebetrieb |
| Öffentlichkeit und Datenschutz | Betreiber, Zielaltersgruppe, Zielländer, Löschfristen und Moderationsverantwortung noch offen; Quellen vor Freigabe aktualisieren | Vor Registrierung beziehungsweise öffentlicher Teilnahme |

Die lokalen Speicher- und Karriereprotokollblöcke wurden mit Prototyp 87 veröffentlicht, der lokale Startblock mit Prototyp 88. Für weitere Blöcke gelten die bestehenden Regeln für Quellcode, Build, Seitenfuß und Live-Prüfung.

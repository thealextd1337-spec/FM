# Spielstände, Hall of Fame und App-Stores

Stand: 28. September 2026. Produktplanung für die Vereinswelt, noch nicht umgesetzt. Die Sechserliga und `freekickdemo/` gehören nicht zum Umfang.

## Beauftragter Umfang und offene Entscheidungen

Geplant werden zuverlässige Spielstände mit verständlichen rechtlichen Speicherinformationen, eine übergeordnete Hall of Fame mit Managern und ihren Titeln, Google-Play- und Apple-App-Store-Kompatibilität sowie ein Schimpfwortfilter für Namen.

Die Hall of Fame wird zentral, öffentlich und geräteübergreifend geplant. Lokale Spielstände und Importe sind nicht teilnahmeberechtigt, auch nicht durch einen späteren Upload. Eine lokale Hall of Fame ist kein Umsetzungsschritt. Für die Teilnahme wird eine von Beginn an serverseitig geführte Karriere mit zugeordnetem Managerkonto vorgesehen. Anbieter, Anmeldeverfahren, Zielaltersgruppe und Finanzierung sind noch zu entscheiden. Die folgenden technischen Details sind Umsetzungsvorschläge.

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

### Auswertbare Hintergrundstatistik im Spielstand

Jede Karriere soll spätere Abfragen über alle Vereine und Saisons erlauben, auch wenn eine Information gerade nicht in der Oberfläche angezeigt wird. Dazu bleiben bestätigte Markt- und Vertragsereignisse im jeweiligen Spielstand erhalten. Diese internen Karrieredaten werden nicht automatisch in der öffentlichen Hall of Fame veröffentlicht. Für Serverkarrieren führt der Server das verbindliche Protokoll; private lokale Karrieren behalten ein eigenes, nicht gewertetes Protokoll.

Der Quellstand speichert bereits Vereinswechsel und einige Abgänge in `world.transfers`. Eine erfolgreiche Verlängerung ändert derzeit vor allem den aktuellen Vertrag; ein Buchungstext allein ist kein verlässlicher Datensatz für spätere Statistik. Die Ergänzung soll deshalb ein strukturiertes Ereignisprotokoll verwenden. Bestehende Transfereinträge können weitergelesen werden, ohne alte Spielstände zu rekonstruieren.

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

1. Speicherabläufe und Dateninventar prüfen; lokale Wiederherstellung, Fehleranzeigen, Speichertexte und strukturiertes Ereignisprotokoll umsetzen. Abnahme: Schreibabbruch, voller Speicher, beschädigter Import, Export/Import-Rundlauf, Transfers aller Vereine, Vertragsverlängerungen und Vereinslosigkeit sowie Wiederaufnahme ohne doppelte Ereignisse.
2. Konten, Hosting und verbindliche Serverberechnung konkretisieren und Serverkarrieren bauen. Abnahme: Manipulation von Ergebnissen, wiederholte Aktionen, veraltete Revisionen, Verbindungsabbruch, parallele Geräte sowie abgewiesene lokale Importe. Alte Titel werden nicht übernommen.
3. Namensfilter integrieren. Abnahme: legitime Namen mit Akzenten, harmlose Teilwörter, Umgehungsversuche, Umbenennung und Import; bei öffentlichem Betrieb zusätzlich direkte API-Aufrufe und Meldungsbearbeitung.
4. Die zentrale Hall of Fame aus bestätigten Serverereignissen aufbauen. Abnahme: zwei Karrieren eines Managers, gleiche Namen verschiedener Manager, Titel nach Vereinswechsel, keine doppelte Vergabe, keine lokalen Titel, keine fremden Zugriffe sowie Opt-out und vollständiger Löschablauf.
5. Android-/iOS-Paketierung erproben und Storeunterlagen mit tatsächlichen Datenflüssen abgleichen. Abnahme auf Geräten einschließlich Offlinebetrieb, Prozessabbruch, Update, Import/Export und Konto-Löschung.

Es gibt in diesem Planungsschritt keine Codeänderung, Versionsanhebung oder Veröffentlichung. Bei späterer Veröffentlichung gelten die bestehenden Regeln für Quellcode, Build, Seitenfuß und Live-Prüfung.

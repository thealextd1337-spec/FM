# Release 127 – wirksame Jugendförderung und Karriereenden

Veröffentlichung vom Nutzer beauftragt. Der Kandidat baut auf dem veröffentlichten Stand 126 auf und übernimmt dessen Wappen, Sponsoren und vertraute Karriereoberfläche.

Neue mehrjährige Vereinswelten erhalten vier Förderstufen mit 0/500/1.000/1.500 Credits. Ihr gewachsener Jugendstatus verbindet langfristige Förderung und sportlichen Erfolg; Farbe, qualitative Bewertung und Trendpfeil sind sichtbar. Neue Jahrgänge reagieren kontinuierlich auf den Status, alle Förderstufen können sämtliche Positionen hervorbringen. Der kleine Länderrahmen betrifft neue Jugend-, freie und Pokalersatzspieler. Vorhandene Spieler erhalten keine nachträgliche Neuberechnung. [Regeln, Parameter und Grenzen](jugend-legacy-release127.md).

Gemeinsame Karriereendstaffel für aktive Profis ab 33: 40 Prozent, jährlich +10 Prozentpunkte, mit 39 zwingend. Saisonbeginn zeigt mögliche Abschiede, die Saisonmitte speichert verbindliche Entscheidungen und der Saisonabschluss vollzieht sie mit einer kurzen belegten Geschichte. Spieler und ihre letzte Saison bleiben im Archiv; reine Pokalteams erhalten regulären Ersatz. Alte Welten ohne neue Kennung behalten ihren Ablauf.

## Prüfung

Die fokussierten Kontrollen prüfen vier Förderstufen, alle Positionen, Karriereend- und Vertragsregeln, Speicherrundlauf, Wiederholungsfestigkeit, hohe Talentgewichte und den Länderrahmen. Alle drei Welten bestehen 20 Saisons mit zusammen 59.460 nativen Partien. 110 Produktionskommandos, vier FTPS- und sechs Laufzeit-Uploadkontrollen bestehen. Die vollständige Paketbilanz steht unter [20-Saison-Nachweis](jugend-langzeit-release127.md).

Quelle und Einzeldatei-Build bestehen jeweils zwölf Browserfälle: 320/390/1440 Pixel, Deutsch/Englisch, Hell/Dunkel. Vier Förderbeträge, vorhandene Statusfarben, zugänglicher Trend, tatsächliche Zahlung und identische Kandidaten nach Neuladen sind geprüft. Der Saisonbeginnhinweis ist auch in der echten Karriereoberfläche sichtbar. Eine aktuelle native physische Partie besteht nichttriviale Pause, Neuladen, Fortsetzung und Abschluss mit identischen Spielerkennungen, Ergebnis-/Zeitstand und eindeutigen Buchungen.

Eine veraltete Hilfedatenkennung wurde von 126 auf 127 angehoben. Zwei Versuche, den großen Einzeldatei-Build über Playwrights Antwortinterception zu laden, endeten mit geschlossenem Browserziel. Über reguläre HTTP-Auslieferung derselben Datei besteht der Build alle zwölf Fälle; an der Spiellogik wurde hierfür nichts geändert. Hardwareleistung auf einem Smartphone wurde in diesem Release nicht neu gemessen.

## Einschätzung nach 20 Saisons

Die Startelf liegt im Mittel 7,13 Prozent, der nach Karriereenden gemessene Kader 8,25 Prozent über seinem jeweiligen Ausgangsstand. Zu Saisonbeginn stehen durchschnittlich 11,68 Profis zur Verfügung; alle geprüften Spielbetriebsstarts haben mindestens zehn Spieler und einen Torwart. Nach Abschieden sind es 10,62, im letzten Jahr mindestens acht. Die vorübergehende Lücke wird im folgenden Transferfenster geschlossen. Keine negative Abschlusskasse oder native Weltverletzung in den drei Läufen.

Saison 20 kostet im Mittel 3.060 Credits je KI-Ligaverein: 1.634 Gehälter, 968 Förderung, 79 Ausbildungsentschädigungen und 380 Ablösen. Einnahmen betragen 3.559 Credits. Die Welt erzeugt dabei im Mittel 458,3 Jugendliche und übernimmt 103,3 in die Profikader; Übernahmen können aus früheren Jahrgängen stammen. Alle Startspieler sind in diesen drei Läufen ausgeschieden. Anfangs 17-Jährige können nach 20 Saisons noch 36 sein; die Regel erzwingt 39, nicht pauschal den zwanzigsten Saisonabschluss.

Die Ländergruppen A/D liegen im letzten Jahr 2,58 Prozent auseinander, über die letzten fünf Jahre bei 1,66 Prozent. Dieser kleine Rahmen ist die gewählte Abstimmung: langjährige gute Vereinsarbeit soll die Herkunft übertreffen können. Die Gesamtentwicklung belegt das vollständige Paket; sie isoliert keinen einzelnen Legacy- oder Länderparameter. Drei Seeds belegen diese Stichprobe, nicht jede denkbare Karriere.

## Reproduktion

`node work/audit-youth-release-127.cjs --freeze` friert die aktuelle native Quelle ein. Danach jeden Seed `youth20-a`, `youth20-b`, `youth20-c` mit `node --max-old-space-size=2048 --expose-gc work/audit-youth-release-127.cjs --seed=SEED --seasons=20` starten. Auswertung: `node work/summarize-youth-release127.cjs`, dann `node work/render-youth-release127.cjs` und `node work/verify-youth-release127.cjs`. Die 35 tatsächlich geladenen nativen Quellen werden gegen das Manifest geprüft. [Saisonwerte](../outputs/release-127/annual.csv), [interaktiver Bericht](../outputs/release-127/longterm-report.html), [Abnahme](../outputs/release-127/validation.json).

## Veröffentlichung

Die Veröffentlichung und öffentliche Byte-/Versionsprüfung folgen erst nach vollständiger Langzeit- und Produktionsabnahme. Es gibt keine Änderungen oder Auslieferung von `freekickdemo/` und keinen neuen Unity-Build.

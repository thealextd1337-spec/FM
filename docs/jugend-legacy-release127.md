# Jugendförderung, Legacy und Karriereenden – Release 127

Die Freigabe umfasst die vier Jahresbeträge 0/500/1.000/1.500 Credits, einen gewachsenen Jugendstatus, kontinuierliche Qualität neuer Jahrgänge, eine wechselnde Positionsverteilung, den Länderrahmen und gemeinsame Karriereendregeln. Aktivierung ausschließlich beim Erstellen neuer mehrjähriger Expansionskarrieren über `world.youthSystem.version: 1`. Gespeicherte Welten ohne Kennung behalten ihre Regeln; es gibt keine Nachberechnung oder Umrechnung vorhandener Spieler.

## Förderung und gewachsene Jugendarbeit

Die tatsächlich bezahlten letzten drei Budgets wirken mit 45/35/20 Prozent. Die Kandidatenmenge interpoliert zwischen den langfristigen Mitteln 1,5/3,5/5/6; ein reproduzierbarer Restentscheid liefert ganze Mengen. Höchstens sechs neue Spieler pro Jahr. Der Anfang einer Förderung erreicht die Dauermenge daher noch nicht sofort. Förderstufe und Status haben getrennte Aufgaben: Menge und langfristige Qualität.

Interne Förderziele 0/45/75/100 werden mit 65 Prozent gewichtet, sportliche Leistung mit 35 Prozent. Der Status nähert sich einem höheren Jahresziel um 15 Prozent des Abstands, einem niedrigeren um 5 Prozent. Anfangsstatus entsprechend den vorhandenen Vereinsprofilen: 10/30/50/70/90. Kein eigener zusätzlicher Budgetbonus auf Spielerqualität.

Die Saisonerwartung wird beim tatsächlichen Transferschluss vor der ersten Partie aus der Vereinsqualität eingefroren. Ligaabweichung gibt bis ±25 Erfolgspunkte um den Ausgangswert 50. Meisterschaft bringt 5, nationaler Pokal bis 5, Crown bis 15 und Horizon bis 10 weitere Punkte, gemeinsam höchstens 25. Pro Pokal zählt nur die höchste belegte Stufe: tatsächliches Spiel 5 Prozent, Achtelfinale 15, Viertelfinale 30, Halbfinale 50, Finale 70, Titel 100 Prozent des jeweiligen Höchstbeitrags. Keine Punkte allein für eine ungespielte Qualifikation. Der Erfolg wird auf 0–100 begrenzt. Internationale Erwartungen werden gespeichert, aber die Pokalboni werden in diesem Stand nicht relativ zu einer erwarteten K.-o.-Stufe normalisiert.

Der Qualitätsrahmen neuer Jugendspieler folgt kontinuierlich `0,003 × (Status − 50)`. An den fünf Farbmitten entspricht dies −12/−6/0/+6/+12 Prozent, an den äußeren Grenzen ±15 Prozent. Er ersetzt die früheren schwach/normal/stark-Startqualitätsbänder mit einem gemeinsamen normalen Ausgangsband. Die sichtbaren Farben wechseln weiterhin an 20/40/60/80; unterhalb eines Farbwechsels wird die tatsächliche Wirkung bereits besser oder schlechter. Die internen Zahlen werden im Produkt nicht angezeigt. Vorhandene Spieler werden nicht geändert.

Im Nachwuchs, bei der Förderwahl und im Vereinsprofil erscheinen vorhandene fünf Bewertungsfarben, qualitative Beschriftung und ↑/→/↓. Der Pfeil zeigt die tatsächlich letzte jährliche Statusänderung; Änderungen innerhalb ±0,5 internen Punkten gelten als stabil. Deutsch/Englisch und zugängliche Trendbeschriftungen sind enthalten.

## Positionen, Länder und Talente

Jede neue Kandidaten-ID erhält eine eigene feste Positionsziehung: Torwart 12 Prozent, Abwehr 35, Mittelfeld 35, Angriff 18 Prozent. Fähigkeiten, Nebenpositionen, Obergrenzen und Rollen werden erst danach vom vorhandenen Generator erzeugt. Keine festen Stürmer-/Torwartslots; alle Förderstufen können über die Jahre alle Positionen erzeugen. Mehr Förderung vergrößert die Auswahl, garantiert aber keine bestimmte Jahresposition.

Neue Jugend-, freie und Pokalersatzspieler verwenden ihr Generierungsland: Gruppe A +4, B +2, C 0 und D −3 Prozent. Bei Jugend addiert sich dieser kleine Rahmen zum Academyfaktor. Bei Pokalersatz ersetzt er den bisherigen additiven Länderoffset; der vorhandene Vereinsoffset bleibt erhalten. Startkader behalten ihre vorhandene Erzeugung. Nationalität und Transfers ändern keine Fähigkeiten.

Die bestätigten Talentbänder und ihr globaler hoher Anteil bleiben bestehen. Für die jährliche KI-Generation wird ihre Gewichtung aus den tatsächlichen, vor der ersten Erzeugung vollständig geplanten Kandidatenmengen aller KI-Akademien normalisiert. Die später finanzierte Managerakademie bildet einen separaten vollständigen Jahrgang: in diesem Einzeljahrgang neutralisiert die Normalisierung den bisherigen Profilmultiplikator für seltene hohe Talente. Damit kann eine beliebige spätere Budgetwahl die bereits erzeugten KI-Spieler nicht verändern und beide Erzeugungsgruppen halten denselben globalen Erwartungsanteil. Die KI-Profile behalten untereinander ihre relativen Talentgewichte. Es handelt sich um Wahrscheinlichkeiten, keine erzwungenen Jahresquoten. Anfangspools behalten ihre ursprüngliche Normalisierung. Es gibt keine nachträgliche Talentänderung und keine neue Akademieentwicklung ohne Profieinsätze.

KI-Vereine wählen dieselben vier Beträge. Profilpräferenzen sind 0/500/1.000/1.000/1.500; davon höchstens die höchste Stufe innerhalb von 22 Prozent des nach zugesagten Gehältern und 450 Credits Reserve verbleibenden Guthabens. Die veraltete KI-Potenzialheuristik wird in diesem Release nicht durch eine zusätzliche allwissende Talent-/Obergrenzenbewertung ersetzt.

## Karriereenden

Alle aktiven Liga-, freien und Pokalspieler nehmen ab 33 einmal jährlich teil: 40 Prozent, danach jährlich +10 Prozentpunkte bis 100 Prozent mit 39. Ein eigener deterministischer Spieler-/Saison-Zufallsstrom verändert keine Matchzufallsziehungen. Zur Saisonmitte wird die Entscheidung gespeichert; Transfers und Neuladen ändern sie nicht. Saisonbeginn zeigt mögliche Abschiede, ab Entscheidung die tatsächlich angekündigten Abgänge. Spieler bleiben bis zur letzten Partie verfügbar.

Nach Gehaltsbuchung und sportlichem Abschluss werden Karriereenden ausgeführt, Verträge entfernt und Spieler im Vereins- bzw. freien Karrierearchiv erhalten. Angekündigte Abgänge werden nicht mehr verlängert; neue Wechselverträge enden im laufenden Karrierejahr. Reine Pokalvereine erhalten native 18–23-jährige Ersatzspieler derselben Position und Rückennummer. Ersatz gehört zur nächsten Saison und wird bei seinem ersten Saisonwechsel nicht erneut gealtert.

Der Rückblick bietet eine kurze Abschiedsgeschichte aus erfassten Einsätzen, Toren, Vorlagen, Titeln und Stationen. Nicht erfasste frühere Jahre werden nicht erfunden. Die reguläre Jahresverdichtung verarbeitet auch die neu archivierten Spieler, sodass Profile ihre letzte Saison behalten. Altersbedingte Abgänge sind von abgelaufenen oder vereinslosen Jugendspielern getrennt.

## Abnahme

Die vollständige Langzeitbilanz und Veröffentlichungsprüfung stehen in [Release 127](release-127.md). Drei neue native 20-Saison-Läufe mit denselben Seeds wie die vorherigen Vergleiche; tatsächliche 991 Partien je Saison. Die Releasefassung setzt Förderung und Qualität bereits ab Saison 1 ein und behandelt die Managerakademie mit den vier neuen Stufen. Deshalb ist dies ein Paketnachweis und kein weiterer isolierter Test nur des Länderaufschlags.

Vorauswahl, bezahltes Scouting und Training im Akademiepool waren bislang offene Entwürfe und gehören nicht zu diesem Release. Ihre Mengen, Kosten und Entwicklungsgrenzen sind weiterhin gesondert festzulegen.

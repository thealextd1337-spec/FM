# Mentale Spielerfähigkeiten – Entwurf

Stand: 6. Oktober 2026. Planung für die Vereinswelt; noch keine neuen Fähigkeiten oder Matchregeln eingebaut. Spieler und Spielweisen sind auf Nutzerwunsch ein Schwerpunkt der detaillierten Planung. Archetypen sind bestätigte Trainerrollen mit Rolleneignung im Profil und Hervorhebung in der Taktik.

## Ziel

Spieler unterscheiden sich darin, welche Gelegenheit sie erkennen, welche Aktion sie wählen und wie stabil sie unter Druck handeln. Technische Fähigkeiten bestimmen weiterhin, wie gut eine gewählte Aktion ausgeführt wird. Die mentale Qualität darf weder einen freien Schussweg erfinden noch einen physisch unerreichbaren Ball erreichbar machen.

Die drei mentalen Werte sind noch nicht implementiert; ihr Zahlenwert bleibt intern. Die bestätigte Rollenoberfläche zeigt Eignung und wichtige verfügbare Fähigkeiten ausschließlich als Farbstufen. Die Anzeige künftig eingeführter mentaler Fähigkeiten wird daran angepasst; keine exakten Werte oder Entwicklungspunkte in sichtbaren oder zugänglichen Beschriftungen.

## Spielerindividualität als eigener Planungsblock

Der Nutzer verlangt eine genaue Planung von Spielern und Spielweisen. Die folgenden Punkte sind ein Arbeitsvorschlag, keine bereits bestätigte Erweiterung des Datenmodells. Die drei mentalen Fähigkeiten bleiben ebenfalls ein Entwurf.

- Fähigkeiten bestimmen das Können: Eine Wahlvorliebe verbessert weder Passpräzision noch Abschluss oder Reichweite. Mentale Fähigkeiten bestimmen Erkennen, Wahlqualität und Handeln unter Druck; doppelte Boni sind zu vermeiden.
- Die vom Trainer zugewiesene Rolle beschreibt die taktische Aufgabe, beispielsweise Entgegenkommen oder Tiefenlauf. Persönliche Vorlieben können die Umsetzung bei mehreren sinnvollen Möglichkeiten zusätzlich beeinflussen; konkrete Dimensionen, Anzahl, Verteilung und Einflussstärke bleiben offen. Rolle, persönliche Vorliebe und Können sind getrennt.
- Einsatzzone, individuelle Anweisungen und Teamtaktik bestimmen den Rahmen. Eine Vorliebe darf eine bestätigte taktische Vorgabe nicht systematisch aushebeln. Situationen können Abweichungen von einer ungünstigen Einzelvorgabe rechtfertigen, wie bereits bestätigt.
- Wahrnehmung und Absicht verbinden Persönlichkeit mit der aktuellen Situation: Ein angebotener Lauf bleibt stabil, solange er sinnvoll ist; Ballverlust, geschlossene Wege und neue Gefahren führen zu begründetem Umplanen. Spieler kennen keine zukünftigen Ergebnisse oder verdeckten gegnerischen Pläne.
- Bestätigt: Profilvorschläge zeigen die bestgeeignete Rolle und weitere Eignungen anhand der Fähigkeiten, primär für spielbare Positionen. In der Taktik erscheinen gewählte Rolle, wichtige Fähigkeiten und typischer Aktionsraum. Weitere persönliche Vorliebenhinweise bleiben offen. Fähigkeitseinschätzungen und Rolleneignung bleiben Farbstufen.
- Am 6. Oktober 2026 grundsätzlich bestätigt: langsame Veränderung der Spielweise durch Training und wiederholte Einsätze bei stabiler persönlicher Grundtendenz. Lernimpulse, Zeiträume, Grenzen und eine etwaige neue Trainingsbedienung bleiben offen. Form und Müdigkeit beschreiben den aktuellen Zustand; sie verändern nicht automatisch die dauerhaft gespeicherte Spielweise.
- Auf Nutzerwunsch wird die weitere Planung anhand wählbarer taktischer Archetypen konkretisiert. Der [Rollenkatalog](spieler-archetypen-plan.md) enthält 13 Ausgangsrollen mit Verhalten, Grenzen und Vergleichsszenen; die beiden Tormannrollen mitspielender Tormann und Linientormann sind bestätigt. Feldspielerrollen und genaue Gewichtung bleiben offen. Die Rollenwahl ersetzt die frühere offene Entscheidung über feste persönliche Archetypen.

Vor Umsetzung erhält jede gewählte Verhaltensdimension einen Steckbrief: Bedeutung, Auslöser, zulässige Alternativen, Wirkung mit und ohne Ball, taktische Grenzen, Bezug zu Fähigkeiten, Entwicklung, sichtbare Beschreibung und messbare Abnahme. Feldspieler und Torhüter werden gesondert betrachtet; Torhüter erhalten keine unpassenden Feldspielerpräferenzen.

Abnahmevorschlag: In vergleichbaren Szenen bei gleichen Fähigkeiten unterschiedliche Vorlieben isoliert prüfen. Anschließend bei gleicher Vorliebe Fähigkeiten verändern. Situationen umfassen freien und zugestellten Passweg, Tiefenlauf an der Abseitslinie, offenes Tor, Ballverlust, Druck auf den Keeper und taktisch vorgegebenes sicheres Abspiel. Unterschiede müssen über mehrere passende Situationen erkennbar sein; Kontrollfälle verlangen weiterhin die physisch erlaubte, taktisch angemessene Reaktion. Vergleichsstudien prüfen auch Teamzusammenspiel, kompakte KI-Partien, beide Angriffsrichtungen und Kosten der Entscheidung auf Mobilgeräten.

## Kleine erste Ausbaustufe

| Fähigkeit | Zuständigkeit | Beispiel | Abgrenzung |
| --- | --- | --- | --- |
| Ruhe | Begrenzter Qualitätsverlust unter tatsächlichem Gegner- und Zeitdruck | Präziser Abschluss, wenn der Keeper entgegenkommt; sicheres Abspiel aus engem Raum | Verbessert nicht den unbedrängten Grundabschluss oder die technische Ballbehandlung |
| Antizipation | Dynamische Situationen früher erkennen und eine Aktion vorbereiten | Verschobenen Keeper nach Querpass erkennen, Abpraller verfolgen, Direktaktion vorbereiten | Stellungsspiel bleibt zuständig für räumliche Laufwege, Deckung und Abseitsposition |
| Entscheidungen | Aus den tatsächlich möglichen Aktionen die sinnvollere häufiger wählen | Direkt in die offene Ecke schießen, zum besser postierten Mitspieler passen, keinen zugestellten Keeperpass wählen | Passspiel und Abschluss bleiben Ausführungsfähigkeiten; Teamtaktik und Einzelanweisungen bestimmen die Absicht |

Konzentration ist eine mögliche spätere Ergänzung. Zunächst zurückstellen: Ihre Wirkung über Müdigkeit, Fehler und lange Reaktionszeiten überschneidet sich mit Form, Frische und Antizipation und ist schwieriger unabhängig zu prüfen. Mut, Führungsstärke oder wichtige Spiele ebenfalls erst bei einer konkreten Spielsituation ergänzen.

## Entscheidungsfolge

1. Physisch und regeltechnisch erlaubte Aktionen bestimmen: Reichweite, Ballhöhe, Ankunftszeit, Körperausrichtung, Abseits und echte Pass-/Schusswege.
2. Antizipation bestimmt, wie früh ein Spieler eine dynamische Gelegenheit erkennt und vorbereiten kann. Geringe Antizipation bedeutet spätere oder seltener passende Vorbereitung; keine generelle Sperre für Direktaktionen.
3. Entscheidungen gewichtet die vorhandenen Alternativen anhand ihrer Qualität und der taktischen Vorgaben. Schlechte Werte erlauben weiterhin gute Entscheidungen und hohe Werte gelegentliche Fehlentscheidungen.
4. Technik zusammen mit Passspiel, Abschluss beziehungsweise Luftspiel bestimmt die Ausführung. Ruhe begrenzt nur den zusätzlichen Verlust durch beobachtbaren Druck. Derselbe Druck darf nicht mehrfach durch mehrere neue Multiplikatoren bestraft werden.

Richtungswechsel, Animationen, Kollisionen und eine korrekte Ballflugbahn müssen unabhängig davon funktionieren. Mentale Werte beheben keine grafischen Fehler.

## Längerfristige Absichten und situationsabhängiges Umplanen

Die Spieler sollen eine Absicht über mehrere Aktionen und Simulationsschritte verfolgen. Eine neue Positionsaufnahme darf nicht automatisch eine völlig neue Entscheidung auslösen. Diese Anforderung ergänzt den Entwurf; sie ist noch nicht umgesetzt.

Bestätigte Produktvorgabe: Spieler dürfen situationsabhängig von einer ungünstigen Einzelvorgabe abweichen, bleiben innerhalb der Teamtaktik. Eine typische komplette Partie soll ungefähr 2–3 reale Minuten ohne manuelle Pause dauern. Wahrnehmungs-/Vorbereitungszeiten und physische Ausführung werden beim Abstimmen der Matchdauer getrennt geprüft.

- Teamtaktik und individuelle Anweisungen geben den Rahmen vor. Innerhalb dieses Rahmens hält jeder Spieler eine eigene Absicht: beispielsweise einen Gegner binden und anschließend querlegen, einen Tiefenlauf anbieten, den Passweg schließen oder das Tor absichern.
- Eine Absicht enthält Ziel, beteiligten Mitspieler beziehungsweise Raum, aktuelle Teilaufgabe, erwartetes Zeitfenster, Beginn, Gültigkeitsbedingungen und Abbruchgrund. Sie garantiert weder den nächsten Pass noch den Erfolg einer zukünftigen Aktion.
- Beispiel eines Angreifers: erst entgegenkommen, nach dem Abspiel weiterlaufen und sich hinter dem Verteidiger anbieten. Beispiel eines Ballführers: den Verteidiger anziehen und zum frei werdenden Mitspieler passen. Die Folgeaktion wird nur ausgeführt, wenn sie zum späteren Zeitpunkt wirklich möglich ist.
- Der laufende Plan erhält einen begrenzten Fortsetzungsbonus. Ein geringfügig besser bewertetes Ziel löst keinen sofortigen Wechsel aus. Deutlich bessere Chancen dürfen ihn ersetzen. Mindestbindung, Ablaufzeit und erforderlicher Vorteil werden anhand der Szenen kalibriert, in der Simulationszeit statt anhand von Grafikbildern.
- Neubewertungen entstehen bei relevanten Ereignissen: Ballbesitzwechsel, verschlossener Passweg, veränderter Torwartposition, unerreichbarem Ziel, neuem Abpraller oder gefährlich verändertem Gegnerdruck. Zusätzlich gibt es eine begrenzte regelmäßige Prüfung. Ein Foul, Ausball oder eine andere zwingende Regelunterbrechung beendet die betroffene Aktion sofort.
- Wahrnehmung und physische Zulässigkeit sind getrennt: Antizipation beeinflusst das rechtzeitige Erkennen einer Veränderung. Die Engine prüft Kontakt und Regeln unabhängig davon. Ein verspätet reagierender Spieler darf sich irren, aber keinen unerreichbaren Ball erhalten oder eine unerlaubte Handaufnahme ausführen.
- Es gibt nur kurze, begrenzte Vorhersagen aus wahrnehmbarer Bewegung und aktuellen Laufangeboten. Spieler kennen weder zukünftige Zufallsziehungen noch verdeckte gegnerische Pläne. Gemeinsame Lauf-/Passangebote dienen der Koordination, nicht einem vorab festgelegten Szenenausgang.
- Entscheidungen bewertet sowohl den ursprünglichen Plan als auch mögliche Anpassungen. Ruhe begrenzt den Ausführungsverlust unter Druck; sie soll keinen zusätzlichen pauschalen Planwechselbonus erzeugen. Stellungsspiel bleibt zuständig für die tatsächlichen Laufwege.
- Während einer bereits ausgeführten Ballaktion bleiben Ballbahn und Kontakt maßgeblich. Ein Umplanen darf einen abgegebenen Schuss nicht umlenken. Aktionen mit begonnenem Ausholen brauchen ausdrücklich definierte Übergänge oder Abbrüche, damit neue Entscheidungen keine Positionssprünge verursachen.

Die Absichten gehören zur Simulation, nicht zum Renderer. Pause, Rückschau, Kamerwechsel und Bildrate verändern sie nicht. Ein reproduzierbarer Testzustand umfasst Absicht, Vorbereitung, Zeitbasis und Zufallszustand. Der Nutzer akzeptiert nach App-Abbruch den letzten sicheren Unterbrechungspunkt. Neue aktive Matches speichern dort ausreichenden Spieler-/Absichtszustand und abgeschlossene Buchungen; eine gerade laufende Flug-/Kontaktaktion muss nicht vollständig dauerhaft abgelegt werden. Ältere Matches erhalten keine rekonstruierte Absicht. Historische Ergebnisse bleiben unverändert.

Mobile Leistungsgrenzen bestimmen den Umfang der Planung: Absichten fortführen statt in jedem Grafikbild erneut auswählen, periodische Bewertungen über Spieler verteilen, relevante Veränderungen ereignisbezogen behandeln und nur kurze Vorhersagen mit begrenzten Alternativen berechnen. Kontakt- und Regelprüfungen bleiben unabhängig von diesem Planungstakt. Die Kosten für Wahrnehmung und Aktionswahl müssen getrennt von Rig und Rendering auf echten Mobilgeräten gemessen werden; Ziele und Abnahme stehen im [Enginevergleich](unity-match-engine-plan.md#mobile-performance-als-freigabebedingung).

Abnahmeszenen: stabiler Tiefenlauf trotz kleiner Ballbewegungen; Abbruch nach Ballverlust; Querpass nach erfolgreichem Binden eines Gegners; neues Ziel nach geschlossenem Passweg; früh beziehungsweise spät erkannter Abpraller; sofortige Regelunterbrechung; keine Wechsel zwischen zwei fast gleichwertigen Zielen; identischer Fortsetzungsverlauf nach Speichern/Laden und in 2D/3D.

## Erste konkrete Situation: Querpass und Abpraller

Die Grundregel ist bestätigt: Bei guter Abschlusschance nach Querpass oder tatsächlich erreichbarem Abpraller und passender Vorbereitung sowie Körperstellung wird der Direktabschluss bevorzugt. Bei ungünstiger Lage bleibt Annahme oder eine andere passende Aktion sinnvoll; eine deutlich bessere Abspielmöglichkeit bleibt zulässig. Kein garantierter Torerfolg. Genaue Gewichte und Zeitfenster bleiben offen; Dokumentationsentscheidung ohne Laufzeitänderung oder Anpassung alter Spielstände.

- Aus der aktuellen Keeperposition, seinem Bewegungszustand und seiner erreichbaren Rückkehrzeit die offene Torfläche und das Zeitfenster bestimmen. Ein Keeper ist nicht allein deshalb schlecht positioniert, weil er seitlich steht.
- Nach einem Querpass oder legal erreichbaren Abpraller einen Direktschuss gegen Annahme, weiteres Dribbling und Querpass bewerten. Genug offene Torfläche und ein kurzes Zeitfenster erhöhen den Nutzen des Direktschusses.
- Antizipation beeinflusst das Erkennen und Vorbereiten; Entscheidungen die Wahl; Technik und Abschluss die Präzision; Ruhe den zusätzlichen Druckverlust. Luftspiel ist nur bei einer passenden Luftaktion relevant.
- Wer nicht rechtzeitig vorbereitet oder ungünstig zum Ball steht, darf annehmen statt einen unnatürlichen Sofortschuss zu erzwingen. Ein Abpraller bleibt frei, bis tatsächlich Kontakt stattfindet.
- Torwart-Ruhe wirkt entsprechend bei Abspielen unter Druck; ein durch einen Gegner blockierter kurzer Ausspielweg bleibt unabhängig vom Wert gesperrt. Gute Entscheidungen bevorzugen eine sichere Alternative.

## Bestätigt: Vorbereitete Aktionen ändern

Vorbereitete Pässe und Schüsse können vor dem ausführenden Ballkontakt bestätigt abgebrochen oder geändert werden, wenn sich die Situation relevant verschlechtert oder eine deutlich bessere Möglichkeit entsteht. Die Umstellung erfordert situationsabhängige Zeit und passende Bewegung; Wahrnehmen, Bewerten und tatsächliches Umstellen bleiben getrennt. Kleine Änderungen lösen keine ständigen Neustarts sinnvoller Absichten aus. Nach dem ausführenden Kontakt bleibt der Ballverlauf physisch; er wird nicht nachträglich auf ein neues Ziel umgeschrieben. Genaue Fähigkeitswirkungen und Zeiten bleiben offen. Dokumentationsentscheidung ohne Laufzeitänderung oder Anpassung alter Spielstände; [Rollenplan](spieler-archetypen-plan.md).

## Bestätigt: Tormann zwischen Fangen und Abwehren

Der Tormann wählt anhand von Ballgeschwindigkeit, Ballhöhe, eigener Stellung, Bewegung und Gegnerdruck bestätigt zwischen Fangversuch und Abwehraktion. Er versucht kontrollierbare Bälle zu sichern und schwierige Bälle durch erreichbare Abwehr möglichst in weniger gefährliche Bereiche abzulenken. Torwartspiel betrifft die Ausführung, Antizipation und Stellungsspiel Vorbereitung und Erreichen, Entscheidungen die Wahl und Ruhe den zusätzlichen Druckeinfluss. Frische wirkt über die bestätigten effektiven Fähigkeiten. Tatsächliche Kontakte und zulässige Handaktionsbereiche bleiben unabhängig davon maßgeblich; freie Abpraller ermöglichen weitere Kontakte und Nachschüsse. Weder Parade noch ungefährliche Ablenkung sind garantiert. Genaue Gewichte und Fangbedingungen offen. Dokumentationsentscheidung ohne Laufzeitänderung oder Anpassung alter Spielstände; [Rollenplan](spieler-archetypen-plan.md).

## Bestätigt: Situatives Risiko nach Spielstand und Restzeit

Spielstand und verbleibende Spielzeit fließen bestätigt in die Bewertung von Aktionen und Absichten ein. Bei knapper Führung spät im Spiel bevorzugen Spieler eher sichere Anschlussaktionen und Absicherung; bei Rückstand und wenig Restzeit können direkte Angriffe und vertretbar riskantere Möglichkeiten höher bewertet werden. Die Wahl bleibt innerhalb der Teamtaktik, des Rollenauftrags und der individuellen Ausrichtung, ohne automatischen Wechsel dieser Einstellungen. Kontakte und Regeln bleiben unabhängig davon maßgeblich. Genaue Zeitbereiche, Gewichte und Risikobandbreiten bleiben offen; keine zusätzliche Fähigkeit. Dokumentationsentscheidung ohne Laufzeitänderung oder Anpassung alter Spielstände; [Rollenplan](spieler-archetypen-plan.md).

## Technische Einführung

- Neue mentale Fähigkeiten im Welt-Spielerdatensatz auf der bestehenden internen Skala 1–20 speichern; auch Jugendspieler und reine Simulationsteams berücksichtigen. Torhüter erhalten dieselben drei mentalen Werte.
- Werte bei der Erzeugung aus reproduzierbaren Spielerprofilen mit kontrollierter Streuung bilden, unabhängig von Technik oder Stellungsspiel. Unterschiedliche mentale Stärken dürfen auch bei technisch ähnlichen Spielern vorkommen.
- Noch keine verdeckten Marktwert-, Gehalts- oder Entwicklungsboni einführen. Zunächst die Matchwirkung unabhängig nachweisen; spätere Wirtschafts- und Entwicklungsregeln gesondert festlegen.
- Die Einführung gilt für neue, eindeutig gekennzeichnete Vereinswelten. Bestehende Karrieren behalten ihre bisherige Entscheidungslogik; keine mentalen Werte für Altspieler ergänzen, keine historischen Partien oder Statistiken rekonstruieren. Dafür ausschließlich eine Versions-/Funktionskennung an der Welt verwenden, keine parallele Altstand-Migration.
- Effektive mentale Werte an einer zentralen Stelle berechnen. Form und Frische dürfen nur einmal berücksichtigt werden. Kein pauschaler Gesamtstärkebonus und keine neue Zufallsziehung beim Zeichnen, Kamerwechsel oder Prüfen einer Option.
- Physische eigene Partien und kompakte Parallelspiele benötigen nachvollziehbare entsprechende Wirkungen, aber keine identischen Szenen. Vor Freigabe beide Pfade prüfen. Temporäre Wahrnehmungs- und Vorbereitungshilfen bleiben flüchtig; reine Spielerwerte bleiben gespeichert.
- Schwerpunktmodule: Welt-Spielererzeugung, `strength-v55.js`, `world-match-v64.js`, `pitch-v55.js`, Abprallerkontakt in `set-pieces-v50.js` und bestehende Aktionsvorbereitung in `pitch-motion-v102.js`. Renderer erhält die bereits gewählte Aktion, keine eigene Entscheidung.

## Umsetzung in Blöcken

1. Physische Gelegenheit und Entscheidung getrennt messbar machen; Keeperposition und freie Abpraller in die Direktoptionen aufnehmen. Noch mit vorhandenen Fähigkeiten. Gleiche Szene bei beiden Angriffsrichtungen prüfen. Absichten zunächst in wenigen Szenen über mehrere Aktionen halten und bei relevanten Veränderungen neu bewerten.
2. Drei mentale Werte für neue Welten erzeugen und speichern. Erst die obige Querpass-/Abprallersituation anbinden; neutraler Referenzwert soll den bisherigen Fähigkeitsweg möglichst wenig verändern.
3. Auf Druckpässe, Keeperausspiele und weitere Aktionswahlen erweitern; räumliches Stellungsspiel nicht als zweite mentale Gewichtung verdoppeln. Kompakte Simulation anbinden.
4. Szenen- und Matchstudie dokumentieren, dann erst Gewichte kalibrieren und veröffentlichen. Konkrete Gewichte bleiben bis zu dieser Prüfung offen.

## Abnahme und Balance

- Identische Kontaktgeometrie mit niedrigen, mittleren und hohen Einzelwerten, gleiche Zufallsstarts: hohe Antizipation erkennt mehr rechtzeitige Direktfenster, hohe Entscheidungen wählt häufiger die bessere Aktion, hohe Ruhe reduziert Fehler unter Druck. Ohne Druck soll Ruhe keinen allgemeinen Präzisionsbonus geben.
- Kontrollfälle: Keeper korrekt positioniert, Schussweg blockiert, schlechter Körperwinkel, Ball nicht erreichbar, Abseits und kein sinnvoller Direktabschluss. Kein mentaler Wert hebt diese Grenzen auf.
- Ein Attribut verändern, alle anderen Spielerwerte festhalten. Wahl, Vorbereitungszeit und Ausführungsqualität getrennt protokollieren, damit sich überlappende Effekte erkennen lassen.
- Wieder 30 Partien je Paarung: gut gegen gut, gut gegen schlecht, schlecht gegen schlecht; Heimrecht und Seeds paaren. Zusätzlich isolierte mentale Vergleichsgruppen bei sonst identischen Mannschaften. Ergebnisse mit Streuung dokumentieren; 30 Partien allein beweisen keine ausgewogene seltene Aktion.
- Spielerwerte sollen den Matchausgang beeinflussen, aber Chancenqualität und Ausführungsqualität nicht durch unkontrollierte Mehrfachboni übersteuern. Keine reine Erfolgsgarantie für hohe Werte.
- Speichern/Laden bewahrt mentale Werte und bereits entschiedene Ereignisse; Ansicht und Bildrate dürfen Entscheidung, Zufallsfolge oder Matchstatistiken nicht verändern. Eigentore bleiben von persönlichen Torzahlen getrennt.

## Noch zu entscheiden

Der Entwurf empfiehlt drei neue Fähigkeiten. Die genaue Profilverteilung, neutrale Referenz, zulässige Einflussstärke, Bindungsdauer von Absichten und spätere Entwicklung werden anhand der isolierten Vergleichsszenen festgelegt. Eine Einführung der neuen mentalen Werte in bestehende Karrieren ist nicht vorgesehen.

Ein möglicher Enginewechsel wird vor einer breiten Erweiterung der Matchlogik geprüft. Unity ist ein Kandidat für einen begrenzten Vergleich des Matchteils; Entscheidungssystem und Fußballregeln müssen unabhängig von der gewählten Engine spezifiziert bleiben. Vorgehen, Browseranforderungen und Entscheidungskriterien stehen im [Unity-/Match-Engine-Entwurf](unity-match-engine-plan.md). Ein Wechsel oder Prototyp ist damit noch nicht umgesetzt.

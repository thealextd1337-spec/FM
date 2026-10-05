# Mentale Spielerfähigkeiten – Entwurf

Stand: 5. Oktober 2026. Planung für die Vereinswelt; noch keine neuen Fähigkeiten oder Matchregeln eingebaut.

## Ziel

Spieler unterscheiden sich darin, welche Gelegenheit sie erkennen, welche Aktion sie wählen und wie stabil sie unter Druck handeln. Technische Fähigkeiten bestimmen weiterhin, wie gut eine gewählte Aktion ausgeführt wird. Die mentale Qualität darf weder einen freien Schussweg erfinden noch einen physisch unerreichbaren Ball erreichbar machen.

Die neuen Werte bleiben zunächst vollständig im Hintergrund. Keine Zahlen, zusätzlichen Profilfelder oder zugänglichen Beschriftungen im Spiel. Eine spätere sichtbare Bewertung würde ausschließlich qualitative Farbstufen verwenden.

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

## Erste konkrete Situation: Querpass und Abpraller

- Aus der aktuellen Keeperposition, seinem Bewegungszustand und seiner erreichbaren Rückkehrzeit die offene Torfläche und das Zeitfenster bestimmen. Ein Keeper ist nicht allein deshalb schlecht positioniert, weil er seitlich steht.
- Nach einem Querpass oder legal erreichbaren Abpraller einen Direktschuss gegen Annahme, weiteres Dribbling und Querpass bewerten. Genug offene Torfläche und ein kurzes Zeitfenster erhöhen den Nutzen des Direktschusses.
- Antizipation beeinflusst das Erkennen und Vorbereiten; Entscheidungen die Wahl; Technik und Abschluss die Präzision; Ruhe den zusätzlichen Druckverlust. Luftspiel ist nur bei einer passenden Luftaktion relevant.
- Wer nicht rechtzeitig vorbereitet oder ungünstig zum Ball steht, darf annehmen statt einen unnatürlichen Sofortschuss zu erzwingen. Ein Abpraller bleibt frei, bis tatsächlich Kontakt stattfindet.
- Torwart-Ruhe wirkt entsprechend bei Abspielen unter Druck; ein durch einen Gegner blockierter kurzer Ausspielweg bleibt unabhängig vom Wert gesperrt. Gute Entscheidungen bevorzugen eine sichere Alternative.

## Technische Einführung

- Neue mentale Fähigkeiten im Welt-Spielerdatensatz auf der bestehenden internen Skala 1–20 speichern; auch Jugendspieler und reine Simulationsteams berücksichtigen. Torhüter erhalten dieselben drei mentalen Werte.
- Werte bei der Erzeugung aus reproduzierbaren Spielerprofilen mit kontrollierter Streuung bilden, unabhängig von Technik oder Stellungsspiel. Unterschiedliche mentale Stärken dürfen auch bei technisch ähnlichen Spielern vorkommen.
- Noch keine verdeckten Marktwert-, Gehalts- oder Entwicklungsboni einführen. Zunächst die Matchwirkung unabhängig nachweisen; spätere Wirtschafts- und Entwicklungsregeln gesondert festlegen.
- Die Einführung gilt für neue, eindeutig gekennzeichnete Vereinswelten. Bestehende Karrieren behalten ihre bisherige Entscheidungslogik; keine mentalen Werte für Altspieler ergänzen, keine historischen Partien oder Statistiken rekonstruieren. Dafür ausschließlich eine Versions-/Funktionskennung an der Welt verwenden, keine parallele Altstand-Migration.
- Effektive mentale Werte an einer zentralen Stelle berechnen. Form und Frische dürfen nur einmal berücksichtigt werden. Kein pauschaler Gesamtstärkebonus und keine neue Zufallsziehung beim Zeichnen, Kamerwechsel oder Prüfen einer Option.
- Physische eigene Partien und kompakte Parallelspiele benötigen nachvollziehbare entsprechende Wirkungen, aber keine identischen Szenen. Vor Freigabe beide Pfade prüfen. Temporäre Wahrnehmungs- und Vorbereitungshilfen bleiben flüchtig; reine Spielerwerte bleiben gespeichert.
- Schwerpunktmodule: Welt-Spielererzeugung, `strength-v55.js`, `world-match-v64.js`, `pitch-v55.js`, Abprallerkontakt in `set-pieces-v50.js` und bestehende Aktionsvorbereitung in `pitch-motion-v102.js`. Renderer erhält die bereits gewählte Aktion, keine eigene Entscheidung.

## Umsetzung in Blöcken

1. Physische Gelegenheit und Entscheidung getrennt messbar machen; Keeperposition und freie Abpraller in die Direktoptionen aufnehmen. Noch mit vorhandenen Fähigkeiten. Gleiche Szene bei beiden Angriffsrichtungen prüfen.
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

Der Entwurf empfiehlt drei neue Fähigkeiten. Die genaue Profilverteilung, neutrale Referenz, zulässige Einflussstärke und spätere Entwicklung werden anhand der isolierten Vergleichsszenen festgelegt. Eine Einführung in bestehende Karrieren ist nicht vorgesehen.

# Fables Vorschläge nach der Prüfreihe

Aktueller Nutzerauftrag „Führe die Vorschläge aus“: Die Kandidaten sind isoliert gemessen, Torbasis0,32/Deckel0,48 und Heimfaktor1,03 für neue kompakte Partien gewählt und lokal gebaut. Die Schussdiagnose ist ausgeführt; Kaderabstufung und Pokalgrenze bleiben erhalten. [Umsetzung und Nachweise](kompakte-matchabstimmung-v178.md). Die folgenden Kandidaten beschreiben die vorherige Vorschlagsphase.

Nutzerauftrag vom 12. Oktober 2026: Die erste Analyse testen, Fable erneut auswerten lassen und Vorschläge ausarbeiten. Claude Fable 5.1 hat Messung und Code gelesen; die Abschlussfassung wurde auf korrekte Baselines, Rechenwerte und die bestehenden Produktregeln geprüft. [Messreihe](startkader-fable-pruefreihe.md), [Fables vollständige Abschlussanalyse](../outputs/strength-followup/fable-analysis.md).

## Bewertung

Die niedrige Torquote erscheint auch zwischen ähnlich starken Gegnern: Top–Top 1,35 und Schwach–Schwach 1,03 Tore pro Spiel. Zugleich bleiben die Schüsse in allen Serien im beschlossenen Korridor von 10–16. Damit ist Torverwertung der naheliegende nächste Abstimmungsbereich; Abschluss- und Torwartanteile sind durch die Gruppendaten noch nicht kausal getrennt.

Der Heimbonus wird im v64-Minutenmodell berechnet, vom aktuellen v155-Aktionszweig aber nicht übernommen. 100 Heim-/Neutralpaare mit identischen Seeds, IDs und Seitenzuordnungen liefern gleiche Ergebnisse und erfasste Verlaufshashes. Der Hash umfasst ausdrücklich Ergebnis, Ereignisse, Statistiken, Frische, Minuten, Taktiken und Wechsel, Performance und Rollen; keine behauptete Prüfung aller JSON-Felder. Taktik und Fähigkeiten wirken weiterhin über die vorhandenen Aktions-/Positions-/Belastungswege.

Die Ligaüberschneidung zeigt beidseitige Siege: A-Ligen Rang 3/4 gewinnen 73, AUT/SUI/TUR-Top 2 gewinnen 94 der 300 Spiele; 133 Remis. Dafür ist kein 50:50-Vertrag beschlossen. Die stärksten Pokalvereine gewinnen 17 Prozent gegen die schwächsten Ligavereine. Fable zieht seine frühere Empfehlung zurück, den Pokaldeckel anzuheben. Dieser Befund belegt offene Einzelspiele in dieser Auswahl, keine allgemeine Vorhersage sämtlicher Pokalrunden.

## Ausarbeitbare Vorschläge

### 1. Verwertung isoliert abstimmen

In `v155CompactActions` zunächst ausschließlich die Basis der bedingten Torwahrscheinlichkeit von 0,27 auf **0,30 oder 0,32** variieren. Beide Kandidaten getrennt prüfen; Schussentstehung, Zielgenauigkeit, Qualitätsslope und Deckel 0,48 zunächst erhalten. Ein separater dritter Kandidat kann ausschließlich den Deckel auf 0,52 setzen, bei unveränderter Basis 0,27. So bleibt erkennbar, welcher Eingriff wirkt.

Vergleichen: Tore/Spiel, 0:0, Remis, Schussverwertung je Gruppe, Top-/Außenseitersiege, Schüsse/Spiel. Die bestehende Top–Unten-Referenz beträgt 49,8 Prozent Topsiege, keine beschlossene Zielquote. Ein Qualitätsvorsprung soll weiter erkennbar bleiben; keine künstliche Garantie bestimmter Ergebnisse. Auflagen: 10–16 Schüsse im Serienmittel, exakte Replays, gültige Speicherung, native Noten-/Belastungs-/Entwicklungskette sowie unveränderte Startkadergrenzen.

Die erwartbare Größenordnung ist begrenzt: 12 Schüsse × 45 Prozent aufs Tor × fünf Prozentpunkte zusätzlicher bedingter Verwertung ergeben ungefähr **0,27 Zusatztore**, nicht 0,5. Reale Verläufe ändern sich zusätzlich durch Tore, KI-Reaktionen und Zufallsentscheidungen. Ein Bereich von 1,5–2,2 Toren ist höchstens eine unbeschlossene Orientierung, keine zugesicherte Folge oder Abnahmebedingung.

### 2. Kleinen Heimfaktor im verwendeten Aktionsweg anbinden

Getrennt von der Verwertungsänderung einen Heim-/Neutralfaktor direkt an einer tatsächlich verwendeten Pass- oder Schusschance des v155-Zweigs prüfen. Kandidaten: **+2 oder +3 Prozent relativ**, ausschließlich zuhause, Faktor 1 auf neutralem Platz. Den kompletten alten `chance`-Wert nicht übernehmen: Dadurch würden Qualitätsunterschiede und sonstige Effekte möglicherweise doppelt gezählt.

Abnahme: gezielter Nachweis der Home-/Neutral-Verzweigung, deterministische Replays und größere gespiegelte Stichprobe mit mindestens 500 Kontrollpaaren. Mittlere Heim-/Auswärtstore und Sieganteile vergleichen; kein Zwang, dass jedes Kontrollpaar einen anderen Spielstand liefert. Schusskorridor und Gruppenverwertung mitprüfen. Effektgröße bleibt ein Kandidat, kein beschlossenes Produktziel.

### 3. Kaderabstufung und Pokalgrenze beibehalten

Die Messung verlangt keine sofortige Aufwertung von A-Rang 3/4 oder Pokalvereinen. Zuerst Matchabstimmung vergleichen. Die strikte Top-2-Startregel, ±2,5-Prozent-Variation, seltene Elite-Spieler und mindestens zehn Prozent Pokalabstand bleiben bestehen. Die Pokalgrenze bezieht sich auf Startqualität, nicht auf eine Pflicht-Niederlagenquote. Außenseitersiege bleiben möglich.

### 4. Schussqualität erst bei weiterem Bedarf untersuchen

`shotDifficulty` berücksichtigt bereits Distanz, Winkel und Druck. Eine angebliche Gleichförmigkeit wurde nicht gemessen. Als nachrangige Diagnose Verteilungen je Schuss und Gruppe erfassen; erst bei einem konkreten Befund ein Positions-/Schwierigkeitsmodell ändern. Diese Zusatzmessung gehört zum Vorschlag und wurde in der aktuellen Prüfreihe noch nicht ausgeführt.

## Umsetzung und Grenzen

Die gewählte Umsetzung markiert neue Partien ausdrücklich und speichert ihre Balancewerte; vorhandene laufende Partien werden mit ihren gespeicherten Regeln fortgesetzt. Keine Spielerregeneration, nachträgliche Ergebnisberechnung oder Umkennzeichnung vorhandener Partien; genaue Spielerfähigkeiten bleiben unsichtbar. Die oben beschriebenen übrigen Kandidaten werden nicht zusätzlich aktiviert.

Die fünf gemeinsam verwendeten Startwelten und nur 100 Spiele je Referenzserie begründen Richtungsbefunde, keine behauptete statistische Signifikanz. Die Prüfung betrifft ausschließlich die kompakte Weltpartien-Engine; die physische 2D/3D-Simulation braucht eigene Nachweise.

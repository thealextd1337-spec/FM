# Jugendstatus und Länderrahmen: Vergleich über 20 Saisons

**Historische Quelle — inaktiv.** Einordnung vom 13. Oktober 2026: Der folgende Text dokumentiert den damaligen Auftrag, Entwurf oder Prüfstand. Alte Startprompts, Modellzuweisungen, Worktreepfade und Folgevorschläge starten keine weitere Arbeit. Aktueller Umfang und Implementierungsstand stehen in [Entscheidungen](entscheidungen.md), [Produktregeln](product.md) und [Release 131](release-131.md). Fachliche Präferenzen, nicht verworfene Ideen und historische Messwerte bleiben als Referenz erhalten.

Drei Varianten mit denselben drei Seeds **youth20-a/b/c** und jeweils 20 nativen Saisons. 118.920 neue Partien plus 59.460 bereits ausgewertete Karriereend-Partien: insgesamt **178.380**. 95 KI-Ligavereine pro Welt; AUT-5 folgt in allen Läufen derselben minimalen Managerpolitik und ist aus Vereinsmittelwerten ausgeschlossen. Kein Produktcode, reale Spielstände oder Live-Seite geändert.

**Ergebnis:** Das Förderpaket verbessert die Standardstartformation gegenüber Karriereenden allein um 0,78 Prozentpunkte und kostet in S20 427 Credits mehr je Verein. Der zusätzliche Länderrahmen bringt weitere 1,56 Prozentpunkte. Die bisherigen Vorschläge funktionieren grundsätzlich, die Qualitätswirkung der sportlichen Legacy bleibt aber sehr klein.

## Ergebnis nach Saison 20

| Kennzahl | Karriereenden | + Jugendstatus | + Länderrahmen |
| --- | ---: | ---: | ---: |
| Stärke Standardstartformation gegenüber Anfang | +3,4 % | +4,2 % | +5,7 % |
| Kaderstärke vor Karriereenden gegenüber Anfang | +4,0 % | +5,3 % | +6,7 % |
| Kaderstärke nach Karriereenden gegenüber Anfang | +4,0 % | +5,4 % | +6,9 % |
| Spieler zu Saisonbeginn / Verein | 11,76 | 11,69 | 11,66 |
| Spieler nach Abschluss / Verein | 10,58 | 10,55 | 10,58 |
| Durchschnittsalter nach Abschluss | 24,2 | 24,2 | 24,2 |
| Jahresausgaben / Verein, Credits | 2.465 | 2.892 | 2.929 |
| Davon Förderung / Verein | 591 | 979 | 1.011 |
| Jahreseinnahmen / Verein | 3.499 | 3.507 | 3.489 |
| Guthaben nach Abschluss / Verein | 22.361 | 15.984 | 15.679 |
| Jugendanteil am Kader nach Abschluss | 90,3 % | 89,8 % | 89,7 % |
| Jugendanteil an echten Spielminuten aller Wettbewerbe | 85,0 % | 84,3 % | 84,0 % |
| Neue Kandidaten insgesamt pro Welt in 20 Saisons | 9.876 | 8.612 | 8.616 |
| Übernahmen insgesamt pro Welt in 20 Saisons | 2.008 | 1.982 | 1.984 |
| A-Länder gegenüber D-Ländern, mittlere Kaderstärke | -4,5 % | -0,9 % | +2,3 % |

Die Startformation wird unmittelbar vor den Karriereenden mit der gleichen Standardformation gemessen. Das ist kein Mittel der tatsächlich taktisch gewählten Aufstellungen. Der volle Kader wird zusätzlich vor und nach den Abgängen gemessen: Ausscheiden schwacher älterer Spieler kann den Kaderdurchschnitt erhöhen, ohne den Wettbewerbskader entsprechend zu verbessern. Die Jugend-Minutenquote umfasst auch reine Pokalvereine; sie ist keine ausschließlich auf die Liga bezogene Quote.

## Getrennte Effekte und Zufallsstreuung

| Vergleich | Startformation: Differenz in Prozentpunkten | Kader: Differenz in Prozentpunkten | Zusätzliche Jahresausgaben S20 / Verein | Jahrgangsqualität S20 relativ zur vorherigen Variante |
| --- | ---: | ---: | ---: | ---: |
| Förderpaket gegenüber Karriereenden | 0,78 | 1,39 | 427 | -0,1 % |
| Länderrahmen zusätzlich zum Förderpaket | 1,56 | 1,46 | 37 | +1,1 % |

Das Förderpaket verändert **gemeinsam** vier Budgetstufen, die Kandidatenmenge, den dynamischen Status und die Startqualität. Seine Differenz isoliert daher nicht die reine Statuswirkung. Der zweite Vergleich isoliert den zusätzlichen Länderrahmen, weil die übrigen Parameter gleich bleiben.

| Seed | Förderpaket: Startformations-Differenz | Länderrahmen: zusätzliche Startformations-Differenz |
| --- | ---: | ---: |
| youth20-a | 0,53 Prozentpunkte | 1,59 Prozentpunkte |
| youth20-b | 0,28 Prozentpunkte | 1,17 Prozentpunkte |
| youth20-c | 1,54 Prozentpunkte | 1,93 Prozentpunkte |

### Stabilität in den letzten fünf Saisons

Mittel aus S16–20, um den einzelnen Schlussjahrgang zu ergänzen.

| Variante | Startformation gegenüber Anfang | Kader gegenüber Anfang | Jahresausgaben / Verein | A gegenüber D |
| --- | ---: | ---: | ---: | ---: |
| Karriereenden | +3,4 % | +3,9 % | 2.488 | -3,5 % |
| + Jugendstatus | +4,3 % | +5,4 % | 2.898 | -1,3 % |
| + Länderrahmen | +5,4 % | +6,6 % | 2.950 | +1,1 % |

### Verbleib der Anfangsspieler

| Variante / Seed | Ursprüngliche Erwachsene noch aktiv | Damals übernommene Jugendliche noch aktiv | Höchstes aktives Alter | Negative Guthaben in Vereinsjahren |
| --- | ---: | ---: | ---: | ---: |
| Karriereenden / youth20-a | 0 | 2 | 36 | 0 |
| Karriereenden / youth20-b | 0 | 1 | 36 | 0 |
| Karriereenden / youth20-c | 0 | 1 | 36 | 0 |
| + Jugendstatus / youth20-a | 0 | 2 | 36 | 0 |
| + Jugendstatus / youth20-b | 0 | 1 | 36 | 0 |
| + Jugendstatus / youth20-c | 0 | 1 | 36 | 0 |
| + Länderrahmen / youth20-a | 0 | 3 | 36 | 0 |
| + Länderrahmen / youth20-b | 0 | 1 | 36 | 0 |
| + Länderrahmen / youth20-c | 0 | 1 | 36 | 0 |

Alle ursprünglichen erwachsenen Spieler sind in allen neun Läufen ausgeschieden. Wenige bereits beim Start übernommene 17-Jährige bleiben mit 36 aktiv. Die Staffel garantiert das Ausscheiden bis 39, keinen pauschalen Stichtag nach 20 Saisons für jede Anfangsaltersgruppe.

Drei Seeds sind ein Balancetest mit sichtbarer Streuung, kein präziser Nachweis für jede Karriere. Ergebnisse beziehen sich auf die native kompakte Spielsimulation; daraus folgt keine neue Abnahme von WebGL, mobilen Oberflächen oder physischen Echtzeitpartien.

## Bewertung und nächste Anpassung

- Vier Förderbeträge, Karriereendstaffel und die getestete Statusgeschwindigkeit beibehalten. Das Paket erneuert die Kader ausreichend; zusätzliche Kandidaten allein sind nicht erforderlich.
- **Qualität stufenlos aus dem internen Status ableiten**, während außen weiterhin fünf Farben und der Trendpfeil stehen. Die nominellen 35 % Sport wirken hier in nur rund 5 % der Vereinsjahre auf die Jahrgangsqualität; die kandidatengewichtete direkte Wirkung beträgt nur ungefähr 0,1 %.
- Die Qualitätsverteilungen neu kalibrieren: Der mittlere neue S20-Jahrgang ist mit Status allein noch nicht stärker als in der Karriereend-Basis, obwohl mehr bezahlt wird. Als ungetesteter nächster Kandidat können die fünf Statusmitten −12/−6/0/+6/+12 % gegenüber der normalen Jugendbasis liefern, mit stufenloser Verbindung. Das ersetzt die getesteten −6/−3/0/+3/+6 %, ohne zweiten Qualitätsbonus.
- **Positionen von der festen Slotnummer lösen**: insbesondere Nullförderung muss Stürmer liefern können und 1.500 darf den Zusatzplatz nicht immer für die Abwehr verwenden.
- Den Länderrahmen behalten, aber weiter kalibrieren. S20 liegt A 2,3 % vor D, im Mittel S16–20 nur 1,1 %; das gewünschte dauerhafte 3–5-Prozent-Fenster wird noch nicht erreicht. Ein nächster ungetesteter Kandidat wäre A +4 %, B +2 %, C 0 %, D −3 %.
- 1.500 ist finanziell eine echte Priorität: In beobachteten Jahren dieser Stufe verbleiben durchschnittlich nur rund 70–110 Credits zwischen Bruttoeinnahmen und Ausgaben. Die Gruppe ist durch Reserven und Vereinseigenschaften selektiert; daraus folgt keine Kostenwirkung bei identischen Vereinen. Zusätzliche Sichtungskosten sind noch nicht enthalten.
- Bei einer späteren Umsetzung die globale Talentnormalisierung an die geplanten Kandidatenmengen anpassen und die alte KI-Potenziallesung getrennt korrigieren. Dieser Vergleich übernimmt die alten profilbezogenen Wahrscheinlichkeiten; der veränderte Kandidatenmix kann globale Talentanteile verändern.

Diese Folgekandidaten sind Vorschläge, keine bestätigten Produktparameter und keine Änderungen an laufenden Spielständen.

## Alle Jahreswerte

Stärke relativ zum identischen Anfangskader; Kosten als Bruttoausgaben pro KI-Verein. Kandidaten und Übernahmen als Mittel der Weltsummen, einschließlich späterer Übernahmen älterer Pooljahrgänge. Erste Y0-Kandidaten zählen nicht als neu generiert, ihre Übernahmen können enthalten sein. Die jährliche Division von Übernahmen durch Kandidaten ist deshalb keine Jahrgangs-Aufnahmequote.

### Karriereenden

| Saison | Startformation | Kader nach Abschluss | Spieler Beginn / Ende | Ausgaben / Verein | Neu generiert / Welt | Übernommen / Welt |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | +2,1 % | +1,6 % | 11,69 / 10,88 | 1.984 | 286,3 | 65,0 |
| 2 | +3,0 % | +2,8 % | 11,59 / 10,42 | 2.148 | 441,3 | 63,7 |
| 3 | +3,1 % | +3,8 % | 11,43 / 9,94 | 2.316 | 502,3 | 91,3 |
| 4 | +4,0 % | +3,9 % | 11,34 / 10,35 | 2.471 | 504,3 | 125,0 |
| 5 | +3,8 % | +4,5 % | 11,44 / 10,04 | 2.488 | 505,3 | 98,3 |
| 6 | +4,7 % | +4,3 % | 11,45 / 10,38 | 2.604 | 507,0 | 125,0 |
| 7 | +4,2 % | +4,8 % | 11,56 / 10,15 | 2.568 | 509,0 | 104,7 |
| 8 | +4,9 % | +4,4 % | 11,51 / 10,54 | 2.542 | 505,0 | 118,7 |
| 9 | +3,9 % | +4,3 % | 11,68 / 10,29 | 2.615 | 509,0 | 99,7 |
| 10 | +4,2 % | +4,1 % | 11,72 / 10,57 | 2.615 | 510,3 | 125,0 |
| 11 | +3,1 % | +3,7 % | 11,71 / 10,49 | 2.590 | 510,7 | 99,0 |
| 12 | +3,6 % | +3,9 % | 11,75 / 10,60 | 2.594 | 508,3 | 106,0 |
| 13 | +3,6 % | +4,1 % | 11,79 / 10,59 | 2.565 | 509,0 | 102,3 |
| 14 | +4,0 % | +4,0 % | 11,74 / 10,62 | 2.495 | 507,3 | 96,7 |
| 15 | +3,6 % | +4,2 % | 11,79 / 10,60 | 2.530 | 509,7 | 98,0 |
| 16 | +3,4 % | +3,9 % | 11,80 / 10,77 | 2.498 | 510,0 | 103,3 |
| 17 | +3,2 % | +3,7 % | 11,81 / 10,58 | 2.492 | 511,7 | 89,0 |
| 18 | +3,5 % | +4,0 % | 11,81 / 10,60 | 2.504 | 509,3 | 101,0 |
| 19 | +3,5 % | +4,1 % | 11,81 / 10,63 | 2.483 | 509,0 | 99,7 |
| 20 | +3,4 % | +4,0 % | 11,76 / 10,58 | 2.465 | 510,7 | 96,3 |

### + Jugendstatus

| Saison | Startformation | Kader nach Abschluss | Spieler Beginn / Ende | Ausgaben / Verein | Neu generiert / Welt | Übernommen / Welt |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | +2,1 % | +1,6 % | 11,69 / 10,88 | 1.984 | 286,3 | 65,0 |
| 2 | +2,8 % | +2,6 % | 11,56 / 10,41 | 2.173 | 291,7 | 60,0 |
| 3 | +3,0 % | +3,7 % | 11,38 / 9,89 | 2.486 | 360,0 | 86,7 |
| 4 | +3,8 % | +3,9 % | 11,20 / 10,25 | 2.658 | 404,0 | 117,7 |
| 5 | +3,4 % | +4,4 % | 11,40 / 9,99 | 2.869 | 421,7 | 102,3 |
| 6 | +4,3 % | +4,2 % | 11,40 / 10,35 | 2.946 | 440,0 | 125,0 |
| 7 | +4,0 % | +4,7 % | 11,50 / 10,06 | 2.950 | 448,0 | 102,0 |
| 8 | +4,7 % | +4,4 % | 11,45 / 10,47 | 2.940 | 450,3 | 118,3 |
| 9 | +4,2 % | +4,5 % | 11,65 / 10,31 | 2.974 | 452,0 | 102,3 |
| 10 | +4,3 % | +4,6 % | 11,62 / 10,45 | 2.988 | 452,7 | 114,7 |
| 11 | +3,9 % | +4,4 % | 11,70 / 10,55 | 2.960 | 455,0 | 106,3 |
| 12 | +4,6 % | +4,9 % | 11,76 / 10,66 | 2.953 | 457,3 | 103,0 |
| 13 | +4,3 % | +5,0 % | 11,79 / 10,61 | 2.977 | 459,7 | 95,0 |
| 14 | +4,1 % | +4,9 % | 11,75 / 10,62 | 2.902 | 461,7 | 95,7 |
| 15 | +4,1 % | +5,2 % | 11,85 / 10,63 | 2.926 | 463,0 | 104,7 |
| 16 | +3,8 % | +5,0 % | 11,84 / 10,70 | 2.890 | 461,3 | 102,7 |
| 17 | +4,1 % | +5,3 % | 11,76 / 10,56 | 2.869 | 462,0 | 87,0 |
| 18 | +4,6 % | +5,4 % | 11,78 / 10,62 | 2.914 | 463,3 | 101,3 |
| 19 | +4,7 % | +5,7 % | 11,73 / 10,55 | 2.927 | 461,7 | 92,7 |
| 20 | +4,2 % | +5,4 % | 11,69 / 10,55 | 2.892 | 460,7 | 99,7 |

### + Länderrahmen

| Saison | Startformation | Kader nach Abschluss | Spieler Beginn / Ende | Ausgaben / Verein | Neu generiert / Welt | Übernommen / Welt |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | +2,1 % | +1,6 % | 11,69 / 10,88 | 1.984 | 286,3 | 65,0 |
| 2 | +3,0 % | +2,8 % | 11,56 / 10,39 | 2.190 | 291,7 | 59,7 |
| 3 | +3,1 % | +3,9 % | 11,35 / 9,88 | 2.462 | 361,0 | 87,0 |
| 4 | +4,3 % | +4,2 % | 11,24 / 10,32 | 2.661 | 400,7 | 121,7 |
| 5 | +3,9 % | +4,8 % | 11,44 / 9,97 | 2.858 | 420,0 | 99,3 |
| 6 | +4,8 % | +4,7 % | 11,44 / 10,36 | 3.018 | 434,7 | 131,7 |
| 7 | +4,4 % | +5,1 % | 11,58 / 10,13 | 2.978 | 446,3 | 108,0 |
| 8 | +4,7 % | +5,0 % | 11,44 / 10,44 | 2.925 | 451,0 | 112,0 |
| 9 | +3,9 % | +4,8 % | 11,62 / 10,20 | 2.997 | 451,0 | 102,7 |
| 10 | +4,5 % | +4,8 % | 11,59 / 10,49 | 2.985 | 455,7 | 119,3 |
| 11 | +4,1 % | +4,6 % | 11,65 / 10,55 | 2.931 | 454,0 | 98,7 |
| 12 | +4,7 % | +5,0 % | 11,83 / 10,73 | 2.968 | 458,7 | 109,7 |
| 13 | +4,2 % | +5,3 % | 11,83 / 10,65 | 2.969 | 458,3 | 92,7 |
| 14 | +4,9 % | +5,2 % | 11,87 / 10,76 | 2.937 | 462,0 | 107,3 |
| 15 | +4,6 % | +5,9 % | 11,91 / 10,66 | 2.876 | 463,7 | 95,3 |
| 16 | +5,0 % | +6,1 % | 11,79 / 10,78 | 2.930 | 464,0 | 96,3 |
| 17 | +4,9 % | +6,4 % | 11,84 / 10,55 | 2.949 | 463,3 | 89,7 |
| 18 | +5,6 % | +6,6 % | 11,76 / 10,58 | 2.964 | 464,7 | 102,7 |
| 19 | +5,7 % | +7,0 % | 11,73 / 10,57 | 2.978 | 463,7 | 97,7 |
| 20 | +5,7 % | +6,9 % | 11,66 / 10,58 | 2.929 | 465,0 | 88,0 |

## Länder nach 20 Saisons

Jede Landesentwicklung ist relativ zum eigenen Startkader. Sie sagt allein noch nicht, welches Land absolut stärker ist. Der direkte A/D-Abstand oben vergleicht die durchschnittliche absolute Kaderqualität derselben Phase.

| Land | Karriereenden | + Jugendstatus | + Länderrahmen |
| --- | ---: | ---: | ---: |
| England | -2,7 % | +0,7 % | +1,2 % |
| Spanien | +0,4 % | +2,1 % | +7,7 % |
| Deutschland | 0,0 % | +3,7 % | +6,3 % |
| Italien | -5,1 % | -0,5 % | +2,6 % |
| Frankreich | +5,1 % | +7,7 % | +11,1 % |
| Portugal | +4,5 % | +5,1 % | +5,9 % |
| Niederlande | +5,1 % | +6,6 % | +6,3 % |
| Österreich | +4,0 % | +5,8 % | +6,0 % |
| Belgien | +13,0 % | +10,3 % | +12,0 % |
| Türkei | +6,5 % | +6,9 % | +7,1 % |
| Schweiz | +10,7 % | +12,3 % | +10,1 % |
| Griechenland | +8,5 % | +5,9 % | +7,4 % |

## Förderstufen und gewachsener Status

Die folgenden beobachteten Gruppen sind **kein kausaler Budgetvergleich**: Vereinsprofile, Reserven, Erfolge und Historien unterscheiden sich. Die Stufe beschreibt das jeweilige bezahlte Budget; die Menge hängt von der dreijährigen Glättung ab. Vereinsjahre umfassen S2–20, die sichtbare Statusbewertung den Abschluss von S20.

| Variante / Budget | Vereinsjahre | Kandidaten / Jahr | Übernahmen / Jahr | Ausgaben / Jahr | Status nach S20 (Gruppenmittel) |
| --- | ---: | ---: | ---: | ---: | --- |
| Status / 0 | 46 | 2,35 | 0,33 | 2.418 | – (0 Vereine in drei Welten) |
| Status / 500 | 1.582 | 3,45 | 0,88 | 2.378 | Normal (68 Vereine in drei Welten) |
| Status / 1.000 | 2.937 | 4,91 | 1,12 | 2.937 | Gut (161 Vereine in drei Welten) |
| Status / 1.500 | 850 | 5,88 | 1,25 | 3.466 | Sehr gut (56 Vereine in drei Welten) |
| Status + Land / 0 | 43 | 2,49 | 0,37 | 2.192 | – (0 Vereine in drei Welten) |
| Status + Land / 500 | 1.548 | 3,45 | 0,93 | 2.369 | Normal (58 Vereine in drei Welten) |
| Status + Land / 1.000 | 2.988 | 4,90 | 1,10 | 2.979 | Gut (163 Vereine in drei Welten) |
| Status + Land / 1.500 | 836 | 5,86 | 1,23 | 3.435 | Sehr gut (64 Vereine in drei Welten) |

Die KI zahlt 0 hier nur vorübergehend wegen fehlender Reserven; am Ende verwendet keiner der 95 KI-Vereine je Welt dauerhaft die Nullstufe. Dauerhafte Nullförderung wird deshalb nur durch die getrennten Status- und Generierungsrechner geprüft, nicht durch eine eigene 20-jährige Pflichtspielkarriere.

## Positionsmix: ein weiterer Generierungsbefund

60 getrennte Jahrgänge je konstant geglätteter Förderstufe mit derselben nativen Positionsfolge; keine zusätzlichen gespielten Karrieren.

| Stufe | Torhüter | Abwehr | Mittelfeld | Angriff |
| --- | ---: | ---: | ---: | ---: |
| 0 | 20 | 40 | 35 | 0 |
| 500 | 20 | 40 | 95 | 60 |
| 1.000 | 20 | 100 | 120 | 60 |
| 1.500 | 20 | 160 | 120 | 60 |

Die bisherige Slotfolge koppelt Position und Kandidatenmenge: Bei dauerhaft 0 werden **keine Stürmer** erzeugt. Ab 500 gibt es immer einen Stürmer pro Jahr und unabhängig von der Förderung einen Torhüter je drei Jahre. Der sechste Kandidat bei 1.500 ist immer ein Verteidiger. Damit erhöht höhere Förderung die Auswahl nicht für jede Position. Für die Umsetzung sollten Jahr/Seed die Positionen variieren und jede Förderstufe grundsätzlich alle Positionen hervorbringen können.

## Direkte Wirkung der sportlichen Legacy

Kontrollrechnung auf den aufgezeichneten Förderverläufen: tatsächlicher Sportwert gegenüber konstant erwartungsgemäßem Erfolg. Budgets, Kandidatenmengen und Saisonverläufe bleiben für diese Rechnung fest; sie simuliert keine neuen Spielergebnisse oder Finanzrückwirkungen. Geprüft wird, ob der Sportanteil allein die Qualitätsfarbe vor der Erzeugung verändert.

| Variante | Vereinsjahre mit anderem Qualitätsfaktor | Anteil an S2–20 | Kandidatengewichtete direkte Qualitätswirkung | Unterschiedliche Statusfarben nach S20 |
| --- | ---: | ---: | ---: | ---: |
| + Jugendstatus | 284 / 5415 | 5,24 % | +0,1 % | 10 / 285 |
| + Länderrahmen | 299 / 5415 | 5,52 % | +0,1 % | 4 / 285 |

Kleine Statusänderungen innerhalb derselben Farbe verändern in diesem Versuch den Qualitätsfaktor nicht. Diese Quantisierung kann die sportliche Legacy trotz ihres nominellen 35-Prozent-Gewichts abschwächen. Eine stufenlose interne Qualitätswirkung bei weiterhin fünf sichtbaren Farben ist ein möglicher nächster Test.

Die Farbe eines Gruppenmittels ist nur eine Übersicht. Die tatsächlichen fünf Farbverteilungen je Budget sind in summary.json gespeichert; ein Durchschnitt ersetzt keine einzelne Vereinsbewertung. Interne Statuspunkte und einzelne Spielerwerte werden nicht als Produktwerte gezeigt.

## Entwicklung über Profieinsätze

| Variante | Beobachtete Spieler bis Alter 24 | Mittlere relative Fähigkeitsentwicklung seit Erzeugung | Tatsächliche Minuten bis Alter 24 |
| --- | ---: | ---: | ---: |
| Karriereenden | 3.509 | +16,2 % | 5.052 |
| + Jugendstatus | 3.405 | +16,6 % | 5.173 |
| + Länderrahmen | 3.432 | +16,5 % | 5.188 |

Nur ab S2 erzeugte und tatsächlich bis zum Eintritt in Alter 24 beobachtete Jugendliche mit Alters-/Entwicklungsledger; ausgeschiedene Kandidaten ohne diesen Messpunkt fehlen. Daher Überlebenden-Auswahl, kein Durchschnitt aller generierten Jugendlichen. Poolaufenthalt allein entwickelt weiterhin keine Fähigkeiten. Die Entwicklung erfolgt über reale bewertete Einsätze.

## Exakte Testparameter und Grenzen

- **Karriereenden:** Alter 33: 40 %, danach jährlich +10 Prozentpunkte; einmal deterministisch in der Mitte des 224-Tage-Kalenders, Ausführung zum Saisonabschluss. Gleiche Regel und Zufallskennungen in allen drei Varianten.
- **Identischer Start:** Native Konstruktion einschließlich Startkader, Y0-Pools, ursprünglicher erster KI-Finanzierung und automatischer Übernahmen bleibt unverändert. Auch neu entdeckte Jugendliche des betreuten Vereins werden in S1 unverändert erzeugt. Der Jugendstatus wird erstmals nach S1 aktualisiert; neue vierstufige KI-Förderung und Jugendqualität greifen ab S2. Neue Pokalersatzspieler im Abschluss gehören bereits zum Folgejahr.
- **Budgets:** Nur 0/500/1.000/1.500 bei KI-Ligavereinen ab S2. Gewünschte Stufe nach altem Jugendprofil 1–5: 0/500/1.000/1.000/1.500. Volle Vertragsgehälter plus 450 Reserve sichern; höchstens 22 % des verbleibenden Guthabens verwenden. Größte gedeckte Stufe bis zur gewünschten Höhe wählen. Der betreute Kontrollverein behält seine ursprüngliche höchstens 200-Credits-Politik.
- **Mengen:** Bei stabil bezahltem Budget Mittelwerte 1,5/3,5/5/6 neue Kandidaten; maximal sechs. Menge wird anhand geglätteter Förderung interpoliert und mit derselben ID-basierten Zufallsziehung auf ganze Spieler gebracht.
- **Status:** Startwerte nach bisherigen Jugendprofilen 10/30/50/70/90; 65 % Förderziel plus 35 % sportlicher Erfolg. Förderziele für die vier Budgets 0/45/75/100, Budgethistorie 45/35/20 %. Annäherung an bessere Ziele jährlich 15 % des Abstands, an schlechtere 5 %.
- **Sport:** Vor Pflichtspielbeginn nach Transferabschluss Rang-Erwartung anhand nativer Kaderqualität einfrieren. Basis 50; tatsächliche Rangabweichung bis ±25. Weitere maximal 25: Meistertitel 5, nationaler Pokal bis 5, Crown bis 15 beziehungsweise Horizon bis 10. Je Pokal nur höchste erreichte Stufe: Teilnahme 5 %, R16 15 %, QF 30 %, SF 50 %, Finale 70 %, Titel 100 % des Wettbewerbsbeitrags. Teilnahme setzt ein wirklich gespieltes Ergebnis voraus. Diese konkrete Punktverteilung ist ein Testvorschlag; in diesem Modell ist 25 das niedrigste erreichbare sportliche Jahresergebnis.
- **Jahrgangsqualität:** Normaler nativer Jugend-Qualitätsrahmen als gemeinsame Basis; je Statusfarbe −6/−3/0/+3/+6 % auf die Zielverteilung. Der alte Jugendprofil-Qualitätsrahmen wird ersetzt, nicht nochmals aufaddiert. Kappung und Fähigkeitsobergrenzen bleiben im nativen Generator. Bestehende Spieler werden nicht geändert.
- **Talent:** Alte statische Jugendprofile und deren normalisierte Bevölkerungsgewichte bleiben erhalten. Status verändert hier die Startfähigkeiten, nicht die profilbezogenen Talentziehungen. Andere Kandidatenmengen verändern aber den Profilmix und können damit die tatsächlichen globalen Talentanteile verschieben. Eine erneute globale Normalisierung und dynamische Umgewichtung hoher Talente wäre ein eigener Test und ist nicht enthalten.
- **Länderrahmen:** Feste bestehende Landesgruppen A +3 %, B +1 %, C 0 %, D −2 % beim Erzeugungsland für neue Jugendliche, freie Spieler und neue Pokalersatzspieler. Bei Pokalersatzspielern wird der vorhandene additive Länderanteil entfernt, der Vereinsanteil bleibt; kein doppelter Länderbonus. Jugend- und Länderanteil addieren sich in der Zielverteilung. Nationalität und Transfer verändern bereits erzeugte Fähigkeiten nicht.
- **Auswahl/Entwicklung:** Native KI-Auswahl, Vertrags-/Transferlogik, Einsatzentwicklung, Alterung und Kostenbuchungen unverändert. Insbesondere keine zusätzliche Auswertung geheimer Talente oder Obergrenzen in der KI; die veraltete Potenziallesung bleibt für diesen Paketvergleich unverändert. Keine Akademietrainings-, Vorauswahl-/Scouting- oder UI-Implementierung.

## Prüfnachweise

- Alle sechs neuen Welten vollständig bis S20; 991 native Ergebnisse je Saison; vollständige native Karrierevalidatoren nach S1, S10 und S20.
- Erste 991 Ergebnisse jedes neuen Laufs identisch zur zugehörigen Karriereend-Basis; Anfangs- und erste Saison-Ligakader unverändert.
- Sämtliche 143 eingefrorenen Quellen und die vier Instrumentierungsskripte über Hashes geprüft; während des endgültigen Laufs keine Regeländerung.
- Jahresausgaben in Gehälter, Förderung, Übernahmeentschädigungen und Transfers zerlegt; tatsächliche Transfersummen und Karriereereignisse abgeglichen. Der alte Roh-Beobachter erkennt nicht jede Transferbuchung am Label; die veröffentlichten Transferkosten werden deshalb aus den vollständigen Transferereignissen rekonstruiert und gegen die Gesamtausgaben geprüft. Aufnahmen, Altersentscheidungen und aktive Spielerherkunft geprüft.
- 2.400 reine Jugend-Generierungsfälle: Qualitätsfaktoren, native Talentgleichheit und gültige Fähigkeiten/Obergrenzen; zusätzlich 640 freie-/Pokal-Generierungsfälle mit einmaligem Länderrahmen und unveränderten Talent-, Größen- und Fußziehungen. Kontrollrechner für alle vier Budgetstufen, Unter-/Übererfüllung und 20-jährige Statusverläufe.
- Frühe Vorprüfung mit Startjahres-Abweichung ausschließlich unter ../outputs/youth-comparison-20years-20261011-preflight archiviert; diese Teilläufe sind verworfen und gehen nicht in Ergebnisse ein.

[Interaktive Übersicht](../outputs/youth-comparison-20years-20261011/report.html) · [Alle Jahreswerte als CSV](../outputs/youth-comparison-20years-20261011/annual.csv) · [Länderwerte als CSV](../outputs/youth-comparison-20years-20261011/countries.csv) · [Zusammenfassung](../outputs/youth-comparison-20years-20261011/summary.json) · [Prüfungen](../outputs/youth-comparison-20years-20261011/validation.json) · [Parameter und Hashes](../outputs/youth-comparison-20years-20261011/experiment-manifest.json)

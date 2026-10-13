# Karriereenden, Kader und Nachwuchs über 20 Saisons

**Historische Quelle — inaktiv.** Einordnung vom 13. Oktober 2026: Der folgende Text dokumentiert den damaligen Auftrag, Entwurf oder Prüfstand. Alte Startprompts, Modellzuweisungen, Worktreepfade und Folgevorschläge starten keine weitere Arbeit. Aktueller Umfang und Implementierungsstand stehen in [Entscheidungen](entscheidungen.md), [Produktregeln](product.md) und [Release 131](release-131.md). Fachliche Präferenzen, nicht verworfene Ideen und historische Messwerte bleiben als Referenz erhalten.

Stand: 11. Oktober 2026. Drei native Karrieren mit je 20 vollständig gespielten Saisons und zusammen **59.460 Pflichtspielen**. Isolierte lokale Prüfvariante der vereinbarten Karriereendstaffel; keine Änderung der veröffentlichten Spielregeln oder bestehender Spielstände. Vergleich mit den [drei zuvor geprüften Karrieren ohne Ligaspieler-Karriereenden](jugend-langzeit-auswertung-20261011.md).

## Ergebnis

Die mittlere Kaderqualität der KI-Ligavereine liegt nach 20 Saisons bei **+4,0 %** gegenüber dem Karrierebeginn. Mit den bisherigen Regeln betrug die Änderung **+3,1 %**. Die Standardstartelf vor den Abschieden verändert sich um **+3,4 %**. Nach den Abschieden umfasst ein Ligakader durchschnittlich **10,6 Spieler**, beim Saisonstart nach dem Transferfenster **11,8**. Das mittlere Kaderalter beträgt **24,2 statt 30,4 Jahre**. Die mittleren Jahresausgaben steigen von **1.984** auf **2.465 Credits je Verein**.

Die Mannschaften sind damit im Durchschnitt stärker als beim Karrierebeginn. Gegenüber dem unveränderten Modell ist die Wirkung differenzierter: Der Gesamtkader wächst etwas stärker, die Standardstartelf mit **+3,4 % statt +5,0 %** weniger stark. Die Karriereendstaffel erhöht vor allem Verjüngung, Übernahmen und Nachwuchseinsätze; sie ersetzt keine gezielte Verbesserung der Nachwuchsqualität.

Nach Saison 20 sind in den drei Welten zusammen noch **4 Spieler der bei Karriereerstellung aktiven Kader** aktiv, einschließlich vertragsloser Spieler. Davon stammen **0** aus den ursprünglichen erwachsenen Startkadern und **4** aus den bereits bei Karriereerstellung automatisch übernommenen Jugendspielern. Das gewünschte vollständige Ausscheiden der ersten aktiven Kader nach 20 Saisons ist damit **nicht erreicht**. Die Altersregel garantiert dies allgemein erst mit 39, nicht nach einer festen Zahl von Saisons. Der älteste noch aktive Spieler im Abschlusssnapshot ist **36**.

## Was genau getestet wurde

- Unveränderte eingefrorene Quellen des zuvor ausgewerteten Release-122-Stands. Identische Seeds **youth20-a/b/c**, Wettbewerbe, Spielerentwicklung, Transfers, Finanzen und Nachwuchsgenerierung.
- Nur die Karriereendregel wurde im Prüflauf ersetzt: Alter 33/34/35/36/37/38/39 bedeutet jährlich 40/50/60/70/80/90/100 Prozent. Eine deterministische Entscheidung je Spieler und Saison zur ersten Kalenderfortschaltung nach Saisonmitte; Ausscheiden erst nach allen Saisonspielen und Gehaltszahlungen. Position und Vertrag verändern die Chance nicht.
- Ligaspieler, freie Spieler und reine Pokalspieler verwenden dieselbe Staffel. Reine Pokalvereine behalten ihren bestehenden kostenlosen Ersatzweg. Neue Ersatzspieler werden für das folgende Jahr vorbereitet; sie erhalten keine weitere Karriereendentscheidung für die abgeschlossene Saison.
- Die bestehenden KI-Regeln für Transfers, Notbesetzungen, Förderung und Übernahmen bleiben bestehen. Keine neue Academy-Ausbildung, keine neue Legacy-Qualitätswirkung, keine neuen vier Budgetoptionen und keine Korrektur der bekannten alten KI-Potenziallesung. Diese Änderungen wären weitere getrennte Tests.
- Ausgewertet werden jeweils dieselben **95 KI-Ligavereine**; der betreute Verein AUT-5 wird wie im Vergleichslauf ausgeschlossen. Er bleibt beim selben Verein, fördert mit höchstens 200 finanzierbaren Credits und wird über reguläre Vertrags-/Transferaktionen spielbar gehalten. Alle 192 Vereine spielen tatsächlich; reine Pokalvereine werden bei Karriereend- und Startspielerprüfungen zusätzlich berücksichtigt.
- Stärke ist die mittlere positionsgewichtete Qualität pro Verein, relativ zu denselben Vereinen bei Karrierebeginn. Keine individuellen Fähigkeitswerte werden veröffentlicht. Die Standardstartelf nutzt die native Auswahl in der festen Grundordnung mit fünf Feldspielern und einem Torwart.

## Kader und Nachwuchs je Saison

Stärke und Kadergröße werden **nach** den Karriereenden gemessen; die Startgröße entsteht **nach** dem Transferfenster. Kandidaten/Übernahmen/Abschiede sind mittlere Gesamtzahlen je Welt für die 95 KI-Ligavereine. Startspieler weltweit zählt alle anfangs aktiven Spieler aus 192 Vereinen, die noch in einem Profikader oder auf dem freien Markt sind.

| Saison | Stärke gegenüber Startkader | Spieler Start → Abschluss | Erzeugte Jugend | Übernommen | Karriereenden in Ligakadern | Startspieler weltweit aktiv |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | +1,6 % | 11,7 → 10,9 | 286,3 | 65,0 | 58,3 | 2.061,0 |
| 2 | +2,8 % | 11,6 → 10,4 | 441,3 | 63,7 | 54,7 | 1.938,7 |
| 3 | +3,8 % | 11,4 → 9,9 | 502,3 | 91,3 | 57,0 | 1.809,7 |
| 4 | +3,9 % | 11,3 → 10,3 | 504,3 | 125,0 | 62,7 | 1.672,7 |
| 5 | +4,5 % | 11,4 → 10,0 | 505,3 | 98,3 | 50,3 | 1.520,3 |
| 6 | +4,3 % | 11,5 → 10,4 | 507,0 | 125,0 | 55,0 | 1.352,7 |
| 7 | +4,8 % | 11,6 → 10,1 | 509,0 | 104,7 | 51,7 | 1.188,0 |
| 8 | +4,4 % | 11,5 → 10,5 | 505,0 | 118,7 | 50,3 | 1.057,0 |
| 9 | +4,3 % | 11,7 → 10,3 | 509,0 | 99,7 | 48,3 | 881,3 |
| 10 | +4,1 % | 11,7 → 10,6 | 510,3 | 125,0 | 48,0 | 731,0 |
| 11 | +3,7 % | 11,7 → 10,5 | 510,7 | 99,0 | 36,3 | 595,7 |
| 12 | +3,9 % | 11,8 → 10,6 | 508,3 | 106,0 | 42,7 | 474,3 |
| 13 | +4,1 % | 11,8 → 10,6 | 509,0 | 102,3 | 33,0 | 356,7 |
| 14 | +4,0 % | 11,7 → 10,6 | 507,3 | 96,7 | 39,3 | 245,3 |
| 15 | +4,2 % | 11,8 → 10,6 | 509,7 | 98,0 | 38,7 | 140,7 |
| 16 | +3,9 % | 11,8 → 10,8 | 510,0 | 103,3 | 24,7 | 84,3 |
| 17 | +3,7 % | 11,8 → 10,6 | 511,7 | 89,0 | 35,7 | 35,3 |
| 18 | +4,0 % | 11,8 → 10,6 | 509,3 | 101,0 | 43,7 | 11,7 |
| 19 | +4,1 % | 11,8 → 10,6 | 509,0 | 99,7 | 38,7 | 2,7 |
| 20 | +4,0 % | 11,8 → 10,6 | 510,7 | 96,3 | 40,3 | 1,3 |

In 20 Jahren werden je Welt durchschnittlich **9.876 neue Jugendkandidaten** für diese Vereine erzeugt und **2.008 Jugendliche** in Profikader übernommen. Der Anfangspool Y0 ist bei den jährlichen Neugenerierungen ausgeschlossen; seine Übernahmen sind enthalten. Daher ist Übernahmen geteilt durch neu erzeugte Kandidaten **keine genaue Jahrgangsquote**. Übernahmen können Kandidaten aus früheren Saisons betreffen; die jüngsten Jahrgänge hatten noch nicht dieselbe Auswahlzeit.

Gegenüber den Vergleichswelten steigen die Übernahmen von durchschnittlich **1.483** auf **2.008** je Welt über 20 Saisons. Der Nachwuchsanteil an allen tatsächlichen Pflichtspielminuten beträgt in Saison 20 **85,0 Prozent**, zuvor **68,4 Prozent**. Dabei enthält die Minutenbasis auch Spiele reiner Pokalvereine; sie ist kein reiner Ligaminutenanteil.

Die Karriereenden erhöhen den Bedarf an Ersatzspielern. Die Mindestgröße nach dem Transferfenster beträgt über alle beobachteten Saisons **10**, direkt nach den Abschieden dagegen **6**. Alle Pflichtspiele wurden mit echten Aufstellungen und Spielprotokollen abgeschlossen. Die zeitweiligen Abschlusslücken sind daher von einem Ausfall im Saisonbetrieb zu unterscheiden.

## Kostenverlauf je Saison

Alle Beträge sind **Credits je KI-Ligaverein**, gemittelt über die drei Welten. Ausgaben sind brutto; Einnahmen werden separat ausgewiesen. Gehälter enthalten tatsächlich gebuchte Gehaltszahlungen, auch anteilige Abrechnungen bei unterjährigen Wechseln. Ausbildungsentschädigungen stehen zusätzlich zum Förderbudget. Ablösen werden aus den tatsächlich vollzogenen Transfers ermittelt. Verbleibende Belastungen stehen unter Sonstiges. Kasse ist der Bestand nach Saisonabschluss.

| Saison | Gehälter | Förderung | Jugendübernahmen | Ablösen | Sonstiges | Gesamtausgaben | Einnahmen | Kasse |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 1.450 | 444 | 51 | 39 | 0 | 1.984 | 3.227 | 3.147 |
| 2 | 1.430 | 538 | 48 | 132 | 0 | 2.148 | 3.303 | 4.302 |
| 3 | 1.443 | 572 | 63 | 238 | 0 | 2.316 | 3.422 | 5.409 |
| 4 | 1.525 | 582 | 82 | 282 | 0 | 2.471 | 3.463 | 6.401 |
| 5 | 1.545 | 581 | 66 | 296 | 0 | 2.488 | 3.464 | 7.376 |
| 6 | 1.558 | 584 | 86 | 375 | 0 | 2.604 | 3.547 | 8.320 |
| 7 | 1.558 | 584 | 69 | 356 | 0 | 2.568 | 3.537 | 9.289 |
| 8 | 1.556 | 583 | 77 | 326 | 0 | 2.542 | 3.502 | 10.250 |
| 9 | 1.556 | 587 | 64 | 407 | 0 | 2.615 | 3.588 | 11.223 |
| 10 | 1.543 | 589 | 82 | 401 | 0 | 2.615 | 3.580 | 12.188 |
| 11 | 1.529 | 586 | 67 | 407 | 0 | 2.590 | 3.582 | 13.181 |
| 12 | 1.519 | 588 | 71 | 417 | 0 | 2.594 | 3.593 | 14.180 |
| 13 | 1.508 | 589 | 70 | 398 | 0 | 2.565 | 3.575 | 15.190 |
| 14 | 1.513 | 590 | 64 | 327 | 0 | 2.495 | 3.512 | 16.207 |
| 15 | 1.504 | 589 | 68 | 369 | 0 | 2.530 | 3.536 | 17.214 |
| 16 | 1.496 | 589 | 71 | 341 | 0 | 2.498 | 3.518 | 18.234 |
| 17 | 1.487 | 591 | 60 | 353 | 0 | 2.492 | 3.531 | 19.274 |
| 18 | 1.490 | 590 | 74 | 350 | 0 | 2.504 | 3.531 | 20.301 |
| 19 | 1.492 | 592 | 67 | 333 | 0 | 2.483 | 3.510 | 21.328 |
| 20 | 1.493 | 591 | 64 | 317 | 0 | 2.465 | 3.499 | 22.361 |

Über die 20 Saisons entstehen im Mittel **49.564 Credits Ausgaben je Verein**: davon **30.196 Gehälter**, **11.539 Förderung**, **1.364 Ausbildungsentschädigungen** und **6.465 Ablösen**. Die laufenden Ausgaben wurden jährlich vor der historischen Ledger-Komprimierung gesichert. Die frühere Vergleichsauswertung speicherte nicht alle alten Bruttoausgaben; ein vollständiger gepaarter Kostenvergleich für Saison 1–18 ist deshalb nicht belegt. Der Stärke-/Kadervergleich und die neuen jährlichen Kosten sind vollständig erfasst.

## Länder nach 20 Saisons

Stärke jeweils gegenüber dem eigenen Anfangskader. Das ist keine Aussage, dass ein Land mit größerem prozentualem Wachstum automatisch absolut stärker ist als jedes andere Land. Erzeugung/Übernahmen sind Summen über 20 Saisons je Land und Welt. Österreich enthält sieben statt acht KI-Ligavereine, da AUT-5 ausgeschlossen ist.

| Land | Stärke mit Karriereenden | Bisherige Regeln | Spieler nach Abschieden | Jahresausgaben S20 / Verein | Jugend erzeugt | Jugend übernommen |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| England | -2,7 % | -3,2 % | 11,1 | 2.426 | 799 | 163 |
| Spanien | +0,4 % | -0,5 % | 10,2 | 2.285 | 768 | 173 |
| Deutschland | 0,0 % | +1,6 % | 10,1 | 2.343 | 808 | 164 |
| Italien | -5,1 % | -5,3 % | 10,9 | 2.457 | 716 | 140 |
| Frankreich | +5,1 % | +5,3 % | 11,0 | 2.528 | 829 | 180 |
| Portugal | +4,5 % | +2,6 % | 10,8 | 2.401 | 813 | 159 |
| Niederlande | +5,1 % | +2,0 % | 10,9 | 2.684 | 872 | 175 |
| Belgien | +13,0 % | +8,2 % | 10,6 | 2.694 | 850 | 178 |
| Österreich | +4,0 % | +5,1 % | 10,2 | 2.519 | 782 | 150 |
| Schweiz | +10,7 % | +13,3 % | 10,3 | 2.357 | 881 | 168 |
| Türkei | +6,5 % | +4,4 % | 10,2 | 2.234 | 857 | 176 |
| Griechenland | +8,5 % | +5,9 % | 10,6 | 2.660 | 901 | 181 |

Die Karriereendstaffel verändert Altersstruktur, Ersatzbedarf und echte Nachwuchsminuten. Sie führt selbst keinen Länderbonus für neue Jahrgänge ein. Die zuvor festgestellte fehlende direkte Länderwirkung bei Jugend-/freien Neugenerierungen und die alte KI-Potenziallesung bleiben relevante getrennte Balancefragen.

Für die vorhandenen Ländergruppen A und D beträgt der tatsächliche Stärkeabstand beim Karrierebeginn **+5,2 %**, nach Saison 20 **-4,5 %**. In den Vergleichswelten beträgt er am Ende **-4,5 %**. Diese direkte Verhältniszahl beantwortet die Länderhierarchie zusätzlich zu den Wachstumsraten der einzelnen Länder.

## Vollständiges Ausscheiden des Startkaders

Die erwachsenen Startkader beginnen mit 19–34 Jahren. Zum Abschluss der zwanzigsten Saison wurden 19 Alterswechsel durchgeführt: Ein ursprünglich 19-Jähriger ist dann 38. Seine rechnerische Chance, die sechs Karriereendversuche mit 33–38 zu überstehen, beträgt 0,6 × 0,5 × 0,4 × 0,3 × 0,2 × 0,1 = **0,072 Prozent**. Ein bei Karriereerstellung bereits übernommener 17-jähriger Jugendspieler ist dagegen erst 36 und kann mit **3,6 Prozent** Wahrscheinlichkeit noch aktiv sein. Deshalb folgt „alle spätestens nach 20 Saisons ausgeschieden“ nicht aus der vereinbarten Altersstaffel.

| Welt | Anfangs aktive Spieler | Noch aktive Startspieler S20 | Davon ursprüngliche Erwachsene | Davon anfangs übernommene Jugend | Karriereenden insgesamt | Höchstes aktives Alter |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| youth20-a | 2181 | 2 | 0 | 2 | 2634 | 36 |
| youth20-b | 2171 | 1 | 0 | 1 | 2621 | 36 |
| youth20-c | 2179 | 1 | 0 | 1 | 2576 | 36 |

Zusätzlich sind **821** anfangs aktive Spieler über andere bestehende Abgangswege aus der Welt verschwunden. Insbesondere entfernt der freie Markt Profis nach vier Jahren ohne Vertrag; dieser Vorgang ist im Karriereprotokoll als Pool-Abgang gespeichert und wurde hier nicht als altersbedingtes Karriereende gezählt.

Wenn die feste Zwanzig-Saisons-Grenze ein Muss ist, braucht sie eine zusätzliche Regel. Eine generelle Höchstaltersgrenze von 36 würde auch anfangs 17-Jährige bis Saison 20 sicher erfassen, änderte aber die gewünschte Staffel. Eine maximale aktive Karrieredauer wäre eine andere Spielregel. Für den vorliegenden Test wurde keine dieser Regeln stillschweigend ergänzt.

## Prüfnachweise und Grenzen

- **youth20-a:** 20 vollständige Saisons, 19.820 echte Pflichtspiele; native Gesamtvalidierung in Saison 1, 10, 20 bestanden.
- **youth20-b:** 20 vollständige Saisons, 19.820 echte Pflichtspiele; native Gesamtvalidierung in Saison 1, 10, 20 bestanden.
- **youth20-c:** 20 vollständige Saisons, 19.820 echte Pflichtspiele; native Gesamtvalidierung in Saison 1, 10, 20 bestanden.

Alle Saisons enthalten genau 991 Ergebnisse mit tatsächlichen Spielerprotokollen. Keine doppelten aktiven Spieler oder doppelten Karriereenden. Kein aktiver Spieler ab 39 im Abschlusssnapshot. Entscheidungstag in den beobachteten Saisons: 112–114 von 224. Die Entscheidung bleibt im Prüfspielstand gespeichert und wird nicht beim Neuladen neu ausgelost. Saisonabschlüsse, Markt und Finanzen verwenden die unveränderten nativen Prüfungen.

Alle 143 eingefrorenen Quelldateien und die Prüfinstrumentierung wurden per Hash kontrolliert. Sämtliche 2.973 Erstjahresergebnisse stimmen exakt mit den Vergleichswelten überein. Zusätzlich stimmen 4.174 Pokalersatzspieler bei Startfähigkeiten, lebenslangen Obergrenzen und verborgenem Talent exakt mit der unveränderten nativen Generierung überein. Alle berichteten Zahlen stammen aus den korrigierten vollständigen Läufen; die verworfenen Erkundungsläufe sind ausgeschlossen.

Die interaktive Jahresübersicht ist bei 360 und 728 Pixeln sowie in heller/dunkler Darstellung geprüft. Alle 52 Kombinationen aus Gesamt-/Länderauswahl und vier Kennzahlen zeigen 20 vollständige Saisonzeilen und gültige Diagramme. Die CSV enthält ebenfalls alle 20 Saisons.

Dieser Lauf ist ein Simulationstest, keine Abnahme einer neuen Spieloberfläche. Hinweise zu Saisonbeginn, sichtbare Ankündigung zur Mitte, Vertragsbegrenzung nach Ankündigung und Abschiedsgeschichte sind weiterhin Produktplanung. Drei Seeds zeigen konkrete Langzeitverläufe, aber keine Garantie für jeden Zufallsstand. Stärken werden als relative Aggregatwerte berichtet; individuelle Fähigkeiten, Talent und Entwicklungspunkte bleiben intern.

Reproduzierbarer Prüflauf: **work/audit-retirement-20years-20261011.cjs**, isolierte Hooks: **work/retirement-audit-hooks-20261011.js**, Auswertung: **work/summarize-retirement-20years-20261011.cjs**. Daten und Jahresübersicht: **outputs/retirement-20years-20261011/**. Die unveränderten eingefrorenen Quellen und ihre Hashes liegen in **outputs/youth-20years-20261011/source/** beziehungsweise **source-manifest.json**.

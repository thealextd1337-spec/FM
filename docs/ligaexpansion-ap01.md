# AP01 – Regeln, Länderstufen und Saison-1-Grundlage

Stand: 10. Oktober 2026. AP01 auf Nutzerauftrag ausgearbeitet und gemäß Paketabnahme abgeschlossen: Entscheidungen, redaktionelle Startdaten und verbleibende offene Prüfungen sind getrennt ausgewiesen. Kein Laufzeitcode der Expansion und keine Veröffentlichung. Grundlage: [Produktregeln](product.md), [Expansionsplan](ligaexpansion-plan.md), [AP00](ligaexpansion-ap00.md).

## 1. Entscheidungen und Herkunft

Am 10. Oktober 2026 während AP01 vom Nutzer bestätigt:

- Crown-Ligaphase: keine nationalen Duelle; je 13 Vereine mit drei und mit zwei Heimspielen.
- Horizon: keine nationale Paarung im Sechzehntel- und Achtelfinale; **ab dem Viertelfinale nationale Duelle erlaubt**. Der Nutzer hat die zunächst erwogene Sperre einschließlich Viertelfinale ausdrücklich korrigiert.
- Horizon wird ohne Setzung und in jeder Runde neu ausgelost.
- Startreihenfolge wie vorgeschlagen, mit Österreich vor Belgien: Österreich steht auf Rang 8 und erhält zunächst drei Horizon-Plätze.
- Vier sportliche und wirtschaftliche Länderstufen: die fünf großen Ligen / Portugal und Niederlande / Österreich, Belgien und Türkei / Schweiz und Griechenland. Vereinsstärken überschneiden sich zwischen den Stufen.

Bestehende Crown-K.-o.-Setzung und nationale Pokalregeln werden nach dem ursprünglichen Paketauftrag auf das neue Feld übertragen. Die nachfolgende Saison-1-Vorgeschichte ist eine redaktionelle Arbeitsfestlegung im Rahmen des AP01-Auftrags, keine vom Nutzer einzeln gewählte Vereinsrangliste und keine gespielte Saison. Noch nicht freigegebene Vereinsnamen/-profile bleiben AP02 zugeordnet.

## 2. Crown Cup: Heimrechte und Auslosung

### Ligaphase

26 Vereine, fünf Runden mit je 13 Partien. Jeder Verein spielt einmal je Runde gegen fünf verschiedene ausländische Gegner. Keine nationalen Duelle und keine Doppelgegner; Titelverteidiger erhalten keine Sondergegner oder zusätzlichen Heimspiele.

13 Vereine erhalten drei Heim-/zwei Auswärtsspiele, die anderen 13 zwei Heim-/drei Auswärtsspiele. Die gesamte Verteilung wird mit der Auslosung aus Weltseed, Saison und Wettbewerb reproduzierbar erzeugt und gespeichert. Neuladen lost nicht erneut; es besteht kein Anspruch auf einen jährlich wechselnden Heimüberschuss.

Die Auslosung erstellt zuerst fünf vollständige Runden unter den Gegnerregeln. Danach wird das Heimrecht gemeinsam über alle Runden verteilt; Heimrechte dürfen nicht durch voneinander unabhängige Münzwürfe eine ungleiche Gesamtbelastung erzeugen. Ein möglicher konstruktiver Weg für AP05: Der Gegnergraph hat Grad fünf je Verein. Einen Hilfsknoten mit einer Kante zu jedem Verein ergänzen, die dann geraden Grade per Eulerumlauf orientieren und die Hilfskanten entfernen. Das liefert je Verein zwei oder drei Heimspiele und insgesamt genau 13 Vereine je Gruppe. Das ist eine mathematische Grundlage, noch kein ausgeführter Spielplangenerator.

Auslosung bleibt ungesetzt; Länderstärke, wirtschaftliche Stufe und Länderwertung beeinflussen nicht die Gegnerziehung. Gültigkeit des gesamten Plans geht vor einer früh gewählten Einzelpaarung; bei einer Sackgasse wird die Ziehung zurückgesetzt, nicht die nationale Sperre gelockert. AP05 muss Reproduzierbarkeit und vollständige Runden für mehrere Seeds sowie maximale Länderkonzentration prüfen.

### K.-o.-Phase

- Platz 1–8 direkt ins Viertelfinale, Platz 9–26 ausgeschieden; keine Play-offs.
- Bisherige Rangtiebrecher erhalten: Punkte, Tordifferenz, erzielte Tore, Siege, abschließend reproduzierbares Los. Keine neue Länderwertung als sportlicher Tiebrecher.
- Rang 1–4 wird jeweils einem ausgelosten Verein von Rang 5–8 zugeordnet. Keine nationale Sperre im Viertelfinale, Halbfinale oder Finale.
- Die bessere Ligaphasenplatzierung bekommt in Viertel- und Halbfinale das Rückspiel zuhause. Viertelfinalpaarungen 0/1 sowie 2/3 bilden die beiden Halbfinals, wie im bisherigen Wettbewerbsweg; kein erneutes Setzen nach dem Viertelfinale.
- Finale einzeln und neutral. Keine Auswärtstorregel und keine Verlängerung; Gleichstand nach dem Rückspiel-Gesamtstand beziehungsweise im Finale führt zum Elfmeterschießen.

## 3. Horizon Cup und nationaler Pokal

### Horizon

| Runde | Nationale Duelle | Setzung / Heimrecht |
| --- | --- | --- |
| Sechzehntelfinale (`R32`) | ausgeschlossen | ungesetzt; Hinspiel-Heimrecht per Los, Rückspiel umgekehrt |
| Achtelfinale (`R16`) | ausgeschlossen | neue ungesetzte Auslosung; Heimrecht erneut per Los |
| Viertelfinale (`QF`) | erlaubt | neue ungesetzte Auslosung; Heimrecht per Los |
| Halbfinale (`SF`) | erlaubt | neue ungesetzte Auslosung; Heimrecht per Los |
| Finale (`F`) | erlaubt | zwei verbleibende Sieger; eine neutrale Partie, keine zusätzliche Ziehung erforderlich |

Jede tatsächliche Auslosung erfolgt erst, wenn alle Teilnehmer der Runde durch abgeschlossene Ergebnisse feststehen. Paarungen und Heimrechte werden gespeichert. Ein früherer Gegner darf in derselben Wettbewerbssaison nicht erneut auftreten, was durch den reinen K.-o.-Weg ohnehin gewährleistet ist. Der Turnierbaum zeigt zukünftige Paarungen als noch auszulosen; kein vorab festgelegter Weg erzwingt ein nationales Achtelfinale.

Jedes Land startet mit höchstens drei Horizon-Vereinen. In geschützten Runden mit 32 beziehungsweise 16 Teilnehmern kann damit keine Landesgruppe mehr als die Hälfte des Feldes stellen. Ein vollständiges Matching ohne nationale Duelle bleibt möglich. AP06 darf fehlgeschlagene Einzelziehungen durch Zurücksetzen beheben, nicht durch Freilose oder Ausnahme von der Sperre. Gleichverteilung über alle theoretisch möglichen Turnierbäume wird damit nicht behauptet.

### Nationaler Pokal

Die bisherige freie Auslosung wird auf 16 Teilnehmer übertragen: Achtel-, Viertel- und Halbfinale werden jeweils nach Abschluss der Vorrunde neu ausgelost, ohne Setzung oder vorgeschriebene Liga-gegen-Pokalverein-Paarung. Der zuerst gezogene Verein hat Heimrecht; im Finale ist der Spielort neutral. Je Runde eine Partie, bei Remis direkt Elfmeterschießen. Die Pokalvereine behalten ihre bestehenden Identitäten; acht Ligavereine werden nicht automatisch die acht gesetzten Teams.

## 4. Startwertung und Länderstufen

Das ist eine fiktive Spielwelt-Ausgangslage, keine Wiedergabe einer aktuellen realen Fußballrangliste. Die Länderwertung steuert ausschließlich künftige Horizon-Platzkontingente; sie ist kein zusätzlicher Matchbonus und verändert nach dem Start nicht automatisch die Länderstufe.

| Startplatz | Land / ID | Stufe | Horizon-Plätze Saison 1 |
| --- | --- | --- | --- |
| 1 | England / ENG | A | 3 |
| 2 | Spanien / ESP | A | 3 |
| 3 | Deutschland / GER | A | 3 |
| 4 | Italien / ITA | A | 3 |
| 5 | Frankreich / FRA | A | 3 |
| 6 | Portugal / POR | B | 3 |
| 7 | Niederlande / NED | B | 3 |
| 8 | Österreich / AUT | C | 3 |
| 9 | Belgien / BEL | C | 2 |
| 10 | Türkei / TUR | C | 2 |
| 11 | Schweiz / SUI | D | 2 |
| 12 | Griechenland / GRE | D | 2 |

- **A:** im Ligamittel stärkste Startkader und größte wirtschaftliche Reichweite. Spitzen- und kleine Vereine bleiben deutlich verschieden.
- **B:** starke internationale Spitzenvereine, insgesamt engere Mittel und stärkeres Entwicklungs-/Verkaufsprofil.
- **C:** international konkurrenzfähige Spitzen und Herausforderer, kleinere durchschnittliche Mittel als B. Österreichs achter Startwertungsplatz hebt nicht automatisch seine Finanzstufe an.
- **D:** kleinere durchschnittliche Startmittel; einzelne starke Vereine und erfolgreiche Managerarbeit können C- und B-Vereine herausfordern.

AP02 gestaltet überlappende Vereinsprofile: Ein Spitzenverein aus C/D darf einen schwachen Verein aus A/B übertreffen. Tradition, Fans, Jugend, Risiko und Geduld werden nicht pauschal mit dem Land überschrieben. AP03 setzt die Abstufung in tatsächlich erzeugte Startkader und Mittel um; AP07 kalibriert Einnahmen, Sponsoren, Gehälter und Reserven. Konkrete Geldfaktoren, Fähigkeitsparameter und Prämien sind noch offen, keine stillschweigend eingeführten Multiplikatoren. Mensch und KI erhalten dieselben Grundlagen; bisherige reine Simulations-Pokalvereine erhalten dadurch nicht automatisch eine neue Finanz-/Jugendverwaltung.

Saison 1 beginnt ohne erfundene Länderpunktwerte. Nach dem ersten Abschluss gilt der erste echte Saisonwert, nach dem zweiten die Summe zweier und nach dem dritten die Summe dreier tatsächlich gespielter Saisons. Bei Gleichstand gelten jüngster Saisonwert und vorheriger Länderrang; der Startwertungsrang ist die erste gültige Rückfallebene.

## 5. Fiktive Vorsaison und erste Teilnehmer

Die vollständigen Ranglisten, Pokalsieger/-finalisten, Titelverteidiger und Regeln stehen maschinenlesbar in [ligaexpansion-saison1.json](ligaexpansion-saison1.json). Bestehende Vereinskennungen bleiben erhalten; zusätzliche Liga-IDs folgen AP00. Für neue Länder entspricht die ID-Reihenfolge der Reihenfolge im [Vereinsentwurf](ligaexpansion-vereinsvorschlaege.md); vollständige Identitäten bleiben AP02.

Internationale Vorjahressieger:

- Crown: **Madrid Central CF (`ESP-1`)**, zugleich spanischer Meister. Dadurch rückt `ESP-3` über den freien nationalen Platz nach; Pokalsieger `ESP-2` behält seinen direkten Platz.
- Horizon: **Braga Norte FC (`POR-4`)**. Braga startet im Crown Cup zusätzlich zu den beiden portugiesischen nationalen Teilnehmern. Für Horizon rücken die nächsten berechtigten Ligavereine nach.

Frankreich beginnt als Double-Fall: `FRA-1` ist Meister und Pokalsieger; Finalist `FRA-2` erhält den zweiten nationalen Platz. Die übrigen Sieger und Finalisten sowie alle acht Ligaplatzierungen je Land stehen in der JSON-Datei. Es werden weder Vorsaisonspielberichte noch fiktive Tore, Spielerpreise, Managererfolge, Prämienzahlungen oder Länderpunkte angelegt.

### Vollständige Teilnehmerliste für Saison 1

| Land | Nationale Crown-Plätze | Horizon-Teilnehmer |
| --- | --- | --- |
| ENG | ENG-2, ENG-1 | ENG-7, ENG-4, ENG-3 |
| ESP | ESP-3, ESP-2 | ESP-7, ESP-4, ESP-8 |
| GER | GER-1, GER-7 | GER-2, GER-3, GER-8 |
| ITA | ITA-2, ITA-1 | ITA-6, ITA-7, ITA-4 |
| FRA | FRA-1, FRA-2 | FRA-3, FRA-5, FRA-7 |
| POR | POR-2, POR-1 | POR-3, POR-7, POR-5 |
| NED | NED-3, NED-1 | NED-2, NED-4, NED-5 |
| AUT | AUT-2, AUT-3 | AUT-1, AUT-4, AUT-5 |
| BEL | BEL-1, BEL-3 | BEL-2, BEL-4 |
| TUR | TUR-2, TUR-1 | TUR-3, TUR-4 |
| SUI | SUI-2, SUI-1 | SUI-3, SUI-4 |
| GRE | GRE-1, GRE-2 | GRE-3, GRE-4 |

Zusätzlich Crown: `ESP-1` und `POR-4` als Titelverteidiger. Damit **24 nationale + 2 garantierte Plätze = 26** und **8 × 3 + 4 × 2 = 32** Horizon-Vereine; kein Verein steht in beiden Feldern.

Wichtig für AP07: Zuerst beide Titelverteidiger und sämtliche direkten nationalen Teilnehmer reservieren. Erst danach jeden überlappenden nationalen Platz mit dem nächsten berechtigten Ligaverein füllen. So wird ein noch nicht verarbeiteter Pokalsieger nicht versehentlich als Ersatz für den Meisterplatz verbraucht. Schließlich Horizon aus den verbleibenden Ligavereinen bilden.

Bei Karrierebeginn wird diese Quelle als „Fiktive Ausgangslage vor Karrierebeginn“ gekennzeichnet. Das Karriere-Titelarchiv und die gespielte Statistik beginnen leer; Hinweise auf Vorjahressieger dürfen nur die redaktionelle Vorgeschichte wiedergeben. Eine schon bestehende Welt wird nicht damit ergänzt.

## 6. Namensvorprüfung

Die Namen bleiben gemäß bestehendem Nutzerentscheid Crown Cup und Horizon Cup. Die Vorprüfung vom 10. Oktober 2026 liefert **keine rechtliche Freigabe**; Status und Quellen stehen vollständig in [Namensvorprüfung](ligaexpansion-namenspruefung.md).

Belegte bestehende Verwendungen: Crown Cup für internationale Tanzwettbewerbe; Horizon Cup für Riot/Wild Rift und für ein internationales Turnturnier. Besonders die Verwendung im Spiele-/Esportumfeld ist ein sachlicher Anlass, den vorgesehenen Einsatz in Doppel 6 genauer zu prüfen, aber kein festgestellter Verbots- oder Verletzungsbefund.

TMview war erreichbar, die automatisierte Auslesung scheiterte zweimal mit `Preview automation snapshot timed out after 15000ms.`. Eine vollständige Suche identischer/ähnlicher registrierter Rechte, deren aktuellem Status, Waren/Dienstleistungen und Schutzgebieten wurde deshalb **nicht** abgeschlossen. Österreich/EU werden als erster Rechercheumfang angesetzt; die tatsächlichen Veröffentlichungsgebiete einschließlich späterer Stores sind weiterhin festzulegen.

Betroffen: AP01-Namensabschluss und AP11-Veröffentlichungsabnahme; AP09 darf Entwürfe vorbereiten, finale namensgebundene Motive bleiben vorläufig. AP05/06 arbeiten über stabile `crown`-/`horizon`-Kennungen unabhängig vom späteren sichtbaren Namen. Es werden keine Gebühren, Anmeldungen oder Kontaktaufnahmen ausgelöst.

## 7. Offene Punkte und Folgepakete

| Offen | Betroffene Pakete | Konkrete nächste Lieferung |
| --- | --- | --- |
| Register-/Ähnlichkeitsprüfung und tatsächliche Veröffentlichungsgebiete | AP01-Namensabschluss, AP09, AP11 | belegte Treffer mit Status/Schutzgebiet/Waren und getrennte Bewertung; keine Freigabe aus Suchmaschinen-Nichttreffern |
| Vollständige Vereinsidentitäten und Profile | AP02/03 | 192 Vereine nach bestätigten Länderstufen; gewählte und vorgeschlagene Namen unterscheiden |
| Quantitative Startkader-/Finanzkalibrierung | AP02/03/07 | konkrete Parameter, finanzierbare Kader, Überschneidungen und Mehrjahresnachweise |
| Reale Spielplangeneratoren und Termine | AP04/05/06 | fünf vollständige Crown-Runden, Horizon-Rundenauslosung, 14 Ligaspieltage, Ruhezeiten und August–März-Nachweis |
| Grafikmotive, Vereinsbüro und Cup-Gründungslegenden | AP08/09/10 | eigene Entwürfe; keine neuen persönlichen internationalen Awardregeln aus AP01 |

Die offenen Punkte sind ausdrücklich ausgewiesen und nicht als erledigt behandelt. AP01-Abnahme verlangt eine vollständige Entscheidungsvorlage mit entschiedenen oder konkret zugeordneten offenen Punkten; sie ist keine Veröffentlichungserlaubnis. AP02 kann auf den bestätigten Länderstufen arbeiten, während die Namensprüfung offen bleibt.

## 8. Prüfung und Übergabe

`node work/check-ligaexpansion-ap01.cjs` prüft die Startdatenspezifikation und schreibt `outputs/ligaexpansion-ap01/qualification.json`. Erfolgreich: zwölf vollständige Liga-Ranglisten, eindeutige Länderstufen, Österreich Rang 8, 26/32 Teilnehmer ohne Überschneidung, die Nachrücker in Spanien/Portugal und der französische Double-Fall. Zusätzlich 18.336 Kombinationen zweier unterschiedlicher Vorjahressieger aus allen 192 möglichen Vereinen sowie 24 Double-/Pokalvereinsfälle: insgesamt **18.360 Szenarien**.

Das ist eine Prüfung der dokumentierten Qualifikationsregeln, keine integrierte Wettbewerbs-, Auslosungs- oder Matchabnahme. Heimverteilung und Horizon-Länderschutz sind rechnerisch plausibel; AP05/06 müssen ihre Implementierung erst nachweisen. Keine alten Partien, Länderpunkte, Titel oder Zahlungen werden erzeugt. Laufzeit-, Build- und Live-Version bleiben unverändert.

# P01: reine Spielererstellung

Stand: 8. Oktober 2026. Im vom Nutzer gestarteten Welle-2-Umfang lokal umgesetzt. Grundlage: [gemeinsamer Vertrag](wave2.md), [P01](../agentenauftraege/01-spieler-karriere-taktik.md), [Spielererstellung](../spieler-erstellung-rollen-plan.md), [Körpergröße](../koerpergroesse-plan.md), [Talent](../jugendentwicklung-noten-plan.md). Die bestätigten Rechner sind umgesetzt; konkrete Verteilungen bleiben ausdrücklich Testparameter. Keine produktive Aktivierung, neue Rollenbewertung oder Ergänzung bestehender Spieler.

## Dateien und Exporte

- `dist/player-generation.js`: UMD, Browserglobal `D6PlayerGeneration`, Node `module.exports`, keine Engine-, DOM-, Storage- oder Zufallsquelle aus dem Browser.
- `work/test-player-generation.cjs`: Vertrags-, Invarianten- und statistische Prüfungen.
- `work/measure-player-generation.cjs`: importierbarer **unbestätigter lokaler Messkandidat**, keine Produktdefaults; Exporte `candidateParameters`, `createRng(seed)`, `SEEDS`, `wilson`, `measureCandidate(options)`.

Das reine Modul exportiert `positionQuality(skills, position)`, `eliteQuality(skills, playablePositions)`, `generatePlayer(context, parameters, rng)` sowie die bestätigten Konstanten `SKILL_KEYS`, `POSITION_WEIGHTS`, `TALENT_BANDS`, `YOUTH_TALENT_WEIGHTS` und den Prüfhelfer `youthTalentProbabilities(populationWeights, youthQuality)`. Alle Eingaben bleiben unverändert. Ausgaben enthalten neue Objekte und Arrays. Fehlende oder ungültige Parameter führen zu `TypeError`; es gibt keine ersatzweise Produktverteilung und kein implizites `Math.random()`.

## Datenvertrag

`context`:

| Feld | Vertrag |
|---|---|
| `id` | Nichtleere Zeichenfolge oder sichere ganze Zahl; Weltadapter übernimmt `pid` als `id`. |
| `age` | Positives ganzes Alter; muss genau einen expliziten Altersbereich der Erzeugungsart treffen. |
| `mainPosition` | `gk`, `def`, `mid` oder `att`. |
| `kind` | `youth`, `start`, `free` oder `cup`; identischer Erzeugungsrechner für alle vier Pfade. |
| `clubQuality` | `weak`, `normal`, `strong`; für `start/free/cup` erforderlich und für Jugend ohne Wirkung. |
| `youthQuality` | `weak`, `normal`, `strong`; für `youth` erforderlich und für andere Arten ohne Wirkung. |

Ausgabe exakt: `id, age, mainPosition, playablePositions, skills, caps, heightCm, preferredFoot, talent, recommendedRoles`. `skills` und `caps` enthalten alle 13 Schlüssel `tec,pas,fin,tak,pos,spd,sta,air,gk,calm,ant,dec,str`. Fähigkeiten einschließlich interner Bruchteile liegen bei 1–20; Grenzen mindestens beim Startwert und höchstens 20. Talent ist ganzzahlig 10–22, Größe ganzzahlig 165–205 cm, Fuß `right/left/both`.

Bei der Erstellung festgelegte Profilpositionen, Grenzen, Größe, Fuß, Talent und Empfehlungen werden vom Verbraucher gespeichert und später übernommen. Der Generator besitzt keinen Nachberechnungs-, Wachstums- oder Ladepfad. Ein späterer Routinenaufbau erweitert die Profilpositionen nicht. Das Vertragsobjekt ist ausschließlich intern; der UI-Adapter darf keine Kopie davon an Renderer geben. Talent, Fähigkeitszahlen, Grenzen und Entwicklungsbuchhaltung bleiben verborgen. Höhe und Fuß sind getrennte sichtbare Eigenschaften.

## Bestätigte Positionsqualität

Gewichteter arithmetischer Mittelwert: `Summe(skills[key] × Gewicht[key]) / 100`, ohne Rundung. Die Gewichte dienen ausschließlich der permanenten Positionsqualität.

| Schlüssel | Tormann | Verteidiger | Mittelfeld | Stürmer |
|---|---:|---:|---:|---:|
| `tec` | 4 | 4 | 14 | 9 |
| `pas` | 5 | 5 | 18 | 8 |
| `fin` | 0 | 1 | 3 | 20 |
| `tak` | 1 | 20 | 8 | 1 |
| `pos` | 12 | 18 | 10 | 12 |
| `spd` | 3 | 8 | 6 | 7 |
| `sta` | 3 | 3 | 8 | 2 |
| `air` | 1 | 7 | 2 | 4 |
| `gk` | 40 | 0 | 0 | 0 |
| `calm` | 10 | 2 | 5 | 12 |
| `ant` | 10 | 12 | 10 | 12 |
| `dec` | 8 | 10 | 12 | 8 |
| `str` | 3 | 10 | 4 | 5 |
| Summe | 100 | 100 | 100 | 100 |

`eliteQuality` ist wahr, sobald die beste **gelieferte spielbare Profilposition** mindestens 16 erreicht. 15,99 liegt darunter. Keine Mindestwerte einzelner Fähigkeiten; fremde Einsatzpositionen, Talent, Grenzen, Größe, Fuß, Form, Frische, Routine und Rolle wirken nicht mit. Der Verbraucher muss die gespeicherten Profilpositionen übergeben, keine taktisch zugewiesene fremde Position. Es entsteht kein sichtbares Eliteabzeichen.

## Explizite Parameter und Erzeugungsfolge

Alle folgenden Werte sind erforderlich, soweit ihr Pfad verwendet wird. Ein `uniform`-Bereich muss ausdrücklich `{distribution:'uniform', min, max}` enthalten. Gewichte müssen endlich, nichtnegativ und in ihrer Auswahl zusammen positiv sein. `min=max` ist als kontrollierte Prüfszene erlaubt.

| Parameter | Struktur und Zweck |
|---|---|
| `qualityByKind[kind]` | Liste `{minAge,maxAge,byQuality:{weak:[Band],normal:[Band],strong:[Band]}}`; ein Band ergänzt einen expliziten Uniformbereich um `weight`. Jede Art und jedes Alter wird gesondert konfiguriert. Kein aus Jugendregeln abgeleiteter Erwachsenenbonus. |
| `profilesByPosition[position]` | Gewichtete Liste kohärenter Erzeugungsprofile; Profil-IDs sind keine taktischen Rollen. |
| Profil `offsets` | Vollständiges Objekt mit 13 expliziten relativen Stärken/Schwächen. |
| Profil `noiseBySkill` | 13 explizite Uniformbereiche für begrenzte Variation. |
| Profil `capHeadroomBySkill` | 13 explizite nichtnegative Uniformbereiche für profilabhängigen Spielraum. Keine Talentformel. |
| Profil `sidePositionRules` | Explizite Liste, auch `[]`; Regeln `{position,minQuality,maxQualityGap,minimumSkills}`. Mindestens zwei einzelne Fähigkeitsanforderungen, nicht bloß ein Mittelwert. |
| Profil `allRounderRule` | Explizit `null` oder `{minQualityByPosition:{def,mid,att},minimumSkills}` mit mindestens zwei Fähigkeitsanforderungen. |
| Profil `height` | `{lowerEdgeShare,lower:[{value,weight}],core:[{value,weight}],upper:[{value,weight}]}` für 165–169, 170–200, 201–205 cm. Randaufteilung und Verteilung innerhalb der Bereiche explizit. |
| `footWeights` | Exakt `{right,left,both}`, alle Gewichte explizit. |
| `youthPopulationWeights` | `{weak,normal,strong}` mit tatsächlichen relativen Erzeugungsmengen; nicht nur Vereinszahlen. Null für unbenutzte Kategorien erlaubt, erzeugte Kategorie muss enthalten sein. |
| `talentWithinBandWeights` | Für Jugend je Band `10-13/14-17/18-19/20/21/22` explizite Gewichte aller einzelnen ganzzahligen Talentwerte. |
| `talentWeightsByKind[kind]` | Für `start/free/cup` explizite Gewichte exakt aller Werte 10–22; die bestätigte Jugendverteilung ist keine stille Erwachsenenverteilung. |
| `recommendRoles` | Optionaler reiner P04-Rechner; ohne Rechner `recommendedRoles=[]`, keine erfundene Ersatzliste. |

Erst wird ein Erzeugungsprofil gezogen, dann eine Qualitätsgruppe und ein Qualitätswert anhand des getrennten Vereins-/Jugendprofils. Die zusammenhängenden Offsets und Variationen werden um ihren gewichteten Mittelwert zentriert. Falls einzelne Fähigkeiten an 1 oder 20 stoßen, korrigiert eine gemeinsame stufenlose Verschiebung die Hauptpositionsqualität auf den gezogenen Wert, ohne die Reihenfolge der Profilstärken umzukehren. Die Werte bleiben innerhalb der Skala; der Test prüft den Zielmittelwert mit höchstens `2e-12` Abweichung.

Jede Grenze ergibt sich danach aus Startfähigkeit plus **dem expliziten Spielraum ihres Erzeugungsprofils**, begrenzt auf 20. Talent wird erst nach Fähigkeiten, Grenzen, Positionsprofil, Höhe und Fuß ausgelost und wird an keinen dieser Schritte zurückgegeben. Hohe Werte erzeugen daher weder bereits erreichte Elite noch höhere Grenzen. Das spätere Entwicklungsmodul verwendet Talent für die Lernmenge.

Ordentliche Nebenpositionen werden deterministisch aus den Fähigkeiten abgeleitet: `def↔mid` oder `mid↔att`, höchstens eine; bei zwei passenden Nachbarn entscheidet die höhere Positionsqualität, bei Gleichstand `def` vor `att`. Jede Regel verlangt die expliziten Einzelfähigkeiten und Qualitätsbedingungen. Alle drei Feldpositionen sind nur über das ausdrücklich konfigurierte Allrounderprofil möglich. Tormänner bleiben ausschließlich `['gk']`; ihr Profil erlaubt keine Feldnebenposition und kein Allrounderprofil. Seltenheit und Eignungsschwellen sind Messparameter; keine unabhängige Nebenpositionsziehung und keine Pflicht zur Nebenposition.

Der Größenkanal verwendet die bestätigte 95-Prozent-Wahrscheinlichkeit für 170–200 cm für jedes Erzeugungsprofil; damit gilt sie auch für jede beliebige globale Profilmischung. Die übrigen fünf Prozent werden über `lowerEdgeShare` auf beide Randbereiche verteilt. Innerhalb der Bereiche bestimmen die expliziten Profilgewichte die Position-/Profilabhängigkeit und erlauben Ausnahmen. Größe gibt keinen Kraft-, Luftspiel- oder sonstigen Fähigkeitsbonus. Dieser Vertrag erlaubt keine Rollenmindestgröße.

## Globale Jugendtalente

Die bestätigten globalen Bandanteile sind 20/60/15/3/1,5/0,5 Prozent. Für Jugendarbeit gelten hohe Auswahlgewichte `w=0,5/1/2`. Sei `m = Summe(Menge[q] × w[q]) / Summe(Menge[q])`.

- Talent 20, 21 und 22 erhalten pro Kategorie jeweils `globalerAnteil × w[q]/m`.
- Die übrigen drei Bänder erhalten jeweils `globalerAnteil × (1 − 0,05 × w[q]/m) / 0,95`.

Damit summiert sich jede Kategorienverteilung auf eins, das Verhältnis hoher Chancen ist exakt 0,5:1:2, und der mengenbezogene globale Erwartungswert bleibt **für jedes einzelne Band** exakt bestätigt. Die Rechnung wurde für gleichmäßige und stark ungleichmäßige Nachwuchsmengen geprüft. Die Erzeugung zieht unabhängig pro Spieler und hält keine Mannschafts-/Jahrgangsquote. Bei veränderten Nachwuchsmengen muss der Weltadapter die gemeinsamen Gewichte vor der neuen Erzeugung neu ermitteln; vorhandene Talentwerte bleiben erhalten.

## P04-Anschluss

`recommendRoles({mainPosition, playablePositions, skills}) -> [{position, roleId}]`. Der Rechner erhält einen eingefrorenen, kopierten Fähigkeits-/Positionsausschnitt ohne Talent und Grenzen. Er muss selbst rein und deterministisch sein; keine zusätzliche Zufallsziehung. Das Ergebnis wird kopiert, doppelte Paare werden entfernt, Reihenfolge bleibt bestehen. Empfehlungen müssen zu einer erzeugten spielbaren Profilposition gehören. Der Generator enthält keinen Rollenkatalog, keine Rollengewichte und keine künstliche Mindestzahl von Empfehlungen. P04 entscheidet sinnvolle eine bis drei Empfehlungen sowie seltene echte Vielseitigkeit; danach bleibt das Repertoire gespeichert.

## Ausgeführte Prüfungen

Runtime: `C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`.

```powershell
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' 'work/test-player-generation.cjs'
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' 'work/measure-player-generation.cjs' '--compare-historical'
```

Ergebnis: 16 Prüfgruppen erfolgreich. Gewichte/Summen, bestätigte Zahlenbeispiele, 15,99/16, stärkere Nebenposition gegenüber fremder Einsatzposition, UMD-Gleichheit, deterministischer Zufall, keine Eingabemutation, Skala/Zielmittelwert, talentunabhängige profilbezogene Grenzen, Tormann-/Feldtrennung, Nachbarn/seltene Allrounder, getrennte Größe/Fuß, P04-Anschluss und Fehler statt Defaults geprüft. Keine Engine- oder Speicheränderung, daher keine produktive Match-/Browserprüfung durch P01.

Messung mit Seeds `101,211,307,401,503,601,701,809,907,1009`: 82.500 Spieler insgesamt, davon 60.000 17-jährige Jugendspieler. Jugendmengen 1:2:3 für schwach/normal/stark; Erwachsene getrennt nach Erzeugungsart mit Prüfaltern 18/25/34, allen vier Positionen und drei Vereinsqualitäten. Diese geschichtete Stichprobe ist ein Experiment, keine Welt- oder Kaderquote. `--json` liefert zusätzlich vollständige Alters-/Positions-/Kategoriegruppen und pro Seed eine Baseline.

| Prüfbefund | Messkandidat | 95%-Wilsonintervall |
|---|---:|---:|
| Jugend-Hauptpositionsqualität 7–10 | 88,910 % | Häufigkeit bleibt offener Messparameter |
| Bereits erreichte Jugend-Elite | 96/60.000 = 0,160 % | 0,131–0,195 % |
| Globale Größe 170–200 cm | 78.495/82.500 = 95,145 % | 94,997–95,290 % |
| Jugendtalent 10–13 | 19,910 % | 19,592–20,231 % |
| Jugendtalent 14–17 | 60,073 % | 59,681–60,465 % |
| Jugendtalent 18–19 | 15,118 % | 14,834–15,407 % |
| Jugendtalent 20 | 2,897 % | 2,765–3,034 % |
| Jugendtalent 21 | 1,478 % | 1,385–1,578 % |
| Jugendtalent 22 | 0,523 % | 0,469–0,584 % |

Alle sechs Talentziele liegen in diesen Intervallen; zusätzlich wird der globale Erwartungswert analytisch bewiesen. Die automatische Zufallsprüfung verwendet eine tolerantere Vier-Standardfehler-Grenze, damit die 95%-Intervalle nicht fälschlich als garantierte Quoten dienen. Stärkere Jugendprofile liefern im Kandidaten mittlere Hauptpositionsqualität 9,293 gegenüber 8,572/7,817; stärkere Startkaderprofile 11,852 gegenüber 10,337/8,585. Jeder dieser Gruppen bleibt breit gestreut, jeder der zehn Seeds zeigt höhere mittlere Erwachsenenqualität für starke gegenüber schwachen Vereinen. 28 seltene echte Allrounder in der Gesamtstichprobe; reine und benachbarte Profile kommen ebenfalls vor. Empfehlungsliste überall leer, solange P04 fehlt.

Der optionale historische Vergleich liest ausschließlich [die erhaltene Zehn-Seed-Baseline vom 6. Oktober](../../outputs/player-generation-baseline-2026-10-06.json). Gemeinsame Vergleichsgröße: mindestens eine beziehungsweise drei der **alten neun Fähigkeiten** ab 17; das ist keine Eliteklassifikation.

| Art | Historisch: mindestens eine / drei höchste Stufen | Kandidat: mindestens eine / drei höchste Stufen |
|---|---:|---:|
| Ligakader / `start` | 32,8 / 11,1 % (4.055 Spieler) | 2,613 / 0,600 % (7.500 Spieler) |
| Reine Pokalteams / `cup` | 0 / 0 % (1.320) | 2,067 / 0,293 % (7.500) |
| Jugend | 0,2 / 0 % (1.824) | 0,158 / 0,047 % (60.000) |
| Freie Spieler | 37 / 1 % (100) | 1,787 / 0,227 % (7.500) |

Unterschiedliche Alters-/Vereinsmischungen und echte Markt-/Jugendaktionen bei der historischen Initialisierung begrenzen den Vergleich. Keine historischen mentalen/Kraftwerte ergänzt und keine alte Positionsqualität oder Elitehäufigkeit erfunden. Weder historische Häufigkeiten noch die Kandidatenwerte sind neue Produktionsziele.

## Integrationsnotizen und verbleibende Gates

- `dist/world-foundation-v61.js:114`, `v61GenerateRoster`: Adapter für Startkader und reine Pokalteams; `entry.profile[5]` beziehungsweise `policy.startingSquad` erst über eine ausdrücklich bestätigte Kategoriezuordnung abbilden. Erzeugungs-ID und restliche Identitäts-/Karrieredaten bleiben beim Weltadapter.
- `dist/world-youth-manager-v67.js:6`, `v67Youth`: eigener Jugendkontext, endgültige feste Höhe und gemeinsame tatsächlich geplante Nachwuchsmengen. Die alte Talent-/Potentialformel nicht zusätzlich anwenden. Der Messkandidat behandelt ausschließlich 17-jährige Jugend; weitere Altersverteilungen benötigen explizite eigene Regeln.
- `dist/world-economy-v66.js:140`, `v66NewFreeAgents`: derselbe Qualitätsvertrag, `kind:'free'`; keine unbestätigte freie-Spieler-Verteilung aus einem Vereinsdefault übernehmen.
- Browserloader, lokaler Server, Buildliste, neue Weltkennzeichnung, Atomizität/Speicherung, UI-Projektion, Sammeldokumentation/Changelog und Integration gehören ausschließlich dem Integrator. Keine automatische Altstand-Ergänzung und keine Rollenerweiterung durch spätere Entwicklung. Versionserhöhung erst bei einer Veröffentlichung nach Projektregeln.
- Produktionsoffen: Kategorienzuordnung/Erzeugungsmengen, genaue Jugend-/Erwachsenenqualität und Eliteanteile, Profilhäufigkeiten und Schwellen für Nebenpositionen, Grenzenverteilungen, Talente innerhalb der Bänder und für Nicht-Jugend, Größenfeinverteilung/Randaufteilung, Fußverteilung sowie P04-Empfehlungsrechner. Diese Kandidaten stehen ausschließlich in `work/measure-player-generation.cjs`.
- Langzeitentwicklung, Match-/Wirtschaftsbalance, echte neue Welt-/Save-Anbindung und P04/P06-Abnahme folgen beim Integrator beziehungsweise späteren Fachpaketen. Die lokalen Modulnachweise beanspruchen diese Prüfungen nicht.

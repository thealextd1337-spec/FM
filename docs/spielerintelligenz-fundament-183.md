# Spielerintelligenz 183: Fundament SI-F

Stand: 14. Oktober 2026. Branch `feat/si-foundation` auf `integration/si-r133` (`7bd0d228`). Umsetzung des Pakets SI-F aus dem [Umsetzungsplan](spielerintelligenz-umsetzungsplan-2026-10-14.md) (Abschnitte 6, 7, 8.3, 9), ergänzt um die Weichen aus dem Review vor Welle 1. Verhalten unverändert: Neue Partien tragen den Marker 183, alle Paketschalter sind aus.

## Marker und Konfiguration

- Nur der Konstruktor `v65CreateMatch(context, options)` schreibt `match.si = {revision:183, clockRate, packages:{clock,options,offball,finish,defence,setplay,field}, params:{<paket>:{…}}}`. `clockRate` ist vorerst `MATCH_SPEED` (0,78). Der Marker ist tief eingefroren.
- `options.si` ist nur für Harness und Messung gedacht: `{packages, params, clockRate}` überschreibt die Vorgaben; `false` erzeugt eine Partie ohne Marker (Regeln 182). Unbekannte Pakete, Parameter oder Typwechsel lösen einen Fehler aus.
- Vorgaben meldet jedes Modul mit `v183RegisterDefaults(paket, {...})` an (JSON-Daten, Doppelanmeldung mit anderem Wert ist ein Fehler). Ein Welle-1-Paket schaltet seinen Schalter für neue Partien erst bei Abschluss in seinem Modul mit `v183EnableByDefault(paket)` ein.
- `v183Param(m,'<paket>.<name>')` liefert für markierte Partien den gespeicherten Wert, für einen später ergänzten Parameter die angemeldete Vorgabe. Neue Parameterschlüssel brauchen deshalb eine Vorgabe, die für gespeicherte 183-Partien ohne diesen Schlüssel neutral ist. Unmarkierte Partien lesen `undefined`; im Testmodus (`v183StrictParams(true)`, in `native183-scenes.cjs` eingeschaltet) ist das ein Fehler, damit fehlendes Gating auffällt.
- `v65Snapshot` kopiert die Partie flach, `v65Restore` klont sie. `match.si` bleibt dadurch unverändert erhalten; der Klon wird beim ersten Zugriff über `v183Marked`/`v183Active` wieder eingefroren. Altpartien erhalten beim Laden kein `si`. An `v65Snapshot`/`v65Restore` (B19) war nichts zu ändern.

## Schnittstellen (`dist/match-si-core-v183.js`)

| Signatur | Eigentümer | Verhalten in SI-F |
| --- | --- | --- |
| `v183Active(m,pkg)`, `v183Marked(m)`, `v183Param(m,key)`, `v183StrictParams(on)` | SI-F | Marker und Schalter; Parameter wie oben. Unbekannter Paketname ist ein Fehler. |
| `v183Rate(m)`, `v183Seconds(m)`, `v183ClockUnits(m,seconds)` | SI-F (Nutzung SI-0) | `MATCH_SPEED`, solange das Uhrpaket aus ist; mit Uhrpaket die gespeicherte Rate. |
| `v183Personality(p) → {shootWeight, riskWeight, dribbleWeight, followWeight, holdWeight}` | SI-F | Startformel (unten); eingefroren, schreibt nichts. |
| `v183Trace(m,entry)`, `v183TraceEntries(m)`, `v183SetTraceLimit(n)` | SI-F | Flüchtiger Ringpuffer (64, für Messungen vergrößerbar) in einer WeakMap, nur markierte Partien, nach Restore leer. |
| `v183LedgerSource(ziel,tag)` | SI-F | Fügt `event.sources` im Ledger v117 an (`v117AddSource`). Ziel ist Ereignis, Flug oder Partie (aktuelles `ballEventId`). Erlaubte Marken: `cross`, `header`, `long-shot`, `rebound`, `counter`, `one-two`. |
| `v183Radius(m,metres,legacy) → (a,b)=>boolean` | SI-F (Werte SI-4) | `metres` als Zahl oder Parameterschlüssel (nur bei aktivem Paket); sonst exakt `distance(a,b)<legacy`. |
| `v183PaceFactor(m,p,purpose,detail)`, `v183PaceReason(m,p,detail)` | SI-F (Faktoren SI-2, SI-4) | Weiche in `v157Pace`; Stub gibt den exakten Altfaktor zurück. `purpose` ist `carrier`, `purposeful`, `support` oder `base`; `v183PaceReason` verfeinert `purposeful` zu `run`, `follow`, `press`, `intercept` oder `contest`. |
| `v183FormationAnchor(m,p,t,{x,y})` | SI-5 | Weiche in `team()`; Stub gibt den Punkt unverändert zurück (Sicht Team 0, vor der Spiegelung). |
| `v183ShotEstimate(m,p,from) → {xg,aim,window,speed}` | SI-3 | Stub `v157ShotQuality` (`speed:null`). |
| `v183KeeperReach(m,keeper,range,contact,detail) → Meter` | SI-3 | Eine Weiche an drei Stellen (`detail.site`): `shot-lane`, `open-goal`, `keeper-contact`. `range` ist der Ballweg bis zum Kontaktpunkt der jeweiligen Stelle. Stub: `detail.reach`, der exakte Altwert. |
| `v183CrossEstimate(m,p,target) → {arrival,headerXg,eligible}` | SI-7 | Stub: heutige Flankenbedingung, Ankunft 0,5 (pauschale Fehlvariante). |
| `v183AirFinish(m,winner,end,detail)` | SI-7 | Kopfball-/Volleyentscheidung nach gewonnenem Luftduell: `'header'`, `'volley'` oder `null`; SI-7 entscheidet mit `v183ShotEstimate`. Stub: heutige Regel mit genau einer Ziehung („air.finish“), nur in Kopfballreichweite. |
| `v183PassEstimate(m,p,q,target) → {arrival,value,lane,returnRun}` | SI-1 | Stub: `v157Lane` und heutiger Optionswert einschließlich Rücklaufbonus +0,65 eines bestätigten Doppelpasses. |
| `v183Offers(m)` | SI-2 | Lesende Kopie von `attackFlow.intents`. |
| `v183ReboundFinish(m,winner,point)` | SI-2 | Direktabschluss nach gewonnenem freien Ball; Stub `v131OpenGoal`. |
| `v183Clearance(m,defender,point,context) → {target,out}` | SI-4 | Heutige Kopfballklärung. `context.lateralDraw`: Ziehung des Aufrufers; `context.air`: dessen Luftspielwert; `context.evaluate:true`: deterministische Mitte ohne Zufallsziehung (Schätzungen). Sonst eine Ziehung („clearance.lateral“). Mit `out:true` darf das Ziel jenseits der Linie liegen. |
| `v183RegisterDefaults(pkg,obj)`, `v183EnableByDefault(pkg)`, `v183CreateSi(options)` | SI-F | Konfiguration (siehe oben). |

Stubs nur aus markierten Pfaden aufrufen. Die Eigentümer umhüllen sie in ihrem Modul und rufen bei inaktivem Paket die Vorgängerfunktion auf.

## Module, Lade- und Buildlisten

Acht Dateien in fester Reihenfolge: `match-si-core-v183.js`, dann die leeren Paketmodule `clock`, `defence`, `finish`, `setplay`, `offball`, `options`, `field`. Sie stehen in `dist/index.html` direkt nach `world-football-flow-v159.js` und vor `match-ball-events-v117.js`. Der Ledger umhüllt damit die Paketlogik. Dieselbe Liste steht in `work/build.cjs` und in der Harnessliste `work/native130-harness.cjs`. Dort werden die Module in Basisständen vor 183 übersprungen; die Option `goalScene:true` lädt die Torszene in Produktionsreihenfolge.

## Weichen

Jede Weiche rechnet für Partien ohne `match.si` exakt wie bisher und reicht bei markierten Partien den Altwert bzw. dieselbe Zufallsziehung an den Stub.

| Stelle (Zeilen in `e4e531c0`) | Weiche | Eigentümer |
| --- | --- | --- |
| `world-offensive-quality-v157.js:42` (`v157Pace`) | `v183PaceFactor` | SI-2 (Ballführer/Läufer), SI-4 (Pressing) |
| `game.js:59` (`team(p,t,m)`) | `v183FormationAnchor`; nur mit ausdrücklich übergebener Partie. `v65PhysicalPlayer` übergibt den Konstruktionsrahmen `{geometry,si}` bzw. die Live-Partie, `v65ApplyTactics` die Partie. Die alte Sechserliga bleibt unberührt. | SI-5 |
| `world-ball-motion-v110.js:76` (Direktabschluss nach freiem Ball) | `v183ReboundFinish` | SI-2 |
| `pitch-v55.js:386-387` (Klärzweig im Luftduell) | `v183Clearance` mit Ziehung und Luftspielwert des Aufrufers | SI-7 (Ziel von SI-4) |
| `pitch-v55.js:391-392` (Kopfball-/Volleyentscheidung) | `v183AirFinish` | SI-7 |
| `match-shot-choice-v159.js:9`, `pitch-v55.js:231` (`v131OpenGoal`), `pitch-v55.js:447` (`v115KeeperContact`) | `v183KeeperReach` | SI-3 (einschließlich `v131OpenGoal`) |
| `world-pitch-actions-v99.js:25` und `:35` (Torwart-Haltezeit, auch bei gefangenem Ball) | Parameter `finish.keeperHold` (Rückfall 2,4 s), nur bei aktivem Paket `finish`; SI-0 lässt diese Zeilen aus | SI-3 |

Der Zweig in `v131OpenGoal` mit `v183KeeperReach` wird nur ohne Flusskennung 159 erreicht, also in neuen Partien derzeit nicht; der Test ruft ihn gezielt auf.

## Persönlichkeit

`shootWeight = Rolle × (0,85 + 0,015·(calm−10) + 0,01·(dec−10))`, `riskWeight = Rolle × (0,9 + 0,01·(dec−10))`. Für `dribbleWeight` (× (0,9 + 0,01·(calm−10))), `followWeight` (× (0,85 + 0,02·(ant−10))) und `holdWeight` (× (0,95 + 0,01·(calm−10))) gelten SI-F-Startvorschläge. Rollengewichte stehen in `V183_PERSONALITY`. Ohne `tacticalRole` gilt die Linie; ohne bekannte Linie gilt 1. Fehlende mentale Werte zählen als 10, Werte werden auf 1–20 begrenzt. `fin`/`pas`/`tec` gehen nicht ein. Kalibrierung in SI-K.

### Vorgaben für SI-1 und SI-K

- `riskWeight` wirkt nur im Nutzen-Risiko-Term der Optionswahl, nie auf Passlinienbreite oder Ankunftswahrscheinlichkeit. Diese hängen an `pas`/`tec` und der Geometrie.
- Bis zur ersten 192er-Serie nutzt SI-1 eine enge wirksame Rollenspanne (≈0,85–1,15), z. B. durch Begrenzen der Gewichte; die Rohwerte aus `v183Personality` bleiben unverändert.
- SI-K darf die Faktoren für Dribbling, Nachsetzen und Halten auf 1,0 setzen, wenn sie keinen messbaren Nutzen bringen.
- Neue Parameterschlüssel nur mit einer Vorgabe, die für gespeicherte Partien ohne diesen Schlüssel neutral ist (siehe `v183Param`).

## Werkzeuge und Prüfungen

- `work/native183-scenes.cjs`: Konstruktorpartien auf einer v61-Karriere mit SI-Überschreibungen, festen Rollen und JSON-Checkpoint, dazu die v182-Szenen. Großes Feld mit sechs Feldspielern wie in der Produktion. Der Takt folgt `v183Rate`. Der Parameter-Testmodus ist eingeschaltet. v61-Spieler haben kein `calm`/`ant`/`dec`; die Persönlichkeit nutzt dort den Rückfall 10.
- `work/check-old-matches-v183.cjs [baseRoot]`: unmarkierte und 182-Szenen sowie Konstruktorpartien ohne Marker byteidentisch gegen `e4e531c0`. Konstruktorpartien mit Marker 183 und allen Paketen aus sind digestgleich ohne `match.si`. Die Uhrrate wird nur auf positiv und endlich geprüft. Fehlt `work/tmp-base183`, wird es per `git archive` angelegt.
- `work/test-si-core-v183.cjs`: Schnittstellen, Marker, Einfrieren, Konfiguration, Uhr, Persönlichkeit, Protokoll, Ledger, Weichen, Stubs, Lade-/Buildlisten, Restore-Rundlauf.
- `work/measure-si183.cjs`: native Messung ohne Dateikopien.
  - Optionen: `--packages=`, `--params=`, `--clockRate=`, `--traceLimit=`, `--dist=` (Basisbaum), `--compare=a,b [--expectIdentical]`.
  - Der Takt folgt `v183Rate`; Diagnoseoptionen erscheinen im Dateinamen.
  - Ports 4250–4269, höchstens sechs Seiten je Lane.
  - Ergebnisse liegen in `outputs/si183/`, die Warteschlange in `outputs/si183/queue.log`; `dist` wird vor und nach dem Lauf gehasht.

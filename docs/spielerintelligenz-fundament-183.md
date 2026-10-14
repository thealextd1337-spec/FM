# Spielerintelligenz 183: Fundament SI-F

Stand: 14. Oktober 2026. Branch `feat/si-foundation` auf `integration/si-r133` (`7bd0d228`). Umsetzung des Pakets SI-F aus dem [Umsetzungsplan](spielerintelligenz-umsetzungsplan-2026-10-14.md) (Abschnitte 6, 7, 8.3, 9). Verhalten unverändert: Neue Partien tragen den Marker 183, alle Paketschalter sind aus.

## Marker und Konfiguration

- Nur der Konstruktor `v65CreateMatch(context, options)` schreibt `match.si = {revision:183, clockRate, packages:{clock,options,offball,finish,defence,setplay,field}, params:{<paket>:{…}}}`. `clockRate` ist vorerst `MATCH_SPEED` (0,78).
- `options.si` ist nur für Harness und Messung gedacht: `{packages, params, clockRate}` überschreibt die Vorgaben; `false` erzeugt eine Partie ohne Marker (Regeln 182). Unbekannte Pakete, Parameter oder Typwechsel lösen einen Fehler aus.
- Vorgaben meldet jedes Modul mit `v183RegisterDefaults(paket, {...})` an (JSON-Daten, Doppelanmeldung mit anderem Wert ist ein Fehler). Ein Welle-1-Paket schaltet seinen Schalter für neue Partien erst bei Abschluss in seinem Modul mit `v183EnableByDefault(paket)` ein.
- `v65Snapshot` kopiert die Partie flach, `v65Restore` klont sie. `match.si` bleibt dadurch unverändert erhalten. Altpartien erhalten beim Laden kein `si`. An `v65Snapshot`/`v65Restore` (B19) war nichts zu ändern.

## Schnittstellen (`dist/match-si-core-v183.js`)

| Signatur | Verhalten in SI-F |
| --- | --- |
| `v183Active(m,pkg)`, `v183Marked(m)`, `v183Param(m,'<paket>.<name>')` | Marker 183 und Schalter; Parameter der Partie, sonst angemeldete Vorgabe. Unbekannter Paketname ist ein Fehler. |
| `v183Rate(m)`, `v183Seconds(m)`, `v183ClockUnits(m,seconds)` | `MATCH_SPEED`, solange das Uhrpaket aus ist; mit Uhrpaket die gespeicherte Rate. |
| `v183Personality(p) → {shootWeight, riskWeight, dribbleWeight, followWeight, holdWeight}` | Startformel (unten); eingefroren, schreibt nichts. |
| `v183Trace(m,entry)`, `v183TraceEntries(m)` | Flüchtiger Ringpuffer (64) in einer WeakMap, nur markierte Partien, nach Restore leer. |
| `v183LedgerSource(ziel,tag)` | Fügt `event.sources` im Ledger v117 an (`v117AddSource`). Ziel ist Ereignis, Flug oder Partie (aktuelles `ballEventId`). Erlaubte Marken: `cross`, `header`, `long-shot`, `rebound`, `counter`, `one-two`. |
| `v183Radius(m,metres,legacy) → (a,b)=>boolean` | `metres` als Zahl oder Parameterschlüssel (nur bei aktivem Paket); sonst exakt `distance(a,b)<legacy`. |
| `v183PaceFactor(m,p,purpose,detail)`, `v183PaceReason(m,p,detail)` | Weiche in `v157Pace`; Stub gibt den exakten Altfaktor zurück. `purpose` ist `carrier`, `purposeful`, `support` oder `base`; `v183PaceReason` verfeinert `purposeful` zu `run`, `follow`, `press`, `intercept` oder `contest`. |
| `v183FormationAnchor(m,p,t,{x,y})` | Weiche in `team()`; Stub gibt den Punkt unverändert zurück (Sicht Team 0, vor der Spiegelung). |
| `v183ShotEstimate(m,p,from) → {xg,aim,window,speed}` | Stub `v157ShotQuality` (`speed:null`). |
| `v183CrossEstimate(m,p,target) → {arrival,headerXg,eligible}` | Stub: heutige Flankenbedingung, Ankunft 0,5 (pauschale Fehlvariante). |
| `v183PassEstimate(m,p,q,target) → {arrival,value,lane}` | Stub: `v157Lane` und heutiger Optionswert. |
| `v183Offers(m)` | Lesende Kopie von `attackFlow.intents`. |
| `v183Clearance(m,defender,point,context) → {target,out}` | Heutige Kopfballklärung; einzige Ziehung `clearance.lateral`, alternativ `context.lateralDraw`. |
| `v183RegisterDefaults(pkg,obj)`, `v183EnableByDefault(pkg)`, `v183CreateSi(options)` | Konfiguration (siehe oben). |

Stubs nur aus markierten Pfaden aufrufen. Die Eigentümer umhüllen sie in ihrem Modul und rufen bei inaktivem Paket die Vorgängerfunktion auf.

## Module, Lade- und Buildlisten

Acht Dateien in fester Reihenfolge: `match-si-core-v183.js`, dann die leeren Paketmodule `clock`, `defence`, `finish`, `setplay`, `offball`, `options`, `field`. Sie stehen in `dist/index.html` direkt nach `world-football-flow-v159.js` und vor `match-ball-events-v117.js`. Der Ledger umhüllt damit die Paketlogik. Dieselbe Liste steht in `work/build.cjs` und in der Harnessliste `work/native130-harness.cjs`. Dort werden die Module in Basisständen vor 183 übersprungen; die Option `goalScene:true` lädt die Torszene in Produktionsreihenfolge.

## Weichen

- `world-offensive-quality-v157.js:42` (`v157Pace`): Der Altfaktor wird unverändert berechnet; nur bei `match.si` geht er durch `v183PaceFactor`.
- `game.js:59` (`team(p,t,m)`): Der Anker wird nur mit ausdrücklich übergebener markierter Partie gefragt. Dazu übergeben `v65PhysicalPlayer` (Konstruktionsrahmen `{geometry,si}` bzw. Live-Partie) und `v65ApplyTactics` die Partie. Die alte Sechserliga ruft `team()` ohne Partie auf und bleibt unberührt.

## Persönlichkeit

`shootWeight = Rolle × (0,85 + 0,015·(calm−10) + 0,01·(dec−10))`, `riskWeight = Rolle × (0,9 + 0,01·(dec−10))`. Für `dribbleWeight` (× (0,9 + 0,01·(calm−10))), `followWeight` (× (0,85 + 0,02·(ant−10))) und `holdWeight` (× (0,95 + 0,01·(calm−10))) gelten SI-F-Startvorschläge. Rollengewichte stehen in `V183_PERSONALITY`. Ohne `tacticalRole` gilt die Linie; ohne bekannte Linie gilt 1. Fehlende mentale Werte zählen als 10, Werte werden auf 1–20 begrenzt. `fin`/`pas`/`tec` gehen nicht ein. Kalibrierung in SI-K.

## Werkzeuge und Prüfungen

- `work/native183-scenes.cjs`: Konstruktorpartien auf einer v61-Karriere mit SI-Überschreibungen, festen Rollen und JSON-Checkpoint, dazu die v182-Szenen.
- `work/check-old-matches-v183.cjs [baseRoot]`: unmarkierte und 182-Szenen sowie Konstruktorpartien ohne Marker byteidentisch gegen `e4e531c0`. Konstruktorpartien mit Marker 183 und allen Paketen aus sind digestgleich ohne `match.si`. Fehlt `work/tmp-base183`, wird es per `git archive` angelegt.
- `work/test-si-core-v183.cjs`: Schnittstellen, Marker, Konfiguration, Uhr, Persönlichkeit, Protokoll, Ledger, Weichen, Stubs, Lade-/Buildlisten, Restore-Rundlauf.
- `work/measure-si183.cjs`: native Messung ohne Dateikopien mit `--packages=`, `--params=`, `--clockRate=`, `--dist=` (Basisbaum), `--compare=a,b [--expectIdentical]`. Ports 4250–4269, höchstens sechs Seiten je Lane. Ergebnisse liegen in `outputs/si183/`, die Warteschlange in `outputs/si183/queue.log`; `dist` wird vor und nach dem Lauf gehasht.

# Native Matchsimulation: Reviewkorrekturen v182

Stand: 14. Oktober 2026. Ausschliesslich Worktree fix-r132-engine-b, Branch fix/r132-engine-b. Ausgangsstand 094adb96; Basisvergleich f2458c1f. Engine-Commit 65524a24. Kein Push, Deploy, Footerwechsel oder Dokumentationsupdate in CHANGELOG, Bugliste und Entscheidungen.

## Umsetzung

- Markierte fallende Baelle speichern chase.airPids pro Team. v132AirChasers wird daraus mit den restaurierten Spielerobjekten aufgebaut; support und Hauptjaeger bleiben disjunkt. Alte Partien erhalten diese Daten nicht.
- Hauptjaeger und Unterstuetzer erhalten beide den nativen Sprintfaktor 1,58. Torwartjagd v180, Raumpaesse v150, v157Move und set-pieces-v50 bleiben bytegleich.
- Aktions- und Kontaktzweikaempfe beanspruchen dieselbe gespeicherte Tick-Sperre erst bei einem tatsaechlichen, geometrisch zulaessigen Versuch. Verlorene Versuche sperren weitere Verteidiger in diesem Tick; JSON-Restore erhaelt die Sperre.
- Die Hakenbeobachtung haelt ihre Referenzrichtung fuer bis zu 0,5 Sekunden, statt sie nach jedem kleinen Drehschritt zu ersetzen. Ab rund 20 Grad beginnt die bestehende faehigkeitsabhaengige Reaktion. Referenz und Reaktionsfenster liegen im Matchzustand.
- Beim Graetschenkoerperkontakt wird zusaetzlich die aktuelle Hinterposition entlang der Bewegung in Metern geprueft. Beginn von hinten bleibt ebenfalls massgeblich. Die Zusatzregel ist markergebunden.
- Nach dem ersten Vollvergleich: nur der naechste bereite Verteidiger erhaelt unmittelbares Bodenpressing; zusaetzliche Kontaktchecks warten 250 ms nach einem Versuch. Normale Aktionsentscheidungen behalten ihre Termine. Flugballverteidigung bleibt bei ihrer bisherigen Anzahl.
- Messskript weist Stehtackling-Versuche als tackleAttempts minus slideAttempts aus; gewonnene Stehtacklings und Graetschen stehen separat.

## Vollpartien

Gepaarte Seeds 0..19 je Feldgroesse: Standard mit 5 Feldspielern, grosses Feld mit 6. Pro Stand 40 volle Browser-Engine-Partien. Vier Staerkegruppen mit je 10 Partien: beide Teams niedrig, beide hoch, starkes Heimteam, starkes Auswaertsteam. Testwerte um 8 beziehungsweise 16 mit individuellen Abweichungen; persoenliche Caps werden nur in der Fixture passend erhoeht. Alle Staende verwenden identische Startdaten und RNG-Seeds. Es werden weder Produktionsteams noch gespeicherte Karrieren angepasst.

Mittelwerte je Partie:

| Messwert | Basis f2458c1f | Vor Review 094adb96 | Korrigiert vor Balance | Final 65524a24 |
| --- | --- | --- | --- | --- |
| Partien | 40 | 40 | 40 | 40 |
| Simulationszeit inkl. Unterbrechungen (Min.) | 3.24 | 2.83 | 2.83 | 2.86 |
| Schuesse | 4.7 | 3.68 | 3.58 | 3.85 |
| Aufs Tor | 1.98 | 1.45 | 1.35 | 1.35 |
| Tore | 1.5 | 1.15 | 1.05 | 1.13 |
| Fouls | 6.5 | 4.3 | 4.18 | 4.43 |
| Stehtackling-Versuche | 14.23 | 15.8 | 15.28 | 12.95 |
| Stehtacklings gewonnen | 2.58 | 4.1 | 3.43 | 2.7 |
| Graetschen-Versuche | 10.2 | 7.18 | 7.43 | 7.25 |
| Graetschen gewonnen | 1.27 | 1.25 | 1.2 | 1.35 |
| Zweikaempfe gewonnen gesamt | 3.85 | 5.35 | 4.63 | 4.05 |
| Ballgewinne | 7.65 | 9.75 | 9 | 7.85 |
| Ballbesitzwechsel | 14.3 | 14.85 | 14.3 | 13.5 |
| Paesse | 51.95 | 53.5 | 53.05 | 55.03 |

Ballgewinne = gewonnene stehende/gleitende Zweikaempfe plus native Interceptions; keine separate Zaehlung jeder freien Ballaufnahme. Ballbesitzwechsel = Teamwechsel zwischen beobachteten kontrollierten Ballbesitzen, auch ueber freie Baelle und Standards hinweg. Simulationszeit = Anzahl 50-ms-Schritte einschliesslich Unterbrechungen; kein Benchmark fuer Renderleistung oder echte Geraete.

Feldgroessen, finale Werte gegen Basis:

| Feld/Stand | N | Min. | Schuesse | Aufs Tor | Tore | Fouls | Stehtacklings | Graetschen | Ballgewinne | Besitzwechsel |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| standard/base | 20 | 3.45 | 5.5 | 2.4 | 1.75 | 8 | 14.95 | 11.7 | 8.05 | 15.5 |
| large/base | 20 | 3.03 | 3.9 | 1.55 | 1.25 | 5 | 13.5 | 8.7 | 7.25 | 13.1 |
| standard/new | 20 | 2.85 | 4.45 | 1.5 | 1.35 | 4.45 | 13.65 | 7.45 | 7.05 | 13.15 |
| large/new | 20 | 2.87 | 3.25 | 1.2 | 0.9 | 4.4 | 12.25 | 7.05 | 8.65 | 13.85 |

Die Entschaerfung erhoeht die Schuesse von 3,58 auf 3,85 und senkt gewonnene Zweikaempfe von 4,63 auf 4,05. Gegen die Basis bleiben Schuesse etwa 18 % und aufs Tor etwa 32 % niedriger. Nach der kuerzeren Simulationszeit normalisiert sind es rund 7 % weniger Schuesse pro Minute; aufs Tor bleibt ebenfalls niedriger. Die Verteidigung gewinnt final nahezu gleich viele Zweikaempfe und Baelle wie die Basis. Das ist eine moderate Entschaerfung, keine behauptete vollstaendige Chancenparitaet. 40 gepaarte Partien und kuenstliche Staerkegruppen sind eine begrenzte Balanceprobe, keine globale Produktkalibrierung.

Staerkeunterschiede: In den 20 finalen starken/ schwachen Paarungen erzielen starke Teams 19:11 Tore, 47:41 Schuesse, 11 Siege und 4 Remis. In den gezielten B03-Szenen entkommen schnelle Angreifer gegen schwache Verteidiger in 47,73 %, die umgekehrte Paarung in 0 %.

## Gezielt vorher/nachher

| Befund/Messwert | Vor Review | Final |
| --- | --- | --- |
| Luftball-JSON Tick 20/21/22, Team 1/gross/Seed 2 | 3/3 abweichend | 3/3 identisch |
| Erweiterte Luftball-Checkpoints (24 Szenen x 5 Zeitpunkte) | nicht erhoben | 120/120 identisch |
| Zwei kontaktfaehige Verteidiger, Aktions- und Kontaktpfad | 2 Versuche/Tick | 1 Versuch/Tick, auch nach Restore |
| Native geglaettete Haken 30/60/90 Grad | 0 verzoegerte Uebernahmen | alle Winkel mit verzoegerter Uebernahme |
| Reaktion bei nativem 60-Grad-Haken, schwach/stark | keine verzoegerte Uebernahme | 0,30 / 0,15 s |
| Sprintfaktor Hauptjaeger fallender Baelle | 1,15 statt 1,58 | 1,58 |
| Graetsche beginnt vorn, Koerperkontakt nach Haken hinten | 0 Fouls | 1 Foul; unmarkierter Kontrollfall bleibt legal |
| B03 torseitige Position (880 Szenen), markiert | 82,73 % | 82,50 % |
| B03 Vorbeilaufen ohne Versuch je 100 Szenen, markiert | 0,80 | 0,57 |
| B03 Fouls von hinten je 100 Szenen, markiert | 0,57 | 0,91 |
| B03 Fouls von hinten je 100 Szenen, unmarkierte Basis | 19,77 | unveraendert |

Die kleine Zunahme markierter Hinter-Fouls passt zur jetzt auch beim Kontakt durchgesetzten Nutzerregel; sie bleibt weit unter der unmarkierten Basis. Die Torseiten- und Faehigkeitsziele werden weiter erreicht.

## Hohe Folgeballe als B10-Naeherung

400 gepaarte markierte Szenen aus der vorhandenen Luftball-Fixture, gespiegelt fuer beide Teams, Feldgroessen und Seitenlinien. Erster Aufprall 0,5..4 Meter innerhalb der Linie, seitliche Restgeschwindigkeit 2..6 m/s. Die Messung tauscht nur den vorigen v182LooseChasing-Pfad gegen den korrigierten Sprintpfad: eine Attribution des Sprintfaktors, keine Ecken-Reimplementierung.

| Messwert | Vorher | Nachher |
| --- | --- | --- |
| Szenen | 400 | 400 |
| Bei erster Landung ohne Feldspieler innerhalb 1 m | 400 | 399 |
| Unerreicht gelandet und danach Aus | 317 | 313 |
| Timeouts | 0 | 0 |
| Mittlere Aufloesungszeit (s) | 2,1765 | 2,0946 |

Der Effekt ist klein: 79,25 % auf 78,25 % in dieser bewusst schwierigen Rand-Szene. Die 400 normalen vorhandenen Luftball-Szenen erzeugen in beiden Staenden 0 Ausfaelle ins Aus; sie haben fuer diese Frage einen Bodeneffekt. Der gemeldete Wert von rund 16,5 % echten hohen Ecken wurde hier nicht repliziert. B10-Ecken-Code liegt auf einem anderen Branch und wurde weder geaendert noch abgenommen.

## Pruefungen und Belege

- PASS test-loose-ball-v182: 17 Checks, 120 Szenen je Markierungsstand; Luftball-Checkpoints ergaenzt.
- PASS test-defensive-pursuit-v182: 19 Checks, 880 Szenen je Stand.
- PASS test-review-fixes-v182: 13 gezielte Checks, auch echte native Schrittfolge, gespeicherte Tick-Sperre, natuerlich geglaettete Haken und Kontakt-Hinterposition.
- PASS check-old-matches-v182: 158 unmarkierte Szenen einschliesslich Zufall und P02 bytegleich zur Basis.
- PASS erster Vollvergleich: 40 base, 40 old, 40 before, 40 korrigierte new und 2 new-json. Alle 40 base/old-Digests und beide JSON-Replays identisch.
- PASS finaler Vollvergleich: 40 finale new und 2 neue new-json. Unveraenderte base/old/before-Vergleichszeilen aus dem bestandenen ersten Lauf wiederverwendet und im Bericht als Herkunft ausgewiesen; finaler unmarkierter Szenenvergleich erneut bestanden. Beide finalen JSON-Replays identisch.
- PASS run-defensive-regression-v182 mit check-defensive-line-v126: 54 Szenen, keine Browserfehler.
- FAIL run-defensive-regression-v182 mit check-free-ball-positioning-v124: first.retreat > 0 scheitert bereits auf dem Review-Ausgangsstand 094adb96 und identisch auf dem finalen Build (erste kontrollierte Szene: retreat=0). Die historische Assertion erwartet sofortige Rueckwaertsbewegung im ersten Tick; sie ist keine gruene Abnahme des heutigen geglaetteten Bewegungsmodells. Assertion und Gate wurden nicht abgeschwaecht. Belege free-ball-before.log und final-free-ball-positioning.log. Dieser bestehende Gatefehler bleibt offen.
- PASS test-v55: vollstaendige Match-/Karrierepruefung.
- PASS run-native130-tests: 34 Keeper- plus 22 Restartchecks.
- PASS build.cjs und ui-redesign/shared/verify-build: 26 eingebettete Assets, identische Offlinekopien, PROTOTYP 131.
- PASS zusaetzlicher Quellen-/Buildabgleich aller drei geaenderten Controller. Dist vor/nach jeweils reine LF-Zeilenenden. world-offensive-quality-v157.js, world-space-passes-v150.js und set-pieces-v50.js bytegleich zum Ausgangsstand.

Lokale Belege: outputs/match-v182/review/{full-matches-initial.json,full-matches-final.json,air-followups.json,air-checkpoints.json,focused.json,final-*.json,final-*.log}; final-build-source.json enthaelt SHA-256 und Zeilenenden. Der Zwischenstand vor Entschaerfung ist unter prebalance-world-football-flow-v159.js hashgeprueft gesichert. outputs/match-v182/regression/ enthaelt die historischen Gates. Generierte HTML-Dateien werden nicht committed; die zwei getrackten Buildkopien bleiben absichtlich lokal geaendert.

Reproduktion (Browserbefehle mit der gebuendelten Node-24-Laufzeit, Port 4215):

```powershell
node work/test-loose-ball-v182.cjs
node work/test-defensive-pursuit-v182.cjs
node work/test-review-fixes-v182.cjs
node work/check-old-matches-v182.cjs
node work/measure-air-followups-v182.cjs
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/run-full-matches-v182.cjs --seeds=20 --review-before --out=outputs/match-v182/review/replay.json
node work/build.cjs
node work/ui-redesign/shared/verify-build.cjs
node work/generate-user-meshy-match.cjs
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/run-defensive-regression-v182.cjs work/check-defensive-line-v126.cjs
& 'C:/Users/alex/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' work/run-defensive-regression-v182.cjs work/check-free-ball-positioning-v124.cjs
node work/test-v55.cjs
node work/run-native130-tests.cjs
```

## Geaenderte Dateien

Engine: dist/world-football-flow-v159.js, dist/world-backpedal-v108.js, dist/pitch-v56.js.
Tests/Messung: work/test-loose-ball-v182.cjs, work/test-review-fixes-v182.cjs, work/run-full-matches-v182.cjs, work/measure-air-followups-v182.cjs. Dieser Bericht: work/review-v182-report.md.

Grenzen: keine Unity-/Android-/Live-Abnahme, keine B10-Eckenintegration, keine globale Balancekalibrierung, historisches Freie-Ball-Gate weiterhin rot. Keine weiteren Produktfunktionen oder Spielstandmigration.

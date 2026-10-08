# P02: Effektive Fähigkeiten und Bewegung

Stand: 8. Oktober 2026. Reines Modul für Welle 2, lokal geprüft und noch nicht in den bestehenden Fähigkeitspfad eingebunden. Maßgeblich sind [Welle 2](wave2.md), [P02](../agentenauftraege/01-spieler-karriere-taktik.md#p02--effektive-fähigkeiten-frischeverbrauch-und-erholung) und die [bestätigten Müdigkeitsentscheidungen](../muedigkeit-faehigkeiten-plan.md). Offene Kurven benötigen ausdrücklich übergebene Parameter.

Quelle: `dist/player-effective-abilities.js`. Browserexport `D6EffectiveAbilities`, Nodeexport `module.exports`. Keine Abhängigkeit zu DOM, Spielzustand, Uhr, Zufall oder Speicherung. Eingaben werden nicht verändert; Ausgabe enthält ausschließlich neu berechnete interne Werte. Grundwerte, Caps, Talent und Körpergröße werden nicht gespeichert oder verändert. Ausgabe und Parameter gehören nicht an UI-Renderer.

## Schnittstellen

`effectiveAbilities(skills, freshness, formContext, pressureContext, approvedParameters) -> effectiveSkills`

- `skills`: alle 13 Schlüssel `tec,pas,fin,tak,pos,spd,sta,air,gk,calm,ant,dec,str`, jeweils endliche dauerhafte Werte 1–20. Ergebnis ist ein neuer gleich benannter Fähigkeitsdatensatz im Bereich 1–20. Keine gerundeten Farbstufen und keine Änderung des dauerhaften Datensatzes.
- `freshness`: endliche Frische; Werte außerhalb 0–100 werden auf den zulässigen Bereich begrenzt.
- `formContext.multipliers`: explizite endliche Multiplikatoren für jeden Schlüssel außer `str`, mindestens 0. Fehlende Multiplikatoren sind ein Fehler. Der Integrator liefert die bereits beschlossene Formwirkung; dieses Modul erzeugt weder neue Formverteilungen noch eine eigene Formstufe. Ein übergebener `str`-Multiplikator wird bewusst ignoriert.
- `pressureContext.actualPressure`: ausdrücklicher Boolean für tatsächlichen Gegner- oder Zeitdruck. Ein Rollen-/Taktiklabel genügt nicht. Der Druckkontext schaltet allein den bestätigten Müdigkeitseffekt auf Ruhe ein; es wird keine neue Druck-/Fehlerverteilung erzeugt.
- `approvedParameters.anticipationCurve` und `.decisionCurve`: ausdrücklich übergebene Kurven; fehlen sie, gibt es keine stillschweigende Ersatzkurve.

`fatigueMultipliers(freshness, pressureContext, approvedParameters) -> multipliers` liefert dieselben reinen Müdigkeitsfaktoren für interne Abnahme. `SKILL_KEYS` ist der unveränderliche gemeinsame Schlüsselkatalog.

`movementLimits({maxSpeed, acceleration}, freshness, approvedParameters) -> {maxSpeed, acceleration, maxSpeedMultiplier, accelerationMultiplier}`

Die Eingabe sind bereits abgeleitete physikalische Bewegungsgrößen, endlich und mindestens 0. `approvedParameters.maxSpeedCurve` und `.accelerationCurve` sind Pflicht. Der Integrator berechnet die Basisbewegung aus dauerhafter Geschwindigkeit und freigegebener Formwirkung, danach wendet er diese Faktoren genau einmal an. Es wird keine Fähigkeit „Antritt“ erzeugt.

## Bestätigte Rechnung

`t = clamp((80 - F) / 50, 0, 1)`, `q = t²`.

| Fähigkeit | Müdigkeitsfaktor |
| --- | --- |
| `tec,pas,fin,gk` | `1 - 0.10*q` |
| `tak,air` | `1 - 0.15*q` |
| `calm` unter tatsächlichem Druck | `1 - 0.20*q` |
| `calm` ohne tatsächlichen Druck | `1` |
| `str` | `1 - 0.20*(100-F)/100`; kein Formfaktor |
| `pos,sta,spd` | `1`; kein zusätzlicher Müdigkeitsabzug |
| `ant,dec` | `1 - 0.15*expliziteKurve(F)` |

Für alle anderen Werte gilt `clamp(Grundwert * ausdrücklicherFormfaktor * Müdigkeitsfaktor, 1, 20)`. `pos` und `sta` erhalten hier nur die vom Integrator ausdrücklich gelieferte Formwirkung, keine Müdigkeitswirkung. `spd` bleibt als Fähigkeit ohne Müdigkeitsabzug; maximale Geschwindigkeit und Beschleunigung sinken separat um höchstens 15 beziehungsweise 25 Prozent. Diese Faktoren nicht erneut auf `spd` oder auf bereits ermüdete Bewegungsgrößen anwenden. Die Rechnung garantiert keine Fehler, Niederlagen in Zweikämpfen oder verpassten Chancen.

## Vertrag für offene Kurven

Jede Kurve ist eine ausdrücklich übergebene Liste von `[Frische, normierterVerlust]`-Paaren. Erforderliche Endpunkte: `[0,1]` und `[100,0]`. Frische steigt strikt; der Verlust bleibt zwischen 0 und 1 und steigt mit höherer Frische niemals. Zwischen den Punkten wird kontinuierlich linear interpoliert. Damit beschreibt die Liste die offen gebliebene Kurvenform; der bestätigte Höchstabzug wird erst durch das Modul zugeordnet. Eine lineare Zweipunktkurve wird ausschließlich dann verwendet, wenn sie ausdrücklich übergeben wird.

Die Tests enthalten gekennzeichnete Kandidatenkurven, unter anderem lineare Antizipation/Maximalgeschwindigkeit und mehrteilige Entscheidung/Beschleunigung. Diese Kurven sind keine Produktfreigabe und keine Moduldefaults. Vor Produktaktivierung müssen die konkreten vier Kurven freigegeben und die Zuordnung zu echten Matchentscheidungen und physikalischen Bewegungspfaden geprüft werden.

## Bestehende Integrationskette und Doppelabzüge

Lesend geprüft: `dist/index.html` lädt `game.js` → `player-status-v51.js` → `strength-v55.js` → `world-physical-v65.js`. Der ursprüngliche `ability`-Pfad in `game.js:62` wird in `strength-v55.js:79` durch die 1–20-Rechnung ersetzt. Diese zieht Frische und zeitabhängige Konditionsmüdigkeit ab, ergänzt Alter/Form/Fremdposition/Aggression. `world-physical-v65.js:404` umschließt diesen Pfad und korrigiert die laufende Vereinsweltfrische und Eintrittszeit erneut. `player-status-v51.js:21` begrenzt die bestehende effektive Form zusätzlich nach Frische.

Der Integrator muss für ausdrücklich neue Prüfwelten einen einzigen Ableitungspunkt bestimmen. Ein zusätzlicher globaler Wrapper über dem alten Pfad würde dessen pauschale Abzüge behalten. Ein bereits nach Frische begrenzter Formkontext darf nicht unbemerkt nochmals die neue Müdigkeitskurve enthalten; die Form-/Druckzuordnung bleibt ein ausdrückliches Integrationsgate. Alterung gehört zu dauerhaften Werten/P03, Routine/Fremdposition und Aggression müssen vom zuständigen Vertrag getrennt zugeordnet werden. Dieses Modul ersetzt keine bestehende Funktion und ändert keinen Loader. Altkarrieren werden nicht ergänzt oder umgerechnet.

## Nachweise

`work/test-player-effective-abilities.cjs`: sieben bestandene Prüfgruppen. Bestätigte Frischereferenzen 100/80/60/50/40/30/0, Kraft 12→10,8→9,6, Druckabhängigkeit, explizite Form ohne Kraftwirkung, Grenzen und Monotonie in 0,25-Punkt-Schritten, kontinuierliche Übergänge, getrennte Bewegungswirkung, unveränderte eingefrorene Basis-/Cap-/Höhen-/Talentdaten, ungültige oder fehlende Parameter und Browser-/Nodeexports. Ausführung mit dem gebündelten Node-Runtime am 8. Oktober 2026 erfolgreich.

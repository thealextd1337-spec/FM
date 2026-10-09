# Lesender Vorabcheck zum Unity-Paket 07 (Claude, Runde 2026-10-10)

Dieser Lauf wurde nicht durch ein Rate-Limit abgebrochen. Ich habe nur gelesen und Hashes im Arbeitsspeicher berechnet. Ich habe keine Dateien geschrieben und weder Editor, Sync, Build, CLI-Tests, Browser oder Gerät benutzt. Es gibt keinen Commit und keinen Push. Alle Befunde unten stammen aus dem Quelltext; neue Bild- oder Laufzeitprüfungen habe ich nicht gemacht.

## 1. Ausgangsstand (im tatsächlichen Worktree neu gehasht)

- **Worktree und Stand:** Branch `codex/3d-quality-stadiums-20261009`, HEAD `2ffd54a`. Unter `prototypes/match-engine-unity/` gibt es keine uncommitteten Änderungen. Die fremden Änderungen liegen in `dist/`, `outputs/` und `work/` und bleiben unberührt.
- **Quellenkennung:** In `prototypes/match-engine-unity/source-identity.json` steht `sourceId 00700557d9800dc579ee021530d76b316eee9cba0498b153aaae07a5cb9d271a`. Eine Neuberechnung über die 40 Quellen nach dem Verfahren von `generate-identity.cjs` ergibt denselben Wert. `ProbeBuildIdentity.cs` enthält dieselbe ID.
- **Buildkennung:** `outputs/platform/unity-web/probe-build.json` stimmt überein:
  - `sourceId` ist identisch.
  - Alle 31 `sourceFiles`-Hashes passen zur aktuellen Datei.
  - Die vier Build-Dateien passen nach Größe und Hash, ebenso die `?v=`-Hashes von loader, data, framework und wasm.
  - `assetHash` und `catalogHash` stimmen ebenfalls.
- **Nicht geprüft:** Den Stand des Unity-Projekts `G:/unity/My project` habe ich bewusst nicht gelesen, weil Sync und Editor exklusiv bei Root liegen.

## 2. Bewegung: was fehlt und was riskant ist

**Clipbestand (aus dem Audit-Report `unity-959aea-final`)**
- Laufrichtungen: Vorwärts ist mit walking, run_fast6 (jog), running (Ballführer), run_fast4 und sprint_forward abgedeckt. Rückwärts gibt es back_walk und back_left (als `fastBackClip`).
- Übergänge: brake_meshy, turn_run, turn_walk und turn_idle jeweils links und rechts.
- Seitlich gibt es nur keeper_shuffle.
- Vorhanden, aber nicht angebunden: `back_right`, `back_step_meshy`, `turn_sharp_right`, `idle_ready`, `idle_relaxed`.
- **Ganz ohne Clip:** Seitwärts- oder Kreuzschritt für Feldspieler, vordere Diagonalen, Antritt aus dem Stand, Stopp aus Gehen oder Traben und Kurvenlauf.

**Konkrete Befunde im Quelltext**

1. **Acht Richtungen sind derzeit nur Oberschenkeldrehung.** `FootballRig.StrideDirection` in `FootballAnimation.cs:339` dreht beide Oberschenkel um bis zu ±75° und die Wirbelsäule um 18 % davon. Becken (Hips) und Fußgelenk werden nicht eigens korrigiert.
   - Bei reinem Seitlauf (90°) bleiben 15° Restfehler, weil der Wert bei 75° gekappt wird (`FootballLocomotion.cs:53`). Die Fußspitzen zeigen dabei 75° nach außen, was über einer natürlichen Hüftrotation liegt.
   - Genau diese Lösung schließt das Paket ausdrücklich aus.
2. **Sprung an der Grenze zum Rückwärtslauf.** Die Grenze `Dot<-.45` (etwa 117°) hat keine Hysterese (`FootballLocomotion.cs:48`).
   - Vorwärtszweig: Gierwinkel auf +75° gekappt. Rückwärtszweig: etwa −63°.
   - Die Oberschenkel springen dadurch in einem Frame um rund 138°. Gleichzeitig wechselt der Clip mit nur 0,12 s Fade.
   - `StrideYaw` und `Lateral` sind ungeglättet und fallen bei `actual<.2` sofort auf 0.
3. **`fastBackClip = back_left` gilt für jede schnelle Rückwärtsrichtung** (`FootballSetup.cs:33`); `back_right` ist nicht angebunden.
   - `FootballStride.Measure` (`FootballAnimation.cs:29–43`) berechnet zwar den Vektor, mit dem der Standfuß nach hinten wandert, speichert aber nur dessen Betrag. Welche Richtung ein Clip zeigt, ist daher unbekannt.
   - *Quellannahme:* Dass back_left und back_right Diagonalen sind, schließe ich nur aus den Namen; gemessen ist es nicht.
4. **Kurven starten die Drehung immer wieder neu.** Ab etwa 110°/s Gierrate summiert `slowTurnAngle` je Renderframe auf, und nach jeweils 0,18 s (`turnUntil`) wird `turn-*` erneut ausgelöst.
   - `transitionAt` wird dabei neu gesetzt, also beginnt `Phase` immer wieder bei 0,45 (`FootballLocomotion.cs:41–46, 70`).
   - Ein Spieler mit 4 m/s auf 2 m Radius dreht mit rund 115°/s. In solchen Kurven entsteht genau das „ständig neu begonnene Standdrehen“, das das Paket vermeiden will.
5. **Brems- und Drehphase ignorieren den Fuß.** Bremsen startet fix bei 0,55 s mit Rate 1,8, Drehen bei 0,45 s mit Rate 1,3. Welcher Fuß gerade aufsetzt, spielt keine Rolle.
   - Bremsen gibt es nur ab `Speed>2`. Ein Stopp aus Gehen oder Traben ist ein Fade mitten im Schritt direkt zu idle, ohne Doppelstand.
6. **Kein Antritt.** Beim Übergang von idle zu Gehen läuft `StridePhase` beim alten Wert weiter. Der erste Schritt startet also nicht vom entlasteten Fuß.
   - Beschleunigung zeigt sich nur als Wirbelsäulenneigung von höchstens 7° (`Acceleration*.45`): kein Absenken des Beckens, kein Armeinsatz.
7. **Phase im Crossfade.** Ausblendende Clips laufen mit rohem `dt` weiter (`FootballAnimation.cs:223`, else-Zweig), nicht im gemeinsamen Fußfall-Zyklus. Beim Bandwechsel driften zwei Gangphasen 0,12 s lang gegeneinander, was Gleiten oder Doppelschweben erzeugen kann.
8. **Ballführer schräg: Richtung und Neigung zucken bei jedem Schritt.** Der Carrier-Reach setzt `pose.contact=true` in den Fenstern d∈[.05,.17] vor jedem Fußfall.
   - In `WorldFootballPose` (`FootballPresentation.cs:200`) wird `strideYaw` dann nicht gesetzt.
   - `FootballAnimation.Sample` (`:230`) überspringt bei Kontakt `StrideDirection` und `Lean` ganz.
   - Folge: Bei schrägem Dribbling springen beide Oberschenkel zweimal pro Zyklus um bis zu 75° auf 0 und zurück. Die Vorwärts- und Kurvenneigung verschwindet im selben Moment.
9. **Arme.** Es gibt keinen prozeduralen Armeinsatz. Bei Seit- und Diagonallauf schwingen die Arme weiter wie im Vorwärtsclip; eine Gegenrotation der Schultern zum Becken fehlt.
10. **Keeper-Nachstellen.**
    - Die Schrittfrequenz kommt aus einer Heuristik (`StridePhase*.55`), nicht aus der gemessenen Shuffle-Schrittlänge. Gemessen wird nur über die Vorwärtsclip-Länge, daher ist Gleiten wahrscheinlich.
    - `Lateral>.72` hat keine Hysterese; bei etwa 46° kann der Clip ständig zwischen Shuffle und Gehen wechseln.
    - Shuffle ist bis 4,1 m/s erlaubt. Ein Kreuzschritt wäre ab etwa 2,5–3 m/s natürlicher; der Wert ist eine Annahme.
    - Nach rechts läuft der Clip rückwärts (`-cycle`). Kinematisch ist die Richtung korrekt, aber Abdruck und Landung sind vertauscht, und das führende Bein stimmt nicht.
    - Positiv: Feldspieler bekommen nie den Shuffle.

**Bereits solide, bitte erhalten:**
- Positionen und Blickrichtung sind maßgeblich: Der Root kommt aus nativen Daten, die Blickrichtung wird nur zwischen Frames per Slerp interpoliert.
- Bei Pause oder gleicher Uhrzeit wird nicht neu gesampelt (Early-Return), Seek setzt zurück.
- Fußfall-Ausrichtung und gemessene Schrittlänge für die Vorwärtsclips.
- Hysterese der Geschwindigkeitsbänder und Schutz gegen Clip-Ping-Pong.

**Testlücke:** Der Slip-Test in `FootballGaitTests.cs:75` misst nur Vorwärtsclips bei konstanter Vorwärtsgeschwindigkeit. `FootballPresentation119Tests` prüft bei Diagonalen nur `diagonalJointChange`, also *dass* sich Gelenke bewegen, nicht ob der Fuß gleitet oder richtig zeigt.

## 3. Risiken bei Kontakt, Keeper und weiteren Themen

- **Fang-Anheftung springt möglicherweise.** Bei `VisualHeld` wird der sichtbare Ball im selben Frame direkt auf `HeldBallCentre` gesetzt (`WorldViewBridge.cs:103`).
  - Laut Kommentar in `FootballPresentation.cs:148–150` liegt der native Ball 1,1–1,9 m vom Keeper-Root entfernt.
  - *Quellannahme, per Bild zu prüfen:* Beim Anheften könnte der Ball sichtbar springen. Eine Überblendung als reine Funktion von `recovery` würde den Kontaktzeitpunkt nicht verschieben.
- **Keeper-Kontakte allgemein:** Die Fangfakten (`Held`/`VisualHeld`) sind streng und tolerant gegenüber alten Feldern. Das ist in Ordnung und sollte nicht neu gebaut werden.
  - Offen bleibt laut Audit der natürlich aufgezeichnete Ablauf Parade → Nachfassen → Aufstehen → Abspiel.
- **Kleine Kameras und Vereinsstadien:** In dieser Runde nicht auditiert. Hier liegt kein Befund vor, auch kein negativer.
- **Ausgabepfade:** Laut Paket §5 schreiben `FootballPresentation119Tests.Run`, `OffsidePresentation119Tests` und `D6Cli.OffsideEvidence` noch fest nach `iteration-119`. Das muss vor dem ersten Lauf umgestellt werden.

## 4. Höchstens fünf priorisierte Umsetzungsschritte

1. **Richtungs- und Kurvenzustand stabilisieren** (`FootballLocomotion.Sample`).
   - Laufwinkel θ relativ zur Blickrichtung kritisch gedämpft glätten, mit Ratenbegrenzung. Hysterese für Rückwärts (zum Beispiel an bei −.55, aus bei −.35) und für den Keeper-Seitwert.
   - Kurven, also anhaltende Gierrate bei Fortbewegung, nicht mehr als `turn-*` neu auslösen, sondern nur über Neigung und Richtung darstellen. Einen Drehclip nur einmal pro Dreh-Episode zulassen.
   - Stopp auch aus Gehen und Traben erkennen.
   - Ausschließlich aus empfangenen Daten, ohne Vorhersage.
   - *Abnahme:* Replay echter oder aufgezeichneter nativer Frames: Kreise mit 90, 150 und 250°/s sowie eine verrauschte 117°-Grenze. Messen: Clip-Neustarts pro Sekunde (Ziel 0 im stetigen Kurvenlauf) und maximale Änderung des Gierwinkels pro Frame.
2. **Echte acht Richtungen im Rig** (neues `FootballRig.Directional` statt `StrideDirection`, Auswahl in `StrideClip`/`LocomotionClip`).
   - `FootballStride.Gait` um die Laufrichtung und den Standanteil erweitern; die Richtung wird in `Measure` bereits berechnet.
   - Clip-Familie nach gemessener Richtung wählen: Vorwärtsbänder, `back_walk`/`back_left`/`back_right` und `back_step`.
   - Für die Seit- und vorderen Diagonalbereiche einen eigenen Baustein: Becken bis etwa 45–55° in Laufrichtung drehen, Brust zurück zur Blickrichtung. Restgierung der Oberschenkel höchstens etwa 25–30°, Fußspitze zum Becken begrenzt. Ab etwa 3 m/s seitlich Kreuzschritt.
   - Standfuß-Lock: Während der gemessenen Standphase wird der Fuß an einem Weltpunkt gehalten (zwei Knochen, begrenzt) und vor dem Abheben weich freigegeben.
   - Armgegenschwung zur Beinphase.
   - *Abnahme:* Für alle 8 Richtungen bei Gehen, Traben und Sprint auf dem echten Rig messen:
     - Gleiten der Sohle in der Standphase (Ziel unter etwa 10 % der Geschwindigkeit, mindestens unter dem heutigen Vorwärtswert);
     - Fuß-Gierung zu Laufrichtung und zu Becken;
     - Kniepol;
     - Brust-Fehler zur Blickrichtung unter 10°;
     - Sohle nicht unter dem Rasen.
   - Dazu Vorher/Nachher-Bilder in Mittelstand und beim Abdruck in derselben Fixture.
3. **Phasengerechte Übergänge** (`FootballAnimation.Sample` und `FootballLocomotion`).
   - Ein gemeinsamer Fußfall-Zyklus für alle Fortbewegungsclips, auch für ausblendende Clips (statt rohem `dt` in Zeile 223).
   - Brems- und Drehbeginn nach dem aktuell aufgesetzten Fuß wählen statt fix 0,55/0,45.
   - Antritt: erster Schritt vom entlasteten Fuß; Becken senken und Arme einsetzen aus gemessener Beschleunigung.
   - Stopp: Schrittfrequenz bis zum Doppelstand auslaufen lassen, dann idle bzw. `idle_ready`.
   - *Abnahme:* Maximale Winkelgeschwindigkeit von Hüfte und Knie in Übergangsfenstern. Keine Frames mit zwei Füßen über 3 cm unterhalb Gehtempo. Gleiten in Übergangsfenstern. Normale und verlangsamte Aufnahme.
4. **Aktionen und Fortbewegung koppeln** (`WorldFootballPose`, Zeilen 184–200, und `FootballAnimation.Sample`, Zeile 230).
   - Richtung und Neigung beim teilweisen Carrier-Reach erhalten und nur nach Aktionsgewicht skalieren, nicht auf 0 setzen.
   - Die Rückkehr von Pass, Schuss oder Annahme läuft in den neuen Richtungsbaustein.
   - Keeper-Shuffle: gemessene Shuffle-Schrittlänge, Hysterese, Geschwindigkeitsgrenze mit Kreuzschritt darüber, und nach rechts gespiegelt statt rückwärts abgespielt.
   - *Quellannahme:* Ob sich das Rig per Clip spiegeln lässt, ist offen. Sonst bleibt eine deterministische Spiegelung auf Knochenebene.
   - *Abnahme:* Gierungsänderung pro Frame beim schrägen Dribbling; Shuffle links und rechts mit Gleiten und führendem Bein; mindestens zwei echte Richtungswechsel; Pause, Rückschau und Seek halten die Pose.
5. **Keeper-Ballanker, danach kleine Bildschirme und Stadien.**
   - Den Ball beim Anheften als Funktion von `recovery` vom nativen Bildpunkt zu den Handschuhen überblenden, ohne Kontaktzeit zu verschieben.
   - Natürliche Abläufe Fang, Abpraller, Nachfassen und Abstoß getrennt kennzeichnen. `FootballKeeperTests` und `FootballPresentation119Tests` erweitern statt neu zu bauen.
   - Erst danach die Ansichten 844×390 und 931×448 sowie den Stadienvergleich (Roma, Milano und zwei weitere Typen).

**Leitplanken für alle Schritte:**
- Nur Darstellung; Leser derselben nativen Positionen und Aktionen.
- Keine zweite Aktionsuhr, kein MatchRNG, kein Verbrauch von P02.
- Die physischen 10–16 Schüsse bleiben Root-Aufgabe. Aktuelle Weltstichprobe 3,75, kompakt 12,625; keine Balancekandidaten übernehmen.

## 5. Grenzen dieser Runde

- Kein Editor-Handoff: Editor, Sync, Build und Release bleiben bei Root.
- Alle Gang-, Gleit- und Bildaussagen sind Ableitungen aus dem Quelltext oder ausdrücklich markierte Annahmen, keine gemessenen Werte.
- Kamera-, Stadien- und HTML-Seite habe ich in dieser Runde nicht gelesen.
- Die Implementierung startet erst mit der ausdrücklichen neuen `delegate_task`-Runde nach dem Live-Handoff von Release 119.

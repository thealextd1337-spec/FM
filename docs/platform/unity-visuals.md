# Unity: Flutlicht-Optik und Stadion

Stand: 8. Oktober 2026. Bearbeitet von **Claude** (Claude Code, Opus 5.5) auf Nutzerauftrag „Unity-Engine verbessern – Optik, Animationen, das ganze Paket“. Branch `claude/unity-visuals`. Phase 1 von 4 (Optik & Licht); danach folgen Animationen/IK, Spielermodelle/Trikots und Kamera/Präsentation.

## Sichtbare Änderung

Die Vereinswelt-Partie in Unity bekommt einen Flutlichtabend statt eines flachen, ausgewaschenen Felds:

- **Licht:** Ein hohes Hauptlicht mit echten weichen Schattenkarten ersetzt das bisherige pauschale weiße Umgebungslicht (Faktor 2). Das Umgebungslicht ist jetzt ein kühler Himmel über dunklerem Rasenrückstrahl. Spieler werfen echte Schatten; weiche Kontaktschatten unter Füßen und Ball halten die Figuren am Boden.
- **Rasen:** Ein eigener Shader (`D6Pitch`) zeigt Mähstreifen mit weichen Kanten, eine leichte Querschnittlinie, mehrstufiges Rauschen, abgenutzte Torräume und Anstoßpunkt, einen dunkleren Auslaufbereich und leichte Flutlicht-Lichtkegel.
- **Spieler:** Der Trikotshader (`WorldKit`) empfängt und wirft Schatten, nutzt Umgebungslicht und eine Randaufhellung. Kleine Figuren bleiben so vor dem Rasen lesbar; Stoff erhält einen schwachen Glanz.
- **Stadion:** Gestufte Tribünen mit Zuschauern auf allen vier Seiten, überwiegend in den Heimfarben. Dazu Rückwände, Dächer mit Blende in Vereinsfarbe, LED-Werbebanden in Vereinsfarben und vier Flutlichtmasten mit leuchtenden Lampenfeldern. Die Stadionteile werfen bewusst keine Schatten, weil lange Dach- und Mastschatten das Spiel überdecken würden. Liegt eine Kamera hinter einer Tribüne, wird diese Tribünenseite ausgeblendet.
- **Bildqualität:** 4× MSAA statt keiner Kantenglättung. Post-Processing mit leichter Kontrast- und Belichtungskorrektur, Vignette und schwachem Bloom auf Banden und Lampen.

Die Demo- und Kontaktproben (`Load`) stellen das bisherige Licht wieder her; die Änderung betrifft nur echte Vereinswelt-Partien.

## Grenzen

Reine Darstellung. Positionen, Ereignisse, Uhr, Ball und Ergebnis kommen unverändert aus der bestehenden Simulation. Keine Änderung an Spielregeln, Spielständen oder Karriereformaten. Keine neuen Pakete und keine Meshy-Credits.

Die Schatten verwenden ausschließlich das Hauptlicht. Schatten zusätzlicher Lichter bleiben aus, weil genau deren Sampler den früheren WebGL-Fehler verursacht hat (siehe `prototypes/match-engine-unity/README.md`). Mobile Leistung ist nicht gemessen: Schattenkarte (2048, 110 m), MSAA und Post-Processing kosten GPU-Zeit. Für Android ist eine automatische Qualitätsstufe nötig, bevor dieser Stand mobil freigegeben wird.

## Prüfungen

- `D6Cli.Tests` per Unity-CLI: FootballTests 23, Locomotion 215, Momentum 72, Action 22, Motion (0 Fehler), WorldView 24 – alle bestanden.
- WebGL-Build per `D6Cli.WebBuild`: erfolgreich, 0 Fehler, 3 bekannte Warnungen (`endFrameRendering`, RuntimePipelineConfig); Manifest mit `build-manifest.cjs` neu erzeugt.
- `work/platform/qa/shot-unity-visuals.cjs`: echte Partie im Edge-Browser mit GPU in allen fünf Kameraperspektiven (folgen, weit, Seitenlinie, diagonal, Hintertor), 0 Seiten-/Konsolenfehler. Vorher-Bilder mit dem gesicherten alten Build: `outputs/platform/unity-visuals/before/`, nachher: `outputs/platform/unity-visuals/after/`.

## Arbeitsweise mit der Unity-CLI

`prototypes/match-engine-unity/D6Cli.cs` (im Unity-Projekt unter `Assets/Doppel6EngineProbe/Editor/`) stellt parameterlose Einstiegspunkte für `-executeMethod` bereit. Der Unity-Editor muss für diese Befehle geschlossen sein.

```sh
unity run "G:/unity/My project" -- -nographics -executeMethod D6Cli.Tests -d6repo "<Repository>" -logFile outputs/unity-cli/tests.log
unity run "G:/unity/My project" -- -executeMethod D6Cli.WebBuild -d6repo "<Repository>" -logFile outputs/unity-cli/build.log
node prototypes/match-engine-unity/build-manifest.cjs
```

`D6Cli.WebBuild` setzt Buildziel, Pipeline und PlayerSettings anschließend zurück. Vor dem Build `generate-identity.cjs` ausführen und `ProbeBuildIdentity.cs` nach `Assets/Doppel6EngineProbe/Runtime/` kopieren. Neue Dateien: `WorldViewEnvironment.cs` (Runtime), `D6Common.hlsl` (Art), `D6Pitch.shader`, `D6Env.shader`, `D6Blob.shader` (Art/Resources).

| Vorher | Nachher |
| --- | --- |
| ![Folgekamera vorher](unity-visuals/follow-before.png) | ![Folgekamera nachher](unity-visuals/follow-after.png) |
| ![Weite Kamera vorher](unity-visuals/wide-before.png) | ![Weite Kamera nachher](unity-visuals/wide-after.png) |

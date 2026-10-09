# Release 112: Unity-Flutlicht, Bewegung, Trikots und Präsentation

Veröffentlichungsstand vom 9. Oktober 2026, umgesetzt von Claude (Opus 5.5) auf Branch `claude/unity-phases-2-4` ab Release 111 (`ef0e7d0`). Das Release enthält alle vier Unity-Phasen: Flutlicht-Optik und Stadion (Phase 1), gemessene Bewegung und Kontakte (Phase 2), Vereinstrikots mit Rückennummern und Keeperhandschuhen (Phase 3) sowie Rückschau-Bildfarbe, ausweichende Namensschilder, Tribünen-Occlusion und eine reduzierte Qualitätsstufe für Touchgeräte (Phase 4). [Umfang, Nachweise und Grenzen](platform/unity-visuals.md).

Unity bleibt reine Darstellung. Uhr, Positionen, Regeln, Ereignisse, Ergebnisse und Speicherung gehören weiter der nativen Simulation; keine Neuberechnung bestehender Ergebnisse oder Spielstände. Die native Feldgrößen-/P01–P06-Integration (`codex/native-match-player-integration`) ist nicht enthalten; Unity übernimmt eine spätere `match.geometry` Version 1 optional, ohne sie bleibt 68 × 44.

Die Veröffentlichung nutzt den Weg aus Release 111: vier hashgebundene WebGL-Dateien, iframe und Manifest werden unter `unity/` und `unity-match/` hochgeladen und öffentlich per SHA-256 geprüft, erst danach folgt die HTML-Seite. Der iframe-Cache ist über `runtime.html?v=112` vom alten Stand getrennt.

Unity-Quellkennung: `28badd2c1f7386dbe67f5a8244b33cf49f98eba2378c8442ece04ba16f199e7f`. Build-SHA-256: `bee55334f039f6cf0ed413be371ad3e7b85673471a5341a9c1c13cf50347556a`.

Lokale Prüfungen vor der Veröffentlichung:

- Unity-CLI `D6Cli.Tests`: Football 23, Locomotion 215, Momentum 72, Action 22, Motion 0 Fehler, WorldView 24, FootballGait 75/0. `D6Cli.WebBuild` ohne Fehler, 3 bekannte Warnungen; Manifest und Quellkennung gegen alle Dateien geprüft.
- Alle Befehle des Produktionsworkflows: [Vorprüfung](../outputs/release-112/preflight.json).
- Vereinswelt-Browserprüfung `check-world-unity.cjs --http-build`, 24 Fälle einschließlich Checkpoint, Wechsel, Rückschau, Tornetz, vollständiger native/Unity-Parität, Auswärtsspiel, 2D-Rückweg und Fehlerfall: [Nachweis](../outputs/release-112/world-unity-runtime-tests.json).
- Produktionslayout `check-release-112.cjs --local`, 21 Fälle: Footer 112, echte Unity-Spieler, Pause/Fortsetzen, Rückschau, bewusste 2D-Ansicht und Rückkehr, vergrößerte Halbzeit und zweite Hälfte, Namensprojektion, vollständige Partie in Unity und Browserrenderer identisch 2:0 (Ereignisse, Spielerberichte, Finanzen), Touch-Querformat mit Stufe `reduced`, fehlende Unity-Laufzeit fällt auf 2D zurück, keine Skriptfehler. [Nachweis](../outputs/release-112/local-production-layout.json).
- GPU-Bilder des finalen Builds in allen fünf Kameras ohne Seiten-/Konsolenfehler.

Grenzen: Physische Mobilgeräte sind nicht gemessen; die reduzierte Stufe ist eine konservative Vorgabe, keine Hardwarefreigabe. Die in v159 dokumentierten Grenzen für Torquote und Kontakte bleiben bestehen.

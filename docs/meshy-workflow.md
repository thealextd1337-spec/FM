# Meshy für Doppel 6

Stand: 2. Oktober 2026. Das installierte Meshy-Plugin 0.6.0 ist über seine CLI 0.4.0 mit dem bestehenden Meshy-Konto verbunden. `auth status` bestätigt `authenticated` und `verified`; der lokale Doctor bestätigt Node 24 und die offiziellen API-Ziele. Zugangsdaten bleiben im CLI-Profil, außerhalb des Repositories und der Spiel-HTML. Keine Meshy-Anfragen laufen während einer Partie.

## Lokaler API-Workflow

Für den geplanten Matchausbau sind [konkrete Meshy-Arbeitspakete](meshy-match-auftraege.md) festgelegt: aktuelles Nutzer-Rig und vorhandene Clips wiederverwenden, mobile Assetvarianten prüfen sowie fehlende Fußballbewegungen über Katalog oder Text to Motion liefern. Zuständigkeiten, zwei Pilotclips, Liefervertrag, Kontakt-/Performanceabnahme und aktuelle Kostenquellen stehen dort. Die folgenden Projektbeschreibungen dokumentieren frühere Zwischenstände.

- `work/meshy.ps1` verwendet die vorhandene kompatible Node-Laufzeit und die festgelegte CLI-Version. Es ersetzt keine globale Installation und implementiert keine eigene Tokenablage.
- `work/meshy-player-plan.json` enthält die korrigierte Textalternative mit ausdrücklich „SOCCER“ und ausgeschlossener American-Football-Ausrüstung. Der aktuelle Modellweg verwendet auf Nutzerwunsch die ursprüngliche Stilzeichnung B als Bildgrundlage; siehe [Modell, Dateien und Task-Nachweise](meshy-concept-b/README.md).
- `work/meshy-player.ps1` plant standardmäßig kostenfrei. Mit ausdrücklich freigegebener Generierung erstellt es Geometrie, wartet auf dieselbe Task-ID, texturiert und lädt eine GLB herunter. Projekte, Task-Snapshots und Ergebnis landen unter `meshy_output/`.
- Ein Jobmarker und CLI-Operation-IDs verhindern ein stilles erneutes Absenden. Nach unbekanntem Ausgang oder Timeout vorhandene IDs/journalisierte Operation fortsetzen; nicht einen neuen bezahlten Job starten.
- `work/meshy-soccer-stage.ps1` sichert jede separat freigegebene Stufe vor dem Absenden in einem eigenen Marker. Vor Textur/Rigging werden Ergebnisbild und tatsächliche GLB-Geometrie geprüft. Vorhandene Marker blockieren erneutes Absenden; Fortsetzung verwendet dieselbe Ressource und Task-ID.

Kostenfrei planen:

```powershell
& ./work/meshy-player.ps1
```

Erst nach Kostenfreigabe erzeugen:

```powershell
& ./work/meshy-player.ps1 -Submit -MaxCredits 30
```

Der CLI-Planer schätzt am 2. Oktober 2026 für die Textalternative 20 Credits für Preview und 10 für Refine, zusammen 30 Credits. Der erste Free-Tarif-Versuch wurde mit HTTP 402 abgelehnt: `NoMorePendingTasks: Task creation on the free plan is no longer supported.` Keine Task-ID, Guthaben vor/nach dem Versuch 140 Credits; Nachweis bleibt in `meshy_output/footballer-job-rejected402.json`.

Nach der vom Nutzer vorgenommenen Premium-Freischaltung lief die Textkette erfolgreich durch: `text-to-3d` Preview `01a0fc24-d3d1-719b-a920-5efb52115a5f` berechnete 20, Refine `01a0fc25-ddf6-773e-9345-f61214d6b6b3` 10 Credits. Projekt `meshy_output/20261002_122430_doppel-6-football-player_01a0fc24`, ursprünglicher Marker `footballer-job.json`. Der Prompt war mit „football“ unzureichend eindeutig: Meshy erzeugte eine Figur mit American-Football-Helm und Schulterpolstern. Tatsächliche GLB: 619.216 Dreiecke, kein Rig. Ergebnis als unpassender Versuch erhalten, nicht weiterbearbeitet oder integriert. Die reine erfolgreiche Pipeline belegt keinen passenden Fußballer.

Der Nutzer hat anschließend Meshy einschließlich Rigging und neuer Bildvorlagen freigegeben und die Rückkehr zu den ersten Konzeptzeichnungen bestimmt. Daraus entstand die [Konzept-B-A-Pose und geriggte Figur](meshy-concept-b/README.md) mit `image-to-3d --model-type smart-topology --target-polycount 3500 --should-texture true --texture-resolution 2k`, anschließend `rigging`. Die [offizielle API-Preisliste](https://docs.meshy.ai/en/api/pricing), gelesen am 2. Oktober 2026, schätzt dafür 15 + 5 Credits; der allgemeine `make`-Bildplan verwendet dagegen Standardgeometrie und schätzt 30. Er darf nicht als Smart-Topology-Preis ausgegeben werden. Die fertigen Tasks bestätigen tatsächlich 15 + 5, zusammen 20 Credits. Einschließlich des verworfenen Textversuchs wurden insgesamt 50 Credits gemeldet. Keine zusätzlichen bezahlten Clips oder Remesh-Aufgaben; Geh-/Laufclip waren im Rig enthalten.

API-Credits, tatsächliches `consumed_credits` und KI-Tokens sind unterschiedliche Zähler. Kostenlose Versuche im Web-Abonnement werden nicht für die API vorausgesetzt. Guthaben allein ist kein Preisnachweis. Login, Textgenerierung/-texturierung, Bildgenerierung zu 3D, Rigging, Downloads und lokale Offline-Clipprobe wurden ausgeführt; Match-Integration steht aus.

## Integration in die Spielansicht

Die nachfolgende [Proportionskorrektur 2](meshy-concept-b/proportions-v2.md) hat weitere 20 Credits für eine neue bildbasierte Figur samt Rig berechnet; anschließend wurden Mesh und Ruhe-Rig lokal in Blender verfeinert. Gesamtabrechnung der bisherigen Tasks: 70 Credits. Bestehende Modelle und Clips bleiben erhalten; lokale Bearbeitung verursacht keine weiteren Meshy-Credits.

Die erzeugte GLB ist ein Entwurf zur Prüfung. Topologie, Schulter-/Knieverformung, Trikotvarianten und Ballkontakt müssen für die Spielintegration beurteilt werden. Das Zielbudget von 3500 Dreiecken ist eine Projektvorgabe; Smart Topology lieferte tatsächlich 3633. Rigging wurde inzwischen beauftragt und durchgeführt. Weitere Stufen nur bei konkretem Bedarf; vorhandene Modelle und Clips wiederverwenden.

Meshy bietet humanoides Rigging mit FBX/GLB sowie Geh-/Laufclips. Diese Daten sind nicht direkt mit dem prozeduralen Gelenkmodell der aktuellen Browseransicht austauschbar: Import, Skelettzuordnung und Animationsmixer brauchen eine gesonderte Integration. Gameplay bleibt Quelle der Feldposition; künftige Clips dürfen weder Root-Motion noch einen ununterbrechbaren Aktionsausklang über die Eingaben legen.

Quellen: [Plugin-Skill](C:/Users/alex/.codex/plugins/cache/openai-curated-remote/meshy-openai-plugin/0.6.0/skills/meshy-3d-generation/SKILL.md), [Meshy Rigging API](https://docs.meshy.ai/en/api/rigging), [Animation API](https://docs.meshy.ai/en/api/animation), [API-Preise](https://docs.meshy.ai/en/api/pricing).

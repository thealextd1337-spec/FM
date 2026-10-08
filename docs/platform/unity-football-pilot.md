# Unity-Fußballpilot: Pass, Annahme, Schuss und Torwart

Nachfolgestand vom 8. Oktober: [schnelle offensive Läufe und Passanschlüsse](unity-fast-football.md) samt erweitertem Bewegungsmixer lokal geliefert. Die Zahlen dieses Pilotdokuments beschreiben den ursprünglichen Pilotstand; gemeinsam genutzte Runtime-/Renderberichte prüfen inzwischen die nachfolgende Iteration.

Lokal umgesetzt am 8. Oktober 2026. Nutzerauftrag: die vorgeschlagene zusammenhängende Fußballsequenz ausführen und die gewählte Unity-Darstellung iterieren. Die bestehende Vereinswelt-Simulation entscheidet weiterhin über Ballbewegung, Besitz, Kontakte, Regeln, Uhr, Ergebnis und Speicherung.

[Spielzug öffnen](http://127.0.0.1:4300/?engine=unity&scene=play-goal&camera=contact): Start drücken. Für den Torwartabpraller die Szene „Pass → Annahme → Schuss → Parade“ wählen. Die vorhandenen Szenen unterstützen beide Richtungen, zwölf/vierzehn Figuren, beide Feldgrößen, Pause und Zwischenstände. [Vereinswelt mit Unity](http://127.0.0.1:4200/source/index.html?engine=unity) verwendet dieselben neuen Bewegungen in tatsächlichen Partien.

## Gelieferte Änderung

Zwei eigene Bewegungen ersetzen die bisherige Verwendung des Schussclips für Bodenpässe und Annahmen: `pass_inside_meshy` und `receive_ground_meshy`. Der vorhandene Schuss bleibt erhalten. Vorhandene tiefe, hohe, seitliche Torwartbewegungen und Aufstehen werden im Vereinswelt-Renderer wiederverwendet. In der Spielzugprobe bleibt die Annahme vor der Schussvorbereitung sichtbar, ohne die Freigabezeiten des Demokerns zu ändern.

Ein manueller Unity-Mixer hält die Clipknoten vor und blendet kurz zwischen Bewegungen. Er verwendet die native Matchuhr; Pause friert Gelenke, Übergänge und Namensanker ein. Rückschau gegen die Uhr setzt unmittelbar auf das empfangene Bild. Aktionserkennung enthält nun die native Aktionskennung, den projizierten Kontaktpunkt und die vorhandene Torwarterholung. Es werden ausschließlich Darstellungsfelder übertragen, keine Fähigkeiten oder Entwicklungswerte.

Der linke Standfuß kann bei einer stehenden rechten Fußaktion gebunden bleiben. Ein begrenzter Zweigelenklöser richtet Fuß beziehungsweise Hand auf den erreichbaren nativen Kontaktpunkt aus. Für geringe Rigabweichungen ist eine sichtbare Kniebeugung mit höchstens zwölf Zentimetern vertikaler Hüftkorrektur erlaubt. Die vom Spiel gesteuerte Figurposition und der Ball werden nie verändert. Zu weit entfernte Kontaktpunkte bleiben unerreichbar. Die Messung prüft tatsächliche Fuß-/Handgelenke und ersetzt keine vollständige Meshkollision.

## Meshy-Lieferung und Kosten

Die vorhandene Figur mit 28 Gelenken, Geometrie, Trikotverfahren, Texturen und 34 Originalclips bleibt unverändert. Nach Prüfung der vorhandenen Clips und des Katalogs wurden zwei jeweils zweisekündige Text-to-Motion-Aufträge über den Meshy-CLI-Workflow ausgeführt:

| Clip | Task | Tatsächliche Credits |
| --- | --- | --- |
| Pass | `01a11bcb-26a6-721f-96cb-861d29ab3d14` | 10 |
| Annahme | `01a11bcb-c2d0-7441-9e02-e7de536deb21` | 10 |

Gesamt: **20 Credits**. Keine zusätzlichen Modell-, Rigging- oder Wiederholungsaufträge. [Offizielle Preisgrundlage](https://docs.meshy.ai/en/api/pricing), geprüft am 8. Oktober. Quellbewegungen werden lokal auf das vorhandene Rig übertragen; die Providerfigur wird nicht importiert. Der linksfüßig gelieferte Pass wurde für den rechten Kontaktfuß gespiegelt. Horizontale Wurzelbewegung und Drehung sind entfernt.

Die isolierte Blender-FBX-Prüfung vergleicht alle 61 Zeitpunkte pro Clip. Maximale Gelenkabweichung beim Export/Rückimport: rund 0,0022 Millimeter. Die zusätzliche FBX enthält ausschließlich das vorhandene Rig und die beiden Bewegungen. Unity verkürzt bei diesem Animationsexport den einzigen Armature-Wurzelpfad; der Importadapter stellt die exakten Pfade des vorhandenen Prefabs wieder her. Kein Clip darf die vom Spiel gesteuerte Figurenwurzel animieren.

[Assetmanifest und Hashes](../../work/platform/assets/contact-pilot-manifest.json), [FBX-Abnahme](../../meshy_output/contact-pilot-2026-10-08/contact-fbx-validation.json), [Unity-Lieferassets](../../outputs/platform/assets/contact-pilot/). CLI-Aufträge, Quell-FBX und Retargetingbelege liegen im Workspace `meshy_output/contact-pilot-2026-10-08/`; rohe Providerantworten enthalten zeitlich begrenzte Downloadadressen und gehören nicht in öffentliche Dokumentation.

## Abnahme

Alle Browserprüfungen laufen in getrennten Profilen und neuen HTTP-Testkarrieren. Der vorhandene Nutzer-Spielstand bleibt unberührt.

- [23 Unity-Rigprüfungen](../../outputs/platform/contact-pilot/rig-tests.json): tatsächliche Fußkontakte und Standfuß in beiden Richtungen, eingefrorene Pause, unerreichbarer Kontakt, unveränderte Figurenwurzel, kurzer Übergang, wiederverwendete Mixer-Knoten und Rückschau gegen die Uhr.
- [Vier Prüfungen einer echten Vereinswelt-Partie](../../outputs/platform/contact-pilot/live/report.json): getrennte Pass-/Annahme-/Schussclips tatsächlich gerendert; native Kontaktbilder erreichen echte Gelenke; Pause friert Posen und Namen ein; keine Laufzeitfehler.
- [Sechs sichtbare Unity-Spielzüge](../../outputs/platform/qa/2026-10-08T14-30-15-754Z-unity-play/report.json): Tor, Abfangen und Parade/Abpraller in beiden Richtungen, kleine/große Felder und zwölf/vierzehn Figuren; tatsächliche Kontaktmessung, Pause, Zwischenstand, Fortsetzung, Rücksetzen und einmaliges Ergebnis. Die Bilder wurden direkt aus dem neuen WebGL-Build aufgenommen und besichtigt.
- [Direkter Demo-Link](../../outputs/platform/contact-pilot/link-test.json): Unity, Tor-Spielzug und Kontaktkamera richtig voreingestellt; aktuelle Buildkennung aus dem tatsächlichen Unity-Zwischenstand geprüft; Pass, Annahme, Schuss, Tor und Nachlauf durchlaufen.
- [24 Darstellungsvertragsprüfungen](../../outputs/platform/world-unity/contract-tests.json): vorhandene Validierung und synchrones Glätten, zusätzlich getrennte Phasen bei aufeinanderfolgenden Pässen und Ablehnung nicht endlicher Kontaktpunkte.
- [21 Vereinswelt-Runtimeprüfungen](../../outputs/platform/world-unity/runtime-tests.json) und [vollständige Vergleichsdaten](../../outputs/platform/world-unity/parity-raw.json): 2.900 identische Simulationstakte einschließlich Halbzeit, 99 angezeigte Minuten, Ergebnis 0:0; Ereignisse, Statistiken, Wechsel, Spielbericht, Finanzen, Form und Frische identisch. Heim/Auswärts, Wechsel, Checkpoint, Tor-/Netzwiederholung und gebautes HTML geprüft.
- [Normale Ansicht](../../outputs/platform/world-render/fixed/report.json) und [vergrößerte Ansicht](../../outputs/platform/world-render/fixed-expanded-deferred/report.json): Namensanker nach Größenänderung und in Bewegung, echte Pause, lange Halbzeit, Rückkehr zur zweiten Hälfte und aus 2D. Der absichtlich ausgelöste sichtbare Antwortausfall behält den sicheren 2D-Rückweg und verändert die Partie nicht. Ein erster zeitgesteuerter Ausfalltest war uneindeutig; die Wiederholung mit aufgezeichnetem Vorher-/Nachherzustand bestand ohne Produktänderung.
- Bestehende C#-Demokerne erneut bestanden: 288 Kontakte/Zwischenstände, 24 Spielzüge mit negativen Kontaktfällen, 48 Physikfälle und acht Netzfälle.
- [Unity-Build](../../outputs/platform/contact-pilot/build-report.json): `build_3999e2db3dcc`, keine Fehler, drei bestehende Werkzeug-/APIwarnungen. [Buildmanifest](../../outputs/platform/unity-web/probe-build.json), [Editor vorher](../../outputs/platform/contact-pilot/editor-before.json) und [nachher](../../outputs/platform/contact-pilot/editor-after.json): ursprüngliche Einstellungen einschließlich Windows-Ziel wiederhergestellt.

## Umfang und nächste Ausbaustufe

Geliefert ist ein lokaler rechter Bodenpass-/Annahmepilot für Unity. Die Browservergleichsengine behält ihre bisherigen Clips; native Abläufe bleiben vergleichbar. Hohe Pässe/Flanken verwenden vorläufig dieselbe Passbasis, volle Volley-/Kopfball-/Einwurf-/Grätschfamilien und Bewegung in engen Spielsituationen benötigen eigene weitere Iterationen. Vollständige Unity-Match-KI, neue Rollen-/Taktikregeln, individuelle Körpermaße und mobile Leistungsabnahme sind weiterhin offen. Die drei zurückgestellten UI-Besichtigungspunkte bleiben zurückgestellt.

Kein Release, keine Versionsanhebung und keine Nachberechnung alter Spielstände. P01–P05 werden durch diesen Animationspilot nicht als abgeschlossen markiert.

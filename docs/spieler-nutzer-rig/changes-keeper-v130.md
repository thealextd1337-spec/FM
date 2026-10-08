# Meshy-Torwartbereitschaft nach Bildvorlage

Lokal umgesetzt am 5. Oktober 2026. Der Torwart nimmt bei nahen Bällen und seitlichen Nachstellschritten eine gebeugte Bereitschaftshaltung ein: Knie gebeugt, Hüfte zurück, Oberkörper vor, Hände getrennt und tief vor dem Körper, Fangflächen zum Ball. Nach einem Sidestep bleibt diese Haltung erhalten. Fang-, Halte-, Paraden- und Jubelaktionen übernehmen weiterhin ihre eigenen Bewegungen.

## Meshy-Auftrag und Einbindung

Ein Meshy-Text-to-Motion-Auftrag im Modus `prime`, Dauer vier Sekunden, ist erfolgreich abgeschlossen. Tatsächlich verbraucht: **10 Credits**. Task `01a10bf7-4e92-72b7-9cf8-bcee3bb987a2`; keine weiteren kostenpflichtigen Versuche. Die Front-/Seitenvorlage wurde in Bewegungsanweisungen beschrieben; dieser Endpunkt unterstützt keinen Bild-Upload für Bewegungen.

Der Prompt beschreibt Schulterbreite, gebeugte Knie, zurückgesetzte Hüfte, vorgeneigten Oberkörper, Blick nach vorne, weiche Ellenbogen und offene Hände tief vor den Oberschenkeln sowie kleine seitliche Schritte ohne überkreuzte Füße. Roh-FBX und Auftragsdaten liegen unter `meshy_output/keeper-reference-v130.fbx` beziehungsweise `meshy_output/keeper-reference-v130-task.json`. Letztere enthalten zeitlich begrenzte Download-URLs und gehören nicht in öffentliche Dokumente.

Die Meshy-Bewegung verwendet ein 52-Gelenk-Skelett. `retarget-keeper-v130.cjs` überträgt sie über Bindeposen und Weltrotationen auf das bestehende 28-Gelenk-Spielerrig. Die horizontale Root-Bewegung und Drehung des Anbieters werden entfernt. Geometrie, Rig, Textur und alle 32 bisherigen Clips bleiben erhalten; `football-v130.glb` enthält zusätzlich `keeper_shuffle_meshy` und `keeper_ready_meshy`.

Der vollständige Rohclip bewegt sich später zu weit und verengt die Schrittstellung. Im Spiel wird deshalb sein ruhiger erster Abschnitt als geschlossene Bereitschaftsschleife für den Oberkörper genutzt. Die Beine führen weiter die an der realen Spielbewegung gebundenen Nachstellschritte mit Fußkontakt aus. Die Meshy-Pose wird am tatsächlich dargestellten Becken verankert. Eine Armkorrektur hält die Hände symmetrisch tief vor dem Körper und dreht die Fangflächen zum Ball. Der neue Clip bestimmt nicht die Spielposition oder Ballflugbahn.

## Änderungen im Code

- `pitch-motion-v102.js`: Bereitschaft auch im Stillstand bei nahen Bällen, gebeugte Beine, Hüfte zurück und weiche Übergänge; Beinziele berücksichtigen die zurückgesetzte Hüfte.
- `player-user-motion-v108.js`: neue Meshy-Bereitschaftsschleife auswählen und zeitlich fortführen, Füße an der tatsächlichen Bewegung führen.
- `player-user-meshy-v107.js`: Meshy-Oberkörper am gerenderten Becken verankern, Root-Verschiebung ausschließen.
- `player-user-ball-actions-v111.js`: tiefe, getrennte Hände mit anatomischer Armreichweite und Fangflächen zum Ball; bestehende Aktionskontakte behalten Vorrang.
- `player-user-bootstrap-v112.js`, `build.cjs`, `server.cjs`: neues Modell und Kalibrierung auf Quellseite und im regulären Offline-Build laden.

## Prüfung

[24 native Bewegungssequenzen](keeper-sidestep-qa-v130.json) decken 30/60/120 Hz, zwei Schrittgeschwindigkeiten, beide Spielrichtungen, Links-/Rechtswechsel und das anschließende Stehen ab. Hände getrennt, Fangflächen nach vorne und tiefere Handposition bestätigt; im Stand bleiben beide Knie gebeugt. Keine Änderungen am Matchzustand durch die Darstellung, Pause stabil, maximale Abweichung gebundener Füße unter 2,5 Zentimetern. Die Vorneigung liegt in den geprüften Bereitschaftsphasen ungefähr bei 28–30 Grad. Feldspieler, Vorwärtslauf, Sprint und Parade werden nicht als Sidestep eingestuft.

[Zehn Ballaktionsfälle](ball-actions-qa-v130.json) prüfen Pässe, Flanken, Annahme, Schuss, Dribbling, vier Fang-/Paradenrichtungen und Halten, einschließlich Bodennähe, Handschuhkontakten und Pause. [Quell-/Offline-Integration](model-integration-qa-v130.json) bestätigt zwölf neue Spielermodelle einschließlich beider Torhüter, unveränderten Testspeicher, keine RNG-Veränderung durch Modellaufbau, Offline-Nutzung ohne Netzwerkzugriff und funktionierende Ersatzdarstellung bei fehlendem Modell.

[Abschlussnachweis](../../outputs/keeper-reference-verification-v130.json) prüft die unveränderten bisherigen Assetdaten und Kalibrierungsprofile, die zwei neuen Clips sowie Quellen- und Modellgleichheit im regulären Build. Die allgemeine natürliche Wirkung im Nutzermatch bleibt eine visuelle Abnahme; keine neue Balance- oder vollständige Saisonstudie. Keine Veröffentlichung, Änderungen an Spielerwerten oder Umrechnung von Spielständen. Historische Prüfdateien bleiben erhalten.

## Vorschau im Spielerrig

Von vorne, nach dem Stehenbleiben:

![Torwartbereitschaft von vorne](../../outputs/keeper-reference-front-v130.png)

Von der Seite:

![Torwartbereitschaft von der Seite](../../outputs/keeper-reference-side-v130.png)

[Seitliche Bewegung](../../outputs/keeper-reference-moving-diagonal-v130.png) · [Meshy-Rohbewegung vor Anpassung](../../outputs/keeper-provider-front-0.5-v130.png) · [Retarget-Bericht](keeper-retarget-v130.json)

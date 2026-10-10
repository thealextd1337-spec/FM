# Unterbrochene Unity-Implementierung: gesicherter Zwischenstand

Die Runde `d6-claude-next-unity-implementation-20261010-r1` hat Quellen und tatsächliche Rig-Diagnostik bearbeitet, endete aber am Claude-Limit. Der Provider meldete im Kindverlauf „resets 6am (Europe/Paris)“. Es gibt keinen weiteren geplanten Startversuch und keine fertige Übergabe. Der ursprüngliche Auftrag bleibt [Paket 07](07-unity-qualitaet-claude.md); der [lesende Vorabcheck](d6-claude-animation-vorabcheck-20261010.md) bleibt erhalten.

## Sicherung und Versionsgrenze

Arbeitsbaum: `work/claude-natural-motion`, Branch `codex/claude-natural-motion-20261010`. Die geprüften Release-119-Metadaten wurden danach konfliktfrei als `b38e133` übernommen. Release 119 ist live; seine Quellen und WebGL-Artefakte gehören weiterhin zum ursprünglichen Produktcommit `0a06e57`. Die neuen Animationsänderungen sind lokal und unveröffentlicht.

Root hat zehn geänderte/neue Dateien, ihren Patch und ihre Hashes unter `outputs/3d-quality/claude-orchestration-20261010/checkpoint/` gesichert. Fingerprint der aktuellen 40 Laufzeitquellen: `c52b7dcbe3bf9dd42aabcc397fa184978562eb65507ebe7948df848f9e2e574a`. Die gespeicherte Quellenkennung und das WebGL-Manifest nennen noch `00700557…`; sie belegen den alten Build. Die neue Editor-Diagnostik übernimmt diese alte Kennung ebenfalls. Sie ist kein freigegebener Buildnachweis für den Zwischenstand.

## Vorhandene Ergebnisse

Unter `outputs/3d-quality/claude-natural-motion-20261010/` liegen Baseline, Kandidaten 1–19, Bilder, normale/langsame GIF-Aufnahmen, Rig-Messungen und zwei tatsächliche native Bildaufnahmen. Kandidat 19 enthält 125 gemessene Fälle und 26 bestandene Determinismusprüfungen. Diese 26 Prüfungen erzwingen noch keine Grenzwerte für Füße, Gelenke oder Bodenabstände.

Beispiele aus denselben kontrollierten Cruise-Fenstern, Baseline → Kandidat 19:

| Szene | Mittleres Sohlen-Gleiten | Weitere Beobachtung |
|---|---|---|
| Gehen vorwärts | 0,159 → 0,054 m/s | langsame Doppelschwebe: 0 → 4 Frames |
| Traben vorwärts | 0,414 → 0,071 m/s | Verbesserung allein ist noch keine Gesamtfreigabe |
| Traben seitlich rechts | 0,979 → 0,052 m/s | Bremsübergang separat prüfen |
| Gehen seitlich links | 0,470 → 0,135 m/s | Sohlen unter Toleranzgrenze: 0 → 3 Frames |
| Kurve 150°/s | 3,555 → 0,144 m/s | Drehneustarts: 14 → 0 |
| Keeper-Nachstellen 1,1 m/s | 1,497 → 0,027 m/s | langsame Doppelschwebe: 45 → 0 Frames |

Die Werte stammen aus Editor-Fixtures, nicht aus einem Android-Leistungstest. Root hat die Baseline-/Kandidatenübersichten `directions-walk.png` angesehen: Seitbewegungen verwenden teils unpassend hochgezogene Arme. Der native Fall `native-160112-field-1` enthält weiterhin problematische langsame Doppelschwebe (26 → 84 Frames). Größere Verbesserungen beim Gleiten dürfen diese Verschlechterungen nicht verdecken.

## Unabhängige Prüfung

Die sichere Synchronisierung meldete null zu kopierende Dateien. Root startete den unveränderten Gesamtpfad `D6Cli.Tests` mit eigenem `-d6output outputs/3d-quality/claude-orchestration-20261010/root-validation`.

- Kompilierung erreichte die Tests; keine gemeldeten C#-Kompilierfehler.
- `FootballTests` und `FootballLocomotionTests` wurden erfolgreich ausgeführt.
- `FootballMomentumTests` brach mit `Incremental moving turn retains its stride at 30 Hz / -1` ab. Die nachfolgenden Suiten wurden deshalb nicht ausgeführt.
- Das Protokoll enthält zusätzlich eine Lizenz-Validierungswarnung. Die konkrete Suite-Ausnahme trat nach ausgeführten Tests auf; die Warnung erklärt diesen Testkonflikt nicht.

Eine unabhängige lesende Prüfung bestätigt den Testkonflikt: `FootballMomentumTests.cs:28` erwartet nach 0,333 Sekunden noch `MotionWeight < 1`; die neue einmalige Dreh-Episode endet bereits nach 0,18 Sekunden. Prüfe erhaltenen Schritt, Banking und ausbleibende Wiederholungen bei 30/60/120 Hz als fachlichen Vertrag. Nicht einfach die Assertion entfernen. `FootballPresentation119Tests.cs:66` verlangt außerdem sofortigen Rückwärtsmodus nach einem abrupten Richtungswechsel; die neue Glättung/Hysterese benötigt eine passende Probe für anhaltenden Rückwärtslauf und Grenzflattern.

## Konkrete nächste Arbeiten

1. Vorhandene Änderungen erhalten und aktuellen Fingerprint neu prüfen; historische Kandidaten nicht überschreiben. Paket 07 und beide Befundberichte als Kontext der neuen delegierten Runde mitgeben.
2. Seitlauf-Oberkörper korrigieren: `idle_ready` wird als Ganzkörperclip abgespielt; die prozeduralen Schritte ändern nur Beine/Becken und senken die hochgezogenen Arme nicht. Eine tatsächlich gemessene passende Oberkörperbasis beziehungsweise getrennte Armbewegung verwenden.
3. Fußlock-Freigabe und Bremsübergänge anhand der vorhandenen Aufnahmen untersuchen. Seitliches Traben erreicht im Bremswechsel etwa 2.542°/s Gelenkgeschwindigkeit; Rückwärts-Traben beim Stillstand etwa 2.430°/s. Bodendurchdringung und langsame Doppelschwebe beheben, ohne bestätigte Aktionskontakte zu verschieben.
4. Diagnostik in echte Qualitätsgates überführen. Geeignete begründete Grenzwerte und Baseline-Vergleiche für Sohlen, Gleiten, Knie/Gelenkkontinuität und Brustausrichtung prüfen. Seitlauf nicht als Vorwärtsfamilie zählen. Die bisher festen 60-Hz-Messungen um unterschiedliche Darstellungskadenzen erweitern. Native Positionen/Blickrichtung/Match-RNG bleiben unverändert.
5. Bestehende Tests fachlich an die gewollte Kurven-/Hystereseänderung anpassen und vollständig ausführen; neue Diagnose nicht nur anhand „OK“ freigeben. Keeper-Fangketten, kleine WebGL-Kameras und Vereinsstadien aus Paket 07 fehlen in diesem Zwischenstand noch. Danach erst neue Quellenkennung, Quellenabgleich, Build, Manifest und vollständige Übergabe erzeugen.

Bestätigte Ballhaltung bleibt in den Änderungen streng; native Positionen, Blickrichtung, Kontaktzeitpunkte und RNG werden nicht verändert. Pause/Seek bestehen in den neuen festen Fixtures. Die physische Schussbalance und die Pixel-Abnahme bleiben getrennte Root-Aufgaben. Keine Live-Freigabe für diesen Zwischenstand.

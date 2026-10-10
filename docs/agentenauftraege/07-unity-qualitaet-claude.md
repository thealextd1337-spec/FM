# Unity-Arbeitspaket für Claude: nächste 3D-Iteration

Status: Der zweite lesende Vorabcheck mit Claude Opus 5.5 ist am 10. Oktober 2026 abgeschlossen. Der erste Versuch scheiterte am Rate-Limit. Dies ist ein ausführbarer Entwicklungsauftrag, kein Unity-Assetexport. Die anschließende Implementierung erhält den unten genannten eigenen Arbeitsbaum und exklusiven Unity-Editorzugriff; ihr tatsächlicher Startstatus steht in der delegierten Aufgabenkennung.

Der einmalige Timer wurde ausgelöst und ist deaktiviert; es gibt keinen weiteren geplanten Lauf. `d6-claude-next-unity-readonly-20261010-r2` ist abgeschlossen, ohne Dateien, Editor oder Build zu ändern. Release 119 ist lokal eingefroren und übergeben: Alle 94 Produktionskommandos unter Node 20.20.2 und 65 Kandidatenprüfungen sind bestanden. Die separate Prüfspur übernimmt CI und Live-Abnahme im alten Arbeitsbaum. Claude darf in der neuen Implementierungsrunde den Editor und den neuen Kandidaten übernehmen. Ein erneutes Rate-Limit ist kein ausgeführter Auftrag und startet keine Endlosschleife.

## Startprompt

Die Implementierungsrunde `d6-claude-next-unity-implementation-20261010-r1` endete nach einer begonnenen Umsetzung mit „Claude API rate limit reached. Try again later.“. Lokale C#-Änderungen, neue Diagnostik sowie Baseline- und Kandidatenbilder/Messungen liegen vor; die vollständige Übergabe und Freigabe fehlen. Quellenkennung und WebGL-Manifest tragen noch den Ausgangsstand und sind kein Nachweis für die geänderten Quellen. Aufgabenkennung, Arbeitsbaumbindung und Terminalergebnis stehen in `outputs/3d-quality/claude-orchestration-20261010/start.json` beziehungsweise `terminal.json`. Der abgeschlossene Vorabcheck bleibt gültig. Root hat den [Zwischenstand gesichert und unabhängig geprüft](d6-claude-animation-zwischenstand-20261010.md). Kein automatischer weiterer Versuch ist eingerichtet. Der Provider meldete einen Reset um 06:00 Uhr (Europe/Paris); dies ist noch kein neuer erfolgreicher Start.

Der zweite lesende Vorabcheck ist abgeschlossen, ohne Rate-Limit oder Änderungen. [Konkrete Quellbefunde und fünf Umsetzungsschritte](d6-claude-animation-vorabcheck-20261010.md): Richtungswechsel an der Rückwärtsgrenze, wiederholt startende Kurvendrehungen, ungeklärte Schrittphasen beim Überblenden und abrupter Richtungsverlust beim Carrier-Kontakt sind vorrangig. Die Befunde sind keine neuen Gelenk-/Bildmessungen. Der geprüfte Unity-Quellen-/Buildstand bleibt unverändert. Die Implementierungsrunde übernimmt diese Befunde und muss sie sichtbar prüfen.

> Arbeite das Unity-Paket `docs/agentenauftraege/07-unity-qualitaet-claude.md` in der angegebenen Reihenfolge ab. Verwende den aktuellen integrierten Stand, sichere vorhandene Änderungen und liefere einen geprüften lokalen Unity-Kandidaten mit Quellenkennung, Tests, Bildern und WebGL-Manifest. Priorität: sichtbare Bewegungsqualität im schnellen Kleinfeldspiel, anschließend Keeperkontakte und mobile Lesbarkeit. Root integriert Browseränderungen und veröffentlicht. Melde konkrete Lücken und behebe sie innerhalb deines Dateieigentums; bei einer Sackgasse sind eigene lokale Bewegungs- oder Darstellungsbausteine erlaubt.

## 1. Ausgangsstand und Eigentum sichern

Implementierungsarbeitsbaum: `F:/Neuer Ordner (2)/ChatGPT/Fussballmanager/work/claude-natural-motion`, Branch `codex/claude-natural-motion-20261010`, Basis `0a06e57c3e2d89f99e9034471dae7ae52253764d`. Die Bindung in T3 wurde geprüft. Der Vorabcheck und die separate Release-119-Live-Abnahme verwenden `work/3d-quality-stadiums`; diesen alten Arbeitsbaum und dessen freigegebene Artefakte nicht ändern. Unity-Projekt: `G:/unity/My project`, Editor 6000.6.4f1. Das Hauptcheckout ist kein Ersatz für den ausdrücklich übergebenen Arbeitsbaum.

Zuerst `AGENTS.md`, [Entwicklung](../development.md), [Release 119](../release-119.md) und den tatsächlichen geladenen Quellstand lesen. Bei Spielregelfragen zusätzlich den entsprechenden Abschnitt in [Produktentscheidungen](../product.md). Aktuelle Quellenkennung aus `prototypes/match-engine-unity/source-identity.json`, Buildkennung aus `outputs/platform/unity-web/probe-build.json` lesen und neu hashen. Einen früheren Chat-Hash niemals als aktuellen Stand übernehmen.

Der Veröffentlichungsstatus von Release 119 steht im Releasebericht der alten Prüfspur. Bereits umgesetzt sind Handschuhanker für bestätigte Fänge, Blick-/Laufrichtungen, diagonale Stride-Korrektur, stärkerer Ballschatten und optionale Unity-Abseitslinie. Für diese neue Implementierungsrunde übergibt Root Editor-, Sync- und Buildzugriff ausdrücklich exklusiv an Claude. Alle bisherigen Unity-Spuren sind beendet; die Release-Prüfspur baut nicht neu. Fehlende Abnahme ist kein Beleg für fehlenden Code.

**Claude besitzt** die erforderlichen Präsentations-/Rig-/Umgebungsdateien unter `prototypes/match-engine-unity/`, zugehörige gezielte C#-Tests, die bestehenden Sync-/Identity-/Manifestwerkzeuge und neue eigene lokale Evidenz. Kernpfade: `FootballAnimation.cs`, `FootballPresentation.cs`, `FootballLocomotion.cs`, `WorldViewContract.cs`, `WorldViewPlayback.cs`, `WorldViewPresentation.cs`, `WorldViewEnvironment.cs`, `StadiumArchitecture.cs`. Profiländerungen in `ClubStadiumProfiles.cs` nur bei einem belegten Profilfehler; vorhandene 48 Vereinsidentitäten erhalten. CLI/Testregistrierung bei Bedarf mitführen.

**Root besitzt** `dist/`, native Regeln/Tempo/Abseits/Elfmeter/Spielstände, JS-Brücke, UI, Android-Gerätezugriff, gemeinsame Versions-/Build-/Workflow-/Changelogdateien und Veröffentlichung. Benötigte Bildfelder als schmale optionale Schnittstelle an Root melden. Keine gleichzeitigen Änderungen anderer Spuren zurücksetzen. `freekickdemo/` bleibt ein eigenes Projekt.

Neue Nutzerpräzisierungen: Eine vollständige 3D-Partie soll ohne Taktikpausen **4–6 Minuten** dauern; Root stimmt den gespeicherten Minuten-/Periodenvertrag ab. Keine Unity-Zeitlupe oder verlangsamte Spieler-/Ballanimation daraus ableiten. Der Pixel-Test wurde erneut auf später verschoben; Claude übernimmt keine Geräteprüfung.

Ergebnis dieses Schritts: aktuelle Quellen-/Assethashes, offene Befunde und eindeutige Übernahme des Editors schriftlich festhalten. Bei bereits erledigten Punkten direkt zur noch offenen Qualitätsprüfung gehen.

## 2. Laufrichtung und Bewegungsvielfalt zuerst

Aus tatsächlichen empfangenen Spielerpositionen acht Bewegungsrichtungen relativ zum Körper prüfen: vorwärts, beide vorderen Diagonalen, beide Seiten, beide hinteren Diagonalen, rückwärts. Jeweils Antritt, normales Laufen, Sprint, Abbremsen und Richtungswechsel. Keeper-Nachstellen und echtes defensives Rückwärtslaufen separat prüfen. Für normales Verfolgen darf die Figur nicht mit dem Rücken zur tatsächlichen Laufrichtung sprinten.

Eine reine Körperdrehung oder Oberschenkeldrehung erfüllt die Anforderung nicht: passende Bein-/Fußanimationen für alle acht Richtungen sichtbar belegen.

Bestehende Clipauswahl, Bewegungs-/Aktionsprioritäten und Pausenvertrag erhalten. Diagonalbewegung muss im Rig sichtbar sein, ohne den bereits seitwärts animierten `keeperShuffleClip` nochmals in dieselbe Richtung zu verdrehen. Neue lokale Blend-/Posebausteine oder selbst erstellte Bewegungen einsetzen, wenn der vorhandene Clipbestand die Lücke nicht schließt. Die Fußphase folgt dem tatsächlichen Weg; der Körper folgt ausschließlich empfangenen Daten. Keine lokale Spiel-KI, Positionsvorhersage oder zweite Aktionsuhr.

Abnahme: tatsächliche Gelenk-/Sohlenmessung in allen acht Richtungen, linkes/rechtes Keeper-Nachstellen und mindestens zwei echte Richtungswechsel; Pause, Rückschau und Seek halten korrekte Posen. Vorher/Nachher-Bilder oder kurze Aufzeichnungen derselben Fixture liefern. Ein bloßer Clipname oder ein Quelltextfund zählt nicht als sichtbarer Nachweis.

### Natürlichere und flüssigere Animationen

Auf Nutzerauftrag vom 10. Oktober gehört die natürliche Bewegungsqualität ausdrücklich zum Paket. Alle betroffenen Abläufe als zusammenhängende Bewegung prüfen: Stand → Antritt → Laufen/Sprint → Bremsen → Stand sowie Kurvenlauf, diagonaler Richtungswechsel und Übergang zwischen Lauf und Ballaktion. Pass, Schuss, Annahme, Zweikampf, Grätsche, Aufstehen und Keeperaktionen sollen weich in die passende Anschlussbewegung übergehen.

Clipwechsel nach tatsächlicher Geschwindigkeit und Bewegungsrichtung phasengerecht überblenden. Fußkontakte und Schrittphase bei Wechseln erhalten; Fußrutschen, abrupte Hüftsprünge, steife Armhaltung und wiederholtes Neustarten desselben Clips vermeiden. Schrittlänge und Frequenz folgen dem gemessenen Weg; Beschleunigen, Abbremsen und Wenden erhalten passenden Körpereinsatz und Gewichtsverlagerung. Kurvenlauf und kleine Korrekturen dürfen nicht wie ständig neu begonnene Standdrehungen aussehen. Kleine natürliche Varianten bleiben deterministische Darstellung und ziehen keinen Zufall aus der Matchsimulation.

Zusätzliche Abnahme: gleiche Szenen vorher/nachher in normaler und verlangsamter Wiedergabe vergleichen; Sohlenkontakt, sichtbares Gleiten und Posekontinuität über die Übergänge messen. Bei unpassendem Clip eigene lokale Bewegungs-/Blendbausteine erstellen. Keine willkürlichen Ganzkörper-Zuckbewegungen zur bloßen Vielfalt. Kontaktzeitpunkte, Ballanker, Pause, Seek und diskrete Ereignisgrenzen bleiben maßgeblich; bessere Übergänge dürfen einen tatsächlich bereits ausgeführten Schuss oder Fang nicht zeitlich verschieben.

## 3. Keeperkontakte und Standards prüfen

Vorhandene bestätigte Fang-/Nachfassfakten prüfen: sichtbarer Ball zwischen erreichbaren Handschuhen, kein Ball über dem Kopf, Körper zum Kontakt, Abstoß zum tatsächlichen Ziel. Fang, Abpraller, Ballverlust, Abspiel und Tor müssen sich unterscheiden. Fehlende alte Ergebnisfelder gelten als unbekannt; fehlender Ballflug darf nicht als bestätigter Fang interpretiert werden.

Je eine natürliche Sequenz Fang/Abpraller/Nachfassen/Abstoß suchen und kennzeichnen. Seltene oder nicht beobachtete Sequenzen zusätzlich als ausdrücklich kontrollierte Fixtures prüfen; keine natürliche Fangfolge behaupten, wenn sie nicht aufgezeichnet wurde. Freistoßschütze und tatsächlich laufende Mauerspieler sollen sichtbar passend vorbereiten. Die native Mauer und Entscheidung bleiben bei Root.

Abnahme: echte WorldCommand-/Rigkontakte, unveränderte native Bilddaten und stabile Übergänge einschließlich Pause/Rückschau. Bestehende Release-119-Tests erweitern, statt denselben Fehler nochmals anders zu implementieren.

## 4. Abseits, Ball und Stadion im kleinen Bild prüfen

Die optionale `WorldFrame.offside={lineX}` zeigt ausschließlich die native Abseitsentscheidung. `lineX` ist bereits mit Spielrichtung und tatsächlicher Feldlänge projiziert. Linie über die tatsächliche Feldbreite; fehlend/null blendet sie aus. Diskrete Ereignisgrenze beim Playback, keine eigene Regelberechnung. Beide Spielrichtungen, normale/größere Geometrie und Pause prüfen.

Ball, Schatten, Vereinsringe, Trikotmuster und Hintergrund bei 844 × 390 und 931 × 448 sowie Desktop vergleichen. Schatten folgt dem sichtbaren Ball; Ringe verwenden Vereinsfarben mit heller/dunkler Kontrastkante. Kameras/Banden/Dächer sollen keine Ballaktion verdecken. Root hat die Android-Fläche gegen ungewolltes Scrollen abgesichert; ein CSS-Versatz wird nicht durch eine zweite Kamerakorrektur kompensiert.

Mindestens vier strukturell verschiedene vorhandene Stadientypen mit tatsächlichem Heimverein vergleichen, darunter Roma und Milano. Nur belegte visuelle Lücken verbessern; Größe/Geometrie des Spielfelds und Spielregeln bleiben unverändert. Originale Vereinsprofile und Sponsoridentität erhalten.

Abnahme: kleine tatsächliche WebGL-Ansichten, Heim-ID/Profilbezug, alle fünf vorhandenen Kameras bei betroffenen Architekturänderungen, normale/reduzierte Stufe und Ressourcenfreigabe. Editorbilder belegen Darstellung; Software-WebGL belegt Funktion. Reale GPU-Bildrate, Hitze oder Speicherverhalten nur aus einer gesonderten Geräteprüfung ableiten, die Root durchführt.

## 5. Kandidat einfrieren und übergeben

Vorhandenen sicheren Ablauf verwenden: Quellenkennung erzeugen, Quellen nach `G:/unity/My project` synchronisieren, die Quellenkennung im Projekt abgleichen, kompilieren, registrierte Suiten einschließlich gezielter neuer Prüfungen ausführen, sichtbare Evidenz erzeugen, WebGL bauen, Manifest erzeugen und alle Dateihashes prüfen. Werkzeuge: `sync-unity.cjs`, `generate-identity.cjs`, `D6Cli.Tests`, `D6Cli.KeeperEvidence`, bei Abseits `D6Cli.OffsideEvidence`, `D6Cli.WebBuild`, `build-manifest.cjs`. CLI-Parameter und Ausgabewege vor dem Aufruf im aktuellen `D6Cli.cs` lesen.

Vor Ausführung die derzeit fest auf `iteration-119` schreibenden `FootballPresentation119Tests.Run`, `OffsidePresentation119Tests` und `D6Cli.OffsideEvidence` auf den eigenen Ausgabeparameter umstellen. Prüfen, dass alle drei den neuen Pfad verwenden; `-d6output` allein reicht im bisherigen Stand hier nicht.

Neue Belege unter `outputs/3d-quality/claude-natural-motion-20261010/` im neuen Arbeitsbaum speichern; `-d6output` nutzen, wo unterstützt. Ein neuer Build darf die Kandidatendateien unter `outputs/platform/unity-web/` ausschließlich im neuen Arbeitsbaum aktualisieren. Historische Nachweise und Masterassets erhalten. Bevorstehende neue Releaseversion bestimmt Root. Kostenpflichtige Providerjobs, Pakete und externe Dienste gehören nicht zu diesem Auftrag. Meshy nur mit Plugin-Skill und `docs/meshy-workflow.md` verwenden; diese Runde beauftragt keine externen Assetjobs.

Fertig erst nach: null Kompilierfehlern, bestandenen relevanten bestehenden und neuen Suiten, Bildnachweisen, konsistenten Quellen-/Build-/Assethashes und prüfbarer Handoffdatei. An Root liefern: geänderte Dateien, konkrete sichtbare Verbesserungen, Quelle/Manifest/Artefakthashes, Prüfkommandos und Resultate, Performance-/Lebenszyklusbefunde, bekannte Grenzen und verbleibende native/Browserwünsche. Root führt unabhängige Prüfung, vollständige native/Unity-Partien, Pixel-Abnahme und Veröffentlichung durch. Ein lokaler Kandidat ist noch kein Live-Release.

## Nur bei Bedarf nachlesen

- Clip-/Aktionslücken: [Animationsaudit](../platform/animation-quality-audit.md), `work/platform/animation/quality-audit.cjs`.
- Rig-/Darstellungsvertrag: [Unity-Fußballpilot](../platform/unity-football-pilot.md), [3D-Zuständigkeiten](../platform/3d-quality-ownership.md).
- Stadien: [Vereinsstadien](../platform/club-stadiums.md), [Unity-Architektur](../platform/3d-quality-unity.md).
- Aktuelle Browser-/Gerätenachweise: [Android-Abnahme](../platform/android-3d-acceptance.md), [Release 119](../release-119.md).

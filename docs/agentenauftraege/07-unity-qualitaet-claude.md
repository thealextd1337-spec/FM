# Unity-Arbeitspaket für Claude: nächste 3D-Iteration

Status: vorbereitet am 9. Oktober 2026. Ein lesender Vorabcheck mit Claude Opus 5.5 wurde am 10. Oktober versucht, aber vom Provider mit „Claude API rate limit reached. Try again later.“ beendet; kein Audit und keine Implementierung erfolgt. Der Provider nennt keinen bestätigten Refreshtermin; der nächste Startversuch richtet sich nach der anschließenden Zeitangabe des Nutzers. Dies ist ein ausführbarer Entwicklungsauftrag, kein Unity-Assetexport.

Der Nutzer nennt anschließend eine Stunde bis zur erneuten Verfügbarkeit. Ein einmalig zu behandelnder Startversuch ist für den 10. Oktober um 01:08 Uhr (Europe/Paris; 9. Oktober 23:08 UTC) eingerichtet. Der technisch stündliche Timer wird beim ersten Auslösen deaktiviert. Laufende Release-119-Prüfungen haben weiterhin exklusiven Buildzugriff; bis zu deren Übergabe darf Claude nur den lesenden Vorabcheck durchführen. Ein erneutes Rate-Limit ist kein ausgeführter Auftrag und startet keine Endlosschleife.

## Startprompt

> Arbeite das Unity-Paket `docs/agentenauftraege/07-unity-qualitaet-claude.md` in der angegebenen Reihenfolge ab. Verwende den aktuellen integrierten Stand, sichere vorhandene Änderungen und liefere einen geprüften lokalen Unity-Kandidaten mit Quellenkennung, Tests, Bildern und WebGL-Manifest. Priorität: sichtbare Bewegungsqualität im schnellen Kleinfeldspiel, anschließend Keeperkontakte und mobile Lesbarkeit. Root integriert Browseränderungen und veröffentlicht. Melde konkrete Lücken und behebe sie innerhalb deines Dateieigentums; bei einer Sackgasse sind eigene lokale Bewegungs- oder Darstellungsbausteine erlaubt.

## 1. Ausgangsstand und Eigentum sichern

Arbeitsbaum: `F:/Neuer Ordner (2)/ChatGPT/Fussballmanager/work/3d-quality-stadiums`, Branch `codex/3d-quality-stadiums-20261009`. Unity-Projekt: `G:/unity/My project`, Editor 6000.6.4f1. Das Hauptcheckout ist kein Ersatz für diesen Arbeitsbaum.

Zuerst `AGENTS.md`, [Entwicklung](../development.md), [Release 119](../release-119.md) und den tatsächlichen geladenen Quellstand lesen. Bei Spielregelfragen zusätzlich den entsprechenden Abschnitt in [Produktentscheidungen](../product.md). Aktuelle Quellenkennung aus `prototypes/match-engine-unity/source-identity.json`, Buildkennung aus `outputs/platform/unity-web/probe-build.json` lesen und neu hashen. Einen früheren Chat-Hash niemals als aktuellen Stand übernehmen.

Release 118 ist derzeit live. Release 119 befindet sich in gemeinsamer Integration; sein späterer Veröffentlichungsstatus steht im Releasebericht. Folgende Arbeiten sind bereits umgesetzt beziehungsweise in der letzten Prüfung: Handschuhanker für bestätigte Fänge, Blick-/Laufrichtungen, diagonale Stride-Korrektur, stärkerer Ballschatten und optionale Unity-Abseitslinie. Die Unity-Übergabe für Release 119 ist abgeschlossen; während dessen finaler Abnahme liegen Editor-, Sync- und Buildzugriff exklusiv bei Root. Die Spur `unity_119` führt inzwischen ausschließlich native Diagnoseprüfungen durch. Claude beginnt Änderungen erst nach der ausdrücklichen Übergabe dieses Zugriffs im delegierten Auftrag. Fehlende Abnahme ist kein Beleg für fehlenden Code.

**Claude besitzt** die erforderlichen Präsentations-/Rig-/Umgebungsdateien unter `prototypes/match-engine-unity/`, zugehörige gezielte C#-Tests, die bestehenden Sync-/Identity-/Manifestwerkzeuge und neue eigene lokale Evidenz. Kernpfade: `FootballAnimation.cs`, `FootballPresentation.cs`, `FootballLocomotion.cs`, `WorldViewContract.cs`, `WorldViewPlayback.cs`, `WorldViewPresentation.cs`, `WorldViewEnvironment.cs`, `StadiumArchitecture.cs`. Profiländerungen in `ClubStadiumProfiles.cs` nur bei einem belegten Profilfehler; vorhandene 48 Vereinsidentitäten erhalten. CLI/Testregistrierung bei Bedarf mitführen.

**Root besitzt** `dist/`, native Regeln/Tempo/Abseits/Elfmeter/Spielstände, JS-Brücke, UI, Android-Gerätezugriff, gemeinsame Versions-/Build-/Workflow-/Changelogdateien und Veröffentlichung. Benötigte Bildfelder als schmale optionale Schnittstelle an Root melden. Keine gleichzeitigen Änderungen anderer Spuren zurücksetzen. `freekickdemo/` bleibt ein eigenes Projekt.

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

Neue Belege unter einem eigenen Pfad `outputs/3d-quality/claude-next-unity/` speichern; `-d6output` nutzen, wo unterstützt. Historische Nachweise und Masterassets erhalten. Bevorstehende neue Releaseversion bestimmt Root. Kostenpflichtige Providerjobs, Pakete und externe Dienste gehören nicht zu diesem Auftrag.

Fertig erst nach: null Kompilierfehlern, bestandenen relevanten bestehenden und neuen Suiten, Bildnachweisen, konsistenten Quellen-/Build-/Assethashes und prüfbarer Handoffdatei. An Root liefern: geänderte Dateien, konkrete sichtbare Verbesserungen, Quelle/Manifest/Artefakthashes, Prüfkommandos und Resultate, Performance-/Lebenszyklusbefunde, bekannte Grenzen und verbleibende native/Browserwünsche. Root führt unabhängige Prüfung, vollständige native/Unity-Partien, Pixel-Abnahme und Veröffentlichung durch. Ein lokaler Kandidat ist noch kein Live-Release.

## Nur bei Bedarf nachlesen

- Clip-/Aktionslücken: [Animationsaudit](../platform/animation-quality-audit.md), `work/platform/animation/quality-audit.cjs`.
- Rig-/Darstellungsvertrag: [Unity-Fußballpilot](../platform/unity-football-pilot.md), [3D-Zuständigkeiten](../platform/3d-quality-ownership.md).
- Stadien: [Vereinsstadien](../platform/club-stadiums.md), [Unity-Architektur](../platform/3d-quality-unity.md).
- Aktuelle Browser-/Gerätenachweise: [Android-Abnahme](../platform/android-3d-acceptance.md), [Release 119](../release-119.md).

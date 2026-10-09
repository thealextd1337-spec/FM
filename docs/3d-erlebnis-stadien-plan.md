# Priorisierte Agenda: 3D-Erlebnis und Vereinsstadien

Stand: 9. Oktober 2026. Nutzerauftrag: vorrangig das 3D-Erlebnis verbessern und schönere, unterschiedliche Stadien je Verein einplanen. Spielerporträts und Jubelbilder entfallen. Der erste umgesetzte Umfang wurde auf den späteren Nutzerauftrag „Veröffentliche“ als [Release 115 veröffentlicht](release-115.md). Dienste oder kostenpflichtige Assetgenerierung wurden nicht beauftragt.

## Verbindliche Prioritäten

1. Qualität des 3D-Erlebnisses einschließlich schönerer, unterschiedlicher Vereinsstadien.
2. Accounts, Anmeldung und die dazugehörigen Rechte-, Offline- und Adminstatistikverträge.

Die parallelen Fachslots konzentrieren sich zunächst auf das 3D-Erlebnis. Accounts sind der anschließende zweite Schwerpunkt, kein gleichrangiger paralleler Hauptausbau. Offene UI- und Geräteprüfungen werden passend zur 3D-Abnahme eingeplant; Cloud, Monetarisierung und Stores bleiben spätere Umfänge.

## Ausgangsstand und Quellen

Die Umsetzung ist auf Nutzerauftrag gestartet. Der eigene Worktree `work/3d-quality-stadiums` basiert auf `e630ebc` (Release 114); die alte Hauptkopie wurde nicht mit laufenden Änderungen vermischt. Zuständigkeiten und der konkrete Darstellungsvertrag stehen in [3D-Umsetzung](platform/3d-quality-ownership.md). Aktuelle Release-Nachweise gehen historischen offenen Statuszeilen älterer Pakete vor.

- [Agentenplan](https://github.com/thealextd1337-spec/FM/blob/main/docs/agentenauftraege/README.md): ein Integrator, höchstens drei parallele Fachspuren, getrennte Zuständigkeiten und echte Startbedingungen.
- [Release 114](https://github.com/thealextd1337-spec/FM/blob/main/docs/release-114.md): veröffentlichter Stand vom 9. Oktober mit Lade-/Fortsetzungskorrekturen, Flutlicht-Korrekturen und überarbeiteten Trikotfarben.
- [Unity-Gestaltung](https://github.com/thealextd1337-spec/FM/blob/main/docs/platform/unity-visuals.md) und [Release 112](https://github.com/thealextd1337-spec/FM/blob/main/docs/release-112.md): erste Flutlicht-/Stadiondarstellung, Schatten, Rasen, ausblendbare Tribünen, Bewegungs-/Kontaktkorrekturen und reduzierte Touch-Qualitätsstufe sind bereits geliefert.
- [Release 113](https://github.com/thealextd1337-spec/FM/blob/main/docs/release-113.md): Feld-/Mannschaftsauswahl und Spielergrundlagen sind integriert; Balancekurven bleiben Kandidaten. Keine physische Mobilmessung oder allgemeine neue Matchkernfreigabe.
- [UI-Nachprüfung](https://github.com/thealextd1337-spec/FM/blob/main/docs/ui-redesign/feedback-2026-10-08.md): echte Zoom-, Smartphone-/Screenreader- und gemeinsame visuelle Besichtigung bleiben gesondert offen.

## Bestätigtes Ziel

- Das sichtbare 3D-Spiel erhält Vorrang vor weiteren Verwaltungs- und Accountausbauten.
- Jeder Verein soll ein wiedererkennbares eigenes Stadionbild erhalten. Der konkrete Umfang und die Zuordnung werden gegen den aktuellen Vereinsbestand ausgearbeitet.
- Stadien werden schöner und unterscheiden sich sichtbar in Architektur und Umgebung, nicht allein durch eine andere Farbe.
- Vereinswappen und Trikots bleiben Teil der Identität. Spielerporträts und Jubelbilder sind keine Ausbauaufgabe; die 3D-Spielfiguren bleiben Bestandteil des Matches.

## Gelieferte erste Iteration

Der lokale Kandidat ist integriert: alle 48 Vereine erhalten unterschiedliche Architekturkombinationen aus acht Stadiontypen mit Tribünen, Dächern, Fassaden, Umgebung und Rasenvarianten. Grätsche und Aufstehen, stehender Zweikampf, Foulstolpern und Torwartnachstellen wurden verbessert. Profil-, Architektur- und Rigprüfungen, 48 Unity-Bilder, WebGL-Build sowie vollständige Browservergleiche bestanden. [Unity-Lieferung](platform/3d-quality-unity.md), [Abnahme und Grenzen](platform/3d-quality-validation.md).

Die nächste 3D-Arbeit umfasst reale PC-/Pixel-Messungen, gemeinsame visuelle Besichtigung und die verbleibenden Luft-/Einwurf-/Keepersequenzen aus dem Audit. Parallel ist der reine [Account-Vertragsvorlauf C01/C02](platform/account-preflight.md) fertig. Produktionsanbindung folgt als zweite Priorität nach den jeweiligen offenen Anbieter-/Integrationsentscheidungen. Kein Release und keine bezahlte Assetgenerierung wurden ausgeführt.

## Ursprüngliche Umsetzungsschritte und Abnahmefolge

1. Aktuellen Code-/Unity-/Buildstand und vorhandene Stadionassets aufnehmen. Sichtbare Qualitätsprobleme mit identischen Matchszenen festhalten; nicht bereits erledigte Paketnamen neu implementieren.
2. Einen Stadionstil und mehrere deutlich unterschiedliche Beispielstadien ausarbeiten. Kleine Vereinsplätze, kompakte Stadtstadien und größere Arenen sind mögliche Typen, noch keine festgelegte Verteilung. Architektur, Tribünendächer, Eingänge, Beleuchtung, Umgebung und Vereinszeichen vergleichen. Ein modularer Bestand ist ein technischer Vorschlag; nicht 48 unabhängige Szenen voraussetzen.
3. Die Beispiele in tatsächlichen Matchkameras und reduzierter Qualitätsstufe prüfen. Sicht auf Ball und Spieler, lesbare Namen, Schatten, Licht, Rasen und Tribünenausblendung gemeinsam betrachten.
4. Nach Sichtprüfung die Vereinszuordnung und weitere Varianten ausbauen. Heim-/Auswärtswahl, neutrale Austragungsorte, beide Feldgrößen und beide Mannschaftsgrößen gegen die aktuellen Spielregeln anbinden. Stadiondarstellung verändert weder Feldregeln noch Ergebnisse, Zufallsfolgen oder Karrierefinanzen.
5. Bewegung, Ballkontakte, Keeperaktionen und Kameraführung parallel anhand belegter Probleme verbessern. Darstellungsfehler und Simulationsfehler getrennt zuordnen; eine grafische Kontaktkorrektur darf keinen fachlich verfehlten Kontakt in einen Erfolg verwandeln.
6. Den integrierten Stand auf PC und den Referenzgeräten Pixel 9a/Pixel 9 Pro XL prüfen. Ladezeit, Bildraten, Ausreißer, Speicher, längere Partien und Wiederaufnahme messen. Die bisherigen Ziele bleiben PC-Laden 10–15 Sekunden und stabile 30 Bilder/s auf beiden Pixels; fehlende Hardwaremessungen bleiben offen.

## Direkt parallel vorbereitbare Fachspuren

Vorgeschlagene Besetzung: ein Integrator für native Simulation, Karriere, Datenbrücke und Nachweiszusammenführung; ein Unity-/3D-Verantwortlicher; ein Stadien-/Assetagent; ein Animationsagent für den A02-Bestandsaudit. Der Unity-Verantwortliche führt die 3D-Umsetzung und besitzt nach ausdrücklicher Pfadreservierung die gemeinsamen Unity-Produktdateien. Die beiden Fachagenten liefern isolierte Assets, Manifeste und Kandidaten, ohne dieselbe Szene oder denselben Renderer parallel zu bearbeiten. Kamera-/Performancearbeit wird in diese Belegung eingereiht; sie eröffnet keinen fünften Slot. Für die abschließende unabhängige Q01-Prüfung einen nach Übergabe freien Slot neu besetzen.

- **Stadien und Umgebung:** Assetinventar, Stil-/Architekturentwürfe, erste klar unterscheidbare Stadionkandidaten und vorgeschlagene Vereinszuordnung. Eigene Stadionassets und Kandidatenszenen; keine gleichzeitigen Änderungen an gemeinsamem Renderer, Matchlogik oder Build.
- **Bewegung und Kontakte:** reproduzierbare Untersuchung von Lauf-/Dreh-/Bremsübergängen, Ballannahme, Pass/Schuss und Keeperaktionen; isolierte Kandidaten gegen einen festgelegten Kontaktvertrag. Native Spielentscheidungen und ihre Integration verbleiben beim zuständigen gemeinsamen Besitzer.
- **Kamera, Performance und Abnahme:** festgelegte Vergleichsszenen, Lade-/GPU-/Speichermessungen, Kamerasicht und reduzierte Qualitätsstufe. Zunächst Messungen und Befundliste; keine konkurrierenden Änderungen an den Szenen der anderen Fachspuren.

Ein Integrator hält Ausgangsstand, Dateieigentum, Verträge und Reihenfolge fest. Gemeinsame Unity-Szene, Renderer, Material-/Lichtgrundlage, Datenadapter und Build werden ausschließlich seriell integriert. Performanceprüfungen auf demselben Gerät laufen nacheinander. Für eine Gesamtprüfung wird ein stabiler Stand eingefroren; die abschließende unabhängige Prüfung darf nicht vom Besitzer der geprüften Produktänderung als eigener unabhängiger Nachweis ausgegeben werden.

Die Spuren können unabhängig vorarbeiten, sobald aktueller Stand und Besitz geklärt sind. Runtime-Anbindung braucht den vereinbarten Vertrag; Messungen brauchen einen eingefrorenen Build; Hardwareaussagen brauchen echte Geräte. Die Fachagenten wurden durch den nachfolgenden Nutzerauftrag „Setze es um“ gestartet; nicht durch den Plan allein.

## Verbindlicher Animationsaudit einschließlich Grätschen

Zusätzlicher Nutzerauftrag vom 9. Oktober 2026: prüfen, welche Animationen für ein vollständiges 3D-Matcherlebnis fehlen, ausdrücklich einschließlich Sliding Tackles/Grätschen. Grundlage ist [A02: Kontaktphasen und Wiederverwendung vorhandener Clips](https://github.com/thealextd1337-spec/FM/blob/main/docs/agentenauftraege/03-plattform-assets-abnahme.md). Alte Browserclips, ein vorhandener Dateiname oder eine frühere Demo belegen keine funktionierende Animation im aktuellen Unity-Match.

Der Audit prüft mindestens:

- Stand, Gehen, Lauf, Sprint, Antritt, Bremsen, Drehung, Seitwärtsschritte und defensives Rückwärtslaufen.
- Dribbling, Annahme am Boden/in der Luft, Pass, Flanke, Schuss, Volley und Kopfball; Vorbereitung, tatsächliches Kontaktfenster und Ausklang.
- Stehender Zweikampf, Block, Grätsche von vorn/seitlich/hinten, Ballgewinn, abgefälschter freier Ball und verfehlte Grätsche. Ausklang und Aufstehen müssen zurück in die Bewegung führen.
- Foulkontakt, Stolpern/Sturz, Reaktion des getroffenen Spielers und Erholung ohne neue Karten- oder Verletzungsregeln.
- Keeperbereitschaft, Nachstellschritte, Fangen, seitliche/hohe Paraden, Abpraller, Aufstehen und Abspiel.
- Anstoß, Einwurf, Ecke, Freistoß und Elfmeter sowie die Übergänge zwischen diesen Aktionen und normaler Bewegung.

Für jede Aktion getrennt festhalten: vorhandener Asset-/Clipnachweis, Eignung am aktuellen Rig, Aktivierung durch tatsächliches Matchereignis, sichtbare Qualität und Übergänge. Die Ergebnisliste unterscheidet **vorhanden und angebunden**, **vorhanden, aber nicht angebunden**, **angebunden mit Qualitätsfehler**, **fehlend** und **noch nicht nachgewiesen**. Pro Befund eine reproduzierbare Szene oder Clipprobe sowie die zuständige Fachspur nennen. Linke/rechte Varianten, beide Spielrichtungen, 30/60 Bilder/s, Pause, Rückschau und Fortsetzung berücksichtigen.

Eine fehlende sichtbare Grätsche kann ein fehlendes Asset, eine fehlende Ereignisanbindung oder ein Blend-/Timingfehler sein; diese Ursachen vor Neuerstellung trennen. Matchlogik entscheidet über Ballkontakt, Foul und Ergebnis. Animation stellt die bestätigte Aktion dar und kann einen misslungenen Tacklingversuch nicht nachträglich erfolgreich machen. Der Audit startet keine kostenpflichtige Generierung. Erst die belegte Lückenliste bestimmt den gezielten Assetbedarf und die Implementierungsreihenfolge.

## Weitere offene Arbeiten

- Größere Stärken-/Saisonstudien sowie Belastungs-, Rollen-, Noten- und Entwicklungskurven kalibrieren; alte Ergebnisse nicht nachberechnen.
- Vollständiger Matchkontaktkern, seltene Regeln, Balleffet und Torrahmenphysik bleiben gesonderte Facharbeiten; aktuelle Teilverbesserungen schließen diese Pakete nicht pauschal ab.
- Flutlicht: echter 200-Prozent-Browserzoom, reale Smartphone-/Screenreaderprüfung und gemeinsame visuelle Besichtigung.
- Accounts und private Adminstatistik bleiben Anforderungen des geplanten accountgebundenen PC-Ausbaus. Anbieter-, Rechte-, Elternfreigabe-, Offline- und Betriebsdetails sind getrennt zu klären. Diese Arbeiten sind keine Voraussetzung für lokale Stadion- und 3D-Qualitätsarbeit.
- Android-Testpaketierung und Folgeupdates können später parallel zum PC-Ausbau erfolgen, sobald App-/Buildweg und Signierung stehen. Cloudfortsetzung, Werbefrei-Kauf, echte Werbung und Stores bleiben eigene spätere Umfänge; iPhone bleibt zurückgestellt.

## Offene Gestaltungs- und Integrationsfragen

Die erste Zuordnung aller 48 Vereine, acht Architekturtypen, Fassadenmotive und Geometriebudgets sind im lokalen Kandidaten umgesetzt und geprüft. Unity folgt bei der Stadionwahl dem bestehenden Heimvereinsvertrag; es wurde keine neue Neutralplatzregel eingeführt. Weitere gestalterische Verfeinerung und reale Ressourcen-/Leistungsabnahme bleiben möglich beziehungsweise offen. Stadionkapazität als Spielregel, Ausbaukosten, Eintrittseinnahmen, Wettermodelle oder neue Zuschauer-/Finanzmechaniken sind nicht Teil des bestätigten Auftrags.

## Abschluss

Fertig bedeutet im jeweiligen beauftragten Umfang: sichtbar unterschiedliche Vereinsstadien, saubere Kamerasicht, belegte Verbesserungen des 3D-Spiels, passende reduzierte Darstellung sowie funktionierende Pause, Halbzeit, Wechsel, Rückschau und Fortsetzung ohne neue Ergebnis-/Speicherfehler. Abgeschlossene Änderungen dokumentieren, passende Tests und Build prüfen. Eine Veröffentlichung bleibt separat; erst dann Versionsnummer erhöhen und Quelle, Build und Live-Seite abgleichen.

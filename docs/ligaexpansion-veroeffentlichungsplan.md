# Ligaexpansion – Veröffentlichungsplan

Stand: 11. Oktober 2026. Auftrag: AP11 ausführen und anschließend Veröffentlichung planen. Die Veröffentlichung wurde auf den Nutzerauftrag vom 11. Oktober 2026 als Release 122 ausgeführt und live abgenommen; Umsetzung und Nachweise siehe [Release 122](release-122.md). Der lokale Arbeitsbaum enthält die kumulierten AP03–AP10-Änderungen; finale Abnahme siehe [AP11](ligaexpansion-ap11.md).

## 1. Offene Abnahme abschließen

1. Vorliegende zehn native und zwanzig synthetische Saisons getrennt bewerten. Der native 67,4-MB-Stand besteht Import, Speicherung mit Backup, Export und Neuladen im Desktopbrowser und auf dem Pixel. Android: etwa 6,99 Sekunden für Import/Validierung/Speicherung/Export, danach 24,71 MB IndexedDB. Eine Welt mit Backup ist gemessen; fünf gleichzeitige Welten und Spitzen-RAM bleiben ungemessen.
2. Sichtbarer Android-Chrome-Start, 14 Spieler, große Spielfeldkonfiguration, natürlicher Timer und positive Nutzersichtprüfung sind nachgewiesen. Der ergänzende Lauf prüft 75,013 Sekunden gewöhnliche Vollbildpause ohne Halbzeit: Bildschirm bleibt ON, Produkt-Wake-Lock bleibt gehalten, Spieluhr steht. Diese Gerätebelege gelten für den dokumentierten Build vor der Grafikintegration; GPU-Frametimes sind nicht gemessen.
3. Alle 64 aktuellen Meshy-Motive einschließlich der überarbeiteten deutschen und türkischen Pokale sind ausdrücklich freigegeben. Die vom Nutzer gewählte Freistellung mit dem Bildgenerator ist abgeschlossen: 64 PNGs und 128 transparente Produkt-WebPs sind lokal integriert. Größen, Identitäten, helle/dunkle Galerie, mobile Browserdarstellung und Offline-Einbettung bestehen die Prüfung. Gerätebelege vor dem Grafikaustausch und neuer Grafikbuild bleiben getrennt dokumentiert.
4. Wirtschaftliche Bandbreiten und die bereits dokumentierten Namens-/Gebietsentscheidungen beurteilen. Bestehende Welten werden nicht nachberechnet; neue Regeln bleiben an ihren gespeicherten Versionskennungen.

## 2. Konkreten Releasekandidaten herstellen

- Den isolierten Expansionsstand mit dem dann aktuellen Hauptzweig vergleichen; zwischenzeitliche Unity-/UI-Veröffentlichungen erhalten. Keine Überschreibung des Hauptstands mit einem älteren Build. Änderungsumfang ohne `freekickdemo/`, lokale SDK-/CLI-Installationen, Zugangsdaten, signierte Meshy-URLs und vollständige QA-Spielstände vorbereiten.
- Fertige Assets mit sicherem Manifest und nachvollziehbarer Aufgaben-/Dateizuordnung sichern. Die Meshy-Arbeitsablage enthält kurzlebige URL-Snapshots und ist kein unverändert zu veröffentlichender Assetordner.
- AP03–AP10-Regel-/Integrationsprüfungen sowie AP11-Runner im Releasekandidaten ausführen. Neue Expansionsprüfungen in die vorhandene Produktionsprüfung aufnehmen. Native Langzeitprüfung als eigenes protokolliertes Gate behandeln; Android und manuelle Grafikfreigabe können CI nicht ersetzen.
- Build erzeugen, beide HTML-Ausgaben vergleichen, Versionsfuß und eingebundene Skripte/Assets prüfen. Source-, Build- und Unityhashes einfrieren; bei anschließender Produktänderung betroffene Nachweise wiederholen.
- Changelog aus „Noch nicht veröffentlicht“ in einen datierten Releaseabschnitt übernehmen und endgültige Versionsnummer festlegen. Alle drei Stände müssen übereinstimmen: Quelle, Build, Live. Aktuelle Basis ist 121; die nächste Nummer wird zum tatsächlichen Release gegen den aktuellen Haupt-/Livestand geprüft.

## 3. Veröffentlichung ausführen, sobald beauftragt

Den geprüften Kandidaten über den bestehenden Veröffentlichungsworkflow ausliefern. Unityassets werden vor dem HTML veröffentlicht und per Hash geprüft. Danach Produktionsworkflow, Liveversionsfuß, sämtliche ausgelieferten Assethashes und aktive Skripte kontrollieren. Echte Live-Smokeprüfung: regulärer Zwölf-Länder-Start, Innsbruck Sport, Sponsor-/Marktfortschritt, Matchpause/Neuladen, beide Cups, Länderwertung, Büro/Lesestatus, Statistikarchive und Deutsch/Englisch. Einen bestehenden Spielstand ohne Migration erhalten und laden.

## 4. Rückfall und Nachkontrolle

Vorherigen verifizierten HTML-/Assetstand als zusammengehöriges Rückfallpaket aufbewahren. Bei Auslieferungsfehlern diesen Stand gezielt zurückstellen und erneut Version/Hashes prüfen. Keine automatische Datenumrechnung, kein Löschen von Browserwelten. Neues Weltformat kann im älteren Client fehlen; deshalb vor Rückfall auf Export-/Recoveryhinweise und eine sichere spätere Fortsetzung achten. Technische Rückkehr zu alten Dateien ist kein Nachweis für Kompatibilität neuer Spielstände.

Nach Veröffentlichung Quellen, Workflow, Liveprüfungen und verbleibende Grenzen im Releasebericht festhalten. Android- oder Grafikfreigabe bleibt niemals durch einen erfolgreichen Build impliziert.

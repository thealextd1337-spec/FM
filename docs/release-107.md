# Veröffentlichung 107: 3D-System und integrierte Hilfe

Der reguläre Hauptspiel-Build enthält den aktuellen Meshy-Charakter mit 34 Clips sowie die physischen Match- und Darstellungsverbesserungen bis v133. Die separate Kamera-Vorschau und freekickdemo werden nicht veröffentlicht.

## Dokumentation im Spiel

Die [deutsche Systemdokumentation](3d-system.md) und [englische Fassung](3d-system-en.md) beschreiben gemeinsame Simulation, Metermaßstab, Module, Meshy-Rig, Bildpuffer, Ballkontakte, Torwartkette, Kamera, Rückschau und Prüfgrenzen. Im Spielmenü und Seitenfuß öffnet „3D-Hilfe“ zuerst die Bedienhilfe und darunter die aufklappbare technische Dokumentation. Der Link mit `?help=3d` öffnet sie direkt.

Der Build generiert escaped HTML und SHA-256-Quellkennungen direkt aus beiden Markdown-Dateien. Simulation, Animationen und Rückschauwiedergabe pausieren beim Öffnen. Der echte Match-Zeitgeber wird angehalten und beim Schließen nur im zuvor laufenden Modus neu gestartet; die zwischenzeitliche Lesedauer wird nicht nachgeholt. Es gibt keine Änderung historischer Spielstände.

## Abnahme

- Dokumentationsgenerator: sichere HTML-Escapes, identische eingebettete Daten, beide Quellhashes und Source-/Build-/Serverintegration.
- Hilfe: Deutsch/Englisch bei 1440 und 390 Pixeln, kein horizontaler Überlauf, unverändertes Match bei direkten Schritten; echter Zeitgeber 550 ms angehalten, keine Zufallsziehungen, anschließende Live-Fortsetzung ohne Aufholen.
- Assets: Quellseite und Einzeldatei-Build laden zwölf individuelle Modelle einschließlich beider Keeper; fehlendes Modell aktiviert die Ersatzdarstellung. Laden verändert keine Matchzufallszahlen; Offline-Modus benötigt keine Netzabfragen.
- Reguläre Matchprüfung: vollständiger 2D-/3D-/Offlinevergleich mit identischer Ereignisfolge, Ergebnissen, Statistik und Ergebnisbuchung; Pausen, Tore, Wechsel, Abseits, Elfmeter, Halbzeit/Ende, Ausrichtung, Kontextverlust und Ressourcenabbau.
- Bestehende Release-Prüfungen einschließlich Vereinswirtschaft, Zahlungsplan, Karriere, Pokal, Nachwuchs, Speicher, Übersetzung und FTPS-Mock. Zwei veraltete Testfixtures an die vorhandene API angepasst: DOM-classList.contains und ausgelagerte Wettbewerbs-Platzlabels. Der Windows-Sandboxfehler beim Aufräumen von Python-Temporärdateien wurde durch einen isolierten unsandboxed Offline-Test geprüft.
- Die native v133-Abnahme bleibt erhalten: 24 Torwartsequenzen sowie 15.972 Bilder aus zwei vollständigen Partien ohne neue sichtbare Warps. Sie ersetzt keine Leistungsabnahme auf echter Mobilhardware.

Prüfberichte: `outputs/3d-documentation-qa-v134.json`, `docs/spieler-nutzer-rig/model-integration-qa-v134.json`, `outputs/world3d-parity-v134.json`, `outputs/release-tests-v107.json`. Ältere 3D-Prüfberichte werden nicht überschrieben.

## Veröffentlichung

Ziel: [reguläres Hauptspiel](https://fussball.cakamper.at/) als Prototyp 107. Commit, Deployment und Live-Datei werden nach dem Upload unten dokumentiert.

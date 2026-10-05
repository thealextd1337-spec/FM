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

Am 5. Oktober 2026 im [regulären Hauptspiel](https://fussball.cakamper.at/) als Prototyp 107 veröffentlicht. [Hilfe direkt öffnen](https://fussball.cakamper.at/?help=3d).

[Release-Commit](https://github.com/thealextd1337-spec/FM/commit/324b2ce40c8343f60047cefb3596a5f7f0bcb3d2) und [Deployment](https://github.com/thealextd1337-spec/FM/actions/runs/37333982255): alle automatischen Spieltests, Build, FTPS-Upload und HTTP-Verifikation erfolgreich.

Quellseite, Offline-Build und Live-Seite zeigen Version 107. Die Live-Datei umfasst 50.181.559 Bytes und entspricht bytegenau dem geprüften Build: SHA-256 `d337567b10edf67a36662b01e8cb2f88e9fad613ba2d131178048538b5fee6ea`. Direkt live im isolierten Browser geprüft: deutsche/englische Hilfe mit identischen Dokumentationshashes, zwölf Meshy-Modelle einschließlich beider Torhüter, keine Browserfehler, angehaltene Partie beim Lesen und korrekte Fortsetzung einschließlich Anstoß-Countdown. [Maschinenlesbare Nachweise](release-107-verification.json).

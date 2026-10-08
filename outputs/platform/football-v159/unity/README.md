# Unity-Darstellung v159

Die drei gemeldeten Fehler wurden zunächst mit einer kurzen Editor-Prüfung
belegt (`baseline-diagnosis.json`): keine Rotation im Weltballrenderer,
Torwartkontakt mit Aktionsgewicht 0 und die alte Aktion im Ankunftsbild.

Der Weltball rollt jetzt anhand des tatsächlich empfangenen Weges. Eine
halbierte Kreisumfangsstrecke ergibt 180° bei 30, 60 und 120 Hz. Seine
Position, Spielregeln, Frischewerte und Spielstände bleiben unverändert.
Die bestehenden schwarzen Ballflächen machen die Rotation sichtbar.

Laufclips verwenden eine gemeinsame normalisierte Schrittphase, eine
geglättete Kadenz und getrennte Ein-/Austrittsgrenzen für Gehen und Sprinten.
Die bestehende Brems-, Dreh- und Körperträgheitsdarstellung bleibt aktiv.

Die vorhandenen Torwartclips wurden am echten Rig vermessen. Eine empfangene
Parade startet im richtigen Bild, Kontakt überspringt den kosmetischen Fade,
seitliches Hechten neigt und senkt die Knochen begrenzt, und der Torwart kann
die linke Hand verwenden. Nicht erreichbare Kontakte strecken keine Glieder.
Bewegung des Spielerwurzelobjekts bleibt vollständig vom Match vorgegeben.

`final-motion-tests.json` enthält 40 neue echte Transform-/Rigprüfungen.
Hinzu kommen 356 bestehende Prüfungen für Bewegung, Masse, Rig, Aktionen und
den Weltvertrag. Der zuständige Hauptagent übernimmt die abschließende
Browser-/WebGL-Besichtigung, damit nur eine GPU-Prüfung gleichzeitig läuft.

Der Editorbuild verwendet den vorhandenen WebGL-Renderpfad in einem
`try/finally`-Vorgang. Grafik-/Qualitätsprofile, Zielplattform, Kompression,
Hintergrundverhalten und die zuvor geöffnete saubere Szene werden erhalten.
`verify.cjs` prüft Quellen, Editorbytes, Manifest, gebaute Dateien und die
Wiederherstellung. Es wurde kein Paket oder 3D-Asset hinzugekauft.

Diagnostik: Vier vorübergehende Verweisfehler während der ersten sequenziellen
Skriptimporte (Unity-Cursor 427–430) bleiben im Konsolenverlauf erhalten; die
fertige Kompilierung ist sauber. Der erste erfolgreiche Build wird als
`build-report-before-byte-sync.json` aufbewahrt. Die abschließende Spiegelung
wurde bytegenau über MCP ausgeführt, nachdem der Texttransport eine zusätzliche
Leerzeile ergänzt hatte. Der finale Build folgt auf diese Korrektur.

Die v158-Quellen, Nachweise und das alte Buildmanifest bleiben eingefroren.
Das alte v158-Datenpaket hat kein bestätigtes vollständiges Zweitarchiv; der
Build war bereits gestartet, als die zusätzliche Archivierungsanweisung
eintraf. Es wurde kein gemischtes Zwischenverzeichnis als Archiv ausgegeben.

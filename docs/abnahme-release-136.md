# Abnahme-Checkliste Release 136

Stand 26. Oktober 2026. Für die Nutzerabnahme auf der Live-Seite (Footer „PROTOTYP 136“), vor allem am Pixel 9 Pro XL. Jeder Punkt schließt erst mit deiner Bestätigung in der [Bugliste](Bugliste.md). Bei einem Fehler reichen Screenshot, ungefähre Spielminute, Ansicht (2D/3D) und eine kurze Beschreibung.

## Vorbereitung

- [ ] Seite neu laden und prüfen, dass der Footer „PROTOTYP 136“ zeigt.
- [ ] **Neue Vereinswelt anlegen.** Ballphysik, KI-Trainer und B28 wirken nur in neuen Partien von Welten, die ab Release 133 angelegt wurden. Ältere Spielstände bleiben unverändert.
- [ ] Mindestens eine ganze Partie in 3D (Unity) und eine in 2D spielen, je einmal auf Kleinfeld und Großfeld.

## 1. Neu in Release 136

- [ ] **Ballphysik 184:** Platzierte Schüsse, direkte Freistöße, Flanken und hohe Bälle krümmen sich sichtbar. Bälle springen auf und rollen aus, Pfosten und Latte lassen sie abprallen. Nichts wirkt ruckartig oder unnatürlich.
- [ ] **KI-Trainer 185:** Gerät der Gegner unter Druck (Rückstand, unterlegen, müde), stellt er um. Im Liveticker und im Spielbericht erscheint eine Meldung zur Umstellung oder zum Wechsel. Er springt nicht ständig hin und her.
- [ ] **B28:** Verteidiger ohne Pressingaufgabe bleiben zwischen Ball und Tor und laufen nicht ziellos vom Ballführer weg.
- [ ] **B29 (3D):** Gesichter zeigen den passenden Hautton, blondes Haar wirkt blond. Kein heller Streifen über Wangen und Nase.

## 2. Seit Release 135 offen

- [ ] **B01:** Live-Partie am Pixel in 2D und 3D flüssig, auch im Vollbild, nach einem Wechsel in den Hintergrund und bei wachgehaltenem Bildschirm. Bekannte Grenze: ein kurzer Hänger etwa alle 15 s beim automatischen Speichern.
- [ ] **B30:** Eine 3D-Partie fällt nicht auf 2D zurück, auch nicht, wenn der Torwart den Ball aufnimmt oder hält.

## 3. Seit Release 133 offen (deine Meldungen vom 17. Oktober)

- [ ] **B23:** Ein Ball, der sichtbar ins Tor geht, zählt als Tor mit Anstoß. Bälle neben oder über das Tor werden korrekt als Abstoß gewertet und erscheinen nicht im Netz.
- [ ] **B24:** Das Dribbling wirkt beim Antritt, Stoppen und Wenden kontrolliert und nicht zappelig.
- [ ] **B25 (3D):** Der Torwart springt bei seitlichen und hohen Schüssen sichtbar zur Seite.
- [ ] **B26 (2D):** Ein freier Ball rollt oder fliegt bis zur Annahme auf seiner Bahn und springt nicht auf die andere Spielfeldseite, auch nicht nach der Halbzeit.
- [ ] **B27 (2D):** Eng beieinanderstehende Spieler tauschen nicht konfus die Plätze.

## 4. Ältere offene Punkte (optional)

Die Korrekturen aus Release 132 (B03, B04, B06, B07, B09–B18) und die Animationsbefunde B02/B05 warten ebenfalls auf deine Abnahme. Eine Übersicht steht in der [Bugliste](Bugliste.md).

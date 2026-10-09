# Pokale und Auszeichnungen: Vektorsammlung 119

Alle 32 vorhandenen Auszeichnungsidentitäten verwenden neue, originale SVG-Grafiken: sechs Länder mit Meisterschaft, nationalem Pokal, Torschützenkönig, Spieler der Saison und Man of the Match sowie Europacup und europäischem Man of the Match.

Die Ligaformen unterscheiden sich als gekrönter Kelch, Sternpokal, schlanke Stele, Meisterscheibe, gerippter Kelch und facettierte Säule. Nationale Pokale haben eigene Gefäße, Henkel und Abschlüsse. Persönliche Auszeichnungen zeigen goldene Fußballschuhe, Bälle auf unterschiedlichen Sockeln und Sternmedaillen. Gold-/Silberverläufe, klare Konturen und kleine Länderbänder bilden eine gemeinsame Sammlung ohne echte Wettbewerbsmarken. Die Grafiken enthalten keine eingebetteten Rasterbilder, sichtbaren Zahlen oder externen Ressourcen.

`dist/trophy-art-v119.js` erzeugt und cached die 32 SVG-Daten-URLs einmal beim Laden. Der Loader muss es unmittelbar vor `world-competition-v62.js` laden. `v62AwardIcon` behält seine bestehende Schnittstelle, Bildklassen und Größen. Der Flutlicht-Wrapper reicht diesen Renderer durch; Profile, Titelarchiv, persönliche Awards, Finalvorschau und Siegerfeier verwenden dieselbe Identität. `image-rendering:auto` am Bild verhindert die bisherige Pixelvergrößerung auch unter den bestehenden Feier-/Profilstyles. Interne SVG-Kennungen bleiben in jeder Bild-Daten-URL isoliert.

Die Bilder bleiben dekorativ (`alt=""`, `aria-hidden="true"`); die vorhandenen benachbarten Auszeichnungstexte und Beschriftungen bleiben zugänglich. Ein zusätzliches escaped `title` benennt Auszeichnung und Land. Unbekannte Zuordnungen verwenden das europäische Man-of-the-Match-Symbol. Die alten PNGs und der historische Fallback ohne neuen Loader bleiben erhalten. Vergabe, Spielstände, Ergebnisse, Fähigkeiten und Zufallsströme ändern sich nicht.

## Lokale Prüfung

Aus dem Repository-Arbeitsbaum mit Node 24:

```powershell
node work/test-trophy-art-v119.cjs
node work/platform/qa/check-trophy-art-v119.cjs
node work/platform/qa/check-trophy-art-v119.cjs --build
```

Der Browserprüfer verwendet die dokumentierte installierte Playwright-Bibliothek und eine eigene headless Edge-Instanz auf einem eigenen Loopback-Ursprung. `--build` prüft zusätzlich den bereits von Root erzeugten Stand `outputs/index.html`; der Prüfer baut oder veröffentlicht nicht. Fehlt die Integration im aktuellen Build, ist das kein bestandener Buildcheck.

Der reine Zuordnungstest prüft den tatsächlichen bestehenden Registryumfang, 32 unterschiedliche selbst enthaltene SVGs, Voll-/Kompaktzuordnung, Cache, unsichere Lookupwerte und historischen Fallback. Der Browserprüfer prüft XML-Decodierung und echte Flutlicht-Aufrufwege einschließlich Profil, Archiv und Siegerdialog. Die Sieger-/Archivbeispiele sind kontrollierte lokale UI-Fixtures, keine natürlich erspielten Titel.

Neue Belege liegen ausschließlich unter `outputs/3d-quality/trophy-art-v119/`: getrennte Kontaktbögen für alle 32 Grafiken in Hell/Dunkel bei 24/64 und 256 Pixeln, echte Siegerdialogansichten sowie Source-/Buildberichte. Je Appstand werden 192 Bilder decodiert und auf glattes Rendering geprüft. Die Bildnachweise belegen Browserdarstellung; sie sind keine Unity-, Android- oder GPU-Leistungsmessung. Die abschließende Versions-/Veröffentlichungsprüfung bleibt bei Root.

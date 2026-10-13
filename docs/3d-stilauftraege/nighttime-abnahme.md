# Nighttime: lokale Demo-Abnahme

Stand 13. Oktober 2026. Die lokale Nighttime-Demo ist funktional abgenommen; keine Veröffentlichung oder physische Android-Freigabe. Sie baut auf Release 130 (`1063ed6f`) auf. Die ursprüngliche Opus-Übergabe bleibt mit ihren damaligen offenen Punkten erhalten: [Gestaltung und Assets](nighttime-handoff.md). Diese Abnahme ergänzt die anschließend tatsächlich ausgeführten Browsernachweise.

## Geprüfter Inhalt und Version

Getesteter eingefrorener Integrationscommit: `622885f78eb5125d423fd550e20fe7cb3667c5d0`. Unity-Quellkennung `3422e9fb1258deffd276c0a4c956f60a4aaabefc13323ce918f023a85eddf330`, Unity-Manifest `2fc55ef32185185887991fe120dbbe0d130305b8b05410735076ac605bcc4899`, HTML `358d343b7dc044ffdde94cd78addfab8106e72365ae4b0302aacd609ac1f11db`. Der finale Stand ergänzt die verwendete Prüfharness und dieses Protokoll; Darstellungsquellen und alle neun ausgelieferten Dateien bleiben bytegleich zum geprüften Integrationsstand. Das Paketmanifest nennt jeweils den tatsächlichen finalen Git-Commit. Vor Übergabe wird gegen diesen neu gebundenen Stand nochmals Paketidentität und vollständige Matchparität geprüft.

Quellen, Originalassets, Shader und WebGL-Artefakte sind in der eigenen Branch `codex/demo-nighttime-20261013` enthalten. Das Buildmanifest und die Paketprüfung binden die lokale Laufzeit an die angegebenen Quellen. Bestehende Regeln, Modelle, Rig, Original- und Pilotclips, Masken, Sohlenkalibrierung und Spielstände bleiben erhalten.

Der abschließende Git-Abgleich sichert zusätzlich elf zuvor automatisch normalisierte Identitätseingaben mit expliziten `-text`-Attributen. Im Arbeitsbaum ändern sich dabei keine Quellbytes; die gespeicherten Git-Objekte erhalten jetzt dieselben geprüften Bytes. Die aus Git-Objekten berechnete Unity-Quellkennung stimmt mit Arbeitsbaum und WebGL-Manifest überein. Alle neun ausgelieferten Dateien bleiben identisch zur bereits abgenommenen Demo; nur Git- und Paketmetadaten werden neu gebunden.

## Tatsächliche Nachweise

- Sonnet-Harness `6b45ea37`, SHA-256 `f44db7ecdb8123f0b57485425c1cfd10497c50050e7fcac3daf361808e14f03c`: 80 Browserprüfungen ohne unbehandelte Seitenfehler. Die tatsächlich geladenen WebGL-Dateien stammen aus dem Nighttime-Paket; kein stiller THREE-Ersatz. Paketdaten vor und nach dem Lauf identisch.
- Vollständige feste native 2D-/Unity-Partien: jeweils 3037 Schritte, gleicher Zustands-/P02-/RNG-Digest `a6d98d83`, gleiche vollständige Nutzdaten-SHA-256 `d0a8785eb42bef9851f2005fce1fa86e1200eb92a113460ca3dd5d4cd2ee8772`.
- Zusätzliche identische Folge aus Pause, Fortsetzen, Halbzeit, Checkpoint und Abpfiff: Digest `38893eb6`, Nutzdaten-SHA-256 `e08fb8a7ac4dfdb20fd0db723421ca6f96ef31c6beec033883090f9bd8fd4c74`.
- Echte Halbzeit und zweite Halbzeit, vollständige Ergebnisbuchung, Tor-Wiederholung eines nativ entstandenen Tores, Rückschau auf tatsächlich aufgezeichneten Bildern und Rückkehr zu Live bestanden. Rückschau verändert keinen nativen Zustand.
- Speicherung, Seitenneuladen und vollständiger Browserneustart im isolierten Profil erhalten Checkpoint, Uhr, Ergebnis, Aufstellung, Positionen, Ball und Ereignisse. Gespeicherte Karriere über die sichtbare Öffnen-Schaltfläche und anschließendes Fortsetzen geprüft.
- 2D-Wechsel und Rückkehr zu Unity sowie kontrollierter Unity-Ausfall und fehlender Build liefern einen sichtbaren, nativ spielbaren Rückfall. Der Ansichtsschalter wurde im Prüflauf per DOM-click ausgelöst; echte Zeigerbedienbarkeit dieses Schalters ist dadurch nicht bewiesen. Pause, Fortsetzen und Öffnen wurden mit Zeigerklicks geprüft.
- Desktop 1280×720 sowie Querformate 844×390 und 931×448, jeweils normal und reduced, mit echter geladenen Qualität und realen Spieleridentitäten geprüft. Acht vorhandene Stadionarchitekturen sind in den Opus-Vergleichsbildern erhalten. Root hat den echten WebGL-Kandidaten zusätzlich im eigenen T3-Inkognito-Preview geladen und angesehen.
- 103 Datei-/HTTP-Prüfungen vor und nach dem Browserlauf bestanden. Die Legacy-Suite besteht im ruhigen abschließenden Lauf 23 Prüfungen. Ihr früherer Rückschaufehler ist wahrscheinlich ein zu kurzes 180-ms-Fenster; diese Diagnose bleibt eine begründete Vermutung. Die neue Harness wartet auf den tatsächlichen Rückschauzustand.

Berichte und Aufnahmen: `outputs/style-demos/nighttime/acceptance-sonnet-r3/`, Root-Preview `outputs/style-demos/nighttime/root-preview/`. Die Suiten und Bild-/Leistungsvergleiche des Gestalters stehen unter `outputs/style-demos/nighttime/editor`, `webgl`, `tests`, `tests-baseline` und `logs`. Frühere Fehl- und Entwicklungsläufe bleiben als solche erhalten.

## Start

Im Nighttime-Checkout: `powershell -File work/style-demos/start-demo.ps1 -Style nighttime`. Lokaler Zugang: `http://127.0.0.1:4411/`, tatsächlicher Quellen-/Paketstand unter `/__build`. [Ausführliche Befehle](demo-start-und-pruefung.md), [Browser-Prüfharness](nighttime-browser-pruefung.md).

## Grenzen

Physisches Android, Mobil-GPU und Wasm-/Grafikspeicher im Browser sind nicht abgenommen. Die funktionalen Browserfälle verwenden einen bestehenden Vereins-/Matchpfad; nicht alle seltenen Ereignisse sind abgedeckt. Historische Kontakt-/Übergangsfehler, Direktfreistoß-Vorbereitung, Live-Verfolgung und situative Tempowahl bleiben geerbte Aufgaben des Redesigns. Keine neuen Matchregeln oder rückwirkenden Berechnungen.

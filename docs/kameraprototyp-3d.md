# 3D-Kameraprototyp im Querformat

Der eigenständige lokale Prototyp erprobt eine erhöhte TV-Kamera mit weitem Blick und sanfter Ballverfolgung. Spielfeld, Ball und zwölf stilisierte Spieler sind echte 3D-Objekte: je Team fünf Feldspieler und ein Torwart. Die Oberfläche übernimmt Dunkelpetrol und Limette aus Doppel 6.

Eine wiederholbare, synthetische Sequenz dauert 28 Sekunden und zeigt Passspiel, Außenbahn, Flanke, Abschluss und Tor. Sie berechnet keine echte Partie und verändert keine Spielstände. Der Prototyp ist weder in die Vereinswelt eingebunden noch veröffentlicht; die Produktionsversion bleibt unverändert.

Die überarbeitete Grafik ergänzt einen deterministisch texturierten Rasen, eine abgestimmte Tagesbeleuchtung, Tribünen mit Sitzplätzen und Zuschauerköpfen, Flutlichtmasten und Trainerbänke. Die gegenüberliegende Tribüne hat ein Dach; die Kameraseite bleibt offen, damit auch die Gesamtansicht frei bleibt. Spieler tragen taillierte Trikots mit Akzenten, sichtbare Stutzen und Schuhe sowie Torwarthandschuhe; Rückennummern haben keinen dunklen Bildkasten mehr. Zuschauer verwenden Instanzen, unbewegliche Körperteile werden je Material gebündelt, damit Details keine unnötigen Zeichenaufrufe erzeugen.

## Öffnen und bauen

Aus dem Projektverzeichnis:

```powershell
node work/camera-prototype-server.cjs
```

Der separate Server baut die Offline-Datei und zeigt die Vorschau unter [localhost:4189](http://localhost:4189/). Nur die Offline-Datei neu bauen:

```powershell
node work/build-camera-prototype.cjs
```

[outputs/camera-prototype.html](../outputs/camera-prototype.html) enthält Bibliothek, Styles, Skripte und Sounds vollständig eingebettet und lässt sich per Doppelklick ohne Internet öffnen. Der normale Build und der Produktionsserver bleiben unberührt.

## Bedienung und Darstellung

- Beide Tore besitzen Rück-, Dach- und Seitennetze. Die seitlichen Querfäden werden durch senkrechte Fäden bis zum geneigten Dach zu vollständigen Maschen ergänzt.
- Drei Kamerasichten: TV, ganzes Spielfeld und nähere Ansicht; Höhe und Sichtwinkel lassen sich zusätzlich einstellen.
- Pause, Neustart, Zeitleiste und Szenensprünge machen denselben Ablauf vergleichbar. Vollbild und Deutsch/Englisch sind verfügbar.
- Die Szene läuft ausschließlich im Querformat. Im Hochformat erscheint bei jeder Bildschirmbreite ein Drehhinweis; Zeit und Audio pausieren. Die Rückkehr ins Querformat setzt einen zuvor laufenden Ablauf fort.
- Audio beginnt stumm und wird erst durch einen Klick oder Tipp eingeschaltet. Pause und Hochformat unterbrechen auch die Stadionatmosphäre.

## Abgrenzung zur echten Spieldarstellung

Die echte Vereinswelt-Anbindung ist getrennt im [3D-Leitfaden](3d-spieldarstellung.md) beschrieben und nutzt dieselbe Grafik aus `dist/pitch-scene-v98.js`. Die verbindlichen Regeln stehen in [product.md](product.md) und die Abnahmebedingungen in [development.md](development.md). 3D darf ausschließlich den Spielfeldrenderer austauschen. Taktik, Formation, Rollen, Spieleranweisungen, Angriffsfokus, Pause, Positions-/Bankwechsel und Rückgängig bleiben in ihren bisherigen Modulen; Banner und Dialoge stammen weiterhin aus der gemeinsamen Oberfläche. Dieser eigenständige Kameraprototyp enthält weiterhin keine echten Matchsteuerungen; seine Szenenknöpfe sind keine Taktikbefehle.

Die bestehenden Tests für Weltmatch, Spieleranweisungen, physische Anweisungswirkung, Aufstellungsraster, Torbanner, Torszene, Matchpräsentation und Live-Spielerinfo wurden nach der Grafiküberarbeitung erfolgreich ausgeführt. Sie bestätigen den erhaltenen 2D-Stand. Die zusätzliche Gleichheitsprüfung und Browserabnahme der echten Anbindung stehen im 3D-Leitfaden.

## Quellen und Sounds

Die Quelldateien liegen in [dist/camera-prototype/](../dist/camera-prototype/). Three.js r160 liegt lokal als `three-r160.min.js` bei; die MIT-Lizenz steht in `LICENSE-three.txt`.

Pass, Schuss, Pfiff, Stadionatmosphäre, Jubel und Netzgeräusch wurden mit SuperCollider 3.14.1 im NRT-Verfahren erzeugt. Die sechs WAV-Dateien haben Stereo, 22,05 kHz und 16 Bit. Das reproduzierbare Skript ist [audio/render.scd](../dist/camera-prototype/audio/render.scd). Mit lokal installiertem SuperCollider:

```powershell
sclang -D dist/camera-prototype/audio/render.scd
```

Das Skript schreibt die Sounds in seinen eigenen Ordner. Die portable Installation unter `outputs/camera-tools/sc/SuperCollider` ist nur optionales lokales Werkzeug und wird nicht mitgeführt.

## Prüfung und offene Abnahme

Die Browserprüfung umfasst Deutsch/Englisch, Szenensprünge, alle Kamerasichten, Audiofreigabe, Pause und die Offline-Datei über `file://`. Geprüft wurden Desktop (1440 × 950), mobiles Querformat (844 × 390), mobiles Hochformat (390 × 844) und Tablet-Hochformat (1024 × 1366), einschließlich angehaltener Zeit und ausgesetztem Audio im Hochformat. Es wurden keine Browserfehler erfasst.

Messungen und Screenshots liegen lokal unter [outputs/camera-inspection.json](../outputs/camera-inspection.json), [Desktop](../outputs/camera-desktop.png), [Flanke](../outputs/camera-cross.png), [Gesamtansicht](../outputs/camera-overview.png), [mobiles Querformat](../outputs/camera-mobile-landscape.png), [Englisch](../outputs/camera-mobile-english.png), [Hochformat](../outputs/camera-portrait.png) und [Tablet-Hochformat](../outputs/camera-tablet-portrait.png).

Die Bildschirmgrößen wurden auf einem Desktop emuliert. Die nutzende Person hat die Funktion der ersten Grafikversion auf einem Mobiltelefon bestätigt. Leistung der überarbeiteten Grafik auf echten Telefonen und eine Hörprüfung der Sounds sind noch offen; eine feste Bildrate ist nicht zugesichert.

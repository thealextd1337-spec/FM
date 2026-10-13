# Klares Low-Poly: Umsetzungsstart

Nighttime ist als lokale Demo funktional abgenommen. Die Low-Poly-Umsetzung beginnt getrennt auf derselben Release-130-Basis und übernimmt ihre Beleuchtung; sie kombiniert den Stil nicht mit Nighttime.

- Eigener Checkout `work/demo-low-poly`, Branch `codex/demo-low-poly-20261013`.
- Eigenes Unity-Projekt `G:/unity/Doppel6-LowPoly-Demo`, Unity 6000.6.4f1. Assets, Metadaten, Packages und ProjectSettings sind kopiert; Library/Temp/Logs wurden nicht kopiert. Expliziter Sync gegen die eigene Release-130-Quelle: 0 abweichende Dateien.
- [Eigene Basissicherung](basis-low-poly-release130.json): 41 Identitätsquellen, drei Originalassets und 166 importierte Dateien. Das historische gemeinsame `basis-release130.json` erfasste die damalige Nighttime-Kopie; für aktuelle Low-Poly-Importpfade gilt die eigene Basissicherung. Der alte Root-Bootstrap hat einen fest eingetragenen Nighttime-Projektpfad und wird hier nicht ausgeführt.
- Start-, Paket- und Browserprüfwerkzeuge sind integriert. Späterer eigener HTTP-Zugang: Port 4412, Stilparameter `lowpoly`, mit `--include work/style-demos` für die Paketbindung.

Opus besitzt Low-Poly-Darstellung, Mesh-/Material-/Importarbeit und dieses Unity-Projekt. Erst ein reversibler Material-/Facettenvergleich, anschließend echte kontrollierte Meshvereinfachung auf dem bestehenden Generic-Rig. Original- und Pilotclips, Kontaktanker, Kleidungsmaske, TEXCOORD2, Sohlenkonturen und Browserkalibrierung bleiben vollständig gültig oder werden meshbezogen korrekt neu erzeugt. Vollständige Bedingungen: [Low-Poly-Auftrag](klares-low-poly-opus55.md) und [Kompatibilität](kompatibilitaet.md).

Sonnet erhält nach der Übergabe den getrennten Browserabnahmeauftrag. Haikus [korrigierte Bestandsprüfung](bestandspruefung-haiku.md) liegt bereits vor. Fable diagnostiziert einen konkreten größeren Blocker mit Logs und Reproduktionsfall; kein vorsorglicher zusätzlicher Agent. Root übernimmt Integration, Versionsbindung und Schlussprüfung. Qualität steht über der Deadline.

# Veröffentlichung 133

Release 133 vom 18. Oktober 2026 enthält den gesamten geprüften SI-Integrationsstand und die anschließenden Clientkorrekturen. Ausgangspunkt ist `086275ef` auf `integration/si-r133`; Veröffentlichung in `work/release-r133` auf `release/r133`. Der Nutzer hat die Veröffentlichung aller integrierten Änderungen ausdrücklich beauftragt. Der Root-Checkout mit seinen lokalen Dokumentänderungen bleibt erhalten.

## Umfang

- Spielerintelligenz 183 mit Uhr, Abwehr, Abschluss, Standards, Laufwegen, Optionen, Feldgrößen und angepasster Kompaktsimulation; Sponsortabelle für neue Welten, Tore-/Remisabstimmung und die bereits integrierten Speicher-/Belastungskorrekturen.
- Clientkorrekturen B23–B27: Höhe von SI-Fehlschüssen, erfundenes Schussausholen beim Dribbeln, seitliche Torwartparaden, Halbzeitprojektion freier 2D-Bälle und Positionssprünge enger 2D-Spielermarker. Der Nutzer bestätigt 2D als betroffene Ansicht der Positionsmeldung. Querformat-Pausenlayout B20 und tatsächliche Laufzeit-Fußversion sind korrigiert.
- Frischer Unity-WebGL-Build aus den integrierten U-1-Quellen, Kennung `7ce6f77fa77d4689e6f9befd4e27ae9bbdfab3ade2dc380d8f000abc9c72c3fe`. Vier hashgebundene Payloaddateien, 58 Manifestprüfungen. Der bereits geprüfte Unity-Binärcode bleibt für die Versionserhöhung unverändert; Produktmetadaten werden wie bisher beim Runtime-Aufruf gesetzt.

Footer und `data-d6-release`, Einzeldatei-Build, Runtime-Cache, Unity-Produktmetadaten und 3D-Hilfedaten tragen gemeinsam 133. Historische Featurekennungen wie 130/183 sind keine Releaseversionen und bleiben erhalten.

## Prüfung und Veröffentlichung

Der vollständige integrierte Ausgangsstand besteht 127 Produktionsbefehle, 21 echte Unity-Browserchecks, 340 Altszenen und zehn Fortsetzungsprüfungen. Alle 2.154 eingefrorenen Quellen-/Build-/Paketdateien blieben während des Gesamtlaufs unverändert. [Clientbericht](client-fixes-r133.md), [versionierte Nachweise](../outputs/client-r133/README.md).

Die Versionserhöhung ändert ausschließlich Veröffentlichungskonstanten und erzeugte Hilfedaten/HTML. Vor dem Push werden Versionsbindungen, frischer Einzeldatei-Build, alle fünf Clientregressionen, Manifest und die Offline-Publikationsprobe geprüft. Der Produktionsworkflow führt auf dem Veröffentlichungscommit alle 127 Tests erneut aus, baut die Seite, lädt zunächst die Unity-Laufzeit und anschließend die Spielseite hoch. `main` wird ohne Umschreiben der Historie aktualisiert.

Nach dem Deployment werden die öffentliche Spielseite sowie Manifest, vier Unity-Dateien und beide Runtime-Dateien mit dem lokalen Paket über SHA-256 verglichen. Der echte Live-Browser muss Release 133 zeigen und eine tatsächliche Vereinsweltpartie mit Unity laden. Lokale Veröffentlichungsnachweise stehen unter `outputs/release-r133/`; der zugehörige GitHub-Actions-Lauf ist der serverseitige Veröffentlichungsnachweis.

## Grenzen

Bestehende Welten, Partien und Ergebnisse werden nicht rückwirkend umgerechnet. SI-Kennungen und Regeln gelten gemäß den gespeicherten Konstruktorverträgen. B05 bleibt mit Animationsspitzen offen; zwei Versuche wurden wegen neuer Grenzverletzungen vollständig zurückgenommen. Die ursprüngliche Tor-/Abstoßszene ist ohne damaligen Spielstand nicht exakt wiederholt. Konkrete visuelle Nutzerabnahmen sowie physische Android-/Dauerlastabnahmen bleiben getrennt; B01 ist weiterhin zurückgestellt. [Bugliste](Bugliste.md).

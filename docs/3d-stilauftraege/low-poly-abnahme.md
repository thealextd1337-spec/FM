# Klares Low-Poly: lokale Demo-Abnahme

Stand 13. Oktober 2026. Der lokale Unity/WebGL-Kandidat auf Release 130 ist funktional abgenommen. Es gibt keine Veröffentlichung oder Android-Gerätefreigabe. Die ursprüngliche [Gestaltungsübergabe](low-poly-handoff.md) beschreibt den früheren Stand; die dortige zusätzliche R18-Regression ist mit der [Bodenkorrektur und ihren Nachweisen](low-poly-ground-fix-validation.md) beseitigt.

## Inhalt und Bindung

Das sichtbare Modell `WorldPlayerLowPoly-v4` hat 2.592 statt 12.668 Dreiecke und 6.926 Rendervertices. Es verwendet denselben Generic-Rig mit 28 Knochen, identischen Bindposes und unveränderten Original-/Pilotclips. Eigene UVs, BaseColor, Kleidungsmaske und Ruheposkoordinaten wurden erzeugt. Ruhigere Stoff-, Rasen- und Stadionmaterialien ergänzen die Facetten. Die Beleuchtung bleibt die von Release 130; Nighttime ist eine getrennte Demo.

Die Bodenmessung verwendet das Originalmesh `WorldPlayer` auf denselben Knochen, ohne es zu zeichnen. Dadurch bleiben Bewegungs-, Kontakt-, Support- und Zeitberechnungen exakt auf Originalstand, während die tatsächliche sichtbare Oberfläche getrennt geprüft wird. Fehlende Bodenmesh-Referenzen verhindern den Build.

Die Unity-Quellkennung lautet `644d9d928be9ea9d3ccd36f7049bbea40a333f9c5cd999dbddcbe5c9cd0211c9`. Alle 46 Identitätseingaben sind bytegleich in Arbeitsbaum und Git-Objekten. Explizite Dateiattribute erhalten ihre Zeilenenden beim Checkout. Das Unity-Manifest ist `f51e0226ad2c29e5c81709d9c70d9bcf375ed4012b9f5a31076e2fcaa9766169`, das Standard-HTML `358d343b7dc044ffdde94cd78addfab8106e72365ae4b0302aacd609ac1f11db`.

Der vollständige Browserlauf prüfte den eingefrorenen Fix-Commit `a6289dc32046875ca13974f7457ff3e608fbaa8d`. Danach änderten sich ausschließlich Editor-Diagnosen, Prüfhilfen, Berichte und Dokumentation. Alle neun ausgelieferten Dateien bleiben identisch zu diesem geprüften Paket. Der finale Demo-Commit und dessen Paketmetadaten stehen unter `/__build`; die abschließende Paketprüfung bindet sie an den sauberen Checkout.

## Nachweise

- [Browserabnahme Runde 4](low-poly-browser-pruefung-r4.md): 390 Prüfungen bestanden, darunter Pause/Fortsetzen, Halbzeit, zweite Halbzeit, Abpfiff und Buchung, Rückschau auf aufgezeichneten Bildern, echtes Tor mit Wiederholung, Speicherung, Neuladen, Browserneustart und spielbarer 2D-Rückfall. Null unbehandelte Seitenfehler; der bewusst erzeugte 404 bleibt dokumentiert.
- Der Browser lud den neuen WebGL-Payload und meldete das sichtbare Mesh sowie `ground=WorldPlayer vertices=9725`. Sieben Architekturtypen wurden in echten Partien geprüft, jeweils normale/reduzierte Qualität und 1280×720, 844×390, 931×448. Acht Typen sind zusätzlich im Editor belegt.
- Vollständige native 2D-/Unity-Parität: jeweils 3037 Schritte, Digest `a6d98d83`, Nutzdaten-SHA256 `d0a8785eb42bef9851f2005fce1fa86e1200eb92a113460ca3dd5d4cd2ee8772`. Zusätzliche Folge mit Pause, Halbzeit und Checkpoint: Digest `38893eb6`.
- Abschließende Unity-Diagnosen auf `d85a2e5d`: `LowPolyGround` 52/52, Bodenprofil 0/3.231 Abweichungen, 342/342 Posen und 150/150 Rutschbilder exakt. `Tests` und `NaturalMotion` bestehen; keine fehlenden, zusätzlichen oder geänderten bestehenden Gates. Die R18-Sperre ist exakt `2102.81884765625`; das historische 1600-Gate bleibt als Originalfehler sichtbar.
- Neue Sichtflächen-QA: tatsächliches Mesh, beide Stiefel, angeforderte Handschuhe einzeln, vorzeichengetreuer Abstand und Abweichung in beide Richtungen. 14.670 Bewegungsbilder und 561 Keeperbilder ohne Verletzung dieser QA-Kriterien. Größte Stiefelabweichung in der Galerie 5,08 mm bei gewählter 10-mm-Vergleichstoleranz. Ein absichtlich um 4 cm schwebendes Mesh wird abgelehnt.
- Gleiche Hardware: keine zusätzlichen Draw Calls durch die Bodenhaut. Der Download wächst gegenüber dem früheren Low-Poly-Kandidaten um rund 0,67 MB auf etwa 91,9 MB WebGL. Die berichteten Bildzeiten sind durch VSync begrenzt und kein CPU-Leistungsnachweis.

Die vollständigen Browserberichte und Root-Prüfung sind unter `outputs/style-demos/lowpoly/final-browser-proof/` gespeichert. Unity-Nachweise liegen unter `outputs/style-demos/lowpoly-fix/validation-r6/`; ältere Grafikaufnahmen verbleiben im ursprünglichen Fix-Checkout und sind im Validierungsdokument lokalisiert. Die abschließende Datei-/HTTP-Prüfung steht unter `outputs/style-demos/lowpoly/final-package-verify.json`.

## Start und Grenzen

Im Checkout `work/demo-low-poly`: `powershell -File work/style-demos/start-demo.ps1 -Style lowpoly`. Zugang: `http://127.0.0.1:4412/?engine=unity`. [Start- und Paketbefehle](demo-start-und-pruefung.md).

Die Originaldarstellung besitzt bereits sichtbare Ball-/Handschuh- und Rasenpenetrationen. Für Fortbewegung und gewöhnliche Aktionen bleiben absolute Grenzen erhalten; Ballkontakte, Keeperparaden und Rutschkörper werden zusätzlich mit der Originaloberfläche derselben Pose verglichen. Die gewählte 1-cm-Vergleichstoleranz ist keine Behauptung identischer Geometrie. Eine zusätzliche absolute Fuß-Ball-Überschreitung von 1,3 mm und geringe Facettenabweichungen bleiben ausdrücklich ausgewiesen.

Linksfuß-Ballkontakte, Handschuhkontakte über einen kontrollierten Fang hinaus und jedes einzelne native Bild sind nicht belegt; native Wiederholungen werden nur jedes sechste Bild gemessen. Der Handschuh-Sentinel trennt die Messgrößen, isoliert aber nicht eine einzige versagende Hand. Der Fehlpfad der zusätzlichen Bildabdeckungsprüfung wurde nicht ausgeführt. Android-/Touch-Geräte, Mobil-GPU und Browser-CPU-Profil sind offen. Einige Ansichtsschalter wurden per DOM-Aufruf geprüft; Zeigerbedienung aller Schalter ist dadurch nicht belegt. Bekannte UI-Überlappung am rechten Bildrand und dunkler Rasen sind im Browserbericht benannt. Diese lokale Abnahme umfasst keine Behebung geerbter Produktfehler.

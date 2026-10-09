# 3D-Qualitätsiteration: lokale Abnahme und Restarbeit

Stand: 9. Oktober 2026. Umsetzung im Worktree `work/3d-quality-stadiums`, Branch `codex/3d-quality-stadiums-20261009`, Basis `e630ebc` (Release 114). Der erste beauftragte Darstellungsumfang ist integriert und lokal geprüft. Es gab keine Veröffentlichung; die Versionsnummer bleibt 114. Bestehende Spielstände und die Matchsimulation erhalten keine neue Berechnung.

## Geliefert

Alle 48 aktuellen Vereine haben eigene, deterministische Architekturkombinationen aus acht Stadiontypen. Tribünen, Dächer, Fassaden, Flutlicht, Umgebung und Rasen unterscheiden sich sichtbar. Die reduzierte Stufe erhält die Stadionidentität; Heimvereinswahl und unbekannte IDs sind geprüft. Es entstehen keine neuen Kapazitäts-, Ausbau- oder Einnahmeregeln.

Die native Grätsche erreicht Unity mit ihrer tatsächlichen Richtung, Kontaktstelle und Phase. Rutschen und Aufstehen, der stehende Zweikampf, Foulverursacher und seitliches Torwartnachstellen erhalten passende Posen beziehungsweise wiederverwendete Bestandsclips. Fortschritt bleibt an Matchbilder gebunden. Die Bilder verändern keine Ballkontakte, Ergebnisse oder Zufallsfolge. Einzelheiten und die Boden-Toleranz stehen im [Unity-Nachweis](3d-quality-unity.md); der [Brückenvertrag](native-slide-presentation.md) belegt die reine Projektion.

## Eingefrorener Stand

Unity-Quellenkennung: `959aea1e62482d85aff5d6c7d1d001f23bb64097f6497fe1389f5cb444128b93`. Quellbytes, 30 Buildmanifestquellen, vier WebGL-Dateien und 48 Renderdateien wurden abgeglichen. Unabhängiger finaler Quellreview ohne offene Befunde; der zuvor gefundene Carrier-IK-Fehler während einer erfolgreichen Grätschenerholung ist behoben und am echten Selektor geprüft.

Unity 6000.6.4f1: bisherige sieben Suiten sowie 396 Profil-, 560 Architektur- und 34 Zweikampfprüfungen bestanden. Die Architekturprüfungen enthalten 10.800 Kamerasichtlinien. WebGL-Build: 90.653.329 Bytes, keine Fehler, drei bekannte Warnungen. Die 48 Editorbilder verwenden das dokumentierte CPU-Bake der tatsächlichen Bones; ihr Nachweis ist getrennt vom laufenden Browser. [Tests, Bilder, Build und Reproduktion](3d-quality-unity.md).

## Tatsächlicher Browserlauf

`work/platform/qa/check-world-unity.cjs --http-build` bestand mit Node 20+ und isoliertem Edge/Software-WebGL: **21 Prüfungen, keine unbehandelten Seitenfehler**. Geprüft wurden reale Aufstellung und IDs, eingefrorene Pause, neue Sitzung bei Wiederherstellung, Wechsel, bestätigte laufende Spieluhr, Rückschau ohne neue Buchung, Tor-/Netzbild, vollständige native/Unity-Partie einschließlich Halbzeit, Ereignissen, Statistiken, Karrierebericht und Finanzen, Auswärtsspiel, 2D-Wechsel, Rückkehr, Ressourcenabbau beim Verlassen, spielbarer Rückfall bei fehlendem Unity-Build sowie Fremdnachrichtenabwehr. Der regulär erzeugte HTML-Build über lokales HTTP überträgt ebenfalls seine tatsächliche Partie. [Bericht](../../outputs/3d-quality/browser/runtime-tests.json), [vollständige Vergleichsdaten](../../outputs/3d-quality/browser/parity-raw.json).

Der erste Testlauf prüfte nach lediglich 1,5 Sekunden nativer Schritte, obwohl noch der Anstoß-Countdown lief. Die korrigierte Prüfung wartet begrenzt auf tatsächlichen Anpfiff und anschließend auf Unitys Bestätigung der laufenden Uhr. Das erforderte keine Änderung an Simulation oder Renderer.

Im T3-Browser wurde außerdem eine vollständige Partie auf großem Feld mit **14 tatsächlichen Spielern** bis Minute 99 ausgeführt: Pause, Rückkehr ins Livebild, Halbzeit und echte JSON-Fortsetzung bei Minute 60. Alle 14 Teilhashes und der Gesamtfingerabdruck **`44417dc8`** stimmen mit der nativen 2D-Referenz und dem zuvor geprüften HTML-Kontrolllauf überein. Bei 303 abgenommenen Bildern betrug die Positionsabweichung gegenüber dem jeweils dargestellten nativen Bild 0 m; keine Spieler oder voll sichtbaren Bälle außerhalb der definierten Grenzen, alle 14 Namensmarker an realen IDs. [T3-Lauf](../../outputs/3d-quality/browser/t3-large6-webgl.json), [native Referenz](../../outputs/3d-quality/native-slide-parity.json), [HTML-Referenz](../../outputs/3d-quality/native-slide-built.json).

Zusätzlich wurde eine tatsächlich native Grätsche bei Minute 25 angehalten, ohne weitere Simulationsschritte: empfangene Phase `slide` mit Fortschritt 0,3077, echte Spieler-ID und bestätigtes WebGL-Bild. Nach drei nativen Schritten war derselbe Spieler im `slideRecovery` bei 0,43. Ein zusätzlicher Nahblick änderte ausschließlich die Diagnosekamera; im laufenden WebGL ist das gebeugte Aufstehen mit Schuhen und Armen sichtbar. Diese Aufnahmen verwenden das normale GPU-Skinning des Browserbuilds, kein Editor-Bake. [Grätschenbild](../../outputs/3d-quality/browser/native-slide-webgl.png), [Erholung im Nahblick](../../outputs/3d-quality/browser/native-recovery-webgl-close.png), [native Aktionsdaten](../../outputs/3d-quality/browser/t3-native-slide-visual.json), [Erholungsdaten](../../outputs/3d-quality/browser/t3-native-recovery-close.json). Einzelbilder ersetzen keine Abnahme aller Kontakt-/Ansatzvarianten und Übergänge.

Der HTML-Abgleich bestätigte außerdem 26 exakt eingebettete Flutlicht-Assets, identische Offline-Kopien und Versionsstand 114. Das sind Funktions- und Ergebnisnachweise. Software-WebGL und lokale HTTP-Auslieferung belegen weder reale Smartphoneleistung noch vollständigen Offline-Netzbetrieb.

## Noch offen, in Prioritätsreihenfolge

Der abschließende Quellaudit wurde auf den eingefrorenen Renderer angepasst: bewegungsbasierter Keeper-Shuffle und der Carrier-Guard werden korrekt erkannt, erledigte Anbindungen erzeugen keine erneuten Implementierungsaufträge. 16 Auditprüffamilien bestanden; von 48 Aktions-/Variantenzeilen sind 33 quellseitig angebunden, acht verwenden generische/teilweise Substitutionen, eine Landepose (`airLand`) fehlt und sechs Folgen/Auslöser bleiben nicht nachgewiesen. Das ist keine zusätzliche visuelle Freigabe. [Aktueller Audit](animation-quality-audit.md), [unveränderter neuer Bericht](../../outputs/3d-quality/animation-audit/unity-959aea-final/report.json).

1. Reale Geräteabnahme auf Pixel 9a/Pixel 9 Pro XL sowie PC: Laden, längere Partien, Bildraten, Ausreißer, Speicher, Touch, Zoom, Pause/Fortsetzung und reduzierte Qualität. Geometriebudgets ersetzen keine gemessenen 30 Bilder/s. Gemeinsame visuelle Besichtigung bleibt Teil der Qualitätsabnahme.
2. Weitere 3D-Sequenzen aus dem [Animationsaudit](animation-quality-audit.md): Luftvorbereitung/Kopfball/Landung, Volley/Flanke, vollständiger Einwurf sowie unterscheidbare Keeper-Fang-/Abpraller-/Abspielketten. Die vorhandene Grätschenpose schließt nicht automatisch jede Herkunfts-/Ergebnisvariante visuell ab.
3. Danach Accountanbindung. Der parallele [C01/C02-Vorlauf](account-preflight.md) ist geliefert und unabhängig geprüft. Provider, gemeinsamer Auth-/Repository-/Routervertrag, Elternverfahren, Offlineherkunft neuer Karrieren und weitere Betriebsentscheidungen bleiben vor der jeweiligen Produktionsintegration offen. Es wurden keine Anbieter gebucht, Accounts angelegt oder Daten gesammelt.

Breite Balancekalibrierung, vollständiger Kontaktkern, Stores und Cloudfortsetzung bleiben eigene Pakete des Gesamtplans. Spielerporträts und Jubelbilder gehören weiterhin nicht zur Agenda.

# Matchblock v132: Rückschau, Ballverfolgung und mobiles Vollbild

Stand: 5. Oktober 2026. Lokal integriert, keine Veröffentlichung. [Regulärer Offline-Build](../../outputs/Doppel-6-Fussballmanager.html). Bestehendes Meshy-Rig mit 34 Clips, keine neuen Credits, Speicherfelder oder Altstand-Nachberechnung.

## Bedienung direkt am Spielfeld

Der Vollbildknopf öffnet das Match über die Browser-Vollbildfunktion. Wenn diese fehlt oder abgelehnt wird, füllt dieselbe Ansicht den verfügbaren Browser-Viewport. Hochformat verwendet weiterhin 2D, Querformat ermöglicht 3D. Rotation, Verlassen, Torbanner, Pause und Fortsetzen bleiben bedienbar. Geräte mit Aussparungen erhalten Safe-Area-Abstände.

Uhr, Spielstand und Spieltyp stehen als kompakte TV-Einblendung links oben im Bild. Bei Pokal-/Europacupspielen kommt die Runde hinzu. Kurze Vereinskürzel und Trikotfarbstreifen sparen Platz; vollständige Vereinsnamen stehen in den zugänglichen Beschriftungen. Die Uhr berücksichtigt Halbzeiten und Nachspielzeit. Die Rückschau verwendet den damaligen Spielstand und die damalige Uhr.

Slider, kleine Bedienicons, Ereignisse und Darstellungsmenü liegen direkt über dem Feld. Auf Geräten mit Maus erscheinen sie bei Mouse-over und blenden beim Verlassen innerhalb von 180 ms aus. Antippen zeigt sie auf Touchgeräten für ungefähr 2,5 Sekunden. Tastaturfokus bleibt sichtbar; die Einstellung für reduzierte Bewegung unterdrückt die Überblendung. Die TV-Anzeige bleibt sichtbar. Kleine Symbole behalten ausreichend große Touchflächen.

## Rückschau über die gesamte Aufnahme

Die bisherige Grenze von zehn Minuten beziehungsweise 3.600 Bildern entfällt. Alle aufgenommenen Szenen der aktuellen Partie bleiben bis zum Verlassen/Neuladen dieser Sitzung verfügbar. Aufgenommen werden die tatsächlich dargestellten Rig- und Ballposen mit sechs Bildern pro Sekunde, die Zwischenbilder werden interpoliert. Keine zweite Matchsimulation und kein Rücksetzen von Ergebnissen.

Tore, Eckbälle, Freistöße, Abseits und Elfmeter erhalten eigene Marker. Die Markierung liegt drei Sekunden vor dem Ereignis; Antippen startet dort, begrenzt durch den Anfang der Aufnahme. Die Beschriftung nennt die tatsächliche Ereignisminute. Kleine Ereignisbuttons zeigen Symbol und Minute; Name und Ereignistyp stehen im Tooltip und in der zugänglichen Beschriftung.

Abspielen/Pause steuert ausschließlich die Rückschau. Die Partie bleibt angehalten, auch beim Erreichen des Aufnahmeendes. Verschieben des Sliders stoppt die Rückschauwiedergabe. „Live“ kehrt zur aktuellen Szene zurück und setzt das Spiel fort. In der Rückschau wird der separate Match-Pauseknopf deaktiviert; nach Rotation ins Hochformat erlaubt er die Rückkehr zum Live-Spiel.

Die Aufnahme bleibt flüchtig und gehört zur 3D-Ansicht im Querformat. Bereits vor dem Start dieser Aufnahme gespielte Szenen, 2D-/Hochformatabschnitte und frühere Browser-Sitzungen werden nicht nachträglich rekonstruiert. Eine ganze durchgehend in 3D betrachtete Partie hat keinen rollierenden Zeitdeckel mehr. Browser-Vollbild und Safe Areas wurden emuliert geprüft; echte iPhone-/Android-Hardware wurde nicht benutzt.

## Hohe Bälle früher verfolgen

Bei einem über die Spieler hinweggehenden hohen Pass erhält je Team ein geeigneter Feldspieler bereits während des Flugs ein Anlaufziel am erwarteten Landepunkt. Geschwindigkeit und Stellungsspiel beeinflussen die Auswahl. Unmittelbar erreichbare Luftzweikampfteilnehmer behalten die bestehende Kontaktplanung; entfernte Verfolger erhalten dadurch keine entfernten Kopfkontakte.

Bei einem frei fallenden Ball verfolgen ausgewählte Feldspieler den aus Höhe, Vertikalgeschwindigkeit und horizontalem Tempo berechneten Landepunkt. Das geschieht während der bisherigen Aufnahmesperre. Normales Bewegungstempo, echte Kontaktprüfung, Standards und gesonderte Torwartlogik bleiben erhalten.

## Prüfung und Nachweise

- [Rückschauprüfung](../../outputs/review-events-qa-v132.json): fünf echte Ereignisarten, keine Marker für verworfene doppelte Standards, 91 archivierte Szenen über 15 Minuten mit erhaltenem Anfang, drei Sekunden Vorlauf, Abspielen/Pause/Ende/Live. Matchdaten bleiben bei Wiedergabe unverändert. Deutsch/Englisch, Desktop und mobiles Querformat.
- [Vollbild-/TV-Prüfung](../../outputs/fullscreen-tv-qa-v132.json): native Browserfunktion und abgelehnter Aufruf, 844 × 390 und 390 × 844, 2D/3D, Rotation, DE/EN, historische Uhr/Spielstand, Torbanner, Pause/Fortsetzen, Cleanup und Hover-Ausblenden. [Bild mit Bedienung](../../outputs/fullscreen-review-mobile-v132.png).
- [Touchprüfung](../../outputs/touch-controls-qa-v132.json): echte emulierte Touchereignisse ohne Hover, Antippen, automatisches Ausblenden, dauerhafte TV-Anzeige und Verlassen des Vollbild-Fallbacks.
- [Frühe Ballverfolgung](../../outputs/highball-pursuit-qa-v132.json) mit [Vorhervergleich](../../outputs/highball-pursuit-baseline-v132.json): beide Teamrichtungen, Verfolgung während Flug/Fall, kein vorzeitiger Besitzerwechsel, normale Schrittgrenzen und Standard-/Keeper-Schutz.
- [Luftballszenen](air-scenarios-qa-v132.json): 2.400 Fähigkeitstrials sowie Reichweite, Luftzweikämpfe, Kopfballtempo, Abseitsausnahme und freier fallender Ball. Die alte Mindesthöhe nach 0,1 Sekunden wurde durch den präzisen Vergleich mit der seit v124 verwendeten Schwerkraft ersetzt; die Physik wurde dabei nicht geändert.
- [Zwei vollständige native Partien](warping-qa-v132.json): 15.639 Renderbilder, beide Halbzeiten, keine neuen sichtbaren Spieler-/Ball-Sprünge und keine durch die Darstellung veränderten Matchdaten. Verdeckte Standardrücksetzungen werden gesondert erfasst.
- [2D-/3D-/Offlinevergleich](../../outputs/world3d-parity-v132.json): identischer Spielverlauf, Ereignisse, Statistik, Wechsel und Ergebnis; angrenzende Browserabläufe geprüft. [Build-/Modellprüfung](verification-v132.json).

Bei der ersten Wiederverwendung des alten Luftballtests wurde dessen v122-Berichtsdatei versehentlich mit aktuellen Ergebnissen überschrieben. Die ursprüngliche Datei ließ sich nicht wiederherstellen. Sie ist ausdrücklich als erneuter v132-Lauf gekennzeichnet und kein unveränderter historischer Nachweis mehr; die damalige Prüfsumme bleibt im alten Verifikationsbericht erhalten. Der neue Test schreibt ausschließlich den separaten v132-Nachweis.

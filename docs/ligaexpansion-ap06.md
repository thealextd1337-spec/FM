# AP06: Horizon Cup und aktive erste Expansionssaison

Stand: 10. Oktober 2026. Lokal im isolierten Arbeitsverzeichnis `work/ligaexpansion-ap03` auf Basis 121 umgesetzt; nicht veröffentlicht. Neue aktive Karrieren verbinden die 192er-Vereinswelt mit zwölf Ligen, zwölf nationalen Pokalen, Crown Cup und Horizon Cup. Bestehende Karrieren und frühere Vorbereitungsstände werden nicht erweitert oder umgerechnet.

## Horizon Cup

`world-expansion-horizon-v166.js` erzeugt den eigenständigen Wettbewerb `S{season}:HORIZON`, `type: europe`, `format: horizon`. Die AP01-Startquelle liefert 32 unterschiedliche Vereine ohne Überschneidung mit Crown: Die ersten acht Länder bekommen drei Plätze, die übrigen vier zwei. Österreich steht vor Belgien; Innsbruck Sport ist `AUT-5`.

Sechzehntelfinale und Achtelfinale schließen nationale Duelle aus. Ab Viertelfinale sind sie erlaubt. Jede Runde wird ohne sportliche Setzung neu ausgelost. Bei geschützten Runden führt die Paarungssuche zuerst Vereine des am stärksten vertretenen verbleibenden Landes zusammen mit einem anderen Land; reproduzierbares Los bestimmt die Reihenfolge. Das ist eine gültige ungesetzte Ziehung, keine Behauptung gleicher Wahrscheinlichkeit aller theoretischen Bäume. Unmögliche oder doppelte Teilnehmerfelder werden abgewiesen.

Alle Runden bis einschließlich Halbfinale haben Hin- und Rückspiel mit umgekehrtem Heimrecht. Das Finale ist einzeln und neutral. Gesamtgleichstand führt direkt zum vorhandenen Elfmeterschießen, ohne Verlängerung oder Auswärtstorregel. Es entstehen 61 Partien und neun Spiele für einen Finalisten. Gespeicherte Runden werden nicht erneut ausgelost.

## Erste Saison spielen und speichern

Die Entwicklungsvorschau `dist/expansion-world-preview.html` erstellt jetzt eine aktive Saison mit `rules.stage: active`. Nach Speicherung lässt sich dieselbe Karriere über die normale Karriereverwaltung öffnen. Sponsorwahl, Jugendbudget und fünf Transfertage führen in die Saison. Eine kompakte mobile Karriereansicht zeigt Kader, eigene Wettbewerbe, alle 26 Wettbewerbe und Ergebnisse; Spielerfähigkeiten bleiben Farbstufen. Eigene Spiele verwenden die vorhandene Aufstellung und physische Matchansicht. Alternativ kann ein Spieltag mit der nativen kompakten Simulation verarbeitet werden.

Der gemeinsame Kalender startet mit 865 angelegten Partien und endet nach allen später erzeugten K.-o.-Runden mit 991: national 852, Crown 78 und Horizon 61. Saisonende ist Tag 224. Der Fortschritt verarbeitet parallele Partien, Belastung, Ergebnisereignisse und bestehende Finanzbuchungen. Eine vorbereitete oder laufende eigene Partie sperrt den nächsten Tageswechsel. Die Vorbereitung eigener Spiele bleibt während der Eröffnungsentscheidungen gesperrt.

`v62IsLeagueFixture` unterscheidet die Crown-Ligaphase von Horizon-K.-o.-Runden. Deshalb erhalten auch Sechzehntel- und Achtelfinale die native Rückspiel-/Gesamtstandsbuchung und die passende Berichtskennzeichnung. Der nationale Meisterabschluss verwendet den neuen letzten Ligatermin für die Feier.

Der Validator rekonstruiert Spielplan und Rundenschlüsse aus Startquelle, Seed und gespeicherten Ergebnissen. Er prüft Paarungen, Termine, Ergebnis-/Spielberichtskonsistenz, Gesamtstände, Elfmeterschießen, Sieger, eindeutige verarbeitete Ereignisse sowie den Abschlusszustand. Export und Import verwenden die gemeinsame Speicherung; Pause und Neuladen einer physischen Partie behalten den vorhandenen Matchzustand. Internationale Spielprämien und Titelboni zeigen den tatsächlichen Cup-Namen. Der Finanzplan berücksichtigt den Cup, an dem der Verein teilnimmt, einschließlich Horizon.

## Nachweise

- `node work/test-world-expansion-horizon-v166.cjs`: 80 vollständige synthetische Horizon-Verläufe, 30 Felder mit maximaler Länderkonzentration und eine gesamte native kompakte Saison mit 991 Ergebnissen, 26 Siegern, 17 eigenen Spielen, Zwischenständen und Export-/Import-Rundlauf. Alte Welterzeugung bleibt identisch. [Ergebnis](../outputs/ligaexpansion-ap06/check.json).
- `node work/test-world-expansion-active-validation-v166.cjs`: native erste 48 Partien, beschädigte Spielstände, Eröffnungs- und Matchsperren, Horizon-Spielberichte sowie Meisterfeier am neuen letzten Ligatermin geprüft.
- `work/check-world-expansion-browser-v166.cjs`: frischer lokaler Edge-Testkontext bei 390 × 844; Sponsorwahl, Jugendbudget, fünf Transfertage, Aufstellung nach Neuladen und pausierte laufende 2D-Partie nach Neuladen. Spielzeit, Ergebnis und Spieleridentitäten bleiben erhalten; kein horizontaler Überlauf und keine Browserfehler. Der gemeinsame Vorschauhost war nicht verfügbar. [Browsernachweis](../outputs/ligaexpansion-ap06/browser.json).
- Crown-Regression mit 300 Ziehungen und 25 K.-o.-Verläufen, bestehende Zahlungsprüfung und zehn bestehende Wettbewerbssaisons bestanden. Build und Assetprüfung erfassen beide neuen Module und identische Offline-Ausgaben.

Der vollständige Saisonlauf nutzt die native kompakte Simulation; er ist keine Prüfung von 991 physisch ausgespielten 2D- oder Unity-Partien. Unity-Gesamtabnahme, Android-Gerät und langfristige Spielbalance bleiben bei AP11.

## Übergabe

Die erste Saison ist ausführbar und abschließbar. Der nächste Saisonstart ist ausdrücklich bis AP07 gesperrt. AP07 liefert Drei-Saisons-Länderwertung, Folgequalifikation und die abgestimmte Wirtschaft einschließlich Sponsoren, Torzielen und Einsatz-Zusagen. Für die neuen Ligaplätze sieben und acht verwendet AP06 vorläufig die vorhandene niedrigste Ligaprämie von 140; dies verhindert ungültige Buchungen, ersetzt aber keine neue Wirtschaftsabstimmung.

AP08 ergänzt Story und Vereinsbüro, AP09 Cup-Grafiken/Awards und AP10 die vollständige Oberflächenintegration. Die 144 neuen Wappen sind weiterhin Entwürfe; individuelle neue Unity-Stadien und die externe Namens-/Grafikabnahme bleiben offen. Seitenfuß und Build behalten Version 121; keine Live-Datei wurde veröffentlicht.

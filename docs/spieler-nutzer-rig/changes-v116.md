# Torwarthandschuhe und Abnahme des Werteeinflusses

Stand: 4. Oktober 2026. Lokal integriert, nicht veröffentlicht; Seitenfuß weiterhin PROTOTYP 105.

## Richtige Handschuhe

Die bisherigen ovalen Handaufsätze ließen Finger frei. Beide Torhüter tragen jetzt Handschuhe entlang der tatsächlichen Hand-, Daumen- und Fingeroberfläche: helle Latex-Fangfläche, dunkler gepolsterter Handrücken mit hellgrünen Akzenten und Handgelenkmanschette mit Verschluss.

Die Handschuhhaut übernimmt die vorhandenen Hand-/Fingergewichte und dasselbe Skelett. Beim Torwart werden die bedeckten nackten Handflächen nicht zusätzlich gezeichnet; dadurch scheint bei animierten Falten keine Haut durch. Feldspieler behalten ihre Hände. Geometrien sind zwischen Torhütern geteilt, mit eigener Referenzfreigabe; je Handschuh 628 beziehungsweise 609 Dreiecke. Das Meshy-GLB und die 32 Clips bleiben unverändert. Keine neuen Credits oder gespeicherten Felder.

![Torwarthandschuh mit Fingern und Verschluss](../../outputs/keeper-gloves-detail-v116.png)

![Torwart mit neuen Handschuhen beim Halten](../../outputs/keeper-gloves-holding-v116.png)

Umsetzung: `dist/player-user-meshy-v107.js`. Regulärer Offline-Build `outputs/Doppel-6-Fussballmanager.html` und Match-/Bewegungsprobe neu erzeugt.

## Prüfung

- `work/check-keeper-gloves-v116.cjs`: Stand, Halten, hoher Fangkontakt, beide Seitenparaden und einhändige Abwehr; endliche Geometrie, pausierter Zustand, gemeinsames Rig und unveränderte Engine. Kontakte innerhalb der bisherigen Fangtoleranz; beide regulären Keeper, keine Feldspielerhandschuhe, geteilte Geometrien und Teilfreigabe geprüft. [Messwerte](gloves-qa-v116.json).
- Bestehende `check-user-ball-actions-v111.cjs`: zehn Aktionsfälle einschließlich Fangen/Erholung, Fangkontakte, Ballmaßstab und Pause bestanden.
- `check-user-model-integration-v112.cjs`: Quellseite, regulärer Offline-Build und Asset-Rückfall bestanden; null Grafik-Zufallsziehungen aus dem Simulationsstrom, keine Karriere beim Laden, regulärer Speicherschlüssel erhalten.
- Modellressourcen-Fixture `check-user-meshy-match.cjs` an die zwei geteilten Hautgeometrien angepasst. Kontaktproben messen die eingeschwungene Pose statt nur den ersten Frame eines inzwischen geglätteten Übergangs. Kontakte, Pause, getrennte Skelette, Teil-/Vollfreigabe und Wiederaufbau bestanden; [Lieferverifikation](verification-v116.json).

Die Vorschau wurde visuell geprüft. Die bestehenden Fangkorrekturen bleiben maßgeblich; die Handschuhe fügen keine eigenständige Fingerbeugeanimation hinzu. Keine zusätzliche Hardware-/Mobil-FPS-Abnahme.

## Spielerwerte müssen den Matchausgang beeinflussen

Die vorhandene [90-Partien-Studie](match-study-v115.md) enthält jetzt sieben explizite Abnahmekriterien. Nicht nur Aktionszähler, sondern Siegquote, deren untere Wilson-Grenze, Siegquotenanstieg gegenüber gleich starkem Gegner und mittlerer Torvorsprung müssen Mindestwerte erreichen. Pass-/Zweikampfquotenvorsprung und Zielschussverhältnis ergänzen die Prüfung.

Alle sieben Kriterien bestanden. Bei unverändertem guten Team A steigt seine Siegquote von 8/30 gegen ein gleich starkes Team auf 30/30 gegen ein schwaches Team: +73,3 Prozentpunkte, 80:1 Tore und +2,63 Tore Vorsprung je Partie. Nur die gegnerischen Fähigkeiten wurden für diesen Vergleich reduziert; Taktik, Anfangsform/-frische, Zufallsstarts und Heimverteilung bleiben gleich.

Die Kriterien wurden nach der ersten explorativen Messung ergänzt und sind keine vorab registrierte Studie. Nachgewiesen ist der gemeinsame Einfluss aller neun Fähigkeiten bei großem Werteabstand. Einzelne Attribute und moderate Abstände sind noch nicht separat belegt. Die fünf dokumentierten Abweichungen der Schuss-/Torwartbilanz bleiben offen beziehungsweise erklärt; die Outcome-Abnahme nutzt die korrekt gebuchten Ergebnisse.

`work/check-player-value-impact-v115.cjs` prüft die Studie und unveränderte physische Engine-Dateien. [Abnahmeergebnis](player-value-impact-qa-v115.json). Die neue Handschuhgrafik ändert die Ergebnisberechnung nicht; daher bleibt die vorhandene 90-Partien-Reihe maßgeblich.

Bestehende Spielstände und Matchregeln unverändert, keine Veröffentlichung.

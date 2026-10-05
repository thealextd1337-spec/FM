# Torwartaktionen, freie Ballaufnahme und Nachschüsse – v120

Im regulären lokalen Spiel sind vier reproduzierte Fehler korrigiert: zu schnelle Wege und entfernte Ballaufnahmen beim Nachsetzen, eine unerreichbare Zugriffsposition gegen zentrale Angreifer, ein Sprung bei der Erholung nach hoher Abwehr und ein zu früher Ballwechsel in die Hände beim bodennahen Zugriff. Gemeinsame Regeln für 2D/3D; vorhandene Meshy-Clips angepasst und normaler Offline-Build neu erzeugt.

## Korrekturen

- **Nachsetzen auf freie Bälle:** Die bisherige Berechnung verwendete normalisierte Platzkoordinaten als Distanz. In der Reproduktion legte ein Keeper in 50 ms 0,48 m zurück und beanspruchte einen noch 1,62 m entfernten Ball. Jetzt gelten echte 3D-Meter und dasselbe Fähigkeitstempo wie beim normalen Lauf. Der Keeper legt bei gleichem Testprofil höchstens 0,169 m zurück; Ballbesitz benötigt weniger als 0,8 m Abstand. Das gilt im gemeinsamen Chaser auch für Feldspieler und verhindert deren entfernte Aufnahme. Sortierung der Kandidaten ebenfalls nach Metern statt verzerrten Koordinaten.
- **Freie Keeperaufnahme:** Im eigenen Strafraum verwendet die Ballaufnahme eine bodennahe Fang- und Haltephase am tatsächlichen Ballpunkt; danach normales Halten und Abschlagen. Außerhalb dieses Bereichs bleibt es Fußkontrolle, ohne Halten in den Händen. Sie wird als Balleroberung behandelt und erzeugt keine zusätzliche Schussparade. Pose bleibt flüchtig im vorhandenen WeakMap, ohne neue Speicherfelder. Sechs zusätzliche Fälle prüfen innen, längs außerhalb und seitlich außerhalb in beiden Spielrichtungen.
- **Eins-gegen-eins:** Die frühere Zielposition konnte vor der Reichweite eines zentralen, gestoppten Angreifers enden. Bei nahen zentralen Bedrohungen rückt der Keeper nun begrenzt bis zur erreichbaren Distanz auf. Torwartfähigkeit und Stellungsspiel bestimmen die Zielposition weiterhin. Außerhalb des Strafraums und bei zu seitlichen Angreifern kein Zugriff; maximal acht Meter Vorstoß in dieser engen Situation. Ballnähe ist erforderlich, ein gestarteter Schuss bricht den Zugriff ab. Die Fangentscheidung erfolgt erst in der Kontaktphase nach 0,4 Sekunden, nicht schon nach 0,12 Sekunden; die bestehende Bewertung Torwartspiel gegen Technik bleibt erhalten.
- **Hohe einhändige Abwehr:** Die Hände greifen nach der Abwehr nur noch kurz zum Kontaktpunkt, statt während der ganzen Aufstehbewegung zum längst abgewehrten Ball zurückzureichen. Der reproduzierte Sprung der Hüfte beim Wechsel zum Aufstehclip sinkt von 0,94 auf 0,20 m pro Renderbild.
- **Bodennaher Zugriff und Fangübergang:** Der passende vorhandene Meshy-Clip für tiefes Fangen ersetzt die zusätzlich verdrehte Seitenparade. Begrenztes Vorwärtsneigen, tatsächlicher Spielerweg und vorbereitete Hände bilden den Zugriff. Die Hände orientieren sich vor dem Besitzwechsel an der zuletzt gezeichneten Ballposition; gehaltene Bälle beginnen dort und werden kontinuierlich an den Körper gebracht. Grobe Szenenschnitte werden von dieser Annäherung ausgenommen. Der größte Ballversatz der Reproduktion sinkt von 1,70 auf 0,34 m pro Renderbild, ohne Sprung beim Besitzwechsel.

Verantwortliche Quellen: [freie Ballaufnahme](../../dist/set-pieces-v50.js), [Keeperziel und Zugriff](../../dist/world-backpedal-v108.js), [native Meshy-Bewegungen und Handkontakte](../../dist/player-user-ball-actions-v111.js). Die Schuss-, Fang- und Abprallwahrscheinlichkeiten wurden nicht neu gewichtet. Die neue Reichweite und das Bewegungstempo können zukünftige Partien verändern; alte Ergebnisse werden nicht nachberechnet.

## Einfluss der Fähigkeiten

Je 500 gepaarte Abschlüsse pro Keeperprofil und Geometrie, drei Geometrien: zentral, nah aus Winkel und seitlich versetzter Keeper. Nur Torwartspiel wird variiert; andere Fähigkeiten, Ausgangspositionen innerhalb des Paars, Alter, Form und Frische identisch. Die nativen Funktionen entscheiden, anschließend wird ihr tatsächlicher Flugabschluss ausgeführt.

| Geometrie | Gezielte Schüsse je Profil | Schwacher Keeper: gehalten | Starker Keeper: gehalten | Fangparaden schwach / stark | Abwehren schwach / stark |
| --- | ---: | ---: | ---: | ---: | ---: |
| Zentral | 318 | 196 (61,6 %) | 243 (76,4 %) | 89 / 133 | 107 / 110 |
| Nah aus Winkel | 318 | 196 (61,6 %) | 243 (76,4 %) | 67 / 114 | 129 / 129 |
| Seitlich versetzter Keeper | 318 | 196 (61,6 %) | 243 (76,4 %) | 67 / 114 | 129 / 129 |

Die aktuelle Schuss-Erfolgsformel berücksichtigt in diesen unbelasteten Fixtures dieselben Fähigkeiten, weshalb Ziel- und Torzahlen bei denselben Seeds für die drei Geometrien identisch sind. Die Geometrie verändert Kontakte und die Abprallwahl. Das sind keine drei unabhängigen Stichproben einer allgemeinen Siegchance.

Zusätzlich 100 echte Zugriffsabläufe pro Profil und Spielrichtung (400 insgesamt): schwache Keeper sichern den Ball jeweils 49-mal, starke 79-mal; beide starten 100-mal und können scheitern. Vor der Positionskorrektur sichern beide Profile in derselben Versuchsanordnung keinen Ball. Es gibt keine entfernte Eroberung. Schussparaden sind von diesen Eroberungen statistisch getrennt. [Physische Baseline](keeper-scenarios-baseline-v120.json), [korrigierte Abläufe und Zähler](keeper-scenarios-qa-v120.json).

## 3D, Kontakte und Ereignisketten

Sieben native Abläufe mit 20-Hz-Physik und 60-Hz-Renderkette, insgesamt 1.785 Bilder:

- Einhändige Abwehr auf beiden Seiten, einschließlich hoher Abwehr.
- Tiefes und hohes Fangen, anschließend Halten.
- Bodennaher Zugriff und Aufnahme eines freien Balls.
- Abwehr → ausgehender Flug → rollender freier Ball → Aufnahme durch Angreifer → Nachschuss → Tor.

Jede Sequenz bestätigt tatsächlichen Handschuhkontakt innerhalb des Ballradius. Schuss-/Torwartbilanzen stimmen, der Nachschuss ist mit dem freien Abpraller als Herkunft und dem anschließenden Tor verknüpft. Keine Matchänderung durch Rendern, keine nicht endlichen Knochenpositionen oder getesteten Hautdurchtritte durch den Rasen; Pause hält Zustand und Pose. Native Kontakt-Fixtures unterdrücken nach dem vorgesehenen Ablauf zusätzliche automatische Aktionen; der Nachschuss wird erst nach der echten Ballaufnahme ausgelöst. Physische Keeper-Schritte bleiben unter 0,25 m pro 50 ms, Hüftschritte unter 0,75 m und Ballschritte unter 1 m pro Renderbild. Diese Schranken kennzeichnen grobe Sprünge, keine allgemeine Naturtreue aller Posen.

Die [visuelle Baseline](keeper-visual-baseline-v120.json) wurde nach den ersten beiden physischen Korrekturen und vor den Grafik-/Fangzeitkorrekturen erfasst. [Korrigierte Renderdaten](keeper-visual-qa-v120.json), [abschließende Hashes und Abnahme](verification-v120.json).

![Bodennaher Fangkontakt](../../outputs/keeper-contact-smother-v120.png)

![Hohe einhändige Abwehr](../../outputs/keeper-contact-parry-right-high-v120.png)

Weitere Kontaktbilder liegen unter outputs/keeper-contact-…-v120.png. Gemessen wird die echte Renderkette; GPU-Zeichnen während der Zahlenmessung ausgelassen, Kontaktbilder mit tatsächlichem GPU-Render erzeugt. Keine Bildraten- oder Mobilhardwaregarantie. Enge Spielerkontakte verwenden weiterhin die vorhandene einfache Abstandstrennung, keine vollständige Körperkollisionsphysik.

## Regulärer Build und Wiederholung

Reguläre 2D-/3D-Partie: gleicher Verlauf, Ergebnis, Ereignisse, Statistiken und Buchung. Anstoß, Tore/Banner/Pause, Abseits, Wechsel, Elfmeter, Halbzeit, Ende, Geräteausrichtung, Kontextverlust, Verlassen, Speicherung und eingebettetes Offline-Audio geprüft. Bestehende native Hand-/Handschuhkontaktprüfung und Ballrollen-/Block-/Luftklärung-/Ecknachlaufprüfung bestanden.

Reproduktion: work/build.cjs und work/generate-user-meshy-match.cjs; work/check-keeper-scenarios-v120.cjs, work/check-keeper-visual-v120.cjs, work/check-user-ball-actions-v111.cjs, work/check-ball-motion-v110.cjs; D6_MODEL_TEST_FILE=outputs/Doppel-6-Fussballmanager.html mit work/check-user-match-regression.cjs work/check-world-pitch3d-browser.cjs; zuletzt work/verify-keeper-block-v120.cjs. Baseline-Option des Szenenrunners nur auf einem gesicherten Vorher-Build ausführen, nicht mit dem korrigierten Stand alte Belege überschreiben.

32 vorhandene Meshy-Clips und unverändertes Modell, keine neuen Credits oder Assets. Prototyp 105, lokale Umsetzung ohne Veröffentlichung. Keine neue 300-Partien-Balanceprüfung; die v119-Ergebnisse bleiben als historische Messung ihres damaligen Builds erhalten. Stellungsspiel-/Abseits-Szenen und Luftduelle sind die folgenden getrennten Blöcke.

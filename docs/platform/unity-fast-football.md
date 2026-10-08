# Unity: schneller offensiver Fußball

Die folgende Messung dokumentiert die ursprüngliche schnelle v152-Iteration. Die anschließende [Rollen-/Taktiklieferung und neue Unity-Kontaktiteration](roles-tactics-football.md) enthält den aktuellen Build und die neuen Abnahmen. P04–P06 sind dort lokal für neue Prüfkarrieren integriert; die historische Vergleichstabelle bleibt unverändert.

Stand: 8. Oktober 2026. Lokal umgesetzt auf Nutzerauftrag. Frühe offensive Läufe, zügige Pässe und Anschlussaktionen sind der Maßstab. Die Partie bleibt beim vorhandenen Matchcontroller; Unity stellt dessen Bewegungen und Kontakte dar.

## Sichtbare Änderung

Neue physische Vereinswelt-Partien erhalten `attackFlow.version:152`. Zwei offensive Spieler bieten getrennte Tiefenläufe an, eine weitere Station unterstützt diagonal; defensive Spieler behalten ihre Absicherung. Nach einem Pass läuft ein offensiver Passgeber weiter. Pläne bleiben kurz stabil und werden bei Ballwechsel, Unterbrechungen, Wechseln oder abgelaufener Gültigkeit verworfen.

Nach einer Ballannahme entscheidet der Ballführer früher. Erreichbare progressive Pässe und Raumpässe werden früh geprüft; in Abschlussnähe bleibt die Torchance vorrangig. Annahmefenster, Fähigkeitsfehler, tatsächliche Ballkontakte, Abfangen, Abseits und Torwartfolgen verwenden weiterhin die vorhandenen Regeln. Laufangebote ziehen keine Zufallszahlen und garantieren keinen erfolgreichen Pass. Vor Ballfreigabe halten Läufer die aktuelle Abseitslinie; danach entscheidet der tatsächliche Freigabeschnappschuss.

Unity verwendet aus dem vorhandenen Asset Gehen, Fußballlauf, Sprint, Rückwärtsbewegung, Bremsen und beide Laufdrehungen. Die Auswahl liest tatsächliche Ortsänderung, Blickrichtung und native Zeit. Ballträger behalten kontrollierten Lauf; Pass-, Annahme-, Schuss- und Torwartaktionen haben Vorrang. Pause friert die Bewegung ein; Rückschau/Zwischenstandsprünge werden nicht als Sprint dargestellt. Keine neue Unity-Spieler-KI, kein Root-Motion-Eingriff und keine zusätzliche Matchuhr.

## Nachweise

Alle Browserprüfungen verwenden eigene lokale HTTP-Seiten und getrennte Testprofile. Geöffnete Nutzerseiten und vorhandene Spielstände werden nicht bedient.

- [Native Vergleichsprüfung](../../outputs/platform/attack-flow/native-tests.json): beide Angriffsrichtungen, getrennte Laufziele, Absicherung, Abseits, Passgeberlauf, Umplanung, JSON-Fortsetzung und unveränderte unmarkierte Matches. Drei Ausgangspartien jeweils vor/nach dem Ausbau vollständig simuliert.
- [13 Unity-Bewegungsprüfungen](../../outputs/platform/attack-flow/locomotion-tests.json); zusätzlich 23 bestehende Rig- und 24 Darstellungsvertragsfälle bestanden.
- [Echte Unity-Spielzüge](../../outputs/platform/contact-pilot/live/report.json): zwölf tatsächlich verwendete Clips einschließlich Lauf-/Sprint-/Brems-/Drehfamilie und eigener Pass-/Annahme-/Schussbewegungen; Gelenkkontakte, Pause und fehlerfreier Lauf geprüft. Screenshots lokal besichtigt.
- [21 Runtimefälle und vollständige Partiegleichheit](../../outputs/platform/world-unity/runtime-tests.json): Halbzeit, Wechsel, sichere Fortsetzung, Rückschau, Tor-/Netzwiederholung, Heim/Auswärts, Fehler-Rückweg und gebautes HTML. [Rohvergleich](../../outputs/platform/world-unity/parity-raw.json) enthält identische native/Unity-Ereignisse, Statistiken, Form, Frische und Finanzbuchungen.
- [Normale](../../outputs/platform/world-render/fixed/report.json) und [vergrößerte Ansicht](../../outputs/platform/world-render/fixed-expanded-deferred/report.json): am Kopf verankerte Namen, Größenänderung, lange Halbzeit und bewegte zweite Hälfte. Absichtlich ausgelöster sichtbarer Antwortausfall bleibt abgesichert.
- [WebGL-Build](../../outputs/platform/attack-flow/build-report.json): `build_8820ab140cf6`, erfolgreich, keine Fehler, drei bestehende Werkzeug-/APIwarnungen. Quellenkennung `2faf6cba102557f97d34fb571329776421be64b62e9786621baedceeba0d90a2`. [Editor vorher](../../outputs/platform/attack-flow/editor-before.json) / [nachher](../../outputs/platform/attack-flow/editor-after.json): ursprüngliche Szene und Einstellungen einschließlich Windows-Ziel, 1024×768 und Brotli wiederhergestellt.

| Ausgangspartie | Schnelle Passanschlüsse vorher → jetzt | Progressive Pässe vorher → jetzt | Schüsse vorher → jetzt | Native Dauer vorher → jetzt |
| --- | --- | --- | --- | --- |
| attack-a | 6 → 31 | 10 → 21 | 5 → 5 | 132,0 → 147,7 s |
| attack-b | 8 → 34 | 16 → 15 | 7 → 5 | 139,0 → 114,5 s |
| attack-c | 7 → 28 | 15 → 19 | 6 → 7 | 165,4 → 114,1 s |

„Schnell“ bedeutet nächster Pass innerhalb von 0,5 nativen Sekunden nach einer erfolgreichen Annahme. Insgesamt 21 → 93 solche Anschlüsse; tatsächliche Tiefenläufe zusammen 1.221,7 Meter und Passgeberläufe 644,3 Meter. Die Dauer zählt alle festen Simulationstakte einschließlich Unterbrechungen, ohne manuelle Halbzeitpause; keine Hardware-/FPS-Messung. Drei Seeds sind ein erster Verhaltensvergleich, keine umfassende Balancefreigabe und keine garantierte Torquote.

## Lokal ausprobieren und Grenzen

[Unity-Spielansicht](http://127.0.0.1:4200/source/index.html?engine=unity): Seite neu laden und eine neue Partie starten. Bereits gespeicherte aktive Partien ohne Kennzeichnung behalten ihr bisheriges Verhalten. Neue kommende Partien nutzen den Ausbau; alte Ergebnisse werden nicht umgerechnet.

Die [Spielergrundlagen aus Welle 2](../player-contracts/integration.md) sind parallel als reine Rechner und getrennte neue Prüfkarriere geliefert. Rollen P04, vollständige Taktik P05, tatsächliche Rollen-/Aktionsnoten P06, Kopfball-/Grätschfamilien und Android-Hardwareabnahme bleiben weitere Pakete. Bewegungsclips sind wiederverwendet, keine zusätzlichen Meshy-Aufträge oder Credits. Unerreichbare Fußkontakte werden weiterhin begrenzt und nicht durch Verschieben von Spieler oder Ball künstlich erfolgreich gemacht. Die drei zurückgestellten UI-Besichtigungspunkte bleiben später.

Keine Veröffentlichung; lokaler Versionsstand 110 bleibt bestehen. Gesamtabgleich: `work/platform/qa/verify-world-delivery.cjs --attack-flow`.

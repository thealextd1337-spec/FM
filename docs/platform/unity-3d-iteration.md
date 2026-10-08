# Unity: Namensschilder, Bewegung und Halbzeit

Stand: 8. Oktober 2026. Lokale Korrektur nach der ersten Vereinswelt-Integration. Die Namen aller Spieler bleiben sichtbar; kleinere Schrift, transparente Flächen und ein zurückhaltender Rahmen machen die Schilder dezenter. Nummer und Nachname gehören weiter zur anklickbaren Spielerinfo; die zugängliche Beschriftung enthält den vollständigen Namen.

## Befunde und Korrektur

Die alte Beschriftung verwendete eine THREE-Kamera, während die Figuren von Unity gezeichnet wurden. Bei gleicher Kameraposition unterscheiden sich die horizontalen Projektionsachsen: Ein Testpunkt links bei X = −10 lag in THREE bei ungefähr 0,328 der Bildbreite, in Unity bei 0,672. Außerdem wurden die Schilder schon vor dem tatsächlichen Unity-Bild aktualisiert. [Projektionsbefund](../../outputs/platform/world-render/projection-diagnosis.json).

Unity sendet jetzt nach dem Rendern die tatsächlichen Kopfpositionen im Bildschirmraum zurück. Der Elternrahmen prüft Fenster, Herkunft, Sitzung und Bildfolge und positioniert die Schilder anhand dieser Punkte. Figuren, Ball, Kamera und Namensanker stammen damit aus demselben dargestellten Bild. Eine Größenänderung braucht keine zweite Projektionsrechnung im Browser.

Ein kurzer Darstellungsbuffer glättet Positionen und Blickrichtungen zwischen tatsächlich empfangenen Bildern. Er berechnet keine zukünftige Bewegung. Pause, Seitenwechsel, Rückschau gegen die Uhr und große Neustart-Sprünge setzen unmittelbar auf das vorhandene Bild auf. Laufphasen bleiben bei wiederholten Bildern erhalten; die automatische Kamera schwenkt im pausierten Spiel nicht weiter. Eine ausdrücklich geänderte Kamera oder Bildgröße bleibt bedienbar.

Das Spielfeld erhält Mittelkreis, Mittelpunkt, Torraum und Elfmeterpunkte. Angepasste Rasen- und Trikotfarben, kleine Bodenschatten und eine Fußballtextur ersetzen die auffälligen Teamkreise und den weißen Ball. Vorhandene Figur und Clips bleiben Grundlage. Die Netzbewegung folgt weiterhin dem aufgezeichneten nativen Torbild.

## Halbzeit in der vergrößerten Ansicht

Die normale Halbzeit funktionierte in der ersten Referenzprüfung. Mit einer zurückgehaltenen echten Unity-Bestätigung ließ sich der berichtete Rückfall reproduzieren: Die Taktikansicht blendet das Unity-Fenster aus, die bisherige Überwachung zählt trotzdem zehn Sekunden ohne Antwort und wechselt auf 2D. Die Nutzerpräzisierung war „vergrößert, aber kein Vollbild“.

Die Überwachung pausiert jetzt ihre Wartezeiten, wenn die Darstellung absichtlich verborgen ist: Taktik-/Halbzeitansicht, 2D-Auswahl, gesperrte Orientierung oder verborgenes Dokument. Nach der Rückkehr läuft nur die verbleibende sichtbare Wartezeit weiter. Ein tatsächlich sichtbarer Renderer ohne Antwort wird weiterhin nach zehn Sekunden durch die bedienbare 2D-Ansicht ersetzt. Auch Fehler des Unity-Laders werden an die bestehende Ausfallbehandlung weitergereicht.

Das ist ein belegter Fehlermechanismus mit reproduzierbarer Korrektur. Die ursprüngliche konkrete Nutzerpartie wurde nicht verändert oder anhand ihres Spielstands untersucht; ihr ursprünglicher Fehlerlog liegt nicht vor.

## Prüfungen

Alle Browserprüfungen verwenden getrennte Profile und neue Testkarrieren über lokales HTTP.

- [Vorher: normale Halbzeit](../../outputs/platform/world-render/baseline/report.json) und [vergrößert mit verzögerter Antwort](../../outputs/platform/world-render/baseline-expanded-deferred/report.json): der zweite Fall reproduziert den falschen 2D-Rückfall.
- [Nachher: normale Ansicht](../../outputs/platform/world-render/fixed/report.json) und [vergrößerte Ansicht mit verzögerter Antwort](../../outputs/platform/world-render/fixed-expanded-deferred/report.json): Namensanker, alle sichtbaren Namen, Größenänderung, echte Pause, elf Sekunden Halbzeit, tatsächlicher Start der zweiten Hälfte und laufende Bewegung. Zusätzlich lange 2D-Auswahl mit Rückkehr und tatsächlicher sichtbarer Antwortausfall.
- [Bild der zweiten Hälfte](../../outputs/platform/world-render/fixed-expanded-deferred/second-half.png): tatsächlicher Unity-WebGL-Build im nativen Vereinswelt-Spiel, keine generierte Visualisierung.
- [22 C#-Prüfungen](../../outputs/platform/world-unity/contract-tests.json): vorhandene Eingangsvalidierung plus synchrones Glätten von Spieler/Ball/Kamera, keine Zukunftsberechnung, unveränderte Eingangsbilder, eingefrorene Pause und unmittelbares Setzen bei Neustart/Rückschau.
- [21 Runtime-Prüfungen](../../outputs/platform/world-unity/runtime-tests.json) und [vollständige Vergleichsdaten](../../outputs/platform/world-unity/parity-raw.json): 2.900 identische Simulationstakte einschließlich Halbzeit, 99 angezeigte Minuten, Ergebnis 0:0; Ereignisse, Statistiken, Wechsel, Spielbericht, Finanzbuchungen, Formhistorie und Frische gleich. Heim/Auswärts, Checkpoint, Wechsel, Tor-/Netzwiederholung, fehlender Build und fremde Fensternachrichten geprüft. Der gebaute HTML-Stand wird in dieser Nachprüfung über HTTP ausgeliefert.
- Bestehende Demokerne: 288 Kontakte/Zwischenstände, 24 Spielzüge, 48 Physikfälle und acht Netzfälle erneut bestanden. [Sechs sichtbare WebGL-Spielzüge](../../outputs/platform/qa/2026-10-08T13-22-27-445Z-unity-play/report.json) mit dem neuen Build ebenfalls bestanden. Der Darstellungsbuffer wird ausschließlich für echte Vereinswelt-Partien aktiviert.
- [Unity-Build](../../outputs/platform/world-render/build-report.json): `build_b309ab39250e`, keine Fehler, drei bestehende Werkzeug-/APIwarnungen. [Manifest und Dateihashes](../../outputs/platform/unity-web/probe-build.json). [Editor vorher](../../outputs/platform/world-render/editor-before.json) und [nachher](../../outputs/platform/world-render/editor-after.json): ursprüngliche Einstellungen einschließlich Windows-Buildziel, 960×600-Webstandard und sauberer SampleScene wiederhergestellt.
- [Finale Auslieferungsprüfung](../../outputs/platform/world-unity/delivery-manifest.json): Quelle und gebautes HTML, 25 eingebettete UI-Dateien sowie beide lokalen Server liefern die aktuelle Unity-Fassung. Die ursprünglichen 262 UI-Fälle je Quelle/Build bleiben als getrennte, frühere Menüabnahme dokumentiert.

## Grenze und Fortsetzung

Die vorhandene Simulation bleibt allein für Spielentscheidungen, Ball, Uhr und Speicherung zuständig. Es gibt keine Änderung von Spielregeln, Spielerfähigkeiten, historischen Ergebnissen oder Karriereformaten. Noch keine Veröffentlichung; Versionsstand 110 bleibt erhalten.

Die sichtbare Fußballqualität braucht weitere Iterationen: getrennte Pass-/Annahmebewegungen, animierte Fuß-/Handkontakte, Richtungswechsel und Keeperbewegungen. Diese Lieferung behebt Projektion, zeitliche Darstellung und den nachgestellten Halbzeitfehler; sie ist keine vollständige neue Unity-Match-KI oder mobile Leistungsfreigabe. Die drei zurückgestellten UI-Besichtigungspunkte und die taktischen Produktpakete bleiben im bisherigen Plan.

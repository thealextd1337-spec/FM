# Release 121 – natürliche Bewegung und mobile Kamera

Stand: 10. Oktober 2026. Auf Nutzerauftrag veröffentlicht und auf der tatsächlichen Live-Seite abgenommen. [Doppel 6 live](https://fussball.cakamper.at/).

## Umfang

Die Unity-Darstellung verwendet richtungsabhängige Laufposen in acht Richtungen, stabilisierte Übergänge, gemeinsame Schrittphasen, begrenzte Fußlocks und tatsächliche Sohlenkonturen des Spielermeshes. Antritt, Bremsen, Kurven, Armhaltung und schräges Dribbling wurden überarbeitet. Torhüter führen bestätigte Fangkontakte mit erreichbaren Armen zum Körper; ein Ball bleibt beim bestätigten Halten zwischen den Handschuhen. Native Positionen, Blickrichtung, Kontakte, Spieluhr, Zufallsfolge und P02 bleiben maßgeblich.

Die Browserkamera verschiebt bei naher Seitenlinie in den Ansichten „follow“ und „sideline“ Kamera und Ziel gemeinsam. Bei größerem Spielfeld bleibt der Abstand zwischen Ball und Fokus an der nahen Seitenlinie an die ursprüngliche Kamera angepasst. Dadurch bleibt der Ball über der unteren Bedienleiste; die bestehende Interpolation übernimmt den Übergang. Die kompakte mobile Statistikansicht aus Release 120 bleibt enthalten.

## Nachweise

- Claude-r2: 14 Unity-Suiten mit 2.318 bisherigen Prüfungen sowie 1.071/1.071 Bewegungsgates; 143 Bewegungsszenarien und 26 Determinismusprüfungen. [Übergabe](../outputs/3d-quality/claude-natural-motion-20261010/r2/handoff.md), [Vorher/Nachher](../outputs/3d-quality/claude-natural-motion-20261010/r2/final/before-after.json).
- Root hat Quellenkennung, alle vier WebGL-Dateien, 32 Manifestquellen und 59 Editorprojektkopien unabhängig neu geprüft: [Hashnachweis](../outputs/release-121/identity-verification.json). Quellenkennung `affd013bcc8e6b8528ba407f9d24f860221dad19af14416509ac5e0461371032`.
- Eine unabhängige lesende Quellprüfung fand keine konkreten Releaseblocker; native Autorität, Pause/Seek, Handschuhkontakt und WebGL-Sohlenkontur waren deren Schwerpunkt.
- Kameraprüfung `work/test-world-pitch3d-v98.cjs`: unabhängige Perspektivprojektion für 60 Kombinationen aus drei Bildschirmgrößen, zwei Ansichten, fünf Balllagen und beiden Feldgrößen; mindestens 14 % Platz über dem unteren Rand. Dieser Test gehört jetzt auch zum Produktionsworkflow.
- Tatsächlicher WebGL-Build im Vollbild: 30 Fälle auf größerem Spielfeld mit 844×390, 931×448 und 1280×720 Pixeln. Ballprojektion stammt aus der gerenderten Unity-Kamera; native Uhr bleibt pausiert. Kleinster Abstand vom unteren Rand: 14,94 %. Kein Browserfehler. [Messungen](../outputs/release-121/camera/checks.json), [kleine Ansicht an der nahen Seitenlinie](../outputs/release-121/camera/844-follow-near.png).
- Vollständiger WebGL-/Native-Vergleich auf dem finalen Stand: 33 Integrationsprüfungen bestanden, einschließlich Halbzeit, Pause, Rückschau/Seek, JSON-Fortsetzung, Wechsel, Torwiederholung, tatsächlicher Bewegung, P02, Rollen-/Entwicklungsbuchungen, 2D-Rückweg und Offline-HTML über HTTP. Beide vollständigen Partien liefen 2.771 identische native Ticks und endeten 1:0 in Minute 97; Ereignisse, Statistiken, Karriere, Finanzen und Spielerbuchungen stimmen exakt überein. Keine Browserfehler; Quellen, HTML und Unity-Build bleiben im Lauf unverändert. [Abnahme](../outputs/release-121/world-unity/runtime-tests.json).
- Build, DE/EN-Hilfe, alle 26 eingebetteten Flutlicht-Dateien und read-only Unity-Vertrag lokal bestanden. Produktions- und Live-Abnahme sind separat unten dokumentiert.

Der Browserrunner der vorhandenen Halbzeitprüfung verglich zuvor nach einem Resize eine gerenderte Projektion mit einer neueren ACK aus einem zweiten Browseraufruf. Ein begrenztes Warten erfasst jetzt dieselbe Beobachtung atomar, einschließlich unveränderter Spieler-/Viewport-/Sequenzanforderungen. Die anfänglichen Fehlerlogs bleiben lokal erhalten. Dies ist eine Prüfrunnerkorrektur, keine gelockerte Produktanforderung. Eine zweite Quellprüfung fand den unstetigen Beginn der Großfeldkorrektur; dieser beginnt jetzt mit einer kontinuierlichen Gewichtung bei null. Ein zusätzlicher Grenztest verhindert den Sprung bei 13 Metern.

## Veröffentlichung und Live-Abnahme

Der [Produktionslauf 38048077381](https://github.com/thealextd1337-spec/FM/actions/runs/38048077381) für Produktcommit `7e7f161244badbebc50457f9a7e95ee99f49bf83` ist erfolgreich abgeschlossen: alle 95 Produktionskommandos, Einzeldatei-Build, Unity-Auslieferung samt öffentlicher Hashprüfung vor der neuen Spielseite und FTPS-Upload mit Live-Dateiprüfung. Quellseite, Footer, DE/EN-Systemhilfe, Build und tatsächliche Live-Seite tragen Version 121. Produktquellen und Build blieben während Veröffentlichung und Live-Abnahme eingefroren.

Die mit `Cache-Control: no-cache` geladenen acht Live-Dateien stimmen bytegenau überein: Spielseite, Unity-Manifest, vier WebGL-Dateien und beide iframe-Dateien. Die Live-Spielseite hat 50.875.346 Bytes und SHA-256 `255f01480a66b5c9bb2b1f963636ba7fdf1e104457fcb70815b634a633eab16a`. Die Unity-Quellenkennung ist `affd013bcc8e6b8528ba407f9d24f860221dad19af14416509ac5e0461371032`, Manifest-SHA-256 `b7d544824c39a514a2fff3c085e5e10d26323b677e311b4e44c92538a0541f52`. [URLs, Größen, Dateihashes und CI-Schritte](../outputs/release-121/live-hashes.json), [Veröffentlichungsnachweis](../outputs/release-121/publication.json).

Auf der tatsächlichen HTTPS-Live-Seite bestanden acht Integrationsprüfungen und 30 Kamerafälle in einem isolierten Edge-Profil. Unity bestätigt die echte Testpartie und alle Spielerkennungen, lädt das aktuelle Manifest und verwendet die native Großfeldgeometrie 81,6 × 52,8 Meter. Pause lässt Uhr, Ball, Ergebnis und Zufallsfolge unverändert; Fortsetzen liefert echte Bewegung und native Uhr, Rückschau und Seek erhalten Ergebnis und Ereignisse. Die Kamerafälle verwenden 844×390, 931×448 und 1280×720 Pixel, beide korrigierten Ansichten und fünf Balllagen. Die tatsächliche gerenderte Ballprojektion bleibt sichtbar; kleinster Abstand zum unteren Rand: 14,94 %. Kein Browserfehler. [Live-Browserergebnis](../outputs/release-121/live-browser/checks.json), [844×390 nahe Seitenlinie](../outputs/release-121/live-browser/844-follow-near.png), [931×448 nahe Seitenlinie](../outputs/release-121/live-browser/931-sideline-near.png).

Die beiden vollständigen Vergleichspartien gehören zur lokalen Abnahme des identischen eingefrorenen Pakets; sie wurden für Release 121 nicht zusätzlich vollständig live wiederholt. Die Live-Abnahme prüft einen echten kurzen Matchabschnitt und die beschriebenen Darstellungs-/Bedienfälle. Mobile Browser-Viewports ersetzen keine physische Android-Prüfung.

## Grenzen und offene Arbeit

Der zweite Claude-Auftrag endete nach gesicherter Übergabe mit dem tatsächlichen Providerfehler „Claude API rate limit reached. Try again later.“. Dieser r2-Lauf ist beendet; Release 121 wurde unabhängig von Root abgenommen. Auf Nutzerauftrag ist ein neuer einmaliger r3-Versuch für den 10. Oktober um 16:38 Uhr Europe/Paris vorgesehen (`14:38:22.309Z`). Dessen Timer deaktiviert sich vor dem Start; es gibt keinen automatischen Quota-Retryloop. Der Folgeversuch gehört nicht zu diesem eingefrorenen Release.

Android-Hardwareleistung, Wake Lock und Appwechsel sind nicht bestätigt. Der Nutzer prüft den veröffentlichten Stand selbst. Die Kamera- und Animationsnachweise aus dem Editor ersetzen diese Geräteprüfung nicht.

Offen bleiben der native Sprung vom gehaltenen Ball zum Abstoßpunkt, einzelne abrupte native Blickrichtungswechsel sowie ein spätes Stoppfenster mit 1.874 Grad/s außerhalb der Bewegungsgates. Die Spitzen nativer Blickrichtungswechsel sind nicht validiert. Ein natürlicher Ablauf Parade → Abpraller → Nachfassen wurde in der Stichprobe nicht beobachtet. Die 48 bestehenden Stadionprofile bleiben erhalten; die tatsächlichen Heimstadien Roma, Milano, Torino und Bologna wurden im Editor mit zwei Qualitätsstufen geprüft. Keine neuen 32 Stadionmodelle wurden erstellt.

Die gewünschten 4–6 Minuten pro vollständiger 3D-Partie und durchschnittlich 10–16 Schüsse beider Teams sind separate native Aufgaben und in dieser Darstellungsänderung noch nicht umgesetzt.

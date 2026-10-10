# Release 121 – natürliche Bewegung und mobile Kamera

Stand: 10. Oktober 2026. Lokaler Integrationskandidat, noch nicht veröffentlicht.

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
- Build, DE/EN-Hilfe, alle 26 eingebetteten Flutlicht-Dateien und read-only Unity-Vertrag lokal bestanden. Produktions- und Live-Abnahme werden nach deren tatsächlichem Abschluss ergänzt.

Der Browserrunner der vorhandenen Halbzeitprüfung verglich zuvor nach einem Resize eine gerenderte Projektion mit einer neueren ACK aus einem zweiten Browseraufruf. Ein begrenztes Warten erfasst jetzt dieselbe Beobachtung atomar, einschließlich unveränderter Spieler-/Viewport-/Sequenzanforderungen. Die anfänglichen Fehlerlogs bleiben lokal erhalten. Dies ist eine Prüfrunnerkorrektur, keine gelockerte Produktanforderung. Eine zweite Quellprüfung fand den unstetigen Beginn der Großfeldkorrektur; dieser beginnt jetzt mit einer kontinuierlichen Gewichtung bei null. Ein zusätzlicher Grenztest verhindert den Sprung bei 13 Metern.

## Grenzen und offene Arbeit

Der zweite Claude-Auftrag endete nach gesicherter Übergabe mit dem tatsächlichen Providerfehler „Claude API rate limit reached. Try again later.“. Er läuft nicht weiter; es gibt keinen automatischen Quota-Retry. Der Kandidat wird deshalb unabhängig von Root abgenommen.

Android-Hardwareleistung, Wake Lock und Appwechsel sind nicht bestätigt. Der Nutzer prüft den veröffentlichten Stand selbst. Die Kamera- und Animationsnachweise aus dem Editor ersetzen diese Geräteprüfung nicht.

Offen bleiben der native Sprung vom gehaltenen Ball zum Abstoßpunkt, einzelne abrupte native Blickrichtungswechsel sowie ein spätes Stoppfenster mit 1.874 Grad/s außerhalb der Bewegungsgates. Ein natürlicher Ablauf Parade → Abpraller → Nachfassen wurde in der Stichprobe nicht beobachtet. Die tatsächlichen Heimstadien Roma, Milano, Torino und Bologna wurden im Editor mit zwei Qualitätsstufen geprüft; keine neuen 32 Stadionmodelle wurden erstellt.

Die gewünschten 4–6 Minuten pro vollständiger 3D-Partie und durchschnittlich 10–16 Schüsse beider Teams sind separate native Aufgaben und in dieser Darstellungsänderung noch nicht umgesetzt.

# Release 116: schnelles Kleinfeldspiel und mobile Erkennbarkeit

Am 9. Oktober 2026 auf Nutzerauftrag „Stells online“ veröffentlicht und live abgenommen. Basis Release 115; Arbeitsbranch `codex/3d-quality-stadiums-20261009`. `freekickdemo/` bleibt unverändert.

## Umfang

Neue physische Partien erhalten dynamischere Antritte, Bremsen und Drehungen, gezielte Tiefen-/Anschlussläufe und weiche Rückkehr in aktuelle taktische Räume. Aktive Zielspieler-Anspielangebote bleiben erhalten. Hohe Vorwärtspässe ergänzen blockierte Bodenwege; kurze progressive Bodenpässe haben Vorrang. Die tatsächlichen nativen Ausführungs-/Kontaktregeln und P02 bleiben maßgeblich. Bestehende gespeicherte unmarkierte Partien behalten ihren bisherigen Ablauf; keine Neuberechnung.

Unity-Spieler erhalten Vereinsringe mit heller/dunkler Kante und durchgehendem/segmentiertem Muster. Die Wachhaltefunktion folgt jetzt den tatsächlichen Vereinswelt-, Vollbild- und App-Rückkehrzuständen. Spielerporträts und Jubelbilder bleiben deaktiviert. [Umsetzung, Messungen und Grenzen](platform/mobile-match-readability.md).

## Prüfung

Vor der Versionsanhebung bestanden sechs native Vergleichspartien, exakte Altmatch-/Zufallsparität, echte Luftannahmen mit Drehvorbereitung in beiden Richtungen, 18 Wake-Lock-Prüfungen, 136 Unity-Ringprüfungen und der WebGL-Build. Vier vollständige HTML-Build-Partien mit Standard/fünf und größer/sechs bestätigen identische Unity-/Native-Ergebnisse, Pause, Halbzeit und echte JSON-Fortsetzung. Der unabhängige Quellreview fand einen Konflikt mit Zielspieler-Angeboten; die Korrektur ist über die tatsächliche Rollenkette geprüft und abschließend ohne offenen konkreten Befund abgenommen.

Release 116 hebt Quelle, beide Footer-Setter, generierte DE/EN-3D-Hilfe, HTML-Build und Runtime-Cacheadresse gemeinsam an. Unity-Quellenkennung bleibt `61abeca81ae558b301e832e1bde22745d0556d71a5b385ea7d2d51b5ada246e6`; der bereits geprüfte WebGL-Build wird unverändert veröffentlicht. Die lokale Freigabe verlangt alle 86 exakten Produktionskommandos, Quellen-/Buildmanifest und eine vollständige Partie auf der tatsächlichen HTML-Fassung 116. Nachweise werden unter `outputs/release-116/` gespeichert.

Alle [86 Produktionskommandos](../outputs/release-116/preflight.json), [63 gemeinsamen Releaseprüfungen](../outputs/release-116/candidate.json) und [49 Unity-Manifestprüfungen](../outputs/release-116/unity-manifest-verify.json) bestanden. Beide Offline-Kopien haben den HTML-SHA-256 `b5bae5adfbbdd0895180c74e652384b9c43fc45863c5a1ae5bffd384a4822698`. Die vollständige Standard/fünf-Partie auf HTML 116 liefert mit Unity und nativ identische 14 Teilhashes und Gesamtfingerabdruck `fea01da1`, Ergebnis 1:1, einschließlich Pause, Halbzeit und echter JSON-Fortsetzung. Der zusätzliche T3-Inkognito-Lauf hat denselben Fingerabdruck. [Releasevergleich](../outputs/release-116/candidate-parity.json), [T3-Partie](../outputs/release-116/t3-candidate.json). Die 14 mobilen Browserprüfungen wurden auf HTML 116 erneut erfolgreich ausgeführt.

## Veröffentlichung und Live-Abnahme

Releasecommit [`3dc1965`](https://github.com/thealextd1337-spec/FM/commit/3dc1965a4db7045c62aad03d9e358aea8099019d) ist auf `main`. [Produktionslauf 37946198734](https://github.com/thealextd1337-spec/FM/actions/runs/37946198734) bestand einschließlich Spieltests, Build, zuerst geprüftem Unity-Upload und abschließendem HTML-Upload. [Deploymentnachweis](../outputs/release-116/deployment.json).

Die [Live-Seite](https://fussball.cakamper.at/) liefert **Release 116**. Alle **71 Release-/Live-Prüfungen** bestanden, einschließlich bytegenauem Abgleich von HTML, vier Unity-Builddateien, Manifest, iframe und Runtime-JavaScript. HTML-SHA-256 unverändert `b5bae5adfbbdd0895180c74e652384b9c43fc45863c5a1ae5bffd384a4822698`; Unity-Quellenkennung unverändert. [Live-Hashes](../outputs/release-116/live-hashes.json).

Eine vollständige Standard/fünf-Partie mit zwölf tatsächlichen Spielern wurde auf der Live-Seite im eigenen T3-Inkognito-Profil ausgeführt. Pause, Rückschau-Rückkehr, Halbzeit und echte JSON-Fortsetzung funktionieren. Die Partie endet bei Minute 100 mit 1:1; alle 14 Zustands-/Buchungsteile und Gesamtfingerabdruck `fea01da1` stimmen exakt mit der nativen Referenz überein. Keine unbehandelten Seitenfehler. In 172 abgenommenen Bildern beträgt die gemessene Spielerpositionsabweichung 0 m; zwölf reale Namensmarker, keine beobachteten Spieler-/sichtbaren Ballgrenzverletzungen. [Live-Partie](../outputs/release-116/live-unity.json). Nach Reload zeigen Footer und generierte 3D-Hilfe erneut 116; eine frisch gestartete Szene bestätigt `paceVersion=162` und zwölf bestätigte Spieler derselben geladenen Sitzung im pausierten Viewport-Vollbild, ohne horizontalen Überlauf. [Reload-/UI-Nachweis](../outputs/release-116/live-ui.json), [tatsächliche Vereinsringe](../outputs/release-116/live-team-rings.png). Alle Browserfälle verwenden synthetische Karrieren im eigenen Profil; Nutzerkarrieren bleiben unverändert.

## Grenzen und nächste Arbeit

Physisches Android-Wachhalten, GPU-Leistung und das tatsächliche Spielgefühl bleiben am Gerät abzunehmen. Drei native Vergleichsseeds sind keine breite Balancefreigabe und garantieren keine höhere Torzahl. Danach folgen die offenen Luft-/Einwurf-/Keepersequenzen aus dem Animationsaudit; Accounts bleiben der nächste große Schwerpunkt nach der 3D-Abnahme. Die Account-Verträge sind vorbereitet, produktive Auth-/Backendanbindung ist nicht Bestandteil dieses Releases.

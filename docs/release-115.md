# Release 115: Vereinsstadien und Zweikampfqualität

Veröffentlicht am 9. Oktober 2026 auf Nutzerauftrag „Veröffentliche“. Basis Release 114; Arbeitsbranch `codex/3d-quality-stadiums-20261009`. Keine Änderungen an `freekickdemo/`, Matchentscheidungen oder bestehenden Spielständen. Die Accountlieferung umfasst ausschließlich Dokumentationsverträge.

## Sichtbare Änderungen

- Alle 48 Vereine haben deterministische eigene Architekturkombinationen aus acht Stadiontypen. Tribünen, Dächer, Fassaden, Flutlicht, Umgebung und Rasen unterscheiden sich; die reduzierte Stufe behält die Stadionidentität. Kamerasicht und Dachausblendung sind geprüft.
- Native Grätschen und Erholung werden mit vorhandener Phase, Richtung und Kontaktstelle nach Unity übertragen. Grätsche/Aufstehen, stehender Zweikampf, Foulverursacher und seitliches Torwartnachstellen erhalten passende Posen und vorhandene Clips.
- Spielerporträts und Jubelbilder bleiben deaktiviert. Feldregeln, Ball-/Foulentscheidungen, Ergebnisse, Zufallsfolge und Karrierefinanzen bleiben beim bestehenden nativen Match.

## Nachweise vor der Veröffentlichung

Der [abgenommene 3D-Stand](platform/3d-quality-validation.md) enthält 396 Profil-, 560 Architektur- und 34 Zweikampfprüfungen, 10.800 Kamerasichtlinien, 48 tatsächliche Unity-Renderbilder und den erfolgreichen WebGL-Build. Unity-Quellenkennung: `959aea1e62482d85aff5d6c7d1d001f23bb64097f6497fe1389f5cb444128b93`. Die Quellen bleiben für dieses Release eingefroren; die Versionsanhebung betrifft HTML, Footer und Runtime-Cacheadresse.

21 Browserprüfungen und die vollständige große 14-Spieler-Partie mit Pause, Halbzeit und JSON-Fortsetzung bestanden. Alle 14 Teilhashes und Gesamtfingerabdruck `44417dc8` stimmen mit der nativen Referenz überein. Grätsche und Erholung wurden zusätzlich im normalen laufenden WebGL-Skinning besichtigt. Der [aktuelle Animationsaudit](platform/animation-quality-audit.md) hat 16 Prüffamilien und eine getrennte Restliste.

Nach der Versionsanhebung wurde die tatsächliche HTML-Fassung 115 erneut über lokale HTTP-Auslieferung mit großer Geometrie und 14 Spielern vollständig ausgespielt: Unity und native Darstellung stimmen exakt überein, einschließlich Pause, Halbzeit, JSON-Checkpoint und Ergebnis 0:2. [Releasevergleich mit HTML-Hash](../outputs/release-115/candidate-parity.json).

Der Produktionsworkflow enthält jetzt zusätzlich die beiden gezielten Brücken-/Grätschenprüfungen. Die Veröffentlichungsprüfung führt seine 85 vollständigen Kommandos erneut aus, prüft Footer und generierte DE/EN-3D-Hilfe 115 in Quelle und Build, identische Offline-Kopien sowie alle Unity-Quell-/Buildhashes. 26 Flutlicht-Assets sind exakt eingebettet. Ergebnisse liegen unter `outputs/release-115/`. Im ersten Vorlauf erkannte die Dokumentationsprüfung noch die alte Versionskonstante 114 im Generator; sie wurde mit der übrigen Version angehoben. Der fehlgeschlagene [Vorlauf](../outputs/release-115/preflight-initial.json) bleibt dokumentiert und zählt nicht als bestandene Abnahme.

Alle [85 Produktionskommandos](../outputs/release-115/preflight.json), [58 gemeinsame Releaseprüfungen](../outputs/release-115/candidate.json) und [48 Unity-Identitäts-/Manifestprüfungen](../outputs/release-115/unity-manifest-verify.json) sind bestanden. HTML-SHA-256: `d65820fccdcc8610368ae1b3b264c686ad08c4952ea3a4104cf6f69c1a61e86b`. Die zwei Offline-Kopien sind identisch; die Quellenkennung des Unity-Builds bleibt unverändert.

## Veröffentlichung und Live-Abnahme

Releasecommit [`b365eff`](https://github.com/thealextd1337-spec/FM/commit/b365eff7f552b9caa516cecb49a5e8352a3fe188) wurde auf `main` übertragen. [Produktionslauf 37932033614](https://github.com/thealextd1337-spec/FM/actions/runs/37932033614) bestand einschließlich aller Spieltests, Build, Unity-Upload und abschließendem HTML-Upload mit Live-Prüfung. [Deploymentnachweis](../outputs/release-115/deployment.json).

Die [Live-Seite](https://fussball.cakamper.at/) liefert Release 115. **65 Releaseprüfungen bestanden**, darunter der bytegenaue Abgleich von HTML, vier Unity-Builddateien, Buildmanifest und iframe. HTML-SHA-256 ist weiterhin `d65820fccdcc8610368ae1b3b264c686ad08c4952ea3a4104cf6f69c1a61e86b`; Unity-Quellenkennung unverändert. [Live-Hashes](../outputs/release-115/live-hashes.json).

Im eigenen isolierten T3-Inkognito-Browser wurden zwei vollständige große Partien mit 14 tatsächlichen Spielern auf der Live-Seite ausgeführt. Pause, Rückkehr ins Livebild, Halbzeit und echte JSON-Fortsetzung bei Minute 60 funktionieren. Beide Läufe erreichen Minute 99 und das native Ergebnis 0:2; **alle 14 Teilhashes und Gesamtfingerabdruck `44417dc8` stimmen exakt mit der nativen Referenz überein**. Die erste Partie hat keine unbehandelten Seitenfehler. Bei jeweils 300 abgenommenen Bildern beträgt die Spielerpositionsabweichung 0 m, kein Spieler außerhalb der Prüfgrenze, 14 reale Namensmarker. [Erster Live-Lauf](../outputs/release-115/live-unity.json), [tatsächliches Stadionbild](../outputs/release-115/live-stadium.png).

Der generische Ballgrenzzähler meldete in beiden Läufen ein voll sichtbares Bild außerhalb Feld + 4 m. Die zusätzliche Diagnose zeichnet genau dieses Bild mit identischem `v98Frame.elapsed` und `outOfPlayBall=true` auf: der bereits als Aus markierte Ball fliegt vor der bestehenden Ausblendung weiter. Unity erhält exakt die vorhandenen nativen Koordinaten mit Feldfaktor 1,2; Ballflug-/Ausblendquellen sind gegenüber Release 114 unverändert. Der Rohbefund bleibt erhalten und wird nicht als null ausgegeben. Er belegt keinen Rendererdrift; die pauschale Behauptung, jeder voll sichtbare Ball bleibe innerhalb dieser Grenze, wäre falsch. [Diagnose und zweiter vollständiger Lauf](../outputs/release-115/live-ball-diagnostic.json).

Footer und generierte DE/EN-3D-Hilfe zeigen auch nach abschließendem Seitenreload **115**, Flutlicht ist verfügbar und die geprüfte 1280 × 800-Ansicht hat keinen horizontalen Überlauf. Alle Browserläufe verwenden eine synthetische Karriere im eigenen Profil. [Live-UI und Reload](../outputs/release-115/live-ui.json). Diese Funktionsprüfung ersetzt keine physische PC-/Smartphone-Leistungsmessung.

## Grenzen und nächste Priorität

Reale PC-/Pixel-Leistungsmessungen und vollständige Varianten-/Sequenzabnahme bleiben offen. Luftlandung, vollständige Luft-/Einwurf- und Keeperketten bleiben weitere 3D-Arbeit. Danach folgt die produktive Accountanbindung; [C01/C02-Verträge und offene Entscheidungen](platform/account-preflight.md) sind vorbereitet. Keine Authanbieterbuchung, Backendanbindung oder Datensammlung ist Bestandteil dieses Releases.

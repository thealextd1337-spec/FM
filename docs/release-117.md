# Release 117: 3D-Spiel besser verfolgen

Am 9. Oktober 2026 auf Nutzerauftrag „Umsetzen und live stellen“ veröffentlicht und live abgenommen. Basis Release 116 plus lokale Namensiteration `60b25ce`. Arbeitsbranch `codex/3d-quality-stadiums-20261009`; `freekickdemo/` bleibt getrennt.

Der gemeinsame Unity-Kandidat ist gebaut und eingefroren: Quellenkennung `1169b35efb3e4fb497871ab7785c43423321839fdd03a3037f71db534551d06c`, HTML-SHA-256 `ebe4ea31c6675c3dffc5e9a5890ee07ec0fbd85e08f83e96a0914e531e902e72`. [Unity-Übergabe](../outputs/3d-quality/iteration-117/handoff.json), [geprüfte Freigabe](../outputs/release-117/approved-unity.json) und [49 unabhängige Manifestprüfungen](../outputs/release-117/unity-manifest-verify.json) bestätigen denselben Stand. WebGL-Build: 90.689.426 Bytes, null Fehler, drei bekannte Warnungen.

## Beauftragter Umfang

- Namen bei Gedränge und am Bildrand, Vereinsfarbe/Team-Muster und feine Kopfverbindungen.
- Optionale Ballhilfe für sehr kleine dargestellte Bälle, abschaltbar im vorhandenen Darstellungsmenü. Reine Kontrastmarkierung an der tatsächlichen Unity-Projektion, keine Änderung am Ballradius oder Flugweg. Namen meiden den sichtbaren Hilfering; für ausgeschaltete Hilfe und größere Bälle wird keine allgemeine Ballfreihaltung zugesagt.
- Luft-/Landesequenzen, hoher Pass/Volley, Einwurf aus vorhandenen Halte-/Aufnahme-/Freigabephasen und Prüfung schräger Torwartwinkel.
- Sichtbare Vereinsidentität an Gegentribünen/Banden mit bestehender reduzierter Qualitätsstufe.

Die Darstellung liest vorhandene Matchphasen. Keine neue Match-KI, Ergebnisberechnung, Zufallsziehung oder Umrechnung bestehender Spielstände; Accounts bleiben die nächste große Priorität. Keine kostenpflichtigen Assets oder neuen Dienste.

## Prüfung und Veröffentlichung

Releasecommit [`7356682`](https://github.com/thealextd1337-spec/FM/commit/735668274fb465dea5081c638a773ffe6375371a) liegt auf `main`. [Produktionslauf 37974903801](https://github.com/thealextd1337-spec/FM/actions/runs/37974903801) bestand vollständig: Spieltests, HTML-Build, zuerst geprüfter Unity-Upload und danach HTML-Upload. [Deploymentnachweis](../outputs/release-117/deployment.json).

Freigabe erfolgt nach tatsächlichem Unity-Kompilieren, Rig-/Darstellungsprüfungen, WebGL-Build, eingefrorenen Produktionsprüfungen, mobilem HTML-Build und vollständigem native/Unity-Vergleich. Veröffentlichung über den vorhandenen Produktionsworkflow: zuerst Unitydateien hochladen und prüfen, danach HTML. Version in Quelle, beiden Footer-Settern, generierter DE/EN-Hilfe, HTML-Build und Runtime-Cacheadresse gemeinsam 117.

Nachweisordner: `outputs/3d-quality/iteration-117/` und `outputs/release-117/`. Historische Release-115-/116-Belege bleiben unverändert.

Die lokale Freigabe ist vollständig bestanden: [56 gemeinsame Releaseprüfungen](../outputs/release-117/candidate.json), [neun mobile Bedienungsprüfungen plus 18 Namensprüfungen](../outputs/3d-quality/iteration-117/browser/mobile.json) und [vier vollständige native/Unity-Partien](../outputs/3d-quality/iteration-117/browser/native-unity-parity.json) auf dem tatsächlichen HTML-Build. Standard/fünf endet 1:1 bei Minute 100 mit Kennung `fea01da1`; größer/sechs endet bei Minute 95 mit Kennung `bb73e1bd`. Je Vergleich stimmen alle 14 Zustands-/Buchungsteile exakt, einschließlich Pause, Halbzeit, JSON-Fortsetzung und Abpfiff. Keine unbehandelten Seitenfehler; Produkt-/Buildbytes während des gesamten Laufs unverändert. [Tatsächliches mobiles Bild mit Ballhilfe](../outputs/3d-quality/iteration-117/browser/ball-guide-on.png).

Bereits bestanden: [88 exakte Produktionskommandos](../outputs/release-117/preflight.json), [26 bytegenau eingebettete UI-Assets](../outputs/release-117/ui-build-manifest.json), [18 Brücken-/Ballhilfeprüfungen](../outputs/3d-quality/iteration-117/bridge-tests.json), [106 Unity-Iterationsprüfungen](../outputs/3d-quality/iteration-117/iteration-tests.json) und [706 Stadionprüfungen](../outputs/3d-quality/iteration-117/stadium-architecture-tests.json). Die unabhängige [Quellprüfung](../outputs/release-117/source-review.json) meldet keine weiteren Produktblocker nach Korrektur des tatsächlichen Einwurf-Abwurfpakets. Neue Stadionberichte bleiben getrennt von den historischen Release-115-Belegen.

Die [aktuellen Renderbilder](../outputs/3d-quality/iteration-117/renders/renders.json) zeigen Luft-, Einwurf-, Schlag- und Keeperposen sowie vier Vereinsstadien und eine reduzierte Stufe. Die Ballprojektion ist in drei Kameras gegen die tatsächlich gerenderten Ballpixel gemessen. Der erste Editor-Testframe stellte neue Materialien falsch dar; der Nachweis verwirft diesen ersten Frame und nimmt anschließend die korrekten Bilder auf. Abgelegte Fehlversuche zählen nicht als Freigabebilder. Diese Editorbilder mit gebackenen aktuellen Rig-Knochen ersetzen keine WebGL- oder Smartphone-Abnahme.

Veröffentlichte Unity-Protokolle enthalten ausschließlich bereinigte automatische Startparameter; Token-/Sitzungswerte wurden entfernt und Zeilenenden vereinheitlicht. Test-/Buildurteile und Quellenkennung bleiben erhalten. [Protokollbereinigung](../outputs/3d-quality/iteration-117/log-publication.json); rohe lokale Originale bleiben im ignorierten `tmp/`.

## Live-Abnahme

Die [Live-Seite](https://fussball.cakamper.at/) liefert Release 117. Alle [64 Release-/Live-Prüfungen](../outputs/release-117/live-hashes.json) bestanden: HTML, vier Unity-Dateien, Manifest, iframe und Runtime-JavaScript sind bytegenau identisch mit dem freigegebenen Stand. HTML-SHA-256 und Unity-Quellenkennung bleiben die oben dokumentierten Werte.

[Neun mobile Bedienungsprüfungen plus 18 Namensprüfungen](../outputs/release-117/live-browser/mobile.json) bestehen auch live, einschließlich tatsächlicher Ballprojektion, Ein-/Ausschalten, Reload, eigener Browserpräferenz und Rückkehr aus 2D. [Live-Bild mit Ballhilfe](../outputs/release-117/live-browser/ball-guide-on.png). Eine [vollständige native/Unity-Livevergleichspartie](../outputs/release-117/live-browser/native-unity-parity.json) auf Standard/fünf endet bei Minute 100 mit 1:1 und Kennung `fea01da1`; alle 14 Zustands-/Buchungsteile sind identisch, einschließlich Pause, Halbzeit, echter JSON-Fortsetzung und Abpfiff. Keine unbehandelten Seitenfehler. Die isolierten synthetischen Browserkarrieren verändern keine Nutzerkarrieren.

## Grenzen und nächste Arbeit

Physisches Android-Wachhalten, GPU-Leistung und das tatsächliche Spielgefühl auf Pixel 9a/Pixel 9 Pro XL bleiben eine eigene Geräteabnahme. Ein Desktop-WebGL- oder Geometrienachweis wird nicht als Smartphone-Framerate ausgegeben. Accounts bleiben die zweite Produktpriorität nach der 3D-Abnahme; produktive Anmeldung und Backendanbindung sind nicht Bestandteil dieses Releases.

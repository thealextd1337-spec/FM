# Release 118 – Torwartfolgen und Android-Prüfweg

Stand: 9. Oktober 2026. Release 118 ist veröffentlicht und live abgenommen. Der Nutzerauftrag „Setze das um“ umfasst die nächste 3D-Iteration und den Geräteprüfweg. Accounts bleiben die zweite Priorität.

## Native Kontakte und Bildvertrag

Ein bestätigtes Nachfassen oder Sichern verwendet seinen eigenen vorhandenen Kontaktpunkt. Zuvor konnte eine noch aktive frühere Parade diesen Punkt ersetzen: `saved=true` gilt auch für abgewehrte Schüsse. Ein Abwehrergebnis wird deshalb nicht als gehaltener Ball behandelt. Der Snapshotfall wurde vor der Korrektur reproduziert und danach geprüft.

Vorhandene `pickup:<at>`-/`smother:<at>`-Kennungen bleiben bei der Aktionsprojektion erhalten. Die Unity-Whitelist übergibt vorhandene optionale `saved`, `parry`, `goal`, `smother`, `held`, `phase` sowie `ballInFlight`; `holding` und numerisches `pickup` behalten ihre Einwurfbedeutung. Fehlende alte Felder werden nicht nachgerüstet. Die Darstellung erzeugt keine Fangentscheidung, Ballautorität, Zufallsziehung, neue Matchuhr oder Spielstandumrechnung. Der native Torwart verteilt weiterhin kurze beziehungsweise hohe Pässe; ein Wurf-/Rollauslöser ist nicht vorhanden.

13 gezielte Kontakt-/Kennungs-/Whitelistprüfungen, die bestehenden 18 Ballhilfe-/Brückenprüfungen und 31 Namenslayoutfälle bestehen. Neue Ausgaben liegen unter `outputs/3d-quality/keeper-next/` und `iteration-118/`; historische Release-Nachweise bleiben erhalten.

## Torwartdarstellung

Zentrale, tiefe, hohe und seitliche Paraden verwenden passende vorhandene Clips. Landung, Erholung und Aufstehen laufen im jeweiligen Clip weiter, statt beim Übergang auf eine fremde Bodenpose zu springen. Der vorhandene Abstoß erhält eine Vorbereitung und einen Ausklang. Bestätigtes Halten verlangt bekannte Fang-/Abwehr-/Flugfakten, Torwartbesitz und tatsächliche Armreichweite; Abwehrergebnisse, Gegentore, unbekannte Fakten und unerreichbare Ziele erzeugen keinen Handkontakt.

160 gezielte Torwartprüfungen und alle zwölf Unity-Suiten bestehen auf dem eingefrorenen Quellstand `0b1d8a57fed95db82a9c034cc0729e60090b9ef99ceec2e8aa2cc04f195ed774`. Der unabhängige Quellreview hat keine offenen Befunde. Neun aufgezeichnete Sequenzen stammen aus fünf nativen Partien; zusätzliche kontrollierte JSON-Szenen prüfen Fang-, Nachfass-, Sicherungs- und Negativfälle. Eine natürlich aufgetretene vollständige Folge Parade → Nachfassen → Aufstehen → Abspiel wurde dadurch nicht nachgewiesen. [Fortgeschriebener Audit](platform/animation-quality-audit.md).

112 Editoraufnahmen und 14 Sequenzübersichten tragen dieselbe Quellenkennung. Der Build umfasst 90.691.675 Bytes, ohne Fehler und mit den drei bereits bekannten Warnungen. Die native Position gefangener Bälle liegt teilweise 1,1–1,9 Meter vom Torwart entfernt; außerhalb seiner Armreichweite zeigt Unity deshalb kein künstliches Festhalten. Ein sichtbares natürliches Halten braucht eine gezielte native Kontaktentscheidung. Bei einer aufgezeichneten Parade wechselt die aus der jeweils aktuellen Ausrichtung berechnete Save-Art spät für drei Schritte. Stabilisierung des Aktionsbezugs unter Erhalt von Rückschau/Fortsetzung und längere natürlich aufgetretene Keeperfolgen bleiben auf der Agenda; die native Erholung von 1,55 Sekunden begrenzt weiterhin die Länge des Aufstehens.

## Geräteabnahme und Accounts

Der [Android-Prüfweg](platform/android-3d-acceptance.md) nutzt ein physisches USB-Gerät, eine eigene lokale Chrome-QA-Seite und 14 tatsächliche Spieler mit dem regulären nativen Timer. Er verändert keine bestehenden Tabs, Live-Spielstände oder Bildschirm-Systemeinstellungen. Buildhashes, Gerätestand, optionale Unity-Schleifenrate, Browser-Bildtakt und tatsächliches Wachhalten bleiben getrennte Befunde. Eine gewollte Halbzeit-/Vollbildunterbrechung unterbricht die Messung und ist kein Wachhaltefehler. Der unabhängige Review hat diesen Fall gefunden; die Korrektur ist nachgeprüft.

App-Gerätezugang ist deaktiviert; zunächst fehlte auch ADB. Nach Nutzerwahl des Pixel 9 Pro XL wurden die offiziellen Google Platform Tools 37.0.1 im ignorierten QA-Werkzeugordner eingerichtet. Der erste Browseraufbau scheiterte im generischen Playwright-Bootstrap. Der ausschließlich eigene Seiten-CDP ist danach erfolgreich geprüft; acht reine Protokoll-/Parserprüfungen und unabhängiger Nachreview bestehen. Der tatsächliche [75-Sekunden-Lauf](../outputs/3d-quality/android-device-prerequisites/run-2026-10-09T20-37-57-401Z/report.json) bestätigt 14 Spieler, unveränderte Buildbytes und durchgehendes Wachhalten über den unveränderten 60-Sekunden-Systemtimeout. Unity-Schleifenrate 60,055/s ist keine GPU-Bildrate. Die Vollbildaufnahme belegt außerdem eine um 71,111 CSS-Pixel nach oben verschobene Unity-Fläche mit grünem unteren Streifen; die Korrektur ist in [Release 119](release-119.md) aufgenommen. Im manuellen Fenster wurde kein Appwechsel beobachtet oder bestätigt. Pixel-9a-Leistung, Appwechsel/Rückkehr, GPU-/Speicherverhalten und allgemeine Sichtabnahme bleiben eigene Prüfungen. Desktop-WebGL und Unity-Editorbilder ersetzen diese Nachweise nicht.

Das [Account-Betriebspaket](platform/account-provider-options.md) stellt zwei konkrete Backendwege mit aktuellen Primärquellen gegenüber. Der Nutzer hat den eigenen EU-Server mit selbst betriebenen Updates und Backups gewählt; World4You bleibt der bestehende Websitehost. Konkreter Anbieter/Tarif und Gesamtkosten, Betriebszuständigkeit, Elternverfahren und Lösch-/Restorefristen sind noch festzulegen. Keine Dienste, Authanbindung oder echten Nutzerdaten wurden dafür eingerichtet.

## Prüf- und Veröffentlichungsstand

Alle [89 Produktionskommandos](../outputs/release-118/preflight.json) bestehen auf dem eingefrorenen Kandidaten. Der neue WebGL-Build und die Quell-/Buildkennung bestehen [49 unabhängige Manifestprüfungen](../outputs/release-118/unity-manifest-verify.json). Alle [57 gemeinsamen Releaseprüfungen](../outputs/release-118/candidate.json), 26 exakt eingebettete UI-Assets und der [unabhängige Quellreview](../outputs/release-118/source-review.json) bestehen.

Die [kleine Touch-Ansicht](../outputs/3d-quality/iteration-118/browser/mobile.json) besteht neun Bedien- und 18 Namensprüfungen. [Vier vollständige native/Unity-Partien](../outputs/3d-quality/iteration-118/browser/native-unity-parity.json) vergleichen Standard/fünf und größer/sechs mit Pause, Halbzeit, Wechsel, Rückschau, echter JSON-Fortsetzung und Abpfiff. Je Vergleich stimmen alle 14 Zustands-/Buchungsteile exakt: Kennungen `fea01da1` und `bb73e1bd` bleiben gegenüber Release 117 erhalten. Keine unbehandelten Seitenfehler; Produkt-/Buildbytes während der Prüfung unverändert. Isoliertes Edge mit Software-WebGL liefert keine physische Android-Leistungsmessung.

Quelle, Footer, Hilfe, HTML-Build und Runtimecache tragen 118. Beide HTML-Kopien sind bytegleich, SHA-256 `78e5fd7cb96e221dd71f83b58b43dff2d945049601016d3e4fea86afa2ef518b`. Veröffentlichung nutzt den bestehenden Workflow mit geprüftem Unity-Upload vor dem HTML-Upload.

## Live-Abnahme

Releasecommit [`1b2c3c8`](https://github.com/thealextd1337-spec/FM/commit/1b2c3c8e18e6a0e8ea39e8de40251ee54a6eb114) liegt auf `main`. [Produktionslauf 37983270411](https://github.com/thealextd1337-spec/FM/actions/runs/37983270411) ist erfolgreich abgeschlossen; der [Deploymentnachweis](../outputs/release-118/deployment.json) hält den direkt beobachteten Workflowabschluss fest. Einzelne API-Schrittmetadaten fehlen wegen des anonymen GitHub-Abfragelimits; dies wird nicht als zusätzlicher Schrittbeleg ausgegeben.

Die [Live-Seite](https://fussball.cakamper.at/) liefert Release 118. Alle [65 Release-/Live-Prüfungen](../outputs/release-118/live-hashes.json) bestehen: HTML, vier Unity-Dateien, Manifest, iframe und Runtime-JavaScript sind bytegenau identisch mit dem freigegebenen Stand. Die Quellenkennung und der oben dokumentierte HTML-Hash stimmen überein.

[Neun mobile Bedien- und 18 Namensprüfungen](../outputs/release-118/live-browser/mobile.json) bestehen auch live, einschließlich Ballhilfe, Reload, eigener Präferenz und Rückkehr aus 2D. Die [vollständige native/Unity-Livevergleichspartie](../outputs/release-118/live-browser/native-unity-parity.json) endet auf Standard/fünf bei Minute 100 mit Kennung `fea01da1`; alle 14 Zustands-/Buchungsteile einschließlich Pause, Halbzeit, Rückschau, echter JSON-Fortsetzung und Abpfiff sind identisch. Keine unbehandelten Seitenfehler. Isolierte QA-Karrieren verändern keine Nutzerkarrieren.

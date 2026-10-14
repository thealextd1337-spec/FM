# Release 132: Matchkorrekturen und Vereinsoberfläche

Am 14. Oktober 2026 lokal für die beauftragte Veröffentlichung vorbereitet. Arbeitsort `work/release-r132`, Branch `release/r132`, integrierter Ausgangsstand `3085ab55`. Push auf `main`, Deployment und Live-Abnahme übernimmt die Integration. Dieser Teil enthält keinen Push, Deploy oder Live-Zugriff.

## Umfang je Meldung

| Meldung | Verhalten und Grenze |
| --- | --- |
| B01 | Auf Nutzerentscheidung nicht behandelt; bleibt offen. |
| B02 | Native Analyse vorhanden; situative Tempowahl wegen Nebenwirkungen zurückgenommen. Offen. |
| B05 | Knieflips korrigiert; weiterhin Tackles 9.180/7.970/4.398 °/s, Pässe bei 69,75/69,10 s und Beckengeschwindigkeit 1,566 > 1,5 m/s beim Foul 52,10 s (vorbestehend seit R131). |
| B08 | Auf Nutzerwunsch gestrichen. |
| B03 | Verteidiger verfolgen Durchbrüche und reagieren auf Richtungswechsel; Kontaktversuche sind pro Tick gesperrt. Grätschen von hinten mit Körperkontakt bleiben Foul. Technisch behoben, Nutzerabnahme offen. |
| B04 | Neue Freistöße entscheiden Schuss beziehungsweise Passziel schon bei der Vorbereitung; Körperrichtung und Kontakt folgen diesem gespeicherten Plan. Technisch behoben, Nutzerabnahme offen. |
| B06 | Die Unity-Projektion berücksichtigt tatsächlich beobachtete Bewegung statt entgegenstehender Restgeschwindigkeit; sinnvolles Rückwärtslaufen bleibt erhalten. Technisch behoben, Nutzerabnahme offen. |
| B07 | Bestätigte Torwartbälle bleiben beim Weg zum Abstoßpunkt an der Hand; Übergabe an den Fuß folgt der nativen Aktion. Technisch behoben, Nutzerabnahme offen. |
| B09 | Fähigkeitsabhängige Elfmeterqualität mit gemäßigten Unterschieden; ausgespieltes und kompaktes Elfmeterschießen mit drei Schützen und anschließender Paarentscheidung. Technisch behoben, Nutzerabnahme offen. |
| B10 | Ecken verwenden eine eigene fähigkeitsabhängige Fehlerlogik. Grenze: rund 16 % hoher Ecken landen unerreicht und rollen anschließend ins Seitenaus (Folgeballverhalten). Technisch behoben, Nutzerabnahme offen. |
| B11 | Foulverursacher erhalten die korrigierte Pose und Rückkehr; native132 nutzt die r22-Korrektur auch außerhalb der Oberflächenprobe. Technisch behoben, Nutzerabnahme offen. |
| B12 | Freie Boden-/Luftbälle und Abpraller erhalten einen Hauptjäger je Team und getrennte Unterstützung; Ziele und Sperren überleben JSON-Restore. Technisch behoben, Nutzerabnahme offen. |
| B13 | Wirksamer Halbzeit-/Schlusspfiff entfernt die alte Ballaktion; nach Seitenwechsel bleibt keine alte Flugbahn aktiv. Technisch behoben, Nutzerabnahme offen. |
| B14 | 3D- und Browseranzeige ordnen Namen, Wappen und Tore nach tatsächlichem Heim-/Auswärtsrecht zu. Technisch behoben, Nutzerabnahme offen. |
| B15 | Die obere Finanzaktion scrollt zur unteren Bestätigung und nennt den erforderlichen Schritt, auch ab Saison 2; sie bucht keine Förderung. Technisch behoben, Nutzerabnahme offen. |
| B16 | Eigene Angebote können bis zum vollzogenen Wechsel zurückgezogen werden, auch nach Ablöseeinigung; danach ist sofort ein neues Angebot möglich. Technisch behoben, Nutzerabnahme offen. |
| B17 | Tageswechsel zeigt tatsächliche Vereins-/Spielerantworten als Popup, einschließlich Gegenforderungen; mehrere Antworten werden vollständig gespeichert und einzeln bestätigt. Technisch behoben, Nutzerabnahme offen. |
| B18 | Zeigerklick markiert, verschiebt oder tauscht aber nicht; Maus-/Touch-Drag bleibt aktiv, ebenso Tastatur- und assistive Bedienung. Technisch behoben, Nutzerabnahme offen. |

## Kennung, Paket und Prüfungen

Neue Matchregeln gelten nur für neu konstruierte Partien mit Kennung 182: Elfmeter, Torwartübergabe, Standards, freie Bälle, Verfolgung und Freistoßplanung. Laden setzt keine neue Kennung; bestehende gespeicherte Partien werden nicht rückwirkend berechnet. Der gezielte Altpartienvergleich prüft unmarkierte native Szenen einschließlich Zufall und Ledger gegen `f2458c1f`; er ersetzt keine Gesamtpartie-Restore-Parität. Reine Darstellungskorrekturen erfinden keine nativen Kontakt-/Zeitfakten.

Quelle, Footer, Build, Runtime-Produktversion, Cache und Hilfedaten zeigen 132. Die beiden getrackten Builds `outputs/index.html` und `outputs/Doppel-6-Fussballmanager.html` werden wie bei Release 131 übernommen. Der integrierte WebGL-Build bleibt unverändert mit Quellenkennung `787a9cd134a8f784a53bcf89b23e27140b40b00a1e93ca534d3c47d59ff10eb3`. Die Produktversion wird am Runtime-Aufruf gesetzt; kein Unity-Neubau.

Der vollständige Schritt „Spieltests ausführen“ aus `deploy.yml` wurde nach dem Animations-Merge erneut ausgeführt: 116/116 Befehle mit grünem Abschlussnachweis, keine Wiederverwendung von Teil-1-Ergebnissen. Der rote Tornetz-Erstlauf und seine grüne Wiederholung nach Harnesskorrektur sind getrennt erhalten. Dazu bestehen 16/16 beauftragte Branchchecks einschließlich drei Browserchecks auf Port 4240 und 10/10 Zusatzbefehle (Build, Buildprüfung, fünf Assetchecks, Python-Deploytest, Offline-Paketprobe und Versionsprüfung). Node v24.19.0 (gebündelte Laufzeit), Python 3.13.7 über `py -3`. [Vollständige Ergebnistabellen und Logs](../outputs/release-r132-final/README.md).

Der Tornetz-Test benötigte nach dem Merge eine Harnesskorrektur: statt einer historischen einzeiligen Wrapperzeile lädt er den vollständigen Produktionsblock mit Beobachtungs-/Vorbereitungshilfen. Alle bisherigen Verhaltensassertions und Grenzen bleiben erhalten. Keine abgeschwächte Testerwartung oder Produktregeländerung in diesem Abschlussteil.

Die Offline-Publikationsprobe verwendet das echte neue Manifest und alle neun realen Dateien mit Fake-FTPS und lokal simulierten HTTP-Antworten. Sie prüft Größen/SHA-256, bytegleichen Upload, Reihenfolge (Manifest zuletzt), sieben HTTP-Dateien und den Ausschluss von `index.html`; kein Netzwerk. [Uploadplan und Hashes](../outputs/release-r132-final/publication-dry-run.json).

## P01 und verbleibende Grenzen

40 gepaarte volle native Partien (20 Seeds je Feldgröße, Standard mit fünf und groß mit sechs Feldspielern; vier Stärkegruppen) aus der vorhandenen Engine-Prüfreihe:

| Mittelwert je Partie | Basis | Neu |
| --- | ---: | ---: |
| Simulationszeit einschließlich Unterbrechungen | 3,24 min | 2,86 min |
| Schüsse beider Teams | 4,7 | 3,85 |
| Schüsse aufs Tor | 1,98 | 1,35 |
| Tore | 1,5 | 1,13 |

Herkunft: [Engine-Reviewbericht](../work/review-v182-report.md), Basis `f2458c1f`, finaler Engine-Stand `65524a24`. Diese Messwerte wurden in Teil 2 dokumentiert, nicht neu erhoben. Sie sind native Simulationszeit und keine Geräte-Wandzeit. P01 (4–6 Minuten, 10–16 Schüsse) bleibt unerfüllt; keine künstliche Angleichung der Wiedergabe oder Statistik.

Vorbestehend: vollständige Restore-Fortsetzung 3.540 gegenüber 3.676 Ticks (je 1:0), bereits auf `57f7e939`; fünf rote Altchecks (`check-free-ball-positioning-v124`: retreat>0; `check-pause-layout-v128`: shoot-Selektor; `check-fullscreen-tv-v132`: Canvas y=-66; `check-match-additions-v148`: „No restart focus throw“; `test-goal-replay-v103`: „v50Restart is not defined“). Diese Basisbefunde stammen aus Teil 1 beziehungsweise den integrierten Paketprüfungen und wurden hier nicht erneut ausgeführt. Sie sind keine grünen CI-Gates. B10-Folgeballverhalten und offene Animationen bleiben im [Backlog](Bugliste.md).

Nutzerabnahme der korrigierten Meldungen, Live-Datei-/Versionsprüfung und reale Geräte-/Dauerlastabnahme stehen noch aus. Dieser lokale Abschluss behauptet keine Live-Veröffentlichung oder Android-Freigabe. Die Integration muss die Unity-Laufzeit vor der neuen Seite veröffentlichen und Quelle, Build sowie Live-Version 132 abgleichen.

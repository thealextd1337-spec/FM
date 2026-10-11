# Release 123 – individuelle Wappen und Sponsoren

11. Oktober 2026. Veröffentlichung vom Nutzer beauftragt.

Die Zurücknavigation im Erstellungsablauf sitzt neben der Überschrift. Alle 96 Vereine der sechs neuen Länder haben individuelle Bildwappen mit unterschiedlichen Motiven und Formen bei gemeinsamem mattem Finish. 36 Sponsoren erhalten individuelle Wortmarken und separate kompakte Symbole. Nach der Klubwahl zeigt die Sponsorwahl jedes Bonusziel mit Betrag, mögliche Boni, maximale Gesamtsumme und Auszahlungstermine.

Keine Änderung von gespeicherten Angeboten, Regeln oder Spielständen. Ursprüngliche 48 Wappen und 36 Sponsoren verwenden ihre bestehenden Grafiken. Die vorhandene Unity-Laufzeit bleibt erhalten; `freekickdemo/` gehört nicht zum Release.

## Prüfung

Wappenprüfungen bestätigen 96 unterschiedliche Motive, 576 PNGs, Farbmasken, Umfärbung, zugängliche Namen, eindeutige SVG-IDs und Offline-Einbettung. Sponsorenprüfung bestätigt 72 PNGs, vollständige Bedingungen/Beträge/Gesamtsummen und unveränderte Angebote. Expansions-/Präsentationsregression besteht. Browser bei 390/1440 Pixeln und Deutsch/Englisch: alle sechs Bonuszeilen sichtbar, kein horizontaler Überlauf, Auswahlklick bucht genau einmal das gewählte Fixum und öffnet das Jugendbudget. Alle 168 Hauptmotive/Sponsorvarianten dekodieren.

## Veröffentlichung

[Produktionslauf 38141544260](https://github.com/thealextd1337-spec/FM/actions/runs/38141544260) erfolgreich: 108 Prüfkommandos, Build und Upload. HTML-SHA-256 `f6aa5fc5c3d4a397fbb77d5878c7e6b89c83311a04a5339752c1cfa86afce41c` stimmt live überein; 648 neue PNGs sind eingebettet. Regulärer Start, Logos, DE/EN und Auswahlklick bestehen live. Beim zusätzlichen Neuladen fiel ein Startzeitproblem auf: IndexedDB kann vor Installation der Expansionsvalidatoren gültige Welten ablehnen. Die unveränderte gespeicherte Welt ist nach vollständigem Modulaufbau gültig. Release 124 verschiebt deshalb den Speicherstart bis nach dem Parserabschluss. Der erste Lauf 38141214486 stoppte vor dem Upload an noch alten Versionsangaben; diese sind korrigiert. Version 123 im Quellfuß und Offline-Build; der Produktionsworkflow prüft die bestehenden Spieltests sowie die neuen Wappen-/Sponsorenassets vor dem Upload.

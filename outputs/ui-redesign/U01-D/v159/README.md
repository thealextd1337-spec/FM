# Spielbericht und Ergebnisfolge v159

Lokale Umsetzung der Nutzerergänzungen vom 8. Oktober 2026. Keine Veröffentlichung.

Der native Spielbericht, seine Spielerstatistik und die anschließende Ergebnisübersicht verwenden Flutlicht-Flächen, Typografie, Goldaktionen und gemeinsame Hell-/Dunkeltokens. Teamstatistik ist eine beschriftete HTML-Tabelle; Spielerzeilen und vorhandene Profil-, Weiter- und Rückwege bleiben erhalten. Lange Namen werden vollständig zugänglich gehalten. Bekannte FIFA-Nationalitäten verwenden die vorhandenen eingebetteten SVG-Flaggen statt fehlerhafter Drei-Zeichen-Emoji.

Native Berichte und Kalenderberichte zeigen bei Ligaformaten den aktuellen Rang der beiden Vereine. Die Darstellung liest die aktuelle entsprechende Karriere-Tabelle; sie speichert keinen Rang und berechnet alte Partien nicht neu. Europacup-Gruppenspiele sind eingeschlossen, K.-o.-Runden und nationale Pokalspiele erhalten keinen Tabellenplatz. Ein unbekannter Phasenkontext wird nicht als Gruppenphase erfunden.

Die Ergebnisfolge der Übersicht zeigt die letzten fünf tatsächlich erfassten Spiele aus Liga, Pokal und Europacup, chronologisch von alt nach neu. Erklärungen nennen Saison, Datum, Wettbewerb, Heim/Auswärts, Gegner, Ergebnis und gegebenenfalls Elfmeterschießen. Ein gewonnenes Elfmeterschießen ist ein Sieg.

## Nachweise

- [Quellprüfung](source/checks.json): 16 Kombinationen aus 320/390/768/1280 CSS-Pixeln, Hell/Dunkel und DE/EN; acht Daten-/Bediengruppen; keine Browserfehler.
- [Offline-Buildprüfung](build/checks.json): dieselbe Matrix und dieselben Gruppen; keine Browserfehler.
- [Vergleich](parity.json): identische geprüfte Modulhashes, Layoutmesswerte, Rangprüfungen und native Berichtsmetadaten.
- Bediente Wege: native Spielerstatistik, Weiter zur Ergebnisübersicht, Zurück zum Bericht, Kalenderbericht, tatsächliches Spielerprofil, Escape und Fokusrückkehr. Zusätzliche Fälle: wechselnder aktueller Rang, historischer Liga-Bericht mit aktuellem Rang, Europacup-Gruppenphase/K.-o., lange maskierte Namen, Eigentor in der Nachspielzeit, Remis plus Elfmeterschießen, gemischte Ergebnisfolge, DE/EN-Detailtexte und reduzierte Bewegung. Reine Reportprojektion zieht keine Match-Zufallszahlen und verändert keine Karrieredaten.

Visuelle Stichproben aus dem gebündelten Layoutdurchgang: [Mobil dunkel](source/native-390-dark.png), [Mobil hell](source/native-390-light.png), [Desktop dunkel](source/native-1280-dark.png), [Desktop hell](source/native-1280-light.png). Die späteren Flaggen-/Übersetzungskorrekturen wurden ohne zusätzliche Bildrunde funktional geprüft; das Layout blieb unverändert.

Prüfaufruf: `work/ui-redesign/packages/U01-D/v159-report-check.cjs` beziehungsweise zusätzlich `--build`. `--no-images` hält die Bildabnahme auf den abgeschlossenen zwei Durchgängen.

Die Prüfungen liefen mit einem isolierten Edge-Profil und im 2D-Prüfpfad. Sie sind kein Nachweis für echte Mobilhardware, Screenreader, tatsächlichen 200-Prozent-Zoom oder Unity-Animationen. Die drei zurückgestellten UI-Besichtigungen bleiben offen.

## Geänderte Ansichtsdateien

`dist/match-report-v47.js`, `dist/ui-flutlicht/views/report.css`, `dist/ui-flutlicht/views/competitions.js`, `dist/ui-flutlicht/views/overview.js`.

Der Integrator hat zusätzlich die bestehenden gemeinsamen Berichtsfelder (`fixtureId`, Wettbewerbskennung/Runde), Kalenderprojektionen, Ergebnisfolge, Sprachlabels, CSS-Loader und Build-/Serverlisten verbunden. Der Prüfbericht enthält Hashes der dazu geladenen Adapter-, Sprach- und Tokenquellen.

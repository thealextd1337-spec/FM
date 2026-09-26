# Trophäen-Sprites der Vereinswelt

## Umfang und Gestaltung

Die Vereinswelt verwendet 32 transparente Trophäen-Sprites: pro Land je einen für Meisterschaft, nationalen Pokal, Torschützenkönig, Spieler der Saison und „Man of the Match“ sowie einen Europacup-Pokal und eine neutrale Europacup-Medaille. Jeder Sprite existiert als detailreiche und als vereinfachte Variante. Spielregeln und bereits gespeicherte Erfolge ändern sich nicht.

Die großen Grafiken sind 320 × 320 Pixel groß. Sie bewahren die Schattierung und Details der Beispielbilder und werden in der Oberfläche auf 32 bis 48 Pixel verkleinert. Ihre vereinfachten Gegenstücke sind 24 × 24 Pixel groß und auf 14 Farben reduziert. Beide Varianten haben transparente Ränder und eine frontale Ansicht im Stil eines 16-Bit-Fußballspiels. Unterschiedliche Silhouetten trennen Meistertrophäe, nationalen Pokal und persönliche Auszeichnungen.

| Land | Torschützenkönig | Spieler der Saison | Eingearbeitete Flagge |
| --- | --- | --- | --- |
| England | Goldener Schuh im Rosenkranz | Gekrönter Löwe | Georgskreuz in Bändern und Sockel |
| Spanien | Fußball als strahlende Sonne | Sonnenstern im Torbogen | Rot-gelbe Streifen in Strahlen, Bogen und Sockel |
| Italien | Ball im Lorbeerkranz | Geflügelte Siegerfigur | Trikolore in Lorbeer, Flügeln und Sockel |
| Deutschland | Goldener Schuh im Stahlzahnrad | Kristallstern vor Adlerflügeln | Schwarz-Rot-Gold im Zahnrad und Sockel |
| Frankreich | Hahn auf goldenem Ball | Kristall-Lilie im Silberkelch | Trikolore in Gefieder, Kelchbändern und Sockel |
| Portugal | Ball in einer Armillarsphäre | Karavelle unter einem Stern | Grün-Rot in Ring und Schiffssockel |

Meister- und Pokaltrophäen führen dieselben Landesflaggen als drapierte Stoffbänder. Ihre Metallformen und Landesembleme unterscheiden sich je Land. Die sechs „Man of the Match“-Medaillen haben eigene Außenformen: Georgskreuz-Schild, Sonnenscheibe, offener Lorbeerkranz, Stahlzahnrad, Kristall-Lilie und Armillarsphäre. Ein goldener Fußball und ein kurzes Flaggenband verbinden die Reihe. Der Europacup nutzt einen silbernen Henkelpokal mit blauem Band und goldenen Sternen; internationale Matchauszeichnungen verwenden eine neutrale Sternmedaille.

## Dateien und Einsatz

- Fertige Grafiken: `dist/trophies/<land>-<auszeichnung>.png`, mit `eng`, `esp`, `ita`, `ger`, `fra`, `por` und den Auszeichnungen `league`, `cup`, `top-scorer`, `player-of-season`, `man-of-the-match`. Der Europacup heißt `eu-europe.png`, die neutrale Matchauszeichnung `eu-man-of-the-match.png`. Kompakte Varianten tragen vor `.png` den Zusatz `-small`.
- Übersichten: [große Sprites](trophy-sprites-preview.png) und [kompakte Sprites](trophy-sprites-small-preview.png). Die kompakte Vorschau zeigt je Motiv eine vergrößerte Pixelansicht und die tatsächliche Größe.
- Generierungsquellen und Zuschnitt: `assets/trophies/`. `generate.py` erzeugt alle 64 PNGs und beide Vorschauen erneut aus den dort gespeicherten Bildbögen. Große Grafiken behalten ihre Quellfarben; nur die kleinen Varianten werden vereinfacht. Der Zuschnitt entfernt transparente Ränder und einzelne lose Pixel.
- `v62AwardIcon` wählt Sprites für Wettbewerbsansichten, Vereinsprofile, Spielerprofile, Siegerarchiv, Matchbericht und Saisonrückblick. Nationale Matchberichte und Saisonrückblicke nutzen die Medaille des Wettbewerbslandes. Das Spielerprofil gruppiert „Man of the Match“ nach Wettbewerbsland; internationale Auszeichnungen zeigen die neutrale Medaille. Die 24-Pixel-Variante erscheint in der Ligatabelle bei amtierenden Titeln. Das Siegerarchiv verwendet die große Variante mit 40 Pixel Anzeigegröße. Größere Awardkarten verwenden die große Variante mit 48 Pixel Anzeigegröße.
- Die Einzeldatei-Buildstufe bettet alle referenzierten PNGs als Daten-URLs ein. Die Oberfläche zeigt die Sprites ohne Weichzeichnung; beschreibende Texte und zugängliche Beschriftungen stehen neben ihnen.

## Siegerfeier nach einem Titel

**Status: umgesetzt.** Die Feier gilt nur für die geführte Mannschaft in der Vereinswelt: nach einem Sieg im nationalen Pokalfinale oder Europacupfinale sowie nach dem letzten Ligaspieltag, wenn die Mannschaft Meister wurde. Ein Finale gilt erst nach dem endgültigen Ergebnis als gewonnen; bei Gleichstand umfasst das das Elfmeterschießen. KI-Titel und früher gespeicherte Ergebnisse lösen keine nachträgliche Feier aus.

[Gestaltungsbeispiel für einen italienischen Pokalsieg](pokal-popup-italien-beispiel.png): Napoli Sud AC in Saison 3 ist ein fiktiver Beispielstand. Die Vorschau verwendet die fertige italienische Pokalgrafik und kann mit `assets/trophies/preview_italy_cup_popup.py` neu erzeugt werden.

1. Nach der einmaligen Ergebnisbuchung öffnet vor dem Spielbericht ein modaler Dialog. Er zeigt die große, detailreiche Meister- oder Landes-Pokalgrafik beziehungsweise den Europacup-Pokal, „Herzlichen Glückwunsch!“, „Meister“, „Pokalsieger“ beziehungsweise „Europacupsieger“, „Saison N“, das Vereinswappen und den Vereinsnamen. Die Trophäe erhält sichtbar mehr Raum als in den bisherigen Awardkarten. Das Bild hat einen benachbarten Text als zugängliche Bezeichnung.
2. „Weiter zum Spielbericht“ ist die einzige Abschlussaktion. Escape, Klick auf den Hintergrund und die allgemeine Zurück-Navigation bestätigen den Dialog nicht. Die Fokusführung bleibt im Dialog; nach Bestätigung geht es in den vorhandenen Ablauf Spielbericht → Rundenergebnisse → Vereinszentrale.
3. Der noch offene Bestätigungszustand gehört zur aktiven Partie und wird mit ihr gespeichert. Nach einem Neuladen erscheint derselbe Dialog erneut. Die Bestätigung wird vor dem Übergang zum Bericht gespeichert, damit die Feier nicht mehrfach erscheint. Ein erneuter Aufruf der Ergebnisbuchung darf weder einen zweiten Titel noch einen zweiten Dialog erzeugen.
4. Im vierteiligen Saisonrückblick werden auf „Deine Saison“ die gewonnenen Titel wie bisher genannt. Auf „Pokale & Awards“ erhält jede selbst gewonnene Meisterschaft, jeder nationale Pokal und Europacup eine eigene hervorgehobene Titelkarte mit großer Trophäengrafik, Vereinswappen, Wettbewerbsname und Saison. Bei mehreren Titeln stehen mehrere Karten; persönliche Awards bleiben darunter. Das Siegerarchiv und andere Vereinsprofile behalten ihre normalen Titelansichten.

**Umsetzungsstellen:** `dist/world-physical-v65.js` setzt den Dialog in den bereits gespeicherten Ablauf nach `v65BookWorldMatch` und vor `v65ShowPostMatch`; `dist/world-youth-ui-v67.js` gestaltet die Titelkarten in `v67ReviewPage` (Seite 3). `v62AwardIcon` liefert die großen Sprites, `v61CrestSVG` das Wappen. Die Darstellung gehört in die vorhandenen Styles der Vereinswelt; neue Bilddateien sind nicht erforderlich.

**Abnahme:** Pokal- und Europacupsieg jeweils regulär und nach Elfmeterschießen sowie Meisterschaft nach dem letzten Ligaspieltag prüfen; Niederlagen, andere Runden und frühere Ligaspieltage dürfen keinen Dialog zeigen. Im Dialog Saison, Vereinsname, Wappen und richtige Trophäe prüfen. Bestätigung, Neuladen vor und nach Bestätigung sowie den Rückblick mit null bis drei Titeln testen. Auf schmalem Bildschirm müssen Trophäe und Knopf ohne seitliches Scrollen sichtbar bleiben.

## Spätere Änderungen

1. Bildbogen in `assets/trophies/` ändern. Teambogen und persönlicher Bogen zeigen England, Spanien, Italien, Deutschland, Frankreich, Portugal von oben nach unten. Der Medaillenbogen zeigt dieselbe Folge zeilenweise in zwei Spalten. Kategorien im Teambogen sind Meister/Pokal, im persönlichen Bogen Torjäger/Saisonspieler.
2. `assets/trophies/generate.py` ausführen. Das Skript schreibt große und kompakte Sprites sowie beide Vorschauen.
3. Beide Vorschauen prüfen. Besonders auf erkennbare Silhouette bei 24 Pixeln, echte Transparenz, korrekte Flagge und lose Einzelpixel achten.
4. `v62AwardSprites` in `dist/world-competition-v62.js` ergänzen, falls ein neuer Awardtyp entsteht. Für eine neue Bilddatei auch die Einbettung in `work/build.cjs` prüfen.
5. Passende Ansichts- und Buildtests ausführen. Bei Veröffentlichung die Seitenversion gemäß `docs/development.md` anheben.

Die Bildbögen wurden mit dem eingebauten Imagegen-Werkzeug erzeugt und anschließend auf einheitliche Spritegrößen und transparente Außenkanten gebracht. Die finalen Bildprompts verlangten je Land unterschiedliche Trophäensilhouetten, integrierte echte Nationalflaggen und frontale 16-Bit-Pixelkunst ohne Text oder Hintergrund. Die große Reihe bleibt ohne starke Farbreduktion; nur die kompakte Reihe erhält eine reduzierte Palette.

## Bildprompts für weitere Varianten

Die gespeicherten Bögen sind die maßgeblichen Vorlagen. Neue Imagegen-Varianten sollen diese als Referenzbild verwenden und nur den gewünschten Bildbogen ändern:

- `team-awards-sheet.png`: „Zwei Spalten, sechs Länderzeilen in der Reihenfolge England, Spanien, Italien, Deutschland, Frankreich, Portugal. Links Meistertrophäe, rechts nationaler Pokal. Erhalte Silhouetten und transparenten Abstand. Arbeite die echte Landesflagge als Stoffband oder Emaille in jede Trophäe ein. Frontale 16-Bit-Pixelkunst mit harten Kanten; keine Schrift, keine frei schwebende Flagge.“
- `personal-awards-sheet.png`: „Zwei Spalten, dieselben sechs Länderzeilen. Links Torschützenkönig, rechts Spieler der Saison. Jedes Land erhält zwei klar verschiedene Skulpturen gemäß obiger Motivtabelle. Flaggenfarben und Flaggenmuster gehören in Kranz, Ring, Flügel, Kelch oder Sockel. Erhalte die transparenten Zwischenräume; keine Schrift, kein Glühen.“
- `national-man-of-the-match-sheet.png`: „Zwei Spalten und drei Zeilen in der Folge England, Spanien, Italien, Deutschland, Frankreich, Portugal. Jede Medaille hat einen goldenen Fußball und ein kurzes Flaggenband, aber eine andere Außenform: Georgskreuz-Schild, Sonnenscheibe, Lorbeerkranz, Zahnrad, Kristall-Lilie, Armillarsphäre. Erhalte detailreiche Schattierung und echte Transparenz.“
- `source-sheet.png`: „Europacup als silberner Henkelpokal mit blauen Stoffbändern und Ring aus goldenen Sternen. Frontale, kompakte 16-Bit-Pixelkunst auf transparentem Hintergrund.“ Der Zuschnitt verwendet den Europacup aus der oberen rechten Zelle des gespeicherten Bogens.
- `man-of-the-match.png`: „Ein einzelner goldener Fußball in einem achtzackigen Silberstern an kurzem dunkelblauem Band mit Goldkante. Neutrale Europacup-Medaille als frontale 16-Bit-Pixelkunst; echter transparenter Hintergrund.“

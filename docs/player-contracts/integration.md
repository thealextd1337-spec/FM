# Welle 2: gelieferte Rechner und lokale Prüfkarriere

Aktueller Folgestand: [P02 v158](../platform/freshness-load-v158.md) ersetzt in ausdrücklich **neu angelegten** lokalen wave3-Karrieren die alte Frischekette durch tatsächliche Last-/Erholungsereignisse und zentrale Fähigkeiten. Offene Balancegewichte bleiben Kandidaten. Die folgenden Abnahmedaten beschreiben weiterhin die ursprüngliche Welle 2; deren Bestandskarrieren werden nicht nachgerüstet.

Die folgende Abnahme beschreibt den ursprünglichen Welle-2-Stand. Die anschließende [lokale P04–P06-/Taktiklieferung](../platform/roles-tactics-football.md) verbindet echte Rollen-/Aktionsbewertungen mit P03 in neuen `players=wave3`-Karrieren. Hinweise auf damals fehlende Rollen oder Match-Lernpfade gelten weiterhin für `wave2`, nicht für die neue Prüfkarriere. P02-Verbrauch und Produktionskalibrierung bleiben offen.

Stand: 8. Oktober 2026. P01, P02 und P03 wurden nach dem Nutzerauftrag getrennt bearbeitet und anschließend seriell integriert. Der [gemeinsame Vertrag](wave2.md) trennt dauerhafte Spielerwerte, wirksame Werte, Belastung, Entwicklung und Alterung. Offene Balanceparameter bleiben ausdrücklich Testkandidaten.

| Paket | Geliefert und geprüft | Noch vor regulärer Aktivierung erforderlich |
| --- | --- | --- |
| P01 | Kohärente Profile mit 13 internen Fähigkeiten, persönlichen Grenzen, festen Profilpositionen, Größe, Fuß und verborgenem Talent; 16 Prüfgruppen und Messung von 82.500 Spielern | Qualität-/Profil-/Grenzen-/Fußverteilungen und Kategorienzuordnung kalibrieren; P04-Empfehlungsrechner |
| P02 | Reine wirksame Fähigkeiten, getrennte Bewegungslimits, beobachtungsbezogener Verbrauch und einmalige Erholung; 7 + 10 Prüfgruppen | Tatsächliche Belastungseinheiten für sichtbare und kompakte Partien, offene Kurven/Verbrauchsteilung; alten Abzugspfad ersetzen statt doppelt anwenden |
| P03 | Minutengewichtetes Lernen, Saisonstaffel, schwache Serien, persönliche Grenzen und körperlicher Altersabbau; 18 + 8 Prüfgruppen | Echte P06-Rollen-/Aktionsnoten und passende Gewichte für beide Partietypen; chronologische Buchung |

[P01-Vertrag und Messung](generation.md), [wirksame Fähigkeiten](effective-abilities.md), [Frische](freshness.md), [Entwicklung und Alterung](development.md). Insgesamt 59 reine Prüfgruppen bestanden. Ihre Ergebnisse beanspruchen keine fertige Rollenlogik oder Produktionsbalance.

## Neue lokale Prüfkarriere

[Prüfkarriere öffnen](http://127.0.0.1:4200/source/index.html?engine=unity&players=wave2) und eine neue Karriere erstellen. Nur lokale Datei-/Loopback-Seiten mit `players=wave2` bieten `wave2-local-candidate-1` an. Die normale Startadresse erzeugt weiterhin das vorhandene Spielermodell. Öffnen des Links oder Laden einer bestehenden Karriere erzeugt keine fehlenden neuen Daten.

`work/build-player-foundation-preview.cjs` übernimmt den expliziten Kandidaten aus `work/measure-player-generation.cjs`. Jugend wird darin mit 17 Jahren erzeugt; Altersbänder, Profilhäufigkeiten, Grenzen, Fuß und Qualitätsabbildung sind keine neuen bestätigten Produktregeln. Die hohen Talentgewichte werden anhand der tatsächlich geplanten ersten Nachwuchskohorte normalisiert, einschließlich später aus dieser Kohorte beförderter Spieler. Diese feste Kohorte ist keine garantierte Talentquote für künftig anders zusammengesetzte Jahrgänge; eine Gesamtstudie mit tatsächlichen Folgejahrgangsmengen bleibt offen.

Der neue Weltmarker enthält den Parameterstand. Neue Kader, Nachwuchs, freie Spieler und spätere Ersatzspieler der reinen Pokalvereine nutzen denselben Generator. Freie Spieler erhalten die endgültige ID auch in ihren internen Buchungsdaten. Größe, Fuß, Talent, Profilpositionen und Grenzen bleiben bei Transfers und Laden erhalten. In der Prüfkarriere wird körperlicher Altersabbau einmal beim Saisonwechsel gebucht; der alte temporäre Altersabzug ist für diese Spieler abgeschaltet. Die vorhandenen Rücktrittsentscheidungen bleiben bestehen.

Die Profil-/Kaderanzeige zeigt neue Fähigkeiten nur als Farbstufen, auch in zugänglichen Texten. Größe und bevorzugter Fuß erscheinen im Profil auf Deutsch/Englisch. `v153UiPlayer` verwendet eine ausdrückliche Feldliste und gibt weder Rohfähigkeiten, Grenzen, Talent noch Buchungsdaten weiter; Rollenobjekte werden ebenfalls auf öffentliche Felder begrenzt.

P02 wird noch nicht auf die alte Frische-/Fähigkeitskette gestapelt. Neue Prüfspieler erhalten auch kein altes pauschales Jugendlernen zusätzlich: `v67Grow` überspringt ausschließlich das neue Modell. Der P03-Adapter akzeptiert ausdrücklich gelieferte Bewertungen/Gewichte; fehlende P06-Daten liefern `unsupported` und buchen nichts. Noch kein automatischer Match-Lernpfad aktiv. Die spätere P06-Anbindung muss fehlende Einsätze auflösen, bevor sie chronologisch folgende Bewertungen bucht; aktuelle alte Formnoten sind kein Ersatz für die Rollenbewertung.

## Integrationsabnahme

[21 Quellprüfungen](../../outputs/platform/player-foundation/source-tests.json) und [21 Buildprüfungen](../../outputs/platform/player-foundation/build-tests.json): normale Adresse versus Prüfadresse, vollständige neue Welt, freie IDs, erste Nachwuchskohorte, JSON-Laden, unveränderte alte Karrieren, fehlende Noten, synthetischer ausdrücklich bewerteter Einsatz mit einmaliger Buchung, Altersgrenzen, neue Folgejahrgänge, Pokal-Ersatz, sichere UI-Projektion und DE/EN-Profil. Zusätzlich zwei vollständige kompakte Testsaisons mit tatsächlichen Wirtschaftsbuchungen und Saisonübergang bestanden.

Bestehende Weltfundament-, Match-/Anweisungsprüfungen und der vierjährige Wirtschaftsdauertest bestanden. Quellseite und Einzeldatei-Build laden alle Module in derselben Reihenfolge. Testeingaben für Entwicklungsnoten und den gezielt ausgelösten Pokal-Rücktritt sind Fachfixtures, keine neuen Matchregeln. Keine rückwirkende Ausstattung alter Spieler, keine Veröffentlichung und keine Versionsanhebung.

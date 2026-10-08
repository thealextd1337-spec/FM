# Native Match-/Spielerintegration v160

Lokale Lieferung vom 9. Oktober 2026 auf Basis `ef0e7d0` (Release 111), Branch `codex/native-match-player-integration`. Nutzerauftrag: fehlende native Karriere-/Geometriepfade umsetzen und vorhandene Spielerrechner regulär aktivieren. „Spielermodell“ bezeichnet Fähigkeiten, Positionen, Rollen, Entwicklung, Alterung und Frische. Unity, Figuren, C#, Shader und Animationen bleiben Claude Opus 5.5 vorbehalten. Keine Veröffentlichung und keine Versionsanhebung.

## Verhalten

- Der erste Karriereschritt bietet zwei unabhängige Auswahlen: bisherige/größere Spielfläche sowie fünf/sechs Feldspieler plus Torwart. Alle vier Kombinationen sind verfügbar; größer/fünf ist voreingestellt. Zurückgehen erhält die Auswahl, die Zusammenfassung zeigt sie auf Deutsch/Englisch. Nach Erstellung gilt sie dauerhaft für alle Vereine und Wettbewerbe dieser Welt.
- Aufstellungen, dauerhafter Matchplan, Vorlagen, schnelle Aufstellung und KI-Formationswechsel verwenden sechs oder sieben Gesamtspieler. Freies Raster erlaubt in neuen Welten auch unbesetzte Abwehr-, Mittelfeld- oder Angriffszonen. Auswahl und Platztausch erhalten eindeutige Spieler-/Zellenbelegung. Kader-/Transferabschluss und Notverpflichtung berücksichtigen die tatsächliche Mindestanzahl an Feldspielern; zehn bis vierzehn Profis bleiben die Kadergrenze.
- Neue reguläre Kader, Nachwuchs, freie und Pokal-Ersatzspieler nutzen den vorhandenen Generator mit 13 internen Fähigkeiten, festen Profilpositionen, persönlichen Grenzen und gespeichertem Hintergrundtalent. Weltmarker `native-player-v160-1`, `balanceSource=wave3-local-candidate-1`; vorhandene Parameter werden unverändert übernommen. Rollen, Routine, echte Aktionsnoten und einmalige Entwicklung/Alterung sind über die vorhandenen Adapter aktiv. P02 ersetzt die Bestands-Frischekette in diesen Welten. Preview und gespeicherter Kader behalten Namen, Fähigkeiten, Positionen und reproduzierbare Startform. Fähigkeiten bleiben in öffentlichen Ansichten einschließlich zugänglicher Texte Farbstufen.
- Bestehende Karrieren bekommen beim Laden weder neue Spielerfelder noch eine Konfiguration. Eine fehlende Auswahl bedeutet lesend bisheriges Feld/fünf Feldspieler. Gespeicherte Ergebnisse, Spielergrundlagen und vergangene Saisons werden nicht umgerechnet. Lokale `players=wave2`/`wave3`-Prüfmarker bleiben getrennt verfügbar.

## Native Geometrie und Darstellungsschnittstelle

Native Positionen bleiben normalisiert. Ein gemeinsamer Maßstab berücksichtigt die ausgewählte Länge/Breite in Bewegung, Pass-/Schusswegen, Abseitskörpern, Luft-/Bodenkontakten, Standards und Belastung. Tore und Strafräume bleiben physisch gleich groß. 2D-Livefeld, kompakte Partieansicht und Vorbereitung zeigen entsprechende Markierungen; Live-Spieler und Ball werden auf dem größeren Feld relativ kleiner dargestellt. Torhände benötigen den Ball im eigenen Strafraum und zulässige Herkunft aus dem vorhandenen Ballledger; Fußverfolgung außerhalb dieses Bereichs bleibt möglich. Die neue Grenzprüfung verlangt vollständiges Überschreiten durch den Ball.

`match.geometry` und die Geometrie des neu erzeugten kompakten Zustands:

```js
{
  version: 1,
  length: 68 | 81.6,
  width: 44 | 52.8,
  goalWidth: 44 * .2 / (544 / 600),
  goalHeight: (44 * .2 / (544 / 600)) / 3,
  penaltyDepth: 68 * (.18 - 26 / 740) / (688 / 740),
  penaltyWidth: 44 * .5 / (544 / 600),
  ballRadius: .1764
}
```

Die Werte erhalten die tatsächlichen nativen Grenzen als Simulationsmaßstab. Absolute Produktmeter/Körpermaße sind weiterhin nicht bestätigt. Die isolierte Welle-0/1-Demo hatte andere Strafraumannahmen (10×20); deren eingefrorene Szenen und Tests bleiben unberührt.

Claude erhielt diesen optionalen Vertrag für seine Unity-/3D-Adapter. Diese Lieferung verändert weder `world-unity-v151.js`, `world-pitch3d-v98.js`, `pitch-scene-v98.js` noch Unity-Quellen/Builds. Der geometrische 3D-/Kameraabgleich mit Claudes separatem Stand gehört vor einer gemeinsamen Veröffentlichung zur Integration. Die größeren Felder sind hier als native/2D-Funktion geprüft, nicht als vollständig abgenommene Unity-Darstellung.

## Speicherung und Fortsetzung

Ein Vollpartievergleich deckte eine bislang flüchtige Positionsbeobachtung auf: Nach echtem JSON-Laden fehlte die vorherige Stichprobe für die Bewegungsprognose. Neue physische Snapshots speichern jetzt die vorhandenen Positions-, Bodenkontroll-, Keeperkontakt-, Luftball-, Standardziel- und freien Ballbeobachtungen unter `nativeContinuation.version=1`. Spielerreferenzen werden über IDs rekonstruiert, einschließlich `breakawayCarrier`. Es entsteht kein zweiter Controller. Der Kontrollzeit-Sentinel übersteht JSON ausdrücklich. Bestehende `nativeContactClock` und P02-Puffer bleiben unverändert; Speichern verbucht keine Last vorzeitig.

Die reguläre IndexedDB-Speicherung, tatsächlicher Export/Import und Seitenneuladen sind geprüft. Speicherformat und Sicherungsstrategie wurden nicht erweitert. Mehrjährige Modellwelten erreichen etwa 7–11 MB JSON; der bestehende localStorage-Ersatzpfad mit zusätzlicher Sicherung kann dafür zu klein sein. Dieser bereits bekannte Speicherumfang ist keine behobene Grenze dieser Lieferung.

## Abnahme

[Quellnachweis](../../outputs/platform/native-integration-v160/source-tests.json), [Buildnachweis](../../outputs/platform/native-integration-v160/build-tests.json), [Mehrsaisonnachweis](../../outputs/platform/native-integration-v160/multiseason.json), [abschließende drei Sechser-Saisons](../../outputs/platform/native-integration-v160/multiseason-six-final.json).

- Je 195 Quell-/Buildprüfungen: alle vier Kombinationen, normale Aktivierung ohne Queryflag, stabile Vorschau, beide Mannschaften, Formations-/Rastergrenzen, KI, echte native Geometrie, ganze Ballquerung, Handberechtigung in beiden Richtungen, feste Torgröße, JSON-Spielerreferenzen, komplette kompakte Partien und unverändertes Lesen unmarkierter Karrieren.
- Acht vollständige native Quellpartien: je ein ununterbrochener und ein tatsächlich über JSON bei Minute 20 fortgesetzter Verlauf pro Kombination. Exakt gleiche Endpositionen, Ergebnis, Ballledger, Bericht, Frische, Minuten, Fähigkeitsentwicklung und Routine. Zusätzlich vier Buildpartien (größer/fünf und bisherig/sechs) mit derselben Gleichheit und denselben Tickzahlen/Ergebnissen wie die Quelle.

| Kombination | Ticks je Verlauf | Schlussminute | Ergebnis |
| --- | ---: | ---: | --- |
| bisherig / fünf | 3276 | 98 | 1:0 |
| bisherig / sechs | 3262 | 99 | 0:0 |
| größer / fünf | 3153 | 95 | 2:0 |
| größer / sechs | 2911 | 101 | 0:1 |

- Je 14 Quell-/Build-UI-Prüfungen plus echtes Neuladen: DE/EN, Standardwerte, andere Auswahl, Zurücknavigation, stabile Startspieler, tatsächlicher Erstellungskontroller, regulärer Modellmarker und kompletter Export/Import. Bei 390×844 CSS-Pixeln kein horizontaler Überlauf (375 Pixel Inhaltsbreite). T3 lieferte in diesen Hintergrundtabs keine Animationsframes; allein die Testplanung ersetzte deshalb kurz den Paint-Aufschub durch einen Timer. Die ausgelieferte UI blieb unverändert. DOM-Ereignisse und Controller wurden tatsächlich ausgeführt. Screenshots und reale Touch-/Hardwareleistung sind damit nicht belegt.
- Je drei kompakte Saisons für fünf/sechs Feldspieler: jeweils 259 abgeschlossene Partien je Saison, gültige Welt und JSON-Laden, Rollen-/Frischemodell für alle neuen Spieler, keine doppelten Entwicklungs-IDs, keine doppelte Finanz- oder Saisonstartbuchung, unveränderte Welteinstellung und volle Startfrische/leeres Formfenster nach Saisonwechsel. Ergänzende Schlussprüfung der Sechserwelt ist im gesonderten Nachweis erfasst.
- Bestehende lokale Start-, v55/v56/v57-Regel-, vierjährige Wirtschafts-, Spieler-UI-, Entwicklungs-, Alters- und Belastungsprüfungen bestehen. Der Entwicklungstest benötigt seine historische, unveränderte `outputs/stuermer-sechs-spiele-2026-10-07.json`; sie wurde aus dem bestehenden Hauptcheckout in diesen Worktree kopiert, ohne den eingefrorenen Test zu verändern.
- `node work/build.cjs` und `node work/ui-redesign/shared/verify-build.cjs`: alle 26 Flutlicht-Assets exakt eingebettet, beide Offline-Dateien identisch, Quell-/Build-Version 111.
- `node work/test-native-player-parameters-v160.cjs`: jeder historische wave2-/wave3-Parameter bleibt unverändert; reguläre Aktivierung ergänzt ausschließlich den Marker/Herkunftshinweis. Der angepasste Parametergenerator reproduziert die geprüfte Quelldatei exakt nach Zeilenendennormalisierung. `node work/platform/qa/verify-native-v160.cjs` verknüpft Quell-/Build-/Saisonbelege und schreibt den [Hashnachweis](../../outputs/platform/native-integration-v160/manifest.json).

## Prüfung wiederholen

`node work/platform/qa/serve-native-v160.cjs` stellt `/source/index.html?engine=browser` und `/native-build.html?engine=browser` auf Port 4521 bereit. In einer isolierten T3-Testvorschau die Ausdrücke aus `work/platform/qa/native-match-player-v160.js`, `native-full-match-v160.js` und `native-start-v160.js` auswerten. Die letzte Variante erstellt eine Testkarriere; nach echtem Neuladen gezielt deren zurückgegebene ID prüfen und löschen. Vor Vollpartien `window.D6NativeTestConfig={fieldSize:'standard'|'large',fieldPlayers:5|6}` setzen. Mehrjährige Prüfung: `node work/test-native-career-v160.cjs`; `--six-only` prüft nochmals ausschließlich drei Sechser-Saisons.

## Verbleibender Fachumfang

Die Integration ersetzt keine vollständige neue M01–M03-Engine. Wiederverwendet werden die nativen Aktions-/Kontakt- und v157/v159-Abläufe; ein allgemeiner produktiver Vorhaben-/Kontaktvertrag, sämtliche seltenen Regelverstöße mit Sanktionen, Balleffet und vollständige Torrahmenphysik sind hier nicht neu geliefert. Ein ausgeschlossener Handkontakt ist kein Nachweis eines neu implementierten indirekten Freistoßes. Die Parameterkurven sind weiterhin der vorhandene Balancekandidat; drei Saisons und vier physische Ausgangspartien sind ein Integrationsbeleg, keine breite Balancefreigabe. Unity-Abgleich, reale Pixel-Geräte, Accounts, Werbung und Cloud sind getrennte Arbeit.

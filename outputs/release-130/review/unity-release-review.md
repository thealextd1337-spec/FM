# Unity-Veröffentlichungsprüfung R21

12. Oktober 2026. Begrenzte lesende Prüfung von Main `a29556e`, Unity-Paket 07, Entwicklungsregeln, R20-Vertrag/Übergabe, R21-Übergabe und dem integrierten Paket `outputs/local-builds/d6-129-r21-tactics-preview-20261012`. Keine Änderungen an Quellen, Build, Editor oder Browser; ausschließlich dieser Bericht wurde geschrieben.

## Entscheidung

**Kein nachgewiesener Unity-Blocker für die Veröffentlichung der fertiggestellten R21-Änderungen.** Die fünf historischen Fehler sind kein hinreichender Grund, die korrekt belegte Foulkorrektur und aktuelle Kontaktzeitbindung zurückzuhalten. Die vollständige ursprüngliche Animationsagenda ist dadurch ausdrücklich nicht abgeschlossen. Produktionsscheduler, Veröffentlichungsversion und Gesamtfreigabe bleiben bei Root und benötigen ihren eigenen finalen Nachweis.

Die Veröffentlichung muss auf Main 129 aufbauen. Das Root-Checkout trägt ältere Produktquellen und darf nicht als Ersatz für die vollständige Main-129-Integration gepusht werden. Das geprüfte Integrationspaket trägt weiterhin Version 129 und `published:false`; ein Release 130 ist damit noch nicht belegt.

## Tatsächlicher Ausgangsstand

- `git show a29556e:outputs/platform/unity-web/probe-build.json` enthält `affd013bcc8e6b8528ba407f9d24f860221dad19af14416509ac5e0461371032` (R2/Release-121-Runtime). Main 129 verwendet daher weder R18 noch R20 als Unity-Baseline.
- Die 41 Quellen des Integrationspakets wurden unabhängig mit dem dokumentierten Pfad-plus-NUL-Verfahren gehasht: `3442dee81cd9a3abbca2083cb3d0c02fcf19efa20ec7a0868204134191d12d82`, identisch mit dessen R21-Manifest.
- `verification-summary.json`: 3037 native Schritte in 2D und Unity, identischer Digest `a6d98d83`, Payload-SHA `d0a8785eb42bef9851f2005fce1fa86e1200eb92a113460ca3dd5d4cd2ee8772`; geprüftes Paket, nicht Live-Seite.
- R21-Übergabe: 2387 reguläre Prüfungen, 26 Determinismusprüfungen, R20 804/804 und R21 52/52; 252/252 Keeperfakten unverändert; 400 WebGL-Fälle. Vorhandene Berichte gelesen, keine neuen Laufzeitprüfungen ausgeführt.
- `game.js`, `pitch-v55.js`, `pitch-v56.js`, `world-attack-flow-v152.js` und `world-football-flow-v159.js` des Integrationspakets sind bytegleich zu Main 129. `world-physical-v65.js` und `set-pieces-v50.js` enthalten die gesonderte neue Keeper-180-Kennzeichnung beziehungsweise Keeperverfolgung. Diese sind Root-Nativearbeit, keine Unity-Neutralitätsbehauptung gegenüber ungepatchtem Main.

## Warum die fünf historischen Fehler nicht als neue Blocker gelten

Die Legacy-Diagnose meldet unverändert 362/367. Alle Namen, Grenzen, Werte und `passed:false` bleiben sichtbar. `NaturalMotionDiagnostics.cs:977–987` erzwingt die unveränderten historischen Sätze gegen den R18-Stand und daneben die aktuellen R20/R21-Verträge. Das ist eine dokumentierte Umstellung der Abnahme, keine vollständige Erfüllung von 367/367.

- `plant-edge@120Hz`, 2102,82 statt höchstens 1600 Grad/s: Legacy-Bildbindung zeigte die neue Kontaktaktion 41,7 ms vor ihrem tatsächlichen nativen Ereignis. Auf derselben Fixture mit ihrer bekannten Ereigniszeit beträgt R20 der Eintritt 831 Grad/s und das erste Kontaktbild liegt bei 11.200; definitive Kontaktposition/-zeit bleiben maßgeblich.
- Zwei angebliche Ready-Abbrüche werden durch Roots korrigierte Pass-/Restart-Blickprojektion auf den echten Vertragseingaben zu 0,000 m Abbruch-Vorwärtsweg.
- Zwei weitere angebliche Abbrüche sind nach bekannten Dauer-/Fortschrittsdaten tatsächlich weiterlaufende Countdowns. Ihr Weg bleibt berichtet; aktuelle Stand-/Geschwindigkeitsprüfungen bestehen. Die Einordnung darf nicht auf echte Abbrüche übertragen werden.
- Unbekannte Legacy-Zeitfelder bleiben unbekannt und verwenden weiterhin den alten Bindungsvertrag. Das Restproblem in solchen Eingaben wurde nicht nachträglich als behoben erklärt.

## Fokussierte Quellenprüfung

`WorldViewPlayback.cs` bindet nur deklarierte Außenspieler-Fußereignisse an empfangene native Zeit; unbekannte Zeiten behalten Legacy. Lead ist ausschließlich im schon empfangenen Intervall möglich. `WorldViewBridge.cs` entfernt Lead-Felder aus extern empfangenen Bildern. Native Positionen, Facing, Ballbahn und Match-RNG werden nicht geschrieben. Keeper/save/goalKick/throw/airLand-Ausnahmen bleiben unverändert; strenge Fangfakten wurden nicht gelockert.

R21 `turfStand` in `FootballPresentation.cs:180` betrifft ausschließlich den aufrechten Foul-Täter. `FootballAnimation.cs:433,531–538` senkt dessen Rig anhand gemessener Clip-Schwebe/Sohlen und hebt eindringende Füße; es verändert keine Spielwurzel, Aktion oder Blickrichtung. Der zusätzliche Mesh-Bake ist auf den kurzen Täter-Eintritt begrenzt. Foulbelege zeigen vorher etwa 0,53 m Schweben und nachher 0,003–0,031 m; die geprüften Täterfenster bestehen. Kein neuer Fang-/Schusskontakt wird dadurch ausgelöst.

## Qualitätsgrenzen, die nicht verschwinden

R20 meldet 15 gegen R18 schlechtere Fußkontaktfenster. Beispiele: Pass 160112/field-8 bei 69.75 von 1645 auf 2144 Grad/s, Pass 160114/field-5 bei 69.10 von 1699 auf 1893, Tackle 160114/field-11 bei 68.85 von 7585 auf 9180. Bereits bestehende Überschreitungen, aber reale lokale Verschlechterungen; R21 übernimmt sie unverändert. Der bessere Gesamtsaldo 43→30 Fenster über 1600 macht diese Einzelstellen nicht bestanden. Eine gleichartige komplette Gegenüberstellung zu der tatsächlich veröffentlichten R2-Runtime liegt in der fokussierten Prüfung nicht vor; deshalb keine Behauptung, dass jede Bewegung gegenüber Live 129 besser ist.

Schmale Folgemaßnahme: zuerst Pass-Ready→Kick-Eintritt 69.75 und 69.10 auf exakt denselben Vertragseingaben und Root-Brücke messen, vorhandene Grenzen erhalten, dann gezielt Clip-/Reach-Übergang verbessern. Extremes Tacklefenster getrennt bearbeiten. Nicht Zeit, Ballkontakt, native Blickrichtung oder Testfenster verschieben.

Android-Hardware und neue Produktionsscheduler-Abnahme sind nicht durch Editor-, SwiftShader- oder loopback-only Prüfungen ersetzt. Die 4–6 Minuten und 10–16 Schüsse sind weiterhin eigenständige native Analyse-/Produktaufgaben; keine Erfüllung aus der Unity-Darstellung ableiten.

## Verwendete Belege

- `docs/development.md`, `docs/agentenauftraege/07-unity-qualitaet-claude.md`
- `outputs/3d-quality/claude-natural-motion-20261010/r20-root-bridge/handoff.md`
- `outputs/3d-quality/claude-natural-motion-20261010/r20-unity-contract/handoff.md`, `after/before-after.json`
- `outputs/3d-quality/claude-natural-motion-20261010/r21-user-animation-defects/handoff.md`, `verification.json`, `after/before-after.json`
- `outputs/local-builds/d6-129-r21-tactics-preview-20261012/verification-summary.json` und die dortigen `integration/`-Quellen

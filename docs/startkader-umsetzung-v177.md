# Startkader und sportliche Wechselpräferenz – lokal umgesetzt

Nutzerauftrag „Setze das um“ vom 12. Oktober 2026. Alle fünf vorgeschlagenen Kaderergänzungen sowie die zuvor beschlossene strikte Ligaabstufung, kleine Startschwankung und sportliche Wechselpräferenz sind im Produktionscheckout umgesetzt. Der lokale Einzeldatei-Build ist geprüft; Veröffentlichung steht aus.

Aktuelle Ergänzung: [Mindestabstand der Pokalvereine](startkader-pokalabstand.md), neue Erzeugungskennung 3. Die folgenden Liga-/Transferregeln gelten weiter; reine Pokalvereine erhalten keine anfänglichen Elite-Spieler. Kennungen 1 und 2 bleiben beim Laden unverändert.

## Verhalten neuer Karrieren

- Jeder Verein startet mit elf Profis: zwei Torhüter sowie je drei Verteidiger, Mittelfeldspieler und Angreifer. Alle bestehenden Standardformationen können vollständig besetzt werden.
- Drei junge Profis sind 18–22 Jahre alt, sechs Spieler 24–29 und zwei Routiniers 30–32. Die anfängliche Besetzung ist abgeschlossen, bevor der Transfermarkt beginnt. Der Jugendpool bleibt getrennt; automatische KI-Beförderungen verändern diesen kalibrierten Kader bei der ersten Saisonanlage nicht. Förderung, spätere Beförderungen und normale Transferentscheidungen bleiben im bestehenden Ablauf.
- Die Top 2 jeder A-Liga stehen beim Anlegen immer oberhalb der Top 2 aus Österreich, Schweiz und Türkei. Das gilt sowohl für die gesamte Kaderqualität als auch für die beste zulässige Startelf. Ab Rang drei überlappen die Länder stärker. Spielerentwicklung und Transfers können die anfängliche Reihenfolge später verändern.
- Die tatsächliche gesamte Kaderqualität schwankt je Verein um höchstens ±2,5 Prozent um seinen Ausgangswert. Der gespeicherte Seed bestimmt die Variation; Laden würfelt keine Spieler oder Werte neu aus.
- Höchstens drei Elite-Spieler sind bei den beiden A-Spitzenvereinen je Land möglich, höchstens zwei bei allen übrigen Vereinen. Es gibt keine garantierten Elite-Spieler. Die seltene Spitze bleibt eine Zufallsentscheidung; eine feste weltweite Spielerquote wird nicht erzwungen.
- Passspiel, Konterspiel oder körperliches Spiel bilden den Schwerpunkt eines Startkaders. Die native Fähigkeitserzeugung prägt dazu passende Spielerprofile innerhalb derselben Kaderqualität; der erste KI-Trainer erhält passende Pass-/Pressing-/Defensivvorgaben. Formation, persönliche Rollen, Füße, Größe und Potenzial kommen weiterhin aus den bestehenden Generatoren.

Die Ligaabstufung verwendet tatsächlich erzeugte Kader und optimale Startelfzuordnung. Sie garantiert keine Spielergebnisse. Gezeigt werden weiterhin ausschließlich qualitative Fähigkeitsfarben.

## Transfers

Mit höherer tatsächlich erreichter Positionsqualität wächst der sportliche Wechselanreiz. Ligastufe und aktuelle Kaderqualität des Zielvereins erhöhen die Attraktivität eines Angebots und beeinflussen das erforderliche Gehalt. Ein sportlicher Rückschritt wird stärker vergütungspflichtig. Gehalt, Vertragsdauer, Einsatz-Zusage und Tradition bleiben wirksam; ein deutlich besseres Angebot kann die sportliche Präferenz überwiegen. Verstecktes Talent und Potenzial sind kein eigener Wechselgrund.

Die vorhandenen Pfade für freie Spieler, reguläre Ablöseangebote und öffentliche Verkaufsliste verwenden dieselbe Angebots-/Zustimmungskette. Ablöse, Verkäuferzustimmung, Finanzierbarkeit und Kadergrenzen werden weiterhin geprüft. Spieler werden nicht automatisch zu einem anderen Verein versetzt.

## Speicherung und Zuständigkeit

Neue Expansionswelten erhalten während der Konstruktion `world.playerFoundation.expansionGeneration.version: 3`. Die vorhandene Kennung `native-player-v160-1` und der bisherige Spielstandvertrag bleiben bestehen. `startClubs` speichert Vereinsbudget, Variation, Schwerpunkt und Elite-Obergrenze. Es wird nur die Neuerzeugung gesteuert; Initialwerte, persönliche Grenzen, Talent und Rollen entstehen gemeinsam im nativen Generator.

`v177GenerateStartRoster` verteilt das komplette Vereinsbudget auf Stamm- und Ersatzspieler einschließlich der seltenen Elite-Slots. Begrenzte Umverteilung erhält das Budget auch an der Elite-Grenze. `v177StartingQuality` berechnet eine optimale Zuordnung ohne doppelte Spielerverwendung und ohne Form-/Frischeeffekt. Die Konstruktion prüft die harte Kader-/Startelfgrenze vor der Rückgabe.

Bestehende Welten mit Erzeugungskennung 1 behalten Kader, Parameter und Transferverhalten. Validierung akzeptiert sie unverändert; Laden legt keine neue Kennung an. Die Pokalersatzpfade erhalten für neue Welten dieselbe Positionsbesetzung, damit auch der zweite Torhüter nach einem Karriereende korrekt ersetzt wird.

## Nachweise

- 60 unabhängige native Stresswelten: Kaderbudget, ±2,5-Prozent-Grenze, Elite-Limits, zwei Torhüter, drei Spieler je Feldposition, Altersmix, Schwerpunkt und alle Standardformationen bestanden. Kader-/Startelfhierarchie wird bei jeder Konstruktion geprüft. Der Elite-Anteil dieser Ligastichprobe beträgt 2,62 Prozent. JSON-Rundreise und Erhalt alter Welten bestanden.
- Separater 30-Welten-Messlauf: 63.360 Startkaderspieler insgesamt, 31.680 davon in Ligavereinen; 800 Liga-Elite-Spieler (2,53 Prozent). Alle 1.800 bestätigten Paarvergleiche erfüllen die Kader- und Startelfgrenze. Ab Platz drei liegt der A-Vorsprung gegenüber C/D bei ungefähr 55 Prozent der Kadervergleiche und zeigt deutliche Überschneidung. Alle 2.880 Ligavereinsstarts liegen innerhalb der ursprünglichen Fünf-Prozent-Orientierung.
- Tatsächliche freie und bezahlte Transfers: sportliche Präferenz, höhere Qualität statt Talent, übersteuerndes Gehalt, benötigte Gehaltsreferenz und einmalige Verbuchung bestanden. Leere zu reparierende Kader liefern weiterhin endliche Angebotswerte. Beide Pokalersatzpfade erhalten den zweiten Torhüter.
- Native lokale Start-/Exportprüfung, alter/neuer gemischter Speicherbestand, Vereinswirtschaft über vier Saisons, öffentliche Verkaufsliste, AP07-Regeln/Verträge, Jugend-/Karriereendkontrollen und elf UI-Projektionsgruppen bestanden. Die vorgeschriebene v55-Prüfung einschließlich vollständiger Partie bestanden.
- Drei weitere AP07-Welten über je fünf Saisons prüfen Transaktionen, Kalender, Saisonabschlüsse und Export/Import anhand synthetischer Ergebnisse: 15 Saisons, 14.865 Begegnungen, ohne KI-Insolvenzen. Dieser Nachweis wird getrennt vom vollständigen nativen Browsermatch ausgewiesen.
- Im tatsächlichen Browser speichern und laden Quelle und Build denselben Startkader unverändert. Eine vollständige native 2D-Partie je Fassung läuft bis Abpfiff einschließlich Halbzeit; Ergebnis, Ereignisse, Statistiken, Minuten, Noten, Entwicklung, Finanzen und Weltzustand besitzen identische Vergleichshashes. Das ist kein Mobilgeräte- oder Unity-Leistungsnachweis.

[Stress-/Transferbeleg](../outputs/start-rosters-v177/checks.json), [Browserbeleg](../outputs/start-rosters-v177/browser-checks.json), [30-Welten-Verteilung](../outputs/start-roster-strength/measurement.json), [Ligaform](../outputs/start-roster-strength/league-shape.json).

## Reproduktion

Im Produktionscheckout:

```powershell
node work/test-start-rosters-v177.cjs --worlds=60
node work/test-start-roster-strength.cjs
node work/measure-start-roster-strength.cjs --worlds=30
node work/test-league-strength-shape.cjs
node work/measure-league-strength-shape.cjs --check-hierarchy
node work/render-start-roster-strength.cjs
node work/render-league-strength-shape.cjs
node work/test-world-expansion-v161.cjs
node work/test-world-local-start.cjs
node work/test-world-economy-v66.cjs
node work/test-world-transfer-list-v72.cjs
node work/test-world-expansion-rules-v167.cjs
node work/test-world-expansion-contracts-v168.cjs
node work/test-world-expansion-seasons-v167.cjs
node work/test-youth-legacy-v176.cjs
node work/test-player-ui-projection.cjs
node work/test-v55.cjs
node work/build.cjs
```

Die Browserprüfung nutzt den vorhandenen `work/platform/qa/unity-integration-v160.js`-Runner über die T3-Vorschau auf eigenen Inkognito-Loopback-Seiten mit `expansion: true`, Standardfeld, fünf Feldspielern und `unity: false`. Der fertige Build bleibt Release 127, bis eine Veröffentlichung mit neuem Seitenfußstand beauftragt wird.

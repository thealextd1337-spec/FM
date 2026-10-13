'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'outputs/youth-20years-20261011'),s=JSON.parse(fs.readFileSync(path.join(out,'summary.json'),'utf8'));assert(s.complete,'Twenty seasons must be complete.');
const pct=x=>(x>0?'+':'')+x.toFixed(1).replace('.',',')+' %',plain=x=>x.toFixed(1).replace('.',',')+' %',number=x=>Math.round(x).toLocaleString('de-DE'),mean=a=>a.reduce((n,v)=>n+v,0)/a.length,sum=a=>a.reduce((n,v)=>n+v,0);
const final=s.totalSeries.at(-1),young=s.matured,age=s.finalAge,latestCountry=c=>c.series.at(-1),positions={gk:'Torwart',def:'Abwehr',mid:'Mittelfeld',att:'Angriff'};
const initialCount=sum(s.baseline.map(c=>c.startCount)),youthCount=sum(s.baseline.map(c=>c.youthCount)),matureCount=sum(young.map(c=>c.n)),eligible=sum(young.map(c=>c.eligibleBorn));
const allOrigins=s.countries.map(c=>latestCountry(c)),leaguePlayerCount=sum(age.map(c=>c.players)),oldCount=sum(age.map(c=>c.over40));
const audits=s.seeds.map(seed=>JSON.parse(fs.readFileSync(path.join(out,seed+'-audit.json'),'utf8'))),clubOutcomes=[];
for(const a of audits){const initial=new Map(a.snapshots.filter(r=>r.phase==='initial'&&!r.simulationOnly&&!r.managed).map(r=>[r.clubId,r]));for(const r of a.snapshots.filter(r=>r.phase==='closed'&&r.season===20&&!r.simulationOnly&&!r.managed))clubOutcomes.push({country:r.country,change:100*(r.quality/initial.get(r.clubId).quality-1)});}
const stronger=clubOutcomes.filter(r=>r.change>.1).length,weaker=clubOutcomes.filter(r=>r.change<-.1).length;
const endRosters=audits.flatMap(a=>a.snapshots.filter(r=>r.phase==='closed'&&r.season===20&&!r.simulationOnly&&!r.managed)),startShare=100*sum(endRosters.map(r=>r.origins.start))/sum(endRosters.map(r=>r.rosterSize));
const trajectory=s.totalSeries.filter(r=>[0,5,10,15,20].includes(r.season)).map(r=>`| ${r.season===0?'Ursprünglicher Start':r.season} | ${pct(r.rosterChangePct)} | ${pct(r.startingChangePct)} | ${pct(r.rosterRangePct[0])} bis ${pct(r.rosterRangePct[1])} |`).join('\n');
const countryRows=s.countries.map(c=>`| ${c.label} (${c.tier}) | ${pct(c.series[5].rosterChangePct)} | ${pct(c.series[10].rosterChangePct)} | ${pct(latestCountry(c).rosterChangePct)} | ${pct(latestCountry(c).startingChangePct)} | ${plain(latestCountry(c).youthSharePct)} |`).join('\n');
const matureRows=young.map(r=>`| ${s.countries.find(c=>c.country===r.country).label} | ${number(r.n)} | ${pct(r.meanGrowthPct)} | ${pct(r.relativePrimeStartPct)} | ${number(r.medianMinutes)} |`).join('\n');
const birthRows=s.baseline.map(r=>`| ${r.label} | ${number(r.youthCount)} | ${pct(r.juvenileGapPct)} | ${pct(r.primeGapPct)} |`).join('\n');
const positionRows=s.maturedByPosition.map(r=>`| ${positions[r.position]} | ${number(r.n)} | ${pct(r.meanGrowthPct)} | ${pct(r.medianGrowthPct)} | ${number(r.medianMinutes)} |`).join('\n');
const cupRows=s.countries.map(c=>`| ${c.label} | ${pct(c.cupSeries.at(-1).rosterChangePct)} |`).join('\n');
const text=`# Nachwuchs und Kaderqualität über 20 Saisons

Stand: 11. Oktober 2026. Lokale, reproduzierbare Auswertung des eingefrorenen Zwölf-Länder-Spielerstands aus \`work/ligaexpansion-ap03/dist/\`. Drei unabhängige Karrieren (\`youth20-a\`, \`youth20-b\`, \`youth20-c\`), je 20 vollständige Saisons, insgesamt **${number(s.fixtures)} tatsächlich kompakt simulierte und verbuchte Partien**. Keine Produktregeln geändert und keine Veröffentlichung.

## Ergebnis

Die mittlere dauerhafte Kaderqualität der 95 KI-Ligavereine je Welt liegt nach Saison 20 **${pct(final.rosterChangePct)} gegenüber ihrem eigenen Startstand**. Die nach einheitlicher Formation gewählte KI-Aufstellung liegt bei **${pct(final.startingChangePct)}**. Die drei Welten liegen beim gesamten Kader zwischen ${pct(final.rosterRangePct[0])} und ${pct(final.rosterRangePct[1])}.

Das ist ein Mittel über unterschiedliche Vereinsentwicklungen: Von ${number(clubOutcomes.length)} Vergleichen desselben Vereins innerhalb derselben Welt sind ${number(stronger)} stärker, ${number(weaker)} schwächer und ${number(clubOutcomes.length-stronger-weaker)} annähernd unverändert (Toleranz 0,1 Prozent). Die Ländertabelle unten zeigt die jeweiligen Mittel, keine Garantie für jeden Verein.

Der Generationswechsel ist dabei noch nicht vollständig: ${plain(startShare)} der Endkader gehören weiterhin zur Startgeneration. Der älteste aktive Ligaspieler ist ${Math.max(...age.map(a=>a.maximumAge))} Jahre alt. Für Ligaprofis fehlt der bei reinen Pokalvereinen vorhandene feste Karriereendpfad. Das ist eine wesentliche Grenze für die Interpretation als langfristige Nachwuchswelt.

Jugendspieler entwickeln sich durch Einsätze deutlich. Die anfängliche Länderdifferenz bleibt im Test jedoch nicht erhalten: Stufe A startet mit ${pct(s.tierSeries[0].aRelativeToDPct)} gegenüber D; nach zehn Saisons sind es ${pct(s.tierSeries[10].aRelativeToDPct)} und nach 20 Saisons ${pct(s.tierSeries[20].aRelativeToDPct)}. Diese Angabe vergleicht die mittlere Kaderqualität beider Gruppen; Europacupergebnisse folgen zusätzlich Aufstellungen, Taktik und Matchverlauf.

## Messung und Grenzen

Gemessen wird der bestätigte gewichtete Mittelwert der dauerhaften Grundfähigkeiten auf der Hauptposition eines Spielers. Ein Verein erhält den Mittelwert seiner Profis; Vereine werden gleich gewichtet. Form und Frische fließen in dieses Maß nicht ein. Alle öffentlich dargestellten Zahlen sind relative Vergleiche oder Häufigkeiten; exakte Spielerfähigkeiten, Talent und Entwicklungspunkte bleiben in den internen Auditdaten.

Die zweite Messung verwendet die native KI-Auswahl für eine feste Formation mit fünf Feldspielern und Torwart. Dafür wird die Qualität auf der zugewiesenen Position gemessen. Sie beschreibt die Qualität dieser standardisierten Auswahl, einschließlich der bestehenden Auswahlregeln.

Innsbruck Sport (AUT-5) wird mit einer einfachen Auditstrategie geführt: bleiben, bis zu 200 gedeckte Credits Nachwuchs, fällige Verträge verlängern und nur bei Bedarf den Mindestkader auffüllen. In Saison 1–19 sind es jeweils 200 Credits. Beim Einstieg in Saison 20 verhindert die reguläre Finanzprüfung diese Ausgabe in allen drei Welten; nach Diagnose wird vom gespeicherten Saison-19-Abschluss mit dem zulässigen Budget von 0 fortgesetzt. Dieser Verein ist aus den KI-Ligamitteln ausgeschlossen; Österreich umfasst daher sieben statt acht Vereine je Welt. Transfers zwischen allen Vereinen laufen weiter. Reine Pokalvereine werden separat ausgewertet. Land bezeichnet Liga bzw. Herkunftsakademie, die Nationalität des Spielers ist ein eigenes Merkmal.

Die Läufe verwenden die echte kompakte KI-Matchsimulation mit tatsächlichen Minuten, Rollenleistungen, Entwicklung, Alterung, Transfers, Gehältern und Nachwuchsaufnahmen. Die Matchdarstellung in Unity/3D wird durch diesen Audit nicht gemessen. Drei Seeds liefern eine nachvollziehbare Stichprobe; die angegebene Spannweite ist die Streuung dieser drei Welten und kein Konfidenzintervall. Der Stand umfasst 20 Spielzeiten mit den regulären Alterswechseln zwischen ihnen.

## Verlauf gegenüber den ursprünglichen Startkadern

| Abschluss | Gesamter Kader | Standardaufstellung | Spannweite der drei Welten: Kader |
| --- | ---: | ---: | ---: |
${trajectory}

## Unterschiede nach Liga

| Liga / feste Länderstufe | Kader S5 | Kader S10 | Kader S20 | Aufstellung S20 | Nachwuchsherkunft im Kader S20 |
| --- | ---: | ---: | ---: | ---: | ---: |
${countryRows}

„Nachwuchsherkunft“ umfasst im Spiel erzeugte Jugendspieler, die später im Profikader stehen, einschließlich Transfers aus anderen Akademien. Die Startgeneration umfasst ursprünglich erzeugte Profis, auch wenn sie inzwischen bei einem anderen Verein spielen. Die regelmäßige Einführung freier Spieler ist ein weiterer eigener Erzeugungsweg.

## Wie stark beginnt der Nachwuchs?

Zwölf zusätzliche neue Welten liefern ${number(initialCount)} Startprofis und ${number(youthCount)} Jugendkandidaten in den Ligavereinen. Das ist eine Erzeugungsmessung mit der vorhandenen Vereins- und Förderstruktur, vor der späteren Auswahl erfolgreicher Profis. Der Altersunterschied ist hier bewusst enthalten: Neu erzeugte Jugendspieler sind 17; für den späteren Ersatzvergleich wird zusätzlich mit ursprünglichen 24–29-jährigen Profis verglichen.

| Akademieland | Jugendkandidaten | Bei Erzeugung gegenüber allen Startprofis | Gegenüber Startprofis mit 24–29 |
| --- | ---: | ---: | ---: |
${birthRows}

Der niedrigere Startstand ist für Entwicklung vorgesehen. Entscheidend ist, ob die Spieler rechtzeitig passende Einsätze und gute Leistungen erhalten und anschließend einen nutzbaren Profistand erreichen.

## Tatsächlich erreichte Entwicklung bis 24

Die folgenden Zahlen betreffen Jugendspieler aus den ersten zehn Erzeugungssaisons, die bis zum 24. Geburtstag im aktiven Profikader oder freien Spielerbestand bleiben. Für alle diese frühen Jahrgänge ist bis Ende Saison 20 genügend Beobachtungszeit vergangen. Je Spieler wird der Stand genau einmal beim Übergang auf Alter 24 erfasst. Die eigene Akademie von AUT-5 ist auch hier ausgeschlossen.

Insgesamt erreichen ${number(matureCount)} von ${number(eligible)} erfassten frühen Kandidaten diesen Beobachtungspunkt (${plain(100*matureCount/eligible)}). Die übrigen Kandidaten verschwinden vorher aus dem aktiven Bestand. Diese Quote beschreibt Verbleib bis 24; sie ist keine Startelfquote und keine garantierte Ausbildungsrendite.

| Akademieland | Bis 24 beobachtet | Mittlerer Zuwachs gegenüber Erzeugung | Gegenüber ursprünglichen 24–29-jährigen Profis¹ | Median Einsatzminuten bis 24 |
| --- | ---: | ---: | ---: | ---: |
${matureRows}

¹ Die Referenz wird nach der Hauptposition der beobachteten Jugendspieler gewichtet und aus derselben Welt genommen; bei einem leeren Positionssample wird die gemeinsame Landes-/Positionsreferenz der drei Welten verwendet. Die Auswahl der verbleibenden Spieler ist wesentlich: Diese Gruppe begann bereits ${pct(s.cohortSummary.selectedBirthGapPct)} über dem Mittel aller erfassten Kandidaten dieser frühen Jahrgänge. Ihr späterer Stand darf nicht auf den durchschnittlichen ungesichteten Kandidaten übertragen werden. Der Zuwachs vergleicht dagegen dieselben Spieler mit ihrem eigenen Erzeugungsstand.

### Entwicklung nach Position

| Hauptposition | Beobachtete Spieler | Mittlerer Zuwachs bis 24 | Median des individuellen Zuwachses | Median Minuten bis 24 |
| --- | ---: | ---: | ---: | ---: |
${positionRows}

Diese Unterschiede entstehen gemeinsam aus Startprofil, Auswahl, Einsatzzeit, Rollenbewertung und der Verteilung des Lernens auf Fähigkeiten. Der Lauf isoliert keinen dieser Einflüsse einzeln. Ein ergänzender, ausdrücklich idealisierter Rechnerfall mit 240 Jugendspielern, sieben Jahren mit je 28 vollen Einsätzen, durchgehend Note 7 und positionsproportional verteiltem Lernen ergibt ${pct(s.controls.idealMeanGrowthPct)} mittleren Qualitätszuwachs. Dieser Rechnerfall beschreibt günstige Lernbedingungen; die nativen Karrieren oben liefern den tatsächlich erreichten Stand.

## Startgeneration und Alterung

Nach 20 Saisons sind weiterhin Spieler der ursprünglichen Startgeneration aktiv. Über alle drei KI-Welten stehen ${number(oldCount)} von ${number(leaguePlayerCount)} Profis im Alter von mindestens 40 Jahren in den Kadern (${plain(100*oldCount/leaguePlayerCount)}); der älteste erfasste Ligaprofi ist ${Math.max(...age.map(a=>a.maximumAge))}. Damit enthält der Endstand auch erhaltene und gealterte Startprofis.

Der Code legt das gespeicherte Karriereende für reine Simulationsteams fest. Für Ligaprofis fehlt dieser entsprechende verbindliche Karriereendpfad; sie verbleiben bei fortgesetzten Verträgen trotz fortgeschrittener Alterung. Für eine vollständig erneuerte Generation wäre ein gesonderter, abgestimmter Karriereendpfad relevant. Dieser Audit verändert ihn nicht.

## Reine Pokalvereine getrennt betrachtet

Diese Vereine besitzen keine Nachwuchs- und Transferwirtschaft. Sie ersetzen Karriereenden durch neu erzeugte Erwachsene desselben Positionsslots; dieser Weg behält seine vereins- und länderbezogenen Erzeugungsparameter. Die Veränderungen sind deshalb mit den Ligavereinen nur unter Berücksichtigung dieses anderen Erneuerungswegs vergleichbar.

| Land | Mittlere Kaderveränderung der reinen Pokalvereine nach S20 |
| --- | ---: |
${cupRows}

## Was der Code und die kontrollierten Vergleiche erklären

1. **Förderbudget verbessert bisher unmittelbar die Menge.** ${number(s.controls.budgetPairs)} identische Erzeugungsvergleiche mit 0 bzw. dauerhaft 400 Credits liefern jeweils identische Fähigkeiten, persönliche Grenzen und verborgenes Talent. Die Spielerintegration ersetzt das zuvor budgetabhängige Profil durch ein Profil nach der festen Jugendstufe des Vereins. Die größere Kandidatenzahl erhöht die Auswahlchance. Bei dauerhaft 0 Credits entstehen jährlich ein bis zwei Kandidaten, bei geglätteten 400 Credits vier bis fünf; die Förderung wird über drei Jahre mit 45/35/20 Prozent geglättet. Ab geglätteten 550 Credits entstehen bereits garantiert die maximal sechs Kandidaten. Darüber hinaus entfällt im aktuellen Modell auch der zusätzliche Mengeneffekt.
2. **Das Akademieland hat bei gleichem Profil keinen eigenen Qualitätsfaktor.** ${number(s.controls.countryPairs)} Vergleiche mit gleicher Spieleridentität und Jugendstufe liefern über unterschiedliche Akademieländer identische Profile. Im Expansionsparameterpfad wird die Länder-/Vereinsverschiebung für Nachwuchs ausdrücklich ausgenommen. Länder unterscheiden sich damit durch ihre konkreten Vereine, deren Jugendarbeit, Finanzierung, Auswahl und spätere Laufbahnen.
3. **Startkader und spätere Erzeugungswege sind unterschiedlich gewichtet.** Die Startkader erhalten Länder-/Vereinsverschiebungen. Die jährlichen freien Spieler entstehen unter eigenen synthetischen Vereinskennungen, für die keine gespeicherten realen Vereinsverschiebungen vorliegen. Das trägt plausibel zum Angleichen bei; die Größe dieses einzelnen Beitrags wurde nicht als Gegenmodell isoliert.
4. **Die KI-Bewertung verwendet ein älteres Potenzialfeld.** \`v67AiTalentScore\` liest \`player.potential\`. Das neue Modell löscht dieses Feld und speichert Grenzen unter \`player.playerModel.caps\`. Dadurch fällt der dortige Potenzialanteil auf aktuelle Qualität zurück. Das ist eine konkrete Integrationsschwachstelle; ihr Einfluss auf Aufnahmen und Weltqualität ist in diesem unveränderten Lauf nicht einzeln quantifiziert.

## Wie Länder unterscheidbar werden könnten

Für die nächste Abstimmung würde ich drei Größen getrennt behandeln: durchschnittliches sportliches Niveau, Ausbildungscharakter und wirtschaftliche Bindungskraft. Ein Landesmerkmal sollte die Bandbreite von Vereinswegen beeinflussen; außergewöhnliche Spieler und gute Ausbildungsvereine bleiben überall möglich.

- **Sportlicher Rahmen:** Wenn A–D auch langfristig als grobe Hierarchie gewünscht ist, müssen die Nachrückerwege zum gleichen Rahmen passen. Kleine, überlappende Gewichtungen der normalen Qualitätsverteilung bei Jugend und freien Spielern wären ein Testkandidat. Starre Höchstgrenzen oder garantierte Spitzenjahrgänge würden die bestätigte Durchlässigkeit aufheben.
- **Ausbildungscharakter:** Länder können unterschiedliche Mischungen von Ausbildungsvereinen, sofort nutzbarem Nachwuchs und größerer Kandidatenbreite besitzen. Ein starkes Jugendprofil in einem kleinen Land darf eine schwache Akademie eines reichen Landes übertreffen. Bestehende handgestaltete Vereinsprofile bilden dafür die Grundlage.
- **Wirtschaftliche Bindungskraft:** Reichere Vereine sollten über tatsächliche Gehaltsangebote, Ruf und Kaderplätze häufiger fertige Spitzenspieler halten oder erwerben können. Ausbildungsvereine können zugleich über Einsätze und spätere Verkäufe erfolgreich sein. Spielerfähigkeiten bleiben beim Transfer erhalten; die Nationalität benötigt dafür keinen Fähigkeitsbonus.
- **Spürbare Förderung:** Nachhaltige bezahlte Förderung könnte künftig zusätzlich die Verteilung der Startqualität neuer Kandidaten beeinflussen. Bestehende Spieler bleiben unverändert. Zuerst wären dieser Budgetpfad und die KI-Potenziallesung gezielt zu prüfen; die beobachtete Entwicklung durch echte Einsätze funktioniert bereits.
- **Sichtbare Ausbildungsbilanz:** Eine jährliche Übersicht über Kandidaten, Aufnahmen, Einsatzminuten, Veränderungen der Fähigkeitsfarbstufen und Transfererlöse würde den Nutzen beobachtbar machen. Die Budgetwahl sollte den geglätteten Förderstand und die erreichbare Kandidatenzahl zeigen, insbesondere die bereits erreichte Mengenobergrenze.
- **Vollständiger Generationswechsel:** Ein bei der Erzeugung gespeichertes, positionsabhängiges Karriereende für neue Ligaprofis würde Ausbildungs- und Ersatzbedarf verlässlich machen. Ein entsprechender Kandidat sollte ausdrücklich für neue Welten getestet werden, ohne bestehende Spielstände nachträglich umzurechnen.

Vor einer Balanceänderung sollten zwei Varianten mit denselben Seeds verglichen werden: ein langfristig stabilerer A–D-Rahmen und eine bewusst durchlässigere Welt, deren Landesunterschiede vor allem aus Jugendarbeit und Transferwirtschaft entstehen. Die vorliegende Auswertung testet den unveränderten aktuellen Stand.

## Nachweise und Wiederholung

Der Quellstand ist mit Datei-SHA-256 unter \`outputs/youth-20years-20261011/source-manifest.json\` eingefroren. \`harness-equivalence.json\` dokumentiert den bytegleichen Welt- und Managerstand einer vollständigen ersten Saison zwischen dem offiziellen VM-Harness und dem schnelleren Hauptkontext-Harness. Die vollständige Weltvalidierung besteht in jedem Seed nach Saison 1, 10 und 20. Die Saisoncheckpoints und genauen Spielerwerte sind lokale interne Auditdaten.

Aus dem Projekt-Hauptverzeichnis, mit Node 24:

\`\`\`powershell
node --max-old-space-size=2048 --expose-gc work/audit-youth-20years-20261011.cjs --seed=youth20-a --seasons=20 --resume --fast
node --max-old-space-size=2048 --expose-gc work/audit-youth-20years-20261011.cjs --seed=youth20-b --seasons=20 --resume --fast
node --max-old-space-size=2048 --expose-gc work/audit-youth-20years-20261011.cjs --seed=youth20-c --seasons=20 --resume --fast
node work/audit-youth-controls-20261011.cjs
node work/summarize-youth-20years-20261011.cjs --quiet
node work/render-youth-20years-20261011.cjs
node work/write-youth-report-20261011.cjs
\`\`\`

Mit \`--resume\` wird am gespeicherten Abschluss weitergearbeitet; für einen unabhängigen Neulauf einen neuen Seed verwenden und dessen Ergebnisse gesondert auswerten. Quellen nur einmal ausdrücklich mit \`--freeze\` sichern; bestehende Prüfquellen nicht während eines Laufes überschreiben.

[Interaktive Auswertung](../outputs/youth-20years-20261011/report.html). Maßgebliche Codepfade im eingefrorenen Stand: \`world-expansion-v161.js\` (Länder-/Vereinsgewichtungen), \`world-player-foundation-v153.js\` (Erzeugungsintegration), \`world-youth-manager-v67.js\` (Menge und KI-Aufnahmen), \`world-player-performance-v155.js\` und \`player-development.js\` (tatsächliche Entwicklung), \`world-payments-v124.js\` (Simulationsteam-Ersatz).
`;
fs.writeFileSync(path.join(root,'docs/jugend-langzeit-auswertung-20261011.md'),text);console.log(JSON.stringify({report:'docs/jugend-langzeit-auswertung-20261011.md',stronger,weaker,roughlyEqual:clubOutcomes.length-stronger-weaker,matureCount,eligible,oldCount}));

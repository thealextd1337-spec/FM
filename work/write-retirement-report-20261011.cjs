'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'outputs/retirement-20years-20261011'),s=JSON.parse(fs.readFileSync(path.join(out,'summary.json')));assert(s.complete,'Finish all three careers first');
const sum=a=>a.reduce((n,x)=>n+x,0),f=(n,d=1)=>(Math.abs(n)<.5*10**(-d)?0:n).toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d}),pct=n=>Math.abs(n)<.05?'0,0 %':(n>0?'+':'')+f(n)+' %';
const last=s.total.at(-1),initialActive=sum(s.validation.map(v=>v.initialActive)),adultActive=sum(s.validation.map(v=>v.initialActiveKinds.start+v.initialActiveKinds.cup)),youthInitialActive=sum(s.validation.map(v=>v.initialActiveKinds.youth)),highest=Math.max(...s.validation.map(v=>v.maximumActiveAge));
let report=`# Karriereenden, Kader und Nachwuchs über 20 Saisons

Stand: 11. Oktober 2026. Drei native Karrieren mit je 20 vollständig gespielten Saisons und zusammen **${f(s.totals.fixtures,0)} Pflichtspielen**. Isolierte lokale Prüfvariante der vereinbarten Karriereendstaffel; keine Änderung der veröffentlichten Spielregeln oder bestehender Spielstände. Vergleich mit den [drei zuvor geprüften Karrieren ohne Ligaspieler-Karriereenden](jugend-langzeit-auswertung-20261011.md).

## Ergebnis

Die mittlere Kaderqualität der KI-Ligavereine liegt nach 20 Saisons bei **${pct(last.qualityPct)}** gegenüber dem Karrierebeginn. Mit den bisherigen Regeln betrug die Änderung **${pct(last.controlQualityPct)}**. Die Standardstartelf vor den Abschieden verändert sich um **${pct(last.startingPct)}**. Nach den Abschieden umfasst ein Ligakader durchschnittlich **${f(last.closingPlayers)} Spieler**, beim Saisonstart nach dem Transferfenster **${f(last.openingPlayers)}**. Das mittlere Kaderalter beträgt **${f(last.meanAge)} statt ${f(last.controlMeanAge)} Jahre**. Die mittleren Jahresausgaben steigen von **${f(s.total[0].expenses,0)}** auf **${f(last.expenses,0)} Credits je Verein**.

Die Mannschaften sind damit im Durchschnitt stärker als beim Karrierebeginn. Gegenüber dem unveränderten Modell ist die Wirkung differenzierter: Der Gesamtkader wächst etwas stärker, die Standardstartelf mit **${pct(last.startingPct)} statt ${pct(last.controlStartingPct)}** weniger stark. Die Karriereendstaffel erhöht vor allem Verjüngung, Übernahmen und Nachwuchseinsätze; sie ersetzt keine gezielte Verbesserung der Nachwuchsqualität.

Nach Saison 20 sind in den drei Welten zusammen noch **${initialActive} Spieler der bei Karriereerstellung aktiven Kader** aktiv, einschließlich vertragsloser Spieler. Davon stammen **${adultActive}** aus den ursprünglichen erwachsenen Startkadern und **${youthInitialActive}** aus den bereits bei Karriereerstellung automatisch übernommenen Jugendspielern. Das gewünschte vollständige Ausscheiden der ersten aktiven Kader nach 20 Saisons ist damit **${initialActive?'nicht erreicht':'in diesen drei Welten erreicht'}**. Die Altersregel garantiert dies allgemein erst mit 39, nicht nach einer festen Zahl von Saisons. Der älteste noch aktive Spieler im Abschlusssnapshot ist **${highest}**.

## Was genau getestet wurde

- Unveränderte eingefrorene Quellen des zuvor ausgewerteten Release-122-Stands. Identische Seeds **youth20-a/b/c**, Wettbewerbe, Spielerentwicklung, Transfers, Finanzen und Nachwuchsgenerierung.
- Nur die Karriereendregel wurde im Prüflauf ersetzt: Alter 33/34/35/36/37/38/39 bedeutet jährlich 40/50/60/70/80/90/100 Prozent. Eine deterministische Entscheidung je Spieler und Saison zur ersten Kalenderfortschaltung nach Saisonmitte; Ausscheiden erst nach allen Saisonspielen und Gehaltszahlungen. Position und Vertrag verändern die Chance nicht.
- Ligaspieler, freie Spieler und reine Pokalspieler verwenden dieselbe Staffel. Reine Pokalvereine behalten ihren bestehenden kostenlosen Ersatzweg. Neue Ersatzspieler werden für das folgende Jahr vorbereitet; sie erhalten keine weitere Karriereendentscheidung für die abgeschlossene Saison.
- Die bestehenden KI-Regeln für Transfers, Notbesetzungen, Förderung und Übernahmen bleiben bestehen. Keine neue Academy-Ausbildung, keine neue Legacy-Qualitätswirkung, keine neuen vier Budgetoptionen und keine Korrektur der bekannten alten KI-Potenziallesung. Diese Änderungen wären weitere getrennte Tests.
- Ausgewertet werden jeweils dieselben **95 KI-Ligavereine**; der betreute Verein AUT-5 wird wie im Vergleichslauf ausgeschlossen. Er bleibt beim selben Verein, fördert mit höchstens 200 finanzierbaren Credits und wird über reguläre Vertrags-/Transferaktionen spielbar gehalten. Alle 192 Vereine spielen tatsächlich; reine Pokalvereine werden bei Karriereend- und Startspielerprüfungen zusätzlich berücksichtigt.
- Stärke ist die mittlere positionsgewichtete Qualität pro Verein, relativ zu denselben Vereinen bei Karrierebeginn. Keine individuellen Fähigkeitswerte werden veröffentlicht. Die Standardstartelf nutzt die native Auswahl in der festen Grundordnung mit fünf Feldspielern und einem Torwart.

## Kader und Nachwuchs je Saison

Stärke und Kadergröße werden **nach** den Karriereenden gemessen; die Startgröße entsteht **nach** dem Transferfenster. Kandidaten/Übernahmen/Abschiede sind mittlere Gesamtzahlen je Welt für die 95 KI-Ligavereine. Startspieler weltweit zählt alle anfangs aktiven Spieler aus 192 Vereinen, die noch in einem Profikader oder auf dem freien Markt sind.

| Saison | Stärke gegenüber Startkader | Spieler Start → Abschluss | Erzeugte Jugend | Übernommen | Karriereenden in Ligakadern | Startspieler weltweit aktiv |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${s.total.map(r=>`| ${r.season} | ${pct(r.qualityPct)} | ${f(r.openingPlayers)} → ${f(r.closingPlayers)} | ${f(r.generated)} | ${f(r.promoted)} | ${f(r.retired)} | ${f(r.initialRemainingIncludingFree)} |`).join('\n')}

In 20 Jahren werden je Welt durchschnittlich **${f(s.totals.generated,0)} neue Jugendkandidaten** für diese Vereine erzeugt und **${f(s.totals.promoted,0)} Jugendliche** in Profikader übernommen. Der Anfangspool Y0 ist bei den jährlichen Neugenerierungen ausgeschlossen; seine Übernahmen sind enthalten. Daher ist Übernahmen geteilt durch neu erzeugte Kandidaten **keine genaue Jahrgangsquote**. Übernahmen können Kandidaten aus früheren Saisons betreffen; die jüngsten Jahrgänge hatten noch nicht dieselbe Auswahlzeit.

Gegenüber den Vergleichswelten steigen die Übernahmen von durchschnittlich **${f(sum(s.total.map(r=>r.controlPromoted)),0)}** auf **${f(s.totals.promoted,0)}** je Welt über 20 Saisons. Der Nachwuchsanteil an allen tatsächlichen Pflichtspielminuten beträgt in Saison 20 **${f(last.youthMinutesSharePct)} Prozent**, zuvor **${f(last.controlYouthMinutesSharePct)} Prozent**. Dabei enthält die Minutenbasis auch Spiele reiner Pokalvereine; sie ist kein reiner Ligaminutenanteil.

Die Karriereenden erhöhen den Bedarf an Ersatzspielern. Die Mindestgröße nach dem Transferfenster beträgt über alle beobachteten Saisons **${Math.min(...s.total.map(r=>r.minOpening))}**, direkt nach den Abschieden dagegen **${Math.min(...s.total.map(r=>r.minClosing))}**. Alle Pflichtspiele wurden mit echten Aufstellungen und Spielprotokollen abgeschlossen. Die zeitweiligen Abschlusslücken sind daher von einem Ausfall im Saisonbetrieb zu unterscheiden.

## Kostenverlauf je Saison

Alle Beträge sind **Credits je KI-Ligaverein**, gemittelt über die drei Welten. Ausgaben sind brutto; Einnahmen werden separat ausgewiesen. Gehälter enthalten tatsächlich gebuchte Gehaltszahlungen, auch anteilige Abrechnungen bei unterjährigen Wechseln. Ausbildungsentschädigungen stehen zusätzlich zum Förderbudget. Ablösen werden aus den tatsächlich vollzogenen Transfers ermittelt. Verbleibende Belastungen stehen unter Sonstiges. Kasse ist der Bestand nach Saisonabschluss.

| Saison | Gehälter | Förderung | Jugendübernahmen | Ablösen | Sonstiges | Gesamtausgaben | Einnahmen | Kasse |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${s.total.map(r=>`| ${r.season} | ${f(r.salaries,0)} | ${f(r.youthFunding,0)} | ${f(r.promotionFees,0)} | ${f(r.transferFees,0)} | ${f(r.expenses-r.salaries-r.youthFunding-r.promotionFees-r.transferFees,0)} | ${f(r.expenses,0)} | ${f(r.income,0)} | ${f(r.balance,0)} |`).join('\n')}

Über die 20 Saisons entstehen im Mittel **${f(s.totals.expenses,0)} Credits Ausgaben je Verein**: davon **${f(s.totals.salaries,0)} Gehälter**, **${f(s.totals.youthFunding,0)} Förderung**, **${f(s.totals.promotionFees,0)} Ausbildungsentschädigungen** und **${f(s.totals.transferFees,0)} Ablösen**. Die laufenden Ausgaben wurden jährlich vor der historischen Ledger-Komprimierung gesichert. Die frühere Vergleichsauswertung speicherte nicht alle alten Bruttoausgaben; ein vollständiger gepaarter Kostenvergleich für Saison 1–18 ist deshalb nicht belegt. Der Stärke-/Kadervergleich und die neuen jährlichen Kosten sind vollständig erfasst.

## Länder nach 20 Saisons

Stärke jeweils gegenüber dem eigenen Anfangskader. Das ist keine Aussage, dass ein Land mit größerem prozentualem Wachstum automatisch absolut stärker ist als jedes andere Land. Erzeugung/Übernahmen sind Summen über 20 Saisons je Land und Welt. Österreich enthält sieben statt acht KI-Ligavereine, da AUT-5 ausgeschlossen ist.

| Land | Stärke mit Karriereenden | Bisherige Regeln | Spieler nach Abschieden | Jahresausgaben S20 / Verein | Jugend erzeugt | Jugend übernommen |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${s.countries.map(c=>{const r=c.series.at(-1);return`| ${c.label} | ${pct(r.qualityPct)} | ${pct(r.controlQualityPct)} | ${f(r.closingPlayers)} | ${f(r.expenses,0)} | ${f(sum(c.series.map(r=>r.generated)),0)} | ${f(sum(c.series.map(r=>r.promoted)),0)} |`;}).join('\n')}

Die Karriereendstaffel verändert Altersstruktur, Ersatzbedarf und echte Nachwuchsminuten. Sie führt selbst keinen Länderbonus für neue Jahrgänge ein. Die zuvor festgestellte fehlende direkte Länderwirkung bei Jugend-/freien Neugenerierungen und die alte KI-Potenziallesung bleiben relevante getrennte Balancefragen.

Für die vorhandenen Ländergruppen A und D beträgt der tatsächliche Stärkeabstand beim Karrierebeginn **${pct(s.tierSeries[0].aRelativeToDPct)}**, nach Saison 20 **${pct(s.tierSeries.at(-1).aRelativeToDPct)}**. In den Vergleichswelten beträgt er am Ende **${pct(s.tierSeries.at(-1).controlARelativeToDPct)}**. Diese direkte Verhältniszahl beantwortet die Länderhierarchie zusätzlich zu den Wachstumsraten der einzelnen Länder.

## Vollständiges Ausscheiden des Startkaders

Die erwachsenen Startkader beginnen mit 19–34 Jahren. Zum Abschluss der zwanzigsten Saison wurden 19 Alterswechsel durchgeführt: Ein ursprünglich 19-Jähriger ist dann 38. Seine rechnerische Chance, die sechs Karriereendversuche mit 33–38 zu überstehen, beträgt 0,6 × 0,5 × 0,4 × 0,3 × 0,2 × 0,1 = **0,072 Prozent**. Ein bei Karriereerstellung bereits übernommener 17-jähriger Jugendspieler ist dagegen erst 36 und kann mit **3,6 Prozent** Wahrscheinlichkeit noch aktiv sein. Deshalb folgt „alle spätestens nach 20 Saisons ausgeschieden“ nicht aus der vereinbarten Altersstaffel.

| Welt | Anfangs aktive Spieler | Noch aktive Startspieler S20 | Davon ursprüngliche Erwachsene | Davon anfangs übernommene Jugend | Karriereenden insgesamt | Höchstes aktives Alter |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${s.validation.map(v=>`| ${v.seed} | ${v.initialPlayers} | ${v.initialActive} | ${v.initialActiveKinds.start+v.initialActiveKinds.cup} | ${v.initialActiveKinds.youth} | ${v.retirements} | ${v.maximumActiveAge} |`).join('\n')}

Zusätzlich sind **${sum(s.validation.map(v=>v.initialMissingWithoutRetirement))}** anfangs aktive Spieler über andere bestehende Abgangswege aus der Welt verschwunden. Insbesondere entfernt der freie Markt Profis nach vier Jahren ohne Vertrag; dieser Vorgang ist im Karriereprotokoll als Pool-Abgang gespeichert und wurde hier nicht als altersbedingtes Karriereende gezählt.

Wenn die feste Zwanzig-Saisons-Grenze ein Muss ist, braucht sie eine zusätzliche Regel. Eine generelle Höchstaltersgrenze von 36 würde auch anfangs 17-Jährige bis Saison 20 sicher erfassen, änderte aber die gewünschte Staffel. Eine maximale aktive Karrieredauer wäre eine andere Spielregel. Für den vorliegenden Test wurde keine dieser Regeln stillschweigend ergänzt.

## Prüfnachweise und Grenzen

${s.validation.map(v=>`- **${v.seed}:** ${v.seasons} vollständige Saisons, ${f(v.fixtures,0)} echte Pflichtspiele; native Gesamtvalidierung in Saison ${v.validated.join(', ')} bestanden.`).join('\n')}

Alle Saisons enthalten genau 991 Ergebnisse mit tatsächlichen Spielerprotokollen. Keine doppelten aktiven Spieler oder doppelten Karriereenden. Kein aktiver Spieler ab 39 im Abschlusssnapshot. Entscheidungstag in den beobachteten Saisons: ${Math.min(...s.validation.map(v=>v.midpointDecisionDays[0]))}–${Math.max(...s.validation.map(v=>v.midpointDecisionDays[1]))} von 224. Die Entscheidung bleibt im Prüfspielstand gespeichert und wird nicht beim Neuladen neu ausgelost. Saisonabschlüsse, Markt und Finanzen verwenden die unveränderten nativen Prüfungen.

Alle 143 eingefrorenen Quelldateien und die Prüfinstrumentierung wurden per Hash kontrolliert. Sämtliche 2.973 Erstjahresergebnisse stimmen exakt mit den Vergleichswelten überein. Zusätzlich stimmen 4.174 Pokalersatzspieler bei Startfähigkeiten, lebenslangen Obergrenzen und verborgenem Talent exakt mit der unveränderten nativen Generierung überein. Alle berichteten Zahlen stammen aus den korrigierten vollständigen Läufen; die verworfenen Erkundungsläufe sind ausgeschlossen.

Dieser Lauf ist ein Simulationstest, keine Abnahme einer neuen Spieloberfläche. Hinweise zu Saisonbeginn, sichtbare Ankündigung zur Mitte, Vertragsbegrenzung nach Ankündigung und Abschiedsgeschichte sind weiterhin Produktplanung. Drei Seeds zeigen konkrete Langzeitverläufe, aber keine Garantie für jeden Zufallsstand. Stärken werden als relative Aggregatwerte berichtet; individuelle Fähigkeiten, Talent und Entwicklungspunkte bleiben intern.

Reproduzierbarer Prüflauf: **work/audit-retirement-20years-20261011.cjs**, isolierte Hooks: **work/retirement-audit-hooks-20261011.js**, Auswertung: **work/summarize-retirement-20years-20261011.cjs**. Daten und Jahresübersicht: **outputs/retirement-20years-20261011/**. Die unveränderten eingefrorenen Quellen und ihre Hashes liegen in **outputs/youth-20years-20261011/source/** beziehungsweise **source-manifest.json**.
`;
fs.writeFileSync(path.join(root,'docs/karriereenden-langzeit-auswertung-20261011.md'),report);
const csvKeys=['season','qualityPct','openingPlayers','closingPlayers','salaries','youthFunding','promotionFees','transferFees','expenses','income','balance','generated','promoted','retired','initialRemainingIncludingFree'];fs.writeFileSync(path.join(out,'annual.csv'),csvKeys.join(';')+'\n'+s.total.map(r=>csvKeys.map(k=>String(r[k]).replace('.',',')).join(';')).join('\n')+'\n');
console.log('Wrote report',report.length,'and annual CSV');

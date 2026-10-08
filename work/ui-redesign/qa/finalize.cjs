'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8')),hash=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex');
const evidence={
 Q1:'outputs/ui-redesign/Q01/2026-10-07T21-44-53-678Z/source/results.json',
 Q2:'outputs/ui-redesign/Q01/2026-10-07T21-45-15-219Z/build/results.json',
 Q3:'outputs/ui-redesign/Q01/2026-10-07T21-35-44-977Z/source/results.json',
 Q4:'outputs/ui-redesign/Q01/2026-10-07T21-35-54-976Z/build/results.json',
 N1:'outputs/ui-redesign/Q01/2026-10-07T21-34-22-190Z/regression/results.json',
 N2:'outputs/ui-redesign/Q01/2026-10-07T21-40-36-911Z/regression/results.json',
 S:'outputs/ui-redesign/I00-save-check/2026-10-07T21-44-41-783Z/checks.json',
 M:'outputs/ui-redesign/I00-market-check/2026-10-07T21-34-20-109Z/checks.json',
 P:'outputs/ui-redesign/I00/presentation-2026-10-07T21-34-06-435Z/checks.json',
 O:'outputs/ui-redesign/I00/overview-data-2026-10-07T21-35-50-980Z/checks.json',
 B:'outputs/ui-redesign/I00/build-2026-10-07T21-44-22-364Z/manifest.json',
 D:'outputs/ui-redesign/U01-D/source-2026-10-07T21-26-49-579Z/checks.json',
 E:'outputs/ui-redesign/U01-E/source-2026-10-07T21-23-13-585Z/checks.json'
};
const source=read(evidence.Q1),build=read(evidence.Q2),supplements=[read(evidence.Q3),read(evidence.Q4)];
for(const report of [source,build,...supplements]){assert(report.evidenceValid);assert(report.records.length);assert(report.records.every(r=>r.status==='bestanden'));}
for(const [file,digest]of Object.entries(source.endedWith))assert.equal(hash(file),digest,'Final source drift '+file);
for(const [file,digest]of Object.entries(build.endedWith))assert.equal(hash(file),digest,'Final build drift '+file);
for(const key of ['N1','N2']){const report=read(evidence[key]);assert(report.evidenceValid);assert(report.results.every(r=>r.status==='bestanden'));}
const saving=read(evidence.S);assert(saving.passed&&saving.stableHashes);assert(saving.results.every(r=>r.passed));
const market=read(evidence.M);assert.equal(market.results.length,2);for(const target of market.results){assert.deepEqual(target.errors,[]);assert.equal(target.checks.length,8);}
const presentation=read(evidence.P);assert.equal(presentation.checks.length,96);for(const entry of presentation.checks){assert.equal(entry.overflow,false);assert.deepEqual(entry.low,[]);assert(entry.inputFont>=16);assert(entry.contrasts.every(c=>c.ratio>=4.5));}
assert.deepEqual(read(evidence.D).errors,[]);assert(read(evidence.E).passed);
assert.equal(read(evidence.B).buildSha256,hash('outputs/index.html'));assert.equal(hash('outputs/index.html'),hash('outputs/Doppel-6-Fussballmanager.html'));
const mapping={
 'Q-INV-01':['Q1','Q2','M','D','E','N1','N2'],'Q-INV-02':['Q1','Q2','N1'],
 'Q-LOAD-01':['Q1','Q2','B'],'Q-LOAD-02':['Q1','Q2'],
 'Q-LAY-01':['Q1','Q2','P'],'Q-LAY-02':[],'Q-LAY-03':['Q1','Q2','P'],'Q-LAY-04':['P','Q1','Q2','S'],
 'Q-THEME-01':['Q1','Q2'],'Q-THEME-02':['Q1','Q2'],
 'Q-A11Y-01':['Q1','Q2','D'],'Q-A11Y-02':['Q1','Q2'],'Q-A11Y-03':['P','Q1','Q2'],
 'Q-NAV-01':['Q1','Q2','D','E'],'Q-I18N-01':['Q1','Q2','N1','D','E'],
 'Q-DATA-01':['Q1','Q2','Q3','Q4'],'Q-DATA-02':['Q1','Q2'],'Q-DATA-03':['Q1','Q2','Q3','Q4','E'],'Q-DATA-04':['Q1','Q2','D','E'],
 'Q-OV-01':['O','Q1','Q2'],'Q-OV-02':['O','Q1','Q2','N1'],'Q-OV-03':['Q1','Q2','D','N2'],
 'Q-SQ-01':['Q1','Q2'],'Q-SQ-02':['Q1','Q2'],'Q-SQ-03':['Q1','Q2','E','N2'],
 'Q-MKT-01':['Q1','Q2','M','N1'],'Q-MKT-02':['Q1','Q2','M','N1'],'Q-MKT-03':['M','Q3','Q4'],'Q-MKT-04':['M','Q3','Q4','N1'],
 'Q-COMP-01':['D','N2','Q1','Q2'],'Q-COMP-02':['D','N2','Q1','Q2'],'Q-COMP-03':['D','Q3','Q4','Q1','Q2'],
 'Q-CLUB-01':['E','N2','Q1','Q2'],'Q-CLUB-02':['Q1','Q2','N1'],'Q-CLUB-03':['E','Q1','Q2'],
 'Q-SET-01':['Q1','Q2','S'],'Q-SAVE-01':['S','Q1','Q2','N1'],'Q-SAVE-02':['S','Q3','Q4','N1'],
 'Q-PHASE-01':['Q1','Q2'],'Q-PHASE-02':['Q1','Q2','Q3','Q4','M'],'Q-PHASE-03':['Q1','Q2','Q3','Q4','N2'],'Q-PHASE-04':['Q1','Q2','M','S','N1'],'Q-PHASE-05':['S','N1'],
 'Q-BUILD-01':['B','Q1','Q2']
};
const cases=Object.entries(mapping).map(([id,evidence])=>({id,status:id==='Q-LAY-02'?'offen':'bestanden',evidence,...(id==='Q-LAY-02'?{reason:'Echter Browserzoom 200 Prozent nicht ausgeführt; Viewport und deviceScaleFactor wurden ausdrücklich nicht als Ersatz anerkannt.'}:{})}));
assert.equal(cases.length,44);
const result={checkedAt:new Date().toISOString(),evidenceValid:true,status:'automated-local-checks-passed-with-explicit-zoom-gap',cases,totals:{catalogue:44,passed:43,open:1,failed:0,sourceAssertions:source.records.length,buildAssertions:build.records.length,layoutCasesPerTarget:216,nativeSuites:13},evidence:Object.fromEntries(Object.entries(evidence).map(([key,file])=>[key,{file,sha256:hash(file)}])),finalBuildSha256:hash('outputs/index.html'),finalSourceHashes:source.endedWith,qaScripts:Object.fromEntries(fs.readdirSync(__dirname).filter(f=>f.endsWith('.cjs')).map(f=>[f,hash('work/ui-redesign/qa/'+f)])),limitations:['Echter 200-Prozent-Browserzoom offen.','Keine realen Pixel-/Safari-/Screenreader- oder Bildschirmtastaturnachweise.','Paket-, Fixture-, Controller- und unabhängige Integrationsbelege bleiben getrennt benannt.','Ergänzende Fachprüfungen Q3/Q4/M/O/P stammen vor dem letzten ausschließlich CSS-basierten Speicherwarnungs-/Kontrastfix; dessen betroffener Fehlerzustand wurde danach durch S sowie final Q1/Q2 geprüft. Unveränderte Fachprojektionen/Controller werden dadurch nicht rückwirkend als neue Läufe ausgegeben.','Keine Veröffentlichung oder Versionserhöhung.']};
const output=path.join(root,'outputs/ui-redesign/Q01/final');fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result.totals));
const file=path.join(root,'docs/ui-redesign/acceptance.md');let doc=fs.readFileSync(file,'utf8');
doc=doc.replace(/^Stand:.*$/m,'Stand: 7. Oktober 2026, unabhängige Schlussprüfung des lokal eingefrorenen Stands. **43 von 44 Katalogbedingungen bestanden; echter 200-Prozent-Browserzoom bleibt ausdrücklich offen. Keine bekannten Produktfehler offen.** Besitzer: Q01. Maßgeblich bleiben [U01](../agentenauftraege/06-ui-redesign.md), [Referenz](../ui-referenz/README.md), [Produktregeln](../product.md), [Entwicklungsregeln](../development.md) und der geprüfte Code. Keine Produktdatei durch Q01 verändert.');
doc=doc.replace('Die Spalte „Verfahren / Rohbeleg“ beschreibt den geplanten Nachweis, keinen bereits ausgeführten Test. Gemeinsamer aktueller Grund für alle offenen lokalen Fälle: Vertragsfreigabe, vollständiges Inventar und eingefrorene Integration liegen Q01 noch nicht vor.','Die Verfahren wurden durch die zugeordneten unabhängigen Integrationsläufe, gezielte Fach-/Fehlerprüfungen und bestehende native Regressionen geprüft. Die Statusspalte verlinkt die Rohbelege. Einschränkungen und Nachweisgrenzen stehen unter „Schlussergebnis“; Browserzoom ist ausdrücklich kein bestandener Viewporttest.');
doc=doc.replace('Inventar-IDs werden nach der U01-I-Übergabe ergänzt. Bis jede Inventarzeile ein geprüftes integriertes Ziel, Bezeichnung, Aktion und Rückweg besitzt, ist Q-INV-01 offen. Diese Matrix ersetzt das Inventar nicht.','Die 28 übergebenen Inventar-IDs sind unter „Inventarzuordnung der Schlussprüfung“ vollständig zugeordnet. Diese Matrix ersetzt die zentrale Inventarbeschreibung nicht.');
for(const item of cases){const line=new RegExp('^\\| '+item.id+' \\|.*$','m');doc=doc.replace(line,row=>row.replace(/\| (?:offen|bestanden)(?: — .*?)? \|$/,`| ${item.status}${item.evidence.length?' — '+item.evidence.map(e=>'['+e+']').join(', '):' — echter Browserzoom nicht ausgeführt'} |`));}
doc=doc.replace(/## Vorlauf-Ergebnis[\s\S]*$/,'').replace(/## Schlussergebnis[\s\S]*$/,'');
doc+=`## Schlussergebnis

Die abschließenden, getrennten **Quell- und Offline-Läufe bestanden jeweils 238 Assertions**, darunter je 216 Routen-/Breiten-/Sprach-/Farbfälle. Breiten: 320, 390, 768, 1280, 1440 sowie 844 × 390 im kurzen Querformat; neun Routen, DE/EN, Hell/Dunkel. Quellhashes waren während beider Läufe stabil und wurden bei der Konsolidierung erneut mit dem aktuellen Stand verglichen. Alle 18 neuen Offline-Assets sind bytegleich eingebettet, beide Offlinekopien und die bestehende lokale Version stimmen überein. [Konsolidiertes Manifest](../../outputs/ui-redesign/Q01/final/manifest.json).

Die unabhängigen Aktionsprüfungen belegen echte Sponsor-/Budgetbuchung genau einmal, Speichern/Neuladen, Kader-/Jugendprofile einschließlich englischer Farbnamen und effektiver Form bei Frische 20, Tooltipbedienung, Browser-Zurück aus Profilen, erhaltene Filter, rekursive Projektions-Allowlist, keine Rohobjektreferenzen oder RNG-Aufrufe, fehlende Einwechselwerte und deduplizierte Vereinsrekorde. Die native Saisonvorbereitung simuliert Partien als gekennzeichnetes Testsetup; **alle vier Rückblickseiten**, Saisonstart, Sponsor, Finanzabschluss und neues Jugendbudget werden im DOM bedient. Der normale Testlauf erzeugt keine Stellenangebote und verwendet deshalb die bestehende automatische Verbleibregel. Eine getrennte, ausdrücklich kontrollierte Interimstrainer-Fixture prüft die zwingende Managerwahl durch einen echten DOM-Klick und anschließendes Neuladen.

Q3/Q4 ergänzen unabhängig echte Nachwuchsübernahme/Entlassung mit Abbruch/Bestätigung, Vertragsverlängerung, Fehler/Retry im Einstellungsweg und Kalenderbericht → Spielerprofil → Rückweg bei unverändertem Karrieredatensatz. M prüft darüber hinaus echte Gegenforderungen, erschöpftes und neu geöffnetes Vertragsfenster, unzureichendes Budget und Persistenz. S provoziert einen **wirklichen IndexedDB-Schreibfehler**: bestätigter Altstand bleibt erhalten, Warnung/Retry sind sichtbar, Rettungskopie enthält den ungesicherten Zustand, erfolgreicher Wiederholungsversuch bucht nicht doppelt; echter Dateiexport/-import, ungültiger Import ohne Datenverlust und Neuladen sind enthalten. N1/N2 umfassen 13 native Suiten: Navigation, lokaler Start, Übersetzung, Speicherverwaltung/-wiederherstellung, Finanzabschluss/Zahlungen, Nachwuchs, Transfers, zehn Wettbewerbssaisons, Awards, Trainer und Trikots.

Die ergänzenden Paketbelege D/E und die Präsentations-/Projektionsbelege P/O bleiben ihrer Herkunft nach kenntlich; sie sind kein Ersatz für unabhängige Integrationsläufe. P verwendet die echten geladenen Rahmenmodule mit bereinigten Randdaten für 96 Titel-/Namens-/Farb-/Breitenfälle, 44-Pixel-Bedienziele, 16-Pixel-Eingaben, reduzierte Bewegung und acht Kontrastpaare ≥ 4,5. O prüft native Ranggrenzen, erreichte/bezahlte Sponsorziele und die letzten fünf Ligaspiele beider Seiten; Pokalspiele werden nicht eingemischt. Frühere Fachbelege vor der abschließenden CSS-Korrektur gelten nur für unveränderte Fachpfade: Der betroffene Speicherfehlerzustand wurde danach durch S und der vollständige normale Rahmen durch Q1/Q2 erneut geprüft.

Behobene Befunde: mobile Schnellnavigation zeigte zunächst Matchplan statt Transfers; importierte Übersetzungsobjekte erzeugten englische Fähigkeitslabels mit „[object object]“; Profilrückwege konnten Details über Einstellungen stehen lassen; native Formtexte widersprachen bei Müdigkeit der effektiven Form; der Rahmen verdeckte bei Speicherfehlern die bestehende Warnung; Footer- und Fehlerheaderfarben benötigten abschließend lesbare Kontraste. Die Gegenproben sind grün. Historische Fehl-/Zwischenläufe bleiben unverändert erhalten. Ihre Testerwartungsfehler (Nullbudget ohne Buchung, unsichtbar statt entfernter Tooltip, mehrdeutiger Profilselektor, falscher Youth-Lookup) gelten nicht als offene Produktbefunde.

**Offen:** Q-LAY-02, echter Browserzoom 200 Prozent. Es wurde kein deviceScaleFactor oder CSS-Zoom als Ersatz anerkannt. H-01 bis H-06 bleiben ebenfalls offen: reale Pixelgeräte, Bildschirmtastatur, tatsächliche Screenreader und Safari. Damit ist keine vollständige Geräte-/Accessibility-Freigabe oder uneingeschränkte Gesamtabnahme behauptet. Keine Veröffentlichung und keine Versionserhöhung.

## Inventarzuordnung der Schlussprüfung

Alle 28 Erhaltungszeilen haben integrierte Ziele. Die Fachansichten dekorieren erhaltene native DOM-/Controllerwege; neue Projektionen schließen dokumentierte Datenlücken, ohne neue Fachautorität. Aufstellung und Match bleiben bewusst bestehende Ziele. Diese Zuordnung ergänzt die weiterhin von I00 gepflegte [Inventarmatrix](inventory.md).

| Inventar-IDs | Integriertes Ziel und Nachweis |
| --- | --- |
| 001–002 | Rahmen/Leitaktion; Q1/Q2, P, Saison-/Speicherprüfungen S |
| 003–006 | Übersicht/Gegner/Wettbewerbe/Nachrichten; Q1/Q2, O, D, N2 |
| 007–011 | Kader und vollständige Profil-/Karrieredialoge; Q1/Q2, D/E, N2 |
| 012–016 | Verträge/Nachwuchs/Suche/Listen/Verhandlungen/Bilanz; Q1/Q2, Q3/Q4, M, N1 |
| 017–019 | Wettbewerbe/Länder/Saisons/Archiv/Kalender/Bestenlisten; Q1/Q2, D, N2 |
| 020–021 | Verein/Trikots/Chronik/Finanzen; Q1/Q2, E, N1/N2 |
| 022–023 | Jahresabschluss/Sponsor; Q1/Q2, O, S, N1 |
| 024–025 | Manager/Fremdprofile/letzte Elf/Rückblick/neue Saison; Q1/Q2, Q3/Q4, E, N2 |
| 026 | Einstellungen/Hilfe/3D-Hilfe/Sprache/Karrieren/Recht; Q1/Q2, S, N1 |
| 027 | Erhaltener Matchplan-/Matchanschluss, kein neuer Matchentwurf; Q1/Q2 Routenprüfung, native Navigation N1 |
| 028 | Berichtdatendialog mit Profilrückweg, gespeicherten Werten und ehrlichen Messlücken; Q3/Q4, D, N2 |

## Rohbelege

${Object.entries(evidence).map(([key,file])=>`- [${key}](../../${file})`).join('\n')}

${Object.entries(evidence).map(([key,file])=>`[${key}]: ../../${file}`).join('\n')}
`;
fs.writeFileSync(file,doc);

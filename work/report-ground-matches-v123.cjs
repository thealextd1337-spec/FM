// Analyse observed complete matches; does not run or tune the game.
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const dir='docs/spieler-nutzer-rig/',d=JSON.parse(fs.readFileSync(dir+'match-study-v123.json'));
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
assert.equal(hash('outputs/Doppel-6-Fussballmanager.html'),d.artifact.sha256);assert.equal(d.runs.length,90);assert(d.validation.noPageErrors);assert.deepEqual(d.errors,[]);
const groups=['good-good','good-weak','weak-weak'].map(id=>{const runs=d.runs.filter(r=>r.pair===id);assert.equal(runs.length,30);assert.deepEqual(runs.map(r=>r.seed),d.method.seeds);assert.equal(runs.filter(r=>r.aHome).length,15);
 for(const r of runs)for(const t of [0,1]){const s=r.teams[t],other=r.teams[1-t];assert.equal(s.goals+r.goalTrace.filter(g=>g.team===t&&g.source==='own-goal').length,r.score[t]);assert.equal(s.faced,s.saves+s.shotConceded);assert.equal(s.conceded,s.shotConceded+s.nonShotConceded);assert.equal(s.saves,s.savesCaught+s.savesParried);assert.equal(s.faced,other.onTarget);}
 const stats=[0,1].map(t=>Object.fromEntries(Object.keys(runs[0].teams[t]).map(k=>[k,runs.reduce((n,r)=>n+(r.teams[t][k]||0),0)]))),wins=runs.filter(r=>r.score[0]>r.score[1]).length,draws=runs.filter(r=>r.score[0]===r.score[1]).length;
 return {id,label:{'good-good':'Gut gegen gut','good-weak':'Gut gegen schwach','weak-weak':'Schwach gegen schwach'}[id],games:30,wins,draws,losses:30-wins-draws,goals:[0,1].map(t=>runs.reduce((n,r)=>n+r.score[t],0)),ownGoalsAwarded:[0,1].map(t=>runs.reduce((n,r)=>n+r.goalTrace.filter(g=>g.team===t&&g.source==='own-goal').length,0)),meanDuration:runs.reduce((n,r)=>n+r.steps*.05,0)/30,stats};});
assert.deepEqual(d.profiles['good-good'][0],d.profiles['good-weak'][0]);assert.deepEqual(d.profiles['good-weak'][1],d.profiles['weak-weak'][1]);
for(let n=0;n<11;n++)for(const k of ['spd','tec','pas','fin','tak','pos','air','sta','gk'])assert.equal(d.profiles['good-good'][1][n][k]-d.profiles['good-weak'][1][n][k],10);
const mixed=groups[1],s=mixed.stats,p=mixed.wins/30,z=1.959963984540054,lower=(p+z*z/60-z*Math.sqrt(p*(1-p)/30+z*z/(4*30*30)))/(1+z*z/30);
const checks=[
 ['Siege des stärkeren Teams','Anteil',.80,p],
 ['Untere Wilson-95%-Grenze der Siegquote','Anteil',.75,lower],
 ['Siegquotenanstieg bei unverändertem Team A gegenüber gut/gut','Prozentpunkte',30,100*(mixed.wins-groups[0].wins)/30],
 ['Mittlerer Torvorsprung des stärkeren Teams','Tore/Partie',1,(mixed.goals[0]-mixed.goals[1])/30],
 ['Passquotenvorsprung','Prozentpunkte',10,100*(s[0].passComplete/s[0].passes-s[1].passComplete/s[1].passes)],
 ['Zweikampfquotenvorsprung','Prozentpunkte',20,100*(s[0].duelsWon/s[0].duels-s[1].duelsWon/s[1].duels)],
 ['Verhältnis registrierter Zielschüsse stark/schwach','Faktor',2,s[0].onTarget/s[1].onTarget]
].map(([name,unit,minimum,actual])=>({name,unit,minimum,actual,passed:actual>=minimum}));
const impact={sourceStudy:'match-study-v123.json',criteriaUnchangedFrom:'player-value-impact-qa-v115.json',criteriaOriginallyPostExploratory:true,checks,passed:checks.every(c=>c.passed),scope:'All nine attributes jointly, large gap; no renewed isolated/moderate-gap proof.'};
fs.writeFileSync(dir+'player-value-impact-qa-v123.json',JSON.stringify(impact,null,2)+'\n');for(const c of checks)assert(c.passed,c.name);
fs.writeFileSync(dir+'match-study-summary-v123.json',JSON.stringify({groups,integrity:{games:90,scorerAndOwnGoalsMatch:true,keeperLedgersReconciled:true},impact},null,2)+'\n');
const fields=Object.keys(groups[0].stats[0]);fs.writeFileSync(dir+'match-study-v123.csv',['pair,game,seed,aHome,goalsA,goalsB,outcomeA,steps,'+fields.flatMap(k=>[k+'A',k+'B']).join(','),...d.runs.map(r=>[r.pair,r.game,r.seed,r.aHome,...r.score,r.score[0]>r.score[1]?'win':r.score[0]===r.score[1]?'draw':'loss',r.steps,...fields.flatMap(k=>[r.teams[0][k]||0,r.teams[1][k]||0])].join(','))].join('\n')+'\n');
const f=x=>x.toFixed(2).replace('.',','),table=(head,rows)=>'| '+head.join(' | ')+' |\n| '+head.map(()=> '---').join(' | ')+' |\n'+rows.map(r=>'| '+r.join(' | ')+' |').join('\n');
const text=`# 90 Partien nach dem Bodenspielblock v123

4. Oktober 2026. **Alle sieben bisherigen Kriterien für einen deutlichen Werteeinfluss sind erneut bestanden.** Das unveränderte gute Team A gewinnt gegen den schwachen Gegner 28/30 statt 8/30 gegen den gleich starken Gegner: +66,7 Prozentpunkte. Die Bilanz beträgt 77:7 Tore. Taktiken, Startfrische, Form, Alter, Seedfolge und Heimverteilung sind identisch; nur die Fähigkeiten des Gegners sinken gemeinsam. Nicht veröffentlicht, keine Nutzerkarriere verändert.

## Ergebnisse

${table(['Paarung','Siege A','Remis','Siege B','Tore A:B','Tore/Partie'],groups.map(g=>[g.label,g.wins,g.draws,g.losses,g.goals.join(':'),f((g.goals[0]+g.goals[1])/30)]))}

${table(['Bisheriges Kriterium','Mindestwert','Gemessen','Ergebnis'],checks.map(c=>[c.name,c.unit==='Anteil'?f(c.minimum*100)+' %':f(c.minimum)+' '+c.unit,c.unit==='Anteil'?f(c.actual*100)+' %':f(c.actual)+' '+c.unit,c.passed?'bestanden':'fehlgeschlagen']))}

Die Schwellen stammen aus der früheren v115-Abnahme und wurden für diesen Lauf nicht verändert. Sie wurden ursprünglich nach einer explorativen Reihe festgelegt. Die Wilson-Grenze beschreibt die Unsicherheit der Siegquote in dieser kontrollierten Stichprobe; sie garantiert keine Karriere-Siegchance. Gute Teams erreichen gegen schwache weiter sehr hohe Dominanz. Schwach/schwach liefert nur 0,60 Tore pro Partie: eine offene Balancefrage, kein Anlass, die Werte für diese Reihe automatisch nachzujustieren. Kleinere Abstände und einzelne Fähigkeiten wurden hier nicht erneut untersucht; ältere v118/v119-Berichte beziehen sich auf ihren damaligen Engine-Stand.

## Spielstatistik

${table(['Paarung','Schüsse A:B','Zielschüsse A:B','Passquote A:B','Zweikampfquote A:B','Paraden A:B','Abpraller A:B','Abseits A:B'],groups.map(g=>[g.label,g.stats.map(s=>s.shots).join(':'),g.stats.map(s=>s.onTarget).join(':'),g.stats.map(s=>f(s.passComplete/s.passes*100)+' %').join(' / '),g.stats.map(s=>f(s.duelsWon/s.duels*100)+' %').join(' / '),g.stats.map(s=>s.saves).join(':'),g.stats.map(s=>s.savesParried).join(':'),g.stats.map(s=>s.offsides).join(':')]))}

Alle übrigen Mannschaftszähler, Einzelresultate und Outcomes: [CSV](match-study-v123.csv), [Rohdaten mit Profilen und Torverläufen](match-study-v123.json), [Aggregat](match-study-summary-v123.json), [Kriterien](player-value-impact-qa-v123.json). Zwei Eigentore sind im Spielstand enthalten, keinem Schützen gutgeschrieben. Die erste Fortsetzung stoppte an der alten Testannahme „Schützentore = Spielstand“; nach Prüfung des Ereignisverlaufs berücksichtigt der Test Eigentore wie bereits v118. Kein Enginewechsel, kein verworfenes Ergebnis. [Native Eigentorkette](match-study-own-goal-v123.json).

Für sämtliche 90 Partien stimmen Schützen plus zugeteilte Eigentore mit dem Score; außerdem gelten faced = saves + shotConceded, saves = caught + parried, conceded = shotConceded + nonShotConceded und faced = gegnerische onTarget. Diese Definitionen unterscheiden Schusstor, Pass-/Flankentor und freien Abpraller. Beide Halbzeiten, Ergebnisbuchung, beobachtete Schusszähler und null Browserfehler geprüft.

## Methode und Reproduktion

Je Gruppe 30 vollständige native physische Vereinswelt-Ligapartien, 15 Heim-/15 Auswärtsspiele für A, dieselben Seeds \`20261004 + i * 104729\`. Frische Kopie einer isolierten Karriere je Partie; kein Nutzer-Spielstand. 20 Physikschritte/s, unverändertes MATCH_SPEED 0,78, reguläre Halbzeit und Buchung, Renderer aus. Keine zusätzliche Grafik-Zufallsziehung. Formation 2–2–1, ausgeglichenes Pressing, variables Passspiel, neutrale Abwehrlinie, normale Aggression, identische Rollen/Anweisungen; adaptive Trainer und Wechsel ausgeschaltet. Alter 25, Form neutral, Startfrische 100; Ermüdung während des Matches aktiv. Technische Testprofile: Basis 16 bzw. 6 auf allen neun Fähigkeiten, identische rollenbezogene Zuschläge gemäß Rohdaten. Exakte Werte erscheinen weiterhin nicht in Spieleransichten.

Offline-Build: \`${d.artifact.path}\`, SHA-256 \`${d.artifact.sha256}\`. [Quell-/Build-/Prüfverifikation](verification-v123.json), [gesamte Änderungen](changes-v123.md).

\`node work/study-ground-matches-v123.cjs\` startet die Reihe; \`--resume\` akzeptiert nur denselben Build. \`node work/report-ground-matches-v123.cjs\` prüft Bilanzen/Kriterien und erzeugt Bericht/CSV erneut. Beide schreiben ausschließlich diese v123-Studienartefakte. Statistikreihe ohne GPU ist kein Bildraten- oder Animationsnachweis; dafür liegen separate native Bewegungs- und vollständige Matchprüfungen vor.
`;
fs.writeFileSync(dir+'match-study-v123.md',text);console.log(JSON.stringify({groups:groups.map(({stats,...g})=>g),checks,passed:impact.passed},null,2));

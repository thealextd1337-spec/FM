/* A deliberately small, in-memory demonstration. No game engine or saved career. */
(() => {
  if (document.documentElement.dataset.design !== 'night') return;
  const phases = [
    {title:'Zwischen den Spieltagen', action:'Zum Spieltag', season:4},
    {title:'Spielvorbereitung', action:'Spieltag überspringen', season:4},
    {title:'Nach dem Spiel', action:'Zum Saisonabschluss', season:4},
    {title:'Saisonabschluss', action:'Neue Saison starten', season:4},
    {title:'Sponsorwahl', action:'Sponsor wählen', season:5},
    {title:'Finanzen & Jugend', action:'Jugendbudget festlegen', season:5},
    {title:'Transferphase', action:'Nächster Transfertag', season:5},
    {title:'Saison bereit', action:'Demo neu starten', season:5},
  ];
  const sponsors = [
    {id:'linden', name:'Lindenwerke', fixed:'600 Credits', bonus:'350 Credits für einen Top-3-Abschluss'},
    {id:'nordlicht', name:'Nordlicht Sport', fixed:'450 Credits', bonus:'600 Credits für die Meisterschaft'},
    {id:'stadtbank', name:'Stadtbank Linden', fixed:'700 Credits', bonus:'150 Credits für den Pokalsieg'},
  ];
  const budgets = [
    {id:'0',name:'Förderpause',note:'Keine zusätzliche Investition.'},
    {id:'200',name:'Basisförderung',note:'Regelmäßige Förderung des Nachwuchses.'},
    {id:'400',name:'Intensive Förderung',note:'Mehr Förderung; starke Talente bleiben ungewiss.'},
  ];
  const reviewTitles = ['Sportliche Bilanz', 'Titel & Auszeichnungen', 'Spielerbilanz', 'Liga & Welt', 'Deine Zukunft', 'Saison 5 vorbereiten'];
  let phase = 0, transferDay = 1, reviewStep = 0, staying = false, sponsor = '', budget = '';
  const chosenSponsor = () => sponsors.find(item => item.id === sponsor);
  const credits = value => money(value);
  // Self-contained example accounts, not a projection of the static menu data.
  const closingBalance = 2260, basePayment = 1000, projectedSalaries = 1380;
  const availableBalance = () => closingBalance + basePayment + Number(chosenSponsor()?.fixed.split(' ')[0] || 0) - Number(budget || 0);
  const phaseTitle = () => phase === 3 ? reviewTitles[reviewStep] : phase === 6 ? `Transfertag ${transferDay} von 5` : phases[phase].title;
  const dock = document.createElement('section');
  dock.className = 'progress-dock';
  dock.setAttribute('aria-label','Spielfortschritt – Dummy-Vorschau');
  dock.innerHTML = `<a class="progress-context" href="#progress"><span id="progress-caption"></span><strong id="progress-phase"></strong></a><button type="button" class="button lime progress-next" id="progress-next"><span></span>${icon('arrow')}</button>`;
  document.querySelector('.topbar').after(dock);
  document.documentElement.classList.add('has-progress');
  const advanceButton = dock.querySelector('button');

  function actionLabel() {
    if (phase === 3) return ['Zu den Auszeichnungen', 'Zur Spielerbilanz', 'Zur Ligabilanz', 'Zum Saisonwechsel', staying ? 'Verbleib bestätigen' : 'Zukunft entscheiden', 'Neue Saison starten'][reviewStep];
    if (phase === 4 && sponsor) return 'Sponsor bestätigen';
    if (phase === 5 && budget !== '') return 'Transferphase starten';
    if (phase === 6 && transferDay === 5) return 'Transferschluss bestätigen';
    return phases[phase].action;
  }
  function updateDock() {
    document.querySelector('#progress-caption').textContent = `Demo · Saison ${phases[phase].season}`;
    document.querySelector('#progress-phase').textContent = phaseTitle();
    advanceButton.querySelector('span').textContent = actionLabel();
    dock.dataset.phase = String(phase);
    dock.dataset.review = String(reviewStep);
    document.querySelector('.topbar .season').textContent = document.querySelector('#content').dataset.route === 'progress' ? `Demo · Saison ${phases[phase].season}` : 'Referenzstand · Saison 4';
    const balance = document.querySelector('#progress-balance');
    if (balance) balance.textContent = credits(availableBalance());
    const afterSalary = document.querySelector('#progress-after-salary');
    if (afterSalary) afterSalary.textContent = credits(availableBalance() - projectedSalaries);
    const selection = document.querySelector('#progress-selection');
    if (selection) selection.textContent = phase === 3 ? (staying ? 'Dein Verbleib ist ausgewählt. Bestätige ihn mit dem Fortschrittsbutton.' : 'Bestätige deinen Verbleib, um Saison 5 vorzubereiten.') : phase === 4
      ? (sponsor ? `${sponsors.find(item => item.id === sponsor).name} ausgewählt. Mit „Sponsor bestätigen“ geht es weiter.` : 'Wähle ein Angebot, um fortzufahren.')
      : (budget !== '' ? `${budget} Credits ausgewählt. Mit „Transferphase starten“ bestätigst du die Förderung.` : 'Wähle ein Jugendbudget, um fortzufahren.');
  }
  const phaseLinks = (items) => `<div class="progress-links">${items.map(([route,label]) => link(route,label,'button')).join('')}</div>`;
  function seasonReview() {
    const intro = `<p class="progress-kicker">Saison 4 · ${reviewStep < 4 ? `Rückblick ${reviewStep + 1} von 4` : 'Saisonwechsel'}</p><h2>${reviewTitles[reviewStep]}</h2>`;
    let body = '';
    if (reviewStep === 0) body = `<p>Eine starke Saison für den FC Lindenstadt. Diese Abschlussdaten sind ein eigenständiges Beispiel für den Saisonwechsel.</p><dl class="facts">${fact('Liga','Platz 2 · 20 Punkte')}${fact('Nationaler Pokal','Halbfinale')}${fact('Europacup','Nicht qualifiziert')}</dl><h3>Kader zum Saisonende</h3><p>Keine Karriereenden in diesem Beispiel. Die Verträge von Luca Rossi und Mateo Silva wurden vor dem Abschluss verlängert; alle elf Profis bleiben an Bord.</p>`;
    if (reviewStep === 1) body = `<p>Die persönlichen Erfolge bleiben zusammen mit den Vereinstiteln im Rückblick sichtbar.</p>${row('Vereinstitel','Kein Titel in Saison 4')}<div class="award-grid">${awardCard('top-scorer','Torschützenkönig','Luca Rossi · 10 Ligatore · Saison 4')}${awardCard('player-of-season','Spieler der Saison','Leon Fischer · Saison 4')}${awardCard('man-of-the-match','Man of the Match · 3×','Luca Rossi · Deutschland · Saison 4')}</div>${row('Leon Fischer','Beste Vorlagenbilanz · 7 Vorlagen')}${phaseLinks([['club-history','Vereinschronik ansehen']])}`;
    if (reviewStep === 2) body = `<p>Alle elf Profis im Rückblick. Einsätze, Tore, Vorlagen und Durchschnittsnote der abgeschlossenen Pflichtspiele.</p><div class="table-wrap" role="region" aria-label="Spielerbilanz Saison 4" tabindex="0"><table><thead><tr><th>Spieler</th><th>${appearancesHeading()}</th><th>Tore</th><th>Vorl.</th><th>Ø Note</th></tr></thead><tbody>${players.map((p,i)=>`<tr><td>${countryHTML(p.nation)}<br>${p.name}${p.id==='rossi'?awardIcon('top-scorer','Torschützenkönig · Saison 4'):p.id==='fischer'?awardIcon('player-of-season','Spieler der Saison · Saison 4'):''}</td><td>${appearancesHTML([12,12,11,8,12,12,7,12,9,6,4][i],p.subs)}</td><td>${[0,1,1,0,4,2,0,13,4,2,0][i]}</td><td>${[0,2,1,1,7,5,2,3,1,1,0][i]}</td><td>${p.rating}</td></tr>`).join('')}</tbody></table></div>`;
    if (reviewStep === 3) body = `<p>Die Abschlusstabelle der Liga und die internationalen Sieger in diesem Beispiel.</p><div class="table-wrap" role="region" aria-label="Ligaabschluss Saison 4" tabindex="0"><table><thead><tr><th>Platz</th><th>Verein</th><th>Punkte</th></tr></thead><tbody>${clubs.map((club,i)=>`<tr ${i === 1 ? 'class="own"' : ''}><td>${i+1}</td><td>${club[1]}</td><td>${[24,20,15,11,8,6][i]}</td></tr>`).join('')}</tbody></table></div><div class="progress-world"><div class="award-grid">${awardCard('league','Meister Deutschland','SV Alsterstadt · Saison 4')}${awardCard('cup','Pokalsieger Deutschland','SC Rheinhafen · Saison 4')}${awardCard('europe','Europacupsieger','AC Bellavista · Saison 4')}${awardCard('league','Meister England','Northbridge FC · Saison 4','eng')}${awardCard('league','Meister Spanien','CD Puerto Azul · Saison 4','esp')}${awardCard('league','Meister Italien','AC Bellavista · Saison 4','ita')}${awardCard('league','Meister Frankreich','Olympique Valmont · Saison 4','fra')}${awardCard('league','Meister Portugal','Porto Atlântico · Saison 4','por')}</div></div>`;
    if (reviewStep === 4) body = `<p>Deine vierte Saison ist abgeschlossen. In diesem Beispiel liegt kein Stellenangebot eines anderen Vereins vor.</p><fieldset class="progress-options"><legend>Deine Managerentscheidung</legend><label class="progress-option"><input type="checkbox" name="demo-stay" ${staying ? 'checked' : ''}><span><strong>Beim FC Lindenstadt bleiben</strong><small>Führe deinen Verein durch Saison 5.</small></span></label></fieldset><p id="progress-selection" class="fine" role="status"></p>`;
    if (reviewStep === 5) body = `<p>Du bleibst beim FC Lindenstadt. Der nächste Schritt eröffnet Saison 5.</p><ol class="progress-plan"><li>Neuen Hauptsponsor auswählen</li><li>Finanzabschluss prüfen und Jugendförderung festlegen</li><li>Den Kader an fünf Transfertagen vorbereiten</li></ol><p>Die abgeschlossene Saison bleibt als Rückblick erhalten. In dieser Vorschau bleiben die übrigen Menüs beim bisherigen Referenzstand.</p>`;
    return intro + body + (reviewStep > 0 && reviewStep < 4 ? '<button type="button" class="text-link progress-back" data-review-back>← Vorheriger Rückblick</button>' : '');
  }
  function phaseBody() {
    if (phase === 0) return `<h2>Dein Verein ist bereit</h2><p>Als Nächstes steht das Heimspiel gegen den SC Rheinhafen an. Kader, Verträge und offene Angebote bleiben bis zum nächsten Schritt erreichbar.</p>${phaseLinks([['squad','Kader ansehen'],['transfers-offers','Angebote prüfen']])}`;
    if (phase === 1) return `<h2>FC Lindenstadt gegen SC Rheinhafen</h2><p>Sonntag, 15. September · Liga · Spieltag 7</p><div class="progress-match"><div>${crest()}<strong>FC Lindenstadt</strong><small>Heim · Platz 2</small></div><span>gegen</span><div>${crest('RH','#d8c193')}<strong>SC Rheinhafen</strong><small>Auswärts · Platz 3</small></div></div><p>Die Spielansicht wird in dieser Vorschau übersprungen. Der nächste Schritt zeigt ein festes Beispielergebnis.</p>${phaseLinks([['opponent','Gegner ansehen'],['squad','Kader ansehen']])}`;
    if (phase === 2) return `<h2>Heimsieg für Lindenstadt</h2><div class="progress-result"><span>FC Lindenstadt</span><strong>2 : 1</strong><span>SC Rheinhafen</span></div><p>Fiktives Ergebnis für diesen Ablauf. Es fließt nicht in die Tabellen und Statistiken der übrigen Beispielansichten ein.</p><p class="fine">Der nächste Klick springt für die Designprüfung zum Saisonabschluss. Weitere Partien werden hier nicht durchgespielt.</p>`;
    if (phase === 3) return seasonReview();
    if (phase === 4) return `<h2>Wähle deinen Hauptsponsor</h2><p>Das Fixum ist sicher; Boni hängen vom sportlichen Erfolg ab. Wähle für die Demo ein Angebot und bestätige es mit dem Fortschrittsbutton.</p><fieldset class="progress-options"><legend>Beispielangebote für Saison 5</legend>${sponsors.map(item => `<label class="progress-option"><input type="radio" name="demo-sponsor" value="${item.id}" ${sponsor === item.id ? 'checked' : ''}><span><strong>${item.name}</strong><span>${item.fixed} Fixum</span><small>${item.bonus}</small></span></label>`).join('')}</fieldset><p id="progress-selection" class="fine" role="status"></p>`;
    if (phase === 5) return `<h2>Finanzabschluss & Jugendförderung</h2><p>Die alte Saison ist abgerechnet. ${chosenSponsor().name} unterstützt deinen Verein in Saison 5.</p><h3 class="progress-subheading">Abrechnung · Saison 4</h3>${row('Kontostand vor Schlusszahlungen',credits(2840))}${row('Letzte sichere Prämien','+ '+credits(450))}${row('Verdienter Sponsorbonus · Top 3','+ '+credits(350))}${row('Jahresgehälter vollständig bezahlt','− '+credits(1380))}${row('Übertrag in Saison 5',credits(closingBalance),'total')}<h3 class="progress-subheading">Neue Saison · Saison 5</h3>${row('Übertrag',credits(closingBalance))}${row('Grundbetrag · Beispielzahlung','+ '+credits(basePayment))}${row('Sponsorfixum bereits eingegangen','+ '+chosenSponsor().fixed)}<fieldset class="progress-options"><legend>Jugendförderung wählen</legend>${budgets.map(item => `<label class="progress-option"><input type="radio" name="demo-budget" value="${item.id}" ${budget === item.id ? 'checked' : ''}><span><strong>${item.name} · ${item.id} Credits</strong><small>${item.note}</small></span></label>`).join('')}</fieldset><p id="progress-selection" class="fine" role="status"></p>${row('Kontostand zum Transferstart','<output id="progress-balance" aria-live="polite"></output>','total')}${row('Vereinbarte Gehälter der neuen Saison',credits(projectedSalaries))}${row('Rest nach diesen Gehältern','<output id="progress-after-salary" aria-live="polite"></output>')}<p class="fine">Jugendförderung wird zum Transferstart bezahlt; Gehälter erst am Ende von Saison 5. Neue Transfers, weitere Einnahmen und mögliche Sponsorboni sind nicht enthalten.</p>`;
    if (phase === 6) return `<h2>Transfertag ${transferDay} von 5</h2><p>Prüfe den Kader und mögliche Verpflichtungen. Jeder Klick auf den Fortschrittsbutton schaltet in dieser Demo genau einen Transfertag weiter.</p><dl class="facts">${fact('Profikader','11 / 14')}${fact('Freie Plätze','3')}${fact('Transferphase',transferDay === 5 ? 'Letzter Tag' : 'Geöffnet')}</dl>${phaseLinks([['transfers','Spieler suchen'],['transfers-offers','Angebote ansehen'],['squad-contracts','Verträge prüfen']])}<p class="fine">Zum Transferschluss sind im echten Ablauf Kader- und Angebotsprüfungen erforderlich. Der Beispielkader ist vollständig.</p>`;
    return `<h2>Saison 5 kann beginnen</h2><p>Der Saisonwechsel ist abgeschlossen. Deine Auswahl für diese Demo:</p><dl class="facts">${fact('Verein','FC Lindenstadt')}${fact('Hauptsponsor',chosenSponsor().name)}${fact('Jugendförderung',budget+' Credits')}${fact('Kontostand',credits(availableBalance()))}${fact('Transferphase','Alle fünf Tage abgeschlossen')}${fact('Profikader','11 Spieler · vollständig')}</dl><p>Mit „Demo neu starten“ kehrst du zum Ausgangspunkt in Saison 4 zurück.</p>`;
  }
  window.progressPage = () => head(phase === 3 ? 'Eine Saison bleibt in Erinnerung.' : phase >= 4 ? 'Ein neuer Anfang für deinen Verein.' : 'Der nächste Schritt zählt.',`Demo · Saison ${phases[phase].season} · ${phaseTitle()}`) + `<div class="notice">Dieser Ablauf verwendet Beispieldaten. Die übrigen Menüs bleiben beim gezeigten Referenzstand.</div><section class="panel panel-pad progress-page">${phaseBody()}</section><div class="progress-reset"><button type="button" class="text-link" data-progress-reset>Demo zurücksetzen</button><span>Der Ablauf wird beim Neuladen zurückgesetzt.</span></div>`;

  const previousRender = render;
  render = function() { previousRender(); updateDock(); };
  function showPhase() {
    if (location.hash === '#progress') {
      render();
      document.querySelector('#content').focus({preventScroll:true});
      window.scrollTo(0,0);
    } else location.hash = 'progress';
    updateDock();
    document.querySelector('#announcement').textContent = `Demo · Saison ${phases[phase].season}: ${phaseTitle()}`;
  }
  function reset() { phase = 0; transferDay = 1; reviewStep = 0; staying = false; sponsor = ''; budget = ''; showPhase(); }
  advanceButton.addEventListener('click', () => {
    if (phase === 7) return reset();
    if ((phase === 4 && !sponsor) || (phase === 5 && budget === '')) return showPhase();
    if (phase === 3 && reviewStep === 4 && !staying) return showPhase();
    if (phase === 3 && reviewStep < 5) { reviewStep++; return showPhase(); }
    if (phase === 6 && transferDay < 5) transferDay++;
    else phase++;
    showPhase();
  });
  document.addEventListener('change', event => {
    if (event.target.name === 'demo-stay') staying = event.target.checked;
    if (event.target.name === 'demo-sponsor' && sponsors.some(item => item.id === event.target.value)) sponsor = event.target.value;
    if (event.target.name === 'demo-budget' && budgets.some(item => item.id === event.target.value)) budget = event.target.value;
    updateDock();
  });
  document.addEventListener('click', event => {
    if (event.target.closest('[data-progress-reset]')) reset();
    if (event.target.closest('[data-review-back]') && phase === 3 && reviewStep > 0 && reviewStep < 4) { reviewStep--; showPhase(); }
  });
  // Measure actual navigation height, including safe areas and short landscape mode.
  const mobileNav = document.querySelector('.mobile-nav');
  const measure = () => {
    document.documentElement.style.setProperty('--progress-nav-height', mobileNav.getBoundingClientRect().height+'px');
    document.documentElement.style.setProperty('--progress-dock-height', dock.getBoundingClientRect().height+'px');
  };
  const observer = new ResizeObserver(measure);
  observer.observe(mobileNav);
  observer.observe(dock);
  updateDock();
  measure();
  if (location.hash === '#progress') render();
})();

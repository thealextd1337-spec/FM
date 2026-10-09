/* Overview decorates existing controller-owned nodes; all new data is projected. */
(() => {
  'use strict';
  const ns = window.D6Flutlicht;
  const c = ns.components;
  const navigation = new WeakMap();
  function element(parent, selector, tag, className) {
    let node = parent.querySelector(selector);
    if (!node) { node = parent.ownerDocument.createElement(tag); node.className = className; parent.append(node); }
    return node;
  }
  function markup(node, html) { if (node.innerHTML !== html) node.innerHTML = html; }
  function goalStatus(goal, t) {
    const achieved = goal.achieved === true, onCourse = goal.onCourse === true;
    const known = typeof goal.onCourse === 'boolean' || typeof goal.achieved === 'boolean';
    const label = achieved ? 'Endgültig erreicht' : onCourse ? 'Aktuell auf Kurs' : known ? 'Ziel offen' : 'Status nicht erfasst';
    const tone = achieved ? 'achieved' : onCourse ? 'success' : known ? 'warning' : 'neutral';
    const payment = goal.paid === true ? 'Bereits bezahlt' : goal.paid === false ? 'Noch nicht bezahlt' : 'Zahlungsstatus nicht erfasst';
    return `<span class="fl-overview-goal-state">${c.status({tone,label:`${achieved ? '◆ ' : onCourse ? '✓ ' : ''}${t(label)}`})}<small>${c.escape(t(payment))}</small></span>`;
  }
  function dashboard(view, data, t, actions) {
    if (!Array.isArray(data.kpis) && !Array.isArray(data.office) && !data.finance) return;
    const kpis = element(view, '.fl-overview-kpis', 'dl', 'fl-overview-kpis');
    kpis.setAttribute('aria-label', t('Vereinskennzahlen'));
    markup(kpis, (data.kpis || []).map(item => `<div><dt>${c.escape(item.label)}</dt><dd><strong>${c.escape(item.value)}</strong>${item.detail ? `<small>${c.escape(item.detail)}</small>` : ''}</dd></div>`).join(''));
    if (view.firstElementChild !== kpis) view.prepend(kpis);
    const main = view.querySelector('.fl-overview-main') || [...view.children].find(node => node.matches('.v62-season') && !node.matches('.v67-season-show,.v67-transition,.v68-digest,.v66-transfer-day,.v67-transfer-review,.v66-sponsors'));
    if (!main) return;
    let grid = view.querySelector('.fl-overview-grid');
    if (!grid) {
      grid = view.ownerDocument.createElement('div');grid.className = 'fl-overview-grid';
      main.before(grid);grid.append(main);
    }
    main.classList.add('fl-overview-main');
    const aside = element(grid, '.fl-overview-aside', 'div', 'fl-overview-aside');
    const office = element(aside, '.fl-overview-office', 'section', 'fl-overview-office');
    office.setAttribute('aria-label', t('Im Vereinsbüro'));
    const tasks = data.office || [];
    markup(office, `<h3>${c.escape(t('Im Vereinsbüro'))}</h3>${tasks.length ? `<ul>${tasks.map(item => `<li>${item.route?`<button type="button" class="fl-overview-task" data-fl-overview-route="${c.escape(item.route)}"${item.section ? ` data-fl-overview-section="${c.escape(item.section)}"` : ''}>`:'<div class="fl-overview-task">'}<span class="fl-overview-task-icon">${c.icon(item.route)}</span><span class="fl-overview-task-copy"><strong>${c.escape(item.title)}</strong>${item.route?`<span>${c.escape(item.actionLabel || t('Ansehen'))}</span>`:''}</span>${item.detail?`<b class="fl-overview-task-count">${c.escape(item.detail)}</b>`:''}${item.route?c.icon('arrow')+'</button>':'</div>'}</li>`).join('')}</ul>` : `<p class="fl-overview-empty">${c.escape(t('Aktuell keine offenen Aufgaben.'))}</p>`}<p class="fl-overview-office-note">${c.escape(t('Fristen und offene Entscheidungen bleiben hier sichtbar.'))}</p>`);
    const finance = element(aside, '.fl-overview-finance', 'section', 'fl-overview-finance');
    finance.setAttribute('aria-label', t('Dein finanzieller Spielraum'));
    const money = data.finance;
    markup(finance, `<div class="fl-overview-section-head"><h3>${c.escape(t('Dein finanzieller Spielraum'))}</h3><button type="button" data-fl-overview-route="club" data-fl-overview-section="finances">${c.escape(t('Finanzen'))} ${c.icon('arrow')}</button></div>${money ? `<small>${c.escape(t('Aktueller Kontostand'))}</small><strong class="fl-overview-balance">${c.escape(money.balanceLabel)}</strong><dl>${(money.rows || []).map(row => `<div${row.tone === 'total' ? ' class="fl-overview-finance-total"' : ''}><dt>${c.escape(row.label)}</dt><dd>${c.escape(row.valueLabel)}</dd></div>`).join('')}</dl>${money.note ? `<p class="fl-overview-finance-note">${c.escape(money.note)}</p>` : ''}` : `<p>${c.escape(t('Nicht erfasst'))}</p>`}`);
    // Keep the existing news and its profile/report actions, below the dashboard.
    [...view.children].filter(node => node.matches('.v68-digest')).forEach(node => grid.after(node));
    let binding = navigation.get(view);
    if (!binding) {
      binding = {actions};
      binding.click = event => {
        const button = event.target.closest('[data-fl-overview-route]');
        if (button && view.contains(button)) binding.actions.navigate?.(button.dataset.flOverviewRoute, {section:button.dataset.flOverviewSection});
      };
      view.addEventListener('click', binding.click);navigation.set(view, binding);
    }
    binding.actions = actions;
    return () => { view.removeEventListener('click', binding.click);navigation.delete(view); };
  }
  function enhance(root, projection, actions = {}) {
    const view = root.matches?.('[data-v46-view="overview"]') ? root : root.querySelector('[data-v46-view="overview"]');
    if (!view) return;
    const data = projection.overview || {}, t = text => actions.t ? actions.t(text) : text;
    view.classList.add('fl-overview');
    const cleanup = dashboard(view, data, t, actions);
    view.querySelectorAll('.v67-season-show,.v67-transition,.v68-digest,.v66-sponsors,.v66-transfer-day,.v67-transfer-review').forEach(node => node.classList.add('fl-overview-panel'));
    const contract = view.querySelector('.v66-sponsor-selected');
    if (contract) {
      if (!contract.id) contract.id = 'fl-overview-contract';
      contract.tabIndex = -1;
      const goals = contract.querySelectorAll('.v66-sponsor-goals li');
      goals.forEach((row, index) => {
        const goal = data.sponsor?.goals?.[index];
        if (goal) markup(element(row, '.fl-overview-contract-status', 'span', 'fl-overview-contract-status'), goalStatus(goal,t));
        else row.querySelector('.fl-overview-contract-status')?.remove();
      });
      const note = element(contract, '.fl-overview-payment-note', 'p', 'fl-overview-payment-note');
      note.textContent = t('Erreichte Sponsorboni werden am Saisonende bezahlt.');
    }
    const fixture = view.querySelector('.v62-next-opponent'), match = data.fixture;
    if (!fixture || !match) return cleanup;
    fixture.classList.add('fl-overview-fixture');
    const header = fixture.querySelector(':scope > p');
    if (header) {
      header.classList.add('fl-overview-fixture-heading');
      markup(header, `<strong>${c.escape(t('Nächste Begegnung'))}</strong><span>${c.escape([match.dateLabel,match.seasonLabel].filter(Boolean).join(' · '))}</span><small>${c.escape([match.competitionLabel,match.roundLabel].filter(Boolean).join(' · '))}</small>`);
    }
    const teams = fixture.querySelector('.v49-fixture');
    if (!teams) return cleanup;
    teams.classList.add('fl-overview-teams');
    [...teams.querySelectorAll(':scope > .v49-club')].forEach((node, index) => {
      const team = index === 0 ? match.home : match.away;
      if (!team) return;
      node.classList.add('fl-overview-team');
      const crest = element(node, '.fl-overview-team-crest', 'button', 'fl-overview-team-crest');
      crest.type = 'button'; crest.dataset.v68Club = team.id;
      crest.setAttribute('aria-label', `${t('Vereinsprofil')}: ${team.name}`);
      markup(crest, team.crestHTML || '');
      const history = element(node, '.fl-overview-recent', 'div', 'fl-overview-recent');
      history.setAttribute('aria-label', `${t('Letzte 5 Spiele')} · ${t('Ältestes Ergebnis zuerst')}`);
      const recent = Array.isArray(team.recent) ? team.recent.slice(-5) : [];
      markup(history, `<small>${c.escape(t('Letzte 5 Spiele'))}</small>${recent.length ? `<div class="fl-overview-results">${recent.map(result => c.result(result)).join('')}</div>` : `<span class="fl-overview-no-results">${c.escape(t('Noch keine Spiele erfasst'))}</span>`}`);
      node.querySelector('.v49-form')?.remove();
    });
    const center = element(teams, '.fl-overview-center', 'div', 'fl-overview-center');
    [...teams.children].filter(node => node !== center && !node.classList.contains('v49-club')).forEach(node => center.append(node));
    const versus = center.querySelector(':scope > span');
    if (versus) { versus.classList.add('fl-overview-versus');markup(versus, `<span aria-hidden="true">–</span><span class="fl-sr-only">${c.escape(t('gegen'))}</span>`); }
    const sponsor = data.sponsor;
    if (sponsor && contract) {
      const identity = element(center, '.fl-overview-sponsor', 'a', 'fl-overview-sponsor');
      identity.href = `#${contract.id}`;
      identity.setAttribute('aria-label', `${t('Hauptsponsor')}: ${sponsor.name}. ${t('Vertrag ansehen')}`);
      markup(identity, `${sponsor.logoHTML || `<strong>${c.escape(sponsor.name)}</strong>`}<small>${c.escape(t('präsentiert'))}</small>`);
      const compact = element(fixture, '.fl-overview-goals', 'div', 'fl-overview-goals');
      markup(compact, (sponsor.goals || []).map(goal => `<a class="fl-overview-goal" href="#${c.escape(contract.id)}"><span>${c.escape(goal.label)} <b>${c.escape(goal.bonusLabel)}</b></span>${goalStatus(goal,t)}</a>`).join(''));
      teams.after(compact);
    } else {
      center.querySelector('.fl-overview-sponsor')?.remove();
      fixture.querySelector('.fl-overview-goals')?.remove();
    }
    return cleanup;
  }
  ns.registry.register({id:'U01-A',enhance});
})();

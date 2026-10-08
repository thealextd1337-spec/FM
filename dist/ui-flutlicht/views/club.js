(() => {
  'use strict';
  const ns = window.D6Flutlicht = window.D6Flutlicht || {};
  const markup = new WeakMap();
  const tabsByPanel = new WeakMap(), selectedByClub = new Map();
  const sections = [['profile', 'Vereinsprofil'], ['finances', 'Finanzen'], ['sponsor', 'Sponsor'], ['history', 'Chronik & Erfolge'], ['manager', 'Managerlaufbahn']];
  let nextTabsId = 0;
  const update = (node, html) => { if (markup.get(node) !== html) { node.innerHTML = html;markup.set(node, html); } };
  const within = (root, selector) => [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
  function select(panel, section, {focus = false} = {}) {
    const state = tabsByPanel.get(panel);if (!state || !panel.isConnected || !state.nav.isConnected || !state.panels.has(section)) return false;
    state.active = section;selectedByClub.set(state.id, section);panel.dataset.flClubActive = section;
    for (const [key, body] of state.panels) {
      body.hidden = key !== section;
      const button = state.buttons.get(key);button.setAttribute('aria-selected', String(key === section));button.tabIndex = key === section ? 0 : -1;
    }
    // One native honours node is reachable from both relevant tabs, without copied controls.
    if (state.honours) {
      if (section === 'profile') state.profileGrid.append(state.honours);
      else if (section === 'history') state.panels.get('history').prepend(state.honours);
    }
    if (focus) state.buttons.get(section).focus({preventScroll: true});
    return true;
  }
  function clubTabs(panel, data, actions, t, E) {
    let state = tabsByPanel.get(panel);
    if (!state) {
      const prefix = `fl-club-${++nextTabsId}`, nav = document.createElement('div'), bodies = document.createElement('div');
      nav.className = 'fl-club-tabs';nav.setAttribute('role', 'tablist');
      bodies.className = 'fl-club-tab-panels';
      state = {id: data.ownId, nav, bodies, buttons: new Map(), panels: new Map(), actions, active: 'profile', profileGrid: panel.querySelector('.v68-profile-grid'), honours: panel.querySelector('.v68-profile-grid > .v62-season:nth-child(2)')};
      for (const [key] of sections) {
        const button = document.createElement('button'), body = document.createElement('section');
        button.type = 'button';button.id = `${prefix}-tab-${key}`;button.dataset.flClubTab = key;button.setAttribute('role', 'tab');button.setAttribute('aria-controls', `${prefix}-panel-${key}`);
        body.id = `${prefix}-panel-${key}`;body.className = 'fl-club-tab-panel';body.dataset.flClubSection = key;body.setAttribute('role', 'tabpanel');body.setAttribute('aria-labelledby', button.id);
        nav.append(button);bodies.append(body);state.buttons.set(key, button);state.panels.set(key, body);
      }
      const notify = key => { if (select(panel, key)) state.actions.setClubSection?.(key); };
      nav.addEventListener('click', event => {const button = event.target.closest('[data-fl-club-tab]');if (button && nav.contains(button)) notify(button.dataset.flClubTab);});
      nav.addEventListener('keydown', event => {
        if (!nav.isConnected || !panel.isConnected) return;
        const button = event.target.closest('[data-fl-club-tab]');if (!button || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();const keys = sections.map(([key]) => key), index = keys.indexOf(button.dataset.flClubTab), key = keys[event.key === 'Home' ? 0 : event.key === 'End' ? keys.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + keys.length) % keys.length];
        notify(key);state.buttons.get(key).focus({preventScroll: true});
      });
      state.panels.get('sponsor').addEventListener('click', event => {if (panel.isConnected && event.currentTarget.isConnected && event.target.closest('[data-fl-club-sponsor-select]')) state.actions.navigate?.('overview', {section: 'sponsor'});});
      const heading = panel.querySelector(':scope > .v46-view-heading');if (heading) heading.after(nav);else panel.prepend(nav);nav.after(bodies);tabsByPanel.set(panel, state);
    }
    state.actions = actions;state.nav.setAttribute('aria-label', t('Vereinsbereiche'));
    for (const [key, label] of sections) state.buttons.get(key).textContent = t(label);
    // Move, never clone, the controller-owned nodes. Kit/filter values and listeners survive a tab switch.
    for (const node of [...panel.children]) {
      if (node === state.nav || node === state.bodies || node.matches('.v46-view-heading')) continue;
      let key = 'profile';
      if (node.matches('.v66-finance')) key = 'finances';
      else if (node.matches('.v67-manager')) key = 'manager';
      else if (node.matches('.v74-transfer-history,.v74-club-chronicle,.fl-club-records') || node.querySelector('.v68-history [data-v68-player]')) key = 'history';
      else if (node.matches('.v66-sponsors')) key = 'sponsor';
      state.panels.get(key).append(node);
    }
    let sponsor = state.panels.get('sponsor').querySelector('.fl-club-sponsor-content');
    if (!sponsor) {sponsor = document.createElement('div');sponsor.className = 'fl-club-sponsor-content';state.panels.get('sponsor').append(sponsor);}
    update(sponsor, data.sponsorHTML || `<section class="fl-club-empty-panel"><h3>${E(t('Sponsor'))}</h3><p>${E(t('Noch kein Sponsor gewählt.'))}</p><button type="button" class="menu-action" data-fl-club-sponsor-select>${E(t('Sponsor auswählen'))}</button></section>`);
    for (const [key, label] of [['finances', 'Vereinsfinanzen nicht verfügbar.'], ['manager', 'Managerlaufbahn nicht verfügbar.']]) {
      const body = state.panels.get(key), empty = body.querySelector(':scope > .fl-club-empty-panel');
      if (body.querySelector(key === 'finances' ? '.v66-finance' : '.v67-manager')) empty?.remove();
      else {const message = empty || body.appendChild(document.createElement('p'));message.className = 'fl-club-empty-panel';message.textContent = t(label);}
    }
    select(panel, state.panels.has(data.activeSection) ? data.activeSection : selectedByClub.get(data.ownId) || 'profile');
  }
  function enhance(root, projection, actions = {}) {
    const data = projection?.club;if (!data || !ns.components) return;
    const C = ns.components, E = C.escape, t = text => actions.t ? actions.t(text) : text;
    const profiles = new Map((data.profiles || []).map(profile => [profile.id, profile]));
    const playerName = player => player.profileAvailable && player.playerId
      ? `<button type="button" class="v68-text-link fl-club-player" data-v68-player="${E(player.playerId)}" aria-label="${E(t('Spielerprofil öffnen'))}: ${E(player.name)}">${E(player.name)}</button>`
      : `<span class="fl-club-player-name">${E(player.name || t('Spieler nicht mehr verfügbar'))}</span>`;
    for (const panel of within(root, '[data-v46-view="club"], [data-v68-detail][data-fl-club-id]')) {
      const id = panel.dataset.flClubId || data.ownId, profile = profiles.get(id);if (!profile) continue;
      panel.classList.add('fl-club');
      let records = panel.querySelector('.fl-club-records');
      if (!records) {
        records = document.createElement('section');records.className = 'fl-club-records';
        const chronicle = panel.querySelector('.v74-club-chronicle');if (chronicle) chronicle.after(records);else panel.append(records);
      }
      const board = (rows, label) => {
        const valid = (rows || []).filter(row => Number.isFinite(row.value) && row.value >= 0).slice(0, 10);
        return `<section class="fl-club-record-board"><h4>${E(t(label))}</h4>${valid.length ? `<ol class="fl-club-record-list">${valid.map((row, index) => `<li><span class="fl-club-record-rank">${E(Number.isFinite(row.rank) ? row.rank : index + 1)}</span>${playerName(row)}<strong class="fl-club-record-value">${E(row.value)}</strong></li>`).join('')}</ol>` : `<p class="fl-club-empty">${E(t('Noch keine erfassten Vereinswerte.'))}</p>`}</section>`;
      };
      update(records, `<div class="fl-club-section-heading"><span>${E(t('Chronik & Erfolge'))}</span><h3>${E(t('Ewige Top 10'))}</h3></div><p class="fl-club-coverage">${E(t(profile.records?.coverageLabel || 'Erfasste Vereinswerte; ältere oder entfernte Spieler können fehlen.'))}</p><div class="fl-club-record-grid">${board(profile.records?.goals, 'Tore für den Verein')}${board(profile.records?.appearances, 'Einsätze für den Verein')}</div>`);
      let lineup = panel.querySelector('.fl-club-last-lineup');
      if (!lineup) {
        lineup = document.createElement('section');lineup.className = 'fl-club-last-lineup';
        const roster = panel.querySelector('.v61-roster-section');if (roster) roster.after(lineup);else records.before(lineup);
      }
      const last = profile.lastLineup;
      update(lineup, `<div class="fl-club-section-heading"><h3>${E(t('Letzte aufgezeichnete Aufstellung'))}</h3></div>${last ? `<p class="fl-club-lineup-meta">${E(t('Saison'))} ${E(last.season)} · ${E(last.dateLabel)} · ${E(t(last.competitionLabel || ''))}<br>${E(t('Gegen'))} ${E(last.opponentName)}</p>${last.olderThanLastMatch ? `<p class="fl-club-coverage">${E(t('Neuere Aufstellung nicht erfasst.'))}</p>` : ''}<ul class="fl-club-lineup-list">${(last.players || []).map(player => `<li>${playerName(player)}</li>`).join('')}</ul>` : `<p class="fl-club-empty">${E(t('Letzte Aufstellung nicht erfasst.'))}</p>`}`);
      if (panel.matches('[data-v46-view="club"]')) clubTabs(panel, data, actions, t, E);
    }
    for (const panel of within(root, '[data-v68-detail]')) {
      if (panel.querySelector('.v68-coach-profile')) panel.classList.add('fl-club-coach-detail');
    }
    for (const panel of within(root, '.v66-finance, #v124-budget, .v130-finance-close')) panel.classList.add('fl-club-finances');
  }
  ns.clubView = Object.freeze({select});
  ns.registry.register({ id: 'U01-E', enhance });
})();

(() => {
  'use strict';
  const ns = window.D6Flutlicht = window.D6Flutlicht || {};
  const filters = new Map();
  const bindings = new WeakMap();
  const markup = new WeakMap();
  const setHTML = (node, html) => { if (markup.get(node) !== html) { node.innerHTML = html;markup.set(node, html); } };
  const setText = (node, text) => { if (node.textContent !== text) node.textContent = text; };
  const validPositions = new Set(['gk', 'def', 'mid', 'att']);
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  function enhance(root, projection, actions = {}) {
    const data = projection?.players;
    if (!data || !ns.components) return;
    const C = ns.components, t = text => actions.t ? actions.t(text) : text;
    const localized = item => item ? { ...item, label: t(item.label || ''), colorLabel: t(item.colorLabel || '') } : null;
    const skillsHTML = player => (player.skills || []).map(skill => C.skill(localized(skill))).join('') || `<span>${C.escape(t('Keine bekannten Fähigkeiten.'))}</span>`;
    const formHTML = (player,compact=false) => C.form({...(localized(player.form) || { band: 'unknown', label: t('Nicht erfasst') }),compact});
    const ratingText = value => value.toLocaleString(window.doppel6Language?.get()==='en'?'en-GB':'de-DE',{minimumFractionDigits:1,maximumFractionDigits:1});
    const ratingBand = n => n>=9?'pink':n>=7.5?'orange':n>=6?'yellow':n>=4.5?'bluegray':'violetgray';
    const ratingHistory = player => {
      const ratings = player.formRatings;
      if (!ratings?.length) return `<span class="fl-rating-missing" tabindex="0" data-fl-tooltip="${C.escape(t('Formzeitraum nicht erfasst'))}" aria-label="${C.escape(t('Formzeitraum nicht erfasst'))}">–</span>`;
      return `<span class="fl-rating-history" role="list" aria-label="${C.escape(t('Spiele im Formzeitraum'))}">${ratings.map((rating,index)=>{
        const label = `${t('Spiel')} ${index+1} / ${ratings.length} · ${t('Note')} ${ratingText(rating)} · ${t(index===ratings.length-1?'neuestes Spiel':index===0?'ältestes Spiel':'ältestes → neuestes')}`;
        return `<span role="listitem"><button type="button" class="fl-rating-game fl-band-${ratingBand(rating)}" data-fl-tooltip="${C.escape(label)}" aria-label="${C.escape(label)}"><i style="height:${Math.max(4,rating*3)}px" aria-hidden="true"></i></button></span>`;
      }).join('')}</span>`;
    };
    const freshHTML = player => C.freshness(localized(player.freshness) || { band: 'unknown', label: t('Frische nicht erfasst') });
    const squad = root.matches?.('[data-v46-view="squad"]') ? root : root.querySelector?.('[data-v46-view="squad"]');
    const table = squad?.querySelector('.v61-roster-section .v61-roster-table');
    if (table) {
      squad.classList.add('fl-squad');
      table.classList.add('fl-squad-table');
      const stateKey = String(data.ownClubId || 'squad');
      if (!filters.has(stateKey)) filters.set(stateKey, { query: '', position: 'all' });
      const state = filters.get(stateKey), players = new Map((data.roster || []).map(player => [player.id, player]));
      let tools = squad.querySelector('.fl-squad-tools');
      if (!tools) {
        tools = document.createElement('div');tools.className = 'fl-squad-tools';
        tools.innerHTML = '<label><span data-fl-squad-search-label></span><input type="search" data-fl-squad-search autocomplete="off"></label><label><span data-fl-squad-position-label></span><select data-fl-squad-position></select></label><p class="fl-squad-count" role="status" aria-live="polite"></p>';
        table.parentElement.before(tools);
      }
      const input = tools.querySelector('[data-fl-squad-search]'), select = tools.querySelector('[data-fl-squad-position]');
      setText(tools.querySelector('[data-fl-squad-search-label]'), t('Spieler suchen'));
      input.placeholder = t('Name oder Nationalität');if (input.value !== state.query) input.value = state.query;
      setText(tools.querySelector('[data-fl-squad-position-label]'), t('Position'));
      setHTML(select, [['all', 'Alle Positionen'], ['gk', 'Torwart'], ['def', 'Abwehr'], ['mid', 'Mittelfeld'], ['att', 'Angriff']].map(([value, label]) => `<option value="${value}">${C.escape(t(label))}</option>`).join(''));
      if (select.value !== state.position) select.value = state.position;
      let empty = squad.querySelector('.fl-squad-empty');
      if (!empty) { empty = document.createElement('p');empty.className = 'fl-squad-empty';table.parentElement.after(empty); }
      setText(empty, t('Keine Spieler in dieser Auswahl.'));
      const headings = [...table.querySelectorAll('thead th')].map(cell => cell.textContent.replace(/[▲▼↑↓]/g, '').trim());
      for (const row of table.querySelectorAll('tbody tr[data-v61-roster-row]')) {
        const button = row.querySelector('[data-v61-player]'), player = players.get(button?.dataset.v61Player);
        if (!player) continue;
        const nameCell = button.closest('th,td');
        let identity = nameCell.querySelector('.fl-squad-identity');
        if (!identity) { identity = document.createElement('div');identity.className = 'fl-squad-identity';button.before(identity);identity.append(button); }
        const flag = button.querySelector('.flag-icon');if (flag && button.lastChild !== flag) button.append(flag);
        let form = identity.querySelector('.fl-squad-form');
        if (!form) { form = document.createElement('span');form.className = 'fl-squad-form';identity.append(form); }
        setHTML(form, formHTML(player,true));
        let details = nameCell.querySelector('.fl-squad-player-detail');
        if (!details) { details = document.createElement('div');details.className = 'fl-squad-player-detail';nameCell.append(details); }
        setHTML(details, `<div class="fl-squad-skills" role="list" aria-label="${C.escape(t('Alle Fähigkeiten'))}">${skillsHTML(player)}</div><div class="fl-squad-freshness">${freshHTML(player)}</div>`);
        for (const skill of details.querySelectorAll('.fl-skill')) skill.setAttribute('role', 'listitem');
        [...row.cells].forEach((cell, index) => { cell.dataset.flSquadLabel = headings[index] || ''; });
        const appearance = row.cells[4], stats = player.stats;
        if (appearance && stats && Number.isFinite(stats.appearances)) {
          const complete = stats.substitutionCoverage === 'complete' && Number.isFinite(stats.substitutions);
          const explanation = t('Einsätze insgesamt, davon als Einwechselspieler') + (complete ? '' : '. ' + t('Einwechslungen nicht erfasst'));
          setText(appearance, `${stats.appearances} (${complete ? stats.substitutions : '–'})`);
          appearance.setAttribute('aria-label', `${appearance.textContent}: ${explanation}`);
          appearance.dataset.flTooltip = explanation;appearance.tabIndex = 0;
        }
        const rating = row.cells[7];
        if (rating && stats) {
          const average = Number.isFinite(stats.averageRating)?ratingText(stats.averageRating):'–';
          setHTML(rating, `<span class="fl-rating-average fl-band-${Number.isFinite(stats.averageRating)?ratingBand(stats.averageRating):'unknown'}" tabindex="0" data-fl-tooltip="${C.escape(t('Durchschnittsnote der aktuellen Saison'))}">${average}</span>${ratingHistory(player)}`);
          rating.classList.add('fl-squad-rating');
        }
      }
      const applyFilter = () => {
        let visible = 0, total = 0;
        for (const row of table.querySelectorAll('tbody tr[data-v61-roster-row]')) {
          const player = players.get(row.querySelector('[data-v61-player]')?.dataset.v61Player);
          if (!player) continue;
          total++;
          const haystack = normalize(`${player.name} ${player.nationLabel} ${player.nationCode}`);
          row.hidden = !(haystack.includes(normalize(state.query)) && (state.position === 'all' || player.positionCode === state.position));
          if (!row.hidden) visible++;
        }
        setText(tools.querySelector('.fl-squad-count'), `${visible} / ${total} ${t('Spieler')}`);
        empty.hidden = visible !== 0;
      };
      const prior = bindings.get(tools);if (prior) prior();
      const onInput = () => { state.query = input.value;applyFilter(); };
      const onChange = () => { state.position = validPositions.has(select.value) ? select.value : 'all';applyFilter(); };
      input.addEventListener('input', onInput);select.addEventListener('change', onChange);
      bindings.set(tools, () => { input.removeEventListener('input', onInput);select.removeEventListener('change', onChange); });
      applyFilter();
    }
    const doc = root.ownerDocument || document;
    const all = new Map((data.all || data.roster || []).map(player => [player.id, player]));
    for (const dialog of doc.querySelectorAll('dialog[open][data-fl-player-id]')) {
      const player = all.get(dialog.dataset.flPlayerId);if (!player) continue;
      dialog.classList.add('fl-squad-profile');
      const overview = dialog.querySelector('[data-v74-profile-panel="overview"]') || dialog;
      let status = overview.querySelector('.fl-squad-profile-status');
      if (!status) { status = document.createElement('div');status.className = 'fl-squad-profile-status';const facts = overview.querySelector('.player-card-facts');if (facts) facts.after(status);else overview.append(status); }
      setHTML(status, formHTML(player) + freshHTML(player));
      const groups = overview.querySelector('.v55-skill-groups');
      if (groups) {
        let skills = overview.querySelector('.fl-squad-profile-skills');
        if (!skills) { skills = document.createElement('div');skills.className = 'fl-squad-profile-skills';groups.before(skills); }
        skills.setAttribute('role', 'list');skills.setAttribute('aria-label', t('Alle Fähigkeiten'));setHTML(skills, skillsHTML(player));
        for (const skill of skills.querySelectorAll('.fl-skill')) skill.setAttribute('role', 'listitem');
        groups.hidden = true;
        const legend = groups.nextElementSibling;if (legend?.classList.contains('v55-skill-legend')) legend.hidden = true;
      }
    }
  }
  ns.registry.register({ id: 'U01-B', enhance });
})();

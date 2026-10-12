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
      if (!filters.has(stateKey)) filters.set(stateKey, { position: 'all' });
      const state = filters.get(stateKey), players = new Map((data.roster || []).map(player => [player.id, player]));
      let tools = squad.querySelector('.fl-squad-tools');
      if (!tools) {
        tools = document.createElement('div');tools.className = 'fl-squad-tools';
        tools.innerHTML = '<label><span data-fl-squad-position-label></span><select data-fl-squad-position></select></label><p class="fl-squad-count" role="status" aria-live="polite"></p>';
        table.parentElement.before(tools);
      }
      const select = tools.querySelector('[data-fl-squad-position]');
      setText(tools.querySelector('[data-fl-squad-position-label]'), t('Position'));
      setHTML(select, [['all', 'Alle Positionen'], ['gk', 'Torwart'], ['def', 'Abwehr'], ['mid', 'Mittelfeld'], ['att', 'Angriff']].map(([value, label]) => `<option value="${value}">${C.escape(t(label))}</option>`).join(''));
      if (select.value !== state.position) select.value = state.position;
      let sortLabel = tools.querySelector('.fl-squad-sort');
      if (!sortLabel) {
        sortLabel = document.createElement('label');sortLabel.className = 'fl-squad-sort';
        sortLabel.innerHTML = '<span></span><select data-fl-squad-sort></select>';
        tools.querySelector('.fl-squad-count').before(sortLabel);
      }
      setText(sortLabel.querySelector('span'), t('Sortierung'));
      const sortSelect = sortLabel.querySelector('select');
      const sortButtons = [...table.querySelectorAll('[data-v61-roster-sort]')];
      setHTML(sortSelect, sortButtons.map(button => {
        const key = button.dataset.v61RosterSort, label = button.textContent.replace(/[▲▼↑↓]/g, '').trim();
        return ['ascending','descending'].map(direction => `<option value="${C.escape(key)}:${direction}">${C.escape(label)} · ${C.escape(t(direction === 'ascending' ? 'Aufsteigend' : 'Absteigend'))}</option>`).join('');
      }).join(''));
      const syncSort = () => {
        const current = sortButtons.find(button => button.closest('th').hasAttribute('aria-sort'));
        if (current) sortSelect.value = `${current.dataset.v61RosterSort}:${current.closest('th').getAttribute('aria-sort')}`;
      };
      syncSort();
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
        if (!form) form = nameCell.querySelector('.fl-squad-form');
        if (!form) { form = document.createElement('span');form.className = 'fl-squad-form'; }
        let header = nameCell.querySelector('.fl-squad-player-head');
        if (!header) { header = document.createElement('div');header.className = 'fl-squad-player-head';identity.before(header);header.append(identity,form); }
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
          row.hidden = !(state.position === 'all' || player.positionCode === state.position);
          if (!row.hidden) visible++;
        }
        setText(tools.querySelector('.fl-squad-count'), `${visible} / ${total} ${t('Spieler')}`);
        empty.hidden = visible !== 0;
      };
      const prior = bindings.get(tools);if (prior) prior();
      const onChange = () => { state.position = validPositions.has(select.value) ? select.value : 'all';applyFilter(); };
      const onSortChange = () => {
        const [key, direction] = sortSelect.value.split(':');
        const button = sortButtons.find(item => item.dataset.v61RosterSort === key);
        if (!button) return;
        // The native handler owns row ordering, datasets and the active direction.
        if (button.closest('th').getAttribute('aria-sort') !== direction) button.click();
        if (button.closest('th').getAttribute('aria-sort') !== direction) button.click();
        syncSort();
      };
      const onTableClick = event => { if (event.target.closest('[data-v61-roster-sort]')) queueMicrotask(syncSort); };
      select.addEventListener('change', onChange);
      sortSelect.addEventListener('change', onSortChange);table.addEventListener('click', onTableClick);
      bindings.set(tools, () => { select.removeEventListener('change', onChange);sortSelect.removeEventListener('change', onSortChange);table.removeEventListener('click', onTableClick); });
      applyFilter();
    }
    const doc = root.ownerDocument || document;
    const all = new Map((data.all || data.roster || []).map(player => [player.id, player]));
    for (const dialog of doc.querySelectorAll('dialog[open][data-fl-player-id]')) {
      const player = all.get(dialog.dataset.flPlayerId);if (!player) continue;
      dialog.classList.add('fl-squad-profile');
      const overview = dialog.querySelector('[data-v74-profile-panel="overview"]') || dialog;
      const facts = overview.querySelector('.player-card-facts');
      let status = overview.querySelector('.fl-squad-profile-status');
      if (!status) { status = document.createElement('div');status.className = 'fl-squad-profile-status';if (facts) facts.after(status);else overview.prepend(status); }
      if (facts) {
        const contractLabels = new Set(['Jahresgehalt','Beginn','Vertrag bis','Restlaufzeit','Einsatz-Zusage'].map(label => normalize(t(label))));
        const coreLabels = new Set(['Nationalität','Rückennummer','Form','Fitness'].map(label => normalize(t(label))));
        let contract = overview.querySelector('.fl-squad-profile-contract');
        let other = overview.querySelector('.fl-squad-profile-details');
        for (const fact of [...facts.children]) {
          const label = [...fact.childNodes].filter(node => node.nodeType === 3).map(node => node.textContent).join('').trim();
          if ([normalize(t('Form')),normalize(t('Fitness'))].includes(normalize(label))) {
            const value = fact.querySelector('b');
            fact.dataset.flProfileSport = normalize(label) === normalize(t('Form')) ? 'form' : 'freshness';
            if (value) value.dataset.flSportLabel = value.textContent;
            status.append(fact);
          } else if (contractLabels.has(normalize(label))) {
            if (!contract) { contract = document.createElement('section');contract.className = 'fl-squad-profile-contract';contract.innerHTML = '<h3></h3><div class="player-card-facts"></div>';overview.append(contract); }
            contract.querySelector('.player-card-facts').append(fact);
          } else if (!coreLabels.has(normalize(label))) {
            if (!other) { other = document.createElement('div');other.className = 'player-card-facts fl-squad-profile-details';overview.append(other); }
            other.append(fact);
          }
        }
        if (contract) setText(contract.querySelector('h3'), t('Vertrag'));
        facts.classList.add('fl-squad-profile-core');facts.hidden = facts.children.length === 0;
      }
      const sportFacts = [...status.querySelectorAll('[data-fl-profile-sport]')];
      if (sportFacts.length) {
        for (const fact of sportFacts) {
          const value = fact.querySelector('b');if (!value) continue;
          const component = fact.dataset.flProfileSport === 'form'
            ? C.form({...(localized(player.form) || {band:'unknown'}),label:value.dataset.flSportLabel})
            : C.freshness({...(localized(player.freshness) || {band:'unknown'}),label:value.dataset.flSportLabel});
          setHTML(value, component);
        }
      } else setHTML(status, formHTML(player) + freshHTML(player));
      const groups = overview.querySelector('.v55-skill-groups');
      if (groups) {
        let skills = overview.querySelector('.fl-squad-profile-skills');
        if (!skills) { skills = document.createElement('div');skills.className = 'fl-squad-profile-skills';groups.before(skills); }
        skills.setAttribute('role', 'list');skills.setAttribute('aria-label', t('Alle Fähigkeiten'));setHTML(skills, skillsHTML(player));
        for (const skill of skills.querySelectorAll('.fl-skill')) skill.setAttribute('role', 'listitem');
        groups.hidden = true;
        const legend = groups.nextElementSibling;if (legend?.classList.contains('v55-skill-legend')) legend.hidden = true;
        const section = groups.closest('section');
        if (section && status.nextElementSibling !== section) status.after(section);
        const other = overview.querySelector('.fl-squad-profile-details');
        const contract = overview.querySelector('.fl-squad-profile-contract');
        if (other && section) section.after(other);
        if (contract) (other || section || status).after(contract);
      }
    }
  }
  ns.registry.register({ id: 'U01-B', enhance });
})();

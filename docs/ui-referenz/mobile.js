'use strict';

(() => {
  const sheet = document.querySelector('#mobile-menu');
  const quickNav = document.querySelector('#mobile-navigation');
  quickNav.innerHTML = navigation.slice(0, 3).map(([route, image, label]) =>
    `<a href="#${route}" data-nav="${route}">${icon(image)}<span>${label}</span></a>`
  ).join('') + `<button type="button" id="open-mobile-menu" aria-haspopup="dialog" aria-controls="mobile-menu" aria-expanded="false">${icon('settings')}<span>Menü</span></button>`;
  document.querySelector('#mobile-menu-links').innerHTML = navigation.map(([route, image, label]) =>
    `<a href="#${route}" class="nav-link" data-nav="${route}">${icon(image)}<span>${label}</span></a>`
  ).join('') + `<a href="#settings" class="nav-link">${icon('settings')}Hilfe & Einstellungen</a><a href="#concept" class="nav-link">${icon('book')}Designplanung</a>`;
  const menuButton = document.querySelector('#open-mobile-menu');
  menuButton.addEventListener('click', () => {
    sheet.showModal();
    menuButton.setAttribute('aria-expanded', 'true');
  });
  document.querySelector('#close-mobile-menu').addEventListener('click', () => sheet.close());
  sheet.addEventListener('close', () => menuButton.setAttribute('aria-expanded', 'false'));
  sheet.addEventListener('click', event => {
    if (event.target.closest('a')) {
      sheet.close();
      document.querySelector('#content').focus({preventScroll: true});
    }
  });
  matchMedia('(min-width:901px)').addEventListener('change', event => {
    if (event.matches && sheet.open) sheet.close();
  });

  const mobileFact = (name, value) => `<div><dt>${name}</dt><dd>${value}</dd></div>`;
  function mobileRoster() {
    const desktop = document.querySelector('#roster-body');
    if (!desktop) return;
    const wrap = desktop.closest('.table-wrap');
    wrap.classList.add('roster-table-wrap');
    let list = document.querySelector('#mobile-roster');
    if (!list) {
      list = document.createElement('div');
      list.id = 'mobile-roster';
      list.className = 'mobile-roster';
      wrap.after(list);
    }
    const selected = filteredRoster();
    list.innerHTML = selected.length ? selected.map(player => `
      <article class="mobile-player">
        <div class="mobile-player-head"><span class="mobile-shirt" aria-label="Rückennummer ${player.n}">${player.n}</span><div>
          ${playerNameHTML(player)}
          <span class="player-meta">${player.pos} · ${player.age} Jahre</span>
        </div></div>
        <div class="mobile-player-status"><div><span class="mobile-status-label">Form</span>${statusFormHTML(player.form)}</div>${freshnessHTML(player.fresh)}</div>
        <dl class="mobile-player-stats">${mobileFact('Spiele (Einw.)',appearancesHTML(player.games,player.subs))}${mobileFact('Tore',player.goals)}${mobileFact('Vorlagen',player.assists)}${mobileFact('Ø Note',player.rating)}</dl>
        <div class="mobile-player-skills" aria-label="Alle Fähigkeiten">${skillsHTML(skillsFor(player))}</div>
      </article>`).join('') : '<div class="empty"><h3>Kein passender Spieler</h3><p>Ändere die Suche oder wähle alle Positionen.</p><button class="button" data-reset="squad">Filter zurücksetzen</button></div>';
    let sort = document.querySelector('#mobile-roster-sort');
    if (!sort) {
      const label = document.createElement('label');
      label.className = 'mobile-sort';
      label.innerHTML = `Sortierung<select id="mobile-roster-sort"><option value="n:1">Nummer aufsteigend</option><option value="n:-1">Nummer absteigend</option><option value="name:1">Name A–Z</option><option value="name:-1">Name Z–A</option><option value="age:1">Jüngste zuerst</option><option value="age:-1">Älteste zuerst</option></select>`;
      document.querySelector('#squad-position').closest('.toolbar').append(label);
      sort = label.querySelector('select');
      sort.addEventListener('change', () => {
        const [key, direction] = sort.value.split(':');
        sortKey = key;
        sortDirection = Number(direction);
        refreshRoster();
      });
    }
    sort.value = `${sortKey}:${sortDirection}`;
  }

  // Build mobile description lists from the same rendered cells. No values are dropped.
  function mobileTables() {
    document.querySelectorAll('#content .table-wrap:not(.roster-table-wrap)').forEach(wrap => {
      const table = wrap.querySelector('table');
      if (!table?.tHead || !table.tBodies.length) return;
      const headings = [...table.tHead.rows[0].cells].map(cell => cell.textContent.trim());
      const league = table.classList.contains('league-table');
      const list = document.createElement('div');
      list.className = 'mobile-data-list';
      list.setAttribute('aria-label', league ? 'Ligatabelle' : (wrap.getAttribute('aria-label') || 'Datenübersicht'));
      for (const tr of table.tBodies[0].rows) {
        const cells = [...tr.cells];
        const record = document.createElement('article');
        record.className = `mobile-data-record${league?' league-record':''}${tr.classList.contains('own')?' own':''}`;
        const title = document.createElement('div');
        title.className = 'mobile-record-title';
        if (league) {
          const rank = document.createElement('span');
          rank.className = 'rank';
          rank.textContent = cells[0].textContent + '.';
          title.append(rank);
        } else if (headings[0] === 'Saison') {
          title.append('Saison ');
        }
        const first = league ? 1 : 0;
        for (const child of cells[first].childNodes) title.append(child.cloneNode(true));
        record.append(title);
        const facts = document.createElement('dl');
        facts.className = 'mobile-record-facts';
        cells.slice(first + 1).forEach((cell, index) => {
          const label = headings[first + 1 + index];
          if (!label && !cell.textContent.trim()) return;
          const field = document.createElement('div');
          if (!label || ['Verein','Buchung'].includes(label)) field.className = 'wide';
          const dt = document.createElement('dt');
          dt.textContent = label || 'Aktion';
          const dd = document.createElement('dd');
          for (const child of cell.childNodes) dd.append(child.cloneNode(true));
          field.append(dt, dd);
          facts.append(field);
        });
        record.append(facts);
        list.append(record);
      }
      wrap.classList.add('has-mobile-list');
      wrap.after(list);
    });
  }

  function mobilePage() {
    mobileRoster();
    mobileTables();
    const active = document.querySelector('#navigation [aria-current="page"]')?.dataset.nav;
    document.querySelectorAll('.mobile-nav [data-nav],.menu-sheet [data-nav]').forEach(link => {
      if (link.dataset.nav === active) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
    menuButton.dataset.current = String(!['overview','squad','transfers'].includes(active));
    // Label active sections without making a dialog trigger pretend to be a page.
    menuButton.setAttribute('aria-label', menuButton.dataset.current === 'true'
      ? `Menü öffnen, aktueller Bereich: ${document.querySelector('#breadcrumb').textContent}` : 'Menü öffnen');
  }
  const originalRoster = refreshRoster;
  refreshRoster = function() { originalRoster(); mobileRoster(); };
  const originalRender = render;
  render = function() { if (sheet.open) sheet.close(); originalRender(); mobilePage(); };
  mobilePage();
})();

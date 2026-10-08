/* Four presentation options share exactly the same reference renderer and data. */
(() => {
  const designs = [
    ['office', '01 · Vereinsbüro', '#172d26'],
    ['night', '02 · Flutlicht', '#15191e'],
    ['journal', '03 · Vereinsjournal', '#faf7ef'],
    ['control', '04 · Kontrollraum', '#f7f9fc'],
  ];
  const selected = new URLSearchParams(location.search).get('design');
  const design = designs.find(item => item[0] === selected);
  if (!design) return; // The original reference remains accessible without a query.
  document.documentElement.dataset.design = design[0];
  document.querySelector('meta[name="theme-color"]').content = design[2];
  if (design[0] !== 'night') {
    const bar = document.createElement('div');
    bar.className = 'design-bar';
    bar.innerHTML = `<a href="varianten.html">← Vier Entwürfe</a><label for="design-select">Design <select id="design-select">${designs.map(([key, label]) => `<option value="${key}">${label}</option>`).join('')}</select></label>`;
    document.querySelector('.app').prepend(bar);
    const select = bar.querySelector('select');
    select.value = design[0];
    select.addEventListener('change', () => {
      const url = new URL(location.href);
      url.searchParams.set('design', select.value);
      url.searchParams.delete('mode');
      location.assign(url);
    });
  }
  if (design[0] === 'night') {
    // A manual override travels in the preview URL, never in career storage.
    const deviceScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const preferenceFromUrl = () => {
      const mode = new URLSearchParams(location.search).get('mode');
      return mode === 'light' || mode === 'dark' ? mode : 'system';
    };
    let preference = preferenceFromUrl();
    const applyMode = () => {
      const current = preference === 'system' ? (deviceScheme.matches ? 'dark' : 'light') : preference;
      document.documentElement.dataset.mode = current;
      document.documentElement.dataset.themePreference = preference;
      document.querySelector('meta[name="theme-color"]').content = current === 'light' ? '#ffffff' : '#15191e';
      const control = document.querySelector('#theme-preference');
      if (control) {
        control.value = preference;
        document.querySelector('#theme-preference-status').textContent = preference === 'system'
          ? `Aktuell ${current === 'light' ? 'hell' : 'dunkel'} – folgt automatisch deinem Gerät.`
          : `${current === 'light' ? 'Heller' : 'Dunkler'} Modus ist fest eingestellt.`;
      }
    };

    const addThemeSettings = () => {
      if (document.querySelector('#content').dataset.route !== 'settings') return;
      const row = document.createElement('div');
      row.className = 'settings-line theme-settings';
      row.innerHTML = `<div><h2>Darstellung</h2><p>Standardmäßig folgt das Farbschema der Einstellung deines Geräts. Hier kannst du es selbst festlegen.</p></div><div class="theme-control"><label for="theme-preference">Farbschema</label><select id="theme-preference" aria-describedby="theme-preference-status"><option value="system">Geräteeinstellung</option><option value="light">Hell</option><option value="dark">Dunkel</option></select><p id="theme-preference-status" aria-live="polite"></p></div>`;
      document.querySelector('#content > .panel').prepend(row);
      applyMode();
    };
    const previousRender = render;
    render = function() { previousRender(); addThemeSettings(); };
    applyMode();
    addThemeSettings();
    document.addEventListener('change', event => {
      if (event.target.id !== 'theme-preference') return;
      preference = event.target.value;
      const url = new URL(location.href);
      if (preference === 'system') url.searchParams.delete('mode');
      else url.searchParams.set('mode', preference);
      history.replaceState(history.state, '', url);
      applyMode();
    });
    deviceScheme.addEventListener('change', () => {
      if (preference === 'system') applyMode();
    });
    window.addEventListener('popstate', () => {
      preference = preferenceFromUrl();
      applyMode();
      // History entries can change query and fragment together, without hashchange.
      const route = location.hash.slice(1) || 'overview';
      if (route !== 'content' && document.querySelector('#content').dataset.route !== route) render();
    });
    const comparison = document.createElement('a');
    comparison.href = 'varianten.html';
    comparison.textContent = 'Entwürfe vergleichen';
    document.querySelector('footer > span:last-child').before(comparison);
  }
  const stamp = document.querySelector('footer > span');
  stamp.textContent = `Doppel 6 · Entwurf ${design[1]}`;
})();

// The same short explanations work with pointer hover, keyboard focus and a touch tap.
(() => {
  const tip = document.createElement('div');
  tip.id = 'ui-tooltip';
  tip.className = 'ui-tooltip';
  tip.setAttribute('role','tooltip');
  tip.hidden = true;
  document.body.append(tip);
  let active = null, pinned = false;
  function hide() {
    active?.removeAttribute('aria-describedby');
    active = null; pinned = false; tip.hidden = true;
  }
  function show(target, pin = false) {
    if (active !== target) hide();
    active = target; pinned = pin;
    tip.textContent = target.dataset.tooltip;
    tip.hidden = false;
    target.setAttribute('aria-describedby',tip.id);
    const bounds = target.getBoundingClientRect(), box = tip.getBoundingClientRect();
    tip.style.left = Math.max(12,Math.min(innerWidth-box.width-12,bounds.left+bounds.width/2-box.width/2))+'px';
    tip.style.top = (bounds.bottom+box.height+12 < innerHeight ? bounds.bottom+8 : Math.max(8,bounds.top-box.height-8))+'px';
  }
  document.addEventListener('pointerover',event => {
    const target = event.target.closest?.('[data-tooltip]');
    if (target && event.pointerType !== 'touch' && !pinned) show(target);
  });
  document.addEventListener('pointerout',event => {
    if (pinned || event.relatedTarget?.closest?.('[data-tooltip],#ui-tooltip')) return;
    if (event.target.closest?.('[data-tooltip],#ui-tooltip')) hide();
  });
  document.addEventListener('focusin',event => {
    const target = event.target.closest?.('[data-tooltip]');
    if (target) show(target);
    else hide();
  });
  document.addEventListener('focusout',event => { if (event.target === active && !pinned) hide(); });
  document.addEventListener('click',event => {
    const target = event.target.closest?.('[data-tooltip]');
    if (target) { if (active === target && pinned) hide(); else show(target,true); }
    else if (!event.target.closest?.('#ui-tooltip')) hide();
  });
  document.addEventListener('keydown',event => { if (event.key === 'Escape') hide(); });
  window.addEventListener('resize',hide);
  window.addEventListener('hashchange',hide);
  document.addEventListener('scroll',hide,true);
})();

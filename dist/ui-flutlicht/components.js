/* Pure markup consumes only display projections. No career or storage access. */
(() => {
  'use strict';
  const ns = window.D6Flutlicht = window.D6Flutlicht || {};
  const escape = value => String(value == null ? '' : value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const bands = new Set(['violetgray','bluegray','yellow','orange','pink']);
  const band = value => bands.has(value) ? value : 'unknown';
  const icons = {
    overview:'<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
    squad:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 2 4v3"/>',
    matchplan:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18M9 3v4h6V3M9 21v-4h6v4"/><circle cx="12" cy="12" r="3"/>',
    transfers:'<path d="M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4"/>',
    competition:'<path d="M7 3h10v7a5 5 0 0 1-10 0ZM7 5H3v3a5 5 0 0 0 5 5m9-8h4v3a5 5 0 0 1-5 5M12 15v6m-5 0h10"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18m-13 5h2m4 0h2"/>',
    statistics:'<path d="M4 21V11h4v10m4 0V3h4v18m4 0v-7h3v7"/>',
    club:'<path d="M4 4h16v8c0 5-8 9-8 9s-8-4-8-9ZM8 8h8m-4-2v11"/>',
    settings:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 4 3v2m-1 3h.01"/>'
  };
  const icon = name => `<svg class="fl-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[name] || icons.overview}</svg>`;
  const skill = ({label,colorLabel,band:level}={}) => `<span class="fl-skill fl-band-${band(level)}" aria-label="${escape(label)}: ${escape(colorLabel)}"><i aria-hidden="true"></i>${escape(label)}</span>`;
  const mouths = {violetgray:'M8 21Q16 11 24 21',bluegray:'M9 20Q16 14 23 20',yellow:'M9 19H23',orange:'M9 17Q16 24 23 17',pink:'M8 17H24Q23 25 16 25Q9 25 8 17Z',unknown:'M9 19H23'};
  const form = ({band:level,label,compact=false}={}) => `<span class="fl-form fl-band-${band(level)}${compact?' fl-form-icon':''}"${compact?` role="img" tabindex="0" aria-label="${escape(label)}" data-fl-tooltip="${escape(label)}"`:''}><svg class="fl-face" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle class="fl-face-fill" cx="16" cy="16" r="14"/><g class="fl-face-lines"><path class="fl-face-eyes" d="M10 11v2m12-2v2"/><path d="${mouths[band(level)]}"/></g></svg>${compact?'':`<span>${escape(label)}</span>`}</span>`;
  const freshness = ({percent,band:level,label}={}) => {
    const known = typeof percent === 'number' && Number.isFinite(percent);
    const value = known ? Math.max(0,Math.min(100,Math.round(percent))) : 0;
    return `<span class="fl-freshness fl-band-${band(level)}"><span>${escape(label)}${known ? ` <b>${value}%</b>` : ''}</span><span class="fl-freshness-track" aria-hidden="true"><i style="width:${value}%"></i></span></span>`;
  };
  const awardShapes = {
    league:'<circle cx="36" cy="34" r="24" class="fl-award-silver"/><circle cx="36" cy="34" r="18" class="fl-award-gold"/><path d="m36 17 4 10 11 1-9 7 3 11-9-6-9 6 3-11-9-7 11-1Z" class="fl-award-highlight"/><path d="M19 54h34v9H19z" class="fl-award-base"/>',
    cup:'<path d="M22 17H12v10q0 14 16 15M50 17h10v10q0 14-16 15" class="fl-award-handle"/><path d="M22 12h28v18q0 16-14 16T22 30Z" class="fl-award-gold"/><path d="M32 46h8v10h11v7H21v-7h11Z" class="fl-award-base"/>',
    europe:'<path d="M23 12H9v12q0 15 19 19M49 12h14v12q0 15-19 19" class="fl-award-handle"/><path d="M24 8h24v22q0 16-12 17T24 30Z" class="fl-award-silver"/><path d="M32 47h8v9h12v7H20v-7h12Z" class="fl-award-base"/><path d="m13 28-3 18 7-4 2 7 5-14M59 28l3 18-7-4-2 7-5-14" class="fl-award-ribbon"/>',
    'top-scorer':'<path d="m20 19 13 4 3 12 20 8q5 2 5 8H12v-8l7-10Z" class="fl-award-gold"/><path d="m29 30 9 2m-8 5 11 2M16 46h39" class="fl-award-detail"/><path d="M22 51v5h28v-5M18 57h36v7H18z" class="fl-award-base"/>',
    'player-of-season':'<path d="m36 6 9 18 20 3-15 14 4 20-18-10-18 10 4-20L7 27l20-3Z" class="fl-award-gold"/><path d="m36 20 4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1Z" class="fl-award-highlight"/>',
    'man-of-the-match':'<path d="M19 5h13l4 22-13 9Z M40 5h13l-4 31-13-9Z" class="fl-award-ribbon"/><circle cx="36" cy="43" r="22" class="fl-award-gold"/><circle cx="36" cy="43" r="16" class="fl-award-highlight"/><path d="m36 32 8 6-3 10H31l-3-10Z" class="fl-award-detail"/>'
  };
  const award = ({kind,label}={}) => `<svg class="fl-award" viewBox="0 0 72 72" ${label ? `role="img" aria-label="${escape(label)}"` : 'aria-hidden="true"'} focusable="false">${awardShapes[kind] || awardShapes.cup}</svg>`;
  const status = ({tone,label}={}) => `<span class="fl-status fl-status-${['success','warning','alert','neutral','achieved'].includes(tone)?tone:'neutral'}">${escape(label)}</span>`;
  const result = ({outcome,label,detail}={}) => `<button type="button" class="fl-result fl-result-${['win','draw','loss'].includes(outcome)?outcome:'unknown'}" data-fl-tooltip="${escape(detail)}" aria-label="${escape(detail || label)}"><span>${escape(label)}</span></button>`;
  let tipSequence = 0;
  function installTooltips(root) {
    const doc = root.ownerDocument || root;
    const win = doc.defaultView;
    const tip = doc.createElement('div');
    tip.id = `fl-tooltip-${++tipSequence}`;tip.className='fl-tooltip';tip.setAttribute('role','tooltip');tip.hidden=true;
    (root.nodeType===9?doc.body:root).append(tip);
    let active=null,pinned=false,priorDescription=null;
    const off=[];
    const on=(node,type,fn,options)=>{node.addEventListener(type,fn,options);off.push(()=>node.removeEventListener(type,fn,options));};
    function hide() {
      if(active){if(priorDescription===null)active.removeAttribute('aria-describedby');else active.setAttribute('aria-describedby',priorDescription);}
      active=null;pinned=false;tip.hidden=true;
    }
    function target(event) {const node=event.target.closest?.('[data-fl-tooltip]');return node && root.contains(node)?node:null;}
    function show(node,pin=false) {
      if(active!==node){hide();priorDescription=node.getAttribute('aria-describedby');}
      active=node;pinned=pin;tip.textContent=node.dataset.flTooltip;tip.hidden=false;
      const themed=node.closest('[data-fl-theme]');tip.dataset.flTheme=themed?.dataset.flTheme || 'light';
      node.setAttribute('aria-describedby',[priorDescription,tip.id].filter(Boolean).join(' '));
      const box=node.getBoundingClientRect(),rect=tip.getBoundingClientRect();
      tip.style.left=`${Math.max(8,Math.min(win.innerWidth-rect.width-8,box.left+box.width/2-rect.width/2))}px`;
      tip.style.top=`${Math.max(8,box.bottom+rect.height+12<win.innerHeight?box.bottom+8:box.top-rect.height-8)}px`;
    }
    on(root,'pointerover',e=>{const node=target(e);if(node&&e.pointerType!=='touch'&&!pinned)show(node);});
    on(root,'pointerout',e=>{if(!pinned&&active&&active!==doc.activeElement&&!active.contains(e.relatedTarget)&&!tip.contains(e.relatedTarget))hide();});
    on(root,'focusin',e=>{const node=target(e);if(node)show(node);else hide();});
    on(root,'focusout',e=>{if(e.target===active&&!pinned)hide();});
    on(doc,'click',e=>{const node=target(e);if(node){if(active===node&&pinned)hide();else show(node,true);}else if(!tip.contains(e.target))hide();});
    on(doc,'keydown',e=>{if(e.key==='Escape')hide();});
    on(doc,'scroll',()=>{
      // Keyboard focus may scroll its target into view after focusin has fired.
      if(active===doc.activeElement){const box=active.getBoundingClientRect();if(box.bottom>0&&box.top<win.innerHeight){show(active,pinned);return;}}
      hide();
    },true);on(win,'resize',hide);on(win,'hashchange',hide);
    return ()=>{hide();off.forEach(remove=>remove());tip.remove();};
  }
  ns.components = Object.freeze({escape,icon,skill,form,freshness,award,status,result,installTooltips});
})();

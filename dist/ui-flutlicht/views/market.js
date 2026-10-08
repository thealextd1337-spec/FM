/* U01-C decorates controller-owned market, contracts and youth DOM in place. */
(() => {
  'use strict';
  const ns=window.D6Flutlicht=window.D6Flutlicht||{};
  const listeners=new WeakMap();
  const select=(root,selector)=>[...(root.matches?.(selector)?[root]:[]),...root.querySelectorAll(selector)];
  function enhance(root,projection={},actions={}) {
    const c=ns.components,t=actions.t||((text)=>text);
    const players=new Map((projection.players?.all||[]).map(player=>[String(player.id),player]));
    select(root,'.v66-contracts').forEach(node=>node.classList.add('fl-market-contracts'));
    select(root,'.v67-youth').forEach(node=>node.classList.add('fl-market-youth'));
    select(root,'.v72-transfer-dialog,.v67-promote-dialog').forEach(node=>node.classList.add('fl-market-dialog'));
    for(const market of select(root,'.v66-market')){
      market.classList.add('fl-market');
      const sections=[
        [market.querySelector('.v66-filters'),'search',t('Spieler suchen')],
        [market.querySelector('.v72-open-deals'),'deals',t('Angebote & Ergebnisse')],
        [market.querySelector('.v72-own-sales'),'own',t('Eigene Verkaufsangebote')],
        [market.querySelector('.v72-sale-list'),'listed',t('Von Vereinen angeboten')]
      ].filter(([node])=>node);
      let nav=market.querySelector(':scope > .fl-market-jumps');
      if(!nav){nav=root.ownerDocument.createElement('nav');nav.className='fl-market-jumps';market.querySelector('.v62-season-head')?.after(nav);if(!nav.isConnected)market.prepend(nav);}
      nav.setAttribute('aria-label',t('Transferbereiche'));
      const markup=sections.map(([node,id,label])=>{node.dataset.flMarketTarget=id;return`<button type="button" data-fl-market-jump="${id}">${c.escape(label)}</button>`;}).join('');
      if(nav.innerHTML!==markup)nav.innerHTML=markup;
    }
    for(const card of select(root,'.v66-player-card,.v72-sale-card,.v67-youth-list article')){
      const link=card.querySelector('[data-v66-profile],[data-v67-profile]');
      const pid=link?.getAttribute('data-v66-profile')||link?.getAttribute('data-v67-profile');
      const player=players.get(String(pid));
      card.classList.add('fl-market-player');
      let detail=card.querySelector(':scope > .fl-market-player-details');
      if(!player){detail?.remove();continue;}
      const html=`<div class="fl-market-skills">${(player.skills||[]).map(c.skill).join('')}</div><div class="fl-market-player-status">${player.form?c.form(player.form):''}${player.freshness?c.freshness(player.freshness):''}</div>`;
      if(!detail){detail=root.ownerDocument.createElement('div');detail.className='fl-market-player-details';card.append(detail);}
      if(detail.innerHTML!==html)detail.innerHTML=html;
    }
    // A single owned listener survives repeated enhancement; native action events bubble untouched.
    if(!listeners.has(root)){
      const click=event=>{
        const button=event.target.closest('[data-fl-market-jump]');if(!button||!root.contains(button))return;
        const market=button.closest('.fl-market');
        const target=Array.from(market.querySelectorAll('[data-fl-market-target]')).find(node=>node.dataset.flMarketTarget===button.dataset.flMarketJump);
        if(!target)return;
        const focus=target.matches('.v66-filters')?target.querySelector('select,input'):target.querySelector('h2,h3')||target;
        if(focus&&!focus.matches('button,input,select,a,textarea'))focus.tabIndex=-1;
        target.scrollIntoView({block:'start',behavior:'auto'});focus?.focus({preventScroll:true});
      };
      root.addEventListener('click',click);listeners.set(root,click);
    }
    return ()=>{const click=listeners.get(root);if(click){root.removeEventListener('click',click);listeners.delete(root);}};
  }
  ns.registry.register({id:'market',enhance});
})();

/* U01-C decorates controller-owned market, contracts and youth DOM in place. */
(() => {
  'use strict';
  const ns=window.D6Flutlicht=window.D6Flutlicht||{};
  const listeners=new WeakMap(),contexts=new WeakMap(),memory=new Map();
  const select=(root,selector)=>[...(root.matches?.(selector)?[root]:[]),...root.querySelectorAll(selector)];
  const caption=label=>[...label.childNodes].filter(node=>node.nodeType===3||!node.matches?.('input,select')).map(node=>node.textContent).join('').trim();
  function filterSummary(filters,t){
    const detail=filters.querySelector(':scope > .fl-market-more');if(!detail)return;
    const active=[...detail.querySelectorAll('input,select')].filter(input=>input.value!==''&&input.value!=='all').map(input=>`${caption(input.closest('label'))}: ${input.tagName==='SELECT'?input.selectedOptions[0]?.textContent||input.value:input.value}`);
    detail.querySelector('summary').textContent=t('Weitere Filter');
    const status=filters.querySelector(':scope > .fl-market-filter-status');
    status.textContent=active.length?`${t('Aktive Filter')}: ${active.join(' · ')}`:t('Keine weiteren Filter aktiv');
  }
  function filtersEnhance(filters,key,t){
    let detail=filters.querySelector(':scope > .fl-market-more');
    if(!detail){detail=filters.ownerDocument.createElement('details');detail.className='fl-market-more';detail.append(filters.ownerDocument.createElement('summary'));const body=filters.ownerDocument.createElement('div');body.className='fl-market-more-fields';detail.append(body);filters.append(detail);detail.open=memory.get(key)||false;}
    detail.dataset.flMarketMemory=key;
    const labels=[...filters.querySelectorAll('label')],primary=filters.matches('.v66-filters')?['v66-line','v66-fee']:['v72-line','v72-max-price'];
    for(const id of primary){const label=labels.find(node=>node.querySelector(`#${id}`));if(label&&label.parentElement!==filters)filters.insertBefore(label,detail);}
    const body=detail.querySelector('.fl-market-more-fields');
    for(const label of labels)if(!primary.includes(label.querySelector('input,select')?.id)&&label.parentElement!==body)body.append(label);
    let status=filters.querySelector(':scope > .fl-market-filter-status');if(!status){status=filters.ownerDocument.createElement('p');status.className='fl-market-filter-status';status.setAttribute('role','status');filters.append(status);}
    filterSummary(filters,t);
  }
  function contractsEnhance(node,players,key,t){
    node.classList.add('fl-market-contracts');
    const rows=[...node.querySelectorAll('.v66-contract-table tbody tr')];
    let toolbar=node.querySelector(':scope > .fl-market-contract-filter');
    if(!toolbar){toolbar=node.ownerDocument.createElement('div');toolbar.className='fl-market-contract-filter';toolbar.setAttribute('role','group');for(const value of ['all','attention']){const button=node.ownerDocument.createElement('button');button.type='button';button.dataset.flContractFilter=value;toolbar.append(button);}node.querySelector('h3')?.after(toolbar);if(!toolbar.isConnected)node.prepend(toolbar);}
    toolbar.setAttribute('aria-label',t('Vertragsübersicht'));node.dataset.flMarketMemory=key;
    let count=0;
    for(const row of rows){
      const id=row.querySelector('[data-v61-player]')?.dataset.v61Player,contract=players.get(String(id))?.contract;
      const remaining=contract?.remaining??(row.cells.length>=7?Number.parseInt(row.cells[4]?.textContent,10):null);
      const attention=(remaining!==null&&Number.isFinite(remaining)&&remaining<=1)||contract?.retirementStatus==='confirmed'||Boolean(row.querySelector('[data-v66-renew-open]'));
      row.dataset.flContractAttention=String(attention);if(attention)count++;
      let retirement=row.querySelector('.fl-market-retirement');
      if(contract?.retirementLabel){if(!retirement){retirement=node.ownerDocument.createElement('span');retirement.className='fl-market-retirement';row.cells[0].append(retirement);}retirement.textContent=contract.retirementLabel;}else retirement?.remove();
    }
    const all=toolbar.querySelector('[data-fl-contract-filter=all]'),attention=toolbar.querySelector('[data-fl-contract-filter=attention]');all.textContent=`${t('Alle Verträge')} (${rows.length})`;attention.textContent=`${t('Handlungsbedarf')} (${count})`;
    let empty=node.querySelector(':scope > .fl-market-contract-empty');if(!empty){empty=node.ownerDocument.createElement('p');empty.className='fl-market-contract-empty';empty.setAttribute('role','status');toolbar.after(empty);}empty.textContent=t('Keine Verträge mit Handlungsbedarf.');
    contractFilter(node,memory.get(key)||'all');
  }
  function contractFilter(node,value){
    const rows=[...node.querySelectorAll('.v66-contract-table tbody tr')];for(const row of rows)row.hidden=value==='attention'&&row.dataset.flContractAttention!=='true';
    for(const button of node.querySelectorAll('[data-fl-contract-filter]'))button.setAttribute('aria-pressed',String(button.dataset.flContractFilter===value));
    const empty=node.querySelector('.fl-market-contract-empty');if(empty)empty.hidden=value!=='attention'||rows.some(row=>!row.hidden);
  }
  function enhance(root,projection={},actions={}) {
    const c=ns.components,t=actions.t||((text)=>text);
    const players=new Map((projection.players?.all||[]).map(player=>[String(player.id),player]));
    contexts.set(root,{t});const club=projection.players?.ownClubId||'';
    select(root,'.v66-contracts').forEach(node=>contractsEnhance(node,players,`${club}:contracts`,t));
    select(root,'.v67-youth').forEach(node=>node.classList.add('fl-market-youth'));
    select(root,'.v72-transfer-dialog,.v67-promote-dialog').forEach(node=>node.classList.add('fl-market-dialog'));
    for(const market of select(root,'.v66-market')){
      market.classList.add('fl-market');
      const meta=market.querySelector('.v62-season-head p:not(.eyebrow)');
      if(meta&&!meta.classList.contains('fl-market-meta')){const parts=meta.textContent.split(' · ');meta.textContent='';meta.classList.add('fl-market-meta');for(const part of parts){const span=root.ownerDocument.createElement('span');span.textContent=part;meta.append(span);}}
      for(const filters of market.querySelectorAll('.v66-filters,.v72-filters'))filtersEnhance(filters,`${club}:${filters.classList.contains('v66-filters')?'search':'listed'}`,t);
      const search=market.querySelector('.v66-filters');
      if(search){
        let help=search.parentElement.querySelector(':scope > .fl-market-help');
        const notes=[...search.parentElement.querySelectorAll(':scope > p.v66-note')];
        if(notes.length&&!help){help=root.ownerDocument.createElement('details');help.className='fl-market-help';help.append(root.ownerDocument.createElement('summary'));search.after(help);}
        if(help){help.querySelector('summary').textContent=t('Transferregeln');for(const note of notes)help.append(note);}
      }

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
        const filter=event.target.closest('[data-fl-contract-filter]');if(filter&&root.contains(filter)){const contracts=filter.closest('.fl-market-contracts');memory.set(contracts.dataset.flMarketMemory,filter.dataset.flContractFilter);contractFilter(contracts,filter.dataset.flContractFilter);return;}

      };
      const change=event=>{const filters=event.target.closest('.v66-filters,.v72-filters');if(filters&&root.contains(filters))filterSummary(filters,contexts.get(root).t);};
      const toggle=event=>{if(event.target.matches?.('.fl-market-more'))memory.set(event.target.dataset.flMarketMemory,event.target.open);};
      root.addEventListener('click',click);root.addEventListener('change',change);root.addEventListener('input',change);root.addEventListener('toggle',toggle,true);listeners.set(root,{click,change,toggle});
    }
    return ()=>{const handlers=listeners.get(root);if(handlers){root.removeEventListener('click',handlers.click);root.removeEventListener('change',handlers.change);root.removeEventListener('input',handlers.change);root.removeEventListener('toggle',handlers.toggle,true);listeners.delete(root);contexts.delete(root);}};
  }
  ns.registry.register({id:'market',enhance});
})();

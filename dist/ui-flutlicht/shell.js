/* Shell owns presentation and listeners; the adapter owns content and actions. */
(() => {
  'use strict';
  const ns=window.D6Flutlicht=window.D6Flutlicht||{};
  let sequence=0;
  function mount(root,initial,actions={}) {
    if(root.children.length)throw new Error('Flutlicht shell requires an empty host');
    const c=ns.components,doc=root.ownerDocument,win=doc.defaultView,id=`fl-content-${++sequence}`;
    root.classList.add('fl-shell');
    root.innerHTML=`<a class="fl-skip" href="#${id}"></a><aside class="fl-sidebar"></aside><div class="fl-workspace"><div class="fl-topbar"></div><div class="fl-content" id="${id}" tabindex="-1"></div></div><nav class="fl-mobile-nav"></nav><dialog class="fl-menu-panel" hidden><div class="fl-menu-head"></div><nav class="fl-menu-links"></nav></dialog>`;
    const content=root.querySelector('.fl-content'),sidebar=root.querySelector('.fl-sidebar'),topbar=root.querySelector('.fl-topbar'),mobile=root.querySelector('.fl-mobile-nav'),menu=root.querySelector('.fl-menu-panel'),skip=root.querySelector('.fl-skip');
    const media=win.matchMedia('(prefers-color-scheme: dark)');
    let projection={},controlSignature='',menuTrigger=null,disposed=false,leadPending=false,leadProcessing='',leadError='',paintFrame=0,paintResolve=null;
    const cleanups=[];
    const on=(node,event,handler,options)=>{node.addEventListener(event,handler,options);cleanups.push(()=>node.removeEventListener(event,handler,options));};
    const navButton=item=>`<button type="button" class="fl-nav-link" data-fl-route="${c.escape(item.id)}" ${item.id===projection.activeRoute||item.active?'aria-current="page"':''} ${item.disabled?'disabled':''}>${c.icon(item.icon||item.id)}<span>${c.escape(item.label)}</span></button>`;
    const identity=()=>`<div class="fl-club-identity">${projection.clubCrestHTML?`<span class="fl-crest">${projection.clubCrestHTML}</span>`:''}<div><strong>${c.escape(projection.clubName)}</strong><small>${c.escape(projection.clubMeta)}</small><span class="fl-titles">${(projection.titles||[]).map(item=>`<button type="button" class="fl-title-help" data-fl-tooltip="${c.escape(item.label)}" aria-label="${c.escape(item.label)}">${c.award({kind:item.kind})}</button>`).join('')}</span></div></div>`;
    const brand=()=>`<div class="fl-brand"><b aria-hidden="true">66</b><span>${c.escape(projection.labels?.brand||'Doppel 6')}</span></div>`;
    function applyTheme() {
      const preference=['light','dark'].includes(projection.themePreference)?projection.themePreference:'system';
      root.dataset.flThemePreference=preference;
      root.dataset.flTheme=preference==='system'?(media.matches?'dark':'light'):preference;
      root.dispatchEvent(new win.CustomEvent('fl-theme-applied',{bubbles:true,detail:{theme:root.dataset.flTheme,preference}}));
    }
    function closeMenu(returnFocus=true) {
      if(menu.open)menu.close();menu.hidden=true;
      mobile.querySelector('[data-fl-menu]')?.setAttribute('aria-expanded','false');
      if(returnFocus&&menuTrigger?.isConnected)menuTrigger.focus();
    }
    function openMenu(trigger) {
      menuTrigger=trigger;menu.hidden=false;menu.showModal();trigger.setAttribute('aria-expanded','true');
    }
    function paintLead() {
      return new Promise(resolve=>{
        paintResolve=resolve;
        // Let the busy state reach the screen before the controller starts its work.
        paintFrame=win.requestAnimationFrame(()=>{paintFrame=win.requestAnimationFrame(()=>{paintFrame=0;paintResolve=null;resolve(!disposed);});});
      });
    }
    async function runLead(button) {
      if(disposed||button.disabled||leadPending||projection.leadAction?.busy||typeof actions.lead!=='function')return;
      const returnFocus=doc.activeElement===button;
      leadPending=true;leadProcessing=projection.leadAction?.processingLabel||'';leadError='';update(projection);
      try{if(await paintLead())await actions.lead();}
      catch(problem){if(!disposed)leadError=problem?.message||projection.labels?.actionFailed||'Die Aktion konnte nicht abgeschlossen werden. Bitte versuche es erneut.';}
      finally{
        if(!disposed){leadPending=false;leadProcessing='';update(projection);if(returnFocus&&doc.activeElement===doc.body)root.querySelector('[data-fl-lead]:not(:disabled)')?.focus();}
      }
    }
    function update(next) {
      if(disposed)return;
      const oldRoute=projection.activeRoute;
      projection=next||{};
      const labels=projection.labels||{},nav=projection.navigation||[];
      applyTheme();root.lang=projection.language||doc.documentElement.lang||'de';
      // Theme updates retain the exact existing inputs, focus, menu and filter DOM.
      const signature=JSON.stringify([projection.clubName,projection.clubMeta,projection.clubCrestHTML,projection.managerLabel,projection.titles,nav,projection.activeRoute,projection.leadAction,labels,leadPending,leadProcessing,leadError]);
      if(signature!==controlSignature){
        const focused=root.contains(doc.activeElement)?doc.activeElement:null;
        const focusedRoute=focused?.dataset.flRoute,focusLead=focused?.hasAttribute('data-fl-lead');
        controlSignature=signature;
        const navHTML=nav.map(navButton).join('');
        sidebar.innerHTML=`${brand()}${identity()}<nav class="fl-main-nav" aria-label="${c.escape(labels.navigation)}">${navHTML}</nav>${projection.managerLabel?`<div class="fl-manager">${c.escape(projection.managerLabel)}</div>`:''}`;
        const lead=projection.leadAction,leadBusy=!!(leadPending||lead?.busy),processing=lead?.processingLabel||(leadPending?leadProcessing:'')||'';
        const described=[lead?.progressLabel?`${id}-progress`:null,lead?.reason?`${id}-reason`:null,leadBusy&&processing?`${id}-status`:null].filter(Boolean).join(' ');
        topbar.innerHTML=`<div class="fl-mobile-head">${brand()}${identity()}</div><div class="fl-page-context"><span>${c.escape(nav.find(item=>item.id===projection.activeRoute)?.label||'')}</span>${lead?`<div class="fl-lead-wrap"><button type="button" class="fl-button fl-primary" data-fl-lead aria-busy="${leadBusy}" ${lead.disabled||leadBusy?'disabled':''} ${described?`aria-describedby="${described}"`:''}><span class="fl-lead-label">${c.escape(leadBusy?(processing||lead.label):lead.label)}</span>${leadBusy?'<span class="fl-lead-spinner" aria-hidden="true"></span>':c.icon('arrow')}</button>${lead.progressLabel?`<small class="fl-lead-progress" id="${id}-progress">${c.escape(lead.progressLabel)}</small>`:''}${lead.reason?`<small id="${id}-reason">${c.escape(lead.reason)}</small>`:''}<small class="fl-lead-status" id="${id}-status" role="status" aria-live="polite" ${leadBusy&&processing?'':'hidden'}>${c.escape(leadBusy?processing:'')}</small>${leadError?`<small class="fl-lead-error" role="alert">${c.escape(leadError)}</small>`:''}</div>`:''}</div>`;
        mobile.setAttribute('aria-label',labels.navigation||'');
        mobile.innerHTML=`${['overview','squad','transfers'].map(id=>nav.find(item=>item.id===id)).filter(Boolean).map(navButton).join('')}<button type="button" class="fl-nav-link" data-fl-menu aria-expanded="${menu.open}" aria-haspopup="dialog">${c.icon('menu')}<span>${c.escape(labels.menu)}</span></button>`;
        menu.querySelector('.fl-menu-head').innerHTML=`<h2 id="${id}-menu-title">${c.escape(labels.menu)}</h2><button type="button" class="fl-button" data-fl-close aria-label="${c.escape(labels.close)}">${c.icon('close')}</button>`;
        menu.setAttribute('aria-labelledby',`${id}-menu-title`);menu.querySelector('nav').setAttribute('aria-label',labels.navigation||'');menu.querySelector('nav').innerHTML=navHTML;
        skip.textContent=labels.skip||'';
        if(focusedRoute){const replacement=Array.from(root.querySelectorAll('[data-fl-route]')).find(node=>node.dataset.flRoute===focusedRoute&&node.getClientRects().length);replacement?.focus();}
        else if(focusLead)root.querySelector('[data-fl-lead]')?.focus();
      }
      if(oldRoute&&oldRoute!==projection.activeRoute){closeMenu(false);content.focus({preventScroll:true});}
    }
    on(root,'click',event=>{
      const route=event.target.closest('[data-fl-route]');
      if(route&&!route.disabled){closeMenu(false);actions.navigate?.(route.dataset.flRoute);return;}
      const leadButton=event.target.closest('[data-fl-lead]');if(leadButton){runLead(leadButton);return;}
      const trigger=event.target.closest('[data-fl-menu]');if(trigger){openMenu(trigger);return;}
      if(event.target.closest('[data-fl-close]'))closeMenu();
      if(event.target===skip){event.preventDefault();content.focus();content.scrollIntoView({block:'start'});}
      if(event.target===menu){const box=menu.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closeMenu();}
    });
    on(menu,'cancel',event=>{event.preventDefault();closeMenu();});
    on(menu,'close',()=>{menu.hidden=true;mobile.querySelector('[data-fl-menu]')?.setAttribute('aria-expanded','false');});
    on(root,'change',event=>{if(event.target.matches('[data-fl-theme-preference-control]'))actions.themeChanged?.(event.target.value);});
    on(media,'change',()=>{if(!['light','dark'].includes(projection.themePreference))applyTheme();});
    on(win,'resize',()=>{if(win.innerWidth>900&&menu.open)closeMenu(false);});
    cleanups.push(c.installTooltips(root));update(initial);
    return {content,update,unmount(){if(disposed)return;disposed=true;if(paintFrame)win.cancelAnimationFrame(paintFrame);paintFrame=0;paintResolve?.(false);paintResolve=null;closeMenu(false);cleanups.forEach(fn=>fn());root.replaceChildren();root.classList.remove('fl-shell');delete root.dataset.flTheme;delete root.dataset.flThemePreference;}};
  }
  ns.shell=Object.freeze({mount});
})();

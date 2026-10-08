/* U01-D reads display projections and preserves controller-owned competition DOM. */
(() => {
  'use strict';
  const ns = window.D6Flutlicht, c = ns.components, states = new WeakMap();
  const text = value => c.escape(value == null ? '' : value);
  function fact(value, t) { return text(value == null ? t('Nicht erfasst') : value); }
  function reportHTML(report, t) {
    const player = item => item?.id ? `<button type="button" class="fl-competition-player" data-fl-report-player="${text(item.id)}">${text(item.name)}</button>` : text(item?.name || t('Nicht erfasst'));
    const missing = () => `<p class="fl-competition-missing">${text(t('Nicht erfasst'))}</p>`;
    const list = (items, render, empty) => items == null ? missing() : items.length ? `<ul class="fl-competition-report-list">${items.map(item => `<li>${render(item)}</li>`).join('')}</ul>` : `<p>${text(t(empty))}</p>`;
    const section = (label, body) => `<section><h3>${text(t(label))}</h3>${body}</section>`;
    const scoreTeam = item => `<strong class="fl-report-score-team">${item?.crestHTML||''}<span>${text(item?.name)}${Number.isInteger(item?.currentRank)&&item.currentRank>0?` <small class="fl-report-current-rank" aria-label="${text(t('Aktueller Tabellenplatz'))} ${item.currentRank}">(${item.currentRank}.)</small>`:''}</span></strong>`;
    return `<header class="fl-competition-report-head"><div><h2 id="fl-competition-report-title">${text(report.title || t('Spielbericht'))}</h2><p>${text(report.contextLabel)}</p></div><button type="button" class="fl-button" data-fl-report-close aria-label="${text(t('Spielbericht schließen'))}">${c.icon('close')}</button></header>
      <div class="fl-competition-report-score">${scoreTeam(report.home)}<b>${text(report.scoreLabel)}${report.penaltiesLabel ? `<small>${text(report.penaltiesLabel)}</small>` : ''}</b>${scoreTeam(report.away)}</div>
      ${[report.home,report.away].some(item=>Number.isInteger(item?.currentRank)&&item.currentRank>0)?`<p class="fl-report-rank-note">${text(t('Tabellenplätze entsprechen dem aktuellen Stand.'))}</p>`:''}
      ${section('Teamstatistik',report.teamStats == null ? missing() : `<div class="fl-competition-report-teamstats">${report.teamStats.map(row => `<div><span>${text(row.label)}</span><b>${fact(row.home,t)}</b><b>${fact(row.away,t)}</b></div>`).join('')}</div>`)}
      ${section('Spielereignisse',list(report.events,event => `<b>${text(event.minuteLabel)}</b> ${text(event.text)}`,'Keine Ereignisse'))}
      ${section('Aufstellungen',report.lineups == null ? missing() : `<div class="fl-competition-report-sides">${['home','away'].map(side => `<div><h4>${text(report[side]?.name)}</h4>${list(report.lineups[side],player,'Keine Aufstellung erfasst')}</div>`).join('')}</div>`)}
      ${section('Spielerwechsel',list(report.substitutions,item => `<b>${text(item.minuteLabel)}</b> <span>${text(item.teamLabel)}</span><span>${player(item.out)} → ${player(item.in)}</span>`,'Keine Wechsel'))}
      ${section('Spielerstatistik',report.players == null ? missing() : report.players.length ? `<div class="fl-competition-report-players">${report.players.map(item => `<article><h4>${player(item)}</h4><p>${text(item.teamLabel)}</p><dl>${(item.stats || []).map(stat => `<div><dt>${text(stat.label)}</dt><dd>${fact(stat.value,t)}</dd></div>`).join('')}</dl></article>`).join('')}</div>` : `<p>${text(t('Keine Spielerwerte erfasst'))}</p>`)}
      ${section('Auszeichnungen',list(report.awards,item => `${c.award({kind:item.kind,label:item.label})}${item.playerId ? `<button type="button" class="fl-competition-player" data-fl-report-player="${text(item.playerId)}">${text(item.label)}</button>` : `<span>${text(item.label)}</span>`}`,'Keine Auszeichnungen'))}
      <button type="button" class="fl-button" data-fl-report-close>${text(t('Zurück'))}</button>`;
  }
  function enhance(root, projection, actions = {}) {
    if (!root.classList.contains('fl-content')) return;
    const data = projection.competitions || {}, t = value => actions.t ? actions.t(value) : value;
    root.querySelectorAll('[data-v46-view="competition"],[data-v46-view="calendar"],[data-v46-view="statistics"]').forEach(view => view.classList.add('fl-competitions'));
    root.querySelectorAll('.v62-competitions,.v62-own-competitions').forEach(node => node.classList.add('fl-competition-groups'));
    root.querySelectorAll('[data-v46-view="competition"] .v62-table[data-fl-competition-id]').forEach(table => {
      const rows = (data.tables || []).find(item => item.id === table.dataset.flCompetitionId)?.rows;
      if (!rows) return;
      table.classList.add('fl-competition-table');
      const columns = [['wins','S'],['draws','U'],['losses','N'],['goals','Tore']];
      const header = table.tHead?.rows[0];
      if (!header) return;
      const anchor = [...header.cells].find((cell,index) => index >= 3 && !cell.dataset.flCompetitionColumn);
      for (const [key,label] of columns) {
        let cell = header.querySelector(`[data-fl-competition-column="${key}"]`);
        if (!cell) { cell = table.ownerDocument.createElement('th');cell.scope='col';cell.dataset.flCompetitionColumn=key;header.insertBefore(cell,anchor || null); }
        cell.textContent=t(label);
      }
      [...table.tBodies].flatMap(body => [...body.rows]).forEach(row => {
        const clubId=row.querySelector('[data-v68-club]')?.dataset.v68Club, values=rows.find(item=>item.clubId===clubId);
        const reference=[...row.cells].find((cell,index)=>index>=3&&!cell.dataset.flCompetitionColumn);
        for(const [key] of columns){
          let cell=row.querySelector(`[data-fl-competition-column="${key}"]`);
          if(!cell){cell=table.ownerDocument.createElement('td');cell.dataset.flCompetitionColumn=key;row.insertBefore(cell,reference || null);}
          const value=key==='goals'?(values?.goalsFor!=null&&values?.goalsAgainst!=null?`${values.goalsFor}:${values.goalsAgainst}`:null):values?.[key];
          cell.textContent=value==null?'–':String(value);if(value==null)cell.setAttribute('aria-label',t('Nicht erfasst'));else cell.removeAttribute('aria-label');
        }
      });
    });
    root.querySelectorAll('[data-fl-fixture-id]').forEach(node => {
      if (node.querySelector('[data-fl-report-open]')) return;
      const button=node.ownerDocument.createElement('button');button.type='button';button.className='fl-competition-report-open';button.dataset.flReportOpen=node.dataset.flFixtureId;button.textContent=t('Spielbericht');
      (node.querySelector('.v62-calendar-result') || node).append(button);
    });
    let state=states.get(root);
    if(!state){
      state={actions,opener:null,dialog:null,fingerprint:null,closing:false};states.set(root,state);
      state.click=event=>{const button=event.target.closest('[data-fl-report-open]');if(!button)return;state.opener=button;state.actions.openReport?.(button.dataset.flReportOpen);};root.addEventListener('click',state.click);
      state.cleanup=()=>{root.removeEventListener('click',state.click);state.closing=true;state.dialog?.remove();states.delete(root);};
    }
    state.actions=actions;
    if(data.report){
      if(!state.dialog){
        const dialog=root.ownerDocument.createElement('dialog');dialog.className='fl-dialog fl-competition-report';dialog.setAttribute('aria-labelledby','fl-competition-report-title');state.dialog=dialog;
        dialog.addEventListener('click',event=>{const close=event.target.closest('[data-fl-report-close]'),player=event.target.closest('[data-fl-report-player]');if(close)state.actions.closeReport?.();else if(player)state.actions.openPlayer?.(player.dataset.flReportPlayer,player);});
        dialog.addEventListener('cancel',event=>{event.preventDefault();state.actions.closeReport?.();});
        dialog.addEventListener('close',()=>{if(state.ignoreClose){state.ignoreClose=false;return;}if(!state.closing)state.actions.closeReport?.();});root.ownerDocument.body.append(dialog);
      }
      const fingerprint=JSON.stringify(data.report)+t('Nicht erfasst');
      if(state.fingerprint!==fingerprint){state.dialog.innerHTML=reportHTML(data.report,t);state.fingerprint=fingerprint;}
      state.dialog.dataset.flTheme=root.closest('[data-fl-theme]')?.dataset.flTheme || 'light';
      if(!state.dialog.open)state.dialog.showModal();
    }else if(state.dialog?.open){
      state.ignoreClose=true;state.dialog.close();state.opener?.isConnected&&state.opener.focus({preventScroll:true});state.fingerprint=null;
    }
    return state.cleanup;
  }
  ns.registry.register({id:'U01-D',enhance});
})();

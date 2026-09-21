'use strict';

const v32DashboardStyle=document.createElement('style');
v32DashboardStyle.textContent=`
.free-agent-dropdown,.free-agent-market-dropdown{margin-top:18px;border:1px solid #3b5053;border-radius:10px;background:#102126;overflow:hidden}.free-agent-dropdown>summary,.free-agent-market-dropdown>summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 17px;cursor:pointer;color:#eef5f1;font-weight:800;list-style:none}.free-agent-dropdown>summary::-webkit-details-marker,.free-agent-market-dropdown>summary::-webkit-details-marker{display:none}.free-agent-dropdown>summary::after,.free-agent-market-dropdown>summary::after{content:'+';display:grid;place-items:center;width:27px;height:27px;border:1px solid #52676a;border-radius:50%;color:var(--club-primary);font-size:19px}.free-agent-dropdown[open]>summary::after,.free-agent-market-dropdown[open]>summary::after{content:'−'}.free-agent-dropdown>summary span,.free-agent-market-dropdown>summary span{color:#91a5a2;font-size:9px;font-weight:600;text-transform:uppercase}.free-agent-dropdown>.market-grid{margin:0 14px 14px}.free-agent-market-dropdown>.qol-market{margin:0;border:0;border-top:1px solid #34494c;border-radius:0}.center-grid.v32-next-match{margin-top:0;margin-bottom:16px}
`;
document.head.append(v32DashboardStyle);

function v32PlaceNextMatch(){
 const finance=clubCenter.querySelector('.finance-panel'),grid=clubCenter.querySelector('.center-grid');if(!finance||!grid||!grid.querySelector('.center-lead'))return false;grid.classList.add('v32-next-match');finance.insertAdjacentElement('beforebegin',grid);return true
}
function v32CollapseFreeAgents(){
 const panel=clubCenter.querySelector('.qol-market');if(!panel||panel.closest?.('.free-agent-market-dropdown')||panel.querySelector('.free-agent-dropdown'))return false;const heading=[...panel.querySelectorAll('h3')].find(item=>item.textContent.trim()==='Ablösefreie Spieler'),grid=heading?.nextElementSibling;if(!heading||!grid?.classList.contains('market-grid'))return false;const details=document.createElement('details'),summary=document.createElement('summary'),count=grid.querySelectorAll('.market-card').length;summary.innerHTML=`<b>Transfermarkt · Ablösefreie Spieler</b><span>${count?`${count} Spieler anzeigen`:'Keine Spieler verfügbar'}</span>`;
 if(!transferState().open){details.className='free-agent-market-dropdown';panel.insertAdjacentElement('beforebegin',details);details.append(summary,panel);return true}
 details.className='free-agent-dropdown';heading.insertAdjacentElement('beforebegin',details);heading.remove();details.append(summary,grid);return true
}
function v32ArrangeDashboard(){if(!activeSave||activeSave.finance?.gameOver)return;v32PlaceNextMatch();v32CollapseFreeAgents()}

const v31RenderCenterV32=renderCenter;
renderCenter=function(){const result=v31RenderCenterV32();v32ArrangeDashboard();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='SECHSER / PROTOTYP 32');return result};

drawSlots();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='SECHSER / PROTOTYP 32');

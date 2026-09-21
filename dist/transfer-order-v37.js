'use strict';

function v37PlaceSalesAfterFreeAgents(){
 if(!activeSave||!transferState().open)return;
 const market=clubCenter.querySelector('.qol-market'),sales=market?.querySelector('.v35-sales');
 if(!sales)return;
 const free=market.querySelector('.free-agent-dropdown');
 if(free){free.insertAdjacentElement('afterend',sales);return}
 const heading=[...market.querySelectorAll(':scope > h3')].find(item=>item.textContent.trim()==='Ablösefreie Spieler');
 const grid=heading?.nextElementSibling;
 if(grid?.classList.contains('market-grid'))grid.insertAdjacentElement('afterend',sales)
}

const v36RenderCenterV37=renderCenter;
renderCenter=function(){
 const result=v36RenderCenterV37();v37PlaceSalesAfterFreeAgents();
 document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='Doppel 6 / PROTOTYP 39');return result
};
startScreen.querySelector('footer').textContent='Doppel 6 / PROTOTYP 39';

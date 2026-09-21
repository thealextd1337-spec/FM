'use strict';

function v27PlaceSquadCheck(){
 const finance=clubCenter.querySelector('.finance-panel'),check=clubCenter.querySelector('.squad-warnings');if(!finance||!check)return;finance.insertAdjacentElement('afterend',check)
}

const v26RenderCenterV27=renderCenter;
renderCenter=function(){const result=v26RenderCenterV27();v27PlaceSquadCheck();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='Doppel 6 / PROTOTYP 39');return result};

drawSlots();document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='Doppel 6 / PROTOTYP 39');

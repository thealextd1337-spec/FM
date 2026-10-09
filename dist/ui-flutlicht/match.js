/* Match and tactical surfaces share the management theme and native controls. */
(()=>{
 'use strict';
 const ns=window.D6Flutlicht=window.D6Flutlicht||{},screen=document.querySelector('#game-screen'),world=document.querySelector('#v61-world-screen'),header=document.querySelector('body>header'),media=matchMedia('(prefers-color-scheme: dark)');
 if(!screen||ns.match)return;
 function theme(){return ns.theme.resolve();}
 function refresh(){
  const playing=Boolean(v65WorldActive&&!screen.hidden),prematch=Boolean(world&&!world.hidden&&world.querySelector(':scope > .v64-match-page')&&v61CurrentCareer?.world.activeMatch?.state.phase==='prematch'),active=playing||prematch,value=theme();
  document.body.classList.toggle('fl-match-active',active);
  for(const node of [document.body,header]){node.classList.toggle('fl-match',active);if(active)node.dataset.flTheme=value;else if(node===document.body)delete node.dataset.flTheme;}
  screen.classList.toggle('fl-match',playing);if(playing)screen.dataset.flTheme=value;
  if(world){const wasPrematch=world.classList.contains('fl-prematch');world.classList.toggle('fl-match',prematch);world.classList.toggle('fl-prematch',prematch);if(prematch)world.dataset.flTheme=value;else if(wasPrematch&&!world.classList.contains('fl-shell'))delete world.dataset.flTheme;}
  // Post-match dialogs remain native, including when a fullscreen match ends.
  for(const dialog of document.querySelectorAll('#v47-match-report[open],#v47-competition[open],.v47-player-dialog[open]')){dialog.classList.add('fl-dialog');dialog.dataset.flTheme=value;}
  if(!active)return;
  const tabs=document.querySelector('#v65-pause-tabs'),panel=document.querySelector('#v65-controls');
  if(tabs&&!tabs.hidden){
   tabs.setAttribute('role','tablist');
   for(const button of tabs.querySelectorAll('[data-v65-tab]')){button.id='fl-match-tab-'+button.dataset.v65Tab;button.setAttribute('role','tab');button.setAttribute('aria-selected',String(button.classList.contains('active')));button.setAttribute('aria-controls','v65-controls');button.tabIndex=button.classList.contains('active')?0:-1;}
   if(panel){panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','fl-match-tab-'+v65PauseTab);}
  }else if(panel){panel.removeAttribute('role');panel.removeAttribute('aria-labelledby');}
 }
 const baseControls=v65UpdateControls;v65UpdateControls=function(...args){const result=baseControls.apply(this,args);refresh();return result;};
 document.addEventListener('keydown',event=>{
  const button=event.target.closest?.('#v65-pause-tabs [data-v65-tab]');if(!button||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  const buttons=[...button.parentElement.querySelectorAll('[data-v65-tab]')],index=buttons.indexOf(button),next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
  event.preventDefault();const tab=buttons[next].dataset.v65Tab;buttons[next].click();document.querySelector(`#v65-pause-tabs [data-v65-tab="${tab}"]`)?.focus();
 });
 const observer=new MutationObserver(refresh);observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','open']});
 media.addEventListener('change',refresh);document.addEventListener('fl-theme-applied',refresh);window.addEventListener('storage',refresh);
 ns.match={refresh};refresh();
})();

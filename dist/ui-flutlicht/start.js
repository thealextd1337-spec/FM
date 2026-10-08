/* Presentation for the existing local start flow; native nodes and actions stay in place. */
(() => {
 'use strict';
 const ns=window.D6Flutlicht=window.D6Flutlicht||{};
 if(ns.start)return;
 const doc=document,win=window,home=doc.querySelector('#start-screen'),world=doc.querySelector('#v61-world-screen'),header=doc.querySelector('body > header'),legal=doc.querySelector('body > .legal-nav');
 if(!home||!world||!ns.components)return;
 const media=win.matchMedia('(prefers-color-scheme: dark)'),surfaces=new Map(),dialogs=new Map();
 let disposed=false;
 function preference(){try{const value=localStorage.getItem('doppel6.ui.flutlicht.theme');return ['light','dark'].includes(value)?value:'system';}catch{return 'system';}}
 function surface(node,name,visible,theme){
  if(!node)return;
  if(visible){if(!surfaces.has(node))surfaces.set(node,{name,hadShell:node.classList.contains('fl-shell')});node.classList.add('fl-shell',name);node.dataset.flTheme=theme;}
  else if(surfaces.has(node)){const previous=surfaces.get(node);node.classList.remove(previous.name);if(!previous.hadShell)node.classList.remove('fl-shell');delete node.dataset.flTheme;surfaces.delete(node);}
 }
 function icons(root){
  for(const node of root.querySelectorAll('.primary > span,.v61-country-choice > span > b,.v61-club-choice > b')){
   if(node.textContent.trim()==='↗'){node.innerHTML=ns.components.icon('arrow');node.classList.add('fl-start-arrow');node.setAttribute('aria-hidden','true');}
  }
  for(const node of root.querySelectorAll('button'))if(node.textContent.trim()==='×'){node.innerHTML=ns.components.icon('close');node.classList.add('fl-start-close');}
 }
 function releaseDialog(dialog){const previous=dialogs.get(dialog);dialog.classList.remove('fl-start-dialog');if(!previous.hadDialog&&!doc.body.classList.contains('fl-active'))dialog.classList.remove('fl-dialog');dialogs.delete(dialog);}
 function refresh(){
  if(disposed)return;
  const flow=!world.hidden&&!!world.querySelector(':scope > .v61-steps'),active=!home.hidden||flow;
  const selected=preference(),theme=selected==='system'?(media.matches?'dark':'light'):selected;
  doc.body.classList.toggle('fl-start-active',active);if(active)doc.body.dataset.flStartTheme=theme;else delete doc.body.dataset.flStartTheme;
  surface(home,'fl-start',!home.hidden,theme);surface(world,'fl-start-flow',flow,theme);surface(header,'fl-start-header',active,theme);surface(legal,'fl-start-legal',active,theme);
  for(const node of [home,world])if(node?.classList.contains('fl-shell'))icons(node);
  for(const [dialog] of dialogs)if(!active||!dialog.isConnected||!dialog.open)releaseDialog(dialog);
  if(active)for(const dialog of doc.querySelectorAll('dialog[open]')){
   if(!dialogs.has(dialog))dialogs.set(dialog,{hadDialog:dialog.classList.contains('fl-dialog')});
   dialog.classList.add('fl-dialog','fl-start-dialog');dialog.dataset.flTheme=theme;icons(dialog);
  }
 }
 const observer=new MutationObserver(refresh);
 observer.observe(doc.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','open']});
 const languageObserver=new MutationObserver(refresh);languageObserver.observe(doc.documentElement,{attributes:true,attributeFilter:['lang']});
 media.addEventListener('change',refresh);win.addEventListener('storage',refresh);doc.addEventListener('fl-theme-applied',refresh);
 ns.start=Object.freeze({refresh,dispose(){if(disposed)return;disposed=true;observer.disconnect();languageObserver.disconnect();media.removeEventListener('change',refresh);win.removeEventListener('storage',refresh);doc.removeEventListener('fl-theme-applied',refresh);for(const [dialog] of dialogs)releaseDialog(dialog);for(const [node,previous] of [...surfaces])surface(node,previous.name,false,'');doc.body.classList.remove('fl-start-active');delete doc.body.dataset.flStartTheme;}});
 refresh();
})();

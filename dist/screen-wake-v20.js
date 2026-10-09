'use strict';

let matchWakeLock=null,matchWakeLockPending=false,matchWakeLockRetry=0,matchWakeLockRetried=false;

function matchNeedsWakeLock(){
 if(document.visibilityState!=='visible')return false;
 const context=typeof v65Context==='function'?v65Context():null;
 if(context)return Boolean(match&&!match.finished&&!$('#game-screen').hidden&&['live','paused'].includes(context.state.phase)&&(context.state.phase==='live'||document.body.classList.contains('v132-fullscreen')));
 return Boolean(running);
}

function syncMatchWakeLock(){
 matchWakeLockRetried=false;
 if(matchNeedsWakeLock())requestMatchWakeLock();else releaseMatchWakeLock();
}

async function requestMatchWakeLock(){
 if(!matchNeedsWakeLock()||!navigator.wakeLock||matchWakeLock&&!matchWakeLock.released||matchWakeLockPending)return false;
 matchWakeLockPending=true;
 try{
  const lock=await navigator.wakeLock.request('screen');
  if(!matchNeedsWakeLock()||lock.released){await lock.release();return false}
  matchWakeLock=lock;
  lock.addEventListener('release',()=>{
   if(matchWakeLock!==lock)return;matchWakeLock=null;
   // One retry covers platform/fullscreen releases without a battery-policy loop.
   if(matchNeedsWakeLock()&&!matchWakeLockRetried){matchWakeLockRetried=true;matchWakeLockRetry=setTimeout(()=>{matchWakeLockRetry=0;requestMatchWakeLock();},250);}
  });
  return true;
 }catch{return false}
 finally{matchWakeLockPending=false}
}

async function releaseMatchWakeLock(){
 clearTimeout(matchWakeLockRetry);matchWakeLockRetry=0;
 const lock=matchWakeLock;matchWakeLock=null;
 if(lock)try{await lock.release()}catch{}
}

document.addEventListener('visibilitychange',syncMatchWakeLock);
document.addEventListener('fullscreenchange',syncMatchWakeLock);
window.addEventListener('pageshow',syncMatchWakeLock);
window.addEventListener('focus',syncMatchWakeLock);
window.addEventListener('pagehide',releaseMatchWakeLock);

const v19StartWithWakeLock=start;
start=function(){v19StartWithWakeLock();syncMatchWakeLock()};
$('#start').onclick=()=>start();

const v19FinishWithWakeLock=finishMatch;
finishMatch=function(){v19FinishWithWakeLock();releaseMatchWakeLock()};

document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='Doppel 6 / PROTOTYP 39');

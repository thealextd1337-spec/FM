'use strict';

let matchWakeLock=null,matchWakeLockPending=false;

async function requestMatchWakeLock(){
 if(!running||document.visibilityState!=='visible'||!navigator.wakeLock||matchWakeLock||matchWakeLockPending)return false;
 matchWakeLockPending=true;
 try{
  const lock=await navigator.wakeLock.request('screen');
  if(!running){await lock.release();return false}
  matchWakeLock=lock;
  lock.addEventListener('release',()=>{if(matchWakeLock===lock)matchWakeLock=null});
  return true;
 }catch{return false}
 finally{matchWakeLockPending=false}
}

async function releaseMatchWakeLock(){
 const lock=matchWakeLock;matchWakeLock=null;
 if(lock)try{await lock.release()}catch{}
}

document.addEventListener('visibilitychange',()=>{
 if(document.visibilityState==='visible'&&running)requestMatchWakeLock();
});

const v19StartWithWakeLock=start;
start=function(){const wasRunning=running;v19StartWithWakeLock();if(!wasRunning&&running)requestMatchWakeLock()};
$('#start').onclick=()=>start();

const v19FinishWithWakeLock=finishMatch;
finishMatch=function(){v19FinishWithWakeLock();releaseMatchWakeLock()};

document.querySelectorAll('footer span:first-child').forEach(element=>element.textContent='SECHSER / PROTOTYP 20');

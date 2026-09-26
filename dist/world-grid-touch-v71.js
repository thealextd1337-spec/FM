'use strict';

// Touchbedienung für dasselbe Raster vor Anpfiff und in der Spielpause.
let v71Pointer=null,v71NativeDrag=null,v71ScrollFrame=0,v71SuppressClickUntil=0;
function v71DragSource(target){
 const before=target.closest?.('#v61-world-screen [data-v64-pick-slot],#v61-world-screen [data-v64-bench-card]');
 if(before){
  if(before.classList.contains('v64-keeper-choice'))return null;
  const state=v61CurrentCareer?.world.activeMatch?.state;
  if(state?.phase!=='prematch'||v64UiTab!=='lineup')return null;
  return{mode:'prematch',source:before.dataset.v64PickSlot!==undefined?{kind:'field',slot:Number(before.dataset.v64PickSlot)}:{kind:'bench',pid:before.dataset.v64BenchCard},element:before};
 }
 const pause=target.closest?.('#v65-plan-view [data-v65-pick-slot],#v65-plan-view [data-v65-bench-card]');
 if(pause){
  if(pause.classList.contains('v64-keeper-choice'))return null;
  const context=v65Context();if(context?.state.phase!=='paused')return null;
  return{mode:'pause',source:pause.dataset.v65PickSlot!==undefined?{kind:'field',slot:Number(pause.dataset.v65PickSlot)}:{kind:'bench',pid:pause.dataset.v65BenchCard},element:pause};
 }
 return null;
}
function v71Target(x,y){
 const element=document.elementFromPoint(x,y);
 return element?.closest?.('[data-v64-cell],[data-v64-pick-slot],[data-v64-bench-card],[data-v65-pick-slot],[data-v65-bench-card]')||null;
}
function v71Highlight(){
 document.querySelectorAll('.v64-drag-over').forEach(element=>element.classList.remove('v64-drag-over'));
 if(!v71Pointer?.dragging)return;
 const target=v71Target(v71Pointer.x,v71Pointer.y);
 if(target)target.classList.add('v64-drag-over');
}
function v71Scroll(){
 v71ScrollFrame=0;const drag=v71Pointer?.dragging?v71Pointer:v71NativeDrag;if(!drag)return;
 const y=drag.y,height=window.innerHeight,headerBottom=document.querySelector('header')?.getBoundingClientRect?.().bottom||0;
 const topEdge=Math.min(height*.35,Math.max(140,headerBottom+72)),bottomEdge=Math.max(96,Math.min(140,height*.2));
 const speed=y<topEdge?-Math.ceil((topEdge-y)/topEdge*24):y>height-bottomEdge?Math.ceil((y-height+bottomEdge)/bottomEdge*24):0;
 if(speed){window.scrollBy(0,speed);if(v71Pointer?.dragging)v71Highlight()}
 v71ScrollFrame=requestAnimationFrame(v71Scroll);
}
function v71StopNativeDrag(){
 v71NativeDrag=null;
 if(!v71Pointer&&v71ScrollFrame)cancelAnimationFrame(v71ScrollFrame);
 if(!v71Pointer)v71ScrollFrame=0;
}
document.addEventListener('dragstart',event=>{
 if(!v64UiDrag&&!v65Drag)return;
 v71NativeDrag={y:event.clientY};
 if(!v71ScrollFrame)v71ScrollFrame=requestAnimationFrame(v71Scroll);
});
document.addEventListener('dragover',event=>{
 if(!v71NativeDrag)return;
 v71NativeDrag.y=event.clientY;
 event.preventDefault();
});
document.addEventListener('drop',v71StopNativeDrag);
document.addEventListener('dragend',v71StopNativeDrag);
function v71Clear(){
 if(v71ScrollFrame)cancelAnimationFrame(v71ScrollFrame);v71ScrollFrame=0;
 document.querySelectorAll('.v64-drag-over,.v71-dragging').forEach(element=>element.classList.remove('v64-drag-over','v71-dragging'));
 document.querySelector('#v71-ghost')?.remove();v71Pointer=null;
}
document.addEventListener('pointerdown',event=>{
 if(event.pointerType==='mouse'||event.target.closest?.('[data-v64-profile],[data-v65-profile]'))return;
 const drag=v71DragSource(event.target);if(!drag)return;
 v71Pointer={...drag,id:event.pointerId,startX:event.clientX,startY:event.clientY,x:event.clientX,y:event.clientY,dragging:false};
});
document.addEventListener('pointermove',event=>{
 const drag=v71Pointer;if(!drag||drag.id!==event.pointerId)return;
 const dx=Math.abs(event.clientX-drag.startX),dy=Math.abs(event.clientY-drag.startY);
 if(!drag.dragging){
  if(dy>=12&&dy>dx*1.25){v71Clear();return}
  if(dx<20||dx<=dy*1.4)return;
  drag.dragging=true;drag.element.classList.add('v71-dragging');
  const ghost=document.createElement('div');ghost.id='v71-ghost';ghost.className='drag-ghost';ghost.textContent=drag.element.querySelector('.player-label,.bench-title,.v64-keeper-choice')?.textContent?.trim()||'Spieler';document.body.append(ghost);
  v71ScrollFrame=requestAnimationFrame(v71Scroll);
 }
 event.preventDefault();drag.x=event.clientX;drag.y=event.clientY;
 const ghost=document.querySelector('#v71-ghost');if(ghost){ghost.style.left=`${drag.x}px`;ghost.style.top=`${drag.y}px`}
 v71Highlight();
},{passive:false});
document.addEventListener('pointerup',event=>{
 const drag=v71Pointer;if(!drag||drag.id!==event.pointerId)return;
 const dropped=drag.dragging,target=dropped?v71Target(event.clientX,event.clientY):null;
 if(dropped){
  v71SuppressClickUntil=Date.now()+450;
  if(drag.mode==='prematch'){v64UiDrag=drag.source;if(v64UiCanDrop(target))v64UiDropAction(drag.source,target);v64UiDrag=null}
  else{v65Drag=drag.source;if(v65CanDrop(target))v65DropAction(drag.source,target);else if(target)v65ReportInvalidDrop();v65Drag=null}
 }
 v71Clear();
});
document.addEventListener('pointercancel',event=>{if(v71Pointer?.id===event.pointerId)v71Clear()});
document.addEventListener('click',event=>{
 if(Date.now()<v71SuppressClickUntil&&event.target.closest?.('[data-v64-cell],[data-v64-bench-card],[data-v65-bench-card]')){event.preventDefault();event.stopImmediatePropagation()}
},true);

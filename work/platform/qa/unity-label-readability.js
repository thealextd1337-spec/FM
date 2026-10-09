// Evaluate in an isolated T3 preview after D6QA160.setup and paused fullscreen.
// Synthetic head projections test layout; the Unity actors are not moved.
window.D6LabelQA=async()=>{
 const check=(ok,message)=>{if(!ok)throw Error(message);checks.push(message)},checks=[],rows=[];
 const iframe=document.querySelector('#d6-unity-host iframe'),saved=D6UnityMatch.projection,clock=match.elapsed;
 const native=()=>JSON.stringify({match,world:D6QA160.career.world});const before=native();
 const block=event=>{if(event.data?.kind==='projection'&&!event.data.labelFixture)event.stopImmediatePropagation()};
 const send=(data,source=iframe.contentWindow)=>window.dispatchEvent(new MessageEvent('message',{source,origin:new URL(iframe.src).origin,data:{...data,labelFixture:true}}));
 const inspect=()=>{const area=document.querySelector('#d6-unity-labels').getBoundingClientRect(),buttons=[...document.querySelectorAll('#d6-unity-labels button')].filter(b=>!b.hidden),rects=buttons.map(b=>{const r=b.getBoundingClientRect();return {id:b.dataset.player,text:b.textContent,aria:b.getAttribute('aria-label'),team:b.dataset.team,pattern:getComputedStyle(b).borderBottomStyle,featured:b.classList.contains('is-featured'),x:r.x,y:r.y,w:r.width,h:r.height,leader:b.style.getPropertyValue('--leader-length')}});return {area:{x:area.x,y:area.y,w:area.width,h:area.height},rects,overlaps:rects.flatMap((a,i)=>rects.slice(i+1).filter(b=>a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h).map(b=>[a.id,b.id])),outside:rects.filter(r=>r.x<area.x-.1||r.x+r.w>area.right+.1||r.y<area.y-.1||r.y+r.h>area.bottom+.1).map(r=>r.id)}};
 addEventListener('message',block,true);
 try{
  const real=inspect();rows.push({name:'Actual rendered Unity heads',...real});check(!real.overlaps.length&&!real.outside.length,'Real rendered labels do not overlap or leave viewport');
  check(real.rects.every(r=>r.text.trim()&&r.aria.includes(' · ')),'Number/name and full accessible name preserved');
  check(real.rects.every(r=>r.pattern===(r.team==='1'?'dashed':'solid')),'Team label patterns match continuous/segmented foot rings');
  for(const [x,y]of [[.5,.5],[0,0],[1,0],[0,1],[1,1]]){
   const data={...saved,markers:saved.markers.map((m,i)=>({...m,x,y,visible:true,featured:i===0}))};send(data);const row=inspect();rows.push({name:`Synthetic crowd ${x},${y}`,...row});
   check(row.rects.length===match.people.length&&!row.overlaps.length&&!row.outside.length,`All ${match.people.length} crowded names fit at ${x},${y}: ${JSON.stringify({overlaps:row.overlaps,outside:row.outside})}`);
   check(row.rects.some(r=>r.leader!=='0px'),`Displaced names have head leaders at ${x},${y}`);
  }
  const stable=JSON.stringify(inspect());send({...saved,markers:saved.markers.map(m=>({...m,x:NaN}))});check(JSON.stringify(inspect())===stable,'Nonfinite projection rejected');
  send(saved,window);check(JSON.stringify(inspect())===stable,'Foreign window projection rejected');
  send(saved);check(match.elapsed===clock&&native()===before,'Layout and projection probes leave native match/accounting unchanged');
  const labels=[...document.querySelectorAll('#d6-unity-labels button')];check(labels.every(b=>!b.disabled),'Live paused player information remains enabled');
  const first=labels.find(b=>!b.hidden);first.focus();check(document.activeElement===first,'Labels retain keyboard focus');first.blur();
  return {pass:true,checks,rows,viewport:{width:innerWidth,height:innerHeight},unitySourceId:window.D6LabelQAIdentity||null,note:'Actual Unity WebGL rendering plus explicitly synthetic head-position layout cases. Desktop preview; no physical Android performance evidence.'};
 }finally{for(const b of document.querySelectorAll('#d6-unity-labels button')){b.dataset.offsetX='0';b.dataset.offsetY='0'}send(saved);removeEventListener('message',block,true)}
};

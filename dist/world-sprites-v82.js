'use strict';

const v82Skin={
 fair:['#f7cfae','#e9ac83','#b96f58'],light:['#eec09b','#cf916c','#9c5e49'],
 warm:['#dba779','#b97953','#895138'],medium:['#c98b61','#a96442','#774632'],
 brown:['#aa6a45','#874c32','#603526'],deep:['#855337','#663b2b','#462a23']
};
const v82Hair={black:['#22232b','#11151d'], 'dark-brown':['#392b2a','#201b20'],brown:['#62402f','#35271f'],
 'light-brown':['#956748','#593d2c'],blond:['#d5ad64','#8e6a3d'],auburn:['#a5583c','#69342c'],gray:['#a7a8a1','#616969']};
const v82NeutralKit={main:'#667487',pattern:'#e3e8db',accent:'#334258',style:'stripe'};
const v82SpriteCache=new Map();
function v82Rect(x,y,w,h,color){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`}
function v82Mix(a,b,weight){
 const channel=index=>Math.round(parseInt(a.slice(index,index+2),16)*(1-weight)+parseInt(b.slice(index,index+2),16)*weight).toString(16).padStart(2,'0');
 return `#${channel(1)}${channel(3)}${channel(5)}`;
}
function v82Texture(appearance,region,colors,count){
 let seed=[...JSON.stringify(appearance)].reduce((hash,char)=>Math.imul(hash,33)+char.charCodeAt(0)|0,17);
 return Array.from({length:count},(_,index)=>{
  seed=Math.imul(seed,1664525)+1013904223|0;const x=region.x+(seed>>>0)%region.w;
  seed=Math.imul(seed,1664525)+1013904223|0;const y=region.y+(seed>>>0)%region.h;
  return v82Rect(x,y,1+(index%7===0?1:0),1,colors[index%colors.length]);
 }).join('');
}
function v82HairShape(appearance,base,shade){
 const r=(x,y,w,h,c=base)=>v82Rect(x,y,w,h,c),p=(d,c=base)=>`<path d="${d}" fill="${c}"/>`,style=appearance.hairstyle;
 if(style==='bald')return p('M31 20h7v-3h20v3h7v2H31Z',shade)+r(35,17,24,1,base);
 if(style==='buzz')return p('M27 27v-9h4v-4h8v-3h19v2h7v4h4v10h-5v-5h-5v-2H37v2h-5v5Z',shade)+p('M32 19v-4h8v-2h17v2h7v5h-8v-2H40v2Z')+r(28,23,4,5,base)+r(64,23,4,5,base);
 if(style==='side_part')return p('M24 35V19h5v-6h8V9h23v2h8v4h5v20h-6V24l-5-3-5 3H35l-5 7v4Z',shade)+p('M28 24v-9h8v-4h24v2h8v5H58l-9 5H34l-6 8Z')+p('M31 20h19l11-6h6v3l-11 8H37l-8 9h-3v-8Z',base)+p('M55 14h3v9h-3Z',shade);
 if(style==='medium_waves')return p('M22 47V25h-4v-8h6v-7h9V5h12v3h7V5h13v5h8v8h5v13h-4v17h-7V30l-7-6-6 4-8-6-9 5-9-2v22Z',shade)+p('M24 19v-7h9V8h11v6h7V9h11v4h8v9h-8v-5h-9l-7 6-9-5-7 8h-6Z')+[27,38,50,62].map((x,i)=>p(`M${x} ${12+(i%2)*2}h7v3h-4v4h-5Z`,base)).join('')+r(20,38,5,10,base)+r(71,35,5,12,base);
 if(style==='round_afro')return p('M17 43h-5V28h3V17h5V9h9V4h11V1h19v3h10v5h8v8h5v9h3v17h-8v5h-9V31h-5v-4H33v4h-5v17h-8v-5Z',shade)+p('M18 35V20h5v-9h9V7h10V4h16v3h9v5h7v9h5v14h-7V26h-9v-4H33v4h-8v9Z')+[19,28,40,52,64,74].map((x,i)=>r(x,10+(i%2)*3,4,4,i%2?shade:base)).join('');
 if(style==='cornrows')return p('M25 29V18h5v-5h9V9h19v3h9v5h5v13h-5v-6H29v5Zm-3 0h7v25h-4v7h-3Zm46 0h7v25h-3v7h-4Z',shade)+p('M30 20v-5h10v-3h19v3h8v5Z')+[33,40,47,54,61].map((x,i)=>p(`M${x} 13h2v3h2v9h-2v-7h-2Z`,i%2?base:shade)).join('')+r(23,47,4,9,base)+r(70,46,4,10,base);
 if(style==='textured_crop')return p('M25 32V18h5v-5h8V9h24v3h7v5h4v15h-6v-9H31v9Z',shade)+[28,34,40,46,52,58,64].map((x,i)=>p(`M${x} ${12+(i%3)*2}h6v3h-2v5h-4Z`,i%2?base:shade)).join('')+r(27,24,4,6,base)+r(66,24,4,6,base);
 if(style==='tight_curls')return p('M23 36V22h4V14h7V9h8V6h14v3h8v5h7v8h4v14h-7V27H30v9Z',shade)+[27,35,43,51,59,67].map((x,i)=>p(`M${x} ${12+(i%2)*3}h6v2h2v5h-3v-3h-5Z`,base)+r(x+1,15+(i%2)*3,2,2,shade)).join('')+r(24,27,6,8,base)+r(68,27,5,8,base);
 if(style==='short_locs')return p('M24 29V18h5v-5h9V9h21v3h9v5h5v13h-6v-5H30v4Z',shade)+p('M29 20v-5h10v-3h20v3h9v5Z')+[23,31,39,47,55,63,71].map((x,i)=>p(`M${x} 23h5v${16+(i%3)*5}h-2v4h-3Z`,i%2?base:shade)).join('');
 return p('M25 35V20h5v-7h8V9h20v3h9v5h5v18h-4v19h5v8h10v6H69V45h-3V26H31v19h-5v16h-5V35Z',shade)+p('M30 22v-8h9v-3h19v3h9v9h-7v-4H37v7h-7Z')+p('M67 43h6v18h8v5H70V54h-3Z',base)+r(25,37,5,18,base);
}
function v82Face(appearance,skin,hair){
 const [light,base,shadow]=skin,[hairBase,hairShade]=hair;
 const bright=v82Mix(light,'#fff3dc',.25),mid=v82Mix(light,base,.55),deep=v82Mix(shadow,'#241b22',.3),hairLight=v82Mix(hairBase,'#e7c29c',.25),hairDark=v82Mix(hairShade,'#0b1019',.3);
 const shapes={oval:'M35 17H61L68 21 73 29V48L70 55 65 63 57 70H39L31 63 26 55 23 48V29L28 21Z',round:'M35 17H61L69 22 74 31V48L70 57 63 64 56 68H40L33 64 26 57 22 48V31L27 22Z',square:'M32 17H64L72 23 75 31V52L71 60 65 67 57 70H39L31 67 25 60 21 52V31L24 23Z',long:'M36 12H60L69 19 72 29V54L68 62 61 72 55 75H41L35 72 28 62 24 54V29L27 19Z',angular:'M35 16H61L69 23 75 31V47L68 55 63 62 58 70H38L33 62 28 55 21 47V31L27 23Z'};
 const faceId=`v82-face-${[...JSON.stringify(appearance)].reduce((hash,char)=>Math.imul(hash,31)+char.charCodeAt(0)|0,7)>>>0}`;
 const browX=appearance.eyeBrows==='wide-set'?[31,55]:appearance.eyeBrows==='close-set'?[36,52]:[33,54];
 const brows=browX.map((x,index)=>{
  const y=appearance.eyeBrows==='arched'?35+(index?1:0):appearance.eyeBrows==='soft'?38:36;
  return `<path d="M${x} ${y+3}v-2l3-1h6l3 2v2h-3v-2h-6v1Z" fill="${hairDark}"/>`+v82Rect(x+2,y+5,8,1,shadow);
 }).join('');
 const eyes=browX.map((x,index)=>{
  const iris=x+(appearance.eyeBrows==='wide-set'?5:4)+(index?1:0);
  return `<path d="M${x+1} 45h8l2 1v2h-2v-1h-7v1h-2v-2Z" fill="${deep}"/>`+v82Rect(x+3,46,5,1,'#e5d8c8')+v82Rect(iris,45,2,3,'#20242a')+v82Rect(iris+1,46,1,1,'#fff9e8')+v82Rect(x+2,49,7,1,shadow)+v82Rect(x,43,2,2,mid);
 }).join('');
 const noseW=appearance.nose==='narrow'?4:appearance.nose==='broad'?10:appearance.nose==='rounded'?8:6,noseX=48-noseW/2;
 const nose=`<path d="M46 48h2v7h-2v2h-2v-5h2Z" fill="${bright}"/><path d="M49 48h2v8h2v2h-4Z" fill="${shadow}"/>`+v82Rect(noseX+1,57,noseW-2,2,mid)+v82Rect(noseX,58,2,1,deep)+v82Rect(noseX+noseW-2,58,2,1,deep)+v82Rect(46,59,4,1,light);
 const mouthW=appearance.mouth==='narrow'?10:appearance.mouth==='wide'?18:14,mouthX=48-mouthW/2;
 const mouth=`<path d="M${mouthX} 64h2v-1h${mouthW-4}v1h2v1h-3v1h-${mouthW-6}v-1h-3Z" fill="${deep}"/>`+v82Rect(mouthX+3,65,mouthW-6,1,appearance.mouth==='full'?'#a75f56':v82Mix(shadow,'#af6455',.35))+v82Rect(mouthX+4,67,mouthW-8,1,mid);
 const facial=appearance.facialHair==='none'?'':appearance.facialHair==='stubble'?`<path d="M30 60h4v7h5v3h18v-3h5v-7h4v9h-7v4H37v-4h-7Z" fill="${hairShade}" opacity=".28"/>`:appearance.facialHair==='moustache'?`<path d="M40 61h6l2 1 2-1h6v3h-6l-2-1-2 1h-6Z" fill="${hairShade}"/>`:appearance.facialHair==='goatee'?`<path d="M43 68h10v4h-3v2h-4v-2h-3Z" fill="${hairShade}"/>`:`<path d="M27 57h5v7h4v5h6v3h12v-3h6v-5h4v-7h5v11h-7v4h-8v4H42v-4h-8v-4h-7Z" fill="${hairShade}" opacity=".8"/>`;
 const faceLight=`<path d="M29 29h9v3h-4v5h-4v13h-3V36h2ZM32 51h5v4h-3v6h-3v-4h1ZM39 61h4v3h-4Z" fill="${mid}"/>${v82Rect(33,31,5,4,bright)}${v82Rect(33,53,3,4,light)}${v82Rect(41,69,7,2,light)}`;
 const faceShade=`<path d="M62 27h7v10h3v14h-4v7h-4v7h-5v5h-6v3h-9v-2h11v-4h6v-8h3V43h-2Z" fill="${shadow}"/><path d="M60 34h5v3h-3v12h4v5h-4v5h-5v-3h3Z" fill="${mid}"/>${v82Rect(29,58,4,5,shadow)}${v82Rect(57,59,4,4,shadow)}${v82Rect(43,70,11,2,mid)}`;
 const hairId=`${faceId}-hair`,hairShape=v82HairShape(appearance,hairBase,hairShade);
 const hairTexture=appearance.hairstyle==='bald'?'':`<g clip-path="url(#${hairId})" opacity=".55">${v82Texture(appearance,{x:20,y:5,w:57,h:38},[hairLight,hairBase,hairDark],110)}</g>`;
 const skinTexture=`<g clip-path="url(#${faceId})" opacity=".3">${v82Texture(appearance,{x:28,y:28,w:40,h:43},[mid,bright,shadow],70)}</g>`;
 const cheek=`<path d="M31 52h4v3h4v2h-5v2h-3ZM62 52h4v4h-3v3h-5v-2h4Z" fill="${v82Mix(base,shadow,.35)}"/><path d="M39 40h6v2h-6Zm14 0h6v2h-6Z" fill="${mid}"/>`;
 return `<defs><clipPath id="${faceId}"><path d="${shapes[appearance.faceShape]}"/></clipPath><clipPath id="${hairId}">${hairShape}</clipPath><linearGradient id="${faceId}-tone"><stop offset="0" stop-color="${light}"/><stop offset=".38" stop-color="${base}"/><stop offset=".68" stop-color="${mid}"/><stop offset="1" stop-color="${shadow}"/></linearGradient></defs><path d="M18 42H23V52H18L16 49V44ZM73 42H78L80 44V49L78 52H73Z" fill="${base}" stroke="${deep}" stroke-width="2"/>${v82Rect(19,44,3,5,light)}${v82Rect(75,44,3,5,shadow)}${v82Rect(20,46,2,2,shadow)}${v82Rect(75,46,2,2,mid)}<path d="${shapes[appearance.faceShape]}" fill="url(#${faceId}-tone)" stroke="#25232a" stroke-width="2"/>${skinTexture}${faceLight}${faceShade}${cheek}${v82Rect(37,69,22,8,shadow)}${v82Rect(41,69,14,7,base)}${hairShape}${hairTexture}${brows}${eyes}${nose}${mouth}${facial}`;
}
function v82Arms(pose,skin,kit){
 const [light,base,shadow]=skin,out='#25232a';
 if(pose==='double_fists')return `<path d="M27 65 14 52 10 32 20 29 25 46 37 57ZM69 65 82 52 86 32 76 29 71 46 59 57Z" fill="${base}" stroke="${out}" stroke-width="2"/>${v82Rect(8,20,15,15,base)}${v82Rect(73,20,15,15,base)}${v82Rect(8,20,15,4,light)}${v82Rect(73,20,15,4,light)}`;
 if(pose==='arms_wide')return `<path d="M29 62 5 48 0 50 1 59 24 74ZM67 62 91 48 96 50 95 59 72 74Z" fill="${base}" stroke="${out}" stroke-width="2"/>${v82Rect(0,47,9,10,light)}${v82Rect(87,47,9,10,light)}`;
 if(pose==='fist_chest')return `<path d="M28 64 9 52 5 57 19 75 35 76ZM68 64 77 58 67 48 57 58 55 69Z" fill="${base}" stroke="${out}" stroke-width="2"/>${v82Rect(3,51,8,10,light)}${v82Rect(58,51,12,11,light)}`;
 return `<path d="M28 65 13 43 11 20 19 17 24 38 38 57ZM68 65 83 43 85 20 77 17 72 38 58 57Z" fill="${base}" stroke="${out}" stroke-width="2"/>${v82Rect(9,17,13,11,base)}${v82Rect(74,17,13,11,base)}${v82Rect(11,3,5,17,light)}${v82Rect(80,3,5,17,light)}${v82Rect(11,3,5,3,base)}${v82Rect(80,3,5,3,base)}`;
}
function v82Pattern(kit,top){
 const trim=kit.pattern||kit.trim||'#f1eee5';
 if(kit.style==='stripe')return v82Rect(42,top,12,96-top,trim);
 if(kit.style==='hoops')return [top+9,top+18,top+27].map(y=>v82Rect(13,y,70,4,trim)).join('');
 if(kit.style==='halves')return v82Rect(48,top,43,96-top,trim);
 if(kit.style==='diagonal')return `<path d="M12 96 54 ${top}h23L35 96Z" fill="${trim}"/>`;
 if(kit.style==='pinstripes')return [25,34,43,52,61,70].map(x=>v82Rect(x,top+3,2,93-top,trim)).join('');
 return '';
}
function v82SpriteSVG(player,kit,mode='portrait'){
 if(!player?.appearance||!v61ValidAppearance(player.appearance))return '';
 const appearance=player.appearance,shirt=kit||v82NeutralKit,key=JSON.stringify([appearance,shirt,mode,player.name]);
 if(v82SpriteCache.has(key))return v82SpriteCache.get(key);
 const skin=v82Skin[appearance.skinTone],hair=v82Hair[appearance.hairColor],trim=shirt.pattern||shirt.trim||'#e3e8db';
 const clipId=`v82-shirt-${Math.abs([...key].reduce((hash,char)=>Math.imul(hash,31)+char.charCodeAt(0)|0,7))}`;
 const celebration=mode==='celebration';
 const torso=celebration?'M30 61 37 58 42 63 54 63 59 58 66 61 81 70 76 80 69 77 69 96H27V77L20 80 15 70Z':'M28 70 38 67 42 72 54 72 58 67 68 70 88 82 84 96H12L8 82Z';
 const arms=mode==='celebration'?v82Arms(appearance.pose,skin,shirt):'';
 const highlights=celebration?v82Rect(28,68,4,25,'#ffffff20')+v82Rect(62,68,4,24,'#00000020'):v82Rect(17,78,5,18,'#ffffff24')+v82Rect(72,78,5,18,'#00000024');
 const label=`${mode==='celebration'?'Jubelpose':'Porträt'} von ${player.name}`;
 const shirtLight=v82Mix(shirt.main,'#ffffff',.13),shirtShade=v82Mix(shirt.main,'#121820',.29);
 const collar=celebration?'M37 68 48 74 59 68':'M37 75 48 80 59 75';
 const svg=`<svg class="v82-sprite" viewBox="0 0 96 96" role="img" aria-label="${escapeHTML(label)}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><defs><clipPath id="${clipId}"><path d="${torso}"/></clipPath><linearGradient id="${clipId}-cloth"><stop offset="0" stop-color="${shirtLight}"/><stop offset=".45" stop-color="${shirt.main}"/><stop offset="1" stop-color="${shirtShade}"/></linearGradient></defs>${arms}<path d="${torso}" fill="url(#${clipId}-cloth)" stroke="#25232a" stroke-width="3"/><g clip-path="url(#${clipId})">${v82Pattern(shirt,celebration?59:69)}${highlights}<g opacity=".25">${v82Texture(appearance,{x:14,y:celebration?65:78,w:68,h:22},[shirtLight,shirtShade],72)}</g>${v82Rect(celebration?20:11,celebration?69:84,celebration?12:15,4,shirt.accent||trim)}${v82Rect(celebration?64:70,celebration?69:84,celebration?12:15,4,shirt.accent||trim)}</g>${v82Rect(38,celebration?62:71,20,3,trim)}${celebration?'<g transform="translate(9 9) scale(.81)" >':''}${v82Face(appearance,skin,hair)}${celebration?'</g>':''}<path d="${collar}" fill="none" stroke="${trim}" stroke-width="2"/></svg>`;
 if(v82SpriteCache.size>=512)v82SpriteCache.delete(v82SpriteCache.keys().next().value);
 v82SpriteCache.set(key,svg);return svg;
}
function v82ProfileKit(player,owner){
 if(!owner?.kits)return v82NeutralKit;
 return player.keeper?owner.kits.keepers[0]:owner.kits.home;
}
function v82AddProfile(player,owner){
 const head=v61ProfileDialog.querySelector('.player-card-head');if(!head||!player?.appearance)return;
 const svg=v82SpriteSVG(player,v82ProfileKit(player,owner));if(!svg)return;
 head.classList.add('v82-has-portrait');
 head.querySelector('[data-v61-close]')?.insertAdjacentHTML('beforebegin',`<figure class="v82-profile-sprite">${svg}</figure>`);
}
const v82BaseOpenPlayerProfile=v68OpenPlayerProfile;
v68OpenPlayerProfile=function(career,pid,button){
 const result=v82BaseOpenPlayerProfile(career,pid,button),player=v66Player(career,pid);
 v82AddProfile(player,player&&v66Owner(career,pid));return result;
};
const v82BaseOpenProfile=v61OpenProfile;
v61OpenProfile=function(pid,button){
 const result=v82BaseOpenProfile(pid,button);
 if(!v61CurrentCareer){const entry=v61Catalog.find(club=>club.id===v61Flow.clubId),player=entry&&v61GenerateRoster(entry,v61Flow.seed).find(item=>item.pid===pid);v82AddProfile(player,entry&&{kits:v61BuildClubKits(entry)})}
 return result;
};
v61WorldScreen.addEventListener('click',event=>{
 const button=event.target.closest('[data-v67-profile]');if(!button||!v61CurrentCareer)return;
 const owner=v66Own(v61CurrentCareer),player=owner.youthPool.find(item=>item.pid===button.dataset.v67Profile);
 if(v61ProfileDialog.open)v82AddProfile(player,owner);
});
const v82BaseShowOverlay=showOverlay;
showOverlay=function(title,copy,...rest){
 const result=v82BaseShowOverlay(title,copy,...rest),overlay=$('#match-overlay');
 overlay.querySelector('.v82-goal-sprite')?.remove();overlay.classList.remove('v82-has-sprite');
 const context=v65WorldActive&&v65Context(),goal=rest[0]&&context&&match?.goalPause>0&&match.goals.at(-1);
 if(!goal?.pid)return result;
 const scorer=v66Player(context.career,goal.pid);if(!scorer)return result;
 const kit=scorer.keeper?match.kits?.[goal.team===0?'userKeeper':'opponentKeeper']:match.kits?.[goal.team===0?'user':'opponent'];
 const svg=v82SpriteSVG(scorer,kit,'celebration');if(!svg)return result;
 overlay.classList.add('v82-has-sprite');overlay.insertAdjacentHTML('afterbegin',`<span class="v82-goal-sprite">${svg}</span>`);
 return result;
};
const v82Style=document.createElement('style');
v82Style.textContent='.v82-sprite{display:block;width:100%;height:100%;overflow:visible;image-rendering:pixelated}.player-card-head.v82-has-portrait{display:grid;grid-template-columns:minmax(0,1fr) 112px 36px;align-items:start;gap:12px}.v82-has-portrait>div{min-width:0}.v82-has-portrait h2{overflow-wrap:anywhere}.v82-profile-sprite{width:112px;height:112px;margin:-10px 0 -14px;padding:2px;border:2px solid #73978a;border-radius:5px;background:linear-gradient(#284238,#1b3033);overflow:hidden}.match-overlay.goal.v82-has-sprite{display:grid;grid-template-columns:100px minmax(0,1fr);align-items:center;gap:0 9px;width:min(94%,450px);padding:13px 12px}.match-overlay.goal.v82-has-sprite strong,.match-overlay.goal.v82-has-sprite #overlay-copy{grid-column:2;min-width:0;overflow-wrap:anywhere}.match-overlay.goal.v82-has-sprite strong{font-size:clamp(30px,5vw,54px)}.match-overlay.goal.v82-has-sprite #overlay-copy{margin-top:0}.v82-goal-sprite{display:block!important;grid-row:1/3;grid-column:1;width:100px;height:100px;margin:0!important}.v82-goal-sprite .v82-sprite{width:100px;height:100px}@media(max-width:520px){.player-card-head.v82-has-portrait{grid-template-columns:minmax(0,1fr) 82px 32px;gap:6px}.v82-profile-sprite{width:82px;height:82px;margin:25px 0 0}.match-overlay.goal.v82-has-sprite{grid-template-columns:78px minmax(0,1fr);padding:9px 7px}.v82-goal-sprite,.v82-goal-sprite .v82-sprite{width:78px;height:78px}.match-overlay.goal.v82-has-sprite strong{font-size:30px}.match-overlay.goal.v82-has-sprite #overlay-copy{font-size:11px}}';
v82Style.textContent+='.player-card-head.v82-has-portrait{grid-template-columns:minmax(0,1fr) 156px 36px;align-items:center}.v82-profile-sprite{width:156px;height:156px;margin:0;padding:0;background:#243b3d}@media(max-width:520px){.player-card-head.v82-has-portrait{grid-template-columns:minmax(0,1fr) 32px;align-items:start}.player-card-head.v82-has-portrait>div{grid-column:1;grid-row:1}.player-card-head.v82-has-portrait [data-v61-close]{grid-column:2;grid-row:1}.v82-profile-sprite{grid-column:1/-1;grid-row:2;justify-self:center;width:140px;height:140px;margin:0}}';
document.head.append(v82Style);

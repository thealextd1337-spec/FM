'use strict';

// The 160-pixel artwork keeps the saved appearance independent of club colours.
const v85Hash=value=>[...JSON.stringify(value)].reduce((hash,char)=>Math.imul(hash,31)+char.charCodeAt(0)|0,17)>>>0;
const v85Rect=(x,y,w,h,color)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`;
const v85Path=(d,color)=>`<path d="${d}" fill="${color}"/>`;
function v85Texture(appearance,region,colors,count,salt){
 let seed=v85Hash([appearance,salt]);
 return Array.from({length:count},(_,index)=>{
  seed=Math.imul(seed,1664525)+1013904223|0;const x=region.x+(seed>>>0)%region.w;
  seed=Math.imul(seed,1664525)+1013904223|0;const y=region.y+(seed>>>0)%region.h;
  return v85Rect(x,y,index%11===0?2:1,1,colors[index%colors.length]);
 }).join('');
}
const v85Faces={
 oval:'M68 24h24l11 6 7 12 2 16v29l-4 13-8 12-11 8H71l-11-8-8-12-4-13V58l2-16 7-12Z',
 round:'M65 24h30l11 7 8 13 2 16v27l-4 14-9 12-12 7H69l-12-7-9-12-4-14V60l2-16 8-13Z',
 square:'M63 24h34l13 8 4 11v53l-6 12-11 11H63l-11-11-6-12V43l4-11Z',
 long:'M69 16h22l12 7 7 13 2 18v42l-5 14-10 13-8 5H71l-8-5-10-13-5-14V54l2-18 7-13Z',
 angular:'M65 22h30l12 9 7 14v38l-5 10-5 15-14 14H70l-14-14-5-15-5-10V45l7-14Z'
};
function v85HairShape(style,base,shadow,light){
 const p=(d,c=base)=>v85Path(d,c),r=(x,y,w,h,c=base)=>v85Rect(x,y,w,h,c);
 if(style==='bald')return p('M58 28l6-7 12-5h16l12 5 6 7-8-4-11-3H69l-11 3Z',shadow)+r(73,19,14,1,light);
 if(style==='buzz')return p('M47 57V39l4-11 10-9 14-5h22l13 6 7 12 2 24h-9V44l-7-5-6-4H63l-7 8v14Z',shadow)+p('M54 40l6-13 16-8h20l13 8 4 12-10-7-10-5H70l-10 7Z')+[64,72,80,88,96].map(x=>r(x,24,3,2,light)).join('');
 if(style==='side_part')return p('M44 67V40l7-18 16-11h30l17 8 8 18v30h-10V47l-8-7-12 5H66l-10 10v12Z',shadow)+p('M50 41l7-16 15-9h27l14 8 4 12-12-3-13 8H67L54 54Z')+p('M55 33l17-15h21l-10 8-13 12-14 13-8 4 3-11Z',light)+p('M98 17h5l-7 20-5 3 3-12Z',shadow);
 if(style==='medium_waves')return p('M41 75V48l-5-6 4-18 10-10 13-8 15 3 12-5 17 5 13 13 4 18-5 8v26h-10V49l-10-7-9 7-10-8-11 9-12-6-7 9v22Z',shadow)+p('M43 42l4-19 13-12 15 3 12-7 18 8 10 14 2 11-11-9-12-6-9 12-13-8-13 12-9-3Z')+[50,65,80,96,111].map((x,i)=>p(`M${x} ${17+(i%2)*4}l6-5 7 3-7 8-7 7Z`,i%2?light:shadow)).join('')+r(40,59,8,19,base)+r(113,55,8,23,base);
 if(style==='round_afro')return p('M34 75l-8-10V46l4-15 9-12 12-10 17-5 20-1 19 6 13 11 10 15 4 17-5 18-9 8h-11V55l-9-8H59l-9 8v22Z',shadow)+p('M33 58V42l6-17 14-12 18-6h20l18 7 13 13 6 17v14h-10V44l-8-9-14-8H66l-14 8-8 9v14Z')+[40,51,64,77,90,103,116].map((x,i)=>r(x,16+(i%3)*3,5,4,i%2?light:shadow)).join('');
 if(style==='cornrows')return p('M47 63V40l6-15 14-10 13-4h18l13 8 8 13 2 31h-9V48l-9-9H59l-5 9v15Zm1-2h7v51h-4v9h-5V81Zm57 0h7v52h-4v8h-5V81Z',shadow)+p('M54 41l6-15 14-9h20l15 9 5 15Z')+[61,69,77,85,93,101].map((x,i)=>p(`M${x} 21l3-2 4 18-2 2-4-14Z`,i%2?light:shadow)).join('')+r(48,94,5,15,base)+r(106,94,5,15,base);
 if(style==='textured_crop')return p('M46 62V42l5-14 11-10 16-5h24l13 9 6 16v24h-9V47l-8-8H58l-4 9v14Z',shadow)+[57,66,75,84,93,102,111].map((x,i)=>p(`M${x} ${17+(i%3)*3}l6-3 5 3-2 9-4 3-6-3Z`,i%2?light:base)).join('')+r(49,45,5,12,base)+r(113,43,5,14,base);
 if(style==='tight_curls')return p('M43 66V42l8-17 14-11 17-5h15l17 9 9 15 2 33h-10V49l-8-7H56l-5 8v16Z',shadow)+[49,59,69,79,89,99,109].map((x,i)=>p(`M${x} ${20+(i%2)*4}l4-4 5 2 2 6-4 4-6-3Z`,i%3?base:light)).join('')+[53,66,79,92,105].map(x=>r(x,33,3,3,shadow)).join('');
 if(style==='short_locs')return p('M46 60V39l8-16 15-9 24-3 19 9 9 19v21h-9V45l-9-8H61l-7 8v15Z',shadow)+p('M54 38l7-14 16-8h17l17 9 5 13Z')+[46,54,62,70,78,86,94,102,110,118].map((x,i)=>p(`M${x} 35h${i%2?5:6}v${30+(i%3)*7}h-2v5h-4Z`,i%3?base:shadow)).join('');
 return p('M46 65V41l6-16 13-10 18-4h19l15 11 7 19v54l5 16-2 9h-19v-9h9l-4-16V61l-9-19H59l-6 19v43h-8V65Z',shadow)+p('M51 40l9-17 18-8h23l15 12 4 13-15-4-12-8H74L61 44Z')+p('M54 32l14-13h24l10 6-17-3-18 7Z',light)+r(45,70,7,32,base)+r(115,68,7,38,base);
}
function v85Face(appearance,skin,hair,id){
 const [light,base,shadow]=skin,[hairBase,hairShadow]=hair;
 const bright=v82Mix(light,'#fff6de',.27),mid=v82Mix(light,base,.55),dark=v82Mix(shadow,'#201c22',.3);
 const hairLight=v82Mix(hairBase,'#d3aa80',.25),hairDark=v82Mix(hairShadow,'#101018',.28);
 const shape=v85Faces[appearance.faceShape],hairShape=v85HairShape(appearance.hairstyle,hairBase,hairShadow,hairLight);
 const brows=appearance.eyeBrows==='wide-set'?[57,89]:appearance.eyeBrows==='close-set'?[64,82]:[60,86];
 const browY=appearance.eyeBrows==='arched'?67:appearance.eyeBrows==='soft'?70:69;
 const eyes=brows.map((x,i)=>{
  const ey=browY+8+(i&&appearance.eyeBrows==='arched'?1:0),iris=x+5;
  return v85Path(`M${x} ${ey}h12l2 2-3 3h-10l-2-3Z`,dark)+v85Rect(x+2,ey+1,9,2,'#e8ded1')+v85Rect(iris,ey,3,4,'#25232a')+v85Rect(iris+1,ey+1,1,1,'#fff8e9')+v85Rect(x+2,ey+5,10,1,shadow);
 }).join('');
 const eyebrows=brows.map((x,i)=>v85Path(`M${x-1} ${browY+(i%2)}l4-3h8l4 2v3l-5-2h-7l-4 2Z`,hairDark)).join('');
 const noseW=appearance.nose==='narrow'?8:appearance.nose==='broad'?16:appearance.nose==='rounded'?13:11,noseX=80-noseW/2;
 const nose=v85Path('M77 81h3v19h-3v5h-3V91h3Z',bright)+v85Path('M82 82h3v17h3v5h-3v3h-4Z',shadow)+v85Rect(noseX,104,noseW,2,mid)+v85Rect(noseX,106,3,2,dark)+v85Rect(noseX+noseW-3,106,3,2,dark)+v85Rect(78,107,4,2,light);
 const mouthW=appearance.mouth==='narrow'?16:appearance.mouth==='wide'?27:21,mouthX=80-mouthW/2;
 const mouth=v85Path(`M${mouthX} 113h4v-1h${mouthW-8}v1h4v2h-5v1h-${mouthW-10}v-1h-5Z`,dark)+v85Rect(mouthX+4,115,mouthW-8,2,appearance.mouth==='full'?v82Mix(shadow,'#be6d67',.4):shadow)+v85Rect(mouthX+6,120,mouthW-12,1,mid);
 const beard=appearance.facialHair==='none'?'':appearance.facialHair==='stubble'?v85Path('M54 99h5v12h6v8h10v4h12v-4h10v-8h6V99h5v18l-11 9H63l-9-9Z',hairShadow).replace('fill=','opacity=".25" fill='):appearance.facialHair==='moustache'?v85Path('M65 109h11l4 2 4-2h11v4h-11l-4-1-4 1H65Z',hairShadow):appearance.facialHair==='goatee'?v85Path('M73 119h14v6h-4v4h-6v-4h-4Z',hairShadow):v85Path('M50 94h7v16h7v9h12v5h8v-5h12v-9h7V94h7v22l-12 12H61l-11-12Z',hairShadow);
 const skinPlanes=v85Path('M54 43h9v14h-5v29h-4v11h-3V58Z',light)+v85Path('M104 39h6v46l-5 18-10 15-10 4v-5l11-7 5-15V58Z',shadow)+v85Path('M57 92h7v8h7v3H60l-4 6-2-8Z',mid)+v85Path('M96 91h7v12l-5 6-10-6h7Z',shadow)+v85Rect(72,114,6,3,mid)+v85Rect(89,114,5,3,shadow);
 return `<defs><clipPath id="${id}-skin"><path d="${shape}"/></clipPath><clipPath id="${id}-hair">${hairShape}</clipPath><linearGradient id="${id}-skin-light" x1="0" x2="1"><stop stop-color="${light}"/><stop offset=".42" stop-color="${base}"/><stop offset="1" stop-color="${shadow}"/></linearGradient></defs>`+
  v85Path('M44 77h9v18h-9l-4-5V81Zm63 0h9l4 4v9l-4 5h-9Z',base)+v85Rect(44,81,4,10,light)+v85Rect(112,82,4,9,shadow)+v85Rect(46,84,2,4,shadow)+v85Rect(112,84,2,4,mid)+
  `<path d="${shape}" fill="url(#${id}-skin-light)" stroke="${dark}" stroke-width="2"/>`+
  `<g clip-path="url(#${id}-skin)">${skinPlanes}<g opacity=".38">${v85Texture(appearance,{x:51,y:39,w:58,h:78},[light,mid,shadow],185,'skin')}</g></g>`+
  v85Path('M68 117h24v19H68Z',shadow)+v85Path('M72 117h16v17H72Z',base)+
  hairShape+(appearance.hairstyle==='bald'?'':`<g clip-path="url(#${id}-hair)" opacity=".5">${v85Texture(appearance,{x:37,y:8,w:85,h:72},[hairLight,hairBase,hairDark],225,'hair')}</g>`)+
  eyebrows+eyes+nose+mouth+beard;
}
function v85Arms(pose,skin,kit){
 const [light,base,shadow]=skin,edge='#24232a',trim=kit.accent||kit.pattern||'#ffffff';
 const arm=(d)=>`<path d="${d}" fill="${base}" stroke="${edge}" stroke-width="2"/>`;
 const fist=(x,y)=>v85Path(`M${x} ${y+4}v-8l4-4h12l4 4v13l-5 5H${x+4}l-4-5Z`,base)+v85Rect(x+4,y-3,11,3,light)+v85Rect(x+4,y+8,10,2,shadow);
 if(pose==='double_fists')return arm('M43 110 22 88 17 51 29 47 36 81 56 99Z M117 110 138 88 143 51 131 47 124 81 104 99Z')+fist(12,43)+fist(128,43);
 if(pose==='arms_wide')return arm('M44 108 11 90 0 88v15l36 26 21-9Z M116 108 149 90l11-2v15l-36 26-21-9Z')+v85Rect(0,87,13,13,light)+v85Rect(147,87,13,13,light);
 if(pose==='fist_chest')return arm('M43 109 19 98 7 114l25 24 24-14Z M117 108l16-20-14-13-24 25-3 20Z')+fist(4,106)+fist(105,68);
 return arm('M43 110 23 79 16 35 27 31 34 72 56 99Z M117 110l20-31 7-44-11-4-7 41-22 27Z')+v85Path('M13 31V9h4V2h5v26h5v15H14Z',base)+v85Path('M133 43V28h5V2h5v7h4v22l-1 12Z',base)+v85Rect(17,3,5,13,light)+v85Rect(138,3,5,13,light);
}
function v85Pattern(kit,top){
 const trim=kit.pattern||kit.trim||'#f1eee5';
 if(kit.style==='stripe')return v85Rect(72,top,16,160-top,trim);
 if(kit.style==='hoops')return [top+12,top+27,top+42].map(y=>v85Rect(8,y,144,7,trim)).join('');
 if(kit.style==='halves')return v85Rect(80,top,80,160-top,trim);
 if(kit.style==='diagonal')return v85Path(`M20 160 90 ${top}h27L49 160Z`,trim);
 if(kit.style==='pinstripes')return [37,49,61,73,85,97,109,121].map(x=>v85Rect(x,top,3,160-top,trim)).join('');
 return '';
}
v82SpriteCache.clear();
v82SpriteSVG=function(player,kit,mode='portrait'){
 if(!player?.appearance||!v61ValidAppearance(player.appearance))return '';
 const appearance=player.appearance,shirt=kit||v82NeutralKit,key=JSON.stringify([appearance,shirt,mode,player.name]);
 if(v82SpriteCache.has(key))return v82SpriteCache.get(key);
 const id=`v85-${v85Hash(key)}`,skin=v82Skin[appearance.skinTone],hair=v82Hair[appearance.hairColor],celebration=mode==='celebration';
 const torso=celebration?'M53 103 69 99l11 8 11-8 16 4 25 12-7 21-11-4v28H46v-28l-11 4-7-21Z':'M43 126 66 119l14 12 14-12 23 7 32 17-4 17H15l-4-17Z';
 const trim=shirt.pattern||shirt.trim||'#eee9de',accent=shirt.accent||trim;
 const shirtLight=v82Mix(shirt.main,'#ffffff',.13),shirtDark=v82Mix(shirt.main,'#0d1520',.32);
 const face=v85Face(appearance,skin,hair,`${id}-face`),arms=celebration?v85Arms(appearance.pose,skin,shirt):'';
 const collar=celebration?'M66 111 80 119 94 111':'M65 128 80 137 95 128';
 const label=`${celebration?'Jubelpose':'Porträt'} von ${player.name}`;
 const svg=`<svg class="v82-sprite" viewBox="0 0 160 160" role="img" aria-label="${escapeHTML(label)}" data-v85-face="${v85Hash(appearance)}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><defs><clipPath id="${id}-shirt"><path d="${torso}"/></clipPath><linearGradient id="${id}-cloth" x1="0" x2="1"><stop stop-color="${shirtLight}"/><stop offset=".55" stop-color="${shirt.main}"/><stop offset="1" stop-color="${shirtDark}"/></linearGradient></defs>${arms}<path d="${torso}" fill="url(#${id}-cloth)" stroke="#24232a" stroke-width="3"/><g clip-path="url(#${id}-shirt)">${v85Pattern(shirt,celebration?108:126)}<g opacity=".24">${v85Texture(appearance,{x:15,y:celebration?110:129,w:130,h:47},[shirtLight,shirtDark],130,'shirt')}</g>${v85Rect(celebration?35:19,celebration?117:143,25,5,accent)}${v85Rect(celebration?100:116,celebration?117:143,25,5,accent)}</g>${celebration?'<g transform="translate(18 2) scale(.775)">':''}${face}${celebration?'</g>':''}<path d="${collar}" fill="none" stroke="${trim}" stroke-width="4"/></svg>`;
 if(v82SpriteCache.size>=512)v82SpriteCache.delete(v82SpriteCache.keys().next().value);
 v82SpriteCache.set(key,svg);return svg;
};

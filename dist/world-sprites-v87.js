'use strict';

// Approved paired portraits and fixed celebration poses, with authored color layers.
const v87BaseSpriteSVG=v82SpriteSVG;
const v87PairAssets={
 a:{
  portrait:{base:'sprites/player-pair-a-portrait.png',shirt:'sprites/player-pair-a-portrait-shirt.png',trim:'sprites/player-pair-a-portrait-trim.png',skin:'sprites/player-pair-a-portrait-skin.png',hair:'sprites/player-pair-a-portrait-hair.png'},
  goal:{base:'sprites/player-pair-a-goal.png',shirt:'sprites/player-pair-a-goal-shirt.png',trim:'sprites/player-pair-a-goal-trim.png',skin:'sprites/player-pair-a-goal-skin.png',hair:'sprites/player-pair-a-goal-hair.png'}
 },
 b:{
  portrait:{base:'sprites/player-pair-b-portrait.png',shirt:'sprites/player-pair-b-portrait-shirt.png',trim:'sprites/player-pair-b-portrait-trim.png',skin:'sprites/player-pair-b-portrait-skin.png',hair:'sprites/player-pair-b-portrait-hair.png'},
  goal:{base:'sprites/player-pair-b-goal.png',shirt:'sprites/player-pair-b-goal-shirt.png',trim:'sprites/player-pair-b-goal-trim.png',skin:'sprites/player-pair-b-goal-skin.png',hair:'sprites/player-pair-b-goal-hair.png'}
 },
 c:{
  portrait:{base:'sprites/player-pair-c-portrait.png',shirt:'sprites/player-pair-c-portrait-shirt.png',trim:'sprites/player-pair-c-portrait-trim.png',skin:'sprites/player-pair-c-portrait-skin.png',hair:'sprites/player-pair-c-portrait-hair.png'},
  goal:{base:'sprites/player-pair-c-goal.png',shirt:'sprites/player-pair-c-goal-shirt.png',trim:'sprites/player-pair-c-goal-trim.png',skin:'sprites/player-pair-c-goal-skin.png',hair:'sprites/player-pair-c-goal-hair.png'}
 },
 d:{
  portrait:{base:'sprites/player-pair-d-portrait.png',shirt:'sprites/player-pair-d-portrait-shirt.png',trim:'sprites/player-pair-d-portrait-trim.png',skin:'sprites/player-pair-d-portrait-skin.png',hair:'sprites/player-pair-d-portrait-hair.png'},
  goal:{base:'sprites/player-pair-d-goal.png',shirt:'sprites/player-pair-d-goal-shirt.png',trim:'sprites/player-pair-d-goal-trim.png',skin:'sprites/player-pair-d-goal-skin.png',hair:'sprites/player-pair-d-goal-hair.png'}
 }
};
const v87PairProfiles={
 a:{...v61AuthoredFaces.a,portraitPatternY:96,goalPatternY:95},
 b:{...v61AuthoredFaces.b,portraitPatternY:93,goalPatternY:86},
 c:{...v61AuthoredFaces.c,portraitPatternY:94,goalPatternY:88},
 d:{...v61AuthoredFaces.d,portraitPatternY:112,goalPatternY:112}
};
function v87ColorMatrix(dark,light){
 const rgb=color=>[1,3,5].map(index=>parseInt(color.slice(index,index+2),16)/255);
 const low=rgb(dark),high=rgb(light);
 return low.map((value,index)=>`${(high[index]-value).toFixed(4)} 0 0 0 ${value.toFixed(4)}`).join('  ')+'  0 0 0 1 0';
}
function v87PairSpriteSVG(player,kit,mode,pair){
 const appearance=player.appearance,portrait=mode!=='celebration',view=portrait?'portrait':'goal';
 const shirt=kit||v82NeutralKit,key=JSON.stringify([appearance,shirt,mode,player.name]);
 if(v82SpriteCache.has(key))return v82SpriteCache.get(key);
 const id=`v87-${v85Hash(key)}`,skin=v82Skin[appearance.skinTone],hair=v82Hair[appearance.hairColor];
 const trim=shirt.pattern||shirt.trim||'#f1eee5',accent=shirt.accent||trim;
 const palettes={
  shirt:[v82Mix(shirt.main,'#0d1520',.42),v82Mix(shirt.main,'#ffffff',.25)],
  trim:[v82Mix(trim,'#13202b',.25),v82Mix(trim,'#ffffff',.15)],
  skin:[skin[2],skin[0]],
  hair:[hair[1],v82Mix(hair[0],'#d3aa80',.3)]
 };
 const profile=v87PairProfiles[pair],asset=name=>v87PairAssets[pair][view][name||'base'];
 const filters=Object.entries(palettes).map(([channel,[dark,light]])=>`<filter id="${id}-${channel}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${v87ColorMatrix(dark,light)}"/></filter>`).join('');
 const layers=['shirt','trim','skin','hair'].map(channel=>`<image href="${asset(channel)}" width="160" height="160" filter="url(#${id}-${channel})"/>`).join('');
 const pattern=shirt.style==='solid'?'':`<g mask="url(#${id}-shirt-mask)" opacity=".35">${v85Pattern(shirt,portrait?profile.portraitPatternY:profile.goalPatternY)}</g>`;
 const label=`${portrait?'Porträt':'Jubelpose'} von ${player.name}`;
 const svg=`<svg class="v82-sprite" viewBox="0 0 160 160" role="img" aria-label="${escapeHTML(label)}" data-v85-face="${v85Hash(appearance)}" data-v86-pose="${portrait?'portrait':appearance.pose}" data-v87-pair="${pair}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><defs>${filters}<mask id="${id}-shirt-mask" mask-type="alpha"><image href="${asset('shirt')}" width="160" height="160"/></mask></defs><image href="${asset('')}" width="160" height="160"/>${layers}${pattern}</svg>`;
 if(v82SpriteCache.size>=512)v82SpriteCache.delete(v82SpriteCache.keys().next().value);
 v82SpriteCache.set(key,svg);
 return svg;
}
v82SpriteCache.clear();
v82SpriteSVG=function(player,kit,mode='portrait'){
 const appearance=player?.appearance;
 if(appearance&&v61ValidAppearance(appearance)){
  const pair=Object.keys(v87PairProfiles).find(key=>['hairstyle','pose','faceShape','eyeBrows','nose','mouth','facialHair'].every(field=>appearance[field]===v87PairProfiles[key][field]));
  if(pair)return v87PairSpriteSVG(player,kit,mode,pair);
 }
 return v87BaseSpriteSVG(player,kit,mode);
};

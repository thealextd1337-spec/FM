'use strict';

const v86Atlas={
 buzz:['a',0],side_part:['a',1],medium_waves:['a',2],round_afro:['a',3],cornrows:['a',4],
 textured_crop:['b',0],tight_curls:['b',1],short_locs:['b',2],long_tied:['b',3],bald:['b',4]
};
const v86Rows=[0,300,600,900,1200];
function v86Image(style,mode){
 const [sheet,row]=v86Atlas[style],href=`sprites/player-atlas-${sheet}.png`;
 const portrait=mode!=='celebration',scale=portrait?160/360:160/420;
 const cropX=portrait?110:520,cropY=v86Rows[row],top=portrait?25:42;
 return `<image href="${href}" x="${(-cropX*scale).toFixed(3)}" y="${(top-cropY*scale).toFixed(3)}" width="${(1024*scale).toFixed(3)}" height="${(1536*scale).toFixed(3)}" preserveAspectRatio="none"/>`;
}
function v86ColorMask(id,channel,art){
 const values=channel==='shirt'?'-3 4 -1 0 0':channel==='skin'?'4 -3 -1 0 -.15':channel==='hair'?'-1 -1 -1 0 1.35':'1.8 1.8 1.8 0 -3.2';
 return `<filter id="${id}-${channel}-key" color-interpolation-filters="sRGB"><feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${values}" result="key"/><feComposite in="key" in2="SourceGraphic" operator="in"/></filter><mask id="${id}-${channel}-mask" mask-type="alpha" x="0" y="0" width="160" height="160"><g filter="url(#${id}-${channel}-key)">${art}</g></mask>`;
}
const v86FaceWidths={oval:1,round:1.035,square:1.065,long:.945,angular:.98};
function v86Details(appearance,skin,hair,portrait){
 if(!portrait)return '';
 const ink=v82Mix(hair[1],'#16161a',.48),shade=v82Mix(skin[2],'#362a29',.35);
 const browY=appearance.eyeBrows==='arched'?67:appearance.eyeBrows==='soft'?70:69;
 const brows=appearance.eyeBrows==='wide-set'?[59,89]:appearance.eyeBrows==='close-set'?[65,83]:[62,86];
 const brow=brows.map((x,i)=>`<path d="M${x} ${browY+(i&&appearance.eyeBrows==='arched'?1:0)}h8l3 1v2l-4-1h-7Z" fill="${ink}" opacity=".6"/>`).join('');
 const noseW=appearance.nose==='narrow'?3:appearance.nose==='broad'?7:appearance.nose==='rounded'?6:5;
 const nose=v85Rect(80-noseW/2,96,noseW,1,shade);
 const mouthW=appearance.mouth==='narrow'?8:appearance.mouth==='wide'?15:11;
 const mouth=v85Rect(80-mouthW/2,106,mouthW,1,shade);
 const beard=appearance.facialHair==='none'?'':appearance.facialHair==='stubble'?`<path d="M64 105h3v8l6 5h14l6-5v-8h3v12l-8 4H72l-8-4Z" fill="${ink}" opacity=".18"/>`:appearance.facialHair==='moustache'?v85Rect(74,102,12,2,ink):appearance.facialHair==='goatee'?v85Rect(77,115,6,5,ink):`<path d="M61 101h4v12l8 7h14l8-7v-12h4v15l-11 8H72l-11-8Z" fill="${ink}" opacity=".6"/>`;
 return brow+nose+mouth+beard;
}
const v86PoseTemplates={
 arms_wide:{file:'player-pose-arms-wide.png',height:106.667,y:53.333,cx:80,cy:88,rx:27,ry:28,dx:0,dy:4,patternY:107},
 fist_chest:{file:'player-pose-fist-chest.png',height:133.333,y:26.667,cx:62,cy:72,rx:29,ry:32,dx:-18,dy:-22,patternY:103},
 two_fingers_up:{file:'player-pose-two-fingers.png',height:106.667,y:53.333,cx:80,cy:100,rx:27,ry:27,dx:0,dy:14,patternY:117}
};
function v86Artwork(appearance,mode,id){
 const atlas=v86Image(appearance.hairstyle,mode);
 if(mode!=='celebration'||appearance.pose==='double_fists')return {art:atlas,defs:'',top:mode==='celebration'?50:30,height:mode==='celebration'?105:126,patternY:119,hairTransform:mode==='celebration'?'translate(18 45) scale(.775)':'translate(0 20)'};
 const pose=v86PoseTemplates[appearance.pose];
  const defs=`<mask id="${id}-body-mask" mask-type="alpha"><rect width="160" height="160" fill="white"/><ellipse cx="${pose.cx}" cy="${pose.cy}" rx="${pose.rx}" ry="${pose.ry}" fill="black"/></mask><clipPath id="${id}-head"><rect x="40" y="42" width="80" height="82"/></clipPath>`;
 const body=`<image href="sprites/${pose.file}" x="0" y="${pose.y}" width="160" height="${pose.height}" preserveAspectRatio="none" mask="url(#${id}-body-mask)"/>`;
 const head=`<g transform="translate(${pose.dx} ${pose.dy})"><g clip-path="url(#${id}-head)">${atlas}</g></g>`;
 return {art:body+head,defs,top:0,height:160,patternY:pose.patternY,hairTransform:`translate(${pose.dx} ${pose.dy}) translate(18 45) scale(.775)`};
}
v82SpriteCache.clear();
v82SpriteSVG=function(player,kit,mode='portrait'){
 if(!player?.appearance||!v61ValidAppearance(player.appearance))return '';
 const appearance=player.appearance,shirt=kit||v82NeutralKit,key=JSON.stringify([appearance,shirt,mode,player.name]);
 if(v82SpriteCache.has(key))return v82SpriteCache.get(key);
 const portrait=mode!=='celebration',id=`v86-${v85Hash(key)}`,skin=v82Skin[appearance.skinTone],hair=v82Hair[appearance.hairColor];
 const artwork=v86Artwork(appearance,mode,id),art=artwork.art;
 const shirtArea=portrait?'<rect x="43" y="125" width="74" height="35"/>':'<rect x="45" y="109" width="70" height="51"/>';
 const patchedArt=art;
 const hairShape=v85HairShape(appearance.hairstyle,'#fff','#fff','#fff');
 const hairTransform=artwork.hairTransform;
 const main=shirt.main,trim=shirt.pattern||shirt.trim||'#f1eee5',accent=shirt.accent||trim;
 const skinOpacity=appearance.skinTone==='fair'||appearance.skinTone==='deep'?.76:.66;
 const sx=v86FaceWidths[appearance.faceShape];
 const label=`${portrait?'Porträt':'Jubelpose'} von ${player.name}`;
 const patternTop=portrait?127:artwork.patternY;
 const svg=`<svg class="v82-sprite" viewBox="0 0 160 160" role="img" aria-label="${escapeHTML(label)}" data-v85-face="${v85Hash(appearance)}" data-v86-pose="${portrait?'portrait':appearance.pose}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><defs>${artwork.defs}<clipPath id="${id}-row"><rect x="0" y="${artwork.top}" width="160" height="${artwork.height}"/></clipPath><clipPath id="${id}-shirt-area">${shirtArea}</clipPath><clipPath id="${id}-hair-area"><g transform="${hairTransform}">${hairShape}</g></clipPath><mask id="${id}-body-alpha" mask-type="alpha">${patchedArt}</mask>${['shirt','skin','hair'].map(channel=>v86ColorMask(id,channel,patchedArt)).join('')}</defs><g clip-path="url(#${id}-row)"><g transform="translate(80 0) scale(${sx} 1) translate(-80 0)">${patchedArt}<rect width="160" height="160" fill="${skin[1]}" opacity="${skinOpacity}" mask="url(#${id}-skin-mask)"/><g clip-path="url(#${id}-hair-area)"><rect width="160" height="160" fill="${hair[0]}" opacity=".66" mask="url(#${id}-hair-mask)"/></g><rect width="160" height="160" fill="${main}" opacity=".86" mask="url(#${id}-shirt-mask)"/><g clip-path="url(#${id}-shirt-area)" mask="url(#${id}-shirt-mask)" opacity=".78">${v85Pattern(shirt,patternTop)}${v85Rect(51,patternTop,2,160-patternTop,accent)}${v85Rect(107,patternTop,2,160-patternTop,accent)}</g>${v86Details(appearance,skin,hair,portrait)}</g></g></svg>`;
 if(v82SpriteCache.size>=512)v82SpriteCache.delete(v82SpriteCache.keys().next().value);
 v82SpriteCache.set(key,svg);return svg;
};

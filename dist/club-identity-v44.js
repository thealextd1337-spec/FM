'use strict';

const v44Styles=document.createElement('style');
v44Styles.textContent=`.v44-identity h3{margin:18px 0 9px;font-size:14px}.v44-identity p{margin:0 0 9px;color:#b1c4bf;font-size:11px}.v44-kit-options,.v44-crest-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.v44-kit-options button,.v44-crest-options button{display:flex;align-items:center;justify-content:center;gap:5px;min-width:0;min-height:51px;padding:5px;border:1px solid #617573;border-radius:7px;background:#1b3033;color:#eaf2ec;font:inherit;font-size:10px;cursor:pointer}.v44-kit-options button[aria-pressed=true],.v44-crest-options button[aria-pressed=true]{border:2px solid #f0d889;background:#314338}.v44-kit-options svg{width:34px;height:37px;flex:none}.v44-kit-preview{display:flex;align-items:center;gap:5px}.v44-kit-preview svg{width:32px;height:35px}.club-crest.club-crest-svg{display:block;width:54px;height:62px;padding:0;border:0;border-radius:0;background:none;box-shadow:none}.v44-keeper-shirt{position:absolute;z-index:4;left:50%;bottom:3px;width:48px;height:51px;transform:translateX(-50%);filter:drop-shadow(1px 4px 2px #0009)}.v42-goal-scene.save .v44-keeper-shirt{animation:v42KeeperSave .7s ease-out both}.v44-keeper-shirt svg{width:100%;height:100%}@media(max-width:600px){.v44-kit-options button{flex-direction:column;font-size:9px;min-height:63px}.club-crest.club-crest-svg{width:46px;height:53px}}@media(prefers-reduced-motion:reduce){.v42-goal-scene.save .v44-keeper-shirt{animation:none;transform:translateX(calc(-50% + var(--shot-x))) rotate(var(--dive-angle))}}`;
document.head.append(v44Styles);
v44Styles.textContent+='#club-form>.v44-identity{margin-bottom:16px}';
v44Styles.textContent+=`#club-form .color-choices{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}#club-form .color-choices label{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-width:0;min-height:70px;padding:8px 4px;text-align:center;font-size:11px}#club-form .color-choices input{float:none;width:56px;max-width:100%;height:29px;cursor:pointer}#club-form .identity-preview{gap:12px;min-height:78px;margin:12px 0;padding:10px 12px}#club-form .identity-preview>div{flex:1;min-width:0;gap:2px}#club-form .identity-preview b{font-size:14px;overflow-wrap:anywhere}#club-form .v44-preview-kits{display:flex;align-items:center;gap:10px}#club-form .v44-preview-kits>span{display:flex;flex-direction:column;align-items:center;gap:0;min-width:44px;color:#b9cac2;font-size:10px}#club-form .v44-preview-kits .v44-kit-preview{display:block}#club-form .v44-preview-kits svg{width:29px;height:31px}`;
v44Styles.textContent+=`.v42-goal-scene:is(.goal,.save,.wide,.high) .v44-keeper-shirt{animation:v42KeeperDive .75s ease-out both}@media(prefers-reduced-motion:reduce){.v42-goal-scene:is(.goal,.save,.wide,.high) .v44-keeper-shirt{animation:none;transform:translateX(calc(-50% + var(--dive-x))) rotate(var(--dive-angle))}}`;

const v44Designs=[['solid','Einfarbig'],['stripe','Mittelstreifen'],['hoops','Querstreifen'],['halves','Zweifarbig'],['diagonal','Diagonal'],['pinstripes','Nadelstreifen']];
const v44Shapes=[['circle','Kreis'],['shield','Schild'],['square','Viereck']];
const v44Decorations=[['none','Pur'],['stripe','Streifen'],['chevron','Winkel']];
const v44Choice={home:'solid',away:'halves',shape:'shield',decoration:'stripe'};
let v44ShirtId=0;
function v44Valid(value,options,fallback){return options.some(item=>item[0]===value)?value:fallback}
function v44Kit(main,trim,style,accent){const kit={main:safeColor(main,'#c7f36b'),trim:safeColor(trim,'#142629'),style:v44Valid(style,v44Designs,'solid')};if(accent)kit.accent=safeColor(accent,'#f0d889');return kit}
function v44ShirtSVG(player,kit,label='Trikot'){
 kit=v44Kit(kit?.main,kit?.trim,kit?.style,kit?.accent);const id=`v44-kit-${++v44ShirtId}`,shape='M18 11 29 4h22l11 7 14 14-10 15-9-5v43H23V35l-9 5L4 25z',pattern={solid:'',stripe:`<path d="M32 4h16v74H32z" fill="${kit.trim}"/>`,hoops:`<path d="M10 23h60v11H10zm13 19h34v11H23zm0 19h34v10H23z" fill="${kit.trim}"/>`,halves:`<path d="M40 0h40v85H40z" fill="${kit.trim}"/>`,diagonal:`<path d="M-7 65 60 0l18 16L12 82z" fill="${kit.trim}"/>`,pinstripes:[28,36,44,52].map(x=>`<path d="M${x} 4h3v74h-3z" fill="${kit.trim}"/>`).join('')}[kit.style];
 const accent=kit.accent?`<path d="M7 25 19 11l6 5-13 17zm66 0L61 11l-6 5 13 17zM23 71h34v5H23z" fill="${kit.accent}"/>`:'';
 const number=player?.n==null?'':`<text x="40" y="52" fill="#fff" stroke="#102126" stroke-width="3" paint-order="stroke" font-family="Arial,sans-serif" font-weight="800" font-size="26" text-anchor="middle">${Number(player.n)||1}</text>`;
 return`<svg viewBox="0 0 80 85" role="img" aria-label="${escapeHTML(label)}"><defs><clipPath id="${id}"><path d="${shape}"/></clipPath></defs><path d="${shape}" fill="${kit.main}"/><g clip-path="url(#${id})">${pattern}${accent}</g><path d="${shape}" fill="none" stroke="${kit.trim}" stroke-width="4" stroke-linejoin="round"/><path d="M31 5Q40 16 49 5" fill="none" stroke="${kit.trim}" stroke-width="3"/>${number}</svg>`;
}
function v44Crest(name,kits){
 const crest=kits?.crest||{},shape=v44Valid(crest.shape,v44Shapes,'shield'),decoration=v44Valid(crest.decoration,v44Decorations,'stripe'),main=safeColor(kits?.primary,'#c7f36b'),trim=safeColor(kits?.secondary,'#142629');
 const paths={circle:'M40 4a31 31 0 1 1 0 62 31 31 0 1 1 0-62',shield:'M10 7h60v36q-2 23-30 33Q12 66 10 43z',square:'M10 7h60v65H10z'};
 const decor=decoration==='stripe'?`<path d="M26 8v58m28-58v58" stroke="${trim}" stroke-width="5" opacity=".85"/>`:decoration==='chevron'?`<path d="m10 30 30 19 30-19" fill="none" stroke="${trim}" stroke-width="8"/>`:'';
 return`<svg class="club-crest club-crest-svg" viewBox="0 0 80 82" role="img" aria-label="Vereinswappen ${escapeHTML(name)}"><path d="${paths[shape]}" fill="${main}" stroke="${trim}" stroke-width="5"/>${decor}<text x="40" y="47" text-anchor="middle" dominant-baseline="middle" fill="#fff" stroke="#102126" stroke-width="3" paint-order="stroke" font-family="Arial,sans-serif" font-size="24" font-weight="800">${escapeHTML(clubInitials(name))}</text></svg>`;
}
crestHTML=v44Crest;
kitHTML=function(kit,label){return`<span class="v44-kit-preview" role="img" aria-label="${escapeHTML(label)}">${v44ShirtSVG(null,kit,label)}</span>`};

const v44OriginalMakeWorld=makeWorld;
function v44Tertiary(){return safeColor($('#club-tertiary')?.value,'#f0d889')}
makeWorld=function(primary,secondary,completeHistory){const world=v44OriginalMakeWorld(primary,secondary,completeHistory),kits=world.kits,tertiary=v44Tertiary();kits.tertiary=tertiary;kits.home=v44Kit(kits.primary,kits.secondary,v44Choice.home,tertiary);kits.away=v44Kit(kits.secondary,tertiary,v44Choice.away,kits.primary);kits.crest={shape:v44Choice.shape,decoration:v44Choice.decoration};return world};
const v44OriginalPreview=updateIdentityPreview;
updateIdentityPreview=function(){v44OriginalPreview();const name=$('#club-name').value.trim()||'Dein Verein',kits=makeKits($('#club-primary').value,$('#club-secondary').value),tertiary=v44Tertiary();kits.home=v44Kit(kits.primary,kits.secondary,v44Choice.home,tertiary);kits.away=v44Kit(kits.secondary,tertiary,v44Choice.away,kits.primary);kits.crest={shape:v44Choice.shape,decoration:v44Choice.decoration};$('#identity-preview').innerHTML=`${crestHTML(name,kits)}<div><b>${escapeHTML(name)}</b><span class="v44-preview-kits"><span>${kitHTML(kits.home,'Heimtrikot')}Heim</span><span>${kitHTML(kits.away,'Auswärtstrikot')}Auswärts</span></span></div>`};
const v44Section=document.createElement('section');v44Section.className='v44-identity';
v44Section.innerHTML=`<h3>Heimtrikot</h3><p>Wähle eines von sechs Mustern.</p><div class="v44-kit-options" data-v44-group="home"></div><h3>Auswärtstrikot</h3><div class="v44-kit-options" data-v44-group="away"></div><h3>Vereinslogo</h3><p>Form und Verzierung verwenden deine Vereinsfarben.</p><div class="v44-crest-options" data-v44-group="shape"></div><div class="v44-crest-options" data-v44-group="decoration"></div>`;
colorFields.insertAdjacentElement('afterend',v44Section);
function v44RenderChoices(){
 const main=$('#club-primary').value,trim=$('#club-secondary').value,tertiary=v44Tertiary();
 for(const group of['home','away'])v44Section.querySelector(`[data-v44-group="${group}"]`).innerHTML=v44Designs.map(([key,label])=>`<button type="button" data-v44-choice="${group}:${key}" aria-pressed="${v44Choice[group]===key}">${v44ShirtSVG(null,group==='home'?v44Kit(main,trim,key,tertiary):v44Kit(trim,tertiary,key,main),label)}<span>${label}</span></button>`).join('');
 for(const[group,items]of[['shape',v44Shapes],['decoration',v44Decorations]])v44Section.querySelector(`[data-v44-group="${group}"]`).innerHTML=items.map(([key,label])=>`<button type="button" data-v44-choice="${group}:${key}" aria-pressed="${v44Choice[group]===key}">${label}</button>`).join('');
 updateIdentityPreview();
}
v44Section.addEventListener('click',event=>{const choice=event.target.closest('[data-v44-choice]')?.dataset.v44Choice;if(!choice)return;const[group,key]=choice.split(':'),options=group==='home'||group==='away'?v44Designs:group==='shape'?v44Shapes:v44Decorations;if(v44Valid(key,options,null)==null)return;v44Choice[group]=key;v44RenderChoices()});
for(const id of['#club-primary','#club-secondary','#club-tertiary'])$(id).addEventListener('input',v44RenderChoices);
$$('[data-colors]').forEach(button=>button.addEventListener('click',v44RenderChoices));
v44RenderChoices();

function v44Accent(hex){const colour=safeColor(hex,'#c7f36b');if(luminance(colour)>=.24)return colour;let mix=.2,ready=colour;while(luminance(ready)<.24&&mix<=.85){ready='#'+[1,3,5].map(index=>Math.round(parseInt(colour.slice(index,index+2),16)*(1-mix)+255*mix).toString(16).padStart(2,'0')).join('');mix+=.08}return ready}
const v44OriginalApplyTheme=applyClubTheme;
applyClubTheme=function(){v44OriginalApplyTheme();if(!activeSave)return;const accent=v44Accent(currentKits().primary);document.documentElement.style.setProperty('--club-primary',accent);document.documentElement.style.setProperty('--club-text',luminance(accent)>.18?'#102126':'#ffffff')};

const v44OriginalDraw=draw;
draw=function(){v44OriginalDraw();if(!match?.people?.length)return;const ctx=$('#canvas').getContext('2d');for(const player of match.people){const kit=player.keeper?(player.t===0?match.kits?.userKeeper:match.kits?.opponentKeeper):matchKit(player.t);if(!kit||(kit.style==='solid'||!kit.style)&&!kit.accent)continue;const x=player.x*600,y=player.y*740;ctx.save();ctx.beginPath();ctx.arc(x,y,17,0,Math.PI*2);ctx.clip();ctx.fillStyle=kit.trim;if(kit.style==='stripe')ctx.fillRect(x-7,y-18,14,36);if(kit.style==='hoops')for(const offset of[-10,0,10])ctx.fillRect(x-18,y+offset,36,5);if(kit.style==='halves')ctx.fillRect(x,y-18,18,36);if(kit.style==='diagonal'){ctx.save();ctx.translate(x,y);ctx.rotate(-Math.PI/4);ctx.fillRect(-7,-25,14,50);ctx.restore()}if(kit.style==='pinstripes')for(const offset of[-10,-4,2,8])ctx.fillRect(x+offset,y-18,2,36);if(kit.accent){ctx.fillStyle=kit.accent;ctx.fillRect(x-18,y-15,36,3)}ctx.restore();ctx.fillStyle='#fff';ctx.strokeStyle='#102126';ctx.lineWidth=2;ctx.font='bold 15px Arial';ctx.textAlign='center';ctx.strokeText(String(player.n),x,y+6);ctx.fillText(String(player.n),x,y+6)}};

const v44OriginalScene=v42SceneHTML;
v42SceneHTML=function(session){let html=v44OriginalScene(session);const next=v42UpcomingShooter(session),last=session.last,side=last?.side??next?.side??0,defending=1-side,defender=(defending===0?session.own:session.opponent).find(player=>player.keeper),defenderKit=v44PenaltyKeeperKit(session,defending),shooter=(side===0?session.own:session.opponent).find(player=>player.n===(last?.number??next?.player?.n));html=html.replace(/<span class="v42-keeper">[^<]*<\/span>/,`<span class="v44-keeper-shirt">${v44ShirtSVG(defender,defenderKit,'Torwarttrikot')}</span>`);if(shooter?.keeper)html=html.replace(/(<div class="v42-shooter">)<svg[\s\S]*?<\/svg>/,`$1${v44ShirtSVG(shooter,v44PenaltyKeeperKit(session,side),'Torwarttrikot')}`);return html};
function v44PenaltyKeeperKit(session,side){if(session.keeperKits?.[side])return session.keeperKits[side];if(session.mode==='career'){const keeper=side===0?activeSave?.world?.kits?.keeper:activeOpponent()?.kits?.keeper;if(keeper)return keeper}const colour=side===0?session.ownColour:session.opponentColour;return{main:luminance(colour.main)<.45?'#e7b957':'#313d68',trim:'#f5f3e7',style:'stripe'}}
const v44OriginalShirt=v42Shirt;
v42Shirt=function(player,colour){return v44ShirtSVG(player,colour,player.keeper?'Torwarttrikot':'Spielertrikot')};

const v44OriginalPenaltyRender=v42RenderScreen;
v42RenderScreen=function(openDialog=false){v44OriginalPenaltyRender(openDialog);const arena=v42Screen.querySelector('.v42-arena');if(arena&&v42Session){arena.style.setProperty('--v42-own',v44Accent(v42Session.ownColour.main));arena.style.setProperty('--v42-opp',v44Accent(v42Session.opponentColour.main))}};
const v44OriginalRenderCenter=renderCenter;
renderCenter=function(){const result=v44OriginalRenderCenter();const label=clubCenter.querySelector('footer span:first-child');if(label)label.textContent='Doppel 6 / PROTOTYP 44';return result};
startScreen.querySelector('footer').textContent='Doppel 6 / PROTOTYP 44';

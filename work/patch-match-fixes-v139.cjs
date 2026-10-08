const fs=require('fs');
const file='dist/player-user-motion-v108.js';let s=fs.readFileSync(file,'utf8');
function edit(a,b){if(!s.includes(a))throw Error(a);s=s.replace(a,b)}
edit('  // Preserve the displayed idle turn when playback is paused.',`  // Let feet settle into fresh contacts while the hips turn in place.
  state.idleTurning=!person.keeper&&!special&&!celebrating&&!carrying&&speed<.25&&idleHeading!==null;
  // Preserve the displayed idle turn when playback is paused.`);
edit('  let pelvis=0;','  if(state.idleTurning)for(const f of feet){f.locked=false;f.blocked=false;f.age=0}\n  let pelvis=0;');
edit('if(!f.locked&&(confidence(i)<.5','if(state.idleTurning||!f.locked&&(confidence(i)<.5');
edit('if(!f.locked&&!f.blocked&&want&&(!live||delta))','if(!state.idleTurning&&!f.locked&&!f.blocked&&want&&(!live||delta))');
fs.writeFileSync(file,s);
const ui='dist/world-match-ui-v64.js';s=fs.readFileSync(ui,'utf8');
edit('<div class="v64-zone-guide" aria-hidden="true"><div class="v64-zone-line v64-zone-mid"><b>MITTELFELD</b></div><div class="v64-zone-line v64-zone-def"><b>VERTEIDIGUNG</b></div></div>','<div class="v64-zone-guide"><div class="v64-zone-line v64-zone-mid" aria-hidden="true"></div><div class="v64-zone-line v64-zone-def" aria-hidden="true"></div><span class="v64-zone-name v64-zone-attack">ANGRIFF</span><span class="v64-zone-name v64-zone-midfield">MITTELFELD</span><span class="v64-zone-name v64-zone-defence">VERTEIDIGUNG</span></div>');
fs.writeFileSync(ui,s);
fs.appendFileSync('dist/world-start-v61.css',`\n/* Names belong inside their zone, separately from the zone boundaries. */
.v64-zone-name{position:absolute;left:50%;transform:translateX(-50%);padding:3px 5px;border-radius:3px;background:#15352fe6;color:#fff;font-size:10px;font-weight:800;letter-spacing:.35px;line-height:1.2;white-space:nowrap}
.v64-zone-attack{top:3px}.v64-zone-midfield{top:calc(28.5714% + 3px)}.v64-zone-defence{top:calc(71.4286% + 3px)}
@media (min-width:900px),(min-width:600px) and (orientation:landscape){.v64-zone-name{top:3px}.v64-zone-defence{left:14.2857%}.v64-zone-midfield{left:50%}.v64-zone-attack{left:85.7143%}}
`);

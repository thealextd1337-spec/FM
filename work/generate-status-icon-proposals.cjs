'use strict';

// Review-only concepts. This script does not change the shipped game icons.
const fs = require('node:fs');
const path = require('node:path');

const out = path.join(__dirname, '..', 'docs');
const states = [
  {id:'excellent',name:'Sehr gut',color:'#EE6C64',mouth:'M10 22 Q18 29 26 22',pupil:[1,-1],brow:''},
  {id:'good',name:'Gut',color:'#F5A45B',mouth:'M11 23 Q18 27 25 23',pupil:[1,-.5],brow:''},
  {id:'normal',name:'Normal',color:'#86CF99',mouth:'M12 24 H24',pupil:[0,0],brow:''},
  {id:'poor',name:'Schwach',color:'#80B6EC',mouth:'M11 26 Q18 21 25 26',pupil:[1,1],brow:''},
  {id:'terrible',name:'Sehr schwach',color:'#B3A5C9',mouth:'M10 27 Q18 18 26 27',pupil:[0,1.5],brow:'<path d="M10 11l5 1M21 12l5-1"/>'},
];
const fatigue = [
  {name:'Frisch',short:'frisch',range:'88–100',value:100,cap:0},
  {name:'Einsatzbereit',short:'bereit',range:'72–87',value:80,cap:1},
  {name:'Leicht müde',short:'leicht',range:'52–71',value:60,cap:2},
  {name:'Müde',short:'müde',range:'32–51',value:40,cap:3},
  {name:'Erschöpft',short:'erschöpft',range:'0–31',value:20,cap:4},
];
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const text = (x,y,value,cls,other='') => `<text x="${x}" y="${y}" class="${cls}" ${other}>${esc(value)}</text>`;
const round = n => Number(n.toFixed(1));

function face(s,kind,x,y,size=36){
  const scale=size/36;
  const ink=kind==='a'?'#10262A':'#F5F6F0';
  const pupils=[13,23].map(cx=>`<circle cx="${cx+s.pupil[0]}" cy="${16+s.pupil[1]}" r="1.7" fill="${ink}"/>`).join('');
  const under=kind==='a'
    ? `<circle cx="18" cy="18" r="16" fill="${s.color}" stroke="#10262A" stroke-width="1.3"/><path d="M8 8Q13 3 19 4" fill="none" stroke="#FFFFFF" stroke-opacity=".42" stroke-width="1.3" stroke-linecap="round"/>`
    : `<circle cx="18" cy="18" r="15.5" fill="#10262A" stroke="${s.color}" stroke-width="3.8"/><path d="M8 8Q12 5 17 5" fill="none" stroke="${s.color}" stroke-width="1.2" stroke-linecap="round"/>`;
  const mark=kind==='b'?`<circle cx="30" cy="29" r="3.2" fill="${s.color}" stroke="#10262A" stroke-width="1.2"/>`:'';
  return `<g transform="translate(${round(x)} ${round(y)}) scale(${round(scale)})">${under}`+
    `<g fill="none" stroke="${ink}" stroke-width="1.7" stroke-linecap="round">${s.brow}</g>`+
    `<ellipse cx="13" cy="16" rx="3.1" ry="3.9" fill="${kind==='a'?'#F8F8F2':'#405659'}" opacity="${kind==='a'?'.45':'.75'}"/>`+
    `<ellipse cx="23" cy="16" rx="3.1" ry="3.9" fill="${kind==='a'?'#F8F8F2':'#405659'}" opacity="${kind==='a'?'.45':'.75'}"/>`+
    pupils+`<path d="${s.mouth}" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>${mark}</g>`;
}
function bar(x,y,value,w=92){
  const p=Math.max(0,Math.min(100,value));
  return `<g transform="translate(${round(x)} ${round(y)})"><rect width="${w}" height="11" rx="5.5" fill="#415558"/>`+
    `<rect x="1.5" y="1.5" width="${round((w-3)*p/100)}" height="8" rx="4" fill="#A3E4D4"/>`+
    `<path d="M${round(w*.25)} 2.5v6M${round(w*.5)} 2.5v6M${round(w*.75)} 2.5v6" stroke="#10262A" stroke-opacity=".32" stroke-width="1"/>`+
    `</g>`;
}
function svg(width,height,content,label){
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}">`+
  `<title>${esc(label)}</title><style>text{font-family:Arial,Helvetica,sans-serif;fill:#F1F6F2}.title{font-size:27px;font-weight:800}.subtitle{font-size:15px;fill:#B5CCC5}.head{font-size:19px;font-weight:700}.state{font-size:17px;font-weight:700}.caption{font-size:14px;fill:#B5CCC5}.small{font-size:13px;fill:#B5CCC5}.matrix-head{font-size:16px;font-weight:700}.matrix-cell{font-size:12px;fill:#C3D8D1}</style>`+
  `<rect width="${width}" height="${height}" rx="18" fill="#14282C"/>${content}</svg>\n`;
}

let rows='';
states.forEach((state,i)=>{
  const y=142+i*77;
  rows+=`<rect x="28" y="${y-28}" width="984" height="66" rx="12" fill="${i%2?'#1A3437':'#1A3033'}"/>`;
  rows+=face(state,'a',48,y-17,36)+text(99,y+5,state.name,'state')+bar(218,y-3,fatigue[i].value,110);
  rows+=text(338,y+6,`${fatigue[i].value}%`,'caption');
  rows+=face(state,'b',557,y-17,36)+text(608,y+5,state.name,'state')+bar(728,y-3,fatigue[i].value,110);
  rows+=text(848,y+6,`${fatigue[i].value}%`,'caption');
});
const intro=text(30,47,'Status-Icons: Variante A gewählt','title')+
  text(30,76,'Gleiche Bedeutung. Mimik, Blick und Farbe sind auch ohne Pfeile unterscheidbar.','subtitle')+
  text(48,113,'A  ·  Farbige Gesichter','head')+text(557,113,'B  ·  Alternative','head')+
  `<path d="M529 108V512" stroke="#40585A"/>`;
const footer=`<path d="M30 536H1010" stroke="#40585A"/>`+
  text(30,561,'Im Spiel sinkt der Balken stufenlos; hier sind fünf Beispielstände zu sehen.','caption')+
  text(30,583,'A ist aus der Distanz schneller lesbar. B ist ruhiger und fügt sich enger in das dunkle UI ein.','caption');
const pitchExample=(kind,x)=>`<rect x="${x}" y="638" width="449" height="94" rx="9" fill="#215748" stroke="#477766"/>`+
  `<path d="M${x+90} 639v92M${x+180} 639v92M${x+270} 639v92M${x+360} 639v92" stroke="#9AC9AC" stroke-opacity=".16"/>`+
  `<rect x="${x+185}" y="644" width="80" height="82" rx="6" fill="#2C6953" stroke="#C0DB92" stroke-opacity=".7"/>`+
  `<circle cx="${x+225}" cy="668" r="13" fill="#13292B" stroke="#F1F7F2" stroke-width="1.5"/>`+
  text(x+225,674,'9','state','text-anchor="middle"')+
  face(states[1],kind,x+241,651,25)+
  text(x+225,698,'ANG','small','text-anchor="middle"')+
  text(x+225,712,'ELIA SCH…','small','text-anchor="middle"')+
  bar(x+193,718,80,64);
const pitchTitle=text(48,624,'So sitzt das Gesicht direkt am Spieler im Aufstellungsraster','head');
const pitchNote=text(48,757,'Variante A sitzt direkt am Spieler; der Balken steht zusätzlich in den Statuslisten.','caption');
fs.writeFileSync(path.join(out,'status-icon-proposals.svg'),svg(1040,780,intro+rows+footer+pitchTitle+pitchExample('a',48)+pitchExample('b',557)+pitchNote,'Zwei neue Vorschläge für Formgesichter und Müdigkeitsbalken mit Beispiel im Aufstellungsraster'), 'utf8');

let matrix=text(32,48,'Form × Müdigkeit: welches Icon erscheint?','title')+
 text(32,76,'Jede Zelle zeigt das wirksame Gesicht und den zugehörigen Frischebalken.','subtitle');
fatigue.forEach((f,j)=>{
 const x=224+j*170;
 matrix+=text(x+8,125,f.name,'matrix-head')+text(x+8,147,`${f.range} Frische`,'small');
});
states.forEach((base,i)=>{
 const y=170+i*93;
 matrix+=`<rect x="30" y="${y}" width="1020" height="84" rx="10" fill="${i%2?'#1B3437':'#1A3033'}"/>`;
 matrix+=text(45,y+37,base.name,'state')+text(45,y+59,`Grundform ${['+2','+1','0','−1','−2'][i]}`,'small');
 fatigue.forEach((f,j)=>{
  const x=224+j*170,shown=states[Math.max(i,f.cap)];
  matrix+=face(shown,'a',x+7,y+15,36)+bar(x+49,y+27,f.value,77);
  matrix+=text(x+7,y+70,shown.name,'matrix-cell');
 });
});
matrix+=text(32,668,'Beispiel: Sehr gute Grundform + müde Frische → blaues, schwaches Gesicht mit 2/5 Balken.','caption')+
 text(32,690,'Die Frische begrenzt die Form. Sie verbessert eine schlechte Grundform nicht.','caption');
fs.writeFileSync(path.join(out,'status-icon-matrix.svg'),svg(1080,716,matrix,'Tabelle der 25 Kombinationen aus Form und Müdigkeit'), 'utf8');

console.log('Zwei SVG-Vorschauen in docs/ erstellt. Das Spiel wurde nicht geändert.');

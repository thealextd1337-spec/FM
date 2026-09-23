'use strict';

const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const iconDir=path.join(root,'dist','icons');
fs.mkdirSync(iconDir,{recursive:true});

// Variante A: ein vollflächiges Gesicht, dessen Mimik und Blick auch ohne Farbe lesbar sind.
const formStates=[
 {id:'very-good',label:'Sehr gut',color:'#F26BB5',mouth:'M10 22 Q18 29 26 22',pupil:[1,-1],brow:''},
 {id:'good',label:'Gut',color:'#F3A14A',mouth:'M11 23 Q18 27 25 23',pupil:[1,-.5],brow:''},
 {id:'normal',label:'Normal',color:'#E9CF59',mouth:'M12 24 H24',pupil:[0,0],brow:''},
 {id:'weak',label:'Schwach',color:'#91AEC4',mouth:'M11 26 Q18 21 25 26',pupil:[1,1],brow:''},
 {id:'very-weak',label:'Sehr schwach',color:'#A398B8',mouth:'M10 27 Q18 18 26 27',pupil:[0,1.5],brow:'<path d="M10 11l5 1M21 12l5-1"/>'}
];
const freshnessStates=[
 {id:'fresh',label:'Frisch',percent:100},
 {id:'ready',label:'Einsatzbereit',percent:80},
 {id:'slightly-tired',label:'Leicht müde',percent:60},
 {id:'tired',label:'Müde',percent:40},
 {id:'exhausted',label:'Erschöpft',percent:20}
];
function faceDrawing(state){
 const ink='#10262A';
 const pupils=[13,23].map(cx=>`<circle cx="${cx+state.pupil[0]}" cy="${16+state.pupil[1]}" r="1.7" fill="${ink}"/>`).join('');
 return `<circle cx="18" cy="18" r="16" fill="${state.color}" stroke="${ink}" stroke-width="1.3"/>`+
  '<path d="M8 8Q13 3 19 4" fill="none" stroke="#FFF" stroke-opacity=".42" stroke-width="1.3" stroke-linecap="round"/>'+
  `<g fill="none" stroke="${ink}" stroke-width="1.7" stroke-linecap="round">${state.brow}</g>`+
  '<ellipse cx="13" cy="16" rx="3.1" ry="3.9" fill="#F8F8F2" opacity=".45"/>'+
  '<ellipse cx="23" cy="16" rx="3.1" ry="3.9" fill="#F8F8F2" opacity=".45"/>'+
  pupils+`<path d="${state.mouth}" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`;
}
function barDrawing(state,color){
 return '<rect width="92" height="11" rx="5.5" fill="#415558"/>'+
  `<rect x="1.5" y="1.5" width="${(89*state.percent/100).toFixed(1)}" height="8" rx="4" fill="${color}"/>`+
  '<path d="M23 2.5v6M46 2.5v6M69 2.5v6" stroke="#10262A" stroke-opacity=".32" stroke-width="1"/>';
}
function iconSvg(width,height,label,drawing){
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${label}"><title>${label}</title>${drawing}</svg>`;
}
for(const state of formStates)fs.writeFileSync(path.join(iconDir,`form-${state.id}.svg`),iconSvg(36,36,`Form: ${state.label}`,faceDrawing(state))+'\n');
for(const [index,state] of freshnessStates.entries())fs.writeFileSync(path.join(iconDir,`freshness-${state.id}.svg`),iconSvg(92,11,`Frische: ${state.label}`,barDrawing(state,formStates[index].color))+'\n');

// Der veröffentlichte Build enthält alle Grafiken direkt in einer HTML-Datei.
const dataUri=svg=>`data:image/svg+xml,${encodeURIComponent(svg)}`;
const faces=Object.fromEntries(formStates.map(state=>[state.id,dataUri(iconSvg(36,36,`Form: ${state.label}`,faceDrawing(state)))]));
const bars=Object.fromEntries(freshnessStates.map((state,index)=>[state.id,dataUri(iconSvg(92,11,`Frische: ${state.label}`,barDrawing(state,formStates[index].color)))]));
fs.writeFileSync(path.join(root,'dist','status-icons-v51.js'),`'use strict';\nconst v51StatusFaces=${JSON.stringify(faces)};\nconst v51StatusBars=${JSON.stringify(bars)};\n`);

const previewRows=formStates.map((state,index)=>{
 const y=103+index*60;
 return `<g transform="translate(36 ${y})">${faceDrawing(state)}</g>`+
  `<text x="89" y="${y+24}" class="label">${state.label}</text>`+
  `<g transform="translate(268 ${y+13})">${barDrawing(freshnessStates[index],state.color)}</g>`+
  `<text x="378" y="${y+24}" class="label">${freshnessStates[index].label}</text>`;
}).join('');
const preview=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" role="img" aria-label="Gewählte Status-Icons, Variante A"><title>Form und Frische · Variante A</title><style>text{font-family:Arial,sans-serif;fill:#F1F6F2}.heading{font-size:24px;font-weight:700}.label{font-size:17px}.note{font-size:13px;fill:#B5CCC5}</style><rect width="600" height="450" rx="14" fill="#14282C"/><text x="36" y="44" class="heading">Form und Frische · Variante A</text><text x="36" y="76" class="note">Farbige Gesichter; im Spiel fließt der Balken stufenlos.</text>${previewRows}<text x="36" y="425" class="note">Mimik und Blick unterscheiden die Stufen auch ohne Farbe.</text></svg>\n`;
fs.writeFileSync(path.join(root,'docs','status-icons-preview.svg'),preview);
console.log('Variante A: fünf Gesichter, fünf Balkenbeispiele und Laufzeitdaten erzeugt.');

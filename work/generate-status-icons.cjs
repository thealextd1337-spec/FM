'use strict';

// Original, small SVG icons for the planned form and freshness display.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const iconDir = path.join(root, 'dist', 'icons');
fs.mkdirSync(iconDir, {recursive: true});

const formStates = [
  {id: 'very-good', label: 'Sehr gut', color: '#F17470', mouth: 'M7 14v2h2v2h6v-2h2v-2', eyes: 'M8 8h3v3H8ZM16 8h3v3h-3Z', brows: '', direction: 'up-right'},
  {id: 'good', label: 'Gut', color: '#F3A45E', mouth: 'M8 15v1h2v1h4v-1h2v-1', eyes: 'M8 9h3v3H8ZM16 9h3v3h-3Z', brows: '', direction: 'up-right'},
  {id: 'normal', label: 'Normal', color: '#8ED49D', mouth: 'M8 17h8', eyes: 'M7 10h3v3H7ZM15 10h3v3h-3Z', brows: '', direction: 'straight'},
  {id: 'weak', label: 'Schwach', color: '#76AFE0', mouth: 'M8 18v-1h2v-1h4v1h2v1', eyes: 'M8 11h3v3H8ZM16 11h3v3h-3Z', brows: '', direction: 'down-right'},
  {id: 'very-weak', label: 'Sehr schwach', color: '#AA9CC5', mouth: 'M7 18v-2h2v-2h6v2h2v2', eyes: 'M7 11h3v3H7ZM15 11h3v3h-3Z', brows: '<path d="M7 8h4M14 8h4" stroke="#142326" stroke-width="2"/>', direction: 'down'},
];

const freshnessStates = [
  {id: 'fresh', label: 'Frisch', segments: 5},
  {id: 'ready', label: 'Einsatzbereit', segments: 4},
  {id: 'slightly-tired', label: 'Leicht müde', segments: 3},
  {id: 'tired', label: 'Müde', segments: 2},
  {id: 'exhausted', label: 'Erschöpft', segments: 1},
];

const directionPaths = {
  'up-right': 'M26 14L31 9M27 9h4v4',
  straight: 'M26 12h5m-2-2 2 2-2 2',
  'down-right': 'M26 10l5 5m-4 0h4v-4',
  down: 'M28 8v8m-2-2 2 2 2-2',
};

function faceDrawing(state) {
  return `<path d="M6 1h12v2h3v3h2v12h-2v3h-3v2H6v-2H3v-3H1V6h2V3h3Z" fill="#0B1C20"/>` +
    `<path d="M6 3h12v2h3v13h-3v3H6v-3H3V6h3Z" fill="${state.color}"/>` +
    '<path d="M6 4h8v2H6Z" fill="#FFF" opacity=".23"/>' +
    state.brows +
    `<path d="${state.eyes}" fill="#142326"/>` +
    `<path d="${state.mouth}" fill="none" stroke="#142326" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"/>` +
    `<path d="${directionPaths[state.direction]}" fill="none" stroke="${state.color}" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"/>`;
}

function freshnessDrawing(state) {
  const blocks = Array.from({length: 5}, (_, index) =>
    `<rect x="${7 + index * 8}" y="6" width="6" height="8" fill="${index < state.segments ? '#8DD8CC' : '#4B6562'}"/>`
  ).join('');
  return '<path d="M3 2h47v3h3v10h-3v3H3Z" fill="#0B1C20"/>' +
    '<rect x="5" y="4" width="43" height="12" fill="#27433F"/>' + blocks +
    '<path d="M50 7h4v6h-4Z" fill="#78958D"/>';
}

function saveIcon(fileName, width, height, label, drawing) {
  const svg = iconSvg(width, height, label, drawing) + '\n';
  fs.writeFileSync(path.join(iconDir, fileName), svg, 'utf8');
}
function iconSvg(width, height, label, drawing) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${label}" shape-rendering="crispEdges"><title>${label}</title>${drawing}</svg>`;
}

for (const state of formStates) saveIcon(`form-${state.id}.svg`, 32, 24, `Form: ${state.label}`, faceDrawing(state));
for (const state of freshnessStates) saveIcon(`freshness-${state.id}.svg`, 56, 20, `Frische: ${state.label}`, freshnessDrawing(state));

// The shipped game is a single HTML file, so it also needs self-contained icons.
const dataUri = svg => `data:image/svg+xml,${encodeURIComponent(svg)}`;
const faces = Object.fromEntries(formStates.map(state => [state.id, dataUri(iconSvg(32, 24, `Form: ${state.label}`, faceDrawing(state)))]));
const bars = Object.fromEntries(freshnessStates.map(state => [state.id, dataUri(iconSvg(56, 20, `Frische: ${state.label}`, freshnessDrawing(state)))]));
fs.writeFileSync(path.join(root, 'dist', 'status-icons-v51.js'), `'use strict';\nconst v51StatusFaces=${JSON.stringify(faces)};\nconst v51StatusBars=${JSON.stringify(bars)};\n`, 'utf8');

const formSymbols = formStates.map(state => `<symbol id="form-${state.id}" viewBox="0 0 32 24">${faceDrawing(state)}</symbol>`).join('');
const freshnessSymbols = freshnessStates.map(state => `<symbol id="freshness-${state.id}" viewBox="0 0 56 20">${freshnessDrawing(state)}</symbol>`).join('');
const rows = formStates.map((form, index) => {
  const freshness = freshnessStates[index];
  const y = 110 + index * 66;
  return `<use href="#form-${form.id}" x="40" y="${y}" width="56" height="42"/>` +
    `<text x="112" y="${y + 27}" class="label">${form.label}</text>` +
    `<use href="#freshness-${freshness.id}" x="440" y="${y + 2}" width="112" height="40"/>` +
    `<text x="570" y="${y + 27}" class="label">${freshness.label}</text>`;
}).join('');
const preview = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 490" role="img" aria-label="Vorschau der Form-Icons und Müdigkeitsbalken"><title>Spielerstatus: Form und Müdigkeit</title><defs>${formSymbols}${freshnessSymbols}</defs><style>text{font-family:Arial,sans-serif;fill:#EAF0EE}.heading{font-size:22px;font-weight:700}.subheading{font-size:15px;font-weight:700;letter-spacing:1px}.label{font-size:18px}.note{font-size:13px;fill:#A9C8BE}</style><rect width="860" height="490" rx="14" fill="#14262A"/><text x="40" y="42" class="heading">Spielerstatus</text><text x="40" y="77" class="subheading">FORM</text><text x="440" y="77" class="subheading">MÜDIGKEIT</text><path d="M420 68V436" stroke="#3B5053"/>${rows}<text x="40" y="466" class="note">Form: Farbe, Mimik und Richtung · Frische: fünf Füllstände.</text></svg>\n`;
fs.writeFileSync(path.join(root, 'docs', 'status-icons-preview.svg'), preview, 'utf8');

console.log('10 Status-Icons, Laufzeitdaten und die Vorschau wurden erstellt.');

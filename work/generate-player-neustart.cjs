// Isolated visual study built on the existing offline Meshy viewer.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'meshy_output/20261002_215210_doppel-6-neuer-musterspieler_01a0fe2c');
const prepared = path.join(source, 'prepared');
const output = path.join(root, 'outputs/spieler-neustart.html');
for (const name of ['walking', 'running']) fs.copyFileSync(path.join(source, name+'.glb'), path.join(prepared, name+'.glb'));
const job = path.join(prepared, 'viewer.json');
fs.writeFileSync(job, JSON.stringify({project: prepared}));
cp.execFileSync(process.execPath, [path.join(__dirname, 'generate-meshy-player-preview.cjs'), job, output, 'Neuer Musterspieler'], {stdio:'inherit'});
let html = fs.readFileSync(output, 'utf8');
html = html.replace('renderer.shadowMap.enabled=true;', 'renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;');
html = html.replace('key.castShadow=true;', 'key.castShadow=true;key.shadow.bias=-.0003;key.shadow.normalBias=.025;');
html = html.replace('<title>Doppel 6 · Meshy-Spieler B</title>', '<title>Doppel 6 · Neuer Musterspieler</title>');
html = html.replace('<button id="pause"', '<select id="kit" aria-label="Trikotvariante"><option value="home">Waldgrün / Marine</option><option value="away">Elfenbein / Weinrot</option></select><button id="pause"');
html = html.replace('<option value="boots">Schuhe</option>', '<option value="boots">Schuhe</option><option value="head">Gesicht</option>');
html = html.replace('boots:[.65,.40,1.15]', 'boots:[.65,.40,1.15],head:[0,1.65,1.0]');
html = html.replace("value==='boots'?.20:.9", "value==='boots'?.20:value==='head'?1.62:.9");
html = html.replace('window.meshyPreview={ready:true', `
const kitColours={home:{shirt:'#315e46',shorts:'#202c47'},away:{shirt:'#eae3d1',shorts:'#742c3e'}};
function setKit(name){const colours=kitColours[name];if(!colours)throw Error('Unknown kit');model.traverse(o=>{if(o.isMesh){for(const mat of [].concat(o.material)){const region=mat.name.replace('D6_','');if(colours[region])mat.color.set(colours[region]);}}});document.querySelector('#kit').value=name;}
document.querySelector('#kit').onchange=e=>setKit(e.target.value);setKit('home');
window.meshyPreview={setKit,ready:true`);
html = html.replace('Lokale Modellprobe mit Geh- und Laufclips.', 'Neue Modellstudie · 2. Oktober 2026. Zwei Trikotfarben und Geh-/Laufclips; noch nicht ins Match integriert.');
fs.writeFileSync(output, html);
console.log('Prepared model + original walking/running clips; fixed material regions; two kit palettes.');

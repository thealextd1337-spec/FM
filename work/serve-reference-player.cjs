const http = require('http');
const fs = require('fs');
const path = require('path');
const base = 'G:/Blenderassets/FM';
const views = ['Dreiviertel', 'Frontal', 'Ruecken', 'Profil', 'Gesicht', 'Vorlage'];
const files = new Set(['FM-Zeichnung-B-Vorschau.html', 'FM-Zeichnung-B-Entwurf.blend', ...views.map(v => `FM-Zeichnung-B-${v}.png`), 'FM-Fussballer-Vorschau.html', 'FM-Fussballer-Entwurf.blend', ...views.map(v => `FM-Fussballer-${v}.png`)]);
for (const name of ['FM-Athlet-Vorschau.html', 'FM-Athlet-Entwurf.blend', ...views.map(v => `FM-Athlet-${v}.png`)]) files.add(name);
const concept = 'Neukonzept-2026-10-01/';
for (const name of ['index.html', 'athlet-konzept.png', 'README.md', 'FM-Neukonzept-Referenz.blend', 'FM-Athlet-Graukoerper.blend', ...['Frontal', 'Profil', 'Ruecken', 'Ballpose', 'Gesicht'].map(v => `Graukoerper-${v}.png`)]) files.add(concept + name);
for (const name of ['FM-Athlet-Fussballkleidung.blend', ...['Frontal', 'Profil', 'Ruecken', 'Ballpose', 'Gesicht'].map(v => `Fussballer-${v}.png`)]) files.add(concept + name);
const port = Number(process.env.D6_REFERENCE_PORT || 4209);
http.createServer((req, res) => {
  const route = new URL(req.url, 'http://localhost').pathname;
  const gallery = [concept + 'index.html', 'FM-Athlet-Vorschau.html', 'FM-Fussballer-Vorschau.html', 'FM-Zeichnung-B-Vorschau.html'].find(name => fs.existsSync(path.join(base, name)));
  if (route === '/' && gallery?.startsWith(concept)) {
    res.writeHead(302, { Location: '/' + gallery });
    return res.end();
  }
  const name = route === '/' ? gallery : route.slice(1);
  if (!files.has(name)) { res.writeHead(404); return res.end('Nicht gefunden'); }
  const file = path.join(base, name);
  if (!fs.existsSync(file)) { res.writeHead(404); return res.end('Nicht gefunden'); }
  res.setHeader('Content-Type', name.endsWith('.html') ? 'text/html; charset=utf-8' : name.endsWith('.png') ? 'image/png' : 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store');
  fs.createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`Zeichnung B: http://127.0.0.1:${port}/`));

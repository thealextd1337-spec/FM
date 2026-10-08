const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const files = new Map([
  ['/', ['index.html', 'text/html']],
  ['/index.html', ['index.html', 'text/html']],
  ['/reference.css', ['reference.css', 'text/css']],
  ['/mobile.css', ['mobile.css', 'text/css']],
  ['/reference.js', ['reference.js', 'text/javascript']],
  ['/mobile.js', ['mobile.js', 'text/javascript']],
  ['/variants.css', ['variants.css', 'text/css']],
  ['/variants.js', ['variants.js', 'text/javascript']],
  ['/progress.css', ['progress.css', 'text/css']],
  ['/progress.js', ['progress.js', 'text/javascript']],
  ['/varianten.html', ['varianten.html', 'text/html']],
  ['/comparison.css', ['comparison.css', 'text/css']],
  ['/comparison.js', ['comparison.js', 'text/javascript']],
  ['/README.md', ['README.md', 'text/plain']],
]);
for (const name of ['ger-league','ger-cup','ger-top-scorer','ger-player-of-season','ger-man-of-the-match','eu-europe','eng-league','fra-league','ita-league','por-league','esp-league']) {
  files.set('/trophies/'+name+'.png', ['trophies/'+name+'.png', 'image/png']);
}
for (const country of ['ger','eng','fra','ita','aut','por','esp']) {
  files.set('/flags/'+country+'.svg', ['flags/'+country+'.svg', 'image/svg+xml']);
}
for (const country of ['eng','fra','ita','por','esp']) {
  for (const kind of ['top-scorer','player-of-season']) {
    const file='trophies/'+country+'-'+kind+'.png';
    files.set('/'+file,[file,'image/png']);
  }
}
for (const design of ['office', 'night', 'journal', 'control']) {
  for (const viewport of ['desktop', 'mobile']) {
    const file = `${design}-${viewport}.jpg`;
    files.set('/' + file, [file, 'image/jpeg']);
  }
}
http.createServer((req, res) => {
  const file = files.get(new URL(req.url, 'http://localhost').pathname);
  if (!file) { res.writeHead(404); res.end('Nicht gefunden'); return; }
  res.setHeader('Content-Type', file[1] + '; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  fs.createReadStream(path.join(__dirname, file[0])).pipe(res);
}).listen(4186, '127.0.0.1', () => console.log('UI-Referenz: http://127.0.0.1:4186'));

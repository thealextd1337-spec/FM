'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const m = JSON.parse(fs.readFileSync(path.join(root, 'outputs/start-roster-strength/measurement.json'), 'utf8'));
assert.equal(m.generationVersion, 3);
assert.equal(m.worlds.length, 30);
const countries = { ENG: 'England', ESP: 'Spanien', GER: 'Deutschland', ITA: 'Italien', FRA: 'Frankreich', POR: 'Portugal', NED: 'Niederlande', AUT: 'Österreich', BEL: 'Belgien', TUR: 'Türkei', SUI: 'Schweiz', GRE: 'Griechenland' };
const clubs = new Map();
for (const world of m.worlds) {
  assert.equal(world.clubs.length, 192);
  assert.equal(new Set(world.clubs.map(c => c.clubId)).size, 192);
  for (const c of world.clubs) {
    assert(Number.isFinite(c.meanQuality));
    const row = clubs.get(c.clubId) || { id: c.clubId, name: c.name, country: c.country, kind: c.kind, values: [] };
    row.values.push(c.meanQuality); clubs.set(c.clubId, row);
  }
}
const ordered = [...clubs.values()].map(c => ({ ...c, mean: c.values.reduce((s, v) => s + v, 0) / c.values.length })).sort((a, b) => b.mean - a.mean || a.id.localeCompare(b.id));
assert.equal(ordered.length, 192);
assert(ordered.every(c => c.values.length === 30));
const rows = ordered.map((c, i) => ({ rank: i + 1, clubId: c.id, name: c.name, country: countries[c.country], type: c.kind === 'league' ? 'Liga' : 'Pokalverein', relative: +(100 - 50 * i / (ordered.length - 1)).toFixed(1) }));
assert(rows.slice(0,96).every(r=>r.type==='Liga') && rows.slice(96).every(r=>r.type==='Pokalverein'));
assert.equal(rows[0].relative, 100); assert.equal(rows.at(-1).relative, 50);
assert(rows.every((r, i) => i === 0 || r.relative < rows[i - 1].relative));
assert.equal(rows.filter(r => r.type === 'Liga').length, 96);
assert.equal(rows.filter(r => r.type === 'Pokalverein').length, 96);
const pct = n => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const csv = s => '"' + String(s).replace(/"/g, '""') + '"';
const lines = [['Rang', 'Verein', 'Land', 'Typ', 'Relative Stärke'], ...rows.map(r => [r.rank, r.name, r.country, r.type, pct(r.relative)])];
fs.writeFileSync(path.join(__dirname, 'vereinsstaerken.csv'), '\ufeff' + lines.map(row => row.map(csv).join(';')).join('\r\n') + '\r\n');
fs.writeFileSync(path.join(__dirname, 'vereinsstaerken.json'), JSON.stringify({ generationVersion: 3, worldCount: 30, clubCount: 192, scale: 'Linear rank index: 100 - 50 * (rank - 1) / 191; not a ratio of underlying quality or win probability.', ranking: 'Mean initial squad position quality across thirty generation-version-3 worlds; youth pools and free players excluded.', rows }, null, 2));
const html = `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Relative Vereinsstärken</title><style>body{margin:0;background:transparent;color:var(--foreground,#18232e);font-family:var(--font-sans,system-ui)}p{margin:0 0 14px;color:var(--muted-foreground,#657080)}table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}th{position:sticky;top:0;background:var(--background,#fff);font-weight:500}th,td{padding:10px 0;border-bottom:1px solid var(--border,#d5d9de);text-align:left;vertical-align:top}th:first-child,td:first-child{width:42px;padding-right:10px;color:var(--muted-foreground,#657080)}th:last-child,td:last-child{width:95px;text-align:right;white-space:nowrap;padding-left:10px}td:nth-child(2){overflow-wrap:anywhere}.meta{display:block;font-size:.86em;color:var(--muted-foreground,#657080);margin-top:3px}caption{text-align:left;margin-bottom:12px;font-weight:500}@media(max-width:450px){th,td{padding-top:9px;padding-bottom:9px}th:last-child,td:last-child{width:78px}}</style>
<p>Alle 192 Vereine · 96 Ligavereine und 96 reine Pokalvereine.<br>Geordnet nach durchschnittlicher Startkaderqualität über 30 neue Karrieren. Die Rangskala läuft gleichmäßig von 100 % bis 50 %; sie beschreibt den Rang und keine Siegchance oder tatsächlichen Leistungsabstände. Der zweite Verein liegt deshalb bei 99,7 %.</p>
<table><caption>Relative Stärke der Startkader</caption><thead><tr><th scope="col">Rang</th><th scope="col">Verein</th><th scope="col">Relativ</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r.rank}</td><td>${escape(r.name)}<span class="meta">${escape(r.country)} · ${r.type}</span></td><td>${pct(r.relative)}</td></tr>`).join('')}</tbody></table>
<script>console.assert(document.querySelectorAll('tbody tr').length===192,'All clubs must be present');console.log('PASS complete list: 192 clubs, 96 league and 96 cup; first 100%, last 50%');</script></html>`;
fs.writeFileSync(path.join(__dirname, 'vereinsstaerken.html'), html);
console.log(JSON.stringify({ count: rows.length, top: rows.slice(0, 5), bottom: rows.at(-1), csv: path.join(__dirname, 'vereinsstaerken.csv') }));

// Installiert nur die Markenidentität; Geldbeträge und Vertragsziele kommen aus der Weltwirtschaft.
const fs = require('fs');
const { catalogs, countries } = require('./sponsor-brand-data.cjs');
const file = 'dist/world-economy-v66.js';
let source = fs.readFileSync(file, 'utf8');
const brands = Object.fromEntries(Object.entries(catalogs).map(([country, list]) => [country,
  list.map(({ id, name, icon, word }) => ({ id, name, icon, word }))
]));
const colors = Object.fromEntries(Object.entries(countries).map(([country, { colors }]) => [country, colors]));
const start = '// BEGIN NATIONAL SPONSOR BRANDS';
const end = '// END NATIONAL SPONSOR BRANDS';
const section = `${start}\nconst v66SponsorBrands=${JSON.stringify(brands)};\nconst v66SponsorColors=${JSON.stringify(colors)};\n${end}`;
if (source.includes(start)) source = source.slice(0, source.indexOf(start)) + section + source.slice(source.indexOf(end) + end.length);
else {
  const old = "const v66Sponsors=['Stadtwerke','Sportpartner','Reisepartner','Handelspartner','Medienpartner','Regionalpartner'];";
  if (!source.includes(old)) throw Error('Markenkatalog-Einfügestelle fehlt.');
  source = source.replace(old, section);
}
fs.writeFileSync(file, source);
console.log('36 nationale Sponsormarken im bestehenden Wirtschaftsmodul installiert.');

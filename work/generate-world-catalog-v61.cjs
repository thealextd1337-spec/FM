const fs = require('fs');

const source = fs.readFileSync('docs/vereinskatalog-entwurf.md', 'utf8');
const profileRows = new Map();
for (const line of source.slice(source.indexOf('## Relative Startparameter')).split('\n')) {
  const match = line.match(/^\| ((?:ENG|ESP|ITA|GER|FRA|POR)-(?:[1-6]|C[12])) \| ([1-5]) \| ([1-5]) \| ([1-5]) \| ([1-5]) \| ([1-5]) \| ([1-5]) \|/);
  if (match) profileRows.set(match[1], match.slice(2).map(Number));
}

const clubs = [];
for (const line of source.slice(0, source.indexOf('## Feste Vorgeschichte')).split('\n')) {
  const match = line.match(/^\| ((?:ENG|ESP|ITA|GER|FRA|POR)-(?:[1-6]|C[12])) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|/);
  if (!match) continue;
  const [, id, city, name, colors, history] = match;
  const profile = profileRows.get(id);
  if (!profile) throw Error(`Startprofil fehlt: ${id}`);
  clubs.push({id, city: city.trim(), name: name.trim(), colors: colors.trim(), history: history.trim(), profile});
}

if (clubs.length !== 48 || new Set(clubs.map(club => club.id)).size !== 48) {
  throw Error(`Erwartet: 48 eindeutige Vereine; gefunden: ${clubs.length}`);
}
for (const country of ['ENG', 'ESP', 'ITA', 'GER', 'FRA', 'POR']) {
  if (clubs.filter(club => club.id.startsWith(`${country}-`)).length !== 8) throw Error(`Vereine fehlen: ${country}`);
}

fs.writeFileSync('dist/world-catalog-v61.js', `'use strict';\n// Aus docs/vereinskatalog-entwurf.md erzeugt. Änderungen über work/generate-world-catalog-v61.cjs übernehmen.\nconst v61Catalog=${JSON.stringify(clubs, null, 1)};\n`);
console.log(`Vereinskatalog erzeugt: ${clubs.length} Vereine`);

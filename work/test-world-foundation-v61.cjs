const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const values = new Map([['sechser.saves.v5', '[{"schema":5,"id":"alter-stand"}]']]);
let nextId = 0;
const context = vm.createContext({
  crypto: {randomUUID: () => `test-${++nextId}`},
  localStorage: {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  }
});

vm.runInContext(fs.readFileSync('dist/world-catalog-v61.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('dist/world-competition-v62.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('dist/world-coaches-v63.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('dist/world-match-v64.js', 'utf8'), context);
const source = fs.readFileSync('dist/world-foundation-v61.js', 'utf8');
vm.runInContext(source.slice(0, source.indexOf('const v61Panel=')), context);

const seed = 'testwelt-2026';
const career = vm.runInContext("v61CreateCareer('GER-2', 'testwelt-2026')", context);
assert.strictEqual(career.schema, 13);
assert.strictEqual(career.modelVersion, 9);
assert.strictEqual(career.manager.managedClubId, 'GER-2');
assert.strictEqual(career.world.clubs.length, 48);
assert.strictEqual(career.world.coaches.length, 57);
assert.strictEqual(career.world.countries.length, 6);
assert.strictEqual(career.world.competitions.length, 13);
assert.strictEqual(career.world.clubs.filter(club => club.leagueId).length, 36);
assert.strictEqual(career.world.clubs.filter(club => !club.leagueId).length, 12);
assert.strictEqual(new Set(career.world.clubs.map(club => club.id)).size, 48);
assert.strictEqual(career.world.clubs.find(club => club.id === 'GER-2').name, 'FC Bremen Weser');
assert(career.world.clubs.every(club => club.roster.length === 11));
assert.strictEqual(new Set(career.world.clubs.flatMap(club => club.roster.map(player => player.pid))).size, 528);
const preview = vm.runInContext('v61GenerateRoster', context)(
  vm.runInContext("v61Catalog.find(club => club.id === 'GER-2')", context), seed
);
assert.strictEqual(JSON.stringify(preview), JSON.stringify(career.world.clubs.find(club => club.id === 'GER-2').roster));
assert(preview.every(player => player.age >= 19 && player.age <= 34));
assert(preview.every(player => ['ENG', 'ESP', 'ITA', 'GER', 'FRA', 'POR'].includes(player.nation)));
assert(preview.every(player => ['tec','pas','fin','tak','pos','spd','sta','air','gk'].every(key => player[key] >= 1 && player[key] <= 20)));
assert.strictEqual(vm.runInContext('v61ValidateCareer', context)(career), true);
const incomplete = JSON.parse(JSON.stringify(career));
delete incomplete.world.clubs[0].roster;
assert.strictEqual(vm.runInContext('v61ValidateCareer', context)(incomplete), false);
assert.throws(() => vm.runInContext("v61CreateCareer('GER-C1')", context), /Ligaverein/);

vm.runInContext('v61SaveCareers', context)([career]);
const loaded = vm.runInContext('v61ReadCareers()', context);
assert.strictEqual(JSON.stringify(loaded), JSON.stringify([career]));
assert.strictEqual(values.get('sechser.saves.v5'), '[{"schema":5,"id":"alter-stand"}]');

const catalog = fs.readFileSync('docs/vereinskatalog-entwurf.md', 'utf8');
for (const club of career.world.clubs) {
  assert(catalog.includes(`| ${club.id} | ${club.city} | ${club.name} | ${club.colors} |`), `${club.id} weicht vom Vereinskatalog ab`);
}
console.log('Weltfundament: 48 Vereine, 528 Spieler, Managerzuordnung, Speicherung und Katalog geprüft.');

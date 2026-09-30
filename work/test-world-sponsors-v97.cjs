const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const { createHash } = require('crypto');
let nextId = 0;
const context = vm.createContext({
  crypto: { randomUUID: () => `sponsor-${++nextId}` },
  escapeHTML: value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
});
for (const file of ['world-catalog-v61.js', 'world-competition-v62.js', 'world-coaches-v63.js', 'world-match-v64.js', 'world-nationalities-v79.js']) {
  vm.runInContext(fs.readFileSync(`dist/${file}`, 'utf8'), context);
}
const foundation = fs.readFileSync('dist/world-foundation-v61.js', 'utf8');
vm.runInContext(foundation.slice(0, foundation.indexOf('const v61Panel=')), context);
vm.runInContext(fs.readFileSync('dist/world-economy-v66.js', 'utf8'), context);
const ui = fs.readFileSync('dist/world-market-ui-v66.js', 'utf8');
vm.runInContext(ui.slice(0, ui.indexOf('const v66BaseSetCareerTab=')), context);
const call = (name, ...args) => vm.runInContext(name, context)(...args);
const catalog = vm.runInContext('v66SponsorBrands', context);
const brands = Object.values(catalog).flat();
assert.equal(brands.length, 36);
assert.equal(new Set(brands.map(brand => brand.id)).size, 36);
assert.equal(new Set(brands.map(brand => brand.name)).size, 36);
assert.equal(new Set(brands.map(brand => brand.icon)).size, 36);

const career = call('v61CreateCareer', 'GER-2', 'sponsor-regression');
for (const club of career.world.clubs) {
  assert.equal(club.sponsors.length, 3);
  assert.equal(new Set(club.sponsors.map(offer => offer.brandId)).size, 3);
  for (const offer of club.sponsors) {
    assert(catalog[club.countryId].some(brand => brand.id === offer.brandId && brand.name === offer.name));
    assert(!JSON.stringify(offer).includes('<svg'), 'Spielstände speichern keine Grafiken');
    assert(offer.goals.length <= 2);
    const full = call('v66SponsorLogoSVG', club.countryId, offer);
    const compact = call('v66SponsorLogoSVG', club.countryId, offer, true);
    assert(full.includes(`data-v66-brand="${offer.brandId}"`) && full.includes('v97-sponsor-wordmark'));
    assert(compact.includes('v97-sponsor-symbol') && !compact.includes('<text'));
    assert(!full.includes('var(--'), 'Logo enthält vollständig aufgelöste Landesfarben');
    assert(full.includes('translate="no"'), 'Wortmarken werden nicht übersetzt');
  }
}

// Unabhängig erfasster Fingerabdruck des bisherigen Finanzmodells: 48 Vereine, drei Saisonstände.
const finances = [1, 2, 7].map(season => {
  career.world.season = season;
  return career.world.clubs.map(club => call('v66MakeSponsors', career, club).map(offer => ({
    id: offer.id, fixed: offer.fixed, goals: offer.goals.map(({ label, ...goal }) => goal)
  })));
});
assert.equal(createHash('sha256').update(JSON.stringify(finances)).digest('hex'),
  '100b8af7cdedf7d37f963347066e33a216eb089655fc662adf20d4097c9f7eef',
  'Markenkatalog verändert weder Fixum noch Ziele oder Bonusbeträge');

const legacy = call('v61CreateCareer', 'GER-2', 'existing-sponsor');
const own = call('v66Club', legacy, 'GER-2');
own.sponsors.forEach((offer, index) => {
  delete offer.brandId;
  offer.name = ['Stadtwerke', 'Sportpartner', 'Reisepartner'][index];
  offer.goals.forEach(goal => {
    if (goal.kind === 'goals' && goal.competition.endsWith(':LEAGUE')) goal.label = `Liga: mindestens ${goal.target} reguläre Tore`;
  });
});
const before = JSON.stringify(legacy);
assert(call('v61ValidateCareer', legacy));
const legacyHTML = call('v66SponsorHTML', legacy);
assert(legacyHTML.includes('Stadtwerke') && !legacyHTML.includes('reguläre Tore'));
assert.equal(JSON.stringify(legacy), before, 'Lesen und Darstellen verändern keine alten Angebote');
assert(call('v66SponsorLogoSVG', 'GER', 'Stadtwerke').includes('viewBox="0 0 64 44"'), 'Alte Namen behalten ihr bisheriges Zeichen');
const selected = own.sponsors[0], balance = own.balance;
call('v66ChooseSponsor', legacy, own.id, selected.id);
assert.equal(own.balance, balance + selected.fixed);
assert.equal(own.sponsorId, selected.id);
assert.throws(() => call('v66ChooseSponsor', legacy, own.id, selected.id), /nicht mehr/);
assert.equal(own.balance, balance + selected.fixed, 'Auswahl bucht das Fixum nur einmal');
assert.equal(own.sponsors[0].name, 'Stadtwerke');
assert(!('brandId' in own.sponsors[0]), 'Kein nachträglicher Markenzusatz in alten Verträgen');
assert(call('v61ValidateCareer', JSON.parse(JSON.stringify(legacy))), 'Alte Verträge bleiben exportierbar und ladbar');

const translation = fs.readFileSync('dist/i18n-v75.js', 'utf8');
vm.runInContext(translation.slice(translation.indexOf('const labels='), translation.indexOf("let language='de'")), context);
assert.equal(call('translate', 'Liga: mindestens 16 Tore'), 'League: at least 16 goals');
assert.equal(call('translate', 'Liga: mindestens 16 reguläre Tore'), 'League: at least 16 goals');
assert.equal(call('translate', 'Nationaler Pokal: mindestens 4 reguläre Tore'), 'National cup: at least 4 regulation goals');
console.log('Sponsoren: 36 nationale Identitäten, unveränderte Finanzen, Darstellung alter Verträge, einmalige Buchungen und DE/EN geprüft.');

// Katalogdaten der freigegebenen nationalen Sponsorentwürfe.
const brands = [
  { id: 'voltwerk', name: 'Voltwerk', sector: ['Energie', 'Energy'], slogan: ['Energie für deinen Verein.', 'Energy for your club.'], fixed: 780, goals: [['league', 3, 240], ['cup', 'SF', 170]],
    icon: '<path d="M8 11h27L20 38h18L24 64h29L69 31H49L62 11H39L26 31H14z" fill="var(--primary)"/><path d="m37 11-11 20h12L24 64 55 25H43l8-14z" fill="var(--secondary)"/><path d="m24 64 14-26H20l9-16" fill="none" stroke="var(--tertiary)" stroke-width="3"/>',
    word: '<text x="94" y="57" font-family="Arial,sans-serif" font-size="35" font-weight="900" font-style="italic" letter-spacing="-1">VOLTWERK</text><path d="M96 70h153l-6 5H94z" fill="var(--secondary)"/><path d="M253 70h57l-6 5h-57z" fill="var(--tertiary)"/>' },
  { id: 'bergquell', name: 'Bergquell', sector: ['Getränke', 'Drinks'], slogan: ['Aus der Quelle. Für das Spiel.', 'From the spring. For the game.'], fixed: 700, goals: [['goals', 16, 300], ['league', 4, 180]],
    icon: '<path d="M4 45 25 13l12 17 10-14 24 29Z" fill="var(--primary)"/><path d="m20 21 5-8 8 12-7-3-3 4Z" fill="#f7f4e9"/><path d="m42 23 5-7 7 10-7-3-3 3Z" fill="var(--tertiary)"/><path d="M36 33c-3 8-12 16-12 23a13 13 0 0 0 26 0c0-7-10-15-14-23Z" fill="var(--secondary)" stroke="#f7f4e9" stroke-width="3"/><path d="M8 66h10m38 0h11" stroke="var(--tertiary)" stroke-width="3"/>',
    word: '<text x="94" y="56" font-family="Georgia,serif" font-size="34" font-weight="700" letter-spacing="-1">Bergquell</text><path d="M96 70h218" stroke="var(--secondary)" stroke-width="2"/><path d="M168 74h72" stroke="var(--tertiary)" stroke-width="2"/>' },
  { id: 'nordlauf', name: 'Nordlauf', sector: ['Sportartikel', 'Sportswear'], slogan: ['Immer einen Schritt voraus.', 'Always one step ahead.'], fixed: 620, goals: [['league', 2, 390], ['goals', 18, 210]],
    icon: '<path d="m8 59 16-44h17L31 42l27-27h15L57 59H40l9-25L22 59Z" fill="var(--primary)"/><path d="m0 64 37-3-3 5H0z" fill="var(--secondary)"/><path d="m38 61 28-2-2 7H35z" fill="var(--tertiary)"/>',
    word: '<text x="94" y="60" font-family="Arial,sans-serif" font-size="44" font-weight="800" font-style="italic" letter-spacing="-1.6">nordlauf</text><path d="m99 72 75-4-3 6H97z" fill="var(--secondary)"/><path d="m178 68 106-5-4 11H175z" fill="var(--tertiary)"/>' },
  { id: 'atlas-reisen', name: 'Atlas Reisen', sector: ['Reisen', 'Travel'], slogan: ['Mit euch. Überall.', 'With you. Everywhere.'], fixed: 850, goals: [['cup', 'F', 190], ['league', 3, 160]],
    icon: '<circle cx="37" cy="38" r="29" fill="none" stroke="var(--primary)" stroke-width="3"/><path d="m37 2 8 27 27 9-27 8-8 28-9-28L1 38l27-9Z" fill="var(--secondary)"/><path d="m37 2 0 36L1 38l27-9Zm0 36 0 36 8-28 27-8Z" fill="var(--primary)"/><circle cx="37" cy="38" r="5" fill="var(--tertiary)"/>',
    word: '<text x="94" y="52" font-family="Georgia,serif" font-size="40" letter-spacing="3">ATLAS</text><text x="96" y="76" font-family="Arial,sans-serif" font-size="16" font-weight="700" letter-spacing="7">REISEN</text>' },
  { id: 'korn-kruste', name: 'Korn & Kruste', sector: ['Lebensmittel', 'Food'], slogan: ['Gutes Brot. Gute Spiele.', 'Good bread. Great games.'], fixed: 900, goals: [['league', 4, 140]],
    icon: '<path d="M36 68V15" stroke="var(--primary)" stroke-width="4"/><path d="M36 28C19 29 13 18 14 11c13-1 22 5 22 17Zm0 15C17 44 9 33 10 26c15-1 26 5 26 17Zm0 15C15 59 5 49 6 41c17-1 30 5 30 17Z" fill="var(--secondary)"/><path d="M36 28c17 1 23-10 22-17-13-1-22 5-22 17Zm0 15c19 1 27-10 26-17-15-1-26 5-26 17Zm0 15c21 1 31-9 30-17-17-1-30 5-30 17Z" fill="var(--tertiary)"/><path d="M36 4c-8 6-8 14 0 20 8-6 8-14 0-20Z" fill="var(--primary)"/>',
    word: '<text x="95" y="47" font-family="Georgia,serif" font-size="33" font-weight="700">Korn &amp;</text><text x="95" y="80" font-family="Georgia,serif" font-size="35" font-weight="700">Kruste</text><path d="M245 46c18 0 34 14 34 31h-39" fill="none" stroke="var(--secondary)" stroke-width="3"/>' },
  { id: 'signalwerk', name: 'Signalwerk', sector: ['Kommunikation', 'Communications'], slogan: ['Dein Verein. Verbunden.', 'Your club. Connected.'], fixed: 740, goals: [['league', 3, 250], ['cup', 'SF', 220]],
    icon: '<rect x="8" y="41" width="12" height="23" rx="2" fill="var(--primary)"/><rect x="29" y="26" width="12" height="38" rx="2" fill="var(--secondary)"/><rect x="50" y="10" width="12" height="54" rx="2" fill="var(--tertiary)"/><path d="M7 12h17m-9-8v16" stroke="var(--primary)" stroke-width="3"/>',
    word: '<text x="94" y="58" font-family="Arial,sans-serif" font-size="35" font-weight="600" letter-spacing="-1">signalwerk</text><circle cx="302" cy="73" r="3" fill="var(--secondary)"/><circle cx="315" cy="73" r="3" fill="var(--tertiary)"/>' }
];
const countries = {
  GER: { name: ['Deutschland', 'Germany'], colors: ['#202725', '#c72232', '#edbd46'] },
  ENG: { name: ['England', 'England'], colors: ['#fff', '#c8102e', '#fff'] },
  ESP: { name: ['Spanien', 'Spain'], colors: ['#aa151b', '#f1bf00', '#aa151b'] },
  ITA: { name: ['Italien', 'Italy'], colors: ['#008c45', '#fff', '#cd212a'] },
  FRA: { name: ['Frankreich', 'France'], colors: ['#164a9f', '#fff', '#ed2939'] },
  POR: { name: ['Portugal', 'Portugal'], colors: ['#006f42', '#e42535', '#edbd46'] }
};
const catalogs = { GER: brands, ...require('./sponsor-country-concepts.cjs')(brands) };
const germanMotifs = ['Mehrteiliger Blitz', 'Berg und Tropfen', 'Laufzeichen', 'Kompass', 'Ähre', 'Signalbalken'];
brands.forEach((brand, index) => { brand.motif = germanMotifs[index]; });

module.exports = { brands, countries, catalogs };

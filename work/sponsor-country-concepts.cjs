// Nationale Gestaltungsmuster. Jeder Eintrag besitzt ein eigenes Bildzeichen.
const p = 'var(--primary)', s = 'var(--secondary)', t = 'var(--tertiary)';
const entries = {
 ENG: [
  ['hearthgrid', 'Hearthgrid', 'Quartiernetz', ['Strom aus deiner Nachbarschaft.', 'Power from your neighbourhood.'],
   `<path d="M7 34 37 8l30 26v31H47V43H27v22H7Z" fill="none" stroke="${p}" stroke-width="5"/><path d="M7 35h60M37 8v21" stroke="${s}" stroke-width="6"/><circle cx="37" cy="33" r="6" fill="${t}"/>`, ['HEARTH', 'GRID'], 'Arial', 800],
  ['brookmere', 'Brookmere', 'Bachlauf', ['Frische vom ersten Anpfiff an.', 'Fresh from the first whistle.'],
   `<path d="M8 15c15-8 43-8 58 0M8 25c15-8 43-8 58 0" fill="none" stroke="${p}" stroke-width="4"/><path d="M16 36c32-13 50-1 23 11S9 64 61 65" fill="none" stroke="${s}" stroke-width="7"/><circle cx="12" cy="62" r="4" fill="${t}"/>`, ['Brookmere'], 'Georgia', 700],
  ['fleetline', 'Fleetline', 'Flügelbahnen', ['Gemacht für dein Tempo.', 'Made for your pace.'],
   `<path d="m5 15 42 0 23 19-13 10-19-16H5Z" fill="${p}"/><path d="m5 36 26 0 20 17-13 10-17-14H5Z" fill="${s}"/><path d="m5 57 10 0 9 8-8 7-11-4Z" fill="${t}"/>`, ['fleetline'], 'Arial', 800, true],
  ['wayfarer', 'Wayfarer', 'Wegbogen', ['Jedes Auswärtsspiel beginnt hier.', 'Every away day starts here.'],
   `<path d="M8 67V35a29 29 0 0 1 58 0v32" fill="none" stroke="${p}" stroke-width="5"/><path d="m21 67 11-34h11l11 34Z" fill="${s}"/><path d="M37 34v9m0 7v12" stroke="${t}" stroke-width="3"/>`, ['WAYFARER'], 'Georgia', 400],
  ['oat-oven', 'Oat & Oven', 'Brotlaib', ['Frisch gebacken. Für Spieltage.', 'Freshly baked. For matchdays.'],
   `<path d="M8 58V37a29 29 0 0 1 58 0v21Z" fill="${p}"/><path d="m22 24-6 15m23-21-6 15m22-9-6 15" stroke="${s}" stroke-width="5"/><path d="M8 64h58" stroke="${t}" stroke-width="6"/>`, ['Oat &', 'Oven'], 'Georgia', 700],
  ['relay-house', 'Relay House', 'Netzknoten', ['Deine Fans bleiben verbunden.', 'Keeping your fans connected.'],
   `<path d="m37 7 28 16v32L37 71 9 55V23Z" fill="none" stroke="${p}" stroke-width="4"/><path d="M22 28 52 46M52 28 22 46M37 18v38" stroke="${s}" stroke-width="3"/><circle cx="22" cy="28" r="6" fill="${t}"/><circle cx="52" cy="46" r="6" fill="${t}"/><circle cx="37" cy="57" r="6" fill="${t}"/>`, ['RELAY', 'HOUSE'], 'Arial', 700]
 ],
 ESP: [
  ['solaria-sur', 'Solaria Sur', 'Sonnenkranz', ['Sonnenkraft für große Spieltage.', 'Solar power for big matchdays.'],
   `<circle cx="37" cy="37" r="18" fill="${s}"/><path d="M37 3v10m0 48v10M3 37h10m48 0h10M13 13l7 7m34 34 7 7M13 61l7-7m34-34 7-7" stroke="${p}" stroke-width="5"/><circle cx="37" cy="37" r="7" fill="${t}"/>`, ['SOLARIA', 'SUR'], 'Arial', 800],
  ['agua-clara', 'Agua Clara', 'Quellbogen', ['Klarer Geschmack. Klare Ziele.', 'Clear taste. Clear goals.'],
   `<path d="M8 44c0-22 13-34 29-34s29 12 29 34" fill="none" stroke="${p}" stroke-width="5"/><path d="M23 44c0-12 5-20 14-20s14 8 14 20" fill="none" stroke="${s}" stroke-width="6"/><path d="M6 55h62M17 66h40" stroke="${t}" stroke-width="5"/>`, ['Agua Clara'], 'Georgia', 700],
  ['zancada', 'Zancada', 'Sprungband', ['Jeder Schritt zählt.', 'Every stride counts.'],
   `<path d="m5 19 19 0 17 32-13 19Z" fill="${p}"/><path d="m26 6 18 0 27 42-15 17Z" fill="${s}"/><path d="m43 26 16-17h15L51 38Z" fill="${t}"/>`, ['zancada'], 'Arial', 800, true],
  ['ruta-viva', 'Ruta Viva', 'Reisestrecke', ['Vom Vereinsplatz in die Welt.', 'From your home ground to the world.'],
   `<path d="M14 61c-13-19 35-11 40-27S15 31 22 10" fill="none" stroke="${p}" stroke-width="6"/><circle cx="22" cy="10" r="8" fill="${s}"/><circle cx="14" cy="61" r="8" fill="${t}"/><path d="m58 55 8-7 8 7-8 7Z" fill="${s}"/>`, ['RUTA', 'VIVA'], 'Arial', 700],
  ['trigo-dorado', 'Trigo Dorado', 'Kornfächer', ['Gute Zutaten für deinen Spieltag.', 'Good ingredients for your matchday.'],
   `<path d="M37 66V19" stroke="${p}" stroke-width="4"/><ellipse cx="37" cy="21" rx="9" ry="16" fill="${s}"/><ellipse cx="19" cy="36" rx="9" ry="16" transform="rotate(-40 19 36)" fill="${t}"/><ellipse cx="55" cy="36" rx="9" ry="16" transform="rotate(40 55 36)" fill="${t}"/><path d="M18 63h38" stroke="${p}" stroke-width="4"/>`, ['TRIGO', 'DORADO'], 'Georgia', 700],
  ['enlace', 'Enlace', 'Kettenglieder', ['Fans, die zusammenhalten.', 'Fans who stay connected.'],
   `<rect x="5" y="19" width="42" height="26" rx="13" transform="rotate(-32 26 32)" fill="none" stroke="${p}" stroke-width="7"/><rect x="28" y="32" width="42" height="26" rx="13" transform="rotate(-32 49 45)" fill="none" stroke="${s}" stroke-width="7"/><path d="m29 43 18-12" stroke="${t}" stroke-width="6"/>`, ['enlace'], 'Arial', 700]
 ],
 ITA: [
  ['lucevia', 'Lucevia', 'Glühlicht', ['Mehr Licht für deinen Verein.', 'More light for your club.'],
   `<path d="M25 51C1 36 14 8 37 8s36 28 12 43v13H25Z" fill="none" stroke="${p}" stroke-width="5"/><path d="m26 29 11 19 11-19M37 48v13" fill="none" stroke="${s}" stroke-width="4"/><path d="M25 66h24M29 73h16" stroke="${t}" stroke-width="4"/>`, ['lucevia'], 'Arial', 600],
  ['fontechiara', 'Fontechiara', 'Brunnenbecken', ['Frische aus gutem Grund.', 'Freshness from the source.'],
   `<path d="M37 6v38M37 17c-19 0-27 10-27 22m27-22c19 0 27 10 27 22" fill="none" stroke="${p}" stroke-width="4"/><path d="M5 44h64L57 62H17Z" fill="${s}"/><path d="M37 62v8M22 72h30" stroke="${t}" stroke-width="5"/>`, ['Fontechiara'], 'Georgia', 700],
  ['passo-alto', 'Passo Alto', 'Steigender Schritt', ['Weiter mit jedem Schritt.', 'Further with every step.'],
   `<path d="M7 65V44h19V24h19V7h23v17H48v21H29v20Z" fill="${p}"/><path d="m8 28 12-12 13 0-14 12Z" fill="${s}"/><path d="m45 62 23-23v18L57 68Z" fill="${t}"/>`, ['PASSO', 'ALTO'], 'Arial', 800, true],
  ['girovento', 'Girovento', 'Windrad', ['Unterwegs mit deinem Team.', 'On the road with your team.'],
   `<path d="M37 37 10 8h27Zm0 0 29-27v27Z" fill="${p}"/><path d="M37 37 27 29v37Zm0 0 8 27H37Z" fill="${s}"/><path d="M37 37 66 64H37Zm0 0L8 66V37Z" fill="${t}"/><circle cx="37" cy="37" r="5" fill="${s}"/>`, ['GIROVENTO'], 'Georgia', 400],
  ['forno-nobile', 'Forno Nobile', 'Backofen', ['Handwerk für echte Fans.', 'Craft for true fans.'],
   `<path d="M7 66V36a30 30 0 0 1 60 0v30ZM19 66V39a18 18 0 0 1 36 0v27Z" fill="${p}" fill-rule="evenodd"/><path d="M37 34c-15 15-19 20 0 28 19-8 15-13 0-28Z" fill="${t}"/><path d="m37 46-6 10 6 6 6-6Z" fill="${s}"/>`, ['FORNO', 'NOBILE'], 'Georgia', 700],
  ['retelia', 'Retelia', 'Verbundrauten', ['Ein Netz für alle Fans.', 'One network for every fan.'],
   `<path d="m21 7 17 17-17 17L4 24Z" fill="none" stroke="${p}" stroke-width="5"/><path d="m53 7 17 17-17 17-17-17Z" fill="none" stroke="${s}" stroke-width="5"/><path d="m37 36 17 17-17 17-17-17Z" fill="none" stroke="${t}" stroke-width="5"/>`, ['retelia'], 'Arial', 700]
 ],
 FRA: [
  ['courant-ouest', 'Courant Ouest', 'Windturbine', ['Rückenwind für deinen Verein.', 'A tailwind for your club.'],
   `<path d="M37 30V69M22 70h30" stroke="${p}" stroke-width="4"/><path d="M37 31 32 3l13 0Z" fill="${p}"/><path d="M37 31 70 34l-6 12Z" fill="${s}"/><path d="M37 31 16 57 7 46Z" fill="${t}"/><circle cx="37" cy="31" r="5" fill="${s}"/>`, ['COURANT', 'OUEST'], 'Arial', 700],
  ['source-vive', 'Source Vive', 'Quellfächer', ['Die Frische bleibt im Spiel.', 'Freshness stays in the game.'],
   `<path d="M37 63 8 42 8 22 20 10 37 5 54 10 66 22 66 42Z" fill="none" stroke="${p}" stroke-width="4"/><path d="M37 63V8m0 55L20 12m17 51L54 12" stroke="${s}" stroke-width="3"/><path d="M37 63 9 28m28 35 28-35M24 70h26" stroke="${t}" stroke-width="4"/>`, ['Source', 'Vive'], 'Georgia', 700],
  ['elan-sport', 'Élan Sport', 'Impulszeichen', ['Dein nächster Antritt.', 'Your next burst of speed.'],
   `<path d="m6 59 35-49h22L40 42h22L18 68Z" fill="${p}"/><path d="m40 42 22 0-44 26Z" fill="${t}"/><path d="m8 13 10-8 10 8-10 9Z" fill="${s}"/>`, ['ÉLAN', 'SPORT'], 'Arial', 800, true],
  ['horizon-bleu', 'Horizon Bleu', 'Horizontscheibe', ['Neue Horizonte für Auswärtsfans.', 'New horizons for travelling fans.'],
   `<path d="M8 38a29 29 0 0 1 58 0" fill="none" stroke="${p}" stroke-width="5"/><path d="M37 9c-18 7-18 22 0 29 18-7 18-22 0-29Z" fill="none" stroke="${s}" stroke-width="3"/><path d="M3 43h68M12 55h50M22 67h30" stroke="${t}" stroke-width="4"/>`, ['HORIZON', 'BLEU'], 'Georgia', 400],
  ['maison-levain', 'Maison Levain', 'Baguettezeichen', ['Zeit für gutes Brot.', 'Time for good bread.'],
   `<rect x="23" y="4" width="27" height="68" rx="13" transform="rotate(28 37 38)" fill="${p}"/><path d="m39 15 11 5m-17 8 11 5m-18 8 11 5m-17 8 11 5" stroke="${s}" stroke-width="4"/><path d="m9 66 9-17" stroke="${t}" stroke-width="4"/>`, ['Maison', 'Levain'], 'Georgia', 700],
  ['onde-libre', 'Onde Libre', 'Funkbogen', ['Jeder Fan hört dazu.', 'Every fan belongs.'],
   `<path d="M15 10a32 32 0 0 1 0 60" fill="none" stroke="${p}" stroke-width="5"/><path d="M15 22a20 20 0 0 1 0 36" fill="none" stroke="${s}" stroke-width="5"/><path d="M15 34a8 8 0 0 1 0 12" fill="none" stroke="${t}" stroke-width="5"/><circle cx="15" cy="40" r="3" fill="${s}"/>`, ['onde libre'], 'Arial', 600]
 ],
 POR: [
  ['mare-energia', 'Maré Energia', 'Gezeitenwirbel', ['Die Kraft des nächsten Spieltags.', 'The power of the next matchday.'],
   `<path d="M9 25c0-22 48-24 52 0-7-10-19-10-24 2-5-9-19-10-28-2Z" fill="${p}"/><path d="M61 25c19 11-3 53-26 43 13-1 19-11 11-21 11 0 18-11 15-22Z" fill="${s}"/><path d="M35 68C13 77-10 36 9 25 0 36 6 47 19 45c-6 9 0 21 16 23Z" fill="${t}"/>`, ['MARÉ', 'ENERGIA'], 'Arial', 700],
  ['agua-serra', 'Água da Serra', 'Quellaquädukt', ['Frische mit Herkunft.', 'Freshness with roots.'],
   `<path d="M7 19h60v42H7Zm10 42V41a10 10 0 0 1 20 0v20Zm20 0V41a10 10 0 0 1 20 0v20Z" fill="${p}" fill-rule="evenodd"/><path d="M7 12h60" stroke="${s}" stroke-width="6"/><path d="M7 70h60" stroke="${t}" stroke-width="4"/>`, ['ÁGUA', 'DA SERRA'], 'Georgia', 700],
  ['arranque', 'Arranque', 'Startbahnen', ['Bereit für den ersten Schritt.', 'Ready for the first stride.'],
   `<path d="M14 69V46c0-14 10-25 25-34" fill="none" stroke="${p}" stroke-width="9"/><path d="M33 69V47c0-9 10-20 23-28" fill="none" stroke="${s}" stroke-width="9"/><path d="M52 69V48l17-15" fill="none" stroke="${t}" stroke-width="9"/>`, ['arranque'], 'Arial', 800, true],
  ['rota-atlantica', 'Rota Atlântica', 'Segelzeichen', ['Mit deinem Verein auf Kurs.', 'On course with your club.'],
   `<path d="M36 7V53H6Z" fill="${p}"/><path d="M42 19 69 53H42Z" fill="${s}"/><path d="M5 59h65L56 70H18Z" fill="${t}"/>`, ['ROTA', 'ATLÂNTICA'], 'Georgia', 400],
  ['pao-vila', 'Pão da Vila', 'Rundes Brot', ['Vom Viertel auf den Vereinsplatz.', 'From the neighbourhood to your ground.'],
   `<circle cx="37" cy="37" r="29" fill="${t}"/><path d="M22 20h10v15H19V25m28-5h9v15H42V20M22 45h12v14H22Zm20 0h14v14H42Z" fill="none" stroke="${p}" stroke-width="3"/><path d="M10 66h54" stroke="${s}" stroke-width="4"/>`, ['Pão da', 'Vila'], 'Georgia', 700],
  ['lusofio', 'Lusofio', 'Verflochtene Linien', ['Verbunden mit deinem Verein.', 'Connected to your club.'],
   `<path d="M10 58V20c0-16 28-16 28 0v38c0 16 28 16 28 0V20" fill="none" stroke="${p}" stroke-width="6"/><path d="M10 20v38c0 16 28 16 28 0V20c0-16 28-16 28 0v38" fill="none" stroke="${s}" stroke-width="6"/><path d="M29 36h17" stroke="${t}" stroke-width="5"/>`, ['lusofio'], 'Arial', 600]
 ]
};

function wordmark(lines, font, weight, italic) {
 const escape = text => text.replace(/&/g, '&amp;');
 if (lines.length === 1) {
  const size = Math.min(40, Math.floor(350 / lines[0].length));
  return `<text x="94" y="59" font-family="${font},${font === 'Georgia' ? 'serif' : 'sans-serif'}" font-size="${size}" font-weight="${weight}"${italic ? ' font-style="italic"' : ''}>${escape(lines[0])}</text>`;
 }
 return lines.map((line, index) => {
  const size = Math.min(index ? 28 : 32, Math.floor(350 / line.length));
  return `<text x="94" y="${index ? 79 : 46}" font-family="${font},${font === 'Georgia' ? 'serif' : 'sans-serif'}" font-size="${size}" font-weight="${weight}"${italic ? ' font-style="italic"' : ''}>${escape(line)}</text>`;
 }).join('');
}

module.exports = base => Object.fromEntries(Object.entries(entries).map(([country, list]) => [country, list.map((entry, index) => {
 const [id, name, motif, slogan, icon, lines, font, weight, italic] = entry;
 return { ...base[index], id, name, motif, slogan, icon, word: wordmark(lines, font, weight, italic) };
})]));

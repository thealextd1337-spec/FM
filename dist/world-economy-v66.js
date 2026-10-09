'use strict';

// Wirtschaft der neuen Vereinswelt. Alle Buchungen besitzen einen stabilen Schlüssel.
const v66SeasonDays=v62Days.seasonEnd+1;
const v66LeaguePrizes=[560,430,330,250,190,140];
// BEGIN NATIONAL SPONSOR BRANDS
const v66SponsorBrands={"GER":[{"id":"voltwerk","name":"Voltwerk","icon":"<path d=\"M8 11h27L20 38h18L24 64h29L69 31H49L62 11H39L26 31H14z\" fill=\"var(--primary)\"/><path d=\"m37 11-11 20h12L24 64 55 25H43l8-14z\" fill=\"var(--secondary)\"/><path d=\"m24 64 14-26H20l9-16\" fill=\"none\" stroke=\"var(--tertiary)\" stroke-width=\"3\"/>","word":"<text x=\"94\" y=\"57\" font-family=\"Arial,sans-serif\" font-size=\"35\" font-weight=\"900\" font-style=\"italic\" letter-spacing=\"-1\">VOLTWERK</text><path d=\"M96 70h153l-6 5H94z\" fill=\"var(--secondary)\"/><path d=\"M253 70h57l-6 5h-57z\" fill=\"var(--tertiary)\"/>"},{"id":"bergquell","name":"Bergquell","icon":"<path d=\"M4 45 25 13l12 17 10-14 24 29Z\" fill=\"var(--primary)\"/><path d=\"m20 21 5-8 8 12-7-3-3 4Z\" fill=\"#f7f4e9\"/><path d=\"m42 23 5-7 7 10-7-3-3 3Z\" fill=\"var(--tertiary)\"/><path d=\"M36 33c-3 8-12 16-12 23a13 13 0 0 0 26 0c0-7-10-15-14-23Z\" fill=\"var(--secondary)\" stroke=\"#f7f4e9\" stroke-width=\"3\"/><path d=\"M8 66h10m38 0h11\" stroke=\"var(--tertiary)\" stroke-width=\"3\"/>","word":"<text x=\"94\" y=\"56\" font-family=\"Georgia,serif\" font-size=\"34\" font-weight=\"700\" letter-spacing=\"-1\">Bergquell</text><path d=\"M96 70h218\" stroke=\"var(--secondary)\" stroke-width=\"2\"/><path d=\"M168 74h72\" stroke=\"var(--tertiary)\" stroke-width=\"2\"/>"},{"id":"nordlauf","name":"Nordlauf","icon":"<path d=\"m8 59 16-44h17L31 42l27-27h15L57 59H40l9-25L22 59Z\" fill=\"var(--primary)\"/><path d=\"m0 64 37-3-3 5H0z\" fill=\"var(--secondary)\"/><path d=\"m38 61 28-2-2 7H35z\" fill=\"var(--tertiary)\"/>","word":"<text x=\"94\" y=\"60\" font-family=\"Arial,sans-serif\" font-size=\"44\" font-weight=\"800\" font-style=\"italic\" letter-spacing=\"-1.6\">nordlauf</text><path d=\"m99 72 75-4-3 6H97z\" fill=\"var(--secondary)\"/><path d=\"m178 68 106-5-4 11H175z\" fill=\"var(--tertiary)\"/>"},{"id":"atlas-reisen","name":"Atlas Reisen","icon":"<circle cx=\"37\" cy=\"38\" r=\"29\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"3\"/><path d=\"m37 2 8 27 27 9-27 8-8 28-9-28L1 38l27-9Z\" fill=\"var(--secondary)\"/><path d=\"m37 2 0 36L1 38l27-9Zm0 36 0 36 8-28 27-8Z\" fill=\"var(--primary)\"/><circle cx=\"37\" cy=\"38\" r=\"5\" fill=\"var(--tertiary)\"/>","word":"<text x=\"94\" y=\"52\" font-family=\"Georgia,serif\" font-size=\"40\" letter-spacing=\"3\">ATLAS</text><text x=\"96\" y=\"76\" font-family=\"Arial,sans-serif\" font-size=\"16\" font-weight=\"700\" letter-spacing=\"7\">REISEN</text>"},{"id":"korn-kruste","name":"Korn & Kruste","icon":"<path d=\"M36 68V15\" stroke=\"var(--primary)\" stroke-width=\"4\"/><path d=\"M36 28C19 29 13 18 14 11c13-1 22 5 22 17Zm0 15C17 44 9 33 10 26c15-1 26 5 26 17Zm0 15C15 59 5 49 6 41c17-1 30 5 30 17Z\" fill=\"var(--secondary)\"/><path d=\"M36 28c17 1 23-10 22-17-13-1-22 5-22 17Zm0 15c19 1 27-10 26-17-15-1-26 5-26 17Zm0 15c21 1 31-9 30-17-17-1-30 5-30 17Z\" fill=\"var(--tertiary)\"/><path d=\"M36 4c-8 6-8 14 0 20 8-6 8-14 0-20Z\" fill=\"var(--primary)\"/>","word":"<text x=\"95\" y=\"47\" font-family=\"Georgia,serif\" font-size=\"33\" font-weight=\"700\">Korn &amp;</text><text x=\"95\" y=\"80\" font-family=\"Georgia,serif\" font-size=\"35\" font-weight=\"700\">Kruste</text><path d=\"M245 46c18 0 34 14 34 31h-39\" fill=\"none\" stroke=\"var(--secondary)\" stroke-width=\"3\"/>"},{"id":"signalwerk","name":"Signalwerk","icon":"<rect x=\"8\" y=\"41\" width=\"12\" height=\"23\" rx=\"2\" fill=\"var(--primary)\"/><rect x=\"29\" y=\"26\" width=\"12\" height=\"38\" rx=\"2\" fill=\"var(--secondary)\"/><rect x=\"50\" y=\"10\" width=\"12\" height=\"54\" rx=\"2\" fill=\"var(--tertiary)\"/><path d=\"M7 12h17m-9-8v16\" stroke=\"var(--primary)\" stroke-width=\"3\"/>","word":"<text x=\"94\" y=\"58\" font-family=\"Arial,sans-serif\" font-size=\"35\" font-weight=\"600\" letter-spacing=\"-1\">signalwerk</text><circle cx=\"302\" cy=\"73\" r=\"3\" fill=\"var(--secondary)\"/><circle cx=\"315\" cy=\"73\" r=\"3\" fill=\"var(--tertiary)\"/>"}],"ENG":[{"id":"hearthgrid","name":"Hearthgrid","icon":"<path d=\"M7 34 37 8l30 26v31H47V43H27v22H7Z\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"5\"/><path d=\"M7 35h60M37 8v21\" stroke=\"var(--secondary)\" stroke-width=\"6\"/><circle cx=\"37\" cy=\"33\" r=\"6\" fill=\"var(--tertiary)\"/>","word":"<text x=\"94\" y=\"46\" font-family=\"Arial,sans-serif\" font-size=\"32\" font-weight=\"800\">HEARTH</text><text x=\"94\" y=\"79\" font-family=\"Arial,sans-serif\" font-size=\"28\" font-weight=\"800\">GRID</text>"},{"id":"brookmere","name":"Brookmere","icon":"<path d=\"M8 15c15-8 43-8 58 0M8 25c15-8 43-8 58 0\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"4\"/><path d=\"M16 36c32-13 50-1 23 11S9 64 61 65\" fill=\"none\" stroke=\"var(--secondary)\" stroke-width=\"7\"/><circle cx=\"12\" cy=\"62\" r=\"4\" fill=\"var(--tertiary)\"/>","word":"<text x=\"94\" y=\"59\" font-family=\"Georgia,serif\" font-size=\"38\" font-weight=\"700\">Brookmere</text>"},{"id":"fleetline","name":"Fleetline","icon":"<path d=\"m5 15 42 0 23 19-13 10-19-16H5Z\" fill=\"var(--primary)\"/><path d=\"m5 36 26 0 20 17-13 10-17-14H5Z\" fill=\"var(--secondary)\"/><path d=\"m5 57 10 0 9 8-8 7-11-4Z\" fill=\"var(--tertiary)\"/>","word":"<text x=\"94\" y=\"59\" font-family=\"Arial,sans-serif\" font-size=\"38\" font-weight=\"800\" font-style=\"italic\">fleetline</text>"},{"id":"wayfarer","name":"Wayfarer","icon":"<path d=\"M8 67V35a29 29 0 0 1 58 0v32\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"5\"/><path d=\"m21 67 11-34h11l11 34Z\" fill=\"var(--secondary)\"/><path d=\"M37 34v9m0 7v12\" stroke=\"var(--tertiary)\" stroke-width=\"3\"/>","word":"<text x=\"94\" y=\"59\" font-family=\"Georgia,serif\" font-size=\"40\" font-weight=\"400\">WAYFARER</text>"},{"id":"oat-oven","name":"Oat & Oven","icon":"<path d=\"M8 58V37a29 29 0 0 1 58 0v21Z\" fill=\"var(--primary)\"/><path d=\"m22 24-6 15m23-21-6 15m22-9-6 15\" stroke=\"var(--secondary)\" stroke-width=\"5\"/><path d=\"M8 64h58\" stroke=\"var(--tertiary)\" stroke-width=\"6\"/>","word":"<text x=\"94\" y=\"46\" font-family=\"Georgia,serif\" font-size=\"32\" font-weight=\"700\">Oat &amp;</text><text x=\"94\" y=\"79\" font-family=\"Georgia,serif\" font-size=\"28\" font-weight=\"700\">Oven</text>"},{"id":"relay-house","name":"Relay House","icon":"<path d=\"m37 7 28 16v32L37 71 9 55V23Z\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"4\"/><path d=\"M22 28 52 46M52 28 22 46M37 18v38\" stroke=\"var(--secondary)\" stroke-width=\"3\"/><circle cx=\"22\" cy=\"28\" r=\"6\" fill=\"var(--tertiary)\"/><circle cx=\"52\" cy=\"46\" r=\"6\" fill=\"var(--tertiary)\"/><circle cx=\"37\" cy=\"57\" r=\"6\" fill=\"var(--tertiary)\"/>","word":"<text x=\"94\" y=\"46\" font-family=\"Arial,sans-serif\" font-size=\"32\" font-weight=\"700\">RELAY</text><text x=\"94\" y=\"79\" font-family=\"Arial,sans-serif\" font-size=\"28\" font-weight=\"700\">HOUSE</text>"}],"ESP":[{"id":"solaria-sur","name":"Solaria Sur","icon":"<circle cx=\"37\" cy=\"37\" r=\"18\" fill=\"var(--secondary)\"/><path d=\"M37 3v10m0 48v10M3 37h10m48 0h10M13 13l7 7m34 34 7 7M13 61l7-7m34-34 7-7\" stroke=\"var(--primary)\" stroke-width=\"5\"/><circle cx=\"37\" cy=\"37\" r=\"7\" fill=\"var(--tertiary)\"/>","word":"<text x=\"94\" y=\"46\" font-family=\"Arial,sans-serif\" font-size=\"32\" font-weight=\"800\">SOLARIA</text><text x=\"94\" y=\"79\" font-family=\"Arial,sans-serif\" font-size=\"28\" font-weight=\"800\">SUR</text>"},{"id":"agua-clara","name":"Agua Clara","icon":"<path d=\"M8 44c0-22 13-34 29-34s29 12 29 34\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"5\"/><path d=\"M23 44c0-12 5-20 14-20s14 8 14 20\" fill=\"none\" stroke=\"var(--secondary)\" stroke-width=\"6\"/><path d=\"M6 55h62M17 66h40\" stroke=\"var(--tertiary)\" stroke-width=\"5\"/>","word":"<text x=\"94\" y=\"59\" font-family=\"Georgia,serif\" font-size=\"35\" font-weight=\"700\">Agua Clara</text>"},{"id":"zancada","name":"Zancada","icon":"<path d=\"m5 19 19 0 17 32-13 19Z\" fill=\"var(--primary)\"/><path d=\"m26 6 18 0 27 42-15 17Z\" fill=\"var(--secondary)\"/><path d=\"m43 26 16-17h15L51 38Z\" fill=\"var(--tertiary)\"/>","word":"<text x=\"94\" y=\"59\" font-family=\"Arial,sans-serif\" font-size=\"40\" font-weight=\"800\" font-style=\"italic\">zancada</text>"},{"id":"ruta-viva","name":"Ruta Viva","icon":"<path d=\"M14 61c-13-19 35-11 40-27S15 31 22 10\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"6\"/><circle cx=\"22\" cy=\"10\" r=\"8\" fill=\"var(--secondary)\"/><circle cx=\"14\" cy=\"61\" r=\"8\" fill=\"var(--tertiary)\"/><path d=\"m58 55 8-7 8 7-8 7Z\" fill=\"var(--secondary)\"/>","word":"<text x=\"94\" y=\"46\" font-family=\"Arial,sans-serif\" font-size=\"32\" font-weight=\"700\">RUTA</text><text x=\"94\" y=\"79\" font-family=\"Arial,sans-serif\" font-size=\"28\" font-weight=\"700\">VIVA</text>"},{"id":"trigo-dorado","name":"Trigo Dorado","icon":"<path d=\"M37 66V19\" stroke=\"var(--primary)\" stroke-width=\"4\"/><ellipse cx=\"37\" cy=\"21\" rx=\"9\" ry=\"16\" fill=\"var(--secondary)\"/><ellipse cx=\"19\" cy=\"36\" rx=\"9\" ry=\"16\" transform=\"rotate(-40 19 36)\" fill=\"var(--tertiary)\"/><ellipse cx=\"55\" cy=\"36\" rx=\"9\" ry=\"16\" transform=\"rotate(40 55 36)\" fill=\"var(--tertiary)\"/><path d=\"M18 63h38\" stroke=\"var(--primary)\" stroke-width=\"4\"/>","word":"<text x=\"94\" y=\"46\" font-family=\"Georgia,serif\" font-size=\"32\" font-weight=\"700\">TRIGO</text><text x=\"94\" y=\"79\" font-family=\"Georgia,serif\" font-size=\"28\" font-weight=\"700\">DORADO</text>"},{"id":"enlace","name":"Enlace","icon":"<rect x=\"5\" y=\"19\" width=\"42\" height=\"26\" rx=\"13\" transform=\"rotate(-32 26 32)\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"7\"/><rect x=\"28\" y=\"32\" width=\"42\" height=\"26\" rx=\"13\" transform=\"rotate(-32 49 45)\" fill=\"none\" stroke=\"var(--secondary)\" stroke-width=\"7\"/><path d=\"m29 43 18-12\" stroke=\"var(--tertiary)\" stroke-width=\"6\"/>","word":"<text x=\"94\" y=\"59\" font-family=\"Arial,sans-serif\" font-size=\"40\" font-weight=\"700\">enlace</text>"}],"ITA":[{"id":"lucevia","name":"Lucevia","icon":"<path d=\"M25 51C1 36 14 8 37 8s36 28 12 43v13H25Z\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"5\"/><path d=\"m26 29 11 19 11-19M37 48v13\" fill=\"none\" stroke=\"var(--secondary)\" stroke-width=\"4\"/><path d=\"M25 66h24M29 73h16\" stroke=\"var(--tertiary)\" stroke-width=\"4\"/>","word":"<text x=\"94\" y=\"59\" font-family=\"Arial,sans-serif\" font-size=\"40\" font-weight=\"600\">lucevia</text>"},{"id":"fontechiara","name":"Fontechiara","icon":"<path d=\"M37 6v38M37 17c-19 0-27 10-27 22m27-22c19 0 27 10 27 22\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"4\"/><path d=\"M5 44h64L57 62H17Z\" fill=\"var(--secondary)\"/><path d=\"M37 62v8M22 72h30\" stroke=\"var(--tertiary)\" stroke-width=\"5\"/>","word":"<text x=\"94\" y=\"59\" font-family=\"Georgia,serif\" font-size=\"31\" font-weight=\"700\">Fontechiara</text>"},{"id":"passo-alto","name":"Passo Alto","icon":"<path d=\"M7 65V44h19V24h19V7h23v17H48v21H29v20Z\" fill=\"var(--primary)\"/><path d=\"m8 28 12-12 13 0-14 12Z\" fill=\"var(--secondary)\"/><path d=\"m45 62 23-23v18L57 68Z\" fill=\"var(--tertiary)\"/>","word":"<text x=\"94\" y=\"46\" font-family=\"Arial,sans-serif\" font-size=\"32\" font-weight=\"800\" font-style=\"italic\">PASSO</text><text x=\"94\" y=\"79\" font-family=\"Arial,sans-serif\" font-size=\"28\" font-weight=\"800\" font-style=\"italic\">ALTO</text>"},{"id":"girovento","name":"Girovento","icon":"<path d=\"M37 37 10 8h27Zm0 0 29-27v27Z\" fill=\"var(--primary)\"/><path d=\"M37 37 27 29v37Zm0 0 8 27H37Z\" fill=\"var(--secondary)\"/><path d=\"M37 37 66 64H37Zm0 0L8 66V37Z\" fill=\"var(--tertiary)\"/><circle cx=\"37\" cy=\"37\" r=\"5\" fill=\"var(--secondary)\"/>","word":"<text x=\"94\" y=\"59\" font-family=\"Georgia,serif\" font-size=\"38\" font-weight=\"400\">GIROVENTO</text>"},{"id":"forno-nobile","name":"Forno Nobile","icon":"<path d=\"M7 66V36a30 30 0 0 1 60 0v30ZM19 66V39a18 18 0 0 1 36 0v27Z\" fill=\"var(--primary)\" fill-rule=\"evenodd\"/><path d=\"M37 34c-15 15-19 20 0 28 19-8 15-13 0-28Z\" fill=\"var(--tertiary)\"/><path d=\"m37 46-6 10 6 6 6-6Z\" fill=\"var(--secondary)\"/>","word":"<text x=\"94\" y=\"46\" font-family=\"Georgia,serif\" font-size=\"32\" font-weight=\"700\">FORNO</text><text x=\"94\" y=\"79\" font-family=\"Georgia,serif\" font-size=\"28\" font-weight=\"700\">NOBILE</text>"},{"id":"retelia","name":"Retelia","icon":"<path d=\"m21 7 17 17-17 17L4 24Z\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"5\"/><path d=\"m53 7 17 17-17 17-17-17Z\" fill=\"none\" stroke=\"var(--secondary)\" stroke-width=\"5\"/><path d=\"m37 36 17 17-17 17-17-17Z\" fill=\"none\" stroke=\"var(--tertiary)\" stroke-width=\"5\"/>","word":"<text x=\"94\" y=\"59\" font-family=\"Arial,sans-serif\" font-size=\"40\" font-weight=\"700\">retelia</text>"}],"FRA":[{"id":"courant-ouest","name":"Courant Ouest","icon":"<path d=\"M37 30V69M22 70h30\" stroke=\"var(--primary)\" stroke-width=\"4\"/><path d=\"M37 31 32 3l13 0Z\" fill=\"var(--primary)\"/><path d=\"M37 31 70 34l-6 12Z\" fill=\"var(--secondary)\"/><path d=\"M37 31 16 57 7 46Z\" fill=\"var(--tertiary)\"/><circle cx=\"37\" cy=\"31\" r=\"5\" fill=\"var(--secondary)\"/>","word":"<text x=\"94\" y=\"46\" font-family=\"Arial,sans-serif\" font-size=\"32\" font-weight=\"700\">COURANT</text><text x=\"94\" y=\"79\" font-family=\"Arial,sans-serif\" font-size=\"28\" font-weight=\"700\">OUEST</text>"},{"id":"source-vive","name":"Source Vive","icon":"<path d=\"M37 63 8 42 8 22 20 10 37 5 54 10 66 22 66 42Z\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"4\"/><path d=\"M37 63V8m0 55L20 12m17 51L54 12\" stroke=\"var(--secondary)\" stroke-width=\"3\"/><path d=\"M37 63 9 28m28 35 28-35M24 70h26\" stroke=\"var(--tertiary)\" stroke-width=\"4\"/>","word":"<text x=\"94\" y=\"46\" font-family=\"Georgia,serif\" font-size=\"32\" font-weight=\"700\">Source</text><text x=\"94\" y=\"79\" font-family=\"Georgia,serif\" font-size=\"28\" font-weight=\"700\">Vive</text>"},{"id":"elan-sport","name":"Élan Sport","icon":"<path d=\"m6 59 35-49h22L40 42h22L18 68Z\" fill=\"var(--primary)\"/><path d=\"m40 42 22 0-44 26Z\" fill=\"var(--tertiary)\"/><path d=\"m8 13 10-8 10 8-10 9Z\" fill=\"var(--secondary)\"/>","word":"<text x=\"94\" y=\"46\" font-family=\"Arial,sans-serif\" font-size=\"32\" font-weight=\"800\" font-style=\"italic\">ÉLAN</text><text x=\"94\" y=\"79\" font-family=\"Arial,sans-serif\" font-size=\"28\" font-weight=\"800\" font-style=\"italic\">SPORT</text>"},{"id":"horizon-bleu","name":"Horizon Bleu","icon":"<path d=\"M8 38a29 29 0 0 1 58 0\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"5\"/><path d=\"M37 9c-18 7-18 22 0 29 18-7 18-22 0-29Z\" fill=\"none\" stroke=\"var(--secondary)\" stroke-width=\"3\"/><path d=\"M3 43h68M12 55h50M22 67h30\" stroke=\"var(--tertiary)\" stroke-width=\"4\"/>","word":"<text x=\"94\" y=\"46\" font-family=\"Georgia,serif\" font-size=\"32\" font-weight=\"400\">HORIZON</text><text x=\"94\" y=\"79\" font-family=\"Georgia,serif\" font-size=\"28\" font-weight=\"400\">BLEU</text>"},{"id":"maison-levain","name":"Maison Levain","icon":"<rect x=\"23\" y=\"4\" width=\"27\" height=\"68\" rx=\"13\" transform=\"rotate(28 37 38)\" fill=\"var(--primary)\"/><path d=\"m39 15 11 5m-17 8 11 5m-18 8 11 5m-17 8 11 5\" stroke=\"var(--secondary)\" stroke-width=\"4\"/><path d=\"m9 66 9-17\" stroke=\"var(--tertiary)\" stroke-width=\"4\"/>","word":"<text x=\"94\" y=\"46\" font-family=\"Georgia,serif\" font-size=\"32\" font-weight=\"700\">Maison</text><text x=\"94\" y=\"79\" font-family=\"Georgia,serif\" font-size=\"28\" font-weight=\"700\">Levain</text>"},{"id":"onde-libre","name":"Onde Libre","icon":"<path d=\"M15 10a32 32 0 0 1 0 60\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"5\"/><path d=\"M15 22a20 20 0 0 1 0 36\" fill=\"none\" stroke=\"var(--secondary)\" stroke-width=\"5\"/><path d=\"M15 34a8 8 0 0 1 0 12\" fill=\"none\" stroke=\"var(--tertiary)\" stroke-width=\"5\"/><circle cx=\"15\" cy=\"40\" r=\"3\" fill=\"var(--secondary)\"/>","word":"<text x=\"94\" y=\"59\" font-family=\"Arial,sans-serif\" font-size=\"35\" font-weight=\"600\">onde libre</text>"}],"POR":[{"id":"mare-energia","name":"Maré Energia","icon":"<path d=\"M9 25c0-22 48-24 52 0-7-10-19-10-24 2-5-9-19-10-28-2Z\" fill=\"var(--primary)\"/><path d=\"M61 25c19 11-3 53-26 43 13-1 19-11 11-21 11 0 18-11 15-22Z\" fill=\"var(--secondary)\"/><path d=\"M35 68C13 77-10 36 9 25 0 36 6 47 19 45c-6 9 0 21 16 23Z\" fill=\"var(--tertiary)\"/>","word":"<text x=\"94\" y=\"46\" font-family=\"Arial,sans-serif\" font-size=\"32\" font-weight=\"700\">MARÉ</text><text x=\"94\" y=\"79\" font-family=\"Arial,sans-serif\" font-size=\"28\" font-weight=\"700\">ENERGIA</text>"},{"id":"agua-serra","name":"Água da Serra","icon":"<path d=\"M7 19h60v42H7Zm10 42V41a10 10 0 0 1 20 0v20Zm20 0V41a10 10 0 0 1 20 0v20Z\" fill=\"var(--primary)\" fill-rule=\"evenodd\"/><path d=\"M7 12h60\" stroke=\"var(--secondary)\" stroke-width=\"6\"/><path d=\"M7 70h60\" stroke=\"var(--tertiary)\" stroke-width=\"4\"/>","word":"<text x=\"94\" y=\"46\" font-family=\"Georgia,serif\" font-size=\"32\" font-weight=\"700\">ÁGUA</text><text x=\"94\" y=\"79\" font-family=\"Georgia,serif\" font-size=\"28\" font-weight=\"700\">DA SERRA</text>"},{"id":"arranque","name":"Arranque","icon":"<path d=\"M14 69V46c0-14 10-25 25-34\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"9\"/><path d=\"M33 69V47c0-9 10-20 23-28\" fill=\"none\" stroke=\"var(--secondary)\" stroke-width=\"9\"/><path d=\"M52 69V48l17-15\" fill=\"none\" stroke=\"var(--tertiary)\" stroke-width=\"9\"/>","word":"<text x=\"94\" y=\"59\" font-family=\"Arial,sans-serif\" font-size=\"40\" font-weight=\"800\" font-style=\"italic\">arranque</text>"},{"id":"rota-atlantica","name":"Rota Atlântica","icon":"<path d=\"M36 7V53H6Z\" fill=\"var(--primary)\"/><path d=\"M42 19 69 53H42Z\" fill=\"var(--secondary)\"/><path d=\"M5 59h65L56 70H18Z\" fill=\"var(--tertiary)\"/>","word":"<text x=\"94\" y=\"46\" font-family=\"Georgia,serif\" font-size=\"32\" font-weight=\"400\">ROTA</text><text x=\"94\" y=\"79\" font-family=\"Georgia,serif\" font-size=\"28\" font-weight=\"400\">ATLÂNTICA</text>"},{"id":"pao-vila","name":"Pão da Vila","icon":"<circle cx=\"37\" cy=\"37\" r=\"29\" fill=\"var(--tertiary)\"/><path d=\"M22 20h10v15H19V25m28-5h9v15H42V20M22 45h12v14H22Zm20 0h14v14H42Z\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"3\"/><path d=\"M10 66h54\" stroke=\"var(--secondary)\" stroke-width=\"4\"/>","word":"<text x=\"94\" y=\"46\" font-family=\"Georgia,serif\" font-size=\"32\" font-weight=\"700\">Pão da</text><text x=\"94\" y=\"79\" font-family=\"Georgia,serif\" font-size=\"28\" font-weight=\"700\">Vila</text>"},{"id":"lusofio","name":"Lusofio","icon":"<path d=\"M10 58V20c0-16 28-16 28 0v38c0 16 28 16 28 0V20\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"6\"/><path d=\"M10 20v38c0 16 28 16 28 0V20c0-16 28-16 28 0v38\" fill=\"none\" stroke=\"var(--secondary)\" stroke-width=\"6\"/><path d=\"M29 36h17\" stroke=\"var(--tertiary)\" stroke-width=\"5\"/>","word":"<text x=\"94\" y=\"59\" font-family=\"Arial,sans-serif\" font-size=\"40\" font-weight=\"600\">lusofio</text>"}]};
const v66SponsorColors={"GER":["#202725","#c72232","#edbd46"],"ENG":["#fff","#c8102e","#fff"],"ESP":["#aa151b","#f1bf00","#aa151b"],"ITA":["#008c45","#fff","#cd212a"],"FRA":["#164a9f","#fff","#ed2939"],"POR":["#006f42","#e42535","#edbd46"]};
// END NATIONAL SPONSOR BRANDS
// Fiktive Sponsorzeichen greifen die Farben des Landes auf, ohne Bilddateien im Spielstand abzulegen.
function v66SponsorBrand(countryId,sponsor){
 const name=typeof sponsor==='string'?sponsor:sponsor?.name;
 return(v66SponsorBrands[countryId]||[]).find(brand=>brand.name===name&&(!sponsor?.brandId||sponsor.brandId===brand.id))||null;
}
function v66SponsorLogoSVG(countryId,sponsor,compact=false){
 const brand=v66SponsorBrand(countryId,sponsor);
 if(!brand)return v66LegacySponsorLogoSVG(countryId,typeof sponsor==='string'?sponsor:sponsor?.name);
 const colors=v66SponsorColors[countryId],dark=['ENG','ITA','FRA'].includes(countryId),background=dark?'#18302e':'#f7f4e9',color=dark?'#f7f4e9':'#202725';
 const artwork=(compact?brand.icon:`<g transform="translate(8 15)">${brand.icon}</g><g fill="currentColor">${brand.word}</g>`).replaceAll('var(--primary)',colors[0]).replaceAll('var(--secondary)',colors[1]).replaceAll('var(--tertiary)',colors[2]);
 return`<svg class="v66-sponsor-logo ${compact?'v97-sponsor-symbol':'v97-sponsor-wordmark'}" data-v66-brand="${brand.id}" viewBox="${compact?'0 0 78 78':'0 0 340 110'}" style="color:${color}" translate="no" aria-hidden="true" focusable="false"><rect width="${compact?78:340}" height="${compact?78:110}" rx="5" fill="${background}"/>${artwork}</svg>`;
}
function v66SponsorGoalLabel(goal){
 return goal.kind==='goals'&&/:LEAGUE$/.test(goal.competition||'')?`Liga: mindestens ${goal.target} Tore`:goal.label;
}
function v66LegacySponsorLogoSVG(countryId,name){
 const colors={ENG:['#ffffff','#c8102e','#ffffff'],ESP:['#aa151b','#f1bf00','#aa151b'],ITA:['#008c45','#ffffff','#cd212a'],GER:['#171717','#dd0000','#ffce00'],FRA:['#164a9f','#ffffff','#ed2939'],POR:['#006f42','#e42535','#e42535']}[countryId]||['#c7f36b','#ffffff','#c7f36b'];
 const initials=String(name||'?').trim().split(/\s+/).map(part=>part[0]).join('').slice(0,2).toUpperCase();
 return`<svg class="v66-sponsor-logo" viewBox="0 0 64 44" aria-hidden="true" focusable="false"><rect width="64" height="44" rx="7" fill="#f5f5ef"/><path d="M3 3h58v12H3z" fill="${colors[0]}"/><path d="M3 16h58v12H3z" fill="${colors[1]}"/><path d="M3 29h58v12H3z" fill="${colors[2]}"/><rect x="17" y="6" width="30" height="32" rx="5" fill="#102126"/><text x="32" y="29" text-anchor="middle" fill="#fff" font-size="17" font-weight="800" font-family="Arial,sans-serif">${escapeHTML(initials)}</text></svg>`;
}
function v66BaseIncome(club){return 1410+club.policy.fans*105+(club.leagueId?0:100)}
function v66Club(career,id){return career.world.clubs.find(club=>club.id===id)}
function v66Contract(career,pid){return career.world.contracts.find(contract=>contract.pid===pid)}
function v66Owner(career,pid){return career.world.clubs.find(club=>club.roster.some(player=>player.pid===pid))||null}
function v66Player(career,pid){const owner=v66Owner(career,pid);return owner?.roster.find(player=>player.pid===pid)||career.world.market.freePlayers.find(player=>player.pid===pid)||career.world.clubs.flatMap(club=>club.retiredPlayers||[]).find(player=>player.pid===pid)}
// Additive Aufzeichnung: alte Spielstände erhalten erst beim nächsten Ereignis ein Teilprotokoll.
function v66EventPoint(career,day=Math.max(0,career.world.calendarCursor)){
 return{season:career.world.season,day,transferDay:['sponsor','open','deadline'].includes(career.world.market?.phase)?career.world.market.day:null};
}
function v66InitCareerEvents(career,fromStart=false){
 return career.world.careerEvents??={version:1,coverage:{fromStart,...v66EventPoint(career)},events:[]};
}
function v66RecordCareerEvent(career,id,type,player,details={},point=v66EventPoint(career)){
 const log=v66InitCareerEvents(career),existing=log.events.find(event=>event.id===id);
 if(existing)return existing;
 const event={id,sequence:log.events.length+1,type,pid:player.pid,playerName:player.name,...point,currency:'credits',...JSON.parse(JSON.stringify(details))};
 log.events.push(event);return event;
}
function v66ContractSnapshot(contract){
 const {id,fromSeason,endSeason,annual,promise,startsAt}=contract;return{id,fromSeason,endSeason,annual,promise,startsAt};
}
function v66RecordRenewal(career,player,contract,before,effectiveFrom){
 return v66RecordCareerEvent(career,`${contract.id}:renewal:${before.endSeason}:${contract.endSeason}`,'renewal',player,{clubId:contract.clubId,before,after:v66ContractSnapshot(contract),effectiveFrom});
}
function v66CareerHistory(career,filters={}){
 const log=career.world.careerEvents,all=log?.events||[];
 const matches=event=>(filters.season===undefined||event.season===filters.season)&&(!filters.pid||event.pid===filters.pid)&&(!filters.clubId||[event.clubId,event.fromClubId,event.toClubId].includes(filters.clubId))&&(!filters.type||event.type===filters.type);
 const events=all.filter(matches),summary={transfers:0,transferFees:0,incoming:0,outgoing:0,income:0,expense:0,renewals:0,contractExpirations:0,youthCompensation:0};
 for(const event of events){
  if(event.type==='transfer'){
   summary.transfers++;summary.transferFees+=event.fee;
   if(!filters.clubId||event.toClubId===filters.clubId){summary.incoming++;summary.expense+=event.fee}
   if(event.fromClubId&&(!filters.clubId||event.fromClubId===filters.clubId)){summary.outgoing++;summary.income+=event.fee}
  }
  if(event.type==='renewal')summary.renewals++;
  if(event.type==='free-agent') {summary.outgoing++;if(event.reason==='contract-expiry')summary.contractExpirations++}
  if(event.type==='youth-promotion'){summary.incoming++;summary.youthCompensation+=event.compensation}
 }
 const open=new Map(),freePeriods=[];
 const period=(start,end)=>{
  const point=event=>event?{season:event.season,day:event.day,transferDay:event.transferDay}:null;
  const until=end||v66EventPoint(career),duration=start?(until.season-start.season)*v66SeasonDays+until.day-start.day:null;
  // Filter bezieht sich auf Beginn oder Ende, nicht auf jeden überlappten Kalendertag.
  if((start&&matches(start))||(end&&matches(end)))freePeriods.push({pid:(start||end).pid,from:point(start),to:point(end),startEventId:start?.id||null,endEventId:end?.id||null,durationSimulationDays:duration===null?null:Math.max(0,duration),status:start?(end?'closed':'open'):'start-not-recorded'});
 };
 for(const event of all){
  if(['free-agent-entry','free-agent','youth-release'].includes(event.type))open.set(event.pid,event);
  else if((event.type==='transfer'&&event.previouslyFree)||['retirement','pool-exit'].includes(event.type)){
   const start=open.get(event.pid);if(start||event.type==='transfer')period(start,event);open.delete(event.pid);
  }
 }
 for(const start of open.values())period(start,null);
 return JSON.parse(JSON.stringify({coverage:log?{status:log.coverage.fromStart?'complete':'partial',...log.coverage}:{status:'not-recorded'},events,summary,freePeriods}));
}
function v66ValidateCareerEvents(career){
 const log=career.world.careerEvents;if(log===undefined)return true;
 const point=value=>value&&Number.isInteger(value.season)&&value.season>=1&&value.season<=career.world.season&&Number.isInteger(value.day)&&value.day>=0&&value.day<=v62Days.seasonEnd&&(value.transferDay===null||Number.isInteger(value.transferDay)&&value.transferDay>=1&&value.transferDay<=5);
 const contract=value=>value&&typeof value.id==='string'&&Number.isInteger(value.fromSeason)&&value.fromSeason>=1&&Number.isInteger(value.endSeason)&&value.endSeason>=value.fromSeason&&Number.isInteger(value.annual)&&value.annual>=60&&Number.isInteger(value.promise)&&value.promise>=0&&value.promise<=10&&Number.isInteger(value.startsAt)&&value.startsAt>=0&&value.startsAt<=v62Days.seasonEnd;
 const club=id=>typeof id==='string'&&career.world.clubs.some(item=>item.id===id),money=value=>Number.isInteger(value)&&value>=0;
 if(!log||log.version!==1||!point(log.coverage)||typeof log.coverage.fromStart!=='boolean'||!Array.isArray(log.events))return false;
 const ids=new Set();
 return log.events.every((event,index)=>{
  if(!event||typeof event.id!=='string'||!event.id||ids.has(event.id)||event.sequence!==index+1||typeof event.pid!=='string'||!event.pid||typeof event.playerName!=='string'||!point(event)||event.currency!=='credits')return false;
  ids.add(event.id);
  if(event.type==='transfer')return club(event.toClubId)&&(event.fromClubId===null||club(event.fromClubId))&&money(event.fee)&&event.previouslyFree===(event.fromClubId===null)&&event.kind===(event.previouslyFree?'free-agent-signing':event.fee===0?'zero-fee-transfer':'paid-transfer')&&contract(event.contract);
  if(event.type==='renewal')return club(event.clubId)&&contract(event.before)&&contract(event.after)&&event.after.endSeason>event.before.endSeason&&event.effectiveFrom&&Number.isInteger(event.effectiveFrom.season)&&event.effectiveFrom.season>=event.season&&event.effectiveFrom.season<=event.season+1&&Number.isInteger(event.effectiveFrom.day)&&event.effectiveFrom.day>=0&&event.effectiveFrom.day<=v62Days.seasonEnd;
  if(event.type==='free-agent')return club(event.fromClubId)&&['contract-expiry','release'].includes(event.reason);
  if(event.type==='youth-release')return club(event.fromClubId);
  if(event.type==='youth-promotion')return club(event.clubId)&&money(event.compensation)&&contract(event.contract);
  if(event.type==='retirement')return club(event.clubId)&&event.reason==='released-youth-unplaced';
  if(event.type==='youth-expiry')return club(event.clubId);
  return event.type==='free-agent-entry'||event.type==='pool-exit'&&event.reason==='free-agent-pool-expired';
 });
}
function v66Skill(player){return player.keeper?(player.gk*2+player.pos+player.air+player.pas)/5:(player.tec+player.pas+player.fin+player.tak+player.pos+player.spd+player.sta+player.air)/8}
function v66Salary(player){const strength=v66Skill(player),ageFactor=player.age<22?.88:player.age>31?.91:1,honours=typeof v74HonourFactor==='function'?v74HonourFactor(player):1;return Math.round((65+Math.pow(Math.max(0,strength-8),2)*5.2)*ageFactor*honours/10)*10}
function v66BaseValue(player){const ageFactor=player.age<23?1.35:player.age>31?.7:1;return Math.max(100,Math.round(v66Salary(player)*(2+Math.max(0,30-player.age)*.035)*ageFactor/10)*10)}
function v66Value(player){return player.marketValue||v66BaseValue(player)}
function v66RefreshMarketValues(career,checkpoint){
 const stamp=`S${career.world.season}:${checkpoint}`;
 for(const player of [...career.world.clubs.flatMap(club=>club.roster),...career.world.market.freePlayers]){
  if(player.marketValueStamp===stamp)continue;
  const form=Math.max(-2,Math.min(2,Number(player.form)||0));
  const target=v66BaseValue(player)*(form>=0?1+form*.09:1+form*.035);
  const previous=player.marketValue||v66BaseValue(player);
  player.marketValue=Math.max(100,Math.round((previous+(target-previous)*(target>=previous?.75:.3))/10)*10);
  player.marketValueStamp=stamp;
 }
}
function v66Book(career,clubId,id,amount,label){
 const club=v66Club(career,clubId);if(!club)throw Error('Verein nicht gefunden.');
 if(club.simulationOnly)return false;
 if(club.ledger.some(item=>item.id===id))return false;
 if(!Number.isFinite(amount))throw Error('Ungültiger Geldbetrag.');
 amount=Math.round(amount);club.balance+=amount;
 club.ledger.push({id,season:career.world.season,day:career.world.paymentSchedule===1?Math.max(0,career.world.calendarCursor):career.world.calendarCursor,amount,label,...(career.world.paymentSchedule===1?{balanceAfter:club.balance}:{})});
 return true;
}
function v66MakeSponsors(career,club){
 const seed=`${career.world.seed}:S${career.world.season}:${club.id}:sponsor`,random=v61Random(seed),brands=v62Shuffle(v66SponsorBrands[club.countryId],`${seed}:names`),fans=club.policy.fans,tradition=club.policy.tradition;
 return Array.from({length:3},(_,index)=>{
  const fixed=Math.round((340+fans*55+tradition*25+(random()-.5)*180)/10)*10;
  const leagueTarget=index===0?4:2,cupTarget=index===1?'SF':'F';
  const goals=club.leagueId?[
   {kind:'league',target:leagueTarget,bonus:Math.round((index===0?150:290+random()*100)/10)*10,label:`Liga: Platz ${leagueTarget} oder besser`},
   index===2?{kind:'goals',competition:`S${career.world.season}:${club.countryId}:LEAGUE`,target:11+club.policy.startingSquad,bonus:240,label:`Liga: mindestens ${11+club.policy.startingSquad} Tore`}:{kind:'cup',target:cupTarget,bonus:Math.round((140+random()*70)/10)*10,label:`Nationaler Pokal: ${cupTarget==='F'?'Finale':'Halbfinale'} erreichen`}
  ]:[{kind:'cup',target:'SF',bonus:180,label:'Nationaler Pokal: Halbfinale erreichen'},index===2?{kind:'goals',competition:`S${career.world.season}:${club.countryId}:CUP`,target:4,bonus:230,label:'Nationaler Pokal: mindestens 4 reguläre Tore'}:{kind:'cup',target:'F',bonus:260,label:'Nationaler Pokal: Finale erreichen'}];
  return{id:`S${career.world.season}:${club.id}:SP${index+1}`,brandId:brands[index].id,name:brands[index].name,fixed,goals};
 });
}
function v66NewFreeAgents(career){
 const season=career.world.season;
 const slotsByCountry=season===1?[[0,2],[4,8],[1,5],[0,9],[2],[6]]:[[0,2,7],[0,4,8],[0,1,5],[0,3,9],[0,2,6],[0,1,6]];
 const usedNames=new Set(career.world.market?.freePlayers?.map(player=>player.name)||[]),generated=[];
 return v61Countries.flatMap(([country],countryIndex)=>{
  const random=v61Random(`${career.world.seed}:S${season}:${country}:free-agents`),quality=2+Math.floor(random()*3),entry={id:`${country}-FREE-S${season}`,profile:[0,0,0,0,0,quality]};
  const roster=v61GenerateRoster(entry,career.world.seed,career.world.playerFoundation?{...career.world.playerFoundation,season:career.world.season}:null);
  return slotsByCountry[countryIndex].map((index,slot)=>{
   const player=roster[index];player.pid=`${career.world.seed}:S${season}:${country}:FREE${slot+1}`;
   if(typeof v153ReidentifyNewPlayer==='function')v153ReidentifyNewPlayer(player);
   player.nation=v79ProfessionalNation(country,player.pid,'free');
   player.name=v79PlayerName(player.nation,player.pid,usedNames);usedNames.add(player.name);
   player.appearance=v61GenerateAppearance(player.pid,player.nation,player.age,[...(career.world.market?.freePlayers||[]),...generated]);generated.push(player);
   player.freeSinceSeason=season;return player;
  });
 });
}
function v66CompactLedger(club,season){
 const recent=club.ledger.filter(item=>item.season>=season-1),older=club.ledger.filter(item=>item.season<season-1),totals=new Map();
 for(const item of older)totals.set(item.season,(totals.get(item.season)||0)+item.amount);
 club.ledger=[...[...totals].sort((a,b)=>a[0]-b[0]).map(([year,amount])=>({id:`S${year}:${club.id}:summary`,season:year,day:v62Days.seasonEnd,amount,label:`Saison ${year} · Finanzsaldo`})),...recent];
}
function v66StartSeason(career){
 const world=career.world,season=world.season;
 world.economyProcessedFixtures=[];
 for(const player of world.market?.freePlayers||[])if(player.freeSinceSeason&&season-player.freeSinceSeason>=(player.youthReleasedSeason?2:4))v66RecordCareerEvent(career,`${player.pid}:pool-exit`,'pool-exit',player,{reason:'free-agent-pool-expired'},{season,day:0,transferDay:1});
 const newFreePlayers=v66NewFreeAgents(career);
 world.market={phase:'sponsor',day:1,freePlayers:[...(world.market?.freePlayers||[]).filter(player=>!player.freeSinceSeason||season-player.freeSinceSeason<(player.youthReleasedSeason?2:4)),...newFreePlayers],pendingBids:[],decisions:[],nextBid:1,saleListings:[],negotiations:[],transferResults:[],nextNegotiation:1};
 for(const player of newFreePlayers)v66RecordCareerEvent(career,`${player.pid}:free-entry`,'free-agent-entry',player,{}, {season,day:0,transferDay:1});
 v66RefreshMarketValues(career,'start');
 for(const club of world.clubs){
  v66CompactLedger(club,season);
  club.salaryDue=0;club.sponsors=v66MakeSponsors(career,club);club.sponsorId=null;
  for(const contract of world.contracts.filter(item=>item.clubId===club.id)){
   if(club.simulationOnly)contract.endSeason=season+1;
   contract.startsAt=0;contract.promiseHits=0;contract.promisePenalty=0;contract.lastPromiseCheck=0;
  }
  v66Book(career,club.id,`S${season}:${club.id}:base`,v66BaseIncome(club),'Jahresgrundbetrag');
  if(club.id!==career.manager.managedClubId){
   const choice=[...club.sponsors].sort((a,b)=>(b.fixed+b.goals.reduce((sum,goal)=>sum+goal.bonus*(club.policy.risk/6),0))-(a.fixed+a.goals.reduce((sum,goal)=>sum+goal.bonus*(club.policy.risk/6),0)))[0];
   v66ChooseSponsor(career,club.id,choice.id);
  }
 }
 career.phase='world-sponsor';
}
function v66Init(career){
 const world=career.world;world.contracts=[];
 v66InitCareerEvents(career,true);
 for(const club of world.clubs){
  const random=v61Random(`${world.seed}:${club.id}:finance`);
  club.balance=club.simulationOnly?0:Math.round((1150+club.policy.fans*175+club.policy.tradition*100+(random()-.5)*260)/10)*10;
  club.salaryDue=0;club.restructuring=false;
  club.ledger=[];
  club.roster.forEach((player,index)=>{
   const years=index===7?1:[1,4,9].includes(index)?2:3;
   if(club.simulationOnly){world.contracts.push(v124SimulationContract(career,club,player));return}
   world.contracts.push({id:`S1:${player.pid}:initial`,pid:player.pid,clubId:club.id,annual:v66Salary(player),fromSeason:1,endSeason:years,startsAt:0,promise:club.leagueId?Math.min(6,2+Math.round(v66Skill(player)/5)):0,promiseHits:0,promisePenalty:0,lastPromiseCheck:0,renewalOffers:0});
  });
 }
 v66StartSeason(career);
}
function v66ChooseSponsor(career,clubId,offerId){
 const club=v66Club(career,clubId),offer=club?.sponsors?.find(item=>item.id===offerId);
 if(!offer||club.sponsorId)throw Error('Das Sponsorangebot ist nicht mehr wählbar.');
 club.sponsorId=offer.id;
 v66Book(career,clubId,`${offer.id}:fixed`,offer.fixed,`Sponsor ${offer.name}: Fixum`);
 if(clubId===career.manager.managedClubId){career.world.market.phase='open';career.phase='world-market';if(typeof v72OpenMarket==='function')v72OpenMarket(career);v66AiPropose(career)}
 return offer;
}
function v66SalaryDue(career,clubId,day=v66SeasonDays){
 if(career.world.seasonFinished)return 0;
 const club=v66Club(career,clubId),remaining=career.world.contracts.filter(item=>item.clubId===clubId).reduce((sum,item)=>sum+item.annual*Math.max(0,day-item.startsAt)/v66SeasonDays,0);
 return Math.round(club.salaryDue+remaining);
}
function v66SettleSection(career,contract,day){
 const club=v66Club(career,contract.clubId);
 club.salaryDue+=contract.annual*Math.max(0,day-contract.startsAt)/v66SeasonDays;
}
function v66CanAfford(career,clubId,price,annual,player=null){
 const club=v66Club(career,clubId),own=clubId===career.manager.managedClubId;
 if(!club||club.simulationOnly||price>0&&(club.balance<price||club.restructuring))return false;
 if(club.restructuring&&price===0){
  if((club.roster.length>=10&&!(player&&!player.keeper&&club.roster.filter(item=>!item.keeper).length<v160WorldConfig(career).fieldPlayers))||annual>220)return false;
  if(own)return true;
 }
 if(own)return true;
 const projected=club.balance-price+(career.world.paymentSchedule===1?v124LeagueRemaining(career,club):v66LeaguePrizes[5])-(v66SalaryDue(career,clubId)+annual);
 return projected>=0;
}
function v66MakeBid(career,buyerId,pid,price,annual,years,promise=0,offerDay=null){
 const market=career.world.market,buyer=v66Club(career,buyerId),seller=v66Owner(career,pid),player=v66Player(career,pid);
 if(buyer?.simulationOnly||seller?.simulationOnly||player?.retiredSeason)throw Error('Simulationsteams und ausgeschiedene Spieler nehmen nicht am Transfermarkt teil.');
 if(!(market.phase==='open'||market.phase==='closed'&&!seller&&!career.world.seasonFinished)||!player||!buyer||seller?.id===buyerId)throw Error('Dieses Angebot ist außerhalb der Transferphase nicht möglich.');
 if(buyer.roster.length>=14)throw Error('Der Kader hat bereits 14 Profis.');
 if(buyerId!==career.manager.managedClubId&&player.keeper&&buyer.roster.filter(item=>item.keeper).length>=3)throw Error('Computermannschaften dürfen höchstens drei Torhüter im Kader haben.');
 price=Number(price);annual=Number(annual);years=Number(years);promise=Number(promise);
 if(!Number.isInteger(price)||price<0||seller&&price===0||!Number.isInteger(annual)||annual<60||!Number.isInteger(years)||years<1||years>3||!Number.isInteger(promise)||promise<0||promise>10)throw Error('Preis, Gehalt oder Laufzeit sind ungültig.');
 if(!buyer.leagueId)promise=0;
 if(!v66CanAfford(career,buyerId,price,annual,player))throw Error('Der Verein kann dieses Angebot nicht finanzieren.');
 if(market.pendingBids.some(bid=>bid.buyerId===buyerId&&bid.pid===pid&&['pending','counter'].includes(bid.status)))throw Error('Für diesen Spieler besteht bereits ein Angebot.');
 const played=v62Fixtures(career).filter(fixture=>fixture.result).length;
 if(market.decisions.some(item=>item.buyerId===buyerId&&item.pid===pid&&item.season===career.world.season&&['rejected','expired'].includes(item.status)&&(seller||played<=item.atPlayed)))throw Error(seller?'Nach einer Ablehnung ist ein neues Angebot erst nächste Saison möglich.':'Eine neue Anfrage ist erst nach einem weiteren Matchtag möglich.');
 const placedDay=market.phase==='open'?market.day:offerDay??Math.max(0,career.world.calendarCursor);
 const bid={id:`S${career.world.season}:B${market.nextBid++}`,pid,buyerId,sellerId:seller?.id||null,price,annual,years,promise,placedDay,expiresDay:market.phase==='open'?Math.min(5,market.day+1):placedDay+1,status:'pending',improved:false};
 market.pendingBids.push(bid);
 if(market.day===5&&market.phase==='open'&&buyerId===career.manager.managedClubId&&!seller){v66TryBid(career,bid);if(typeof v72ReleaseResults==='function')v72ReleaseResults(career)}
 return bid;
}
function v66ResolveFreeDecisions(career,day){
 const bids=career.world.market.pendingBids.filter(item=>item.status==='pending'&&!item.sellerId&&item.placedDay<day),groups=new Map();
 for(const bid of bids){if(!groups.has(bid.pid))groups.set(bid.pid,[]);groups.get(bid.pid).push(bid)}
 for(const offers of groups.values()){
  offers.sort((a,b)=>v66BidAppeal(career,b)-v66BidAppeal(career,a)||a.id.localeCompare(b.id));
  for(const bid of offers)if(v66TryBid(career,bid))break;
 }
}
function v66CloseBid(career,bid,status,reason,notify=true){
 bid.status=status;bid.reason=reason||'';
 if(status==='rejected'||status==='expired')career.world.market.decisions.push({pid:bid.pid,buyerId:bid.buyerId,season:career.world.season,status,atPlayed:v62Fixtures(career).filter(fixture=>fixture.result).length});
 if(notify&&status==='rejected'&&bid.buyerId===career.manager.managedClubId&&!career.world.market.negotiations?.some(item=>item.id===bid.id))v66QueueLegacyResult(career,bid,'rejected',bid.reason);
}
function v66Consent(career,bid){
 const player=v66Player(career,bid.pid),buyer=v66Club(career,bid.buyerId),seller=bid.sellerId&&v66Club(career,bid.sellerId);
 const reference=v66Salary(player),attractiveness=(buyer.policy.tradition-buyer.policy.risk)*.02;
 const role=buyer.leagueId?(bid.promise>=5?-.04:bid.promise<=2?.08:0):0,term=(bid.years-1)*-.025;
 const minimum=Math.round(reference*(1.03-attractiveness+role+term+(seller&&seller.policy.tradition>buyer.policy.tradition?.05:0))/10)*10;
 return{accepted:bid.annual>=minimum,minimum};
}
function v66BidAppeal(career,bid){const club=v66Club(career,bid.buyerId);return bid.annual+bid.years*12+bid.promise*4+club.policy.tradition*5}
function v66Transfer(career,bid){
 if(career.world.transfers.some(event=>event.id===bid.id))return v66Player(career,bid.pid);
 const world=career.world,market=world.market,buyer=v66Club(career,bid.buyerId),seller=bid.sellerId&&v66Club(career,bid.sellerId),player=v66Player(career,bid.pid),old=v66Contract(career,bid.pid);
 if(buyer?.simulationOnly||seller?.simulationOnly||player?.retiredSeason)throw Error('Simulationsteams und ausgeschiedene Spieler nehmen nicht am Transfermarkt teil.');
 if(!player||buyer.roster.length>=14||buyer.id!==career.manager.managedClubId&&player.keeper&&buyer.roster.filter(item=>item.keeper).length>=3||seller&&!seller.roster.some(item=>item.pid===bid.pid)||!v66CanAfford(career,buyer.id,bid.price,bid.annual,player))throw Error('Das Angebot ist inzwischen nicht mehr ausführbar.');
 const day=market.phase==='closed'?bid.placedDay+1:Math.max(0,world.calendarCursor),event=bid.id;
 if(seller){v66SettleSection(career,old,day);seller.roster=seller.roster.filter(item=>item.pid!==bid.pid);v66Book(career,seller.id,`${event}:sale`,bid.price,`Verkauf ${player.name}`)}
 else market.freePlayers=market.freePlayers.filter(item=>item.pid!==bid.pid);
 if(old)world.contracts=world.contracts.filter(item=>item.pid!==bid.pid);
 delete player.youthReleasedSeason;
 buyer.roster.push(player);
 v66Book(career,buyer.id,`${event}:buy`,-bid.price,seller?`Kauf ${player.name}`:`Verpflichtung ${player.name}`);
 world.contracts.push({id:`${event}:contract`,pid:player.pid,clubId:buyer.id,annual:bid.annual,fromSeason:world.season,endSeason:world.season+bid.years-1,startsAt:day,promise:buyer.leagueId?bid.promise:0,promiseHits:0,promisePenalty:0,lastPromiseCheck:0,renewalOffers:0});
 world.transfers.push({id:event,season:world.season,day,pid:player.pid,playerName:player.name,sellerId:seller?.id||null,buyerId:buyer.id,price:bid.price});
 v66RecordCareerEvent(career,event,'transfer',player,{fromClubId:seller?.id||null,toClubId:buyer.id,fee:bid.price,previouslyFree:!seller,kind:!seller?'free-agent-signing':bid.price===0?'zero-fee-transfer':'paid-transfer',contract:v66ContractSnapshot(v66Contract(career,player.pid))},v66EventPoint(career,day));
 v66CloseBid(career,bid,'completed',`${player.name} wechselt zu ${buyer.name}.`);
 if((buyer.id===career.manager.managedClubId||seller?.id===career.manager.managedClubId)&&!market.negotiations?.some(item=>item.id===bid.id))v66QueueLegacyResult(career,bid,'completed',bid.reason);
 for(const other of market.pendingBids.filter(item=>item!==bid&&item.pid===bid.pid&&['pending','counter'].includes(item.status))){
  v66CloseBid(career,other,'rejected','Der Spieler hat einen anderen Verein gewählt.',false);
  if(other.buyerId===career.manager.managedClubId&&!market.negotiations?.some(item=>item.id===other.id))v66QueueLegacyResult(career,{...other,buyerId:buyer.id,sellerId:seller?.id,price:bid.price},'lost',`${player.name} wechselt zu ${buyer.name}.`);
 }
 return player;
}
function v66QueueLegacyResult(career,bid,kind,message){
 const market=career.world.market,id=`${bid.id}:${kind}`;
 if(!Array.isArray(market.transferResults))market.transferResults=[];
 if(market.transferResults.some(item=>item.id===id))return;
 market.transferResults.push({id,negotiationId:bid.id,pid:bid.pid,buyerId:bid.buyerId,sellerId:bid.sellerId,kind,price:bid.price,message,day:market.day,released:false,seen:false});
}
function v66TryBid(career,bid){
 if(bid.status!=='pending')return false;
 const owner=v66Owner(career,bid.pid),player=v66Player(career,bid.pid);
 if(!player||(owner?.id||null)!==bid.sellerId){v66CloseBid(career,bid,'expired','Spieler nicht mehr verfügbar.');return false}
 const seller=owner,priceFloor=seller?Math.round(v66Value(player)*(seller.roster.length<=10?1.45:.9)):0;
 if(seller&&seller.id===career.manager.managedClubId&&!bid.sellerAccepted)return false;
 if(seller&&seller.id!==career.manager.managedClubId&&(seller.roster.length<=10||player.keeper&&seller.roster.filter(item=>item.keeper).length<=1||typeof v72CanCommitSale==='function'&&!v72CanCommitSale(career,seller.id,bid.pid))){v66CloseBid(career,bid,'rejected','Der Verein benötigt diesen Spieler für seinen Kader.');return false}
 if(seller&&seller.id!==career.manager.managedClubId&&!bid.sellerAccepted&&bid.price<priceFloor){v66CloseBid(career,bid,'rejected','Der Verein lehnt die Ablöse ab.');return false}
 if(!v66CanAfford(career,bid.buyerId,bid.price,bid.annual,player)){v66CloseBid(career,bid,'rejected','Das Angebot ist nicht mehr finanzierbar.');return false}
 const consent=v66Consent(career,bid);
 if(!consent.accepted){
  if(bid.buyerId!==career.manager.managedClubId&&!bid.improved){bid.annual=consent.minimum;bid.improved=true;return v66TryBid(career,bid)}
  if(bid.buyerId===career.manager.managedClubId&&!bid.improved){bid.status='counter';bid.counter=consent.minimum;bid.reason=`Der Spieler fordert mindestens ${consent.minimum} Credits Jahresgehalt.`;return false}
  v66CloseBid(career,bid,'rejected','Der Spieler lehnt den Vertrag ab.');return false;
 }
 try{v66Transfer(career,bid);return true}catch(error){v66CloseBid(career,bid,'rejected',error.message);return false}
}
function v66ImproveBid(career,id,annual){
 const bid=career.world.market.pendingBids.find(item=>item.id===id&&item.buyerId===career.manager.managedClubId&&item.status==='counter');
 if(!bid||career.world.seasonFinished||bid.sellerId&&career.world.market.phase!=='open'||bid.improved||!Number.isInteger(Number(annual))||Number(annual)<bid.counter)throw Error('Dieses Folgeangebot ist nicht gültig.');
 bid.annual=Number(annual);bid.improved=true;bid.status='pending';bid.reason='';
 v66TryBid(career,bid);
 if(career.world.market.day===5&&typeof v72ReleaseResults==='function')v72ReleaseResults(career);
 return bid;
}
function v66RespondBid(career,id,accept){
 const bid=career.world.market.pendingBids.find(item=>item.id===id&&item.sellerId===career.manager.managedClubId&&item.status==='pending');
 if(!bid)throw Error('Das Angebot ist nicht mehr offen.');
 if(!accept){v66CloseBid(career,bid,'rejected','Angebot abgelehnt.');return bid}
 bid.sellerAccepted=true;v66TryBid(career,bid);return bid;
}
function v66AiPropose(career){
 const market=career.world.market;if(market.phase!=='open')return;
 const random=v61Random(`${career.world.seed}:S${career.world.season}:D${market.day}:ai-market`);
 const clubs=v62Shuffle(career.world.clubs.filter(club=>!club.simulationOnly&&club.id!==career.manager.managedClubId),`${career.world.seed}:S${career.world.season}:D${market.day}:buyers`);
 for(const buyer of clubs){
  const needKeeper=!buyer.roster.some(player=>player.keeper);
  if(buyer.roster.length>=14||!needKeeper&&buyer.roster.length>=10&&random()>.12)continue;
  const lines=buyer.roster.filter(player=>player.keeper).length>=3||buyer.roster.filter(player=>!player.keeper).length<v160WorldConfig(career).fieldPlayers?['def','mid','att']:['gk','def','mid','att'];
  const desired=needKeeper?'gk':lines.sort((a,b)=>buyer.roster.filter(item=>item.line===a).length-buyer.roster.filter(item=>item.line===b).length)[0];
  const free=market.freePlayers.filter(player=>player.line===desired),sellers=career.world.clubs.filter(club=>!club.simulationOnly&&club.id!==buyer.id&&club.roster.length>10).flatMap(club=>club.roster.filter(player=>player.line===desired&&!market.saleListings?.some(listing=>listing.pid===player.pid&&listing.status==='active')).map(player=>({player,club})));
  const candidates=[...free.map(player=>({player,club:null})),...sellers];if(!candidates.length)continue;
  // Ligavereine suchen im stärkeren Teil des Markts und halten für die Saison Kostenreserve.
  const shortlist=buyer.leagueId?[...candidates].sort((a,b)=>v66Skill(b.player)-v66Skill(a.player)||a.player.pid.localeCompare(b.player.pid)).slice(0,Math.max(6,Math.ceil(candidates.length/3))):candidates;
  const candidate=shortlist[Math.floor(random()*shortlist.length)],price=candidate.club?Math.round(v66Value(candidate.player)*(1.02+random()*.4)/10)*10:0,annual=Math.round(v66Salary(candidate.player)*(1.02+random()*.2)/10)*10;
  if(!v66CanAfford(career,buyer.id,price,annual)||buyer.leagueId&&buyer.balance-price+v66LeaguePrizes[5]-v66SalaryDue(career,buyer.id)-annual<600)continue;
  try{v66MakeBid(career,buyer.id,candidate.player.pid,price,annual,2+Math.floor(random()*2),buyer.leagueId?3:0)}catch{}
 }
}
function v66ResolveDay(career){
 const market=career.world.market,day=market.day,groups=new Map();
 for(const bid of market.pendingBids.filter(item=>item.status==='pending'&&item.placedDay<=day)){
  if(!groups.has(bid.pid))groups.set(bid.pid,[]);groups.get(bid.pid).push(bid);
 }
 for(const bids of groups.values()){
  const ordered=bids.sort((a,b)=>{
   const sa=a.sellerId?b.price-a.price:v66BidAppeal(career,b)-v66BidAppeal(career,a);
   return sa||b.annual-a.annual||a.id.localeCompare(b.id);
  });
  for(const bid of ordered){
   if(bid.status!=='pending')continue;
   if(bid.sellerId===career.manager.managedClubId&&!bid.sellerAccepted)continue;
   if(v66TryBid(career,bid))break;
   if(bid.status==='counter'){
    for(const other of ordered.filter(item=>item!==bid&&item.status==='pending'))other.expiresDay=Math.max(other.expiresDay,Math.min(5,day+1));
    break;
   }
  }
 }
 for(const bid of market.pendingBids.filter(item=>item.status==='pending'&&item.expiresDay<=day))v66CloseBid(career,bid,'expired','Die Angebotsfrist ist abgelaufen.');
 const managed=career.manager.managedClubId;
 market.pendingBids=market.pendingBids.filter(item=>['pending','counter'].includes(item.status)||item.buyerId===managed||item.sellerId===managed);
}
function v66PlayableRoster(club,career){return club.roster.length>=10&&club.roster.length<=14&&club.roster.some(player=>player.keeper)&&club.roster.filter(player=>!player.keeper).length>=v160WorldConfig(career).fieldPlayers}
function v66ReleaseKeeper(career,club,player){
 if(!club.roster.some(item=>item.pid===player.pid))return;
 const world=career.world,contract=v66Contract(career,player.pid),day=Math.max(0,world.calendarCursor),serial=world.transfers.filter(item=>item.season===world.season&&item.pid===player.pid&&item.reason==='Vertragsauflösung').length+1,id=`S${world.season}:${player.pid}:keeper-release:${serial}`;
 if(contract){v66SettleSection(career,contract,day);world.contracts=world.contracts.filter(item=>item!==contract)}
 club.roster=club.roster.filter(item=>item.pid!==player.pid);
 player.freeSinceSeason=world.season;world.market.freePlayers.push(player);
 world.transfers.push({id,season:world.season,day,pid:player.pid,playerName:player.name,sellerId:club.id,buyerId:null,price:0,reason:'Vertragsauflösung'});
 v66RecordCareerEvent(career,id,'free-agent',player,{fromClubId:club.id,reason:'release'});
 v66Book(career,club.id,id,0,`Vertrag aufgelöst: ${player.name}`);
}
function v66ReleaseSurplusKeeper(career,clubId,pid){
 const club=v66Club(career,clubId),player=club?.roster.find(item=>item.pid===pid),market=career.world.market;
 if(clubId!==career.manager.managedClubId||market.phase!=='closed'||career.world.seasonFinished||career.world.activeMatch||club.roster.length!==14||club.roster.filter(item=>!item.keeper).length>=v160WorldConfig(career).fieldPlayers||!player?.keeper||club.roster.filter(item=>item.keeper).length<=1)throw Error('Diese Torwartfreistellung ist nicht möglich.');
 v66ReleaseKeeper(career,club,player);return player;
}
function v66NextMarketDay(career){
 const market=career.world.market;if(!['open','deadline'].includes(market.phase))throw Error('Die Transferphase ist nicht offen.');
 if(typeof v72ResolveDay==='function')v72ResolveDay(career,market.day,market.phase==='deadline');
 if(market.phase==='open')v66ResolveDay(career);
 if(market.day===5){
  if(typeof v72HasPending==='function'&&v72HasPending(career)){if(market.phase==='deadline')throw Error('Bitte öffne die laufenden Verhandlungen und schließe sie ab.');market.phase='deadline';if(typeof v72ReleaseResults==='function')v72ReleaseResults(career);return}
  const own=v66Club(career,career.manager.managedClubId);
  if(!v66PlayableRoster(own,career))throw Error(`Für den Saisonstart brauchst du mindestens zehn Profis, einen Torwart und ${v160WorldConfig(career).fieldPlayers===6?"sechs":"fünf"} Feldspieler. Der letzte Transfertag bleibt offen.`);
  for(const club of career.world.clubs.filter(item=>!item.simulationOnly&&item.id!==own.id)){
   while(club.roster.filter(player=>player.keeper).length>3){const keeper=club.roster.filter(player=>player.keeper).sort((a,b)=>v66Skill(a)-v66Skill(b)||a.pid.localeCompare(b.pid))[0];v66ReleaseKeeper(career,club,keeper)}
   if(club.roster.length<10&&typeof v67AiFillOutfieldFromYouth==='function')v67AiFillOutfieldFromYouth(career,club);
   if(!v66PlayableRoster(club,career))try{v66EmergencySign(career,club)}catch(error){
    if(!/Kein bezahlbarer vereinsloser Spieler/.test(error.message))throw error;
    if(club.roster.length<10&&typeof v67AiFillOutfieldFromYouth==='function')v67AiFillOutfieldFromYouth(career,club,true);
    if(!v66PlayableRoster(club,career))v66EmergencySign(career,club);
   }
  }
  const incomplete=career.world.clubs.find(club=>!v66PlayableRoster(club,career)||club.id!==own.id&&club.roster.filter(player=>player.keeper).length>3);
  if(incomplete)throw Error(`Computerkader ${incomplete.name} ist noch unvollständig.`);
  for(const bid of market.pendingBids.filter(item=>item.status==='counter'))v66CloseBid(career,bid,'expired','Die Transferphase ist beendet.');
  market.phase='closed';career.phase='world-matches';if(typeof v72CloseMarket==='function')v72CloseMarket(career);if(typeof v72ReleaseResults==='function')v72ReleaseResults(career);return;
 }
 market.day++;
 if(typeof v72AdvanceDay==='function')v72AdvanceDay(career);
 v66AiPropose(career);
 if(typeof v72ReleaseResults==='function')v72ReleaseResults(career);
}
function v66EmergencySign(career,club){
 if(club.simulationOnly)return;
 const market=career.world.market;
 while(!v66PlayableRoster(club,career)){
  const needKeeper=!club.roster.some(player=>player.keeper),needField=club.roster.filter(player=>!player.keeper).length<v160WorldConfig(career).fieldPlayers,candidates=market.freePlayers.filter(player=>needKeeper?player.keeper:needField?!player.keeper:!player.keeper||club.roster.filter(item=>item.keeper).length<3).sort((a,b)=>v66Salary(a)-v66Salary(b));
  if(!candidates.length)throw Error(`Kein bezahlbarer vereinsloser Spieler für ${club.name}.`);
  let signed=false;
  for(const player of candidates){const annual=v66Salary(player);if(!v66CanAfford(career,club.id,0,annual))continue;
   const bid=v66MakeBid(career,club.id,player.pid,0,annual,2,club.leagueId?2:0);bid.improved=true;bid.annual=Math.max(annual,v66Consent(career,bid).minimum);signed=v66TryBid(career,bid);if(signed)break;
  }
  if(!signed)throw Error(`Kein bezahlbarer vereinsloser Spieler für ${club.name}.`);
 }
}
function v66RenewalWindow(career,contract){
 if(contract.renewalOffers<2)return{canOffer:true};
 if(contract.renewalRound>=1)return{canOffer:false};
 const lastDay=contract.renewalNegotiation?.day;
 if(!Number.isInteger(lastDay))return{canOffer:false};
 const available=v62Days.seasonEnd-1-lastDay;
 if(available<60)return{canOffer:false};
 const random=v61Random(`${career.world.seed}:S${career.world.season}:${contract.pid}:renewal-window`);
 const nextDay=contract.renewalNextDay??lastDay+60+Math.floor(random()*(Math.min(90,available)-60+1));
 return{canOffer:career.world.calendarCursor>=nextDay,nextDay};
}
function v66Renew(career,pid,annual,years,promise=0){
 const contract=v66Contract(career,pid),club=contract&&v66Club(career,contract.clubId),player=v66Player(career,pid);
 if(!contract||!club||club.id!==career.manager.managedClubId||contract.endSeason!==career.world.season||!player||career.world.seasonFinished)throw Error('Dieser Vertrag kann nicht verlängert werden.');
 const window=v66RenewalWindow(career,contract);
 if(!window.canOffer)throw Error(window.nextDay?`Ein neues Verhandlungsfenster öffnet am ${v62Date(window.nextDay)}.`:'Dieser Vertrag kann nicht verlängert werden.');
 annual=Number(annual);years=Number(years);promise=Number(promise);
 if(!Number.isInteger(annual)||annual<60||!Number.isInteger(years)||years<2||years>3||!Number.isInteger(promise)||promise<0||promise>10)throw Error('Das Vertragsangebot ist ungültig.');
 if(contract.renewalOffers>=2){contract.renewalRound=1;contract.renewalOffers=0;delete contract.renewalNextDay}
 const previous=contract.renewalNegotiation,base=Math.round(v66Salary(player)*1.04/10)*10;
 const concession=previous&&annual>previous.annual?Math.floor((annual-previous.annual)/20)*10:0;
 const requested=Math.max(Math.round(v66Salary(player)/10)*10,(previous?.counter??base)-concession);
 contract.renewalOffers++;
 if(annual<requested){
  const day=career.world.calendarCursor,history=[...(previous?.history??(previous?[{annual:previous.annual,years:previous.years,promise:previous.promise,counter:previous.counter,day:previous.day,round:0}]:[])),{annual,years,promise,counter:requested,day,round:contract.renewalRound??0}];
  contract.renewalNegotiation={annual,years,promise,counter:requested,day,history};
  if(contract.renewalOffers===2&&contract.renewalRound!==1){const available=v62Days.seasonEnd-1-day;if(available>=60){const random=v61Random(`${career.world.seed}:S${career.world.season}:${pid}:renewal-window`);contract.renewalNextDay=day+60+Math.floor(random()*(Math.min(90,available)-60+1))}}
  return{accepted:false,counter:requested};
 }
 const before=v66ContractSnapshot(contract),day=Math.max(0,career.world.calendarCursor);v66SettleSection(career,contract,day);
 contract.annual=annual;contract.endSeason=career.world.season+years-1;contract.startsAt=day;contract.promise=promise;contract.lastPromiseCheck=0;contract.promisePenalty=0;
 delete contract.renewalNegotiation;
 delete contract.renewalNextDay;
 v66Book(career,club.id,`S${career.world.season}:${pid}:renewal:${contract.renewalOffers}`,0,`Vertrag verlängert: ${player.name}`);
 v66RecordRenewal(career,player,contract,before,{season:career.world.season,day});
 return{accepted:true,contract};
}
function v66PromiseCredits(career,player,season,fromDay=0){
 const days=new Map(v62Fixtures(career).map(fixture=>[fixture.id,fixture.day])),matches=player.history.filter(item=>item.season===season&&(days.get(item.fixtureId)??-1)>=fromDay),short=[];let full=0;
 for(const item of matches){const type=item.competitionId.includes('EUROPE')?1.5:item.competitionId.includes('CUP')?(item.fixtureId.includes(':F:')?1:.75):1,weighted=item.minutes*type;if(weighted>=45)full++;else short.push(weighted)}
 return full+Math.floor(short.reduce((sum,value)=>sum+value,0)/45);
}
function v66AfterFixture(career,fixture){
 const world=career.world;if(!world.economyProcessedFixtures||world.economyProcessedFixtures.includes(fixture.id))return;
 world.economyProcessedFixtures.push(fixture.id);
 const managed=career.manager.managedClubId;
 if([fixture.homeId,fixture.awayId].includes(managed)){
  const ownGoals=fixture.homeId===managed?fixture.result.homeGoals:fixture.result.awayGoals,otherGoals=fixture.homeId===managed?fixture.result.awayGoals:fixture.result.homeGoals,award=ownGoals>otherGoals?38:ownGoals===otherGoals?16:0;
  if(award)v66Book(career,managed,`${fixture.id}:match-credit`,award,ownGoals>otherGoals?'Sieg-Credits':'Remis-Credits');
 }
 for(const clubId of [fixture.homeId,fixture.awayId]){
  const club=v66Club(career,clubId);if(!club.leagueId)continue;
  for(const contract of world.contracts.filter(item=>item.clubId===clubId&&item.promise>0)){
   const games=v62Fixtures(career).filter(item=>item.result&&item.day>=contract.startsAt&&(item.homeId===clubId||item.awayId===clubId)).length;
   if(games-contract.lastPromiseCheck<4)continue;
   contract.lastPromiseCheck=games;
   const player=club.roster.find(item=>item.pid===contract.pid),played=v66PromiseCredits(career,player,world.season,contract.startsAt),total=Math.max(games,v62Fixtures(career).filter(item=>item.day>=contract.startsAt&&(item.homeId===clubId||item.awayId===clubId)).length),expected=Math.floor(contract.promise*games/total);
   if(expected-played>=2&&contract.promisePenalty<2){player.form=Math.max(-2,player.form-1);contract.promisePenalty++}
  }
 }
 for(const clubId of [fixture.homeId,fixture.awayId])v66AiSeasonOffer(career,clubId,fixture.day,fixture.id);
}
function v66AiSeasonOffer(career,clubId,day,fixtureId){
 const club=v66Club(career,clubId),market=career.world.market;
 if(club.simulationOnly||market.phase!=='closed'||clubId===career.manager.managedClubId||club.roster.length>=12||day>=v62Days.seasonEnd-1)return;
 const random=v61Random(`${career.world.seed}:${fixtureId}:${clubId}:free-offer`);
 if(club.roster.length>=10&&random()>.075)return;
 const lines=club.roster.filter(player=>player.keeper).length>=3||club.roster.filter(player=>!player.keeper).length<v160WorldConfig(career).fieldPlayers?['def','mid','att']:['gk','def','mid','att'];
 const line=lines.sort((a,b)=>club.roster.filter(item=>item.line===a).length-club.roster.filter(item=>item.line===b).length)[0];
 const candidates=market.freePlayers.filter(player=>player.line===line&&!market.pendingBids.some(bid=>bid.pid===player.pid&&bid.buyerId===clubId&&['pending','counter'].includes(bid.status))).sort((a,b)=>v66Salary(a)-v66Salary(b));
 if(!candidates.length)return;
 const player=candidates[Math.floor(random()*Math.min(4,candidates.length))],annual=Math.round(v66Salary(player)*1.15/10)*10;
 if(!v66CanAfford(career,clubId,0,annual))return;
 try{v66MakeBid(career,clubId,player.pid,0,annual,2,club.leagueId?3:0,day)}catch{}
}
function v66SponsorMet(career,club,goal){
 const competitions=v62Current(career),cup=competitions.find(item=>item.type==='cup'&&item.country===club.countryId);
 if(goal.kind==='league'){
  const league=competitions.find(item=>item.type==='league'&&item.country===club.countryId),ids=career.world.clubs.filter(item=>item.leagueId===club.leagueId).map(item=>item.id);
  return v62Table(league,ids).findIndex(row=>row.clubId===club.id)+1<=goal.target;
 }
 if(goal.kind==='cup')return cup.fixtures.some(item=>(goal.target==='SF'&&['SF','F'].includes(item.round)||goal.target==='F'&&item.round==='F')&&(item.homeId===club.id||item.awayId===club.id));
 if(goal.kind==='goals'){
  const competition=competitions.find(item=>item.id===goal.competition);
  return competition.fixtures.reduce((sum,item)=>sum+(item.result?(item.homeId===club.id?item.result.homeGoals:item.awayId===club.id?item.result.awayGoals:0):0),0)>=goal.target;
 }
 return false;
}
function v66SeasonEnd(career){
 const season=career.world.season;if(career.world.economyClosedSeason===season)return;
 career.world.seasonReviewClubId=career.manager.managedClubId;
 const competitions=v62Current(career);
 for(const club of career.world.clubs){
  if(club.simulationOnly)continue;
  const league=club.leagueId&&competitions.find(item=>item.id===`S${season}:${club.countryId}:LEAGUE`),cup=competitions.find(item=>item.id===`S${season}:${club.countryId}:CUP`),europe=competitions.find(item=>item.type==='europe');
  if(league){const ids=career.world.clubs.filter(item=>item.leagueId===club.leagueId).map(item=>item.id),rank=v62Table(league,ids).findIndex(row=>row.clubId===club.id);v66Book(career,club.id,`S${season}:${club.id}:league-prize`,v66LeaguePrizes[rank],`Ligaprämie · Platz ${rank+1}`)}
  const rounds=cup.fixtures.filter(item=>item.homeId===club.id||item.awayId===club.id).map(item=>item.round),cupPrize=rounds.includes('F')?(cup.winnerId===club.id?270:150):rounds.includes('SF')?90:40;
  if(career.world.paymentSchedule!==1)v66Book(career,club.id,`S${season}:${club.id}:cup-prize`,cupPrize,'Nationale Pokalprämie');
  const european=europe.fixtures.filter(item=>item.result&&(item.homeId===club.id||item.awayId===club.id));
  if(career.world.paymentSchedule!==1&&european.length)v66Book(career,club.id,`S${season}:${club.id}:europe-prize`,european.length*42+(europe.winnerId===club.id?350:0),'Europacup-Prämie');
  const sponsor=club.sponsors.find(item=>item.id===club.sponsorId);
  for(let index=0;index<sponsor.goals.length;index++)if(v66SponsorMet(career,club,sponsor.goals[index]))v66Book(career,club.id,`${sponsor.id}:bonus:${index}`,sponsor.goals[index].bonus,`Sponsorbonus: ${sponsor.goals[index].label}`);
  const salary=v66SalaryDue(career,club.id);v66Book(career,club.id,`S${season}:${club.id}:salary`,-salary,'Jahresgehälter');club.salaryDue=0;
  if(club.id===career.manager.managedClubId){if(club.balance<0)club.restructuring=true;else if(club.restructuring)club.restructuring=false}
  else if(club.balance<0&&!club.restructuring)throw Error(`KI-Verein ${club.name} ist zahlungsunfähig.`);
 }
 const market=career.world.market;
 for(const contract of [...career.world.contracts].filter(item=>!item.simulationOnly&&item.endSeason===season)){
  const club=v66Club(career,contract.clubId),player=club.roster.find(item=>item.pid===contract.pid),random=v61Random(`${career.world.seed}:S${season}:${contract.pid}:ai-renewal`);
  const renewedAnnual=Math.round(Math.max(contract.annual,v66Salary(player))*1.035/10)*10;
  const futureWages=career.world.contracts.filter(item=>item.clubId===club.id&&item.pid!==contract.pid&&item.endSeason>season).reduce((sum,item)=>sum+item.annual,renewedAnnual);
  // Der vorhandene Kassenstand trägt die Entscheidung; für das Folgejahr zählt nur der feste Grundbetrag, kein geschätzter Sponsorertrag.
  const shortRoster=club.roster.length<=10;
  const lastKeeper=player.keeper&&club.roster.filter(item=>item.keeper).length<=1;
  const essential=shortRoster||lastKeeper;
  const affordable=club.balance+v66BaseIncome(club)-futureWages>=(essential?100:450);
  const willing=shortRoster||random()<.76;
  if(club.id!==career.manager.managedClubId&&affordable&&(essential||willing)){
   const before=v66ContractSnapshot(contract);
   contract.endSeason=season+2;contract.fromSeason=season+1;contract.annual=renewedAnnual;contract.renewalOffers=0;
   v66RecordRenewal(career,player,contract,before,{season:season+1,day:0});
   v66Book(career,club.id,`S${season}:${contract.pid}:ai-renewal`,0,`Vertrag verlängert: ${player.name}`);
  }else{club.roster=club.roster.filter(item=>item.pid!==contract.pid);player.freeSinceSeason=season;market.freePlayers.push(player);career.world.contracts=career.world.contracts.filter(item=>item!==contract);const id=`S${season}:${contract.pid}:expiry`;career.world.transfers.push({id,season,day:career.world.calendarCursor,pid:player.pid,playerName:player.name,sellerId:club.id,buyerId:null,price:0,reason:'Vertragsende'});v66Book(career,club.id,id,0,`Vertragsende: ${player.name}`);v66RecordCareerEvent(career,id,'free-agent',player,{fromClubId:club.id,reason:'contract-expiry'})}
 }
 career.world.economyClosedSeason=season;
}
function v66Validate(career){
 if(!v66ValidateCareerEvents(career))return false;
 const world=career.world,market=world.market;if(!market||!['sponsor','open','deadline','closed',...(world.paymentSchedule===1?['budget']:[])].includes(market.phase)||!Array.isArray(world.contracts)||!Array.isArray(market.freePlayers))return false;
 if(world.paymentSchedule!==undefined&&world.paymentSchedule!==1)return false;
 if(world.paymentSchedule===1&&(typeof world.youthBudgetPending!=='boolean'||market.phase==='budget'&&(!world.youthBudgetPending||!v66Club(career,career.manager.managedClubId)?.sponsorId)))return false;
 if(world.paymentSchedule===1&&world.youthBudgetPending!==['sponsor','budget'].includes(market.phase))return false;
 const roster=world.clubs.flatMap(club=>club.roster),all=[...roster,...market.freePlayers],ids=all.map(player=>player.pid),contractIds=world.contracts.map(item=>item.pid);
 if(new Set(ids).size!==ids.length||new Set(contractIds).size!==contractIds.length||contractIds.length!==roster.length)return false;
 if(world.clubs.some(club=>!Number.isFinite(club.balance)||!Number.isFinite(club.salaryDue)||!Array.isArray(club.ledger)||!Array.isArray(club.sponsors)||club.sponsors.length!==3))return false;
 if(world.contracts.some(item=>!v66Owner(career,item.pid)||v66Owner(career,item.pid).id!==item.clubId||item.endSeason<world.season||(v66Club(career,item.clubId).simulationOnly?item.annual!==0||!item.simulationOnly:item.annual<60||item.simulationOnly)))return false;
 if(world.clubs.some(club=>club.simulationOnly&&(world.paymentSchedule!==1||club.leagueId||club.balance!==0||club.salaryDue!==0||club.ledger.length||!Array.isArray(club.retiredPlayers)||club.youthPool.length||club.youthBudget!==0||club.youthInvestmentHistory.length)))return false;
 const retired=world.clubs.flatMap(club=>club.retiredPlayers||[]),retiredIds=retired.map(player=>player.pid);
 if(new Set(retiredIds).size!==retiredIds.length||retiredIds.some(pid=>ids.includes(pid))||retired.some(player=>!Number.isInteger(player.retiredSeason)||player.retiredSeason<1||player.retiredSeason>world.season))return false;
 if(world.clubs.some(club=>club.simulationOnly&&[...club.roster,...club.retiredPlayers].some(player=>!Number.isInteger(player.retirementAge)||player.retirementAge<33||player.retirementAge>38)))return false;
 return market.freePlayers.every(player=>!world.contracts.some(item=>item.pid===player.pid));
}

'use strict';

// Reference lab only. Coordinates are authored against the 1774 × 887 master.
// These semantic regions never depend on detecting colours in the artwork.
const v92Regions={
 portrait:{
  shirt:'M350 391L308 415 237 443 196 475 174 526 148 632 155 647 282 672 283 704 287 827 648 827 655 676 783 647 775 595 745 509 706 466 629 432 574 406 570 443 535 477 471 494 413 479 364 446Z',
  trim:'M351 391L372 388 372 414 413 449 465 466 515 453 554 426 565 401 581 411 572 444 533 478 471 494 413 479 364 446Z M148 632L176 640 224 652 276 655 282 677 256 687 209 679 155 660Z M653 659L704 656 746 641 777 633 783 656 750 670 700 683 652 685Z',
  skin:'M349 238L370 215 398 168 444 169 474 177 516 164 552 179 578 218 580 243 598 243 598 291 571 316 565 402 554 426 515 453 465 466 413 449 372 414 372 325 350 303 335 279 336 248Z M166 684L213 693 261 702 253 756 230 827 136 827 140 765Z M673 695L713 691 765 676 778 727 789 777 789 827 690 827 679 754Z',
  hair:'M349 236L349 193 364 147 405 111 439 89 502 89 549 112 579 150 589 191 585 240 570 216 552 179 516 164 474 177 444 169 398 168 370 215Z M576 299L609 304 631 328 631 369 612 396 586 402 566 387Z',
  faceHoles:'M392 218H463V259H392Z M482 218H548V259H482Z M427 318H510V348H427Z'
 },
 goal:{
  shirt:'M1183 376L1138 385 1080 410 1044 446 1020 499 999 572 1050 562 1103 568 1126 589 1191 566 1226 531 1266 481 1294 467 1330 474 1352 501 1353 550 1327 574 1266 609 1195 663 1121 703 1109 736 1101 827 1470 827 1469 681 1455 616 1510 632 1568 611 1552 550 1526 485 1495 438 1446 405 1365 374 1358 408 1326 439 1271 454 1227 444 1196 414Z',
  trim:'M1183 376L1197 370 1205 395 1238 422 1277 433 1314 422 1340 399 1349 372 1365 374 1358 408 1326 439 1271 454 1227 444 1196 414Z M998 573L1048 560 1103 568 1131 588 1128 605 1093 589 1053 584 1012 597 997 619 989 598Z M1455 616L1482 630 1510 632 1549 618 1568 599 1574 621 1550 641 1510 655 1474 649 1458 639Z',
  skin:'M1150 168L1183 165 1226 163 1258 179 1299 199 1322 223 1346 223 1359 241 1350 272 1329 290 1340 399 1314 422 1277 433 1238 422 1205 395 1197 364 1169 366 1142 349 1128 326 1131 297 1128 287 1142 263 1140 216Z M1012 608L1055 597 1090 602 1117 622 1178 589 1218 550 1254 503 1266 482 1292 468 1328 477 1353 503 1354 547 1327 574 1266 609 1195 663 1134 705 1092 735 1055 734 1027 707 1016 668Z M1476 666L1514 668 1563 647 1580 690 1592 747 1615 793 1619 827 1532 827 1539 797 1512 738Z',
  hair:'M1140 212L1134 178 1146 145 1179 117 1221 97 1273 93 1317 106 1350 137 1376 177 1375 232 1359 242 1346 223 1322 223 1299 199 1258 179 1226 163 1183 165 1150 168Z M1375 218L1406 224 1434 251 1443 293 1433 332 1406 360 1364 369 1342 340 1340 306 1357 276Z',
  faceHoles:'M1135 209H1168V247H1135Z M1170 207H1249V246H1170Z M1157 294H1215V323H1157Z'
 }
};
let v92Serial=0;
function v92ReferenceSVG(kit,skinTone='light',hairColor='brown',mode='portrait'){
 const view=mode==='celebration'?'goal':'portrait',r=v92Regions[view],id=`v92-${++v92Serial}`;
 const rgb=color=>[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255);
 const colorFilter=(name,color,brightness)=>{
  const values=rgb(color).map(c=>`${.2126*c/brightness} ${.7152*c/brightness} ${.0722*c/brightness} 0 0`).join(' ');
  return `<filter id="${id}-${name}" color-interpolation-filters="sRGB"><feColorMatrix values="${values} 0 0 0 1 0"/></filter>`;
 };
 const colors={shirt:[kit.main,.36],trim:[kit.pattern||kit.trim||'#ffffff',.92],skin:[v82Skin[skinTone][1],.65],hair:[v82Hair[hairColor][0],.27]};
 const image='<image href="sprites/player-reference-v92.png" width="1774" height="887"/>';
 const defs=Object.entries(colors).map(([channel,[color,brightness]])=>colorFilter(channel,color,brightness)+`<mask id="${id}-${channel}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1774" height="887"><path d="${r[channel]}" fill="white"/>${channel==='skin'?`<path d="${r.faceHoles}" fill="black"/>`:''}</mask>`).join('');
 const layers=Object.keys(colors).map(channel=>`<g mask="url(#${id}-${channel}-mask)"><g filter="url(#${id}-${channel})">${image}</g></g>`).join('');
 // One authored image per view: no head replacement, geometry distortion or facial overlays.
 return `<svg class="v82-sprite" viewBox="${view==='portrait'?0:887} 0 887 887" role="img" aria-label="${view==='portrait'?'Porträt':'Jubelpose'} des Referenzspielers" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${image}${layers}</svg>`;
}

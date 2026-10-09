/* Doppel 6: original vector award collection. No network, randomness or game state. */
'use strict';
const v119TrophyArt=(()=>{
 const countries=['ENG','ESP','ITA','GER','FRA','POR'],names={ENG:'England',ESP:'Spanien',ITA:'Italien',GER:'Deutschland',FRA:'Frankreich',POR:'Portugal',EU:'Europa'};
 const kinds=['league','cup','top-scorer','player-of-season','man-of-the-match'],labels={league:'Meisterschaft',cup:'Nationaler Pokal',europe:'Europacup','top-scorer':'Torschützenkönig','player-of-season':'Spieler der Saison','man-of-the-match':'Man of the Match'};
 const path=(d,metal='gold',extra='')=>`<path d="${d}" ${extra.includes('fill=')?'':`fill="url(#${metal})"`} stroke="${extra.includes('fill="none"')?`url(#${metal})`:metal==='silver'?'#647787':'#88602a'}" ${extra.includes('stroke-width=')?'':'stroke-width="1.4"'} stroke-linejoin="round" ${extra}/>`;
 const detail=d=>`<path d="${d}" fill="none" stroke="#fff5ce" stroke-opacity=".72" stroke-width="2" stroke-linecap="round"/>`;
 const star=(x,y,r=10)=>{let points=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.46:r;points.push(`${(x+Math.cos(a)*q).toFixed(2)},${(y+Math.sin(a)*q).toFixed(2)}`);}return `<polygon points="${points.join(' ')}" fill="url(#gold)" stroke="#88602a" stroke-width="1.2" stroke-linejoin="round"/>`;};
 const flag=(country,x=49,y=108,w=30,h=5)=>{
  const rect=(a,b,c,d,color)=>`<rect x="${a}" y="${b}" width="${c}" height="${d}" fill="${color}"/>`;
  let content='';if(country==='ENG')content=rect(x,y,w,h,'#f4f5f3')+rect(x+w*.43,y,w*.14,h,'#b9404b')+rect(x,y+h*.34,w,h*.32,'#b9404b');
  else if(country==='ESP')content=['#b83f3e','#f3ca5c','#b83f3e'].map((c,i)=>rect(x,y+i*h/3,w,h/3,c)).join('');
  else if(country==='GER')content=['#25333c','#ba4141','#edc957'].map((c,i)=>rect(x,y+i*h/3,w,h/3,c)).join('');
  else if(country==='POR')content=rect(x,y,w*.4,h,'#357463')+rect(x+w*.4,y,w*.6,h,'#b44346');
  else if(country==='EU')content=rect(x,y,w,h,'#394d91')+`<circle cx="${x+w/2}" cy="${y+h/2}" r="1.5" fill="#efd283"/>`;
  else content=(country==='ITA'?['#45846b','#f0f2e9','#b64949']:['#3b6095','#f0f2e9','#b64949']).map((c,i)=>rect(x+i*w/3,y,w/3,h,c)).join('');
  return `<g>${content}</g>`;
 };
 const base=(country,style=0)=>{
  const tops=['M44 93h40v7H44Z','M48 92h32l5 8H43Z','M45 92h38v8H45Z','M41 94h46v6H41Z','M49 91h30v9H49Z','M43 94l5-4h32l5 4v6H43Z'];
  return path(tops[style%6],'silver')+path('M38 100h52v16H38Z','stone')+`<path d="M40 102h48" stroke="#69727b" stroke-width="1.2"/>`+flag(country)+`<path d="M38 115h52" stroke="#0d1822" stroke-width="2"/>`;
 };
 const ball=(x,y,r,metal='gold')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${metal})" stroke="${metal==='gold'?'#88602a':'#647787'}" stroke-width="1.4"/>`+`<path d="m${x} ${y-r*.45} ${r*.43} ${r*.31} ${-r*.16} ${r*.5}h${-r*.54}l${-r*.16} ${-r*.5}Z" fill="#785625" opacity=".65"/>`+`<path d="M${x} ${y-r}v${r*.55}m${r*.43} ${r*.31} ${r*.52} ${-r*.17}M${x+r*.27} ${y+r*.36}l${r*.3} ${r*.44}m${-r*.84} ${-r*.44} ${-r*.3} ${r*.44}M${x-r*.43} ${y-r*.14}l${-r*.52} ${-r*.17}" fill="none" stroke="#87652e" stroke-width="1.5" opacity=".65"/>`+`<path d="M${x-r*.65} ${y-r*.23}q${r*.08} ${-r*.39} ${r*.46} ${-r*.48}" fill="none" stroke="#fff8df" stroke-width="2" stroke-linecap="round"/>`;
 const league=(country,i)=>{
  const forms=[
   // Crowned, shouldered chalice; an original silhouette, without league marks.
   path('M41 27 44 17 54 24 64 13 74 24 84 17 87 27Z')+path('M39 31h50l-4 27q-3 17-17 20v13h10v4H50v-4h10V78Q46 75 43 58Z','silver')+path('M48 34h32l-3 24q-2 11-13 13T51 58Z')+detail('M52 39 55 58M77 38 74 56'),
   path('M35 29q-17-4-13 17 3 13 23 16M93 29q17-4 13 17-3 13-23 16','silver','fill="none" stroke-width="6"')+path('M41 20h46v26q0 23-18 30v16H59V76Q41 69 41 46Z')+path('M46 18h36v6H46Z','silver')+detail('M48 30v15q0 14 9 19')+star(64,43,10),
   path('M44 89 54 35 64 16 74 35 84 89Z','silver')+path('M54 88 59 41 64 24 69 41 74 88Z')+path('M38 87h52v7H38Z','silver')+detail('M48 82 58 37M68 42l4 37'),
   path('M64 12A37 37 0 1 0 64 86 37 37 0 1 0 64 12Z','silver')+path('M64 20A29 29 0 1 0 64 78 29 29 0 1 0 64 20Z')+`<circle cx="64" cy="49" r="21" fill="none" stroke="#fff6d5" stroke-width="2"/>`+star(64,49,16)+path('M53 87h22v7H53Z','silver'),
   path('M39 27q-14-2-13 14t20 21M89 27q14-2 13 14T82 62','silver','fill="none" stroke-width="6"')+path('M43 18h42l-3 31q-2 18-13 23v20H59V72Q48 67 46 49Z','silver')+path('M48 23h8l4 34h8l4-34h8l-4 38-12 9-12-9Z')+detail('M50 28 54 48'),
   path('M64 13 83 30 80 65 69 77v15H59V77L48 65 45 30Z')+path('M49 31 64 19 79 31 64 44Z','silver')+path('M49 35 62 48v23L52 62Z','silver')+detail('M68 48v20M54 29l8-7')
  ];return forms[i]+base(country,i);
 };
 const cup=(country,i)=>{
  const handles=[['M43 30H24v13q0 19 26 21M85 30h19v13q0 19-26 21',6],['M42 27Q18 13 23 41t28 23M86 27q24-14 19 14T77 64',5],['M44 35Q25 18 25 37t23 23M84 35q19-17 19 2T80 60',5],['M42 27H24v18q0 18 25 21M86 27h18v18q0 18-25 21',6],['M45 29Q26 7 22 31t28 30M83 29q19-22 23 2T78 61',5],['M43 35q-29-11-19 10t27 19M85 35q29-11 19 10T77 64',6]];
  const forms=[
   path('M43 23h42v29q0 19-17 24v14h11v5H49v-5h11V76Q43 71 43 52Z'),
   path('M40 22h48l-6 32q-3 16-14 22v15H58V76Q46 70 43 54Z','silver')+path('M47 23h34l-4 28q-2 15-13 19-11-4-13-19Z'),
   path('M42 27h44l-4 16q-1 24-14 30v17h13v5H47v-5h13V73Q47 67 46 43Z')+path('M48 17h32v10H48Z','silver')+path('M57 13h14v5H57Z'),
   path('M43 22h42v36q0 14-17 19v14H60V77Q43 72 43 58Z','silver')+path('M48 27h32v28q0 10-16 17-16-7-16-17Z')+path('M40 19h48v6H40Z'),
   path('M45 20h38l3 18-5 18q-3 13-13 20v14H60V76Q50 69 47 56l-5-18Z')+path('M44 17h40v5H44Z','silver')+path('M49 29h30l-4 16H53Z','silver'),
   path('M43 24h42q-1 30-17 49v17H58V73Q44 54 43 24Z')+path('M48 17h32v8H48Z','silver')+path('M61 73h6v17h-6Z','silver')
  ];return path(handles[i][0],'silver',`fill="none" stroke-width="${handles[i][1]}"`)+forms[i]+detail(i===2?'M51 33q-1 21 8 31':'M51 31v13q0 12 7 18')+base(country,i);
 };
 const boot=(country,i)=>{
  const forms=[
   'M34 30 53 34 59 58 85 68q11 3 12 16H29V69l9-16Z',
   'M31 39 50 28 61 51 64 58 87 65q12 4 13 18H27V68l10-17Z',
   'M33 31 53 36 57 57 87 70q10 4 10 13H27V70l12-15Z',
   'M31 32h22l10 27 24 9q10 3 12 15H27V66l10-13Z',
   'M36 27 54 34 58 55 85 65q13 5 14 18H28V69l12-16Z',
   'M31 36 50 29 58 52 62 58 87 68q11 4 11 15H27V68l10-14Z'
  ];return path('M47 86h34v8H47Z','silver')+path(forms[i])+path('M27 82h72v6H27Z','silver')+detail('M45 50 58 48M47 56l13-2M52 62l13-2M70 70l14 4')+`<path d="M34 89v4m13-4v4m35-4v4m10-4v4" stroke="#88602a" stroke-width="3"/>`+base(country,i);
 };
 const season=(country,i)=>{
  const supports=[
   path('M49 91 57 59h14l8 32Z','silver'),
   path('M46 91q6-22 14-30h8q-2 13 14 30Z','silver'),
   path('M43 91 55 61h18l12 30H73l-9-20-9 20Z','silver'),
   path('M49 91h30l-9-30H58Z','silver')+detail('M54 85h20'),
   path('M47 91 55 63h18l8 28Z','silver')+path('M58 68h12v21H58Z'),
   path('M45 91 57 60h14l12 31H72l-8-21-8 21Z','silver')
  ];return supports[i]+ball(64,38,24)+base(country,i);
 };
 const mom=(country,i)=>{
  const outlines=[
   path('M64 14A30 30 0 1 0 64 74 30 30 0 1 0 64 14Z'),
   path('M64 12 88 25 94 52 76 75H52L34 52 40 25Z'),
   path('M64 12 91 31 85 62 64 78 43 62 37 31Z'),
   path('M45 16h38l12 28-12 28H45L33 44Z'),
   path('M64 11 94 32 86 61 64 77 42 61 34 32Z'),
   path('M64 12q34 10 31 35T64 78Q30 72 33 47t31-35Z')
  ];return path('M53 70h22l8 23H45Z','silver')+outlines[i]+`<circle cx="64" cy="44" r="22" fill="url(#silver)" stroke="#a49367" stroke-width="1.4"/>`+star(64,44,16)+detail('M45 33q4-9 12-10')+base(country,i);
 };
 const europe=()=>path('M42 31Q16 8 18 37t29 27M86 31q26-23 24 6T81 64','silver','fill="none" stroke-width="6"')+path('M43 17h42v28q0 23-17 32v15H60V77Q43 68 43 45Z','silver')+path('M47 14h34v7H47Z')+path('M53 23h22v24q0 13-11 21-11-8-11-21Z')+star(64,42,9)+detail('M48 26v18q0 15 9 23')+base('EU',0);
 const defs='<defs><linearGradient id="gold" x1="0" x2="1" y1=".12" y2=".3"><stop stop-color="#a87524"/><stop offset=".2" stop-color="#efd080"/><stop offset=".39" stop-color="#fff3c1"/><stop offset=".52" stop-color="#cca24e"/><stop offset=".74" stop-color="#e3c06e"/><stop offset="1" stop-color="#926221"/></linearGradient><linearGradient id="silver" x1="0" x2="1" y1=".15" y2=".4"><stop stop-color="#617686"/><stop offset=".22" stop-color="#c2ced4"/><stop offset=".4" stop-color="#f5fafb"/><stop offset=".58" stop-color="#a6b5be"/><stop offset=".8" stop-color="#d8e0e3"/><stop offset="1" stop-color="#718590"/></linearGradient><linearGradient id="stone" x2="0" y2="1"><stop stop-color="#343f4b"/><stop offset="1" stop-color="#141f2b"/></linearGradient></defs>';
 const cache=new Map(),renderers={league,cup,'top-scorer':boot,'player-of-season':season,'man-of-the-match':mom};
 for(const country of [...countries,'EU'])for(const kind of country==='EU'?['europe','man-of-the-match']:kinds){
  const key=`${country.toLowerCase()}-${kind}`,body=kind==='europe'?europe():renderers[kind](country,countries.indexOf(country)<0?3:countries.indexOf(country))+(country==='EU'?star(29,21,5)+star(99,21,5):'');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">${defs}<ellipse cx="64" cy="119" rx="33" ry="3" fill="#122332" opacity=".14"/>${body}</svg>`;
  cache.set(key,Object.freeze({key,label:`${labels[kind]} · ${names[country]}`,src:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)}));
 }
 return function(country,kind){const key=kind==='europe'?'eu-europe':`${String(country||'EU').toLowerCase()}-${kind}`;return cache.get(key)||cache.get('eu-man-of-the-match');};
})();

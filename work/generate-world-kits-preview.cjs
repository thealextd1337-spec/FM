const fs=require('fs');
const vm=require('vm');

const context=vm.createContext({});
vm.runInContext(fs.readFileSync('dist/world-catalog-v61.js','utf8'),context);
const foundation=fs.readFileSync('dist/world-foundation-v61.js','utf8');
vm.runInContext(foundation.slice(foundation.indexOf('const v61Colors='),foundation.indexOf('function v61ClubColors')),context);
const catalog=vm.runInContext('v61Catalog',context);
const build=vm.runInContext('v61BuildClubKits',context);
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
context.escapeHTML=escape;
vm.runInContext(foundation.slice(foundation.indexOf('function v61ClubColors'),foundation.indexOf('function v61RosterHTML')),context);
const crest=vm.runInContext('v61CrestSVG',context);
const patterns={
 solid:'',
 stripe:'<path d="M17 4v56M29 4v56M41 4v56" stroke="{pattern}" stroke-width="8"/>',
 hoops:'<path d="M5 17h50M5 32h50M5 47h50" stroke="{pattern}" stroke-width="8"/>',
 halves:'<path d="M30 0h30v64H30z" fill="{pattern}"/>',
 diagonal:'<path d="M-15 51 42 -6 69 21 12 78Z" fill="{pattern}"/>',
 pinstripes:'<path d="M12 4v56M20 4v56M28 4v56M36 4v56M44 4v56" stroke="{pattern}" stroke-width="2"/>'
};
function shirt(kit,label,id){
 const pattern=kit.pattern||kit.trim,accent=kit.accent||kit.trim;
 const fill=patterns[kit.style].replaceAll('{pattern}',pattern);
 return `<figure><svg viewBox="0 0 60 64" role="img" aria-label="${escape(label)}" shape-rendering="crispEdges"><defs><clipPath id="clip-${id}"><path d="M11 6 21 2 24 7h12l3-5 10 4 10 13-7 9-6-4v37H14V24l-6 4-7-9Z"/></clipPath></defs><path d="M11 6 21 2 24 7h12l3-5 10 4 10 13-7 9-6-4v37H14V24l-6 4-7-9Z" fill="${kit.main}"/><g clip-path="url(#clip-${id})">${fill}</g><path d="M24 7 30 12 36 7M11 6l-4 8m42-8 4 8M14 60h32" fill="none" stroke="${accent}" stroke-width="3"/><path d="M11 6 21 2 24 7h12l3-5 10 4 10 13-7 9-6-4v37H14V24l-6 4-7-9Z" fill="none" stroke="#18242c" stroke-width="2"/></svg><figcaption>${escape(label)}</figcaption></figure>`;
}
const cards=catalog.map(entry=>{
 const kits=build(entry),id=entry.id.replace(/[^a-z0-9]/gi,'-');
 return `<article class="card"><div class="club"><span class="crest">${crest({...entry,kits})}</span><div><h2>${escape(entry.name)} <small>${escape(entry.id)}</small></h2><p>${escape(entry.colors)} / ${escape(vm.runInContext(`v61KitTertiary['${entry.id}']`,context))}</p></div></div><div class="shirts">${shirt(kits.home,`Heim · ${kits.home.style}`,`${id}-home`)}${shirt(kits.away,`Auswärts · ${kits.away.style}`,`${id}-away`)}${kits.keepers.map((kit,index)=>shirt(kit,`Torwart ${index+1}`,`${id}-keeper-${index}`)).join('')}</div></article>`;
}).join('');
const html=`<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vereinstrikots · 48 Vereine</title><style>body{margin:0;padding:24px;background:#0e1a20;color:#f3f5f2;font:14px system-ui,sans-serif}h1{margin:0 0 5px}header p{color:#b8c9c8;margin:0 0 20px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(268px,1fr));gap:12px}.card{background:#192c33;border:1px solid #426068;border-radius:10px;padding:12px}.club{display:flex;align-items:center;gap:10px;min-height:66px}.crest svg{display:block;width:52px;height:61px}.card h2{font-size:15px;margin:0 0 4px}.card h2 small{font-size:11px;color:#abc5c4;margin-left:6px}.card p{font-size:11px;color:#b8c9c8;margin:0 0 10px}.shirts{display:flex;justify-content:space-between;gap:4px;background:#2b6049;border-radius:7px;padding:7px 2px}.shirts figure{width:25%;margin:0;text-align:center}.shirts svg{display:block;width:54px;height:58px;margin:auto}.shirts figcaption{font-size:10px;color:#dce6df;line-height:1.2;margin-top:5px}@media(max-width:390px){body{padding:12px}}</style><header><h1>Vereinstrikots</h1><p>48 Vereine · Vereinswappen, Heim, Auswärts und zwei Torwarttrikots · neue Karrieren</p></header><main class="grid">${cards}</main></html>`;
fs.writeFileSync('docs/vereinstrikots-vorschau.html',html);
console.log('Vorschau erstellt: docs/vereinstrikots-vorschau.html');

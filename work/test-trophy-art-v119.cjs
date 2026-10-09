'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),context=vm.createContext({escapeHTML:s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))});
vm.runInContext(fs.readFileSync(path.join(root,'dist/trophy-art-v119.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'dist/world-competition-v62.js'),'utf8'),context);
const registry=vm.runInContext('v62AwardSprites',context),seen=new Set();let count=0;
for(const [country,items] of Object.entries(registry))for(const kind of Object.keys(items)){
 const art=vm.runInContext(`v119TrophyArt(${JSON.stringify(country)},${JSON.stringify(kind)})`,context),svg=decodeURIComponent(art.src.slice(art.src.indexOf(',')+1));
 assert.equal(art.key,`${country.toLowerCase()}-${kind}`);assert(!seen.has(svg),'every registry identity has its own vector');seen.add(svg);
 assert(svg.startsWith('<svg ')&&svg.endsWith('</svg>')&&svg.includes('viewBox="0 0 128 128"'));
 assert(!/<(?:image|script|foreignObject|text)\b|https?:\/\//.test(svg.replace('http://www.w3.org/2000/svg','')),'self-contained art without remote assets or visible text');
 assert(svg.length<10000,'bounded vector size');assert.equal(vm.runInContext(`v119TrophyArt('${country}','${kind}')`,context),art,'cached identity');
 for(const compact of [false,true]){
  const html=vm.runInContext(`v62AwardIcon('${country}','${kind}',${compact})`,context);
  assert(html.includes(`data-v119-award="${art.key}"`)&&html.includes('data:image/svg+xml;'));
  assert(html.includes(`width="${compact?24:320}"`)&&html.includes('style="image-rendering:auto"'));
  assert(html.includes('alt="" aria-hidden="true"')&&html.includes('title="'),'decorative image remains paired with existing award text');
 }count++;
}
assert.equal(count,32);assert.equal(seen.size,32);
assert.equal(vm.runInContext('v119TrophyArt("unknown","cup").key',context),'eu-man-of-the-match');
context.unsafeCountry='<script>';context.unsafeKind='" onerror="bad';const unsafe=vm.runInContext('v62AwardIcon(unsafeCountry,unsafeKind)',context);assert(!unsafe.includes('onerror')&&!unsafe.includes('<script>'),'untrusted lookup cannot enter markup');
const old=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(root,'dist/world-competition-v62.js'),'utf8'),old);assert(vm.runInContext('v62AwardIcon("ITA","cup")',old).includes('trophies/ita-cup.png'),'historical no-loader fallback remains');
console.log('PASS: all 32 original vector identities, full/compact mappings, cache, safe fallback and decorative accessibility.');

const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync('dist/player-creation-demo-v90.html','utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match=>match[1]);
const elements=new Map();
const element=id=>{
 if(!elements.has(id))elements.set(id,{value:'',innerHTML:'',textContent:'',hidden:false,events:{},focus(){},addEventListener(type,fn){this.events[type]=fn}});
 return elements.get(id);
};
element('reference-kit').value='club';
const context=vm.createContext({document:{getElementById:element},location:{pathname:'/player-creation-demo-v90.html'},crypto:{randomUUID:()=> 'reference-test'}});
scripts.forEach(script=>vm.runInContext(script,context));
assert.equal(element('name').textContent,'Referenzspieler');
assert.equal(element('result').hidden,false);
const productionRenderer=vm.runInContext('v82SpriteSVG',context);
const ids=new Set();
for(const skin of ['fair','light','warm','medium','brown','deep'])for(const hair of ['black','dark-brown','brown','light-brown','blond','auburn','gray'])for(const kit of ['club','light','dark','red']){
 element('reference-kit').value=kit;element('reference-skin').value=skin;element('reference-hair').value=hair;
 element('reference-kit').events.change();
 for(const [view,left] of [['portrait',0],['goal',887]]){
  const svg=element(view).innerHTML;
  assert(svg.includes(`viewBox="${left} 0 887 887"`));
  for(const matrix of svg.matchAll(/feColorMatrix values="([^"]+)"/g)){
   const values=matrix[1].split(/\s+/).map(Number);
   assert.equal(values.length,20);assert(values.every(Number.isFinite));
  }
  assert(svg.includes('data:image/png;base64,'),'Asset must work offline');
  const localIds=new Set([...svg.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]));
  for(const id of localIds){assert(!ids.has(id),'SVG IDs must be unique across both views and rerenders');ids.add(id)}
  for(const ref of svg.matchAll(/url\(#([^)]+)\)/g))assert(localIds.has(ref[1]),`Missing mask/filter ${ref[1]}`);
 }
}
element('club').value='ITA-1';element('club').events.change();
assert.equal(element('name').textContent,'Referenzspieler');
for(let i=0;i<12;i++)element('create').events.click();
assert.equal(element('serial').textContent,'Spieler 12');
assert(element('portrait').innerHTML.includes('v82-sprite'));
assert(element('goal').innerHTML.includes('fist_chest'));
element('reference-show').events.click();
assert.equal(element('name').textContent,'Referenzspieler');
assert.equal(vm.runInContext('v82SpriteSVG',context),productionRenderer,'Reference lab must not replace production renderer');
const png=fs.readFileSync('dist/sprites/player-reference-v92.png');
assert.equal(png.readUInt32BE(16),1774);assert.equal(png.readUInt32BE(20),887);
console.log('PASS: 168 colour combinations, paired viewports, embedded asset, unique mask IDs, club change, 12 youth players, return to reference; production renderer preserved. Visual approval remains separate.');

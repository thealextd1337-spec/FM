const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('dist/world-physical-v65.js','utf8');
const banner={hidden:true,innerHTML:''},timers=[];
const context=vm.createContext({
 v65Club:(_context,side)=>({name:side?'Gegner FC':'Eigener FC'}),v61CrestSVG:club=>`<svg aria-label="${club.name}"></svg>`,
 v64UiName:pid=>({out:'Alt <Name>',incoming:'Neu & Name',otherOut:'Gegner Alt',otherIn:'Gegner Neu'}[pid]),
 escapeHTML:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'),
 $:()=>banner,v65SwapInfoTimer:0,clearTimeout(){},setTimeout:(fn,ms)=>{timers.push({fn,ms});return 1}
});
vm.runInContext(source.slice(source.indexOf('function v65SwapInfoHTML'),source.indexOf('function v65Stopped')),context);
context.v65ShowSwapInfo({ownSide:1},[{side:1,outPid:'out',inPid:'incoming',minute:65},{side:0,outPid:'otherOut',inPid:'otherIn',minute:65}]);
assert.equal(banner.hidden,false);
assert(banner.innerHTML.includes('Eigener FC')&&banner.innerHTML.includes('Gegner FC'));
assert(banner.innerHTML.includes('Alt &lt;Name&gt;')&&banner.innerHTML.includes('Neu &amp; Name'));
assert.equal((banner.innerHTML.match(/class="v65-swap-change"/g)||[]).length,2);
assert(banner.innerHTML.includes('65′')&&banner.innerHTML.includes('Ausgewechselt')&&banner.innerHTML.includes('Eingewechselt'));
assert.equal(timers[0].ms,4800);
timers[0].fn();assert.equal(banner.hidden,true,'Banner verschwindet weiterhin nach dem bestehenden Zeitfenster');
console.log('Wechselbanner: Teams, mehrere Wechsel, sichere Namen, Richtung, Minute und Ausblenden geprüft.');

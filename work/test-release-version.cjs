'use strict';
// Cross-file release bindings. Feature revisions (e.g. scheduler130) are separate.
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const read=f=>fs.readFileSync(f,'utf8');
const footer=s=>Number(s.match(/<footer><span>Doppel 6 \/ PROTOTYP (\d+)/)?.[1]);
const version=footer(read('dist/index.html'));assert(Number.isInteger(version)&&version>0);
assert.equal(Number(read('dist/index.html').match(/data-d6-release="(\d+)"/)?.[1]),version,'Source runtime release');
// Exercise the actual refresh prefix: an older controller used to overwrite
// the source footer with 130 even though the static release check was green.
const progress=read('dist/progress-v58.js'),a=progress.indexOf('function v58Refresh(){'),b=progress.indexOf(' const state=v58State();',a);
assert(a>=0&&b>a);const label={},menu={};
vm.runInNewContext(progress.slice(a,b)+'}\nv58Refresh();',{document:{documentElement:{getAttribute:()=>String(version)},querySelectorAll:()=>[label]},startScreen:{querySelector:()=>menu}});
assert.equal(label.textContent,'Doppel 6 / PROTOTYP '+version);assert.equal(menu.textContent,label.textContent);
const build=read('work/build.cjs');
assert.equal(Number(build.match(/'PROTOTYP (\d+)'/)?.[1]),version,'Build footer');
assert.equal(Number(build.match(/runtime\.html\?v=(\d+)/)?.[1]),version,'Runtime cache release');
assert.equal(Number(read('dist/unity-match/runtime.js').match(/productVersion:\s*['"](\d+)['"]/)?.[1]),version,'Unity runtime product version');
assert.equal(Number(read('work/generate-3d-documentation.cjs').match(/const docs=\{version:(\d+)\}/)?.[1]),version,'Documentation generator');
const context={window:{}};vm.runInNewContext(read('dist/world-3d-documentation-data-v134.js'),context);
assert.equal(context.window.D6ThreeDocumentation.version,version,'Generated documentation');
console.log('Release '+version+': source/build footer, Unity product metadata, cache and documentation agree');

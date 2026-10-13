'use strict';
// Cross-file release bindings. Feature revisions (e.g. scheduler130) are separate.
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const read=f=>fs.readFileSync(f,'utf8');
const footer=s=>Number(s.match(/<footer><span>Doppel 6 \/ PROTOTYP (\d+)/)?.[1]);
const version=footer(read('dist/index.html'));assert(Number.isInteger(version)&&version>0);
const build=read('work/build.cjs');
assert.equal(Number(build.match(/'PROTOTYP (\d+)'/)?.[1]),version,'Build footer');
assert.equal(Number(build.match(/runtime\.html\?v=(\d+)/)?.[1]),version,'Runtime cache release');
assert.equal(Number(read('dist/unity-match/runtime.js').match(/productVersion:\s*['"](\d+)['"]/)?.[1]),version,'Unity runtime product version');
assert.equal(Number(read('work/generate-3d-documentation.cjs').match(/const docs=\{version:(\d+)\}/)?.[1]),version,'Documentation generator');
const context={window:{}};vm.runInNewContext(read('dist/world-3d-documentation-data-v134.js'),context);
assert.equal(context.window.D6ThreeDocumentation.version,version,'Generated documentation');
console.log('Release '+version+': source/build footer, Unity product metadata, cache and documentation agree');

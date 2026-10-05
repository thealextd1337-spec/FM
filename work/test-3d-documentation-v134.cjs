const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {generate,renderMarkdown}=require('./generate-3d-documentation.cjs');
const docs=generate(),context={window:{}};
vm.runInNewContext(fs.readFileSync('dist/world-3d-documentation-data-v134.js','utf8'),context);
assert.deepEqual(JSON.parse(JSON.stringify(context.window.D6ThreeDocumentation)),docs);
assert.equal(docs.version,109);
for(const lang of ['de','en']){assert.equal(docs[lang].sha256.length,64);assert(docs[lang].html.includes('football-v130.glb'));assert(!docs[lang].html.includes('<script'));}
assert.equal(renderMarkdown('# <script>alert("x")</script>\n\n- A&B'),'<h3>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;</h3>\n<ul>\n<li>A&amp;B</li>\n</ul>');
for(const file of ['dist/index.html','work/build.cjs','work/server.cjs'])for(const name of ['world-3d-documentation-data-v134.js','world-3d-help-v134.js'])assert(fs.readFileSync(file,'utf8').includes(name),file+' includes '+name);
console.log('PASS: DE/EN documentation, escaped markup, deterministic source hashes and source/build/server integration.');

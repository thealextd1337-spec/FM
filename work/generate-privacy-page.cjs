'use strict';
// Public privacy page (dist/datenschutz.html, required by Google Play) rendered from the in-game legal texts in
// dist/legal-v38.js, so both always say the same. The build regenerates it; `--check` fails on a stale copy.
const fs=require('node:fs'),vm=require('node:vm');
const target='dist/datenschutz.html';
function render(){
 const source=fs.readFileSync('dist/legal-v38.js','utf8');
 const slice=start=>{const from=source.indexOf(start),to=source.indexOf('\n',from);if(from<0)throw Error('legal-v38.js: '+start);return source.slice(from,to);};
 const context=vm.createContext({escapeHTML:value=>String(value).replace(/[&<>"']/g,c=>`&#${c.charCodeAt(0)};`)});
 vm.runInContext(slice('const v38Owner=')+'\n'+source.slice(source.indexOf('const v38Pages='),source.indexOf('\n};\n',source.indexOf('const v38Pages='))+3)+'\nglobalThis.pages=v38Pages;',context);
 const sections=['impressum','datenschutz','speicher'].map(id=>{
  const page=context.pages[id];
  // The consent buttons only work inside the game; links between the pages become anchors.
  const html=page.html().replace(/<div class="privacy-actions">[\s\S]*?<\/div>/,'').replace(/<p id="legal-consent-status"[^>]*><\/p>/,'')
   .replace(/<button type="button" class="legal-inline" data-legal-page="(\w+)">([^<]*)<\/button>/g,'<a href="#$1">$2</a>')
   .replace('„Cookies & Speicher“','„Cookies & Speicher“ im Spiel');
  return `<section id="${id}"><h2>${page.title.replace('&','&amp;')}</h2>${html}</section>`;
 });
 return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Datenschutz · Doppel 6</title>
<style>body{max-width:760px;margin:0 auto;padding:24px 18px 48px;font:16px/1.6 "Segoe UI",Arial,sans-serif;color:#202a35;background:#f1f3f5}h1{font-size:28px}h2{margin-top:36px;border-bottom:1px solid #c9d0d6;padding-bottom:6px}h3{margin:22px 0 6px}a{color:#24527a}address{font-style:normal}</style>
</head>
<body>
<h1>Doppel 6 · Impressum und Datenschutz</h1>
<p><a href="/">Zum Spiel</a> · <a href="#impressum">Impressum</a> · <a href="#datenschutz">Datenschutz</a> · <a href="#speicher">Cookies &amp; Speicher</a></p>
${sections.join('\n')}
</body>
</html>
`;
}
function generate(){fs.writeFileSync(target,render());}
module.exports={generate,render};
if(require.main===module){
 if(process.argv.includes('--check')){
  if(fs.readFileSync(target,'utf8')!==render())throw Error(target+' is stale: run node work/generate-privacy-page.cjs');
  console.log('PASS '+target+' matches dist/legal-v38.js');
 }else{generate();console.log('wrote '+target);}
}

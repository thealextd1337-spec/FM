const fs=require('node:fs'),crypto=require('node:crypto');
function renderMarkdown(source){
 const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 const html=[],paragraph=[];let list=false;
 const flush=()=>{if(paragraph.length)html.push('<p>'+escape(paragraph.splice(0).join(' '))+'</p>');};
 for(const raw of source.split(/\r?\n/)){const line=raw.trim();if(!line){flush();if(list){html.push('</ul>');list=false;}continue;}
  const heading=/^(#{1,2}) (.+)$/.exec(line);if(heading){flush();if(list){html.push('</ul>');list=false;}const level=heading[1].length+2;html.push(`<h${level}>${escape(heading[2])}</h${level}>`);}
  else if(line.startsWith('- ')){flush();if(!list){html.push('<ul>');list=true;}html.push('<li>'+escape(line.slice(2))+'</li>');}
  else{if(list){html.push('</ul>');list=false;}paragraph.push(line);}
 }flush();if(list)html.push('</ul>');return html.join('\n');
}
function generate(){const docs={version:116};for(const [lang,file]of [['de','docs/3d-system.md'],['en','docs/3d-system-en.md']]){const source=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');docs[lang]={html:renderMarkdown(source),sha256:crypto.createHash('sha256').update(source).digest('hex')};}fs.writeFileSync('dist/world-3d-documentation-data-v134.js',"'use strict';\n// Generated from docs/3d-system*.md; rebuild with work/build.cjs.\nwindow.D6ThreeDocumentation="+JSON.stringify(docs).replaceAll('<','\\u003c')+';\n');return docs;}
module.exports={generate,renderMarkdown};if(require.main===module){generate();console.log('3D documentation generated (DE/EN).');}

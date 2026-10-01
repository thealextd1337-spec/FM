// Standalone, offline camera demo. Does not touch the Doppel 6 release build.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),source=path.join(root,'dist','camera-prototype');
const read=file=>fs.readFileSync(path.join(source,file),'utf8');
const sounds={};
for(const name of ['pass','shot','whistle','crowd','cheer','net'])sounds[name]=fs.readFileSync(path.join(source,'audio',name+'.wav')).toString('base64');
const safeScript=text=>text.replace(/<\/script/gi,'<\\/script');
// Callback replacements preserve literal dollar sequences inside vendor code.
let html=read('index.html').replace('<link rel="stylesheet" href="camera.css">',()=>'<style>'+read('camera.css')+'</style>');
html=html.replace('<script src="vendor/three-r160.min.js"></script>',()=>'<script>'+safeScript(read('vendor/three-r160.min.js'))+'</script>');
html=html.replace('<script src="../player-model-v105.js"></script>',()=>'<script>'+safeScript(fs.readFileSync(path.join(root,'dist','player-model-v105.js'),'utf8'))+'</script>');
html=html.replace('<script src="../pitch-scene-v98.js"></script>',()=>'<script>'+safeScript(fs.readFileSync(path.join(root,'dist','pitch-scene-v98.js'),'utf8'))+'</script>');
html=html.replace('<script src="camera.js"></script>',()=>'<script>window.D6_AUDIO='+JSON.stringify(sounds)+';</script><script>'+safeScript(read('camera.js'))+'</script>');
fs.mkdirSync(path.join(root,'outputs'),{recursive:true});
const out=path.join(root,'outputs','camera-prototype.html');fs.writeFileSync(out,html);
console.log('Standalone camera prototype:',out,'('+fs.statSync(out).size+' bytes)');

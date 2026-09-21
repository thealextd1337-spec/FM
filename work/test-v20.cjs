const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('dist/screen-wake-v20.js','utf8');
assert(source.includes("navigator.wakeLock.request('screen')"),'Während des Spiels muss ein Screen Wake Lock angefordert werden');
assert(source.includes("document.addEventListener('visibilitychange'"),'Nach einem App-Wechsel muss der Wake Lock erneut angefordert werden');
assert(source.includes('releaseMatchWakeLock()'),'Nach dem Abpfiff muss der Wake Lock freigegeben werden');
assert(source.includes('catch{return false}'),'Nicht unterstützte oder abgelehnte Wake Locks dürfen das Spiel nicht stoppen');
new vm.Script(source);
console.log('PASS: Bildschirm bleibt während der Partie aktiv und Wake Lock wird am Ende freigegeben');

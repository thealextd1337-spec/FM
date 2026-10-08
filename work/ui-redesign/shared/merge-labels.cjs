'use strict';
const fs=require('node:fs'),path=require('node:path');
const file=path.resolve(__dirname,'../../../dist/i18n-v75.js'),packages=path.resolve(__dirname,'../packages');
let source=fs.readFileSync(file,'utf8');
const extra={'Hilfe & Einstellungen':'Help & settings','Zum Hauptinhalt':'Skip to main content','Heimspiel':'Home match','Auswärtsspiel':'Away match','Erfasste Vereinswerte. Fehlende frühere Statistiken und nicht mehr gespeicherte Spieler werden nicht ergänzt.':'Recorded club statistics. Missing earlier statistics and players no longer stored are not reconstructed.','Zweikampfversuche':'Tackle attempts','Gewonnene Zweikämpfe':'Tackles won','Elfmeter verwandelt':'Penalties scored','Elfmeter verschossen':'Penalties missed'};
for(const name of fs.readdirSync(packages)){const labels=path.join(packages,name,'labels.json');if(!fs.existsSync(labels))continue;for(const [key,value] of Object.entries(JSON.parse(fs.readFileSync(labels,'utf8')))){if(typeof value==='string')extra[key]=value;else if(typeof value?.de==='string'&&typeof value?.en==='string')extra[value.de]=value.en;else throw Error('Invalid label in '+labels+': '+key);}}
const add=Object.entries(extra).filter(([de])=>!source.includes('\n'+de+'\t')).map(([de,en])=>de+'\t'+en).join('\n');
if(add){source=source.replace('const labels=new Map(`','const labels=new Map(`\n'+add);fs.writeFileSync(file,source);}
console.log('Added '+(add?add.split('\n').length:0)+' labels.');

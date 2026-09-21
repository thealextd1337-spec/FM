const fs=require('fs');
const path='dist/manager.js';let source=fs.readFileSync(path,'utf8');source=source.replace('Die Spielzusammenfassungen werden höchstens 90 Tage gespeichert.','Spielzusammenfassungen, die älter als 90 Tage sind, werden beim nächsten Dateneingang gelöscht.');fs.writeFileSync(path,source);
source=source.replace('Object.assign(homeKeeper,structuredClone(slot.keeper));','{for(const key of Object.keys(homeKeeper))delete homeKeeper[key];Object.assign(homeKeeper,structuredClone(slot.keeper))};');fs.writeFileSync(path,source);
const htmlPath='dist/index.html';fs.writeFileSync(htmlPath,fs.readFileSync(htmlPath,'utf8').replaceAll('PROTOTYP 09','PROTOTYP 10'));

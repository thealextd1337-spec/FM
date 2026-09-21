const fs=require('fs');
const path='dist/manager-v11.js';
let source=fs.readFileSync(path,'utf8');
source=source.replace('<p id="subtitle">${done?', '<p class="center-subtitle">${done?');
fs.writeFileSync(path,source);

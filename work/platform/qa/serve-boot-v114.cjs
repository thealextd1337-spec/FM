'use strict';
// Actual source files, with only the final start stylesheet adapter delayed.
// T3 can inspect first paint before the native page is revealed.
const {createServer}=require('../../ui-redesign/serve.cjs');
const server=createServer(),serve=server.listeners('request')[0];
server.removeAllListeners('request');server.on('request',(req,res)=>{
 if(new URL(req.url,'http://localhost').pathname==='/source/ui-flutlicht/start.js')return setTimeout(()=>serve(req,res),12000);
 serve(req,res);
});
server.listen(4522,'127.0.0.1',()=>console.log('Delayed source start: http://127.0.0.1:4522/source/index.html'));

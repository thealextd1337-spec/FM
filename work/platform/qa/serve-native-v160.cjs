'use strict';
const fs=require('node:fs'),path=require('node:path'),{createServer}=require('../../ui-redesign/serve.cjs');
const server=createServer(),serveSource=server.listeners('request')[0],root=path.resolve(__dirname,'../../..');
server.removeAllListeners('request');server.on('request',(req,res)=>{
 if(new URL(req.url,'http://localhost').pathname!=='/native-build.html')return serveSource(req,res);
 res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-cache');fs.createReadStream(path.join(root,'outputs/index.html')).pipe(res);
});
server.listen(Number(process.env.D6_NATIVE_QA_PORT)||4521,'127.0.0.1',()=>console.log('Native source/build QA: http://127.0.0.1:4521'));

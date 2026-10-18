'use strict';
// Real source client plus its matching local Unity payload; fixture server stays reusable.
const {createServer}=require('./ui-redesign/serve.cjs');
const server=createServer(),source=server.listeners('request')[0],port=Number(process.env.SECHSER_PORT||4290);
server.removeAllListeners('request');
server.on('request',(req,res)=>{const url=new URL(req.url,'http://localhost');if(url.pathname==='/'){res.writeHead(302,{Location:'/source/index.html'+url.search});res.end();}else source(req,res);});
server.listen(port,'127.0.0.1',()=>console.log(`Doppel 6: http://127.0.0.1:${port}/`));

'use strict';
// Offline start for the installed app. Pages and runtime are network-first (online always gets the
// current release); Unity build files carry their content hash in ?v= and are cache-first.
const CACHE='doppel6-offline-1';
// The first visit is not yet controlled, so the start page is stored at install (usually from the HTTP cache).
// A failed copy must not block the worker: the next online start stores the page network-first.
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.add('/')).catch(()=>{}));});
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name!==CACHE)await caches.delete(name);
 await self.clients.claim();
})()));
// Only the game itself: the old /3d/ preview with its downloads and /api/ stay outside.
const game=url=>url.pathname==='/'||url.pathname==='/index.html'||/^\/(unity|unity-match|icons)\//.test(url.pathname)||['/manifest.webmanifest','/datenschutz.html'].includes(url.pathname);
const hashed=url=>url.pathname.startsWith('/unity/Build/')&&url.searchParams.has('v');
// Everything else is stored once per path, so ?v=136 and ?v=137 replace each other.
const pathKey=url=>url.origin+url.pathname;
const unchanged=(old,fresh)=>!!old&&['etag','last-modified'].some(name=>fresh.headers.get(name))&&
 ['etag','last-modified','content-length'].every(name=>old.headers.get(name)===fresh.headers.get(name));
async function networkFirst(event,url){
 const cache=await caches.open(CACHE),key=pathKey(url);
 let response;
 // By URL: a navigate-mode Request cannot take an init; no-cache revalidates instead of trusting heuristic freshness.
 try{response=await fetch(event.request.url,{cache:'no-cache'});}
 catch(error){const cached=await cache.match(key);if(cached)return cached;throw error;}
 // Skip rewriting the 92 MB page when the server reports the same version.
 if(response.status===200&&response.type==='basic'&&!unchanged(await cache.match(key),response))event.waitUntil(cache.put(key,response.clone()));
 return response;
}
async function cacheFirst(event,url){
 const cache=await caches.open(CACHE),cached=await cache.match(event.request);
 if(cached)return cached;
 const response=await fetch(event.request);
 if(response.status===200&&response.type==='basic'){
  const copy=response.clone();
  event.waitUntil((async()=>{
   for(const old of await cache.keys())if(new URL(old.url).pathname===url.pathname)await cache.delete(old);
   await cache.put(event.request,copy);
  })());
 }
 return response;
}
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||!game(url)||event.request.headers.has('range'))return;
 event.respondWith(hashed(url)?cacheFirst(event,url):networkFirst(event,url));
});

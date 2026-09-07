const V="koldiha-v5";
self.addEventListener("install",e=>{e.waitUntil(self.skipWaiting());});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(cache=>cache.put(e.request,c));return r;}).catch(()=>caches.match(e.request)));
});

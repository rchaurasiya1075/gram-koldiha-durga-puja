const CACHE="koldiha-shell-v11";
self.addEventListener("install",e=>e.waitUntil(self.skipWaiting()));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  if(/googleapis|gstatic|firebase|jitsi|meet\.jit/i.test(e.request.url)){
    if(/jitsi|meet\.jit/i.test(e.request.url)){e.respondWith(Response.error());return;}
    return;
  }
  e.respondWith(fetch(e.request,{cache:"no-store"}).catch(()=>caches.match(e.request)));
});

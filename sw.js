const CACHE="koldiha-shell-v10";
const PRECACHE=["./","./index.html","./addr-ui.js","./styles.css","./app.js","./donate.js","./live-embed.js","./firebase-config.js"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(PRECACHE);}).then(function(){return self.skipWaiting();}).catch(function(){return self.skipWaiting();}));});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener("fetch",function(e){
  var req=e.request;if(req.method!=="GET")return;
  if(/googleapis|gstatic|firebase/i.test(req.url))return;
  e.respondWith(fetch(req).then(function(res){if(res&&res.ok){var c=res.clone();caches.open(CACHE).then(function(x){x.put(req,c);});}return res;}).catch(function(){return caches.match(req,{ignoreSearch:true});}));
});

const CACHE="koldiha-shell-v12";
const PRECACHE=[
  "./","./index.html","./styles.css","./manifest.json",
  "./firebase-config.js","./app.js","./voice.js","./voice-ui.js","./install-pwa.js"
];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(PRECACHE);}).then(function(){return self.skipWaiting();}).catch(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
function isAPI(url){return /googleapis|gstatic|firebase|jitsi|meet\.jit/i.test(url);}
self.addEventListener("fetch",function(e){
  var req=e.request;
  if(req.method!=="GET")return;
  if(isAPI(req.url))return;
  e.respondWith(
    caches.match(req,{ignoreSearch:true}).then(function(hit){
      var net=fetch(req).then(function(res){
        if(res&&res.ok){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy);});}
        return res;
      }).catch(function(){return hit||caches.match("./index.html");});
      return hit||net;
    })
  );
});

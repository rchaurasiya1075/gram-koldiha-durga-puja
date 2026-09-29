const CACHE="koldiha-net-v81";
self.addEventListener("install",function(e){
  self.skipWaiting();
  e.waitUntil(Promise.resolve());
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}).then(function(){
    return self.clients.matchAll({type:"window"});
  }).then(function(list){
    list.forEach(function(c){if(c.navigate)c.navigate(c.url);});
  }));
});
function isAPI(url){return /googleapis|gstatic|firebaseio|firebasestorage|identitytoolkit/i.test(url);}
self.addEventListener("fetch",function(e){
  var req=e.request;
  if(req.method!=="GET"||isAPI(req.url))return;
  e.respondWith(fetch(req).then(function(res){
    if(res&&res.ok){
      var copy=res.clone();
      caches.open(CACHE).then(function(c){c.put(req,copy);});
    }
    return res;
  }).catch(function(){
    return caches.match(req,{ignoreSearch:true}).then(function(hit){return hit||caches.match("./index.html");});
  }));
});

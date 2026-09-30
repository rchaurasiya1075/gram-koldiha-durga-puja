const CACHE="koldiha-net-v86";
self.addEventListener("install",function(e){
  self.skipWaiting();
  e.waitUntil(Promise.resolve());
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){if(k===CACHE)return;return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener("notificationclick",function(e){
  e.notification.close();
  var page=(e.notification.data&&e.notification.data.page)||"chat";
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(function(list){
    var client=list[0];
    if(client){
      client.postMessage({type:"open",page:page});
      return client.focus();
    }
    return self.clients.openWindow("./index.html#/"+page);
  }));
});
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

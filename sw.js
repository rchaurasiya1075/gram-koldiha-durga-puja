const CACHE="koldiha-shell-v9";
const PRECACHE=[
  "./",
  "./index.html",
  "./styles.css",
  "./gal.css",
  "./theme.css",
  "./work.css",
  "./chat.css",
  "./app.js",
  "./auth.js",
  "./extra.js",
  "./home-ui.js",
  "./nav-fix.js",
  "./donate.js",
  "./access.js",
  "./share.js",
  "./gal-perm.js",
  "./social.js",
  "./chat-ui.js",
  "./notify.js",
  "./firebase-config.js",
  "./manifest.json"
];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(PRECACHE);}).then(function(){return self.skipWaiting();}).catch(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
function sameOrigin(url){
  try{return new URL(url).origin===self.location.origin;}catch(e){return false;}
}
function isFirebase(url){
  return /googleapis|gstatic|firebaseio|firebasestorage|google\.com\/maps/i.test(url);
}
self.addEventListener("fetch",function(e){
  var req=e.request;
  if(req.method!=="GET")return;
  if(isFirebase(req.url))return;
  if(!sameOrigin(req.url))return;
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
self.addEventListener("notificationclick",function(e){
  e.notification.close();
  var url=e.notification.data&&e.notification.data.url;
  e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(function(list){
    for(var i=0;i<list.length;i++){if(list[i].focus)return list[i].focus();}
    if(clients.openWindow)return clients.openWindow(url||"./index.html");
  }));
});

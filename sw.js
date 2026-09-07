const V="koldiha-v8";
self.addEventListener("install",e=>e.waitUntil(self.skipWaiting()));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith(fetch(e.request,{cache:"no-store"}).catch(()=>caches.match(e.request)));
});
self.addEventListener("notificationclick",function(e){
  e.notification.close();
  var url=e.notification.data&&e.notification.data.url;
  e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(function(list){
    for(var i=0;i<list.length;i++){if(list[i].focus)return list[i].focus();}
    if(clients.openWindow)return clients.openWindow(url||"./index.html");
  }));
});
self.addEventListener("push",function(e){
  var data={};
  try{data=e.data?e.data.json():{};}catch(err){data={title:"कोलडिहा पूजा",body:e.data&&e.data.text()};}
  e.waitUntil(self.registration.showNotification(data.title||"कोलडिहा पूजा",{
    body:data.body||"नई सूचना",
    icon:"./icon.svg",
    badge:"./icon.svg",
    data:{url:data.url||"./index.html"}
  }));
});

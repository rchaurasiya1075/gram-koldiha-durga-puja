function refreshOpen(){
  try{
    if(typeof renderHome==="function")renderHome();
    if(typeof applyFest==="function")applyFest();
    if(typeof tickFest==="function")tickFest();
    if(typeof showSlide==="function")showSlide();
    if(typeof showTicker==="function")showTicker();
    var id=(document.querySelector(".page.on")||{}).id;
    if(id==="p-live"&&typeof renderLive==="function")renderLive();
    if(id==="p-donate"&&typeof renderDon==="function")renderDon();
    if(id==="p-news"&&typeof renderNews==="function")renderNews();
    if(id==="p-events"&&typeof renderEvents==="function")renderEvents();
    if(id==="p-gallery"&&typeof renderGal==="function")renderGal();
    if(id==="p-aarti"&&typeof renderAarti==="function")renderAarti();
    if(id==="p-admin"&&typeof renderAdmin==="function")renderAdmin();
  }catch(e){}
}
function bindLiveSync(){
  if(!window.fs||window._liveSync)return;window._liveSync=true;
  ["settings","announcements","events","donations","slides","gallery","workers","members"].forEach(function(col){
    try{
      fs.collection(col).onSnapshot(function(qs){
        if(col==="settings"&&qs.docs[0])db.settings=Object.assign(db.settings||{},qs.docs[0].data());
        if(col==="announcements")db.announcements=qs.docs.map(function(d){return d.data();});
        if(col==="events"&&qs.size)db.events=qs.docs.map(function(d){return d.data();});
        if(col==="donations")db.donations=qs.docs.map(function(d){var x=d.data();x.did=d.id;return x;});
        if(col==="slides")db.slides=qs.docs.map(function(d){var x=d.data();x.id=d.id;return x;});
        if(col==="gallery")db.gallery=qs.docs.map(function(d){var x=d.data();x.fid=d.id;return x;});
        if(col==="workers")db.workers=qs.docs.map(function(d){return d.data();});
        if(col==="members")qs.forEach(function(d){db.members=db.members||{};db.members[d.id]=d.data();});
        if(typeof saveLocal==="function")saveLocal();
        refreshOpen();
      });
    }catch(e){}
  });
}
setInterval(bindLiveSync,1500);
setTimeout(bindLiveSync,800);

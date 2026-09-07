window._unread=Number(localStorage.getItem("koldiha_unread")||0);
function setBadge(n){
  window._unread=Math.max(0,n);
  localStorage.setItem("koldiha_unread",String(window._unread));
  var bell=document.querySelector(".appbar .iconbtn:last-child");
  if(bell)bell.textContent=window._unread?("🔔 "+window._unread):"🔔";
  if(navigator.setAppBadge)navigator.setAppBadge(window._unread||0).catch(function(){});
}
function notifOn(){return Notification&&Notification.permission==="granted";}
window.enableNotif=async function(){
  if(!("Notification" in window))return toast("यह फोन नोटिफिकेशन नहीं देता");
  var p=Notification.permission;
  if(p!=="granted")p=await Notification.requestPermission();
  if(p==="granted"){toast("नोटिफिकेशन चालू");localStorage.setItem("koldiha_notif","1");bindRealtimeNotif();}
  else toast("अनुमति नहीं मिली — ब्राउज़र से Allow करो");
};
function showPush(title,body,url){
  if(document.hidden===false && url && url.indexOf("chat")>=0 && document.querySelector("#p-chat.on"))return;
  setBadge(window._unread+1);
  if(typeof toast==="function")toast(title+": "+body);
  if(!notifOn())return;
  try{
    var n=new Notification(title,{body:body,icon:"./icon.svg",tag:title+body.slice(0,20)});
    n.onclick=function(){n.close();window.focus();if(url&&typeof go==="function"){var p=url.replace("#/","");go(p.replace("#","")||"home");}};
  }catch(e){
    if(navigator.serviceWorker)navigator.serviceWorker.ready.then(function(reg){
      reg.showNotification(title,{body:body,icon:"./icon.svg",data:{url:url||"./index.html"}});
    });
  }
}
window._seenChatT=Number(localStorage.getItem("koldiha_seenChat")||0);
window._seenNewsT=Number(localStorage.getItem("koldiha_seenNews")||0);
window._seenGalT=Number(localStorage.getItem("koldiha_seenGal")||0);
function bindRealtimeNotif(){
  if(!window.fs||window._notifLive)return;window._notifLive=true;
  try{
    fs.collection("chats").orderBy("t","desc").limit(1).onSnapshot(function(qs){
      qs.forEach(function(d){
        var c=d.data();if(!c||!c.t)return;
        if(c.t<=window._seenChatT)return;
        if(user&&c.phone===user.phone){window._seenChatT=c.t;localStorage.setItem("koldiha_seenChat",String(c.t));return;}
        window._seenChatT=c.t;localStorage.setItem("koldiha_seenChat",String(c.t));
        showPush("नई चैट",(c.name||"श्रद्धालु")+": "+(c.text||""),"#/chat");
      });
    });
    fs.collection("announcements").onSnapshot(function(qs){
      var max=0;qs.forEach(function(d){var a=d.data();max=Math.max(max,a.created||0);});
      if(max&&max>window._seenNewsT){
        if(window._seenNewsT)showPush("सूचना","समिति की नई घोषणा","#/news");
        window._seenNewsT=max;localStorage.setItem("koldiha_seenNews",String(max));
      }
    });
    fs.collection("gallery").onSnapshot(function(qs){
      var max=0,last=null;qs.forEach(function(d){var g=d.data();if((g.created||0)>max){max=g.created;last=g;}});
      if(max&&max>window._seenGalT){
        if(window._seenGalT&&last&&!(user&&last.phone===user.phone))showPush("नई फोटो",(last.name||"श्रद्धालु")+" ने फोटो डाली","#/gallery");
        window._seenGalT=max;localStorage.setItem("koldiha_seenGal",String(max));
      }
    });
    if(user&&(user.phone==="9473746020"||user.role==="admin")){
      fs.collection("donations").where("status","==","pending").onSnapshot(function(qs){
        if(qs.size)showPush("चंदा अप्रूव","नया चंदा इंतज़ार में","#/donate");
      });
    }
  }catch(e){}
}
function notifBar(){
  var home=document.getElementById("p-home");if(!home)return;
  var el=document.getElementById("notifBar");
  if(!el){el=document.createElement("div");el.id="notifBar";home.insertBefore(el,home.firstChild);}
  if(notifOn())el.innerHTML='<p class="meta">🔔 नोटिफिकेशन चालू</p>';
  else el.innerHTML='<button class="btn" onclick="enableNotif()">🔔 नोटिफिकेशन चालू करो</button>';
}
const _rhN=window.renderHome;
window.renderHome=function(){if(typeof _rhN==="function")try{_rhN();}catch(e){}notifBar();};
const _goN=window.go;
window.go=function(name){
  if(typeof _goN==="function")_goN(name);
  if(name==="chat"||name==="news"||name==="gallery")setBadge(0);
};
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("./sw.js").catch(function(){});
}
setTimeout(function(){
  bindRealtimeNotif();
  notifBar();
  setBadge(window._unread);
  if(localStorage.getItem("koldiha_notif")==="1" && Notification.permission==="default")enableNotif();
},1500);

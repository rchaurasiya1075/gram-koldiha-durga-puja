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
  var onChat=document.hidden===false && url && url.indexOf("chat")>=0 && document.querySelector("#p-chat.on");
  if(onChat)return;
  setBadge(window._unread+1);
  if(typeof toast==="function")toast(title+": "+body);
  screenNote(title,body,url);
  phoneNotify(title,body,url);
}
function screenNote(title,body,url){
  var phone=document.querySelector(".phone");if(!phone)return;
  var el=document.getElementById("screenNote");
  if(!el){
    el=document.createElement("button");
    el.id="screenNote";
    el.type="button";
    phone.appendChild(el);
  }
  el.innerHTML="<b>"+escNote(title)+"</b><span>"+escNote(body)+"</span>";
  el.classList.add("on");
  el.onclick=function(){el.classList.remove("on");if(url&&typeof go==="function")go(String(url).replace("#/",""));};
  clearTimeout(el._t);
  el._t=setTimeout(function(){el.classList.remove("on");},6000);
}
function escNote(s){
  return String(s||"").replace(/&/g,"&").replace(/</g,"<").replace(/>/g,">");
}
function phoneNotify(title,body,url){
  if(!notifOn())return;
  var page=String(url||"#/chat").replace("#/","");
  var opts={body:body,icon:"./icon.svg",tag:"koldiha-"+Date.now(),renotify:true,data:{page:page}};
  if(navigator.serviceWorker){
    navigator.serviceWorker.ready.then(function(reg){return reg.showNotification(title,opts);}).catch(function(){});
  }else{
    try{new Notification(title,opts);}catch(e){}
  }
}
window._seenChatT=Number(localStorage.getItem("koldiha_seenChat")||0);
window._seenNewsT=Number(localStorage.getItem("koldiha_seenNews")||0);
window._seenGalT=Number(localStorage.getItem("koldiha_seenGal")||0);
function bindRealtimeNotif(){
  if(!window.fs||window._notifLive)return;window._notifLive=true;
  try{
    fs.collection("chats").orderBy("t","desc").limit(12).onSnapshot(function(qs){
      var max=window._seenChatT||0,fresh=[];
      qs.forEach(function(d){
        var c=d.data();if(!c||!c.t)return;
        if(c.t>max)max=c.t;
        if(c.t<=window._seenChatT)return;
        if(!user||c.phone===user.phone)return;
        fresh.push(c);
      });
      if(!window._chatNotifBoot){window._chatNotifBoot=1;window._seenChatT=max;localStorage.setItem("koldiha_seenChat",String(max));return;}
      fresh.sort(function(a,b){return a.t-b.t;});
      fresh.forEach(function(c){showPush("नई चैट",(c.name||"श्रद्धालु")+": "+(c.text||""),"#/chat");});
      window._seenChatT=max;localStorage.setItem("koldiha_seenChat",String(max));
    },function(){});
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
if(!document.getElementById("noteCss")){
  var st=document.createElement("style");
  st.id="noteCss";
  st.textContent="#screenNote{position:absolute;top:64px;left:10px;right:10px;z-index:70;display:none;text-align:left;border:1px solid #FFD700;background:#4A0404;color:#FFF8E7;border-radius:14px;padding:10px 12px;box-shadow:0 10px 24px rgba(0,0,0,.35);font-family:inherit}#screenNote.on{display:block}#screenNote b{display:block;color:#FFD700;margin-bottom:2px}#screenNote span{display:block;color:#FFF8E7;font-size:14px}#mustPop{position:absolute;inset:0;z-index:130;background:rgba(20,0,0,.78);display:flex;align-items:center;justify-content:center;padding:18px}#mustPop .mustcard{width:100%;max-width:340px;background:#4A0404;color:#FFF8E7;border:2px solid #FFD700;border-radius:18px;padding:16px}#mustPop h3{margin:0 0 8px;color:#FFD700;font-size:22px}#mustPop p{color:#FFF8E7;font-size:14px;line-height:1.45}#mustPop .btn{color:#fff!important;-webkit-text-fill-color:#fff}";
  document.head.appendChild(st);
}
function siteInstalled(){
  return window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true||localStorage.getItem("koldiha_added")==="1";
}
window.showMust=function(){
  var phone=document.querySelector(".phone")||document.body;
  var needAllow=!window.Notification||Notification.permission!=="granted";
  var needInstall=!siteInstalled();
  var box=document.getElementById("mustPop");
  if(!needAllow&&!needInstall){if(box)box.remove();return;}
  if(!box){box=document.createElement("div");box.id="mustPop";phone.appendChild(box);}
  var ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  var html='<div class="mustcard"><h3>ज़रूरी</h3>';
  if(needInstall){
    html+="<p>होम स्क्रीन पर जोड़ो। इसके बिना फ़ोन की घंटी नहीं आएगी।</p>";
    if(window._pwaEvt)html+='<button type="button" class="btn" id="mustInstall">होम स्क्रीन पर जोड़ो</button>';
    else if(ios)html+="<p>Safari में नीचे Share दबाओ, फिर <b>Add to Home Screen</b>।</p>"+'<button type="button" class="btn" id="mustDone">जोड़ दिया</button>';
    else html+="<p>Chrome में ऊपर ⋮ दबाओ, फिर होम स्क्रीन पर जोड़ें।</p>"+'<button type="button" class="btn" id="mustInstall">इंस्टॉल करो</button>';
  }
  if(needAllow){
    if(!window.Notification)html+="<p>Allow होम स्क्रीन वाला ऐप खोलने के बाद आएगा।</p>";
    else if(Notification.permission==="denied")html+="<p>नोटिफिकेशन बंद है। साइट की सेटिंग में Allow करो।</p>"+'<button type="button" class="btn" id="mustCheck">मैंने Allow कर दिया</button>';
    else html+="<p>हर चैट की घंटी के लिए Allow दबाओ। सभी लॉगिन फ़ोन पर नोटिफिकेशन जाएगी।</p>"+'<button type="button" class="btn" id="mustAllow">Allow करो</button>';
  }
  html+="</div>";
  box.innerHTML=html;
  var allow=document.getElementById("mustAllow");
  if(allow)allow.onclick=function(){
    Notification.requestPermission().then(function(p){
      if(p==="granted"){localStorage.setItem("koldiha_notif","1");if(typeof toast==="function")toast("नोटिफिकेशन चालू");bindRealtimeNotif();}
      showMust();
    });
  };
  var inst=document.getElementById("mustInstall");
  if(inst)inst.onclick=function(){
    if(typeof doInstall==="function")Promise.resolve(doInstall()).then(function(){setTimeout(showMust,400);});
    else showMust();
  };
  var done=document.getElementById("mustDone");
  if(done)done.onclick=function(){localStorage.setItem("koldiha_added","1");showMust();};
  var check=document.getElementById("mustCheck");
  if(check)check.onclick=function(){showMust();};
};
setTimeout(showMust,400);
setTimeout(showMust,1600);
if(navigator.serviceWorker){
  navigator.serviceWorker.addEventListener("message",function(e){
    if(e.data&&e.data.page&&typeof go==="function")go(e.data.page);
  });
}

(function(){
  var st=document.createElement("style");
  st.textContent=".chatbox{display:flex;flex-direction:column;height:100%;min-height:0}.chatlist{flex:1;overflow:auto;padding:6px 0 70px}.bubble{max-width:82%;margin:6px 0;padding:8px 10px;border-radius:12px;background:#fff}.bubble.me{margin-left:auto;background:#6B1212;color:#f7e7c3}.bubble .who{font-size:11px;opacity:.8}.bubble .seen{font-size:10px;opacity:.75;margin-top:2px}.chatbar{position:sticky;bottom:0;display:flex;gap:6px;background:#f7e7c3;padding:6px 0}.chatbar input{flex:1}.socrow{display:flex;gap:8px;align-items:center;font-size:12px;margin-top:4px}.likebtn{border:0;background:#fff;border:1px solid #e0c8a8;border-radius:999px;padding:4px 8px;font-weight:800}.likebtn.on{background:#6B1212;color:#fff}.statline{font-size:12px;color:#6B1212;background:#fff7ea;border:1px solid #e0c8a8;border-radius:10px;padding:6px 8px;margin:6px 0}.blockbtn{background:#8B1E1E;color:#fff;border:0;border-radius:8px;padding:4px 8px;font-size:11px}";
  document.head.appendChild(st);
})();
window._likes={};window._chats=[];window._presence={};window._blocked={};window._views={app:0,members:0};
function vid(){
  var id=localStorage.getItem("koldiha_vid");
  if(!id){id="v"+Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem("koldiha_vid",id);}
  return id;
}
function isBlockedPh(ph){ph=String(ph||"");return !!(window._blocked[ph]);}
function isMeAdmin(){return !!(user&&(user.phone==="9473746020"||user.phone===window.ADMIN_PHONE||user.role==="admin"));}
function likeKey(pid){return String(pid)+"_"+String((user&&user.phone)||vid());}
function countLikes(pid){pid=String(pid);var n=0;Object.keys(window._likes).forEach(function(k){if(window._likes[k]&&window._likes[k].pid===pid)n++;});return n;}
function iLiked(pid){var k=likeKey(pid);return !!(window._likes[k]&&window._likes[k].on);}
window.toggleLike=async function(pid){
  if(!user){toast("लाइक के लिए लॉगिन");return go("account");}
  pid=String(pid);var k=likeKey(pid);var on=!iLiked(pid);
  window._likes[k]={pid:pid,phone:user.phone,on:on,t:Date.now()};
  if(window.fs){
    try{
      if(on)await fs.collection("likes").doc(k).set({pid:pid,phone:user.phone,on:true,t:Date.now()});
      else await fs.collection("likes").doc(k).delete();
    }catch(e){}
  }
  if(typeof renderGal==="function")renderGal();
};
window.bumpView=async function(kind,id){
  var key=kind+":"+id+":"+vid();
  if(sessionStorage.getItem(key))return;
  sessionStorage.setItem(key,"1");
  if(!window.fs)return;
  try{await fs.collection("views").add({kind:kind,id:String(id),vid:vid(),phone:(user&&user.phone)||"",t:Date.now()});}catch(e){}
};
function viewCount(kind,id){
  var n=0; (window._viewRows||[]).forEach(function(v){if(v.kind===kind&&String(v.id)===String(id))n++;}); return n;
}
function uniqueVisitors(){
  var s={};(window._viewRows||[]).forEach(function(v){if(v.kind==="app")s[v.vid||v.phone||v.t]=1;});return Object.keys(s).length||window._views.app||0;
}
function memberCount(){return Object.keys(db.members||{}).length;}
function activeCount(){
  var now=Date.now(),n=0;
  Object.keys(window._presence).forEach(function(ph){if(now-(window._presence[ph].t||0)<70000)n++;});
  return n;
}
async function beatPresence(){
  if(!user||!window.fs)return;
  try{await fs.collection("presence").doc(user.phone).set({phone:user.phone,name:user.name||"",t:Date.now()},{merge:true});}catch(e){}
}
function ensureChatPage(){
  if(document.getElementById("p-chat"))return;
  var wrap=document.querySelector(".wrap");if(!wrap)return;
  var s=document.createElement("section");s.className="page";s.id="p-chat";wrap.appendChild(s);
}
window.renderChat=function(){
  ensureChatPage();
  var page=document.getElementById("p-chat");if(!page)return;
  var html='<h2>💬 लाइव चैट</h2>';
  html+='<div class="statline">👤 एक्टिव '+activeCount()+' · सदस्य '+memberCount()+' · ऐप देखे '+uniqueVisitors()+'</div>';
  if(!user){html+='<div class="card"><p>चैट के लिए लॉगिन करो</p><button class="btn" onclick="go(\'account\')">लॉगिन</button></div>';page.innerHTML=html;return;}
  if(isBlockedPh(user.phone)){html+='<div class="card"><b>आपको चैट से ब्लॉक किया गया है</b></div>';page.innerHTML=html;return;}
  html+='<div class="chatbox"><div class="chatlist" id="chatList"></div>';
  html+='<div class="chatbar"><input id="chatMsg" placeholder="मैसेज लिखें..."/><button class="btn" onclick="sendChat()">भेजो</button></div></div>';
  page.innerHTML=html;
  var list=document.getElementById("chatList");
  var rows=(window._chats||[]).slice().sort(function(a,b){return (a.t||0)-(b.t||0);});
  if(!rows.length)list.innerHTML='<p class="meta">पहला मैसेज आप लिखो</p>';
  else list.innerHTML=rows.map(function(c){
    var me=user&&c.phone===user.phone;
    var seen=(c.seen||[]).length;
    var adminBtns=isMeAdmin()&&!me?('<div><button class="blockbtn" onclick="deleteChat(\''+c.id+'\')">हटाओ</button> <button class="blockbtn" onclick="blockUser(\''+c.phone+'\')">ब्लॉक</button></div>'):'';
    if(isMeAdmin()&&me)adminBtns='<div><button class="blockbtn" onclick="deleteChat(\''+c.id+'\')">हटाओ</button></div>';
    return '<div class="bubble '+(me?"me":"")+'"><div class="who">'+(c.name||c.phone)+'</div>'+escHtml(c.text||"")+'<div class="seen">'+(me?("देखा: "+seen):fmtWhen(c.t))+'</div>'+adminBtns+'</div>';
  }).join("");
  list.scrollTop=list.scrollHeight;
  markSeen();
};
function escHtml(s){return String(s||"").replace(/[&<>"]/g,function(c){return ({"<":"&lt;",">":"&gt;","&":"&amp;","\"":"&quot;"})[c];});}
window.sendChat=async function(){
  if(!user)return go("account");
  if(isBlockedPh(user.phone))return toast("ब्लॉक हैं");
  var inp=document.getElementById("chatMsg");var text=((inp&&inp.value)||"").trim();if(!text)return;
  if(!window.fs)return toast("क्लाउड बंद");
  try{
    await fs.collection("chats").add({phone:user.phone,name:user.name||"श्रद्धालु",text:text,t:Date.now(),seen:[user.phone]});
    if(inp)inp.value="";
  }catch(e){toast("मैसेज नहीं गया");}
};
window.deleteChat=async function(id){
  if(!isMeAdmin())return;
  if(window.fs){try{await fs.collection("chats").doc(id).delete();}catch(e){}}
  window._chats=(window._chats||[]).filter(function(c){return c.id!==id;});
  renderChat();toast("मैसेज हटाया");
};
window.blockUser=async function(ph){
  if(!isMeAdmin())return;
  if(!confirm(ph+" को हमेशा के लिए ब्लॉक? उनके सारे चैट हटेंगे"))return;
  if(window.fs){
    try{await fs.collection("blocked").doc(ph).set({phone:ph,by:user.phone,t:Date.now()});}catch(e){}
    (window._chats||[]).filter(function(c){return c.phone===ph;}).forEach(function(c){
      fs.collection("chats").doc(c.id).delete().catch(function(){});
    });
  }
  window._blocked[ph]=true;
  toast("ब्लॉक + सारे चैट हटे");renderChat();
};
window.unblockUser=async function(ph){
  if(!isMeAdmin())return;
  if(window.fs){try{await fs.collection("blocked").doc(ph).delete();}catch(e){}}
  delete window._blocked[ph];toast("अनब्लॉक");renderChat();
};
async function markSeen(){
  if(!user||!window.fs)return;
  var mine=user.phone;
  (window._chats||[]).slice(-12).forEach(function(c){
    var seen=c.seen||[];
    if(seen.indexOf(mine)>=0)return;
    seen.push(mine);c.seen=seen;
    fs.collection("chats").doc(c.id).set({seen:seen},{merge:true}).catch(function(){});
  });
}
function socialHome(){
  var home=document.getElementById("p-home");if(!home)return;
  var el=document.getElementById("socialStats");
  if(!el){el=document.createElement("div");el.id="socialStats";var grid=home.querySelector(".home-grid");if(grid)home.insertBefore(el,grid);else home.appendChild(el);}
  el.innerHTML='<div class="statline">👁 ऐप देखे <b>'+uniqueVisitors()+'</b> · नए सदस्य <b>'+memberCount()+'</b> · अभी ऑनलाइन <b>'+activeCount()+'</b></div><button class="btn" onclick="go(\'chat\')">💬 लाइव चैट</button>';
}
const _rhS=window.renderHome;
window.renderHome=function(){if(typeof _rhS==="function")try{_rhS();}catch(e){}socialHome();};
const _rgS=window.renderGal;
window.renderGal=function(){
  if(typeof _rgS==="function")_rgS();
  var grid=document.getElementById("galGrid");if(!grid)return;
  var items=typeof galItems==="function"?galItems():(db.gallery||[]);
  var figs=grid.querySelectorAll("figure");
  figs.forEach(function(fig,i){
    var u=items[i];if(!u)return;
    var pid=typeof photoKey==="function"?photoKey(u):String(u.fid||u.created||i);
    var likes=countLikes(pid);
    var views=viewCount("photo",pid);
    var bar=fig.querySelector(".socrow");
    if(!bar){bar=document.createElement("div");bar.className="socrow";fig.querySelector("figcaption").appendChild(bar);}
    bar.innerHTML='<button class="likebtn '+(iLiked(pid)?"on":"")+'" onclick="event.stopPropagation();toggleLike(\''+pid+'\')">❤️ '+likes+'</button><span>👁 '+views+'</span>';
  });
};
const _olS=window.openLb;
window.openLb=function(i){
  if(typeof _olS==="function")_olS(i);
  var items=typeof galItems==="function"?galItems():[];
  var u=items[i];if(!u)return;
  var pid=typeof photoKey==="function"?photoKey(u):String(u.fid||u.created);
  bumpView("photo",pid);
};
const _goS=window.go;
window.go=function(name){
  if(typeof _goS==="function")_goS(name);
  if(name==="chat")renderChat();
};
function bindSocial(){
  if(!window.fs)return;
  if(window._socLive)return;window._socLive=true;
  try{
    fs.collection("likes").onSnapshot(function(qs){
      window._likes={};
      qs.forEach(function(d){var x=d.data();x.id=d.id;if(x.on!==false)window._likes[d.id]=x;});
      if(document.querySelector("#p-gallery.on"))renderGal();
    });
    fs.collection("chats").orderBy("t").limit(80).onSnapshot(function(qs){
      window._chats=qs.docs.map(function(d){var x=d.data();x.id=d.id;return x;});
      if(document.querySelector("#p-chat.on"))renderChat();
    },function(){
      fs.collection("chats").onSnapshot(function(qs){
        window._chats=qs.docs.map(function(d){var x=d.data();x.id=d.id;return x;});
        if(document.querySelector("#p-chat.on"))renderChat();
      });
    });
    fs.collection("presence").onSnapshot(function(qs){
      window._presence={};
      qs.forEach(function(d){window._presence[d.id]=d.data();});
      socialHome();if(document.querySelector("#p-chat.on"))renderChat();
    });
    fs.collection("blocked").onSnapshot(function(qs){
      window._blocked={};qs.forEach(function(d){window._blocked[d.id]=true;});
    });
    fs.collection("views").onSnapshot(function(qs){
      window._viewRows=qs.docs.map(function(d){return d.data();});
      window._views.app=uniqueVisitors();
      socialHome();if(document.querySelector("#p-gallery.on"))renderGal();
    });
  }catch(e){}
  bumpView("app","home");
}
setInterval(beatPresence,25000);
setTimeout(function(){bindSocial();beatPresence();socialHome();ensureChatPage();},1200);

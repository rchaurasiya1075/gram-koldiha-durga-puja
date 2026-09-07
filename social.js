(function(){
  var st=document.createElement("style");
  st.textContent=[
    ".statline{font-size:12px;color:#6B1212;background:#fff7ea;border:1px solid #e0c8a8;border-radius:10px;padding:8px;margin:6px 0}",
    ".chatpage{display:flex;flex-direction:column;min-height:calc(100dvh - 150px)}",
    ".chatlist{flex:1;overflow:auto;padding:4px 0 8px}",
    ".bubble{max-width:86%;margin:8px 0;padding:10px 12px;border-radius:14px;background:#fff;border:1px solid #ead7b8}",
    ".bubble.me{margin-left:auto;background:#6B1212;color:#f7e7c3;border-color:#6B1212}",
    ".bubble .who{font-size:12px;font-weight:800;margin-bottom:4px;text-decoration:underline}",
    ".bubble .seen{font-size:10px;opacity:.8;margin-top:6px}",
    ".chatbar{display:flex;gap:8px;align-items:flex-end;background:#3a1010;padding:10px;border-radius:14px;margin:8px 0 12px}",
    ".chatbar textarea{flex:1;min-height:52px;max-height:120px;font-size:16px;padding:12px;border-radius:10px;border:0;font-family:inherit}",
    ".chatbar .btn{min-height:52px;padding:12px 16px}",
    ".socrow{display:flex;gap:8px;align-items:center;font-size:12px;margin-top:4px}",
    ".likebtn{border:1px solid #e0c8a8;background:#fff;border-radius:999px;padding:4px 8px;font-weight:800}",
    ".likebtn.on{background:#6B1212;color:#fff}",
    ".sheet{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:95;display:flex;align-items:flex-end;justify-content:center}",
    ".sheet .box{background:#fff7ea;width:100%;max-width:430px;border-radius:16px 16px 0 0;padding:16px}",
    ".sheet button{width:100%;margin:6px 0}"
  ].join("");
  document.head.appendChild(st);
})();
window._likes={};window._chats=[];window._presence={};window._blocked={};window._kicked={};window._chatAdmins={};window._views={app:0};window._viewRows=[];
function vid(){var id=localStorage.getItem("koldiha_vid");if(!id){id="v"+Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem("koldiha_vid",id);}return id;}
function isBlockedPh(ph){return !!(window._blocked[String(ph||"")]);}
function isKickedPh(ph){return !!(window._kicked[String(ph||"")]);}
function isMasterAdm(){return !!(user&&(user.phone==="9473746020"||user.phone===window.ADMIN_PHONE));}
function isChatAdmin(){return !!(user&&(isMasterAdm()||user.role==="admin"||window._chatAdmins[user.phone]));}
window.isBlockedUser=function(){return !!(user&&isBlockedPh(user.phone));};
function likeKey(pid){return String(pid)+"_"+String((user&&user.phone)||vid());}
function countLikes(pid){var n=0;Object.keys(window._likes).forEach(function(k){if(window._likes[k]&&window._likes[k].pid===String(pid))n++;});return n;}
function iLiked(pid){var k=likeKey(pid);return !!(window._likes[k]&&window._likes[k].on);}
function uniqueVisitors(){var s={};(window._viewRows||[]).forEach(function(v){if(v.kind==="app")s[v.vid||v.phone||v.t]=1;});return Object.keys(s).length;}
function memberCount(){return Object.keys(db.members||{}).length;}
function activeCount(){var now=Date.now(),n=0;Object.keys(window._presence).forEach(function(ph){if(now-(window._presence[ph].t||0)<70000)n++;});return n;}
function viewCount(kind,id){var n=0;(window._viewRows||[]).forEach(function(v){if(v.kind===kind&&String(v.id)===String(id))n++;});return n;}
function escHtml(s){return String(s||"").replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];});}
function cleanText(s){s=String(s||"").replace(/[<>]/g,"").replace(/https?:\/\/\S+/gi,"[link]");return s.slice(0,280);}
window._lastChatAt=0;
window.toggleLike=async function(pid){
  if(!user){toast("लाइक के लिए लॉगिन");return go("account");}
  if(isBlockedUser())return toast("ब्लॉक हैं — सिर्फ़ देख सकते हो");
  pid=String(pid);var k=likeKey(pid);var on=!iLiked(pid);
  window._likes[k]={pid:pid,phone:user.phone,on:on,t:Date.now()};
  if(window.fs){try{if(on)await fs.collection("likes").doc(k).set({pid:pid,phone:user.phone,on:true,t:Date.now()});else await fs.collection("likes").doc(k).delete();}catch(e){}}
  if(typeof renderGal==="function")renderGal();
};
window.bumpView=async function(kind,id){
  var key=kind+":"+id+":"+vid();
  if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,"1");
  if(window.fs){try{await fs.collection("views").add({kind:kind,id:String(id),vid:vid(),phone:(user&&user.phone)||"",t:Date.now()});}catch(e){}}
};
async function beatPresence(){if(!user||!window.fs)return;try{await fs.collection("presence").doc(user.phone).set({phone:user.phone,name:user.name||"",t:Date.now()},{merge:true});}catch(e){}}
function ensureChatPage(){
  if(document.getElementById("p-chat"))return;
  var wrap=document.querySelector(".wrap");if(!wrap)return;
  var s=document.createElement("section");s.className="page";s.id="p-chat";wrap.appendChild(s);
}
window.renderChat=function(){
  ensureChatPage();
  var page=document.getElementById("p-chat");if(!page)return;
  var html='<div class="chatpage"><h2>💬 लाइव चैट</h2>';
  html+='<div class="statline">🟢 ऑनलाइन <b>'+activeCount()+'</b> · सदस्य <b>'+memberCount()+'</b> · देखे <b>'+uniqueVisitors()+'</b></div>';
  if(!user){html+='<div class="card"><p>चैट लिखने के लिए लॉगिन करो। देख सकते हो।</p><button class="btn" onclick="go(\'account\')">लॉगिन</button></div></div>';page.innerHTML=html;return;}
  if(isBlockedPh(user.phone)){html+='<div class="card"><b>ब्लॉक</b><p>आप सिर्फ़ देख सकते हो। चैट/फोटो बंद है।</p></div></div>';page.innerHTML=html;return;}
  if(isKickedPh(user.phone)){html+='<div class="card"><b>चैट से हटाया गया</b></div></div>';page.innerHTML=html;return;}
  html+='<div class="chatlist" id="chatList"></div>';
  html+='<div class="chatbar"><textarea id="chatMsg" maxlength="280" placeholder="अपना संदेश लिखें..."></textarea><button class="btn" onclick="sendChat()">भेजो</button></div></div>';
  page.innerHTML=html;
  var list=document.getElementById("chatList");
  var rows=(window._chats||[]).slice().sort(function(a,b){return (a.t||0)-(b.t||0);});
  if(!rows.length)list.innerHTML='<p class="meta">जय माँ दुर्गा — पहला संदेश लिखें</p>';
  else list.innerHTML=rows.map(function(c){
    var me=user&&c.phone===user.phone;
    var seen=(c.seen||[]).length;
    var acts='';
    if(me)acts='<div><button class="editbtn" onclick="editChat(\''+c.id+'\')">एडिट</button><button class="delbtn" onclick="deleteChat(\''+c.id+'\')">हटाओ</button></div>';
    else if(isChatAdmin())acts='<div><button class="delbtn" onclick="deleteChat(\''+c.id+'\')">हटाओ</button></div>';
    return '<div class="bubble '+(me?"me":"")+'"><div class="who" onclick="userCard(\''+c.phone+'\',\''+escHtml(c.name||c.phone)+'\')">'+(escHtml(c.name||c.phone))+(window._chatAdmins[c.phone]?" · एडमिन":"")+'</div>'+escHtml(c.text||"")+(c.edited?' <span class="seen">एडिटेड</span>':'')+'<div class="seen">'+(me?("देखा: "+seen):'')+'</div>'+acts+'</div>';
  }).join("");
  list.scrollTop=list.scrollHeight;
  markSeen();
  var ta=document.getElementById("chatMsg");
  if(ta)ta.addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat();}});
};
window.userCard=function(ph,name){
  if(!isChatAdmin())return;
  if(ph==="9473746020")return toast("मुख्य एडमिन");
  var old=document.getElementById("userSheet");if(old)old.remove();
  var d=document.createElement("div");d.className="sheet";d.id="userSheet";
  d.innerHTML='<div class="box"><h3>'+escHtml(name)+'</h3><p class="meta">'+ph+'</p>'+
    '<button class="btn" onclick="makeChatAdmin(\''+ph+'\',\''+escHtml(name)+'\')">चैट एडमिन बनाओ</button>'+
    '<button class="btn ghost" onclick="kickUser(\''+ph+'\')">चैट से हटाओ (किक)</button>'+
    '<button class="btn" style="background:#8B1E1E" onclick="blockUser(\''+ph+'\')">ब्लॉक — कुछ नहीं कर सके</button>'+
    (window._blocked[ph]?'<button class="btn ghost" onclick="unblockUser(\''+ph+'\')">अनब्लॉक</button>':'')+
    (window._chatAdmins[ph]?'<button class="btn ghost" onclick="removeChatAdmin(\''+ph+'\')">एडमिन हटाओ</button>':'')+
    '<button class="btn ghost" onclick="document.getElementById(\'userSheet\').remove()">बंद</button></div>';
  document.body.appendChild(d);
};
window.sendChat=async function(){
  if(!user)return go("account");
  if(isBlockedPh(user.phone)||isKickedPh(user.phone))return toast("आप चैट नहीं कर सकते");
  if(Date.now()-window._lastChatAt<1500)return toast("थोड़ा रुकें");
  var inp=document.getElementById("chatMsg");var text=cleanText((inp&&inp.value)||"");if(!text)return;
  if(!window.fs)return toast("क्लाउड बंद");
  window._lastChatAt=Date.now();
  try{await fs.collection("chats").add({phone:user.phone,name:user.name||"श्रद्धालु",text:text,t:Date.now(),seen:[user.phone]});if(inp)inp.value="";}catch(e){toast("नहीं गया");}
};
window.editChat=async function(id){
  var c=(window._chats||[]).find(function(x){return x.id===id;});if(!c)return;
  if(!(user&&(c.phone===user.phone||isChatAdmin())))return toast("अपना मैसेज ही एडिट");
  var n=prompt("नया संदेश",c.text||"");if(n==null)return;n=cleanText(n);if(!n)return;
  if(window.fs){try{await fs.collection("chats").doc(id).set({text:n,edited:true},{merge:true});}catch(e){}}
};
window.deleteChat=async function(id){
  var c=(window._chats||[]).find(function(x){return x.id===id;});if(!c)return;
  if(!(user&&(c.phone===user.phone||isChatAdmin())))return toast("नहीं हटा सकते");
  if(!confirm("मैसेज हटाना है?"))return;
  if(window.fs){try{await fs.collection("chats").doc(id).delete();}catch(e){}}
};
window.makeChatAdmin=async function(ph,name){
  if(!isChatAdmin())return;
  if(window.fs){try{await fs.collection("chatAdmins").doc(ph).set({phone:ph,name:name||"",by:user.phone,t:Date.now()});}catch(e){}}
  toast(name+" अब चैट एडमिन");var s=document.getElementById("userSheet");if(s)s.remove();
};
window.removeChatAdmin=async function(ph){
  if(!isMasterAdm())return toast("सिर्फ़ मुख्य एडमिन");
  if(window.fs){try{await fs.collection("chatAdmins").doc(ph).delete();}catch(e){}}
  var s=document.getElementById("userSheet");if(s)s.remove();
};
window.kickUser=async function(ph){
  if(!isChatAdmin())return;
  if(window.fs){try{await fs.collection("kicked").doc(ph).set({phone:ph,by:user.phone,t:Date.now()});}catch(e){}}
  toast("चैट से हटाया");var s=document.getElementById("userSheet");if(s)s.remove();
};
window.blockUser=async function(ph){
  if(!isChatAdmin())return;
  if(!confirm("ब्लॉक? ये व्यक्ति फोटो/चैट कुछ नहीं कर सकेगा, सिर्फ़ देखेगा"))return;
  if(window.fs){
    try{await fs.collection("blocked").doc(ph).set({phone:ph,by:user.phone,t:Date.now()});}catch(e){}
    (window._chats||[]).filter(function(c){return c.phone===ph;}).forEach(function(c){fs.collection("chats").doc(c.id).delete().catch(function(){});});
  }
  toast("ब्लॉक हो गया");var s=document.getElementById("userSheet");if(s)s.remove();
};
window.unblockUser=async function(ph){
  if(!isMasterAdm())return;
  if(window.fs){try{await fs.collection("blocked").doc(ph).delete();await fs.collection("kicked").doc(ph).delete();}catch(e){}}
  var s=document.getElementById("userSheet");if(s)s.remove();toast("अनब्लॉक");
};
async function markSeen(){
  if(!user||!window.fs)return;
  (window._chats||[]).slice(-15).forEach(function(c){
    var seen=c.seen||[];if(seen.indexOf(user.phone)>=0)return;
    seen.push(user.phone);c.seen=seen;
    fs.collection("chats").doc(c.id).set({seen:seen},{merge:true}).catch(function(){});
  });
}
function socialHome(){
  var home=document.getElementById("p-home");if(!home)return;
  var el=document.getElementById("socialStats");
  if(!el){el=document.createElement("div");el.id="socialStats";var grid=home.querySelector(".home-grid");if(grid)home.insertBefore(el,grid);else home.appendChild(el);}
  el.innerHTML='<div class="statline">👁 देखे <b>'+uniqueVisitors()+'</b> · सदस्य <b>'+memberCount()+'</b> · ऑनलाइन <b>'+activeCount()+'</b></div><button class="btn" onclick="go(\'chat\')">💬 लाइव चैट</button>';
}
const _rhS=window.renderHome;
window.renderHome=function(){if(typeof _rhS==="function")try{_rhS();}catch(e){}socialHome();};
const _rgS=window.renderGal;
window.renderGal=function(){
  if(typeof _rgS==="function")_rgS();
  var grid=document.getElementById("galGrid");if(!grid)return;
  var items=typeof galItems==="function"?galItems():(db.gallery||[]);
  grid.querySelectorAll("figure").forEach(function(fig,i){
    var u=items[i];if(!u)return;
    var pid=typeof photoKey==="function"?photoKey(u):String(u.fid||u.created||i);
    var bar=fig.querySelector(".socrow");if(!bar){bar=document.createElement("div");bar.className="socrow";(fig.querySelector("figcaption")||fig).appendChild(bar);}
    bar.innerHTML='<button class="likebtn '+(iLiked(pid)?"on":"")+'" onclick="event.stopPropagation();toggleLike(\''+pid+'\')">❤️ '+countLikes(pid)+'</button><span>👁 '+viewCount("photo",pid)+'</span>';
  });
};
const _olS=window.openLb;
window.openLb=function(i){if(typeof _olS==="function")_olS(i);var items=typeof galItems==="function"?galItems():[];var u=items[i];if(!u)return;bumpView("photo",typeof photoKey==="function"?photoKey(u):u.fid);};
const _up=window.uploadNamedPhoto;
window.uploadNamedPhoto=async function(){if(isBlockedUser())return toast("ब्लॉक हैं — अपलोड बंद");if(typeof _up==="function")return _up();};
const _us=window.uploadSlide;
window.uploadSlide=async function(inp){if(isBlockedUser())return toast("ब्लॉक हैं");if(typeof _us==="function")return _us(inp);};
const _ad=window.addDon;
window.addDon=async function(){if(isBlockedUser())return toast("ब्लॉक हैं");if(typeof _ad==="function")return _ad();};
function bindSocial(){
  if(!window.fs||window._socLive)return;window._socLive=true;
  try{
    fs.collection("likes").onSnapshot(function(qs){window._likes={};qs.forEach(function(d){var x=d.data();if(x.on!==false)window._likes[d.id]=x;});if(document.querySelector("#p-gallery.on"))renderGal();});
    fs.collection("chats").orderBy("t").limit(80).onSnapshot(function(qs){window._chats=qs.docs.map(function(d){var x=d.data();x.id=d.id;return x;});if(document.querySelector("#p-chat.on"))renderChat();},function(){fs.collection("chats").onSnapshot(function(qs){window._chats=qs.docs.map(function(d){var x=d.data();x.id=d.id;return x;});if(document.querySelector("#p-chat.on"))renderChat();});});
    fs.collection("presence").onSnapshot(function(qs){window._presence={};qs.forEach(function(d){window._presence[d.id]=d.data();});socialHome();if(document.querySelector("#p-chat.on"))renderChat();});
    fs.collection("blocked").onSnapshot(function(qs){window._blocked={};qs.forEach(function(d){window._blocked[d.id]=true;});});
    fs.collection("kicked").onSnapshot(function(qs){window._kicked={};qs.forEach(function(d){window._kicked[d.id]=true;});});
    fs.collection("chatAdmins").onSnapshot(function(qs){window._chatAdmins={};qs.forEach(function(d){window._chatAdmins[d.id]=true;});});
    fs.collection("views").onSnapshot(function(qs){window._viewRows=qs.docs.map(function(d){return d.data();});socialHome();if(document.querySelector("#p-gallery.on"))renderGal();});
  }catch(e){}
  bumpView("app","home");
}
setInterval(beatPresence,25000);
setTimeout(function(){bindSocial();beatPresence();socialHome();ensureChatPage();},800);

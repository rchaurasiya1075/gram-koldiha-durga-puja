(function(){var l=document.createElement("link");l.rel="stylesheet";l.href="./chat.css?v=25";document.head.appendChild(l);})();
window.renderChat=function(){
  if(typeof ensureChatPage==="function")ensureChatPage();
  var page=document.getElementById("p-chat");if(!page)return;
  var html='<div class="chatpage"><h2>💬 लाइव चैट</h2>';
  html+='<div class="statline">🟢 ऑनलाइन <b>'+(typeof activeCount==="function"?activeCount():0)+'</b> · सदस्य <b>'+(typeof memberCount==="function"?memberCount():0)+'</b></div>';
  if(!user){html+='<div class="card"><p>चैट के लिए लॉगिन</p><button class="btn" onclick="go(\'account\')">लॉगिन</button></div></div>';page.innerHTML=html;return;}
  if(typeof isBlockedPh==="function"&&isBlockedPh(user.phone)){html+='<div class="card"><b>ब्लॉक</b><p>सिर्फ़ देख सकते हो</p></div></div>';page.innerHTML=html;return;}
  if(typeof isKickedPh==="function"&&isKickedPh(user.phone)){html+='<div class="card"><b>चैट से हटाया गया</b></div></div>';page.innerHTML=html;return;}
  html+='<div class="chatlist" id="chatList"></div>';
  html+='<div class="chatbar"><textarea id="chatMsg" rows="2" maxlength="280" placeholder="संदेश लिखें"></textarea><button type="button" class="sendbtn" onclick="sendChat()">भेजो</button></div></div>';
  page.innerHTML=html;
  var list=document.getElementById("chatList");
  var rows=(window._chats||[]).slice().sort(function(a,b){return (a.t||0)-(b.t||0);});
  var adm=typeof isChatAdmin==="function"&&isChatAdmin();
  if(!rows.length)list.innerHTML='<p class="meta">जय माँ दुर्गा — संदेश लिखें</p>';
  else list.innerHTML=rows.map(function(c){
    var me=user&&c.phone===user.phone;
    var seen=(c.seen||[]).length;
    var acts="";
    if(me)acts='<div><button class="ed" onclick="editChat(\''+c.id+'\')">एडिट</button><button class="kill" onclick="deleteChat(\''+c.id+'\')">हटाओ</button></div>';
    if(!me&&adm)acts='<div><button class="kill" onclick="deleteChat(\''+c.id+'\')">हटाओ</button></div>';
    return '<div class="bubble '+(me?"me":"")+'"><div class="who" onclick="userCard(\''+c.phone+'\',\''+String(c.name||c.phone).replace(/'/g,"")+'\')">'+String(c.name||c.phone)+(window._chatAdmins&&window._chatAdmins[c.phone]?" · एडमिन":"")+'</div>'+String(c.text||"").replace(/[<>]/g,"")+(c.edited?' <span class="seen">एडिटेड</span>':'')+'<div class="seen">'+(me?("देखा: "+seen):"")+'</div>'+acts+'</div>';
  }).join("");
  list.scrollTop=list.scrollHeight;
  if(typeof markSeen==="function")markSeen();
  var ta=document.getElementById("chatMsg");
  if(ta){ta.focus();
ta.addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat();}});}
};
if(document.querySelector("#p-chat.on"))renderChat();

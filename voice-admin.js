function isVoiceAdmin(){
  if(!window.user)return false;
  if(user.phone===window.ADMIN_PHONE||user.phone==="9473746020")return true;
  if(user.role==="admin")return true;
  if(typeof isMaster==="function"&&isMaster())return true;
  if(typeof isAdminUser==="function"&&isAdminUser())return true;
  if(typeof hasPanel==="function"&&hasPanel())return true;
  return false;
}
function myVoiceId(){return (typeof voiceId==="function"&&voiceId())||"";}
function sid(id){return String(id||"").replace(/'/g,"");}
function sendVoiceCmd(type,target,extra){
  if(!window.fs||!target)return Promise.resolve();
  var row={type:type,target:String(target),by:myVoiceId(),t:Date.now()};
  if(extra)Object.keys(extra).forEach(function(k){row[k]=extra[k];});
  return fs.collection("voiceMod").add(row).catch(function(){});
}
window.adminMutePeer=async function(id){
  if(!isVoiceAdmin())return toast&&toast("\u0938\u093f\u0930\u094d\u092b \u090f\u0921\u092e\u093f\u0928");
  if(!id||id===myVoiceId())return;
  var p=(window._voicePeers&&window._voicePeers[id])||{};
  var nowMuted=!p.muted;
  if(window.fs)try{await fs.collection("voice").doc(id).set({muted:nowMuted},{merge:true});}catch(e){}
  await sendVoiceCmd(nowMuted?"mute":"unmute",id);
  if(window._voicePeers&&window._voicePeers[id])window._voicePeers[id].muted=nowMuted;
  if(typeof toast==="function")toast(nowMuted?"\u092e\u094d\u092f\u0942\u091f":"\u0905\u0928\u092e\u094d\u092f\u0942\u091f");
  if(typeof renderVoice==="function")renderVoice();
};
window.adminKickPeer=async function(id){
  if(!isVoiceAdmin())return;
  if(!id||id===myVoiceId())return;
  var p=(window._voicePeers&&window._voicePeers[id])||{};
  if(!confirm((p.name||id)+" \u0939\u091f\u093e\u0928\u093e \u0939\u0948?"))return;
  await sendVoiceCmd("kick",id);
  if(window.fs)try{await fs.collection("voice").doc(id).delete();}catch(e){}
  if(window._voicePeers)delete window._voicePeers[id];
  if(typeof renderVoice==="function")renderVoice();
};
window.adminRenamePeer=async function(id){
  if(!isVoiceAdmin()||!id)return;
  var p=(window._voicePeers&&window._voicePeers[id])||{};
  var n=prompt("\u0928\u092f\u093e \u0928\u093e\u092e",p.name||"");
  if(!n)return;n=n.trim().slice(0,24);
  if(window.fs)try{await fs.collection("voice").doc(id).set({name:n},{merge:true});}catch(e){}
  await sendVoiceCmd("rename",id,{name:n});
  if(window._voicePeers&&window._voicePeers[id])window._voicePeers[id].name=n;
  if(typeof renderVoice==="function")renderVoice();
};
window.sendVoiceChat=async function(){
  var inp=document.getElementById("vchatIn");
  var t=((inp&&inp.value)||"").trim();if(!t)return;
  if(inp)inp.value="";
  var row={text:t.slice(0,180),name:(window.user&&user.name)||"\u0936\u094d\u0930\u0926\u094d\u0927\u093e\u0932\u0941",phone:myVoiceId(),t:Date.now()};
  window._vchats=window._vchats||[];window._vchats.push(row);
  if(window.fs)try{await fs.collection("voiceChat").add(row);}catch(e){}
  paintVoiceExtra();
};
function applyForceMute(on){
  window._adminForceMute=!!on;window._voiceMuted=!!on;
  if(window._localStream)window._localStream.getAudioTracks().forEach(function(t){t.enabled=!on;});
  if(typeof writeMe==="function")writeMe({muted:!!on});
}
function bindVoiceAdmin(){
  if(!window.fs||window._vAdminBound)return;window._vAdminBound=true;
  try{
    fs.collection("voiceMod").onSnapshot(function(qs){
      var me=myVoiceId();if(!me)return;
      qs.forEach(function(doc){
        var d=doc.data();if(!d||String(d.target)!==String(me))return;
        if(d.t&&window._vModSeen&&d.t<=window._vModSeen)return;
        window._vModSeen=Math.max(window._vModSeen||0,d.t||0);
        if(d.type==="mute"){applyForceMute(true);toast&&toast("\u090f\u0921\u092e\u093f\u0928 \u0928\u0947 \u092e\u094d\u092f\u0942\u091f \u0915\u093f\u092f\u093e");}
        if(d.type==="unmute"){window._adminForceMute=false;applyForceMute(false);}
        if(d.type==="rename"&&d.name){if(window.user)user.name=d.name;}
        if(d.type==="kick"){window._voiceKickUntil=Date.now()+60000;if(typeof leaveVoice==="function")leaveVoice();toast&&toast("\u0915\u0949\u0932 \u0938\u0947 \u0939\u091f\u093e\u092f\u093e");}
        if(typeof renderVoice==="function")renderVoice();
      });
    });
    fs.collection("voiceChat").orderBy("t","desc").limit(30).onSnapshot(function(qs){
      window._vchats=qs.docs.map(function(d){var x=d.data();x.id=d.id;return x;}).reverse();
      paintVoiceExtra();
    });
  }catch(e){
    try{fs.collection("voiceChat").onSnapshot(function(qs){window._vchats=qs.docs.map(function(d){var x=d.data();x.id=d.id;return x;});paintVoiceExtra();});}catch(e2){}
  }
}
function paintVoiceExtra(){
  var page=document.getElementById("p-voice");if(!page)return;
  var vui=page.querySelector(".vui")||page;
  var bar=page.querySelector(".vui-bar");
  var old=document.getElementById("vAdminBox");if(old)old.remove();
  var oldc=document.getElementById("vChatBox");if(oldc)oldc.remove();
  var me=myVoiceId();
  if(isVoiceAdmin()){
    var rows=[];
    Object.keys(window._voicePeers||{}).forEach(function(id){
      if(id===me)return;
      var x=window._voicePeers[id]||{};
      rows.push('<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:6px 0"><b style="flex:1">'+(x.name||id)+'</b>'+
        '<button type="button" onclick="adminMutePeer(\''+sid(id)+'\')" style="border:0;border-radius:8px;padding:6px 8px;background:#374151;color:#fff">'+(x.muted?"\u0905\u0928\u092e\u094d\u092f\u0942\u091f":"\u092e\u094d\u092f\u0942\u091f")+'</button>'+
        '<button type="button" onclick="adminRenamePeer(\''+sid(id)+'\')" style="border:0;border-radius:8px;padding:6px 8px;background:#4b5563;color:#fff">\u090f\u0921\u093f\u091f</button>'+
        '<button type="button" onclick="adminKickPeer(\''+sid(id)+'\')" style="border:0;border-radius:8px;padding:6px 8px;background:#dc2626;color:#fff">\u0939\u091f\u093e\u0913</button></div>');
    });
    var box=document.createElement("div");box.id="vAdminBox";
    box.style.cssText="margin:8px;padding:10px;background:#1f2937;border-radius:12px;color:#fff";
    box.innerHTML='<div style="color:#E8C56B;font-weight:800;margin-bottom:6px">\u090f\u0921\u092e\u093f\u0928 \u2014 \u092e\u094d\u092f\u0942\u091f / \u090f\u0921\u093f\u091f / \u0939\u091f\u093e\u0913</div>'+(rows.length?rows.join(""):"<div class=\"meta\">\u0914\u0930 \u0915\u094b\u0908 \u091c\u0941\u0921\u093c\u093e \u0928\u0939\u0940\u0902</div>");
    if(bar)vui.insertBefore(box,bar);else vui.appendChild(box);
  }
  var chats=window._vchats||[];
  var cb=document.createElement("div");cb.id="vChatBox";
  cb.style.cssText="margin:8px;padding:10px;background:#111827;border-radius:12px;color:#fff";
  var lines=chats.slice(-12).map(function(c){return "<div style=\"font-size:13px;margin:4px 0\"><b style=\"color:#E8C56B\">"+(c.name||"")+":</b> "+String(c.text||"").replace(/[<>]/g,"")+"</div>";}).join("");
  cb.innerHTML='<div style="font-weight:800;margin-bottom:6px">\ud83d\udcac \u0932\u093e\u0907\u0935 \u091a\u0948\u091f</div><div id="vchatList" style="max-height:120px;overflow:auto">'+(lines||'<div class="meta">\u0938\u0902\u0926\u0947\u0936 \u0932\u093f\u0916\u094b</div>')+'</div>'+
    '<div style="display:flex;gap:6px;margin-top:8px"><input id="vchatIn" maxlength="180" placeholder="\u092e\u0948\u0938\u0947\u091c..." style="flex:1;padding:8px;border-radius:8px;border:0"/><button type="button" onclick="sendVoiceChat()" style="border:0;border-radius:8px;padding:8px 12px;background:#E8C56B;color:#3a1608;font-weight:800">\u092d\u0947\u091c\u094b</button></div>';
  if(bar)vui.insertBefore(cb,bar);else vui.appendChild(cb);
  var list=document.getElementById("vchatList");if(list)list.scrollTop=list.scrollHeight;
}
const _muteA=window.muteVoice;
window.muteVoice=function(){
  if(window._adminForceMute&&window._voiceMuted){if(typeof toast==="function")toast("\u090f\u0921\u092e\u093f\u0928 \u0928\u0947 \u092e\u094d\u092f\u0942\u091f \u0915\u093f\u092f\u093e ह\u0948");return;}
  if(typeof _muteA==="function")_muteA();
};
const _joinA=window.joinVoice;
window.joinVoice=async function(){
  if(window._voiceKickUntil&&Date.now()<window._voiceKickUntil){if(typeof toast==="function")toast("\u0925\u094b\u0921\u093c\u0940 \u0926\u0947\u0930 \u092c\u093e\u0926");return;}
  try{
    var s=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
    window._localStream=s;
    s.getAudioTracks().forEach(function(t){t.enabled=true;});
    if(window._actx&&window._actx.state==="suspended")window._actx.resume();
  }catch(e){if(typeof toast==="function")toast("\u092e\u093e\u0907\u0915 Allow \u0915\u0930\u094b");}
  if(typeof _joinA==="function")return _joinA();
};
const _rvA=window.renderVoice;
window.renderVoice=function(){
  if(typeof _rvA==="function")_rvA();
  paintVoiceExtra();
};
setTimeout(bindVoiceAdmin,800);
setTimeout(bindVoiceAdmin,2200);

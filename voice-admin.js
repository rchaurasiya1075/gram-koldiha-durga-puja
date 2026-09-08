/* Admin mute / kick for live voice. Does not change other app pages. */
function isVoiceAdmin(){
  if(!window.user)return false;
  if(user.phone===window.ADMIN_PHONE||user.phone==="9473746020")return true;
  if(user.role==="admin")return true;
  if(typeof isMaster==="function"&&isMaster())return true;
  if(typeof isAdminUser==="function"&&isAdminUser())return true;
  return false;
}
function myVoiceId(){return (typeof voiceId==="function"&&voiceId())||"";}
function sendVoiceCmd(type,target){
  if(!window.fs||!target)return Promise.resolve();
  return fs.collection("voiceMod").add({type:type,target:String(target),by:myVoiceId(),t:Date.now()}).catch(function(){});
}
window.adminMutePeer=async function(id){
  if(!isVoiceAdmin())return typeof toast==="function"&&toast("सिर्फ़ एडमिन");
  if(!id||id===myVoiceId())return;
  var p=(window._voicePeers&&window._voicePeers[id])||{};
  var nowMuted=!p.muted;
  if(window.fs){
    try{await fs.collection("voice").doc(id).set({muted:nowMuted},{merge:true});}catch(e){}
  }
  await sendVoiceCmd(nowMuted?"mute":"unmute",id);
  if(window._voicePeers&&window._voicePeers[id])window._voicePeers[id].muted=nowMuted;
  if(typeof toast==="function")toast(nowMuted?"म्यूट किया":"अनम्यूट किया");
  if(typeof renderVoice==="function")renderVoice();
};
window.adminKickPeer=async function(id){
  if(!isVoiceAdmin())return typeof toast==="function"&&toast("सिर्फ़ एडमिन");
  if(!id||id===myVoiceId())return;
  var p=(window._voicePeers&&window._voicePeers[id])||{};
  if(!confirm((p.name||id)+" को कॉल से हटाना है?"))return;
  await sendVoiceCmd("kick",id);
  if(window.fs){try{await fs.collection("voice").doc(id).delete();}catch(e){}}
  if(window._voicePeers)delete window._voicePeers[id];
  if(typeof toast==="function")toast("हटा दिया");
  if(typeof renderVoice==="function")renderVoice();
};
function applyForceMute(on){
  window._adminForceMute=!!on;
  window._voiceMuted=!!on;
  if(window._localStream){
    window._localStream.getAudioTracks().forEach(function(t){t.enabled=!on;});
  }
  if(typeof writeMe==="function")writeMe({muted:!!on});
}
function bindVoiceAdmin(){
  if(!window.fs||window._vAdminBound)return;
  window._vAdminBound=true;
  try{
    fs.collection("voiceMod").onSnapshot(function(qs){
      var me=myVoiceId();
      if(!me)return;
      qs.forEach(function(doc){
        var d=doc.data();if(!d||String(d.target)!==String(me))return;
        if(d.t&&window._vModSeen&&d.t<=window._vModSeen)return;
        window._vModSeen=Math.max(window._vModSeen||0,d.t||0);
        if(d.type==="mute"){
          applyForceMute(true);
          if(typeof toast==="function")toast("एडमिन ने म्यूट किया");
          if(typeof renderVoice==="function")renderVoice();
        }
        if(d.type==="unmute"){
          window._adminForceMute=false;
          applyForceMute(false);
          if(typeof toast==="function")toast("एडमिन ने अनम्यूट किया");
          if(typeof renderVoice==="function")renderVoice();
        }
        if(d.type==="kick"){
          window._voiceKickUntil=Date.now()+60000;
          if(typeof leaveVoice==="function")leaveVoice();
          if(typeof toast==="function")toast("एडमिन ने कॉल से हटाया");
        }
      });
    });
  }catch(e){}
}
const _muteA=window.muteVoice;
window.muteVoice=function(){
  if(window._adminForceMute&&window._voiceMuted){
    if(typeof toast==="function")toast("एडमिन ने म्यूट किया है");
    return;
  }
  if(typeof _muteA==="function")_muteA();
};
const _joinA=window.joinVoice;
window.joinVoice=async function(){
  if(window._voiceKickUntil&&Date.now()<window._voiceKickUntil){
    if(typeof toast==="function")toast("एडमिन ने हटाया — थोड़ी देर बाद आओ");
    return;
  }
  if(typeof _joinA==="function")return _joinA();
};
const _rvA=window.renderVoice;
window.renderVoice=function(){
  if(typeof _rvA==="function")_rvA();
  var page=document.getElementById("p-voice");if(!page)return;
  var old=document.getElementById("vAdminBox");if(old)old.remove();
  if(!isVoiceAdmin())return;
  var me=myVoiceId();
  var rows=[];
  Object.keys(window._voicePeers||{}).forEach(function(id){
    if(id===me)return;
    var x=window._voicePeers[id]||{};
    var muted=!!x.muted;
    rows.push('<div style="display:flex;align-items:center;gap:6px;margin:6px 0;flex-wrap:wrap">'+ 
      '<span style="flex:1;font-size:13px">'+(x.name||id)+'</span>'+
      '<button type="button" onclick="adminMutePeer(\''+String(id).replace(/'/g,"")+'\')" style="border:0;border-radius:8px;padding:6px 10px;background:#374151;color:#fff;font-size:12px">'+(muted?"अनम्यूट":"म्यूट")+'</button>'+
      '<button type="button" onclick="adminKickPeer(\''+String(id).replace(/'/g,"")+'\')" style="border:0;border-radius:8px;padding:6px 10px;background:#dc2626;color:#fff;font-size:12px">हटाओ</button>'+
    '</div>');
  });
  var box=document.createElement("div");
  box.id="vAdminBox";
  box.style.cssText="margin:8px 10px 12px;padding:10px;background:#1f2937;border:1px solid #4b5563;border-radius:12px;color:#fff";
  box.innerHTML='<div style="font-size:12px;font-weight:800;color:#E8C56B;margin-bottom:6px">एडमिन नियंत्रण</div>'+(rows.length?rows.join(""):'<div style="font-size:12px;opacity:.7">और कोई जुड़ा नहीं</div>');
  var vui=page.querySelector(".vui")||page;
  var bar=page.querySelector(".vui-bar");
  if(bar)vui.insertBefore(box,bar);
  else vui.appendChild(box);
};
setTimeout(bindVoiceAdmin,900);
setTimeout(bindVoiceAdmin,2500);

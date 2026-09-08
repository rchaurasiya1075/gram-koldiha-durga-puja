(function(){
  var s=document.createElement("style");
  s.textContent=".vstat{background:#fff7ea;border:1px solid #ead3bc;border-radius:12px;padding:10px;margin:8px 0}.vbtns{display:grid;grid-template-columns:1fr 1fr;gap:8px}.vframe{width:100%;height:280px;border:0;border-radius:12px;background:#111;display:none}";
  document.head.appendChild(s);
})();
window._voiceOn=false;window._voiceMuted=false;window._voiceN=0;
function voiceRoom(){return "KoldihaPujaVoice";}
function ensureVoicePage(){
  if(document.getElementById("p-voice"))return;
  var wrap=document.querySelector(".wrap");if(!wrap)return;
  var s=document.createElement("section");s.className="page";s.id="p-voice";wrap.appendChild(s);
}
function voiceSrc(name){
  var n=encodeURIComponent(name||"श्रद्धालु");
  return "https://meet.jit.si/"+voiceRoom()+"#userInfo.displayName=\""+n+"\"&config.startWithVideoMuted=true&config.startAudioOnly=true&config.prejoinPageEnabled=false&interfaceConfig.TOOLBAR_BUTTONS=['microphone','hangup']&config.disableInviteFunctions=true";
}
window.renderVoice=function(){
  ensureVoicePage();
  var page=document.getElementById("p-voice");if(!page)return;
  var host=window._voiceHost||"";
  page.innerHTML='<h2>🎙️ लाइव आवाज़</h2>'+
    '<div class="vstat">🟢 जुड़े: <b id="vCount">'+window._voiceN+'</b>'+(host?(' · होस्ट: '+host):' · अभी लाइव नहीं')+'</div>'+
    '<div class="card"><p>पूजा की लाइव आवाज़ — बोलकर / आरती सुनें।</p>'+
    (user?'':'<p class="meta">जुड़ने के लिए लॉगिन करें</p>')+
    '<div class="vbtns">'+
    '<button class="btn" onclick="joinVoice()">जुड़ें</button>'+
    '<button class="btn ghost" onclick="muteVoice()">'+(window._voiceMuted?"अनम्यूट":"म्यूट")+'</button>'+
    '<button class="btn" onclick="leaveVoice()">कॉल काटो</button>'+
    ((user&&(user.phone==="9473746020"||user.role==="admin"))?'<button class="btn ghost" onclick="endVoiceRoom()">रूम बंद</button>':'')+
    '</div></div>'+
    '<iframe class="vframe" id="vFrame" allow="microphone;autoplay;camera"></iframe>';
  if(window._voiceOn){
    var f=document.getElementById("vFrame");
    if(f){f.style.display="block";if(!f.src)f.src=voiceSrc(user&&user.name);}
  }
};
window.joinVoice=async function(){
  if(!user){toast("पहले लॉगिन");return go("account");}
  window._voiceOn=true;window._voiceMuted=false;
  if(window.fs){try{await fs.collection("voice").doc((user.phone||"x")).set({phone:user.phone,name:user.name||"",t:Date.now(),on:true});}catch(e){}}
  renderVoice();
  var f=document.getElementById("vFrame");if(f){f.style.display="block";f.src=voiceSrc(user.name);}
  toast("लाइव आवाज़ जुड़ गई");
};
window.muteVoice=function(){
  window._voiceMuted=!window._voiceMuted;
  toast(window._voiceMuted?"म्यूट है — नीचे माइक दबाओ":"अनम्यूट");
  renderVoice();
};
window.leaveVoice=async function(){
  window._voiceOn=false;
  var f=document.getElementById("vFrame");if(f){f.src="about:blank";f.style.display="none";}
  if(window.fs&&user){try{await fs.collection("voice").doc(user.phone).delete();}catch(e){}}
  renderVoice();toast("कॉल कट गई");
};
window.endVoiceRoom=async function(){
  if(!(user&&(user.phone==="9473746020"||user.role==="admin")))return;
  if(window.fs){
    try{
      var qs=await fs.collection("voice").get();
      qs.forEach(function(d){d.ref.delete();});
    }catch(e){}
  }
  leaveVoice();
};
function voiceHomeBtn(){
  var grid=document.querySelector(".home-grid");if(!grid||document.getElementById("tileVoice"))return;
  var b=document.createElement("button");b.className="tile";b.id="tileVoice";b.onclick=function(){go("voice");};
  b.innerHTML="<span>🎙️</span>लाइव आवाज़";grid.appendChild(b);
}
const _goV=window.go;
window.go=function(name){
  if(typeof _goV==="function")_goV(name);
  if(name==="voice")setTimeout(renderVoice,20);
};
const _rhV=window.renderHome;
window.renderHome=function(){if(typeof _rhV==="function")try{_rhV();}catch(e){}voiceHomeBtn();};
setTimeout(function(){
  ensureVoicePage();voiceHomeBtn();
  if(window.fs&&!window._voiceLive){
    window._voiceLive=true;
    try{fs.collection("voice").onSnapshot(function(qs){window._voiceN=qs.size;var host="";qs.forEach(function(d){var x=d.data();if(x&&x.name)host=x.name;});window._voiceHost=host;if(document.querySelector("#p-voice.on"))renderVoice();});}catch(e){}}
},1000);

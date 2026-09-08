(function(){
  var s=document.createElement("style");
  s.textContent=".vstat{background:#fff7ea;border:1px solid #ead3bc;border-radius:12px;padding:10px;margin:8px 0}.vbtns{display:grid;grid-template-columns:1fr 1fr;gap:8px}.vframe{width:100%;height:260px;border:0;border-radius:12px;background:#111}.vbanner{background:#6B1212;color:#F7E7C3;border-radius:12px;padding:10px;margin:6px 0;text-align:center}.vbanner button{margin-top:6px}";
  document.head.appendChild(s);
})();
window._voiceOn=false;window._voiceN=0;window._voiceHost="";
function voiceRoom(){return "KoldihaPujaVoice";}
function voiceName(){return (user&&user.name)||"श्रद्धालु";}
function voiceSrc(){
  return "https://meet.jit.si/"+voiceRoom()+"#userInfo.displayName=\""+encodeURIComponent(voiceName())+"\"&config.startWithVideoMuted=true&config.startAudioOnly=true&config.prejoinPageEnabled=false&interfaceConfig.TOOLBAR_BUTTONS=['microphone','hangup']";
}
function ensureVoicePage(){
  if(document.getElementById("p-voice"))return;
  var wrap=document.querySelector(".wrap");if(!wrap)return;
  var s=document.createElement("section");s.className="page";s.id="p-voice";wrap.appendChild(s);
}
window.joinVoice=async function(){
  window._voiceOn=true;
  if(window.fs){try{await fs.collection("voice").doc((user&&user.phone)||("g"+Date.now())).set({phone:(user&&user.phone)||"guest",name:voiceName(),t:Date.now(),on:true});}catch(e){}}
  if(typeof go==="function")go("voice");
  setTimeout(function(){
    renderVoice();
    var f=document.getElementById("vFrame");
    if(f){f.src=voiceSrc();f.style.display="block";}
  },50);
  toast("लाइव कॉल से जुड़ गए");
};
window.leaveVoice=async function(){
  window._voiceOn=false;
  var f=document.getElementById("vFrame");if(f){f.src="about:blank";f.style.display="none";}
  if(window.fs&&user){try{await fs.collection("voice").doc(user.phone).delete();}catch(e){}}
  renderVoice();toast("कॉल कट गई");
};
window.renderVoice=function(){
  ensureVoicePage();
  var page=document.getElementById("p-voice");if(!page)return;
  page.innerHTML='<h2>🎙️ लाइव आवाज़</h2><div class="vstat">जुड़े लोग: <b>'+window._voiceN+'</b></div><div class="card"><div class="vbtns"><button class="btn" onclick="joinVoice()">सीधे जुड़ें</button><button class="btn ghost" onclick="leaveVoice()">कॉल काटो</button></div><p class="meta">माइक की अनुमति दें। म्यूट नीचे वाले माइक बटन से करें।</p></div><iframe class="vframe" id="vFrame" allow="microphone;autoplay" style="display:'+(window._voiceOn?"block":"none")+'"></iframe>';
};
function voiceBanner(){
  var home=document.getElementById("p-home");if(!home)return;
  var el=document.getElementById("vbanner");
  if(window._voiceN<=0){if(el)el.remove();return;}
  if(!el){el=document.createElement("div");el.id="vbanner";el.className="vbanner";home.insertBefore(el,home.firstChild);}
  el.innerHTML='🔴 लाइव आवाज़ चल रही है — '+window._voiceN+' जुड़े<button class="btn" onclick="joinVoice()">सीधे कॉल में जुड़ें</button>';
}
function voiceHomeBtn(){
  var grid=document.querySelector(".home-grid");if(!grid||document.getElementById("tileVoice"))return;
  var b=document.createElement("button");b.className="tile";b.id="tileVoice";b.onclick=function(){joinVoice();};
  b.innerHTML="<span>🎙️</span>लाइव आवाज़";grid.appendChild(b);
}
const _goV=window.go;
window.go=function(name){if(typeof _goV==="function")_goV(name);if(name==="voice")setTimeout(renderVoice,20);};
const _rhV=window.renderHome;
window.renderHome=function(){if(typeof _rhV==="function")try{_rhV();}catch(e){}voiceHomeBtn();voiceBanner();};
setTimeout(function(){
  ensureVoicePage();voiceHomeBtn();
  if(window.fs&&!window._voiceLive){
    window._voiceLive=true;
    try{fs.collection("voice").onSnapshot(function(qs){window._voiceN=qs.size;voiceBanner();if(document.querySelector("#p-voice.on"))renderVoice();});}catch(e){}}
},800);

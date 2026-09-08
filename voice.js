window._pcs={};window._voiceOn=false;window._voiceMuted=false;window._voiceN=0;window._localStream=null;
function voiceId(){
  if(user&&user.phone)return String(user.phone);
  var g=localStorage.getItem("koldiha_vid")||("g"+Math.random().toString(36).slice(2,8));
  localStorage.setItem("koldiha_vid",g);return g;
}
function voiceName(){return (user&&user.name)||"श्रद्धालु";}
function iceConf(){return {iceServers:[{urls:"stun:stun.l.google.com:19302"}]};}
function ensureVoicePage(){
  if(document.getElementById("p-voice"))return;
  var wrap=document.querySelector(".wrap");if(!wrap)return;
  var s=document.createElement("section");s.className="page";s.id="p-voice";wrap.appendChild(s);
}
window.renderVoice=function(){
  ensureVoicePage();
  var page=document.getElementById("p-voice");if(!page)return;
  page.innerHTML='<h2>🎙️ लाइव आवाज़</h2><div class="card"><p><b>'+(window._voiceOn?"आप कॉल में हैं":"कॉल बंद है")+'</b></p><p class="meta">जुड़े: <b>'+window._voiceN+'</b></p><button class="btn" onclick="joinVoice()">जुड़ें</button><button class="btn ghost" onclick="muteVoice()">'+(window._voiceMuted?"आवाज़ खोलो":"म्यूट")+'</button><button class="btn" onclick="leaveVoice()">कॉल काटो</button><p class="meta">माइक की अनुमति दें। कोई दूसरा ऐप नहीं लगाना।</p></div>';
};
async function ensureMic(){
  if(window._localStream)return window._localStream;
  window._localStream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
  return window._localStream;
}
function pairDoc(a,b){return [String(a),String(b)].sort().join("_");}
async function callPeer(other){
  if(!window._voiceOn||other===voiceId()||window._pcs[other])return;
  var pc=new RTCPeerConnection(iceConf());window._pcs[other]=pc;
  (await ensureMic()).getTracks().forEach(function(t){pc.addTrack(t,window._localStream);});
  var rem=new Audio();rem.autoplay=true;pc.ontrack=function(e){rem.srcObject=e.streams[0];};
  pc.onicecandidate=function(e){
    if(!e.candidate||!window.fs)return;
    fs.collection("voiceIce").add({pair:pairDoc(voiceId(),other),from:voiceId(),cand:e.candidate.toJSON(),t:Date.now()});
  };
  if(voiceId()<other){
    var off=await pc.createOffer();await pc.setLocalDescription(off);
    if(window.fs)await fs.collection("voiceSig").doc(pairDoc(voiceId(),other)).set({from:voiceId(),to:other,offer:off,t:Date.now()});
  }
}
function bindSig(){
  if(!window.fs||window._sigOn)return;window._sigOn=true;
  fs.collection("voiceSig").onSnapshot(async function(qs){
    if(!window._voiceOn)return;
    for(var i=0;i<qs.docs.length;i++){
      var d=qs.docs[i].data();if(!d)continue;
      var other=d.from===voiceId()?d.to:d.to===voiceId()?d.from:null;
      if(!other)continue;
      if(!window._pcs[other])await callPeer(other);
      var pc=window._pcs[other];if(!pc)continue;
      if(d.offer&&d.from!==voiceId()&&!pc.currentRemoteDescription){
        await pc.setRemoteDescription(new RTCSessionDescription(d.offer));
        var ans=await pc.createAnswer();await pc.setLocalDescription(ans);
        await fs.collection("voiceSig").doc(qs.docs[i].id).set({answer:ans},{merge:true});
      }
      if(d.answer&&d.from===voiceId()&&pc.signalingState!=="stable"){
        try{await pc.setRemoteDescription(new RTCSessionDescription(d.answer));}catch(e){}
      }
    }
  });
  fs.collection("voiceIce").onSnapshot(function(qs){
    if(!window._voiceOn)return;
    qs.forEach(function(doc){
      var x=doc.data();if(!x||x.from===voiceId())return;
      var other=x.from;var pc=window._pcs[other];
      if(pc&&x.cand)pc.addIceCandidate(new RTCIceCandidate(x.cand)).catch(function(){});
    });
  });
}
window.joinVoice=async function(){
  try{
    await ensureMic();
    window._voiceOn=true;window._voiceMuted=false;
    if(window.fs)await fs.collection("voice").doc(voiceId()).set({id:voiceId(),name:voiceName(),t:Date.now()});
    bindSig();
    Object.keys(window._voicePeers||{}).forEach(function(id){callPeer(id);});
    go("voice");renderVoice();toast("कॉल से जुड़ गए");
  }catch(e){toast("माइक चालू करें");}
};
window.muteVoice=function(){
  if(!window._localStream)return;
  window._voiceMuted=!window._voiceMuted;
  window._localStream.getAudioTracks().forEach(function(t){t.enabled=!window._voiceMuted;});
  renderVoice();
};
window.leaveVoice=async function(){
  window._voiceOn=false;
  Object.keys(window._pcs).forEach(function(k){try{window._pcs[k].close();}catch(e){}});window._pcs={};
  if(window._localStream){window._localStream.getTracks().forEach(function(t){t.stop();});window._localStream=null;}
  if(window.fs){try{await fs.collection("voice").doc(voiceId()).delete();}catch(e){}}
  renderVoice();toast("कॉल कट गई");
};
function voiceBanner(){
  var home=document.getElementById("p-home");if(!home)return;
  var el=document.getElementById("vbanner");
  if(window._voiceN<=0){if(el)el.remove();return;}
  if(!el){el=document.createElement("div");el.id="vbanner";el.style.cssText="background:#6B1212;color:#F7E7C3;border-radius:12px;padding:10px;margin:6px 0;text-align:center";home.insertBefore(el,home.firstChild);}
  el.innerHTML='🔴 लाइव आवाज़ — '+window._voiceN+' जुड़े<button class="btn" onclick="joinVoice()">जुड़ें</button>';
}
function voiceHomeBtn(){
  var grid=document.querySelector(".home-grid");if(!grid||document.getElementById("tileVoice"))return;
  var b=document.createElement("button");b.className="tile";b.id="tileVoice";b.onclick=function(){joinVoice();};
  b.innerHTML="<span>🎙️</span>लाइव आवाज़";grid.appendChild(b);
}
const _goV=window.go;window.go=function(n){if(typeof _goV==="function")_goV(n);if(n==="voice")setTimeout(renderVoice,20);};
const _rhV=window.renderHome;window.renderHome=function(){if(typeof _rhV==="function")try{_rhV();}catch(e){}voiceHomeBtn();voiceBanner();};
setTimeout(function(){
  ensureVoicePage();voiceHomeBtn();
  if(window.fs&&!window._voiceLive){
    window._voiceLive=true;
    fs.collection("voice").onSnapshot(function(qs){
      window._voicePeers={};window._voiceN=qs.size;
      qs.forEach(function(d){window._voicePeers[d.id]=d.data();if(window._voiceOn)callPeer(d.id);});
      voiceBanner();if(document.querySelector("#p-voice.on"))renderVoice();
    });
  }
},800);

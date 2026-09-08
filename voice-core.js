window._pcs=window._pcs||{};window._aud=window._aud||{};window._iceQ=window._iceQ||{};
window._voiceOn=!!window._voiceOn;window._voiceMuted=!!window._voiceMuted;
window._voiceN=window._voiceN||0;window._voicePeers=window._voicePeers||{};
function voiceId(){
  if(window.user&&user.phone)return String(user.phone);
  var g=localStorage.getItem("koldiha_vid")||("g"+Math.random().toString(36).slice(2,8));
  localStorage.setItem("koldiha_vid",g);return g;
}
function voiceName(){return (window.user&&user.name)||"श्रद्धालु";}
function iceConf(){
  return {iceServers:[
    {urls:["stun:stun.l.google.com:19302","stun:stun1.l.google.com:19302"]},
    {urls:"turn:openrelay.metered.ca:80",username:"openrelayproject",credential:"openrelayproject"},
    {urls:"turn:openrelay.metered.ca:443",username:"openrelayproject",credential:"openrelayproject"},
    {urls:"turns:openrelay.metered.ca:443?transport=tcp",username:"openrelayproject",credential:"openrelayproject"},
    {urls:"turn:global.relay.metered.ca:80",username:"openrelayproject",credential:"openrelayproject"},
    {urls:"turns:global.relay.metered.ca:443?transport=tcp",username:"openrelayproject",credential:"openrelayproject"}
  ],iceCandidatePoolSize:4};
}
async function ensureMic(){
  if(window._localStream)return window._localStream;
  window._localStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1},video:false});
  return window._localStream;
}
function ensureVoicePage(){
  var wrap=document.querySelector(".wrap");if(!wrap)return;
  if(!document.getElementById("p-voice")){
    var s=document.createElement("section");s.className="page";s.id="p-voice";wrap.appendChild(s);
  }
}
function playRemote(id,stream){
  var a=window._aud[id];if(!a){a=new Audio();a.autoplay=true;a.playsInline=true;window._aud[id]=a;}
  a.srcObject=stream;a.play().catch(function(){});
}
async function flushIce(id){
  var pc=window._pcs[id];var q=window._iceQ[id]||[];
  if(!pc||!pc.remoteDescription)return;
  window._iceQ[id]=[];
  for(var i=0;i<q.length;i++){try{await pc.addIceCandidate(new RTCIceCandidate(q[i]));}catch(e){}}
}
async function makePC(other){
  if(window._pcs[other])return window._pcs[other];
  var pc=new RTCPeerConnection(iceConf());window._pcs[other]=pc;
  var stream=await ensureMic();
  stream.getTracks().forEach(function(t){pc.addTrack(t,stream);});
  pc.ontrack=function(e){playRemote(other,e.streams[0]);};
  pc.onicecandidate=function(e){
    if(!e.candidate||!window.fs)return;
    fs.collection("voiceIce").add({from:voiceId(),to:other,cand:e.candidate.toJSON(),t:Date.now()});
  };
  pc.onconnectionstatechange=function(){if(typeof renderVoice==="function")renderVoice();};
  return pc;
}
async function offerTo(other){
  if(!window._voiceOn||other===voiceId())return;
  var pc=await makePC(other);
  if(pc._offered)return;pc._offered=true;
  var off=await pc.createOffer({offerToReceiveAudio:true});
  await pc.setLocalDescription(off);
  if(window.fs)await fs.collection("voiceSig").doc(voiceId()+"_"+other).set({from:voiceId(),to:other,type:"offer",sdp:{type:off.type,sdp:off.sdp},t:Date.now()});
}
async function takeOffer(d){
  if(d.to!==voiceId()||d.from===voiceId()||!d.sdp)return;
  var pc=await makePC(d.from);
  if(pc.signalingState!=="stable"&&pc.currentRemoteDescription)return;
  await pc.setRemoteDescription(new RTCSessionDescription(d.sdp));
  await flushIce(d.from);
  var ans=await pc.createAnswer();await pc.setLocalDescription(ans);
  if(window.fs)await fs.collection("voiceSig").doc(voiceId()+"_"+d.from).set({from:voiceId(),to:d.from,type:"answer",sdp:{type:ans.type,sdp:ans.sdp},t:Date.now()});
}
async function takeAnswer(d){
  if(d.to!==voiceId()||!d.sdp)return;
  var pc=window._pcs[d.from];if(!pc)return;
  if(pc.signalingState!=="have-local-offer")return;
  await pc.setRemoteDescription(new RTCSessionDescription(d.sdp));
  await flushIce(d.from);
}
function bindVoiceCloud(){
  if(!window.fs||window._vBound)return;window._vBound=true;
  fs.collection("voice").onSnapshot(function(qs){
    window._voicePeers={};window._voiceN=qs.size;
    qs.forEach(function(doc){window._voicePeers[doc.id]=doc.data();});
    if(window._voiceOn)Object.keys(window._voicePeers).forEach(function(id){if(id!==voiceId()&&voiceId()<id)offerTo(id);});
    if(typeof voiceHomeBtn==="function")voiceHomeBtn();
    if(typeof renderVoice==="function")renderVoice();
  });
  fs.collection("voiceSig").onSnapshot(function(qs){
    if(!window._voiceOn)return;
    qs.forEach(function(doc){
      var d=doc.data();if(!d)return;
      if(d.type==="offer")takeOffer(d).catch(function(){});
      if(d.type==="answer")takeAnswer(d).catch(function(){});
    });
  });
  fs.collection("voiceIce").onSnapshot(function(qs){
    if(!window._voiceOn)return;
    qs.forEach(function(doc){
      var x=doc.data();if(!x||x.to!==voiceId()||!x.cand)return;
      var pc=window._pcs[x.from];
      if(pc&&pc.remoteDescription)pc.addIceCandidate(new RTCIceCandidate(x.cand)).catch(function(){});
      else{(window._iceQ[x.from]=window._iceQ[x.from]||[]).push(x.cand);}
    });
  });
}
window.joinVoice=async function(){
  try{
    ensureVoicePage();
    await ensureMic();
    window._voiceOn=true;window._voiceMuted=false;
    if(window.fs)await fs.collection("voice").doc(voiceId()).set({id:voiceId(),name:voiceName(),t:Date.now()});
    bindVoiceCloud();
    Object.keys(window._voicePeers||{}).forEach(function(id){if(voiceId()<id)offerTo(id);});
    if(typeof go==="function")go("voice");
    renderVoice();
    if(typeof toast==="function")toast("कॉल से जुड़ गए");
  }catch(e){if(typeof toast==="function")toast("माइक Allow करें");}
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
  Object.keys(window._aud).forEach(function(k){try{window._aud[k].pause();window._aud[k].srcObject=null;}catch(e){}});window._aud={};
  if(window._localStream){window._localStream.getTracks().forEach(function(t){t.stop();});window._localStream=null;}
  if(window.fs){try{await fs.collection("voice").doc(voiceId()).delete();}catch(e){}}
  renderVoice();if(typeof toast==="function")toast("कॉल कट गई");
};
var VCOL=["#4f46e5","#db2777","#d97706","#0d9488","#6B1212","#7c3aed"];
function vIni(n){n=String(n||"?");var p=n.trim().split(/\s+/);return ((p[0]||"?").charAt(0)+(p[1]?p[1].charAt(0):"")).toUpperCase();}
window.renderVoice=function(){
  ensureVoicePage();
  var page=document.getElementById("p-voice");if(!page)return;
  var list=Object.keys(window._voicePeers||{}).map(function(id){var x=window._voicePeers[id]||{};return {id:id,name:x.name||id};});
  if(window._voiceOn&&!list.some(function(p){return p.id===voiceId();}))list.unshift({id:voiceId(),name:voiceName()+" (आप)"});
  var tiles=list.length?list.map(function(p,i){
    var me=p.id===voiceId();
    var st=window._pcs[p.id]&&window._pcs[p.id].connectionState;
    var mark=me?(window._voiceMuted?"म्यूट":"आप"):(st==="connected"?"जुड़े":(st?"जुड़ रहे":"..."));
    return '<div class="vtile '+(me?"me":"")+'"><div class="vav" style="background:'+VCOL[i%VCOL.length]+'">'+vIni(p.name)+'</div><div class="vlab">'+p.name+' · '+mark+'</div></div>';
  }).join(""):'<div class="vtile"><div class="vlab">अभी कोई नहीं</div></div>';
  page.innerHTML='<div class="vui"><div class="vui-top"><div><div class="vui-live">● LIVE</div><div style="font-size:15px;font-weight:800;margin-top:4px">कोल्डीहा आवाज़</div><div style="font-size:12px;color:#9ca3af">'+(list.length||0)+' जुड़े</div></div></div><div class="vui-grid">'+tiles+'</div><div class="vui-bar">'+(window._voiceOn?'<button onclick="muteVoice()">'+(window._voiceMuted?"🔇":"🎤")+'</button><button class="end" onclick="leaveVoice()">कॉल काटो</button>':'<button class="end" style="background:#16a34a" onclick="joinVoice()">जुड़ें</button>')+'</div></div>';
};
(function(){
  if(document.getElementById("vuiCss"))return;
  var s=document.createElement("style");s.id="vuiCss";
  s.textContent="#p-voice.on{background:#111827;color:#fff;padding:0!important}#p-voice .vui{display:flex;flex-direction:column;min-height:100%;background:#111827}.vui-top{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:#1f2937}.vui-live{background:rgba(34,197,94,.2);color:#4ade80;border-radius:8px;padding:4px 8px;font-size:11px;font-weight:800}.vui-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px;flex:1;align-content:start}.vtile{position:relative;background:#1f2937;border-radius:16px;min-height:120px;display:flex;align-items:center;justify-content:center;border:1px solid #374151}.vtile.me{border:2px solid #22c55e}.vav{width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:#fff}.vlab{position:absolute;left:8px;right:8px;bottom:8px;background:rgba(0,0,0,.55);border-radius:8px;padding:4px 8px;font-size:11px;text-align:center}.vui-bar{display:flex;justify-content:center;gap:12px;padding:12px;background:#1f2937}.vui-bar button{width:48px;height:48px;border:0;border-radius:99px;background:#374151;color:#fff;font-size:18px}.vui-bar .end{background:#dc2626;width:auto;padding:0 16px;font-size:13px;font-weight:800}";
  document.head.appendChild(s);
})();
setTimeout(function(){ensureVoicePage();bindVoiceCloud();},800);

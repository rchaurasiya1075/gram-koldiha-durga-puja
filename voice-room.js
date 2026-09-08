function waitFs(ms){
  ms=ms||8000;var t=Date.now();
  return new Promise(function(ok){
    (function tick(){if(window.fs)return ok(true);if(Date.now()-t>ms)return ok(false);setTimeout(tick,200);})();
  });
}
function peerPhoto(p){
  if(p&&(p.dp||p.photo))return p.dp||p.photo;
  var mem=(window.db&&db.members&&p&&db.members[p.id||p.phone]);
  return (mem&&(mem.dp||mem.photo))||"";
}
window.renderVoice=function(){
  if(typeof ensureVoicePage==="function")ensureVoicePage();
  var page=document.getElementById("p-voice");if(!page)return;
  var list=[];
  Object.keys(window._voicePeers||{}).forEach(function(id){
    var x=window._voicePeers[id]||{};
    list.push({id:id,name:x.name||id,talk:!!x.talk,photo:peerPhoto(x)});});
  list.sort(function(a,b){return String(a.name).localeCompare(String(b.name));});
  var tiles=list.length?list.map(function(p,i){
    var me=p.id===((typeof voiceId==="function"&&voiceId())||"");
    var cols=["#4f46e5","#db2777","#d97706","#0d9488","#6B1212","#7c3aed"];
    var ini=String(p.name||"?").trim().split(/\s+/);ini=((ini[0]||"?").charAt(0)+(ini[1]?ini[1].charAt(0):"")).toUpperCase();
    var av=p.photo?("<img src=\""+p.photo+"\" style=\"width:56px;height:56px;border-radius:50%;object-fit:cover\">"):("<div class=\"vav\" style=\"background:"+cols[i%6]+"\">"+ini+"</div>");
    return "<div class=\"vtile "+(me?"me":"")+(p.talk?" speaking":"")+"\">"+av+(p.talk?"<div class=\"speakw\">~ ~ ~</div>":"")+"<div class=\"vlab\">"+p.name+(me?" · आप":"")+"</div></div>";
  }).join(""):"<div class=\"vtile\"><div class=\"vlab\">अभी कोई नहीं — जुड़ें दबाओ</div></div>";
  page.innerHTML='<div class="vui"><div class="vui-top"><div><div class="vui-live">● LIVE</div><div style="font-size:15px;font-weight:800;margin-top:4px">कोल्डीहा आवाज़</div><div style="font-size:12px;color:#9ca3af">'+list.length+' जुड़े</div></div></div><div class="vui-grid">'+tiles+'</div><div class="vui-bar">'+(window._voiceOn?'<button onclick="muteVoice()">'+(window._voiceMuted?"\ud83d\udd07":"\ud83c\udfa4")+'</button><button class="end" onclick="leaveVoice()">कॉल काटो</button>':'<button class="end" style="background:#16a34a" onclick="joinVoice()">जुड़ें</button>')+'</div></div>';
};
window.joinVoice=async function(){
  if(typeof ensureVoicePage==="function")ensureVoicePage();
  if(typeof go==="function")go("voice");
  window._voiceOn=true;window._voiceMuted=false;
  var id=(typeof voiceId==="function"&&voiceId())||("g"+Date.now());
  var name=(typeof voiceName==="function"&&voiceName())||"श्रद्धालु";
  var dp=window.user&&(user.dp||user.photo)||"";
  window._voicePeers=window._voicePeers||{};
  window._voicePeers[id]={id:id,name:name,dp:dp,t:Date.now()};
  window._voiceN=Object.keys(window._voicePeers).length;
  renderVoice();
  var ok=await waitFs(10000);
  if(ok&&window.fs){
    try{await fs.collection("voice").doc(id).set({id:id,name:name,dp:dp,t:Date.now(),talk:false});}catch(e){}
    if(typeof bindVoiceCloud==="function")bindVoiceCloud();
  }
  try{if(typeof ensureMic==="function")await ensureMic();}catch(e){if(typeof toast==="function")toast("माइक Allow करो");}
  Object.keys(window._voicePeers).forEach(function(oid){
    if(oid!==id&&typeof offerTo==="function"&&id<oid)offerTo(oid);
    else if(oid!==id&&typeof callPeer==="function")callPeer(oid);
  });
  renderVoice();
  if(typeof toast==="function")toast("कॉल में हैं — "+name);
};
setTimeout(function(){if(typeof bindVoiceCloud==="function")bindVoiceCloud();},500);

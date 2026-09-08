window._talking={};
async function ensureMic(){
  if(window._localStream){
    var live=window._localStream.getAudioTracks().some(function(t){return t.readyState==="live"&&t.enabled;});
    if(live)return window._localStream;
    window._localStream.getTracks().forEach(function(t){t.stop();});
    window._localStream=null;
  }
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
    toast("Chrome से खोलो");throw new Error("no-media");
  }
  try{
    if(navigator.permissions&&navigator.permissions.query){
      var st=await navigator.permissions.query({name:"microphone"});
      if(st.state==="denied"){toast("सेटिंग में माइक Allow करो");throw new Error("denied");}
    }
  }catch(e){if(e&&e.message==="denied")throw e;}
  var stream=null;
  try{stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});}
  catch(e1){
    try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true},video:false});}
    catch(e2){toast("माइक Allow करो");throw e2;}
  }
  window._localStream=stream;
  startTalkWatch(stream,true);
  return stream;
}
function startTalkWatch(stream,mine){
  try{
    var ctx=window._actx||new (window.AudioContext||window.webkitAudioContext)();
    window._actx=ctx;if(ctx.state==="suspended")ctx.resume();
    var src=ctx.createMediaStreamSource(stream);
    var an=ctx.createAnalyser();an.fftSize=512;src.connect(an);
    var data=new Uint8Array(an.frequencyBinCount);
    var id=mine?((typeof voiceId==="function"&&voiceId())||"me"):("r"+Math.random().toString(36).slice(2,6));
    (function loop(){
      if(!window._voiceOn)return;
      an.getByteFrequencyData(data);
      var sum=0;for(var i=0;i<data.length;i++)sum+=data[i];
      var on=(sum/data.length)>12;
      if(window._talking[id]!==on){
        window._talking[id]=on;
        if(mine&&window.fs){try{fs.collection("voice").doc(String(id)).set({talk:on,t:Date.now()},{merge:true});}catch(e){}}
        if(document.querySelector("#p-voice.on")&&typeof renderVoice==="function")renderVoice();
      }
      requestAnimationFrame(loop);
    })();
  }catch(e){}
}
const _rv0=window.renderVoice;
window.renderVoice=function(){
  if(typeof _rv0==="function")_rv0();
  var page=document.getElementById("p-voice");if(!page)return;
  page.querySelectorAll(".vtile").forEach(function(tile){
    var lab=tile.querySelector(".vlab");if(!lab)return;
    var name=lab.textContent||"";
    var talk=false;
    Object.keys(window._voicePeers||{}).forEach(function(pid){
      var p=window._voicePeers[pid]||{};
      if((p.talk||window._talking[pid])&&name.indexOf(p.name||"")>=0)talk=true;
    });
    if((window._talking[typeof voiceId==="function"?voiceId():""])&&/आप/.test(name))talk=true;
    var w=tile.querySelector(".speakw");
    if(talk){if(!w){w=document.createElement("div");w.className="speakw";w.textContent="~ ~ ~";tile.appendChild(w);}tile.classList.add("speaking");}
    else{if(w)w.remove();tile.classList.remove("speaking");}
  });
};
(function(){var s=document.createElement("style");s.textContent=".vtile.speaking{border-color:#22c55e}.speakw{position:absolute;top:8px;right:8px;color:#4ade80;font-weight:800;animation:spk .8s infinite}@keyframes spk{50%{opacity:.35}}";document.head.appendChild(s);})();

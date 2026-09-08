function showMicHelp(){
  if(document.getElementById("micHelp"))return;
  var d=document.createElement("div");d.id="micHelp";
  d.style.cssText="position:fixed;inset:0;z-index:99;background:rgba(0,0,0,.6);display:flex;align-items:flex-end;justify-content:center";
  d.innerHTML='<div style="background:#fff7ea;width:100%;max-width:430px;border-radius:18px 18px 0 0;padding:20px;text-align:center">'+
    '<div style="font-size:40px">🎤</div>'+
    '<h3 style="color:#6B1212;margin:8px 0">माइक चालू करें</h3>'+
    '<p>नीचे <b>Allow / अनुमति दें</b> दबाएँ।<br>इतना ही करना है।</p>'+
    '<button class="btn" onclick="askMicNow()">माइक चालू करो</button></div>';
  document.body.appendChild(d);
}
function hideMicHelp(){var d=document.getElementById("micHelp");if(d)d.remove();}
window.askMicNow=async function(){
  try{
    var s=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
    window._localStream=s;
    hideMicHelp();
    if(typeof toast==="function")toast("माइक चालू");
    if(!window._voiceOn&&typeof joinVoice==="function")joinVoice();
    return s;
  }catch(e){
    if(typeof toast==="function")toast("Allow दबाओ");
    showMicHelp();
    throw e;
  }
};
const _join0=window.joinVoice;
window.joinVoice=async function(){
  try{
    if(!(window._localStream&&window._localStream.getAudioTracks().some(function(t){return t.readyState==="live";}))){
      var s=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
      window._localStream=s;
    }
    hideMicHelp();
  }catch(e){
    showMicHelp();
    return;
  }
  if(typeof _join0==="function")return _join0();
};

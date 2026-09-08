(function(){
  var s=document.createElement("style");
  s.textContent=".wave{display:inline-flex;gap:2px;height:14px;align-items:flex-end;margin:0 6px}.wave i{width:3px;background:#F7E7C3;display:block;animation:wv 1s infinite ease-in-out}.wave i:nth-child(2){animation-delay:.15s}.wave i:nth-child(3){animation-delay:.3s}.wave i:nth-child(4){animation-delay:.45s}@keyframes wv{0%,100%{height:4px}50%{height:14px}}.tile.hot.liveon{box-shadow:0 0 0 2px #f5c97a}#vbanner,#p-chat #vbanner,#p-voice #vbanner{display:none!important}#p-chat #instBan,#p-voice #instBan{display:none!important}";
  document.head.appendChild(s);
})();
window.voiceHomeBtn=function(){
  var grid=document.querySelector(".home-grid");if(!grid)return;
  var b=document.getElementById("tileVoice");
  if(!b){b=document.createElement("button");b.id="tileVoice";b.onclick=function(){if(typeof joinVoice==="function")joinVoice();else go("voice");};}
  var n=Number(window._voiceN||0);
  b.className="tile hot"+(n?" liveon":"");
  b.innerHTML=n?('<span class="wave"><i></i><i></i><i></i><i></i></span> कॉल चल रही है · '+n+' जुड़े'):"🎙️ लाइव आवाज़";
  if(grid.firstChild!==b)grid.insertBefore(b,grid.firstChild);
  var old=document.getElementById("vbanner");if(old)old.remove();
};
window.voiceBanner=function(){window.voiceHomeBtn();};
function pingCallJoin(name){
  try{
    if(typeof showPush==="function")showPush("लाइव आवाज़",(name||"कोई")+" कॉल से जुड़े हैं","#/voice");
    if(window.fs)fs.collection("alerts").add({title:"लाइव आवाज़",body:(name||"कोई")+" कॉल से जुड़े हैं — जुड़ें",t:Date.now(),kind:"voice"});
  }catch(e){}
}
const _jv=window.joinVoice;
window.joinVoice=async function(){
  var name=(typeof voiceName==="function"&&voiceName())||"श्रद्धालु";
  if(typeof _jv==="function")await _jv();
  pingCallJoin(name);
};

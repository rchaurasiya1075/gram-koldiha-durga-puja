(function(){
  var s=document.createElement("style");
  s.textContent=[
    "#liveKeep{position:fixed;z-index:40;background:#000;overflow:hidden;border-radius:12px}",
    "#liveKeep.full{left:8px;right:8px;top:auto;bottom:72px;width:auto;aspect-ratio:16/9}",
    "#liveKeep.mini{left:auto;right:10px;bottom:78px;width:168px;height:96px;box-shadow:0 8px 24px rgba(0,0,0,.4)}",
    "#liveKeep iframe{position:absolute;top:50%;left:50%;width:175%;height:175%;transform:translate(-50%,-50%);border:0}",
    "#liveKeep .x{position:absolute;top:4px;right:4px;z-index:5;border:0;background:#6B1212;color:#fff;border-radius:99px;width:22px;height:22px;font-size:12px}",
    "#liveKeep.full .x{display:none}"
  ].join("");
  document.head.appendChild(s);
})();
window._liveId="";
function liveSrc(id){
  return "https://www.youtube-nocookie.com/embed/"+id+"?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1&cc_load_policy=0&showinfo=0";
}
function ensureKeep(){
  var k=document.getElementById("liveKeep");
  if(!k){
    k=document.createElement("div");k.id="liveKeep";k.style.display="none";
    k.innerHTML='<button class="x" onclick="stopLive(true)">×</button>';
    document.body.appendChild(k);
  }
  return k;
}
window.stopLive=function(force){
  var k=document.getElementById("liveKeep");if(!k)return;
  var f=k.querySelector("iframe");if(f)f.remove();
  k.style.display="none";window._liveId="";
};
window.renderLive=function(){
  var box=document.getElementById("liveBox");
  var id=(typeof ytId==="function")?ytId((db.settings&&db.settings.liveUrl)||""):"";
  if(!id){if(box)box.innerHTML='<p class="meta">एडमिन लाइव लिंक डाले।</p>';return;}
  var k=ensureKeep();
  var f=k.querySelector("iframe");
  if(window._liveId!==id||!f){
    if(f)f.remove();
    f=document.createElement("iframe");
    f.setAttribute("allow","autoplay;encrypted-media");
    f.title="Live";
    f.src=liveSrc(id);
    k.appendChild(f);
    window._liveId=id;
  }
  k.style.display="block";
  placeLive();
  if(box)box.innerHTML='<p class="meta">लाइव चल रहा है — पीछे जाने पर भी चलेगा</p>';
};
function placeLive(){
  var k=document.getElementById("liveKeep");if(!k||!window._liveId)return;
  var onLive=!!document.querySelector("#p-live.on");
  k.className=onLive?"full":"mini";
}
const _goL=window.go;
window.go=function(name){
  if(typeof _goL==="function")_goL(name);
  if(name==="live")setTimeout(renderLive,20);
  else setTimeout(placeLive,20);
};
document.addEventListener("visibilitychange",function(){ /* minimize: do not stop */ });
window.addEventListener("pagehide",function(e){
  if(!e.persisted)stopLive(true);
});
window.addEventListener("beforeunload",function(){stopLive(true);});
if(document.querySelector("#p-live.on"))renderLive();

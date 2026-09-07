(function(){
  var s=document.createElement("style");
  s.textContent=[
    "#p-live .liveCard{background:#1a0a0a;border-radius:16px;overflow:hidden;border:1px solid #ead3bc}",
    "#p-live .liveFrame{position:relative;width:100%;aspect-ratio:16/9;background:#000}",
    "#p-live .liveFrame iframe,#ytPlayer{position:absolute;inset:0;width:100%;height:100%;border:0}",
    "#p-live .shield{position:absolute;inset:0;z-index:2}",
    "#p-live .liveHint{padding:10px 12px;color:#6B1212;background:#fff7ea;font-size:13px;font-weight:700;display:flex;gap:8px;align-items:center;justify-content:space-between}",
    "#p-live .snd{border:0;background:#6B1212;color:#fff;border-radius:10px;padding:8px 12px;font-weight:800;font-family:inherit}",
    "#liveKeep{position:fixed;z-index:45;background:#111;overflow:hidden;border-radius:14px;touch-action:none;display:none;box-shadow:0 10px 28px rgba(0,0,0,.45)}",
    "#liveKeep iframe,#liveKeep #ytPlayer{position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none}",
    "#liveKeep .grab{position:absolute;inset:0;z-index:5}",
    "#liveKeep .x{position:absolute;top:6px;right:6px;z-index:7;border:0;background:#6B1212;color:#fff;width:28px;height:28px;border-radius:14px;font-size:16px;font-weight:800}"
  ].join("");
  document.head.appendChild(s);
  if(!document.getElementById("ytapi")){
    var a=document.createElement("script");a.id="ytapi";a.src="https://www.youtube.com/iframe_api";document.head.appendChild(a);
  }
})();
window._liveId="";window._ytP=null;window._mini={x:null,y:null,w:190,h:108};
window.onYouTubeIframeAPIReady=function(){if(window._pendingLive)startPlayer(window._pendingLive);};
window.unmuteLive=function(){
  try{
    if(window._ytP){
      if(window._ytP.unMute)window._ytP.unMute();
      if(window._ytP.setVolume)window._ytP.setVolume(100);
      if(window._ytP.playVideo)window._ytP.playVideo();
    }
    document.querySelectorAll("#liveHost iframe").forEach(function(){});
    toast("आवाज़ चालू");
  }catch(e){}
};
function startPlayer(id){
  window._pendingLive=id;
  if(!(window.YT&&YT.Player))return;
  var host=document.getElementById("ytPlayer");if(!host)return;
  if(window._ytP&&window._ytP.loadVideoById){
    try{window._ytP.loadVideoById(id);window._ytP.unMute();window._ytP.setVolume(100);window._ytP.playVideo();}catch(e){}
    window._liveId=id;return;
  }
  window._ytP=new YT.Player("ytPlayer",{
    videoId:id,
    playerVars:{autoplay:1,mute:0,controls:0,modestbranding:1,rel:0,playsinline:1,fs:0,disablekb:1,loop:1,playlist:id,origin:location.origin},
    events:{
      onReady:function(e){try{e.target.unMute();e.target.setVolume(100);e.target.playVideo();}catch(err){}}
    }
  });
  window._liveId=id;
}
function ensureKeep(){
  var k=document.getElementById("liveKeep");
  if(!k){
    k=document.createElement("div");k.id="liveKeep";
    k.innerHTML='<div class="grab" id="liveGrab"></div><button type="button" class="x" onclick="stopLive()">×</button>';
    document.body.appendChild(k);bindMini(k);
  }
  return k;
}
window.stopLive=function(){
  try{if(window._ytP&&window._ytP.stopVideo)window._ytP.stopVideo();}catch(e){}
  var k=document.getElementById("liveKeep");if(k)k.style.display="none";
  window._liveId="";
};
function bindMini(k){
  if(k._b)return;k._b=true;
  var mode,sx,sy,ox,oy;
  function pt(e){var t=e.touches?e.touches[0]:e;return {x:t.clientX,y:t.clientY};}
  function down(e){if(k.style.display==="none")return;var p=pt(e);sx=p.x;sy=p.y;ox=k.offsetLeft;oy=k.offsetTop;mode="m";}
  function move(e){
    if(mode!=="m")return;var p=pt(e);
    window._mini.x=Math.max(0,ox+(p.x-sx));window._mini.y=Math.max(40,oy+(p.y-sy));
    applyMini();if(p.y-sy>90){stopLive();mode=null;}e.preventDefault();
  }
  function up(){mode=null;}
  k.addEventListener("touchstart",down,{passive:true});
  k.addEventListener("mousedown",down);
  window.addEventListener("touchmove",move,{passive:false});
  window.addEventListener("mousemove",move);
  window.addEventListener("touchend",up);
  window.addEventListener("mouseup",up);
}
function applyMini(){
  var k=document.getElementById("liveKeep");if(!k)return;
  var w=window._mini.w,h=window._mini.h,x=window._mini.x,y=window._mini.y;
  if(x==null)x=Math.max(8,window.innerWidth-w-14);
  if(y==null)y=Math.max(90,window.innerHeight*0.32);
  k.style.left=x+"px";k.style.top=y+"px";k.style.width=w+"px";k.style.height=h+"px";
}
window.renderLive=function(){
  var box=document.getElementById("liveBox");if(!box)return;
  var id=(typeof ytId==="function")?ytId((db.settings&&db.settings.liveUrl)||""):"";
  if(!id){box.innerHTML='<div class="card"><p class="meta">एडमिन लाइव लिंक डाले।</p></div>';return;}
  box.innerHTML='<div class="liveCard"><div class="liveFrame" id="liveHost"><div id="ytPlayer"></div><div class="shield"></div></div><div class="liveHint"><span>वीडियो + आवाज़</span><button type="button" class="snd" onclick="unmuteLive()">🔊 आवाज़ चालू</button></div></div>';
  startPlayer(id);unmuteLive();
  var k=ensureKeep();k.style.display="none";
};
function placeLive(){
  var k=ensureKeep();var onLive=!!document.querySelector("#p-live.on");
  var host=document.getElementById("liveHost");
  var node=document.getElementById("ytPlayer")||(window._ytP&&window._ytP.getIframe&&window._ytP.getIframe());
  if(!window._liveId){k.style.display="none";return;}
  if(onLive){k.style.display="none";if(host&&node&&node.parentNode!==host)host.insertBefore(node,host.firstChild);}
  else{
    if(node&&node.parentNode!==k)k.insertBefore(node,k.firstChild);
    k.style.display="block";applyMini();
  }
}
if(!window._liveGoHook){
  window._liveGoHook=true;
  var _goL=window.go;
  window.go=function(name){
    if(typeof _goL==="function")_goL(name);
    if(name==="live"){renderLive();unmuteLive();}
    else placeLive();
  };
}
if(document.querySelector("#p-live.on"))renderLive();

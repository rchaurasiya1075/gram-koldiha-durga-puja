(function(){
  var s=document.createElement("style");
  s.textContent=[
    "#p-live .liveCard{background:#1a0a0a;border-radius:16px;overflow:hidden;border:1px solid #ead3bc}",
    "#p-live .liveFrame{position:relative;width:100%;aspect-ratio:16/9;background:#000}",
    "#p-live .liveFrame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}",
    "#p-live .liveHint{padding:10px 12px;color:#6B1212;background:#fff7ea;font-size:13px;font-weight:700}",
    "#liveKeep{position:fixed;z-index:40;background:#111;overflow:hidden;border-radius:14px;touch-action:none;display:none;box-shadow:0 10px 28px rgba(0,0,0,.4)}",
    "#liveKeep iframe{position:absolute;inset:0;width:100%;height:100%;border:0}",
    "#liveKeep .bar{position:absolute;top:0;left:0;right:0;z-index:6;display:flex;justify-content:flex-end;gap:4px;padding:6px;background:linear-gradient(rgba(0,0,0,.65),transparent)}",
    "#liveKeep .bar button{border:0;background:#6B1212;color:#fff;border-radius:8px;min-width:26px;height:24px;font-size:13px;font-weight:800}",
    "#liveKeep .rsz{position:absolute;right:0;bottom:0;width:22px;height:22px;z-index:6;background:linear-gradient(135deg,transparent 50%,#f7e7c3 50%)}"
  ].join("");
  document.head.appendChild(s);
})();
window._liveId="";window._liveMute=false;
window._mini={x:null,y:null,w:190,h:108};
function liveSrc(id,mute){
  return "https://www.youtube-nocookie.com/embed/"+id+"?autoplay=1&mute="+(mute?1:0)+"&controls=1&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&loop=1&playlist="+id;
}
function ensureKeep(){
  var k=document.getElementById("liveKeep");
  if(!k){
    k=document.createElement("div");k.id="liveKeep";
    k.innerHTML='<div class="bar"><button type="button" onclick="liveSmaller()">−</button><button type="button" onclick="liveBigger()">+</button><button type="button" onclick="stopLive()">×</button></div><div class="rsz" id="liveRsz"></div>';
    document.body.appendChild(k);
    bindLiveDrag(k);
  }
  return k;
}
window.stopLive=function(){
  var k=document.getElementById("liveKeep");
  if(k){var f=k.querySelector("iframe");if(f)f.remove();k.style.display="none";}
  var box=document.getElementById("liveBox");
  if(box)box.querySelectorAll("iframe").forEach(function(i){i.remove();});
  window._liveId="";
};
window.liveBigger=function(){window._mini.w=Math.min(300,window._mini.w+28);window._mini.h=Math.round(window._mini.w*9/16);placeLive();};
window.liveSmaller=function(){window._mini.w=Math.max(130,window._mini.w-28);window._mini.h=Math.round(window._mini.w*9/16);placeLive();};
function bindLiveDrag(k){
  if(k._drag)return;k._drag=true;
  var mode,sx,sy,ox,oy;
  function pt(e){var t=e.touches?e.touches[0]:e;return {x:t.clientX,y:t.clientY};}
  function down(e){
    if(k.style.display==="none"||document.querySelector("#p-live.on"))return;
    var p=pt(e);sx=p.x;sy=p.y;ox=k.offsetLeft;oy=k.offsetTop;
    mode=e.target&&e.target.id==="liveRsz"?"r":"m";
  }
  function move(e){
    if(!mode)return;
    var p=pt(e);
    if(mode==="m"){window._mini.x=Math.max(0,ox+(p.x-sx));window._mini.y=Math.max(48,oy+(p.y-sy));}
    else{window._mini.w=Math.max(130,Math.min(320,k.offsetWidth+(p.x-sx)));window._mini.h=Math.round(window._mini.w*9/16);}
    placeLive();e.preventDefault();
  }
  function up(){mode=null;}
  k.addEventListener("touchstart",down,{passive:true});
  k.addEventListener("mousedown",down);
  window.addEventListener("touchmove",move,{passive:false});
  window.addEventListener("mousemove",move);
  window.addEventListener("touchend",up);
  window.addEventListener("mouseup",up);
}
function putIframe(host,id){
  var f=host.querySelector("iframe");
  if(window._liveId===id&&f)return f;
  if(f)f.remove();
  f=document.createElement("iframe");
  f.setAttribute("allow","autoplay;encrypted-media;fullscreen");
  f.title="Live";
  f.src=liveSrc(id,false);
  host.appendChild(f);
  window._liveId=id;
  return f;
}
window.renderLive=function(){
  var box=document.getElementById("liveBox");if(!box)return;
  var id=(typeof ytId==="function")?ytId((db.settings&&db.settings.liveUrl)||""):"";
  if(!id){box.innerHTML='<div class="card"><p class="meta">एडमिन लाइव लिंक डाले।</p></div>';stopLive();return;}
  box.innerHTML='<div class="liveCard"><div class="liveFrame" id="liveHost"></div><div class="liveHint">🔊 आवाज़ और वीडियो चल रहा है — बीच पर छोटी विंडो रहेगी</div></div>';
  putIframe(document.getElementById("liveHost"),id);
  var k=ensureKeep();k.style.display="none";
};
function placeLive(){
  var k=ensureKeep();
  var onLive=!!document.querySelector("#p-live.on");
  var host=document.getElementById("liveHost");
  var f=document.querySelector("#liveHost iframe")||k.querySelector("iframe");
  if(!window._liveId||!f){k.style.display="none";return;}
  if(onLive){
    k.style.display="none";
    if(host&&f.parentNode!==host)host.appendChild(f);
  }else{
    if(f.parentNode!==k)k.appendChild(f);
    k.style.display="block";
    var w=window._mini.w,h=window._mini.h;
    var x=window._mini.x,y=window._mini.y;
    if(x==null)x=Math.max(8,window.innerWidth-w-14);
    if(y==null)y=Math.max(90,window.innerHeight*0.28);
    k.style.left=x+"px";k.style.top=y+"px";k.style.width=w+"px";k.style.height=h+"px";
  }
}
if(!window._liveGoHook){
  window._liveGoHook=true;
  var _goL=window.go;
  window.go=function(name){
    if(typeof _goL==="function")_goL(name);
    if(name==="live")renderLive();
    else placeLive();
  };
}
if(document.querySelector("#p-live.on"))renderLive();

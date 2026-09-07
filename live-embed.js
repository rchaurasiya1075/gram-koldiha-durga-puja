(function(){
  var s=document.createElement("style");
  s.textContent=[
    "#p-live .liveCard{background:#1a0a0a;border-radius:16px;overflow:hidden;border:1px solid #ead3bc}",
    "#p-live .liveFrame{position:relative;width:100%;aspect-ratio:16/9;background:#000}",
    "#p-live .liveFrame iframe,#p-live .shield{position:absolute;inset:0;width:100%;height:100%;border:0}",
    "#p-live .shield{z-index:2;background:transparent}",
    "#p-live .liveHint{padding:10px 12px;color:#6B1212;background:#fff7ea;font-size:13px;font-weight:700}",
    "#liveKeep{position:fixed;z-index:45;background:#111;overflow:hidden;border-radius:14px;touch-action:none;display:none;box-shadow:0 10px 28px rgba(0,0,0,.45)}",
    "#liveKeep iframe{position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none}",
    "#liveKeep .grab{position:absolute;inset:0;z-index:5}",
    "#liveKeep .x{position:absolute;top:6px;right:6px;z-index:7;border:0;background:#6B1212;color:#fff;width:28px;height:28px;border-radius:14px;font-size:16px;font-weight:800}",
    "#liveKeep .hint{position:absolute;left:8px;bottom:6px;z-index:7;color:#f7e7c3;font-size:10px;font-weight:700}"
  ].join("");
  document.head.appendChild(s);
})();
window._liveId="";
window._mini={x:null,y:null,w:190,h:108};
function liveSrc(id){
  return "https://www.youtube-nocookie.com/embed/"+id+"?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&fs=0&disablekb=1&loop=1&playlist="+id;
}
function ensureKeep(){
  var k=document.getElementById("liveKeep");
  if(!k){
    k=document.createElement("div");k.id="liveKeep";
    k.innerHTML='<div class="grab" id="liveGrab"></div><button type="button" class="x" id="liveX">×</button><div class="hint">खींचो · नीचे स्लाइड = बंद</div>';
    document.body.appendChild(k);
    document.getElementById("liveX").onclick=function(e){e.stopPropagation();stopLive();};
    bindMini(k);
  }
  return k;
}
window.stopLive=function(){
  var k=document.getElementById("liveKeep");
  if(k){var f=k.querySelector("iframe");if(f)f.remove();k.style.display="none";}
  var host=document.getElementById("liveHost");
  if(host)host.querySelectorAll("iframe").forEach(function(i){i.remove();});
  window._liveId="";
};
function bindMini(k){
  if(k._b)return;k._b=true;
  var mode=null,sx,sy,ox,oy;
  function pt(e){var t=e.touches?e.touches[0]:e;return {x:t.clientX,y:t.clientY};}
  function down(e){
    if(k.style.display==="none")return;
    var p=pt(e);sx=p.x;sy=p.y;ox=k.offsetLeft;oy=k.offsetTop;mode="m";
  }
  function move(e){
    if(mode!=="m")return;
    var p=pt(e);
    window._mini.x=Math.max(0,Math.min(window.innerWidth-60,ox+(p.x-sx)));
    window._mini.y=Math.max(40,Math.min(window.innerHeight-40,oy+(p.y-sy)));
    applyMini();
    if(p.y-sy>90){stopLive();mode=null;}
    e.preventDefault();
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
  var w=window._mini.w,h=window._mini.h;
  var x=window._mini.x,y=window._mini.y;
  if(x==null)x=Math.max(8,window.innerWidth-w-14);
  if(y==null)y=Math.max(90,window.innerHeight*0.32);
  k.style.left=x+"px";k.style.top=y+"px";k.style.width=w+"px";k.style.height=h+"px";k.style.right="auto";k.style.bottom="auto";
}
function putIframe(host,id){
  var f=host.querySelector("iframe");
  if(window._liveId===id&&f)return f;
  if(f)f.remove();
  f=document.createElement("iframe");
  f.setAttribute("allow","autoplay;encrypted-media");
  f.title="Live";
  f.src=liveSrc(id);
  host.appendChild(f);
  window._liveId=id;
  return f;
}
window.renderLive=function(){
  var box=document.getElementById("liveBox");if(!box)return;
  var id=(typeof ytId==="function")?ytId((db.settings&&db.settings.liveUrl)||""):"";
  if(!id){box.innerHTML='<div class="card"><p class="meta">एडमिन लाइव लिंक डाले।</p></div>';return;}
  box.innerHTML='<div class="liveCard"><div class="liveFrame" id="liveHost"><div class="shield"></div></div><div class="liveHint">वीडियो यहीं चलेगा — YouTube नहीं खुलेगा</div></div>';
  putIframe(document.getElementById("liveHost"),id);
  var k=ensureKeep();k.style.display="none";
};
function placeLive(){
  var k=ensureKeep();
  var onLive=!!document.querySelector("#p-live.on");
  var host=document.getElementById("liveHost");
  var f=(host&&host.querySelector("iframe"))||k.querySelector("iframe");
  if(!window._liveId||!f){k.style.display="none";return;}
  if(onLive){
    k.style.display="none";
    if(host&&f.parentNode!==host)host.appendChild(f);
  }else{
    if(f.parentNode!==k)k.insertBefore(f,k.firstChild);
    k.style.display="block";
    applyMini();
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

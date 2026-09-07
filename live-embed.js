(function(){
  var s=document.createElement("style");
  s.textContent=[
    "#liveKeep{position:fixed;z-index:40;background:#000;overflow:hidden;border-radius:12px;touch-action:none}",
    "#liveKeep.full{left:8px;right:8px;top:22%;bottom:auto;width:auto;aspect-ratio:16/9;max-height:46vh}",
    "#liveKeep.mini{box-shadow:0 8px 24px rgba(0,0,0,.45)}",
    "#liveKeep iframe{position:absolute;inset:0;width:100%;height:100%;border:0}",
    "#liveKeep .bar{position:absolute;top:0;left:0;right:0;height:28px;z-index:6;display:flex;justify-content:flex-end;gap:4px;background:linear-gradient(#000,transparent);padding:4px}",
    "#liveKeep.full .bar{display:none}",
    "#liveKeep .bar button{border:0;background:#6B1212;color:#fff;border-radius:8px;width:24px;height:20px;font-size:12px;line-height:20px}",
    "#liveKeep .rsz{position:absolute;right:0;bottom:0;width:22px;height:22px;z-index:6;background:linear-gradient(135deg,transparent 50%,#f7e7c3 50%)}",
    "#liveKeep.full .rsz{display:none}"
  ].join("");
  document.head.appendChild(s);
})();
window._liveId="";
window._mini={x:null,y:null,w:180,h:102};
function liveSrc(id){
  return "https://www.youtube-nocookie.com/embed/"+id+"?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1&loop=1&playlist="+id+"&cc_load_policy=0";
}
function ensureKeep(){
  var k=document.getElementById("liveKeep");
  if(!k){
    k=document.createElement("div");k.id="liveKeep";k.style.display="none";
    k.innerHTML='<div class="bar"><button type="button" onclick="liveSmaller()">−</button><button type="button" onclick="liveBigger()">+</button><button type="button" class="x" onclick="stopLive(true)">×</button></div><div class="rsz" id="liveRsz"></div>';
    document.body.appendChild(k);
    bindLiveDrag(k);
  }
  return k;
}
window.stopLive=function(){
  var k=document.getElementById("liveKeep");if(!k)return;
  var f=k.querySelector("iframe");if(f)f.remove();
  k.style.display="none";window._liveId="";
};
window.liveBigger=function(){window._mini.w=Math.min(300,window._mini.w+30);window._mini.h=Math.round(window._mini.w*9/16);placeLive();};
window.liveSmaller=function(){window._mini.w=Math.max(120,window._mini.w-30);window._mini.h=Math.round(window._mini.w*9/16);placeLive();};
function bindLiveDrag(k){
  if(k._drag)return;k._drag=true;
  var sx,sy,ox,oy,mode;
  function pt(e){var t=e.touches?e.touches[0]:e;return {x:t.clientX,y:t.clientY};}
  function down(e){
    if(k.className!=="mini")return;
    var p=pt(e);sx=p.x;sy=p.y;ox=k.offsetLeft;oy=k.offsetTop;
    mode=e.target&&e.target.id==="liveRsz"?"r":"m";
    e.preventDefault();
  }
  function move(e){
    if(!mode||k.className!=="mini")return;
    var p=pt(e);
    if(mode==="m"){
      window._mini.x=Math.max(0,ox+(p.x-sx));
      window._mini.y=Math.max(40,oy+(p.y-sy));
    }else{
      window._mini.w=Math.max(120,Math.min(320,ox+k.offsetWidth+(p.x-sx)-ox));
      window._mini.w=Math.max(120,Math.min(320,k.offsetWidth+(p.x-sx)));
      window._mini.h=Math.round(window._mini.w*9/16);
    }
    placeLive();e.preventDefault();
  }
  function up(){mode=null;}
  k.addEventListener("touchstart",down,{passive:false});
  k.addEventListener("mousedown",down);
  window.addEventListener("touchmove",move,{passive:false});
  window.addEventListener("mousemove",move);
  window.addEventListener("touchend",up);
  window.addEventListener("mouseup",up);
}
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
    f.setAttribute("allowfullscreen","");
    f.title="Live";
    f.src=liveSrc(id);
    k.appendChild(f);
    window._liveId=id;
  }
  k.style.display="block";
  placeLive();
  if(box)box.innerHTML='<p class="meta">वीडियो आप से चल रहा है — लूप में</p>';
};
function placeLive(){
  var k=document.getElementById("liveKeep");if(!k||!window._liveId)return;
  var onLive=!!document.querySelector("#p-live.on");
  if(onLive){
    k.className="full";
    k.style.left=k.style.top=k.style.width=k.style.height="";
  }else{
    k.className="mini";
    var w=window._mini.w,h=window._mini.h;
    var x=window._mini.x,y=window._mini.y;
    if(x==null)x=window.innerWidth-w-12;
    if(y==null)y=Math.max(80,window.innerHeight*0.35);
    k.style.left=x+"px";k.style.top=y+"px";k.style.width=w+"px";k.style.height=h+"px";k.style.right="auto";k.style.bottom="auto";
  }
}
if(!window._liveGoHook){
  window._liveGoHook=true;
  var _goL=window.go;
  window.go=function(name){
    if(typeof _goL==="function")_goL(name);
    if(name==="live")setTimeout(renderLive,20);
    else setTimeout(placeLive,20);
  };
}
if(document.querySelector("#p-live.on"))renderLive();

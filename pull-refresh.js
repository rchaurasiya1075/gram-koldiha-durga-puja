(function(){
  if(window._pullV2)return;window._pullV2=1;
  var s=document.createElement("style");
  s.textContent="#pullSpin{position:fixed;top:12px;left:50%;z-index:95;transform:translateX(-50%) scale(0);pointer-events:none}#pullSpin .ring{width:44px;height:44px;border-radius:50%;background:#6B1212;border:3px solid #E8C56B;display:flex;align-items:center;justify-content:center}#pullSpin .dot{width:18px;height:18px;border-radius:50%;border:3px solid #F7E7C3;border-top-color:#E8C56B}#pullSpin.go .dot{animation:spinPull .7s linear infinite}@keyframes spinPull{to{transform:rotate(360deg)}}";
  document.head.appendChild(s);
  var box=document.createElement("div");box.id="pullSpin";box.innerHTML='<div class="ring"><div class="dot"></div></div>';document.body.appendChild(box);
  function fullReload(){
    box.classList.add("go");box.style.transform="translateX(-50%) scale(1)";
    try{var u=new URL(location.href);u.searchParams.set("_r",String(Date.now()));location.replace(u.toString());}
    catch(e){location.reload();}
  }
  window.refreshLive=fullReload;
  var y0=0,pulling=false,armed=false;
  function start(y){y0=y;pulling=true;armed=false;box.classList.remove("go");}
  function move(y,e){
    if(!pulling)return;
    var dy=y-y0;
    if(dy<10){box.style.transform="translateX(-50%) scale(0)";return;}
    if(e&&e.cancelable)e.preventDefault();
    var p=Math.min(1,dy/90);
    box.style.transform="translateX(-50%) scale("+p+")";
    armed=dy>64;
  }
  function end(){
    if(!pulling)return;pulling=false;
    if(armed)fullReload();else box.style.transform="translateX(-50%) scale(0)";
  }
  document.addEventListener("touchstart",function(e){start(e.touches[0].clientY);},{passive:true,capture:true});
  document.addEventListener("touchmove",function(e){move(e.touches[0].clientY,e);},{passive:false,capture:true});
  document.addEventListener("touchend",end,{passive:true,capture:true});
})();

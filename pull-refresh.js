(function(){
  if(window._pullV3)return;window._pullV3=1;
  var s=document.createElement("style");
  s.textContent="#pullSpin{position:fixed;top:18px;left:50%;z-index:95;transform:translateX(-50%) scale(0);pointer-events:none;transition:transform .12s linear}#pullSpin .ring{width:46px;height:46px;border-radius:50%;background:#6B1212;border:3px solid #E8C56B;display:flex;align-items:center;justify-content:center;color:#F7E7C3;font-size:11px;font-weight:800}#pullSpin .dot{width:18px;height:18px;border-radius:50%;border:3px solid #F7E7C3;border-top-color:#E8C56B}#pullSpin.go .dot{animation:spinPull .7s linear infinite}@keyframes spinPull{to{transform:rotate(360deg)}}";
  document.head.appendChild(s);
  var box=document.createElement("div");box.id="pullSpin";box.innerHTML='<div class="ring"><div class="dot"></div></div>';document.body.appendChild(box);
  function fullReload(){
    box.classList.add("go");box.style.transform="translateX(-50%) scale(1)";
    try{var u=new URL(location.href);u.searchParams.set("_r",String(Date.now()));location.replace(u.toString());}
    catch(e){location.reload();}
  }
  window.refreshLive=fullReload;
  var y0=0,x0=0,pulling=false,armed=false;
  var NEED=128;
  function atTop(){
    var n=0,wrap=document.querySelector(".wrap"),page=document.querySelector(".page.on");
    if(wrap)n=Math.max(n,wrap.scrollTop||0);
    if(page)n=Math.max(n,page.scrollTop||0);
    n=Math.max(n,window.scrollY||0);
    return n<=2;
  }
  function hide(){box.classList.remove("go");box.style.transform="translateX(-50%) scale(0)";}
  function start(e){
    if(!e.touches||e.touches.length!==1){pulling=false;return;}
    var t=e.target;
    if(t&&t.closest&&t.closest("input,textarea,select,.chatbar")){pulling=false;return;}
    if(!atTop()){pulling=false;return;}
    y0=e.touches[0].clientY;x0=e.touches[0].clientX;pulling=true;armed=false;hide();
  }
  function move(e){
    if(!pulling||!e.touches||!e.touches[0])return;
    var y=e.touches[0].clientY,x=e.touches[0].clientX;
    var dy=y-y0,dx=x-x0;
    if(Math.abs(dx)>28&&Math.abs(dx)>Math.abs(dy)){pulling=false;hide();return;}
    if(dy<36){hide();armed=false;return;}
    if(!atTop()){pulling=false;hide();return;}
    if(e.cancelable)e.preventDefault();
    var p=Math.min(1,(dy-36)/(NEED-36));
    box.style.transform="translateX(-50%) scale("+Math.max(.25,p)+")";
    armed=dy>=NEED;
  }
  function end(){
    if(!pulling){hide();return;}
    pulling=false;
    if(armed&&atTop())fullReload();else hide();
  }
  document.addEventListener("touchstart",start,{passive:true,capture:true});
  document.addEventListener("touchmove",move,{passive:false,capture:true});
  document.addEventListener("touchend",end,{passive:true,capture:true});
  document.addEventListener("touchcancel",end,{passive:true,capture:true});
})();

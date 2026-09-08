(function(){
  if(window._pullFull)return;window._pullFull=1;
  var s=document.createElement("style");
  s.textContent=
    "#pullSpin{position:fixed;top:10px;left:50%;transform:translateX(-50%) scale(0);transform-origin:center top;z-index:90;pointer-events:none;transition:transform .15s}"+
    "#pullSpin .ring{width:42px;height:42px;border-radius:50%;background:#6B1212;border:3px solid #E8C56B;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.25)}"+
    "#pullSpin .dot{width:18px;height:18px;border-radius:50%;border:3px solid #F7E7C3;border-top-color:#E8C56B;animation:none}"+
    "#pullSpin.go .dot{animation:spinPull .7s linear infinite}"+
    "#pullSpin.go{transform:translateX(-50%) scale(1)!important}"+
    "@keyframes spinPull{to{transform:rotate(360deg)}}";
  document.head.appendChild(s);
  var box=document.createElement("div");
  box.id="pullSpin";
  box.innerHTML='<div class="ring"><div class="dot"></div></div>';
  document.body.appendChild(box);
  function scroller(){return document.querySelector(".wrap")||document.scrollingElement||document.body;}
  function atTop(){
    var w=scroller();
    return (w.scrollTop||0)<=2 && (document.scrollingElement.scrollTop||0)<=2;
  }
  function fullReload(){
    box.classList.add("go");
    box.style.transform="translateX(-50%) scale(1)";
    try{
      var u=new URL(location.href);
      u.searchParams.set("_r",String(Date.now()));
      location.replace(u.toString());
    }catch(e){
      location.reload();
    }
  }
  window.refreshLive=fullReload;
  var y0=0,pulling=false,armed=false;
  var wrap=scroller();
  wrap.addEventListener("touchstart",function(e){
    if(!atTop()){pulling=false;return;}
    y0=e.touches[0].clientY;pulling=true;armed=false;
    box.classList.remove("go");
  },{passive:true});
  wrap.addEventListener("touchmove",function(e){
    if(!pulling)return;
    var dy=e.touches[0].clientY-y0;
    if(dy<8){box.style.transform="translateX(-50%) scale(0)";return;}
    var p=Math.min(1,dy/90);
    box.style.transform="translateX(-50%) scale("+p+")";
    box.querySelector(".dot").style.transform="rotate("+Math.round(p*360)+"deg)";
    armed=dy>72;
  },{passive:true});
  wrap.addEventListener("touchend",function(){
    if(!pulling)return;pulling=false;
    if(armed)fullReload();
    else box.style.transform="translateX(-50%) scale(0)";
  },{passive:true});
})();

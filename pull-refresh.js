(function(){
  var s=document.createElement("style");
  s.textContent="#pullBar{position:fixed;top:8px;left:50%;transform:translateX(-50%);background:#6B1212;color:#F7E7C3;border-radius:99px;padding:6px 14px;font-size:12px;z-index:70;display:none}";
  document.head.appendChild(s);
  var bar=document.createElement("div");bar.id="pullBar";bar.textContent="ताज़ा हो रहा है...";document.body.appendChild(bar);
})();
function showPull(t){var b=document.getElementById("pullBar");if(!b)return;b.textContent=t||"ताज़ा";b.style.display="block";clearTimeout(window._pt);window._pt=setTimeout(function(){b.style.display="none";},1600);}
window.refreshLive=function(){
  showPull("अपडेट आ रहा है...");
  if(typeof refreshOpen==="function")refreshOpen();
  if(typeof renderHome==="function")renderHome();
  if(typeof renderVoice==="function"&&document.querySelector("#p-voice.on"))renderVoice();
  if(typeof renderNews==="function"&&document.querySelector("#p-news.on"))renderNews();
  if(typeof renderGal==="function"&&document.querySelector("#p-gallery.on"))renderGal();
  if(typeof renderDon==="function"&&document.querySelector("#p-donate.on"))renderDon();
  showPull("अपडेट हो गया");
};
document.addEventListener("visibilitychange",function(){
  if(!document.hidden)setTimeout(refreshLive,300);
});
window.addEventListener("focus",function(){setTimeout(refreshLive,300);});
(function(){
  var y0=0,pulling=false;
  var wrap=document.querySelector(".wrap")||document.body;
  wrap.addEventListener("touchstart",function(e){
    if(wrap.scrollTop<=0||document.scrollingElement.scrollTop<=0){y0=e.touches[0].clientY;pulling=true;}
  },{passive:true});
  wrap.addEventListener("touchend",function(e){
    if(!pulling)return;pulling=false;
    var y=e.changedTouches[0].clientY;
    if(y-y0>70)refreshLive();
  },{passive:true});
})();

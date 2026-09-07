(function(){
  var s=document.createElement("style");
  s.textContent=".ytclean{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;background:#000;border-radius:12px}.ytclean iframe{position:absolute;inset:-60px 0 -70px 0;width:100%;height:calc(100% + 130px);border:0}.ytmask{position:absolute;left:0;right:0;background:#000;z-index:2;pointer-events:none}.ytmask.top{top:0;height:48px}.ytmask.bot{bottom:0;height:8px}";
  document.head.appendChild(s);
})();
window.renderLive=function(){
  var box=document.getElementById("liveBox");if(!box)return;
  var id=(typeof ytId==="function")?ytId(db.settings.liveUrl):"";
  if(!id){box.innerHTML='<p class="meta">एडमिन लाइव लिंक डाले।</p>';return;}
  var src="https://www.youtube-nocookie.com/embed/"+id+"?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1&cc_load_policy=0&showinfo=0&aopus=1";
  box.innerHTML='<div class="ytclean"><iframe src="'+src+'" allow="autoplay;encrypted-media" allowfullscreen title="Live"></iframe><div class="ytmask top"></div><div class="ytmask bot"></div></div>';
};
if(document.querySelector("#p-live.on"))renderLive();

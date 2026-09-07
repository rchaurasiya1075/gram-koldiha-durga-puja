(function(){
  var s=document.createElement("style");
  s.textContent=".ytclean{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;background:#111;border-radius:14px}.ytclean iframe{position:absolute;top:50%;left:50%;width:175%;height:175%;transform:translate(-50%,-50%);border:0}.ytclean .cover{position:absolute;inset:0;z-index:3;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.25)}.ytclean .cover b{background:#6B1212;color:#fff;border-radius:999px;padding:10px 18px}";
  document.head.appendChild(s);
})();
window.renderLive=function(){
  var box=document.getElementById("liveBox");if(!box)return;
  var id=(typeof ytId==="function")?ytId((db.settings&&db.settings.liveUrl)||""):"";
  if(!id){box.innerHTML='<p class="meta">एडमिन लाइव लिंक डाले।</p>';return;}
  var src="https://www.youtube-nocookie.com/embed/"+id+"?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1&cc_load_policy=0&showinfo=0&loop=0";
  box.innerHTML='<div class="ytclean"><iframe id="ytv" src="'+src+'" allow="autoplay;encrypted-media" title="Live"></iframe><div class="cover" id="ytCover" onclick="this.style.display=\'none\'"><b>▶ देखो</b></div></div>';
};
const _goL=window.go;
window.go=function(name){if(typeof _goL==="function")_goL(name);if(name==="live")setTimeout(renderLive,30);};
if(document.querySelector("#p-live.on"))renderLive();

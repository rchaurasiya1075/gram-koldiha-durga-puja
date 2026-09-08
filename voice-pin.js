(function(){
  var s=document.createElement("style");
  s.textContent=".tile.hot{grid-column:1/-1;background:#6B1212;color:#F7E7C3;border:0;min-height:58px;font-size:16px}.tile.hot span{font-size:22px}";
  document.head.appendChild(s);
})();
function voiceHomeBtn(){
  var grid=document.querySelector(".home-grid");if(!grid)return;
  var b=document.getElementById("tileVoice");
  if(!b){b=document.createElement("button");b.className="tile hot";b.id="tileVoice";b.onclick=function(){if(typeof joinVoice==="function")joinVoice();else go("voice");};}
  b.className="tile hot";
  b.innerHTML="<span>🎙️</span> लाइव आवाज़ — जुड़ें";
  if(grid.firstChild!==b)grid.insertBefore(b,grid.firstChild);
}

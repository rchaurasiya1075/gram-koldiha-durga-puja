(function(){
  var s=document.createElement("style");
  s.textContent="#p-voice.on{background:#111827;color:#fff;padding:0!important}#p-voice .vui{display:flex;flex-direction:column;min-height:100%;background:#111827}.vui-top{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:#1f2937}.vui-live{background:rgba(34,197,94,.2);color:#4ade80;border-radius:8px;padding:4px 8px;font-size:11px;font-weight:800}.vui-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px;flex:1;align-content:start}.vtile{position:relative;background:#1f2937;border-radius:16px;min-height:120px;display:flex;align-items:center;justify-content:center;border:1px solid #374151}.vtile.me{border:2px solid #22c55e}.vav{width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:#fff}.vlab{position:absolute;left:8px;bottom:8px;background:rgba(0,0,0,.55);border-radius:8px;padding:4px 8px;font-size:11px}.vui-bar{display:flex;justify-content:center;gap:12px;padding:12px;background:#1f2937}.vui-bar button{width:48px;height:48px;border:0;border-radius:99px;background:#374151;color:#fff;font-size:18px}.vui-bar .end{background:#dc2626;width:auto;padding:0 16px;font-size:13px;font-weight:800}";
  document.head.appendChild(s);
})();
var VCOL=["#4f46e5","#db2777","#d97706","#0d9488","#6B1212","#7c3aed"];
function vIni(n){n=String(n||"?");var p=n.trim().split(/\s+/);return ((p[0]||"?").charAt(0)+(p[1]?p[1].charAt(0):"")).toUpperCase();}
window.renderVoice=function(){
  if(typeof ensureVoicePage==="function")ensureVoicePage();
  var page=document.getElementById("p-voice");if(!page)return;
  var list=[];
  Object.keys(window._voicePeers||{}).forEach(function(id){var x=window._voicePeers[id]||{};list.push({id:id,name:x.name||id});});
  if(window._voiceOn&&!list.some(function(p){return p.id===voiceId();}))list.unshift({id:voiceId(),name:voiceName()+" (आप)"});
  if(!list.length)list.push({id:"empty",name:"अभी कोई नहीं"});
  var tiles=list.map(function(p,i){
    var me=p.id===voiceId();
    return '<div class="vtile '+(me?"me":"")+'"><div class="vav" style="background:'+VCOL[i%VCOL.length]+'">'+vIni(p.name)+'</div><div class="vlab">'+(me&&window._voiceMuted?"🔇 ":"🎤 ")+p.name+'</div></div>';
  }).join("");
  page.innerHTML='<div class="vui"><div class="vui-top"><div><div class="vui-live">● LIVE</div><div style="font-size:13px;font-weight:800;margin-top:4px">कोल्डीहा आवाज़</div><div style="font-size:11px;color:#9ca3af">'+list.length+' जुड़े</div></div></div><div class="vui-grid">'+tiles+'</div><div class="vui-bar">'+
    (window._voiceOn?'<button onclick="muteVoice()">'+(window._voiceMuted?"🔇":"🎤")+'</button><button class="end" onclick="leaveVoice()">कॉल काटो</button>':'<button class="end" style="background:#16a34a" onclick="joinVoice()">जुड़ें</button>')+
    '</div></div>';
};

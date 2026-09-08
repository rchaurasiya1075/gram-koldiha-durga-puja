function isInstalled(){
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone===true || localStorage.getItem("koldiha_added")==="1";
}
function snoozed(){
  return Date.now()<Number(localStorage.getItem("koldiha_snooze")||0);
}
window._pwaEvt=null;
window.addEventListener("beforeinstallprompt",function(e){
  e.preventDefault();
  window._pwaEvt=e;
  setTimeout(maybeBanner,4000);
});
window.addEventListener("appinstalled",function(){
  localStorage.setItem("koldiha_added","1");
  hideBanner();
});
function hideBanner(){var b=document.getElementById("instBan");if(b)b.remove();}
window.snoozeInstall=function(){
  localStorage.setItem("koldiha_snooze",String(Date.now()+12*60*60*1000));
  hideBanner();
};
window.markAdded=function(){localStorage.setItem("koldiha_added","1");hideBanner();};
window.doInstall=async function(){
  if(window._pwaEvt){
    window._pwaEvt.prompt();
    var r=await window._pwaEvt.userChoice;
    if(r&&r.outcome==="accepted")localStorage.setItem("koldiha_added","1");
    window._pwaEvt=null;hideBanner();return;
  }
  toast("मेनू ⋮ → होम स्क्रीन पर जोड़ें");
};
function maybeBanner(){
  if(isInstalled()||snoozed()||document.getElementById("instBan"))return;
  var d=document.createElement("div");d.id="instBan";
  d.style.cssText="position:fixed;left:8px;right:8px;bottom:72px;z-index:80;background:#3a1010;color:#F7E7C3;border-radius:14px;padding:10px 12px;display:flex;gap:8px;align-items:center;box-shadow:0 8px 24px rgba(0,0,0,.25)";
  d.innerHTML='<div style="flex:1;font-size:13px;font-weight:700">📲 होम स्क्रीन पर जोड़ें</div>'+
    '<button class="btn" style="width:auto;margin:0;padding:8px 10px" onclick="doInstall()">जोड़ें</button>'+
    '<button class="btn ghost" style="width:auto;margin:0;padding:8px 10px" onclick="snoozeInstall()">बाद में</button>';
  document.body.appendChild(d);
}
setTimeout(maybeBanner,5000);

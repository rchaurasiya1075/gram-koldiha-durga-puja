function isInstalled(){
  return window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true||localStorage.getItem("koldiha_added")==="1";
}
window._pwaEvt=null;
window.addEventListener("beforeinstallprompt",function(e){
  e.preventDefault();window._pwaEvt=e;showInstall(true);
});
window.addEventListener("appinstalled",function(){localStorage.setItem("koldiha_added","1");hideInstall();});
function hideInstall(){var b=document.getElementById("instBan");if(b)b.remove();}
window.snoozeInstall=function(){localStorage.setItem("koldiha_snooze",String(Date.now()+6*60*60*1000));hideInstall();};
window.doInstall=async function(){
  if(window._pwaEvt){
    try{window._pwaEvt.prompt();var r=await window._pwaEvt.userChoice;if(r&&r.outcome==="accepted")localStorage.setItem("koldiha_added","1");}catch(e){}
    window._pwaEvt=null;hideInstall();return;
  }
  var ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  alert(ios?"Share \u2191 \u2192 Add to Home Screen":"Chrome \u092e\u0947\u0928\u0942 \u22ee \u2192 \u0939\u094b\u092e \u0938\u094d\u0915\u094d\u0930\u0940\u0928 \u092a\u0930 \u091c\u094b\u0921\u093c\u0947\u0902");
};
function showInstall(){
  if(isInstalled()||document.getElementById("instBan"))return;
  if(Date.now()<Number(localStorage.getItem("koldiha_snooze")||0))return;
  var d=document.createElement("div");d.id="instBan";
  d.style.cssText="position:fixed;left:8px;right:8px;bottom:76px;z-index:88;background:#3a1010;color:#F7E7C3;border-radius:14px;padding:12px;display:flex;gap:8px;align-items:center";
  d.innerHTML='<div style="flex:1;font-size:13px;font-weight:800">\ud83d\udcf1 \u0939\u094b\u092e \u0938\u094d\u0915\u094d\u0930\u0940\u0928 \u092a\u0930 \u0907\u0902\u0938\u094d\u091f\u0949\u0932 \u0915\u0930\u094b</div><button class="btn" style="width:auto;margin:0;padding:8px 12px" onclick="doInstall()">\u0907\u0902\u0938\u094d\u091f\u0949\u0932</button><button class="btn ghost" style="width:auto;margin:0;padding:8px 10px" onclick="snoozeInstall()">\u092c\u093e\u0926</button>';
  document.body.appendChild(d);
}
window.maybeBanner=showInstall;
setTimeout(showInstall,800);
setTimeout(showInstall,4000);

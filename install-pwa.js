function isInstalled(){
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true || localStorage.getItem("koldiha_added")==="1";
}
window._pwaEvt=null;
window.addEventListener("beforeinstallprompt",function(e){
  e.preventDefault();window._pwaEvt=e;if(!isInstalled())showInstallPop();
});
window.addEventListener("appinstalled",function(){localStorage.setItem("koldiha_added","1");hideInstallPop();});
function hideInstallPop(){var p=document.getElementById("instPop");if(p)p.remove();}
window.markAdded=function(){localStorage.setItem("koldiha_added","1");hideInstallPop();toast("धन्यवाद");};
window.doInstall=async function(){
  if(window._pwaEvt){
    window._pwaEvt.prompt();
    var r=await window._pwaEvt.userChoice;
    if(r&&r.outcome==="accepted"){localStorage.setItem("koldiha_added","1");hideInstallPop();}
    window._pwaEvt=null;return;
  }
  toast("मेनू ⋮ दबाओ → होम स्क्रीन पर जोड़ें");
};
function showInstallPop(){
  if(isInstalled()||document.getElementById("instPop"))return;
  var d=document.createElement("div");d.id="instPop";
  d.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:90;display:flex;align-items:flex-end;justify-content:center";
  d.innerHTML='<div style="background:#fff7ea;width:100%;max-width:430px;border-radius:18px 18px 0 0;padding:18px 16px 24px;text-align:center">'+
    '<div style="font-size:28px">📲</div><h3 style="margin:8px 0;color:#6B1212">ऐप होम स्क्रीन पर जोड़ें</h3>'+
    '<p class="meta">हर बार लिंक खोलने की ज़रूरत नहीं पड़ेगी</p>'+
    '<button class="btn" onclick="doInstall()">इंस्टॉल / होम पर जोड़ें</button>'+
    '<button class="btn ghost" onclick="markAdded()">मैंने जोड़ लिया</button></div>';
  document.body.appendChild(d);
}
setTimeout(function(){if(!isInstalled())showInstallPop();},1200);

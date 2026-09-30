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
  if(typeof window.showMust==="function")window.showMust();
}
window.maybeBanner=showInstall;
setTimeout(showInstall,800);
setTimeout(showInstall,4000);

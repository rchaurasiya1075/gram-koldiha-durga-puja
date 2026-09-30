window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyCYxGLxDk5sTe0ZEYmxtiAl5c9touUturU",
  authDomain: "koldihadurgapooja.firebaseapp.com",
  projectId: "koldihadurgapooja",
  storageBucket: "koldihadurgapooja.firebasestorage.app",
  messagingSenderId: "76552733422",
  appId: "1:76552733422:web:b1a1e6ab48dba4d4d6e9ff",
  databaseURL: "https://koldihadurgapooja-default-rtdb.firebaseio.com"
};
window.FIREBASE_READY = function () {
  const c = window.FIREBASE_CONFIG || {};
  return !!(c.apiKey && c.projectId === "koldihadurgapooja");
};
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js?v=86").catch(function () {});
}
["kill-jitsi.js?v=86","addr-ui.js?v=86","live-sync.js?v=86","install-pwa.js?v=93","team-note.js?v=86","pull-refresh.js?v=86","gaon-plus.js?v=86","rtdb-init.js?v=86","koldiha-ui-fix.js?v=86","live-stream.js?v=86","donate-receipt.js?v=86"].forEach(function(src){
  var s=document.createElement("script");s.src="./"+src;document.head.appendChild(s);
});

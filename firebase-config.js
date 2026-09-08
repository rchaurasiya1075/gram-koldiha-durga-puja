window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyCYxGLxDk5sTe0ZEYmxtiAl5c9touUturU",
  authDomain: "koldihadurgapooja.firebaseapp.com",
  projectId: "koldihadurgapooja",
  storageBucket: "koldihadurgapooja.firebasestorage.app",
  messagingSenderId: "76552733422",
  appId: "1:76552733422:web:b1a1e6ab48dba4d4d6e9ff"
};
window.FIREBASE_READY = function () {
  const c = window.FIREBASE_CONFIG || {};
  return !!(c.apiKey && c.projectId === "koldihadurgapooja");
};
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js?v=12").catch(function () {});
}
["kill-jitsi.js?v=44","addr-ui.js?v=40","live-sync.js?v=38","voice.js?v=44","turn.js?v=49","voice-ui.js?v=45","voice-pin.js?v=46","install-pwa.js?v=47","call-bar.js?v=48"].forEach(function(src){
  var s=document.createElement("script");s.src="./"+src;document.head.appendChild(s);
});

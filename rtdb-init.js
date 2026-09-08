(function(){
  function boot(){
    if(!(window.firebase&&window.FIREBASE_CONFIG))return setTimeout(boot,300);
    try{
      if(!firebase.apps.length)firebase.initializeApp(window.FIREBASE_CONFIG);
      if(!firebase.database)return;
      window.rtdb=firebase.database();
      window.rtdb.ref(".info/connected").on("value",function(s){
        window._rtdbOn=!!s.val();
        var sm=document.getElementById("syncMark");
        if(sm&&window._rtdbOn)sm.textContent="क्लाउड";
      });
    }catch(e){window._rtdbOn=false;}
  }
  boot();
})();

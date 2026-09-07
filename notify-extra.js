window._seenAlert=Number(localStorage.getItem("koldiha_seenAlert")||0);
function bindAlerts(){
  if(!window.fs||window._alertLive)return;window._alertLive=true;
  try{
    fs.collection("alerts").orderBy("t","desc").limit(5).onSnapshot(function(qs){
      qs.forEach(function(d){
        var a=d.data();if(!a||!a.t)return;
        if(a.t<=window._seenAlert)return;
        window._seenAlert=Math.max(window._seenAlert,a.t);
        localStorage.setItem("koldiha_seenAlert",String(window._seenAlert));
        var title=a.title||"कोल्डीहा KD";
        var body=a.body||"नया अपडेट";
        var url=a.kind==="don"?"#/donate":(a.kind==="news"?"#/news":"#/home");
        if(typeof showPush==="function")showPush(title,body,url);
      });
    });
  }catch(e){
    fs.collection("alerts").onSnapshot(function(qs){
      var max=0,last=null;qs.forEach(function(d){var a=d.data();if((a.t||0)>max){max=a.t;last=a;}});
      if(last&&max>window._seenAlert){
        if(window._seenAlert&&typeof showPush==="function")showPush(last.title||"कोल्डीहा",last.body||"अपडेट","#/home");
        window._seenAlert=max;localStorage.setItem("koldiha_seenAlert",String(max));
      }
    });
  }
}
setTimeout(bindAlerts,1800);

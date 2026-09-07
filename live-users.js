window._liveWatch={};
function markLivePage(on){
  if(!user||!window.fs)return;
  try{
    fs.collection("presence").doc(user.phone).set({
      phone:user.phone,name:user.name||"श्रद्धालु",live:!!on,page:on?"live":"app",t:Date.now()
    },{merge:true});
  }catch(e){}
}
function liveWatchList(){
  var now=Date.now(),out=[];
  Object.keys(window._liveWatch||{}).forEach(function(ph){
    var u=window._liveWatch[ph];
    if(u&&u.live&&now-(u.t||0)<80000)out.push(u);
  });
  out.sort(function(a,b){return String(a.name||"").localeCompare(String(b.name||""),"hi");});
  return out;
}
function paintLiveUsers(){
  var box=document.getElementById("liveBox");if(!box)return;
  var el=document.getElementById("liveWho");
  if(!el){
    el=document.createElement("div");el.id="liveWho";el.className="card";
    box.appendChild(el);
  }
  var list=liveWatchList();
  if(!list.length){el.innerHTML='<h3>🔴 अभी लाइव</h3><p class="meta">अभी कोई अकाउंट लाइव नहीं है</p>';return;}
  el.innerHTML='<h3>🔴 अभी लाइव · '+list.length+'</h3>'+list.map(function(u){
    return '<div class="row" style="padding:6px 0;border-bottom:1px dashed #ead3bc"><b>'+(u.name||"श्रद्धालु")+'</b><span class="badge">लाइव</span></div>';
  }).join("");
}
function bindLiveWho(){
  if(!window.fs||window._liveWho)return;window._liveWho=true;
  try{
    fs.collection("presence").onSnapshot(function(qs){
      window._liveWatch={};
      qs.forEach(function(d){window._liveWatch[d.id]=d.data();});
      if(document.querySelector("#p-live.on"))paintLiveUsers();
    });
  }catch(e){}
}
setInterval(function(){
  if(document.querySelector("#p-live.on"))markLivePage(true);
},20000);
if(!window._liveWhoGo){
  window._liveWhoGo=true;
  var g=window.go;
  window.go=function(name){
    if(typeof g==="function")g(name);
    if(name==="live"){markLivePage(true);setTimeout(paintLiveUsers,80);}
    else markLivePage(false);
  };
}
setTimeout(bindLiveWho,800);

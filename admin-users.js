function waText(m,withPin){
  var t="कोल्डीहा यूज़र%0Aनाम: "+(m.name||"")+"%0Aमोबाइल: "+(m.phone||"");
  if(withPin)t+="%0APIN: "+(m.pin||"");
  t+="%0Aपद: "+(m.role||"user");
  return t;
}
function openWATo(num,text){
  var n=String(num||"").replace(/\D/g,"").slice(-10);
  var url="https://wa.me/91"+n+"?text="+encodeURIComponent(text);
  try{window.open(url,"_blank");}catch(e){location.href=url;}
}
window.waUser=function(ph){
  if(!(user&&(user.phone==="9473746020"||user.role==="admin")))return toast("सिर्फ़ एडमिन");
  var m=(db.members&&db.members[ph])||{phone:ph};
  openWATo("9473746020",decodeURIComponent(waText(m,true).replace(/%0A/g,"\n").replace(/%20/g," ")));
};
window.replyPinSame=function(ph){
  if(!(user&&(user.phone==="9473746020"||user.role==="admin")))return;
  var m=(db.members&&db.members[ph])||null;
  if(!m||!m.pin)return toast("पिन नहीं मिला");
  if(String(m.phone)!==String(ph))return toast("नंबर मेल नहीं खाता — पिन नहीं भेजें");
  openWATo(ph,"कोल्डीहा पूजा\n"+(m.name||"")+" जी\nआपका लॉगिन पिन: "+m.pin+"\nइसे सेव कर लें।");
  toast("उसी नंबर पर पिन जा रहा है");
};
window.searchUsers=function(){
  var q=((document.getElementById("userQ")||{}).value||"").trim().toLowerCase();
  renderUserDir(q);
};
function renderUserDir(q){
  var el=document.getElementById("userDir");if(!el)return;
  q=String(q||"").toLowerCase();
  var list=Object.values(db.members||{}).sort(function(a,b){return String(a.name||"").localeCompare(String(b.name||""),"hi");});
  if(q)list=list.filter(function(m){return String(m.name||"").toLowerCase().indexOf(q)>=0||String(m.phone||"").indexOf(q)>=0;});
  if(!list.length){el.innerHTML='<p class="meta">कोई नहीं मिला</p>';return;}
  el.innerHTML=list.map(function(m){
    return '<div class="card"><b>'+(m.name||"")+'</b><div class="meta">📱 '+m.phone+' · PIN <b>'+(m.pin||"")+'</b> · '+(m.role||"user")+'</div>'+
      '<button class="btn" onclick="replyPinSame(\''+m.phone+'\')">इसी नंबर पर पिन भेजो</button></div>';
  }).join("");
}
function renderPinReq(){
  var el=document.getElementById("pinReq");if(!el)return;
  var list=(window._pinReq||[]).slice().sort(function(a,b){return (b.t||0)-(a.t||0);}).slice(0,20);
  if(!list.length){el.innerHTML='<p class="meta">अभी कोई अनुरोध नहीं</p>';return;}
  el.innerHTML=list.map(function(r){
    return '<div class="card"><b>'+(r.name||"")+'</b> ने पिन माँगा<div class="meta">'+r.phone+' · पिन <b>'+(r.pin||"")+'</b></div><p class="meta">व्हाटसएप इसी नंबर से आया हो तभी पिन भेजें</p><button class="btn" onclick="replyPinSame(\''+r.phone+'\')">उसी नंबर पर पिन भेजो</button></div>';
  }).join("");
}
function ensureUserDir(){
  var tools=document.getElementById("adminTools");if(!tools)return;
  if(!(user&&(user.phone==="9473746020"||user.role==="admin")))return;
  if(!document.getElementById("pinReqBox")){
    var pr=document.createElement("div");pr.className="card";pr.id="pinReqBox";
    pr.innerHTML='<h3>पिन भूल अनुरोध</h3><p class="meta">पिन सिर्फ़ आपको दिखेगा — उसी रजिस्टर नंबर पर भेजें</p><div id="pinReq"></div>';
    tools.insertBefore(pr,tools.firstChild);
  }
  if(!document.getElementById("userDirBox")){
    var box=document.createElement("div");box.className="card";box.id="userDirBox";
    box.innerHTML='<h3>सभी यूज़र</h3><input id="userQ" placeholder="नाम या मोबाइल" oninput="searchUsers()"/><div id="userDir"></div>';
    var prb=document.getElementById("pinReqBox");
    if(prb&&prb.nextSibling)tools.insertBefore(box,prb.nextSibling);else tools.insertBefore(box,tools.firstChild);
  }
  renderUserDir((document.getElementById("userQ")||{}).value||"");
  renderPinReq();
}
const _raU=window.renderAdmin;
window.renderAdmin=function(){if(typeof _raU==="function")try{_raU();}catch(e){}ensureUserDir();};
setTimeout(function(){
  if(window.fs&&!window._pinLive){
    window._pinLive=true;
    try{fs.collection("pinRequests").onSnapshot(function(qs){window._pinReq=qs.docs.map(function(d){var x=d.data();x.id=d.id;return x;});renderPinReq();});}catch(e){}
  }
  if(document.getElementById("adminTools"))ensureUserDir();
},900);

function festName(){return (db.settings&&db.settings.festName)||"दुर्गा पूजा महोत्सव";}
function festSub(){return (db.settings&&db.settings.festSub)||"DURGA PUJA MAHOTSAV";}
function festSlogan(){return (db.settings&&db.settings.festSlogan)||"जय माँ दुर्गा — माँ का आशीर्वाद, गाँव का उत्सव";}
function festStart(){
  var s=(db.settings&&db.settings.festStart)||"2026-10-16T08:00";
  var d=new Date(s);
  return isNaN(d.getTime())?new Date("2026-10-16T08:00:00+05:30"):d;
}
function applyFest(){
  var t=document.querySelector(".vfest");if(t)t.textContent=festSub();
  var sl=document.querySelector(".vslogan");if(sl)sl.textContent=festSlogan();
  var brand=document.querySelector(".appbar .brand");if(brand&&!(user&&typeof hasPanel==="function"&&hasPanel()))brand.textContent="कोल्डीहा";
  document.title="कोल्डीहा · "+festName();
}
function tickFest(){
  var start=festStart(),d=start-Date.now();
  function el(id,v){var n=document.getElementById(id);if(n)n.textContent=v;}
  if(d<=0){el("cdD","0");el("cdH","0");el("cdM","0");}
  else{el("cdD",Math.floor(d/86400000));el("cdH",Math.floor((d%86400000)/3600000));el("cdM",Math.floor((d%3600000)/60000));}
}
function festAdminBox(){
  var tools=document.getElementById("adminTools");if(!tools||document.getElementById("festBox"))return;
  if(!(user&&(user.phone==="9473746020"||user.role==="admin")))return;
  var box=document.createElement("div");box.className="card";box.id="festBox";
  box.innerHTML='<h3>अगला त्योहार</h3><p class="meta">दुर्गा पूजा खत्म हो तो नाम/तारीख यहाँ बदलो</p>'+
    '<label class="lab">त्योहार का नाम</label><input id="festName" placeholder="जैसे दुर्गा पूजा महोत्सव"/>'+
    '<label class="lab">अंग्रेजी नाम</label><input id="festSub" placeholder="CHATTH PUJA"/>'+
    '<label class="lab">स्लोगन</label><input id="festSlogan"/>'+
    '<label class="lab">शुरू तारीख और समय</label><input id="festStart" type="datetime-local"/>'+
    '<button class="btn" onclick="saveFest()">त्योहार सेव — सभको दिखेगा</button>';
  tools.insertBefore(box,tools.firstChild);
  var s=db.settings||{};
  var n=document.getElementById("festName");if(n)n.value=s.festName||"दुर्गा पूजा महोत्सव";
  var u=document.getElementById("festSub");if(u)u.value=s.festSub||"DURGA PUJA MAHOTSAV";
  var g=document.getElementById("festSlogan");if(g)g.value=s.festSlogan||"";
  var d=document.getElementById("festStart");if(d)d.value=(s.festStart||"2026-10-16T08:00").slice(0,16);
}
window.saveFest=async function(){
  if(!(user&&(user.phone==="9473746020"||user.role==="admin")))return toast("सिर्फ़ एडमिन");
  var patch={festName:(document.getElementById("festName")||{}).value.trim(),festSub:(document.getElementById("festSub")||{}).value.trim(),festSlogan:(document.getElementById("festSlogan")||{}).value.trim(),festStart:(document.getElementById("festStart")||{}).value};
  if(!patch.festName)return toast("नाम लिखें");
  if(typeof saveSetting==="function")await saveSetting(patch);
  if(window.fs){try{await fs.collection("alerts").add({title:"नया त्योहार",body:patch.festName+" शुरू",t:Date.now(),kind:"fest"});}catch(e){}}
  applyFest();tickFest();toast("त्योहार अपडेट — सभको दिखेगा");
};
const _raF=window.renderAdmin;
window.renderAdmin=function(){if(typeof _raF==="function")try{_raF();}catch(e){}festAdminBox();};
const _rhF=window.renderHome;
window.renderHome=function(){if(typeof _rhF==="function")try{_rhF();}catch(e){}applyFest();tickFest();};
const _saF=window.saveAnnounce;
window.saveAnnounce=async function(){
  if(typeof _saF==="function")await _saF();
  var title=((document.getElementById("anTitle")||{}).value||"सूचना").trim();
  var message=((document.getElementById("anMsg")||{}).value||"").trim();
  if(window.fs&&title){try{await fs.collection("alerts").add({title:title,body:message,t:Date.now(),kind:"news"});}catch(e){}}
};
const _apF=window.approveDon;
window.approveDon=async function(id){
  if(typeof _apF==="function")await _apF(id);
  var d=(db.donations||[]).find(function(x){return String(x.did||x.created)===String(id);});
  if(window.fs&&d){try{await fs.collection("alerts").add({title:"नई सेवा",body:(d.visible===false?"एक श्रद्धालु ने सेवा दी":(d.name+" ने सेवा दी — ₹"+d.amt)),t:Date.now(),kind:"don"});}catch(e){}}
};
setInterval(tickFest,30000);
applyFest();tickFest();

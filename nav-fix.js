(function(){
  document.documentElement.style.overflow="hidden";
  document.body.style.overflow="hidden";
  var nav=document.querySelector(".nav");
  if(nav){nav.style.position="relative";nav.style.flexShrink="0";nav.style.zIndex="40";}
  var phone=document.querySelector(".phone");
  if(phone){phone.style.height="100dvh";phone.style.overflow="hidden";phone.style.display="flex";phone.style.flexDirection="column";}
  var wrap=document.querySelector(".wrap");
  if(wrap){wrap.style.flex="1";wrap.style.minHeight="0";wrap.style.overflow="auto";}
})();
var _page="home";
var _histLock=false;
function showPage(name,push){
  if(!name)name="home";
  _page=name;
  document.querySelectorAll(".page").forEach(function(p){p.classList.toggle("on",p.id==="p-"+name);});
  document.querySelectorAll(".nav button").forEach(function(b){b.classList.toggle("on",b.dataset.p===name);});
  if(name==="home")renderHome();
  if(name==="events")renderEvents();
  if(name==="live")renderLive();
  if(name==="donate")renderDon();
  if(name==="news")renderNews();
  if(name==="gallery")renderGal();
  if(name==="account")renderAcct();
  if(name==="admin")renderAdmin();
  if(name==="aarti")renderAarti();
  if(push!==false){_histLock=true;try{history.pushState({p:name},"","#/"+name);}catch(e){}_histLock=false;}
  var w=document.querySelector(".wrap");if(w)w.scrollTop=0;
}
window.go=function(name){showPage(name,true);};
window.addEventListener("popstate",function(e){if(_histLock)return;showPage((e.state&&e.state.p)||"home",false);});
if(!location.hash)try{history.replaceState({p:"home"},"","#/home");}catch(e){}
function workerList(){
  var list=db.workers||[];
  if(!list.length){
    list=Object.values(db.members||{}).filter(function(m){return m.role&&m.role!=="user";}).map(function(m,i){return {name:m.name,phone:m.phone,pad:m.role,work:"समिति सेवा",level:i+1};});
  }
  return list.slice().sort(function(a,b){return (Number(a.level)||99)-(Number(b.level)||99);});
}
function sevaOf(w){
  var n=(w.name||"").trim(),p=w.phone||"";
  return (db.donations||[]).filter(function(d){
    if(d.status==="pending"||d.status==="rejected")return false;
    return (p&&d.uid===p)||(n&&d.name===n);
  }).reduce(function(s,d){return s+Number(d.amt||0);},0);
}
let _wi=0,_wt=null;
function showWorker(){
  var el=document.getElementById("workSlide");if(!el)return;
  var list=workerList();
  if(!list.length){el.innerHTML="<p class='meta'>एडमिन कार्यकर्ता जोड़े</p>";return;}
  if(_wi>=list.length)_wi=0;
  var w=list[_wi++];
  el.innerHTML='<div class="wcard"><div class="wrank">#'+(w.level||"–")+'</div><div class="wbody"><b>'+(w.name||"")+'</b><div class="meta">'+(w.pad||"कार्यकर्ता")+(w.work?(" • "+w.work):"")+'</div><div class="wseva">इनके तरफ़ से सेवा प्राप्त: <b>'+inr(sevaOf(w))+'</b></div></div></div>';
}
const _rh2=window.renderHome;
window.renderHome=function(){if(typeof _rh2==="function")try{_rh2();}catch(e){}showWorker();if(_wt)clearInterval(_wt);_wt=setInterval(showWorker,3800);};
window.saveWorker=async function(){
  if(!isAdminUser())return toast("सिर्फ़ एडमिन");
  var row={name:(document.getElementById("kName")||{}).value.trim(),phone:normPh((document.getElementById("kPh")||{}).value),pad:(document.getElementById("kPad")||{}).value.trim(),work:(document.getElementById("kWork")||{}).value.trim(),level:Number((document.getElementById("kLevel")||{}).value||99)};
  if(!row.name)return toast("नाम लिखें");
  db.workers=db.workers||[];db.workers.push(row);saveLocal();
  if(cloud&&fs){try{await fs.collection("workers").add(row);}catch(e){}}
  toast("कार्यकर्ता जुड़ गया");showWorker();
};
showWorker();
(function(){
  ["donate.js?v=17","access.js?v=18"].forEach(function(src){
    var s=document.createElement("script");s.src="./"+src;document.body.appendChild(s);
  });
})();

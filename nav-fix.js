(function(){
  document.documentElement.style.overflow="hidden";
  document.body.style.overflow="hidden";
  function fitShell(){
    var vv=window.visualViewport;
    var h=Math.round((vv&&vv.height)||window.innerHeight||0);
    if(h<320)return;
    var phone=document.querySelector(".phone");
    var stage=document.querySelector(".stage");
    if(stage){
      stage.style.setProperty("height",h+"px","important");
      stage.style.setProperty("min-height",h+"px","important");
      stage.style.setProperty("max-height",h+"px","important");
    }
    if(phone){
      phone.style.setProperty("height",h+"px","important");
      phone.style.setProperty("max-height",h+"px","important");
    }
  }
  fitShell();
  window.addEventListener("resize",fitShell);
  window.addEventListener("orientationchange",function(){setTimeout(fitShell,80);});
  if(window.visualViewport){
    visualViewport.addEventListener("resize",fitShell);
    visualViewport.addEventListener("scroll",fitShell);
  }
  var nav=document.querySelector(".nav");
  if(nav){nav.style.position="relative";nav.style.flexShrink="0";nav.style.zIndex="80";}
  var phone=document.querySelector(".phone");
  if(phone){phone.style.overflow="hidden";phone.style.display="flex";phone.style.flexDirection="column";}
  var wrap=document.querySelector(".wrap");
  if(wrap){wrap.style.flex="1";wrap.style.minHeight="0";wrap.style.overflow="auto";wrap.style.webkitOverflowScrolling="touch";}
})();
var _page="home";
var _histLock=false;
function showPage(name,push){
  if(!name)name="home";
  var from=_page;
  _page=name;
  if(name==="chat"&&typeof ensureChatPage==="function")ensureChatPage();
  if(name==="chat"&&!document.getElementById("p-chat")){
    var wrap=document.querySelector(".wrap");
    if(wrap){var s=document.createElement("section");s.className="page";s.id="p-chat";wrap.appendChild(s);}
  }
  document.querySelectorAll(".page").forEach(function(p){
    var on=p.id==="p-"+name;
    p.classList.toggle("on",on);
    if(on&&from!==name){
      p.classList.remove("from-left","from-right");
      if(window._slideDir==="left")p.classList.add("from-left");
      else if(window._slideDir==="right")p.classList.add("from-right");
      p.style.animation="none";void p.offsetWidth;p.style.animation="";
    }
  });
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
  if(name==="chat"&&typeof renderChat==="function")renderChat();
  if(name==="play"&&from!=="play"&&typeof renderPlay==="function")renderPlay();
  if(from==="play"&&name!=="play"&&typeof stopFunAudio==="function")stopFunAudio();
  if(from!==name&&typeof sayJai==="function")sayJai();
  if(push!==false){_histLock=true;try{history.pushState({p:name},"","#/"+name);}catch(e){}_histLock=false;}
  var w=document.querySelector(".wrap");if(w)w.scrollTop=0;
  window._slideDir="";
}
window.go=function(name){showPage(name,true);};
(function(){
  var tabs=["home","events","donate","gallery","chat"];
  var x0=0,y0=0,on=false;
  var wrap=document.querySelector(".wrap");
  if(!wrap)return;
  wrap.addEventListener("touchstart",function(e){
    if(e.touches.length!==1)return;
    var t=e.target;
    if(t&&t.closest&&t.closest("input,textarea,select,button,a,label"))return;
    x0=e.touches[0].clientX;y0=e.touches[0].clientY;on=true;
  },{passive:true});
  wrap.addEventListener("touchend",function(e){
    if(!on)return;on=false;
    var p=e.changedTouches&&e.changedTouches[0];if(!p)return;
    var dx=p.clientX-x0,dy=p.clientY-y0;
    if(Math.abs(dx)<64||Math.abs(dx)<Math.abs(dy)*1.3)return;
    var cur=(location.hash||"#/home").replace("#/","").split("?")[0]||"home";
    var i=tabs.indexOf(cur);
    if(i<0)i=0;
    var next=dx<0?tabs[Math.min(tabs.length-1,i+1)]:tabs[Math.max(0,i-1)];
    if(!next||next===cur)return;
    window._slideDir=dx<0?"left":"right";
    if(typeof go==="function")go(next);
  },{passive:true});
})();
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
  if(typeof isAdminUser==="function"&&!isAdminUser())return toast("सिर्फ़ एडमिन");
  var row={name:(document.getElementById("kName")||{}).value.trim(),phone:normPh((document.getElementById("kPh")||{}).value),pad:(document.getElementById("kPad")||{}).value.trim(),work:(document.getElementById("kWork")||{}).value.trim(),level:Number((document.getElementById("kLevel")||{}).value||99)};
  if(!row.name)return toast("नाम लिखें");
  db.workers=db.workers||[];db.workers.push(row);saveLocal();
  if(cloud&&fs){try{await fs.collection("workers").add(row);}catch(e){}}
  toast("कार्यकर्ता जुड़ गया");showWorker();
};
showWorker();

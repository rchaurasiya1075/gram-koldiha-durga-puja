window._alerts=window._alerts||[];
window.renderNews=function(){
  var el=document.getElementById("newsList");if(!el)return;
  if(typeof setBadge==="function")setBadge(0);
  var rows=[];
  (db.announcements||[]).forEach(function(a){rows.push({t:a.created||0,title:a.title||"सूचना",body:a.message||""});});
  (window._alerts||[]).forEach(function(a){rows.push({t:a.t||0,title:a.title||"अपडेट",body:a.body||""});});
  rows.sort(function(a,b){return (b.t||0)-(a.t||0);});
  if(!rows.length){el.innerHTML='<div class="card">अभी कोई सूचना नहीं</div>';return;}
  el.innerHTML=rows.map(function(a){return '<div class="card notice"><h3>'+a.title+'</h3><p>'+a.body+'</p><p class="meta">'+(a.t?new Date(a.t).toLocaleString("hi-IN"):"")+'</p></div>';}).join("");
};
setTimeout(function(){
  if(!(window.fs)||window._alLive)return;window._alLive=true;
  try{fs.collection("alerts").onSnapshot(function(qs){window._alerts=qs.docs.map(function(d){return d.data();});if(document.querySelector("#p-news.on"))renderNews();});}catch(e){}
},1200);
function teamList(){
  var a=db.workers||[];
  if(a.length)return a;
  return Object.values(db.members||{}).filter(function(m){return m&&(m.pad||m.role==="admin"||m.role==="volunteer"||m.role==="treasurer"||m.role==="editor");});
}
function teamSlideBox(){
  var home=document.getElementById("p-home");if(!home)return;
  var box=document.getElementById("teamSlide");
  if(!box){box=document.createElement("div");box.id="teamSlide";box.className="workSlide";var sl=document.getElementById("pandalSlide");if(sl&&sl.nextSibling)home.insertBefore(box,sl.nextSibling);else home.appendChild(box);}
  var list=teamList();
  if(!list.length){box.innerHTML="";return;}
  var i=Number(box.dataset.i||0)%list.length;var m=list[i];box.dataset.i=i+1;
  var photo=m.dp||m.photo||m.url||"";
  box.innerHTML='<div class="card" style="display:flex;gap:10px;align-items:center" onclick="go(\'team\')">'+(photo?'<img src="'+photo+'" style="width:54px;height:54px;border-radius:50%;object-fit:cover">':'<div style="width:54px;height:54px;border-radius:50%;background:#6B1212;color:#F7E7C3;display:flex;align-items:center;justify-content:center;font-weight:800">'+String(m.name||"?").charAt(0)+'</div>')+'<div><b>'+(m.name||"")+'</b><div class="meta">'+(m.pad||m.role||"कार्यकर्ता")+'</div></div></div>';
}
if(!window._teamTimer)window._teamTimer=setInterval(teamSlideBox,3500);
function ensureTeam(){
  if(document.getElementById("p-team"))return;
  var wrap=document.querySelector(".wrap");if(!wrap)return;
  var s=document.createElement("section");s.className="page";s.id="p-team";wrap.appendChild(s);
}
window.renderTeam=function(){
  ensureTeam();
  var page=document.getElementById("p-team");if(!page)return;
  var html='<h2>🤝 समिति / कार्यकर्ता</h2>';
  var list=teamList();
  if(!list.length)html+='<div class="card">एडमिन नाम, पद, काम जोड़ें</div>';
  list.forEach(function(m){
    html+='<div class="card"><b>'+(m.name||"")+'</b><p class="meta">पद: '+(m.pad||m.role||"-")+'</p><p>'+(m.work||m.duty||m.resp||"")+'</p><p class="meta">'+(m.phone||"")+'</p></div>';
  });
  page.innerHTML=html;
};
window.saveWorker=async function(){
  var row={name:(document.getElementById("kName")||{}).value||"",phone:(document.getElementById("kPh")||{}).value||"",pad:(document.getElementById("kPad")||{}).value||"",work:(document.getElementById("kWork")||{}).value||"",level:Number((document.getElementById("kLevel")||{}).value||1),created:Date.now()};
  if(!row.name)return toast("नाम लिखो");
  db.workers=db.workers||[];db.workers.push(row);if(typeof saveLocal==="function")saveLocal();
  if(window.fs){try{await fs.collection("workers").add(row);}catch(e){}}
  toast("कार्यकर्ता सेव");teamSlideBox();
};
const _goN=window.go;
window.go=function(n){if(typeof _goN==="function")_goN(n);if(n==="news")setTimeout(renderNews,20);if(n==="team")setTimeout(renderTeam,20);if(n==="home")setTimeout(teamSlideBox,30);};
const _rhN=window.renderHome;
window.renderHome=function(){if(typeof _rhN==="function")try{_rhN();}catch(e){}teamSlideBox();var g=document.querySelector(".home-grid");if(g&&!document.getElementById("tileTeam")){var t=document.createElement("button");t.className="tile";t.id="tileTeam";t.onclick=function(){go("team");};t.innerHTML="<span>🤝</span>समिति";g.appendChild(t);}};
setTimeout(teamSlideBox,900);

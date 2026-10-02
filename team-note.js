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
  var a=(db.workers||[]).slice().sort(function(x,y){return (Number(x.level)||99)-(Number(y.level)||99);});
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
var PAD_SEED=[
  {name:"महेंद्र सिंह",pad:"अध्यक्ष",work:"पूरे कार्यक्रम की अगुवाई, निर्णय और सभी को साथ लेकर चलना।",level:1},
  {name:"अंशु चौरसिया",pad:"कोषाध्यक्ष",work:"खर्च, चंदे और वित्तीय लेन-देन का हिसाब रखना।",level:2},
  {name:"सुनील मौर्य",pad:"उपाध्यक्ष",work:"अध्यक्ष की सहायता और व्यवस्थाओं पर नज़र रखना।",level:3},
  {name:"जितेंद्र चौरसिया",pad:"उपाध्यक्ष",work:"पदाधिकारियों व ग्रामीणों से समन्वय बनाकर तैयारियाँ गति देना।",level:4},
  {name:"नीरज चौरसिया",pad:"उपाध्यक्ष",work:"कार्यक्रम स्थल और व्यवस्थाओं का निरीक्षण व सहयोग।",level:5},
  {name:"पवन पाल",pad:"उपाध्यक्ष",work:"भीड़ प्रबंधन और व्यवस्था की जिम्मेदारी।",level:6},
  {name:"नंदन चौरसिया",pad:"पदाधिकारी",work:"लोगों को एकत्र करना और तैयारियों में सक्रिय भूमिका।",level:7},
  {name:"सोनू राम",pad:"पदाधिकारी",work:"प्रचार-प्रसार और स्थानीय स्तर पर सूचना पहुँचाना।",level:8},
  {name:"राम ललित",pad:"पदाधिकारी",work:"कार्यक्रम स्थल की बुनियादी तैयारियाँ पूरा कराना।",level:9},
  {name:"पीयूष चौरसिया",pad:"पदाधिकारी",work:"युवाओं और सहयोगियों को एकजुट कर जिम्मेदारियाँ बाँटना।",level:10},
  {name:"धीरज चौरसिया",pad:"पदाधिकारी",work:"कार्यक्रम के दौरान व्यवस्था और अनुशासन बनाए रखना।",level:11},
  {name:"अनिल सिंह",pad:"पदाधिकारी",work:"यात्रा व प्रस्थान की व्यवस्था संभालना।",level:12},
  {name:"महेश भारती",pad:"विशेष सहयोगी",work:"संगठन व ग्रामीणों के साथ रहकर कार्यक्रम को सफल बनाना।",level:13}
];
function padAdmin(){
  return (typeof isAdminUser==="function"&&isAdminUser())||!!(window.user&&(user.role==="admin"||user.phone===window.ADMIN_PHONE));
}
function escPad(s){
  var amp=String.fromCharCode(38)+"amp;";
  var lt=String.fromCharCode(38)+"lt;";
  var gt=String.fromCharCode(38)+"gt;";
  var qu=String.fromCharCode(38)+"quot;";
  return String(s||"").replace(/&/g,amp).replace(/</g,lt).replace(/>/g,gt).replace(/"/g,qu);
}
async function seedPads(){
  if(window._padSeedBusy)return;
  if(localStorage.getItem("koldiha_pad_seeded")==="1")return;
  if(!window.fs)return;
  window._padSeedBusy=1;
  var have={};
  try{
    var qs=await fs.collection("workers").get();
    qs.forEach(function(d){var n=((d.data()||{}).name||"").trim();if(n)have[n]=1;});
  }catch(e){window._padSeedBusy=0;return;}
  var missing=PAD_SEED.filter(function(d){return !have[d.name];});
  db.workers=db.workers||[];
  for(var i=0;i<missing.length;i++){
    var row={name:missing[i].name,phone:"",pad:missing[i].pad,work:missing[i].work,level:missing[i].level,created:Date.now()};
    try{var ref=await fs.collection("workers").add(row);row.id=ref.id;}catch(e){}
    if(!db.workers.some(function(w){return String(w.name).trim()===row.name;}))db.workers.push(row);
  }
  if(typeof saveLocal==="function")saveLocal();
  localStorage.setItem("koldiha_pad_seeded","1");
  window._padSeedBusy=0;
  if(typeof renderTeam==="function")renderTeam();
  if(typeof showWorker==="function")showWorker();
  renderPadEditor();
}
window.renderPadEditor=function(){
  var tools=document.getElementById("adminTools");if(!tools||!padAdmin())return;
  var box=document.getElementById("padEdit");
  if(!box){
    box=document.createElement("div");box.className="card";box.id="padEdit";
    var anchor=tools.querySelector(".card");
    if(anchor&&anchor.nextSibling)tools.insertBefore(box,anchor.nextSibling);else tools.appendChild(box);
  }
  if(box.contains(document.activeElement))return;
  var list=(db.workers||[]).slice().sort(function(a,b){return (Number(a.level)||99)-(Number(b.level)||99);});
  var html="<h3>पद संपादन</h3><p class=\"meta\">नाम, पद और काम बदलकर सेव करें।</p>";
  if(!list.length)html+="<p class=\"meta\">अभी कोई पद नहीं</p>";
  list.forEach(function(w){
    var id=escPad(w.id||w.name);
    html+='<div class="card" style="margin:8px 0;padding:8px"><input id="en_'+id+'" value="'+escPad(w.name)+'" placeholder="नाम"/><input id="ep_'+id+'" value="'+escPad(w.pad)+'" placeholder="पद"/><textarea id="ew_'+id+'">'+escPad(w.work)+'</textarea><input id="el_'+id+'" type="number" min="1" value="'+(Number(w.level)||1)+'" placeholder="क्रम"/><button class="btn" type="button" onclick="savePadRow(\''+id+'\')">सेव</button> <button class="btn ghost" type="button" onclick="delPadRow(\''+id+'\')">हटाओ</button></div>';
  });
  box.innerHTML=html;
};
window.savePadRow=async function(id){
  if(!padAdmin())return toast("सिर्फ़ एडमिन");
  var list=db.workers||[];
  var w=list.filter(function(x){return String(x.id||x.name)===String(id);})[0];
  if(!w)return;
  w.name=((document.getElementById("en_"+id)||{}).value||"").trim();
  w.pad=((document.getElementById("ep_"+id)||{}).value||"").trim();
  w.work=((document.getElementById("ew_"+id)||{}).value||"").trim();
  w.level=Number((document.getElementById("el_"+id)||{}).value||w.level||99);
  if(!w.name)return toast("नाम लिखें");
  if(typeof saveLocal==="function")saveLocal();
  if(window.fs&&w.id){try{await fs.collection("workers").doc(w.id).set({name:w.name,pad:w.pad,work:w.work,level:w.level,phone:w.phone||""},{merge:true});}catch(e){}}
  toast("पद सेव हो गया");
  if(typeof renderTeam==="function")renderTeam();
  if(typeof showWorker==="function")showWorker();
};
window.delPadRow=async function(id){
  if(!padAdmin())return toast("सिर्फ़ एडमिन");
  var w=(db.workers||[]).filter(function(x){return String(x.id||x.name)===String(id);})[0];
  db.workers=(db.workers||[]).filter(function(x){return String(x.id||x.name)!==String(id);});
  if(typeof saveLocal==="function")saveLocal();
  if(window.fs&&w&&w.id){try{await fs.collection("workers").doc(w.id).delete();}catch(e){}}
  toast("हटा दिया");
  renderPadEditor();
  if(typeof renderTeam==="function")renderTeam();
};
var _raPad=window.renderAdmin;
window.renderAdmin=function(){if(typeof _raPad==="function")try{_raPad();}catch(e){}renderPadEditor();};
setTimeout(seedPads,1200);
setTimeout(seedPads,2800);

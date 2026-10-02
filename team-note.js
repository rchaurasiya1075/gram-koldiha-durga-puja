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
function teamSlideBox(){if(typeof paintPadSlide==="function")paintPadSlide(false);}
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
    html+='<article class="card pad-full">'+faceHtml(m,true)+'<div><b>'+escPad(m.name||"")+'</b><p class="meta">'+escPad(m.pad||m.role||"-")+'</p><p>'+escPad(m.work||m.duty||m.resp||"")+'</p>'+photoBtn(m)+'</div></article>';
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
window.renderHome=function(){if(typeof _rhN==="function")try{_rhN();}catch(e){}if(typeof renderPadNotice==="function")renderPadNotice();};
setTimeout(teamSlideBox,900);
var PAD_SEED=[
  {name:"महेंद्र सिंह",pad:"अध्यक्ष (President)",work:"नेतृत्व एवं निर्णय: पूरे कार्यक्रम की अगुवाई करना, मुख्य निर्णय लेना और सभी को सही दिशा देना।",level:1},
  {name:"अंशु चौरसिया",pad:"कोषाध्यक्ष (Treasurer)",work:"वित्त एवं बजट: कार्यक्रम के खर्चों और पैसों के लेन-देन का हिसाब-किताब संभालना।",level:2},
  {name:"सुनील मौर्य",pad:"उपाध्यक्ष (Vice President)",work:"सहयोग एवं प्रबंधन: अध्यक्ष के साथ मिलकर व्यवस्थाएँ संभालना और निगरानी करना।",level:3},
  {name:"जितेंद्र चौरसिया",pad:"उपाध्यक्ष (Vice President)",work:"सहयोग एवं प्रबंधन: सदस्यों से संपर्क बनाना और तैयारियों को आगे बढ़ाना।",level:4},
  {name:"नीरज चौरसिया",pad:"उपाध्यक्ष (Vice President)",work:"सहयोग एवं प्रबंधन: कार्यक्रम स्थल की तैयारियों और व्यवस्थाओं का ध्यान रखना।",level:5},
  {name:"पवन पाल",pad:"उपाध्यक्ष (Vice President)",work:"सहयोग एवं प्रबंधन: अनुशासन और भीड़ प्रबंधन की देखरेख करना।",level:6},
  {name:"नंदन चौरसिया",pad:"पदाधिकारी (Executive Member)",work:"कार्यान्वयन: ग्रामीणों को एकत्र करना और व्यवस्था में सहयोग देना।",level:7},
  {name:"सोनू राम",pad:"पदाधिकारी (Executive Member)",work:"कार्यान्वयन: सूचना का प्रसार करना और लोगों को आमंत्रित करना।",level:8},
  {name:"राम ललित",pad:"पदाधिकारी (Executive Member)",work:"कार्यान्वयन: कार्यक्रम स्थल की बुनियादी तैयारियों को पूरा कराना।",level:9},
  {name:"पीयूष चौरसिया",pad:"पदाधिकारी (Executive Member)",work:"कार्यान्वयन: युवाओं को एकजुट करना और सौंपी गई जिम्मेदारियों को निभाना।",level:10},
  {name:"धीरज चौरसिया",pad:"पदाधिकारी (Executive Member)",work:"कार्यान्वयन: कार्यक्रम के दौरान व्यवस्था बनाए रखना।",level:11},
  {name:"अनिल सिंह",pad:"पदाधिकारी (Executive Member)",work:"कार्यान्वयन: यात्रा और प्रस्थान की तैयारियों में सहयोग देना।",level:12},
  {name:"महेश भारती",pad:"विशेष सहयोगी (Special Invitee)",work:"सक्रिय सहभागिता: टीम के साथ मिलकर कार्यक्रम में उपस्थित रहना और सहयोग देना।",level:13}
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
function padKey(w){return String((w&&(w.id||w.name))||"");}
function findPad(key){
  return (db.workers||[]).filter(function(x){return padKey(x)===String(key);})[0]||null;
}
function canPhoto(w){
  if(padAdmin())return true;
  var u=window.user||null;
  if(!u||!w)return false;
  return String(u.name||"").trim()&&String(u.name||"").trim()===String(w.name||"").trim();
}
function faceHtml(w,big){
  var photo=w.photo||w.dp||w.url||"";
  var cls=big?"pad-face big":"pad-face";
  if(photo)return '<img class="'+cls+'" alt="" src="'+escPad(photo)+'">';
  return '<div class="'+cls+' pad-ph">'+escPad(String(w.name||"?").charAt(0))+'</div>';
}
function photoBtn(w){
  if(!canPhoto(w))return "";
  var id=escPad(padKey(w));
  return '<label class="pad-up">फोटो बदलें<input type="file" accept="image/*,.jpg,.jpeg,.png,.webp,.heic" onchange="setPadPhoto(\''+id+'\',this)"></label>';
}
window.renderPadNotice=function(){
  var box=document.getElementById("padNotice");if(box)box.innerHTML="";
};
window.paintPadSlide=function(step){
  var el=document.getElementById("workSlide");if(!el)return;
  var list=teamList();
  if(!list.length){el.innerHTML="";return;}
  if(step!==false)window._padI=(Number(window._padI)||0)+1;
  var i=Number(window._padI)||0;
  if(i>=list.length)i=0;
  window._padI=i;
  var w=list[i];
  el.innerHTML='<button type="button" class="pad-slide" onclick="go(\'team\')">'+faceHtml(w,false)+'<div><b>'+escPad(w.name||"")+'</b><span>'+escPad(w.pad||w.role||"कार्यकर्ता")+'</span></div></button>';
};
function avatarData(file){
  return new Promise(function(ok,rej){
    var url=URL.createObjectURL(file);
    var img=new Image();
    img.onload=function(){
      var w=img.width||1,h=img.height||1,max=280,sc=Math.min(1,max/Math.max(w,h));
      var c=document.createElement("canvas");
      c.width=Math.max(1,Math.round(w*sc));c.height=Math.max(1,Math.round(h*sc));
      var g=c.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,c.width,c.height);g.drawImage(img,0,0,c.width,c.height);
      try{URL.revokeObjectURL(url);}catch(e){}
      ok(c.toDataURL("image/jpeg",0.62));
    };
    img.onerror=function(){try{URL.revokeObjectURL(url);}catch(e){}rej(new Error("img"));};
    img.src=url;
  });
}
window.setPadPhoto=async function(key,input){
  var f=input&&input.files&&input.files[0];
  try{if(input)input.blur();}catch(e){}
  var w=findPad(key);
  if(!f||!w)return;
  if(!canPhoto(w))return toast("सिर्फ़ अपनी फोटो, या एडमिन");
  toast("फोटो लग रही है...");
  try{
    var url=await avatarData(f);
    if(!url||url.length>180000)return toast("फोटो बड़ी है, दूसरी चुनें");
    w.photo=url;
    if(typeof saveLocal==="function")saveLocal();
    if(window.fs&&w.id){try{await fs.collection("workers").doc(w.id).set({photo:url},{merge:true});}catch(e){}}
    toast("फोटो लग गई");
    renderPadNotice();
    if(typeof renderTeam==="function")renderTeam();
    renderPadEditor();
  }catch(e){toast("यह फोटो नहीं लगी");}
};
async function syncPadCopy(){
  if(localStorage.getItem("koldiha_pad_copy")==="2")return;
  if(!window.fs||window._padCopyBusy)return;
  window._padCopyBusy=1;
  try{
    var qs=await fs.collection("workers").get();
    var map={};
    qs.forEach(function(d){var n=((d.data()||{}).name||"").trim();if(n)map[n]={id:d.id,data:d.data()||{}};});
    for(var i=0;i<PAD_SEED.length;i++){
      var s=PAD_SEED[i],hit=map[s.name];
      if(hit){
        await fs.collection("workers").doc(hit.id).set({pad:s.pad,work:s.work,level:s.level},{merge:true});
      }else{
        await fs.collection("workers").add({name:s.name,phone:"",pad:s.pad,work:s.work,level:s.level,photo:"",created:Date.now()});
      }
    }
    localStorage.setItem("koldiha_pad_copy","2");
  }catch(e){window._padCopyBusy=0;return;}
  window._padCopyBusy=0;
  if(typeof renderTeam==="function")renderTeam();
  renderPadNotice();
  renderPadEditor();
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
    html+='<div class="card" style="margin:8px 0;padding:8px">'+faceHtml(w,true)+photoBtn(w)+'<input id="en_'+id+'" value="'+escPad(w.name)+'" placeholder="नाम"/><input id="ep_'+id+'" value="'+escPad(w.pad)+'" placeholder="पद"/><textarea id="ew_'+id+'">'+escPad(w.work)+'</textarea><input id="el_'+id+'" type="number" min="1" value="'+(Number(w.level)||1)+'" placeholder="क्रम"/><button class="btn" type="button" onclick="savePadRow(\''+id+'\')">सेव</button> <button class="btn ghost" type="button" onclick="delPadRow(\''+id+'\')">हटाओ</button></div>';
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
setTimeout(syncPadCopy,1600);
setTimeout(syncPadCopy,4200);

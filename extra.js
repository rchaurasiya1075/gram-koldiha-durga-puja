const DRIVE_ADD="https://drive.google.com/drive/folders/1FHP8dYCxsWCzA7raGUX8VN6CekHAln_U?usp=sharing";
const AARTI_SEED=[{id:"durga",god:"माँ दुर्गा",title:"संध्या आरती",when:"07:00 PM",by:"",lines:["जय अम्बे जय जगदम्बे माता"]},{id:"maha",god:"माँ दुर्गा",title:"महाआरती",when:"अष्टमी",by:"",lines:["महिषासुर मर्दिनी"]},{id:"laxmi",god:"माँ लक्ष्मी",title:"लक्ष्मी आरती",when:"",by:"",lines:["जय लक्ष्मी माता"]},{id:"saras",god:"माँ सरस्वती",title:"सरस्वती वन्दना",when:"",by:"",lines:["माँ सरस्वती वरदान"]},{id:"kali",god:"माँ काली",title:"काली आरती",when:"",by:"",lines:["जय जय माँ काली"]},{id:"ganesh",god:"श्री गणेश",title:"गणेश आरती",when:"",by:"",lines:["जय गणेश देवा"]},{id:"kartik",god:"श्री कार्तिकेय",title:"कार्तिकेय",when:"",by:"",lines:["जय हो कार्तिकेय"]},{id:"pratah",god:"माँ दुर्गा",title:"प्रातः आरती",when:"06:30 AM",by:"",lines:["जय माँ दुर्गा"]}];
function aartiList(){if(!db.aartis||!db.aartis.length)db.aartis=AARTI_SEED.map(function(x){return Object.assign({},x);});return db.aartis;}
function compressFile(file){return new Promise(function(res,rej){if(file.type&&file.type.indexOf("video")===0){if(file.size>2500000)return rej(new Error("video-big"));var r=new FileReader();r.onload=function(){res(r.result);};r.onerror=rej;r.readAsDataURL(file);return;}var r=new FileReader();r.onerror=rej;r.onload=function(){var img=new Image();img.onload=function(){var c=document.createElement("canvas");var w=900;var h=Math.round(img.height*(w/img.width));if(img.width<w){w=img.width;h=img.height;}c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);res(c.toDataURL("image/jpeg",0.7));};img.src=r.result;};r.readAsDataURL(file);});}
function isAdminUser(){return !!(user&&(user.phone==="9473746020"||user.phone===window.ADMIN_PHONE));}
function isOwner(u){return !!(user&&u&&String(u.phone||"")===String(user.phone||""));}
function photoKey(u){return String(u.fid||u.created||"");}
function findPhoto(id){id=String(id);return (db.gallery||[]).find(function(x){return photoKey(x)===id;});}
function fmtWhen(t){try{return new Date(t||Date.now()).toLocaleString("hi-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});}catch(e){return "";}}
function isVid(u){var s=String((u&&(u.url||u.data))||"");return s.indexOf("video")>=0||s.indexOf(".mp4")>=0;}
window._galFilter="all";
window._lbI=-1;
function galItems(){var all=(db.gallery||[]).slice().sort(function(a,b){return (b.created||0)-(a.created||0);});if(window._galFilter==="all")return all;return all.filter(function(x){return String(x.phone)===String(window._galFilter);});}
function galPeople(){var map={};(db.gallery||[]).forEach(function(x){var k=x.phone||x.name;if(!map[k])map[k]={phone:x.phone,name:x.name||"श्रद्धालु",n:0};map[k].n++;});return Object.keys(map).map(function(k){return map[k];});}
window.renderGal=function(){
  var page=document.getElementById("p-gallery");if(!page)return;
  var people=galPeople();
  var html='<h2>📸 गैलरी</h2>';
  html+='<div class="gchips"><button class="'+(window._galFilter==="all"?"on":"")+'" onclick="setGalFilter(\'all\')">सभी</button>';
  people.forEach(function(p){html+='<button class="'+(window._galFilter===p.phone?"on":"")+'" onclick="setGalFilter(\''+p.phone+'\')">'+(p.name||"यूज़र")+' · '+p.n+'</button>';});
  html+='</div>';
  if(user){html+='<div class="card slim"><input type="file" accept="image/*,video/*" id="galFile"/><input id="galDesc" placeholder="फोटो के बारे लिखो..."/><button class="btn" onclick="uploadNamedPhoto()">अपनी पोस्ट डालो</button></div>';}
  else html+='<button class="btn" onclick="go(\'account\')">पोस्ट के लिए लॉगिन</button>';
  html+='<div class="ggrid" id="galGrid"></div><div id="lb" class="lb" style="display:none"></div>';
  page.innerHTML=html;
  var items=galItems();
  var g=document.getElementById("galGrid");
  if(!items.length){g.innerHTML='<p class="meta">अभी पोस्ट नहीं</p>';return;}
  g.innerHTML=items.map(function(u,i){
    var src=mediaUrl(u.url||u.data||"");
    var own=isOwner(u);
    var ed=own?'<button class="mini" onclick="event.stopPropagation();startEditPhoto(\''+photoKey(u)+'\')">✏️</button>':'';
    var media=isVid(u)?'<div class="thumb vid">▶</div>':'<img src="'+src+'" alt=""/>';
    return '<figure onclick="openLb('+i+')">'+media+'<figcaption><b>'+(u.name||"")+'</b> '+ed+'<div class="meta">'+fmtWhen(u.created)+'</div></figcaption></figure>';
  }).join("");
};
window.setGalFilter=function(v){window._galFilter=v;renderGal();};
window.openLb=function(i){
  var items=galItems();if(!items[i])return;
  window._lbI=i;var u=items[i];
  var src=mediaUrl(u.url||u.data||"");
  var lb=document.getElementById("lb");if(!lb)return;
  var media=isVid(u)?'<video src="'+src+'" controls autoplay playsinline></video>':'<img src="'+src+'" alt=""/>';
  var own=isOwner(u);
  var editBox=own&&window._editPhoto===photoKey(u)?('<input id="editName" value="'+(u.name||"").replace(/"/g,"")+'"/><textarea id="editDesc">'+(u.desc||"")+'</textarea><input type="file" accept="image/*,video/*" id="editFile"/><button class="btn" onclick="savePhotoEdit(\''+photoKey(u)+'\')">सेव</button>'):(own?'<button class="mini" onclick="startEditPhoto(\''+photoKey(u)+'\')">✏️ एडिट</button> <button class="mini" onclick="deletePhoto(\''+photoKey(u)+'\')">हटाओ</button>':'');
  lb.style.display="flex";
  lb.innerHTML='<div class="lbx"><button class="lbnav l" onclick="openLb('+(i-1)+')">‹</button>'+media+'<button class="lbnav r" onclick="openLb('+(i+1)+')">›</button><button class="lbclose" onclick="closeLb()">✕</button><div class="lbmeta"><b>'+(u.name||"")+'</b> · '+fmtWhen(u.created)+(u.desc?("<p>"+u.desc+"</p>"):"")+editBox+'</div></div>';
};
window.closeLb=function(){var lb=document.getElementById("lb");if(lb)lb.style.display="none";window._editPhoto=null;};
window.startEditPhoto=function(id){window._editPhoto=String(id);var items=galItems();var i=items.findIndex(function(x){return photoKey(x)===String(id);});if(i>=0)openLb(i);else renderGal();};
window.deletePhoto=async function(id){
  var u=findPhoto(id);if(!u||!isOwner(u))return toast("सिर्फ़ अपनी पोस्ट हटा सकते");
  if(!confirm("हटानी है?"))return;
  db.gallery=(db.gallery||[]).filter(function(x){return photoKey(x)!==String(id);});saveLocal();
  if(cloud&&fs&&u.fid){try{await fs.collection("gallery").doc(u.fid).delete();}catch(e){}}
  closeLb();toast("हट गई");renderGal();
};
window.savePhotoEdit=async function(id){
  var u=findPhoto(id);if(!u||!isOwner(u))return toast("सिर्फ़ अपनी पोस्ट");
  u.name=((document.getElementById("editName")||{}).value||u.name).trim();
  u.desc=((document.getElementById("editDesc")||{}).value||"").trim();
  var f=(document.getElementById("editFile")||{}).files;
  if(f&&f[0])u.url=await compressFile(f[0]);
  saveLocal();
  if(cloud&&fs&&u.fid){try{await fs.collection("gallery").doc(u.fid).set({name:u.name,phone:u.phone,url:u.url,desc:u.desc,created:u.created},{merge:true});}catch(e){}}
  window._editPhoto=null;toast("सेव");openLb(window._lbI);
};
window.uploadNamedPhoto=async function(){
  if(!user){toast("लॉगिन");return go("account");}
  var inp=document.getElementById("galFile");
  var f=inp&&inp.files&&inp.files[0];if(!f)return toast("फोटो/वीडियो चुनो");
  var desc=((document.getElementById("galDesc")||{}).value||"").trim();
  toast("अपलोड...");
  try{
    var data=await compressFile(f);
    var row={name:uname()||user.phone,phone:uid(),url:data,desc:desc,created:Date.now(),kind:f.type||"image"};
    if(cloud&&fs){try{var ref=await fs.collection("gallery").add(row);row.fid=ref.id;}catch(e){}}
    db.gallery=db.gallery||[];db.gallery.push(row);saveLocal();
    window._galFilter=uid();toast("पोस्ट लग गई");renderGal();
  }catch(e){toast(e&&e.message==="video-big"?"वीडियो छोटी है (2.5MB से कम)":"अपलोड नहीं हुआ");}
};
window.renderAarti=function(){
  var page=document.getElementById("p-aarti");if(!page)return;
  var html='<h2>🪔 आरती</h2>';
  aartiList().forEach(function(a,i){
    html+='<div class="card"><div class="meta">'+a.god+' • '+(a.when||"")+'</div><h3>'+a.title+'</h3><p><b>आरती:</b> '+(a.by||"समिति")+'</p><p>'+(a.lines||[]).join("<br/>")+'</p>';
    if(isAdminUser())html+='<input id="aby'+i+'" value="'+(a.by||"")+'" placeholder="आज किसकी आरती"/><button class="btn" onclick="saveAartiBy('+i+')">सेव</button>';
    html+='</div>';
  });
  page.innerHTML=html;
};
window.saveAartiBy=async function(i){db.aartis=aartiList();db.aartis[i].by=((document.getElementById("aby"+i)||{}).value||"").trim();saveLocal();if(cloud&&fs){try{await fs.collection("settings").doc("aartis").set({list:db.aartis});}catch(e){}}toast("सेव");renderAarti();};
document.addEventListener("keydown",function(e){if(document.getElementById("lb")&&document.getElementById("lb").style.display==="flex"){if(e.key==="ArrowRight")openLb(window._lbI+1);if(e.key==="ArrowLeft")openLb(window._lbI-1);if(e.key==="Escape")closeLb();}});
setTimeout(function(){if(!(window.cloud&&window.fs))return;try{fs.collection("gallery").onSnapshot(function(qs){db.gallery=qs.docs.map(function(d){var x=d.data();x.fid=d.id;return x;});saveLocal();if(document.querySelector("#p-gallery.on"))renderGal();});}catch(e){}},2500);

const DRIVE_ADD="https://drive.google.com/drive/folders/1FHP8dYCxsWCzA7raGUX8VN6CekHAln_U?usp=sharing";
const AARTI_SEED=[
  {id:"durga",god:"माँ दुर्गा",title:"संध्या आरती",when:"रोज 07:00 PM",by:"",lines:["जय अम्बे, जय अम्बे, जय जगदम्बे माता","तुमको निशदिन का मुकुट सबको बरदान"]},
  {id:"maha",god:"माँ दुर्गा",title:"महाआरती",when:"अष्टमी संधि पूजा",by:"",lines:["माँ तुम हो शक्ति रूपा","महिषासुर मर्दिनी"]},
  {id:"laxmi",god:"माँ लक्ष्मी",title:"लक्ष्मी आरती",when:"सप्तमी–नवमी",by:"",lines:["जय लक्ष्मी माता, मैया जय जय"]},
  {id:"saras",god:"माँ सरस्वती",title:"सरस्वती वन्दना",when:"सप्तमी–नवमी",by:"",lines:["माँ सरस्वती वरदान, विद्या बुद्धि और ग्यान"]},
  {id:"kali",god:"माँ काली",title:"काली आरती",when:"नवमी रात",by:"",lines:["जय जय माँ काली"]},
  {id:"ganesh",god:"श्री गणेश",title:"गणेश आरती",when:"प्रातः",by:"",lines:["जय गणेश जय गणेश देवा"]},
  {id:"kartik",god:"श्री कार्तिकेय",title:"कार्तिकेय वन्दना",when:"नित्य पूजा",by:"",lines:["जय हो कार्तिकेय"]},
  {id:"pratah",god:"माँ दुर्गा",title:"प्रातः आरती",when:"रोज 06:30 AM",by:"",lines:["जय माँ दुर्गा, जय जगजननी"]}
];
function aartiList(){if(!db.aartis||!db.aartis.length)db.aartis=AARTI_SEED.map(function(x){return Object.assign({},x);});return db.aartis;}
function compressFile(file){return new Promise(function(res,rej){var r=new FileReader();r.onerror=rej;r.onload=function(){var img=new Image();img.onload=function(){var c=document.createElement("canvas");var w=720;var h=Math.round(img.height*(w/img.width));if(img.width<w){w=img.width;h=img.height;}c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);res(c.toDataURL("image/jpeg",0.72));};img.src=r.result;};r.readAsDataURL(file);});}
function isAdminUser(){return !!(user&&(user.role==="admin"||user.phone===window.ADMIN_PHONE||user.phone==="9473746020"));}
function canEditPhoto(u){if(!user||!u)return false;if(isAdminUser())return true;return String(u.phone||"")===String(user.phone||"");}
function photoKey(u){return String(u.fid||u.created||"");}
function findPhoto(id){id=String(id);return (db.gallery||[]).find(function(x){return photoKey(x)===id;});}
window.renderGal=function(){
  var page=document.getElementById("p-gallery");if(!page)return;
  var fid=folderId(db.settings.driveFolder||DRIVE_ADD);
  var html='<h2>📸 गैलरी</h2>';
  html+='<div class="card"><p>फोटो नाम के साथ सभको दिखेगी। अपनी / एडमिन एडिट-डिलीट कर सकते हैं।</p>';
  if(user) html+='<input type="file" accept="image/*" capture="environment" id="galFile" onchange="uploadNamedPhoto(this)"/><p class="meta">नई फोटो जोड़ो</p>';
  else html+='<button class="btn" onclick="go(\'account\')">पहले लॉगिन</button>';
  html+='<a class="btn ghost" target="_blank" href="'+DRIVE_ADD+'">Google Drive</a></div>';
  html+='<iframe class="drivebox" src="https://drive.google.com/embeddedfolderview?id='+fid+'#grid"></iframe>';
  html+='<div class="ggrid" id="galGrid"></div>';
  page.innerHTML=html;
  var g=document.getElementById("galGrid");
  var items=(db.gallery||[]).slice().reverse();
  if(!g)return;
  if(!items.length){g.innerHTML='<p class="meta">अभी फोटो नहीं।</p>';return;}
  g.innerHTML=items.map(function(u){
    var src=mediaUrl(u.url||u.data||"");
    var nm=u.name||"श्रद्धालु";
    var id=photoKey(u);
    var btns=canEditPhoto(u)?('<div class="phacts"><button type="button" onclick="startEditPhoto(\''+id+'\')">एडिट</button><button type="button" onclick="deletePhoto(\''+id+'\')">डिलीट</button></div>'):"";
    var edit=window._editPhoto===id?('<div class="card" style="margin:6px 0"><input id="editName" value="'+nm.replace(/"/g,"")+'" placeholder="नाम"/><input type="file" accept="image/*" id="editFile"/><button class="btn" onclick="savePhotoEdit(\''+id+'\')">सेव</button><button class="btn ghost" onclick="window._editPhoto=null;renderGal()">बंद</button></div>'):"";
    return '<figure><img src="'+src+'" alt=""/><figcaption>'+nm+btns+edit+'</figcaption></figure>';
  }).join("");
};
window.startEditPhoto=function(id){window._editPhoto=String(id);renderGal();};
window.deletePhoto=async function(id){
  var u=findPhoto(id);if(!u)return toast("फोटो नहीं");
  if(!canEditPhoto(u))return toast("इस फोटो को आप हटा नहीं सकते");
  if(!confirm("यह फोटो हटानी है?"))return;
  db.gallery=(db.gallery||[]).filter(function(x){return photoKey(x)!==String(id);});
  saveLocal();
  if(cloud&&fs&&u.fid){try{await fs.collection("gallery").doc(u.fid).delete();}catch(e){}}
  toast("फोटो हट गई");renderGal();
};
window.savePhotoEdit=async function(id){
  var u=findPhoto(id);if(!u||!canEditPhoto(u))return toast("एडिट नहीं हो सकता");
  var nm=((document.getElementById("editName")||{}).value||"").trim()||u.name;
  var f=(document.getElementById("editFile")||{}).files;
  u.name=nm;
  if(f&&f[0]){toast("नई फोटो...");u.url=await compressFile(f[0]);}
  saveLocal();
  if(cloud&&fs&&u.fid){try{await fs.collection("gallery").doc(u.fid).set({name:u.name,phone:u.phone,url:u.url,created:u.created},{merge:true});}catch(e){}}
  window._editPhoto=null;toast("फोटो अपडेट");renderGal();
};
window.uploadNamedPhoto=async function(inp){
  if(!user){toast("पहले लॉगिन");return go("account");}
  var f=inp.files&&inp.files[0];if(!f)return;
  toast("फोटो तैयार...");
  try{
    var data=await compressFile(f);
    var row={name:uname()||user.phone,phone:uid(),url:data,created:Date.now()};
    if(cloud&&fs){try{var ref=await fs.collection("gallery").add({name:row.name,phone:row.phone,url:row.url,created:row.created});row.fid=ref.id;}catch(e){}}
    db.gallery=db.gallery||[];db.gallery.push(row);saveLocal();
    toast("गैलरी में फोटो आ गई");renderGal();
  }catch(e){toast("फोटो नहीं चढ़ी");}
};
window.renderAarti=function(){
  var page=document.getElementById("p-aarti");if(!page)return;
  var list=aartiList();
  var html='<h2>🪔 आरती</h2>';
  list.forEach(function(a,i){
    html+='<div class="card"><div class="meta">'+a.god+' • '+(a.when||"")+'</div><h3>'+a.title+'</h3>';
    html+='<p><b>आरती करेंगे:</b> '+(a.by||"समिति")+'</p>';
    html+='<p>'+(a.lines||[]).join("<br/>")+'</p>';
    if(isAdminUser()){html+='<input id="aby'+i+'" placeholder="आज किसकी आरती?" value="'+(a.by||"")+'"/><button class="btn" onclick="saveAartiBy('+i+')">नाम सेव</button>';}
    html+='</div>';
  });
  page.innerHTML=html;
};
window.saveAartiBy=async function(i){
  var v=(document.getElementById("aby"+i)||{}).value.trim();
  db.aartis=aartiList();db.aartis[i].by=v;saveLocal();
  if(cloud&&fs){try{await fs.collection("settings").doc("aartis").set({list:db.aartis});}catch(e){}}
  toast("सेव");renderAarti();
};
setTimeout(function(){
  if(!(window.cloud&&window.fs))return;
  try{
    fs.collection("gallery").onSnapshot(function(qs){
      db.gallery=qs.docs.map(function(d){var x=d.data();x.fid=d.id;return x;});
      saveLocal();
      if(document.getElementById("p-gallery")&&document.getElementById("p-gallery").classList.contains("on"))renderGal();
    });
  }catch(e){}
},2500);

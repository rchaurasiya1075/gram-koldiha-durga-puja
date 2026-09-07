const DRIVE_ADD="https://drive.google.com/drive/folders/1FHP8dYCxsWCzA7raGUX8VN6CekHAln_U?usp=sharing";
const AARTI_SEED=[
  {id:"durga",god:"माँ दुर्गा",title:"संध्या आरती",when:"रोज 07:00 PM",by:"",lines:["जय अम्बे, जय अम्बे, जय जगदम्बे माता","तुमको निशदिन का मुकुट सबको बरदान","तुम हो जग की मूल मुरति, तुम ही दुःख निवारिणी","सब पर दया तेरी करुणा, तुम ही माँ भवानी"]}, 
  {id:"maha",god:"माँ दुर्गा",title:"महाआरती",when:"अष्टमी संधि पूजा",by:"",lines:["माँ तुम हो शक्ति रूपा, माँ तुम हो भक्ति रूपा","महिषासुर मर्दिनी, जय जय जगजननी"]}, 
  {id:"laxmi",god:"माँ लक्ष्मी",title:"लक्ष्मी आरती",when:"सप्तमी–नवमी",by:"",lines:["जय लक्ष्मी माता, मैया जय जय","दिन–रैन दियो माँ, बनो गरीब का राज","धन–धान्य सौभाग्य, तेरी कृपा का खजाना"]}, 
  {id:"saras",god:"माँ सरस्वती",title:"सरस्वती वन्दना",when:"सप्तमी–नवमी",by:"",lines:["या कुन्देन्दु तुषार विराजिते","माँ सरस्वती वरदान, विद्या बुद्धि और ग्यान","वीणा हस्ते शुभर, वाणी हाथ में तेरा नाम"]}, 
  {id:"kali",god:"माँ काली",title:"काली आरती",when:"नवमी रात",by:"",lines:["जय जय माँ काली, जय जगदम्बे काली","असुर की नाशिनी, भक्तों की रक्षिणी"]}, 
  {id:"ganesh",god:"श्री गणेश",title:"गणेश आरती",when:"प्रातः / स्थापना",by:"",lines:["जय गणेश जय गणेश, जय गणेश देवा","माता जाकी जननी, विघ्न हरो श्री गणेशा"]}, 
  {id:"kartik",god:"श्री कार्तिकेय",title:"कार्तिकेय वन्दना",when:"नित्य पूजा",by:"",lines:["जय हो कार्तिकेय, माँ दुर्गा के लाल","शक्ति–स्तोत्र दो, गाँव का रखवाला"]}, 
  {id:"pratah",god:"माँ दुर्गा",title:"प्रातः आरती",when:"रोज 06:30 AM",by:"",lines:["जय माँ दुर्गा, जय जगजननी","प्रातः वन्दन से मंगल करो कल्याण"]} 
];
function aartiList(){if(!db.aartis||!db.aartis.length)db.aartis=AARTI_SEED.map(function(x){return Object.assign({},x);});return db.aartis;}
function compressFile(file){return new Promise(function(res,rej){var r=new FileReader();r.onerror=rej;r.onload=function(){var img=new Image();img.onload=function(){var c=document.createElement("canvas");var w=720;var h=Math.round(img.height*(w/img.width));if(img.width<w){w=img.width;h=img.height;}c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);res(c.toDataURL("image/jpeg",0.72));};img.src=r.result;};r.readAsDataURL(file);});}
window.renderGal=function(){
  var page=document.getElementById("p-gallery");if(!page)return;
  var fid=folderId(db.settings.driveFolder||DRIVE_ADD);
  var html='<h2>📸 गैलरी</h2>';
  html+='<div class="card"><p>श्रद्धालु फोटो अपने नाम के साथ सभको दिखेगी।</p>';
  if(user) html+='<input type="file" accept="image/*" capture="environment" id="galFile" onchange="uploadNamedPhoto(this)"/><p class="meta">कैमरा / गैलरी से चुनो</p>';
  else html+='<button class="btn" onclick="go(\'account\')">पहले लॉगिन करो, फिर फोटो डालो</button>';
  html+='<a class="btn ghost" target="_blank" href="'+DRIVE_ADD+'">Google Drive में भी डालो</a>';
  html+='<p class="meta">एडमिन: Drive फ़ोल्डर को “Anyone with the link can edit” करें।</p></div>';
  html+='<iframe class="drivebox" src="https://drive.google.com/embeddedfolderview?id='+fid+'#grid"></iframe>';
  html+='<div class="ggrid" id="galGrid"></div>';
  page.innerHTML=html;
  var g=document.getElementById("galGrid");
  var items=db.gallery||[];
  if(g)g.innerHTML=items.slice().reverse().map(function(u){var src=mediaUrl(u.url||u.data||"");var nm=u.name||"श्रद्धालु";return '<figure><img src="'+src+'" alt=""/><figcaption>'+nm+'</figcaption></figure>';}).join("")||'<p class="meta">अभी फोटो नहीं।</p>';
};
window.uploadNamedPhoto=async function(inp){
  if(!user){toast("पहले लॉगिन");return go("account");}
  var f=inp.files&&inp.files[0];if(!f)return;
  toast("फोटो तैयार...");
  try{
    var data=await compressFile(f);
    var row={name:uname()||user.phone,phone:uid(),data:data,created:Date.now()};
    db.gallery=db.gallery||[];db.gallery.push({name:row.name,phone:row.phone,url:data,created:row.created});saveLocal();
    if(cloud&&fs){try{await fs.collection("gallery").add({name:row.name,phone:row.phone,url:data,created:row.created});}catch(e){}}
    toast("गैलरी में "+row.name+" की फोटो आ गई");
    renderGal();
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
    if(user&&(user.role==="admin"||user.phone===window.ADMIN_PHONE)){
      html+='<input id="aby'+i+'" placeholder="आज किसकी आरती है? नाम" value="'+(a.by||"")+'"/>';
      html+='<button class="btn" onclick="saveAartiBy('+i+')">नाम सेव</button>';
    }
    html+='</div>';
  });
  page.innerHTML=html;
};
window.saveAartiBy=async function(i){
  var v=(document.getElementById("aby"+i)||{}).value.trim();
  db.aartis=aartiList();db.aartis[i].by=v;saveLocal();
  if(cloud&&fs){try{await fs.collection("settings").doc("aartis").set({list:db.aartis});}catch(e){}}
  toast("आरती का नाम सेव");renderAarti();
};
(function hookFb(){
  var old=window.initFb;
  if(typeof old!=="function")return;
})();

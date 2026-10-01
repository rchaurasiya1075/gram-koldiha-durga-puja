function showAdminDock(){
  var home=document.getElementById("p-home");if(!home)return;
  var old=document.getElementById("adminDock");
  if(!hasPanel||!hasPanel()){if(old)old.remove();return;}
  if(!old){old=document.createElement("div");old.id="adminDock";home.insertBefore(old,home.firstChild);}
  old.innerHTML='<div class="card" style="margin:0 0 6px;padding:8px"><b>पैनल खुला है</b><div class="meta">'+(user.name||"")+' — होम पर भी चलेगा</div><button class="btn" onclick="go(\'admin\')">एडमिन पैनल खोलो</button></div>';
}
const _rh4=window.renderHome;
window.renderHome=function(){if(typeof _rh4==="function")try{_rh4();}catch(e){}showAdminDock();};
showAdminDock();
/*PHOTO_UPLOAD*/
function isHeicFile(file){
  var t=(file.type||"").toLowerCase();
  var n=(file.name||"").toLowerCase();
  return t.indexOf("heic")>=0||t.indexOf("heif")>=0||/\.hei[cf]$/.test(n);
}
function loadHeicLib(){
  if(window.heic2any)return Promise.resolve();
  return new Promise(function(ok,rej){
    var s=document.createElement("script");
    s.src="https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js";
    s.onload=function(){ok();};
    s.onerror=function(){rej(new Error("heic"));};
    document.head.appendChild(s);
  });
}
function bitmapFromUrl(file){
  return new Promise(function(ok,rej){
    var url=URL.createObjectURL(file);
    var img=new Image();
    img.onload=function(){try{URL.revokeObjectURL(url);}catch(e){}ok(img);};
    img.onerror=function(){try{URL.revokeObjectURL(url);}catch(e){}rej(new Error("img"));};
    img.src=url;
  });
}
async function photoSource(file){
  var f=file;
  if(isHeicFile(file)){
    try{
      await loadHeicLib();
      var out=await window.heic2any({blob:file,toType:"image/jpeg",quality:0.9});
      f=Array.isArray(out)?out[0]:out;
    }catch(e){}
  }
  if(window.createImageBitmap){
    try{return await createImageBitmap(f,{imageOrientation:"from-image"});}catch(e){}
    try{return await createImageBitmap(f);}catch(e2){}
  }
  return bitmapFromUrl(f);
}
function jpegBlob(src,maxSide,q){
  var w=src.width||src.naturalWidth||1,h=src.height||src.naturalHeight||1;
  var sc=Math.min(1,maxSide/Math.max(w,h,1));
  var c=document.createElement("canvas");
  c.width=Math.max(1,Math.round(w*sc));
  c.height=Math.max(1,Math.round(h*sc));
  var g=c.getContext("2d");
  g.fillStyle="#ffffff";
  g.fillRect(0,0,c.width,c.height);
  g.drawImage(src,0,0,c.width,c.height);
  return new Promise(function(ok){
    if(!c.toBlob)return ok(null);
    c.toBlob(function(b){ok(b);},"image/jpeg",q);
  });
}
function makePhotoBlob(file){
  return new Promise(function(res,rej){
    if(!file)return rej(new Error("no"));
    var timer=setTimeout(function(){rej(new Error("slow"));},25000);
    photoSource(file).then(async function(src){
      var steps=[[1600,0.86],[1280,0.8],[1024,0.74],[800,0.66],[640,0.58]];
      var b=null,i=0;
      while(i<steps.length){
        b=await jpegBlob(src,steps[i][0],steps[i][1]);
        if(b&&b.size>0&&b.size<=480000)break;
        i++;
      }
      try{if(src.close)src.close();}catch(e){}
      clearTimeout(timer);
      if(!b||!b.size)return rej(new Error("blob"));
      res(b);
    }).catch(function(e){clearTimeout(timer);rej(e||new Error("img"));});
  });
}
function blobToDataUrl(blob){
  return new Promise(function(ok,rej){
    var r=new FileReader();
    r.onload=function(){ok(String(r.result||""));};
    r.onerror=function(){rej(new Error("read"));};
    r.readAsDataURL(blob);
  });
}
window.previewGal=function(inp){
  var f=inp&&inp.files&&inp.files[0];
  window._galFile=f||null;
  var box=document.getElementById("galPreview");
  if(!box)return;
  if(!f){box.innerHTML="<span>फोटो चुनें</span>";return;}
  var u=URL.createObjectURL(f);
  box.innerHTML='<img alt="" src="'+u+'">';
};
window.uploadNamedPhoto=async function(){
  if(!user){if(typeof toast==="function")toast("फोटो के लिए लॉगिन करें");return go("account");}
  if(typeof isBlockedUser==="function"&&isBlockedUser())return toast("ब्लॉक हैं — अपलोड बंद");
  var inp=document.getElementById("galFile");
  var f=window._galFile||(inp&&inp.files&&inp.files[0]);
  if(!f)return toast("पहले फोटो चुनें");
  var desc=((document.getElementById("galDesc")||{}).value||"").replace(/[<>]/g,"").trim().slice(0,180);
  toast("फोटो चढ़ रही है...");
  try{
    var blob=await makePhotoBlob(f);
    var url=await blobToDataUrl(blob);
    if(!url||url.length>820000)return toast("फोटो बड़ी रह गई, थोड़ी छोटी फोटो चुनें");
    var cloudFs=window.fs||fs;
    if(!cloudFs)return toast("नेट लगाएँ, फिर पोस्ट करें");
    var row={name:uname()||user.phone,phone:String(uid()||""),url:url,desc:desc,created:Date.now(),kind:"image",seen:0};
    var ref=await cloudFs.collection("gallery").add(row);
    row.fid=ref.id;
    db.gallery=db.gallery||[];
    db.gallery=db.gallery.filter(function(x){return x.fid!==row.fid;});
    db.gallery.unshift(row);
    try{saveLocal();}catch(e){}
    window._galFile=null;
    if(inp)inp.value="";
    var cap=document.getElementById("galDesc");if(cap)cap.value="";
    toast("पोस्ट हो गई — अब सबको दिखेगी");
    if(typeof renderGal==="function")renderGal();
  }catch(e){
    toast("यह फोटो नहीं चढ़ी। JPG, PNG या गैलरी की कोई भी फोटो फिर चुनें");
  }
};
function bindGalleryLive(){
  var cloudFs=window.fs||fs;
  if(!cloudFs||window._galLive)return;
  window._galLive=true;
  function take(qs){
    db.gallery=qs.docs.map(function(d){var x=d.data()||{};x.fid=d.id;return x;}).filter(function(x){return x&&x.url;});
    try{saveLocal();}catch(e){}
    if(document.querySelector("#p-gallery.on")&&typeof renderGal==="function")renderGal();
  }
  try{
    cloudFs.collection("gallery").orderBy("created","desc").limit(40).onSnapshot(take,function(){
      cloudFs.collection("gallery").limit(40).onSnapshot(take);
    });
  }catch(e){}
}
setTimeout(bindGalleryLive,600);
setTimeout(bindGalleryLive,2500);


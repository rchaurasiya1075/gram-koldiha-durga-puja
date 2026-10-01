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
function fileHead(file){
  return new Promise(function(ok){
    var r=new FileReader();
    r.onload=function(){ok(new Uint8Array(r.result||new ArrayBuffer(0)));};
    r.onerror=function(){ok(new Uint8Array(0));};
    try{r.readAsArrayBuffer(file.slice(0,24));}catch(e){ok(new Uint8Array(0));}
  });
}
function headText(bytes){
  var s="";
  for(var i=0;i<bytes.length;i++)s+=String.fromCharCode(bytes[i]);
  return s;
}
function looksHeic(bytes){return /ftyp(heic|heix|hevc|mif1|msf1|heif|avif)/i.test(headText(bytes));}
function looksImage(bytes,file){
  var t=(file.type||"").toLowerCase();
  if(t.indexOf("image/")===0&&t.indexOf("hei")<0&&t.indexOf("avif")<0)return true;
  if(bytes.length>=2&&bytes[0]===0xFF&&bytes[1]===0xD8)return true;
  if(bytes.length>=8&&bytes[0]===0x89&&bytes[1]===0x50)return true;
  if(bytes.length>=4&&bytes[0]===0x47&&bytes[1]===0x49&&bytes[2]===0x46)return true;
  if(bytes.length>=12&&headText(bytes).indexOf("RIFF")===0&&headText(bytes).indexOf("WEBP")>0)return true;
  var n=(file.name||"").toLowerCase();
  return /\.(jpe?g|png|webp|gif|bmp|jfif|avif)$/.test(n);
}
function loadHeicLib(){
  if(window.heic2any)return Promise.resolve();
  if(window._heicLib)return window._heicLib;
  window._heicLib=new Promise(function(ok,rej){
    var s=document.createElement("script");
    s.src="https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js";
    s.onload=function(){ok();};
    s.onerror=function(){rej(new Error("heic"));};
    document.head.appendChild(s);
  });
  return window._heicLib;
}
async function convertHeic(file){
  await loadHeicLib();
  var out=await window.heic2any({blob:file,toType:"image/jpeg",quality:0.86});
  return Array.isArray(out)?out[0]:out;
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
async function decodeImage(file){
  if(window.createImageBitmap){
    var tries=[{resizeWidth:1280,imageOrientation:"from-image"},{resizeWidth:960},{resizeWidth:720},{}];
    for(var i=0;i<tries.length;i++){
      try{return await createImageBitmap(file,tries[i]);}catch(e){}
    }
  }
  return bitmapFromUrl(file);
}
async function photoSource(file){
  var head=await fileHead(file);
  var f=file;
  if(isHeicFile(file)||looksHeic(head)){
    try{f=await convertHeic(file);}catch(e){}
  }
  try{return await decodeImage(f);}catch(e){}
  if(f===file){
    try{return await decodeImage(await convertHeic(file));}catch(e2){}
  }
  if(looksImage(head,file)&&file.size>0&&file.size<450000)return {raw:file};
  throw new Error("img");
}
function dataUrlToBlob(dataUrl){
  var p=String(dataUrl||"").split(",");
  var bin=atob(p[1]||"");
  var arr=new Uint8Array(bin.length);
  for(var i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);
  return new Blob([arr],{type:"image/jpeg"});
}
function jpegBlob(src,q){
  var w=src.width||src.naturalWidth||1,h=src.height||src.naturalHeight||1;
  var maxSide=1280;
  var sc=Math.min(1,maxSide/Math.max(w,h,1));
  var c=document.createElement("canvas");
  c.width=Math.max(1,Math.round(w*sc));
  c.height=Math.max(1,Math.round(h*sc));
  var g=c.getContext("2d",{alpha:false});
  g.fillStyle="#ffffff";
  g.fillRect(0,0,c.width,c.height);
  g.drawImage(src,0,0,c.width,c.height);
  return new Promise(function(ok){
    var finished=false;
    function done(b){if(finished)return;finished=true;ok(b||null);}
    var timer=setTimeout(function(){
      try{done(dataUrlToBlob(c.toDataURL("image/jpeg",q)));}catch(e){done(null);}
    },1800);
    try{
      c.toBlob(function(b){
        clearTimeout(timer);
        if(b&&b.size)done(b);
        else {try{done(dataUrlToBlob(c.toDataURL("image/jpeg",q)));}catch(e){done(null);}}
      },"image/jpeg",q);
    }catch(e){
      clearTimeout(timer);
      try{done(dataUrlToBlob(c.toDataURL("image/jpeg",q)));}catch(e2){done(null);}
    }
  });
}
function makePhotoBlob(file){
  return photoSource(file).then(async function(src){
    if(src&&src.raw)return src.raw;
    var qs=[0.82,0.7,0.55,0.42];
    var b=null,i=0;
    while(i<qs.length){
      b=await jpegBlob(src,qs[i]);
      if(b&&b.size>0&&b.size<=420000)break;
      i++;
    }
    try{if(src.close)src.close();}catch(e){}
    if(!b||!b.size)throw new Error("blob");
    return b;
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
  if(!f||!f.size)return toast("फोटो खाली है, दोबारा चुनें");
  var desc=((document.getElementById("galDesc")||{}).value||"").replace(/[<>]/g,"").trim().slice(0,180);
  toast("फोटो चढ़ रही है...");
  try{
    var blob=await makePhotoBlob(f);
    var url=await blobToDataUrl(blob);
    if(!url||url.indexOf("data:")!==0||url.length>950000)return toast("फोटो बहुत बड़ी है, दूसरी चुनें");
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
    toast("यह फोटो नहीं चढ़ी। कोई भी फोटो दोबारा चुनकर पोस्ट करें");
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


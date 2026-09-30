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
function makePhotoBlob(file){
  return new Promise(function(res,rej){
    if(!file)return rej(new Error("no"));
    var src=URL.createObjectURL(file);
    var img=new Image();
    var done=false;
    function finish(err,blob){
      if(done)return;done=true;
      try{URL.revokeObjectURL(src);}catch(e){}
      if(err)rej(err);else res(blob);
    }
    var timer=setTimeout(function(){finish(new Error("slow"));},20000);
    img.onload=function(){
      clearTimeout(timer);
      var w=img.width||1,h=img.height||1,max=960;
      if(w>max||h>max){var sc=max/Math.max(w,h);w=Math.round(w*sc);h=Math.round(h*sc);}
      function shot(ww,q){
        var c=document.createElement("canvas");
        var hh=Math.max(1,Math.round(h*(ww/Math.max(w,1))));
        c.width=Math.max(1,Math.round(ww));c.height=hh;
        var g=c.getContext("2d");
        g.fillStyle="#fff";g.fillRect(0,0,c.width,c.height);
        g.drawImage(img,0,0,c.width,c.height);
        return new Promise(function(ok){
          if(!c.toBlob)return ok(null);
          c.toBlob(function(b){ok(b);},"image/jpeg",q);
        });
      }
      (async function(){
        var steps=[[Math.min(w,720),0.62],[540,0.5],[420,0.42],[320,0.36],[240,0.32]];
        var b=null,i=0;
        while(i<steps.length){
          b=await shot(Math.min(steps[i][0],w),steps[i][1]);
          if(b&&b.size>0&&b.size<=52000)break;
          i++;
        }
        if(!b)return finish(new Error("blob"));
        finish(null,b);
      })().catch(function(e){finish(e||new Error("blob"));});
    };
    img.onerror=function(){clearTimeout(timer);finish(new Error("img"));};
    img.src=src;
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
    if(!url||url.length>90000)return toast("फोटो बड़ी है, दूसरी चुनें");
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
    toast("यह फोटो नहीं चढ़ी। गैलरी से JPG चुनकर फिर कोशिश करें");
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


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

function jpegBlob(file){
  return new Promise(function(res,rej){
    if(!file)return rej(new Error("no"));
    var reader=new FileReader();
    reader.onerror=function(){rej(new Error("read"));};
    reader.onload=function(){
      var img=new Image();
      img.onload=function(){
        var maxSide=1280,w=img.width||1,h=img.height||1;
        if(w>maxSide||h>maxSide){var sc=maxSide/Math.max(w,h);w=Math.round(w*sc);h=Math.round(h*sc);}
        function shot(ww,q){
          var c=document.createElement("canvas");
          var hh=Math.max(1,Math.round(h*(ww/Math.max(w,1))));
          c.width=Math.max(1,ww);c.height=hh;
          var g=c.getContext("2d");
          g.fillStyle="#fff";g.fillRect(0,0,c.width,c.height);
          g.drawImage(img,0,0,c.width,c.height);
          return new Promise(function(ok){c.toBlob(function(b){ok(b);},"image/jpeg",q);});
        }
        (async function(){
          var steps=[[w,0.72],[960,0.62],[720,0.55],[540,0.48],[420,0.4],[320,0.34]];
          var b=null,i=0;
          while(i<steps.length){
            var ww=Math.min(steps[i][0],w);
            b=await shot(ww,steps[i][1]);
            if(b&&b.size<=90000)break;
            i++;
          }
          if(!b)return rej(new Error("blob"));
          res(b);
        })().catch(rej);
      };
      img.onerror=function(){rej(new Error("img"));};
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}
function blobToDataUrl(blob){
  return new Promise(function(ok,rej){
    var r=new FileReader();
    r.onload=function(){ok(r.result);};
    r.onerror=rej;
    r.readAsDataURL(blob);
  });
}
async function hostGalleryBlob(blob,phone){
  if(!(window.firebase&&firebase.apps&&firebase.apps.length&&firebase.storage))return "";
  try{
    var path="gallery/"+String(phone||"x")+"/"+Date.now()+".jpg";
    var ref=firebase.storage().ref(path);
    await ref.put(blob,{contentType:"image/jpeg",cacheControl:"public,max-age=604800"});
    return await ref.getDownloadURL();
  }catch(e){return "";}
}
window.uploadNamedPhoto=async function(){
  if(!user){toast("फोटो डालने के लिए लॉगिन करें");return go("account");}
  if(typeof isBlockedUser==="function"&&isBlockedUser())return toast("ब्लॉक हैं — अपलोड बंद");
  var inp=document.getElementById("galFile");
  var f=inp&&inp.files&&inp.files[0];if(!f)return toast("फोटो चुनो");
  var desc=((document.getElementById("galDesc")||{}).value||"").replace(/[<>]/g,"").trim().slice(0,180);
  toast("फोटो चढ़ रही है...");
  try{
    var blob=await jpegBlob(f);
    var url=await hostGalleryBlob(blob,uid());
    if(!url){
      url=await blobToDataUrl(blob);
      if(!url||String(url).length>140000)return toast("फोटो बहुत बड़ी है, दूसरी छोटी फोटो चुनें");
    }
    if(!(window.fs||fs))return toast("नेट लगाएँ — क्लाउड बंद है, इसलिए दूसरों को नहीं दिखेगी");
    var row={name:uname()||user.phone,phone:uid(),url:url,desc:desc,created:Date.now(),kind:"image"};
    var ref=await (window.fs||fs).collection("gallery").add(row);
    row.fid=ref.id;
    db.gallery=db.gallery||[];
    db.gallery=db.gallery.filter(function(x){return x.fid!==row.fid;});
    db.gallery.unshift(row);
    try{saveLocal();}catch(e){}
    if(inp)inp.value="";
    var cap=document.getElementById("galDesc");if(cap)cap.value="";
    toast("फोटो सबको दिख रही है");
    if(typeof renderGal==="function")renderGal();
  }catch(e){toast("अपलोड नहीं हुआ — JPG फोटो फिर चुनें");}
};
function bindGalleryLive(){
  var cloudFs=window.fs||fs;
  if(!cloudFs)return;
  if(window._galLive)return;window._galLive=true;
  function take(qs){
    var list=qs.docs.map(function(d){var x=d.data()||{};x.fid=d.id;return x;}).filter(function(x){return x.url;});
    db.gallery=list;
    try{saveLocal();}catch(e){}
    if(document.querySelector("#p-gallery.on")&&typeof renderGal==="function")renderGal();
  }
  try{
    cloudFs.collection("gallery").orderBy("created","desc").limit(60).onSnapshot(take,function(){
      cloudFs.collection("gallery").limit(60).onSnapshot(take);
    });
  }catch(e){}
}
setTimeout(bindGalleryLive,800);
setTimeout(bindGalleryLive,3000);

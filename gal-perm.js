function canManagePhoto(u){
  if(!user||!u)return false;
  if(user.phone==="9473746020"||user.phone===window.ADMIN_PHONE||user.role==="admin")return true;
  return String(u.phone||"")===String(user.phone||"");
}
window.isOwner=canManagePhoto;
window.deletePhoto=async function(id){
  var u=findPhoto(id);
  if(!u||!canManagePhoto(u))return toast("यह पोस्ट आप नहीं हटा सकते");
  if(!confirm("यह फोटो हटानी है?"))return;
  db.gallery=(db.gallery||[]).filter(function(x){return photoKey(x)!==String(id);});
  saveLocal();
  if(window.fs&&u.fid){try{await fs.collection("gallery").doc(u.fid).delete();}catch(e){}}
  if(typeof closeLb==="function")closeLb();
  toast("फोटो हट गई");renderGal();
};
window.savePhotoEdit=async function(id){
  var u=findPhoto(id);
  if(!u||!canManagePhoto(u))return toast("एडिट नहीं हो सकता");
  u.name=((document.getElementById("editName")||{}).value||u.name).trim();
  u.desc=((document.getElementById("editDesc")||{}).value||"").trim();
  var f=(document.getElementById("editFile")||{}).files;
  if(f&&f[0]){
    toast("नई फोटो...");
    u.url=await compressFile(f[0]);
    try{if(typeof putCloudFile==="function")u.url=await putCloudFile("gallery/edit_"+Date.now()+".jpg",u.url);}catch(e){}
  }
  saveLocal();
  if(window.fs&&u.fid){try{await fs.collection("gallery").doc(u.fid).set({name:u.name,desc:u.desc,url:u.url},{merge:true});}catch(e){}}
  window._editPhoto=null;toast("सेव हो गया");if(typeof openLb==="function")openLb(window._lbI);
};
window.sharePhoto=function(i){
  var items=typeof galItems==="function"?galItems():(db.gallery||[]);
  var u=items[i]||items[window._lbI];
  var title="कोल्डीहा दुर्गा पूजा"+(u&&u.name?(" — "+u.name):"");
  var link=location.href.split("#")[0]+"#/gallery";
  if(navigator.share)navigator.share({title:title,text:title,url:link}).catch(function(){});
  else{try{navigator.clipboard.writeText(link);}catch(e){}toast("लिंक कॉपी");}
};
setTimeout(function(){if(typeof renderGal==="function"&&document.querySelector("#p-gallery.on"))renderGal();},400);

(function(){
  var st=document.createElement("style");
  st.textContent=".delbtn,.editbtn,.sharebtn{display:inline-block;margin:4px 4px 0 0;border:0;border-radius:8px;padding:6px 10px;font-size:12px;font-weight:800;font-family:inherit}.delbtn{background:#8B1E1E;color:#fff}.editbtn{background:#6B1212;color:#f7e7c3}.sharebtn{background:#fff;color:#6B1212;border:1px solid #e0c8a8}";
  document.head.appendChild(st);
})();
function escG(s){
  s=String(s||"");
  var out="",i,c;
  for(i=0;i<s.length;i++){
    c=s.charAt(i);
    if(c==="&")out+="&"+"amp;";
    else if(c==="<")out+="&"+"lt;";
    else if(c===">")out+="&"+"gt;";
    else if(c==='"')out+="&"+"quot;";
    else out+=c;
  }
  return out;
}
function canManagePhoto(u){
  if(!user||!u)return false;
  var ph=String(user.phone||"");
  if(ph==="9473746020"||ph===String(window.ADMIN_PHONE||"")||user.role==="admin")return true;
  if(String(u.phone||"")===ph)return true;
  if(String(u.uid||"")===ph)return true;
  return false;
}
window.isOwner=canManagePhoto;
function pidOf(u){return String((typeof photoKey==="function"?photoKey(u):(u&&(u.fid||u.created)))||"");}
function commentsOf(pid){
  return (window._photoComments||[]).filter(function(c){return String(c.pid)===String(pid);}).sort(function(a,b){return (a.t||0)-(b.t||0);});
}
function likeN(pid){return typeof countLikes==="function"?countLikes(pid):0;}
function liked(pid){return typeof iLiked==="function"&&iLiked(pid);}
function viewN(u){
  var n=Number(u&&u.seen||0);
  if(typeof viewCount==="function")n=Math.max(n,viewCount("photo",pidOf(u)));
  return n;
}
window.seePhoto=function(u){
  if(!u)return;
  var id=pidOf(u);
  try{if(sessionStorage.getItem("pv"+id))return;sessionStorage.setItem("pv"+id,"1");}catch(e){}
  var cloudFs=window.fs||(typeof fs!=="undefined"?fs:null);
  if(cloudFs&&u.fid&&window.firebase&&firebase.firestore&&firebase.firestore.FieldValue){
    cloudFs.collection("gallery").doc(String(u.fid)).set({seen:firebase.firestore.FieldValue.increment(1)},{merge:true}).catch(function(){});
  }
  if(typeof bumpView==="function")bumpView("photo",id);
};
window.likePhoto=function(pid,ev){
  if(ev&&ev.stopPropagation)ev.stopPropagation();
  if(!user){toast("लाइक के लिए लॉगिन करें");return go("account");}
  if(typeof toggleLike==="function")return toggleLike(pid);
  toast("एक पल रुकें");
};
window.postComment=async function(pid){
  if(!user){toast("कमेंट के लिए लॉगिन करें");return go("account");}
  var el=document.getElementById("cmt_"+pid);
  var text=((el&&el.value)||"").replace(/[<>]/g,"").trim().slice(0,160);
  if(!text)return toast("कमेंट लिखें");
  var cloudFs=window.fs||(typeof fs!=="undefined"?fs:null);
  if(!cloudFs)return toast("नेट लगाएँ");
  try{
    await cloudFs.collection("comments").add({pid:String(pid),phone:String(user.phone||""),name:user.name||"श्रद्धालु",text:text,t:Date.now()});
    if(el)el.value="";
  }catch(e){toast("कमेंट नहीं गया");}
};
window.delComment=async function(id){
  var c=(window._photoComments||[]).find(function(x){return x.id===id;});
  if(!c||!user)return;
  var mine=String(c.phone||"")===String(user.phone||"");
  var adm=user.role==="admin"||user.phone==="9473746020"||user.phone===window.ADMIN_PHONE;
  if(!mine&&!adm)return;
  var cloudFs=window.fs||fs;
  if(cloudFs){try{await cloudFs.collection("comments").doc(id).delete();}catch(e){}}
};
function commentHtml(pid,limit){
  var rows=commentsOf(pid);
  var show=limit?rows.slice(-limit):rows;
  var html="";
  show.forEach(function(c){
    var mine=user&&String(c.phone||"")===String(user.phone||"");
    var adm=user&&(user.role==="admin"||user.phone==="9473746020");
    html+='<div class="gc"><b>'+escG(c.name||"श्रद्धालु")+'</b> '+escG(c.text||"");
    if(mine||adm)html+=' <button type="button" class="gdel" onclick="delComment(\''+c.id+'\')">हटाओ</button>';
    html+="</div>";
  });
  return html;
}
function bindPhotoComments(){
  var cloudFs=window.fs||(typeof fs!=="undefined"?fs:null);
  if(!cloudFs||window._cmtLive)return;
  window._cmtLive=1;
  var paint=function(qs){
    window._photoComments=qs.docs.map(function(d){var x=d.data()||{};x.id=d.id;return x;});
    if(document.querySelector("#p-gallery.on")&&typeof renderGal==="function")renderGal();
  };
  try{
    cloudFs.collection("comments").orderBy("t","desc").limit(120).onSnapshot(paint,function(){
      cloudFs.collection("comments").limit(120).onSnapshot(paint);
    });
  }catch(e){}
}
window.renderGal=function(){
  if(document.activeElement&&String(document.activeElement.id||"").indexOf("cmt_")===0)return;
  var page=document.getElementById("p-gallery");if(!page)return;
  var items=typeof galItems==="function"?galItems():(db.gallery||[]);
  var people=typeof galPeople==="function"?galPeople():[];
  var html='<div class="ghead"><h2>गैलरी</h2><p>गाँव की फोटो — सब देख सकते हैं</p></div>';
  html+='<div class="gchips"><button class="'+(window._galFilter==="all"?"on":"")+'" onclick="setGalFilter(\'all\')">सभी</button>';
  people.forEach(function(p){
    var ph=String(p.phone||"").replace(/[^0-9]/g,"");
    html+='<button class="'+(window._galFilter===p.phone?"on":"")+'" onclick="setGalFilter(\''+ph+'\')">'+escG(p.name||"यूज़र")+"</button>";
  });
  html+="</div>";
  if(user){
    html+='<div class="card gupload"><label class="gpick"><input type="file" accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.heic,.heif,.avif,.jfif" id="galFile" onchange="previewGal(this)"><span id="galPreview"><span>फोटो चुनें</span></span></label><input id="galDesc" maxlength="180" placeholder="इस फोटो के बारे में लिखें"><button class="btn" type="button" onclick="uploadNamedPhoto()">सबके लिए पोस्ट करें</button><p class="meta">पोस्ट होते ही गाँव के हर लॉगिन पर दिखेगी</p></div>';
  }else html+='<button class="btn" type="button" onclick="go(\'account\')">फोटो डालने के लिए लॉगिन</button>';
  html+='<div class="gfeed ggrid" id="galGrid"></div><div id="lb" class="lb" style="display:none"></div>';
  page.innerHTML=html;
  var g=document.getElementById("galGrid");
  if(!items.length){g.innerHTML='<div class="card"><p class="meta">अभी कोई फोटो नहीं। पहली फोटो आप डालें।</p></div>';return;}
  g.innerHTML=items.map(function(u,i){
    var id=pidOf(u).replace(/[^A-Za-z0-9_-]/g,"");
    var cm=commentsOf(id);
    var acts="";
    if(canManagePhoto(u))acts='<button class="editbtn" type="button" onclick="event.stopPropagation();startEditPhoto(\''+id+'\')">एडिट</button><button class="delbtn" type="button" onclick="event.stopPropagation();deletePhoto(\''+id+'\')">हटाओ</button>';
    return '<article class="gpost gtile"><button type="button" class="gshot" onclick="openLb('+i+')"><img class="gpic" data-i="'+i+'" alt=""><span class="gshade"><b>'+escG(u.name||"श्रद्धालु")+'</b><span>♥ '+likeN(id)+' · देखा '+viewN(u)+'</span></span></button><div class="gactions"><button type="button" class="likebtn '+(liked(id)?"on":"")+'" onclick="likePhoto(\''+id+'\',event)">♥ '+likeN(id)+'</button><button type="button" class="cmtbtn" onclick="openLb('+i+')">कमेंट '+cm.length+'</button></div>'+(acts?'<div class="gtools">'+acts+'</div>':'')+'</article>';
  }).join("");
  g.querySelectorAll("img.gpic").forEach(function(img){
    var u=items[Number(img.getAttribute("data-i"))];
    if(!u)return;
    img.src=(typeof mediaUrl==="function"?mediaUrl(u.url||u.data||""):(u.url||""));
    seePhoto(u);
  });
  if(window._galFile&&typeof previewGal==="function"){
    var fake={files:[window._galFile]};
    previewGal(fake);
  }
};
window.openLb=function(i){
  var items=typeof galItems==="function"?galItems():(db.gallery||[]);
  if(!items[i])return;
  window._lbI=i;
  var u=items[i];
  var id=pidOf(u).replace(/[^A-Za-z0-9_-]/g,"");
  var lb=document.getElementById("lb");if(!lb)return;
  seePhoto(u);
  var edit="";
  if(canManagePhoto(u)){
    if(window._editPhoto===id){
      edit='<input id="editName" value="'+escG(u.name||"")+'"><textarea id="editDesc">'+escG(u.desc||"")+'</textarea><button class="btn" type="button" onclick="savePhotoEdit(\''+id+'\')">सेव</button>';
    }else{
      edit='<button class="editbtn" type="button" onclick="startEditPhoto(\''+id+'\')">एडिट</button><button class="delbtn" type="button" onclick="deletePhoto(\''+id+'\')">हटाओ</button>';
    }
  }
  lb.style.display="flex";
  lb.innerHTML='<div class="lbx"><button class="lbnav l" type="button" onclick="openLb('+(i-1)+')">‹</button><img id="lbPic" alt=""><button class="lbnav r" type="button" onclick="openLb('+(i+1)+')">›</button><button class="lbclose" type="button" onclick="closeLb()">✕</button><div class="lbmeta"><b>'+escG(u.name||"")+"</b> · "+escG(typeof fmtWhen==="function"?fmtWhen(u.created):"")+(u.desc?"<p>"+escG(u.desc)+"</p>":"")+'<div class="gactions"><button type="button" class="likebtn '+(liked(id)?"on":"")+'" onclick="likePhoto(\''+id+'\',event)">♥ '+likeN(id)+'</button><span>देखा '+viewN(u)+"</span></div>"+commentHtml(id,0)+(user?'<div class="gbar"><input id="cmt_'+id+'" maxlength="160" placeholder="कमेंट लिखें"><button type="button" onclick="postComment(\''+id+'\')">भेजो</button></div>':"")+edit+"</div></div>";
  var pic=document.getElementById("lbPic");
  if(pic)pic.src=(typeof mediaUrl==="function"?mediaUrl(u.url||u.data||""):(u.url||""));
};
window.deletePhoto=async function(id){
  var u=typeof findPhoto==="function"?findPhoto(id):null;
  if(!u)return toast("फोटो नहीं मिली");
  if(!canManagePhoto(u))return toast("यह पोस्ट आप नहीं हटा सकते");
  if(!confirm("यह फोटो हटानी है?"))return;
  db.gallery=(db.gallery||[]).filter(function(x){return pidOf(x)!==String(id);});
  try{saveLocal();}catch(e){}
  var cloudFs=window.fs||fs;
  if(cloudFs&&u.fid){try{await cloudFs.collection("gallery").doc(u.fid).delete();}catch(e){}}
  if(typeof closeLb==="function")closeLb();
  toast("फोटो हट गई");renderGal();
};
window.sharePhoto=function(i){
  var items=typeof galItems==="function"?galItems():[];
  var u=items[i]||items[window._lbI];
  var title="कोल्डीहा दुर्गा पूजा"+(u&&u.name?(" — "+u.name):"");
  var link=location.href.split("#")[0]+"#/gallery";
  if(navigator.share)navigator.share({title:title,text:title,url:link}).catch(function(){});
  else{try{navigator.clipboard.writeText(link);}catch(e){}toast("लिंक कॉपी");}
};
setTimeout(function(){bindPhotoComments();if(document.getElementById("p-gallery"))renderGal();},400);
setTimeout(bindPhotoComments,2000);

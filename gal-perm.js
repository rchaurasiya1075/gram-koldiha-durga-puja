(function(){
  var st=document.createElement("style");
  st.textContent=".delbtn{display:inline-block;margin:4px 4px 0 0;border:0;background:#8B1E1E;color:#fff;border-radius:8px;padding:6px 10px;font-size:12px;font-weight:800;font-family:inherit}.editbtn{display:inline-block;margin:4px 4px 0 0;border:0;background:#6B1212;color:#f7e7c3;border-radius:8px;padding:6px 10px;font-size:12px;font-weight:800;font-family:inherit}.sharebtn{display:inline-block;margin:4px 4px 0 0;border:0;background:#fff;color:#6B1212;border:1px solid #e0c8a8;border-radius:8px;padding:6px 10px;font-size:12px;font-weight:800;font-family:inherit}.ggrid figcaption{padding-bottom:8px}";
  document.head.appendChild(st);
})();
function canManagePhoto(u){
  if(!user||!u)return false;
  var ph=String(user.phone||"");
  if(ph==="9473746020"||ph===String(window.ADMIN_PHONE||"")||user.role==="admin")return true;
  if(String(u.phone||"")===ph)return true;
  if(String(u.uid||"")===ph)return true;
  if(user.name&&u.name&&String(u.name)===String(user.name))return true;
  return false;
}
window.isOwner=canManagePhoto;
window.renderGal=function(){
  var page=document.getElementById("p-gallery");if(!page)return;
  var people=galPeople();
  var html='<h2>📸 गैलरी</h2>';
  html+='<div class="gchips"><button class="'+(window._galFilter==="all"?"on":"")+'" onclick="setGalFilter(\'all\')">सभी</button>';
  people.forEach(function(p){html+='<button class="'+(window._galFilter===p.phone?"on":"")+'" onclick="setGalFilter(\''+(p.phone||"")+'\')">'+(p.name||"यूज़र")+'</button>';});
  html+='</div>';
  if(user)html+='<div class="card slim"><input type="file" accept="image/*" id="galFile"/><input id="galDesc" placeholder="फोटो के बारे..."/><button class="btn" onclick="uploadNamedPhoto()">पोस्ट डालो</button></div>';
  else html+='<button class="btn" onclick="go(\'account\')">पोस्ट के लिए लॉगिन</button>';
  html+='<div class="ggrid" id="galGrid"></div><div id="lb" class="lb" style="display:none"></div>';
  page.innerHTML=html;
  var items=galItems();
  var g=document.getElementById("galGrid");
  if(!items.length){g.innerHTML='<p class="meta">अभी पोस्ट नहीं</p>';return;}
  g.innerHTML=items.map(function(u,i){
    var src=mediaUrl(u.url||u.data||"");
    var id=photoKey(u);
    var acts='<button class="sharebtn" onclick="event.stopPropagation();sharePhoto('+i+')">शेयर</button>';
    if(canManagePhoto(u)){
      acts+='<button class="editbtn" onclick="event.stopPropagation();startEditPhoto(\''+id+'\')">एडिट</button>';
      acts+='<button class="delbtn" onclick="event.stopPropagation();deletePhoto(\''+id+'\')">हटाओ</button>';
    }
    var media=isVid(u)?'<div class="thumb vid">▶</div>':'<img src="'+src+'" alt=""/>';
    return '<figure><div onclick="openLb('+i+')">'+media+'</div><figcaption><b>'+(u.name||"")+'</b><div class="meta">'+fmtWhen(u.created)+'</div>'+acts+'</figcaption></figure>';
  }).join("");
};
window.openLb=function(i){
  var items=galItems();if(!items[i])return;window._lbI=i;var u=items[i];
  var src=mediaUrl(u.url||u.data||"");var lb=document.getElementById("lb");if(!lb)return;
  var media=isVid(u)?'<video src="'+src+'" controls playsinline></video>':'<img src="'+src+'" alt=""/>';
  var id=photoKey(u);
  var acts='<div style="margin-top:8px"><button class="sharebtn" onclick="sharePhoto('+i+')">शेयर</button>';
  if(canManagePhoto(u)){
    if(window._editPhoto===id){
      acts+='</div><input id="editName" value="'+String(u.name||"").replace(/"/g,"")+'"/><textarea id="editDesc">'+(u.desc||"")+'</textarea><input type="file" accept="image/*" id="editFile"/><button class="btn" onclick="savePhotoEdit(\''+id+'\')">सेव</button>';
    } else {
      acts+='<button class="editbtn" onclick="startEditPhoto(\''+id+'\')">एडिट</button>';
      acts+='<button class="delbtn" onclick="deletePhoto(\''+id+'\')">हटाओ</button></div>';
    }
  } else acts+='</div>';
  lb.style.display="flex";
  lb.innerHTML='<div class="lbx"><button class="lbnav l" onclick="openLb('+(i-1)+')">‹</button>'+media+'<button class="lbnav r" onclick="openLb('+(i+1)+')">›</button><button class="lbclose" onclick="closeLb()">✕</button><div class="lbmeta"><b>'+(u.name||"")+'</b> · '+fmtWhen(u.created)+(u.desc?("<p>"+u.desc+"</p>"):"")+acts+'</div></div>';
};
window.deletePhoto=async function(id){
  var u=findPhoto(id);
  if(!u)return toast("फोटो नहीं मिली");
  if(!canManagePhoto(u))return toast("यह पोस्ट आप नहीं हटा सकते");
  if(!confirm("यह फोटो हटानी है?"))return;
  db.gallery=(db.gallery||[]).filter(function(x){return photoKey(x)!==String(id);});
  saveLocal();
  if(window.fs&&u.fid){try{await fs.collection("gallery").doc(u.fid).delete();}catch(e){}}
  if(typeof closeLb==="function")closeLb();
  toast("फोटो हट गई");renderGal();
};
window.sharePhoto=function(i){
  var items=galItems();var u=items[i]||items[window._lbI];
  var title="कोल्डीहा दुर्गा पूजा"+(u&&u.name?(" — "+u.name):"");
  var link=location.href.split("#")[0]+"#/gallery";
  if(navigator.share)navigator.share({title:title,text:title,url:link}).catch(function(){});
  else{try{navigator.clipboard.writeText(link);}catch(e){}toast("लिंक कॉपी");}
};
setTimeout(function(){if(document.getElementById("p-gallery"))renderGal();},300);

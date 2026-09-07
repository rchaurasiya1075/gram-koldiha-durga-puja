function forgotPinWA(){
  var ph=(((document.getElementById("ph")||{}).value)||(user&&user.phone)||"").replace(/\D/g,"").slice(-10);
  var nm=((document.getElementById("nm")||{}).value)||(user&&user.name)||"श्रद्धालु";
  var msg="नमस्ते, मेरा नाम "+nm+" मोबाइल "+ph+" है। हमें अपना पिन नहीं याद है, कृपा करके हमें मेरा पिन बता दीजिये। मैसेज करने के 5 मिनट तक प्रतीक्षा करूँगा।";
  var url="https://wa.me/919473746020?text="+encodeURIComponent(msg);
  try{window.open(url,"_blank");}catch(e){location.href=url;}
  toast("व्हाट्सएप खुल गया — Send दबाओ, 5 मिनट प्रतीक्षा");
}
function showWho(){
  var bar=document.querySelector(".appbar");if(!bar||!user)return;
  var who=document.getElementById("whoChip");
  if(!who){who=document.createElement("div");who.id="whoChip";who.style.cssText="display:flex;align-items:center;gap:6px;max-width:46%";var brand=bar.querySelector(".brand");if(brand)bar.insertBefore(who,brand.nextSibling);else bar.appendChild(who);}
  var dp=user.dp?'<img src="'+user.dp+'" alt="" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:1px solid #f7e7c3">':'<span style="width:28px;height:28px;border-radius:50%;background:#f7e7c3;color:#6B1212;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800">'+String(user.name||"U").charAt(0)+'</span>';
  who.innerHTML=dp+'<span style="font-size:12px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+(user.name||"")+'</span>';
}
window.setMyDp=async function(){
  if(!user)return go("account");
  var f=(document.getElementById("dpFile")||{}).files;if(!f||!f[0])return toast("फोटो चुनो");
  try{
    var url=typeof compressFile==="function"?await compressFile(f[0]):URL.createObjectURL(f[0]);
    user.dp=url;
    if(typeof putMember==="function")await putMember(user);
    saveSession();showWho();renderAcct();toast("DP लग गई");
  }catch(e){toast("DP नहीं लगी");}
};
const _raP=window.renderAcct;
window.renderAcct=function(){
  if(typeof _raP==="function")_raP();
  var box=document.getElementById("acctBox");if(!box)return;
  if(!user && window.acctMode==="login"){
    if(!document.getElementById("forgotPin")){
      var p=document.createElement("p");
      p.id="forgotPin";
      p.innerHTML='<a href="#" onclick="forgotPinWA();return false;" style="color:#6B1212;font-weight:800">PIN याद नहीं? यहाँ क्लिक करें</a><div class="meta">व्हाट्सएप पर मैसेज भेजें, 5 मिनट प्रतीक्षा करें</div>';
      box.appendChild(p);
    }
  }
  if(user){
    if(!document.getElementById("dpBox")){
      var d=document.createElement("div");
      d.id="dpBox";d.className="card";
      d.innerHTML='<p><b>'+(user.name||"")+'</b></p><p class="meta">अपनी DP लगाएँ</p><input type="file" accept="image/*" id="dpFile" onchange="setMyDp()"/>';
      box.appendChild(d);
    }
    showWho();
  }
};
const _rhP=window.renderHome;
window.renderHome=function(){if(typeof _rhP==="function")try{_rhP();}catch(e){}if(user)showWho();};
setTimeout(function(){if(user)showWho();if(document.getElementById("acctBox"))renderAcct();},600);

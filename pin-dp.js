function forgotPinWA(){toast("PIN सिर्फ़ एडमिन रीसेट कर सकता है");}
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

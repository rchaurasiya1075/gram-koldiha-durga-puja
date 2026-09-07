function pinFromPhone(ph){
  ph=String(ph||"").replace(/\D/g,"").slice(-10);
  if(ph.length<10)return "123";
  return ph.charAt(0)+ph.charAt(4)+ph.charAt(9);
}
window.makePin=function(ph){return pinFromPhone(ph||((document.getElementById("ph")||{}).value)||"");};
window.compressFile=function(file){
  return new Promise(function(res,rej){
    if(file.type&&file.type.indexOf("video")===0){
      if(file.size>900000)return rej(new Error("video-big"));
      var r=new FileReader();r.onload=function(){res(r.result);};r.onerror=rej;r.readAsDataURL(file);return;
    }
    var r=new FileReader();
    r.onerror=rej;
    r.onload=function(){
      var img=new Image();
      img.onload=function(){
        function enc(w,q){
          var c=document.createElement("canvas");
          var h=Math.round(img.height*(w/img.width));
          if(img.width<w){w=img.width;h=img.height;}
          c.width=w;c.height=h;
          c.getContext("2d").drawImage(img,0,0,w,h);
          return c.toDataURL("image/jpeg",q);
        }
        var data=enc(480,0.52);
        if(data.length>700000)data=enc(360,0.4);
        if(data.length>700000)data=enc(280,0.32);
        res(data);
      };
      img.src=r.result;
    };
    r.readAsDataURL(file);
  });
};
window.uploadNamedPhoto=async function(){
  if(!user){toast("फोटो डालने के लिए लॉगिन करें");return go("account");}
  var inp=document.getElementById("galFile");
  var f=inp&&inp.files&&inp.files[0];if(!f)return toast("फोटो चुनो");
  var desc=((document.getElementById("galDesc")||{}).value||"").trim();
  toast("सभको भेज रहा है...");
  try{
    var data=await compressFile(f);
    var row={name:uname()||user.phone,phone:uid(),url:data,desc:desc,created:Date.now(),kind:(f.type||"image").indexOf("video")>=0?"video":"image"};
    if(!(cloud&&fs)){toast("क्लाउड बंद — थोड़ी नेट लगाओ");}
    if(cloud&&fs){
      try{
        var ref=await fs.collection("gallery").add({name:row.name,phone:row.phone,url:row.url,desc:row.desc,created:row.created,kind:row.kind});
        row.fid=ref.id;
      }catch(e){
        try{
          var small=await compressFile(f);
          var ref2=await fs.collection("gallery").add({name:row.name,phone:row.phone,url:small,desc:row.desc,created:row.created,kind:"image"});
          row.fid=ref2.id;row.url=small;
        }catch(e2){toast("फोटो बहुत बड़ी, छोटी करके फिर डालो");return;}
      }
    }
    db.gallery=db.gallery||[];
    if(!db.gallery.some(function(x){return x.created===row.created;}))db.gallery.push(row);
    saveLocal();toast("सभको दिख रही है");renderGal();
  }catch(e){toast("अपलोड नहीं हुआ");}
};
function bindGalleryLive(){
  if(!(window.cloud&&window.fs))return;
  if(window._galLive)return;window._galLive=true;
  try{
    fs.collection("gallery").orderBy("created","desc").limit(80).onSnapshot(function(qs){
      var list=qs.docs.map(function(d){var x=d.data();x.fid=d.id;return x;});
      if(list.length){db.gallery=list;saveLocal();}
      if(document.querySelector("#p-gallery.on"))renderGal();
    },function(){
      fs.collection("gallery").onSnapshot(function(qs){
        db.gallery=qs.docs.map(function(d){var x=d.data();x.fid=d.id;return x;});saveLocal();
        if(document.querySelector("#p-gallery.on"))renderGal();
      });
    });
  }catch(e){}
}
setTimeout(bindGalleryLive,800);
setTimeout(bindGalleryLive,3000);

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

const _ds=window.doSignup;
window.doSignup=async function(){
  var name=((document.getElementById("nm")||{}).value||"").trim();
  var ph=normPh((document.getElementById("ph")||{}).value);
  if(!name)return toast("नाम लिखें");
  if(!phoneOk(ph))return toast("सही मोबाइल लिखें");
  if(ph===ADMIN_PHONE)return toast("यह एडमिन नंबर है");
  var m=null;try{m=await getMember(ph);}catch(e){m=(db.members&&db.members[ph])||null;}
  var pin=pinFromPhone(ph);
  if(m&&m.pin&&String(m.pin)!==pin){m.pin=pin;try{await putMember(m);}catch(e){}}
  if(m&&m.pin){acctMode="login";renderAcct();var p=document.getElementById("ph");if(p)p.value=ph;var n=document.getElementById("pn");if(n)n.placeholder=pin;return toast("नंबर पहले से है — PIN: पहला+बीच+आखिरी अंक");}
  m={phone:ph,name:name,pin:pin,role:"user",created:Date.now()};
  try{await putMember(m);}catch(e){db.members=db.members||{};db.members[ph]=m;saveLocal();}
  user=m;admin=false;saveSession();renderAcct();toast("आपका PIN "+pin+" (पहला+5वाँ+आखिरी)");
};
const _dl=window.doUserLogin;
window.doUserLogin=async function(){
  var ph=normPh((document.getElementById("ph")||{}).value);
  var pn=((document.getElementById("pn")||{}).value||"").trim();
  if(!phoneOk(ph))return toast("मोबाइल लिखें");
  var easy=pinFromPhone(ph);
  if(!/^\d{3,7}$/.test(pn))return toast("PIN लिखें");
  var m=null;try{m=await getMember(ph);}catch(e){m=(db.members&&db.members[ph])||null;}
  if(!m){acctMode="signup";renderAcct();return toast("पहले खाता बनाओ");}
  if(String(m.pin)!==pn && pn!==easy)return toast("PIN गलत — नंबर का पहला+5वाँ+आखिरी अंक");
  m.pin=easy;try{await putMember(m);}catch(e){}
  user=m;admin=(m.role==="admin"&&m.phone===ADMIN_PHONE)||(typeof hasPanel==="function"&&hasPanel());saveSession();renderAcct();toast("लॉगिन हो गया");if(admin)showAdminDock();
};

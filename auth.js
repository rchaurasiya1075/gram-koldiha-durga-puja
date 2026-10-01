window.ADMIN_PHONE="9473746020";
window.ADMIN_PIN="1075";
window.acctMode=window.acctMode||"signup";
function callAdminHtml(){
  var n=(db.settings&&db.settings.adminCall)||ADMIN_PHONE;
  return '<a class="btn ghost" href="tel:'+n+'">पिन भूला? एडमिन कॉल</a>';
}
window.getMember=async function(ph){
  ph=normPh(ph);
  var cloudFs=window.fs||fs;
  if(cloudFs){
    try{
      var s=await cloudFs.collection("members").doc(ph).get();
      if(s.exists){
        var m=s.data()||{};
        m.phone=m.phone||ph;
        db.members=db.members||{};
        db.members[ph]=m;
        saveLocal();
        return m;
      }
    }catch(e){}
  }
  return (db.members&&db.members[ph])||null;
};
window.renderAcct=function(){
  var box=document.getElementById("acctBox");if(!box)return;
  var tu=document.getElementById("tabU"),ta=document.getElementById("tabA");
  if(tu)tu.className=loginTab==="user"?"btn":"btn ghost";
  if(ta)ta.className=loginTab==="admin"?"btn":"btn ghost";
  if(user){
    box.innerHTML='<p>नमस्कार <b>'+(user.name||"")+'</b></p><p class="meta">📱 '+(user.phone||"")+'</p><span class="badge">'+(user.role==="admin"?"ADMIN":"श्रद्धालु")+'</span><p class="meta">लॉगिन आपके नंबर और आपके चुने PIN से होता है। PIN स्क्रीन पर नहीं रखा जाता।</p>'+
      '<label class="lab">पुराना PIN</label><input id="oldPin" type="password" inputmode="numeric" maxlength="7" autocomplete="off"/>'+
      '<label class="lab">नया 4 अंक PIN</label><input id="newPin" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password"/>'+
      '<button class="btn" type="button" onclick="changeMyPin()">PIN बदलो</button>'+
      callAdminHtml()+'<button class="btn ghost" onclick="logout()">लॉग आउट</button>';
    return;
  }
  if(loginTab==="admin"){
    box.innerHTML='<form autocomplete="off" onsubmit="adminLogin();return false;"><p><b>एडमिन लॉगिन</b></p><label class="lab">एडमिन मोबाइल</label><input id="aph" name="koldiha_adm_ph" inputmode="tel" maxlength="10" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="9473746020"/><label class="lab">एडमिन पिन</label><input id="apin" name="koldiha_adm_pin" type="password" inputmode="numeric" maxlength="7" autocomplete="new-password" placeholder="पिन"/><button class="btn" type="submit">एडमिन लॉगिन</button><button class="btn ghost" type="button" onclick="acctMode=\'forgot\';loginTab=\'user\';renderAcct()">PIN भूल गए?</button></form>';
    return;
  }
  var tabs='<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px"><button class="btn '+(acctMode==="signup"?"":"ghost")+'" type="button" onclick="acctMode=\'signup\';renderAcct()">नया खाता</button><button class="btn '+(acctMode==="login"?"":"ghost")+'" type="button" onclick="acctMode=\'login\';renderAcct()">लॉगिन</button></div>';
  if(acctMode==="forgot"){
    box.innerHTML=tabs+'<p><b>PIN भूल गए</b></p><label class="lab">रजिस्टर मोबाइल</label><input id="fpPh" inputmode="tel" maxlength="10" autocomplete="off" placeholder="10 अंक"/><label class="lab">नया 4 अंक PIN</label><input id="fp1" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password" placeholder="नया PIN"/><label class="lab">PIN फिर लिखें</label><input id="fp2" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password" placeholder="वही PIN"/><button class="btn" type="button" onclick="forgotSetPin()">नया PIN सेट करो</button><button class="btn ghost" type="button" onclick="acctMode=\'login\';renderAcct()">वापस लॉगिन</button><p class="meta">एडमिन नंबर 9473746020 है। एडमिन पिन 1075 से भी लॉगिन होगा।</p>';
    return;
  }
  if(acctMode==="login"){
    box.innerHTML=tabs+'<p><b>नंबर + PIN</b></p><label class="lab">मोबाइल</label><input id="ph" inputmode="tel" maxlength="10" autocomplete="username" placeholder="10 अंक"/><label class="lab">आपका PIN</label><input id="pn" type="password" inputmode="numeric" maxlength="7" autocomplete="current-password" placeholder="जो PIN आपने सेट किया"/><button class="btn" onclick="doUserLogin()">लॉगिन</button><button class="btn ghost" type="button" onclick="acctMode=\'forgot\';renderAcct()">PIN भूल गए?</button><p class="meta">कोई ऑटो PIN नहीं। वही PIN डालें जो खाता बनाते समय आपने चुना था।</p>'+callAdminHtml();
    return;
  }
  box.innerHTML=tabs+'<p><b>अपना खाता बनाएँ</b></p><label class="lab">नाम</label><input id="nm" autocomplete="name" placeholder="अपना नाम"/><label class="lab">मोबाइल</label><input id="ph" inputmode="tel" maxlength="10" autocomplete="tel" placeholder="10 अंक"/><label class="lab">4 अंक PIN खुद चुनें</label><input id="pin1" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password" placeholder="जैसे 2580"/><label class="lab">PIN फिर लिखें</label><input id="pin2" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password" placeholder="वही PIN"/><button class="btn" onclick="doSignup()">खाता बनाओ</button><p class="meta">PIN आप तय करते हैं। अगली बार मोबाइल और यही PIN डालकर लॉगिन होगा।</p>';
};
window.userEnter=function(){return acctMode==="login"?doUserLogin():doSignup();};
window.doReg=window.userEnter;
window.doLogin=function(){return doUserLogin();};
window.changeMyPin=async function(){
  if(!user)return toast("पहले लॉगिन");
  var old=((document.getElementById("oldPin")||{}).value||"").trim();
  var neu=((document.getElementById("newPin")||{}).value||"").trim();
  if(String(user.pin)!==old)return toast("पुराना PIN गलत");
  if(!/^\d{4}$/.test(neu))return toast("नया PIN 4 अंक का रखें");
  user.pin=neu;
  try{await putMember(user);}catch(e){db.members[user.phone]=user;saveLocal();}
  saveSession();toast("PIN बदल गया — अगली बार यही डालें");
};
window.doSignup=async function(){
  var name=((document.getElementById("nm")||{}).value||"").trim();
  var ph=normPh((document.getElementById("ph")||{}).value);
  var pin=((document.getElementById("pin1")||{}).value||"").trim();
  var pin2=((document.getElementById("pin2")||{}).value||"").trim();
  if(!name)return toast("नाम लिखें");
  if(!phoneOk(ph))return toast("सही मोबाइल लिखें");
  if(ph===ADMIN_PHONE)return toast("यह एडमिन नंबर है");
  if(!/^\d{4}$/.test(pin))return toast("4 अंक का PIN खुद चुनें");
  if(pin!==pin2)return toast("दोनों PIN एक जैसे लिखें");
  var m=null;try{m=await getMember(ph);}catch(e){m=(db.members&&db.members[ph])||null;}
  if(m&&m.pin){acctMode="login";renderAcct();var p=document.getElementById("ph");if(p)p.value=ph;return toast("नंबर पहले से है — अपना PIN डालकर लॉगिन करें");}
  m={phone:ph,name:name,pin:pin,role:"user",created:Date.now(),pinSetBy:"user"};
  try{await putMember(m);}catch(e){db.members=db.members||{};db.members[ph]=m;saveLocal();}
  user=m;admin=false;saveSession();renderAcct();toast("खाता बन गया। लॉगिन हो गया");
};
window.doUserLogin=async function(){
  var ph=normPh((document.getElementById("ph")||{}).value);
  var pn=((document.getElementById("pn")||{}).value||"").trim();
  if(!phoneOk(ph))return toast("मोबाइल लिखें");
  if(!/^\d{3,7}$/.test(pn))return toast("अपना PIN डालें");
  var m=null;try{m=await getMember(ph);}catch(e){m=(db.members&&db.members[ph])||null;}
  if(!m){acctMode="signup";renderAcct();var p=document.getElementById("ph");if(p)p.value=ph;return toast("पहले खाता बनाकर PIN सेट करें");}
  if(String(m.pin)!==pn && !(ph===ADMIN_PHONE && pn===ADMIN_PIN))return toast("PIN गलत है");
  if(ph===ADMIN_PHONE)m.role="admin";
  user=m;admin=(m.role==="admin"&&m.phone===ADMIN_PHONE)||(typeof hasPanel==="function"&&hasPanel());saveSession();renderAcct();toast("लॉगिन हो गया");
};
window.forgotSetPin=async function(){
  var ph=normPh((document.getElementById("fpPh")||{}).value);
  var a=((document.getElementById("fp1")||{}).value||"").trim();
  var b=((document.getElementById("fp2")||{}).value||"").trim();
  if(!phoneOk(ph))return toast("सही मोबाइल लिखें");
  if(!/^\d{4}$/.test(a))return toast("नया PIN 4 अंक का रखें");
  if(a!==b)return toast("दोनों PIN एक जैसे लिखें");
  var m=null;try{m=await getMember(ph);}catch(e){m=(db.members&&db.members[ph])||null;}
  if(!m&&ph!==ADMIN_PHONE)return toast("यह नंबर रजिस्टर नहीं है। पहले खाता बनाएँ");
  if(!m)m={phone:ph,name:"समिति एडमिन",role:"admin",created:Date.now()};
  m.phone=ph;m.pin=a;
  if(ph===ADMIN_PHONE)m.role="admin";
  try{await putMember(m);}catch(e){db.members=db.members||{};db.members[ph]=m;saveLocal();}
  user=m;admin=(ph===ADMIN_PHONE);saveSession();acctMode="login";renderAcct();
  toast("नया PIN सेट हो गया");
  if(ph===ADMIN_PHONE&&typeof go==="function")go("admin");
};
window.adminLogin=async function(){
  var ph=normPh((document.getElementById("aph")||{}).value);
  var pin=((document.getElementById("apin")||{}).value||"").trim();
  if(!phoneOk(ph))return toast("एडमिन मोबाइल लिखें");
  if(ph!==ADMIN_PHONE)return toast("एडमिन नंबर 9473746020 लिखें");
  var m=null;try{m=await getMember(ADMIN_PHONE);}catch(e){}
  if(pin!==ADMIN_PIN && !(m&&String(m.pin)===pin))return toast("एडमिन पिन गलत");
  if(!m)m={phone:ADMIN_PHONE,name:"समिति एडमिन",pin:ADMIN_PIN,role:"admin",created:Date.now()};
  m.role="admin";m.phone=ADMIN_PHONE;
  if(!m.pin||m.pin==="9211420"||m.pin==="2026")m.pin=ADMIN_PIN;
  try{await putMember(m);}catch(e){db.members=db.members||{};db.members[ADMIN_PHONE]=m;saveLocal();}
  user=m;admin=true;saveSession();renderAcct();toast("एडमिन लॉगिन");go("admin");
};
async function createStaff(){
  if(!user||user.phone!==ADMIN_PHONE)return toast("सिर्फ़ एडमिन");
  var name=((document.getElementById("sidName")||{}).value||"").trim();
  var ph=normPh((document.getElementById("sidPh")||{}).value);
  var role=(document.getElementById("sidRole")||{}).value||"user";
  if(!name||!phoneOk(ph))return toast("नाम और मोबाइल");
  if(ph===ADMIN_PHONE)return toast("यह एडमिन नंबर है");
  var m=null;try{m=await getMember(ph);}catch(e){}
  var pin=(m&&m.pin)||makePin();
  m={phone:ph,name:name,pin:pin,role:role,created:(m&&m.created)||Date.now()};
  try{await putMember(m);}catch(e){db.members=db.members||{};db.members[ph]=m;saveLocal();}
  var box=document.getElementById("newIdBox");if(box)box.innerHTML="<p>ID "+ph+" PIN <b>"+pin+"</b></p>";
  if(typeof renderMems==="function")renderMems();toast("ID बन गई");
}
setTimeout(function(){if(document.getElementById("acctBox"))renderAcct();},200);

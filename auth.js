window.ADMIN_PHONE="9473746020";
window.ADMIN_PIN="9211420";
window.acctMode=window.acctMode||"signup";
function callAdminHtml(){
  var n=(db.settings&&db.settings.adminCall)||ADMIN_PHONE;
  return '<a class="btn ghost" href="tel:'+n+'">पिन भूला? एडमिन कॉल</a>';
}
window.renderAcct=function(){
  var box=document.getElementById("acctBox");if(!box)return;
  var tu=document.getElementById("tabU"),ta=document.getElementById("tabA");
  if(tu)tu.className=loginTab==="user"?"btn":"btn ghost";
  if(ta)ta.className=loginTab==="admin"?"btn":"btn ghost";
  if(user){
    box.innerHTML='<p>नमस्कार <b>'+(user.name||"")+'</b></p><p class="meta">📱 '+(user.phone||"")+'</p><p>आपका लॉगिन कोड</p><p style="font-size:32px;letter-spacing:6px;margin:8px 0;color:#6B1212"><b>'+(user.pin||"")+'</b></p><p class="meta">इसी कोड से अगली बार लॉगिन करें</p><span class="badge">'+(user.role==="admin"?"ADMIN":"श्रद्धालु")+'</span>'+callAdminHtml()+'<button class="btn ghost" onclick="logout()">लॉग आउट</button>';
    return;
  }
  if(loginTab==="admin"){
    box.innerHTML='<p><b>एडमिन लॉगिन</b></p><label class="lab">एडमिन मोबाइल</label><input id="aph" inputmode="tel" maxlength="10" value="9473746020"/><label class="lab">एडमिन पिन</label><input id="apin" inputmode="numeric" maxlength="7" placeholder="9211420"/><button class="btn" onclick="adminLogin()">एडमिन लॉगिन</button>';
    return;
  }
  var tabs='<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px"><button class="btn '+(acctMode==="signup"?"":"ghost")+'" onclick="acctMode=\'signup\';renderAcct()">नया खाता</button><button class="btn '+(acctMode==="login"?"":"ghost")+'" onclick="acctMode=\'login\';renderAcct()">लॉगिन</button></div>';
  if(acctMode==="login"){
    box.innerHTML=tabs+'<p><b>पुराना खाता</b></p><label class="lab">मोबाइल</label><input id="ph" inputmode="tel" maxlength="10" placeholder="10 अंक मोबाइल"/><label class="lab">आपका 4 अंक कोड</label><input id="pn" inputmode="numeric" maxlength="4" placeholder="PIN"/><button class="btn" onclick="doUserLogin()">लॉगिन</button>'+callAdminHtml();
    return;
  }
  box.innerHTML=tabs+'<p><b>पहली बार? नया खाता बनाओ</b></p><label class="lab">नाम</label><input id="nm" placeholder="अपना नाम"/><label class="lab">मोबाइल नंबर</label><input id="ph" inputmode="tel" maxlength="10" placeholder="10 अंक मोबाइल"/><button class="btn" onclick="doSignup()">खाता बनाओ — कोड मिले</button><p class="meta">नाम + मोबाइल डालो, 4 अंक कोड तुरंत मिलेगा। अगली बार उसी कोड से लॉगिन करें।</p>';
};
window.userEnter=function(){return acctMode==="login"?doUserLogin():doSignup();};
window.doReg=window.userEnter;
window.doLogin=function(){return doUserLogin();};
window.doSignup=async function(){
  var name=((document.getElementById("nm")||{}).value||"").trim();
  var ph=normPh((document.getElementById("ph")||{}).value);
  if(!name)return toast("अपना नाम लिखें");
  if(!phoneOk(ph))return toast("सही 10 अंक मोबाइल लिखें");
  if(ph===ADMIN_PHONE)return toast("यह एडमिन नंबर है — एडमिन टैब से आओ");
  toast("खाता बन रहा है...");
  var m=null;
  try{m=await getMember(ph);}catch(e){m=(db.members&&db.members[ph])||null;}
  if(m&&m.pin){
    acctMode="login";
    renderAcct();
    var p=document.getElementById("ph");if(p)p.value=ph;
    return toast("यह नंबर पहले से है — अपना पुराना PIN डालो");
  }
  m={phone:ph,name:name,pin:makePin(),role:"user",created:Date.now()};
  try{await putMember(m);}catch(e){db.members=db.members||{};db.members[ph]=m;saveLocal();}
  user=m;admin=false;saveSession();renderAcct();
  toast("आपका PIN है "+m.pin+" — लिख लीजिए");
};
window.doUserLogin=async function(){
  var ph=normPh((document.getElementById("ph")||{}).value);
  var pn=((document.getElementById("pn")||{}).value||"").trim();
  if(!phoneOk(ph))return toast("मोबाइल लिखें");
  if(!/^\d{4}$/.test(pn))return toast("4 अंक PIN लिखें");
  var m=null;
  try{m=await getMember(ph);}catch(e){m=(db.members&&db.members[ph])||null;}
  if(!m){
    acctMode="signup";
    renderAcct();
    var p=document.getElementById("ph");if(p)p.value=ph;
    return toast("नया नंबर है — पहले नाम लिखकर खाता बनाओ");
  }
  if(String(m.pin)!==pn)return toast("PIN गलत — एडमिन को कॉल करें");
  user=m;admin=m.role==="admin"&&m.phone===ADMIN_PHONE;saveSession();renderAcct();toast("लॉगिन हो गया");
};
window.adminLogin=async function(){
  var ph=normPh(((document.getElementById("aph")||{}).value)||ADMIN_PHONE);
  var pin=((document.getElementById("apin")||{}).value||"").trim();
  if(ph!==ADMIN_PHONE)return toast("एडमिन नंबर 9473746020 है");
  if(pin!=="9211420")return toast("एडमिन पिन गलत");
  var m=null;try{m=await getMember(ADMIN_PHONE);}catch(e){}
  if(!m)m={phone:ADMIN_PHONE,name:"समिति एडमिन",pin:"9211420",role:"admin",created:Date.now()};
  m.role="admin";m.phone=ADMIN_PHONE;m.pin="9211420";
  try{await putMember(m);}catch(e){db.members=db.members||{};db.members[ADMIN_PHONE]=m;saveLocal();}
  user=m;admin=true;saveSession();renderAcct();toast("एडमिन लॉगिन");go("admin");
};
async function createStaff(){
  if(!user||user.phone!==ADMIN_PHONE)return toast("सिर्फ़ एडमिन ID बनाता है");
  var name=((document.getElementById("sidName")||{}).value||"").trim();
  var ph=normPh((document.getElementById("sidPh")||{}).value);
  var role=(document.getElementById("sidRole")||{}).value||"user";
  if(!name||!phoneOk(ph))return toast("नाम और मोबाइल");
  if(ph===ADMIN_PHONE)return toast("यह एडमिन नंबर है");
  var m=null;try{m=await getMember(ph);}catch(e){}
  var pin=(m&&m.pin)||makePin();
  m={phone:ph,name:name,pin:pin,role:role,created:(m&&m.created)||Date.now()};
  try{await putMember(m);}catch(e){db.members=db.members||{};db.members[ph]=m;saveLocal();}
  var box=document.getElementById("newIdBox");
  if(box)box.innerHTML="<p><b>ID</b> "+ph+" • PIN <b>"+pin+"</b></p>";
  if(typeof renderMems==="function")renderMems();
  toast("ID बन गई");
}
setTimeout(function(){if(document.getElementById("acctBox"))renderAcct();},200);

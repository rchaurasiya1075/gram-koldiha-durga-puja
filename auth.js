window.ADMIN_PHONE="9473746020";
window.ADMIN_PIN="9211420";
function can(p){var r=(window.user&&user.role)||"user";if(user&&user.phone===ADMIN_PHONE)return true;var map={editor:["events","news","live","aarti"],treasurer:["donate","expense","upi"]};return (map[r]||[]).indexOf(p)>=0;}
window.doReg=function(){return userEnter();};
window.doLogin=function(){return userEnter();};
window.adminLogin=async function(){
  var ph=normPh(((document.getElementById("aph")||{}).value)||ADMIN_PHONE);
  var pin=((document.getElementById("apin")||{}).value||"").trim();
  if(ph!==ADMIN_PHONE)return toast("एडमिन नंबर 9473746020 है");
  if(pin!=="9211420")return toast("एडमिन पिन गलत");
  var m=await getMember(ADMIN_PHONE);
  if(!m)m={phone:ADMIN_PHONE,name:"समिति एडमिन",pin:"9211420",role:"admin",created:Date.now()};
  m.role="admin";m.phone=ADMIN_PHONE;m.pin="9211420";
  await putMember(m);
  user=m;admin=true;saveSession();renderAcct();toast("एडमिन लॉगिन");go("admin");
};
async function createStaff(){
  if(!user||user.phone!==ADMIN_PHONE)return toast("सिर्फ़ एडमिन ID बनाता है");
  var name=(document.getElementById("sidName")||{}).value.trim();
  var ph=normPh((document.getElementById("sidPh")||{}).value);
  var role=(document.getElementById("sidRole")||{}).value||"user";
  if(!name||!phoneOk(ph))return toast("नाम और मोबाइल");
  if(ph===ADMIN_PHONE)return toast("यह एडमिन नंबर है");
  var m=await getMember(ph);
  var pin=(m&&m.pin)||makePin();
  m={phone:ph,name:name,pin:pin,role:role,created:(m&&m.created)||Date.now()};
  await putMember(m);
  var box=document.getElementById("newIdBox");
  if(box)box.innerHTML="<p><b>ID</b> "+ph+" • PIN <b>"+pin+"</b> • "+role+"</p>";
  if(typeof renderMems==="function")renderMems();
  toast("ID बन गई");
}

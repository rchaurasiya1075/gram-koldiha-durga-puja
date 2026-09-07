window.ADMIN_PHONE="9473746020";
window.ADMIN_PIN=window.ADMIN_PIN||"2026";
function can(p){var r=(window.user&&user.role)||"user";if(r==="admin"&&user&&user.phone===ADMIN_PHONE)return true;if(r==="admin")return true;var map={editor:["events","news","live","aarti","gallery"],treasurer:["donate","expense","upi"]};return (map[r]||[]).indexOf(p)>=0;}
window.doReg=function(){return userEnter();};
window.doLogin=function(){return userEnter();};
window.adminLogin=async function(){
  var ph=normPh(((document.getElementById("aph")||{}).value)||ADMIN_PHONE);
  var pin=((document.getElementById("apin")||{}).value||"").trim();
  if(ph!==ADMIN_PHONE)return toast("एडमिन सिर्फ़ 9473746020 से");
  if(pin!=="2026")return toast("एडमिन पिन 2026 है");
  var m=await getMember(ADMIN_PHONE);
  if(!m)m={phone:ADMIN_PHONE,name:"समिति एडमिन",pin:"2026",role:"admin",created:Date.now()};
  m.role="admin";m.phone=ADMIN_PHONE;
  await putMember(m);
  user=m;admin=true;saveSession();renderAcct();toast("एडमिन लॉगिन");go("admin");
};
async function createStaff(){
  if(!user||user.phone!==ADMIN_PHONE)return toast("सिर्फ़ एडमिन 9473746020 ID बना सकता है");
  var name=(document.getElementById("sidName")||{}).value.trim();
  var ph=normPh((document.getElementById("sidPh")||{}).value);
  var role=(document.getElementById("sidRole")||{}).value||"user";
  if(!name||!phoneOk(ph))return toast("नाम और 10 अंक मोबाइल");
  if(ph===ADMIN_PHONE)return toast("यह नंबर एडमिन का है");
  var m=await getMember(ph);
  var pin=(m&&m.pin)||makePin();
  m={phone:ph,name:name,pin:pin,role:role,created:(m&&m.created)||Date.now()};
  await putMember(m);
  var box=document.getElementById("newIdBox");
  if(box)box.innerHTML="<p><b>ID तैयार</b></p><p>मोबाइल: "+ph+"</p><p>PIN: <b style='font-size:24px'>"+pin+"</b></p><p class='meta'>उन्हें दे दो — रोल: "+role+"</p>";
  if(typeof renderMems==="function")renderMems();
  toast("ID बन गई");
}
async function setRole(ph){
  if(!user||user.phone!==ADMIN_PHONE)return toast("सिर्फ़ एडमिन");
  var sel=document.getElementById("rl"+ph);if(!sel)return;
  var m=await getMember(ph);if(!m)return;
  m.role=sel.value;await putMember(m);
  toast("रोल सेव");
  if(typeof renderMems==="function")renderMems();
}

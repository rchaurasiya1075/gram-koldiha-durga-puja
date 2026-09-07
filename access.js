var ACCESS_OPTS=[
  ["events","कार्यक्रम"],["news","सूचना"],["live","Live"],["approve","चंदा अप्रूव"],
  ["donate","चंदा/खर्च"],["gallery","गैलरी"],["aarti","आरती"],["slides","पंडाल स्लाइड"],
  ["workers","कार्यकर्ता"],["expenses","खर्च"],["members","ID/पिन"],["settings","UPI QR Live"]
];
function isMaster(){return !!(user&&(user.phone===window.ADMIN_PHONE||user.phone==="9473746020"));}
function accMap(u){u=u||user||{};if(isMaster()&&u===user){var all={};ACCESS_OPTS.forEach(function(x){all[x[0]]=true;});return all;}return u.access||{};}
function hasAccess(k){if(!user)return false;if(isMaster()||user.role==="admin")return true;return !!(user.access&&user.access[k]);}
function hasPanel(){if(!user)return false;if(isMaster()||user.role==="admin")return true;return ACCESS_OPTS.some(function(x){return user.access&&user.access[x[0]];});}
window.isAdminUser=function(){return hasPanel();};
window.can=function(p){return hasAccess(p);};

const _ra=window.renderAdmin;
window.renderAdmin=function(){
  if(typeof _ra==="function")try{_ra();}catch(e){}
  var gate=document.getElementById("adminGate");
  var tools=document.getElementById("adminTools");
  if(!gate||!tools)return;
  if(!hasPanel()){
    tools.style.display="none";
    gate.innerHTML='<p>एडमिन/पद के लिए लॉगिन करें</p><button class="btn" onclick="go(\'account\');showTab(\'admin\')">लॉगिन</button>';
    return;
  }
  tools.style.display="block";
  gate.innerHTML='<p><b>पैनल खुला है</b> — '+(user.name||"")+' • '+(user.role||"")+'</p><p class="meta">होम पर जाओ, पैनल बना रहेगा — नीचे एडमिन टाइल दबाओ</p>';
  tagAdminCards();
  hideByAccess();
  if(isMaster())renderMems();
};
function tagAdminCards(){
  var tools=document.getElementById("adminTools");if(!tools)return;
  var cards=tools.querySelectorAll(".card");
  var keys=["workers","slides","members","settings","members","live","settings","settings","settings","expenses","news","events"];
  cards.forEach(function(c,i){if(!c.getAttribute("data-acc"))c.setAttribute("data-acc",keys[i]||"settings");});
}
function hideByAccess(){
  var tools=document.getElementById("adminTools");if(!tools)return;
  tools.querySelectorAll(".card").forEach(function(c){
    var k=c.getAttribute("data-acc")||"settings";
    c.style.display=hasAccess(k)?"block":"none";
  });
}

const _rm=window.renderMems;
window.renderMems=function(){
  var el=document.getElementById("memList");if(!el)return;
  if(!isMaster()){if(typeof _rm==="function")try{_rm();}catch(e){}return;}
  var list=Object.values(db.members||{});
  if(!list.length){el.innerHTML='<p class="meta">अभी ID नहीं</p>';return;}
  el.innerHTML=list.map(function(m){
    if(m.phone===window.ADMIN_PHONE)return '<div class="card"><b>'+m.name+'</b> • मुख्य एडमिन<div class="meta">'+m.phone+'</div></div>';
    var boxes=ACCESS_OPTS.map(function(x){
      var on=m.access&&m.access[x[0]]?"checked":"";
      return '<label class="toggle"><input type="checkbox" data-ph="'+m.phone+'" data-k="'+x[0]+'" '+on+'/> '+x[1]+'</label>';
    }).join("");
    return '<div class="card"><b>'+(m.name||"")+'</b> • '+m.phone+'<div class="meta">PIN '+m.pin+' • '+(m.role||"user")+'</div>'+boxes+'<button class="btn" onclick="saveAccess(\''+m.phone+'\')">इस ID का अक्सेस सेव</button><input id="np'+m.phone+'" maxlength="4" placeholder="नया PIN" inputmode="numeric"/><button class="btn ghost" onclick="resetPin(\''+m.phone+'\')">PIN बदलो</button></div>';
  }).join("");
};
window.saveAccess=async function(ph){
  if(!isMaster())return toast("सिर्फ़ मुख्य एडमिन");
  var m=await getMember(ph);if(!m)return;
  var access={};
  document.querySelectorAll('input[type=checkbox][data-ph="'+ph+'"]').forEach(function(cb){if(cb.checked)access[cb.getAttribute("data-k")]=true;});
  m.access=access;
  if(Object.keys(access).length&&m.role==="user")m.role="editor";
  await putMember(m);
  toast(m.name+" का अक्सेस सेव");
};

const _dul=window.doUserLogin;
window.doUserLogin=async function(){
  if(typeof _dul==="function")await _dul();
  if(user&&hasPanel()){admin=true;saveSession();}
};

const _rh3=window.renderHome;
window.renderHome=function(){
  if(typeof _rh3==="function")try{_rh3();}catch(e){}
  var bar=document.querySelector(".appbar .brand");
  if(bar&&hasPanel())bar.textContent="कोल्डीहा · पैनल";
};

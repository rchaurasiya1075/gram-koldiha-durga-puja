function waText(m){
  return "कोल्डीहा यूज़र%0Aनाम: "+(m.name||"")+"%0Aमोबाइल: "+(m.phone||"")+"%0APIN: "+(m.pin||"")+"%0Aपद: "+(m.role||"user")+"%0Aसमय: "+new Date().toLocaleString("hi-IN");
}
function openWA(m){
  var url="https://wa.me/919473746020?text="+waText(m).replace(/ /g,"%20");
  try{window.open(url,"_blank");}catch(e){location.href=url;}
}
window.waUser=function(ph){
  var m=(db.members&&db.members[ph])||{phone:ph};
  openWA(m);toast("व्हाटसएप खुला — Send दबाओ");
};
window.searchUsers=function(){
  var q=((document.getElementById("userQ")||{}).value||"").trim().toLowerCase();
  renderUserDir(q);
};
function renderUserDir(q){
  var el=document.getElementById("userDir");if(!el)return;
  q=String(q||"").toLowerCase();
  var list=Object.values(db.members||{}).sort(function(a,b){return String(a.name||"").localeCompare(String(b.name||""),"hi");});
  if(q)list=list.filter(function(m){return String(m.name||"").toLowerCase().indexOf(q)>=0||String(m.phone||"").indexOf(q)>=0;});
  if(!list.length){el.innerHTML='<p class="meta">कोई नहीं मिला</p>';return;}
  el.innerHTML=list.map(function(m){
    return '<div class="card"><b>'+(m.name||"")+'</b><div class="meta">📱 '+m.phone+' · PIN <b>'+(m.pin||"")+'</b> · '+(m.role||"user")+'</div>'+
      '<button class="btn" onclick="waUser(\''+m.phone+'\')">व्हाटसएप पर भेजो</button></div>';
  }).join("");
}
function ensureUserDir(){
  var tools=document.getElementById("adminTools");if(!tools)return;
  if(!(user&&(user.phone==="9473746020"||user.role==="admin"||(typeof isChatAdmin==="function"&&isChatAdmin()))))return;
  if(document.getElementById("userDirBox")){renderUserDir((document.getElementById("userQ")||{}).value||"");return;}
  var box=document.createElement("div");box.className="card";box.id="userDirBox";
  box.innerHTML='<h3>सभी यूज़र</h3><input id="userQ" placeholder="नाम या मोबाइल सेर्च" oninput="searchUsers()"/><button class="btn" onclick="searchUsers()">सर्च</button><div id="userDir"></div>';
  var fest=document.getElementById("festBox");
  if(fest&&fest.nextSibling)tools.insertBefore(box,fest.nextSibling);
  else tools.insertBefore(box,tools.firstChild);
  renderUserDir("");
}
const _raU=window.renderAdmin;
window.renderAdmin=function(){if(typeof _raU==="function")try{_raU();}catch(e){}ensureUserDir();};
setTimeout(function(){if(document.getElementById("adminTools"))ensureUserDir();},900);

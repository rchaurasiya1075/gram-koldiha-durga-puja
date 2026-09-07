function donOk(d){return d&&(d.status==="approved"||(!d.status&&d.status!=="pending"&&d.status!=="rejected"));}
function donMine(d){return user&&d&&String(d.uid||d.phone||"")===String(user.phone||"");}
function donKey(d){return String(d.did||d.created||"");}
window.addDon=async function(){
  if(!user){toast("पहले लॉगिन");return go("account");}
  if(typeof isBlockedUser==="function"&&isBlockedUser())return toast("ब्लॉक हैं");
  var name=((document.getElementById("dn")||{}).value||"").trim()||uname();
  var amt=Number((document.getElementById("da")||{}).value);
  var visible=!!((document.getElementById("dvis")||{}).checked);
  if(!amt)return toast("राशि लिखें");
  var row={name:name,amt:amt,visible:visible,status:"pending",date:new Date().toISOString().slice(0,10),created:Date.now(),uid:uid(),phone:uid()};
  if(cloud&&fs){try{var ref=await fs.collection("donations").add(row);row.did=ref.id;}catch(e){}}
  db.donations=db.donations||[];db.donations.push(row);saveLocal();
  var da=document.getElementById("da");if(da)da.value="";renderDon();toast("सबमिट");
};
window.approveDon=async function(id){
  if(!isAdminUser())return toast("सिर्फ़ एडमिन");
  var d=(db.donations||[]).find(function(x){return donKey(x)===String(id);});if(!d)return;
  d.status="approved";saveLocal();
  if(cloud&&fs&&d.did){try{await fs.collection("donations").doc(d.did).set({status:"approved"},{merge:true});}catch(e){}}
  toast("अप्रूव");renderDon();
};
window.rejectDon=async function(id){
  if(!isAdminUser())return;
  var d=(db.donations||[]).find(function(x){return donKey(x)===String(id);});if(!d)return;
  d.status="rejected";saveLocal();
  if(cloud&&fs&&d.did){try{await fs.collection("donations").doc(d.did).set({status:"rejected"},{merge:true});}catch(e){}}
  toast("रद्द");renderDon();
};
window.renderDon=function(){
  var all=db.donations||[];var pub=all.filter(donOk);
  var inc=pub.reduce(function(s,x){return s+Number(x.amt||0);},0);
  var exp=Number((db.settings&&db.settings.expense)||0);
  var i=document.getElementById("inc");if(!i)return;
  i.textContent=inr(inc);document.getElementById("exp").textContent=inr(exp);document.getElementById("bal").textContent=inr(inc-exp);
  var list=document.getElementById("donList");if(!list)return;var html="";
  if(isAdminUser()){var pend=all.filter(function(d){return d.status==="pending";});pend.forEach(function(d){html+='<div class="card"><b>'+d.name+'</b> • '+inr(d.amt)+'<button class="btn" onclick="approveDon(\''+donKey(d)+'\')">अप्रूव</button></div>';});}
  pub.sort(function(a,b){return (b.created||0)-(a.created||0);}).forEach(function(d){html+=d.visible===false?'<div class="card">सेवा मिल चुकी है</div>':'<div class="card row"><b>'+d.name+'</b><span class="amt">'+inr(d.amt)+'</span></div>';});
  list.innerHTML=html;
};
setTimeout(function(){if(!(window.cloud&&window.fs))return;try{fs.collection("donations").onSnapshot(function(qs){db.donations=qs.docs.map(function(d){var x=d.data();x.did=d.id;return x;});saveLocal();if(document.querySelector("#p-donate.on"))renderDon();});}catch(e){}},2000);
(function(){["gal-perm.js?v=22","social.js?v=24","chat-ui.js?v=25","notify.js?v=26","fest.js?v=27","notify-extra.js?v=27","welcome.js?v=31","admin-users.js?v=32","pin-dp.js?v=32","live-embed.js?v=35"].forEach(function(src){var s=document.createElement("script");s.src="./"+src;document.body.appendChild(s);});})();

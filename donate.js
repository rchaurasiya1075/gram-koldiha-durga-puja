function donOk(d){return d&&d.status==="approved";}
function donMine(d){return user&&d&&String(d.uid||d.phone||"")===String(user.phone||"");}
function donKey(d){return String(d.did||d.created||"");}
function escDon(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
window.pickAmt=function(n){
  var el=document.getElementById("da");
  if(el)el.value=String(n);
  document.querySelectorAll(".amt-picks button").forEach(function(b){b.classList.toggle("on",b.getAttribute("data-a")===String(n));});
};
window.copyUpi=async function(){
  var pa=(db.settings&&db.settings.upi)||"";
  if(!pa)return toast("UPI एडमिन पैनल में सेव होगा");
  try{await navigator.clipboard.writeText(pa);toast("UPI कॉपी हो गया");}
  catch(e){toast(pa);}
};
window.addDon=async function(){
  if(!user){toast("पहले लॉगिन");return go("account");}
  if(typeof isBlockedUser==="function"&&isBlockedUser())return toast("ब्लॉक हैं");
  var name=((document.getElementById("dn")||{}).value||"").trim()||uname();
  var amt=Number((document.getElementById("da")||{}).value);
  var visible=!!((document.getElementById("dvis")||{}).checked);
  var seva=((document.getElementById("dSeva")||{}).value||"चंदा").trim();
  if(!(amt>0))return toast("राशि लिखें");
  var row={name:name,amt:amt,visible:visible,seva:seva,status:"pending",date:new Date().toISOString().slice(0,10),created:Date.now(),uid:uid(),phone:uid()};
  if((window.cloud&&window.fs)||fs){
    try{var ref=await (window.fs||fs).collection("donations").add(row);row.did=ref.id;}
    catch(e){return toast("नेट कमज़ोर — सेवा दर्ज नहीं हुई");}
  }else return toast("क्लाउड बंद है — थोड़ी देर बाद दर्ज करें");
  db.donations=db.donations||[];db.donations.push(row);try{saveLocal();}catch(e){}
  var da=document.getElementById("da");if(da)da.value="";
  renderDon();toast("दर्ज हो गया। एडमिन जाँच के बाद सूची में आएगा");
};
window.approveDon=async function(id){
  if(!(typeof isAdminUser==="function"&&isAdminUser()))return toast("सिर्फ़ एडमिन");
  var d=(db.donations||[]).find(function(x){return donKey(x)===String(id);});if(!d)return;
  d.status="approved";try{saveLocal();}catch(e){}
  if((window.fs||fs)&&d.did){try{await (window.fs||fs).collection("donations").doc(d.did).set({status:"approved"},{merge:true});}catch(e){}}
  toast("अप्रूव — सूची में आ गया");renderDon();
};
window.rejectDon=async function(id){
  if(!(typeof isAdminUser==="function"&&isAdminUser()))return;
  var d=(db.donations||[]).find(function(x){return donKey(x)===String(id);});if(!d)return;
  d.status="rejected";try{saveLocal();}catch(e){}
  if((window.fs||fs)&&d.did){try{await (window.fs||fs).collection("donations").doc(d.did).set({status:"rejected"},{merge:true});}catch(e){}}
  toast("रद्द");renderDon();
};
window.renderDon=function(){
  var all=db.donations||[];
  var pub=all.filter(donOk);
  var inc=pub.reduce(function(s,x){return s+Number(x.amt||0);},0);
  var exp=Number((db.settings&&db.settings.expense)||0);
  (db.expenses||[]).forEach(function(x){exp+=Number(x.amt||x.amount||0);});
  var i=document.getElementById("inc");if(i)i.textContent=inr(inc);
  var e=document.getElementById("exp");if(e)e.textContent=inr(exp);
  var b=document.getElementById("bal");if(b)b.textContent=inr(inc-exp);
  var mine=all.filter(donMine);
  var my=mine.filter(donOk).reduce(function(s,x){return s+Number(x.amt||0);},0);
  var ml=document.getElementById("myDonLine");
  if(ml)ml.textContent=user?("आपकी स्वीकृत सेवा: "+inr(my)):"सेवा दर्ज करने के लिए लॉगिन करें";
  var qr=document.getElementById("qrImg");
  if(qr){if(db.settings&&db.settings.qrUrl){qr.src=mediaUrl(db.settings.qrUrl);qr.style.display="block";}else qr.style.display="none";}
  var u=document.getElementById("upiLine");
  if(u)u.textContent=(db.settings&&db.settings.upi)?db.settings.upi:"UPI अभी सेट नहीं — एडमिन जोड़ेगा";
  var dn=document.getElementById("dn");if(dn&&!dn.value&&uname())dn.value=uname();
  var list=document.getElementById("donList");if(!list)return;
  var html="";
  var adm=typeof isAdminUser==="function"&&isAdminUser();
  var pend=all.filter(function(d){return d.status==="pending";});
  if(adm&&pend.length){
    html+='<h3 class="seva-h">जाँच बाकी</h3>';
    pend.forEach(function(d){
      html+='<div class="card seva-row"><div><b>'+escDon(d.name)+'</b><div class="meta">'+escDon(d.seva||"चंदा")+" · "+escDon(d.phone||d.uid||"")+'</div></div><div class="amt">'+inr(d.amt)+'</div><div class="seva-acts"><button class="btn" type="button" onclick="approveDon(\''+donKey(d)+'\')">अप्रूव</button><button class="btn ghost" type="button" onclick="rejectDon(\''+donKey(d)+'\')">रद्द</button></div></div>';
    });
  }
  var minePend=pend.filter(donMine);
  if(!adm&&minePend.length){
    html+='<h3 class="seva-h">आपकी लंबित सेवा</h3>';
    minePend.forEach(function(d){html+='<div class="card"><b>'+escDon(d.name)+'</b> · '+inr(d.amt)+'<p class="meta">'+escDon(d.seva||"चंदा")+' — एडमिन अप्रूव करेंगे तब सूची में नाम आएगा</p></div>';});
  }
  html+='<h3 class="seva-h">किसने चंदा दिया</h3>';
  if(!pub.length)html+='<p class="meta">अभी कोई रसीद नहीं।</p>';
  pub.sort(function(a,b){return (Number(a.rasid)||0)-(Number(b.rasid)||0);}).forEach(function(d){
    var nm=d.visible===false?"श्रद्धालु":escDon(d.name||("रसीद "+(d.rasid||"")));
    var shot=d.rasidImg?'<img class="rasid-thumb" src="'+d.rasidImg+'" alt="रसीद" onclick="openRasid(this.src)"/>':'';
    var canFix=(user&&(user.role==="admin"||user.phone==="9473746020"||user.phone===window.ADMIN_PHONE))||(typeof hasAccess==="function"&&(hasAccess("rasid")||hasAccess("approve")));
    var fix=canFix?'<button class="btn ghost" type="button" onclick="editRasid(\''+donKey(d)+'\')">ठीक करें</button>':'';
    html+='<div class="card seva-row">'+shot+'<div><b>'+nm+'</b><div class="meta">रसीद '+escDon(d.rasid||"—")+(d.date?(" · "+escDon(d.date)):"")+'</div>'+fix+'</div><div class="amt">'+inr(d.amt)+'</div></div>';
  });
  list.innerHTML=html;
};
setTimeout(function(){if(!(window.cloud&&window.fs)&&!fs)return;try{(window.fs||fs).collection("donations").onSnapshot(function(qs){db.donations=qs.docs.map(function(d){var x=d.data();x.did=d.id;return x;});try{saveLocal();}catch(e){}if(document.querySelector("#p-donate.on"))renderDon();});}catch(e){}},2000);
(function(){["gal-perm.js?v=96","social.js?v=83","chat-ui.js?v=92","notify.js?v=93","fest.js?v=83","notify-extra.js?v=83","welcome.js?v=83","admin-users.js?v=83","pin-dp.js?v=98","live-embed.js?v=83","addr-ui.js?v=83","rasid.js?v=111"].forEach(function(src){var s=document.createElement("script");s.src="./"+src;document.body.appendChild(s);});})();

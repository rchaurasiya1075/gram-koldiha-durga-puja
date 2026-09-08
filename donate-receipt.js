(function(){
  if(window._donRcpt3)return;window._donRcpt3=1;
  function inr(n){n=Math.round(Number(n)||0);return "\u20b9"+n.toLocaleString("en-IN");}
  function keyOf(d){return String(d.did||d.created||"");}
  function findDon(id){return (window.db&&db.donations||[]).find(function(x){return keyOf(x)===String(id);});}
  function phoneOf(d){return String(d.phone||d.uid||(window.user&&user.phone)||"").replace(/\D/g,"").slice(-10);}
  function isAdm(){return !!(window.admin||(window.user&&user.role==="admin")||(typeof isAdminUser==="function"&&isAdminUser())||(typeof hasPanel==="function"&&hasPanel()));}
  function adminWa(){
    var s=(window.db&&db.settings)||{};
    return String(s.waNumber||s.adminCall||window.ADMIN_PHONE||"9473746020").replace(/\D/g,"").slice(-10);
  }
  window.saveAdminWa=async function(){
    if(!isAdm())return;
    var n=(((document.getElementById("waAdminNo")||{}).value)||"").replace(/\D/g,"").slice(-10);
    if(!/^\d{10}$/.test(n))return typeof toast==="function"&&toast("10 \u0905\u0902\u0915 \u0928\u0902\u092c\u0930");
    if(typeof saveSetting==="function")await saveSetting({waNumber:n,adminCall:n});
    if(typeof toast==="function")toast("WhatsApp \u0928\u0902\u092c\u0930 \u0938\u0947\u0935");
  };
  window.sendPayShotToAdmin=function(){
    var name=(((document.getElementById("dn")||{}).value)||(window.user&&user.name)||"\u0936\u094d\u0930\u0926\u094d\u0927\u093e\u0932\u0941").trim();
    var amt=Number(((document.getElementById("da")||{}).value)||0);
    var adm=adminWa();
    var text="\u091c\u092f \u092e\u093e\u0901 \u0926\u0941\u0930\u094d\u0917\u093e\n\u091a\u0902\u0926\u093e\n\u0928\u093e\u092e: "+name+"\n\u0930\u093e\u0936\u093f: "+(amt?inr(amt):"")+"\n\n\u0938\u094d\u0915\u094d\u0930\u0940\u0928\u0936\u0949\u091f \u0932\u0917\u093e\u090f\u0901।";
    location.href="https://wa.me/91"+adm+"?text="+encodeURIComponent(text);
  };
  window.makeDonCard=function(d){
    d=d||{};
    var c=document.createElement("canvas");c.width=720;c.height=960;
    var g=c.getContext("2d");
    g.fillStyle="#6B1212";g.fillRect(0,0,720,960);
    g.fillStyle="#F7E7C3";g.fillRect(28,28,664,904);
    g.fillStyle="#6B1212";g.fillRect(28,28,664,150);
    g.fillStyle="#E8C56B";g.font="bold 28px serif";g.textAlign="center";
    g.fillText("\u091c\u092f \u092e\u093e\u0901 \u0926\u0941\u0930\u094d\u0917\u093e",360,88);
    g.fillStyle="#F7E7C3";g.font="bold 20px sans-serif";
    g.fillText("\u0915\u094b\u0932\u094d\u0921\u0940\u0939\u093e \u0926\u0941\u0930\u094d\u0917\u093e \u092a\u0942\u091c\u093e \u00b7 \u0930\u0938\u0940\u0926",360,128);
    g.fillStyle="#3a1608";g.textAlign="left";g.font="22px sans-serif";
    g.fillText("\u0928\u093e\u092e: "+(d.name||""),70,280);
    g.fillText("\u092e\u094b\u092c\u093e\u0907\u0932: "+(phoneOf(d)||""),70,340);
    g.fillText("\u0924\u093e\u0930\u0940\u0916: "+(d.date||""),70,400);
    g.font="bold 36px sans-serif";g.fillStyle="#6B1212";
    g.fillText("\u0930\u093e\u0936\u093f: "+inr(d.amt||0),70,490);
    g.font="18px sans-serif";g.fillStyle="#3a1608";
    g.fillText(d.status==="approved"?"\u0938\u094d\u0935\u0940\u0915\u0943\u0924":"\u091c\u092e\u093e",70,560);
    g.fillText("\u0918\u094b\u0930\u093e\u0935\u0932, \u0938\u094b\u0928\u092d\u0926\u094d\u0930",70,620);
    return c;
  };
  window.shareDonReceipt=async function(id){
    var d=findDon(id);if(!d)return;
    var c=makeDonCard(d);
    var text="\u091c\u092f \u092e\u093e\u0901 \u0926\u0941\u0930\u094d\u0917\u093e\n"+(d.name||"")+" \u00b7 "+inr(d.amt||0);
    try{
      var blob=await new Promise(function(ok){c.toBlob(ok,"image/png");});
      var file=new File([blob],"koldiha-rasid.png",{type:"image/png"});
      if(navigator.canShare&&navigator.canShare({files:[file]})){
        await navigator.share({files:[file],title:"\u091a\u0902\u0926\u093e \u0930\u0938\u0940\u0926",text:text});return;
      }
    }catch(e){}
    try{var a=document.createElement("a");a.href=c.toDataURL("image/png");a.download="koldiha-rasid.png";a.click();}catch(e2){}
    location.href="https://wa.me/?text="+encodeURIComponent(text);
  };
  window.editDonAmt=async function(id){
    if(!isAdm())return;
    var d=findDon(id);if(!d)return;
    var n=prompt("\u0938\u0939\u0940 \u0930\u093e\u0936\u093f",String(d.amt||""));if(n==null)return;
    var amt=Number(n);if(!(amt>0))return;
    d.amt=amt;d.status=d.status||"approved";
    if(typeof saveLocal==="function")saveLocal();
    if(window.fs&&d.did)try{await fs.collection("donations").doc(d.did).set({amt:amt,status:d.status},{merge:true});}catch(e){}
    if(typeof renderDon==="function")renderDon();
  };
  window.deleteDonRow=async function(id){
    if(!isAdm())return;
    var d=findDon(id);if(!d||!confirm("\u0939\u091f\u093e\u0928\u093e \u0939\u0948?"))return;
    if(window.fs&&d.did)try{await fs.collection("donations").doc(d.did).delete();}catch(e){}
    db.donations=(db.donations||[]).filter(function(x){return keyOf(x)!==String(id);});
    if(typeof saveLocal==="function")saveLocal();
    if(typeof renderDon==="function")renderDon();
  };
  var _ap=window.approveDon;
  window.approveDon=async function(id){
    if(typeof _ap==="function")await _ap(id);
    var d=findDon(id);if(!d)return;
    d.status="approved";
    if(typeof saveLocal==="function")saveLocal();
    if(window.fs&&d.did)try{await fs.collection("donations").doc(d.did).set({status:"approved",amt:Number(d.amt||0)},{merge:true});}catch(e){}
    if(typeof renderDon==="function")renderDon();
  };
  function injectExtras(){
    var page=document.getElementById("p-donate");if(!page)return;
    if(!document.getElementById("shotBtn")){
      var b=document.createElement("button");b.id="shotBtn";b.type="button";b.className="btn";
      b.textContent="\ud83d\udcf8 \u092a\u0947\u092e\u0947\u0902\u091f \u092b\u094b\u091f\u094b \u090f\u0921\u092e\u093f\u0928 WhatsApp";b.onclick=sendPayShotToAdmin;
      var form=page.querySelector(".card");if(form)form.appendChild(b);
    }
    if(isAdm()&&!document.getElementById("waAdminBox")){
      var box=document.createElement("div");box.id="waAdminBox";box.className="card";
      box.innerHTML='<b>\u090f\u0921\u092e\u093f\u0928 WhatsApp</b><input id="waAdminNo" inputmode="tel" maxlength="10" value="'+adminWa()+'"/><button class="btn" type="button" onclick="saveAdminWa()">\u0938\u0947\u0935</button>';
      var list=document.getElementById("donList");if(list)page.insertBefore(box,list);else page.appendChild(box);
    }
    var extra=document.getElementById("donFullList");
    var list=document.getElementById("donList");
    if(list&&!extra){extra=document.createElement("div");extra.id="donFullList";list.parentNode.insertBefore(extra,list.nextSibling);}
    if(!extra)return;
    var html='<h3>\u0938\u0939\u092f\u094b\u0917 / \u0938\u0947\u0935\u093e \u0938\u0942\u091a\u0940</h3>';
    var rows=((window.db&&db.donations)||[]).slice().sort(function(a,b){return (b.created||0)-(a.created||0);});
    if(isAdm()){
      rows.filter(function(d){return d.status!=="rejected";}).forEach(function(d){
        html+='<div class="card"><b>'+(d.name||"")+'</b> \u00b7 '+inr(d.amt)+' <span class="meta">'+(d.status||"")+'</span>';
        if(d.status==="pending")html+='<button class="btn" type="button" onclick="approveDon(\''+keyOf(d)+'\')">\u0905\u092a\u094d\u0930\u0942\u0935</button>';
        html+='<button class="btn ghost" type="button" onclick="editDonAmt(\''+keyOf(d)+'\')">\u090f\u0921\u093f\u091f</button>';
        html+='<button class="btn ghost" type="button" onclick="deleteDonRow(\''+keyOf(d)+'\')">\u0939\u091f\u093e\u0913</button>';
        html+='<button class="btn" type="button" onclick="shareDonReceipt(\''+keyOf(d)+'\')">WhatsApp \u0930\u0938\u0940\u0926 \u092b\u094b\u091f\u094b</button></div>';
      });
    }else{
      var pub=rows.filter(function(d){return d.status==="approved";});
      if(!pub.length)html+='<p class="meta">\u0905\u092d\u0940 \u0905\u092a\u094d\u0930\u0942\u0935 \u0938\u0947\u0935\u093e \u0928\u0939\u0940\u0902</p>';
      pub.forEach(function(d){
        var nm=d.visible===false?"\u0936\u094d\u0930\u0926\u094d\u0927\u093e\u0932\u0941":(d.name||"");
        html+='<div class="card"><div class="row" style="justify-content:space-between"><div><b>'+nm+'</b><div class="amt">'+inr(d.amt)+'</div></div><button class="btn" style="width:auto;margin:0" type="button" onclick="shareDonReceipt(\''+keyOf(d)+'\')">WhatsApp \u0930\u0938\u0940\u0926</button></div></div>';
      });
    }
    extra.innerHTML=html;
  }
  var _rd=window.renderDon;
  window.renderDon=function(){if(typeof _rd==="function")_rd();injectExtras();};
})();

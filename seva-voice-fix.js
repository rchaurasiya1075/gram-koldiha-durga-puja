(function(){
  if(window._svFix71)return;window._svFix71=1;
  function inr(n){n=Math.round(Number(n)||0);return "\u20b9"+n.toLocaleString("en-IN");}
  function keyOf(d){return String((d&&(d.did||d.created))||"");}
  function donPhone(d){return String((d&&(d.phone||d.uid))||(window.user&&user.phone)||"").replace(/\D/g,"").slice(-10);}
  function isSevaAdmin(){
    if(window.admin||window._voiceModOk)return true;
    var u=window.user||{};
    if(u.role==="admin"||u.phone===window.ADMIN_PHONE||u.phone==="9473746020")return true;
    if(typeof isMaster==="function"&&isMaster())return true;
    if(typeof hasAccess==="function"&&(hasAccess("donate")||hasAccess("approve")))return true;
    return false;
  }
  function bannedId(id){
    if(!id)return false;
    id=String(id);
    var map=window._voiceBan||{};
    if(Number(map[id]||0)>Date.now())return true;
    var ph=(window.user&&user.phone)||"";
    if(ph&&Number(map[ph]||0)>Date.now())return true;
    return false;
  }
  function blockVoiceWrite(id){
    if(!id||!window.fs)return;
    if(!bannedId(id))return;
    try{fs.collection("voice").doc(String(id)).delete();}catch(e){}
    if(window._voicePeers)delete window._voicePeers[id];
  }
  var _setTalk=window.startTalkWatch;
  if(typeof _setTalk==="function"){
    window.startTalkWatch=function(stream,mine){
      var id=mine&&((typeof voiceId==="function"&&voiceId())||"");
      if(id&&bannedId(id))return;
      return _setTalk(stream,mine);
    };
  }
  var _wm=window.writeMe;
  window.writeMe=function(extra){
    var id=(typeof voiceId==="function"&&voiceId())||"";
    if(bannedId(id))return;
    if(typeof _wm==="function")return _wm(extra);
  };
  var _jv=window.joinVoice;
  window.joinVoice=async function(){
    var id=(typeof voiceId==="function"&&voiceId())||"";
    if(bannedId(id)){
      if(typeof requestVoiceJoin==="function")requestVoiceJoin();
      if(typeof toast==="function")toast("\u0939\u091f\u093e\u090f \u0917\u090f \u2014 \u090f\u0921\u092e\u093f\u0928 \u0905\u092a\u094d\u0930\u0942\u0935 \u0915\u0930\u0947");
      return;
    }
    if(typeof _jv==="function")return _jv();
  };
  setInterval(function(){
    Object.keys(window._voicePeers||{}).forEach(function(id){
      if(bannedId(id)){
        delete window._voicePeers[id];
        blockVoiceWrite(id);
      }
    });
    var me=(typeof voiceId==="function"&&voiceId())||"";
    if(me&&bannedId(me)&&window._voiceOn&&typeof leaveVoice==="function")leaveVoice();
  },800);

  window.addDon=async function(){
    var name=(((document.getElementById("dn")||{}).value)||(window.user&&user.name)||"").trim();
    var amt=Number(((document.getElementById("da")||{}).value)||0);
    var visible=!document.getElementById("dvis")||!!document.getElementById("dvis").checked;
    if(!name)return typeof toast==="function"&&toast("\u0928\u093e\u092e \u0932\u093f\u0916\u094b");
    if(!(amt>0))return typeof toast==="function"&&toast("\u0930\u093e\u0936\u093f \u0932\u093f\u0916\u094b");
    var row={name:name,amt:amt,visible:visible,status:"pending",date:new Date().toISOString().slice(0,10),created:Date.now(),uid:(window.user&&user.phone)||"",phone:(window.user&&user.phone)||""};
    db.donations=db.donations||[];
    if(window.fs){
      try{var ref=await fs.collection("donations").add(row);row.did=ref.id;}catch(e){}
    }
    db.donations.push(row);
    if(typeof saveLocal==="function")saveLocal();
    var da=document.getElementById("da");if(da)da.value="";
    if(typeof toast==="function")toast("\u091a\u0902\u0926\u093e \u091c\u092e\u093e \u2014 \u090f\u0921\u092e\u093f\u0928 \u0905\u092a\u094d\u0930\u0942\u0935 \u0915\u0930\u0947\u0902");
    paintSeva();
  };
  window.shareDonReceipt=window.shareDonReceipt||async function(id){
    var d=(db.donations||[]).find(function(x){return keyOf(x)===String(id);});if(!d)return;
    if(typeof makeDonCard==="function"){
      var c=makeDonCard(d);
      try{
        var blob=await new Promise(function(ok){c.toBlob(ok,"image/png");});
        var file=new File([blob],"rasid.png",{type:"image/png"});
        if(navigator.canShare&&navigator.canShare({files:[file]})){
          await navigator.share({files:[file],title:"\u0930\u0938\u0940\u0926",text:d.name+" "+inr(d.amt)});
          return;
        }
      }catch(e){}
      try{var a=document.createElement("a");a.href=c.toDataURL("image/png");a.download="rasid.png";a.click();}catch(e2){}
    }
    location.href="https://wa.me/?text="+encodeURIComponent("\u091c\u092f \u092e\u093e\u0901 \u0926\u0941\u0930\u094d\u0917\u093e\n"+(d.name||"")+" \u00b7 "+inr(d.amt));
  };
  window.editDonAmt=window.editDonAmt||async function(id){
    if(!isSevaAdmin())return;
    var d=(db.donations||[]).find(function(x){return keyOf(x)===String(id);});if(!d)return;
    var n=prompt("\u0938\u0939\u0940 \u0930\u093e\u0936\u093f",String(d.amt||""));if(n==null)return;
    var amt=Number(n);if(!(amt>0))return;
    d.amt=amt;
    if(typeof saveLocal==="function")saveLocal();
    if(window.fs&&d.did)try{await fs.collection("donations").doc(d.did).set({amt:amt},{merge:true});}catch(e){}
    paintSeva();
  };
  window.deleteDonRow=window.deleteDonRow||async function(id){
    if(!isSevaAdmin())return;
    var d=(db.donations||[]).find(function(x){return keyOf(x)===String(id);});if(!d||!confirm("\u0939\u091f\u093e\u090f\u0902?"))return;
    if(window.fs&&d.did)try{await fs.collection("donations").doc(d.did).delete();}catch(e){}
    db.donations=(db.donations||[]).filter(function(x){return keyOf(x)!==String(id);});
    if(typeof saveLocal==="function")saveLocal();
    paintSeva();
  };
  var _ap=window.approveDon;
  window.approveDon=async function(id){
    var d=(db.donations||[]).find(function(x){return keyOf(x)===String(id);});
    if(d){
      d.status="approved";
      if(typeof saveLocal==="function")saveLocal();
      if(window.fs&&d.did)try{await fs.collection("donations").doc(d.did).set({status:"approved",amt:Number(d.amt||0)},{merge:true});}catch(e){}
    }
    if(typeof _ap==="function")try{await _ap(id);}catch(e){}
    paintSeva();
    if(typeof toast==="function")toast("\u0905\u092a\u094d\u0930\u0942\u0935 \u2014 \u0938\u0942\u091a\u0940 \u092e\u0947\u0902 \u0906 \u0917\u092f\u093e");
  };
  function paintSeva(){
    var list=document.getElementById("donList");if(!list)return;
    var all=(db.donations||[]).slice().sort(function(a,b){return (b.created||0)-(a.created||0);});
    var pub=all.filter(function(d){return d&&d.status==="approved";});
    var pend=all.filter(function(d){return d&&d.status==="pending";});
    var inc=pub.reduce(function(s,x){return s+Number(x.amt||0);},0);
    var exp=Number((db.settings&&db.settings.expense)||0);
    var i=document.getElementById("inc");if(i)i.textContent=inr(inc);
    var e=document.getElementById("exp");if(e)e.textContent=inr(exp);
    var b=document.getElementById("bal");if(b)b.textContent=inr(inc-exp);
    var html="";
    if(isSevaAdmin()&&pend.length){
      html+='<h3>\u0905\u092a\u094d\u0930\u0942\u0935 \u092c\u093e\u0915\u0940</h3>';
      pend.forEach(function(d){
        html+='<div class="card"><b>'+(d.name||"")+'</b> \u00b7 '+inr(d.amt)+'<div class="meta">'+donPhone(d)+'</div>';
        html+='<button class="btn" type="button" onclick="approveDon(\''+keyOf(d)+'\')">\u0905\u092a\u094d\u0930\u0942\u0935</button>';
        html+='<button class="btn ghost" type="button" onclick="editDonAmt(\''+keyOf(d)+'\')">\u090f\u0921\u093f\u091f</button>';
        html+='<button class="btn ghost" type="button" onclick="deleteDonRow(\''+keyOf(d)+'\')">\u0939\u091f\u093e\u0913</button></div>';
      });
    }
    var mine=all.filter(function(d){return window.user&&String(d.uid||d.phone)===String(user.phone)&&d.status==="pending";});
    if(!isSevaAdmin()&&mine.length){
      html+='<h3>\u0906\u092a\u0915\u093e \u091c\u092e\u093e</h3>';
      mine.forEach(function(d){html+='<div class="card"><b>'+d.name+'</b> \u00b7 '+inr(d.amt)+'<p class="meta">\u090f\u0921\u092e\u093f\u0928 \u0905\u092a\u094d\u0930\u0942\u0935 \u0915\u0930\u0947\u0902 \u0924\u092c \u0938\u0942\u091a\u0940 \u092e\u0947\u0902 \u0906\u090f\u0917\u093e</p></div>';});
    }
    html+='<h3>\u0938\u0939\u092f\u094b\u0917 \u0938\u0942\u091a\u0940</h3>';
    if(!pub.length)html+='<p class="meta">\u0905\u092d\u0940 \u0905\u092a\u094d\u0930\u0942\u0935 \u0938\u0947\u0935\u093e \u0928\u0939\u0940\u0902</p>';
    pub.forEach(function(d){
      var nm=d.visible===false?"\u0936\u094d\u0930\u0926\u094d\u0927\u093e\u0932\u0941":(d.name||"\u0936\u094d\u0930\u0926\u094d\u0927\u093e\u0932\u0941");
      html+='<div class="card"><div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><div><b>'+nm+'</b><div class="amt">'+inr(d.amt)+'</div></div><div>';
      html+='<button class="btn" style="width:auto;margin:0 4px 0 0;padding:8px 10px" type="button" onclick="shareDonReceipt(\''+keyOf(d)+'\')">WhatsApp \u0930\u0938\u0940\u0926</button>';
      if(isSevaAdmin()){
        html+='<button class="btn ghost" style="width:auto;margin:0;padding:8px 10px" type="button" onclick="editDonAmt(\''+keyOf(d)+'\')">\u090f\u0921\u093f\u091f</button>';
        html+='<button class="btn ghost" style="width:auto;margin:0 0 0 4px;padding:8px 10px" type="button" onclick="deleteDonRow(\''+keyOf(d)+'\')">\u0939\u091f\u093e\u0913</button>';
      }
      html+='</div></div></div>';
    });
    list.innerHTML=html;
    var extra=document.getElementById("donFullList");if(extra)extra.innerHTML="";
  }
  var _rd=window.renderDon;
  window.renderDon=function(){
    if(typeof _rd==="function")try{_rd();}catch(e){}
    paintSeva();
  };
  setTimeout(function(){if(document.getElementById("donList"))paintSeva();},600);
})();

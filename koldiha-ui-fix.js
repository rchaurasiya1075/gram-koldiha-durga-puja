(function(){
  if(window._uiFix65)return;window._uiFix65=1;
  var ROLE={admin:"\u090f\u0921\u092e\u093f\u0928",treasurer:"\u0915\u094b\u0937\u093e\u0927\u094d\u092f\u0915\u094d\u0937",editor:"\u090f\u0921\u093f\u091f\u0930",volunteer:"\u0915\u093e\u0930\u094d\u092f\u0915\u0930\u094d\u0924\u093e",user:"\u0938\u0926\u0938\u094d\u092f"};
  function inr(n){n=Math.round(Number(n)||0);return "\u20b9"+n.toLocaleString("en-IN");}
  function totals(){
    var d=window.db||{},inc=0,exp=0;
    (d.donations||[]).forEach(function(x){if(x.status!=="pending"&&x.status!=="rejected")inc+=Number(x.amount||x.amt||0);});
    (d.expenses||[]).forEach(function(x){exp+=Number(x.amount||x.amt||0);});
    return {inc:inc,exp:exp,bal:inc-exp};
  }
  function labelLive(){
    document.querySelectorAll(".home-grid .tile").forEach(function(b){
      var t=b.textContent||"";
      if(/Live/.test(t)&&!/\u0906\u0935\u093e\u091c/.test(t)&&!/TV/.test(t))b.innerHTML="<span>\ud83d\udcfa</span>Live TV";
    });
    var h=document.querySelector("#p-live h2");if(h)h.textContent="\ud83d\udcfa Live TV";
    var plus=document.getElementById("plusHisaab");if(plus)plus.remove();
    var tv=document.getElementById("tileTv");if(tv)tv.remove();
    var dash=document.getElementById("tileDash");
    if(dash){dash.innerHTML="<span>\ud83d\udda8\ufe0f</span>\u092a\u094b\u0938\u094d\u091f\u0930";dash.onclick=function(){if(typeof go==="function")go("poster");};}
  }
  var _rl=window.renderLive;
  window.renderLive=function(){
    if(typeof _rl==="function")try{_rl();}catch(e){}
    var page=document.getElementById("p-live");if(!page)return;
    var h=page.querySelector("h2");if(h)h.textContent="\ud83d\udcfa Live TV";
    if(!document.getElementById("liveTvBoard")){
      var t=totals();
      var card=document.createElement("div");
      card.id="liveTvBoard";card.className="card";
      card.innerHTML='<b>\u092a\u0902\u0921\u093e\u0932 \u092c\u094b\u0930\u094d\u0921</b><div class="nums3"><div><span class="meta">\u0915\u0941\u0932</span><b class="amt">'+inr(t.inc)+'</b></div><div><span class="meta">\u0916\u0930\u094d\u091a</span><b class="amt out">'+inr(t.exp)+'</b></div><div><span class="meta">\u0936\u0947\u0937</span><b>'+inr(t.bal)+'</b></div></div><p class="meta">\u092f\u0939\u0940 \u0938\u094d\u0915\u094d\u0930\u0940\u0928 TV / LED \u092a\u0930 \u0916\u094b\u0932\u094b</p>';
      page.appendChild(card);
    }
  };
  window.isVoiceAdmin=function(){
    if(window._voiceModOk||window.admin)return true;
    var u=window.user||{};
    if(u.phone===window.ADMIN_PHONE||u.phone==="9473746020")return true;
    if(u.role==="admin"||u.role==="editor"||u.role==="treasurer")return true;
    if(typeof isMaster==="function"&&isMaster())return true;
    if(typeof hasPanel==="function"&&hasPanel())return true;
    try{
      var raw=localStorage.getItem("koldiha_user")||localStorage.getItem("kd_user")||"";
      var s=raw?JSON.parse(raw):null;
      if(s&&(s.role==="admin"||s.phone==="9473746020"||s.phone===window.ADMIN_PHONE))return true;
    }catch(e){}
    return false;
  };
  window.unlockVoiceAdmin=function(){
    var inp=document.getElementById("vAdmPin");
    var pin=((inp&&inp.value)||"").trim();
    if(pin===String(window.ADMIN_PIN||"9211420")||pin==="9211420"){
      window._voiceModOk=true;window.admin=true;
      if(!window.user)window.user={phone:window.ADMIN_PHONE||"9473746020",name:"\u090f\u0921\u092e\u093f\u0928",role:"admin"};
      if(typeof toast==="function")toast("\u090f\u0921\u092e\u093f\u0928 \u0915\u0902\u091f\u094d\u0930\u094b\u0932 \u0916\u0941\u0932\u093e");
      if(typeof renderVoice==="function")renderVoice();
    }else if(typeof toast==="function")toast("\u092a\u093f\u0928 \u0917\u0932\u0924");
  };
  var _rv=window.renderVoice;
  window.renderVoice=function(){
    if(typeof _rv==="function")_rv();
    var page=document.getElementById("p-voice");if(!page)return;
    if(!document.getElementById("vAdmGate")&&!isVoiceAdmin()){
      var g=document.createElement("div");g.id="vAdmGate";
      g.style.cssText="margin:8px;padding:10px;background:#1f2937;border-radius:12px;color:#fff";
      g.innerHTML='<div style="font-size:12px;margin-bottom:6px">\u090f\u0921\u092e\u093f\u0928 \u092a\u093f\u0928 \u2014 \u092e\u094d\u092f\u0942\u091f / \u0939\u091f\u093e\u0913</div><div style="display:flex;gap:6px"><input id="vAdmPin" type="password" inputmode="numeric" placeholder="\u090f\u0921\u092e\u093f\u0928 \u092a\u093f\u0928" style="flex:1;padding:8px;border-radius:8px;border:0"/><button type="button" onclick="unlockVoiceAdmin()" style="border:0;border-radius:8px;padding:8px 12px;background:#E8C56B;color:#3a1608;font-weight:800">\u0916\u094b\u0932\u094b</button></div>';
      var bar=page.querySelector(".vui-bar");
      var vui=page.querySelector(".vui")||page;
      if(bar)vui.insertBefore(g,bar);else vui.appendChild(g);
    }
    if(isVoiceAdmin()&&typeof paintVoiceExtra==="function")paintVoiceExtra();
  };
  function samitiList(){
    var out=[],seen={};
    (window.db&&db.workers||[]).forEach(function(w){
      var k=w.phone||w.name;if(seen[k])return;seen[k]=1;
      out.push({name:w.name,phone:w.phone,pad:w.pad||"",role:w.role||"",work:w.work||"",level:w.level});
    });
    Object.keys((window.db&&db.members)||{}).forEach(function(ph){
      var m=db.members[ph];if(!m)return;
      if(m.role==="user"&&!m.pad)return;
      var k=m.phone||m.name;if(seen[k]){
        out.forEach(function(x){if((x.phone||x.name)===k){x.role=x.role||m.role;x.pad=x.pad||m.pad;}});
        return;
      }
      seen[k]=1;
      out.push({name:m.name,phone:m.phone,pad:m.pad||"",role:m.role||"",work:m.work||""});
    });
    return out;
  }
  var _rt=window.renderTeam;
  window.renderTeam=function(){
    if(typeof _rt==="function")try{_rt();}catch(e){}
    var page=document.getElementById("p-team");if(!page)return;
    var list=samitiList();
    var html='<h2>\ud83e\udd1d \u0938\u092e\u093f\u0924\u093f / \u0915\u093e\u0930\u094d\u092f\u0915\u0930\u094d\u0924\u093e</h2>';
    if(!list.length)html+='<div class="card">\u090f\u0921\u092e\u093f\u0928 \u0938\u0926\u0938\u094d\u092f \u091c\u094b\u0921\u093c\u0947\u0902</div>';
    list.forEach(function(m){
      var pad=m.pad||ROLE[m.role]||"\u0938\u0926\u0938\u094d\u092f";
      var role=ROLE[m.role]||m.role||"";
      html+='<div class="card"><b>'+(m.name||"")+'</b><p class="meta">\u092a\u0926: '+pad+(role?(" \u00b7 \u092d\u0942\u092e\u093f\u0915\u093e: "+role):"")+'</p>'+(m.work?("<p>"+m.work+"</p>"):"")+'<p class="meta">'+(m.phone||"")+'</p></div>';
    });
    page.innerHTML=html;
  };
  var _sw=window.showWorker;
  window.showWorker=function(){
    var el=document.getElementById("workSlide");
    if(!el){if(typeof _sw==="function")return _sw();return;}
    var list=samitiList();
    if(!list.length){el.innerHTML="<p class='meta'>\u090f\u0921\u092e\u093f\u0928 \u0938\u0926\u0938\u094d\u092f \u091c\u094b\u0921\u093c\u0947\u0902</p>";return;}
    window._sami=window._sami||0;
    if(window._sami>=list.length)window._sami=0;
    var w=list[window._sami++];
    var pad=w.pad||ROLE[w.role]||"\u0938\u0926\u0938\u094d\u092f";
    var role=ROLE[w.role]||"";
    el.innerHTML='<div class="wcard"><div class="wrank">'+(w.level||"#")+'</div><div class="wbody"><b>'+(w.name||"")+'</b><div class="meta">\u092a\u0926: '+pad+(role?(" \u00b7 "+role):"")+(w.work?(" \u2022 "+w.work):"")+'</div></div></div>';
  };
  var _cs=window.createStaff;
  window.createStaff=async function(){
    if(typeof _cs==="function")await _cs();
    var name=((document.getElementById("sidName")||{}).value||"").trim();
    var ph=((document.getElementById("sidPh")||{}).value||"").trim();
    var role=((document.getElementById("sidRole")||{}).value)||"user";
    if(!name)return;
    var d=window.db||(window.db={});d.workers=d.workers||[];
    var row={name:name,phone:ph,pad:ROLE[role]||role,role:role,work:"\u0938\u092e\u093f\u0924\u093f",level:role==="admin"?1:5,created:Date.now()};
    if(!d.workers.some(function(w){return String(w.phone)===String(ph);})){
      d.workers.push(row);
      if(typeof saveLocal==="function")saveLocal();
      if(window.fs)try{fs.collection("workers").add(row);}catch(e){}
    }
    if(typeof renderTeam==="function")renderTeam();
    if(typeof showWorker==="function")showWorker();
  };
  var _rh=window.renderHome;
  window.renderHome=function(){if(typeof _rh==="function")try{_rh();}catch(e){}labelLive();};
  var _go=window.go;
  window.go=function(p){
    if(typeof _go==="function")_go(p);
    if(p==="live")setTimeout(function(){if(typeof renderLive==="function")renderLive();},20);
    if(p==="team")setTimeout(function(){if(typeof renderTeam==="function")renderTeam();},20);
    if(p==="home")setTimeout(labelLive,20);
  };
  setTimeout(labelLive,400);
  setTimeout(labelLive,1500);
})();

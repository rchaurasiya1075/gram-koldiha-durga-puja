(function(){
  if(window._gaonPlus)return;window._gaonPlus=1;
  var LIVE="https://rchaurasiya1075.github.io/gram-koldiha-durga-puja/";
  var PTS={pani:5,bhojan:8,safai:8,gate:6,light:7,seva:5};
  function ensurePage(id){
    if(document.getElementById(id))return document.getElementById(id);
    var wrap=document.querySelector(".wrap");if(!wrap)return null;
    var s=document.createElement("section");s.className="page";s.id=id;wrap.appendChild(s);return s;
  }
  function inr(n){n=Math.round(Number(n)||0);return "\u20b9"+n.toLocaleString("en-IN");}
  function totals(){
    var d=window.db||{},inc=0,exp=0;
    (d.donations||[]).forEach(function(x){
      if(x.status==="pending"||x.status==="rejected")return;
      inc+=Number(x.amount||x.amt||0);
    });
    (d.expenses||[]).forEach(function(x){exp+=Number(x.amount||x.amt||0);});
    return {inc:inc,exp:exp,bal:inc-exp};
  }
  window.speakHisaab=function(){
    var t=totals();
    if(!window.speechSynthesis)return typeof toast==="function"&&toast("\u0911\u0921\u093f\u092f\u094b \u0928\u0939\u0940\u0902");
    speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance("\u0915\u0941\u0932 \u091a\u0902\u0926\u093e "+t.inc+" \u0930\u0941\u092a\u092f\u0947, \u0916\u0930\u094d\u091a "+t.exp+" \u0930\u0941\u092a\u092f\u0947, \u0936\u0947\u0937 "+t.bal+" \u0930\u0941\u092a\u092f\u0947");
    u.lang="hi-IN";u.rate=0.95;speechSynthesis.speak(u);
  };
  function injectHome(){
    var home=document.getElementById("p-home");if(!home)return;
    var grid=home.querySelector(".home-grid");
    if(!document.getElementById("plusHisaab")){
      var t=totals();
      var box=document.createElement("div");
      box.id="plusHisaab";box.className="card";
      box.innerHTML='<div class="nums3"><div><span class="meta">\u0915\u0941\u0932</span><b class="amt">'+inr(t.inc)+'</b></div><div><span class="meta">\u0916\u0930\u094d\u091a</span><b class="amt out">'+inr(t.exp)+'</b></div><div><span class="meta">\u0936\u0947\u0937</span><b>'+inr(t.bal)+'</b></div></div><button class="btn" type="button" onclick="speakHisaab()">\ud83d\udd0a \u0939\u093f\u0938\u093e\u092c \u0938\u0941\u0928\u094b</button>';
      if(grid)home.insertBefore(box,grid);else home.appendChild(box);
    }else{
      var t2=totals(),el=document.getElementById("plusHisaab");
      var am=el.querySelectorAll(".nums3 b");
      if(am[0])am[0].textContent=inr(t2.inc);
      if(am[1])am[1].textContent=inr(t2.exp);
      if(am[2])am[2].textContent=inr(t2.bal);
    }
    if(grid&&!document.getElementById("tileEmer")){
      grid.insertAdjacentHTML("beforeend",
        '<button class="tile" id="tileEmer" type="button" onclick="go(\'emergency\')"><span>\ud83d\udea8</span>\u0907\u092e\u0930\u091c\u0947\u0902\u0938\u0940</button>'+
        '<button class="tile" id="tileSevak" type="button" onclick="go(\'sevak\')"><span>\ud83c\udfc5</span>\u0938\u0947\u0935\u0915</button>'+
        '<button class="tile" id="tileDash" type="button" onclick="go(\'dash\')"><span>\ud83d\udcfa</span>\u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921</button>'
      );
    }
    var oldTv=document.getElementById("tileTv");if(oldTv)oldTv.remove();
    var oldPo=document.getElementById("tilePoster");if(oldPo)oldPo.remove();
  }
  window.renderDash=function(){
    var page=ensurePage("p-dash");if(!page)return;
    page.innerHTML='<h2>\ud83d\udcca \u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921</h2><p class="meta">\u092a\u0902\u0921\u093e\u0932 \u091f\u0940\u0935\u0940 \u0914\u0930 QR \u092a\u094b\u0938\u094d\u091f\u0930 \u2014 \u0907\u0938\u0940 \u0910\u092a \u092e\u0947\u0902</p>'+
      '<button class="btn" type="button" onclick="go(\'tv\')">\ud83d\udcfa \u092a\u0902\u0921\u093e\u0932 \u091f\u0940\u0935\u0940</button>'+
      '<button class="btn" type="button" onclick="go(\'poster\')">\ud83d\udda8\ufe0f QR \u092a\u094b\u0938\u094d\u091f\u0930 \u092a\u094d\u0930\u093f\u0902\u091f</button>'+
      '<button class="btn ghost" type="button" onclick="go(\'home\')">\u0939\u094b\u092e</button>';
  };
  window.renderTvPage=function(){
    var page=ensurePage("p-tv");if(!page)return;
    var t=totals();
    page.innerHTML='<h2>\ud83d\udcfa \u092a\u0902\u0921\u093e\u0932 \u091f\u0940\u0935\u0940</h2><div class="card" style="text-align:center;background:#1a0a0a;color:#F7E7C3"><h3 style="color:#E8C56B">\u091c\u092f \u092e\u093e\u0901 \u0926\u0941\u0930\u094d\u0917\u093e</h3><p>\u0915\u094b\u0932\u094d\u0921\u0940\u0939\u093e \u00b7 \u0918\u094b\u0930\u093e\u0935\u0932</p><div class="nums3"><div><span class="meta">\u0915\u0941\u0932</span><b class="amt">'+inr(t.inc)+'</b></div><div><span class="meta">\u0916\u0930\u094d\u091a</span><b class="amt out">'+inr(t.exp)+'</b></div><div><span class="meta">\u0936\u0947\u0937</span><b>'+inr(t.bal)+'</b></div></div></div><button class="btn ghost" type="button" onclick="go(\'dash\')">\u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921</button>';
  };
  window.renderPosterPage=function(){
    var page=ensurePage("p-poster");if(!page)return;
    var q="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data="+encodeURIComponent(LIVE);
    page.innerHTML='<h2>\ud83d\udda8\ufe0f QR \u092a\u094b\u0938\u094d\u091f\u0930</h2><div class="card" style="text-align:center"><h3>\u091c\u092f \u092e\u093e\u0901 \u0926\u0941\u0930\u094d\u0917\u093e</h3><p>\u0917्राम कोल्डीहा दुर्गा पूजा</p><img alt="QR" width="220" height="220" src="'+q+'"/><p class="meta">'+LIVE+'</p></div><button class="btn" type="button" onclick="window.print()">प्रिंट</button><button class="btn ghost" type="button" onclick="go(\'dash\')">डैशबोर्ड</button>';
  };
  window.renderEmergency=function(){
    var page=ensurePage("p-emergency");if(!page)return;
    var s=(window.db&&db.settings)||{};
    var admin=s.adminCall||window.ADMIN_PHONE||"";
    var rows=[["\ud83d\ude91 108","108"],["\ud83d\udc6e 112","112"],["\u26a1 \u092c\u093f\u091c\u0932\u0940",s.powerCall||""],["\ud83d\udd0a \u0938\u093e\u0909\u0902\u0921",s.soundCall||""],["\ud83d\udc51 \u090f\u0921\u092e\u093f\u0928",admin]];
    var html='<h2>\ud83d\udea8 \u0907\u092e\u0930\u091c\u0947\u0902\u0938\u0940</h2>';
    html+='<div class="card"><b>\u0935\u0949\u0915\u0940</b><p>\u092a\u0902\u0921\u093e\u0932 \u091a\u0948\u0928\u0932 <b>3</b> \u00b7 \u0907\u092e\u0930\u091c\u0947\u0902\u0938\u0940 <b>5</b></p></div>';
    rows.forEach(function(r){
      if(!r[1])html+='<div class="card">'+r[0]+'<p class="meta">\u0928\u0902\u092c\u0930 \u092c\u093e\u0926 \u092e\u0947\u0902</p></div>';
      else html+='<a class="btn" href="tel:'+r[1]+'">'+r[0]+' \u00b7 '+r[1]+'</a>';
    });
    page.innerHTML=html;
  };
  function sevakList(){
    var d=window.db||{};d.sevakLog=d.sevakLog||[];
    var map={};
    (d.workers||[]).forEach(function(w){var k=w.phone||w.name;map[k]={name:w.name||"\u0938\u0947\u0935\u0915",phone:w.phone||"",points:Number(w.points||0),pad:w.pad||""};});
    d.sevakLog.forEach(function(x){var k=x.phone||x.name;if(!map[k])map[k]={name:x.name||"\u0938\u0947\u0935\u0915",phone:x.phone||"",points:0,pad:""};map[k].points+=Number(x.points||0);});
    return Object.keys(map).map(function(k){return map[k];}).sort(function(a,b){return b.points-a.points;});
  }
  window.addSevakPoint=function(){
    if(!window.user)return typeof go==="function"&&go("account");
    var key=((document.getElementById("svWork")||{}).value)||"seva";
    var d=window.db||(window.db={});d.sevakLog=d.sevakLog||[];
    d.sevakLog.push({name:user.name,phone:user.phone,work:key,points:PTS[key]||5,at:Date.now()});
    if(typeof saveLocal==="function")saveLocal();
    if(typeof toast==="function")toast("+"+(PTS[key]||5)+" \u0905\u0902\u0915");
    renderSevak();
  };
  window.renderSevak=function(){
    var page=ensurePage("p-sevak");if(!page)return;
    var list=sevakList();
    var html='<h2>\ud83c\udfc5 \u0938\u0947\u0935\u0915</h2><div class="card"><select id="svWork"><option value="pani">\u092a\u093e\u0928\u0940 (+5)</option><option value="bhojan">\u092d\u094b\u091c\u0928 (+8)</option><option value="safai">\u0938\u092b\u093e\u0908 (+8)</option><option value="gate">\u0917\u0947\u091f (+6)</option><option value="light">\u0932\u093e\u0907\u091f (+7)</option><option value="seva">\u0938\u0947\u0935\u093e (+5)</option></select><button class="btn" type="button" onclick="addSevakPoint()">\u0915\u093e\u092e \u091c\u094b\u0921\u093c\u094b</button></div>';
    list.forEach(function(s,i){var b=i===0?"\ud83e\udd47":i===1?"\ud83e\udd48":i===2?"\ud83e\udd49":String(i+1);html+='<div class="card"><b>'+b+" "+s.name+'</b><div class="meta">'+(s.points||0)+' \u0905\u0902\u0915</div></div>';});
    page.innerHTML=html;
  };
  var _rh=window.renderHome;
  window.renderHome=function(){if(typeof _rh==="function")try{_rh();}catch(e){}injectHome();};
  var _go=window.go;
  window.go=function(p){
    ["emergency","sevak","dash","tv","poster"].forEach(function(x){if(p===x)ensurePage("p-"+x);});
    if(typeof _go==="function")_go(p);
    if(p==="emergency")renderEmergency();
    if(p==="sevak")renderSevak();
    if(p==="dash")renderDash();
    if(p==="tv")renderTvPage();
    if(p==="poster")renderPosterPage();
  };
  setTimeout(injectHome,200);
  setTimeout(injectHome,1200);
})();

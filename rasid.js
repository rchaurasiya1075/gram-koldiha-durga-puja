(function(){
  function canRasid(){
    if(!window.user)return false;
    if(user.phone==="9473746020"||user.phone===window.ADMIN_PHONE||user.role==="admin")return true;
    return typeof hasAccess==="function"&&hasAccess("rasid");
  }
  function hiNum(s){
    var map={"०":"0","१":"1","२":"2","३":"3","४":"4","५":"5","६":"6","७":"7","८":"8","९":"9"};
    return String(s||"").replace(/[०-९]/g,function(ch){return map[ch]||ch;});
  }
  function cleanName(s){
    return String(s||"").replace(/[.\-_:|]/g," ").replace(/\s+/g," ").replace(/के द्वारा.*/,"").trim();
  }
  function wordAmt(t){
    var words=[["ग्यारह सौ",1100],["पंद्रह सौ",1500],["एक हजार",1000],["पाँच सौ",500],["पांच सौ",500],["दो सौ",200],["ढाई सौ",250],["सवा सौ",125],["डेढ़ सौ",150],["इक्यावन",51],["पचास",50],["पच्चास",50],["पच्चीस",25],["ग्यारह",11],["इक्कीस",21],["इकतीस",31],["चालीस",40],["साठ",60],["सत्तर",70],["अस्सी",80],["नब्बे",90],["तीस",30],["बीस",20],["दस",10],["सौ",100],["पाँच",5],["पांच",5]];
    for(var i=0;i<words.length;i++){if(t.indexOf(words[i][0])>=0)return words[i][1];}
    return 0;
  }
  function parseRasid(raw){
    var t=hiNum(raw).replace(/\r/g,"");
    var no="",date="",name="",addr="",amt=0;
    var m=t.match(/क्रमांक\s*[:\-]?\s*(\d{2,4})/);
    if(m)no=m[1];
    if(!no){var nums=t.match(/\b(\d{3})\b/g)||[];if(nums.length)no=nums[0];}
    var dm=t.match(/(\d{1,2}\s*[\/\.\-]\s*\d{1,2}\s*[\/\.\-]\s*\d{2,4})/);
    if(dm)date=dm[1].replace(/\s/g,"");
    var nm=t.match(/श्रीमती\s*[:\-]?\s*([^\n]{2,48})/);
    if(nm)name=cleanName(nm[1]);
    var ad=t.match(/पता\s*[:\-]?\s*([^\n]{2,40})/);
    if(ad)addr=cleanName(ad[1]).replace(/के.*/,"").trim();
    var box=t.match(/(?:रू|रु|रू0|रु0|Rs)\s*0?\s*(\d{1,6})/);
    if(box)amt=Number(box[1]);
    if(!(amt>0)){
      var rm=t.match(/रुपया\s*[:\-]?\s*(\d{1,6})/);
      if(rm)amt=Number(rm[1]);
    }
    if(!(amt>0))amt=wordAmt(t);
    if(name.length<2)name="";
    if(addr.length<2)addr="";
    return {no:no,date:date,name:name,addr:addr,amt:amt,text:t};
  }
  function loadImg(file){
    return new Promise(function(ok,rej){
      var url=URL.createObjectURL(file);
      var img=new Image();
      img.onload=function(){URL.revokeObjectURL(url);ok(img);};
      img.onerror=function(){rej(new Error("img"));};
      img.src=url;
    });
  }
  function drawFit(img,maxW){
    var sc=Math.min(1,maxW/(img.width||1));
    var c=document.createElement("canvas");
    c.width=Math.max(1,Math.round((img.width||1)*sc));
    c.height=Math.max(1,Math.round((img.height||1)*sc));
    c.getContext("2d").drawImage(img,0,0,c.width,c.height);
    return c;
  }
  function jpeg(canvas,q){
    return new Promise(function(ok){
      canvas.toBlob(function(b){ok(b);}, "image/jpeg", q);
    });
  }
  async function smallShot(img){
    var c=drawFit(img,720);
    var q=0.62,b=await jpeg(c,q);
    while(b&&b.size>90000&&q>0.35){q-=0.08;b=await jpeg(c,q);}
    return new Promise(function(ok){
      var r=new FileReader();
      r.onload=function(){ok(String(r.result||""));};
      r.readAsDataURL(b);
    });
  }
  function contrast(img){
    var c=drawFit(img,1100);
    var g=c.getContext("2d");
    var id=g.getImageData(0,0,c.width,c.height);
    var d=id.data;
    for(var i=0;i<d.length;i+=4){
      var y=0.3*d[i]+0.59*d[i+1]+0.11*d[i+2];
      var v=Math.max(0,Math.min(255,(y-140)*1.8+128));
      d[i]=d[i+1]=d[i+2]=v;
    }
    g.putImageData(id,0,0);
    return c;
  }
  function loadTess(){
    if(window.Tesseract)return Promise.resolve();
    return new Promise(function(ok,rej){
      var s=document.createElement("script");
      s.src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
      s.onload=function(){ok();};
      s.onerror=function(){rej(new Error("ocr"));};
      document.head.appendChild(s);
    });
  }
  function paintBox(){
    var page=document.getElementById("p-donate");if(!page)return;
    var box=document.getElementById("rasidBox");
    if(!canRasid()){if(box)box.style.display="none";return;}
    if(!box){
      box=document.createElement("div");
      box.id="rasidBox";
      box.className="card";
      box.innerHTML='<h3>रसीद अपलोड</h3><p class="meta">गुलाबी रसीद की फोटो डालो। नाम, क्रमांक और राशि अपने आप सहयोग में जुड़ेंगे।</p><input id="rasidFile" type="file" accept="image/*,.jpg,.jpeg,.png,.webp,.heic" /><p class="meta" id="rasidMsg"></p><div id="rasidFix"></div>';
      var h=page.querySelector("h2");
      if(h&&h.nextSibling)page.insertBefore(box,h.nextSibling);else page.appendChild(box);
      box.querySelector("#rasidFile").addEventListener("change",function(){readRasid(this);});
    }
    box.style.display="block";
  }
  async function saveRow(info,img){
    var row={
      name:info.name,amt:Number(info.amt),visible:true,seva:"सहयोग",status:"approved",
      date:info.date||new Date().toISOString().slice(0,10),created:Date.now(),
      uid:user.phone,phone:user.phone,rasid:info.no||"",addr:info.addr||"",rasidImg:img,by:user.name||""
    };
    if(info.no&&(db.donations||[]).some(function(d){return String(d.rasid)===String(info.no);}))return toast("रसीद "+info.no+" पहले से है");
    if((window.cloud&&window.fs)||window.fs){
      try{var ref=await (window.fs||fs).collection("donations").add(row);row.did=ref.id;}
      catch(e){return toast("रसीद सेव नहीं हुई");}
    }else return toast("क्लाउड बंद है");
    db.donations=db.donations||[];db.donations.push(row);
    try{saveLocal();}catch(e){}
    if(typeof renderDon==="function")renderDon();
    toast((info.name||"नाम")+" — ₹"+info.amt+(info.no?(" — रसीद "+info.no):"")+" जुड़ गई");
  }
  function askFix(info,img){
    var fix=document.getElementById("rasidFix");if(!fix)return;
    fix.innerHTML='<label class="lab">नाम</label><input id="rsName" value="'+String(info.name||"").replace(/"/g,"")+'"/>'+
      '<label class="lab">राशि</label><input id="rsAmt" inputmode="numeric" value="'+(info.amt||"")+'" />'+
      '<label class="lab">क्रमांक</label><input id="rsNo" value="'+String(info.no||"").replace(/"/g,"")+'" />'+
      '<label class="lab">पता</label><input id="rsAddr" value="'+String(info.addr||"").replace(/"/g,"")+'" />'+
      '<button class="btn" type="button" id="rsSave">सूची में जोड़ो</button>';
    document.getElementById("rsSave").onclick=function(){
      var name=(document.getElementById("rsName").value||"").trim();
      var amt=Number(document.getElementById("rsAmt").value);
      if(!name||!(amt>0))return toast("नाम और राशि लिखो");
      saveRow({name:name,amt:amt,no:(document.getElementById("rsNo").value||"").trim(),addr:(document.getElementById("rsAddr").value||"").trim(),date:info.date},img);
      fix.innerHTML="";
    };
  }
  window.openRasid=function(src){
    var old=document.getElementById("rasidView");if(old)old.remove();
    var d=document.createElement("div");
    d.id="rasidView";
    d.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:120;display:flex;align-items:center;justify-content:center;padding:12px";
    d.innerHTML='<img src="'+src+'" style="max-width:100%;max-height:90vh;object-fit:contain" />';
    d.onclick=function(){d.remove();};
    document.body.appendChild(d);
  };
  window.readRasid=async function(inp){
    if(!canRasid())return toast("रसीद डालने का अधिकार नहीं");
    var f=inp.files&&inp.files[0];if(!f)return;
    var msg=document.getElementById("rasidMsg");
    if(msg)msg.textContent="रसीद पढ़ रहे हैं...";
    try{
      var img=await loadImg(f);
      var shot=await smallShot(img);
      await loadTess();
      var plate=contrast(img);
      var out=await Tesseract.recognize(plate,"hin+eng");
      var info=parseRasid((out&&out.data&&out.data.text)||"");
      if(info.name&&info.amt>0){
        if(msg)msg.textContent=info.name+" · ₹"+info.amt+(info.no?(" · रसीद "+info.no):"");
        await saveRow(info,shot);
        var fix=document.getElementById("rasidFix");if(fix)fix.innerHTML="";
      }else{
        if(msg)msg.textContent="पूरा नहीं पढ़ा। नाम और राशि जाँच कर जोड़ो।";
        askFix(info,shot);
      }
    }catch(e){
      if(msg)msg.textContent="पढ़ नहीं पाया। नाम और राशि लिख कर जोड़ो।";
      askFix({name:"",amt:"",no:"",addr:""},"");
    }
    inp.value="";
  };
  var _go=window.go;
  window.go=function(p){if(typeof _go==="function")_go(p);if(p==="donate")setTimeout(paintBox,30);};
  var _rd=window.renderDon;
  window.renderDon=function(){if(typeof _rd==="function")try{_rd();}catch(e){}paintBox();};
  setTimeout(paintBox,800);
})();

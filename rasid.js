(function(){
  if(window._rasidOn)return;window._rasidOn=1;
  function canRasid(){
    var u=window.user;
    var ph=String((u&&u.phone)||"").replace(/\D/g,"").slice(-10);
    var adm=String(window.ADMIN_PHONE||"9473746020").replace(/\D/g,"").slice(-10);
    if(ph&&(ph===adm||ph==="9473746020"))return true;
    if(u&&u.role==="admin")return true;
    if(window.admin)return true;
    if(typeof isMaster==="function"&&isMaster())return true;
    if(typeof hasAccess==="function"&&hasAccess("rasid"))return true;
    return false;
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
    var text=hiNum(raw);
    var lines=text.split(/\n/).map(function(s){return s.replace(/\s+/g," ").trim();}).filter(Boolean);
    function isLabel(s){return /क्रमांक|कमांक|क्मांक|कनांक|दिनांक|श्रीमान|श्रीमती|श्रीती|पता|रूपया|रुपया|सहयोग|राशि|हस्ताक्षर|समिति|पंचायत|कोलडी|सोनभद्र|पूजा हेतु/.test(s);}
    function after(re){
      for(var i=0;i<lines.length;i++){
        if(!re.test(lines[i]))continue;
        var same=lines[i].replace(re,"").replace(/^[\s.:\-]+/,"").trim();
        if(same.length>1&&!isLabel(same)&&!/^\d+$/.test(same))return same;
        for(var j=i+1;j<Math.min(lines.length,i+3);j++){
          if(!isLabel(lines[j])&&lines[j].length>1&&!/^\d{1,4}$/.test(lines[j]))return lines[j];
        }
      }
      return "";
    }
    function boxAmt(t){
      var m=t.match(/(?:रू|रु)\s*0\s*([0-9SsOoIl| ]{1,10})/);
      if(!m)return 0;
      var d=m[1].replace(/[Ss]/g,"5").replace(/[Oo]/g,"0").replace(/[Il|]/g,"1").replace(/\D/g,"");
      if(d.length>1&&d.charAt(0)==="0")d=d.slice(1);
      var n=Number(d);
      return n>0&&n<1000000?n:0;
    }
    var no="";
    var nmNo=text.match(/(?:क्रमांक|कमांक|क्मांक|कनांक)\s*[:\-]?\s*(\d{2,4})/);
    if(nmNo)no=nmNo[1];
    if(!no){
      lines.forEach(function(s){if(!no&&/^\d{3}$/.test(s))no=s;});
    }
    var date="";
    var dm=text.match(/(\d{1,2}\s*[\/\.\-|]\s*\d{1,2}\s*[\/\.\-|]\s*\d{2,4})/);
    if(dm)date=dm[1].replace(/[|.\s]/g,"/").replace(/\/+/g,"/");
    var addr=cleanName(after(/पता/)).replace(/के.*/,"").trim();
    var amt=boxAmt(text);
    if(!(amt>0))amt=wordAmt(text);
    var stop={"क्रमांक":1,"कमांक":1,"क्मांक":1,"कनांक":1,"दिनांक":1,"श्रीमान":1,"श्रीमती":1,"श्रीती":1,"पता":1,"रूपया":1,"रुपया":1,"सहयोग":1,"राशि":1,"पचास":1,"पच्चास":1,"सौ":1,"ग्यारह":1,"रुपय":1,"रुपये":1};
    lines.forEach(function(s){
      if(name)return;
      var words=(s.match(/[\u0900-\u097F]{2,}/g)||[]).filter(function(w){return !stop[w];});
      var bit=cleanName(words.join(" "));
      if(bit.length<2||bit===addr||isLabel(bit))return;
      if(wordAmt(bit)&&bit.length<10)return;
      name=bit;
    });
    if(name.length<2)name="";
    if(addr.length<2)addr="";
    return {no:no,date:date,name:name,addr:addr,amt:amt,text:text};
  }
  async function ocrRead(dataUrl){
    var body=new FormData();
    body.append("apikey","helloworld");
    body.append("language","auto");
    body.append("OCREngine","1");
    body.append("scale","true");
    body.append("base64Image",dataUrl);
    var res=await fetch("https://api.ocr.space/parse/image",{method:"POST",body:body});
    var j=await res.json();
    if(!j||j.IsErroredOnProcessing)throw new Error("ocr");
    return (j.ParsedResults&&j.ParsedResults[0]&&j.ParsedResults[0].ParsedText)||"";
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
    var box=document.getElementById("rasidBox");
    var file=document.getElementById("rasidFile");
    if(!box||!file)return;
    box.style.display="block";
    if(!file._bound){
      file._bound=1;
      file.addEventListener("change",function(){previewRasid(this);});
    }
    var msg=document.getElementById("rasidMsg");
    if(msg&&!msg.textContent)msg.textContent=canRasid()?"":"रसीद डालने के लिए एडमिन लॉगिन होना चाहिए।";
  }
  async function saveRow(info,img){
    var row={
      name:info.name,amt:Number(info.amt),visible:true,seva:"सहयोग",status:"approved",
      date:info.date||new Date().toISOString().slice(0,10),created:Date.now(),
      uid:(window.user&&user.phone)||"",phone:(window.user&&user.phone)||"",rasid:info.no||"",addr:info.addr||"",rasidImg:img,by:(window.user&&user.name)||""
    };
    if(info.no&&(db.donations||[]).some(function(d){return String(d.rasid)===String(info.no);})){toast("रसीद "+info.no+" पहले से है");return false;}
    if((window.cloud&&window.fs)||window.fs){
      try{var ref=await (window.fs||fs).collection("donations").add(row);row.did=ref.id;}
      catch(e){toast("रसीद सेव नहीं हुई");return false;}
    }else {toast("क्लाउड बंद है");return false;}
    db.donations=db.donations||[];db.donations.push(row);
    try{saveLocal();}catch(e){}
    if(typeof renderDon==="function")renderDon();
    toast((info.name||"नाम")+" — ₹"+info.amt+(info.no?(" — रसीद "+info.no):"")+" जुड़ गई");
    return true;
  }
  function askFix(info,img){
    var fix=document.getElementById("rasidFix");if(!fix)return;
    var id="rf"+Date.now()+Math.floor(Math.random()*1000);
    var block=document.createElement("div");
    block.className="card";
    block.innerHTML='<p class="meta">यह रसीद पूरी नहीं पढ़ी</p>'+
      '<label class="lab">नाम</label><input id="'+id+'n" value="'+String(info.name||"").replace(/"/g,"")+'"/>'+
      '<label class="lab">राशि</label><input id="'+id+'a" inputmode="numeric" value="'+(info.amt||"")+'" />'+
      '<label class="lab">क्रमांक</label><input id="'+id+'r" value="'+String(info.no||"").replace(/"/g,"")+'" />'+
      '<label class="lab">पता</label><input id="'+id+'d" value="'+String(info.addr||"").replace(/"/g,"")+'" />'+
      '<button class="btn" type="button">सूची में जोड़ो</button>';
    block.querySelector("button").onclick=function(){
      var name=(document.getElementById(id+"n").value||"").trim();
      var amt=Number(document.getElementById(id+"a").value);
      if(!name||!(amt>0))return toast("नाम और राशि लिखो");
      saveRow({name:name,amt:amt,no:(document.getElementById(id+"r").value||"").trim(),addr:(document.getElementById(id+"d").value||"").trim(),date:info.date},img);
      block.remove();
    };
    fix.appendChild(block);
  }
  window.editRasid=function(id){
    if(!canRasid()&&!(typeof hasAccess==="function"&&hasAccess("approve")))return toast("सिर्फ़ एडमिन");
    var d=(db.donations||[]).find(function(x){return String(x.did||x.created)===String(id);});
    if(!d)return;
    var box=document.getElementById("rasidEdit");
    if(!box){
      box=document.createElement("div");
      box.id="rasidEdit";
      box.className="card";
      var list=document.getElementById("donList");
      if(list)list.parentNode.insertBefore(box,list);
    }
    function v(s){
      var q=String.fromCharCode(34), amp=String.fromCharCode(38);
      return String(s||"").split(amp).join(amp+"amp;").split(q).join(amp+"quot;");
    }
    box.innerHTML='<h3>रसीद ठीक करें</h3>'+
      '<label class="lab">नाम</label><input id="edName" value="'+v(d.name)+'"/>'+
      '<label class="lab">राशि</label><input id="edAmt" inputmode="numeric" value="'+v(d.amt)+'"/>'+
      '<label class="lab">क्रमांक</label><input id="edNo" value="'+v(d.rasid)+'"/>'+
      '<label class="lab">पता</label><input id="edAddr" value="'+v(d.addr)+'"/>'+
      '<label class="lab">तारीख</label><input id="edDate" value="'+v(d.date)+'"/>'+
      '<button class="btn" type="button" id="edSave">सेव</button> <button class="btn ghost" type="button" id="edClose">बंद</button>';
    document.getElementById("edClose").onclick=function(){box.remove();};
    document.getElementById("edSave").onclick=async function(){
      var name=(document.getElementById("edName").value||"").trim();
      var amt=Number(document.getElementById("edAmt").value);
      if(!name||!(amt>0))return toast("नाम और राशि लिखो");
      d.name=name;d.amt=amt;
      d.rasid=(document.getElementById("edNo").value||"").trim();
      d.addr=(document.getElementById("edAddr").value||"").trim();
      d.date=(document.getElementById("edDate").value||"").trim()||d.date;
      try{saveLocal();}catch(e){}
      if(window.fs&&d.did){
        try{await fs.collection("donations").doc(d.did).set({name:d.name,amt:d.amt,rasid:d.rasid,addr:d.addr,date:d.date},{merge:true});}
        catch(e){return toast("सेव नहीं हुआ");}
      }
      toast("रसीद ठीक हो गई");
      box.remove();
      if(typeof renderDon==="function")renderDon();
    };
  };
  window.previewRasid=async function(inp){
    var f=inp.files&&inp.files[0];if(!f)return;
    var img=await loadImg(f);
    window._rasidShot=await smallShot(img);
    var prev=document.getElementById("rasidPrev");
    if(prev){prev.src=window._rasidShot;prev.style.display="block";}
    var msg=document.getElementById("rasidMsg");
    if(msg)msg.textContent="फोटो लग गई। रसीद नंबर और राशि लिखकर जोड़ो।";
  };
  window.addRasidManual=async function(){
    if(!canRasid())return toast("रसीद डालने के लिए एडमिन लॉगिन करें");
    var no=((document.getElementById("rsNoIn")||{}).value||"").trim();
    var amt=Number((document.getElementById("rsAmtIn")||{}).value);
    var name=((document.getElementById("rsNameIn")||{}).value||"").trim();
    if(!no)return toast("रसीद नंबर लिखो");
    if(!(amt>0))return toast("राशि लिखो");
    if(!window._rasidShot)return toast("रसीद की फोटो चुनो");
    var ok=await saveRow({name:name||("रसीद "+no),amt:amt,no:no,addr:"",date:new Date().toISOString().slice(0,10)},window._rasidShot);
    if(ok===false)return;
    var n=document.getElementById("rsNoIn");if(n)n.value="";
    var a=document.getElementById("rsAmtIn");if(a)a.value="";
    var nm=document.getElementById("rsNameIn");if(nm)nm.value="";
    window._rasidShot="";
    var prev=document.getElementById("rasidPrev");if(prev){prev.style.display="none";prev.src="";}
    var file=document.getElementById("rasidFile");if(file)file.value="";
  };
  window.downloadRasidData=function(){
    if(!canRasid())return toast("डेटा डाउनलोड सिर्फ़ एडमिन कर सकता है");
    var rows=(db.donations||[]).filter(function(d){return d.status!=="rejected";});
    rows.sort(function(a,b){return (a.created||0)-(b.created||0);});
    function cell(s){return '"'+String(s==null?"":s).replace(/"/g,'""')+'"';}
    var lines=["क्रमांक,नाम,राशि,पता,तारीख,सेवा,स्थिति"];
    var total=0;
    rows.forEach(function(d){
      total+=Number(d.amt||0);
      lines.push([cell(d.rasid||""),cell(d.name||""),cell(d.amt||0),cell(d.addr||""),cell(d.date||""),cell(d.seva||"सहयोग"),cell(d.status||"")].join(","));
    });
    lines.push(["","कुल",cell(total),"","","",""].join(","));
    var blob=new Blob(["\uFEFF"+lines.join("\n")],{type:"text/csv;charset=utf-8"});
    var a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="koldiha-sahyog.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast(rows.length+" रसीद का डेटा डाउनलोड हो गया");
  };
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
    var files=[].slice.call(inp.files||[]);
    if(!files.length)return;
    var msg=document.getElementById("rasidMsg");
    var fix=document.getElementById("rasidFix");
    if(fix)fix.innerHTML="";
    var okN=0;
    for(var i=0;i<files.length;i++){
      if(msg)msg.textContent=(i+1)+"/"+files.length+" रसीद पढ़ रहे हैं...";
      try{
        var img=await loadImg(files[i]);
        var shot=await smallShot(img);
        var plate=contrast(img);
        var ocrUrl=plate.toDataURL("image/jpeg",0.72);
        var text="";
        try{text=await ocrRead(ocrUrl);}catch(e){
          await loadTess();
          var out=await Tesseract.recognize(plate,"hin+eng");
          text=(out&&out.data&&out.data.text)||"";
        }
        var info=parseRasid(text);
        if(info.name&&info.amt>0){await saveRow(info,shot);okN++;}
        else askFix(info,shot);
      }catch(e){
        askFix({name:"",amt:"",no:"",addr:"",date:""},"");
      }
    }
    if(msg)msg.textContent=okN+" रसीद जुड़ गई"+(files.length-okN?" · "+(files.length-okN)+" जाँच बाकी":"");
    inp.value="";
  };
  var _go=window.go;
  window.go=function(p){if(typeof _go==="function")_go(p);if(p==="donate")setTimeout(paintBox,30);};
  var _rd=window.renderDon;
  window.renderDon=function(){if(typeof _rd==="function")try{_rd();}catch(e){}paintBox();};
  setTimeout(paintBox,800);
})();

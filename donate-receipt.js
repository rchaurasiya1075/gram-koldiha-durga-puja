(function(){
  if(window._donRcpt)return;window._donRcpt=1;
  function inr(n){n=Math.round(Number(n)||0);return "\u20b9"+n.toLocaleString("en-IN");}
  function keyOf(d){return String(d.did||d.created||"");}
  function findDon(id){return (window.db&&db.donations||[]).find(function(x){return keyOf(x)===String(id);});}
  function phoneOf(d){return String(d.phone||d.uid||(window.user&&user.phone)||"").replace(/\D/g,"").slice(-10);}
  window.makeDonCard=function(d){
    d=d||{};
    var c=document.createElement("canvas");c.width=720;c.height=960;
    var g=c.getContext("2d");
    g.fillStyle="#6B1212";g.fillRect(0,0,720,960);
    g.fillStyle="#F7E7C3";g.fillRect(28,28,664,904);
    g.fillStyle="#6B1212";g.fillRect(28,28,664,150);
    g.fillStyle="#E8C56B";g.font="bold 28px serif";g.textAlign="center";
    g.fillText("\u091c\u092f \u092e\u093e\u0901 \u0926\u0941\u0930\u094d\u0917\u093e",360,88);
    g.fillStyle="#F7E7C3";g.font="bold 22px sans-serif";
    g.fillText("\u0917\u094d\u0930\u093e\u092e \u0915\u094b\u0932\u094d\u0921\u0940\u0939\u093e \u0926\u0941\u0930\u094d\u0917\u093e \u092a\u0942\u091c\u093e",360,128);
    g.fillStyle="#3a1608";g.font="bold 26px sans-serif";g.textAlign="left";
    g.fillText("\u091a\u0902\u0926\u093e \u0930\u0938\u0940\u0926",70,230);
    g.font="20px sans-serif";
    g.fillText("\u0928\u093e\u092e: "+(d.name||"\u0936\u094d\u0930\u0926\u094d\u0927\u093e\u0932\u0941"),70,300);
    g.fillText("\u092e\u094b\u092c\u093e\u0907\u0932: "+(phoneOf(d)||"—"),70,350);
    g.fillText("\u0924\u093e\u0930\u0940\u0916: "+(d.date||""),70,400);
    g.font="bold 36px sans-serif";g.fillStyle="#6B1212";
    g.fillText("\u0930\u093e\u0936\u093f: "+inr(d.amt||d.amount||0),70,490);
    g.font="18px sans-serif";g.fillStyle="#3a1608";
    g.fillText((d.status==="pending"?"\u091c\u092e\u093e \u2014 \u090f\u0921\u092e\u093f\u0928 \u0905\u092a\u094d\u0930\u0942\u0935 \u092c\u093e\u0915\u0940":"\u0938\u094d\u0935\u0940\u0915\u0943\u0924 \u00b7 \u0927\u0928\u094d\u092f\u0935\u093e\u0926"),70,560);
    g.fillText("\u0918\u094b\u0930\u093e\u0935\u0932, \u0938\u094b\u0928\u092d\u0926\u094d\u0930 \u00b7 231210",70,620);
    g.font="16px sans-serif";g.fillStyle="#6B1212";
    g.fillText("\u092e\u093e\u0901 \u0915\u093e \u0906\u0936\u0940\u0930\u094d\u0935\u093e\u0926 — \u0915\u094b\u0932\u094d\u0921\u0940\u0939\u093e \u0938\u092e\u093f\u0924\u093f",70,820);
    return c;
  };
  window.shareDonReceipt=async function(id){
    var d=findDon(id);if(!d)return typeof toast==="function"&&toast("\u0930\u0938\u0940\u0926 \u0928\u0939\u0940\u0902");
    var c=makeDonCard(d);
    var text="\u091c\u092f \u092e\u093e\u0901 \u0926\u0941\u0930\u094d\u0917\u093e\n\u0915\u094b\u0932\u094d\u0921\u0940\u0939\u093e \u0926\u0941\u0930\u094d\u0917\u093e \u092a\u0942\u091c\u093e\n\u0928\u093e\u092e: "+(d.name||"")+"\n\u092e\u094b\u092c\u093e\u0907\u0932: "+phoneOf(d)+"\n\u0930\u093e\u0936\u093f: "+inr(d.amt||0)+"\n\u0927\u0928\u094d\u092f\u0935\u093e\u0926";
    function sendWa(){location.href="https://wa.me/?text="+encodeURIComponent(text);}
    try{
      var blob=await new Promise(function(ok){c.toBlob(ok,"image/png");});
      var file=new File([blob],"koldiha-rasid.png",{type:"image/png"});
      if(navigator.canShare&&navigator.canShare({files:[file]})){
        await navigator.share({files:[file],title:"\u091a\u0902\u0926\u093e \u0930\u0938\u0940\u0926",text:text});
        return;
      }
      if(navigator.share){await navigator.share({title:"\u091a\u0902\u0926\u093e \u0930\u0938\u0940\u0926",text:text});}
    }catch(e){}
    try{
      var a=document.createElement("a");a.href=c.toDataURL("image/png");a.download="koldiha-rasid.png";a.click();
      if(typeof toast==="function")toast("\u0930\u0938\u0940\u0926 \u0938\u0947\u0935 \u2014 WhatsApp \u092a\u0930 \u092d\u0947\u091c\u094b");
    }catch(e2){}
    setTimeout(sendWa,400);
  };
  function listHtml(){
    var all=(window.db&&db.donations)||[];
    var rows=all.filter(function(d){return d&&d.status!=="rejected";}).slice().sort(function(a,b){return (b.created||0)-(a.created||0);});
    if(!rows.length)return '<p class="meta">\u0905\u092d\u0940 \u091a\u0902\u0926\u093e \u0928\u0939\u0940\u0902</p>';
    return rows.map(function(d){
      var hide=d.visible===false;
      var st=d.status==="pending"?" \u00b7 \u091c\u092e\u093e":"";
      var nm=hide?"\u0936\u094d\u0930\u0926\u094d\u0927\u093e\u0932\u0941":(d.name||"\u0936\u094d\u0930\u0926\u094d\u0927\u093e\u0932\u0941");
      var ph=phoneOf(d);var tail=ph?(" \u00b7 "+ph.slice(0,2)+"******"+ph.slice(-2)):"";
      var adm=typeof isAdminUser==="function"&&isAdminUser();
      var showPh=adm?(" \u00b7 "+ph):tail;
      return '<div class="card"><div class="row" style="justify-content:space-between;align-items:center"><div><b>'+nm+'</b><div class="meta">'+inr(d.amt||0)+st+(hide?"":"")+showPh+'</div></div><button class="btn" style="width:auto;margin:0;padding:8px 10px" type="button" onclick="shareDonReceipt(\''+keyOf(d)+'\')">WhatsApp \u0930\u0938\u0940\u0926</button></div></div>';
    }).join("");
  }
  var _rd=window.renderDon;
  window.renderDon=function(){
    if(typeof _rd==="function")_rd();
    var list=document.getElementById("donList");if(!list)return;
    var extra=document.getElementById("donFullList");
    if(!extra){extra=document.createElement("div");extra.id="donFullList";list.parentNode.insertBefore(extra,list.nextSibling);}
    extra.innerHTML='<h3 style="margin:12px 8px 6px">\u0938\u0939\u092f\u094b\u0917 \u0938\u0942\u091a\u0940</h3>'+listHtml();
  };
  var _ad=window.addDon;
  window.addDon=async function(){
    if(typeof _ad==="function")await _ad();
    var all=(window.db&&db.donations)||[];
    var last=all[all.length-1];
    if(last)setTimeout(function(){if(confirm("WhatsApp \u0930\u0938\u0940\u0926 \u092d\u0947\u091c\u0947\u0902?"))shareDonReceipt(keyOf(last));},300);
  };
})();

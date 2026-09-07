function paintAddr(){
  var page=document.getElementById("p-map");if(!page)return;
  page.innerHTML='<h2>📍 पंडाल</h2><div class="card addrbox">'+
    '<div class="addrh">पता</div>'+
    '<div class="addrrow"><span>ग्राम</span><b>कोल्डीहा</b></div>'+
    '<div class="addrrow"><span>पोस्ट</span><b>लिलवाही</b></div>'+
    '<div class="addrrow"><span>तहसील</span><b>घोरावल</b></div>'+
    '<div class="addrrow"><span>जिला</span><b>सोनभद्र</b></div>'+
    '<div class="addrrow"><span>राज्य</span><b>उत्तर प्रदेश</b></div>'+
    '<div class="addrrow"><span>पिन</span><b>231210</b></div>'+
    '<div class="addrh">कैसे पहुँचें</div>'+
    '<p style="text-align:center;font-weight:800;color:#6B1212">रॉबर्ट्सगंज → घोरावल → कोल्डीहा</p>'+
    '<p>रॉबर्ट्सगंज से घोरावल जाएँ।<br>घोरावल से कोल्डीहा लगभग <b>8 किमी</b>।</p>'+
    '<div class="addrh">बस / ट्रेन</div>'+
    '<p>पहले घोरावल पहुँचें, फिर कोल्डीहा आएँ।</p>'+
    '<a class="btn" target="_blank" href="https://www.google.com/maps/search/?api=1&query=Koldiha+Lilwahi+Ghorawal+Sonbhadra+231210">रास्ता</a></div>';
  var v=document.querySelector(".vaddr");
  if(v)v.textContent="ग्राम कोल्डीहा · पोस्ट लिलवाही · घोरावल · सोनभद्र 231210";
}
function fixNames(root){
  var w=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT);
  var n;while(n=w.nextNode()){
    var t=n.nodeValue;
    if(!t)continue;
    var x=t.replace(/कोलडिहा/g,"कोल्डीहा").replace(/कोलडीहा/g,"कोल्डीहा").replace(/घोरवल/g,"घोरावल");
    if(x!==t)n.nodeValue=x;
  }
}
(function(){
  var s=document.createElement("style");
  s.textContent=".addrbox{line-height:1.5}.addrh{margin:14px 0 6px;color:#6B1212;font-weight:800;font-size:15px}.addrrow{display:flex;gap:12px;padding:8px 0;border-bottom:1px dashed #ead3bc;font-size:15px}.addrrow span{width:72px;color:#7A5A4A}.addrrow b{color:#2A1410}";
  document.head.appendChild(s);
  function run(){paintAddr();fixNames(document.body);}
  run();setTimeout(run,300);setTimeout(run,1200);
  var g=window.go;window.go=function(n){if(typeof g==="function")g(n);setTimeout(run,20);};
})();

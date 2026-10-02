let _si=0,_ai=0,_st=null,_at=null,_lastAnn="";
function slidePool(){
  var a=[];
  (db.slides||[]).forEach(function(s){a.push({url:s.url||s,name:s.name||"पंडाल कोल्डीहा"});});
  if(db.settings&&db.settings.bannerUrl)a.unshift({url:db.settings.bannerUrl,name:"ग्राम कोल्डीहा"});
  return a.filter(function(x){return x.url;});
}
function showSlide(){
  var pool=slidePool();
  var img=document.getElementById("slideImg");
  var cap=document.getElementById("slideCap");
  if(!img)return;
  if(!pool.length){
    img.style.display="none";
    if(cap)cap.textContent="पंडाल";
    return;
  }
  if(_si>=pool.length)_si=0;
  var item=pool[_si];
  var url=mediaUrl(item.url);
  img.style.display="block";
  img.style.objectFit="cover";
  img.style.transition="opacity .55s ease";
  if(img.dataset.cur===url){_si++;return;}
  img.dataset.cur=url;
  if(img.getAttribute("src"))img.style.opacity="0";
  window.setTimeout(function(){
    img.onload=function(){img.style.opacity="1";};
    img.onerror=function(){img.style.opacity="1";};
    img.src=url;
    if(img.complete)img.style.opacity="1";
  },img.getAttribute("src")?220:0);
  if(cap)cap.textContent=item.name||"कोल्डीहा पंडाल";
  _si++;
}
function showTicker(){
  var el=document.getElementById("annText");if(!el)return;
  var list=db.announcements||[];
  var t="जय माँ दुर्गा • ग्राम कोल्डीहा, पोस्ट लिलवाही, सोनभद्र";
  if(list.length){if(_ai>=list.length)_ai=0;var a=list[_ai++];t=(a.title||"")+(a.message?(" — "+a.message):"");}
  el.textContent=t;_lastAnn=t;
}
window.speakAnn=function(){
  var t=_lastAnn||((document.getElementById("annText")||{}).textContent||"जय माँ दुर्गा");
  if(!window.speechSynthesis)return toast("ऑडियो नहीं चला");
  speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(t);
  u.lang="hi-IN";u.rate=0.95;
  speechSynthesis.speak(u);
};
function startHomeLoops(){
  showTicker();
  if(window._homeLoops)return;
  window._homeLoops=1;
  showSlide();
  _st=setInterval(showSlide,5200);
  _at=setInterval(showTicker,7000);
}
const _rh=window.renderHome;
window.renderHome=function(){if(typeof _rh==="function")try{_rh();}catch(e){}startHomeLoops();};
window.uploadSlide=async function(inp){
  if(!isAdminUser())return toast("सिर्फ़ एडमिन");
  var f=inp.files&&inp.files[0];if(!f)return;
  var data=await compressFile(f);
  var row={url:data,name:"पंडाल कोल्डीहा",created:Date.now()};
  db.slides=db.slides||[];db.slides.push(row);saveLocal();
  if(cloud&&fs){try{await fs.collection("slides").add(row);}catch(e){}}
  toast("स्लाइड में पूरी फोटो");_si=Math.max(0,(db.slides||[]).length-1);showSlide();
};
startHomeLoops();

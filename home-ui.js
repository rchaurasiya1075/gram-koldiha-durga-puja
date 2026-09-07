let _si=0,_ai=0,_st=null,_at=null;
function slidePool(){
  var a=[];
  (db.slides||[]).forEach(function(s){a.push({url:s.url||s,name:s.name||"पंडाल कोल्डीहा"});});
  (db.gallery||[]).forEach(function(s){a.push({url:s.url||s.data,name:s.name||"गैलरी"});});
  if(db.settings&&db.settings.bannerUrl)a.unshift({url:db.settings.bannerUrl,name:"ग्राम कोल्डीहा"});
  return a.filter(function(x){return x.url;});
}
function showSlide(){
  var pool=slidePool();
  var img=document.getElementById("slideImg");
  var cap=document.getElementById("slideCap");
  var box=document.getElementById("pandalSlide");
  if(!img||!box)return;
  if(!pool.length){img.style.display="none";if(cap)cap.textContent="पंडाल फोटो अपलोड करें — स्लाइड यहाँ चलेगी";return;}
  if(_si>=pool.length)_si=0;
  img.style.display="block";
  img.src=mediaUrl(pool[_si].url);
  if(cap)cap.textContent=pool[_si].name||"कोल्डीहा पंडाल";
  _si++;
}
function showTicker(){
  var el=document.getElementById("annTicker");if(!el)return;
  var list=db.announcements||[];
  if(!list.length){el.textContent="📢 जय माँ दुर्गा  •  ग्राम कोल्डीहा";return;}
  if(_ai>=list.length)_ai=0;
  var a=list[_ai++];
  el.textContent="📢 "+(a.title||"")+(a.message?(" — "+a.message):"");
}
function startHomeLoops(){
  showSlide();showTicker();
  if(_st)clearInterval(_st);if(_at)clearInterval(_at);
  _st=setInterval(showSlide,3500);
  _at=setInterval(showTicker,5000);
}
const _rh=window.renderHome;
window.renderHome=function(){
  if(typeof _rh==="function")try{_rh();}catch(e){}
  startHomeLoops();
  var up=document.getElementById("slideUploadWrap");
  if(up)up.style.display=isAdminUser()?"block":"none";
};
window.uploadSlide=async function(inp){
  if(!isAdminUser())return toast("सिर्फ़ एडमिन स्लाइड डाले");
  var f=inp.files&&inp.files[0];if(!f)return;
  var data=await compressFile(f);
  var row={url:data,name:"पंडाल कोल्डीहा",created:Date.now()};
  db.slides=db.slides||[];db.slides.push(row);saveLocal();
  if(cloud&&fs){try{await fs.collection("slides").add(row);}catch(e){}}
  toast("स्लाइड में फोटो");showSlide();
};
startHomeLoops();

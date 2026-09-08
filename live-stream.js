window.ytId=function(url){
  url=String(url||"");
  var m=url.match(/(?:youtu\.be\/|v=|embed\/|live\/|shorts\/)([A-Za-z0-9_-]{11})/);
  if(m)return m[1];
  m=url.match(/[A-Za-z0-9_-]{11}/);
  return (m&&url.indexOf("youtu")>=0)?m[0]:"";
};
window.saveLiveFromPage=async function(){
  var inp=document.getElementById("liveUrlBox");
  var url=((inp&&inp.value)||"").trim();
  if(!url)return typeof toast==="function"&&toast("YouTube लिंक डालो");
  if(typeof saveSetting==="function")await saveSetting({liveUrl:url});
  else if(window.db){db.settings=db.settings||{};db.settings.liveUrl=url;if(typeof saveLocal==="function")saveLocal();}
  if(typeof toast==="function")toast("Live TV सेव");
  if(typeof renderLive==="function")renderLive();
};
function livePlayerHtml(url){
  var id=window.ytId(url);
  if(id)return '<div class="liveCard" style="background:#000;border-radius:14px;overflow:hidden"><div style="position:relative;padding-top:56.25%"><iframe src="https://www.youtube.com/embed/'+id+'?autoplay=1&mute=0&playsinline=1&rel=0" allow="autoplay;encrypted-media;picture-in-picture" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe></div></div>';
  if(/^https?:\/\//i.test(url))return '<div class="card"><a class="btn" target="_blank" rel="noopener" href="'+url+'">स्ट्रीम नई विंडो में खोलो</a></div>';
  return "";
}
const _rls=window.renderLive;
window.renderLive=function(){
  var box=document.getElementById("liveBox");if(!box)return;
  var url=(window.db&&db.settings&&db.settings.liveUrl)||"";
  var admin=false;
  try{admin=!!(window.admin||(window.user&&(user.role==="admin"||user.phone===window.ADMIN_PHONE))||(typeof hasPanel==="function"&&hasPanel()));}catch(e){}
  var html="";
  var player=livePlayerHtml(url);
  html+=player||'<div class="card"><b>\ud83d\udcfa Live TV</b><p class="meta">अभी स्ट्रीम लिंक सेव नहीं। एडमिन YouTube Live लिंक डाले।</p></div>';
  if(admin){
    html+='<div class="card"><b>एडमिन — स्ट्रीम लिंक</b><input id="liveUrlBox" placeholder="https://youtu.be/........ या YouTube Live लिंक" value="'+(url||"").replace(/"/g,"")+'"/><button class="btn" type="button" onclick="saveLiveFromPage()">Live TV सेव</button><p class="meta">फोन से: YouTube ऐप → गो लाइव → लिंक कॉपी → यहाँ पेस्ट</p></div>';
  }
  box.innerHTML=html;
  var page=document.getElementById("p-live");
  if(page){var h=page.querySelector("h2");if(h)h.textContent="\ud83d\udcfa Live TV";}
  if(typeof _rls==="function"&&!player){try{_rls();}catch(e){}}
};

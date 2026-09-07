(function(){
  var s=document.createElement("style");
  s.textContent="#pinBanner{position:relative;z-index:12;background:#6B1212;color:#F7E7C3;border-radius:12px;padding:10px 12px;margin:0 0 8px;text-align:center}#pinBanner b{font-size:28px;letter-spacing:6px;display:block;margin:4px 0}";
  document.head.appendChild(s);
})();
function speakWelcome(m){
  if(!window.speechSynthesis||!m)return;
  var fest=(typeof festName==="function"?festName():"")||((db.settings&&db.settings.festName)||"दुर्गा पूजा");
  var name=m.name||"श्रद्धालु";
  var u=new SpeechSynthesisUtterance(name+" जी, "+fest+" की हार्दिक शुभकामनाएँ. आपको इस कोल्डीहा परिवार में स्वागत है.");
  u.lang="hi-IN";u.rate=0.92;
  speechSynthesis.speak(u);
}
function speakPin(pin,m){
  if(!window.speechSynthesis)return;
  var digits=String(pin||"").split("").join(" ");
  speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance("आपका लॉगिन कोड है "+digits+". इसे सेव कर लें.");
  u.lang="hi-IN";u.rate=0.92;
  u.onend=function(){speakWelcome(m||user);};
  speechSynthesis.speak(u);
}
function showPinBanner(m){
  if(!m||!m.pin)return;
  var home=document.getElementById("p-home");if(!home)return;
  var bar=document.getElementById("pinBanner");
  if(!bar){bar=document.createElement("div");bar.id="pinBanner";home.insertBefore(bar,home.firstChild);}
  bar.style.display="block";
  bar.innerHTML="<div>आपका लॉगिन कोड है — सेव कर लें</div><b>"+m.pin+"</b><div class='meta' style='color:#f7e7c3'>अगली बार मोबाइल "+(m.phone||"")+" + यही कोड</div>";
  speakPin(m.pin,m);
  setTimeout(function(){if(bar)bar.style.display="none";},18000);
}
function afterAuth(m){
  if(!m)return;
  if(typeof go==="function")go("home");
  setTimeout(function(){showPinBanner(m);},200);
}
function wrapAuth(name){
  var old=window[name];
  if(typeof old!=="function"||old._w2)return;
  var fn=async function(){
    var r=await old.apply(this,arguments);
    if(user&&user.phone&&(name==="doSignup"||name==="doUserLogin"||name==="doLogin"))afterAuth(user);
    return r;
  };
  fn._w2=true;window[name]=fn;
}
["doSignup","doUserLogin","doLogin"].forEach(wrapAuth);
setTimeout(function(){["doSignup","doUserLogin","doLogin"].forEach(wrapAuth);},800);

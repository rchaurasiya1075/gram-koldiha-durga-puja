(function(){
  var s=document.createElement("style");
  s.textContent="#pinBanner{position:relative;z-index:12;background:#6B1212;color:#F7E7C3;border-radius:12px;padding:10px 12px;margin:0 0 8px;text-align:center}#pinBanner b{font-size:28px;letter-spacing:6px;display:block;margin:4px 0}";
  document.head.appendChild(s);
})();
function speakPin(pin){
  if(!window.speechSynthesis)return;
  var digits=String(pin||"").split("").join(" ");
  speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance("आपका लॉगिन कोड है "+digits+". इसे सेव कर लें. अगली बार मोबाइल नंबर और यही कोड डालकर लॉगिन होगा.");
  u.lang="hi-IN";u.rate=0.92;
  speechSynthesis.speak(u);
}
function showPinBanner(m){
  if(!m||!m.pin)return;
  var home=document.getElementById("p-home");if(!home)return;
  var bar=document.getElementById("pinBanner");
  if(!bar){bar=document.createElement("div");bar.id="pinBanner";home.insertBefore(bar,home.firstChild);}
  bar.style.display="block";
  bar.innerHTML="<div>आपका लॉगिन कोड है — सेव कर लें</div><b>"+m.pin+"</b><div class='meta' style='color:#f7e7c3'>अगली बार मोबाइल "+(m.phone||"")+" + यही कोड</div>";
  speakPin(m.pin);
  setTimeout(function(){if(bar)bar.style.display="none";},16000);
}
function waNewUser(m){
  var msg="कोलडिहा नया यूज़र%0Aनाम: "+(m.name||"")+"%0Aमोबाइल: "+(m.phone||"")+"%0APIN: "+(m.pin||"")+"%0Aसमय: "+new Date().toLocaleString("hi-IN");
  var url="https://wa.me/919473746020?text="+msg.replace(/ /g,"%20");
  try{window.open(url,"_blank");}catch(e){location.href=url;}
}
function afterAuth(m,isNew){
  if(!m)return;
  if(isNew)waNewUser(m);
  if(typeof go==="function")go("home");
  setTimeout(function(){showPinBanner(m);},200);
}
function wrapAuth(name){
  var old=window[name];
  if(typeof old!=="function"||old._w)return;
  var fn=async function(){
    var before=user&&user.phone;
    var r=await old.apply(this,arguments);
    var after=user;
    if(after&&after.phone){
      var isNew=name==="doSignup"||name==="createStaff"||!before;
      if(name==="doSignup"||name==="createStaff")isNew=true;
      if(name==="doUserLogin"||name==="doLogin"||name==="adminLogin")isNew=false;
      afterAuth(after,isNew);
    }
    return r;
  };
  fn._w=true;window[name]=fn;
}
["doSignup","doUserLogin","doLogin","adminLogin","createStaff"].forEach(wrapAuth);
setTimeout(function(){["doSignup","doUserLogin","doLogin","adminLogin","createStaff"].forEach(wrapAuth);},800);

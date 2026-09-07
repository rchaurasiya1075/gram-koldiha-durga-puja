const START=new Date("2026-10-16T08:00:00+05:30");
const KEY="koldiha_puja_v1";
let store={donations:[],volunteers:[]};
try{store=Object.assign(store,JSON.parse(localStorage.getItem(KEY)||"{}"));}catch(e){}
function save(){localStorage.setItem(KEY,JSON.stringify(store));}
function inr(n){return "₹"+Number(n||0).toLocaleString("en-IN");}
function toast(m){const t=document.getElementById("toast");t.textContent=m;t.style.display="block";setTimeout(()=>t.style.display="none",2000);}
function go(name){document.querySelectorAll(".page").forEach(p=>p.classList.toggle("on",p.id==="p-"+name));document.querySelectorAll(".nav button").forEach(b=>b.classList.toggle("on",b.dataset.p===name));if(name==="donate")renderDon();if(name==="vol")renderVol();}
function tick(){const d=START-Date.now();const el=(id,v)=>{const n=document.getElementById(id);if(n)n.textContent=v;};if(d<=0){el("cdD","0");el("cdH","0");el("cdM","0");return;}el("cdD",Math.floor(d/86400000));el("cdH",Math.floor((d%86400000)/3600000));el("cdM",Math.floor((d%3600000)/60000));}
function addDon(){const name=document.getElementById("dn").value.trim();const amt=Number(document.getElementById("da").value);if(!name||!amt)return toast("नाम और राशि लिखें");store.donations.push({name,amt,date:new Date().toISOString().slice(0,10)});save();document.getElementById("dn").value="";document.getElementById("da").value="";renderDon();toast("धन्यवाद, सहयोग दर्ज");}
function renderDon(){const inc=store.donations.reduce((s,x)=>s+Number(x.amt),0);document.getElementById("inc").textContent=inr(inc);document.getElementById("exp").textContent=inr(0);document.getElementById("bal").textContent=inr(inc);document.getElementById("donList").innerHTML=store.donations.slice().reverse().map(d=>'<div class="card row"><div><b>'+d.name+'</b><div class="meta">'+d.date+'</div></div><div class="amt">'+inr(d.amt)+"</div></div>").join("");}
function addVol(){const name=document.getElementById("vn").value.trim();const phone=document.getElementById("vp").value.trim();const svc=document.getElementById("vsvc").value;if(!name||!phone)return toast("नाम और मोबाइल लिखें");store.volunteers.push({name,phone,svc});save();document.getElementById("vn").value="";document.getElementById("vp").value="";renderVol();toast("सेवा के लिए धन्यवाद");}
function renderVol(){document.getElementById("volList").innerHTML=store.volunteers.map(v=>'<div class="card"><b>'+v.name+'</b><div class="meta">'+v.svc+" • "+v.phone+"</div></div>").join("");}
if("serviceWorker" in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});
setTimeout(()=>document.getElementById("splash").classList.add("hide"),2200);
tick();setInterval(tick,30000);renderDon();

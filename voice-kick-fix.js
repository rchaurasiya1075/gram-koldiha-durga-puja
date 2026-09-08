window._voiceBan=window._voiceBan||{};
window._joinReqs=window._joinReqs||[];
function FAR(){return Date.now()+20*365*24*60*60*1000;}
function banUntil(id){return Number((window._voiceBan&&window._voiceBan[id])||0);}
function isBanned(id){return banUntil(id)>Date.now();}
function canVoiceMod(){
  if(window._voiceModOk||window.admin)return true;
  if(typeof isVoiceAdmin==="function"&&isVoiceAdmin())return true;
  if(typeof isMaster==="function"&&isMaster())return true;
  if(typeof hasAccess==="function"&&hasAccess("voice"))return true;
  if(window.user&&(user.role==="admin"||user.phone===window.ADMIN_PHONE||user.phone==="9473746020"))return true;
  return false;
}
function dropPeerNow(id){
  if(!id)return;
  if(window._voicePeers)delete window._voicePeers[id];
  try{if(window._pcs&&window._pcs[id]){window._pcs[id].close();delete window._pcs[id];}}catch(e){}
  try{if(window._aud&&window._aud[id]){window._aud[id].pause();window._aud[id].srcObject=null;delete window._aud[id];}}catch(e){}
}
function applyBans(){
  Object.keys(window._voiceBan||{}).forEach(function(id){if(isBanned(id))dropPeerNow(id);});
  var me=(typeof voiceId==="function"&&voiceId())||"";
  if(me&&isBanned(me)&&window._voiceOn&&typeof leaveVoice==="function")leaveVoice();
}
function bindVoiceBan(){
  if(!window.fs||window._vBanBound)return;window._vBanBound=true;
  try{
    fs.collection("voiceBan").onSnapshot(function(qs){
      window._voiceBan={};
      qs.forEach(function(d){
        var x=d.data()||{},until=Number(x.until||0);
        if(x.cleared)return;
        if(until>Date.now())window._voiceBan[d.id]=until;
      });
      applyBans();
      if(typeof renderVoice==="function")renderVoice();
      paintJoinReqs();
    });
    fs.collection("voiceJoin").onSnapshot(function(qs){
      window._joinReqs=qs.docs.map(function(d){var x=d.data()||{};x.id=d.id;return x;});
      paintJoinReqs();
      if(typeof renderAdmin==="function"&&document.querySelector("#p-admin.on"))renderAdmin();
    });
  }catch(e){}
}
window.requestVoiceJoin=async function(){
  var id=(typeof voiceId==="function"&&voiceId())||"";
  if(!id)return typeof toast==="function"&&toast("\u092a\u0939\u0932\u0947 \u0932\u0949\u0917\u093f\u0928");
  var row={uid:id,name:(window.user&&user.name)||"\u0936\u094d\u0930\u0926\u094d\u0927\u093e\u0932\u0941",phone:(window.user&&user.phone)||id,t:Date.now(),status:"pending"};
  if(window.fs){try{await fs.collection("voiceJoin").doc(String(id)).set(row,{merge:true});}catch(e){}}
  if(typeof toast==="function")toast("\u091c\u0949\u0907\u0928 \u0930\u093f\u0915\u094d\u0935\u0947\u0938\u094d\u091f \u092d\u0947\u091c \u0926\u0940");
  paintJoinReqs();
};
window.approveVoiceJoin=async function(id){
  if(!canVoiceMod())return typeof toast==="function"&&toast("\u0905\u0915\u094d\u0938\u0947\u0938 \u0928\u0939\u0940\u0902");
  if(window.fs){
    try{await fs.collection("voiceBan").doc(String(id)).set({cleared:true,until:0,t:Date.now()},{merge:true});}catch(e){}
    try{await fs.collection("voiceJoin").doc(String(id)).set({status:"approved",okAt:Date.now()},{merge:true});}catch(e){}
  }
  if(window._voiceBan)delete window._voiceBan[id];
  if(typeof toast==="function")toast("\u091c\u0949\u0907\u0928 \u0905\u092a\u094d\u0930\u0942\u0935");
  paintJoinReqs();
};
window.denyVoiceJoin=async function(id){
  if(!canVoiceMod())return;
  if(window.fs)try{await fs.collection("voiceJoin").doc(String(id)).set({status:"denied",t:Date.now()},{merge:true});}catch(e){}
  paintJoinReqs();
};
function paintJoinReqs(){
  var page=document.getElementById("p-voice");
  var box=document.getElementById("vJoinBox");
  if(page){
    if(!box){box=document.createElement("div");box.id="vJoinBox";page.appendChild(box);}
    var me=(typeof voiceId==="function"&&voiceId())||"";
    var html="";
    if(me&&isBanned(me)){
      var mine=(window._joinReqs||[]).find(function(r){return r.id===me||r.uid===me;});
      var st=mine&&mine.status;
      html+='<div class="card" style="margin:8px;background:#1f2937;color:#fff"><b>\u0906\u092a\u0915\u094b \u0939\u091f\u093e\u092f\u093e \u0917\u092f\u093e</b><p>\u092b\u093f\u0930 \u091c\u094b\u0921\u093c\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0930\u093f\u0915\u094d\u0935\u0947\u0938\u094d\u091f \u092d\u0947\u091c\u094b</p>';
      if(st==="pending")html+='<p class="meta">\u0930\u093f\u0915\u094d\u0935\u0947\u0938\u094d\u091f \u092d\u0947\u091c\u0940 \u2014 \u090f\u0921\u092e\u093f\u0928 \u0905\u092a\u094d\u0930\u0942\u0935 \u0915\u0930\u0947\u0902</p>';
      else html+='<button class="btn" type="button" onclick="requestVoiceJoin()">\u091c\u0949\u0907\u0928 \u0930\u093f\u0915\u094d\u0935\u0947\u0938\u094d\u091f</button>';
      html+="</div>";
    }
    if(canVoiceMod()){
      var pend=(window._joinReqs||[]).filter(function(r){return r.status==="pending";});
      html+='<div class="card" style="margin:8px;background:#1f2937;color:#fff"><b>\u091c\u0949\u0907\u0928 \u0930\u093f\u0915\u094d\u0935\u0947\u0938\u094d\u091f</b>';
      if(!pend.length)html+='<p class="meta">\u0915\u094b\u0908 \u0930\u093f\u0915\u094d\u0935\u0947\u0938\u094d\u091f \u0928\u0939\u0940\u0902</p>';
      pend.forEach(function(r){
        var rid=r.id||r.uid;
        html+='<div style="margin:8px 0"><b>'+(r.name||rid)+'</b> <span class="meta">'+(r.phone||"")+'</span><br><button type="button" onclick="approveVoiceJoin(\''+String(rid).replace(/'/g,"")+'\')" style="margin:4px 4px 0 0;border:0;border-radius:8px;padding:6px 10px;background:#16a34a;color:#fff">\u0905\u092a\u094d\u0930\u0942\u0935</button><button type="button" onclick="denyVoiceJoin(\''+String(rid).replace(/'/g,"")+'\')" style="margin:4px 0 0;border:0;border-radius:8px;padding:6px 10px;background:#dc2626;color:#fff">\u0928\u0939\u0940\u0902</button></div>';
      });
      html+="</div>";
    }
    box.innerHTML=html;
  }
  var adm=document.getElementById("adminVoiceReq");
  if(adm){
    var pend2=(window._joinReqs||[]).filter(function(r){return r.status==="pending";});
    var h="<b>\u0906\u0935\u093e\u091c \u091c\u0949\u0907\u0928 \u0930\u093f\u0915\u094d\u0935\u0947\u0938\u094d\u091f</b>";
    if(!pend2.length)h+='<p class="meta">\u0915\u094b\u0908 \u0928\u0939\u0940\u0902</p>';
    pend2.forEach(function(r){
      var rid=r.id||r.uid;
      h+='<div class="card"><b>'+(r.name||"")+'</b> \u00b7 '+(r.phone||"")+'<button class="btn" type="button" onclick="approveVoiceJoin(\''+String(rid).replace(/'/g,"")+'\')">\u0905\u092a\u094d\u0930\u0942\u0935</button><button class="btn ghost" type="button" onclick="denyVoiceJoin(\''+String(rid).replace(/'/g,"")+'\')">\u0928\u0939\u0940\u0902</button></div>';
    });
    adm.innerHTML=h;
  }
}
function ensureAdminVoiceCard(){
  var tools=document.getElementById("adminTools");if(!tools||document.getElementById("adminVoiceReq"))return;
  var c=document.createElement("div");c.className="card";c.id="adminVoiceReq";c.setAttribute("data-acc","voice");
  tools.appendChild(c);paintJoinReqs();
}
const _writeMe0=window.writeMe;
window.writeMe=function(extra){
  var id=(typeof voiceId==="function"&&voiceId())||"";
  if(id&&isBanned(id))return;
  if(typeof _writeMe0==="function")return _writeMe0(extra);
};
window.adminKickPeer=async function(id){
  if(!canVoiceMod()||!id)return;
  var p=(window._voicePeers&&window._voicePeers[id])||{};
  if(!confirm((p.name||id)+" \u0915\u094b \u0939\u091f\u093e\u0928\u093e \u0939\u0948? \u092b\u093f\u0930 \u0938\u093f\u0930\u094d\u092b \u0905\u092a\u094d\u0930\u0942\u0935 \u0938\u0947 \u0906\u090f\u0902\u0917\u0947।"))return;
  window._voiceBan=window._voiceBan||{};window._voiceBan[id]=FAR();
  dropPeerNow(id);
  if(window.fs){
    try{await fs.collection("voiceBan").doc(String(id)).set({until:FAR(),cleared:false,by:(typeof voiceId==="function"&&voiceId())||"",t:Date.now()});}catch(e){}
    try{await fs.collection("voice").doc(String(id)).delete();}catch(e){}
    try{await fs.collection("voiceJoin").doc(String(id)).set({status:"kicked",t:Date.now()},{merge:true});}catch(e){}
    try{await fs.collection("voiceMod").add({type:"kick",target:String(id),t:Date.now()});}catch(e){}
  }
  applyBans();
  if(typeof toast==="function")toast("\u0939\u091f\u093e \u2014 \u092b\u093f\u0930 \u0930\u093f\u0915\u094d\u0935\u0947\u0938\u094d\u091f+\u0905\u092a\u094d\u0930\u0942\u0935");
  if(typeof renderVoice==="function")renderVoice();
};
const _joinK=window.joinVoice;
window.joinVoice=async function(){
  var id=(typeof voiceId==="function"&&voiceId())||"";
  if(id&&isBanned(id)){
    if(typeof toast==="function")toast("\u0939\u091f\u093e\u090f \u0917\u090f \u2014 \u0930\u093f\u0915\u094d\u0935\u0947\u0938\u094d\u091f \u092d\u0947\u091c\u094b");
    requestVoiceJoin();
    paintJoinReqs();
    return;
  }
  if(typeof _joinK==="function")return _joinK();
};
const _rvK=window.renderVoice;
window.renderVoice=function(){applyBans();if(typeof _rvK==="function")_rvK();paintJoinReqs();};
const _raV=window.renderAdmin;
window.renderAdmin=function(){if(typeof _raV==="function")_raV();ensureAdminVoiceCard();paintJoinReqs();};
try{if(window.ACCESS_OPTS&&!ACCESS_OPTS.some(function(x){return x[0]==="voice";}))ACCESS_OPTS.push(["voice","\u0906\u0935\u093e\u091c \u092e\u094d\u092f\u0942\u091f/\u0939\u091f\u093e\u0913/\u091c\u0949\u0907\u0928"]);}catch(e){}
setTimeout(bindVoiceBan,700);
setTimeout(bindVoiceBan,2000);
setTimeout(ensureAdminVoiceCard,1200);

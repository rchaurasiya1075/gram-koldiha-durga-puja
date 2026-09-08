window._voiceBan=window._voiceBan||{};
function banUntil(id){return Number((window._voiceBan&&window._voiceBan[id])||0);}
function isBanned(id){return banUntil(id)>Date.now();}
function dropPeerNow(id){
  if(!id)return;
  if(window._voicePeers)delete window._voicePeers[id];
  try{if(window._pcs&&window._pcs[id]){window._pcs[id].close();delete window._pcs[id];}}catch(e){}
  try{if(window._aud&&window._aud[id]){window._aud[id].pause();window._aud[id].srcObject=null;delete window._aud[id];}}catch(e){}
}
function applyBans(){
  Object.keys(window._voiceBan||{}).forEach(function(id){
    if(isBanned(id))dropPeerNow(id);
  });
  var me=(typeof voiceId==="function"&&voiceId())||"";
  if(me&&isBanned(me)){
    window._voiceKickUntil=Math.max(window._voiceKickUntil||0,banUntil(me));
    if(window._voiceOn&&typeof leaveVoice==="function")leaveVoice();
  }
}
function bindVoiceBan(){
  if(!window.fs||window._vBanBound)return;window._vBanBound=true;
  try{
    fs.collection("voiceBan").onSnapshot(function(qs){
      window._voiceBan=window._voiceBan||{};
      qs.forEach(function(d){
        var x=d.data()||{};
        var until=Number(x.until||0);
        if(until>Date.now())window._voiceBan[d.id]=until;
        else delete window._voiceBan[d.id];
      });
      applyBans();
      if(typeof renderVoice==="function")renderVoice();
    });
  }catch(e){}
}
const _writeMe0=window.writeMe;
window.writeMe=function(extra){
  var id=(typeof voiceId==="function"&&voiceId())||"";
  if(id&&isBanned(id))return;
  if(window._voiceKickUntil&&Date.now()<window._voiceKickUntil)return;
  if(typeof _writeMe0==="function")return _writeMe0(extra);
};
const _kick0=window.adminKickPeer;
window.adminKickPeer=async function(id){
  if(!id)return;
  var p=(window._voicePeers&&window._voicePeers[id])||{};
  if(!confirm((p.name||id)+" को कॉल से हटाना है?"))return;
  var until=Date.now()+10*60*1000;
  window._voiceBan=window._voiceBan||{};
  window._voiceBan[id]=until;
  dropPeerNow(id);
  if(window.fs){
    try{await fs.collection("voiceBan").doc(String(id)).set({until:until,by:(typeof voiceId==="function"&&voiceId())||"",t:Date.now()});}catch(e){}
    try{await fs.collection("voice").doc(String(id)).delete();}catch(e){}
    try{await fs.collection("voiceMod").add({type:"kick",target:String(id),t:Date.now(),by:(typeof voiceId==="function"&&voiceId())||""});}catch(e){}
  }
  applyBans();
  if(typeof toast==="function")toast("हटा दिया");
  if(typeof renderVoice==="function")renderVoice();
};
const _muteP0=window.adminMutePeer;
window.adminMutePeer=async function(id){
  if(typeof _muteP0==="function")await _muteP0(id);
  if(window.fs&&id){
    try{await fs.collection("voice").doc(String(id)).set({muted:true,forceMute:true,t:Date.now()},{merge:true});}catch(e){}
  }
};
const _joinK=window.joinVoice;
window.joinVoice=async function(){
  var id=(typeof voiceId==="function"&&voiceId())||"";
  if(id&&isBanned(id)){
    if(typeof toast==="function")toast("एडमिन ने हटाया है");
    return;
  }
  if(typeof _joinK==="function")return _joinK();
};
const _rvK=window.renderVoice;
window.renderVoice=function(){
  applyBans();
  if(typeof _rvK==="function")_rvK();
};
setTimeout(bindVoiceBan,700);
setTimeout(bindVoiceBan,2000);
setInterval(function(){
  if(!window.fs)return;
  Object.keys(window._voicePeers||{}).forEach(function(id){
    if(isBanned(id)){
      dropPeerNow(id);
      fs.collection("voice").doc(String(id)).delete().catch(function(){});
    }
  });
},1500);

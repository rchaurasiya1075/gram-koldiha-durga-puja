function realName(){
  if(window.user&&user.name&&user.name!=="श्रद्धालु")return user.name;
  var n=localStorage.getItem("koldiha_name");if(n)return n;
  return (typeof voiceName==="function"&&voiceName())||"श्रद्धालु";
}
function writeMe(extra){
  var id=(typeof voiceId==="function"&&voiceId())||"";if(!id||!window.fs)return;
  var row={id:id,name:realName(),muted:!!window._voiceMuted,talk:!!(window._talking&&window._talking[id]),t:Date.now()};
  if(window.user&&(user.dp||user.photo))row.dp=user.dp||user.photo;
  if(extra)Object.keys(extra).forEach(function(k){row[k]=extra[k];});
  fs.collection("voice").doc(id).set(row,{merge:true}).catch(function(){});
}
const _mute0=window.muteVoice;
window.muteVoice=function(){
  if(typeof _mute0==="function")_mute0();
  writeMe({muted:!!window._voiceMuted});
  if(typeof renderVoice==="function")renderVoice();
};
const _rvS=window.renderVoice;
window.renderVoice=function(){
  if(typeof ensureVoicePage==="function")ensureVoicePage();
  var page=document.getElementById("p-voice");if(!page)return;
  var list=[];
  Object.keys(window._voicePeers||{}).forEach(function(id){
    var x=window._voicePeers[id]||{};
    list.push({id:id,name:x.name||id,muted:!!x.muted,talk:!!x.talk,photo:x.dp||x.photo||""});
  });
  var me=(typeof voiceId==="function"&&voiceId())||"";
  if(window._voiceOn&&me&&!list.some(function(p){return p.id===me;}))
    list.unshift({id:me,name:realName(),muted:!!window._voiceMuted,talk:false,photo:""});
  var cols=["#4f46e5","#db2777","#d97706","#0d9488","#6B1212","#7c3aed"];
  var tiles=list.length?list.map(function(p,i){
    var mine=p.id===me;
    var ini=String(p.name||"?").trim().split(/\s+/);
    ini=((ini[0]||"?").charAt(0)+(ini[1]?ini[1].charAt(0):"")).toUpperCase();
    var av=p.photo?('<img src="'+p.photo+'" style="width:56px;height:56px;border-radius:50%;object-fit:cover">'):('<div class="vav" style="background:'+cols[i%6]+'">'+ini+'</div>');
    var st=p.muted?"🔇 म्यूट":(p.talk?"🎤 बोल रहे":"🔊 अनम्यूट");
    return '<div class="vtile '+(mine?"me":"")+(p.talk&&!p.muted?" speaking":"")+'">'+av+(p.talk&&!p.muted?'<div class="speakw">~ ~ ~</div>':'')+'<div class="vlab"><b>'+p.name+(mine?" · आप":"")+'</b><br>'+st+'</div></div>';
  }).join(""):'<div class="vtile"><div class="vlab">अभी कोई नहीं</div></div>';
  page.innerHTML='<div class="vui"><div class="vui-top"><div><div class="vui-live">● LIVE</div><div style="font-size:15px;font-weight:800;margin-top:4px">कोल्डीहा आवाज़</div><div style="font-size:12px;color:#9ca3af">'+list.length+' जुड़े</div></div></div><div class="vui-grid">'+tiles+'</div><div class="vui-bar">'+(window._voiceOn?'<button onclick="muteVoice()">'+(window._voiceMuted?"🔇":"🎤")+'</button><button class="end" onclick="leaveVoice()">कॉल काटो</button>':'<button class="end" style="background:#16a34a" onclick="joinVoice()">जुड़ें</button>')+'</div></div>';
};
const _joinS=window.joinVoice;
window.joinVoice=async function(){
  if(typeof _joinS==="function")await _joinS();
  writeMe({muted:false,name:realName()});
};

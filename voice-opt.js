async function ensureMic(){
  if(window._localStream)return window._localStream;
  window._localStream=await navigator.mediaDevices.getUserMedia({
    audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1,sampleRate:16000},
    video:false
  });
  return window._localStream;
}
function limitBitrate(pc){
  if(!pc)return;
  pc.getSenders().forEach(function(s){
    if(!(s.track&&s.track.kind==="audio"))return;
    try{
      var p=s.getParameters();
      if(!p.encodings||!p.encodings.length)p.encodings=[{}];
      p.encodings[0].maxBitrate=20000;
      s.setParameters(p).catch(function(){});
    }catch(e){}
  });
}
setTimeout(function(){
  if(typeof callPeer!=="function"||callPeer._opt)return;
  var orig=callPeer;
  callPeer=async function(other){await orig(other);limitBitrate(window._pcs&&window._pcs[other]);};
  callPeer._opt=1;
},0);

/* Low-latency voice. Loads last. Does not change UI or admin kick/mute. */
function iceConf(){
  return {
    iceServers:[
      {urls:["stun:stun.l.google.com:19302","stun:stun1.l.google.com:19302"]},
      {urls:"turn:global.relay.metered.ca:80",username:"openrelayproject",credential:"openrelayproject"}
    ],
    iceCandidatePoolSize:2,
    bundlePolicy:"max-bundle",
    rtcpMuxPolicy:"require",
    iceTransportPolicy:"all"
  };
}
window.iceConf=iceConf;
function fastSdp(sdp){
  if(!sdp)return sdp;
  sdp=sdp.replace(/useinbandfec=0/g,"useinbandfec=1");
  if(sdp.indexOf("minptime=")<0){
    sdp=sdp.replace(/(a=fmtp:\d+ [^
]*)/g,"$1;minptime=10;stereo=0;sprop-stereo=0;maxaveragebitrate=32000;usedtx=1");
  }
  if(sdp.indexOf("a=ptime:")<0)sdp=sdp.replace(/(m=audio[^
]*
)/,"$1a=ptime:20\r\n");
  return sdp;
}
function preferOpus(pc){
  try{
    var cap=RTCRtpSender.getCapabilities&&RTCRtpSender.getCapabilities("audio");
    if(!(cap&&cap.codecs&&pc.getTransceivers))return;
    var opus=cap.codecs.filter(function(c){return /opus/i.test(c.mimeType);});
    var rest=cap.codecs.filter(function(c){return !/opus/i.test(c.mimeType)&&!/rtx|red|cn/i.test(c.mimeType);});
    pc.getTransceivers().forEach(function(tr){
      if(tr.sender&&tr.sender.track&&tr.sender.track.kind==="audio"&&tr.setCodecPreferences){
        tr.setCodecPreferences(opus.concat(rest));
      }
    });
  }catch(e){}
}
function capBitrate(pc){
  if(!pc||!pc.getSenders)return;
  pc.getSenders().forEach(function(s){
    if(!(s.track&&s.track.kind==="audio"))return;
    try{
      var p=s.getParameters();
      if(!p.encodings||!p.encodings.length)p.encodings=[{}];
      p.encodings[0].maxBitrate=32000;
      p.encodings[0].priority="high";
      p.encodings[0].networkPriority="high";
      s.setParameters(p).catch(function(){});
    }catch(e){}
  });
}
function lowJitter(pc){
  if(!pc||!pc.getReceivers)return;
  pc.getReceivers().forEach(function(r){
    try{if("jitterBufferTarget" in r)r.jitterBufferTarget=60;}catch(e){}
  });
}
const _ensureMicFast=window.ensureMic;
window.ensureMic=async function(){
  if(window._localStream){
    var live=window._localStream.getAudioTracks().some(function(t){return t.readyState==="live";});
    if(live)return window._localStream;
  }
  try{
    window._localStream=await navigator.mediaDevices.getUserMedia({
      audio:{
        echoCancellation:true,
        noiseSuppression:true,
        autoGainControl:true,
        channelCount:1,
        latency:0.01
      },
      video:false
    });
    return window._localStream;
  }catch(e){
    if(typeof _ensureMicFast==="function")return _ensureMicFast();
    throw e;
  }
};
const _playRemote=window.playRemote;
window.playRemote=function(id,stream){
  if(typeof _playRemote==="function"){
    _playRemote(id,stream);
  }else{
    var a=window._aud[id];if(!a){a=new Audio();a.autoplay=true;a.playsInline=true;window._aud[id]=a;}
    a.srcObject=stream;a.play().catch(function(){});
  }
  var a=window._aud&&window._aud[id];
  if(a){a.playsInline=true;try{a.preload="auto";}catch(e){}}
};
function wrapPc(pc){
  if(!pc||pc._fast)return pc;pc._fast=1;
  var co=pc.createOffer.bind(pc),ca=pc.createAnswer.bind(pc),sld=pc.setLocalDescription.bind(pc);
  pc.createOffer=async function(o){var d=await co(o);return {type:d.type,sdp:fastSdp(d.sdp)};};
  pc.createAnswer=async function(o){var d=await ca(o);return {type:d.type,sdp:fastSdp(d.sdp)};};
  pc.setLocalDescription=function(d){
    if(d&&d.sdp)d={type:d.type,sdp:fastSdp(d.sdp)};
    return sld(d);
  };
  var ot=pc.ontrack;
  pc.ontrack=function(e){
    if(typeof ot==="function")ot(e);
    lowJitter(pc);
  };
  preferOpus(pc);
  setTimeout(function(){capBitrate(pc);lowJitter(pc);},300);
  return pc;
}
const _makePC=window.makePC;
if(typeof makePC==="function"){
  window.makePC=async function(other){
    var pc=await makePC(other);
    return wrapPc(pc);
  };
}
setInterval(function(){
  Object.keys(window._pcs||{}).forEach(function(id){wrapPc(window._pcs[id]);});
},1500);

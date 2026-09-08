function iceConf(){
  return {
    iceServers:[
      {urls:["stun:stun.l.google.com:19302","stun:stun1.l.google.com:19302","stun:stun.relay.metered.ca:80"]},
      {urls:"turn:openrelay.metered.ca:80",username:"openrelayproject",credential:"openrelayproject"},
      {urls:"turn:openrelay.metered.ca:443",username:"openrelayproject",credential:"openrelayproject"},
      {urls:"turns:openrelay.metered.ca:443?transport=tcp",username:"openrelayproject",credential:"openrelayproject"},
      {urls:"turn:global.relay.metered.ca:80",username:"openrelayproject",credential:"openrelayproject"},
      {urls:"turns:global.relay.metered.ca:443?transport=tcp",username:"openrelayproject",credential:"openrelayproject"}
    ],
    iceCandidatePoolSize:4
  };
}

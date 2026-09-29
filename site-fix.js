(function(){
  if(window._siteFix81)return;window._siteFix81=1;
  function killVoice(){
    ["tileVoice","p-voice","vbanner","adminVoiceReq"].forEach(function(id){
      var n=document.getElementById(id);if(n&&n.parentNode)n.parentNode.removeChild(n);
    });
    document.querySelectorAll(".vui").forEach(function(n){if(n.parentNode)n.parentNode.removeChild(n);});
  }
  window.joinVoice=async function(){killVoice();if(typeof toast==="function")toast("लाइव आवाज़ बंद है। टेक्स्ट चैट खोलें");if(typeof go==="function")go("chat");};
  window.leaveVoice=async function(){killVoice();};
  window.voiceHomeBtn=function(){killVoice();};
  window.voiceBanner=function(){killVoice();};
  window.renderVoice=function(){killVoice();};
  var ticks=0;
  var timer=setInterval(function(){killVoice();if(++ticks>20)clearInterval(timer);},700);
  window.addEventListener("load",killVoice);
})();

setInterval(function(){
  document.querySelectorAll("iframe").forEach(function(f){
    if(/jitsi|meet\.jit|8x8/i.test(f.src||""))f.remove();
  });
},800);

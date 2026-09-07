(function(){
  ["donate.js?v=19","access.js?v=19","share.js?v=19"].forEach(function(src){
    var s=document.createElement("script");
    s.src="./"+src;
    document.body.appendChild(s);
  });
})();

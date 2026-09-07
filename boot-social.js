(function(){
  ["gal-perm.js?v=22","social.js?v=24","chat-ui.js?v=25","notify.js?v=26"].forEach(function(src){
    var s=document.createElement("script");
    s.src="./"+src;
    document.body.appendChild(s);
  });
})();

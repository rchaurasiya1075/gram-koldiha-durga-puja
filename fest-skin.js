(function(){
  if(window._festSkin)return;window._festSkin=1;
  function boot(){
    var phone=document.querySelector(".phone");
    if(!phone||document.getElementById("particleCanvas"))return;
    var canvas=document.createElement("canvas");
    canvas.id="particleCanvas";
    phone.insertBefore(canvas,phone.firstChild);
    var head=document.querySelector(".vhead");
    if(head&&!head.querySelector(".fest-lamps")){
      var box=document.createElement("div");
      box.className="fest-lamps";
      box.innerHTML='<div class="lamp"><div class="cord"></div><div class="fire">🔥</div></div><div class="om-badge">ॐ</div><div class="lamp late"><div class="cord"></div><div class="fire">🔥</div></div>';
      head.insertBefore(box,head.firstChild);
    }
    var ctx=canvas.getContext("2d");
    var bits=[];
    function size(){canvas.width=phone.clientWidth;canvas.height=phone.clientHeight;}
    function Bit(){this.reset(true);}
    Bit.prototype.reset=function(anyY){
      this.x=Math.random()*canvas.width;
      this.y=anyY?Math.random()*canvas.height:canvas.height;
      this.size=Math.random()*2.4+1;
      this.speedY=Math.random()*0.7+0.25;
      this.speedX=Math.random()*0.5-0.25;
      this.opacity=Math.random()*0.7+0.25;
      this.color=Math.random()>0.4?"#FFD700":"#FF9933";
    };
    Bit.prototype.step=function(){
      this.y-=this.speedY;this.x+=this.speedX;
      if(this.y<0)this.reset(false);
    };
    function frame(){
      if(!ctx)return;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for(var i=0;i<bits.length;i++){
        var p=bits[i];p.step();
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.size,0,6.28);
        ctx.fillStyle=p.color;
        ctx.globalAlpha=p.opacity;
        ctx.fill();
      }
      ctx.globalAlpha=1;
      requestAnimationFrame(frame);
    }
    size();
    for(var n=0;n<36;n++)bits.push(new Bit());
    window.addEventListener("resize",size);
    frame();
  }
  if(document.querySelector(".phone"))boot();
  else window.addEventListener("DOMContentLoaded",boot);
})();

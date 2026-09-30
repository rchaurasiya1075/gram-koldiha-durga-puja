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
    var colors=["#FFD700","#FF9933","#FFB347","#FFF3C4"];
    function size(){canvas.width=phone.clientWidth||320;canvas.height=phone.clientHeight||640;}
    function Bit(kind){this.kind=kind;this.reset(true);}
    Bit.prototype.reset=function(anyY){
      this.x=Math.random()*canvas.width;
      this.y=anyY?Math.random()*canvas.height:canvas.height+8;
      this.size=this.kind==="petal"?Math.random()*5+4:Math.random()*2.2+1.2;
      this.speedY=this.kind==="petal"?Math.random()*0.45+0.18:Math.random()*0.85+0.35;
      this.sway=Math.random()*1.2+0.3;
      this.phase=Math.random()*6.28;
      this.spin=Math.random()*0.04+0.01;
      this.rot=Math.random()*6.28;
      this.opacity=Math.random()*0.45+0.35;
      this.tw=Math.random()*0.03+0.01;
      this.color=colors[(Math.random()*colors.length)|0];
    };
    Bit.prototype.step=function(t){
      this.phase+=0.02;
      this.y-=this.speedY;
      this.x+=Math.sin(this.phase)*this.sway*0.35;
      this.rot+=this.spin;
      if(this.y<-12)this.reset(false);
      this.a=this.opacity*(0.65+0.35*Math.sin(t*this.tw+this.phase));
    };
    function drawPetal(p){
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha=p.a;
      ctx.fillStyle=p.color;
      ctx.beginPath();
      ctx.ellipse(0,0,p.size*0.45,p.size,0,0,6.28);
      ctx.fill();
      ctx.restore();
    }
    function drawSpark(p){
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha=p.a;
      ctx.fillStyle=p.color;
      ctx.beginPath();
      var s=p.size;
      ctx.moveTo(0,-s*2.2);
      ctx.lineTo(s*0.45,0);
      ctx.lineTo(0,s*2.2);
      ctx.lineTo(-s*0.45,0);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha=p.a*0.7;
      ctx.beginPath();
      ctx.arc(0,0,s*0.55,0,6.28);
      ctx.fill();
      ctx.restore();
    }
    function frame(t){
      if(!ctx)return;
      if(document.hidden){requestAnimationFrame(frame);return;}
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for(var i=0;i<bits.length;i++){
        var p=bits[i];
        p.step(t||0);
        if(p.kind==="petal")drawPetal(p);else drawSpark(p);
      }
      ctx.globalAlpha=1;
      requestAnimationFrame(frame);
    }
    size();
    var i;
    for(i=0;i<16;i++)bits.push(new Bit("petal"));
    for(i=0;i<22;i++)bits.push(new Bit("spark"));
    window.addEventListener("resize",size);
    requestAnimationFrame(frame);
  }
  if(document.querySelector(".phone"))boot();
  else window.addEventListener("DOMContentLoaded",boot);
})();

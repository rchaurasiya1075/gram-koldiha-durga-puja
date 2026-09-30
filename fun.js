(function(){
  if(window._funReady)return;window._funReady=1;
  var speaking=false,queued=false,unlock=0;
  var actx=null,master=null,tuneTimer=0,tuneId="";
  function muted(){var v=localStorage.getItem("koldiha_mute");return v!=="0";}
  function paintMute(){
    var b=document.getElementById("muteBtn");
    if(b)b.textContent=muted()?"🔇":"🔊";
  }
  function pickVoice(){
    var list=window.speechSynthesis?speechSynthesis.getVoices():[];
    var hi=list.filter(function(v){return /hi[-_]IN|hindi/i.test((v.lang||"")+" "+(v.name||""));});
    var soft=hi.filter(function(v){return /female|heera|swara/i.test(v.name||"");});
    return soft[0]||hi[0]||null;
  }
  window.sayJai=function(){
    if(muted()||!window.speechSynthesis)return;
    if(speaking){queued=true;return;}
    speaking=true;queued=false;
    var u=new SpeechSynthesisUtterance("जय माता दी");
    u.lang="hi-IN";u.rate=0.86;u.pitch=1.02;u.volume=0.55;
    var v=pickVoice();if(v)u.voice=v;
    function done(){
      if(!speaking)return;
      speaking=false;clearTimeout(unlock);
      if(queued&&!muted())sayJai();
    }
    u.onend=done;u.onerror=done;
    clearTimeout(unlock);
    unlock=setTimeout(done,3400);
    speechSynthesis.speak(u);
  };
  window.stopFunAudio=function(){
    tuneId="";clearTimeout(tuneTimer);
    try{if(actx&&actx.state!=="closed")actx.suspend();}catch(e){}
  };
  function audioOn(){
    var AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return null;
    if(!actx){actx=new AC();master=actx.createGain();master.gain.value=0.06;master.connect(actx.destination);}
    if(actx.state==="suspended")actx.resume();
    return actx;
  }
  function blip(freq,when,dur,type){
    var o=actx.createOscillator(),g=actx.createGain();
    o.type=type||"sine";o.frequency.setValueAtTime(freq,when);
    g.gain.setValueAtTime(0.0001,when);
    g.gain.exponentialRampToValueAtTime(0.8,when+0.03);
    g.gain.exponentialRampToValueAtTime(0.0001,when+dur);
    o.connect(g);g.connect(master);
    o.start(when);o.stop(when+dur+0.02);
  }
  var tunes={
    aarti:{name:"आरती",loop:4.6,wave:"triangle",notes:[[0,261.63,.45],[.5,329.63,.45],[1,392,.6],[1.7,329.63,.35],[2.15,392,.7],[3,523.25,.55],[3.7,392,.7]]},
    dhak:{name:"ढाक",loop:1.2,wave:"triangle",notes:[[0,110,.16],[.22,146,.1],[.42,110,.16],[.78,174,.14]]},
    shankh:{name:"शंख",loop:3.2,wave:"sine",notes:[[0,392,1.1],[.15,494,1],[.3,587,1.4]]},
    shant:{name:"शांत स्वर",loop:5,wave:"sine",notes:[[0,196,.8],[1,247,.8],[2,294,.9],[3.1,247,.8],[4,196,1]]},
    utsav:{name:"उत्सव",loop:3.2,wave:"triangle",notes:[[0,392,.25],[.3,440,.25],[.6,494,.25],[.9,587,.4],[1.4,494,.25],[1.7,587,.5],[2.3,659,.6]]}
  };
  window.playTune=function(id){
    if(muted())return toast("आवाज़ बंद है। ऊपर बटन से खोलें");
    if(tuneId===id){window.stopFunAudio();renderPlay();return;}
    if(!audioOn())return toast("इस फ़ोन पर धुन नहीं चली");
    tuneId=id;clearTimeout(tuneTimer);
    var tune=tunes[id],cursor=actx.currentTime+0.05;
    function loop(){
      if(tuneId!==id)return;
      tune.notes.forEach(function(n){blip(n[1],cursor+n[0],n[2],tune.wave);});
      cursor+=tune.loop;
      tuneTimer=setTimeout(loop,Math.max(200,(tune.loop-0.25)*1000));
    }
    loop();renderPlay();
  };
  function root(){return document.getElementById("playRoot");}
  window.renderPlay=function(){
    if(window._stopFlower)window._stopFlower();
    var box=root();if(!box)return;
    var songs="";
    Object.keys(tunes).forEach(function(id){
      songs+='<button type="button" class="songbtn'+(tuneId===id?" on":"")+'" onclick="playTune(\''+id+'\')">'+(tuneId===id?"रोकें · ":"बजाएँ · ")+tunes[id].name+"</button>";
    });
    box.innerHTML='<p class="meta">हल्का खेल और धीमी धुन। आवाज़ ऊपर से बंद कर सकते हैं।</p><div class="playgrid"><button type="button" class="card playcard" onclick="startMem()">जोड़ी मिलाओ</button><button type="button" class="card playcard" onclick="startTtt()">शून्य-क्रॉस</button><button type="button" class="card playcard" onclick="startFlowers()">फूल पकड़ो</button></div><h2 class="seva-h">भजन धुन</h2><div class="songlist">'+songs+"</div>";
  };
  window.startMem=function(){
    var icons=["🪔","ॐ","🌸","🥁","🐚","🌺"];
    var deck=icons.concat(icons).map(function(ic,i){return {ic:ic,id:i};}).sort(function(){return Math.random()-.5;});
    var open=[],done={},lock=false,found=0;
    var box=root();
    function draw(){
      box.innerHTML='<p class="meta">एक जैसी दो तस्वीरें मिलाओ</p><div class="mem">'+deck.map(function(c,i){
        var show=done[i]||open.indexOf(i)>=0;
        return '<button type="button" class="mcard'+(show?" on":"")+'" onclick="flipMem('+i+')">'+(show?c.ic:"")+"</button>";
      }).join("")+'</div><button type="button" class="btn ghost" onclick="renderPlay()">वापस</button>';
      if(found===6)box.innerHTML='<div class="card"><b>जय माता दी</b><p>सारी जोड़ी मिल गई।</p></div><button type="button" class="btn" onclick="startMem()">फिर खेलें</button><button type="button" class="btn ghost" onclick="renderPlay()">वापस</button>';
    }
    window.flipMem=function(i){
      if(lock||done[i]||open.indexOf(i)>=0)return;
      open.push(i);draw();
      if(open.length<2)return;
      lock=true;
      var a=open[0],b=open[1];
      setTimeout(function(){
        if(deck[a].ic===deck[b].ic){done[a]=done[b]=1;found++;}
        open=[];lock=false;draw();
      },520);
    };
    draw();
  };
  window.startTtt=function(){
    var b=["","","","","","","","",""],turn="X",over=false,mode="two";
    var box=root();
    function win(m){
      var lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      for(var i=0;i<lines.length;i++){var L=lines[i];if(b[L[0]]&&b[L[0]]===b[L[1]]&&b[L[1]]===b[L[2]])return b[L[0]];}
      if(b.every(function(x){return x;}))return "draw";
      return "";
    }
    function cpu(){
      var empty=[];b.forEach(function(v,i){if(!v)empty.push(i);});
      if(!empty.length)return;
      b[empty[(Math.random()*empty.length)|0]]="O";
      turn="X";
    }
    function draw(){
      var w=win();
      var msg=w==="draw"?"बराबर":w==="X"?(mode==="two"?"पहला जीता":"आप जीते"):w==="O"?(mode==="two"?"दूसरा जीता":"साथ खेल हारा"):(turn==="X"?"पहली बारी":"दूसरी बारी");
      box.innerHTML='<p class="meta">'+msg+'</p><div class="tgrid">'+b.map(function(v,i){return '<button type="button" class="tcell" onclick="tttPut('+i+')">'+(v==="X"?"✕":v==="O"?"○":"")+"</button>";}).join("")+'</div><div class="playgrid"><button type="button" class="btn ghost" onclick="tttMode(\'two\')">दो खिलाड़ी</button><button type="button" class="btn ghost" onclick="tttMode(\'cpu\')">अकेले</button></div><button type="button" class="btn ghost" onclick="renderPlay()">वापस</button>';
    }
    window.tttMode=function(m){mode=m;b=["","","","","","","","",""];turn="X";over=false;draw();};
    window.tttPut=function(i){
      if(over||b[i])return;
      if(mode==="cpu"&&turn!=="X")return;
      b[i]=turn;turn=turn==="X"?"O":"X";
      var w=win();if(w)over=true;
      draw();
      if(!over&&mode==="cpu"&&turn==="O")setTimeout(function(){cpu();if(win())over=true;draw();},380);
    };
    draw();
  };
  window.startFlowers=function(){
    var box=root(),score=0,life=3,stop=false,timer=0;
    box.innerHTML='<p class="meta">स्कोर <b id="fs">0</b> · जान <b id="fl">3</b></p><div id="field" class="field"></div><button type="button" class="btn ghost" onclick="renderPlay()">वापस</button>';
    var field=document.getElementById("field");
    function end(){
      stop=true;clearInterval(timer);
      if(field)field.innerHTML='<p class="meta">खेल खत्म। स्कोर '+score+"</p>";
    }
    window._stopFlower=function(){stop=true;clearInterval(timer);};
    timer=setInterval(function(){
      if(stop||!field)return;
      var f=document.createElement("button");
      f.type="button";f.className="flower";f.textContent="🌸";
      f.style.left=(6+Math.random()*78)+"%";
      f.onclick=function(){if(stop)return;score++;var s=document.getElementById("fs");if(s)s.textContent=score;f.remove();};
      field.appendChild(f);
      setTimeout(function(){
        if(!f.parentNode||stop)return;
        f.remove();life--;
        var L=document.getElementById("fl");if(L)L.textContent=life;
        if(life<=0)end();
      },2100);
    },680);
  };
  function muteToggle(){
    var on=muted();
    localStorage.setItem("koldiha_mute",on?"0":"1");
    if(!on){
      queued=false;speaking=false;clearTimeout(unlock);
      try{speechSynthesis.cancel();}catch(e){}
      window.stopFunAudio();
    }
    paintMute();
  }
  function mount(){
    var bar=document.querySelector(".appbar");
    if(!bar||document.getElementById("muteBtn"))return;
    var b=document.createElement("button");
    b.type="button";b.id="muteBtn";b.className="iconbtn soundbtn";
    b.setAttribute("aria-label","आवाज़");
    b.onclick=muteToggle;
    var news=bar.querySelectorAll("button");
    if(news.length)bar.insertBefore(b,news[news.length-1]);
    else bar.appendChild(b);
    paintMute();
  }
  var oldTab=window.showTab;
  if(typeof oldTab==="function"){
    window.showTab=function(t){
      var same=window._tabNow===t;
      window._tabNow=t;
      oldTab(t);
      if(!same)sayJai();
    };
  }
  if(window.speechSynthesis)speechSynthesis.onvoiceschanged=pickVoice;
  if(document.querySelector(".appbar"))mount();
  else window.addEventListener("DOMContentLoaded",mount);
})();

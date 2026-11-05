(function(){
  var $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

  // Header becomes solid after scrolling
  var hdr=$('#hdr');
  function onScroll(){ if(hdr) hdr.classList.toggle('solid',window.scrollY>60); parallax(); }
  window.addEventListener('scroll',onScroll,{passive:true});

  // Mobile menu
  var burger=$('#burger');
  if(burger){
    burger.addEventListener('click',function(){var o=document.body.classList.toggle('menu');burger.setAttribute('aria-expanded',o)});
    $$('#mnav a').forEach(function(a){a.addEventListener('click',function(){document.body.classList.remove('menu');burger.setAttribute('aria-expanded','false')})});
  }

  // Stats slider (RTL: scrollLeft runs 0 → negative)
  var tr=$('#statsTrack');
  if(tr){
    var bar=$('#statsBar'),prev=$('#statsPrev'),next=$('#statsNext');
    var upd=function(){
      var max=tr.scrollWidth-tr.clientWidth,pos=Math.abs(tr.scrollLeft),vis=tr.clientWidth/tr.scrollWidth;
      bar.style.width=(max<=0?100:(vis+(1-vis)*(pos/max))*100)+'%';
      prev.disabled=pos<4; next.disabled=max<=0||pos>max-4;
    };
    var step=function(dir){var s=$('.stat',tr);tr.scrollBy({left:-dir*(s.offsetWidth+32),behavior:'smooth'})};
    prev.addEventListener('click',function(){step(-1)});
    next.addEventListener('click',function(){step(1)});
    tr.addEventListener('scroll',upd,{passive:true});
    window.addEventListener('resize',upd); upd();
  }

  // Reveal: only elements below the first screen start hidden, so the page is complete at rest
  var io='IntersectionObserver' in window ? new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');e.target.classList.remove('pre');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'}) : null;
  $$('.rv,.bars').forEach(function(el){
    if(io && el.getBoundingClientRect().top>window.innerHeight){el.classList.add('pre');io.observe(el)}
  });

  // Indicators: staggered entrance and numbers counting up
  var kp=$('#kpis');
  if(kp && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches && kp.getBoundingClientRect().top>window.innerHeight*.85){
    var nums=$$('b .n',kp);
    nums.forEach(function(n){n.dataset.to=n.textContent;n.textContent=(0).toFixed((n.textContent.split('.')[1]||'').length)});
    kp.classList.add('k-pre');
    var ko=new IntersectionObserver(function(es){
      if(!es[0].isIntersecting)return; ko.disconnect();
      requestAnimationFrame(function(){kp.classList.add('k-go')});
      nums.forEach(function(n,idx){
        var to=parseFloat(n.dataset.to),dec=(n.dataset.to.split('.')[1]||'').length,dur=3200,t0=null;
        setTimeout(function(){requestAnimationFrame(function step(t){
          if(!t0)t0=t; var p=Math.min((t-t0)/dur,1),e=1-Math.pow(1-p,4);
          n.textContent=(to*e).toFixed(dec); if(p<1)requestAnimationFrame(step); else n.textContent=n.dataset.to;
        })},1000+idx*240);
      });
    },{threshold:.25});
    ko.observe(kp);
  }

  // Magic text: words light up one by one as the block scrolls through the screen
  $$('[data-magic]').forEach(function(box){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var words=[];
    $$('p',box).forEach(function(p){
      var parts=p.textContent.trim().split(/\s+/);
      p.textContent='';
      parts.forEach(function(t,i){
        var w=document.createElement('span');w.className='w';w.setAttribute('data-t',t+(i<parts.length-1?' ':''));
        var b=document.createElement('b');b.textContent=t+(i<parts.length-1?' ':'');w.appendChild(b);p.appendChild(w);words.push(b);
      });
    });
    box.classList.add('mg');
    var n=words.length;
    var upd=function(){
      var r=box.getBoundingClientRect(),vh=window.innerHeight;
      // 0 when the block's top is at 90% of the screen, 1 when it reaches 25%
      var p=(vh*.9-r.top)/(vh*.65); p=Math.max(0,Math.min(1,p));
      for(var i=0;i<n;i++){var a=i/n,b=(i+1)/n,o=(p-a)/(b-a);words[i].style.setProperty('--o',Math.max(0,Math.min(1,o)).toFixed(3))}
    };
    window.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);upd();
  });

  // Parallax on the wide image (home)
  var px=$('#parallax');
  function parallax(){
    if(!px)return; var r=px.parentNode.getBoundingClientRect(),vh=window.innerHeight;
    if(r.bottom<0||r.top>vh)return;
    var p=(r.top+r.height/2-vh/2)/vh; px.style.transform='translateY('+(-8+p*-10)+'%)';
  }
  // Mirror doors (home): they swing open once the frame is well on screen
  var mir=$('#mirror');
  if(mir && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches && mir.getBoundingClientRect().top>window.innerHeight*.5){
    mir.classList.add('on');
    var mo=new IntersectionObserver(function(es){
      if(es[0].intersectionRatio<.55)return; mo.disconnect(); mir.classList.add('open');
    },{threshold:[.55]});
    mo.observe(mir);
  }

  onScroll();

  // Dash wave (home)
  var svg=$('#dashSvg');
  if(svg){
    var cols=48,rows=2,out='';
    for(var r=0;r<rows;r++){for(var c=0;c<cols;c++){
      var x=15+c*(1410/(cols-1)),y=40+r*60,t=c/(cols-1);
      var a=Math.sin((t*2.2+r*.35)*Math.PI)*Math.pow(Math.sin(t*Math.PI),.6)*80;
      out+='<line x1="-13" y1="0" x2="13" y2="0" transform="translate('+x.toFixed(1)+' '+y+') rotate('+a.toFixed(1)+')"/>';
    }}
    svg.innerHTML='<g stroke="currentColor" stroke-width="3.2" stroke-linecap="square">'+out+'</g>';
  }

  // Report filter tabs
  var tabs=$$('.tabs button');
  tabs.forEach(function(b){b.addEventListener('click',function(){
    tabs.forEach(function(x){x.setAttribute('aria-pressed',x===b)});
    var f=b.getAttribute('data-f');
    $$('.rlist li').forEach(function(li){li.hidden=!(f==='all'||li.getAttribute('data-k')===f)});
  })});

  // Copy buttons
  $$('.copy').forEach(function(b){b.addEventListener('click',function(){
    var t=b.getAttribute('data-copy'),done=function(){var o=b.textContent;b.textContent='تم النسخ';setTimeout(function(){b.textContent=o},1600)};
    var sel=function(){var el=b.previousElementSibling;if(!el)return;var rg=document.createRange();rg.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(rg)};
    try{navigator.clipboard.writeText(t).then(done,sel)}catch(e){sel()}
  })});

  // Contact form: validates, then prepares the message for email
  var form=$('#cform');
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var err=$('#cerr'); err.textContent='';
      var el=form.elements, name=el.fname.value.trim(), phone=el.fphone.value.trim(), email=el.femail.value.trim(), msg=el.fmsg.value.trim();
      var topic=(form.querySelector('input[name=topic]:checked')||{}).value||'استفسار عام';
      if(!name||(!phone&&!email)||!msg){err.textContent='أكمل الاسم ووسيلة تواصل واحدة على الأقل (الجوال أو البريد) ونص الرسالة';return}
      var body='الاسم: '+name+'\nالجوال: '+(phone||'-')+'\nالبريد: '+(email||'-')+'\nالموضوع: '+topic+'\n\n'+msg;
      var href='mailto:PR@unicorn.com.sa?subject='+encodeURIComponent('['+topic+'] من '+name)+'&body='+encodeURIComponent(body);
      var d=$('#cdone'); d.hidden=false;
      $('#cmail').setAttribute('href',href);
      try{window.location.href=href}catch(x){}
    });
  }
})();

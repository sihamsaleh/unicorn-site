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

  // Magic text: on every page, body text (not headings) lights up word by word as it scrolls in
  (function(){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var skip='.hero,.phero,form,[hidden],.form-done,.src,.kpis-head,.sec-title,hgroup,header';
    var items=[];
    $$('main p, main blockquote').forEach(function(p){
      if(p.children.length||p.closest(skip)||!p.textContent.trim()||/GE SS Two/i.test(getComputedStyle(p).fontFamily)||!/[\u0600-\u06FF]/.test(p.textContent))return;
      var parts=p.textContent.trim().split(/\s+/),words=[];
      p.textContent='';
      parts.forEach(function(t,i){
        if(i)p.appendChild(document.createTextNode(' '));
        var w=document.createElement('span');w.className='w';w.setAttribute('data-t',t);
        var bb=document.createElement('b');bb.textContent=t;w.appendChild(bb);p.appendChild(w);words.push(bb);
      });
      p.setAttribute('data-magic','');
      items.push({el:p,words:words});
    });
    if(!items.length)return;
    // Plays by itself once the text is on screen: line after line, each line sweeping across its words
    var LINE=850,queue=0;
    items.forEach(function(it){it.words.forEach(function(w){w.style.setProperty('--o','0')})});
    var play=function(it){
      var lines=[],lastTop=null;
      it.words.forEach(function(w){var t=Math.round(w.parentNode.offsetTop);if(lastTop===null||Math.abs(t-lastTop)>4){lines.push([]);lastTop=t}lines[lines.length-1].push(w)});
      var now=performance.now(),start=Math.max(0,queue-now);
      lines.forEach(function(ln,li){ln.forEach(function(w,wi){
        w.style.transitionDelay=(start+li*LINE+wi/ln.length*LINE*.85).toFixed(0)+'ms';w.style.setProperty('--o','1')})});
      queue=now+start+lines.length*LINE*.9;
    };
    if(!('IntersectionObserver' in window)){items.forEach(play);return}
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;io.unobserve(e.target);
      var it=items.filter(function(x){return x.el===e.target})[0];if(it)play(it)})},{threshold:.35,rootMargin:'0px 0px -8% 0px'});
    items.forEach(function(it){io.observe(it.el)});
  })();

  // Beam wordmark footer: fit UNICORN to the width, a slow shaft of light that leans toward the pointer
  (function(){
    var root=$('.bwf'); if(!root)return;
    var inner=$('.bwf-word-in',root),box=$('.bwf-word',root),letters=$$('.bwf-l',root);
    var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    var clamp=function(v,lo,hi){return v<lo?lo:v>hi?hi:v};
    var approach=function(f,t,k,dt){return t+(f-t)*Math.pow(1-k,clamp(dt,0,.1)*60)};
    var drift=function(t){return 58+9*(.7*Math.sin(t*.21)+.3*Math.sin(t*.077+1.3))};
    var place=function(){
      var r=root.getBoundingClientRect();
      root.style.setProperty('--bwf-rw',r.width+'px');root.style.setProperty('--bwf-rh',r.height+'px');
      var top=0;
      letters.forEach(function(s,i){var x=0,y=0,el=s;while(el&&el!==root){x+=el.offsetLeft;y+=el.offsetTop;el=el.offsetParent}
        s.style.setProperty('--bwf-x',x+'px');s.style.setProperty('--bwf-y',y+'px');if(!i)top=y});
      var fs=parseFloat(inner.style.fontSize)||0;
      root.style.setProperty('--bwf-top',top+'px');root.style.setProperty('--bwf-bot',(top+fs*.92)+'px');
    };
    var fit=function(){
      var wb=inner.parentElement,pad=parseFloat(getComputedStyle(wb).paddingLeft)||0,target=wb.clientWidth-pad*2;
      inner.style.fontSize='100px';var m=inner.offsetWidth;
      var size=m>0?Math.min(100*target/m,target*.42):0; inner.style.fontSize=size+'px';
      box.style.height=(size*.86)+'px'; place();
    };
    var fr=0,sched=function(){cancelAnimationFrame(fr);fr=requestAnimationFrame(fit)};
    fit(); if('ResizeObserver' in window)new ResizeObserver(sched).observe(root); else window.addEventListener('resize',sched);
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(sched);
    var ptr={u:.5,x:0,y:0,inside:false};
    var onP=function(e){var r=root.getBoundingClientRect();ptr.x=e.clientX-r.left;ptr.y=e.clientY-r.top;ptr.u=r.width?ptr.x/r.width:.5;ptr.inside=e.type!=='pointerleave'};
    ['pointermove','pointerenter','pointerleave'].forEach(function(t){root.addEventListener(t,onP)});
    var set=function(b,px,py,g){root.style.setProperty('--bwf-b',b.toFixed(2)+'%');root.style.setProperty('--bwf-px',px.toFixed(1)+'px');root.style.setProperty('--bwf-py',py.toFixed(1)+'px');root.style.setProperty('--bwf-g',g.toFixed(3))};
    var raf=0,last=0,t=0,b=58,px=0,py=0,g=0,visible=false;
    var tick=function(now){
      var dt=Math.min(.1,(now-last)/1000);last=now;t+=dt;
      // RTL: the pointer's right edge maps to the start of the gradient
      var target=reduced?58:(ptr.inside?(30+52*clamp(1-ptr.u,0,1))*.75+drift(t)*.25:drift(t));
      b=reduced?58:approach(b,target,.035,dt);px=approach(px,ptr.x,.16,dt);py=approach(py,ptr.y,.16,dt);g=approach(g,ptr.inside?1:0,.06,dt);
      set(b,px,py,g); raf=visible?requestAnimationFrame(tick):0;
    };
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){visible=es[0].isIntersecting;
        if(visible){root.setAttribute('data-in','true');place();if(!raf){last=performance.now();raf=requestAnimationFrame(tick)}}
      },{threshold:.12}).observe(root);
    } else root.setAttribute('data-in','true');
    // staggered entrance for labels, socials, credits and links
    var d=0;$$('.bwf-label,.bwf-fade',root).forEach(function(el){el.style.setProperty('--bwf-d',(d+=70)+'ms')});
    letters.forEach(function(l){
      l.addEventListener('click',function(){if(reduced)return;l.classList.remove('is-hop');void l.offsetWidth;l.classList.add('is-hop')});
      l.addEventListener('animationend',function(){l.classList.remove('is-hop')});
    });
  })();

  // opps-expand: hovering, focusing or tapping a slim card opens it
  (function(){
    var cs=$$('.opps .card'); if(!cs.length)return;
    var open=function(c){cs.forEach(function(x){x.classList.toggle('on',x===c)})};
    cs.forEach(function(c){
      c.addEventListener('mouseenter',function(){if(matchMedia('(hover:hover)').matches)open(c)});
      c.addEventListener('focus',function(){open(c)});
      c.addEventListener('click',function(e){if(!c.classList.contains('on')){e.preventDefault();open(c)}});
    });
  })();

  // Spotlight glow on the opportunity cards: follows the pointer across all three
  var gcards=$$('.opps .card');
  if(gcards.length && matchMedia('(hover:hover)').matches){
    gcards.forEach(function(c){var s=document.createElement('span');s.className='spot';s.setAttribute('aria-hidden','true');c.appendChild(s)});
    var gx=0,gy=0,graf=0;
    var gpaint=function(){graf=0;gcards.forEach(function(c){var r=c.getBoundingClientRect();
      c.style.setProperty('--x',(gx-r.left).toFixed(0)+'px');c.style.setProperty('--y',(gy-r.top).toFixed(0)+'px');
      // fade in only as the pointer comes within ~140px of the card
      var dx=Math.max(r.left-gx,0,gx-r.right),dy=Math.max(r.top-gy,0,gy-r.bottom),d=Math.sqrt(dx*dx+dy*dy);
      c.style.setProperty('--o',Math.max(0,1-d/140).toFixed(2));})};
    document.addEventListener('pointermove',function(e){gx=e.clientX;gy=e.clientY;if(!graf)graf=requestAnimationFrame(gpaint)},{passive:true});
    document.addEventListener('pointerleave',function(){gx=gy=-9999;if(!graf)graf=requestAnimationFrame(gpaint)});
    window.addEventListener('scroll',function(){if(!graf)graf=requestAnimationFrame(gpaint)},{passive:true});
  }

  // Hero curtain (#heroCurtain): dim and push the hero back as the next section covers it
  var hc=document.body.classList.contains('home')?$('.hero'):null;
  if(hc && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    var hcUpd=function(){var p=Math.max(0,Math.min(1,window.scrollY/window.innerHeight));hc.style.setProperty('--hp',p.toFixed(3))};
    window.addEventListener('scroll',hcUpd,{passive:true});hcUpd();
  }

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

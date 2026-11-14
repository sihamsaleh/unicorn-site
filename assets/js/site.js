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

  // About page: calm staggered rise, section by section, one element after another
  if(document.body.classList.contains('about') && 'IntersectionObserver' in window){
    var asel='.eyebrow,h1,.phero .wrap>p,.kicker,.h2,.pv-lead,.prose p,.pv-val,.pv-xp li,.pv-note,.pv-edge>div,.f-card,.f-lists>div,.quote,.strip h2,.strip .btn';
    var ao=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.remove('mq');ao.unobserve(e.target)}})},{threshold:.15,rootMargin:'0px 0px -60px 0px'});
    $$('.phero .wrap, main .block .wrap, main .strip .wrap').forEach(function(g){
      $$('.rv',g).forEach(function(el){el.classList.remove('rv','d1','d2','d3')});
      $$(asel,g).forEach(function(el,i){el.classList.add('mi');el.style.setProperty('--k',i)});
      g.classList.add('mq');ao.observe(g);
    });
    // whatever is already on screen starts right away, even if the observer is slow to report
    setTimeout(function(){$$('.mq').forEach(function(g){if(g.getBoundingClientRect().top<window.innerHeight*.9){g.classList.remove('mq');ao.unobserve(g)}})},60);
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
    var skip='.hero,.phero,form,[hidden],.form-done,.src,.kpis-head,.sec-title,hgroup,header,.opps,.arcx,.cmp';
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

  // Arc carousel («فرصة لا تتكرّر»): cards on a wheel, swung by a chained spring
  (function(){
    var root=$('[data-arc]'); if(!root)return;
    var cards=$$('.arcx-card',root),n=cards.length,label=$('.arcx-label',root);
    var num=$('.arcx-num',root),title=$('.arcx-title',root),text=$('.arcx-text',root),more=$('.arcx-more',root);
    var prev=$('.arcx-btn.prev',root),next=$('.arcx-btn.next',root);
    var GAP=18,K=.2,DAMP=.4,DIR=-1; // DIR -1: right to left, the first card sits on the right
    var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    var st={active:Math.min(1,n-1),cards:cards.map(function(){return{a:0,v:0}}),intro:true,fan:false,shown:-1,raf:0,busy:false};
    var target=function(i){return DIR*(i-st.active)*GAP};
    var show=function(i){
      if(i===st.shown)return; st.shown=i; var c=cards[i];
      cards.forEach(function(x,k){x.classList.toggle('is-on',k===i)});
      label.classList.add('swap');
      setTimeout(function(){num.textContent=(i<9?'0':'')+(i+1);title.textContent=c.dataset.title;text.textContent=c.dataset.text;more.href=c.getAttribute('href');label.classList.remove('swap')},180);
      prev.disabled=st.active<=0;next.disabled=st.active>=n-1;
    };
    var paint=function(){
      var best=0,min=1e9;
      st.cards.forEach(function(c,i){
        cards[i].style.transform='rotate('+c.a.toFixed(3)+'deg) translateY(calc(var(--R) * -1))';
        if(Math.abs(c.a)<min){min=Math.abs(c.a);best=i}
      });
      cards.forEach(function(el,i){el.style.zIndex=String(n-Math.abs(i-best))});
      return best;
    };
    var last=0;
    var step=function(now){
      // integrate in fixed 60 fps ticks, so the spring keeps its speed on 120 Hz screens and slow frames
      var ticks=last?Math.min(12,Math.max(1,Math.round((now-last)/16.67))):1;last=now;
      var settled=true;
      for(var tk=0;tk<ticks;tk++){settled=true;
      if(st.intro){
        if(st.fan){
          st.cards.forEach(function(c,i){var t=target(i);c.v=(c.v+(t-c.a)*.01)*.88;c.a+=c.v;if(Math.abs(t-c.a)>.3||Math.abs(c.v)>.3)settled=false});
          if(settled)st.intro=false;
        } else settled=false;
      } else {
        var L=n-1,lead=st.cards[L],lt=target(L);
        lead.v=(lead.v+(lt-lead.a)*K)*DAMP;lead.a+=lead.v;
        for(var i=L-1;i>=0;i--){var c=st.cards[i],t=st.cards[i+1].a-DIR*GAP;c.v=(c.v+(t-c.a)*K)*DAMP;c.a+=c.v;
          if(Math.abs(c.v)>.02||Math.abs(target(i)-c.a)>.05)settled=false}
        if(Math.abs(lead.v)>.02||Math.abs(lt-lead.a)>.05)settled=false;
      }
      }
      var best=paint(); if(!st.intro)show(best);
      st.raf=settled?0:requestAnimationFrame(step);if(settled)last=0;
    };
    var kick=function(){if(!st.raf)st.raf=requestAnimationFrame(step)};
    var go=function(i){i=Math.max(0,Math.min(n-1,i));if(i===st.active)return;st.active=i;kick()};
    if(reduced){st.cards.forEach(function(c,i){c.a=target(i)});st.intro=false;paint();show(st.active);root.classList.add('in-view');}
    else{
      paint();show(st.active);
      // start the entrance once the wheel's stage is on screen
      var started=false,stg=$('.arcx-stage',root);
      var check=function(){if(started)return;var r=stg.getBoundingClientRect();if(r.top<window.innerHeight*.9&&r.bottom>0){started=true;
        window.removeEventListener('scroll',check);root.classList.add('in-view');setTimeout(function(){st.fan=true;kick()},700)}};
      window.addEventListener('scroll',check,{passive:true});check();
    }
    prev.addEventListener('click',function(){go(st.active-1)});
    next.addEventListener('click',function(){go(st.active+1)});
    cards.forEach(function(c,i){c.addEventListener('click',function(e){if(i!==st.active){e.preventDefault();go(i)}})});
    root.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'){go(st.active+1);e.preventDefault()}else if(e.key==='ArrowRight'){go(st.active-1);e.preventDefault()}});
    // swipe and horizontal wheel only: the page keeps scrolling normally
    var sx=null;
    var stage=$('.arcx-stage',root);
    stage.addEventListener('pointerdown',function(e){sx=e.clientX});
    stage.addEventListener('pointerup',function(e){if(sx===null)return;var dx=e.clientX-sx;sx=null;if(Math.abs(dx)>40)go(st.active+(dx>0?1:-1))});
    stage.addEventListener('wheel',function(e){if(Math.abs(e.deltaX)<Math.abs(e.deltaY)||Math.abs(e.deltaX)<15||st.busy)return;
      e.preventDefault();st.busy=true;setTimeout(function(){st.busy=false},450);go(st.active+(e.deltaX<0?1:-1))},{passive:false});
  })();

  // Photo / map comparator: the divider chases the pointer through a spring, with one demo sweep on first view
  (function(){
    var root=$('[data-compare]'); if(!root)return;
    var top=$('.cmp-top',root),div=$('.cmp-div',root),h=$('.cmp-handle',root),la=$('.cmp-l.a',root),lb=$('.cmp-l.b',root);
    var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    var HOME=70,K=140,C=18,SWEEP=2.8;
    var s={x:HOME,v:0,t:HOME,intro:false,done:reduced,t0:0,raf:0,last:0,drag:false,vis:false};
    var clamp=function(v,a,b){return v<a?a:v>b?b:v};
    var ease=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
    var lerp=function(a,b,t){return a+(b-a)*t};
    var sweep=function(u){return u<.38?lerp(HOME,96,ease(u/.38)):u<.78?lerp(96,8,ease((u-.38)/.4)):lerp(8,HOME,ease((u-.78)/.22))};
    var paint=function(){
      var x=clamp(s.x,0,100);
      top.style.clipPath='inset(0 '+(100-x).toFixed(3)+'% 0 0)';div.style.left=x.toFixed(3)+'%';
      h.setAttribute('aria-valuenow',String(Math.round(x)));
      la.style.opacity=x>14?'1':'0';lb.style.opacity=x<86?'1':'0';
    };
    var frame=function(ts){
      var dt=Math.min(.05,Math.max(.001,(ts-s.last)/1000));s.last=ts;
      if(s.intro){var u=(ts/1000-s.t0)/SWEEP;if(u>=1){s.intro=false;s.done=true;s.t=HOME}else s.t=sweep(u)}
      s.v+=((s.t-s.x)*K-s.v*C)*dt;s.x=clamp(s.x+s.v*dt,0,100);
      paint();
      var rest=!s.intro&&!s.drag&&Math.abs(s.t-s.x)<.02&&Math.abs(s.v)<.02;
      s.raf=(rest||!s.vis)?0:requestAnimationFrame(frame);
    };
    var kick=function(){if(!s.raf&&s.vis){s.last=performance.now();s.raf=requestAnimationFrame(frame)}};
    var set=function(t){s.intro=false;s.done=true;s.t=clamp(t,0,100);root.classList.add('touched');
      if(reduced){s.x=s.t;s.v=0;paint()}else kick()};
    var fromEvent=function(e){var r=root.getBoundingClientRect();set((e.clientX-r.left)/Math.max(1,r.width)*100)};
    var down=function(e){if(e.pointerType==='mouse'&&e.button!==0)return;s.drag=true;root.classList.add('dragging');
      try{e.currentTarget.setPointerCapture(e.pointerId)}catch(_){}
      fromEvent(e);e.preventDefault()};
    var move=function(e){if(s.drag)fromEvent(e)};
    var up=function(){s.drag=false;root.classList.remove('dragging')};
    [top,h].forEach(function(el){el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);
      el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('lostpointercapture',up)});
    root.addEventListener('dblclick',function(){set(HOME)});
    h.addEventListener('keydown',function(e){var st=e.shiftKey?10:2,n=s.t;
      if(e.key==='ArrowRight'||e.key==='ArrowUp')n+=st;else if(e.key==='ArrowLeft'||e.key==='ArrowDown')n-=st;
      else if(e.key==='Home')n=0;else if(e.key==='End')n=100;else return;e.preventDefault();set(n)});
    paint();
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){s.vis=es[0].isIntersecting;
        if(s.vis&&!s.done&&!s.intro&&es[0].intersectionRatio>=.45){s.intro=true;s.t0=performance.now()/1000}
        if(s.vis)kick()},{threshold:[0,.45]}).observe(root);
    } else {s.vis=true}
  })();

  // «خدماتنا» flip cards: on touch screens the first tap flips the card, the second follows the link
  $$('.flipc').forEach(function(c){
    c.addEventListener('click',function(e){
      if(matchMedia('(hover:hover)').matches)return;
      if(!c.classList.contains('on')){e.preventDefault();$$('.flipc.on').forEach(function(x){x.classList.remove('on')});c.classList.add('on')}
    });
  });

  // phone: the Madinah arch rises and grows with the scroll, then the heading and button come in
  (function(){
    var sec=$('.madinah'),fig=$('.mz-bleed'),txt=$('.mz-text');if(!sec||!fig||!txt)return;
    var mq=matchMedia('(max-width:860px)'),rm=matchMedia('(prefers-reduced-motion: reduce)').matches,raf=0;
    var upd=function(){raf=0;
      if(!mq.matches||rm){sec.style.setProperty('--mzp','1');sec.style.setProperty('--mzt','1');return}
      var H=window.innerHeight,ft=fig.getBoundingClientRect().top,tt=txt.getBoundingClientRect().top;
      var p=Math.min(1,Math.max(0,(H-ft)/(H*.85))),t=Math.min(1,Math.max(0,(H-tt)/(H*.45)));
      sec.style.setProperty('--mzp',p.toFixed(3));sec.style.setProperty('--mzt',t.toFixed(3));
    };
    var req=function(){if(!raf)raf=requestAnimationFrame(upd)};
    window.addEventListener('scroll',req,{passive:true});window.addEventListener('resize',req);upd();
  })();

  // heroTilt: on phones the hero photo follows the phone's tilt, eased so hand tremor never shows; without a gyroscope it drifts slowly
  (function(){
    var h=$('.hero');if(!h||!matchMedia('(max-width:760px)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var got=false,b0=0,g0=0,tx=0,ty=0,cx=0,cy=0,loop=0;
    var step=function(){
      cx+=(tx-cx)*.045;cy+=(ty-cy)*.045; // slow follow: the photo glides instead of jumping
      h.style.setProperty('--tx',cx.toFixed(2)+'px');h.style.setProperty('--ty',cy.toFixed(2)+'px');
      loop=(Math.abs(tx-cx)>.05||Math.abs(ty-cy)>.05)?requestAnimationFrame(step):0;
    };
    var on=function(e){if(e.beta==null)return;
      if(!got){got=true;h.classList.remove('drift');h.classList.add('tilt');b0=e.beta;g0=e.gamma}
      b0+=(e.beta-b0)*.01;g0+=(e.gamma-g0)*.01; // re-centre slowly so any holding angle feels natural
      var g=e.gamma-g0,b=e.beta-b0;
      if(Math.abs(g)<1.5)g=0;if(Math.abs(b)<1.5)b=0; // ignore tiny hand tremor
      tx=Math.max(-12,Math.min(12,-g*.6));ty=Math.max(-10,Math.min(10,-b*.5));
      if(!loop)loop=requestAnimationFrame(step);
    };
    var start=function(){window.addEventListener('deviceorientation',on,{passive:true})};
    h.classList.add('drift');
    var D=window.DeviceOrientationEvent;
    if(D&&typeof D.requestPermission==='function'){
      var ask=function(){D.requestPermission().then(function(s){if(s==='granted')start()}).catch(function(){})};
      window.addEventListener('touchend',ask,{once:true});
    }else if(D)start();
  })();

  // phone browser bars: Safari tints its bottom toolbar from what touches the bottom edge, so a thin strip there
  // takes the hero's pool colour while the hero fills the screen, and the footer navy once the footer reaches the bottom
  (function(){
    var h=document.body.classList.contains('home')?$('.hero'):null,ft=$('.bwf');
    var e=document.createElement('div');e.className='edge-b';e.setAttribute('aria-hidden','true');document.body.appendChild(e);
    var upd=function(){
      var H=window.innerHeight,c='';
      if(h&&window.scrollY<H*.5)c='#4b4163';
      else if(ft&&ft.getBoundingClientRect().top<H-20)c='#1a1d3a';
      document.body.classList.toggle('at-edge',!!c);if(c)e.style.background=c;
    };
    window.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);upd();
  })();

  // Hero curtain (#heroCurtain): dim and push the hero back as the next section covers it
  var hc=document.body.classList.contains('home')?$('.hero'):null;
  if(hc && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    // once the hero is fully covered it is hidden, so Chrome can never paint it through the sections below
    var hcUpd=function(){var p=Math.max(0,Math.min(1,window.scrollY/window.innerHeight));hc.style.setProperty('--hp',p.toFixed(3));
      hc.style.visibility=window.scrollY>hc.offsetHeight+2?'hidden':''};
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

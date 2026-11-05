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

  // Parallax on the wide image (home)
  var px=$('#parallax');
  function parallax(){
    if(!px)return; var r=px.parentNode.getBoundingClientRect(),vh=window.innerHeight;
    if(r.bottom<0||r.top>vh)return;
    var p=(r.top+r.height/2-vh/2)/vh; px.style.transform='translateY('+(-8+p*-10)+'%)';
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

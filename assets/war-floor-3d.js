(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  hero.classList.add('war3d-hero');
  hero.innerHTML = `
    <canvas class="war3d-canvas" aria-label="Interactive futuristic Gender Warz War Floor animation"></canvas>
    <div class="war3d-vignette"></div>
    <div class="war3d-scanlines"></div>
    <div class="war3d-hud war3d-hud-left"><span>WAR FLOOR</span><b>LIVE SYSTEM</b></div>
    <div class="war3d-hud war3d-hud-right"><span>REAL TIME</span><b>ONLINE</b></div>
    <div class="war3d-core-copy">
      <div class="tag">WELCOME TO THE WAR FLOOR</div>
      <div class="war3d-kicker">THE ULTIMATE BATTLE OF PERSPECTIVES</div>
      <h1>GENDER<br><span>WARZ</span></h1>
      <p>Real people. Real talk. Real time. Enter the next generation of debate.</p>
      <div class="buttons">
        <a class="btn red" href="/social.html">⚔ ENTER THE WAR FLOOR</a>
        <a class="btn" href="/members.html">JOIN THE WAR</a>
      </div>
      <div class="war3d-hint">MOVE YOUR PHONE • MOVE YOUR MOUSE • CLICK TO IGNITE</div>
    </div>
    <div class="war3d-orbit-label war3d-label-a">MEN'S PERSPECTIVES</div>
    <div class="war3d-orbit-label war3d-label-b">WOMEN'S PERSPECTIVES</div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .war3d-hero{position:relative!important;overflow:hidden!important;min-height:82vh!important;padding:0!important;display:block!important;background:#020204!important;isolation:isolate;cursor:default}
    .war3d-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;touch-action:auto}
    .war3d-vignette,.war3d-scanlines{position:absolute;inset:0;pointer-events:none}
    .war3d-vignette{background:radial-gradient(circle at center,transparent 30%,rgba(0,0,0,.2) 62%,rgba(0,0,0,.82) 100%);z-index:2}
    .war3d-scanlines{z-index:3;opacity:.08;background:repeating-linear-gradient(0deg,transparent 0,transparent 4px,rgba(255,255,255,.12) 5px);mix-blend-mode:screen}
    .war3d-core-copy{position:absolute;z-index:5;left:50%;top:50%;width:min(760px,92vw);transform:translate(-50%,-50%);text-align:center;pointer-events:none}
    .war3d-core-copy .buttons,.war3d-core-copy .btn{pointer-events:auto}
    .war3d-core-copy h1{font-size:clamp(72px,14vw,170px)!important;line-height:.72!important;letter-spacing:-9px!important;margin:18px 0!important;text-shadow:0 0 18px rgba(255,255,255,.18),0 0 45px rgba(255,51,71,.28)}
    .war3d-core-copy h1 span{color:#ff3347!important;text-shadow:0 0 18px rgba(255,51,71,.7),0 0 70px rgba(255,51,71,.35)}
    .war3d-core-copy p{font-size:clamp(14px,2vw,18px)!important;color:#d0d0d0!important;max-width:620px!important;text-shadow:0 2px 15px #000!important}
    .war3d-kicker{font-size:10px;letter-spacing:5px;font-weight:900;color:#fff;opacity:.8;margin-top:18px}
    .war3d-hud{position:absolute;z-index:6;top:24px;padding:10px 13px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.32);backdrop-filter:blur(8px);font-size:9px;letter-spacing:2px;color:#aaa;display:flex;gap:9px;flex-direction:column;text-align:left;pointer-events:none}
    .war3d-hud b{color:#fff;font-size:10px}.war3d-hud-left{left:24px;border-left:2px solid #ff3347}.war3d-hud-right{right:24px;text-align:right;border-right:2px solid #2da8ff}.war3d-hud-right b{color:#5db7ff}
    .war3d-hint{margin-top:20px;font-size:8px;letter-spacing:3px;color:#777;animation:war3dBlink 2.4s ease-in-out infinite}
    .war3d-orbit-label{position:absolute;z-index:5;font-size:9px;letter-spacing:3px;font-weight:900;color:#fff;opacity:.75;pointer-events:none;text-shadow:0 0 12px currentColor}.war3d-label-a{left:7%;top:52%;color:#ff6575}.war3d-label-b{right:7%;top:52%;color:#69b9ff}
    @keyframes war3dBlink{50%{opacity:.35}}
    @media(max-width:750px){.war3d-hero{min-height:78vh!important}.war3d-core-copy h1{letter-spacing:-5px!important}.war3d-hud{top:14px}.war3d-hud-left{left:12px}.war3d-hud-right{right:12px}.war3d-orbit-label{display:none}.war3d-kicker{letter-spacing:3px}.war3d-hint{font-size:7px;letter-spacing:2px}}
    @media(prefers-reduced-motion:reduce){.war3d-hint{animation:none}.war3d-canvas{display:none}.war3d-hero{background:radial-gradient(circle at 50% 40%,#321015,#050505 65%)!important}}
  `;
  document.head.appendChild(style);

  const canvas = hero.querySelector('.war3d-canvas');
  const ctx = canvas.getContext('2d', { alpha:false, desynchronized:true });
  if (!ctx) return;

  let w=0,h=0,dpr=1,t=0,pulse=0,raf=0,running=false,visible=true;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowPower=window.matchMedia('(max-width: 750px)').matches || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  const COUNT=lowPower ? 110 : 190;
  const points=[];

  function resize(){
    const r=hero.getBoundingClientRect();
    dpr=Math.min(window.devicePixelRatio||1,1.5);
    w=Math.max(1,Math.round(r.width)); h=Math.max(1,Math.round(r.height));
    canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function seed(){
    points.length=0;
    for(let i=0;i<COUNT;i++) points.push({x:(Math.random()*2-1)*1.8,y:(Math.random()*2-1)*1.1,z:Math.random()*2+0.15,s:Math.random()*.8+.2,a:Math.random()*.65+.12});
  }

  function project(x,y,z){const f=430/(z+.2);return [x*f+w/2,y*f+h/2]}
  function ring(cx,cy,rx,ry,rot,alpha,color){ctx.save();ctx.translate(cx,cy);ctx.rotate(rot);ctx.strokeStyle=color;ctx.globalAlpha=alpha;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.stroke();ctx.restore()}
  function core(cx,cy,base,color,flip){
    for(let i=0;i<3;i++) ring(cx,cy,base*(1+i*.18),base*.23*(1+i*.1),t*(.35+i*.1)*(flip?-1:1),.22-i*.05,color);
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,base*2);g.addColorStop(0,'#fff');g.addColorStop(.08,color);g.addColorStop(.35,color);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(cx,cy,base,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  }

  function draw(){
    if(!running || !visible || document.hidden){raf=0;return}
    ctx.fillStyle='#020204';ctx.fillRect(0,0,w,h);
    const cx=w/2,cy=h/2;
    const left=w*.22,right=w*.78,yy=h*.52;
    const grad=ctx.createRadialGradient(cx,cy,20,cx,cy,Math.max(w,h)*.65);grad.addColorStop(0,'rgba(70,15,30,.18)');grad.addColorStop(.5,'rgba(8,15,35,.1)');grad.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);

    for(const p of points){
      p.z-=.0038*(.7+p.s);
      if(p.z<.04){p.z=2.15;p.x=(Math.random()*2-1)*1.8;p.y=(Math.random()*2-1)*1.1}
      const [px,py]=project(p.x,p.y,p.z);
      if(px<-10||px>w+10||py<-10||py>h+10)continue;
      const size=Math.max(.35,Math.min(2.6,(1.8-p.z)*1.35));
      ctx.globalAlpha=p.a*Math.min(1,(2.2-p.z)/1.2);
      ctx.fillStyle=p.z<.8?'#fff':'#9fb9ff';
      ctx.beginPath();ctx.arc(px,py,size,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;

    core(left,yy,Math.min(w*.065,64),'rgb(255,51,71)',false);
    core(right,yy,Math.min(w*.065,64),'rgb(45,168,255)',true);
    ring(cx,cy,w*.19,w*.065,t*.18,.16,'#fff');
    ring(cx,cy,w*.27,w*.095,-t*.13,.11,'#ff3347');
    ring(cx,cy,w*.34,w*.12,t*.08,.08,'#2da8ff');

    ctx.save();ctx.translate(cx,cy);ctx.rotate(t*.05);ctx.strokeStyle='rgba(255,255,255,.14)';ctx.setLineDash([2,9]);ctx.beginPath();ctx.ellipse(0,0,w*.31,h*.13,0,0,Math.PI*2);ctx.stroke();ctx.restore();
    const beam=ctx.createLinearGradient(left,yy,right,yy);beam.addColorStop(0,'rgba(255,51,71,0)');beam.addColorStop(.47,'rgba(255,255,255,.08)');beam.addColorStop(.5,'rgba(255,255,255,.6)');beam.addColorStop(.53,'rgba(255,255,255,.08)');beam.addColorStop(1,'rgba(45,168,255,0)');ctx.fillStyle=beam;ctx.fillRect(left,yy-1,right-left,2);

    if(pulse>0){ctx.globalAlpha=pulse;ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,(1-pulse)*Math.max(w,h)*.45,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;pulse-=.035}
    t+=.01;
    raf=requestAnimationFrame(draw);
  }

  function start(){if(reduced||running)return;running=true;if(!raf)raf=requestAnimationFrame(draw)}
  function stop(){running=false;if(raf){cancelAnimationFrame(raf);raf=0}}

  const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop()},{threshold:0.05});
  io.observe(hero);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(visible)start()},{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  resize();seed();
  if(!reduced)start();
})();

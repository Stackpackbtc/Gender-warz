(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  hero.classList.add('war3d-hero');
  hero.innerHTML = `
    <canvas class="war3d-canvas" aria-label="Interactive futuristic Gender Warz War Floor animation"></canvas>
    <div class="war3d-vignette"></div>
    <div class="war3d-scanlines"></div>
    <div class="war3d-hud war3d-hud-left"><span>WAR FLOOR</span><b>LIVE SYSTEM</b></div>
    <div class="war3d-hud war3d-hud-right"><span>REAL TIME</span><b id="war3dStatus">ONLINE</b></div>
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
    .war3d-hero{position:relative!important;overflow:hidden!important;min-height:82vh!important;padding:0!important;display:block!important;background:#020204!important;isolation:isolate;cursor:crosshair}
    .war3d-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
    .war3d-vignette{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at center,transparent 30%,rgba(0,0,0,.2) 62%,rgba(0,0,0,.82) 100%);z-index:2}
    .war3d-scanlines{position:absolute;inset:0;pointer-events:none;z-index:3;opacity:.12;background:repeating-linear-gradient(0deg,transparent 0,transparent 3px,rgba(255,255,255,.16) 4px);mix-blend-mode:screen}
    .war3d-core-copy{position:absolute;z-index:5;left:50%;top:50%;width:min(760px,92vw);transform:translate(-50%,-50%);text-align:center;pointer-events:none}
    .war3d-core-copy .buttons,.war3d-core-copy .btn{pointer-events:auto}
    .war3d-core-copy h1{font-size:clamp(72px,14vw,170px)!important;line-height:.72!important;letter-spacing:-9px!important;margin:18px 0!important;text-shadow:0 0 18px rgba(255,255,255,.18),0 0 45px rgba(255,51,71,.28);transform:translateZ(40px)}
    .war3d-core-copy h1 span{color:#ff3347!important;text-shadow:0 0 18px rgba(255,51,71,.7),0 0 70px rgba(255,51,71,.35)}
    .war3d-core-copy p{font-size:clamp(14px,2vw,18px)!important;color:#d0d0d0!important;max-width:620px!important;text-shadow:0 2px 15px #000!important}
    .war3d-kicker{font-size:10px;letter-spacing:5px;font-weight:900;color:#fff;opacity:.8;margin-top:18px}
    .war3d-hud{position:absolute;z-index:6;top:24px;padding:10px 13px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.32);backdrop-filter:blur(10px);font-size:9px;letter-spacing:2px;color:#aaa;display:flex;gap:9px;flex-direction:column;text-align:left}
    .war3d-hud b{color:#fff;font-size:10px}.war3d-hud-left{left:24px;border-left:2px solid #ff3347}.war3d-hud-right{right:24px;text-align:right;border-right:2px solid #2da8ff}.war3d-hud-right b{color:#5db7ff}
    .war3d-hint{margin-top:20px;font-size:8px;letter-spacing:3px;color:#777;animation:war3dBlink 2.4s ease-in-out infinite}
    .war3d-orbit-label{position:absolute;z-index:5;font-size:9px;letter-spacing:3px;font-weight:900;color:#fff;opacity:.75;pointer-events:none;text-shadow:0 0 12px currentColor}.war3d-label-a{left:7%;top:52%;color:#ff6575}.war3d-label-b{right:7%;top:52%;color:#69b9ff}
    @keyframes war3dBlink{50%{opacity:.35}}
    @media(max-width:750px){.war3d-hero{min-height:78vh!important}.war3d-core-copy h1{letter-spacing:-5px!important}.war3d-hud{top:14px}.war3d-hud-left{left:12px}.war3d-hud-right{right:12px}.war3d-orbit-label{display:none}.war3d-kicker{letter-spacing:3px}.war3d-hint{font-size:7px;letter-spacing:2px}}
    @media(prefers-reduced-motion:reduce){.war3d-hint{animation:none}.war3d-canvas{display:none}.war3d-hero{background:radial-gradient(circle at 50% 40%,#321015,#050505 65%)!important}}
  `;
  document.head.appendChild(style);

  const canvas = hero.querySelector('.war3d-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  let w=0,h=0,dpr=1, t=0, pulse=0;
  const mouse={x:0,y:0,tx:0,ty:0};
  const points=[];
  const COUNT=360;

  function resize(){
    const r=hero.getBoundingClientRect();
    dpr=Math.min(devicePixelRatio||1,2); w=r.width; h=r.height;
    canvas.width=w*dpr; canvas.height=h*dpr; canvas.style.width=w+'px'; canvas.style.height=h+'px'; ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function seed(){
    points.length=0;
    for(let i=0;i<COUNT;i++) points.push({x:(Math.random()*2-1)*1.8,y:(Math.random()*2-1)*1.1,z:Math.random()*2+0.15,s:Math.random()*.8+.2,a:Math.random()*.75+.15});
  }
  function project(x,y,z){
    const f=460/(z+0.18), px=x*f+w/2, py=y*f+h/2; return [px,py,f];
  }
  function glow(x,y,r,c,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c.replace(')',`,${a})`).replace('rgb','rgba'));g.addColorStop(.35,c.replace(')',`,${a*.25})`).replace('rgb','rgba'));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
  function ring(cx,cy,rx,ry,rot,alpha,color,width=1){ctx.save();ctx.translate(cx,cy);ctx.rotate(rot);ctx.strokeStyle=color;ctx.globalAlpha=alpha;ctx.lineWidth=width;ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.stroke();ctx.restore()}
  function core(cx,cy,base,color,flip){
    for(let i=0;i<4;i++) ring(cx,cy,base*(1+i*.17),base*.24*(1+i*.1),t*(.45+i*.12)*(flip?-1:1),.25-i*.045,color,1);
    glow(cx,cy,base*2.2,color,.10);
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,base);g.addColorStop(0,'#fff');g.addColorStop(.08,color);g.addColorStop(.35,color);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,base,0,Math.PI*2);ctx.fill();
  }
  function frame(){
    ctx.fillStyle='#020204';ctx.fillRect(0,0,w,h);
    mouse.x += (mouse.tx-mouse.x)*.045; mouse.y += (mouse.ty-mouse.y)*.045;
    const cx=w/2+mouse.x*18, cy=h/2+mouse.y*12;
    const left=w*.22+mouse.x*35, right=w*.78+mouse.x*35, yy=h*.52+mouse.y*18;
    const grad=ctx.createRadialGradient(cx,cy,20,cx,cy,Math.max(w,h)*.7);grad.addColorStop(0,'rgba(70,15,30,.22)');grad.addColorStop(.5,'rgba(8,15,35,.12)');grad.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);

    // Deep-space particle field with perspective.
    for(const p of points){
      p.z-=.0045*(.6+p.s); if(p.z<.03){p.z=2.15;p.x=(Math.random()*2-1)*1.8;p.y=(Math.random()*2-1)*1.1}
      const [px,py,f]=project(p.x+mouse.x*.025,p.y+mouse.y*.02,p.z);
      if(px<-20||px>w+20||py<-20||py>h+20) continue;
      const size=Math.max(.35,Math.min(3.5,(1.8-p.z)*1.7));
      ctx.globalAlpha=p.a*Math.min(1,(2.2-p.z)/1.2);ctx.fillStyle=p.z<.8?'#fff':'#9fb9ff';ctx.beginPath();ctx.arc(px,py,size,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;

    // Opposing energy cores and dimensional rings.
    core(left,yy,Math.min(w*.07,72),'rgb(255,51,71)',false);
    core(right,yy,Math.min(w*.07,72),'rgb(45,168,255)',true);
    ring(cx,cy,w*.19,w*.065,t*.22,.18,'#fff',1);
    ring(cx,cy,w*.27,w*.095,-t*.16,.13,'#ff3347',1);
    ring(cx,cy,w*.34,w*.12,t*.1,.10,'#2da8ff',1);

    // Central holographic battle axis.
    ctx.save();ctx.translate(cx,cy);ctx.rotate(t*.06);ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=1;ctx.setLineDash([2,9]);ctx.beginPath();ctx.ellipse(0,0,w*.31,h*.13,0,0,Math.PI*2);ctx.stroke();ctx.restore();
    const beam=ctx.createLinearGradient(left,yy,right,yy);beam.addColorStop(0,'rgba(255,51,71,0)');beam.addColorStop(.45,'rgba(255,255,255,.1)');beam.addColorStop(.5,'rgba(255,255,255,.75)');beam.addColorStop(.55,'rgba(255,255,255,.1)');beam.addColorStop(1,'rgba(45,168,255,0)');ctx.fillStyle=beam;ctx.fillRect(left,yy-1,right-left,2);

    if(pulse>0){ctx.globalAlpha=pulse;ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,(1-pulse)*Math.max(w,h)*.45,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;pulse-=.018}
    t+=.012; requestAnimationFrame(frame);
  }
  hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();mouse.tx=(e.clientX-r.left-r.width/2)/(r.width/2);mouse.ty=(e.clientY-r.top-r.height/2)/(r.height/2)});
  hero.addEventListener('pointerleave',()=>{mouse.tx=0;mouse.ty=0});
  hero.addEventListener('pointerdown',()=>{pulse=1});
  window.addEventListener('resize',resize,{passive:true});
  resize();seed();frame();
})();

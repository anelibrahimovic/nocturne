const canvas=document.getElementById("space");
const ctx=canvas.getContext("2d",{alpha:false});
const gate=document.getElementById("gate");
const enter=document.getElementById("enter");
const track=document.getElementById("track");
const sound=document.getElementById("sound");
const railFill=document.getElementById("railFill");
const chapter=document.getElementById("chapter");
const counter=document.getElementById("counter");
const replay=document.getElementById("replay");
const zones=[...document.querySelectorAll(".scroll-zone")];
const memoryZones=[...document.querySelectorAll(".memory-zone")];
const memories=[...document.querySelectorAll(".memory")];

let W=innerWidth,H=innerHeight,dpr=1;
let scrollY=0,targetY=0,mouseX=0,mouseY=0;
let stars=[],bursts=[],lastBurst=-1,lastActive=-1;
let entered=false,muted=false;
const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse=matchMedia("(pointer: coarse)").matches;

function resize(){
  dpr=Math.min(devicePixelRatio||1,1.35);
  W=innerWidth;H=innerHeight;
  canvas.width=Math.floor(W*dpr);canvas.height=Math.floor(H*dpr);
  canvas.style.width=W+"px";canvas.style.height=H+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
  seedStars();
}
function seedStars(){
  const count=W<760?260:480;
  stars=Array.from({length:count},()=>({
    x:(Math.random()-.5)*W*1.8,
    y:(Math.random()-.5)*H*1.8,
    z:Math.random()*1+.02,
    p:Math.random()*Math.PI*2,
    s:.25+Math.random()*1.2
  }));
}
function resetStar(s){
  s.x=(Math.random()-.5)*W*1.8;
  s.y=(Math.random()-.5)*H*1.8;
  s.z=1;
  s.p=Math.random()*6.28;
}
function drawSpace(){
  ctx.fillStyle="#020205";ctx.fillRect(0,0,W,H);
  const cx=W/2+mouseX*18,cy=H/2+mouseY*12;
  const speed=reduced?.0025:.0055+Math.min(Math.abs(targetY-scrollY)/7000,.012);
  for(const s of stars){
    const oldZ=s.z;
    s.z-=speed;
    if(s.z<=.015){resetStar(s);continue}
    const x=cx+s.x/s.z;
    const y=cy+s.y/s.z;
    const ox=cx+s.x/(oldZ+.02);
    const oy=cy+s.y/(oldZ+.02);
    if(x<0||x>W||y<0||y>H){resetStar(s);continue}
    const a=Math.min(1,(1-s.z)*1.15+.08);
    ctx.strokeStyle="rgba(218,228,246,"+(a*.6)+")";
    ctx.lineWidth=Math.max(.4,s.s*(1.08-s.z));
    ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(x,y);ctx.stroke();
  }
  drawBursts();
}
function burst(x,y,warm=false){
  const n=W<760?28:46;
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2;
    const sp=1.3+Math.random()*5.8;
    bursts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,size:.5+Math.random()*2.1,warm});
  }
}
function drawBursts(){
  for(let i=bursts.length-1;i>=0;i--){
    const p=bursts[i];p.x+=p.vx;p.y+=p.vy;p.vx*=.992;p.vy*=.992;p.life-=.022;
    if(p.life<=0){bursts.splice(i,1);continue}
    ctx.fillStyle=p.warm?"rgba(237,132,78,"+p.life+")":"rgba(218,226,245,"+p.life+")";
    ctx.beginPath();ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2);ctx.fill();
  }
}
function localProgress(zone){
  const r=zone.getBoundingClientRect();
  return Math.max(0,Math.min(1,(-r.top)/(r.height-H)));
}
function sceneTransform(p,index){
  // memory flies toward camera, rests briefly, then punches through and bursts
  let z,opacity,rotY,rotX,y;
  if(p<.18){
    const q=p/.18;
    z=-1150+(950*q);opacity=Math.pow(q,1.7);y=(1-q)*90;rotY=(index%2?1:-1)*(18*(1-q));rotX=7*(1-q);
  }else if(p<.68){
    const q=(p-.18)/.5;
    z=-200+200*ease(q);opacity=1;y=Math.sin(q*Math.PI)*-14;rotY=(index%2?1:-1)*(3-3*q);rotX=0;
  }else{
    const q=(p-.68)/.32;
    z=850*Math.pow(q,1.8);opacity=1-Math.pow(q,2.2);y=-70*q;rotY=(index%2?1:-1)*(-5*q);rotX=-3*q;
  }
  const scale=Math.max(.24,1+z/1700);
  return {z,opacity,rotY,rotX,y,scale};
}
function ease(t){return 1-Math.pow(1-t,3)}
function updateScenes(){
  let active=-1,best=.9;
  memoryZones.forEach((zone,i)=>{
    const mem=memories[i];
    const p=localProgress(zone);
    const t=sceneTransform(p,i);
    const dx=coarse?0:mouseX*10*(1-Math.abs(.5-p));
    const dy=coarse?0:mouseY*8*(1-Math.abs(.5-p));
    mem.style.visibility=(p>.015&&p<.995)?"visible":"hidden";
    mem.style.opacity=t.opacity.toFixed(3);
    mem.style.transform="translate(-50%,-50%) translate3d("+dx+"px,"+(t.y+dy)+"px,"+t.z+"px) rotateX("+t.rotX+"deg) rotateY("+t.rotY+"deg) scale("+t.scale+")";
    const dist=Math.abs(p-.45);
    if(dist<best){best=dist;active=i}
    if(p>.73&&p<.78&&lastBurst!==i){
      lastBurst=i;
      burst(W/2+(i%2?W*.1:-W*.1),H/2,i===memoryZones.length-1);
      mem.animate([
        {filter:"brightness(1) blur(0px)"},
        {filter:"brightness(1.7) blur(1px)"},
        {filter:"brightness(1) blur(0px)"}
      ],{duration:380,easing:"ease-out"});
    }
    if(p<.2&&lastBurst===i)lastBurst=-1;
  });
  if(active!==lastActive){
    setActiveVideo(active);
    lastActive=active;
  }
}
function setActiveVideo(index){
  memories.forEach((m,i)=>{
    const v=m.querySelector("video");
    if(!v)return;
    if(i===index){
      v.play().catch(()=>{});
    }else{
      v.pause();
    }
  });
}
function updateHud(){
  const max=document.documentElement.scrollHeight-H;
  const p=max>0?scrollY/max:0;
  railFill.style.height=(p*100)+"%";
  let current=zones[0];
  for(const z of zones){
    const r=z.getBoundingClientRect();
    if(r.top<H*.58&&r.bottom>H*.25)current=z;
  }
  chapter.textContent=current.dataset.label||"MEMORY";
  counter.textContent=current.dataset.index?String(current.dataset.index).padStart(2,"0"):"00";
}
function loop(){
  targetY=window.scrollY||0;
  scrollY+= (targetY-scrollY)*(reduced?1:.09);
  drawSpace();updateScenes();updateHud();
  requestAnimationFrame(loop);
}
enter.addEventListener("click",async()=>{
  entered=true;gate.classList.add("gone");
  try{await track.play();sound.classList.add("on")}catch(e){}
  setTimeout(()=>document.querySelector(".intro").scrollIntoView({behavior:"smooth"}),160);
});
sound.addEventListener("click",async()=>{
  if(track.paused){
    try{await track.play();sound.classList.add("on")}catch(e){}
  }else{track.pause();sound.classList.remove("on")}
});
replay.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
addEventListener("pointermove",e=>{
  mouseX=(e.clientX/W-.5)*2;
  mouseY=(e.clientY/H-.5)*2;
},{passive:true});
addEventListener("resize",resize,{passive:true});
document.querySelectorAll("video").forEach(v=>{
  v.addEventListener("error",()=>v.style.display="none");
  v.addEventListener("loadeddata",()=>v.style.display="block");
});
resize();loop();

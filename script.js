
gsap.registerPlugin(ScrollTrigger);

const body = document.body;
const progressFill = document.getElementById("progressFill");
const chapterLabel = document.getElementById("chapterLabel");
const soundtrack = document.getElementById("soundtrack");
const soundToggle = document.getElementById("soundToggle");

window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("loader").classList.add("hide"), 450);
  initIntro();
  initScroll();
  initTilt();
  initHologram();
  initStars();
});

function initIntro(){
  const tl = gsap.timeline({delay:.15});
  tl.from(".hero-title span",{y:120,opacity:0,duration:1.35,stagger:.12,ease:"power4.out"})
    .from(".hero .reveal",{y:18,opacity:0,duration:.8,stagger:.15,ease:"power2.out"},"-=.55")
    .from(".scroll-cue",{opacity:0,y:10,duration:.8},"-=.25")
    .from(".hero-orbit",{scale:.75,opacity:0,duration:1.5,stagger:.12,ease:"expo.out"},"<");
}

function initScroll(){
  gsap.to(progressFill,{
    height:"100%",
    ease:"none",
    scrollTrigger:{trigger:document.body,start:"top top",end:"bottom bottom",scrub:true}
  });

  document.querySelectorAll(".chapter").forEach(section=>{
    ScrollTrigger.create({
      trigger:section,start:"top 45%",end:"bottom 45%",
      onEnter:()=>setChapter(section),
      onEnterBack:()=>setChapter(section)
    });
  });

  gsap.utils.toArray(".memory-copy").forEach(copy=>{
    gsap.from(copy.children,{
      y:42,opacity:0,stagger:.11,duration:1,
      ease:"power3.out",
      scrollTrigger:{trigger:copy,start:"top 78%"}
    });
  });

  gsap.utils.toArray(".memory-media").forEach(media=>{
    gsap.fromTo(media,{clipPath:"inset(16% 12% 16% 12%)",scale:.94},{
      clipPath:"inset(0% 0% 0% 0%)",scale:1,duration:1.5,ease:"power3.out",
      scrollTrigger:{trigger:media,start:"top 80%"}
    });
    const image = media.querySelector("img");
    if(image){
      gsap.fromTo(image,{scale:1.16},{scale:1,ease:"none",
        scrollTrigger:{trigger:media,start:"top bottom",end:"bottom top",scrub:1.1}
      });
    }
  });

  gsap.to(".hero-title",{y:-100,opacity:.18,ease:"none",
    scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:1}
  });

  gsap.to(".orbit-one",{rotation:110,ease:"none",
    scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:1}
  });
  gsap.to(".orbit-two",{rotation:-100,ease:"none",
    scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:1}
  });

  gsap.fromTo(".cinema-frame",{scale:.84,borderRadius:"30px"},{
    scale:1,borderRadius:"0px",ease:"none",
    scrollTrigger:{trigger:".cinematic",start:"top bottom",end:"top top",scrub:1}
  });

  const video = document.querySelector(".memory-video");
  if(video){
    ScrollTrigger.create({
      trigger:".cinematic",start:"top 60%",end:"bottom 30%",
      onEnter:()=>video.play().catch(()=>{}),
      onEnterBack:()=>video.play().catch(()=>{}),
      onLeave:()=>video.pause(),onLeaveBack:()=>video.pause()
    });
  }

  gsap.from(".double-frame .left-frame",{x:-110,y:60,rotation:-6,opacity:0,duration:1.35,ease:"power3.out",
    scrollTrigger:{trigger:".double-frame",start:"top 75%"}
  });
  gsap.from(".double-frame .right-frame",{x:110,y:-40,rotation:7,opacity:0,duration:1.35,ease:"power3.out",
    scrollTrigger:{trigger:".double-frame",start:"top 75%"}
  });

  gsap.to(".fracture-media img",{scale:1.13,filter:"saturate(.7) contrast(1.12)",ease:"none",
    scrollTrigger:{trigger:".fracture",start:"top top",end:"bottom top",scrub:1}
  });
  gsap.from(".fracture-slices i",{scaleY:0,transformOrigin:"top",stagger:.08,duration:1.1,ease:"power3.inOut",
    scrollTrigger:{trigger:".fracture",start:"top 55%"}
  });

  document.getElementById("scrollCue").addEventListener("click",()=>{
    document.querySelectorAll(".chapter")[1].scrollIntoView({behavior:"smooth"});
  });
  document.getElementById("replayBtn").addEventListener("click",()=>{
    window.scrollTo({top:0,behavior:"smooth"});
  });
}

function setChapter(section){
  chapterLabel.textContent = section.dataset.chapter || "";
  body.dataset.palette = section.dataset.palette || "night";
}

function initTilt(){
  document.querySelectorAll("[data-tilt]").forEach(card=>{
    card.addEventListener("pointermove",e=>{
      if(matchMedia("(pointer: coarse)").matches) return;
      const r = card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      gsap.to(card,{rotationY:x*8,rotationX:y*-8,x:x*8,y:y*8,duration:.45,ease:"power2.out",transformPerspective:900});
    });
    card.addEventListener("pointerleave",()=>gsap.to(card,{rotationY:0,rotationX:0,x:0,y:0,duration:.7,ease:"power3.out"}));
  });

  window.addEventListener("pointermove",e=>{
    document.documentElement.style.setProperty("--mouse-x",(e.clientX/innerWidth*100)+"%");
    document.documentElement.style.setProperty("--mouse-y",(e.clientY/innerHeight*100)+"%");
    gsap.to(".sun-flare",{x:(e.clientX/innerWidth-.5)*55,y:(e.clientY/innerHeight-.5)*35,duration:1.3,ease:"power2.out"});
  });
}

function initHologram(){
  const card=document.getElementById("hologramCard");
  let timer;
  const start=()=>{
    clearTimeout(timer);
    card.classList.add("active");
    gsap.fromTo(".holo-image",{scale:1.09},{scale:1,duration:1.6,ease:"power2.out"});
  };
  const end=()=>{timer=setTimeout(()=>card.classList.remove("active"),160)};
  ["pointerdown","keydown"].forEach(type=>card.addEventListener(type,e=>{
    if(type==="keydown"&&!["Enter"," "].includes(e.key))return;
    e.preventDefault();start();
  }));
  ["pointerup","pointercancel","pointerleave","keyup"].forEach(type=>card.addEventListener(type,end));
}

soundToggle.addEventListener("click",async()=>{
  if(soundtrack.paused){
    try{await soundtrack.play();soundToggle.classList.add("on");soundToggle.querySelector(".sound-text").textContent="mute";}
    catch(e){}
  }else{
    soundtrack.pause();soundToggle.classList.remove("on");soundToggle.querySelector(".sound-text").textContent="sound";
  }
});

function initStars(){
  const canvas=document.getElementById("starfield");
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,1000);
  camera.position.z=3.8;

  const count=matchMedia("(max-width: 700px)").matches?1100:2300;
  const geo=new THREE.BufferGeometry();
  const pos=new Float32Array(count*3);
  for(let i=0;i<count;i++){
    const r=6+Math.random()*13;
    const theta=Math.random()*Math.PI*2;
    const phi=Math.acos(2*Math.random()-1);
    pos[i*3]=r*Math.sin(phi)*Math.cos(theta);
    pos[i*3+1]=r*Math.sin(phi)*Math.sin(theta);
    pos[i*3+2]=r*Math.cos(phi);
  }
  geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
  const mat=new THREE.PointsMaterial({size:.016,color:0xe8eef7,transparent:true,opacity:.75,sizeAttenuation:true});
  const stars=new THREE.Points(geo,mat);
  scene.add(stars);

  let mouseX=0,mouseY=0;
  addEventListener("pointermove",e=>{mouseX=(e.clientX/innerWidth-.5);mouseY=(e.clientY/innerHeight-.5)});
  function resize(){
    renderer.setSize(innerWidth,innerHeight,false);
    camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  }
  resize();addEventListener("resize",resize);
  renderer.setAnimationLoop(()=>{
    stars.rotation.y+=.00018;
    stars.rotation.x+=.00004;
    stars.rotation.y+=(mouseX*.06-stars.rotation.y*.015)*.003;
    camera.position.x+=(mouseX*.16-camera.position.x)*.015;
    camera.position.y+=(-mouseY*.11-camera.position.y)*.015;
    renderer.render(scene,camera);
  });
}

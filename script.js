(() => {
  const root = document.documentElement;
  const butterflyWrap = document.getElementById('butterflyWrap');
  const wingLeft = document.getElementById('wingLeft');
  const wingRight = document.getElementById('wingRight');
  const cocoonWrap = document.getElementById('cocoonWrap');
  const chapterNumber = document.getElementById('chapterNumber');
  const shadow = document.querySelector('.specimen-shadow');
  const canvas = document.getElementById('atmosphere');
  const ctx = canvas.getContext('2d', { alpha: true });

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let targetProgress = 0;
  let progress = 0;
  let lastY = scrollY;
  let velocity = 0;
  let raf = 0;
  let particles = [];
  let dpr = Math.min(devicePixelRatio || 1, 1.5);

  const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = t => t * t * (3 - 2 * t);
  const range = (v, a, b) => clamp((v - a) / (b - a));

  function updateTarget() {
    const max = document.documentElement.scrollHeight - innerHeight;
    targetProgress = max > 0 ? clamp(scrollY / max) : 0;
    velocity = scrollY - lastY;
    lastY = scrollY;
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function flightPath(p) {
    const fly = smooth(range(p, 0, .60));
    const settle = smooth(range(p, .60, .72));

    const startX = innerWidth * .73;
    const startY = innerHeight * .20;
    const midX = innerWidth * .30;
    const midY = innerHeight * .52;
    const endX = innerWidth * .59;
    const endY = innerHeight * .36;

    let x, y;
    if (fly < .56) {
      const t = fly / .56;
      x = lerp(startX, midX, t);
      y = lerp(startY, midY, t);
    } else {
      const t = (fly - .56) / .44;
      x = lerp(midX, endX, t);
      y = lerp(midY, endY, t);
    }

    const wander = 1 - settle;
    x += Math.sin(p * 37) * innerWidth * .026 * wander;
    y += Math.sin(p * 58 + .8) * innerHeight * .028 * wander;

    if (p > .60) {
      x = lerp(x, innerWidth * .60, settle);
      y = lerp(y, innerHeight * .37, settle);
    }
    return { x, y };
  }

  function render() {
    const p = progress;
    root.style.setProperty('--progress', p.toFixed(4));

    const pos = flightPath(p);
    const fold = smooth(range(p, .56, .76));
    const cocoonIn = smooth(range(p, .69, .81));
    const butterflyOut = 1 - smooth(range(p, .68, .79));
    const still = smooth(range(p, .74, .92));

    const flutterBase = reduced ? 0 : Math.sin(performance.now() * .013 * (1 - still * .92));
    const flutter = flutterBase * (42 * (1 - fold) + 3);
    const driftRoll = reduced ? 0 : Math.sin(p * 28) * 7 * (1 - fold);
    const scrollLean = clamp(velocity * .06, -9, 9) * (1 - fold);
    const scale = lerp(1.0, .47, fold);

    const bx = pos.x - butterflyWrap.offsetWidth / 2;
    const by = pos.y - butterflyWrap.offsetWidth * .34;
    butterflyWrap.style.transform = `translate3d(${bx}px,${by}px,0) rotateZ(${driftRoll + scrollLean}deg) rotateX(${5 + Math.sin(p * 8) * 5}deg) scale(${scale})`;
    butterflyWrap.style.opacity = butterflyOut.toFixed(3);

    const foldAngle = lerp(0, 78, fold);
    wingLeft.style.transform = `perspective(600px) rotateY(${flutter + foldAngle}deg) rotateZ(${fold * 7}deg) scaleX(${1 - fold * .25})`;
    wingRight.style.transform = `perspective(600px) rotateY(${-flutter - foldAngle}deg) rotateZ(${-fold * 7}deg) scaleX(${1 - fold * .25})`;

    const cx = innerWidth * .60 - cocoonWrap.offsetWidth / 2;
    const cy = innerHeight * .27;
    const cocoonSwing = reduced ? 0 : Math.sin(performance.now() * .0015) * 1.7 * cocoonIn;
    cocoonWrap.style.transform = `translate3d(${cx}px,${cy}px,0) rotateZ(${cocoonSwing}deg) scale(${lerp(.72,1,cocoonIn)})`;
    cocoonWrap.style.opacity = cocoonIn.toFixed(3);

    const shadowScale = lerp(1,.45,fold);
    shadow.style.transform = `translate3d(${pos.x - 130}px,${Math.min(innerHeight * .86, pos.y + 155)}px,0) scale(${shadowScale})`;
    shadow.style.opacity = (.18 * (1 - cocoonIn)).toFixed(3);

    const chapter = p < .28 ? '01' : p < .55 ? '02' : p < .81 ? '03' : '04';
    if (chapterNumber.textContent !== chapter) chapterNumber.textContent = chapter;
  }

  function tick() {
    const ease = reduced ? .32 : .095;
    progress += (targetProgress - progress) * ease;
    render();
    velocity *= .85;

    if (Math.abs(targetProgress - progress) > .0002 || Math.abs(velocity) > .2) {
      raf = requestAnimationFrame(tick);
    } else {
      progress = targetProgress;
      render();
      raf = 0;
    }
  }

  function resizeCanvas() {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(48, Math.floor(innerWidth / 28));
    particles = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * .9 + .2,
      a: Math.random() * .22 + .03,
      s: Math.random() * .08 + .025,
      phase: Math.random() * Math.PI * 2,
      depth: Math.random() * .8 + .2
    }));
  }

  let atmosphereFrame = 0;
  function drawAtmosphere(t) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const p = progress;
    for (const dot of particles) {
      const y = (dot.y + p * 180 * dot.depth + t * dot.s) % (innerHeight + 20) - 10;
      const x = dot.x + Math.sin(t * .00025 + dot.phase) * 18 * dot.depth;
      ctx.beginPath();
      ctx.arc(x, y, dot.r * dot.depth, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(130,205,255,${dot.a * (1 - p * .45)})`;
      ctx.fill();
    }
    atmosphereFrame = requestAnimationFrame(drawAtmosphere);
  }

  addEventListener('scroll', updateTarget, { passive: true });
  addEventListener('resize', () => {
    resizeCanvas();
    updateTarget();
  }, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  });

  resizeCanvas();
  updateTarget();
  atmosphereFrame = requestAnimationFrame(drawAtmosphere);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(atmosphereFrame);
    } else {
      atmosphereFrame = requestAnimationFrame(drawAtmosphere);
    }
  });
})();
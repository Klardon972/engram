/* Engram site — particle brain, terminal, reveals, lightbox */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- repo links ---------- */
  document.querySelectorAll('[data-repo]').forEach(a => (a.href = 'https://github.com/Klardon972/engram'));

  /* ---------- nav background on scroll ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- scroll reveal ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('[data-reveal],[data-reveal-group]').forEach(el => io.observe(el));

  /* ---------- lightbox ---------- */
  let lb = null, lbImg = null;
  const ensureLb = () => {
    if (lb) return;
    lb = document.createElement('div');
    lb.className = 'lightbox'; lb.id = 'lightbox'; lb.tabIndex = -1;
    lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Screenshot');
    lbImg = document.createElement('img'); lb.append(lbImg);
    lb.addEventListener('click', close);
  };
  let opener = null;
  document.querySelectorAll('.shot img, .card img').forEach(img => {
    const b = document.createElement('button');
    b.className = 'zoom'; b.type = 'button'; b.setAttribute('aria-label', 'Enlarge screenshot: ' + img.alt);
    img.replaceWith(b); b.append(img);
    b.addEventListener('click', () => { ensureLb(); document.body.append(lb); opener = b; lbImg.src = img.src; lbImg.alt = img.alt; lb.classList.remove('closing'); lb.focus(); });
  });
  function close() { if (!lb || !lb.isConnected) return; lb.classList.add('closing'); setTimeout(() => { lb.remove(); opener && opener.focus(); }, 160); }
  addEventListener('keydown', e => e.key === 'Escape' && close());

  /* ---------- terminal ---------- */
  const term = document.getElementById('term');
  const script = [
    ['u', '> What did we decide about the Engram brain view?\n\n'],
    ['dim', '  ● '], ['tool', 'engram.get_project_context'], ['dim', '({ project: "current" })\n'],
    ['ok', '    ✓ '], ['dim', 'engram · 6 conversations · 16 decisions · 24 ideas\n\n'],
    ['', '  Recent decisions, newest first:\n\n'],
    ['dec', '  ◆ '], ['', 'Build a detailed, brain-like system\n'],
    ['dec', '  ◆ '], ['', 'Keep the existing categories and spread them\n    across the brain regions\n'],
    ['dec', '  ◆ '], ['', 'Start with the brain, then the other regions\n'],
    ['dim', '  ◇ Distribute entry types across 9 body regions  (superseded)\n\n'],
    ['', '  Want me to open the 9-region map?'],
  ];
  let typed = false;
  const type = async () => {
    if (typed) return; typed = true;
    const caret = document.createElement('span'); caret.className = 'caret';
    for (const [cls, text] of script) {
      const span = document.createElement('span'); if (cls) span.className = cls;
      term.append(span); term.append(caret);
      if (reduce) { span.textContent = text; continue; }
      const speed = cls === 'u' ? 26 : 6;
      for (let i = 0; i < text.length; i++) { span.textContent += text[i]; await new Promise(r => setTimeout(r, speed)); }
      await new Promise(r => setTimeout(r, cls === 'u' ? 420 : cls === 'tool' || cls === 'ok' ? 260 : 40));
    }
  };
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { type(); o.disconnect(); } }, { threshold: .4 }).observe(term);

  /* ---------- particle brain ---------- */
  const cv = document.getElementById('brain');
  const ctx = cv.getContext('2d');
  const REG = [ // colour, centre (x right, y up, z front) in brain space
    ['#9fc6ff', [ .55, .15, -.25]], // knowledge – parietal/temporal
    ['#a7e3c4', [ .0, .05, -1.0]],  // perception – occipital
    ['#f2b3cf', [ .0, -.25, .95]],  // personality – orbitofrontal
    ['#8fd8e8', [ .82, -.35, .15]], // communication – temporal
    ['#e9c48a', [ .0, -.95, -.35]], // structure – brainstem
    ['#d7b4f0', [ .35, .75, .05]],  // action – motor
    ['#f0a08c', [ .3, .45, .75]],   // reasoning – prefrontal
    ['#9eb0ff', [ .0, -.62, -.85]], // foundations – cerebellum
    ['#f3dd9a', [ .35, .75, -.3]],  // automation – somatosensory
  ].map(([c, p]) => ({ c, p, rgb: [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)) }));

  // brain-ish SDF: two squashed hemispheres + cerebellum + stem, with folding noise
  const N = matchMedia('(max-width: 700px)').matches ? 5200 : 11000;
  const pts = [];
  const fold = (x, y, z) => Math.sin(x * 9 + Math.sin(z * 7) * 1.6) * Math.sin(y * 8 + Math.sin(x * 5)) * Math.cos(z * 8 + y * 3);
  let guard = 0;
  while (pts.length < N && guard++ < N * 40) {
    // sample a direction, place on the surface of the chosen part
    const part = Math.random();
    let x, y, z, nx, ny, nz;
    const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    nx = s * Math.cos(th); ny = u; nz = s * Math.sin(th);
    if (part < .84) { // cerebrum hemisphere
      const side = nx >= 0 ? 1 : -1;
      const r = 1 + .055 * fold(nx, ny, nz);
      x = side * .06 + nx * .62 * r; y = ny * .62 * r + .08; z = nz * .92 * r;
      if (y < -.28) continue;                    // flat underside
      if (Math.abs(x) < .06) continue;          // longitudinal fissure
      // sylvian fissure: a groove along the side
      const syl = Math.abs(y - (-.05 + z * .25)); if (Math.abs(x) > .5 && syl < .025 && z > -.4) continue;
      if (y < -.12 && z > .35 && Math.abs(x) > .45) continue; // temporal pole notch
    } else if (part < .96) { // cerebellum
      const r = 1 + .04 * Math.sin(ny * 40);
      x = nx * .5 * r; y = ny * .2 * r - .45; z = nz * .32 * r - .58;
    } else { // stem
      const t = Math.random(), a = Math.random() * Math.PI * 2, rr = .1 - t * .03;
      x = Math.cos(a) * rr; z = Math.sin(a) * rr - .25; y = -.25 - t * .75;
    }
    // region membership by distance (mirror x so both hemispheres light up)
    let best = -1, bd = 1e9;
    for (let i = 0; i < REG.length; i++) {
      const p = REG[i].p, dx = Math.abs(x) - p[0], dy = y - p[1], dz = z - p[2];
      const d = dx * dx + dy * dy + dz * dz; if (d < bd) { bd = d; best = i; }
    }
    const glow = Math.max(0, 1 - bd / .16);
    pts.push({ x, y, z, r: best, g: glow * glow, tw: Math.random() * 6.28, hot: Math.random() < .018 });
  }

  // precomputed colours: cool white blended toward each region's colour
  const STEPS = 8, halos = [];
  for (const R of REG) R.mix = Array.from({ length: STEPS }, (_, s) => {
    const k = s / (STEPS - 1);
    return `rgb(${150 + (R.rgb[0] - 150) * k | 0},${165 + (R.rgb[1] - 165) * k | 0},${190 + (R.rgb[2] - 190) * k | 0})`;
  });

  let W = 0, H = 0, dpr = 1;
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  addEventListener('resize', resize); resize();

  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });

  // spring-ish follow for the pointer (decorative, so it may lag)
  let rot = .6, visible = true, last = performance.now();
  new IntersectionObserver(es => (visible = es[0].isIntersecting)).observe(cv);

  const frame = now => {
    requestAnimationFrame(frame);
    if (visible) draw(now);
  };
  const draw = now => {
    const dt = Math.min(50, now - last); last = now;
    if (!reduce) rot += dt * .00011;
    mx += (tx - mx) * .045; my += (ty - my) * .045;
    const ay = rot + mx * .6, ax = -.18 + my * .35;
    const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    const wide = W > 900;
    const scale = Math.min(W * (wide ? .3 : .42), H * .44);
    const ox = wide ? W * .68 : W * .5, oy = H * (wide ? .5 : .36);
    const t = now * .001;

    ctx.clearRect(0, 0, W, H);
    // soft core glow
    const gr = ctx.createRadialGradient(ox, oy, 0, ox, oy, scale * 1.5);
    gr.addColorStop(0, 'rgba(120,160,230,.10)'); gr.addColorStop(1, 'rgba(7,8,11,0)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      // rotate Y then X
      let x = p.x * cy + p.z * sy, z = -p.x * sy + p.z * cy, y = p.y;
      const y2 = y * cx - z * sx; z = y * sx + z * cx; y = y2;
      const persp = 2.6 / (2.6 - z);
      const px = ox + x * scale * persp, py = oy - y * scale * persp;
      const depth = (z + 1) * .5; // 0 back … 1 front
      const R = REG[p.r];
      const pulse = .55 + .45 * Math.sin(t * 1.3 + p.tw + p.r);
      const g = p.g * (0.55 + .45 * pulse);
      // base cool white mixed toward region colour
      const k = Math.min(STEPS - 1, (g * 1.2 * STEPS) | 0);
      const a = (.16 + depth * .62) * (.55 + g * 1.0) + (p.hot ? .5 * pulse : 0);
      const size = (p.hot ? 2.4 : 1.25 + g * 1.1) * persp;
      ctx.globalAlpha = a > 1 ? 1 : a;
      ctx.fillStyle = R.mix[k];
      ctx.fillRect(px - size / 2, py - size / 2, size, size);
      if (p.hot && depth > .45) halos.push(px, py, persp, pulse, p.r);
    }
    for (let i = 0; i < halos.length; i += 5) {
      ctx.globalAlpha = .1 * halos[i + 3];
      ctx.fillStyle = REG[halos[i + 4]].c;
      ctx.beginPath(); ctx.arc(halos[i], halos[i + 1], 9 * halos[i + 2], 0, 6.283); ctx.fill();
    }
    halos.length = 0;
    ctx.globalAlpha = 1;
    {
    }
    ctx.globalCompositeOperation = 'source-over';
  };
  draw(performance.now()); // first frame immediately, even before rAF starts
  requestAnimationFrame(frame);
  window.__engramDraw = draw;
})();

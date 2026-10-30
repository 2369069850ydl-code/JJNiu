// Progressive motion for the existing portfolio. All content is readable without it.
(() => {
  const gs = window.gsap;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const managed = new Set();
  const groups = [];
  let preference;
  try { preference = sessionStorage.getItem('portfolio-motion'); } catch {}
  let enabled = preference === 'on' || (preference !== 'off' && !media.matches);
  let observer;
  let heroPlayed = false;
  const toggles = [...document.querySelectorAll('.motion-toggle')];
  const addManaged = nodes => nodes.forEach(node => managed.add(node));
  function tween(nodes, from, to) {
    if (!gs || !enabled || !nodes.length) return;
    addManaged(nodes);
    return gs.fromTo(nodes, from, { ...to, overwrite: 'auto' });
  }
  function clearPanel(panel) {
    if (!gs) return;
    const nodes = [panel, ...panel.querySelectorAll('.v-project-copy > *, .v-project-media')];
    gs.killTweensOf(nodes);
    gs.set(nodes, { clearProps: 'opacity,transform,filter,clipPath' });
    panel.classList.remove('is-switching');
  }
  function switchPanel(panel) {
    clearPanel(panel);
    if (!enabled || !gs) return;
    const copy = [...panel.querySelectorAll('.v-project-copy > *')];
    const visual = [...panel.querySelectorAll('.v-project-media')];
    tween(copy, { y: 24, opacity: 0 }, {
      y: 0, opacity: 1, duration: .64, stagger: .065,
      ease: 'power3.out', clearProps: 'opacity,transform'
    });
    tween(visual, { x: 28, y: 10, scale: .96, opacity: .2 }, {
      x: 0, y: 0, scale: 1, opacity: 1, duration: .8,
      ease: 'power3.out', clearProps: 'opacity,transform'
    });
    panel.classList.add('is-switching');
    setTimeout(() => panel.classList.remove('is-switching'), 950);
  }
  window.portfolioMotion = { clearPanel, switchPanel, get enabled() { return enabled; } };
  document.documentElement.dataset.motionVersion = '20261030-2';
  function playHero() {
    if (heroPlayed || !enabled || !gs || scrollY > innerHeight * .45) return;
    heroPlayed = true;
    const header = document.querySelector(".header-inner");
    if (header) tween([header], { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: "power3.out", clearProps: "opacity,transform" });
    const lines = [...document.querySelectorAll('.hero-line > span')];
    const identity = [...document.querySelectorAll('.v-identity > *')];
    const subtitle = [...document.querySelectorAll('.v-hero-subtitle')];
    const buttons = [...document.querySelectorAll('.v-hero-actions > a')];
    addManaged([...lines, ...identity, ...subtitle, ...buttons]);
    const timeline = gs.timeline({ defaults: { ease: 'power3.out' } });
    if (identity.length) timeline.fromTo(identity, { y: -14, opacity: 0 },
      { y: 0, opacity: 1, duration: .65, stagger: .09, clearProps: 'opacity,transform' }, .05);
    if (lines.length) timeline.fromTo(lines, { yPercent: 112, opacity: .2 },
      { yPercent: 0, opacity: 1, duration: .9, stagger: .13, clearProps: 'opacity,transform' }, .12);
    if (subtitle.length) timeline.fromTo(subtitle, { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: .7, clearProps: 'opacity,transform' }, .55);
    if (buttons.length) timeline.fromTo(buttons, { y: 19, opacity: 0 },
      { y: 0, opacity: 1, duration: .6, stagger: .08, clearProps: 'opacity,transform' }, .7);
    const intro = [...document.querySelectorAll('.case-intro > *, .about-hero > div > *, .about-hero > figure')];
    tween(intro, { y: 25, opacity: 0 }, {
      y: 0, opacity: 1, duration: .8, stagger: .085,
      ease: 'power3.out', clearProps: 'opacity,transform'
    });
  }
  function register(container, selector, config = {}) {
    if (!container) return;
    const nodes = selector ? [...container.querySelectorAll(selector)] : [container];
    if (!nodes.length) return;
    const group = { container, nodes, config, played: false };
    groups.push(group);
    if (observer) observer.observe(container);
  }
  function reveal(group) {
    if (group.played || !enabled) return;
    group.played = true;
    group.container.dataset.motionRevealed = 'true';
    if (observer) observer.unobserve(group.container);
    tween(group.nodes, { y: group.config.y ?? 32, opacity: 0 }, {
      y: 0, opacity: 1, duration: group.config.duration ?? .8,
      stagger: group.config.stagger ?? .09,
      ease: 'power3.out', clearProps: 'opacity,transform'
    });
  }
  if ('IntersectionObserver' in window && gs) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const group = groups.find(group => group.container === entry.target);
          if (group) reveal(group);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
  }
  register(document.querySelector('.v-stats'), '.v-stat', { stagger: .12, y: 36 });
  register(document.querySelector('.v-about'), '.v-portrait, .v-about-copy > .v-label, .v-about-copy > h2, .v-about-copy > p, .v-capabilities > a, .v-about-more', { stagger: .075 });
  document.querySelectorAll('.v-ai-profile').forEach(node =>
    register(node, '.ai-profile-copy > *, .ai-workbench-top, .ai-workflow > div, .ai-skill-notes', { stagger: .075, y: 26 }));
  document.querySelectorAll('.v-section-heading, .section-heading').forEach(node => register(node, null, { y: 22 }));
  register(document.querySelector('.v-project-nav'), 'a', { stagger: .05, y: 17 });
  register(document.querySelector('.v-project-stage'), null, { y: 38, duration: .85 });
  register(document.querySelector('.v-next-feature'), null, { y: 22 });
  register(document.querySelector('.v-product-grid'), ':scope > a', { stagger: .11 });
  register(document.querySelector('.v-resume-grid'), ':scope > a', { stagger: .08, y: 25 });
  register(document.querySelector('.case-stats'), ':scope > div', { stagger: .1 });
  register(document.querySelector('.case-cover'), null, { y: 35 });
  document.querySelectorAll('.case-chapter, .career-row, .education, .tool-line').forEach(node => register(node));
  document.querySelectorAll('.process-grid, .resume-grid').forEach(node => register(node, ':scope > *'));
  register(document.querySelector('.v-footer-main'), ':scope > div', { stagger: .13, y: 24 });
  register(document.querySelector('.v-contact-row'), null, { y: 18 });
  function revealVisible() {
    groups.forEach(group => {
      const rect = group.container.getBoundingClientRect();
      if (!observer || (rect.top < innerHeight * .95 && rect.bottom > 0)) reveal(group);
    });
  }
  function setEnabled(next, remember = false) {
    enabled = next;
    document.body.dataset.motion = enabled ? 'on' : 'off';
    document.documentElement.classList.toggle('motion-override', preference === 'on');
    toggles.forEach(button => {
      button.hidden = false;
      button.textContent = enabled ? '暂停动效' : '开启动效';
      button.setAttribute('aria-pressed', String(enabled));
    });
    if (!enabled && gs) {
      gs.killTweensOf([...managed]);
      gs.set([...managed], { clearProps: 'opacity,transform,filter,clipPath' });
      document.querySelectorAll('.v-capabilities > a, .v-product-grid > a, .v-resume-grid > a, .resume-card').forEach(card => {
        gs.killTweensOf(card); gs.set(card, { clearProps: 'transform' });
      });
    } else {
      playHero();
      revealVisible();
    }
    if (remember) try { sessionStorage.setItem('portfolio-motion', enabled ? 'on' : 'off'); } catch {}
    restartParticles();
  }
  toggles.forEach(button => button.addEventListener('click', () => {
    preference = enabled ? 'off' : 'on';
    setEnabled(!enabled, true);
  }));
  media.addEventListener('change', () => { if (preference !== 'on' && preference !== 'off') setEnabled(!media.matches); });
  const hoverCards = [...document.querySelectorAll('.v-capabilities > a, .v-product-grid > a, .v-resume-grid > a, .resume-card')];
  hoverCards.forEach(card => {
    card.classList.add('motion-card');
    card.addEventListener('pointermove', event => {
      if (!enabled || !fine.matches || !gs) return;
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      card.style.setProperty('--pointer-x', x * 100 + '%');
      card.style.setProperty('--pointer-y', y * 100 + '%');
      gs.to(card, { y: -6, rotationX: (y - .5) * -4, rotationY: (x - .5) * 5,
        transformPerspective: 900, duration: .45, ease: 'power2.out', overwrite: 'auto' });
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      if (!gs) return;
      if (!enabled) { gs.set(card, { clearProps: 'transform' }); return; }
      gs.to(card, { y: 0, rotationX: 0, rotationY: 0, duration: .55,
        ease: 'power3.out', clearProps: 'transform', overwrite: 'auto' });
    });
  });
  let scrollScheduled = false;
  function syncScroll() {
    document.querySelector('.site-header')?.classList.toggle('is-scrolled', scrollY > 50);
    scrollScheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(syncScroll); }
  }, { passive: true });
  syncScroll();
  // Original canvas renderer: time-based motion, visible stars, 30fps pacing.
  const canvas = document.querySelector('#particle-canvas');
  const ctx = canvas?.getContext('2d');
  let width = 0, height = 0, points = [], frame = 0, last = 0;
  function resizeParticles() {
    if (!ctx) return;
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    points = Array.from({ length: Math.min(84, Math.max(38, Math.floor(width / 17))) }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: 3 + Math.random() * 10, vy: -7 - Math.random() * 13,
      r: .65 + Math.random() * 1.35, alpha: .28 + Math.random() * .4,
      phase: Math.random() * Math.PI * 2
    }));
  }
  function paintParticles(now, delta) {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    points.forEach(point => {
      if (enabled) {
        point.x = (point.x + point.vx * delta + width) % width;
        point.y = (point.y + point.vy * delta + height) % height;
      }
    });
    ctx.shadowBlur = 0;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i], b = points[j], distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < 115) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = 'rgba(113,177,255,' + (1 - distance / 115) * .11 + ')';
          ctx.lineWidth = .6; ctx.stroke();
        }
      }
    }
    points.forEach(point => {
      const twinkle = enabled ? .72 + Math.sin(now * .0011 + point.phase) * .28 : .75;
      ctx.beginPath(); ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
      ctx.shadowColor = '#80c9ff'; ctx.shadowBlur = point.r > 1.4 ? 10 : 3;
      ctx.fillStyle = 'rgba(173,216,255,' + point.alpha * twinkle + ')'; ctx.fill();
    });
    ctx.shadowBlur = 0;
  }
  function particleLoop(now) {
    if (!enabled || document.hidden) { frame = 0; return; }
    const elapsed = now - last;
    if (elapsed >= 32 || !last) {
      paintParticles(now, last ? Math.min(elapsed / 1000, .08) : 0);
      last = now;
    }
    frame = requestAnimationFrame(particleLoop);
  }
  function restartParticles() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    if (!ctx) return;
    paintParticles(performance.now(), 0);
    if (enabled && !document.hidden) frame = requestAnimationFrame(particleLoop);
  }
  resizeParticles();
  window.addEventListener('resize', () => { resizeParticles(); restartParticles(); }, { passive: true });
  document.addEventListener('visibilitychange', restartParticles);
  setEnabled(enabled);
})();

/* ═══════════════════════════════════════════════════
   header.js — Prospect Immo
   Contient : intro hero + parallax souris + toutes les interactions
═══════════════════════════════════════════════════ */


/* ──────────────────────────────────────────────────
   1. ANIMATION D'INTRO DU HERO
   S'exécute immédiatement au chargement de la page.
   Séquence : image monte → logo apparaît → image
   plonge vers le bas → tagline + scroll cue apparaissent.
────────────────────────────────────────────────── */
(function () {
  const img      = document.getElementById('heroImage');
  const brand    = document.getElementById('heroBrand');
  const tagline  = document.getElementById('heroTagline');
  const scrollEl = document.getElementById('heroScroll');
  const scrollCue = document.getElementById('heroScrollCue');

  document.body.style.overflow = 'hidden';

  function animate({ from, to, duration, easing = t => t, onUpdate, onDone }) {
    const start = performance.now();
    function step(now) {
      const raw = Math.min((now - start) / duration, 1);
      onUpdate(from + (to - from) * easing(raw));
      if (raw < 1) requestAnimationFrame(step);
      else if (onDone) onDone();
    }
    requestAnimationFrame(step);
  }

  function delay(ms, fn) { setTimeout(fn, ms); }
  const easeOut   = t => 1 - Math.pow(1 - t, 3);
  const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function setY(pct) { if (img) img.style.objectPosition = `center ${pct}%`; }
  setY(0);

  animate({
    from: 0, to: 40, duration: 2500, easing: easeOut, onUpdate: setY,
    onDone: () => {
      if (brand) brand.classList.add('visible');
      animate({ from: 40, to: 41, duration: 4000, onUpdate: setY });

      delay(4000, () => {
        if (brand) brand.classList.add('fading');
        delay(800, () => {
          animate({
            from: 41, to: 93, duration: 2200, easing: easeInOut, onUpdate: setY,
            onDone: () => {
              document.body.style.overflow = '';
              if (tagline)   tagline.classList.add('visible');
              if (scrollEl)  scrollEl.classList.add('visible');
              if (scrollCue) scrollCue.classList.add('visible');
            }
          });
        });
      });
    }
  });
})();


/* ──────────────────────────────────────────────────
   2. INTERACTIONS — chargées quand le DOM est prêt
────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {


  /* ── 2a. NAVBAR — burger + scroll ── */
  (function initNavbar() {
    const burger    = document.getElementById('menu0Burger');
    const offcanvas = document.getElementById('menu0Offcanvas');
    const wrapper   = document.querySelector('.menu0-wrapper');

    if (burger && offcanvas) {
      burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        offcanvas.classList.toggle('active');
      });
      offcanvas.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          burger.classList.remove('active');
          offcanvas.classList.remove('active');
        });
      });
      document.addEventListener('click', e => {
        if (offcanvas.classList.contains('active') &&
            !e.target.closest('#menu0Burger') &&
            !e.target.closest('#menu0Offcanvas')) {
          burger.classList.remove('active');
          offcanvas.classList.remove('active');
        }
      });
    }

    if (wrapper) {
      window.addEventListener('scroll', () => {
        wrapper.classList.toggle('menu-scrolled', window.scrollY > 50);
      }, { passive: true });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  })();


  /* ── 2b. PARALLAX SOURIS HERO ── */
  const heroSection  = document.getElementById('hero');
  const heroParallax = document.getElementById('heroParallax');
  let pTargetX = 0, pTargetY = 0, pCurrentX = 0, pCurrentY = 0;
  const STRENGTH = 20;
  const EASE     = 0.055;

  if (heroSection && heroParallax) {
    heroSection.addEventListener('mousemove', function (e) {
      const r  = heroSection.getBoundingClientRect();
      const nx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const ny = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      pTargetX = -nx * STRENGTH;
      pTargetY = -ny * STRENGTH;
    });
    heroSection.addEventListener('mouseleave', () => { pTargetX = 0; pTargetY = 0; });

    (function animateParallax() {
      pCurrentX += (pTargetX - pCurrentX) * EASE;
      pCurrentY += (pTargetY - pCurrentY) * EASE;
      heroParallax.style.transform =
        `translate(${pCurrentX}px, ${pCurrentY}px) scale(1.07)`;
      requestAnimationFrame(animateParallax);
    })();
  }


  /* ── 2c. HERO GLASS CARD — Carousel interne + compteur animé ── */
  (function initGlassCarousel() {
    const card = document.getElementById('heroGlassCard');
    if (!card) return;

    const slides   = Array.from(card.querySelectorAll('.hgc-slide'));
    const dots     = Array.from(card.querySelectorAll('.hgc-dot'));
    const DELAY    = 5000;
    const DUR      = 1800;
    let   current  = 0;
    let   timer    = null;
    const animated = new Set();

    function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

    function animateCounter(slide) {
      const el = slide.querySelector('.hgc-number');
      if (!el || animated.has(el)) return;
      animated.add(el);
      const target = parseInt(el.dataset.target, 10);
      const start  = performance.now();
      (function step(now) {
        const p = Math.min((now - start) / DUR, 1);
        el.textContent = Math.round(easeOutQuart(p) * target).toLocaleString('fr-FR');
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    }

    function goTo(idx) {
      slides[current].classList.remove('hgc-slide--active');
      slides[current].classList.add('hgc-slide--exit');
      dots[current].classList.remove('hgc-dot--active');

      setTimeout(() => {
        slides[current].classList.remove('hgc-slide--exit');
        current = idx;
        slides[current].classList.add('hgc-slide--active');
        dots[current].classList.add('hgc-dot--active');
        animateCounter(slides[current]);
      }, 120);
    }

    function startLoop() {
      timer = setInterval(() => {
        goTo((current + 1) % slides.length);
      }, DELAY);
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        if (i === current) return;
        clearInterval(timer);
        goTo(i);
        startLoop();
      });
    });

    setTimeout(() => {
      animateCounter(slides[0]);
      startLoop();
    }, 8700);
  })();


  /* ── 2d. FAQ ── */
  document.querySelectorAll('.faq2-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item   = btn.closest('.faq2-item');
      item.classList.toggle('active');
      const answer = item.querySelector('.faq2-answer');
      answer.style.maxHeight = item.classList.contains('active')
        ? answer.scrollHeight + 'px' : null;
    });
  });


  /* ── 2e. BENTO GLOW ── */
  document.querySelectorAll('.bento1-glow').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--x', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--y', (e.clientY - rect.top)  + 'px');
    });
  });


  /* ── 2f. CAROUSEL — Double rAF crossfade ultra-fluide ──

     Aucun déplacement DOM. Le JS toggle des classes + style.opacity.
     Le double rAF garantit que le reflow est complètement peint
     avant de lancer la transition opacity, éliminant tout flash.
  ── */
  (function initCarousel() {
    const TOTAL   = 6;
    const FADE_MS = 700;
    const cards   = Array.from(document.querySelectorAll('.card-item'));
    const dots    = Array.from(document.querySelectorAll('.carousel-dot'));
    const nextBtn = document.querySelector('.carousel-nav .next');
    const prevBtn = document.querySelector('.carousel-nav .prev');
    if (!cards.length || !nextBtn || !prevBtn) return;

    let current     = 0;
    let isAnimating = false;

    function mod(n) { return ((n % TOTAL) + TOTAL) % TOTAL; }

    function setThumbs(mainIdx) {
      const t1 = mod(mainIdx + 1);
      const t2 = mod(mainIdx + 2);
      const t3 = mod(mainIdx + 3);
      cards.forEach((card, i) => {
        if (i >= TOTAL) { card.className = 'card-item cs-hidden'; return; }
        if (i === mainIdx) return;
        if (i === t1)        card.className = 'card-item cs-thumb-1';
        else if (i === t2)   card.className = 'card-item cs-thumb-2';
        else if (i === t3)   card.className = 'card-item cs-thumb-3';
        else                 card.className = 'card-item cs-hidden';
      });
    }

    function updateDots(idx) {
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }

    function triggerTextAnim(card) {
      card.querySelectorAll('.card-eyebrow,.card-headline,.card-sub-headline,.card-button')
        .forEach(el => {
          el.style.animation = 'none';
          void el.offsetWidth;
          el.style.animation = '';
        });
    }

    /* Init */
    cards[0].className = 'card-item cs-active';
    setThumbs(0);
    updateDots(0);
    triggerTextAnim(cards[0]);

    /* Navigation — double rAF pour garantir que l'opacity:0 est peint */
    function goTo(targetIdx) {
      if (isAnimating) return;
      targetIdx = mod(targetIdx);
      if (targetIdx === current) return;
      isAnimating = true;

      const oldCard = cards[current];
      const newCard = cards[targetIdx];

      /* 1. Prépare la nouvelle slide : plein écran, transparent, au-dessus */
      newCard.className         = 'card-item cs-fullscreen';
      newCard.style.opacity     = '0';
      newCard.style.transition  = 'none';
      newCard.style.zIndex      = '4';
      const textInner = newCard.querySelector('.card-text-inner');
      if (textInner) textInner.style.display = 'none';

      /* 2. Ancienne reste visible dessous */
      oldCard.style.zIndex = '3';

      /* 3. Vignettes intermédiaires (transition CSS) */
      setThumbs(targetIdx);

      /* ── Double rAF : garantit que opacity:0 est réellement peint ── */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          /* 4. Active la transition et lance le fondu entrant */
          newCard.style.transition = `opacity ${FADE_MS}ms cubic-bezier(0.4,0,0.2,1)`;
          newCard.style.opacity    = '1';

          /* 5. Simultanément, fondu sortant sur l'ancienne */
          oldCard.style.transition = `opacity ${FADE_MS}ms cubic-bezier(0.4,0,0.2,1)`;
          oldCard.style.opacity    = '0';

          /* 6. Finalise après la transition */
          setTimeout(() => {
            /* Reset inline styles */
            [oldCard, newCard].forEach(c => {
              c.style.opacity    = '';
              c.style.transition = '';
              c.style.zIndex     = '';
            });

            oldCard.className = 'card-item cs-hidden';
            newCard.className = 'card-item cs-active';
            if (textInner) textInner.style.display = '';
            setThumbs(targetIdx);

            current     = targetIdx;
            isAnimating = false;
            updateDots(current);
            triggerTextAnim(newCard);
          }, FADE_MS + 20);
        });
      });
    }

    nextBtn.addEventListener('click', () => goTo(current + 1));
    prevBtn.addEventListener('click', () => goTo(current - 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    /* Swipe touch */
    let touchStartX = 0;
    const slideEl = document.querySelector('.slide');
    if (slideEl) {
      slideEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
      slideEl.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) goTo(dx < 0 ? current + 1 : current - 1);
      }, { passive: true });
    }
  })();


  /* ── 2g. BEFORE / AFTER SLIDER ── */
  const sliderWrap = document.querySelector('.ba-slider-wrap');
  const baAfter    = document.getElementById('baAfter');
  const baHandle   = document.getElementById('baHandle');

  if (sliderWrap && baAfter && baHandle) {
    let isDragging = false;
    let targetPct  = 50;
    let currentPct = 50;

    function getPct(clientX) {
      const rect = sliderWrap.getBoundingClientRect();
      return Math.max(1, Math.min(99, ((clientX - rect.left) / rect.width) * 100));
    }

    (function animateSlider() {
      currentPct += (targetPct - currentPct) * 0.10;
      baAfter.style.clipPath = `inset(0 ${100 - currentPct}% 0 0)`;
      baHandle.style.left    = currentPct + '%';
      requestAnimationFrame(animateSlider);
    })();

    sliderWrap.addEventListener('mousedown',  e  => { isDragging = true;  targetPct = getPct(e.clientX); });
    window.addEventListener    ('mouseup',    ()  => { isDragging = false; });
    window.addEventListener    ('mousemove',  e  => { if (isDragging) targetPct = getPct(e.clientX); });
    sliderWrap.addEventListener('mousemove',  e  => { if (!isDragging) targetPct = getPct(e.clientX); });
    sliderWrap.addEventListener('touchstart', e  => { isDragging = true;  targetPct = getPct(e.touches[0].clientX); }, { passive: true });
    sliderWrap.addEventListener('touchmove',  e  => { targetPct = getPct(e.touches[0].clientX); },                    { passive: true });
    sliderWrap.addEventListener('touchend',   ()  => { isDragging = false; });
  }


}); /* fin DOMContentLoaded */
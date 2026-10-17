(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== WhatsApp: cambiá el número acá y se actualizan todos los botones ===== */
  const WA_NUMBER = '549351XXXXXXX'; // 54 + 9 + código de área sin 0 + número sin 15
  $$('a[href*="wa.me/"]').forEach(a => a.setAttribute('href', a.getAttribute('href').replace(/wa\.me\/[0-9X]+/, 'wa.me/' + WA_NUMBER)));

  /* ===== Instagram: poné el usuario acá (sin @) y se actualizan todos los links ===== */
  const IG_USER = ''; // ej: 'divertypark' → https://instagram.com/divertypark
  if (IG_USER) $$('a[data-ig]').forEach(a => a.setAttribute('href', 'https://instagram.com/' + IG_USER));

  /* ===== Navbar: sombra al scrollear ===== */
  const nav = $('#nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', scrollY > 10);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ===== Menú hamburguesa ===== */
  const burger = $('#burger');
  const menu = $('#menu');
  if (burger && menu) {
    const setMenu = (open) => {
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      menu.classList.toggle('open', open);
      menu.setAttribute('aria-hidden', !open);
      document.body.classList.toggle('lock', open);
    };
    burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
    $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
    // Cerrar tocando un espacio vacío o deslizando
    menu.addEventListener('click', e => { if (!e.target.closest('a')) setMenu(false); });
    let ty = null;
    menu.addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
    menu.addEventListener('touchend', e => {
      if (ty !== null && Math.abs(e.changedTouches[0].clientY - ty) > 70) setMenu(false);
      ty = null;
    }, { passive: true });
    addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    matchMedia('(min-width: 961px)').addEventListener('change', e => e.matches && setMenu(false));
  }

  /* ===== Aparecer al hacer scroll ===== */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ===== Link activo según la sección (solo secciones que tienen link en el menú) ===== */
  const links = $$('.nav__links a');
  const targets = $$('main section[id]').filter(t => links.some(l => l.getAttribute('href') === '#' + t.id));
  if (targets.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          links.forEach(l => l.classList.toggle('on', l.getAttribute('href') === '#' + en.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(t => spy.observe(t));
  }

  /* ===== Pausar animaciones fuera de pantalla ===== */
  const vis = new IntersectionObserver(es => es.forEach(en => en.target.classList.toggle('is-off', !en.isIntersecting)), { rootMargin: '120px 0px' });
  $$('main section').forEach(s => vis.observe(s));

  /* ===== Preguntas frecuentes ===== */
  $$('.acc__i button').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const open = !item.classList.contains('open');
      $$('.acc__i.open').forEach(i => {
        i.classList.remove('open');
        $('button', i).setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open);
    });
  });

  if (reduce) return;

  /* ===== Confeti al tocar botones principales ===== */
  const colors = ['#E4162B', '#FFC20E', '#1B6FD1', '#1B9A4B', '#F57C1F', '#7C3AED'];
  const burst = (x, y) => {
    const N = document.documentElement.classList.contains('lite') ? 10 : 22;
    for (let i = 0; i < N; i++) {
      const p = document.createElement('i');
      const a = Math.random() * Math.PI * 2;
      const d = 50 + Math.random() * 90;
      p.className = 'confetti';
      p.style.cssText = `left:${x}px;top:${y}px;--w:${6 + Math.random() * 8}px;--c:${colors[i % colors.length]};` +
        `--r:${Math.random() > .5 ? '50%' : '2px'};--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d + 30}px;--rot:${Math.random() * 540}deg`;
      document.body.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  };
  $$('[data-confetti]').forEach(b => b.addEventListener('click', e => {
    const r = b.getBoundingClientRect();
    burst(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2);
  }));

  /* ===== Inclinación 3D en tarjetas (solo con mouse) ===== */
  if (matchMedia('(hover: hover)').matches) {
    let raf = 0;
    const frame = fn => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; fn(); }); };
    $$('.game').forEach(card => {
      card.addEventListener('pointermove', e => {
        const { clientX, clientY } = e;
        frame(() => {
          const r = card.getBoundingClientRect();
          const x = (clientX - r.left) / r.width - .5, y = (clientY - r.top) / r.height - .5;
          card.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-4px)`;
        });
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
    const hero = $('.hero');
    if (hero) {
      const items = $$('.deco, .ball', hero);
      hero.addEventListener('pointermove', e => {
        const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
        frame(() => items.forEach((el, i) => { const k = (i % 3 + 1) * 10; el.style.translate = `${x * k}px ${y * k}px`; }));
      }, { passive: true });
    }
  }
})();

document.getElementById('year').textContent = new Date().getFullYear();

const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

document.querySelectorAll('.carousel').forEach(carousel => {
  const slides = [...carousel.querySelectorAll('.slides > .slide')];
  const dotsBox = carousel.querySelector('.dots');
  const delay = parseInt(carousel.dataset.autoplay || '0', 10);
  let i = 0, timer;

  const dots = slides.map((_, n) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', 'Go to slide ' + (n + 1));
    b.onclick = () => { go(n); restart(); };
    dotsBox.appendChild(b);
    return b;
  });

  function go(n) {
    slides[i].classList.remove('active');
    dots[i].classList.remove('on');
    slides[i].querySelector?.('video')?.pause();
    i = (n + slides.length) % slides.length;
    slides[i].classList.add('active');
    dots[i].classList.add('on');
  }
  function restart() {
    clearInterval(timer);
    if (delay) timer = setInterval(() => go(i + 1), delay);
  }

  carousel.querySelector('.prev').onclick = () => { go(i - 1); restart(); };
  carousel.querySelector('.next').onclick = () => { go(i + 1); restart(); };

  let startX = 0;
  carousel.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
  carousel.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) { go(i + (dx < 0 ? 1 : -1)); restart(); }
  });

  go(0);
  restart();
});

// Smooth eased scroll (up or down) + small bounce on the target section
const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function smoothScrollTo(y, done) {
  const startY = window.scrollY, dist = y - startY;
  const dur = Math.min(1200, 500 + Math.abs(dist) * .35);
  if (!dur) { window.scrollTo(0, y); done?.(); return; }
  const t0 = performance.now();
  (function step(now) {
    const p = Math.min((now - t0) / dur, 1);
    window.scrollTo(0, startY + dist * easeInOut(p));
    p < 1 ? requestAnimationFrame(step) : done?.();
  })(t0);
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const y = a.getAttribute('href') === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY - (nav.offsetHeight - 1);
    smoothScrollTo(Math.max(0, y), () => {
      target.classList.remove('section-bounce');
      void target.offsetWidth;
      target.classList.add('section-bounce');
      target.addEventListener('animationend', () => target.classList.remove('section-bounce'), { once: true });
    });
    history.pushState(null, '', a.getAttribute('href'));
  });
});

// Reels: autoplay muted, per-video sound toggle (one with sound at a time)
const reels = [...document.querySelectorAll('.reel')];
reels.forEach(reel => {
  const video = reel.querySelector('video'), btn = reel.querySelector('.sound');
  const setSound = on => {
    video.muted = !on;
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', on);
    btn.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
  };
  btn.addEventListener('click', () => {
    const on = video.muted;
    reels.forEach(r => r !== reel && r.querySelector('.sound').dispatchEvent(new CustomEvent('off')));
    setSound(on);
    video.play().catch(() => {});
  });
  btn.addEventListener('off', () => setSound(false));
});

const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

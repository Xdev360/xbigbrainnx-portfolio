// Site motion system. Material 3 style easing, nothing loops forever except tiny status dots.
// Everything is skipped for people who ask for reduced motion.
import Lenis from 'lenis';
import { play } from './sensory';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;
if (!reduce) root.classList.add('motion');

/* 1. Smooth scroll (Lenis). Anchor links scroll smoothly with the nav offset. */
let lenis: Lenis | null = null;
if (!reduce) {
  lenis = new Lenis({ duration: 1.1, easing: t => 1 - Math.pow(1 - t, 4), smoothWheel: true });
  const raf = (t: number) => { lenis!.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}
document.addEventListener('click', e => {
  const a = (e.target as HTMLElement).closest('a[href^="#"], a[href^="/#"]') as HTMLAnchorElement | null;
  if (!a) return;
  const hash = a.getAttribute('href')!.replace(/^\//, '');
  if (a.getAttribute('href')!.startsWith('/#') && location.pathname !== '/') return;
  const el = document.querySelector(hash);
  if (!el) return;
  e.preventDefault();
  lenis ? lenis.scrollTo(el as HTMLElement, { offset: -80 }) : el.scrollIntoView({ behavior: 'smooth' });
});

/* 2. Split headlines into masked lines: <h2 data-split>Line one<br>Line two</h2> */
document.querySelectorAll<HTMLElement>('[data-split]').forEach(el => {
  const parts = el.innerHTML.split(/<br\s*\/?>/i);
  el.innerHTML = parts.map((p, i) => `<span class="ln"><span class="ln-in" style="--i:${i}">${p}</span></span>`).join('');
});

/* 3. Reveal on scroll. data-reveal on any element; data-stagger on a parent staggers its [data-reveal] children. */
document.querySelectorAll<HTMLElement>('[data-stagger]').forEach(p => {
  const step = Number(p.dataset.stagger) || 70;
  p.querySelectorAll<HTMLElement>(':scope > [data-reveal], :scope [data-reveal-child]').forEach((c, i) => c.style.setProperty('--d', `${i * step}ms`));
});
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target as HTMLElement;
  el.classList.add('in');
  el.dispatchEvent(new CustomEvent('reveal'));
  io.unobserve(el);
}), { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
document.querySelectorAll('[data-reveal], [data-split], [data-draw], [data-count], [data-anim]').forEach(el => io.observe(el));

/* 4. Count up: <span data-count="70" data-suffix="%">70%</span> */
document.querySelectorAll<HTMLElement>('[data-count]').forEach(el => {
  const to = Number(el.dataset.count), suf = el.dataset.suffix ?? '', from = Number(el.dataset.from ?? 0);
  if (reduce) return;
  el.textContent = `${from}${suf}`;
  el.addEventListener('reveal', () => {
    const t0 = performance.now(), dur = 1200;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur), k = 1 - Math.pow(1 - p, 3);
      el.textContent = `${Math.round(from + (to - from) * k)}${suf}`;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, { once: true });
});

/* 5. Nav: hides on scroll down, returns on scroll up, gets a hairline once you leave the top. */
const nav = document.querySelector<HTMLElement>('.nav');
let lastY = scrollY;
const onScroll = () => {
  const y = scrollY;
  if (nav) {
    nav.classList.toggle('scrolled', y > 8);
    nav.classList.toggle('hide', y > 400 && y > lastY + 4 && !document.querySelector('.mmenu:not([hidden])'));
    if (y < lastY - 4) nav.classList.remove('hide');
  }
  lastY = y;
  parallax();
};
addEventListener('scroll', onScroll, { passive: true });

/* 6. Parallax: data-parallax="0.08" moves an element against the scroll, inside its section. */
const pEls = [...document.querySelectorAll<HTMLElement>('[data-parallax]')];
function parallax() {
  if (reduce) return;
  const vh = innerHeight;
  for (const el of pEls) {
    const r = el.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) continue;
    const k = Number(el.dataset.parallax);
    el.style.setProperty('--py', `${((r.top + r.height / 2) - vh / 2) * -k}px`);
  }
}
parallax();

/* 7. Magnetic buttons: data-magnetic pulls the element a few px toward the pointer. */
if (!reduce && matchMedia('(hover: hover)').matches) {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
  // Spotlight: cards with data-spot track the pointer for a soft border highlight.
  document.querySelectorAll<HTMLElement>('[data-spot]').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`); el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
  // Quiet hover tick (only when sound is on)
  document.querySelectorAll<HTMLElement>('[data-hover-sfx]').forEach(el => el.addEventListener('pointerenter', () => play('tick')));
}

/* 8. Type-in code: <pre data-type> reveals line by line when it enters the view. */
document.querySelectorAll<HTMLElement>('[data-type]').forEach(pre => {
  if (reduce) return;
  const lines = pre.textContent!.split('\n');
  pre.innerHTML = lines.map((l, i) => `<span class="tl" style="--i:${i}">${l.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!)) || ' '}</span>`).join('\n');
  pre.setAttribute('data-anim', '');
  io.observe(pre);
});

export { lenis };

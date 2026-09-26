const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

/* ------------------------------------------------------------------ */
/* Media behaviour that must work even with reduced motion             */
/* ------------------------------------------------------------------ */

function videos() {
  const vids = $$<HTMLVideoElement>('video[data-autoplay]');
  if (!vids.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      }
    },
    { rootMargin: '10% 0px', threshold: 0.2 },
  );
  vids.forEach((v) => io.observe(v));
}

function carousels() {
  for (const c of $$('[data-carousel]')) {
    const track = $('.carousel__track', c)!;
    const counter = $('[data-count]', c);
    const slides = $$('.carousel__slide', c);
    const count = slides.length;
    if (count < 2) continue;

    const index = () => Math.round(track.scrollLeft / track.clientWidth);
    const go = (i: number) => {
      const next = (i + count) % count;
      track.scrollTo({ left: next * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
    };
    const sync = () => {
      const i = index();
      if (counter) counter.textContent = `${i + 1} / ${count}`;
    };

    $('[data-prev]', c)?.addEventListener('click', () => go(index() - 1));
    $('[data-next]', c)?.addEventListener('click', () => go(index() + 1));
    c.addEventListener('keydown', (e) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'ArrowLeft') go(index() - 1);
      if (ke.key === 'ArrowRight') go(index() + 1);
    });
    if (!c.hasAttribute('tabindex')) c.setAttribute('tabindex', '0');

    let raf = 0;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    }, { passive: true });
  }
}

/* ------------------------------------------------------------------ */
/* Motion: CSS transitions keyed by .is-in (see global.css)             */
/* ------------------------------------------------------------------ */

function nav() {
  const links = $$<HTMLAnchorElement>('.nav__link[data-nav]');
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        links.find((a) => a.dataset.nav === e.target.id)?.classList.toggle('is-active', e.isIntersecting);
      }
    },
    { rootMargin: '-50% 0px -50% 0px' },
  );
  for (const a of links) {
    const el = document.getElementById(a.dataset.nav || '');
    if (el) io.observe(el);
  }
}

function reveals() {
  // Hero: one short staggered fade on load.
  $$('.hero [data-reveal]').forEach((el, i) => {
    el.style.transitionDelay = `${i * 40}ms`;
    requestAnimationFrame(() => el.classList.add('is-in'));
  });

  // Everything else fades in once as it enters.
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  $$('main [data-reveal], main [data-media]').filter((el) => !el.closest('.hero')).forEach((el) => io.observe(el));
}

function init() {
  videos();
  carousels();
  nav();
  if (reduce) $$('[data-reveal], [data-media]').forEach((el) => el.classList.add('is-in'));
  else reveals();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = () => window.matchMedia('(min-width: 900px)').matches;

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
    const dots = $$('[data-dot]', c);
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
      dots.forEach((d, k) => {
        d.classList.toggle('is-active', k === i);
        d.setAttribute('aria-selected', k === i ? 'true' : 'false');
      });
    };

    $('[data-prev]', c)?.addEventListener('click', () => go(index() - 1));
    $('[data-next]', c)?.addEventListener('click', () => go(index() + 1));
    dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
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
/* Motion                                                              */
/* ------------------------------------------------------------------ */

let lenis: Lenis | null = null;

function smoothScroll() {
  lenis = new Lenis({ lerp: 0.11, smoothWheel: true, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

function anchors() {
  for (const a of $$<HTMLAnchorElement>('a[href^="#"]')) {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href') || '';
      if (id.length < 2) return;
      const target = document.querySelector<HTMLElement>(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: id === '#top' ? 0 : -56, duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', id === '#top' ? location.pathname : id);
    });
  }
}

function hero() {
  const name = $('.hero__name');
  if (!name) return;
  const split = SplitText.create(name, { type: 'words,chars', charsClass: 'char', mask: 'chars' });
  gsap.set(name, { opacity: 1 });

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.fromTo(split.chars, { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.03 }, 0.1)
    .fromTo('.hero__tag', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.45)
    .fromTo('.toc__list > li', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.04 }, 0.6)
    .fromTo('.nav', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.3);
}

function progress() {
  gsap.to('.progress', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
  });
}

function nav() {
  ScrollTrigger.create({
    start: 'top -40px',
    end: 'max',
    toggleClass: { targets: '.nav', className: 'is-scrolled' },
  });

  const link = (id: string) => $(`.nav__link[data-nav="${id}"]`);
  for (const id of ['work', 'contact']) {
    const el = document.getElementById(id);
    const a = link(id);
    if (!el || !a) continue;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => a.classList.toggle('is-active', self.isActive),
    });
  }

  for (const item of $$('[data-index-for]')) {
    const el = document.getElementById(item.dataset.indexFor || '');
    if (!el) continue;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 55%',
      end: 'bottom 45%',
      onToggle: (self) => item.classList.toggle('is-active', self.isActive),
    });
  }
}

function reveals() {
  // Section headers and contact block: simple staggered rise.
  for (const group of ['.work__head', '.contact .container']) {
    const root = $(group);
    if (!root) continue;
    const items = $$('[data-reveal]', root);
    gsap.fromTo(items, { y: 28, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: root, start: 'top 82%', once: true },
    });
  }

  for (const project of $$('.project')) {
    const text = $$('[data-reveal]', project);
    const media = $('[data-media]', project);
    const inner = media ? $('[data-parallax]', media) : null;

    gsap.fromTo(text, { y: 34, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.07,
      scrollTrigger: { trigger: project, start: 'top 72%', once: true },
    });

    if (media) {
      const isPhone = media.classList.contains('media--phone');
      gsap.fromTo(media,
        isPhone ? { y: 60, opacity: 0, scale: 0.94 } : { clipPath: 'inset(14% 8% 14% 8% round 18px)', scale: 0.92, opacity: 0.4 },
        isPhone ? { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: media, start: 'top 82%', once: true } }
                : { clipPath: 'inset(0% 0% 0% 0% round 18px)', scale: 1, opacity: 1, duration: 1.3, ease: 'power3.out', scrollTrigger: { trigger: media, start: 'top 82%', once: true } },
      );
    }

    if (inner) {
      ScrollTrigger.matchMedia({
        '(min-width: 900px)': () => {
          gsap.fromTo(inner, { yPercent: -5 }, {
            yPercent: 5, ease: 'none',
            scrollTrigger: { trigger: project, start: 'top bottom', end: 'bottom top', scrub: true },
          });
        },
      });
    }
  }
}

/* ------------------------------------------------------------------ */

function init() {
  videos();
  carousels();

  if (reduce) {
    $$('[data-reveal]').forEach((el) => (el.style.opacity = '1'));
    anchors();
    nav();
    return;
  }

  smoothScroll();
  anchors();
  hero();
  progress();
  nav();
  reveals();

  // Fonts can shift layout after first paint; refresh trigger positions once they settle.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

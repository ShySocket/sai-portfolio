// The site's videos (src/components/v3/Frame.astro) and their Play/Pause buttons (PlayButton.astro). Without this
// script every poster still shows, the heroes keep their native controls and no button is drawn, so nothing
// depends on it.
//
// One model for both kinds. Each video has an intent: none, auto (the home loop, waiting to be armed), user-play or
// user-pause. The button's label follows the intent, never media events, so buffering cannot flicker it. The page
// itself only ever pauses for the system (out of view, tab hidden) and resumes what the intent still wants, so a
// visitor's Pause is never overridden; on home it also outlives a reload (sessionStorage).
//   loop   (home row 1): starts as auto unless motion is reduced, Save-Data is on or the visitor paused it earlier in
//          this session. It is armed after load and an idle moment, so no video byte competes with the first paint,
//          and plays while a quarter of it is in view.
//   player (case heroes): starts as none and plays only on the button or a click on the frame; native controls are
//          dropped while this script drives it, and come back if the video fails.
// The video fades in over its poster once its first frame is on screen (global.css, Motion). On any failure the
// player turns static: the poster, plus native controls on a hero, and no button.

type Intent = 'none' | 'auto' | 'user-play' | 'user-pause';

const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
const PAUSED = 'sb:loop-paused';

const remembered = () => {
  try {
    return sessionStorage.getItem(PAUSED) === '1';
  } catch {
    return false;
  }
};
const remember = (paused: boolean) => {
  try {
    if (paused) sessionStorage.setItem(PAUSED, '1');
    else sessionStorage.removeItem(PAUSED);
  } catch {
    // Storage blocked: the pause still holds for this page view.
  }
};

// After load and an idle moment, and only once a prerendered page is actually shown.
const settled = (run: () => void) => {
  const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(run, { timeout: 1000 }) : setTimeout(run, 300));
  const loaded = () => (document.readyState === 'complete' ? idle() : addEventListener('load', idle, { once: true }));
  if ((document as Document & { prerendering?: boolean }).prerendering) document.addEventListener('prerenderingchange', loaded, { once: true });
  else loaded();
};

function makeStatic(frame: HTMLElement, video: HTMLVideoElement) {
  frame.classList.remove('is-live');
  frame.classList.add('is-static');
  if (frame.dataset.video === 'player') video.controls = true;
}

function setup(video: HTMLVideoElement) {
  const frame = video.parentElement;
  const button = document.querySelector<HTMLButtonElement>(`button[data-toggle="${video.id}"]`);
  if (!frame?.dataset.video || !button) throw new Error(`video #${video.id}: frame or button missing`);
  const sources = [...video.querySelectorAll('source')];
  if (!sources.some((s) => video.canPlayType(s.type))) throw new Error(`video #${video.id}: no playable source`);

  const loop = frame.dataset.video === 'loop';
  const ac = new AbortController();
  const on = { signal: ac.signal };
  const autoAllowed = () => loop && !reduce.matches && !saveData && !remembered();

  let intent: Intent = autoAllowed() ? 'auto' : 'none';
  let armed = !loop;
  let inView = false;

  const wants = () => intent === 'user-play' || (intent === 'auto' && armed);
  const render = () => {
    button.dataset.state = wants() ? 'playing' : 'paused';
  };
  const start = () => {
    video.play().catch((err: DOMException) => {
      // Blocked by the browser: give the visitor the Play button back. AbortError means a pause() overtook it.
      if (err.name === 'NotAllowedError') {
        intent = 'none';
        render();
      }
    });
  };
  // The system's half: play what the intent wants while it is in view and the tab is visible, pause otherwise.
  const sync = () => {
    render();
    if (wants() && inView && !document.hidden) start();
    else if (!video.paused) video.pause();
  };
  // The visitor's half (button click, Space or Enter; a pointer click on a hero frame). A press plays at once,
  // without waiting for the observer.
  const toggle = () => {
    if (wants()) {
      intent = 'user-pause';
      if (loop) remember(true);
      video.pause();
    } else {
      intent = 'user-play';
      armed = true;
      if (loop) remember(false);
      start();
    }
    render();
  };
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[entries.length - 1];
      inView = entry.isIntersecting && entry.intersectionRatio >= 0.25;
      sync();
    },
    { threshold: [0, 0.25] },
  );
  const fail = () => {
    ac.abort();
    observer.disconnect();
    intent = 'none';
    video.pause();
    makeStatic(frame, video);
  };

  if (!loop) video.controls = false;
  button.addEventListener('click', toggle, on);
  if (!loop) frame.addEventListener('click', toggle, on);

  const live = () => frame.classList.add('is-live');
  video.addEventListener(
    'playing',
    () => {
      if (frame.classList.contains('is-live')) return;
      if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(live);
      else requestAnimationFrame(() => requestAnimationFrame(live));
    },
    on,
  );
  video.addEventListener(
    'ended',
    () => {
      intent = 'none';
      render();
    },
    on,
  );
  video.addEventListener('error', fail, on);
  sources[sources.length - 1].addEventListener('error', fail, on);

  observer.observe(video);
  document.addEventListener('visibilitychange', sync, on);
  addEventListener('pageshow', sync, on);
  reduce.addEventListener(
    'change',
    () => {
      if (reduce.matches && intent === 'auto') intent = 'none';
      else if (!reduce.matches && intent === 'none' && autoAllowed()) intent = 'auto';
      sync();
    },
    on,
  );
  if (loop)
    settled(() => {
      armed = true;
      sync();
    });
  render();
}

for (const video of document.querySelectorAll<HTMLVideoElement>('[data-video] > video')) {
  try {
    setup(video);
  } catch (err) {
    console.warn(err);
    if (video.parentElement) makeStatic(video.parentElement, video);
  }
}

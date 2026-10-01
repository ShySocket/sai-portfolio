// Cue behaviour: clip transports, cue addresses, copy email, landing cue. Everything here enhances markup
// that already works and is fully visible without it (no-JS clips keep native controls).
// Each clip and the copy key initialise in their own try/catch: a clip that fails falls back to its no-JS form
// (native controls over the still), and nothing else on the page is affected. A clip checks its markup before it
// touches anything, and every listener and observer it sets up hangs off one AbortSignal, so a clip that fails
// part-way is detached completely: its native controls then run with no script behind them.

const d = document;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
const live = d.getElementById('live');
const HALF_FRAME = 1 / 60;

const say = (msg: string) => {
  if (!live) return;
  live.textContent = '';
  requestAnimationFrame(() => (live.textContent = msg));
};

const fmt = (t: number) => {
  const tenths = Math.round(t * 10);
  const m = Math.floor(tenths / 600);
  const s = (tenths - m * 600) / 10;
  return `${m}:${s < 10 ? '0' : ''}${s.toFixed(1)}`;
};

const idle = (fn: () => void) =>
  'requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 300);

type State = 'ready' | 'loading' | 'playing' | 'paused' | 'error';
type Intent = 'none' | 'auto' | 'user-play' | 'user-pause';
const WORD: Record<State, string> = { ready: 'Ready', loading: 'Loading', playing: 'Playing', paused: 'Paused', error: 'Could not load' };

/** Tick elements by id, so an address (hash) can reach its clip. */
const cueById = new Map<string, () => void>();

type Player = { arm(): void; still(): void };

function clip(fig: HTMLElement, signal: AbortSignal): Player {
  const v = fig.querySelector('video');
  const stillImg = fig.querySelector<HTMLImageElement>('.well__still');
  const well = fig.querySelector<HTMLElement>('[data-well]');
  const tr = fig.querySelector<HTMLElement>('[data-transport]');
  const key = tr?.querySelector<HTMLButtonElement>('[data-play]');
  const word = tr?.querySelector('[data-word]');
  const now = tr?.querySelector('[data-now]');
  const fill = tr?.querySelector<HTMLElement>('[data-fill]');
  const lane = tr?.querySelector<HTMLElement>('[data-lane]');
  if (!v || !stillImg || !well || !tr || !key || !word || !now || !fill || !lane) throw new Error(`${fig.dataset.title} clip markup is incomplete`);
  const on = { signal };
  const frameLabel = stillImg.alt;
  const ticks = [...lane.querySelectorAll<HTMLAnchorElement>('.tick')];
  const times = ticks.map((a) => Number(a.dataset.t));
  const [prev, next] = [...tr.querySelectorAll<HTMLButtonElement>('[data-cue]')];
  const title = fig.dataset.title!;
  const dur = Number(fig.dataset.dur);
  const t0 = Number(fig.dataset.t);
  const auto = fig.hasAttribute('data-auto');

  let state: State = 'ready';
  let intent: Intent = auto && !reduceMotion.matches && !saveData ? 'auto' : 'none';
  let armed = false; // the first-viewport loop waits for load + idle
  let visible = false;
  let loaded = false;
  let cur = t0;
  let pressed: HTMLElement | null = null;
  let at = -1; // the cue on screen: arrow keys step from it, even when it is a mark that cannot hold focus
  const observers: { disconnect(): void }[] = [];
  signal.addEventListener('abort', () => {
    observers.forEach((o) => o.disconnect());
    ticks.forEach((a) => cueById.delete(a.id));
  });

  v.removeAttribute('controls');

  const set = (s: State) => {
    state = s;
    tr.dataset.state = s;
    word.textContent = WORD[s];
    const busy = s === 'playing' || s === 'loading';
    key.setAttribute('aria-label', `${busy ? 'Pause' : 'Play'} ${title} clip`);
    if (s === 'error') {
      key.setAttribute('aria-disabled', 'true');
      disable(prev, true);
      disable(next, true);
      tr.querySelector<HTMLElement>('.fallback')?.removeAttribute('hidden');
    }
  };

  const disable = (b: HTMLButtonElement | undefined, off: boolean) => {
    if (b && b.getAttribute('aria-disabled') !== String(off)) b.setAttribute('aria-disabled', String(off));
  };
  const nextIndex = (dir: number) => {
    if (dir > 0) return times.findIndex((t) => t > cur + 0.05);
    for (let i = times.length - 1; i >= 0; i--) if (times[i] < cur - 0.05) return i;
    return -1;
  };
  const paint = (t: number) => {
    cur = t;
    now.textContent = fmt(t);
    fill.style.transform = `scaleX(${Math.min(Math.max(t / dur, 0), 1)})`;
    if (state === 'error') return;
    disable(prev, nextIndex(-1) < 0);
    disable(next, nextIndex(1) < 0);
  };

  // The video is out of paint until it has a frame; then it replaces the still in the same place, and takes over
  // the still's name (the still is hidden from then on, so the label is still announced once).
  const show = () => {
    if (fig.classList.contains('is-live')) return;
    v.setAttribute('aria-label', frameLabel);
    fig.classList.add('is-live');
    if (state === 'playing') run();
  };
  const frame = (fn: (t: number) => void) =>
    'requestVideoFrameCallback' in v
      ? v.requestVideoFrameCallback((_, m) => fn(m.mediaTime))
      : requestAnimationFrame(() => fn(v.currentTime));
  let gen = 0; // one progress loop at a time: a newer run() retires the older callback chain
  const run = () => {
    const g = ++gen;
    const step = () =>
      frame((t) => {
        if (g !== gen || state !== 'playing') return;
        paint(t);
        step();
      });
    step();
  };

  const load = () => {
    if (loaded) return;
    loaded = true;
    v.preload = 'auto';
    if (v.readyState === 0) v.load();
  };
  const seek = (t: number) => {
    paint(t);
    const go = () => (v.currentTime = t + HALF_FRAME);
    if (v.readyState >= 1) go();
    else {
      load();
      v.addEventListener('loadedmetadata', go, { once: true, signal });
    }
  };
  const play = () => {
    if (state === 'error') return;
    load();
    if (state === 'ready' || v.readyState < 1) seek(cur); // playback starts at the frame on screen
    if (v.readyState < 3) set('loading');
    v.play().catch((e: DOMException) => {
      if (e.name === 'NotAllowedError') set(state === 'loading' && !fig.classList.contains('is-live') ? 'ready' : 'paused');
      else if (e.name !== 'AbortError') set('error');
    });
  };

  const want = () => intent === 'user-play' || (intent === 'auto' && armed);
  const sync = () => {
    const ok = visible && !d.hidden;
    if (!ok && (state === 'playing' || state === 'loading')) v.pause();
    else if (ok && want() && state !== 'playing' && state !== 'loading') play();
  };

  const press = (a: HTMLElement | null) => {
    pressed?.classList.remove('is-pressed');
    pressed = a;
    a?.classList.add('is-pressed');
  };
  const rove = (i: number, focus: boolean) => {
    if (ticks[i].classList.contains('is-mark')) return; // a mark keeps its id but never takes focus
    ticks.forEach((a, j) => (a.tabIndex = j === i ? 0 : -1));
    if (focus) ticks[i].focus();
  };
  /** Seek to cue i and hold it: paused, timecode at the cue, the tick lit, the address in the URL. */
  const cue = (i: number, opts: { focus?: boolean; address?: boolean } = {}) => {
    const a = ticks[i];
    if (!a || state === 'error') return; // a clip that could not load holds its still and offers the link instead
    at = i;
    intent = 'user-pause';
    v.pause();
    seek(times[i]);
    set('paused');
    press(a);
    rove(i, !!opts.focus);
    if (opts.address !== false) history.replaceState(history.state, '', `#${a.id}`);
  };

  // Media events
  v.addEventListener('playing', () => {
    set('playing');
    press(null);
    requestAnimationFrame(show);
    run();
  }, on);
  v.addEventListener('waiting', () => state === 'playing' && set('loading'), on);
  v.addEventListener('pause', () => state !== 'error' && set('paused'), on);
  v.addEventListener('seeked', () => v.readyState >= 2 && requestAnimationFrame(show), on);
  v.addEventListener('error', () => set('error'), on);

  // Controls
  key.addEventListener('click', () => {
    if (state === 'error') return;
    if (state === 'playing' || state === 'loading') {
      intent = 'user-pause';
      v.pause();
      set('paused');
    } else {
      intent = 'user-play';
      press(null);
      play();
    }
  }, on);
  well.addEventListener('click', () => !fig.hasAttribute('data-static') && key.click(), on);
  for (const b of [prev, next]) {
    b?.addEventListener('click', () => {
      if (b.getAttribute('aria-disabled') === 'true') return;
      cue(nextIndex(b === prev ? -1 : 1));
    }, on);
  }
  ticks.forEach((a, i) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      cue(i);
    }, on);
    cueById.set(a.id, () => cue(i, { address: false }));
  });
  lane.addEventListener('keydown', (e) => {
    const f = ticks.indexOf(d.activeElement as HTMLAnchorElement);
    if (f < 0) return;
    const i = ticks[at]?.classList.contains('is-mark') ? at : f;
    const j = ({ ArrowLeft: i - 1, ArrowRight: i + 1, Home: 0, End: ticks.length - 1 } as Record<string, number>)[e.key];
    if (j === undefined) return;
    e.preventDefault();
    cue(Math.min(Math.max(j, 0), ticks.length - 1), { focus: true });
  }, on);

  // Targets: only ticks whose centres are >= 24px apart stay focusable and pressable; the rest become marks
  // that keep their ids (cue keys and arrow keys still reach them).
  const guard = () => {
    const w = lane.clientWidth;
    let last = -Infinity;
    for (const a of ticks) {
      const x = (Number(a.dataset.t) / dur) * w;
      const mark = x - last < 24;
      a.classList.toggle('is-mark', mark);
      a.toggleAttribute('aria-hidden', mark);
      if (mark) a.tabIndex = -1;
      else last = x;
    }
    if (!ticks.some((a) => a.tabIndex === 0)) ticks.find((a) => !a.classList.contains('is-mark'))!.tabIndex = 0;
  };
  const ro = new ResizeObserver(guard);
  observers.push(ro);
  ro.observe(lane);
  tooltips(lane, ticks, signal);

  const io = new IntersectionObserver(
    (es) => {
      visible = es[es.length - 1].intersectionRatio >= 0.2;
      sync();
    },
    { threshold: [0, 0.2] },
  );
  observers.push(io);
  io.observe(fig);
  d.addEventListener('visibilitychange', sync, on);

  set('ready');
  paint(t0);
  return {
    arm() {
      armed = true;
      if (intent === 'auto') sync();
    },
    /** Reduced motion switched on mid-visit: a clip that started on its own stops; one the user started plays on. */
    still() {
      if (intent !== 'auto') return;
      intent = 'none';
      if (state === 'playing' || state === 'loading') v.pause();
    },
  };
}

/** A clip whose set-up failed goes back to its no-JS form: native controls over the still, no transport. */
function unenhance(fig: HTMLElement) {
  const v = fig.querySelector('video');
  if (v) {
    v.controls = true;
    v.removeAttribute('aria-label'); // the still beneath keeps the name
  }
  fig.classList.remove('is-live');
  fig.setAttribute('data-static', '');
}

/** Tooltips (WCAG 1.4.13): 200ms hover delay, instant for 600ms after one closes, immediate on keyboard
 *  focus, hoverable (the tip is inside the link), persistent while hovered or focused, Esc dismisses. */
function tooltips(lane: HTMLElement, ticks: HTMLElement[], signal: AbortSignal) {
  const on = { signal };
  let timer = 0;
  let closed = 0;
  const open = (a: HTMLElement) => {
    for (const b of ticks) if (b !== a) b.removeAttribute('data-tip');
    a.setAttribute('data-tip', '');
  };
  const close = (a: HTMLElement) => {
    clearTimeout(timer);
    if (!a.hasAttribute('data-tip')) return;
    a.removeAttribute('data-tip');
    closed = Date.now();
  };
  for (const a of ticks) {
    a.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      const instant = Date.now() - closed < 600;
      lane.toggleAttribute('data-instant', instant);
      clearTimeout(timer);
      timer = window.setTimeout(() => open(a), instant ? 0 : 200);
    }, on);
    a.addEventListener('pointerleave', () => !a.matches(':focus-visible') && close(a), on);
    a.addEventListener('focus', () => {
      if (!a.matches(':focus-visible')) return;
      lane.toggleAttribute('data-instant', true);
      open(a);
    }, on);
    a.addEventListener('blur', () => close(a), on);
  }
  d.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') ticks.forEach(close);
  }, on);
}

/** Copy email: the mailto link becomes a real button; labels crossfade in one grid cell (no resize). */
function copyEmail() {
  for (const a of d.querySelectorAll<HTMLAnchorElement>('a[data-copy]')) {
    const email = a.dataset.copy!;
    const b = d.createElement('button');
    b.type = 'button';
    b.className = a.className;
    b.setAttribute('aria-label', 'Copy email address');
    b.append(...a.childNodes);
    a.replaceWith(b);
    let timer = 0;
    b.addEventListener('click', async () => {
      clearTimeout(timer);
      try {
        await navigator.clipboard.writeText(email);
        b.dataset.state = 'done';
        say('Email copied');
      } catch {
        b.dataset.state = 'fail';
        say(`Copy failed. The address is ${email}`);
        const text = d.querySelector('[data-email]');
        if (text) getSelection()?.selectAllChildren(text);
      }
      timer = window.setTimeout(() => delete b.dataset.state, 1800);
    });
  }
}

/** Landing cue: the landed title's underline fades from rose over 600ms, restarted on a repeat jump. */
function land(el: Element | null) {
  if (!el?.classList.contains('entry')) return;
  el.classList.remove('is-landing');
  void (el as HTMLElement).offsetWidth;
  el.classList.add('is-landing');
}

function route() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;
  const hold = cueById.get(id);
  if (hold) hold();
  else land(d.getElementById(id));
}

function init() {
  const ctl: Player[] = [];
  for (const fig of d.querySelectorAll<HTMLElement>('[data-clip]')) {
    const setup = new AbortController();
    try {
      ctl.push(clip(fig, setup.signal));
    } catch (e) {
      setup.abort(); // detach whatever the clip had wired up before it failed
      unenhance(fig);
      console.warn('Clip controls unavailable', e);
    }
  }
  try {
    copyEmail();
  } catch (e) {
    console.warn('Copy email unavailable', e);
  }
  reduceMotion.addEventListener('change', () => reduceMotion.matches && ctl.forEach((c) => c.still()));

  d.addEventListener('click', (e) => {
    const a = (e.target as Element).closest?.('a[href^="#"]') as HTMLAnchorElement | null;
    if (a && a.hash && a.hash === location.hash && !a.classList.contains('tick')) route(); // no hashchange on a repeat jump
  });
  addEventListener('hashchange', route);
  const deepCue = cueById.has(decodeURIComponent(location.hash.slice(1)));
  route(); // a deep link to a cue fetches and holds that frame now; the loop does not autoplay over it

  const arm = () => idle(() => !deepCue && ctl.forEach((c) => c.arm()));
  if (d.readyState === 'complete') arm();
  else addEventListener('load', arm, { once: true });
}

init();

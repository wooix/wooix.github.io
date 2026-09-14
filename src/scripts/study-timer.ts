import { createCountdown, countdownRemaining, settleCountdown, startCountdown, pauseCountdown, restartCountdown, formatCountdown, confirmsDownwardScroll, isDocumentScrollbarPress, type ScrollIntent } from '../lib/study-timer';

const timerElement = document.querySelector<HTMLElement>('#study-timer');
if (timerElement) {
  const timer = timerElement;
  let state = createCountdown(Number(timer.dataset.readingMinutes));
  const clock = timer.querySelector<HTMLOutputElement>('[data-study-clock]')!;
  const pauseButton = timer.querySelector<HTMLButtonElement>('[data-study-pause]')!;
  const pauseSymbol = timer.querySelector<HTMLElement>('[data-study-pause-symbol]')!;
  const announcement = timer.querySelector<HTMLElement>('[data-study-announcement]')!;
  const effect = document.querySelector<HTMLElement>('[data-study-start-effect]');
  let frame = 0; let intent: ScrollIntent | null = null;
  let touchStart: { x: number; y: number } | null = null;
  let effectConsumed = false;
  let scrollbarPointer: number | null = null;

  function announce(message: string) { announcement.textContent = message; }
  function stopFrame() { if (frame) cancelAnimationFrame(frame); frame = 0; }
  function render() {
    const before = state.phase;
    state = settleCountdown(state, Date.now());
    clock.textContent = formatCountdown(countdownRemaining(state, Date.now()));
    timer.dataset.state = state.phase;
    pauseButton.disabled = state.phase === 'complete';
    const paused = state.phase === 'paused';
    pauseButton.setAttribute('aria-label', paused ? '학습 타이머 계속하기' : '학습 타이머 일시정지');
    pauseButton.title = paused ? '계속하기' : '일시정지';
    pauseSymbol.textContent = paused ? '▶' : 'Ⅱ';
    if (before !== 'complete' && state.phase === 'complete') announce('학습 시간이 완료되었습니다.');
  }
  function tick() {
    frame = 0; render();
    if (state.phase === 'running' && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function refresh() { stopFrame(); render(); if (state.phase === 'running' && !document.hidden) frame = requestAnimationFrame(tick); }
  function startFromScroll() {
    if (state.phase !== 'ready') return;
    state = startCountdown(state, Date.now()); timer.hidden = false; intent = null;
    announce(`${timer.dataset.readingMinutes}분 학습 타이머를 시작했습니다.`);
    if (!effectConsumed) {
      effectConsumed = true;
      if (effect && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        effect.hidden = false; effect.classList.add('is-playing');
        effect.addEventListener('animationend', () => { effect.hidden = true; }, { once: true });
      }
    }
    refresh();
  }
  pauseButton.addEventListener('click', () => {
    if (state.phase === 'running') { state = pauseCountdown(state, Date.now()); announce(state.phase === 'complete' ? '학습 시간이 완료되었습니다.' : '학습 타이머를 일시정지했습니다.'); }
    else if (state.phase === 'paused') { state = startCountdown(state, Date.now()); announce('학습 타이머를 계속합니다.'); }
    refresh();
  });
  timer.querySelector('[data-study-restart]')!.addEventListener('click', () => {
    state = restartCountdown(state, Date.now()); announce(`${timer.dataset.readingMinutes}분부터 다시 시작했습니다.`); refresh();
  });

  // Scroll events alone cannot distinguish restored/anchor/programmatic scrolling.
  // Arm only after trusted directional input on the document, then require actual downward movement.
  function excluded(target: EventTarget | null) {
    if (document.querySelector('dialog[open]')) return true;
    const element = target instanceof Element ? target : null;
    if (!element || element.closest('input,textarea,select,button,[contenteditable]:not([contenteditable="false"]),dialog,[role="dialog"],.site-header,.desktop-sidebar,.desktop-toc,#graph-panel,.study-timer')) return true;
    let current: Element | null = element;
    while (current && current !== document.body && current !== document.documentElement) {
      const styles = getComputedStyle(current);
      if (/(auto|scroll)/.test(styles.overflowY) && current.scrollHeight > current.clientHeight + 1) return true;
      current = current.parentElement;
    }
    return false;
  }
  function arm(event: Event, allowed: boolean) {
    if (state.phase !== 'ready') return;
    if (!event.isTrusted || !allowed || excluded(event.target)) { intent = null; return; }
    intent = { scrollY: window.scrollY, expiresAt: performance.now() + 500 };
  }
  document.addEventListener('wheel', (event) => arm(event, event.deltaY > 0 && Math.abs(event.deltaY) >= Math.abs(event.deltaX)), { passive: true });
  document.addEventListener('keydown', (event) => {
    const down = ['PageDown', 'ArrowDown', 'End'].includes(event.key) || event.key === ' ' && !event.shiftKey;
    arm(event, down && !event.ctrlKey && !event.metaKey && !event.altKey);
  });
  document.addEventListener('touchstart', (event) => {
    intent = null;
    const touch = event.touches[0];
    touchStart = event.isTrusted && event.touches.length === 1 && !excluded(event.target) ? { x: touch.clientX, y: touch.clientY } : null;
  }, { passive: true });
  document.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    if (!touchStart || event.touches.length !== 1) { intent = null; return; }
    const up = touchStart.y - touch.clientY; const horizontal = Math.abs(touch.clientX - touchStart.x);
    arm(event, up > 8 && up > horizontal);
  }, { passive: true });
  document.addEventListener('touchcancel', () => { touchStart = null; intent = null; }, { passive: true });
  document.addEventListener('touchend', () => { touchStart = null; }, { passive: true });
  window.addEventListener('pointerdown', (event) => {
    if (state.phase !== 'ready' || !event.isTrusted || event.pointerType !== 'mouse' || event.button !== 0 || document.querySelector('dialog[open]')) return;
    const root = document.documentElement;
    const eligible = isDocumentScrollbarPress({ x: event.clientX, y: event.clientY, viewportWidth: window.innerWidth, viewportHeight: root.clientHeight, contentWidth: root.clientWidth, leftGutter: root.clientLeft,
      rootTarget: event.target === document || event.target === root || event.target === document.body,
      verticalOverflow: (document.scrollingElement?.scrollHeight || 0) > root.clientHeight + 1 });
    if (!eligible) return;
    scrollbarPointer = event.pointerId;
    intent = { scrollY: window.scrollY, expiresAt: performance.now() + 30_000 };
  }, { capture: true, passive: true });
  window.addEventListener('pointermove', (event) => {
    if (scrollbarPointer !== event.pointerId || !event.isTrusted) return;
    if (!(event.buttons & 1)) { scrollbarPointer = null; intent = null; }
    else if (intent) intent.expiresAt = performance.now() + 30_000;
  }, { passive: true });
  const releaseScrollbar = () => { if (scrollbarPointer !== null) { scrollbarPointer = null; intent = null; } };
  window.addEventListener('pointerup', releaseScrollbar, { capture: true, passive: true });
  window.addEventListener('pointercancel', releaseScrollbar, { capture: true, passive: true });
  window.addEventListener('blur', releaseScrollbar);
  window.addEventListener('scroll', () => {
    if (state.phase !== 'ready') return;
    if (confirmsDownwardScroll(intent, window.scrollY, performance.now())) startFromScroll();
    else if (intent && performance.now() > intent.expiresAt) intent = null;
  }, { passive: true });
  document.addEventListener('click', () => { intent = null; }, { capture: true });
  window.addEventListener('hashchange', () => { intent = null; });
  window.addEventListener('pagehide', () => { intent = null; stopFrame(); });
  window.addEventListener('pageshow', () => { intent = null; refresh(); });
  document.addEventListener('visibilitychange', () => { intent = null; if (document.hidden) stopFrame(); else refresh(); });
}

import { createCountdown, countdownRemaining, settleCountdown, startCountdown, pauseCountdown, restartCountdown, formatCountdown, shouldStartOnScroll } from '../lib/study-timer';

const timerElement = document.querySelector<HTMLElement>('#study-timer');
if (timerElement) {
  const timer = timerElement;
  let state = createCountdown(Number(timer.dataset.readingMinutes));
  const clock = timer.querySelector<HTMLOutputElement>('[data-study-clock]')!;
  const pauseButton = timer.querySelector<HTMLButtonElement>('[data-study-pause]')!;
  const pauseSymbol = timer.querySelector<HTMLElement>('[data-study-pause-symbol]')!;
  const announcement = timer.querySelector<HTMLElement>('[data-study-announcement]')!;
  const effect = document.querySelector<HTMLElement>('[data-study-start-effect]');
  let frame = 0;
  let previousScrollY = window.scrollY;
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const restoringOnLoad = !!location.hash || navigation?.type === 'back_forward';
  let restoreUntil = restoringOnLoad ? performance.now() + 500 : 0;
  let cueAnimations: Animation[] = [];
  let cueTimeout = 0;

  function cancelCue() {
    cueAnimations.forEach((animation) => { animation.onfinish = null; animation.cancel(); });
    cueAnimations = [];
    clearTimeout(cueTimeout);
    cueTimeout = 0;
    timer.classList.remove('is-cue-static');
    if (effect) effect.hidden = true;
  }
  function playCue() {
    cancelCue();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timer.classList.add('is-cue-static');
      cueTimeout = window.setTimeout(cancelCue, 900);
      return;
    }
    if (effect) {
      effect.hidden = false;
      const pulse = effect.animate([{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }], { duration: 450, easing: 'ease-out' });
      pulse.onfinish = () => { effect.hidden = true; };
      cueAnimations.push(pulse);
    }
    const accent = getComputedStyle(timer).getPropertyValue('--accent').trim();
    cueAnimations.push(timer.animate([
      { boxShadow: `0 0 0 0 ${accent}, 0 0 0 transparent` },
      { boxShadow: `0 0 0 3px ${accent}, 0 0 22px ${accent}`, offset: 0.25 },
      { boxShadow: `0 0 0 8px transparent, 0 0 0 transparent` },
    ], { duration: 1_000, delay: 300, easing: 'ease-out' }));
    cueTimeout = window.setTimeout(cancelCue, 1_350);
  }

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
    state = startCountdown(state, Date.now()); timer.hidden = false;
    announce(`${timer.dataset.readingMinutes}분 학습 타이머를 시작했습니다.`);
    playCue();
    refresh();
  }
  pauseButton.addEventListener('click', () => {
    if (state.phase === 'running') { cancelCue(); state = pauseCountdown(state, Date.now()); announce(state.phase === 'complete' ? '학습 시간이 완료되었습니다.' : '학습 타이머를 일시정지했습니다.'); }
    else if (state.phase === 'paused') { state = startCountdown(state, Date.now()); announce('학습 타이머를 계속합니다.'); playCue(); }
    refresh();
  });
  timer.querySelector('[data-study-restart]')!.addEventListener('click', () => {
    state = restartCountdown(state, Date.now()); announce(`${timer.dataset.readingMinutes}분부터 다시 시작했습니다.`); playCue(); refresh();
  });

  // Ordinary pages have no start delay. Only hash/history restoration resets the baseline briefly.
  function resetRestoredPosition() {
    previousScrollY = window.scrollY;
    restoreUntil = performance.now() + 500;
  }
  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    const shouldStart = shouldStartOnScroll(state.phase, previousScrollY, currentY, performance.now() < restoreUntil);
    previousScrollY = currentY;
    if (shouldStart) startFromScroll();
  }, { passive: true });
  document.addEventListener('click', (event) => {
    if (state.phase !== 'ready' || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!anchor || anchor.target && anchor.target !== '_self' || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href, location.href);
    if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search && url.hash) resetRestoredPosition();
  }, { capture: true });
  window.addEventListener('hashchange', resetRestoredPosition);
  window.addEventListener('popstate', resetRestoredPosition);
  window.addEventListener('load', () => { if (restoringOnLoad) resetRestoredPosition(); });
  window.addEventListener('pagehide', () => { stopFrame(); cancelCue(); });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) resetRestoredPosition();
    refresh();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stopFrame(); cancelCue(); }
    else refresh();
  });
}

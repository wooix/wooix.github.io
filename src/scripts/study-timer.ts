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
  let focusTick = 0;
  let focused = false;
  const focusBar = document.querySelector<HTMLElement>('#focus-bar')!;
  const focusClock = document.querySelector<HTMLOutputElement>('#focus-clock')!;
  const focusPause = document.querySelector<HTMLButtonElement>('#focus-pause')!;
  const focusStatus = document.querySelector<HTMLElement>('#focus-status')!;
  const focusProgress = document.querySelector<HTMLProgressElement>('#focus-progress')!;
  const focusForm = document.querySelector<HTMLFormElement>('#focus-form')!;
  function changeLayout(on: boolean) {
    const anchor = [...document.querySelectorAll<HTMLElement>('.prose > *, .article-header')].find(el => el.getBoundingClientRect().bottom > 100);
    const top = anchor?.getBoundingClientRect().top;
    document.documentElement.classList.toggle('focus-mode', on);
    focusBar.hidden = !on;
    if (anchor && top !== undefined) window.scrollBy({top:anchor.getBoundingClientRect().top-top,behavior:'instant'});
  }
  function exitFocus() {
    if (!focused) return;
    state = pauseCountdown(state, Date.now()); focused = false; changeLayout(false); timer.hidden = false; refresh();
    document.querySelector<HTMLButtonElement>('.focus-entry')?.focus({preventScroll:true});
  }
  focusForm.addEventListener('submit', event => {
    event.preventDefault(); if (!focusForm.reportValidity()) return;
    const values = new FormData(focusForm);
    state = startCountdown(createCountdown(Number(values.get('minutes'))), Date.now());
    cancelCue(); focused = true;
    const goal = document.querySelector<HTMLElement>('#focus-goal')!;
    goal.textContent = String(values.get('goal') || '핵심 내용을 이해하기'); goal.title = goal.textContent;
    document.querySelector<HTMLDialogElement>('#focus-dialog')!.close();
    changeLayout(true); focusStatus.textContent = ''; refresh();
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('#focus-exit')!.focus({preventScroll:true}));
  });
  document.querySelector('#focus-exit')!.addEventListener('click', exitFocus);
  document.querySelector('#focus-show-time')!.addEventListener('click', event => {
    focusClock.hidden = !focusClock.hidden;
    const button = event.currentTarget as HTMLButtonElement;
    button.textContent = focusClock.hidden ? '시간 보기' : '시간 숨기기'; button.setAttribute('aria-expanded', String(!focusClock.hidden));
  });
  focusPause.addEventListener('click', () => pauseButton.click());
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && focused && !(event.target instanceof HTMLTextAreaElement) && !document.querySelector('dialog[open]') && document.querySelector<HTMLElement>('#annotation-menu')?.hidden !== false) exitFocus();
  });
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
    if (focused) return;
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
  function stopFrame() { if (frame) cancelAnimationFrame(frame); frame = 0; clearTimeout(focusTick); }
  function render() {
    const before = state.phase;
    state = settleCountdown(state, Date.now());
    clock.textContent = formatCountdown(countdownRemaining(state, Date.now()));
    timer.dataset.state = state.phase;
    if (focused) {
      const remaining = countdownRemaining(state, Date.now());
      const seconds = Math.ceil(remaining / 1000);
      focusClock.textContent = `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}`;
      focusProgress.value = 1 - remaining / state.durationMs;
      focusPause.disabled = state.phase === 'complete';
      focusPause.textContent = state.phase === 'paused' ? '계속 읽기' : '일시정지';
      focusStatus.textContent = state.phase === 'complete' ? '읽기 시간 완료' : state.phase === 'paused' ? '일시정지 중' : '';
    }
    pauseButton.disabled = state.phase === 'complete';
    const paused = state.phase === 'paused';
    pauseButton.setAttribute('aria-label', paused ? '학습 타이머 계속하기' : '학습 타이머 일시정지');
    pauseButton.title = paused ? '계속하기' : '일시정지';
    pauseSymbol.textContent = paused ? '▶' : 'Ⅱ';
    if (before !== 'complete' && state.phase === 'complete') announce('학습 시간이 완료되었습니다.');
  }
  function tick() {
    frame = 0; render();
    if (state.phase === 'running' && !document.hidden) { if (focused) focusTick = window.setTimeout(tick, 1000); else frame = requestAnimationFrame(tick); }
  }
  function refresh() { stopFrame(); render(); if (state.phase === 'running' && !document.hidden) { if (focused) focusTick = window.setTimeout(tick, 1000); else frame = requestAnimationFrame(tick); } }
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
    state = restartCountdown(state, Date.now()); announce(`${state.durationMs / 60000}분부터 다시 시작했습니다.`); playCue(); refresh();
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

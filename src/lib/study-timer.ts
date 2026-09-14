export type CountdownPhase = 'ready' | 'running' | 'paused' | 'complete';
export interface Countdown { phase: CountdownPhase; durationMs: number; remainingMs: number; deadline: number | null; }

export function createCountdown(minutes: number): Countdown {
  if (!Number.isFinite(minutes) || minutes <= 0) throw new Error('Study timer needs the article’s positive readingTime in minutes.');
  const durationMs = Math.round(minutes * 60_000);
  return { phase: 'ready', durationMs, remainingMs: durationMs, deadline: null };
}
/** Epoch milliseconds include time spent in hidden tabs and device sleep. */
export function countdownRemaining(state: Countdown, now: number): number {
  return state.phase === 'running' && state.deadline !== null
    ? Math.max(0, Math.min(state.remainingMs, state.deadline - now))
    : state.remainingMs;
}
export function settleCountdown(state: Countdown, now: number): Countdown {
  return state.phase === 'running' && countdownRemaining(state, now) === 0
    ? { ...state, phase: 'complete', remainingMs: 0, deadline: null } : state;
}
export function startCountdown(state: Countdown, now: number): Countdown {
  return state.phase === 'ready' || state.phase === 'paused'
    ? { ...state, phase: 'running', deadline: now + state.remainingMs } : state;
}
export function pauseCountdown(state: Countdown, now: number): Countdown {
  const settled = settleCountdown(state, now);
  return settled.phase === 'running'
    ? { ...settled, phase: 'paused', remainingMs: countdownRemaining(settled, now), deadline: null } : settled;
}
export function restartCountdown(state: Countdown, now: number): Countdown {
  return { ...state, phase: 'running', remainingMs: state.durationMs, deadline: now + state.durationMs };
}
export function formatCountdown(milliseconds: number): string {
  const value = Math.max(0, Math.floor(Number.isFinite(milliseconds) ? milliseconds : 0));
  const hours = Math.floor(value / 3_600_000);
  const minutes = Math.floor(value / 60_000) % 60;
  const seconds = Math.floor(value / 1_000) % 60;
  return `[${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(value % 1_000).padStart(3, '0')}]`;
}

export interface ScrollIntent { scrollY: number; expiresAt: number; }
export function confirmsDownwardScroll(intent: ScrollIntent | null, scrollY: number, monotonicNow: number): boolean {
  return !!intent && monotonicNow <= intent.expiresAt && scrollY > intent.scrollY + 1;
}

export function isDocumentScrollbarPress(input: { x: number; y: number; viewportWidth: number; viewportHeight: number; contentWidth: number; leftGutter: number; rootTarget: boolean; verticalOverflow: boolean }): boolean {
  if (!input.rootTarget || !input.verticalOverflow || input.y < 0 || input.y >= input.viewportHeight || input.x < 0 || input.x > input.viewportWidth) return false;
  const gutter = input.viewportWidth - input.contentWidth;
  if (gutter > 0) return input.leftGutter > 0 ? input.x < input.leftGutter : input.x >= input.contentWidth;
  // Overlay scrollbars occupy no layout gutter; only the document-root hit area at the edge is eligible.
  return input.x >= input.viewportWidth - 12;
}

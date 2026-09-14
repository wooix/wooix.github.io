import test from 'node:test';
import assert from 'node:assert/strict';
import { createCountdown, countdownRemaining, settleCountdown, startCountdown, pauseCountdown, restartCountdown, formatCountdown, confirmsDownwardScroll, isDocumentScrollbarPress } from '../src/lib/study-timer.ts';

test('the article readingTime is used without recalculating its duration', () => {
  const state = createCountdown(25);
  assert.equal(state.durationMs, 1_500_000);
  assert.equal(state.phase, 'ready');
  assert.equal(formatCountdown(state.remainingMs), '[00:25:00:000]');
  assert.equal(formatCountdown(3_661_007), '[01:01:01:007]');
  assert.equal(formatCountdown(-1), '[00:00:00:000]');
  assert.throws(() => createCountdown(0));
  assert.throws(() => createCountdown(NaN));
});

test('running time is derived from a wall-clock deadline, independent of render frequency', () => {
  const ready = createCountdown(1);
  const running = startCountdown(ready, 1_000);
  assert.equal(running.deadline, 61_000);
  assert.equal(countdownRemaining(running, 2_234), 58_766);
  assert.equal(countdownRemaining(running, 46_000), 15_000);
  assert.equal(ready.phase, 'ready');
  assert.equal(startCountdown(running, 50_000), running);
});

test('pause snapshots the remainder and resume excludes time spent paused', () => {
  const running = startCountdown(createCountdown(1), 1_000);
  const paused = pauseCountdown(running, 11_000);
  assert.equal(paused.remainingMs, 50_000);
  assert.equal(paused.deadline, null);
  assert.equal(countdownRemaining(paused, 99_000), 50_000);
  const resumed = startCountdown(paused, 99_000);
  assert.equal(resumed.deadline, 149_000);
  assert.equal(countdownRemaining(resumed, 100_000), 49_000);
});

test('restart from paused or complete begins running from the original full duration', () => {
  const running = startCountdown(createCountdown(25), 1_000);
  const paused = pauseCountdown(running, 40_000);
  const restarted = restartCountdown(paused, 80_000);
  assert.equal(restarted.phase, 'running');
  assert.equal(countdownRemaining(restarted, 80_000), 1_500_000);
  const complete = settleCountdown(running, 9_000_000);
  assert.equal(restartCountdown(complete, 10_000_000).deadline, 11_500_000);
});

test('returning after the deadline completes exactly at zero and never goes negative', () => {
  const running = startCountdown(createCountdown(1), 1_000);
  const complete = settleCountdown(running, 90_000);
  assert.equal(complete.phase, 'complete');
  assert.equal(complete.remainingMs, 0);
  assert.equal(complete.deadline, null);
  assert.equal(formatCountdown(countdownRemaining(complete, 200_000)), '[00:00:00:000]');
  assert.equal(settleCountdown(complete, 200_000), complete);
  assert.equal(pauseCountdown(running, 90_000).phase, 'complete');
  assert.equal(startCountdown(complete, 200_000), complete);
});

test('a backward wall-clock adjustment cannot extend remaining time beyond its running segment', () => {
  const running = startCountdown(createCountdown(1), 1_000);
  assert.equal(countdownRemaining(running, -10_000), 60_000);
});

test('actual downward movement needs an unexpired input intent; restored positions alone do not start', () => {
  assert.equal(confirmsDownwardScroll(null, 1000, 100), false);
  const intent = { scrollY: 300, expiresAt: 600 };
  assert.equal(confirmsDownwardScroll(intent, 360, 500), true);
  assert.equal(confirmsDownwardScroll(intent, 360, 601), false);
  assert.equal(confirmsDownwardScroll(intent, 300, 500), false);
  assert.equal(confirmsDownwardScroll(intent, 200, 500), false);
});

test('scrollbar presses require document-root edge hits and actual vertical overflow', () => {
  const base = { x: 995, y: 300, viewportWidth: 1000, viewportHeight: 800, contentWidth: 985, leftGutter: 0, rootTarget: true, verticalOverflow: true };
  assert.equal(isDocumentScrollbarPress(base), true);
  assert.equal(isDocumentScrollbarPress({ ...base, x: 700 }), false);
  assert.equal(isDocumentScrollbarPress({ ...base, rootTarget: false }), false);
  assert.equal(isDocumentScrollbarPress({ ...base, verticalOverflow: false }), false);
  assert.equal(isDocumentScrollbarPress({ ...base, y: 805 }), false);
  assert.equal(isDocumentScrollbarPress({ ...base, contentWidth: 1000 }), true);
  assert.equal(isDocumentScrollbarPress({ ...base, contentWidth: 1000, x: 980 }), false);
  assert.equal(isDocumentScrollbarPress({ ...base, x: 5, leftGutter: 15 }), true);
});

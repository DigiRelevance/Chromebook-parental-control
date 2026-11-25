// @chpc/core — device-side usage bookkeeping: day roll-over, batching, offline policy.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  rollUsageDay, usageBatch, settleUsage, resetDailyUsage, offlinePolicy, cleanUsageState, USAGE_LIMITS,
} from '../src/usage.js';
import { decide } from '../src/policy.js';

const TZ = 'Europe/London';
const NOON = Date.parse('2026-06-10T11:00:00Z');

test('rollUsageDay keeps today, moves an earlier day to carry, and prunes old carry', () => {
  const same = rollUsageDay({ pending: { 'a.com': 120 }, pendingDay: '2026-06-10', carry: {} }, '2026-06-10');
  assert.deepEqual(same, { pending: { 'a.com': 120 }, pendingDay: '2026-06-10', carry: {} });

  const input = { pending: { 'a.com': 120, 'b.com': 60 }, pendingDay: '2026-06-09', carry: { '2026-06-09': { 'a.com': 60 }, '2026-05-01': { 'old.com': 600 } } };
  const next = rollUsageDay(input, '2026-06-10', '2026-05-10');
  assert.deepEqual(next.pending, {}, 'yesterday no longer counts against today');
  assert.equal(next.pendingDay, '2026-06-10');
  assert.deepEqual(next.carry, { '2026-06-09': { 'a.com': 180, 'b.com': 60 } }, 'merged into its day; too-old day dropped');
  assert.deepEqual(input.pending, { 'a.com': 120, 'b.com': 60 }, 'input not mutated');
  assert.deepEqual(Object.keys(input.carry).sort(), ['2026-05-01', '2026-06-09']);

  // Storage written by an earlier version has no pendingDay: it is treated as today.
  assert.deepEqual(rollUsageDay({ pending: { 'a.com': 60 } }, '2026-06-10'),
    { pending: { 'a.com': 60 }, pendingDay: '2026-06-10', carry: {} });
  // Nothing metered yesterday: no empty carry day is created.
  assert.deepEqual(rollUsageDay({ pending: {}, pendingDay: '2026-06-09' }, '2026-06-10').carry, {});
  // An unusable "today" changes nothing.
  assert.equal(rollUsageDay({ pending: { 'a.com': 60 }, pendingDay: '2026-06-09' }, 'tomorrow').pendingDay, '2026-06-09');
});

test('rollUsageDay: a clock that moved backwards counts that usage today, never loses it', () => {
  const next = rollUsageDay({ pending: { 'a.com': 60 }, pendingDay: '2026-06-12', carry: { '2026-06-11': { 'b.com': 120 }, '2026-06-08': { 'c.com': 30 } } }, '2026-06-10');
  assert.deepEqual(next.pending, { 'a.com': 60, 'b.com': 120 });
  assert.deepEqual(next.carry, { '2026-06-08': { 'c.com': 30 } });
});

test('cleanUsageState drops junk and caps a host at the daily maximum', () => {
  const s = cleanUsageState({
    pending: { 'A.com': 60, 'a.com': 30, '': 99, bad: -5, nan: 'x', huge: 10 ** 9, ['__proto__']: 60 },
    pendingDay: 'not-a-day',
    carry: { '2026-06-09': { 'a.com': 60 }, junk: { 'a.com': 60 }, '2026-06-08': { '': 5 }, '2026-06-07': null },
  });
  assert.deepEqual(s.pending, { 'a.com': 90, huge: USAGE_LIMITS.hostSecondsPerDay });
  assert.equal(s.pendingDay, null);
  assert.deepEqual(s.carry, { '2026-06-09': { 'a.com': 60 } });
  for (const junk of [null, undefined, 'x', 7, []]) {
    assert.deepEqual(cleanUsageState(junk), { pending: {}, pendingDay: null, carry: {} });
  }
  assert.equal({}.polluted, undefined);
});

test('usageBatch reports earlier days first with their day, in chunks of at most an hour', () => {
  const state = { pending: { 'z.com': 90, 'a.com': 60 }, pendingDay: '2026-06-10', carry: { '2026-06-09': { 'y.com': 7500 }, '2026-06-08': { 'x.com': 60 } } };
  assert.deepEqual(usageBatch(state), [
    { site: 'x.com', seconds: 60, day: '2026-06-08' },
    { site: 'y.com', seconds: 3600, day: '2026-06-09' },
    { site: 'y.com', seconds: 3600, day: '2026-06-09' },
    { site: 'y.com', seconds: 300, day: '2026-06-09' },
    { site: 'a.com', seconds: 60 },
    { site: 'z.com', seconds: 90 },
  ]);
  assert.deepEqual(usageBatch({}), []);
  const many = {};
  for (let i = 0; i < 150; i++) many[`s${String(i).padStart(3, '0')}.com`] = 60;
  assert.equal(usageBatch({ pending: many }).length, USAGE_LIMITS.batchEntries);
});

test('settleUsage removes exactly what was accepted and leaves the rest', () => {
  const state = { pending: { 'a.com': 60, 'z.com': 90 }, pendingDay: '2026-06-10', carry: { '2026-06-09': { 'y.com': 7500 }, '2026-06-08': { 'x.com': 60 } } };
  const sent = usageBatch(state).slice(0, 3); // x.com and two hours of y.com
  const left = settleUsage(state, sent);
  assert.deepEqual(left, { pending: { 'a.com': 60, 'z.com': 90 }, pendingDay: '2026-06-10', carry: { '2026-06-09': { 'y.com': 300 } } });
  assert.deepEqual(state.carry['2026-06-09'], { 'y.com': 7500 }, 'input not mutated');
  // Draining in rounds reaches empty.
  let s = state;
  for (let i = 0; i < 5; i++) s = settleUsage(s, usageBatch(s));
  assert.deepEqual(s, { pending: {}, pendingDay: '2026-06-10', carry: {} });
  // Unknown sites, unknown days and junk entries are ignored.
  assert.deepEqual(settleUsage(state, [null, 'x', { site: 'nope.com', seconds: 60 }, { site: 'x.com', seconds: 60, day: '2020-01-01' }, { seconds: 5 }]),
    cleanUsageState(state));
  assert.deepEqual(settleUsage(state, null), cleanUsageState(state));
});

test('resetDailyUsage zeroes the counters without touching the rules', () => {
  const policy = { dailyMinutes: 60, usageToday: 55, deny: ['x.com'], siteBudgets: [{ pattern: 'youtube.com', minutes: 30, used: 30 }, null] };
  const out = resetDailyUsage(policy);
  assert.deepEqual(out, { dailyMinutes: 60, usageToday: 0, deny: ['x.com'], siteBudgets: [{ pattern: 'youtube.com', minutes: 30, used: 0 }, null] });
  assert.equal(policy.usageToday, 55, 'input not mutated');
  assert.equal(policy.siteBudgets[0].used, 30);
  assert.equal(resetDailyUsage(null), null);
  assert.deepEqual(resetDailyUsage({ a: 1 }), { a: 1, usageToday: 0 });
});

test('offlinePolicy: limits used up yesterday start afresh at midnight with no console in reach', () => {
  const cached = { dailyMinutes: 60, usageToday: 60, siteBudgets: [{ pattern: 'games.example', minutes: 30, used: 30 }] };
  const opts = { now: NOON, tz: TZ };

  // Same day as the last sync: still used up.
  const sameDay = offlinePolicy(cached, {}, { policyDay: '2026-06-10', today: '2026-06-10' });
  assert.equal(decide(sameDay, 'https://games.example', opts).code, 'daily-budget');

  // The next day: both budgets are available again...
  const nextDay = offlinePolicy(cached, {}, { policyDay: '2026-06-09', today: '2026-06-10' });
  assert.equal(nextDay.usageToday, 0);
  assert.equal(nextDay.siteBudgets[0].used, 0);
  assert.equal(decide(nextDay, 'https://games.example', opts).allowed, true);

  // ...and today's own unsent minutes count against them.
  const used = offlinePolicy(cached, { 'games.example': 30 * 60, 'other.com': 600 }, { policyDay: '2026-06-09', today: '2026-06-10' });
  assert.equal(used.usageToday, 40);
  assert.equal(decide(used, 'https://games.example', opts).code, 'site-budget');
  assert.equal(decide(used, 'https://other.com', opts).allowed, true);
  assert.equal(cached.usageToday, 60, 'input not mutated');
});

test('offlinePolicy never resets on an unknown day or a clock that went backwards', () => {
  const cached = { dailyMinutes: 60, usageToday: 60 };
  for (const o of [{}, { policyDay: null, today: '2026-06-10' }, { policyDay: '2026-06-10', today: null },
    { policyDay: '2026-06-10', today: '2026-06-09' }, { policyDay: 'junk', today: '2026-06-10' }, undefined]) {
    assert.equal(offlinePolicy(cached, { 'a.com': 60 }, o).usageToday, 61, JSON.stringify(o));
  }
  assert.equal(offlinePolicy(null, { 'a.com': 60 }, { policyDay: '2026-06-09', today: '2026-06-10' }), null);
});

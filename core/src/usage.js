/**
 * @chpc/core — device-side usage bookkeeping.
 *
 * The extension meters seconds per hostname and holds them until the console
 * accepts them. A Chromebook can be away from its console for days (school,
 * holidays), so the unsent seconds are kept per local day:
 *
 *   state = {
 *     pending:    { host: seconds },                  // the day in pendingDay
 *     pendingDay: "YYYY-MM-DD" | null,
 *     carry:      { "YYYY-MM-DD": { host: seconds } }, // earlier days, unsent
 *   }
 *
 * Only `pending` counts against today's budgets. `carry` is reported with its
 * day so the console files it under the day it happened, and is dropped once
 * it is older than the console would accept.
 *
 * Pure functions: no clock, no I/O. Callers pass dates as "YYYY-MM-DD" strings
 * in the family time zone (see localClock). Inputs are never mutated.
 */
import { applyPendingUsage } from './policy.js';

export const USAGE_LIMITS = {
  hostSecondsPerDay: 6 * 3600, // one host cannot accumulate more than this in a day
  entrySeconds: 3600,          // the server caps one report at an hour
  batchEntries: 100,           // the server reads at most this many entries per request
  carryDays: 31,               // the server refuses days older than this
};

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const isDay = (d) => typeof d === 'string' && DAY_RE.test(d);

/** Copy `{host: seconds}` keeping only positive finite seconds for non-empty hosts. */
function cleanHosts(src) {
  const out = {};
  if (!src || typeof src !== 'object') return out;
  for (const [host, sec] of Object.entries(src)) {
    const n = Number(sec);
    const h = String(host).toLowerCase();
    if (!h || h === '__proto__' || !Number.isFinite(n) || n <= 0) continue;
    out[h] = Math.min(USAGE_LIMITS.hostSecondsPerDay, (out[h] || 0) + n);
  }
  return out;
}

function mergeHosts(into, from) {
  const out = { ...into };
  for (const [h, sec] of Object.entries(from)) {
    out[h] = Math.min(USAGE_LIMITS.hostSecondsPerDay, (out[h] || 0) + sec);
  }
  return out;
}

/** Normalise whatever is in storage into a well-formed state. */
export function cleanUsageState(state) {
  const s = state && typeof state === 'object' ? state : {};
  const carry = {};
  if (s.carry && typeof s.carry === 'object') {
    for (const [day, hosts] of Object.entries(s.carry)) {
      if (!isDay(day)) continue;
      const c = cleanHosts(hosts);
      if (Object.keys(c).length) carry[day] = c;
    }
  }
  return { pending: cleanHosts(s.pending), pendingDay: isDay(s.pendingDay) ? s.pendingDay : null, carry };
}

/**
 * Move the state to `today`. Seconds metered on an earlier day leave `pending`
 * (so they stop counting against today's budgets) and wait in `carry`.
 *
 * @param {object} state   see top of file
 * @param {string} today   "YYYY-MM-DD" now, in the family time zone
 * @param {string} [minDay] oldest day worth keeping; older carry is dropped
 */
export function rollUsageDay(state, today, minDay) {
  const s = cleanUsageState(state);
  if (!isDay(today)) return s;
  let { pending, pendingDay } = s;
  const carry = { ...s.carry };
  if (pendingDay && pendingDay !== today) {
    if (Object.keys(pending).length) carry[pendingDay] = mergeHosts(carry[pendingDay] || {}, pending);
    pending = {};
  }
  pendingDay = today;
  for (const day of Object.keys(carry)) {
    if (day >= today) {
      // The clock moved backwards: that usage is not in the past. Count it today.
      pending = mergeHosts(pending, carry[day]);
      delete carry[day];
    } else if (isDay(minDay) && day < minDay) {
      delete carry[day];
    }
  }
  return { pending, pendingDay, carry };
}

/**
 * The next batch to report: earlier days first (oldest first), then today.
 * Entries are `{site, seconds}` for today and `{site, seconds, day}` for
 * earlier days, each at most an hour, at most `batchEntries` of them.
 */
export function usageBatch(state) {
  const s = cleanUsageState(state);
  const out = [];
  const push = (hosts, day) => {
    for (const site of Object.keys(hosts).sort()) {
      let left = Math.round(hosts[site]);
      while (left > 0 && out.length < USAGE_LIMITS.batchEntries) {
        const seconds = Math.min(left, USAGE_LIMITS.entrySeconds);
        out.push(day ? { site, seconds, day } : { site, seconds });
        left -= seconds;
      }
    }
  };
  for (const day of Object.keys(s.carry).sort()) push(s.carry[day], day);
  push(s.pending, null);
  return out;
}

/** Remove a batch the server accepted from the state. */
export function settleUsage(state, entries) {
  const s = cleanUsageState(state);
  const pending = { ...s.pending };
  const carry = {};
  for (const [day, hosts] of Object.entries(s.carry)) carry[day] = { ...hosts };
  for (const e of Array.isArray(entries) ? entries : []) {
    if (!e || typeof e !== 'object') continue;
    const bucket = e.day ? carry[e.day] : pending;
    const site = String(e.site || '').toLowerCase();
    if (!bucket || !(site in bucket)) continue;
    bucket[site] -= Number(e.seconds) || 0;
    if (!(bucket[site] >= 0.5)) delete bucket[site];
  }
  for (const day of Object.keys(carry)) if (!Object.keys(carry[day]).length) delete carry[day];
  return { pending, pendingDay: s.pendingDay, carry };
}

/** A copy of `policy` with the day's usage counters at zero. */
export function resetDailyUsage(policy) {
  if (!policy || typeof policy !== 'object') return policy;
  const p = { ...policy, usageToday: 0 };
  if (Array.isArray(p.siteBudgets)) {
    p.siteBudgets = p.siteBudgets.map((sb) => (sb && typeof sb === 'object' ? { ...sb, used: 0 } : sb));
  }
  return p;
}

/**
 * The policy to enforce while the console cannot be reached.
 *
 * The cached policy carries the usage the console had counted on `policyDay`.
 * On that same day, today's unsent seconds are added to it. Once the local day
 * has moved on, those counters describe a day that is over: they are zeroed
 * and only today's unsent seconds count, so daily and per-site limits start
 * afresh at midnight with no console in reach.
 *
 * An unknown `policyDay`, or a clock that has gone backwards, never resets.
 */
export function offlinePolicy(policy, pending, opts = {}) {
  const { policyDay, today } = opts;
  const newDay = isDay(policyDay) && isDay(today) && today > policyDay;
  return applyPendingUsage(newDay ? resetDailyUsage(policy) : policy, pending);
}

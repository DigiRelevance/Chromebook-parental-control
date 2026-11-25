// @chpc/server — status layer.
// Joins stored policy + live usage into the exact shape decide() expects:
//   policy.usageToday            -> minutes used so far today
//   policy.siteBudgets[i].used   -> minutes used on that pattern today
// Storage holds SECONDS (db.js); the engine reads MINUTES. This file is the
// only unit-conversion boundary.

import { remainingDaily, ruleMatchesHost } from '@chpc/core';
import * as dbm from './db.js';

/** Offset of `tz` from UTC at instant `ms`, in ms (east of Greenwich is positive). */
function tzOffsetMs(ms, tz) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  const p = {};
  for (const { type, value } of fmt.formatToParts(new Date(ms))) p[type] = value;
  const localAsUTC = Date.parse(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`);
  return { offset: localAsUTC - Math.floor(ms / 1000) * 1000, date: `${p.year}-${p.month}-${p.day}` };
}

/**
 * Epoch-ms of local midnight for `tz` at time `now`.
 * Locale-free: builds parts with Intl, then Date.parse on an exact ISO string.
 * Local midnight is the wall-clock midnight minus the zone's offset; the
 * offset is re-read at the answer so a clock change during the day is honoured.
 */
export function dayStartMs(now, tz) {
  const { offset, date } = tzOffsetMs(now, tz);
  const wallMidnight = Date.parse(`${date}T00:00:00Z`);
  const guess = wallMidnight - offset;
  return wallMidnight - tzOffsetMs(guess, tz).offset;
}

/** How far back a device may file usage it metered while out of reach. */
export const BACKDATE_DAYS = 31;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

function localDate(ms, tz) {
  const p = {};
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  for (const { type, value } of fmt.formatToParts(new Date(ms))) p[type] = value;
  return `${p.year}-${p.month}-${p.day}`;
}

/**
 * Timestamp for a usage entry a device reports for local day `day`.
 *
 * A device that was away from the console holds its minutes and reports them
 * later with the day they were metered on. Only a completed day in the recent
 * past is honoured, filed at that day's local noon:
 *   - no day, a malformed day, today or a future day -> `now`
 *   - a day more than BACKDATE_DAYS ago              -> null (not recorded)
 * So a report can never land in the future, and never further back than the
 * window.
 */
export function usageStampMs(day, now, tz) {
  if (typeof day !== 'string' || !DAY_RE.test(day)) return now;
  const noonUtc = Date.parse(day + 'T12:00:00Z');
  if (!Number.isFinite(noonUtc)) return now;
  if (day >= localDate(now, tz)) return now;
  if (day < localDate(now - BACKDATE_DAYS * 86400000, tz)) return null;
  // Local noon of `day`: zones far from UTC put UTC noon on a neighbouring date.
  for (const shift of [0, -12, 12]) {
    const t = noonUtc + shift * 3600000;
    if (localDate(t, tz) === day) return Math.min(now, dayStartMs(t, tz) + 12 * 3600000);
  }
  return now;
}

/** Stored policy for a kid, with today's usage injected (minutes). */
export function effectivePolicyForKid(db, kidId, now, tz) {
  const stored = dbm.getPolicy(db, kidId) || {};
  const dayStart = dayStartMs(now, tz);
  const usedSecToday = dbm.kidUsageSinceMs(db, kidId, dayStart);
  const rows = dbm.usageRowsSince(db, kidId, dayStart);

  const secForPattern = (pattern) => {
    let s = 0;
    for (const r of rows) {
      if (r.site && ruleMatchesHost(pattern, r.site)) s += Number(r.seconds) || 0;
    }
    return s;
  };

  // Surface engine defaults in the effective policy so consumers (console UI,
  // extension) can rely on `internetAllowed` and `mode` always being present.
  const p = {
    internetAllowed: true,
    mode: 'unrestricted',
    ...stored,
    usageToday: Math.floor(usedSecToday / 60),
  };
  if (Array.isArray(p.siteBudgets)) {
    p.siteBudgets = p.siteBudgets.map((sb) =>
      sb && typeof sb === 'object' && sb.pattern != null
        ? { ...sb, used: Math.floor(secForPattern(sb.pattern) / 60) }
        : sb
    );
  }
  return p;
}

/** Summary numbers for one kid (all minutes; remainingDailyMin null = unbounded). */
export function kidStatus(db, kidId, now, tz) {
  const eff = effectivePolicyForKid(db, kidId, now, tz);
  return {
    internetAllowed: eff.internetAllowed !== false,
    dailyLimitMin: eff.dailyMinutes != null ? Number(eff.dailyMinutes) : null,
    usedTodayMin: eff.usageToday != null ? Math.floor(Number(eff.usageToday)) : 0,
    remainingDailyMin: remainingDaily(eff),
  };
}

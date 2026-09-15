import * as moment from 'moment-timezone';

/** Validate IANA timezone; invalid / empty values fall back to `fallback`. */
export function sanitizeTimeZone(
  candidate: string | null | undefined,
  fallback: string = 'UTC',
): string {
  const raw = (candidate || '').trim();
  if (!raw || !moment.tz.zone(raw)) {
    const fb = (fallback || '').trim();
    if (fb && moment.tz.zone(fb)) {
      return fb;
    }
    return 'UTC';
  }
  return raw;
}

/** Browser / runtime IANA timezone (`moment.tz.guess()`), fallback UTC. */
export function browserTimeZone(): string {
  return sanitizeTimeZone(moment.tz.guess(), 'UTC');
}

function parseMaybeJson(value: unknown): any {
  if (value == null) {
    return null;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (typeof value === 'object') {
    return value;
  }
  return null;
}

function tznameFromHoursBlob(hours: unknown): string | null {
  const oh = parseMaybeJson(hours);
  const tz = oh?.tzname;
  return typeof tz === 'string' && tz.trim() ? tz.trim() : null;
}

/**
 * Project IANA timezone from Operating Hours (`tzname`).
 * If the project has no saved tzname, fall back to the browser timezone
 * (same idea as History used to do with `moment.tz.guess()`).
 *
 * Looks at:
 * - project.operatingHours.tzname (General slot)
 * - project.timeSlots[*].hours.tzname (named slots)
 * - nested project.id_project (if a project_user object was passed)
 */
export function resolveProjectTimezone(project: any): string {
  const root = project?.id_project && typeof project.id_project === 'object'
    ? project.id_project
    : project;

  if (root) {
    const fromGeneral = tznameFromHoursBlob(root.operatingHours);
    if (fromGeneral && moment.tz.zone(fromGeneral)) {
      return fromGeneral;
    }

    const slots = root.timeSlots;
    if (slots && typeof slots === 'object') {
      for (const slot of Object.values(slots as Record<string, any>)) {
        const fromSlot = tznameFromHoursBlob(slot?.hours);
        if (fromSlot && moment.tz.zone(fromSlot)) {
          return fromSlot;
        }
      }
    }
  }

  return browserTimeZone();
}

/**
 * Half-open ISO range [from, to) for the last `days` calendar days in `timeZone`
 * (including today). `to` is start of tomorrow in that timezone.
 */
export function lastNDaysChartRange(
  days: number,
  timeZone: string,
  now: Date = new Date(),
): { from: string; to: string } {
  const tz = sanitizeTimeZone(timeZone, browserTimeZone());
  const to = moment.tz(now, tz).startOf('day').add(1, 'day');
  const from = to.clone().subtract(days, 'days');
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

/** Half-open ISO range for the `days` calendar days immediately before the current window. */
export function previousNDaysChartRange(
  days: number,
  timeZone: string,
  now: Date = new Date(),
): { from: string; to: string } {
  const tz = sanitizeTimeZone(timeZone, browserTimeZone());
  // Avoid moment() — namespace import is not callable under this project's typings.
  const currentTo = moment.tz(now, tz).startOf('day').add(1, 'day');
  const currentFrom = currentTo.clone().subtract(days, 'days');
  const from = currentFrom.clone().subtract(days, 'days');
  return {
    from: from.toISOString(),
    to: currentFrom.toISOString(),
  };
}

/** Local calendar day keys (YYYY-MM-DD) for the last `days` days in `timeZone`. */
export function buildLastNDayKeys(
  days: number,
  timeZone: string,
  now: Date = new Date(),
): string[] {
  const tz = sanitizeTimeZone(timeZone, browserTimeZone());
  const endExclusive = moment.tz(now, tz).startOf('day').add(1, 'day');
  const cursor = endExclusive.clone().subtract(days, 'days');
  const keys: string[] = [];
  while (cursor.isBefore(endExclusive)) {
    keys.push(cursor.format('YYYY-MM-DD'));
    cursor.add(1, 'day');
  }
  return keys;
}

/**
 * Map a timestamp / date-like value to YYYY-MM-DD in `timeZone`.
 * Bare calendar dates are kept as-is; ISO instants are converted.
 */
export function toDayKeyInTimeZone(value: unknown, timeZone: string): string {
  if (value == null || value === '') {
    return '';
  }
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }
  const tz = sanitizeTimeZone(timeZone, browserTimeZone());
  const asNum = Number(raw);
  let instant: moment.Moment | null = null;
  if (Number.isFinite(asNum) && asNum > 1e11) {
    instant = moment.tz(new Date(asNum), tz);
  } else if (Number.isFinite(asNum) && asNum > 1e9) {
    instant = moment.tz(new Date(asNum * 1000), tz);
  } else {
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }
    instant = moment.tz(parsed, tz);
  }
  return instant.format('YYYY-MM-DD');
}

import * as moment from 'moment-timezone';
import {
  browserTimeZone,
  buildLastNDayKeys,
  lastNDaysChartRange,
  previousNDaysChartRange,
  resolveProjectTimezone,
  toDayKeyInTimeZone,
} from './project-timezone.util';

describe('project-timezone.util', () => {
  describe('resolveProjectTimezone', () => {
    it('reads tzname from operatingHours object', () => {
      expect(resolveProjectTimezone({
        operatingHours: { tzname: 'Europe/Rome' },
      })).toBe('Europe/Rome');
    });

    it('parses operatingHours JSON string', () => {
      expect(resolveProjectTimezone({
        operatingHours: JSON.stringify({ tzname: 'America/New_York' }),
      })).toBe('America/New_York');
    });

    it('falls back to browser timezone when missing or invalid', () => {
      const browser = browserTimeZone();
      expect(resolveProjectTimezone(null)).toBe(browser);
      expect(resolveProjectTimezone({})).toBe(browser);
      expect(resolveProjectTimezone({ operatingHours: { tzname: 'Not/AZone' } })).toBe(browser);
    });

    it('reads tzname from timeSlots hours when general OH is missing', () => {
      expect(resolveProjectTimezone({
        timeSlots: {
          a: { hours: { tzname: 'Europe/Rome' } },
        },
      })).toBe('Europe/Rome');
    });

    it('reads tzname from nested id_project.operatingHours', () => {
      expect(resolveProjectTimezone({
        id_project: { operatingHours: JSON.stringify({ tzname: 'Europe/Berlin' }) },
      })).toBe('Europe/Berlin');
    });
  });

  describe('browserTimeZone', () => {
    it('returns moment.tz.guess when valid', () => {
      expect(browserTimeZone()).toBe(moment.tz.guess());
    });
  });

  describe('lastNDaysChartRange', () => {
    it('builds half-open last 10 local days in Europe/Rome', () => {
      // 2026-09-15 10:00 Rome (CEST, UTC+2)
      const now = new Date('2026-09-15T08:00:00.000Z');
      const range = lastNDaysChartRange(10, 'Europe/Rome', now);
      expect(range.from).toBe('2026-09-05T22:00:00.000Z'); // Sep 6 00:00 Rome
      expect(range.to).toBe('2026-09-15T22:00:00.000Z'); // Sep 16 00:00 Rome
    });

    it('builds UTC last 10 days when timezone is UTC', () => {
      const now = new Date('2026-09-15T08:00:00.000Z');
      const range = lastNDaysChartRange(10, 'UTC', now);
      expect(range.from).toBe('2026-09-06T00:00:00.000Z');
      expect(range.to).toBe('2026-09-16T00:00:00.000Z');
    });
  });

  describe('previousNDaysChartRange', () => {
    it('ends where the current window starts', () => {
      const now = new Date('2026-09-15T08:00:00.000Z');
      const current = lastNDaysChartRange(10, 'Europe/Rome', now);
      const previous = previousNDaysChartRange(10, 'Europe/Rome', now);
      expect(previous.to).toBe(current.from);
      expect(previous.from).toBe('2026-08-26T22:00:00.000Z'); // Aug 27 00:00 Rome
    });
  });

  describe('buildLastNDayKeys', () => {
    it('returns 10 local calendar days ending today in Europe/Rome', () => {
      const now = new Date('2026-09-15T08:00:00.000Z');
      expect(buildLastNDayKeys(10, 'Europe/Rome', now)).toEqual([
        '2026-09-06',
        '2026-09-07',
        '2026-09-08',
        '2026-09-09',
        '2026-09-10',
        '2026-09-11',
        '2026-09-12',
        '2026-09-13',
        '2026-09-14',
        '2026-09-15',
      ]);
    });
  });

  describe('toDayKeyInTimeZone', () => {
    it('keeps bare YYYY-MM-DD', () => {
      expect(toDayKeyInTimeZone('2026-09-15', 'Europe/Rome')).toBe('2026-09-15');
    });

    it('maps Rome midnight UTC instant to local calendar day', () => {
      // 2026-09-15 00:00 Rome = 2026-09-14T22:00:00.000Z
      expect(toDayKeyInTimeZone('2026-09-14T22:00:00.000Z', 'Europe/Rome')).toBe('2026-09-15');
      expect(toDayKeyInTimeZone('2026-09-14T22:00:00.000Z', 'UTC')).toBe('2026-09-14');
    });
  });
});

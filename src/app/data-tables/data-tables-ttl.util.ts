/**
 * TTL column values are durations in whole seconds (API `ttl` / cell number).
 * Never convert to milliseconds.
 */

export function isValidTtlSeconds(value: unknown): boolean {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!/^\d+$/.test(trimmed)) {
      return false;
    }
    const num = Number(trimmed);
    return Number.isInteger(num) && num > 0;
  }
  return false;
}

/** Parse UI/API value to seconds, or null if empty/invalid. */
export function parseTtlCellValue(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (!isValidTtlSeconds(value)) {
    return null;
  }
  return typeof value === 'number' ? value : Number(String(value).trim());
}

/** Normalize draft on blur: valid integer seconds, else null (cleared). */
export function finalizeTtlCellValue(value: unknown): number | null {
  return parseTtlCellValue(value);
}

export function formatTtlCellDisplay(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return String(value);
  }
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    const num = Number(value.trim());
    return num > 0 ? String(num) : '';
  }
  return '';
}
